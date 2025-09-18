# ALF Coach Handoff Report — 2025-09-17

## Context
We restructured the hero project pipeline so every feature (wizard, chat, exports) can work from a single schema-backed source of truth. This required generating JSON schemas, exporting hero exemplar data, replacing legacy registries, and wiring wizard/chat logic to that contract. The infrastructure is now in place for educators to create hero-level projects with consistent validation, persistence, and AI support.

## What Landed

### Schema & Data Pipeline
- Added `npm run generate:hero-schema` and `npm run export:hero-data` to produce JSON Schema artifacts and JSON fixtures (`schemas/*.json`, `src/data/generated/hero/*.json`).
- Introduced `scripts/asset-loader.mjs`, `scripts/generate-hero-schema.ts`, and `scripts/export-hero-data.ts` to automate schema generation and hero data export.
- Created `docs/HERO_SCHEMA_PIPELINE.md` (workflow) and `docs/HERO_SCHEMA_ROADMAP.md` (future integration plan).
- Updated `src/types/alf.ts` with `StandardsAlignment` interfaces (needed for schema generation).

### Hero Data Consumption
- Rewired `src/utils/hero-projects.ts` to pull from generated JSON via `src/data/generated/hero/loader.ts`. Handles both Vite (via `import.meta.glob`) and Node (CLI) contexts and resolves image assets.
- Updated sample hero blueprint builders to use `getHeroProject` from the new registry.
- Added `src/ai/context/heroContext.ts` to supply hero prompt snippets for chat.

### Wizard Enhancements
- Wizard vision examples now include hero references (`src/features/wizard/wizardExamples.ts`).
- Introduced schema-driven completeness scoring (`src/utils/completeness/wizardCompleteness.ts`) and connected it to wizard schema (`calculateCompleteness`, `getWizardCompleteness`) and normalization utilities.
- Context tracker (`src/services/ContextTracker.ts`) now reports completeness detail via the new helper.

### Project Persistence Scaffolding
- Added `src/services/projectPersistence.ts` to persist `ProjectV3` drafts to Firestore/offline storage, capturing completeness summaries and tier counts per save.
- Completeness computation reuses the wizard completeness helper to keep analytics consistent.

## Outstanding Work
1. **UI Migration to Generated Data**
   - Swap showcase, landing gallery, and sample blueprint consumers to rely on the new registry functions fully (some still map project fields manually).
   - Confirm hero images resolve correctly in all environments (SSR/emails may need file resolution tweaks).

2. **Wizard/Chat Orchestration**
   - Integrate `projectPersistence.saveProjectDraft` into wizard completion and chat autosave loops.
   - Surface completeness breakdowns (core/context/progressive) in the wizard UI and chat handoff prompts using `getWizardCompleteness`.
   - Feed `heroContext.getHeroPromptReferences` into chat prompt builders for retrieval-augmented suggestions.

3. **Schema Compliance for Firestore Drafts**
   - When persisting educator projects, ensure the saved payload validates against `schemas/alf-project.schema.json`. (We have the schema; need runtime validation + error surfacing.)

4. **CI / Automation**
   - Add a CI step that runs the new schema + data export scripts and fails if artifacts change without being committed.
   - Optionally publish schema files to shared storage for non-frontend consumers.

5. **Legacy Cleanup**
   - Once all consumers use `getGeneratedHeroProject`, archive `src/utils/hero/index.ts`. Keep it for reference until migration is complete.
   - Remove or rewrite static wizard example tables that the new hero references supplant.

## Immediate Next Steps
1. Integrate `projectPersistence` draft saves into wizard completion flow.
2. Update chat service to use completeness detail and hero prompt references for targeted follow-up questions.
3. Add UI hints showing "hero alignment" status based on completeness + tier counts.

## Quick Reference
- Schema scripts: `npm run generate:hero-schema`, `npm run export:hero-data`.
- Hero loader: `src/data/generated/hero/loader.ts`.
- Completeness helper: `src/utils/completeness/wizardCompleteness.ts`.
- Persistence service: `src/services/projectPersistence.ts`.
- Documentation: `docs/HERO_SCHEMA_PIPELINE.md`, `docs/HERO_SCHEMA_ROADMAP.md`.

## Open Questions
- Should tier metadata in saved drafts be expanded to include counts for each schema section (phases, artifacts, etc.)?
- What validation UX do we want when AI suggestions fail schema checks? (Current plan: compute completeness but no schema enforcement yet.)
- Do we need a lighter hero manifest for offline/mobile contexts (e.g., omit media URLs)?

This report should give the next session full context to continue integrating the schema-driven workflow and persistence pipeline.
