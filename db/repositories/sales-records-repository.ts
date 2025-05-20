import { db } from "../client"
import { sales, farms, buyers, plots, users } from "../schema"
import { eq, sql, and, gte, lte } from "drizzle-orm"

// Types for return value
export interface SalesRecordFull {
  id: number
  date: Date
  farmId: number
  farmName: string | null
  plotId?: number | null
  plotName?: string | null
  userId?: number | null
  userName?: string | null
  product: string
  quantity: number
  unitPrice: number
  totalAmount: number
  buyerId: string
  buyerName: string | null
  paymentStatus: string
  paymentMethod?: string | null
  notes?: string | null
}

// Define filter type for queries
export interface SalesRecordFilters {
  startDate?: string | Date
  endDate?: string | Date
  farmId?: number
  plotId?: number
  userId?: number
  buyerId?: string
  id?: number
}

// Fetch all sales records with joins and filters
export async function getAllSalesRecords(filters: SalesRecordFilters = {}): Promise<SalesRecordFull[]> {
  // Log all filter values and types for debugging
  console.log('SalesRecordFilters:', {
    buyerId: filters.buyerId, buyerIdType: typeof filters.buyerId,
    farmId: filters.farmId, farmIdType: typeof filters.farmId,
    plotId: filters.plotId, plotIdType: typeof filters.plotId,
    userId: filters.userId, userIdType: typeof filters.userId,
    id: filters.id, idType: typeof filters.id,
  })
  let query = db
    .select({
      id: sales.id,
      date: sales.date,
      farmId: sales.farmId,
      farmName: farms.name,
      plotId: sales.plotId,
      plotName: plots.name,
      userId: sales.userId,
      userName: users.name,
      product: sales.product,
      quantity: sales.quantity,
      unitPrice: sales.unitPrice,
      totalAmount: sales.totalAmount,
      buyerId: sales.buyerId,
      buyerName: buyers.name,
      paymentStatus: sales.paymentStatus,
      paymentMethod: sales.paymentMethod,
      notes: sales.notes,
    })
    .from(sales)
    .leftJoin(farms, eq(sales.farmId, farms.id))
    .leftJoin(plots, eq(sales.plotId, plots.id))
    .leftJoin(users, eq(sales.userId, users.id))
    .leftJoin(buyers, eq(sales.buyerId, buyers.id))

  const filterConds = []
  const startDate = filters.startDate ? (typeof filters.startDate === "string" ? new Date(filters.startDate) : filters.startDate) : undefined
  const endDate = filters.endDate ? (typeof filters.endDate === "string" ? new Date(filters.endDate) : filters.endDate) : undefined
  if (startDate && endDate) filterConds.push(and(gte(sales.date, startDate), lte(sales.date, endDate)))
  if (filters.farmId) filterConds.push(eq(sales.farmId, Number(filters.farmId)))
  if (filters.plotId) filterConds.push(eq(sales.plotId, Number(filters.plotId)))
  if (filters.userId) filterConds.push(eq(sales.userId, Number(filters.userId)))
  if (filters.buyerId) filterConds.push(eq(sales.buyerId, Number(filters.buyerId)))
  if (filters.id) filterConds.push(eq(sales.id, Number(filters.id)))

  // Use a local variable for the filtered query
  const filteredQuery = filterConds.length > 0 ? query.where(and(...filterConds)) : query

  const results = await filteredQuery
  // Defensive: always return an array
  return Array.isArray(results) ? results.map(r => ({
    ...r,
    unitPrice: Number(r.unitPrice),
    totalAmount: Number(r.totalAmount),
  })) : []
}

