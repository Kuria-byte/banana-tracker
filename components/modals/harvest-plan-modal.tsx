"use client"

import React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { farms, getPlotsByFarmId } from "@/lib/mock-data"

interface HarvestPlanModalProps {
  trigger: React.ReactNode
}

// Form schema for harvest plan
const harvestPlanSchema = z.object({
  farmId: z.string().min(1, {
    message: "Please select a farm.",
  }),
  plotId: z.string().min(1, {
    message: "Please select a plot.",
  }),
  plannedDate: z.date({
    required_error: "Please select a planned harvest date.",
  }),
  estimatedYield: z.coerce.number().positive({
    message: "Estimated yield must be a positive number.",
  }),
  assignedTeamMembers: z.string().min(1, {
    message: "Please assign team members for the harvest.",
  }),
  notes: z.string().optional(),
})

type HarvestPlanValues = z.infer<typeof harvestPlanSchema>

export function HarvestPlanModal({ trigger }: HarvestPlanModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availablePlots, setAvailablePlots] = useState<{ id: string; name: string }[]>([])

  const form = useForm<HarvestPlanValues>({
    resolver: zodResolver(harvestPlanSchema),
    defaultValues: {
      farmId: "",
      plotId: "",
      plannedDate: undefined,
      estimatedYield: undefined,
      assignedTeamMembers: "",
      notes: "",
    },
  })

  // Watch for changes to farmId to update available plots
  const watchFarmId = form.watch("farmId")

  // Update available plots when farmId changes
  React.useEffect(() => {
    if (watchFarmId) {
      const plots = getPlotsByFarmId(watchFarmId)
      setAvailablePlots(plots.map((plot) => ({ id: plot.id, name: plot.name })))

      // Clear plotId if farmId changes
      form.setValue("plotId", "")
    } else {
      setAvailablePlots([])
    }
  }, [watchFarmId, form])

  async function onSubmit(values: HarvestPlanValues) {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Harvest plan created",
        description: "Your harvest plan has been created successfully.",
      })

      form.reset()
      setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Harvest Plan</DialogTitle>
          <DialogDescription>Plan a harvest for your banana plants</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="farmId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormDescription>The farm where the harvest will take place</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchFarmId && (
              <FormField
                control={form.control}
                name="plotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePlots.map((plot) => (
                          <SelectItem key={plot.id} value={plot.id}>
                            {plot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The specific plot for this harvest</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="plannedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Planned Harvest Date</FormLabel>
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
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>The date when you plan to harvest</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedYield"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Yield (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter estimated yield"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>The estimated yield in kilograms</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTeamMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Team Members</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team members" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="team-a">Team A</SelectItem>
                      <SelectItem value="team-b">Team B</SelectItem>
                      <SelectItem value="team-c">Team C</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The team members assigned to this harvest</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Any additional notes or instructions for the harvest</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Harvest Plan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
