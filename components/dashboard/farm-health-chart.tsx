"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Farm } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface FarmHealthChartProps {
  farms: Farm[]
}

export function FarmHealthChart({ farms }: FarmHealthChartProps) {
  // Count farms by health status
  const healthCounts = farms.reduce(
    (acc, farm) => {
      acc[farm.healthStatus] = (acc[farm.healthStatus] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const data = [
    { name: "Good", value: healthCounts["Good"] || 0 },
    { name: "Average", value: healthCounts["Average"] || 0 },
    { name: "Poor", value: healthCounts["Poor"] || 0 },
  ]

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Farm Health Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
