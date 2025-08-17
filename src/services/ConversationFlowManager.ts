/**
 * ConversationFlowManager.ts
 * 
 * Manages the conversation flow from wizard to chat, ensuring smooth handoff
 * and progressive context gathering without repetitive questions
 */

import { ContextTracker } from './ContextTracker';
import { WizardData, ENTRY_POINTS, PBL_EXPERIENCE } from '../features/wizard/wizardSchema';

export type ConversationPhase = 
  | 'wizard'           // In wizard interface
  | 'handoff'          // Transitioning from wizard to chat  
  | 'context_gathering' // Progressively gathering missing context
  | 'project_design'   // Designing the actual project
  | 'refinement'       // Refining and iterating

export type GatheringMethod = 'natural' | 'direct' | 'inference';

export interface ConversationState {
  phase: ConversationPhase;
  contextTracker: ContextTracker;
  lastWizardCompletion?: Date;
  pendingGathering: string[];
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
      gatheredContext?: Record<string, any>;
      phase?: ConversationPhase;
    };
  }>;
}

export class ConversationFlowManager {
  private state: ConversationState;

  constructor(initialWizardData?: Partial<WizardData>) {
    this.state = {
      phase: initialWizardData ? 'handoff' : 'wizard',
      contextTracker: new ContextTracker(initialWizardData),
      pendingGathering: [],
      conversationHistory: []
    };

    // Determine initial phase based on completeness
    if (initialWizardData) {
      this.updatePhaseBasedOnContext();
    }
  }

  /**
   * Handle wizard completion and initiate handoff
   */
  completeWizard(wizardData: WizardData): void {
    this.state.contextTracker.updateWizardData(wizardData, 'wizard');
    this.state.lastWizardCompletion = new Date();
    this.state.phase = 'handoff';
    
    // Generate initial handoff message
    this.generateHandoffMessage();
  }

  /**
   * Generate the handoff message from wizard to chat
   */
  private generateHandoffMessage(): string {
    const context = this.state.contextTracker.getContext();
    const completeness = this.state.contextTracker.getCompleteness();
    const data = context.wizardData;

    let message = "Perfect! I have your initial information. Let me help you design this project.\n\n";

    // Acknowledge what we know
    message += "## Here's what we're working with:\n\n";
    
    if (data.entryPoint) {
      const entryPoint = ENTRY_POINTS[data.entryPoint];
      message += `**Approach:** ${entryPoint.label}\n`;
    }

    if (data.vision) {
      message += `**Learning Vision:** ${data.vision}\n`;
    }

    if (data.drivingQuestion) {
      message += `**Driving Question:** ${data.drivingQuestion}\n`;
    }

    if (data.pblExperience) {
      const experience = PBL_EXPERIENCE[data.pblExperience];
      message += `**Your PBL Experience:** ${experience.label}\n`;
    }

    // Mention optional context if provided
    const optionalContext: string[] = [];
    if (data.subject) optionalContext.push(`Subject: ${data.subject}`);
    if (data.gradeLevel) optionalContext.push(`Grade Level: ${data.gradeLevel}`);
    if (data.duration) optionalContext.push(`Duration: ${data.duration}`);

    if (optionalContext.length > 0) {
      message += `\n**Additional Context:** ${optionalContext.join(' • ')}\n`;
    }

    // Set expectations based on what's missing
    const nextGathering = this.state.contextTracker.getNextGatheringPriorities()
      .filter(p => p.priority === 'medium' || p.priority === 'high');

    if (nextGathering.length > 0) {
      message += "\n---\n\n";
      message += "As we design your project, I may ask for some additional details to make it more tailored to your specific situation.\n\n";
    }

    // Transition to next phase
    message += this.generateTransitionToDesign();

    return message;
  }

