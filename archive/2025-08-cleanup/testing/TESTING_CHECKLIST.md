# ALF Coach Testing Checklist

## Critical Fixes Applied
✅ **Save & Exit Button** - Now properly connected to save functionality
✅ **Blueprint Persistence** - Automatic sync between chat flow and storage
✅ **Dashboard Display** - Shows both Firebase and localStorage blueprints
✅ **Input Position** - Fixed at bottom in classic ChatGPT layout
✅ **Console Logging** - Added throughout for debugging

## Testing Flow

### 1. Dashboard & Blueprint Creation
- [ ] **Dashboard loads** without errors
- [ ] **"New Blueprint" button** works
- [ ] **ALF Process overview** appears (can skip or complete)
- [ ] **Console shows**: Blueprint creation logs

### 2. Wizard Flow
- [ ] **4-step wizard** appears after ALF overview
- [ ] **Step 1 (Vision)**: Can select teaching approach
- [ ] **Step 2 (Subject)**: Can enter subject details
- [ ] **Step 3 (Environment)**: Can set grade level, duration, etc.
- [ ] **Step 4 (Resources)**: Can specify materials and resources
- [ ] **"Start Creating" button** advances to Ideation
- [ ] **Console shows**: Wizard completion logs

### 3. Ideation Stage
- [ ] **Big Idea prompt** appears
- [ ] **Input at bottom** of screen (not top right)
- [ ] Can type response in input field
- [ ] **"Ideas" button** provides suggestions
- [ ] **"What If?" button** offers alternatives
- [ ] **Essential Question** prompt follows Big Idea
- [ ] **Challenge/Project** prompt completes Ideation
- [ ] **Console shows**: Step completion logs

### 4. Learning Journey Stage
- [ ] **Learning Phases** selector appears
- [ ] Can select/customize phases
- [ ] **Activities** builder shows up
- [ ] Can add/edit activities
- [ ] **Resources** selector available
- [ ] Can choose resources
- [ ] **Console shows**: Journey data being saved

### 5. Deliverables Stage
- [ ] **Milestones** selector appears
- [ ] Can set project milestones
- [ ] **Rubric Builder** shows criteria
- [ ] Can customize assessment criteria
- [ ] **Impact Designer** for audience/method
- [ ] Can specify how students will share
- [ ] **Console shows**: Deliverables data

### 6. Save & Exit Functionality
- [ ] **Save & Exit button visible** (bottom right)
- [ ] **Clicking Save & Exit**:
  - Shows "Saving..." state
  - Shows "Saved!" confirmation
  - Navigates to dashboard
- [ ] **Console shows**: Save operation logs

### 7. Dashboard Persistence
- [ ] **Returning to dashboard** shows saved blueprint
- [ ] **Blueprint card displays**:
  - Project title (from Big Idea)
  - Creation date
  - Progress indicator
- [ ] **Clicking blueprint** resumes where left off
- [ ] **Console shows**: Blueprint loading from storage

### 8. Resume & Continue
- [ ] **Reopening blueprint** loads correct stage/step
- [ ] **Previous data** is preserved
- [ ] Can continue from where you left off
- [ ] **Save & Exit** works again
- [ ] **Console shows**: Resume state logs

## Console Debugging

Look for these console messages:
```
[ChatInterface] Current state: {stage, step, showStageComponent, ...}
[ChatInterface] User input submitted: ...
[ChatInterface] Step completion initiated: ...
[ChatInterface] Quick reply clicked: ...
[ChatInterface] Stop generation requested
[ChatLoader] Saving blueprint to localStorage: ...
[Dashboard] Loaded X blueprints from localStorage
[Dashboard] Loaded Y blueprints from Firebase
```

## Common Issues to Check

1. **Input Position**: Should always be at bottom except in wizard/completed states
2. **Save Button**: Should show loading states and save successfully
3. **Blueprint Cards**: Should appear on dashboard after saving
4. **Resume Function**: Should load exactly where you left off
5. **Progress Sidebar**: Should show captured data from each stage

## Testing Tips

1. **Open DevTools Console** (F12) before starting
2. **Clear localStorage** if testing fresh: `localStorage.clear()` in console
3. **Test offline mode**: Disconnect internet to test localStorage fallback
4. **Test multiple saves**: Save at different stages to ensure all work
5. **Test browser refresh**: Ensure data persists after page reload

## Expected Behavior

✅ Save & Exit always saves current progress
✅ Blueprints always appear on dashboard
✅ Can always resume from last position
✅ Input always at bottom of screen
✅ Console shows helpful debugging info

## If Issues Occur

1. Check console for error messages
2. Look for specific [ChatInterface] or [ChatLoader] logs
3. Verify localStorage has `blueprint_` keys
4. Check network tab for Firebase calls
5. Note the exact step where issue occurs

---

**Test Date**: ___________
**Tested By**: ___________
**Version**: Current as of fixes applied