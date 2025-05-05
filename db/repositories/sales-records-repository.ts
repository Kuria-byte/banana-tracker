import { db } from "../client"
import { sales, farms, buyers } from "../schema"
import { eq, sql, and, gte, lte } from "drizzle-orm"

// Fetch all sales records (optionally by period)
export async function getAllSalesRecords({ startDate, endDate } = {}) {
  let query = db
    .select({
      id: sales.id,
      date: sales.date,
      farmId: sales.farmId,
      farmName: farms.name,
      product: sales.product,
      quantity: sales.quantity,
      unitPrice: sales.unitPrice,
      totalAmount: sales.totalAmount,
      buyerId: sales.buyerId,
      buyerName: sales.buyerName,
      paymentStatus: sales.paymentStatus,
      paymentMethod: sales.paymentMethod,
      notes: sales.notes,
    })
    .from(sales)
    .leftJoin(farms, eq(sales.farmId, farms.id))

  if (startDate && endDate) {
    query = query.where(and(gte(sales.date, startDate), lte(sales.date, endDate)))
  }
  return await query
}

// Aggregate sales for summary (total revenue, count, paid/pending/partial, etc.)
export async function getSalesSummary({ startDate, endDate } = {}) {
  const all = await getAllSalesRecords({ startDate, endDate })
  const totalRevenue = all.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const salesCount = all.length
  const paidAmount = all.filter(s => s.paymentStatus === "Paid").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const pendingAmount = all.filter(s => s.paymentStatus === "Pending").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const partialAmount = all.filter(s => s.paymentStatus === "Partial").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)

  // Top products by revenue
  const byProduct = {} as Record<string, number>
  for (const s of all) {
    byProduct[s.product] = (byProduct[s.product] || 0) + Number(s.totalAmount || 0)
  }
  const sorted = Object.entries(byProduct).sort((a, b) => b[1] - a[1])
  const topProducts = sorted.slice(0, 3).map(([product, revenue]) => ({
    product,
    revenue,
    percentage: totalRevenue ? (revenue / totalRevenue) * 100 : 0,
  }))

  // Optionally, add comparisonWithPreviousPeriod and averageSaleValue for full UI compatibility
  return {
    totalRevenue,
    salesCount,
    paidAmount,
    pendingAmount,
    partialAmount,
    topProducts,
    comparisonWithPreviousPeriod: 0, // TODO: implement if needed
    averageSaleValue: salesCount ? totalRevenue / salesCount : 0,
  }
}

// Aggregate sales for chart (group by date)
export async function getSalesChartData({ startDate, endDate } = {}) {
  const all = await getAllSalesRecords({ startDate, endDate })
  const byDate: Record<string, number> = {}
  for (const s of all) {
    const date = s.date.toISOString().slice(0, 10)
    byDate[date] = (byDate[date] || 0) + Number(s.totalAmount || 0)
  }
  const labels = Object.keys(byDate).sort()
  const values = labels.map(l => byDate[l])
  return { labels, values }
}

// Top products by revenue
export async function getTopProducts({ startDate, endDate } = {}) {
  const all = await getAllSalesRecords({ startDate, endDate })
  const byProduct: Record<string, number> = {}
  for (const s of all) {
    byProduct[s.product] = (byProduct[s.product] || 0) + Number(s.totalAmount || 0)
  }
  const sorted = Object.entries(byProduct).sort((a, b) => b[1] - a[1])
  return sorted.map(([product, revenue]) => ({ product, revenue }))
} 