"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { GrowthFormModal } from "@/components/modals/growth-form-modal"

// Mock data for plants in growth
const plantsInGrowth = [
  {
    id: "1",
    farmName: "Main Farm",
    plotName: "Plot A",
    rowNumber: 1,
    plantPosition: 3,
    growthStage: "Flower Emergence",
    dateRecorded: new Date(2025, 3, 10),
    expectedHarvestDate: new Date(2025, 6, 10),
    healthStatus: "Healthy",
    suckerCount: 2,
    suckerHealth: "Healthy",
  },
  {
    id: "2",
    farmName: "Main Farm",
    plotName: "Plot A",
    rowNumber: 1,
    plantPosition: 5,
    growthStage: "Bunch Formation",
    dateRecorded: new Date(2025, 3, 5),
    expectedHarvestDate: new Date(2025, 5, 5),
    healthStatus: "Healthy",
    suckerCount: 3,
    suckerHealth: "Healthy",
  },
  {
    id: "3",
    farmName: "Main Farm",
    plotName: "Plot B",
    rowNumber: 2,
    plantPosition: 1,
    growthStage: "Fruit Development",
    dateRecorded: new Date(2025, 3, 1),
    expectedHarvestDate: new Date(2025, 4, 1),
    healthStatus: "Pest-affected",
    suckerCount: 1,
    suckerHealth: "Pest-affected",
  },
  {
    id: "4",
    farmName: "East Farm",
    plotName: "Plot C",
    rowNumber: 1,
    plantPosition: 2,
    growthStage: "Flower Emergence",
    dateRecorded: new Date(2025, 3, 15),
    expectedHarvestDate: new Date(2025, 6, 15),
    healthStatus: "Healthy",
    suckerCount: 2,
    suckerHealth: "Healthy",
  },
  {
    id: "5",
    farmName: "South Farm",
    plotName: "Plot A",
    rowNumber: 3,
    plantPosition: 4,
    growthStage: "Bunch Formation",
    dateRecorded: new Date(2025, 3, 8),
    expectedHarvestDate: new Date(2025, 5, 8),
    healthStatus: "Diseased",
    suckerCount: 2,
    suckerHealth: "Diseased",
  },
]

// Helper function to format date
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function GrowthStagesPage() {
  const [selectedFarm, setSelectedFarm] = useState<string>("all")
  const [selectedStage, setSelectedStage] = useState<string>("all")
  const [selectedHealth, setSelectedHealth] = useState<string>("all")

  // Filter plants based on selected filters
  const filteredPlants = plantsInGrowth.filter((plant) => {
    const farmMatch = selectedFarm === "all" || plant.farmName.toLowerCase().includes(selectedFarm.toLowerCase())
    const stageMatch = selectedStage === "all" || plant.growthStage === selectedStage
    const healthMatch = selectedHealth === "all" || plant.healthStatus === selectedHealth
    return farmMatch && stageMatch && healthMatch
  })

  // Count plants by growth stage
  const stageCount = {
    "Flower Emergence": filteredPlants.filter((p) => p.growthStage === "Flower Emergence").length,
    "Bunch Formation": filteredPlants.filter((p) => p.growthStage === "Bunch Formation").length,
    "Fruit Development": filteredPlants.filter((p) => p.growthStage === "Fruit Development").length,
  }

  // Count plants by health status
  const healthCount = {
    Healthy: filteredPlants.filter((p) => p.healthStatus === "Healthy").length,
    Diseased: filteredPlants.filter((p) => p.healthStatus === "Diseased").length,
    "Pest-affected": filteredPlants.filter((p) => p.healthStatus === "Pest-affected").length,
    Damaged: filteredPlants.filter((p) => p.healthStatus === "Damaged").length,
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/growth">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Growth Stages</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <p className="text-muted-foreground">Monitor the growth stages of your banana plants</p>
        <div className="flex gap-2">
          <GrowthFormModal
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Growth
              </Button>
            }
            title="Record Growth Stage"
            description="Record a growth stage for a banana plant"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plants in Growth</CardTitle>
              <CardDescription>Detailed view of plants at different growth stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPlants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No plants match the selected filters</p>
                  </div>
                ) : (
                  filteredPlants.map((plant) => (
                    <div key={plant.id} className="border rounded-md p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">
                            {plant.farmName} - {plant.plotName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Row {plant.rowNumber}, Position {plant.plantPosition}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              plant.healthStatus === "Healthy"
                                ? "bg-green-100 text-green-800"
                                : plant.healthStatus === "Diseased"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : plant.healthStatus === "Pest-affected"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {plant.healthStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Growth Stage</p>
                          <p className="font-medium">{plant.growthStage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date Recorded</p>
                          <p className="font-medium">{formatDate(plant.dateRecorded)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Harvest</p>
                          <p className="font-medium">{formatDate(plant.expectedHarvestDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Suckers</p>
                          <p className="font-medium">
                            {plant.suckerCount} ({plant.suckerHealth})
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Farm</label>
                  <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select farm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Farms</SelectItem>
                      <SelectItem value="main">Main Farm</SelectItem>
                      <SelectItem value="east">East Farm</SelectItem>
                      <SelectItem value="south">South Farm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Growth Stage</label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select growth stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="Flower Emergence">Flower Emergence</SelectItem>
                      <SelectItem value="Bunch Formation">Bunch Formation</SelectItem>
                      <SelectItem value="Fruit Development">Fruit Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Health Status</label>
                  <Select value={selectedHealth} onValueChange={setSelectedHealth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Healthy">Healthy</SelectItem>
                      <SelectItem value="Diseased">Diseased</SelectItem>
                      <SelectItem value="Pest-affected">Pest-affected</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Growth Stages</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Flower Emergence</span>
                      <span className="text-sm font-medium">{stageCount["Flower Emergence"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (stageCount["Flower Emergence"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bunch Formation</span>
                      <span className="text-sm font-medium">{stageCount["Bunch Formation"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (stageCount["Bunch Formation"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fruit Development</span>
                      <span className="text-sm font-medium">{stageCount["Fruit Development"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (stageCount["Fruit Development"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Health Status</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Healthy</span>
                      <span className="text-sm font-medium">{healthCount["Healthy"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (healthCount["Healthy"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diseased</span>
                      <span className="text-sm font-medium">{healthCount["Diseased"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (healthCount["Diseased"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pest-affected</span>
                      <span className="text-sm font-medium">{healthCount["Pest-affected"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (healthCount["Pest-affected"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Damaged</span>
                      <span className="text-sm font-medium">{healthCount["Damaged"]}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{
                          width: `${filteredPlants.length ? (healthCount["Damaged"] / filteredPlants.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
