import "dotenv/config";
import { db } from "../db/client"
import { tasks, taskStatusEnum, taskPriorityEnum } from "../db/schema"

async function migrateTasks() {
  try {
    console.log("Starting task data migration...")

    // Example task data (replace or extend as needed)
    const tasksToInsert = [
      {
        title: "Inspect pest-affected rows",
        description: "Inspect and report on pest-affected rows in Karii East Farm.",
        farmId: 1, // Make sure farm with id=1 exists
        status: "PENDING" as "PENDING",
        priority: "HIGH" as "HIGH",
        dueDate: new Date(),
        assigneeId: 1, // Make sure user with id=1 exists
        creatorId: 1,
      },
      {
        title: "Apply fertilizer to Kangai West Farm",
        description: "Apply NPK fertilizer to all plots in Kangai West Farm.",
        farmId: 2,
        status: "IN_PROGRESS" as "IN_PROGRESS",
        priority: "MEDIUM" as "MEDIUM",
        dueDate: new Date(),
        assigneeId: 1,
        creatorId: 1,
      },
    ];

    // Insert tasks into the database
    const inserted = await db.insert(tasks).values(tasksToInsert).returning();
    console.log(`Successfully migrated ${inserted.length} tasks.`);
  } catch (error) {
    console.error("Task data migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateTasks();
