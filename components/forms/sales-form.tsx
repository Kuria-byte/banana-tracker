"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

import { salesFormSchema, type SalesFormValues } from "@/lib/validations/financial-schemas"
import { addSaleRecord } from "@/app/actions/owner-dashboard-actions"
import { cn } from "@/lib/utils"
import { getAllFarms } from "@/app/actions/farm-actions"
import { getAllUsers } from "@/app/actions/team-actions"
import { getBuyers } from "@/app/actions/buyer-actions"
import { getPlotsByFarmId } from "@/app/actions/plot-actions"
import { useUser } from "@stackframe/stack"

interface SalesFormProps {
  onSuccess?: () => void
}

export function SalesForm({ onSuccess }: SalesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [farms, setFarms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [buyers, setBuyers] = useState<any[]>([])
  const [plots, setPlots] = useState<any[]>([])
  const [loadingFarms, setLoadingFarms] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingBuyers, setLoadingBuyers] = useState(true)
  const [loadingPlots, setLoadingPlots] = useState(false)
  const [errorFarms, setErrorFarms] = useState<string | null>(null)
  const [errorUsers, setErrorUsers] = useState<string | null>(null)
  const [errorBuyers, setErrorBuyers] = useState<string | null>(null)
  const [errorPlots, setErrorPlots] = useState<string | null>(null)
  const user = useUser()

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      date: new Date(),
      quantity: 0,
      unitPrice: 0,
      paymentStatus: "Paid",
      paymentMethod: "Cash",
      userId: undefined,
      plotId: "NONE",
    },
  })

  // Fetch farms, users, buyers on mount
  useEffect(() => {
    setLoadingFarms(true)
    getAllFarms()
      .then((res) => setFarms(res.farms || []))
      .catch(() => setErrorFarms("Failed to load farms"))
      .finally(() => setLoadingFarms(false))
    setLoadingUsers(true)
    getAllUsers()
      .then((data) => setUsers(data))
      .catch(() => setErrorUsers("Failed to load users"))
      .finally(() => setLoadingUsers(false))
    setLoadingBuyers(true)
    getBuyers()
      .then((data) => setBuyers(data))
      .catch(() => setErrorBuyers("Failed to load buyers"))
      .finally(() => setLoadingBuyers(false))
  }, [])

  // Fetch plots when farm changes
  const watchFarmId = form.watch("farmId")
  useEffect(() => {
    if (watchFarmId) {
      setLoadingPlots(true)
      getPlotsByFarmId(Number(watchFarmId))
        .then((res) => setPlots(res.plots || []))
        .catch(() => setErrorPlots("Failed to load plots"))
        .finally(() => setLoadingPlots(false))
      // Clear plotId if farm changes
      form.setValue("plotId", "NONE")
    } else {
      setPlots([])
      form.setValue("plotId", "NONE")
    }
  }, [watchFarmId])

  // Set default userId to current user if available
  useEffect(() => {
    if (user && user.id && !form.getValues("userId")) {
      form.setValue("userId", String(user.id))
    }
  }, [user])

  // Calculate total amount
  const quantity = form.watch("quantity") || 0
  const unitPrice = form.watch("unitPrice") || 0
  const totalAmount = quantity * unitPrice

  async function onSubmit(values: SalesFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addSaleRecord({
        ...values,
        date: values.date.toISOString(),
        plotId: values.plotId === "NONE" ? null : values.plotId,
      })
      if (result.success) {
        toast({
          title: "Sale recorded successfully",
          description: "The sale has been added to the system.",
        })
        form.reset()
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error recording sale",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error recording sale",
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* TODO: Replace with dynamic products if needed */}
                    <SelectItem value="Bananas (Ripened)">Bananas (Ripened)</SelectItem>
                    <SelectItem value="Bananas (Green)">Bananas (Green)</SelectItem>
                    <SelectItem value="Coffee Beans (Grade AA)">Coffee Beans (Grade AA)</SelectItem>
                    <SelectItem value="Tea Leaves (Premium)">Tea Leaves (Premium)</SelectItem>
                    <SelectItem value="Wheat (Grade 1)">Wheat (Grade 1)</SelectItem>
                    <SelectItem value="Maize">Maize</SelectItem>
                    <SelectItem value="Avocados">Avocados</SelectItem>
                    <SelectItem value="Mangoes">Mangoes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buyerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingBuyers || !!errorBuyers}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingBuyers ? "Loading..." : errorBuyers ? errorBuyers : "Select a buyer"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingBuyers ? (
                      <div className="p-2 text-muted-foreground">Loading buyers...</div>
                    ) : errorBuyers ? (
                      <div className="p-2 text-destructive">{errorBuyers}</div>
                    ) : buyers.length === 0 ? (
                      <div className="p-2 text-muted-foreground">No buyers found</div>
                    ) : (
                      buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={String(buyer.id)}>
                          {buyer.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
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
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price (KES)</FormLabel>
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
          <div className="flex flex-col space-y-1.5">
            <FormLabel>Total Amount (KES)</FormLabel>
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
              {totalAmount.toLocaleString()}
            </div>
            <FormDescription>Calculated automatically</FormDescription>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
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
        </div>
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who Recorded</FormLabel>
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
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information about this sale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording Sale...
            </>
          ) : (
            "Record Sale"
          )}
        </Button>
      </form>
    </Form>
  )
}
