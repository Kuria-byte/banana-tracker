"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, CheckCircle, HelpCircle, TrendingDown, TrendingUp } from "lucide-react"

interface FarmHealthStatusProps {
  healthCounts: {
    Good: number
    Average: number
    Poor: number
  }
  previousHealthData?: {
    Good: number
    Average: number
    Poor: number
  }
}

export function FarmHealthStatus({ healthCounts, previousHealthData }: FarmHealthStatusProps) {
  // Default previous data if not provided
  const prevData = previousHealthData || {
    Good: healthCounts.Good - 1,
    Average: healthCounts.Average,
    Poor: healthCounts.Poor + 1,
  }

  // Calculate totals
  const total = healthCounts.Good + healthCounts.Average + healthCounts.Poor
  const goodPercent = total > 0 ? Math.round((healthCounts.Good / total) * 100) : 0
  const averagePercent = total > 0 ? Math.round((healthCounts.Average / total) * 100) : 0
  const poorPercent = total > 0 ? Math.round((healthCounts.Poor / total) * 100) : 0

  // Calculate trends
  const goodTrend = (healthCounts.Good || 0) - (prevData.Good || 0)
  const averageTrend = (healthCounts.Average || 0) - (prevData.Average || 0)
  const poorTrend = (healthCounts.Poor || 0) - (prevData.Poor || 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Farm Health Status</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Farm health is determined by soil quality, plant condition, and pest presence. Good: Optimal
                  conditions. Average: Minor issues. Poor: Requires immediate attention.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
              <span className="font-medium">Good</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{goodPercent}%</span>
              <span className="text-sm text-muted-foreground">({healthCounts.Good || 0} farms)</span>
              {goodTrend > 0 && (
                <span className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {goodTrend}
                </span>
              )}
              {goodTrend < 0 && (
                <span className="flex items-center text-red-500">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {Math.abs(goodTrend)}
                </span>
              )}
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
              {averageTrend > 0 && (
                <span className="flex items-center text-yellow-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {averageTrend}
                </span>
              )}
              {averageTrend < 0 && (
                <span className="flex items-center text-green-500">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {Math.abs(averageTrend)}
                </span>
              )}
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
              {poorTrend > 0 && (
                <span className="flex items-center text-red-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {poorTrend}
                </span>
              )}
              {poorTrend < 0 && (
                <span className="flex items-center text-green-500">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {Math.abs(poorTrend)}
                </span>
              )}
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${poorPercent}%` }}></div>
          </div>
        </div>

        {healthCounts.Poor > 0 && (
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

        {healthCounts.Poor === 0 && healthCounts.Good > healthCounts.Average && (
          <div className="mt-6 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">All farms are in good condition</p>
              <p className="text-xs text-green-700 dark:text-green-400">
                Continue with regular maintenance for optimal yields
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
