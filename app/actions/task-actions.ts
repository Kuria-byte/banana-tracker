"use server"

import { revalidatePath } from "next/cache"
import type { TaskFormValues } from "@/lib/validations/form-schemas"

export async function createTask(values: TaskFormValues) {
  try {
    // In a real app, you would save this data to a database
    // For now, we'll just simulate a successful save
    console.log("Creating task:", values)

    // Simulate adding to the mock data
    const newTask = {
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

    // In a real app, this would be a database operation
    // tasks.push(newTask)

    // Revalidate the tasks page to show the new task
    revalidatePath("/tasks")
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Task created successfully!",
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
    // In a real app, you would update this data in a database
    // For now, we'll just simulate a successful update
    console.log("Updating task:", { id: taskId, ...values })

    // Revalidate the tasks page to show the updated task
    revalidatePath("/tasks")
    revalidatePath(`/farms/${values.farmId}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Task updated successfully!",
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
    // In a real app, you would update this data in a database
    // For now, we'll just simulate a successful update
    console.log("Updating task status:", { id: taskId, status })

    // Revalidate the tasks page to show the updated task
    revalidatePath("/tasks")
    revalidatePath("/")

    return {
      success: true,
      message: `Task marked as ${status}!`,
    }
  } catch (error) {
    console.error("Error updating task status:", error)
    return {
      success: false,
      error: "Failed to update task status. Please try again.",
    }
  }
}
