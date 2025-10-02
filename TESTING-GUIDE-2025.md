# ALF Coach Testing Guide (2025 Edition)

**Purpose:** Complete testing protocol for the chat-first project creation flow with micro-flow enhancements.

**Last Updated:** January 2025
**Version:** 2.0 (Post Micro-Flow Implementation)

---

## 🧪 Pre-Test Setup

### Environment Setup
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Netlify functions (for AI)
netlify dev
```

**Note:** Chat requires Netlify functions for AI. Without it, you can still test navigation but not AI responses.

### Browser Setup
1. **Clear State:** Open DevTools Console → Run `localStorage.clear()`
2. **Start Fresh:** Navigate to `http://localhost:5173`
3. **Sign Out:** If logged in, sign out to test anonymous flow
4. **Monitor Console:** Keep DevTools open to catch errors

---

## 📋 Test Flow 1: Complete Project Creation (Happy Path)

**Duration:** ~20 minutes
**Purpose:** End-to-end validation of wizard → chat → completion → dashboard

### Part A: Intake Wizard

**Route:** Click "Start New Project" → `/app/new`

#### Step 1/3: Subject Selection
```
Actions:
- Select: Science
- Right-click → "Set as Primary"
- Click "Next"

Expected:
✅ Science badge shows "PRIMARY" label
✅ Next button enabled
✅ Advances to Step 2
```

#### Step 2/3: Class Context
```
Actions:
- Age Range: Middle School (6-8)
- Class Size: 24
- Duration: Multi-week Unit (3-6 weeks)
- Click "Next"

Expected:
✅ Form validation passes
✅ Advances to Step 3
✅ Review summary shows all selections
```

#### Step 3/3: Project Start
```
Actions:
- Project Name: "Community Climate Action"
- Big Idea: "Students investigate local climate impacts and design community solutions"
- Click "Start Building"

Expected:
✅ Navigates to /app/blueprint/bp_[timestamp]
✅ Chat interface loads
✅ AI greeting appears
✅ Console: "Created new blueprint ID: bp_..."
```

---

### Part B: Chat - Big Idea Stage

**Stage Indicator:** Should show "Stage 1/5: Big Idea"

#### Test 1: Help Request (Should NOT Capture)
```
Input: "can you help me with this?"

Expected Response:
✅ Provides examples of Big Ideas for Science
✅ Mentions systems thinking, cause-effect relationships
✅ Asks what concept students should carry forward
❌ Should NOT say "Perfect! I've captured that"

Result: Stage stays at Big Idea (no advancement)
```

#### Test 2: Suggestion Acceptance
```
Input: "yes" or "use that"

Expected Response:
✅ "Great! [Big Idea] gives students a powerful lens..."
✅ Coaching about Essential Questions appears
✅ Stage advances to Essential Question
✅ Working Draft sidebar shows Big Idea captured

Verify:
- [ ] Stage indicator: "Stage 2/5: Essential Question"
- [ ] Sidebar shows Big Idea with checkmark
- [ ] No console errors
```

---

### Part C: Chat - Essential Question Stage

#### Test: Direct Input
```
Input: "How might our community adapt to changing climate patterns?"

Expected Response:
✅ Acknowledges the question quality
✅ Provides coaching about the Challenge stage
✅ Explains what students will create
✅ Stage advances to Challenge

Verify:
- [ ] Essential Question captured in sidebar
- [ ] Stage indicator: "Stage 3/5: Challenge"
- [ ] Transition message appears
```

---

### Part D: Chat - Challenge Stage

#### Test: Challenge Definition
```
Input: "Design a climate action toolkit for local community leaders"

Expected Response:
✅ Confirms the challenge
✅ Explains next: Learning Journey mapping
✅ Mentions suggesting journey structure

Stage should advance to Journey
```

---

### Part E: Chat - Journey Stage (NEW MICRO-FLOW)

#### Test 1: Diagnostic Questions
```
Expected Automatic Display:
✅ AI asks diagnostic questions:
   - "Do your students have prior knowledge about [topic]?"
   - "Will they need research time or jump into creating?"
✅ Action chips appear:
   - "Suggest a journey"
   - "My students know the basics"
   - "They need research time"

Verify micro-flow UI:
- [ ] Action chips visible above input
- [ ] Chips are clickable
- [ ] Clear, conversational questions
```

#### Test 2a: Click Action Chip "Suggest a journey"
```
Action: Click "Suggest a journey" chip

Expected Response:
✅ Shows complete journey with 3-4 phases
✅ Each phase displays:
   - Phase name
   - Duration (e.g., "Weeks 1-2")
   - Summary paragraph
   - Key activities (2-3 bullets)
✅ New action chips appear:
   - "Yes, use this journey"
   - "Make it shorter"
   - "Different approach"

Verify journey display:
- [ ] Clear phase structure
- [ ] Activities aligned to phases
- [ ] Duration makes sense for "3-6 weeks" project
```

