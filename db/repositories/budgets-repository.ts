import { db } from "../client"
import { budgets, farms } from "../schema"
import { eq, and, gte, lte } from "drizzle-orm"

// Fetch all budgets (optionally by farm, year, or category)
export async function getAllBudgets({ farmId, year, category } = {}) {
  let query = db
    .select({
      id: budgets.id,
      farmId: budgets.farmId,
      farmName: farms.name,
      year: budgets.year,
      category: budgets.category,
      amount: budgets.amount,
      notes: budgets.notes,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
    })
    .from(budgets)
    .leftJoin(farms, eq(budgets.farmId, farms.id))
  if (farmId) query = query.where(eq(budgets.farmId, farmId))
  if (year) query = query.where(eq(budgets.year, year))
  if (category) query = query.where(eq(budgets.category, category))
  return await query
}

// Aggregate budgets by farm/category/year
export async function getBudgetSummary({ farmId, year } = {}) {
  const all = await getAllBudgets({ farmId, year })
  const byCategory: Record<string, number> = {}
  for (const b of all) {
    const cat = b.category || "Uncategorized"
    byCategory[cat] = (byCategory[cat] || 0) + Number(b.amount || 0)
  }
  return byCategory
}

// Get budget utilization (actual vs. budgeted)
export async function getBudgetUtilization({ farmId, year, category } = {}) {
  // Get budgeted amount
  const budgets = await getAllBudgets({ farmId, year, category })
  const budgeted = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  // Get actual expenses (reuse getAllExpensesRecords from expenses repository)
  // You must import getAllExpensesRecords in your page/component to use this
  return { budgeted, actual: null } // Fill actual in your page by calling expenses repo
} 