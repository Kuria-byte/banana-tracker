// File: /lib/ai/response-formatter.ts
import { Intent, EntityMap } from "@/lib/types/intent";

interface ResponseOptions {
  data: any;
  intent: Intent;
  entities: EntityMap;
  message?: string;
  error?: string;
}

export function formatResponse(options: ResponseOptions): string {
  // If there's an error, return it
  if (options.error) {
    return `Sorry, I encountered an error: ${options.error}`;
  }
  
  // If a message was provided, use it
  if (options.message) {
    return options.message;
  }
  
  // Otherwise format a response based on the intent and data
  switch (options.intent) {
    case "NEXT_HARVEST":
      return formatHarvestResponse(options.data, options.entities);
    
    case "TASKS_BY_LOCATION":
      return formatTasksResponse(options.data, options.entities);
    
    case "PLOT_STATUS":
      return formatPlotStatusResponse(options.data, options.entities);
    
    case "FORECAST":
      return formatForecastResponse(options.data, options.entities);
    
    case "FARM_HEALTH":
      return formatFarmHealthResponse(options.data, options.entities);
    
    case "TASK_SUMMARY":
      return formatTaskSummaryResponse(options.data, options.entities);
    
    default:
      return "I'm not sure how to answer that question. Could you try rephrasing it?";
  }
}

function formatHarvestResponse(data: any, entities: EntityMap): string {
  if (!data) {
    return "I couldn't find any harvest information for your query.";
  }
  
  // If the query-builder has already provided a formatted message, use it
  if (data.message) {
    return data.message;
  }
  
  if (data.nextHarvest) {
    const harvest = data.nextHarvest;
    const plot = harvest.plot;
    
    let response = "";
    
    if (entities.plotId) {
      response = `Plot ${entities.plotId}`;
    } else if (entities.farmId) {
      response = `The next harvest at farm ${entities.farmId}`;
    } else {
      response = "The next harvest";
    }
    
    response += ` is expected around ${harvest.estimatedHarvestDate.toLocaleDateString()}, in ${harvest.daysUntilHarvest} days.`;
    
    if (data.upcomingHarvests && data.upcomingHarvests.length > 1) {
      response += ` After that, you have ${data.upcomingHarvests.length - 1} more harvests scheduled in the coming months.`;
    }
    
    return response;
  }
  
  if (data.plot) {
    return `Plot ${data.plot.id} (${data.plot.name}) is expected to be ready for harvest around ${data.estimatedHarvestDate.toLocaleDateString()}.`;
  }
  
  return "I couldn't find specific harvest information. Please check your farm records for the most accurate harvest dates.";
}

function formatTasksResponse(data: any[], entities: EntityMap): string {
  if (!data || data.length === 0) {
    let response = "I couldn't find any tasks";
    
    if (entities.location) {
      response += ` in ${entities.location}`;
    }
    
    if (entities.status) {
      response += ` with status ${entities.status.replace('_', ' ').toLowerCase()}`;
    }
    
    return response + ".";
  }
  
  let response = `I found ${data.length} tasks`;
  
  if (entities.location) {
    response += ` in ${entities.location}`;
  }
  
  if (entities.status) {
    response += ` with status ${entities.status.replace('_', ' ').toLowerCase()}`;
  }
  
  if (data.length <= 3) {
    response += ": " + data.map(task => `"${task.title}" (${task.status?.toLowerCase() || "pending"})`).join(", ");
  }
  
  return response;
}

function formatPlotStatusResponse(data: any, entities: EntityMap): string {
  if (!data || !data.plot) {
    return `I couldn't find status information for plot ${entities.plotId || "specified"}.`;
  }
  
  const plot = data.plot;
  
  let response = `Plot ${plot.id} (${plot.name}) is currently ${plot.status?.toLowerCase() || "active"}.`;
  
  if (data.daysSincePlanting) {
    response += ` It was planted ${data.daysSincePlanting} days ago and is in the ${data.growthStage} stage.`;
  }
  
  if (data.totalPlants) {
    response += ` The plot has ${data.totalPlants} plants, with ${data.healthyPlants} healthy plants`;
    
    if (data.diseasedPlants > 0) {
      response += ` and ${data.diseasedPlants} plants showing signs of disease or damage`;
    }
    
    response += ".";
  }
  
  return response;
}

