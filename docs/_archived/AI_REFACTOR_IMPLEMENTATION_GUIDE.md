# [ARCHIVED] AI Refactor Implementation Guide

> Archived for reference. The current implementation is summarized in `docs/AI_IMPLEMENTATION_SUMMARY.md`.

## Quick Start: What Changed

### Before (Template-Based)
```typescript
private getStageInitContent(stage: ChatStage): string {
  const templates = {
    IDEATION: `**Welcome to the Ideation Stage**...`, // Static template
    JOURNEY: `**Welcome to the Journey Design Stage**...`, // Static template
    DELIVERABLES: `**Welcome to the Deliverables Stage**...` // Static template
  };
  return templates[stage] || '';
}
```

### After (AI-Guided)
```typescript
private async getStageInitContent(stage: ChatStage): Promise<string> {
  return await this.aiManager.generateResponse({
    action: 'stage_init',
    stage,
    context: this.getFullContext(),
    requirements: this.sopValidator.getStageRequirements(stage)
  });
}
```

## Step-by-Step Implementation

### Step 1: Create AI Manager Service

Create `/src/services/ai-conversation-manager.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, ChatState, ChatStage } from './chat-service';

export interface AIGenerationRequest {
  action: string;
  stage?: ChatStage;
  step?: string;
  userInput?: string;
  context: ConversationContext;
  requirements?: SOPRequirement[];
}

export interface ConversationContext {
  messages: ChatMessage[];
  userData: any;
  capturedData: Record<string, any>;
  currentPhase: string;
}

export interface SOPRequirement {
  type: 'include' | 'tone' | 'structure' | 'length';
  value: string;
  priority: 'must' | 'should' | 'nice';
}

export class AIConversationManager {
  private model: any;
  private contextWindow: ChatMessage[] = [];
  
  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  async generateResponse(request: AIGenerationRequest): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(request);
    const conversationContext = this.buildConversationContext(request);
    
    try {
      const prompt = `${systemPrompt}\n\n${conversationContext}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Validate and enhance if needed
      return this.validateAndEnhance(text, request.requirements || []);
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to enhanced template
      return this.generateEnhancedTemplate(request);
    }
  }

  private buildSystemPrompt(request: AIGenerationRequest): string {
    const basePrompt = `You are ALF Coach, an expert educational guide helping educators design transformative learning experiences using the Active Learning Framework.

CRITICAL INSTRUCTIONS:
1. You MUST follow the SOP structure strictly - there are 10 steps across 3 stages (Ideation, Journey, Deliverables)
2. Always maintain an encouraging, professional tone
3. Build on previous context - reference what the user has already shared
4. Make responses feel natural and conversational, not templated
5. Current action: ${request.action}
${request.stage ? `6. Current stage: ${request.stage}` : ''}
${request.step ? `7. Current step: ${request.step}` : ''}`;

    // Add specific requirements based on action
    const actionPrompts = this.getActionSpecificPrompts(request.action);
    
    return `${basePrompt}\n\n${actionPrompts}`;
  }

  private buildConversationContext(request: AIGenerationRequest): string {
    const { context } = request;
    
    // Get recent relevant messages
    const recentMessages = context.messages.slice(-5).map(m => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    // Add captured data context
    const capturedDataSummary = Object.entries(context.capturedData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    // Add user context
    const userContext = `
User Context:
- Subject: ${context.userData.subject}
- Age Group: ${context.userData.ageGroup}
- Location: ${context.userData.location}

Progress So Far:
${capturedDataSummary}

Recent Conversation:
${recentMessages}

${request.userInput ? `User's current input: "${request.userInput}"` : ''}

Now generate an appropriate response that:
1. Acknowledges what came before
2. Builds on their specific context
3. Guides them naturally to the next step
4. Feels personalized and thoughtful`;

    return userContext;
  }

  private getActionSpecificPrompts(action: string): string {
    const prompts: Record<string, string> = {
      'stage_init': `Generate a welcoming introduction to this stage that:
- Explains what will be accomplished in this stage
- References their previous work (if any)
- Creates excitement about what's coming
- Outlines the 3 steps in this stage
- Ends with encouragement to begin`,
      
      'step_entry': `Generate a prompt that:
- Connects to what they just completed
- Clearly explains what this step is about
- Provides context-specific examples
- Asks them to provide their input
- Offers the Ideas/What-If options naturally`,
      
      'confirm': `Generate a confirmation message that:
- Restates their input positively
- Explains why this is valuable
- Connects it to their overall goal
- Asks if they want to continue or refine
- Maintains momentum`,
      
      'help': `Generate helpful guidance that:
- Addresses their specific situation
- Provides relevant examples from their context
- Offers practical suggestions
- Encourages them to continue
- References available tools (Ideas/What-If)`,
      
      'refine': `Generate a refinement message that:
- Acknowledges their desire to improve
- References their current selection
- Offers specific ways to enhance it
- Maintains their confidence
- Suggests using Ideas/What-If for inspiration`
    };
    
    return prompts[action] || 'Generate an appropriate response based on the context.';
  }

  private validateAndEnhance(response: string, requirements: SOPRequirement[]): string {
    let enhanced = response;
    
    // Check each requirement
    requirements.forEach(req => {
      if (req.type === 'include' && req.priority === 'must') {
        if (!response.toLowerCase().includes(req.value.toLowerCase())) {
          // Add required element
          enhanced = this.injectRequirement(enhanced, req.value);
        }
      }
    });
    
    return enhanced;
  }

  private generateEnhancedTemplate(request: AIGenerationRequest): string {
    // Fallback that's still better than static templates
    // Uses context to personalize even without AI
    const { context, action } = request;
    const subject = context.userData.subject;
    const ageGroup = context.userData.ageGroup;
    
    // Return context-aware template as fallback
    return `Let's continue building your ${subject} project for ${ageGroup} students. ${action}...`;
  }

  updateContext(message: ChatMessage): void {
    this.contextWindow.push(message);
    // Keep last 10 messages for context
    if (this.contextWindow.length > 10) {
      this.contextWindow.shift();
    }
  }
}
```

### Step 2: Create SOP Validator

Create `/src/services/sop-validator.ts`:

```typescript
export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

export class SOPValidator {
  private stageRequirements = {
    IDEATION: {
      BIG_IDEA: [
        { type: 'include', value: 'transferable concept', priority: 'must' },
        { type: 'include', value: 'real-world', priority: 'should' },
        { type: 'tone', value: 'inspiring', priority: 'must' },
        { type: 'length', value: '150-300 words', priority: 'should' }
      ],
      ESSENTIAL_QUESTION: [
        { type: 'include', value: 'open-ended', priority: 'must' },
        { type: 'include', value: 'investigation', priority: 'should' },
        { type: 'structure', value: 'question format', priority: 'must' }
      ],
      CHALLENGE: [
        { type: 'include', value: 'authentic', priority: 'must' },
        { type: 'include', value: 'real-world impact', priority: 'must' },
        { type: 'include', value: 'student action', priority: 'must' }
      ]
    },
    JOURNEY: {
      PHASES: [
        { type: 'include', value: 'progression', priority: 'must' },
        { type: 'include', value: '3-4 phases', priority: 'should' },
        { type: 'structure', value: 'sequential', priority: 'must' }
      ],
      ACTIVITIES: [
        { type: 'include', value: 'hands-on', priority: 'must' },
        { type: 'include', value: 'age-appropriate', priority: 'must' },
        { type: 'include', value: 'collaborative', priority: 'should' }
      ],
      RESOURCES: [
        { type: 'include', value: 'materials', priority: 'must' },
        { type: 'include', value: 'supports', priority: 'should' },
        { type: 'include', value: 'accessible', priority: 'must' }
      ]
    },
    DELIVERABLES: {
      MILESTONES: [
        { type: 'include', value: 'checkpoints', priority: 'must' },
        { type: 'include', value: 'measurable', priority: 'should' },
        { type: 'structure', value: 'timeline', priority: 'should' }
      ],
      RUBRIC: [
        { type: 'include', value: 'criteria', priority: 'must' },
        { type: 'include', value: 'student-friendly', priority: 'must' },
        { type: 'structure', value: 'categories', priority: 'must' }
      ],
      IMPACT: [
        { type: 'include', value: 'audience', priority: 'must' },
        { type: 'include', value: 'authentic sharing', priority: 'must' },
        { type: 'include', value: 'celebration', priority: 'should' }
      ]
    }
  };

  getStageRequirements(stage: string): SOPRequirement[] {
    return this.stageRequirements[stage] || [];
  }

  getStepRequirements(stage: string, step: string): SOPRequirement[] {
    const stageReqs = this.stageRequirements[stage];
    return stageReqs?.[step] || [];
  }

  validateResponse(response: string, stage: string, step: string): ValidationResult {
    const requirements = this.getStepRequirements(stage, step);
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    requirements.forEach(req => {
      if (req.priority === 'must') {
        const isValid = this.checkRequirement(response, req);
        if (!isValid) {
          issues.push(`Missing required element: ${req.value}`);
          suggestions.push(this.getSuggestion(req));
        }
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  private checkRequirement(response: string, req: SOPRequirement): boolean {
    switch (req.type) {
      case 'include':
        return response.toLowerCase().includes(req.value.toLowerCase());
      case 'tone':
        // Simplified tone check - in production, use sentiment analysis
        return true;
      case 'structure':
        if (req.value === 'question format') {
          return response.includes('?');
        }
        return true;
      case 'length':
        const words = response.split(' ').length;
        const [min, max] = req.value.match(/\d+/g)?.map(Number) || [0, 1000];
        return words >= min && words <= max;
      default:
        return true;
    }
  }

  private getSuggestion(req: SOPRequirement): string {
    return `Consider adding content about "${req.value}" to meet SOP requirements.`;
  }
}
```

### Step 3: Refactor ChatService

Update `/src/services/chat-service.ts`:

```typescript
// Add new imports
import { AIConversationManager } from './ai-conversation-manager';
import { SOPValidator } from './sop-validator';

export class ChatService extends EventEmitter {
  private state: ChatState;
  private wizardData: any;
  private blueprintId: string;
  private aiManager: AIConversationManager | null = null;
  private sopValidator: SOPValidator;
  
  constructor(wizardData: any, blueprintId: string) {
    super();
    this.wizardData = wizardData;
    this.blueprintId = blueprintId;
    this.sopValidator = new SOPValidator();
    
    // Initialize AI Manager
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.aiManager = new AIConversationManager(apiKey);
        console.log('AI Conversation Manager initialized');
      } catch (error) {
        console.error('Failed to initialize AI Manager:', error);
      }
    }
    
    // Rest of constructor...
  }

  // REFACTORED: Now uses AI instead of templates
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
    this.aiManager?.updateContext(message);
  }

  // REFACTORED: Now uses AI instead of templates
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
    this.aiManager?.updateContext(message);
  }

  // REFACTORED: Now uses AI for dynamic confirmations
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
        phase: 'step_confirm'
      }
    };
    
    this.state.messages.push(message);
    this.aiManager?.updateContext(message);
  }

  // NEW: Central AI content generation
  private async generateAIContent(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): Promise<string> {
    if (!this.aiManager) {
      // Fallback to enhanced templates
      return this.generateEnhancedTemplate(action, params);
    }
    
    const context = {
      messages: this.state.messages,
      userData: this.wizardData,
      capturedData: this.state.capturedData,
      currentPhase: this.state.phase
    };
    
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
      if (params.step) {
        const validation = this.sopValidator.validateResponse(
          content, 
          this.state.stage, 
          params.step.id
        );
        
        if (!validation.isValid) {
          console.warn('AI response validation issues:', validation.issues);
          // Could regenerate or enhance here
        }
      }
      
      return content;
    } catch (error) {
      console.error('AI generation failed, using enhanced template:', error);
      return this.generateEnhancedTemplate(action, params);
    }
  }

  // NEW: Enhanced templates as fallback (better than static)
  private generateEnhancedTemplate(
    action: string, 
    params: { stage?: ChatStage; step?: any; userInput?: string }
  ): string {
    const { subject, ageGroup, location } = this.wizardData;
    const capturedSoFar = Object.keys(this.state.capturedData).length;
    
    switch (action) {
      case 'stage_init':
        return `Welcome to the ${params.stage} stage! Based on your work with ${subject} for ${ageGroup} students in ${location}, let's ${
          params.stage === 'IDEATION' ? 'establish your conceptual foundation' :
          params.stage === 'JOURNEY' ? 'design the learning progression' :
          'define success metrics and impact'
        }. You've made great progress so far!`;
        
      case 'step_entry':
        const step = params.step;
        return `Now let's work on your ${step.label}. ${
          capturedSoFar > 0 ? `Building on what you've created so far, ` : ''
        }what ideas do you have for this important element of your ${subject} project?`;
        
      case 'confirm':
        return `Excellent choice! "${params.userInput}" is a strong ${params.step?.label || 'selection'} that will serve your ${ageGroup} students well. Shall we continue building on this foundation?`;
        
      default:
        return `Let's continue developing your ${subject} learning experience.`;
    }
  }

  // REFACTORED: Help now uses AI for contextual assistance
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
    this.aiManager?.updateContext(message);
  }

  // REFACTORED: Refine now maintains context
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
    this.aiManager?.updateContext(message);
  }
  
  // Update all async handlers to use await
  private async handleStart(): Promise<void> {
    if (this.state.phase === 'welcome') {
      this.state.phase = 'stage_init';
      await this.addStageInitMessage('IDEATION'); // Now async
    } else if (this.state.phase === 'stage_init') {
      this.state.stepIndex = 0;
      this.state.phase = 'step_entry';
      await this.addStepEntryMessage(); // Now async
    }
  }
  
  // Continue updating other methods similarly...
}
```

### Step 4: Update UI Components

The UI components (ChatInterface.tsx) can remain mostly the same since they're already pure presentation components. The main changes happen in the service layer.

### Step 5: Testing Strategy

Create `/src/services/__tests__/ai-conversation-manager.test.ts`:

```typescript
import { AIConversationManager } from '../ai-conversation-manager';
import { SOPValidator } from '../sop-validator';

