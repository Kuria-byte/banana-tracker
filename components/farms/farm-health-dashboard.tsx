"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Farm } from "@/lib/mock-data"
import { calculateMonthlyHealthSummary } from "@/app/actions/farm-health-actions"
import type { MonthlyHealthSummary } from "@/lib/types/farm-health"
import { FarmHealthStatus } from "@/components/dashboard/farm-health-status"
import { FarmHealthChart } from "@/components/dashboard/farm-health-chart"

interface FarmHealthDashboardProps {
  farms: Farm[]
}

export function FarmHealthDashboard({ farms }: FarmHealthDashboardProps) {
  const [summaries, setSummaries] = useState<MonthlyHealthSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState("current")
  const [healthCounts, setHealthCounts] = useState({ Good: 0, Average: 0, Poor: 0 })

  useEffect(() => {
    async function loadSummaries() {
      setLoading(true)
      try {
        const now = new Date()
        let year = now.getFullYear()
        let month = now.getMonth() + 1 // JavaScript months are 0-indexed

        // Adjust year and month based on timeframe
        if (timeframe === "previous") {
          if (month === 1) {
            month = 12
            year--
          } else {
            month--
          }
        }

        // Fetch summaries for all farms
        const summaryPromises = farms.map((farm) => calculateMonthlyHealthSummary(farm.id, year, month))

        const results = await Promise.all(summaryPromises)
        const validSummaries = results.filter((result) => result.success && result.data !== undefined).map((result) => result.data as MonthlyHealthSummary)

        setSummaries(validSummaries)
        // Calculate healthCounts from validSummaries
        const counts = { Good: 0, Average: 0, Poor: 0 }
        validSummaries.forEach((summary) => {
          if (summary.healthStatus === "Good") counts.Good++
          else if (summary.healthStatus === "Average") counts.Average++
          else if (summary.healthStatus === "Poor") counts.Poor++
        })
        setHealthCounts(counts)
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadSummaries()
  }, [farms, timeframe])

  // Calculate percentages
  const total = summaries.length
  const goodPercent = Math.round(((healthCounts.Good || 0) / total) * 100) || 0
  const averagePercent = Math.round(((healthCounts.Average || 0) / total) * 100) || 0
  const poorPercent = Math.round(((healthCounts.Poor || 0) / total) * 100) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Health</span>
          <div className="flex items-center gap-2">
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="current">Current Month</TabsTrigger>
                <TabsTrigger value="previous">Previous Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Farm health is determined by scoring various parameters including watering, weeding, desuckering,
                    pest control, and more.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading health data...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No health data available for this period</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <span className="font-medium">Good</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{goodPercent}%</span>
                <span className="text-sm text-muted-foreground">({healthCounts.Good || 0} farms)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${goodPercent}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                <span className="font-medium">Average</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{averagePercent}%</span>
                <span className="text-sm text-muted-foreground">({healthCounts.Average || 0} farms)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${averagePercent}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                <span className="font-medium">Poor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{poorPercent}%</span>
                <span className="text-sm text-muted-foreground">({healthCounts.Poor || 0} farms)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${poorPercent}%` }}></div>
            </div>
          </div>
        )}

        {!loading && summaries.length > 0 && (
          <>
            {(healthCounts.Poor || 0) > 0 && (
              <div className="mt-6 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {healthCounts.Poor} {healthCounts.Poor === 1 ? "farm requires" : "farms require"} attention
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Immediate action recommended to prevent yield loss
                  </p>
                </div>
              </div>
            )}

            {(healthCounts.Poor || 0) === 0 && (healthCounts.Good || 0) > (healthCounts.Average || 0) && (
              <div className="mt-6 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    All farms are in good condition
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Continue with regular maintenance for optimal yields
                  </p>
                </div>
              </div>
            )}
          </>
        )}

      
      
      </CardContent>
    </Card>
  )
}
