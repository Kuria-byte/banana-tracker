import "dotenv/config";
import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Configure Neon for connection caching
neonConfig.fetchConnectionCache = true

// Create a connection function with proper error handling
function createNeonConnection() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set")
    throw new Error("Database connection string is not configured")
  }

  try {
    return neon(connectionString)
  } catch (error) {
    console.error("Failed to create database connection:", error)
    throw new Error("Failed to initialize database connection")
  }
}

// Create a SQL client with proper error handling
const sql = createNeonConnection()

// Create a drizzle client with the SQL client
export const db = drizzle(sql, { schema })

// Export the SQL client for raw queries if needed
export { sql }

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    // Simple query to check if the database is accessible
    const result = await sql`SELECT 1 as connected`
    return result[0]?.connected === 1
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}
