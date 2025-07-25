import ChatEventHandler from '../chat-event-handler';
import ButtonStateManager from '../button-state-manager';

// Mock ButtonStateManager
jest.mock('../button-state-manager');

describe('ChatEventHandler', () => {
  let handler;
  let mockButtonStateManager;

  beforeEach(() => {
    // Reset singleton
    (ChatEventHandler as any).instance = null;
    
    // Create mock button state manager
    mockButtonStateManager = {
      processEvent: jest.fn().mockResolvedValue({}),
      getInstance: jest.fn()
    } as any;
    
    (ButtonStateManager.getInstance as jest.Mock).mockReturnValue(mockButtonStateManager);
    
    handler = ChatEventHandler.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ChatEventHandler.getInstance();
      const instance2 = ChatEventHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Event Processing', () => {
    it('should handle button click events', async () => {
      const event = {
        type: 'button_click',
        payload: {
          action: 'ideas',
          buttonId: 'ideas-button',
          label: 'Ideas'
        }
      };

      const result = await handler.handleEvent(event);

      expect(result).toMatchObject({
        event,
        buttonStateEvent: {
          type: 'BUTTON_ACTION',
          payload: { action: 'ideas', buttonId: 'ideas-button' }
        },
        chatAction: {
          type: 'button_response',
          data: {
            action: 'ideas',
            label: 'Ideas'
          }
        }
      });

      expect(mockButtonStateManager.processEvent).toHaveBeenCalledWith({
        type: 'BUTTON_ACTION',
        payload: { action: 'ideas', buttonId: 'ideas-button' }
      });
    });

    it('should handle card selection events', async () => {
      const event = {
        type: 'card_select',
        payload: {
          cardId: 'idea-1',
          value: 'Test Big Idea',
          type: 'big_idea'
        }
      };

      const result = await handler.handleEvent(event);

      expect(result).toMatchObject({
        event,
        buttonStateEvent: {
          type: 'CARD_SELECTED',
          payload: { cardId: 'idea-1', value: 'Test Big Idea', type: 'big_idea' }
        },
        chatAction: {
          type: 'card_response',
          data: {
            value: 'Test Big Idea',
            type: 'big_idea'
          }
        }
      });
    });

    it('should handle text input events', async () => {
      const event = {
        type: 'text_input',
        payload: {
          text: 'This is my big idea',
          needsConfirmation: true
        }
      };

      const result = await handler.handleEvent(event);

      expect(result).toMatchObject({
        event,
        buttonStateEvent: {
          type: 'USER_INPUT',
          payload: { text: 'This is my big idea', needsConfirmation: true }
        },
        chatAction: {
          type: 'text_response',
          data: {
            text: 'This is my big idea'
          }
        }
      });
    });

    it('should handle stage change events', async () => {
      const event = {
        type: 'stage_change',
        payload: {
          stage: 'IDEATION_BIG_IDEA',
          phase: 'ACTIVE'
        }
      };

      const result = await handler.handleEvent(event);

      expect(result).toMatchObject({
        event,
        buttonStateEvent: {
          type: 'STAGE_CHANGE',
          payload: { stage: 'IDEATION_BIG_IDEA', phase: 'ACTIVE' }
        },
        chatAction: null
      });
    });

    it('should handle confirmation button specially', async () => {
      const event = {
        type: 'button_click',
        payload: {
          action: 'confirm',
          buttonId: 'confirm-button'
        }
      };

      const result = await handler.handleEvent(event);

      expect(result.buttonStateEvent).toMatchObject({
        type: 'CONFIRM',
        payload: { buttonId: 'confirm-button', action: 'confirm' }
      });
    });

    it('should handle refine button specially', async () => {
      const event = {
        type: 'button_click',
        payload: {
          action: 'refine',
          buttonId: 'refine-button'
        }
      };

      const result = await handler.handleEvent(event);

      expect(result.buttonStateEvent).toMatchObject({
        type: 'REFINE',
        payload: { buttonId: 'refine-button', action: 'refine' }
      });
    });
  });

  describe('Event Queue', () => {
    it('should process events serially', async () => {
      const events[] = [
        { type: 'button_click', payload: { action: 'action1' } },
        { type: 'button_click', payload: { action: 'action2' } },
        { type: 'button_click', payload: { action: 'action3' } }
      ];

      const promises = events.map(e => handler.handleEvent(e));
      await Promise.all(promises);

      // Verify all events were processed
      expect(mockButtonStateManager.processEvent).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid events without race conditions', async () => {
      const events = Array(10).fill(0).map((_, i) => ({
        type: 'button_click' as const,
        payload: { action: `action${i}` }
      }));

      const promises = events.map(e => handler.handleEvent(e));
      await Promise.all(promises);

      expect(mockButtonStateManager.processEvent).toHaveBeenCalledTimes(10);
    });
  });

  describe('Helper Methods', () => {
    describe('needsConfirmation', () => {
      it('should return true for big idea stage', () => {
        const result = ChatEventHandler.needsConfirmation(
          'IDEATION_BIG_IDEA',
          'My big idea',
          {}
        );
        expect(result).toBe(true);
      });

      it('should return true for essential question stage', () => {
        const result = ChatEventHandler.needsConfirmation(
          'IDEATION_ESSENTIAL_QUESTION',
          'My question',
          {}
        );
        expect(result).toBe(true);
      });

      it('should return true for long text', () => {
        const result = ChatEventHandler.needsConfirmation(
          'SOME_STAGE',
          'This is a very long text that has more than five words',
          {}
        );
        expect(result).toBe(true);
      });

      it('should return false for short text', () => {
        const result = ChatEventHandler.needsConfirmation(
          'SOME_STAGE',
          'Short text',
          {}
        );
        expect(result).toBe(false);
      });
    });

    describe('createUserMessage', () => {
      it('should create a properly formatted message', () => {
        const message = ChatEventHandler.createUserMessage('Test message', { custom: 'data' });
        
        expect(message).toMatchObject({
          role: 'user',
          content: 'Test message',
          metadata: { custom: 'data' }
        });
        expect(message.id).toBeDefined();
        expect(message.timestamp).toBeInstanceOf(Date);
      });
    });

    describe('updateConversationContext', () => {
      it('should update context with card response', () => {
        const currentContext = { capturedData: new Map() };
        const event = {
          event: { type: 'card_select', payload: {} },
          buttonStateEvent: { type: 'CARD_SELECTED', payload: {} },
          chatAction: {
            type: 'card_response',
            data: { type: 'big_idea', value: 'My Big Idea' }
          }
        };

        const newContext = ChatEventHandler.updateConversationContext(currentContext, event);
        
        expect(newContext.capturedData.get('big_idea')).toBe('My Big Idea');
      });

      it('should track button action flags', () => {
        const currentContext = {};
        const event = {
          event: { type: 'button_click', payload: {} },
          buttonStateEvent: { 
            type: 'BUTTON_ACTION', 
            payload: { action: 'ideas' } 
          }
        };

        const newContext = ChatEventHandler.updateConversationContext(currentContext, event);
        
        expect(newContext.flags).toContain('ideas');
      });

      it('should update confirmation state', () => {
        const currentContext = { isWaitingForConfirmation: true };
        const event = {
          event: { type: 'button_click', payload: {} },
          buttonStateEvent: { type: 'CONFIRM', payload: {} }
        };

        const newContext = ChatEventHandler.updateConversationContext(currentContext, event);
        
        expect(newContext.isWaitingForConfirmation).toBe(false);
      });

      it('should set waiting for confirmation on card selection', () => {
        const currentContext = {};
        const event = {
          event: { type: 'card_select', payload: {} },
          buttonStateEvent: { type: 'CARD_SELECTED', payload: {} }
        };

        const newContext = ChatEventHandler.updateConversationContext(currentContext, event);
        
        expect(newContext.isWaitingForConfirmation).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown event types', async () => {
      const event = {
        type: 'unknown_type' as any,
        payload: {}
      };

      await expect(handler.handleEvent(event)).rejects.toThrow('Unknown event type');
    });
  });
});