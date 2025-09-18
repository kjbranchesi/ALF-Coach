# Hero Schema & Data Pipeline

This project now materialises the hero project north-star contract as runtime assets and JSON Schema documents that downstream services (wizard, chat, exports, dashboards) can consume consistently.

## Generated Artifacts

| Artifact | Source | Command |
| --- | --- | --- |
| `schemas/hero-project.schema.json` | `src/utils/hero/types.ts` | `npm run generate:hero-schema` |
| `schemas/alf-project.schema.json` | `src/types/alf.ts` | `npm run generate:hero-schema` |
| `schemas/alf-project-v3.schema.json` | `src/types/alf.ts` | `npm run generate:hero-schema` |
| `src/data/generated/hero/*.json` | `src/utils/hero/**/*.ts` | `npm run export:hero-data` |
| `src/data/generated/hero/manifest.json` | same as above | `npm run export:hero-data` |

The JSON schema files provide validation contracts for any service creating or transforming hero-aligned data. The generated hero JSON fixtures are direct serialisations of the TypeScript hero exemplars with asset references normalised to repo-relative paths.

## Runtime Access Helpers

`src/data/generated/hero/loader.ts` exposes convenience functions that hydrate generated hero data inside the Vite app:

```ts
import { listGeneratedHeroProjects, getGeneratedHeroProject } from '@/data/generated/hero/loader';

const manifest = listGeneratedHeroProjects();
const sustainabilityProject = getGeneratedHeroProject('hero-sustainability-campaign');
```

These helpers rely on `import.meta.glob` so they stay synchronous and tree-shakeable.

## Workflow

1. Update any hero TypeScript source under `src/utils/hero/`.
2. Run `npm run export:hero-data` to refresh the generated JSON and manifest.
3. Run `npm run generate:hero-schema` when the contract changes to keep schemas in sync.
4. Commit both the source changes and regenerated artifacts.

> Tip: Keep the generated files in reviews so downstream consumers (API, chatbot, PDF exports) can run against consistent fixtures without loading the full TypeScript bundle.

## Next Integration Targets

- Wire the wizard + chat orchestration to read/write against the generated JSON fixtures.
- Add CI jobs that fail when schema generation or data export produces diffs that were not committed.
- Gradually migrate UI components (e.g. showcase, dashboards) to consume the loader instead of bespoke hero registries.