#### Test 2b: OR Answer Diagnostic Question
```
Input: "My students have some background but need time to research local impacts"

Expected Response:
✅ "Thanks! Based on your context, here's the first phase..."
✅ Shows Phase 1 of 4 with details
✅ Action chips:
   - "Yes, continue"
   - "Customize this phase"
   - "Show all phases"

This tests progressive disclosure - one phase at a time
```

#### Test 3: Journey Acceptance
```
Input: Click "Yes, use this journey" OR type "yes"

Expected Response:
✅ Captures all 3-4 phases
✅ Coaching: "Excellent! You've mapped X phases..."
✅ Explains deliverables are next
✅ Stage advances to Deliverables
✅ Sidebar shows journey structure:
   "4 phases mapped"
   "1. Phase Name → Activities"

Verify:
- [ ] All phases captured in sidebar
- [ ] Stage indicator: "Stage 5/5: Deliverables"
- [ ] Micro-flow state cleared (action chips gone)
```

---

### Part F: Chat - Deliverables Stage (NEW MICRO-FLOW)

#### Test 1: Diagnostic Questions (NEW!)
```
Expected Automatic Display:
✅ AI explains three deliverable types:
   📍 Milestones = Progress checkpoints
   🎯 Artifacts = Final products
   📊 Rubric Criteria = Assessment qualities
✅ Asks diagnostic questions:
   - "What matters most: process, quality, or impact?"
   - "One major artifact or multiple?"
   - "Detailed rubric or holistic?"
✅ Action chips:
   - "Suggest deliverables"
   - "Process matters most"
   - "Final quality matters most"

This matches Journey's approach!
```

#### Test 2: Request Suggestion
```
Input: Click "Suggest deliverables" OR type "suggest deliverables"

Expected Response:
✅ Shows complete deliverables structure:

   📍 Milestones (3-4 aligned to journey phases):
   1. Research synthesis complete
   2. Initial prototype reviewed
   3. Final toolkit ready for audience

   🎯 Final Artifacts (1-2 major):
   1. Climate Action Toolkit for community leaders
   2. Process documentation

   📊 Assessment Criteria (3-6):
   1. Evidence is credible and relevant
   2. Solutions are practical for community
   3. Student reflection shows growth

✅ Action chips:
   - "Yes, use all of these"
   - "Customize milestones"
   - "Customize artifacts"
```

#### Test 3: Sequential Review (Alternative Flow)
```
Input: Answer diagnostic question with substantive response
"Process is most important - I want to see their thinking evolve"

Expected Response:
✅ "Thanks for that context! Here are suggested milestones..."
✅ Shows ONLY milestones (3-4 items)
✅ Action chips:
   - "Yes, these work"
   - "Customize milestones"
   - "Show all at once"

Then user says "yes":
✅ Shows artifacts next
✅ Action chips for artifacts

Then user says "yes":
✅ Shows criteria
✅ Final acceptance

This tests sequential revelation!
```

#### Test 4: Deliverables Acceptance
```
Input: "Yes, finalize these" OR "use all of these"

Expected Response:
✅ 🎉 Completion celebration message
✅ "Your project is complete!"
✅ Lists what was created:
   - X milestones to track progress
   - X artifacts for students to create
   - X rubric criteria for assessment
✅ "View your complete project on the Dashboard"
✅ Console: "[ChatMVP] Project completed successfully"

Verify project save:
- [ ] localStorage updated (check Application tab)
- [ ] Project status: "ready"
- [ ] Stage: "COMPLETED"
- [ ] provisional: false
```

---

### Part G: Dashboard Verification

**Route:** Navigate to `/app/dashboard`

#### Expected Dashboard Display
```
✅ Project card appears with:

Header:
- Title: "Community Climate Action"
- Badge: "Ready" (emerald/green background)
- Subject icon: Science (in colored squircle)

Metadata:
- Subject: Science
- Grade: Middle School (6-8)
- Duration: Multi-week Unit (3-6 weeks)
- Description: AI-generated summary (1-2 sentences)
  Example: "Students investigate local climate impacts and design
  evidence-based solutions through a 4-phase project culminating in
  a community action toolkit."

Visual:
- Squircle shape with smooth corners
- Blue accent strip on left edge
- Hover: slight scale + shadow increase
- Updated: "Just now" timestamp

Verify:
- [ ] Description is NOT empty (this was the bug!)
- [ ] All metadata correct
- [ ] "Open" button present
- [ ] Card is clickable
```

