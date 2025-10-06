# PROJECT SHOWCASE REDESIGN - COMPREHENSIVE IMPLEMENTATION GUIDE FOR CODEX

**Date:** 2025-10-06
**Project:** ALF-Coach Project Showcase Interface Redesign
**Target:** 30 PBL projects in showcaseV2 format
**Constraint:** Work within existing schema - NO data structure changes

---

## EXECUTIVE SUMMARY

This guide provides step-by-step instructions for redesigning the project showcase interface to address three core problems:

1. **Shallow visual hierarchy** - Run of show and assignments lack visual distinction and scannability
2. **Hidden assignments** - Currently buried in accordion elements, disconnected from timeline
3. **Missing pedagogical depth** - Content feels thin; teachers can't visualize implementation

**Key Constraint:** User requires NO changes to data collection framework. All improvements must work within the EXISTING schema defined in `src/types/showcaseV2.ts`.

**Additional cleanup required:**
- Remove `materialsPrep.safetyEthics` from all 30 projects
- Evaluate and improve `planningNotes` (currently minimal but contain useful coordination info)
- Clarify purpose of `polish` field (contains microRubric, checkpoints, tags)

---

## PHASE 1: SCHEMA CLEANUP & UNDERSTANDING

### 1.1 Current Schema Analysis

**Core interfaces (DO NOT MODIFY):**
```typescript
ProjectShowcaseV2 {
  hero, microOverview, fullOverview, schedule
  runOfShow: WeekCard[]
  outcomes, materialsPrep, assignments: AssignmentCard[]
  polish?, planningNotes?
}

WeekCard {
  weekLabel, kind, focus
  teacher[], students[], deliverables[]
  checkpoint?, assignments[], repeatable?
}

AssignmentCard {
  id, title, summary
  studentDirections[], teacherSetup[], evidence[], successCriteria[]
  checkpoint?, aiOptional?, safety?
}
```

### 1.2 Field Purpose Clarification

**polish.microRubric** - Quality criteria for final project work (4-6 bullets)
- Purpose: Helps teachers evaluate student work quality
- UI Treatment: Display prominently in outcomes/polish section
- Keep as-is, enhance visibility

**polish.checkpoints** - Major quality gates across the project
- Purpose: High-level milestones (duplicates some week-level checkpoints)
- UI Treatment: Could create project-wide checkpoint timeline
- Keep as-is, may deduplicate in future

**polish.tags** - Category codes for filtering/search
- Purpose: Probably for future gallery filtering (e.g., 'SUST', 'DATA', 'COMM')
- UI Treatment: Hidden from main view, used for search/filter
- Keep as-is

**planningNotes** - Logistical coordination guidance
- Current state: 1-2 sentences, useful but minimal
- Examples: "Align with agency partner early; set strict privacy; ensure human escalation"
- Decision: **IMPROVE, not remove** - These contain critical coordination info
- Action: Enrich to 2-3 sentences, make more visible in UI

**materialsPrep.safetyEthics** - Safety protocols and ethical considerations
- Decision: **REMOVE from all 30 projects** per user requirement
- Action: Delete this field entirely from schema and all project files

### 1.3 Schema Changes Required

**Type Definition Update** (`src/types/showcaseV2.ts`):

```typescript
export interface ProjectShowcaseV2 {
  // ... existing fields ...
  materialsPrep: {
    coreKit: string[]; // ≤ 8
    noTechFallback: string[]; // ≤ 3
    // REMOVED: safetyEthics: string[];
  };
  // ... rest unchanged ...
}
```

**Validation Script Update** (`scripts/enrichment-lint.ts` or similar):
- Remove safetyEthics checks
- Add planningNotes enhancement checks
- Validate that all 30 projects have improved planningNotes

---

## PHASE 2: DATA CLEANUP (ALL 30 PROJECTS)

### 2.1 Remove safetyEthics Field

**Script to create:**
```bash
# scripts/remove-safety-ethics.sh
#!/bin/bash

for file in src/data/showcaseV2/*.ts; do
  # Remove safetyEthics array and preceding comma
  sed -i '' '/safetyEthics:/,/\]/d' "$file"

  # Clean up any double commas or trailing commas
  sed -i '' 's/,,/,/g' "$file"
  sed -i '' 's/,\s*}/}/g' "$file"

  echo "Cleaned $file"
done

echo "Removed safetyEthics from all 30 projects"
```

