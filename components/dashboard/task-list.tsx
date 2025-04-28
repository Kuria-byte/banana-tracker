import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Task, getUserById } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface TaskListProps {
  tasks: Task[]
  limit?: number
}

export function TaskList({ tasks, limit }: TaskListProps) {
  const displayTasks = limit ? tasks.slice(0, limit) : tasks

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks available</p>
          ) : (
            displayTasks.map((task) => (
              <div key={task.id} className="flex items-center">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Assigned to {getUserById(task.assignedToId)?.name}</span>
                    <span className="mx-2">•</span>
                    <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TaskStatusBadge({ status }: { status: Task["status"] }) {
  const getStatusColor = () => {
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
        return ""
    }
  }

  return (
    <Badge variant="outline" className={`${getStatusColor()} font-normal`}>
      {status}
    </Badge>
  )
}
