// app/assistant/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserConversation } from '@/app/actions/ai-assistant-actions';
import { stackServerApp } from "@/stack";
import { getUserByEmail } from '@/db/repositories/user-repository';
import { getConversationHistory } from '@/db/repositories/conversation-repository';
import { Badge } from "@/components/ui/badge";
import AssistantChat from '@/components/assistant/assistant-chat';
import AssistantHelp from '@/components/assistant/assistant-help';
import ChatSkeleton from '@/components/assistant/chat-skeleton';

export const metadata: Metadata = {
  title: 'Farm Assistant | Banana Tracker',
  description: 'AI-powered assistant for managing your banana farms'
};

export default async function AssistantPage() {
  // Get the current user from Stack Auth
  const user = await stackServerApp.getUser();
  if (!user || !user.primaryEmail) {
    return <div className="p-8 text-center text-red-600">You must be signed in to use the assistant.</div>;
  }
  // Look up DB user by email
  const dbUser = await getUserByEmail(user.primaryEmail);
  if (!dbUser) {
    return <div className="p-8 text-center text-red-600">No database user found for your account.</div>;
  }
  // Fetch initial conversation history (optional)
  const initialMessages = await getConversationHistory(dbUser.id, 20);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Farm Assistant</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
              Beta
            </Badge>
          </div>
          <p className="text-gray-600 md:max-w-xl text-center md:text-left">
            Your AI-powered farming companion. Get answers about your farms, tasks, and harvests.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <div className="bg-green-50 text-green-700 text-sm rounded-full px-3 py-1 border border-green-100">
            Powered by Google Gemini
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-6 grid grid-cols-2">
          <TabsTrigger value="chat" className="rounded-l-full data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Chat
          </TabsTrigger>
          <TabsTrigger value="help" className="rounded-r-full data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Resources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="focus-visible:outline-none focus-visible:ring-0">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Suspense fallback={<ChatSkeleton />}>
              <AssistantChat initialMessages={initialMessages} userId={dbUser.id} />
            </Suspense>
          </div>
        </TabsContent>
        
        <TabsContent value="help" className="focus-visible:outline-none focus-visible:ring-0">
          <AssistantHelp />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Have feedback? <a href="#" className="text-green-600 hover:underline">Let us know</a> how we can improve the assistant.</p>
      </div>
    </div>
  );
}