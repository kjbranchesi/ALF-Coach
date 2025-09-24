Cleanup Plan (tracked)

Decision Summary

- Keep live path: main.jsx → App.tsx → AppRouter.tsx → AuthenticatedApp.tsx → features/chat/ChatLoader.tsx → components/chat/ChatbotFirstInterfaceFixed.tsx
- Keep AI service + proxy: services/GeminiService.ts, netlify/functions/gemini.js
- Keep persistence: services/UnifiedStorageManager.ts, services/projectPersistence.ts, hooks/useBlueprintDoc.ts, firebase/firebase.ts
- Standardize dev port: 5173 (Vite), matches Playwright baseURL

Phase 4 Deletions (pending verification)

- Archived: src/_archived/, src/services/core/_unused/
- Duplicates: src/App.tsx.disabled, src/App-minimal.tsx
- Legacy AI (JS): src/services/geminiService.js
- Root prototypes (if not referenced): test-*.html
- Note: chat-service.* is referenced in non-runtime dev/test utilities; schedule after a pass to either remove those utilities or decouple types.

Rollback

- Restore removed files from git. If dev server fails to start or E2E regresses, revert last commit and reopen this plan.
