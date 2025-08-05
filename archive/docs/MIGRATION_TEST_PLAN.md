# ALF Coach Migration Test Plan

## Overview
We've successfully migrated ALF Coach to use the new architecture as the default. Here's what changed and how to test it.

## Changes Made

### 1. Routing Updates (AppRouter.tsx)
- Main app routes now use `NewArchitectureTest` component
- `/app/blueprint/:id` replaces `/app/blueprint/:id/chat`
- Legacy routes redirect to new routes for backward compatibility

### 2. Dashboard Updates
- WizardWrapper completion now navigates to `/app/blueprint/${blueprintId}` (without /chat)
- Already using `blueprints` collection (no change needed)

### 3. ProjectCard Updates
- Navigation updated to new route structure
- Supports both old (`wizardData`) and new (`wizard`) data structures
- Maps `currentStep` to stages for ProgressIndicator compatibility

### 4. NewArchitectureTest Updates
- Added React Router params support (`id`, `projectId`)
- Handles routing from both `/app/blueprint/:id` and `/app/project/:projectId`

## Test Plan

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test New Project Creation
1. Navigate to `/app/dashboard`
2. Click "New Project" button
3. Complete the wizard
4. **Expected**: Should redirect to `/app/blueprint/{id}` (not `/chat`)
5. **Verify**: ChatInterface loads with SOPFlowManager

### 3. Test Existing Project Navigation
1. From dashboard, click on any project card
2. **Expected**: Should navigate to `/app/blueprint/{id}`
3. **Verify**: Project loads correctly in new architecture

### 4. Test URL Compatibility
1. Try old URL format: `/app/blueprint/{id}/chat`
2. **Expected**: Should redirect to `/app/blueprint/{id}`
3. **Verify**: No broken links

### 5. Test Project Card Display
1. Check dashboard project cards
2. **Verify**: 
   - Title shows correctly (from `wizard.subject` or `wizardData.subject`)
   - Progress indicator shows correct stage
   - Timestamps display properly

### 6. Test Conversational Flow
1. Open a project
2. Type "not sure help me" in chat
3. **Verify**: Continue button becomes enabled (from our previous fix)

### 7. Test State Persistence
1. Make progress in a project
2. Refresh the page
3. **Verify**: Progress is maintained

## Success Criteria
- ✅ All routes work without 404 errors
- ✅ Projects created through wizard open in new architecture
- ✅ Existing projects (if any) still accessible
- ✅ Progress indicators show correct stages
- ✅ Chat interface fully functional
- ✅ Firebase sync working properly

## Known Issues to Watch
1. Large bundle size warning (can be addressed later with code splitting)
2. TypeScript errors in some service files (not related to this migration)

## Next Steps
Once testing is complete:
1. Remove old architecture code (MainWorkspace.jsx, etc.)
2. Begin integrating Phase 3 enrichment services
3. Add code splitting for better performance

## Quick Verification Commands
```bash
# Check for broken imports
grep -r "MainWorkspace" src/

# Check for old routes
grep -r "/chat" src/

# Verify new architecture is default
grep -r "NewArchitectureTest" src/AppRouter.tsx
```