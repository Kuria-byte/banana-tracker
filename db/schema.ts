import { pgTable, serial, text, varchar, timestamp, boolean, integer, decimal, pgEnum, json } from "drizzle-orm/pg-core"

// Define enums for constrained fields
export const healthStatusEnum = pgEnum("health_status", ["GOOD", "AVERAGE", "POOR"])
export const plantHealthStatusEnum = pgEnum("plant_health_status", ["Healthy", "Diseased", "Pest-affected", "Damaged"])
export const taskStatusEnum = pgEnum("task_status", ["PENDING", "IN_PROGRESS", "COMPLETED"])
export const taskPriorityEnum = pgEnum("task_priority", ["LOW", "MEDIUM", "HIGH"])
export const taskTypeEnum = pgEnum("task_type", [
  "Planting",
  "Harvesting",
  "Maintenance",
  "Input Application",
  "Inspection",
])
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MANAGER"])
export const paymentStatusEnum = pgEnum("payment_status", ["Paid", "Pending", "Partial"])
export const paymentMethodEnum = pgEnum("payment_method", ["Cash", "Bank Transfer", "Mobile Money"])
export const expenseStatusEnum = pgEnum("expense_status", ["Paid", "Pending", "Partial"])
export const expensePaymentMethodEnum = pgEnum("expense_payment_method", ["Cash", "Bank Transfer", "Mobile Money"])

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  stackAuthId: varchar("stack_auth_id", { length: 64 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  password: varchar("password", { length: 255 }),
  image: text("image"),
  avatar: varchar("avatar", { length: 255 }),
  status: varchar("status", { length: 32 }),
  salary: integer("salary"),
  startDate: timestamp("start_date"),
  location: varchar("location", { length: 128 }),
  responsibilities: json("responsibilities"),
  skills: json("skills"),
  role: userRoleEnum("role").default("MANAGER").notNull(),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
})

// Farms table
export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  regionCode: varchar("region_code", { length: 16 }),
  groupCode: varchar("group_code", { length: 8 }),
  size: decimal("size"),
  healthScore: integer("health_score").default(0),
  healthStatus: healthStatusEnum("health_status").default("AVERAGE"),
  isActive: boolean("is_active").default(true),
  creatorId: integer("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Plots table
export const plots = pgTable("plots", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  area: decimal("area"),
  plantedDate: timestamp("planted_date"),
  cropType: varchar("crop_type", { length: 64 }).default("BANANA"),
  status: varchar("status", { length: 32 }).default("ACTIVE"),
  holes: integer("holes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  rowCount: integer("row_count").default(0),
  plantCount: integer("plant_count").default(0),
  layoutStructure: json("layout_structure"),
  soilType: varchar("soil_type", { length: 64 }),
})

// Rows table
export const rows = pgTable("rows", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id").references(() => plots.id).notNull(),
  rowNumber: integer("row_number").notNull(),
  length: decimal("length"),
  spacing: decimal("spacing"),
  holeCount: integer("hole_count").default(0),
  holesData: json("holes_data"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  farmId: integer("farm_id").references(() => farms.id),
  status: taskStatusEnum("status").default("PENDING"),
  priority: taskPriorityEnum("priority").default("MEDIUM"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  assigneeId: integer("assignee_id").references(() => users.id),
  creatorId: integer("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Task comments
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  content: text("content"),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Enhance growth records for better plant tracking
export const growthRecords: any = pgTable("growth_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  plotId: integer("plot_id").references(() => plots.id),
  recordDate: timestamp("record_date").defaultNow().notNull(),
  stage: varchar("stage", { length: 32 }),
  notes: text("notes"),
  metrics: json("metrics"),
  creatorId: integer("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // New fields for plant tracking
  rowNumber: integer("row_number"),
  holeNumber: integer("hole_number"),
  isMainPlant: boolean("is_main_plant").default(true),
  parentPlantId: integer("parent_plant_id").references(() => growthRecords.id),
})

// Farm inspections
export const farmInspections = pgTable("farm_inspections", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  inspectionDate: timestamp("inspection_date").defaultNow().notNull(),
  inspector: varchar("inspector", { length: 255 }),
  score: integer("score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Inspection metrics
export const inspectionMetrics = pgTable("inspection_metrics", {
  id: serial("id").primaryKey(),
  metricName: varchar("metric_name", { length: 64 }),
  score: integer("score"),
  maxScore: integer("max_score"),
  notes: text("notes"),
})

// Farm health metrics
export const farmHealthMetrics = pgTable("farm_health_metrics", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  metricDate: timestamp("metric_date").defaultNow().notNull(),
  watering: integer("watering").default(0),
  weeding: integer("weeding").default(0),
  desuckering: integer("desuckering").default(0),
  deleafing: integer("deleafing").default(0),
  cuttingMiramba: integer("cutting_miramba").default(0),
  pestControl: integer("pest_control").default(0),
  propping: integer("propping").default(0),
  maturePlantains: integer("mature_plantains").default(0),
  bananaHealth: integer("banana_health").default(0),
  fencing: integer("fencing").default(0),
  underReporting: integer("under_reporting").default(0),
  totalScore: integer("total_score").default(0),
  status: healthStatusEnum("status").default("AVERAGE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Harvest records
export const harvestRecords = pgTable("harvest_records", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  harvestDate: timestamp("harvest_date").defaultNow().notNull(),
  quantity: integer("quantity"),
  weight: decimal("weight"),
  quality: varchar("quality", { length: 32 }).default("AVERAGE"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Knowledge articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  category: varchar("category", { length: 64 }),
  tags: text("tags"),
  published: boolean("published").default(false),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Weather records
export const weatherRecords = pgTable("weather_records", {
  id: serial("id").primaryKey(),
  location: varchar("location", { length: 255 }),
  recordDate: timestamp("record_date").defaultNow().notNull(),
  temperature: decimal("temperature"),
  humidity: decimal("humidity"),
  windSpeed: decimal("wind_speed"),
  rainfall: decimal("rainfall"),
  conditions: varchar("conditions", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Sales
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  product: varchar("product", { length: 128 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  totalAmount: decimal("total_amount").notNull(),
  buyerId: varchar("buyer_id", { length: 64 }).notNull(),
  buyerName: varchar("buyer_name", { length: 255 }),
  paymentStatus: paymentStatusEnum("payment_status").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  notes: text("notes"),
})

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  amount: decimal("amount").notNull(),
  description: text("description"),
  recordedBy: integer("recorded_by").references(() => users.id),
  notes: text("notes"),
  status: expenseStatusEnum("status").default("Pending"),
  paymentMethod: expensePaymentMethodEnum("payment_method"),
})

// Budgets table
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id).notNull(),
  year: integer("year").notNull(),
  category: varchar("category", { length: 64 }),
  amount: decimal("amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Buyers table
export const buyers = pgTable("buyers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add NextAuth tables (Account, Session, VerificationToken) as needed, following your auth provider's requirements.
