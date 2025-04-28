import type { Metadata } from "next"
import KnowledgePageClient from "@/components/knowledge/knowledge-page-client"

export const metadata: Metadata = {
  title: "Plantain Knowledge Base | Banana Tracker",
  description: "Comprehensive knowledge base for plantain cultivation and management",
}

export default function KnowledgePage() {
  return <KnowledgePageClient />
}
