# Chatbot Enhancement Plan: From Generic to Gold Standard

**Date**: October 21, 2025
**Status**: Ready for Implementation
**Goal**: Transform AI-generated journeys and deliverables from "rough with no details" to classroom-ready PBL excellence

---

## 🎯 Executive Summary

**The Problem**: Teachers report that AI-generated content is:
- "Rough with no details related to actual project/theme/subject"
- "Deliverables offer no value"
- Too generic to use in actual classrooms

**Root Causes Identified**:
1. **Context Starvation**: AI receives only text summaries, not structured project data
2. **Template Over AI**: Journey and deliverables use hardcoded templates, not context-aware generation
3. **Insufficient User Scaffolding**: Single-turn inputs don't guide teachers toward specificity
4. **No Iterative Refinement**: System accepts vague inputs without pushback

**The Solution**: 4-phase enhancement plan combining:
- Richer context capture and passing
- AI-powered generation (replacing templates)
- Multi-turn conversational scaffolding
- Iterative refinement workflows

**Expected Impact**:
- Specificity Score: 30 → 70+ (out of 100)
- Teacher Edit Required: 60% → <20%
- Classroom Usability: "Needs complete rewrite" → "Ready to use"

---

## 📊 Analysis Summary

### Technical Analysis (Chatbot Architecture)

**Current State**:
- Stages operate in isolation, passing only text summaries forward
- `summarizeCaptured()` flattens rich data into plain text (loses relationships)
- Journey uses hardcoded templates (`journeyMicroFlow.ts` lines 87-191)
- Deliverables use keyword inference, not AI generation

**Impact**:
- Big Idea captured in Stage 1 is just a string by Stage 4
- Phase activities are template-based ("Research topic, Conduct interviews")
- AI never sees the full project narrative when generating weeks

### Pedagogical Analysis (PBL Quality)

**What's Missing from Learner Journeys**:
- ❌ Specific learning objectives per phase
- ❌ Pedagogical protocols (See-Think-Wonder, Tuning Protocol)
- ❌ Formative assessment checkpoints with decision rules
- ❌ Scaffolding strategies (graphic organizers, sentence frames)
- ❌ Authentic connections to real-world practice
- ❌ Student voice/choice architecture
- ❌ Materials and logistics details

**What Gold Standard Looks Like**:
See exemplar: `src/data/showcaseV2/sustainability-campaign.showcase.ts`
- Week 1 includes: Specific driving question, named protocols, detailed teacher moves, observable checkpoints
- Assignments specify: Exact deliverables, scaffolds provided, success criteria with rubrics

### Curriculum Design Analysis

**What's Missing from Deliverables**:
- ❌ Standards alignment (Common Core, NGSS)
- ❌ Bloom's Taxonomy levels for objectives
- ❌ Rubrics with performance level descriptors
- ❌ Observable indicators of quality
- ❌ Differentiation strategies
- ❌ Formative assessment plans

**Current Rubrics**: Just strings like "Clear communication" (no levels, no descriptors)

**What's Needed**:
```json
{
  "criterion": "Data Analysis Quality",
  "weight": 30,
  "levels": {
    "exemplary": {
      "score": 4,
      "descriptor": "Analyzes with sophisticated insights...",
      "indicators": ["Identifies patterns", "Makes predictions", "Connects to systems"]
    },
    "proficient": { ... },
    "developing": { ... },
    "beginning": { ... }
  }
}
```

### UX Flow Analysis

**Critical UX Problems**:
1. **Single-turn input pattern**: User says "Design campaign" → AI accepts → moves on (no drill-down)
2. **AI over-generation**: System fills blanks with templates instead of asking teacher
3. **No scaffolding**: Teachers don't know what level of detail is needed
4. **Validation too permissive**: Generic inputs like "Design something for community" pass
5. **No feedback loop**: No indication that input is too vague

**What's Needed**:
- Multi-part structured forms (Challenge needs: audience, deliverable, success metric)
- Conversational drill-down (AI asks follow-up questions until specific)
- Specificity scoring with real-time feedback ("Audience too broad - which specific group?")
- Example-driven prompts (show good vs. bad inputs)

---

## 🚀 4-Phase Implementation Plan

### PHASE 1: Context Enhancement (2-3 weeks)
**Goal**: Ensure AI receives full structured context, not text summaries

