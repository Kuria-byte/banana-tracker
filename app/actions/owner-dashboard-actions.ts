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

// Get sales summary
export async function getSalesSummary(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  try {
    const summary = calculateSalesSummary(period, startDate, endDate, farmIds)

    return {
      success: true,
      data: summary,
    }
  } catch (error) {
    console.error("Error fetching sales summary:", error)
    return {
      success: false,
      error: "Failed to fetch sales summary",
    }
  }
}

// Get expense summary
export async function getExpenseSummary(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  try {
    const summary = calculateExpenseSummary(period, startDate, endDate, farmIds)

    return {
      success: true,
      data: summary,
    }
  } catch (error) {
    console.error("Error fetching expense summary:", error)
    return {
      success: false,
      error: "Failed to fetch expense summary",
    }
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
  try {
    const chartData = calculateSalesChartData(period, startDate, endDate, farmIds)

    return {
      success: true,
      data: chartData,
    }
  } catch (error) {
    console.error("Error fetching sales chart data:", error)
    return {
      success: false,
      error: "Failed to fetch sales chart data",
    }
  }
}

// Get expense chart data
export async function getExpenseChartData(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  try {
    const chartData = calculateExpenseChartData(period, startDate, endDate, farmIds)

    return {
      success: true,
      data: chartData,
    }
  } catch (error) {
    console.error("Error fetching expense chart data:", error)
    return {
      success: false,
      error: "Failed to fetch expense chart data",
    }
  }
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
  try {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
    const end = endDate ? new Date(endDate) : new Date()

    const filteredSales = mockSalesRecords.filter((sale) => {
      const saleDate = new Date(sale.date)
      const isInDateRange = saleDate >= start && saleDate <= end
      const isInFarmList = farmIds ? farmIds.includes(sale.farmId) : true

      return isInDateRange && isInFarmList
    })

    return {
      success: true,
      data: filteredSales,
    }
  } catch (error) {
    console.error("Error fetching sales records:", error)
    return {
      success: false,
      error: "Failed to fetch sales records",
    }
  }
}

// Get all expense records
export async function getAllExpenseRecords(
  period: DashboardPeriod = "month",
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
) {
  try {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
    const end = endDate ? new Date(endDate) : new Date()

    const filteredExpenses = mockExpenseRecords.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const isInDateRange = expenseDate >= start && expenseDate <= end
      const isInFarmList = farmIds ? farmIds.includes(expense.farmId) : true

      return isInDateRange && isInFarmList
    })

    return {
      success: true,
      data: filteredExpenses,
    }
  } catch (error) {
    console.error("Error fetching expense records:", error)
    return {
      success: false,
      error: "Failed to fetch expense records",
    }
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
