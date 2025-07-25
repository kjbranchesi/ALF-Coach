import ButtonStateManager, { StateEvent } from './button-state-manager';
import { Message } from '../features/chat/ChatV5';

export interface ChatEvent {
  type: 'button_click' | 'card_select' | 'text_input' | 'stage_change';
  payload: any;
  context?: any;
}

export interface ProcessedEvent {
  event: ChatEvent;
  buttonStateEvent: StateEvent;
  chatAction?: {
    type: string;
    data: any;
  };
}

class ChatEventHandler {
  private static instance: ChatEventHandler;
  private buttonStateManager: ButtonStateManager;
  private processingQueue: ChatEvent[] = [];
  private isProcessing = false;

  private constructor() {
    this.buttonStateManager = ButtonStateManager.getInstance();
  }

  static getInstance(): ChatEventHandler {
    if (!ChatEventHandler.instance) {
      ChatEventHandler.instance = new ChatEventHandler();
    }
    return ChatEventHandler.instance;
  }

  async handleEvent(event: ChatEvent): Promise<ProcessedEvent> {
    // Add to queue
    this.processingQueue.push(event);

    // Process queue serially to prevent race conditions
    if (!this.isProcessing) {
      return this.processQueue();
    }

    // Wait for current processing to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isProcessing && this.processingQueue.length === 0) {
          clearInterval(checkInterval);
          resolve(this.getLastProcessedEvent());
        }
      }, 50);
    });
  }

  private async processQueue(): Promise<ProcessedEvent> {
    this.isProcessing = true;
    let lastProcessed: ProcessedEvent | null = null;

    while (this.processingQueue.length > 0) {
      const event = this.processingQueue.shift()!;
      lastProcessed = await this.processEventInternal(event);
    }

    this.isProcessing = false;
    return lastProcessed!;
  }

  private async processEventInternal(event: ChatEvent): Promise<ProcessedEvent> {
    let buttonStateEvent: StateEvent;
    let chatAction: any;

    switch (event.type) {
      case 'button_click':
        buttonStateEvent = await this.handleButtonClick(event);
        chatAction = this.createButtonChatAction(event);
        break;

      case 'card_select':
        buttonStateEvent = await this.handleCardSelect(event);
        chatAction = this.createCardChatAction(event);
        break;

      case 'text_input':
        buttonStateEvent = await this.handleTextInput(event);
        chatAction = this.createTextChatAction(event);
        break;

      case 'stage_change':
        buttonStateEvent = await this.handleStageChange(event);
        chatAction = null;
        break;

      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }

    // Process button state event
    await this.buttonStateManager.processEvent(buttonStateEvent);

    return {
      event,
      buttonStateEvent,
      chatAction
    };
  }

  private async handleButtonClick(event: ChatEvent): Promise<StateEvent> {
    const { action, buttonId } = event.payload;

    // Special handling for confirmation buttons
    if (action === 'confirm') {
      return {
        type: 'CONFIRM',
        payload: { buttonId, action }
      };
    } else if (action === 'refine') {
      return {
        type: 'REFINE',
        payload: { buttonId, action }
      };
    }

    // Regular button actions
    return {
      type: 'BUTTON_ACTION',
      payload: { action, buttonId }
    };
  }

  private async handleCardSelect(event: ChatEvent): Promise<StateEvent> {
    const { cardId, value, type } = event.payload;

    return {
      type: 'CARD_SELECTED',
      payload: { cardId, value, type }
    };
  }

  private async handleTextInput(event: ChatEvent): Promise<StateEvent> {
    const { text, needsConfirmation } = event.payload;

    return {
      type: 'USER_INPUT',
      payload: { text, needsConfirmation }
    };
  }

  private async handleStageChange(event: ChatEvent): Promise<StateEvent> {
    const { stage, phase } = event.payload;

    return {
      type: 'STAGE_CHANGE',
      payload: { stage, phase }
    };
  }

  private createButtonChatAction(event: ChatEvent) {
    const { action, label } = event.payload;

    return {
      type: 'button_response',
      data: {
        action,
        label,
        timestamp: Date.now()
      }
    };
  }

  private createCardChatAction(event: ChatEvent) {
    const { value, type } = event.payload;

    return {
      type: 'card_response',
      data: {
        value,
        type,
        timestamp: Date.now()
      }
    };
  }

  private createTextChatAction(event: ChatEvent) {
    const { text } = event.payload;

    return {
      type: 'text_response',
      data: {
        text,
        timestamp: Date.now()
      }
    };
  }

  private lastProcessedEvent: ProcessedEvent | null = null;

  private getLastProcessedEvent(): ProcessedEvent {
    if (!this.lastProcessedEvent) {
      throw new Error('No event has been processed yet');
    }
    return this.lastProcessedEvent;
  }

  // Helper method to determine if user input needs confirmation
  static needsConfirmation(
    currentStage: string,
    messageText: string,
    conversationContext: any
  ): boolean {
    // Big Ideas and Essential Questions typically need confirmation
    if (currentStage.includes('BIG_IDEA') || currentStage.includes('ESSENTIAL_QUESTION')) {
      return true;
    }

    // Learning objectives and deliverables might need confirmation
    if (currentStage.includes('LEARNING_OBJECTIVE') || currentStage.includes('DELIVERABLE')) {
      return true;
    }

    // Check if it's a substantive response (more than just a few words)
    if (messageText.split(' ').length > 5) {
      return true;
    }

    return false;
  }

  // Helper to create a message for the chat
  static createUserMessage(text: string, metadata?: any): Message {
    return {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      timestamp: new Date(),
      metadata
    };
  }

  // Helper to track conversation context
  static updateConversationContext(
    currentContext: any,
    event: ProcessedEvent
  ): any {
    const newContext = { ...currentContext };

    // Track captured values
    if (event.chatAction?.type === 'card_response') {
      const { type, value } = event.chatAction.data;
      if (!newContext.capturedData) {
        newContext.capturedData = new Map();
      }
      newContext.capturedData.set(type, value);
    }

    // Track flags
    if (event.buttonStateEvent.type === 'BUTTON_ACTION') {
      const { action } = event.buttonStateEvent.payload;
      if (!newContext.flags) {
        newContext.flags = [];
      }
      newContext.flags.push(action);
    }

    // Update sub-stage
    if (event.buttonStateEvent.type === 'CONFIRM') {
      newContext.isWaitingForConfirmation = false;
    } else if (event.buttonStateEvent.type === 'CARD_SELECTED') {
      newContext.isWaitingForConfirmation = true;
    }

    return newContext;
  }
}

export default ChatEventHandler;