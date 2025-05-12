// File: /app/actions/assistant-actions.ts
'use server'

import { db } from "@/db/client";
import { 
  farms, tasks, plots, harvestRecords, 
  farmHealthMetrics, weatherRecords, sales, expenses,
  users as usersTable, // Correctly reference the user table
  growthRecords as growthRecordsTable, // Avoid circular reference
  farmInspections, inspectionMetrics
} from "@/db/schema";
import { and, eq, gte, like, lte, desc, or, inArray, sql, count, sum, avg } from "drizzle-orm";
import { EntityMap, Intent, AssistantResponse } from "@/lib/types/intent";
import { geminiModel } from '@/lib/ai/gemini-client';

/**
 * Query the database based on the identified intent and entities
 */
export async function queryDatabaseByIntent(
  intent: Intent, 
  entities: EntityMap, 
  userId: number
): Promise<any> {
  try {
    console.log(`Processing intent: ${intent} with entities:`, entities);
    
    switch (intent) {
      case "NEXT_HARVEST":
        return await getNextHarvest(entities.farmId, entities.plotId);
        
      case "TASKS_BY_LOCATION":
        return await getTasksByLocation(entities.location, entities.status);
        
      case "PLOT_STATUS":
        return await getPlotStatus(entities.plotId);
        
      case "FORECAST":
        return await getForecast(entities.months || 3, entities.farmId);
        
      case "FARM_HEALTH":
        return await getFarmHealth(entities.farmId);
        
      case "TASK_SUMMARY":
        return await getTaskSummary(userId);
        
      default:
        return { message: "Unknown intent" };
    }
  } catch (error) {
    console.error("Error querying database by intent:", error);
    throw error;
  }
}

/**
 * Formats response based on intent and data
 */
export async function formatAssistantResponse(
  intent: Intent, 
  data: any, 
  originalQuestion: string
): Promise<string> {
  if (!data) {
    return "I couldn't find any information related to your question.";
  }

  switch (intent) {
    case "NEXT_HARVEST":
      return formatHarvestResponse(data);
    
    case "TASKS_BY_LOCATION":
      return formatTasksResponse(data);
    
    case "PLOT_STATUS":
      return formatPlotStatusResponse(data);
    
    case "FORECAST":
      return formatForecastResponse(data);
    
    case "FARM_HEALTH":
      return formatFarmHealthResponse(data);
    
    case "TASK_SUMMARY":
      return formatTaskSummaryResponse(data);
    
    default:
      return "I'm not sure how to answer that question yet. Try asking about harvests, tasks, plot status, or forecasts.";
  }
}

/**
 * Format response for next harvest information
 */
function formatHarvestResponse(data: any): string {
  if (!data.nextHarvest) {
    return "I don't see any upcoming harvests scheduled. You might need to update your growth records.";
  }

  const { expectedDate, plotName, farmName, estimatedYield, readiness, daysUntilHarvest } = data.nextHarvest;
  const date = new Date(expectedDate).toLocaleDateString('en-KE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric' 
  });

  let response = `Your next harvest is expected on ${date} at ${plotName} on ${farmName}. `;
  
  if (estimatedYield) {
    response += `The estimated yield is ${estimatedYield} kg. `;
  }
  
  if (daysUntilHarvest !== undefined) {
    response += `That's about ${daysUntilHarvest} days from now. `;
  }
  
  if (readiness) {
    response += `The crops are ${readiness}% ready. `;
  }
  
  if (data.lastHarvest) {
    const lastDate = new Date(data.lastHarvest.harvestDate).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long'
    });
    response += `\n\nYour last harvest was on ${lastDate} with a yield of ${data.lastHarvest.weight || 'unknown'} kg.`;
  }
  
  if (data.recommendations && data.recommendations.length > 0) {
    response += `\n\nRecommendations before harvest:\n${data.recommendations.map((r: string, i: number) => `${i+1}. ${r}`).join('\n')}`;
  }
  
  return response;
}

/**
 * Format response for tasks by location
 */
