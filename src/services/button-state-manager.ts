import { EventEmitter } from 'events';

export interface ButtonState {
  id: string;
  type: 'quick_reply' | 'suggestion_card' | 'action_button';
  label: string;
  action: string;
  icon?: string;
  enabled: boolean;
  visible: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'suggestion' | 'success';
  metadata?: Record<string, any>;
}

export interface ButtonContext {
  stage: string;
  phase?: string;
  conversationState?: string;
  waitingForConfirmation?: boolean;
  activeCard?: string;
  messageCount?: number;
  flags?: Set<string>;
}

export interface ButtonSystemState {
  context: ButtonContext;
  buttons: ButtonState[];
  timestamp: number;
}

export interface StateEvent {
  type: string;
  payload?: any;
  timestamp?: number;
  priority?: number;
}

interface ButtonConfiguration {
  key: string;
  buttons: ButtonState[];
}

class ButtonStateManager extends EventEmitter {
  private static instance: ButtonStateManager;
  private currentState: ButtonSystemState;
  private eventQueue: StateEvent[] = [];
  private processing = false;
  private configurations: Map<string, ButtonConfiguration> = new Map();
  private stateHistory: ButtonSystemState[] = [];
  private maxHistorySize = 50;

  private constructor() {
    super();
    this.currentState = {
      context: { stage: 'INIT' },
      buttons: [],
      timestamp: Date.now()
    };
    this.initializeConfigurations();
  }

  static getInstance(): ButtonStateManager {
    if (!ButtonStateManager.instance) {
      ButtonStateManager.instance = new ButtonStateManager();
    }
    return ButtonStateManager.instance;
  }

