// Re-export services to ensure proper module resolution
export { default as ButtonStateManager } from './button-state-manager';
export { default as ChatEventHandler } from './chat-event-handler';

// Also export instances for convenience
import ButtonStateManager from './button-state-manager';
import ChatEventHandler from './chat-event-handler';

export const buttonStateManagerInstance = ButtonStateManager.getInstance();
export const chatEventHandlerInstance = ChatEventHandler.getInstance();