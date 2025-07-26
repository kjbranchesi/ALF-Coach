// ChatService - Single source of truth for chat state management
// Following SOP v1.0 strictly

import { EventEmitter } from '../utils/event-emitter';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

  constructor(wizardData: any, blueprintId: string) {
    super();
    this.wizardData = wizardData;
    this.blueprintId = blueprintId;
    
    // Initialize Gemini AI
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Gemini API Key available:', !!apiKey);
    console.log('Environment:', import.meta.env.MODE);
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
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
    // Keep the current step and pending value for context
    const currentStep = this.getCurrentStep();
    const currentValue = this.state.pendingValue;
    
    // Generate contextual refinement message
    let refinementContent = "Absolutely. Refining our ideas is a crucial part of the design process. ";
    
    if (currentValue) {
      refinementContent += `You selected "${currentValue}" as your ${currentStep?.label}. `;
      refinementContent += "Let's explore how we can enhance this concept or consider alternative approaches that might better serve your pedagogical goals.";
    } else {
      refinementContent += "What aspect would you like to revisit or enhance?";
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: refinementContent,
      timestamp: new Date()
    };
    
    this.state.messages.push(message);
    
    // Don't reset the phase or pending value - maintain context
    // The next Ideas/What-If should build on the current selection
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
          cardOptions: ideas
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
    }
  }

  private async handleWhatIf(): Promise<void> {
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
          cardOptions: whatIfs
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
      content: `**Congratulations!** You've successfully designed a comprehensive learning blueprint.

Through thoughtful planning and pedagogical expertise, you've created an experience that aligns with best practices in project-based learning. Your blueprint integrates authentic challenges, systematic skill development, and meaningful assessment.

This framework will empower your students to engage deeply with content while developing critical 21st-century competencies.

Would you like to review your complete blueprint and explore implementation options?`,
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

How will students share their ${this.state.capturedData['ideation.challenge'] || 'solutions'} to make a real difference?

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