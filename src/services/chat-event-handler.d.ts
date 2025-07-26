import ButtonStateManager from './button-state-manager';

interface ChatEvent {
  type: 'button_click' | 'card_select' | 'text_input' | 'stage_change';
  payload: any;
}

interface ProcessedEvent {
  event: ChatEvent;
  buttonStateEvent: any;
  chatAction: any;
}

declare class ChatEventHandler {
  static instance: ChatEventHandler;
  buttonStateManager: ButtonStateManager;
  processingQueue: ChatEvent[];
  isProcessing: boolean;
  lastProcessedEvent: ProcessedEvent | null;

  constructor();
  static getInstance(): ChatEventHandler;
  handleEvent(event: ChatEvent): Promise<ProcessedEvent>;
  processQueue(): Promise<ProcessedEvent | null>;
  processEventInternal(event: ChatEvent): Promise<ProcessedEvent>;
  handleButtonClick(event: ChatEvent): Promise<any>;
  handleCardSelect(event: ChatEvent): Promise<any>;
  handleTextInput(event: ChatEvent): Promise<any>;
  handleStageChange(event: ChatEvent): Promise<any>;
  createButtonChatAction(event: ChatEvent): any;
  createCardChatAction(event: ChatEvent): any;
  createTextChatAction(event: ChatEvent): any;
  getLastProcessedEvent(): ProcessedEvent;
  
  static needsConfirmation(currentStage: string, messageText: string, conversationContext: any): boolean;
  static createUserMessage(text: string, metadata: any): any;
  static updateConversationContext(currentContext: any, event: ProcessedEvent): any;
}

export default ChatEventHandler;