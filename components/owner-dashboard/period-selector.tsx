"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DashboardPeriod } from "@/lib/types/owner-dashboard"

interface PeriodSelectorProps {
  period: DashboardPeriod
  onChange: (period: DashboardPeriod) => void
}

export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <Select value={period} onValueChange={(value) => onChange(value as DashboardPeriod)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="week">Last 7 days</SelectItem>
        <SelectItem value="month">Last 30 days</SelectItem>
        <SelectItem value="quarter">Last 3 months</SelectItem>
        <SelectItem value="year">Last 12 months</SelectItem>
      </SelectContent>
    </Select>
  )
}
