"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { type Task, getPlotById } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Clock, MapPin, Eye } from "lucide-react"
import { TaskDetailModal } from "@/components/modals/task-detail-modal"
import { TaskCompletionModal } from "@/components/modals/task-completion-modal"

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void
  onTaskUpdate?: () => void
}

export function TaskCard({ task, onStatusChange, onTaskUpdate }: TaskCardProps) {
  const plot = task.plotId ? getPlotById(task.plotId) : null

  const getStatusColor = () => {
    switch (task.status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return ""
    }
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Medium":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "High":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "Urgent":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  const handleMarkInProgress = () => {
    if (onStatusChange) {
      onStatusChange(task.id, "In Progress")
    }
  }

  const handleMarkComplete = () => {
    if (onStatusChange) {
      onStatusChange(task.id, "Completed")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 justify-between">
          <Badge variant="outline" className={`${getStatusColor()} font-normal`}>
            {task.status}
          </Badge>
          <Badge variant="outline" className={`${getPriorityColor()} font-normal`}>
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-start justify-between mt-2">
          <h3 className="font-semibold text-base flex-1 pr-2">{task.title}</h3>
          <TaskDetailModal
            trigger={
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 shrink-0">
                <Eye className="h-4 w-4" />
              </Button>
            }
            task={task}
            onTaskUpdate={onTaskUpdate}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {task.farmName}
              {task.farmLocation ? ` (${task.farmLocation})` : ""}
              {plot ? ` - ${plot.name}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span>Assigned to {task.assigneeName || "Unassigned"}</span>
            {task.assigneeEmail && (
              <span className="ml-2 text-xs text-muted-foreground">({task.assigneeEmail})</span>
            )}
          </div>
        </div>
      </CardContent>
      {/* Action buttons for non-completed tasks */}
      {onStatusChange && task.status !== "Completed" && task.status !== "Cancelled" && (
        <CardFooter className="flex gap-2">
          {task.status === "Pending" && (
            <Button size="sm" variant="outline" className="flex-1" onClick={handleMarkInProgress}>
              Start
            </Button>
          )}
          <Button size="sm" className="flex-1" onClick={handleMarkComplete}>
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Complete
          </Button>
        </CardFooter>
      )}
      
      {/* Completion time button for completed tasks */}
      {task.status === "Completed" && (
        <CardFooter className="flex gap-2">
          <TaskCompletionModal
            trigger={
              <Button size="sm" variant="outline" className="flex-1">
                <Clock className="mr-1 h-4 w-4" />
                View Completion Time
              </Button>
            }
            task={task}
          />
        </CardFooter>
      )}
    </Card>
  )
}