#### Changes:

**1.1 Add Structured Context Builder**
- **File**: `src/features/chat-mvp/domain/prompt.ts`
- **Action**: Create `buildStructuredContext()` function
- **What it does**: Passes full `CapturedData` object to AI, not flattened text
- **Example**:
  ```typescript
  function buildStructuredContext(captured: CapturedData): string {
    return `
  PROJECT FOUNDATION:
  - Big Idea: ${captured.ideation.bigIdea}
  - Essential Question: ${captured.ideation.essentialQuestion}
  - Challenge: ${captured.ideation.challenge}

  LEARNING JOURNEY (${captured.journey.phases.length} phases):
  ${captured.journey.phases.map((p, i) => `
    ${i+1}. ${p.name}
       Activities: ${p.activities.join('; ')}
       Focus: ${p.focus}
  `).join('\n')}
    `;
  }
  ```

**1.2 Upgrade Showcase Generation Prompts**
- **File**: `src/features/chat-mvp/domain/projectShowcaseGenerator.ts`
- **Lines**: 241-263 (week card generation), 364-390 (assignment generation)
- **Action**: Include Big Idea + Essential Question + Challenge in EVERY prompt
- **Impact**: AI generates content that explicitly connects to project foundation

**1.3 Add Context Validation Logging**
- **File**: `src/features/chat-mvp/ChatMVP.tsx`
- **Action**: Log what context is passed at each stage transition
- **Why**: Verify no data is lost between stages

**Effort**: 3-5 days
**Impact**: High (foundation for all other improvements)

---

### PHASE 2: AI-Powered Generation (3-4 weeks)
**Goal**: Replace template-based generation with AI that uses full context

#### Changes:

**2.1 Convert Journey Generation to AI**
- **File**: `src/features/chat-mvp/domain/journeyMicroFlow.ts`
- **Current**: Lines 42-59 use hardcoded templates with string substitution
- **New**: AI-powered generation with rich prompts
- **Prompt includes**:
  - Big Idea, Essential Question, Challenge
  - Grade level, subjects, duration
  - Expected phase count and week allocations
  - Requirement: "2-3 specific activities per phase that connect to Big Idea"
- **Output**: JSON array of phases with specific activities

**2.2 Convert Deliverables Generation to AI**
- **File**: `src/features/chat-mvp/domain/deliverablesMicroFlow.ts`
- **Current**: Lines 36-57 use template fallbacks
- **New**: AI generates milestones, artifacts, and criteria based on journey phases
- **Prompt includes**:
  - Full project foundation (Big Idea, EQ, Challenge)
  - All phase details (names, activities, focus areas)
  - Requirement: "Milestones must reference specific phase activities"

**2.3 Add ProjectNarrative Interface**
- **File**: `src/features/chat-mvp/domain/projectShowcaseGenerator.ts`
- **Action**: Create comprehensive project narrative object
- **Use**: Pass to ALL showcase generators (microOverview, runOfShow, assignments, outcomes)
- **Benefit**: Every component sees the full project context

**Effort**: 1-2 weeks
**Impact**: Very High (eliminates generic template outputs)

---

### PHASE 3: User Input Scaffolding (2-3 weeks)
**Goal**: Guide teachers toward specific, detailed inputs

#### Changes:

**3.1 Add Multi-Part Challenge Form**
- **File**: `src/features/chat-mvp/components/StageGuide.tsx`
- **Current**: Single text box for challenge
- **New**: Structured form with required fields:
  - "What will students create?" (text)
  - "Who is the audience?" (specific name/org)
  - "What change/action do you want?" (measurable outcome)
  - "How will students measure success?" (metric)
- **Validation**: All fields required before advancing

**3.2 Implement Conversational Drill-Down**
- **File**: `src/features/chat-mvp/domain/prompt.ts`
- **Pattern**: AI asks follow-up questions instead of accepting first input
- **Example**:
  ```
  User: "Students will design a campaign"
  AI: "Great! What specific topic will the campaign address?"
  User: "Sustainability"
  AI: "Which aspect of sustainability? (waste, energy, water, transportation)"
  User: "Waste reduction"
  AI: "Perfect. Who is the target audience for this campaign?"
  ```
- **Requirement**: 2-4 turns per stage to collect specifics

