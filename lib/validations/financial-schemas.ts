import * as z from "zod"

// Sales form schema
export const salesFormSchema = z.object({
  farmId: z.string().min(1, {
    message: "Please select a farm.",
  }),
  plotId: z.string().optional().nullable(),
  harvestRecordId: z.string().optional().nullable(),
  date: z.date({
    required_error: "Please select a date.",
  }),
  product: z.string().min(1, {
    message: "Please enter a product name.",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be a positive number.",
  }),
  unitPrice: z.coerce.number().positive({
    message: "Unit price must be a positive number.",
  }),
  buyerId: z.string().min(1, {
    message: "Please select a buyer.",
  }),
  paymentStatus: z.enum(["Paid", "Pending", "Partial"], {
    required_error: "Please select a payment status.",
  }),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Mobile Money"]).optional(),
  notes: z.string().optional(),
})

export type SalesFormValues = z.infer<typeof salesFormSchema>

// Expense form schema
export const expenseFormSchema = z.object({
  farmId: z.string().min(1, {
    message: "Please select a farm.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Mobile Money"], {
    required_error: "Please select a payment method.",
  }),
  notes: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

// Report form schema
export const reportFormSchema = z.object({
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }),
  farmIds: z.array(z.string()).optional(),
  reportType: z.enum(["sales", "expenses"], {
    required_error: "Please select a report type.",
  }),
  format: z.enum(["pdf", "csv"]).default("pdf"),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>
