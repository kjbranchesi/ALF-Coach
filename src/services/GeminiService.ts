// src/services/geminiService.ts - BULLETPROOF JSON HANDLING AND ERROR RECOVERY WITH TYPESCRIPT
import { ResponseHealer } from '../utils/responseHealer.js';
import { WizardContextHelper } from './WizardContextHelper';
import { JSONResponseParser } from '../utils/json-response-parser';
import { enforceResponseLength, determineResponseContext, addLengthConstraintToPrompt } from '../utils/response-length-control';
import { ResponseContext } from '../types/chat';
import { connectionStatus } from './ConnectionStatusService';

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

// Check if value is an array of suggestion objects
const isSuggestionArray = (value: unknown): value is any[] => {
  return isArray(value) && value.every(item => 
    isObject(item) && 
    'id' in item && 
    'text' in item && 
    'category' in item
  );
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
    suggestions: isSuggestionArray(safeResponseObj.suggestions) ? safeResponseObj.suggestions : 
                 isArray(safeResponseObj.suggestions) ? safeResponseObj.suggestions : null,
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
// GeminiService class wrapper for compatibility
export class GeminiService {
  async generateJsonResponse(history: ChatMessage[], systemPrompt: string): Promise<AIResponse> {
    return generateJsonResponse(history, systemPrompt);
  }
  
  // Simple generateResponse method for ChatbotFirstInterfaceFixed
  async generateResponse(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    try {
      // Check connection status first
      const status = connectionStatus.getStatus();
      if (!status.online) {
        throw new Error('No internet connection available');
      }
      
      if (status.geminiApi === 'rate-limited') {
        throw new Error('API rate limited - please wait before trying again');
      }
      
      if (status.geminiApi === 'unavailable') {
        throw new Error('AI service temporarily unavailable');
      }
      
      // Build a simple history with the prompt
      const history: ChatMessage[] = [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];
      
      // Use the existing generateJsonResponse function
      const response = await generateJsonResponse(history, prompt);
      
      // Report success to connection status
      connectionStatus.reportGeminiSuccess();
      
      // Return the chat response or a fallback
      return response.chatResponse || "I understand. Let me help you with that.";
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Report error to connection status
      connectionStatus.reportGeminiError(error as Error);
      
      // Return a helpful fallback response based on error type
      const errorMessage = (error as Error).message.toLowerCase();
      if (errorMessage.includes('rate limit')) {
        return "I'm currently experiencing high demand. Please wait a moment and try again.";
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        return "I'm having trouble connecting right now. Your work is saved locally and I'll sync when the connection is restored.";
      } else {
        return "I'm here to help you create an engaging learning experience. Could you tell me more about what you're working on?";
      }
    }
  }
  
  // Generate method for ChatInterface compatibility
  async generate({ step, context, action, userInput }: {
    step: string;
    context: any;
    action: string;
    userInput?: string;
  }): Promise<{ message: string; suggestions: any[]; data: any }> {
    // CRITICAL FIX: Respect explicit action buttons, don't override with confusion detection
    // Only apply confusion detection for regular conversation, not explicit actions
    let finalAction = action;
    
    if (action === 'response' || action === 'chat') {
      // Only for conversational interactions - detect confusion or suggestion requests
      const detectedConfusion = this.detectConfusion(userInput);
      const detectedAction = detectedConfusion ? 'help' : this.detectSuggestionRequest(userInput, action);
      finalAction = detectedAction || action;
    }
    
    console.log('[GeminiService] Action detection:', {
      originalAction: action,
      userInput: userInput?.substring(0, 50),
      finalAction
    });
    
    // CRITICAL FIX: Pass context to system prompt builder
    const systemPrompt = this.buildSystemPrompt(step, finalAction, context);
    const history = this.buildHistory(context, userInput);
    
    try {
      const response = await generateJsonResponse(history, systemPrompt);
      
      // Handle confusion detection - ONLY for conversational interactions, not explicit actions
      if (finalAction === 'help' && userInput && action !== 'ideas' && action !== 'whatif') {
        const clarificationSuggestions = this.generateClarificationSuggestions(step, context, userInput);
        return {
          message: response.chatResponse || "I'd be happy to clarify! Let me help you understand this better.",
          suggestions: clarificationSuggestions,
          data: response
        };
      }
      
      // For action-based requests (ideas, whatif), extract suggestions from the response data
      let suggestions: any[] = [];
      let message = response.chatResponse || "I'm here to help you with your project!";
      
      // Check if the AI response contains suggestions in the expected format
      if (finalAction === 'ideas' || finalAction === 'whatif') {
        // Try to extract suggestions from the response data or chatResponse
        suggestions = this.extractSuggestions(response);
        
        console.log('[GeminiService] Action:', finalAction);
        console.log('[GeminiService] Raw response:', response);
        console.log('[GeminiService] Extracted suggestions:', suggestions);
        
        // If we successfully extracted suggestions, provide a brief message
        if (suggestions.length > 0) {
          message = finalAction === 'ideas' 
            ? `Here are some ideas for your ${this.getStepContext(step).name.toLowerCase()}:` 
            : `What if scenarios for your ${this.getStepContext(step).name.toLowerCase()}:`;
        }
      } else {
        // CRITICAL FIX: For regular conversation, NEVER extract suggestions unless explicitly requested
        // Remove the numbered suggestion extraction from normal conversation flow
        suggestions = [];
      }
      
      // Ensure response is conversational and concise
      message = this.ensureConversationalResponse(message, step, finalAction);
      
      // Convert response to the format expected by ChatInterface
      return {
        message,
        suggestions,
        data: response
      };
    } catch (error) {
      console.error('GeminiService.generate error:', error);
      return {
        message: "I'm having trouble generating a response. Let me try to help you another way.",
        suggestions: [],
        data: {}
      };
    }
  }
  
  // Extract suggestions from AI response - ensures clean, user-friendly format
  private extractSuggestions(response: any): any[] {
    // CRITICAL: Use the enhanced JSON parser to safely extract suggestions
    // This prevents raw JSON from ever being shown to users
    
    try {
      // First try using the enhanced parser on the response text
      if (response.chatResponse && typeof response.chatResponse === 'string') {
        const parsed = JSONResponseParser.parse(response.chatResponse);
        if (parsed.success && parsed.suggestions && parsed.suggestions.length > 0) {
          return parsed.suggestions;
        }
      }
      
      // Fallback: try direct extraction with validation
      if (response.suggestions && Array.isArray(response.suggestions)) {
        return this.cleanSuggestionsDirectly(response.suggestions);
      }
      
      // Look for suggestions in other properties
      for (const key in response) {
        const value = response[key];
        if (Array.isArray(value) && value.length > 0 && 
            (value[0]?.text || typeof value[0] === 'string')) {
          return this.cleanSuggestionsDirectly(value);
        }
      }
    } catch (error) {
      console.warn('[GeminiService] Suggestion extraction failed:', error);
    }
    
    return [];
  }
  
  // Fallback for direct suggestion cleaning - prevents raw JSON display
  private cleanSuggestionsDirectly(suggestions: any[]): any[] {
    return suggestions
      .filter(s => s && (typeof s === 'string' || (typeof s === 'object' && s.text)))
      .map((s, idx) => {
        if (typeof s === 'string') {
          // Skip if it looks like raw JSON - CRITICAL for preventing JSON display
          if (s.includes('{') || s.includes('"id"') || s.includes('"category"') || s.includes('```')) {
            return null;
          }
          return {
            id: `suggestion-${idx + 1}`,
            text: s.trim(),
            category: 'idea'
          };
        }
        
        if (typeof s === 'object' && s.text && typeof s.text === 'string') {
          // Skip malformed suggestions
          if (s.text.includes('{') || s.text.includes('```') || !s.text.trim()) {
            return null;
          }
          return {
            id: s.id || `suggestion-${idx + 1}`,
            text: s.text.trim(),
            category: s.category || 'idea'
          };
        }
        
        return null;
      })
      .filter(s => s !== null)
      .slice(0, 4); // Limit to 4 suggestions max
  }
  
  // Extract numbered suggestions from AI response text
  private extractNumberedSuggestions(responseText: string): any[] {
    if (!responseText || typeof responseText !== 'string') {
      return [];
    }
    
    // Look for numbered lists (1., 2., 3., etc.) or bullet points (-, *, •)
    const numberedPatterns = [
      /(?:^|\n)\s*(\d+)\.\s+(.+?)(?=\n\s*\d+\.|$)/g,
      /(?:^|\n)\s*[-*•]\s+(.+?)(?=\n\s*[-*•]|$)/g
    ];
    
    const suggestions: any[] = [];
    let suggestionId = 1;
    
    for (const pattern of numberedPatterns) {
      const matches = [...responseText.matchAll(pattern)];
      
      for (const match of matches) {
        const text = (match[2] || match[1])?.trim();
        if (text && text.length > 10 && text.length < 200) { // Reasonable suggestion length
          suggestions.push({
            id: `suggestion-${suggestionId}`,
            text: text,
            category: 'idea'
          });
          suggestionId++;
        }
      }
      
      // If we found suggestions with this pattern, don't try other patterns
      if (suggestions.length > 0) {
        break;
      }
    }
    
    // Additional check for questions as suggestions
    if (suggestions.length === 0) {
      const questionPattern = /(?:^|\n)\s*[-*•]?\s*(.+\?)\s*(?=\n|$)/g;
      const questionMatches = [...responseText.matchAll(questionPattern)];
      
      for (const match of questionMatches) {
        const question = match[1]?.trim();
        if (question && question.length > 15 && question.length < 200) {
          suggestions.push({
            id: `suggestion-${suggestionId}`,
            text: question,
            category: 'idea'
          });
          suggestionId++;
        }
      }
    }
    
    console.log('[GeminiService] extractNumberedSuggestions found:', suggestions.length, 'suggestions');
    return suggestions.slice(0, 4); // Limit to 4 suggestions max
  }
  
  // Helper method to build system prompt based on step and action
  private buildSystemPrompt(step: string, action: string, context?: any): string {
    // CRITICAL: Handle action-specific prompts first with context
    if (action === 'ideas') {
      return this.buildIdeasActionPrompt(step, context);
    }
    
    if (action === 'whatif') {
      return this.buildWhatIfActionPrompt(step, context);
    }
    
    if (action === 'help') {
      return this.buildHelpActionPrompt(step, context);
    }
    
    // CRITICAL: Be very specific about which step we're on
    if (step === 'IDEATION_BIG_IDEA') {
      // ALWAYS include wizard context for proper suggestions
      const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
      
      const basePrompt = `You are a helpful colleague helping an educator develop their Big Idea for a project-based learning experience.
      
${wizardContext}

IMPORTANT: Be conversational and concise. Focus ONLY on the Big Idea right now. 

The Big Idea is the overarching concept or theme that will drive the entire project. Based on their context, help them think about what matters most to their students.

NEVER ask for information already provided. Instead, build on their context to provide thoughtful guidance.

Respond conversationally as a supportive colleague. Ask ONE clarifying question or make ONE helpful observation. Do NOT provide numbered lists or multiple suggestions unless they explicitly ask for ideas.

Keep it warm, brief, and focused on continuing the conversation.`;
      
      // Add length constraints to the prompt
      return addLengthConstraintToPrompt(basePrompt, ResponseContext.BRAINSTORMING);
    }
    
    if (step === 'IDEATION_EQ') {
      // Include both wizard context and Big Idea
      const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
      const bigIdea = context?.ideation?.bigIdea || '';
      const contextPrompt = bigIdea ? `\n\nTheir established Big Idea is: "${bigIdea}"` : '';
      
      const basePrompt = `You are a supportive colleague helping an educator develop their Essential Question.

${wizardContext}

IMPORTANT: Be conversational and concise. Focus on the Essential Question.${contextPrompt}

The Essential Question should be open-ended and drive inquiry throughout the project, connecting to their Big Idea.

Respond as a thoughtful colleague. Make ONE helpful observation or ask ONE clarifying question about what kind of inquiry they want to spark. Do NOT provide numbered lists or multiple suggestions unless they explicitly ask for ideas.

Keep it brief, warm, and conversational.`;
      
      return addLengthConstraintToPrompt(basePrompt, ResponseContext.BRAINSTORMING);
    }
    
    if (step === 'IDEATION_CHALLENGE') {
      // Include wizard context plus Big Idea and Essential Question
      const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
      const bigIdea = context?.ideation?.bigIdea || '';
      const essentialQuestion = context?.ideation?.essentialQuestion || '';
      let contextPrompt = '';
      
      if (bigIdea) contextPrompt += `\n\nTheir established Big Idea is: "${bigIdea}"`;
      if (essentialQuestion) contextPrompt += `\nTheir Essential Question is: "${essentialQuestion}"`;
      
      const basePrompt = `You are a supportive colleague helping an educator define their Challenge.

${wizardContext}

IMPORTANT: Be conversational and concise. Focus on the Challenge.${contextPrompt}

The Challenge should be a concrete, authentic task that connects to their Big Idea and Essential Question.

Respond as a helpful colleague. Make ONE thoughtful observation or ask ONE clarifying question about what kind of authentic work they envision for students. Do NOT provide numbered lists or multiple suggestions unless they explicitly ask for ideas.

Keep it brief, encouraging, and conversational.`;
      
      return addLengthConstraintToPrompt(basePrompt, ResponseContext.BRAINSTORMING);
    }
    
    // More generic prompts for other steps
    const basePrompt = `You are a supportive colleague helping an educator design a project-based learning experience.`;
    
    if (step?.includes('JOURNEY')) {
      // CRITICAL FIX: Include ideation context for Journey stages
      const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
      const bigIdea = context?.ideation?.bigIdea || '';
      const essentialQuestion = context?.ideation?.essentialQuestion || '';
      const challenge = context?.ideation?.challenge || '';
      
      let contextPrompt = '';
      if (bigIdea) contextPrompt += `\nBig Idea: "${bigIdea}"`;
      if (essentialQuestion) contextPrompt += `\nEssential Question: "${essentialQuestion}"`;
      if (challenge) contextPrompt += `\nChallenge: "${challenge}"`;
      
      return `${basePrompt}

${wizardContext}

IMPORTANT: Be conversational and concise (2-3 sentences maximum). Help them plan the learning journey that supports their established project.${contextPrompt ? `\n\nProject Context:${contextPrompt}` : ''}

Respond as a thoughtful colleague. Ask ONE clarifying question or make ONE helpful observation. Do NOT provide numbered lists or multiple suggestions unless they explicitly ask for ideas.

Keep it brief, warm, and focused on the current step.`;
    } else if (step?.includes('DELIVER')) {
      // CRITICAL FIX: Include both ideation and journey context for Deliverables stages
      const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
      const bigIdea = context?.ideation?.bigIdea || '';
      const essentialQuestion = context?.ideation?.essentialQuestion || '';
      const challenge = context?.ideation?.challenge || '';
      
      let contextPrompt = '';
      if (bigIdea) contextPrompt += `\nBig Idea: "${bigIdea}"`;
      if (essentialQuestion) contextPrompt += `\nEssential Question: "${essentialQuestion}"`;
      if (challenge) contextPrompt += `\nChallenge: "${challenge}"`;
      
      return `${basePrompt}

${wizardContext}

IMPORTANT: Be conversational and concise (2-3 sentences maximum). Help them create deliverables and assessments that align with their established project.${contextPrompt ? `\n\nProject Context:${contextPrompt}` : ''}

Respond as a supportive colleague. Ask ONE clarifying question or make ONE helpful observation. Do NOT provide numbered lists or multiple suggestions unless they explicitly ask for ideas.

Keep it brief, encouraging, and focused on the current step.`;
    }
    
    return basePrompt + `\n\nBe conversational and concise (2-3 sentences maximum). Respond as a helpful colleague.`;
  }

  // Build prompt for 'ideas' action - generates suggestion cards
  private buildIdeasActionPrompt(step: string, context?: any): string {
    const stepContext = this.getStepContext(step);
    
    // ALWAYS include wizard context
    const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
    
    // CRITICAL FIX: Use actual blueprint context to generate contextual suggestions
    let contextualPrompt = wizardContext;
    
    if (step === 'IDEATION_EQ') {
      const currentEQ = context?.ideation?.essentialQuestion || '';
      const bigIdea = context?.ideation?.bigIdea || '';
      
      if (currentEQ) {
        contextualPrompt = `
The educator is working on refining their Essential Question:
"${currentEQ}"

${bigIdea ? `Their Big Idea is: "${bigIdea}"

` : ''}Generate 4 specific suggestions to help them refine, improve, or explore variations of this Essential Question. Focus on making it more engaging, specific, or thought-provoking for students.`;
      } else {
        contextualPrompt = `
The educator needs help developing an Essential Question${bigIdea ? ` based on their Big Idea: "${bigIdea}"` : ''}.

Generate 4 specific Essential Question suggestions that are open-ended, thought-provoking, and drive inquiry throughout the project.`;
      }
    } else if (step === 'IDEATION_BIG_IDEA') {
      const currentBigIdea = context?.ideation?.bigIdea || '';
      const wizardData = context?.wizard || {};
      
      if (currentBigIdea) {
        contextualPrompt = `
The educator is refining their Big Idea:
"${currentBigIdea}"

${wizardData.subject ? `Subject: ${wizardData.subject}
` : ''}${wizardData.students ? `Students: ${wizardData.students}
` : ''}Generate 4 specific suggestions to help them enhance, refine, or explore variations of this Big Idea. These should be conceptual themes, NOT project descriptions.`;
      } else {
        contextualPrompt = `
The educator is developing their Big Idea.${wizardData.subject ? ` Subject: ${wizardData.subject}.` : ''}${wizardData.students ? ` Students: ${wizardData.students}.` : ''}

Generate 4 specific Big Ideas - these should be CONCEPTUAL THEMES or OVERARCHING CONCEPTS (like "The intersection of AI and human creativity" or "Power and responsibility in technology"), NOT project descriptions or activities. Focus on themes that are meaningful to students and connect to real-world applications.`;
      }
    } else if (step === 'IDEATION_CHALLENGE') {
      const currentChallenge = context?.ideation?.challenge || '';
      const essentialQuestion = context?.ideation?.essentialQuestion || '';
      const bigIdea = context?.ideation?.bigIdea || '';
      
      if (currentChallenge) {
        contextualPrompt = `
The educator is refining their Challenge:
"${currentChallenge}"

${essentialQuestion ? `Essential Question: "${essentialQuestion}"
` : ''}${bigIdea ? `Big Idea: "${bigIdea}"
` : ''}Generate 4 specific suggestions to help them enhance or refine this Challenge.`;
      } else {
        contextualPrompt = `
The educator is defining their Challenge.${essentialQuestion ? ` Essential Question: "${essentialQuestion}"` : ''}${bigIdea ? ` Big Idea: "${bigIdea}"` : ''}

Generate 4 specific suggestions for authentic tasks, problems, or creation opportunities that students will tackle. Make them concrete and achievable within a project timeframe.`;
      }
    } else if (step.startsWith('JOURNEY_')) {
      // Journey stage suggestions
      const relevantData = this.extractRelevantContext(step, context);
      contextualPrompt = `${relevantData ? `Current project context:
${relevantData}

` : ''}${stepContext.description}`;
    } else if (step.startsWith('DELIVER_')) {
      // Deliverables stage suggestions
      const relevantData = this.extractRelevantContext(step, context);
      contextualPrompt = `${relevantData ? `Current project context:
${relevantData}

` : ''}${stepContext.description}`;
    } else {
      // For other steps, try to extract relevant context
      const relevantData = this.extractRelevantContext(step, context);
      contextualPrompt = relevantData ? `Current context: ${relevantData}

${stepContext.description}` : stepContext.description;
    }
    
    return `You are helping an educator by providing specific, actionable suggestions for their ${stepContext.name}.

CRITICAL: You must respond in JSON format with exactly 4 suggestions in a "suggestions" array. Each suggestion must have:
- id: a unique identifier
- text: the suggestion text (concise, actionable)
- category: "idea"

Context: ${contextualPrompt}

Generate 4 contextual, practical suggestions that build on their current work. Make them specific to their context, not generic advice.

IMPORTANT: For Big Ideas, provide CONCEPTUAL THEMES (like "The intersection of AI and human creativity"), NOT questions or project descriptions.
For Essential Questions, provide open-ended questions.
For Challenges, provide specific tasks or problems.

Example format for the current step:
{
  "suggestions": [
    {
      "id": "suggestion-1", 
      "text": "[Appropriate suggestion for this step type]",
      "category": "idea"
    },
    {
      "id": "suggestion-2",
      "text": "[Appropriate suggestion for this step type]", 
      "category": "idea"
    },
    {
      "id": "suggestion-3",
      "text": "[Appropriate suggestion for this step type]",
      "category": "idea"  
    },
    {
      "id": "suggestion-4",
      "text": "[Appropriate suggestion for this step type]",
      "category": "idea"
    }
  ]
}`;
  }

  // Build prompt for 'whatif' action - generates what-if scenarios
  private buildWhatIfActionPrompt(step: string, context?: any): string {
    const stepContext = this.getStepContext(step);
    
    // ALWAYS include wizard context
    const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
    
    // CRITICAL FIX: Use actual blueprint context to generate contextual what-if scenarios
    let contextualPrompt = wizardContext;
    
    if (step === 'IDEATION_EQ') {
      const currentEQ = context?.ideation?.essentialQuestion || '';
      const bigIdea = context?.ideation?.bigIdea || '';
      
      if (currentEQ) {
        contextualPrompt = `
The educator is working on their Essential Question:
"${currentEQ}"

${bigIdea ? `Their Big Idea is: "${bigIdea}"

` : ''}Generate 4 "what if" scenarios that could transform or extend this Essential Question to make it even more engaging and relevant for students.`;
      } else {
        contextualPrompt = `
The educator needs help developing an Essential Question${bigIdea ? ` based on their Big Idea: "${bigIdea}"` : ''}.

Generate 4 "what if" scenarios for potential Essential Questions that could drive inquiry and engagement.`;
      }
    } else if (step === 'IDEATION_BIG_IDEA') {
      const currentBigIdea = context?.ideation?.bigIdea || '';
      const wizardData = context?.wizard || {};
      
      if (currentBigIdea) {
        contextualPrompt = `
The educator is working on their Big Idea:
"${currentBigIdea}"

${wizardData.subject ? `Subject: ${wizardData.subject}
` : ''}${wizardData.students ? `Students: ${wizardData.students}
` : ''}Generate 4 "what if" scenarios that could expand or transform this Big Idea theme. These should explore different conceptual angles or connections, NOT project activities.`;
      } else {
        contextualPrompt = `
The educator is developing their Big Idea.${wizardData.subject ? ` Subject: ${wizardData.subject}.` : ''}${wizardData.students ? ` Students: ${wizardData.students}.` : ''}

Generate 4 "what if" scenarios for potential Big Ideas - these should be CONCEPTUAL THEMES presented as "what if" explorations (like "What if technology could amplify human creativity rather than replace it?"), NOT project descriptions.`;
      }
    } else if (step === 'IDEATION_CHALLENGE') {
      const currentChallenge = context?.ideation?.challenge || '';
      const essentialQuestion = context?.ideation?.essentialQuestion || '';
      const bigIdea = context?.ideation?.bigIdea || '';
      
      if (currentChallenge) {
        contextualPrompt = `
The educator is working on their Challenge:
"${currentChallenge}"

${essentialQuestion ? `Essential Question: "${essentialQuestion}"
` : ''}${bigIdea ? `Big Idea: "${bigIdea}"
` : ''}Generate 4 "what if" scenarios that could elevate this project challenge to be more authentic, meaningful, or connected to real-world impact.`;
      } else {
        contextualPrompt = `
The educator is defining their Challenge.${essentialQuestion ? ` Essential Question: "${essentialQuestion}"` : ''}${bigIdea ? ` Big Idea: "${bigIdea}"` : ''}

Generate 4 "what if" scenarios for potential Challenges that could create authentic, meaningful learning experiences.`;
      }
    } else if (step.startsWith('JOURNEY_')) {
      // Journey stage what-if scenarios
      const relevantData = this.extractRelevantContext(step, context);
      contextualPrompt = `${relevantData ? `Current project context:
${relevantData}

` : ''}Generate 4 "what if" scenarios that could enhance or transform their approach to ${stepContext.name.toLowerCase()}.`;
    } else if (step.startsWith('DELIVER_')) {
      // Deliverables stage what-if scenarios
      const relevantData = this.extractRelevantContext(step, context);
      contextualPrompt = `${relevantData ? `Current project context:
${relevantData}

` : ''}Generate 4 "what if" scenarios that could elevate their approach to ${stepContext.name.toLowerCase()}.`;
    } else {
      // For other steps, try to extract relevant context
      const relevantData = this.extractRelevantContext(step, context);
      contextualPrompt = relevantData ? `Current context: ${relevantData}

${stepContext.description}` : stepContext.description;
    }
    
    return `You are helping an educator explore "what if" scenarios for their ${stepContext.name}.

CRITICAL: You must respond in JSON format with exactly 4 "what if" suggestions in a "suggestions" array. Each suggestion must have:
- id: a unique identifier  
- text: a "what if" scenario (starting with "What if...")
- category: "whatif"

Context: ${contextualPrompt}

Generate 4 thought-provoking "what if" scenarios that could enhance or transform their current approach.

Example format:
{
  "suggestions": [
    {
      "id": "whatif-1",
      "text": "What if students created an AI ethics policy for your school district?",
      "category": "whatif"
    },
    {
      "id": "whatif-2", 
      "text": "What if students interviewed professionals about how they use AI ethically in their work?",
      "category": "whatif"
    },
    {
      "id": "whatif-3",
      "text": "What if students developed AI literacy workshops for parents and community members?",
      "category": "whatif"
    },
    {
      "id": "whatif-4",
      "text": "What if students created a peer mentoring program around responsible AI use?",
      "category": "whatif" 
    }
  ]
}`;
  }

  // Build prompt for 'help' action - provides guidance
  private buildHelpActionPrompt(step: string, context?: any): string {
    const stepContext = this.getStepContext(step);
    
    // ALWAYS include wizard context for contextual help
    const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
    
    return `You are a supportive colleague helping an educator understand ${stepContext.name} in project-based learning.

${wizardContext}

IMPORTANT: Be conversational and concise (3-4 sentences maximum). Explain what ${stepContext.name} means and why it matters for their students.

Provide a brief, clear explanation that helps them understand the concept. Use their context to make it relevant to ${context?.wizard?.subject || 'their subject'} and ${context?.wizard?.students || 'their students'}.

NEVER ask for information already provided. Keep it warm, brief, and focused on building their understanding.

Do NOT provide a JSON response for help - provide a regular conversational response that feels like a helpful colleague explaining the concept.`;
  }

  // Get context information for each step
  private getStepContext(step: string): { name: string; description: string } {
    const stepContexts: Record<string, { name: string; description: string }> = {
      'IDEATION_BIG_IDEA': {
        name: 'Big Idea',
        description: 'The educator needs concrete suggestions for overarching themes or concepts that will anchor their project-based learning experience.'
      },
      'IDEATION_EQ': {
        name: 'Essential Question', 
        description: 'The educator needs examples of open-ended, thought-provoking questions that will drive student inquiry throughout the project.'
      },
      'IDEATION_CHALLENGE': {
        name: 'Challenge',
        description: 'The educator needs specific ideas for authentic tasks, problems, or creation opportunities that students will tackle.'
      },
      'JOURNEY_PHASES': {
        name: 'Learning Phases',
        description: 'The educator needs suggestions for organizing their project into meaningful learning phases or stages.'
      },
      'JOURNEY_ACTIVITIES': {
        name: 'Learning Activities',
        description: 'The educator needs specific activity ideas that will engage students and build necessary skills.'
      },
      'JOURNEY_RESOURCES': {
        name: 'Learning Resources', 
        description: 'The educator needs suggestions for materials, tools, and resources to support student learning.'
      },
      'DELIVER_MILESTONES': {
        name: 'Project Milestones',
        description: 'The educator needs ideas for key checkpoints and deliverables throughout the project timeline.'
      },
      'DELIVER_RUBRIC': {
        name: 'Assessment Criteria',
        description: 'The educator needs suggestions for criteria and standards to evaluate student work and learning.'
      },
      'DELIVER_IMPACT': {
        name: 'Project Impact',
        description: 'The educator needs ideas for authentic audiences and methods for students to share their work and make an impact.'
      }
    };
    
    return stepContexts[step] || { name: 'Project Element', description: 'The educator needs suggestions for this aspect of their project.' };
  }
  
  // Helper method to extract relevant context for suggestions
  private extractRelevantContext(step: string, context?: any): string {
    if (!context) return '';
    
    let relevantInfo = [];
    
    // Add ideation context if available
    if (context.ideation) {
      if (context.ideation.bigIdea) relevantInfo.push(`Big Idea: "${context.ideation.bigIdea}"`);
      if (context.ideation.essentialQuestion) relevantInfo.push(`Essential Question: "${context.ideation.essentialQuestion}"`);
      if (context.ideation.challenge) relevantInfo.push(`Challenge: "${context.ideation.challenge}"`);
    }
    
    // Add journey context for deliverable steps
    if (step.startsWith('DELIVER') && context.journey) {
      if (context.journey.phases && context.journey.phases.length > 0) {
        relevantInfo.push(`Journey Phases: ${context.journey.phases.map((p: any) => p.title || p).join(', ')}`);
      }
      if (context.journey.activities && context.journey.activities.length > 0) {
        relevantInfo.push(`Activities: ${context.journey.activities.slice(0, 3).join(', ')}${context.journey.activities.length > 3 ? '...' : ''}`);
      }
    }
    
    // Add wizard context - always include this fundamental info
    if (context.wizard) {
      if (context.wizard.subject) relevantInfo.push(`Subject: ${context.wizard.subject}`);
      // Fix: Use 'students' field which is what WizardWrapper saves
      if (context.wizard.students) relevantInfo.push(`Age Group: ${context.wizard.students}`);
      if (context.wizard.duration) relevantInfo.push(`Duration: ${context.wizard.duration}`);
      if (context.wizard.alfFocus) relevantInfo.push(`ALF Focus: ${context.wizard.alfFocus}`);
      if (context.wizard.scope) relevantInfo.push(`Scope: ${context.wizard.scope}`);
    }
    
    return relevantInfo.length > 0 ? relevantInfo.join('\n') : '';
  }
  
  // Detect user confusion and need for clarification
  private detectConfusion(userInput: string | undefined): boolean {
    if (!userInput || typeof userInput !== 'string') {
      return false;
    }
    
    const input = userInput.toLowerCase().trim();
    
    // Patterns that indicate confusion or need for clarification
    const confusionPatterns = [
      /not sure/,
      /don't understand/,
      /confused/,
      /what.*mean/,
      /what.*that/,
      /unclear/,
      /i don't get it/,
      /explain/,
      /clarify/,
      /what.*supposed to/,
      /how.*supposed to/,
      /what.*looking for/,
      /what.*want/,
      /huh/,
      /what\?$/,
      /sorry\?$/
    ];
    
    return confusionPatterns.some(pattern => pattern.test(input));
  }
  
  // Helper method to detect when user text input is requesting suggestions
  private detectSuggestionRequest(userInput: string | undefined, currentAction: string): string | null {
    if (!userInput || typeof userInput !== 'string' || currentAction === 'ideas' || currentAction === 'whatif') {
      return null; // Already an action, or no input to analyze
    }
    
    const input = userInput.toLowerCase().trim();
    
    // Patterns that indicate user wants suggestions/ideas
    const ideaPatterns = [
      /can you give me (some )?suggestions?/,
      /give me (some )?ideas?/,
      /i need (some )?suggestions?/,
      /i need (some )?ideas?/,
      /suggest (some|something)/,
      /what are some ideas?/,
      /any suggestions?/,
      /any ideas?/,
      /help me think of/,
      /brainstorm/,
      /help me come up with/,
      /what would you suggest/,
      /what do you think/ // Only if followed by "about" or similar
    ];
    
    // Patterns that indicate user wants "what if" scenarios
    const whatIfPatterns = [
      /what if/,
      /scenarios?/,
      /possibilities/,
      /alternatives?/,
      /different ways?/,
      /other options?/
    ];
    
    // Check for what-if patterns first (more specific)
    for (const pattern of whatIfPatterns) {
      if (pattern.test(input)) {
        console.log('[GeminiService] Detected whatif request:', input.substring(0, 50));
        return 'whatif';
      }
    }
    
    // Check for general idea/suggestion patterns
    for (const pattern of ideaPatterns) {
      if (pattern.test(input)) {
        console.log('[GeminiService] Detected ideas request:', input.substring(0, 50));
        return 'ideas';
      }
    }
    
    return null;
  }
  
  // Generate clarification suggestions when user is confused
  private generateClarificationSuggestions(step: string, context: any, userInput: string): any[] {
    const stepContext = this.getStepContext(step);
    const suggestions: any[] = [];
    
    // Generate contextual clarification options based on the step
    if (step === 'IDEATION_BIG_IDEA') {
      suggestions.push(
        {
          id: 'clarify-big-idea-1',
          text: 'What exactly is a Big Idea?',
          category: 'clarification'
        },
        {
          id: 'clarify-big-idea-2', 
          text: 'Show me some examples of Big Ideas',
          category: 'clarification'
        },
        {
          id: 'clarify-big-idea-3',
          text: 'How is this different from a lesson topic?',
          category: 'clarification'
        },
        {
          id: 'clarify-big-idea-4',
          text: 'Can you give me a template to follow?',
          category: 'clarification'
        }
      );
    } else if (step === 'IDEATION_EQ') {
      suggestions.push(
        {
          id: 'clarify-eq-1',
          text: 'What makes a good Essential Question?',
          category: 'clarification'
        },
        {
          id: 'clarify-eq-2',
          text: 'Show me examples of Essential Questions',
          category: 'clarification'
        },
        {
          id: 'clarify-eq-3',
          text: 'How does this connect to my Big Idea?',
          category: 'clarification'
        },
        {
          id: 'clarify-eq-4',
          text: 'What should I avoid in an Essential Question?',
          category: 'clarification'
        }
      );
    } else if (step === 'IDEATION_CHALLENGE') {
      suggestions.push(
        {
          id: 'clarify-challenge-1',
          text: 'What exactly is a Challenge?',
          category: 'clarification'
        },
        {
          id: 'clarify-challenge-2',
          text: 'Show me examples of good Challenges',
          category: 'clarification'
        },
        {
          id: 'clarify-challenge-3',
          text: 'How does this relate to my Essential Question?',
          category: 'clarification'
        },
        {
          id: 'clarify-challenge-4',
          text: 'What makes a Challenge authentic?',
          category: 'clarification'
        }
      );
    } else {
      // Generic clarification options for other steps
      suggestions.push(
        {
          id: 'clarify-generic-1',
          text: `What exactly is ${stepContext.name}?`,
          category: 'clarification'
        },
        {
          id: 'clarify-generic-2',
          text: `Show me examples of ${stepContext.name}`,
          category: 'clarification'
        },
        {
          id: 'clarify-generic-3',
          text: 'Can you break this down for me?',
          category: 'clarification'
        },
        {
          id: 'clarify-generic-4',
          text: 'What should I focus on first?',
          category: 'clarification'
        }
      );
    }
    
    return suggestions;
  }
  
  // Ensure response is conversational and appropriately sized
  private ensureConversationalResponse(message: string, step: string, action: string): string {
    if (!message || message.trim() === '') {
      return "I'm here to help you with your project! What would you like to work on?";
    }
    
    // Determine appropriate response context based on action and step
    const responseContext = this.getResponseContext(action, step);
    
    // Apply length enforcement using the utility
    const enforced = enforceResponseLength(message, responseContext);
    
    // For regular conversation (not action-based), ensure it's conversational
    if (action !== 'ideas' && action !== 'whatif' && action !== 'help') {
      // If the response was shortened, add a conversational continuation
      if (enforced.wasModified && enforced.text.length > 0) {
        // Remove any trailing ellipsis and add a natural continuation
        let finalText = enforced.text.replace(/\.{3}$/, '').trim();
        if (!finalText.match(/[.!?]$/)) {
          finalText += '.';
        }
        finalText += " What aspect would you like to explore further?";
        return finalText;
      }
    }
    
    return enforced.text;
  }
  
  // Determine appropriate response context for length control
  private getResponseContext(action: string, step: string): ResponseContext {
    if (action === 'help') {
      return ResponseContext.HELP_CONTENT;
    }
    
    if (action === 'ideas' || action === 'whatif') {
      return ResponseContext.BRAINSTORMING;
    }
    
    // For step initiators, use brainstorming context
    if (step.includes('_BIG_IDEA') || step.includes('_EQ') || step.includes('_CHALLENGE')) {
      return ResponseContext.BRAINSTORMING;
    }
    
    // Default to brainstorming for most interactions
    return ResponseContext.BRAINSTORMING;
  }
  
  // Helper method to build chat history
  private buildHistory(context: any, userInput: string): ChatMessage[] {
    const history: ChatMessage[] = [];
    
    // Add user input if provided
    if (userInput) {
      history.push({
        role: 'user',
        parts: [{ text: sanitizeString(userInput) }]
      });
    }
    
    return history;
  }
}

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
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const responseText = await validateGeminiAPIResponse(response);
      console.log(`Raw AI Response (Attempt ${attempt}):`, responseText);

      // Report success to connection status
      connectionStatus.reportGeminiSuccess();

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
      
      // Report error to connection status
      connectionStatus.reportGeminiError(error as Error);
      
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
