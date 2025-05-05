"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { farmFormSchema, type FarmFormValues } from "@/lib/validations/form-schemas"
import { createFarm, updateFarm } from "@/app/actions/farm-actions"

interface FarmFormProps {
  initialData?: Partial<FarmFormValues> & { id?: string }
  onSuccess?: () => void
  users?: any[]
}

export function FarmForm({ initialData, onSuccess, users = [] }: FarmFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdFarmId, setCreatedFarmId] = useState<string | null>(null)
  const router = useRouter()
  const isEditing = !!initialData?.id

  // Set default values from initialData or use empty values
  const defaultValues: Partial<FarmFormValues> = {
    name: initialData?.name || "",
    location: initialData?.location || "",
    area: initialData?.area || undefined,
    dateEstablished: initialData?.dateEstablished ? new Date(initialData.dateEstablished) : new Date(),
    teamLeaderId: initialData?.teamLeaderId || "",
    healthStatus: initialData?.healthStatus || "Average",
    description: initialData?.description || "",
    group_code: initialData?.group_code || "",
  }

  const form = useForm<FarmFormValues>({
    resolver: zodResolver(farmFormSchema),
    defaultValues,
  })

  // Compute region code preview from location
  const regionCode = useMemo(() => {
    const loc = form.watch("location")
    return loc && loc.length >= 3 ? loc.substring(0, 3).toUpperCase() : "---"
  }, [form.watch("location")])

  async function onSubmit(values: FarmFormValues) {
    setIsSubmitting(true)
    try {
      const result = isEditing && initialData?.id ? await updateFarm(initialData.id, values) : await createFarm(values)

      if (result.success) {
        setSuccess(true)
        setCreatedFarmId(result.farm?.id ?? null)
        toast({
          title: isEditing ? "Farm updated" : "Farm created",
          description: result.message,
          action: result.farm?.id ? (
            <Link href={`/farms/${result.farm.id}/plots/new`} className="ml-2 underline text-primary">
              Add Plot
            </Link>
          ) : undefined,
        })
        // No auto-navigation
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

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-green-100 border border-green-300 rounded-lg p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">{isEditing ? "Farm updated!" : "Farm created!"}</h2>
          <p className="mb-4">{isEditing ? "The farm details have been updated successfully." : "Your new farm has been created successfully."}</p>
          {createdFarmId && (
            <Link href={`/farms/${createdFarmId}/plots/new`} className="inline-block mb-2 text-primary underline">
              Add Plot to this Farm
            </Link>
          )}
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={() => router.push("/farms")}>Go to Farms</Button>
            <Button variant="outline" onClick={() => setSuccess(false)}>Create Another</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter farm name" {...field} />
              </FormControl>
              <FormDescription>The name of your banana plantation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter farm location" {...field} />
              </FormControl>
              <FormDescription>The physical location of your farm</FormDescription>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Region Code Preview:</span> {regionCode}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamLeaderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Leader</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={users.length === 0 ? "No users available" : "Select a team leader"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.length === 0 ? (
                    <SelectItem value="" disabled>
                      No users available
                    </SelectItem>
                  ) : (
                    users
                      .filter((user) => typeof user.id === "string" && user.id.trim() !== "" && user.name)
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>The team leader responsible for this farm</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area (acres)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter farm area"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>The total area of your farm in acres</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateEstablished"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Established</FormLabel>
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
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The date when the farm was established</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="healthStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The overall health status of the farm</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter farm description" className="resize-none min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Additional details about your farm</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="group_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter group code (max 8 chars)" maxLength={8} {...field} />
              </FormControl>
              <FormDescription>Short code for the farm group (required, max 8 characters)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Farm" : "Create Farm"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
