This folder contains components that were duplicated by newer implementations and are not referenced by the active runtime (AppRouter → AuthenticatedApp → Dashboard/Chat).

Archived on: 2025-09-02

Notes
- These files are kept for historical context or future reference.
- The active app uses: ChatbotFirstInterfaceFixed, ProcessOverview (current), ModernProgress, pages/HowItWorks.tsx.
- If re‑enabling any of these, verify imports and routes, and remove them from the archived folder.

Moved here
- FrameworkOverview.jsx (legacy framework overview; superseded by chat ProcessOverview and inline summaries)
- LearningJourneySummary.tsx (unused variant; not imported)
- JourneySummary.tsx (unused variant; not imported)
- components/JourneySummary.tsx (unused floating variant)
- Progress.tsx (unused; ModernProgress is used instead)
- ProgressV2.tsx (unused; ModernProgress is used instead)

