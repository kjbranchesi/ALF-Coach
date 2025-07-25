// New Chat Architecture - Event-Driven, State-Aware, Purpose-Built

export interface ChatEvent {
  type: 'USER_TEXT' | 'CARD_SELECTION' | 'BUTTON_ACTION' | 'SYSTEM';
  payload: any;
  metadata?: {
    stage?: string;
    intent?: string;
    source?: string;
  };
}

export interface StageCapture {
  stage: string;
  value: string;
  confirmedAt: Date;
  method: 'text' | 'card' | 'refined';
}

export interface ConversationState {
  currentStage: string;
  capturedData: Map<string, StageCapture>;
  isWaitingForConfirmation: boolean;
  pendingValue?: string;
  conversationDepth: number;
  lastInteraction: Date;
}

// Event processor - handles all interactions uniformly
export class ChatEventProcessor {
  private state: ConversationState;
  
  constructor(initialState: ConversationState) {
    this.state = initialState;
  }
  
  async processEvent(event: ChatEvent): Promise<ChatResponse> {
    console.log('Processing event:', event.type, event.payload);
    
    switch (event.type) {
      case 'CARD_SELECTION':
        return this.handleCardSelection(event);
        
      case 'USER_TEXT':
        return this.handleUserText(event);
        
      case 'BUTTON_ACTION':
        return this.handleButtonAction(event);
        
      case 'SYSTEM':
        return this.handleSystemEvent(event);
        
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  }
  
  private async handleCardSelection(event: ChatEvent): Promise<ChatResponse> {
    const { cardValue, cardType, stage } = event.payload;
    
    // Card selection is ALWAYS treated as a final answer
    this.state.pendingValue = cardValue;
    this.state.isWaitingForConfirmation = true;
    
    return {
      message: this.generateConfirmation(cardValue, stage),
      quickReplies: [
        { label: "Perfect, let's continue!", action: 'confirm', icon: 'Check' },
        { label: 'Actually, let me choose differently', action: 'rechoose', icon: 'RefreshCw' }
      ],
      shouldProgress: false
    };
  }
  
  private async handleUserText(event: ChatEvent): Promise<ChatResponse> {
    const { text, stage } = event.payload;
    
    // First, check if this is a response to a pending action
    if (this.state.isWaitingForConfirmation) {
      return this.handleConfirmationResponse(text);
    }
    
    // Validate the input for the current stage
    const validation = this.validateInput(text, stage);
    
    if (!validation.isValid) {
      return {
        message: validation.guidance,
        quickReplies: this.getStageActions(stage),
        shouldProgress: false
      };
    }
    
    // Valid input - confirm it
    this.state.pendingValue = validation.processedValue;
    this.state.isWaitingForConfirmation = true;
    
    return {
      message: this.generateConfirmation(validation.processedValue, stage),
      quickReplies: [
        { label: "Yes, that's it!", action: 'confirm', icon: 'Check' },
        { label: 'Let me refine this', action: 'refine', icon: 'Edit' }
      ],
      shouldProgress: false
    };
  }
  
  private async handleButtonAction(event: ChatEvent): Promise<ChatResponse> {
    const { action, stage } = event.payload;
    
    switch (action) {
      case 'ideas':
        return {
          message: this.generateIdeas(stage),
          quickReplies: this.getStageActions(stage),
          shouldProgress: false
        };
        
      case 'confirm':
        if (this.state.pendingValue) {
          // Capture the value
          this.state.capturedData.set(stage, {
            stage,
            value: this.state.pendingValue,
            confirmedAt: new Date(),
            method: 'text'
          });
          
          // Clear pending state
          this.state.pendingValue = undefined;
          this.state.isWaitingForConfirmation = false;
          
          return {
            message: "Great! Moving forward...",
            quickReplies: [],
            shouldProgress: true
          };
        }
        break;
        
      case 'refine':
        this.state.isWaitingForConfirmation = false;
        return {
          message: "No problem! What would you like to change?",
          quickReplies: this.getStageActions(stage),
          shouldProgress: false
        };
    }
    
    return {
      message: "I'm not sure how to handle that action.",
      quickReplies: this.getStageActions(stage),
      shouldProgress: false
    };
  }
  
  private handleConfirmationResponse(text: string): ChatResponse {
    const lower = text.toLowerCase();
    
    if (lower.includes('yes') || lower.includes('continue') || lower.includes('perfect')) {
      return this.handleButtonAction({
        type: 'BUTTON_ACTION',
        payload: { action: 'confirm', stage: this.state.currentStage }
      });
    }
    
    if (lower.includes('no') || lower.includes('refine') || lower.includes('change')) {
      return this.handleButtonAction({
        type: 'BUTTON_ACTION',
        payload: { action: 'refine', stage: this.state.currentStage }
      });
    }
    
    // Ambiguous response
    return {
      message: "I'm not sure what you'd like to do. Would you like to continue with your answer or refine it?",
      quickReplies: [
        { label: 'Continue', action: 'confirm', icon: 'Check' },
        { label: 'Refine', action: 'refine', icon: 'Edit' }
      ],
      shouldProgress: false
    };
  }
  
  private generateConfirmation(value: string, stage: string): string {
    // CONCISE confirmations only
    const confirmations: Record<string, string[]> = {
      'IDEATION_BIG_IDEA': [
        `"${value}" - powerful concept! Ready for your Essential Question?`,
        `Love it! "${value}" will guide everything. Shall we continue?`
      ],
      'IDEATION_EQ': [
        `"${value}" - that will spark deep thinking! Ready for the Challenge?`,
        `Perfect question! Let's design the challenge next.`
      ],
      'IDEATION_CHALLENGE': [
        `"${value}" - students will love this! Ready to map the journey?`,
        `Authentic and engaging! Let's plan how they'll get there.`
      ]
    };
    
    const options = confirmations[stage] || [`Got it: "${value}". Ready to continue?`];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private generateIdeas(stage: string): string {
    // Return ONLY the ideas, no preamble
    const ideas = this.getStageSpecificIdeas(stage);
    return ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n');
  }
  
  private getStageSpecificIdeas(stage: string): string[] {
    // This would pull from the context-aware idea generator
    const ideaMap: Record<string, string[]> = {
      'IDEATION_BIG_IDEA': [
        'Movement as self-discovery',
        'Physical literacy as life foundation',
        'Sport as community builder',
        'Wellness as holistic practice',
        'Competition as character development'
      ],
      'IDEATION_EQ': [
        'How does physical activity shape who we become?',
        'In what ways do sports reflect cultural values?',
        'Why do some movements feel more natural than others?',
        'How can physical challenges teach life lessons?',
        'What role should competition play in education?'
      ],
      'IDEATION_CHALLENGE': [
        'Design a new sport that addresses a community need',
        'Create a fitness program for a specific population',
        'Develop a movement curriculum for younger students',
        'Build a campaign promoting inclusive physical activity',
        'Document the cultural history of a local sport'
      ]
    };
    
    return ideaMap[stage] || ['No ideas available for this stage'];
  }
  
  private validateInput(text: string, stage: string): ValidationResult {
    // Implement stage-specific validation
    // This would use the validation system we created
    return {
      isValid: true,
      processedValue: text,
      guidance: ''
    };
  }
  
  private getStageActions(stage: string): QuickReply[] {
    // Consistent action buttons based on stage
    if (stage.includes('_INITIATOR')) {
      return [
        { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    return [
      { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
      { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
      { label: 'Help', action: 'help', icon: 'HelpCircle' }
    ];
  }
  
  private handleSystemEvent(event: ChatEvent): ChatResponse {
    // Handle system events like stage transitions
    return {
      message: '',
      quickReplies: [],
      shouldProgress: false
    };
  }
}

export interface ChatResponse {
  message: string;
  quickReplies: QuickReply[];
  shouldProgress: boolean;
  metadata?: any;
}

export interface QuickReply {
  label: string;
  action: string;
  icon: string;
}

export interface ValidationResult {
  isValid: boolean;
  processedValue: string;
  guidance: string;
}