"use client"

import { useState } from "react"
import { tasks, getUserById, getFarmById } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskFilter } from "@/components/tasks/task-filter"
import { Plus, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskFormModal } from "@/components/modals/task-form-modal"

// Add custom scrollbar hiding styles
const scrollbarHideStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

export default function TasksPage() {
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [localTasks, setLocalTasks] = useState(tasks)

  const handleFilterChange = (filters: {
    search: string
    status: string
    priority: string
    type: string
  }) => {
    let result = [...localTasks]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          getUserById(task.assignedToId)?.name.toLowerCase().includes(searchLower) ||
          getFarmById(task.farmId)?.name.toLowerCase().includes(searchLower),
      )
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter((task) => task.status === filters.status)
    }

    if (filters.priority && filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority)
    }

    if (filters.type && filters.type !== "all") {
      result = result.filter((task) => task.type === filters.type)
    }

    setFilteredTasks(result)
  }

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    // In a real app, this would call a server action to update the task status
    // For now, we'll just update the local state
    const updatedTasks = localTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus as any } : task))
    setLocalTasks(updatedTasks)
    setFilteredTasks(updatedTasks)
  }

  const pendingTasks = filteredTasks.filter((task) => task.status === "Pending")
  const inProgressTasks = filteredTasks.filter((task) => task.status === "In Progress")
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed")

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <style jsx global>
        {scrollbarHideStyles}
      </style>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track all farm activities</p>
        </div>
        <TaskFormModal
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          }
        />
      </div>

      <div className="mb-6">
        <TaskFilter onFilterChange={handleFilterChange} />
      </div>

      <Tabs defaultValue="pending" className="mt-6">
        <TabsList className="w-full flex whitespace-nowrap overflow-x-auto scrollbar-none pb-1 -mx-2 px-2 no-scrollbar">
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            All Tasks ({filteredTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No pending tasks</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {inProgressTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No tasks in progress</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No completed tasks</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No tasks match your filters</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
