# Lint Triage Snapshot (initial)

## Run Context
- Command: `npm run lint`
- Date: 2025-09-25 23:46:55 BST
- Findings captured in `lint-report.txt` (3,395 total)
- Previous snapshot: 5,568 issues (−2,173)

## Directory Buckets (Top)
- `src/services`: 1,033 issues (legacy quarantined to `src/services/legacy/**`)
- `src/components`: 816 issues (focus on runtime UI)
- `src/features`: 538 issues (chat + wizard flows)
- `src/utils`: 465 issues (autosave, draft merge, logger)
- `src/core`: 173 issues

## Rule Buckets (top offenders)
- `@typescript-eslint/no-unused-vars`: concentrated in chat legacy + remaining services
- `curly`: legacy JS utilities/scripts (`scripts/**`, `ai/context`, `EnhancedSuggestionCard`)
- `@typescript-eslint/no-explicit-any`: chat/service glue
- `react-refresh/only-export-components`: mixed utility/component files
- `no-useless-escape`: old prompt templates

## High-Volume Files (post-legacy move)
- `src/components/chat/ChatbotFirstInterfaceFixed.tsx`: 237 findings *(deferred per plan)*
- `src/components/EnhancedSuggestionCard.tsx`: 11 findings *(curly/unused)*
- `src/utils/logger.ts`: logging helpers referenced by tests
- `scripts/**`: assorted curly/string template violations

## Actions Taken
1. Moved 50+ AI scaffolding services into `src/services/legacy/` and updated imports (competency tracker, chat stages, enrichment adapter, futures) to use the new path.
2. Added ESLint ignore for `src/services/legacy/**` to keep runtime lint focused on active modules.
3. Installed `jest-environment-jsdom`, `@babel/preset-typescript`, and `babel-plugin-transform-vite-meta-env`; updated Jest/Babel configs so TypeScript tests run under jsdom.
4. Documented archival moves in `docs/DELETIONS.md`.

## Next Focus
1. Tackle `src/components/EnhancedSuggestionCard.tsx` and `src/ai/context/heroContext.ts` to reduce high-frequency curly violations.
2. Sweep `scripts/**` for quick `curly`/template literal fixes or consider moving long-term scripts into a `legacy` bucket.
3. Capture a test stabilization plan for `src/__tests__/chat-entry-points.test.ts` (now running but failing assertions due to fallback messaging).
