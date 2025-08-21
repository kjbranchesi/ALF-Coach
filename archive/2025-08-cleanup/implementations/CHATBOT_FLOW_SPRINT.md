# Chatbot Flow Enhancement Sprint Plan

## 🎯 Sprint Overview
Fix critical UX issues in the chatbot flow after wizard onboarding, focusing on clarity, consistency, and educator guidance.

---

## 📋 Issues Identified & Solutions

### 1. **Progress Sidebar Issues**
**Problems:**
- Green dot next to "Student Deliverables" unclear
- Progress bar doesn't expand to show captured content
- Essential question not captured in progress tracking
- Inconsistent data capture across stages

**Solutions:**
- [ ] Remove or clarify green dot indicators
- [ ] Add expandable progress items showing captured data
- [ ] Fix data capture for all ideation components
- [ ] Create consistent progress tracking system

### 2. **Input & Interaction Design**
**Problems:**
- Blue input outline not pill-shaped around entire bar
- No way to accept inline suggestions from AI
- Buttons (Ideas/What If) never explained or prompted
- "Ideas" button icon appears as single dot

**Solutions:**
- [ ] Fix input field focus styles to match design system
- [ ] Add "Use this" button for inline AI suggestions
- [ ] Add contextual prompts to use Ideas/What If buttons
- [ ] Replace Ideas button icon with proper Lucide icon
- [ ] Add button tooltips explaining their purpose

### 3. **Content & Messaging Issues**
**Problems:**
- Static ideation stage description (same for all 3 steps)
- No examples provided in transition questions
- "Continue" button appears inconsistently
- Title formatting inconsistencies

**Solutions:**
- [ ] Dynamic stage descriptions for each step
- [ ] Add contextual examples based on captured data
- [ ] Consistent "Continue" button logic
- [ ] Establish clear typography rules

### 4. **Flow & Guidance Issues**
**Problems:**
- No prompting to use available buttons
- Unclear when to continue vs explore options
- Missing "what happens next" context
- No explanation of Ideas vs What If functionality

**Solutions:**
- [ ] Add inline prompts: "Need inspiration? Try 'Ideas' or 'What If'"
- [ ] Clear CTA hierarchy (primary: Continue, secondary: explore)
- [ ] Add process overview at key transitions
- [ ] Create help tooltips for all interactive elements

---

## 🏗️ Implementation Plan

### **Phase 1: Core Fixes (Day 1-2)**

#### A. Fix Progress Sidebar
```typescript
// ProgressSidebar.tsx enhancements
interface StageProgress {
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
}

// Add expandable details
const ProgressItem = ({ stage, data }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>
        {stage.title}
        {data && <ChevronDown />}
      </button>
      {expanded && data && (
        <div className="captured-content">
          {data}
        </div>
      )}
    </div>
  );
};
```

#### B. Fix Input Styling
```css
/* Fix input focus state */
.chat-input-container:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
  border-radius: 9999px;
}
```

#### C. Add Inline Suggestion Acceptance
```typescript
// Add "Use this" button for suggestions
interface SuggestionMessage {
  text: string;
  suggestion?: string;
  onAccept?: (suggestion: string) => void;
}

const AIMessage = ({ message, onAcceptSuggestion }) => {
  // Parse for bold text suggestions
  const suggestion = extractBoldSuggestion(message);
  
  return (
    <div>
      {message}
      {suggestion && (
        <button 
          onClick={() => onAcceptSuggestion(suggestion)}
          className="use-suggestion-btn"
        >
          <CheckCircle2 /> Use this suggestion
        </button>
      )}
    </div>
  );
};
```

### **Phase 2: Enhanced Guidance (Day 3-4)**

#### A. Dynamic Stage Descriptions
```typescript
const stageDescriptions = {
  ideation: {
    step1: "Let's establish your Big Idea - the core concept that will drive student engagement",
    step2: "Now we'll craft an Essential Question to guide deep inquiry",
    step3: "Finally, let's create an authentic Challenge for students to tackle"
  }
};
```

