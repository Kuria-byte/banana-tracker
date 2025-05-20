"use server"

import { revalidatePath } from "next/cache"
import type { DashboardPeriod, SalesFormData, ExpenseFormData, ReportOptions, BudgetFormData } from "@/lib/types/owner-dashboard"
import {
  calculateSalesSummary,
  calculateExpenseSummary,
  getSalesChartData as calculateSalesChartData,
  getExpenseChartData as calculateExpenseChartData,
  mockSalesRecords,
  mockExpenseRecords,
  generateFinancialReport,
  calculateFarmPerformance,
  getAllFarmsPerformance as calculateAllFarmsPerformance,
} from "@/lib/mock-data/owner-dashboard-enhanced"
import { getSalesSummary as dbGetSalesSummary, getSalesChartData as dbGetSalesChartData, getAllSalesRecords as repoGetAllSalesRecords, createSalesRecord, updateSalesRecord, deleteSalesRecord } from "@/db/repositories/sales-records-repository"
import { getExpensesSummary as dbGetExpensesSummary, getExpensesChartData as dbGetExpensesChartData, getAllExpensesRecords as repoGetAllExpensesRecords, createExpenseRecord, updateExpenseRecord } from "@/db/repositories/expenses-records-repository"
import { getAllBudgets, getBudgetSummary as dbGetBudgetSummary, createBudgetRecord, updateBudgetRecord } from "@/db/repositories/budgets-repository"

// Get sales summary
export async function getSalesSummary(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  // TODO: Map period to date range if needed
  return { success: true, data: await dbGetSalesSummary({ startDate, endDate }) }
}