function formatTasksResponse(data: any): string {
  if (!data.tasks || data.tasks.length === 0) {
    return `I don't see any ${data.status ? data.status.toLowerCase() : ""} tasks in ${data.location || "that location"}.`;
  }

  const location = data.location.charAt(0).toUpperCase() + data.location.slice(1);
  let response = `Here are the ${data.tasks.length} ${data.status ? data.status.toLowerCase() : ""} tasks in ${location}:\n\n`;
  
  data.tasks.forEach((task: any, index: number) => {
    response += `${index + 1}. ${task.title}`;
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate).toLocaleDateString('en-KE');
      response += ` (due: ${dueDate})`;
    }
    if (task.priority) {
      response += ` [${task.priority}]`;
    }
    response += '\n';
  });
  
  // Add summary information
  if (data.taskSummary) {
    response += `\nTask distribution: `;
    if (data.taskSummary.priorityCount) {
      response += `${data.taskSummary.priorityCount.HIGH || 0} high priority, `;
      response += `${data.taskSummary.priorityCount.MEDIUM || 0} medium priority, `;
      response += `${data.taskSummary.priorityCount.LOW || 0} low priority. `;
    }
    
    if (data.taskSummary.overdue > 0) {
      response += `⚠️ ${data.taskSummary.overdue} tasks are overdue.`;
    }
  }

  return response;
}

/**
 * Format response for plot status with recommendations
 */
function formatPlotStatusResponse(data: any): string {
  if (!data.plot) {
    return "I couldn't find information about that plot.";
  }

  const { plot, healthMetrics, growthStats, tasks } = data;
  
  let response = `Status of ${plot.name}:\n\n`;
  
  // Basic info
  response += `Located on: ${plot.farmName || 'Unknown farm'}\n`;
  response += `Size: ${plot.area || 'Unknown'} acres\n`;
  
  // Health status
  if (healthMetrics) {
    response += `Health: ${healthMetrics.status || 'Unknown'} `;
    if (healthMetrics.score !== undefined) {
      response += `(${healthMetrics.score}/100)\n`;
    }
    
    if (healthMetrics.score !== undefined && healthMetrics.score < 50) {
      response += `⚠️ Farm health score is concerning and needs attention.\n`;
    }
  }
  
  // Growth stats
  if (growthStats) {
    response += `Plants: ${growthStats.totalPlants || 'Unknown'} `;
    if (growthStats.healthyPercent !== undefined) {
      response += `(${growthStats.healthyPercent}% healthy)\n`;
    } else {
      response += '\n';
    }
    
    if (growthStats.expectedYield) {
      response += `Expected Yield: ${growthStats.expectedYield} kg\n`;
    }
    
    if (growthStats.plantingDate) {
      const plantingDate = new Date(growthStats.plantingDate).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      response += `Planted on: ${plantingDate}\n`;
    }
  }
  
  response += '\n';
  
  // Recommendations
  response += "Recommendations:\n";
  if (data.recommendations && data.recommendations.length > 0) {
    data.recommendations.forEach((rec: string, index: number) => {
      response += `${index + 1}. ${rec}\n`;
    });
  } else {
    response += "No specific recommendations at this time.\n";
  }
  
  // Pending tasks
  if (tasks && tasks.length > 0) {
    const pendingTasks = tasks.filter((t: any) => t.status !== "COMPLETED");
    if (pendingTasks.length > 0) {
      response += `\nPending Tasks (${pendingTasks.length}):\n`;
      pendingTasks.slice(0, 3).forEach((task: any, index: number) => {
        response += `- ${task.title}\n`;
      });
      if (pendingTasks.length > 3) {
        response += `- ... and ${pendingTasks.length - 3} more tasks\n`;
      }
    }
  }
  
  return response;
}

/**
 * Format response for forecast data
 */
function formatForecastResponse(data: any): string {
  const { months, harvests, revenue, expenses, weather } = data;
  
  let response = `Here's your ${months}-month forecast:\n\n`;
  
  // Harvests
  if (harvests) {
    response += `Expected Harvests: ${harvests.count || 'Unknown'} harvests`;
    if (harvests.totalYield) {
      response += ` totaling approximately ${harvests.totalYield} kg\n`;
    } else {
      response += '\n';
    }
  }
  
  // Financial
  if (revenue !== undefined && expenses !== undefined) {
    const profit = revenue - expenses;
    response += `Projected Revenue: KES ${revenue.toLocaleString()}\n`;
    response += `Projected Expenses: KES ${expenses.toLocaleString()}\n`;
    response += `Projected Profit: KES ${profit.toLocaleString()}\n\n`;
  }
  
  // Weather if available
  if (weather) {
    response += `Weather Outlook: ${weather.description || 'No data available'}\n`;
    if (weather.risks && weather.risks.length > 0) {
      response += `Weather Risks: ${weather.risks.join(', ')}\n`;
    }
  }
  
  // Top recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    response += `\nRecommendations for the next ${months} months:\n`;
    data.recommendations.forEach((rec: string, index: number) => {
      if (index < 3) response += `${index + 1}. ${rec}\n`;
    });
  }
  
  return response;
}

