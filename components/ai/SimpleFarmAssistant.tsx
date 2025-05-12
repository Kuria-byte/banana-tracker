// File: /components/ai/SimpleFarmAssistant.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { AssistantResponse } from '@/lib/types/intent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SimpleFarmAssistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! How can I help you with your farm today? You can ask me about harvests, tasks, plot status, forecasts, or farm health.', 
      timestamp: new Date() 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle suggested question click from custom event
  useEffect(() => {
    const handleSuggestion = (event: CustomEvent) => {
      if (event.detail && event.detail.query) {
        setQuestion(event.detail.query);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    
    // Type assertion to handle CustomEvent type
    window.addEventListener('suggestionSelected', handleSuggestion as EventListener);
    
    return () => {
      window.removeEventListener('suggestionSelected', handleSuggestion as EventListener);
    };
  }, []);
  
  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || loading) return;
    
    // Add user message to the messages
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: question, timestamp: new Date() }
    ]);
    
    // Clear the input and set loading
    const currentQuestion = question;
    setQuestion('');
    setLoading(true);
    
    try {
      // Send the question to the assistant API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }
      
      const data: AssistantResponse = await response.json();
      
      // Add assistant response to the messages
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: data.response, timestamp: new Date() }
      ]);
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your question. Please try again.', 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-[600px] w-full rounded-lg border shadow-sm bg-card">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`flex max-w-[80%] rounded-lg overflow-hidden ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="px-3 py-3 bg-primary/10 flex items-center">
                  <Bot size={18} className="text-primary" />
                </div>
              )}
              {message.role === 'user' && (
                <div className="px-3 py-3 bg-primary/20 flex items-center">
                  <User size={18} />
                </div>
              )}
              <div className="px-4 py-3">
                {message.content}
                <div className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form 
        onSubmit={handleQuestion}
        className="border-t p-4 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your farms..."
          className="flex-1 px-4 py-2 border rounded-lg"
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}