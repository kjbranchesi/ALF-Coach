# ProjectCraft Button Behavior Mapping

## Overview
This document provides a comprehensive mapping of button behavior across ALL phases and stages of the ProjectCraft application, documenting expected vs actual behavior based on codebase analysis.

## Button Framework

### Core Button Types (from `/src/features/ideation/ButtonFramework.js`)

1. **PRIMARY** - Blue buttons for main progressive actions
   - Style: `bg-blue-600 hover:bg-blue-700 text-white`
   - Purpose: Move conversation forward, confirm actions

2. **SUGGESTION** - Light blue for AI suggestions
   - Style: `bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200`
   - Purpose: AI-generated suggestions for user consideration

3. **HELP** - Gray for assistance requests
   - Style: `bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200`
   - Purpose: Request help, examples, or information

4. **EDIT** - Amber for modifications
   - Style: `bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200`
   - Purpose: Modify or revise existing content

5. **SUCCESS** - Green for confirmations
   - Style: `bg-green-50 hover:bg-green-100 text-green-700 border border-green-200`
   - Purpose: Confirm completion or accept suggestions

6. **WARNING** - Orange for caution actions
   - Style: `bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200`
   - Purpose: Actions that may affect other parts

7. **NEUTRAL** - Slate for secondary actions
   - Style: `bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200`
   - Purpose: Secondary actions that don't change data

## Phase 1: IDEATION

### Component: ConversationalIdeationPro.jsx
**Location**: `/src/features/ideation/ConversationalIdeationPro.jsx`

#### Quick Action Buttons (Always Visible)
These buttons appear at the bottom of the input area (lines 703-745):

1. **"Get Ideas"** (line 705)
   - Icon: Lightbulb
   - Trigger: User clicks when needing inspiration
   - Action: Sends "Get Ideas" message to AI
   - Style: Blue text on white background with shadow

2. **"See Examples"** (line 716)
   - Icon: Custom grid icon
   - Trigger: User wants concrete examples
   - Action: Sends "See Examples" message to AI
   - Style: Blue text on white background with shadow

3. **"Help"** (line 731)
   - Icon: Help circle
   - Trigger: User needs assistance
   - Action: Sends "Help" message to AI
   - Style: Blue text on white background with shadow

#### Dynamic Suggestion Buttons
These appear after AI responses (lines 643-667):

- **Location**: Below AI message bubbles
- **Condition**: `showSuggestions = !isAiLoading && currentSuggestions.length > 0 && lastMessage.role === 'assistant'`
- **Types**:
  - **"What if" suggestions**: Amber background (whatif type)
  - **"Make it more" suggestions**: Amber background (refine type)
  - **Example suggestions**: Green background (example type)
  - **Default suggestions**: Slate background

#### Exit Button
- **Location**: Top right header (line 576)
- **Always visible**: Yes
- **Action**: Calls `onCancel()` to exit ideation

### Steps in Ideation Phase:
1. **Big Idea** → 2. **Essential Question** → 3. **Challenge**

### Button State Flow:
1. **Initial state**: AI provides welcome message with suggestions
2. **User provides input**: Suggestions disappear, quick actions remain
3. **AI responds**: New suggestions appear based on context
4. **Completion**: When all 3 steps done, completion triggers

## Phase 2: LEARNING JOURNEY

### Component: ConversationalJourney.jsx
**Location**: `/src/features/journey/ConversationalJourney.jsx`

#### Help Buttons (Conditional)
Appear when AI asks questions without providing suggestions (lines 625-638):

1. **"Give me some ideas"**
   - Condition: AI message contains "?", "What are your", or "Share your"
   - Action: Sends "I need some ideas and examples"
   - Style: Emerald green theme

2. **"Show examples"**
   - Appears alongside "Give me some ideas"
   - Action: Sends "Can you provide examples?"
   - Style: Emerald green theme

#### Dynamic Suggestion Types (lines 641-674):

1. **Quick Select Cards** (lines 644-657)
   - Condition: 2 suggestions that include keywords like "Keep and Continue", "Refine Further", "Yes", "No"
   - Style: Primary (green) for positive actions, secondary (white) for negative
   - Layout: Horizontal, centered

2. **What If Cards** (lines 661-662)
   - Condition: Suggestion starts with "what if"
   - Style: Amber background with thought bubble emoji
   - Icon: 💭

