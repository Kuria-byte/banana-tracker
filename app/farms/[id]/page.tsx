import { useParams, notFound } from "next/navigation"
import { getFarmById } from "@/db/repositories/farm-repository"
import { getPlotsByFarmId } from "@/db/repositories/plot-repository"
import { getTasksByFarmId } from "@/db/repositories/task-repository"
import { getAllUsers } from "@/db/repositories/user-repository"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Edit, MapPin, User, ArrowLeft, Leaf, LayoutGrid, Plus, Activity } from "lucide-react"
import Link from "next/link"
import { TaskCard } from "@/components/tasks/task-card"
import { FarmFormModal } from "@/components/modals/farm-form-modal"
import { PlotFormModal } from "@/components/modals/plot-form-modal"
import { TaskFormModal } from "@/components/modals/task-form-modal"
import { GrowthFormModal } from "@/components/modals/growth-form-modal"
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal"

export default async function FarmDetailPage({ params }: { params: { id: string } }) {
  const farmId = Number(params.id)
  const farm = await getFarmById(farmId)
  if (!farm) notFound()

  const plots = await getPlotsByFarmId(farmId)
  const tasks = await getTasksByFarmId(farmId)
  const users = await getAllUsers()

  // Map health status for UI
  const mapHealthStatus = (status: string) => {
    switch (status) {
      case "GOOD": return "Good"
      case "AVERAGE": return "Average"
      case "POOR": return "Poor"
      default: return status
    }
  }

  // Map DB fields to UI fields
  const farmUI = {
    ...farm,
    healthStatus: farm.healthStatus as 'Good' | 'Average' | 'Poor',
    plotCount: plots.length,
  }

  const getHealthStatusColor = () => {
    switch (farmUI.healthStatus) {
      case "Good":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Average":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Poor":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  // Find the earliest established date from plots
  const establishedDate = plots.length > 0
    ? plots
        .map((p) => p.createdAt)
        .filter(Boolean)
        .sort()[0]
    : null;

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-2 p-2">
          <Link href="/farms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Farms
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{farmUI.name}</h1>
              <Badge variant="outline" className={`${getHealthStatusColor()} font-normal`}>
                {farmUI.healthStatus}
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="mr-1 h-4 w-4" />
              {farmUI.location}
            </div>
          </div>
          <FarmFormModal
            trigger={
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Farm
              </Button>
            }
            title="Edit Farm"
            description="Update farm details"
            initialData={{
              id: farmUI.id,
              name: farmUI.name,
              location: farmUI.location,
              healthStatus: farmUI.healthStatus,
            }}
            users={users}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Farm Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Plots</dt>
                <dd className="font-medium">{farmUI.plotCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Established</dt>
                <dd className="font-medium">{establishedDate ? new Date(establishedDate).toLocaleDateString() : 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.status === "Completed").length} tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plots">
        <TabsList className="mb-6">
          <TabsTrigger value="plots" className="flex items-center">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Plots
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center">
            <Leaf className="mr-2 h-4 w-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Health Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plots">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Plots</h2>
            <PlotFormModal
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plot
                </Button>
              }
              title="Add New Plot"
              description="Create a new plot for this farm"
              farmId={farmId.toString()}
            />
          </div>

          {plots.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No plots available for this farm</p>
              <PlotFormModal
                trigger={<Button className="mt-4">Add Your First Plot</Button>}
                title="Add New Plot"
                description="Create your first plot for this farm"
                farmId={farmId.toString()}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plots.map((plot) => (
                <Card key={plot.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{plot.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`font-normal ${
                          plot.status === "Good"
                            ? "bg-green-100 text-green-800"
                            : plot.status === "Average"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {plot.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Area</p>
                        <p className="font-medium">{plot.area} acres</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rows</p>
                        <p className="font-medium">{plot.rowCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Soil Type</p>
                        <p className="font-medium">{plot.soilType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Established</p>
                        <p className="font-medium">{new Date(plot.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  
   
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    {/* <Button asChild variant="outline" className="w-full">
                      <Link href={`/farms/${farmId}/plots/${plot.id}`}>View Plot Details</Link>
                    </Button> */}
                    <Button asChild className="w-full">
                      <Link href={`/farms/${farmId}/plots/${plot.id}/rows`}>Manage Rows</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <TaskFormModal
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              }
              title="Add New Task"
              description="Create a new task for this farm"
              farmId={farmId.toString()}
            />
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No tasks available for this farm</p>
              <TaskFormModal
                trigger={<Button className="mt-4">Create Your First Task</Button>}
                title="Add New Task"
                description="Create your first task for this farm"
                farmId={farmId.toString()}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="growth">
          <div className="text-center py-12 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Growth Tracking</h2>
            <p className="text-muted-foreground mb-4">Track the growth stages of your banana plants</p>
            <GrowthFormModal trigger={<Button>Set Up Growth Tracking</Button>} />
          </div>
        </TabsContent>
        <TabsContent value="health">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Farm Health Tracking</h2>
            <Button asChild>
              <Link href={`/farms/${farmId}/health`}>View Health Dashboard</Link>
            </Button>
          </div>

          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Track and assess the health of your farm using our comprehensive scoring system
            </p>
            <FarmHealthScoringModal farmId={farmId.toString()} trigger={<Button>Record Health Assessment</Button>} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
