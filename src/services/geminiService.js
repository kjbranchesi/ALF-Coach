// src/services/geminiService.js

import { validateResponse, createFallbackResponse } from '../utils/responseValidator.js';

/**
 * Enhanced Gemini service with better error handling and validation
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Rate limiting and retry logic
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Ensures we don't hit rate limits
 */
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
 * Enhanced function to generate responses with validation
 */
const generateResponse = async (history, systemPrompt, expectJson = false, retryCount = 0) => {
  await waitForRateLimit();

  // Simplify the system prompt if we're retrying
  let prompt = systemPrompt;
  if (retryCount > 0) {
    prompt = systemPrompt + '\n\nIMPORTANT: Keep your response extremely simple and focus on valid JSON.';
  }

  const contents = [
    { role: 'user', parts: [{ text: prompt }] },
    { role: 'model', parts: [{ text: "I understand and will respond with valid JSON." }] },
    ...history
  ];

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: retryCount > 0 ? 0.3 : 0.7, // Lower temperature on retry
      maxOutputTokens: 1024,
      topP: 0.95,
      topK: 40
    }
  };

  if (expectJson) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  try {
    const response = await fetch(API_URL_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error:", response.status, errorBody);
      
      // Handle rate limiting
      if (response.status === 429 && retryCount < 3) {
        console.log("Rate limited, waiting before retry...");
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return generateResponse(history, systemPrompt, expectJson, retryCount + 1);
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error("No response from AI");
    }

    const responseText = result.candidates[0].content.parts[0].text;

    if (expectJson) {
      try {
        const parsed = JSON.parse(responseText);
        
        // Extract stage from the parsed response or system prompt
        let expectedStage = parsed.currentStage || 'Ideation';
        if (systemPrompt.includes('STAGE 1')) expectedStage = 'Ideation';
        else if (systemPrompt.includes('STAGE 2')) expectedStage = 'Learning Journey';
        else if (systemPrompt.includes('STAGE 3')) expectedStage = 'Student Deliverables';
        
        // Validate the response
        const validation = validateResponse(parsed, expectedStage);
        
        if (!validation.isValid) {
          console.warn("Response validation failed:", validation.errors);
          
          // Use the fixed version if available
          if (validation.fixed) {
            console.log("Using fixed response");
            return validation.fixed;
          }
          
          // If we can't fix it and haven't retried too much, try again
          if (retryCount < 2) {
            console.log("Retrying with simpler prompt...");
            return generateResponse(history, systemPrompt, expectJson, retryCount + 1);
          }
        }
        
        return parsed;
        
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError, "Raw response:", responseText);
        
        // Try to extract JSON from the response if it's wrapped in something
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            // Extraction failed
          }
        }
        
        // If retry count is low, try again
        if (retryCount < 2) {
          return generateResponse(history, systemPrompt, expectJson, retryCount + 1);
        }
        
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      return responseText;
    }

  } catch (error) {
    console.error("Gemini Service Error:", error);
    
    // Return a properly formatted error response for JSON requests
    if (expectJson) {
      // Try to determine the stage from the prompt
      let stage = 'Ideation';
      if (systemPrompt.includes('STAGE 2')) stage = 'Learning Journey';
      else if (systemPrompt.includes('STAGE 3')) stage = 'Student Deliverables';
      
      return createFallbackResponse(stage, error.message);
    }
    
    return { error: { message: error.message } };
  }
};

/**
 * Public API functions
 */
export const generateChatResponse = (history, systemPrompt) => {
  return generateResponse(history, systemPrompt, false);
};

export const generateJsonResponse = (history, systemPrompt) => {
  return generateResponse(history, systemPrompt, true);
};