/**
 * Format response for farm health metrics
 */
function formatFarmHealthResponse(data: any): string {
  const { farm, metrics, history } = data;
  
  let response = `Health Report for ${farm?.name || 'your farm'}:\n\n`;
  
  // Current metrics
  if (metrics) {
    response += `Current Health Score: ${metrics.totalScore || 'Unknown'}/100 `;
    if (metrics.status) {
      response += `(${metrics.status})\n\n`;
    } else {
      response += '\n\n';
    }
  
    // Breakdown of metrics
    response += "Metric Breakdown:\n";
    const breakdown = [
      { name: "Watering", score: metrics.watering, max: 4 },
      { name: "Weeding", score: metrics.weeding, max: 2 },
      { name: "Desuckering", score: metrics.desuckering, max: 2 },
      { name: "Deleafing", score: metrics.deleafing, max: 1 },
      { name: "Pest Control", score: metrics.pestControl, max: 2 }
    ];
    
    breakdown.forEach(item => {
      if (item.score !== undefined) {
        const percentage = (item.score / item.max) * 100;
        let indicator = "";
        
        if (percentage < 50) {
          indicator = "⚠️ "; // Warning
        } else if (percentage === 100) {
          indicator = "✅ "; // Perfect
        }
        
        response += `${indicator}${item.name}: ${item.score}/${item.max}\n`;
      }
    });
  }
  
  // Trend
  if (history && history.trend) {
    response += `\nTrend: ${history.trend} `;
    if (history.changePercent !== undefined) {
      response += `(${history.changePercent}% ${history.improving ? "improvement" : "decline"} over last month)\n`;
    } else {
      response += '\n';
    }
  }
  
  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    response += `\nTop Recommendations:\n`;
    data.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
      response += `${index + 1}. ${rec}\n`;
    });
  }
  
  return response;
}

/**
 * Format response for task summary
 */
function formatTaskSummaryResponse(data: any): string {
  const { total, pending, completed, overdue, highPriority } = data;
  
  let response = "Task Summary:\n\n";
  
  if (total !== undefined) {
    response += `Total Tasks: ${total}\n`;
    response += `Pending: ${pending || 0} tasks\n`;
    response += `Completed: ${completed || 0} tasks\n`;
  }
  
  if (overdue > 0) {
    response += `⚠️ Overdue: ${overdue} tasks\n`;
  }
  
  if (highPriority > 0) {
    response += `🔴 High Priority: ${highPriority} tasks\n`;
  }
  
  // Most urgent tasks
  if (data.urgentTasks && data.urgentTasks.length > 0) {
    response += `\nMost Urgent Tasks:\n`;
    data.urgentTasks.forEach((task: any, index: number) => {
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-KE') : "No due date";
      response += `${index + 1}. ${task.title} (Due: ${dueDate})\n`;
    });
  }
  
  return response;
}

/**
 * Get information about the next expected harvest
 */
