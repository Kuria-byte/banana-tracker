import { OwnerDashboard } from "@/components/owner-dashboard/owner-dashboard"

export const metadata = {
  title: "Owner Dashboard | Banana Tracker",
  description: "Monitor your farm's performance, sales, and expenses at a glance.",
}

export default function OwnerDashboardPage() {
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <OwnerDashboard />
    </div>
  )
}
