import { EventEmitter } from '../utils/event-emitter';

interface ButtonState {
  context: {
    stage: string;
    phase?: string;
    conversationState?: string;
    waitingForConfirmation?: boolean;
    activeCard?: string;
    flags?: Set<string>;
    messageCount?: number;
  };
  buttons: Array<{
    id: string;
    type: string;
    label: string;
    action: string;
    icon?: string;
    enabled: boolean;
    visible: boolean;
    variant: string;
  }>;
  timestamp: number;
}

interface ButtonEvent {
  type: string;
  payload: any;
  timestamp?: number;
  priority?: number;
}

declare class ButtonStateManager extends EventEmitter {
  static instance: ButtonStateManager;
  currentState: ButtonState;
  eventQueue: ButtonEvent[];
  processing: boolean;
  configurations: Map<string, any>;
  stateHistory: ButtonState[];
  maxHistorySize: number;

  constructor();
  static getInstance(): ButtonStateManager;
  initializeConfigurations(): void;
  processEvent(event: ButtonEvent): Promise<ButtonState>;
  processQueue(): Promise<void>;
  processEventInternal(event: ButtonEvent): Promise<void>;
  updateContextForEvent(context: any, event: ButtonEvent): any;
  getButtonsForContext(context: any): any[];
  applyDynamicRules(buttons: any[], context: any): any[];
  addToHistory(state: ButtonState): void;
  getCurrentState(): ButtonState;
  getHistory(): ButtonState[];
  subscribe(callback: (newState: ButtonState, oldState: ButtonState, event: ButtonEvent) => void): () => void;
  reset(): void;
  setButtonsLoading(loading: boolean): void;
}

export default ButtonStateManager;