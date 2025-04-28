"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { yieldForecasts } from "@/lib/mock-data"
import { CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HarvestForecastProps {
  title?: string
}

export function HarvestForecast({ title = "Harvest Forecast" }: HarvestForecastProps) {
  // Get the upcoming forecasts
  const upcomingForecasts = [...yieldForecasts]
    .sort((a, b) => {
      // Sort by period (assuming format YYYY-QN)
      return a.forecastPeriod.localeCompare(b.forecastPeriod)
    })
    .slice(0, 3) // Show only the next 3 forecasts

  // Calculate total expected yield
  const totalExpectedWeight = upcomingForecasts.reduce((sum, forecast) => sum + forecast.estimatedWeight, 0)
  const totalExpectedBunches = upcomingForecasts.reduce((sum, forecast) => sum + forecast.estimatedBunches, 0)

  // Helper function to get badge color based on confidence level
  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Low":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  // Helper function to format period (e.g., "2023-Q3" to "Q3 2023")
  const formatPeriod = (period: string) => {
    const [year, quarter] = period.split("-")
    return `${quarter} ${year}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalExpectedWeight.toLocaleString()} kg</div>
        <p className="text-xs text-muted-foreground">
          Expected from {totalExpectedBunches.toLocaleString()} bunches in upcoming harvests
        </p>

        <div className="mt-4 space-y-3">
          {upcomingForecasts.map((forecast) => (
            <div key={forecast.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{formatPeriod(forecast.forecastPeriod)}</p>
                <p className="text-xs text-muted-foreground">
                  {forecast.estimatedBunches} bunches, {forecast.estimatedWeight} kg
                </p>
              </div>
              <Badge variant="outline" className={`${getConfidenceBadgeColor(forecast.confidenceLevel)} font-normal`}>
                {forecast.confidenceLevel}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
