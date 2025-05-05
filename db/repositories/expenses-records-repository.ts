import { db } from "../client"
import { expenses, farms } from "../schema"
import { eq, sql, and, gte, lte } from "drizzle-orm"

// Fetch all expenses records (optionally by period)
export async function getAllExpensesRecords({ startDate, endDate } = {}) {
  let query = db
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
    .leftJoin(farms, eq(expenses.farmId, farms.id))

  if (startDate && endDate) {
    query = query.where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
  }
  const results = await query
  // Map to ExpenseRecord type: id as string, date as ISO string, amount as number
  return results.map(e => ({
    id: e.id?.toString() ?? "",
    date: e.date instanceof Date ? e.date.toISOString() : (typeof e.date === "string" ? e.date : ""),
    farmId: e.farmId?.toString() ?? "",
    farmName: e.farmName ?? "",
    category: e.category ?? "",
    description: e.description ?? "",
    amount: Number(e.amount ?? 0),
    status: e.status ?? null,
    paymentMethod: e.paymentMethod ?? null,
    notes: e.notes ?? "",
  }))
}

// Aggregate expenses for summary (total, count, paid/pending/partial, etc.)
export async function getExpensesSummary({ startDate, endDate } = {}) {
  const all = await getAllExpensesRecords({ startDate, endDate })
  const totalExpenses = all.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const expensesCount = all.length
  const paidAmount = all.filter(e => e.status === "Paid").reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const pendingAmount = all.filter(e => e.status === "Pending").reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const partialAmount = all.filter(e => e.status === "Partial").reduce((sum, e) => sum + Number(e.amount || 0), 0)

  // Top categories by amount
  const byCategory: Record<string, number> = {}
  for (const e of all) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount || 0)
  }
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const topCategories = sorted.slice(0, 3).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0,
  }))

  // Dummy budget values for now
  const budgetTotal = 1000000
  const budgetRemaining = budgetTotal - totalExpenses
  const budgetUtilizationPercentage = budgetTotal ? (totalExpenses / budgetTotal) * 100 : 0
  const percentageBudget = budgetUtilizationPercentage

  return {
    totalExpenses,
    expensesCount,
    paidAmount,
    pendingAmount,
    partialAmount,
    budgetTotal,
    budgetRemaining,
    budgetUtilizationPercentage,
    percentageBudget,
    topCategories,
    comparisonWithPreviousPeriod: 0, // TODO: implement if needed
    expenseCount: expensesCount,
  }
}

// Aggregate expenses for chart (group by date)
export async function getExpensesChartData({ startDate, endDate } = {}) {
  const all = await getAllExpensesRecords({ startDate, endDate })
  const byCategory: Record<string, number> = {}
  for (const e of all) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount || 0)
  }
  const categories = Object.keys(byCategory)
  const values = categories.map(c => byCategory[c])
  return { categories, values }
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