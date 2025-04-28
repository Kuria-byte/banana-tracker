import type { ReactNode } from "react"

interface KnowledgeSectionProps {
  id: string
  title: string
  children: ReactNode
}

export function KnowledgeSection({ id, title, children }: KnowledgeSectionProps) {
  return (
    <section id={id} className="py-8 scroll-mt-16">
      <h2 className="text-2xl font-bold mb-6 text-green-800 border-b pb-2 border-green-200">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  )
}
