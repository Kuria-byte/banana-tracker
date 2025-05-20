"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSalesSummary, getSalesChartData, getAllSalesRecords } from "@/app/actions/owner-dashboard-actions"
import type { SalesSummary as SalesSummaryType, SalesChartData, SalesRecord, DashboardPeriod } from "@/lib/types/owner-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDown, ArrowUp, BarChart3, DollarSign, Users } from "lucide-react"
import { BarChart } from "@/components/ui/bar-chart"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { SalesFormModal } from "@/components/modals/sales-form-modal"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

interface SalesSummaryProps {
  period?: DashboardPeriod
}

export function SalesSummary({ period = "month" }: SalesSummaryProps) {
  const [loading, setLoading] = useState(true)
  const [salesSummary, setSalesSummary] = useState<SalesSummaryType | null>(null)
  const [chartData, setChartData] = useState<SalesChartData | null>(null)
  const [recentSales, setRecentSales] = useState<SalesRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [summaryResult, chartResult, salesResult] = await Promise.all([
          getSalesSummary(period),
          getSalesChartData(period),
          getAllSalesRecords(period),
        ])

        if (summaryResult.success && summaryResult.data) {
          setSalesSummary(summaryResult.data)
        } else {
          setError(summaryResult.error || "Failed to fetch sales summary")
        }

        if (chartResult.success && chartResult.data) {
          setChartData(chartResult.data)
        }

        if (salesResult.success && salesResult.data) {
          // Get the 5 most recent sales
          const sortedSales = [...salesResult.data]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)

          setRecentSales(sortedSales)
        }
      } catch (err) {
        setError("An error occurred while fetching data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !salesSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Summary</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error || "No data available"}</p>
        </CardContent>
      </Card>
    )
  }

  const formattedData = chartData && chartData.labels && chartData.values
    ? {
        labels: chartData.labels,
        datasets: [
          {
            label: "Sales",
            data: chartData.values,
            backgroundColor: "rgba(34, 197, 94, 0.5)",
            borderColor: "rgb(34, 197, 94)",
            borderWidth: 1,
          },
        ],
      }
    : null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-green-800 dark:text-green-400">Sales Summary</CardTitle>
            <CardDescription>
              {period === "week"
                ? "Last 7 days"
                : period === "month"
                  ? "Last 30 days"
                  : period === "quarter"
                    ? "Last 3 months"
                    : "Last 12 months"}
            </CardDescription>
          </div>
          <SalesFormModal />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Recent Sales
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1">
              Top Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(salesSummary.totalRevenue)}</p>
                <div className="mt-1 flex items-center text-xs">
                  {salesSummary.comparisonWithPreviousPeriod >= 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="font-medium text-green-500">
                        {Math.abs(salesSummary.comparisonWithPreviousPeriod).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                      <span className="font-medium text-red-500">
                        {Math.abs(salesSummary.comparisonWithPreviousPeriod).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="ml-1 text-muted-foreground">vs previous period</span>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Sales Count</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{salesSummary.salesCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Avg. {formatCurrency(salesSummary.averageSaleValue)} per sale
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Payment Status</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(salesSummary.paidAmount)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(salesSummary.pendingAmount)} pending
                </p>
              </div>
            </div>

            {formattedData && (
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-medium">Revenue Trend</h4>
                <div className="h-[200px] w-full">
                  <BarChart data={formattedData} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="p-6 pt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Recent Transactions</h4>
              {recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{sale.product}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(sale.date), "MMM d, yyyy")}</span>
                          <span>•</span>
                          <span>{sale.buyerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(sale.totalAmount)}</p>
                        <Badge
                          variant={
                            sale.paymentStatus === "Paid"
                              ? "success"
                              : sale.paymentStatus === "Partial"
                                ? "warning"
                                : "destructive"
                          }
                          className="mt-1"
                        >
                          {sale.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent sales found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="p-6 pt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Top Performing Products</h4>
              <div className="space-y-3">
                {salesSummary.topProducts.map((product, index) => (
                  <div key={product.product} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          index === 0
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
                            : index === 1
                              ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              : "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{product.product}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-muted-foreground">{product.percentage.toFixed(1)}% of sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
