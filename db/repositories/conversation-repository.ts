import { db } from "../client";
import { assistantConversations, assistantMessages } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function getOrCreateConversation(userId: number) {
  // Try to get the most recent conversation for the user
  const [conversation] = await db
    .select()
    .from(assistantConversations)
    .where(eq(assistantConversations.userId, userId))
    .orderBy(desc(assistantConversations.createdAt))
    .limit(1);

  if (conversation) return conversation;

  // Create a new conversation if none exists
  const [newConversation] = await db
    .insert(assistantConversations)
    .values({ userId })
    .returning();
  return newConversation;
}

export async function saveConversation(userId: number, message: {
  role: 'user' | 'assistant',
  content: string,
  timestamp: Date,
  metadata?: any,
}) {
  const conversation = await getOrCreateConversation(userId);
  await db.insert(assistantMessages).values({
    conversationId: conversation.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    metadata: message.metadata || null,
  });
}

export async function getConversationHistory(userId: number) {
  const conversation = await getOrCreateConversation(userId);
  const messages = await db
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.conversationId, conversation.id))
    .orderBy(assistantMessages.timestamp);
  return messages;
} 