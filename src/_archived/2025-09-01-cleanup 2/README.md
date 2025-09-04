Archived on 2025-09-01 to reduce confusion and consolidate runtime paths.

Removed from src/ (see git history for original content):
- AppRouter.tsx.backup
- App-original.tsx
- main-backup.jsx
- main-debug.jsx
- index.tsx
- components/chat/ChatbotFirstInterface.tsx
- components/chat/ChatInterface.tsx
- components/onboarding/ProjectOnboardingWizard.tsx

Rationale:
- Runtime uses App.tsx → AppRouter.tsx → AuthenticatedApp.tsx → ChatLoader.
- Wizard source of truth is StreamlinedWizard.tsx with wizardSchema.ts (v2).
- Chat UI is ChatbotFirstInterfaceFixed.tsx only.

If needed, restore from git history.

