import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MessageSquare } from "lucide-react"
import { TeamMemberDetailsModal } from "./team-member-details-modal"

interface User {
  id: string
  name: string
  role: string
  avatar: string
  status: string
}

interface TeamMemberCardProps {
  user: User
}

export function TeamMemberCard({ user }: TeamMemberCardProps) {
  // Generate initials from name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  // Determine status badge color
  const statusColor =
    {
      Online: "bg-green-500",
      Busy: "bg-amber-500",
      Away: "bg-gray-500",
      Offline: "bg-red-500",
    }[user.status] || "bg-gray-500"

  // Mock data for contact info
  const contactInfo = {
    email: `${user.name.toLowerCase().replace(/\s/g, ".")}@bananatracker.com`,
    phone: `+254 ${Math.floor(Math.random() * 900000000) + 100000000}`,
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
            <span className="ml-2 text-xs">{user.status}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{contactInfo.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{contactInfo.phone}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>
        <TeamMemberDetailsModal user={{ ...user, contactInfo }} />
      </CardFooter>
    </Card>
  )
}
