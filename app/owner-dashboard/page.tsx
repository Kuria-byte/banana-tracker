import { OwnerDashboard } from "@/components/owner-dashboard/owner-dashboard"
import { getExpenseSummary } from "@/app/actions/owner-dashboard-actions"
import { DashboardPeriod } from "@/lib/types/owner-dashboard"
import { redirect } from "next/navigation"
import { stackServerApp } from "@/stack"
import { getUserByEmail } from "@/db/repositories/user-repository"

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
  // Authenticate and check role
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-up");
  }
  const userEmail = user.primaryEmail || "";
  const dbUser = await getUserByEmail(userEmail);
  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/not-authorized');
  }
  const period = (searchParams?.period as DashboardPeriod) || "month"
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <OwnerDashboard
        period={period}
      />
    </div>
  )
}
