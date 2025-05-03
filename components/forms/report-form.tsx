"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { reportFormSchema, type ReportFormValues } from "@/lib/validations/financial-schemas"
import { generateReport } from "@/app/actions/owner-dashboard-actions"
import { cn } from "@/lib/utils"

// Mock data for farms
const farms = [
  { id: "farm1", name: "Nyeri Coffee Estate" },
  { id: "farm2", name: "Meru Tea Plantation" },
  { id: "farm3", name: "Nakuru Wheat Farm" },
]

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFarms, setSelectedFarms] = useState<string[]>([])

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(),
      reportType: "sales",
      format: "pdf",
    },
  })

  async function onSubmit(values: ReportFormValues) {
    setIsSubmitting(true)
    try {
      // Add selected farms to the form values
      const reportOptions = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        farmIds: selectedFarms.length > 0 ? selectedFarms : undefined,
      }

      const result = await generateReport(reportOptions)

      if (result.success) {
        toast({
          title: "Report generated successfully",
          description: `Your ${values.reportType} report is ready for download.`,
        })

        // In a real app, we would handle the download here
        // For now, we'll just show a success message
        console.log("Report data:", result.data)
      } else {
        toast({
          title: "Error generating report",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error generating report",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleFarm(farmId: string) {
    setSelectedFarms((prev) => (prev.includes(farmId) ? prev.filter((id) => id !== farmId) : [...prev, farmId]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Financial Report</CardTitle>
        <CardDescription>Create customized reports for sales and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="expenses">Expense Report</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Select Farms (Optional)</FormLabel>
              <FormDescription>Leave unselected to include all farms in the report</FormDescription>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {farms.map((farm) => (
                  <div key={farm.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`farm-${farm.id}`}
                      checked={selectedFarms.includes(farm.id)}
                      onCheckedChange={() => toggleFarm(farm.id)}
                    />
                    <label
                      htmlFor={`farm-${farm.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {farm.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
