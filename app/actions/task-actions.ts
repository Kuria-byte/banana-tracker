"use server"

import { revalidatePath } from "next/cache"
import type { TaskFormValues } from "@/lib/validations/form-schemas"
import * as taskRepository from "@/db/repositories/task-repository"

export async function createTask(values: TaskFormValues & { creatorId?: string }) {
  try {
    const newTask = await taskRepository.createTask(values)
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
    const updatedTask = await taskRepository.updateTask(Number.parseInt(taskId), values)
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
    const updatedTask = await taskRepository.updateTaskStatus(Number.parseInt(taskId), status)
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

export async function getAllTasks() {
  try {
    const tasks = await taskRepository.getAllTasks()
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

export async function getTasksByFarmId(farmId: string) {
  try {
    const tasks = await taskRepository.getTasksByFarmId(Number.parseInt(farmId))
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

export async function getTasksByAssignedToId(userId: string) {
  try {
    const tasks = await taskRepository.getTasksByAssignedToId(Number.parseInt(userId))
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

export async function getTasksByStatus(status: string) {
  try {
    const tasks = await taskRepository.getTasksByStatus(status)
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
