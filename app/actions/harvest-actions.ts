"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { harvestFormSchema, HarvestFormValues } from "@/lib/validations/form-schemas"
import { createHarvestRecord } from "@/db/repositories/harvest-repository"
import { getPlotById, updatePlotLayout } from "@/db/repositories/plot-repository"
import { getAllGrowthRecords, updateGrowthRecord as repoUpdateGrowthRecord } from "@/db/repositories/growth-records-repository"

export async function recordHarvestAction(values: HarvestFormValues) {
  try {
    // Validate the input values against our schema
    const parsed = harvestFormSchema.safeParse(values)
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.flatten().fieldErrors)
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
        error: "Please check the form for errors and try again."
      }
    }

    // 1. Update plot layout structure for selected holes
    const plotId = Number(parsed.data.plotId)
    
    // Verify plot exists
    const plot = await getPlotById(plotId)
    if (!plot) {
      console.error(`Plot not found with ID: ${plotId}`)
      return { success: false, error: "Plot not found." }
    }
    
    // Get selectedHoles from the validated data
    const selectedHoles = parsed.data.selectedHoles || []
    if (selectedHoles.length === 0) {
      return { 
        success: false, 
        error: "Please select at least one hole to harvest." 
      }
    }
    
    // Ensure plot has layoutStructure
    if (!Array.isArray(plot.layoutStructure) || plot.layoutStructure.length === 0) {
      console.error(`Plot ${plotId} has no layoutStructure`)
      return { success: false, error: "Plot layout structure is missing or invalid." }
    }
    
    console.log(`Updating ${selectedHoles.length} holes to HARVESTED status in plot ${plotId}`)
    
    // Create new layout with updated hole statuses
    const newLayout = plot.layoutStructure.map((row) => {
      if (!selectedHoles.some((h) => h.rowNumber === row.rowNumber)) return row
      return {
        ...row,
        holes: row.holes.map((hole) => {
          const isSelected = selectedHoles.some(sel => sel.rowNumber === row.rowNumber && sel.holeNumber === hole.holeNumber)
          if (isSelected && hole.status === "PLANTED") {
            // Promote sucker if available
            if (hole.activePlantIds && hole.activePlantIds.length > 1) {
              // Get all growth records for this plot
              // (Assume mainPlantId is first in activePlantIds, others are suckers)
              const mainPlantId = hole.mainPlantId
              const suckerIds = hole.activePlantIds.filter(id => id !== mainPlantId)
              if (suckerIds.length > 0) {
                // Promote the first sucker
                const newMainPlantId = suckerIds[0]
                // Update growth record for new main plant
                repoUpdateGrowthRecord(newMainPlantId, { isMainPlant: true, parentPlantId: null })
                // Optionally, update the old main plant record to mark as harvested
                if (mainPlantId) repoUpdateGrowthRecord(mainPlantId, { stage: "Harvested" })
                // Update hole fields
                return {
                  ...hole,
                  status: "HARVESTED" as "HARVESTED",
                  mainPlantId: newMainPlantId,
                  activePlantIds: [newMainPlantId, ...suckerIds.slice(1)],
                  currentSuckerCount: suckerIds.length - 1,
                }
              }
            }
            // No suckers to promote, just mark as harvested
            return { ...hole, status: "HARVESTED" as "HARVESTED" }
          }
          return { ...hole, status: hole.status as "PLANTED" | "EMPTY" | "HARVESTED" }
        })
      }
    })
    
    // Update the plot layout in the database
    await updatePlotLayout(plotId, newLayout)
    
    // 2. Create harvest record
    const repoData = {
      ...parsed.data,
      farmId: Number(parsed.data.farmId),
      plotId: plotId,
      userId: parsed.data.userId !== undefined ? Number(parsed.data.userId) : undefined,
      harvestDate: String(parsed.data.harvestDate),
      selectedHolesCount: selectedHoles.length,  // Store the count for reference
    }
    
    // Create harvest record in database
    const harvest = await createHarvestRecord(repoData)
    if (!harvest) {
      throw new Error("Failed to create harvest record.")
    }
    
    // Revalidate relevant paths to refresh UI
    revalidatePath(`/farms/${parsed.data.farmId}`)
    revalidatePath(`/farms/${parsed.data.farmId}/plots/${plotId}`)
    revalidatePath(`/dashboard`)
    
    return {
      success: true,
      message: `Harvest of ${selectedHoles.length} holes recorded successfully!`,
      harvest,
    }
  } catch (error) {
    console.error("Error recording harvest:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record harvest. Please try again.",
    }
  }
}