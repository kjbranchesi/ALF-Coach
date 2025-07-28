// ChatService - Single source of truth for chat state management
// Following SOP v1.0 strictly

import { EventEmitter } from '../utils/event-emitter';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AIConversationManager, createAIConversationManager } from './ai-conversation-manager';
import { createAIServiceWrapper, type AIServiceWrapper } from './ai-service-wrapper';
import { type SOPValidator, createSOPValidator } from './sop-validator';
import { type ContextManager, createContextManager } from './context-manager';
import { RateLimiter, createDebouncer } from '../utils/rate-limiter';
import { InputValidator } from '../utils/input-validator';
import { logger } from '../utils/logger';
// import { sanitizeAIContent, validateAIResponse } from '../utils/sanitize-ai-content';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    step?: string;
    phase?: ChatPhase;
    actionType?: string;
    showCards?: boolean;
    cardType?: 'ideas' | 'whatif';
    cardOptions?: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  };
}

export type ChatPhase = 
  | 'welcome'        // Initial welcome
  | 'stage_init'     // Stage initiator message
  | 'step_entry'     // Asking for input
  | 'step_confirm'   // Confirming input
  | 'stage_clarify'  // Stage clarifier/recap
  | 'complete';      // Journey complete

export type ChatStage = 'IDEATION' | 'JOURNEY' | 'DELIVERABLES';

export interface ChatState {
  // Current position
  stage: ChatStage;
  stepIndex: number;
  phase: ChatPhase;
  
  // Data
  messages: ChatMessage[];
  capturedData: Record<string, any>;
  pendingValue: string | null;
  
  // UI state
  isProcessing: boolean;
  waitingForInput: boolean;
  showConfirmation: boolean;
  
  // Progress
  totalSteps: number;
  completedSteps: number;
}

// Quick reply button types per SOP
export interface QuickReply {
  id: string;
  label: string;
  action: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'suggestion';
}

// Stage configuration following SOP exactly
const STAGE_CONFIG = {
  IDEATION: {
    steps: [
      { id: 'IDEATION_BIG_IDEA', key: 'ideation.bigIdea', label: 'Big Idea' },
      { id: 'IDEATION_EQ', key: 'ideation.essentialQuestion', label: 'Essential Question' },
      { id: 'IDEATION_CHALLENGE', key: 'ideation.challenge', label: 'Challenge' }
    ]
  },
  JOURNEY: {
    steps: [
      { id: 'JOURNEY_PHASES', key: 'journey.phases', label: 'Phases' },
      { id: 'JOURNEY_ACTIVITIES', key: 'journey.activities', label: 'Activities' },
      { id: 'JOURNEY_RESOURCES', key: 'journey.resources', label: 'Resources' }
    ]
  },
  DELIVERABLES: {
    steps: [
      { id: 'DELIVER_MILESTONES', key: 'deliverables.milestones', label: 'Milestones' },
      { id: 'DELIVER_RUBRIC', key: 'deliverables.rubric', label: 'Rubric' },
      { id: 'DELIVER_IMPACT', key: 'deliverables.impact', label: 'Impact Plan' }
    ]
  }
};

export class ChatService extends EventEmitter {
  private state: ChatState;
  private wizardData: any;
  private blueprintId: string;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  
  // AI Components
  private aiManager: AIConversationManager | null = null;
  private aiServiceWrapper: AIServiceWrapper | null = null;
  private sopValidator: SOPValidator;
  private contextManager: ContextManager;
  private useAIMode: boolean = true; // AI enabled by default
  
  // Robustness components
  private rateLimiter: RateLimiter;
  private actionQueue: Array<{ action: string; data?: any; timestamp: number }> = [];
  private isProcessingQueue: boolean = false;
  private lastActionTime: number = 0;
  private errorCount: number = 0;
  private maxConsecutiveErrors: number = 3;
  private retryAttempts: Map<string, number> = new Map();

