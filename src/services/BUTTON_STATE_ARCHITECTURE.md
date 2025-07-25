# Button State Architecture - Centralized Management System

## Overview

This document describes the centralized button state management system implemented to solve persistent button/card rendering issues in ProjectCraft.

## Problems Solved

1. **Multiple State Sources**: Previously, button states were scattered across messages, component state, and conversation state
2. **Race Conditions**: Async updates without proper queuing caused buttons to show incorrect states
3. **Inconsistent Behavior**: Different code paths for buttons vs cards led to unpredictable behavior
4. **No State Cleanup**: Transitions between stages left stale button states

## Architecture Components

### 1. ButtonStateManager (Single Source of Truth)

Located in: `src/services/button-state-manager.ts`

- Singleton service that manages ALL button states
- Event-driven architecture with queued processing
- Pre-defined button configurations for all stages
- State transition tracking and history

Key features:
- Event queue prevents race conditions
- Immutable state updates
- Complete button registry for all possible states
- Automatic cleanup between transitions

### 2. ChatEventHandler (Centralized Event Processing)

Located in: `src/services/chat-event-handler.ts`

- Processes ALL user interactions (buttons, cards, text)
- Maintains conversation context
- Handles state transitions consistently
- Queues events to prevent conflicts

Key features:
- Serial event processing
- Unified handling for all interaction types
- Context-aware responses
- Automatic retry for failed events

### 3. useButtonState Hook (React Integration)

Located in: `src/hooks/useButtonState.ts`

- Clean React interface to ButtonStateManager
- Automatic subscription to state changes
- Handles loading states and animations
- Context-aware button rendering

## Implementation Flow

### Card Selection Flow:
1. User clicks card → `handleCardSelection` called
2. Event created with type `CARD_SELECTION`
3. ChatEventHandler processes event
4. ButtonStateManager updates to `card_confirmation` context
5. Confirmation buttons appear
6. User confirms → state captured and progression triggered

### Button Click Flow:
1. User clicks button → button state set to `loading`
2. Event queued in ChatEventHandler
3. Action processed based on type
4. ButtonStateManager updated with new state
5. UI reflects changes immediately

### Text Input Flow:
1. User enters text → validated
2. If valid, confirmation context activated
3. Same confirmation flow as cards
4. Consistent behavior across all inputs

## Button Configuration Registry

### Stage: IDEATION_INITIATOR
- **Context: default**
  - "Let's Begin" (primary)
  - "Tell Me More" (secondary)

### Stage: IDEATION_* (Big Idea, EQ, Challenge)
- **Context: default**
  - "Ideas"
  - "What-If"
  - "Help"
- **Context: confirmation**
  - "Perfect, let's continue!" (primary)
  - "Let me refine this" (secondary)
- **Context: card_confirmation**
  - "Perfect, let's continue!" (primary)
  - "Actually, let me choose differently" (secondary)

### Stage: JOURNEY_*
- **Context: default**
  - "Ideas"
  - "What-If"
  - "View Map"
  - "Help"

### Stage: DELIVERABLES_*
- **Context: default**
  - "Ideas"
  - "Templates"
  - "Help"

### Stage: COMPLETE
- **Context: default**
  - "Publish" (primary)
  - "Review Journey" (secondary)

## Usage in ChatV5

```typescript
// Initialize button state
const { buttons } = useButtonState({
  stage: currentState,
  context: buttonContext,
  onButtonClick: handleButtonAction
});

// Render buttons
{buttons.map((button) => (
  <AnimatedButton
    key={button.id}
    onClick={() => buttonStateManager.updateButtonState(groupId, button.id, 'loading')}
    variant={button.variant}
    disabled={button.state === 'disabled'}
  >
    {button.label}
  </AnimatedButton>
))}
```

## Key Benefits

1. **Single Source of Truth**: All button states managed centrally
2. **Predictable Behavior**: Same code path for all interactions
3. **No Race Conditions**: Event queue ensures serial processing
4. **Easy Debugging**: State history and event tracking
5. **Maintainable**: Clear separation of concerns
6. **Extensible**: Easy to add new button states or contexts

## Testing

Use `ButtonStateTest.tsx` component to verify:
- Button state transitions
- Context switching
- Event processing
- State cleanup

## Migration Notes

When updating from old system:
1. Remove all `quickReplies` from messages
2. Remove local button state management
3. Use `buttonContext` state to control which buttons show
4. All button clicks go through `ChatEventHandler`
5. Let `ButtonStateManager` handle all state updates