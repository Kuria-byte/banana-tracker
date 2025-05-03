import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// This script will check the database connection and log a message
async function runMigration() {
  try {
    console.log("Checking database connection and schema setup...")

    // Create a connection to the database
    const sql = neon(process.env.DATABASE_URL!)
    const db = drizzle(sql, { schema })

    // Try a simple query to ensure connection works
    await db.execute('SELECT 1')
    console.log("Database connection is working. (Manual schema management assumed)")
    // If you want to create tables manually, do so here with raw SQL or Drizzle ORM
  } catch (error) {
    console.error("Migration/check failed:", error)
    process.exit(1)
  }
}

// Only run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
}

export { runMigration }
