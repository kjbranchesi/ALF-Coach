# Quick-Reply Metadata Schema

## Overview

The quick-reply system in ALF-Coach uses a clean separation between UI labels and action identifiers, allowing for flexible UI presentation while maintaining consistent logic handling.

## Schema Structure

### Assistant Message Format

```json
{
  "role": "assistant",
  "content": "Let's explore the phases of your learning journey...",
  "quickReplies": [
    {"label": "Get Ideas", "action": "ideas", "variant": "primary"},
    {"label": "What-If", "action": "whatif", "variant": "secondary"},
    {"label": "Examples", "action": "examples", "variant": "secondary"},
    {"label": "Skip", "action": "skip", "variant": "subtle"}
  ],
  "metadata": {
    "stage": "JOURNEY_PHASES",
    "readyForNext": false
  }
}
```

### Quick Reply Structure

```typescript
interface QuickReply {
  label: string;    // Displayed in the UI button
  action: string;   // Sent to the handler when clicked
  variant?: 'primary' | 'secondary' | 'subtle';  // Visual styling
}
```

## UI Behavior

1. **Display**: The UI renders buttons showing the `label` text
2. **Interaction**: When clicked, the `action` value is sent to the message handler
3. **Styling**: The `variant` determines the button's visual appearance:
   - `primary`: Gradient background, prominent styling
   - `secondary`: Light background with border
   - `subtle`: Minimal styling for optional actions

## Handler Logic

When a quick-reply is clicked:

```typescript
const handleQuickReply = (reply: QuickReply) => {
  // Send the action identifier to the handler
  handleSendMessage(reply.action);
};
```

The message handler then processes the action:

```typescript
// Check if the message is a quick action
const quickActions = ['ideas', 'whatif', 'examples', 'skip'];
const isQuickAction = quickActions.includes(messageText.trim().toLowerCase());

if (isQuickAction) {
  const response = generateQuickResponse(messageText, context);
  // Process the appropriate response based on the action
}
```

## Action Definitions

| Action | Purpose | Response Type |
|--------|---------|---------------|
| `ideas` | Provide creative suggestions | Template-based inspiration |
| `whatif` | Explore possibilities | "What if..." scenarios |
| `examples` | Show concrete examples | Real-world applications |
| `skip` | Skip optional stage | Progression message |
| `continue` | Move to next stage | Progression with transition |

## Stage-Specific Quick Replies

Different stages may have different quick-reply options:

### Journey Stages (Default)
```typescript
[
  { label: "Get Ideas", action: "ideas", variant: "primary" },
  { label: "What-If", action: "whatif", variant: "secondary" },
  { label: "Examples", action: "examples", variant: "secondary" },
  { label: "Skip", action: "skip", variant: "subtle" }
]
```

### Review Stages
```typescript
[
  { label: "Continue", action: "continue", variant: "primary" }
]
```

### Completion Stage
```typescript
[] // No quick replies at completion
```

## Benefits

1. **Flexibility**: UI labels can be changed without affecting logic
2. **Localization**: Labels can be translated while actions remain consistent
3. **A/B Testing**: Different label variations can be tested
4. **Consistency**: Actions provide a stable API for the FSM logic
5. **Accessibility**: Labels can be optimized for screen readers

## Implementation Example

```typescript
// In prompt generation
export function generatePrompt(context: PromptContext) {
  const prompt = templates[context.currentStage](context);
  const quickReplies = getQuickRepliesForStage(context.currentStage);
  
  return {
    content: prompt,
    metadata: {
      quickReplies,
      stage: context.currentStage,
      readyForNext: false
    }
  };
}

// In UI rendering
{message.quickReplies?.map((reply, idx) => (
  <button
    key={idx}
    onClick={() => handleQuickReply(reply)}
    className={getButtonStyles(reply.variant)}
  >
    {reply.label}
  </button>
))}
```

This architecture ensures clean separation of concerns while maintaining a smooth user experience.