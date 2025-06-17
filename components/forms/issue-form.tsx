"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { standaloneIssueFormSchema, type StandaloneIssueFormValues } from "@/lib/validations/form-schemas"
import { createStandaloneInspectionIssue } from "@/app/actions/farm-health-actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IssueFormProps {
  farmId: string
  plots: any[]
  onSuccess?: () => void
  defaultPlotId?: string
}

export function IssueForm({ farmId, plots, onSuccess, defaultPlotId }: IssueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [layout, setLayout] = useState<any[]>([])
  const [selectedPlot, setSelectedPlot] = useState<string>(defaultPlotId || (plots[0]?.id?.toString() || ""))
  const [scope, setScope] = useState<"plot" | "row" | "hole">("plot")

  const form = useForm<StandaloneIssueFormValues>({
    resolver: zodResolver(standaloneIssueFormSchema),
    defaultValues: {
      farmId,
      plotId: defaultPlotId || (plots[0]?.id?.toString() || ""),
      rowNumber: undefined,
      holeNumber: undefined,
      issueType: "",
      description: "",
      status: "Open",
      plantId: undefined,
      suckerId: undefined,
    },
  })

  // Update layout when plot changes
  useEffect(() => {
    const plot = plots.find((p: any) => String(p.id) === String(selectedPlot))
    setLayout(plot?.layoutStructure || [])
    form.setValue("plotId", selectedPlot)
    form.setValue("rowNumber", undefined)
    form.setValue("holeNumber", undefined)
    form.setValue("plantId", undefined)
    form.setValue("suckerId", undefined)
  }, [selectedPlot, plots])

  // Helpers for row/hole/plant/sucker options
  const availableRows = layout.map((row: any) => row.rowNumber)
  const selectedRow = layout.find((row: any) => String(row.rowNumber) === String(form.watch("rowNumber")))
  const availableHoles = selectedRow ? selectedRow.holes.map((hole: any) => hole.holeNumber) : []
  const selectedHole = selectedRow ? selectedRow.holes.find((hole: any) => String(hole.holeNumber) === String(form.watch("holeNumber"))) : null
  const availablePlants = selectedHole && selectedHole.activePlantIds ? selectedHole.activePlantIds : []
  const availableSuckers = selectedHole && selectedHole.suckerIds ? selectedHole.suckerIds : []

  // Scope logic for form submission
  function getSubmissionValues(values: StandaloneIssueFormValues): StandaloneIssueFormValues {
    if (scope === "plot") {
      return { ...values, rowNumber: undefined, holeNumber: undefined, plantId: undefined, suckerId: undefined }
    }
    if (scope === "row") {
      return { ...values, holeNumber: undefined, plantId: undefined, suckerId: undefined }
    }
    return values
  }

  const onSubmit = async (values: StandaloneIssueFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await createStandaloneInspectionIssue(getSubmissionValues(values))
      if (result.success) {
        setSuccess("Issue recorded successfully!")
        form.reset()
        if (onSuccess) onSuccess()
      } else {
        setError(result.error || "Failed to record issue")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <FormLabel>Scope</FormLabel>
          <Select value={scope} onValueChange={v => setScope(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plot">Plot-wide</SelectItem>
              <SelectItem value="row">Row-wide</SelectItem>
              <SelectItem value="hole">Specific Hole/Plant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FormField
          control={form.control}
          name="plotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot</FormLabel>
              <Select value={field.value} onValueChange={v => { setSelectedPlot(v); field.onChange(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plot" />
                </SelectTrigger>
                <SelectContent>
                  {plots.map(plot => (
                    <SelectItem key={plot.id} value={plot.id.toString()}>{plot.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {scope !== "plot" && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rowNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Row</FormLabel>
                  <Select value={field.value?.toString() || ""} onValueChange={v => field.onChange(v ? Number(v) : undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Row" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRows.map((rowNum: any) => (
                        <SelectItem key={rowNum} value={rowNum.toString()}>Row {rowNum}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {scope === "hole" && (
              <FormField
                control={form.control}
                name="holeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hole</FormLabel>
                    <Select value={field.value?.toString() || ""} onValueChange={v => field.onChange(v ? Number(v) : undefined)} disabled={!form.watch("rowNumber") || availableHoles.length === 0}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hole" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHoles.map((holeNum: any) => (
                          <SelectItem key={holeNum} value={holeNum.toString()}>Hole {holeNum}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
        {scope === "hole" && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="plantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant</FormLabel>
                  <Select value={field.value || ""} onValueChange={v => field.onChange(v)} disabled={!form.watch("holeNumber") || availablePlants.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Plant" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlants.map((plantId: any) => (
                        <SelectItem key={plantId} value={plantId.toString()}>Plant {plantId}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suckerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucker</FormLabel>
                  <Select value={field.value || ""} onValueChange={v => field.onChange(v)} disabled={!form.watch("holeNumber") || availableSuckers.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sucker" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuckers.map((suckerId: any) => (
                        <SelectItem key={suckerId} value={suckerId.toString()}>Sucker {suckerId}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="issueType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disease">Disease</SelectItem>
                  <SelectItem value="Pest">Pest</SelectItem>
                  <SelectItem value="Nutritional">Nutritional</SelectItem>
                  <SelectItem value="Suckers">Suckers</SelectItem>
                  <SelectItem value="Damage">Damage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the issue in detail..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Record Issue"}
        </Button>
      </form>
    </Form>
  )
} 