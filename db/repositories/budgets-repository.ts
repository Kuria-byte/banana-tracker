import { db } from "../client"
import { budgets, farms, plots, users } from "../schema"
import { eq, and, gte, lte } from "drizzle-orm"

// Types
export interface BudgetRecordFull {
  id: number
  farmId: number
  farmName: string | null
  plotId?: number | null
  plotName?: string | null
  userId?: number | null
  userName?: string | null
  year: number
  category?: string | null
  amount: number
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BudgetRecordFilters {
  farmId?: number
  plotId?: number
  userId?: number
  year?: number
  category?: string
  id?: number
}

// Fetch all budgets (optionally by farm, plot, user, year, or category)
export async function getAllBudgets(filters: BudgetRecordFilters = {}): Promise<BudgetRecordFull[]> {
  let query = db
    .select({
      id: budgets.id,
      farmId: budgets.farmId,
      farmName: farms.name,
      plotId: budgets.plot_id,
      plotName: plots.name,
      userId: budgets.user_id,
      userName: users.name,
      year: budgets.year,
      category: budgets.category,
      amount: budgets.amount,
      notes: budgets.notes,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
    })
    .from(budgets)
    .leftJoin(farms, eq(budgets.farmId, farms.id))
    .leftJoin(plots, eq(budgets.plot_id, plots.id))
    .leftJoin(users, eq(budgets.user_id, users.id))

  const filterConds = []
  if (filters.farmId) filterConds.push(eq(budgets.farmId, filters.farmId))
  if (filters.plotId) filterConds.push(eq(budgets.plot_id, filters.plotId))
  if (filters.userId) filterConds.push(eq(budgets.user_id, filters.userId))
  if (filters.year) filterConds.push(eq(budgets.year, filters.year))
  if (filters.category) filterConds.push(eq(budgets.category, filters.category))
  if (filters.id) filterConds.push(eq(budgets.id, filters.id))
  if (filterConds.length > 0) query = query.where(and(...filterConds))

  const results = await query
  return results.map(b => ({
    ...b,
    amount: Number(b.amount),
  }))
}

// Aggregate budgets by farm/category/year
export async function getBudgetSummary({ farmId, plotId, userId, year } = {}) {
  const all = await getAllBudgets({ farmId, plotId, userId, year })
  const byCategory: Record<string, number> = {}
  for (const b of all) {
    const cat = b.category || "Uncategorized"
    byCategory[cat] = (byCategory[cat] || 0) + Number(b.amount || 0)
  }
  return byCategory
}

// Get budget utilization (actual vs. budgeted)
export async function getBudgetUtilization({ farmId, plotId, userId, year, category } = {}) {
  // Get budgeted amount
  const budgets = await getAllBudgets({ farmId, plotId, userId, year, category })
  const budgeted = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  // Get actual expenses (reuse getAllExpensesRecords from expenses repository)
  // You must import getAllExpensesRecords in your page/component to use this
  return { budgeted, actual: null } // Fill actual in your page by calling expenses repo
}

// Create a new budget record
export async function createBudgetRecord(data: Omit<BudgetRecordFull, "id" | "farmName" | "plotName" | "userName">): Promise<BudgetRecordFull> {
  const insertData: any = { ...data }
  if ("plotId" in insertData) {
    insertData.plot_id = insertData.plotId
    delete insertData.plotId
  }
  if ("userId" in insertData) {
    insertData.user_id = insertData.userId
    delete insertData.userId
  }
  const [inserted] = await db.insert(budgets).values(insertData).returning()
  const [full] = await getAllBudgets({ id: inserted.id })
  return full
}

// Update a budget record
export async function updateBudgetRecord(id: number, data: Partial<Omit<BudgetRecordFull, "id" | "farmName" | "plotName" | "userName">>): Promise<BudgetRecordFull | null> {
  const updateData: any = { ...data }
  if ("plotId" in updateData) {
    updateData.plot_id = updateData.plotId
    delete updateData.plotId
  }
  if ("userId" in updateData) {
    updateData.user_id = updateData.userId
    delete updateData.userId
  }
  await db.update(budgets).set(updateData).where(eq(budgets.id, id))
  const [full] = await getAllBudgets({ id })
  return full || null
} 