**Manual verification checklist:**
- [ ] All 30 files no longer contain `safetyEthics`
- [ ] TypeScript compilation succeeds
- [ ] No syntax errors (trailing commas, etc.)

### 2.2 Improve planningNotes

**Current examples:**
- ✅ Good: "Align with agency partner early; set strict privacy; ensure human escalation for sensitive questions."
- ✅ Good: "Monitor daily heat index and adjust fieldwork blocks; secure city permits for sidewalk demos early."
- ❌ Minimal: "Loop in district facilities early so students can access meters and schedules without delays."

**Enhancement template:**
```
[Critical partnership/coordination step]; [key logistical preparation]; [common pitfall to avoid or timing note].
```

**Action items:**
1. Review all 30 planningNotes
2. Expand minimal ones to 2-3 actionable sentences
3. Focus on: partnership coordination, material prep timing, common logistical failures
4. Keep under 200 chars total

**Example before/after:**

BEFORE:
```typescript
planningNotes: 'Loop in district facilities early.'
```

AFTER:
```typescript
planningNotes: 'Coordinate with facilities 3+ weeks early to secure meter access and audit schedules. Confirm data-sharing agreements before Week 2. Common delay: waiting for utility bill access—request proactively.'
```

### 2.3 Data Cleanup Validation

**Script to run after cleanup:**
```bash
npm run lint
npm run build
npm run test:showcase-data
```

**Manual checks:**
- [ ] All 30 projects compile without errors
- [ ] No references to safetyEthics remain
- [ ] planningNotes are substantive (>100 chars each)
- [ ] Visual inspection of 5 random projects

---

## PHASE 3: UI/UX REDESIGN

### 3.1 Component Architecture

**Current monolithic structure:**
```
ProjectShowcasePage.tsx (287 lines)
  ├─ Hero section
  ├─ Overview cards
  ├─ Run of Show (inline, 86-124)
  ├─ Assignments (details/summary accordion, 126-162)
  └─ Outcomes/Materials sections
```

**New modular structure:**
```
ProjectShowcasePage.tsx (orchestrator)
├─ components/
│   ├─ RunOfShowCard.tsx ⭐ NEW
│   ├─ RunOfShowTimeline.tsx ⭐ NEW (optional future)
│   ├─ AssignmentCard.tsx ⭐ NEW
│   ├─ AssignmentPanel.tsx ⭐ NEW
│   ├─ PhaseBeadge.tsx ⭐ NEW
│   ├─ CheckpointAlert.tsx ⭐ NEW
│   └─ PlanningNotesCard.tsx ⭐ NEW
└─ utils/
    ├─ phaseColors.ts ⭐ NEW
    ├─ scrollToElement.ts ⭐ NEW
    └─ weekAssignmentMap.ts ⭐ NEW
```

### 3.2 Phase Color System

**Create:** `src/features/showcase/utils/phaseColors.ts`

```typescript
import { PhaseKind } from '../../../types/showcaseV2';

export const PHASE_COLORS: Record<PhaseKind, string> = {
  Foundations: '#3b82f6',    // blue-500
  Planning: '#8b5cf6',       // violet-500
  FieldworkLoop: '#10b981',  // emerald-500
  Build: '#f59e0b',          // amber-500
  Exhibit: '#ec4899',        // pink-500
  Extension: '#06b6d4',      // cyan-500
};

export const PHASE_ICONS: Record<PhaseKind, string> = {
  Foundations: '🏗️',
  Planning: '📋',
  FieldworkLoop: '🔄',
  Build: '🔨',
  Exhibit: '🎨',
  Extension: '🚀',
};

export const getPhaseColor = (kind: PhaseKind): string => {
  return PHASE_COLORS[kind] || '#64748b';
};

export const getPhaseIcon = (kind: PhaseKind): string => {
  return PHASE_ICONS[kind] || '📌';
};

// Color with opacity for backgrounds
export const getPhaseColorWithOpacity = (kind: PhaseKind, opacity: number): string => {
  const hex = PHASE_COLORS[kind] || '#64748b';
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
};
```