  /**
   * Generate transition message to project design
   */
  private generateTransitionToDesign(): string {
    const data = this.state.contextTracker.getContext().wizardData;
    
    if (data.entryPoint === 'goal') {
      return "Let's start by exploring how we can turn your learning vision into an engaging project. What specific learning outcomes or standards should this project address?";
    } else if (data.entryPoint === 'materials') {
      return "Since you have materials to work with, let's think about how to build a meaningful project around them. What materials or resources do you want to incorporate?";
    } else if (data.entryPoint === 'explore') {
      return "Great! Let's explore some project possibilities together. Based on your vision, I can suggest several different project directions. Would you like to see some initial ideas?";
    }

    return "Let's begin designing your project! I'll guide you through creating something engaging and meaningful for your students.";
  }

  /**
   * Process a conversation turn and update context
   */
  processConversationTurn(
    userMessage: string, 
    assistantResponse: string,
    gatheringMethod: GatheringMethod = 'natural'
  ): void {
    const timestamp = new Date();

    // Add user message
    this.state.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp,
      metadata: { phase: this.state.phase }
    });

    // Try to extract context from user message
    const extractedContext = this.extractContextFromMessage(userMessage);
    if (Object.keys(extractedContext).length > 0) {
      this.state.contextTracker.updateWizardData(extractedContext, 'conversation');
    }

    // Add assistant response
    this.state.conversationHistory.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp,
      metadata: { 
        phase: this.state.phase,
        gatheredContext: extractedContext
      }
    });

    // Update phase based on context
    this.updatePhaseBasedOnContext();
  }

  /**
   * Extract context information from user messages
   */
  private extractContextFromMessage(message: string): Partial<WizardData> {
    const extracted: Partial<WizardData> = {};
    const messageLower = message.toLowerCase();

    // Subject detection
    const subjectPatterns = [
      /(?:teaching|teach|subject|class|course)\s+(?:is\s+)?([a-z\s]+?)(?:\s|$|\.|,)/i,
      /(?:in|for)\s+(science|math|english|history|art|music|technology|computer|physics|chemistry|biology|geography|literature)/i,
      /([a-z\s]+?)\s+(?:class|students|grade)/i
    ];

    for (const pattern of subjectPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && !extracted.subject) {
        extracted.subject = match[1].trim();
        break;
      }
    }

    // Grade level detection
    const gradePatterns = [
      /(?:grade\s*)?(\d+)(?:th|st|nd|rd)?\s*grade/i,
      /(?:grades?\s*)?(\d+)\s*-\s*(\d+)/i,
      /(elementary|middle|high|college|university)/i,
      /ages?\s*(\d+)\s*-?\s*(\d+)?/i
    ];

    for (const pattern of gradePatterns) {
      const match = message.match(pattern);
      if (match && !extracted.gradeLevel) {
        if (match[1] && match[2]) {
          extracted.gradeLevel = `Grades ${match[1]}-${match[2]}`;
        } else if (match[1]) {
          if (isNaN(Number(match[1]))) {
            extracted.gradeLevel = match[1];
          } else {
            extracted.gradeLevel = `Grade ${match[1]}`;
          }
        }
        break;
      }
    }

    // Duration detection
    const durationPatterns = [
      /(week|weeks|month|months|semester|quarter|year)/i,
      /(\d+)\s*-?\s*(\d+)?\s*(week|month)/i
    ];

    for (const pattern of durationPatterns) {
      const match = message.match(pattern);
      if (match && !extracted.duration) {
        const timeUnit = match[1] || match[3];
        if (timeUnit.includes('week')) {
          extracted.duration = 'short';
        } else if (timeUnit.includes('month') || timeUnit.includes('quarter')) {
          extracted.duration = 'medium';
        } else if (timeUnit.includes('semester') || timeUnit.includes('year')) {
          extracted.duration = 'long';
        }
        break;
      }
    }

    return extracted;
  }

  /**
   * Update conversation phase based on context completeness
   */
  private updatePhaseBasedOnContext(): void {
    const completeness = this.state.contextTracker.getCompleteness();

    if (completeness.coreCompleteness < 100) {
      this.state.phase = 'context_gathering';
    } else if (this.state.phase === 'handoff' || this.state.phase === 'context_gathering') {
      this.state.phase = 'project_design';
    }
  }

  /**
   * Generate next message with context-aware suggestions
   */
  generateNextMessage(baseMessage: string): string {
    const completeness = this.state.contextTracker.getCompleteness();
    const priorities = this.state.contextTracker.getNextGatheringPriorities();
    
    let enhancedMessage = baseMessage;

    // If we're missing important context, naturally incorporate questions
    if (this.state.phase === 'context_gathering' || this.state.phase === 'project_design') {
      const highPriorityMissing = priorities.filter(p => p.priority === 'high');
      const mediumPriorityMissing = priorities.filter(p => p.priority === 'medium');

      if (highPriorityMissing.length > 0) {
        // For high priority missing info, be more direct
        const missing = highPriorityMissing[0];
        enhancedMessage += `\n\nBefore we continue, ${missing.question}`;
      } else if (mediumPriorityMissing.length > 0 && Math.random() > 0.5) {
        // For medium priority, occasionally ask naturally
        const missing = mediumPriorityMissing[0];
        enhancedMessage += `\n\nBy the way, ${missing.question} This will help me give you more specific suggestions.`;
      }
    }

    return enhancedMessage;
  }

  /**
   * Get current AI prompt context
   */
  getAIPromptContext(): string {
    let context = this.state.contextTracker.generateAIPromptContext();
    
    // Add conversation phase context
    context += `\n=== CONVERSATION STATUS ===\n`;
    context += `Phase: ${this.state.phase}\n`;
    
    if (this.state.lastWizardCompletion) {
      const timeSinceWizard = Date.now() - this.state.lastWizardCompletion.getTime();
      context += `Time since wizard completion: ${Math.round(timeSinceWizard / 1000 / 60)} minutes\n`;
    }

    const recentMessages = this.state.conversationHistory.slice(-4);
    if (recentMessages.length > 0) {
      context += `Recent conversation context available: ${recentMessages.length} messages\n`;
    }

    context += '=====================\n\n';

    return context;
  }

  /**
   * Check if we should transition to a different interface
   */
  shouldTransitionInterface(): { transition: boolean; to?: string; reason?: string } {
    const completeness = this.state.contextTracker.getCompleteness();

    // If we're in wizard phase but have enough context, suggest moving to chat
    if (this.state.phase === 'wizard' && completeness.coreCompleteness >= 75) {
      return {
        transition: true,
        to: 'chat',
        reason: 'Sufficient context gathered to begin project design'
      };
    }

    return { transition: false };
  }

  /**
   * Export state for persistence
   */
  exportState(): any {
    return {
      ...this.state,
      contextTracker: this.state.contextTracker.exportContext()
    };
  }

  /**
   * Import state from persistence
   */
  importState(state: any): void {
    this.state = {
      ...state,
      conversationHistory: state.conversationHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
    
    this.state.contextTracker = new ContextTracker();
    this.state.contextTracker.importContext(state.contextTracker);
  }

  /**
   * Get current state
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Check if ready for project design
   */
  isReadyForProjectDesign(): boolean {
    return this.state.contextTracker.isReadyForProjectDesign();
  }

  /**
   * Get suggestions for next conversation turn
   */
  getConversationSuggestions(): string[] {
    const completeness = this.state.contextTracker.getCompleteness();
    const data = this.state.contextTracker.getContext().wizardData;

    if (this.state.phase === 'project_design') {
      if (data.entryPoint === 'goal') {
        return [
          "What specific learning standards should this project address?",
          "What real-world problems could students explore?",
          "How should students demonstrate their learning?"
        ];
      } else if (data.entryPoint === 'materials') {
        return [
          "Tell me about the materials you want to use",
          "How can we connect these resources to learning goals?",
          "What should students create with these materials?"
        ];
      } else {
        return [
          "Show me some project ideas to explore",
          "What topics might interest my students?",
          "How do successful PBL projects work?"
        ];
      }
    }

    return [
      "Tell me more about your teaching context",
      "What challenges do your students face?",
      "What gets your students excited to learn?"
    ];
  }
}