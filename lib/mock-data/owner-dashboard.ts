import type {
  SalesRecord,
  ExpenseRecord,
  SalesSummary,
  ExpenseSummary,
  FarmPerformance,
  DashboardPeriod,
} from "@/lib/types/owner-dashboard"
import { farms } from "@/lib/mock-data"

// Mock Sales Data
export const mockSalesRecords: SalesRecord[] = [
  {
    id: "sale1",
    farmId: "farm1",
    date: "2023-05-10T09:30:00Z",
    product: "Banana - Grand Nain",
    quantity: 500,
    unitPrice: 0.35,
    totalAmount: 175,
    buyerId: "buyer1",
    buyerName: "Nairobi Fresh Market",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Regular weekly order",
  },
  {
    id: "sale2",
    farmId: "farm1",
    date: "2023-05-17T10:15:00Z",
    product: "Banana - Grand Nain",
    quantity: 450,
    unitPrice: 0.35,
    totalAmount: 157.5,
    buyerId: "buyer1",
    buyerName: "Nairobi Fresh Market",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "sale3",
    farmId: "farm2",
    date: "2023-05-12T08:45:00Z",
    product: "Banana - Williams",
    quantity: 300,
    unitPrice: 0.4,
    totalAmount: 120,
    buyerId: "buyer2",
    buyerName: "Mombasa Fruit Exporters",
    paymentStatus: "Paid",
    paymentMethod: "Mobile Money",
  },
  {
    id: "sale4",
    farmId: "farm3",
    date: "2023-05-20T14:20:00Z",
    product: "Banana - Cavendish",
    quantity: 600,
    unitPrice: 0.3,
    totalAmount: 180,
    buyerId: "buyer3",
    buyerName: "Kisumu Wholesale Market",
    paymentStatus: "Pending",
  },
  {
    id: "sale5",
    farmId: "farm1",
    date: "2023-05-24T11:00:00Z",
    product: "Banana - Grand Nain",
    quantity: 520,
    unitPrice: 0.35,
    totalAmount: 182,
    buyerId: "buyer1",
    buyerName: "Nairobi Fresh Market",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "sale6",
    farmId: "farm2",
    date: "2023-05-25T09:30:00Z",
    product: "Banana - Williams",
    quantity: 350,
    unitPrice: 0.4,
    totalAmount: 140,
    buyerId: "buyer2",
    buyerName: "Mombasa Fruit Exporters",
    paymentStatus: "Partial",
    paymentMethod: "Mobile Money",
    notes: "50% payment received, remainder due in 7 days",
  },
  {
    id: "sale7",
    farmId: "farm4",
    date: "2023-05-15T13:45:00Z",
    product: "Banana - Cavendish",
    quantity: 400,
    unitPrice: 0.32,
    totalAmount: 128,
    buyerId: "buyer4",
    buyerName: "Nakuru Supermarket Chain",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
  },
  {
    id: "sale8",
    farmId: "farm5",
    date: "2023-05-22T10:30:00Z",
    product: "Banana - Grand Nain",
    quantity: 300,
    unitPrice: 0.35,
    totalAmount: 105,
    buyerId: "buyer5",
    buyerName: "Eldoret Fruit Market",
    paymentStatus: "Paid",
    paymentMethod: "Mobile Money",
  },
  {
    id: "sale9",
    farmId: "farm3",
    date: "2023-05-28T15:00:00Z",
    product: "Banana - Cavendish",
    quantity: 550,
    unitPrice: 0.3,
    totalAmount: 165,
    buyerId: "buyer3",
    buyerName: "Kisumu Wholesale Market",
    paymentStatus: "Pending",
    notes: "Payment expected by June 5th",
  },
  {
    id: "sale10",
    farmId: "farm1",
    date: "2023-05-31T09:00:00Z",
    product: "Banana - Grand Nain",
    quantity: 480,
    unitPrice: 0.35,
    totalAmount: 168,
    buyerId: "buyer1",
    buyerName: "Nairobi Fresh Market",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
  },
]

