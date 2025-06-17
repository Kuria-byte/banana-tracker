"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface TaskFilterProps {
  onFilterChange: (filters: {
    search: string
    status: string
    priority: string
    type: string
    year: string
    farmId: string
    plotId: string
  }) => void
  farms: { id: string; name: string }[]
  plots: { id: string; name: string; farmId: string }[]
}

export function TaskFilter({ onFilterChange, farms, plots }: TaskFilterProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [type, setType] = useState("")
  const [year, setYear] = useState("")
  const [farmId, setFarmId] = useState("")
  const [plotId, setPlotId] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter plots by selected farm
  const filteredPlots = farmId ? plots.filter((p) => p.farmId === farmId) : plots

  // Fix year options: generate from current year to 5 years back
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString())

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, status, priority, type, year, farmId, plotId })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFilterChange({ search, status: value, priority, type, year, farmId, plotId })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    onFilterChange({ search, status, priority: value, type, year, farmId, plotId })
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    onFilterChange({ search, status, priority, type: value, year, farmId, plotId })
  }

  const handleYearChange = (value: string) => {
    setYear(value)
    onFilterChange({ search, status, priority, type, year: value, farmId, plotId })
  }

  const handleFarmChange = (value: string) => {
    setFarmId(value)
    setPlotId("") // Reset plot when farm changes
    onFilterChange({ search, status, priority, type, year, farmId: value, plotId: "" })
  }

  const handlePlotChange = (value: string) => {
    setPlotId(value)
    onFilterChange({ search, status, priority, type, year, farmId, plotId: value })
  }

  const handleReset = () => {
    setSearch("")
    setStatus("")
    setPriority("")
    setType("")
    setYear("")
    setFarmId("")
    setPlotId("")
    onFilterChange({ search: "", status: "", priority: "", type: "", year: "", farmId: "", plotId: "" })
    setIsFilterOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tasks..." className="pl-8" value={search} onChange={handleSearchChange} />
      </div>
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex gap-2 sm:w-auto">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Tasks</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
       

            <div className="space-y-2">
              <label className="text-sm font-medium">Farm</label>
              <Select value={farmId} onValueChange={handleFarmChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All farms" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectItem value="all">All farms</SelectItem>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Planting">Planting</SelectItem>
                  <SelectItem value="Harvesting">Harvesting</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Input Application">Input Application</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
           
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Plot</label>
              <Select value={plotId} onValueChange={handlePlotChange} disabled={!farmId}>
                <SelectTrigger>
                  <SelectValue placeholder="All plots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plots</SelectItem>
                  {filteredPlots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>{plot.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
            <Button onClick={handleReset} variant="outline" className="mt-2">
              Reset Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
