// File: /app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { detectIntent } from "@/lib/ai/intent-detector";
import { buildAndExecuteQuery } from "@/lib/ai/query-builder";
import { formatResponse } from "@/lib/ai/response-formatter";
import { AssistantResponse } from "@/lib/types/intent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          response: "Please provide a valid question.",
        },
        { status: 400 }
      );
    }
    
    console.log(`Processing assistant question: "${question}"`);
    
    // Detect intent and extract entities
    const { intent, entities, confidence } = detectIntent(question);
    
    console.log(`Detected intent: ${intent}, confidence: ${confidence}`, entities);
    
    // If confidence is too low, respond accordingly
    if (confidence && confidence < 0.4) {
      return NextResponse.json({
        success: true,
        response: "I'm not sure I understand your question. Could you try rephrasing it? For example, you can ask about your next harvest, tasks in a location, or the status of a specific plot.",
        debug: { intent, entities }
      });
    }
    
    // Build and execute the query
    const queryResult = await buildAndExecuteQuery(intent, entities);
    
    // Format the response
    const responseMessage = queryResult.message || formatResponse({
      data: queryResult.data,
      intent,
      entities,
      error: queryResult.error
    });
    
    // Return the response
    return NextResponse.json({
      success: true,
      response: responseMessage,
      debug: { intent, entities, data: queryResult.data }
    });
  } catch (error) {
    console.error("Error in assistant API:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        response: "Sorry, something went wrong while processing your question. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}