import ButtonStateManager, { StateEvent, ButtonContext } from '../button-state-manager';

describe('ButtonStateManager', () => {
  let manager: ButtonStateManager;

  beforeEach(() => {
    // Get fresh instance and reset
    manager = ButtonStateManager.getInstance();
    manager.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ButtonStateManager.getInstance();
      const instance2 = ButtonStateManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initial State', () => {
    it('should start with INIT stage and empty buttons', () => {
      const state = manager.getCurrentState();
      expect(state.context.stage).toBe('INIT');
      expect(state.buttons).toEqual([]);
    });
  });

  describe('Button Configurations', () => {
    it('should return welcome buttons for IDEATION_INITIATOR:WELCOME', () => {
      const context: ButtonContext = {
        stage: 'IDEATION_INITIATOR',
        phase: 'WELCOME'
      };
      
      const buttons = manager.getButtonsForContext(context);
      
      expect(buttons).toHaveLength(2);
      expect(buttons[0].action).toBe('start');
      expect(buttons[0].label).toBe("Let's Begin");
      expect(buttons[1].action).toBe('tellmore');
      expect(buttons[1].label).toBe('Tell Me More');
    });

    it('should return suggestion buttons for IDEATION_INITIATOR:ACTIVE', () => {
      const context: ButtonContext = {
        stage: 'IDEATION_INITIATOR',
        phase: 'ACTIVE'
      };
      
      const buttons = manager.getButtonsForContext(context);
      
      expect(buttons).toHaveLength(3);
      expect(buttons.map(b => b.action)).toEqual(['ideas', 'whatif', 'help']);
    });

    it('should return confirmation buttons when card is selected', () => {
      const context: ButtonContext = {
        stage: 'IDEATION_INITIATOR',
        conversationState: 'card_confirmation'
      };
      
      const buttons = manager.getButtonsForContext(context);
      
      expect(buttons).toHaveLength(3);
      expect(buttons[0].action).toBe('confirm');
      expect(buttons[0].label).toBe("Yes, let's go!");
      expect(buttons[1].action).toBe('refine');
      expect(buttons[2].action).toBe('guidance');
    });
  });

  describe('Event Processing', () => {
    it('should process STAGE_CHANGE event', async () => {
      const event: StateEvent = {
        type: 'STAGE_CHANGE',
        payload: {
          stage: 'IDEATION_INITIATOR',
          phase: 'WELCOME'
        }
      };

      await manager.processEvent(event);
      
      const state = manager.getCurrentState();
      expect(state.context.stage).toBe('IDEATION_INITIATOR');
      expect(state.context.phase).toBe('WELCOME');
    });

    it('should process CARD_SELECTED event and show confirmation buttons', async () => {
      // First set to active state
      await manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'IDEATION_INITIATOR', phase: 'ACTIVE' }
      });

      // Then select a card
      await manager.processEvent({
        type: 'CARD_SELECTED',
        payload: { cardId: 'idea-1', value: 'Test Idea' }
      });

      const state = manager.getCurrentState();
      expect(state.context.conversationState).toBe('card_confirmation');
      expect(state.buttons[0].action).toBe('confirm');
    });

    it('should process CONFIRM event and clear confirmation state', async () => {
      // Setup: select a card first
      await manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'IDEATION_INITIATOR', phase: 'ACTIVE' }
      });
      
      await manager.processEvent({
        type: 'CARD_SELECTED',
        payload: { cardId: 'idea-1', value: 'Test Idea' }
      });

      // Confirm
      await manager.processEvent({
        type: 'CONFIRM',
        payload: {}
      });

      const state = manager.getCurrentState();
      expect(state.context.waitingForConfirmation).toBe(false);
      expect(state.context.conversationState).toBeUndefined();
    });

    it('should process REFINE event and return to active state', async () => {
      // Setup
      await manager.processEvent({
        type: 'CARD_SELECTED',
        payload: { cardId: 'idea-1', value: 'Test Idea' }
      });

      // Refine
      await manager.processEvent({
        type: 'REFINE',
        payload: {}
      });

      const state = manager.getCurrentState();
      expect(state.context.conversationState).toBe('active');
      expect(state.context.waitingForConfirmation).toBe(false);
    });

    it('should track button action flags', async () => {
      await manager.processEvent({
        type: 'BUTTON_ACTION',
        payload: { action: 'ideas' }
      });

      const state = manager.getCurrentState();
      expect(state.context.flags?.has('IDEAS_SHOWN')).toBe(true);
    });
  });

  describe('Dynamic Rules', () => {
    it('should hide start button after first message', () => {
      const context: ButtonContext = {
        stage: 'IDEATION_INITIATOR',
        phase: 'WELCOME',
        messageCount: 2
      };
      
      const buttons = manager.getButtonsForContext(context);
      const startButton = buttons.find(b => b.action === 'start');
      
      expect(startButton?.visible).toBe(false);
    });
  });

  describe('Event Queue', () => {
    it('should process events in order', async () => {
      const events: StateEvent[] = [
        { type: 'STAGE_CHANGE', payload: { stage: 'STAGE1' } },
        { type: 'STAGE_CHANGE', payload: { stage: 'STAGE2' } },
        { type: 'STAGE_CHANGE', payload: { stage: 'STAGE3' } }
      ];

      // Send all events rapidly
      const promises = events.map(e => manager.processEvent(e));
      await Promise.all(promises);

      const state = manager.getCurrentState();
      expect(state.context.stage).toBe('STAGE3');
    });

    it('should handle priority events', async () => {
      const lowPriority: StateEvent = {
        type: 'STAGE_CHANGE',
        payload: { stage: 'LOW' },
        priority: 0
      };

      const highPriority: StateEvent = {
        type: 'STAGE_CHANGE',
        payload: { stage: 'HIGH' },
        priority: 10
      };

      // Send low priority first, then high
      manager.processEvent(lowPriority);
      await manager.processEvent(highPriority);

      // High priority should be processed last (most recent state)
      const state = manager.getCurrentState();
      expect(state.context.stage).toBe('HIGH');
    });
  });

  describe('State History', () => {
    it('should maintain state history', async () => {
      await manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'STAGE1' }
      });

      await manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'STAGE2' }
      });

      const history = manager.getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].context.stage).toBe('STAGE2');
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on state changes', async () => {
      const callback = jest.fn();
      const unsubscribe = manager.subscribe(callback);

      await manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'NEW_STAGE' }
      });

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({ stage: 'NEW_STAGE' })
        })
      );

      unsubscribe();
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      manager.setButtonsLoading(true);
      const state = manager.getCurrentState();
      
      state.buttons.forEach(button => {
        expect(button.enabled).toBe(false);
      });
    });

    it('should enable buttons when not loading', () => {
      // First add some buttons
      manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'IDEATION_INITIATOR', phase: 'WELCOME' }
      });

      manager.setButtonsLoading(false);
      const state = manager.getCurrentState();
      
      state.buttons.forEach(button => {
        expect(button.enabled).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid events gracefully', async () => {
      const invalidEvent: StateEvent = {
        type: 'INVALID_EVENT_TYPE',
        payload: {}
      };

      await expect(manager.processEvent(invalidEvent)).resolves.not.toThrow();
    });

    it('should return empty buttons for unknown configuration', () => {
      const context: ButtonContext = {
        stage: 'UNKNOWN_STAGE'
      };
      
      const buttons = manager.getButtonsForContext(context);
      expect(buttons).toEqual([]);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', async () => {
      // Make some changes
      await manager.processEvent({
        type: 'STAGE_CHANGE',
        payload: { stage: 'SOME_STAGE' }
      });

      // Reset
      manager.reset();

      const state = manager.getCurrentState();
      expect(state.context.stage).toBe('INIT');
      expect(state.buttons).toEqual([]);
      expect(manager.getHistory()).toEqual([]);
    });
  });
});