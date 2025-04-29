"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { knowledgeData } from "@/lib/knowledge-data"

export default function KnowledgeNavigation() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["basics"])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  return (
    <Card className="sticky top-20">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <div className="space-y-2">
          {knowledgeData.map((category) => (
            <div key={category.id} className="space-y-1">
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
                <div className="ml-6 space-y-1 border-l pl-2">
                  {category.sections.map((section) => (
                    <Button
                      key={section.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start font-normal text-sm"
                      asChild
                    >
                      <a href={`#${section.id}`}>{section.title}</a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
