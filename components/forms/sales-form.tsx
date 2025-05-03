"use client"

import { useState } from "react"
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

// Mock data for farms and buyers
const farms = [
  { id: "farm1", name: "Nyeri Coffee Estate" },
  { id: "farm2", name: "Meru Tea Plantation" },
  { id: "farm3", name: "Nakuru Wheat Farm" },
]

const buyers = [
  { id: "buyer1", name: "Nairobi Grocers Ltd" },
  { id: "buyer2", name: "Mombasa Exports Co." },
  { id: "buyer3", name: "Kisumu Fresh Markets" },
  { id: "buyer4", name: "Kenya National Cereals Board" },
]

const products = [
  "Coffee Beans (Grade AA)",
  "Tea Leaves (Premium)",
  "Wheat (Grade 1)",
  "Maize",
  "Bananas (Ripened)",
  "Bananas (Green)",
  "Avocados",
  "Mangoes",
]

interface SalesFormProps {
  onSuccess?: () => void
}

export function SalesForm({ onSuccess }: SalesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      date: new Date(),
      quantity: 0,
      unitPrice: 0,
      paymentStatus: "Paid",
      paymentMethod: "Cash",
    },
  })

  async function onSubmit(values: SalesFormValues) {
    setIsSubmitting(true)
    try {
      const result = await addSaleRecord({
        ...values,
        date: values.date.toISOString(),
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

  // Calculate total amount
  const quantity = form.watch("quantity") || 0
  const unitPrice = form.watch("unitPrice") || 0
  const totalAmount = quantity * unitPrice

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
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
            name="buyerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a buyer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.name}
                      </SelectItem>
                    ))}
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
