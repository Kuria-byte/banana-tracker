"use server"

import { revalidatePath } from "next/cache"
import type { GrowthFormValues } from "@/lib/validations/form-schemas"
import { createGrowthRecord, updateGrowthRecord as repoUpdateGrowthRecord } from "@/db/repositories/growth-records-repository"
import { getPlotById, updatePlotLayout } from "@/db/repositories/plot-repository"

export async function recordGrowth(values: GrowthFormValues) {
  try {
    const plotId = Number(values.plotId)
    const plot = await getPlotById(plotId)
    if (!plot) throw new Error("Plot not found")
    let updatedLayout = Array.isArray(plot.layoutStructure)
      ? plot.layoutStructure.map(row => ({
          ...row,
          holes: row.holes.map(hole => ({
            ...hole,
            status: hole.status as 'PLANTED' | 'EMPTY' | 'HARVESTED',
            plantHealth: hole.plantHealth as 'Healthy' | 'Diseased' | 'Pest-affected' | 'Damaged' | undefined,
          }))
        }))
      : [];
    // Handle bulk planting if isNewPlanting is true
    if (values.isNewPlanting && values.plantCount && values.plantCount > 1) {
      let createdCount = 0;
      for (const row of updatedLayout) {
        for (const hole of row.holes) {
          if (hole.status === "EMPTY" && createdCount < values.plantCount) {
            const growthRecord = await createGrowthRecord({
              ...values,
              isMainPlant: true,
              rowNumber: row.rowNumber,
              holeNumber: hole.holeNumber,
            })
            hole.status = "PLANTED"
            hole.mainPlantId = growthRecord.id
            hole.activePlantIds = [growthRecord.id]
            createdCount++
          }
        }
        if (createdCount >= values.plantCount) break;
      }
      await updatePlotLayout(plotId, updatedLayout)
    } else if (values.isNewPlanting) {
      // Single new plant
      for (const row of updatedLayout) {
        if (row.rowNumber === Number(values.rowId)) {
          for (const hole of row.holes) {
            if (hole.status === "EMPTY") {
              const growthRecord = await createGrowthRecord({
                ...values,
                isMainPlant: true,
                rowNumber: row.rowNumber,
                holeNumber: hole.holeNumber,
              })
              hole.status = "PLANTED"
              hole.mainPlantId = growthRecord.id
              hole.activePlantIds = [growthRecord.id]
              break;
            }
          }
        }
      }
      await updatePlotLayout(plotId, updatedLayout)
    } else {
      // Add a growth record for an existing plant (not new planting)
      await createGrowthRecord({
        ...values,
        isMainPlant: false,
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
