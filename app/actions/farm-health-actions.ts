"use server"

import { revalidatePath } from "next/cache"
import {
  type ScoringParameter,
  type ScoringParameterRecord,
  type ScoringRecord,
  determineHealthStatus,
} from "@/lib/types/farm-health"
import {
  defaultScoringParameters,
  mockScoringRecords,
  calculateTotalScore,
  calculateMaxPossibleScore,
} from "@/lib/mock-data/farm-health-scoring"
import { db } from "@/db/client"
import { farmInspections, inspectionMetrics } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"

// Get all scoring parameters (metric definitions)
export async function getScoringParameters() {
  try {
    const metrics = await db.select().from(inspectionMetrics)
    // Map to ScoringParameter shape
    const data = metrics.map((m) => ({
      id: m.id.toString(),
      name: m.metricName,
      description: m.notes || "",
      maxPoints: m.maxScore,
      isActive: true, // You may want to add an isActive field in the DB
      category: undefined, // Add if you have category in DB
    }))
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scoring parameters:", error)
    return { success: false, error: "Failed to fetch scoring parameters" }
  }
}

// Create a new scoring parameter
export async function createScoringParameter(parameter: Omit<ScoringParameter, "id">) {
  try {
    // In a real app, this would save to a database
    const newParameter: ScoringParameter = {
      ...parameter,
      id: `param-${Date.now()}`,
    }

    console.log("Creating scoring parameter:", newParameter)

    // Revalidate relevant paths
    revalidatePath("/farms")
    revalidatePath("/settings/scoring")

    return {
      success: true,
      data: newParameter,
    }
  } catch (error) {
    console.error("Error creating scoring parameter:", error)
    return {
      success: false,
      error: "Failed to create scoring parameter",
    }
  }
}

// Update a scoring parameter
export async function updateScoringParameter(id: string, updates: Partial<ScoringParameter>) {
  try {
    // In a real app, this would update in a database
    console.log("Updating scoring parameter:", { id, ...updates })

    // Revalidate relevant paths
    revalidatePath("/farms")
    revalidatePath("/settings/scoring")

    return {
      success: true,
      message: "Scoring parameter updated successfully",
    }
  } catch (error) {
    console.error("Error updating scoring parameter:", error)
    return {
      success: false,
      error: "Failed to update scoring parameter",
    }
  }
}

// Delete a scoring parameter
export async function deleteScoringParameter(id: string) {
  try {
    // In a real app, this would delete from a database
    console.log("Deleting scoring parameter:", id)

    // Revalidate relevant paths
    revalidatePath("/farms")
    revalidatePath("/settings/scoring")

    return {
      success: true,
      message: "Scoring parameter deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting scoring parameter:", error)
    return {
      success: false,
      error: "Failed to delete scoring parameter",
    }
  }
}

// Create a new scoring record (inspection)
export async function createScoringRecord(
  farmId: string,
  parameterScores: ScoringParameterRecord[],
  notes: string,
  userId: string,
) {
  try {
    // Fetch metric definitions for maxPoints
    const metrics = await db.select().from(inspectionMetrics)
    const maxPointsMap = Object.fromEntries(metrics.map(m => [m.id.toString(), m.maxScore]))
    const totalScore = parameterScores.reduce((sum, p) => sum + p.score, 0)
    const maxPossibleScore = parameterScores.reduce((sum, p) => sum + (maxPointsMap[p.parameterId] || 0), 0)
    const scorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
    const healthStatus = determineHealthStatus(scorePercentage)
    // Build metrics JSON
    const metricsJson = Object.fromEntries(parameterScores.map(p => [p.parameterId, p.score]))
    // Insert into farmInspections
    const [inserted] = await db.insert(farmInspections).values({
      farmId: Number(farmId),
      inspectionDate: new Date(),
      inspector: userId,
      score: totalScore,
      notes,
      metrics: metricsJson,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    // Revalidate relevant paths
    revalidatePath(`/farms/${farmId}`)
    revalidatePath("/farms")
    return { success: true, data: inserted }
  } catch (error) {
    console.error("Error creating scoring record:", error)
    return { success: false, error: "Failed to create scoring record" }
  }
}

// Get scoring records for a farm
export async function getScoringRecordsByFarmId(farmId: string) {
  try {
    const records = await db.select().from(farmInspections).where(eq(farmInspections.farmId, Number(farmId)))
    // Map to ScoringRecord shape
    const data = records.map((r) => ({
      id: r.id.toString(),
      farmId: r.farmId.toString(),
      date: r.inspectionDate.toISOString(),
      parameters: Object.entries(r.metrics || {}).map(([parameterId, score]) => ({ parameterId, score: Number(score) })),
      totalScore: r.score,
      maxPossibleScore: 0, // You can calculate if needed
      healthStatus: "", // You can calculate if needed
      notes: r.notes,
      createdById: r.inspector,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
    }))
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching scoring records:", error)
    return { success: false, error: "Failed to fetch scoring records" }
  }
}

// Calculate monthly health summary for a farm
export async function calculateMonthlyHealthSummary(farmId: string, year: number, month: number) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)
    const records = await db.select().from(farmInspections)
      .where(and(
        eq(farmInspections.farmId, Number(farmId)),
        gte(farmInspections.inspectionDate, startDate),
        lte(farmInspections.inspectionDate, endDate)
      ))
    if (records.length === 0) {
      return { success: false, error: "No records found for the specified month" }
    }
    // Fetch metric definitions
    const metrics = await db.select().from(inspectionMetrics)
    const maxPointsMap = Object.fromEntries(metrics.map(m => [m.id.toString(), m.maxScore]))
    // Calculate averages
    const totalScores = records.reduce((sum, r) => sum + (r.score || 0), 0)
    const averageScore = totalScores / records.length
    const maxPossibleScore = Object.values(maxPointsMap).reduce((a, b) => a + b, 0)
    const scorePercentage = maxPossibleScore > 0 ? (averageScore / maxPossibleScore) * 100 : 0
    const healthStatus = determineHealthStatus(scorePercentage)
    // Calculate parameter averages
    const parameterAverages = metrics.map((m) => {
      const scores = records.map(r => (r.metrics || {})[m.id.toString()] || 0)
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + Number(b), 0) / scores.length : 0
      return {
        parameterId: m.id.toString(),
        averageScore,
        maxPoints: m.maxScore,
      }
    })
    const summary = {
      farmId,
      year,
      month,
      averageScore,
      maxPossibleScore,
      scorePercentage,
      healthStatus,
      recordCount: records.length,
      parameters: parameterAverages,
    }
    return { success: true, data: summary }
  } catch (error) {
    console.error("Error calculating monthly health summary:", error)
    return { success: false, error: "Failed to calculate monthly health summary" }
  }
}
