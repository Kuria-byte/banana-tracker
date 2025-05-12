'use server'

import { processQuery, type UserMessage, type AssistantMessage } from '@/lib/ai/assistant-service';
import { saveConversation, getConversationHistory } from '@/db/repositories/conversation-repository';

export async function processUserQuery(
  query: string,
  userId: number
): Promise<AssistantMessage> {
  try {
    const assistantMessage = await processQuery(query, userId);

    // Save user message
    await saveConversation(userId, {
      role: 'user',
      content: query,
      timestamp: new Date(),
    });

    // Save assistant message
    await saveConversation(userId, {
      role: 'assistant',
      content: assistantMessage.content,
      timestamp: assistantMessage.timestamp,
      metadata: {
        intent: assistantMessage.intent,
        entities: assistantMessage.entities,
      },
    });

    return assistantMessage;
  } catch (error) {
    console.error('Error in processUserQuery:', error);
    return {
      content: "I'm sorry, I encountered an error. Please try again.",
      timestamp: new Date(),
    };
  }
}

export async function getUserConversation(userId: number) {
  return getConversationHistory(userId);
} 