function formatForecastResponse(data: any, entities: EntityMap): string {
  if (!data) {
    return "I couldn't generate a forecast based on your query.";
  }
  
  if (!data.upcomingHarvests || data.upcomingHarvests.length === 0) {
    return `There are no harvests forecasted in the next ${data.forecastMonths || 3} month${(data.forecastMonths || 3) === 1 ? '' : 's'}.`;
  }
  
  let response = `For the next ${data.forecastMonths || 3} month${(data.forecastMonths || 3) === 1 ? '' : 's'}, I forecast `;
  
  if (entities.farmId) {
    response += `for farm ${entities.farmId} `;
  }
  
  response += `${data.upcomingHarvests.length} potential harvest${data.upcomingHarvests.length === 1 ? '' : 's'}. `;
  
  if (data.harvestsByMonth) {
    const monthlyBreakdown = Object.entries(data.harvestsByMonth).map(([monthKey, harvests]: [string, any]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
      return `${harvests.length} in ${monthName}`;
    }).join(', ');
    
    response += `Monthly breakdown: ${monthlyBreakdown}.`;
  }
  
  return response;
}

function formatFarmHealthResponse(data: any, entities: EntityMap): string {
  if (!data) {
    return "I couldn't find health information based on your query.";
  }
  
  if (data.farm) {
    // Single farm health
    const farm = data.farm;
    const healthScore = data.healthScore || farm.healthScore || 0;
    const healthStatus = data.healthStatus || farm.healthStatus || "AVERAGE";
    
    let response = `Farm ${farm.id} (${farm.name}) has a health score of ${healthScore}/100, which is rated as ${healthStatus.toLowerCase()}.`;
    
    // Add recommendations based on health status
    if (healthStatus === "POOR") {
      response += " I recommend an immediate inspection to address issues with watering, weeding, pest control, and overall plant health.";
    } else if (healthStatus === "AVERAGE") {
      response += " Regular maintenance is needed, particularly focusing on propping, desuckering, and pest control to improve health.";
    } else { // GOOD
      response += " The farm is doing well, but regular inspections should be maintained to ensure continued health.";
    }
    
    return response;
  }
  
  if (data.farms) {
    // Multiple farms health summary
    const avgScore = data.averageScore || 0;
    const farmsByHealth = data.farmsByHealth || {};
    
    let response = `Overall farm health: ${avgScore}/100. `;
    response += `You have ${farmsByHealth["GOOD"] || 0} farms in good health, ${farmsByHealth["AVERAGE"] || 0} in average health, and ${farmsByHealth["POOR"] || 0} in poor health.`;
    
    return response;
  }
  
  return "I couldn't find specific health information for your query.";
}

function formatTaskSummaryResponse(data: any, entities: EntityMap): string {
  if (!data) {
    return "I couldn't find task summary information based on your query.";
  }
  
  let response = "";
  
  if (entities.farmId) {
    const farmName = data.tasksByFarm?.[entities.farmId.toString()]?.name || `Farm ${entities.farmId}`;
    response = `Task summary for ${farmName}: `;
    const count = data.tasksByFarm?.[entities.farmId.toString()]?.count || 0;
    
    if (entities.status === "PENDING") {
      response += `${count} pending tasks`;
    } else if (entities.status === "IN_PROGRESS") {
      response += `${count} tasks in progress`;
    } else if (entities.status === "COMPLETED") {
      response += `${count} completed tasks`;
    } else {
      response += `${count} total tasks`;
    }
  } else {
    response = "Overall task summary: ";
    
    if (entities.status === "PENDING") {
      response += `${data.pendingTasks || 0} pending tasks`;
      if (data.overdueTasks) {
        response += ` (${data.overdueTasks} overdue)`;
      }
    } else if (entities.status === "IN_PROGRESS") {
      response += `${data.inProgressTasks || 0} tasks in progress`;
    } else if (entities.status === "COMPLETED") {
      response += `${data.completedTasks || 0} completed tasks`;
    } else {
      response += `${data.totalTasks || 0} total tasks (${data.pendingTasks || 0} pending, ${data.inProgressTasks || 0} in progress, ${data.completedTasks || 0} completed)`;
    }
    
    if (data.highPriority !== undefined) {
      response += `. Priority breakdown: ${data.highPriority} high, ${data.mediumPriority} medium, ${data.lowPriority} low`;
    }
  }
  
  return response;
}