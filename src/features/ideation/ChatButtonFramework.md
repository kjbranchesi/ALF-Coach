# Chat Button Framework Specification

## Overview
This document defines the complete behavior and display logic for all interactive buttons in the conversational ideation chat.

## Button Types & Hierarchy

### 1. Quick Reply Chips (Highest Priority)
**Appearance**: Small pill-shaped buttons with light purple background
**When Shown**: Only on initial grounding message
**Purpose**: Guide first-time users to common actions

#### Buttons:
- **"ideas"** → Brainstorming assistance - AI helps generate creative concepts based on user's interests/context
- **"examples"** → Ready-made templates - AI provides complete, well-formed examples user can select directly
- **"help"** → General guidance - AI explains what makes a good response + coaching suggestions

#### Display Logic:
```javascript
// Show ONLY when:
!isUser && msg.quickReplies && msg.quickReplies.length > 0 && !isStale
```

#### Action:
```javascript
onClick={() => handleSendMessage('ideas')}   // → Brainstorming mode
onClick={() => handleSendMessage('examples')} // → Template selection mode
onClick={() => handleSendMessage('help')}    // → Guidance mode
```

---

### 2. Suggestion Cards (Medium Priority)
**Appearance**: Larger cards with border and hover effects
**When Shown**: When AI provides specific examples to choose from
**Purpose**: Present concrete options user can select

#### Types:
- **"What if" Cards** (Amber): Coaching suggestions that start with "What if"
- **Concrete Cards** (Purple): Well-formed options user can directly select
- **Quick Select** (Purple/White): Binary choices like "Keep and Continue" / "Refine"

#### Display Logic:
```javascript
// Show when AI message has suggestions array
!isUser && msg.suggestions && msg.suggestions.length > 0 && !isStale
```

#### Action:
```javascript
// Direct selection → handleSendMessage(suggestionText)
onClick={() => handleSendMessage(suggestion)}
```

---

### 3. Help Buttons (Lowest Priority)
**Appearance**: Small purple buttons with lightbulb icon
**When Shown**: Only when no other buttons are present AND message asks a question
**Purpose**: Fallback help for messages without suggestions

#### Buttons:
- **"💡 Give me some ideas"** → Request examples
- **"💡 Show examples"** → Request examples (synonym)

#### Display Logic:
```javascript
// Show ONLY when:
!isUser && 
(!msg.suggestions || msg.suggestions.length === 0) && 
(!msg.quickReplies || msg.quickReplies.length === 0) && 
(msg.chatResponse?.includes('?') || 
 msg.chatResponse?.includes('What are your') || 
 msg.chatResponse?.includes('Share your')) &&
!isStale
```

---

## Button Behavior Specification

### User Action → AI Response Mapping

| User Input | AI Interpretation | Expected Response |
|------------|------------------|------------------|
| **"ideas"** | Brainstorming request | 3 "What if" coaching suggestions to spark creativity |
| **"examples"** | Template request | 3 complete, well-formed examples ready to select |
| **"help"** | Guidance request | Explanation + coaching suggestions |
| **Concrete suggestion selection** | Direct selection | Capture response + advance to next step |
| **"What if" selection** | Development needed | Ask user to expand concept into their own words |
| **"Keep and Continue"** | Confirmation | Capture current response + advance step |
| **"Refine Further"** | Wants to improve | Ask for refined version |

### AI Response → Button Display Logic

| AI Response Type | Buttons Displayed |
|------------------|------------------|
| **Initial grounding** | Quick Reply Chips: `ideas`, `examples`, `help` |
| **"Ideas" response** | Suggestion Cards: 3x "What if..." brainstorming options |
| **"Examples" response** | Suggestion Cards: 3x ready-to-select complete options |
| **Refinement offer** | Quick Select: `Keep and Continue`, `Refine Further` |
| **Question without suggestions** | Help Buttons: `Give me some ideas`, `Show examples` |
| **Completion message** | Completion Button: `Continue to Learning Journey →` |

---

## Implementation Rules

### Display Hierarchy (Only ONE type shows at a time)
1. **Quick Reply Chips** (if present)
2. **Suggestion Cards** (if present) 
3. **Help Buttons** (if no suggestions AND contains question)
4. **Nothing** (for statements, confirmations, etc.)

### State Management
- **Disabled when**: `isAiLoading || isStale`
- **Stale Definition**: `msg !== lastAiMessage`
- **Loading State**: Show loading indicator, disable all buttons

### Error Handling
```javascript
// All button clicks should be wrapped in try/catch
try {
  handleSendMessage(buttonText);
} catch (error) {
  console.error('Button click failed:', error);
  // Don't crash the UI - log and continue
}
```

---

## Testing Requirements

### Unit Tests
- Button visibility rules
- Button text generation
- Click handler binding
- Disabled state logic

### Integration Tests  
- User clicks "ideas" → AI responds with "What if" suggestions
- User selects concrete option → Advances to next step
- User selects "What if" → AI asks for development
- Multiple message thread with correct button states

### Acceptance Criteria
✅ Only one button type visible per message  
✅ All buttons disabled during AI loading  
✅ Stale messages show no interactive buttons  
✅ Button clicks never crash the application  
✅ AI responses consistently match user expectations  