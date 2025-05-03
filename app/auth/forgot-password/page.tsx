"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth/auth-layout"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just simulate a successful response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      setIsLoading(false)
    } catch (error) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      {success ? (
        <div className="space-y-4">
          <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              If an account exists with that email, we've sent password reset instructions to your inbox.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending instructions..." : "Send reset instructions"}
            </Button>

            <div className="mt-6 text-center text-sm">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </Form>
      )}
    </AuthLayout>
  )
}
