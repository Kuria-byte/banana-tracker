import { db } from "@/db/client";
import { validateSQL } from "./sql-validator";

export async function executeSafeQuery(sql: string, userId?: number): Promise<{ rows?: any[]; error?: string }> {
  const validation = validateSQL(sql, true); // relaxed mode
  if (!validation.valid) {
    return { error: validation.reason || "Invalid SQL" };
  }
  try {
    // Drizzle ORM: use db.execute(sql) for raw queries
    // Only allow SELECT
    if (!/^\s*SELECT/i.test(sql)) {
      return { error: "Only SELECT queries are allowed." };
    }
    // Optionally, add row-level security here using userId
    // For now, just execute
    const result = await db.execute(sql);
    // Drizzle returns { rows: [...] }
    if (Array.isArray(result.rows)) {
      return { rows: result.rows };
    }
    // Some Drizzle versions may return array directly
    if (Array.isArray(result)) {
      return { rows: result };
    }
    return { rows: [] };
  } catch (error: any) {
    console.error("SQL execution error:", error);
    return { error: error.message || "Query execution failed" };
  }
} 