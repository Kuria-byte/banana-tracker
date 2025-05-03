"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Moon, Sun, Laptop, Lock, UserCog, Smartphone, Mail, BellRing } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [theme, setTheme] = useState("system")
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    harvestAlerts: true,
    healthAlerts: true,
    weeklyReports: true,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex-shrink-0">
            <TabsList className="flex flex-col w-full h-auto bg-transparent p-0 space-y-1">
              <TabsTrigger value="general" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                <UserCog className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                <Sun className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage your general account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">This will change the language of the interface</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select defaultValue="africa-nairobi">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa-nairobi">Africa/Nairobi (GMT+3)</SelectItem>
                        <SelectItem value="africa-lagos">Africa/Lagos (GMT+1)</SelectItem>
                        <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      All dates and times will be displayed in this time zone
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="units">Measurement Units</Label>
                    <Select defaultValue="metric">
                      <SelectTrigger id="units">
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg, hectares)</SelectItem>
                        <SelectItem value="imperial">Imperial (lbs, acres)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Units used for measurements throughout the application
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="mobile-app">Mobile App Sync</Label>
                      <p className="text-xs text-muted-foreground">Sync data with the mobile application</p>
                    </div>
                    <Switch id="mobile-app" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Channels</h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notifications.email}
                        onCheckedChange={() => handleNotificationChange("email")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notifications.push}
                        onCheckedChange={() => handleNotificationChange("push")}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Types</h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BellRing className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="task-reminders">Task Reminders</Label>
                      </div>
                      <Switch
                        id="task-reminders"
                        checked={notifications.taskReminders}
                        onCheckedChange={() => handleNotificationChange("taskReminders")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BellRing className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="harvest-alerts">Harvest Alerts</Label>
                      </div>
                      <Switch
                        id="harvest-alerts"
                        checked={notifications.harvestAlerts}
                        onCheckedChange={() => handleNotificationChange("harvestAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BellRing className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="health-alerts">Health Alerts</Label>
                      </div>
                      <Switch
                        id="health-alerts"
                        checked={notifications.healthAlerts}
                        onCheckedChange={() => handleNotificationChange("healthAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      </div>
                      <Switch
                        id="weekly-reports"
                        checked={notifications.weeklyReports}
                        onCheckedChange={() => handleNotificationChange("weeklyReports")}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center gap-1 h-auto p-4"
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-5 w-5" />
                        <span className="text-xs">Light</span>
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center gap-1 h-auto p-4"
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-5 w-5" />
                        <span className="text-xs">Dark</span>
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center gap-1 h-auto p-4"
                        onClick={() => setTheme("system")}
                      >
                        <Laptop className="h-5 w-5" />
                        <span className="text-xs">System</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="density">Interface Density</Label>
                    <Select defaultValue="comfortable">
                      <SelectTrigger id="density">
                        <SelectValue placeholder="Select density" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Controls the spacing and density of the user interface
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Adjust the font size for better readability</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">••••••••••••</p>
                        <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Set Up</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Active Sessions</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome on Windows • Nairobi, Kenya</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Mobile App</p>
                          <p className="text-xs text-muted-foreground">Android • Last active 2 days ago</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive">Sign Out All Devices</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <Card>
              <CardHeader>
                <CardTitle>Farm Health Scoring</CardTitle>
                <CardDescription>Manage parameters for farm health assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure the parameters used to calculate farm health scores
                </p>
                <Button asChild>
                  <Link href="/settings/scoring">Manage Scoring Parameters</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
