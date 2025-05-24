'use server'

import { processAIQuery } from '@/lib/ai/assistant-service';
import { saveConversation, getConversationHistory, saveAssistantMessage } from '@/db/repositories/conversation-repository';
import { buildSchemaContext } from "@/lib/ai/schema-context";
import { generateSQLFromQuestion } from "@/lib/ai/gemini-sql-generator";
import { validateSQL } from "@/lib/ai/sql-validator";
import { executeSafeQuery } from "@/lib/ai/safe-query-executor";
import { formatAIResponse } from "@/lib/ai/ai-response-formatter";

export async function processUserQuery(message: string, userId: number) {
  // 1. Build schema context
  const schema = buildSchemaContext(userId);

  // 2. Generate SQL from user question
  let sql: string;
  try {
    sql = await generateSQLFromQuestion(message, schema);
    console.log("[AI Assistant] Generated SQL:", sql);
  } catch (err) {
    await saveAssistantMessage(userId, 'user', message, new Date());
    await saveAssistantMessage(userId, 'assistant', "Sorry, I couldn't generate a query for your question.", new Date());
    return {
      content: "Sorry, I couldn't generate a query for your question.",
      timestamp: new Date().toISOString(),
    };
  }

  // 3. Validate SQL
  const validation = validateSQL(sql, true);
  if (!validation.valid) {
    await saveAssistantMessage(userId, 'user', message, new Date());
    await saveAssistantMessage(userId, 'assistant', `Sorry, the generated query was not safe: ${validation.reason}`, new Date());
    return {
      content: `Sorry, the generated query was not safe: ${validation.reason}`,
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Execute query
  const execResult = await executeSafeQuery(sql, userId);
  if (execResult.error) {
    await saveAssistantMessage(userId, 'user', message, new Date());
    await saveAssistantMessage(userId, 'assistant', `Sorry, there was an error running the query: ${execResult.error}`, new Date());
    return {
      content: `Sorry, there was an error running the query: ${execResult.error}`,
      timestamp: new Date().toISOString(),
    };
  }

  // 5. Format response
  let answer: string;
  try {
    answer = await formatAIResponse(message, sql, execResult.rows || []);
  } catch (err) {
    answer = "Sorry, I couldn't format the answer.";
  }

  // 6. Save messages
  await saveAssistantMessage(userId, 'user', message, new Date());
  await saveAssistantMessage(userId, 'assistant', answer, new Date());

  // 7. Return answer
  return {
    content: answer,
    timestamp: new Date().toISOString(),
  };
}

export async function getUserConversation(userId: number) {
  return getConversationHistory(userId);
} 