"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface FarmFilterProps {
  onFilterChange: (filters: {
    search: string
    location: string
    healthStatus: string
  }) => void
}

export function FarmFilter({ onFilterChange }: FarmFilterProps) {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [healthStatus, setHealthStatus] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, location, healthStatus })
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    onFilterChange({ search, location: value, healthStatus })
  }

  const handleHealthStatusChange = (value: string) => {
    setHealthStatus(value)
    onFilterChange({ search, location, healthStatus: value })
  }

  const handleReset = () => {
    setSearch("")
    setLocation("")
    setHealthStatus("")
    onFilterChange({ search: "", location: "", healthStatus: "" })
    setIsFilterOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search farms..." className="pl-8" value={search} onChange={handleSearchChange} />
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
            <SheetTitle>Filter Farms</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={location} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="Karii">Karii</SelectItem>
                  <SelectItem value="Kangai">Kangai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Health Status</label>
              <Select value={healthStatus} onValueChange={handleHealthStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
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
