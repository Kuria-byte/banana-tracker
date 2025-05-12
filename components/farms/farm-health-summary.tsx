"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Activity, Check, X } from "lucide-react"
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

  const getProgressBackground = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100"
    if (percentage >= 60) return "bg-yellow-100"
    return "bg-red-100"
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
    <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Monthly Health Summary</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white">
            {new Date(year, month-1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Badge>
        </div>
        <CardDescription>Average health scores and key metrics for the current month</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="h-8 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-2 w-48 bg-slate-200 rounded"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading health summary...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-3 mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500">{error}</p>
          </div>
        ) : !summary ? (
          <div className="py-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center rounded-full bg-slate-100 p-3 mb-2">
              <Activity className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-slate-600 text-lg font-medium mb-2">No health data available for this month</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Record your first health assessment to track farm performance and identify areas for improvement.
            </p>
            <FarmHealthScoringModal
              farmId={farmId}
              trigger={<button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm">Record Health Assessment</button>}
            />
          </div>
        ) : (
          <div className="divide-y">
            {/* Score Overview */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Overall Health Score</p>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">
                      {Math.round(summary.averageScore * 10) / 10} <span className="text-slate-400 text-lg">/ {summary.maxPossibleScore}</span>
                    </div>
                    <Badge variant="outline" className={`${getHealthStatusColor(summary.healthStatus)} ml-2`}>
                      {summary.healthStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Based on {summary.recordCount} assessment{summary.recordCount !== 1 ? 's' : ''} this month</p>
                </div>
                <div className="w-full sm:w-1/3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{Math.round(summary.scorePercentage)}%</p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                  <div className={`h-2 rounded-full ${getProgressBackground(summary.scorePercentage)}`}>
                    <Progress value={summary.scorePercentage} className={`h-2 ${getProgressColor(summary.scorePercentage)}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Issues */}
            <div className="p-6">
              <h3 className="text-sm font-medium flex items-center mb-3">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Top Issues This Month
              </h3>
              {issuesSummary && issuesSummary.total > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {issuesSummary.topIssues.map((issue, idx) => (
                      <div key={issue.type} className="flex items-center gap-2 p-3 rounded-md bg-slate-50 border">
                        <Badge variant="destructive" className="min-w-[80px] flex justify-center">{issue.type}</Badge>
                        <span className="font-medium">{issue.count}</span>
                        <span className="text-muted-foreground">occurrences</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {issuesSummary.total} total issues documented in assessments this month
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 rounded-md bg-green-50 border border-green-100">
                  <Check className="h-5 w-5 text-green-500" />
                  <p className="text-green-700">No issues documented in assessments this month</p>
                </div>
              )}
            </div>

            {/* Parameter Breakdown */}
            <div className="p-6">
              <h3 className="text-sm font-medium mb-4">Parameter Breakdown</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {summary.parameters.map((param) => {
                  const parameter = parameters.find(p => p.id === param.parameterId)
                  if (!parameter) return null

                  const percentage = (param.averageScore / param.maxPoints) * 100

                  return (
                    <div key={param.parameterId} className="space-y-2 p-3 rounded-md bg-slate-50 border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{parameter.name || "Unknown"}</span>
                        <div className="bg-white px-2 py-1 rounded border text-xs font-medium">
                          {Math.round(param.averageScore * 10) / 10} / {param.maxPoints}
                        </div>
                      </div>
                      <div className={`h-2 rounded-full ${getProgressBackground(percentage)}`}>
                        <Progress value={percentage} className={`h-2 ${getProgressColor(percentage)}`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}