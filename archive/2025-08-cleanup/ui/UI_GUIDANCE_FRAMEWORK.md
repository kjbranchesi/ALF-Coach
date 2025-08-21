# ALF Coach UI Guidance Framework

## Overview

This framework defines the three key UI guidance components in ALF Coach and their strategic implementation across all stages of the learning design process. The components work together to create a supportive, non-overwhelming user experience that guides educators through complex pedagogical decisions.

## Architecture

### Component Hierarchy
```
UI Guidance System
├── Ideas Button (Proactive Suggestions)
├── Help Button (Contextual Assistance)
└── Suggestion Cards (Adaptive Recommendations)
```

### Core Design Principles
1. **Progressive Disclosure** - Show guidance when needed, not all at once
2. **Context Awareness** - Adapt content to current stage and user progress
3. **Action-Oriented** - Every suggestion leads to concrete next steps
4. **Cognitive Load Management** - Limit choices to 3-5 options at a time
5. **Scaffolded Support** - Provide different levels of assistance

---

## 1. Ideas Button

### Purpose
The Ideas Button provides AI-generated suggestions to spark creativity and overcome blank page syndrome. It's the most proactive of the three components.

### Trigger Conditions

#### **Stage: Wizard (Project Setup)**
- **Never appears** - Wizard is guided, no free-form ideation needed

#### **Stage: Ideation**
- **Big Idea Step**: Appears when text field is empty for 10+ seconds
- **Essential Question Step**: Appears after user has entered Big Idea
- **Challenge Step**: Appears if user seems stuck (typing then deleting repeatedly)

#### **Stage: Learning Journey**
- **Phase Building**: Appears when phase list has fewer than 3 items
- **Activity Creation**: Appears when user clicks "Add Activity" but doesn't start typing
- **Resource Selection**: Appears when resource list is empty

#### **Stage: Student Deliverables**
- **Milestone Creation**: Appears when milestone list is empty or user clicks "Add Milestone"
- **Rubric Building**: Appears when criterion list has fewer than 3 items
- **Impact Design**: Appears when audience or method fields are empty

### Content Strategy

#### **Ideation Stage Ideas**
```typescript
interface IdeationIdeas {
  bigIdea: {
    bySubject: {
      science: ["Climate change detective work", "Biomimicry innovation lab", "Space colony planning"]
      english: ["Community storytelling project", "Digital magazine creation", "Poetry slam organization"]
      math: ["Real estate investment game", "Statistics journalism", "Architectural design challenge"]
    }
    byGradeLevel: {
      elementary: ["Simple, hands-on projects", "Community helpers focus", "Basic problem-solving"]
      middle: ["Identity and change themes", "Social justice projects", "Creative expression"]
      high: ["Complex real-world problems", "Career preparation", "Global perspectives"]
    }
  }
  essentialQuestion: {
    templates: [
      "How might we use [subject] to solve [community problem]?"
      "What would happen if [students] could [action] in their community?"
      "How can understanding [concept] help us become better [role]?"
    ]
  }
  challenge: {
    frameworks: [
      "Design thinking challenge with real community partner"
      "Competition-style project with public presentation"
      "Collaborative problem-solving with peer schools"
    ]
  }
}
```

#### **Learning Journey Ideas**
```typescript
interface JourneyIdeas {
  phases: {
    creative: ["Explore & Wonder", "Investigate & Discover", "Create & Share"]
    academic: ["Research Phase", "Development Phase", "Presentation Phase"]
    project: ["Planning", "Creation", "Reflection"]
  }
  activities: {
    byPhase: {
      exploration: ["Community interviews", "Expert consultations", "Problem analysis"]
      development: ["Prototype building", "Solution testing", "Peer feedback"]
      sharing: ["Public presentation", "Digital portfolio", "Community showcase"]
    }
  }
}
```

### Implementation Pattern
```typescript
interface IdeasButtonProps {
  stage: SOPStage
  step: SOPStep
  currentData: any
  onSelectIdea: (idea: string) => void
  trigger: 'empty' | 'stuck' | 'manual'
}

// Usage Example
<IdeasButton
  stage="IDEATION"
  step="IDEATION_BIG_IDEA"
  currentData={blueprintDoc.ideation}
  trigger={detectTriggerCondition()}
  onSelectIdea={(idea) => insertTextIntoField(idea)}
/>
```

---

## 2. Help Button

### Purpose
The Help Button provides contextual assistance, examples, and guidance about the current step. It's educational and explanatory rather than generative.

