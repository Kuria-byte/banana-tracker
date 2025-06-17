// Farm Health Scoring Types
export type HealthStatus = "Good" | "Average" | "Poor"

export interface ScoringParameter {
  id: string
  name: string
  description: string
  maxPoints: number
  isActive: boolean
  category?: string
}

export interface ScoringRecord {
  id: string
  farmId: string
  plotId?: string // Optional: plot-level scoring
  date: string // ISO date string
  parameters: ScoringParameterRecord[]
  totalScore: number
  maxPossibleScore: number
  healthStatus: HealthStatus
  notes?: string
  issueIds?: string[] // Optional: references to inspection_issues
  createdById: string
  createdAt: string // ISO date string
  updatedAt?: string // ISO date string
}

export interface ScoringParameterRecord {
  parameterId: string
  score: number
  notes?: string
}

export interface MonthlyHealthSummary {
  farmId: string
  year: number
  month: number // 1-12
  averageScore: number
  maxPossibleScore: number
  scorePercentage: number
  healthStatus: HealthStatus
  recordCount: number
  parameters: {
    parameterId: string
    averageScore: number
    maxPoints: number
  }[]
}

// Thresholds for determining health status
export const HEALTH_STATUS_THRESHOLDS = {
  Good: 80, // 80% and above
  Average: 60, // 60-79%
  Poor: 0, // Below 60%
}

// Function to determine health status based on score percentage
export function determineHealthStatus(scorePercentage: number): HealthStatus {
  if (scorePercentage >= HEALTH_STATUS_THRESHOLDS.Good) {
    return "Good"
  } else if (scorePercentage >= HEALTH_STATUS_THRESHOLDS.Average) {
    return "Poor"
  } else {
    return "Poor"
  }
}

export interface InspectionIssue {
  id: string
  inspectionId: string
  plotId?: string
  rowNumber?: number
  holeNumber?: number
  plantId?: string
  suckerId?: string
  issueType?: string
  description?: string
  status?: string
  createdAt: string
  resolvedAt?: string
  mitigationNotes?: string
}
