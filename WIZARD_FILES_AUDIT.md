# Wizard Files Audit

**Date:** 2025-10-06
**Purpose:** Identify which wizard files are actively used vs old/unused

---

## ACTIVE FILES (Currently Used)

### Main Wizard Files
1. **`IntakeWizardMinimal.tsx`** ✅ ACTIVE
   - Route: `/app/new`
   - Imported in: `AuthenticatedApp.tsx` line 27
   - Rendered: Line 189
   - **This is the actual wizard users see**

2. **`WizardV3.tsx`** ✅ ACTIVE
   - Exported in: `index.ts`
   - Uses 3 steps:
     - `ProjectIntakeStep` (context)
     - `StandardsAlignmentStep` (standards)
     - `DesignStudioIntroStep` (handoff)

3. **`WizardV3Wrapper.tsx`** ✅ ACTIVE
   - Exported in: `index.ts`
   - Wraps WizardV3 with state management

### Active Step Files (3 total)
1. **`steps/ProjectIntakeStep.tsx`** ✅ ACTIVE
   - Lazy loaded by WizardV3 line 20
   - Used for 'context' step
   - **THIS IS THE FILE WITH THE REVIEW PAGE THAT NEEDS REDESIGN**

2. **`steps/StandardsAlignmentStep.tsx`** ✅ ACTIVE
   - Lazy loaded by WizardV3 line 21
   - Used for 'standards' step

3. **`steps/DesignStudioIntroStep.tsx`** ✅ ACTIVE
   - Lazy loaded by WizardV3 line 22
   - Used for 'handoff' step

### Support Files (Active)
- `types.ts` ✅ - Type definitions
- `wizardSchema.ts` ✅ - Schema definitions
- `wizardValidation.ts` ✅ - Validation logic
- `useWizardData.ts` ✅ - Custom hook
- `wizardExamples.ts` ✅ - Example data
- `index.ts` ✅ - Exports

---

## UNUSED FILES (Should be Archived)

### Unused Root Files (3 files)
1. ❌ **`ALFOnboarding.tsx`** - NOT imported anywhere
2. ❌ **`FlexibleSubjectInput.tsx`** - NOT imported anywhere
3. ❌ **`QuickSelectionTags.tsx`** - NOT imported anywhere

### Unused Step Files (Need to verify - likely 20+ files)
All these step files exist but are NOT used by WizardV3:

- `steps/AgeStep.tsx` ❓
- `steps/ALFIntroStep.tsx` ❓
- `steps/ArtifactsRubricsStep.tsx` ❓
- `steps/DifferentiationStep.tsx` ❓
- `steps/EnhancedSubjectStep.tsx` ❓
- `steps/EvidenceLogisticsStep.tsx` ❓
- `steps/ExhibitionStep.tsx` ❓
- `steps/GoalsEQStep.tsx` ❓
- `steps/ImprovedSubjectStep.tsx` ❓
- `steps/LocationStep.tsx` ❓
- `steps/MaterialsStep.tsx` ❓
- `steps/MotivationStep.tsx` ❓
- `steps/PhasesMilestonesStep.tsx` ❓
- `steps/ReviewExportStep.tsx` ❓
- `steps/ReviewStep.tsx` ❓
- `steps/ScopeStep.tsx` ❓
- `steps/StudentsStep.tsx` ❓
- `steps/SubjectScopeStep.tsx` ❓
- `steps/SubjectStep.tsx` ❓
- `steps/VisionStep.tsx` ❓

### Unused Component Files
- `components/ALFProcessCards.tsx` ❓
- `components/CardActionBar.tsx` ❓
- `components/DifferentiationOptionsStep.tsx` ❓
- `components/EnhancedSubjectSelector.tsx` ❓
- `components/InlineProcessGuide.tsx` ❓
- `components/IntelligentSubjectSelector.tsx` ❓
- `components/ProgressiveSubjectSelector.tsx` ❓
- `components/ProjectPreviewGenerator.tsx` ❓
- `components/StageRoadmapPreview.tsx` ❓
- `components/WhatHappensNext.tsx` ❓

---

## FILES TO WORK ON (The Actual Wizard)

### IntakeWizardMinimal.tsx
**Lines to modify for class context redesign:**
- Line ~259-307: Three-column grid for Age/Class Size/Duration
- **Action:** Convert to vertical stack with horizontal button grids

**Current Issues:**
- Uses three-column layout
- Requires scrolling (600-700px height)
- Class size field gets equal visual weight

**Target:**
- Single column vertical layout
- Horizontal button grids (2×2 or 4×1)
- <400px total height
- Progressive disclosure for optional class size

### ProjectIntakeStep.tsx
**Lines to modify for review page redesign:**
- The two-column layout that user complained about
- **Action:** Need to read this file to see current implementation

---

## NEXT STEPS

1. ✅ Confirmed IntakeWizardMinimal.tsx is the correct file
2. ✅ Confirmed ProjectIntakeStep.tsx is the correct file
3. ✅ Verified which step/component files are truly unused
4. ✅ Archive unused files to `src/features/wizard/legacy/`
   - **32 files archived** (20 steps + 9 components + 3 root files)
   - StageRoadmapPreview kept (actively used by IntakeWizardMinimal)
   - Build verified: ✅ SUCCESS
5. ⏳ Redesign IntakeWizardMinimal class context
6. ⏳ Redesign ProjectIntakeStep review page

---

## ARCHIVED FILES (32 total)

**Steps (20):** AgeStep, ALFIntroStep, ArtifactsRubricsStep, DifferentiationStep, EnhancedSubjectStep, EvidenceLogisticsStep, ExhibitionStep, GoalsEQStep, ImprovedSubjectStep, LocationStep, MaterialsStep, MotivationStep, PhasesMilestonesStep, ReviewExportStep, ReviewStep, ScopeStep, StudentsStep, SubjectScopeStep, SubjectStep, VisionStep

**Components (9):** ALFProcessCards, CardActionBar, DifferentiationOptionsStep, EnhancedSubjectSelector, InlineProcessGuide, IntelligentSubjectSelector, ProgressiveSubjectSelector, ProjectPreviewGenerator, WhatHappensNext

**Root (3):** ALFOnboarding, FlexibleSubjectInput, QuickSelectionTags

**Active Components (1):** StageRoadmapPreview (used by IntakeWizardMinimal line 428)

---

**Analysis by:** Claude Code
**Date:** 2025-10-06
**Updated:** 2025-10-06 (cleanup complete)
