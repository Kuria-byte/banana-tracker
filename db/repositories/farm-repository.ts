import { db } from "../client"
import { farms } from "../schema"
import { eq } from "drizzle-orm"
import type { Farm } from "@/lib/mock-data"
import type { FarmFormValues } from "@/lib/validations/form-schemas"
import { withFallback } from "./fallback"
import * as mockData from "@/lib/mock-data"

// Direct database functions
async function getAllFarmsDb(): Promise<Farm[]> {
  try {
    const result = await db.select().from(farms)
    return result.map(farmDbToModel)
  } catch (error) {
    console.error("Error fetching farms from database:", error)
    throw error
  }
}

async function getFarmByIdDb(id: number): Promise<Farm | null> {
  try {
    const result = await db.select().from(farms).where(eq(farms.id, id)).limit(1)
    return result.length > 0 ? farmDbToModel(result[0]) : null
  } catch (error) {
    console.error(`Error fetching farm with id ${id} from database:`, error)
    throw error
  }
}

async function createFarmDb(values: FarmFormValues): Promise<Farm> {
  try {
    // Map region_code from location (first 3 letters, uppercased)
    const regionCode = values.location && values.location.length >= 3
      ? values.location.substring(0, 3).toUpperCase()
      : null;
    // Map health_status to DB enum (GOOD, AVERAGE, POOR)
    let healthStatus: any = "AVERAGE";
    if (values.healthStatus) {
      if (values.healthStatus.toUpperCase() === "GOOD") healthStatus = "GOOD";
      else if (values.healthStatus.toUpperCase() === "POOR") healthStatus = "POOR";
      else healthStatus = "AVERAGE";
    }
    // For now, creator_id is omitted (no Team Leader field in form)
    // TODO: Add creator_id/teamLeaderId when re-enabled in the form
    const farmData = {
      name: values.name,
      location: values.location,
      region_code: regionCode,
      size: values.area?.toString(),
      created_at: values.dateEstablished,
      health_status: healthStatus,
      group_code: values.group_code,
      creator_id: values.teamLeaderId ? Number.parseInt(values.teamLeaderId) : null,
      description: values.description || null,
    };
    const result = await db.insert(farms).values(farmData).returning();
    return farmDbToModel(result[0]);
  } catch (error) {
    console.error("Error creating farm in database:", error);
    throw error;
  }
}

async function updateFarmDb(id: number, values: FarmFormValues): Promise<Farm> {
  try {
    // Map health_status to DB enum (GOOD, AVERAGE, POOR)
    let healthStatus: any = "AVERAGE";
    if (values.healthStatus) {
      if (values.healthStatus.toUpperCase() === "GOOD") healthStatus = "GOOD";
      else if (values.healthStatus.toUpperCase() === "POOR") healthStatus = "POOR";
      else healthStatus = "AVERAGE";
    }
    const farmData = {
      name: values.name,
      location: values.location,
      size: values.area.toString(),
      health_status: healthStatus,
      group_code: values.group_code,
      creator_id: values.teamLeaderId ? Number.parseInt(values.teamLeaderId) : null,
      description: values.description || null,
      updated_at: new Date(),
    }
    const result = await db.update(farms).set(farmData).where(eq(farms.id, id)).returning()
    return farmDbToModel(result[0])
  } catch (error) {
    console.error(`Error updating farm with id ${id} in database:`, error)
    throw error
  }
}

async function deleteFarmDb(id: number): Promise<boolean> {
  try {
    const result = await db.delete(farms).where(eq(farms.id, id)).returning({ id: farms.id })

    return result.length > 0
  } catch (error) {
    console.error(`Error deleting farm with id ${id} from database:`, error)
    throw error
  }
}

// Mock data fallback functions
function getAllFarmsMock(): Farm[] {
  return mockData.farms
}

function getFarmByIdMock(id: number): Farm | null {
  const farm = mockData.farms.find((farm) => Number.parseInt(farm.id) === id)
  return farm || null
}

function createFarmMock(values: FarmFormValues): Farm {
  const newFarm: Farm = {
    id: `farm-${Date.now()}`,
    name: values.name,
    location: values.location,
    area: values.area,
    plotCount: 0,
    dateEstablished: values.dateEstablished.toISOString(),
    healthStatus: toHealthStatusEnum(values.healthStatus),
    teamLeaderId: values.teamLeaderId || "",
  }

  // In a real app, this would modify the mock data
  // mockData.farms.push(newFarm);

  return newFarm
}

function updateFarmMock(id: number, values: FarmFormValues): Farm {
  const farmIndex = mockData.farms.findIndex((farm) => Number.parseInt(farm.id) === id)

  if (farmIndex === -1) {
    throw new Error(`Farm with id ${id} not found`)
  }

  const updatedFarm: Farm = {
    ...mockData.farms[farmIndex],
    name: values.name,
    location: values.location,
    area: values.area,
    dateEstablished: values.dateEstablished.toISOString(),
    healthStatus: toHealthStatusEnum(values.healthStatus),
    teamLeaderId: values.teamLeaderId || "",
  }

  // In a real app, this would modify the mock data
  // mockData.farms[farmIndex] = updatedFarm;

  return updatedFarm
}

function deleteFarmMock(id: number): boolean {
  const farmIndex = mockData.farms.findIndex((farm) => Number.parseInt(farm.id) === id)

  if (farmIndex === -1) {
    return false
  }

  // In a real app, this would modify the mock data
  // mockData.farms.splice(farmIndex, 1);

  return true
}

// Helper function to convert database farm to model farm
function farmDbToModel(dbFarm: any): Farm {
  return {
    id: dbFarm.id.toString(),
    name: dbFarm.name,
    location: dbFarm.location,
    area: dbFarm.size !== undefined && dbFarm.size !== null && !isNaN(Number(dbFarm.size)) ? Number(dbFarm.size) : 0,
    plotCount: dbFarm.plotCount !== undefined ? dbFarm.plotCount : 0,
    healthStatus: dbFarm.health_status,
    healthScore: dbFarm.health_score,
    groupCode: dbFarm.group_code || "",
    regionCode: dbFarm.region_code || "",
    isActive: dbFarm.is_active,
    creatorId: dbFarm.creator_id,
    createdAt: dbFarm.created_at,
    updatedAt: dbFarm.updated_at,
    dateEstablished: dbFarm.created_at,
    teamLeaderId: dbFarm.creator_id ? dbFarm.creator_id.toString() : "",
  }
}

function toHealthStatusEnum(val: string): "Good" | "Average" | "Poor" {
  if (val === "Good" || val === "Average" || val === "Poor") return val
  if (typeof val === "string") {
    const v = val.toLowerCase()
    if (v === "good") return "Good"
    if (v === "poor") return "Poor"
  }
  return "Average"
}

// Export functions with fallback
export const getAllFarms = withFallback(getAllFarmsDb, getAllFarmsMock, "Failed to fetch farms from database")

export const getFarmById = withFallback(getFarmByIdDb, getFarmByIdMock, "Failed to fetch farm by ID from database")

export const createFarm = withFallback(createFarmDb, createFarmMock, "Failed to create farm in database")

export const updateFarm = withFallback(updateFarmDb, updateFarmMock, "Failed to update farm in database")

export const deleteFarm = withFallback(deleteFarmDb, deleteFarmMock, "Failed to delete farm from database")
