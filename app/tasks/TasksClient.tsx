"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskFilter } from "@/components/tasks/task-filter"
import { Plus, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskFormModal } from "@/components/modals/task-form-modal"
import { getAllFarms } from "@/app/actions/farm-actions"
import { getAllPlots } from "@/app/actions/plot-actions"
import { updateTaskStatus } from "@/app/actions/task-actions"

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

export default function TasksClient({ tasks }: { tasks: Task[] }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [localTasks, setLocalTasks] = useState(tasks)
  const [farms, setFarms] = useState<{ id: string; name: string }[]>([])
  const [plots, setPlots] = useState<{ id: string; name: string; farmId: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const farmsRes = await getAllFarms()
        setFarms(farmsRes.farms || [])
        const plotsRes = await getAllPlots()
        setPlots(plotsRes.plots || [])
      } catch (e) {
        setError("Failed to load farms or plots")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleFilterChange = (filters: {
    search: string
    status: string
    priority: string
    type: string
    year: string
    farmId: string
    plotId: string
  }) => {
    let result = [...localTasks]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
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

    if (filters.year && filters.year !== "all") {
      result = result.filter((task) => {
        if (!task.dueDate) return false
        const year = new Date(task.dueDate).getFullYear().toString()
        return year === filters.year
      })
    }

    if (filters.farmId && filters.farmId !== "all") {
      result = result.filter((task) => task.farmId === filters.farmId)
    }

    if (filters.plotId && filters.plotId !== "all") {
      result = result.filter((task) => task.plotId === filters.plotId)
    }

    setFilteredTasks(result)
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await updateTaskStatus(taskId, newStatus)
      if (res.success) {
        const updatedTasks = localTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus as any } : task
        )
        setLocalTasks(updatedTasks)
        setFilteredTasks(updatedTasks)
      } else {
        setError(res.error || "Failed to update task status")
      }
    } catch (e) {
      setError("Failed to update task status")
    } finally {
      setLoading(false)
    }
  }

  const pendingTasks = filteredTasks.filter((task) => task.status === "Pending")
  const inProgressTasks = filteredTasks.filter((task) => task.status === "In Progress")
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed")

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <style jsx global>{scrollbarHideStyles}</style>
      {loading && <div className="mb-4 text-blue-600">Loading...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
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
          title={""}
          description={""}
        />
      </div>

      <div className="mb-6">
        <TaskFilter onFilterChange={handleFilterChange} farms={farms} plots={plots} />
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