// src/services/geminiService.js

/**
 * This service module is responsible for all communication with the
 * Google Gemini API. It abstracts away the `fetch` calls and error
 * handling, providing a clean interface for the rest of the application.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// ** FIX: Reverted the model name back to gemini-2.0-flash, which we know works. **
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

/**
 * A robust function to send a prompt and conversation history to the Gemini API.
 * It can be configured to request either a standard text response or a JSON object.
 *
 * @param {Array<object>} history - The conversation history. Each object should have 'role' and 'parts'.
 * @param {string} systemPrompt - The dynamically generated system prompt from the orchestrator.
 * @param {boolean} expectJson - If true, configures the API to return a JSON object.
 * @returns {Promise<object>} The response from the API (either text or a parsed JSON object).
 */
const generateResponse = async (history, systemPrompt, expectJson = false) => {
  // The full content sent to the API includes the system prompt and the chat history.
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "Understood. I am ready to proceed." }] },
    ...history
  ];

  const payload = {
    contents: contents,
  };

  // If we expect a JSON response, add the generationConfig to the payload.
  if (expectJson) {
    payload.generationConfig = {
      responseMimeType: "application/json",
    };
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
      console.error("API Error Body:", errorBody);
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("Invalid response structure from API.");
    }

    const responseText = result.candidates[0].content.parts[0].text;

    // If we expected JSON, parse the text. Otherwise, return the raw text.
    return expectJson ? JSON.parse(responseText) : responseText;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    return { error: { message: `Failed to communicate with the AI service: ${error.message}` } };
  }
};

/**
 * A convenience function for getting a standard chat response.
 */
export const generateChatResponse = (history, systemPrompt) => {
  return generateResponse(history, systemPrompt, false);
};

/**
 * A convenience function for getting a JSON response.
 */
export const generateJsonResponse = (history, systemPrompt) => {
    // Note: The system prompt itself should instruct the AI on the JSON format.
    return generateResponse(history, systemPrompt, true);
};
