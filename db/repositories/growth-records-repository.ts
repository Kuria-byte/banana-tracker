import { db } from "../client"
import { growthRecords } from "../schema"
import { eq, sql, and, not, desc } from "drizzle-orm"
import { getPlotById, getPlotsByFarmId } from "./plot-repository"

// Growth stage thresholds in days
export const GROWTH_STAGE_THRESHOLDS: Record<string, number> = {
  "Early Growth": 0,          // 0-90 days (3 months)
  "Vegetative": 90,           // 3-8 months
  "Flower Emergence": 240,    // 8-10 months
  "Bunch Formation": 300,     // 10-11 months
  "Fruit Development": 330,   // 11-12 months
  "Ready for Harvest": 360    // 12+ months
};

export function calculateGrowthStage(plantedDate: Date): string {
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
  let currentStage = "Early Growth";
  for (const [stage, threshold] of Object.entries(GROWTH_STAGE_THRESHOLDS)) {
    if (ageInDays >= threshold) {
      currentStage = stage;
    } else {
      break;
    }
  }
  return currentStage;
}

export function getDaysFromPlanting(plantedDate: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysToNextStage(plantedDate: Date, currentStage: string): number | null {
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
  const stages = Object.entries(GROWTH_STAGE_THRESHOLDS);
  let found = false;
  for (let i = 0; i < stages.length; i++) {
    const [stage, threshold] = stages[i];
    if (stage === currentStage) {
      found = true;
      if (i + 1 < stages.length) {
        const nextThreshold = stages[i + 1][1];
        return Math.max(0, nextThreshold - ageInDays);
      } else {
        return null; // Already at last stage
      }
    }
  }
  return null;
}

// Fetch all growth records (optionally by farm/plot)
export async function getAllGrowthRecords({ farmId, plotId } = {} as { farmId?: number; plotId?: number }) {
  let conditions = []
  if (farmId) conditions.push(eq(growthRecords.farmId, farmId))
  if (plotId) conditions.push(eq(growthRecords.plotId, plotId))
  let query = db.select().from(growthRecords)
  if (conditions.length > 0) {
    // @ts-ignore
    query = query.where(conditions.length === 1 ? conditions[0] : { and: conditions })
  }
  return await query
}

// Aggregate growth records by stage (returns counts per stage)
export async function getGrowthStageDistribution() {
  const result = await db
    .select({
      stage: growthRecords.stage,
      count: sql`COUNT(*)`.as('count'),
    })
    .from(growthRecords)
    .groupBy(growthRecords.stage)
  return result
}

// (Stub) Aggregate health status (requires health info in schema)
export async function getHealthStatusDistribution() {
  // If health is in metrics or another table, implement aggregation here
  // For now, return empty
  return []
}

// Map DB stages to UI stages
const STAGE_MAP: Record<string, string> = {
  "Flowering": "Flower Emergence",
  "Bunch Formation": "Bunch Formation",
  "Fruit Development": "Fruit Development",
  "Ready for Harvest": "Ready for Harvest",
  // Add more mappings as needed
}

// Aggregate for UI: returns { stage, count, percent }
export async function getUiGrowthStageDistribution() {
  const all = await db.select({ stage: growthRecords.stage }).from(growthRecords)
  const total = all.length
  const counts: Record<string, number> = {}
  for (const rec of all) {
    const uiStage = STAGE_MAP[rec.stage || ""] || rec.stage || "Unknown"
    counts[uiStage] = (counts[uiStage] || 0) + 1
  }
  return Object.entries(counts).map(([stage, count]) => ({
    stage,
    count,
    percent: total ? Math.round((count / total) * 100) : 0,
  }))
}

// Infer health status from metrics (stub: looks for pest_damage, can be extended)
const HEALTH_STATUSES = ["Healthy", "Diseased", "Pest-affected", "Damaged"]
export async function getUiHealthStatusDistribution() {
  const all = await db.select({ metrics: growthRecords.metrics }).from(growthRecords)
  const counts: Record<string, number> = { Healthy: 0, Diseased: 0, "Pest-affected": 0, Damaged: 0 }
  for (const rec of all) {
    // Example logic: if pest_damage > 0 => Pest-affected, else Healthy
    if (rec.metrics && typeof rec.metrics === "object") {
      if (rec.metrics.pest_damage && rec.metrics.pest_damage > 0) {
        counts["Pest-affected"]++
      } else {
        counts["Healthy"]++
      }
      // Extend with more logic for Diseased, Damaged, etc.
    } else {
      counts["Healthy"]++
    }
  }
  const total = all.length
  return HEALTH_STATUSES.map((status) => ({
    status,
    count: counts[status],
    percent: total ? Math.round((counts[status] / total) * 100) : 0,
  }))
}

// When creating or updating growth records, include rowNumber, holeNumber, isMainPlant, parentPlantId
// Example for createGrowthRecord:
export async function createGrowthRecord(values: any): Promise<any> {
  const recordData = {
    farmId: values.farmId,
    plotId: values.plotId,
    recordDate: values.recordDate ?? new Date(),
    stage: values.stage,
    notes: values.notes,
    metrics: values.metrics,
    creatorId: values.creatorId,
    rowNumber: values.rowNumber,
    holeNumber: values.holeNumber,
    isMainPlant: values.isMainPlant,
    parentPlantId: values.parentPlantId,
    replacedPlantId: values.replacedPlantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.insert(growthRecords).values(recordData).returning()
  return Array.isArray(result) ? result[0] : result
}

export async function updateGrowthRecord(id: number, values: any): Promise<any> {
  const recordData = {
    stage: values.stage,
    notes: values.notes,
    metrics: values.metrics,
    rowNumber: values.rowNumber,
    holeNumber: values.holeNumber,
    isMainPlant: values.isMainPlant,
    replacedPlantId: values.replacedPlantId,
    updatedAt: new Date(),
  }
  const result = await db.update(growthRecords).set(recordData).where(eq(growthRecords.id, id)).returning()
  return Array.isArray(result) ? result[0] : result
}

// Get all relevant growth data for a specific plant (by plot, row, hole)
export async function getPlantGrowthData(plotId: number, rowNumber: number, holeNumber: number) {
  // Get the hole from plot layout
  const plot = await getPlotById(plotId);
  if (!plot || !Array.isArray(plot.layoutStructure)) return null;

  const row = plot.layoutStructure.find((r: any) => r.rowNumber === rowNumber);
  if (!row) return null;

  const hole = row.holes.find((h: any) => h.holeNumber === holeNumber);
  if (!hole || !hole.plantedDate) return null;

  // Get all growth records for this plant (mainPlantId)
  const mainPlantId = hole.mainPlantId;
  if (!mainPlantId) return null;

  const allRecords = await db
    .select()
    .from(growthRecords)
    .where(eq(growthRecords.id, mainPlantId));

  // Calculate automatic stage based on planted date
  const plantedDate = new Date(hole.plantedDate);
  const calculatedStage = calculateGrowthStage(plantedDate);

  // Get the most recent manual stage update (if any, not 'Planted' or 'Sucker')
  const manualUpdates = await db
    .select()
    .from(growthRecords)
    .where(
      and(
        eq(growthRecords.plotId, plotId),
        eq(growthRecords.rowNumber, rowNumber),
        eq(growthRecords.holeNumber, holeNumber),
        not(eq(growthRecords.stage, "Planted")),
        not(eq(growthRecords.stage, "Sucker"))
      )
    )
    .orderBy(desc(growthRecords.recordDate))
    .limit(1);

  const manualStage = manualUpdates.length > 0 ? manualUpdates[0].stage : null;

  // Get days until next stage
  const daysToNextStage = getDaysToNextStage(plantedDate, calculatedStage);

  return {
    plant: {
      mainPlantId,
      plantedDate,
      age: getDaysFromPlanting(plantedDate),
    },
    calculatedStage,
    manualStage,
    daysToNextStage,
    growthHistory: allRecords,
    suckers: hole.suckerIds || [],
    health: hole.plantHealth || "Healthy",
  };
}

export async function getGrowthSummaryForFarm(farmId: number) {
  // Get all plots for this farm
  const plots = await getPlotsByFarmId(farmId);

  // Initialize counters for each growth stage
  const stages = {
    "Early Growth": 0,
    "Vegetative": 0,
    "Flower Emergence": 0,
    "Bunch Formation": 0,
    "Fruit Development": 0,
    "Ready for Harvest": 0
  };

  // Initialize counters for health status
  const health = {
    "Healthy": 0,
    "Diseased": 0,
    "Pest-affected": 0,
    "Damaged": 0
  };

  // Count plants by stage and health
  let totalPlants = 0;
  const upcomingHarvests: any[] = [];

  plots.forEach((plot: any) => {
    if (!Array.isArray(plot.layoutStructure)) return;
    plot.layoutStructure.forEach((row: any) => {
      row.holes.forEach((hole: any) => {
        if (hole.status === "PLANTED" && hole.plantedDate) {
          totalPlants++;
          // Calculate stage based on planted date
          const plantedDate = new Date(hole.plantedDate);
          const stage = calculateGrowthStage(plantedDate);
          stages[stage]++;
          // Count by health
          const healthStatus = hole.plantHealth || "Healthy";
          if (health[healthStatus] !== undefined) {
            health[healthStatus]++;
          } else {
            health["Healthy"]++;
          }
          // Track upcoming harvests
          if (stage === "Ready for Harvest" || stage === "Fruit Development") {
            upcomingHarvests.push({
              plotId: plot.id,
              plotName: plot.name,
              rowNumber: row.rowNumber,
              holeNumber: hole.holeNumber,
              stage,
              estimatedHarvestDate: getEstimatedHarvestDate(plantedDate, stage)
            });
          }
        }
      });
    });
  });

  // Calculate percentages
  const stageDistribution = Object.entries(stages).map(([stage, count]) => ({
    stage,
    count,
    percent: totalPlants > 0 ? Math.round((count / totalPlants) * 100) : 0
  }));

  const healthDistribution = Object.entries(health).map(([status, count]) => ({
    status,
    count,
    percent: totalPlants > 0 ? Math.round((count / totalPlants) * 100) : 0
  }));

  // Calculate yield estimate
  const averageWeight = 20; // kg per bunch
  const totalEstimatedYield = upcomingHarvests.length * averageWeight;

  return {
    totalPlants,
    stageDistribution,
    healthDistribution,
    upcomingHarvests: {
      count: upcomingHarvests.length,
      estimatedYield: totalEstimatedYield,
      details: upcomingHarvests
    }
  };
}

// Helper function to estimate harvest date
function getEstimatedHarvestDate(plantedDate: Date, currentStage: string): Date {
  const now = new Date();
  const harvestDate = new Date(now);
  if (currentStage === "Ready for Harvest") {
    // Already ready, estimate within 2 weeks
    harvestDate.setDate(now.getDate() + 14);
  } else if (currentStage === "Fruit Development") {
    // Estimate 30-60 days
    harvestDate.setDate(now.getDate() + 45);
  }
  return harvestDate;
} 