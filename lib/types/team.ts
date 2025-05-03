export interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  status: string
  email: string
  phone: string
  salary: number
  startDate: string
  location?: string
  responsibilities: string[]
  skills: string[]
}

export interface TeamMemberFormData {
  name: string
  role: string
  email: string
  phone: string
  salary: number
  startDate: string
  location?: string
  responsibilities: string[]
  skills: string[]
}
