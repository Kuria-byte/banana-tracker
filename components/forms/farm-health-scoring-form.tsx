"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  CalendarIcon, 
  InfoIcon, 
  Plus, 
  XCircle, 
  ChevronsUpDown, 
  Leaf, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  CircleAlert
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle, 
  CardFooter
} from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { ScoringParameter } from "@/lib/types/farm-health"
import { createScoringRecord, createInspectionIssue } from "@/app/actions/farm-health-actions"
import type { Plot } from "@/lib/types/plot"
import { getAllUsers } from "@/app/actions/team-actions"

// Create a schema for the form
const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date for this assessment.",
  }),
  notes: z.string().optional(),
  parameters: z.array(
    z.object({
      parameterId: z.string(),
      score: z.number().min(0),
    }),
  ),
})

type FormValues = z.infer<typeof formSchema>

interface FarmHealthScoringFormProps {
  farmId: string
  parameters: ScoringParameter[]
  plots: any[]
  onSuccess?: () => void
}

interface IssueDraft {
  rowNumber: string
  holeNumber: string
  plantId: string
  suckerId: string
  issueType: string
  description: string
}

export function FarmHealthScoringForm({ farmId, parameters, plots, onSuccess }: FarmHealthScoringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlot, setSelectedPlot] = useState<string>("")
  const [issues, setIssues] = useState<IssueDraft[]>([])
  const [issueDraft, setIssueDraft] = useState<IssueDraft>({ rowNumber: "", holeNumber: "", plantId: "", suckerId: "", issueType: "", description: "" })
  const [layout, setLayout] = useState<any[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [users, setUsers] = useState<{ id: string, name: string }[]>([])
  const [selectedInspector, setSelectedInspector] = useState<string>("")

  // Fetch users on mount
  useEffect(() => {
    getAllUsers().then((result) => {
      if (Array.isArray(result)) {
        setUsers(result.map(u => ({ id: u.id, name: u.name })))
        if (result.length > 0) setSelectedInspector(result[0].id)
      }
    })
  }, [])

  // Fetch layoutStructure when plot changes
  useEffect(() => {
    if (selectedPlot) {
      const plot = plots.find((p: any) => String(p.id) === String(selectedPlot))
      setLayout(plot?.layoutStructure || [])
      // Reset issue draft when plot changes
      setIssueDraft({ rowNumber: "", holeNumber: "", plantId: "", suckerId: "", issueType: "", description: "" })
    } else {
      setLayout([])
    }
  }, [selectedPlot, plots])

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      notes: "",
      parameters: parameters.map((param) => ({
        parameterId: param.id,
        score: 0,
      })),
    },
  })

  // Calculate the maximum possible score
  const maxPossibleScore = parameters.reduce((total, param) => total + param.maxPoints, 0)

  // Calculate the current score based on form values
  const currentScore = form.watch("parameters").reduce((total, param) => {
    return total + param.score
  }, 0)

  // Calculate the score percentage
  const scorePercentage = maxPossibleScore > 0 ? Math.round((currentScore / maxPossibleScore) * 100) : 0

  // Get the health status based on the score percentage
  const getHealthStatus = () => {
    if (scorePercentage >= 70) return "Good"
    if (scorePercentage >= 50) return "Average"
    return "Poor"
  }

  // Get the health status color based on the score percentage
  const getHealthStatusColor = () => {
    if (scorePercentage >= 70) return "text-green-600 dark:text-green-400"
    if (scorePercentage >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  // Get the health status background color based on the score percentage
  const getHealthStatusBgColor = () => {
    if (scorePercentage >= 70) return "bg-green-100 dark:bg-green-900/30"
    if (scorePercentage >= 50) return "bg-yellow-100 dark:bg-yellow-900/30"
    return "bg-red-100 dark:bg-red-900/30"
  }

  // Get the health status icon based on the score percentage
  const HealthStatusIcon = () => {
    if (scorePercentage >= 70) return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    if (scorePercentage >= 50) return <CircleAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
    return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
  }

  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const userId = Number(selectedInspector)
      // 1. Create the inspection record first (without issues)
      const inspectionResult = await createScoringRecord(
        farmId,
        values.parameters,
        values.notes || "",
        userId,
        selectedPlot,
        [], // No issues yet
      )
      if (!inspectionResult.success || !inspectionResult.data || !inspectionResult.data.id) {
        setError(inspectionResult.error || "Failed to create scoring record")
        setIsSubmitting(false)
        return
      }
      const inspectionId = inspectionResult.data.id
      // 2. Create issues with the real inspection ID
      let issueIds: number[] = []
      if (issues.length > 0) {
        for (const issue of issues) {
          const res = await createInspectionIssue(
            inspectionId.toString(),
            selectedPlot,
            Number(issue.rowNumber),
            Number(issue.holeNumber),
            issue.issueType,
            issue.description,
            "Open",
            issue.plantId,
            issue.suckerId,
          )
          if (res.success && res.data && res.data.id) {
            issueIds.push(res.data.id)
          }
        }
      }
      // 3. Optionally, update the inspection record with the array of issue IDs (if needed)
      // TODO: Implement update if you want to keep issueIds in the inspection record
      setSuccessMessage("Farm health assessment submitted successfully!")
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper: get available rows, holes, plants, suckers
  const availableRows = layout.map((row: any) => row.rowNumber)
  const selectedRow = layout.find((row: any) => String(row.rowNumber) === String(issueDraft.rowNumber))
  const availableHoles = selectedRow ? selectedRow.holes.map((hole: any) => hole.holeNumber) : []
  const selectedHole = selectedRow ? selectedRow.holes.find((hole: any) => String(hole.holeNumber) === String(issueDraft.holeNumber)) : null
  const availablePlants = selectedHole && selectedHole.activePlantIds ? selectedHole.activePlantIds : []
  const availableSuckers = selectedHole && selectedHole.suckerIds ? selectedHole.suckerIds : []

  // Function to add an issue
  const handleAddIssue = () => {
    if (issueDraft.rowNumber && issueDraft.holeNumber && issueDraft.issueType && issueDraft.description) {
      setIssues([...issues, issueDraft])
      setIssueDraft({ rowNumber: "", holeNumber: "", plantId: "", suckerId: "", issueType: "", description: "" })
      setSuccessMessage("Issue added successfully!")
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  // Function to remove an issue
  const handleRemoveIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index))
  }

  // Get the selected plot
  const selectedPlotData = plots.find((p) => String(p.id) === String(selectedPlot))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Inspector selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-primary" />
              Farm Health Assessment
            </CardTitle>
            <CardDescription>
              Select a plot, inspector, and score the health parameters to assess farm health.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <FormLabel htmlFor="inspector-select" className="text-base font-medium">Inspector</FormLabel>
              <Select value={selectedInspector} onValueChange={setSelectedInspector}>
                <SelectTrigger id="inspector-select" className="w-full">
                  <SelectValue placeholder="Select inspector" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormLabel htmlFor="plot-select" className="text-base font-medium">Plot Selection</FormLabel>
            <Select value={selectedPlot} onValueChange={setSelectedPlot}>
              <SelectTrigger id="plot-select" className="w-full">
                <SelectValue placeholder="Select a plot to assess" />
              </SelectTrigger>
              <SelectContent>
                {plots.map(plot => (
                  <SelectItem key={plot.id} value={plot.id.toString()}>
                    {plot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPlotData && (
              <div className="mt-2 p-3 bg-muted/40 rounded-md">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{selectedPlotData.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Area:</span> {selectedPlotData.area} acres
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rows:</span> {selectedPlotData.rowCount || layout.length}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Soil:</span> {selectedPlotData.soilType || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> {selectedPlotData.status || "Active"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plot selection section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              Plot Details
            </CardTitle>
            <CardDescription>
              Additional details about the selected plot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                      <FormLabel className="text-base font-medium">Assessment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full pl-3 text-left font-normal">
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

                <div>
                  <FormLabel className="text-base font-medium">Current Health Status</FormLabel>
                  <Card className={cn("mt-2 overflow-hidden border-2", 
                    scorePercentage >= 70 ? "border-green-500 dark:border-green-700" : 
                    scorePercentage >= 50 ? "border-yellow-500 dark:border-yellow-700" : 
                    "border-red-500 dark:border-red-700"
                  )}>
                    <div className={cn("py-1 px-4 flex items-center justify-between", getHealthStatusBgColor())}>
                      <div className="flex items-center">
                        <HealthStatusIcon />
                        <span className={cn("ml-2 font-medium", getHealthStatusColor())}>{getHealthStatus()}</span>
                      </div>
                      <span className={cn("font-bold", getHealthStatusColor())}>{scorePercentage}%</span>
                    </div>
                    <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Score</p>
                    <p className="text-2xl font-bold">
                            {currentScore} <span className="text-sm text-muted-foreground font-normal">/ {maxPossibleScore}</span>
                    </p>
                  </div>
                        <div className="relative h-16 w-16">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={cn("h-14 w-14 rounded-full border-4", 
                              scorePercentage >= 70 ? "border-green-500 dark:border-green-700" : 
                              scorePercentage >= 50 ? "border-yellow-500 dark:border-yellow-700" : 
                              "border-red-500 dark:border-red-700"
                            )}>
                              <div className="h-full w-full flex items-center justify-center">
                                <span className={cn("text-xl font-bold", getHealthStatusColor())}>{scorePercentage}%</span>
                              </div>
                            </div>
                          </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring parameters section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              Scoring Parameters
            </CardTitle>
            <CardDescription>
              Score each parameter to assess the overall health of the farm.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <TooltipProvider>
          {parameters.map((parameter, index) => (
            <FormField
              key={parameter.id}
              control={form.control}
              name={`parameters.${index}.score`}
              render={({ field }) => (
                <FormItem>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                              <FormLabel className="text-base font-medium">{parameter.name}</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{parameter.description}</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {field.value} / {parameter.maxPoints}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-10">
                              <FormControl>
                                <Slider
                                  defaultValue={[0]}
                                  max={parameter.maxPoints}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="cursor-pointer"
                                />
                              </FormControl>
                            </div>
                            <div className="col-span-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={parameter.maxPoints}
                                  className="w-full text-center"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                            </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Add issues section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
              Add Issues & Concerns
            </CardTitle>
            <CardDescription>
              Document any specific issues or concerns identified during the assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-muted/40 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <FormLabel className="text-sm">Location</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={issueDraft.rowNumber}
                        onValueChange={(value) => setIssueDraft((d: IssueDraft) => ({
                          ...d,
                          rowNumber: value,
                          holeNumber: "",
                          plantId: "",
                          suckerId: ""
                        }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Row" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRows.map((rowNum: any) => (
                            <SelectItem key={rowNum} value={rowNum.toString()}>
                              Row {rowNum}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={issueDraft.holeNumber}
                        onValueChange={(value) => setIssueDraft((d: IssueDraft) => ({
                          ...d,
                          holeNumber: value,
                          plantId: "",
                          suckerId: ""
                        }))}
                        disabled={!issueDraft.rowNumber}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Hole" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHoles.map((holeNum: any) => (
                            <SelectItem key={holeNum} value={holeNum.toString()}>
                              Hole {holeNum}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-sm">Plant References</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={issueDraft.plantId}
                        onValueChange={(value) => setIssueDraft((d: IssueDraft) => ({
                          ...d,
                          plantId: value,
                          suckerId: ""
                        }))}
                        disabled={!issueDraft.holeNumber || availablePlants.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Plant" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlants.map((plantId: any) => (
                            <SelectItem key={plantId} value={plantId.toString()}>
                              Plant {plantId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={issueDraft.suckerId}
                        onValueChange={(value) => setIssueDraft((d: IssueDraft) => ({ ...d, suckerId: value }))}
                        disabled={!issueDraft.holeNumber || availableSuckers.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sucker" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSuckers.map((suckerId: any) => (
                            <SelectItem key={suckerId} value={suckerId.toString()}>
                              Sucker {suckerId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-sm">Issue Type</FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      <Select
                        value={issueDraft.issueType}
                        onValueChange={(value) => setIssueDraft((d: IssueDraft) => ({ ...d, issueType: value }))}
                      >
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm">Description</FormLabel>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    value={issueDraft.description}
                    onChange={(e) => setIssueDraft((d: IssueDraft) => ({ ...d, description: e.target.value }))}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAddIssue}
                  disabled={!(issueDraft.rowNumber && issueDraft.holeNumber && issueDraft.issueType && issueDraft.description)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
        </div>

              {issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Documented Issues ({issues.length})</h4>
                  <ScrollArea className="h-[200px] rounded-md border">
                    <div className="p-4 space-y-2">
                      {issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 p-3 bg-muted/40 rounded-md">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                Row {issue.rowNumber}, Hole {issue.holeNumber}
                              </Badge>
                              {issue.plantId && (
                                <Badge variant="secondary" className="font-normal">
                                  Plant {issue.plantId}
                                </Badge>
                              )}
                              {issue.suckerId && (
                                <Badge variant="secondary" className="font-normal">
                                  Sucker {issue.suckerId}
                                </Badge>
                              )}
                              <Badge className="font-normal">
                                {issue.issueType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveIssue(idx)}
                            className="h-7 w-7"
                          >
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <InfoIcon className="h-5 w-5 mr-2 text-primary" />
              Additional Notes
            </CardTitle>
            <CardDescription>
              Add any additional notes or observations about this assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this assessment..."
                      className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
                  <FormDescription>
                    Include any observations or issues that need attention but weren't covered by the parameters above.
                  </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
          </CardContent>
        </Card>

        {/* Error and success messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="default" className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !selectedPlot}
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Health Assessment"}
        </Button>
      </form>
    </Form>
  )
}