// Mock Expense Data
export const mockExpenseRecords: ExpenseRecord[] = [
  {
    id: "exp1",
    farmId: "farm1",
    date: "2023-05-05T08:00:00Z",
    category: "Fertilizer",
    description: "NPK 17-17-17 fertilizer purchase",
    amount: 45.5,
    paymentMethod: "Cash",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp2",
    farmId: "farm1",
    date: "2023-05-08T09:30:00Z",
    category: "Labor",
    description: "Weekly wages for 5 farm workers",
    amount: 120.0,
    paymentMethod: "Mobile Money",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp3",
    farmId: "farm2",
    date: "2023-05-07T10:15:00Z",
    category: "Pesticide",
    description: "Neem oil solution for pest control",
    amount: 32.75,
    paymentMethod: "Cash",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp4",
    farmId: "farm3",
    date: "2023-05-12T14:00:00Z",
    category: "Equipment",
    description: "Replacement pruning shears",
    amount: 18.5,
    paymentMethod: "Cash",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp5",
    farmId: "farm1",
    date: "2023-05-15T08:30:00Z",
    category: "Labor",
    description: "Weekly wages for 5 farm workers",
    amount: 120.0,
    paymentMethod: "Mobile Money",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp6",
    farmId: "farm2",
    date: "2023-05-18T11:45:00Z",
    category: "Irrigation",
    description: "Repair of irrigation system",
    amount: 65.25,
    paymentMethod: "Bank Transfer",
    approvedById: "user1",
    approvedByName: "Joy",
    notes: "Emergency repair after pipe burst",
  },
  {
    id: "exp7",
    farmId: "farm4",
    date: "2023-05-20T09:00:00Z",
    category: "Fertilizer",
    description: "Organic compost purchase",
    amount: 38.0,
    paymentMethod: "Cash",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp8",
    farmId: "farm1",
    date: "2023-05-22T08:30:00Z",
    category: "Labor",
    description: "Weekly wages for 5 farm workers",
    amount: 120.0,
    paymentMethod: "Mobile Money",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp9",
    farmId: "farm5",
    date: "2023-05-25T13:15:00Z",
    category: "Transport",
    description: "Fuel for delivery truck",
    amount: 42.5,
    paymentMethod: "Mobile Money",
    approvedById: "user1",
    approvedByName: "Joy",
  },
  {
    id: "exp10",
    farmId: "farm1",
    date: "2023-05-29T08:30:00Z",
    category: "Labor",
    description: "Weekly wages for 5 farm workers",
    amount: 120.0,
    paymentMethod: "Mobile Money",
    approvedById: "user1",
    approvedByName: "Joy",
  },
]

// Helper functions for calculating summaries

