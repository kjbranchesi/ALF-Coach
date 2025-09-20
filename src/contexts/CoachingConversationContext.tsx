/**
 * Coaching Conversation Context
 *
 * Centralized state management for Hero Project coaching conversations
 * Replaces the 32+ useState variables with systematic state management
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { CoachingStageManager, HERO_COACHING_STAGES } from '../services/CoachingConversationArchitecture';
import { UnifiedStorageManager } from '../services/UnifiedStorageManager';
import { heroProjectTransformer } from '../services/HeroProjectTransformer';

// Core state interfaces
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  stageId: string;
  metadata?: {
    capturedData?: Record<string, any>;
    suggestions?: Array<{ id: string; text: string; category: string }>;
    confidence?: number;
    requiresConfirmation?: boolean;
  };
}

export interface CoachingState {
  // Conversation state
  messages: ConversationMessage[];
  isTyping: boolean;
  input: string;

  // Stage management
  stageManager: CoachingStageManager;
  currentStage: string;
  stageProgress: { completed: number; total: number; percentage: number };

  // Data capture
  capturedData: Record<string, any>;
  pendingConfirmations: Array<{
    id: string;
    type: string;
    value: any;
    prompt: string;
  }>;

  // UI state
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  showSuggestions: boolean;
  showContextualHelp: boolean;
  activeHelpTopic: string | null;

  // Error handling
  errors: Array<{
    id: string;
    type: 'conversation' | 'storage' | 'transformation' | 'network';
    message: string;
    timestamp: Date;
    recoverable: boolean;
  }>;

  // Integration state
  projectId: string | null;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasPendingChanges: boolean;

  // Performance tracking
  lastInteractionTime: Date;
  conversationStartTime: Date;
  totalInteractions: number;
}

// Action types
export type CoachingAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ConversationMessage }
  | { type: 'UPDATE_MESSAGES'; payload: ConversationMessage[] }
  | { type: 'ADVANCE_STAGE'; payload?: string }
  | { type: 'UPDATE_CAPTURED_DATA'; payload: Record<string, any> }
  | { type: 'ADD_PENDING_CONFIRMATION'; payload: { id: string; type: string; value: any; prompt: string } }
  | { type: 'RESOLVE_CONFIRMATION'; payload: { id: string; approved: boolean } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'SET_SHOW_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_SHOW_CONTEXTUAL_HELP'; payload: boolean }
  | { type: 'SET_ACTIVE_HELP_TOPIC'; payload: string | null }
  | { type: 'ADD_ERROR'; payload: { type: string; message: string; recoverable: boolean } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_PROJECT_ID'; payload: string }
  | { type: 'SET_AUTO_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_PENDING_CHANGES'; payload: boolean }
  | { type: 'RECORD_INTERACTION' }
  | { type: 'INITIALIZE_CONVERSATION'; payload: { projectId?: string; existingData?: any } }
  | { type: 'RESET_CONVERSATION' };

// Initial state
const createInitialState = (): CoachingState => ({
  messages: [],
  isTyping: false,
  input: '',
  stageManager: new CoachingStageManager(),
  currentStage: 'DISCOVERY_CONTEXT',
  stageProgress: { completed: 0, total: Object.keys(HERO_COACHING_STAGES).length, percentage: 0 },
  capturedData: {},
  pendingConfirmations: [],
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  showSuggestions: false,
  showContextualHelp: false,
  activeHelpTopic: null,
  errors: [],
  projectId: null,
  isAutoSaving: false,
  lastSaved: null,
  hasPendingChanges: false,
  lastInteractionTime: new Date(),
  conversationStartTime: new Date(),
  totalInteractions: 0
});

// Reducer function
const coachingReducer = (state: CoachingState, action: CoachingAction): CoachingState => {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'ADD_MESSAGE':
      const newMessage = action.payload;
      const updatedMessages = [...state.messages, newMessage];

      // Extract captured data from message metadata
      let updatedCapturedData = state.capturedData;
      if (newMessage.metadata?.capturedData) {
        updatedCapturedData = { ...state.capturedData, ...newMessage.metadata.capturedData };
        state.stageManager.updateStageData(updatedCapturedData);
      }

      return {
        ...state,
        messages: updatedMessages,
        capturedData: updatedCapturedData,
        currentStage: state.stageManager.getCurrentStage(),
        stageProgress: state.stageManager.getStageProgress(),
        hasPendingChanges: true,
        lastInteractionTime: new Date(),
        totalInteractions: state.totalInteractions + 1
      };

    case 'UPDATE_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADVANCE_STAGE':
      const nextStage = action.payload || state.stageManager.advanceStage();
      if (nextStage) {
        return {
          ...state,
          currentStage: nextStage,
          stageProgress: state.stageManager.getStageProgress(),
          hasPendingChanges: true
        };
      }
      return state;

    case 'UPDATE_CAPTURED_DATA':
      const mergedData = { ...state.capturedData, ...action.payload };
      state.stageManager.updateStageData(mergedData);

      return {
        ...state,
        capturedData: mergedData,
        currentStage: state.stageManager.getCurrentStage(),
        stageProgress: state.stageManager.getStageProgress(),
        hasPendingChanges: true
      };

    case 'ADD_PENDING_CONFIRMATION':
      return {
        ...state,
        pendingConfirmations: [...state.pendingConfirmations, action.payload]
      };

    case 'RESOLVE_CONFIRMATION':
      const filteredConfirmations = state.pendingConfirmations.filter(
        conf => conf.id !== action.payload.id
      );

      // If approved, update captured data
      let confirmedData = state.capturedData;
      if (action.payload.approved) {
        const confirmation = state.pendingConfirmations.find(
          conf => conf.id === action.payload.id
        );
        if (confirmation) {
          confirmedData = { ...state.capturedData, [confirmation.type]: confirmation.value };
          state.stageManager.updateStageData(confirmedData);
        }
      }

      return {
        ...state,
        pendingConfirmations: filteredConfirmations,
        capturedData: confirmedData,
        hasPendingChanges: true
      };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'TOGGLE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };

    case 'SET_SHOW_SUGGESTIONS':
      return { ...state, showSuggestions: action.payload };

    case 'SET_SHOW_CONTEXTUAL_HELP':
      return { ...state, showContextualHelp: action.payload };

    case 'SET_ACTIVE_HELP_TOPIC':
      return { ...state, activeHelpTopic: action.payload };

    case 'ADD_ERROR':
      const newError = {
        id: `error_${Date.now()}`,
        type: action.payload.type as any,
        message: action.payload.message,
        timestamp: new Date(),
        recoverable: action.payload.recoverable
      };
      return {
        ...state,
        errors: [...state.errors, newError]
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };

    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.payload };

    case 'SET_AUTO_SAVING':
      return { ...state, isAutoSaving: action.payload };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload, hasPendingChanges: false };

    case 'SET_PENDING_CHANGES':
      return { ...state, hasPendingChanges: action.payload };

    case 'RECORD_INTERACTION':
      return {
        ...state,
        lastInteractionTime: new Date(),
        totalInteractions: state.totalInteractions + 1
      };

    case 'INITIALIZE_CONVERSATION':
      const initialState = createInitialState();

      if (action.payload.projectId) {
        initialState.projectId = action.payload.projectId;
      }

      if (action.payload.existingData) {
        initialState.capturedData = action.payload.existingData.capturedData || {};
        initialState.messages = action.payload.existingData.messages || [];
        initialState.stageManager.updateStageData(initialState.capturedData);
        initialState.currentStage = initialState.stageManager.getCurrentStage();
        initialState.stageProgress = initialState.stageManager.getStageProgress();
      }

      return initialState;

    case 'RESET_CONVERSATION':
      return createInitialState();

    default:
      return state;
  }
};

// Context creation
const CoachingConversationContext = createContext<{
  state: CoachingState;
  dispatch: React.Dispatch<CoachingAction>;
  actions: CoachingActions;
} | null>(null);

// Custom hook
export const useCoachingConversation = () => {
  const context = useContext(CoachingConversationContext);
  if (!context) {
    throw new Error('useCoachingConversation must be used within a CoachingConversationProvider');
  }
  return context;
};

// Action creators for complex operations
interface CoachingActions {
  initializeConversation: (projectId?: string, existingData?: any) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  confirmData: (confirmationId: string, approved: boolean) => void;
  saveProgress: () => Promise<void>;
  advanceToNextStage: () => void;
  handleError: (error: Error, type: string, recoverable?: boolean) => void;
  clearError: (errorId: string) => void;
  updateCapturedData: (data: Record<string, any>) => void;
  resetConversation: () => void;
}

// Provider component
export const CoachingConversationProvider: React.FC<{
  children: React.ReactNode;
  storageManager?: UnifiedStorageManager;
}> = ({ children, storageManager }) => {
  const [state, dispatch] = useReducer(coachingReducer, createInitialState());
  const storage = storageManager || UnifiedStorageManager.getInstance();

  // Auto-save functionality
  useEffect(() => {
    if (state.hasPendingChanges && state.projectId) {
      const timer = setTimeout(async () => {
        await actions.saveProgress();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [state.hasPendingChanges, state.capturedData, state.projectId]);

  // Error recovery
  useEffect(() => {
    const unrecoverableErrors = state.errors.filter(error => !error.recoverable);
    if (unrecoverableErrors.length > 0) {
      console.error('Unrecoverable errors detected:', unrecoverableErrors);
      // Could trigger error boundary or fallback UI
    }
  }, [state.errors]);

  const actions: CoachingActions = {
    initializeConversation: useCallback(async (projectId?: string, existingData?: any) => {
      try {
        dispatch({ type: 'INITIALIZE_CONVERSATION', payload: { projectId, existingData } });

        if (projectId) {
          // Load existing project data
          const projectData = await storage.getProject(projectId);
          if (projectData) {
            dispatch({
              type: 'UPDATE_CAPTURED_DATA',
              payload: projectData.capturedData || {}
            });
          }
        }
      } catch (error) {
        actions.handleError(error as Error, 'conversation', true);
      }
    }, [storage]),

    sendMessage: useCallback(async (content: string) => {
      try {
        dispatch({ type: 'SET_TYPING', payload: true });
        dispatch({ type: 'RECORD_INTERACTION' });

        // Add user message
        const userMessage: ConversationMessage = {
          id: `msg_${Date.now()}_user`,
          role: 'user',
          content,
          timestamp: new Date(),
          stageId: state.currentStage
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'SET_INPUT', payload: '' });

        // Process with AI (placeholder - integrate with actual AI service)
        const response = await processMessageWithAI(content, state);

        // Add assistant response
        const assistantMessage: ConversationMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          stageId: state.currentStage,
          metadata: response.metadata
        };

        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

        // Check for stage advancement
        if (state.stageManager.isStageComplete(state.currentStage)) {
          const nextStage = state.stageManager.advanceStage();
          if (nextStage) {
            dispatch({ type: 'ADVANCE_STAGE', payload: nextStage });
          }
        }

      } catch (error) {
        actions.handleError(error as Error, 'conversation', true);
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }
    }, [state]),

    confirmData: useCallback((confirmationId: string, approved: boolean) => {
      dispatch({ type: 'RESOLVE_CONFIRMATION', payload: { id: confirmationId, approved } });
    }, []),

    saveProgress: useCallback(async () => {
      try {
        dispatch({ type: 'SET_AUTO_SAVING', payload: true });

        if (state.projectId) {
          await storage.saveProject({
            id: state.projectId,
            capturedData: state.capturedData,
            chatHistory: state.messages,
            stage: state.currentStage,
            updatedAt: new Date()
          });
        } else {
          // Create new project
          const projectId = await storage.saveProject({
            title: `Hero Project - ${new Date().toLocaleDateString()}`,
            capturedData: state.capturedData,
            chatHistory: state.messages,
            stage: state.currentStage,
            source: 'chat'
          });
          dispatch({ type: 'SET_PROJECT_ID', payload: projectId });
        }

        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      } catch (error) {
        actions.handleError(error as Error, 'storage', true);
      } finally {
        dispatch({ type: 'SET_AUTO_SAVING', payload: false });
      }
    }, [state.projectId, state.capturedData, state.messages, state.currentStage, storage]),

    advanceToNextStage: useCallback(() => {
      const nextStage = state.stageManager.advanceStage();
      if (nextStage) {
        dispatch({ type: 'ADVANCE_STAGE', payload: nextStage });
      }
    }, [state.stageManager]),

    handleError: useCallback((error: Error, type: string, recoverable: boolean = true) => {
      console.error(`Coaching conversation error (${type}):`, error);
      dispatch({
        type: 'ADD_ERROR',
        payload: {
          type,
          message: error.message,
          recoverable
        }
      });
    }, []),

    clearError: useCallback((errorId: string) => {
      dispatch({ type: 'CLEAR_ERROR', payload: errorId });
    }, []),

    updateCapturedData: useCallback((data: Record<string, any>) => {
      dispatch({ type: 'UPDATE_CAPTURED_DATA', payload: data });
    }, []),

    resetConversation: useCallback(() => {
      dispatch({ type: 'RESET_CONVERSATION' });
    }, [])
  };

  return (
    <CoachingConversationContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </CoachingConversationContext.Provider>
  );
};

// Placeholder AI processing function
async function processMessageWithAI(
  content: string,
  state: CoachingState
): Promise<{ content: string; metadata?: any }> {
  // This would integrate with your actual AI service
  // For now, return a placeholder response

  const currentStage = HERO_COACHING_STAGES[state.currentStage];
  const nextPrompt = state.stageManager.getNextPrompt();

  if (nextPrompt) {
    return {
      content: nextPrompt.content,
      metadata: {
        capturedData: extractDataFromMessage(content, state.currentStage),
        suggestions: generateSuggestions(content, state.currentStage)
      }
    };
  }

  return {
    content: "I understand. Let's continue building your Hero Project.",
    metadata: {}
  };
}

function extractDataFromMessage(content: string, stageId: string): Record<string, any> {
  // Simple extraction logic - would be enhanced with AI
  const data: Record<string, any> = {};

  switch (stageId) {
    case 'DISCOVERY_CONTEXT':
      if (content.includes('grade') || content.includes('elementary') || content.includes('middle') || content.includes('high')) {
        data['context.gradeLevel'] = content;
      }
      if (content.includes('science') || content.includes('math') || content.includes('english') || content.includes('social')) {
        data['context.subject'] = content;
      }
      break;

    case 'EMPATHY_STAKEHOLDERS':
      if (content.includes('community') || content.includes('organization') || content.includes('partner')) {
        data['stakeholders.community'] = content;
      }
      break;

    case 'PROBLEM_FRAMING':
      if (content.includes('problem') || content.includes('challenge') || content.includes('issue')) {
        data['challenge.problemStatement'] = content;
      }
      break;
  }

  return data;
}

function generateSuggestions(content: string, stageId: string): Array<{ id: string; text: string; category: string }> {
  // Simple suggestion generation - would be enhanced with AI
  return [
    {
      id: `suggestion_${Date.now()}`,
      text: "Tell me more about that",
      category: "clarification"
    }
  ];
}

export default CoachingConversationProvider;