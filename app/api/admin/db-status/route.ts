import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/db/client"

export async function GET() {
  try {
    const connected = await checkDatabaseConnection()

    return NextResponse.json({
      connected,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking database connection:", error)
    return NextResponse.json({
      connected: false,
      error: "Failed to check database connection",
      timestamp: new Date().toISOString(),
    })
  }
}
