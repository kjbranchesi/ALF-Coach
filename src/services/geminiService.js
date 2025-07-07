// src/services/geminiService.js

/**
 * This service module is responsible for all communication with the
 * Google Gemini API. It abstracts away the `fetch` calls and error
 * handling, providing a clean interface for the rest of the application.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Using the secure environment variable
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

/**
 * Sends a conversational turn to the Gemini API and gets a response.
 * @param {Array<object>} history - The entire conversation history.
 * @param {string} systemPrompt - The dynamically generated system prompt from the orchestrator.
 * @returns {Promise<object>} The JSON response from the API.
 */
export const generateChatResponse = async (history, systemPrompt) => {
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "Understood. I am ready to proceed." }] },
    ...history
  ];

  const payload = {
    contents: contents,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Gemini Service Error:", error);
    // Return a structured error so the UI can handle it gracefully
    return { error: { message: "Failed to communicate with the AI service." } };
  }
};


/**
 * Sends a prompt to the Gemini API that specifically requests a JSON object.
 * @param {string} systemPrompt - The prompt instructing the AI to return JSON.
 * @returns {Promise<object>} The parsed JSON object from the AI's response.
 */
export const generateJsonResponse = async (systemPrompt) => {
    const payload = {
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API call for JSON failed with status: ${response.status}`);
        }

        const result = await response.json();
        // The response text itself is a JSON string that needs to be parsed
        const jsonText = result.candidates[0].content.parts[0].text;
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Gemini JSON Service Error:", error);
        return { error: { message: "Failed to process structured data from the AI service." } };
    }
};
