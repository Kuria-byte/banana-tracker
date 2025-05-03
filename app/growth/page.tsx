"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { GrowthFormModal } from "@/components/modals/growth-form-modal"
import { Plus } from "lucide-react"
import { HealthReportsModal } from "@/components/modals/health-reports-modal"
import { HarvestPlanModal } from "@/components/modals/harvest-plan-modal"

export default function GrowthPage() {
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Flower Emergence</span>
                    <span className="text-sm font-medium">24%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "24%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bunch Formation</span>
                    <span className="text-sm font-medium">38%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: "38%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fruit Development</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: "28%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ready for Harvest</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: "10%" }}></div>
                  </div>
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
                <div className="text-3xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Estimated yield: 240kg</p>
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healthy</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: "75%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Diseased</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: "12%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pest-affected</span>
                    <span className="text-sm font-medium">8%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: "8%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Damaged</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: "5%" }}></div>
                  </div>
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
