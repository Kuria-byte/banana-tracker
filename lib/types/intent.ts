// File: /lib/types/intent.ts

export type Intent = 
  | "NEXT_HARVEST" 
  | "TASKS_BY_LOCATION" 
  | "PLOT_STATUS" 
  | "FORECAST" 
  | "FARM_HEALTH" 
  | "TASK_SUMMARY" 
  | "UNKNOWN";

  export interface EntityMap {
    farmId?: number;
    plotId?: number;
    location?: string;
    status?: string;
    months?: number;
    farmName?: string;
    priority?: string; // Add this missing property
    healthStatus?: string; // Add this missing property
  }

export interface IntentResult {
  intent: Intent;
  entities: EntityMap;
  confidence?: number;
}

export interface AssistantResponse {
  success: boolean;
  response: string;
  debug?: {
    intent: Intent;
    entities: EntityMap;
  }
}