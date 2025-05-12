// File: /lib/ai/intent-detector.ts
import { Intent, IntentResult, EntityMap } from "@/lib/types/intent";
import { extractEntities } from "./entity-extractor";

interface IntentPattern {
  intent: Intent;
  patterns: Array<{
    regex?: RegExp;
    keywords?: string[];
    weight: number;
  }>;
}

const intentPatterns: IntentPattern[] = [
  {
    intent: "NEXT_HARVEST",
    patterns: [
      { regex: /when\s+(will|is|are|can|should).*\s+(harvest|ready|mature|ripe)/i, weight: 0.9 },
      { regex: /next\s+harvest/i, weight: 0.8 },
      { regex: /harvest\s+(date|time|schedule)/i, weight: 0.8 },
      { regex: /when\s+(can|should)\s+I\s+harvest/i, weight: 0.9 },
      { keywords: ["harvest date", "harvest time", "ready to harvest", "ripeness", "maturity"], weight: 0.7 }
    ]
  },
  {
    intent: "TASKS_BY_LOCATION",
    patterns: [
      { regex: /tasks?\s+(at|in|for|on)\s+([a-z\s]+)/i, weight: 0.9 },
      { regex: /what\s+(should|needs|must)\s+(be\s+)?done\s+(at|in|on)/i, weight: 0.8 },
      { regex: /things\s+to\s+do\s+(at|in|on)/i, weight: 0.8 },
      { regex: /(show|list|display)\s+tasks?\s+for/i, weight: 0.8 },
      { keywords: ["tasks in", "work in", "activities in", "to-do in", "duties at"], weight: 0.7 }
    ]
  },
  {
    intent: "PLOT_STATUS",
    patterns: [
      { regex: /status\s+of\s+plot\s+(\d+)/i, weight: 0.9 },
      { regex: /how\s+is\s+plot\s+(\d+)/i, weight: 0.8 },
      { regex: /condition\s+of\s+plot/i, weight: 0.7 },
      { regex: /plot\s+(\d+)\s+status/i, weight: 0.9 },
      { regex: /status\s+(for|of)\s+plot/i, weight: 0.8 },
      { keywords: ["plot health", "plot condition", "plot status", "plot state"], weight: 0.6 }
    ]
  },
  {
    intent: "FORECAST",
    patterns: [
      { regex: /forecast\s+for\s+(\d+)\s+(day|week|month|year)s?/i, weight: 0.9 },
      { regex: /predict\s+(yield|harvest|income|expense)/i, weight: 0.8 },
      { regex: /expected\s+(yield|harvest|income|revenue)/i, weight: 0.8 },
      { regex: /what\s+(will|should)\s+(happen|occur)\s+in\s+the\s+next/i, weight: 0.7 },
      { regex: /projection\s+for\s+(next|coming)/i, weight: 0.8 },
      { keywords: ["projection", "estimate", "predict", "outlook", "forecast", "future"], weight: 0.7 }
    ]
  },
  {
    intent: "FARM_HEALTH",
    patterns: [
      { regex: /health\s+(of|status)\s+(farm|plantation)/i, weight: 0.9 },
      { regex: /how\s+(healthy|good)\s+is\s+(my|the)\s+farm/i, weight: 0.8 },
      { regex: /farm\s+(\d+)\s+health/i, weight: 0.9 },
      { regex: /health\s+report/i, weight: 0.8 },
      { regex: /health\s+metrics/i, weight: 0.8 },
      { keywords: ["farm condition", "farm health", "health score", "banana health", "plant health"], weight: 0.7 }
    ]
  },
  {
    intent: "TASK_SUMMARY",
    patterns: [
      { regex: /task\s+summary/i, weight: 0.9 },
      { regex: /pending\s+tasks/i, weight: 0.8 },
      { regex: /(list|show|display)\s+(all|my)\s+tasks/i, weight: 0.8 },
      { regex: /tasks?\s+overview/i, weight: 0.8 },
      { regex: /what\s+(tasks?|work|activities)\s+(do\s+I|should\s+I)\s+have/i, weight: 0.7 },
      { keywords: ["todo list", "task list", "pending work", "assignments", "work items"], weight: 0.7 }
    ]
  }
];

export function detectIntent(question: string): IntentResult {
  const lowerQuestion = question.toLowerCase();
  
  // Score each intent based on patterns
  const scores = intentPatterns.map(ip => {
    let score = 0;
    
    // Check regex patterns
    ip.patterns.forEach(pattern => {
      if (pattern.regex && pattern.regex.test(lowerQuestion)) {
        score += pattern.weight;
      }
      
      // Check keywords
      if (pattern.keywords) {
        pattern.keywords.forEach(keyword => {
          if (lowerQuestion.includes(keyword.toLowerCase())) {
            score += pattern.weight * 0.8; // Slightly lower weight for keywords
          }
        });
      }
    });
    
    return { intent: ip.intent, score };
  });
  
  // Get the highest scoring intent
  const bestMatch = scores.reduce((prev, current) => 
    current.score > prev.score ? current : prev, { intent: "UNKNOWN" as Intent, score: 0 });
  
  // Extract entities based on the detected intent
  const entities = extractEntities(question, bestMatch.intent);
  
  return {
    intent: bestMatch.score > 0.4 ? bestMatch.intent : "UNKNOWN",
    entities,
    confidence: bestMatch.score
  };
}