// Calculate sales summary for a given period and farm IDs
export function calculateSalesSummary(
  period: DashboardPeriod,
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
): SalesSummary {
  // Filter sales records by date range and farm IDs
  const filteredSales = mockSalesRecords.filter((sale) => {
    const saleDate = new Date(sale.date)
    const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
    const end = endDate ? new Date(endDate) : new Date()

    const isInDateRange = saleDate >= start && saleDate <= end
    const isInFarmList = farmIds ? farmIds.includes(sale.farmId) : true

    return isInDateRange && isInFarmList
  })

  // Calculate total revenue
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  // Calculate paid and pending amounts
  const paidAmount = filteredSales
    .filter((sale) => sale.paymentStatus === "Paid")
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  const pendingAmount = filteredSales
    .filter((sale) => sale.paymentStatus === "Pending" || sale.paymentStatus === "Partial")
    .reduce((sum, sale) => sum + sale.totalAmount, 0)

  // Calculate average sale value
  const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0

  // Calculate top products
  const productMap = new Map<string, number>()
  filteredSales.forEach((sale) => {
    const currentTotal = productMap.get(sale.product) || 0
    productMap.set(sale.product, currentTotal + sale.totalAmount)
  })

  const topProducts = Array.from(productMap.entries())
    .map(([product, revenue]) => ({
      product,
      revenue,
      percentage: (revenue / totalRevenue) * 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Calculate comparison with previous period
  const previousPeriodStart = new Date(
    startDate
      ? new Date(startDate).getTime() - getPeriodInMilliseconds(period)
      : Date.now() - getPeriodInMilliseconds(period) * 2,
  )
  const previousPeriodEnd = new Date(
    startDate ? new Date(startDate).getTime() - 1 : Date.now() - getPeriodInMilliseconds(period),
  )

  const previousPeriodSales = mockSalesRecords.filter((sale) => {
    const saleDate = new Date(sale.date)
    const isInDateRange = saleDate >= previousPeriodStart && saleDate <= previousPeriodEnd
    const isInFarmList = farmIds ? farmIds.includes(sale.farmId) : true

    return isInDateRange && isInFarmList
  })

  const previousPeriodRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  const comparisonWithPreviousPeriod =
    previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0

  return {
    totalRevenue,
    salesCount: filteredSales.length,
    averageSaleValue,
    paidAmount,
    pendingAmount,
    comparisonWithPreviousPeriod,
    topProducts,
  }
}

// Calculate expense summary for a given period and farm IDs
export function calculateExpenseSummary(
  period: DashboardPeriod,
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
): ExpenseSummary {
  // Filter expense records by date range and farm IDs
  const filteredExpenses = mockExpenseRecords.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
    const end = endDate ? new Date(endDate) : new Date()

    const isInDateRange = expenseDate >= start && expenseDate <= end
    const isInFarmList = farmIds ? farmIds.includes(expense.farmId) : true

    return isInDateRange && isInFarmList
  })

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Mock budget data (in a real app, this would come from a budget table)
  const budgetTotal = 1000 // Example budget for the period
  const budgetRemaining = budgetTotal - totalExpenses
  const budgetUtilizationPercentage = (totalExpenses / budgetTotal) * 100

  // Calculate top categories
  const categoryMap = new Map<string, number>()
  filteredExpenses.forEach((expense) => {
    const currentTotal = categoryMap.get(expense.category) || 0
    categoryMap.set(expense.category, currentTotal + expense.amount)
  })

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      name: category, // Adding name property to match the expected type
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Calculate comparison with previous period
  const previousPeriodStart = new Date(
    startDate
      ? new Date(startDate).getTime() - getPeriodInMilliseconds(period)
      : Date.now() - getPeriodInMilliseconds(period) * 2,
  )
  const previousPeriodEnd = new Date(
    startDate ? new Date(startDate).getTime() - 1 : Date.now() - getPeriodInMilliseconds(period),
  )

  const previousPeriodExpenses = mockExpenseRecords.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const isInDateRange = expenseDate >= previousPeriodStart && expenseDate <= previousPeriodEnd
    const isInFarmList = farmIds ? farmIds.includes(expense.farmId) : true

    return isInDateRange && isInFarmList
  })

  const previousPeriodTotal = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const comparisonWithPreviousPeriod =
    previousPeriodTotal > 0 ? ((totalExpenses - previousPeriodTotal) / previousPeriodTotal) * 100 : 0

  return {
    totalExpenses,
    expenseCount: filteredExpenses.length,
    budgetTotal,
    budgetRemaining,
    budgetUtilizationPercentage,
    comparisonWithPreviousPeriod,
    topCategories,
    previousExpenses: previousPeriodTotal,
    percentageBudget: budgetUtilizationPercentage, // Add this line to fix the error
  }
}

