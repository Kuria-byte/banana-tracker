"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { MonthlyHealthSummary } from "@/lib/types/farm-health"
import { calculateMonthlyHealthSummary } from "@/app/actions/farm-health-actions"
import { getScoringParameterById } from "@/lib/mock-data/farm-health-scoring"

interface FarmHealthSummaryProps {
  farmId: string
}

export function FarmHealthSummary({ farmId }: FarmHealthSummaryProps) {
  const [summary, setSummary] = useState<MonthlyHealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSummary() {
      setLoading(true)
      try {
        // Get the current month and year
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1 // JavaScript months are 0-indexed

        const result = await calculateMonthlyHealthSummary(farmId, year, month)
        if (result.success) {
          setSummary(result.data)
        } else {
          setError(result.error || "Failed to load health summary")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [farmId])

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Average":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Poor":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Health Summary</CardTitle>
        <CardDescription>Average health scores for the current month</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading health summary...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : !summary ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No health data available for this month</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Health Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {Math.round(summary.averageScore * 10) / 10} / {summary.maxPossibleScore}
                  </p>
                  <Badge variant="outline" className={getHealthStatusColor(summary.healthStatus)}>
                    {summary.healthStatus}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on {summary.recordCount} assessments</p>
              </div>
              <div className="w-full sm:w-1/3">
                <p className="text-sm font-medium mb-1">{Math.round(summary.scorePercentage)}%</p>
                <Progress value={summary.scorePercentage} className={getProgressColor(summary.scorePercentage)} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Parameter Breakdown</h3>

              {summary.parameters.map((param) => {
                const parameter = getScoringParameterById(param.parameterId)
                if (!parameter) return null

                const percentage = (param.averageScore / param.maxPoints) * 100

                return (
                  <div key={param.parameterId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">{parameter.name}</p>
                      <p className="text-sm font-medium">
                        {Math.round(param.averageScore * 10) / 10} / {param.maxPoints}
                      </p>
                    </div>
                    <Progress value={percentage} className={getProgressColor(percentage)} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
