import type {
  ScoringParameter,
  ScoringRecord,
  MonthlyHealthSummary,
  ScoringParameterRecord,
  HealthStatus,
} from "../types/farm-health"
import { determineHealthStatus } from "../types/farm-health"

// Default scoring parameters
export const defaultScoringParameters: ScoringParameter[] = [
  {
    id: "param1",
    name: "Watering",
    description: "2 times per week",
    maxPoints: 4,
    isActive: true,
    category: "Maintenance",
  },
  {
    id: "param2",
    name: "Weeding inside holes",
    description: "Removal of weeds from planting holes",
    maxPoints: 2,
    isActive: true,
    category: "Maintenance",
  },
  {
    id: "param3",
    name: "Desuckering",
    description: "3-5 different stages",
    maxPoints: 2,
    isActive: true,
    category: "Plant Management",
  },
  {
    id: "param4",
    name: "Deleafing",
    description: "Removal of magayo, nyongoro",
    maxPoints: 1,
    isActive: true,
    category: "Plant Management",
  },
  {
    id: "param5",
    name: "Cutting Miramba",
    description: "Cut into 2 inches",
    maxPoints: 1,
    isActive: true,
    category: "Plant Management",
  },
  {
    id: "param6",
    name: "Pests and diseases",
    description: "Reported immediately, mitigated within 3 days",
    maxPoints: 2,
    isActive: true,
    category: "Health",
  },
  {
    id: "param7",
    name: "Propping",
    description: "Supporting banana plants",
    maxPoints: 1,
    isActive: true,
    category: "Plant Management",
  },
  {
    id: "param8",
    name: "No loss of mature plantain",
    description: "All mature plantains harvested properly",
    maxPoints: 1,
    isActive: true,
    category: "Harvest",
  },
  {
    id: "param9",
    name: "Banana health",
    description: "Productivity and kilos. Within a 25kg range on average",
    maxPoints: 3,
    isActive: true,
    category: "Health",
  },
  {
    id: "param10",
    name: "Fencing/trespassing control",
    description: "Proper fencing and security measures",
    maxPoints: 1,
    isActive: true,
    category: "Security",
  },
]

// Generate some mock scoring records
export const mockScoringRecords: ScoringRecord[] = [
  // Farm 1 records
  {
    id: "record1",
    farmId: "farm1",
    date: "2023-05-01T00:00:00Z",
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      score: Math.floor(Math.random() * (param.maxPoints + 1)),
    })),
    totalScore: 15,
    maxPossibleScore: 18,
    healthStatus: "Good",
    notes: "Farm is doing well overall",
    createdById: "user1",
    createdAt: "2023-05-01T10:30:00Z",
  },
  {
    id: "record2",
    farmId: "farm1",
    date: "2023-05-15T00:00:00Z",
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      score: Math.floor(Math.random() * (param.maxPoints + 1)),
    })),
    totalScore: 14,
    maxPossibleScore: 18,
    healthStatus: "Good",
    notes: "Some minor issues with watering",
    createdById: "user1",
    createdAt: "2023-05-15T11:15:00Z",
  },
  // Farm 2 records
  {
    id: "record3",
    farmId: "farm2",
    date: "2023-05-02T00:00:00Z",
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      score: Math.floor(Math.random() * (param.maxPoints + 1)),
    })),
    totalScore: 12,
    maxPossibleScore: 18,
    healthStatus: "Average",
    notes: "Need to improve pest control",
    createdById: "user3",
    createdAt: "2023-05-02T09:45:00Z",
  },
  {
    id: "record4",
    farmId: "farm2",
    date: "2023-05-16T00:00:00Z",
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      score: Math.floor(Math.random() * (param.maxPoints + 1)),
    })),
    totalScore: 10,
    maxPossibleScore: 18,
    healthStatus: "Average",
    notes: "Pest issues persisting",
    createdById: "user3",
    createdAt: "2023-05-16T10:00:00Z",
  },
  // Farm 3 records
  {
    id: "record5",
    farmId: "farm3",
    date: "2023-05-03T00:00:00Z",
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      score: Math.floor(Math.random() * (param.maxPoints + 1)),
    })),
    totalScore: 8,
    maxPossibleScore: 18,
    healthStatus: "Poor",
    notes: "Multiple issues need addressing",
    createdById: "user2",
    createdAt: "2023-05-03T14:20:00Z",
  },
  {
    id: "record6",
    farmId: "farm3",
    date: "2023-05-17T00:00:00Z",
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      score: Math.floor(Math.random() * (param.maxPoints + 1)),
    })),
    totalScore: 9,
    maxPossibleScore: 18,
    healthStatus: "Poor",
    notes: "Slight improvement but still concerning",
    createdById: "user2",
    createdAt: "2023-05-17T15:30:00Z",
  },
]

