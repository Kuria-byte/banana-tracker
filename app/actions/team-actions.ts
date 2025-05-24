"use server"

import { revalidatePath } from "next/cache"
import { teamMembers } from "@/lib/mock-data/team"
import type { TeamMember, TeamMemberFormData } from "@/lib/types/team"
import { getAllUsers as dbGetAllUsers, getUserByEmail as dbGetUserByEmail, createUser as dbCreateUser, createTeamMember } from "@/db/repositories/user-repository"
import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"

// Helper to map DB user to TeamMember
function dbUserToTeamMember(dbUser: any): TeamMember {
  return {
    id: dbUser.id?.toString() ?? "",
    name: dbUser.name ?? "",
    role: dbUser.status ?? dbUser.role ?? "", // Use status as role for UI
    avatar: dbUser.avatar ?? "",
    status: dbUser.status ?? "",
    email: dbUser.email ?? "",
    phone: dbUser.phone ?? "",
    salary: dbUser.salary ?? 0,
    startDate: dbUser.startDate ? new Date(dbUser.startDate).toISOString().split("T")[0] : "",
    location: dbUser.location ?? "",
    responsibilities: Array.isArray(dbUser.responsibilities) ? dbUser.responsibilities : [],
    skills: Array.isArray(dbUser.skills) ? dbUser.skills : [],
  }
}

// Get all team members (from DB, excluding ADMINs)
export async function getTeamMembers(): Promise<TeamMember[]> {
  const dbUsers = await dbGetAllUsers()
  return dbUsers
    .filter((u: any) => (u.role ?? u.status ?? "").toUpperCase() !== "ADMIN")
    .map(dbUserToTeamMember)
}

// Get a team member by ID (from DB)
export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  const dbUsers = await dbGetAllUsers()
  const user = dbUsers.find((u: any) => u.id?.toString() === id)
  return user ? dbUserToTeamMember(user) : undefined
}

// Add a new team member (insert into DB)
export async function addTeamMember(data: TeamMemberFormData) {
  const created = await createTeamMember({
    email: data.email,
    name: data.name,
    avatar: "",
    phone: data.phone,
    status: data.role, // UI role
    salary: data.salary,
    startDate: data.startDate,
    location: data.location,
    responsibilities: data.responsibilities,
    skills: data.skills,
  });
  revalidatePath("/team");
  return { success: true, member: dbUserToTeamMember(created) };
}

// Update an existing team member (update in DB)
export async function updateTeamMember(id: string, data: TeamMemberFormData) {
  const [updated] = await db
    .update(users)
    .set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.role, // Store UI role in status
      role: "MANAGER", // Only 'MANAGER' or 'ADMIN' allowed
      salary: data.salary,
      startDate: data.startDate ? new Date(data.startDate) : null,
      location: data.location ?? null,
      responsibilities: data.responsibilities ?? [],
      skills: data.skills ?? [],
      updatedAt: new Date(),
    })
    .where(eq(users.id, Number(id)))
    .returning()
  revalidatePath("/team")
  if (updated) {
    return { success: true, member: dbUserToTeamMember(updated) }
  }
  return { success: false, error: "Team member not found" }
}

// Delete a team member
export async function deleteTeamMember(id: string) {
  // In a real app, this would be a database operation
  const index = teamMembers.findIndex((member) => member.id === id)

  if (index !== -1) {
    // Remove the team member
    teamMembers.splice(index, 1)

    // Revalidate the team page
    revalidatePath("/team")

    return { success: true }
  }

  return { success: false, error: "Team member not found" }
}

// Get all users from the database (for assignment, etc.)
export async function getAllUsers() {
  return dbGetAllUsers()
}

// Get user by email from the database
export async function getUserByEmail(email: string) {
  return dbGetUserByEmail(email)
}
