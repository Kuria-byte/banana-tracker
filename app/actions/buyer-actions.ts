"use server"

import { revalidatePath } from "next/cache"
import { buyers as mockBuyers } from "@/lib/mock-data/buyers"
import type { Buyer, BuyerFormData } from "@/lib/types/buyer"
import { getAllBuyers } from "@/db/repositories/user-repository"

// Get all buyers
export async function getBuyers(): Promise<Buyer[]> {
  try {
    return await getAllBuyers()
  } catch (error) {
    console.error("Error fetching buyers from DB:", error)
    return []
  }
}

// Get a buyer by ID
export async function getBuyerById(id: string): Promise<Buyer | undefined> {
  // In a real app, this would fetch from a database
  return mockBuyers.find((buyer) => buyer.id === id)
}

// Add a new buyer
export async function addBuyer(data: BuyerFormData) {
  // In a real app, this would be a database operation
  const newBuyer: Buyer = {
    id: `buyer${mockBuyers.length + 1}`,
    ...data,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalPurchases: 0,
  }

  // Simulate adding to database
  mockBuyers.push(newBuyer)

  // Revalidate the buyers page
  revalidatePath("/owner-dashboard/buyers")

  return { success: true, buyer: newBuyer }
}

// Update an existing buyer
export async function updateBuyer(id: string, data: BuyerFormData) {
  // In a real app, this would be a database operation
  const index = mockBuyers.findIndex((buyer) => buyer.id === id)

  if (index !== -1) {
    // Update the buyer
    mockBuyers[index] = {
      ...mockBuyers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    // Revalidate the buyers page
    revalidatePath("/owner-dashboard/buyers")

    return { success: true, buyer: mockBuyers[index] }
  }

  return { success: false, error: "Buyer not found" }
}

// Delete a buyer
export async function deleteBuyer(id: string) {
  // In a real app, this would be a database operation
  const index = mockBuyers.findIndex((buyer) => buyer.id === id)

  if (index !== -1) {
    // Remove the buyer
    mockBuyers.splice(index, 1)

    // Revalidate the buyers page
    revalidatePath("/owner-dashboard/buyers")

    return { success: true }
  }

  return { success: false, error: "Buyer not found" }
}
