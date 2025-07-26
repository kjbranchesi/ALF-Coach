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
      content: `Welcome! I'm ALF Coach, your expert partner in designing transformative learning experiences. Drawing from decades of educational research and best practices, I'll guide you through creating a project that will deeply engage your students.

Our structured approach follows three research-backed stages:

**Ideation** - We'll identify a resonant concept that connects to your students' lived experiences and natural curiosity

**Journey** - We'll architect a learning progression that builds skills systematically while maintaining high engagement

**Deliverables** - We'll design authentic assessments where students demonstrate mastery through real-world application

I'm here to provide expert guidance tailored to your specific context. Shall we begin transforming your vision into reality?`,
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
      content: "Absolutely. Refining our ideas is a crucial part of the design process. Many of the best learning experiences emerge through iteration. What aspect would you like to revisit or enhance?",
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
      content: "Based on educational research and your specific context, I've generated several evidence-based suggestions. These ideas have proven successful in similar settings. Select any that resonate with you, or use them as inspiration for your own approach:",
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
      content: "Let's explore transformative possibilities. These scenarios push beyond traditional boundaries to imagine what's possible when we remove typical constraints. Consider how these might inspire innovation in your context:",
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
      content: "I understand you'd like to make changes. While the edit functionality is being developed, I encourage you to continue forward. Your progress thus far shows strong pedagogical thinking.",
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
      content: `Thank you. Let me confirm your ${step.label}:

**${value}**

Does this accurately capture your vision? If so, we can proceed to the next element. If you'd like to refine this further to better align with your pedagogical goals, please select 'Refine'.`,
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
      content: "**Congratulations!** You've successfully designed a comprehensive learning blueprint.

Through thoughtful planning and pedagogical expertise, you've created an experience that aligns with best practices in project-based learning. Your blueprint integrates authentic challenges, systematic skill development, and meaningful assessment.

This framework will empower your students to engage deeply with content while developing critical 21st-century competencies.

Would you like to review your complete blueprint and explore implementation options?",
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

*Effective formats include: "Develop a solution for...", "Create a resource that helps...", "Design an intervention to address...", or "Propose recommendations for..."*`
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

The Ideas feature provides challenge formats proven effective in similar educational contexts.`
    };
    
    return helpMessages[step?.label] || `💖 **Here to Help!**

You're making great progress! This step builds on everything you've created so far. Remember:

• Trust your instincts about what excites your ${this.wizardData.ageGroup} students
• Think about how ${this.wizardData.subject} connects to their world
• There's no "wrong" answer - just opportunities to refine

The Ideas and What-If buttons are always here when you need inspiration!`;
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