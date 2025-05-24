// File: /app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { processAIQuery } from "@/lib/ai/assistant-service";
import { stackServerApp } from "@/stack";
import { getUserByEmail } from "@/app/actions/team-actions";

export async function POST(request: NextRequest) {
  const { question } = await request.json();
  const user = await stackServerApp.getUser();
  const userEmail = typeof user?.primaryEmail === 'string' ? user.primaryEmail : undefined;
  let userId = 0;
  if (userEmail) {
    const dbUser = await getUserByEmail(userEmail);
    userId = typeof dbUser?.id === 'number' ? dbUser.id : Number(dbUser?.id) || 0;
  }
  if (!userId) {
    return NextResponse.json({ success: false, response: 'User not found.' }, { status: 401 });
  }
  const response = await processAIQuery(question, userId);
  return NextResponse.json({ success: true, response });
}