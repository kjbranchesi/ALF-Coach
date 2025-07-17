// src/services/geminiService.js - COMPLETE FILE
// This version handles JSON flexibly and recovers from errors

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

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
 * Try to extract JSON from various response formats
 */
const extractJSON = (text) => {
  // First, try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error("Failed to extract JSON:", e2);
      }
    }
  }
  return null;
};

/**
 * Ensure response has all required fields
 */
const ensureRequiredFields = (response, stage) => {
  // Base fields every response needs
  const baseFields = {
    interactionType: 'Standard',
    currentStage: stage,
    chatResponse: response.chatResponse || "Let me help you with your project.",
    isStageComplete: response.isStageComplete || false,
    summary: response.summary || null,
    suggestions: response.suggestions || null,
    buttons: response.buttons || null,
    recap: response.recap || null,
    process: response.process || null,
    frameworkOverview: response.frameworkOverview || null
  };

  // Stage-specific fields
  if (stage === 'Learning Journey' || stage === 'Curriculum') {
    baseFields.curriculumDraft = response.curriculumDraft || null;
  }
  
  if (stage === 'Student Deliverables' || stage === 'Assignments') {
    baseFields.newAssignment = response.newAssignment || null;
    baseFields.assessmentMethods = response.assessmentMethods || null;
  }

  // Merge with response, preferring response values
  return { ...baseFields, ...response };
};

/**
 * Main function to generate responses
 */
const generateResponse = async (history, systemPrompt, expectJson = false, retryCount = 0) => {
  await waitForRateLimit();

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "I understand and will help you create an amazing project-based learning experience." }] },
    ...history
  ];

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048, // Increased for more detailed responses
      topP: 0.95,
      topK: 40
    }
  };

  // Don't force JSON mime type - let's be flexible
  // if (expectJson) {
  //   payload.generationConfig.responseMimeType = "application/json";
  // }

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
    console.log("Raw AI response:", responseText.substring(0, 200) + "...");

    if (expectJson) {
      // Try to parse as JSON
      const parsed = extractJSON(responseText);
      
      if (!parsed) {
        console.error("Could not extract JSON from response");
        // Return a fallback response
        return {
          interactionType: 'Standard',
          currentStage: 'Ideation',
          chatResponse: responseText || "I'm having trouble formatting my response. Let me try again. What would you like to work on?",
          isStageComplete: false,
          summary: null,
          suggestions: null,
          buttons: ["Let's start fresh", "Help me understand"],
          recap: null,
          process: null,
          frameworkOverview: null
        };
      }

      // Determine stage from prompt or response
      let stage = parsed.currentStage || 'Ideation';
      if (systemPrompt.includes('Learning Journey') || systemPrompt.includes('Curriculum')) {
        stage = 'Learning Journey';
      } else if (systemPrompt.includes('Student Deliverables') || systemPrompt.includes('Assignments')) {
        stage = 'Student Deliverables';
      }

      // Ensure all required fields exist
      const validResponse = ensureRequiredFields(parsed, stage);
      
      return validResponse;
      
    } else {
      return responseText;
    }

  } catch (error) {
    console.error("Gemini Service Error:", error);
    
    if (expectJson) {
      // Return a helpful fallback that won't break the app
      return {
        interactionType: 'Standard',
        currentStage: 'Ideation',
        chatResponse: "I apologize for the technical issue. Let's continue building your project. What aspect would you like to focus on?",
        isStageComplete: false,
        summary: null,
        suggestions: null,
        buttons: ["Start with the big idea", "Tell me about the framework"],
        recap: null,
        process: null,
        frameworkOverview: null
      };
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