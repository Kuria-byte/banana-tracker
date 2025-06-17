import { useParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Activity } from "lucide-react"
import Link from "next/link"
import { getFarmById } from "@/db/repositories/farm-repository"
import { FarmHealthSummary } from "@/components/farms/farm-health-summary"
import { FarmHealthHistory } from "@/components/farms/farm-health-history"
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal"
import { IssueFormModal } from "@/components/modals/issue-form-modal"
import { FarmIssuesList } from "@/components/farms/farm-issues-list"
import { getPlotsByFarmId } from "@/app/actions/plot-actions"
import FarmHealthPageClient from "./FarmHealthPageClient"

export default async function FarmHealthPage({ params }: { params: { id: string } }) {
  const farmId = Number(params.id)
  const farm = await getFarmById(farmId)
  if (!farm) {
    notFound()
  }
  const plotsResult = await getPlotsByFarmId(farmId)
  const plots = plotsResult.success ? plotsResult.plots : []
  return <FarmHealthPageClient farm={farm} farmId={farmId} plots={plots} />
}