### Trigger Conditions
- **Always visible** in the top-right corner of each stage/step
- **Pulses subtly** on first visit to a new step
- **Shows badge indicator** if user hasn't accessed help in current stage

### Content Strategy

#### **Context-Aware Help Content**
```typescript
interface HelpContent {
  stage: SOPStage
  step: SOPStep
  content: {
    overview: string           // What this step accomplishes
    instructions: string[]     // Step-by-step guidance
    examples: string[]        // 2-3 concrete examples
    tips: string[]           // Pro tips and best practices
    commonMistakes: string[] // What to avoid
    resources?: string[]     // External links/references
  }
}
```

#### **Stage-Specific Help Examples**

**Ideation Stage**
```typescript
const ideationHelp = {
  IDEATION_BIG_IDEA: {
    overview: "The Big Idea is the central theme that connects all learning in your project",
    instructions: [
      "Think about what you want students to deeply understand",
      "Consider real-world applications of your subject",
      "Focus on concepts that transfer beyond this project"
    ],
    examples: [
      "Systems thinking through ecosystem design",
      "Mathematical modeling in urban planning",
      "Historical perspective on current events"
    ],
    tips: [
      "Big Ideas are conceptual, not activity-based",
      "They should be broad enough for multiple approaches",
      "Think 'understanding' not 'doing'"
    ]
  }
}
```

**Learning Journey Stage**
```typescript
const journeyHelp = {
  JOURNEY_BUILD: {
    overview: "Design the learning experience that moves students from curiosity to competence",
    instructions: [
      "Start with what students already know",
      "Plan for increasing complexity",
      "Include multiple ways to demonstrate understanding"
    ],
    examples: [
      "Phase 1: Community research, Phase 2: Solution design, Phase 3: Implementation",
      "Explore → Investigate → Create → Share",
      "Individual → Small Group → Whole Class → Community"
    ]
  }
}
```

### Implementation Pattern
```typescript
interface HelpButtonProps {
  stage: SOPStage
  step: SOPStep
  hasBeenViewed: boolean
  onToggleHelp: () => void
}

// Help Panel Component
interface HelpPanelProps {
  isOpen: boolean
  content: HelpContent
  onClose: () => void
}
```

---

## 3. Suggestion Cards

### Purpose
Suggestion Cards provide adaptive, contextual recommendations that appear based on user progress and behavior patterns. They're the most intelligent and responsive component.

### Trigger Conditions

#### **Behavior-Based Triggers**
- **Hesitation Pattern**: User types and deletes repeatedly
- **Completion Threshold**: User finishes a section and might need next steps
- **Quality Enhancement**: System detects content that could be improved
- **Consistency Check**: User's new input doesn't align with previous decisions

#### **Progress-Based Triggers**
- **Stage Completion**: User finishes a major stage
- **Step Transition**: Moving between related steps
- **Data Integration**: When user data could enhance other sections

### Card Types and Categories

#### **Card Categories**
```typescript
type SuggestionCategory = 
  | 'idea'          // Creative suggestions
  | 'whatif'        // Alternative scenarios
  | 'template'      // Structured examples
  | 'custom'        // User-customized content
  | 'enhancement'   // Improvement suggestions
  | 'connection'    // Cross-stage integration
```

#### **Card Display Rules**
- **Maximum 3 cards** shown simultaneously
- **Priority ranking** determines which cards appear
- **Dismissible** - user can hide cards they don't want
- **Categorized** - clear visual distinction between types

### Content Strategy

#### **Ideation Stage Suggestions**
```typescript
interface IdeationSuggestions {
  bigIdea: {
    enhancement: [
      "Consider adding a community connection to this idea",
      "Think about how this relates to students' daily lives",
      "What real-world problem does this address?"
    ]
    alternatives: [
      "What if students approached this from a different subject angle?",
      "How might this work as an interdisciplinary project?",
      "Could this connect to current events or local issues?"
    ]
  }
  essentialQuestion: {
    templates: [
      "Frame as: 'How might we use [concept] to [solve/create/improve]...?'",
      "Consider: 'What would happen if [students] could [action]...?'",
      "Try: 'How does understanding [topic] help us become better [citizens/thinkers/creators]?'"
    ]
  }
}
```

#### **Cross-Stage Integration Suggestions**
```typescript
interface IntegrationSuggestions {
  ideationToJourney: [
    "Your Big Idea suggests a 3-phase approach: Explore → Create → Share",
    "This Essential Question could guide student inquiry throughout",
    "Consider how the Challenge connects to authentic assessment"
  ]
  journeyToDeliverables: [
    "Your Phase 2 activities suggest a strong presentation milestone",
    "The community focus suggests an audience-centered rubric",
    "Consider a portfolio approach to capture the full journey"
  ]
}
```

