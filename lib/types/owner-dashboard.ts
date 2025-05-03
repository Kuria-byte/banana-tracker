// Owner Dashboard Types

// Sales Data Types
export interface SalesRecord {
  id: string
  farmId: string
  date: string // ISO date string
  product: string
  quantity: number
  unitPrice: number
  totalAmount: number
  buyerId: string
  buyerName: string
  paymentStatus: "Paid" | "Pending" | "Partial"
  paymentMethod?: "Cash" | "Bank Transfer" | "Mobile Money"
  notes?: string
}

export interface SalesSummary {
  totalRevenue: number
  salesCount: number
  averageSaleValue: number
  paidAmount: number
  pendingAmount: number
  comparisonWithPreviousPeriod: number // percentage
  topProducts: {
    product: string
    revenue: number
    percentage: number
  }[]
  previousRevenue: number
  topBuyers?: {
    name: string
    amount: number
    percentage: number
  }[]
  recentSales?: SalesRecord[]
}

// Expense Data Types
export interface ExpenseRecord {
  id: string
  farmId: string
  date: string // ISO date string
  category: string
  description: string
  amount: number
  paymentMethod: "Cash" | "Bank Transfer" | "Mobile Money"
  receiptUrl?: string
  approvedById?: string
  approvedByName?: string
  notes?: string
}

export interface ExpenseSummary {
  totalExpenses: number
  expenseCount: number
  budgetTotal: number
  budgetRemaining: number
  budgetUtilizationPercentage: number
  comparisonWithPreviousPeriod: number // percentage
  topCategories: {
    category: string
    name: string
    amount: number
    percentage: number
  }[]
  previousExpenses: number
  percentageBudget: number
  paymentMethods?: {
    method: string
    amount: number
    percentage: number
  }[]
  recentExpenses?: ExpenseRecord[]
}

// Farm Performance Types
export interface FarmPerformance {
  farmId: string
  farmName: string
  healthScore: number
  healthStatus: "Good" | "Average" | "Poor"
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  yieldPerAcre: number
  comparisonWithAverage: number // percentage
  yieldPercentage?: number
  targetYield?: number
}

// Dashboard Period Type
export type DashboardPeriod = "week" | "month" | "quarter" | "year" | "custom"

// Dashboard Filter Options
export interface DashboardFilters {
  period: DashboardPeriod
  startDate?: string
  endDate?: string
  farmIds?: string[]
  categories?: string[]
  products?: string[]
}

export interface SalesChartData {
  labels: string[]
  values: number[]
}

export interface ExpenseChartData {
  categories: string[]
  values: number[]
}

// Form Types
export interface SalesFormData {
  farmId: string
  date: string
  product: string
  quantity: number
  unitPrice: number
  buyerId: string
  paymentStatus: "Paid" | "Pending" | "Partial"
  paymentMethod?: "Cash" | "Bank Transfer" | "Mobile Money"
  notes?: string
}

export interface ExpenseFormData {
  farmId: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: "Cash" | "Bank Transfer" | "Mobile Money"
  receiptUrl?: string
  notes?: string
}

// Report Types
export interface ReportOptions {
  startDate: string
  endDate: string
  farmIds?: string[]
  reportType: "sales" | "expenses"
  format?: "pdf" | "csv"
}

export interface FinancialReport {
  title: string
  period: string
  summary: SalesSummary | ExpenseSummary
  chartData: SalesChartData | ExpenseChartData
  records: SalesRecord[] | ExpenseRecord[]
}
