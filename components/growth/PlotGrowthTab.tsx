"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PlantLifecycle } from "@/components/growth/plant-lifecycle"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { calculateGrowthStage } from "@/lib/utils/growth-utils"
import { ChevronDown, ChevronRight, BananaIcon, AlertTriangle, Sprout } from "lucide-react"
import { GrowthFormModal } from "@/components/modals/growth-form-modal"
import { Badge } from "@/components/ui/badge"

interface PlotGrowthTabProps {
  plots: any[]
  farmId: number
  farm: any
  farms: any[]
  users: any[]
}

export default function PlotGrowthTab({ plots, farmId, farm, farms, users }: PlotGrowthTabProps) {
  const [selectedPlotId, setSelectedPlotId] = useState(plots[0]?.id?.toString() || "")
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  // New state to track expanded holes by a composite key "rowNumber-holeNumber"
  const [expandedHoles, setExpandedHoles] = useState<string[]>([])

  const plot = plots.find((p) => p.id?.toString() === selectedPlotId) || plots[0] || null
  const rows = plot?.layoutStructure || []

  // Compute stage and health distribution for the selected plot
  const stageCounts: Record<string, number> = {
    "Early Growth": 0,
    "Vegetative": 0,
    "Flower Emergence": 0,
    "Bunch Formation": 0,
    "Fruit Development": 0,
    "Ready for Harvest": 0,
  }
  const healthCounts: Record<string, number> = {
    "Healthy": 0,
    "Diseased": 0,
    "Pest-affected": 0,
    "Damaged": 0,
  }
  let totalPlants = 0
  rows.forEach((row: any) => {
    row.holes.forEach((hole: any) => {
      if (hole.status === "PLANTED" && hole.plantedDate) {
        totalPlants++
        const stage = calculateGrowthStage(new Date(hole.plantedDate))
        stageCounts[stage] = (stageCounts[stage] || 0) + 1
        const health = hole.plantHealth || "Healthy"
        healthCounts[health] = (healthCounts[health] || 0) + 1
      }
    })
  })

  // Get color for growth stage - updated for dark mode compatibility
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Early Growth": return "bg-blue-500 dark:bg-blue-600"
      case "Vegetative": return "bg-teal-500 dark:bg-teal-600"
      case "Flower Emergence": return "bg-indigo-500 dark:bg-indigo-600"
      case "Bunch Formation": return "bg-yellow-500 dark:bg-yellow-600"
      case "Fruit Development": return "bg-orange-500 dark:bg-orange-600"
      case "Ready for Harvest": return "bg-red-500 dark:bg-red-600"
      default: return "bg-gray-500 dark:bg-gray-600"
    }
  }

  // Get color for health - updated for dark mode compatibility
  const getHealthColor = (status: string) => {
    switch (status) {
      case "Healthy": return "bg-green-500 dark:bg-green-600"
      case "Diseased": return "bg-yellow-500 dark:bg-yellow-600"
      case "Pest-affected": return "bg-orange-500 dark:bg-orange-600"
      case "Damaged": return "bg-red-500 dark:bg-red-600"
      default: return "bg-gray-500 dark:bg-gray-600"
    }
  }

  // Updated toggle functions with separate handlers
  const toggleRow = (rowNumber: number, e: React.MouseEvent) => {
    // Prevent event bubbling
    e.stopPropagation()
    
    setExpandedRows((prev) =>
      prev.includes(rowNumber)
        ? prev.filter((n) => n !== rowNumber)
        : [...prev, rowNumber]
    )
  }

  // New function to toggle hole expansion
  const toggleHole = (rowNumber: number, holeNumber: number, e: React.MouseEvent) => {
    // Prevent event bubbling
    e.stopPropagation()
    
    const holeKey = `${rowNumber}-${holeNumber}`
    
    setExpandedHoles((prev) =>
      prev.includes(holeKey)
        ? prev.filter((key) => key !== holeKey)
        : [...prev, holeKey]
    )
  }

  // Function to check if a hole is expanded
  const isHoleExpanded = (rowNumber: number, holeNumber: number) => {
    return expandedHoles.includes(`${rowNumber}-${holeNumber}`)
  }

  return (
    <div className="py-6 px-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Growth Tracking</h2>
          <p className="text-muted-foreground dark:text-gray-400">
            Track the growth stages of your banana plants by plot
          </p>
        </div>
        
        {/* Plot Selector */}
        {plots.length > 1 && (
          <div className="w-full sm:w-64">
            <Select value={selectedPlotId} onValueChange={setSelectedPlotId}>
              <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Select a plot" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {plots.map((plot) => (
                  <SelectItem key={plot.id} value={plot.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
                    {plot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Plot Summary Card */}
      <Card className="mb-8 border shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg dark:text-white">Plot Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Growth Stage Distribution */}
            <div>
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground dark:text-gray-400 mb-3">
                Growth Stage Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(stageCounts).map(([stage, count]) => {
                  const percentage = totalPlants > 0 ? Math.round((count / totalPlants) * 100) : 0
                  return (
                    <div key={stage}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="flex items-center dark:text-white">
                          <span className={`inline-block w-2 h-2 rounded-full ${getStageColor(stage)} mr-2`}></span>
                          {stage}
                        </span>
                        <span className="font-medium dark:text-white">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`${getStageColor(stage)} h-full rounded-full transition-all duration-500`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Health Status */}
            <div>
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground dark:text-gray-400 mb-3">
                Health Status
              </h3>
              <div className="space-y-3">
                {Object.entries(healthCounts).map(([status, count]) => {
                  const percentage = totalPlants > 0 ? Math.round((count / totalPlants) * 100) : 0
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="flex items-center dark:text-white">
                          <span className={`inline-block w-2 h-2 rounded-full ${getHealthColor(status)} mr-2`}></span>
                          {status}
                        </span>
                        <span className="font-medium dark:text-white">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`${getHealthColor(status)} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Growth Records List (grouped by row) */}
      {rows.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-lg border border-dashed dark:border-gray-700">
          <div className="flex justify-center mb-2">
            <BananaIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
          <p>No rows or holes have been added to this plot yet.</p>
          <p>Add a plot layout to begin tracking growth.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row: any) => {
            const expanded = expandedRows.includes(row.rowNumber)
            const hasPlantedHoles = row.holes.some((h: any) => h.status === "PLANTED")
            
            return (
              <div key={row.rowNumber} className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                <button
                  className={`flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors ${expanded ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                  onClick={(e) => toggleRow(row.rowNumber, e)}
                >
                  <div className="flex items-center">
                    <div className="font-medium dark:text-white">Row {row.rowNumber}</div>
                    <div className="ml-2 text-xs text-muted-foreground dark:text-gray-400">
                      {row.holes.length} holes • {row.holes.filter((h: any) => h.status === "PLANTED").length} plants
                    </div>
                  </div>
                  {expanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                
                {expanded && (
                  <div className="p-4 pt-0 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    {!hasPlantedHoles ? (
                      <div className="py-4 text-center text-muted-foreground dark:text-gray-400">
                        <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                        <p>No plants have been added to this row yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {row.holes.filter((h: any) => h.status === "PLANTED").map((hole: any) => {
                          const currentSuckerCount = hole.currentSuckerCount ?? hole.suckerIds?.length ?? 0;
                          const targetSuckerCount = hole.targetSuckerCount ?? 3;
                          const holeExpanded = isHoleExpanded(row.rowNumber, hole.holeNumber);
                          
                          return (
                            <div 
                              key={hole.holeNumber} 
                              className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm transition-all hover:shadow"
                            >
                              {/* Hole header with toggle */}
                              <button
                                className="w-full p-4 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={(e) => toggleHole(row.rowNumber, hole.holeNumber, e)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge variant="outline" className="mb-1 dark:border-gray-600 dark:text-white">
                                      Hole {hole.holeNumber}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                                      ID: {hole.mainPlantId || "Unknown"}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={
                                        hole.plantHealth === "Healthy"
                                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                          : hole.plantHealth === "Diseased"
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                                          : hole.plantHealth === "Pest-affected"
                                          ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                                          : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                                      }
                                    >
                                      {hole.plantHealth || "Healthy"}
                                    </Badge>
                                    {holeExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              
                              {/* Hole expanded content */}
                              {holeExpanded && (
                                <div className="px-4 pb-4">
                                  {/* PlantLifecycle component */}
                                  <PlantLifecycle
                                    plantedDate={hole.plantedDate || new Date()}
                                    manualStage={undefined /* TODO: Use real manual stage if available */}
                                  />
                                  
                                  {/* Sucker Information - Only visible when hole is expanded */}
                                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600">
                                    <div className="flex items-center gap-1 mb-1.5">
                                      <Sprout className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                                      <span className="text-xs font-medium dark:text-white">Suckers</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs">
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Current:</span> 
                                        <span className="font-medium dark:text-white"> {currentSuckerCount}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Target:</span> 
                                        <span className="font-medium dark:text-white"> {targetSuckerCount}</span>
                                      </div>
                                      
                                      {currentSuckerCount !== targetSuckerCount && (
                                        <Badge 
                                          variant="outline" 
                                          className={currentSuckerCount < targetSuckerCount 
                                            ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" 
                                            : "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                                          }
                                        >
                                          {currentSuckerCount < targetSuckerCount ? "Below target" : "Above target"}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {hole.suckerIds && hole.suckerIds.length > 0 && (
                                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate" title={hole.suckerIds.join(", ")}>
                                        IDs: {hole.suckerIds.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Record Growth Button */}
                                  <div className="mt-3">
                                    <GrowthFormModal
                                      trigger={
                                        <Button 
                                          size="sm" 
                                          className="w-full dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                                        >
                                          Record Growth
                                        </Button>
                                      }
                                      initialValues={{
                                        plotId: plot?.id?.toString(),
                                        farmId: farmId.toString(),
                                        stage: hole.manualStage || calculateGrowthStage(new Date(hole.plantedDate)),
                                        date: new Date(),
                                        plantHealth: hole.plantHealth,
                                        currentSuckerCount: hole.currentSuckerCount ?? (hole.suckerIds?.length ?? 0),
                                        notes: hole.notes || "",
                                      }}
                                      farms={farms}
                                      plots={plots}
                                      users={users}
                                      hole={hole}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      {/* Record Growth Button */}
      <div className="mt-8 flex justify-center">
        <GrowthFormModal
          mode="bulk"
          trigger={
            <Button className="px-6 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
              Record Growth for {plot?.name || "Plot"}
            </Button>
          }
          initialValues={{ plotId: plot?.id?.toString(), farmId: farmId.toString() }}
          bulkSummary={{
            plotName: plot?.name || "Plot",
            plantCount: rows.reduce((acc: number, row: any) => acc + row.holes.filter((h: any) => h.status === "PLANTED").length, 0)
          }}
          farms={farms}
          plots={plots}
          users={users}
        />
      </div>
    </div>
  )
}