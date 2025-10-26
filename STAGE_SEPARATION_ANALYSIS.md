# Project Builder Stage Separation Analysis

**Date:** 2025-10-24
**Context:** Evaluating whether to break the continuous 5-stage builder flow into 3 discrete dashboard-managed stages

---

## Executive Summary

**Recommendation:** Yes, implement stage separation with a phased rollout. The benefits significantly outweigh the complexity, especially for the target teacher persona.

**Key Insight:** Teachers don't build PBL projects in one sitting. The current continuous flow fights against their natural workflow: ideate during planning periods, refine learning journeys with colleagues, finalize deliverables after reviewing standards. Stage separation aligns the tool with how teachers actually work.

**MVP Scope:** 3-column dashboard + stage-to-stage transitions + enhanced save/resume. Defer: bulk operations, templates, cross-project insights.

---

## 1. Current State Pain Points

### 1.1 User Experience Issues

**Cognitive Overload:**
- Teachers face 5 stages in rapid succession (Big Idea → EQ → Challenge → Journey → Deliverables)
- Journey stage requires deep thinking about learning progressions (often 20-45 min)
- Deliverables require alignment with standards, rubrics, assessment strategies
- **Result:** Abandonment at Journey stage (anecdotal from current flow)

**No Natural Stopping Points:**
- If a teacher needs to step away (bell rings, meeting starts), they lose context
- Returning to ChatMVP mid-stage is disorienting ("Where was I?")
- No clear "save and continue tomorrow" affordance

**Progress Opacity:**
- Dashboard shows "in progress" vs "completed" as binary states
- Teachers can't see "I have 3 projects where ideation is done but journeys aren't built yet"
- No way to prioritize "quick wins" (finish deliverables on nearly-done projects)

### 1.2 Technical Issues (from your handoff report)

**Journey Stage Bugs:**
- AI refinement status chips sometimes stuck in "AI refining…" state
- Phase customization UI has edge cases with empty/duplicate phase names
- Background AI refinement failures surface poorly

**Deliverables Stage Bugs:**
- Milestone/artifact/criteria imbalances (e.g., 5 milestones but 2 artifacts)
- "Accept all" doesn't always capture user edits to individual cards
- Regeneration loses user customizations from previous iteration

**Root Cause:** These stages do too much in one component (ChatMVP.tsx is ~800+ lines). Separation would force cleaner boundaries.

---

## 2. Proposed Architecture: 3-Stage Dashboard Model

### 2.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  My Projects Dashboard                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Stage 1    │  │   Stage 2    │  │   Stage 3    │           │
│  │  IDEATION    │  │   JOURNEY    │  │ DELIVERABLES │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│   (3 projects)      (2 projects)      (1 project)               │
│                                                                   │
│  Project Card:                                                   │
│  ┌─────────────────────────────────┐                            │
│  │ 🌱 Hero Sustainability Campaign │ ← Title (from Big Idea)    │
│  │ Last edited: 2 hours ago        │                            │
│  │ [Continue] [Delete]             │                            │
│  └─────────────────────────────────┘                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  📚 COMPLETED PROJECTS (5)                               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │   │
│  │  │ Community   │ │ Math Escape │ │ Science Lab │  ...   │   │
│  │  │ History     │ │ Room        │ │ Inquiry     │        │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Stage Definitions

**Stage 1: Ideation (Quick, Conversational)**
- Combines: Big Idea + Essential Question + Challenge
- **Goal:** Capture the spark, establish scope
- **Time:** 5-10 minutes
- **Exit Criteria:** Big Idea has specificity score >60, EQ and Challenge are defined
- **UI:** Current ChatMVP experience for these 3 stages, ends with "Your idea is ready! → Build Learning Journey"

**Stage 2: Learning Journey (Deep Work)**
- **Goal:** Define learning progression, phases, activities
- **Time:** 20-45 minutes
- **Inputs:** Ideation data (Big Idea, EQ, Challenge) flows in automatically
- **Exit Criteria:** Journey has ≥3 phases, each phase has title + description
- **UI:**
  - Template loads immediately with ideation context
  - AI refines in background (current flow, but isolated)
  - Richer editing: drag-to-reorder phases, add/remove, preview as student journey
- **New Feature:** "Save and continue later" explicit button (not just autosave)

