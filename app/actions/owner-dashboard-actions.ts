"use server"

import { revalidatePath } from "next/cache"
import type { DashboardPeriod, SalesFormData, ExpenseFormData, ReportOptions } from "@/lib/types/owner-dashboard"
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
import { getSalesSummary as dbGetSalesSummary, getSalesChartData as dbGetSalesChartData, getAllSalesRecords as repoGetAllSalesRecords } from "@/db/repositories/sales-records-repository"
import { getExpensesSummary as dbGetExpensesSummary, getExpensesChartData as dbGetExpensesChartData, getAllExpensesRecords as repoGetAllExpensesRecords } from "@/db/repositories/expenses-records-repository"

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
  return { success: true, data: await dbGetExpensesSummary({ startDate, endDate }) }
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
    // In a real app, this would save to a database
    // For now, we'll just simulate success

    // Calculate total amount
    const totalAmount = formData.quantity * formData.unitPrice

    const newSale = {
      id: `sale${Date.now()}`,
      ...formData,
      totalAmount,
      date: new Date(formData.date).toISOString(),
    }

    // In a real app: await db.sales.create(newSale)

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
    // In a real app, this would save to a database
    // For now, we'll just simulate success

    const newExpense = {
      id: `exp${Date.now()}`,
      ...formData,
      date: new Date(formData.date).toISOString(),
      approvedById: "user1",
      approvedByName: "Joy",
    }

    // In a real app: await db.expenses.create(newExpense)

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
) {
  return { success: true, data: await repoGetAllSalesRecords({ startDate, endDate }) }
}

// Get all expense records
export async function getAllExpenseRecords(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  return { success: true, data: await repoGetAllExpensesRecords({ startDate, endDate }) }
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
