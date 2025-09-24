# Phase 2 Verification Summary

## Active Runtime Path
- `src/components/chat/ChatbotFirstInterfaceFixed.tsx:136`: `export const ChatbotFirstInterfaceFixed ...`
- `src/features/chat/ChatLoader.tsx:5`: `import { ChatbotFirstInterfaceFixed } from '../../components/chat/ChatbotFirstInterfaceFixed'`
- `src/features/chat/ChatLoader.tsx:485`: `<ChatbotFirstInterfaceFixed ... />` rendered inside the loader
- `src/AuthenticatedApp.tsx:185`: `<Route path="/app/blueprint/:id" element={ ... <ChatLoader /> ... }>`
- `src/AuthenticatedApp.tsx:18/180/189`: `ChatLoader` lazily imported and mounted for `/app/project/:projectId` and `/app/blueprint/:id`
- `src/AppRouter.tsx:15`: `const AuthenticatedApp = lazy(() => import('./AuthenticatedApp'))`
- `src/main.jsx:22`: `createRoot(document.getElementById('root')).render(<StrictMode><App /> ... )`

## Legacy/Duplicate Usage
- `services/chat-service.*` references (first 10 lines):
  - `src/pages/test-chat-stability.tsx:3: import { createChatService, type ChatService, type ChatState } from '../services/chat-service'`
  - `src/test-ai-integration.ts:4: import { createChatService } from './services/chat-service'`
  - `src/__tests__/step-entry-actions.test.ts:4: import { ChatService } from '../services/chat-service'`
  - `src/utils/autosave.ts:2: import { type ChatMessage, type ChatState } from '../services/chat-service'`
  - `src/utils/chat-debugger.ts:4: import { ChatService } from '../services/chat-service'`
  - `src/utils/chat-debugger.ts:5: import { ChatMessage, ChatState, QuickReply } from '../services/chat-service'`
  - `src/_archived/legacy-chat/ChatInterface.tsx:9: import { type ChatMessage, type QuickReply } from '../../services/chat-service'`
  - `src/features/chat/TestChat.tsx:3: import { type ChatMessage, type QuickReply } from '../../services/chat-service'`
  - `src/services/context-manager.ts:4: import { type ChatMessage } from './chat-service'`
  - `src/services/sop-validator.ts:4: import { type ChatStage } from './chat-service'`
- `services/geminiService.js` references: only the file itself and an archived screen (`src/_archived/legacy-chat/MainWorkspace.jsx`)
- `_archived` / `core/_unused` references: none detected by `rg` (empty `reports/phase2/archived-usage.txt`)

## Deletion Candidates (preliminary)
Top entries from `reports/phase2/candidates.csv`:
```
src/_archived/info-pages/HowItWorksPage.jsx — references=4 (needs review)
src/_archived/duplicates/UnifiedSuggestionCard.jsx — references=13 (needs review)
src/_archived/duplicates/FrameworkCelebration.jsx — references=18 (needs review)
src/_archived/duplicates/chat-stages-JourneySummary.tsx — references=0 (safe if policy allows)
src/_archived/duplicates/StageTransitionModal.jsx — references=4 (needs review)
src/_archived/duplicates/CurriculumOutline.jsx — references=7 (needs review)
src/_archived/duplicates/FrameworkOverview.jsx — references=21 (needs review)
src/_archived/duplicates/UserMenu.jsx — references=6 (needs review)
src/_archived/duplicates/StageHeader.jsx — references=6 (needs review)
src/_archived/duplicates/SyllabusView.jsx — references=6 (needs review)
src/_archived/duplicates/ARCHIVE_README.md — references=0 (safe if policy allows)
src/_archived/duplicates/LiveFrameworkBuilder.jsx — references=7 (needs review)
src/_archived/duplicates/components-JourneySummary.tsx — references=0 (safe if policy allows)
src/_archived/duplicates/JourneySummary.tsx — references=25 (needs review)
src/_archived/duplicates/LearningJourneySummary.tsx — references=9 (needs review)
src/_archived/duplicates/PedagogicalRationale.jsx — references=7 (needs review)
src/_archived/2025-09-01-cleanup/README.md — references=0 (safe if policy allows)
src/_archived/2024-11-duplicates/ALFProcessIntro.tsx — references=6 (needs review)
src/_archived/2024-11-duplicates/ARCHIVE_NOTES.md — references=0 (safe if policy allows)
src/_archived/legacy-chat/ChatWrapper.tsx — references=10 (needs review)
src/_archived/legacy-chat/UnifiedChatComponents.jsx — references=2 (needs review)
src/_archived/legacy-chat/ChatModule.jsx — references=12 (needs review)
src/_archived/legacy-chat/Chat.tsx — references=715 (needs review)
src/_archived/legacy-chat/MainWorkspace.test.js — references=2 (needs review)
src/_archived/legacy-chat/ARCHIVE_README.md — references=0 (safe if policy allows)
src/_archived/legacy-chat/MainWorkspace.jsx — references=14 (needs review)
src/_archived/legacy-chat/ChatInterface.tsx — references=28 (needs review)
src/_archived/legacy-chat/ChatModuleV2.jsx — references=3 (needs review)
src/services/core/_unused/certificate-generation.ts — references=0 (safe if policy allows)
src/services/core/_unused/progress-report-builder.ts — references=0 (safe if policy allows)
```
- Interpretation: all `src/_archived/**` and `src/services/core/_unused/**` remain policy candidates when reference count is 0. Non-zero counts mostly stem from documentation cross-references or unit tests; these will need manual confirmation in Phase 3.
- Additional candidate files appended (not shown above): prototype HTMLs, legacy `App` variants, `services/geminiService.js`, and duplicate Vite configs; see `reports/phase2/candidates.csv` for full list.

## Port / Config
- `vite.config.ts`: no explicit `server.port`; defaults to 5173. (No `rg` match for port block.)
- `playwright.config.js`: `baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'` — aligned with the Vite default.
- Duplicate Vite configs present: `vite.config.js`, `vite.config.optimized.js`, `vite.config.safe.js`, `vite.config.ts` (see `reports/phase2/vite-configs.txt`).
- Bundle analyzer artifacts: `bundle-analysis.html NOT found`; `stats.html found` (from `reports/phase2/bundle-analyzer.txt`).

## Tool Status
- Phase 2 used only `rg`, shell scripting, and file enumeration—no external analyzers (depcruise/knip) were invoked.

## Next Step Readiness
- Most archive candidates still show >0 references due to documentation/tests; they require a quick manual inspection before deletion. No unexpected runtime usage surfaced.
- Ready for Phase 3 once we decide which referenced archives/tests should be retained or updated.

Reports written to reports/phase2/.
