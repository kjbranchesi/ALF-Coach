// Test all action paths in step_entry phase
// Ensures all allowed actions work properly

import { ChatService } from '../services/chat-service';

describe('Step Entry Phase Actions', () => {
  let chatService: ChatService;
  let mockWizardData: any;

  beforeEach(() => {
    mockWizardData = {
      educatorName: 'Test Teacher',
      ageGroup: '8-10 years',
      subject: 'Science',
      location: 'Test School'
    };

    chatService = new ChatService(mockWizardData);
  });

  describe('Valid Actions in step_entry', () => {
    beforeEach(async () => {
      // Initialize chat and advance to step_entry phase
      await chatService.initialize();
      await chatService.processAction('start');
      // Now in step_entry phase
    });

    test('text action - user types answer', async () => {
      const testInput = 'Students will explore renewable energy';
      await chatService.processAction('text', testInput);
      
      const state = chatService.getState();
      expect(state.phase).toBe('step_confirm');
      expect(state.pendingValue).toBe(testInput);
    });

    test('ideas action - generates idea cards', async () => {
      await chatService.processAction('ideas');
      
      const state = chatService.getState();
      const lastMessage = state.messages[state.messages.length - 1];
      
      expect(lastMessage.metadata?.showCards).toBe(true);
      expect(lastMessage.metadata?.cardOptions).toBeDefined();
      expect(lastMessage.metadata?.cardOptions.length).toBeGreaterThan(0);
    });

    test('whatif action - generates what-if scenarios', async () => {
      await chatService.processAction('whatif');
      
      const state = chatService.getState();
      const lastMessage = state.messages[state.messages.length - 1];
      
      expect(lastMessage.metadata?.showCards).toBe(true);
      expect(lastMessage.metadata?.cardType).toBe('whatif');
    });

    test('help action - provides contextual help', async () => {
      await chatService.processAction('help');
      
      const state = chatService.getState();
      const lastMessage = state.messages[state.messages.length - 1];
      
      expect(state.phase).toBe('step_entry'); // Should stay in same phase
      expect(lastMessage.content).toContain('help');
    });

    test('card_select action - selects idea card', async () => {
      // First generate ideas
      await chatService.processAction('ideas');
      
      // Then select a card
      const mockCard = {
        id: 'test-card-1',
        title: 'Renewable Energy Project',
        description: 'Students design solar solutions'
      };
      
      await chatService.processAction('card_select', mockCard);
      
      const state = chatService.getState();
      expect(state.phase).toBe('step_confirm');
      expect(state.pendingValue).toBe(mockCard.title);
    });
  });

  describe('Invalid Actions in step_entry', () => {
    beforeEach(async () => {
      await chatService.initialize();
      await chatService.processAction('start');
    });

    test('continue action - not allowed in step_entry', async () => {
      await expect(
        chatService.processAction('continue')
      ).rejects.toThrow('Invalid state transition');
    });

    test('refine action - not allowed in step_entry', async () => {
      await expect(
        chatService.processAction('refine')
      ).rejects.toThrow('Invalid state transition');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await chatService.initialize();
      await chatService.processAction('start');
    });

    test('empty text input - shows validation message', async () => {
      await chatService.processAction('text', '');
      
      const state = chatService.getState();
      expect(state.phase).toBe('step_entry'); // Should stay in same phase
      
      const lastMessage = state.messages[state.messages.length - 1];
      expect(lastMessage.content).toContain('provide');
    });

    test('very short text input - shows validation message', async () => {
      await chatService.processAction('text', 'Hi');
      
      const state = chatService.getState();
      expect(state.phase).toBe('step_entry'); // Should stay in same phase
      
      const lastMessage = state.messages[state.messages.length - 1];
      expect(lastMessage.content).toContain('more detail');
    });

    test('multiple rapid actions - handled gracefully', async () => {
      // Simulate rapid button clicks
      const promises = [
        chatService.processAction('ideas'),
        chatService.processAction('whatif'),
        chatService.processAction('help')
      ];
      
      // Should not throw errors
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('State Consistency', () => {
    test('maintains captured data through transitions', async () => {
      await chatService.initialize();
      await chatService.processAction('start');
      
      // Enter text for first step
      await chatService.processAction('text', 'Test Big Idea');
      
      // Confirm and move to next
      await chatService.processAction('continue');
      
      const state = chatService.getState();
      expect(state.capturedData).toHaveProperty('IDEATION_BIG_IDEA', 'Test Big Idea');
    });

    test('progress tracking works correctly', async () => {
      await chatService.initialize();
      const initialState = chatService.getState();
      expect(initialState.completedSteps).toBe(0);
      
      await chatService.processAction('start');
      await chatService.processAction('text', 'Test idea');
      await chatService.processAction('continue');
      
      const finalState = chatService.getState();
      expect(finalState.completedSteps).toBe(1);
    });
  });
});

// Mock implementations for testing
jest.mock('../services/ai-conversation-manager', () => ({
  AIConversationManager: jest.fn().mockImplementation(() => ({
    generateResponse: jest.fn().mockResolvedValue('Test AI response'),
    updateContext: jest.fn()
  }))
}));

jest.mock('../services/ai-service-wrapper', () => ({
  AIServiceWrapper: jest.fn().mockImplementation(() => ({
    generateIdeas: jest.fn().mockResolvedValue({
      success: true,
      data: [
        { id: '1', title: 'Idea 1', description: 'Description 1' },
        { id: '2', title: 'Idea 2', description: 'Description 2' },
        { id: '3', title: 'Idea 3', description: 'Description 3' }
      ]
    }),
    generateWhatIfs: jest.fn().mockResolvedValue({
      success: true,
      data: [
        { id: '1', title: 'What if 1', description: 'Scenario 1' },
        { id: '2', title: 'What if 2', description: 'Scenario 2' }
      ]
    })
  }))
}));