// Aggregate sales for summary (total revenue, count, paid/pending/partial, etc.)
export async function getSalesSummary(args?: { startDate?: string | Date, endDate?: string | Date }) {
  const { startDate, endDate } = args || {}
  const all = Array.isArray(await getAllSalesRecords({ startDate, endDate })) ? await getAllSalesRecords({ startDate, endDate }) : []
  const totalRevenue = all.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const salesCount = all.length
  const paidAmount = all.filter(s => s.paymentStatus === "Paid").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const pendingAmount = all.filter(s => s.paymentStatus === "Pending").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)
  const partialAmount = all.filter(s => s.paymentStatus === "Partial").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0)

  // Top products by revenue
  const byProduct = {} as Record<string, number>
  for (const s of all) {
    if (!s || !s.product) continue
    byProduct[s.product] = (byProduct[s.product] || 0) + Number(s.totalAmount || 0)
  }
  const sorted = Object.entries(byProduct)
  const topProducts = sorted.slice(0, 3).map(([product, revenue]) => ({
    product,
    revenue,
    percentage: totalRevenue ? (revenue / totalRevenue) * 100 : 0,
  }))

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
export async function getSalesChartData(args?: { startDate?: string | Date, endDate?: string | Date }) {
  const { startDate, endDate } = args || {}
  const all = Array.isArray(await getAllSalesRecords({ startDate, endDate })) ? await getAllSalesRecords({ startDate, endDate }) : []
  const byDate: Record<string, number> = {}
  for (const s of all) {
    if (!s || !s.date) continue
    const date = s.date instanceof Date ? s.date.toISOString().slice(0, 10) : String(s.date).slice(0, 10)
    byDate[date] = (byDate[date] || 0) + Number(s.totalAmount || 0)
  }
  const labels = Object.keys(byDate).sort()
  const values = labels.map(l => byDate[l])
  return { labels, values }
}

// Top products by revenue
export async function getTopProducts(args?: { startDate?: string | Date, endDate?: string | Date }) {
  const { startDate, endDate } = args || {}
  const all = Array.isArray(await getAllSalesRecords({ startDate, endDate })) ? await getAllSalesRecords({ startDate, endDate }) : []
  const byProduct: Record<string, number> = {}
  for (const s of all) {
    if (!s || !s.product) continue
    byProduct[s.product] = (byProduct[s.product] || 0) + Number(s.totalAmount || 0)
  }
  const sorted = Object.entries(byProduct)
  return sorted.map(([product, revenue]) => ({ product, revenue }))
}

// Create a new sales record
export async function createSalesRecord(data: Omit<SalesRecordFull, "id" | "farmName" | "plotName" | "userName" | "buyerName">): Promise<SalesRecordFull> {
  // Map plotId/userId to plot_id/user_id for DB
  const insertData: any = {
    ...data,
    unitPrice: data.unitPrice.toString(),
    totalAmount: data.totalAmount.toString(),
  }
  if ("plotId" in insertData) {
    insertData.plotId = insertData.plotId
    delete insertData.plotId
  }
  if ("userId" in insertData) {
    insertData.userId = insertData.userId
    delete insertData.userId
  }
  const [inserted] = await db.insert(sales).values(insertData).returning()
  const [full] = await getAllSalesRecords({ id: inserted.id })
  return full
}

// Update a sales record
export async function updateSalesRecord(id: number, data: Partial<Omit<SalesRecordFull, "id" | "farmName" | "plotName" | "userName" | "buyerName">>): Promise<SalesRecordFull | null> {
  // Map plotId/userId to plot_id/user_id for DB
  const updateData: any = { ...data }
  if (updateData.unitPrice !== undefined) updateData.unitPrice = String(updateData.unitPrice)
  if (updateData.totalAmount !== undefined) updateData.totalAmount = String(updateData.totalAmount)
  if ("plotId" in updateData) {
    updateData.plotId = updateData.plotId
    delete updateData.plotId
  }
  if ("userId" in updateData) {
    updateData.userId = updateData.userId
    delete updateData.userId
  }
  await db.update(sales).set(updateData).where(eq(sales.id, id))
  const [full] = await getAllSalesRecords({ id })
  return full || null
}

// Delete a sales record
export async function deleteSalesRecord(id: number): Promise<boolean> {
  const result = await db.delete(sales).where(eq(sales.id, id))
  return result.rowCount > 0
} 