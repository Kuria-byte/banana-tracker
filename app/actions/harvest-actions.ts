"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { harvestFormSchema, HarvestFormValues } from "@/lib/validations/form-schemas"
import { createHarvestRecord } from "@/db/repositories/harvest-repository"
import { getPlotById, updatePlotLayout } from "@/db/repositories/plot-repository"
import { getAllGrowthRecords, updateGrowthRecord as repoUpdateGrowthRecord, createGrowthRecord } from "@/db/repositories/growth-records-repository"

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
    
    // Build a list of update actions for growth records
    const growthRecordUpdates: Promise<any>[] = [];
    const harvestedGrowthRecordIds: number[] = [];
    const newLayout = plot.layoutStructure.map((row) => {
      if (!selectedHoles.some((h) => h.rowNumber === row.rowNumber)) return row
      return {
        ...row,
        holes: row.holes.map((hole) => {
          const isSelected = selectedHoles.some(sel => sel.rowNumber === row.rowNumber && sel.holeNumber === hole.holeNumber)
          if (isSelected && hole.status === "PLANTED") {
            // Collect the mainPlantId for this hole (for harvest record)
            if (hole.mainPlantId) harvestedGrowthRecordIds.push(hole.mainPlantId)
            // Sucker management: use explicit suckerIds
            const mainPlantId = hole.mainPlantId
            const suckerIds = Array.isArray(hole.suckerIds) ? hole.suckerIds : (hole.activePlantIds ? hole.activePlantIds.filter(id => id !== mainPlantId) : [])
            if (suckerIds.length > 0) {
              const newMainPlantId = suckerIds[0]
              // Promote first sucker to main
              growthRecordUpdates.push(repoUpdateGrowthRecord(newMainPlantId, { isMainPlant: true, replacedPlantId: mainPlantId }))
              // Mark old main as harvested
              if (mainPlantId) growthRecordUpdates.push(repoUpdateGrowthRecord(mainPlantId, { stage: "Harvested", isMainPlant: false }))
              return {
                ...hole,
                status: "PLANTED" as "PLANTED",
                mainPlantId: newMainPlantId,
                activePlantIds: [newMainPlantId, ...suckerIds.slice(1)],
                suckerIds: suckerIds.slice(1),
                currentSuckerCount: suckerIds.length - 1,
              }
            }
            // No suckers to promote, just mark as harvested and clear plant ids
            if (hole.mainPlantId) growthRecordUpdates.push(repoUpdateGrowthRecord(hole.mainPlantId, { stage: "Harvested", isMainPlant: false }))
            return { ...hole, status: "HARVESTED" as "HARVESTED", mainPlantId: undefined, activePlantIds: [], suckerIds: [] }
          }
          return { ...hole, status: hole.status as "PLANTED" | "EMPTY" | "HARVESTED" }
        })
      }
    })
    // Await all growth record updates
    await Promise.all(growthRecordUpdates)
    // Update the plot layout in the database
    await updatePlotLayout(plotId, newLayout)
    // Create a single harvest record for all harvested plants
    await createHarvestRecord({
      farmId: plot.farmId,
      plotId: plot.id,
      userId: parsed.data.userId ? Number(parsed.data.userId) : undefined,
      harvestTeam: parsed.data.harvestTeam,
      harvestDate: typeof parsed.data.harvestDate === 'string' ? parsed.data.harvestDate : parsed.data.harvestDate.toISOString(),
      bunchCount: parsed.data.bunchCount,
      totalWeight: parsed.data.totalWeight,
      qualityRating: parsed.data.qualityRating,
      notes: parsed.data.notes,
      growthRecordIds: harvestedGrowthRecordIds,
      // growthRecordId: harvestedGrowthRecordIds[0], // Optionally set for backward compatibility
    })
    
    // Revalidate relevant paths to refresh UI
    revalidatePath(`/farms/${parsed.data.farmId}`)
    revalidatePath(`/farms/${parsed.data.farmId}/plots/${plotId}`)
    revalidatePath(`/dashboard`)
    
    return {
      success: true,
      message: `Harvest of ${selectedHoles.length} holes recorded successfully!`,
    }
  } catch (error) {
    console.error("Error recording harvest:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record harvest. Please try again.",
    }
  }
}