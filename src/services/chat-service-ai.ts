// ChatService with AI Integration - AI-guided conversation flow
// Maintains SOP v1.0 structure with dynamic, contextual responses

import { EventEmitter } from '../utils/event-emitter';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AIConversationManager, createAIConversationManager } from './ai-conversation-manager';
import { type SOPValidator, createSOPValidator } from './sop-validator';
import { type ContextManager, createContextManager } from './context-manager';

// Re-export types from original
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
  
  // AI Components
  private aiManager: AIConversationManager | null = null;
  private sopValidator: SOPValidator;
  private contextManager: ContextManager;
  
  // Legacy Gemini for Ideas/WhatIf (will be replaced)
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(wizardData: any, blueprintId: string) {
    super();
    this.wizardData = wizardData;
    this.blueprintId = blueprintId;
    
    // Initialize AI components
    this.sopValidator = createSOPValidator();
    this.contextManager = createContextManager();
    
    // Initialize AI Manager
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Initializing AI-guided ChatService...');
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.aiManager = createAIConversationManager(apiKey);
        if (this.aiManager) {
          console.log('✓ AI Conversation Manager initialized');
        } else {
          console.warn('⚠ AI Manager initialization returned null');
        }
        
        // Also initialize legacy model for Ideas/WhatIf
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
      } catch (error) {
        console.error('Failed to initialize AI components:', error);
      }
    } else {
      console.warn('⚠ Gemini API key not configured - using enhanced fallback mode');
    }
    
    // Initialize state
    this.state = {
      stage: 'IDEATION',
      stepIndex: -1,
      phase: 'welcome',
      messages: [],
      capturedData: this.loadSavedData(),
      pendingValue: null,
      isProcessing: false,
      waitingForInput: false,
      showConfirmation: false,
      totalSteps: 9, // 3 stages × 3 steps each
      completedSteps: 0
    };

    // Add initial welcome message (now AI-generated)
    this.addWelcomeMessage();
  }

  // Public methods
  public getState(): ChatState {
    return { ...this.state };
  }

  public getQuickReplies(): QuickReply[] {
    const { phase, stage, stepIndex } = this.state;

    // Welcome phase - show start button
    if (phase === 'welcome') {
      return [
        { id: 'start', label: "Okay let's begin", action: 'start', variant: 'primary' }
      ];
    }

    // Stage init - show start button for that stage
    if (phase === 'stage_init') {
      return [
        { id: 'start', label: "Let's Begin", action: 'start', icon: 'Rocket', variant: 'primary' },
        { id: 'tellmore', label: 'Tell Me More', action: 'tellmore', icon: 'Info', variant: 'secondary' }
      ];
    }

    // Confirmation phase - Continue/Refine/Help
    if (phase === 'step_confirm') {
      return [
        { id: 'continue', label: 'Continue', action: 'continue', icon: 'Check', variant: 'primary' },
        { id: 'refine', label: 'Refine', action: 'refine', icon: 'Edit', variant: 'secondary' },
        { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' }
      ];
    }

    // Entry phase - Ideas/What-If/Help
    if (phase === 'step_entry') {
      return [
        { id: 'ideas', label: 'Ideas', action: 'ideas', icon: 'Lightbulb', variant: 'suggestion' },
        { id: 'whatif', label: 'What-If', action: 'whatif', icon: 'RefreshCw', variant: 'suggestion' },
        { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' }
      ];
    }

    // Stage clarify - edit or proceed
    if (phase === 'stage_clarify') {
      return [
        { id: 'proceed', label: 'Proceed', action: 'proceed', icon: 'ArrowRight', variant: 'primary' },
        { id: 'edit', label: 'Edit', action: 'edit', icon: 'Edit', variant: 'secondary' }
      ];
    }

    return [];
  }

  public async processAction(action: string, data?: any): Promise<void> {
    if (this.state.isProcessing) {return;}
    
    this.state.isProcessing = true;
    this.emit('stateChange', this.getState());

    try {
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
    } finally {
      this.state.isProcessing = false;
      this.emit('stateChange', this.getState());
    }
  }

  // AI-Enhanced Private Methods
  private async addWelcomeMessage(): Promise<void> {
    const content = await this.generateAIContent('welcome', {});
    
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
    this.contextManager.addMessage(message);
  }

  private async handleStart(): Promise<void> {
    if (this.state.phase === 'welcome') {
      // Move to ideation stage init
      this.state.phase = 'stage_init';
      await this.addStageInitMessage('IDEATION');
    } else if (this.state.phase === 'stage_init') {
      // Start first step of current stage
      this.state.stepIndex = 0;
      this.state.phase = 'step_entry';
      await this.addStepEntryMessage();
    }
  }

  private async handleContinue(): Promise<void> {
    if (this.state.phase === 'step_confirm' && this.state.pendingValue) {
      // Save the value
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        this.state.capturedData[currentStep.key] = this.state.pendingValue;
        this.state.completedSteps++;
        this.saveData();
      }
      
      // Move to next step or stage
      await this.advanceToNext();
    }
  }

  private async handleRefine(): Promise<void> {
    const currentStep = this.getCurrentStep();
    const currentValue = this.state.pendingValue;
    
    const refinementContent = await this.generateAIContent('refine', {
      step: currentStep,
      userInput: currentValue
    });
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: refinementContent,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
    this.contextManager.addMessage(message);
    this.aiManager?.updateContext(message);
  }

  private async handleHelp(): Promise<void> {
    const currentStep = this.getCurrentStep();
    const helpContent = await this.generateAIContent('help', { step: currentStep });
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: helpContent,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
    this.contextManager.addMessage(message);
    this.aiManager?.updateContext(message);
  }

  // Keep existing Ideas/WhatIf handling for now (will enhance later)
  private async handleIdeas(): Promise<void> {
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
      
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Based on educational research and your specific context, I've generated several evidence-based suggestions. These ideas have proven successful in similar settings. Select any that resonate with you, or use them as inspiration for your own approach:",
        timestamp: new Date(),
        metadata: {
          showCards: true,
          cardType: 'ideas',
          cardOptions: ideas
        }
      };
      
      this.state.messages.push(message);
      this.contextManager.addMessage(message);
    } catch (error) {
      console.error('Error generating ideas:', error);
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble generating specific ideas right now. Please try again or share your own ideas!",
        timestamp: new Date()
      };
      this.state.messages.push(errorMessage);
    }
  }

  private async handleWhatIf(): Promise<void> {
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
      
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Let's explore transformative possibilities. These scenarios push beyond traditional boundaries to imagine what's possible when we remove typical constraints. Consider how these might inspire innovation in your context:",
        timestamp: new Date(),
        metadata: {
          showCards: true,
          cardType: 'whatif',
          cardOptions: whatIfs
        }
      };
      
      this.state.messages.push(message);
      this.contextManager.addMessage(message);
    } catch (error) {
      console.error('Error generating what-ifs:', error);
      this.state.messages = this.state.messages.filter(m => m.id !== loadingMessage.id);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble generating scenarios right now. Please try again or share your own 'what if' ideas!",
        timestamp: new Date()
      };
      this.state.messages.push(errorMessage);
    }
  }

  private async handleTellMore(): Promise<void> {
    const content = await this.generateAIContent('tellmore', {
      stage: this.state.stage
    });
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
    this.contextManager.addMessage(message);
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
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "I understand you'd like to make changes. While the edit functionality is being developed, I encourage you to continue forward. Your progress thus far shows strong pedagogical thinking.",
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
    this.contextManager.addMessage(message);
  }

  private async handleTextInput(text: string): Promise<void> {
    if (!text?.trim()) {return;}

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    this.state.messages.push(userMessage);
    this.contextManager.addMessage(userMessage);
    this.aiManager?.updateContext(userMessage);
    
    // Process based on phase
    if (this.state.phase === 'step_entry') {
      this.state.pendingValue = text;
      this.state.phase = 'step_confirm';
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
    
    if (this.state.stepIndex < stageConfig.steps.length - 1) {
      // Next step in current stage
      this.state.stepIndex++;
      this.state.phase = 'step_entry';
      this.state.pendingValue = null;
      await this.addStepEntryMessage();
    } else {
      // Stage complete
      this.state.phase = 'stage_clarify';
      await this.addStageClarifyMessage();
    }
  }

  // AI-Enhanced message generation methods
  private async addStageInitMessage(stage: ChatStage): Promise<void> {
    const content = await this.generateAIContent('stage_init', { stage });
    
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
    this.contextManager.addMessage(message);
    this.aiManager?.updateContext(message);
  }

  private async addStepEntryMessage(): Promise<void> {
    const step = this.getCurrentStep();
    const content = await this.generateAIContent('step_entry', { step });
    
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
    this.contextManager.addMessage(message);
    this.aiManager?.updateContext(message);
  }

  private async addConfirmationMessage(value: string): Promise<void> {
    const step = this.getCurrentStep();
    const content = await this.generateAIContent('confirm', { 
      step, 
      userInput: value 
    });
    
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
    this.contextManager.addMessage(message);
    this.aiManager?.updateContext(message);
  }

  private async addStageClarifyMessage(): Promise<void> {
    const content = await this.generateAIContent('stage_clarify', {
      stage: this.state.stage
    });
    
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
    this.contextManager.addMessage(message);
    this.aiManager?.updateContext(message);
  }

  private async addCompleteMessage(): Promise<void> {
    const content = await this.generateAIContent('complete', {});
    
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
    this.contextManager.addMessage(message);
  }

  // Central AI content generation
  private async generateAIContent(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): Promise<string> {
    // Get context from context manager
    const relevantContext = this.contextManager.getRelevantContext(action, this.state.stage);
    
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
    
    if (!this.aiManager) {
      // Use enhanced fallback
      return this.generateEnhancedFallback(action, params);
    }
    
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
          // Could regenerate here if score is too low
        }
      }
      
      return content;
    } catch (error) {
      console.error('AI generation failed, using enhanced fallback:', error);
      return this.generateEnhancedFallback(action, params);
    }
  }

  // Enhanced fallback (better than static templates)
  private generateEnhancedFallback(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): string {
    const { subject, ageGroup, location } = this.wizardData;
    const capturedCount = Object.keys(this.state.capturedData).length;
    const contextSummary = this.contextManager.getFormattedContext();
    
    // Use context to personalize even without AI
    const previousBigIdea = this.state.capturedData['ideation.bigIdea'];
    const previousEQ = this.state.capturedData['ideation.essentialQuestion'];
    
    switch (action) {
      case 'welcome':
        return `**Welcome to ALF Coach!**

I'm here to guide you through creating a transformative ${subject} learning experience for your ${ageGroup} students in ${location}.

Together, we'll design a project that engages students deeply, connects to their world, and produces meaningful outcomes. Our journey follows three stages:

**Ideation** - We'll identify powerful concepts that resonate with your students
**Journey** - We'll map out an engaging learning progression  
**Deliverables** - We'll define authentic ways students demonstrate mastery

Ready to create something amazing?`;

      case 'stage_init':
        return `**Welcome to the ${params.stage} Stage!**

${capturedCount > 0 ? `Building on the strong foundation you've created, ` : ''}let's ${
          params.stage === 'IDEATION' ? 'establish the conceptual heart of your project' :
          params.stage === 'JOURNEY' ? 'design how students will explore and grow' :
          'define how students will demonstrate and share their learning'
        }.

This stage includes three key elements that work together to create a cohesive learning experience. Each builds on the last, so take your time to think deeply about what will work best for your ${ageGroup} students.

Ready to dive in?`;

      case 'step_entry':
        const step = params.step;
        return `Now let's work on your **${step?.label || 'next element'}**.

${previousBigIdea ? `Thinking about your Big Idea "${previousBigIdea}", ` : ''}${
          previousEQ ? `and your Essential Question "${previousEQ}", ` : ''
        }what ideas come to mind for this important piece of your ${subject} project?

Consider what will engage and inspire your ${ageGroup} students here in ${location}. Use the **Ideas** button for research-based suggestions, or **What-If** to explore transformative possibilities.`;

      case 'confirm':
        return `**Excellent choice!**

"${params.userInput}" is a thoughtful ${params.step?.label || 'selection'} that ${
          previousBigIdea ? `connects beautifully to your Big Idea about ${previousBigIdea}` : 
          `will serve your ${ageGroup} students well`
        }.

This approach aligns with best practices in ${subject} education and creates authentic engagement opportunities. 

Would you like to **Continue** building on this, or **Refine** it further?`;

      case 'help':
        return `**Here to Support You!**

${params.step ? `For the ${params.step.label} step, ` : ''}consider these approaches for your ${ageGroup} ${subject} students:

• Connect to their daily experiences in ${location}
• Build on what excites them about ${subject}
• Create opportunities for choice and ownership
• Think about real audiences for their work

${contextSummary}

The **Ideas** button offers specific suggestions tailored to your context, while **What-If** explores bigger possibilities. Remember, the best choice is one that resonates with you and your students!`;

      default:
        return `Let's continue developing your ${subject} learning experience. ${
          capturedCount > 0 ? `You've made great progress so far!` : `Every journey begins with a single step.`
        }`;
    }
  }

  // Keep existing Ideas/WhatIf generation (will enhance in Phase 2)
  private async generateIdeas(): Promise<any[]> {
    if (!this.model) {
      console.log('AI model not available, using fallback ideas');
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

      const ideas = this.parseAIIdeas(text);
      
      if (ideas.length < 3) {
        return this.generateFallbackIdeas();
      }

      return ideas.slice(0, 4);
    } catch (error) {
      console.error('Error generating AI ideas:', error);
      return this.generateFallbackIdeas();
    }
  }

  private buildIdeaPrompt(context: any, step: any): string {
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
    
    if (currentIdea && currentIdea.title) {
      ideas.push(currentIdea);
    }
    
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
      'default': [
        { id: '1', title: 'Systems and Connections', description: 'How parts work together to create wholes' },
        { id: '2', title: 'Change Over Time', description: 'Understanding patterns of growth and transformation' },
        { id: '3', title: 'Community Impact', description: 'Making a difference in our local world' },
        { id: '4', title: 'Creative Problem Solving', description: 'Finding innovative solutions to challenges' }
      ]
    };
    
    const subjectFallbacks = fallbacks[subject];
    if (subjectFallbacks && subjectFallbacks[step?.id]) {
      return subjectFallbacks[step.id];
    }
    
    return fallbacks['default'];
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

      const whatIfs = this.parseAIIdeas(text);
      
      if (whatIfs.length < 2) {
        return this.generateFallbackWhatIfs();
      }

      return whatIfs.slice(0, 3);
    } catch (error) {
      console.error('Error generating AI what-ifs:', error);
      return this.generateFallbackWhatIfs();
    }
  }

  private buildWhatIfPrompt(context: any, step: any): string {
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
        
      default:
        specificPrompt = `Generate 3 transformative "What If" scenarios for ${context.currentStep} in a ${context.subject} project.`;
    }

    return `${basePrompt + specificPrompt  }\n\nRespond ONLY with the 3 scenarios in the exact format specified. No additional text.`;
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
        ]
      },
      'default': [
        { id: '1', title: 'What if students became the teachers?', description: 'Peer-led learning experiences' },
        { id: '2', title: 'What if learning happened everywhere?', description: 'Breaking down classroom walls' },
        { id: '3', title: 'What if failure was celebrated?', description: 'Embracing mistakes as learning opportunities' }
      ]
    };
    
    const subjectFallbacks = fallbacks[subject];
    if (subjectFallbacks && subjectFallbacks[step?.id]) {
      return subjectFallbacks[step.id];
    }
    return fallbacks['default'];
  }

  // Data persistence
  private saveData(): void {
    const key = `journey-v5-${this.blueprintId}`;
    localStorage.setItem(key, JSON.stringify(this.state.capturedData));
  }

  private loadSavedData(): Record<string, any> {
    const key = `journey-v5-${this.blueprintId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  }
}

// Factory function
export function createChatService(wizardData: any, blueprintId: string): ChatService {
  return new ChatService(wizardData, blueprintId);
}