// Calculate farm performance metrics
export function calculateFarmPerformance(farmId: string, period: DashboardPeriod): FarmPerformance {
  const farm = farms.find((f) => f.id === farmId)
  if (!farm) {
    throw new Error(`Farm with ID ${farmId} not found`)
  }

  // Calculate sales for the farm
  const startDate = new Date(Date.now() - getPeriodInMilliseconds(period)).toISOString()
  const endDate = new Date().toISOString()

  const farmSales = mockSalesRecords.filter(
    (sale) =>
      sale.farmId === farmId && new Date(sale.date) >= new Date(startDate) && new Date(sale.date) <= new Date(endDate),
  )

  const revenue = farmSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  // Calculate expenses for the farm
  const farmExpenses = mockExpenseRecords.filter(
    (expense) =>
      expense.farmId === farmId &&
      new Date(expense.date) >= new Date(startDate) &&
      new Date(expense.date) <= new Date(endDate),
  )

  const expenses = farmExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate profit and profit margin
  const profit = revenue - expenses
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

  // Mock yield per acre (in a real app, this would come from harvest records)
  const yieldPerAcre = 2500 + Math.random() * 500

  // Mock comparison with average (in a real app, this would be calculated from all farms)
  const comparisonWithAverage = Math.random() * 30 - 15 // Random value between -15% and +15%

  return {
    farmId,
    farmName: farm.name,
    healthScore: farm.healthStatus === "Good" ? 85 : farm.healthStatus === "Average" ? 65 : 40,
    healthStatus: farm.healthStatus,
    revenue,
    expenses,
    profit,
    profitMargin,
    yieldPerAcre,
    comparisonWithAverage,
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

// Get sales data for charts
export function getSalesChartData(period: DashboardPeriod, startDate?: string, endDate?: string, farmIds?: string[]) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
  const end = endDate ? new Date(endDate) : new Date()

  // Filter sales by date range and farm IDs
  const filteredSales = mockSalesRecords.filter((sale) => {
    const saleDate = new Date(sale.date)
    const isInDateRange = saleDate >= start && saleDate <= end
    const isInFarmList = farmIds ? farmIds.includes(sale.farmId) : true

    return isInDateRange && isInFarmList
  })

  // Group sales by date
  const salesByDate = new Map<string, number>()

  filteredSales.forEach((sale) => {
    const dateKey = formatDateKey(new Date(sale.date), period)
    const currentTotal = salesByDate.get(dateKey) || 0
    salesByDate.set(dateKey, currentTotal + sale.totalAmount)
  })

  // Generate all date keys in the range
  const allDateKeys = generateDateKeys(start, end, period)

  // Create chart data with all dates (filling in zeros for dates with no sales)
  const chartData = allDateKeys.map((dateKey) => ({
    date: dateKey,
    amount: salesByDate.get(dateKey) || 0,
  }))

  return chartData
}

// Get expense data for charts
export function getExpenseChartData(period: DashboardPeriod, startDate?: string, endDate?: string, farmIds?: string[]) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
  const end = endDate ? new Date(endDate) : new Date()

  // Filter expenses by date range and farm IDs
  const filteredExpenses = mockExpenseRecords.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const isInDateRange = expenseDate >= start && expenseDate <= end
    const isInFarmList = farmIds ? farmIds.includes(expense.farmId) : true

    return isInDateRange && isInFarmList
  })

  // Group expenses by date
  const expensesByDate = new Map<string, number>()

  filteredExpenses.forEach((expense) => {
    const dateKey = formatDateKey(new Date(expense.date), period)
    const currentTotal = expensesByDate.get(dateKey) || 0
    expensesByDate.set(dateKey, currentTotal + expense.amount)
  })

  // Generate all date keys in the range
  const allDateKeys = generateDateKeys(start, end, period)

  // Create chart data with all dates (filling in zeros for dates with no expenses)
  const chartData = allDateKeys.map((dateKey) => ({
    date: dateKey,
    amount: expensesByDate.get(dateKey) || 0,
  }))

  return chartData
}

// Helper function to format date key based on period
function formatDateKey(date: Date, period: DashboardPeriod): string {
  switch (period) {
    case "week":
      return date.toISOString().split("T")[0] // YYYY-MM-DD
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` // YYYY-MM-DD
    case "quarter":
      return `${date.getFullYear()}-${String(Math.floor(date.getMonth() / 3) + 1).padStart(2, "0")}` // YYYY-Q
    case "year":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` // YYYY-MM
    default:
      return date.toISOString().split("T")[0] // YYYY-MM-DD
  }
}

// Helper function to generate all date keys in a range
function generateDateKeys(start: Date, end: Date, period: DashboardPeriod): string[] {
  const keys: string[] = []
  const current = new Date(start)

  while (current <= end) {
    keys.push(formatDateKey(current, period))

    // Increment date based on period
    switch (period) {
      case "week":
        current.setDate(current.getDate() + 1) // Daily for week view
        break
      case "month":
        current.setDate(current.getDate() + 1) // Daily for month view
        break
      case "quarter":
        current.setMonth(current.getMonth() + 1) // Monthly for quarter view
        break
      case "year":
        current.setMonth(current.getMonth() + 1) // Monthly for year view
        break
      default:
        current.setDate(current.getDate() + 1)
    }
  }

  return keys
}

// Get farm performance data for all farms
export function getAllFarmsPerformance(period: DashboardPeriod): FarmPerformance[] {
  return farms.map((farm) => calculateFarmPerformance(farm.id, period))
}
