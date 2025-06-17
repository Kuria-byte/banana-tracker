"use client"

import { useEffect, useState } from "react"
import { getInspectionIssuesByFarmId, resolveInspectionIssue, getIssuesByPlotId } from "@/app/actions/farm-health-actions"
import type { InspectionIssue } from "@/lib/types/farm-health"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FarmIssuesListProps {
  farmId?: string
  plotId?: string | number
}

export function FarmIssuesList({ farmId, plotId }: FarmIssuesListProps) {
  const [issues, setIssues] = useState<InspectionIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolveModal, setResolveModal] = useState<{ open: boolean; issue: InspectionIssue | null }>({ open: false, issue: null })
  const [mitigationNotes, setMitigationNotes] = useState("")
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true)
      setError(null)
      try {
        let result
        if (plotId) {
          result = await getIssuesByPlotId(plotId)
        } else if (farmId) {
          result = await getInspectionIssuesByFarmId(farmId)
        } else {
          setError("No farmId or plotId provided")
          setLoading(false)
          return
        }
        if (result.success) {
          setIssues(result.data)
        } else {
          setError(result.error || "Failed to fetch issues")
        }
      } catch (err) {
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [farmId, plotId])

  const openResolveModal = (issue: InspectionIssue) => {
    setMitigationNotes("")
    setResolveError(null)
    setResolveModal({ open: true, issue })
  }

  const handleResolve = async () => {
    if (!resolveModal.issue) return
    setResolving(true)
    setResolveError(null)
    try {
      const result = await resolveInspectionIssue(resolveModal.issue.id, mitigationNotes)
      if (result.success) {
        setIssues((prev) => prev.map((i) => i.id === resolveModal.issue!.id ? { ...i, status: "Resolved", mitigationNotes } : i))
        setResolveModal({ open: false, issue: null })
      } else {
        setResolveError(result.error || "Failed to resolve issue")
      }
    } catch (err) {
      setResolveError("An unexpected error occurred")
    } finally {
      setResolving(false)
    }
  }

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading issues...</div>
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>
  if (issues.length === 0) return <div className="py-8 text-center text-muted-foreground">No issues found for this farm.</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg bg-white">
        <thead>
          <tr className="bg-muted/40">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Scope</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Mitigation</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id} className="border-t">
              <td className="px-4 py-2 text-sm">{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "-"}</td>
              <td className="px-4 py-2 text-sm">
                {(() => {
                  if (issue.rowNumber == null && issue.holeNumber == null) {
                    return <span className="font-medium text-blue-700">Plot-wide</span>
                  }
                  if (issue.rowNumber != null && issue.holeNumber == null) {
                    return <span className="font-medium text-yellow-700">Row {issue.rowNumber}</span>
                  }
                  if (issue.rowNumber != null && issue.holeNumber != null) {
                    return <span className="font-medium text-green-700">Row {issue.rowNumber}, Hole {issue.holeNumber}</span>
                  }
                  return "-"
                })()}
              </td>
              <td className="px-4 py-2 text-sm">{issue.issueType || "-"}</td>
              <td className="px-4 py-2 text-sm">{issue.description || "-"}</td>
              <td className="px-4 py-2 text-sm">
                {issue.status === "Resolved" ? (
                  <span className="text-green-600 font-medium">Resolved</span>
                ) : (
                  <span className="text-red-600 font-medium">{issue.status || "Open"}</span>
                )}
              </td>
              <td className="px-4 py-2 text-sm">{issue.mitigationNotes || (issue.status === "Resolved" ? <span className="text-muted-foreground">No mitigation recorded</span> : "-")}</td>
              <td className="px-4 py-2 text-sm">
                {issue.status !== "Resolved" && (
                  <Button size="sm" variant="outline" onClick={() => openResolveModal(issue)}>
                    Resolve
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={resolveModal.open} onOpenChange={open => setResolveModal(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mitigation Measures</label>
              <Textarea
                value={mitigationNotes}
                onChange={e => setMitigationNotes(e.target.value)}
                placeholder="Describe the mitigation measures taken..."
                className="min-h-[80px]"
              />
            </div>
            {resolveError && <div className="text-red-500 text-sm">{resolveError}</div>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setResolveModal({ open: false, issue: null })}>Cancel</Button>
              <Button onClick={handleResolve} disabled={resolving || !mitigationNotes.trim()}>
                {resolving ? "Resolving..." : "Resolve Issue"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 