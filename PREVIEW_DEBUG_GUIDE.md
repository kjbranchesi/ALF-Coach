# Preview Page Debug Guide

## The Issue
When clicking "View your Review" after completing a chat MVP project, the page shows:
```
Loading...
We're recovering from a navigation error.

Refresh Application
```

## What We've Fixed So Far

### 1. **Emergency Bypass - Load Raw Project Data** (commit: c22c1b7)
- Added fallback to load `alf_project_${id}` directly from localStorage
- Bypasses hero transformation if it fails
- Priority order: heroData > rawProjectData > blueprint (Firestore)

### 2. **Fixed Error Logic** (commit: 291c7f1)
- Changed error condition to only show error if ALL sources fail
- Before: Showed error if heroData was null (too strict)
- After: Only shows error if heroData AND rawData AND Firestore all fail

### 3. **Comprehensive Error Logging** (commit: 5405da1)
- Added detailed logging to NavigationErrorBoundary
- Will show EXACTLY what error is being thrown

---

## How to Debug

### Step 1: Open Browser DevTools
1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Go to **Console** tab
3. Clear console (click trash icon)

### Step 2: Complete a Project
1. Go through chat MVP flow
2. Accept deliverables
3. Watch console for logs

### Step 3: Click "View your Review"
1. Click the green button
2. **Immediately look at console**
3. You should see one of these scenarios:

---

## Console Log Scenarios

### ✅ **SUCCESS Scenario**
```
[ReviewScreen] =========== LOADING PROJECT DATA ===========
[ReviewScreen] Project ID: project_1234567890
[ReviewScreen] Raw localStorage data exists: true
[ReviewScreen] Raw project data loaded: { hasShowcase: true, hasWizardData: true, ... }
[ReviewScreen] LocalStorage keys: ["alf_project_1234567890", ...]
[UnifiedStorageManager] Hero data loaded from cache: project_1234567890
[ReviewScreen] Hero data loaded: { exists: true, hasShowcase: true, ... }
[ReviewScreen] ✅ Hero data loaded successfully: project_1234567890
[ReviewScreen] =========== LOAD COMPLETE ===========
```
**Result:** Preview loads correctly

---

### ⚠️ **PARTIAL SUCCESS (Using Raw Data)**
```
[ReviewScreen] =========== LOADING PROJECT DATA ===========
[ReviewScreen] Project ID: project_1234567890
[ReviewScreen] Raw localStorage data exists: true
[ReviewScreen] Raw project data loaded: { hasShowcase: true, hasWizardData: true, ... }
[ReviewScreen] LocalStorage keys: ["alf_project_1234567890"]
[UnifiedStorageManager] Hero data load failed: ...
[ReviewScreen] ⚠️ No hero data returned, using raw project data
[ReviewScreen] =========== LOAD COMPLETE ===========
```
**Result:** Preview loads with raw data (no hero transformation)

---

### ❌ **FAILURE Scenario (Navigation Error)**
```
[ReviewScreen] =========== LOADING PROJECT DATA ===========
[ReviewScreen] Project ID: project_1234567890
[ReviewScreen] Raw localStorage data exists: false
[ReviewScreen] LocalStorage keys: []
[ReviewScreen] ❌ Project load failed: ...
[ReviewScreen] =========== LOAD COMPLETE ===========

🚨🚨🚨 NAVIGATION ERROR BOUNDARY CAUGHT ERROR 🚨🚨🚨
Error: [ERROR DETAILS HERE]
Error message: [MESSAGE]
Error stack: [STACK TRACE]
Component stack: [COMPONENT HIERARCHY]
Current URL: http://localhost:5173/app/project/project_1234567890/preview
🚨🚨🚨 END ERROR DETAILS 🚨🚨🚨
```
**Result:** Shows "We're recovering from a navigation error" page

---

## What To Check

