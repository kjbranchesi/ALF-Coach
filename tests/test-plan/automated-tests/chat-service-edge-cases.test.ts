import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createChatService, ChatService } from '../../../src/services/chat-service';
import { createAIConversationManager } from '../../../src/services/ai-conversation-manager';

// Mock the AI conversation manager
vi.mock('../../../src/services/ai-conversation-manager');

describe('ChatService Edge Cases - Teacher Behaviors', () => {
  let chatService: ChatService;
  let mockAIManager: any;
  
  const mockWizardData = {
    subject: 'Science',
    ageGroup: 'Ages 11-13',
    location: 'Chicago'
  };
  
  beforeEach(() => {
    // Setup mock AI manager
    mockAIManager = {
      generateResponse: vi.fn(),
      updateContext: vi.fn()
    };
    
    (createAIConversationManager as any).mockReturnValue(mockAIManager);
    
    // Set environment to use AI
    process.env.VITE_USE_AI_CHAT = 'true';
    process.env.VITE_GEMINI_API_KEY = 'test-key';
    
    chatService = createChatService(mockWizardData, 'test-blueprint-123');
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Context Loss Prevention', () => {
    it('should maintain context across multiple refinement loops', async () => {
      // Start with Big Idea
      await chatService.processAction('start');
      await chatService.processAction('start'); // Enter ideation
      
      // Teacher enters initial idea
      await chatService.processAction('text', 'Understanding ecosystems');
      
      // Teacher refines multiple times
      for (let i = 0; i < 5; i++) {
        await chatService.processAction('refine');
        await chatService.processAction('text', `Refined idea ${i + 1}: Ecosystem interactions`);
      }
      
      // Verify context is maintained
      const state = chatService.getState();
      expect(state.messages.length).toBeGreaterThan(10);
      
      // Check that AI manager received all context updates
      expect(mockAIManager.updateContext).toHaveBeenCalledTimes(12); // All messages
    });

    it('should remember step 1 content when reaching step 9', async () => {
      // Complete entire journey
      const journeyData = {
        'ideation.bigIdea': 'Climate change impacts',
        'ideation.essentialQuestion': 'How does climate change affect our community?',
        'ideation.challenge': 'Create a local climate action plan',
        'journey.phases': 'Research, Design, Implementation',
        'journey.activities': 'Data collection, Community interviews, Solution design',
        'journey.resources': 'Climate data, Interview tools, Presentation software',
        'deliverables.milestones': 'Research complete, Plan drafted, Presentation ready',
        'deliverables.rubric': 'Research quality, Solution feasibility, Presentation clarity',
        'deliverables.impact': 'Present to city council'
      };
      
      // Navigate through all steps
      for (const [key, value of Object.entries(journeyData)) {
        await chatService.processAction('text', value);
        await chatService.processAction('continue');
      }
      
      // Verify all data is captured
      const state = chatService.getState();
      expect(state.capturedData['ideation.bigIdea']).toBe('Climate change impacts');
      expect(state.completedSteps).toBe(9);
    });
  });

  describe('Unpredictable Teacher Behaviors', () => {
    it('should handle stream of consciousness input gracefully', async () => {
      const streamOfConsciousness = `
        So I'm thinking about teaching photosynthesis but wait maybe I should do 
        ecosystems first? Or actually what if we looked at climate change but that 
        might be too heavy for middle schoolers. Oh but they're really interested 
        in environmental issues. Maybe we could do something about local parks? 
        I saw this great documentary about urban forests...
      `;
      
      mockAIManager.generateResponse.mockResolvedValue(
        'I hear you exploring several interconnected topics: photosynthesis, ecosystems, climate change, and urban forests. These all connect beautifully! For middle schoolers in Chicago, focusing on local urban ecosystems could be engaging. What aspect excites you most?'
      );
      
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('text', streamOfConsciousness);
      
      const state = chatService.getState();
      const lastMessage = state.messages[state.messages.length - 1];
      
      expect(lastMessage.role).toBe('assistant');
      expect(lastMessage.content).toContain('interconnected topics');
    });

    it('should handle rapid button clicking without creating duplicates', async () => {
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Simulate rapid clicking of Ideas button
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(chatService.processAction('ideas'));
      }
      
      await Promise.all(promises);
      
      const state = chatService.getState();
      // Should only have one Ideas card set in messages
      const ideaMessages = state.messages.filter(m => m.metadata?.showCards);
      expect(ideaMessages.length).toBe(1);
    });

    it('should handle teacher asking off-topic questions', async () => {
      mockAIManager.generateResponse.mockResolvedValue(
        "I understand you might have other concerns, but let's focus on creating an amazing learning experience for your students. We're currently working on defining your Big Idea. What core concept would you like your Science students to explore?"
      );
      
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('text', 'What time does the school cafeteria close?');
      
      const state = chatService.getState();
      const response = state.messages[state.messages.length - 1];
      
      expect(response.content).toContain("let's focus on creating");
      expect(response.content).toContain('Big Idea');
    });

    it('should handle extremely long input gracefully', async () => {
      const longText = 'Teaching science is important because '.repeat(100);
      
      mockAIManager.generateResponse.mockResolvedValue(
        "I appreciate your passion for science education! You've shared many thoughts. Let me help you distill this into a focused Big Idea. What's the ONE core concept you want students to understand deeply?"
      );
      
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('text', longText);
      
      const state = chatService.getState();
      expect(state.pendingValue).toBe(longText);
      expect(state.phase).toBe('step_confirm');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should fallback gracefully when AI generation fails', async () => {
      mockAIManager.generateResponse.mockRejectedValue(new Error('API Error'));
      
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      const state = chatService.getState();
      const lastMessage = state.messages[state.messages.length - 1];
      
      // Should use fallback template
      expect(lastMessage.content).toContain('Big Idea');
      expect(lastMessage.content).toContain('Science');
      expect(lastMessage.content).toContain('Ages 11-13');
    });

    it('should maintain state integrity during concurrent actions', async () => {
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Simulate teacher clicking multiple buttons while typing
      const actions = [
        chatService.processAction('ideas'),
        chatService.processAction('text', 'My big idea'),
        chatService.processAction('whatif'),
        chatService.processAction('help')
      ];
      
      await Promise.all(actions);
      
      const state = chatService.getState();
      expect(state.phase).toBeDefined();
      expect(state.messages.length).toBeGreaterThan(4);
      
      // Verify no duplicate processing
      expect(state.isProcessing).toBe(false);
    });

    it('should recover from localStorage corruption', () => {
      // Corrupt localStorage
      localStorage.setItem('journey-v5-test-blueprint-123', 'invalid-json{');
      
      // Create new service instance
      const newService = createChatService(mockWizardData, 'test-blueprint-123');
      
      // Should initialize with empty captured data
      const state = newService.getState();
      expect(state.capturedData).toEqual({});
      expect(state.completedSteps).toBe(0);
    });
  });

  describe('Complex Interaction Patterns', () => {
    it('should handle teacher changing mind multiple times', async () => {
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Enter and refine multiple times
      const ideas = [
        'Teaching about plants',
        'Actually, let\'s do animals',
        'Wait, how about ecosystems?',
        'No, climate change is better',
        'Let me think... biodiversity!'
      ];
      
      for (const idea of ideas) {
        await chatService.processAction('text', idea);
        if (idea !== ideas[ideas.length - 1]) {
          await chatService.processAction('refine');
        }
      }
      
      const state = chatService.getState();
      expect(state.pendingValue).toBe('Let me think... biodiversity!');
      
      // Verify conversation maintains coherence
      const userMessages = state.messages.filter(m => m.role === 'user');
      expect(userMessages.length).toBe(5);
    });

    it('should handle Ideas -> What-If -> Help sequence', async () => {
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Teacher explores all help options
      await chatService.processAction('ideas');
      let state = chatService.getState();
      expect(state.messages.some(m => m.metadata?.showCards)).toBe(true);
      
      await chatService.processAction('whatif');
      state = chatService.getState();
      const whatIfMessages = state.messages.filter(m => 
        m.metadata?.cardType === 'whatif'
      );
      expect(whatIfMessages.length).toBe(1);
      
      await chatService.processAction('help');
      state = chatService.getState();
      const helpMessages = state.messages.filter(m => 
        m.content.includes('Understanding Big Ideas')
      );
      expect(helpMessages.length).toBeGreaterThan(0);
    });

    it('should handle card selection followed by refinement', async () => {
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('ideas');
      
      // Select a card
      await chatService.processAction('card_select', {
        id: 'idea-1',
        title: 'Ecosystem Interactions',
        description: 'How living things depend on each other'
      });
      
      // Then refine it
      await chatService.processAction('refine');
      
      const state = chatService.getState();
      expect(state.pendingValue).toBe('Ecosystem Interactions');
      expect(state.messages.some(m => 
        m.content.includes('refining') || m.content.includes('enhance')
      )).toBe(true);
    });
  });

  describe('Stage Progression Edge Cases', () => {
    it('should prevent skipping stages via direct navigation', async () => {
      // Try to jump directly to Journey stage
      const state = chatService.getState();
      expect(state.stage).toBe('IDEATION');
      expect(state.stepIndex).toBe(-1);
      
      // Attempting to process journey-specific action should fail gracefully
      await chatService.processAction('text', 'My journey phases');
      
      // Should still be in ideation
      expect(chatService.getState().stage).toBe('IDEATION');
    });

    it('should handle completing stage with missing data', async () => {
      // Force progression without proper data
      chatService.getState().stepIndex = 2;
      chatService.getState().phase = 'stage_clarify';
      
      await chatService.processAction('proceed');
      
      const state = chatService.getState();
      // Should progress but maintain empty data
      expect(state.stage).toBe('JOURNEY');
      expect(state.capturedData['ideation.bigIdea']).toBeUndefined();
    });
  });

  describe('Memory and Performance Tests', () => {
    it('should handle 50+ message conversation efficiently', async () => {
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      const startTime = Date.now();
      
      // Generate 50 messages
      for (let i = 0; i < 25; i++) {
        await chatService.processAction('text', `Message ${i}`);
        await chatService.processAction('refine');
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const state = chatService.getState();
      expect(state.messages.length).toBeGreaterThan(50);
      
      // Performance check - should complete in reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 50 messages
      
      // Memory check - state should still be manageable
      const stateSize = JSON.stringify(state).length;
      expect(stateSize).toBeLessThan(100000); // Less than 100KB
    });
  });
});