import { geminiModel } from './gemini-client';
import type { Intent, EntityMap } from '@/lib/types/intent';
import { queryDatabaseByIntent, formatAssistantResponse } from '@/app/actions/assistant-actions';

export type UserMessage = {
  content: string;
  timestamp: Date;
};

export type AssistantMessage = {
  content: string;
  timestamp: Date;
  intent?: Intent;
  entities?: EntityMap;
};

export async function processQuery(query: string, userId: number): Promise<AssistantMessage> {
  try {
    // 1. Extract intent and entities from user query using Gemini
    const { intent, entities } = await analyzeIntent(query);

    // 2. Query database using existing assistant-actions
    const data = await queryDatabaseByIntent(intent, entities, userId);

    // 3. Format and enhance response
    const baseResponse = await formatAssistantResponse(intent, data, query);
    const responseContent = await enhanceResponseWithGemini(baseResponse, query);

    return {
      content: responseContent,
      timestamp: new Date(),
      intent,
      entities,
    };
  } catch (error) {
    console.error('Error processing query:', error);
    return {
      content: "I'm sorry, I encountered an error. Please try again.",
      timestamp: new Date(),
    };
  }
}

async function analyzeIntent(query: string): Promise<{ intent: Intent; entities: EntityMap }> {
    // Use a more explicit prompt with examples
    const prompt = `
  You are a farm management assistant that analyzes user queries.
  Extract the intent and entities from the following user query.
  
  You must respond with ONLY valid JSON in the following format:
  {
    "intent": "NEXT_HARVEST" | "TASKS_BY_LOCATION" | "PLOT_STATUS" | "FORECAST" | "FARM_HEALTH" | "TASK_SUMMARY",
    "entities": {
      "farmId": number (optional),
      "plotId": number (optional),
      "location": string (optional),
      "status": string (optional),
      "months": number (optional)
    }
  }
  
  Examples:
  1. Query: "When's my next harvest expected?"
     Response: {"intent": "NEXT_HARVEST", "entities": {}}
  
  2. Query: "Show me tasks in Nairobi"
     Response: {"intent": "TASKS_BY_LOCATION", "entities": {"location": "Nairobi"}}
  
  3. Query: "What's the status of plot 3?"
     Response: {"intent": "PLOT_STATUS", "entities": {"plotId": 3}}
  
  Now analyze this query: "${query}"
  Remember to return ONLY valid JSON.
  `;
  
    try {
      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', responseText);
        return {
          intent: 'TASK_SUMMARY', // Default intent
          entities: {}
        };
      }
      
      const jsonStr = jsonMatch[0];
      const json = JSON.parse(jsonStr);
      
      // Validate the intent
      const validIntents = ['NEXT_HARVEST', 'TASKS_BY_LOCATION', 'PLOT_STATUS', 'FORECAST', 'FARM_HEALTH', 'TASK_SUMMARY'];
      if (!validIntents.includes(json.intent)) {
        console.warn(`Invalid intent "${json.intent}" returned, using default`);
        json.intent = 'TASK_SUMMARY';
      }
      
      return {
        intent: json.intent,
        entities: json.entities || {},
      };
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      // Provide a default response rather than throwing
      return {
        intent: 'TASK_SUMMARY',
        entities: {}
      };
    }
  }

  async function enhanceResponseWithGemini(baseResponse: string, originalQuestion: string): Promise<string> {
    try {
      const prompt = `
  You are a helpful farm management assistant responding to a user query.
  
  Original question: "${originalQuestion}"
  
  Base response: "${baseResponse}"
  
  Enhance this response to be more conversational and helpful. 
  Keep all the factual information intact, but make it more engaging.
  Format important information with proper Markdown for better readability.
  Use bullet points, bold, or other formatting as appropriate.
  Do not add any fictional information that wasn't in the original response.
  `;
  
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error('Error enhancing response with Gemini:', e);
      // If enhancement fails, return the original response
      return baseResponse;
    }
  }