import { db } from "../client";
import { assistantConversations, assistantMessages } from "../schema";
import { eq, desc, asc } from "drizzle-orm";

export async function getOrCreateConversation(userId: number) {
  let conv = await db.select().from(assistantConversations).where(eq(assistantConversations.userId, userId)).orderBy(desc(assistantConversations.createdAt)).limit(1);
  if (!conv || conv.length === 0) {
    // Create new conversation
    const inserted = await db.insert(assistantConversations).values({ userId }).returning();
    return inserted[0];
  }
  return conv[0];
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

export async function getConversationHistory(userId: number, limit: number = 20) {
  // Find the user's latest conversation
  const conv = await db.select().from(assistantConversations).where(eq(assistantConversations.userId, userId)).orderBy(desc(assistantConversations.createdAt)).limit(1);
  if (!conv || conv.length === 0) return [];
  const conversationId = conv[0].id;
  // Get the latest N messages, ordered ascending
  const messages = await db.select().from(assistantMessages).where(eq(assistantMessages.conversationId, conversationId)).orderBy(asc(assistantMessages.timestamp)).limit(limit);
  return messages.map(m => ({
    content: m.content,
    timestamp: m.timestamp,
    role: m.role,
  }));
}

export async function saveAssistantMessage(userId: number, role: 'user' | 'assistant', content: string, timestamp: Date | string) {
  const conv = await getOrCreateConversation(userId);
  await db.insert(assistantMessages).values({
    conversationId: conv.id,
    role,
    content,
    timestamp: new Date(timestamp),
  });
} 