#### B. Contextual Examples
```typescript
const getExamplesForStage = (stage, previousData) => {
  switch(stage) {
    case 'essentialQuestion':
      return generateEQExamples(previousData.bigIdea);
    case 'challenge':
      return generateChallengeExamples(
        previousData.bigIdea, 
        previousData.essentialQuestion
      );
  }
};
```

#### C. Button Guidance System
```typescript
// Add prompts when user seems stuck
const InputAssistant = ({ messageCount, lastInteraction }) => {
  const shouldShowPrompt = 
    messageCount === 0 || 
    (Date.now() - lastInteraction > 30000);
    
  if (shouldShowPrompt) {
    return (
      <div className="input-assistant">
        <Info className="w-4 h-4" />
        <span>Need help? Try:</span>
        <button className="assist-btn">
          <Lightbulb /> Ideas - Get suggestions
        </button>
        <button className="assist-btn">
          <HelpCircle /> What If - Explore scenarios
        </button>
      </div>
    );
  }
};
```

### **Phase 3: Polish & Consistency (Day 5)**

#### A. Typography Rules
```typescript
// design-system/typography.ts
export const typography = {
  stageTitle: "text-2xl font-bold",
  stepTitle: "text-xl font-semibold",
  bodyText: "text-base",
  caption: "text-sm text-gray-600"
};
```

#### B. Process Overview Component
```typescript
const ProcessOverview = ({ currentStage, completedStages }) => (
  <div className="process-overview">
    <h3>Your Journey</h3>
    <div className="timeline">
      {stages.map(stage => (
        <div className={`stage ${
          stage.id === currentStage ? 'current' : 
          completedStages.includes(stage.id) ? 'completed' : 'upcoming'
        }`}>
          {stage.name}
        </div>
      ))}
    </div>
    <p className="next-steps">
      Next: {getNextStageDescription(currentStage)}
    </p>
  </div>
);
```

---

## 📐 Design Guidelines

### Button Hierarchy
1. **Primary**: Continue/Next (blue, filled)
2. **Secondary**: Ideas/What If (outlined)
3. **Tertiary**: Help/Skip (text only)

### Icons (Lucide only)
- Ideas: `Lightbulb`
- What If: `Shuffle` or `RefreshCw`
- Help: `HelpCircle`
- Continue: `ArrowRight`

### Interaction States
- Hover: Slight scale (1.02)
- Active: Scale (0.98)
- Focus: Blue outline (2px)
- Disabled: Opacity (0.5)

---

## 🚫 Rules to Prevent Breaking

1. **Never modify** `SOPFlowManager` core logic
2. **Always preserve** captured data in state
3. **Test button visibility** at each stage
4. **Maintain backwards compatibility** with existing blueprints
5. **Keep all changes** within chat module boundaries

---

## 📊 Success Metrics

- [ ] All captured data visible in progress sidebar
- [ ] Clear visual hierarchy for actions
- [ ] Consistent button behavior across stages
- [ ] Users understand Ideas vs What If purpose
- [ ] Smooth flow from ideation to journey

---

## 🔄 Testing Checklist

- [ ] Progress captures all ideation elements
- [ ] Input focus states work correctly
- [ ] Inline suggestions can be accepted
- [ ] Button prompts appear when needed
- [ ] Stage descriptions update dynamically
- [ ] Examples appear contextually
- [ ] Continue button logic is consistent
- [ ] Typography is consistent throughout

---

## 👥 Expert Consultation Needed

1. **PBL Expert**: Validate stage transition questions
2. **UX Designer**: Review button placement and hierarchy  
3. **Content Writer**: Refine prompts and descriptions
4. **QA**: Test full flow with various inputs

---

## 🚀 Next Steps

1. Fix critical bugs (progress tracking, input styling)
2. Add guidance features (prompts, examples)
3. Polish and standardize (typography, consistency)
4. Expert review and iteration
5. Deploy and monitor

This sprint focuses on making the chatbot flow intuitive and helpful without breaking existing functionality.