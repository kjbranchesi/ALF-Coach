# ALF Coach Chatbot-First Implementation Plan

## Critical Mental Model Fix
**TEACHERS DESIGN** the curriculum → **STUDENTS JOURNEY** through the Creative Process

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         CHATBOT (Primary)               │
│   - Conversational flow                 │
│   - Contextual guidance                 │
│   - Adaptive suggestions                │
└─────────────────────────────────────────┘
                ↓ triggers
┌─────────────────────────────────────────┐
│    STAGE INITIATORS (Secondary)         │
│   - Appear at 4 key moments only        │
│   - Optional shortcuts                  │
│   - Auto-dismiss                        │
└─────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Remove Confusion (IMMEDIATE)
- [ ] Remove "What If" cards from Ideation
- [ ] Remove milestone forms that confuse teacher/student roles
- [ ] Clear up "Learning Journey" naming to clarify it's about STUDENT journey

### Phase 2: Chatbot as Main Stage
- [ ] Expand chat area to full width
- [ ] Remove sidebar Stage components
- [ ] Implement conversational flow for all stages
- [ ] Add real-time AI validation and suggestions

### Phase 3: Contextual Stage Initiators
- [ ] Implement 4 key moment cards:
  1. Big Idea confirmation
  2. Essential Question capture
  3. Challenge statement
  4. Phase timeline overview
- [ ] Auto-dismiss after interaction
- [ ] Never block chat flow

### Phase 4: Student Creative Process Design
- [ ] Rename/clarify Learning Journey is about STUDENT journey
- [ ] Implement phase planning (Analyze, Brainstorm, Prototype, Evaluate)
- [ ] Add iteration planning and differentiation
- [ ] Remove teacher milestone confusion

## File Changes Required

### 1. ChatInterface.tsx
- Make chat area primary (full width)
- Remove complex stage components
- Add contextual initiator triggers

### 2. CreativeProcessJourney.tsx
- Refocus on STUDENT journey through phases
- Remove teacher milestone inputs
- Add phase planning interface

### 3. New Component: ContextualInitiator.tsx
- Simple cards that appear at key moments
- Auto-dismiss logic
- Minimal form inputs

### 4. Remove/Deprecate:
- WhatIfCards components
- Complex milestone forms
- Teacher journey confusion

## State Management

```typescript
interface ChatFlowState {
  stage: 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  
  ideation: {
    bigIdea: string;
    bigIdeaConfirmed: boolean;
    essentialQuestion: string;
    essentialQuestionConfirmed: boolean;
    challenge: string;
    challengeConfirmed: boolean;
  };
  
  journey: {
    projectDuration: string;
    phases: {
      analyze: PhaseDetail;
      brainstorm: PhaseDetail;
      prototype: PhaseDetail;
      evaluate: PhaseDetail;
    };
    iterationPlan: IterationStrategy;
  };
  
  showInitiator: {
    type: 'big-idea' | 'question' | 'challenge' | 'timeline' | null;
    timestamp: Date;
  };
}
```

## Chatbot Conversation Flow

### Ideation Stage
```
Bot: "Welcome! Let's design a learning experience your students will love. 
     What subject do you teach?"

Teacher: "Science"

Bot: "Great! Science offers so many possibilities for real-world connections.
     What's a topic or concept you want your students to explore deeply?"

Teacher: "Climate change"

Bot: "Climate change - perfect for project-based learning! Let's shape this 
     into a Big Idea that will anchor your project. In your local context,
     what aspect of climate change would resonate with students?"

Teacher: "How it affects our coastal city"

Bot: "Excellent! 'Climate change impacts on coastal communities' is relevant 
     and urgent. Ready to lock this in as your Big Idea?"

[Contextual Initiator appears]
```

### Learning Journey Stage
```
Bot: "Now let's design how your STUDENTS will journey through the Creative 
     Process to tackle this challenge. They'll move through 4 phases:
     Analyze → Brainstorm → Prototype → Evaluate
     
     How long do you have for this project?"

Teacher: "About 4 weeks"

Bot: "Perfect! With 4 weeks, here's a suggested breakdown:
     • Week 1: Analyze - Deep investigation
     • Week 1-2: Brainstorm - Generate solutions  
     • Week 2-3: Prototype - Build and test
     • Week 4: Evaluate - Refine and present
     
     Let's plan what students will DO in each phase..."
```

## Success Metrics

1. **Clarity**: Teachers understand they're designing FOR students
2. **Flow**: Conversation feels natural, not form-filling
3. **Flexibility**: Works for any duration/context
4. **Simplicity**: Stage Initiators don't overwhelm

## Implementation Priority

1. **TODAY**: Fix mental model confusion (remove bad milestone forms)
2. **THIS WEEK**: Implement chatbot-first interface
3. **NEXT WEEK**: Add contextual initiators
4. **ONGOING**: Refine conversation flow based on usage

## Testing Checklist

- [ ] Teacher can complete entire flow via chat only
- [ ] Stage Initiators appear at right moments
- [ ] Clear that students do Creative Process, not teachers
- [ ] Works for various project durations
- [ ] No confusing milestone forms
- [ ] Iteration is built-in, not problematic