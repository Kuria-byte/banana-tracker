"use server"

import { revalidatePath } from "next/cache"
import type { GrowthFormValues } from "@/lib/validations/form-schemas"
import { createGrowthRecord, updateGrowthRecord as repoUpdateGrowthRecord } from "@/db/repositories/growth-records-repository"
import { getPlotById, updatePlotLayout, updateHoleInRow } from "@/db/repositories/plot-repository"
import type { HoleData } from "@/lib/types/plot"

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

// Helper: update a hole's plant/growth info
async function updateHolePlantInfo(plotId: number, rowNumber: number, holeNumber: number, data: Partial<HoleData>) {
  await updateHoleInRow(plotId, rowNumber, holeNumber, data)
}

// Helper to update suckers for a hole
async function syncSuckersForHole(plot: any, plotId: number, rowNumber: number, holeNumber: number, desiredSuckerCount: number) {
  // Find the hole
  const row = plot.layoutStructure.find((r: any) => r.rowNumber === rowNumber)
  if (!row) return { suckerIds: [], activePlantIds: [], currentSuckerCount: 0 }
  const hole = row.holes.find((h: any) => h.holeNumber === holeNumber)
  if (!hole) return { suckerIds: [], activePlantIds: [], currentSuckerCount: 0 }
  const mainPlantId = hole.mainPlantId
  let suckerIds = Array.isArray(hole.suckerIds) ? [...hole.suckerIds] : []
  let activePlantIds = [mainPlantId, ...suckerIds].filter(Boolean)
  let currentCount = suckerIds.length
  // If increasing
  if (desiredSuckerCount > currentCount && mainPlantId) {
    for (let i = 0; i < desiredSuckerCount - currentCount; i++) {
      const newSucker = await createGrowthRecord({
        farmId: hole.farmId || plot.farmId,
        plotId,
        rowNumber,
        holeNumber,
        isMainPlant: false,
        parentPlantId: mainPlantId,
        stage: "Sucker",
        recordDate: new Date(),
        notes: "Auto-added sucker",
      })
      suckerIds.push(newSucker.id)
      activePlantIds.push(newSucker.id)
    }
  }
  // If decreasing
  if (desiredSuckerCount < currentCount) {
    suckerIds = suckerIds.slice(0, desiredSuckerCount)
    activePlantIds = [mainPlantId, ...suckerIds].filter(Boolean)
    // Optionally: mark removed suckers as inactive in DB
  }
  return {
    suckerIds,
    activePlantIds,
    currentSuckerCount: suckerIds.length,
  }
}

