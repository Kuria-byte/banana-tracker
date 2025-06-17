"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IssueForm } from "@/components/forms/issue-form"
import { getPlotsByFarmId } from "@/app/actions/plot-actions"

interface IssueFormModalProps {
  trigger: React.ReactNode
  farmId: string
  defaultPlotId?: string
  title?: string
  description?: string
}

export function IssueFormModal({
  trigger,
  farmId,
  defaultPlotId,
  title = "Record Issue or Concern",
  description = "Document an issue for this farm or plot.",
}: IssueFormModalProps) {
  const [open, setOpen] = useState(false)
  const [plots, setPlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlots() {
      try {
        const result = await getPlotsByFarmId(Number(farmId))
        if (result.success) {
          setPlots(result.plots)
        } else {
          setError(result.error || "Failed to load plots")
        }
      } catch (err) {
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }
    if (open) {
      setLoading(true)
      setError(null)
      loadPlots()
    }
  }, [open, farmId])

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading plots...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <IssueForm farmId={farmId} plots={plots} onSuccess={handleSuccess} defaultPlotId={defaultPlotId} />
        )}
      </DialogContent>
    </Dialog>
  )
} 