# New Architecture Testing Checklist

Test the new architecture at: **http://localhost:5173/new**

## Phase 1: Basic Functionality ✅

### Wizard Stage
- [ ] Grade level selection works
- [ ] Subject selection works  
- [ ] Duration selection works
- [ ] ALF focus selection works
- [ ] Wizard completes and transitions to Ideation

### Ideation Stage (3 steps)
- [ ] Step 1: Big Idea prompt appears
- [ ] Can type and submit response
- [ ] Quick reply chips work (Ideas/What-If/Help)
- [ ] Step 2: Essential Question prompt appears
- [ ] Step 3: Challenge prompt appears
- [ ] Stage Clarifier shows summary
- [ ] Can Continue to Journey stage

### Journey Stage (3 steps)
- [ ] Step 1: Hook/Engagement prompt
- [ ] Step 2: Activities prompt
- [ ] Step 3: Reflection prompt
- [ ] Stage Clarifier works
- [ ] Can Continue to Deliverables

### Deliverables Stage (3 steps)
- [ ] Step 1: Products prompt
- [ ] Step 2: Assessment prompt  
- [ ] Step 3: Timeline prompt
- [ ] Stage Clarifier works
- [ ] Can Complete project

### Completion
- [ ] Success screen appears
- [ ] Export button works
- [ ] Blueprint JSON downloads

## Phase 2: UI/UX Verification

### Visual Elements
- [ ] ALF branding shows (not ProjectCraft)
- [ ] Progress bar updates correctly
- [ ] No "step 10 of 9" errors
- [ ] Proper button states
- [ ] Good contrast (no black on blue)

### Chat Behavior
- [ ] No infinite scroll on load
- [ ] Input never randomly disables
- [ ] Messages appear instantly
- [ ] Scroll to bottom works
- [ ] Quick replies disappear after use

### AI Integration
- [ ] Gemini API calls work (if key set)
- [ ] Demo mode works without key
- [ ] Suggestions are contextual
- [ ] No repetitive language
- [ ] Natural responses

## Phase 3: Error Handling

### Edge Cases
- [ ] Long text input (>250 chars)
- [ ] Rapid clicking doesn't break flow
- [ ] Back button behavior
- [ ] Refresh maintains state
- [ ] Network errors handled gracefully

## Issues Found

Document any issues here:

1. Issue: 
   - Description:
   - Steps to reproduce:
   - Expected vs Actual:

2. Issue:
   - Description:
   - Steps to reproduce:
   - Expected vs Actual:

## Debug Panel Info

The debug panel (bottom right) shows:
- Current stage and step
- Progress (X/3)
- Can advance status
- Allowed actions
- Message count

Use this to verify state transitions.