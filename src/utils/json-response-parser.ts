// JSON Response Parser - Safely extracts content from AI responses
// Handles various formats and edge cases to prevent crashes
// CRITICAL: Never shows raw JSON to users - always extracts clean content

import { logger } from './logger';

interface ParsedResponse {
  success: boolean;
  content: string;
  suggestions?: SuggestionItem[];
  buttons?: string[];
  isStageComplete?: boolean;
  interactionType?: string;
  raw?: any;
  error?: string;
}

export interface SuggestionItem {
  id: string;
  text: string;
  category: string;
}

// Type guards for safe parsing
const isString = (value: unknown): value is string => typeof value === 'string';
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
const isObject = (value: unknown): value is Record<string, unknown> => 
  value !== null && typeof value === 'object' && !Array.isArray(value);

export class JSONResponseParser {
  /**
   * Safely parse AI response that might be JSON or plain text
   * CRITICAL: Never shows raw JSON to users - always returns clean, user-friendly content
   * Always returns a usable string, never throws
   */
  static parse(response: string): ParsedResponse {
    if (!response || typeof response !== 'string') {
      return {
        success: false,
        content: 'Invalid response received',
        error: 'Response was not a string'
      };
    }

    const trimmed = response.trim();
    
    // If it's plain text without JSON markers, return as-is
    if (!trimmed.includes('{') && !trimmed.includes('[')) {
      return {
        success: true,
        content: trimmed
      };
    }

    // Try to extract and parse JSON
    const strategies = [
      // Direct JSON parse
      () => JSON.parse(trimmed),
      
      // Extract JSON from mixed content
      () => {
        const match = trimmed.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
      },
      
      // Handle code blocks
      () => {
        const match = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        return match ? JSON.parse(match[1]) : null;
      },
      
      // Handle arrays
      () => {
        const match = trimmed.match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : null;
      },
      
      // Handle partial JSON at start
      () => {
        const endIndex = trimmed.lastIndexOf('}');
        if (endIndex > 0) {
          const partial = trimmed.substring(0, endIndex + 1);
          return JSON.parse(partial);
        }
        return null;
      }
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        const parsed = strategy();
        if (parsed && typeof parsed === 'object') {
          // CRITICAL: Extract all useful content, not just text
          const extracted = this.extractAllContent(parsed);
          if (extracted.content) {
            return {
              success: true,
              ...extracted,
              raw: parsed
            };
          }
        }
      } catch (e) {
        // Continue to next strategy
        continue;
      }
    }

