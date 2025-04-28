import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Knowledge Base | Banana Tracker",
  description: "Comprehensive guide to plantain cultivation, management, and best practices",
}

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
