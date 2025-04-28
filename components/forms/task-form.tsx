"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { taskFormSchema, type TaskFormValues } from "@/lib/validations/form-schemas"
import { createTask } from "@/app/actions/task-actions"
import { farms, users, getPlotsByFarmId, getRowsByPlotId } from "@/lib/mock-data"

interface TaskFormProps {
  initialData?: Partial<TaskFormValues> & { id?: string }
  farmId?: string
  onSuccess?: () => void
}

export function TaskForm({ initialData, farmId, onSuccess }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availablePlots, setAvailablePlots] = useState<{ id: string; name: string }[]>([])
  const [availableRows, setAvailableRows] = useState<{ id: string; rowNumber: number }[]>([])
  const router = useRouter()

  // Set default values from initialData or use empty values
  const defaultValues: Partial<TaskFormValues> = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    assignedToId: initialData?.assignedToId || "",
    farmId: farmId || initialData?.farmId || "",
    plotId: initialData?.plotId || "",
    rowId: initialData?.rowId || "",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
    priority: initialData?.priority || "Medium",
    type: initialData?.type || "Maintenance",
  }

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  // Watch for changes to farmId and plotId to update available plots and rows
  const watchFarmId = form.watch("farmId")
  const watchPlotId = form.watch("plotId")

  // Update available plots when farmId changes
  useEffect(() => {
    if (watchFarmId) {
      const plots = getPlotsByFarmId(watchFarmId)
      setAvailablePlots(plots.map((plot) => ({ id: plot.id, name: plot.name })))

      // Clear plotId and rowId if farmId changes
      if (watchFarmId !== initialData?.farmId) {
        form.setValue("plotId", "")
        form.setValue("rowId", "")
        setAvailableRows([])
      }
    } else {
      setAvailablePlots([])
      setAvailableRows([])
    }
  }, [watchFarmId, form, initialData?.farmId])

  // Update available rows when plotId changes
  useEffect(() => {
    if (watchPlotId) {
      const rows = getRowsByPlotId(watchPlotId)
      setAvailableRows(rows.map((row) => ({ id: row.id, rowNumber: row.rowNumber })))

      // Clear rowId if plotId changes
      if (watchPlotId !== initialData?.plotId) {
        form.setValue("rowId", "")
      }
    } else {
      setAvailableRows([])
    }
  }, [watchPlotId, form, initialData?.plotId])

  async function onSubmit(values: TaskFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createTask(values)

      if (result.success) {
        toast({
          title: "Task created",
          description: "Your new task has been created successfully.",
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/tasks")
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormDescription>A clear and concise title for the task</FormDescription>
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
                <Textarea
                  placeholder="Enter detailed task description"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Detailed instructions for completing the task</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a person" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The person responsible for this task</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The date when the task should be completed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The priority level of this task</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Planting">Planting</SelectItem>
                    <SelectItem value="Harvesting">Harvesting</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Input Application">Input Application</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The type of task to be performed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="farmId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!farmId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farm" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The farm where this task will be performed</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchFarmId && (
          <FormField
            control={form.control}
            name="plotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plot (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availablePlots.map((plot) => (
                      <SelectItem key={plot.id} value={plot.id}>
                        {plot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The specific plot for this task (if applicable)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchPlotId && (
          <FormField
            control={form.control}
            name="rowId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Row (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a row" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableRows.map((row) => (
                      <SelectItem key={row.id} value={row.id}>
                        Row {row.rowNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The specific row for this task (if applicable)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Task
          </Button>
        </div>
      </form>
    </Form>
  )
}
