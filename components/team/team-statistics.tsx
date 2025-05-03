"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeamMember } from "@/lib/types/team"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { Users, DollarSign } from "lucide-react"

interface TeamStatisticsProps {
  members: TeamMember[]
}

export function TeamStatistics({ members }: TeamStatisticsProps) {
  // Calculate total employees
  const totalEmployees = members.length

  // Calculate total salary expenditure
  const totalSalary = members.reduce((sum, member) => sum + (member.salary || 0), 0)

  // Calculate active employees
  const activeEmployees = members.filter((member) => member.status === "active").length

  // Calculate percentage of active employees
  const activePercentage = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeEmployees} active ({activePercentage}%)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Salary Expenditure</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSalary, "KES")}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg: {formatCurrency(totalEmployees > 0 ? totalSalary / totalEmployees : 0, "KES")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
