# CHATBOT FLOW ANALYSIS & IMPLEMENTATION PLAN

## EXECUTIVE SUMMARY

**Current Status:** Chatbot successfully completes BIG_IDEA → ESSENTIAL_QUESTION → CHALLENGE, but fails to advance to JOURNEY stage.

**Root Cause:** Input parsing logic for JOURNEY stage is too simplistic and doesn't reliably extract phase data from natural language input.

**Solution Required:** Multi-phase implementation to fix parsing, improve AI prompting, and integrate wizard duration data into journey planning.

---

## STAGE-BY-STAGE FLOW ANALYSIS

### STAGE 1: BIG IDEA
**Purpose:** Capture a transferable concept that anchors the entire project

**What Should Be Captured:**
```typescript
ideation.bigIdea: string  // e.g., "Systems adapt to change through feedback loops"
```

**User Input Requirements:**
- NOT a question (no "?")
- At least 3 words, 12+ characters
- A statement, not uncertainty ("I don't know")

**Validation Gate:**
```typescript
captured.ideation.bigIdea?.trim().length >= 10
```

**Current Status:** ✅ WORKING

---

### STAGE 2: ESSENTIAL QUESTION
**Purpose:** Turn the Big Idea into an inquiry-driving question

**What Should Be Captured:**
```typescript
ideation.essentialQuestion: string  // e.g., "How might we reduce food waste in our cafeteria?"
```

**User Input Requirements:**
- Must end with "?"
- NOT a yes/no question (avoid starting with is/are/do/does/etc.)
- At least 12 characters
- Open-ended, debate-worthy

**Validation Gate:**
```typescript
captured.ideation.essentialQuestion?.trim().length >= 10
```

**Current Status:** ✅ WORKING

---

### STAGE 3: CHALLENGE
**Purpose:** Define an authentic task with a real audience

**What Should Be Captured:**
```typescript
ideation.challenge: string  // e.g., "Design a composting system proposal for school board"
```

**User Input Requirements:**
- Contains action verb (design, create, build, etc.)
- Mentions audience (community, families, peers, etc.)
- Describes outcome/deliverable

**Validation Gate:**
```typescript
captured.ideation.challenge?.trim().length >= 15
```

**Current Status:** ✅ WORKING

---

### STAGE 4: LEARNER JOURNEY ⚠️ **BROKEN HERE**
**Purpose:** Map the learning progression from discovery to showcase

**What Should Be Captured:**
```typescript
journey: {
  phases: [
    {
      name: "Research & Analyze",
      activities: ["Conduct cafeteria waste audit", "Interview cafeteria staff"]
    },
    {
      name: "Ideate Solutions",
      activities: ["Brainstorm composting systems", "Sketch design options"]
    },
    {
      name: "Prototype & Test",
      activities: ["Build small-scale model", "Test with pilot group"]
    },
    {
      name: "Pitch & Implement",
      activities: ["Create proposal", "Present to school board"]
    }
  ],
  resources: ["Composting guide", "School board contact", "Budget template"]
}
```

**What Duration/Weeks Data Should Do:**
- The wizard captures `duration` (e.g., "6 weeks", "2 months", "1 semester")
- This should inform:
  - Number of phases (longer projects = more phases)
  - Pacing of milestones
  - Depth of activities per phase
  - AI prompts should reference the timeline

**Example Integration:**
```
For a 6-week project:
- Week 1-2: Research & Analyze
- Week 3: Ideate Solutions
- Week 4-5: Prototype & Test
- Week 6: Pitch & Implement
```

**Current Parsing Logic (THE PROBLEM):**
```typescript
function parsePhases(value: string): { name: string; activities: string[] }[] {
  const items = parseList(value);  // Splits by newlines or commas
  return items.map((item, index) => {
    const parts = item.split(/[:–—-]\s*/, 2);  // Expects "Phase Name: activities"
    const name = (parts[0] || `Phase ${index + 1}`).trim();
    const activities = parts[1]
      ? parts[1].split(/[,;]+/).map(s => s.trim()).filter(Boolean)
      : [];
    return { name, activities };
  });
}
```

