"use server"

import { revalidatePath } from "next/cache"
import type { TaskFormValues } from "@/lib/validations/form-schemas"
import * as taskRepositoryFallback from "@/db/repositories/task-repository-fallback"

export async function createTask(values: TaskFormValues) {
  try {
    // Create the task in the database with fallback to mock data
    const newTask = await taskRepositoryFallback.createTaskWithFallback(values)

    // Revalidate the tasks page to show the new task
    revalidatePath("/tasks")
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Task created successfully!",
      task: newTask,
    }
  } catch (error) {
    console.error("Error creating task:", error)
    return {
      success: false,
      error: "Failed to create task. Please try again.",
    }
  }
}

export async function updateTask(taskId: string, values: TaskFormValues & { status?: string }) {
  try {
    // Update the task in the database with fallback to mock data
    const updatedTask = await taskRepositoryFallback.updateTaskWithFallback(Number.parseInt(taskId), values)

    // Revalidate the tasks page to show the updated task
    revalidatePath("/tasks")
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Task updated successfully!",
      task: updatedTask,
    }
  } catch (error) {
    console.error("Error updating task:", error)
    return {
      success: false,
      error: "Failed to update task. Please try again.",
    }
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    // Update the task status in the database with fallback to mock data
    const updatedTask = await taskRepositoryFallback.updateTaskStatusWithFallback(Number.parseInt(taskId), status)

    // Revalidate the tasks page to show the updated task
    revalidatePath("/tasks")
    revalidatePath("/")

    return {
      success: true,
      message: `Task marked as ${status}!`,
      task: updatedTask,
    }
  } catch (error) {
    console.error("Error updating task status:", error)
    return {
      success: false,
      error: "Failed to update task status. Please try again.",
    }
  }
}

// Add a new function to get all tasks
export async function getAllTasks() {
  try {
    const tasks = await taskRepositoryFallback.getAllTasksWithFallback()
    return {
      success: true,
      tasks,
    }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return {
      success: false,
      error: "Failed to fetch tasks. Please try again.",
      tasks: [],
    }
  }
}

// Add a new function to get tasks by farm ID
export async function getTasksByFarmId(farmId: string) {
  try {
    const tasks = await taskRepositoryFallback.getTasksByFarmIdWithFallback(Number.parseInt(farmId))
    return {
      success: true,
      tasks,
    }
  } catch (error) {
    console.error(`Error fetching tasks for farm with id ${farmId}:`, error)
    return {
      success: false,
      error: "Failed to fetch tasks. Please try again.",
      tasks: [],
    }
  }
}

// Add a new function to get tasks by assigned user ID
export async function getTasksByAssignedToId(userId: string) {
  try {
    const tasks = await taskRepositoryFallback.getTasksByAssignedToIdWithFallback(Number.parseInt(userId))
    return {
      success: true,
      tasks,
    }
  } catch (error) {
    console.error(`Error fetching tasks assigned to user with id ${userId}:`, error)
    return {
      success: false,
      error: "Failed to fetch tasks. Please try again.",
      tasks: [],
    }
  }
}

// Add a new function to get tasks by status
export async function getTasksByStatus(status: string) {
  try {
    const tasks = await taskRepositoryFallback.getTasksByStatusWithFallback(status)
    return {
      success: true,
      tasks,
    }
  } catch (error) {
    console.error(`Error fetching tasks with status ${status}:`, error)
    return {
      success: false,
      error: "Failed to fetch tasks. Please try again.",
      tasks: [],
    }
  }
}
