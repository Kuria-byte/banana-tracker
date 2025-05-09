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
  Loader2,
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
  const [isLoading, setIsLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [selectedHoles, setSelectedHoles] = useState<string[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Initialize selectedRowNumber based on initialRowId or the first row
  const [selectedRowNumber, setSelectedRowNumber] = useState<number>(() => {
    if (initialRowId) {
      const parsed = parseInt(initialRowId, 10);
      return isNaN(parsed) ? (rows.length > 0 ? rows[0].rowNumber : 1) : parsed;
    }
    return rows.length > 0 ? rows[0].rowNumber : 1;
  });

  // Get the currently selected row based on selectedRowNumber
  const selectedRow = rows.find(r => r.rowNumber === selectedRowNumber) || 
                      (rows.length > 0 ? rows[0] : null);
                      
  const holes = selectedRow?.holes || [];

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
  }

  // Improved row selection with loading state
  const handleRowSelect = (rowId: string) => {
    const rowNumber = parseInt(rowId, 10);
    
    // Don't re-select the same row
    if (rowNumber === selectedRowNumber) return;
    
    // Start loading state
    setIsLoading(true);
    
    // Update URL to reflect the selected row
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('row', rowId);
    router.replace(`${window.location.pathname}?${newParams.toString()}`, { scroll: false });
    
    // Set the selected row with a slight delay to show loading state
    setTimeout(() => {
      setSelectedRowNumber(rowNumber);
      
      // End loading after a short delay
      setTimeout(() => {
        setIsLoading(false);
        
        // Trigger visual layout redraw after state updates are complete
        if (activeTab === "visual") {
          setTimeout(() => {
            drawVisualLayout();
          }, 0);
        }
      }, 300); // Short delay for loading state visibility
    }, 100);
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

  // Completely redesigned visual layout function
  const drawVisualLayout = () => {
    if (!selectedRow || !canvasRef.current || !containerRef.current) return;
    
    console.log("Drawing visual layout for row:", selectedRow.rowNumber);
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size to match container width while maintaining a good height for visibility
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 300;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get holes data
    const holes = selectedRow.holes || [];
    const holeCount = holes.length;
    
    if (holeCount === 0) {
      // Draw message when no holes are present
      ctx.font = "16px Arial";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No holes in this row", canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Calculate canvas dimensions and scaling
    const padding = 50; // Padding on both sides
    const usableWidth = canvas.width - (padding * 2);
    const centerY = canvas.height / 2;
    
    // Draw row line
    ctx.beginPath();
    ctx.strokeStyle = "#6b7280"; // gray-500
    ctx.lineWidth = 2;
    ctx.moveTo(padding, centerY);
    ctx.lineTo(canvas.width - padding, centerY);
    ctx.stroke();
    
    // Calculate hole spacing to fit all holes
    const holeRadius = 15;
    const minSpacing = holeRadius * 3; // Minimum spacing between hole centers
    
    // Calculate ideal spacing based on container width and hole count
    let spacing = usableWidth / (holeCount - 1);
    
    // If we have only one hole, center it
    if (holeCount === 1) {
      const x = canvas.width / 2;
      const y = centerY;
      
      // Draw hole
      drawHole(ctx, holes[0], x, y, holeRadius);
    } else {
      // If spacing is too small, we need to make the diagram scrollable
      const finalSpacing = Math.max(spacing, minSpacing);
      const totalWidth = finalSpacing * (holeCount - 1) + (padding * 2);
      
      // If we need to scroll, update canvas width
      if (totalWidth > canvas.width) {
        canvas.width = totalWidth;
        
        // Redraw the row line with the new width
        ctx.beginPath();
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 2;
        ctx.moveTo(padding, centerY);
        ctx.lineTo(canvas.width - padding, centerY);
        ctx.stroke();
        
        // Enable scrolling on container if needed
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.overflowX = "auto";
        }
      }
      
      // Draw all holes with proper spacing
      for (let i = 0; i < holeCount; i++) {
        const x = padding + (i * finalSpacing);
        const y = centerY;
        drawHole(ctx, holes[i], x, y, holeRadius);
      }
    }
    
    // Draw the row number at the bottom
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Row ${selectedRow.rowNumber}`, canvas.width / 2, canvas.height - 10);
  }
  
  // Helper function to draw individual holes
  const drawHole = (ctx: CanvasRenderingContext2D, hole: HoleData, x: number, y: number, radius: number) => {
    // Draw hole background
    ctx.beginPath();
    ctx.fillStyle = hole.status === "EMPTY" ? "#e5e7eb" : 
                    hole.status === "PLANTED" ? "#d1fae5" : "#fef3c7";
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw hole border
    ctx.beginPath();
    ctx.strokeStyle = "#4b5563"; // gray-600
    ctx.lineWidth = 1;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw health indicator if planted
    if (hole.status === "PLANTED" && hole.plantHealth) {
      let healthColor;
      switch (hole.plantHealth) {
        case "Healthy":
          healthColor = "#10b981"; // green-500
          break;
        case "Diseased":
          healthColor = "#ef4444"; // red-500
          break;
        case "Pest-affected":
          healthColor = "#f97316"; // orange-500
          break;
        case "Damaged":
          healthColor = "#eab308"; // yellow-500
          break;
        default:
          healthColor = "#6b7280"; // gray-500
      }
      
      // Draw health indicator dot
      ctx.beginPath();
      ctx.fillStyle = healthColor;
      ctx.arc(x, y - radius - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw hole number
    ctx.fillStyle = "#1f2937"; // gray-800
    ctx.font = radius > 15 ? "11px Arial" : "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hole.holeNumber?.toString() || "", x, y);
  }

  // Redraw visual layout when dependencies change
  useEffect(() => {
    if (activeTab === "visual" && selectedRow && !isLoading) {
      drawVisualLayout();
      
      // Handle window resize
      const handleResize = () => {
        drawVisualLayout();
      };
      
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [activeTab, selectedRow, selectedRowNumber, isLoading]);

  if (!rows || rows.length === 0) {
    return (
      <div className="container px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No rows found for this plot</h1>
          <Button asChild>
            <Link href={`/farms/${farmId}`}>
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
          <Link href={`/farms/${farmId}`}>
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
                <Card key={row.rowNumber} className={cn(
                  "overflow-hidden",
                  selectedRowNumber === row.rowNumber ? "border-primary border-2" : ""
                )}>
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
                          variant={selectedRowNumber === row.rowNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRowSelect(row.rowNumber.toString())}
                          className="ml-1"
                          disabled={isLoading}
                        >
                          {isLoading && selectedRowNumber === row.rowNumber ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          {selectedRowNumber === row.rowNumber ? "Selected" : "Select"}
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
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                          {row.holes.slice(0, 24).map((holeData, i) => {
                            if (!holeData) return null;

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
                            );
                          })}
                          {row.holes.length > 24 && (
                            <div className="aspect-square rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                              +{row.holes.length - 24}
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
                <CardTitle className="flex items-center">
                  Visual Layout
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {rows.map((row) => (
                    <Button
                      key={row.rowNumber}
                      size="sm"
                      variant={selectedRowNumber === row.rowNumber ? "default" : "outline"}
                      onClick={() => handleRowSelect(row.rowNumber.toString())}
                      disabled={isLoading}
                      className={cn(
                        "min-w-[70px]",
                        selectedRowNumber === row.rowNumber ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      {isLoading && selectedRowNumber === row.rowNumber ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Row {row.rowNumber}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedRow && !isLoading ? (
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
                        <p className="font-medium">{selectedRow.spacing} m</p>
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

                  <div ref={scrollContainerRef} className="w-full overflow-x-auto">
                    <div ref={containerRef} className="min-w-full">
                      <canvas ref={canvasRef} className="border rounded-md min-h-[300px] min-w-full" />
                    </div>
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
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p>Loading row data...</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Select a row to view its visual layout</p>
                  {rows.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {rows.slice(0, 5).map((row) => (
                        <Button 
                          key={row.rowNumber} 
                          onClick={() => handleRowSelect(row.rowNumber.toString())} 
                          size="sm"
                        >
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