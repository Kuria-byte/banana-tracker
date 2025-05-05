"use server"

import { revalidatePath } from "next/cache"
import type { PlotFormValues } from "@/lib/validations/form-schemas"
import * as plotRepository from "@/db/repositories/plot-repository-fallback"

export async function addPlot(values: PlotFormValues) {
  try {
    // Create the plot in the database (with fallback to mock data)
    const newPlot = await plotRepository.createPlot(values)

    // Revalidate the farm page to show the new plot
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Plot added successfully!",
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

export async function updatePlot(plotId: string, values: PlotFormValues) {
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

export async function deletePlot(plotId: string, farmId: string) {
  try {
    // Delete the plot from the database (with fallback to mock data)
    const success = await plotRepository.deletePlot(plotId)

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

// Add a new function to get a plot by ID
export async function getPlotById(plotId: string) {
  try {
    const plot = await plotRepository.getPlotById(plotId)

    if (!plot) {
      return {
        success: false,
        error: "Plot not found.",
      }
    }

    return {
      success: true,
      plot,
    }
  } catch (error) {
    console.error(`Error fetching plot with id ${plotId}:`, error)
    return {
      success: false,
      error: "Failed to fetch plot. Please try again.",
    }
  }
}

// Add a new function to get plots by farm ID
export async function getPlotsByFarmId(farmId: string) {
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

export async function deletePlotAction(id: string) {
  try {
    const success = await deletePlot(Number(id));
    return { success, message: success ? "Plot deleted" : "Failed to delete plot" };
  } catch (e) {
    return { success: false, message: "Error deleting plot" };
  }
}
