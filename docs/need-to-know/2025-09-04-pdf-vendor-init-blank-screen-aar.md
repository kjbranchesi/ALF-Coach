# After Action Report — Vendor Init Blank Screen (PDF)

- Date: 2025‑09‑04
- Owner: ALF Coach
- Status: Resolved by de‑scoping PDF and safe build settings

## Context & Impact
Production builds loaded a blank screen with `Uncaught ReferenceError: Cannot access 's' before initialization` in `vendor-*.js`. The error fired during vendor chunk initialization, preventing React from mounting.

## Root Cause (Most Probable)
- Forced manual chunking + Terser minification reordered module init across a huge vendor bundle.
- Static/top‑level imports of heavy PDF libs (`@react-pdf/renderer`, `jspdf`, `html2canvas`) increased surface area for circular init.
- Result: a minified symbol was referenced before initialization inside vendor code, crashing at startup.

## Actions Taken
- Build safety
  - Switched Vite to `minify: 'esbuild'`; removed custom `terserOptions` and all `manualChunks`.
  - Enabled sourcemaps temporarily for diagnosis.
- PDF de‑scope
  - Hid/guarded all PDF actions behind `VITE_PDF_EXPORT_ENABLED` (default false).
  - Converted remaining PDF usages to dynamic imports to avoid startup execution.
  - Set `VITE_PDF_EXPORT_ENABLED="false"` in `netlify.toml` build environment.
- UX integration (kept scope moving)
  - Samples route wired at `/app/samples`; Dashboard buttons for Samples and How‑It‑Works.

## Current State
- App loads without blank screen in local and Netlify builds.
- Markdown export works. PDF export is disabled in UI and at build time.

## Guardrails & Runbooks
- Build: keep `esbuild` minifier and default chunking until post‑prototype.
- Heavy libs: load via `await import()` inside click handlers; avoid top‑level imports.
- Feature gates: ship risky features behind `VITE_*` flags; default to safe off in CI/Netlify.
- Netlify: if a blank screen reappears, “Clear cache and deploy site” to expel stale chunks.

## Re‑Enable PDF (Future Plan)
- Option A (Server‑side): generate PDFs in a serverless function (Netlify Functions / Cloud Run). Client posts JSON → function renders HTML → headless Chromium `printToPDF` → returns URL.
- Option B (Client‑side, safer): keep React‑PDF/jsPDF dynamic, render in a dedicated route (`/export/:id`) loaded after user action. No manual chunking. Minify with esbuild.
- Acceptance test: run `npm run build && npm run preview`, open `/app/samples` → Preview → Export PDF; verify no vendor error.

## Related Commits/Files
- Safe build: `vite.config.js` (esbuild, removed manualChunks)
- PDF gates: `netlify.toml` (`VITE_PDF_EXPORT_ENABLED=false`), `.env.example`, `env.example`
- UI guards: `src/features/review/ReviewScreen.tsx`, `src/components/SamplesGallery.tsx`, `src/components/education/RubricBuilder.tsx`

