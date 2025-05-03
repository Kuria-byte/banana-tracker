import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack"; // adjust path as needed
import { Leaf, Map, Calendar, AlertTriangle } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TaskList } from "@/components/dashboard/task-list"
import { FarmHealthStatus } from "@/components/dashboard/farm-health-status"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { PersonalizedInsights } from "@/components/dashboard/personalized-insights"
import { YieldDashboard } from "@/components/dashboard/yield-dashboard"
import { HarvestForecast } from "@/components/dashboard/harvest-forecast"
import { EnhancedGreeting } from "@/components/dashboard/enhanced-greeting"
import { KnowledgeLinkCard } from "@/components/dashboard/knowledge-link-card"
import { getAllFarms } from "@/db/repositories/farm-repository";
import { getAllTasks } from "@/db/repositories/task-repository"

function mapHealthStatus(status: string) {
  switch (status) {
    case "GOOD": return "Good";
    case "AVERAGE": return "Average";
    case "POOR": return "Poor";
    default: return status;
  }
}

function mapTaskStatus(status: string) {
  switch (status) {
    case "PENDING": return "Pending";
    case "IN_PROGRESS": return "In Progress";
    case "COMPLETED": return "Completed";
    default: return status;
  }
}

export default async function Dashboard() {
  // Server-side authentication check
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-up"); 
  }

  const farms = await getAllFarms();

  const farmsWithMappedStatus = farms.map(farm => ({
    ...farm,
    healthStatus: mapHealthStatus(farm.healthStatus) as "Good" | "Average" | "Poor"
  }));

 
  const tasks = (await getAllTasks()).map(task => ({
    ...task,
    status: mapTaskStatus(task.status) as "Pending" | "In Progress" | "Completed" | "Cancelled"
  }));

  // Count farms by location
  const locationCounts = farms.reduce(
    (acc, farm) => {
      const location = farm.location.split(",")[0].trim()
      acc[location] = (acc[location] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Count farms by health status
  const healthCounts = farms.reduce(
    (acc, farm) => {
      acc[farm.healthStatus] = (acc[farm.healthStatus] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate total farm area
  const totalArea = farms.reduce((sum, farm) => sum + farm.area, 0)

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      {/* Enhanced greeting section */}
      <div className="mb-8">
        <EnhancedGreeting />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Farms"
          value={farms.length}
          icon={<Map className="h-4 w-4 text-muted-foreground" />}
          description="Across Karii and Kangai"
        />
        <StatsCard
          title="Total Area"
          value={`${totalArea.toFixed(1)} acres`}
          icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
          description="Under cultivation"
        />
        <StatsCard
          title="Active Tasks"
          value={tasks.filter(task => task.status === "Pending" || task.status === "In Progress").length}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          description="Pending or in progress"
        />
        <StatsCard
          title="Health Concerns"
          value={healthCounts["Poor"] || 0}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Farms needing attention"
        />
      </div>

      <div className="grid gap-4 mt-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <PersonalizedInsights />
          <div className="grid gap-4 md:grid-cols-2">
            <YieldDashboard />
            <HarvestForecast />
          </div>
          <TaskList tasks={tasks} limit={5} />
        </div>
        <div className="space-y-4">
          <FarmHealthStatus farms={farmsWithMappedStatus} />
          <TeamOverview  />
          <KnowledgeLinkCard />
        </div>
      </div>
    </div>
  )
}
