# 🛡️ Safe Refactoring Guide for ALF Coach

## The Golden Rules

1. **ONE change type per session**
2. **ALWAYS create restoration points**
3. **Test after EVERY file change**
4. **Never trust global find/replace**

## Safe Change Patterns

### Pattern 1: File-by-File TypeScript Migration
```bash
# SAFE approach for JS → TS conversion
1. Copy file: cp Component.jsx Component.tsx.new
2. Convert the .new file to TypeScript
3. Test with: import Component from './Component.tsx.new'
4. If working: mv Component.tsx.new Component.tsx
5. If broken: delete .new file, investigate
```

### Pattern 2: Component Extraction
```javascript
// SAFE: Add wrapper, don't modify original
export const ChatInterfaceNew = () => {
  // New refactored code
};

// Keep original working
export const ChatInterface = ChatInterfaceOld;

// Later, when proven stable, swap them
```

### Pattern 3: Dependency Updates
```bash
# NEVER do: npm update (updates everything)
# SAFE approach:
npm list [package]  # Check current version
npm install [package]@[specific-version]  # Update ONE package
npm run dev  # Test immediately
git commit  # Commit if working
```

## Danger Zones in ALF Coach

### 🔴 HIGH RISK Areas (Touch with extreme caution):
1. **ChatV6.tsx** - Central hub, everything depends on it
2. **firebase.js** - Break this = no data persistence  
3. **GeminiService** - Break this = no AI responses
4. **BlueprintContext** - Break this = lose user data

### 🟡 MEDIUM RISK Areas:
1. **SuggestionCards.tsx** - Your recent pain point
2. **Button components** - Used everywhere
3. **State management contexts** - Cascade failures

### 🟢 SAFE Areas (Good for testing changes):
1. **About/Landing pages** - Isolated
2. **Utility functions** - Can test independently
3. **Styles/CSS** - Visual only, won't break functionality

## Testing Checklist After Changes

### Quick Smoke Test (2 min):
- [ ] App loads without console errors
- [ ] Can navigate between pages
- [ ] Chat interface appears
- [ ] Can type in chat input
- [ ] Suggestion cards visible

### Core Functionality Test (5 min):
- [ ] Send a message in chat
- [ ] Receive AI response
- [ ] Click suggestion card
- [ ] Data persists on refresh
- [ ] No console errors during flow

### Full Regression Test (15 min):
- [ ] Complete ideation flow
- [ ] Test all navigation paths
- [ ] Check responsive design
- [ ] Verify all buttons work
- [ ] Test error states

## Recovery Procedures

### If Something Breaks:

#### Level 1: Quick Recovery (30 seconds)
```bash
git stash  # Stash your changes
npm run dev  # Verify it works again
```

#### Level 2: Restore Checkpoint (2 min)
```bash
git reset --hard HEAD~1  # Go back one commit
# OR
git checkout safety-net-[timestamp]  # Use safety branch
```

#### Level 3: File-Level Recovery (5 min)
```bash
# Restore specific file from last working commit
git checkout HEAD~1 -- src/components/ChatV6.tsx
```

#### Level 4: Nuclear Option (10 min)
```bash
# Find last known working commit
git log --oneline -20
git reset --hard [commit-hash]
```

## Suggested Workflow for Our Session

1. **Create Master Safety Branch**
   ```bash
   git checkout -b working-stable-backup
   git checkout main
   ```

2. **Make Changes in Tiny Increments**
   - Fix 1: App.jsx vs App.tsx (test → commit)
   - Fix 2: Error boundaries (test → commit)
   - Fix 3: Firebase rules (test → commit)

3. **Use Feature Flags**
   ```javascript
   // Add to src/config/featureFlags.js
   export const FEATURES = {
     USE_NEW_APP_ARCHITECTURE: false,
     USE_STRICT_FIREBASE: false,
     ENABLE_ERROR_BOUNDARIES: true
   };
   ```

4. **Test Incrementally**
   ```bash
   # After each change:
   npm run dev
   node scripts/health-check.js
   # Manual test core flow
   git add . && git commit -m "WORKS: [description]"
   ```

## Communication Protocol

When working together:
1. I'll announce BEFORE each change
2. You test immediately after  
3. We commit only if stable
4. We document what worked/failed

## Emergency Contact Points

If we break something:
1. DON'T PANIC
2. Run: `git status` (see what changed)
3. Run: `git diff` (see exact changes)
4. Share the error message
5. We'll trace back systematically

## Success Metrics

- ✅ Each change isolated and tested
- ✅ Commit history shows incremental progress
- ✅ Can rollback any change in <1 minute
- ✅ No 2-day debugging sessions
- ✅ Suggestion cards keep working throughout