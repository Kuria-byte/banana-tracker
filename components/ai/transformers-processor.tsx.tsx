// File: /components/ai/transformers-processor.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { IntentResult, Intent, EntityMap } from '@/lib/types/intent';
import { configureTransformersEnvironment } from './wasm-config';


// Initialize Transformers.js environment
configureTransformersEnvironment();

// Props interface for the processor component
interface TransformersProcessorProps {
  question: string;
  onResult: (result: IntentResult) => void;
  onError: (error: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onLoadingProgress?: (progress: number) => void;
}

/**
 * Client-side component that processes natural language questions using Transformers.js
 */
export default function TransformersProcessor({
  question,
  onResult,
  onError,
  onLoadingChange,
  onLoadingProgress = () => {}
}: TransformersProcessorProps) {
  // State for tracking model loading and the classifier instance
  const [modelLoaded, setModelLoaded] = useState(false);
  const [classifier, setClassifier] = useState<any>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  
  // Define progress callback for model loading
  // Using a properly typed callback that conforms to Transformers.js API
  const progressCallback = (progressInfo: { status: string; } & Record<string, any>) => {
    // Handle both progress formats that might come from the library
    const progressValue = 
      progressInfo.status === 'progress' && 'progress' in progressInfo ? progressInfo.progress :
      progressInfo.status === 'progress' && 'value' in progressInfo ? progressInfo.value :
      progressInfo.status === 'ready' ? 100 : 
      progressInfo.status === 'download' ? 50 : 
      progressInfo.status === 'init' ? 10 : 0;
    
    // Send normalized progress (0-100)
    onLoadingProgress(Math.min(Math.max(Math.round(progressValue * 100), 0), 100));
  };
  
  // Load the model when the component mounts
  useEffect(() => {
    let isMounted = true;
    let timeout: NodeJS.Timeout | null = null;
    
    const loadModel = async () => {
      try {
        onLoadingChange(true);
        console.log("🤖 Loading Transformers.js model...");
        
        // Set initial progress
        onLoadingProgress(0);
        
        // Set a timeout for model loading
        timeout = setTimeout(() => {
          if (isMounted) {
            console.warn("Model loading timeout");
            onError("Model loading timed out. Trying simple processing instead.");
            onLoadingChange(false);
          }
        }, 30000); // 30 second timeout
        
        // Get a smaller, faster model for mobile devices
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        // Choose appropriate model based on device
        const modelName = isMobile 
          ? 'Xenova/distilbert-base-uncased-finetuned-sst-2-english'  // Works well on mobile
          : 'Xenova/distilbert-base-uncased-finetuned-sst-2-english'; // Standard model
        
        // Use a small text classification model with progress tracking
        const pipe = await pipeline(
          'text-classification',
          modelName,
          { progress_callback: progressCallback }
        );
        
        // Clear timeout since loading succeeded
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        
        // Once loaded, set progress to 100%
        onLoadingProgress(100);
        
        if (isMounted) {
          setClassifier(pipe);
          setModelLoaded(true);
          onLoadingChange(false);
          console.log("🤖 Transformers.js model loaded successfully");
        }
      } catch (error) {
        console.error('Error loading model:', error);
        // Clear timeout if it exists
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        
        if (isMounted) {
          onError('Failed to load the AI model. Using simplified processing.');
          onLoadingChange(false);
        }
      }
    };
    
    loadModel();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [onLoadingChange, onError, onLoadingProgress]);
  
  // Process the question when it changes and model is loaded
  useEffect(() => {
    let isMounted = true;
    let processingTimeout: NodeJS.Timeout | null = null;
    
    const processQuestion = async () => {
      // Skip if already processed this question, or missing required state
      if (hasProcessed || !question || !modelLoaded || !classifier) return;
      
      try {
        onLoadingChange(true);
        console.log("🔍 Processing question:", question);
        setHasProcessed(true);
        
        // Set a timeout for processing
        processingTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn("Classification processing timeout");
            onError("Processing took too long. Using simplified approach.");
            onLoadingChange(false);
          }
        }, 10000); // 10 second timeout
        
        // Classify the text using the loaded model
        const result = await classifier(question);
        
        // Clear timeout since processing succeeded
        if (processingTimeout) {
          clearTimeout(processingTimeout);
          processingTimeout = null;
        }
        
        console.log('Classification result:', result);
        
        // Map classification to intent using keywords and patterns
        const intent = determineIntent(question);
        
        // Extract entities using regex patterns
        const entities = extractEntities(question);
        
        if (isMounted) {
          // Calculate a confidence score (simplified)
          const confidence = result && result.length > 0 ? result[0].score : 0.5;
          
          onResult({ intent, entities, confidence });
          onLoadingChange(false);
        }
      } catch (error) {
        console.error('Error processing question:', error);
        
        // Clear timeout if it exists
        if (processingTimeout) {
          clearTimeout(processingTimeout);
          processingTimeout = null;
        }
        
        if (isMounted) {
          onError('Failed to process your question. Using simplified approach instead.');
          onLoadingChange(false);
        }
      }
    };
    
    processQuestion();
    
    return () => {
      isMounted = false;
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [question, modelLoaded, classifier, onResult, onError, onLoadingChange, hasProcessed]);
  
  // Reset processed state when question changes
  useEffect(() => {
    setHasProcessed(false);
  }, [question]);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * Determine the intent from the question text
 */
function determineIntent(question: string): Intent {
  const lowerQuestion = question.toLowerCase();
  
  // Patterns for each intent type
  const intentPatterns = {
    NEXT_HARVEST: [
      'harvest', 'when', 'ready', 'ripe', 'maturity', 'fruits', 'yield', 'crop',
      'banana', 'bunch', 'bunches', 'picking', 'collect', 'reap', 'gather'
    ],
    TASKS_BY_LOCATION: [
      'task', 'work', 'todo', 'to do', 'to-do', 'assignment', 'job', 'activity',
      'pending', 'complete', 'finish', 'what needs to be done', 'scheduled',
      'kirinyaga', 'nairobi', 'mombasa', 'nakuru', 'kisumu', 'eastlands'
    ],
    PLOT_STATUS: [
      'plot', 'status', 'condition', 'health', 'state', 'field', 'area',
      'section', 'plantation', 'how is plot', 'situation', 'assessment'
    ],
    FORECAST: [
      'forecast', 'future', 'predict', 'projection', 'outlook', 'upcoming', 
      'months', 'next', 'quarter', 'planning', 'expect', 'anticipate', 'projection'
    ],
    FARM_HEALTH: [
      'farm health', 'score', 'assessment', 'evaluation', 'rating', 'metrics',
      'measure', 'performance', 'quality', 'condition', 'how healthy', 'status'
    ],
    TASK_SUMMARY: [
      'summary', 'overview', 'pending', 'all tasks', 'task list', 'my tasks',
      'assigned', 'due', 'deadline', 'priority', 'important', 'urgent'
    ]
  };
  
  // First pass: check for key phrase matches
  const keyPhrases = {
    'when is the next harvest': 'NEXT_HARVEST',
    'when will harvest be ready': 'NEXT_HARVEST',
    'when can we harvest': 'NEXT_HARVEST',
    'tasks in': 'TASKS_BY_LOCATION',
    'tasks for': 'TASKS_BY_LOCATION',
    'tasks at': 'TASKS_BY_LOCATION',
    'what tasks': 'TASKS_BY_LOCATION',
    'what is the status of plot': 'PLOT_STATUS',
    'how is plot': 'PLOT_STATUS',
    'plot status': 'PLOT_STATUS',
    'forecast for': 'FORECAST',
    'forecast in the next': 'FORECAST',
    'next few months': 'FORECAST',
    'farm health': 'FARM_HEALTH',
    'health metrics': 'FARM_HEALTH',
    'how healthy': 'FARM_HEALTH',
    'task summary': 'TASK_SUMMARY',
    'my tasks': 'TASK_SUMMARY',
    'pending tasks': 'TASK_SUMMARY',
  };
  
  for (const [phrase, intent] of Object.entries(keyPhrases)) {
    if (lowerQuestion.includes(phrase)) {
      return intent as Intent;
    }
  }
  
  // Second pass: check for pattern matches with scoring
  const scores: Record<string, number> = {
    NEXT_HARVEST: 0,
    TASKS_BY_LOCATION: 0,
    PLOT_STATUS: 0,
    FORECAST: 0,
    FARM_HEALTH: 0,
    TASK_SUMMARY: 0,
  };
  
  // Calculate scores for each intent based on keyword matches
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    // Count how many pattern words match in the question
    const matchCount = patterns.filter(pattern => lowerQuestion.includes(pattern)).length;
    scores[intent] = matchCount;
    
    // Special case for location mentions
    if (intent === 'TASKS_BY_LOCATION') {
      const locations = ['kirinyaga', 'nairobi', 'mombasa', 'nakuru', 'kisumu', 'eastlands'];
      const locationMatches = locations.filter(loc => lowerQuestion.includes(loc)).length;
      if (locationMatches > 0 && matchCount > 0) {
        scores[intent] += 3; // Strongly boost score if both task and location mentioned
      }
    }
    
    // Special case for plot mentions
    if (intent === 'PLOT_STATUS' && lowerQuestion.match(/plot\s+\d+/i)) {
      scores[intent] += 3; // Boost score if specific plot number mentioned
    }
  }
  
  // Find the intent with the highest score
  let bestIntent: Intent = 'UNKNOWN';
  let bestScore = 0;
  
  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as Intent;
    }
  }
  
  // Require a minimum match score to avoid spurious matches
  return bestScore >= 2 ? bestIntent : 'UNKNOWN';
}

