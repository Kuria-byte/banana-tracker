import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Droplets, Sun, Thermometer } from "lucide-react"
import { HealthReportsModal } from "@/components/modals/health-reports-modal"

export function PersonalizedInsights() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Your Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
            <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Today's Weather</h4>
            <p className="text-xs text-muted-foreground">Sunny, 28°C with light winds</p>
            <div className="mt-1 flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">Ideal for field inspections</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
            <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Irrigation Needed</h4>
            <p className="text-xs text-muted-foreground">3 plots require irrigation today</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              View irrigation schedule
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Urgent Tasks</h4>
            <p className="text-xs text-muted-foreground">2 high-priority tasks due today</p>
            <HealthReportsModal
              trigger={
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Health Report
                </Button>
              }
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Upcoming Harvests</h4>
            <p className="text-xs text-muted-foreground">Harvest scheduled for next week</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              View harvest calendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
