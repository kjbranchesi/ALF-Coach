# ALF Coach Testing Guide

**Purpose:** Consistent, repeatable testing protocol for the complete project creation flow.

---

## 🧪 Complete Flow Test Protocol

### Pre-Test Checklist
- [ ] Clear localStorage: `localStorage.clear()` in browser console
- [ ] Sign out if logged in (use anonymous mode for testing)
- [ ] Start at homepage: `http://localhost:5173`
- [ ] Open browser DevTools console to monitor errors

---

## Test Flow 1: Minimal Intake → Chat → Dashboard

### **Step 1: Intake Wizard**
**Route:** `/app/new`

**Actions:**
1. Click "Start New Project" from header or dashboard
2. **Subject Selection (Step 1/3):**
   - Select: **Science**
   - Right-click Science → Set as Primary
   - Click **Next**

3. **Class Context (Step 2/3):**
   - Age Range: **Middle School (6-8)**
   - Class Size: **24**
   - Duration: **Multi-week Unit (3-6 weeks)**
   - Click **Next**

4. **Review (Step 3/3):**
   - Project Name: **"Community Climate Action"**
   - Initial Big Idea: **"Students investigate local climate impacts and design solutions for their community"**
   - Click **Start Building**

**Expected Result:**
- ✅ Navigates to `/app/blueprint/bp_[timestamp]_[id]`
- ✅ Chat interface loads
- ✅ AI greeting appears mentioning Science, Middle School
- ✅ Console shows: "Created new blueprint ID: bp_..."

---

### **Step 2: Chat - Big Idea Stage**

**Current Stage Indicator:** "Stage 1 of 3 · big idea"

**AI First Message:**
```
Something like:
"Middle schoolers ready to tackle real science challenges...
What's the core concept you want them to carry forward?"
```

**Test Input 1 - Help Request:**
```
Type: "can you help me, any ideas?"
```

