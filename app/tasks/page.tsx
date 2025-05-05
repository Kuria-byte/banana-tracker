import { getAllTasks } from "@/db/repositories/task-repository"
import TasksClient from "./TasksClient"

export default async function TasksPage() {
  const tasks = await getAllTasks()
  return <TasksClient tasks={tasks} />
}