async function getNextHarvest(farmId?: number, plotId?: number) {
  try {
    // Find plants that are approaching harvest stage
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    // Build query conditions
    let conditions = and(
      gte(growthRecordsTable.recordDate, today),
      lte(growthRecordsTable.recordDate, threeMonthsFromNow),
      eq(growthRecordsTable.stage, 'Fruiting')
    );
    
    if (farmId) {
      conditions = and(conditions, eq(growthRecordsTable.farmId, farmId));
    }
    
    if (plotId) {
      conditions = and(conditions, eq(growthRecordsTable.plotId, plotId));
    }
    
    // Query for plants approaching harvest
    const upcomingHarvests = await db.select({
      id: growthRecordsTable.id,
      farmId: growthRecordsTable.farmId,
      plotId: growthRecordsTable.plotId,
      recordDate: growthRecordsTable.recordDate,
      farmName: farms.name,
      plotName: plots.name,
    })
    .from(growthRecordsTable)
    .leftJoin(farms, eq(growthRecordsTable.farmId, farms.id))
    .leftJoin(plots, eq(growthRecordsTable.plotId, plots.id))
    .where(conditions)
    .orderBy(growthRecordsTable.recordDate)
    .limit(5);
    
    // Look for past harvests to estimate yield
    const pastHarvests = await db.select({
      id: harvestRecords.id,
      harvestDate: harvestRecords.harvestDate,
      weight: harvestRecords.weight,
      plotId: harvestRecords.plotId,
      farmId: harvestRecords.farmId,
    })
    .from(harvestRecords)
    .orderBy(desc(harvestRecords.harvestDate))
    .limit(5);
    
    // Calculate estimated yield based on past harvests
    const avgYield = pastHarvests.length > 0 
      ? pastHarvests.reduce((sum, h) => sum + (Number(h.weight) || 0), 0) / pastHarvests.length
      : 500; // Default estimate if no past data
    
    if (upcomingHarvests.length === 0) {
      // If no upcoming harvests found, provide an estimate based on current growth stages
      const latestGrowthRecords = await db.select({
        id: growthRecordsTable.id,
        stage: growthRecordsTable.stage,
        farmId: growthRecordsTable.farmId,
        plotId: growthRecordsTable.plotId,
        recordDate: growthRecordsTable.recordDate,
        farmName: farms.name,
        plotName: plots.name,
      })
      .from(growthRecordsTable)
      .leftJoin(farms, eq(growthRecordsTable.farmId, farms.id))
      .leftJoin(plots, eq(growthRecordsTable.plotId, plots.id))
      .where(
        farmId ? eq(growthRecordsTable.farmId, farmId) : undefined
      )
      .orderBy(desc(growthRecordsTable.recordDate))
      .limit(10);
      
      // Check for growth stage to estimate readiness
      let readiness = 0;
      if (latestGrowthRecords.length > 0) {
        const stageToReadiness: Record<string, number> = {
          'Planted': 0,
          'Early Growth': 20,
          'Vegetative': 40,
          'Flowering': 60,
          'Fruiting': 80,
          'Ready to Harvest': 95,
        };
        
        // Use the most recent record to estimate readiness
        const mostRecent = latestGrowthRecords[0];
        readiness = stageToReadiness[mostRecent.stage || ''] || 0;
        
        // Estimate days until harvest based on readiness
        const daysUntilHarvest = Math.round((100 - readiness) / 100 * 90); // Assuming 90 days from planting to harvest
        
        // Estimate harvest date
        const estimatedHarvestDate = new Date();
        estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + daysUntilHarvest);
        
        return {
          nextHarvest: {
            expectedDate: estimatedHarvestDate,
            plotName: mostRecent.plotName || `Plot ${mostRecent.plotId}`,
            farmName: mostRecent.farmName || `Farm ${mostRecent.farmId}`,
            estimatedYield: avgYield,
            readiness,
            daysUntilHarvest,
          },
          lastHarvest: pastHarvests.length > 0 ? pastHarvests[0] : null,
          recommendations: [
            "Monitor plant health closely as harvest approaches",
            "Ensure proper support for plants with heavy fruit",
            "Prepare harvesting equipment and storage facilities",
          ]
        };
      }
    }
    
    // If we found upcoming harvests, use the first one
    if (upcomingHarvests.length > 0) {
      const next = upcomingHarvests[0];
      const daysUntilHarvest = Math.round((next.recordDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        nextHarvest: {
          expectedDate: next.recordDate,
          plotName: next.plotName || `Plot ${next.plotId}`,
          farmName: next.farmName || `Farm ${next.farmId}`,
          estimatedYield: avgYield,
          readiness: 80, // Assuming 'Fruiting' stage is about 80% ready
          daysUntilHarvest,
        },
        lastHarvest: pastHarvests.length > 0 ? pastHarvests[0] : null,
        recommendations: [
          "Schedule harvesting team for the estimated date",
          "Ensure proper support for plants with heavy fruit",
          "Prepare harvesting equipment and storage facilities",
        ]
      };
    }
    
    // Fallback if no data found
    return {
      nextHarvest: {
        expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        plotName: plotId ? `Plot ${plotId}` : "Main Plot",
        farmName: farmId ? `Farm ${farmId}` : "Your Farm",
        estimatedYield: avgYield,
        readiness: 50,
        daysUntilHarvest: 30,
      },
      recommendations: [
        "Update growth records to get more accurate harvest predictions",
        "Consider scheduling regular growth stage recordings",
      ]
    };
  } catch (error) {
    console.error("Error getting next harvest:", error);
    return { message: "Error retrieving harvest information" };
  }
}

/**
 * Get tasks filtered by location (regionCode or farm location)
 */
