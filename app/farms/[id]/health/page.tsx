"use client"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { getFarmById } from "@/lib/mock-data"
import { FarmHealthSummary } from "@/components/farms/farm-health-summary"
import { FarmHealthHistory } from "@/components/farms/farm-health-history"
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal"

export default function FarmHealthPage() {
  const params = useParams()
  const farmId = params.id as string
  const farm = getFarmById(farmId)

  if (!farm) {
    return (
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Farm not found</h1>
          <Button asChild>
            <Link href="/farms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Farms
            </Link>
          </Button>
        </div>
      </div>
    )
  }

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
            farmId={farmId}
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
        <FarmHealthSummary farmId={farmId} />
      </div>

      <Tabs defaultValue="history">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Assessment History</TabsTrigger>
          <TabsTrigger value="parameters">Scoring Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <FarmHealthHistory farmId={farmId} />
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
