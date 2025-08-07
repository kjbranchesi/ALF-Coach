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
  
  // Generate method for ChatInterface compatibility
  async generate({ step, context, action, userInput }: {
    step: string;
    context: any;
    action: string;
    userInput?: string;
  }): Promise<{ message: string; suggestions: any[]; data: any }> {
    // CRITICAL FIX: Pass context to system prompt builder
    const systemPrompt = this.buildSystemPrompt(step, action, context);
    const history = this.buildHistory(context, userInput);
    
    try {
      const response = await generateJsonResponse(history, systemPrompt);
      
      // For action-based requests (ideas, whatif), extract suggestions from the response data
      let suggestions: any[] = [];
      let message = response.chatResponse || "I'm here to help you with your project!";
      
      // Check if the AI response contains suggestions in the expected format
      if (action === 'ideas' || action === 'whatif') {
        // Try to extract suggestions from the response data or chatResponse
        suggestions = this.extractSuggestions(response);
        
        console.log('[GeminiService] Action:', action);
        console.log('[GeminiService] Raw response:', response);
        console.log('[GeminiService] Extracted suggestions:', suggestions);
        
        // If we successfully extracted suggestions, provide a brief message
        if (suggestions.length > 0) {
          message = action === 'ideas' 
            ? `Here are some ideas for your ${this.getStepContext(step).name.toLowerCase()}:` 
            : `What if scenarios for your ${this.getStepContext(step).name.toLowerCase()}:`;
        }
      }
      
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
  
  // Extract suggestions from AI response
  private extractSuggestions(response: any): any[] {
    // Try different ways to extract suggestions from the response
    
    // 1. Direct suggestions array
    if (response.suggestions && Array.isArray(response.suggestions)) {
      return response.suggestions;
    }
    
    // 2. Parse from chatResponse if it contains JSON
    if (response.chatResponse && typeof response.chatResponse === 'string') {
      try {
        // Look for JSON in the response
        const jsonMatch = response.chatResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
          }
        }
      } catch (error) {
        console.log('Could not parse JSON from chatResponse:', error);
      }
    }
    
    // 3. Check if the entire response is a suggestions object
    if (response.suggestions) {
      return Array.isArray(response.suggestions) ? response.suggestions : [];
    }
    
    // 4. Look for any property that might contain suggestions
    for (const key in response) {
      const value = response[key];
      if (Array.isArray(value) && value.length > 0 && value[0]?.text && value[0]?.id) {
        return value;
      }
    }
    
    return [];
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
      return `You are helping an educator develop their Big Idea for a project-based learning experience.
      
IMPORTANT: Focus ONLY on the Big Idea right now. Do NOT discuss Essential Questions or Challenges yet.

The Big Idea is the overarching concept or theme that will drive the entire project. 

Guide them to:
- Think about what matters most to their students
- Consider real-world connections
- Make it broad enough to explore but focused enough to be meaningful

Ask clarifying questions and provide 2-3 focused suggestions for their Big Idea.
Keep responses conversational and encouraging.`;
    }
    
    if (step === 'IDEATION_EQ') {
      return `You are helping an educator develop their Essential Question based on their Big Idea.

IMPORTANT: Focus ONLY on the Essential Question. The Big Idea has already been established.

The Essential Question should be:
- Open-ended and thought-provoking
- Drive inquiry throughout the project
- Connect to the Big Idea
- Relevant to students' lives

Provide 2-3 example Essential Questions and guide them to refine theirs.`;
    }
    
    if (step === 'IDEATION_CHALLENGE') {
      return `You are helping an educator define the Challenge for their project.

IMPORTANT: Focus ONLY on the Challenge. The Big Idea and Essential Question are already set.

The Challenge should be:
- A concrete, authentic task or problem
- Something students will create, solve, or investigate
- Aligned with the Big Idea and Essential Question
- Achievable within the project timeframe

Suggest 2-3 specific challenge ideas they could adapt.`;
    }
    
    // More generic prompts for other steps
    const basePrompt = `You are an AI assistant helping an educator design a project-based learning experience. Current step: ${step}. Action: ${action}.`;
    
    if (step?.includes('JOURNEY')) {
      return `${basePrompt} Help them plan the learning journey with phases, activities, and resources. Focus on the current substep only.`;
    } else if (step?.includes('DELIVER')) {
      return `${basePrompt} Assist with creating deliverables, assessments, and milestones. Focus on the current substep only.`;
    }
    
    return basePrompt;
  }

  // Build prompt for 'ideas' action - generates suggestion cards
  private buildIdeasActionPrompt(step: string, context?: any): string {
    const stepContext = this.getStepContext(step);
    
    // CRITICAL FIX: Use actual blueprint context to generate contextual suggestions
    let contextualPrompt = '';
    
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
    
    // CRITICAL FIX: Use actual blueprint context to generate contextual what-if scenarios
    let contextualPrompt = '';
    
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
    
    return `You are helping an educator understand ${stepContext.name} in project-based learning.

Provide a clear, helpful explanation that includes:
- What ${stepContext.name} means in the context of project-based learning
- Why it's important for student success
- Key characteristics of effective ${stepContext.name}
- Practical tips for development

Keep your response conversational and encouraging. Focus on helping them understand the concept so they can create their own.

Do NOT provide a JSON response for help - provide a regular conversational response.`;
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
