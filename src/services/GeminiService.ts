// src/services/geminiService.ts - BULLETPROOF JSON HANDLING AND ERROR RECOVERY WITH TYPESCRIPT
import { ResponseHealer } from '../utils/responseHealer.js';

// Type definitions for the service
export type ProjectStage = 'Ideation' | 'Curriculum' | 'Assignments';

export type InteractionType = 
  | 'conversationalIdeation' 
  | 'Standard' 
  | 'Welcome' 
  | 'Framework' 
  | 'Guide';

export type CurrentStep = 'bigIdea' | 'essentialQuestion' | 'challenge' | 'complete';

// Core response interfaces
export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface Summary {
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  [key: string]: unknown;
}

export interface FrameworkOverview {
  title?: string;
  description?: string;
  steps?: string[];
  [key: string]: unknown;
}

export interface NewAssignment {
  title?: string;
  description?: string;
  requirements?: string[];
  [key: string]: unknown;
}

export interface IdeationProgress {
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  [key: string]: unknown;
}

// Main AI response interface - represents the expected structure
export interface AIResponse {
  interactionType: InteractionType;
  currentStage: ProjectStage;
  currentStep?: CurrentStep;
  chatResponse: string;
  isStageComplete: boolean;
  
  // Optional UI enhancement fields
  buttons?: string[] | null;
  suggestions?: string[] | null;
  frameworkOverview?: FrameworkOverview | null;
  guestSpeakerHints?: string[] | null;
  
  // Stage-specific fields
  summary?: Summary | null;
  curriculumDraft?: string | null;
  newAssignment?: NewAssignment | null;
  assessmentMethods?: string[] | null;
  
  // Ideation-specific fields
  dataToStore?: unknown | null;
  ideationProgress?: IdeationProgress | null;
}

// Raw API response structure from Gemini
export interface GeminiAPIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

// Partial response type for flexible parsing
export interface PartialResponse {
  chatResponse?: string;
  buttons?: string[];
  isStageComplete?: boolean;
  interactionType?: InteractionType;
  currentStage?: ProjectStage;
  suggestions?: string[];
  frameworkOverview?: FrameworkOverview;
  guestSpeakerHints?: string[];
  summary?: Summary;
  curriculumDraft?: string;
  newAssignment?: NewAssignment;
  assessmentMethods?: string[];
  dataToStore?: unknown;
  ideationProgress?: IdeationProgress;
  [key: string]: unknown;
}

// Error types
export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public readonly stage: ProjectStage,
    public readonly attempt: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

// Use secure Netlify function endpoint instead of direct API calls
const API_URL_BASE = '/.netlify/functions/gemini';

// --- Rate Limiting Configuration ---
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
const MAX_RETRIES = 2;

const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

// Type guard functions
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return isArray(value) && value.every(item => isString(item));
};

const isValidProjectStage = (stage: string): stage is ProjectStage => {
  return ['Ideation', 'Curriculum', 'Assignments'].includes(stage);
};

