import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createContextManager, ContextManager } from '../../../src/services/context-manager';
import { ChatMessage } from '../../../src/services/chat-service';

describe('Context Maintenance - Critical Scenarios', () => {
  let contextManager: ContextManager;
  
  beforeEach(() => {
    contextManager = createContextManager();
  });

  describe('Long Conversation Context', () => {
    it('should maintain relevant context across entire journey', () => {
      // Simulate a complete journey
      const messages: ChatMessage[] = [
        // Ideation Stage
        {
          id: 'msg-1',
          role: 'user',
          content: 'I want to teach about renewable energy',
          timestamp: new Date(),
          metadata: { phase: 'step_entry', stage: 'IDEATION', step: 'IDEATION_BIG_IDEA' }
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Excellent choice! Renewable energy is a crucial topic.',
          timestamp: new Date(),
          metadata: { phase: 'step_confirm' }
        },
        {
          id: 'msg-3',
          role: 'user',
          content: 'How can we make a sustainable future?',
          timestamp: new Date(),
          metadata: { phase: 'step_entry', stage: 'IDEATION', step: 'IDEATION_EQ' }
        },
        // ... many more messages
      ];
      
      // Add 50 messages to simulate long conversation
      for (let i = 0; i < 50; i++) {
        const message: ChatMessage = {
          id: `msg-${i + 4}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i} about ${i % 5 === 0 ? 'renewable energy' : 'other topics'}`,
          timestamp: new Date(),
          metadata: { 
            phase: 'step_entry',
            stage: i < 20 ? 'IDEATION' : i < 40 ? 'JOURNEY' : 'DELIVERABLES'
          }
        };
        messages.push(message);
        contextManager.addMessage(message);
      }
      
      // Now at step 9, should still remember step 1
      const context = contextManager.getRelevantContext('complete', 'DELIVERABLES');
      
      // Should include early renewable energy reference
      const hasEarlyContext = context.messages.some(msg => 
        msg.content.includes('renewable energy')
      );
      expect(hasEarlyContext).toBe(true);
      
      // Should have summarized key decisions
      expect(context.summary.importantSelections).toBeDefined();
    });

    it('should handle context window overflow gracefully', () => {
      // Add messages until context window overflows multiple times
      for (let i = 0; i < 100; i++) {
        contextManager.addMessage({
          id: `msg-${i}`,
          role: 'user',
          content: `This is message number ${i} with some important content about teaching`,
          timestamp: new Date(),
          metadata: { phase: 'step_entry' }
        });
      }
      
      const stats = contextManager.getContextStats();
      expect(stats.totalMessages).toBeLessThanOrEqual(50); // Max history size
      
      // Recent messages should be preserved
      const formattedContext = contextManager.getFormattedContext();
      expect(formattedContext).toContain('message number 9'); // Recent messages
    });

    it('should extract and maintain user preferences across conversation', () => {
      const preferenceMessages: ChatMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'I prefer hands-on activities for my students',
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'user',
          content: 'We have limited technology but lots of art supplies',
          timestamp: new Date()
        },
        {
          id: '3',
          role: 'user',
          content: 'My students are very creative and love collaborative work',
          timestamp: new Date()
        }
      ];
      
      preferenceMessages.forEach(msg => contextManager.addMessage(msg));
      
      const context = contextManager.getRelevantContext('ideas', 'JOURNEY');
      
      expect(context.summary.userPreferences.teachingStyle).toBe('interactive');
      expect(context.summary.userPreferences.emphasis).toBe('creativity');
      expect(context.summary.userPreferences.techIntegration).toBe(true);
    });
  });

  describe('Context Coherence', () => {
    it('should detect and handle contradictions', () => {
      // Teacher contradicts themselves
      const messages: ChatMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'I want to focus on individual work only',
          timestamp: new Date(),
          metadata: { phase: 'step_confirm', step: 'JOURNEY_ACTIVITIES' }
        },
        {
          id: '2',
          role: 'user',
          content: 'Actually, collaboration is essential for this project',
          timestamp: new Date(),
          metadata: { phase: 'step_entry' }
        }
      ];
      
      messages.forEach(msg => contextManager.addMessage(msg));
      
      // Context should include both statements for AI to address
      const context = contextManager.getRelevantContext('refine', 'JOURNEY');
      const relevantMessages = context.messages.filter(m => m.role === 'user');
      
      expect(relevantMessages.length).toBeGreaterThanOrEqual(2);
      expect(relevantMessages[0].content).toContain('individual work');
      expect(relevantMessages[1].content).toContain('collaboration');
    });

    it('should maintain pronoun references correctly', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'Climate change and its local impacts',
          timestamp: new Date(),
          metadata: { phase: 'step_confirm', step: 'IDEATION_BIG_IDEA' }
        },
        {
          id: '2',
          role: 'user',
          content: 'How does it affect our community?',
          timestamp: new Date(),
          metadata: { phase: 'step_entry', step: 'IDEATION_EQ' }
        },
        {
          id: '3',
          role: 'user',
          content: 'They need to understand this deeply',
          timestamp: new Date()
        }
      ];
      
      messages.forEach(msg => contextManager.addMessage(msg));
      
      // Verify context maintains logical flow
      const context = contextManager.getFormattedContext();
      expect(context).toContain('Climate change');
      expect(context).toContain('How does it affect');
      
      // Key selections should be captured
      const summary = contextManager.getContextStats();
      expect(summary.capturedSteps).toBeGreaterThan(0);
    });
  });

  describe('Context Recovery', () => {
    it('should provide sufficient context for AI after interruption', () => {
      // Simulate partial journey
      const beforeInterruption: ChatMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'Ecosystem balance and biodiversity',
          timestamp: new Date(),
          metadata: { phase: 'step_confirm', step: 'IDEATION_BIG_IDEA' }
        },
        {
          id: '2',
          role: 'user',
          content: 'Why do species depend on each other?',
          timestamp: new Date(),
          metadata: { phase: 'step_confirm', step: 'IDEATION_EQ' }
        }
      ];
      
      beforeInterruption.forEach(msg => contextManager.addMessage(msg));
      
      // Clear and rebuild (simulating session recovery)
      const savedContext = contextManager.getFormattedContext();
      contextManager.clearContext();
      
      // Add summary message to restore context
      contextManager.addMessage({
        id: 'summary',
        role: 'system',
        content: savedContext,
        timestamp: new Date(),
        metadata: { actionType: 'context_restore' }
      });
      
      const recovered = contextManager.getRelevantContext('continue', 'IDEATION');
      expect(recovered.messages.some(m => m.content.includes('Ecosystem balance'))).toBe(true);
    });
  });

  describe('Relevance Filtering', () => {
    it('should prioritize relevant messages for current action', () => {
      // Add various types of messages
      const messages: ChatMessage[] = [
        // Relevant for refine action
        {
          id: '1',
          role: 'user',
          content: 'My current idea needs work',
          timestamp: new Date(),
          metadata: { phase: 'step_confirm' }
        },
        // Not relevant
        {
          id: '2',
          role: 'assistant',
          content: 'Welcome to ALF Coach',
          timestamp: new Date(),
          metadata: { phase: 'welcome' }
        },
        // Highly relevant
        {
          id: '3',
          role: 'user',
          content: 'I want to refine this to be more specific',
          timestamp: new Date()
        },
        // Stage relevant
        {
          id: '4',
          role: 'user',
          content: 'For the journey design...',
          timestamp: new Date(),
          metadata: { stage: 'JOURNEY' }
        }
      ];
      
      messages.forEach(msg => contextManager.addMessage(msg));
      
      // Get context for refine action in JOURNEY stage
      const context = contextManager.getRelevantContext('refine', 'JOURNEY');
      
      // Should prioritize refine-related and stage-specific messages
      const messageContents = context.messages.map(m => m.content);
      expect(messageContents.some(c => c.includes('refine'))).toBe(true);
      expect(messageContents.some(c => c.includes('journey'))).toBe(true);
      
      // Should not include welcome message
      expect(messageContents.some(c => c.includes('Welcome to ALF'))).toBe(false);
    });

    it('should always include recent messages for continuity', () => {
      // Add 20 messages
      for (let i = 0; i < 20; i++) {
        contextManager.addMessage({
          id: `msg-${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: new Date()
        });
      }
      
      const context = contextManager.getRelevantContext('help', 'IDEATION');
      
      // Should include last 3 messages regardless of relevance
      const lastMessages = context.messages.slice(-3);
      expect(lastMessages[2].content).toContain('Message 19');
      expect(lastMessages[1].content).toContain('Message 18');
      expect(lastMessages[0].content).toContain('Message 17');
    });
  });

  describe('Theme Extraction', () => {
    it('should identify recurring themes in teacher input', () => {
      const themedMessages: ChatMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'I want students to understand sustainability',
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'user',
          content: 'Sustainability is crucial for their future',
          timestamp: new Date()
        },
        {
          id: '3',
          role: 'user',
          content: 'We\'ll explore sustainable practices',
          timestamp: new Date()
        },
        {
          id: '4',
          role: 'user',
          content: 'The community needs sustainable solutions',
          timestamp: new Date()
        }
      ];
      
      themedMessages.forEach(msg => contextManager.addMessage(msg));
      
      const summary = contextManager['generateContextSummary']();
      expect(summary.keyPoints.some(point => 
        point.toLowerCase().includes('sustain')
      )).toBe(true);
    });
  });
});