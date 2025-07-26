# ALF Coach AI-Guided Conversation Refactoring Plan

## Executive Summary

The ALF Coach system currently relies on prebuilt template responses for the main conversation flow, with AI (Gemini) only generating suggestion cards. This creates a disconnected, looping experience where context is lost between interactions. This plan outlines a comprehensive refactoring to transform the system into a truly AI-guided conversation while maintaining the SOP structure.

## Current Architecture Analysis

### Core Issues Identified

1. **Template-Based Main Flow**
   - `getStageInitContent()`: Returns hardcoded stage introduction templates
   - `getStepEntryContent()`: Returns fixed prompts for each step
   - `addConfirmationMessage()`: Uses static confirmation template
   - Help messages are prewritten in `generateHelpContent()`

2. **Limited AI Integration**
   - AI only generates Ideas/What-If suggestion cards
   - No AI involvement in main conversation flow
   - Context is only partially passed to AI for suggestions
   - AI responses are constrained to specific formats

3. **Context Loss**
   - Each interaction is isolated
   - Previous selections don't inform future responses
   - No progressive building of understanding
   - Static responses regardless of user's specific needs

4. **Rigid Flow Control**
   - Fixed state machine progression
   - No adaptive pathways based on user responses
   - Cannot handle edge cases or unique situations
   - Limited ability to clarify or explore tangents

## Proposed Architecture

### 1. AI Conversation Manager

Create a new `AIConversationManager` class that:
- Maintains full conversation context
- Generates all responses through AI
- Ensures SOP compliance through structured prompts
- Handles state transitions intelligently

```typescript
interface AIConversationManager {
  generateResponse(
    action: string,
    userInput?: string,
    currentState: ChatState,
    conversationHistory: ChatMessage[]
  ): Promise<AIResponse>;
  
  validateSOPCompliance(response: AIResponse): boolean;
  enhanceWithContext(prompt: string, state: ChatState): string;
}
```

### 2. Context-Aware Prompting System

Replace static templates with dynamic prompt generation:

```typescript
interface PromptGenerator {
  buildSystemPrompt(sopStage: string, stepRequirements: StepRequirement[]): string;
  buildConversationPrompt(
    action: string,
    history: ChatMessage[],
    userData: UserData,
    currentProgress: Progress
  ): string;
}
```

### 3. SOP Enforcement Layer

Ensure AI responses comply with the 10-step structure:

```typescript
interface SOPValidator {
  checkStepRequirements(response: string, currentStep: SOPStep): ValidationResult;
  suggestCorrections(response: string, requirements: StepRequirement[]): string;
  enforceProgressionRules(currentState: ChatState, proposedAction: string): boolean;
}
```

## Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Create AI Infrastructure
- [ ] Build `AIConversationManager` class
- [ ] Implement conversation context tracking
- [ ] Create prompt template system
- [ ] Set up response validation framework

#### 1.2 Develop Prompt Engineering
- [ ] Design system prompts for each SOP stage
- [ ] Create context injection mechanisms
- [ ] Build response format specifications
- [ ] Implement fallback handling

### Phase 2: Core Refactoring (Week 2-3)

#### 2.1 Replace Template Methods
- [ ] Refactor `getStageInitContent()` to use AI
- [ ] Convert `getStepEntryContent()` to AI-driven
- [ ] Update `addConfirmationMessage()` for dynamic generation
- [ ] Transform help content to contextual AI responses

#### 2.2 Enhance State Management
- [ ] Add conversation memory to ChatState
- [ ] Implement context window management
- [ ] Create state persistence for AI context
- [ ] Build recovery mechanisms for AI failures

### Phase 3: Advanced Features (Week 4)

#### 3.1 Contextual Intelligence
- [ ] Implement progressive context building
- [ ] Add user preference learning
- [ ] Create adaptive response generation
- [ ] Build clarification request system

#### 3.2 Quality Assurance
- [ ] Implement SOP compliance monitoring
- [ ] Add response quality metrics
- [ ] Create A/B testing framework
- [ ] Build feedback collection system

## Technical Implementation Details

### 1. AI Response Generation Flow