const sanitizeString = (value: unknown): string => {
  if (isString(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  // Handle the "e.split is not a function" error by converting to string safely
  return String(value);
};

/**
 * Flexible content extraction that prioritizes getting SOMETHING useful
 * @param text - Raw AI response text
 * @returns Always returns a usable response object
 */
const extractFlexibleResponse = (text: unknown): PartialResponse => {
  const safeText = sanitizeString(text);
  
  if (!safeText || safeText.trim() === '') {
    return { chatResponse: "I'm here to help! Let's work on your project together." };
  }

  // Strategy 1: Try to parse as complete JSON
  const jsonMatches = safeText.match(/\{[\s\S]*\}/g);
  if (jsonMatches) {
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match);
        if (isObject(parsed)) {
          return parsed as PartialResponse;
        }
      } catch {
        continue;
      }
    }
  }

  // Strategy 2: Extract JSON between braces with error tolerance
  const firstBrace = safeText.indexOf('{');
  const lastBrace = safeText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonString = safeText.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonString);
      if (isObject(parsed)) {
        return parsed as PartialResponse;
      }
    } catch {
      // Continue to partial extraction
    }
  }

  // Strategy 3: Partial field extraction - look for key fields even if JSON is broken
  const partialResponse: PartialResponse = {};
  
  // Look for chatResponse content (most important)
  const chatDoubleQuoteMatch = safeText.match(/"chatResponse"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/); 
  const chatSingleQuoteMatch = safeText.match(/'chatResponse'\s*:\s*'([^']*(?:\\.[^']*)*)'/);
  const chatSimpleMatch = safeText.match(/chatResponse[:\s]+([^\n\r]+)/);
  
  if (chatDoubleQuoteMatch && chatDoubleQuoteMatch[1]) {
    partialResponse.chatResponse = chatDoubleQuoteMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
  } else if (chatSingleQuoteMatch && chatSingleQuoteMatch[1]) {
    partialResponse.chatResponse = chatSingleQuoteMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
  } else if (chatSimpleMatch && chatSimpleMatch[1]) {
    partialResponse.chatResponse = chatSimpleMatch[1].trim();
  }

  // Look for buttons array
  const buttonsMatch = safeText.match(/"buttons"\s*:\s*\[([^\]]*)\]/);
  if (buttonsMatch && buttonsMatch[1]) {
    try {
      const parsed = JSON.parse(`[${buttonsMatch[1]}]`);
      if (isStringArray(parsed)) {
        partialResponse.buttons = parsed;
      }
    } catch {
      // Extract individual button strings
      const buttonStrings = buttonsMatch[1].match(/"([^"]*)"/g);
      if (buttonStrings) {
        partialResponse.buttons = buttonStrings.map(s => s.slice(1, -1));
      }
    }
  }

  // Look for stage completion
  const stageCompleteMatch = safeText.match(/"isStageComplete"\s*:\s*(true|false)/i);
  if (stageCompleteMatch && stageCompleteMatch[1]) {
    partialResponse.isStageComplete = stageCompleteMatch[1].toLowerCase() === 'true';
  }

  // Strategy 4: If no chatResponse found anywhere, use the entire text as conversational content
  if (!partialResponse.chatResponse) {
    // Clean up the text - remove JSON artifacts and use as chat content
    const cleanText = safeText
      .replace(/[{}]/g, '')
      .replace(/"[^"]*":\s*/g, '')
      .replace(/,\s*$/, '')
      .trim();
    
    if (cleanText.length > 10) {
      partialResponse.chatResponse = cleanText;
    } else {
      partialResponse.chatResponse = "I'm ready to help you with your project! What would you like to work on?";
    }
  }

  return partialResponse;
};

/**
 * Enriches any response object with sensible defaults - never rejects content
 * @param responseObj - Any response object (can be partial)
 * @param stage - Current project stage
 * @returns Always returns a complete, usable response
 */
const enrichResponseWithDefaults = (responseObj: unknown, stage: ProjectStage): AIResponse => {
  const safeResponseObj = isObject(responseObj) ? responseObj : {};

  // Build complete response with progressive enhancement
  const enriched: AIResponse = {
    // Core required fields with sensible defaults
    interactionType: (isString(safeResponseObj.interactionType) ? 
      safeResponseObj.interactionType as InteractionType : 
      (stage === 'Ideation' ? 'conversationalIdeation' : 'Standard')),
    
    currentStage: stage,
    chatResponse: sanitizeString(safeResponseObj.chatResponse),
    isStageComplete: safeResponseObj.isStageComplete === true, // Only true if explicitly true
    
    // UI enhancement fields - use if well-formed, otherwise null
    buttons: isStringArray(safeResponseObj.buttons) ? safeResponseObj.buttons : null,
    suggestions: isStringArray(safeResponseObj.suggestions) ? safeResponseObj.suggestions : null,
    frameworkOverview: (isObject(safeResponseObj.frameworkOverview)) 
      ? safeResponseObj.frameworkOverview as FrameworkOverview : null,
    guestSpeakerHints: isStringArray(safeResponseObj.guestSpeakerHints) ? 
      safeResponseObj.guestSpeakerHints : null,
    
    // Stage-specific fields - preserve if present, use null for undefined to avoid Firestore errors
    summary: (isObject(safeResponseObj.summary)) 
      ? safeResponseObj.summary as Summary : null,
    curriculumDraft: isString(safeResponseObj.curriculumDraft) ? 
      safeResponseObj.curriculumDraft : null,
    newAssignment: (isObject(safeResponseObj.newAssignment)) 
      ? safeResponseObj.newAssignment as NewAssignment : null,
    assessmentMethods: isStringArray(safeResponseObj.assessmentMethods) 
      ? safeResponseObj.assessmentMethods : null,
    
    // Ideation-specific fields
    dataToStore: safeResponseObj.dataToStore || null,
    ideationProgress: (isObject(safeResponseObj.ideationProgress)) 
      ? safeResponseObj.ideationProgress as IdeationProgress : null,
  };

  // Ensure chatResponse always has content
  if (!enriched.chatResponse || enriched.chatResponse.trim() === '') {
    enriched.chatResponse = generateContextualFallback(stage);
  }

  // Clean and validate buttons if present
  if (enriched.buttons) {
    enriched.buttons = enriched.buttons
      .filter(btn => isString(btn) && btn.trim().length > 0)
      .slice(0, 4); // Limit to 4 buttons max
  }

  return enriched;
};

/**
 * Creates contextual fallback messages based on project stage
 * @param stage - Current project stage  
 * @returns Contextual fallback message
 */
