"use server"

import { revalidatePath } from "next/cache"
import type { GrowthFormValues } from "@/lib/validations/form-schemas"

export async function recordGrowth(values: GrowthFormValues) {
  try {
    // In a real app, you would save this data to a database
    // For now, we'll just simulate a successful save
    console.log("Recording growth:", values)

    // Handle bulk planting if isNewPlanting is true
    if (values.isNewPlanting && values.plantCount && values.plantCount > 1) {
      console.log(`Adding ${values.plantCount} new plants to plot ${values.plotId}`)

      // In a real app, you would create multiple plant records
      // For now, we'll just simulate the bulk addition
      const newPlantingRecords = Array.from({ length: values.plantCount }).map((_, index) => ({
        id: `plant-${Date.now()}-${index}`,
        farmId: values.farmId,
        plotId: values.plotId,
        plantingDate: values.dateRecorded.toISOString(),
        healthStatus: values.healthStatus,
        workerId: values.workerId,
        varietyName: values.varietyName,
        plantingSpacing: values.plantingSpacing,
      }))

      console.log(`Created ${newPlantingRecords.length} new plant records`)
    } else {
      // Simulate adding a single growth record
      const newGrowthRecord = {
        id: `growth-${Date.now()}`,
        farmId: values.farmId,
        plotId: values.plotId,
        rowId: values.rowId,
        plantPosition: values.plantPosition,
        growthStage: values.growthStage,
        dateRecorded: values.dateRecorded.toISOString(),
        expectedHarvestDate: values.expectedHarvestDate?.toISOString(),
        healthStatus: values.healthStatus,
        notes: values.notes,
        suckerCount: values.suckerCount,
        suckerAgeToMaturity: values.suckerAgeToMaturity,
        suckerHealth: values.suckerHealth,
        suckerHeight: values.suckerHeight,
        workerId: values.workerId,
      }

      console.log("Created growth record:", newGrowthRecord)
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
    // In a real app, you would update this data in a database
    // For now, we'll just simulate a successful update
    console.log("Updating growth record:", { id: recordId, ...values })

    // Revalidate the growth page to show the updated record
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