  constructor(wizardData: any, blueprintId: string) {
    super();
    this.wizardData = wizardData;
    this.blueprintId = blueprintId;
    
    // Enhanced initialization logging
    console.log('ChatService Constructor Started', {
      wizardData,
      blueprintId,
      timestamp: new Date().toISOString()
    });
    
    // Initialize AI components
    this.sopValidator = createSOPValidator();
    this.contextManager = createContextManager();
    console.log('AI Components initialized', {
      sopValidator: !!this.sopValidator,
      contextManager: !!this.contextManager
    });
    
    // Initialize robustness components
    this.rateLimiter = new RateLimiter(60000, 30, 500);
    
    // AI is ALWAYS enabled unless explicitly disabled
    this.useAIMode = import.meta.env.VITE_USE_AI_CHAT !== 'false';
    console.log('AI Mode:', this.useAIMode ? 'ENABLED' : 'DISABLED');
    
    // Initialize Gemini AI
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Environment Configuration:', {
      apiKeyAvailable: !!apiKey,
      apiKeyLength: apiKey?.length,
      environment: import.meta.env.MODE,
      aiMode: this.useAIMode ? 'ENABLED' : 'DISABLED',
      viteEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
      useAIMode: this.useAIMode,
      timestamp: new Date().toISOString()
    });
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        // Initialize AI Manager for conversation if AI mode is enabled
        if (this.useAIMode) {
          this.aiManager = createAIConversationManager(apiKey);
          if (this.aiManager) {
            console.log('AI Conversation Manager initialized');
          }
          
          // Initialize AI Service Wrapper for robust idea generation
          this.aiServiceWrapper = createAIServiceWrapper(apiKey);
          console.log('AI Service Wrapper initialized');
        }
        
        // Always initialize legacy model for Ideas/WhatIf
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        });
        console.log('Gemini AI model initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
      }
    } else {
      console.warn('Gemini API key not configured - using fallback suggestions');
    }
    
    // Initialize state
    const savedData = this.loadSavedData();
    this.state = {
      stage: 'IDEATION',
      stepIndex: -1,
      phase: 'welcome',
      messages: [],
      capturedData: savedData,
      pendingValue: null,
      isProcessing: false,
      waitingForInput: false,
      showConfirmation: false,
      totalSteps: 9, // 3 stages × 3 steps each
      completedSteps: Object.keys(savedData).length
    };

    console.log('Initial State:', {
      stage: this.state.stage,
      stepIndex: this.state.stepIndex,
      phase: this.state.phase,
      savedDataKeys: Object.keys(savedData),
      completedSteps: this.state.completedSteps
    });

    // Initialize chat immediately to ensure messages render
    this.initializeChat();
  }

  // Public methods
  public getState(): ChatState {
    return { ...this.state };
  }

  public getQuickReplies(): QuickReply[] {
    const { phase, pendingValue, isProcessing } = this.state;

    // Never show buttons while processing
    if (isProcessing) {
      return [];
    }

    // BUTTON REDUCTION STRATEGY: Max 2 primary actions per UX expert recommendation
    switch (phase) {
      case 'welcome':
        return [
          { id: 'start', label: "Okay let's begin", action: 'start', variant: 'primary' as const }
        ];

      case 'stage_init':
        // Prioritize primary action only
        return [
          { id: 'start', label: "Let's Begin", action: 'start', icon: 'Rocket', variant: 'primary' as const }
        ];

      case 'step_confirm':
        // ONLY show confirm buttons if we have a pending value
        if (pendingValue) {
          // Reduced from 3 to 2 primary actions
          return [
            { id: 'continue', label: 'Continue', action: 'continue', icon: 'Check', variant: 'primary' as const },
            { id: 'refine', label: 'Refine', action: 'refine', icon: 'Edit', variant: 'secondary' as const }
          ];
        }
        // If no pending value, fall through to entry buttons
        // Reduced from 3 to 2 primary suggestions
        return [
          { id: 'ideas', label: 'Get Ideas', action: 'ideas', icon: 'Lightbulb', variant: 'primary' as const },
          { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'secondary' as const }
        ];

      case 'step_entry':
        // Reduced from 3 to 2 primary suggestions
        return [
          { id: 'ideas', label: 'Get Ideas', action: 'ideas', icon: 'Lightbulb', variant: 'primary' as const },
          { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'secondary' as const }
        ];

      case 'stage_clarify':
        return [
          { id: 'proceed', label: 'Proceed', action: 'proceed', icon: 'ArrowRight', variant: 'primary' as const },
          { id: 'edit', label: 'Edit', action: 'edit', icon: 'Edit', variant: 'secondary' as const }
        ];

      case 'complete':
        return [];

      default:
        console.warn('Unknown phase:', phase);
        return [];
    }
  }

  public async processAction(action: string, data?: any): Promise<void> {
    // Validate action first
    const validation = InputValidator.validateAction(action, data);
    if (!validation.isValid) {
      console.error('Invalid action:', validation.error);
      this.handleError(new Error(validation.error || 'Invalid action'), 'action_validation');
      return;
    }
    
    // Check rate limiting
    const rateLimitCheck = this.rateLimiter.canPerformAction(action);
    if (!rateLimitCheck.allowed) {
      console.warn(`Rate limit exceeded for action: ${action}. Wait ${rateLimitCheck.waitTime}ms`);
      this.emit('rateLimitExceeded', { action, waitTime: rateLimitCheck.waitTime });
      return;
    }
    
    // Add to queue for processing
    this.actionQueue.push({ action, data, timestamp: Date.now() });
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      await this.processActionQueue();
    }
  }
  
  private async processActionQueue(): Promise<void> {
    if (this.isProcessingQueue || this.actionQueue.length === 0) {return;}
    
    this.isProcessingQueue = true;
    
    while (this.actionQueue.length > 0) {
      const item = this.actionQueue.shift();
      if (!item) {continue;}
      
      // Skip stale actions (older than 10 seconds)
      if (Date.now() - item.timestamp > 10000) {
        console.warn('Skipping stale action:', item.action);
        continue;
      }
      
      await this.processActionInternal(item.action, item.data);
    }
    
    this.isProcessingQueue = false;
  }
  
  private async processActionInternal(action: string, data?: any): Promise<void> {
    if (this.state.isProcessing) {
      // Re-queue if still processing
      console.log('Already processing, re-queuing action:', action);
      this.actionQueue.unshift({ action, data, timestamp: Date.now() });
      return;
    }
    
    this.state.isProcessing = true;
    this.emit('stateChange', this.getState());
    
    const actionId = `${action}-${Date.now()}`;
    
    // Enhanced logging for step_entry phase debugging
    const isStepEntry = this.state.phase === 'step_entry';
    const debugPrefix = isStepEntry ? '🔍 STEP_ENTRY DEBUG' : '🔄 Processing Action';
    
    console.log(`${debugPrefix}:`, {
      actionId,
      action,
      data,
      currentState: {
        stage: this.state.stage,
        stepIndex: this.state.stepIndex,
        phase: this.state.phase,
        pendingValue: this.state.pendingValue,
        allowedActions: this.isValidStateTransition(action) ? 'VALID' : 'INVALID',
        capturedDataKeys: Object.keys(this.state.capturedData)
      },
      timestamp: new Date().toISOString()
    });

    try {
      // Validate state transition
      const isValid = this.isValidStateTransition(action);
      console.log('🚨 VALIDATION RESULT:', { action, phase: this.state.phase, isValid });
      if (!isValid) {
        throw new Error(`Invalid state transition: ${action} in phase ${this.state.phase}`);
      }
      
      switch (action) {
        case 'start':
          await this.handleStart();
          break;
        case 'continue':
          await this.handleContinue();
          break;
        case 'refine':
          await this.handleRefine();
          break;
        case 'help':
          await this.handleHelp();
          break;
        case 'ideas':
          await this.handleIdeas();
          break;
        case 'whatif':
          await this.handleWhatIf();
          break;
        case 'tellmore':
          await this.handleTellMore();
          break;
        case 'proceed':
          await this.handleProceed();
          break;
        case 'edit':
          await this.handleEdit(data);
          break;
        case 'text':
          await this.handleTextInput(data);
          break;
        case 'card_select':
          await this.handleCardSelect(data);
          break;
      }
    } catch (error) {
      await this.handleError(error as Error, action);
    } finally {
      this.state.isProcessing = false;
      this.emit('stateChange', this.getState());
      console.log(`Completed action: ${actionId}`);
    }
  }

  // Private methods
  private async initializeChat(): Promise<void> {
    try {
      console.log('Initializing chat');
      await this.addWelcomeMessage();
      // Emit state change immediately to render messages
      this.emit('stateChange', this.getState());
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Add fallback message on error
      const fallbackMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: this.getFrameworkOverviewFallback(),
        timestamp: new Date(),
        metadata: { phase: 'welcome' }
      };
      this.state.messages.push(fallbackMessage);
      this.emit('stateChange', this.getState());
    }
  }

  private async addWelcomeMessage(): Promise<void> {
    // Always use non-AI welcome message for consistency and speed
    const content = this.getFrameworkOverviewFallback();
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        phase: 'welcome'
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(message);
      } catch (error) {
        console.error('Failed to add message to context manager:', error);
      }
    }
    
    // Emit state change to update UI
    this.emit('stateChange', this.getState());
  }

  private async handleStart(): Promise<void> {
    console.log('handleStart called', {
      currentPhase: this.state.phase,
      currentStage: this.state.stage,
      currentStepIndex: this.state.stepIndex
    });

    // Add user message to show they clicked the button
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: "Let's Begin",
      timestamp: new Date(),
      metadata: {
        actionType: 'button_click',
        action: 'start'
      }
    };
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      this.contextManager.addMessage(userMessage);
    }
    this.emit('stateChange', this.getState());

    if (this.state.phase === 'welcome') {
      // Move directly to first step of ideation
      console.log('Transitioning from welcome to first step');
      this.state.stage = 'IDEATION';
      this.state.stepIndex = 0;
      this.state.phase = 'step_entry';
      await this.addStepEntryMessage();
    } else if (this.state.phase === 'stage_init') {
      // Start first step of current stage
      console.log('Starting first step of stage:', this.state.stage);
      this.state.stepIndex = 0;
      this.state.phase = 'step_entry';
      await this.addStepEntryMessage();
    }

    console.log('handleStart completed', {
      newPhase: this.state.phase,
      newStepIndex: this.state.stepIndex
    });
  }

  private async handleContinue(): Promise<void> {
    console.log('handleContinue called', {
      phase: this.state.phase,
      pendingValue: this.state.pendingValue,
      currentStep: this.getCurrentStep()
    });

    if (this.state.phase === 'step_confirm' && this.state.pendingValue) {
      // Save the value
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        console.log('Saving captured data:', {
          key: currentStep.key,
          value: this.state.pendingValue,
          stepLabel: currentStep.label
        });
        
        this.state.capturedData[currentStep.key] = this.state.pendingValue;
        this.state.completedSteps++;
        this.saveData();
        
        console.log('Progress update:', {
          completedSteps: this.state.completedSteps,
          totalSteps: this.state.totalSteps,
          percentComplete: `${(this.state.completedSteps / this.state.totalSteps * 100).toFixed(1)  }%`
        });
      }
      
      // Clear confirmation state
      this.state.showConfirmation = false;
      this.state.pendingValue = null;
      
      // Move to next step or stage
      await this.advanceToNext();
    } else {
      console.log('handleContinue conditions not met:', {
        phase: this.state.phase,
        hasPendingValue: !!this.state.pendingValue
      });
    }
  }

  private async handleRefine(): Promise<void> {
    // First, add the user's button click as a message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: 'Refine',
      timestamp: new Date(),
      metadata: {
        actionType: 'button_click',
        action: 'refine'
      }
    };
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(userMessage);
      } catch (error) {
        console.error('Failed to add user message to context manager:', error);
      }
    }
    this.emit('stateChange', this.getState())
    
    const currentStep = this.getCurrentStep();
    const currentValue = this.state.pendingValue;
    
    // Reset to entry phase to allow new input
    this.state.phase = 'step_entry';
    this.state.pendingValue = null; // Clear pending value when refining
    
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('refine', {
        step: currentStep,
        userInput: currentValue
      });
    } else {
      // Generate contextual refinement message
      let refinementContent = "Absolutely. Refining our ideas is a crucial part of the design process. ";
      
      if (currentValue) {
        refinementContent += `You previously entered "${currentValue}" for your ${currentStep?.label}. `;
        refinementContent += "Let's explore how we can enhance this concept or consider alternative approaches that might better serve your pedagogical goals.\n\n";
        refinementContent += "Feel free to enter a new idea, or use the **Ideas** or **What-If** buttons for inspiration.";
      } else {
        refinementContent += "What aspect would you like to revisit or enhance?";
      }
      content = refinementContent;
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        phase: 'step_entry',
        step: currentStep?.id
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(message);
        this.aiManager?.updateContext(message);
      } catch (error) {
        console.error('Failed to add message to context:', error);
      }
    }
  }

  private async handleHelp(): Promise<void> {
    // First, add the user's button click as a message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: 'Help',
      timestamp: new Date(),
      metadata: {
        actionType: 'button_click',
        action: 'help'
      }
    };
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(userMessage);
      } catch (error) {
        console.error('Failed to add user message to context manager:', error);
      }
    }
    this.emit('stateChange', this.getState())
    
    const currentStep = this.getCurrentStep();
    let content: string;
    
    // Keep current phase to maintain proper button display
    
    if (this.useAIMode && this.aiManager) {
      try {
        console.log('🆘 Help: Using AI generation');
        content = await this.generateAIContent('help', { step: currentStep });
      } catch (error) {
        console.error('❌ Help AI error, using intelligent fallback:', error);
        content = this.generateHelpContent(currentStep);
      }
    } else {
      console.log('🆘 Help: Using fallback help');
      content = this.generateHelpContent(currentStep);
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        phase: this.state.phase,
        step: currentStep?.id
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(message);
        this.aiManager?.updateContext(message);
      } catch (error) {
        console.error('Failed to add message to context:', error);
      }
    }
  }

  private async handleIdeas(): Promise<void> {
    // First, add the user's button click as a message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: 'Ideas',
      timestamp: new Date(),
      metadata: {
        actionType: 'button_click',
        action: 'ideas'
      }
    };
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(userMessage);
      } catch (error) {
        console.error('Failed to add user message to context manager:', error);
      }
    }
    this.emit('stateChange', this.getState())
    
    // Ensure we're in the right state to show ideas
    if (this.state.phase === 'step_confirm') {
      // Reset to entry phase to allow new selection
      this.state.phase = 'step_entry';
      this.state.pendingValue = null; // Clear pending value
    }
    
    // Show a loading message while generating
    const loadingMessage: ChatMessage = {
      id: `msg-loading-${Date.now()}`,
      role: 'assistant',
      content: "Let me generate some contextually relevant ideas for you...",
      timestamp: new Date()
    };
    this.state.messages.push(loadingMessage);
    this.emit('stateChange', this.getState());
    
    try {
      const ideas = await this.generateIdeas();
      
      // Remove loading message
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Based on educational research and your specific context, I've generated several evidence-based suggestions. These ideas have proven successful in similar settings. Select any that resonate with you, or use them as inspiration for your own approach:",
        timestamp: new Date(),
        metadata: {
          showCards: true,
          cardType: 'ideas',
          cardOptions: ideas,
          phase: 'step_entry'
        }
      };
      
      this.state.messages.push(message);
    } catch (error) {
      console.error('Error generating ideas:', error);
      // Remove loading message and show error
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble generating specific ideas right now. Please try again or share your own ideas!",
        timestamp: new Date()
      };
      this.state.messages.push(errorMessage);
      if (this.useAIMode && this.contextManager) {
        try {
          this.contextManager.addMessage(errorMessage);
        } catch (error) {
          console.error('Failed to add error message to context:', error);
        }
      }
    }
  }

  private async handleWhatIf(): Promise<void> {
    // First, add the user's button click as a message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: 'What-If',
      timestamp: new Date(),
      metadata: {
        actionType: 'button_click',
        action: 'whatif'
      }
    };
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(userMessage);
      } catch (error) {
        console.error('Failed to add user message to context manager:', error);
      }
    }
    this.emit('stateChange', this.getState())
    
    // Ensure we're in the right state to show what-ifs
    if (this.state.phase === 'step_confirm') {
      // Reset to entry phase to allow new selection
      this.state.phase = 'step_entry';
      this.state.pendingValue = null; // Clear pending value
    }
    
    // Show a loading message while generating
    const loadingMessage: ChatMessage = {
      id: `msg-loading-${Date.now()}`,
      role: 'assistant',
      content: "Let me imagine some transformative scenarios for you...",
      timestamp: new Date()
    };
    this.state.messages.push(loadingMessage);
    this.emit('stateChange', this.getState());
    
    try {
      const whatIfs = await this.generateWhatIfs();
      
      // Remove loading message
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Let's explore transformative possibilities. These scenarios push beyond traditional boundaries to imagine what's possible when we remove typical constraints. Consider how these might inspire innovation in your context:",
        timestamp: new Date(),
        metadata: {
          showCards: true,
          cardType: 'whatif',
          cardOptions: whatIfs,
          phase: 'step_entry'
        }
      };
      
      this.state.messages.push(message);
    } catch (error) {
      console.error('Error generating what-ifs:', error);
      // Remove loading message and show error
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble generating scenarios right now. Please try again or share your own 'what if' ideas!",
        timestamp: new Date()
      };
      this.state.messages.push(errorMessage);
      if (this.useAIMode && this.contextManager) {
        try {
          this.contextManager.addMessage(errorMessage);
        } catch (error) {
          console.error('Failed to add error message to context:', error);
        }
      }
    }
  }

  private async handleTellMore(): Promise<void> {
    console.log('TellMore: AI Mode:', this.useAIMode, 'AI Manager:', !!this.aiManager);
    
    // First, add the user's button click as a message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: 'Tell Me More',
      timestamp: new Date(),
      metadata: {
        actionType: 'button_click',
        action: 'tellmore'
      }
    };
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(userMessage);
      } catch (error) {
        console.error('Failed to add user message to context manager:', error);
      }
    }
    this.emit('stateChange', this.getState())
    
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      try {
        console.log('TellMore: Using AI generation');
        content = await this.generateAIContent('tellmore', {
          stage: this.state.stage,
          step: this.getCurrentStep()
        });
      } catch (error) {
        console.error('❌ TellMore AI error, using intelligent fallback:', error);
        content = this.getTellMoreContent();
      }
    } else {
      console.log('TellMore: Using fallback content');
      content = this.getTellMoreContent();
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
    }
    this.emit('stateChange', this.getState());
  }

  private async handleProceed(): Promise<void> {
    // Move to next stage
    const stages: ChatStage[] = ['IDEATION', 'JOURNEY', 'DELIVERABLES'];
    const currentIndex = stages.indexOf(this.state.stage);
    
    if (currentIndex < stages.length - 1) {
      this.state.stage = stages[currentIndex + 1];
      this.state.stepIndex = -1;
      this.state.phase = 'stage_init';
      await this.addStageInitMessage(this.state.stage);
    } else {
      // Complete!
      this.state.phase = 'complete';
      await this.addCompleteMessage();
    }
  }

  private async handleEdit(stepId?: string): Promise<void> {
    // TODO: Implement edit functionality
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "I understand you'd like to make changes. While the edit functionality is being developed, I encourage you to continue forward. Your progress thus far shows strong pedagogical thinking.",
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
  }

  private async handleTextInput(text: string): Promise<void> {
    console.log('💬 handleTextInput called', {
      text: text?.substring(0, 100) + (text?.length > 100 ? '...' : ''),
      textLength: text?.length,
      currentPhase: this.state.phase,
      currentStep: this.getCurrentStep()?.label
    });

    if (!text?.trim()) {
      console.log('Empty text input, ignoring');
      return;
    }
    
    // Validate and sanitize input
    const validation = InputValidator.validateAndSanitize(text);
    console.log('Input validation result:', {
      isValid: validation.isValid,
      issues: validation.issues,
      originalLength: validation.metadata.originalLength,
      wasModified: validation.metadata.wasModified
    });
    
    if (!validation.isValid && validation.issues.length > 0) {
      console.log('❌ Input validation failed');
      // Show validation issues to user
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I noticed some issues with your input: ${validation.issues.join(', ')}. Please try again with a shorter, focused response.`,
        timestamp: new Date()
      };
      this.state.messages.push(errorMessage);
      return;
    }
    
    // Check for pasted content
    if (validation.metadata.originalLength > 500) {
      const pasteValidation = InputValidator.validatePastedContent(text);
      if (pasteValidation.suggestions.length > 0) {
        const suggestionMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'system',
          content: pasteValidation.suggestions.join(' '),
          timestamp: new Date()
        };
        this.state.messages.push(suggestionMessage);
        text = pasteValidation.processedContent;
      }
    }

    // Add user message with sanitized content
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: validation.sanitized,
      timestamp: new Date(),
      metadata: {
        originalLength: validation.metadata.originalLength,
        wasModified: validation.metadata.wasModified
      }
    };
    
    this.state.messages.push(userMessage);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(userMessage);
        this.aiManager?.updateContext(userMessage);
      } catch (error) {
        console.error('Failed to add text input to context:', error);
      }
    }
    
    // Process based on phase - simplified logic
    if (this.state.phase === 'step_entry') {
      // Enhanced debug logging for step_entry text input
      console.log('🔍 STEP_ENTRY Text Input Debug:', {
        inputText: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        inputLength: text.length,
        currentStep: this.getCurrentStep()?.label,
        stepKey: this.getCurrentStep()?.key,
        validationPassed: validation.isValid,
        sanitizedText: validation.sanitizedText?.substring(0, 50)
      });
      
      // Validate minimum input length for step_entry
      if (text.trim().length < 3) {
        console.warn('Text input too short in step_entry:', text.length);
        const shortInputMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Please provide a bit more detail - your input was too brief. What specific ideas do you have in mind?',
          timestamp: new Date()
        };
        this.state.messages.push(shortInputMessage);
        this.state.isProcessing = false;
        this.emit('stateChange', this.getState());
        return;
      }
      
      // Save the input and move to confirmation
      this.state.pendingValue = text;
      this.state.phase = 'step_confirm';
      console.log('🔍 STEP_ENTRY: Transitioning to step_confirm with value:', {
        pendingValue: this.state.pendingValue?.substring(0, 50),
        newPhase: this.state.phase
      });
      await this.addConfirmationMessage(text);
    } else if (this.state.phase === 'step_confirm') {
      // Update the pending value with new input
      this.state.pendingValue = text;
      await this.addConfirmationMessage(text);
    }
    // Ignore text input in other phases
  }

  private async handleCardSelect(card: any): Promise<void> {
    await this.handleTextInput(card.title);
  }

  private getCurrentStep(): any {
    const stageConfig = STAGE_CONFIG[this.state.stage];
    return stageConfig?.steps[this.state.stepIndex];
  }

  private async advanceToNext(): Promise<void> {
    const stageConfig = STAGE_CONFIG[this.state.stage];
    console.log('advanceToNext called', {
      currentStage: this.state.stage,
      currentStepIndex: this.state.stepIndex,
      totalStepsInStage: stageConfig.steps.length,
      capturedSoFar: Object.keys(this.state.capturedData)
    });
    
    if (this.state.stepIndex < stageConfig.steps.length - 1) {
      // Next step in current stage
      this.state.stepIndex++;
      this.state.phase = 'step_entry';
      this.state.pendingValue = null;
      
      console.log('Moving to next step in stage:', {
        newStepIndex: this.state.stepIndex,
        stepId: stageConfig.steps[this.state.stepIndex].id,
        stepLabel: stageConfig.steps[this.state.stepIndex].label
      });
      
      await this.addStepEntryMessage();
    } else {
      // Stage complete
      console.log('🎉 Stage complete! Moving to clarify phase');
      this.state.phase = 'stage_clarify';
      this.state.pendingValue = null;
      await this.addStageClarifyMessage();
    }
  }

  private async addStageInitMessage(stage: ChatStage): Promise<void> {
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('stage_init', { stage });
    } else {
      content = this.getStageInitContent(stage);
    }
    
    // Don't add empty messages
    if (!content || content.trim() === '') {
      console.error('Stage init message is empty, using fallback');
      content = this.getStageInitContent(stage);
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        stage,
        phase: 'stage_init'
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode && this.contextManager) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
    }
    
    // Emit state change to update UI
    this.emit('stateChange', this.getState());
  }

  private async addStepEntryMessage(): Promise<void> {
    const step = this.getCurrentStep();
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('step_entry', { step });
    } else {
      content = this.getStepEntryContent(step);
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        stage: this.state.stage,
        step: step.id,
        phase: 'step_entry'
      }
    };
    
    this.state.messages.push(message);
    this.state.waitingForInput = true;
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(message);
        this.aiManager?.updateContext(message);
      } catch (error) {
        console.error('Failed to add message to context:', error);
      }
    }
  }

  private async addConfirmationMessage(value: string): Promise<void> {
    const step = this.getCurrentStep();
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      console.log('DEBUG: AI Mode is ENABLED, processing step:', step?.id);
      // Process each step intelligently based on its type
      const stepProcessors: Record<string, string> = {
        'IDEATION_BIG_IDEA': 'process_big_idea',
        'IDEATION_EQ': 'process_essential_question',
        'IDEATION_CHALLENGE': 'process_challenge',
        'JOURNEY_PHASES': 'process_phases',
        'JOURNEY_ACTIVITIES': 'process_activities',
        'JOURNEY_RESOURCES': 'process_resources',
        'DELIVER_MILESTONES': 'process_milestones',
        'DELIVER_RUBRIC': 'process_rubric',
        'DELIVER_IMPACT': 'process_impact'
      };
      
      const processor = stepProcessors[step?.id || ''];
      console.log('DEBUG: Using processor:', processor, 'for step:', step?.id);
      if (processor) {
        content = await this.generateAIContent(processor, { 
          step, 
          userInput: value 
        });
      } else {
        content = await this.generateAIContent('confirm', { 
          step, 
          userInput: value 
        });
      }
    } else {
      // Enhanced fallback processing for all steps
      console.error('🔴 CRITICAL: AI should be working but is not!', {
        useAIMode: this.useAIMode,
        hasAIManager: !!this.aiManager,
        step: step?.id,
        apiKey: `${import.meta.env.VITE_GEMINI_API_KEY?.substring(0, 10)  }...`
      });
      // Simple fallback - AI should be working
      content = `AI service is temporarily unavailable. Your input "${value}" has been noted. Please try refreshing the page or continue with the Ideas/What-If buttons.`;
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        phase: 'step_confirm',
        step: step?.id
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(message);
        this.aiManager?.updateContext(message);
      } catch (error) {
        console.error('Failed to add message to context:', error);
      }
    }
  }

  private async addStageClarifyMessage(): Promise<void> {
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('stage_clarify', {
        stage: this.state.stage
      });
    } else {
      content = this.getStageClarifyContent();
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        phase: 'stage_clarify'
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode && this.contextManager) {
      try {
        this.contextManager.addMessage(message);
        this.aiManager?.updateContext(message);
      } catch (error) {
        console.error('Failed to add message to context:', error);
      }
    }
  }

  private async addCompleteMessage(): Promise<void> {
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('complete', {});
    } else {
      content = `**Congratulations!** You've created an amazing learning experience for your students! 🎉

Working together, we've designed a project that will get your students excited about learning. You've built in real-world connections, hands-on activities, and meaningful ways for students to show their growth.

Your students are going to love this project! It gives them the chance to explore, create, and discover while building important skills along the way.

Would you like to review your complete blueprint and talk about next steps for bringing it to life in your classroom?`;
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        phase: 'complete'
      }
    };
    
    this.state.messages.push(message);
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
    }
  }

  // AI Content Generation
  private async generateAIContent(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): Promise<string> {
    console.log('generateAIContent called', {
      action,
      params,
      hasAIManager: !!this.aiManager,
      useAIMode: this.useAIMode,
      timestamp: new Date().toISOString()
    });

    if (!this.aiManager) {
      console.log('AI Manager not available, using fallback');
      // Use enhanced fallback if AI is not available
      return this.generateEnhancedFallback(action, params);
    }
    
    // Get context from context manager
    let relevantContext;
    try {
      if (this.contextManager) {
        relevantContext = this.contextManager.getRelevantContext(action, this.state.stage);
      } else {
        throw new Error('Context manager not available');
      }
      console.log('AI Context retrieved:', {
        messageCount: relevantContext.messages.length,
        capturedDataKeys: Object.keys(relevantContext.capturedData),
        summaryKeyPoints: relevantContext.summary?.keyPoints || []
      });
    } catch (error) {
      console.error('Failed to get context:', error);
      relevantContext = {
        messages: [],
        capturedData: {},
        summary: { keyPoints: [], userPreferences: {}, importantSelections: {}, conversationTone: 'professional' }
      };
    }
    
    const context = {
      messages: relevantContext.messages,
      userData: this.wizardData,
      capturedData: this.state.capturedData,
      currentPhase: this.state.phase
    };
    
    // Get requirements from SOP validator
    const requirements = params.step 
      ? this.sopValidator.getStepRequirements(this.state.stage, params.step.id)
      : params.stage 
      ? this.sopValidator.getStageRequirements(params.stage)
      : [];
    
    try {
      const content = await this.aiManager.generateResponse({
        action,
        stage: params.stage || this.state.stage,
        step: params.step?.id,
        userInput: params.userInput,
        context,
        requirements
      });
      
      // Content is returned as-is from AI manager
      
      // Validate the response
      if (params.step || (action === 'stage_init' && params.stage)) {
        const validation = this.sopValidator.validateResponse(
          content, 
          params.stage || this.state.stage, 
          params.step?.id,
          action
        );
        
        if (!validation.isValid) {
          console.warn(`AI response validation score: ${validation.score}`, validation.issues);
        }
      }
      
      return content;
    } catch (error) {
      console.error('AI generation failed, using enhanced fallback:', error);
      const fallbackResponse = this.getIntelligentFallbackResponse(action, params);
    return fallbackResponse;
    }
  }
  
  // Simple fallback for when AI is unavailable
  private getIntelligentFallbackResponse(action: string, params: any): string {
    console.error('🔴 AI FAILED - Using minimal fallback for:', action);
    
    const { subject, ageGroup, location } = this.wizardData;
    
    // Log the failure for debugging
    console.error('AI Failure Details:', {
      action,
      hasAIManager: !!this.aiManager,
      useAIMode: this.useAIMode,
      apiKeyExists: !!import.meta.env.VITE_GEMINI_API_KEY,
      params
    });
    
    // Minimal fallbacks - just enough to keep the app working
    return `I'm having trouble generating a response. Please try:
    • Refreshing the page
    • Checking your internet connection
    • Using the Ideas or What-If buttons for suggestions
    
    (AI Service temporarily unavailable for: ${action})`;
  }
  
  private generateEnhancedFallback(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): string {
    const fallbackResponse = this.getIntelligentFallbackResponse(action, params);
    return fallbackResponse;
  }
  
  private generateIntelligentWelcome(): string {
    const { subject, ageGroup, location } = this.wizardData;
    const capturedCount = Object.keys(this.state.capturedData).length;
    
    switch (action) {
      case 'welcome':
        return `Welcome! I'm ALF Coach, your expert partner in designing transformative ${subject} learning experiences for ${ageGroup} students in ${location}.\n\nOur journey follows three stages: Ideation, Journey Design, and Deliverables. Each builds on the last to create engaging, meaningful learning.\n\nReady to begin?`;
        
      case 'stage_init':
        return `Welcome to the ${params.stage} stage! ${capturedCount > 0 ? 'Building on your progress, ' : ''}let's ${params.stage === 'IDEATION' ? 'establish your conceptual foundation' : params.stage === 'JOURNEY' ? 'design the learning progression' : 'define success metrics'}.`;
        
      case 'step_entry':
        return `Now let's work on your ${params.step?.label || 'next element'}. What ideas do you have for engaging your ${ageGroup} students in ${subject}?`;
        
      case 'confirm':
        return `Excellent choice! "${params.userInput}" aligns well with best practices for ${ageGroup} ${subject} students. Shall we continue?`;
        
      case 'process_big_idea':
      case 'process_essential_question':
      case 'process_challenge':
      case 'process_phases':
      case 'process_activities':
      case 'process_resources':
      case 'process_milestones':
      case 'process_rubric':
      case 'process_impact':
        // Use the intelligent fallback for all processing actions
        return this.generateIntelligentFallback(params.step, params.userInput || '');
        
      default:
        return `Let's continue developing your ${subject} learning experience.`;
    }
  }

  // Generate intelligent fallback responses for all steps
  private generateIntelligentFallback(step: any, value: string): string {
    const lowerValue = value.toLowerCase();
    const { subject, ageGroup, location } = this.wizardData;
    
    switch (step?.id) {
      case 'IDEATION_BIG_IDEA': {
        let suggestions = [];
        
        // Analyze user input for key themes and concepts
        const hasHistorical = lowerValue.includes('histor') || lowerValue.includes('past') || lowerValue.includes('time') || 
                              lowerValue.includes('period') || lowerValue.includes('empire') || lowerValue.includes('ancient') ||
                              lowerValue.includes('rome') || lowerValue.includes('egypt') || lowerValue.includes('medieval');
        const hasModern = lowerValue.includes('modern') || lowerValue.includes('today') || lowerValue.includes('current') ||
                          lowerValue.includes('pop') || lowerValue.includes('trend') || lowerValue.includes('viral') ||
                          lowerValue.includes('social media') || lowerValue.includes('technology');
        const hasCulture = lowerValue.includes('cultur') || lowerValue.includes('tradition') || lowerValue.includes('customs') ||
                           lowerValue.includes('society') || lowerValue.includes('social');
        const hasMusic = lowerValue.includes('music') || lowerValue.includes('song') || lowerValue.includes('sound') ||
                         lowerValue.includes('rhythm') || lowerValue.includes('melody') || lowerValue.includes('compose');
        const hasBlending = lowerValue.includes('blend') || lowerValue.includes('mix') || lowerValue.includes('fusion') ||
                            lowerValue.includes('combin') || lowerValue.includes('mash') || lowerValue.includes('merge');
        const hasCreativity = lowerValue.includes('creat') || lowerValue.includes('design') || lowerValue.includes('develop') ||
                              lowerValue.includes('make') || lowerValue.includes('build') || lowerValue.includes('construct');
        const hasRelationship = lowerValue.includes('relationship') || lowerValue.includes('connect') || lowerValue.includes('between') ||
                                lowerValue.includes('tie') || lowerValue.includes('link');
        const hasChange = lowerValue.includes('chang') || lowerValue.includes('transform') || lowerValue.includes('evolv');
        const hasNature = lowerValue.includes('nature') || lowerValue.includes('environment') || lowerValue.includes('plant') || lowerValue.includes('natural');
        const hasDomestication = lowerValue.includes('domest') || lowerValue.includes('cultivat') || lowerValue.includes('control');
        const hasUrban = lowerValue.includes('urban') || lowerValue.includes('city') || lowerValue.includes('space');
        const hasPeople = lowerValue.includes('people') || lowerValue.includes('human') || lowerValue.includes('society');
        
        // Check for anachronistic or time-travel concepts (like "labubu dolls during rome empire")
        const hasAnachronism = (hasHistorical && hasModern) || 
                               (lowerValue.includes('during') && (hasHistorical || hasModern)) ||
                               (lowerValue.includes('but') && hasHistorical && (hasCulture || hasModern));
        
        // Generate contextual Big Ideas based on the specific example and other themes
        if (hasAnachronism || (hasHistorical && hasModern && (hasMusic || hasCreativity || hasCulture))) {
          // This matches examples like "labubu dolls during rome empire" - anachronistic creative fusion
          suggestions = [
            { 
              title: "Cultural Time Travel", 
              desc: "How ideas, objects, and cultures transcend their original time periods to create new meanings"
            },
            { 
              title: "Anachronistic Expression", 
              desc: "The creative power of placing modern elements in historical contexts (or vice versa)"
            },
            { 
              title: "Cross-Temporal Creativity", 
              desc: "Blending different eras to reveal universal human experiences and innovations"
            }
          ];
        } else if (hasMusic && (hasCulture || hasHistorical || hasBlending)) {
          // Music-specific cultural fusion
          suggestions = [
            { 
              title: "Musical Cultural Bridges", 
              desc: "How music connects different cultures, times, and places to create new forms of expression"
            },
            { 
              title: "Sonic Time Machines", 
              desc: "Using music to transport listeners across historical periods and cultural boundaries"
            },
            { 
              title: "Rhythms of Cultural Evolution", 
              desc: "How musical forms adapt and transform as they move through time and space"
            }
          ];
        } else if (hasBlending && (hasCulture || hasCreativity)) {
          // General cultural fusion and blending
          suggestions = [
            { 
              title: "Cultural Remix", 
              desc: "The creative power of combining diverse cultural elements to forge new identities"
            },
            { 
              title: "Hybrid Innovation", 
              desc: "How mixing different traditions and ideas creates breakthrough solutions"
            },
            { 
              title: "Fusion as Creation", 
              desc: "Understanding how new forms emerge from the intersection of different worlds"
            }
          ];
        } else if (hasNature && (hasHistorical || hasDomestication || hasRelationship)) {
          // This matches the user's example about domestication of house plants
          suggestions = [
            { 
              title: "Human-Nature Relationships", 
              desc: "How humans shape and are shaped by their interactions with the natural world"
            },
            { 
              title: "Control and Cultivation", 
              desc: "The tension between wildness and domestication in both nature and society"
            },
            { 
              title: "Living Systems in Urban Spaces", 
              desc: "How we create and maintain life in constructed environments"
            }
          ];
        } else if (lowerValue.includes('communit') || lowerValue.includes('social') || hasPeople) {
          suggestions = [
            { 
              title: "Community as Ecosystem", 
              desc: "How human communities function like natural systems with interdependence and balance"
            },
            { 
              title: "Belonging and Place", 
              desc: "The deep connections between identity, community, and physical spaces"
            },
            { 
              title: "Collective Transformation", 
              desc: "How groups create change through shared vision and action"
            }
          ];
        } else if (lowerValue.includes('technolog') || lowerValue.includes('digital') || lowerValue.includes('innovat')) {
          suggestions = [
            { 
              title: "Technology as Extension", 
              desc: "How tools extend human capabilities and reshape our world"
            },
            { 
              title: "Digital Ecosystems", 
              desc: "The living networks of connection in our technological age"
            },
            { 
              title: "Innovation and Tradition", 
              desc: "Balancing progress with preservation of what matters"
            }
          ];
        } else if (hasChange || hasHistorical) {
          suggestions = [
            { 
              title: "Cycles of Change", 
              desc: "Understanding patterns of transformation across time and contexts"
            },
            { 
              title: "Past as Prologue", 
              desc: "How history illuminates present challenges and future possibilities"
            },
            { 
              title: "Evolution and Adaptation", 
              desc: "The ongoing dance between stability and change"
            }
          ];
        } else {
          // More sophisticated generic suggestions that try to incorporate their actual input
          suggestions = [
            { 
              title: "Systems and Connections", 
              desc: `Understanding how ${value} fits within larger patterns and relationships`
            },
            { 
              title: "Power and Agency", 
              desc: `Exploring who shapes ${value} and how it shapes us in return`
            },
            { 
              title: "Local to Global", 
              desc: `Connecting ${value} from personal experience to universal themes`
            }
          ];
        }
        
        return `What a fascinating area to explore! "${value}" touches on some really rich territory for student learning.

I can see you're thinking about ${
          hasAnachronism ? "blending different time periods and cultures in creative ways - what a brilliant concept for exploring how ideas transcend their original contexts" :
          hasMusic && (hasHistorical || hasCulture) ? "using music to bridge different times and cultures" :
          hasBlending && hasCulture ? "the creative fusion of different cultural elements" :
          hasNature && hasHistorical ? "the evolving relationship between humans and nature" :
          hasDomestication ? "themes of control, cultivation, and coexistence" :
          hasRelationship ? "interconnections and relationships" :
          hasChange ? "transformation and evolution" :
          "some compelling concepts"
        }. Let's shape this into a Big Idea that will help your ${ageGroup} students see the world in new ways.

A strong Big Idea is a transferable concept that students can apply across contexts. Based on your interests, here are three directions we could take:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.title}**
*${s.desc}*
This lens would help students explore ${
  i === 0 ? "the dynamic interplay between different forces" :
  i === 1 ? "deeper patterns and tensions in their world" :
  "connections between the specific and universal"
}.`).join('\n\n')}

Which of these resonates with your vision? Or would you like me to help you refine your original idea in a different direction? I'm here to help you craft something that truly captures what you want students to discover.`;
      }
      
      case 'IDEATION_EQ': {
        const bigIdea = this.state.capturedData['ideation.bigIdea'] || 'your Big Idea';
        let suggestions = [];
        
        // Analyze the input and provide intelligent suggestions
        if (value.includes('?')) {
          // They provided a question, help refine it
          suggestions = [
            { q: `How might ${value.replace('?', '')} shape our understanding of ${bigIdea}?`, reason: "Opens exploration of deeper connections" },
            { q: `To what extent does ${value.replace('?', '')} influence ${bigIdea}?`, reason: "Invites critical analysis" },
            { q: `Why do ${value.replace('?', '')} matter in the context of ${bigIdea}?`, reason: "Explores significance and relevance" }
          ];
        } else {
          // They provided a topic, help form questions
          suggestions = [
            { q: `How might we use ${value} to understand ${bigIdea}?`, reason: "Connects their interest to the Big Idea" },
            { q: `What is the relationship between ${value} and ${bigIdea}?`, reason: "Explores connections and patterns" },
            { q: `To what extent does ${value} demonstrate ${bigIdea}?`, reason: "Examines evidence and examples" }
          ];
        }
        
        return `Building on your Big Idea of "${bigIdea}", let's craft an Essential Question from your input: "${value}".

Essential Questions should resist simple answers and drive sustained inquiry. Here are some ways to frame your question:

${suggestions.map((s, i) => `**Option ${i + 1}:** ${s.q}\n*${s.reason}*`).join('\n\n')}

Which question best captures what you want students to explore, or would you like to refine your original idea?`;
      }
      
      case 'IDEATION_CHALLENGE': {
        const bigIdea = this.state.capturedData['ideation.bigIdea'] || 'your Big Idea';
        const eq = this.state.capturedData['ideation.essentialQuestion'] || 'your Essential Question';
        let suggestions = [];
        
        // Generate authentic challenges
        if (lowerValue.includes('create') || lowerValue.includes('design') || lowerValue.includes('build')) {
          suggestions = [
            { c: `Design a ${value} that demonstrates ${bigIdea} for ${location} community`, impact: "Students become designers and problem-solvers" },
            { c: `Create a multimedia campaign about ${value} addressing ${eq}`, impact: "Students influence public understanding" },
            { c: `Build a prototype solution for ${value} based on ${bigIdea}`, impact: "Students develop innovative solutions" }
          ];
        } else {
          suggestions = [
            { c: `Develop a ${value} project that addresses ${eq} in ${location}`, impact: "Students create local solutions" },
            { c: `Research and present ${value} to demonstrate ${bigIdea}`, impact: "Students become knowledge creators" },
            { c: `Organize a ${value} event exploring ${eq} with the community`, impact: "Students lead community learning" }
          ];
        }
        
        return `Excellent! Let's transform "${value}" into an authentic challenge that brings your Essential Question "${eq}" to life.

${ageGroup} students need challenges that empower them as change agents. Here are some possibilities:

${suggestions.map((s, i) => `**Option ${i + 1}:** ${s.c}\n*Impact: ${s.impact}*`).join('\n\n')}

Which challenge excites you most, or how would you like to modify these ideas?`;
      }
      
      case 'JOURNEY_PHASES': {
        const challenge = this.state.capturedData['ideation.challenge'] || 'your challenge';
        let suggestions = [];
        
        // Analyze input for phase structure
        const phaseCount = (value.match(/phase|step|stage/gi) || []).length || 3;
        
        if (phaseCount <= 3) {
          suggestions = [
            { 
              phases: ["Discover & Explore", "Create & Iterate", "Share & Celebrate"],
              desc: "Classic project-based learning progression"
            },
            { 
              phases: ["Research & Understand", "Design & Build", "Test & Refine", "Present & Reflect"],
              desc: "Engineering design process adapted for ${ageGroup}"
            }
          ];
        } else {
          suggestions = [
            { 
              phases: ["Hook & Wonder", "Investigate", "Create", "Critique", "Present"],
              desc: "Inquiry-driven progression with peer feedback"
            },
            { 
              phases: ["Empathize", "Define", "Ideate", "Prototype", "Share"],
              desc: "Design thinking approach for ${ageGroup} learners"
            }
          ];
        }
        
        return `Let's structure "${value}" into clear phases that guide students toward ${challenge}.

For ${ageGroup} students, phases should build skills progressively while maintaining engagement:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.desc}**\n${s.phases.map((p, j) => `${j + 1}. ${p}`).join('\n')}`).join('\n\n')}

