import * as taskRepository from "./task-repository"
import { withFallback } from "./fallback"
import { tasks as mockTasks } from "@/lib/mock-data"
import type { Task } from "@/lib/mock-data"
import type { TaskFormValues } from "@/lib/validations/form-schemas"

// Mock implementations that use the mock data
const mockGetAllTasks = () => mockTasks

const mockGetTaskById = (id: number) => {
  const task = mockTasks.find((task) => task.id === id.toString())
  return task || null
}

const mockGetTasksByFarmId = (farmId: number) => {
  return mockTasks.filter((task) => task.farmId === farmId.toString())
}

const mockGetTasksByAssignedToId = (userId: number) => {
  return mockTasks.filter((task) => task.assignedToId === userId.toString())
}

const mockGetTasksByStatus = (status: string) => {
  return mockTasks.filter((task) => task.status === status)
}

const mockCreateTask = (values: TaskFormValues): Task => {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: values.title,
    description: values.description,
    assignedToId: values.assignedToId,
    farmId: values.farmId,
    plotId: values.plotId,
    rowId: values.rowId,
    dueDate: values.dueDate.toISOString(),
    priority: values.priority,
    type: values.type,
    status: "Pending",
    dateCreated: new Date().toISOString(),
  }

  // In a real implementation, we would add this to the mock data
  // mockTasks.push(newTask);

  return newTask
}

const mockUpdateTask = (id: number, values: TaskFormValues & { status?: string }): Task => {
  const taskIndex = mockTasks.findIndex((task) => task.id === id.toString())

  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`)
  }

  const updatedTask: Task = {
    ...mockTasks[taskIndex],
    title: values.title,
    description: values.description,
    assignedToId: values.assignedToId,
    farmId: values.farmId,
    plotId: values.plotId,
    rowId: values.rowId,
    dueDate: values.dueDate.toISOString(),
    priority: values.priority,
    type: values.type,
    status: values.status || mockTasks[taskIndex].status,
  }

  // In a real implementation, we would update the mock data
  // mockTasks[taskIndex] = updatedTask;

  return updatedTask
}

const mockUpdateTaskStatus = (id: number, status: string): Task => {
  const taskIndex = mockTasks.findIndex((task) => task.id === id.toString())

  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`)
  }

  const updatedTask: Task = {
    ...mockTasks[taskIndex],
    status,
  }

  // In a real implementation, we would update the mock data
  // mockTasks[taskIndex] = updatedTask;

  return updatedTask
}

const mockDeleteTask = (id: number): boolean => {
  const taskIndex = mockTasks.findIndex((task) => task.id === id.toString())

  if (taskIndex === -1) {
    return false
  }

  // In a real implementation, we would remove from the mock data
  // mockTasks.splice(taskIndex, 1);

  return true
}

// Create fallback versions of all repository functions
export const getAllTasksWithFallback = withFallback(
  taskRepository.getAllTasks,
  mockGetAllTasks,
  "Failed to fetch tasks from database",
)

export const getTaskByIdWithFallback = withFallback(
  taskRepository.getTaskById,
  mockGetTaskById,
  "Failed to fetch task from database",
)

export const getTasksByFarmIdWithFallback = withFallback(
  taskRepository.getTasksByFarmId,
  mockGetTasksByFarmId,
  "Failed to fetch tasks for farm from database",
)

export const getTasksByAssignedToIdWithFallback = withFallback(
  taskRepository.getTasksByAssignedToId,
  mockGetTasksByAssignedToId,
  "Failed to fetch tasks assigned to user from database",
)

export const getTasksByStatusWithFallback = withFallback(
  taskRepository.getTasksByStatus,
  mockGetTasksByStatus,
  "Failed to fetch tasks with status from database",
)

export const createTaskWithFallback = withFallback(
  taskRepository.createTask,
  mockCreateTask,
  "Failed to create task in database",
)

export const updateTaskWithFallback = withFallback(
  taskRepository.updateTask,
  mockUpdateTask,
  "Failed to update task in database",
)

export const updateTaskStatusWithFallback = withFallback(
  taskRepository.updateTaskStatus,
  mockUpdateTaskStatus,
  "Failed to update task status in database",
)

export const deleteTaskWithFallback = withFallback(
  taskRepository.deleteTask,
  mockDeleteTask,
  "Failed to delete task from database",
)