  private initializeConfigurations() {
    // IDEATION STAGE - Welcome
    this.configurations.set('IDEATION_INITIATOR:WELCOME', {
      key: 'IDEATION_INITIATOR:WELCOME',
      buttons: [
        {
          id: 'start-journey',
          type: 'quick_reply',
          label: "Let's Begin",
          action: 'start',
          icon: 'Rocket',
          enabled: true,
          visible: true,
          variant: 'primary'
        },
        {
          id: 'tell-more',
          type: 'quick_reply',
          label: 'Tell Me More',
          action: 'tellmore',
          icon: 'Info',
          enabled: true,
          visible: true,
          variant: 'secondary'
        }
      ]
    });

    // IDEATION STAGE - Active (showing suggestion buttons)
    this.configurations.set('IDEATION_INITIATOR:ACTIVE', {
      key: 'IDEATION_INITIATOR:ACTIVE',
      buttons: [
        {
          id: 'ideas-button',
          type: 'quick_reply',
          label: 'Ideas',
          action: 'ideas',
          icon: 'Lightbulb',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'whatif-button',
          type: 'quick_reply',
          label: 'What-If',
          action: 'whatif',
          icon: 'RefreshCw',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'help-button',
          type: 'quick_reply',
          label: 'Help',
          action: 'help',
          icon: 'HelpCircle',
          enabled: true,
          visible: true,
          variant: 'tertiary'
        }
      ]
    });

    // IDEATION STAGE - Card Confirmation
    this.configurations.set('IDEATION_INITIATOR:CARD_CONFIRMATION', {
      key: 'IDEATION_INITIATOR:CARD_CONFIRMATION',
      buttons: [
        {
          id: 'confirm-button',
          type: 'quick_reply',
          label: "Yes, let's go!",
          action: 'confirm',
          icon: 'Check',
          enabled: true,
          visible: true,
          variant: 'primary'
        },
        {
          id: 'refine-button',
          type: 'quick_reply',
          label: 'Let me refine this',
          action: 'refine',
          icon: 'Edit',
          enabled: true,
          visible: true,
          variant: 'secondary'
        },
        {
          id: 'guidance-button',
          type: 'quick_reply',
          label: 'I need guidance',
          action: 'guidance',
          icon: 'HelpCircle',
          enabled: true,
          visible: true,
          variant: 'tertiary'
        }
      ]
    });

    // IDEATION - Big Idea Active
    this.configurations.set('IDEATION_BIG_IDEA:ACTIVE', {
      key: 'IDEATION_BIG_IDEA:ACTIVE',
      buttons: [
        {
          id: 'ideas-button',
          type: 'quick_reply',
          label: 'Ideas',
          action: 'ideas',
          icon: 'Lightbulb',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'whatif-button',
          type: 'quick_reply',
          label: 'What-If',
          action: 'whatif',
          icon: 'RefreshCw',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'help-button',
          type: 'quick_reply',
          label: 'Help',
          action: 'help',
          icon: 'HelpCircle',
          enabled: true,
          visible: true,
          variant: 'tertiary'
        }
      ]
    });

    // Essential Question Confirmation
    this.configurations.set('IDEATION_ESSENTIAL_QUESTION:CONFIRMATION', {
      key: 'IDEATION_ESSENTIAL_QUESTION:CONFIRMATION',
      buttons: [
        {
          id: 'confirm-button',
          type: 'quick_reply',
          label: "Yes, let's go!",
          action: 'confirm',
          icon: 'Check',
          enabled: true,
          visible: true,
          variant: 'primary'
        },
        {
          id: 'refine-button',
          type: 'quick_reply',
          label: 'Let me refine this',
          action: 'refine',
          icon: 'Edit',
          enabled: true,
          visible: true,
          variant: 'secondary'
        },
        {
          id: 'guidance-button',
          type: 'quick_reply',
          label: 'I need guidance',
          action: 'guidance',
          icon: 'HelpCircle',
          enabled: true,
          visible: true,
          variant: 'tertiary'
        }
      ]
    });

    // LEARNING JOURNEY stages
    this.configurations.set('LEARNING_JOURNEY:ACTIVE', {
      key: 'LEARNING_JOURNEY:ACTIVE',
      buttons: [
        {
          id: 'ideas-button',
          type: 'quick_reply',
          label: 'Ideas',
          action: 'ideas',
          icon: 'Lightbulb',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'whatif-button',
          type: 'quick_reply',
          label: 'What-If',
          action: 'whatif',
          icon: 'RefreshCw',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'help-button',
          type: 'quick_reply',
          label: 'Help',
          action: 'help',
          icon: 'HelpCircle',
          enabled: true,
          visible: true,
          variant: 'tertiary'
        }
      ]
    });

    // DELIVERABLES stages
    this.configurations.set('DELIVERABLES:ACTIVE', {
      key: 'DELIVERABLES:ACTIVE',
      buttons: [
        {
          id: 'ideas-button',
          type: 'quick_reply',
          label: 'Ideas',
          action: 'ideas',
          icon: 'Lightbulb',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'whatif-button',
          type: 'quick_reply',
          label: 'What-If',
          action: 'whatif',
          icon: 'RefreshCw',
          enabled: true,
          visible: true,
          variant: 'suggestion'
        },
        {
          id: 'help-button',
          type: 'quick_reply',
          label: 'Help',
          action: 'help',
          icon: 'HelpCircle',
          enabled: true,
          visible: true,
          variant: 'tertiary'
        }
      ]
    });

    // Empty state for loading/processing
    this.configurations.set('LOADING', {
      key: 'LOADING',
      buttons: []
    });
  }

