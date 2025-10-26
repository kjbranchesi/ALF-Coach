# Stage Separation MVP — Implementation Handoff (No Backward Compatibility)

Date: 2025-10-26
Owner (next session): Engineering
Status: Ready for implementation

TL;DR
- Make the segmented builder the default (no feature flag, no legacy fallback).
- Break the current monolith into three stage screens: Ideation, Journey, Deliverables.
- Add stage routes and a dashboard grouped by stage.
- Keep Review as-is; wire Deliverables “Finalize” into the existing completion pipeline.
- Fix most Journey/Deliverables bugs after extraction, not before (except P0 blockers).

Goals
- Reduce teacher cognitive load via resumable, focused stages.
- Provide an at-a-glance dashboard of project progress across stages.
- Isolate Journey and Deliverables code paths to simplify fixes and testing.
- Ship the new flow as the default (no back-compat required pre-launch).

Non-Goals (MVP)
- Collaboration/sharing, standards picker, advanced analytics.
- Per-stage cloud snapshots (keep cloud write at finalize only).
- Feature-flagged fallback to the legacy continuous ChatMVP.

## Architecture Decisions
- Routing becomes stage-centric. New canonical routes:
  - `/app/projects/:id/ideation`
  - `/app/projects/:id/journey`
  - `/app/projects/:id/deliverables`
  - `/app/projects/:id/review`
- Dashboard shows three “In Progress” columns (Ideation, Journey, Deliverables) and a “Completed” section.
- Ideation is read-only once Journey begins; editing earlier stages is via “Duplicate Project” (no versioning in MVP).
- New minimal controller hook coordinates autosave, transitions, and telemetry across stages (`useStageController`).
- Data model stores stage status — no migration complexity required since there’s no production data.

## Deliverables (What to Build)
- Stage routes + navigation (default entry at Ideation for new projects)
- Dashboard grouped by stage with resume links
- Stage screens:
  - IdeationStage (Big Idea, Essential Question, Challenge)
  - JourneyStage (phases template + background AI refine)
  - DeliverablesStage (milestones/artifacts/criteria + background AI refine)
- Persistence updates (stage status + currentStage; computed progress snapshot)
- Finalize flow from Deliverables to Review (reusing existing generators/hero transform)
- Telemetry events (`stage_viewed`, `stage_completed`, `resume_click`, AI lifecycle)

## Detailed Task Breakdown (Checklist)

1) Routing and Redirects
- Update `src/AuthenticatedApp.tsx`:
  - Add routes for `/app/projects/:id/ideation|journey|deliverables|review`.
  - Redirect `/app/blueprint/:id` to `/app/projects/:id/ideation` (we’re deprecating the monolith path).
  - “Start New Project” CTA: create ID then navigate to `/app/projects/:id/ideation`.

2) Dashboard: 3 Columns + Completed
- Modify `src/components/Dashboard.jsx`:
  - Use `computeStageProgress(blueprint)` to derive stage for each project.
  - Render three columns (Ideation, Journey, Deliverables) with cards filtered by stage.
  - Cards’ primary action goes to the appropriate stage route.
  - Completed section links to `/app/project/:id/preview` (ReviewScreen).
- Update `src/components/ProjectCard.jsx` `handleOpen` to route by stage:
  - If completed → `/app/project/:id/preview`.
  - Else → `/app/projects/:id/${currentStage || firstIncompleteStage}`.

3) Data Model (Unified Storage)
- `src/services/UnifiedStorageManager.ts` (type + index updates):
  - Add optional fields: `currentStage: 'ideation' | 'journey' | 'deliverables' | 'review'` and
    `stageStatus?: { ideation: 'not_started' | 'in_progress' | 'complete'; journey: same; deliverables: same }`.
  - Set/derive `currentStage` on save using `computeStageProgress` when not provided.
  - Include `currentStage` and `stageStatus` in the project index metadata.
- Add a helper: `src/utils/stageStatus.ts` with derivation from existing `ideation/journey/deliverables` fields (can wrap `computeStageProgress`).
- No legacy migration needed; optionally add a one-time “clear local data” note for devs.

4) Stage Controller (shared orchestration)
- New: `src/features/builder/useStageController.ts`:
  - Inputs: `projectId`, `stage`, `blueprint` snapshot, `unifiedStorage`.
  - Responsibilities:
    - Debounced autosave of captured state (avoid empty spam).
    - Stage gating via existing `validate` (from `src/features/chat-mvp/domain/stages.ts`).
    - Transitions: set `stageStatus` and `currentStage`, persist via `unifiedStorage.saveProject`.
    - Telemetry events (acceptance, AI lifecycle, resume).

5) Stage Screens (extractions from ChatMVP)
- New folder: `src/features/builder/`
  - `IdeationStage.tsx`
    - Reuse suggestion chips, specificity scoring, and `validate` for BIG_IDEA/EQ/CHALLENGE.
    - “Save & Later” sets ideation `in_progress`; “Accept” on all three → mark `complete`, set `currentStage='journey'`.
  - `JourneyStage.tsx`
    - Use `journeyTemplate.ts` for sync suggestions; background refine via dynamic `journeyMicroFlow.ts`.
    - Provide rename/reorder/add/remove; accept writes normalized phases; set `currentStage='deliverables'`.
  - `DeliverablesStage.tsx`
    - Use `deliverablesMicroFlow.ts`; background refine `deliverablesAI.ts`.
    - “Accept all” captures edits; “Finalize Project” runs completion pipeline (see 6).
  - `StageLayout.tsx` and `StageNav.tsx` (optional but recommended): top nav with read-only context banner and “Next Stage” CTA.

