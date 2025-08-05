// src/services/geminiService.js - BULLETPROOF JSON HANDLING AND ERROR RECOVERY
import { ResponseHealer } from '../utils/responseHealer.js';

// Use secure Netlify function endpoint instead of direct API calls
const API_URL_BASE = '/.netlify/functions/gemini';

// --- Rate Limiting Configuration ---
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
const MAX_RETRIES = 2;

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

/**
 * Flexible content extraction that prioritizes getting SOMETHING useful
 * @param {string} text - Raw AI response text
 * @returns {object} - Always returns a usable response object
 */
const extractFlexibleResponse = (text) => {
  if (!text || typeof text !== 'string') {
    return { chatResponse: "I'm here to help! Let's work on your project together." };
  }

  // Strategy 1: Try to parse as complete JSON
  const jsonMatches = text.match(/\{[\s\S]*\}/g);
  if (jsonMatches) {
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch {
        continue;
      }
    }
  }

  // Strategy 2: Extract JSON between braces with error tolerance
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonString = text.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      // Continue to partial extraction
    }
  }

  // Strategy 3: Partial field extraction - look for key fields even if JSON is broken
  const partialResponse = {};
  
  // Look for chatResponse content (most important)
  const chatMatch = text.match(/"chatResponse"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s) ||
                   text.match(/'chatResponse'\s*:\s*'([^']*(?:\\.[^']*)*)'/s) ||
                   text.match(/chatResponse[:\s]+([^\n\r]+)/);
  
  if (chatMatch) {
    partialResponse.chatResponse = chatMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
  }

  // Look for buttons array
  const buttonsMatch = text.match(/"buttons"\s*:\s*\[([^\]]*)\]/s);
  if (buttonsMatch) {
    try {
      partialResponse.buttons = JSON.parse(`[${buttonsMatch[1]}]`);
    } catch {
      // Extract individual button strings
      const buttonStrings = buttonsMatch[1].match(/"([^"]*)"/g);
      if (buttonStrings) {
        partialResponse.buttons = buttonStrings.map(s => s.slice(1, -1));
      }
    }
  }

  // Look for stage completion
  const stageCompleteMatch = text.match(/"isStageComplete"\s*:\s*(true|false)/i);
  if (stageCompleteMatch) {
    partialResponse.isStageComplete = stageCompleteMatch[1].toLowerCase() === 'true';
  }

  // Strategy 4: If no chatResponse found anywhere, use the entire text as conversational content
  if (!partialResponse.chatResponse) {
    // Clean up the text - remove JSON artifacts and use as chat content
    const cleanText = text
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
 * @param {object} responseObj - Any response object (can be partial)
 * @param {string} stage - Current project stage
 * @returns {object} - Always returns a complete, usable response
 */
const enrichResponseWithDefaults = (responseObj, stage) => {
  if (!responseObj || typeof responseObj !== 'object') {
    responseObj = {};
  }

  // Build complete response with progressive enhancement
  const enriched = {
    // Core required fields with sensible defaults
    interactionType: responseObj.interactionType || (stage === 'Ideation' ? 'conversationalIdeation' : 'Standard'),
    currentStage: responseObj.currentStage || stage,
    chatResponse: responseObj.chatResponse || '',
    isStageComplete: responseObj.isStageComplete === true, // Only true if explicitly true
    
    // UI enhancement fields - use if well-formed, otherwise null
    buttons: Array.isArray(responseObj.buttons) ? responseObj.buttons : null,
    suggestions: Array.isArray(responseObj.suggestions) ? responseObj.suggestions : null,
    frameworkOverview: (responseObj.frameworkOverview && typeof responseObj.frameworkOverview === 'object') 
      ? responseObj.frameworkOverview : null,
    guestSpeakerHints: Array.isArray(responseObj.guestSpeakerHints) ? responseObj.guestSpeakerHints : null,
    
    // Stage-specific fields - preserve if present, use null for undefined to avoid Firestore errors
    summary: (responseObj.summary && typeof responseObj.summary === 'object') 
      ? responseObj.summary : null,
    curriculumDraft: responseObj.curriculumDraft || null,
    newAssignment: (responseObj.newAssignment && typeof responseObj.newAssignment === 'object') 
      ? responseObj.newAssignment : null,
    assessmentMethods: Array.isArray(responseObj.assessmentMethods) 
      ? responseObj.assessmentMethods : null,
  };

  // Ensure chatResponse always has content
  if (!enriched.chatResponse || enriched.chatResponse.trim() === '') {
    enriched.chatResponse = generateContextualFallback(stage);
  }

  // Clean and validate buttons if present
  if (enriched.buttons) {
    enriched.buttons = enriched.buttons
      .filter(btn => typeof btn === 'string' && btn.trim().length > 0)
      .slice(0, 4); // Limit to 4 buttons max
  }

  return enriched;
};

/**
 * Creates contextual fallback messages based on project stage
 * @param {string} stage - Current project stage  
 * @returns {string} - Contextual fallback message
 */
const generateContextualFallback = (stage) => {
  const fallbacks = {
    'Ideation': "I'm here to help you design a meaningful project! Let's explore how to transform your vision into an engaging learning experience. What aspects of your project idea would you like to develop first?",
    'Curriculum': "Now let's build the learning journey for your students! I'll help you create activities that prepare them for success. What key skills should students develop in this project?", 
    'Assignments': "Time to design authentic assessments! Let's create ways for students to demonstrate their learning through real-world application. What would be the most meaningful way for students to show their mastery?",
    'default': "I'm here to help you design an amazing learning experience! What would you like to work on together?"
  };
  
  return fallbacks[stage] || fallbacks.default;
};


/**
 * Main service function: Generates robust JSON responses with comprehensive error handling
 * @param {Array} history - Chat history for context
 * @param {string} systemPrompt - System prompt defining AI task
 * @returns {Promise<object>} - Validated JSON response object
 */
export const generateJsonResponse = async (history, systemPrompt) => {
  // Determine stage from prompt for fallback purposes
  const stage = systemPrompt.includes('IDEATION') ? 'Ideation' : 
               systemPrompt.includes('CURRICULUM') ? 'Curriculum' : 
               systemPrompt.includes('ASSIGNMENTS') ? 'Assignments' : 'Ideation';

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();

      const conversationHistory = [
        { 
          role: 'user', 
          parts: [{ text: systemPrompt }] 
        },
        { 
          role: 'model', 
          parts: [{ text: "I understand. I will provide a complete, valid JSON response that follows all instructions and helps the educator design their project effectively." }] 
        },
        ...history
      ];

      const payload = {
        prompt: systemPrompt,
        history: conversationHistory
      };

      console.log(`Attempt ${attempt}: Sending request to Netlify function`);
      
      const response = await fetch(API_URL_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      // Validate API response structure
      if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response structure from Gemini API");
      }

      const responseText = result.candidates[0].content.parts[0].text;
      console.log(`Raw AI Response (Attempt ${attempt}):`, responseText);

      // Flexible extraction - always gets something useful
      const extractedResponse = extractFlexibleResponse(responseText);
      
      // Use smart healing instead of rigid validation - never fails, always returns usable response
      const healedResponse = ResponseHealer.heal(extractedResponse, stage, '');
      
      console.log(`Processed response (Attempt ${attempt}):`, healedResponse);
      
      // Success! We always have a usable response now
      return healedResponse;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === MAX_RETRIES) {
        console.error("All retry attempts exhausted, creating fallback response");
        // Create a fallback response even for API failures using healer
        return ResponseHealer.heal({
          chatResponse: `I'm experiencing some technical difficulties, but I'm still here to help you with your ${stage.toLowerCase()} work! What would you like to focus on?`
        }, stage, '');
      }
      
      // Exponential backoff for API failures only
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  // This should never be reached due to fallback in catch block, but just in case
  console.error("Unexpected code path - generating final fallback");
  return ResponseHealer.heal({
    chatResponse: "I'm ready to help you with your project! What would you like to work on?"
  }, stage, '');
};