**Stage 3: Deliverables (Standards Alignment)**
- **Goal:** Define milestones, artifacts, success criteria
- **Time:** 15-30 minutes
- **Inputs:** Ideation + Journey data flows in
- **Exit Criteria:** At least 1 milestone, 1 artifact, 1 success criterion
- **UI:**
  - Template loads with journey context (milestones map to journey phases)
  - AI refines in background
  - Standards picker (if applicable)
  - Rubric preview
- **Completion:** "Finalize Project" triggers showcase generation → Review

### 2.3 Data Flow Between Stages

```typescript
// Shared Blueprint Schema (Firestore + UnifiedStorage)
interface Blueprint {
  id: string;
  userId: string;
  stage: 'ideation' | 'journey' | 'deliverables' | 'completed';

  // Stage 1 outputs
  ideation: {
    bigIdea: string;
    essentialQuestion: string;
    challenge: string;
    specificityScore: number;
    completedAt?: Timestamp;
  };

  // Stage 2 outputs (empty until stage 2)
  journey?: {
    phases: Phase[];
    aiRefinementStatus: 'pending' | 'refining' | 'complete' | 'failed';
    completedAt?: Timestamp;
  };

  // Stage 3 outputs (empty until stage 3)
  deliverables?: {
    milestones: Milestone[];
    artifacts: Artifact[];
    criteria: SuccessCriterion[];
    aiRefinementStatus: 'pending' | 'refining' | 'complete' | 'failed';
    completedAt?: Timestamp;
  };

  // Stage 3 completion
  showcase?: ProjectShowcase;

  updatedAt: Timestamp;
}
```

**Key Principle:** Each stage writes to its own namespace; reads from previous stages' data (immutable after transition).

---

## 3. User Flow Comparison

### 3.1 Current Flow (Continuous)

```
Teacher Journey (Single Session):
1. Click "Get Started"
2. Chat UI: Big Idea (5 min)
3. Chat UI: Essential Question (3 min)
4. Chat UI: Challenge (3 min)
5. Chat UI: Journey (30 min) ← OFTEN INTERRUPTED HERE
   - If interrupted: lose context, hard to resume
6. Chat UI: Deliverables (20 min)
7. "Complete Project" → Review

Total Time: ~61 minutes (continuous)
Abandonment Risk: High at step 5
```

### 3.2 Proposed Flow (Stage-Separated)

```
Teacher Journey (Multi-Session):

Session 1 (Planning Period, 10 min):
1. Dashboard → "New Project"
2. Stage 1 Builder: Big Idea + EQ + Challenge
3. "Save → Build Journey Later"
4. Returns to Dashboard (project now in "Journey" column)

Session 2 (Prep Time Next Day, 30 min):
1. Dashboard → Click project in "Journey" column
2. Stage 2 Builder: Journey phases (sees ideation context at top)
3. "Save → Add Deliverables Later"
4. Returns to Dashboard (project now in "Deliverables" column)

Session 3 (After School, 20 min):
1. Dashboard → Click project in "Deliverables" column
2. Stage 3 Builder: Milestones + Artifacts + Criteria
3. "Finalize Project" → Review
4. Dashboard shows project in "Completed" section

Total Time: ~60 minutes (3 sessions)
Abandonment Risk: Low (clear progress, easy resume)
```

**Key Difference:** Teachers can see progress, prioritize projects, work in chunks aligned with their schedule.

---

## 4. Benefits Analysis

### 4.1 For Teachers (User Experience)

**✅ Reduced Cognitive Load**
- Focus on one type of thinking per session (ideation vs. learning design vs. assessment)
- Natural alignment with how teachers plan (brainstorm → sequence → assess)

**✅ Flexible Time Management**
- Start a project during a 15-minute gap, finish journey during planning period
- "Quick wins": See projects close to completion, prioritize finishing them

**✅ Clearer Progress Tracking**
- Visual dashboard shows exactly where each project stands
- Satisfying to move projects across columns (like Kanban)

**✅ Lower Stakes Experimentation**
- Can start 5 ideation projects, build journeys for the 2 best ones
- Less "I invested an hour and it's not quite right" sunk cost

### 4.2 For Development (Technical)