Each phase should take about ${Math.floor(21 / phaseCount)} days. Which structure best supports your vision?`;
      }
      
      case 'JOURNEY_ACTIVITIES': {
        const phases = this.state.capturedData['journey.phases'] || 'your phases';
        let suggestions = [];
        
        // Generate age-appropriate activities
        suggestions = [
          {
            set: "Hands-On Exploration",
            activities: [
              `${subject} investigation stations`,
              "Collaborative experiments",
              "Field study in ${location}",
              "Creative making sessions",
              "Peer teaching opportunities"
            ]
          },
          {
            set: "Digital & Interactive",
            activities: [
              "Virtual field trips",
              `${subject} simulations`,
              "Digital storytelling",
              "Online collaboration",
              "Multimedia creation"
            ]
          },
          {
            set: "Community Connected",
            activities: [
              "Expert interviews",
              "Community surveys",
              "Local partnerships",
              "Service learning",
              "Public exhibitions"
            ]
          }
        ];
        
        return `Great ideas in "${value}"! Let's develop engaging activities that bring ${phases} to life for ${ageGroup} students.

Here are activity sets that promote active learning:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.set}**\n${s.activities.map(a => `• ${a}`).join('\n')}`).join('\n\n')}

Which set best matches your teaching style and available resources?`;
      }
      
      case 'JOURNEY_RESOURCES': {
        const activities = this.state.capturedData['journey.activities'] || 'your activities';
        let suggestions = [];
        
        // Generate resource categories
        suggestions = [
          {
            category: "Essential Materials",
            items: [
              `${subject} reference materials`,
              "Art/craft supplies",
              "Technology devices",
              "Recording equipment",
              "Presentation tools"
            ]
          },
          {
            category: "Human Resources",
            items: [
              "Subject matter experts",
              "Community partners",
              "Parent volunteers",
              "Peer mentors",
              "Guest speakers from ${location}"
            ]
          },
          {
            category: "Digital Tools",
            items: [
              "Learning management system",
              "Collaboration platforms",
              "Research databases",
              "Creation software",
              "Assessment tools"
            ]
          }
        ];
        
        return `Based on "${value}", let's organize resources to support ${activities} effectively.

For ${ageGroup} students in ${location}, consider these resource categories:

${suggestions.map(s => `**${s.category}:**\n${s.items.map(i => `• ${i}`).join('\n')}`).join('\n\n')}

Many of these can be sourced locally or accessed freely online. What additional support do you need?`;
      }
      
      case 'DELIVER_MILESTONES': {
        const challenge = this.state.capturedData['ideation.challenge'] || 'the challenge';
        const phases = this.state.capturedData['journey.phases'] || 'project phases';
        let suggestions = [];
        
        // Generate milestone frameworks
        suggestions = [
          {
            framework: "Progress Checkpoints",
            milestones: [
              "Research question approved",
              "Initial findings shared",
              "Prototype/draft completed",
              "Peer feedback incorporated",
              "Final product polished",
              "Presentation rehearsed"
            ]
          },
          {
            framework: "Skill Builders",
            milestones: [
              "Collaboration agreement signed",
              "Research skills demonstrated",
              "Creative process documented",
              "Problem-solving breakthrough",
              "Communication skills shown",
              "Reflection completed"
            ]
          }
        ];
        
        return `Let's transform "${value}" into clear milestones that keep ${ageGroup} students motivated throughout ${phases}.

Effective milestones celebrate progress toward ${challenge}:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.framework}**\n${s.milestones.map((m, j) => `${j + 1}. ${m}`).join('\n')}`).join('\n\n')}

