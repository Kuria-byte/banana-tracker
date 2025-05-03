import type {
  SalesRecord,
  ExpenseRecord,
  SalesSummary,
  ExpenseSummary,
  DashboardPeriod,
  SalesChartData,
  ExpenseChartData,
  ReportOptions,
  FarmPerformance,
} from "@/lib/types/owner-dashboard"

// Farm data
export const farms = [
  { id: "farm1", name: "Nyeri Highlands Farm" },
  { id: "farm2", name: "Meru Central Farm" },
  { id: "farm3", name: "Kisii Valley Farm" },
  { id: "farm4", name: "Kakamega Plantation" },
  { id: "farm5", name: "Machakos Banana Estate" },
]

// Kenyan buyers
const buyers = [
  { id: "buyer1", name: "Nairobi Fresh Produce Market" },
  { id: "buyer2", name: "Mombasa Export Company" },
  { id: "buyer3", name: "Nakumatt Supermarkets" },
  { id: "buyer4", name: "Tuskys Wholesalers" },
  { id: "buyer5", name: "Carrefour Kenya" },
  { id: "buyer6", name: "Eastmatt Supermarket" },
  { id: "buyer7", name: "Quickmart Stores" },
  { id: "buyer8", name: "Naivas Supermarket" },
]

// Kenyan banana varieties
const bananaVarieties = [
  { name: "Grand Nain", pricePerKg: 45 },
  { name: "Williams", pricePerKg: 50 },
  { name: "Cavendish", pricePerKg: 40 },
  { name: "Kampala", pricePerKg: 35 },
  { name: "Gros Michel", pricePerKg: 55 },
  { name: "Uganda Green", pricePerKg: 30 },
]

// Expense categories
const expenseCategories = [
  { name: "Fertilizer", description: "Chemical and organic fertilizers" },
  { name: "Labor", description: "Worker wages and contractor payments" },
  { name: "Pesticide", description: "Pest control chemicals and organic solutions" },
  { name: "Equipment", description: "Tools, machinery and farming implements" },
  { name: "Irrigation", description: "Water systems and maintenance" },
  { name: "Transport", description: "Fuel and vehicle maintenance" },
  { name: "Seeds", description: "Planting materials and seedlings" },
  { name: "Utilities", description: "Electricity and water bills" },
]

// Generate realistic dates within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate enhanced mock sales data
export function generateMockSales(count = 50): SalesRecord[] {
  const sales: SalesRecord[] = []
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3) // Last 3 months

  for (let i = 0; i < count; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)]
    const variety = bananaVarieties[Math.floor(Math.random() * bananaVarieties.length)]
    const farmId = `farm${Math.floor(Math.random() * 5) + 1}`
    const quantity = Math.floor(Math.random() * 500) + 100 // 100-600 kg
    const unitPrice = variety.pricePerKg
    const totalAmount = quantity * unitPrice
    const date = randomDate(startDate, endDate)

    const paymentStatuses = ["Paid", "Pending", "Partial"] as const
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]

    const paymentMethods = ["Cash", "Bank Transfer", "Mobile Money"] as const
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

    sales.push({
      id: `sale${i + 1}`,
      farmId,
      date: date.toISOString(),
      product: `Banana - ${variety.name}`,
      quantity,
      unitPrice,
      totalAmount,
      buyerId: buyer.id,
      buyerName: buyer.name,
      paymentStatus,
      paymentMethod,
      notes: Math.random() > 0.7 ? `Order #${Math.floor(Math.random() * 10000)}` : undefined,
    })
  }

  // Sort by date, newest first
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate enhanced mock expense data
export function generateMockExpenses(count = 50): ExpenseRecord[] {
  const expenses: ExpenseRecord[] = []
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3) // Last 3 months

  for (let i = 0; i < count; i++) {
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
    const farmId = `farm${Math.floor(Math.random() * 5) + 1}`
    const amount = Math.floor(Math.random() * 10000) + 1000 // 1000-11000 KES
    const date = randomDate(startDate, endDate)

    const paymentMethods = ["Cash", "Bank Transfer", "Mobile Money"] as const
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

    expenses.push({
      id: `exp${i + 1}`,
      farmId,
      date: date.toISOString(),
      category: category.name,
      description: `${category.name} - ${category.description}`,
      amount,
      paymentMethod,
      approvedById: "user1",
      approvedByName: "Joy",
      notes: Math.random() > 0.7 ? `Receipt #${Math.floor(Math.random() * 10000)}` : undefined,
    })
  }

  // Sort by date, newest first
  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Create mock data instances
