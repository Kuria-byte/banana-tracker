"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { knowledgeData } from "@/lib/knowledge-data"
import { Button } from "@/components/ui/button"

export default function KnowledgeNavigation() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(knowledgeData.map((category) => category.id))

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  return (
    <nav className="sticky top-20 space-y-1 pb-12">
      <h2 className="font-semibold mb-2">Contents</h2>
      <ul className="space-y-1">
        {knowledgeData.map((category) => (
          <li key={category.id} className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start font-medium"
              onClick={() => toggleCategory(category.id)}
            >
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              {category.title}
            </Button>

            {expandedCategories.includes(category.id) && (
              <ul className="ml-6 space-y-1">
                {category.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={cn(
                        "block py-1 px-2 rounded-md hover:bg-accent text-sm",
                        "transition-colors duration-200",
                      )}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
