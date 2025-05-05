import * as z from "zod"

// Farm form schema
export const farmFormSchema = z.object({
  name: z.string().min(1, "Farm name is required"),
  location: z.string().min(1, "Location is required"),
  area: z.number().min(0.01, "Area must be greater than 0"),
  dateEstablished: z.date(),
  teamLeaderId: z.string().optional(),
  healthStatus: z.string(),
  description: z.string().optional(),
  group_code: z.string().min(1, "Group code is required").max(8, "Group code must be at most 8 characters"),
})

export type FarmFormValues = z.infer<typeof farmFormSchema>

// Plot form schema
export const plotFormSchema = z.object({
  name: z.string().min(2, {
    message: "Plot name must be at least 2 characters.",
  }),
  farmId: z.string().min(1, {
    message: "Please select a farm.",
  }),
  area: z.coerce.number().positive({
    message: "Area must be a positive number.",
  }),
  soilType: z.string().min(1, {
    message: "Please select a soil type.",
  }),
  dateEstablished: z.date({
    required_error: "Please select a date.",
  }),
  healthStatus: z.enum(["Good", "Average", "Poor"]),
  description: z.string().optional(),
})

export type PlotFormValues = z.infer<typeof plotFormSchema>

// Task form schema
export const taskFormSchema = z.object({
  title: z.string().min(2, {
    message: "Task title must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  assignedToId: z.string().min(1, {
    message: "Please assign this task to someone.",
  }),
  farmId: z.string().min(1, {
    message: "Please select a farm.",
  }),
  plotId: z.string().optional(),
  rowId: z.string().optional(),
  dueDate: z.date({
    required_error: "Please select a due date.",
  }),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  type: z.enum(["Planting", "Harvesting", "Maintenance", "Input Application", "Inspection"]),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

// Growth record form schema
export const growthFormSchema = z.object({
  farmId: z.string().min(1, {
    message: "Please select a farm.",
  }),
  plotId: z.string().min(1, {
    message: "Please select a plot.",
  }),
  rowId: z.string().optional(),
  plantPosition: z.number().int().positive().optional(),
  growthStage: z.enum(["Flower Emergence", "Bunch Formation", "Fruit Development"]),
  dateRecorded: z.date({
    required_error: "Please select a record date.",
  }),
  expectedHarvestDate: z.date().optional(),
  healthStatus: z.enum(["Healthy", "Diseased", "Pest-affected", "Damaged"]),
  notes: z.string().optional(),
  // Sucker information fields
  suckerCount: z
    .number()
    .int()
    .min(0, {
      message: "Sucker count must be a non-negative integer.",
    })
    .optional(),
  suckerAgeToMaturity: z
    .number()
    .int()
    .min(0, {
      message: "Age to maturity must be a non-negative integer.",
    })
    .optional(),
  suckerHealth: z.enum(["Healthy", "Diseased", "Pest-affected", "Damaged"]).optional(),
  suckerHeight: z
    .number()
    .min(0, {
      message: "Height must be a non-negative number.",
    })
    .optional(),
  // New fields for planting
  isNewPlanting: z.boolean().default(false),
  plantCount: z
    .number()
    .int()
    .min(1, {
      message: "Plant count must be at least 1.",
    })
    .optional()
    .default(1),
  workerId: z.string().optional(),
  varietyName: z.string().optional(),
  plantingSpacing: z
    .number()
    .min(0.5, {
      message: "Spacing must be at least 0.5 meters.",
    })
    .optional(),
})

export type GrowthFormValues = z.infer<typeof growthFormSchema>

// Add this to the existing schemas
export const enhancedGrowthSchema = z.object({
  farmId: z.string().min(1, { message: "Farm is required" }),
  plotId: z.string().min(1, { message: "Plot is required" }),
  stage: z.string().min(1, { message: "Growth stage is required" }),
  date: z.date({
    required_error: "Date is required",
  }),
  notes: z.string().optional(),
  isNewPlant: z.boolean().default(false),
  plantCount: z.number().min(1).optional(),
  workerId: z.string().optional(),
  autoFillRows: z.boolean().default(false),
})

export type EnhancedGrowthFormValues = z.infer<typeof enhancedGrowthSchema>