### 3.3 Assignment Color System

**Add to:** `src/features/showcase/utils/phaseColors.ts`

```typescript
export const ASSIGNMENT_COLORS: Record<string, string> = {
  A: '#3b82f6',  // blue-500
  B: '#8b5cf6',  // violet-500
  C: '#10b981',  // emerald-500
  D: '#f59e0b',  // amber-500
  E: '#ec4899',  // pink-500
  F: '#06b6d4',  // cyan-500
};

export const getAssignmentColor = (id: string): string => {
  return ASSIGNMENT_COLORS[id[0]] || '#64748b';
};
```

### 3.4 RunOfShowCard Component

**Create:** `src/features/showcase/components/RunOfShowCard.tsx`

```typescript
import React from 'react';
import type { WeekCard } from '../../../types/showcaseV2';
import { getPhaseColor, getPhaseIcon } from '../utils/phaseColors';
import PhaseBeadge from './PhaseBeadge';
import CheckpointAlert from './CheckpointAlert';

interface RunOfShowCardProps {
  card: WeekCard;
  onAssignmentClick: (assignmentId: string) => void;
}

export default function RunOfShowCard({ card, onAssignmentClick }: RunOfShowCardProps) {
  const phaseColor = getPhaseColor(card.kind);
  const phaseIcon = getPhaseIcon(card.kind);

  return (
    <div
      className="group relative squircle-pure border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden"
    >
      {/* Phase color accent - left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: phaseColor }}
      />

      {/* Repeatable indicator */}
      {card.repeatable && (
        <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Repeatable</span>
        </div>
      )}

      {/* Card content */}
      <div className="pl-6 pr-5 py-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {card.weekLabel}
              </h3>
              <PhaseBeadge kind={card.kind} />
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {card.focus}
            </p>
          </div>
        </div>

        {/* Assignment badges */}
        {card.assignments && card.assignments.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
              This week's assignments
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {card.assignments.map((assignmentId) => (
                <button
                  key={assignmentId}
                  onClick={() => onAssignmentClick(assignmentId)}
                  className="group/assignment inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200/60 dark:border-primary-700/60 text-primary-700 dark:text-primary-300 text-sm font-semibold cursor-pointer hover:from-primary-100 hover:to-primary-200/70 dark:hover:from-primary-800/40 dark:hover:to-primary-700/30 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200"
                  aria-label={`Jump to assignment ${assignmentId}`}
                >
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover/assignment:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {assignmentId}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Key deliverables */}
        <div className="space-y-2 py-4">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Deliverables
          </div>
          <div className="space-y-2">
            {card.deliverables.map((deliverable, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{deliverable}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher/Student grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* Teacher column */}
          <div className="space-y-2.5 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/40 dark:border-blue-800/40">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              Teacher
            </div>
            <div className="space-y-2">
              {card.teacher.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm leading-snug text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-blue-400 dark:bg-blue-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Students column */}
          <div className="space-y-2.5 p-4 rounded-xl bg-gradient-to-br from-violet-50/50 to-violet-100/30 dark:from-violet-950/20 dark:to-violet-900/10 border border-violet-200/40 dark:border-violet-800/40">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-violet-700 dark:text-violet-400 mb-3">
              <div className="w-5 h-5 rounded-md bg-violet-200/50 dark:bg-violet-800/50 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              Students
            </div>
            <div className="space-y-2">
              {card.students.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm leading-snug text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-violet-400 dark:bg-violet-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checkpoint */}
        {card.checkpoint && card.checkpoint.length > 0 && (
          <CheckpointAlert checkpoints={card.checkpoint} />
        )}
      </div>
    </div>
  );
}
```

### 3.5 PhaseBeadge Component

**Create:** `src/features/showcase/components/PhaseBeadge.tsx`

```typescript
import React from 'react';
import type { PhaseKind } from '../../../types/showcaseV2';
import { getPhaseColor, getPhaseIcon } from '../utils/phaseColors';

interface PhaseBeadgeProps {
  kind: PhaseKind;
}

export default function PhaseBeadge({ kind }: PhaseBeadgeProps) {
  const phaseColor = getPhaseColor(kind);
  const phaseIcon = getPhaseIcon(kind);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors duration-200"
      style={{
        backgroundColor: `${phaseColor}26`, // 15% opacity
        color: phaseColor,
        border: `1.5px solid ${phaseColor}66`, // 40% opacity
      }}
      aria-label={`Phase: ${kind}`}
    >
      <span role="img" aria-hidden="true">{phaseIcon}</span>
      {kind}
    </span>
  );
}
```

