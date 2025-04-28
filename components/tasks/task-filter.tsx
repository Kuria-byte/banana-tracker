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
  }) => void
}

export function TaskFilter({ onFilterChange }: TaskFilterProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [type, setType] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, status, priority, type })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFilterChange({ search, status: value, priority, type })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    onFilterChange({ search, status, priority: value, type })
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    onFilterChange({ search, status, priority, type: value })
  }

  const handleReset = () => {
    setSearch("")
    setStatus("")
    setPriority("")
    setType("")
    onFilterChange({ search: "", status: "", priority: "", type: "" })
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
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
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
            </div>
            <Button onClick={handleReset} variant="outline" className="mt-2">
              Reset Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
