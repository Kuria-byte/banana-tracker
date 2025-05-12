"use client"

import { useState, useEffect } from "react"

import { FarmFilter } from "@/components/farms/farm-filter"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  Filter, 
  Search,
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  BarChart3
} from "lucide-react"
import { FarmFormModal } from "@/components/modals/farm-form-modal"
import { FarmHealthDashboard } from "@/components/farms/farm-health-dashboard"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { FarmCard } from "@/components/farms/farm-card"
import { getFarmsHealthStatusFromPlots, getFarmsWithUnresolvedIssuesFromPlots } from "@/app/actions/farm-health-actions"

function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function FarmsClient({ farms, users }: { farms: any[], users: any[] }) {
  const [filteredFarms, setFilteredFarms] = useState(farms)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'area' | 'established'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [activeFilters, setActiveFilters] = useState<{
    search: string
    location: string
    healthStatus: string
  }>({
    search: '',
    location: '',
    healthStatus: ''
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [farmHealth, setFarmHealth] = useState<{ [farmId: string]: string }>({})
  const [attentionFarms, setAttentionFarms] = useState<string[]>([])
  const [healthStats, setHealthStats] = useState({
    good: 0,
    average: 0,
    poor: 0,
    notAssessed: 0,
    total: 0
  })

  // Fetch farm health and attention required on mount
  useEffect(() => {
    async function fetchHealthAndIssues() {
      const healthResults = await getFarmsHealthStatusFromPlots()
      const healthMap: { [farmId: string]: string } = {}
      let good = 0, average = 0, poor = 0, notAssessed = 0
      healthResults.forEach(({ farmId, healthStatus }) => {
        healthMap[farmId] = healthStatus
        if (healthStatus === "Good") good++
        else if (healthStatus === "Average") average++
        else if (healthStatus === "Poor") poor++
        else notAssessed++
      })
      setFarmHealth(healthMap)
      setHealthStats({ good, average, poor, notAssessed, total: healthResults.length })

      const unresolved = await getFarmsWithUnresolvedIssuesFromPlots()
      setAttentionFarms(Object.keys(unresolved))
    }
    fetchHealthAndIssues()
  }, [])

  // Apply sorting and filtering
  useEffect(() => {
    let result = [...farms]

    // Apply filters
    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase()
      result = result.filter(
        (farm) => farm.name.toLowerCase().includes(searchLower) || farm.location.toLowerCase().includes(searchLower),
      )
    }

    if (activeFilters.location && activeFilters.location !== "all") {
      result = result.filter((farm) => farm.location.includes(activeFilters.location))
    }

    if (activeFilters.healthStatus && activeFilters.healthStatus !== "all") {
      result = result.filter((farm) => farmHealth[farm.id] === activeFilters.healthStatus)
    }

    // Apply sorting
    result = result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name)
      } else if (sortBy === 'health') {
        // Convert health status to numeric value for sorting
        const healthValue = (status: string) => {
          if (status === 'Good') return 3
          if (status === 'Average') return 2
          if (status === 'Poor') return 1
          return 0
        }
        
        return sortOrder === 'asc'
          ? healthValue(farmHealth[a.id] || "Not Assessed") - healthValue(farmHealth[b.id] || "Not Assessed")
          : healthValue(farmHealth[b.id] || "Not Assessed") - healthValue(farmHealth[a.id] || "Not Assessed")
      } else if (sortBy === 'area') {
        return sortOrder === 'asc'
          ? a.area - b.area
          : b.area - a.area
      } else if (sortBy === 'established') {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
        return sortOrder === 'asc'
          ? dateA - dateB
          : dateB - dateA
      }
      
      return 0
    })

    setFilteredFarms(result)
  }, [farms, activeFilters, sortBy, sortOrder, farmHealth])

  const handleFilterChange = (filters: {
    search: string
    location: string
    healthStatus: string
  }) => {
    setActiveFilters(filters)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const clearFilters = () => {
    setActiveFilters({
      search: '',
      location: '',
      healthStatus: ''
    })
  }

  // Get all unique locations for filter options
  const locations = [...new Set(farms.map(farm => farm.location))].sort()

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farms</h1>
          <p className="text-muted-foreground">Manage and monitor all your banana plantations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="md:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <FarmFormModal
            trigger={
              <Button className="sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Farm
              </Button>
            }
            title="Add New Farm"
            description="Create a new banana plantation"
            users={users}
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="mb-8">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">Farm List</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Farm Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farms.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total farms across {locations.length} regions
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between space-x-2 rounded-md border px-2 py-1">
                    <span className="text-muted-foreground">Total Area</span>
                    <span className="font-medium">
                      {farms.reduce((sum, farm) => sum + (farm.area || 0), 0).toFixed(1)} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 rounded-md border px-2 py-1">
                    <span className="text-muted-foreground">Avg. Size</span>
                    <span className="font-medium">
                      {(farms.reduce((sum, farm) => sum + (farm.area || 0), 0) / Math.max(farms.length, 1)).toFixed(1)} acres
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round((healthStats.good / Math.max(healthStats.total, 1)) * 100)}%
                  </div>
                  <div className="flex gap-1">
                    {/* <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200">
                      Good
                    </Badge> */}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {healthStats.good} farms in good health
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <span className="flex-1">Good</span>
                    <span>{healthStats.good} farms</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ 
                        width: `${(healthStats.good / Math.max(healthStats.total, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className="flex-1">Average</span>
                    <span>{healthStats.average} farms</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ 
                        width: `${(healthStats.average / Math.max(healthStats.total, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className="flex-1">Poor</span>
                    <span>{healthStats.poor} farms</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ 
                        width: `${(healthStats.poor / Math.max(healthStats.total, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attention Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{healthStats.poor}</div>
                <p className="text-xs text-muted-foreground">
                  Farms requiring immediate attention
                </p>
                
                {healthStats.poor > 0 ? (
                  <div className="mt-4 space-y-3">
                    {farms
                      .filter(farm => attentionFarms.includes(farm.id))
                      .slice(0, 3)
                      .map(farm => (
                        <div key={farm.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{farm.name}</span>
                          </div>
                          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200">
                            Poor
                          </Badge>
                        </div>
                    ))}
                    
                    {healthStats.poor > 3 && (
                      <div className="text-center text-xs text-muted-foreground">
                        +{healthStats.poor - 3} more with health issues
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-green-800 dark:text-green-400 text-sm border border-green-100 dark:border-green-800">
                    All farms are in good or average condition!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6">
            {/* <FarmHealthDashboard farms={farms} /> */}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Mobile filters dialog */}
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsFilterOpen(false)}>
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 p-4 rounded-t-lg"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-lg font-medium mb-4">Filters</h3>
                  <FarmFilter onFilterChange={handleFilterChange} />
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setIsFilterOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Desktop filters */}
            <div className="w-full md:w-64 hidden md:block">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search farms..."
                      className="pl-8"
                      value={activeFilters.search}
                      onChange={(e) => handleFilterChange({...activeFilters, search: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Location</h3>
                  <div className="space-y-2">
                    <Button
                      variant={activeFilters.location === '' ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => handleFilterChange({...activeFilters, location: ''})}
                    >
                      All
                    </Button>
                    {locations.map((location) => (
                      <Button
                        key={location}
                        variant={activeFilters.location === location ? "default" : "outline"}
                        size="sm"
                        className="mr-2 mb-2"
                        onClick={() => handleFilterChange({...activeFilters, location})}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Health</h3>
                  <div className="space-y-2">
                    <Button
                      variant={activeFilters.healthStatus === '' ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => handleFilterChange({...activeFilters, healthStatus: ''})}
                    >
                      All
                    </Button>
                    <Button
                      variant={activeFilters.healthStatus === 'Good' ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => handleFilterChange({...activeFilters, healthStatus: 'Good'})}
                    >
                      Good
                    </Button>
                    <Button
                      variant={activeFilters.healthStatus === 'Average' ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => handleFilterChange({...activeFilters, healthStatus: 'Average'})}
                    >
                      Average
                    </Button>
                    <Button
                      variant={activeFilters.healthStatus === 'Poor' ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => handleFilterChange({...activeFilters, healthStatus: 'Poor'})}
                    >
                      Poor
                    </Button>
                  </div>
                </div>
                
                {(activeFilters.location || activeFilters.healthStatus || activeFilters.search) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">
                    Farms 
                    {filteredFarms.length !== farms.length && (
                      <Badge variant="outline" className="ml-2">
                        {filteredFarms.length} of {farms.length}
                      </Badge>
                    )}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="mr-2 h-3 w-3" />
                        Sort
                        <ChevronDown className="ml-2 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                        Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
                        Name (Z-A)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('health'); setSortOrder('desc'); }}>
                        Health (Best first)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('health'); setSortOrder('asc'); }}>
                        Health (Issues first)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('area'); setSortOrder('desc'); }}>
                        Area (Largest first)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('area'); setSortOrder('asc'); }}>
                        Area (Smallest first)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('established'); setSortOrder('desc'); }}>
                        Newest first
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('established'); setSortOrder('asc'); }}>
                        Oldest first
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="hidden sm:flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setViewMode('map')}
                    >
                      <MapIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
              
              {filteredFarms.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground mb-2">No farms match your filters</p>
                  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFarms.map((farm) => {
                    const establishedDate = formatDate(farm.createdAt || farm.created_at);
                    const holes = farm.numberOfHoles;
                    const numberOfPlots = farm.numberOfPlots;
                    return (
                      <FarmCard 
                        key={farm.id} 
                        farm={farm} 
                        // establishedDate={establishedDate} 
                        holes={holes} 
                        numberOfPlots={numberOfPlots}
                        healthStatus={farmHealth[farm.id] || "Not Assessed"}
                      />
                    )
                  })}
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-2">
                  {filteredFarms.map((farm) => {
                    const establishedDate = formatDate(farm.createdAt || farm.created_at);
                    const holes = farm.numberOfHoles;
                    const numberOfPlots = farm.numberOfPlots;
                    return (
                      <FarmCard 
                        key={farm.id} 
                        farm={farm} 
                        establishedDate={establishedDate} 
                        holes={holes}
                        numberOfPlots={numberOfPlots}
                        isCompact={true}
                        healthStatus={farmHealth[farm.id] || "Not Assessed"}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="border rounded-lg p-6 text-center bg-slate-50 dark:bg-slate-900">
                  <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Map View</h3>
                  <p className="text-muted-foreground mb-4">
                    Geographic view of your farms is coming soon!
                  </p>
                  <Button onClick={() => setViewMode('grid')}>Return to Grid View</Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}