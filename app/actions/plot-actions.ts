"use server"

import { revalidatePath } from "next/cache"
import type { PlotFormValues } from "@/lib/validations/form-schemas"
import * as plotRepository from "@/db/repositories/plot-repository"
import { updatePlotLayout } from "@/db/repositories/plot-repository"
import type { RowData, HoleData } from "@/lib/types/plot"
import { createGrowthRecord } from "@/db/repositories/growth-records-repository"

export async function addPlot(values: PlotFormValues) {
  try {
    // Create the plot in the database (with fallback to mock data)
    const newPlot = await plotRepository.createPlot(values)

    // After plot creation, create initial growth records for each PLANTED hole
    if (Array.isArray(values.layoutStructure)) {
      for (const row of values.layoutStructure) {
        if (!Array.isArray(row.holes)) continue;
        for (const hole of row.holes) {
          if (hole.status === "PLANTED") {
            try {
              await createGrowthRecord({
                farmId: Number(values.farmId),
                plotId: newPlot.id,
                rowNumber: row.rowNumber,
                holeNumber: hole.holeNumber,
                isMainPlant: true,
                stage: "Planted",
                recordDate: hole.plantedDate ? new Date(hole.plantedDate) : new Date(),
                notes: hole.notes || undefined,
                metrics: {},
              })
            } catch (err) {
              console.error(`Failed to create growth record for row ${row.rowNumber}, hole ${hole.holeNumber}:`, err)
              // Continue with other holes
            }
          }
        }
      }
    }

    // Revalidate the farm page to show the new plot
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Plot added successfully! Initial growth records created for planted holes.",
      plot: newPlot,
    }
  } catch (error) {
    console.error("Error adding plot:", error)
    return {
      success: false,
      error: "Failed to add plot. Please try again.",
    }
  }
}

export async function updatePlot(plotId: number, values: PlotFormValues) {
  try {
    // Update the plot in the database (with fallback to mock data)
    const updatedPlot = await plotRepository.updatePlot(plotId, values)

    // Revalidate the farm page to show the updated plot
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Plot updated successfully!",
      plot: updatedPlot,
    }
  } catch (error) {
    console.error("Error updating plot:", error)
    return {
      success: false,
      error: "Failed to update plot. Please try again.",
    }
  }
}

export async function deletePlot(plotId: number, farmId: number) {
  try {
    // Delete the plot from the database (with fallback to mock data)
    const success = await plotRepository.deletePlot(plotId, farmId)

    if (!success) {
      return {
        success: false,
        error: "Plot not found or could not be deleted.",
      }
    }

    // Revalidate the farm page to remove the deleted plot
    revalidatePath(`/farms/${farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Plot deleted successfully!",
    }
  } catch (error) {
    console.error("Error deleting plot:", error)
    return {
      success: false,
      error: "Failed to delete plot. Please try again.",
    }
  }
}

// Add a new function to get all plots
export async function getAllPlots() {
  try {
    const plots = await plotRepository.getAllPlots()
    return {
      success: true,
      plots,
    }
  } catch (error) {
    console.error("Error fetching plots:", error)
    return {
      success: false,
      error: "Failed to fetch plots. Please try again.",
      plots: [],
    }
  }
}

// Fix getPlotById to return just the plot for internal use
export async function getPlotById(plotId: number) {
    const plot = await plotRepository.getPlotById(plotId)
  if (!plot) throw new Error("Plot not found")
  return plot
}

// Add a new function to get plots by farm ID
export async function getPlotsByFarmId(farmId: number) {
  try {
    const plots = await plotRepository.getPlotsByFarmId(farmId)
    return {
      success: true,
      plots,
    }
  } catch (error) {
    console.error(`Error fetching plots for farm with id ${farmId}:`, error)
    return {
      success: false,
      error: "Failed to fetch plots. Please try again.",
      plots: [],
    }
  }
}

export async function deletePlotAction(id: number, farmId: number) {
  try {
    const result = await deletePlot(id, farmId)
    return { success: result.success, message: result.success ? "Plot deleted" : "Failed to delete plot" }
  } catch (e) {
    return { success: false, message: "Error deleting plot" }
  }
}

export async function getPlotWithRows(plotId: number) {
  return await getPlotById(plotId)
}

// Fix addRowToPlot, updateRowInPlot, deleteRowFromPlot, addHoleToRow, updateHoleInRow to use the correct plot object
export async function addRowToPlot(plotId: number, row: RowData) {
  const plot = await getPlotById(plotId)
  const newLayout = [...plot.layoutStructure, row]
  await updatePlotLayout(plotId, newLayout)
}

export async function updateRowInPlot(plotId: number, rowNumber: number, data: Partial<RowData>) {
  const plot = await getPlotById(plotId)
  const newLayout = plot.layoutStructure.map((row: RowData) =>
    row.rowNumber === rowNumber ? { ...row, ...data } : row
  )
  await updatePlotLayout(plotId, newLayout)
}

export async function deleteRowFromPlot(plotId: number, rowNumber: number) {
  const plot = await getPlotById(plotId)
  const newLayout = plot.layoutStructure.filter((row: RowData) => row.rowNumber !== rowNumber)
  await updatePlotLayout(plotId, newLayout)
}

export async function addHoleToRow(plotId: number, rowNumber: number, hole: HoleData) {
  const plot = await getPlotById(plotId)
  const newLayout = plot.layoutStructure.map((row: RowData) =>
    row.rowNumber === rowNumber ? { ...row, holes: [...row.holes, hole] } : row
  )
  await updatePlotLayout(plotId, newLayout)
}

export async function updateHoleInRow(plotId: number, rowNumber: number, holeNumber: number, data: Partial<HoleData>) {
  const plot = await getPlotById(plotId)
  const newLayout = plot.layoutStructure.map((row: RowData) => {
    if (row.rowNumber !== rowNumber) return row
    return {
      ...row,
      holes: row.holes.map((hole: HoleData) =>
        hole.holeNumber === holeNumber ? { ...hole, ...data } : hole
      ),
    }
  })
  await updatePlotLayout(plotId, newLayout)
}