Each milestone should be celebrated visibly. Which framework best maintains momentum?`;
      }
      
      case 'DELIVER_RUBRIC': {
        const challenge = this.state.capturedData['ideation.challenge'] || 'the challenge';
        let suggestions = [];
        
        // Generate rubric frameworks
        suggestions = [
          {
            framework: "Growth-Focused",
            categories: [
              "Understanding: I can explain ${subject} concepts clearly",
              "Process: I can work effectively with my team",
              "Creation: I can develop innovative solutions",
              "Communication: I can share my learning effectively",
              "Reflection: I can identify my growth"
            ]
          },
          {
            framework: "Competency-Based",
            categories: [
              "Research: I can find and use reliable information",
              "Critical Thinking: I can analyze and evaluate ideas",
              "Creativity: I can generate original solutions",
              "Collaboration: I can contribute to team success",
              "Impact: I can make a difference in my community"
            ]
          }
        ];
        
        return `Let's develop "${value}" into student-friendly success criteria for ${challenge}.

For ${ageGroup} students, rubrics should inspire excellence:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.framework}**\n${s.categories.map(c => `• ${c}`).join('\n')}`).join('\n\n')}

Each category would have 3-4 levels (Emerging, Developing, Proficient, Advanced). Which framework best captures your vision?`;
      }
      
      case 'DELIVER_IMPACT': {
        const challenge = this.state.capturedData['ideation.challenge'] || 'student work';
        const bigIdea = this.state.capturedData['ideation.bigIdea'] || 'their learning';
        let suggestions = [];
        
        // Generate impact plans
        suggestions = [
          {
            plan: "Community Showcase",
            elements: [
              `Public exhibition at ${location} community center`,
              "Interactive demonstrations for younger students",
              "Digital portfolio shared with families",
              "Local media coverage",
              "Celebration ceremony with certificates"
            ]
          },
          {
            plan: "Digital Impact",
            elements: [
              "Student-created website or app",
              "Social media campaign",
              "Video documentary",
              "Virtual gallery tour",
              "Online resource library"
            ]
          },
          {
            plan: "Action-Oriented",
            elements: [
              "Implementation of student solutions",
              "Teaching workshops for peers",
              "Community action project",
              "Partnership with local organizations",
              "Ongoing service learning"
            ]
          }
        ];
        
        return `Excellent! Let's plan how "${value}" can create authentic impact beyond the classroom.

For ${ageGroup} students demonstrating ${bigIdea}, consider these approaches:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.plan}**\n${s.elements.map(e => `• ${e}`).join('\n')}`).join('\n\n')}

Which approach creates the most meaningful impact for your students and community?`;
      }
      
      default:
        return `Thank you. Let me confirm your ${step?.label || 'selection'}:

**${value}**

