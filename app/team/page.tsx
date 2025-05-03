import { Suspense } from "react"
import { TeamMembersList } from "@/components/team/team-members-list"
import { TeamStatistics } from "@/components/team/team-statistics"
import { getTeamMembers } from "@/app/actions/team-actions"

export const metadata = {
  title: "Team Management | Banana Tracker",
  description: "Manage your team members and view team statistics",
}

export default async function TeamPage() {
  const members = await getTeamMembers()

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground mt-2">Manage your plantation team members and their responsibilities</p>
      </div>

      <Suspense fallback={<div>Loading statistics...</div>}>
        <div className="mb-8">
          <TeamStatistics members={members} />
        </div>
      </Suspense>

      <Suspense fallback={<div>Loading team members...</div>}>
        <TeamMembersList members={members} />
      </Suspense>
    </div>
  )
}
