"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { BuyerFormData } from "@/lib/types/buyer"

const buyerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  company: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  preferredProducts: z.string().transform((val) =>
    val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
  notes: z.string().optional(),
})

interface BuyerFormProps {
  defaultValues?: Partial<BuyerFormData>
  onSubmit: (data: BuyerFormData) => Promise<void>
  isSubmitting?: boolean
}

export function BuyerForm({ defaultValues, onSubmit, isSubmitting = false }: BuyerFormProps) {
  const form = useForm<z.infer<typeof buyerFormSchema>>({
    resolver: zodResolver(buyerFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      company: defaultValues?.company || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      preferredProducts: defaultValues?.preferredProducts?.join(", ") || "",
      notes: defaultValues?.notes || "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof buyerFormSchema>) => {
    await onSubmit(values as BuyerFormData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter buyer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredProducts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Products</FormLabel>
              <FormControl>
                <Input placeholder="Enter preferred products" {...field} />
              </FormControl>
              <FormDescription>Enter products separated by commas</FormDescription>
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
                <Textarea placeholder="Enter additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : defaultValues ? "Update Buyer" : "Add Buyer"}
        </Button>
      </form>
    </Form>
  )
}
