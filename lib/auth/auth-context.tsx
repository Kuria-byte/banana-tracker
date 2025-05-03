"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Mock user data
const MOCK_USER = {
  id: "mock-user-1",
  email: "jane@example.com",
  password: "Qwerty123", // In a real app, never store passwords in client-side code
  name: "Jane Doe",
  role: "Owner",
}

type User = {
  id: string
  email: string
  name: string
  role: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("mockAuthUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("mockAuthUser")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      const authenticatedUser = {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        name: MOCK_USER.name,
        role: MOCK_USER.role,
      }

      setUser(authenticatedUser)
      localStorage.setItem("mockAuthUser", JSON.stringify(authenticatedUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("mockAuthUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
