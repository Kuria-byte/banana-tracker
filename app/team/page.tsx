import type { Metadata } from "next"
import { users } from "@/lib/mock-data"
import { TeamMembersList } from "@/components/team/team-members-list"

export const metadata: Metadata = {
  title: "Team Members | Banana Tracker",
  description: "View and manage your plantation team members",
}

export default function TeamPage() {
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground mt-2">Manage your plantation team members and their responsibilities</p>
      </div>

      <TeamMembersList users={users} />
    </div>
  )
}