export const mockSalesRecords = generateMockSales()
export const mockExpenseRecords = generateMockExpenses()

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

  const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  const comparisonWithPreviousPeriod =
    previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

  // Calculate sales by buyer
  const salesByBuyer = new Map<string, number>()
  filteredSales.forEach((sale) => {
    const currentTotal = salesByBuyer.get(sale.buyerName) || 0
    salesByBuyer.set(sale.buyerName, currentTotal + sale.totalAmount)
  })

  const topBuyers = Array.from(salesByBuyer.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / totalRevenue) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    totalRevenue,
    salesCount: filteredSales.length,
    averageSaleValue,
    paidAmount,
    pendingAmount,
    comparisonWithPreviousPeriod,
    topProducts,
    previousRevenue,
    topBuyers,
    recentSales: filteredSales.slice(0, 5),
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
  const budgetTotal = 500000 // Example budget for the period in KES
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
      name: category,
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

  const previousExpenses = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const comparisonWithPreviousPeriod =
    previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0

  // Calculate expenses by payment method
  const expensesByMethod = new Map<string, number>()
  filteredExpenses.forEach((expense) => {
    const method = expense.paymentMethod || "Unknown"
    const currentTotal = expensesByMethod.get(method) || 0
    expensesByMethod.set(method, currentTotal + expense.amount)
  })

  const paymentMethods = Array.from(expensesByMethod.entries())
    .map(([method, amount]) => ({
      method,
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    totalExpenses,
    expenseCount: filteredExpenses.length,
    budgetTotal,
    budgetRemaining,
    budgetUtilizationPercentage,
    comparisonWithPreviousPeriod,
    topCategories,
    previousExpenses,
    percentageBudget: budgetUtilizationPercentage,
    paymentMethods,
    recentExpenses: filteredExpenses.slice(0, 5),
  }
}

// Get sales data for charts
export function getSalesChartData(
  period: DashboardPeriod,
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
): SalesChartData {
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
  const labels = allDateKeys
  const values = allDateKeys.map((dateKey) => salesByDate.get(dateKey) || 0)

  return { labels, values }
}

// Get expense data for charts
export function getExpenseChartData(
  period: DashboardPeriod,
  startDate?: string,
  endDate?: string,
  farmIds?: string[],
): ExpenseChartData {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - getPeriodInMilliseconds(period))
  const end = endDate ? new Date(endDate) : new Date()

  // Filter expenses by date range and farm IDs
  const filteredExpenses = mockExpenseRecords.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const isInDateRange = expenseDate >= start && expenseDate <= end
    const isInFarmList = farmIds ? farmIds.includes(expense.farmId) : true

    return isInDateRange && isInFarmList
  })

  // Group expenses by category
  const expensesByCategory = new Map<string, number>()

  filteredExpenses.forEach((expense) => {
    const currentTotal = expensesByCategory.get(expense.category) || 0
    expensesByCategory.set(expense.category, currentTotal + expense.amount)
  })

  // Create chart data for categories
  const categories = Array.from(expensesByCategory.keys())
  const values = categories.map((category) => expensesByCategory.get(category) || 0)

  return { categories, values }
}

// Calculate farm performance data
export function calculateFarmPerformance(farmId: string, period: DashboardPeriod): FarmPerformance {
  // Get farm name
  const farm = farms.find((f) => f.id === farmId)
  const farmName = farm ? farm.name : "Unknown Farm"

  // Filter sales and expenses for this farm
  const farmSales = mockSalesRecords.filter((sale) => sale.farmId === farmId)
  const farmExpenses = mockExpenseRecords.filter((expense) => expense.farmId === farmId)

  // Calculate total revenue and expenses
  const totalRevenue = farmSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalExpenses = farmExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate profit
  const profit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  // Calculate yield (mock data - in a real app this would come from actual yield data)
  const yieldData = {
    actual: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 kg
    target: 10000, // 10000 kg target
  }

  const yieldPerformance = (yieldData.actual / yieldData.target) * 100

  // Calculate health score (mock data - in a real app this would come from farm health records)
  const healthScore = Math.floor(Math.random() * 30) + 70 // 70-100 score

  // Calculate efficiency score based on expenses per kg of yield
  const efficiencyScore = yieldData.actual > 0 ? 100 - Math.min(100, (totalExpenses / yieldData.actual) * 0.1) : 0

  // Calculate overall performance score
  const overallScore = (profitMargin + yieldPerformance + healthScore + efficiencyScore) / 4

  return {
    farmId,
    farmName,
    period,
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit,
    profitMargin,
    yieldData,
    yieldPerformance,
    healthScore,
    efficiencyScore,
    overallScore,
  }
}

// Get all farms performance data
export function getAllFarmsPerformance(period: DashboardPeriod): FarmPerformance[] {
  return farms.map((farm) => calculateFarmPerformance(farm.id, period))
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

// Generate a financial report based on options
export function generateFinancialReport(options: ReportOptions) {
  const { startDate, endDate, farmIds, reportType } = options

  if (reportType === "sales") {
    const salesSummary = calculateSalesSummary("custom", startDate, endDate, farmIds)
    const salesChartData = getSalesChartData("custom", startDate, endDate, farmIds)

    return {
      title: "Sales Report",
      period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      summary: salesSummary,
      chartData: salesChartData,
      records: mockSalesRecords.filter((sale) => {
        const saleDate = new Date(sale.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        const isInDateRange = saleDate >= start && saleDate <= end
        const isInFarmList = farmIds ? farmIds.includes(sale.farmId) : true
        return isInDateRange && isInFarmList
      }),
    }
  } else {
    const expenseSummary = calculateExpenseSummary("custom", startDate, endDate, farmIds)
    const expenseChartData = getExpenseChartData("custom", startDate, endDate, farmIds)

    return {
      title: "Expense Report",
      period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      summary: expenseSummary,
      chartData: expenseChartData,
      records: mockExpenseRecords.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        const isInDateRange = expenseDate >= start && expenseDate <= end
        const isInFarmList = farmIds ? farmIds.includes(expense.farmId) : true
        return isInDateRange && isInFarmList
      }),
    }
  }
}
