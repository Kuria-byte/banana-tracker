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
import { farmInspections, inspectionMetrics, inspectionIssues, plots, farms } from "@/db/schema"
import { eq, and, gte, lte, inArray, desc, or, isNull } from "drizzle-orm"
import type { StandaloneIssueFormValues } from "@/lib/validations/form-schemas"

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

// Create a new inspection issue
export async function createInspectionIssue(
  inspectionId: string,
  plotId: string,
  rowNumber: number,
  holeNumber: number,
  issueType: string,
  description: string,
  status: string = "Open",
  plantId?: string,
  suckerId?: string,
) {
  try {
    const [inserted] = await db.insert(inspectionIssues).values({
      inspectionId: Number(inspectionId),
      plotId: plotId ? Number(plotId) : undefined,
      rowNumber,
      holeNumber,
      plantId: plantId ? Number(plantId) : undefined,
      suckerId: suckerId ? Number(suckerId) : undefined,
      issueType,
      description,
      status,
      createdAt: new Date(),
    }).returning()
    return { success: true, data: inserted }
  } catch (error) {
    console.error("Error creating inspection issue:", error)
    return { success: false, error: "Failed to create inspection issue" }
  }
}

// Create a standalone inspection issue (not linked to an inspection)
export async function createStandaloneInspectionIssue(form: StandaloneIssueFormValues) {
  try {
    const values: any = {
      plotId: form.plotId ? Number(form.plotId) : undefined,
      rowNumber: form.rowNumber,
      holeNumber: form.holeNumber,
      plantId: form.plantId ? Number(form.plantId) : undefined,
      suckerId: form.suckerId ? Number(form.suckerId) : undefined,
      issueType: form.issueType,
      description: form.description,
      status: form.status || "Open",
      createdAt: new Date(),
    }
    // Only set inspectionId if present (for standalone, omit it)
    const [inserted] = await db.insert(inspectionIssues).values(values).returning()
    return { success: true, data: inserted }
  } catch (error) {
    console.error("Error creating standalone inspection issue:", error)
    return { success: false, error: "Failed to create standalone inspection issue" }
  }
}

// Resolve an inspection issue with mitigation notes
export async function resolveInspectionIssue(issueId: string, mitigationNotes: string) {
  try {
    const [updated] = await db.update(inspectionIssues)
      .set({
        status: "Resolved",
        mitigationNotes,
        resolvedAt: new Date(),
      })
      .where(eq(inspectionIssues.id, Number(issueId)))
      .returning()
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error resolving inspection issue:", error)
    return { success: false, error: "Failed to resolve inspection issue" }
  }
}

// Get all issues for an inspection
export async function getInspectionIssuesByInspectionId(inspectionId: string) {
  try {
    const issues = await db.select().from(inspectionIssues).where(eq(inspectionIssues.inspectionId, Number(inspectionId)))
    return { success: true, data: issues }
  } catch (error) {
    console.error("Error fetching inspection issues:", error)
    return { success: false, error: "Failed to fetch inspection issues" }
  }
}

// Get top issues for a farm in a given month/year
export async function getFarmIssuesSummary(farmId: string, year: number, month: number) {
  try {
    // Get all inspections for the farm in the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)
    const inspections = await db.select().from(farmInspections)
      .where(and(
        eq(farmInspections.farmId, Number(farmId)),
        gte(farmInspections.inspectionDate, startDate),
        lte(farmInspections.inspectionDate, endDate)
      ))
    const inspectionIds = inspections.map(i => i.id)
    if (inspectionIds.length === 0) return { success: true, data: [] }
    // Get all issues for these inspections
    const issues = await db.select().from(inspectionIssues)
      .where(inArray(inspectionIssues.inspectionId, inspectionIds))
    // Aggregate by type, row, hole, etc.
    const typeCounts: Record<string, number> = {}
    issues.forEach(issue => {
      if (issue.issueType) {
        typeCounts[issue.issueType] = (typeCounts[issue.issueType] || 0) + 1
      }
    })
    // Top 3 issues
    const topIssues = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }))
    return { success: true, data: { topIssues, total: issues.length } }
  } catch (error) {
    console.error("Error fetching farm issues summary:", error)
    return { success: false, error: "Failed to fetch farm issues summary" }
  }
}