  async processEvent(event: StateEvent): Promise<ButtonSystemState> {
    // Add to queue
    this.eventQueue.push({
      ...event,
      timestamp: event.timestamp || Date.now(),
      priority: event.priority || 0
    });

    // Sort by priority and timestamp
    this.eventQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority! - a.priority!;
      }
      return a.timestamp! - b.timestamp!;
    });

    // Process queue
    if (!this.processing) {
      await this.processQueue();
    }

    return this.currentState;
  }

  private async processQueue() {
    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      
      try {
        await this.processEventInternal(event);
      } catch (error) {
        console.error('Error processing event:', event, error);
      }
    }

    this.processing = false;
  }

  private async processEventInternal(event: StateEvent) {
    const oldState = { ...this.currentState };

    // Update context based on event
    const newContext = this.updateContextForEvent(this.currentState.context, event);
    
    // Get buttons for new context
    const buttons = this.getButtonsForContext(newContext);

    // Create new state
    const newState: ButtonSystemState = {
      context: newContext,
      buttons,
      timestamp: Date.now()
    };

    // Update state
    this.currentState = newState;

    // Add to history
    this.addToHistory(newState);

    // Emit change event
    this.emit('stateChange', newState, oldState, event);

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Button State Transition:', {
        event: event.type,
        from: oldState.context,
        to: newState.context,
        buttons: buttons.map(b => ({ action: b.action, label: b.label }))
      });
    }
  }

  private updateContextForEvent(context: ButtonContext, event: StateEvent): ButtonContext {
    const newContext = { ...context };

    switch (event.type) {
      case 'STAGE_CHANGE':
        newContext.stage = event.payload.stage;
        newContext.phase = event.payload.phase;
        newContext.conversationState = undefined;
        newContext.waitingForConfirmation = false;
        newContext.activeCard = undefined;
        break;

      case 'CARD_SELECTED':
        newContext.conversationState = 'card_confirmation';
        newContext.activeCard = event.payload.cardId;
        break;

      case 'USER_INPUT':
        if (event.payload.needsConfirmation) {
          newContext.conversationState = 'confirmation';
          newContext.waitingForConfirmation = true;
        }
        break;

      case 'CONFIRM':
        newContext.waitingForConfirmation = false;
        newContext.conversationState = undefined;
        newContext.activeCard = undefined;
        break;

      case 'REFINE':
        newContext.waitingForConfirmation = false;
        newContext.conversationState = 'active';
        newContext.activeCard = undefined;
        break;

      case 'BUTTON_ACTION':
        if (event.payload.action === 'ideas') {
          newContext.flags = new Set([...(newContext.flags || []), 'IDEAS_SHOWN']);
        } else if (event.payload.action === 'whatif') {
          newContext.flags = new Set([...(newContext.flags || []), 'WHATIF_SHOWN']);
        }
        break;

      case 'MESSAGE_ADDED':
        newContext.messageCount = (newContext.messageCount || 0) + 1;
        break;

      case 'RESET':
        return { stage: 'INIT' };
    }

    return newContext;
  }

  getButtonsForContext(context: ButtonContext): ButtonState[] {
    // Build configuration key
    let key = context.stage;

    if (context.phase) {
      key = `${context.stage}:${context.phase}`;
    }

    if (context.conversationState === 'card_confirmation') {
      key = `${context.stage}:CARD_CONFIRMATION`;
    } else if (context.conversationState === 'confirmation' || context.waitingForConfirmation) {
      key = `${context.stage}:CONFIRMATION`;
    } else if (context.conversationState === 'active') {
      key = `${context.stage}:ACTIVE`;
    }

    const config = this.configurations.get(key);
    
    if (!config) {
      console.warn(`No button configuration for key: ${key}`);
      return [];
    }

    // Apply dynamic rules
    return this.applyDynamicRules(config.buttons, context);
  }

  private applyDynamicRules(buttons: ButtonState[], context: ButtonContext): ButtonState[] {
    return buttons.map(button => {
      const processed = { ...button };

      // Apply context-specific rules
      if (button.action === 'ideas' && context.flags?.has('IDEAS_SHOWN')) {
        processed.enabled = true; // Keep enabled but maybe change label
      }

      if (button.action === 'start' && (context.messageCount || 0) > 1) {
        processed.visible = false;
      }

      return processed;
    });
  }

  private addToHistory(state: ButtonSystemState) {
    this.stateHistory.push(state);
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  getCurrentState(): ButtonSystemState {
    return this.currentState;
  }

  getHistory(): ButtonSystemState[] {
    return [...this.stateHistory];
  }

  subscribe(callback: (state: ButtonSystemState) => void) {
    this.on('stateChange', callback);
    return () => this.off('stateChange', callback);
  }

  reset() {
    this.currentState = {
      context: { stage: 'INIT' },
      buttons: [],
      timestamp: Date.now()
    };
    this.eventQueue = [];
    this.stateHistory = [];
    this.emit('stateChange', this.currentState, null, { type: 'RESET' });
  }

  // Helper method to set buttons to loading state
  setButtonsLoading(loading: boolean) {
    const buttons = this.currentState.buttons.map(button => ({
      ...button,
      enabled: !loading
    }));

    this.currentState = {
      ...this.currentState,
      buttons,
      timestamp: Date.now()
    };

    this.emit('stateChange', this.currentState);
  }
}

export default ButtonStateManager;