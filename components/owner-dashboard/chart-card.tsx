import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function ChartCard({ title, description, className, children, action }: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="px-2 pb-0 pt-0">{children}</CardContent>
    </Card>
  )
}
