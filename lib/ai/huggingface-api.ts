// File: /lib/ai/huggingface-api.ts
import type { Intent } from "@/lib/types/intent";

// Define the Hugging Face API URL and default model
const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_MODEL = "facebook/bart-large-mnli"; // Zero-shot classification model
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN; // Get a free API token from huggingface.co

// Define intent labels for classification
const INTENT_LABELS = [
  "next harvest date",
  "tasks in a specific location",
  "plot status information",
  "future forecast predictions",
  "farm health metrics",
  "task summary",
];

// Map label results to our intent types
const LABEL_TO_INTENT: Record<string, Intent> = {
  "next harvest date": "NEXT_HARVEST",
  "tasks in a specific location": "TASKS_BY_LOCATION",
  "plot status information": "PLOT_STATUS",
  "future forecast predictions": "FORECAST",
  "farm health metrics": "FARM_HEALTH",
  "task summary": "TASK_SUMMARY",
};

/**
 * Classify intent using Hugging Face Inference API (zero-shot classification)
 */
export async function classifyIntent(question: string): Promise<Intent> {
  // Check if we have an API token
  if (!HF_TOKEN) {
    console.warn("No Hugging Face API token found. Falling back to rule-based classification.");
    return fallbackClassification(question);
  }
  
  try {
    const response = await fetch(`${HF_API_URL}/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_TOKEN}`
      },
      body: JSON.stringify({
        inputs: question,
        parameters: {
          candidate_labels: INTENT_LABELS
        }
      }),
      // Add a timeout to handle API rate limits
      signal: AbortSignal.timeout(5000)
    });
    
    // Handle rate limiting
    if (response.status === 429) {
      console.warn("Hugging Face API rate limit reached. Falling back to rule-based classification.");
      return fallbackClassification(question);
    }
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Get the highest scoring label
    const topLabelIndex = result.scores.indexOf(Math.max(...result.scores));
    const topLabel = result.labels[topLabelIndex];
    const confidence = result.scores[topLabelIndex];
    
    // Only use the API result if confidence is reasonable
    if (confidence > 0.4) {
      return LABEL_TO_INTENT[topLabel] || "UNKNOWN";
    }
    
    // Fall back to rule-based if confidence is low
    return fallbackClassification(question);
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return fallbackClassification(question);
  }
}

/**
 * Extract entities using Hugging Face NER model
 */
export async function extractEntities(question: string) {
  // For free tiers, we'll use a simpler regex-based approach
  // This avoids excessive API calls and keeps things free
  return extractEntitiesWithRegex(question);
}

/**
 * Fallback to rule-based classification when API fails or is unavailable
 */
function fallbackClassification(question: string): Intent {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes("harvest") || lowerQuestion.includes("when") && lowerQuestion.includes("ready")) {
    return "NEXT_HARVEST";
  } else if (lowerQuestion.includes("task") && (lowerQuestion.includes("location") || lowerQuestion.includes("where"))) {
    return "TASKS_BY_LOCATION";
  } else if (lowerQuestion.includes("plot") && lowerQuestion.includes("status")) {
    return "PLOT_STATUS";
  } else if (lowerQuestion.includes("forecast") || lowerQuestion.includes("future") || lowerQuestion.includes("predict")) {
    return "FORECAST";
  } else if (lowerQuestion.includes("health") && lowerQuestion.includes("farm")) {
    return "FARM_HEALTH";
  } else if (lowerQuestion.includes("summary") || lowerQuestion.includes("overview") || lowerQuestion.includes("pending")) {
    return "TASK_SUMMARY";
  }
  
  return "UNKNOWN";
}

/**
 * Extract entities using regex patterns
 */
function extractEntitiesWithRegex(question: string) {
  const entities: Record<string, any> = {};
  
  // Extract farm IDs
  const farmMatch = question.match(/farm\s+(\d+)/i);
  if (farmMatch) entities.farmId = parseInt(farmMatch[1]);
  
  // Extract plot IDs
  const plotMatch = question.match(/plot\s+(\d+)/i);
  if (plotMatch) entities.plotId = parseInt(plotMatch[1]);
  
  // Extract locations (simple list of locations in Kenya)
  const locations = ['kirinyaga', 'nairobi', 'mombasa', 'nakuru', 'kisumu', 'eastlands'];
  const foundLocation = locations.find(loc => question.toLowerCase().includes(loc));
  if (foundLocation) entities.location = foundLocation;
  
  // Extract months for forecasting
  const monthsMatch = question.match(/(\d+)\s*months/i);
  if (monthsMatch) entities.months = parseInt(monthsMatch[1]);
  
  // Extract task status
  if (question.toLowerCase().includes("pending")) {
    entities.status = "PENDING";
  } else if (question.toLowerCase().includes("completed")) {
    entities.status = "COMPLETED";
  } else if (question.toLowerCase().includes("in progress")) {
    entities.status = "IN_PROGRESS";
  }
  
  return entities;
}