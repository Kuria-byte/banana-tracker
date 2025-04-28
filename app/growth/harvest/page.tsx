"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CalendarIcon, List, Plus } from "lucide-react"
import Link from "next/link"
import { HarvestPlanModal } from "@/components/modals/harvest-plan-modal"

// Mock data for upcoming harvests
const upcomingHarvests = [
  {
    id: "1",
    farmName: "Main Farm",
    plotName: "Plot A",
    expectedDate: new Date(2025, 4, 15),
    estimatedYield: 120,
    growthStage: "Fruit Development",
    healthStatus: "Healthy",
  },
  {
    id: "2",
    farmName: "Main Farm",
    plotName: "Plot B",
    expectedDate: new Date(2025, 4, 18),
    estimatedYield: 95,
    growthStage: "Fruit Development",
    healthStatus: "Healthy",
  },
  {
    id: "3",
    farmName: "East Farm",
    plotName: "Plot C",
    expectedDate: new Date(2025, 4, 22),
    estimatedYield: 110,
    growthStage: "Fruit Development",
    healthStatus: "Healthy",
  },
  {
    id: "4",
    farmName: "South Farm",
    plotName: "Plot A",
    expectedDate: new Date(2025, 5, 5),
    estimatedYield: 130,
    growthStage: "Fruit Development",
    healthStatus: "Healthy",
  },
  {
    id: "5",
    farmName: "Main Farm",
    plotName: "Plot D",
    expectedDate: new Date(2025, 5, 12),
    estimatedYield: 105,
    growthStage: "Fruit Development",
    healthStatus: "Healthy",
  },
]

// Helper function to format date
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function HarvestSchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedFarm, setSelectedFarm] = useState<string>("all")
  const [view, setView] = useState<"calendar" | "list">("calendar")

  // Filter harvests based on selected farm
  const filteredHarvests =
    selectedFarm === "all"
      ? upcomingHarvests
      : upcomingHarvests.filter((harvest) => harvest.farmName.toLowerCase().includes(selectedFarm.toLowerCase()))

  // Get harvests for the selected date
  const harvestsForSelectedDate = selectedDate
    ? filteredHarvests.filter(
        (harvest) =>
          harvest.expectedDate.getDate() === selectedDate.getDate() &&
          harvest.expectedDate.getMonth() === selectedDate.getMonth() &&
          harvest.expectedDate.getFullYear() === selectedDate.getFullYear(),
      )
    : []

  // Calculate total estimated yield
  const totalEstimatedYield = filteredHarvests.reduce((sum, harvest) => sum + harvest.estimatedYield, 0)

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/growth">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Harvest Schedule</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <p className="text-muted-foreground">Plan and monitor your upcoming harvests</p>
        <div className="flex gap-2">
          <HarvestPlanModal
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Harvest Plan
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Harvest Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={view === "calendar" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setView("calendar")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                  <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Select a date to view scheduled harvests</CardDescription>
            </CardHeader>
            <CardContent>
              {view === "calendar" ? (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              ) : (
                <div className="space-y-4">
                  {filteredHarvests.map((harvest) => (
                    <div
                      key={harvest.id}
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedDate(harvest.expectedDate)}
                    >
                      <div>
                        <p className="font-medium">
                          {harvest.farmName} - {harvest.plotName}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(harvest.expectedDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{harvest.estimatedYield} kg</p>
                        <p className="text-sm text-muted-foreground">{harvest.growthStage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter</CardTitle>
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
                  <p className="text-sm text-muted-foreground">Total Harvests</p>
                  <p className="text-2xl font-bold">{filteredHarvests.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Yield</p>
                  <p className="text-2xl font-bold">{totalEstimatedYield} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedDate && harvestsForSelectedDate.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Harvests on {formatDate(selectedDate)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {harvestsForSelectedDate.map((harvest) => (
                    <div key={harvest.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <p className="font-medium">
                        {harvest.farmName} - {harvest.plotName}
                      </p>
                      <p className="text-sm">Estimated Yield: {harvest.estimatedYield} kg</p>
                      <p className="text-sm text-muted-foreground">Health Status: {harvest.healthStatus}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
