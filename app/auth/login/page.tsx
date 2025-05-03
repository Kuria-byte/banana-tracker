"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertCircle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth/auth-context"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDevHint, setShowDevHint] = useState(false)
  const { login } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Function to fill in mock credentials
  const fillMockCredentials = () => {
    form.setValue("email", "jane@example.com")
    form.setValue("password", "Qwerty123")
    setShowDevHint(false)
  }

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const success = await login(data.email, data.password)

      if (success) {
        window.location.href = callbackUrl
      } else {
        setError("Invalid email or password")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Development mode hint */}
            <Alert className="cursor-pointer" onClick={() => setShowDevHint(!showDevHint)}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Development mode active.{" "}
                {showDevHint ? (
                  <span>
                    Use{" "}
                    <Button variant="link" className="h-auto p-0" onClick={fillMockCredentials}>
                      mock credentials
                    </Button>
                  </span>
                ) : (
                  <span>Click for more info.</span>
                )}
              </AlertDescription>
            </Alert>

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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/auth/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
