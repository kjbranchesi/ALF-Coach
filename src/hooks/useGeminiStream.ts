import { useState, useCallback } from 'react';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

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
          if (!API_KEY) {
            throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
          }

          const genAI = new GoogleGenerativeAI(API_KEY);
          const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 1,
              maxOutputTokens: 2048,
              // Thinking is enabled by default in 2.5 Flash
              // You can control thinking budget if needed
            },
          });

          // Convert messages to Gemini format
          const chat = model.startChat({
            history: messages.slice(0, -1).map(msg => ({
              role: msg.role === 'system' ? 'user' : msg.role,
              parts: [{ text: msg.parts }]
            })),
          });

          // Send the last message
          const lastMessage = messages[messages.length - 1];
          const result = await chat.sendMessage(lastMessage.parts);
          const response = await result.response;
          const text = response.text();

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