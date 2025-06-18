"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

import { expenseFormSchema, type ExpenseFormValues } from "@/lib/validations/financial-schemas"
import { addExpenseRecord } from "@/app/actions/owner-dashboard-actions"
import { cn } from "@/lib/utils"
import { getAllFarms } from "@/app/actions/farm-actions"
import { getAllUsers } from "@/app/actions/team-actions"
import { getPlotsByFarmId } from "@/app/actions/plot-actions"

// Expense categories
const expenseCategories = [
  "Fertilizer",
  "Pesticides",
  "Seeds",
  "Labor",
  "Equipment",
  "Fuel",
  "Irrigation",
  "Maintenance",
  "Transport",
  "Utilities",
  "Rent",
  "Other",
]

interface ExpenseFormProps {
  onSuccess?: () => void
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [farms, setFarms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [plots, setPlots] = useState<any[]>([])
  const [loadingFarms, setLoadingFarms] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingPlots, setLoadingPlots] = useState(false)
  const [errorFarms, setErrorFarms] = useState<string | null>(null)
  const [errorUsers, setErrorUsers] = useState<string | null>(null)
  const [errorPlots, setErrorPlots] = useState<string | null>(null)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      paymentMethod: "Cash",
      plotId: "NONE",
    },
  })

  // Fetch farms and users on mount
  useEffect(() => {
    setLoadingFarms(true)
    getAllFarms()
      .then((res) => setFarms(res.farms || []))
      .catch((err) => {
        setErrorFarms("Failed to load farms")
        console.error("Error loading farms:", err)
      })
      .finally(() => setLoadingFarms(false))
    setLoadingUsers(true)
    getAllUsers()
      .then((data) => setUsers(data))
      .catch((err) => {
        setErrorUsers("Failed to load users")
        console.error("Error loading users:", err)
      })
      .finally(() => setLoadingUsers(false))
  }, [])

  // Fetch plots when farm changes
  const watchFarmId = form.watch("farmId")
  useEffect(() => {
    if (watchFarmId) {
      setLoadingPlots(true)
      getPlotsByFarmId(Number(watchFarmId))
        .then((res) => setPlots(res.plots || []))
        .catch((err) => {
          setErrorPlots("Failed to load plots")
          console.error("Error loading plots:", err)
        })
        .finally(() => setLoadingPlots(false))
      // Clear plotId if farm changes
      form.setValue("plotId", "NONE")
    } else {
      setPlots([])
      form.setValue("plotId", "NONE")
    }
  }, [watchFarmId])

  // Watch category for user select
  const watchCategory = form.watch("category")
  const showUserSelect = ["Salaries", "Labour", "Labor"].includes(watchCategory)

  async function onSubmit(values: ExpenseFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addExpenseRecord({
        ...values,
        date: values.date.toISOString(),
        plotId: values.plotId === "NONE" ? null : values.plotId,
      })
      if (result.success) {
        toast({
          title: "Expense recorded successfully",
          description: "The expense has been added to the system.",
        })
        form.reset()
        if (onSuccess) onSuccess()
      } else {
        console.error("Error recording expense:", result.error)
        toast({
          title: "Error recording expense",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Unexpected error recording expense:", error)
      toast({
        title: "Error recording expense",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="farmId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farm</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingFarms || !!errorFarms}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingFarms ? "Loading..." : errorFarms ? errorFarms : "Select a farm"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingFarms ? (
                      <div className="p-2 text-muted-foreground">Loading farms...</div>
                    ) : errorFarms ? (
                      <div className="p-2 text-destructive">{errorFarms}</div>
                    ) : farms.length === 0 ? (
                      <div className="p-2 text-muted-foreground">No farms found</div>
                    ) : (
                      farms.map((farm) => (
                        <SelectItem key={farm.id} value={String(farm.id)}>
                          {farm.name}
                        </SelectItem>
                      ))
                    )}
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
                <Select onValueChange={field.onChange} value={field.value || "NONE"} disabled={loadingPlots || !watchFarmId || !!errorPlots}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPlots ? "Loading..." : errorPlots ? errorPlots : !watchFarmId ? "Select a farm first" : "Select a plot"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingPlots ? (
                      <div className="p-2 text-muted-foreground">Loading plots...</div>
                    ) : errorPlots ? (
                      <div className="p-2 text-destructive">{errorPlots}</div>
                    ) : plots.length === 0 ? (
                      <div className="p-2 text-muted-foreground">No plots found</div>
                    ) : (
                      [<SelectItem key="NONE" value="NONE">None</SelectItem>, ...plots.map((plot) => (
                        <SelectItem key={plot.id} value={String(plot.id)}>
                          {plot.name}
                        </SelectItem>
                      ))]
                    )}
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
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (KES)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {showUserSelect && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Involved</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingUsers || !!errorUsers}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUsers ? "Loading..." : errorUsers ? errorUsers : "Select a user"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingUsers ? (
                      <div className="p-2 text-muted-foreground">Loading users...</div>
                    ) : errorUsers ? (
                      <div className="p-2 text-destructive">{errorUsers}</div>
                    ) : users.length === 0 ? (
                      <div className="p-2 text-muted-foreground">No users found</div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the expense" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information about this expense" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording Expense...
            </>
          ) : (
            "Record Expense"
          )}
        </Button>
      </form>
    </Form>
  )
}