Does this accurately capture your vision? If so, we can proceed to the next element. If you'd like to refine this further to better align with your pedagogical goals, please select 'Refine'.`;
    }
  }

  // Content generation methods
  private getStageInitContent(stage: ChatStage): string {
    const templates = {
      IDEATION: `**Welcome to the Ideation Stage!**

Great to have you here! Let's work together to create something amazing for your students. We'll tackle three key pieces:

**1. Big Idea** - We'll find a concept that really clicks with your students and connects to their world
**2. Essential Question** - We'll craft a question that gets them genuinely curious and eager to explore
**3. Challenge** - We'll design a real-world task that lets them make a difference

Think of this as building the heart of your learning experience. Each piece we create will naturally flow into the next, and I'll be here to help every step of the way.

Ready to discover your Big Idea? Let's dive in!`,
      
      JOURNEY: `**Welcome to the Journey Design Stage!**

Nice work on your foundation! Now let's map out how students will actually experience this learning adventure. We'll focus on three things:

**1. Phases** - We'll break the journey into manageable chunks that build on each other naturally
**2. Activities** - We'll plan engaging experiences that get students actively involved
**3. Resources** - We'll gather the tools and materials that will help them succeed

Think of yourself as a tour guide planning an amazing trip. We want students excited about each step, with everything they need to thrive along the way.

Ready to start mapping this journey together?`,
      
      DELIVERABLES: `**Welcome to the Deliverables Stage!**

You've made it to the finish line! Now let's figure out how students will show what they've learned and share it with the world. We'll work on:

**1. Milestones** - We'll set up checkpoints that help students stay on track and celebrate progress
**2. Rubric** - We'll create clear expectations that help students understand success
**3. Impact Plan** - We'll connect their work to real people who will genuinely benefit from it

This is where learning becomes real. Students won't just complete assignments—they'll create something that matters to someone beyond the classroom.

Let's design ways for your students to shine!`
    };
    
    return templates[stage] || '';
  }

  private getStepEntryContent(step: any): string {
    // This will be enhanced with context-aware prompts
    const prompts: Record<string, string> = {
      'IDEATION_BIG_IDEA': `Let's work together to find a Big Idea that will really resonate with your ${this.wizardData?.subject || 'your subject'} students.

We're looking for a concept that:
• Helps students see ${this.wizardData?.subject || 'your subject'} in a whole new way
• Connects to what matters in their daily lives
• Sparks genuine curiosity and questions

Thinking about your ${this.wizardData?.ageGroup || 'your'} students in ${this.wizardData?.location || 'your location'}, what's a big concept that could make ${this.wizardData?.subject || 'your subject'} feel relevant and exciting to them?

*Some ideas that work well: "Systems and Interactions," "Patterns of Change," or "Power and Agency" - but let's find one that fits your specific context!*`,
      
      'IDEATION_EQ': `Great Big Idea! Now let's turn it into a question that will really get your students thinking.

We want a question that:
• Makes students curious and want to dig deeper
• Doesn't have an easy yes/no answer
• Keeps them engaged throughout the project

Based on your Big Idea, what question would make your ${this.wizardData?.ageGroup || 'your'} students lean in and say "I want to know more about that!"?

*Questions that start with "How might we...", "What would happen if...", or "Why do..." often work really well!*`,
      
      'IDEATION_CHALLENGE': `Love that question! Now let's create a real-world challenge that gets students excited to take action.

We're aiming for something that:
• Tackles a real problem students can actually help solve
• Matters to people in their community
• Results in something concrete they can be proud of

Given what you know about ${this.wizardData?.location || 'your location'} and your students' interests, what challenge would show them that ${this.wizardData?.subject || 'your subject'} can make a real difference?

*Think about challenges like: "Help local businesses with...", "Create something that makes our school better...", or "Design a solution for families who..."*`,
      
      'JOURNEY_PHASES': `Now let's map out how your ${this.wizardData?.ageGroup || 'your'} students will tackle this project step by step.

We want phases that:
• Build confidence with early wins
• Give students just enough structure without being too rigid
• Keep the energy high with variety
• Let them celebrate progress along the way

How would you like to break this project into 3-4 manageable chunks that keep students engaged from start to finish?

*For ${this.wizardData?.ageGroup || 'your'}, phases like "Explore & Wonder," "Design & Create," "Test & Improve," and "Share & Celebrate" often work great!*`,
      
      'JOURNEY_ACTIVITIES': `Perfect phases! Now let's brainstorm specific activities that will make each phase come alive.

For ${this.wizardData?.ageGroup || 'your'} students, we want activities that:
• Get them moving and doing, not just sitting
• Let them work together and learn from each other
• Connect to things they already know and care about
• Build skills while having fun

What kinds of hands-on activities would help your students tackle their ${this.state.capturedData['ideation.challenge'] || 'challenge'} with confidence?

*Think about: games, experiments, building projects, interviews, field trips, creative challenges - whatever gets them excited!*`,
      
      'JOURNEY_RESOURCES': `Awesome activities! Now let's think about what resources will help your students succeed.

For ${this.wizardData?.ageGroup || 'your'} learners, we want resources that:
• Are easy to understand and fun to use
• Include different formats (not just reading!)
• Support different learning styles
• Feel familiar and relevant to ${this.wizardData?.location || 'your location'}

What materials, tools, and supports will set your students up for success?

*Consider: engaging books, videos, local experts, apps, hands-on materials, community connections - anything that brings learning to life!*`,
      
      'DELIVER_MILESTONES': `Let's plan some checkpoints that will keep your ${this.wizardData?.ageGroup || 'your'} students motivated and on track.

We want milestones that:
• Give students regular "wins" to celebrate
• Show clear progress they can see and feel proud of
• Build toward the final goal step by step
• Let them reflect on how far they've come

What key moments in the project will help students see they're making real progress on their ${this.state.capturedData['ideation.challenge'] || 'challenge'}?

*Think about concrete achievements like: "First interview complete," "Prototype working," "Feedback collected," "Ready to present!"*`,
      
      'DELIVER_RUBRIC': `Now let's create a way for ${this.wizardData?.ageGroup || 'your'} students to understand what success looks like.

We want success criteria that:
• Use language students understand (no jargon!)
• Celebrate effort and growth, not just final products
• Include teamwork and creativity alongside content
• Feel encouraging, not intimidating

What would help your students know they're doing great work on their ${this.wizardData?.subject || 'your subject'} project?

*Categories that work well: Understanding the Topic, Creative Solutions, Working Together, Communicating Ideas, Problem-Solving Skills*`,
      
      'DELIVER_IMPACT': `Finally, let's plan how students will share their amazing work with people who matter!

For ${this.wizardData?.ageGroup || 'your'} students, sharing should:
• Connect to audiences they care about
• Feel like a celebration, not a test
• Let them choose how to present their work
• Create something memorable they can be proud of

${this.state.capturedData['ideation.bigIdea'] ? 
`Building on your Big Idea of "${this.state.capturedData['ideation.bigIdea']}" and ` : ''}${this.state.capturedData['ideation.challenge'] ? 
`your challenge to "${this.state.capturedData['ideation.challenge']}", ` : ''}how can we help students share their work in a way that makes a real impact?

*Some fun ideas: School assembly, community event, video showcase, teaching younger kids, family celebration night - what would work best for your students?*`
    };
    
    return prompts[step.id] || `Please provide your ${step.label}.`;
  }

  private getStageClarifyContent(): string {
    const data = this.state.capturedData;
    
    const templates = {
      IDEATION: `**Ideation Stage Complete**

Let's review the conceptual foundation you've established:

**Big Idea:** ${data['ideation.bigIdea'] || '*In progress*'}
**Essential Question:** ${data['ideation.essentialQuestion'] || '*In progress*'}
**Challenge:** ${data['ideation.challenge'] || '*In progress*'}

This framework provides a strong pedagogical foundation aligned with project-based learning principles. Your Big Idea establishes relevance, your Essential Question drives inquiry, and your Challenge ensures authentic application.

Shall we proceed to design the learning journey that will bring this vision to life?`,
      
      JOURNEY: `**Journey Design Complete**

Your learning architecture demonstrates thoughtful instructional design:

**Phases:** ${data['journey.phases'] || '*In development*'}
**Activities:** ${data['journey.activities'] || '*In development*'}
**Resources:** ${data['journey.resources'] || '*In development*'}

This progression aligns with research on cognitive load and scaffolded learning. Your phases provide structure, activities ensure engagement, and resources support differentiation.

Shall we proceed to define assessment criteria and impact measures?`,
      
      DELIVERABLES: `**Deliverables Framework Complete**

Your assessment design reflects best practices in authentic evaluation:

**Milestones:** ${data['deliverables.milestones'] || '*In development*'}
**Success Criteria:** ${data['deliverables.rubric'] || '*In development*'}
**Impact Plan:** ${data['deliverables.impact'] || '*In development*'}

This framework ensures both formative and summative assessment while maintaining focus on real-world application. Your approach values process and product equally.

Would you like to review your complete learning blueprint?`
    };
    
    return templates[this.state.stage] || 'Great progress! Ready to continue?';
  }

  private getTellMoreContent(): string {
    return this.getTellMoreContentUnsanitized();
  }
  
  private getTellMoreContentUnsanitized(): string {
    const { phase, stage, stepIndex } = this.state;
    const currentStep = this.getCurrentStep();
    
    // Welcome phase - explain the entire framework
    if (phase === 'welcome') {
      return `**The Active Learning Framework: Research-Based Design for Deep Engagement**

The Active Learning Framework (ALF) synthesizes decades of educational research into a practical design process that transforms traditional instruction into inquiry-driven, student-centered experiences.

**Our Three-Stage Journey:**

__**1. Ideation Stage**__ (10 minutes)
We'll establish the conceptual foundation for your project:
- **Big Idea**: A transferable concept that connects ${this.wizardData?.subject || 'your subject'} to real-world contexts
- **Essential Question**: An open-ended inquiry that drives sustained investigation
- **Anachronistic Challenge**: A creative twist that bridges different time periods or contexts

__**2. Journey Stage**__ (15 minutes)  
We'll design the learning pathway:
- **Phases**: 3-4 distinct stages that scaffold student growth
- **Activities**: Engaging, hands-on experiences aligned with ${this.wizardData?.ageGroup || 'your'} development
- **Resources**: Curated materials and expert connections

__**3. Deliverables Stage**__ (10 minutes)
We'll create authentic assessments:
- **Milestones**: Formative checkpoints that celebrate progress
- **Rubric**: Growth-oriented criteria that values both process and product
- **Impact Plan**: Real-world audience engagement

**Why This Approach Works:**
The framework builds on established educational approaches including Understanding by Design (Wiggins & McTighe), Project-Based Learning (Buck Institute), and culturally responsive teaching practices. The framework aligns with Understanding by Design, Project-Based Learning gold standards, and culturally responsive teaching practices.

Ready to transform your ${this.wizardData?.subject || 'your subject'} classroom?`;
    }
    
    // Stage initialization - explain the specific stage
    if (phase === 'stage_init') {
      return this.getStageInitTellMore();
    }
    
    // Step-specific content
    if (currentStep) {
      return this.getStepSpecificTellMore(currentStep);
    }
    
    // Fallback to generic
    return this.getGenericTellMore();
  }

  private getStageInitTellMore(): string {
    const stageContent: Record<ChatStage, string> = {
      'IDEATION': `**The Ideation Stage: Sparking Curiosity and Purpose**

In this foundational stage, we'll craft the conceptual heart of your learning experience. Projects with clear conceptual frameworks help students connect learning to real-world contexts and see patterns across disciplines.

**What We'll Create Together:**

__**Big Idea**__ (Step 1)
A transferable concept that reveals patterns across contexts. For ${this.wizardData?.ageGroup || 'your'} students, effective Big Ideas:
- Connect ${this.wizardData?.subject || 'your subject'} to their lived experiences
- Reveal "aha!" moments about how the world works
- Transfer beyond this specific unit

__**Essential Question**__ (Step 2)  
An open-ended inquiry that sustains investigation. Great questions for this age:
- Can't be answered with a quick Google search
- Generate debate and multiple perspectives
- Connect to real issues in ${this.wizardData?.location || 'your location'}

__**Anachronistic Challenge**__ (Step 3)
A creative twist that bridges time periods. This unique element:
- Sparks imagination by combining unexpected elements
- Creates memorable hooks for learning
- Encourages creative problem-solving

**Why This Matters:**
Grant Wiggins and Jay McTighe's Understanding by Design framework emphasizes that starting with big ideas and essential questions helps students develop deeper understanding that transfers to new situations.

Let's begin with your Big Idea!`,
      
      'JOURNEY': `**The Journey Stage: Designing the Learning Path**

Now we'll map out how students will explore your Big Idea through progressive skill-building and discovery. This stage transforms your conceptual framework into actionable learning experiences.

**What We'll Design Together:**

__**Learning Phases**__ (Step 1)
We'll create 3-4 distinct phases that scaffold student growth:
- Each phase builds on the previous one
- Clear milestones mark progress
- Balance between structure and exploration

__**Engaging Activities**__ (Step 2)
For each phase, we'll design activities that are:
- Developmentally appropriate for ${this.wizardData?.ageGroup || 'your'}
- Aligned with ${this.wizardData?.subject || 'your subject'} standards
- Connected to real-world applications
- Inclusive of diverse learning styles

__**Curated Resources**__ (Step 3)
We'll identify materials and connections:
- Expert speakers from ${this.wizardData?.location || 'your location'}
- Digital tools and platforms
- Hands-on materials
- Community partnerships

**Research Foundation:**
Well-structured project phases with varied activities help maintain student engagement and deepen conceptual understanding. The journey metaphor helps students see learning as an adventure rather than a checklist.

Ready to map the journey?`,
      
      'DELIVERABLES': `**The Deliverables Stage: Authentic Assessment & Impact**

In this final stage, we'll design how students demonstrate their learning through authentic products that matter beyond the classroom. This transforms assessment from judgment to celebration.

**What We'll Create Together:**

__**Progress Milestones**__ (Step 1)
Formative checkpoints that:
- Celebrate growth along the journey
- Provide feedback opportunities
- Build toward the final product
- Keep students motivated

__**Assessment Rubric**__ (Step 2)
Growth-oriented criteria that:
- Values process as much as product
- Uses student-friendly language
- Aligns with ${this.wizardData?.subject || 'your subject'} standards
- Promotes self-assessment

__**Impact Plan**__ (Step 3)
Real-world connections through:
- Authentic audiences who care about the work
- Public exhibitions or presentations
- Community partnerships
- Digital sharing platforms

**Why Authentic Assessment Matters:**
The Buck Institute for Education emphasizes that projects with authentic audiences motivate students to produce higher quality work and develop real-world skills. When students know their work matters, they rise to meet high expectations.

Let's design assessments that inspire!`
    };
    
    return stageContent[this.state.stage] || this.getGenericTellMore();
  }

  private getStepSpecificTellMore(step: any): string {
    const stepContent: Record<string, string> = {
      'IDEATION_BIG_IDEA': `**Crafting Powerful Big Ideas**

A Big Idea is the conceptual cornerstone that gives your project depth and staying power. For ${this.wizardData?.ageGroup || 'your'} students studying ${this.wizardData?.subject || 'your subject'}, effective Big Ideas:

**Characteristics of Strong Big Ideas:**
- **Transferable**: Apply beyond this specific unit
- **Revelatory**: Reveal hidden connections
- **Engaging**: Connect to student interests
- **Generative**: Spark further questions

**Examples in ${this.wizardData?.subject || 'your subject'}:**
- "Innovation disrupts tradition" (History/Technology)
- "Patterns reveal purpose" (Math/Science)
- "Voice amplifies change" (English/Social Studies)
- "Balance creates harmony" (Arts/Sciences)

**The Anachronistic Twist:**
ALF Coach's unique approach encourages temporal bridges - like "Roman social media" or "Medieval startups" - that make abstract concepts concrete and memorable.

**Framework Foundation:**
Wiggins & McTighe's Understanding by Design advocates for organizing units around Big Ideas to promote transfer of learning to new contexts.

What concept in ${this.wizardData?.subject || 'your subject'} could transform how your students see the world?`,
      
      'IDEATION_EQ': `**Essential Questions That Drive Deep Learning**

Your Essential Question transforms your Big Idea into an investigation that sustains curiosity throughout the project. For ${this.wizardData?.ageGroup || 'your'}, powerful questions:

**Key Characteristics:**
- Open-ended (no single "right" answer)
- Thought-provoking (require analysis and synthesis)
- Discipline-grounded (use ${this.wizardData?.subject || 'your subject'} concepts)
- Student-accessible (connect to their world)

**Question Starters That Work:**
- "How might..." (design thinking)
- "Why do..." (causal analysis)
- "What if..." (hypothetical reasoning)
- "To what extent..." (evaluative thinking)

**Examples for Your Context:**
- How might ancient innovations solve modern problems?
- Why do some ideas survive across centuries while others vanish?
- What if historical figures had access to today's technology?

**Pedagogical Power:**
Essential Questions, as described by Jay McTighe and Grant Wiggins, promote sustained inquiry and develop critical thinking skills that transfer across disciplines.

Building on "${this.state.capturedData['ideation.bigIdea'] || 'your Big Idea'}", what question would ignite investigation?`,
      
      'IDEATION_CHALLENGE': `**Designing Authentic Challenges**

The Challenge transforms your Essential Question into concrete action. For ${this.wizardData?.ageGroup || 'your'} students, effective challenges:

**Key Components:**
- **Action Verb**: Create, Design, Solve, Transform
- **Authentic Product**: Something valued beyond grades
- **Real Audience**: People who genuinely care
- **Anachronistic Element**: Your creative twist

**Challenge Formulas That Work:**
- "Design a [product] that helps [audience] understand [concept]"
- "Create a [format] that solves [problem] using [approach]"
- "Develop a [solution] that bridges [time period] and [modern need]"

**Examples Building on Your Ideas:**
Given your Big Idea "${this.state.capturedData['ideation.bigIdea'] || ''}" and Essential Question "${this.state.capturedData['ideation.essentialQuestion'] || ''}":
- Design a museum exhibit that shows how [historical concept] shapes [modern life]
- Create a time-traveler's guide that helps [audience] navigate [concept]
- Develop a fusion project that combines [old] and [new] to solve [problem]

**Impact Research:**
Authentic challenges with real audiences motivate students to produce their best work and develop skills employers value most: creativity, collaboration, and communication.

What challenge would make your students feel like real ${this.wizardData?.subject || 'your subject'} practitioners?`,
      
      'JOURNEY_PHASES': `**Structuring the Learning Journey**

Learning phases create a scaffolded pathway from novice to expert. For ${this.wizardData?.ageGroup || 'your'} students, effective phase design:

**Research-Based Structure:**
1. **Hook & Explore** (25%): Spark curiosity, build background
2. **Investigate & Create** (50%): Deep dive, skill building
3. **Refine & Share** (25%): Polish work, celebrate learning

**Phase Characteristics for ${this.wizardData?.ageGroup || 'your'}:**
- Clear beginnings and endings
- Varied activities within each phase
- Celebration points between phases
- Increasing student autonomy

**Example Phase Names:**
- "Time Detectives" → "Innovation Lab" → "Future Showcase"
- "Question Quest" → "Design Studio" → "Impact Fair"
- "Wonder Phase" → "Build Phase" → "Share Phase"

**Pacing Considerations:**
- Attention spans: Plan for variety every 15-20 minutes
- Energy cycles: Active/reflective balance
- Assessment: Formative checks within each phase

**Success Metric:**
Well-designed phases reduce project abandonment by 75% and increase depth of learning.

How can we chunk your project into an exciting journey?`,
      
      'JOURNEY_ACTIVITIES': `**Designing Engaging Activities**

Activities bring your project to life! For ${this.wizardData?.ageGroup || 'your'} studying ${this.wizardData?.subject || 'your subject'}, effective practices include:

**High-Impact Activity Types:**
- **Hands-On Creation**: Making, building, designing
- **Collaborative Investigation**: Research teams, peer teaching
- **Digital Integration**: Using tools they love
- **Community Connection**: Expert interviews, field work
- **Choice & Voice**: Student-selected options

**Activity Design Principles:**
- Start concrete, move to abstract
- Include movement and manipulation
- Build in collaboration points
- Connect to their interests
- Celebrate small wins

**Examples for Your Project:**
Based on your phases, consider:
- Historical Instagram posts or TikToks
- Time-travel podcasts or vlogs
- Design challenges with constraints
- Community problem-solving sessions
- Gallery walks and peer feedback

**Engagement Research:**
Varied, hands-on activities help maintain student engagement and improve concept retention.

What activities would make students excited for ${this.wizardData?.subject || 'your subject'} class?`,
      
      'JOURNEY_RESOURCES': `**Curating Powerful Resources**

The right resources transform good projects into unforgettable experiences. For ${this.wizardData?.location || 'your location'}, consider:

**Resource Categories:**
- **Human Experts**: Local professionals, community elders
- **Digital Tools**: Age-appropriate platforms and apps
- **Physical Materials**: Hands-on supplies, maker materials
- **Media Resources**: Videos, podcasts, virtual tours
- **Community Spaces**: Local venues, outdoor locations

**Curation Principles:**
- Quality over quantity (3-5 key resources)
- Multiple perspectives represented
- Accessibility for all learners
- Connection to local context
- Student choice options

**Creative Resource Ideas:**
- Virtual mentors via video calls
- AR/VR experiences for time travel
- Local museum partnerships
- Student-created resource libraries
- Community expertise database

**Access Tip:**
Many organizations offer free educational resources when you explain your project's impact.

What resources would bring authenticity to your project?`,
      
      'DELIVER_MILESTONES': `**Creating Meaningful Milestones**

Milestones transform long projects into achievable victories. For ${this.wizardData?.ageGroup || 'your'}, effective milestones:

**Milestone Principles:**
- **Visible Progress**: Students see growth
- **Celebration Points**: Recognition built in
- **Formative Purpose**: Guide next steps
- **Student Ownership**: Self-assessment included

**Types of Milestones:**
- Process Checkpoints: "Research Complete"
- Product Drafts: "Prototype 1.0 Ready"
- Skill Demonstrations: "Presentation Rehearsal"
- Peer Reviews: "Feedback Exchange"

**Celebration Strategies:**
- Digital badges or certificates
- Gallery walks and peer recognition
- Progress walls or displays
- Parent/community showcases
- Social media spotlights

**Why This Matters:**
Projects with clear milestones help students maintain momentum and complete their work successfully.

What victories can we build into your journey?`,
      
      'DELIVER_RUBRIC': `**Developing Growth-Oriented Rubrics**

Your rubric transforms assessment from judgment to roadmap. For ${this.wizardData?.ageGroup || 'your'}, effective rubrics:

**Design Principles:**
- **Student-Friendly Language**: They understand expectations
- **Growth Mindset**: Focus on progress, not perfection
- **Multiple Dimensions**: Process and product valued
- **Clear Progression**: Obvious path to excellence

**Key Dimensions to Assess:**
- Content Mastery (${this.wizardData?.subject || 'your subject'} concepts)
- Creative Thinking (originality, innovation)
- Collaboration (teamwork, communication)
- Process Skills (research, iteration)
- Impact (audience engagement)

**Rubric Formats:**
- Single-Point: Clear target with feedback
- Analytic: Detailed criteria breakdown
- Holistic: Overall quality descriptors
- Student-Created: Co-designed criteria

**Pro Tip:**
Including students in rubric creation helps increase their buy-in and understanding of expectations.

How can we make assessment a tool for growth?`,
      
      'DELIVER_IMPACT': `**Planning for Authentic Impact**

Real audiences transform student work from assignments to contributions. In ${this.wizardData?.location || 'your location'}, consider:

**Audience Options:**
- **Peer Groups**: Other classes, schools
- **Community Members**: Local organizations
- **Digital Communities**: Online interest groups
- **Professional Networks**: Field experts
- **Family Showcases**: Parent celebrations

**Sharing Formats:**
- Exhibition Night: Gallery-style showcase
- Digital Portfolio: Online presence
- Community Event: Public presentation
- Solution Fair: Problem-solving expo
- Media Feature: Local news coverage

**Impact Amplifiers:**
- Student-led planning committees
- Professional presentation coaching
- Marketing and promotion skills
- Documentation for future classes
- Reflection on real feedback

**Impact of Authentic Audiences:**
When students know their work will be seen by real audiences, they typically invest more effort and develop stronger communication skills.

Who needs to see your students' amazing work?`
    };
    
    return stepContent[step.id] || this.getGenericTellMore();
  }
  
  private getGenericTellMore(): string {
    return `**Let's Explore This Further**

I'd be happy to tell you more about this part of the Active Learning Framework. We're currently working on ${this.state.stage.toLowerCase()} stage, which is all about ${
      this.state.stage === 'IDEATION' ? 'establishing the conceptual foundation' :
      this.state.stage === 'JOURNEY' ? 'designing the learning pathway' :
      'creating authentic assessments'
    } for your project.

Would you like me to explain more about the research behind this approach, share examples from other educators, or dive deeper into how this connects to your specific context in ${this.wizardData?.location || 'your location'}?`;
  }

  private generateHelpContent(step: any): string {
    console.log('❓ Help: Generating intelligent help content for step:', step?.id);
    // Use intelligent fallback for help content
    const helpContent = this.generateIntelligentHelpFallback(step);
    return sanitizeAIContent(helpContent);
  }
  
  private generateIntelligentHelpFallback(step: any): string {
    const helpMessages: Record<string, string> = {
      'Big Idea': `**Understanding Big Ideas in Learning Design**

A Big Idea serves as the conceptual foundation that unifies your entire learning experience. Based on constructivist learning theory, effective Big Ideas for ${this.wizardData?.ageGroup || 'your'} students should:

• Bridge academic content with authentic contexts in ${this.wizardData?.location || 'your location'}
• Reveal patterns or principles that transfer across domains
• Challenge assumptions while building on prior knowledge

**Framework principle:** Grant Wiggins and Jay McTighe's Understanding by Design emphasizes that Big Ideas should be "transferable" - applicable beyond the specific content to new situations.

Consider: What enduring understanding about ${this.wizardData?.subject || 'your subject'} will serve your students throughout their lives?

The Ideas feature provides research-backed suggestions tailored to your context.`,
      
      'Essential Question': `**Developing Essential Questions**

Essential Questions serve as the intellectual framework for sustained inquiry. According to educational researchers, effective Essential Questions for ${this.wizardData?.ageGroup || 'your'} learners:

• Require higher-order thinking (analysis, synthesis, evaluation)
• Connect disciplinary knowledge to authentic contexts
• Generate additional questions rather than definitive answers

**Pedagogical principle:** As Heidi Hayes Jacobs notes, Essential Questions should be "arguable" - promoting discussion and multiple perspectives rather than convergent thinking.

Reflect: What question about ${this.wizardData?.subject || 'your subject'} would sustain investigation across your entire unit?

The Ideas feature offers questions aligned with best practices in inquiry-based learning.`,
      
      'Challenge': `**Creating Authentic Challenges**

Authentic challenges transform abstract learning into concrete contribution. The Buck Institute's Gold Standard PBL framework suggests that effective challenges for ${this.wizardData?.ageGroup || 'your'} students:

• Address genuine needs within ${this.wizardData?.location || 'your location'} community
• Require application of ${this.wizardData?.subject || 'your subject'} concepts in novel contexts
• Result in products valued beyond classroom assessment

**Evidence-based principle:** Buck Institute's Gold Standard PBL emphasizes that authentic challenges should have "public products" - work shared with audiences who have genuine interest in the outcomes.

Consider: What challenge would position your students as knowledge creators rather than knowledge consumers?

The Ideas feature provides challenge formats proven effective in similar educational contexts.`,
      
      'Phases': `**Designing Learning Phases for ${this.wizardData?.ageGroup || 'your'}**

Effective project phases create a scaffolded journey that builds student capacity while maintaining engagement. Developmentally appropriate practices for ${this.wizardData?.ageGroup || 'your'} students include:

• Clear structure with predictable patterns
• Frequent opportunities to see and celebrate progress
• Balance between guided instruction and exploratory learning
• Variety in activities to match attention spans

**Best practice:** The Buck Institute recommends 3-4 distinct phases that move from "Building Knowledge" through "Developing Products" to "Presenting Publicly."

Consider: How can you chunk this project into manageable phases that gradually release responsibility to students?

The Ideas feature offers phase structures proven effective for this age group.`,
      
      'Activities': `**Creating Engaging Activities for ${this.wizardData?.ageGroup || 'your'}**

Activities are where learning comes alive! For ${this.wizardData?.ageGroup || 'your'} students in ${this.wizardData?.subject || 'your subject'}, effective activities typically:

• Incorporate movement and hands-on manipulation
• Allow for social interaction and collaboration
• Connect to students' interests and pop culture
• Provide choice within structured parameters
• Include game-like elements and friendly competition

**Developmental insight:** At this age, students learn best through concrete experiences before moving to abstract concepts.

Reflect: What activities would make students excited to come to ${this.wizardData?.subject || 'your subject'} class?

The Ideas feature suggests activities aligned with cognitive development research.`,
      
      'Resources': `**Selecting Resources for ${this.wizardData?.ageGroup || 'your'} Learners**

Quality resources scaffold success while maintaining appropriate challenge. For ${this.wizardData?.ageGroup || 'your'} students, effective resources should:

• Be visually rich and multimodal
• Offer multiple entry points for different learners
• Include both digital and physical materials
• Connect to local ${this.wizardData?.location || 'your location'} contexts when possible
• Support independent exploration within safe boundaries

**UDL Principle:** Provide multiple means of representation to ensure all learners can access content.

Consider: What mix of resources would support diverse learning styles in your classroom?

The Ideas feature recommends resources based on accessibility and engagement research.`,
      
      'Milestones': `**Setting Milestones for ${this.wizardData?.ageGroup || 'your'} Students**

Well-designed milestones maintain momentum and build confidence. For this age group, effective milestones should:

• Be frequent enough to maintain motivation (every 3-5 days)
• Include both individual and group achievements
• Be visible and celebrated publicly
• Connect clearly to the final challenge
• Allow for reflection and adjustment

**Motivation research:** Teresa Amabile's work shows that "small wins" are crucial for maintaining engagement in longer projects.

Think: What checkpoints would help students see their progress toward the ${this.state.capturedData['ideation.challenge'] || 'final challenge'}?

The Ideas feature suggests milestone structures that maintain engagement.`,
      
      'Rubric': `**Creating Student-Friendly Rubrics for ${this.wizardData?.ageGroup || 'your'}**

Effective rubrics for this age group make success criteria transparent and achievable. Best practices include:

• Using "I can" statements and student-friendly language
• Including visual indicators (symbols, colors)
• Balancing process and product assessment
• Recognizing effort and growth, not just achievement
• Co-creating criteria with students when possible

**Assessment principle:** Dylan Wiliam's work on formative assessment emphasizes the importance of students understanding success criteria.

Consider: How can you describe success in ways that ${this.wizardData?.ageGroup || 'your'} students will understand and embrace?

The Ideas feature provides rubric formats proven effective for this developmental stage.`,
      
      'Impact Plan': `**Planning Authentic Impact for ${this.wizardData?.ageGroup || 'your'}**

The impact plan transforms school work into real-world contribution. For ${this.wizardData?.ageGroup || 'your'} students, meaningful impact should:

• Connect to audiences they care about
• Be achievable within their sphere of influence
• Create lasting artifacts or changes
• Include celebration and recognition
• Build connections with ${this.wizardData?.location || 'your location'} community

**Engagement research:** When students know their work matters beyond grades, intrinsic motivation soars.

Imagine: How could your students' ${this.wizardData?.subject || 'your subject'} work make a real difference to someone?

The Ideas feature suggests impact strategies that create lasting memories and connections.`
    };
    
    return helpMessages[step?.label] || `💖 **Here to Help!**

You're making great progress! This step builds on everything you've created so far. Remember:

• Trust your instincts about what excites your ${this.wizardData?.ageGroup || 'your'} students
• Think about how ${this.wizardData?.subject || 'your subject'} connects to their world
• There's no "wrong" answer - just opportunities to refine

The Ideas and What-If buttons are always here when you need inspiration!`;
  }

  private async generateIdeas(): Promise<any[]> {
    console.log('Ideas: AI Mode:', this.useAIMode, 'Service Wrapper:', !!this.aiServiceWrapper, 'AI Manager:', !!this.aiManager);
    
    // Try service wrapper first for robust handling
    if (this.useAIMode && this.aiServiceWrapper) {
      const currentStep = this.getCurrentStep();
      const context = {
        messages: this.state.messages.slice(-5),
        userData: this.wizardData,
        capturedData: this.state.capturedData,
        currentPhase: this.state.phase,
        stage: this.state.stage,
        step: currentStep
      };
      
      const result = await this.aiServiceWrapper.generateIdeas(context);
      
      if (result.success && result.data) {
        console.log('Ideas: Service wrapper generation successful, got', result.data.length, 'ideas');
        return result.data;
      } else {
        console.log('Ideas: Service wrapper failed:', result.error);
      }
    }
    
    // Fallback to direct AI manager
    if (this.useAIMode && this.aiManager) {
      try {
        console.log('Ideas: Using AI Manager for generation');
        const currentStep = this.getCurrentStep();
        const prompt = await this.generateAIContent('ideas', {
          stage: this.state.stage,
          step: currentStep,
          userInput: 'generate contextual ideas'
        });
        
        // Parse structured response from AI
        const ideas = this.parseAIIdeas(prompt);
        if (ideas.length >= 3) {
          console.log('Ideas: AI generation successful, got', ideas.length, 'ideas');
          return ideas.slice(0, 4);
        }
      } catch (error) {
        console.error('❌ Ideas: AI Manager error:', error);
      }
    }
    
    // Fallback to legacy model if available
    if (this.model) {
      try {
        console.log('Ideas: Falling back to legacy AI model');
        const currentStep = this.getCurrentStep();
        const contextData = {
          subject: this.wizardData?.subject || 'your subject',
          ageGroup: this.wizardData?.ageGroup || 'your',
          location: this.wizardData?.location || 'your location',
          stage: this.state.stage,
          currentStep: currentStep?.label,
          previousSelections: this.state.capturedData
        };

        const prompt = this.buildIdeaPrompt(contextData, currentStep);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const ideas = this.parseAIIdeas(text);
        if (ideas.length >= 3) {
          console.log('Ideas: Legacy AI successful, got', ideas.length, 'ideas');
          return ideas.slice(0, 4);
        }
      } catch (error) {
        console.error('❌ Ideas: Legacy AI error:', error);
      }
    }

    // Final fallback to intelligent static generation
    console.log('Ideas: Using intelligent fallback generation');
    return this.generateIntelligentIdeasFallback();
  }

  private buildIdeaPrompt(context: any, step: any): string {
    // Get recent conversation context
    const recentMessages = this.state.messages.slice(-5).map(m => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    const basePrompt = `You are an expert curriculum designer helping an educator design a ${context.subject} project for ${context.ageGroup} students in ${context.location}.

Recent conversation context:
${recentMessages}

Current state: The educator is working on ${step?.label || 'project ideation'}.
${context.previousSelections['ideation.bigIdea'] ? `Selected Big Idea: "${context.previousSelections['ideation.bigIdea']}"` : ''}
${this.state.pendingValue ? `Currently considering: "${this.state.pendingValue}"` : ''}

`;
    
    let specificPrompt = '';
    
    switch (step?.id) {
      case 'IDEATION_BIG_IDEA':
        specificPrompt = `${this.state.pendingValue ? 
          `The educator is refining their Big Idea selection. They previously considered "${this.state.pendingValue}". Generate 4 alternative or enhanced Big Ideas that build on or improve upon this concept.` : 
          'Generate 4 Big Ideas that:'}
- Are relevant to ${context.subject} education
- Appropriate for ${context.ageGroup} students' developmental stage
- Connect to real-world contexts in ${context.location}
- Are transferable concepts that reveal deeper understanding
- Bridge disciplinary boundaries when possible

Format each idea as:
Title: [Concise 2-4 word title]
Description: [One sentence explaining how this connects to students' lives]`;
        break;
        
      case 'IDEATION_EQ':
        const bigIdea = context.previousSelections['ideation.bigIdea'];
        specificPrompt = `${this.state.pendingValue ? 
          `The educator is refining their Essential Question. They selected Big Idea "${bigIdea}" and are reconsidering the question "${this.state.pendingValue}". Generate 4 alternative or enhanced Essential Questions that better serve this Big Idea.` : 
          `Based on the Big Idea "${bigIdea}" for a ${context.subject} project, generate 4 Essential Questions that:`}
- Build directly on this Big Idea
- Are appropriate for ${context.ageGroup} students
- Resist simple answers and require investigation
- Connect abstract concepts to concrete experiences
- Begin with phrases like "To what extent...", "How might we...", "What is the relationship between...", or "Why do..."

Format each question as:
Title: [The complete essential question]
Description: [One sentence explaining what students will explore]`;
        break;
        
      case 'IDEATION_CHALLENGE':
        const eq = context.previousSelections['ideation.essentialQuestion'];
        const bi = context.previousSelections['ideation.bigIdea'];
        specificPrompt = `${this.state.pendingValue ? 
          `The educator is refining their Challenge selection. With Big Idea "${bi}" and Essential Question "${eq}", they're reconsidering "${this.state.pendingValue}". Generate 4 alternative or enhanced Challenges that better address this question.` : 
          `Based on the Big Idea "${bi}" and Essential Question "${eq}", generate 4 authentic challenges for ${context.ageGroup} students in ${context.subject} that:`}
- Address genuine problems within students' sphere of influence in ${context.location}
- Result in tangible products or measurable impact
- Apply ${context.subject} knowledge to real-world situations
- Are developmentally appropriate for this age group

Format each challenge as:
Title: [Action-oriented challenge statement]
Description: [One sentence about the real-world impact]`;
        break;
        
      case 'JOURNEY_PHASES':
        const challenge = context.previousSelections['ideation.challenge'];
        specificPrompt = `For the challenge "${challenge}", generate 4 different phase structures that:
- Build skills progressively for ${context.ageGroup} students
- Include clear transitions and milestones
- Balance guided learning with student autonomy
- Typically span 3-4 weeks total
- Are engaging and varied

Format each as:
Title: [Name of the phase structure approach]
Description: [Brief description of the phases: Phase 1, Phase 2, etc.]`;
        break;
        
      case 'JOURNEY_ACTIVITIES':
        const phases = context.previousSelections['journey.phases'];
        specificPrompt = `For the project phases "${phases}", generate 4 activity sets that:
- Are hands-on and interactive for ${context.ageGroup}
- Build ${context.subject} skills progressively
- Include variety (individual, partner, group work)
- Connect to ${context.location} resources
- Support diverse learning styles

Format each as:
Title: [Activity set theme]
Description: [List 3-4 specific activities]`;
        break;
        
      case 'JOURNEY_RESOURCES':
        const activities = context.previousSelections['journey.activities'];
        specificPrompt = `To support activities like "${activities}", generate 4 resource packages that:
- Are accessible for ${context.ageGroup} students
- Include both digital and physical materials
- Consider budget constraints
- Leverage ${context.location} community resources
- Support differentiated learning

Format each as:
Title: [Resource category]
Description: [List specific resources and tools]`;
        break;
        
      case 'DELIVER_MILESTONES':
        specificPrompt = `For ${context.ageGroup} students working toward "${context.previousSelections['ideation.challenge']}", generate 4 milestone frameworks that:
- Celebrate progress every 3-5 days
- Include both individual and team achievements
- Are visible and motivating
- Build toward the final challenge
- Include reflection opportunities

Format each as:
Title: [Milestone framework name]
Description: [List 4-5 specific milestones]`;
        break;
        
      case 'DELIVER_RUBRIC':
        specificPrompt = `For assessing "${context.previousSelections['ideation.challenge']}", generate 4 rubric frameworks that:
- Use student-friendly language for ${context.ageGroup}
- Balance process and product assessment
- Include creativity and collaboration
- Promote growth mindset
- Are clear and motivating

Format each as:
Title: [Rubric framework type]
Description: [List 4-5 assessment categories]`;
        break;
        
      case 'DELIVER_IMPACT':
        specificPrompt = `For sharing student work on "${context.previousSelections['ideation.challenge']}" in ${context.location}, generate 4 impact plans that:
- Connect to authentic audiences
- Create lasting value beyond grades
- Are feasible for ${context.ageGroup}
- Build community connections
- Celebrate student achievement

Format each as:
Title: [Impact plan name]
Description: [List key components and venues]`;
        break;
        
      default:
        specificPrompt = `Generate 4 relevant suggestions for ${context.currentStep} in a ${context.subject} project for ${context.ageGroup} students.`;
    }

    return `${basePrompt + specificPrompt  }\n\nRespond ONLY with the 4 ideas in the exact format specified. No additional text.`;
  }

  private parseAIIdeas(text: string): any[] {
    const ideas: any[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentIdea: any = null;
    
    for (const line of lines) {
      if (line.startsWith('Title:')) {
        if (currentIdea) {
          ideas.push(currentIdea);
        }
        currentIdea = {
          id: `idea-${Date.now()}-${ideas.length}`,
          title: line.replace('Title:', '').trim(),
          description: ''
        };
      } else if (line.startsWith('Description:') && currentIdea) {
        currentIdea.description = line.replace('Description:', '').trim();
      }
    }
    
    // Don't forget the last idea
    if (currentIdea && currentIdea.title) {
      ideas.push(currentIdea);
    }
    
    // If parsing failed, try a simpler approach
    if (ideas.length === 0) {
      const blocks = text.split(/\n\n+/);
      blocks.forEach((block, index) => {
        const titleMatch = block.match(/Title:\s*(.+)/i);
        const descMatch = block.match(/Description:\s*(.+)/i);
        if (titleMatch) {
          ideas.push({
            id: `idea-${Date.now()}-${index}`,
            title: titleMatch[1].trim(),
            description: descMatch ? descMatch[1].trim() : ''
          });
        }
      });
    }
    
    return ideas;
  }

  private generateFallbackIdeas(): any[] {
    const step = this.getCurrentStep();
    const subject = this.wizardData?.subject || 'your subject';
    const ageGroup = this.wizardData?.ageGroup || 'your';
    
    // Context-aware fallbacks based on subject and step
    const fallbacks: Record<string, any[]> = {
      'Physical Education': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'Movement as Expression', description: 'How our bodies communicate and create' },
          { id: '2', title: 'Teamwork and Leadership', description: 'Building community through collaborative play' },
          { id: '3', title: 'Healthy Habits for Life', description: 'Connecting physical activity to wellbeing' },
          { id: '4', title: 'Games Across Cultures', description: 'Exploring movement traditions worldwide' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'How does movement help us express ourselves?', description: 'Exploring the connection between body and emotion' },
          { id: '2', title: 'What makes a great team player?', description: 'Investigating collaboration and sportsmanship' },
          { id: '3', title: 'Why do different cultures play different games?', description: 'Understanding tradition through movement' },
          { id: '4', title: 'How can we design games that everyone can play?', description: 'Creating inclusive physical activities' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'Design an inclusive playground game', description: 'Create a game where everyone can participate and succeed' },
          { id: '2', title: 'Organize a mini-Olympics for younger students', description: 'Plan and run athletic events that build school community' },
          { id: '3', title: 'Create a fitness program for your family', description: 'Develop healthy movement routines for home' },
          { id: '4', title: 'Choreograph a movement story', description: 'Tell a tale through creative body movement' }
        ]
      },
      'Music': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'Music as Storytelling', description: 'How melodies and rhythms communicate narratives' },
          { id: '2', title: 'Cultural Voices', description: 'Exploring identity through musical traditions' },
          { id: '3', title: 'Sound and Emotion', description: 'Understanding how music shapes feelings' },
          { id: '4', title: 'Creating Community', description: 'Building connections through shared musical experiences' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'How does music tell stories without words?', description: 'Investigating narrative through sound' },
          { id: '2', title: 'What makes music meaningful across cultures?', description: 'Exploring universal elements of musical expression' },
          { id: '3', title: 'Why do certain sounds make us feel specific emotions?', description: 'Understanding the psychology of music' },
          { id: '4', title: 'How can we use music to bring people together?', description: 'Creating inclusive musical experiences' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'Compose a soundtrack for your community', description: 'Create music that captures local stories and voices' },
          { id: '2', title: 'Design an interactive music installation', description: 'Build a space where everyone can make music together' },
          { id: '3', title: 'Record an oral history through song', description: 'Preserve important stories using musical elements' },
          { id: '4', title: 'Organize a cross-cultural music exchange', description: 'Connect communities through shared musical learning' }
        ]
      },
      'Science': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'Patterns in Nature', description: 'Discovering recurring designs in the natural world' },
          { id: '2', title: 'Cause and Effect', description: 'Understanding how actions create reactions' },
          { id: '3', title: 'Systems Thinking', description: 'Exploring interconnected relationships' },
          { id: '4', title: 'Innovation for Good', description: 'Using science to solve real problems' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'How do patterns help us predict the future?', description: 'Investigating scientific patterns and predictions' },
          { id: '2', title: 'What happens when we change one part of a system?', description: 'Exploring interconnected relationships' },
          { id: '3', title: 'Why do living things adapt to their environment?', description: 'Understanding evolution and adaptation' },
          { id: '4', title: 'How can science help our community?', description: 'Applying scientific thinking locally' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'Design a solution for local environmental issues', description: 'Apply science to solve community problems' },
          { id: '2', title: 'Create a citizen science project', description: 'Engage your community in scientific discovery' },
          { id: '3', title: 'Build a model ecosystem', description: 'Demonstrate interconnected relationships' },
          { id: '4', title: 'Develop a health awareness campaign', description: 'Use science to promote wellbeing' }
        ]
      },
      'Art': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'Art as Voice', description: 'Expressing ideas and emotions through visual media' },
          { id: '2', title: 'Cultural Identity', description: 'Exploring heritage through artistic traditions' },
          { id: '3', title: 'Transformation', description: 'Changing materials and perspectives' },
          { id: '4', title: 'Public Space', description: 'Art that shapes community environments' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'How does art give voice to the voiceless?', description: 'Exploring art as social commentary' },
          { id: '2', title: 'What stories do materials tell?', description: 'Understanding meaning in artistic media' },
          { id: '3', title: 'Why does art change how we see the world?', description: 'Investigating perspective and perception' },
          { id: '4', title: 'How can art build community?', description: 'Creating shared experiences through art' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'Create a community mural project', description: 'Unite diverse voices through collaborative art' },
          { id: '2', title: 'Design an art installation from recycled materials', description: 'Transform waste into meaningful statements' },
          { id: '3', title: 'Document local stories through visual art', description: 'Preserve community history artistically' },
          { id: '4', title: 'Organize an inclusive art exhibition', description: 'Showcase diverse perspectives and abilities' }
        ]
      },
      // Default fallbacks if subject not found
      'default': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'Systems and Connections', description: 'How parts work together to create wholes' },
          { id: '2', title: 'Change Over Time', description: 'Understanding patterns of growth and transformation' },
          { id: '3', title: 'Community Impact', description: 'Making a difference in our local world' },
          { id: '4', title: 'Creative Problem Solving', description: 'Finding innovative solutions to challenges' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'How might we create positive change in our community?', description: 'Exploring student agency and impact' },
          { id: '2', title: 'What patterns connect our learning to the real world?', description: 'Discovering relevance and application' },
          { id: '3', title: 'To what extent do our choices shape our future?', description: 'Examining cause, effect, and responsibility' },
          { id: '4', title: 'Why do different perspectives lead to better solutions?', description: 'Understanding diversity and collaboration' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'Design a solution for a local problem', description: 'Students become community problem-solvers' },
          { id: '2', title: 'Create a resource that helps others learn', description: 'Students become teachers and mentors' },
          { id: '3', title: 'Document and share important stories', description: 'Students become historians and journalists' },
          { id: '4', title: 'Build something that makes life better', description: 'Students become inventors and designers' }
        ],
        'JOURNEY_PHASES': [
          { id: '1', title: 'Explore → Design → Create → Share', description: 'Classic creative process adapted for learning' },
          { id: '2', title: 'Question → Research → Build → Reflect', description: 'Inquiry-driven progression' },
          { id: '3', title: 'Connect → Investigate → Innovate → Celebrate', description: 'Community-centered approach' },
          { id: '4', title: 'Wonder → Plan → Do → Teach', description: 'Learning through teaching others' }
        ],
        'JOURNEY_ACTIVITIES': [
          { id: '1', title: 'Hands-On Investigations', description: 'Experiments, field studies, and maker activities' },
          { id: '2', title: 'Creative Expression', description: 'Art, media, performance, and design work' },
          { id: '3', title: 'Community Connections', description: 'Interviews, partnerships, and service learning' },
          { id: '4', title: 'Digital Creation', description: 'Technology-enhanced learning and production' }
        ],
        'JOURNEY_RESOURCES': [
          { id: '1', title: 'Essential Toolkit', description: 'Basic materials, tools, and equipment needed' },
          { id: '2', title: 'Digital Resources', description: 'Apps, websites, and online tools' },
          { id: '3', title: 'Community Partners', description: 'Local experts, organizations, and mentors' },
          { id: '4', title: 'Learning Library', description: 'Books, videos, and reference materials' }
        ],
        'DELIVER_MILESTONES': [
          { id: '1', title: 'Weekly Celebrations', description: 'Regular checkpoints with visible progress markers' },
          { id: '2', title: 'Skill Badges', description: 'Achievement system recognizing specific competencies' },
          { id: '3', title: 'Portfolio Pieces', description: 'Building a collection of best work' },
          { id: '4', title: 'Peer Reviews', description: 'Students assessing and celebrating each other' }
        ],
        'DELIVER_RUBRIC': [
          { id: '1', title: 'Growth-Focused Framework', description: 'Emphasizing progress and effort over perfection' },
          { id: '2', title: 'Competency Checklist', description: 'Clear "I can" statements for self-assessment' },
          { id: '3', title: 'Holistic Portfolio', description: 'Multiple ways to demonstrate learning' },
          { id: '4', title: 'Peer and Self Assessment', description: 'Students owning their evaluation process' }
        ],
        'DELIVER_IMPACT': [
          { id: '1', title: 'Community Showcase Night', description: 'Public exhibition celebrating student work' },
          { id: '2', title: 'Digital Portfolio Platform', description: 'Online space for sharing with wider audience' },
          { id: '3', title: 'Teaching Younger Students', description: 'Students as mentors and role models' },
          { id: '4', title: 'Real Implementation', description: 'Putting student solutions into practice' }
        ]
      }
    };
    
    const subjectFallbacks = fallbacks[subject] || fallbacks['default'];
    return subjectFallbacks[step?.id] || subjectFallbacks['IDEATION_BIG_IDEA'] || [];
  }

  private async generateWhatIfs(): Promise<any[]> {
    console.log('🔮 WhatIf: AI Mode:', this.useAIMode, 'Service Wrapper:', !!this.aiServiceWrapper, 'AI Manager:', !!this.aiManager);
    
    // Try service wrapper first for robust handling
    if (this.useAIMode && this.aiServiceWrapper) {
      const currentStep = this.getCurrentStep();
      const context = {
        messages: this.state.messages.slice(-5),
        userData: this.wizardData,
        capturedData: this.state.capturedData,
        currentPhase: this.state.phase,
        stage: this.state.stage,
        step: currentStep
      };
      
      const result = await this.aiServiceWrapper.generateWhatIfs(context);
      
      if (result.success && result.data) {
        console.log('WhatIf: Service wrapper generation successful, got', result.data.length, 'scenarios');
        return result.data;
      } else {
        console.log('WhatIf: Service wrapper failed:', result.error);
      }
    }
    
    // Fallback to direct AI manager
    if (this.useAIMode && this.aiManager) {
      try {
        console.log('🔮 WhatIf: Using AI Manager for generation');
        const currentStep = this.getCurrentStep();
        const prompt = await this.generateAIContent('whatif', {
          stage: this.state.stage,
          step: currentStep,
          userInput: 'generate transformative scenarios'
        });
        
        // Parse structured response from AI
        const whatIfs = this.parseAIIdeas(prompt);
        if (whatIfs.length >= 2) {
          console.log('WhatIf: AI generation successful, got', whatIfs.length, 'scenarios');
          return whatIfs.slice(0, 3);
        }
      } catch (error) {
        console.error('❌ WhatIf: AI Manager error:', error);
      }
    }
    
    // Fallback to legacy model if available
    if (this.model) {
      try {
        console.log('🔮 WhatIf: Falling back to legacy AI model');
        const currentStep = this.getCurrentStep();
        const contextData = {
          subject: this.wizardData?.subject || 'your subject',
          ageGroup: this.wizardData?.ageGroup || 'your',
          location: this.wizardData?.location || 'your location',
          stage: this.state.stage,
          currentStep: currentStep?.label,
          previousSelections: this.state.capturedData
        };

        const prompt = this.buildWhatIfPrompt(contextData, currentStep);
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const whatIfs = this.parseAIIdeas(text);
        if (whatIfs.length >= 2) {
          console.log('WhatIf: Legacy AI successful, got', whatIfs.length, 'scenarios');
          return whatIfs.slice(0, 3);
        }
      } catch (error) {
        console.error('❌ WhatIf: Legacy AI error:', error);
      }
    }

    // Final fallback to intelligent static generation
    console.log('🔮 WhatIf: Using intelligent fallback generation');
    return this.generateIntelligentWhatIfFallback();
  }

  private buildWhatIfPrompt(context: any, step: any): string {
    // Get recent conversation context
    const recentMessages = this.state.messages.slice(-5).map(m => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    const basePrompt = `You are an expert curriculum designer helping create transformative "What If" scenarios for a ${context.subject} project for ${context.ageGroup} students in ${context.location}.

Recent conversation context:
${recentMessages}

Current state: The educator is working on ${step?.label || 'project ideation'}.
${context.previousSelections['ideation.bigIdea'] ? `Selected Big Idea: "${context.previousSelections['ideation.bigIdea']}"` : ''}
${this.state.pendingValue ? `Currently considering: "${this.state.pendingValue}"` : ''}

`;
    
    let specificPrompt = '';
    
    switch (step?.id) {
      case 'IDEATION_BIG_IDEA':
        specificPrompt = `Generate 3 imaginative "What If" scenarios that:
- Push beyond traditional ${context.subject} education boundaries
- Are aspirational yet achievable for ${context.ageGroup} students
- Remove typical classroom constraints
- Inspire innovative thinking about ${context.subject}
- Connect to real-world applications

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the exciting possibility]`;
        break;
        
      case 'IDEATION_EQ':
        const bigIdea = context.previousSelections['ideation.bigIdea'];
        specificPrompt = `Based on the Big Idea "${bigIdea}", generate 3 "What If" scenarios for essential questions that:
- Transform how students might investigate this concept
- Challenge traditional ${context.subject} learning approaches
- Empower ${context.ageGroup} students as researchers/creators
- Connect to their world in ${context.location}

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the learning transformation]`;
        break;
        
      case 'IDEATION_CHALLENGE':
        const eq = context.previousSelections['ideation.essentialQuestion'];
        const bi = context.previousSelections['ideation.bigIdea'];
        specificPrompt = `Based on the Big Idea "${bi}" and Essential Question "${eq}", generate 3 "What If" scenarios for challenges that:
