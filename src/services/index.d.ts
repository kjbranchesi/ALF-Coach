// Type declarations for services barrel export
export { default as ButtonStateManager } from './button-state-manager';
export { default as ChatEventHandler } from './chat-event-handler';

// Instance exports
import type ButtonStateManager from './button-state-manager';
import type ChatEventHandler from './chat-event-handler';

export declare const buttonStateManagerInstance: ButtonStateManager;
export declare const chatEventHandlerInstance: ChatEventHandler;