import { useState, useCallback } from 'react';
// Removed GoogleGenerativeAI import - now using secure Netlify function

interface GeminiMessage {
  role: 'user' | 'model' | 'system';
  parts: string;
}

interface GeminiResponse {
  text: string;
  suggestions?: string[];
}

interface UseGeminiStreamReturn {
  sendMessage: (messages: GeminiMessage[]) => Promise<GeminiResponse>;
  isStreaming: boolean;
  error: Error | null;
}

// Exponential backoff configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useGeminiStream(): UseGeminiStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (messages: GeminiMessage[]): Promise<GeminiResponse> => {
    setIsStreaming(true);
    setError(null);

    try {
      let lastError: Error | null = null;
      
      // Retry logic with exponential backoff
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          // Convert messages to history format for Netlify function
          const conversationHistory = messages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            parts: [{ text: msg.parts }]
          }));

          // Extract the prompt from the last message
          const lastMessage = messages[messages.length - 1];
          const prompt = lastMessage.parts;

          const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: prompt,
              history: conversationHistory.slice(0, -1) // Don't include the current message in history
            })
          });

          if (!response.ok) {
            throw new Error(`API Error ${response.status}`);
          }

          const data = await response.json();
          
          let text = '';
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = data.candidates[0].content.parts[0].text;
          } else {
            throw new Error('Invalid response format from Netlify function');
          }

          // Extract suggestions if present in the response
          let suggestions: string[] | undefined;
          
          // Look for suggestions in a specific format like [SUGGESTIONS: idea1, idea2, idea3]
          const suggestionMatch = text.match(/\[SUGGESTIONS?:([^\]]+)\]/i);
          if (suggestionMatch) {
            suggestions = suggestionMatch[1]
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);
          }

          // Remove the suggestions marker from the text
          const cleanText = text.replace(/\[SUGGESTIONS?:[^\]]+\]/gi, '').trim();

          return {
            text: cleanText,
            suggestions
          };
        } catch (err) {
          lastError = err as Error;
          console.warn(`Gemini API attempt ${attempt + 1} failed:`, lastError.message);
          
          // Check if it's a 503 error (model overloaded)
          const isOverloaded = lastError.message.includes('503') || 
                             lastError.message.toLowerCase().includes('overloaded');
          
          // Check if it's an API key error (don't retry)
          const isApiKeyError = lastError.message.includes('API key');
          
          if (isApiKeyError || attempt === MAX_RETRIES) {
            throw lastError;
          }
          
          if (isOverloaded && attempt < MAX_RETRIES) {
            // Calculate delay with exponential backoff
            const delay = Math.min(INITIAL_DELAY * Math.pow(2, attempt), MAX_DELAY);
            console.log(`Waiting ${delay}ms before retry...`);
            await sleep(delay);
            continue;
          }
          
          throw lastError;
        }
      }
      
      // If we get here, all retries failed
      const finalError = lastError || new Error('Failed to get response from Gemini API');
      setError(finalError);
      throw finalError;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return {
    sendMessage,
    isStreaming,
    error
  };
}