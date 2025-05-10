"use server"

import { revalidatePath } from "next/cache"
import type { GrowthFormValues } from "@/lib/validations/form-schemas"
import { createGrowthRecord, updateGrowthRecord as repoUpdateGrowthRecord } from "@/db/repositories/growth-records-repository"

export async function recordGrowth(values: GrowthFormValues) {
  try {
    // Handle bulk planting if isNewPlanting is true
    if (values.isNewPlanting && values.plantCount && values.plantCount > 1) {
      // Create multiple plant records
      for (let i = 0; i < values.plantCount; i++) {
        await createGrowthRecord({
          ...values,
          isMainPlant: true,
          rowNumber: values.rowId ? Number(values.rowId) : undefined,
          // Optionally, assign holeNumber if available
        })
      }
    } else {
      // Add a single growth record
      await createGrowthRecord({
        ...values,
        isMainPlant: values.isNewPlanting ?? false,
        rowNumber: values.rowId ? Number(values.rowId) : undefined,
        // Optionally, assign holeNumber if available
      })
    }
    // Revalidate the growth page to show the new record
    revalidatePath("/growth")
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")
    return {
      success: true,
      message: values.isNewPlanting ? "New plants added successfully!" : "Growth stage recorded successfully!",
    }
  } catch (error) {
    console.error("Error recording growth:", error)
    return {
      success: false,
      error: "Failed to record growth stage. Please try again.",
    }
  }
}

export async function updateGrowthRecord(recordId: string, values: GrowthFormValues) {
  try {
    await repoUpdateGrowthRecord(Number(recordId), values)
    revalidatePath("/growth")
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")
    return {
      success: true,
      message: "Growth record updated successfully!",
    }
  } catch (error) {
    console.error("Error updating growth record:", error)
    return {
      success: false,
      error: "Failed to update growth record. Please try again.",
    }
  }
}

// Add this to the existing actions
export async function recordEnhancedGrowth(formData: any) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Recording enhanced growth:", formData)

    // Handle new plant logic
    if (formData.isNewPlant) {
      console.log(`Adding ${formData.plantCount} new plants`)

      if (formData.autoFillRows) {
        console.log("Auto-filling rows with plants")
        // Logic to distribute plants across available rows would go here
      }

      if (formData.workerId) {
        console.log(`Worker responsible: ${formData.workerId}`)
      }
    }

    return { success: true, message: "Growth record added successfully" }
  } catch (error) {
    console.error("Failed to record growth:", error)
    return { success: false, message: "Failed to record growth" }
  }
}
