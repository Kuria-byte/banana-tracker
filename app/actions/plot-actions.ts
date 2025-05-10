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

    // Prepare a deep copy of the layout to update mainPlantId/activePlantIds/suckerIds
    let updatedLayout = Array.isArray(values.layoutStructure)
      ? values.layoutStructure.map(row => ({
          ...row,
          holes: row.holes.map(hole => ({
            ...hole,
            status: String(hole.status),
            plantHealth: hole.plantHealth ? String(hole.plantHealth) : "Healthy",
            suckerIds: Array.isArray(hole.suckerIds) ? hole.suckerIds : [],
            mainPlantId: hole.mainPlantId,
            activePlantIds: hole.activePlantIds ?? [],
            targetSuckerCount: hole.targetSuckerCount ?? 3,
            currentSuckerCount: hole.currentSuckerCount ?? 0,
            plantedDate: hole.plantedDate,
            notes: hole.notes ?? '',
            rowNumber: hole.rowNumber,
            holeNumber: hole.holeNumber,
          })) as any // type assertion for compatibility
        })) as any // type assertion for compatibility
      : [];

    let totalPlants = 0;

    // After plot creation, create initial growth records for each PLANTED hole
    if (Array.isArray(updatedLayout)) {
      for (const row of updatedLayout) {
        if (!Array.isArray(row.holes)) continue;
        for (const hole of row.holes) {
          if (hole.status === "PLANTED") {
            try {
              // Create main plant growth record
              const mainGrowthRecord = await createGrowthRecord({
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
              hole.mainPlantId = mainGrowthRecord.id;
              // Generate suckers
              const suckerCount = hole.currentSuckerCount ?? 0;
              const suckerIds: number[] = [];
              for (let i = 0; i < suckerCount; i++) {
                const suckerGrowthRecord = await createGrowthRecord({
                  farmId: Number(values.farmId),
                  plotId: newPlot.id,
                  rowNumber: row.rowNumber,
                  holeNumber: hole.holeNumber,
                  isMainPlant: false,
                  parentPlantId: mainGrowthRecord.id,
                  stage: "Sucker",
                  recordDate: hole.plantedDate ? new Date(hole.plantedDate) : new Date(),
                  notes: hole.notes || undefined,
                  metrics: {},
                })
                suckerIds.push(suckerGrowthRecord.id)
              }
              hole.suckerIds = suckerIds
              hole.activePlantIds = [mainGrowthRecord.id, ...suckerIds]
              hole.currentSuckerCount = suckerIds.length
              totalPlants += 1 + suckerIds.length
            } catch (err) {
              console.error(`Failed to create growth record for row ${row.rowNumber}, hole ${hole.holeNumber}:`, err)
              // Continue with other holes
            }
          }
        }
      }
      // Update the plot's layoutStructure in the DB with mainPlantId/activePlantIds/suckerIds
      await updatePlotLayout(newPlot.id, updatedLayout)
      // Update plant_count in the plot
      await plotRepository.updatePlot(newPlot.id, {
        ...values,
        plantCount: totalPlants,
        layoutStructure: updatedLayout,
      })
    }

    // Revalidate the farm page to show the new plot
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Plot added successfully! Initial growth records created for planted holes (including suckers).",
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
