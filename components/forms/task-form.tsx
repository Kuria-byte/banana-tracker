"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useUser } from "@stackframe/stack"

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
import { getAllUsers, getUserByEmail } from "@/app/actions/team-actions"
import { getAllFarms } from "@/app/actions/farm-actions"
import { getPlotsByFarmId } from "@/app/actions/plot-actions"

interface TaskFormProps {
  initialData?: Partial<TaskFormValues> & { id?: string }
  farmId?: string
  onSuccess?: () => void
}

export function TaskForm({ initialData, farmId, onSuccess }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [farms, setFarms] = useState<any[]>([])
  const [availablePlots, setAvailablePlots] = useState<{ id: string; name: string }[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingFarms, setLoadingFarms] = useState(true)
  const [loadingPlots, setLoadingPlots] = useState(false)
  const [errorUsers, setErrorUsers] = useState<string | null>(null)
  const [errorFarms, setErrorFarms] = useState<string | null>(null)
  const [errorPlots, setErrorPlots] = useState<string | null>(null)
  const router = useRouter()
  const user = useUser();
  const [dbUser, setDbUser] = useState<any>(null)
  const [userLookupError, setUserLookupError] = useState<string | null>(null)
  const [userLookupLoading, setUserLookupLoading] = useState(false)

  // Set default values from initialData or use empty values
  const defaultValues: Partial<TaskFormValues> = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    assignedToId: initialData?.assignedToId || "",
    farmId: farmId || initialData?.farmId || "",
    plotId: initialData?.plotId || "",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
    priority: initialData?.priority || "Medium",
    type: initialData?.type || "Maintenance",
  }

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  // Look up current user in DB when component mounts
  useEffect(() => {
    const lookupUser = async () => {
      if (user?.primaryEmail) {
        setUserLookupLoading(true)
        try {
          const dbUserResult = await getUserByEmail(user.primaryEmail)
          if (dbUserResult && dbUserResult.id) {
            setDbUser(dbUserResult)
            console.log("Found user in database:", dbUserResult)
          } else {
            setUserLookupError("Could not find your user record in the database.")
            console.error("User not found in database for email:", user.primaryEmail)
          }
        } catch (error) {
          console.error("Error looking up user:", error)
          setUserLookupError("Error looking up user in database.")
        } finally {
          setUserLookupLoading(false)
        }
      }
    }
    
    lookupUser()
  }, [user?.primaryEmail])

  // Fetch users and farms on mount
  useEffect(() => {
    setLoadingUsers(true)
    getAllUsers()
      .then((data) => {
        setUsers(data)
        console.log("Loaded users:", data)
      })
      .catch((error) => {
        console.error("Failed to load users:", error)
        setErrorUsers("Failed to load users")
      })
      .finally(() => setLoadingUsers(false))
    
    setLoadingFarms(true)
    getAllFarms()
      .then((res) => {
        setFarms(res.farms || [])
        console.log("Loaded farms:", res.farms)
      })
      .catch((error) => {
        console.error("Failed to load farms:", error)
        setErrorFarms("Failed to load farms")
      })
      .finally(() => setLoadingFarms(false))
  }, [])

  // Watch for changes to farmId and plotId to update available plots
  const watchFarmId = form.watch("farmId")
  const watchPlotId = form.watch("plotId")

  // Update available plots when farmId changes
  useEffect(() => {
    if (watchFarmId) {
      setLoadingPlots(true)
      getPlotsByFarmId(Number(watchFarmId))
        .then((res) => {
          const plots = (res.plots || []).map((plot: any) => ({ 
            id: String(plot.id), 
            name: plot.name 
          }))
          setAvailablePlots(plots)
          console.log("Loaded plots for farm", watchFarmId, ":", plots)
        })
        .catch((error) => {
          console.error("Failed to load plots:", error)
          setErrorPlots("Failed to load plots")
        })
        .finally(() => setLoadingPlots(false))
      
      // Clear plotId if farmId changes
      if (watchFarmId !== initialData?.farmId) {
        form.setValue("plotId", "")
      }
    } else {
      setAvailablePlots([])
    }
  }, [watchFarmId, form, initialData?.farmId])

  async function onSubmit(values: TaskFormValues) {
    setIsSubmitting(true)
    
    try {
      // Check if we have the current user from the database
      if (!dbUser || !dbUser.id) {
        // If we don't have the user yet, try to look it up again
        if (user?.primaryEmail) {
          setUserLookupLoading(true)
          const dbUserResult = await getUserByEmail(user.primaryEmail)
          setUserLookupLoading(false)
          
          if (!dbUserResult || !dbUserResult.id) {
            setUserLookupError("Could not find your user record in the database. Task not created.")
            console.error("User not found in database for email:", user.primaryEmail)
            setIsSubmitting(false)
            return
          }
          
          setDbUser(dbUserResult)
        } else {
          setUserLookupError("No user email found. Task not created.")
          setIsSubmitting(false)
          return
        }
      }
      
      // Prepare the task data with creator ID
      const creatorId = dbUser.id.toString()
      console.log("Creating task with creator ID:", creatorId)
      
      // Clean up the plotId if it's "NONE"
      if (values.plotId === "NONE") {
        values.plotId = ""
      }
      
      // Call the server action to create the task
      const result = await createTask({ 
        ...values, 
        creatorId 
      })

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
      console.error("Error submitting task:", error)
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingUsers || !!errorUsers}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUsers ? "Loading..." : errorUsers ? errorUsers : "Select a person"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingUsers ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading users...</span>
                      </div>
                    ) : errorUsers ? (
                      <div className="p-2 text-destructive">{errorUsers}</div>
                    ) : users.length === 0 ? (
                      <div className="p-2 text-muted-foreground">No users found</div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} {user.role ? `(${user.role})` : ''}
                        </SelectItem>
                      ))
                    )}
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!farmId || loadingFarms || !!errorFarms}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingFarms ? "Loading..." : errorFarms ? errorFarms : "Select a farm"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingFarms ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading farms...</span>
                    </div>
                  ) : errorFarms ? (
                    <div className="p-2 text-destructive">{errorFarms}</div>
                  ) : farms.length === 0 ? (
                    <div className="p-2 text-muted-foreground">No farms found</div>
                  ) : (
                    farms.map((farm) => (
                      <SelectItem key={farm.id} value={String(farm.id)}>
                        {farm.name}
                      </SelectItem>
                    ))
                  )}
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingPlots || !!errorPlots}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPlots ? "Loading..." : errorPlots ? errorPlots : "Select a plot"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingPlots ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading plots...</span>
                      </div>
                    ) : errorPlots ? (
                      <div className="p-2 text-destructive">{errorPlots}</div>
                    ) : availablePlots.length === 0 ? (
                      <div className="p-2 text-muted-foreground">No plots found</div>
                    ) : (
                      <>
                        <SelectItem value="NONE">None</SelectItem>
                        {availablePlots.map((plot) => (
                          <SelectItem key={plot.id} value={plot.id}>
                            {plot.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>The specific plot for this task (if applicable)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {userLookupError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">User Lookup Error</p>
            <p className="text-sm mt-1">{userLookupError}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || loadingUsers || loadingFarms || (watchFarmId && loadingPlots) || userLookupLoading || !!userLookupError}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : initialData?.id ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 p-3 bg-gray-100 text-xs rounded">
          <details>
            <summary className="cursor-pointer font-semibold">Debug Information</summary>
            <div className="mt-2">
              <p>Form State: {form.formState.isDirty ? "Dirty" : "Pristine"}</p>
              <p>Submission State: {isSubmitting ? "Submitting" : "Idle"}</p>
              <p>Validation Errors: {Object.keys(form.formState.errors).length}</p>
              <p>User Lookup: {userLookupLoading ? "Loading" : dbUser ? "Found" : "Not Found"}</p>
              <pre className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto">
                <strong>Form Values:</strong>\n{JSON.stringify(form.getValues(), null, 2)}
              </pre>
              <pre className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto">
                <strong>Stack User:</strong>\n{JSON.stringify(user, null, 2)}
              </pre>
              <pre className="mt-2 bg-white p-2 rounded border text-xs overflow-x-auto">
                <strong>DB User:</strong>\n{JSON.stringify(dbUser, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </Form>
  )
}