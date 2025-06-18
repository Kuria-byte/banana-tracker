import { db } from "../client";
import { harvestRecords, sales } from "../schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

// Define the Harvest type (should match your UI type)
export interface Harvest {
  id: string;
  farmId: string;
  plotId?: string;
  userId?: string;
  harvestTeam?: any;
  harvestDate: string;
  bunchCount: number;
  totalWeight: number | string;
  qualityRating: string;
  notes: string;
  growthRecordIds?: number[]; // Only keep the new array field
}

export async function getAllHarvests(): Promise<Harvest[]> {
  const result = await db.select().from(harvestRecords);
  return result.map(harvestDbToModel);
}

export async function createHarvestRecord(data: {
  farmId: number;
  plotId?: number;
  userId?: number;
  harvestTeam?: any;
  harvestDate: string;
  bunchCount: number;
  totalWeight: number | string;
  qualityRating: string;
  notes?: string;
  growthRecordIds?: number[];
}): Promise<Harvest> {
  const [created] = await db
    .insert(harvestRecords)
    .values({
      farmId: data.farmId,
      plotId: data.plotId,
      userId: data.userId,
      harvestTeam: data.harvestTeam,
      harvestDate: new Date(data.harvestDate),
      quantity: data.bunchCount,
      weight: typeof data.totalWeight === 'number' ? data.totalWeight.toString() : data.totalWeight,
      quality: data.qualityRating,
      notes: data.notes,
      growthRecordIds: data.growthRecordIds,
    })
    .returning();
  return harvestDbToModel(created);
}

export async function updateHarvestRecord(id: number, data: Partial<{
  farmId: number;
  plotId?: number;
  userId?: number;
  harvestTeam?: any;
  harvestDate: string;
  bunchCount: number;
  totalWeight: number | string;
  qualityRating: string;
  notes?: string;
  growthRecordIds?: number[];
}>): Promise<Harvest | null> {
  const updateData: any = {};
  if (data.farmId !== undefined) updateData.farmId = data.farmId;
  if (data.plotId !== undefined) updateData.plotId = data.plotId;
  if (data.userId !== undefined) updateData.userId = data.userId;
  if (data.harvestTeam !== undefined) updateData.harvestTeam = data.harvestTeam;
  if (data.harvestDate) updateData.harvestDate = new Date(data.harvestDate);
  if (data.bunchCount !== undefined) updateData.quantity = data.bunchCount;
  if (data.totalWeight !== undefined) updateData.weight = typeof data.totalWeight === 'number' ? data.totalWeight.toString() : data.totalWeight;
  if (data.qualityRating) updateData.quality = data.qualityRating;
  if (data.notes) updateData.notes = data.notes;
  if (data.growthRecordIds !== undefined) updateData.growthRecordIds = data.growthRecordIds;

  const [updated] = await db
    .update(harvestRecords)
    .set(updateData)
    .where(eq(harvestRecords.id, id))
    .returning();
  return updated ? harvestDbToModel(updated) : null;
}

function harvestDbToModel(dbHarvest: any): Harvest {
  return {
    id: dbHarvest.id?.toString() ?? "",
    farmId: dbHarvest.farmId?.toString() ?? "",
    plotId: dbHarvest.plotId?.toString(),
    userId: dbHarvest.userId?.toString(),
    harvestTeam: dbHarvest.harvestTeam,
    harvestDate: dbHarvest.harvestDate ? dbHarvest.harvestDate.toISOString() : "",
    bunchCount: dbHarvest.quantity ?? 0,
    totalWeight: dbHarvest.weight !== undefined && dbHarvest.weight !== null && !isNaN(Number(dbHarvest.weight)) ? Number(dbHarvest.weight) : 0,
    qualityRating: dbHarvest.quality ?? "",
    notes: dbHarvest.notes ?? "",
    growthRecordIds: Array.isArray(dbHarvest.growthRecordIds) ? dbHarvest.growthRecordIds : (dbHarvest.growthRecordIds ? JSON.parse(dbHarvest.growthRecordIds) : undefined),
  };
}

// Fetch harvests by farmId and/or plotId
export async function getHarvestsByFarmAndPlot({ farmId, plotId }: { farmId?: number; plotId?: number }) : Promise<Harvest[]> {
  let query = db.select().from(harvestRecords)
  if (farmId) query = query.where(eq(harvestRecords.farmId, farmId))
  if (plotId) query = query.where(eq(harvestRecords.plotId, plotId))
  const results = await query
  return results.map(harvestDbToModel)
}

export async function getHarvestSalesSummary(harvestId: number) {
  // Get the harvest record and sum of sales linked to it
  const result = await db
    .select({
      harvestId: harvestRecords.id,
      harvestedWeight: harvestRecords.weight,
      soldWeight: sql`COALESCE(SUM(${sales.quantity}), 0)`
    })
    .from(harvestRecords)
    .leftJoin(sales, eq(sales.harvestRecordId, harvestRecords.id))
    .where(eq(harvestRecords.id, harvestId))
    .groupBy(harvestRecords.id, harvestRecords.weight)

  if (!result || !result[0]) return null
  const { harvestedWeight, soldWeight } = result[0]
  const harvested = Number(harvestedWeight || 0)
  const sold = Number(soldWeight || 0)
  const remaining = harvested - sold
  const conversionRate = harvested > 0 ? (sold / harvested) * 100 : 0
  return {
    harvestId,
    harvestedWeight: harvested,
    soldWeight: sold,
    remainingWeight: remaining,
    conversionRate
  }
}

export async function getHarvestConversionSummary({ startDate, endDate }: { startDate?: string | Date, endDate?: string | Date } = {}) {
  // Build date filter
  let filterConds = []
  if (startDate) filterConds.push(gte(harvestRecords.harvestDate, typeof startDate === 'string' ? new Date(startDate) : startDate))
  if (endDate) filterConds.push(lte(harvestRecords.harvestDate, typeof endDate === 'string' ? new Date(endDate) : endDate))
  const where = filterConds.length > 0 ? and(...filterConds) : undefined

  const results = await db
    .select({
      id: harvestRecords.id,
      harvestDate: harvestRecords.harvestDate,
      harvestedWeight: harvestRecords.weight,
      soldWeight: sql`COALESCE(SUM(${sales.quantity}), 0)`
    })
    .from(harvestRecords)
    .leftJoin(sales, eq(sales.harvestRecordId, harvestRecords.id))
    .where(where)
    .groupBy(harvestRecords.id, harvestRecords.harvestDate, harvestRecords.weight)
    .orderBy(harvestRecords.harvestDate)

  return results.map(r => {
    const harvested = Number(r.harvestedWeight || 0)
    const sold = Number(r.soldWeight || 0)
    const remaining = harvested - sold
    const conversionRate = harvested > 0 ? (sold / harvested) * 100 : 0
    return {
      id: r.id,
      harvestDate: r.harvestDate,
      harvestedWeight: harvested,
      soldWeight: sold,
      remainingWeight: remaining,
      conversionRate
    }
  })
} 