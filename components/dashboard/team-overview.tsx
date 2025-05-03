"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/mock-data"

export function TeamOverview({ users }: { users: User[] }) {
  // Get the first 5 team members
  const teamMembers = users.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Overview of your team and their activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => {
            // Get initials from name
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)

            return (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs">Active</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/team"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            View all team members
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
