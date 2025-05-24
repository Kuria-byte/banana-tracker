import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SchemaContext } from "./schema-context";

function extractJsonFromMarkdown(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  let cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  // If still not valid JSON, try to extract the first {...} block
  if (!cleaned.startsWith('{')) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      cleaned = match[0];
    }
  }
  return cleaned;
}

export async function generateSQLQuery(
  question: string,
  userId: number,
  schemaContext: SchemaContext
): Promise<{ query: string; explanation: string; confidence: number }> {
  const prompt = `
You are a SQL expert for a banana farm management system. Generate a simple, broad SELECT query that will help answer the user's question. Do not assume any specific ownership or filtering unless the question asks for it. Use the schema below for context.

DATABASE SCHEMA:
${JSON.stringify(schemaContext, null, 2)}

RULES:
1. ONLY generate SELECT statements
2. Use JOINs if needed for related data
3. Use LIMIT if the result could be large
4. Use aliases for clarity

QUESTION: ${question}

Respond with JSON:
{
  "query": "SELECT statement here",
  "explanation": "Plain English explanation of what the query does",
  "confidence": 0.95
}

If you cannot generate a safe query, respond with confidence < 0.5 and explain why.
`;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    console.log('[Gemini raw response]', rawText);
    const jsonText = extractJsonFromMarkdown(rawText);
    console.log('[Extracted JSON]', jsonText);
    try {
      const response = JSON.parse(jsonText);
      return {
        query: response.query,
        explanation: response.explanation,
        confidence: response.confidence
      };
    } catch (parseError) {
      // Try to extract the first {...} block and parse again
      const match = rawText.match(/\{[\s\S]*\}/);
      let fallbackJson = '';
      if (match) {
        try {
          fallbackJson = match[0];
          console.log('[Fallback JSON]', fallbackJson);
          const response = JSON.parse(fallbackJson);
          return {
            query: response.query,
            explanation: response.explanation,
            confidence: response.confidence
          };
        } catch (fallbackError) {
          console.error('Fallback JSON parse error:', fallbackError, fallbackJson);
        }
      }
      console.error('JSON parse error:', parseError, jsonText);
      return {
        query: "",
        explanation: "Failed to parse Gemini response as JSON.",
        confidence: 0
      };
    }
  } catch (error) {
    console.error("Error generating SQL:", error);
    return {
      query: "",
      explanation: "Failed to generate query",
      confidence: 0
    };
  }
} 