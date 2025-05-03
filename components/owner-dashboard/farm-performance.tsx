"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllFarmsPerformance } from "@/app/actions/owner-dashboard-actions"
import type { FarmPerformance as FarmPerformanceType } from "@/lib/types/owner-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface FarmPerformanceProps {
  period?: "week" | "month" | "quarter" | "year"
}

export function FarmPerformance({ period = "month" }: FarmPerformanceProps) {
  const [loading, setLoading] = useState(true)
  const [farmPerformance, setFarmPerformance] = useState<FarmPerformanceType[]>([])
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

  // Get health status based on score
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" }
    if (score >= 60) return { label: "Good", color: "bg-emerald-500" }
    if (score >= 40) return { label: "Fair", color: "bg-yellow-500" }
    return { label: "Poor", color: "bg-red-500" }
  }

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
          <CardTitle>Farm Performance</CardTitle>
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
        <CardTitle>Farm Performance</CardTitle>
        <CardDescription>Health and productivity by farm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {farmPerformance.map((farm) => {
            const healthStatus = getHealthStatus(farm.healthScore)
            return (
              <div key={farm.farmId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{farm.farmName}</span>
                  <Badge variant="outline" className={`${healthStatus.color} text-white`}>
                    {healthStatus.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Health Score: {farm.healthScore}%</span>
                    <span>
                      Yield: {farm.yieldPercentage}% (
                      {farm.yieldPercentage >= farm.targetYield ? "On Target" : "Below Target"})
                    </span>
                  </div>
                  <Progress value={farm.healthScore} className="h-2" />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
