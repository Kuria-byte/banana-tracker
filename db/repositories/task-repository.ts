import { db } from "../client"
import { tasks } from "../schema"
import { eq } from "drizzle-orm"
import type { Task } from "@/lib/mock-data"
import type { TaskFormValues } from "@/lib/validations/form-schemas"

export async function getAllTasks(): Promise<Task[]> {
  try {
    const result = await db.select().from(tasks)
    return result.map(taskDbToModel)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw new Error("Failed to fetch tasks")
  }
}

export async function getTaskById(id: number): Promise<Task | null> {
  try {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1)
    return result.length > 0 ? taskDbToModel(result[0]) : null
  } catch (error) {
    console.error(`Error fetching task with id ${id}:`, error)
    throw new Error(`Failed to fetch task with id ${id}`)
  }
}

export async function getTasksByFarmId(farmId: number): Promise<Task[]> {
  try {
    const result = await db.select().from(tasks).where(eq(tasks.farmId, farmId))
    return result.map(taskDbToModel)
  } catch (error) {
    console.error(`Error fetching tasks for farm with id ${farmId}:`, error)
    throw new Error(`Failed to fetch tasks for farm with id ${farmId}`)
  }
}

export async function getTasksByAssignedToId(userId: number): Promise<Task[]> {
  try {
    const result = await db.select().from(tasks).where(eq(tasks.assignedToId, userId))
    return result.map(taskDbToModel)
  } catch (error) {
    console.error(`Error fetching tasks assigned to user with id ${userId}:`, error)
    throw new Error(`Failed to fetch tasks assigned to user with id ${userId}`)
  }
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
  try {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status as any))
    return result.map(taskDbToModel)
  } catch (error) {
    console.error(`Error fetching tasks with status ${status}:`, error)
    throw new Error(`Failed to fetch tasks with status ${status}`)
  }
}

export async function createTask(values: TaskFormValues): Promise<Task> {
  try {
    const taskData = {
      title: values.title,
      description: values.description,
      assignedToId: Number.parseInt(values.assignedToId),
      farmId: Number.parseInt(values.farmId),
      plotId: values.plotId ? Number.parseInt(values.plotId) : null,
      rowId: values.rowId ? Number.parseInt(values.rowId) : null,
      dueDate: values.dueDate,
      priority: values.priority,
      type: values.type,
      status: "Pending",
      dateCreated: new Date(),
    }

    const result = await db.insert(tasks).values(taskData).returning()
    return taskDbToModel(result[0])
  } catch (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }
}

export async function updateTask(id: number, values: TaskFormValues & { status?: string }): Promise<Task> {
  try {
    const taskData = {
      title: values.title,
      description: values.description,
      assignedToId: Number.parseInt(values.assignedToId),
      farmId: Number.parseInt(values.farmId),
      plotId: values.plotId ? Number.parseInt(values.plotId) : null,
      rowId: values.rowId ? Number.parseInt(values.rowId) : null,
      dueDate: values.dueDate,
      priority: values.priority,
      type: values.type,
      status: values.status || undefined,
      updatedAt: new Date(),
    }

    const result = await db.update(tasks).set(taskData).where(eq(tasks.id, id)).returning()

    return taskDbToModel(result[0])
  } catch (error) {
    console.error(`Error updating task with id ${id}:`, error)
    throw new Error(`Failed to update task with id ${id}`)
  }
}

export async function updateTaskStatus(id: number, status: string): Promise<Task> {
  try {
    const result = await db
      .update(tasks)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning()

    return taskDbToModel(result[0])
  } catch (error) {
    console.error(`Error updating status for task with id ${id}:`, error)
    throw new Error(`Failed to update status for task with id ${id}`)
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id })

    return result.length > 0
  } catch (error) {
    console.error(`Error deleting task with id ${id}:`, error)
    throw new Error(`Failed to delete task with id ${id}`)
  }
}

// Helper function to convert database task to model task
function taskDbToModel(dbTask: any): Task {
  return {
    id: dbTask.id.toString(),
    title: dbTask.title,
    description: dbTask.description,
    assignedToId: dbTask.assignedToId.toString(),
    farmId: dbTask.farmId.toString(),
    plotId: dbTask.plotId ? dbTask.plotId.toString() : undefined,
    rowId: dbTask.rowId ? dbTask.rowId.toString() : undefined,
    dueDate: dbTask.dueDate.toISOString(),
    status: dbTask.status,
    priority: dbTask.priority,
    type: dbTask.type,
    dateCreated: dbTask.dateCreated.toISOString(),
  }
}
