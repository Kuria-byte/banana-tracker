"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import KnowledgeSearch from "./knowledge-search"
import KnowledgeNavigation from "./knowledge-navigation"
import KnowledgeContent from "./knowledge-content"
import { KnowledgeSubmissionForm } from "./knowledge-submission-form"

export default function KnowledgePageClient() {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Comprehensive guide to plantain cultivation and management</p>
        </div>
        <Button onClick={() => setShowSubmissionForm(!showSubmissionForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showSubmissionForm ? "Cancel Submission" : "Submit Knowledge"}
        </Button>
      </div>

      {showSubmissionForm ? (
        <KnowledgeSubmissionForm onCancel={() => setShowSubmissionForm(false)} />
      ) : (
        <>
          <div className="mb-8">
            <KnowledgeSearch />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <KnowledgeNavigation />
            </div>
            <div className="lg:w-3/4">
              <KnowledgeContent />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
