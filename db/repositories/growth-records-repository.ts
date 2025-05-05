import { db } from "../client"
import { growthRecords } from "../schema"
import { eq, sql } from "drizzle-orm"

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
    parentPlantId: values.parentPlantId,
    updatedAt: new Date(),
  }
  const result = await db.update(growthRecords).set(recordData).where(eq(growthRecords.id, id)).returning()
  return Array.isArray(result) ? result[0] : result
} 