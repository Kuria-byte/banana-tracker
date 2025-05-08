"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  LayoutGrid,
  List,
  Edit,
  ChevronDown,
  ChevronUp,
  TreesIcon as Plant,
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import type { RowData, HoleData } from "@/lib/types/plot"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"

interface RowClientProps {
  rows: RowData[];
  plotId: string;
}

export default function RowClient({ rows, plotId }: RowClientProps) {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const farmId = params.id as string
  const initialRowId = searchParams.get("row")

  const [activeTab, setActiveTab] = useState("list")
  const [selectedRowId, setSelectedRowId] = useState<string | null>(initialRowId)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [selectedHoles, setSelectedHoles] = useState<string[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(
    rows.length > 0 ? rows[0].rowNumber : null
  )

  useEffect(() => {
    if (rows.length > 0 && selectedRowNumber === null) {
      setSelectedRowNumber(rows[0].rowNumber)
    }
  }, [rows, selectedRowNumber])

  const selectedRow = selectedRowNumber ? rows.find((r) => r.rowNumber === selectedRowNumber) : null
  const holes: HoleData[] = selectedRow?.holes || []

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
  }

  const handleRowSelect = (rowId: string) => {
    setSelectedRowId(rowId)
    if (activeTab === "visual") {
      drawVisualLayout()
    }
  }

  const toggleHoleSelection = (holeId: string) => {
    setSelectedHoles((prev) => (prev.includes(holeId) ? prev.filter((id) => id !== holeId) : [...prev, holeId]))
  }

  const getStatusColor = (status: HoleData["status"]) => {
    switch (status) {
      case "EMPTY":
        return "bg-gray-200"
      case "PLANTED":
        return "bg-green-100"
      case "HARVESTED":
        return "bg-amber-100"
      default:
        return "bg-gray-200"
    }
  }

  const getHealthColor = (health?: HoleData["plantHealth"]) => {
    if (!health) return ""

    switch (health) {
      case "Healthy":
        return "bg-green-500"
      case "Diseased":
        return "bg-red-500"
      case "Pest-affected":
        return "bg-orange-500"
      case "Damaged":
        return "bg-yellow-500"
      default:
        return ""
    }
  }

  const getHealthIcon = (health?: HoleData["plantHealth"]) => {
    if (!health) return null

    switch (health) {
      case "Healthy":
        return <Check className="h-3 w-3" />
      case "Diseased":
        return <X className="h-3 w-3" />
      case "Pest-affected":
        return <AlertCircle className="h-3 w-3" />
      case "Damaged":
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const drawVisualLayout = () => {
    if (!selectedRow || !canvasRef.current || !containerRef.current) return
    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Set canvas size to match container
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 300
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Assume horizontal for now (or add orientation to Row type if needed)
    const isHorizontal = true
    const rowLength = Number(selectedRow.length) * 10 // Scale meters to pixels
    const holeSpacing = Number(selectedRow.spacing) * 10 // Scale meters to pixels
    // Draw the row line
    ctx.beginPath()
    ctx.strokeStyle = "#6b7280" // gray-500
    ctx.lineWidth = 2
    if (isHorizontal) {
      const y = canvas.height / 2
      ctx.moveTo(50, y)
      ctx.lineTo(50 + rowLength, y)
    } else {
      const x = canvas.width / 2
      ctx.moveTo(x, 50)
      ctx.lineTo(x, 50 + rowLength)
    }
    ctx.stroke()
    // Draw the holes
    const rowHoles: HoleData[] = selectedRow.holes || []
    rowHoles.forEach((hole: HoleData) => {
      const holeNumber = hole.holeNumber
      let x, y
      if (isHorizontal) {
        x = 50 + (holeNumber - 1) * holeSpacing
        y = canvas.height / 2
      } else {
        x = canvas.width / 2
        y = 50 + (holeNumber - 1) * holeSpacing
      }
      // Draw hole background
      ctx.beginPath()
      ctx.fillStyle = hole.status === "EMPTY" ? "#e5e7eb" : hole.status === "PLANTED" ? "#d1fae5" : "#fef3c7"
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fill()
      // Draw hole border
      ctx.beginPath()
      ctx.strokeStyle = "#4b5563" // gray-600
      ctx.lineWidth = 1
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.stroke()
      // Draw health indicator if planted
      if (hole.status === "PLANTED" && hole.plantHealth) {
        let healthColor
        switch (hole.plantHealth) {
          case "Healthy":
            healthColor = "#10b981"
            break // green-500
          case "Diseased":
            healthColor = "#ef4444"
            break // red-500
          case "Pest-affected":
            healthColor = "#f97316"
            break // orange-500
          case "Damaged":
            healthColor = "#eab308"
            break // yellow-500
          default:
            healthColor = "#6b7280" // gray-500
        }
        ctx.beginPath()
        ctx.fillStyle = healthColor
        ctx.arc(x, y - 15, 5, 0, Math.PI * 2)
        ctx.fill()
      }
      // Draw hole number
      ctx.fillStyle = "#1f2937" // gray-800
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(holeNumber.toString(), x, y)
    })
  }

  useEffect(() => {
    if (activeTab === "visual" && selectedRow) {
      drawVisualLayout()
      // Handle window resize
      const handleResize = () => {
        drawVisualLayout()
      }
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [activeTab, selectedRow, selectedRowId])

  if (!rows || rows.length === 0) {
    return (
      <div className="container px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No rows found for this plot</h1>
          <Button asChild>
            <Link href={`/farms/${farmId}/plots/${plotId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plot
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-2 p-2">
          <Link href={`/farms/${farmId}/plots/${plotId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plot
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Row Management</h1>
            <p className="text-muted-foreground">Manage rows and holes for this plot</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list" className="flex items-center">
            <List className="mr-2 h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Visual Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {rows.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No rows available for this plot</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Row
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {rows.map((row) => (
                <Card key={row.rowNumber} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Row {row.rowNumber}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleRow(row.rowNumber.toString())}>
                          {expandedRows[row.rowNumber.toString()] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">{expandedRows[row.rowNumber.toString()] ? "Collapse" : "Expand"}</span>
                        </Button>
                        <Button
                          variant={selectedRowId === row.rowNumber.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRowSelect(row.rowNumber.toString())}
                          className="ml-1"
                        >
                          {selectedRowId === row.rowNumber.toString() ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Length</p>
                        <p className="font-medium">{row.length} m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spacing</p>
                        <p className="font-medium">{row.spacing} m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Holes</p>
                        <p className="font-medium">{row.holes.length}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit Row
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Plant className="mr-2 h-3 w-3" />
                        Manage Holes
                      </Button>
                    </div>

                    {expandedRows[row.rowNumber.toString()] && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Holes ({row.holes.length})</h4>
                          <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-3 w-3" />
                            Add Hole
                          </Button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {row.holes.slice(0, 10).map((holeData, i) => {
                            if (!holeData) return null

                            return (
                              <div
                                key={i}
                                className={cn(
                                  "aspect-square rounded-full flex flex-col items-center justify-center text-xs font-medium relative",
                                  getStatusColor(holeData.status),
                                )}
                              >
                                {holeData.plantHealth && (
                                  <div
                                    className={cn(
                                      "absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center",
                                      getHealthColor(holeData.plantHealth),
                                    )}
                                  >
                                    {getHealthIcon(holeData.plantHealth)}
                                  </div>
                                )}
                                {holeData.holeNumber}
                              </div>
                            )
                          })}
                          {row.holes.length > 10 && (
                            <div className="aspect-square rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                              +{row.holes.length - 10}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle>Visual Layout</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {rows.map((row) => (
                    <Button
                      key={row.rowNumber}
                      size="sm"
                      variant={selectedRowId === row.rowNumber.toString() ? "default" : "outline"}
                      onClick={() => handleRowSelect(row.rowNumber.toString())}
                    >
                      Row {row.rowNumber}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedRow ? (
                <div>
                  <div className="bg-white p-4 rounded-lg border mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Row Number</p>
                        <p className="font-medium">{selectedRow.rowNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Length</p>
                        <p className="font-medium">{selectedRow.length} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spacing</p>
                        <p className="font-medium">{selectedRow.holes.length} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Holes</p>
                        <p className="font-medium">{selectedRow.holes.length}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit Row
                      </Button>
                      <Button size="sm">
                        <Plant className="mr-2 h-3 w-3" />
                        Manage Holes
                      </Button>
                    </div>
                  </div>

                  <div ref={containerRef} className="w-full overflow-x-auto">
                    <canvas ref={canvasRef} className="border rounded-md min-h-[300px] min-w-full" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
                      <span className="text-sm">Empty</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-100 mr-2"></div>
                      <span className="text-sm">Planted</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-amber-100 mr-2"></div>
                      <span className="text-sm">Harvested</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-sm ml-2">Healthy</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Select a row to view its visual layout</p>
                  {rows.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {rows.slice(0, 5).map((row) => (
                        <Button key={row.rowNumber} onClick={() => handleRowSelect(row.rowNumber.toString())} size="sm">
                          Row {row.rowNumber}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Row
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
