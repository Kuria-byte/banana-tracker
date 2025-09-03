"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, Calendar, User } from "lucide-react"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Task } from "@/lib/mock-data"
import { calculateTaskCompletionTime } from "@/lib/utils"

interface TaskCompletionModalProps {
  trigger: React.ReactNode
  task: Task
  completedDate?: string
  onClose?: () => void
}

export function TaskCompletionModal({ trigger, task, completedDate, onClose }: TaskCompletionModalProps) {
  const [open, setOpen] = useState(false)
  const [completionTime, setCompletionTime] = useState<{
    totalMinutes: number
    humanReadable: string
  } | null>(null)

  useEffect(() => {
    if (open && task.status === "Completed") {
      // Use completedDate prop if provided, otherwise use current time for demonstration
      const completionDate = completedDate || new Date().toISOString()
      const creationDate = task.createdAt || task.dateCreated
      
      if (creationDate) {
        const calculatedTime = calculateTaskCompletionTime(creationDate, completionDate)
        setCompletionTime(calculatedTime)
      }
    }
  }, [open, task, completedDate])

  const handleClose = () => {
    setOpen(false)
    if (onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
            Task Completed!
          </DialogTitle>
          <DialogDescription>Task completion summary and time tracking</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Completed
                </Badge>
                <Badge variant="outline" className={`${getPriorityColor(task.priority)} font-normal`}>
                  {task.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Completion Time */}
          {completionTime && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blue-600" />
                  Completion Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {completionTime.humanReadable}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total time to complete this task
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Details */}
          <div className="grid gap-4 text-sm">
            {/* Creation Time */}
            {(task.createdAt || task.dateCreated) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Started
                </div>
                <div className="font-medium">
                  {format(new Date(task.createdAt || task.dateCreated!), "PPp")}
                </div>
              </div>
            )}

            {/* Completion Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </div>
              <div className="font-medium">
                {completedDate 
                  ? format(new Date(completedDate), "PPp")
                  : format(new Date(), "PPp")
                }
              </div>
            </div>

            {/* Assignee */}
            {task.assigneeName && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    Completed by
                  </div>
                  <div className="font-medium">{task.assigneeName}</div>
                </div>
              </>
            )}
          </div>

          {/* Success Message */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-green-800 font-medium">Great job!</p>
                <p className="text-sm text-green-700 mt-1">
                  This task has been successfully completed and marked as done.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Low":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "Medium":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "High":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100"
    case "Urgent":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}