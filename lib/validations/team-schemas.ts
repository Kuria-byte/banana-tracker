import { z } from "zod"

export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  role: z.string().min(2, { message: "Role must be at least 2 characters" }),
  salary: z.number().nonnegative({ message: "Salary must be a non-negative number" }),
  responsibilities: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]),
  joinDate: z.string(),
})

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>
