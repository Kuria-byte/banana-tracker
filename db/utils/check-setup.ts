import { db } from "../client"
import { farms, plots, tasks } from "../schema"

export async function checkDatabaseSetup() {
  try {
    console.log("Checking database setup...")

    // Check if tables exist by querying them
    const tablesStatus = {
      farms: false,
      plots: false,
      tasks: false,
    }

    try {
      const farmsCount = await db.select({ count: db.fn.count() }).from(farms)
      tablesStatus.farms = true
      console.log(`Farms table exists with ${farmsCount[0].count} records`)
    } catch (error) {
      console.error("Farms table check failed:", error)
    }

    try {
      const plotsCount = await db.select({ count: db.fn.count() }).from(plots)
      tablesStatus.plots = true
      console.log(`Plots table exists with ${plotsCount[0].count} records`)
    } catch (error) {
      console.error("Plots table check failed:", error)
    }

    try {
      const tasksCount = await db.select({ count: db.fn.count() }).from(tasks)
      tablesStatus.tasks = true
      console.log(`Tasks table exists with ${tasksCount[0].count} records`)
    } catch (error) {
      console.error("Tasks table check failed:", error)
    }

    // Check overall status
    const allTablesExist = Object.values(tablesStatus).every((status) => status)

    if (allTablesExist) {
      console.log("Database setup is complete!")
      return true
    } else {
      console.log("Database setup is incomplete. Some tables are missing.")
      return false
    }
  } catch (error) {
    console.error("Database setup check failed:", error)
    return false
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkDatabaseSetup()
    .then((isSetup) => {
      if (!isSetup) {
        console.log("Please run the database migration script to set up the database.")
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("Error checking database setup:", error)
      process.exit(1)
    })
}
