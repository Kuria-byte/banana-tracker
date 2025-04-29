"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { submitKnowledgeContent } from "@/app/actions/knowledge-actions"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  tags: z.string().optional(),
  authorName: z.string().min(2, {
    message: "Author name must be at least 2 characters.",
  }),
  authorEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

interface KnowledgeSubmissionFormProps {
  onCancel: () => void
}

export function KnowledgeSubmissionForm({ onCancel }: KnowledgeSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      tags: "",
      authorName: "",
      authorEmail: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const result = await submitKnowledgeContent(values)

      if (result.success) {
        toast({
          title: "Submission Successful",
          description: "Your knowledge content has been submitted for review.",
        })
        form.reset()
        onCancel()
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "There was an error submitting your content.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Submit Knowledge Content</h2>
          <p className="text-muted-foreground">
            Share your expertise with the community. All submissions will be reviewed before publishing.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
                    </FormControl>
                    <FormDescription>A clear, concise title for your knowledge content</FormDescription>
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
                        <SelectItem value="basics">Plantain Basics</SelectItem>
                        <SelectItem value="cultivation">Plantain Cultivation</SelectItem>
                        <SelectItem value="management">Plantation Management</SelectItem>
                        <SelectItem value="harvest">Harvesting and Post-Harvest</SelectItem>
                        <SelectItem value="economics">Economics and Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the most appropriate category for your content</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your knowledge content here..." className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information, tips, or guidance. You can use simple formatting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. irrigation, disease-prevention, harvesting" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated tags to help categorize your content (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" type="email" {...field} />
                    </FormControl>
                    <FormDescription>We'll contact you if we need more information</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Content"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