**3.3 Add Specificity Scoring**
- **New File**: `src/features/chat-mvp/domain/specificityScorer.ts`
- **Function**: Analyzes input quality in real-time
- **Checks**:
  - Has specific audience (not "community" or "people")
  - Has measurable outcome
  - Has deliverable format
  - Has constraints mentioned
- **UI**: Shows score + improvement suggestions
  ```
  Challenge Quality: 45/100 ⚠️
  ✓ Clear audience named
  ✗ Success metric missing
  ✗ Deliverable format unclear

  Let's strengthen this:
  • How will you measure success?
  • What format will students use?
  ```

**3.4 Add Example-Driven Prompts**
- **File**: `src/features/chat-mvp/domain/stages.ts`
- **Action**: Build example database keyed by grade/subject
- **Display**: Show 2 good examples + 2 anti-patterns
- **Example**:
  ```
  ✓ "Individual actions ripple through community ecosystems"
    → Transferable concept, memorable phrasing

  ✗ "Climate change"
    → Topic, not a transferable insight
  ```

**Effort**: 2-3 weeks
**Impact**: High (prevents vague inputs from entering system)

---

### PHASE 4: Iterative Refinement (2-3 weeks)
**Goal**: Enable review and improvement of AI-generated content

#### Changes:

**4.1 Add Journey Review & Edit Mode**
- **File**: `src/features/chat-mvp/components/JourneyBoard.tsx`
- **Feature**: After AI generates journey, show validation warnings
  ```
  Phase 1: Investigate local policies
  Activities:
    • Interview city council ✓
    • Research → "Needs more detail" ⚠️
    [+ Add specific activity]
  ```
- **Action**: Allow inline editing before finalizing

**4.2 Add "Zoom Into Phase" Feature**
- **New Component**: `PhaseDetailExpander.tsx`
- **Feature**: Click any phase → AI generates full lesson-level breakdown
  - Teacher moves (launch, mini-lessons, facilitation)
  - Student tasks with time allocations
  - Materials needed
  - Formative checkpoints
- **Benefit**: Teachers can expand detail where they need it most

**4.3 Add "Compare to Exemplar" View**
- **Feature**: Show side-by-side comparison with gold standard showcase
- **Example**: User's Phase 1 vs. Sustainability Campaign Phase 1
- **Highlight**: What's missing, what's good

**4.4 Generate Detailed Rubrics**
- **New Function**: `generateDetailedRubric()`
- **Input**: Assignment card + learning objectives
- **Output**: Full analytic rubric with 4 performance levels
- **Format**:
  ```json
  {
    "criteria": [
      {
        "name": "Data Analysis Quality",
        "weight": 30,
        "levels": {
          "exemplary": {
            "score": 4,
            "descriptor": "Analyzes data with sophisticated insights",
            "indicators": [
              "Identifies patterns across datasets",
              "Makes evidence-based predictions"
            ]
          },
          // ... proficient, developing, beginning
        }
      }
    ]
  }
  ```

**Effort**: 2-3 weeks
**Impact**: Medium-High (polish & teacher empowerment)

---

## 📁 Files to Modify

### High Priority (Phase 1-2)

1. **`src/features/chat-mvp/domain/prompt.ts`**
   - Add `buildStructuredContext()` helper
   - Update all stage prompts to include full context
   - Add conversational drill-down sequences

2. **`src/features/chat-mvp/domain/journeyMicroFlow.ts`**
   - Replace template generation (lines 42-59) with AI-powered
   - Add activity validation (2+ specific activities required)
   - Keep templates as fallback only

3. **`src/features/chat-mvp/domain/deliverablesMicroFlow.ts`**
   - Replace template generation with AI-powered
   - Add milestone-to-phase connection validation
   - Generate artifacts based on challenge specifics

4. **`src/features/chat-mvp/domain/projectShowcaseGenerator.ts`**
   - Create `ProjectNarrative` interface
   - Add `buildProjectNarrative()` function
   - Refactor generators to use full narrative (lines 88-94)
   - Enhance week card prompts (lines 241-263)
   - Enhance assignment prompts (lines 364-390)

5. **`src/features/chat-mvp/domain/stages.ts`**
   - Add `specificityScore` to CapturedData
   - Add `refinementNeeded` boolean per stage
   - Expand phase interface to include learning objectives, scaffolds

