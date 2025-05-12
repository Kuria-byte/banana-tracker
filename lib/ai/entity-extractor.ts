// File: /lib/ai/entity-extractor.ts
import { EntityMap, Intent } from "@/lib/types/intent";

// List of known locations from your database 
const KNOWN_LOCATIONS = [
  "kirinyaga", "nairobi", "mombasa", "nakuru", "kisumu", "eastlands"
];

const PLOT_STATUSES = ["active", "inactive", "harvested", "planted", "empty"];
const TASK_STATUSES = ["pending", "in progress", "completed"];
const HEALTH_STATUSES = ["good", "average", "poor"];
const PRIORITIES = ["high", "medium", "low"];

export function extractEntities(question: string, intent: Intent): EntityMap {
  const entities: EntityMap = {};
  const lowerQuestion = question.toLowerCase();

  // Extract farm IDs using different patterns
  const farmPatterns = [
    /farm\s+(\d+)/i,
    /farm\s+id\s*[:=]?\s*(\d+)/i,
    /farm\s*#\s*(\d+)/i
  ];
  
  for (const pattern of farmPatterns) {
    const match = question.match(pattern);
    if (match && match[1]) {
      entities.farmId = parseInt(match[1], 10);
      break;
    }
  }
  
  // Extract plot IDs
  const plotPatterns = [
    /plot\s+(\d+)/i,
    /plot\s+id\s*[:=]?\s*(\d+)/i,
    /plot\s*#\s*(\d+)/i
  ];
  
  for (const pattern of plotPatterns) {
    const match = question.match(pattern);
    if (match && match[1]) {
      entities.plotId = parseInt(match[1], 10);
      break;
    }
  }
  
  // Extract location
  for (const location of KNOWN_LOCATIONS) {
    if (lowerQuestion.includes(location.toLowerCase())) {
      entities.location = location;
      break;
    }
  }
  
  // Extract status
  for (const status of PLOT_STATUSES) {
    if (lowerQuestion.includes(status.toLowerCase())) {
      entities.status = status.toUpperCase();
      break;
    }
  }

  // Extract task status for TASKS_BY_LOCATION intent
  if (intent === "TASKS_BY_LOCATION" || intent === "TASK_SUMMARY") {
    for (const status of TASK_STATUSES) {
      if (lowerQuestion.includes(status.toLowerCase().replace(" ", "")) || 
          lowerQuestion.includes(status.toLowerCase())) {
        entities.status = status.toUpperCase().replace(" ", "_");
        break;
      }
    }
    
    // Extract priority - Add this section to fix the error
    for (const priority of PRIORITIES) {
      if (lowerQuestion.includes(priority.toLowerCase())) {
        entities.priority = priority.toUpperCase();
        break;
      }
    }
  }
  
  // Extract health status for FARM_HEALTH intent - Add this section to fix the error
  if (intent === "FARM_HEALTH") {
    for (const status of HEALTH_STATUSES) {
      if (lowerQuestion.includes(status.toLowerCase())) {
        entities.healthStatus = status.toUpperCase();
        break;
      }
    }
  }
  
  // Extract time period for forecasts
  const timePatterns = [
    { regex: /(\d+)\s*days?/i, unit: "days" },
    { regex: /(\d+)\s*weeks?/i, unit: "weeks" },
    { regex: /(\d+)\s*months?/i, unit: "months" }
  ];
  
  for (const pattern of timePatterns) {
    const match = lowerQuestion.match(pattern.regex);
    if (match && match[1]) {
      entities.months = convertToMonths(parseInt(match[1], 10), pattern.unit);
      break;
    }
  }
  
  return entities;
}

// Helper to convert different time units to months for forecast queries
function convertToMonths(value: number, unit: string): number {
  switch (unit) {
    case "days": return Math.ceil(value / 30);
    case "weeks": return Math.ceil(value / 4);
    case "months": return value;
    default: return value;
  }
}