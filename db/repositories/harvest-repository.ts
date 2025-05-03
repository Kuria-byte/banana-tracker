import { db } from "../client";
import { harvestRecords } from "../schema";

// Define the Harvest type (should match your UI type)
export interface Harvest {
  id: string;
  farmId: string;
  harvestDate: string;
  bunchCount: number;
  totalWeight: number;
  qualityRating: string;
  notes: string;
}

export async function getAllHarvests(): Promise<Harvest[]> {
  const result = await db.select().from(harvestRecords);
  return result.map(harvestDbToModel);
}

function harvestDbToModel(dbHarvest: any): Harvest {
  return {
    id: dbHarvest.id?.toString() ?? "",
    farmId: dbHarvest.farmId?.toString() ?? "",
    harvestDate: dbHarvest.harvestDate ? dbHarvest.harvestDate.toISOString() : "",
    bunchCount: dbHarvest.quantity ?? 0,
    totalWeight: dbHarvest.weight !== undefined && dbHarvest.weight !== null && !isNaN(Number(dbHarvest.weight)) ? Number(dbHarvest.weight) : 0,
    qualityRating: dbHarvest.quality ?? "",
    notes: dbHarvest.notes ?? "",
  };
} 