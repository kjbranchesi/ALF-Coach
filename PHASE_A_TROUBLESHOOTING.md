# Phase A Troubleshooting Guide

**Date:** 2025-10-19
**Status:** Build succeeds locally, but production site shows navigation error

## Current Situation

### ✅ What's Working
- Local build completes successfully (`npm run build`)
- All commits pushed to GitHub (commit `8df8747`)
- Code has no syntax errors
- `featureFlags` export added correctly

### ❌ What's Not Working
- Production site (alflearninglabs.com) shows "We're recovering from a navigation error"
- Both `/app/debug/telemetry` and completed project pages fail to load
- Error boundary is catching a JavaScript error

## Root Cause Analysis

The error boundary (`NavigationErrorBoundary`) is catching errors, which suggests:

1. **Build might still be failing on Netlify** (even though it works locally)
2. **Runtime error in production** that doesn't happen locally
3. **Cache issue** - browser or CDN serving old broken files

## Morning Checklist

### Step 1: Check Netlify Deployment Status

1. Go to https://app.netlify.com
2. Find your "projectcraft-alf" site
3. Check the latest deployment:
   - ✅ If it says **"Published"** with commit `8df8747` → Good! Go to Step 2
   - ❌ If it says **"Failed"** → Check build logs for errors
   - ⏳ If it's still **"Building"** → Wait for it to complete

### Step 2: Check Environment Variables on Netlify

The featureFlags need environment variables to work. Verify these are set:

1. In Netlify dashboard → Site settings → Environment variables
2. Confirm these exist:
   ```
   VITE_CLOUD_FIRST_READS=true
   VITE_ENABLE_OFFLINE_SNAPSHOT=true
   VITE_ENABLE_IDB_FALLBACK=true
   ```

3. If they're missing → Add them and **trigger a new deploy**

### Step 3: Hard Refresh the Browser

The error might be from cached old JavaScript:

1. Open alflearninglabs.com
2. Press **Cmd+Shift+R** (hard refresh) to clear cache
3. Try accessing `/app/debug/telemetry` again

### Step 4: Check Browser Console for Real Error

1. Open alflearninglabs.com/app/debug/telemetry
2. Open DevTools (Cmd+Option+I)
3. Go to Console tab
4. Look for red error messages
5. Screenshot the error and send to me

The error will tell us exactly what's failing:
- Import error → Missing file or wrong path
- Undefined variable → Missing export or env var
- Network error → CDN/cache issue

### Step 5: Trigger Manual Netlify Deploy

If Netlify is stuck on old build:

1. Go to Netlify dashboard → Deploys
2. Click "Trigger deploy" → "Deploy site"
3. Wait 2-3 minutes for build
4. Check if it succeeds
5. Test site again

### Step 6: Check Specific Files on Netlify

If build succeeds but error persists, check if files are correct:

1. In Netlify deploy → "Deploy log"
2. Look for: `dist/assets/featureFlags-*.js`
3. Download that file and verify it contains:
   ```javascript
   export const featureFlags = {
     cloudFirstReads: ...
   ```

## Likely Scenarios

### Scenario A: Netlify Build Still Failing
**Symptom:** Latest deploy shows "Failed"
**Fix:** Check build logs for specific error, fix it, commit, push

### Scenario B: Environment Variables Missing
**Symptom:** Build succeeds but featureFlags are all `false`
**Fix:** Add env vars in Netlify settings, redeploy

### Scenario C: Browser Cache Issue
**Symptom:** Hard refresh shows different error or works
**Fix:** Clear cache, wait for CDN to propagate (~5 min)

### Scenario D: Import Path Error in Production Only
**Symptom:** Works locally but not on Netlify
**Fix:** Check for case-sensitive file paths or absolute vs relative imports

## Commands to Run in Morning

```bash
# 1. Check local build still works
npm run build

# 2. Check git status
git status
git log --oneline -5

# 3. If you made any fixes, push them
git add .
git commit -m "Fix: [describe what you fixed]"
git push
```

## Files Most Likely to Have Issues

1. `src/config/featureFlags.js` - Check export is correct
2. `src/services/ProjectLoadService.ts` - Check import statement
3. `src/pages/DebugTelemetry.tsx` - Check all imports
4. `src/features/review/ReviewScreen.tsx` - Check featureFlags usage

## Contact Info for Morning

When you wake up, send me:

1. Screenshot of Netlify latest deployment status
2. Screenshot of browser console error (if any)
3. Screenshot of Netlify environment variables page

I'll be ready to help debug further!

## Expected Outcome

Once working, you should see:
- `/app/debug/telemetry` → Telemetry dashboard with metrics
- Completed project → Console logs showing cloud-first loading
- No error boundaries triggering

---

**Note:** The local build works perfectly, so this is purely a deployment/runtime issue. We'll get it working! 🚀

Sleep well! We'll fix this in the morning.
