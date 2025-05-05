"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface FarmHealthChartProps {
  healthCounts: {
    Good: number
    Average: number
    Poor: number
  }
}

export function FarmHealthChart({ healthCounts }: FarmHealthChartProps) {
  const total = healthCounts.Good + healthCounts.Average + healthCounts.Poor
  const goodPercent = total > 0 ? Math.round((healthCounts.Good / total) * 100) : 0
  const averagePercent = total > 0 ? Math.round((healthCounts.Average / total) * 100) : 0
  const poorPercent = total > 0 ? Math.round((healthCounts.Poor / total) * 100) : 0

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
