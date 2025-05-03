import { z } from "zod"

export const buyerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  company: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().optional(),
  preferredProducts: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string(),
  lastPurchaseDate: z.string().optional(),
})

export type BuyerFormValues = z.infer<typeof buyerSchema>
