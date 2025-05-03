import { NextResponse } from "next/server"
import { hash } from "bcryptjs" // Changed from 'bcrypt' to 'bcryptjs'
import { z } from "zod"
import { db } from "@/db/client"
import { users } from "@/db/schema"

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input data", errors: result.error.flatten() }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "Farm Worker", // Default role for new registrations
      })
      .returning()

    // Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = newUser[0]

    return NextResponse.json({ message: "User registered successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 })
  }
}