#### Test: Open Completed Project
```
Action: Click "Open" on completed project card

Expected Behavior (NEW!):
✅ Routes to /app/project/[id]/preview (not /app/blueprint/[id])
✅ Loads ReviewScreen showcase view
✅ Shows complete project structure:
   - Hero section with title, subjects, grade
   - Overview panels (Big Idea, EQ, Challenge)
   - Run of Show (Journey phases)
   - Assignments (Deliverables)
   - Rubric

Note: This is the "showcase for completed projects" feature
```

---

## 📋 Test Flow 2: Micro-Flow Edge Cases

**Purpose:** Test new micro-flow interactions

### Test A: Cancel/Escape from Journey Flow

```
Scenario: Start journey, then cancel mid-flow

Steps:
1. Reach Journey stage
2. AI asks diagnostic questions
3. Type: "nevermind" OR "cancel" OR "start over"

Expected:
✅ Micro-flow resets
✅ Action chips disappear
✅ AI: "No problem! Let's approach this differently..."
✅ Can start fresh or provide direct input

This tests the escape hatch!
```

### Test B: Progressive Phase Review

```
Scenario: Review journey one phase at a time

Steps:
1. At Journey diagnostic questions, answer substantively
2. See Phase 1 of 4
3. Click "Yes, continue"
4. See Phase 2 of 4
5. Click "Customize this phase"

Expected:
✅ Each phase shown individually
✅ Clear progress indicator (Phase X of Y)
✅ Can accept, customize, or see all
✅ Customization opens editing (future feature)

This tests progressive disclosure!
```

### Test C: Show All vs Sequential

```
Scenario: Compare two flows

Flow 1 (Show All):
- Click "Suggest a journey" action chip
- See all 4 phases at once
- Accept or customize

Flow 2 (Sequential):
- Answer diagnostic question
- See phases one by one
- Progress through each

Expected:
✅ Both flows lead to same captured data
✅ User can choose their preference
✅ Action chips adapt to current substep
```

---

## 📋 Test Flow 3: Intent Detection

**Purpose:** Verify conversational input handling

### Test: Help Requests (Should NOT Capture)

```
At any stage, test these:

Input: "can you help me?"
Expected: ✅ Stage-specific guidance, ❌ No capture

Input: "any ideas?"
Expected: ✅ Multiple suggestions, ❌ No capture

Input: "what should I write here?"
Expected: ✅ Examples + coaching, ❌ No capture

Input: "I'm stuck"
Expected: ✅ Clarification questions, ❌ No capture
```

### Test: Acceptance Patterns (Should Capture)

```
These should capture/advance:

✅ "yes"
✅ "sure"
✅ "okay"
✅ "use that"
✅ "sounds good"
✅ "I like the first one"
✅ "perfect"

These should NOT capture:

❌ "yes but can you help me"
❌ "okay what should I write"
❌ "sure, any ideas?"
❌ "I'm not sure, any suggestions?"
```

### Test: Question Detection

```
Any input with question marks or question words should trigger help:

❌ "How can you help?"
❌ "What should I write?"
❌ "Can you give me examples?"

Expected: These get AI assistance, not captured as input
```

---

## 📋 Test Flow 4: In-Progress Projects

**Purpose:** Verify provisional flag handling

### Test A: Save Before Completion

```
Steps:
1. Start new project
2. Complete Big Idea stage only
3. Navigate to Dashboard

Expected:
✅ Project appears with:
   - Badge: "Draft" (gray)
   - Status: In progress
   - Title from Big Idea
✅ Can click "Open" to continue
✅ Chat history preserved

This tests provisional: false after meaningful content
```

### Test B: Empty Projects Hidden

```
Steps:
1. Navigate to /app/new
2. Fill Subject + Context
3. On Review step, click "Start Building" with empty name/idea
4. Navigate to Dashboard immediately

Expected:
✅ Empty project does NOT appear (provisional: true)
✅ Dashboard shows "No projects" if no others
```

---

## 📋 Test Flow 5: Working Draft Sidebar

**Purpose:** Verify real-time progress tracking

### Test: Sidebar Updates

```
At each stage, verify sidebar shows:

After Big Idea:
✅ Big Idea: "Systems thinking..." (preview)
✅ Status: Complete (green checkmark)

After Essential Question:
✅ Essential Question: "How might..." (preview)
✅ Status: Complete

After Challenge:
✅ Challenge: "Design a..." (preview)

After Journey:
✅ Learning Journey: "4 phases mapped"
✅ Details: "1. Phase Name → Activities"
   Shows first 3 phases with 2 activities each

After Deliverables:
✅ Deliverables: "3 milestones, 2 artifacts"
✅ Details:
   📍 Milestone names
   🎯 Artifact names
   (Shows first 4 total)

Progress Bar:
✅ Updates from 0% → 20% → 40% → 60% → 80% → 100%
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Chat Input Disabled
```
Symptom: Can't type in chat input field
Cause: AIStatus !== 'online'

