"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { harvestFormSchema, type HarvestFormValues } from "@/lib/validations/form-schemas"
import { recordHarvestAction } from "@/app/actions/harvest-actions"
import { Loader2, CalendarIcon, CheckCircle2, Circle, Plus, X } from "lucide-react"
import type { Plot } from "@/lib/types/plot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface HarvestFormProps {
  initialData?: Partial<HarvestFormValues>
  onSuccess?: () => void
  users: { id: string; name: string }[]
  plots: { id: string; name: string }[]
  farmId: string
}

export function HarvestForm({ initialData, onSuccess, users, plots, farmId }: HarvestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [rowSelectionMode, setRowSelectionMode] = useState<'all' | 'custom'>('custom')
  const [loadingPlot, setLoadingPlot] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const defaultValues: Partial<HarvestFormValues> = {
    farmId: farmId,
    plotId: initialData?.plotId || "",
    userId: initialData?.userId || "",
    harvestTeam: initialData?.harvestTeam || [],
    harvestDate: initialData?.harvestDate || new Date(),
    bunchCount: initialData?.bunchCount || 1,
    totalWeight: initialData?.totalWeight || 0,
    qualityRating: initialData?.qualityRating || "Average",
    notes: initialData?.notes || "",
    selectedHoles: initialData?.selectedHoles || [],
  }

  const form = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change
  })

  // Debug form state
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values:", value)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Fetch the selected plot's layout structure
  useEffect(() => {
    const fetchPlotDetails = async () => {
      const plotId = form.watch("plotId")
      if (!plotId) {
        setSelectedPlot(null)
        return
      }
      
      try {
        setLoadingPlot(true)
        const plot = plots.find((p) => p.id === plotId)
        if (plot) {
          // Log the plot structure for debugging
          console.log("Selected plot:", plot)
          setSelectedPlot(plot as any)
          
          // Clear any previously selected holes when changing plots
          form.setValue("selectedHoles", [])
        }
      } catch (error) {
        console.error("Error loading plot details:", error)
        toast({
          title: "Error",
          description: "Failed to load plot details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingPlot(false)
      }
    }
    
    fetchPlotDetails()
  }, [form.watch("plotId"), plots, form])

  // Helper to check if a hole is selected
  const isHoleSelected = (rowNumber: number, holeNumber: number) => {
    return form.watch("selectedHoles")?.some(
      (h) => h.rowNumber === rowNumber && h.holeNumber === holeNumber
    )
  }

  // Get only harvestable holes (status === "PLANTED")
  const getHarvestableHoles = () => {
    if (!selectedPlot || !Array.isArray(selectedPlot.layoutStructure)) return []
    
    const harvestableHoles = []
    for (const row of selectedPlot.layoutStructure) {
      for (const hole of row.holes) {
        if (hole.status === "PLANTED") {
          harvestableHoles.push({ rowNumber: row.rowNumber, holeNumber: hole.holeNumber })
        }
      }
    }
    return harvestableHoles
  }

  // Select all harvestable holes
  const selectAllHarvestableHoles = () => {
    const harvestableHoles = getHarvestableHoles()
    form.setValue("selectedHoles", harvestableHoles)
    setRowSelectionMode('all')
  }

  // Clear all hole selections
  const clearAllHoleSelections = () => {
    form.setValue("selectedHoles", [])
    setRowSelectionMode('custom')
  }

  // Select all harvestable holes in a row
  const selectRowHoles = (rowNumber: number, isChecked: boolean) => {
    const currentSelections = form.getValues("selectedHoles") || []
    
    if (isChecked) {
      // Add all harvestable holes in this row
      const harvestableHolesInRow = selectedPlot?.layoutStructure
        ?.find(row => row.rowNumber === rowNumber)?.holes
        ?.filter(hole => hole.status === "PLANTED")
        ?.map(hole => ({ rowNumber, holeNumber: hole.holeNumber })) || []
      
      // Combine with existing selections (excluding this row)
      const newSelections = [
        ...currentSelections.filter(h => h.rowNumber !== rowNumber),
        ...harvestableHolesInRow
      ]
      
      form.setValue("selectedHoles", newSelections)
    } else {
      // Remove all holes from this row
      const newSelections = currentSelections.filter(h => h.rowNumber !== rowNumber)
      form.setValue("selectedHoles", newSelections)
    }
  }

  // Check if all harvestable holes in a row are selected
  const isRowSelected = (rowNumber: number) => {
    const row = selectedPlot?.layoutStructure?.find(r => r.rowNumber === rowNumber)
    if (!row) return false
    
    const harvestableHolesInRow = row.holes.filter(hole => hole.status === "PLANTED")
    if (harvestableHolesInRow.length === 0) return false
    
    const selectedHoles = form.watch("selectedHoles") || []
    return harvestableHolesInRow.every(hole => 
      selectedHoles.some(h => h.rowNumber === rowNumber && h.holeNumber === hole.holeNumber)
    )
  }

  // Toggle a single hole selection
  const toggleHoleSelection = (rowNumber: number, holeNumber: number) => {
    const currentSelections = form.getValues("selectedHoles") || []
    const isSelected = currentSelections.some(
      h => h.rowNumber === rowNumber && h.holeNumber === holeNumber
    )
    
    if (isSelected) {
      // Remove this hole
      const newSelections = currentSelections.filter(
        h => !(h.rowNumber === rowNumber && h.holeNumber === holeNumber)
      )
      form.setValue("selectedHoles", newSelections)
    } else {
      // Add this hole
      form.setValue("selectedHoles", [...currentSelections, { rowNumber, holeNumber }])
    }
    
    // Update row selection mode to custom after individual changes
    setRowSelectionMode('custom')
  }

  async function onSubmit(values: HarvestFormValues) {
    // Validation check - make sure at least one hole is selected
    if (!values.selectedHoles || values.selectedHoles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one hole to harvest.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    setDebugInfo(null)
    
    try {
      console.log("Submitting harvest form with values:", values)
      
      const result = await recordHarvestAction(values)
      setDebugInfo(result)
      
      if (result.success) {
        setSuccess(true)
        toast({
          title: "Harvest recorded",
          description: result.message,
        })
        if (onSuccess) onSuccess()
      } else {
        console.error("Error recording harvest:", result)
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting harvest form:", error)
      setDebugInfo({ error: String(error) })
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-green-100 border border-green-300 rounded-lg p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Harvest recorded!</h2>
          <p className="mb-4">Your harvest record has been saved successfully.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setSuccess(false)}>Record Another</Button>
            {onSuccess && (
              <Button onClick={onSuccess}>Back to Dashboard</Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const selectedHolesCount = form.watch("selectedHoles")?.length || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Debug information - remove in production */}
        {debugInfo && (
          <div className="p-4 bg-gray-100 text-xs rounded-md overflow-auto max-h-40">
            <details>
              <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}
      
        <FormField
          control={form.control}
          name="plotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>{plot.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the plot for this harvest</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorded By</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The user recording this harvest</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="harvestDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Harvest Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Date the harvest was recorded</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="harvestTeam"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harvest Team</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={field.value?.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), user.id])
                        } else {
                          field.onChange((field.value || []).filter((id: string) => id !== user.id))
                        }
                      }}
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
              <FormDescription>Select all team members who participated</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bunchCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bunch Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Number of bunches"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? 1 : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Total number of bunches harvested</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder="Total weight in kg"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Total weight of the harvest in kilograms</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="qualityRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Overall quality of the harvest</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any remarks or notes" className="resize-none min-h-[80px]" {...field} />
              </FormControl>
              <FormDescription>Additional notes about this harvest</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row and Hole Selection */}
        {loadingPlot ? (
          <div className="flex items-center justify-center p-6 border rounded-md bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2">Loading plot data...</span>
          </div>
        ) : selectedPlot && Array.isArray(selectedPlot.layoutStructure) && selectedPlot.layoutStructure.length > 0 ? (
          <FormField
            control={form.control}
            name="selectedHoles"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col space-y-2">
                  <FormLabel className="flex items-center justify-between">
                    <span>Harvested Holes</span>
                    <div className="flex items-center gap-2 text-sm font-normal">
                      <Badge variant="outline">{selectedHolesCount} holes selected</Badge>
                      {selectedHolesCount > 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={clearAllHoleSelections}
                          className="h-7 px-2"
                        >
                          <X className="mr-1 h-3 w-3" />
                          Clear
                        </Button>
                      )}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllHarvestableHoles}
                        className="h-7 px-2"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Select All
                      </Button>
                    </div>
                  </FormLabel>
                  
                  <Card className="border">
                    <CardHeader className="p-2 px-4 border-b bg-gray-50">
                      <CardTitle className="text-sm font-medium">Select holes to mark as harvested</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 max-h-64 overflow-auto">
                      <div className="divide-y">
                        {selectedPlot.layoutStructure.map((row) => {
                          // Only show rows that have plantable/harvestable holes
                          const harvestableHoles = row.holes.filter(h => h.status === "PLANTED");
                          if (harvestableHoles.length === 0) return null;
                          
                          return (
                            <div key={row.rowNumber} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2">
                                  <Checkbox 
                                    checked={isRowSelected(row.rowNumber)} 
                                    onCheckedChange={(checked) => selectRowHoles(row.rowNumber, !!checked)}
                                  />
                                  <span className="font-medium">Row {row.rowNumber}</span>
                                </label>
                                <Badge variant="outline" className="text-xs">
                                  {harvestableHoles.length} harvestable
                                </Badge>
                              </div>
                              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 mt-1 pl-7">
                                {harvestableHoles.map((hole) => (
                                  <button
                                    key={`${row.rowNumber}-${hole.holeNumber}`}
                                    type="button"
                                    onClick={() => toggleHoleSelection(row.rowNumber, hole.holeNumber)}
                                    className={cn(
                                      "aspect-square rounded-full flex items-center justify-center text-xs font-medium border transition-colors",
                                      isHoleSelected(row.rowNumber, hole.holeNumber)
                                        ? "bg-green-100 border-green-500"
                                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                                    )}
                                  >
                                    {hole.holeNumber}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <FormDescription>
                  Select the holes that were harvested. Only planted holes can be harvested.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="border rounded-md p-4 bg-gray-50 text-center text-gray-500">
            {selectedPlot ? (
              <p>This plot has no rows or holes to harvest.</p>
            ) : (
              <p>Please select a plot to view harvestable holes.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-4">
          {onSuccess && (
            <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || selectedHolesCount === 0}
            className={cn(selectedHolesCount === 0 ? "opacity-50" : "")}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Harvest
          </Button>
        </div>
      </form>
    </Form>
  )
}