# Deletions Log

Last updated: 2025-09-25 23:43:24 BST

## Archival Moves
- Migrated high-noise service scaffolds into `src/services/legacy/**` to keep lint scoped to live modules.

## Removed Assets
- Removed unused coaching UI stack (`src/components/coaching/**`) and dependent context/service files to prevent stale FSM lint noise.
- Deleted abandoned education/tool/progression visual components (`src/components/education/**`, `src/components/tools/**`, `src/components/progression/**`, `src/components/universal/**`, `src/components/visuals/**`).
- Dropped legacy coaching service layer (`src/services/CoachingConversationArchitecture.ts`, `CoachingIntegrationService.ts`, `CoachingErrorRecoveryService.ts`).
- Removed unused coaching context (`src/contexts/CoachingConversationContext.tsx`).
