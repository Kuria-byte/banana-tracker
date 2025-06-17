"use client"

import { useState } from "react"
import { FarmHealthSummary } from "@/components/farms/farm-health-summary"
import { FarmIssuesList } from "@/components/farms/farm-issues-list"
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal"
import { IssueFormModal } from "@/components/modals/issue-form-modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Activity, Plus } from "lucide-react"
import { FarmHealthHistory } from "@/components/farms/farm-health-history"

// Import types
import type { Plot } from "@/lib/types/plot"

interface FarmHealthPageClientProps {
  farm: any
  farmId: number
  plots: Plot[]
}

export default function FarmHealthPageClient({ farm, farmId, plots }: FarmHealthPageClientProps) {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  return (
    <div className="container max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-2 p-2 hover:bg-slate-100 transition-colors">
          <Link href={`/farms/${farmId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Farm Details
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{farm.name}</h1>
            </div>
            <p className="text-muted-foreground">Health Tracking & Assessment Dashboard</p>
          </div>
          <div className="flex flex-row gap-2">
            <FarmHealthScoringModal
              farmId={farmId.toString()}
              trigger={
                <Button className="w-full sm:w-auto shadow-sm transition-all hover:shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              }
            />
            <IssueFormModal
              farmId={farmId.toString()}
              trigger={
                <Button variant="outline" className="w-full sm:w-auto shadow-sm transition-all hover:shadow">
                  <Activity className="mr-2 h-4 w-4" />
                  Record Issue
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="md:col-span-2 lg:col-span-3">
          <FarmHealthSummary
            farmId={farmId.toString()}
            month={period.month}
            year={period.year}
            onPeriodChange={setPeriod}
          />
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <div className="bg-white border rounded-lg p-1">
          <TabsList className="w-full grid grid-cols-3 sm:w-auto sm:inline-grid">
            <TabsTrigger value="history" className="text-sm sm:text-base py-2 px-4">
              Assessment History
            </TabsTrigger>
            <TabsTrigger value="issues" className="text-sm sm:text-base py-2 px-4">
              Issues
            </TabsTrigger>
            <TabsTrigger value="parameters" className="text-sm sm:text-base py-2 px-4">
              Scoring Parameters
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <FarmHealthHistory farmId={farmId.toString()} />
        </TabsContent>

        <TabsContent value="issues" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          {plots.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No plots found for this farm.</div>
          ) : (
            <div className="space-y-8">
              {plots.map(plot => (
                <div key={plot.id} className="border rounded-lg bg-white shadow-sm p-4">
                  <div className="font-semibold text-lg mb-2">{plot.name}</div>
                  <FarmIssuesList plotId={plot.id} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="parameters" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="text-center py-12 border rounded-lg bg-white shadow-sm">
            <div className="max-w-md mx-auto space-y-4 px-4">
              <h3 className="text-lg font-medium">Health Scoring Parameters</h3>
              <p className="text-muted-foreground">
                View and manage the parameters used for calculating farm health scores
              </p>
              <Button asChild className="shadow-sm transition-all hover:shadow">
                <Link href="/settings/scoring">Manage Scoring Parameters</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 