// Generate mock monthly summaries
export const mockMonthlySummaries: MonthlyHealthSummary[] = [
  {
    farmId: "farm1",
    year: 2023,
    month: 5,
    averageScore: 14.5,
    maxPossibleScore: 18,
    scorePercentage: 80.56,
    healthStatus: "Good",
    recordCount: 2,
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      averageScore: Math.random() * param.maxPoints,
      maxPoints: param.maxPoints,
    })),
  },
  {
    farmId: "farm2",
    year: 2023,
    month: 5,
    averageScore: 11,
    maxPossibleScore: 18,
    scorePercentage: 61.11,
    healthStatus: "Average",
    recordCount: 2,
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      averageScore: Math.random() * param.maxPoints,
      maxPoints: param.maxPoints,
    })),
  },
  {
    farmId: "farm3",
    year: 2023,
    month: 5,
    averageScore: 8.5,
    maxPossibleScore: 18,
    scorePercentage: 47.22,
    healthStatus: "Poor",
    recordCount: 2,
    parameters: defaultScoringParameters.map((param) => ({
      parameterId: param.id,
      averageScore: Math.random() * param.maxPoints,
      maxPoints: param.maxPoints,
    })),
  },
]

// Helper functions for the scoring system
export function getScoringParameterById(id: string): ScoringParameter | undefined {
  return defaultScoringParameters.find((param) => param.id === id)
}

export function getActiveScoringParameters(): ScoringParameter[] {
  return defaultScoringParameters.filter((param) => param.isActive)
}

export function getScoringRecordsByFarmId(farmId: string): ScoringRecord[] {
  return mockScoringRecords.filter((record) => record.farmId === farmId)
}

export function getMonthlyHealthSummaryByFarmId(
  farmId: string,
  year: number,
  month: number,
): MonthlyHealthSummary | undefined {
  return mockMonthlySummaries.find(
    (summary) => summary.farmId === farmId && summary.year === year && summary.month === month,
  )
}

export function calculateTotalScore(parameterRecords: ScoringParameterRecord[]): number {
  return parameterRecords.reduce((total, record) => {
    return total + record.score
  }, 0)
}

export function calculateMaxPossibleScore(): number {
  return getActiveScoringParameters().reduce((total, param) => {
    return total + param.maxPoints
  }, 0)
}

export function calculateHealthStatus(score: number, maxPossibleScore: number): HealthStatus {
  const percentage = (score / maxPossibleScore) * 100
  return determineHealthStatus(percentage)
}

// Function to create a new scoring record
export function createScoringRecord(
  farmId: string,
  parameterScores: ScoringParameterRecord[],
  notes: string,
  userId: string,
): ScoringRecord {
  const totalScore = calculateTotalScore(parameterScores)
  const maxPossibleScore = calculateMaxPossibleScore()
  const healthStatus = calculateHealthStatus(totalScore, maxPossibleScore)

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

  // In a real app, this would save to a database
  // mockScoringRecords.push(newRecord);

  return newRecord
}
