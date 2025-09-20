# ALF Coach System Documentation
*Prevention-First Guide for Non-Technical Project Owners*

**⚠️ CRITICAL: Read this ENTIRE document before making ANY changes to the system ⚠️**

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Map](#architecture-map) 
3. [DO NOT TOUCH List](#do-not-touch-list)
4. [Safe to Modify](#safe-to-modify)
5. [Common Breaking Points](#common-breaking-points)
6. [Data Flow Documentation](#data-flow-documentation)
7. [Testing Checklist](#testing-checklist)
8. [Emergency Recovery](#emergency-recovery)

---

## System Overview

### What ALF Coach Does
ALF Coach is an AI-powered educational tool that guides teachers through creating Active Learning Framework projects via conversational chat. Teachers go through 3 main stages:

1. **Wizard Setup**: Basic project configuration (subject, grade level, etc.)
2. **Ideation**: Develop Big Ideas, Essential Questions, and Challenges
3. **Journey**: Design learning phases, activities, and resources
4. **Deliverables**: Create rubrics, milestones, and impact strategies

### Core User Journey (NEVER BREAK THIS)
```
Landing Page → Sign In → Dashboard → New Blueprint → Wizard → Chat Interface → Export
```

### Key Features That Must Never Break
- **Chat Interface**: The conversational AI that guides users through the process
- **Firebase Integration**: Saves all user data and projects automatically
- **Blueprint Creation**: Generates the final learning project documents
- **User Authentication**: Multiple sign-in methods (Google, email, anonymous)
- **Export Functionality**: PDF and Google Docs export of completed blueprints

---

## Architecture Map

### Current System Structure (DO NOT CHANGE)

#### Entry Points (STABLE - DO NOT MODIFY)
- `/src/App.jsx` - Main app entry point
- `/src/AppRouter.tsx` - Route management and authentication
- `/src/main.jsx` - React app initialization

#### Core Flow (WORKING - DO NOT TOUCH)
```
AppRouter.tsx
    ↓
Dashboard.jsx (lists saved projects)
    ↓
ChatLoader.tsx (initializes chat for new/existing projects)
    ↓
ChatInterface.tsx (main conversation interface)
    ↓
SOPFlowManager.ts (manages conversation state)
```

#### Critical Data Management
- `/src/firebase/firebase.js` - Firebase configuration and connection
- `/src/core/SOPFlowManager.ts` - State management for conversation flow
- `/src/context/AppContext.jsx` - Global app state
- `/src/hooks/useBlueprintDoc.ts` - Blueprint data management

#### File Organization (STABLE STRUCTURE)
```
/src
  /components     - UI components (stable)
  /core          - Business logic (DO NOT MODIFY)
  /context       - React contexts (stable)
  /features      - Feature modules (some legacy, some current)
  /firebase      - Database connection (CRITICAL)
  /hooks         - Custom React hooks (mostly stable)
  /services      - External service integrations (complex)
  /utils         - Helper functions (mostly stable)
```

---

## DO NOT TOUCH List

### Files That Work and Should NEVER Be Modified

#### Critical System Files (ZERO CHANGES ALLOWED)
- `/src/firebase/firebase.js` - Firebase configuration (any change breaks data)
- `/src/core/SOPFlowManager.ts` - Conversation flow manager (complex state machine)
- `/src/main.jsx` - App initialization
- `/src/App.jsx` - Root component

#### Working Components (DO NOT IMPROVE)
- `/src/components/Dashboard.jsx` - Project dashboard (works correctly)
- `/src/features/chat/ChatLoader.tsx` - Chat initialization (complex but functional)
- `/src/components/chat/ChatInterface.tsx` - Main chat component (1,200+ lines, WORKING)
- `/src/context/AppContext.jsx` - Global state management
- `/src/hooks/useBlueprintDoc.ts` - Blueprint data hook

#### Authentication System (NEVER CHANGE)
- `/src/hooks/useAuth.js` - Authentication logic
- `/src/components/SignIn.jsx` - Sign-in interface
- All Firebase authentication flows

#### Working Integrations (DO NOT MODIFY)
- Google Gemini AI service integration
- PDF export functionality
- Firebase Firestore data persistence
- User authentication (multiple providers)

### Known Fragile Areas (APPROACH WITH EXTREME CAUTION)
- Anything in `/src/features/chat/` - Multiple chat implementations exist
- `/src/services/` directory - Complex service layer with dependencies  
- State management in `/src/context/` - Interconnected contexts
- AI prompt templates in `/src/prompts/` - Tested and tuned prompts

### Working But Legacy (DO NOT TOUCH UNLESS CRITICAL)
- `/archive/legacy-chat/` - Old chat implementations (13+ versions)
- `/archive/legacy-features/` - Previous feature implementations
- Files with version numbers (ChatV2, ChatV3, etc.)

---

## Safe to Modify

### UI/Styling Changes Only
- `/src/index.css` - Global styles
- `/src/styles/` directory - Style files (EXCEPT design-system.css)
- Tailwind classes in components (color, spacing, etc.)
- `/src/components/animations/` - Animation components

### Content and Text Updates
- Landing page copy in `/src/components/LandingPage.jsx`
- Help text and instructions in UI components
- Button labels and micro-copy
- Error messages (but not error handling logic)

### Safe Configuration Changes
- `/tailwind.config.js` - Tailwind configuration
- `/vite.config.js` - Build configuration (minor tweaks only)
- Environment variables in deployment (NOT Firebase config)

### How to Test Safe Changes
1. Always test in development first: `npm run dev`
2. Check the console for errors
3. Test the complete user flow (sign up → create project → export)
4. Run build to ensure no build errors: `npm run build`

### Rollback Procedures for Safe Changes
1. Use Git to revert changes: `git checkout -- filename.ext`
2. For multiple files: `git reset --hard HEAD~1`
3. Force refresh browser cache after reverting

---

## Common Breaking Points

### Historical Issues and Their Causes

#### 1. Firebase Connection Failures
**What Happened**: Multiple instances where Firebase changes broke data persistence
**Warning Signs**: 
- Console errors mentioning "Firebase" or "Firestore"
- Users can't save or load projects
- Authentication stops working

**Prevention**: NEVER modify `/src/firebase/firebase.js` or Firebase configuration

#### 2. Chat State Management Corruption
**What Happened**: Changes to state management broke conversation flow
**Warning Signs**:
- Chat stops responding
- User input doesn't advance the conversation  
- Blueprint data gets lost during conversation

**Prevention**: DO NOT modify SOPFlowManager.ts or FSMContextV2.tsx

#### 3. AI Service Integration Breaks
**What Happened**: Changes to AI service integration caused conversation failures
**Warning Signs**:
- AI responses stop generating
- Empty or error responses from chat
- Infinite loading states

**Prevention**: Don't modify `/src/services/GeminiService.ts` or AI prompt templates

#### 4. Route Configuration Issues
**What Happened**: Changes to routing broke navigation between pages
**Warning Signs**:
- Pages don't load correctly
- URL changes don't update content
- Authentication redirects fail

**Prevention**: Minimal changes to `/src/AppRouter.tsx`

#### 5. Context Provider Ordering Problems
**What Happened**: Reordering React context providers broke state management
**Warning Signs**:
- Undefined context errors in console
- Components can't access global state
- Authentication state issues

**Prevention**: Don't reorder providers in AppRouter.tsx

### How to Avoid Breaking Changes

#### Before Making ANY Change:
1. **Document current working state**: Take screenshots of working functionality
2. **Create git branch**: `git checkout -b your-change-name`
3. **Test current functionality**: Ensure everything works before changes
4. **Make minimal changes**: One small change at a time
5. **Test immediately**: After each change, test the affected functionality

#### Red Flags - Stop Immediately If You See:
- Console errors about Firebase, authentication, or context
- Chat interface stops responding or loading infinitely
- User data not saving or loading
- Build errors or TypeScript errors
- Changes affecting more files than expected

---

## Data Flow Documentation

### Wizard → Blueprint Creation Flow
```
User completes wizard
    ↓ (wizardData saved)
Dashboard → New Blueprint button
    ↓ (creates blueprint ID)
ChatLoader.tsx initializes
    ↓ (loads/creates blueprint document)
ChatInterface.tsx renders
    ↓ (SOPFlowManager manages conversation)
User interacts with AI
    ↓ (responses processed and data extracted)
Blueprint updated in real-time
    ↓ (auto-saved to Firebase)
Export functionality generates PDF/Docs
```

### Chat Interaction Cycle (CRITICAL FLOW)
```
1. User Input Capture
   ChatInterface.tsx → input validation → SOPFlowManager

2. AI Processing  
   SOPFlowManager → GeminiService → AI API → response parsing

3. Data Extraction
   AI response → AIResponseParser → structured data → blueprint update

4. State Management
   Blueprint update → state change → UI re-render → Firebase save

5. User Interface Update
   New suggestions → quick replies → progress indicators
```

### Firebase Saving/Loading (NEVER BREAK THIS)
```
Blueprint Creation:
User action → SOPFlowManager.updateStepData() → Firebase.saveBlueprint()

Blueprint Loading:
Dashboard → useBlueprintDoc() → Firebase.loadBlueprint() → state hydration

Auto-save:
Any data change → debounced save → Firebase.autoSave()
```

### Dashboard Display Flow
```
Dashboard component loads
    ↓
useAuth() gets user ID
    ↓
Firebase query for user's blueprints
    ↓
Real-time listener updates project list
    ↓
ProjectCard components render project previews
```

---

## Testing Checklist

### After ANY System Change - Test These Critical Paths

#### 1. Basic User Flow (MUST WORK)
- [ ] Landing page loads without errors
- [ ] Sign-in works (try guest/anonymous)
- [ ] Dashboard shows correctly
- [ ] "New Blueprint" button works
- [ ] Wizard completes successfully
- [ ] Chat interface loads and responds
- [ ] Can complete at least one conversation step
- [ ] Data saves automatically (refresh page to verify)

#### 2. Data Persistence (CRITICAL)
- [ ] Create new project, add data, refresh browser - data persists
- [ ] Sign out and sign back in - projects still visible
- [ ] Complete project through to export - all data present
- [ ] Multiple projects can be created and managed

#### 3. AI Conversation (CORE FEATURE)
- [ ] Chat responds to user input within 10 seconds
- [ ] Suggestions appear when appropriate
- [ ] "Ideas" and "What-If" buttons generate relevant content
- [ ] Can advance through conversation stages
- [ ] Blueprint data updates as conversation progresses

#### 4. Export Functionality (MUST WORK)
- [ ] Complete project shows export options
- [ ] PDF download works for teacher guide
- [ ] PDF download works for student guide
- [ ] Google Docs export generates correct format
- [ ] Plain text export contains all project data

#### 5. Error Handling
- [ ] No console errors during normal usage
- [ ] Graceful handling of network issues
- [ ] Firebase connection errors don't crash app
- [ ] AI service errors show appropriate messages

### Expected Behaviors (What Success Looks Like)

#### Chat Interface Should:
- Respond to user input within 5-10 seconds
- Show typing indicators while processing
- Display relevant suggestions after AI responses
- Maintain conversation context throughout session
- Auto-save progress without user intervention

#### Data Management Should:
- Save changes automatically within 2-3 seconds
- Persist data across browser sessions
- Handle offline/online state gracefully
- Maintain data integrity during rapid changes

#### Navigation Should:
- Load pages within 2-3 seconds
- Maintain authentication state across navigation
- Handle direct URL access correctly
- Redirect appropriately after sign-in

---

## Emergency Recovery

### When Something Breaks - Step-by-Step Recovery

#### 1. Immediate Assessment
```bash
# Check if the app builds
npm run build

# Check for console errors
npm run dev
# Open browser console and look for red errors
```

#### 2. Identify What Broke
Look for these common error patterns in console:
- **Firebase errors**: Usually auth or database connection issues
- **React context errors**: State management problems  
- **Module import errors**: File path or dependency issues
- **TypeScript errors**: Type definition problems

#### 3. Quick Fixes to Try First

**If chat stops working:**
```bash
# Clear browser cache completely
# Try incognito/private browsing window
# Check network tab for failed API calls
```

**If data isn't saving:**
```bash
# Check Firebase console for service status
# Verify environment variables are set
# Test with different browser
```

**If authentication breaks:**
```bash
# Check Firebase Authentication settings
# Verify all auth providers are configured
# Test anonymous sign-in specifically
```

#### 4. Git Recovery Commands

**Undo last commit:**
```bash
git reset --soft HEAD~1
```

**Undo all changes to specific file:**
```bash
git checkout -- path/to/file.js
```

**Revert to last working state (NUCLEAR OPTION):**
```bash
git reset --hard HEAD~1
```

**Create backup before major changes:**
```bash
git branch backup-before-changes
```

### How to Identify What Broke

#### Check These Files First (In Order):
1. `/src/firebase/firebase.js` - Firebase connection
2. `/src/AppRouter.tsx` - Routing and authentication  
3. `/src/components/chat/ChatInterface.tsx` - Chat functionality
4. `/src/core/SOPFlowManager.ts` - Conversation state
5. `/package.json` - Dependencies

#### Console Error Patterns and Solutions:

**"Cannot read property of undefined"**
- Usually a context or state management issue
- Check if providers are properly ordered in AppRouter.tsx

**"Module not found"**  
- Import path is broken
- Check if file was moved or renamed

**"Firebase: Error (auth/...)"**
- Authentication configuration issue
- Verify Firebase settings haven't changed

**"TypeError: Cannot destructure property"**
- Component props or context structure changed
- Check if data structure matches expected format

### Emergency Contact Information

#### When to Escalate (Call for Help):
- Data loss - users can't access their projects
- Complete system down - app won't load at all
- Security issues - authentication completely broken
- Firebase quota exceeded - service unavailable

#### Before Calling for Help - Gather This Information:
1. Exact error messages from console
2. What changes were made recently
3. Which browsers/devices are affected
4. Whether the issue affects all users or specific users
5. Screenshots of error states

#### Recovery Documentation
- Keep a recovery log: document what broke, what fixed it
- Update this document with new issues and solutions
- Maintain a changelog of all system modifications

---

## Final Notes

### Key Principles for System Stability:
1. **If it works, don't "improve" it**
2. **Test everything immediately after changes**  
3. **Make one small change at a time**
4. **Always have a rollback plan**
5. **When in doubt, don't change it**

### Remember:
- This system handles complex AI conversation management
- Firebase integration is critical for data persistence
- Multiple authentication methods must remain functional
- The chat interface is the core user experience
- Breaking changes affect all current users immediately

**The goal is a stable, working system - not perfect code.**

---

*Last Updated: [Current Date]*
*Document Version: 1.0*
*Maintainer: Project Owner*