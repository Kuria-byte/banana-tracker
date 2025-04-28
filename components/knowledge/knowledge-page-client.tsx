"use client"

import { Suspense } from "react"
import { Separator } from "@/components/ui/separator"
import KnowledgeContent from "@/components/knowledge/knowledge-content"
import KnowledgeNavigation from "@/components/knowledge/knowledge-navigation"
import KnowledgeSearch from "@/components/knowledge/knowledge-search"

export default function KnowledgePageClient() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plantain Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive guide to plantain cultivation, management, and best practices
          </p>
        </div>

        <Suspense fallback={<div>Loading search...</div>}>
          <KnowledgeSearch />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <KnowledgeNavigation />
          </aside>

          <Separator orientation="vertical" className="hidden md:block" />

          <main className="md:col-span-3">
            <KnowledgeContent />
          </main>
        </div>
      </div>
    </div>
  )
}
