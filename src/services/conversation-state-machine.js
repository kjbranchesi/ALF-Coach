// Conversation State Machine for Chat Flow
// Manages the conversation flow according to SOP v1.0

import { 
  CHAT_STAGES, 
  QUICK_REPLIES, 
  STAGE_INITIATORS,
  STAGE_CLARIFIERS,
  EDGE_CASE_HANDLERS,
  EDGE_CASE_RESPONSES
} from '../lib/chat-flow-config';

export class ConversationStateMachine {
  constructor() {
    this.currentStage = null;
    this.currentStep = null;
    this.currentPhase = 'welcome'; // welcome | entry | awaiting | clarifier | transition
    this.capturedData = {};
    this.pendingValue = null;
    this.conversationHistory = [];
    this.stageOrder = ['IDEATION', 'JOURNEY', 'DELIVERABLES'];
    this.currentStageIndex = 0;
  }

  // Initialize the conversation
  initialize(wizardData) {
    this.wizardData = wizardData;
    this.currentStage = 'IDEATION';
    this.currentStep = null;
    this.currentPhase = 'stage_init';
    return this.getStateUpdate();
  }

  // Get current state for UI
  getCurrentState() {
    return {
      stage: this.currentStage,
      step: this.currentStep,
      phase: this.currentPhase,
      capturedData: this.capturedData,
      progress: this.calculateProgress()
    };
  }

