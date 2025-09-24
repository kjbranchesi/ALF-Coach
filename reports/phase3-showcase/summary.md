# Phase 3 – Gallery + Authoring Workflow

## Gallery Updates
- Added Showcase/Legacy toggle in `src/components/SamplesGallery.tsx` defaulting to Showcase tab.
- Showcase tab renders projects from `listShowcaseProjects()` with title, grade bands, subjects, duration, and `Open` CTA → `/app/showcase/:id`.
- Legacy tab retains original hero project grid; change diff captured in `reports/phase3-showcase/gallery-diff.txt`.

## Navigation Enhancements
- Dashboard now surfaces an “Explore Showcase” button linking to `/app/samples?show=showcase` (`src/components/Dashboard.jsx`).
- Samples gallery reads the `show` query parameter to set the active tab.

## Authoring Helper
- Added CLI scaffold generator `scripts/new-showcase-project.mjs` (accepts `--id`, `--title`, `--grade`, `--subjects`, `--duration`).

## Build & Preview
- Build status: succeeded (`reports/phase3-showcase/build.log`).
- Preview status: ran on port 5173 (`reports/phase3-showcase/preview.log`).
- Verified 200 responses for `/app/samples`, `/app/showcase/living-history`, `/app/showcase/invasive-vegetation`, `/app/showcase/urban-heat` during preview.

## Next Authoring Steps
- Use `docs/CONVERSION_GUIDE.md` + `docs/SHOWCASE_SCHEMA.md` with the gallery toggles to guide conversion of remaining projects.
