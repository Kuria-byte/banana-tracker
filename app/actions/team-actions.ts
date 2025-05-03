"use server"

import { revalidatePath } from "next/cache"
import { teamMembers } from "@/lib/mock-data/team"
import type { TeamMember, TeamMemberFormData } from "@/lib/types/team"

// Get all team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  // In a real app, this would fetch from a database
  return teamMembers
}

// Get a team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  // In a real app, this would fetch from a database
  return teamMembers.find((member) => member.id === id)
}

// Add a new team member
export async function addTeamMember(data: TeamMemberFormData) {
  // In a real app, this would be a database operation
  const newMember: TeamMember = {
    id: `user${teamMembers.length + 1}`,
    ...data,
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Online",
  }

  // Simulate adding to database
  teamMembers.push(newMember)

  // Revalidate the team page
  revalidatePath("/team")

  return { success: true, member: newMember }
}

// Update an existing team member
export async function updateTeamMember(id: string, data: TeamMemberFormData) {
  // In a real app, this would be a database operation
  const index = teamMembers.findIndex((member) => member.id === id)

  if (index !== -1) {
    // Update the team member
    teamMembers[index] = {
      ...teamMembers[index],
      ...data,
    }

    // Revalidate the team page
    revalidatePath("/team")

    return { success: true, member: teamMembers[index] }
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
