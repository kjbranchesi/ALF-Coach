// ChatService - Single source of truth for chat state management
// Following SOP v1.0 strictly

import { EventEmitter } from '../utils/event-emitter';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIConversationManager, createAIConversationManager } from './ai-conversation-manager';
import { SOPValidator, createSOPValidator } from './sop-validator';
import { ContextManager, createContextManager } from './context-manager';
import { RateLimiter, createDebouncer } from '../utils/rate-limiter';
import { InputValidator } from '../utils/input-validator';

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
  private sopValidator: SOPValidator;
  private contextManager: ContextManager;
  private useAIMode: boolean = false;
  
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
    console.log('🚀 ChatService Constructor Started', {
      wizardData,
      blueprintId,
      timestamp: new Date().toISOString()
    });
    
    // Initialize AI components
    this.sopValidator = createSOPValidator();
    this.contextManager = createContextManager();
    console.log('✅ AI Components initialized', {
      sopValidator: !!this.sopValidator,
      contextManager: !!this.contextManager
    });
    
    // Initialize robustness components
    this.rateLimiter = new RateLimiter(60000, 30, 500);
    
    // Check if AI mode is enabled
    this.useAIMode = import.meta.env.VITE_USE_AI_CHAT === 'true';
    
    // Initialize Gemini AI
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔧 Environment Configuration:', {
      apiKeyAvailable: !!apiKey,
      apiKeyLength: apiKey?.length,
      environment: import.meta.env.MODE,
      aiMode: this.useAIMode ? 'ENABLED' : 'DISABLED',
      viteEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    });
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        // Initialize AI Manager for conversation if AI mode is enabled
        if (this.useAIMode) {
          this.aiManager = createAIConversationManager(apiKey);
          if (this.aiManager) {
            console.log('✓ AI Conversation Manager initialized');
          }
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

    console.log('📊 Initial State:', {
      stage: this.state.stage,
      stepIndex: this.state.stepIndex,
      phase: this.state.phase,
      savedDataKeys: Object.keys(savedData),
      completedSteps: this.state.completedSteps
    });

    // Add initial welcome message
    // Use setTimeout to ensure async method completes
    setTimeout(() => {
      console.log('🎯 Adding welcome message');
      this.addWelcomeMessage();
    }, 0);
  }

  // Public methods
  public getState(): ChatState {
    return { ...this.state };
  }

  public getQuickReplies(): QuickReply[] {
    const { phase, stage, stepIndex, waitingForInput, showConfirmation } = this.state;

    console.log('🎮 Getting Quick Replies for:', {
      phase,
      stage,
      stepIndex,
      waitingForInput,
      showConfirmation,
      pendingValue: !!this.state.pendingValue,
      isProcessing: this.state.isProcessing,
      timestamp: new Date().toISOString()
    });

    // Welcome phase - show start button
    if (phase === 'welcome') {
      const replies = [
        { id: 'start', label: "Okay let's begin", action: 'start', variant: 'primary' as const }
      ];
      console.log('✨ Welcome phase replies:', replies);
      return replies;
    }

    // Stage init - show start button for that stage
    if (phase === 'stage_init') {
      const replies = [
        { id: 'start', label: "Let's Begin", action: 'start', icon: 'Rocket', variant: 'primary' as const },
        { id: 'tellmore', label: 'Tell Me More', action: 'tellmore', icon: 'Info', variant: 'secondary' as const }
      ];
      console.log('✨ Stage init replies:', replies);
      return replies;
    }

    // Confirmation phase - Continue/Refine/Help
    if (phase === 'step_confirm' || showConfirmation) {
      const replies = [
        { id: 'continue', label: 'Continue', action: 'continue', icon: 'Check', variant: 'primary' as const },
        { id: 'refine', label: 'Refine', action: 'refine', icon: 'Edit', variant: 'secondary' as const },
        { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' as const }
      ];
      console.log('✨ Confirmation phase replies:', replies);
      return replies;
    }

    // Entry phase - Ideas/What-If/Help
    if (phase === 'step_entry' || waitingForInput) {
      const replies = [
        { id: 'ideas', label: 'Ideas', action: 'ideas', icon: 'Lightbulb', variant: 'suggestion' as const },
        { id: 'whatif', label: 'What-If', action: 'whatif', icon: 'RefreshCw', variant: 'suggestion' as const },
        { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' as const }
      ];
      console.log('✨ Entry phase replies:', replies);
      return replies;
    }

    // Stage clarify - edit or proceed
    if (phase === 'stage_clarify') {
      const replies = [
        { id: 'proceed', label: 'Proceed', action: 'proceed', icon: 'ArrowRight', variant: 'primary' as const },
        { id: 'edit', label: 'Edit', action: 'edit', icon: 'Edit', variant: 'secondary' as const }
      ];
      console.log('✨ Stage clarify replies:', replies);
      return replies;
    }

    console.log('⚠️ No quick replies for current state');
    return [];
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
    if (this.isProcessingQueue || this.actionQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.actionQueue.length > 0) {
      const item = this.actionQueue.shift();
      if (!item) continue;
      
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
      console.log('⚠️ Already processing, re-queuing action:', action);
      this.actionQueue.unshift({ action, data, timestamp: Date.now() });
      return;
    }
    
    this.state.isProcessing = true;
    this.emit('stateChange', this.getState());
    
    const actionId = `${action}-${Date.now()}`;
    console.log('🔄 Processing Action:', {
      actionId,
      action,
      data,
      currentState: {
        stage: this.state.stage,
        stepIndex: this.state.stepIndex,
        phase: this.state.phase,
        pendingValue: this.state.pendingValue,
        capturedDataKeys: Object.keys(this.state.capturedData)
      },
      timestamp: new Date().toISOString()
    });

    try {
      // Validate state transition
      if (!this.isValidStateTransition(action)) {
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
  private async addWelcomeMessage(): Promise<void> {
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('welcome', {});
    } else {
      content = `Welcome! I'm ALF Coach, your expert partner in designing transformative learning experiences. Drawing from decades of educational research and best practices, I'll guide you through creating a project that will deeply engage your students.

Our structured approach follows three research-backed stages:

**Ideation** - We'll identify a resonant concept that connects to your students' lived experiences and natural curiosity

**Journey** - We'll architect a learning progression that builds skills systematically while maintaining high engagement

**Deliverables** - We'll design authentic assessments where students demonstrate mastery through real-world application

I'm here to provide expert guidance tailored to your specific context. Shall we begin transforming your vision into reality?`;
    }
    
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
    }
  }

  private async handleStart(): Promise<void> {
    console.log('🚀 handleStart called', {
      currentPhase: this.state.phase,
      currentStage: this.state.stage,
      currentStepIndex: this.state.stepIndex
    });

    if (this.state.phase === 'welcome') {
      // Move to ideation stage init
      console.log('📍 Transitioning from welcome to stage_init');
      this.state.phase = 'stage_init';
      await this.addStageInitMessage('IDEATION');
    } else if (this.state.phase === 'stage_init') {
      // Start first step of current stage
      console.log('📍 Starting first step of stage:', this.state.stage);
      this.state.stepIndex = 0;
      this.state.phase = 'step_entry';
      await this.addStepEntryMessage();
    }

    console.log('✅ handleStart completed', {
      newPhase: this.state.phase,
      newStepIndex: this.state.stepIndex
    });
  }

  private async handleContinue(): Promise<void> {
    console.log('▶️ handleContinue called', {
      phase: this.state.phase,
      pendingValue: this.state.pendingValue,
      currentStep: this.getCurrentStep()
    });

    if (this.state.phase === 'step_confirm' && this.state.pendingValue) {
      // Save the value
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        console.log('💾 Saving captured data:', {
          key: currentStep.key,
          value: this.state.pendingValue,
          stepLabel: currentStep.label
        });
        
        this.state.capturedData[currentStep.key] = this.state.pendingValue;
        this.state.completedSteps++;
        this.saveData();
        
        console.log('📊 Progress update:', {
          completedSteps: this.state.completedSteps,
          totalSteps: this.state.totalSteps,
          percentComplete: (this.state.completedSteps / this.state.totalSteps * 100).toFixed(1) + '%'
        });
      }
      
      // Clear confirmation state
      this.state.showConfirmation = false;
      this.state.pendingValue = null;
      
      // Move to next step or stage
      await this.advanceToNext();
    } else {
      console.log('⚠️ handleContinue conditions not met:', {
        phase: this.state.phase,
        hasPendingValue: !!this.state.pendingValue
      });
    }
  }

  private async handleRefine(): Promise<void> {
    const currentStep = this.getCurrentStep();
    const currentValue = this.state.pendingValue;
    
    // Reset to entry phase to allow new input
    this.state.phase = 'step_entry';
    this.state.showConfirmation = false;
    this.state.waitingForInput = true;
    
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
    }
  }

  private async handleHelp(): Promise<void> {
    const currentStep = this.getCurrentStep();
    let content: string;
    
    // If we're in confirm phase, ensure user can still interact
    if (this.state.phase === 'step_confirm') {
      // Keep the confirm buttons available
    } else if (this.state.phase === 'step_entry') {
      // Keep the entry buttons available
      this.state.waitingForInput = true;
    }
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('help', { step: currentStep });
    } else {
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
    }
  }

  private async handleIdeas(): Promise<void> {
    // Ensure we're in the right state to show ideas
    if (this.state.phase === 'step_confirm') {
      // If in confirm phase, reset to entry to allow new selection
      this.state.phase = 'step_entry';
      this.state.showConfirmation = false;
      this.state.waitingForInput = true;
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
      this.state.waitingForInput = true;
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
      if (this.useAIMode) {
        this.contextManager.addMessage(errorMessage);
      }
    }
  }

  private async handleWhatIf(): Promise<void> {
    // Ensure we're in the right state to show what-ifs
    if (this.state.phase === 'step_confirm') {
      // If in confirm phase, reset to entry to allow new selection
      this.state.phase = 'step_entry';
      this.state.showConfirmation = false;
      this.state.waitingForInput = true;
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
      this.state.waitingForInput = true;
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
      if (this.useAIMode) {
        this.contextManager.addMessage(errorMessage);
      }
    }
  }

  private async handleTellMore(): Promise<void> {
    const content = this.getTellMoreContent();
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
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
      console.log('⚠️ Empty text input, ignoring');
      return;
    }
    
    // Validate and sanitize input
    const validation = InputValidator.validateAndSanitize(text);
    console.log('🔍 Input validation result:', {
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
    if (this.useAIMode) {
      this.contextManager.addMessage(userMessage);
      this.aiManager?.updateContext(userMessage);
    }
    
    // Process based on phase
    if (this.state.phase === 'step_entry' || this.state.waitingForInput) {
      this.state.pendingValue = text;
      this.state.phase = 'step_confirm';
      this.state.showConfirmation = true;
      this.state.waitingForInput = false;
      await this.addConfirmationMessage(text);
    } else if (this.state.phase === 'step_confirm') {
      // Handle additional input during confirmation phase - update the pending value
      this.state.pendingValue = text;
      // Reset phase to ensure proper state
      this.state.phase = 'step_confirm';
      this.state.showConfirmation = true;
      await this.addConfirmationMessage(text);
    }
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
    console.log('⏭️ advanceToNext called', {
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
      this.state.showConfirmation = false;
      this.state.waitingForInput = true;
      
      console.log('📍 Moving to next step in stage:', {
        newStepIndex: this.state.stepIndex,
        stepId: stageConfig.steps[this.state.stepIndex].id,
        stepLabel: stageConfig.steps[this.state.stepIndex].label
      });
      
      await this.addStepEntryMessage();
    } else {
      // Stage complete
      console.log('🎉 Stage complete! Moving to clarify phase');
      this.state.phase = 'stage_clarify';
      this.state.showConfirmation = false;
      this.state.waitingForInput = false;
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
    }
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
    }
  }

  private async addConfirmationMessage(value: string): Promise<void> {
    const step = this.getCurrentStep();
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
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
      content = this.generateIntelligentFallback(step, value);
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
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
    if (this.useAIMode) {
      this.contextManager.addMessage(message);
      this.aiManager?.updateContext(message);
    }
  }

  private async addCompleteMessage(): Promise<void> {
    let content: string;
    
    if (this.useAIMode && this.aiManager) {
      content = await this.generateAIContent('complete', {});
    } else {
      content = `**Congratulations!** You've successfully designed a comprehensive learning blueprint.

Through thoughtful planning and pedagogical expertise, you've created an experience that aligns with best practices in project-based learning. Your blueprint integrates authentic challenges, systematic skill development, and meaningful assessment.

This framework will empower your students to engage deeply with content while developing critical 21st-century competencies.

Would you like to review your complete blueprint and explore implementation options?`;
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
    console.log('🤖 generateAIContent called', {
      action,
      params,
      hasAIManager: !!this.aiManager,
      useAIMode: this.useAIMode,
      timestamp: new Date().toISOString()
    });

    if (!this.aiManager) {
      console.log('⚠️ AI Manager not available, using fallback');
      // Use enhanced fallback if AI is not available
      return this.generateEnhancedFallback(action, params);
    }
    
    // Get context from context manager
    const relevantContext = this.contextManager.getRelevantContext(action, this.state.stage);
    console.log('📝 AI Context retrieved:', {
      messageCount: relevantContext.messages.length,
      capturedDataKeys: Object.keys(relevantContext.capturedData),
      summaryKeyPoints: relevantContext.summary.keyPoints
    });
    
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
      return this.generateEnhancedFallback(action, params);
    }
  }
  
  // Enhanced fallback when AI is not available
  private generateEnhancedFallback(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): string {
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
        
        // Generate contextual Big Ideas based on common themes
        if (lowerValue.includes('nature') || lowerValue.includes('environment') || lowerValue.includes('plant')) {
          suggestions = [
            { title: "Systems and Balance", desc: "How natural and human systems interact and maintain equilibrium" },
            { title: "Growth and Transformation", desc: "The cycles of change that shape living things and communities" },
            { title: "Interdependence", desc: "How all elements in an ecosystem rely on each other" }
          ];
        } else if (lowerValue.includes('communit') || lowerValue.includes('social') || lowerValue.includes('people')) {
          suggestions = [
            { title: "Collective Impact", desc: "How individuals shape and are shaped by their communities" },
            { title: "Identity and Belonging", desc: "The ways we define ourselves through connections" },
            { title: "Shared Responsibility", desc: "Our role in creating positive change together" }
          ];
        } else if (lowerValue.includes('technolog') || lowerValue.includes('digital') || lowerValue.includes('innovat')) {
          suggestions = [
            { title: "Tools and Transformation", desc: "How technology shapes human experience" },
            { title: "Connection and Distance", desc: "The paradox of digital relationships" },
            { title: "Progress and Purpose", desc: "Balancing innovation with human values" }
          ];
        } else {
          // Generic suggestions for any topic
          suggestions = [
            { title: "Patterns and Relationships", desc: `How ${value} reveals underlying patterns in our world` },
            { title: "Change Over Time", desc: `The evolution and adaptation of ${value}` },
            { title: "Cause and Effect", desc: `Understanding the impact and influence of ${value}` }
          ];
        }
        
        return `I see you're interested in exploring "${value}" as a foundation for your ${subject} project.

Let me help you shape this into a powerful Big Idea. A Big Idea should be a transferable concept that connects to deeper understanding. Based on your interest in ${value}, here are some ways we could frame this:

${suggestions.map((s, i) => `**Option ${i + 1}: ${s.title}** - ${s.desc}`).join('\n\n')}

Which direction resonates with your vision for your ${ageGroup} students, or would you like to refine your original idea further?`;
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
      IDEATION: `**Welcome to the Ideation Stage**

In this foundational phase, we'll establish the conceptual framework for your learning experience through three interconnected components:

**1. Big Idea** - We'll identify a resonant concept that connects academic content to students' lived experiences
**2. Essential Question** - We'll formulate an open-ended inquiry that drives sustained investigation
**3. Challenge** - We'll design an authentic task with real-world relevance and impact

This systematic approach ensures your learning experience is grounded in research-based principles of engagement and deep learning. Each element scaffolds the next, creating coherent progression.

Let's begin by identifying your Big Idea.`,
      
      JOURNEY: `**Welcome to the Journey Design Stage**

Having established your conceptual foundation, we'll now architect the learning progression. This stage focuses on three critical design elements:

**1. Phases** - Strategic sequencing that builds complexity and deepens understanding progressively
**2. Activities** - Evidence-based learning experiences that promote active construction of knowledge
**3. Resources** - Carefully curated materials and supports that scaffold student success

As an instructional designer, you'll apply principles of backward design and differentiated instruction to create a coherent learning arc. Each decision should align with your established Big Idea and Essential Question.

Shall we begin mapping your learning journey?`,
      
      DELIVERABLES: `**Welcome to the Deliverables Stage**

In this final design phase, we'll establish how students demonstrate mastery and create authentic impact:

**1. Milestones** - Strategic checkpoints that provide formative feedback and maintain momentum
**2. Rubric** - Transparent criteria that value both process and product while promoting growth
**3. Impact Plan** - Authentic audience engagement that validates student work beyond traditional assessment

This stage transforms learning from academic exercise to meaningful contribution. By connecting to real audiences and purposes, we elevate student work to professional standards.

Let's design assessment that inspires excellence.`
    };
    
    return templates[stage] || '';
  }

  private getStepEntryContent(step: any): string {
    // This will be enhanced with context-aware prompts
    const prompts: Record<string, string> = {
      'IDEATION_BIG_IDEA': `Let's establish the conceptual anchor for your ${this.wizardData.subject} learning experience.

A Big Idea is a transferable concept that:
• Transcends specific topics to reveal deeper understanding
• Connects ${this.wizardData.subject} to students' lived experiences
• Provokes intellectual curiosity and sustained inquiry

Considering your ${this.wizardData.ageGroup} students in ${this.wizardData.location}, what overarching concept could transform their relationship with ${this.wizardData.subject}?

*Research shows that effective Big Ideas often bridge disciplinary boundaries. For instance: "Systems and Interactions," "Patterns of Change," or "Power and Agency."*`,
      
      'IDEATION_EQ': `Excellent Big Idea. Now we'll transform it into an Essential Question that drives deep inquiry.

Effective Essential Questions share these characteristics:
• They resist simple answers, requiring sustained investigation
• They connect abstract concepts to concrete experiences
• They remain relevant throughout the learning journey

Building on your Big Idea, what question would compel your ${this.wizardData.ageGroup} students to think critically and creatively?

*Strong Essential Questions often begin with: "To what extent...", "How might we...", "What is the relationship between...", or "Why do..."*`,
      
      'IDEATION_CHALLENGE': `That's a thought-provoking question. Now we'll design an authentic challenge that transforms inquiry into action.

Research-based authentic challenges:
• Address genuine problems within students' sphere of influence
• Connect to stakeholders who value the outcomes
• Result in tangible products or measurable impact

Considering ${this.wizardData.location} and your students' developmental stage, what challenge would demonstrate that ${this.wizardData.subject} knowledge has real-world application?

*Effective formats include: "Develop a solution for...", "Create a resource that helps...", "Design an intervention to address...", or "Propose recommendations for..."*`,
      
      'JOURNEY_PHASES': `Now let's design the learning progression for your ${this.wizardData.ageGroup} students.

For this age group, effective project phases should:
• Build skills incrementally with clear milestones
• Balance structured guidance with age-appropriate autonomy
• Include frequent celebration of progress
• Maintain engagement through variety and hands-on activities

How would you sequence this project into 3-4 phases that gradually build student capacity while maintaining excitement?

*For ${this.wizardData.ageGroup}, consider phases like: "Explore & Discover," "Plan & Create," "Test & Improve," "Share & Celebrate"*`,
      
      'JOURNEY_ACTIVITIES': `Excellent phase structure! Now let's design engaging activities that bring each phase to life.

For ${this.wizardData.ageGroup} students, effective activities should:
• Be hands-on and interactive
• Allow for movement and collaboration
• Connect to their immediate world and interests
• Build confidence through achievable challenges

What specific activities will help students develop the skills needed for their ${this.state.capturedData['ideation.challenge'] || 'challenge'}?

*Consider: games, experiments, building/making, role-play, field experiences, peer teaching, creative expression*`,
      
      'JOURNEY_RESOURCES': `Great activity design! Now let's identify resources that will support student success.

For ${this.wizardData.ageGroup} learners, effective resources should:
• Be visually engaging and age-appropriate
• Include multimedia and manipulatives
• Provide scaffolds for different learning styles
• Connect to familiar contexts in ${this.wizardData.location}

What materials, tools, and supports will students need to successfully complete their activities?

*Think about: books, videos, guest speakers, technology tools, art supplies, community partnerships, visual aids*`,
      
      'DELIVER_MILESTONES': `Let's establish checkpoints that keep ${this.wizardData.ageGroup} students motivated and on track.

Age-appropriate milestones should:
• Celebrate small wins frequently
• Be visible and tangible (students can see/touch their progress)
• Build toward the final challenge incrementally
• Include peer and self-assessment opportunities

What key milestones will help students track their journey toward completing the ${this.state.capturedData['ideation.challenge'] || 'challenge'}?

*Examples: "Research Complete," "Prototype Built," "Feedback Gathered," "Final Presentation Ready"*`,
      
      'DELIVER_RUBRIC': `Now we'll create success criteria that are clear and motivating for ${this.wizardData.ageGroup} students.

Effective rubrics for this age should:
• Use student-friendly language and visuals
• Focus on growth and effort, not just outcomes
• Include specific, observable behaviors
• Balance academic skills with collaboration and creativity

What criteria will help students understand what success looks like for their ${this.wizardData.subject} project?

*Consider categories like: Understanding, Creativity, Teamwork, Communication, Problem-Solving*`,
      
      'DELIVER_IMPACT': `Finally, let's design how students will share their work with authentic audiences.

For ${this.wizardData.ageGroup} students, impactful sharing should:
• Connect to people they care about (family, younger students, community)
• Feel celebratory and affirming
• Allow for multiple presentation formats
• Create lasting artifacts or memories

${this.state.capturedData['ideation.bigIdea'] ? 
`Building on your Big Idea of "${this.state.capturedData['ideation.bigIdea']}" and ` : ''}${this.state.capturedData['ideation.challenge'] ? 
`your challenge to "${this.state.capturedData['ideation.challenge']}", ` : ''}how will students share their work to make a real difference?

*Ideas: School assembly, community fair, video documentary, teaching younger classes, family showcase night*`
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
    return `**The Active Learning Framework: Research-Based Design for Deep Engagement**

The Active Learning Framework (ALF) synthesizes decades of educational research into a practical design process. Our approach transforms traditional instruction into inquiry-driven, student-centered experiences.

**Our Three-Stage Process:**

**Ideation** (10 minutes) - Establish conceptual foundations using Understanding by Design principles. We identify transferable concepts, craft essential questions, and design authentic challenges that connect ${this.wizardData.subject} to real-world contexts.

**Journey** (15 minutes) - Apply learning sciences research to design progressive skill development. We structure phases for cognitive growth, select evidence-based activities, and curate resources that support differentiated instruction.

**Deliverables** (10 minutes) - Implement authentic assessment strategies. We establish formative milestones, develop growth-oriented rubrics, and create venues for public exhibition of learning.

**Evidence-Based Benefits:**
• Increases intrinsic motivation through autonomy and purpose
• Develops 21st-century competencies: critical thinking, collaboration, communication, creativity
• Connects academic content to community contexts in ${this.wizardData.location}
• Supports diverse learners through multiple pathways to success
• Aligns with standards while transcending test preparation

Shall we begin designing your transformative learning experience?`;
  }

  private generateHelpContent(step: any): string {
    const helpMessages: Record<string, string> = {
      'Big Idea': `**Understanding Big Ideas in Learning Design**

A Big Idea serves as the conceptual foundation that unifies your entire learning experience. Based on constructivist learning theory, effective Big Ideas for ${this.wizardData.ageGroup} students should:

• Bridge academic content with authentic contexts in ${this.wizardData.location}
• Reveal patterns or principles that transfer across domains
• Challenge assumptions while building on prior knowledge

**Research insight:** Grant Wiggins and Jay McTighe's work on Understanding by Design shows that Big Ideas should be "transferable" - applicable beyond the specific content to new situations.

Consider: What enduring understanding about ${this.wizardData.subject} will serve your students throughout their lives?

The Ideas feature provides research-backed suggestions tailored to your context.`,
      
      'Essential Question': `**Developing Essential Questions**

Essential Questions serve as the intellectual framework for sustained inquiry. According to educational researchers, effective Essential Questions for ${this.wizardData.ageGroup} learners:

• Require higher-order thinking (analysis, synthesis, evaluation)
• Connect disciplinary knowledge to authentic contexts
• Generate additional questions rather than definitive answers

**Pedagogical principle:** As Heidi Hayes Jacobs notes, Essential Questions should be "arguable" - promoting discussion and multiple perspectives rather than convergent thinking.

Reflect: What question about ${this.wizardData.subject} would sustain investigation across your entire unit?

The Ideas feature offers questions aligned with best practices in inquiry-based learning.`,
      
      'Challenge': `**Creating Authentic Challenges**

Authentic challenges transform abstract learning into concrete contribution. Research on project-based learning demonstrates that effective challenges for ${this.wizardData.ageGroup} students:

• Address genuine needs within ${this.wizardData.location} community
• Require application of ${this.wizardData.subject} concepts in novel contexts
• Result in products valued beyond classroom assessment

**Evidence-based principle:** Buck Institute's Gold Standard PBL emphasizes that authentic challenges should have "public products" - work shared with audiences who have genuine interest in the outcomes.

Consider: What challenge would position your students as knowledge creators rather than knowledge consumers?

The Ideas feature provides challenge formats proven effective in similar educational contexts.`,
      
      'Phases': `**Designing Learning Phases for ${this.wizardData.ageGroup}**

Effective project phases create a scaffolded journey that builds student capacity while maintaining engagement. Research on developmental appropriateness shows that ${this.wizardData.ageGroup} students benefit from:

• Clear structure with predictable patterns
• Frequent opportunities to see and celebrate progress
• Balance between guided instruction and exploratory learning
• Variety in activities to match attention spans

**Best practice:** The Buck Institute recommends 3-4 distinct phases that move from "Building Knowledge" through "Developing Products" to "Presenting Publicly."

Consider: How can you chunk this project into manageable phases that gradually release responsibility to students?

The Ideas feature offers phase structures proven effective for this age group.`,
      
      'Activities': `**Creating Engaging Activities for ${this.wizardData.ageGroup}**

Activities are where learning comes alive! For ${this.wizardData.ageGroup} students in ${this.wizardData.subject}, research shows the most effective activities:

• Incorporate movement and hands-on manipulation
• Allow for social interaction and collaboration
• Connect to students' interests and pop culture
• Provide choice within structured parameters
• Include game-like elements and friendly competition

**Developmental insight:** At this age, students learn best through concrete experiences before moving to abstract concepts.

Reflect: What activities would make students excited to come to ${this.wizardData.subject} class?

The Ideas feature suggests activities aligned with cognitive development research.`,
      
      'Resources': `**Selecting Resources for ${this.wizardData.ageGroup} Learners**

Quality resources scaffold success while maintaining appropriate challenge. For ${this.wizardData.ageGroup} students, effective resources should:

• Be visually rich and multimodal
• Offer multiple entry points for different learners
• Include both digital and physical materials
• Connect to local ${this.wizardData.location} contexts when possible
• Support independent exploration within safe boundaries

**UDL Principle:** Provide multiple means of representation to ensure all learners can access content.

Consider: What mix of resources would support diverse learning styles in your classroom?

The Ideas feature recommends resources based on accessibility and engagement research.`,
      
      'Milestones': `**Setting Milestones for ${this.wizardData.ageGroup} Students**

Well-designed milestones maintain momentum and build confidence. For this age group, effective milestones should:

• Be frequent enough to maintain motivation (every 3-5 days)
• Include both individual and group achievements
• Be visible and celebrated publicly
• Connect clearly to the final challenge
• Allow for reflection and adjustment

**Motivation research:** Teresa Amabile's work shows that "small wins" are crucial for maintaining engagement in longer projects.

Think: What checkpoints would help students see their progress toward the ${this.state.capturedData['ideation.challenge'] || 'final challenge'}?

The Ideas feature suggests milestone structures that maintain engagement.`,
      
      'Rubric': `**Creating Student-Friendly Rubrics for ${this.wizardData.ageGroup}**

Effective rubrics for this age group make success criteria transparent and achievable. Best practices include:

• Using "I can" statements and student-friendly language
• Including visual indicators (symbols, colors)
• Balancing process and product assessment
• Recognizing effort and growth, not just achievement
• Co-creating criteria with students when possible

**Assessment principle:** Dylan Wiliam's research shows that students who understand success criteria are more likely to achieve them.

Consider: How can you describe success in ways that ${this.wizardData.ageGroup} students will understand and embrace?

The Ideas feature provides rubric formats proven effective for this developmental stage.`,
      
      'Impact Plan': `**Planning Authentic Impact for ${this.wizardData.ageGroup}**

The impact plan transforms school work into real-world contribution. For ${this.wizardData.ageGroup} students, meaningful impact should:

• Connect to audiences they care about
• Be achievable within their sphere of influence
• Create lasting artifacts or changes
• Include celebration and recognition
• Build connections with ${this.wizardData.location} community

**Engagement research:** When students know their work matters beyond grades, intrinsic motivation soars.

Imagine: How could your students' ${this.wizardData.subject} work make a real difference to someone?

The Ideas feature suggests impact strategies that create lasting memories and connections.`
    };
    
    return helpMessages[step?.label] || `💖 **Here to Help!**

You're making great progress! This step builds on everything you've created so far. Remember:

• Trust your instincts about what excites your ${this.wizardData.ageGroup} students
• Think about how ${this.wizardData.subject} connects to their world
• There's no "wrong" answer - just opportunities to refine

The Ideas and What-If buttons are always here when you need inspiration!`;
  }

  private async generateIdeas(): Promise<any[]> {
    if (!this.model) {
      console.log('AI model not available, using fallback ideas');
      // Fallback if AI is not available
      return this.generateFallbackIdeas();
    }

    try {
      const currentStep = this.getCurrentStep();
      const contextData = {
        subject: this.wizardData.subject,
        ageGroup: this.wizardData.ageGroup,
        location: this.wizardData.location,
        stage: this.state.stage,
        currentStep: currentStep?.label,
        previousSelections: this.state.capturedData
      };

      console.log('Generating AI ideas for:', contextData);
      const prompt = this.buildIdeaPrompt(contextData, currentStep);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('AI response received');

      // Parse the AI response
      const ideas = this.parseAIIdeas(text);
      
      // Ensure we have at least 3 ideas
      if (ideas.length < 3) {
        return this.generateFallbackIdeas();
      }

      return ideas.slice(0, 4); // Return up to 4 ideas
    } catch (error) {
      console.error('Error generating AI ideas:', error);
      return this.generateFallbackIdeas();
    }
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

    return basePrompt + specificPrompt + `\n\nRespond ONLY with the 4 ideas in the exact format specified. No additional text.`;
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
    const subject = this.wizardData.subject;
    const ageGroup = this.wizardData.ageGroup;
    
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
    if (!this.model) {
      return this.generateFallbackWhatIfs();
    }

    try {
      const currentStep = this.getCurrentStep();
      const contextData = {
        subject: this.wizardData.subject,
        ageGroup: this.wizardData.ageGroup,
        location: this.wizardData.location,
        stage: this.state.stage,
        currentStep: currentStep?.label,
        previousSelections: this.state.capturedData
      };

      const prompt = this.buildWhatIfPrompt(contextData, currentStep);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      const whatIfs = this.parseAIIdeas(text); // Reuse the same parser
      
      if (whatIfs.length < 2) {
        return this.generateFallbackWhatIfs();
      }

      return whatIfs.slice(0, 3); // Return up to 3 what-ifs
    } catch (error) {
      console.error('Error generating AI what-ifs:', error);
      return this.generateFallbackWhatIfs();
    }
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

    return basePrompt + specificPrompt + `\n\nRespond ONLY with the 3 scenarios in the exact format specified. No additional text.`;
  }

  private generateFallbackWhatIfs(): any[] {
    const step = this.getCurrentStep();
    const subject = this.wizardData.subject;
    
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
    const validTransitions: Record<string, string[]> = {
      'welcome': ['start'],
      'stage_init': ['start', 'tellmore'],
      'step_entry': ['text', 'ideas', 'whatif', 'help'],
      'step_confirm': ['continue', 'refine', 'help'],
      'stage_clarify': ['proceed', 'edit'],
      'complete': []
    };
    
    const allowedActions = validTransitions[this.state.phase] || [];
    
    // Special case: always allow help
    if (action === 'help') return true;
    
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
          .forEach(key => localStorage.removeItem(key));
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