- Give students real power to create change
- Use ${context.subject} to solve authentic problems
- Connect to community needs in ${context.location}
- Are ambitious yet achievable for ${context.ageGroup}

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the real-world impact]`;
        break;
        
      case 'JOURNEY_PHASES':
        specificPrompt = `For ${context.ageGroup} students, generate 3 "What If" scenarios for revolutionary phase structures that:
- Break traditional timelines and sequences
- Give students more control over their learning path
- Connect to real-world project management
- Challenge typical classroom structures

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the learning transformation]`;
        break;
        
      case 'JOURNEY_ACTIVITIES':
        specificPrompt = `Generate 3 "What If" scenarios for transformative ${context.subject} activities that:
- Remove typical classroom constraints
- Connect students to professional practices
- Use ${context.location} as a living laboratory
- Empower ${context.ageGroup} students as creators

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the activity innovation]`;
        break;
        
      case 'JOURNEY_RESOURCES':
        specificPrompt = `Generate 3 "What If" scenarios for revolutionary resource approaches that:
- Reimagine what counts as educational materials
- Connect to cutting-edge ${context.subject} tools
- Leverage unexpected ${context.location} assets
- Put professional tools in student hands

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the resource transformation]`;
        break;
        
      case 'DELIVER_MILESTONES':
        specificPrompt = `Generate 3 "What If" scenarios for milestone celebrations that:
