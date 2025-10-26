# Stage Separation MVP - Complete Implementation Handoff

**Date:** 2025-10-26
**For:** Next Claude session
**Status:** Ready to implement
**Decision:** NO backward compatibility needed (pre-launch)

---

## TL;DR - What You're Building

Break the current monolithic ChatMVP flow into **3 separate stage screens** with a **dashboard that shows progress**:

1. **Ideation Stage** (Big Idea + Essential Question + Challenge) → 5-10 min
2. **Journey Stage** (Learning phases + activities) → 20-45 min
3. **Deliverables Stage** (Milestones + artifacts + criteria) → 15-30 min

**Why:** Teachers don't build projects in one sitting. They need clear stopping points, progress visibility, and easy resume.

**Approach:** Extract components from ChatMVP, add stage routing, update dashboard to show 3 columns.

---

## Critical Context: What Already Exists

### ✅ Files You'll Modify
- `src/AuthenticatedApp.tsx` - Add stage routes here
- `src/components/Dashboard.jsx` - Modify to show 3 columns
- `src/components/ProjectCard.jsx` - Update to route by stage
- `src/features/chat-mvp/ChatMVP.tsx` - Extract logic from this 800-line file

### ✅ Files You'll Reuse (Don't Rebuild!)
- `src/features/chat-mvp/domain/stages.ts` - Stage validation logic
- `src/features/chat-mvp/domain/specificityScorer.ts` - Big Idea scoring
- `src/features/chat-mvp/domain/journeyTemplate.ts` - Immediate journey template
- `src/features/chat-mvp/domain/journeyMicroFlow.ts` - Background AI refinement
- `src/features/chat-mvp/domain/deliverablesMicroFlow.ts` - Deliverables template
- `src/features/chat-mvp/domain/deliverablesAI.ts` - Background AI refinement
- `src/features/chat-mvp/domain/courseDescriptionGenerator.ts` - Completion flow
- `src/features/chat-mvp/domain/projectShowcaseGenerator.ts` - Completion flow
- `src/utils/stageProgress.ts` - Has `computeStageProgress(blueprint)` function

### ✅ Data Model (Already Partially There!)
`src/services/UnifiedStorageManager.ts` already has:
```typescript
export interface UnifiedProjectData {
  id: string;
  userId: string;
  title: string;
  stage?: string; // ← ALREADY EXISTS (line 44)
  ideation?: Record<string, any>; // ← ALREADY EXISTS (line 38)
  journey?: Record<string, any>; // ← ALREADY EXISTS (line 39)
  deliverables?: Record<string, any>; // ← ALREADY EXISTS (line 40)
  capturedData?: Record<string, any>;
  wizardData?: Record<string, any>;
  showcase?: Record<string, any>;
  // ... other fields
}
```

**What you need to ADD:**
```typescript
// Add to UnifiedProjectData interface
currentStage?: 'ideation' | 'journey' | 'deliverables' | 'review';
stageStatus?: {
  ideation: 'not_started' | 'in_progress' | 'complete';
  journey: 'not_started' | 'in_progress' | 'complete';
  deliverables: 'not_started' | 'in_progress' | 'complete';
};
```

---

## Implementation Checklist (Do in Order)

### Phase 1: Infrastructure (Day 1)

- [ ] **Update UnifiedStorageManager types**
  - Add `currentStage` and `stageStatus` fields to `UnifiedProjectData`
  - Update `saveProject()` to persist these fields
  - Test: Can save/load projects with new fields

- [ ] **Create stage status helper**
  - File: `src/utils/stageStatus.ts`
  - Export: `deriveStageStatus(blueprint) => { currentStage, stageStatus }`
  - Logic: Compute from existing ideation/journey/deliverables data
  - Use existing `computeStageProgress()` as reference

- [ ] **Add stage routes**
  - File: `src/AuthenticatedApp.tsx`
  - Add routes:
    ```tsx
    <Route path="/app/projects/:id/ideation" element={<IdeationStage />} />
    <Route path="/app/projects/:id/journey" element={<JourneyStage />} />
    <Route path="/app/projects/:id/deliverables" element={<DeliverablesStage />} />
    ```
  - Update redirect: `/app/blueprint/:id` → `/app/projects/:id/ideation`