```typescript
async function generateAIResponse(action: string, context: ConversationContext): Promise<ChatMessage> {
  // 1. Build comprehensive prompt
  const systemPrompt = buildSystemPrompt(context.currentStage, context.sopRequirements);
  const userPrompt = buildUserPrompt(action, context.history, context.userData);
  
  // 2. Generate AI response
  const aiResponse = await geminiModel.generateContent({
    systemPrompt,
    userPrompt,
    temperature: 0.7,
    maxTokens: 800
  });
  
  // 3. Validate SOP compliance
  const validation = validateSOPCompliance(aiResponse, context.currentStep);
  if (!validation.isValid) {
    aiResponse = await regenerateWithGuidance(aiResponse, validation.corrections);
  }
  
  // 4. Format and return
  return formatAIResponse(aiResponse, context.metadata);
}
```

### 2. Context Management

```typescript
class ConversationContextManager {
  private contextWindow: ChatMessage[] = [];
  private readonly maxContextSize = 10;
  
  addToContext(message: ChatMessage): void {
    this.contextWindow.push(message);
    if (this.contextWindow.length > this.maxContextSize) {
      this.contextWindow = this.summarizeAndTruncate(this.contextWindow);
    }
  }
  
  getRelevantContext(action: string): ChatMessage[] {
    // Return context relevant to current action
    return this.contextWindow.filter(msg => 
      this.isRelevantToAction(msg, action)
    );
  }
}
```

### 3. SOP Compliance System

```typescript
const SOPRequirements = {
  IDEATION: {
    BIG_IDEA: {
      mustInclude: ['transferable concept', 'real-world connection'],
      tone: 'inspiring and expansive',
      length: '2-3 paragraphs',
      nextSteps: ['ask for Essential Question']
    },
    // ... other steps
  }
};

function enforceSOPStructure(response: string, requirements: StepRequirement): string {
  // Ensure response meets all requirements
  const enhanced = response;
  requirements.mustInclude.forEach(element => {
    if (!response.includes(element)) {
      enhanced = injectRequiredElement(enhanced, element);
    }
  });
  return enhanced;
}
```

## Risk Mitigation

### 1. AI Response Quality
- **Risk**: AI generates off-topic or inappropriate responses
- **Mitigation**: 
  - Strict prompt engineering with examples
  - Response validation layer
  - Fallback to enhanced templates if needed
  - Human review of edge cases

### 2. SOP Compliance
- **Risk**: AI deviates from the 10-step structure
- **Mitigation**:
  - Explicit SOP requirements in every prompt
  - Post-generation validation
  - Correction loop for non-compliant responses
  - Hard stops at stage boundaries

### 3. Performance & Latency
- **Risk**: AI responses are slow, impacting UX
- **Mitigation**:
  - Streaming responses where possible
  - Pregenerate common pathways
  - Smart caching of similar contexts
  - Optimistic UI updates

### 4. Context Overflow
- **Risk**: Conversation context exceeds AI limits
- **Mitigation**:
  - Intelligent context summarization
  - Relevance-based context selection
  - Hierarchical context storage
  - Graceful degradation

## Success Metrics

1. **Conversation Quality**
   - Context retention score (0-100)
   - Response relevance rating
   - User satisfaction metrics
   - Completion rates

2. **SOP Compliance**
   - Step requirement fulfillment (%)
   - Structure adherence score
   - Time per stage metrics
   - Error/correction rates

3. **User Experience**
   - Response time (< 2 seconds)
   - Conversation flow rating
   - Context understanding score
   - Personalization effectiveness

## Migration Strategy

### Phase 1: Parallel Implementation
- Build new AI system alongside existing templates
- A/B test with small user group
- Collect metrics and feedback
- Iterate on prompt engineering

### Phase 2: Gradual Rollout
- Start with less critical responses (help, clarifications)
- Move to step entry messages
- Finally replace stage init and confirmations
- Monitor each transition carefully

### Phase 3: Full Migration
- Switch all users to AI-guided system
- Maintain template fallbacks for emergencies
- Continue optimization based on data
- Document learnings and best practices

## Conclusion

This refactoring will transform ALF Coach from a rigid, template-based system to an intelligent, context-aware AI guide that maintains the proven SOP structure while providing personalized, adaptive conversations. The phased approach ensures minimal disruption while maximizing the benefits of AI-guided interaction.

The key to success will be careful prompt engineering, robust validation systems, and continuous monitoring to ensure the AI enhances rather than compromises the educational experience.