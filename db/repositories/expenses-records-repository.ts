import { db } from "../client"
import { expenses, farms, plots, users } from "../schema"
import { eq, sql, and, gte, lte } from "drizzle-orm"

export interface ExpenseRecordFull {
  id: number
  date: Date
  farmId: number
  farmName: string | null
  plotId?: number | null
  plotName?: string | null
  userId?: number | null
  userName?: string | null
  category: string
  description: string
  amount: number
  status?: string | null
  paymentMethod?: string | null
  notes?: string | null
}

export interface ExpenseRecordFilters {
  startDate?: string | Date
  endDate?: string | Date
  farmId?: number
  plotId?: number
  userId?: number
  id?: number
}

// Fetch all expenses records (optionally by period)
export async function getAllExpensesRecords(filters: ExpenseRecordFilters = {}): Promise<ExpenseRecordFull[]> {
  try {
    console.log("Direct DB query for expenses with filters:", JSON.stringify(filters));
    // Use a simpler query with minimal joins
    const results = await db
      .select({
        id: expenses.id,
        date: expenses.date,
        farmId: expenses.farmId,
        farmName: farms.name,
        category: expenses.category,
        description: expenses.description,
        amount: expenses.amount,
        status: expenses.status,
        paymentMethod: expenses.paymentMethod,
        notes: expenses.notes,
      })
      .from(expenses)
      .leftJoin(farms, eq(expenses.farmId, farms.id));
    console.log("Raw DB results:", results.length);
    // Process to safe format
    return results.map(r => ({
      id: r.id,
      date: r.date || new Date(),
      farmId: r.farmId,
      farmName: r.farmName || "Unknown Farm",
      category: r.category || "Uncategorized",
      description: r.description || "",
      amount: Number(r.amount || 0),
      status: r.status || "Pending",
      paymentMethod: r.paymentMethod || "Cash",
      notes: r.notes || "",
      // Add null values for fields we're not fetching
      plotId: null,
      plotName: null,
      userId: null,
      userName: null,
      recordedBy: null,
    }));
  } catch (error) {
    console.error("Database error in getAllExpensesRecords:", error);
    return [];
  }
}

// Aggregate expenses for summary (total, count, paid/pending/partial, etc.)
export async function getExpensesSummary({ startDate, endDate } = {}) {
  console.log('Starting getExpensesSummary function');
  let allExpenses;
  try {
    allExpenses = await getAllExpensesRecords({ startDate, endDate });
    console.log('[Repo] Successfully fetched expense records:', allExpenses.length);
  } catch (fetchError) {
    console.error('[Repo] Error fetching expense records:', fetchError);
    allExpenses = [];
  }
  const safeAll = Array.isArray(allExpenses) ? allExpenses.filter(Boolean) : [];
  console.log('[Repo] Filtered valid expense records:', safeAll.length);
  let totalExpenses = 0;
  let paidAmount = 0;
  let pendingAmount = 0;
  let partialAmount = 0;
  const categoryMap = new Map();
  for (const expense of safeAll) {
    const amount = Number(expense?.amount || 0);
    totalExpenses += amount;
    if (expense?.status === 'Paid') {
      paidAmount += amount;
    } else if (expense?.status === 'Pending') {
      pendingAmount += amount;
    } else if (expense?.status === 'Partial') {
      partialAmount += amount;
    }
    if (expense?.category) {
      const category = String(expense.category);
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + amount);
    }
  }
  const topCategories = [];
  try {
    const categoryEntries = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    for (const [category, amount] of categoryEntries) {
      topCategories.push({
        category,
        name: category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      });
    }
    console.log('[Repo] Successfully processed top categories:', topCategories.length);
  } catch (categoryError) {
    console.error('[Repo] Error processing categories:', categoryError);
  }
  const budgetTotal = 1000000;
  const budgetRemaining = budgetTotal - totalExpenses;
  const budgetUtilizationPercentage = budgetTotal > 0 ? (totalExpenses / budgetTotal) * 100 : 0;
  const result = {
    totalExpenses,
    expenseCount: safeAll.length,
    expensesCount: safeAll.length,
    paidAmount,
    pendingAmount,
    partialAmount,
    budgetTotal,
    budgetRemaining,
    budgetUtilizationPercentage,
    percentageBudget: budgetUtilizationPercentage,
    topCategories,
    comparisonWithPreviousPeriod: 0,
    previousExpenses: 0,
  };
  console.log('[Repo] Final expense summary:', JSON.stringify(result));
  return result;
}

// Aggregate expenses for chart (group by date)
export async function getExpensesChartData({ startDate, endDate } = {}) {
  console.log('Starting getExpensesChartData function');
  try {
    const all = await getAllExpensesRecords({ startDate, endDate });
    const safeAll = Array.isArray(all) ? all.filter(Boolean) : [];
    const categoryMap = new Map();
    for (const expense of safeAll) {
      if (expense?.category) {
        const category = String(expense.category);
        const amount = Number(expense?.amount || 0);
        const currentAmount = categoryMap.get(category) || 0;
        categoryMap.set(category, currentAmount + amount);
      }
    }
    const categories = Array.from(categoryMap.keys());
    const values = categories.map(cat => categoryMap.get(cat) || 0);
    console.log('[Repo] Chart data processed successfully');
    return { categories, values };
  } catch (error) {
    console.error('[Repo] Error in getExpensesChartData:', error);
    return { categories: [], values: [] };
  }
}

// Top categories by amount
export async function getTopExpenseCategories({ startDate, endDate } = {}) {
  const all = await getAllExpensesRecords({ startDate, endDate })
  const byCategory: Record<string, number> = {}
  for (const e of all) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount || 0)
  }
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  return sorted.map(([category, amount]) => ({ category, amount }))
}

export async function createExpenseRecord(data: Omit<ExpenseRecordFull, "id" | "farmName" | "plotName" | "userName">): Promise<ExpenseRecordFull> {
  const insertData: any = { ...data }
  if ("plotId" in insertData) {
    insertData.plot_id = insertData.plotId
    delete insertData.plotId
  }
  if ("userId" in insertData) {
    insertData.user_id = insertData.userId
    delete insertData.userId
  }
  const [inserted] = await db.insert(expenses).values(insertData).returning()
  const [full] = await getAllExpensesRecords({ id: inserted.id })
  return full
}

export async function updateExpenseRecord(id: number, data: Partial<Omit<ExpenseRecordFull, "id" | "farmName" | "plotName" | "userName">>): Promise<ExpenseRecordFull | null> {
  const updateData: any = { ...data }
  if ("plotId" in updateData) {
    updateData.plot_id = updateData.plotId
    delete updateData.plotId
  }
  if ("userId" in updateData) {
    updateData.user_id = updateData.userId
    delete updateData.userId
  }
  await db.update(expenses).set(updateData).where(eq(expenses.id, id))
  const [full] = await getAllExpensesRecords({ id })
  return full || null
} 