### Phase 2: Shared Controller (Day 1-2)

- [ ] **Create useStageController hook**
  - File: `src/features/builder/useStageController.ts`
  - Inputs: `projectId`, `stage`, `blueprint`, `unifiedStorage`
  - Responsibilities:
    - Debounced autosave (reuse logic from ChatMVP)
    - Stage gating via `stages.ts#validate`
    - Stage transitions (update `currentStage` + `stageStatus`)
    - Telemetry events
  - Test: Can save, transition, track events

### Phase 3: Dashboard (Day 2)

- [ ] **Update Dashboard to show 3 columns**
  - File: `src/components/Dashboard.jsx`
  - Query projects from UnifiedStorage
  - Use `deriveStageStatus(blueprint)` to group by stage
  - Three columns: Ideation / Journey / Deliverables
  - Completed section at bottom (collapsed)
  - Test: Projects appear in correct columns

- [ ] **Update ProjectCard routing**
  - File: `src/components/ProjectCard.jsx`
  - If completed → `/app/project/:id/preview`
  - Else → `/app/projects/:id/${currentStage}`
  - Test: Clicking card routes to correct stage

### Phase 4: Stage 1 - Ideation (Day 3-4)

- [ ] **Extract IdeationStage component**
  - File: `src/features/builder/IdeationStage.tsx`
  - Extract from ChatMVP:
    - BIG_IDEA stage (suggestions, specificity scoring, acceptance)
    - ESSENTIAL_QUESTION stage (suggestions, acceptance)
    - CHALLENGE stage (suggestions, acceptance)
  - Wire to `useStageController`
  - Add buttons:
    - "Save & Continue Later" → update stageStatus, route to dashboard
    - "Continue to Journey →" → mark ideation complete, route to journey
  - Test: Can complete ideation, save, resume

### Phase 5: Stage 2 - Journey (Day 5-6)

- [ ] **Extract JourneyStage component**
  - File: `src/features/builder/JourneyStage.tsx`
  - Extract from ChatMVP:
    - JOURNEY stage (template, AI refine, phase editing)
  - Show ideation context at top (read-only banner)
  - Wire to `useStageController`
  - Background AI refinement:
    - Immediate: `journeyTemplate.ts` (sync)
    - Background: Dynamic import `journeyMicroFlow.ts`
    - Status chips: "Template Ready" / "AI Refining..." / "AI Enhanced ✓"
  - Add buttons:
    - "Save & Continue Later" → dashboard
    - "Continue to Deliverables →" → mark journey complete, route to deliverables
  - Test: Can build journey, AI refines, save, resume

### Phase 6: Stage 3 - Deliverables (Day 7-8)

- [ ] **Extract DeliverablesStage component**
  - File: `src/features/builder/DeliverablesStage.tsx`
  - Extract from ChatMVP:
    - DELIVERABLES stage (template, AI refine, milestone/artifact/criteria editing)
  - Show ideation + journey context at top
  - Wire to `useStageController`
  - Background AI refinement:
    - Immediate: `deliverablesMicroFlow.ts` (sync)
    - Background: Dynamic import `deliverablesAI.ts`
    - Status chips: "Template Ready" / "AI Refining..." / "AI Enhanced ✓"
  - Add "Finalize Project" button → triggers completion flow
  - Test: Can build deliverables, AI refines, finalize

- [ ] **Wire completion flow**
  - On "Finalize Project":
    - Generate course description (`courseDescriptionGenerator.ts`)
    - Generate showcase (`projectShowcaseGenerator.ts`)
    - Save to UnifiedStorage
    - Attempt cloud save (best-effort, non-blocking)
    - Run hero transform (if enabled)
    - Navigate to `/app/projects/:id/review`
  - Reuse existing completion logic from ChatMVP

### Phase 7: Testing & Polish (Day 9-10)