### 1. **Check localStorage Keys**
In console, run:
```javascript
Object.keys(localStorage).filter(k => k.startsWith('alf_'))
```

You should see:
- `alf_project_${projectId}` - The raw project data
- `alf_hero_${projectId}` - The transformed hero data (optional)

### 2. **Check Raw Project Data**
```javascript
// Replace with actual project ID
const projectId = 'project_1234567890';
const raw = localStorage.getItem(`alf_project_${projectId}`);
const parsed = JSON.parse(raw);
console.log('Project data:', {
  hasShowcase: !!parsed.showcase,
  showcaseKeys: parsed.showcase ? Object.keys(parsed.showcase) : [],
  hasWizardData: !!parsed.wizardData,
  hasCapturedData: !!parsed.capturedData,
  status: parsed.status,
  stage: parsed.stage
});
```

### 3. **Check If Showcase Was Generated**
```javascript
const parsed = JSON.parse(localStorage.getItem(`alf_project_${projectId}`));
console.log('Showcase:', parsed.showcase);
```

Should show:
```javascript
{
  projectId: "...",
  title: "...",
  tagline: "...",
  description: "...",
  assignments: [...],  // Should have 4 items
  runOfShow: [...],    // Should have 4 weeks
  rubric: { ... },
  materialsList: [...]
}
```

---

## Common Issues & Fixes

### Issue 1: `alf_project_${id}` doesn't exist
**Cause:** Project wasn't saved
**Fix:** Check ChatMVP completion logic - is `unifiedStorage.saveProject()` being called?

### Issue 2: Project exists but no showcase
**Cause:** Showcase generation failed
**Fix:** Check `generateProjectShowcase()` in ChatMVP.tsx around line 759

### Issue 3: Hero transformation throws error
**Cause:** HeroProjectTransformer has a bug
**Fix:** Check error stack trace, fix transformer

### Issue 4: ReviewScreen throws error on render
**Cause:** Missing data or null reference
**Fix:** Check the error boundary logs for exact error

---

## Manual Test Steps

1. **Start fresh:**
   ```bash
   # Clear localStorage
   localStorage.clear()
   ```

2. **Complete project:**
   - Go through entire chat flow
   - Accept deliverables
   - Wait for "Project Complete" message

3. **Before clicking button:**
   ```javascript
   // Check localStorage
   Object.keys(localStorage).filter(k => k.startsWith('alf_'))
   ```

4. **Click "View your Review"**
   - Watch console carefully
   - Copy any error messages

5. **If it fails:**
   - Copy ALL console logs
   - Check localStorage contents
   - Take screenshot of error page

---

## Next Steps Based on Logs

### If you see: "Raw localStorage data exists: false"
→ **Problem:** Project not being saved
→ **Check:** ChatMVP completion flow, unifiedStorage.saveProject()

### If you see: "Hero transformation failed"
→ **Problem:** Hero transformer has a bug
→ **Check:** HeroProjectTransformer.ts, error stack trace

### If you see: Navigation error with component stack
→ **Problem:** ReviewScreen throwing error on render
→ **Check:** The exact error message and component where it fails

### If you see: No logs at all
→ **Problem:** Code not running or page redirecting
→ **Check:** Network tab, make sure route exists

---

## Files Modified

1. **src/features/review/ReviewScreen.tsx**
   - Added rawProjectData state
   - Load raw data directly from localStorage
   - Wrapped hero transformation in try/catch
   - Fixed error logic to check all sources

2. **src/components/ErrorBoundary.tsx**
   - Added comprehensive error logging
   - Shows full stack trace and component hierarchy

3. **src/services/UnifiedStorageManager.ts**
   - Enhanced logging for hero transformation
   - Shows data structure at each step

---

## Push Changes and Test

```bash
git push
```

Then:
1. Go to deployed URL
2. Complete a project
3. Check console logs
4. Send me the logs if it still fails

The new logging will tell us EXACTLY what's failing!
