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

// Get all scoring parameters
export async function getScoringParameters() {
  try {
    // In a real app, this would fetch from a database
    return {
      success: true,
      data: defaultScoringParameters,
    }
  } catch (error) {
    console.error("Error fetching scoring parameters:", error)
    return {
      success: false,
      error: "Failed to fetch scoring parameters",
    }
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

// Create a new scoring record
export async function createScoringRecord(
  farmId: string,
  parameterScores: ScoringParameterRecord[],
  notes: string,
  userId: string,
) {
  try {
    const totalScore = calculateTotalScore(parameterScores)
    const maxPossibleScore = calculateMaxPossibleScore()
    const scorePercentage = (totalScore / maxPossibleScore) * 100
    const healthStatus = determineHealthStatus(scorePercentage)

    const newRecord: ScoringRecord = {
      id: `record-${Date.now()}`,
      farmId,
      date: new Date().toISOString(),
      parameters: parameterScores,
      totalScore,
      maxPossibleScore,
      healthStatus,
      notes,
      createdById: userId,
      createdAt: new Date().toISOString(),
    }

    console.log("Creating scoring record:", newRecord)

    // Revalidate relevant paths
    revalidatePath(`/farms/${farmId}`)
    revalidatePath("/farms")

    return {
      success: true,
      data: newRecord,
    }
  } catch (error) {
    console.error("Error creating scoring record:", error)
    return {
      success: false,
      error: "Failed to create scoring record",
    }
  }
}

// Get scoring records for a farm
export async function getScoringRecordsByFarmId(farmId: string) {
  try {
    // In a real app, this would fetch from a database
    const records = mockScoringRecords.filter((record) => record.farmId === farmId)

    return {
      success: true,
      data: records,
    }
  } catch (error) {
    console.error("Error fetching scoring records:", error)
    return {
      success: false,
      error: "Failed to fetch scoring records",
    }
  }
}

// Calculate monthly health summary for a farm
export async function calculateMonthlyHealthSummary(farmId: string, year: number, month: number) {
  try {
    // In a real app, this would calculate from database records
    // For now, we'll simulate the calculation

    // Get all records for the farm in the specified month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const records = mockScoringRecords.filter((record) => {
      const recordDate = new Date(record.date)
      return record.farmId === farmId && recordDate >= startDate && recordDate <= endDate
    })

    if (records.length === 0) {
      return {
        success: false,
        error: "No records found for the specified month",
      }
    }

    // Calculate average scores
    const totalScores = records.reduce((total, record) => total + record.totalScore, 0)
    const averageScore = totalScores / records.length
    const maxPossibleScore = records[0].maxPossibleScore // Assuming all records have the same max possible score
    const scorePercentage = (averageScore / maxPossibleScore) * 100
    const healthStatus = determineHealthStatus(scorePercentage)

    // Calculate parameter averages
    const parameterAverages = defaultScoringParameters.map((param) => {
      const scores = records.flatMap((record) =>
        record.parameters.filter((p) => p.parameterId === param.id).map((p) => p.score),
      )

      const averageScore = scores.length > 0 ? scores.reduce((total, score) => total + score, 0) / scores.length : 0

      return {
        parameterId: param.id,
        averageScore,
        maxPoints: param.maxPoints,
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

    return {
      success: true,
      data: summary,
    }
  } catch (error) {
    console.error("Error calculating monthly health summary:", error)
    return {
      success: false,
      error: "Failed to calculate monthly health summary",
    }
  }
}
