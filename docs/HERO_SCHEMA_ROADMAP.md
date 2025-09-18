# Hero Schema Integration Roadmap

With the schema + data export pipeline in place, we can progressively migrate the stack to rely on the generated assets instead of bespoke TypeScript wiring. This document tracks the major follow-ups.

## Cleanup Targets

- **Hero registry duplication**: Migrate callers of `src/utils/hero/index.ts` to `src/data/generated/hero/loader.ts`, then retire the bespoke registry and validation wrappers once parity is confirmed.
- **Sample blueprint adapters**: Update `src/utils/sampleBlueprints` to consume generated JSON (or the loader) so there is a single hero data source.
- **Wizard variants**: Consolidate `Wizard.tsx`, `EnhancedWizard.tsx`, and `StreamlinedWizard.tsx` into the schema-driven flow, removing legacy components after validation.
- **Archived systems**: Delete `src/_archive_old_system` and `src/_archived/*` once replacement flows reach feature parity and tests reference the generated data instead of legacy mocks.

## Integration Milestones

1. **Validation Pipeline**
   - Add CI step that runs `npm run generate:hero-schema` + `npm run export:hero-data` and fails when uncommitted changes exist.
   - Publish schema artifacts to internal storage (e.g. Firestore, CDN) for non-reactive consumers.

2. **Wizard Alignment**
   - Load hero manifest inside the wizard to surface exemplars/contextual tips per step.
   - Persist wizard drafts against the `Project` schema and surface tier coverage/completeness using schema definitions.

3. **Chat Orchestration**
   - Provide chatbot with the generated JSON as retrieval documents for suggestion prompts.
   - Ensure chat writes back structured updates that validate against `alf-project.schema.json` before saving.

4. **Export / Dashboard**
   - Swap PDF + dashboard generation to pull from the generated fixtures and hero schema definitions.
   - Track educator modifications vs AI suggestions using the tier metadata in the schema.

5. **Analytics & Telemetry**
   - Instrument gaps discovered during wizard entry (missing schema fields) and funnel them into chatbot prompt improvements.

## Open Questions

- Where should we persist educator-generated hero projects (Firestore vs local JSON) while maintaining schema compliance?
- Do we need a lighter manifest for mobile/offline experiences?
- How should asset paths be resolved when projects are exported to PDF or offline bundles?

> Update this roadmap as milestones ship. Each section can translate directly into GitHub projects or Linear tickets.
