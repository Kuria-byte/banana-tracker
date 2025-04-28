"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, MapPin, Phone, User, Edit, Save, Clock, CheckCircle } from "lucide-react"
import { users, tasks } from "@/lib/mock-data"

export default function ProfilePage() {
  // For demo purposes, we'll use the first user (Kimani Mwangi)
  const user = users[0]
  const userTasks = tasks.filter((task) => task.assignedToId === user.id)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: "Farm manager with 8 years of experience in banana plantation management. Specializing in sustainable farming practices and yield optimization.",
    location: "Kirinyaga County, Kenya",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // In a real app, this would call a server action to update the user profile
    // For now, we'll just toggle the editing state
    setIsEditing(false)
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src="/vibrant-street-market.png" alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user.name}</CardTitle>
              <CardDescription>{user.role}</CardDescription>
              <Badge className="mt-2">{user.role}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{user.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Kirinyaga County, Kenya</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Joined January 2020</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="mb-6">
              <TabsTrigger value="personal" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  {isEditing && (
                    <div className="flex gap-2 ml-auto">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent tasks and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userTasks.length > 0 ? (
                      userTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div
                            className={`rounded-full p-2 ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status === "Completed" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs mr-2">
                                {task.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
