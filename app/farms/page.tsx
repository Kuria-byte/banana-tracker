"use client"

import { useState } from "react"
import { farms } from "@/lib/mock-data"
import { FarmCard } from "@/components/farms/farm-card"
import { FarmFilter } from "@/components/farms/farm-filter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FarmFormModal } from "@/components/modals/farm-form-modal"

export default function FarmsPage() {
  const [filteredFarms, setFilteredFarms] = useState(farms)

  const handleFilterChange = (filters: {
    search: string
    location: string
    healthStatus: string
  }) => {
    let result = [...farms]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (farm) => farm.name.toLowerCase().includes(searchLower) || farm.location.toLowerCase().includes(searchLower),
      )
    }

    if (filters.location && filters.location !== "all") {
      result = result.filter((farm) => farm.location.includes(filters.location))
    }

    if (filters.healthStatus && filters.healthStatus !== "all") {
      result = result.filter((farm) => farm.healthStatus === filters.healthStatus)
    }

    setFilteredFarms(result)
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farms</h1>
          <p className="text-muted-foreground">Manage and monitor all your banana plantations</p>
        </div>
        <FarmFormModal
          trigger={
            <Button className="sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Farm
            </Button>
          }
          title="Add New Farm"
          description="Create a new banana plantation"
        />
      </div>

      <div className="mb-6">
        <FarmFilter onFilterChange={handleFilterChange} />
      </div>

      {filteredFarms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No farms match your filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFarms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}
    </div>
  )
}