- [ ] **Smoke tests per stage**
  - `src/features/builder/__tests__/IdeationStage.smoke.test.tsx`
  - `src/features/builder/__tests__/JourneyStage.smoke.test.tsx`
  - `src/features/builder/__tests__/DeliverablesStage.smoke.test.tsx`
  - Test: Each stage renders, accepts suggestions, advances

- [ ] **E2E test**
  - Create → complete ideation → dashboard → resume journey → complete → resume deliverables → finalize → review
  - Test: Full flow works end-to-end

- [ ] **Remove legacy ChatMVP routing**
  - Comment out `/app/blueprint/:id` route (or redirect to new routes)
  - Keep ChatMVP.tsx file for reference during extraction

- [ ] **Build & validate**
  - Run: `npm run build`
  - Run: `npm test`
  - Run: `npm run lint`

---

## Key Architectural Decisions

### 1. Sequential Stages (MVP)
- Teachers must complete Ideation before Journey, Journey before Deliverables
- Ideation becomes **read-only** once Journey starts
- Rationale: Simpler data flow, prevents inconsistencies
- Future: Add non-linear option with versioning

### 2. Lazy Stage Status Computation
- Don't migrate existing projects
- Compute `currentStage` and `stageStatus` on-demand when loading
- Store computed values on next save
- Rationale: No risky migration, works with existing data

### 3. Shared Controller Hook
- `useStageController` centralizes autosave, gating, transitions, telemetry
- Avoids duplicating logic across 3 stage components
- Single source of truth for stage behavior

### 4. Reuse Domain Logic
- Don't rewrite AI flows, validation, templates
- Import from `src/features/chat-mvp/domain/*`
- Only rebuild UI layer (stage components)

---

## Data Flow Example

### Creating a New Project
```
1. Dashboard → "New Project" button
2. Create blueprint ID, route to /app/projects/:id/ideation
3. IdeationStage loads with empty blueprint
4. User completes Big Idea → autosave to UnifiedStorage
5. User completes EQ → autosave
6. User completes Challenge → autosave
7. User clicks "Continue to Journey" →
   - Mark ideation.completedAt
   - Set stageStatus.ideation = 'complete'
   - Set currentStage = 'journey'
   - Route to /app/projects/:id/journey
8. Dashboard shows project in "Journey" column
```

### Resuming a Project
```
1. User opens Dashboard
2. Dashboard queries UnifiedStorage for all projects
3. For each project, call deriveStageStatus(blueprint)
4. Group projects by currentStage into 3 columns
5. User clicks project card in "Journey" column
6. Route to /app/projects/:id/journey
7. JourneyStage loads blueprint, shows ideation context (read-only)
8. User continues working
```

---

## Code Extraction Guide

### From ChatMVP.tsx (~800 lines) → 3 Stage Components

**IdeationStage.tsx (~300 lines):**
- Copy stage machine logic for `BIG_IDEA`, `ESSENTIAL_QUESTION`, `CHALLENGE`
- Copy suggestion rendering and acceptance handlers
- Copy specificity scoring UI
- Wire to `useStageController` for autosave/transitions

**JourneyStage.tsx (~250 lines):**
- Copy stage machine logic for `JOURNEY`
- Copy journey template loading (`journeyTemplate.ts`)
- Copy background AI refine (`journeyMicroFlow.ts` dynamic import)
- Copy phase editing UI (rename, reorder, add/remove)
- Copy acceptance handler (normalize phases)
- Wire to `useStageController`

**DeliverablesStage.tsx (~250 lines):**
- Copy stage machine logic for `DELIVERABLES`
- Copy deliverables template loading (`deliverablesMicroFlow.ts`)
- Copy background AI refine (`deliverablesAI.ts` dynamic import)
- Copy milestone/artifact/criteria editing UI
- Copy "Accept all" handler
- Copy "Finalize" completion flow
- Wire to `useStageController`

### What to Keep in ChatMVP (for reference)
- Chat message rendering (might reuse for stage interactions)
- AI response streaming (might reuse for AI refine status)
- Error boundaries and fallbacks