**✅ Component Isolation**
- Break ChatMVP.tsx (~800 lines, 5 stages) into:
  - `IdeationBuilder.tsx` (~300 lines, stages 1-3)
  - `JourneyBuilder.tsx` (~250 lines, stage 4)
  - `DeliverablesBuilder.tsx` (~250 lines, stage 5)
- Easier testing, debugging, feature iteration

**✅ Error Containment**
- Journey AI bug doesn't block starting new projects
- Deliverables UI issue doesn't corrupt ideation data

**✅ Clearer State Transitions**
- Explicit "stage completion" event (analytics, telemetry)
- Easier to add hooks: "On journey complete, suggest next steps"

**✅ Incremental Loading**
- Dashboard loads metadata only (fast)
- Full project data loads when entering a stage (lazy)

### 4.3 For Product (Strategic)

**✅ Feature Expansion Hooks**
- Stage 1 → Add "Duplicate Project" (reuse ideation, new journey)
- Stage 2 → Add "Journey Templates" (Science Inquiry, Historical Investigation)
- Stage 3 → Add "Import Standards" (Common Core, NGSS)

**✅ Collaboration Paths**
- Future: "Share this ideation with a colleague for feedback"
- Future: "Co-design journey with another teacher"

**✅ Analytics & Insights**
- Track stage completion rates (where do teachers get stuck?)
- A/B test variations per stage (different AI prompts for Journey)

---

## 5. Challenges & Mitigations

### 5.1 Challenge: Increased Navigation Complexity

**Risk:** Teachers click between dashboard/stages more, lose flow
**Mitigation:**
- Breadcrumbs: `Dashboard > Hero Campaign > Journey Builder`
- Quick actions on cards: "Continue Journey" (direct deep link)
- Auto-navigate: On stage completion, offer "Build Next Stage →" (skip dashboard)

### 5.2 Challenge: Data Synchronization

**Risk:** Ideation data changes after journey is built (inconsistency)
**Mitigation:**
- **Lock ideation after transition:** Once in Journey stage, ideation is read-only (show edit icon with warning)
- **Versioning (future):** Allow editing ideation, creates a new branch

### 5.3 Challenge: Onboarding Complexity

**Risk:** New teachers see empty 3-column dashboard, feel overwhelmed
**Mitigation:**
- **First-time UX:** Single "Start Your First Project" CTA, funnels to Stage 1
- **Only after Stage 1 completion:** Dashboard expands to show 3 columns
- **Tooltips:** Hover on column headers for explanation

### 5.4 Challenge: Implementation Scope

**Risk:** Breaking up ChatMVP is a large refactor, risky
**Mitigation (see Section 7):** Phased rollout, feature flag per stage

---

## 6. MVP Scope Definition

### 6.1 In Scope (MVP)

**Dashboard:**
- 3-column layout (Ideation / Journey / Deliverables)
- Completed projects section (collapsed by default)
- Project cards with title, last edited, continue/delete actions
- "New Project" button (routes to Stage 1 builder)

**Stage 1 Builder (IdeationBuilder.tsx):**
- Existing Big Idea + EQ + Challenge flow
- "Save & Build Journey Later" button (writes stage='journey', routes to dashboard)
- "Continue to Journey →" button (writes stage='journey', routes to Stage 2)

**Stage 2 Builder (JourneyBuilder.tsx):**
- Reads ideation data (immutable banner at top: "Building journey for: [Big Idea]")
- Existing journey template + AI refinement flow
- "Save & Add Deliverables Later" button
- "Continue to Deliverables →" button

**Stage 3 Builder (DeliverablesBuilder.tsx):**
- Reads ideation + journey data
- Existing deliverables template + AI refinement flow
- "Finalize Project" button (triggers showcase generation, routes to Review)

**Data Layer:**
- Add `stage` field to Blueprint schema
- Dashboard query: Filter by stage for each column
- Stage transitions update `stage` field + `completedAt` timestamp

### 6.2 Out of Scope (MVP)

**Defer to Phase 2:**
- Bulk operations (delete multiple, archive)
- Search/filter on dashboard
- Templates per stage
- Sharing/collaboration
- Detailed analytics dashboard

**Defer to Phase 3:**
- Editing locked stages (versioning)
- AI-suggested next actions ("Finish 2 projects in Deliverables before starting new ones")
- Cross-project insights ("Your most common journey phase types")

---

