# ProjectCraft Chat Refactoring Plan

## Core Problems Identified

1. **Event Handling Confusion**
   - Card clicks processed as text input
   - No distinction between interaction types
   - Button actions appearing as messages

2. **State Management Failures**
   - No tracking of captured values
   - Stage transitions broken
   - Confirmation states persisting incorrectly

3. **Response Generation Issues**
   - Essay-length responses (300+ words)
   - No context awareness
   - Lost sense of purpose

4. **Visual Feedback Missing**
   - No clear progress indication
   - Journey Summary not working
   - Can't see what's been captured

## Architectural Solution

### 1. Event-Driven Architecture
```typescript
// Every interaction is an event with clear type
interface ChatEvent {
  type: 'CARD_CLICK' | 'TEXT_INPUT' | 'BUTTON_CLICK' | 'SYSTEM'
  payload: any
  metadata: EventMetadata
}

// Process events uniformly
class EventProcessor {
  async process(event: ChatEvent): Promise<Response>
}
```

### 2. Explicit State Machine
```typescript
interface JourneyState {
  stage: StageType
  captures: Map<StageType, CapturedValue>
  pendingAction?: PendingAction
  conversationDepth: number
}

// Clear state transitions
class JourneyStateMachine {
  canTransition(from: StageType, to: StageType): boolean
  transition(to: StageType): void
  getCapturedValue(stage: StageType): string | undefined
}
```

### 3. Response Length Control
```typescript
enum ResponseLength {
  CONFIRMATION = 40,      // "Great choice! Ready to continue?"
  GUIDANCE = 80,          // Brief help/validation
  EXPLANATION = 120,      // When detail needed
  MAXIMUM = 150          // Absolute limit
}
```

### 4. Visual Progress System
```typescript
interface ProgressDisplay {
  currentStage: StageInfo
  capturedValues: CapturedValue[]
  nextSteps: string[]
  canEdit: (stage: StageType) => boolean
}
```

## Implementation Steps

### Phase 1: Core Event System (2 hours)
1. Create `ChatEventProcessor` class
2. Implement event type detection
3. Route events to appropriate handlers
4. Test with card clicks vs text input

### Phase 2: State Management (2 hours)
1. Build `JourneyStateMachine` 
2. Implement capture tracking
3. Fix stage transitions
4. Add state persistence

### Phase 3: Response Control (1 hour)
1. Implement response length limits
2. Create context-aware templates
3. Add brevity enforcement
4. Test all response types

### Phase 4: UI Components (2 hours)
1. Fix IdeaCardsV2 to emit proper events
2. Create CapturedProgress component
3. Update button handlers
4. Implement visual feedback

### Phase 5: Integration (1 hour)
1. Replace current ChatV4 logic
2. Migrate existing features
3. Test full flow
4. Fix edge cases

## Key Changes

### Before:
```typescript
// Confusing - is this a card click or text?
handleSendMessage("Physical Education as transformation")

// Long responses
"That's a fantastic choice! When we think about PE as transformation..."
// (300+ words)
```

### After:
```typescript
// Clear event
eventProcessor.process({
  type: 'CARD_CLICK',
  payload: { value: "Physical Education as transformation" }
})

// Concise response
"'Physical Education as transformation' - powerful lens! Ready for your Essential Question?"
// (12 words)
```

## Success Metrics

1. **Card clicks never appear as user messages**
2. **Stage progression works 100% of the time**
3. **No response exceeds 150 words**
4. **Users can see all captured values**
5. **Refinement flows work correctly**
6. **No infinite loops or stuck states**

## Migration Strategy

1. Build new system alongside existing
2. Create feature flag for testing
3. Migrate one stage at a time
4. Run parallel testing
5. Full cutover when stable

## Testing Plan

1. **Unit Tests**
   - Event processing
   - State transitions
   - Response length enforcement

2. **Integration Tests**
   - Full journey flow
   - Card selections
   - Refinement paths

3. **User Tests**
   - Complete blueprint creation
   - Edit previous stages
   - Error recovery

## Timeline

- Day 1: Event system + State management
- Day 2: Response control + UI components  
- Day 3: Integration + Testing
- Day 4: Migration + Deployment

This refactoring will create a robust, predictable system that:
- Clearly handles different interaction types
- Maintains proper state
- Generates appropriate responses
- Provides visual feedback
- Enables smooth progression