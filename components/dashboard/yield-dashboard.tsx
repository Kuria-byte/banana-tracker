"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateTotalYield, harvests } from "@/lib/mock-data"
import { BarChart3 } from "lucide-react"

export function YieldDashboard() {
  const totalYield = calculateTotalYield()

  // Calculate monthly yield data for the chart
  const monthlyData = harvests.reduce((acc: any[], harvest) => {
    const date = new Date(harvest.harvestDate)
    const month = date.toLocaleString("default", { month: "short" })
    const existingMonth = acc.find((item) => item.month === month)

    if (existingMonth) {
      existingMonth.weight += harvest.totalWeight
      existingMonth.bunches += harvest.bunchCount
    } else {
      acc.push({
        month,
        weight: harvest.totalWeight,
        bunches: harvest.bunchCount,
      })
    }

    return acc
  }, [])

  // Sort by month chronologically
  monthlyData.sort((a, b) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.indexOf(a.month) - months.indexOf(b.month)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Yield Summary</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalYield.totalWeight.toLocaleString()} kg</div>
        <p className="text-xs text-muted-foreground">
          From {totalYield.bunchCount.toLocaleString()} bunches harvested this year
        </p>

        <div className="mt-4 space-y-2">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex items-center">
              <div className="w-12 text-xs">{data.month}</div>
              <div className="flex-1">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(data.weight / Math.max(...monthlyData.map((d) => d.weight))) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-xs text-right">{data.weight} kg</div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div>Monthly yield (kg)</div>
          <div className="flex items-center">
            <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
            <span>2023</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