## 7. Phased Rollout Plan

### Phase 0: Preparation (1 week)

**Goal:** Set up infrastructure without changing UX

**Tasks:**
1. Add `stage` field to Blueprint schema (default: 'ideation' for existing projects)
2. Create feature flag: `VITE_ENABLE_STAGE_SEPARATION` (default: false)
3. Write dashboard layout component (reads flag, shows old flow if disabled)
4. Add telemetry: Track stage transitions

**Validation:**
- Build succeeds with flag off (no UX change)
- Smoke test passes

### Phase 1: Dashboard + Stage 1 (1-2 weeks)

**Goal:** Validate dashboard UX, isolate ideation builder

**Tasks:**
1. Implement 3-column dashboard (behind flag)
2. Extract IdeationBuilder.tsx from ChatMVP (stages 1-3)
3. Add "Save & Continue Later" button (routes to dashboard)
4. Dashboard "Continue" button routes to IdeationBuilder with blueprint ID

**Validation:**
- Internal testing: Can start project, save, resume from dashboard
- Smoke test: IdeationBuilder renders, transitions work

**Rollout:**
- Enable flag for internal users (dogfood)
- Collect feedback: Is dashboard clear? Do save/resume work?

### Phase 2: Stage 2 (Journey) (1-2 weeks)

**Goal:** Isolate Journey builder, fix known bugs in isolation

**Tasks:**
1. Extract JourneyBuilder.tsx from ChatMVP
2. Add ideation context banner (read-only Big Idea display)
3. Fix AI refinement status bugs (simpler to debug in isolation)
4. Add "Save & Continue Later" + "Continue to Deliverables" buttons

**Validation:**
- Internal testing: Complete Stage 1 → Stage 2 transition
- Journey AI refinement works reliably
- Smoke test: JourneyBuilder renders, saves, transitions

**Rollout:**
- Enable for internal + small beta group (5-10 teachers)
- Collect feedback: Is journey editing clearer? Bugs resolved?

### Phase 3: Stage 3 (Deliverables) + Completion (1-2 weeks)

**Goal:** Full stage separation, migrate all users

**Tasks:**
1. Extract DeliverablesBuilder.tsx from ChatMVP
2. Fix known deliverables bugs (accept all, regeneration)
3. Implement "Finalize Project" flow (showcase generation)
4. Dashboard "Completed Projects" section with cloud-first load
5. Migration script: Set `stage` for existing projects based on completeness

**Validation:**
- Internal testing: End-to-end flow (Stage 1 → 2 → 3 → Review)
- Smoke test: Full flow works
- Load test: Dashboard with 20+ projects (performance check)

**Rollout:**
- Enable flag for all users (default: true)
- Monitor telemetry: Stage completion rates, error rates
- Sunset old ChatMVP flow after 2 weeks of stable usage

### Phase 4: Refinement (Ongoing)

**Goal:** Iterate based on real usage data

**Tasks:**
- Add quick actions on project cards (duplicate, archive)
- Improve AI refinement reliability per stage
- Add stage-specific templates (if demand exists)
- Build analytics dashboard for internal insights

---

## 8. Success Metrics

### 8.1 Leading Indicators (Week 1-2 after rollout)

- **Dashboard engagement:** % of sessions that start on dashboard (vs. direct deep link)
- **Stage save rate:** % of Stage 1 completions that "save for later" vs. "continue to journey"
- **Multi-session projects:** % of projects worked on across 2+ sessions

### 8.2 Lagging Indicators (Month 1-3)