const generateContextualFallback = (stage: ProjectStage): string => {
  const fallbacks: Record<ProjectStage | 'default', string> = {
    'Ideation': "I'm here to help you design a meaningful project! Let's explore how to transform your vision into an engaging learning experience. What aspects of your project idea would you like to develop first?",
    'Curriculum': "Now let's build the learning journey for your students! I'll help you create activities that prepare them for success. What key skills should students develop in this project?", 
    'Assignments': "Time to design authentic assessments! Let's create ways for students to demonstrate their learning through real-world application. What would be the most meaningful way for students to show their mastery?",
    'default': "I'm here to help you design an amazing learning experience! What would you like to work on together?"
  };
  
  return fallbacks[stage] || fallbacks.default;
};

/**
 * Validates and parses the Gemini API response
 * @param response - Raw fetch response
 * @returns Parsed API response
 */
const validateGeminiAPIResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  const result: unknown = await response.json();
  
  // Type guard for Gemini API response structure
  if (!isObject(result) || 
      !isArray(result.candidates) || 
      result.candidates.length === 0) {
    throw new Error("Invalid response structure from Gemini API");
  }

  const candidate = result.candidates[0];
  if (!isObject(candidate) || 
      !isObject(candidate.content) || 
      !isArray(candidate.content.parts) ||
      candidate.content.parts.length === 0) {
    throw new Error("Invalid response structure from Gemini API");
  }

  const part = candidate.content.parts[0];
  if (!isObject(part) || !isString(part.text)) {
    throw new Error("Invalid response structure from Gemini API");
  }

  return part.text;
};

/**
 * Determines the project stage from system prompt
 * @param systemPrompt - The system prompt string
 * @returns The inferred project stage
 */
const inferStageFromPrompt = (systemPrompt: string): ProjectStage => {
  const prompt = sanitizeString(systemPrompt).toUpperCase();
  
  if (prompt.includes('IDEATION')) return 'Ideation';
  if (prompt.includes('CURRICULUM')) return 'Curriculum';
  if (prompt.includes('ASSIGNMENTS')) return 'Assignments';
  
  return 'Ideation'; // Default fallback
};

/**
 * Main service function: Generates robust JSON responses with comprehensive error handling
 * @param history - Chat history for context
 * @param systemPrompt - System prompt defining AI task
 * @returns Validated JSON response object
 */
export const generateJsonResponse = async (
  history: ChatMessage[], 
  systemPrompt: string
): Promise<AIResponse> => {
  // Determine stage from prompt for fallback purposes
  const stage = inferStageFromPrompt(systemPrompt);

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();

      const conversationHistory: ChatMessage[] = [
        { 
          role: 'user', 
          parts: [{ text: sanitizeString(systemPrompt) }] 
        },
        { 
          role: 'model', 
          parts: [{ text: "I understand. I will provide a complete, valid JSON response that follows all instructions and helps the educator design their project effectively." }] 
        },
        ...history.map(msg => ({
          role: msg.role,
          parts: msg.parts.map(part => ({ text: sanitizeString(part.text) }))
        }))
      ];

      const payload = {
        prompt: sanitizeString(systemPrompt),
        history: conversationHistory
      };

      console.log(`Attempt ${attempt}: Sending request to Netlify function`);
      
      const response = await fetch(API_URL_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await validateGeminiAPIResponse(response);
      console.log(`Raw AI Response (Attempt ${attempt}):`, responseText);

      // Flexible extraction - always gets something useful
      const extractedResponse = extractFlexibleResponse(responseText);
      
      // Use smart healing instead of rigid validation - never fails, always returns usable response
      const healedResponse = ResponseHealer.heal(extractedResponse, stage, '');
      
      console.log(`Processed response (Attempt ${attempt}):`, healedResponse);
      
      // Enrich the healed response with proper typing and defaults
      const finalResponse = enrichResponseWithDefaults(healedResponse, stage);
      
      // Success! We always have a usable response now
      return finalResponse;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === MAX_RETRIES) {
        console.error("All retry attempts exhausted, creating fallback response");
        // Create a fallback response even for API failures using healer
        const fallbackResponse = ResponseHealer.heal({
          chatResponse: `I'm experiencing some technical difficulties, but I'm still here to help you with your ${stage.toLowerCase()} work! What would you like to focus on?`
        }, stage, '');
        
        return enrichResponseWithDefaults(fallbackResponse, stage);
      }
      
      // Exponential backoff for API failures only
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  // This should never be reached due to fallback in catch block, but just in case
  console.error("Unexpected code path - generating final fallback");
  const emergencyFallback = ResponseHealer.heal({
    chatResponse: "I'm ready to help you with your project! What would you like to work on?"
  }, stage, '');
  
  return enrichResponseWithDefaults(emergencyFallback, stage);
};
