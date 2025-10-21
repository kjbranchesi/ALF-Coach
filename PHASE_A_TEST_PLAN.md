# Phase A+ Deployment Test Plan

**Date**: October 21, 2025
**Time Required**: 15-20 minutes
**Prerequisite**: Code deployed to Netlify

---

## 🎯 Quick Smoke Test (5 min)

### 1. Dashboard Load Test
```
1. Go to: https://your-site.netlify.app/app/dashboard
2. Expected: ✅ Dashboard loads without errors
3. Check console: ❌ No "Missing or insufficient permissions" errors
```

**Pass/Fail**: ______

---

### 2. Create New Project Test
```
1. Click "New Project" or go to /app/project/new-project
2. Complete wizard (any topic, any inputs)
3. Let chat generate ideation → journey → deliverables
4. Expected: ✅ Chat completes without crashes
```

**Pass/Fail**: ______

---

### 3. Console Error Check
Open browser DevTools console during project creation:

**❌ Should NOT see:**
- ❌ `completedAt.toISOString is not a function`
- ❌ `Unexpected end of JSON input`
- ❌ `Project not found: :id`
- ❌ `Missing or insufficient permissions`

**✅ Should see:**
- ✅ `[UnifiedStorageManager] Project saved: project_...`
- ✅ `[UnifiedStorageManager] Background Firebase sync successful`

**Pass/Fail**: ______

---

## 🔬 Deep Validation Test (15 min)

### 4. Firestore Data Check
```
1. Go to: https://console.firebase.google.com/project/alf-coach-3aeab
2. Navigate: Firestore Database
3. Path: users → {your-uid} → projectDrafts
4. Expected: ✅ See your project document
5. Verify fields exist:
   - title
   - metadata.description
   - metadata.completedAt (should be timestamp, not error)
   - wizardData
   - capturedData
```

**Pass/Fail**: ______

---

### 5. Firebase Storage Check
```
1. Same Firebase console
2. Navigate: Storage
3. Path: users/{your-uid}/projects/{project-id}/
4. Expected: ✅ See showcase.json file
5. Download and verify:
   - File size > 1KB
   - Valid JSON (opens in editor)
   - Has microOverview, runOfShow, assignments, outcomes
```

**Pass/Fail**: ______

---

### 6. ReviewScreen Load Test
```
1. After creating project, click "Review" or go to /app/project/{id}/preview
2. Expected: ✅ ReviewScreen loads with full data
3. Verify sections show:
   - Project title and description
   - Week-by-week breakdown
   - Assignments
   - Outcomes
4. Check console: ❌ No errors
```

**Pass/Fail**: ______

---

### 7. Cross-Device Test (Optional)
```
1. Copy project URL: /app/project/{id}/preview
2. Open in different browser OR incognito window
3. Expected: ✅ Project loads from cloud
4. Console should show: "[CloudProjectService] Loading from cloud first"
```

**Pass/Fail**: ______

---

## 🎨 Data Quality Check

### 8. AI Generation Quality
**Before** (with fallback templates):
- Generic placeholder text
- "Students explore..." boilerplate
- Missing details

**After** (with Gemini API):
- ✅ Specific, contextual content
- ✅ Age-appropriate language
- ✅ Detailed assignments and outcomes
- ✅ Complete JSON responses (no parse errors)

**Quality improved?**: ______

---

## 🐛 Known Issues to Ignore (For Now)

These are **expected** and will be fixed in chatbot deep dive:

### Expected Console Warnings
- `[ChatMVP] Description is too short` - Quality issue, not a bug
- `[ChatMVP] Description appears to use template fallback` - AI quality issue
- Some Firestore permission warnings for other collections - Not critical

### Expected Behavior
- Showcase data may still have quality issues (generic content)
- This is a PROMPT ENGINEERING problem, not a technical bug
- We'll fix in chatbot deep dive tomorrow

---

## ✅ Success Criteria

Phase A+ deployment is successful if:

- [ ] Dashboard loads without permission errors
- [ ] New projects save to Firestore
- [ ] Showcase JSON saves to Storage
- [ ] No date serialization errors
- [ ] No JSON parsing crashes
- [ ] No `:id` routing errors
- [ ] ReviewScreen loads with data

**Minimum**: 6/7 passing = Success ✅

---

## 🚨 If Tests Fail

### Console shows date errors?
```
Check: UnifiedStorageManager.ts lines 760-765
Symptom: "toISOString is not a function"
Fix: Date restoration not working - recheck deployment
```

### Console shows JSON parse errors?
```
Check: ai.ts sanitizeAI function
Symptom: "Unexpected end of JSON input"
Fix: Code fence extraction not working - verify build
```

### Dashboard shows permission errors?
```
Check: Firestore rules deployed?
Run: npx firebase deploy --only firestore:rules
Verify: users/{userId}/projectDrafts rules exist
```

### No data in Firestore/Storage?
```
Check: Browser console for actual errors
Verify: Firebase auth working (check auth.currentUser)
Check: Network tab for failed requests
```

---

## 📊 Test Results Template

```
Date: ____________
Time: ____________
Site URL: ____________

Quick Smoke Test: ___/3 passing
Deep Validation: ___/4 passing
Data Quality: Improved? Y/N

Overall: PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Next Steps Based on Results

### If ALL TESTS PASS ✅
- Phase A is ~90% complete
- Remaining: Monitor production 24-48 hours
- Tomorrow: Chatbot deep dive
- This week: Declare Phase A complete

### If SOME TESTS FAIL ⚠️
- Debug failed tests (see troubleshooting above)
- Re-deploy if needed
- Re-test
- Document any new issues found

### If MOST TESTS FAIL 🔴
- Rollback deployment
- Review changes
- Re-test locally first
- Investigate build/deployment issues

---

**Ready to test?** Deploy, run through checklist, report results! 🚀
