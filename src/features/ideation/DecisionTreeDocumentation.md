# Ideation Flow Decision Tree Documentation

## Overview
The ConversationalIdeation component uses sophisticated branching logic to guide educators through creating Big Ideas, Essential Questions, and Challenges. The system adapts based on:
- User age group (affects depth limits)
- Response quality (validation scoring)
- Exploration depth (prevents endless loops)
- Interaction count (knows when to focus)
- User intent (tracks what they're looking for)

## Core Decision Points

### 1. Response Validation
Each user response is validated with three possible scores:

#### **HIGH SCORE** → Advance
- User provides excellent, complete response
- For college: theoretical concepts accepted
- User selects a concrete example with "Use this"
- **Action**: Capture response, move to next step

#### **MEDIUM SCORE** → Explore
- Response is acceptable but could be refined
- **Action**: Offer refinement suggestions + "Keep and Continue"

#### **LOW SCORE** → Coach
- Response has issues (wrong format, too vague)
- **Action**: Gentle coaching with specific guidance

### 2. Depth Management

```
Age Group Depth Limits:
- Elementary/Middle: 2 levels max
- High School: 3 levels max  
- College/Adult: 4 levels max
```

When user reaches max depth:
- Stop offering "What if" questions
- Provide 3 concrete, ready-to-use examples
- Force progression to avoid loops

### 3. Interaction Patterns

#### Pattern: Exploration Mode
- User clicks "Get Ideas" or asks for suggestions
- Depth < MaxDepth
- **Response**: 3 "What if" prompts to spark thinking

#### Pattern: Example Mode
- User clicks "See Examples" 
- OR depth >= MaxDepth
- **Response**: 3 complete, concrete examples

#### Pattern: Refinement Mode
- User has good response (medium score)
- Interaction count < 5
- **Response**: Refinement suggestions + "Keep and Continue"

#### Pattern: Focus Mode
- Interaction count > 5
- User seems stuck in exploration
- **Response**: 2-3 focused suggestions to conclude

### 4. Navigation Tracking

The system maintains a breadcrumb trail:
```
navigationPath: [
  "What if we explored sustainability...",
  "What if we focused on urban planning...",
  "What if we connected it to transportation..."
]
```

Users can navigate back, which:
- Resets exploration depth to that point
- Clears subsequent navigation
- Allows different exploration branch

## Branching Strategy Logic

```javascript
determineBranchingStrategy(userInput, validation, depth) {
  // Immediate advancement
  if (validation.score === 'high' || userInput.includes('Use this')) {
    return { type: 'advance', suggestions: null };
  }
  
  // Depth limit reached - force concrete examples
  if (depth >= maxDepth) {
    return { type: 'concrete', suggestions: 'examples' };
  }
  
  // Too many interactions - time to focus
  if (interactionCount > 5) {
    return { type: 'focus', suggestions: 'refined' };
  }
  
  // Default: continue exploration
  return { type: 'explore', suggestions: 'mixed' };
}
```

## Step-Specific Validation

### Big Idea Validation
- ❌ Questions ("How can we...?")
- ❌ Too short (< 3 words)
- ✅ Themes ("Sustainable Urban Design")
- ✅ College: Theoretical concepts accepted

### Essential Question Validation
- ❌ Statements without "?"
- ❌ Too vague (< 5 words)
- ✅ Inquiry-based questions
- ✅ Starts with How/What/Why

### Challenge Validation
- ❌ No action verbs
- ❌ Too abstract
- ✅ Contains: create/design/build/develop
- ✅ Describes student deliverable

## Anti-Loop Mechanisms

1. **Depth Tracking**: Hard limit based on age
2. **Interaction Counting**: Shifts to focus mode after 5 interactions
3. **Navigation Path**: Visual breadcrumb prevents getting lost
4. **Type Tracking**: Remembers if user wanted ideas vs examples
5. **Progressive Concreteness**: Suggestions get more specific over time

## Mobile Optimizations

- Single-column layout on small screens
- Touch-friendly button sizes (min 44px)
- Swipeable progress panel
- Reduced animation complexity on mobile
- Responsive text sizing

## Debug Information

The debug panel tracks:
- Context extraction (location, interests)
- Validation decisions
- Branching strategies
- API calls and responses
- Navigation events
- Error states

This allows educators and developers to understand exactly why the system made specific decisions.