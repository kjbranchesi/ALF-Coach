# Repo Hygiene Playbook (Dead Code + Assets)

This playbook adds a safe, staged process to find and archive unused code, assets, and dependencies with guard rails. Nothing is deleted directly — candidates are moved to `archive/`, then we build + run a smoke test. Once stable, deletion can happen in a follow-up PR.

## Quick Start (Local)

1) Create reports folder

```
mkdir -p reports/deadcode
```

2) Run the quick analyzer (no extra installs)

```
npm run analyze:quick
# Outputs:
# - reports/deadcode/orphan-modules.json
# - reports/deadcode/orphan-assets.json
```

3) Optionally run the deeper pass (requires dev deps)

Install tools locally:

```
npm i -D knip ts-prune madge depcheck
```

Run all analyses:

```
npm run analyze:all
# Outputs combined under reports/deadcode/
```

Review `reports/deadcode/archive-candidates.csv` and move a small batch into `archive/` for a PR.

## Scripts

- `npm run analyze:quick` – builds a simple import graph (local only) and flags orphan modules/assets.
- `npm run analyze:knip` – detects unused files/exports
- `npm run analyze:tsprune` – flags unused exports (TS)
- `npm run analyze:madge` – builds module graph (orphans/cycles)
- `npm run analyze:depcheck` – unused dependencies
- `npm run analyze:routes` – heuristics for unused route components
- `npm run analyze:assets` – orphan asset scan by basename
- `npm run analyze:firebase` – deployed vs coded functions diff
- `npm run analyze:combine` – merges all signals into CSV + JSON

## Guard Rails

- `archive/**` is ignored by ESLint/Prettier.
- CI runs a smoke test (ChatMVP mounts) and enforces `react-hooks/exhaustive-deps`.
- Move first, test, then delete in a second PR.

## Suggested Batch Size

Move 5–10 candidates at a time into `archive/`, then:

```
npm run build && npm run test:smoke
```

If anything breaks, move the file(s) back or add to `.knip.jsonc` ignore as dynamic/intentional.

## Notes

- Dynamic imports and string-based registries can cause false positives. The `.knip.jsonc` includes ignores for known dynamic modules.
- The Firebase functions diff requires Firebase CLI auth; otherwise it will just report local code exports.

