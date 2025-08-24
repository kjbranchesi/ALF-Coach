# Archive Notes - ALF Introduction Files
**Date:** November 2024
**Reason:** Multiple duplicate files causing confusion during updates

## Files Archived

### 1. ALFProcessIntro.tsx
- **Original Location:** `/src/features/wizard/ALFProcessIntro.tsx`
- **Status:** ARCHIVED - Not imported anywhere
- **Reason:** Duplicate of ALFIntroStep.tsx functionality
- **Note:** This file was being edited by mistake when the actual displayed file was ALFIntroStep.tsx

## Files Kept Active

### 1. ALFIntroStep.tsx ✅
- **Location:** `/src/features/wizard/steps/ALFIntroStep.tsx`
- **Status:** ACTIVE - Primary intro component
- **Used By:** 
  - StreamlinedWizard.tsx
  - Wizard.tsx
- **Note:** This is the CORRECT file shown in the wizard intro screen

### 2. FrameworkOverview.jsx ⚠️
- **Location:** `/src/components/FrameworkOverview.jsx`
- **Status:** ACTIVE - Still in use but needs updating
- **Used By:**
  - ChatModule.jsx
  - GeminiService.ts
  - chat-service.ts
  - prompts/workflows.js
- **Issues:** Contains emojis that should be replaced with icons
- **Note:** Different component used in chat context, not wizard

### 3. ProcessOverview.tsx
- **Location:** `/src/components/chat/ProcessOverview.tsx`
- **Status:** ACTIVE - Used in chat interface
- **Used By:** ChatModule.jsx
- **Note:** Different context - shows process during chat, not intro

## Recommendations

1. **Always edit ALFIntroStep.tsx** for wizard introduction changes
2. **Update FrameworkOverview.jsx** to remove emojis and use proper icons
3. **Consider consolidating** ProcessOverview.tsx and FrameworkOverview.jsx if they serve similar purposes
4. **Add comments** to active files indicating their specific use case to prevent future confusion

## File Purpose Clarification

- **ALFIntroStep.tsx**: Wizard introduction (what users see first)
- **FrameworkOverview.jsx**: Chat module framework explanation
- **ProcessOverview.tsx**: In-chat process guide

## Migration Complete
All duplicate files have been archived to prevent future confusion.