3. **Regular Suggestion Cards**
   - Default for other suggestions
   - Style: Emerald green theme

#### Completion Button (lines 678-691)
- **Condition**: `currentStep === 'complete'`
- **Text**: "Continue to Student Deliverables →"
- **Style**: Green background, prominent placement
- **Action**: Calls `onComplete(journeyData)`

### Steps in Learning Journey:
1. **Phases** → 2. **Activities** → 3. **Resources**

## Phase 3: STUDENT DELIVERABLES

### Component: ConversationalDeliverables.jsx
**Location**: `/src/features/deliverables/ConversationalDeliverables.jsx`

#### Structure Mirrors Learning Journey
- Same Help Button pattern
- Same Quick Select pattern
- Same What If pattern
- Color theme: Emerald green (consistent with Journey)

### Steps in Deliverables:
1. **Milestones** → 2. **Descriptions** → 3. **Assessment**

## Phase 4: PUBLISH

### Component: PublishPro.jsx
**Location**: `/src/features/publish/PublishPro.jsx`

#### Tab Navigation (Not visible in code snippet but implied)
- Review tab
- Export tab
- Share tab

#### Export Options (lines 86-105)
**ExportOption** buttons:
- PDF Export
- Google Classroom
- Share Link
- Each has icon, title, description
- Style: White background with shadow, hover effects

#### Celebration Modal (lines 107-193)
- **Trigger**: Completion of publish phase
- **"View Dashboard"** button (line 179)
  - Style: Blue primary button
  - Action: Closes modal, returns to dashboard

## Identified Issues and Inconsistencies

### 1. Button Definition Inconsistency
- **ButtonFramework.js** defines standardized button types and commands
- **ConversationButton.jsx** component exists but is NOT used in main conversation components
- Each phase implements its own button rendering logic

### 2. Style Inconsistency
- Ideation: Blue theme for buttons
- Journey/Deliverables: Emerald green theme
- No consistent use of ButtonFramework styles

### 3. Missing Standardization
- Quick action buttons only in Ideation phase
- Help buttons appear conditionally in Journey/Deliverables but not Ideation
- No consistent button command handling

### 4. State Management Issues
- Button state tied to message state
- No centralized button state management
- Stale button problem: Old suggestions remain clickable

## Expected vs Actual Behavior

### Expected (Based on ButtonFramework.js):
1. Consistent button styling across all phases
2. Standardized button commands
3. Icon usage from defined set
4. Validation of button text and commands

### Actual:
1. Each phase has different button implementations
2. No use of ButtonCommands enum
3. Inconsistent icon usage
4. No validation of button configuration

## Button State Flow Through User Journey

```
1. IDEATION PHASE
   ├─ Initial: Welcome message (no buttons)
   ├─ Quick Actions: Always visible (Get Ideas, See Examples, Help)
   ├─ AI Response: Dynamic suggestions appear
   ├─ User Input: Suggestions disappear
   └─ Completion: Auto-advance to Journey

2. LEARNING JOURNEY PHASE  
   ├─ Initial: Welcome message (no buttons)
   ├─ No Quick Actions (INCONSISTENCY)
   ├─ AI Response: Suggestions OR Help buttons
   ├─ Quick Select: For binary choices
   └─ Completion: Green "Continue" button

3. DELIVERABLES PHASE
   ├─ Same pattern as Journey
   └─ Completion: Advance to Publish

4. PUBLISH PHASE
   ├─ Review Mode: No action buttons
   ├─ Export Mode: Export option cards
   └─ Celebration: View Dashboard button
```

## Critical Issues for Button Updates

1. **No Central Button State**: Buttons tied to individual messages
2. **Stale Button Problem**: Old buttons remain active
3. **Inconsistent Patterns**: Each phase handles buttons differently
4. **Missing Quick Actions**: Only Ideation has persistent help buttons
5. **No Command Validation**: Button actions are free-form strings

## Recommendations

1. **Implement ButtonFramework.js** across all components
2. **Add persistent Quick Actions** to all conversation phases
3. **Centralize button state** management
4. **Disable stale buttons** from previous messages
5. **Standardize button themes** across phases
6. **Use ConversationButton.jsx** component consistently