// Update createScoringRecord to accept issueIds
export async function createScoringRecord(
  farmId: string,
  parameterScores: ScoringParameterRecord[],
  notes: string,
  userId: number, // Inspector user ID (must be number)
  plotId?: string,
  issueIds?: number[],
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
      farmId: farmId,
      plotId: plotId || undefined,
      inspectionDate: new Date(),
      inspector: userId, // Store as number
      score: totalScore,
      notes,
      metrics: metricsJson,
      issueIds: issueIds ?? [],
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

// Get farm-level health status based on plot-level inspections
export async function getFarmsHealthStatusFromPlots() {
  // 1. Get all farms
  const allFarms = await db.select().from(farms)
  const results = []
  for (const farm of allFarms) {
    // 2. Get all plots for this farm
    const farmPlots = await db.select().from(plots).where(eq(plots.farmId, farm.id))
    let plotStatuses: string[] = []
    for (const plot of farmPlots) {
      // 3. Get latest inspection for this plot
      const [latestInspection] = await db.select().from(farmInspections)
        .where(eq(farmInspections.plotId, plot.id))
        .orderBy(desc(farmInspections.inspectionDate))
        .limit(1)
      if (latestInspection) {
        // Use your determineHealthStatus function
        const score = latestInspection.score
        plotStatuses.push(determineHealthStatus(score))
      }
    }
    // 4. Aggregate plot statuses to farm status
    let farmStatus = "Not Assessed"
    if (plotStatuses.length > 0) {
      if (plotStatuses.includes("Poor")) farmStatus = "Poor"
      else if (plotStatuses.includes("Average")) farmStatus = "Average"
      else if (plotStatuses.includes("Good")) farmStatus = "Good"
    }
    results.push({
      farmId: farm.id,
      farmName: farm.name,
      healthStatus: farmStatus,
      plotStatuses,
    })
  }
  return results
}

// Get farms with unresolved issues (from any plot)
export async function getFarmsWithUnresolvedIssuesFromPlots() {
  // Get all unresolved issues
  const issues = await db.select().from(inspectionIssues).where(
    or(
      eq(inspectionIssues.status, "Open"),
      eq(inspectionIssues.status, "In Progress")
    )
  )
  // Group by farmId (via inspection -> plot -> farm)
  const farmIssues: Record<number, any[]> = {}
  for (const issue of issues) {
    // Get the inspection and plot to find the farmId
    const [inspection] = await db.select().from(farmInspections).where(eq(farmInspections.id, issue.inspectionId))
    if (inspection) {
      const [plot] = await db.select().from(plots).where(eq(plots.id, inspection.plotId))
      if (plot) {
        if (!farmIssues[plot.farmId]) farmIssues[plot.farmId] = []
        farmIssues[plot.farmId].push({ ...issue, inspection, plot })
      }
    }
  }
  return farmIssues
}

// Get all issues for a farm by farmId
export async function getInspectionIssuesByFarmId(farmId: string) {
  try {
    // Get all inspections for the farm
    const inspections = await db.select().from(farmInspections).where(eq(farmInspections.farmId, Number(farmId)))
    const inspectionIds = inspections.map(i => i.id)
    // Get all plots for the farm
    const plotsForFarm = await db.select().from(plots).where(eq(plots.farmId, Number(farmId)))
    const plotIds = plotsForFarm.map(p => p.id)
    // Get all issues for these inspections
    const issuesFromInspections = inspectionIds.length > 0
      ? await db.select().from(inspectionIssues).where(inArray(inspectionIssues.inspectionId, inspectionIds))
      : []
    // Get standalone issues for this farm (inspectionId is null, plotId in farm's plots)
    const standaloneIssues = plotIds.length > 0
      ? await db.select().from(inspectionIssues).where(
          and(
            isNull(inspectionIssues.inspectionId),
            inArray(inspectionIssues.plotId, plotIds)
          )
        )
      : []
    // Combine and return
    const allIssues = [...issuesFromInspections, ...standaloneIssues]

    // DEBUG: Log the actual issues returned from the DB
    console.log('Fetched issues for farm', farmId, JSON.stringify(allIssues, null, 2));

    // Drizzle returns camelCase keys, so just return as-is
    return { success: true, data: allIssues }
  } catch (error) {
    console.error("Error fetching inspection issues by farmId:", error)
    return { success: false, error: "Failed to fetch inspection issues by farmId" }
  }
}

// Get farms missing a recent inspection (e.g., last 30 days)
export async function getFarmsMissingRecentInspection(days = 30) {
  const allFarms = await db.select().from(farms)
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(now.getDate() - days)
  const farmsMissingInspection = []
  for (const farm of allFarms) {
    // Get latest inspection for this farm
    const [latestInspection] = await db.select().from(farmInspections)
      .where(eq(farmInspections.farmId, farm.id))
      .orderBy(desc(farmInspections.inspectionDate))
      .limit(1)
    if (!latestInspection || new Date(latestInspection.inspectionDate) < cutoff) {
      farmsMissingInspection.push(farm)
    }
  }
  return farmsMissingInspection
}

// Get plots/farms with poor watering scores in their latest inspection
export async function getPlotsWithPoorWatering(thresholdPercent = 50) {
  // Get all plots
  const allPlots = await db.select().from(plots)
  const results = []
  // Get the metric definition for watering
  const [wateringMetric] = await db.select().from(inspectionMetrics).where(eq(inspectionMetrics.metricName, "Watering"))
  if (!wateringMetric) return []
  const wateringKey = wateringMetric.id.toString()
  const maxScore = wateringMetric.maxScore || 1
  for (const plot of allPlots) {
    // Get latest inspection for this plot
    const [latestInspection] = await db.select().from(farmInspections)
      .where(eq(farmInspections.plotId, plot.id))
      .orderBy(desc(farmInspections.inspectionDate))
      .limit(1)
    if (latestInspection && latestInspection.metrics && (latestInspection.metrics as Record<string, any>)[wateringKey] !== undefined) {
      const score = Number((latestInspection.metrics as Record<string, any>)[wateringKey])
      const percent = (score / maxScore) * 100
      if (percent < thresholdPercent) {
        results.push({
          plotId: plot.id,
          plotName: plot.name,
          farmId: plot.farmId,
          score,
          percent,
        })
      }
    }
  }
  return results
}

// Fetch all issues for a given plotId (for plot-level issue tables)
export async function getIssuesByPlotId(plotId: string | number) {
  try {
    const issues = await db.select().from(inspectionIssues).where(eq(inspectionIssues.plotId, Number(plotId)))
    return { success: true, data: issues }
  } catch (error) {
    console.error("Error fetching issues by plotId:", error)
    return { success: false, error: "Failed to fetch issues by plotId" }
  }
}