### 3.6 CheckpointAlert Component

**Create:** `src/features/showcase/components/CheckpointAlert.tsx`

```typescript
import React from 'react';

interface CheckpointAlertProps {
  checkpoints: string[];
}

export default function CheckpointAlert({ checkpoints }: CheckpointAlertProps) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-300/60 dark:border-amber-700/60 mt-4"
      role="alert"
      aria-label="Quality checkpoint"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-200/70 dark:bg-amber-800/50 flex items-center justify-center">
        <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300">
          Quality Checkpoint
        </div>
        <div className="space-y-1">
          {checkpoints.map((checkpoint, idx) => (
            <div key={idx} className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-snug">
              {checkpoint}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3.7 AssignmentCard Component (Detailed)

**Create:** `src/features/showcase/components/AssignmentCard.tsx`

```typescript
import React, { useState } from 'react';
import type { AssignmentCard as AssignmentCardType, WeekCard } from '../../../types/showcaseV2';
import { getAssignmentColor } from '../utils/phaseColors';

interface AssignmentCardProps {
  assignment: AssignmentCardType;
  weeksUsedIn: string[]; // e.g., ["Week 1", "Weeks 3-4"]
}

export default function AssignmentCard({ assignment, weeksUsedIn }: AssignmentCardProps) {
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const assignmentColor = getAssignmentColor(assignment.id);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const isStudentExpanded = expandedSections.studentDirections;
  const isTeacherExpanded = expandedSections.teacherSetup;

  return (
    <div
      className="group relative squircle-card border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.1)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.15)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden scroll-mt-24"
      id={`assignment-${assignment.id}`}
    >
      {/* Color accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: assignmentColor }}
      />

      {/* Card content */}
      <div className="p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="space-y-3 pb-5 border-b border-slate-200/70 dark:border-slate-700/70">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span
                className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-bold tracking-wide shadow-sm"
              >
                {assignment.id}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                {assignment.title}
              </h3>
            </div>
            {assignment.aiOptional && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/30 border border-purple-300/60 dark:border-purple-600/60 text-purple-800 dark:text-purple-300 text-xs font-semibold tracking-wide">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>AI Optional</span>
              </div>
            )}
          </div>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {assignment.summary}
          </p>
          {weeksUsedIn.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Used in:
              </span>
              {weeksUsedIn.map((week) => (
                <span
                  key={week}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-100/70 dark:bg-primary-900/30 border border-primary-300/50 dark:border-primary-700/50 text-primary-800 dark:text-primary-300 text-xs font-semibold"
                >
                  {week}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Success Criteria (Most Prominent) */}
        <div className="space-y-3 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10 border-2 border-emerald-300/50 dark:border-emerald-700/50">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-200/70 dark:bg-emerald-800/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300">
              Learning Goals (Success Criteria)
            </h4>
          </div>
          <div className="space-y-2.5">
            {assignment.successCriteria.map((criterion, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-md bg-emerald-200/70 dark:bg-emerald-800/40 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-emerald-900 dark:text-emerald-100 leading-snug">
                  {criterion}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Student/Teacher Directions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Student Directions */}
          <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-violet-50/60 to-purple-50/40 dark:from-violet-950/25 dark:to-purple-950/15 border border-violet-200/50 dark:border-violet-800/50">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-violet-200/60 dark:border-violet-700/60">
              <div className="w-6 h-6 rounded-md bg-violet-200/60 dark:bg-violet-800/50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-violet-700 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-violet-800 dark:text-violet-300">
                For Students
              </h4>
            </div>
            <div className="space-y-2.5">
              {assignment.studentDirections.slice(0, isStudentExpanded ? undefined : 3).map((direction, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm leading-snug">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-violet-200/70 dark:bg-violet-800/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-800 dark:text-violet-300">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{direction}</span>
                </div>
              ))}
              {assignment.studentDirections.length > 3 && (
                <button
                  onClick={() => toggleSection('studentDirections')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-100/50 dark:hover:bg-violet-900/30 transition-colors duration-200"
                  aria-expanded={isStudentExpanded}
                  aria-controls="student-directions-full"
                >
                  <span>{isStudentExpanded ? '− Show less' : `+ ${assignment.studentDirections.length - 3} more steps`}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isStudentExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Teacher Setup */}
          <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/25 dark:to-indigo-950/15 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-blue-200/60 dark:border-blue-700/60">
              <div className="w-6 h-6 rounded-md bg-blue-200/60 dark:bg-blue-800/50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-blue-800 dark:text-blue-300">
                For Teachers
              </h4>
            </div>
            <div className="space-y-2.5">
              {assignment.teacherSetup.slice(0, isTeacherExpanded ? undefined : 3).map((setup, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm leading-snug">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-200/70 dark:bg-blue-800/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{setup}</span>
                </div>
              ))}
              {assignment.teacherSetup.length > 3 && (
                <button
                  onClick={() => toggleSection('teacherSetup')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                  aria-expanded={isTeacherExpanded}
                  aria-controls="teacher-setup-full"
                >
                  <span>{isTeacherExpanded ? '− Show less' : `+ ${assignment.teacherSetup.length - 3} more steps`}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isTeacherExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Evidence Section */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-slate-200/70 dark:bg-slate-700/50 flex items-center justify-center">
              <svg className="w-3 h-3 text-slate-700 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-400">
              Evidence of Learning
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignment.evidence.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* AI Optional Details (Collapsible) */}
        {assignment.aiOptional && (
          <div className="space-y-2">
            <button
              onClick={() => setShowAIDetails(!showAIDetails)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/15 border border-purple-200/60 dark:border-purple-700/60 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/25 transition-colors duration-200 group/ai"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                  AI Integration Options
                </span>
              </div>
              <svg className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform ${showAIDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAIDetails && (
              <div className="space-y-3 px-4 py-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200/40 dark:border-purple-800/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
                      Tool Use
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {assignment.aiOptional.toolUse}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
                      Critique
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {assignment.aiOptional.critique}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
                      No AI Alternative
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {assignment.aiOptional.noAIAlt}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checkpoint */}
        {assignment.checkpoint && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-700/60">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-200/70 dark:bg-amber-800/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 mb-1">
                Checkpoint
              </div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-snug">
                {assignment.checkpoint}
              </p>
            </div>
          </div>
        )}

        {/* Safety Notes */}
        {assignment.safety && assignment.safety.length > 0 && (
          <div className="space-y-2 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-300/60 dark:border-red-700/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-red-200/70 dark:bg-red-800/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-700 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-red-800 dark:text-red-300">
                Safety & Considerations
              </h4>
            </div>
            <ul className="space-y-1">
              {assignment.safety.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-red-500 dark:bg-red-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3.8 PlanningNotesCard Component

**Create:** `src/features/showcase/components/PlanningNotesCard.tsx`

```typescript
import React from 'react';

interface PlanningNotesCardProps {
  notes: string;
}

export default function PlanningNotesCard({ notes }: PlanningNotesCardProps) {
  return (
    <div className="squircle-pure border border-amber-200/70 dark:border-amber-700/70 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/15 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-200/70 dark:bg-amber-800/50 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 mb-2">
            Planning & Coordination Notes
          </h3>
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            {notes}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 3.9 Main Page Integration

**Update:** `src/features/showcase/ProjectShowcasePage.tsx`

Replace lines 86-162 (Run of Show and Assignments sections) with:

```typescript
import RunOfShowCard from './components/RunOfShowCard';
import AssignmentCard from './components/AssignmentCard';
import PlanningNotesCard from './components/PlanningNotesCard';

// Inside the component:
const scrollToAssignment = (assignmentId: string) => {
  const element = document.getElementById(`assignment-${assignmentId}`);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Visual highlight
  element.classList.add('ring-2', 'ring-primary-500', 'ring-offset-4', 'dark:ring-offset-slate-900');
  setTimeout(() => {
    element.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-4', 'dark:ring-offset-slate-900');
  }, 2000);
};

// Calculate which weeks use which assignments
const getWeeksForAssignment = (assignmentId: string) => {
  return runOfShow
    .filter(week => week.assignments?.includes(assignmentId))
    .map(week => week.weekLabel);
};

// In the JSX:

{/* Planning Notes - NEW, before Run of Show */}
{planningNotes && (
  <section className="mb-10">
    <PlanningNotesCard notes={planningNotes} />
  </section>
)}

<section className="mb-10 space-y-4">
  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Run of show</h2>
  <div className="space-y-3">
    {runOfShow.map((card, index) => (
      <RunOfShowCard
        key={card.weekLabel + index}
        card={card}
        onAssignmentClick={scrollToAssignment}
      />
    ))}
  </div>
</section>

<section className="mb-10 space-y-4">
  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Assignments</h2>
  <div className="space-y-4">
    {assignments.map((assignment) => (
      <AssignmentCard
        key={assignment.id}
        assignment={assignment}
        weeksUsedIn={getWeeksForAssignment(assignment.id)}
      />
    ))}
  </div>
</section>
```

---

## PHASE 4: CONTENT ENRICHMENT STRATEGY

### 4.1 Working Within Existing Field Constraints

**Goal:** Make existing content fields richer WITHOUT adding new schema fields.

**Fields to enrich:**

1. **WeekCard.focus** (currently ≤90 chars)
   - Add pedagogical "why" when possible
   - Example: "Design audit plan and coordinate data access." → "Design audit plan and coordinate data access to build measurement skills before fieldwork."

2. **WeekCard.teacher** and **WeekCard.students** bullets
   - Add outcome connections where natural
   - Be more specific about cognitive work
   - Example: "Analyze findings" → "Analyze findings to identify highest-leverage sustainability interventions"

3. **AssignmentCard.summary** (currently ≤25 words)
   - Clarify pedagogical purpose
   - Example: "Teams build rigorous audit plans." → "Teams build rigorous audit plans developing measurement skills for evidence-based interventions."

4. **AssignmentCard.successCriteria** (kid-friendly, ≤8 words)
   - Already good! Keep student voice ("I can...")
   - Ensure they connect to outcomes where possible

5. **planningNotes** - EXPAND from 1 sentence to 2-3
   - Add: partnership timing, material prep, common pitfalls
   - Example: "Align with agency partner early." → "Coordinate with agency partner 2+ weeks before Week 1 to finalize FAQ scope and privacy protocols. Secure plain-language checklist and testing scripts. Common delay: waiting for legal review of disclaimers—initiate early."

### 4.2 Content Enrichment Process (Per Project)

**Time estimate:** 30-45 minutes per project

1. **Read entire project** (5 min)
   - Understand the learning arc
   - Identify core outcomes
   - Note any obvious gaps

2. **Enrich planningNotes** (5 min)
   - Expand to 2-3 sentences
   - Add timing, partnerships, pitfalls
   - Make it actionable

3. **Review each WeekCard** (15-20 min for 4-12 weeks)
   - Ensure `focus` communicates "why"
   - Check teacher/student bullets for specificity
   - Verify deliverables align with outcomes
   - Ensure checkpoints are meaningful quality gates

4. **Review each AssignmentCard** (10-15 min for 3-6 assignments)
   - Enrich summary with pedagogical purpose
   - Verify successCriteria connect to outcomes
   - Check that evidence items are observable/assessable
   - Ensure student/teacher directions are complete

5. **Final coherence check** (5 min)
   - Do weeks build logically toward outcomes?
   - Do assignments connect clearly to weeks?
   - Is the project timeline realistic?

### 4.3 Batch Processing Strategy

**Batch A** (10 projects) - Lowest quality, needs most work:
- Use enrichment-tracker.csv to identify
- Allocate 45 min each = 7.5 hours total

**Batch B** (10 projects) - Medium quality:
- 30-35 min each = 5-6 hours total

**Batch C** (10 projects) - Highest quality:
- Light touch-ups, 15-20 min each = 3 hours total

**Total enrichment time:** ~16 hours across all 30 projects

### 4.4 Enrichment Examples (Before/After)

**planningNotes BEFORE:**
```
"Loop in district facilities early so students can access meters and schedules without delays."
```

**planningNotes AFTER:**
```
"Coordinate with facilities staff 3-4 weeks before Week 1 to secure meter access, audit schedules, and data-sharing agreements. Pre-request utility bills to avoid Week 2 delays. Common pitfall: underestimating legal review time for public-facing campaign materials—initiate approval process during Week 1."
```

**WeekCard.focus BEFORE:**
```
"Analyze findings and identify highest-leverage interventions."
```

**WeekCard.focus AFTER:**
```
"Analyze audit data to identify highest-leverage sustainability interventions, building cost-benefit analysis skills for evidence-based decision making."
```

**AssignmentCard.summary BEFORE:**
```
"Teams analyze audit data and model projected savings."
```

**AssignmentCard.summary AFTER:**
```
"Teams analyze audit data and model ROI projections, developing systems thinking and quantitative reasoning skills essential for stakeholder persuasion."
```

---

## PHASE 5: IMPLEMENTATION TIMELINE

### Week 1: Foundation & Cleanup (Days 1-3)

**Day 1: Schema & Types**
- [ ] Update `src/types/showcaseV2.ts` - remove safetyEthics
- [ ] Create phase/assignment color utilities
- [ ] Update validation scripts
- [ ] Run TypeScript compilation check

**Day 2: Data Cleanup Script**
- [ ] Create `scripts/remove-safety-ethics.sh`
- [ ] Run on all 30 projects
- [ ] Verify no syntax errors
- [ ] Commit: "Remove safetyEthics from schema and all projects"

**Day 3: planningNotes Enrichment (Batch C)**
- [ ] Enrich 10 highest-quality projects first
- [ ] Test UI rendering with improved notes
- [ ] Commit: "Enrich planningNotes for Batch C projects"

### Week 2: UI Component Development (Days 4-7)

**Day 4: Core Components**
- [ ] Create PhaseBeadge component
- [ ] Create CheckpointAlert component
- [ ] Create PlanningNotesCard component
- [ ] Test in isolation with sample data

**Day 5: RunOfShowCard**
- [ ] Build complete RunOfShowCard component
- [ ] Implement phase color system
- [ ] Add assignment badge interactivity
- [ ] Test with 3-4 different week types

**Day 6: AssignmentCard**
- [ ] Build complete AssignmentCard component
- [ ] Implement progressive disclosure (show more/less)
- [ ] Add AI optional collapsible section
- [ ] Test with various assignment types

**Day 7: Main Page Integration**
- [ ] Update ProjectShowcasePage.tsx
- [ ] Implement scroll-to-assignment functionality
- [ ] Test with 2-3 full projects
- [ ] Verify dark mode throughout

### Week 3: Content Enrichment (Days 8-12)

**Day 8-9: Batch B Enrichment**
- [ ] Enrich 10 medium-quality projects
- [ ] Focus on planningNotes + key summaries
- [ ] Commit progress daily

**Day 10-12: Batch A Enrichment**
- [ ] Enrich 10 lowest-quality projects
- [ ] Most intensive work
- [ ] Final coherence check across all 30
- [ ] Commit: "Complete content enrichment for all projects"

### Week 4: Testing & Deployment (Days 13-15)

**Day 13: Testing**
- [ ] Visual regression testing (all 30 projects)
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Performance testing (Lighthouse scores)

**Day 14: Bug Fixes & Polish**
- [ ] Address any issues from testing
- [ ] Fine-tune spacing, colors, interactions
- [ ] Cross-browser testing

**Day 15: Deployment**
- [ ] Final build & type check
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Celebrate! 🎉

---

## PHASE 6: TESTING CHECKLIST

### Visual Testing
- [ ] All 30 projects load without errors
- [ ] Phase colors display correctly for all types
- [ ] Assignment badges scroll correctly
- [ ] Checkpoints are visually prominent
- [ ] Dark mode works throughout
- [ ] No visual regressions vs. previous version

### Functional Testing
- [ ] Click assignment badge → smooth scroll to assignment
- [ ] Assignment highlight animation works
- [ ] "Show more/less" buttons expand/collapse correctly
- [ ] AI optional section expands/collapses
- [ ] All links and interactions work
- [ ] No JavaScript console errors

### Accessibility Testing
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels present and correct
- [ ] Heading hierarchy valid (h1 → h2 → h3)
- [ ] Screen reader announces scroll navigation
- [ ] Color contrast ratios meet WCAG AA (4.5:1)

### Performance Testing
- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score = 100
- [ ] Page load time < 2s on 3G
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth 60fps scrolling

### Content Testing
- [ ] All planningNotes substantive (>100 chars)
- [ ] No safetyEthics references remain
- [ ] All fields populated (no empty arrays where inappropriate)
- [ ] Assignments correctly linked to weeks
- [ ] Success criteria in student voice

### Responsive Testing
- [ ] Mobile (375px): Stacked layouts, touch targets ≥44px
- [ ] Tablet (768px): Two-column grids work
- [ ] Desktop (1024px+): Full layouts display
- [ ] No horizontal scroll at any breakpoint

---

## PHASE 7: ROLLBACK PLAN

### If Critical Issues Arise

**Create backup before starting:**
```bash
git checkout -b backup-before-redesign
git tag backup-showcase-redesign-2025-10-06
```

**Rollback procedure:**
1. Identify failing component
2. Revert specific file or restore from backup
3. Re-run build and tests
4. Deploy hotfix

**Partial rollback options:**
- Disable new components, show old version (feature flag)
- Roll back data changes only (restore safetyEthics if critical)
- Roll back UI only (keep content enrichment)

---

## FILES MODIFIED (Complete List)

### Types & Schema
- `src/types/showcaseV2.ts` - Remove safetyEthics from interface

### New Components
- `src/features/showcase/components/RunOfShowCard.tsx` ⭐ NEW
- `src/features/showcase/components/AssignmentCard.tsx` ⭐ NEW
- `src/features/showcase/components/PhaseBeadge.tsx` ⭐ NEW
- `src/features/showcase/components/CheckpointAlert.tsx` ⭐ NEW
- `src/features/showcase/components/PlanningNotesCard.tsx` ⭐ NEW

### New Utilities
- `src/features/showcase/utils/phaseColors.ts` ⭐ NEW

### Updated Components
- `src/features/showcase/ProjectShowcasePage.tsx` - Replace sections 86-162

### Data Files (All 30 projects)
- `src/data/showcaseV2/*.showcase.ts` - Remove safetyEthics, enrich planningNotes

### Scripts
- `scripts/remove-safety-ethics.sh` ⭐ NEW - Cleanup script
- `scripts/enrichment-lint.ts` - Update validation (remove safetyEthics checks)

---

## PRESERVATION LIST (DO NOT CHANGE)

**Core routing & navigation:**
- Project ID structure (used in URLs)
- File naming convention (kebab-case)
- Import/export structure in showcaseV2-registry.ts

**Existing working features:**
- Hero image display
- Overview sections
- Outcomes display
- Materials display
- Standards display (if present)
- Exhibition display (if present)

**Data integrity:**
- Don't remove any existing fields (except safetyEthics)
- Don't change array structures
- Preserve all existing content (just enhance where specified)

---

## SUCCESS METRICS

### User Experience
- **Scannability:** Users can understand a week's structure in <30 seconds
- **Assignment discovery:** 80%+ users notice and use assignment links
- **Pedagogical clarity:** Teachers report feeling "ready to implement" (survey)

### Technical Performance
- Lighthouse Performance: ≥90
- Lighthouse Accessibility: 100
- Zero critical console errors
- Page load < 2s

### Content Quality
- 100% projects have enriched planningNotes (>100 chars)
- 0% projects contain safetyEthics references
- All assignments linked to at least one week
- All weeks have meaningful checkpoints

---

## FINAL NOTES FOR CODEX

1. **Work incrementally** - Commit after each logical unit of work
2. **Test frequently** - Run `npm run build` and `npm run lint` after major changes
3. **Preserve data** - Never delete content, only remove the safetyEthics field
4. **Focus on existing schema** - No new fields, work within constraints
5. **Prioritize** - UI changes first (immediate impact), then content enrichment

This guide should provide everything you need to execute the redesign systematically and safely. Follow the phases in order, test at each checkpoint, and you'll deliver a dramatically improved showcase interface within 15 days.

Good luck! 🚀
