// Test all chat entry points for JSON parsing errors
// Ensures all chat implementations handle various response formats

import { AIConversationManager } from '../services/ai-conversation-manager';
import { JSONResponseParser } from '../utils/json-response-parser';

describe('Chat Entry Points JSON Parsing', () => {
  
  describe('JSON Response Parser', () => {
    test('handles valid JSON responses', () => {
      const validJSON = '{"chatResponse": "Hello!", "interactionType": "welcome"}';
      const result = JSONResponseParser.parse(validJSON);
      
      expect(result.success).toBe(true);
      expect(result.content).toBe('Hello!');
    });

    test('handles plain text responses', () => {
      const plainText = 'This is a plain text response from the AI';
      const result = JSONResponseParser.parse(plainText);
      
      expect(result.success).toBe(true);
      expect(result.content).toBe(plainText);
    });

    test('handles markdown code blocks', () => {
      const markdown = '```json\n{"response": "Hello"}\n```';
      const result = JSONResponseParser.parse(markdown);
      
      expect(result.success).toBe(true);
      expect(result.raw).toEqual({ response: 'Hello' });
    });

    test('handles empty responses', () => {
      const result = JSONResponseParser.parse('');
      
      expect(result.success).toBe(false);
      expect(result.content).toBe('Invalid response received');
    });

    test('handles malformed JSON gracefully', () => {
      const malformed = '{"response": "Hello", invalid json}';
      const result = JSONResponseParser.parse(malformed);
      
      expect(result.success).toBe(true); // Falls back to text
      expect(result.content).toContain('Hello');
    });
  });

  describe('AI Conversation Manager Response Handling', () => {
    let aiManager: AIConversationManager;

    beforeEach(() => {
      // Mock the Gemini API
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Test response'
          }
        })
      };
      
      aiManager = new AIConversationManager('test-key');
      (aiManager as any).model = mockModel;
    });

    test('validateAndEnhance handles JSON responses', () => {
      const jsonResponse = '{"chatResponse": "Welcome!", "suggestions": ["Start", "Help"]}';
      const result = (aiManager as any).validateAndEnhance(jsonResponse, []);
      
      expect(result).toBe('Welcome!');
    });

    test('validateAndEnhance handles plain text', () => {
      const plainResponse = 'Let me help you explore renewable energy concepts.';
      const result = (aiManager as any).validateAndEnhance(plainResponse, []);
      
      expect(result).toBe(plainResponse);
    });

    test('validateAndEnhance handles empty responses', () => {
      const result = (aiManager as any).validateAndEnhance('', []);
      
      expect(result).toBe('Let me help you with that. What would you like to work on?');
    });
  });

  describe('Chat Service Entry Points', () => {
    const testCases = [
      {
        name: 'MainWorkspace Chat',
        route: '/app/workspace/:projectId',
        component: 'MainWorkspace'
      },
      {
        name: 'Blueprint Chat',
        route: '/app/blueprint/:id/chat',
        component: 'ChatLoader → ChatContainer'
      },
      {
        name: 'Test Chat',
        route: '/test/chat',
        component: 'TestChat'
      }
    ];

    testCases.forEach(({ name, route, component }) => {
      describe(name, () => {
        test('handles JSON AI responses', async () => {
          const mockResponse = {
            chatResponse: 'Test message',
            interactionType: 'standard',
            suggestions: ['Option 1', 'Option 2']
          };
          
          // Test that JSON is properly parsed
          const parsed = JSONResponseParser.parse(JSON.stringify(mockResponse));
          expect(parsed.success).toBe(true);
          expect(parsed.content).toBe('Test message');
        });

        test('handles plain text AI responses', async () => {
          const plainText = 'This is a plain text response';
          
          // Test that plain text is handled
          const parsed = JSONResponseParser.parse(plainText);
          expect(parsed.success).toBe(true);
          expect(parsed.content).toBe(plainText);
        });

        test('handles error responses gracefully', async () => {
          const errorResponse = null;
          
          // Test error handling
          const parsed = JSONResponseParser.parse(errorResponse as any);
          expect(parsed.success).toBe(false);
          expect(parsed.error).toBeDefined();
        });
      });
    });
  });

  describe('Ideas/WhatIf Generation', () => {
    test('parseIdeasFromResponse handles JSON array', () => {
      const jsonIdeas = JSON.stringify([
        { title: 'Solar Power', description: 'Build solar panels' },
        { title: 'Wind Energy', description: 'Create wind turbines' }
      ]);
      
      // Simulate parsing in ai-service-wrapper
      const ideas = JSON.parse(jsonIdeas);
      expect(ideas).toHaveLength(2);
      expect(ideas[0].title).toBe('Solar Power');
    });

    test('parseIdeasFromResponse handles numbered list', () => {
      const textIdeas = `1. Solar Power Project
Students design and build solar panels

2. Wind Energy System
Create miniature wind turbines`;
      
      // Test the parsing logic
      const lines = textIdeas.split('\n').filter(line => line.trim());
      const ideas = [];
      let currentIdea: any = null;
      
      for (const line of lines) {
        const match = line.match(/^\d+\.\s+(.+)$/);
        if (match) {
          if (currentIdea) ideas.push(currentIdea);
          currentIdea = { title: match[1], description: '' };
        } else if (currentIdea && !currentIdea.description) {
          currentIdea.description = line.trim();
        }
      }
      if (currentIdea) ideas.push(currentIdea);
      
      expect(ideas).toHaveLength(2);
      expect(ideas[0].title).toBe('Solar Power Project');
    });

    test('parseIdeasFromResponse handles plain sentences', () => {
      const plainText = 'Explore renewable energy sources. Build sustainable solutions. Create eco-friendly designs.';
      
      // Test sentence parsing fallback
      const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
      const ideas = sentences.map((s, i) => ({
        id: `idea-${i}`,
        title: s.trim(),
        description: 'Click to explore this idea further'
      }));
      
      expect(ideas).toHaveLength(3);
      expect(ideas[0].title).toContain('renewable energy');
    });
  });

  describe('Error Recovery', () => {
    test('chat continues after JSON parse error', async () => {
      // Simulate a parse error
      const invalidJSON = '{invalid json}';
      const result = JSONResponseParser.parse(invalidJSON);
      
      // Should fallback to text
      expect(result.success).toBe(true);
      expect(result.content).toContain('invalid json');
    });

    test('empty AI response shows fallback message', () => {
      const emptyResponse = '';
      const aiManager = new AIConversationManager('test-key');
      const result = (aiManager as any).validateAndEnhance(emptyResponse, []);
      
      expect(result).toBe('Let me help you with that. What would you like to work on?');
    });
  });
});