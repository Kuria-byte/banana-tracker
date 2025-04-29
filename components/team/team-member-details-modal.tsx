"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Mail, MapPin, Phone } from "lucide-react"

interface ExtendedUser {
  id: string
  name: string
  role: string
  avatar: string
  status: string
  contactInfo: {
    email: string
    phone: string
  }
}

interface TeamMemberDetailsModalProps {
  user: ExtendedUser
}

export function TeamMemberDetailsModal({ user }: TeamMemberDetailsModalProps) {
  const [open, setOpen] = useState(false)

  // Generate initials from name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  // Mock data for additional details
  const additionalDetails = {
    location: "Karii Farm, Eastern Region",
    joinDate: "January 15, 2024",
    responsibilities: [
      "Daily plantation inspection",
      "Supervising irrigation activities",
      "Coordinating harvest operations",
      "Training new team members",
      "Reporting to farm management",
    ],
    skills: ["Crop Management", "Team Leadership", "Pest Identification", "Irrigation Systems"],
    recentActivity: [
      { date: "April 25, 2025", activity: "Completed East Farm inspection" },
      { date: "April 24, 2025", activity: "Updated harvest schedule for Plot B" },
      { date: "April 22, 2025", activity: "Reported pest issue in South Farm" },
      { date: "April 20, 2025", activity: "Trained 2 new field workers" },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Member Details</DialogTitle>
          <DialogDescription>Comprehensive information about this team member</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 py-4">
          <div className="md:w-1/3 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.role}</p>
            <Badge variant="outline" className="mt-2">
              {user.status}
            </Badge>

            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{user.contactInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{additionalDetails.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined: {additionalDetails.joinDate}</span>
              </div>
            </div>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue="responsibilities">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="responsibilities" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                    <CardDescription>Main duties and areas of responsibility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {additionalDetails.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                    <CardDescription>Areas of knowledge and competence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {additionalDetails.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions and contributions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {additionalDetails.recentActivity.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary" />
                          <div>
                            <p className="text-sm font-medium">{item.activity}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
