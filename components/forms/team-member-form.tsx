"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { TeamMember } from "@/lib/types/team"

const teamMemberFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.string().min(1, {
    message: "Please select a role.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  salary: z.coerce.number().min(1, {
    message: "Salary must be greater than 0.",
  }),
  startDate: z.string().min(1, {
    message: "Please enter a start date.",
  }),
  location: z.string().optional(),
  responsibilities: z.string().transform((val) => val.split("\n").filter(Boolean)),
  skills: z.string().transform((val) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  ),
})

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>

interface TeamMemberFormProps {
  teamMember?: TeamMember
  onSubmit: (data: TeamMemberFormValues) => void
  isSubmitting?: boolean
}

export function TeamMemberForm({ teamMember, onSubmit, isSubmitting = false }: TeamMemberFormProps) {
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: teamMember?.name || "",
      role: teamMember?.role || "",
      email: teamMember?.email || "",
      phone: teamMember?.phone || "",
      salary: teamMember?.salary || 0,
      startDate: teamMember?.startDate || new Date().toISOString().split("T")[0],
      location: teamMember?.location || "",
      responsibilities: teamMember?.responsibilities ? teamMember.responsibilities.join("\n") : "",
      skills: teamMember?.skills ? teamMember.skills.join(", ") : "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter team member name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Farm Manager">Farm Manager</SelectItem>
                    <SelectItem value="Farm Consultant">Farm Consultant</SelectItem>
                    <SelectItem value="Team Leader">Team Leader</SelectItem>
                    <SelectItem value="Farm Worker">Farm Worker</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary (KES)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter salary amount"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>Monthly salary in Kenyan Shillings</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter work location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsibilities</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter responsibilities (one per line)" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Enter each responsibility on a new line</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter skills (comma separated)" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormDescription>Enter skills separated by commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : teamMember ? "Update Team Member" : "Add Team Member"}
        </Button>
      </form>
    </Form>
  )
}
