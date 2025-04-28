"use client"

import { useState } from "react"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { enhancedGrowthSchema, type EnhancedGrowthFormValues } from "@/lib/validations/form-schemas"
import { farms, plots, growthStages, workers } from "@/lib/mock-data"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface GrowthFormProps {
  onSubmit: (values: EnhancedGrowthFormValues) => void
}

export function GrowthForm({ onSubmit }: GrowthFormProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<EnhancedGrowthFormValues>({
    resolver: zodResolver(enhancedGrowthSchema),
    defaultValues: {
      date: new Date(),
      notes: "",
      isNewPlant: false,
      plantCount: 1,
      autoFillRows: false,
    },
  })

  const isNewPlant = form.watch("isNewPlant")

  return (
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
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {plots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>
                      {plot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Growth Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a growth stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {growthStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
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
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isNewPlant"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>New Plant</FormLabel>
                <FormDescription>Check this if you are recording a new plant being planted</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {isNewPlant && (
          <>
            <FormField
              control={form.control}
              name="plantCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Plants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>Enter the number of plants being planted</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoFillRows"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Auto-fill Rows</FormLabel>
                    <FormDescription>Automatically fill available rows with plants</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Responsible Worker</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? workers.find((worker) => worker.id === field.value)?.name : "Select worker"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search worker..." />
                        <CommandList>
                          <CommandEmpty>No worker found.</CommandEmpty>
                          <CommandGroup>
                            {workers.map((worker) => (
                              <CommandItem
                                value={worker.name}
                                key={worker.id}
                                onSelect={() => {
                                  form.setValue("workerId", worker.id)
                                  setOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    worker.id === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {worker.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select the worker responsible for planting</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any additional notes here..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  )
}
