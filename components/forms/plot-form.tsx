"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
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
import { farms } from "@/lib/mock-data"

// Soil types for the dropdown
const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peat", "Chalk", "Loam-Sandy", "Clay-Loam"]

interface PlotFormProps {
  initialData?: Partial<PlotFormValues> & { id?: string }
  farmId?: string
  onSuccess?: () => void
}

export function PlotForm({ initialData, farmId, onSuccess }: PlotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isEditing = !!initialData?.id

  // Set default values from initialData or use empty values
  const defaultValues: Partial<PlotFormValues> = {
    name: initialData?.name || "",
    farmId: farmId || initialData?.farmId || "",
    area: initialData?.area || undefined,
    soilType: initialData?.soilType || "",
    dateEstablished: initialData?.dateEstablished ? new Date(initialData.dateEstablished) : new Date(),
    healthStatus: initialData?.healthStatus || "Good",
    description: initialData?.description || "",
  }

  const form = useForm<PlotFormValues>({
    resolver: zodResolver(plotFormSchema),
    defaultValues,
  })

  // If farmId is provided as a prop, set it in the form
  useEffect(() => {
    if (farmId) {
      form.setValue("farmId", farmId)
    }
  }, [farmId, form])

  async function onSubmit(values: PlotFormValues) {
    setIsSubmitting(true)
    try {
      const result = isEditing && initialData?.id ? await updatePlot(initialData.id, values) : await addPlot(values)

      if (result.success) {
        toast({
          title: isEditing ? "Plot updated" : "Plot added",
          description: result.message,
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/farms/${values.farmId}`)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter plot name" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!farmId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farm" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The farm this plot belongs to</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>The total area of this plot in acres</FormDescription>
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
                      onSelect={field.onChange}
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
                <Textarea placeholder="Enter plot description" className="resize-none min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Additional details about this plot</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Plot" : "Add Plot"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
