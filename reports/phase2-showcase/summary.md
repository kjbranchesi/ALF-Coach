# Phase 2 – Showcase Framework Establishment

## Renamed / Updated Files
- `src/types/showcase.ts` (renamed from showcase-lite; interfaces now `ShowcaseProject` + `AssignmentCard`).
- `src/data/showcase/living-history.showcase.ts` (renamed + import updates).
- `src/pages/ProjectShowcase.tsx` (renamed component + type imports).
- `src/AuthenticatedApp.tsx` (lazy import + route path now `/app/showcase/:id`).
- `src/utils/showcase-projects.ts` (type import updated; registry expanded).

## New / Seeded Files
- `src/data/showcase/invasive-vegetation.showcase.ts`
- `src/data/showcase/urban-heat.showcase.ts`
- `docs/SHOWCASE_SCHEMA.md`
- `docs/CONVERSION_GUIDE.md`

## Routes
- Added protected route `'/app/showcase/:id'` with `ProjectShowcase` renderer.

## Registry Keys
- living-history
- invasive-vegetation
- urban-heat

## Build & Preview
- Build status: succeeded (`reports/phase2-showcase/build.log`).
- Preview status: ran on port 5173 (`reports/phase2-showcase/preview.log`).
- HTTP 200 confirmed for `/app/showcase/living-history`, `/app/showcase/invasive-vegetation`, `/app/showcase/urban-heat` during preview.

## Lite Terminology Audit
- `reports/phase2-showcase/lite-refs.txt` contains no matches (no remaining `showcase-lite` or `.lite.` references in `src/`).
