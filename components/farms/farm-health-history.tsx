"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { ScoringRecord } from "@/lib/types/farm-health"
import { getScoringRecordsByFarmId, getInspectionIssuesByInspectionId } from "@/app/actions/farm-health-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FarmHealthHistoryProps {
  farmId: string
}

export function FarmHealthHistory({ farmId }: FarmHealthHistoryProps) {
  const [records, setRecords] = useState<ScoringRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState("all")
  const [issuesByRecord, setIssuesByRecord] = useState<Record<string, any[]>>({})
  const [openDialogId, setOpenDialogId] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecords() {
      setLoading(true)
      try {
        const result = await getScoringRecordsByFarmId(farmId)
        if (result.success) {
          let filteredRecords = result.data

          // Apply timeframe filter
          if (timeframe !== "all") {
            const now = new Date()
            const cutoffDate = new Date()

            if (timeframe === "month") {
              cutoffDate.setMonth(now.getMonth() - 1)
            } else if (timeframe === "quarter") {
              cutoffDate.setMonth(now.getMonth() - 3)
            } else if (timeframe === "year") {
              cutoffDate.setFullYear(now.getFullYear() - 1)
            }

            filteredRecords = filteredRecords.filter((record) => new Date(record.date) >= cutoffDate)
          }

          // Sort by date (newest first)
          filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setRecords(filteredRecords)
          // Fetch issues for each record
          const issuesMap: Record<string, any[]> = {}
          await Promise.all(filteredRecords.map(async (record: any) => {
            const res = await getInspectionIssuesByInspectionId(record.id)
            if (res.success && res.data) {
              issuesMap[record.id] = res.data
            } else {
              issuesMap[record.id] = []
            }
          }))
          setIssuesByRecord(issuesMap)
        } else {
          setError(result.error || "Failed to load health records")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [farmId, timeframe])

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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Farm Health History</CardTitle>
            <CardDescription>Past health assessments for this farm</CardDescription>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading health records...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No health records found for this farm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {record.totalScore} / {record.maxPossibleScore} (
                      {Math.round((record.totalScore / record.maxPossibleScore) * 100)}%)
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getHealthStatusColor(record.healthStatus)}>
                        {record.healthStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.notes || "No notes"}</TableCell>
                    <TableCell>
                      {issuesByRecord[record.id] && issuesByRecord[record.id].length > 0 ? (
                        <Dialog open={openDialogId === record.id} onOpenChange={open => setOpenDialogId(open ? record.id : null)}>
                          <DialogTrigger asChild>
                            <Badge variant="destructive" className="cursor-pointer">{issuesByRecord[record.id].length} Issue(s)</Badge>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assessment Issues</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {issuesByRecord[record.id].map((issue, idx) => (
                                <div key={idx} className="border rounded p-3 bg-muted/40">
                                  <div className="flex flex-wrap gap-2 mb-1">
                                    <Badge variant="outline">Row {issue.rowNumber}</Badge>
                                    <Badge variant="outline">Hole {issue.holeNumber}</Badge>
                                    {issue.plantId && <Badge variant="secondary">Plant {issue.plantId}</Badge>}
                                    {issue.suckerId && <Badge variant="secondary">Sucker {issue.suckerId}</Badge>}
                                    <Badge>{issue.issueType}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">{issue.description}</div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Badge variant="outline">No Issues</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