Solution:
- Ensure Netlify dev is running
- Check /.netlify/functions/gemini responds
- Or: Stub the function for offline testing
```

### Issue 2: Projects Not on Dashboard
```
Symptom: Completed project doesn't appear
Cause: provisional: true or empty content

Check:
- localStorage → ALF_PROJECT_INDEX
- Look for project ID
- Verify provisional: false
- Verify status: 'ready'
```

### Issue 3: Description Empty on Card
```
Symptom: Dashboard card shows no description
Cause: Index wasn't including description field

Fix Applied: ✅ description now in index
If still empty: Clear localStorage and re-complete project
```

### Issue 4: Action Chips Not Clearing
```
Symptom: Action chips stick after clicking
Cause: State not cleared properly

Verify:
- microFlowActionChips state
- Should clear after user clicks
- Should clear on stage transition
```

### Issue 5: Micro-Flow Loops
```
Symptom: Journey/Deliverables keeps re-asking same question
Cause: Substep not advancing

Check console for:
- [Journey] action type
- Updated substep value
- Should see progression through substeps
```

---

## 🎯 Quick Smoke Test (5 min)

**For rapid validation after small changes:**

```
1. Clear localStorage
2. Start new project (any subject)
3. Big Idea: "Systems thinking reveals connections"
4. Type: "yes"
5. Essential Question: "How are things connected?"
6. Type: "yes"
7. Challenge: "Design a systems map"
8. Type: "yes"
9. Journey: Click "Suggest a journey"
10. Type: "yes"
11. Deliverables: Click "Suggest deliverables"
12. Type: "yes"
13. Check Dashboard

Pass Criteria:
✅ No console errors
✅ All stages transition
✅ Dashboard shows "Ready" project
✅ Description visible on card
✅ Can open project to preview
```

---

## 📊 Regression Test Checklist

**Run after major changes:**

- [ ] Flow 1: Complete creation (20 min)
- [ ] Flow 2: Micro-flow edge cases (10 min)
- [ ] Flow 3: Intent detection (5 min)
- [ ] Flow 4: In-progress projects (5 min)
- [ ] Flow 5: Sidebar updates (5 min)

**Total:** ~45 minutes for comprehensive validation

---

## 🐛 Red Flags (Stop Testing, Fix Immediately)

1. **Console errors** - Especially TypeScript or Firebase
2. **Chat freezes** - Input doesn't respond
3. **"Perfect! I've captured that"** on help requests
4. **Projects disappear** from dashboard
5. **Stage doesn't advance** after valid acceptance
6. **Micro-flow loops** - Same question repeats
7. **Description always empty** on completed projects

---

## ✅ Expected Behavior Summary

### Journey Micro-Flow:
- Asks diagnostic questions first
- Offers "show all" OR "progressive review"
- Shows clear action chips
- Can cancel anytime
- Captures all phases on acceptance

### Deliverables Micro-Flow:
- Explains three component types
- Asks assessment philosophy questions
- Offers "show all" OR "sequential review"
- Shows milestones → artifacts → criteria
- Clear action chips at each step

### Dashboard:
- Shows projects immediately after content
- "Draft" badge for in-progress
- "Ready" badge for completed
- Description visible on all cards
- Correct metadata (subject, grade, duration)

### Showcase View:
- Completed projects route to preview
- Shows all captured data beautifully
- Read-only formatted display
- Matches sample project layout

---

## 📝 Test Report Template

```
Date: _____________
Tester: _____________
Build/Commit: _____________

PASSED:
✅ Flow 1: Complete creation
✅ Micro-flows functional
✅ Dashboard correct
✅ Description shows

FAILED:
❌ [Issue description]
   Expected: ...
   Actual: ...
   Console: ...

NOTES:
_______________________________________
```

---

## 🔍 Debugging Tips

### Check localStorage:
```javascript
// View project index
JSON.parse(localStorage.getItem('ALF_PROJECT_INDEX'))

// View specific project
JSON.parse(localStorage.getItem('ALF_PROJECT_bp_...'))

// Clear everything
localStorage.clear()
```

### Check micro-flow state:
```javascript
// In ChatMVP component, add console.logs:
console.log('[Journey State]', journeyMicroState);
console.log('[Deliverables State]', deliverablesMicroState);
console.log('[Action Chips]', microFlowActionChips);
```

### Check AI status:
```javascript
// Should be 'online' for chat to work
// Look in AIStatus component
```

---

**Testing Mantras:**
1. **Clear state before each test** - `localStorage.clear()`
2. **Watch the console** - Errors appear there first
3. **Test both flows** - "Show all" AND "Progressive"
4. **Verify sidebar** - Real-time feedback indicator
5. **Check dashboard** - Final validation step

**Happy Testing! 🎉**