**Why It Fails:**
1. Teachers write naturally: "First we'll research the problem, then students will brainstorm ideas..."
2. Parser expects rigid format: "Phase 1: Research problem, Interview stakeholders"
3. If parser fails, `phases.length === 0`
4. Validation requires `phases.length >= 3`
5. **Result: Cannot advance, stuck in JOURNEY stage**

**User Input Assessment (TOO LENIENT):**
```typescript
case 'JOURNEY': {
  // Only checks if text LOOKS like it has phases
  const phaseSeparators = /(->|→|phase|step|stage)/i.test(text)
                       || text.split(/\n|,/).length >= 3;
  if (!phaseSeparators) {
    return { ok: false, reason: 'Outline the flow—3–4 phases...' };
  }
  return { ok: true };  // ✅ Passes assessment
}
```

Then in main handler (ChatMVP.tsx lines 393-434):
```typescript
// Assessment passes ✅
const assessment = assessStageInput(stage, content);
if (!assessment.ok) { /* correction */ return; }

// Data gets captured
const updatedCaptured = captureStageInput(captured, stage, content);

// Validation FAILS ❌ - phases.length === 0
const gatingInfo = validate(stage, updatedCaptured);

// Auto-advance only if valid
if (gatingInfo.ok) {  // ❌ FALSE - doesn't advance
  const nxt = nextStage(stage);
  setStage(nxt);
}
```

**Validation Gate:**
```typescript
captured.journey.phases.length >= 3
```

**Current Status:** ❌ **BROKEN - Input assessment passes but parsing fails, validation blocks advancement**

---

### STAGE 5: DELIVERABLES
**Purpose:** Define milestones, artifacts, and quality criteria

**What Should Be Captured:**
```typescript
deliverables: {
  milestones: [
    { name: "Waste audit completed" },
    { name: "Design prototype ready" },
    { name: "Proposal submitted" },
    { name: "Final presentation delivered" }
  ],
  artifacts: [
    { name: "Composting system design" },
    { name: "School board proposal" },
    { name: "Implementation plan" }
  ],
  rubric: {
    criteria: [
      "Clear problem analysis",
      "Evidence-based solution",
      "Practical implementation plan",
      "Persuasive presentation"
    ]
  }
}
```

**Relationship to Journey:**
- Milestones = Checkpoints at end of each phase
- Artifacts = Final outputs from the challenge
- Rubric = Quality measures for artifacts

**How Duration Affects This:**
- 2-week project: 3 milestones, 1 artifact
- 6-week project: 4-5 milestones, 2-3 artifacts
- Full semester: 6+ milestones, 3-4 artifacts

**Validation Gate:**
```typescript
milestones.length >= 3
&& artifacts.length >= 1
&& rubric.criteria.length >= 3
```

**Current Status:** ⚠️ Unreachable until JOURNEY is fixed

---

## THE CRITICAL DISTINCTION

### What Teachers Think They're Providing:
"We'll start by having students research composting methods and interview the cafeteria staff. Then they'll brainstorm different system designs and create sketches. Next, they'll build a small prototype and test it with a pilot group. Finally, they'll create a formal proposal and present to the school board."

### What the Parser Actually Extracts:
```typescript
phases: []  // ❌ Empty! No phases captured
```

### What It SHOULD Extract:
```typescript
phases: [
  {
    name: "Research & Analyze",
    activities: ["Research composting methods", "Interview cafeteria staff"]
  },
  {
    name: "Ideate & Design",
    activities: ["Brainstorm system designs", "Create sketches"]
  },
  {
    name: "Prototype & Test",
    activities: ["Build small prototype", "Test with pilot group"]
  },
  {
    name: "Proposal & Present",
    activities: ["Create formal proposal", "Present to school board"]
  }
]
```

---

## DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         WIZARD INTAKE                            │
│  Captures: subjects, gradeLevel, duration, projectTopic         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STAGE: BIG_IDEA                             │
│  Input: "Systems adapt to change through feedback loops"        │
│  Captured: ideation.bigIdea = "Systems adapt..."               │
│  Valid? YES (length >= 10) → ADVANCE                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                 STAGE: ESSENTIAL_QUESTION                        │
│  Input: "How might we reduce food waste in cafeteria?"         │
│  Captured: ideation.essentialQuestion = "How might we..."      │
│  Valid? YES (length >= 10, ends with ?) → ADVANCE             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STAGE: CHALLENGE                              │
│  Input: "Design composting system proposal for school board"   │
│  Captured: ideation.challenge = "Design composting..."         │
│  Valid? YES (has action + audience) → ADVANCE                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                 STAGE: JOURNEY ⚠️ BREAKS HERE                    │
│                                                                  │
│  Input: "First research composting, then brainstorm designs..." │
│  Assessment: ✅ PASS (has phase-like words)                     │
│  Parsing: ❌ FAIL (parsePhases returns [])                      │
│  Captured: journey.phases = []                                  │
│  Valid? NO (phases.length < 3) → ❌ STUCK, CANNOT ADVANCE       │
│                                                                  │
│  SHOULD integrate duration here:                                │
│  - wizard.duration = "6 weeks"                                  │
│  - Should suggest 4 phases for 6-week timeline                 │
│  - Should help teacher map weeks to phases                     │
└─────────────────────────────────────────────────────────────────┘
                         │ ❌ BLOCKED
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STAGE: DELIVERABLES                             │
│  [UNREACHABLE - Cannot get here until JOURNEY works]           │
│                                                                  │
│  SHOULD capture:                                                │
│  - Milestones (checkpoints at phase ends)                      │
│  - Artifacts (final products)                                   │
│  - Rubric criteria (quality measures)                          │
│                                                                  │
│  SHOULD integrate duration:                                     │
│  - 2-week project: 3 milestones                                │
│  - 6-week project: 4-5 milestones                              │
│  - Map milestones to timeline                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASED IMPLEMENTATION PLAN

### PHASE 1: IMMEDIATE FIX - Make JOURNEY Parser Robust
**Goal:** Get chatbot unstuck and advancing to DELIVERABLES

**Changes Required:**

1. **Improve Natural Language Parsing** (`stages.ts` lines 210-220)
   - Use AI to extract phases from natural language
   - Fallback to pattern matching
   - Provide better default phase suggestions

2. **Smarter Input Assessment** (`inputQuality.ts` lines 58-63)
   - Actually validate that phases can be parsed
   - Provide specific feedback on format

3. **Better AI Prompting** (`prompt.ts`)
   - Ask teachers to list phases more explicitly
   - Provide examples: "Phase 1: Research - conduct audit, interview staff"
   - Show phase template in guide

**Success Criteria:**
- Teacher can advance from JOURNEY to DELIVERABLES
- At least 3 phases consistently captured
- Natural language input works 80%+ of time

---

### PHASE 2: INTEGRATE DURATION DATA
**Goal:** Make timeline-aware journey planning

**Changes Required:**

1. **Duration-Aware Phase Suggestions**
   - Extract duration from wizard: "6 weeks", "2 months", "1 semester"
   - Normalize to weeks
   - Suggest appropriate phase count:
     - 1-2 weeks: 3 phases
     - 3-6 weeks: 4 phases
     - 7-12 weeks: 4-5 phases
     - Full semester: 5-6 phases

2. **Timeline-Mapped AI Prompts**
   ```
   "Your project is 6 weeks. Here's a suggested timeline:
   Weeks 1-2: Research & Analyze
   Week 3: Ideate Solutions
   Weeks 4-5: Prototype & Test
   Week 6: Pitch & Present

   What activities belong in each phase?"
   ```

3. **Capture Week Assignments**
   ```typescript
   journey: {
     phases: [
       {
         name: "Research & Analyze",
         activities: ["..."],
         weeks: "1-2",  // NEW
         duration: "2 weeks"  // NEW
       }
     ]
   }
   ```

**Success Criteria:**
- Duration from wizard informs phase structure
- AI prompts reference timeline
- Teachers can see week-by-week breakdown

---

### PHASE 3: CONNECT JOURNEY → DELIVERABLES
**Goal:** Auto-generate smart milestone and artifact suggestions

**Changes Required:**

1. **Milestone Auto-Generation**
   - Create milestone at end of each phase
   - Name based on phase: "Research & Analyze" → "Research complete"
   - Pre-populate in DELIVERABLES stage

2. **Artifact Inference**
   - Extract artifacts mentioned in challenge/activities
   - "Design composting system proposal" → artifacts: ["Composting system design", "School board proposal"]

