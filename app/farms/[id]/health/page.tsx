import { useParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { getFarmById } from "@/db/repositories/farm-repository"
import { FarmHealthSummary } from "@/components/farms/farm-health-summary"
import { FarmHealthHistory } from "@/components/farms/farm-health-history"
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal"

export default async function FarmHealthPage({ params }: { params: { id: string } }) {
  const farmId = Number(params.id)
  const farm = await getFarmById(farmId)

  if (!farm) {
    notFound()
  }

  // Get current month and year
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() is 0-based
  const year = now.getFullYear()

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-2 p-2">
          <Link href={`/farms/${farmId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Farm Details
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{farm.name} - Health Tracking</h1>
            <p className="text-muted-foreground">Monitor and assess the health of your farm</p>
          </div>
          <FarmHealthScoringModal
            farmId={farmId.toString()}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <FarmHealthSummary farmId={farmId.toString()} month={month} year={year} />
      </div>

      <Tabs defaultValue="history">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Assessment History</TabsTrigger>
          <TabsTrigger value="parameters">Scoring Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <FarmHealthHistory farmId={farmId.toString()} />
        </TabsContent>

        <TabsContent value="parameters">
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">View and manage the parameters used for health scoring</p>
            <Button asChild>
              <Link href="/settings/scoring">Manage Scoring Parameters</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