**Expected AI Response:**
- ✅ Should provide examples of Big Ideas for Science
- ✅ Should reference "systems thinking," "cause and effect," etc.
- ✅ Should ask what concept will stick with students
- ❌ Should NOT say "Perfect! I've captured that" (that's the old bug)

**Test Input 2 - Acceptance:**
```
Type: "yes" or "use the first one"
```

**Expected AI Response:**
- ✅ "Great! [Big Idea] gives students a powerful lens..."
- ✅ "Next, let's craft an essential question..."
- ✅ Provides coaching on what makes a good EQ
- ✅ Advances to Essential Question stage

**Verify:**
- [ ] Working Draft sidebar shows Big Idea captured
- [ ] Stage indicator updates to "Stage 2 of 3 · essential question"
- [ ] No console errors

---

### **Step 3: Chat - Essential Question Stage**

**Test Input 1 - Direct Input:**
```
Type: "How might our community adapt to changing climate patterns?"
```

**Expected AI Response:**
- ✅ Acknowledges the question
- ✅ Provides coaching about the challenge stage
- ✅ Suggests what students could create

**Test Input 2 - Accept Suggestion:**
```
Type: "sounds good"
```

**Expected Result:**
- ✅ Captures Essential Question
- ✅ Coaching appears with next steps
- ✅ Advances to Challenge stage
- ✅ Working Draft sidebar shows EQ captured

---

### **Step 4: Chat - Challenge Stage**

**Test Input:**
```
Type: "Design a climate action toolkit for local community leaders"
```

**Expected AI Response:**
- ✅ Confirms the challenge
- ✅ Explains next: Learning Journey structure
- ✅ Mentions suggesting complete journey

**Test Input:**
```
Type: "yes, show me the journey"
```

**Expected Result:**
- ✅ AI generates complete 3-4 phase journey structure
- ✅ Shows Phase 1, Phase 2, Phase 3, Phase 4 with details
- ✅ Each phase has name, timeframe, activities
- ✅ Asks if you want to use it or customize

**Verify:**
- [ ] Working Draft sidebar shows Challenge captured
- [ ] Journey structure is formatted clearly
- [ ] Stage indicator shows "Stage 3 of 3 · journey"

---

### **Step 5: Chat - Journey Acceptance**

**Test Input:**
```
Type: "yes, use this journey"
```

**Expected Result:**
- ✅ Captures all phases
- ✅ Shows coaching: "Excellent! You've mapped 4 phases..."
- ✅ Advances to Deliverables stage
- ✅ Working Draft sidebar shows phases

---

### **Step 6: Chat - Deliverables Stage**

**Test Input:**
```
Type: "show me a suggested deliverables structure"
```

**Expected Result:**
- ✅ AI generates:
  - 3-4 Milestones (aligned to phases)
  - 1-2 Final Artifacts
  - Rubric with 3-6 criteria
- ✅ Formatted clearly with bullets/numbers

**Test Input:**
```
Type: "perfect, use this"
```

**Expected Result:**
- ✅ Captures deliverables
- ✅ Shows completion message: "🎉 Project Complete!"
- ✅ Lists what was created (phases, milestones, artifacts, criteria)
- ✅ Mentions "View your complete project on the Dashboard"
- ✅ Project saved with `provisional: false`, `status: 'ready'`

**Verify:**
- [ ] Working Draft sidebar shows all sections complete
- [ ] No console errors
- [ ] All data saved (check Network tab for saves)

---

### **Step 7: Dashboard Verification**

**Actions:**
1. Navigate to `/app/dashboard` (click "Dashboard" in header)

**Expected Result:**
- ✅ Project card appears with:
  - Title: "Community Climate Action" (or auto-generated from Big Idea)
  - Badge: **"Ready"** (green/emerald)
  - Subject: Science (with colored icon)
  - Grade: Middle School (6-8)
  - Duration: Multi-week Unit
  - Description: AI-generated course description (if completed)
  - Updated: "Just now" or recent timestamp

**Verify Project Card:**
- [ ] Squircle shape with smooth corners
- [ ] Blue accent strip on left edge
- [ ] Hover effect (slight scale + shadow increase)
- [ ] Subject icon in squircle container
- [ ] Metadata badges (grade, duration, subject)
- [ ] "Open" button works
- [ ] "Delete" button works (test with caution!)

**Actions:**
2. Click "Open" on project card

**Expected Result:**
- ✅ Returns to `/app/blueprint/[id]`
- ✅ All captured data visible in Working Draft sidebar
- ✅ Chat history preserved
- ✅ Can continue editing

---

## Test Flow 2: In-Progress Projects Visibility

### **Purpose:** Verify projects appear on dashboard BEFORE completion

**Actions:**
1. Start new project (Steps 1-2 from Flow 1)
2. Complete only Big Idea stage
3. **Immediately navigate to Dashboard**

**Expected Result:**
- ✅ Project appears on dashboard with:
  - Badge: **"Draft"** (gray/slate)
  - Status: In-progress
  - Title: Auto-generated from Big Idea or "Untitled Project"
- ✅ Can click "Open" to continue

**This tests the `provisional: false` fix**

---

## Test Flow 3: Empty Projects Stay Hidden

### **Purpose:** Verify truly empty projects don't clutter dashboard

**Actions:**
1. Navigate to `/app/new`
2. Fill Step 1 & 2, click Next
3. On Step 3, click "Start Building" **WITHOUT entering Project Name or Big Idea**
4. Immediately navigate to Dashboard

**Expected Result:**
- ✅ Empty project does NOT appear (filtered out as `provisional: true`)
- ✅ Dashboard shows "No projects yet" if no other projects

---

## Test Flow 4: Help Requests

### **Purpose:** Verify AI responds helpfully to questions

**At any stage, test these inputs:**

**Input:** `"what should I put here?"`
**Expected:** Stage-specific guidance with examples

**Input:** `"can you help me?"`
**Expected:** Detailed help for current stage

**Input:** `"any ideas?"`
**Expected:** Multiple suggestions specific to current stage

**Input:** `"I'm stuck"`
**Expected:** Coaching and clarification

**Verify:**
- [ ] No "Perfect! I've captured that" for help requests
- [ ] Actual helpful, contextual responses
- [ ] References their previous inputs when relevant

---

## Test Flow 5: Intent Detection

### **Purpose:** Verify conversational inputs work correctly

**Test Acceptance Patterns:**
```
✅ Should capture as acceptance:
- "yes"
- "okay"
- "sure"
- "use the first one"
- "I like that"
- "sounds good"

❌ Should NOT capture (should trigger help):
- "okay how can you help me"
- "yes but what should I write"
- "I'm not sure, any ideas?"
- "can you explain that?"
```

**Verify:**
- [ ] Short affirmatives work
- [ ] Question words trigger help, not acceptance
- [ ] "okay" alone works, "okay [question]" doesn't

---

## Test Flow 6: Suggestions System

### **Purpose:** Verify lightbulb suggestions work

**Actions:**
1. At Big Idea stage, click lightbulb icon (💡)
2. Suggestion chips appear below input
3. Click a suggestion chip

**Expected Result:**
- ✅ Suggestion enters input field
- ✅ Can edit before sending
- ✅ OR suggestion sends immediately (depending on implementation)
- ✅ AI treats it as acceptance

---

## Test Flow 7: Journey Micro-Flow

### **Purpose:** Verify journey suggestions work

**Actions:**
1. Progress to Journey stage
2. Wait for AI to auto-suggest complete journey structure

**Expected Result:**
- ✅ Shows 3-4 phases automatically
- ✅ Each phase has name, description, activities
- ✅ Formatted clearly
- ✅ Can accept, regenerate, or customize

**Test Input:** `"make it shorter, just 3 phases"`

**Expected Result:**
- ✅ AI adjusts to 3 phases
- ✅ Regenerates structure
- ✅ Can accept new version

---

## Common Issues to Watch For

### 🔴 Red Flags (Critical Bugs):

1. **Chat freezes** - Input doesn't trigger response
2. **"Perfect! I've captured that"** on help requests
3. **Projects missing from dashboard** after capturing content
4. **Console errors** - especially Firebase permission errors
5. **Working Draft sidebar empty** when data exists
6. **Stage doesn't advance** after valid input

### 🟡 Yellow Flags (Non-Critical):

1. Slow AI responses (>5 seconds)
2. Suggestions don't appear immediately
3. Minor formatting issues in AI responses
4. Autosave timing inconsistencies

### ✅ Expected Behavior:

1. AI responds within 2-3 seconds
2. Smooth stage transitions
3. Working Draft updates in real-time
4. Dashboard shows projects immediately after meaningful content
5. All buttons work (Open, Delete, Back, Next)
6. No console errors (except optional Firebase warnings)

---

## Browser Console Checks

### During Testing, Monitor Console For:

**✅ Expected Messages:**
```
[ChatMVP] Project completed successfully
[projectPersistence] Successfully saved draft to Firebase
[Dashboard] Loaded X projects
Created new blueprint ID: bp_...
```

**❌ Should NOT See:**
```
Error: undefined is not a function
TypeError: Cannot read property...
Permission denied (unless offline testing)
Failed to save project (unless intentional)
```

---

## Test Data Reference

### Standard Test Inputs (for consistency):

**Big Ideas:**
- Science: `"Systems thinking reveals hidden connections in nature"`
- Social Studies: `"Perspective shapes how we interpret historical events"`
- Arts: `"Creative expression connects communities across cultures"`

**Essential Questions:**
- Science: `"How might our community adapt to changing climate patterns?"`
- Social Studies: `"How do different perspectives shape our understanding of the past?"`
- Arts: `"How can art bridge divides in our community?"`

**Challenges:**
- Science: `"Design a climate action toolkit for local community leaders"`
- Social Studies: `"Create a documentary for community members about local history"`
- Arts: `"Curate an exhibition for museum visitors celebrating cultural diversity"`

---

## Testing Checklist Template

**Date:** _____________
**Tester:** _____________
**Build/Commit:** _____________

- [ ] Flow 1: Complete wizard to dashboard (15 min)
- [ ] Flow 2: In-progress visibility (5 min)
- [ ] Flow 3: Empty projects hidden (3 min)
- [ ] Flow 4: Help requests work (5 min)
- [ ] Flow 5: Intent detection accurate (5 min)
- [ ] Flow 6: Suggestions system (3 min)
- [ ] Flow 7: Journey micro-flow (5 min)

**Total Time:** ~40 minutes for complete test suite

**Issues Found:**
_____________________________________________
_____________________________________________

**Notes:**
_____________________________________________
_____________________________________________

---

## Quick Smoke Test (5 minutes)

**For rapid testing after small changes:**

1. Start new project
2. Enter Big Idea: `"Systems thinking reveals connections"`
3. Type: `"yes"`
4. Verify advances to Essential Question
5. Check Dashboard shows project
6. Done!

**Pass Criteria:**
- ✅ No console errors
- ✅ Transitions work
- ✅ Dashboard shows project
- ✅ Data persists

---

## Regression Test (After Major Changes)

**Run ALL flows 1-7** to ensure nothing broke.

**Critical Paths:**
1. Intake → Chat → Completion → Dashboard
2. Help requests trigger AI assistance
3. Intent detection accuracy
4. Journey generation and acceptance
5. Provisional flag transitions correctly

---

**Last Updated:** 2025-10-01
**Version:** 1.0
**Maintainer:** Development Team