3. **Rubric Criteria Templates**
   - Based on project type and challenge
   - Default to 4-5 criteria aligned to phases
   - E.g., "Research quality", "Design feasibility", "Presentation clarity"

**Success Criteria:**
- DELIVERABLES stage pre-populated with smart suggestions
- Teacher only needs to refine, not start from scratch
- Milestones align with phase timeline

---

### PHASE 4: ENHANCED JOURNEY EXPERIENCE
**Goal:** Rich, visual journey planning

**Changes Required:**

1. **Visual Timeline Preview**
   ```
   [Week 1-2] Research ──> [Week 3] Ideate ──> [Week 4-5] Build ──> [Week 6] Present
   ```

2. **Activity Suggestions Per Phase**
   - AI suggests 2-3 activities per phase based on:
     - Subject area
     - Challenge type
     - Available resources
     - Duration

3. **Resource Recommendations**
   - Suggest resources aligned to phases
   - "Research phase needs: expert interview guide, data collection template"

**Success Criteria:**
- Visual timeline shows week-by-week plan
- AI provides helpful activity suggestions
- Resource library aligned to phases

---

### PHASE 5: DELIVERABLES SOPHISTICATION
**Goal:** Complete run-of-show with assessments

**Changes Required:**

1. **Milestone Scheduling**
   ```typescript
   milestones: [
     {
       name: "Research complete",
       dueDate: "End of Week 2",  // NEW
       phaseId: "research-analyze"  // NEW
     }
   ]
   ```

2. **Rubric Builder**
   - Multi-level rubrics (approaching, proficient, advanced)
   - Criteria mapped to learning objectives
   - Student-friendly language

3. **Assignment Templates**
   - Generate assignment descriptions from milestones
   - Include success criteria
   - Provide exemplars

**Success Criteria:**
- Complete run-of-show with dated milestones
- Multi-level rubrics ready to use
- Assignment sheets ready to copy to LMS

---

## IMMEDIATE ACTION ITEMS (DO NOT CODE YET)

### Investigation Tasks:
1. ✅ Analyze current parsing logic
2. ✅ Identify why JOURNEY validation fails
3. ✅ Map data flow from wizard → journey → deliverables
4. ⏳ Test current behavior with sample inputs
5. ⏳ Document edge cases

### Design Tasks:
1. ⏳ Design improved parsePhases() algorithm
2. ⏳ Specify AI prompt improvements
3. ⏳ Define duration normalization rules
4. ⏳ Create phase template library

### Validation Tasks:
1. ⏳ Write test cases for phase parsing
2. ⏳ Define success criteria per phase
3. ⏳ Create teacher input examples (good/bad)

---

## KEY INSIGHTS

1. **The Gap:** Assessment is too lenient, parsing is too strict
   - Assessment: "Does it LOOK like phases?" ✅
   - Parsing: "Can I extract structured data?" ❌
   - Result: Passes assessment, fails validation, gets stuck

2. **The Duration Disconnect:** Wizard captures duration but it's not used
   - Teachers provide "6 weeks" but journey doesn't reference it
   - Phases don't map to timeline
   - Milestones aren't date-aware

3. **The Natural Language Problem:** Teachers write naturally, parser expects structure
   - Need: "Phase 1: Research - conduct audit, interview"
   - Reality: "First students will research by conducting an audit..."
   - Solution: AI-powered extraction OR better prompting

4. **The Missing Link:** Journey → Deliverables connection is weak
   - Phases should auto-generate milestone suggestions
   - Activities should suggest artifacts
   - Timeline should inform rubric depth

5. **Deliverables ≠ Assignments (Clarification):**
   - Deliverables = What students produce at END
   - Milestones = Checkpoints DURING the journey
   - Assignments = Activities IN each phase
   - Run-of-show = Complete timeline with all three

---

## NEXT STEPS

**Before any coding:**
1. User validates this analysis
2. Prioritize phases (probably start with Phase 1)
3. Create detailed technical specs for chosen phase
4. Write test cases
5. THEN implement

**Questions for User:**
1. Does this analysis match your understanding of the issue?
2. Are the data structures (phases, milestones, artifacts) what you envisioned?
3. Should we start with Phase 1 (immediate fix) or different priority?
4. How should duration be specified? (weeks, days, months, flexible?)
5. What does "assignment" mean in your context? (single task or full lesson plan?)
