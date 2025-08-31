Legacy chat implementations and workspace shell moved here on 2025-08-31.

Reason: Not used by the current runtime flow (Dashboard → ChatLoader → ChatbotFirstInterfaceFixed). Kept for reference and future recovery. This folder is excluded from TypeScript via tsconfig.json.

Files preserved:
- ChatWrapper.tsx (feature-flag wrapper)
- ChatModule.jsx, ChatModuleV2.jsx (legacy chat UIs)
- UnifiedChatComponents.jsx (legacy shared widgets)
- MainWorkspace.jsx (legacy container)
- MainWorkspace.test.js (legacy test)
- features/chat/Chat.tsx, features/chat/ChatInterface.tsx (unused variants)

If you need to restore any file, move it back to its previous location and re-run the build.
