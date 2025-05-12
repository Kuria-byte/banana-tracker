// File: /components/ai/farm-assistant-client.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryDatabaseByIntent, formatAssistantResponse } from "@/app/actions/assistant-actions";
import { IntentResult } from "@/lib/types/intent";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TransformersProcessor from "./transformers-processor.tsx";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  intent?: string;
  isThinking?: boolean;
  entities?: Record<string, any>;
}

// Suggested questions to help users get started
const SUGGESTED_QUESTIONS = [
  "When is the next harvest?",
  "What tasks are due in Kirinyaga?",
  "What is the overall status of plot 1?",
  "What is the forecast for the next 3 months?",
  "Show me the health metrics for Eastlands Farm",
  "What are my pending tasks for this week?",
];

interface FarmAssistantClientProps {
  userId: number;
}

export function FarmAssistantClient({ userId }: FarmAssistantClientProps) {
  // State for messages, input, and loading indicators
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your farm assistant. How can I help you manage your banana farm today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle arrow keys for input history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) {
        if (e.key === 'ArrowUp' && queryHistory.length > 0 && historyIndex < queryHistory.length - 1) {
          e.preventDefault();
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(queryHistory[queryHistory.length - 1 - newIndex]);
        }
        
        if (e.key === 'ArrowDown' && historyIndex > 0) {
          e.preventDefault();
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(queryHistory[queryHistory.length - 1 - newIndex]);
        } else if (e.key === 'ArrowDown' && historyIndex === 0) {
          e.preventDefault();
          setHistoryIndex(-1);
          setInput('');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queryHistory, historyIndex]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    // Add to query history
    setQueryHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentQuestion(input);
    setInput("");
    setErrorMessage(null);
    
    // Add thinking message
    setMessages(prev => [
      ...prev,
      {
        id: `thinking-${Date.now()}`,
        content: "Thinking...",
        role: "assistant",
        timestamp: new Date(),
        isThinking: true,
      }
    ]);
    
    // If in fallback mode or after multiple retries, go straight to fallback
    if (fallbackMode || retryCount > 2) {
      handleFallbackProcessing(input);
      return;
    }
  };

  // Handle intent recognition result from Transformers.js
  const handleIntentResult = async (result: IntentResult) => {
    console.log("🧠 Intent recognized:", result);
    try {
      // Use server action to query database with the recognized intent
      const data = await queryDatabaseByIntent(result.intent, result.entities, userId);
      console.log("📊 Database result:", data);
      
      // Format the response based on data and intent
      const responseText = await formatAssistantResponse(
        result.intent, 
        data, 
        currentQuestion
      );
      
      // Remove the thinking message and add the real response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isThinking);
        return [
          ...filteredMessages,
          {
            id: `response-${Date.now()}`,
            content: responseText,
            role: "assistant",
            timestamp: new Date(),
            intent: result.intent,
            entities: result.entities,
          }
        ];
      });
      
      // Reset retry count on success
      setRetryCount(0);
      setCurrentQuestion("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error handling intent result:", error);
      
      // Remove thinking message and add error message
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isThinking);
        return [
          ...filteredMessages,
          {
            id: `error-${Date.now()}`,
            content: "Sorry, I had trouble finding that information. Could you try phrasing your question differently?",
            role: "assistant",
            timestamp: new Date(),
          }
        ];
      });
      
      toast({
        title: "Error retrieving data",
        description: "There was a problem accessing the farm database.",
        variant: "destructive",
      });
      
      setCurrentQuestion("");
      setIsLoading(false);
    }
  };

  // Handle errors from transformers.js
  const handleProcessError = (error: string) => {
    console.error("AI processing error:", error);
    
    // Remove thinking message if it exists
    setMessages(prev => {
      const filteredMessages = prev.filter(msg => !msg.isThinking);
      return filteredMessages;
    });
    
    // Set error message to display in UI
    setErrorMessage(error);
    setRetryCount(prev => prev + 1);
    
    // After 3 retries, switch to fallback mode permanently
    if (retryCount >= 2) {
      setFallbackMode(true);
      toast({
        title: "Switched to simple mode",
        description: "Using basic pattern matching instead of AI model due to errors.",
        variant: "default",
      });
    }
    
    // Try fallback to simple pattern matching
    handleFallbackProcessing(currentQuestion);
  };

  // Handle model loading update
  const handleModelLoadingUpdate = (progress: number) => {
    setModelLoadingProgress(progress);
  };

  // Fallback processing using basic pattern matching
  const handleFallbackProcessing = async (question: string) => {
    // Simple pattern matching for common questions
    let intent: IntentResult["intent"] = "UNKNOWN";
    const entities: IntentResult["entities"] = {};
    const q = question.toLowerCase();
    
    if (q.includes("harvest")) {
      intent = "NEXT_HARVEST";
      // Extract farm ID if present
      const farmMatch = q.match(/farm\s+(\d+)/i);
      if (farmMatch) entities.farmId = parseInt(farmMatch[1]);
    } else if (q.includes("task")) {
      intent = "TASKS_BY_LOCATION";
      // Extract location if present
      const locations = ['kirinyaga', 'nairobi', 'mombasa', 'nakuru', 'kisumu', 'eastlands'];
      const foundLocation = locations.find(loc => q.includes(loc));
      if (foundLocation) entities.location = foundLocation;
      else entities.location = "all";
      
      // Extract status if present
      if (q.includes("pending")) entities.status = "PENDING";
      else if (q.includes("completed")) entities.status = "COMPLETED";
    } else if (q.includes("plot") && (q.includes("status") || q.includes("health"))) {
      intent = "PLOT_STATUS";
      const match = q.match(/plot\s+(\d+)/i);
      if (match) entities.plotId = parseInt(match[1]);
    } else if (q.includes("forecast")) {
      intent = "FORECAST";
      const match = q.match(/(\d+)\s*months/i);
      if (match) entities.months = parseInt(match[1]);
      else entities.months = 3;
      
      // Extract farm ID if present
      const farmMatch = q.match(/farm\s+(\d+)/i);
      if (farmMatch) entities.farmId = parseInt(farmMatch[1]);
    } else if (q.includes("health") && q.includes("farm")) {
      intent = "FARM_HEALTH";
      // Extract farm ID if present
      const farmMatch = q.match(/farm\s+(\d+)/i);
      if (farmMatch) entities.farmId = parseInt(farmMatch[1]);
      else {
        // Try to find farm by name
        const farmNames = ['kirinyaga', 'nairobi', 'mombasa', 'nakuru', 'kisumu', 'eastlands'];
        const foundFarm = farmNames.find(farm => q.includes(farm));
        if (foundFarm) entities.farmName = foundFarm;
      }
    } else if (q.includes("summary") || q.includes("pending") || q.includes("my tasks")) {
      intent = "TASK_SUMMARY";
    }
    
    try {
      // Remove thinking message
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      
      // Add new thinking message
      setMessages(prev => [
        ...prev,
        {
          id: `thinking-simple-${Date.now()}`,
          content: "Processing your question...",
          role: "assistant",
          timestamp: new Date(),
          isThinking: true,
        }
      ]);
      
      const data = await queryDatabaseByIntent(intent, entities, userId);
      const responseText = await formatAssistantResponse(intent, data, question);
      
      // Remove thinking message and add response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isThinking);
        return [
          ...filteredMessages,
          {
            id: `fallback-${Date.now()}`,
            content: responseText,
            role: "assistant",
            timestamp: new Date(),
            intent,
            entities,
          }
        ];
      });
    } catch (error) {
      console.error("Error in fallback processing:", error);
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isThinking);
        return [
          ...filteredMessages,
          {
            id: `fallback-error-${Date.now()}`,
            content: "I couldn't find an answer to your question. Please try asking about harvests, tasks, plots, or farm health.",
            role: "assistant",
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setCurrentQuestion("");
      setIsLoading(false);
    }
  };

  // Handle clicking a suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  // Reset the assistant (clear messages)
  const handleReset = () => {
    setMessages([
      {
        id: "welcome-reset",
        content: "Chat has been reset. How can I help you with your farm management today?",
        role: "assistant",
        timestamp: new Date(),
      }
    ]);
    setErrorMessage(null);
    setFallbackMode(false);
    setRetryCount(0);
    setCurrentQuestion("");
    setIsLoading(false);
  };

  // Handle loading state changes for the model
  const handleLoadingChange = (loading: boolean) => {
    setIsModelLoading(loading);
  };

  return (
    <Card className="w-full mx-auto h-[600px] flex flex-col shadow-sm">
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0 border-b">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Farm Assistant
            {fallbackMode && (
              <Badge variant="outline" className="ml-3 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                Simple Mode
              </Badge>
            )}
          </CardTitle>
          {errorMessage && (
            <div className="text-xs text-amber-600 font-medium flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              AI processing issue: {errorMessage.includes("Failed to load") ? "Model loading error" : "Processing error"}
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleReset}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset conversation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[450px] px-6">
          <div className="space-y-6 pt-6 pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-4",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted"
                )}
              >
                {message.isThinking ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-line">{message.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {message.intent && message.role === 'assistant' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          <Sparkles className="h-2 w-2 mr-1" />
                          {message.intent}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {(isModelLoading && modelLoadingProgress > 0 && modelLoadingProgress < 100) && (
              <div className="mr-auto bg-muted p-4 rounded-lg max-w-[85%]">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Loading AI model ({modelLoadingProgress}%)</p>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${modelLoadingProgress}%` }} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This happens only once and will be cached for future use.
                  </p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          
          {/* Suggested questions (only show after welcome message if no other messages) */}
          {messages.length === 1 && !isLoading && (
            <div className="p-4 mb-6">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 pt-3 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <Input
            ref={inputRef}
            placeholder="Ask a question about your farms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading}
            className="h-10 w-10 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
      
      {/* The invisible AI processor component */}
      {currentQuestion && !fallbackMode && (
        <TransformersProcessor
          question={currentQuestion}
          onResult={handleIntentResult}
          onError={handleProcessError}
          onLoadingChange={handleLoadingChange}
          onLoadingProgress={handleModelLoadingUpdate}
        />
      )}
    </Card>
  );
}