// File: /lib/ai/query-builder.ts
import { Intent, EntityMap } from "@/lib/types/intent";
import * as farmActions from "@/app/actions/farm-actions";
import * as plotActions from "@/app/actions/plot-actions";
import * as taskActions from "@/app/actions/task-actions";
import * as harvestActions from "@/app/actions/harvest-actions";
import * as growthActions from "@/app/actions/growth-actions";

interface QueryResult {
  data: any;
  message: string;
  error?: string;
}

// Helper function to safely handle plot repository responses
interface PlotActionResponse {
  success: boolean;
  plot?: any;
  plots?: any[];
  error?: string;
}

export async function buildAndExecuteQuery(intent: Intent, entities: EntityMap): Promise<QueryResult> {
  try {
    console.log(`Executing query for intent: ${intent} with entities:`, entities);
    
    switch (intent) {
      case "NEXT_HARVEST":
        return await getNextHarvest(entities);
      
      case "TASKS_BY_LOCATION":
        return await getTasksByLocation(entities);
      
      case "PLOT_STATUS":
        return await getPlotStatus(entities);
        
      case "FORECAST":
        return await getForecast(entities);
        
      case "FARM_HEALTH":
        return await getFarmHealth(entities);
        
      case "TASK_SUMMARY":
        return await getTaskSummary(entities);
      
      default:
        return {
          data: null,
          message: "I don't understand that question. Please try rephrasing or ask about harvests, tasks, plot status, forecasts, or farm health."
        };
    }
  } catch (error) {
    console.error("Query execution error:", error);
    return {
      data: null,
      message: "Sorry, I encountered an error while trying to answer your question.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function getNextHarvest(entities: EntityMap): Promise<QueryResult> {
  try {
    // If we have a specific plot ID, get that plot's data
    if (entities.plotId) {
      // Make sure we pass a number if the function expects it
      const plotId = typeof entities.plotId === 'string' ? parseInt(entities.plotId) : entities.plotId;
      const result = await plotActions.getPlotById(plotId.toString());
      
      // Handle the response properly based on its actual structure
      if (!result.success || !result.plot) {
        return { 
          data: null, 
          message: `I couldn't find information about plot ${entities.plotId}.`
        };
      }
      
      const plot = result.plot;
      
      // Use camelCase property names instead of snake_case
      const plantedDate = new Date(plot.plantedDate);
      const estimatedHarvestDate = new Date(plantedDate);
      estimatedHarvestDate.setMonth(plantedDate.getMonth() + 9);
      
      return {
        data: { 
          plot,
          estimatedHarvestDate
        },
        message: `Plot ${entities.plotId} (${plot.name}) is estimated to be ready for harvest around ${estimatedHarvestDate.toLocaleDateString()}.`
      };
    }
    
    // If we have a farm ID, get all plots for that farm
    if (entities.farmId) {
      // Make sure we pass a number if the function expects it
      const farmId = typeof entities.farmId === 'string' ? parseInt(entities.farmId) : entities.farmId;
      const result = await plotActions.getPlotsByFarmId(farmId);
      
      if (!result.success || !result.plots || result.plots.length === 0) {
        return { 
          data: null, 
          message: `I couldn't find any plots for farm ${entities.farmId}.`
        };
      }
      
      // Find plots with future harvest dates
      const now = new Date();
      const upcomingHarvests = result.plots
        .filter(plot => plot.plantedDate) // Use camelCase property name
        .map(plot => {
          const plantedDate = new Date(plot.plantedDate); // Use camelCase property name
          const estimatedHarvestDate = new Date(plantedDate);
          estimatedHarvestDate.setMonth(plantedDate.getMonth() + 9); // Simple 9-month estimate
          
          return {
            plot,
            estimatedHarvestDate,
            daysUntilHarvest: Math.floor((estimatedHarvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          };
        })
        .filter(item => item.daysUntilHarvest > 0) // Only show future harvests
        .sort((a, b) => a.daysUntilHarvest - b.daysUntilHarvest); // Sort by earliest first
      
      if (upcomingHarvests.length === 0) {
        return {
          data: null,
          message: `There are no upcoming harvests scheduled for farm ${entities.farmId}.`
        };
      }
      
      const nextHarvest = upcomingHarvests[0];
      const otherHarvests = upcomingHarvests.slice(1, 3); // Get the next 2 after the first
      
      // Use farmId property (camelCase) instead of farm_id (snake_case)
      let message = `The next harvest for farm ${entities.farmId} is estimated for plot ${nextHarvest.plot.id} (${nextHarvest.plot.name}) around ${nextHarvest.estimatedHarvestDate.toLocaleDateString()}, in ${nextHarvest.daysUntilHarvest} days.`;
      
      if (otherHarvests.length > 0) {
        message += ` After that, you have harvests scheduled for plots ${otherHarvests.map(h => h.plot.id).join(', ')} in the coming months.`;
      }
      
      return {
        data: {
          nextHarvest,
          upcomingHarvests
        },
        message
      };
    }
    
    // Implement similar fixes for the rest of the function...
  } catch (error) {
    console.error("Error in getNextHarvest:", error);
    return {
      data: null,
      message: "Sorry, I couldn't determine the next harvest date.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Fix the task location function - the issue is with filters and task objects
async function getTasksByLocation(entities: EntityMap): Promise<QueryResult> {
  try {
    // Construct filters based on entities
    const filters: any = {};
    
    if (entities.farmId) {
      filters.farmId = entities.farmId;
    }
    
    if (entities.plotId) {
      filters.plotId = entities.plotId;
    }
    
    if (entities.location) {
      filters.location = entities.location;
    }
    
    if (entities.status) {
      filters.status = entities.status;
    }
    
    // Add this check for the priority property
    if (entities.priority) {
      filters.priority = entities.priority;
    }
    
    // Placeholder: In a real implementation, you'd have a taskActions.getTasksWithFilters function
    // For now, we'll simulate getting all tasks and filtering in memory
    const allTasksResult = { success: true, tasks: [] }; // Replace with actual call 
    
    if (!allTasksResult.success || !allTasksResult.tasks) {
      return {
        data: null,
        message: "I couldn't find any tasks in the system."
      };
    }
    
    // Filter tasks based on entities
    let filteredTasks = allTasksResult.tasks; // Placeholder for filtering logic
    
    if (filteredTasks.length === 0) {
      let noTasksMessage = "I couldn't find any tasks";
      
      if (entities.location) {
        noTasksMessage += ` in ${entities.location}`;
      }
      
      if (entities.status) {
        noTasksMessage += ` with status ${entities.status.replace("_", " ").toLowerCase()}`;
      }
      
      if (entities.priority) {
        noTasksMessage += ` with ${entities.priority.toLowerCase()} priority`;
      }
      
      return {
        data: [],
        message: `${noTasksMessage}.`
      };
    }
    
    let tasksMessage = `I found ${filteredTasks.length} tasks`;
    
    if (entities.location) {
      tasksMessage += ` in ${entities.location}`;
    }
    
    if (entities.status) {
      tasksMessage += ` with status ${entities.status.replace("_", " ").toLowerCase()}`;
    }
    
    if (entities.priority) {
      tasksMessage += ` with ${entities.priority.toLowerCase()} priority`;
    }
    
    // Handle task rendering differently to avoid the 'never' type issue
    if (filteredTasks.length <= 3) {
      tasksMessage += ": " + filteredTasks.map(task => {
        const title = task.title || 'Untitled task';
        const status = task.status ? ` (${task.status.toLowerCase()})` : '';
        return `"${title}"${status}`;
      }).join(", ");
    }
    
    return {
      data: filteredTasks,
      message: tasksMessage
    };
  } catch (error) {
    console.error("Error in getTasksByLocation:", error);
    return {
      data: null,
      message: "Sorry, I couldn't find tasks for that location or criteria.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Fix getPlotStatus to use the correct property names and handle types
async function getPlotStatus(entities: EntityMap): Promise<QueryResult> {
  try {
    if (!entities.plotId) {
      return {
        data: null,
        message: "Please specify which plot you'd like to check the status of."
      };
    }
    
    // Convert plotId to number if needed
    const plotId = typeof entities.plotId === 'string' ? parseInt(entities.plotId) : entities.plotId;
    const result = await plotActions.getPlotById(plotId.toString());
    
    if (!result.success || !result.plot) {
      return {
        data: null,
        message: `I couldn't find information about plot ${entities.plotId}.`
      };
    }
    
    const plot = result.plot;
    
    // Use camelCase property names
    const plantedDate = plot.plantedDate ? new Date(plot.plantedDate) : null;
    const now = new Date();
    const daysSincePlanting = plantedDate ? 
      Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Rest of the function...
    // Make similar fixes throughout the rest of the function
  } catch (error) {
    console.error("Error in getPlotStatus:", error);
    return {
      data: null,
      message: "Sorry, I couldn't determine the status of that plot.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Fix getFarmHealth to handle healthStatus comparisons
async function getFarmHealth(entities: EntityMap): Promise<QueryResult> {
  try {
    // If farm ID is specified, get that farm's health data
    if (entities.farmId) {
      const farmId = typeof entities.farmId === 'string' ? parseInt(entities.farmId) : entities.farmId;
      const result = await farmActions.getFarmById(farmId.toString());
      
      if (!result.success || !result.farm) {
        return {
          data: null,
          message: `I couldn't find information about farm ${entities.farmId}.`
        };
      }
      
      const farm = result.farm;
      
      // Parse health metrics
      const healthScore = farm.healthScore || 0;
      const healthStatus = farm.healthStatus || "AVERAGE";
      
      let healthMessage = `Farm ${farm.id} (${farm.name}) has a health score of ${healthScore}/100, which is rated as ${healthStatus.toLowerCase()}.`;
      
      // Add recommendations based on health status - fix comparisons using toLowerCase()
      if (healthStatus.toLowerCase() === "poor") {
        healthMessage += " I recommend an immediate inspection to address issues with watering, weeding, pest control, and overall plant health.";
      } else if (healthStatus.toLowerCase() === "average") {
        healthMessage += " Regular maintenance is needed, particularly focusing on propping, desuckering, and pest control to improve health.";
      } else { // GOOD
        healthMessage += " The farm is doing well, but regular inspections should be maintained to ensure continued health.";
      }
      
      return {
        data: {
          farm,
          healthScore,
          healthStatus
        },
        message: healthMessage
      };
    }
    
    // Rest of the function...
  } catch (error) {
    console.error("Error in getFarmHealth:", error);
    return {
      data: null,
      message: "Sorry, I couldn't determine the farm health status.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Fix getTaskSummary to handle the tasksByFarm object properly
async function getTaskSummary(entities: EntityMap): Promise<QueryResult> {
  try {
    // Placeholder for task data
    const taskData = {
      totalTasks: 10,
      pendingTasks: 5,
      inProgressTasks: 3,
      completedTasks: 2,
      highPriority: 2,
      mediumPriority: 6,
      lowPriority: 2,
      tasksByFarm: {
        "1": { name: "Kirinyaga Farm", count: 4 },
        "2": { name: "Nairobi Farm", count: 6 }
      },
      overdueTasks: 2
    };
    
    let message = "";
    
    if (entities.farmId) {
      // Convert farmId to string to ensure it's a valid index
      const farmIdStr = entities.farmId.toString();
      // Check if the farm exists in the tasksByFarm object
      const farmData = taskData.tasksByFarm[farmIdStr as keyof typeof taskData.tasksByFarm];
      const farmName = farmData?.name || `Farm ${entities.farmId}`;
      message = `Task summary for ${farmName}: `;
      const count = farmData?.count || 0;
      
      // Rest of the function...
    }
    
    // Rest of the function...
    
    return {
      data: taskData,
      message
    };
  } catch (error) {
    console.error("Error in getTaskSummary:", error);
    return {
      data: null,
      message: "Sorry, I couldn't retrieve the task summary.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}