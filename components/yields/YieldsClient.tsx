"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, TooltipProps } from "recharts"
import { Calendar, LineChart, ArrowUpDown, Banana, Package, BarChart2, Filter, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface YieldsClientProps {
  harvests: any[]
  farms: any[]
  plots: any[]
  totalYield: number
  totalBunches: number
  avgQuality: number
  chartData: { month: string; weight: number }[]
}

const QUALITY_OPTIONS = ["Good", "Average", "Poor"]

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const monthDate = new Date(label);
    const formattedMonth = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium text-sm">{formattedMonth}</p>
        <p className="text-primary font-bold">{`${payload[0].value.toLocaleString()} kg`}</p>
      </div>
    );
  }
  return null;
};

export default function YieldsClient({ harvests, farms, plots, totalYield, totalBunches, avgQuality, chartData }: YieldsClientProps) {
  const [sortKey, setSortKey] = useState<string>("harvestDate")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selectedFarm, setSelectedFarm] = useState<string>("all")
  const [selectedPlot, setSelectedPlot] = useState<string>("all")
  const [selectedQuality, setSelectedQuality] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // Filter plots by selected farm
  const filteredPlots = selectedFarm !== "all" ? plots.filter(p => String(p.farmId) === selectedFarm) : plots

  // Filter harvests
  const filteredHarvests = harvests.filter(h => {
    if (selectedFarm !== "all" && String(h.farmId) !== selectedFarm) return false
    if (selectedPlot !== "all" && String(h.plotId) !== selectedPlot) return false
    if (selectedQuality !== "all" && h.qualityRating !== selectedQuality) return false
    if (dateFrom && new Date(h.harvestDate) < new Date(dateFrom)) return false
    if (dateTo && new Date(h.harvestDate) > new Date(dateTo)) return false
    return true
  })

  // Derived stats from filtered harvests
  const filteredTotalYield = filteredHarvests.reduce((sum, h) => sum + Number(h.totalWeight || 0), 0)
  const filteredTotalBunches = filteredHarvests.reduce((sum, h) => sum + Number(h.bunchCount || 0), 0)
  const filteredAvgQuality = filteredHarvests.length > 0 
    ? (filteredHarvests.reduce((sum, h) => sum + (h.qualityRating === "Good" ? 1 : h.qualityRating === "Average" ? 0.5 : 0), 0) / filteredHarvests.length) 
    : 0

  // Chart data for filtered harvests
  const yieldByMonth: Record<string, number> = {}
  filteredHarvests.forEach(h => {
    const date = new Date(h.harvestDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    yieldByMonth[key] = (yieldByMonth[key] || 0) + Number(h.totalWeight || 0)
  })
  const filteredChartData = Object.entries(yieldByMonth)
    .map(([month, weight]) => ({ month, weight }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Sort harvests
  const sortedHarvests = [...filteredHarvests].sort((a, b) => {
    let aVal = a[sortKey]
    let bVal = b[sortKey]
    if (sortKey === "harvestDate") {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1
    return 0
  })

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  // Reset plot when farm changes
  function handleFarmChange(value: string) {
    setSelectedFarm(value)
    setSelectedPlot("all")
  }

  const getQualityColor = (quality: string) => {
    const q = quality.toUpperCase();
    if (q === "GOOD" || q === "EXCELLENT") return "bg-green-100 text-green-800 border-green-200";
    if (q === "AVERAGE") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="container max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Harvest & Yield Analytics</h1>
          <p className="text-muted-foreground mt-1">Track and analyze farm productivity metrics</p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="mb-8 border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Filter Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="farm" className="text-xs">Farm</Label>
              <Select value={selectedFarm} onValueChange={handleFarmChange}>
                <SelectTrigger id="farm" className="w-full">
                  <SelectValue placeholder="All Farms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farms</SelectItem>
                  {farms.map(farm => (
                    <SelectItem key={farm.id} value={String(farm.id)}>{farm.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="plot" className="text-xs">Plot</Label>
              <Select value={selectedPlot} onValueChange={setSelectedPlot}>
                <SelectTrigger id="plot" className="w-full">
                  <SelectValue placeholder="All Plots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plots</SelectItem>
                  {filteredPlots.map(plot => (
                    <SelectItem key={plot.id} value={String(plot.id)}>{plot.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="quality" className="text-xs">Quality</Label>
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger id="quality" className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {QUALITY_OPTIONS.map(q => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="dateFrom" className="text-xs">From</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="dateTo" className="text-xs">To</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          
          {(selectedFarm !== "all" || selectedPlot !== "all" || selectedQuality !== "all" || dateFrom || dateTo) && (
            <div className="flex items-center mt-4 pt-2 border-t">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline" className="bg-primary/10 border-primary/20">
                  {filteredHarvests.length} records
                </Badge>
                {selectedFarm !== "all" && (
                  <Badge variant="outline" className="bg-slate-100">
                    Farm: {farms.find(f => String(f.id) === selectedFarm)?.name}
                  </Badge>
                )}
                {selectedPlot !== "all" && (
                  <Badge variant="outline" className="bg-slate-100">
                    Plot: {plots.find(p => String(p.id) === selectedPlot)?.name}
                  </Badge>
                )}
                {selectedQuality !== "all" && (
                  <Badge variant="outline" className="bg-slate-100">
                    Quality: {selectedQuality}
                  </Badge>
                )}
                {dateFrom && (
                  <Badge variant="outline" className="bg-slate-100">
                    From: {new Date(dateFrom).toLocaleDateString()}
                  </Badge>
                )}
                {dateTo && (
                  <Badge variant="outline" className="bg-slate-100">
                    To: {new Date(dateTo).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="transition-all hover:shadow-md border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Banana className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Total Yield</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredTotalYield.toLocaleString()} kg</div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredHarvests.length === harvests.length ? "All time" : "Filtered results"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Total Bunches</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredTotalBunches.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredHarvests.length === harvests.length ? "All time" : "Filtered results"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Average Quality</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">
                {filteredAvgQuality >= 0.8 ? "Good" : filteredAvgQuality >= 0.5 ? "Average" : "Poor"}
              </div>
              <Badge variant="outline" className={cn("ml-2", getQualityColor(filteredAvgQuality >= 0.8 ? "Good" : filteredAvgQuality >= 0.5 ? "Average" : "Poor"))}>
                {Math.round(filteredAvgQuality * 100)}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Based on {filteredHarvests.length} harvests</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8 border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            <CardTitle>Yield Trend (Monthly)</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal">
            {filteredChartData.length} months
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {filteredChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.toLocaleDateString('en-US', { month: 'short' })}-${String(date.getFullYear()).substring(2)}`;
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => value.toLocaleString()}
                    tick={{ fontSize: 12 }}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="weight" 
                    fill="#10b981" 
                    name="Yield (kg)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BarChart2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-center">No yield data available for the selected filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Harvest Records</CardTitle>
            </div>
            <Badge variant="outline" className="font-normal">
              {sortedHarvests.length} records
            </Badge>
          </div>
          <CardDescription>Complete list of harvest records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("harvestDate")}
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Date
                      {sortKey === "harvestDate" && (
                        <ChevronDown className={cn(
                          "ml-1 h-4 w-4",
                          sortDir === "desc" ? "transform rotate-180" : ""
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("farmId")}
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Farm
                      {sortKey === "farmId" && (
                        <ChevronDown className={cn(
                          "ml-1 h-4 w-4",
                          sortDir === "desc" ? "transform rotate-180" : ""
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("plotId")}
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Plot
                      {sortKey === "plotId" && (
                        <ChevronDown className={cn(
                          "ml-1 h-4 w-4",
                          sortDir === "desc" ? "transform rotate-180" : ""
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("bunchCount")}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-right"
                  >
                    <div className="flex items-center justify-end">
                      Bunches
                      {sortKey === "bunchCount" && (
                        <ChevronDown className={cn(
                          "ml-1 h-4 w-4",
                          sortDir === "desc" ? "transform rotate-180" : ""
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("totalWeight")}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-right"
                  >
                    <div className="flex items-center justify-end">
                      Weight (kg)
                      {sortKey === "totalWeight" && (
                        <ChevronDown className={cn(
                          "ml-1 h-4 w-4",
                          sortDir === "desc" ? "transform rotate-180" : ""
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("qualityRating")}
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center">
                      Quality
                      {sortKey === "qualityRating" && (
                        <ChevronDown className={cn(
                          "ml-1 h-4 w-4",
                          sortDir === "desc" ? "transform rotate-180" : ""
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHarvests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-52 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground mb-1">No harvest records found</p>
                        <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedHarvests.map(h => (
                    <TableRow key={h.id} className="group hover:bg-slate-50">
                      <TableCell className="font-medium">
                        {h.harvestDate ? new Date(h.harvestDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : "-"}
                      </TableCell>
                      <TableCell>{farms.find(f => String(f.id) === String(h.farmId))?.name || h.farmId}</TableCell>
                      <TableCell>{plots.find(p => String(p.id) === String(h.plotId))?.name || h.plotId || "-"}</TableCell>
                      <TableCell className="text-right">{h.bunchCount}</TableCell>
                      <TableCell className="text-right font-medium">{Number(h.totalWeight).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(getQualityColor(h.qualityRating))}>
                          {h.qualityRating}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {Array.isArray(h.harvestTeam) ? h.harvestTeam.join(", ") : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-sm">{h.notes || "-"}</div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}