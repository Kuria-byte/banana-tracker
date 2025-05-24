import { buildSchemaContext } from "./schema-context";
import { generateSQLQuery } from "./sql-generator";
import { validateSQL } from "./sql-validator";
import { executeSafeQuery } from "./safe-query-executor";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processAIQuery(question: string, userId: number): Promise<string> {
  try {
    const schemaContext = buildSchemaContext(userId);
    const { query, explanation, confidence } = await generateSQLQuery(question, userId, schemaContext);
    
    if (confidence < 0.5) {
      return "I'm not confident I can answer that question accurately. Could you try rephrasing it?";
    }

    // Use new validateSQL and executeSafeQuery
    const validation = validateSQL(query, true);
    if (!validation.valid) {
      return "I couldn't generate a safe query for your question.";
    }
    const execResult = await executeSafeQuery(query, userId);
    if (execResult.error) {
      return `Sorry, there was an error running the query: ${execResult.error}`;
    }
    const results = execResult.rows || [];
    // Let AI analyze the actual data and provide intelligent response
    const response = await formatQueryResponse(question, results, explanation, userId);
    return response;
  } catch (error) {
    return "I encountered an error processing your question. Please try again.";
  }
}

export async function formatQueryResponse(question: string, results: any[], explanation: string, userId: number): Promise<string> {
  const prompt = `
Original question: ${question}
Query explanation: ${explanation}
Results: ${JSON.stringify(results, null, 2)}
User ID: ${userId}

Analyze the data and provide a helpful, conversational response. Include:
1. Direct answer to the question
2. Key insights from the data
3. Relevant recommendations if applicable

Keep it concise but informative.
`;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return `Based on your question "${question}", I found ${results.length} results. ${explanation}`;
  }
}