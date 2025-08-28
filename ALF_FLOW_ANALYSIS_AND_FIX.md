# ALF Coach Flow Analysis & Fix Plan

## Current Problem Summary

The ALF Coach application has a critical flow issue where after users complete the wizard and select a Big Idea in the chat interface, the system gets stuck in a loop showing "Working on Big Idea" and never progresses to Essential Question or Challenge.

## Complete User Journey (Current State)

### 1. **Wizard Phase** ✅ Working
- User enters context (subjects, grade level, duration)
- User sees ALF Process overview
- User clicks "Begin Project Design"
- Data is passed to chat interface

### 2. **Chat Interface - Ideation Stage** ❌ BROKEN
#### Current Flow:
1. System shows "Working on Big Idea" 
2. User inputs Big Idea text
3. System shows confirmation with Big Idea
4. User clicks "Continue"
5. **BUG**: System loops back to "Working on Big Idea" instead of progressing to Essential Question

#### Expected Flow:
1. System prompts for Big Idea
2. User inputs Big Idea
3. System confirms Big Idea
4. User clicks "Continue"
5. System saves Big Idea and moves to Essential Question prompt
6. User inputs Essential Question
7. System confirms Essential Question
8. User clicks "Continue"
9. System saves EQ and moves to Challenge prompt
10. Complete Ideation stage → Move to Journey stage

## Root Cause Analysis

### The Problem is in `chat-service.ts`:

1. **State Management Issue**: The `advanceToNext()` function properly increments `stepIndex` but the state isn't persisting correctly

2. **Phase Confusion**: The system has these phases:
   - `step_entry` - Asking for input
   - `step_confirm` - Confirming input
   - `stage_clarify` - Stage complete recap
   
   But after confirming Big Idea, it's not properly transitioning from step 0 (Big Idea) to step 1 (Essential Question)

3. **Missing State Persistence**: When `handleContinue()` is called after Big Idea confirmation:
   ```javascript
   // Line 503-530 in chat-service.ts
   if (this.state.phase === 'step_confirm' && this.state.pendingValue) {
     // Saves the value correctly
     this.state.capturedData[currentStep.key] = this.state.pendingValue;
     
     // But then advanceToNext() might not be updating the state properly
     await this.advanceToNext();
   }
   ```

4. **UI Not Reflecting State Changes**: The sidebar shows "Setup ✓, Ideation (in progress)" but doesn't show substep progress

## Data Storage Structure

```javascript
// Expected capturedData structure:
{
  // From Wizard
  "context.subject": "Art, Science",
  "context.ageGroup": "Middle School",
  "context.duration": "Semester",
  
  // Ideation Stage (should be captured but isn't progressing)
  "ideation.bigIdea": "How natural cycles shape our world",
  "ideation.essentialQuestion": "...", // Never reached
  "ideation.challenge": "..."           // Never reached
  
  // Journey Stage (not reached)
  "journey.phases": "...",
  "journey.activities": "...",
  "journey.resources": "..."
  
  // Deliverables Stage (not reached)
  "deliverables.milestones": "...",
  "deliverables.rubric": "...",
  "deliverables.impact": "..."
}
```

## Fix Implementation Plan

### 1. **Immediate Fix for Flow Progression**
```javascript
// In chat-service.ts, handleContinue() method around line 496

private async handleContinue(): Promise<void> {
  console.log('handleContinue - DETAILED DEBUG', {
    phase: this.state.phase,
    pendingValue: this.state.pendingValue,
    currentStep: this.getCurrentStep(),
    stepIndex: this.state.stepIndex,
    stage: this.state.stage,
    capturedData: this.state.capturedData
  });

  if (this.state.phase === 'step_confirm' && this.state.pendingValue) {
    const currentStep = this.getCurrentStep();
    if (currentStep) {
      // Save the value
      this.state.capturedData[currentStep.key] = this.state.pendingValue;
      
      // Log successful save
      console.log('Value saved successfully:', {
        key: currentStep.key,
        value: this.state.pendingValue,
        allCapturedData: this.state.capturedData
      });
      
      // Clear pending value BEFORE advancing
      this.state.pendingValue = null;
      
      // Update completed steps counter
      this.state.completedSteps++;
      
      // Emit state change to ensure UI updates
      this.emit('stateChange', this.getState());
      
      // Now advance to next step
      await this.advanceToNext();
    }
  }
}
```

### 2. **Fix advanceToNext() Method**
```javascript
// Around line 1043 in chat-service.ts

private async advanceToNext(): Promise<void> {
  const stageConfig = STAGE_CONFIG[this.state.stage];
  
  console.log('advanceToNext - BEFORE', {
    stage: this.state.stage,
    stepIndex: this.state.stepIndex,
    phase: this.state.phase,
    totalSteps: stageConfig.steps.length
  });
  
  if (this.state.stepIndex < stageConfig.steps.length - 1) {
    // Move to next step in current stage
    this.state.stepIndex++;
    this.state.phase = 'step_entry';
    
    const nextStep = stageConfig.steps[this.state.stepIndex];
    console.log('ADVANCING TO NEXT STEP:', {
      newIndex: this.state.stepIndex,
      stepId: nextStep.id,
      stepLabel: nextStep.label,
      stepKey: nextStep.key
    });
    
    // Add the step entry message for the new step
    await this.addStepEntryMessage();
    
    // Emit state change to update UI
    this.emit('stateChange', this.getState());
    
  } else {
    // Stage complete - move to stage clarify
    console.log('STAGE COMPLETE - Moving to clarify');
    this.state.phase = 'stage_clarify';
    await this.addStageClarifyMessage();
    this.emit('stateChange', this.getState());
  }
}
```

### 3. **Add Progress Tracking to Sidebar**
The sidebar should show:
```
✓ Setup
▶ Ideation (2/3)
  ✓ Big Idea
  → Essential Question (current)
  ○ Challenge
○ Journey
○ Deliverables
```

### 4. **Add Visual Flow Indicator**
Show the user where they are in the process:
```
[Big Idea] → [Essential Question] → [Challenge]
    ✓              (current)            pending
```

### 5. **Implement State Recovery**
Add ability to recover from stuck states:
```javascript
// Add to ChatService
public debugReset(): void {
  console.log('DEBUG: Resetting to last known good state');
  // Find last captured value and restart from next step
  const capturedKeys = Object.keys(this.state.capturedData);
  // Logic to determine correct stepIndex based on captured data
}
```

## Testing Checklist

- [ ] Wizard completes and passes data correctly
- [ ] Big Idea prompt appears
- [ ] Big Idea confirmation works
- [ ] Continue button advances to Essential Question
- [ ] Essential Question prompt appears
- [ ] Essential Question confirmation works
- [ ] Continue button advances to Challenge
- [ ] Challenge prompt appears
- [ ] Challenge confirmation works
- [ ] Stage clarify message appears after all 3 Ideation steps
- [ ] Journey stage begins properly
- [ ] All 9 steps complete in sequence
- [ ] Final blueprint is generated

## Quick Fix Priority

1. **CRITICAL**: Fix the `handleContinue()` → `advanceToNext()` flow
2. **HIGH**: Add better logging to track state changes
3. **MEDIUM**: Update UI to show current step clearly
4. **LOW**: Add debug tools for development

## Next Steps

1. Apply the fixes to `chat-service.ts`
2. Test the complete flow from wizard → ideation → journey → deliverables
3. Add progress indicators to the UI
4. Implement state persistence (localStorage or session storage)
5. Add error recovery mechanisms