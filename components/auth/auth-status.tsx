"use client"

import { useSession } from "next-auth/react"

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading authentication status...</div>
  }

  if (status === "unauthenticated") {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      Authenticated as {session?.user?.name} ({session?.user?.email})
    </div>
  )
}