6) Completion Pipeline (unchanged behavior)
- On finalize in `DeliverablesStage`:
  - Generate course description + tagline (courseDescriptionGenerator).
  - Generate showcase (projectShowcaseGenerator) and validate minimal structure.
  - Save to UnifiedStorage; attempt cloud save (best-effort) if existing cloud adapters are enabled.
  - Run hero transform; navigate to `/app/projects/:id/review`.
- Reuse existing modules from `src/features/chat-mvp/domain/*` and services in `src/services/*`.

7) Telemetry
- Add events with `stage` tag: `stage_viewed`, `stage_completed`, `resume_click`,
  `ai_refine_started`, `ai_refine_completed`, `ai_refine_fallback`.
- Wire to the controller and key UI actions; reuse `trackEvent` utilities if present.

8) Remove/Contain Legacy Entry Points
- Update any direct links that open `/app/blueprint/:id` to the new route scheme.
- Keep `ChatMVP.tsx` in repo during extraction, but remove from nav/routing.
- After extraction and tests pass, plan removal of ChatMVP-specific UI that’s no longer used.

## File Touchpoints (Concrete)
- Routes: `src/AuthenticatedApp.tsx`
- Dashboard: `src/components/Dashboard.jsx`, `src/components/ProjectCard.jsx`
- Stage derivation: `src/utils/stageProgress.ts` (exists), new `src/utils/stageStatus.ts` (optional wrapper)
- Builders (new):
  - `src/features/builder/IdeationStage.tsx`
  - `src/features/builder/JourneyStage.tsx`
  - `src/features/builder/DeliverablesStage.tsx`
  - `src/features/builder/StageLayout.tsx` (optional)
  - `src/features/builder/StageNav.tsx` (optional)
- Controller (new): `src/features/builder/useStageController.ts`
- Persistence: `src/services/UnifiedStorageManager.ts` (types + index), usages of `saveProject`

## Acceptance Criteria (MVP)
- New project creation lands on `/app/projects/:id/ideation`.
- Dashboard shows three columns with correct counts; each project card resumes to the correct stage.
- Ideation → Journey → Deliverables transitions work with proper gating; autosave persists between reloads.
- Background AI refine shows status chips and never gets stuck indefinitely (timeout → “Retry”).
- “Finalize Project” generates showcase and opens Review; refresh persists the view (local-first, cloud-best-effort).
- No routes render the legacy ChatMVP in the default flow.

## Test Plan
- Unit/logic
  - Stage status derivation: conversion of blueprint → stageStatus/currentStage.
  - Controller: autosave debounce; transition updates; telemetry stubs called.
- Smoke tests (Jest + Testing Library)
  - `IdeationStage.smoke.test.tsx`: renders, accepts suggestions, advances.
  - `JourneyStage.smoke.test.tsx`: renders, rename/reorder, accept → advances.
  - `DeliverablesStage.smoke.test.tsx`: renders, accept all, finalize triggers navigation.
- E2E (Playwright)
  - Create → complete Ideation → return to dashboard → resume Journey → accept → resume Deliverables → finalize → Review loads.

## Post-Refactor Bug Backlog (Fix After Extraction)
- Journey
  - [ ] AI refinement status sometimes stuck → enforce timeout + finally path; add “Retry”.
  - [ ] Prevent empty/duplicate phase names; normalize IDs; min phase count validation.
  - [ ] Background AI failures: surface non-blocking banner with “Use template” option.
- Deliverables
  - [ ] “Accept all” must capture last in-place edits before persist.
  - [ ] Regeneration should preserve user customizations unless explicitly replaced.
  - [ ] Balance hints for milestones/artifacts/criteria with actionable guidance.

## Developer Notes
- Local data reset (optional, since no prod users):
  - In devtools: `Object.keys(localStorage).filter(k => k.startsWith('alf_project_') || k.startsWith('alf_hero_')).forEach(k => localStorage.removeItem(k))`.
- Keep imports from `src/features/chat-mvp/domain/*` to avoid re-writing domain logic.
- Follow existing lint/test scripts before PR: `npm run lint`, `npm test`, `npm run build`.

## Estimated Timeline (1 engineer)
- Week 1: Routes + Dashboard grouping; IdeationStage scaffold + controller skeleton.
- Week 2: JourneyStage extraction + background AI refine + smoke tests.
- Week 3: DeliverablesStage extraction + finalize flow + smoke tests.
- Week 4: Bug backlog pass (P1s), UI polish, docs.

## Handoff Checklist (Next Session)
- [ ] Add stage routes and redirects (AuthenticatedApp).
- [ ] Update Dashboard and ProjectCard to stage routes.
- [ ] Implement `useStageController` with autosave + transitions.
- [ ] Build `IdeationStage` using existing domain modules; verify gating + autosave.
- [ ] Extract `JourneyStage`; enable background refine with timeout; accept → persist phases.
- [ ] Extract `DeliverablesStage`; accept all; wire “Finalize” to completion pipeline.
- [ ] Update UnifiedStorageManager types and index for stage fields; persist `currentStage`.
- [ ] Add/extend smoke tests per stage; run `npm run build` and `npm test`.
- [ ] Remove legacy ChatMVP routing from default paths.

End of Handoff
