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
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Video, 
  BookOpen, 
  ChevronRight, 
  Mail, 
  Phone, 
  Leaf, 
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Users,
  BarChart
} from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      question: "How do I add a new farm to the system?",
      answer:
        "To add a new farm, navigate to the Farms page and click on the 'Add Farm' button in the top right corner. Fill in the required information in the form and click 'Create Farm'. You can include details like name, location, region code, size, and more.",
    },
    {
      question: "How do I track banana growth stages?",
      answer:
        "You can track growth stages by going to the Growth page, selecting the farm and plot, and then clicking on 'Record Growth'. You can record different stages like flower emergence, bunch formation, and fruit development. The system will track progress over time and help predict harvest dates.",
    },
    {
      question: "How do I assign tasks to team members?",
      answer:
        "To assign tasks, go to the Tasks page and click 'Add Task'. Fill in the task details, select the team member from the 'Assigned To' dropdown, and click 'Create Task'. You can set priorities, due dates, and track completion status.",
    },
    
    {
      question: "How do I track harvest yields?",
      answer:
        "Harvest yields are tracked automatically when you record harvests. You can view yield data on the Dashboard and in the Reports section. For detailed analysis, go to the Reports page and select 'Harvest Yields'. The system tracks quantity, weight, and quality metrics.",
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
    }, {
      question: "How do I record a plot/farm inspection?",
      answer:
        "Go to the Plot page and click on 'Add Inspection'. Fill in the details like date, inspector, and any observations. The system will automatically calculate the health score based on the inspection results.",
    },
   
    {
      question: "How do I manage plots within a farm?",
      answer:
        "After creating a farm, navigate to the farm details page and select the 'Plots' tab. Click on 'Add Plot' to create a new plot. You can specify details like name, area, planting date, and crop type. Within each plot, you can manage rows and holes for precise tracking.",
    },
    {
      question: "How do I record financial transactions?",
      answer:
        "For sales, go to the Owner Dashboard and select 'Financial Records' > 'Sales'. Click 'Add Sale' and enter the details. For expenses, navigate to 'Expenses' and click 'Add Expense'. The system supports different payment methods and statuses, and generates financial reports automatically.",
    },
   
  ]

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs

  // Best practices data structure
  const bestPractices = {
    farmManagement: [
      {
        title: "Regular Farm Inspections",
        description: "Conduct weekly farm inspections using the health metrics in the app",
        details: "Train team members to use the Farm Health Metrics feature to record and track: watering levels, weeding status, desuckering quality, deleafing needs, miramba cutting, pest control measures, propping status, mature plantain management, overall banana health, and fencing integrity. The system will automatically calculate health scores.",
        importance: "high"
      },
      {
        title: "Team Role Assignment",
        description: "Assign specific responsibilities to team members based on expertise",
        details: "Use the Team Management feature to assign specialized roles to different team members. Consider creating roles for irrigation specialists, pest control managers, harvest coordinators, and growth monitoring experts. Document these roles in the responsibilities field in the user profile.",
        importance: "medium"
      },
      {
        title: "Plot Rotation Planning",
        description: "Plan and implement effective crop rotation strategies",
        details: "Use the Plot Management feature to document crop history and plan rotations. Train teams to understand the importance of rotation for soil health and disease prevention. The system can help track plot usage history and recommend optimal rotation schedules.",
        importance: "medium"
      },
      {
        title: "Data-Driven Decision Making",
        description: "Train team to use analytics for management decisions",
        details: "Schedule regular training sessions on using the Reports feature. Teach team members how to interpret growth data, yield predictions, and health metrics to make proactive management decisions rather than reactive ones.",
        importance: "high"
      },
    ],
    growthManagement: [
      {
        title: "Growth Stage Monitoring",
        description: "Implement regular growth stage checks and documentation",
        details: "Train teams to use the Growth Tracking feature consistently. Record key stages including planting, vegetative growth, flower emergence, bunch formation, and ripening. The system will help predict harvest dates and track development progress.",
        importance: "high"
      },
      {
        title: "Desuckering Protocol",
        description: "Establish and train team on proper desuckering techniques",
        details: "Teach team members to use the Tasks feature to schedule and document desuckering activities. Proper desuckering improves yield quality and plant health. The app can help schedule these tasks at optimal intervals and track compliance.",
        importance: "high"
      },
      {
        title: "Propping Systems",
        description: "Train team on implementing effective bunch propping",
        details: "Use the app to document propping methods and their effectiveness. Create visual guides within the Knowledge Base section to demonstrate proper techniques. Schedule regular propping checks through the Tasks system.",
        importance: "medium"
      },
      {
        title: "Intercropping Strategies",
        description: "Plan and monitor intercropping for optimal land use",
        details: "If using intercropping, use the Plot Management feature to document companion crops. Train teams to understand compatible crops and spacing requirements. The system can help track the effects of different intercropping approaches on banana yields.",
        importance: "low"
      },
    ],
    pestDiseaseManagement: [
      {
        title: "Early Detection Training",
        description: "Train team to identify pest and disease symptoms early",
        details: "Use the Knowledge Base to create visual guides for common pests and diseases. Schedule regular inspection tasks and train team members to use the Plant Health Status field to document findings. Early detection dramatically improves treatment outcomes.",
        importance: "high"
      },
      {
        title: "Integrated Pest Management",
        description: "Implement and track comprehensive IPM strategies",
        details: "Train teams on using the app to document pest management activities including biological controls, traps, and when necessary, chemical applications. Use the Tasks feature to schedule regular monitoring activities.",
        importance: "high"
      },
      {
        title: "Quarantine Protocols",
        description: "Establish clear procedures for handling disease outbreaks",
        details: "Create documented procedures in the Knowledge Base for containing disease outbreaks. Use the app to mark affected areas and track treatment progress. Train team members on proper sanitation when moving between affected and unaffected areas.",
        importance: "medium"
      },
      {
        title: "Soil Health Monitoring",
        description: "Regular soil testing and amendment tracking",
        details: "Use the app to document soil test results and track soil amendments. Train team members to understand the relationship between soil health and disease resistance. Schedule regular soil improvement tasks.",
        importance: "medium"
      },
    ],
    harvestAndPostHarvest: [
      {
        title: "Harvest Timing Optimization",
        description: "Train team on identifying optimal harvest windows",
        details: "Use the Growth Tracking feature to predict and plan harvests. Train team members to recognize visual indicators of readiness and document these in the system. Proper timing improves both yield and quality.",
        importance: "high"
      },
      {
        title: "Handling Protocols",
        description: "Establish clear harvest and post-harvest handling procedures",
        details: "Document proper handling techniques in the Knowledge Base and train all harvest team members. Use the app to track quality metrics at harvest time and identify handling-related issues.",
        importance: "high"
      },
      {
        title: "Grading Standards",
        description: "Implement consistent quality grading during harvest",
        details: "Use the Harvest Records feature to document quality grades. Train team members on standardized grading criteria and ensure consistent application. This data helps identify quality trends and issues.",
        importance: "medium"
      },
      {
        title: "Waste Reduction Strategies",
        description: "Track and minimize post-harvest losses",
        details: "Use the app to document causes of post-harvest losses. Train team members to identify and address common issues. Track waste percentages over time to measure improvement.",
        importance: "medium"
      },
    ],
    teamTraining: [
      {
        title: "Structured Onboarding Process",
        description: "Create a systematic training program for new team members",
        details: "Use the app's task system to create training schedules for new team members. Assign mentors and track progress through training modules. Document standard operating procedures in the Knowledge Base for reference.",
        importance: "high"
      },
      {
        title: "Continuous Skill Development",
        description: "Implement ongoing training for all team members",
        details: "Schedule regular refresher training on key farm management practices. Use the app to track team member skills and certifications. Create skill development paths for career progression.",
        importance: "medium"
      },
      {
        title: "Performance Metrics Tracking",
        description: "Establish clear KPIs for team performance",
        details: "Use the app to track individual and team performance metrics. Train supervisors on how to use these metrics for constructive feedback and improvement planning. Recognize and reward top performers.",
        importance: "medium"
      },
      {
        title: "Cross-Training Program",
        description: "Ensure multiple team members can perform critical tasks",
        details: "Use the app to track cross-training progress and ensure operational resilience. Schedule task rotations to maintain skills across different areas. Document specialized knowledge in the Knowledge Base.",
        importance: "high"
      },
    ]
  }

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
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="faq" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="best-practices" className="flex items-center">
            <Leaf className="mr-2 h-4 w-4" />
            Best Practices
          </TabsTrigger>
          {/* <TabsTrigger value="guides" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Guides
          </TabsTrigger> */}
          {/* <TabsTrigger value="videos" className="flex items-center">
            <Video className="mr-2 h-4 w-4" />
            Video Tutorials
          </TabsTrigger> */}
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

        {/* New Best Practices Tab */}
        <TabsContent value="best-practices">
          <Card>
            <CardHeader>
              <CardTitle>Best Farm Management Practices</CardTitle>
              <CardDescription>
                Comprehensive guidelines for training your team on banana plantation management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="farm-management">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="farm-management">Farm Management</TabsTrigger>
                  <TabsTrigger value="growth-management">Growth Management</TabsTrigger>
                  <TabsTrigger value="pest-disease">Pest & Disease</TabsTrigger>
                  <TabsTrigger value="harvest">Harvest Practices</TabsTrigger>
                  <TabsTrigger value="team-training">Team Training</TabsTrigger>
                </TabsList>

                <TabsContent value="farm-management">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Farm Management Best Practices</h3>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Download Guide
                      </Button>
                    </div>

                    <p className="text-muted-foreground">
                      Train your team on these essential farm management practices to optimize banana production and maintain farm health.
                    </p>

                    <div className="grid gap-4 mt-4">
                      {bestPractices.farmManagement.map((practice, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{practice.title}</CardTitle>
                              <Badge variant={practice.importance === "high" ? "default" : 
                                           practice.importance === "medium" ? "secondary" : "outline"}>
                                {practice.importance === "high" ? "Critical" : 
                                 practice.importance === "medium" ? "Important" : "Optional"}
                              </Badge>
                            </div>
                            <CardDescription>{practice.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm">{practice.details}</div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Implementation in App:</h4>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Use the Farm Inspection feature to document compliance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Schedule related tasks with automated reminders</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Monitor improvements via the Farm Health dashboard</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="growth-management">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Growth Management Best Practices</h3>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Download Guide
                      </Button>
                    </div>

                    <p className="text-muted-foreground">
                      Effective growth management is crucial for maximizing yield and quality. Train your team on these growth monitoring and management techniques.
                    </p>

                    <div className="grid gap-4 mt-4">
                      {bestPractices.growthManagement.map((practice, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{practice.title}</CardTitle>
                              <Badge variant={practice.importance === "high" ? "default" : 
                                           practice.importance === "medium" ? "secondary" : "outline"}>
                                {practice.importance === "high" ? "Critical" : 
                                 practice.importance === "medium" ? "Important" : "Optional"}
                              </Badge>
                            </div>
                            <CardDescription>{practice.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm">{practice.details}</div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Implementation in App:</h4>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Schedule regular growth monitoring tasks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <BarChart className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Track growth metrics over time through the Growth feature</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Use growth data to predict optimal harvest timing</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pest-disease">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Pest & Disease Management Best Practices</h3>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Download Guide
                      </Button>
                    </div>

                    <p className="text-muted-foreground">
                      Effective pest and disease management is essential for maintaining banana plantation health. Train your team on these prevention and treatment approaches.
                    </p>

                    <div className="grid gap-4 mt-4">
                      {bestPractices.pestDiseaseManagement.map((practice, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{practice.title}</CardTitle>
                              <Badge variant={practice.importance === "high" ? "default" : 
                                           practice.importance === "medium" ? "secondary" : "outline"}>
                                {practice.importance === "high" ? "Critical" : 
                                 practice.importance === "medium" ? "Important" : "Optional"}
                              </Badge>
                            </div>
                            <CardDescription>{practice.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm">{practice.details}</div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Implementation in App:</h4>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Record pest and disease incidents in Farm Health Metrics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Schedule regular inspection and treatment tasks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Reference treatment guides in the Knowledge Base</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="harvest">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Harvest & Post-Harvest Best Practices</h3>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Download Guide
                      </Button>
                    </div>

                    <p className="text-muted-foreground">
                      Proper harvest and post-harvest handling significantly impacts product quality and market value. Train your team on these critical practices.
                    </p>

                    <div className="grid gap-4 mt-4">
                      {bestPractices.harvestAndPostHarvest.map((practice, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{practice.title}</CardTitle>
                              <Badge variant={practice.importance === "high" ? "default" : 
                                           practice.importance === "medium" ? "secondary" : "outline"}>
                                {practice.importance === "high" ? "Critical" : 
                                 practice.importance === "medium" ? "Important" : "Optional"}
                              </Badge>
                            </div>
                            <CardDescription>{practice.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm">{practice.details}</div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Implementation in App:</h4>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Use Harvest Records to document yield and quality</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <BarChart className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Track harvest trends through Reports</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Users className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Assign and monitor harvest team performance</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="team-training">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Team Training Best Practices</h3>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-4 w-4" />
                        Download Guide
                      </Button>
                    </div>

                    <p className="text-muted-foreground">
                      Well-trained team members are essential for successful plantation management. Use these best practices to develop an effective training program.
                    </p>

                    <div className="grid gap-4 mt-4">
                      {bestPractices.teamTraining.map((practice, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{practice.title}</CardTitle>
                              <Badge variant={practice.importance === "high" ? "default" : 
                                           practice.importance === "medium" ? "secondary" : "outline"}>
                                {practice.importance === "high" ? "Critical" : 
                                 practice.importance === "medium" ? "Important" : "Optional"}
                              </Badge>
                            </div>
                            <CardDescription>{practice.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm">{practice.details}</div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Implementation in App:</h4>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-start gap-2">
                                  <Users className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Track team member skills in User Profiles</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Schedule training sessions as Tasks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                                  <span>Store training materials in the Knowledge Base</span>
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="mt-6 border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-base">Training Program Structure</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-medium mb-2">Recommended Training Sequence:</h4>
                        <ol className="space-y-2 pl-5 list-decimal">
                          <li>
                            <span className="font-medium">Basic Farm Operations</span>
                            <p className="text-sm text-muted-foreground">Farm inspection, basic maintenance tasks, health monitoring</p>
                          </li>
                          <li>
                            <span className="font-medium">Growth Management</span>
                            <p className="text-sm text-muted-foreground">Growth stages, desuckering, propping techniques</p>
                          </li>
                          <li>
                            <span className="font-medium">Pest & Disease Management</span>
                            <p className="text-sm text-muted-foreground">Identification, treatment protocols, prevention strategies</p>
                          </li>
                          <li>
                            <span className="font-medium">Harvest Procedures</span>
                            <p className="text-sm text-muted-foreground">Timing, handling, quality assessment, record keeping</p>
                          </li>
                          <li>
                            <span className="font-medium">Data Analysis & Planning</span>
                            <p className="text-sm text-muted-foreground">Using reports, performance metrics, continuous improvement</p>
                          </li>
                        </ol>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="guides">
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

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Row & Hole Management</h3>
                    <p className="text-sm text-muted-foreground">Managing plantation layout effectively</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start text-left flex items-center">
                  <div className="mr-4 bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Financial Management</h3>
                    <p className="text-sm text-muted-foreground">Tracking sales, expenses and budgets</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

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
                 
                </Card>
                
                <Card>
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary">Watch Now</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Team Training Techniques</h3>
                    <p className="text-sm text-muted-foreground mt-1">9:14 mins</p>
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
                    <h3 className="font-medium">Row and Hole Management</h3>
                    <p className="text-sm text-muted-foreground mt-1">7:38 mins</p>
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
                    <h3 className="font-medium">Pest and Disease Management</h3>
                    <p className="text-sm text-muted-foreground mt-1">10:22 mins</p>
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
                  <span className="text-sm">+254 7699 1227 - Ian Kuria</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 