    // If all JSON parsing fails, clean up the text
    const cleaned = this.cleanupText(trimmed);
    return {
      success: true,
      content: cleaned,
      error: 'Could not parse as JSON, returning cleaned text'
    };
  }

  /**
   * Extract all useful content from parsed JSON object
   * CRITICAL: Ensures suggestions are never shown as raw JSON
   */
  private static extractAllContent(obj: any): Partial<ParsedResponse> {
    const result: Partial<ParsedResponse> = {
      content: this.extractTextContent(obj)
    };
    
    // Extract suggestions safely - never show raw JSON
    const suggestions = this.extractSuggestions(obj);
    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }
    
    // Extract buttons safely
    const buttons = this.extractButtons(obj);
    if (buttons.length > 0) {
      result.buttons = buttons;
    }
    
    // Extract other safe fields
    if (typeof obj.isStageComplete === 'boolean') {
      result.isStageComplete = obj.isStageComplete;
    }
    
    if (isString(obj.interactionType)) {
      result.interactionType = obj.interactionType;
    }
    
    return result;
  }
  
  /**
   * Extract text content from parsed JSON object
   */
  private static extractTextContent(obj: any): string | null {
    // Check common response fields
    const fields = [
      'chatResponse',
      'response',
      'message',
      'content',
      'text',
      'answer',
      'reply'
    ];

    for (const field of fields) {
      if (obj[field] && typeof obj[field] === 'string') {
        return obj[field];
      }
    }

    // Check for nested structures
    if (obj.data) {
      const nested = this.extractTextContent(obj.data);
      if (nested) {return nested;}
    }

    // Check for assistant/bot response structure
    if (obj.assistant) {
      const nested = this.extractTextContent(obj.assistant);
      if (nested) {return nested;}
    }

    // If it's an array, try the first element
    if (Array.isArray(obj) && obj.length > 0) {
      const first = this.extractTextContent(obj[0]);
      if (first) {return first;}
    }

    return null;
  }
  
  /**
   * Extract and clean suggestions - NEVER shows raw JSON to users
   */
  private static extractSuggestions(obj: any): SuggestionItem[] {
    const suggestions = obj.suggestions;
    if (!isArray(suggestions)) {return [];}
    
    return suggestions
      .map((item, index) => this.normalizeSuggestion(item, index))
      .filter((item): item is SuggestionItem => item !== null)
      .slice(0, 4); // Limit to 4 suggestions
  }
  
  /**
   * Normalize a suggestion item to ensure it's clean and user-friendly
   */
  private static normalizeSuggestion(item: unknown, index: number): SuggestionItem | null {
    if (isString(item)) {
      // Skip if it looks like raw JSON
      if (item.includes('{') || item.includes('"id"') || item.includes('"category"')) {
        return null;
      }
      return {
        id: `suggestion-${index + 1}`,
        text: this.cleanText(item),
        category: 'idea'
      };
    }
    
    if (isObject(item) && isString(item.text)) {
      // Skip malformed suggestions
      if (!item.text.trim() || item.text.includes('{')) {
        return null;
      }
      return {
        id: isString(item.id) ? item.id : `suggestion-${index + 1}`,
        text: this.cleanText(item.text),
        category: isString(item.category) ? item.category : 'idea'
      };
    }
    
    return null;
  }
  
  /**
   * Extract and clean buttons array
   */
  private static extractButtons(obj: any): string[] {
    const buttons = obj.buttons;
    if (!isArray(buttons)) {return [];}
    
    return buttons
      .filter(isString)
      .map(btn => this.cleanText(btn))
      .filter(btn => btn.length > 0 && !btn.includes('{')) // Skip JSON-like buttons
      .slice(0, 4); // Limit to 4 buttons
  }
  
  /**
   * Clean text to remove formatting artifacts and escape sequences
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\\n/g, ' ') // Replace escaped newlines
      .replace(/\\t/g, ' ') // Replace escaped tabs
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\'/g, "'") // Unescape single quotes
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Clean up text that might have JSON artifacts
   * CRITICAL: Removes all JSON-like structures to prevent raw JSON display
   */
  private static cleanupText(text: string): string {
    let cleaned = text;
    
    // CRITICAL: Remove entire JSON structures to prevent raw JSON display
    cleaned = cleaned.replace(/\{[\s\S]*?\}/g, ''); // Remove JSON objects
    cleaned = cleaned.replace(/\[[\s\S]*?\]/g, ''); // Remove JSON arrays
    
    // Remove common JSON prefixes and syntax
    cleaned = cleaned.replace(/^(chatResponse|response|message|content|suggestions)\s*:\s*["']?/i, '');
    cleaned = cleaned.replace(/["']\s*[,}]\s*$/g, ''); // Remove trailing JSON syntax
    cleaned = cleaned.replace(/[{}\[\]"]/g, ''); // Remove JSON characters
    cleaned = cleaned.replace(/,\s*$/gm, ''); // Remove trailing commas
    cleaned = cleaned.replace(/^\s*,\s*/gm, ''); // Remove leading commas
    
    // Remove escape sequences
    cleaned = cleaned.replace(/\\n/g, ' '); // Replace newlines with spaces
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\\\/g, '\\');
    
    // Remove code block markers
    cleaned = cleaned.replace(/```json?\s*/g, '');
    cleaned = cleaned.replace(/```\s*$/g, '');
    
    // Remove JSON key-value patterns
    cleaned = cleaned.replace(/"[^"]*"\s*:/g, '');
    
    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // If text is too short or still looks like JSON, provide fallback
    if (cleaned.length < 10 || cleaned.includes('id:') || cleaned.includes('category:')) {
      cleaned = "I'm here to help you with your project!";
    }
    
    return cleaned;
  }

  /**
   * Validate if a response is well-formed
   */
  static validate(response: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!response || typeof response !== 'string') {
      issues.push('Response is not a string');
      return { valid: false, issues };
    }
    
    if (response.length === 0) {
      issues.push('Response is empty');
      return { valid: false, issues };
    }
    
    if (response.length > 10000) {
      issues.push('Response is unusually long');
    }
    
    // Check for common error patterns
    if (response.includes('undefined')) {
      issues.push('Response contains undefined values');
    }
    
    if (response.includes('```') && !response.includes('```\n')) {
      issues.push('Response has unclosed code blocks');
    }
    
    // Count braces
    const openBraces = (response.match(/\{/g) || []).length;
    const closeBraces = (response.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push('Mismatched braces in response');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default JSONResponseParser;