"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface TaskFilterProps {
  onFilterChange: (filters: {
    search: string
    status: string
    priority: string
    type: string
    year: string
    month: string
    farmId: string
    plotId: string
  }) => void
  farms: { id: string; name: string }[]
  plots: { id: string; name: string; farmId: string }[]
}

export function TaskFilter({ onFilterChange, farms, plots }: TaskFilterProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [type, setType] = useState("all")
  const [year, setYear] = useState("all")
  const [month, setMonth] = useState("all")
  const [farmId, setFarmId] = useState("all")
  const [plotId, setPlotId] = useState("all")
  const [isOpen, setIsOpen] = useState(false)

  // Filter plots by selected farm
  const filteredPlots = farmId && farmId !== "all" ? plots.filter((p) => p.farmId === farmId) : plots

  // Generate year options (last 5 years + current + next 2)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, i) => (currentYear - 5 + i).toString())
  
  // Month options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const triggerFilterChange = () => {
    onFilterChange({ search, status, priority, type, year, month, farmId, plotId })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, status, priority, type, year, month, farmId, plotId })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFilterChange({ search, status: value, priority, type, year, month, farmId, plotId })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    onFilterChange({ search, status, priority: value, type, year, month, farmId, plotId })
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    onFilterChange({ search, status, priority, type: value, year, month, farmId, plotId })
  }

  const handleYearChange = (value: string) => {
    setYear(value)
    onFilterChange({ search, status, priority, type, year: value, month, farmId, plotId })
  }

  const handleMonthChange = (value: string) => {
    setMonth(value)
    onFilterChange({ search, status, priority, type, year, month: value, farmId, plotId })
  }

  const handleFarmChange = (value: string) => {
    setFarmId(value)
    setPlotId("all") // Reset plot when farm changes
    onFilterChange({ search, status, priority, type, year, month, farmId: value, plotId: "all" })
  }

  const handlePlotChange = (value: string) => {
    setPlotId(value)
    onFilterChange({ search, status, priority, type, year, month, farmId, plotId: value })
  }

  const handleReset = () => {
    setSearch("")
    setStatus("all")
    setPriority("all")
    setType("all")
    setYear("all")
    setMonth("all")
    setFarmId("all")
    setPlotId("all")
    onFilterChange({ 
      search: "", 
      status: "all", 
      priority: "all", 
      type: "all", 
      year: "all",
      month: "all",
      farmId: "all", 
      plotId: "all" 
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tasks..." className="pl-8" value={search} onChange={handleSearchChange} />
      </div>
      
      <div className="flex justify-center sm:justify-end">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="default" className="flex gap-2 min-w-[100px] justify-center sm:justify-start">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sm:inline">Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[400px]">
            <SheetHeader className="space-y-1">
              <SheetTitle>Filter Tasks</SheetTitle>
            </SheetHeader>
            
            <div className="grid gap-6 py-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Priority</label>
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
              </div>

              {/* Task Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Task Type</label>
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
              </div>

              {/* Date Filters */}
              <div className="space-y-4">
                <label className="text-sm font-medium leading-none">Due Date</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Year</label>
                    <Select value={year} onValueChange={handleYearChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any year</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Month</label>
                    <Select value={month} onValueChange={handleMonthChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any month</SelectItem>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Farm Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Farm</label>
                <Select value={farmId} onValueChange={handleFarmChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All farms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All farms</SelectItem>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Plot Filter - Only show if farm is selected */}
              {farmId && farmId !== "all" && filteredPlots.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Plot</label>
                  <Select value={plotId} onValueChange={handlePlotChange}>
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
                </div>
              )}

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={handleReset} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