### Medium Priority (Phase 3)

6. **`src/features/chat-mvp/components/StageGuide.tsx`**
   - Add structured multi-part forms
   - Replace single text boxes with progressive disclosure

7. **`src/features/chat-mvp/domain/specificityScorer.ts`** (NEW)
   - Implement quality scoring algorithms
   - Return strengths, weaknesses, next questions

8. **`src/features/chat-mvp/components/SpecificityFeedback.tsx`** (NEW)
   - Display score and improvement suggestions

### Lower Priority (Phase 4)

9. **`src/features/chat-mvp/components/JourneyBoard.tsx`**
   - Add validation warnings to phase cards
   - Enable inline editing

10. **`src/features/chat-mvp/components/PhaseDetailExpander.tsx`** (NEW)
    - Drill-down detail generation UI

---

## 🎓 What Teachers Will Experience After

### Before (Current State):
```
Teacher: "Students will design a campaign"
AI: "Great! Here's your 4-phase journey:"
  Phase 1: Research
    - Research topic
    - Gather information
  Phase 2: Plan
    - Brainstorm ideas
    - Create outline
  [etc - generic templates]

Teacher: 😞 "This could apply to any project..."
```

### After (Enhanced):
```
Teacher: "Students will design a campaign"
AI: "Exciting! What specific topic will the campaign address?"
Teacher: "Campus waste reduction"
AI: "Perfect. Who is the audience for this campaign?"
Teacher: "Facilities director and student government"
AI: "Got it. What specific change do you want to achieve?"
Teacher: "Reduce cafeteria waste by 30%"
AI: "Measurable goal - great! How will students measure this?"
Teacher: "Weekly waste audits with data tracking"

AI: "Excellent context. Now let's build your journey.

Phase 1: What should students investigate first to understand
campus waste patterns?"
Teacher: "Audit current waste streams and interview cafeteria staff"

AI: "Good! Let me generate Phase 1 with those specifics..."

[AI generates]:
Phase 1: Investigate Campus Waste Streams (Weeks 1-2)
  Focus: "Students quantify current waste and identify patterns
          through data collection, addressing the question:
          What stories does our trash tell?"
  Activities:
    • Conduct 3-day waste audit using sort-and-weigh protocol
    • Interview cafeteria manager about disposal processes
    • Analyze waste composition data to identify top 3 sources
    • Create baseline systems map showing waste flows

Teacher: ✅ "This is specific to my project!"
```

---

## 📈 Success Metrics

Track these before/after each phase:

1. **Specificity Score** (automated analysis)
   - Target: 30 → 70+/100
   - Measures: Named audience, measurable outcomes, specific activities

2. **Teacher Edit Rate**
   - Target: 60% content rewritten → <20%
   - Measures: % of generated text teachers modify before using

3. **Turns per Stage**
   - Target: 1 turn → 2-4 turns
   - Measures: Depth of conversation before advancing

4. **Time to Complete Wizard**
   - Expected: 15 min → 25-30 min
   - Acceptable tradeoff: 10 min more for 3x better outputs

5. **Classroom Usability** (teacher survey)
   - Question: "Can you use generated journey without major modifications?"
   - Target: 20% yes → 75% yes

6. **Standards Alignment**
   - Track: % of projects with specific standards named
   - Target: 5% → 80%

---

## 🔧 Technical Implementation Notes

### Context Preservation Pattern
```typescript
// BEFORE (data loss)
const summary = summarizeCaptured(captured); // Flattens to text
const prompt = `Context: ${summary}`;

// AFTER (full context)
const narrative = buildProjectNarrative(captured, wizard);
const prompt = `
PROJECT FOUNDATION:
  Big Idea: ${narrative.bigIdea}
  Essential Question: ${narrative.essentialQuestion}
  Challenge: ${narrative.challenge}

DETAILED JOURNEY:
${narrative.phases.map(p => `
  ${p.name}:
    Activities: ${p.activities.join('; ')}
    Focus: ${p.focus}
`).join('\n')}
`;
```

### AI Prompt Enhancement Pattern
```typescript
// BEFORE (vague)
const prompt = `Generate a week card for ${phase.name}`;

// AFTER (context-rich)
const prompt = `
You are a Gold Standard PBL expert. Generate a week card that:
- Connects to Big Idea: "${bigIdea}"
- Advances Essential Question: "${essentialQuestion}"
- Builds toward Challenge: "${challenge}"
- Uses specific activities: ${activities.join(', ')}
- References authentic audience: ${audience}

