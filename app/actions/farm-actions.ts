"use server"

import { revalidatePath } from "next/cache"
import type { FarmFormValues } from "@/lib/validations/form-schemas"
import * as farmRepository from "@/db/repositories/farm-repository"

export async function createFarm(values: FarmFormValues) {
  try {
    // Create the farm using the repository (with fallback to mock data)
    const newFarm = await farmRepository.createFarm(values)

    // Revalidate the farm page to show the new farm
    revalidatePath("/farms")
    revalidatePath("/")

    return {
      success: true,
      message: "Farm added successfully!",
      farm: newFarm,
    }
  } catch (error) {
    console.error("Error adding farm:", error)
    return {
      success: false,
      error: "Failed to add farm. Please try again.",
    }
  }
}

export async function updateFarm(farmId: string, values: FarmFormValues) {
  try {
    // Update the farm using the repository (with fallback to mock data)
    const updatedFarm = await farmRepository.updateFarm(Number.parseInt(farmId), values)

    // Revalidate the farm page to show the updated farm
    revalidatePath(`/farms/${farmId}`)
    revalidatePath("/farms")
    revalidatePath("/")

    return {
      success: true,
      message: "Farm updated successfully!",
      farm: updatedFarm,
    }
  } catch (error) {
    console.error("Error updating farm:", error)
    return {
      success: false,
      error: "Failed to update farm. Please try again.",
    }
  }
}

// Add a new function to get all farms
export async function getAllFarms() {
  try {
    const farms = await farmRepository.getAllFarms()
    return {
      success: true,
      farms,
    }
  } catch (error) {
    console.error("Error fetching farms:", error)
    return {
      success: false,
      error: "Failed to fetch farms. Please try again.",
      farms: [],
    }
  }
}

// Add a new function to get a farm by ID
export async function getFarmById(farmId: string) {
  try {
    const farm = await farmRepository.getFarmById(Number.parseInt(farmId))

    if (!farm) {
      return {
        success: false,
        error: "Farm not found.",
      }
    }

    return {
      success: true,
      farm,
    }
  } catch (error) {
    console.error(`Error fetching farm with id ${farmId}:`, error)
    return {
      success: false,
      error: "Failed to fetch farm. Please try again.",
    }
  }
}

export async function deleteFarm(farmId: string) {
  try {
    // In a real app, you would delete this farm from a database
    // For now, we'll just simulate a successful delete
    console.log("Deleted farm:", farmId)

    // Revalidate the farms page to remove the deleted farm
    revalidatePath("/farms")

    return {
      success: true,
      message: "Farm deleted successfully!",
    }
  } catch (error) {
    console.error("Error deleting farm:", error)
    return {
      success: false,
      message: "Failed to delete farm. Please try again.",
    }
  }
}
