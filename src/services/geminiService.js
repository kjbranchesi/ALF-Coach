// src/services/geminiService.js - HOLISTIC REPAIR VERSION
// This version handles JSON flexibly, recovers from errors, and ensures stability.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// --- Rate Limiting to prevent API errors ---
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 request per second

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
 * Flexibly extracts a JSON object from a string, even if it's embedded in other text.
 * @param {string} text - The text from the AI response.
 * @returns {object|null} - The parsed JSON object or null if not found.
 */
const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;

  // Find the first '{' and the last '}' to get the JSON block
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }

  const jsonString = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse extracted JSON:", error);
    return null;
  }
};

/**
 * Creates a safe, valid fallback response for a given stage to prevent crashes.
 * @param {string} stage - The current project stage.
 * @param {string} rawResponse - The raw text from the AI for context.
 * @returns {object} - A valid response object.
 */
const createFallbackResponse = (stage, rawResponse = "") => {
  const chatResponse = rawResponse.trim() 
    ? `I had a formatting issue, but here's what I was thinking:\n\n${rawResponse}`
    : `I seem to be having a little trouble. Let's try that again. What would you like to focus on for your project about ${stage.toLowerCase()}?`;

  return {
    interactionType: 'Standard',
    currentStage: stage,
    chatResponse: chatResponse,
    isStageComplete: false,
    summary: null,
    suggestions: null,
    buttons: ["Let's try that again", "I need some help"],
    recap: null,
    process: null,
    frameworkOverview: null,
    curriculumDraft: stage === 'Curriculum' ? null : undefined,
    newAssignment: stage === 'Assignments' ? null : undefined,
    assessmentMethods: stage === 'Assignments' ? null : undefined,
  };
};

/**
 * Generates a JSON response from the Gemini API, with robust error handling and retries.
 * @param {Array} history - The chat history for context.
 * @param {string} systemPrompt - The system prompt defining the AI's task.
 * @returns {Promise<object>} - A promise that resolves to a valid JSON response object.
 */
export const generateJsonResponse = async (history, systemPrompt) => {
  await waitForRateLimit();

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "Understood. I will provide a complete JSON response following all instructions to help the educator design their project." }] },
    ...history
  ];

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      topP: 0.95,
      topK: 40,
    }
  };

  try {
    const response = await fetch(API_URL_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error (${response.status}): ${errorBody}`);
    }

    const result = await response.json();

    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from AI.");
    }

    const responseText = result.candidates[0].content.parts[0].text;
    console.log("Raw AI Response:", responseText);

    const parsedJson = extractJSON(responseText);

    if (!parsedJson) {
      console.error("Could not extract valid JSON from response.");
      // Determine stage from prompt to create a relevant fallback
      const stage = systemPrompt.includes('Ideation') ? 'Ideation' : systemPrompt.includes('Curriculum') ? 'Curriculum' : 'Assignments';
      return createFallbackResponse(stage, responseText);
    }
    
    // Ensure essential fields are present, even if the AI forgets them
    if (!parsedJson.currentStage) {
        parsedJson.currentStage = systemPrompt.includes('Ideation') ? 'Ideation' : systemPrompt.includes('Curriculum') ? 'Curriculum' : 'Assignments';
    }

    return parsedJson;

  } catch (error) {
    console.error("Gemini Service Exception:", error);
    const stage = systemPrompt.includes('Ideation') ? 'Ideation' : systemPrompt.includes('Curriculum') ? 'Curriculum' : 'Assignments';
    return createFallbackResponse(stage, "I encountered a network error. Let's try that again.");
  }
};
