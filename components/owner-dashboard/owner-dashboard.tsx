"use client"

import { useState, useEffect } from "react"
import type { DashboardPeriod, ExpenseRecord, ExpenseSummary as ExpenseSummaryType } from "@/lib/types/owner-dashboard"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SalesSummary } from "@/components/owner-dashboard/sales-summary"
import { ExpenseSummary } from "@/components/owner-dashboard/expense-summary"
import { FarmHealthSummary } from "@/components/owner-dashboard/farm-health-summary"
import { FarmPerformance } from "@/components/owner-dashboard/farm-performance"
import { PeriodSelector } from "@/components/owner-dashboard/period-selector"
import { ProfitMargin } from "@/components/owner-dashboard/profit-margin"
import { SalesFormModal } from "@/components/modals/sales-form-modal"
import { ExpenseFormModal } from "@/components/modals/expense-form-modal"
import { BudgetFormModal } from "@/components/modals/budget-form-modal"
import { ReportModal } from "@/components/modals/report-modal"
import { FileText } from "lucide-react"
import { getAllExpenseRecords } from "@/app/actions/owner-dashboard-actions"
import { useRouter, useSearchParams } from "next/navigation"

interface OwnerDashboardProps {
  period: DashboardPeriod
}

export function OwnerDashboard({ period }: OwnerDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handler for period change: update URL search param
  function handlePeriodChange(newPeriod: DashboardPeriod) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("period", newPeriod);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
       
        <div className="flex gap-2">
        
          {/* Other action buttons can go here */}
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground">Monitor your farm's financial performance and health</p>
        </div>
        <div className="flex flex-wrap gap-2">
         
          {/* <BudgetFormModal /> */}
          {/* <ReportModal /> */}
          <Button variant="outline" asChild>
            <Link href="/owner-dashboard/financial-records">
              <FileText className="mr-2 h-4 w-4" />
              View All Records
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/owner-dashboard/buyers">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Manage Buyers
            </Link>
          </Button>
        </div>
      </div>

      <PeriodSelector period={period} onChange={handlePeriodChange} />

      <div className="grid gap-6 md:grid-cols-2">
        <SalesSummary period={period} />
        <ExpenseSummary period={period} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
     
      </div>
    </div>
  )
}
