"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, MapPin, User, Clock, Flag, Briefcase, Edit } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Task } from "@/lib/mock-data"
import { TaskFormModal } from "./task-form-modal"

interface TaskDetailModalProps {
  trigger: React.ReactNode
  task: Task
  onTaskUpdate?: () => void
}

export function TaskDetailModal({ trigger, task, onTaskUpdate }: TaskDetailModalProps) {
  const [open, setOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getPriorityColor = (priority: string) => {
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

  const handleEditSuccess = () => {
    if (onTaskUpdate) {
      onTaskUpdate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>View complete task information</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <TaskFormModal
                trigger={
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                }
                title="Edit Task"
                description="Update task information"
                initialData={{
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  assignedToId: task.assignedToId,
                  farmId: task.farmId,
                  plotId: task.plotId || "",
                  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                  priority: task.priority as "Low" | "Medium" | "High" | "Urgent",
                  type: task.type as "Planting" | "Harvesting" | "Maintenance" | "Input Application" | "Inspection",
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${getStatusColor(task.status)} font-normal`}>
                {task.status}
              </Badge>
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} font-normal`}>
                {task.priority}
              </Badge>
              {task.type && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100 font-normal">
                  {task.type}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Task Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description || "No description provided"}
              </p>
            </CardContent>
          </Card>

          {/* Task Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Due Date */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  Due Date
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">
                  {task.dueDate 
                    ? format(new Date(task.dueDate), "PPP") 
                    : "No due date set"
                  }
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(task.dueDate), "EEEE, MMMM do, yyyy")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Assigned To */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Assigned To
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">{task.assigneeName || "Unassigned"}</p>
                {task.assigneeEmail && (
                  <p className="text-xs text-muted-foreground mt-1">{task.assigneeEmail}</p>
                )}
              </CardContent>
            </Card>

            {/* Farm & Location */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  Farm & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">{task.farmName || "Unknown Farm"}</p>
                {task.farmLocation && (
                  <p className="text-xs text-muted-foreground mt-1">{task.farmLocation}</p>
                )}
                {task.plotName && (
                  <p className="text-xs text-muted-foreground mt-1">Plot: {task.plotName}</p>
                )}
              </CardContent>
            </Card>

            {/* Task Timing */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {task.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Created: {format(new Date(task.createdAt), "PPp")}
                  </p>
                )}
                {task.dateCreated && !task.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Created: {format(new Date(task.dateCreated), "PPp")}
                  </p>
                )}
                {task.updatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {format(new Date(task.updatedAt), "PPp")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Type */}
          {task.type && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  Task Type
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">{task.type}</p>
                <CardDescription className="mt-1">
                  This task is categorized as {task.type.toLowerCase()} work.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}