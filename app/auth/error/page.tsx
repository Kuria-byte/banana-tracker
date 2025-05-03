"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")

  useEffect(() => {
    const error = searchParams.get("error")

    if (error === "Configuration") {
      setErrorMessage("There is a problem with the server configuration.")
    } else if (error === "AccessDenied") {
      setErrorMessage("You do not have permission to sign in.")
    } else if (error === "Verification") {
      setErrorMessage("The verification link is invalid or has expired.")
    } else if (error === "CredentialsSignin") {
      setErrorMessage("The email or password you entered is incorrect.")
    } else if (error) {
      setErrorMessage(`Authentication error: ${error}`)
    }
  }, [searchParams])

  return (
    <AuthLayout title="Authentication Error" subtitle="There was a problem signing you in">
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Link href="/help" className="font-medium text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
