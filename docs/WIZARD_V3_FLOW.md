# Wizard V3 Flow & Snapshot Handoff

## Guided Steps At A Glance
- **Context & Vision** – capture project topic, learning goals, subject focus, schedule, and experience level so the chat knows where to start.
- **Artifacts & Rubrics** – map milestones to required evidence, author rubric criteria/levels, and flag tier/confidence for progressive scaffolding.
- **Differentiation & Supports** – define roles, tiered assignments, UDL strategies, language/executive supports, scaffolds, and accommodations aligned to schema fields.
- **Evidence & Logistics** – plan checkpoints, permissions, storage, communication touch points, exhibitions, and risk contingencies.
- **Review & Export** – surface readiness metrics, highlight gaps, and deliver working export actions (JSON download + clipboard summary) powered by shared snapshot utilities.

## Autosave & Draft Persistence
- `WizardV3Wrapper` merges each step into a normalized `ProjectV3`, then persists via `saveProjectDraft(...)` with `source: 'wizard'`.
- Chat autosave uses `persistDraftSnapshot` with a 2.5 s throttle. Calls are coalesced and merged through `mergeWizardData`, `mergeProjectData`, and `mergeCapturedData` so partial updates never wipe existing arrays or nested objects.
- Draft metadata now includes `completeness`, `tierCounts`, and `metrics` for downstream dashboards. Local storage and Firestore paths both honour the enriched payload.

## Snapshot Utilities (`src/utils/wizardExport.ts`)
- `buildWizardSnapshot(wizardData)` computes readiness (`evaluateWizardCompleteness`) and counts (`getSnapshotMetrics`) into a versioned payload.
- `downloadWizardSnapshot(snapshot, filename?)` streams the structured JSON to the browser.
- `copySnapshotPreview(snapshot)` copies a formatted summary; `buildSnapshotSharePreview` supplies a manual fallback string when clipboard access is blocked.
- `getSnapshotMetrics` is exported for consumers that only need counts (e.g., dashboard cards).

## Export Touchpoints
- **Wizard Review Step** – buttons now call the shared helpers; manual preview appears automatically if clipboard access fails.
- **Chat Workspace** – the top-right actions replicate download/copy using the same utilities and honour the new throttle/merge logic.
- **Dashboard Cards** – display snapshot metrics (`phases/milestones`, `artifacts/rubrics`, `roles/scaffolds`, `checkpoints/risks`) alongside completeness and tier badges.

## Handoff Expectations
- `saveProjectDraft` stores `{ wizardData, project, capturedData, completeness, tierCounts, metrics }` per draft id. Metrics fall back to wizard data if a normalized project is absent.
- Snapshot exports reference the same wizard data that seeds chat onboarding, ensuring JSON downloads, clipboard summaries, and dashboard metrics remain consistent.
- Any new surface can import `buildWizardSnapshot` for a ready-to-share payload without reimplementing completeness or counting logic.
