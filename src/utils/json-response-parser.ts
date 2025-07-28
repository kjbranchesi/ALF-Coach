// JSON Response Parser - Safely extracts content from AI responses
// Handles various formats and edge cases to prevent crashes

import { logger } from './logger';

interface ParsedResponse {
  success: boolean;
  content: string;
  raw?: any;
  error?: string;
}

export class JSONResponseParser {
  /**
   * Safely parse AI response that might be JSON or plain text
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
          // Extract content from common AI response formats
          const content = this.extractContent(parsed);
          if (content) {
            return {
              success: true,
              content,
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
   * Extract content from parsed JSON object
   */
  private static extractContent(obj: any): string | null {
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
      const nested = this.extractContent(obj.data);
      if (nested) {return nested;}
    }

    // Check for assistant/bot response structure
    if (obj.assistant) {
      const nested = this.extractContent(obj.assistant);
      if (nested) {return nested;}
    }

    // If it's an array, try the first element
    if (Array.isArray(obj) && obj.length > 0) {
      const first = this.extractContent(obj[0]);
      if (first) {return first;}
    }

    return null;
  }

  /**
   * Clean up text that might have JSON artifacts
   */
  private static cleanupText(text: string): string {
    let cleaned = text;
    
    // Remove common JSON prefixes
    cleaned = cleaned.replace(/^(chatResponse|response|message|content)\s*:\s*["']?/i, '');
    
    // Remove trailing JSON syntax
    cleaned = cleaned.replace(/["']\s*[,}]\s*$/, '');
    
    // Remove escape sequences
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\\\/g, '\\');
    
    // Remove code block markers
    cleaned = cleaned.replace(/```json?\s*/g, '');
    cleaned = cleaned.replace(/```\s*$/g, '');
    
    // Trim again
    cleaned = cleaned.trim();
    
    // If we still have JSON-like structure, extract the value
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
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