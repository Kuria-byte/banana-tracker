"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { knowledgeData } from "@/lib/knowledge-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import KnowledgeCard from "./knowledge-card"

export default function KnowledgeContent() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  return (
    <div className="space-y-10 pb-16">
      {knowledgeData.map((category) => (
        <section key={category.id} className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight" id={category.id}>
            {category.title}
          </h2>

          <div className="space-y-6">
            {category.sections.map((section) => (
              <Card key={section.id} id={section.id} className="overflow-hidden">
                <div
                  className="flex items-center justify-between p-6 cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  <Button variant="ghost" size="sm">
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedSections.includes(section.id) && (
                  <>
                    <Separator />
                    <CardContent className="p-6 pt-4">
                      <div className="prose max-w-none dark:prose-invert">
                        {section.content.map((item, index) => {
                          if (typeof item === "string") {
                            return <p key={index}>{item}</p>
                          } else if (item.type === "image") {
                            return (
                              <div key={index} className="my-4">
                                <img
                                  src={item.src || "/placeholder.svg"}
                                  alt={item.alt}
                                  className="rounded-md mx-auto"
                                />
                                {item.caption && (
                                  <p className="text-sm text-center text-muted-foreground mt-2">{item.caption}</p>
                                )}
                              </div>
                            )
                          } else if (item.type === "list") {
                            return (
                              <ul key={index} className="list-disc pl-6 space-y-2">
                                {item.items.map((listItem, i) => (
                                  <li key={i}>{listItem}</li>
                                ))}
                              </ul>
                            )
                          } else if (item.type === "card") {
                            return <KnowledgeCard key={index} {...item} />
                          }
                          return null
                        })}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