---

## Post-Refactor Bug Backlog

**Fix AFTER extraction is complete:**

### Journey Stage Bugs
- [ ] AI refinement status stuck in "refining..." (add timeout + retry)
- [ ] Prevent empty/duplicate phase names (add validation)
- [ ] Background AI failures surface poorly (add error banner with "Use template" option)

### Deliverables Stage Bugs
- [ ] "Accept all" doesn't capture in-place edits (fix event handler timing)
- [ ] Regeneration loses user customizations (preserve user edits)
- [ ] Milestone/artifact/criteria imbalances (add hints/guidance)

**Why wait:** These are easier to debug in isolated 250-line components vs. 800-line monolith.

---

## Telemetry Events to Add

```typescript
// Track these events with { stage: 'ideation' | 'journey' | 'deliverables' } tag
trackEvent('stage_viewed', { stage, projectId });
trackEvent('stage_completed', { stage, projectId, durationMs });
trackEvent('resume_click', { stage, projectId, daysSinceLastEdit });
trackEvent('ai_refine_started', { stage, projectId });
trackEvent('ai_refine_completed', { stage, projectId, durationMs });
trackEvent('ai_refine_fallback', { stage, projectId, reason });
trackEvent('save_and_continue_later', { stage, projectId });
```

---

## Testing Strategy

### Unit Tests
- `stageStatus.ts`: Derive stage status from various blueprint states
- `useStageController`: Autosave debounce, transitions, telemetry

### Smoke Tests (Jest + Testing Library)
- Each stage component renders without crashing
- Suggestions appear
- Acceptance updates blueprint
- Buttons trigger correct actions

### E2E Test (Playwright)
- Full flow: Create → Ideation → Journey → Deliverables → Review
- Save and resume: Start Ideation → save → refresh → resume from dashboard
- Navigation: Dashboard routing, breadcrumbs, back button

---

## Timeline (10 Days, 1 Engineer)

- **Days 1-2:** Infrastructure (types, controller, routes, dashboard)
- **Days 3-4:** IdeationStage extraction + smoke tests
- **Days 5-6:** JourneyStage extraction + smoke tests
- **Days 7-8:** DeliverablesStage extraction + completion flow + smoke tests
- **Days 9-10:** E2E tests, bug fixes, polish, remove legacy routes

---

## Acceptance Criteria (How You Know You're Done)

✅ **Dashboard:**
- Shows 3 columns (Ideation, Journey, Deliverables) with correct project counts
- Shows Completed section with links to Review
- "New Project" button creates project and routes to Ideation

✅ **Ideation Stage:**
- Loads with empty or existing ideation data
- Shows suggestions for Big Idea, EQ, Challenge
- Validates specificity score
- "Save & Continue Later" routes to dashboard (project appears in Journey column)
- "Continue to Journey" routes to Journey stage

✅ **Journey Stage:**
- Loads with ideation context (read-only banner)
- Shows journey template immediately
- Background AI refines (status chip updates)
- Phase editing works (rename, reorder, add/remove)
- "Save & Continue Later" routes to dashboard (project appears in Deliverables column)
- "Continue to Deliverables" routes to Deliverables stage

✅ **Deliverables Stage:**
- Loads with ideation + journey context
- Shows deliverables template immediately
- Background AI refines (status chip updates)
- Milestone/artifact/criteria editing works
- "Accept all" captures user edits
- "Finalize Project" generates showcase and routes to Review

✅ **Resume Flow:**
- Reload page → dashboard shows projects in correct columns
- Click project card → routes to correct stage
- Stage loads previous data and allows continuation

✅ **No Legacy Routes:**
- `/app/blueprint/:id` redirects to new routes
- ChatMVP not rendered in default flow

---

## Common Pitfalls to Avoid

### 1. Don't Rebuild Domain Logic
❌ **Wrong:** Rewrite AI prompt generation for journey
✅ **Right:** Import `journeyMicroFlow.ts` and call it

### 2. Don't Skip the Controller Hook
❌ **Wrong:** Duplicate autosave logic in each stage component
✅ **Right:** Create `useStageController`, use in all 3 stages

