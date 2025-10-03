/**
 * AIResponseParser.ts
 * Robust parsing utility for extracting structured data from AI responses
 */

import { type SuggestionCard } from '../types/SOPTypes';

export class AIResponseParser {
  /**
   * Extract suggestion cards from AI response
   */
  static extractSuggestions(response: any): SuggestionCard[] {
    // If already an array of suggestion cards, return as-is
    if (Array.isArray(response)) {
      return response.map((item, index) => ({
        id: item.id || `suggestion_${index}`,
        text: typeof item === 'string' ? item : (item.text || ''),
        category: item.category || 'idea'
      }));
    }

    // If response has suggestions property
    if (response?.suggestions && Array.isArray(response.suggestions)) {
      return response.suggestions.map((item: any, index: number) => ({
        id: item.id || `suggestion_${index}`,
        text: typeof item === 'string' ? item : (item.text || ''),
        category: item.category || 'idea'
      }));
    }

    // Try to extract from message content with numbered format
    if (typeof response === 'string' || response?.message) {
      const content = typeof response === 'string' ? response : response.message;
      const suggestions: SuggestionCard[] = [];
      
      // Match numbered suggestions (1. Text, 2. Text, etc.)
      const numberedPattern = /^\d+\.\s*(.+)$/gm;
      const matches = content.matchAll(numberedPattern);
      
      let index = 0;
      for (const match of matches) {
        suggestions.push({
          id: `suggestion_${index}`,
          text: match[1].trim(),
          category: 'idea'
        });
        index++;
      }
      
      if (suggestions.length > 0) {
        return suggestions;
      }

      // Try bullet points
      const bulletPattern = /^[•·-]\s*(.+)$/gm;
      const bulletMatches = content.matchAll(bulletPattern);
      
      index = 0;
      for (const match of bulletMatches) {
        suggestions.push({
          id: `suggestion_${index}`,
          text: match[1].trim(),
          category: 'idea'
        });
        index++;
      }
      
      return suggestions;
    }

    return [];
  }

  /**
   * Extract list items from AI response (for phases, activities, resources)
   */
  static extractListItems(data: any, type: 'activities' | 'resources' | 'phases' | 'milestones'): string[] {
    // If already an array of strings, return as-is
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'string') {return item;}
        if (item?.text) {return item.text;}
        if (item?.title) {return item.title;}
        if (item?.name) {return item.name;}
        return String(item);
      });
    }

    // If it's a string, try to parse it
    if (typeof data === 'string') {
      const items: string[] = [];
      
      // Try numbered list (1. Item, 2. Item)
      const numberedPattern = /^\d+\.\s*(.+)$/gm;
      const numberedMatches = data.matchAll(numberedPattern);
      
      for (const match of numberedMatches) {
        items.push(match[1].trim());
      }
      
      if (items.length > 0) {return items;}
      
      // Try bullet points
      const bulletPattern = /^[•·-]\s*(.+)$/gm;
      const bulletMatches = data.matchAll(bulletPattern);
      
      for (const match of bulletMatches) {
        items.push(match[1].trim());
      }
      
      if (items.length > 0) {return items;}
      
      // Try newline separated items
      const lines = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.toLowerCase().includes('here are') && !line.includes(':'));
      
      if (lines.length > 0) {return lines;}
      
      // If nothing else works, return the whole string as single item
      return [data];
    }

    // Handle object with specific properties
    if (data && typeof data === 'object') {
      if (data[type]) {
        return this.extractListItems(data[type], type);
      }
      
      // Try common property names
      const possibleProps = ['items', 'list', 'data', 'content'];
      for (const prop of possibleProps) {
        if (data[prop]) {
          return this.extractListItems(data[prop], type);
        }
      }
    }

    return [];
  }

  /**
   * Extract structured phase data with titles and descriptions
   */
  static extractPhases(data: any): Array<{ title: string; description: string }> {
    // If already properly structured
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'string') {
          return { title: item, description: '' };
        }
        return {
          title: item.title || item.name || 'Untitled Phase',
          description: item.description || item.details || ''
        };
      });
    }

    // Parse from string
    if (typeof data === 'string') {
      const phases: Array<{ title: string; description: string }> = [];
      
      // Try to match phases with descriptions (Phase: Description format)
      const phasePattern = /^(?:\d+\.\s*)?([^:]+):\s*(.+)$/gm;
      const matches = data.matchAll(phasePattern);
      
      for (const match of matches) {
        phases.push({
          title: match[1].trim(),
          description: match[2].trim()
        });
      }
      
      if (phases.length > 0) {return phases;}
      
      // Fall back to simple list
      const items = this.extractListItems(data, 'phases');
      return items.map(item => ({ title: item, description: '' }));
    }

    return [];
  }

  /**
   * Extract rubric criteria
   */
  static extractRubricCriteria(data: any): Array<{ 
    criterion: string; 
    description: string; 
    weight?: number 
  }> {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'string') {
          return { criterion: item, description: '' };
        }
        return {
          criterion: item.criterion || item.name || item.title || 'Criterion',
          description: item.description || '',
          weight: item.weight || item.points
        };
      });
    }

    if (data?.criteria) {
      return this.extractRubricCriteria(data.criteria);
    }

    // Parse from string
    const items = this.extractListItems(data, 'activities');
    return items.map(item => ({ criterion: item, description: '' }));
  }

  /**
   * Extract impact data (audience and method)
   */
  static extractImpactData(data: any): { 
    audience: string; 
    method: string; 
    purpose?: string 
  } {
    // If already properly structured
    if (data && typeof data === 'object') {
      if (data.audience && data.method) {
        return {
          audience: data.audience,
          method: data.method,
          purpose: data.purpose || data.goal || ''
        };
      }
    }

    // Try to parse from string
    if (typeof data === 'string') {
      const audienceMatch = data.match(/audience[:\s]+([^.!?\n]+)/i);
      const methodMatch = data.match(/method[:\s]+([^.!?\n]+)/i);
      const shareMatch = data.match(/share[:\s]+([^.!?\n]+)/i);
      
      return {
        audience: audienceMatch ? audienceMatch[1].trim() : '',
        method: methodMatch ? methodMatch[1].trim() : (shareMatch ? shareMatch[1].trim() : ''),
        purpose: ''
      };
    }

    return { audience: '', method: '', purpose: '' };
  }

  /**
   * Validate that extracted data meets minimum requirements
   */
  static validateExtractedData(data: any, type: string): boolean {
    switch (type) {
      case 'IDEATION_BIG_IDEA':
        return typeof data === 'string' && data.length > 0;
      
      case 'JOURNEY_PHASES':
        return Array.isArray(data) && data.length >= 1;
      
      case 'JOURNEY_ACTIVITIES':
        return Array.isArray(data) && data.length >= 3;
      
      case 'JOURNEY_RESOURCES':
        return Array.isArray(data) && data.length >= 1;
      
      case 'DELIVER_MILESTONES':
        return Array.isArray(data) && data.length >= 2;
      
      case 'DELIVER_IMPACT':
        return data?.audience && data?.method;
      
      default:
        return true;
    }
  }
}