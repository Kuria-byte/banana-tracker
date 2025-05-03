"use client"

import { useEffect, useState } from "react"
import { useUser } from "@stackframe/stack"
import { Clock, CloudRain, Droplets, Leaf, MapPin, Sun, Thermometer, Wind, CheckCircle2, LineChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FarmSelectionModal } from "@/components/modals/farm-selection-modal"
import { farms, tasks } from "@/lib/mock-data"

export function EnhancedGreeting() {
  const user = useUser()

  const [greeting, setGreeting] = useState("Hello")
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) setGreeting("Good morning")
      else if (hour < 18) setGreeting("Good afternoon")
      else setGreeting("Good evening")

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
      setCurrentTime(new Date().toLocaleTimeString(undefined, timeOptions))

      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
      }
      setCurrentDate(new Date().toLocaleDateString(undefined, dateOptions))
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate farm and task stats (replace with real DB data as you connect)
  const totalFarms = farms.length
  const healthyFarms = farms.filter((farm) => farm.healthStatus === "Good").length
  const healthPercentage = Math.round((healthyFarms / totalFarms) * 100)
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const taskPercentage = Math.round((completedTasks / totalTasks) * 100)
  const today = new Date().toISOString().split("T")[0]
  const tasksDueToday = tasks.filter(
    (task) => task.status !== "Completed" && task.dueDate.split("T")[0] === today,
  ).length

  // Show loading state if user is not loaded yet
  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <Card className="border-none shadow-none bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* Left column - Greeting and stats */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>{currentTime}</span>
                <span className="mx-1">•</span>
                <span>{currentDate}</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {greeting}, {user.displayName || user.primaryEmail}
              </h1>
              <p className="text-muted-foreground">Welcome back to your farm management dashboard</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span className="font-medium">Farm Health</span>
                  </div>
                  <span className="text-sm">
                    {healthyFarms}/{totalFarms} farms healthy
                  </span>
                </div>
                <Progress value={healthPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {healthPercentage >= 75 ? "Your farms are doing well overall" : "Some farms need attention"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Task Progress</span>
                  </div>
                  <span className="text-sm">
                    {completedTasks}/{totalTasks} tasks completed
                  </span>
                </div>
                <Progress value={taskPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {tasksDueToday > 0 ? `${tasksDueToday} tasks due today` : "No tasks due today"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8" asChild>
                <Link href="/tasks">
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                  Assign Task
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-8" asChild>
                <Link href="/growth">
                  <Leaf className="mr-2 h-3.5 w-3.5" />
                  Record Growth
                </Link>
              </Button>
              <FarmSelectionModal>
                <Button variant="outline" size="sm" className="h-8">
                  <LineChart className="mr-2 h-3.5 w-3.5" />
                  Score Farm
                </Button>
              </FarmSelectionModal>
            </div>
          </div>

          {/* Right column - Weather and insights */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Today's Weather</h3>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
                  <Sun className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">28°C</p>
                  <p className="text-xs text-muted-foreground">Feels like 30°C</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Sunny</p>
                <p className="text-xs text-muted-foreground">Karii, Kenya</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center gap-1 rounded-md bg-muted p-2">
                <Wind className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">12 km/h</span>
                <span className="text-muted-foreground">Wind</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md bg-muted p-2">
                <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">45%</span>
                <span className="text-muted-foreground">Humidity</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md bg-muted p-2">
                <CloudRain className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">0%</span>
                <span className="text-muted-foreground">Rain</span>
              </div>
            </div>

            <div className="mt-4 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" />
                <span>Ideal for field inspections and harvesting</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
