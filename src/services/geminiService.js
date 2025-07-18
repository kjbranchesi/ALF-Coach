// src/services/geminiService.js - BULLETPROOF JSON HANDLING AND ERROR RECOVERY

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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
 * Advanced JSON extraction with multiple fallback strategies
 * @param {string} text - Raw AI response text
 * @returns {object|null} - Parsed JSON object or null
 */
const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;

  // Strategy 1: Look for complete JSON objects
  const jsonMatches = text.match(/\{[\s\S]*\}/g);
  if (jsonMatches) {
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match);
        if (parsed && typeof parsed === 'object' && parsed.chatResponse !== undefined) {
          return parsed;
        }
      } catch {
        continue; // Try next match
      }
    }
  }

  // Strategy 2: Find JSON-like content between braces
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonString = text.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.warn("JSON parse failed on extracted string:", error);
    }
  }

  // Strategy 3: Try to fix common JSON formatting issues
  try {
    // Fix unescaped quotes in strings
    let fixedText = text.replace(/([^\\])"/g, '$1\\"');
    // Try to parse again
    const repaired = JSON.parse(fixedText);
    if (repaired && typeof repaired === 'object') {
      return repaired;
    }
  } catch {
    // Final attempt failed
  }

  return null;
};

/**
 * Validates and enriches a parsed JSON response
 * @param {object} jsonObj - Parsed JSON object
 * @param {string} stage - Current project stage
 * @returns {object} - Validated and enriched response
 */
const validateAndEnrichResponse = (jsonObj, stage) => {
  if (!jsonObj || typeof jsonObj !== 'object') {
    return null;
  }

  // Ensure all required fields exist
  const enriched = {
    interactionType: jsonObj.interactionType || 'Standard',
    currentStage: jsonObj.currentStage || stage,
    chatResponse: jsonObj.chatResponse || '',
    isStageComplete: Boolean(jsonObj.isStageComplete),
    // Optional fields - preserve if present, otherwise null
    buttons: jsonObj.buttons || null,
    suggestions: jsonObj.suggestions || null,
    frameworkOverview: jsonObj.frameworkOverview || null,
    summary: jsonObj.summary || null,
    curriculumDraft: jsonObj.curriculumDraft || undefined,
    newAssignment: jsonObj.newAssignment || undefined,
    assessmentMethods: jsonObj.assessmentMethods || undefined,
  };

  // Critical validation: Ensure chatResponse is never empty
  if (!enriched.chatResponse || enriched.chatResponse.trim() === '') {
    console.warn("Empty chatResponse detected, applying contextual fallback");
    enriched.chatResponse = generateContextualFallback(stage);
  }

  // Validate JSON structure integrity
  if (!enriched.interactionType || !enriched.currentStage) {
    console.warn("Missing critical fields in JSON response");
    return null;
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
 * Creates a comprehensive fallback response when all else fails
 * @param {string} stage - Current project stage
 * @param {string} rawResponse - Original AI response for context
 * @returns {object} - Complete fallback response object
 */
const createComprehensiveFallback = (stage, rawResponse = "") => {
  const contextualMessage = rawResponse.trim() 
    ? `I had a formatting issue, but here's what I was thinking: ${rawResponse.substring(0, 200)}...`
    : generateContextualFallback(stage);

  return {
    interactionType: 'Standard',
    currentStage: stage,
    chatResponse: contextualMessage,
    isStageComplete: false,
    buttons: ["Let's try that again", "I need some guidance"],
    suggestions: null,
    frameworkOverview: null,
    summary: null,
    curriculumDraft: stage === 'Curriculum' ? null : undefined,
    newAssignment: stage === 'Assignments' ? null : undefined,
    assessmentMethods: stage === 'Assignments' ? null : undefined,
  };
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

  let lastError = null;

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();

      const contents = [
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
        contents: contents,
        generationConfig: {
          temperature: 0.6, // Slightly more deterministic
          maxOutputTokens: 4096,
          topP: 0.9,
          topK: 40,
        }
      };

      console.log(`Attempt ${attempt}: Sending request to Gemini API`);
      
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

      // Extract and validate JSON
      const extractedJson = extractJSON(responseText);
      
      if (!extractedJson) {
        console.warn(`Attempt ${attempt}: Could not extract valid JSON from response`);
        
        if (attempt === MAX_RETRIES) {
          // Last attempt - create fallback with raw response
          return createComprehensiveFallback(stage, responseText);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Validate and enrich the response
      const validatedResponse = validateAndEnrichResponse(extractedJson, stage);
      
      if (!validatedResponse) {
        console.warn(`Attempt ${attempt}: JSON validation failed`);
        
        if (attempt === MAX_RETRIES) {
          return createComprehensiveFallback(stage, responseText);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      console.log(`Success on attempt ${attempt}:`, validatedResponse);
      return validatedResponse;

    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === MAX_RETRIES) {
        console.error("All retry attempts exhausted");
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  // All attempts failed - return comprehensive fallback
  console.error("Generating fallback response due to persistent failures:", lastError);
  return createComprehensiveFallback(stage, `I encountered a technical issue: ${lastError?.message || 'Unknown error'}. Let's continue with your project design.`);
};