/**
 * Extract entities from the question using regex patterns
 */
function extractEntities(question: string): EntityMap {
  const entities: EntityMap = {};
  const lowerQuestion = question.toLowerCase();
  
  // Extract farm IDs with more flexible patterns
  const farmMatches = [
    ...lowerQuestion.matchAll(/farm\s*(?:number|#)?\s*(\d+)/gi),
    ...lowerQuestion.matchAll(/(\d+)(?:st|nd|rd|th)?\s*farm/gi)
  ];
  
  if (farmMatches.length > 0) {
    entities.farmId = parseInt(farmMatches[0][1]);
  }
  
  // Extract plot IDs with more flexible patterns
  const plotMatches = [
    ...lowerQuestion.matchAll(/plot\s*(?:number|#)?\s*(\d+)/gi),
    ...lowerQuestion.matchAll(/(\d+)(?:st|nd|rd|th)?\s*plot/gi)
  ];
  
  if (plotMatches.length > 0) {
    entities.plotId = parseInt(plotMatches[0][1]);
  }
  
  // Extract locations with better context awareness
  const locationKeywords = [
    'in', 'at', 'near', 'around', 'for', 'from', 'of'
  ];
  
  const locations = ['kirinyaga', 'nairobi', 'mombasa', 'nakuru', 'kisumu', 'eastlands'];
  
  // Look for location patterns like "tasks in Nairobi" or "Nairobi farm"
  for (const location of locations) {
    // Check if location is present
    if (lowerQuestion.includes(location)) {
      // Check for contextual clues that this is definitely a location
      for (const keyword of locationKeywords) {
        const pattern = new RegExp(`${keyword}\\s+${location}|${location}\\s+${keyword}`, 'i');
        if (pattern.test(lowerQuestion)) {
          entities.location = location;
          break;
        }
      }
      
      // If we found a clear location, break
      if (entities.location) break;
      
      // Otherwise, still consider it a location but with less confidence
      if (!entities.location) {
        entities.location = location;
      }
    }
  }
  
  // Extract months for forecasting with better pattern matching
  const monthsMatches = [
    ...lowerQuestion.matchAll(/(\d+)\s*months/gi),
    ...lowerQuestion.matchAll(/next\s*(\d+)\s*months/gi),
    ...lowerQuestion.matchAll(/coming\s*(\d+)\s*months/gi),
    ...lowerQuestion.matchAll(/forecast\s*(?:for|of)\s*(\d+)\s*months/gi)
  ];
  
  if (monthsMatches.length > 0) {
    entities.months = parseInt(monthsMatches[0][1]);
  } else if (lowerQuestion.includes('month') || lowerQuestion.includes('forecast')) {
    // Default to 3 months if months are mentioned but no specific number
    entities.months = 3;
  }
  
  // Extract task status with context awareness
  const statusPatterns = {
    'PENDING': ['pending', 'not started', 'to do', 'upcoming', 'scheduled'],
    'IN_PROGRESS': ['in progress', 'ongoing', 'started', 'in process', 'working on'],
    'COMPLETED': ['completed', 'done', 'finished', 'complete']
  };
  
  for (const [status, patterns] of Object.entries(statusPatterns)) {
    if (patterns.some(pattern => lowerQuestion.includes(pattern))) {
      entities.status = status;
      break;
    }
  }
  
  return entities;
}