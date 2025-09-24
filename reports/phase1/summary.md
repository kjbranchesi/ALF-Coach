# Phase 1 Inventory Summary

## Environment
- Node.js: v22.17.0
- npm: 10.9.2

## Inventory Highlights
- Source files under `src/`: 766
- Top 5 largest files (bytes):
  1. 1,563,055 — `src/images/CoverImageLanding.png`
  2. 929,213 — `src/images/CoverImageLanding@1200w.png`
  3. 757,635 — `src/images/Ideation Stage.png`
  4. 606,632 — `src/images/Deliverables Stage.png`
  5. 494,913 — `src/images/Journey Stage.png`

## Key Findings
- depcruise: command resolved to a placeholder package and emitted:
  - "❌ Oops! You're trying to run a package that should be provided by a local binary, but isn't."
  - No dependency graph or orphan analysis was generated.
- ts-prune (top 10 entries):
  1. `src/App-minimal.tsx:13` — default export unused
  2. `src/App.tsx:21` — default export unused (App wrapper superseded by router setup)
  3. `src/test-pdf-export.ts:158` — `testPDFExport` (flagged but noted as used within the module)
  4. `src/test-pdf-export.ts:158` — `sampleBlueprint`
  5. `src/components/AccessibilityComponents.tsx:21` — `TooltipProps`
  6. `src/components/AccessibilityComponents.tsx:27` — `AccessibleTooltip`
  7. `src/components/AccessibilityComponents.tsx:51` — `AccessibleLoadingIndicator`
  8. `src/components/BlueprintSidebar.tsx:17` — `BlueprintSidebar`
  9. `src/components/BlueprintViewer.tsx:153` — `BlueprintViewer`
  10. `src/components/ConnectionStatus.tsx:141` — `useConnectionStatus`
- Knip: `npx knip --reporter=detail` failed (`Cannot find module 'detail'`), so no unused dependency report was produced.

## Runtime Path Confirmation
- `ChatbotFirstInterfaceFixed` is exported at `src/components/chat/ChatbotFirstInterfaceFixed.tsx:136` and rendered inside `ChatLoader` (e.g., `src/features/chat/ChatLoader.tsx:485`).
- `ChatLoader` imports the component (`src/features/chat/ChatLoader.tsx:5`) and is lazy-loaded by `AuthenticatedApp` (`src/AuthenticatedApp.tsx:18`).
- `AuthenticatedApp` mounts `ChatLoader` for `/app/project/:projectId` and `/app/blueprint/:id` routes (`src/AuthenticatedApp.tsx:180` and `189`), confirming the live runtime path.

## Legacy References
- `services/chat-service.*` is still referenced by utilities and tests such as `src/test-ai-integration.ts` and `src/utils/chat-debugger.ts` (see `reports/phase1/chatservice-usage.txt`).
- `services/geminiService.js` appears only within the service itself and archived legacy chat screens (`reports/phase1/legacy-gemini-usage.txt`).

## Ports & Tooling Alignment
- `vite.config.ts` does not define a custom `server.port`, implying the default dev port 5173.
- `playwright.config.js` uses `baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'`, so local E2E tests target the same port.

## Vite Config Variants
- Multiple configuration files exist: `vite.config.js`, `vite.config.optimized.js`, `vite.config.safe.js`, and `vite.config.ts`.

Reports written to reports/phase1/. Bundle analysis in dist/bundle-analysis.html
Reports written to reports/phase1/. Bundle analysis in dist/bundle-analysis.html
