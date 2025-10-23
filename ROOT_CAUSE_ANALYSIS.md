# Root Cause Analysis: TDZ Errors "Cannot access 'je' before initialization"

## **THE REAL PROBLEM**

**NOT** function ordering.
**NOT** dynamic vs static imports.
**NOT** minifier issues.

**THE ACTUAL CAUSE**: **Missing React Hook dependencies** causing stale closures in production builds.

---

## How It Broke

### Timeline:
1. **Phase A+ (Working)** - Chatbot was basic, fewer hooks, simpler dependencies
2. **Codex Improvements** - Added AI-powered journey/deliverables generation
   - Added complex async patterns
   - Added multiple useCallbacks with dependencies
   - **FORGOT** to add all dependencies to arrays
3. **Production Build** - Minifier exposed the stale closures as TDZ errors

### What Actually Happened:
```typescript
// BROKEN CODE (what Codex wrote):
const acceptSuggestion = useCallback(async (text) => {
  engine.appendMessage({...}); // ❌ Uses 'engine'
}, [captured, stage, wizard]); // ❌ Doesn't list 'engine'

// When minified:
// - Variable 'engine' gets renamed to 'je'
// - Callback captures stale reference to 'je'
// - On execution: "Cannot access 'je' before initialization"
```

---

## The 3 Critical Violations

Discovered via `npx eslint --rule 'react-hooks/exhaustive-deps: error'`

### **Violation #1: Line 167**
```typescript
const acceptSuggestion = useCallback(async (text, index?) => {
  // Line 143: engine.appendMessage({...}) ❌ USES engine
  // Line 154: engine.appendMessage({...}) ❌ USES engine
}, [captured, stage, wizard, autosaveEnabled]); // ❌ MISSING: engine
```

**Fix**: Added `engine` to deps
```typescript
}, [captured, stage, wizard, autosaveEnabled, engine]); // ✅
```

---

### **Violation #2: Line 304**
```typescript
const updateDeliverablesChips = useCallback((state) => {
  if (journeyV2Enabled) { ... }
  if (state) {
    setMicroFlowActionChips(getDeliverablesActionChips(state)); // Uses imported function
  }
}, [journeyV2Enabled, getDeliverablesActionChips]); // ❌ WRONG
```

**ESLint Error**:
> "React Hook useCallback has an unnecessary dependency: 'getDeliverablesActionChips'. Either exclude it or remove the dependency array. **Outer scope values like 'getDeliverablesActionChips' aren't valid dependencies because mutating them doesn't re-render the component**"

**Fix**: REMOVED `getDeliverablesActionChips` from deps (it's an imported function, doesn't need to be listed)
```typescript
}, [journeyV2Enabled]); // ✅
```

**Key Learning**: Imported functions/constants don't cause re-renders, so they don't belong in dependency arrays.

---

### **Violation #3: Line 1763 (The Big One)**
```typescript
const handleSend = useCallback(async (text?) => {
  // Line 1374: Uses suppressNextAckUntil ❌
  const shouldSuppressAck = suppressNextAckUntil !== null && now < suppressNextAckUntil;

  // Line 1611: Uses processDeliverablesResult ❌
  if (await processDeliverablesResult(deliverablesMicroState, result)) { ... }

  // Multiple places: Uses updateDeliverablesChips ❌

}, [engine, stage, wizard, captured, messageCountInStage, stageTurns, aiStatus,
    autosaveEnabled, projectId, conversationHistory, handleProjectCompletion,
    hasWizardName, deliverablesMicroState, deliverablesComplete, journeyV2Enabled]);
    // ❌ MISSING: processDeliverablesResult, suppressNextAckUntil, updateDeliverablesChips
```

**Fix**: Added all 3 missing dependencies
```typescript
}, [...all previous deps..., processDeliverablesResult, suppressNextAckUntil, updateDeliverablesChips]); // ✅
```

---

## Why We Kept Missing It

1. **Dev mode works fine** - Vite doesn't minify, hoisting works naturally
2. **Minified production breaks** - Variable renaming + stale closures = TDZ
3. **Error message misleading** - "Cannot access 'je'" doesn't say which source variable
4. **Manual inspection failed** - 2,484 lines of code, 40+ hooks
5. **ESLint was the key** - Only automated tool caught all violations

---

## What Fixed It

### Command Used:
```bash
npx eslint src/features/chat-mvp/ChatMVP.tsx --rule 'react-hooks/exhaustive-deps: error'
```

### Violations Found:
- Line 167: Missing `engine`
- Line 304: Unnecessary `getDeliverablesActionChips` (removed)
- Line 1763: Missing `processDeliverablesResult`, `suppressNextAckUntil`, `updateDeliverablesChips`

### Result:
✅ Build succeeds
✅ Production bundle has correct closures
✅ TDZ errors eliminated

---

## Lessons Learned

1. **Always run ESLint with exhaustive-deps** before deploying React apps
2. **Don't add imported functions to dependency arrays** (they're not reactive)
3. **Stale closures in production ≠ errors in dev** (minification exposes them)
4. **Large callbacks need careful dependency auditing** (handleSend had 16 deps!)
5. **Manual code review can't replace automated linting** for dependency violations

---

## Prevention Going Forward

### Add to CI/CD:
```bash
# .github/workflows/deploy.yml
- name: Lint React Hooks
  run: npx eslint src/ --rule 'react-hooks/exhaustive-deps: error'
```

### Enable in ESLint config:
```json
// .eslintrc.json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"  // Not just "warn"
  }
}
```

### Pre-commit hook:
```bash
# .husky/pre-commit
npx eslint --rule 'react-hooks/exhaustive-deps: error' $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?|jsx?)$')
```

---

## Summary

**What we thought**: Minifier/hoisting/import issues
**What it was**: Missing React Hook dependencies
**How we found it**: ESLint `exhaustive-deps` rule
**How we fixed it**: Added missing deps, removed unnecessary ones
**Time wasted**: ~4 hours chasing symptoms
**Time to fix after ESLint**: ~5 minutes

**Moral**: Use the right tool for the job. ESLint exists for a reason. 🎯
