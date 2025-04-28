import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KnowledgeCardProps {
  type: "card"
  title: string
  description?: string
  content: string
  tags?: string[]
  variant?: "default" | "tip" | "warning" | "info"
}

export default function KnowledgeCard({ title, description, content, tags, variant = "default" }: KnowledgeCardProps) {
  const variantStyles = {
    default: "",
    tip: "border-green-500 bg-green-50 dark:bg-green-950/30",
    warning: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  }

  return (
    <Card className={`my-4 ${variantStyles[variant]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p>{content}</p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
