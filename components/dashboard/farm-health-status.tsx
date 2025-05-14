"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, CheckCircle, HelpCircle, TrendingDown, TrendingUp } from "lucide-react"

interface FarmHealthStatusProps {
  healthStatuses: Array<{ farmId: number; healthStatus: string }>
}

export function FarmHealthStatus({ healthStatuses }: FarmHealthStatusProps) {
  // Compute counts
  const counts = { Good: 0, Average: 0, Poor: 0, NotAssessed: 0 }
  for (const h of healthStatuses) {
    if (h.healthStatus === "Good") counts.Good++
    else if (h.healthStatus === "Average") counts.Average++
    else if (h.healthStatus === "Poor") counts.Poor++
    else counts.NotAssessed++
  }
  const total = counts.Good + counts.Average + counts.Poor + counts.NotAssessed
  const goodPercent = total > 0 ? Math.round((counts.Good / total) * 100) : 0
  const averagePercent = total > 0 ? Math.round((counts.Average / total) * 100) : 0
  const poorPercent = total > 0 ? Math.round((counts.Poor / total) * 100) : 0

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
              <span className="text-sm text-muted-foreground">({counts.Good} farms)</span>
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
              <span className="text-sm text-muted-foreground">({counts.Average} farms)</span>
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
              <span className="text-sm text-muted-foreground">({counts.Poor} farms)</span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${poorPercent}%` }}></div>
          </div>
        </div>

        {counts.Poor > 0 && (
          <div className="mt-6 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {counts.Poor} {counts.Poor === 1 ? "farm requires" : "farms require"} attention
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">
                Immediate action recommended to prevent yield loss
              </p>
            </div>
          </div>
        )}

        {counts.Poor === 0 && counts.Good > counts.Average && (
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