  // Calculate overall progress
  calculateProgress() {
    let completedSteps = 0;
    let totalSteps = 0;

    this.stageOrder.forEach(stageId => {
      const stage = CHAT_STAGES[stageId];
      totalSteps += stage.steps.length;
      
      stage.steps.forEach(step => {
        if (this.capturedData[step.storeKey]) {
          completedSteps++;
        }
      });
    });

    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100),
      currentStep: completedSteps + 1
    };
  }

  // Process user input
  processInput(input, actionType = 'text') {
    // Handle edge cases first
    const edgeCase = this.detectEdgeCase(input);
    if (edgeCase && actionType === 'text') {
      return this.handleEdgeCase(edgeCase, input);
    }

    // Handle different action types
    switch (actionType) {
      case 'start':
        return this.handleStart();
      case 'continue':
        return this.handleContinue();
      case 'refine':
        return this.handleRefine();
      case 'help':
        return this.handleHelp();
      case 'ideas':
        return this.handleIdeas();
      case 'whatif':
        return this.handleWhatIf();
      case 'text':
        return this.handleTextInput(input);
      case 'card_select':
        return this.handleCardSelection(input);
      case 'edit':
        return this.handleEdit(input);
      case 'proceed':
        return this.handleProceed();
      default:
        return this.getStateUpdate();
    }
  }

  // Detect edge cases
  detectEdgeCase(input) {
    if (EDGE_CASE_HANDLERS.ramble(input)) return 'ramble';
    if (EDGE_CASE_HANDLERS.confusion(input)) return 'confusion';
    if (EDGE_CASE_HANDLERS.multiple(input)) return 'multiple';
    if (EDGE_CASE_HANDLERS.blank(input)) return 'blank';
    if (EDGE_CASE_HANDLERS.skip(input)) return 'skip';
    return null;
  }

  // Handle edge cases
  handleEdgeCase(edgeCase, input) {
    return {
      ...this.getStateUpdate(),
      message: {
        content: EDGE_CASE_RESPONSES[edgeCase],
        metadata: {
          edgeCase: true,
          quickReplies: QUICK_REPLIES.standard
        }
      }
    };
  }

  // Handle start action
  handleStart() {
    if (this.currentPhase === 'stage_init') {
      // Move to first step of current stage
      const stage = CHAT_STAGES[this.currentStage];
      this.currentStep = stage.steps[0].id;
      this.currentPhase = 'entry';
      
      return {
        ...this.getStateUpdate(),
        message: this.generateEntryPrompt()
      };
    }
    return this.getStateUpdate();
  }

  // Handle continue action
  handleContinue() {
    if (this.currentPhase === 'clarifier' && this.pendingValue) {
      // Save the value
      const step = this.getCurrentStepConfig();
      this.capturedData[step.storeKey] = this.pendingValue;
      this.pendingValue = null;
      
      // Move to next step or stage
      return this.advanceToNext();
    }
    return this.getStateUpdate();
  }

  // Handle refine action
  handleRefine() {
    if (this.currentPhase === 'clarifier') {
      this.currentPhase = 'entry';
      this.pendingValue = null;
      
      return {
        ...this.getStateUpdate(),
        message: {
          content: "Of course! Feel free to refine your answer.",
          metadata: {
            quickReplies: QUICK_REPLIES.standard
          }
        }
      };
    }
    return this.getStateUpdate();
  }

  // Handle help action
  handleHelp() {
    const step = this.getCurrentStepConfig();
    const helpContent = this.generateHelpContent(step);
    
    return {
      ...this.getStateUpdate(),
      message: {
        content: helpContent,
        metadata: {
          quickReplies: this.currentPhase === 'clarifier' 
            ? QUICK_REPLIES.confirmation 
            : QUICK_REPLIES.standard
        }
      }
    };
  }

  // Handle ideas action
  handleIdeas() {
    const ideas = this.generateIdeas();
    
    return {
      ...this.getStateUpdate(),
      message: {
        content: "Here are some ideas tailored to your context:",
        metadata: {
          showCards: true,
          cardType: 'ideas',
          cardOptions: ideas,
          quickReplies: []
        }
      }
    };
  }

  // Handle what-if action
  handleWhatIf() {
    const whatIfs = this.generateWhatIfs();
    
    return {
      ...this.getStateUpdate(),
      message: {
        content: "Here are some thought-provoking scenarios:",
        metadata: {
          showCards: true,
          cardType: 'whatif',
          cardOptions: whatIfs,
          quickReplies: []
        }
      }
    };
  }

  // Handle text input
  handleTextInput(input) {
    if (this.currentPhase === 'entry' || this.currentPhase === 'awaiting') {
      this.pendingValue = input;
      this.currentPhase = 'clarifier';
      
      const step = this.getCurrentStepConfig();
      const clarifierMessage = step.promptTemplate(this.getContext()).clarifier(input);
      
      return {
        ...this.getStateUpdate(),
        message: {
          content: clarifierMessage,
          metadata: {
            quickReplies: QUICK_REPLIES.confirmation
          }
        }
      };
    }
    return this.getStateUpdate();
  }

  // Handle card selection
  handleCardSelection(selection) {
    return this.handleTextInput(selection.title || selection.content);
  }

  // Handle edit command
  handleEdit(stepId) {
    // Find the step and set it as current
    for (const [stageId, stage] of Object.entries(CHAT_STAGES)) {
      const step = stage.steps.find(s => s.id === stepId);
      if (step) {
        this.currentStage = stageId;
        this.currentStep = step.id;
        this.currentPhase = 'entry';
        
        return {
          ...this.getStateUpdate(),
          message: this.generateEntryPrompt()
        };
      }
    }
    
    return {
      ...this.getStateUpdate(),
      message: {
        content: "I couldn't find that step. Please check the step ID.",
        metadata: {
          quickReplies: []
        }
      }
    };
  }

  // Handle proceed command
  handleProceed() {
    if (this.currentPhase === 'stage_complete') {
      return this.advanceToNextStage();
    }
    return this.getStateUpdate();
  }

  // Advance to next step or stage
  advanceToNext() {
    const stage = CHAT_STAGES[this.currentStage];
    const currentStepIndex = stage.steps.findIndex(s => s.id === this.currentStep);
    
    if (currentStepIndex < stage.steps.length - 1) {
      // Move to next step in current stage
      this.currentStep = stage.steps[currentStepIndex + 1].id;
      this.currentPhase = 'entry';
      
      return {
        ...this.getStateUpdate(),
        message: this.generateEntryPrompt()
      };
    } else {
      // Stage complete
      this.currentPhase = 'stage_complete';
      
      return {
        ...this.getStateUpdate(),
        message: {
          content: STAGE_CLARIFIERS[this.currentStage](this.getStageData()),
          metadata: {
            quickReplies: []
          }
        }
      };
    }
  }

  // Advance to next stage
  advanceToNextStage() {
    this.currentStageIndex++;
    
    if (this.currentStageIndex < this.stageOrder.length) {
      this.currentStage = this.stageOrder[this.currentStageIndex];
      this.currentStep = null;
      this.currentPhase = 'stage_init';
      
      return {
        ...this.getStateUpdate(),
        message: {
          content: STAGE_INITIATORS[this.currentStage](this.getContext()),
          metadata: {
            quickReplies: []
          }
        }
      };
    } else {
      // Journey complete!
      this.currentPhase = 'complete';
      
      return {
        ...this.getStateUpdate(),
        message: {
          content: "Congratulations! Your blueprint is complete. Ready to review and export?",
          metadata: {
            quickReplies: []
          }
        }
      };
    }
  }

  // Generate entry prompt for current step
  generateEntryPrompt() {
    const step = this.getCurrentStepConfig();
    const context = this.getContext();
    const entryPrompt = step.promptTemplate(context).entry;
    
    return {
      content: entryPrompt,
      metadata: {
        stage: this.currentStage,
        step: this.currentStep,
        quickReplies: QUICK_REPLIES.standard
      }
    };
  }

  // Generate help content
  generateHelpContent(step) {
    return `**Understanding ${step.label}**
    
${step.objective}

**Tips:**
• Be specific and concrete
• Think about your ${this.wizardData.ageGroup} students
• Consider your ${this.wizardData.location} context

Need more guidance? Try the Ideas or What-If buttons for examples.`;
  }

  // Generate contextual ideas
  generateIdeas() {
    const step = this.getCurrentStepConfig();
    const context = this.getContext();
    
    // This would connect to your idea generation system
    // For now, returning placeholder ideas
    return [
      { id: '1', title: `Example ${step.label} 1`, description: 'Tailored to your context' },
      { id: '2', title: `Example ${step.label} 2`, description: 'Another possibility' },
      { id: '3', title: `Example ${step.label} 3`, description: 'Creative option' }
    ];
  }

  // Generate what-if scenarios
  generateWhatIfs() {
    const step = this.getCurrentStepConfig();
    
    return [
      { id: '1', title: `What if students led the ${step.label}?`, description: 'Flip the script' },
      { id: '2', title: `What if this connected to current events?`, description: 'Make it timely' }
    ];
  }

  // Get current step configuration
  getCurrentStepConfig() {
    const stage = CHAT_STAGES[this.currentStage];
    return stage.steps.find(s => s.id === this.currentStep);
  }

  // Get context for prompts
  getContext() {
    return {
      ...this.wizardData,
      ...this.capturedData,
      bigIdea: this.capturedData['ideation.bigIdea'],
      essentialQuestion: this.capturedData['ideation.essentialQuestion'],
      challenge: this.capturedData['ideation.challenge']
    };
  }

  // Get data for current stage
  getStageData() {
    const data = {};
    const stage = CHAT_STAGES[this.currentStage];
    
    stage.steps.forEach(step => {
      const keys = step.storeKey.split('.');
      let value = this.capturedData[step.storeKey];
      
      if (keys[0] === 'ideation') {
        data[keys[1]] = value;
      } else if (keys[0] === 'journey') {
        if (!data[keys[1]]) data[keys[1]] = [];
        if (value) data[keys[1]].push(value);
      } else if (keys[0] === 'deliverables') {
        if (!data[keys[1]]) data[keys[1]] = {};
        if (value) {
          if (keys[2]) {
            data[keys[1]][keys[2]] = value;
          } else {
            data[keys[1]] = value;
          }
        }
      }
    });
    
    return data;
  }

  // Get state update for UI
  getStateUpdate() {
    return {
      state: this.getCurrentState(),
      needsInput: this.currentPhase === 'entry' || this.currentPhase === 'awaiting',
      canProceed: this.currentPhase === 'stage_complete',
      isComplete: this.currentPhase === 'complete'
    };
  }
}

// Singleton instance
let instance = null;

export function getConversationStateMachine() {
  if (!instance) {
    instance = new ConversationStateMachine();
  }
  return instance;
}