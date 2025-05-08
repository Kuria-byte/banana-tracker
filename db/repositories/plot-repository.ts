import { db } from "../client"
import { plots } from "../schema"
import { eq } from "drizzle-orm"
import type { Plot, RowData, HoleData } from "../../lib/types/plot"
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
  const result = await db.select().from(plots).where(eq(plots.id, id)).limit(1)
  if (result.length === 0) return null
  const dbPlot = result[0]
  return {
    id: typeof dbPlot.id === "number" ? dbPlot.id : Number(dbPlot.id),
    name: dbPlot.name,
    farmId: typeof dbPlot.farmId === "number" ? dbPlot.farmId : Number(dbPlot.farmId),
    area: dbPlot.area ? Number(dbPlot.area) : 0,
    soilType: dbPlot.soilType ?? "",
    rowCount: dbPlot.rowCount ?? 0,
    plantCount: dbPlot.plantCount ?? 0,
    holes: dbPlot.holes ?? 0,
    layoutStructure: Array.isArray(dbPlot.layoutStructure) ? dbPlot.layoutStructure : [],
    createdAt: dbPlot.createdAt ? dbPlot.createdAt.toISOString?.() ?? dbPlot.createdAt : "",
    updatedAt: dbPlot.updatedAt ? dbPlot.updatedAt.toISOString?.() ?? dbPlot.updatedAt : "",
    plantedDate: dbPlot.plantedDate ? dbPlot.plantedDate.toISOString?.() ?? dbPlot.plantedDate : undefined,
    cropType: dbPlot.cropType ?? undefined,
    status: dbPlot.status ?? undefined,
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
      rowCount: values.rowCount ?? 0,
      holeCount: values.holeCount ?? 0,
      plantCount: values.plantCount ?? 0,
      layoutStructure: values.layoutStructure ?? null,
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
      rowCount: values.rowCount ?? 0,
      holeCount: values.holeCount ?? 0,
      plantCount: values.plantCount ?? 0,
      layoutStructure: values.layoutStructure ?? null,
      updatedAt: new Date(),
    }

    const result = await db.update(plots).set(plotData).where(eq(plots.id, id)).returning()

    return plotDbToModel(result[0])
  } catch (error) {
    console.error(`Error updating plot with id ${id}:`, error)
    throw new Error(`Failed to update plot with id ${id}`)
  }
}

export async function deletePlot(id: number, farmId: number): Promise<boolean> {
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

export async function updatePlotLayout(id: number, layout: RowData[]): Promise<void> {
  await db.update(plots).set({ layoutStructure: layout }).where(eq(plots.id, id))
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
    id: typeof dbPlot.id === "number" ? dbPlot.id : Number(dbPlot.id),
    name: dbPlot.name,
    farmId: typeof dbPlot.farmId === "number" ? dbPlot.farmId : Number(dbPlot.farmId),
    area: dbPlot.area ? Number(dbPlot.area) : 0,
    soilType: dbPlot.soilType ?? "",
    rowCount: dbPlot.rowCount ?? 0,
    plantCount: dbPlot.plantCount ?? 0,
    holes: dbPlot.holes ?? 0,
    layoutStructure: Array.isArray(dbPlot.layoutStructure) ? dbPlot.layoutStructure : [],
    createdAt: dbPlot.createdAt ? dbPlot.createdAt.toISOString?.() ?? dbPlot.createdAt : "",
    updatedAt: dbPlot.updatedAt ? dbPlot.updatedAt.toISOString?.() ?? dbPlot.updatedAt : "",
    plantedDate: dbPlot.plantedDate ? dbPlot.plantedDate.toISOString?.() ?? dbPlot.plantedDate : undefined,
    cropType: dbPlot.cropType ?? undefined,
    status: dbPlot.status ?? undefined,
  }
}

// Add a row to a plot
export async function addRowToPlot(plotId: number, row: RowData) {
  const plot = await getPlotById(plotId);
  if (!plot) throw new Error("Plot not found");
  const newLayout = [...plot.layoutStructure, row];
  await updatePlotLayout(plotId, newLayout);
}

// Update a row in a plot
export async function updateRowInPlot(plotId: number, rowNumber: number, data: Partial<RowData>) {
  const plot = await getPlotById(plotId);
  if (!plot) throw new Error("Plot not found");
  const newLayout = plot.layoutStructure.map((row) =>
    row.rowNumber === rowNumber ? { ...row, ...data } : row
  );
  await updatePlotLayout(plotId, newLayout);
}

// Delete a row from a plot
export async function deleteRowFromPlot(plotId: number, rowNumber: number) {
  const plot = await getPlotById(plotId);
  if (!plot) throw new Error("Plot not found");
  const newLayout = plot.layoutStructure.filter((row) => row.rowNumber !== rowNumber);
  await updatePlotLayout(plotId, newLayout);
}

// Add a hole to a row
export async function addHoleToRow(plotId: number, rowNumber: number, hole: HoleData) {
  const plot = await getPlotById(plotId);
  if (!plot) throw new Error("Plot not found");
  const newLayout = plot.layoutStructure.map((row) =>
    row.rowNumber === rowNumber ? { ...row, holes: [...row.holes, hole] } : row
  );
  await updatePlotLayout(plotId, newLayout);
}

// Update a hole in a row
export async function updateHoleInRow(plotId: number, rowNumber: number, holeNumber: number, data: Partial<HoleData>) {
  const plot = await getPlotById(plotId);
  if (!plot) throw new Error("Plot not found");
  const newLayout = plot.layoutStructure.map((row) => {
    if (row.rowNumber !== rowNumber) return row;
    return {
      ...row,
      holes: row.holes.map((hole) =>
        hole.holeNumber === holeNumber ? { ...hole, ...data } : hole
      ),
    };
  });
  await updatePlotLayout(plotId, newLayout);
}
