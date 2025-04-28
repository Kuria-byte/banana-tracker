"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, HelpCircle, FileText, MessageSquare, Video, BookOpen, ChevronRight, Mail, Phone } from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      question: "How do I add a new farm to the system?",
      answer:
        "To add a new farm, navigate to the Farms page and click on the 'Add Farm' button in the top right corner. Fill in the required information in the form and click 'Create Farm'.",
    },
    {
      question: "How do I track banana growth stages?",
      answer:
        "You can track growth stages by going to the Growth page, selecting the farm and plot, and then clicking on 'Record Growth'. You can record different stages like flower emergence, bunch formation, and fruit development.",
    },
    {
      question: "How do I assign tasks to team members?",
      answer:
        "To assign tasks, go to the Tasks page and click 'Add Task'. Fill in the task details, select the team member from the 'Assigned To' dropdown, and click 'Create Task'.",
    },
    {
      question: "How do I generate reports?",
      answer:
        "Navigate to the Reports page where you can select different report types like Farm Performance, Harvest Yields, or Input Efficiency. Click on 'Generate Report' and select your desired parameters.",
    },
    {
      question: "How do I track harvest yields?",
      answer:
        "Harvest yields are tracked automatically when you record harvests. You can view yield data on the Dashboard and in the Reports section. For detailed analysis, go to the Reports page and select 'Harvest Yields'.",
    },
    {
      question: "Can I use the system offline?",
      answer:
        "Yes, the mobile app supports offline mode. Data will sync automatically when you reconnect to the internet. However, the web application requires an internet connection.",
    },
    {
      question: "How do I set up notifications?",
      answer:
        "Go to Settings > Notifications to customize which notifications you receive and how you receive them. You can enable or disable email notifications, push notifications, and specific alert types.",
    },
  ]

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers and learn how to use Banana Tracker</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="mb-6">
          <TabsTrigger value="faq" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center">
            <Video className="mr-2 h-4 w-4" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions and answers about using Banana Tracker</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No results found for "{searchQuery}"</p>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>User Guides</CardTitle>
              <CardDescription>Step-by-step guides to help you use Banana Tracker effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Getting Started Guide</h3>
                    <p className="text-sm text-muted-foreground">Learn the basics of Banana Tracker</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Farm Management Guide</h3>
                    <p className="text-sm text-muted-foreground">How to manage farms and plots</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Task Management Guide</h3>
                    <p className="text-sm text-muted-foreground">Creating and assigning tasks</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Growth Tracking Guide</h3>
                    <p className="text-sm text-muted-foreground">Recording and monitoring growth stages</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Yield Management Guide</h3>
                    <p className="text-sm text-muted-foreground">Tracking and optimizing yields</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Reporting Guide</h3>
                    <p className="text-sm text-muted-foreground">Generating and analyzing reports</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Watch step-by-step video guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Getting Started with Banana Tracker</h3>
                    <p className="text-sm text-muted-foreground mt-1">5:32 mins</p>
                  </CardContent>
                </Card>

                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Managing Farms and Plots</h3>
                    <p className="text-sm text-muted-foreground mt-1">7:15 mins</p>
                  </CardContent>
                </Card>

                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Task Assignment and Management</h3>
                    <p className="text-sm text-muted-foreground mt-1">4:48 mins</p>
                  </CardContent>
                </Card>

                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Recording Growth Stages</h3>
                    <p className="text-sm text-muted-foreground mt-1">6:22 mins</p>
                  </CardContent>
                </Card>

                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Analyzing Yield Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">8:05 mins</p>
                  </CardContent>
                </Card>

                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Generating Reports</h3>
                    <p className="text-sm text-muted-foreground mt-1">5:54 mins</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account Question</SelectItem>
                      <SelectItem value="billing">Billing Inquiry</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Describe your issue or question" className="min-h-[150px]" />
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <h3 className="font-medium">Other Ways to Get Help</h3>
              <div className="grid gap-4 mt-4 w-full md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">support@bananatracker.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+254 712 345 678</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
