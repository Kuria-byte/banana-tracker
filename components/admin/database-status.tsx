"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/admin/db-status")
      const data = await response.json()
      setStatus(data.connected ? "connected" : "disconnected")
    } catch (error) {
      console.error("Error checking database status:", error)
      setStatus("disconnected")
    } finally {
      setLastChecked(new Date())
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Database Status
          <Button variant="outline" size="sm" onClick={checkConnection} disabled={isChecking}>
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {status === "loading" ? (
            <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin mr-2" />
          ) : status === "connected" ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span>
            {status === "loading"
              ? "Checking connection..."
              : status === "connected"
                ? "Connected to database"
                : "Disconnected from database"}
          </span>
        </div>
        {lastChecked && (
          <p className="text-sm text-muted-foreground mt-2">Last checked: {lastChecked.toLocaleTimeString()}</p>
        )}
      </CardContent>
    </Card>
  )
}
