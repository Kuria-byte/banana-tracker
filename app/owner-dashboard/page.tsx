import { OwnerDashboard } from "@/components/owner-dashboard/owner-dashboard"
import { getExpenseSummary } from "@/app/actions/owner-dashboard-actions"
import { DashboardPeriod } from "@/lib/types/owner-dashboard"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Owner Dashboard | Banana Tracker",
  description: "Monitor your farm's performance, sales, and expenses at a glance.",
}

const defaultExpenseSummary = {
  totalExpenses: 0,
  expenseCount: 0,
  budgetTotal: 0,
  budgetRemaining: 0,
  budgetUtilizationPercentage: 0,
  comparisonWithPreviousPeriod: 0,
  topCategories: [],
  previousExpenses: 0,
  percentageBudget: 0,
  recentExpenses: [],
};

interface OwnerDashboardPageProps {
  searchParams?: { period?: DashboardPeriod }
}

export default async function OwnerDashboardPage({ searchParams }: OwnerDashboardPageProps) {
  const period = (searchParams?.period as DashboardPeriod) || "month"
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <OwnerDashboard
        period={period}
      />
    </div>
  )
}