// Get expense summary
export async function getExpenseSummary(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  try {
    // Fetch summary as before
    const summary = await dbGetExpensesSummary({ startDate, endDate });
    console.log("Expense summary from DB:", summary);

    // Fetch recent expenses (last 5 by date, for the same period)
    let recentExpenses: any[] = [];
    try {
      const allExpenses = await repoGetAllExpensesRecords({ startDate, endDate });
      console.log('[Action] All expenses for recent:', JSON.stringify(allExpenses, null, 2));
      if (Array.isArray(allExpenses)) {
        recentExpenses = [...allExpenses]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((e) => ({
            id: String(e.id),
            farmId: String(e.farmId),
            plotId: e.plotId ? String(e.plotId) : undefined,
            userId: e.userId ?? null,
            recordedBy: e.recordedBy ?? null,
            date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
            category: e.category || "Miscellaneous",
            description: e.description || "",
            amount: Number(e.amount || 0),
            paymentMethod: e.paymentMethod || "Cash",
            status: e.status || "Pending",
            notes: e.notes || "",
          }));
        console.log('[Action] Processed recent expenses:', JSON.stringify(recentExpenses, null, 2));
      }
    } catch (err) {
      console.error("Error fetching recent expenses for summary:", err);
    }

    // Always return a valid object with fallback values
    const result = {
      success: true,
      data: {
        totalExpenses: summary?.totalExpenses ?? 0,
        expenseCount: summary?.expenseCount ?? summary?.expensesCount ?? 0,
        expensesCount: summary?.expensesCount ?? summary?.expenseCount ?? 0,
        paidAmount: summary?.paidAmount ?? 0,
        pendingAmount: summary?.pendingAmount ?? 0,
        partialAmount: summary?.partialAmount ?? 0,
        budgetTotal: summary?.budgetTotal ?? 1000000,
        budgetRemaining: summary?.budgetRemaining ?? 997800,
        budgetUtilizationPercentage: summary?.budgetUtilizationPercentage ?? 0.2,
        percentageBudget: summary?.percentageBudget ?? 0.2,
        topCategories: Array.isArray(summary?.topCategories) ? summary.topCategories : [],
        comparisonWithPreviousPeriod: summary?.comparisonWithPreviousPeriod ?? 0,
        previousExpenses: summary?.previousExpenses ?? 0,
        recentExpenses,
      },
    };
    console.log('[Action] Final summary sent to UI:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error in getExpenseSummary:", error);
    // Return default data on error
    return {
      success: true,
      data: {
        totalExpenses: 0,
        expenseCount: 0,
        expensesCount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        partialAmount: 0,
        budgetTotal: 1000000,
        budgetRemaining: 1000000,
        budgetUtilizationPercentage: 0,
        percentageBudget: 0,
        topCategories: [],
        comparisonWithPreviousPeriod: 0,
        previousExpenses: 0,
        recentExpenses: [],
      },
    };
  }
}

// Get farm performance
export async function getFarmPerformance(farmId: string, period: DashboardPeriod = "month") {
  try {
    const performance = calculateFarmPerformance(farmId, period)

    return {
      success: true,
      data: performance,
    }
  } catch (error) {
    console.error("Error fetching farm performance:", error)
    return {
      success: false,
      error: "Failed to fetch farm performance",
    }
  }
}

// Get all farms performance
export async function getAllFarmsPerformance(period: DashboardPeriod = "month") {
  try {
    const performances = calculateAllFarmsPerformance(period)

    return {
      success: true,
      data: performances,
    }
  } catch (error) {
    console.error("Error fetching all farms performance:", error)
    return {
      success: false,
      error: "Failed to fetch all farms performance",
    }
  }
}

// Get sales chart data
export async function getSalesChartData(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  return { success: true, data: await dbGetSalesChartData({ startDate, endDate }) }
}

// Get expense chart data
export async function getExpenseChartData(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  return { success: true, data: await dbGetExpensesChartData({ startDate, endDate }) }
}

// Add new sale record
export async function addSaleRecord(formData: SalesFormData) {
  try {
    // Calculate total amount
    const totalAmount = formData.quantity * formData.unitPrice
    const saleData = {
      ...formData,
      totalAmount,
      plotId: formData.plotId ? Number(formData.plotId) : undefined,
      userId: formData.userId ? Number(formData.userId) : undefined,
    }
    const newSale = await createSalesRecord(saleData)
    revalidatePath("/owner-dashboard")
    return {
      success: true,
      data: newSale,
    }
  } catch (error) {
    console.error("Error adding sale record:", error)
    return {
      success: false,
      error: "Failed to add sale record",
    }
  }
}

// Add new expense record
export async function addExpenseRecord(formData: ExpenseFormData) {
  try {
    const expenseData = {
      ...formData,
      plotId: formData.plotId ? Number(formData.plotId) : undefined,
      userId: formData.userId ? Number(formData.userId) : undefined,
    }
    const newExpense = await createExpenseRecord(expenseData)
    revalidatePath("/owner-dashboard")
    return {
      success: true,
      data: newExpense,
    }
  } catch (error) {
    console.error("Error adding expense record:", error)
    return {
      success: false,
      error: "Failed to add expense record",
    }
  }
}

// Generate financial report
export async function generateReport(options: ReportOptions) {
  try {
    const report = generateFinancialReport(options)

    return {
      success: true,
      data: report,
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return {
      success: false,
      error: "Failed to generate report",
    }
  }
}

// Get all sales records
export async function getAllSalesRecords(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
  plotId?: string,
  userId?: string,
  buyerId?: string,
) {
  // Log all arguments for debugging
  console.log('getAllSalesRecords action args:', {
    startDate, endDate, farmIds, plotId, userId, buyerId
  })
  // Only support single plotId/userId/buyerId for now
  return {
    success: true,
    data: await repoGetAllSalesRecords({
      startDate,
      endDate,
      plotId: plotId ? Number(plotId) : undefined,
      userId: userId ? Number(userId) : undefined,
      buyerId: buyerId ? Number(buyerId) : undefined,
    }),
  }
}

// Get all expense records
export async function getAllExpenseRecords(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
  plotId?: string,
  userId?: string,
) {
  try {
    // Just directly return the array of expenses
    const expenses = await repoGetAllExpensesRecords({ startDate, endDate, plotId: plotId ? Number(plotId) : undefined, userId: userId ? Number(userId) : undefined });
    console.log("Expense records retrieved:", expenses.length);
    // Convert to safe format for client
    const safeExpenses = expenses.map(e => ({
      id: e.id,
      date: e.date,
      farmId: e.farmId,
      farmName: e.farmName || 'Unknown Farm',
      category: e.category || 'Uncategorized',
      description: e.description || '',
      amount: Number(e.amount || 0),
      status: e.status || 'Pending',
      paymentMethod: e.paymentMethod || 'Cash',
      notes: e.notes || ''
    }));
    return {
      success: true,
      data: safeExpenses
    };
  } catch (error) {
    console.error("Error in getAllExpenseRecords action:", error);
    return {
      success: false,
      error: "Failed to fetch expenses",
      data: []
    };
  }
}

// Helper function to get period in milliseconds
function getPeriodInMilliseconds(period: DashboardPeriod): number {
  switch (period) {
    case "week":
      return 7 * 24 * 60 * 60 * 1000
    case "month":
      return 30 * 24 * 60 * 60 * 1000
    case "quarter":
      return 90 * 24 * 60 * 60 * 1000
    case "year":
      return 365 * 24 * 60 * 60 * 1000
    default:
      return 30 * 24 * 60 * 60 * 1000
  }
}

// Get budget summary
export async function getBudgetSummary(
  period: DashboardPeriod = "month",
  year?: number,
  farmId?: string,
  plotId?: string,
  userId?: string,
  category?: string
) {
  // Only support single farmId/plotId/userId for now
  return {
    success: true,
    data: await dbGetBudgetSummary({
      year,
      farmId: farmId ? Number(farmId) : undefined,
      plotId: plotId ? Number(plotId) : undefined,
      userId: userId ? Number(userId) : undefined,
      category,
    }),
  }
}

// Add new budget record
export async function addBudgetRecord(formData: BudgetFormData) {
  try {
    const budgetData = {
      ...formData,
      plotId: formData.plotId ? Number(formData.plotId) : undefined,
      userId: formData.userId ? Number(formData.userId) : undefined,
    }
    const newBudget = await createBudgetRecord(budgetData)
    revalidatePath("/owner-dashboard")
    return {
      success: true,
      data: newBudget,
    }
  } catch (error) {
    console.error("Error adding budget record:", error)
    return {
      success: false,
      error: "Failed to add budget record",
    }
  }
}

// Update budget record
export async function updateBudgetRecordAction(id: string, data: Partial<BudgetFormData>) {
  try {
    const updateData = {
      ...data,
      plotId: data.plotId ? Number(data.plotId) : undefined,
      userId: data.userId ? Number(data.userId) : undefined,
    }
    const updated = await updateBudgetRecord(Number(id), updateData)
    revalidatePath("/owner-dashboard")
    return {
      success: true,
      data: updated,
    }
  } catch (error) {
    console.error("Error updating budget record:", error)
    return {
      success: false,
      error: "Failed to update budget record",
    }
  }
}

// Get all budget records
export async function getAllBudgetRecords(
  year?: number,
  farmId?: string,
  plotId?: string,
  userId?: string,
  category?: string
) {
  return {
    success: true,
    data: await getAllBudgets({
      year,
      farmId: farmId ? Number(farmId) : undefined,
      plotId: plotId ? Number(plotId) : undefined,
      userId: userId ? Number(userId) : undefined,
      category,
    }),
  }
}
