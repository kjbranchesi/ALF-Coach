// ChatService - Single source of truth for chat state management
// Following SOP v1.0 strictly

import { EventEmitter } from '../utils/event-emitter';

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

  constructor(wizardData: any, blueprintId: string) {
    super();
    this.wizardData = wizardData;
    this.blueprintId = blueprintId;
    
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

    // Add initial welcome message
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
    if (this.state.isProcessing) return;
    
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

  // Private methods
  private addWelcomeMessage(): void {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Welcome to ALF Coach! I'll guide you through creating an engaging learning experience using the Active Learning Framework. We'll work together through three stages: Ideation, Journey, and Deliverables.`,
      timestamp: new Date(),
      metadata: {
        phase: 'welcome'
      }
    };
    
    this.state.messages.push(message);
  }

  private async handleStart(): Promise<void> {
    if (this.state.phase === 'welcome') {
      // Move to ideation stage init
      this.state.phase = 'stage_init';
      this.addStageInitMessage('IDEATION');
    } else if (this.state.phase === 'stage_init') {
      // Start first step of current stage
      this.state.stepIndex = 0;
      this.state.phase = 'step_entry';
      this.addStepEntryMessage();
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
      this.advanceToNext();
    }
  }

  private async handleRefine(): Promise<void> {
    this.state.phase = 'step_entry';
    this.state.pendingValue = null;
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Of course! Feel free to refine your answer.",
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
  }

  private async handleHelp(): Promise<void> {
    const currentStep = this.getCurrentStep();
    const helpContent = this.generateHelpContent(currentStep);
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: helpContent,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
  }

  private async handleIdeas(): Promise<void> {
    const ideas = this.generateIdeas();
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Here are some ideas tailored to your context:",
      timestamp: new Date(),
      metadata: {
        showCards: true,
        cardType: 'ideas',
        cardOptions: ideas
      }
    };
    
    this.state.messages.push(message);
  }

  private async handleWhatIf(): Promise<void> {
    const whatIfs = this.generateWhatIfs();
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Here are some thought-provoking scenarios:",
      timestamp: new Date(),
      metadata: {
        showCards: true,
        cardType: 'whatif',
        cardOptions: whatIfs
      }
    };
    
    this.state.messages.push(message);
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
      this.addStageInitMessage(this.state.stage);
    } else {
      // Complete!
      this.state.phase = 'complete';
      this.addCompleteMessage();
    }
  }

  private async handleEdit(stepId?: string): Promise<void> {
    // TODO: Implement edit functionality
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Edit functionality coming soon. For now, please proceed forward.",
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
  }

  private async handleTextInput(text: string): Promise<void> {
    if (!text?.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    this.state.messages.push(userMessage);
    
    // Process based on phase
    if (this.state.phase === 'step_entry') {
      this.state.pendingValue = text;
      this.state.phase = 'step_confirm';
      this.addConfirmationMessage(text);
    }
  }

  private async handleCardSelect(card: any): Promise<void> {
    await this.handleTextInput(card.title);
  }

  private getCurrentStep(): any {
    const stageConfig = STAGE_CONFIG[this.state.stage];
    return stageConfig?.steps[this.state.stepIndex];
  }

  private advanceToNext(): void {
    const stageConfig = STAGE_CONFIG[this.state.stage];
    
    if (this.state.stepIndex < stageConfig.steps.length - 1) {
      // Next step in current stage
      this.state.stepIndex++;
      this.state.phase = 'step_entry';
      this.state.pendingValue = null;
      this.addStepEntryMessage();
    } else {
      // Stage complete
      this.state.phase = 'stage_clarify';
      this.addStageClarifyMessage();
    }
  }

  private addStageInitMessage(stage: ChatStage): void {
    const content = this.getStageInitContent(stage);
    
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
  }

  private addStepEntryMessage(): void {
    const step = this.getCurrentStep();
    const content = this.getStepEntryContent(step);
    
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
  }

  private addConfirmationMessage(value: string): void {
    const step = this.getCurrentStep();
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Current ${step.label}: **${value}**. Continue or refine?`,
      timestamp: new Date(),
      metadata: {
        phase: 'step_confirm'
      }
    };
    
    this.state.messages.push(message);
  }

  private addStageClarifyMessage(): void {
    const content = this.getStageClarifyContent();
    
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
  }

  private addCompleteMessage(): void {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Congratulations! Your blueprint is complete. Ready to review and export.",
      timestamp: new Date(),
      metadata: {
        phase: 'complete'
      }
    };
    
    this.state.messages.push(message);
  }

  // Content generation methods
  private getStageInitContent(stage: ChatStage): string {
    const templates = {
      IDEATION: `Welcome to Ideation. In this stage we'll complete 3 steps:
1. Big Idea — Find a resonant concept
2. Essential Question — Frame your inquiry
3. Challenge — Define real-world impact

Each answer builds the foundation for your Learning Journey.`,
      
      JOURNEY: `Welcome to the Learning Journey. Here we'll map out 3 elements:
1. Phases — Structure the learning arc
2. Activities — Design key experiences
3. Resources — Gather essential support

This creates the roadmap for your Big Idea.`,
      
      DELIVERABLES: `Welcome to Deliverables. Let's define 3 final elements:
1. Milestones — Set progress checkpoints
2. Rubric — Define success criteria
3. Impact Plan — Plan authentic sharing

This ensures quality and real-world connection.`
    };
    
    return templates[stage] || '';
  }

  private getStepEntryContent(step: any): string {
    // This will be enhanced with context-aware prompts
    const prompts: Record<string, string> = {
      'IDEATION_BIG_IDEA': `Let's anchor your ${this.wizardData.subject} experience with a Big Idea.

A Big Idea is a concept that:
• Resonates beyond the classroom
• Connects to students' lives
• Sparks curiosity and wonder

For ${this.wizardData.ageGroup} students in ${this.wizardData.location}, what overarching concept could transform how they see ${this.wizardData.subject}?`,
      
      'IDEATION_EQ': `Great! Now let's transform your Big Idea into an Essential Question.

Essential Questions:
• Are open-ended and thought-provoking
• Don't have one "right" answer
• Drive sustained inquiry

What question could unpack your Big Idea for your students?`,
      
      'IDEATION_CHALLENGE': `Excellent! Let's create a real-world Challenge.

A Challenge should:
• Have authentic purpose
• Connect to real audiences
• Create tangible impact

What challenge could your students tackle?`
    };
    
    return prompts[step.id] || `Please provide your ${step.label}.`;
  }

  private getStageClarifyContent(): string {
    const data = this.state.capturedData;
    
    const templates = {
      IDEATION: `Ideation summary:
• Big Idea — ${data['ideation.bigIdea'] || '[pending]'}
• Essential Question — ${data['ideation.essentialQuestion'] || '[pending]'}
• Challenge — ${data['ideation.challenge'] || '[pending]'}`,
      
      JOURNEY: `Journey summary:
• Phases — ${data['journey.phases'] || '[pending]'}
• Activities — ${data['journey.activities'] || '[pending]'}
• Resources — ${data['journey.resources'] || '[pending]'}`,
      
      DELIVERABLES: `Deliverables summary:
• Milestones — ${data['deliverables.milestones'] || '[pending]'}
• Rubric — ${data['deliverables.rubric'] || '[pending]'}
• Impact Plan — ${data['deliverables.impact'] || '[pending]'}`
    };
    
    return templates[this.state.stage] || '';
  }

  private getTellMoreContent(): string {
    return `The Active Learning Framework (ALF) transforms traditional teaching into dynamic, student-centered experiences.

Here's how our process works:
• **Ideation** - We'll craft a compelling vision
• **Journey** - We'll design the learning path
• **Deliverables** - We'll ensure authentic outcomes

Each step builds on the previous, creating a coherent and engaging experience for your students.`;
  }

  private generateHelpContent(step: any): string {
    return `**Understanding ${step?.label || 'this step'}**

This step helps you establish a clear foundation for your learning experience. Think about:
• What matters most to your ${this.wizardData.ageGroup} students
• How ${this.wizardData.subject} connects to their world
• What will make this learning stick

Need inspiration? Try the Ideas or What-If buttons.`;
  }

  private generateIdeas(): any[] {
    // This will be enhanced with AI-generated ideas
    return [
      { id: '1', title: 'Technology as a Bridge', description: 'Connect communities through innovation' },
      { id: '2', title: 'Digital Citizenship', description: 'Rights and responsibilities online' },
      { id: '3', title: 'Code for Change', description: 'Programming to solve local problems' }
    ];
  }

  private generateWhatIfs(): any[] {
    return [
      { id: '1', title: 'What if students designed apps for their community?', description: 'Real impact through technology' },
      { id: '2', title: 'What if coding was taught through storytelling?', description: 'Narrative-driven programming' }
    ];
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