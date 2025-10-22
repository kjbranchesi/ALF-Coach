# UX Expert Feedback: What to Do Next

## 🎉 Overall Assessment: 80% Great!

Your work is solid. The async pattern (template → AI) and specificity scoring are excellent foundations. However, we're approaching complexity creep. Here's what to focus on:

---

## ✅ **DO THIS** (High Priority)

### 1. Add Loading Indicators for AI Replacements (2 hours)
**Problem**: When AI refines journey/deliverables, content changes with no warning. Users don't know if something broke or improved.

**Solution**: Add visual feedback
```typescript
// Journey phase cards:
<div className="phase-card">
  {isRefining && <Badge>AI refining... ✨</Badge>}
  {wasRefined && <Badge>AI Enhanced ✓</Badge>}
  <h3>{phase.name}</h3>
  ...
</div>
```

**Files**:
- `src/features/chat-mvp/ChatMVP.tsx` (add `isRefiningJourney` state)
- `src/features/chat-mvp/components/JourneyBoard.tsx` (pass refinement status to cards)

---

### 2. Add Confirmation for "Save to Phase" (1 hour)
**Problem**: Users click "Save to phase" but get no feedback. Did it work? What changed?

**Solution**: Toast notification
```typescript
// After applying AI expand to phase:
toast.success("Applied teacher moves to Phase 2", {
  action: { label: "Undo", onClick: () => revertPhase(phaseId) }
});
```

**Files**:
- `src/features/chat-mvp/components/PhaseDetailExpander.tsx` (add toast after onApply)

---

### 3. Remove Auto-Dismiss from Kickoff Panel (30 minutes)
**Problem**: Panel auto-closes after 1.8 seconds. Users who read slowly or get distracted miss it.

**Solution**: Let users control dismissal
```typescript
// Remove this:
const t = window.setTimeout(() => {
  setShowKickoffPanel(false);
}, 1800);

// Keep manual close button only
```

**Files**:
- `src/features/chat-mvp/ChatMVP.tsx` (lines 586-600)

---

## ⛔ **DON'T BUILD THIS** (Feature Creep)

### 1. ❌ Print Rubric Button
**Why not**: Browser print (Cmd+P) already works. PDF export is explicitly NOT in MVP scope.

### 2. ❌ "Insert to materials" + "Insert to teacher moves" Separate Checkboxes
**Why not**: Too granular. "Apply all" is cleaner. Users can manually delete unwanted items after.

### 3. ❌ Convert to Strictly AI with Loading States (No Template Prefill)
**Why not**: Current hybrid approach is BETTER. Templates provide instant feedback. Just add loading indicators, don't remove templates.

### 4. ❌ "Narrative-only" Toggle Affecting Prompts More Aggressively
**Why not**: Users don't understand this control. If needed, move to profile settings (not debug page).

---

## 📋 **MEDIUM PRIORITY** (Can Wait for Phase B)

### 4. Consolidate Header Clutter (4 hours)
**Problem**: Header has 5 competing elements (Stage text, Specificity pill, Sync chip, Status indicator, Stepper). Cognitive overload.

**Solution**: Combine into one cohesive component
```
[Current]:
  Stage: Big Idea | Specificity 45 | Synced | [==========>] Big Idea > Essential Q > Challenge

[Better]:
  [==========>] Big Idea · Clarity 45% · Synced ✓
```

**Files**:
- `src/features/chat-mvp/ChatMVP.tsx` (lines 1781-1823)

---

### 5. Convert AI Expand Modal to Drawer (3 hours)
**Problem**: Modal blocks entire screen. Users can't reference the phase card they're expanding.

**Solution**: Right-side drawer (like Working Draft sidebar)
- Slides in from right
- User can still see journey board on left
- Consistent pattern with existing UI

**Files**:
- `src/features/chat-mvp/components/PhaseDetailExpander.tsx`

---

### 6. Move "Full Rubric" Toggle to Project Settings (1 hour)
**Problem**: Debug page is for developers, not users. Teachers won't find rubric controls there.

**Solution**: Move to a Settings panel or inline toggle in ReviewScreen
```
Review Screen
  └ Assignments & Rubrics
     ├ Show detailed rubrics: [✓]  ← Add this
     └ [Rubric table if enabled]
```

**Files**:
- `src/pages/DebugTelemetry.tsx` (remove toggle)
- `src/features/review/ReviewScreen.tsx` (add inline toggle)

---

## 🎯 **What to Tell Codex**

**Message:**

> "UX expert reviewed your work - 80% great! Focus on these 3 priorities:
>
> **P0 (Do Now):**
> 1. Add loading indicators when AI refines journey/deliverables (show "AI refining..." badge)
> 2. Add toast confirmation when "Save to phase" succeeds
> 3. Remove auto-dismiss from kickoff panel (let users close manually)
>
> **Don't Build:**
> - ❌ Print rubric button (browser print works)
> - ❌ Separate "insert to materials/moves" checkboxes (over-engineering)
> - ❌ Remove templates in favor of loading states (current hybrid is better)
> - ❌ Narrative-only aggressive prompt changes (confusing to users)
>
> After P0, we can discuss medium priority items (header consolidation, drawer pattern for AI expand)."

---

## 📊 Current State vs. MVP Goals

**What Codex Built:**
- ✅ Context preservation (Phase 1)
- ✅ AI-powered journey generation (Phase 2)
- ✅ AI-powered deliverables generation (Phase 2)
- ✅ Specificity scoring (Phase 3)
- ✅ Detailed rubrics (Phase 4)
- ✅ AI expand feature (Phase 4)
- ✅ Telemetry & admin controls (bonus)

**What's Left for MVP:**
- 🟡 Loading state transparency (P0)
- 🟡 Action confirmations (P0)
- 🟡 Remove auto-behaviors (P0)
- ⚪ Header consolidation (P1)
- ⚪ Drawer pattern (P1)

**MVP Status**: 95% complete. Just need the 3 P0 items for polish.

---

## 🚀 After These Changes

**User Experience:**
```
Before:
  [Journey card appears]
  ... 2 seconds later ...
  [Journey card content changes]
  User: "Wait, what just happened? 🤔"

After:
  [Journey card appears with "AI refining..." badge]
  ... 2 seconds later ...
  [Card updates with "AI Enhanced ✨" badge]
  User: "Oh cool, it got better! ✓"
```

**That's the polish needed.** Everything else can wait.

---

## ✅ Summary

**Keep doing:**
- Async pattern (template → AI)
- Specificity scoring
- Rubrics in review screen

**Polish with:**
- Loading indicators
- Confirmations
- Remove auto-behaviors

**Don't add:**
- Print features
- Over-granular controls
- Settings in debug page

**Result**: Clean, polished MVP ready for teachers.
