import { BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function KnowledgeLinkCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-green-50 dark:bg-green-900/20">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
          Knowledge Hub
        </CardTitle>
        <CardDescription>Enhance your farming practices with expert knowledge</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">
          Access comprehensive guides on banana cultivation, disease management, harvesting techniques, and best
          practices from agricultural experts.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 p-4">
        <div className="text-xs text-muted-foreground">Updated weekly</div>
        <Link href="/knowledge">
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Explore Knowledge Base
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
