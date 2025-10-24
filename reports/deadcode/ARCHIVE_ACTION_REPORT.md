# Archive Action Report

Date: ${new Date().toISOString()}

## Summary

We performed a staged repository hygiene pass to quarantine unused code and assets under `archive/` while keeping the application build and smoke test green. The process is reversible and recorded via an archive manifest.

## Steps Taken

1. Generated analysis reports (orphan modules, assets, routes, deps) and combined them into a ranked CSV (`reports/deadcode/archive-candidates.csv`).
2. Archived a first set of obvious orphan assets (react.svg, vite.svg, images/README.md) and validated build + smoke test.
3. Archived unused prompt templates and prototype components verified as unreferenced.
4. Attempted bulk archive of top 50% candidates; build exposed required modules referenced by router and shared design-system. We rolled back all bulk moves using a manifest-based rollback script.
5. Restored a small set of critical components (ScrollToTop, LandingPage, HowItWorks, SamplesGallery, Dashboard, design-system re-exports) to ensure production build success.

## Artifacts

- Reports:
  - `reports/deadcode/archive-candidates.csv` (ranked list)
  - `reports/deadcode/orphan-modules.json`
  - `reports/deadcode/assets-orphans.json`
  - `reports/deadcode/route-candidates.json`
  - `reports/deadcode/depcheck.json`
  - `reports/deadcode/tsprune.json`
  - `reports/deadcode/madge.json`
  - `reports/deadcode/firebase-functions-diff.json`
- Manifests:
  - `archive/archive-manifest-*.json` (moved files per operation)

## Scripts

- `scripts/archive-move-from-report.mjs` — Moves top N percent of `archive-candidates.csv` into `archive/` and emits a manifest. Example:

```
node scripts/archive-move-from-report.mjs --percent 50
```

- `scripts/archive-rollback.mjs` — Restores files from the latest archive manifest. Example:

```
node scripts/archive-rollback.mjs
```

## Current State

- Application build: PASS
- Smoke test (ChatMVP mounts): PASS
- `archive/` contains quarantined assets and a small set of unused components/templates that were validated as unreferenced.

## Rollback Instructions

1. To restore all files from the latest archive move:

```
node scripts/archive-rollback.mjs
```

2. To restore a single file, move it back from `archive/` to its original path manually (use git mv or your editor) and rebuild.

## Suggested Next Steps

- Use `archive-candidates.csv` to identify the next small batch (5–10 files) for archiving; avoid bulk moves of route-linked or design-system modules.
- After each small batch, run:

```
npm run build && npm run test:smoke
```

- Once comfortable, open PR #1 to keep files in `archive/` for a soak period. Later, open PR #2 to fully delete `archive/` contents.

## Notes

- We intentionally kept router-visible components and design-system exports in place after observing build failures when quarantined. These should be reviewed individually if they remain necessary.

