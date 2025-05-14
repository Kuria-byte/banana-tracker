"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Droplets, Sun, Thermometer } from "lucide-react"
import { HealthReportsModal } from "@/components/modals/health-reports-modal"
import Link from "next/link"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useState } from "react"

export function PersonalizedInsights({ farmsMissingInspection = [], plotsWithPoorWatering = [], urgentTasks = [] }: { farmsMissingInspection?: any[], plotsWithPoorWatering?: any[], urgentTasks?: any[] }) {
  const [openModal, setOpenModal] = useState<null | "inspection" | "irrigation" | "tasks">(null)

  // Determine irrigation link for individual items
  const getFarmLink = (farmId: number) => `/farms/${farmId}`
  const getPlotLink = (farmId: number) => `/farms/${farmId}`
  const getTaskLink = (task: any) => "/tasks" // Or `/tasks/${task.id}` if you have task details page

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Your Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Farms Missing Inspection</h4>
            <p className="text-xs text-muted-foreground">
              {farmsMissingInspection.length === 0
                ? "All farms have recent inspections!"
                : `${farmsMissingInspection.length} farm${farmsMissingInspection.length > 1 ? "s" : ""} have not been inspected in the last 30 days.`}
            </p>
            {farmsMissingInspection.length > 0 && (
              <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                {farmsMissingInspection.slice(0, 3).map(farm => (
                  <li key={farm.id}>{farm.name}</li>
                ))}
                {farmsMissingInspection.length > 3 && (
                  <li>...and {farmsMissingInspection.length - 3} more</li>
                )}
              </ul>
            )}
            {farmsMissingInspection.length > 0 && (
              <Dialog open={openModal === "inspection"} onOpenChange={open => setOpenModal(open ? "inspection" : null)}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">
                    View all farms needing inspection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Farms Missing Inspection</DialogTitle>
                  </DialogHeader>
                  <ul className="mt-2 space-y-2">
                    {farmsMissingInspection.map(farm => (
                      <li key={farm.id} className="flex items-center justify-between">
                        <span>{farm.name}</span>
                        <Link href={getFarmLink(farm.id)} className="text-primary underline text-xs ml-2" target="_blank" rel="noopener noreferrer">View Farm</Link>
                      </li>
                    ))}
                  </ul>
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-4 w-full">Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* <div className="flex items-start gap-3">
          <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
            <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Today's Weather</h4>
            <p className="text-xs text-muted-foreground">Sunny, 28°C with light winds</p>
            <div className="mt-1 flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">Ideal for field inspections</span>
            </div>
          </div>
        </div> */}

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
            <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Irrigation Needed</h4>
            <p className="text-xs text-muted-foreground">
              {plotsWithPoorWatering.length === 0
                ? "All plots have adequate watering."
                : `${plotsWithPoorWatering.length} plot${plotsWithPoorWatering.length > 1 ? "s" : ""} need irrigation attention.`}
            </p>
            {plotsWithPoorWatering.length > 0 && (
              <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                {plotsWithPoorWatering.slice(0, 3).map(plot => (
                  <li key={plot.plotId}>{plot.plotName} ({Math.round(plot.percent)}%)</li>
                ))}
                {plotsWithPoorWatering.length > 3 && (
                  <li>...and {plotsWithPoorWatering.length - 3} more</li>
                )}
              </ul>
            )}
            {plotsWithPoorWatering.length > 0 && (
              <Dialog open={openModal === "irrigation"} onOpenChange={open => setOpenModal(open ? "irrigation" : null)}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">
                    View irrigation schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Plots Needing Irrigation</DialogTitle>
                  </DialogHeader>
                  <ul className="mt-2 space-y-2">
                    {plotsWithPoorWatering.map(plot => (
                      <li key={plot.plotId} className="flex items-center justify-between">
                        <span>{plot.plotName} ({Math.round(plot.percent)}%)</span>
                        <Link href={getPlotLink(plot.farmId)} className="text-primary underline text-xs ml-2" target="_blank" rel="noopener noreferrer">View Farm</Link>
                      </li>
                    ))}
                  </ul>
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-4 w-full">Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Urgent Tasks</h4>
            <p className="text-xs text-muted-foreground">
              {urgentTasks.length === 0
                ? "No urgent tasks due soon."
                : `${urgentTasks.length} urgent task${urgentTasks.length > 1 ? "s" : ""} due in the next 3 days.`}
            </p>
            {urgentTasks.length > 0 && (
              <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                {urgentTasks.slice(0, 3).map(task => (
                  <li key={task.id}>{task.title} (Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"})</li>
                ))}
                {urgentTasks.length > 3 && (
                  <li>...and {urgentTasks.length - 3} more</li>
                )}
              </ul>
            )}
            {urgentTasks.length > 0 && (
              <Dialog open={openModal === "tasks"} onOpenChange={open => setOpenModal(open ? "tasks" : null)}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">
                    View all urgent tasks
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Urgent Tasks</DialogTitle>
                  </DialogHeader>
                  <ul className="mt-2 space-y-2">
                    {urgentTasks.map(task => (
                      <li key={task.id} className="flex items-center justify-between">
                        <span>{task.title} (Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"})</span>
                        <Link href={getTaskLink(task)} className="text-primary underline text-xs ml-2" target="_blank" rel="noopener noreferrer">View Tasks</Link>
                      </li>
                    ))}
                  </ul>
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-4 w-full">Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
{/* 
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Upcoming Harvests</h4>
            <p className="text-xs text-muted-foreground">Harvest scheduled for next week</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              View harvest calendar
            </Button>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}
