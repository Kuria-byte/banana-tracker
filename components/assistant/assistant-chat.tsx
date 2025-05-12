// components/assistant/assistant-chat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Send, Sparkles, AlertCircle, HelpCircle, Banana, 
  RefreshCw, Settings, Maximize2, Minimize2, Volume2, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { processUserQuery } from '@/app/actions/ai-assistant-actions';
import type { UserMessage, AssistantMessage } from '@/lib/ai/assistant-service';
import { toast } from '@/components/ui/use-toast';
import type { Intent } from '@/lib/types/intent';
import { motion, AnimatePresence } from 'framer-motion';

type ChatFormValues = { message: string };

// Suggested queries based on capabilities
const SUGGESTED_QUERIES = [
  { text: "How many farms do I have?", category: "farms" },
  { text: "What health issues are common in my farms?", category: "health" },
  { text: "How many plots are healthy?", category: "plots" },
  { text: "When is my next harvest?", category: "harvest" },
  { text: "What tasks are pending this week?", category: "tasks" },
  { text: "Show me the health report for all plots", category: "health" },
  { text: "Count my total banana plants", category: "inventory" },
  { text: "Which farm has the best yield?", category: "performance" }
];

export default function AssistantChat({
  initialMessages = [],
  userId,
}: {
  initialMessages: (UserMessage | AssistantMessage)[];
  userId: number;
}) {
  const [messages, setMessages] = useState<(UserMessage | AssistantMessage)[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(initialMessages.length === 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setValue, setFocus, getValues, trigger } = useForm<ChatFormValues>();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Set focus on input on load
  useEffect(() => {
    setFocus("message");
  }, [setFocus]);

  // Add welcome message for new users
  useEffect(() => {
    if (initialMessages.length === 0 && messages.length === 0) {
      setMessages([{
        content: "👋 Welcome to the Farm Assistant! I'm here to help you manage your banana farms more effectively. You can ask me about your farms, plots, tasks, growth tracking, harvests, and more. What would you like to know today?",
        timestamp: new Date(),
        intent: undefined as Intent | undefined // Use undefined for welcome
      }]);
    }
  }, [initialMessages.length, messages.length]);

  async function onSubmit(data: { message: string }) {
    if (!data.message.trim()) return;
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Add user message to UI
      const userMessage: UserMessage = {
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // Get response from AI
      const assistantMessage = await processUserQuery(data.message, userId);
      setMessages((prev) => [...prev, assistantMessage]);
      setErrorCount(0); // Reset error count on success
      
      reset();
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages((prev) => [...prev, {
        content: `I'm sorry, I encountered an error processing your request. ${errorCount > 0 ? "Let me suggest trying a simpler question or checking your connection." : "Please try again."}`,
        timestamp: new Date(),
        intent: undefined as Intent | undefined // Use undefined for error
      }]);
      setErrorCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuggestionClick(query: string) {
    setValue('message', query);
    // Submit the form programmatically
    trigger('message').then((isValid) => {
      if (isValid) {
        handleSubmit(onSubmit)();
      }
    });
  }

  function clearConversation() {
    setMessages([{
      content: "I've cleared our conversation. How can I help you today?",
      timestamp: new Date(),
      intent: undefined as Intent | undefined // Use undefined for welcome
    }]);
    setErrorCount(0);
    reset();
    toast({
      title: "Conversation cleared",
      description: "All previous messages have been removed.",
    });
  }

  function renderMessage(message: UserMessage | AssistantMessage, index: number) {
    const isAssistant = 'intent' in message;
    const intentValue = (message as AssistantMessage).intent as string | undefined;
    const isError = isAssistant && intentValue === 'ERROR';
    const isWelcome = isAssistant && intentValue === 'WELCOME';
    
    return (
      <motion.div 
        key={index} 
        className={`mb-6 ${isAssistant ? '' : 'text-right'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`inline-flex max-w-[85%] ${isAssistant ? 'flex-row items-start' : 'flex-row-reverse items-end'}`}>
          {isAssistant && (
            <div className="mr-3 mt-1">
              <Avatar className={`ring-2 ${isError ? 'ring-red-100' : isWelcome ? 'ring-green-100' : 'ring-green-50'}`}> 
                <AvatarImage src="/assistant-avatar.png" alt="Assistant" />
                <AvatarFallback className="bg-green-500 text-white">
                  <Banana className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          <div className={`rounded-xl px-4 py-3 shadow-sm ${
            isAssistant 
              ? isError 
                ? 'bg-red-50 text-red-800 border border-red-100' 
                : isWelcome
                  ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border border-green-100'
                  : 'bg-white border border-gray-100 shadow-sm'
              : 'bg-gradient-to-br from-green-600 to-green-700 text-white'
          }`}>
            {isAssistant ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  children={DOMPurify.sanitize(message.content)}
                  // @ts-ignore
                  skipHtml={false}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />, 
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />, 
                    h3: ({node, ...props}) => <h3 className="text-md font-bold my-1" {...props} />, 
                    p: ({node, ...props}) => <p className="my-2" {...props} />, 
                    ul: ({node, ...props}) => <ul className="my-2 pl-5 list-disc" {...props} />, 
                    ol: ({node, ...props}) => <ol className="my-2 pl-5 list-decimal" {...props} />, 
                    li: ({node, ...props}) => <li className="my-1" {...props} />, 
                    a: ({node, ...props}) => <a className="text-green-700 underline" {...props} />, 
                    code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800" {...props} />, 
                    table: ({node, ...props}) => <table className="min-w-full border-collapse my-2" {...props} />, 
                    tr: ({node, ...props}) => <tr className="border-b border-gray-200" {...props} />, 
                    th: ({node, ...props}) => <th className="px-2 py-1 font-semibold text-left bg-gray-100" {...props} />, 
                    td: ({node, ...props}) => <td className="px-2 py-1" {...props} />, 
                  }}
                />
                
                {isError && (
                  <div className="mt-3 pt-3 border-t border-red-100 flex flex-col gap-2">
                    <span className="text-sm font-medium">Try one of these instead:</span>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSuggestionClick("How many farms do I have?")}
                        className="text-xs border-red-200 text-red-800 hover:bg-red-50"
                      >
                        How many farms do I have?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSuggestionClick("Show tasks due this week")}
                        className="text-xs border-red-200 text-red-800 hover:bg-red-50"
                      >
                        Show tasks due this week
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-50 whitespace-pre-wrap text-sm">
                {message.content}
              </div>
            )}
          </div>
          
          {!isAssistant && (
            <div className="ml-3 mt-1">
              <Avatar className="bg-gray-200 ring-2 ring-green-600">
                <AvatarImage src="/user-avatar.png" alt="You" />
                <AvatarFallback className="bg-green-600 text-white">U</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
        {/* Timestamps */}
        {showTimestamps && (
          <div className={`text-xs text-gray-400 mt-1 ${isAssistant ? 'text-left' : 'text-right'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-[600px]'} rounded-xl overflow-hidden bg-gray-50 relative`}>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-50 to-transparent pointer-events-none z-0"></div>
      {/* Chat header with controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-green-100 text-green-800">
              <Bot className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Farm Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Assistant Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowTimestamps(!showTimestamps)}>
                {showTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearConversation}>
                Clear Conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-muted-foreground text-xs">Beta Version 0.5.2</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-500" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
        <div className="relative z-10 pb-2">          
          {messages.map(renderMessage)}
          {isLoading && (
            <motion.div 
              className="flex items-start gap-3 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Avatar className="ring-2 ring-green-50">
                <AvatarImage src="/assistant-avatar.png" alt="Assistant" />
                <AvatarFallback className="bg-green-500 text-white">
                  <Banana className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse delay-300"></div>
                  <span className="ml-2 text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {showSuggestions && messages.length <= 2 && (
              <motion.div 
                className="mt-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    Try asking about:
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SUGGESTED_QUERIES.slice(0, 4).map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(query.text)}
                        className={`text-xs ${
                          query.category === 'farms' ? 'border-blue-200 text-blue-800 hover:bg-blue-50' :
                          query.category === 'health' ? 'border-red-200 text-red-800 hover:bg-red-50' :
                          query.category === 'plots' ? 'border-purple-200 text-purple-800 hover:bg-purple-50' :
                          query.category === 'harvest' ? 'border-amber-200 text-amber-800 hover:bg-amber-50' :
                          query.category === 'tasks' ? 'border-teal-200 text-teal-800 hover:bg-teal-50' :
                          'border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {query.text}
                      </Button>
                    ))}
                  </div>
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 transition-colors">
                      Show more suggestions...
                    </summary>
                    <div className="pt-3 flex flex-wrap gap-2">
                      {SUGGESTED_QUERIES.slice(4).map((query, index) => (
                        <Button
                          key={index + 4}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(query.text)}
                          className={`text-xs ${
                            query.category === 'farms' ? 'border-blue-200 text-blue-800 hover:bg-blue-50' :
                            query.category === 'health' ? 'border-red-200 text-red-800 hover:bg-red-50' :
                            query.category === 'plots' ? 'border-purple-200 text-purple-800 hover:bg-purple-50' :
                            query.category === 'harvest' ? 'border-amber-200 text-amber-800 hover:bg-amber-50' :
                            query.category === 'tasks' ? 'border-teal-200 text-teal-800 hover:bg-teal-50' :
                            query.category === 'inventory' ? 'border-indigo-200 text-indigo-800 hover:bg-indigo-50' :
                            query.category === 'performance' ? 'border-orange-200 text-orange-800 hover:bg-orange-50' :
                            'border-gray-200 text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {query.text}
                        </Button>
                      ))}
                    </div>
                  </details>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              {...register('message')}
              placeholder="Ask about your farms, plots, harvests, tasks..."
              disabled={isLoading}
              autoComplete="off"
              className="pl-4 pr-10 py-3 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
            />
            {messages.length > 1 && !isLoading && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                onClick={() => setShowSuggestions(true)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            aria-label="Send"
            className="rounded-full h-10 w-10 bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {errorCount > 2 && (
          <div className="mt-3 text-xs text-center">
            <Button 
              variant="link" 
              className="text-gray-500 flex items-center justify-center mx-auto" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 
              Having trouble? Refresh the page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}