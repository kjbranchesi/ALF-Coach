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

export function useGeminiStream(): UseGeminiStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (messages: GeminiMessage[]): Promise<GeminiResponse> => {
    setIsStreaming(true);
    setError(null);

    try {
      if (!API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
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
      const error = err as Error;
      setError(error);
      throw error;
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