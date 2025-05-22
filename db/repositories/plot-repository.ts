import { db } from "../client"
import { plots, farms } from "../schema"
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
  try {
    const result = await db.select().from(plots).where(eq(plots.id, id)).limit(1)
    if (result.length === 0) return null
    return plotDbToModel(result[0])
  } catch (error) {
    console.error(`Error fetching plot with id ${id}:`, error)
    return null
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
    console.log("Creating plot with values:", values)
    
    const plotData = {
      farmId: Number.parseInt(values.farmId),
      name: values.name,
      area: values.area.toString(),
      soilType: values.soilType || null,
      plantedDate: values.dateEstablished, // Use dateEstablished as plantedDate
      status: values.healthStatus || "ACTIVE",
      rowCount: values.rowCount ?? 0,
      holes: values.holeCount ?? 0, // Map holeCount to holes field
      plantCount: values.plantCount ?? 0,
      layoutStructure: values.layoutStructure ?? null,
      cropType: "BANANA", // Default crop type
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Inserting plot data:", plotData)
    
    const result = await db.insert(plots).values(plotData).returning()
    console.log("Plot created successfully:", result[0])

    // Note: Removed plot count update since the column doesn't exist
    // If you need to track plot counts, you'll need to add the column to the farms table first

    return plotDbToModel(result[0])
  } catch (error) {
    console.error("Error creating plot:", error)
    throw new Error("Failed to create plot")
  }
}

export async function updatePlot(id: number, values: PlotFormValues): Promise<Plot> {
  try {
    console.log("Updating plot with id:", id, "values:", values)
    
    const plotData = {
      name: values.name,
      area: values.area.toString(),
      soilType: values.soilType || null,
      plantedDate: values.dateEstablished, // Use dateEstablished as plantedDate
      status: values.healthStatus || "ACTIVE",
      rowCount: values.rowCount ?? 0,
      holes: values.holeCount ?? 0, // Map holeCount to holes field
      plantCount: values.plantCount ?? 0,
      layoutStructure: values.layoutStructure ?? null,
      updatedAt: new Date(),
    }

    const result = await db.update(plots).set(plotData).where(eq(plots.id, id)).returning()

    if (result.length === 0) {
      throw new Error(`Plot with id ${id} not found`)
    }

    return plotDbToModel(result[0])
  } catch (error) {
    console.error(`Error updating plot with id ${id}:`, error)
    throw new Error(`Failed to update plot with id ${id}`)
  }
}

export async function deletePlot(id: number, farmId: number): Promise<boolean> {
  try {
    const result = await db.delete(plots).where(eq(plots.id, id)).returning({ id: plots.id })
    return result.length > 0
  } catch (error) {
    console.error(`Error deleting plot with id ${id}:`, error)
    throw new Error(`Failed to delete plot with id ${id}`)
  }
}

export async function updatePlotLayout(id: number, layout: RowData[]): Promise<void> {
  try {
    await db.update(plots).set({ 
      layoutStructure: layout,
      updatedAt: new Date()
    }).where(eq(plots.id, id))
  } catch (error) {
    console.error(`Error updating plot layout for id ${id}:`, error)
    throw new Error(`Failed to update plot layout for id ${id}`)
  }
}

// Helper function to convert database plot to model plot
function plotDbToModel(dbPlot: any): Plot {
  return {
    id: typeof dbPlot.id === "number" ? dbPlot.id : Number(dbPlot.id),
    name: dbPlot.name || "",
    farmId: typeof dbPlot.farmId === "number" ? dbPlot.farmId : Number(dbPlot.farmId),
    area: dbPlot.area ? Number(dbPlot.area) : 0,
    soilType: dbPlot.soilType ?? "",
    rowCount: dbPlot.rowCount ?? 0,
    plantCount: dbPlot.plantCount ?? 0,
    holes: dbPlot.holes ?? 0,
    holeCount: dbPlot.holes ?? 0, // Map holes to holeCount for compatibility
    layoutStructure: Array.isArray(dbPlot.layoutStructure) ? dbPlot.layoutStructure : [],
    createdAt: dbPlot.createdAt ? (typeof dbPlot.createdAt === 'string' ? dbPlot.createdAt : dbPlot.createdAt.toISOString()) : new Date().toISOString(),
    updatedAt: dbPlot.updatedAt ? (typeof dbPlot.updatedAt === 'string' ? dbPlot.updatedAt : dbPlot.updatedAt.toISOString()) : new Date().toISOString(),
    plantedDate: dbPlot.plantedDate ? (typeof dbPlot.plantedDate === 'string' ? dbPlot.plantedDate : dbPlot.plantedDate.toISOString()) : undefined,
    dateEstablished: dbPlot.plantedDate ? (typeof dbPlot.plantedDate === 'string' ? new Date(dbPlot.plantedDate) : dbPlot.plantedDate) : undefined,
    cropType: dbPlot.cropType ?? "BANANA",
    status: dbPlot.status ?? "ACTIVE",
    healthStatus: dbPlot.status ?? "Good", // Map status to healthStatus for form compatibility
    leaseYears: dbPlot.leaseYears ?? null,
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
  
  // Ensure enhanced fields are initialized
  const enhancedHole: HoleData = {
    ...hole,
    mainPlantId: hole.mainPlantId ?? undefined,
    activePlantIds: hole.activePlantIds ?? (hole.mainPlantId ? [hole.mainPlantId] : []),
    targetSuckerCount: hole.targetSuckerCount ?? 3,
    currentSuckerCount: hole.currentSuckerCount ?? 0,
    plantedDate: hole.plantedDate ?? undefined,
    notes: hole.notes ?? '',
    suckerIds: hole.suckerIds ?? [],
  };
  
  const newLayout = plot.layoutStructure.map((row) =>
    row.rowNumber === rowNumber ? { ...row, holes: [...row.holes, enhancedHole] } : row
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
        hole.holeNumber === holeNumber
          ? {
              ...hole,
              ...data,
              mainPlantId: data.mainPlantId ?? hole.mainPlantId,
              activePlantIds: data.activePlantIds ?? hole.activePlantIds ?? (hole.mainPlantId ? [hole.mainPlantId] : []),
              targetSuckerCount: data.targetSuckerCount ?? hole.targetSuckerCount ?? 3,
              currentSuckerCount: data.currentSuckerCount ?? hole.currentSuckerCount ?? 0,
              plantedDate: data.plantedDate ?? hole.plantedDate,
              notes: data.notes ?? hole.notes ?? '',
              suckerIds: data.suckerIds ?? hole.suckerIds ?? [],
            }
          : hole
      ),
    };
  });
  await updatePlotLayout(plotId, newLayout);
}