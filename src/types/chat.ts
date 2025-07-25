// Chat-related type definitions

export interface IdeaOption {
  id: string;
  label: string;
  title: string;
  description: string;
  icon?: React.ElementType;
}

export interface CardSelection {
  value: string;
  type: 'idea' | 'whatif' | 'help' | 'example';
  originalOption?: IdeaOption;
  index?: number;
}

export type MessageSource = 
  | { type: 'user-input'; text: string }
  | { type: 'card-selection'; selection: CardSelection }
  | { type: 'quick-action'; action: string };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  metadata?: {
    stage?: string;
    isConfirmation?: boolean;
    responseLength?: number;
    source?: 'user' | 'card' | 'action';
  };
}

export interface QuickReply {
  label: string;
  action: string;
  icon?: string;
}

// Response length contexts based on requirements
export enum ResponseContext {
  CONFIRMATION = 'confirmation',        // 40-50 words
  VALIDATION_ERROR = 'validation',      // 50-100 words  
  BRAINSTORMING = 'brainstorming',     // 100-150 words
  INITIAL_WELCOME = 'welcome',         // 100-150 words
  HELP_CONTENT = 'help',               // 150-200 words
  STAGE_COMPLETE = 'complete'          // 50-75 words
}

export const ResponseLengthLimits: Record<ResponseContext, { min: number; max: number }> = {
  [ResponseContext.CONFIRMATION]: { min: 40, max: 50 },
  [ResponseContext.VALIDATION_ERROR]: { min: 50, max: 100 },
  [ResponseContext.BRAINSTORMING]: { min: 100, max: 150 },
  [ResponseContext.INITIAL_WELCOME]: { min: 100, max: 150 },
  [ResponseContext.HELP_CONTENT]: { min: 150, max: 200 },
  [ResponseContext.STAGE_COMPLETE]: { min: 50, max: 75 }
};