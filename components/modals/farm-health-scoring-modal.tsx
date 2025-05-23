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
import { FarmHealthScoringForm } from "@/components/forms/farm-health-scoring-form"
import type { ScoringParameter } from "@/lib/types/farm-health"
import { getScoringParameters } from "@/app/actions/farm-health-actions"
import { getPlotsByFarmId } from "@/app/actions/plot-actions"

interface FarmHealthScoringModalProps {
  trigger: React.ReactNode
  farmId: string
  title?: string
  description?: string
}

export function FarmHealthScoringModal({
  trigger,
  farmId,
  title = "Record Farm Health Assessment",
  description = "Score the farm based on the defined parameters",
}: FarmHealthScoringModalProps) {
  const [open, setOpen] = useState(false)
  const [parameters, setParameters] = useState<ScoringParameter[]>([])
  const [plots, setPlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadParametersAndPlots() {
      try {
        const [paramResult, plotResult] = await Promise.all([
          getScoringParameters(),
          getPlotsByFarmId(Number(farmId)),
        ])
        if (paramResult.success) {
          setParameters(paramResult.data)
        } else {
          setError(paramResult.error || "Failed to load scoring parameters")
        }
        if (plotResult.success) {
          setPlots(plotResult.plots)
        } else {
          setError(plotResult.error || "Failed to load plots")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      loadParametersAndPlots()
    }
  }, [open, farmId])

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading parameters...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <FarmHealthScoringForm farmId={farmId} parameters={parameters} plots={plots} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}
