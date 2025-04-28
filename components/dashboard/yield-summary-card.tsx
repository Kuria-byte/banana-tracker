"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateTotalYield, harvests } from "@/lib/mock-data"
import { BarChart3 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface YieldSummaryCardProps {
  title?: string
}

export function YieldSummaryCard({ title = "Yield Summary" }: YieldSummaryCardProps) {
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
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalYield.totalWeight.toLocaleString()} kg</div>
        <p className="text-xs text-muted-foreground">
          From {totalYield.bunchCount.toLocaleString()} bunches harvested this year
        </p>

        <div className="mt-4 h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} />
              <Bar dataKey="weight" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
