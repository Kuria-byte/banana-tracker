import { db } from "../client"
import { harvestRecords } from "../schema"
import { sql, gt, lte } from "drizzle-orm"

// Get upcoming harvests in the next 30 days
export async function getUpcomingHarvests() {
  const now = new Date()
  const in30 = new Date()
  in30.setDate(now.getDate() + 30)
  return await db
    .select({
      id: harvestRecords.id,
      farmId: harvestRecords.farmId,
      harvestDate: harvestRecords.harvestDate,
      quantity: harvestRecords.quantity,
      weight: harvestRecords.weight,
    })
    .from(harvestRecords)
    .where(gt(harvestRecords.harvestDate, now))
    .where(lte(harvestRecords.harvestDate, in30))
}

// Estimate total yield for upcoming harvests
export async function getUpcomingHarvestYield() {
  const upcoming = await getUpcomingHarvests()
  const totalWeight = upcoming.reduce((sum, h) => sum + (Number(h.weight) || 0), 0)
  return { count: upcoming.length, totalWeight }
} 