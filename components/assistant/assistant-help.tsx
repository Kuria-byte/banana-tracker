// components/assistant/assistant-help.tsx
'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Banana, Leaf, Bug, Calendar, Maximize2, TrendingUp, PieChart, HelpCircle, Lightbulb } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function AssistantHelp() {
  const [devStatus, setDevStatus] = useState(60);
  
  const features = [
    { 
      title: "Farm Information", 
      icon: <Leaf className="h-5 w-5 text-green-500" />, 
      description: "Get details about your farms, plots, and banana plants",
      examples: ["How many farms do I have?", "Tell me about my Nairobi farm", "How many plots are in active status?"],
      status: "Available"
    },
    { 
      title: "Health Monitoring", 
      icon: <Bug className="h-5 w-5 text-red-500" />, 
      description: "Check health status, pest issues, and maintenance needs",
      examples: ["What health issues are common in my farms?", "Show me unhealthy plots", "Health status of Farm 1"],
      status: "Available"
    },
    { 
      title: "Task Management", 
      icon: <Calendar className="h-5 w-5 text-blue-500" />, 
      description: "View and organize farm tasks and activities",
      examples: ["What tasks are pending this week?", "Show me overdue tasks", "Tasks for Eastlands Farm"],
      status: "Available"
    },
    { 
      title: "Harvest Tracking", 
      icon: <Banana className="h-5 w-5 text-yellow-500" />, 
      description: "Monitor harvests, yields, and growth stages",
      examples: ["When is my next harvest?", "Show harvest history for Farm 2", "Total yield this month"],
      status: "Available"
    },
    { 
      title: "Performance Analytics", 
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />, 
      description: "Analyze farm performance and productivity",
      examples: ["Which farm has the best yield?", "Compare productivity between farms", "Growth trends for Plot 5"],
      status: "In Development"
    },
    { 
      title: "Financial Insights", 
      icon: <PieChart className="h-5 w-5 text-indigo-500" />, 
      description: "Track expenses, sales, and financial metrics",
      examples: ["What are my farm costs this month?", "Show revenue by farm", "Profit margin analysis"],
      status: "Planned"
    }
  ];
  
  const frequentQuestions = [
    {
      question: "What can the Farm Assistant help me with?",
      answer: "The Farm Assistant can help you manage your banana farms by providing information about your farms, plots, tasks, growth tracking, harvests, and more. You can ask questions about farm health, upcoming tasks, harvest predictions, and other farm management concerns."
    },
    {
      question: "How accurate is the information?",
      answer: "The Farm Assistant uses data from your farm records to provide personalized information. The accuracy depends on the data in your system. The assistant will let you know if it can't find the information you're looking for."
    },
    {
      question: "Can I ask about specific farms or plots?",
      answer: "Yes! You can ask about specific farms by name or ID, and about specific plots within those farms. For example, 'Show me the health status of Plot 3 in Eastlands Farm' or 'When is the next harvest for Nairobi Farm?'"
    },
    {
      question: "What should I do if I get an error?",
      answer: "If you encounter an error, try rephrasing your question or asking something simpler. If errors persist, refreshing the page may help. For continued issues, please contact support."
    },
    {
      question: "Is my conversation with the assistant private?",
      answer: "Yes, your conversations with the Farm Assistant are private and only visible to you. The assistant only uses your farm data to provide personalized responses and does not share your information."
    }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
      <Tabs defaultValue="about">
        <div className="border-b">
          <TabsList className="w-full justify-start px-4 h-12">
            <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:text-green-700 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              About
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="data-[state=active]:bg-transparent data-[state=active]:text-green-700 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Capabilities
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-transparent data-[state=active]:text-green-700 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-transparent data-[state=active]:text-green-700 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">
              FAQ
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="about" className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-green-50 p-4 rounded-full inline-block mb-4">
                <Banana className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Farm Assistant</h2>
              <p className="text-gray-600">Your AI-powered farming companion</p>
            </div>
            
            <div className="grid gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>What is the Farm Assistant?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>The Farm Assistant is an AI-powered tool designed to help you manage your banana farms more effectively. It analyzes your farm data to provide insights, answer questions, and help you make better decisions about your farming operations.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Development Status</CardTitle>
                  <CardDescription>Currently in Beta (Version 0.5.2)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Development progress</span>
                      <span className="font-medium">{devStatus}%</span>
                    </div>
                    <Progress value={devStatus} className="h-2" />
                    <p className="text-sm text-gray-600 pt-2">
                      The Farm Assistant is currently in beta. We're actively improving its capabilities and reliability based on user feedback.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Submit Feedback
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              <p>Using Google Gemini AI technology</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="capabilities" className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">What Can I Ask?</h2>
              <p className="text-gray-600 mb-6">
                The Farm Assistant can help you with various aspects of banana farm management. Here are the current capabilities:
              </p>
              
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search capabilities..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {features.map((feature, index) => (
                    <CommandGroup key={index} heading={feature.title}>
                      <CommandItem className="p-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{feature.icon}</div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {feature.title}
                              {feature.status !== "Available" && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  feature.status === "In Development" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {feature.status}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700">Example questions:</p>
                              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                {feature.examples.map((example, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {example}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">Pro Tip</h3>
                  <p className="text-sm text-green-700 mt-1">
                    For best results, be specific in your questions. Include farm names, plot numbers, or time periods when relevant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="roadmap" className="p-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-2">Development Roadmap</h2>
            <p className="text-gray-600 mb-6">
              We're continuously improving the Farm Assistant. Here's what we're working on:
            </p>
            
            <div className="space-y-8">
              <div className="relative pl-8 pb-8 border-l-2 border-green-200">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                <div className="mb-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Current Release</span>
                  <span className="ml-2 text-sm text-gray-500">v0.5.2</span>
                </div>
                <h3 className="text-lg font-medium">Basic Farm Information & Health Monitoring</h3>
                <p className="text-gray-600 mt-1">
                  Access farm details, health statuses, pending tasks, and harvest information.
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Farm and plot information queries
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic health status reports
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Task information and summaries
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic harvest predictions
                  </li>
                </ul>
              </div>
              
              <div className="relative pl-8 pb-8 border-l-2 border-gray-200">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-amber-400"></div>
                <div className="mb-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">In Development</span>
                  <span className="ml-2 text-sm text-gray-500">v0.6.0 (June 2025)</span>
                </div>
                <h3 className="text-lg font-medium">Enhanced Analytics & Recommendations</h3>
                <p className="text-gray-600 mt-1">
                  Improved analysis capabilities with actionable recommendations.
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Farm performance comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Proactive health recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Task prioritization suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Visual data representations
                  </li>
                </ul>
              </div>
              
              <div className="relative pl-8 pb-0 border-l-2 border-gray-200">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gray-300"></div>
                <div className="mb-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Planned</span>
                  <span className="ml-2 text-sm text-gray-500">v0.7.0 (Q3 2025)</span>
                </div>
                <h3 className="text-lg font-medium">Financial Insights & Predictive Analysis</h3>
                <p className="text-gray-600 mt-1">
                  Financial tracking, yield predictions, and long-term planning tools.
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Revenue and expense tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI-powered yield predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Long-term farm planning tools
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Market insights and recommendations
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                Feature Request
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Have an idea for a new feature? We'd love to hear your suggestions!
              </p>
              <Button variant="outline" className="w-full">
                Submit Feature Request
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="p-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full">
              {frequentQuestions.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-8 border-t pt-6">
              <p className="text-sm text-gray-600 text-center">
                Still have questions? <a href="#" className="text-green-600 hover:underline">Contact support</a> for more help.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}