- Make progress visible beyond the classroom
- Connect to real-world achievement systems
- Empower ${context.ageGroup} students to define success
- Create lasting memories and artifacts

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the milestone innovation]`;
        break;
        
      case 'DELIVER_RUBRIC':
        specificPrompt = `Generate 3 "What If" scenarios for assessment approaches that:
- Replace traditional grading with authentic feedback
- Let ${context.ageGroup} students co-create criteria
- Connect to real-world evaluation methods
- Celebrate growth over perfection

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the assessment transformation]`;
        break;
        
      case 'DELIVER_IMPACT':
        specificPrompt = `Generate 3 "What If" scenarios for impact plans that:
- Give student work professional-level platforms
- Create lasting change in ${context.location}
- Connect to global audiences
- Transform ${context.ageGroup} students into thought leaders

Format each scenario as:
Title: What if [complete the transformative question]?
Description: [One sentence about the impact potential]`;
        break;
        
      default:
        specificPrompt = `Generate 3 transformative "What If" scenarios for ${context.currentStep} in a ${context.subject} project.`;
    }

    return `${basePrompt + specificPrompt  }\n\nRespond ONLY with the 3 scenarios in the exact format specified. No additional text.`;
  }

  private generateFallbackWhatIfs(): any[] {
    const step = this.getCurrentStep();
    const subject = this.wizardData?.subject || 'your subject';
    
    const fallbacks: Record<string, any[]> = {
      'Physical Education': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'What if PE class designed the school\'s wellness program?', description: 'Students become health leaders for the entire community' },
          { id: '2', title: 'What if movement was integrated into every subject?', description: 'Creating kinesthetic learning across the curriculum' },
          { id: '3', title: 'What if students invented their own Olympic sport?', description: 'From conception to competition, students create new games' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'What if we could measure joy in movement?', description: 'Exploring metrics beyond fitness and competition' },
          { id: '2', title: 'What if every student coached a sport?', description: 'Leadership development through teaching others' },
          { id: '3', title: 'What if PE connected to local community needs?', description: 'Using physical activity to solve real problems' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'What if students ran a community fitness festival?', description: 'Organizing events that promote healthy living for all ages' },
          { id: '2', title: 'What if the playground was reimagined by kids?', description: 'Designing and proposing inclusive play spaces' },
          { id: '3', title: 'What if movement could tell our community\'s story?', description: 'Creating performances that celebrate local culture' }
        ]
      },
      'default': {
        'IDEATION_BIG_IDEA': [
          { id: '1', title: 'What if students discovered their own Big Ideas?', description: 'Student-driven conceptual frameworks' },
          { id: '2', title: 'What if Big Ideas came from community needs?', description: 'Real problems driving deep learning' },
          { id: '3', title: 'What if every subject connected to one Big Idea?', description: 'Transdisciplinary learning experiences' }
        ],
        'IDEATION_EQ': [
          { id: '1', title: 'What if students wrote questions for real researchers?', description: 'Connecting to professional inquiry' },
          { id: '2', title: 'What if questions evolved throughout the project?', description: 'Dynamic inquiry that deepens over time' },
          { id: '3', title: 'What if the community helped shape the questions?', description: 'Collaborative inquiry design' }
        ],
        'IDEATION_CHALLENGE': [
          { id: '1', title: 'What if student solutions were actually implemented?', description: 'Real change from student work' },
          { id: '2', title: 'What if challenges came from student passions?', description: 'Interest-driven problem solving' },
          { id: '3', title: 'What if students worked on city/state initiatives?', description: 'Contributing to official projects' }
        ],
        'JOURNEY_PHASES': [
          { id: '1', title: 'What if students designed their own timelines?', description: 'Self-paced, personalized progressions' },
          { id: '2', title: 'What if phases happened simultaneously?', description: 'Non-linear, networked learning' },
          { id: '3', title: 'What if the community set the phases?', description: 'Real-world project management' }
        ],
        'JOURNEY_ACTIVITIES': [
          { id: '1', title: 'What if students learned from professionals?', description: 'Apprenticeship-style activities' },
          { id: '2', title: 'What if activities happened in real workplaces?', description: 'Learning in authentic contexts' },
          { id: '3', title: 'What if students designed activities for each other?', description: 'Peer-created learning experiences' }
        ],
        'JOURNEY_RESOURCES': [
          { id: '1', title: 'What if students had professional-grade tools?', description: 'Access to industry-standard resources' },
          { id: '2', title: 'What if the whole community was a resource?', description: 'City-wide learning network' },
          { id: '3', title: 'What if students created resources for future classes?', description: 'Building a learning legacy' }
        ],
        'DELIVER_MILESTONES': [
          { id: '1', title: 'What if milestones were public celebrations?', description: 'Community-witnessed progress' },
          { id: '2', title: 'What if students set their own milestones?', description: 'Self-directed goal setting' },
          { id: '3', title: 'What if milestones connected to real achievements?', description: 'Industry certifications or recognitions' }
        ],
        'DELIVER_RUBRIC': [
          { id: '1', title: 'What if professionals evaluated student work?', description: 'Real-world expert assessment' },
          { id: '2', title: 'What if there were no grades, only feedback?', description: 'Growth-focused evaluation' },
          { id: '3', title: 'What if students evaluated themselves?', description: 'Complete ownership of assessment' }
        ],
        'DELIVER_IMPACT': [
          { id: '1', title: 'What if student work was published professionally?', description: 'Real platforms for student voice' },
          { id: '2', title: 'What if presentations happened at professional venues?', description: 'Conference-style student presentations' },
          { id: '3', title: 'What if student work influenced policy?', description: 'Direct impact on decision-making' }
        ]
      }
    };
    
    const subjectFallbacks = fallbacks[subject] || fallbacks['default'];
    if (typeof subjectFallbacks === 'object' && step?.id && subjectFallbacks[step.id]) {
      return subjectFallbacks[step.id];
    }
    // Return default for the specific step if available
    if (step?.id && fallbacks['default'][step.id]) {
      return fallbacks['default'][step.id];
    }
    // Final fallback
    return [
      { id: '1', title: 'What if we reimagined this completely?', description: 'Breaking all traditional boundaries' },
      { id: '2', title: 'What if students led this entire process?', description: 'Complete student ownership' },
      { id: '3', title: 'What if this connected to global initiatives?', description: 'Thinking beyond local impact' }
    ];
  }

  // Remove ALL the massive fallback methods - AI should be working!
  private generateIntelligentTellMore(): string {
    return 'AI service temporarily unavailable. Please refresh the page.';
  }

  private supplementIdeasWithFallback(existingIdeas: any[], targetCount: number): any[] {
    const currentStep = this.getCurrentStep();
    const subject = this.wizardData?.subject || 'your subject';
    const ageGroup = this.wizardData?.ageGroup || 'your students';
    
    // Context-aware fallback ideas based on current step
    const fallbackIdeas = this.getContextualFallbackIdeas(currentStep, subject, ageGroup);
    
    // Add fallback ideas until we reach target count
    const result = [...existingIdeas];
    let fallbackIndex = 0;
    
    while (result.length < targetCount && fallbackIndex < fallbackIdeas.length) {
      // Check if this fallback idea is too similar to existing ones
      const fallbackIdea = fallbackIdeas[fallbackIndex];
      const isDuplicate = result.some(idea => 
        idea.title.toLowerCase().includes(fallbackIdea.title.toLowerCase().substring(0, 10))
      );
      
      if (!isDuplicate) {
        result.push({
          ...fallbackIdea,
          id: `fallback-${Date.now()}-${fallbackIndex}`
        });
      }
      fallbackIndex++;
    }
    
    return result;
  }
  
  private getContextualFallbackIdeas(step: any, subject: string, ageGroup: string): any[] {
    // Smart fallback generation based on context
    const stepType = step?.id || 'default';
    
    switch(stepType) {
      case 'IDEATION_BIG_IDEA':
        return [
          { title: `${subject} in Daily Life`, description: `How ${subject} shapes our everyday experiences` },
          { title: 'Cause and Effect', description: `Understanding relationships in ${subject}` },
          { title: 'Systems and Connections', description: `How ${subject} elements work together` }
        ];
      case 'IDEATION_EQ':
        return [
          { title: `How might we use ${subject} to improve our community?`, description: 'Local impact focus' },
          { title: `What makes ${subject} relevant to ${ageGroup}?`, description: 'Personal connection' },
          { title: `Why does ${subject} matter in today's world?`, description: 'Global perspective' }
        ];
      case 'IDEATION_CHALLENGE':
        return [
          { title: `Design a ${subject} solution for your school`, description: 'School-based project' },
          { title: `Create a ${subject} resource for the community`, description: 'Community service' },
          { title: `Solve a real problem using ${subject}`, description: 'Problem-based learning' }
        ];
      default:
        return [
          { title: 'Explore Further', description: 'Dive deeper into this concept' },
          { title: 'Connect Ideas', description: 'Link to previous learning' },
          { title: 'Apply Knowledge', description: 'Put learning into practice' }
        ];
    }
  }
  
  private generateIntelligentIdeasFallback(): any[] {
    const currentStep = this.getCurrentStep();
    const subject = this.wizardData?.subject || 'your subject';
    const ageGroup = this.wizardData?.ageGroup || 'your students';
    
    return this.getContextualFallbackIdeas(currentStep, subject, ageGroup)
      .slice(0, 4)
      .map((idea, idx) => ({
        ...idea,
        id: `fallback-${Date.now()}-${idx}`
      }));
  }

  private generateIntelligentWhatIfFallback(): any[] {
    return [
      { id: '1', title: 'What if... AI was working?', description: 'Please refresh the page' }
    ];
  }

  // Data persistence with error handling
  private saveData(): void {
    try {
      const key = `journey-v5-${this.blueprintId}`;
      const data = JSON.stringify(this.state.capturedData);
      
      // Check storage quota
      if (this.isStorageQuotaExceeded(data)) {
        console.warn('Storage quota exceeded, attempting cleanup');
        this.cleanupOldData();
      }
      
      localStorage.setItem(key, data);
      
      // Also save a backup in session storage
      sessionStorage.setItem(`${key}-backup`, data);
    } catch (error) {
      console.error('Failed to save data:', error);
      this.emit('saveError', { error, data: this.state.capturedData });
    }
  }

  private loadSavedData(): Record<string, any> {
    try {
      const key = `journey-v5-${this.blueprintId}`;
      
      // Try localStorage first
      let saved = localStorage.getItem(key);
      
      // Fallback to session storage backup
      if (!saved) {
        saved = sessionStorage.getItem(`${key}-backup`);
        if (saved) {
          console.log('Restored data from session backup');
        }
      }
      
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load saved data:', error);
      return {};
    }
  }
  
  // State validation methods
  private isValidStateTransition(action: string): boolean {
    // Special case: ALWAYS allow help and card_select - CHECK THIS FIRST!
    if (action === 'help' || action === 'card_select') {
      console.log('🚨 SPECIAL CASE HIT: Allowing', action);
      return true;
    }
    
    const validTransitions: Record<string, string[]> = {
      'welcome': ['start'],
      'stage_init': ['start', 'tellmore', 'card_select'],
      'step_entry': ['text', 'ideas', 'whatif', 'help', 'card_select'],
      'step_confirm': ['continue', 'refine', 'help'],
      'stage_clarify': ['proceed', 'edit'],
      'complete': []
    };
    
    // CRITICAL DEBUG: Verify we're running the latest code
    console.log('🚨 VALIDATION CHECK v4:', {
      action,
      currentPhase: this.state.phase,
      validActionsForPhase: validTransitions[this.state.phase] || [],
      codeVersion: 'v4-special-case-at-top'
    });
    
    const allowedActions = validTransitions[this.state.phase] || [];
    
    return allowedActions.includes(action);
  }
  
  // Error handling and recovery
  private async handleError(error: Error, context: string): Promise<void> {
    console.error(`Error in ${context}:`, error);
    this.errorCount++;
    
    // Check for consecutive errors
    if (this.errorCount >= this.maxConsecutiveErrors) {
      await this.enterRecoveryMode();
      return;
    }
    
    // Determine error type and recovery strategy
    if (error.message.includes('network') || error.message.includes('fetch')) {
      await this.handleNetworkError(error, context);
    } else if (error.message.includes('AI') || error.message.includes('generation')) {
      await this.handleAIError(error, context);
    } else if (error.message.includes('state')) {
      await this.handleStateError(error, context);
    } else {
      await this.handleGenericError(error, context);
    }
  }
  
  private async handleNetworkError(error: Error, context: string): Promise<void> {
    const retryCount = this.retryAttempts.get(context) || 0;
    
    if (retryCount < 3) {
      this.retryAttempts.set(context, retryCount + 1);
      
      const retryMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: 'Connection issue detected. Retrying...',
        timestamp: new Date()
      };
      this.state.messages.push(retryMessage);
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the action
      // Note: In production, you'd need to store and retry the specific action
    } else {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I'm having trouble connecting right now. Your work is saved locally. Please check your internet connection and try again. If the problem persists, you can continue working offline with reduced features.`,
        timestamp: new Date()
      };
      this.state.messages.push(errorMessage);
      
      // Enable offline mode
      this.enterOfflineMode();
    }
  }
  
  private async handleAIError(error: Error, context: string): Promise<void> {
    console.warn('AI generation failed, using fallback');
    
    const fallbackMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: this.generateContextualFallback(context),
      timestamp: new Date()
    };
    
    this.state.messages.push(fallbackMessage);
    this.errorCount = Math.max(0, this.errorCount - 1); // Don't count AI errors as heavily
  }
  
  private async handleStateError(error: Error, context: string): Promise<void> {
    console.error('State consistency error detected');
    
    const recoveryMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `I noticed an issue with our conversation flow. Let me help you get back on track. What were you working on?`,
      timestamp: new Date()
    };
    
    this.state.messages.push(recoveryMessage);
    
    // Reset to safe state
    this.resetToSafeState();
  }
  
  private async handleGenericError(error: Error, context: string): Promise<void> {
    const errorMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `I encountered an unexpected issue. Don't worry - your work is saved. Let's continue where we left off. What would you like to do next?`,
      timestamp: new Date()
    };
    
    this.state.messages.push(errorMessage);
  }
  
  private async enterRecoveryMode(): Promise<void> {
    console.warn('Entering recovery mode after multiple errors');
    
    this.state.isProcessing = false;
    this.errorCount = 0;
    
    const recoveryMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `I've detected multiple issues and have entered recovery mode. Your work is safe. Here's what you've completed so far:\n\n${this.generateProgressSummary()}\n\nWould you like to continue from where we left off, or would you prefer to take a different approach?`,
      timestamp: new Date()
    };
    
    this.state.messages.push(recoveryMessage);
    
    // Simplified quick replies for recovery
    this.state.phase = 'step_entry'; // Safe state that accepts text input
  }
  
  private enterOfflineMode(): void {
    console.log('Entering offline mode');
    this.useAIMode = false;
    console.log('🔴 Offline mode activated - AI features temporarily disabled');
    this.emit('offlineModeActivated');
  }
  
  private resetToSafeState(): void {
    // Find the last confirmed step
    const lastConfirmedStep = Object.keys(this.state.capturedData).length;
    
    if (lastConfirmedStep > 0) {
      // Reset to entry phase of next step
      this.state.phase = 'step_entry';
      this.state.pendingValue = null;
    } else {
      // Reset to beginning
      this.state.phase = 'stage_init';
    }
    
    this.state.isProcessing = false;
  }
  
  private generateProgressSummary(): string {
    const captured = Object.entries(this.state.capturedData);
    
    if (captured.length === 0) {
      return "You haven't completed any steps yet.";
    }
    
    let summary = "**Your Progress:**\n\n";
    
    captured.forEach(([key, value]) => {
      const label = key.split('.').pop() || key;
      summary += `• **${this.capitalizeFirst(label)}:** ${value}\n`;
    });
    
    return summary;
  }
  
  private generateContextualFallback(context: string): string {
    const step = this.getCurrentStep();
    const stage = this.state.stage;
    
    const fallbacks: Record<string, string> = {
      'stage_init': `Let's begin working on the ${stage} stage. This is where we'll ${
        stage === 'IDEATION' ? 'establish your core concepts' :
        stage === 'JOURNEY' ? 'design the learning experience' :
        'define success metrics'
      }.`,
      'step_entry': `Now let's work on ${step?.label || 'this element'}. What ideas do you have?`,
      'confirm': `Thank you for sharing that. Would you like to continue with this selection or refine it further?`,
      default: `Let's continue building your learning experience. What would you like to work on next?`
    };
    
    return fallbacks[context] || fallbacks.default;
  }
  
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  private getWelcomeFallback(): string {
    return `Welcome! I'm ALF Coach, and I'm excited to work with you on creating an engaging learning experience for your students.

Together, we'll design a project that brings your subject to life through hands-on exploration and real-world connections. I'll be here to support you every step of the way!

We'll work through three stages:

**Ideation** - We'll explore ideas that connect to your students' interests and spark their curiosity

**Journey** - We'll map out a learning path that builds skills step-by-step while keeping students engaged

**Deliverables** - We'll create meaningful ways for students to show what they've learned through real-world projects

Ready to start creating something amazing for your classroom? Let's begin!`;
  }

  private getFrameworkOverviewFallback(): string {
    return `Welcome, ${this.wizardData?.educatorName || 'Educator'}!

I'm your ALF Coach, here to guide you through creating an authentic learning experience for your ${this.wizardData?.ageGroup || 'students'} using the Active Learning Framework (ALF).

Together, we'll develop:
• A meaningful Big Idea that resonates with your learners
• An Essential Question that drives inquiry
• An authentic Challenge that engages and empowers

This journey typically takes 15-20 minutes. Ready to transform your ${this.wizardData?.subject || 'classroom'} into a space of innovation and discovery?`;
  }
  
  private isStorageQuotaExceeded(data: string): boolean {
    try {
      // Test write to check quota
      const testKey = '__quota_test__';
      localStorage.setItem(testKey, data);
      localStorage.removeItem(testKey);
      return false;
    } catch (e) {
      return true;
    }
  }
  
  private cleanupOldData(): void {
    try {
      const keys = Object.keys(localStorage);
      const journeyKeys = keys.filter(k => k.startsWith('journey-'));
      
      // Remove oldest entries (keep last 5)
      if (journeyKeys.length > 5) {
        journeyKeys
          .sort()
          .slice(0, journeyKeys.length - 5)
          .forEach(key => { localStorage.removeItem(key); });
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }
}

// Factory function
export function createChatService(wizardData: any, blueprintId: string): ChatService {
  return new ChatService(wizardData, blueprintId);
}