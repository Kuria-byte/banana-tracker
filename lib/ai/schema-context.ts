import { farms, plots, tasks } from "@/db/schema";

export interface SchemaContext {
  tables: {
    name: string;
    description: string;
    columns: { name: string; type: string; description: string }[];
    relationships: { foreignKey: string; referencedTable: string; referencedColumn: string; description: string }[];
  }[];
  commonQueries: string[];
  businessTerms: { term: string; maps_to: string }[];
}

export function buildSchemaContext(userId: number): SchemaContext {
  return {
    tables: [
      {
        name: "users",
        description: "System users (farmers, managers, workers)",
        columns: [
          { name: "id", type: "integer", description: "User ID" },
          { name: "name", type: "string", description: "Full name" },
          { name: "email", type: "string", description: "Email address" },
          { name: "role", type: "enum", description: "User role (ADMIN, MANAGER)" },
          { name: "phone", type: "string", description: "Phone number" },
        ],
        relationships: []
      },
      {
        name: "farms",
        description: "Banana farms in the system",
        columns: [
          { name: "id", type: "integer", description: "Unique farm identifier" },
          { name: "name", type: "string", description: "Farm name" },
          { name: "location", type: "string", description: "Farm location/address" },
          { name: "region_code", type: "string", description: "Regional code (NKM, ELD, etc.)" },
          { name: "size", type: "decimal", description: "Farm size in acres" },
          { name: "health_status", type: "enum", description: "GOOD, AVERAGE, or POOR" },
          { name: "health_score", type: "integer", description: "Health score 0-100" },
          { name: "is_active", type: "boolean", description: "Whether farm is active" },
          { name: "created_at", type: "timestamp", description: "When farm was created" },
          { name: "creator_id", type: "integer", description: "User who created the farm" }
        ],
        relationships: [
          {
            foreignKey: "creator_id",
            referencedTable: "users",
            referencedColumn: "id",
            description: "Farm owner"
          }
        ]
      },
      {
        name: "plots",
        description: "Individual plots within farms",
        columns: [
          { name: "id", type: "integer", description: "Unique plot identifier" },
          { name: "name", type: "string", description: "Plot name" },
          { name: "farm_id", type: "integer", description: "Parent farm ID" },
          { name: "area", type: "decimal", description: "Plot area in acres" },
          { name: "plant_count", type: "integer", description: "Number of banana plants" },
          { name: "status", type: "string", description: "Plot status (ACTIVE, INACTIVE)" },
          { name: "planted_date", type: "timestamp", description: "When plot was planted" }
        ],
        relationships: [
          {
            foreignKey: "farm_id",
            referencedTable: "farms",
            referencedColumn: "id",
            description: "Parent farm"
          }
        ]
      },
      {
        name: "tasks",
        description: "Farm management tasks",
        columns: [
          { name: "id", type: "integer", description: "Unique task identifier" },
          { name: "title", type: "string", description: "Task title" },
          { name: "status", type: "enum", description: "PENDING, IN_PROGRESS, COMPLETED" },
          { name: "priority", type: "enum", description: "LOW, MEDIUM, HIGH" },
          { name: "due_date", type: "timestamp", description: "Task due date" },
          { name: "farm_id", type: "integer", description: "Associated farm" },
          { name: "assignee_id", type: "integer", description: "Assigned user" }
        ],
        relationships: []
      },
      {
        name: "harvest_records",
        description: "Records of banana harvests",
        columns: [
          { name: "id", type: "integer", description: "Harvest record ID" },
          { name: "farm_id", type: "integer", description: "Farm harvested" },
          { name: "plot_id", type: "integer", description: "Plot harvested" },
          { name: "user_id", type: "integer", description: "User who recorded the harvest" },
          { name: "harvest_date", type: "timestamp", description: "Date of harvest" },
          { name: "quantity", type: "integer", description: "Number of bunches harvested" },
          { name: "weight", type: "decimal", description: "Total weight harvested" },
          { name: "quality", type: "string", description: "Quality rating" }
        ],
        relationships: []
      },
      {
        name: "expenses",
        description: "Farm expenses",
        columns: [
          { name: "id", type: "integer", description: "Expense ID" },
          { name: "farm_id", type: "integer", description: "Farm" },
          { name: "date", type: "timestamp", description: "Expense date" },
          { name: "category", type: "string", description: "Expense category" },
          { name: "amount", type: "decimal", description: "Expense amount" },
          { name: "description", type: "string", description: "Expense description" },
          { name: "status", type: "enum", description: "Paid, Pending, Partial" }
        ],
        relationships: []
      },
      {
        name: "sales",
        description: "Farm produce sales",
        columns: [
          { name: "id", type: "integer", description: "Sale ID" },
          { name: "farm_id", type: "integer", description: "Farm" },
          { name: "date", type: "timestamp", description: "Sale date" },
          { name: "product", type: "string", description: "Product sold" },
          { name: "quantity", type: "integer", description: "Quantity sold" },
          { name: "unit_price", type: "decimal", description: "Unit price" },
          { name: "total_amount", type: "decimal", description: "Total sale amount" },
          { name: "buyer_id", type: "integer", description: "Buyer" }
        ],
        relationships: [
          {
            foreignKey: "buyer_id",
            referencedTable: "buyers",
            referencedColumn: "id",
            description: "Sale buyer"
          }
        ]
      },
      {
        name: "buyers",
        description: "Produce buyers",
        columns: [
          { name: "id", type: "integer", description: "Buyer ID" },
          { name: "name", type: "string", description: "Buyer name" },
          { name: "contact", type: "string", description: "Contact info" }
        ],
        relationships: []
      }
    ],
    commonQueries: [
      "SELECT * FROM farms LIMIT 100",
      "SELECT * FROM plots LIMIT 100",
      "SELECT * FROM tasks WHERE status = 'PENDING' LIMIT 100",
      "SELECT * FROM harvest_records WHERE harvest_date > NOW() - INTERVAL '30 days' LIMIT 100",
      "SELECT * FROM expenses WHERE status = 'Pending' LIMIT 100",
      "SELECT * FROM sales WHERE date > NOW() - INTERVAL '90 days' LIMIT 100"
    ],
    businessTerms: [
      { term: "unhealthy farms", maps_to: "farms WHERE health_status = 'POOR'" },
      { term: "pending tasks", maps_to: "tasks WHERE status = 'PENDING'" },
      { term: "total plants", maps_to: "SUM(plant_count) FROM plots" },
      { term: "recent harvests", maps_to: "harvest_records WHERE harvest_date > NOW() - INTERVAL '30 days'" },
      { term: "outstanding expenses", maps_to: "expenses WHERE status = 'Pending'" },
      { term: "top buyers", maps_to: "buyers ORDER BY total_amount DESC" }
    ]
  };
} 