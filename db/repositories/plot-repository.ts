import { db } from "../client"
import { plots } from "../schema"
import { eq } from "drizzle-orm"
import type { Plot } from "@/lib/mock-data"
import type { PlotFormValues } from "@/lib/validations/form-schemas"

export async function getAllPlots(): Promise<Plot[]> {
  try {
    const result = await db.select().from(plots)
    return result.map(plotDbToModel)
  } catch (error) {
    console.error("Error fetching plots:", error)
    throw new Error("Failed to fetch plots")
  }
}

export async function getPlotById(id: number): Promise<Plot | null> {
  try {
    const result = await db.select().from(plots).where(eq(plots.id, id)).limit(1)
    return result.length > 0 ? plotDbToModel(result[0]) : null
  } catch (error) {
    console.error(`Error fetching plot with id ${id}:`, error)
    throw new Error(`Failed to fetch plot with id ${id}`)
  }
}

export async function getPlotsByFarmId(farmId: number): Promise<Plot[]> {
  try {
    const result = await db.select().from(plots).where(eq(plots.farmId, farmId))
    return result.map(plotDbToModel)
  } catch (error) {
    console.error(`Error fetching plots for farm with id ${farmId}:`, error)
    throw new Error(`Failed to fetch plots for farm with id ${farmId}`)
  }
}

export async function createPlot(values: PlotFormValues): Promise<Plot> {
  try {
    const plotData = {
      farmId: Number.parseInt(values.farmId),
      name: values.name,
      area: values.area.toString(),
      soilType: values.soilType,
      plantedDate: (values as any).plantedDate ?? values.dateEstablished,
      healthStatus: values.healthStatus,
      holes: (values as any).holes ?? 0,
      rowCount: 0,
    }

    const result = await db.insert(plots).values(plotData).returning()

    // Update the farm's plot count
    await updateFarmPlotCount(plotData.farmId)

    return plotDbToModel(result[0])
  } catch (error) {
    console.error("Error creating plot:", error)
    throw new Error("Failed to create plot")
  }
}

export async function updatePlot(id: number, values: PlotFormValues): Promise<Plot> {
  try {
    const plotData = {
      name: values.name,
      area: values.area.toString(),
      soilType: values.soilType,
      plantedDate: (values as any).plantedDate ?? values.dateEstablished,
      healthStatus: values.healthStatus,
      holes: (values as any).holes ?? 0,
      updatedAt: new Date(),
    }

    const result = await db.update(plots).set(plotData).where(eq(plots.id, id)).returning()

    return plotDbToModel(result[0])
  } catch (error) {
    console.error(`Error updating plot with id ${id}:`, error)
    throw new Error(`Failed to update plot with id ${id}`)
  }
}

export async function deletePlot(id: number): Promise<boolean> {
  try {
    // Get the farm ID before deleting the plot
    const plotResult = await db.select({ farmId: plots.farmId }).from(plots).where(eq(plots.id, id)).limit(1)
    const farmId = plotResult[0]?.farmId

    const result = await db.delete(plots).where(eq(plots.id, id)).returning({ id: plots.id })

    // Update the farm's plot count if the plot was deleted and we have the farm ID
    if (result.length > 0 && farmId) {
      await updateFarmPlotCount(farmId)
    }

    return result.length > 0
  } catch (error) {
    console.error(`Error deleting plot with id ${id}:`, error)
    throw new Error(`Failed to delete plot with id ${id}`)
  }
}

// Helper function to update a farm's plot count
async function updateFarmPlotCount(farmId: number): Promise<void> {
  try {
    // Count the plots for this farm
    const result = await db.select().from(plots).where(eq(plots.farmId, farmId))
    const plotCount = result.length

    // Update the farm's plot count
    await db.execute(`UPDATE farms SET plot_count = ${plotCount}, updated_at = NOW() WHERE id = ${farmId}`)
  } catch (error) {
    console.error(`Error updating plot count for farm with id ${farmId}:`, error)
    // Don't throw here, as this is a secondary operation
  }
}

// Helper function to convert database plot to model plot
function plotDbToModel(dbPlot: any): Plot {
  return {
    id: dbPlot.id.toString(),
    farmId: dbPlot.farmId.toString(),
    name: dbPlot.name,
    area: dbPlot.area ? Number.parseFloat(dbPlot.area) : 0,
    soilType: dbPlot.soilType,
    dateEstablished: dbPlot.plantedDate ? dbPlot.plantedDate.toISOString() : "",
    rowCount: dbPlot.rowCount ?? 0,
    healthStatus: dbPlot.healthStatus,
    holes: dbPlot.holes !== null && dbPlot.holes !== undefined ? Number(dbPlot.holes) : 0,
  }
}
