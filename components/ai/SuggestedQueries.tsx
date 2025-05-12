// File: /components/ai/SuggestedQueries.tsx
"use client"; // Mark as client component

import React from 'react';
import { Info } from 'lucide-react';

const queryGroups = [
  {
    title: "Harvests",
    queries: [
      "When is my next harvest?",
      "When will plot 28 be ready for harvest?",
      "What was our total yield from Kirinyaga farm?",
    ]
  },
  {
    title: "Tasks",
    queries: [
      "What pending tasks do I have this week?",
      "Show tasks in Nairobi region",
      "What are my high priority tasks?",
    ]
  },
  {
    title: "Farm Health",
    queries: [
      "What's the health status of plot 28?",
      "Show me the health metrics for farm 53",
      "Are there any pest issues in Kirinyaga plots?",
    ]
  },
  {
    title: "Forecasts",
    queries: [
      "What's the forecast for the next 3 months?",
      "Predict our harvests for the next 2 months",
      "When should I schedule the next team of workers?",
    ]
  },
];

export default function SuggestedQueries() {
  const handleSuggestionClick = (query: string) => {
    // Dispatch a custom event that the assistant component will listen for
    window.dispatchEvent(new CustomEvent('suggestionSelected', { 
      detail: { query } 
    }));
  };

  return (
    <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
      <div className="bg-muted px-6 py-4 border-b flex items-center gap-2">
        <Info size={16} />
        <h3 className="font-medium text-lg">Suggested Questions</h3>
      </div>
      <div className="p-6 space-y-6">
        {queryGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">{group.title}</h4>
            <ul className="space-y-2">
              {group.queries.map((query) => (
                <li 
                  key={query} 
                  className="text-sm hover:underline cursor-pointer p-2 hover:bg-accent rounded-md flex items-center gap-2"
                  onClick={() => handleSuggestionClick(query)}
                >
                  <span className="text-primary">→</span> {query}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}