describe('AIConversationManager', () => {
  let manager: AIConversationManager;
  let validator: SOPValidator;
  
  beforeEach(() => {
    manager = new AIConversationManager('test-key');
    validator = new SOPValidator();
  });
  
  test('generates contextual stage init message', async () => {
    const response = await manager.generateResponse({
      action: 'stage_init',
      stage: 'IDEATION',
      context: {
        messages: [],
        userData: { subject: 'Science', ageGroup: '6-8', location: 'Boston' },
        capturedData: {},
        currentPhase: 'stage_init'
      }
    });
    
    expect(response).toContain('Science');
    expect(response).toContain('6-8');
    expect(response.length).toBeGreaterThan(100);
  });
  
  test('maintains conversation context', async () => {
    // Add messages to context
    manager.updateContext({
      id: '1',
      role: 'user',
      content: 'I want to focus on environmental science',
      timestamp: new Date()
    });
    
    const response = await manager.generateResponse({
      action: 'step_entry',
      context: {
        messages: [/* previous messages */],
        userData: { subject: 'Science', ageGroup: '6-8', location: 'Boston' },
        capturedData: { 'ideation.bigIdea': 'Climate Action' },
        currentPhase: 'step_entry'
      }
    });
    
    // Should reference previous context
    expect(response).toContain('environmental');
    expect(response).toContain('Climate Action');
  });
});
```

## Migration Checklist

### Phase 1: Setup (Day 1-2)
- [ ] Create AIConversationManager service
- [ ] Create SOPValidator service  
- [ ] Add configuration for AI settings
- [ ] Set up error handling and fallbacks
- [ ] Create test suite

### Phase 2: Core Integration (Day 3-5)
- [ ] Update ChatService constructor
- [ ] Refactor addStageInitMessage() to async
- [ ] Refactor addStepEntryMessage() to async
- [ ] Refactor addConfirmationMessage() to async
- [ ] Update handleHelp() for AI
- [ ] Update handleRefine() for AI
- [ ] Ensure all handlers properly await async calls

### Phase 3: Testing & Refinement (Day 6-7)
- [ ] Test conversation flow end-to-end
- [ ] Verify SOP compliance
- [ ] Check context persistence
- [ ] Test error scenarios
- [ ] Optimize prompts based on output
- [ ] A/B test with users

### Phase 4: Polish (Day 8-10)
- [ ] Add streaming responses
- [ ] Implement caching layer
- [ ] Add analytics
- [ ] Create admin dashboard
- [ ] Document prompt engineering
- [ ] Train team on maintenance

## Common Pitfalls to Avoid

1. **Don't Remove Structure**: The SOP's 10-step structure is proven. AI should enhance, not replace it.

2. **Maintain Fallbacks**: Always have enhanced templates ready when AI fails.

3. **Test Context Limits**: Gemini has token limits. Test with long conversations.

4. **Validate Everything**: AI can hallucinate. Always validate against SOP requirements.

5. **Keep It Fast**: Users expect quick responses. Use streaming and show progress.

6. **Preserve State**: AI responses should respect and build on captured data.

## Monitoring & Optimization

```typescript
// Add to AIConversationManager
private logMetrics(request: AIGenerationRequest, response: string, latency: number) {
  analytics.track('ai_response_generated', {
    action: request.action,
    stage: request.stage,
    responseLength: response.length,
    latency,
    hasContext: request.context.messages.length > 0,
    capturedDataCount: Object.keys(request.context.capturedData).length
  });
}
```

## Final Notes

This refactoring transforms ALF Coach from a static, template-driven system to a dynamic, AI-guided experience while maintaining the proven SOP structure. The key is balancing AI flexibility with structural requirements, ensuring every conversation remains on track while feeling natural and personalized.