async function getTasksByLocation(location?: string, status?: string) {
  try {
    if (!location) {
      return { message: "Location is required" };
    }
    
    // Try to find farms matching the location
    const matchingFarms = await db.select()
      .from(farms)
      .where(
        or(
          like(farms.location, `%${location}%`),
          like(farms.regionCode, `%${location}%`)
        )
      );
    
    if (matchingFarms.length === 0) {
      return { message: `No farms found in ${location}` };
    }
    
    // Get farm IDs
    const farmIds = matchingFarms.map(farm => farm.id);
    
    // Query tasks for these farms
    let conditions = inArray(tasks.farmId, farmIds);
    
    // Add status filter if provided
    if (status) {
      if (status === 'PENDING' || status === 'IN_PROGRESS' || status === 'COMPLETED') {
        conditions = and(conditions, eq(tasks.status, status));
      }
    }
    
    const taskResults = await db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      farmId: tasks.farmId,
      farmName: farms.name,
      assigneeName: usersTable.name,
    })
    .from(tasks)
    .leftJoin(farms, eq(tasks.farmId, farms.id))
    .leftJoin(usersTable, eq(tasks.assigneeId, usersTable.id))
    .where(conditions)
    .orderBy(tasks.dueDate);
    
    // Count tasks by priority
    const priorityCounts = {
      HIGH: taskResults.filter(t => t.priority === 'HIGH').length,
      MEDIUM: taskResults.filter(t => t.priority === 'MEDIUM').length,
      LOW: taskResults.filter(t => t.priority === 'LOW').length,
    };
    
    // Count overdue tasks
    const today = new Date();
    const overdueTasks = taskResults.filter(t => 
      t.status !== 'COMPLETED' && 
      t.dueDate && 
      new Date(t.dueDate) < today
    ).length;
    
    return {
      location,
      status,
      tasks: taskResults,
      taskSummary: {
        priorityCount: priorityCounts,
        overdue: overdueTasks,
      }
    };
  } catch (error) {
    console.error("Error getting tasks by location:", error);
    return { message: "Error retrieving tasks" };
  }
}

/**
 * Get comprehensive status of a specific plot with recommendations
 */
