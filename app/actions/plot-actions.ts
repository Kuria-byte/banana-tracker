"use server"

import { revalidatePath } from "next/cache"
import type { PlotFormValues } from "@/lib/validations/form-schemas"
import * as plotRepository from "@/db/repositories/plot-repository"
import { updatePlotLayout } from "@/db/repositories/plot-repository"
import type { RowData, HoleData } from "@/lib/types/plot"
import { createGrowthRecord, createGrowthRecordsBatch } from "@/db/repositories/growth-records-repository"

export async function addPlot(values: PlotFormValues) {
  try {
    console.log("addPlot called with values:", values)
    
    // Create the plot in the database first
    const newPlot = await plotRepository.createPlot(values)
    console.log("Plot created in database:", newPlot)

    // Prepare a deep copy of the layout to update mainPlantId/activePlantIds/suckerIds
    let updatedLayout = Array.isArray(values.layoutStructure)
      ? values.layoutStructure.map(row => ({
          ...row,
          holes: row.holes.map(hole => ({
            ...hole,
            status: (hole.status || "PLANTED") as 'PLANTED' | 'EMPTY' | 'HARVESTED',
            plantHealth: (hole.plantHealth || "Healthy") as 'Healthy' | 'Diseased' | 'Pest-affected' | 'Damaged',
            suckerIds: Array.isArray(hole.suckerIds) ? hole.suckerIds : [],
            mainPlantId: hole.mainPlantId,
            activePlantIds: hole.activePlantIds ?? [],
            targetSuckerCount: hole.targetSuckerCount ?? 3,
            currentSuckerCount: hole.currentSuckerCount ?? 0,
            plantedDate: hole.plantedDate,
            notes: hole.notes ?? '',
            rowNumber: hole.rowNumber,
            holeNumber: hole.holeNumber,
          }))
        }))
      : [];

    let totalPlants = 0;

    // After plot creation, create initial growth records for each PLANTED hole
    if (Array.isArray(updatedLayout) && updatedLayout.length > 0) {
      console.log("Processing layout structure for growth records...")
      
      // Collect all growth records to create in batch
      const growthRecordsToCreate: Array<{
        farmId: number;
        plotId: number;
        rowNumber: number;
        holeNumber: number;
        isMainPlant: boolean;
        parentPlantId?: number;
        stage: string;
        recordDate: Date;
        notes?: string;
        metrics: object;
      }> = [];
      
      // Track planted holes for processing
      const plantedHoles: Array<{
        row: any;
        hole: any;
        suckerCount: number;
      }> = [];

      // First pass: collect all planted holes and prepare main plant records
      for (const row of updatedLayout) {
        if (!Array.isArray(row.holes)) continue;
        
        for (const hole of row.holes) {
          if (hole.status === "PLANTED") {
            console.log(`Preparing growth record for row ${row.rowNumber}, hole ${hole.holeNumber}`)
            
            // Add main plant record
            growthRecordsToCreate.push({
                farmId: Number(values.farmId),
                plotId: newPlot.id,
                rowNumber: row.rowNumber,
                holeNumber: hole.holeNumber,
                isMainPlant: true,
                stage: "Planted",
                recordDate: hole.plantedDate ? new Date(hole.plantedDate) : new Date(),
                notes: hole.notes || undefined,
                metrics: {},
            });

            // Track this hole for sucker processing
              const suckerCount = hole.currentSuckerCount ?? 0;
            if (suckerCount > 0) {
              plantedHoles.push({ row, hole, suckerCount });
            }
            
            totalPlants += 1 + suckerCount;
          }
        }
      }

      if (growthRecordsToCreate.length > 0) {
        console.log(`Creating ${growthRecordsToCreate.length} main plant growth records in batch...`);
        
        try {
          // Create main plant records in batch
          const createdMainPlants = await createGrowthRecordsBatch(growthRecordsToCreate);
          console.log(`Successfully created ${createdMainPlants.length} main plant records`);
          
          // Map main plant IDs back to holes
          const mainPlantMap = new Map<string, number>();
          createdMainPlants.forEach((record, index) => {
            const originalRecord = growthRecordsToCreate[index];
            const key = `${originalRecord.rowNumber}-${originalRecord.holeNumber}`;
            mainPlantMap.set(key, record.id);
          });

          // Update holes with main plant IDs
          for (const row of updatedLayout) {
            for (const hole of row.holes) {
              if (hole.status === "PLANTED") {
                const key = `${row.rowNumber}-${hole.holeNumber}`;
                const mainPlantId = mainPlantMap.get(key);
                if (mainPlantId) {
                  hole.mainPlantId = mainPlantId;
                  hole.activePlantIds = [mainPlantId];
                }
              }
            }
          }

          // Debug log to verify main plant ID mapping
          console.log("Main Plant ID Mapping Results:");
          for (const row of updatedLayout) {
            for (const hole of row.holes) {
              if (hole.status === "PLANTED") {
                console.log(`Row ${row.rowNumber} Hole ${hole.holeNumber}: MainPlant=${hole.mainPlantId}`);
              }
            }
          }

          // Second pass: create sucker records in batch
          if (plantedHoles.length > 0) {
            console.log(`Creating sucker records for ${plantedHoles.length} holes...`);
            
            const suckerRecordsToCreate: Array<{
              farmId: number;
              plotId: number;
              rowNumber: number;
              holeNumber: number;
              isMainPlant: boolean;
              parentPlantId: number;
              stage: string;
              recordDate: Date;
              notes?: string;
              metrics: object;
            }> = [];

            // Prepare sucker records
            for (const { row, hole, suckerCount } of plantedHoles) {
              const key = `${row.rowNumber}-${hole.holeNumber}`;
              const mainPlantId = mainPlantMap.get(key);
              
              if (mainPlantId) {
              for (let i = 0; i < suckerCount; i++) {
                  suckerRecordsToCreate.push({
                  farmId: Number(values.farmId),
                  plotId: newPlot.id,
                  rowNumber: row.rowNumber,
                  holeNumber: hole.holeNumber,
                  isMainPlant: false,
                    parentPlantId: mainPlantId,
                  stage: "Sucker",
                  recordDate: hole.plantedDate ? new Date(hole.plantedDate) : new Date(),
                  notes: hole.notes || undefined,
                  metrics: {},
                  });
                }
              }
            }

            if (suckerRecordsToCreate.length > 0) {
              console.log(`Creating ${suckerRecordsToCreate.length} sucker records in batch...`);
              const createdSuckers = await createGrowthRecordsBatch(suckerRecordsToCreate);
              console.log(`Successfully created ${createdSuckers.length} sucker records`);

              // Map sucker IDs back to holes
              let suckerIndex = 0;
              for (const { row, hole, suckerCount } of plantedHoles) {
                const suckerIds: number[] = [];
                for (let i = 0; i < suckerCount; i++) {
                  if (suckerIndex < createdSuckers.length) {
                    suckerIds.push(createdSuckers[suckerIndex].id);
                    suckerIndex++;
                  }
                }
                hole.suckerIds = suckerIds;
                hole.activePlantIds = [hole.mainPlantId, ...suckerIds];
                hole.currentSuckerCount = suckerIds.length;
              }

              // Debug log to verify complete ID mapping (main plants + suckers)
              console.log("Complete ID Mapping Results:");
              for (const row of updatedLayout) {
                for (const hole of row.holes) {
                  if (hole.status === "PLANTED") {
                    console.log(`Row ${row.rowNumber} Hole ${hole.holeNumber}: MainPlant=${hole.mainPlantId}, Suckers=[${hole.suckerIds?.join(',')}], Active=[${hole.activePlantIds?.join(',')}]`);
                  }
                }
              }
            }
          }

        } catch (err) {
          console.error("Failed to create growth records in batch:", err);
          // Continue with the plot creation even if growth records fail
        }
      }
      
      // Update the plot's layoutStructure in the DB with mainPlantId/activePlantIds/suckerIds
      try {
        console.log("Updating layout structure with plant IDs...");
        await updatePlotLayout(newPlot.id, updatedLayout);
        console.log("Layout structure updated successfully");
      } catch (err) {
        console.error("Failed to update layout structure:", err);
      }
      
      // Update plant_count in the plot
      try {
        console.log(`Updating plant count to ${totalPlants}...`);
      await plotRepository.updatePlot(newPlot.id, {
        ...values,
        plantCount: totalPlants,
        layoutStructure: updatedLayout,
        });
        console.log(`Plant count updated to ${totalPlants}`);
      } catch (err) {
        console.error("Failed to update plant count:", err);
      }
    }

    // Revalidate the farm page to show the new plot
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: `Plot added successfully! Initial growth records created for planted holes (including ${totalPlants} plants total).`,
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

// Rest of the functions remain the same...
export async function updatePlot(plotId: number, values: PlotFormValues) {
  try {
    console.log("updatePlot called with:", { plotId, values })
    
    // Update the plot in the database
    const updatedPlot = await plotRepository.updatePlot(plotId, values)
    console.log("Plot updated successfully:", updatedPlot)

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
    // Delete the plot from the database
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

// Get all plots
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

// Get plot by ID for internal use
export async function getPlotById(plotId: number) {
    const plot = await plotRepository.getPlotById(plotId)
  if (!plot) throw new Error("Plot not found")
  return plot
}

// Get plots by farm ID
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

// Row and hole management functions
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