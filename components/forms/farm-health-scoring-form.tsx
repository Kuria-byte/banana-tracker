"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, InfoIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import type { ScoringParameter } from "@/lib/types/farm-health"
import { createScoringRecord } from "@/app/actions/farm-health-actions"

// Create a schema for the form
const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date for this assessment.",
  }),
  notes: z.string().optional(),
  parameters: z.array(
    z.object({
      parameterId: z.string(),
      score: z.number().min(0),
    }),
  ),
})

type FormValues = z.infer<typeof formSchema>

interface FarmHealthScoringFormProps {
  farmId: string
  parameters: ScoringParameter[]
  onSuccess?: () => void
}

export function FarmHealthScoringForm({ farmId, parameters, onSuccess }: FarmHealthScoringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      notes: "",
      parameters: parameters.map((param) => ({
        parameterId: param.id,
        score: 0,
      })),
    },
  })

  // Calculate the maximum possible score
  const maxPossibleScore = parameters.reduce((total, param) => total + param.maxPoints, 0)

  // Calculate the current score based on form values
  const currentScore = form.watch("parameters").reduce((total, param) => {
    return total + param.score
  }, 0)

  // Calculate the score percentage
  const scorePercentage = maxPossibleScore > 0 ? Math.round((currentScore / maxPossibleScore) * 100) : 0

  // Get the health status color based on the score percentage
  const getHealthStatusColor = () => {
    if (scorePercentage >= 80) return "text-green-600"
    if (scorePercentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setError(null)

    try {
      // In a real app, you would get the user ID from authentication
      const userId = "user1"

      const result = await createScoringRecord(farmId, values.parameters, values.notes || "", userId)

      if (result.success) {
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(result.error || "Failed to create scoring record")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Assessment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full pl-3 text-left font-normal">
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
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-end">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Score</p>
                    <p className="text-2xl font-bold">
                      {currentScore} / {maxPossibleScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Status</p>
                    <p className={`text-2xl font-bold ${getHealthStatusColor()}`}>{scorePercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Scoring Parameters</h3>

          {parameters.map((parameter, index) => (
            <FormField
              key={parameter.id}
              control={form.control}
              name={`parameters.${index}.score`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-base">{parameter.name}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{parameter.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={parameter.maxPoints}
                          className="w-16 text-center"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <span className="text-muted-foreground">/ {parameter.maxPoints}</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this assessment..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Include any observations or issues that need attention.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Assessment"}
        </Button>
      </form>
    </Form>
  )
}