async function getPlotStatus(plotId?: number) {
  try {
    if (!plotId) {
      return { message: "Plot ID is required" };
    }
    
    // Get plot details
    const plotDetails = await db.select({
      id: plots.id,
      name: plots.name,
      farmId: plots.farmId,
      farmName: farms.name,
      area: plots.area,
      plantedDate: plots.plantedDate,
      cropType: plots.cropType,
      status: plots.status,
      plantCount: plots.plantCount,
      layoutStructure: plots.layoutStructure,
    })
    .from(plots)
    .leftJoin(farms, eq(plots.farmId, farms.id))
    .where(eq(plots.id, plotId))
    .limit(1);
    
    if (plotDetails.length === 0) {
      return { message: `Plot ${plotId} not found` };
    }
    
    const plot = plotDetails[0];
    const farmId = plot.farmId;
    
    // Get health metrics for the farm
    const healthMetrics = await db.select()
      .from(farmHealthMetrics)
      .where(eq(farmHealthMetrics.farmId, farmId))
      .orderBy(desc(farmHealthMetrics.metricDate))
      .limit(1);
    
    // Get pending tasks for the plot
    const pendingTasks = await db.select()
      .from(tasks)
      .where(
        and(
          eq(tasks.plotId, plotId),
          eq(tasks.status, "PENDING")
        )
      );
    
    // Get growth records for the plot
    const growthRecords = await db.select()
      .from(growthRecordsTable)
      .where(eq(growthRecordsTable.plotId, plotId))
      .orderBy(desc(growthRecordsTable.recordDate))
      .limit(20);
    
    // Count plants by health status if available in layout
    let healthyPlants = 0;
    let totalPlants = 0;
    
    if (plot.layoutStructure && typeof plot.layoutStructure === 'object') {
      try {
        const layout = plot.layoutStructure as any[];
        
        for (const row of layout) {
          if (row.holes && Array.isArray(row.holes)) {
            for (const hole of row.holes) {
              if (hole.status === 'PLANTED') {
                totalPlants++;
                if (hole.plantHealth === 'Healthy') {
                  healthyPlants++;
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Error parsing layout structure:", e);
      }
    }
    
    // Calculate growth statistics
    const healthyPercent = totalPlants > 0 ? Math.round((healthyPlants / totalPlants) * 100) : 0;
    
    // Generate recommendations based on health metrics and tasks
    const recommendations = [];
    
    if (healthMetrics.length > 0) {
      const health = healthMetrics[0];
      
      if (health.watering !== null && health.watering !== undefined && health.watering < 3) {
        recommendations.push("Increase watering frequency to improve plant health");
      }
      
      if (health.weeding !== null && health.weeding !== undefined && health.weeding < 1) {
        recommendations.push("Schedule weeding in the next week");
      }
      
      if (health.pestControl !== null && health.pestControl !== undefined && health.pestControl < 1) {
        recommendations.push("Perform pest inspection and apply control measures");
      }
    }
    
    // Add task-based recommendations
    if (pendingTasks.length > 3) {
      recommendations.push(`Complete the ${pendingTasks.length} pending tasks to improve farm productivity`);
    }
    
    // Add growth stage based recommendations
    const stageCount: Record<string, number> = {};
    growthRecords.forEach(record => {
      const stage = record.stage || 'Unknown';
      stageCount[stage] = (stageCount[stage] || 0) + 1;
    });
    
    if (stageCount['Fruiting'] > 0) {
      recommendations.push("Some plants are fruiting - prepare for upcoming harvest");
    }
    
    if (stageCount['Flowering'] > 0) {
      recommendations.push("Flowering plants need adequate nutrients - consider fertilization");
    }
    
    return {
      plot,
      healthMetrics: healthMetrics.length > 0 ? healthMetrics[0] : { status: "UNKNOWN", score: 0 },
      growthStats: {
        totalPlants: totalPlants || plot.plantCount || 0,
        healthyPlants,
        healthyPercent,
        expectedYield: totalPlants * 25, // Rough estimate: 25kg per plant
        plantingDate: plot.plantedDate,
      },
      tasks: pendingTasks,
      recommendations
    };
  } catch (error) {
    console.error("Error getting plot status:", error);
    return { message: "Error retrieving plot status" };
  }
}

/**
 * Generate a forecast for the coming months
 */
async function getForecast(months: number, farmId?: number) {
  try {
    // Create base condition that's always valid (true)
    let farmCondition = sql`1 = 1`; 
    
    // Add farm filter if farmId is provided
    if (farmId) {
      farmCondition = and(
        farmCondition,
        eq(harvestRecords.farmId, farmId)
      );
    }
    
    // Use farmCondition in queries
    const pastHarvests = await db.select({
      id: harvestRecords.id,
      farmId: harvestRecords.farmId,
      plotId: harvestRecords.plotId,
      harvestDate: harvestRecords.harvestDate,
      quantity: harvestRecords.quantity,
      weight: harvestRecords.weight,
    })
    .from(harvestRecords)
    .where(farmCondition)
    .orderBy(harvestRecords.harvestDate)
    .limit(10);

    // Use same pattern for other queries
    const pastSales = await db.select({
      id: sales.id,
      farmId: sales.farmId,
      date: sales.date,
      totalAmount: sales.totalAmount,
      quantity: sales.quantity,
    })
    .from(sales)
    .where(farmCondition)
    .orderBy(sales.date)
    .limit(10);

    const pastExpenses = await db.select({
      id: expenses.id,
      farmId: expenses.farmId,
      date: expenses.date,
      amount: expenses.amount,
    })
    .from(expenses)
    .where(farmCondition)
    .orderBy(expenses.date)
    .limit(10);

    // Calculate average yield per harvest
    const avgYieldPerHarvest = pastHarvests.length > 0
      ? pastHarvests.reduce((sum, h) => sum + (Number(h.weight) || 0), 0) / pastHarvests.length
      : 500; // Default
    
    // Calculate average revenue per kg
    const totalRevenue = pastSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const totalQuantity = pastSales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
    const avgRevenuePerKg = totalQuantity > 0 ? totalRevenue / totalQuantity : 50; // Default 50 KES per kg
    
    // Calculate average expenses per month
    const avgExpensesPerMonth = pastExpenses.length > 0
      ? pastExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) / (pastExpenses.length > 3 ? 3 : 1)
      : 20000; // Default
    
    // Calculate expected harvests per month (based on growth cycle)
    const harvestsPerMonth = 0.5; // Assuming an average of 0.5 harvests per month per farm
    
    // Generate forecast
    const expectedHarvests = harvestsPerMonth * months;
    const expectedYield = expectedHarvests * avgYieldPerHarvest;
    const expectedRevenue = expectedYield * avgRevenuePerKg;
    const expectedExpenses = avgExpensesPerMonth * months;
    
    // Weather forecast (simplified)
    const weatherForecasts = [
      { month: 'May', description: 'Moderate rainfall expected, good for growth' },
      { month: 'June', description: 'Dry conditions, increased irrigation needed' },
      { month: 'July', description: 'Mild temperatures, moderate rainfall' },
      { month: 'August', description: 'Warmer temperatures, less rainfall' },
      { month: 'September', description: 'Short rains beginning, good growth conditions' },
    ];
    
    // Get current month index
    const currentMonthIndex = new Date().getMonth(); // 0-11
    
    // Get relevant weather forecasts for the requested months
    const relevantWeather = [];
    for (let i = 0; i < months; i++) {
      const monthIndex = (currentMonthIndex + i) % 12;
      const month = new Date(2024, monthIndex, 1).toLocaleString('default', { month: 'long' });
      
      // Find matching forecast or use default
      const forecast = weatherForecasts.find(w => w.month === month) || 
                      { month, description: 'Typical seasonal conditions expected' };
      
      relevantWeather.push(forecast);
    }
    
    // Generate recommendations based on weather and financial forecast
    const recommendations = [];
    
    // Financial recommendations
    if (expectedRevenue > expectedExpenses * 1.5) {
      recommendations.push("Strong profit potential - consider reinvesting in farm expansion");
    } else if (expectedRevenue < expectedExpenses * 1.2) {
      recommendations.push("Profit margins are tight - focus on reducing expenses and improving yield");
    }
    
    // Weather-based recommendations
    if (relevantWeather.some(w => w.description.includes('dry'))) {
      recommendations.push("Prepare irrigation systems for upcoming dry periods");
    }
    
    if (relevantWeather.some(w => w.description.includes('rainfall'))) {
      recommendations.push("Ensure proper drainage systems are maintained for rainy periods");
    }
    
    // General seasonal recommendations
    recommendations.push("Schedule regular health checks for plants throughout the forecast period");
    recommendations.push("Plan harvest labor availability based on expected harvest timeline");
    
    return {
      months,
      harvests: {
        count: Math.round(expectedHarvests),
        totalYield: Math.round(expectedYield),
      },
      revenue: Math.round(expectedRevenue),
      expenses: Math.round(expectedExpenses),
      weather: {
        description: relevantWeather.map(w => `${w.month}: ${w.description}`).join('; '),
        risks: relevantWeather
          .filter(w => w.description.includes('dry') || w.description.includes('heavy rainfall'))
          .map(w => `${w.month}: ${w.description}`),
      },
      recommendations
    };
  } catch (error) {
    console.error("Error generating forecast:", error);
    return { message: "Error creating forecast" };
  }
}

/**
 * Get farm health metrics
 */
async function getFarmHealth(farmId?: number) {
  try {
    if (!farmId) {
      return { message: "Farm ID is required" };
    }
    
    // Get farm details
    const farmDetails = await db.select()
      .from(farms)
      .where(eq(farms.id, farmId))
      .limit(1);
    
    if (farmDetails.length === 0) {
      return { message: `Farm ${farmId} not found` };
    }
    
    // Get current health metrics
    const currentMetrics = await db.select()
      .from(farmHealthMetrics)
      .where(eq(farmHealthMetrics.farmId, farmId))
      .orderBy(desc(farmHealthMetrics.metricDate))
      .limit(1);
    
    // Get farm inspections
    const inspections = await db.select()
      .from(farmInspections)
      .where(eq(farmInspections.farmId, farmId))
      .orderBy(desc(farmInspections.inspectionDate))
      .limit(5);
    
    // Get previous month's metrics for comparison
    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);
    
    const previousMetrics = await db.select()
      .from(farmHealthMetrics)
      .where(
        and(
          eq(farmHealthMetrics.farmId, farmId),
          lte(farmHealthMetrics.metricDate, previousDate)
        )
      )
      .orderBy(desc(farmHealthMetrics.metricDate))
      .limit(1);
    
    // Calculate trend
    let trend = "stable";
    let changePercent = 0;
    let improving = false;
    
    if (currentMetrics.length > 0 && previousMetrics.length > 0) {
      const current = currentMetrics[0].totalScore;
      const previous = previousMetrics[0].totalScore;
      
      if (current !== undefined && current !== null && 
          previous !== undefined && previous !== null) {
        changePercent = Math.round(((current - previous) / (previous || 1)) * 100);
        improving = changePercent > 0;
        
        if (changePercent > 5) {
          trend = "improving";
        } else if (changePercent < -5) {
          trend = "declining";
        }
      }
    }
    
    // Generate recommendations based on metrics
    const recommendations = [];
    
    if (currentMetrics.length > 0) {
      const metrics = currentMetrics[0];
      
      if (metrics.watering !== undefined && metrics.watering !== null && metrics.watering < 3) {
        recommendations.push("Implement a better irrigation schedule");
      }
      
      if (metrics.weeding !== undefined && metrics.weeding !== null && metrics.weeding < 2) {
        recommendations.push("Perform thorough weeding across the farm");
      }
      
      if (metrics.pestControl !== undefined && metrics.pestControl !== null && metrics.pestControl < 2) {
        recommendations.push("Apply pest control measures");
      }
      
      if (metrics.propping !== undefined && metrics.propping !== null && metrics.propping < 1) {
        recommendations.push("Support plants with props to prevent falling");
      }
    }
    
    // Add recommendations based on inspections
    if (inspections.length > 0) {
      const latestInspection = inspections[0];
      if (latestInspection.score !== undefined && latestInspection.score !== null && latestInspection.score < 60) {
        recommendations.push("Address issues highlighted in the last farm inspection");
      }
    }
    
    return {
      farm: farmDetails[0],
      metrics: currentMetrics.length > 0 ? currentMetrics[0] : { totalScore: 0, status: "UNKNOWN" },
      inspections: inspections.map(i => ({
        date: i.inspectionDate,
        score: i.score,
        notes: i.notes,
      })),
      history: {
        trend,
        changePercent,
        improving
      },
      recommendations
    };
  } catch (error) {
    console.error("Error getting farm health:", error);
    return { message: "Error retrieving farm health data" };
  }
}

/**
 * Get task summary for a user
 */
async function getTaskSummary(userId: number) {
  try {
    // Get all tasks assigned to user
    const allTasks = await db.select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      farmId: tasks.farmId,
      farmName: farms.name,
      plotId: tasks.plotId,
      plotName: plots.name,
    })
    .from(tasks)
    .leftJoin(farms, eq(tasks.farmId, farms.id))
    .leftJoin(plots, eq(tasks.plotId, plots.id))
    .where(eq(tasks.assigneeId, userId));
    
    // Count by status
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === "PENDING").length;
    const inProgress = allTasks.filter(t => t.status === "IN_PROGRESS").length;
    const completed = allTasks.filter(t => t.status === "COMPLETED").length;
    
    // Count special cases
    const today = new Date();
    const overdue = allTasks.filter(t => 
      t.status !== "COMPLETED" && 
      t.dueDate && 
      new Date(t.dueDate) < today
    ).length;
    
    const highPriority = allTasks.filter(t => 
      t.status !== "COMPLETED" && 
      t.priority === "HIGH"
    ).length;
    
    // Get most urgent tasks
    const urgentTasks = allTasks
      .filter(t => t.status !== "COMPLETED")
      .sort((a, b) => {
        // First by priority
        const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const aPriority = a.priority ? priorityOrder[a.priority as string] || 3 : 3;
        const bPriority = b.priority ? priorityOrder[b.priority as string] || 3 : 3;
        const priorityDiff = aPriority - bPriority;
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        return 0;
      })
      .slice(0, 5); // Top 5 most urgent
    
    // Get tasks by farm
    const tasksByFarm = allTasks.reduce((acc: Record<string, number>, task) => {
      const farmName = task.farmName || `Farm ${task.farmId}`;
      acc[farmName] = (acc[farmName] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      highPriority,
      urgentTasks,
      tasksByFarm
    };
  } catch (error) {
    console.error("Error getting task summary:", error);
    return { message: "Error retrieving task information" };
  }
}

export async function enhancedFormatResponse(
  intent: any,
  data: any,
  originalQuestion: string
): Promise<string> {
  // Get base response from existing function
  const baseResponse = await formatAssistantResponse(intent, data, originalQuestion);
  return enhanceResponseWithGemini(baseResponse, originalQuestion);
}

async function enhanceResponseWithGemini(baseResponse: string, originalQuestion: string): Promise<string> {
  const prompt = `
    Original question: ${originalQuestion}
    Base response: ${baseResponse}
    Please enhance this response to be more conversational and helpful. 
    Keep all the factual information intact, but make it more engaging.
    Format the response with proper Markdown for better readability.
  `;
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}