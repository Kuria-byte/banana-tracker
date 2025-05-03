"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Edit, Plus, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { ScoringParameter } from "@/lib/types/farm-health"
import {
  getScoringParameters,
  createScoringParameter,
  updateScoringParameter,
  deleteScoringParameter,
} from "@/app/actions/farm-health-actions"

// Form schema for parameter form
const parameterFormSchema = z.object({
  name: z.string().min(2, {
    message: "Parameter name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  maxPoints: z.coerce.number().int().positive({
    message: "Max points must be a positive integer.",
  }),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
})

type ParameterFormValues = z.infer<typeof parameterFormSchema>

export default function ScoringSettingsPage() {
  const [parameters, setParameters] = useState<ScoringParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentParameter, setCurrentParameter] = useState<ScoringParameter | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Initialize the form
  const form = useForm<ParameterFormValues>({
    resolver: zodResolver(parameterFormSchema),
    defaultValues: {
      name: "",
      description: "",
      maxPoints: 1,
      category: "Maintenance",
      isActive: true,
    },
  })

  // Load parameters
  useEffect(() => {
    async function loadParameters() {
      setLoading(true)
      try {
        const result = await getScoringParameters()
        if (result.success) {
          setParameters(result.data)
        } else {
          setError(result.error || "Failed to load scoring parameters")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadParameters()
  }, [])

  // Handle opening the edit dialog
  const handleEditParameter = (parameter: ScoringParameter) => {
    setCurrentParameter(parameter)
    form.reset({
      name: parameter.name,
      description: parameter.description,
      maxPoints: parameter.maxPoints,
      category: parameter.category || "Maintenance",
      isActive: parameter.isActive,
    })
    setIsEditDialogOpen(true)
  }

  // Handle opening the delete dialog
  const handleDeleteParameter = (parameter: ScoringParameter) => {
    setCurrentParameter(parameter)
    setIsDeleteDialogOpen(true)
  }

  // Handle form submission for adding a parameter
  const handleAddParameter = async (values: ParameterFormValues) => {
    setFormSubmitting(true)
    try {
      const result = await createScoringParameter(values)
      if (result.success) {
        setParameters([...parameters, result.data])
        setIsAddDialogOpen(false)
        form.reset()
      } else {
        setError(result.error || "Failed to create parameter")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle form submission for editing a parameter
  const handleUpdateParameter = async (values: ParameterFormValues) => {
    if (!currentParameter) return

    setFormSubmitting(true)
    try {
      const result = await updateScoringParameter(currentParameter.id, values)
      if (result.success) {
        // Update the parameters list
        setParameters(parameters.map((param) => (param.id === currentParameter.id ? { ...param, ...values } : param)))
        setIsEditDialogOpen(false)
      } else {
        setError(result.error || "Failed to update parameter")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle deleting a parameter
  const handleConfirmDelete = async () => {
    if (!currentParameter) return

    setFormSubmitting(true)
    try {
      const result = await deleteScoringParameter(currentParameter.id)
      if (result.success) {
        // Remove the parameter from the list
        setParameters(parameters.filter((param) => param.id !== currentParameter.id))
        setIsDeleteDialogOpen(false)
      } else {
        setError(result.error || "Failed to delete parameter")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-2 p-2">
          <Link href="/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Farm Health Scoring Parameters</h1>
            <p className="text-muted-foreground">Manage the parameters used to assess farm health</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Parameter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Scoring Parameter</DialogTitle>
                <DialogDescription>Create a new parameter for farm health assessment</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddParameter)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameter Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                              <SelectItem value="Plant Management">Plant Management</SelectItem>
                              <SelectItem value="Health">Health</SelectItem>
                              <SelectItem value="Harvest">Harvest</SelectItem>
                              <SelectItem value="Security">Security</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={formSubmitting}>
                      {formSubmitting ? "Saving..." : "Save Parameter"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scoring Parameters</CardTitle>
          <CardDescription>Parameters used to calculate farm health scores</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading parameters...</p>
            </div>
          ) : parameters.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No parameters defined yet</p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                Add Your First Parameter
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Max Points</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map((parameter) => (
                    <TableRow key={parameter.id}>
                      <TableCell className="font-medium">{parameter.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{parameter.description}</TableCell>
                      <TableCell>{parameter.maxPoints}</TableCell>
                      <TableCell>{parameter.category || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={parameter.isActive ? "default" : "outline"}>
                          {parameter.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditParameter(parameter)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteParameter(parameter)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Parameter Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scoring Parameter</DialogTitle>
            <DialogDescription>Update the details of this scoring parameter</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateParameter)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameter Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Plant Management">Plant Management</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Harvest">Harvest</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Inactive parameters will not be used in scoring</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Parameter Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parameter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this parameter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {currentParameter && (
            <div className="py-4">
              <p className="font-medium">{currentParameter.name}</p>
              <p className="text-sm text-muted-foreground">{currentParameter.description}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={formSubmitting}>
              {formSubmitting ? "Deleting..." : "Delete Parameter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