// Enhanced growth action: supports individual, bulk, and new plant
export async function recordEnhancedGrowth(formData: any) {
  try {
    const { farmId, plotId, stage, date, notes, isNewPlant, plantCount, workerId, autoFillRows, selectedRow, selectedHoles, plantHealth, currentSuckerCount } = formData
    const plot = await getPlotById(Number(plotId))
    if (!plot) throw new Error("Plot not found")
    let updated = []
    // 1. Add New Plant
    if (isNewPlant) {
      // Find empty holes (auto-fill or manual)
      let emptyHoles: { rowNumber: number, holeNumber: number }[] = []
      for (const row of plot.layoutStructure) {
        for (const hole of row.holes) {
          if (hole.status !== "PLANTED") {
            emptyHoles.push({ rowNumber: row.rowNumber, holeNumber: hole.holeNumber })
          }
        }
      }
      const toFill = Math.min(emptyHoles.length, plantCount || 1)
      for (let i = 0; i < toFill; i++) {
        const { rowNumber, holeNumber } = emptyHoles[i]
        const growthRecord = await createGrowthRecord({
          farmId: Number(farmId),
          plotId: Number(plotId),
          rowNumber,
          holeNumber,
          isMainPlant: true,
          stage: "Early Growth",
          recordDate: date,
          notes,
          creatorId: workerId,
        })
        let suckerSync = { suckerIds: [], activePlantIds: [growthRecord.id], currentSuckerCount: 0 }
        if (typeof currentSuckerCount === 'number' && currentSuckerCount > 0) {
          suckerSync = await syncSuckersForHole(plot, Number(plotId), rowNumber, holeNumber, currentSuckerCount)
        }
        await updateHolePlantInfo(Number(plotId), rowNumber, holeNumber, {
          status: "PLANTED",
          mainPlantId: growthRecord.id,
          activePlantIds: suckerSync.activePlantIds,
          suckerIds: suckerSync.suckerIds,
          currentSuckerCount: suckerSync.currentSuckerCount,
          plantedDate: date,
          plantHealth: plantHealth || "Healthy",
        })
        updated.push({ rowNumber, holeNumber, newPlantId: growthRecord.id })
      }
      revalidatePath(`/farms/${farmId}`)
      revalidatePath("/growth")
      return { success: true, message: `Added ${toFill} new plant(s)`, updated }
    }
    // 2. Bulk Growth Recording
    if (selectedRow && Array.isArray(selectedHoles) && selectedHoles.length > 0) {
      for (const holeNumberStr of selectedHoles) {
        const holeNumber = Number(holeNumberStr)
        const rowNumber = Number(selectedRow)
        let suckerSync = null
        if (typeof currentSuckerCount === 'number') {
          suckerSync = await syncSuckersForHole(plot, Number(plotId), rowNumber, holeNumber, currentSuckerCount)
        }
        const growthRecord = await createGrowthRecord({
          farmId: Number(farmId),
          plotId: Number(plotId),
          rowNumber,
          holeNumber,
          isMainPlant: false,
          stage,
          recordDate: date,
          notes,
          creatorId: workerId,
        })
        await updateHolePlantInfo(Number(plotId), rowNumber, holeNumber, {
          ...(plantHealth ? { plantHealth } : {}),
          ...(suckerSync ? {
            suckerIds: suckerSync.suckerIds,
            activePlantIds: suckerSync.activePlantIds,
            currentSuckerCount: suckerSync.currentSuckerCount,
          } : {}),
        })
        updated.push({ rowNumber, holeNumber, growthRecordId: growthRecord.id })
      }
      revalidatePath(`/farms/${farmId}`)
      revalidatePath("/growth")
      return { success: true, message: `Growth recorded for ${selectedHoles.length} plant(s) in row ${selectedRow}`, updated }
    }
    // 3. Individual Growth Recording
    if (formData.hole && formData.hole.rowNumber && formData.hole.holeNumber) {
      const { rowNumber, holeNumber } = formData.hole
      let suckerSync = null
      if (typeof currentSuckerCount === 'number') {
        suckerSync = await syncSuckersForHole(plot, Number(plotId), rowNumber, holeNumber, currentSuckerCount)
      }
      const growthRecord = await createGrowthRecord({
        farmId: Number(farmId),
        plotId: Number(plotId),
        rowNumber,
        holeNumber,
        isMainPlant: false,
        stage,
        recordDate: date,
        notes,
        creatorId: workerId,
      })
      await updateHolePlantInfo(Number(plotId), rowNumber, holeNumber, {
        ...(plantHealth ? { plantHealth } : {}),
        ...(suckerSync ? {
          suckerIds: suckerSync.suckerIds,
          activePlantIds: suckerSync.activePlantIds,
          currentSuckerCount: suckerSync.currentSuckerCount,
        } : {}),
      })
      revalidatePath(`/farms/${farmId}`)
      revalidatePath("/growth")
      return { success: true, message: `Growth recorded for plant in row ${rowNumber}, hole ${holeNumber}`, growthRecordId: growthRecord.id }
    }
    return { success: false, message: "No valid operation detected" }
  } catch (error) {
    console.error("Failed to record growth:", error)
    return { success: false, message: "Failed to record growth" }
  }
}

export async function recordBulkGrowth({ farmId, plotId, stage, date, notes, workerId }: { farmId: string, plotId: string, stage: string, date: Date, notes?: string, workerId?: string }) {
  try {
    const plot = await getPlotById(Number(plotId));
    if (!plot) throw new Error("Plot not found");
    let updatedCount = 0;
    let updatedHoles: { rowNumber: number, holeNumber: number }[] = [];
    for (const row of plot.layoutStructure) {
      for (const hole of row.holes) {
        if (hole.status === "PLANTED" && hole.mainPlantId) {
          await createGrowthRecord({
            farmId: Number(farmId),
            plotId: Number(plotId),
            rowNumber: row.rowNumber,
            holeNumber: hole.holeNumber,
            isMainPlant: false,
            stage,
            recordDate: date,
            notes,
            creatorId: workerId,
            parentPlantId: hole.mainPlantId,
          });
          updatedCount++;
          updatedHoles.push({ rowNumber: row.rowNumber, holeNumber: hole.holeNumber });
        }
      }
    }
    revalidatePath("/growth");
    revalidatePath(`/farms/${farmId}`);
    revalidatePath("/");
    return {
      success: true,
      message: `Growth recorded for ${updatedCount} plants in this plot.`,
      updatedCount,
      updatedHoles,
    };
  } catch (error) {
    console.error("Error in bulk growth record:", error);
    return {
      success: false,
      error: "Failed to record bulk growth. Please try again.",
    };
  }
}
