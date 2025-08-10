# Learning Journey Complete Redesign

## What We Want at the End (Objective)
A clear, actionable learning journey that shows:
1. **Timeline with milestones** - When key things happen
2. **Phase-specific activities** - What students do in each phase
3. **Logical progression** - How learning builds from one phase to the next
4. **Student agency points** - Where students have choice/freedom
5. **Optional resources** - Support materials if needed

## Current Problems (Why It's Failing)
- Asking for "phases" without explaining what phases are
- Activities disconnected from phases
- Resources floating without context
- Can't reorder phases logically
- Different UI patterns for each step
- No iteration - everything asked at once
- No cohesive plan at the end

## Proposed New Flow

### Step 1: Timeline & Milestones
**Question:** "How long will this project take, and what are the key checkpoints?"

**Scaffolding:**
- Start with duration from wizard (e.g., "You said 4 weeks")
- "Let's break this into manageable chunks with clear checkpoints"
- Provide templates: "For a 4-week project, you might have 3-4 major milestones"

**Examples by duration:**
- 2 weeks: Launch → Mid-point check → Final presentation
- 4 weeks: Explore → Design → Create → Share
- 8 weeks: Research → Prototype → Test → Refine → Present

**Output:** Timeline with 3-5 milestones

### Step 2: Define Each Phase (Iteratively)
**For each milestone/phase:**

**Question:** "Phase 1: [Launch/Explore/Research] - What's happening here?"

**Sub-questions:**
a) "What's the main goal of this phase?"
b) "What will students DO?" (activities)
c) "How will you know they're ready to move on?"

**Scaffolding:**
- Focus on ONE phase at a time
- Provide phase-appropriate suggestions
- Allow editing/refining before moving on

**Output:** Complete definition of each phase with activities

### Step 3: Student Agency Points (Optional for Higher Grades)
**Question:** "Where can students make choices in their learning?"

**Options:**
- Topic selection within theme
- Method of investigation
- Final product format
- Presentation audience
- Assessment criteria

**Output:** Specific agency points mapped to phases

### Step 4: Resources (Optional/Contextual)
**Question:** "What support might you need?" 

**Categories:**
- Must-have materials
- Nice-to-have resources
- External experts
- Digital tools

**Output:** Resource list (if provided)

## Universal Suggestion Pattern

Instead of different UI for each step, use consistent pattern:

```
[Question/Prompt]

[Input Field with inline suggestions]

[Three Helper Buttons]
- Templates (grade-appropriate starting points)
- Examples (see what others have done)
- Ideas (AI suggestions based on context)

[Current Context Display]
- Shows what's been captured so far
- Allows editing previous decisions
```

## Information Architecture

```
Learning Journey
├── Timeline
│   ├── Duration (from wizard)
│   └── Milestones (3-5 checkpoints)
│
├── Phases (one for each milestone)
│   ├── Phase 1
│   │   ├── Goal
│   │   ├── Activities (2-4)
│   │   └── Success Criteria
│   ├── Phase 2
│   │   ├── Goal
│   │   ├── Activities (2-4)
│   │   └── Success Criteria
│   └── Phase 3...
│
├── Student Agency (optional)
│   ├── Choice Points
│   └── Flexibility Areas
│
└── Resources (optional)
    ├── Required Materials
    └── Support Resources
```

## Implementation Strategy

### Phase 1: Core Flow
1. Build timeline/milestone selector
2. Create phase-by-phase builder
3. Connect activities to specific phases
4. Generate cohesive output

### Phase 2: Enhancements
1. Add student agency options
2. Include resource suggestions
3. Create edit/refine capabilities

### Phase 3: Polish
1. Universal suggestion UI
2. Progress tracking
3. Export capabilities

## Success Criteria
- Teacher can complete in 5-10 minutes
- Output is immediately actionable
- Clear connection between all elements
- Appropriate student agency
- No abstract concepts without scaffolding

## Key Design Principles

1. **Progressive Disclosure** - One concept at a time
2. **Contextual Help** - Explain terms as we go
3. **Iterative Building** - Can refine each piece
4. **Visual Coherence** - See the journey building
5. **Flexibility** - Works for different teaching styles
6. **Simplicity** - No educational jargon

## Next Steps
1. Create mockups of new flow
2. Build timeline/milestone component
3. Implement phase-by-phase builder
4. Test with sample data
5. Iterate based on feedback