"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import type { Harvest } from "@/db/repositories/harvest-repository"
import Link from "next/link"

function formatNumber(n: number) {
  if (typeof n !== "number" || isNaN(n)) return "-"
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

export function YieldDashboard({ harvests }: { harvests: Harvest[] }) {
  // Calculate total yield
  const totalWeight = harvests.reduce((sum, h) => sum + Number(h.totalWeight || 0), 0)
  const bunchCount = harvests.reduce((sum, h) => sum + Number(h.bunchCount || 0), 0)

  // Calculate monthly yield data for the chart
  const monthlyData = harvests.reduce((acc: any[], harvest) => {
    const date = new Date(harvest.harvestDate)
    const month = date.toLocaleString("default", { month: "short" })
    const existingMonth = acc.find((item) => item.month === month)

    if (existingMonth) {
      existingMonth.weight += Number(harvest.totalWeight)
      existingMonth.bunches += Number(harvest.bunchCount)
    } else {
      acc.push({
        month,
        weight: Number(harvest.totalWeight),
        bunches: Number(harvest.bunchCount),
      })
    }

    return acc
  }, [])

  // Sort by month chronologically
  monthlyData.sort((a, b) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.indexOf(a.month) - months.indexOf(b.month)
  })

  const maxWeight = Math.max(...monthlyData.map((d) => d.weight), 1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Yield Summary</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(totalWeight)} kg</div>
        <p className="text-xs text-muted-foreground">
          From {formatNumber(bunchCount)} bunches harvested this year
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
                      width: `${(data.weight / maxWeight) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-xs text-right">{formatNumber(data.weight)} kg</div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div>Monthly yield (kg)</div>
          <div className="flex items-center">
            <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Link
            href="/yields"
            aria-label="View detailed yield and harvest analytics"
            className="text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
          >
            View detailed yields &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
