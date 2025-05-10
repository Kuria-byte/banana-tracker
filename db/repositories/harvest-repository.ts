import { db } from "../client";
import { harvestRecords } from "../schema";
import { eq } from "drizzle-orm";

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