"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSalesSummary, getExpenseSummary } from "@/app/actions/owner-dashboard-actions"
import type { SalesSummary, ExpenseSummary, DashboardPeriod } from "@/lib/types/owner-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProfitMarginProps {
  period?: DashboardPeriod
}

export function ProfitMargin({ period = "month" }: ProfitMarginProps) {
  const [loading, setLoading] = useState(true)
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [salesResult, expenseResult] = await Promise.all([getSalesSummary(period), getExpenseSummary(period)])

        if (salesResult.success && salesResult.data) {
          setSalesSummary(salesResult.data)
        } else {
          setError(salesResult.error || "Failed to fetch sales data")
        }

        if (expenseResult.success && expenseResult.data) {
          setExpenseSummary(expenseResult.data)
        } else if (!error) {
          setError(expenseResult.error || "Failed to fetch expense data")
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

  if (error || !salesSummary || !expenseSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Margin</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error || "No data available"}</p>
        </CardContent>
      </Card>
    )
  }

  const profit = (salesSummary?.totalRevenue ?? 0) - (expenseSummary?.totalExpenses ?? 0)
  const profitMargin = (salesSummary?.totalRevenue ?? 0) > 0 ? (profit / (salesSummary?.totalRevenue ?? 1)) * 100 : 0
  const previousProfitMargin =
    (salesSummary?.previousRevenue ?? 0) > 0
      ? (((salesSummary?.previousRevenue ?? 0) - (expenseSummary?.previousExpenses ?? 0)) / (salesSummary?.previousRevenue ?? 1)) * 100
      : 0
  const marginChange = profitMargin - previousProfitMargin

  // Determine color based on profit margin
  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "bg-green-500"
    if (margin >= 20) return "bg-emerald-500"
    if (margin >= 10) return "bg-yellow-500"
    return "bg-red-500"
  }

  const marginColor = getMarginColor(profitMargin)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin</CardTitle>
        <CardDescription>
          {period === "week"
            ? "Last 7 days"
            : period === "month"
              ? "Last 30 days"
              : period === "quarter"
                ? "Last 3 months"
                : "Last 12 months"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <div className="flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {profit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${profitMargin >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Margin Performance</span>
              <div className="flex items-center">
                {marginChange >= 0 ? (
                  <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={`${marginChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(marginChange).toFixed(1)}% vs previous period
                </span>
              </div>
            </div>
            <Progress value={profitMargin} className={`h-2 ${marginColor}`} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Revenue</p>
              <p className="font-medium">
                ${salesSummary.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="font-medium">
                ${expenseSummary.totalExpenses.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
