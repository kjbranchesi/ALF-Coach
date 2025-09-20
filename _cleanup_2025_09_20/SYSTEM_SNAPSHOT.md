# System Architecture Snapshot
**Date**: August 5, 2025
**Git Commit**: 14a97eb
**Status**: WORKING ✅

## Current Working Architecture

### 1. Entry Flow
```
Landing Page → Dashboard → Wizard → Blueprint View (ChatInterface)
```

### 2. Key Components Being Used

#### Wizard Flow
- **Location**: `/src/features/wizard/`
- **Creates**: Blueprint with ID `bp_{timestamp}_{random}`
- **On Complete**: Navigates to `/app/blueprint/{id}`

#### Blueprint View 
- **Router**: `/src/AppRouter.tsx`
  - Route: `/app/blueprint/:id` → `<ChatLoader />`
- **ChatLoader**: `/src/features/chat/ChatLoader.tsx`
  - Handles "new-" prefixed IDs from Dashboard
  - Creates SOPFlowManager and GeminiService instances
  - Renders ChatInterface from `/src/components/chat/ChatInterface.tsx`

#### Chat System
- **ChatInterface**: `/src/components/chat/ChatInterface.tsx` (NOT the one in features/chat!)
  - Expects: `flowManager` (SOPFlowManager instance) and `geminiService` (GeminiService instance)
  - Uses stages system for project-based learning flow
- **SOPFlowManager**: `/src/core/SOPFlowManager.ts`
  - 900+ line monolith managing the entire flow state
- **GeminiService**: `/src/services/GeminiService.ts` and `/src/services/geminiService.js`
  - Class wrapper with `generate()` and `generateJsonResponse()` methods
  - Makes API calls through Netlify function at `/.netlify/functions/gemini`

### 3. API Configuration
- **Netlify Function**: `/netlify/functions/gemini.js`
  - Uses environment variable: `GEMINI_API_KEY` (NOT VITE_GEMINI_API_KEY)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

### 4. Known Issues But Working
- Multiple ChatInterface components exist (confusing but currently working)
- Both .js and .ts versions of GeminiService (both have the class now)
- SOPFlowManager is a monolith (needs refactoring but works)

## How to Restore This State

If things break in the future, you can restore this exact working state:

```bash
# Option 1: Reset to this commit
git reset --hard 14a97eb

# Option 2: Checkout the backup branch
git checkout backup-working-state-20250805

# Option 3: Checkout the tagged version
git checkout working-state-after-fixes-20250805-*
```

## Critical Files - DO NOT CHANGE WITHOUT TESTING
1. `/src/features/chat/ChatLoader.tsx` - Must import correct ChatInterface
2. `/src/services/GeminiService.ts` - Must have generate() method
3. `/src/services/geminiService.js` - Must have generate() method
4. `/src/AppRouter.tsx` - Must use ChatLoader for blueprint routes

## Next Planned Phases
- Phase 2: Create SOPRepository for data persistence
- Phase 3: Implement StateManagementService  
- Phase 4: Create ValidationService

## Testing Checklist Before Any Major Change
- [ ] Landing page loads
- [ ] Can navigate to Dashboard
- [ ] Can start Wizard
- [ ] Can complete/skip Wizard
- [ ] Blueprint view loads without errors
- [ ] Can type in chat input
- [ ] AI responses work (check console for errors)

---
**NOTE**: This snapshot was created after fixing multiple critical issues. The system is fragile due to mixed architectures. Proceed with caution and test incrementally.