### Implementation Pattern

#### **Enhanced Suggestion Cards Component**
```typescript
interface EnhancedSuggestionCardsProps {
  suggestions: EnhancedSuggestionCard[]
  onAccept: (suggestions: EnhancedSuggestionCard[]) => void
  onRegenerate?: (cardId: string) => void
  onRequestMore?: () => void
  context: {
    stage: SOPStage
    projectType: string
    gradeLevel: string
    userBehavior: BehaviorPattern
  }
}
```

---

## Integration Patterns

### Component Coordination

#### **Mutual Exclusivity Rules**
- Only one guidance component should be "primary" at a time
- If Suggestion Cards are showing, Ideas Button becomes secondary
- Help Button is always available but doesn't interrupt other flows

#### **State Management**
```typescript
interface GuidanceState {
  ideasButton: {
    visible: boolean
    trigger: TriggerType
    content: IdeasContent
  }
  helpPanel: {
    isOpen: boolean
    hasBeenViewed: boolean
    badgeVisible: boolean
  }
  suggestionCards: {
    cards: EnhancedSuggestionCard[]
    priority: 'high' | 'medium' | 'low'
    dismissedCards: string[]
  }
}
```

### Visual Hierarchy

#### **Positioning Strategy**
1. **Help Button**: Fixed top-right, always visible
2. **Ideas Button**: Contextual, appears near relevant input fields  
3. **Suggestion Cards**: Bottom of chat area, above input

#### **Visual Priority**
```css
/* Suggestion Cards - Highest priority when present */
.suggestion-cards {
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  border: 2px solid blue-200;
}

/* Ideas Button - Medium priority */
.ideas-button {
  z-index: 50;
  background: gradient-to-r from-blue-100 to-blue-200;
  animate: subtle-pulse;
}

/* Help Button - Always accessible */
.help-button {
  z-index: 25;
  background: gray-100;
  opacity: 0.8 hover:opacity: 1.0;
}
```

---

## User Experience Guidelines

### Progressive Support Model

#### **Level 1: Ambient Guidance**
- Help button available but not prominent
- Suggestion cards appear only for high-confidence recommendations
- Ideas button hidden unless clear trigger

#### **Level 2: Active Support**
- Help button with subtle badge indicator
- Suggestion cards show for medium-confidence situations
- Ideas button appears after brief hesitation

#### **Level 3: Proactive Assistance**
- Help button pulses gently
- Suggestion cards appear proactively with "You might want to..." framing
- Ideas button appears immediately when users seem stuck

### Accessibility Considerations

#### **Keyboard Navigation**
- All guidance components accessible via Tab key
- Help panel navigable with arrow keys
- Suggestion cards selectable with number keys (1, 2, 3)

#### **Screen Reader Support**
```html
<button 
  aria-label="Get AI-generated ideas for this step"
  aria-describedby="ideas-help-text"
  role="button"
>
  Ideas
</button>
```

#### **Cognitive Load Management**
- Maximum 5 suggestions at once
- Clear visual grouping
- Dismissible content
- Progress indicators when appropriate

---

## Implementation Checklist

### Phase 1: Core Components
- [ ] Ideas Button with stage-aware content
- [ ] Help Button with contextual panels
- [ ] Basic Suggestion Cards

### Phase 2: Intelligence Layer  
- [ ] Behavior pattern detection
- [ ] Content quality analysis
- [ ] Cross-stage integration suggestions

### Phase 3: Personalization
- [ ] User preference learning
- [ ] Adaptive suggestion ranking
- [ ] Custom content templates

### Phase 4: Advanced Features
- [ ] Multi-user collaboration guidance
- [ ] Standards alignment suggestions
- [ ] Assessment integration recommendations

---

## Success Metrics

### Quantitative Measures
- **Engagement Rate**: % of users who interact with guidance components
- **Completion Rate**: % increase in stage completion when guidance is used
- **Time to Value**: Reduction in time spent on each stage
- **Error Reduction**: Fewer revisions needed after using guidance

### Qualitative Measures
- **User Confidence**: Self-reported confidence in pedagogical decisions
- **Cognitive Load**: User feedback on overwhelming vs. helpful guidance
- **Learning Transfer**: Application of ALF principles in future projects

---

This framework ensures that ALF Coach's UI guidance components work harmoniously to support educators throughout their learning design journey, providing the right level of assistance at the right time without overwhelming the user experience.