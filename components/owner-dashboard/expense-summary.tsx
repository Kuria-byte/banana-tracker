"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExpenseSummary, getExpenseChartData, getAllExpenseRecords, getBudgetSummary } from "@/app/actions/owner-dashboard-actions"
import type {
  ExpenseSummary as ExpenseSummaryType,
  DashboardPeriod,
  ExpenseChartData,
  ExpenseRecord,
} from "@/lib/types/owner-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDown, ArrowUp, BanknoteIcon, PercentIcon, PiggyBank } from "lucide-react"
import { PieChart } from "@/components/ui/pie-chart"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { ExpenseFormModal } from "@/components/modals/expense-form-modal"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

interface ExpenseSummaryProps {
  period?: DashboardPeriod
}

export function ExpenseSummary({ period = "month" }: ExpenseSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ExpenseSummaryType | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Just fetch the expense records directly
        const expensesResult = await getAllExpenseRecords(period);
        console.log("Raw expense records:", expensesResult);
        if (expensesResult?.success && Array.isArray(expensesResult.data)) {
          setRawData(expensesResult.data);
          const expenses = expensesResult.data;
          // Calculate totals
          const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
          // Status amounts
          const paidAmount = expenses
            .filter(e => e.status === "Paid")
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
          const pendingAmount = expenses
            .filter(e => e.status === "Pending")
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
          // Create category map
          const categoryMap = new Map();
          expenses.forEach(e => {
            if (e.category) {
              const cat = String(e.category);
              categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(e.amount || 0));
            }
          });
          // Get top categories
          const topCats = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, amount]) => ({
              name,
              category: name,
              amount,
              percentage: totalAmount ? (amount / totalAmount) * 100 : 0
            }));
          // Build summary manually
          const calculatedSummary = {
            totalExpenses: totalAmount,
            expenseCount: expenses.length,
            paidAmount,
            pendingAmount,
            partialAmount: 0, // Calculate if needed
            budgetTotal: 1000000,
            budgetRemaining: 1000000 - totalAmount,
            budgetUtilizationPercentage: (totalAmount / 1000000) * 100,
            percentageBudget: (totalAmount / 1000000) * 100,
            topCategories: topCats,
            recentExpenses: expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map(e => {
                const mapped: any = {
                  id: String(e.id),
                  farmId: String(e.farmId),
                  date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
                  category: e.category || 'Miscellaneous',
                  description: e.description || '',
                  amount: Number(e.amount || 0),
                  paymentMethod: (e.paymentMethod || 'Cash') as 'Cash' | 'Bank Transfer' | 'Mobile Money',
                  status: (e.status || 'Pending') as 'Paid' | 'Pending' | 'Partial',
                  notes: e.notes || '',
                };
                if ('plotId' in e && e.plotId !== undefined && e.plotId !== null) {
                  mapped.plotId = String(e.plotId);
                }
                if ('userId' in e && typeof e.userId === 'number') {
                  mapped.userId = e.userId;
                }
                return mapped;
              }),
            comparisonWithPreviousPeriod: 0,
            previousExpenses: 0,
          };
          console.log("Calculated summary:", calculatedSummary);
          setSummary(calculatedSummary);
        } else {
          setError("Failed to fetch expense data");
        }
      } catch (err) {
        console.error("Error in component:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

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
    );
  }

  // Use default data structure when no data is available
  const defaultSummary = {
    totalExpenses: 0,
    expenseCount: 0,
    budgetTotal: 1000000,
    budgetRemaining: 1000000,
    budgetUtilizationPercentage: 0,
    percentageBudget: 0,
    topCategories: [],
    recentExpenses: [],
  };
  const displayData = summary || defaultSummary;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalExpenses = 0,
    budgetTotal = 0,
    budgetRemaining = 0,
    budgetUtilizationPercentage = 0,
    percentageBudget = 0,
    topCategories = [],
  } = displayData;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-red-800 dark:text-red-400">Expense Summary</CardTitle>
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
          <ExpenseFormModal />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Recent Expenses
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                    <BanknoteIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <div className="mt-1 flex items-center text-xs">
                  {totalExpenses <= 0 ? (
                    <>
                      <ArrowDown className="mr-1 h-3 w-3 text-green-500" />
                      <span className="font-medium text-green-500">
                        {Math.abs(totalExpenses).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="mr-1 h-3 w-3 text-red-500" />
                      <span className="font-medium text-red-500">
                        {Math.abs(totalExpenses).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="ml-1 text-muted-foreground">vs previous period</span>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                    <PercentIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Budget Utilization</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{percentageBudget.toFixed(1)}%</p>
                <div className="mt-2">
                  <Progress
                    value={percentageBudget > 100 ? 100 : percentageBudget}
                    className={`h-2 ${percentageBudget > 90 ? "bg-red-200" : "bg-orange-200"}`}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Budget Remaining</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(budgetRemaining)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  From {formatCurrency(budgetTotal)} total budget
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="p-6 pt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Recent Transactions</h4>
              {Array.isArray(displayData.recentExpenses) && displayData.recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {displayData.recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                          <span>•</span>
                          <span>{expense.description}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(expense.amount)}</p>
                        <Badge variant="outline" className="mt-1">
                          {expense.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent expenses found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="p-6 pt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Top Expense Categories</h4>
              <div className="space-y-3">
                {Array.isArray(topCategories) && topCategories.length > 0 ? (
                  topCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={category.percentage} className="h-2" />
                      <span className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No categories found</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
