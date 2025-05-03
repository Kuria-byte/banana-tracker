export interface Buyer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  preferredProducts: string[]
  notes?: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt?: string
  totalPurchases: number
}

export interface BuyerFormData {
  name: string
  company: string
  email: string
  phone: string
  address: string
  preferredProducts: string[]
  notes?: string
  status?: "active" | "inactive"
}