### 3. Don't Forget Lazy Status Computation
❌ **Wrong:** Add migration script to update all existing projects
✅ **Right:** Compute `currentStage` on load if missing, save on next autosave

### 4. Don't Break Review Screen
❌ **Wrong:** Change showcase generation format
✅ **Right:** Reuse existing `projectShowcaseGenerator.ts`, keep Review unchanged

### 5. Don't Test in Production First
❌ **Wrong:** Deploy without local E2E testing
✅ **Right:** Run full flow locally, test resume, test with 10+ projects

---

## Quick Reference: File Map

```
├── src/
│   ├── AuthenticatedApp.tsx              # ADD: Stage routes
│   ├── components/
│   │   ├── Dashboard.jsx                 # MODIFY: 3-column layout
│   │   └── ProjectCard.jsx               # MODIFY: Route by stage
│   ├── features/
│   │   ├── builder/                      # NEW FOLDER
│   │   │   ├── IdeationStage.tsx        # NEW: Extract from ChatMVP
│   │   │   ├── JourneyStage.tsx         # NEW: Extract from ChatMVP
│   │   │   ├── DeliverablesStage.tsx    # NEW: Extract from ChatMVP
│   │   │   ├── useStageController.ts    # NEW: Shared orchestration
│   │   │   └── __tests__/               # NEW: Smoke tests
│   │   ├── chat-mvp/
│   │   │   ├── ChatMVP.tsx              # KEEP: Reference during extraction
│   │   │   └── domain/                  # REUSE: Import these modules
│   │   │       ├── stages.ts            # Stage validation
│   │   │       ├── specificityScorer.ts # Big Idea scoring
│   │   │       ├── journeyTemplate.ts   # Immediate template
│   │   │       ├── journeyMicroFlow.ts  # Background AI
│   │   │       ├── deliverablesMicroFlow.ts  # Deliverables template
│   │   │       ├── deliverablesAI.ts    # Background AI
│   │   │       ├── courseDescriptionGenerator.ts # Completion
│   │   │       └── projectShowcaseGenerator.ts   # Completion
│   │   └── review/
│   │       └── ReviewScreen.tsx         # NO CHANGE
│   ├── services/
│   │   └── UnifiedStorageManager.ts     # MODIFY: Add currentStage, stageStatus
│   └── utils/
│       ├── stageProgress.ts             # REUSE: computeStageProgress()
│       └── stageStatus.ts               # NEW: deriveStageStatus()
```

---

## Final Notes for Next Claude

1. **Start with infrastructure** (types, controller, routes). Build succeeds before touching UI.

2. **Extract stages one at a time.** Don't try to do all 3 simultaneously.

3. **Test frequently.** After each stage extraction, verify:
   - Stage renders
   - Autosave works
   - Transitions work
   - Dashboard shows correct column

4. **Reuse, don't rebuild.** The domain logic is solid. Only extract UI layer.

5. **Keep ChatMVP as reference.** Don't delete it until all 3 stages work.

6. **Fix bugs AFTER extraction.** Don't get sidetracked debugging Journey AI during extraction.

7. **No backward compatibility.** Don't add feature flags, don't support old routes. This is the new default.

8. **Read STAGE_SEPARATION_ANALYSIS.md** for strategic context (teacher persona, benefits, metrics).

---

## Questions? Check These Files

- **Why are we doing this?** → `STAGE_SEPARATION_ANALYSIS.md` (section 1-4)
- **What already exists?** → This file (Critical Context section)
- **What's the data model?** → `src/services/UnifiedStorageManager.ts` (line 13-60)
- **How does stage validation work?** → `src/features/chat-mvp/domain/stages.ts`
- **How does AI refinement work?** → `src/features/chat-mvp/domain/journeyMicroFlow.ts` + `deliverablesAI.ts`
- **How is progress computed?** → `src/utils/stageProgress.ts`

---

**Ready to start? Begin with Phase 1, Infrastructure (Day 1). Good luck! 🚀**