Include:
- Specific protocols (e.g., "Use See-Think-Wonder with...")
- Measurable checkpoints (e.g., "Students can explain X to peer")
- Real materials (e.g., "Provide conversation starter stems")
- Connection to prior phase: ${priorPhase?.name}
`;
```

### Multi-Turn Collection Pattern
```typescript
// BEFORE (single turn)
const bigIdea = await getUserInput("What's your Big Idea?");
setCaptured({ ...captured, ideation: { bigIdea }});

// AFTER (drill-down)
let bigIdea = await getUserInput("What's your Big Idea?");
let score = scoreSpecificity(bigIdea);

while (score < 60) {
  const feedback = generateFeedback(bigIdea, score);
  bigIdea = await getUserInput(feedback.nextQuestion);
  score = scoreSpecificity(bigIdea);
}

setCaptured({ ...captured, ideation: { bigIdea }});
```

---

## ⏱️ Implementation Timeline

### Week 1-2: Phase 1 Foundation
- Build structured context helpers
- Update showcase generator prompts
- Add context validation logging
- **Milestone**: AI receives full context, not summaries

### Week 3-5: Phase 2 AI Generation
- Convert journey to AI-powered
- Convert deliverables to AI-powered
- Build ProjectNarrative system
- **Milestone**: No more template fallbacks for main content

### Week 6-8: Phase 3 User Scaffolding
- Add multi-part Challenge form
- Implement conversational drill-down
- Build specificity scorer
- Add example database
- **Milestone**: Teachers guided toward specific inputs

### Week 9-11: Phase 4 Refinement
- Add journey review mode
- Build "Zoom into phase" feature
- Generate detailed rubrics
- Add exemplar comparisons
- **Milestone**: Teachers can refine and expand outputs

### Week 12: Testing & Polish
- User testing with 10-15 teachers
- Refine prompts based on feedback
- Document patterns and best practices
- **Milestone**: Ready for production deployment

**Total Duration**: 10-12 weeks
**Team Size**: 1-2 developers + occasional teacher feedback

---

## 🎯 Quick Wins (Can Ship Immediately)

If you want faster results, start with these high-impact, low-effort changes:

### Quick Win 1: Enhance Showcase Prompts (1-2 days)
- Add Big Idea + Essential Question to week card prompts
- Require AI to reference project context in every output
- **Impact**: 30% improvement in relevance

### Quick Win 2: Add Challenge Audience Field (1 day)
- Make audience a required structured field, not optional mention
- **Impact**: Instantly improves deliverable specificity

### Quick Win 3: Add Example Library (2-3 days)
- Show 2 good examples per stage
- Annotate why they work
- **Impact**: Teachers learn what "good" looks like

---

## 📚 Resources & References

### Gold Standard Exemplars
- `src/data/showcaseV2/sustainability-campaign.showcase.ts` - Week 1 details (lines 23-40)
- `src/data/showcaseV2/urban-heat.showcase.ts` - Assignment quality example

### Technical Architecture
- Current flow: `src/features/chat-mvp/ChatMVP.tsx` (lines 1273-1400)
- Stage definitions: `src/features/chat-mvp/chatMVPStages.ts`
- Context capture: `src/features/chat-mvp/domain/stages.ts` (lines 945-986)

### Pedagogical Frameworks
- Buck Institute Gold Standard PBL
- Understanding by Design (Wiggins & McTighe)
- Bloom's Taxonomy for cognitive rigor
- Universal Design for Learning (UDL)

---

## ✅ Next Steps

1. **Review this plan** with team
2. **Prioritize phases** based on resources
3. **Start with Phase 1** (context enhancement) - highest leverage
4. **Or implement Quick Wins** if need faster results
5. **Set up metrics tracking** before starting
6. **Plan user testing** for Week 12

---

**Questions? See detailed expert analysis reports:**
- Technical: Chatbot flow architecture analysis
- Pedagogical: PBL learner journey quality analysis
- Curriculum: Deliverables and assessment analysis
- UX: User input collection and scaffolding analysis

**Ready to transform generic outputs into Gold Standard PBL!** 🚀