- **Completion rate:** % of started projects that reach "Finalize" (expect increase from current ~40%?)
- **Time to completion:** Median days from start to finalize (expect increase, but that's OK if completion rate rises)
- **Stage abandonment:** % of projects abandoned at each stage (expect lower than current Journey abandonment)
- **Error rate:** Journey/Deliverables bug reports per 100 projects (expect decrease)

### 8.3 Qualitative Signals

- User feedback: "I love that I can work on projects in chunks"
- Support tickets: Decrease in "I lost my progress" / "How do I resume?"
- Feature requests: "Can I duplicate a journey across projects?" (signals engagement)

---

## 9. Alternative Considered: Hybrid Approach

**Concept:** Keep continuous flow as default, add "Save & Exit Anytime" that snapshots to dashboard

**Pros:**
- Smaller implementation (no builder extraction)
- Preserves current "guided" feel

**Cons:**
- Doesn't address root cause (cognitive overload, unclear progress)
- Dashboard still shows binary "in progress" state (not helpful)
- Doesn't force component isolation (bugs remain in monolithic ChatMVP)

**Verdict:** Reject. This is a band-aid, not a fix. Stage separation aligns with teacher workflows and forces technical hygiene.

---

## 10. Recommendation Summary

**Ship stage separation as MVP.**

**Why:**
1. **User Alignment:** Matches how teachers actually work (ideate quickly, refine deeply, assess carefully)
2. **Technical Wins:** Forces component isolation, easier debugging, clearer state management
3. **Product Flexibility:** Unlocks stage-specific features, templates, analytics
4. **Manageable Risk:** Phased rollout with feature flags de-risks implementation

**MVP Scope:**
- 3-column dashboard
- 3 isolated builders (Ideation, Journey, Deliverables)
- Save/resume between stages
- Existing AI flows per stage

**Timeline:** 4-6 weeks (assuming 1 eng, part-time)

**First Step:** Implement Phase 0 (schema + flag) and validate with stakeholders before proceeding.

---

## 11. Open Questions for Stakeholders

1. **Onboarding:** Should first-time users see simplified dashboard (1 column) or full 3-column immediately?
2. **Editing Locked Stages:** If a teacher finishes Journey and starts Deliverables, then realizes Big Idea needs tweaking—what should happen?
   - Option A: Allow edits, warn that Journey may need updates
   - Option B: Lock ideation, force "duplicate project" workflow
   - Option C: Full versioning (complex, defer to Phase 3)
3. **Mobile UX:** 3 columns won't fit on mobile. Should mobile show tabs? Single scrollable list with stage badges?
4. **Naming:** Are "Ideation / Journey / Deliverables" clear to teachers? Alternatives: "Plan / Design / Assess" or "Idea / Learning / Outcomes"?

---

## Appendix A: Code Changes (High-Level)

```
New Files:
  src/features/dashboard/
    ProjectDashboard.tsx          # 3-column layout
    ProjectCard.tsx                # Card component per column
    useDashboardProjects.ts        # Hook to query by stage

  src/features/builders/
    IdeationBuilder.tsx            # Stages 1-3 (extracted from ChatMVP)
    JourneyBuilder.tsx             # Stage 4 (extracted from ChatMVP)
    DeliverablesBuilder.tsx        # Stage 5 (extracted from ChatMVP)

  src/features/builders/shared/
    StageTransitionButton.tsx      # "Save & Continue" / "Continue to Next"
    ReadOnlyContextBanner.tsx      # Shows ideation data in later stages

Modified Files:
  src/AppRouter.tsx                # Add routes for /app/builder/:stage/:id
  src/hooks/useBlueprintDoc.ts     # Add stage field handling
  src/services/unifiedStorage.ts   # Add stage-specific save methods
  src/config/featureFlags.ts       # Add VITE_ENABLE_STAGE_SEPARATION

Deprecated (after Phase 3):
  src/features/chat-mvp/ChatMVP.tsx  # Replaced by 3 builders
```

---

## Appendix B: Teacher Persona (Target User)

**Ms. Elena Rodriguez, 8th Grade Science Teacher**

**Context:**
- Teaches 4 sections, ~120 students
- 1 planning period (45 min), after-school time limited (coaching)
- Wants to run 2-3 PBL units per year (currently does 1)

**Current Pain with Continuous Flow:**
- Starts project during planning period, gets 20 min in
- Bell rings, has to save/exit (unclear how to resume)
- Next planning period, starts new project instead (forgot context)
- Result: 3 abandoned projects, 1 completed (low ROI)

**With Stage Separation:**
- Planning Period 1: Ideates 3 project ideas (10 min each = 30 min)
- Planning Period 2: Builds journey for best idea (45 min, completes)
- Planning Period 3: Builds deliverables (30 min, completes)
- Dashboard shows: 2 ideas ready for journeys, 1 nearly-complete project
- Result: Feels productive, completes 2 projects (high ROI)

**Key Quote:** "I need to see where I left off and jump right back in. I don't have time to remember what I was doing last Tuesday."

---

**End of Analysis**
