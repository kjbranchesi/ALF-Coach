# ALF Project Builder — Handoff Brief

Last updated: 2025‑10‑07

## What It Is
- ALF Project Builder (aka ChatMVP) is a conversational, stage‑based authoring flow that turns a teacher’s idea into a complete, professional PBL unit (journey, assignments, materials, rubric) in minutes.
- Built on a guided chat + zoom‑out/zoom‑in editing model: teachers stay in control (accept, refine, regenerate) while AI drafts structure and content.

## What It Does (End‑to‑End)
1. Dashboard → “New Project” minimal wizard (grade/subjects/duration/topic)
2. Stages in chat: Big Idea → Essential Question → Challenge → Learning Journey (4–6 phases) → Deliverables (milestones, artifacts, rubric)
3. Acceptance triggers generation of course description, tagline, and full ShowcaseV2 (assignments + run‑of‑show)
4. Project saves to localStorage (primary) and syncs to Firestore (best‑effort), then transforms to a hero preview cache for ReviewScreen

## Key Data Structures
- `CapturedData` (chat captures): `ideation`, `journey.phases[]`, `deliverables{ milestones[], artifacts[], rubric.criteria[] }`
- `WizardContext`: gradeLevel, subjects, duration, projectTopic
- Unified project record: `id, title, description, tagline, showcase: ProjectShowcaseV2, capturedData, wizardData, status, stage`
- LocalStorage keys: `alf_project_{id}` (source), `alf_hero_{id}` (preview cache)

## Critical Files
- Chat flow/orchestration: `src/features/chat-mvp/ChatMVP.tsx`
- Stage logic + gating: `src/features/chat-mvp/domain/stages.ts`
- Journey UI/editor: `src/features/chat-mvp/components/JourneyBoard.tsx`, `PhaseEditorDrawer.tsx`
- Deliverables suggest/accept: `src/features/chat-mvp/domain/deliverablesMicroFlow.ts`, `DeliverablesPreviewCard.tsx`
- Showcase generation: `src/features/chat-mvp/domain/projectShowcaseGenerator.ts`
- Description/tagline: `src/features/chat-mvp/domain/courseDescriptionGenerator.ts`
- Storage + hero transform: `src/services/UnifiedStorageManager.ts`, `src/services/HeroProjectTransformer.ts`
- Preview (review page): `src/features/review/ReviewScreen.tsx`
- Routes: `src/AuthenticatedApp.tsx`

## Current Behavior & Guarantees
- Local‑first: completion writes full project + showcase to `alf_project_{id}`; hero cache populated as `alf_hero_{id}` when available.
- Preview reliability: ReviewScreen loads from hero → raw project (with showcase) → Firestore (fallback). Firestore sync failures are non‑blocking.
- Teacher agency: at each stage, teachers can modify, reorder, or regenerate suggestions before accepting.

## Known Constraints
- Firestore rejects undefined/functions/oversized payloads; sync is sanitized and non‑blocking.
- If hero cache is late, preview still renders from raw local `showcase`.
- Lint failures exist in unrelated areas; not blocking runtime.

## Quick Verify (Dev)
- Complete a project → confirm `localStorage["alf_project_{id}"].showcase` exists
- Optional: confirm `localStorage["alf_hero_{id}"]` exists
- Open preview route `/app/project/{id}/preview`; console logs indicate selected data source (hero | raw | firestore)

## Next Session: Suggested Focus
- Add one E2E: accept Journey/Deliverables → CTA enabled → preview renders hero header
- Monitor hero transform success rate; promote hero‑first render once stable
- Incremental polish: single action surface on Deliverables; verify typography consistency on chat

