# [ARCHIVED] Cleanup Report (pre-archive)

Historical candidate list. Current runtime notes live in `docs/AI_IMPLEMENTATION_SUMMARY.md`.

See also: docs/unreferenced-files.csv

## Candidates to Archive (non-destructive move)

- `src/components/ChatWrapper.tsx`
  - Purpose: Feature-flag wrapper around older chat implementations
  - Referenced by: legacy `MainWorkspace.jsx` only
  - Runtime: not used by `AppRouter`/`AuthenticatedApp`

- `src/components/ChatModule.jsx` and `src/components/ChatModuleV2.jsx`
  - Purpose: Legacy chat UIs
  - Referenced by: `MainWorkspace.jsx`
  - Runtime: not routed in current app

- `src/components/UnifiedChatComponents.jsx`
  - Purpose: legacy shared chat widgets
  - Referenced by: none

- `src/components/MainWorkspace.jsx`
  - Purpose: legacy workspace shell
  - Referenced by: older tests and legacy wrappers
  - Runtime: not used in current router

- `src/components/__tests__/MainWorkspace.test.js`
  - Purpose: test suite for legacy workspace

- `src/features/chat/Chat.tsx`, `src/features/chat/ChatInterface.tsx`
  - Purpose: old chat variants
  - Referenced by: none

## What we already did
- Removed duplicate theme provider in `src/main.jsx` (App provides the ThemeProvider).
- Excluded archived folders from TypeScript.

## Proposed next step
- Move the candidate files into `src/_archived/legacy-chat/` with an `ARCHIVE_README.md` explaining the move.
- Re-run build/tests to validate nothing breaks.
- Continue with incremental tidy of unused imports.

No files will be deleted; this is a reversible, non-destructive archive to reduce surface area and confusion.
