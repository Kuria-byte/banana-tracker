"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getAllFarmsPerformance } from "@/app/actions/owner-dashboard-actions"
import type { FarmPerformance } from "@/lib/types/owner-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface FarmHealthSummaryProps {
  period?: "week" | "month" | "quarter" | "year"
}

export function FarmHealthSummary({ period = "month" }: FarmHealthSummaryProps) {
  const [loading, setLoading] = useState(true)
  const [farmPerformance, setFarmPerformance] = useState<FarmPerformance[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getAllFarmsPerformance(period)
        if (result.success && result.data) {
          setFarmPerformance(result.data)
          setError(null)
        } else {
          setError(result.error || "Failed to fetch farm performance data")
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

  // Calculate average health score
  const averageHealthScore =
    farmPerformance.length > 0
      ? Math.round(farmPerformance.reduce((sum, farm) => sum + farm.healthScore, 0) / farmPerformance.length)
      : 0

  // Get health status based on score
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" }
    if (score >= 60) return { label: "Good", color: "bg-emerald-500" }
    if (score >= 40) return { label: "Fair", color: "bg-yellow-500" }
    return { label: "Poor", color: "bg-red-500" }
  }

  const healthStatus = getHealthStatus(averageHealthScore)

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farm Health Summary</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farm Health Summary</CardTitle>
        <CardDescription>Overall health status of all farms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Health Score</span>
            <Badge variant="outline" className={`${healthStatus.color} text-white`}>
              {healthStatus.label}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Score: {averageHealthScore}%</span>
            </div>
            <Progress value={averageHealthScore} className="h-2" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Contributing Factors</h4>
            <ul className="space-y-1 text-sm">
              {farmPerformance
                .slice(0, 3)
                .sort((a, b) => b.healthScore - a.healthScore)
                .map((farm) => (
                  <li key={farm.farmId} className="flex items-center justify-between">
                    <span>{farm.farmName}</span>
                    <span className="font-medium">{farm.healthScore}%</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
