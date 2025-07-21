# Universal Progression Framework

## Core Principle: Always Move Forward
**Every interaction must advance the educator toward completing their current step. No endless loops.**

## Decision Tree Structure

### Phase 1: Initial Engagement (First Time on Step)
```
Educator arrives at new step → Show welcome message with:
├── Clear explanation of what this step requires
├── Quick Reply Chips: [ideas] [examples] [help]
└── Simple prompt: "Share your draft or click for assistance"
```

### Phase 2: Response Processing (Educator Provides Input)
```
Educator responds → Analyze quality:
├── HIGH QUALITY RESPONSE
│   ├── Acknowledge: "That's a solid [step]!"
│   ├── Offer refinement: ["Keep and Continue"] ["Refine Further"] 
│   └── PROGRESSION RULE: Max 2 refinement cycles, then auto-advance
│
├── MEDIUM QUALITY RESPONSE  
│   ├── Provide specific improvement suggestions
│   ├── Show 3 concrete refinement options
│   └── PROGRESSION RULE: 1 refinement cycle, then accept or advance
│
└── LOW QUALITY RESPONSE
    ├── Coach toward better format
    ├── Show 3 "What If" examples to guide thinking
    └── PROGRESSION RULE: Max 3 coaching attempts, then provide examples
```

### Phase 3: Assistance Processing (Help Requests)
```
Educator clicks assistance → Route by type:
├── "IDEAS" (Brainstorming)
│   ├── Show 3 "What If" concept cards
│   ├── Each leads to concept development
│   └── PROGRESSION RULE: After selection, guide to complete formulation
│
├── "EXAMPLES" (Templates)
│   ├── Show 3 ready-to-use examples
│   ├── Allow direct selection or inspiration
│   └── PROGRESSION RULE: Selection = immediate step completion
│
└── "HELP" (Guidance)
    ├── Explain step requirements clearly
    ├── Show both "What If" and example options
    └── PROGRESSION RULE: After explanation, require input or selection
```

## Anti-Loop Protection Rules

### Rule 1: Attempt Limits
- **Refinement cycles**: Maximum 2 per response
- **Coaching attempts**: Maximum 3 for poor quality
- **Help requests**: Maximum 2 consecutive without input

### Rule 2: Forced Advancement
- **After limits reached**: Auto-advance with best available content
- **Timeout protection**: If no progress in 5 interactions, advance
- **Quality threshold lowering**: Accept "good enough" after attempts

### Rule 3: Progress Indicators
- **Step completion tracking**: Clear visual progress
- **Attempt counters**: Hidden tracking of cycles
- **Advancement notifications**: Clear "Moving to next step" messages

## Universal State Machine

### States for Every Step:
1. **INITIAL** - First time on step, show guidance
2. **AWAITING_INPUT** - Waiting for educator response
3. **PROCESSING** - Analyzing response quality
4. **REFINING** - In refinement cycle (track attempts)
5. **COACHING** - Helping improve response (track attempts)
6. **COMPLETING** - Finalizing step content
7. **ADVANCING** - Moving to next step

### Transitions:
```
INITIAL → AWAITING_INPUT (always)
AWAITING_INPUT → PROCESSING (on response)
PROCESSING → COMPLETING (high quality)
PROCESSING → REFINING (medium quality)
PROCESSING → COACHING (low quality)
REFINING → COMPLETING (after refinement)
COACHING → REFINING (after improvement)
COMPLETING → ADVANCING (always)
ADVANCING → INITIAL (next step)
```

## Implementation Strategy

### 1. Progress Tracker Component
```javascript
class StepProgress {
  constructor(step) {
    this.step = step;
    this.state = 'INITIAL';
    this.attempts = { coaching: 0, refinement: 0, help: 0 };
    this.content = null;
  }
  
  canRefine() { return this.attempts.refinement < 2; }
  canCoach() { return this.attempts.coaching < 3; }
  mustAdvance() { return this.attempts.coaching >= 3 || this.attempts.refinement >= 2; }
}
```

### 2. Decision Router
```javascript
function routeResponse(input, progress, quality) {
  if (quality === 'HIGH' && progress.canRefine()) return 'OFFER_REFINEMENT';
  if (quality === 'MEDIUM' && progress.canRefine()) return 'REFINE_SPECIFIC';
  if (quality === 'LOW' && progress.canCoach()) return 'COACH_IMPROVE';
  return 'FORCE_ADVANCE'; // Anti-loop protection
}
```

### 3. Content Validation Tiers
```javascript
const QualityStandards = {
  HIGH: { threshold: 0.8, action: 'accept_with_refinement' },
  MEDIUM: { threshold: 0.6, action: 'guide_improvement' },
  LOW: { threshold: 0.3, action: 'coach_format' },
  MINIMAL: { threshold: 0.1, action: 'force_advance' }
};
```

## Stage-Specific Applications

### Ideation Stage:
- **Big Idea**: Theme concepts (not research questions)
- **Essential Question**: Inquiry format (must end with ?)
- **Challenge**: Action-oriented student work

### Learning Journey Stage:
- **Learning Experiences**: Active learning activities
- **Assessment Methods**: Authentic evaluation approaches
- **Timeline**: Realistic sequence and pacing

### Deliverables Stage:
- **Student Work**: Tangible outcomes
- **Evaluation Rubrics**: Clear success criteria
- **Sharing Methods**: Authentic audience engagement

## Success Metrics
- **Step Completion Rate**: >95% reach completion
- **Average Interactions Per Step**: <8 interactions
- **Loop Incidents**: <5% get stuck in refinement cycles
- **User Satisfaction**: Clear progression understanding