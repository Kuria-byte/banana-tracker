"use client"

import { useState } from "react"
import { TeamMemberCard } from "./team-member-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { TeamMemberFormModal } from "../modals/team-member-form-modal"
import type { TeamMember } from "@/lib/types/team"

interface TeamMembersListProps {
  members: TeamMember[]
}

export function TeamMembersList({ members }: TeamMembersListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <TeamMemberFormModal />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <TeamMemberCard key={member.id} user={member} />
          ))}
        </div>
      )}
    </div>
  )
}
