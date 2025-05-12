"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { MonthlyHealthSummary, ScoringParameter } from "@/lib/types/farm-health"
import { calculateMonthlyHealthSummary, getScoringParameters, getFarmIssuesSummary } from "@/app/actions/farm-health-actions"
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal"

interface FarmHealthSummaryProps {
  farmId: string
  month: number
  year: number
}

export function FarmHealthSummary({ farmId, month, year }: FarmHealthSummaryProps) {
  const [summary, setSummary] = useState<MonthlyHealthSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parameters, setParameters] = useState<ScoringParameter[]>([])
  const [issuesSummary, setIssuesSummary] = useState<{ topIssues: { type: string, count: number }[], total: number } | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function loadSummary() {
      setLoading(true)
      try {
        const result = await calculateMonthlyHealthSummary(farmId, year, month)
        if (result && result.success && result.data) {
          setSummary(normalizeSummary(result.data))
        } else {
          setSummary(null)
        }
        const issuesRes = await getFarmIssuesSummary(farmId, year, month)
        if (issuesRes.success && issuesRes.data) {
          setIssuesSummary(issuesRes.data)
        } else {
          setIssuesSummary(null)
        }
      } catch (err) {
        setSummary(null)
        setIssuesSummary(null)
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [farmId, month, year])

  useEffect(() => {
    getScoringParameters().then((result) => {
      if (result && result.success && result.data) {
        setParameters(result.data.map(normalizeParameter))
      } else {
        setParameters([])
      }
    })
  }, [])

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Average":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Poor":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  function normalizeParameter(param: any): ScoringParameter {
    return {
      id: param.id,
      name: param.name ?? '',
      description: param.description ?? '',
      maxPoints: param.maxPoints ?? 0,
      isActive: param.isActive ?? true,
      category: param.category,
    }
  }

  function normalizeSummary(summary: any): MonthlyHealthSummary {
    return {
      ...summary,
      maxPossibleScore: Number(summary.maxPossibleScore ?? 0),
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Health Summary</CardTitle>
        <CardDescription>Average health scores for the current month</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading health summary...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : !summary ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-muted-foreground mb-2">No health data available for this month.</p>
            <p className="text-muted-foreground mb-4">Record your first health assessment to get started.</p>
            <FarmHealthScoringModal
              farmId={farmId}
              trigger={<button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">Record Health Assessment</button>}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Health Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {Math.round(summary.averageScore * 10) / 10} / {summary.maxPossibleScore}
                  </p>
                  <Badge variant="outline" className={getHealthStatusColor(summary.healthStatus)}>
                    {summary.healthStatus}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on {summary.recordCount} assessments</p>
              </div>
              <div className="w-full sm:w-1/3">
                <p className="text-sm font-medium mb-1">{Math.round(summary.scorePercentage)}%</p>
                <Progress value={summary.scorePercentage} className={getProgressColor(summary.scorePercentage)} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Top Issues This Month</h3>
              {issuesSummary && issuesSummary.total > 0 ? (
                <ul className="space-y-1 text-sm">
                  {issuesSummary.topIssues.map((issue, idx) => (
                    <li key={issue.type} className="flex items-center gap-2">
                      <Badge variant="destructive">{issue.type}</Badge>
                      <span className="font-medium">{issue.count}</span>
                      <span className="text-muted-foreground">occurrences</span>
                    </li>
                  ))}
                  <li className="text-xs text-muted-foreground mt-1">
                    {issuesSummary.total} total issues documented in assessments this month
                  </li>
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No issues documented in assessments this month</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Parameter Breakdown</h3>

              {summary.parameters.map((param) => {
                const parameter = parameters.find(p => p.id === param.parameterId)
                if (!parameter) return null

                const percentage = (param.averageScore / param.maxPoints) * 100

                return (
                  <div key={param.parameterId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{parameter.name || "Unknown"}</span>
                      <p className="text-sm font-medium">
                        {Math.round(param.averageScore * 10) / 10} / {param.maxPoints}
                      </p>
                    </div>
                    <Progress value={percentage} className={getProgressColor(percentage)} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
