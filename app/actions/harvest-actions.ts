"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { harvestFormSchema, HarvestFormValues } from "@/lib/validations/form-schemas"
import { createHarvestRecord } from "@/db/repositories/harvest-repository"
import { getPlotById, updatePlotLayout } from "@/db/repositories/plot-repository"

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
      // Skip rows that don't have any selected holes
      if (!selectedHoles.some((h) => h.rowNumber === row.rowNumber)) return row
      
      return {
        ...row,
        holes: row.holes.map((hole) => {
          // Check if this hole is in the selectedHoles array
          if (selectedHoles.some(sel => sel.rowNumber === row.rowNumber && sel.holeNumber === hole.holeNumber)) {
            // Only update if hole is currently PLANTED (not already HARVESTED or EMPTY)
            if (hole.status === "PLANTED") {
              return { ...hole, status: "HARVESTED" as "HARVESTED" }
            }
            // Keep the status as is, but cast it to the union type
            return { ...hole, status: hole.status as "PLANTED" | "EMPTY" | "HARVESTED" }
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