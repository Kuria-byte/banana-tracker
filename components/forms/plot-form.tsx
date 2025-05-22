"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, Settings, RefreshCw, Calculator } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"


import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { plotFormSchema, type PlotFormValues } from "@/lib/validations/form-schemas"

import { addPlot, updatePlot } from "@/app/actions/plot-actions"  
import { getAllFarms } from "@/app/actions/farm-actions"

import type { Farm } from "@/lib/mock-data"

// Soil types for the dropdown
const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peat", "Chalk", "Loam-Sandy", "Clay-Loam"]

interface PlotFormProps {
  initialData?: Partial<PlotFormValues> & { id?: string }
  farmId?: string
  onSuccess?: () => void
}

export function PlotForm({ initialData, farmId, onSuccess }: PlotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [createdPlotId, setCreatedPlotId] = useState<string | null>(null)
  const router = useRouter()
  const isEditing = !!initialData?.id
  const [farms, setFarms] = useState<Farm[]>([])
  const [farmsLoading, setFarmsLoading] = useState(false)
  const [farmsError, setFarmsError] = useState<string | null>(null)

  // Extract row length and spacing from layoutStructure if available
  const [rowLength, setRowLength] = useState<number>(
    Array.isArray(initialData?.layoutStructure) && initialData?.layoutStructure.length > 0
      ? initialData.layoutStructure[0].length || 0
      : 0
  );
  
  const [rowSpacing, setRowSpacing] = useState<number>(
    Array.isArray(initialData?.layoutStructure) && initialData?.layoutStructure.length > 0
      ? initialData.layoutStructure[0].spacing || 0
      : 0
  );

  // Track expanded rows for UI
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Add state to control whether auto-recalculation is enabled
  const [autoRecalculate, setAutoRecalculate] = useState(true);

  // Define bulk settings state with defaults
  const [bulkSettings, setBulkSettings] = useState({
    targetSuckerCount: 3,
    currentSuckerCount: 0,
    plantedDate: '',
    notes: '',
  });

  // Move defaultValues above useForm
  const defaultValues: Partial<PlotFormValues> = {
    name: initialData?.name || "",
    farmId: farmId || initialData?.farmId || "",
    area: initialData?.area ?? 0,
    soilType: initialData?.soilType || "",
    dateEstablished: initialData?.dateEstablished ? new Date(initialData.dateEstablished) : new Date(),
    healthStatus: initialData?.healthStatus || "Good",
    description: initialData?.description || "",
    rowCount: typeof initialData?.rowCount === 'number' ? initialData.rowCount : 0,
    holeCount: typeof initialData?.holeCount === 'number' ? initialData.holeCount : 0,
    plantCount: typeof initialData?.plantCount === 'number' ? initialData.plantCount : 0,
    layoutStructure: Array.isArray(initialData?.layoutStructure) ? initialData.layoutStructure : [],
  }

  // useForm hook (only declare once)
  const form = useForm<PlotFormValues>({
    resolver: zodResolver(plotFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change for better user feedback
  })

  // Initialize plantedDate in bulkSettings once dateEstablished is available
  useEffect(() => {
    const dateEstablished = form.watch('dateEstablished');
    if (dateEstablished) {
      setBulkSettings(prev => ({
        ...prev,
        plantedDate: format(dateEstablished, 'yyyy-MM-dd')
      }));
    }
  }, [form.watch('dateEstablished')]);

  // Function to apply bulk settings to all holes or a specific row
  const applyBulkSetting = (field: string, value: any, rowNumber: number | null = null) => {
    try {
      const currentLayout = form.getValues('layoutStructure') || [];
      
      const updatedLayout = currentLayout.map(row => {
        // Skip rows that don't match the target row (if specified)
        if (rowNumber !== null && row.rowNumber !== rowNumber) return row;
        
        return {
          ...row,
          holes: row.holes.map(hole => ({
            ...hole,
            [field]: value
          }))
        };
      });
      
      form.setValue('layoutStructure', updatedLayout, { shouldValidate: false });
      
      toast({
        title: "Settings Applied",
        description: rowNumber 
          ? `Applied ${field} to all holes in row ${rowNumber}` 
          : `Applied ${field} to all holes in the plot`,
        duration: 2000,
      });
    } catch (error) {
      console.error(`Error applying bulk setting ${field}:`, error);
      toast({
        title: "Error",
        description: "Failed to apply settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Updated layout generation function that incorporates bulk settings
  function generateLayoutStructure(rowCount: number, holeCount: number, rowLength: number, rowSpacing: number) {
    if (!rowCount || !holeCount) return [];
    const holesPerRow = Math.ceil(holeCount / rowCount);
    let holesLeft = holeCount;
    const layout = [];
    let holeNumber = 1;
    
    // Get date for planted date
    const defaultDate = form.getValues('dateEstablished') 
      ? format(form.getValues('dateEstablished'), 'yyyy-MM-dd')
      : bulkSettings.plantedDate || format(new Date(), 'yyyy-MM-dd');
    
    for (let row = 1; row <= rowCount; row++) {
      const holesInThisRow = Math.min(holesPerRow, holesLeft);
      const holes = [];
      for (let h = 0; h < holesInThisRow; h++) {
        holes.push({
          holeNumber: holeNumber,
          status: 'PLANTED',
          rowNumber: row,
          plantHealth: 'Healthy',
          mainPlantId: undefined,
          activePlantIds: [],
          targetSuckerCount: bulkSettings.targetSuckerCount,
          currentSuckerCount: bulkSettings.currentSuckerCount,
          plantedDate: defaultDate,
          notes: bulkSettings.notes || '',
        });
        holeNumber++;
      }
      layout.push({
        rowNumber: row,
        length: rowLength,
        spacing: rowSpacing,
        holes,
        notes: '',
      });
      holesLeft -= holesInThisRow;
    }
    return layout;
  }

  // Function to manually recalculate total holes from current layout
  const recalculateTotalHoles = () => {
    const currentLayout = form.getValues('layoutStructure') || [];
    const totalHoles = currentLayout.reduce((sum, row) => sum + (row.holes?.length || 0), 0);
    form.setValue('holeCount', totalHoles, { shouldValidate: true });
    toast({
      title: "Total Recalculated",
      description: `Total holes updated to ${totalHoles}`,
      duration: 2000,
    });
  };

  // Function to redistribute holes evenly across all rows
  const redistributeHoles = () => {
    const rowCount = Number(form.watch('rowCount') ?? 0);
    const holeCount = Number(form.watch('holeCount') ?? 0);
    
    if (rowCount > 0 && holeCount > 0) {
      const layout = generateLayoutStructure(rowCount, holeCount, rowLength, rowSpacing);
      form.setValue('layoutStructure', layout, { shouldValidate: false });
      toast({
        title: "Holes Redistributed",
        description: `Redistributed ${holeCount} holes evenly across ${rowCount} rows`,
        duration: 2000,
      });
    }
  };

  // Log initial form values for debugging
  useEffect(() => {
    console.log("PlotForm initialized with values:", defaultValues)
  }, [])

  // Debug form errors
  useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(form.formState.errors).length > 0) {
        console.log("Form validation errors:", form.formState.errors)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  useEffect(() => {
    if (farmId) {
      form.setValue("farmId", farmId)
    }
  }, [farmId, form])

  // Modified layout generation effect - only runs when auto-recalculate is enabled
  const rowCount = Number(form.watch('rowCount') ?? 0)
  const holeCount = Number(form.watch('holeCount') ?? 0)
  
  useEffect(() => {
    // Only auto-generate layout if auto-recalculate is enabled and we don't have an existing layout
    if (autoRecalculate && rowCount > 0 && holeCount > 0) {
      const currentLayout = form.getValues('layoutStructure') || [];
      // Only regenerate if we don't have a layout or if the row count changed significantly
      if (currentLayout.length === 0 || currentLayout.length !== rowCount) {
      try {
        const layout = generateLayoutStructure(rowCount, holeCount, rowLength, rowSpacing)
        form.setValue('layoutStructure', layout, { shouldValidate: false })
      } catch (error) {
        console.error("Error generating layout:", error)
      }
      }
    } else if (rowCount === 0 || holeCount === 0) {
      form.setValue('layoutStructure', [], { shouldValidate: false })
    }
  }, [rowCount, holeCount, rowLength, rowSpacing, form, bulkSettings, autoRecalculate])

  const layoutStructure = form.watch('layoutStructure') ?? []

  // Fetch farms from the database
  useEffect(() => {
    async function fetchFarms() {
      setFarmsLoading(true)
      setFarmsError(null)
      try {
        const result = await getAllFarms()
        if (result.success && Array.isArray(result.farms)) {
          setFarms(result.farms)
        } else {
          setFarmsError(result.error || "Failed to fetch farms.")
        }
      } catch (error) {
        setFarmsError("Failed to fetch farms.")
      } finally {
        setFarmsLoading(false)
      }
    }
    fetchFarms()
  }, [])


 // Function to update a specific row's hole count without affecting others
 const updateRowHoleCount = (rowNumber: number, newHoleCount: number) => {
  const currentLayout = form.getValues('layoutStructure') || [];
  
  // First, we need to calculate the starting hole number for new holes in this row
  let startingHoleNumber = 1;
  for (let i = 0; i < currentLayout.length; i++) {
    if (currentLayout[i].rowNumber < rowNumber) {
      startingHoleNumber += (currentLayout[i].holes?.length || 0);
    } else if (currentLayout[i].rowNumber === rowNumber) {
      break;
    }
  }
  
  // Find the row and update its holes
  const updatedLayout = currentLayout.map(row => {
    if (row.rowNumber !== rowNumber) return row;
    
    const currentHoles = row.holes || [];
    let newHoles = [...currentHoles];
    
    if (newHoleCount > currentHoles.length) {
      // Add new holes with correct sequential numbering
      const defaultDate = form.getValues('dateEstablished') 
        ? format(form.getValues('dateEstablished'), 'yyyy-MM-dd')
        : bulkSettings.plantedDate || format(new Date(), 'yyyy-MM-dd');
      
      // Calculate the next hole number to use
      let nextHoleNumber = startingHoleNumber + currentHoles.length;
        
      for (let h = currentHoles.length; h < newHoleCount; h++) {
        newHoles.push({
          holeNumber: nextHoleNumber,
          status: 'PLANTED',
          rowNumber: rowNumber,
          plantHealth: 'Healthy',
          mainPlantId: undefined,
          activePlantIds: [],
          targetSuckerCount: bulkSettings.targetSuckerCount,
          currentSuckerCount: bulkSettings.currentSuckerCount,
          plantedDate: defaultDate,
          notes: bulkSettings.notes || '',
          suckerIds: [],
        });
        nextHoleNumber++;
      }
    } else if (newHoleCount < currentHoles.length) {
      // Remove holes from the end
      newHoles = newHoles.slice(0, newHoleCount);
    }
    
    return { ...row, holes: newHoles };
  });
  
  // Renumber all holes in subsequent rows to maintain sequential numbering
  let currentHoleNumber = 1;
  const finalLayout = updatedLayout.map(row => {
    const renumberedHoles = row.holes.map(hole => ({
      ...hole,
      holeNumber: currentHoleNumber++
    }));
    return { ...row, holes: renumberedHoles };
  });
  
  form.setValue('layoutStructure', finalLayout, { shouldValidate: false });
  
  // Don't automatically update the total hole count - let user do it manually
  toast({
    title: "Row Updated",
    description: `Row ${rowNumber} now has ${newHoleCount} holes. Holes have been renumbered sequentially.`,
    duration: 3000,
  });
};

  async function onSubmit(values: PlotFormValues) {
    console.log("Form submitted with values:", values)
    setFormError(null)
    setIsSubmitting(true)
    try {
      // Use the actual layout structure from the form, not regenerated
      const actualLayoutStructure = values.layoutStructure || [];
      
      // Only regenerate if the user hasn't manually configured the layout
      const shouldUseManualLayout = actualLayoutStructure.length > 0 && 
        actualLayoutStructure.some(row => row.holes && row.holes.length > 0);
      
      let finalLayoutStructure;
      if (shouldUseManualLayout) {
        // Use the user's manual configuration
        console.log("Using manual layout configuration");
        finalLayoutStructure = actualLayoutStructure.map(row => ({
          ...row,
          length: rowLength || row.length || 0,
          spacing: rowSpacing || row.spacing || 0,
        }));
      } else {
        // Fallback to auto-generation only if no manual config exists
        console.log("Using auto-generated layout");
        finalLayoutStructure = generateLayoutStructure(
        Number(values.rowCount) || 0,
        Number(values.holeCount) || 0,
        rowLength,
        rowSpacing
      );
      }
      
      // Ensure all values are of the correct type and explicitly include dateEstablished
      const payload = {
        ...values,
        area: Number(values.area),
        rowCount: Number(values.rowCount),
        holeCount: Number(values.holeCount),
        plantCount: Number(values.plantCount),
        farmId: String(values.farmId),
        dateEstablished: values.dateEstablished,
        layoutStructure: finalLayoutStructure, // Use the correct layout structure
      }
      
      console.log("Calling server action with payload:", {
        isEditing,
        plotId: initialData?.id,
        dateEstablished: payload.dateEstablished,
        layoutStructureSource: shouldUseManualLayout ? "manual" : "auto-generated",
        actualRowCounts: finalLayoutStructure.map(row => ({ 
          rowNumber: row.rowNumber, 
          holeCount: row.holes?.length || 0 
        })),
        payload
      })
      
      // Try to call the server action
      let result
      if (isEditing && initialData?.id) {
        result = await updatePlot(Number(initialData.id), payload)
      } else {
        result = await addPlot(payload)
      }

      if (result?.success && result?.plot) {
        setSuccess(true)
        setCreatedPlotId(result.plot.id ? String(result.plot.id) : null)
        toast({
          title: isEditing ? "Plot updated" : "Plot added",
          description: result.message,
        })
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1000);
      } else if (result && 'issues' in result) {
        // Zod validation error from server
        setFormError("Please check your input and try again.")
        toast({
          title: "Validation Error",
          description: "Please check your input and try again.",
          variant: "destructive",
        })
      } else {
        setFormError(result?.error || "Something went wrong. Please try again.")
        toast({
          title: "Error",
          description: result?.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setFormError("An unexpected error occurred. Please try again.")
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
          <h2 className="text-2xl font-bold mb-2">{isEditing ? "Plot updated!" : "Plot created!"}</h2>
          <p className="mb-4">{isEditing ? "The plot details have been updated successfully." : "Your new plot has been created successfully."}</p>
          {createdPlotId && (
            <Button onClick={() => router.push(`/farms/${farmId || initialData?.farmId}/plots/${createdPlotId}/rows`)} className="inline-block mb-2 text-primary underline">
              View Plot Rows
            </Button>
          )}
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={() => router.push(`/farms/${farmId || initialData?.farmId}`)}>Go to Farm</Button>
            <Button variant="outline" onClick={() => setSuccess(false)}>Create Another</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Display form-level errors */}
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {formError}
          </div>
        )}
        {/* Simple loading state */}
        {isSubmitting && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md flex items-center gap-4">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            <span>{isEditing ? "Updating plot..." : "Adding plot..."}</span>
          </div>
        )}
      
        {/* Form fields remain the same */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter plot name"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>A name to identify this plot</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="farmId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!farmId || farmsLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farm" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {farmsLoading ? (
                    <SelectItem value="__loading__" disabled>Loading farms...</SelectItem>
                  ) : farmsError ? (
                    <SelectItem value="__error__" disabled>{farmsError}</SelectItem>
                  ) : farms.length === 0 ? (
                    <SelectItem value="__empty__" disabled>No farms found</SelectItem>
                  ) : (
                    farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>The farm this plot belongs to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rest of your form fields remain the same */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area (acres)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter plot area"
                    {...field}
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormDescription>The total area of this plot in acres</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leaseYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease Years</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    placeholder="Enter lease years"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Number of years this plot is leased for (optional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soilType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soil Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {soilTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The type of soil in this plot</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dateEstablished"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Established</FormLabel>
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
                      onSelect={(date) => {
                        // Ensure we're passing a valid Date object
                        if (date) {
                          console.log("Date selected:", date);
                          field.onChange(date);
                          // Also update the bulk plantedDate when dateEstablished changes
                          setBulkSettings(prev => ({
                            ...prev, 
                            plantedDate: format(date, 'yyyy-MM-dd')
                          }));
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The date when this plot was established</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="healthStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The overall health status of this plot</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter plot description" className="resize-none min-h-[100px]" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Additional details about this plot</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row Settings - Enhanced with manual control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-700">Row Configuration</h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input 
                  type="checkbox" 
                  checked={autoRecalculate}
                  onChange={(e) => setAutoRecalculate(e.target.checked)}
                  className="rounded"
                />
                Auto-recalculate layout
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="rowCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Row Count</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Number of rows" {...field} value={field.value ?? 0} />
                  </FormControl>
                  <FormDescription>Total number of rows in this plot</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="holeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Hole Count</FormLabel>
                  <div className="flex gap-2">
                  <FormControl>
                    <Input type="number" placeholder="Number of holes" {...field} value={field.value ?? 0} />
                  </FormControl>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={recalculateTotalHoles}
                      title="Recalculate total from current layout"
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>Total number of holes across all rows</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row Length Input (not connected to form state) */}
            <div className="space-y-2">
              <label htmlFor="rowLength" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Row Length (meters)
              </label>
              <Input
                id="rowLength"
                type="number"
                step="0.1"
                placeholder="Length of each row"
                value={rowLength}
                onChange={(e) => setRowLength(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground">
                The length of each row in meters
              </p>
            </div>
            
            {/* Row Spacing Input (not connected to form state) */}
            <div className="space-y-2">
              <label htmlFor="rowSpacing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Row Spacing (meters)
              </label>
              <Input
                id="rowSpacing"
                type="number"
                step="0.1"
                placeholder="Space between rows"
                value={rowSpacing}
                onChange={(e) => setRowSpacing(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground">
                The spacing between rows in meters
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
          <FormField
            control={form.control}
            name="plantCount"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Plant Count</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Number of plants" {...field} value={field.value ?? 0} />
                </FormControl>
                <FormDescription>Total number of plants in this plot</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
            
            {/* Manual layout control buttons */}
            <div className="flex flex-col gap-2 justify-end pb-6">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={redistributeHoles}
                title="Redistribute holes evenly across all rows"
                className="whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Redistribute
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bulk Hole Configuration */}
        {rowCount > 0 && holeCount > 0 && (
          <div className="space-y-4 border rounded p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Bulk Hole Configuration
              </h3>
              <p className="text-xs text-gray-500">Set values for all holes at once</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <label htmlFor="bulkTargetSuckers" className="text-sm font-medium">
                  Target Sucker Count
                </label>
                <div className="flex gap-2">
                  <Input
                    id="bulkTargetSuckers"
                    type="number"
                    min={0}
                    max={5}
                    value={bulkSettings.targetSuckerCount}
                    onChange={(e) => setBulkSettings({
                      ...bulkSettings,
                      targetSuckerCount: parseInt(e.target.value) || 0
                    })}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyBulkSetting('targetSuckerCount', bulkSettings.targetSuckerCount)}
                  >
                    Apply to All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="bulkCurrentSuckers" className="text-sm font-medium">
                  Current Sucker Count
                </label>
                <div className="flex gap-2">
                  <Input
                    id="bulkCurrentSuckers"
                    type="number"
                    min={0}
                    value={bulkSettings.currentSuckerCount}
                    onChange={(e) => setBulkSettings({
                      ...bulkSettings,
                      currentSuckerCount: parseInt(e.target.value) || 0
                    })}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyBulkSetting('currentSuckerCount', bulkSettings.currentSuckerCount)}
                  >
                    Apply to All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="bulkPlantedDate" className="text-sm font-medium">
                  Planted Date
                </label>
                <div className="flex gap-2">
                  <Input
                    id="bulkPlantedDate"
                    type="date"
                    value={bulkSettings.plantedDate || ''}
                    onChange={(e) => setBulkSettings({
                      ...bulkSettings,
                      plantedDate: e.target.value
                    })}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyBulkSetting('plantedDate', bulkSettings.plantedDate)}
                  >
                    Apply to All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="bulkNotes" className="text-sm font-medium">
                  Notes
                </label>
                <div className="flex gap-2">
                  <Input
                    id="bulkNotes"
                    type="text"
                    value={bulkSettings.notes || ''}
                    onChange={(e) => setBulkSettings({
                      ...bulkSettings,
                      notes: e.target.value
                    })}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyBulkSetting('notes', bulkSettings.notes)}
                  >
                    Apply to All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Layout preview with independent row editing */}
        <div className="border rounded p-4 bg-gray-50 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Layout Preview</h3>
            <div className="flex gap-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={recalculateTotalHoles}
                title="Update total hole count from current layout"
              >
                <Calculator className="h-4 w-4 mr-1" />
                Recalculate Total
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={redistributeHoles}
                title="Redistribute holes evenly across all rows"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Redistribute
              </Button>
            </div>
          </div>
          
          {Array.isArray(layoutStructure) && layoutStructure.length > 0 ? (
            <ul className="text-xs max-h-80 overflow-auto">
              {layoutStructure.map((row, i) => (
                <li key={i} className="mb-1 border-b pb-2">
                  <div className="flex items-center justify-between">
                    <span>
                  Row {row.rowNumber}: {Array.isArray(row.holes) ? row.holes.length : 0} holes, 
                  {row.length > 0 ? ` ${row.length}m length` : ' No length set'}, 
                  {row.spacing > 0 ? ` ${row.spacing}m spacing` : ' No spacing set'}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs flex items-center gap-1">
                        Holes in Row:
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={row.holes.length}
                          style={{ width: 60 }}
                          onChange={e => {
                            const newCount = Math.max(0, parseInt(e.target.value) || 0);
                            updateRowHoleCount(row.rowNumber, newCount);
                          }}
                        />
                      </label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedRows((prev) => ({ ...prev, [row.rowNumber]: !prev[row.rowNumber] }))}
                    >
                      {expandedRows[row.rowNumber] ? "Hide Holes" : "View Holes"}
                    </Button>
                    </div>
                  </div>
                  
                  {expandedRows[row.rowNumber] && (
                    <>
                      {/* Row-level bulk actions */}
                      <div className="mt-2 p-2 bg-gray-100 rounded">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-medium whitespace-nowrap">Row {row.rowNumber} bulk actions:</span>
                          
                          <div className="flex gap-1 items-center">
                            <span className="text-xs">Target:</span>
                            <select 
                              className="text-xs border rounded h-7 px-1"
                              value=""
                              title="Set target sucker count for this row"
                              onChange={(e) => {
                                if (e.target.value) {
                                  applyBulkSetting('targetSuckerCount', parseInt(e.target.value), row.rowNumber);
                                  e.target.value = "";
                                }
                              }}
                            >
                              <option value="">Set...</option>
                              {[0, 1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex gap-1 items-center">
                            <span className="text-xs">Current:</span>
                            <select 
                              className="text-xs border rounded h-7 px-1"
                              value=""
                              title="Set current sucker count for this row"
                              onChange={(e) => {
                                if (e.target.value) {
                                  applyBulkSetting('currentSuckerCount', parseInt(e.target.value), row.rowNumber);
                                  e.target.value = "";
                                }
                              }}
                            >
                              <option value="">Set...</option>
                              {[0, 1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                          
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2 text-xs"
                            onClick={() => applyBulkSetting('plantedDate', bulkSettings.plantedDate, row.rowNumber)}
                          >
                            Set Date
                          </Button>
                          
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2 text-xs"
                            onClick={() => applyBulkSetting('notes', bulkSettings.notes, row.rowNumber)}
                          >
                            Set Notes
                          </Button>
                        </div>
                      </div>
                      
                      {/* Display holes in a grid */}
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {row.holes.map((hole, hIdx) => (
                          <div key={hIdx} className="border rounded p-2 bg-white flex flex-col gap-1">
                            <div className="font-medium mb-1">Hole {hole.holeNumber}</div>
                            <label className="text-xs">Target Sucker Count
                              <Input
                                type="number"
                                min={0}
                                value={hole.targetSuckerCount ?? 3}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updated = layoutStructure.map(r =>
                                    r.rowNumber === row.rowNumber ? {
                                      ...r,
                                      holes: r.holes.map((h, idx) => idx === hIdx ? { ...h, targetSuckerCount: val } : h)
                                    } : r
                                  );
                                  form.setValue('layoutStructure', updated, { shouldValidate: false });
                                }}
                                className="mt-1"
                              />
                            </label>
                            <label className="text-xs">Current Sucker Count
                              <Input
                                type="number"
                                min={0}
                                value={hole.currentSuckerCount ?? 0}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updated = layoutStructure.map(r =>
                                    r.rowNumber === row.rowNumber ? {
                                      ...r,
                                      holes: r.holes.map((h, idx) => idx === hIdx ? { ...h, currentSuckerCount: val } : h)
                                    } : r
                                  );
                                  form.setValue('layoutStructure', updated, { shouldValidate: false });
                                }}
                                className="mt-1"
                              />
                            </label>
                            <label className="text-xs">Planted Date
                              <Input
                                type="date"
                                value={hole.plantedDate ? hole.plantedDate.split('T')[0] : ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const updated = layoutStructure.map(r =>
                                    r.rowNumber === row.rowNumber ? {
                                      ...r,
                                      holes: r.holes.map((h, idx) => idx === hIdx ? { ...h, plantedDate: val } : h)
                                    } : r
                                  );
                                  form.setValue('layoutStructure', updated, { shouldValidate: false });
                                }}
                                className="mt-1"
                              />
                            </label>
                            <label className="text-xs">Notes
                              <Textarea
                                value={hole.notes ?? ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const updated = layoutStructure.map(r =>
                                    r.rowNumber === row.rowNumber ? {
                                      ...r,
                                      holes: r.holes.map((h, idx) => idx === hIdx ? { ...h, notes: val } : h)
                                    } : r
                                  );
                                  form.setValue('layoutStructure', updated, { shouldValidate: false });
                                }}
                                className="mt-1 min-h-[40px]"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No layout generated yet.</p>
              <p className="text-xs mt-1">
                {!autoRecalculate 
                  ? "Enable auto-recalculate or use the redistribute button to generate layout"
                  : "Set row count and hole count above to generate layout"
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? "opacity-70" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Adding..."}
              </>
            ) : (
              isEditing ? "Update Plot" : "Add Plot"
            )}
          </Button>
        </div>
        
        {/* Debug information - remove in production */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 p-3 bg-gray-100 text-xs rounded">
            <details>
              <summary className="cursor-pointer font-semibold">Debug Information</summary>
              <div className="mt-2">
                <p>Form State: {form.formState.isDirty ? "Dirty" : "Pristine"}</p>
                <p>Submission State: {isSubmitting ? "Submitting" : "Idle"}</p>
                <p>Validation Errors: {Object.keys(form.formState.errors).length}</p>
                <p>Row Length: {rowLength}m, Row Spacing: {rowSpacing}m</p>
                <p>Auto-recalculate: {autoRecalculate ? "Enabled" : "Disabled"}</p>
                <p>Date Established: {form.getValues("dateEstablished")?.toISOString()}</p>
                <p>Bulk Settings: {JSON.stringify(bulkSettings)}</p>
              </div>
            </details>
          </div>
        )}
      </form>
    </Form>
  )
}