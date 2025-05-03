import { db } from "../db/client"
import { plots, farms } from "../db/schema"
import { plots as mockPlots } from "../lib/mock-data"
import { eq } from "drizzle-orm"

async function migratePlots() {
  try {
    console.log("Starting plot data migration...")

    // Check if we already have plots in the database
    const existingPlots = await db.select({ count: db.fn.count() }).from(plots)

    if (Number.parseInt(existingPlots[0].count) > 0) {
      console.log(`Found ${existingPlots[0].count} existing plots in the database. Skipping migration.`)
      return
    }

    // Get all farms from the database to map IDs
    const dbFarms = await db.select().from(farms)

    // Create a map of mock farm IDs to database farm IDs
    const farmIdMap = new Map()
    for (const dbFarm of dbFarms) {
      // Find the corresponding mock farm by name (since names should be unique)
      const mockFarm = mockPlots.find((p) => p.farmId === dbFarm.id.toString())
      if (mockFarm) {
        farmIdMap.set(mockFarm.farmId, dbFarm.id)
      }
    }

    // Prepare plot data for insertion
    const plotsToInsert = mockPlots.map((plot) => ({
      farmId: farmIdMap.get(plot.farmId) || Number.parseInt(plot.farmId),
      name: plot.name,
      area: plot.area,
      soilType: plot.soilType,
      dateEstablished: new Date(plot.dateEstablished),
      rowCount: plot.rowCount,
      healthStatus: plot.healthStatus,
    }))

    // Insert plots into the database
    const insertedPlots = await db.insert(plots).values(plotsToInsert).returning()

    console.log(`Successfully migrated ${insertedPlots.length} plots to the database.`)

    // Update farm plot counts
    for (const farm of dbFarms) {
      const plotCount = await db.select({ count: db.fn.count() }).from(plots).where(eq(plots.farmId, farm.id))

      await db
        .update(farms)
        .set({ plotCount: Number.parseInt(plotCount[0].count), updatedAt: new Date() })
        .where(eq(farms.id, farm.id))
    }

    console.log("Updated farm plot counts.")
    console.log("Plot data migration completed successfully!")
  } catch (error) {
    console.error("Plot data migration failed:", error)
    process.exit(1)
  }
}

migratePlots()
