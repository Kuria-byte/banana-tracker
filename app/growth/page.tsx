import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { GrowthFormModal } from "@/components/modals/growth-form-modal"
import { Plus } from "lucide-react"
import { HealthReportsModal } from "@/components/modals/health-reports-modal"
import { HarvestPlanModal } from "@/components/modals/harvest-plan-modal"
import { getUiGrowthStageDistribution, getUiHealthStatusDistribution } from "@/db/repositories/growth-records-repository"
import { getUpcomingHarvestYield } from "@/db/repositories/harvest-records-repository"

export default async function GrowthPage() {
  // Fetch real data from Neon
  const [stageDist, healthDist, harvestYield] = await Promise.all([
    getUiGrowthStageDistribution(),
    getUiHealthStatusDistribution(),
    getUpcomingHarvestYield(),
  ])

  // Helper to get % by stage name
  const getStagePercent = (name: string) => stageDist.find(s => s.stage === name)?.percent ?? 0
  // Helper to get % by health status
  const getHealthPercent = (status: string) => healthDist.find(h => h.status === status)?.percent ?? 0

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Growth Tracking</h1>
          <p className="text-muted-foreground">Monitor the growth stages of your banana plants</p>
        </div>
        <GrowthFormModal
          trigger={
            <Button className="sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Record Growth
            </Button>
          }
          title="Record Growth Stage"
          description="Record a growth stage for a banana plant"
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stages" className="flex items-center">
            <Leaf className="mr-2 h-4 w-4" />
            Growth Stages
          </TabsTrigger>
          <TabsTrigger value="harvest" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Harvest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Plants in Growth</CardTitle>
                <CardDescription>Current growth stage distribution</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {[
                    { name: "Flower Emergence", color: "bg-blue-500" },
                    { name: "Bunch Formation", color: "bg-yellow-500" },
                    { name: "Fruit Development", color: "bg-green-500" },
                    { name: "Ready for Harvest", color: "bg-red-500" },
                  ].map(({ name, color }) => (
                    <div key={name}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{name}</span>
                        <span className="text-sm font-medium">{getStagePercent(name)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`${color} h-full rounded-full`} style={{ width: `${getStagePercent(name)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/growth/stages">View Details</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Harvests</CardTitle>
                <CardDescription>Next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{harvestYield.count ?? 0}</div>
                <p className="text-sm text-muted-foreground">Estimated yield: {harvestYield.totalWeight ?? 0}kg</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/growth/harvest">View Harvest Schedule</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Status</CardTitle>
                <CardDescription>Plant health overview</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {[
                    { status: "Healthy", color: "bg-green-500" },
                    { status: "Diseased", color: "bg-yellow-500" },
                    { status: "Pest-affected", color: "bg-orange-500" },
                    { status: "Damaged", color: "bg-red-500" },
                  ].map(({ status, color }) => (
                    <div key={status}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{status}</span>
                        <span className="text-sm font-medium">{getHealthPercent(status)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`${color} h-full rounded-full`} style={{ width: `${getHealthPercent(status)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <HealthReportsModal
                  trigger={
                    <Button variant="outline" className="w-full">
                      View Health Reports
                    </Button>
                  }
                />
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stages">
          <div className="text-center py-12 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Growth Stage Tracking</h2>
            <p className="text-muted-foreground mb-4">Record and monitor the growth stages of your banana plants</p>
            <GrowthFormModal
              trigger={<Button>Record New Growth Stage</Button>}
              title="Record Growth Stage"
              description="Record a growth stage for a banana plant"
            />
          </div>
        </TabsContent>

        <TabsContent value="harvest">
          <div className="text-center py-12 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Harvest Planning</h2>
            <p className="text-muted-foreground mb-4">Plan and schedule your upcoming harvests</p>
            <HarvestPlanModal trigger={<Button>Create Harvest Plan</Button>} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
