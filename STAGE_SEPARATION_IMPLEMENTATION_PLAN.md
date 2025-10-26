# Stage Separation Implementation Plan
**Date:** 2025-10-26
**Status:** Ready to Execute
**Estimated Timeline:** 10 days (1 engineer)

---

## Executive Summary

**Goal:** Transform the monolithic ChatMVP builder into **3 separate stage screens** with a **dashboard that shows progress by stage**.

**Why:** Teachers don't build PBL projects in one sitting. They need:
- Clear stopping points between stages
- Visual progress tracking across projects
- Easy resume capability
- Reduced cognitive load per session

**What We're Building:**
1. **Dashboard** → 3 columns (Ideation | Journey | Deliverables) + Completed section
2. **Stage 1: Ideation** → Big Idea + Essential Question + Challenge (5-10 min)
3. **Stage 2: Journey** → Learning phases + activities (20-45 min)
4. **Stage 3: Deliverables** → Milestones + artifacts + criteria (15-30 min)

**Key Principle:** Extract UI from ChatMVP, reuse all domain logic. No backward compatibility needed (pre-launch).

---

## Critical Context: What Already Exists ✅

### Data Layer (UnifiedStorageManager.ts:13-60)
```typescript
export interface UnifiedProjectData {
  id: string;
  userId: string;
  title: string;

  // ✅ Already has stage tracking
  stage?: string; // line 44

  // ✅ Already has stage data namespaces
  ideation?: Record<string, any>; // line 38
  journey?: Record<string, any>; // line 39
  deliverables?: Record<string, any>; // line 40

  // ✅ Already has progress tracking
  progress?: {
    ideation?: number;
    journey?: number;
    deliverables?: number;
    overall?: number
  }; // line 50

  completedAt?: Date; // line 54

  // ... other fields
}
```

**What We Need to ADD:**
```typescript
// Add to UnifiedProjectData interface (line ~50)
currentStage?: 'ideation' | 'journey' | 'deliverables' | 'review';
stageStatus?: {
  ideation: 'not_started' | 'in_progress' | 'complete';
  journey: 'not_started' | 'in_progress' | 'complete';
  deliverables: 'not_started' | 'in_progress' | 'complete';
};
```

### Domain Logic (REUSE, DON'T REBUILD!)
✅ **Existing files in `src/features/chat-mvp/domain/`:**
- `stages.ts` → Stage validation logic
- `specificityScorer.ts` → Big Idea scoring
- `journeyTemplate.ts` → Immediate journey template
- `journeyMicroFlow.ts` → Background AI refinement for journey
- `deliverablesMicroFlow.ts` → Deliverables template
- `deliverablesAI.ts` → Background AI refinement for deliverables
- `courseDescriptionGenerator.ts` → Completion flow (showcase)
- `projectShowcaseGenerator.ts` → Completion flow (showcase)

### Progress Computation (REUSE!)
✅ **Existing file:** `src/utils/stageProgress.ts`
- Already has `computeStageProgress(blueprint)` function
- Returns `{ stages, current }` based on ideation/journey/deliverables data
- We'll wrap this for `currentStage` derivation

---

## Implementation Phases

### ✅ Phase 1: Infrastructure (Day 1)
**Goal:** Set up types, routing, and helpers without changing UI

#### Task 1.1: Update UnifiedStorageManager Types
**File:** `src/services/UnifiedStorageManager.ts`

```typescript
// Add to UnifiedProjectData interface (around line 50-55)
currentStage?: 'ideation' | 'journey' | 'deliverables' | 'review';
stageStatus?: {
  ideation: 'not_started' | 'in_progress' | 'complete';
  journey: 'not_started' | 'in_progress' | 'complete';
  deliverables: 'not_started' | 'in_progress' | 'complete';
};
```

**Test:** Build succeeds, no runtime changes

#### Task 1.2: Create Stage Status Helper
**File:** `src/utils/stageStatus.ts` (NEW)

```typescript
import { computeStageProgress } from './stageProgress';
import type { UnifiedProjectData } from '../services/UnifiedStorageManager';

export type StageId = 'ideation' | 'journey' | 'deliverables' | 'review';
export type StageStatusValue = 'not_started' | 'in_progress' | 'complete';

export interface DerivedStageStatus {
  currentStage: StageId;
  stageStatus: {
    ideation: StageStatusValue;
    journey: StageStatusValue;
    deliverables: StageStatusValue;
  };
}

/**
 * Derives stage status from blueprint data
 * Uses existing computeStageProgress() logic
 */
export function deriveStageStatus(blueprint: UnifiedProjectData): DerivedStageStatus {
  // If already computed and stored, use it
  if (blueprint.currentStage && blueprint.stageStatus) {
    return {
      currentStage: blueprint.currentStage,
      stageStatus: blueprint.stageStatus
    };
  }

  // Otherwise, compute from data
  const { stages } = computeStageProgress(blueprint);

  const ideationStage = stages.find(s => s.id === 'ideation');
  const journeyStage = stages.find(s => s.id === 'journey');
  const deliverablesStage = stages.find(s => s.id === 'deliverables');

  const stageStatus = {
    ideation: mapStatus(ideationStage?.status),
    journey: mapStatus(journeyStage?.status),
    deliverables: mapStatus(deliverablesStage?.status)
  };

  // Determine current stage based on completion
  let currentStage: StageId = 'ideation';

  if (blueprint.completedAt || deliverablesStage?.status === 'completed') {
    currentStage = 'review';
  } else if (stageStatus.journey === 'complete' || stageStatus.deliverables === 'in_progress') {
    currentStage = 'deliverables';
  } else if (stageStatus.ideation === 'complete' || stageStatus.journey === 'in_progress') {
    currentStage = 'journey';
  } else {
    currentStage = 'ideation';
  }

  return { currentStage, stageStatus };
}

function mapStatus(status?: string): StageStatusValue {
  if (status === 'completed') return 'complete';
  if (status === 'in-progress') return 'in_progress';
  return 'not_started';
}
```

**Test:** Unit test with various blueprint states

#### Task 1.3: Add Stage Routes
**File:** `src/AuthenticatedApp.tsx`

```tsx
// Add these routes (around line ~50-80 where other routes are)
<Route path="/app/projects/:id/ideation" element={<IdeationStage />} />
<Route path="/app/projects/:id/journey" element={<JourneyStage />} />
<Route path="/app/projects/:id/deliverables" element={<DeliverablesStage />} />

// Update redirect (deprecate legacy blueprint route)
<Route
  path="/app/blueprint/:id"
  element={<Navigate to="/app/projects/:id/ideation" replace />}
/>
```

**Note:** Stage components don't exist yet (Phase 4-6), but routes can be added now

**Test:** Build succeeds

---

### ✅ Phase 2: Stage Controller (Day 1-2)
**Goal:** Create shared orchestration hook for all stages

**File:** `src/features/builder/useStageController.ts` (NEW)

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { deriveStageStatus, type StageId } from '../../utils/stageStatus';
import { validate as validateStage } from '../chat-mvp/domain/stages';

interface UseStageControllerProps {
  projectId: string;
  stage: StageId;
  blueprint: UnifiedProjectData;
  onBlueprintUpdate: (blueprint: UnifiedProjectData) => void;
}

export function useStageController({
  projectId,
  stage,
  blueprint,
  onBlueprintUpdate
}: UseStageControllerProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const storage = UnifiedStorageManager.getInstance();

  // Debounced autosave (500ms)
  const debouncedSave = useCallback(async (data: UnifiedProjectData) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      setIsSaving(true);
      try {
        await storage.saveProject(data);
        console.log(`[StageController] Autosaved ${stage} stage`);
        // Track telemetry
        trackEvent('stage_autosave', { stage, projectId });
      } catch (error) {
        console.error('[StageController] Autosave failed', error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [stage, projectId, storage]);

  // Save and continue later (route to dashboard)
  const saveAndContinueLater = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setIsSaving(true);
    try {
      // Mark current stage as in_progress
      const { stageStatus } = deriveStageStatus(blueprint);
      stageStatus[stage] = 'in_progress';

      const updated = {
        ...blueprint,
        currentStage: stage,
        stageStatus,
        updatedAt: new Date()
      };

      await storage.saveProject(updated);

      trackEvent('save_and_continue_later', { stage, projectId });

      // Route to dashboard
      navigate('/app/dashboard');
    } catch (error) {
      console.error('[StageController] Save failed', error);
    } finally {
      setIsSaving(false);
    }
  }, [blueprint, stage, projectId, storage, navigate]);

  // Complete stage and transition to next
  const completeStage = useCallback(async (nextStage: StageId) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setIsSaving(true);
    try {
      const { stageStatus } = deriveStageStatus(blueprint);

      // Mark current stage as complete
      stageStatus[stage] = 'complete';

      // Mark next stage as in_progress (if not review)
      if (nextStage !== 'review') {
        stageStatus[nextStage] = 'in_progress';
      }

      const updated = {
        ...blueprint,
        currentStage: nextStage,
        stageStatus,
        updatedAt: new Date(),
        ...(nextStage === 'review' && { completedAt: new Date() })
      };

      await storage.saveProject(updated);

      trackEvent('stage_completed', {
        stage,
        nextStage,
        projectId
      });

      // Route to next stage
      navigate(`/app/projects/${projectId}/${nextStage}`);
    } catch (error) {
      console.error('[StageController] Stage transition failed', error);
    } finally {
      setIsSaving(false);
    }
  }, [blueprint, stage, projectId, storage, navigate]);

  // Validate stage completion (reuse existing validation)
  const canCompleteStage = useCallback((): boolean => {
    try {
      const validation = validateStage(stage.toUpperCase(), blueprint);
      return validation.isValid;
    } catch (error) {
      console.error('[StageController] Validation failed', error);
      return false;
    }
  }, [stage, blueprint]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Track stage view
  useEffect(() => {
    trackEvent('stage_viewed', { stage, projectId });
  }, [stage, projectId]);

  return {
    isSaving,
    debouncedSave,
    saveAndContinueLater,
    completeStage,
    canCompleteStage
  };
}

// Telemetry stub (replace with actual implementation)
function trackEvent(event: string, data: Record<string, any>) {
  console.log(`[Telemetry] ${event}`, data);
  // TODO: Wire to actual analytics service
}
```

**Test:**
- Mock blueprint and verify autosave debouncing
- Verify stage transitions update blueprint correctly
- Verify telemetry calls

---

### ✅ Phase 3: Dashboard (Day 2)
**Goal:** Convert Dashboard to 3-column layout

**File:** `src/components/Dashboard.jsx` (MODIFY)

**Changes:**
1. Group projects by `currentStage` (derived from `deriveStageStatus()`)
2. Render 3 columns: Ideation | Journey | Deliverables
3. Completed section at bottom (collapsible)
4. Update ProjectCard to route to correct stage

**Updated Dashboard Layout:**
```jsx
import { deriveStageStatus } from '../utils/stageStatus';

export default function Dashboard() {
  // ... existing code ...

  const effectiveUserId = useMemo(() => {
    if (!userId && !user?.isAnonymous) {
      return null;
    }
    return user?.isAnonymous ? 'anonymous' : userId;
  }, [userId, user?.isAnonymous]);

  // Group projects by stage
  const groupedProjects = useMemo(() => {
    const groups = {
      ideation: [],
      journey: [],
      deliverables: [],
      completed: []
    };

    drafts.forEach(project => {
      const { currentStage } = deriveStageStatus(project);

      if (currentStage === 'review' || project.completedAt) {
        groups.completed.push(project);
      } else {
        groups[currentStage]?.push(project);
      }
    });

    return groups;
  }, [drafts]);

  return (
    <Container maxWidth="7xl" className="py-8">
      {/* Header */}
      <Section className="mb-8">
        <Heading level={1}>My Projects</Heading>
        <Button
          onClick={() => navigate('/app/wizard')}
          variant="primary"
        >
          + New Project
        </Button>
      </Section>

      {/* 3-Column Layout */}
      <Grid cols={3} gap={6} className="mb-12">
        {/* Ideation Column */}
        <Stack spacing={4}>
          <Heading level={3}>
            💡 Ideation ({groupedProjects.ideation.length})
          </Heading>
          {groupedProjects.ideation.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
          {groupedProjects.ideation.length === 0 && (
            <Text variant="muted">No projects in ideation</Text>
          )}
        </Stack>

        {/* Journey Column */}
        <Stack spacing={4}>
          <Heading level={3}>
            🗺️ Journey ({groupedProjects.journey.length})
          </Heading>
          {groupedProjects.journey.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
          {groupedProjects.journey.length === 0 && (
            <Text variant="muted">No projects in journey</Text>
          )}
        </Stack>

        {/* Deliverables Column */}
        <Stack spacing={4}>
          <Heading level={3}>
            🎯 Deliverables ({groupedProjects.deliverables.length})
          </Heading>
          {groupedProjects.deliverables.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
          {groupedProjects.deliverables.length === 0 && (
            <Text variant="muted">No projects in deliverables</Text>
          )}
        </Stack>
      </Grid>

      {/* Completed Section */}
      <Section>
        <Heading level={3} className="mb-4">
          ✅ Completed ({groupedProjects.completed.length})
        </Heading>
        <Grid cols={4} gap={4}>
          {groupedProjects.completed.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
        </Grid>
      </Section>
    </Container>
  );
}
```

**File:** `src/components/ProjectCard.jsx` (MODIFY)

**Update routing logic:**
```jsx
import { deriveStageStatus } from '../utils/stageStatus';

export default function ProjectCard({ project, onDelete, onRestore }) {
  const navigate = useNavigate();

  const handleOpen = () => {
    const { currentStage } = deriveStageStatus(project);

    if (currentStage === 'review' || project.completedAt) {
      navigate(`/app/project/${project.id}/preview`);
    } else {
      navigate(`/app/projects/${project.id}/${currentStage}`);
    }
  };

  // ... rest of component
}
```

**Test:**
- Dashboard renders 3 columns
- Projects appear in correct column based on stage
- Clicking card routes to correct stage

---

### ✅ Phase 4: Stage 1 - Ideation (Day 3-4)
**Goal:** Extract Ideation UI from ChatMVP

**File:** `src/features/builder/IdeationStage.tsx` (NEW)

**What to extract from ChatMVP:**
- BIG_IDEA stage (suggestion chips, specificity scoring, acceptance)
- ESSENTIAL_QUESTION stage (suggestions, acceptance)
- CHALLENGE stage (suggestions, acceptance)

**Structure:**
```tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedStorageManager } from '../../services/UnifiedStorageManager';
import { useStageController } from './useStageController';
import { validate } from '../chat-mvp/domain/stages';
import { scoreBigIdea } from '../chat-mvp/domain/specificityScorer';

type IdeationStep = 'bigIdea' | 'essentialQuestion' | 'challenge';

export function IdeationStage() {
  const { id: projectId } = useParams();
  const [blueprint, setBlueprint] = useState(null);
  const [currentStep, setCurrentStep] = useState<IdeationStep>('bigIdea');
  const [isLoading, setIsLoading] = useState(true);

  const {
    isSaving,
    debouncedSave,
    saveAndContinueLater,
    completeStage,
    canCompleteStage
  } = useStageController({
    projectId,
    stage: 'ideation',
    blueprint,
    onBlueprintUpdate: setBlueprint
  });

  // Load blueprint
  useEffect(() => {
    const loadProject = async () => {
      const storage = UnifiedStorageManager.getInstance();
      const project = await storage.getProject(projectId);
      setBlueprint(project);

      // Determine which step to show based on existing data
      if (!project.ideation?.bigIdea) {
        setCurrentStep('bigIdea');
      } else if (!project.ideation?.essentialQuestion) {
        setCurrentStep('essentialQuestion');
      } else if (!project.ideation?.challenge) {
        setCurrentStep('challenge');
      } else {
        setCurrentStep('challenge'); // All done, show last step
      }

      setIsLoading(false);
    };

    loadProject();
  }, [projectId]);

  // Handle Big Idea acceptance
  const handleBigIdeaAccept = (bigIdea: string) => {
    const score = scoreBigIdea(bigIdea);

    const updated = {
      ...blueprint,
      ideation: {
        ...blueprint.ideation,
        bigIdea,
        specificityScore: score
      }
    };

    setBlueprint(updated);
    debouncedSave(updated);
    setCurrentStep('essentialQuestion');
  };

  // Handle Essential Question acceptance
  const handleEQAccept = (essentialQuestion: string) => {
    const updated = {
      ...blueprint,
      ideation: {
        ...blueprint.ideation,
        essentialQuestion
      }
    };

    setBlueprint(updated);
    debouncedSave(updated);
    setCurrentStep('challenge');
  };

  // Handle Challenge acceptance
  const handleChallengeAccept = (challenge: string) => {
    const updated = {
      ...blueprint,
      ideation: {
        ...blueprint.ideation,
        challenge
      }
    };

    setBlueprint(updated);
    debouncedSave(updated);
  };

  // Check if can proceed to Journey
  const canProceed = () => {
    return (
      blueprint?.ideation?.bigIdea &&
      blueprint?.ideation?.essentialQuestion &&
      blueprint?.ideation?.challenge
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Stage Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ideation</h1>
        <p className="text-gray-600">
          Define your Big Idea, Essential Question, and Challenge
        </p>
        {isSaving && <span className="text-sm text-blue-600">Saving...</span>}
      </header>

      {/* Steps */}
      {currentStep === 'bigIdea' && (
        <BigIdeaStep
          initialValue={blueprint.ideation?.bigIdea}
          onAccept={handleBigIdeaAccept}
        />
      )}

      {currentStep === 'essentialQuestion' && (
        <EssentialQuestionStep
          bigIdea={blueprint.ideation?.bigIdea}
          initialValue={blueprint.ideation?.essentialQuestion}
          onAccept={handleEQAccept}
        />
      )}

      {currentStep === 'challenge' && (
        <ChallengeStep
          bigIdea={blueprint.ideation?.bigIdea}
          essentialQuestion={blueprint.ideation?.essentialQuestion}
          initialValue={blueprint.ideation?.challenge}
          onAccept={handleChallengeAccept}
        />
      )}

      {/* Actions */}
      <footer className="mt-8 flex justify-between">
        <button
          onClick={saveAndContinueLater}
          className="px-4 py-2 border rounded"
          disabled={isSaving}
        >
          Save & Continue Later
        </button>

        <button
          onClick={() => completeStage('journey')}
          disabled={!canProceed() || isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Continue to Journey →
        </button>
      </footer>
    </div>
  );
}

// Extract these sub-components from ChatMVP
function BigIdeaStep({ initialValue, onAccept }) {
  // TODO: Extract from ChatMVP BIG_IDEA stage
  // - Suggestion chips
  // - Specificity scoring UI
  // - Acceptance handler
  return <div>Big Idea Step (TODO: Extract from ChatMVP)</div>;
}

function EssentialQuestionStep({ bigIdea, initialValue, onAccept }) {
  // TODO: Extract from ChatMVP ESSENTIAL_QUESTION stage
  return <div>Essential Question Step (TODO: Extract from ChatMVP)</div>;
}

function ChallengeStep({ bigIdea, essentialQuestion, initialValue, onAccept }) {
  // TODO: Extract from ChatMVP CHALLENGE stage
  return <div>Challenge Step (TODO: Extract from ChatMVP)</div>;
}
```

**Test:**
- IdeationStage renders
- Can complete Big Idea → EQ → Challenge
- "Save & Continue Later" routes to dashboard
- "Continue to Journey" enables when all fields complete

---

### ✅ Phase 5: Stage 2 - Journey (Day 5-6)
**Goal:** Extract Journey UI from ChatMVP with background AI

**File:** `src/features/builder/JourneyStage.tsx` (NEW)

**Key features:**
- Show ideation context (read-only banner)
- Load journey template immediately (sync)
- Background AI refinement (async)
- Phase editing (rename, reorder, add, remove)

**Structure:**
```tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedStorageManager } from '../../services/UnifiedStorageManager';
import { useStageController } from './useStageController';
import { generateJourneyTemplate } from '../chat-mvp/domain/journeyTemplate';

type AIStatus = 'idle' | 'refining' | 'complete' | 'failed';

export function JourneyStage() {
  const { id: projectId } = useParams();
  const [blueprint, setBlueprint] = useState(null);
  const [phases, setPhases] = useState([]);
  const [aiStatus, setAIStatus] = useState<AIStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);

  const {
    isSaving,
    debouncedSave,
    saveAndContinueLater,
    completeStage
  } = useStageController({
    projectId,
    stage: 'journey',
    blueprint,
    onBlueprintUpdate: setBlueprint
  });

  // Load blueprint and generate template
  useEffect(() => {
    const loadAndGenerate = async () => {
      const storage = UnifiedStorageManager.getInstance();
      const project = await storage.getProject(projectId);
      setBlueprint(project);

      // Load existing journey or generate template
      if (project.journey?.phases) {
        setPhases(project.journey.phases);
        setIsLoading(false);
      } else {
        // Generate sync template
        const template = generateJourneyTemplate(project.ideation);
        setPhases(template.phases);
        setIsLoading(false);

        // Start background AI refinement
        startBackgroundRefinement(project.ideation);
      }
    };

    loadAndGenerate();
  }, [projectId]);

  // Background AI refinement
  const startBackgroundRefinement = async (ideation: any) => {
    setAIStatus('refining');

    try {
      // Dynamic import to avoid blocking
      const { refineJourney } = await import('../chat-mvp/domain/journeyMicroFlow');

      const refined = await refineJourney(ideation);

      setPhases(refined.phases);
      setAIStatus('complete');

      // Autosave refined version
      const updated = {
        ...blueprint,
        journey: { phases: refined.phases }
      };
      setBlueprint(updated);
      debouncedSave(updated);

      trackEvent('ai_refine_completed', { stage: 'journey', projectId });
    } catch (error) {
      console.error('[JourneyStage] AI refinement failed', error);
      setAIStatus('failed');
      trackEvent('ai_refine_fallback', { stage: 'journey', projectId, reason: error.message });
    }
  };

  // Handle phase edits
  const handlePhaseUpdate = (index: number, updates: Partial<Phase>) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = { ...updatedPhases[index], ...updates };
    setPhases(updatedPhases);

    const updated = {
      ...blueprint,
      journey: { phases: updatedPhases }
    };
    setBlueprint(updated);
    debouncedSave(updated);
  };

  const canProceed = () => {
    return phases.length >= 3 && phases.every(p => p.title && p.description);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Ideation Context Banner (Read-only) */}
      <aside className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <h3 className="font-semibold mb-2">Building journey for:</h3>
        <p className="text-sm">
          <strong>Big Idea:</strong> {blueprint.ideation?.bigIdea}
        </p>
        <p className="text-sm">
          <strong>Essential Question:</strong> {blueprint.ideation?.essentialQuestion}
        </p>
      </aside>

      {/* Stage Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Journey</h1>
        <p className="text-gray-600">
          Define the learning phases and activities
        </p>

        {/* AI Status Chip */}
        {aiStatus === 'refining' && (
          <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
            🤖 AI Refining...
          </span>
        )}
        {aiStatus === 'complete' && (
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
            ✓ AI Enhanced
          </span>
        )}
        {aiStatus === 'failed' && (
          <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm rounded">
            ⚠ Using Template (AI Unavailable)
          </span>
        )}
      </header>

      {/* Phase Editor */}
      <PhaseEditor
        phases={phases}
        onUpdate={handlePhaseUpdate}
      />

      {/* Actions */}
      <footer className="mt-8 flex justify-between">
        <button
          onClick={saveAndContinueLater}
          className="px-4 py-2 border rounded"
        >
          Save & Continue Later
        </button>

        <button
          onClick={() => completeStage('deliverables')}
          disabled={!canProceed()}
          className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Continue to Deliverables →
        </button>
      </footer>
    </div>
  );
}

// TODO: Extract from ChatMVP
function PhaseEditor({ phases, onUpdate }) {
  // Phase editing UI: rename, reorder, add, remove
  return <div>Phase Editor (TODO: Extract from ChatMVP)</div>;
}
```

**Test:**
- JourneyStage loads with ideation context
- Template appears immediately
- Background AI refines (status chip updates)
- Phase editing works
- "Continue to Deliverables" enables when valid

---

### ✅ Phase 6: Stage 3 - Deliverables (Day 7-8)
**Goal:** Extract Deliverables UI and wire completion flow

**File:** `src/features/builder/DeliverablesStage.tsx` (NEW)

**Key features:**
- Show ideation + journey context
- Load deliverables template immediately
- Background AI refinement
- Milestone/artifact/criteria editing
- "Finalize Project" → completion pipeline

**Structure:**
```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UnifiedStorageManager } from '../../services/UnifiedStorageManager';
import { useStageController } from './useStageController';
import { generateDeliverablesTemplate } from '../chat-mvp/domain/deliverablesMicroFlow';
import { generateCourseDescription } from '../chat-mvp/domain/courseDescriptionGenerator';
import { generateProjectShowcase } from '../chat-mvp/domain/projectShowcaseGenerator';

export function DeliverablesStage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [deliverables, setDeliverables] = useState({ milestones: [], artifacts: [], criteria: [] });
  const [aiStatus, setAIStatus] = useState<'idle' | 'refining' | 'complete' | 'failed'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const {
    isSaving,
    debouncedSave,
    saveAndContinueLater
  } = useStageController({
    projectId,
    stage: 'deliverables',
    blueprint,
    onBlueprintUpdate: setBlueprint
  });

  // Load and generate template
  useEffect(() => {
    const loadAndGenerate = async () => {
      const storage = UnifiedStorageManager.getInstance();
      const project = await storage.getProject(projectId);
      setBlueprint(project);

      if (project.deliverables) {
        setDeliverables(project.deliverables);
        setIsLoading(false);
      } else {
        // Generate template
        const template = generateDeliverablesTemplate(project.ideation, project.journey);
        setDeliverables(template);
        setIsLoading(false);

        // Background AI refinement
        startBackgroundRefinement(project);
      }
    };

    loadAndGenerate();
  }, [projectId]);

  // Background AI refinement
  const startBackgroundRefinement = async (project: any) => {
    setAIStatus('refining');

    try {
      const { refineDeliverables } = await import('../chat-mvp/domain/deliverablesAI');
      const refined = await refineDeliverables(project.ideation, project.journey);

      setDeliverables(refined);
      setAIStatus('complete');

      const updated = {
        ...blueprint,
        deliverables: refined
      };
      setBlueprint(updated);
      debouncedSave(updated);
    } catch (error) {
      console.error('[DeliverablesStage] AI refinement failed', error);
      setAIStatus('failed');
    }
  };

  // Finalize project → completion pipeline
  const handleFinalize = async () => {
    setIsFinalizing(true);

    try {
      // 1. Capture final edits
      const finalBlueprint = {
        ...blueprint,
        deliverables
      };

      // 2. Generate course description
      const description = await generateCourseDescription(finalBlueprint);

      // 3. Generate showcase
      const showcase = await generateProjectShowcase(finalBlueprint);

      // 4. Save everything
      const completed = {
        ...finalBlueprint,
        description,
        showcase,
        completedAt: new Date(),
        currentStage: 'review',
        stageStatus: {
          ideation: 'complete',
          journey: 'complete',
          deliverables: 'complete'
        }
      };

      const storage = UnifiedStorageManager.getInstance();
      await storage.saveProject(completed);

      // 5. (Optional) Cloud save best-effort
      try {
        await storage.syncProjectToCloud?.(completed);
      } catch (cloudError) {
        console.warn('[DeliverablesStage] Cloud sync failed (non-blocking)', cloudError);
      }

      // 6. Run hero transform (if enabled)
      // TODO: Check config and run if needed

      // 7. Navigate to Review
      trackEvent('project_finalized', { projectId });
      navigate(`/app/projects/${projectId}/review`);

    } catch (error) {
      console.error('[DeliverablesStage] Finalization failed', error);
      alert('Failed to finalize project. Please try again.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const canFinalize = () => {
    return (
      deliverables.milestones?.length >= 1 &&
      deliverables.artifacts?.length >= 1 &&
      deliverables.criteria?.length >= 1
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Context Banner */}
      <aside className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <h3 className="font-semibold mb-2">Project Context:</h3>
        <p className="text-sm"><strong>Big Idea:</strong> {blueprint.ideation?.bigIdea}</p>
        <p className="text-sm"><strong>Phases:</strong> {blueprint.journey?.phases?.length || 0} phases</p>
      </aside>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Deliverables</h1>
        <p className="text-gray-600">
          Define milestones, artifacts, and success criteria
        </p>

        {aiStatus === 'refining' && <span className="text-sm text-yellow-600">🤖 AI Refining...</span>}
        {aiStatus === 'complete' && <span className="text-sm text-green-600">✓ AI Enhanced</span>}
      </header>

      {/* Deliverables Editor */}
      <DeliverablesEditor
        deliverables={deliverables}
        onChange={setDeliverables}
      />

      {/* Actions */}
      <footer className="mt-8 flex justify-between">
        <button
          onClick={saveAndContinueLater}
          className="px-4 py-2 border rounded"
        >
          Save & Continue Later
        </button>

        <button
          onClick={handleFinalize}
          disabled={!canFinalize() || isFinalizing}
          className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {isFinalizing ? 'Finalizing...' : 'Finalize Project ✓'}
        </button>
      </footer>
    </div>
  );
}

// TODO: Extract from ChatMVP
function DeliverablesEditor({ deliverables, onChange }) {
  return <div>Deliverables Editor (TODO: Extract from ChatMVP)</div>;
}
```

**Test:**
- DeliverablesStage loads with context
- Template appears, AI refines
- Editing works
- "Finalize Project" generates showcase and routes to Review

---

### ✅ Phase 7: Testing & Polish (Day 9-10)
**Goal:** End-to-end testing, bug fixes, cleanup

#### Task 7.1: Smoke Tests
**Files:** `src/features/builder/__tests__/*.smoke.test.tsx` (NEW)

```typescript
// IdeationStage.smoke.test.tsx
describe('IdeationStage', () => {
  it('renders without crashing', () => {});
  it('shows Big Idea step first', () => {});
  it('advances to EQ after Big Idea accepted', () => {});
  it('enables "Continue to Journey" when all fields complete', () => {});
});

// JourneyStage.smoke.test.tsx
describe('JourneyStage', () => {
  it('renders with ideation context', () => {});
  it('loads template immediately', () => {});
  it('shows AI status chip', () => {});
  it('enables "Continue to Deliverables" when phases valid', () => {});
});

// DeliverablesStage.smoke.test.tsx
describe('DeliverablesStage', () => {
  it('renders with full context', () => {});
  it('loads template immediately', () => {});
  it('enables "Finalize" when all fields valid', () => {});
});
```

#### Task 7.2: E2E Test
**File:** `e2e/stage-separation.spec.ts` (NEW)

```typescript
test('Complete project flow: Ideation → Journey → Deliverables → Review', async ({ page }) => {
  // 1. Create project
  await page.goto('/app/dashboard');
  await page.click('text=New Project');

  // 2. Complete Ideation
  await page.fill('[placeholder="Big Idea"]', 'Community Garden Project');
  await page.click('text=Accept');
  await page.fill('[placeholder="Essential Question"]', 'How can we sustain our community?');
  await page.click('text=Accept');
  await page.fill('[placeholder="Challenge"]', 'Design and build a community garden');
  await page.click('text=Accept');
  await page.click('text=Continue to Journey');

  // 3. Complete Journey
  await expect(page.locator('text=Community Garden Project')).toBeVisible();
  await page.click('text=Continue to Deliverables');

  // 4. Complete Deliverables
  await page.click('text=Finalize Project');

  // 5. Verify Review loads
  await expect(page).toHaveURL(/\/app\/projects\/.+\/review/);
});
```

#### Task 7.3: Remove Legacy Routes
**File:** `src/AuthenticatedApp.tsx`

```tsx
// Comment out or redirect legacy routes
<Route
  path="/app/blueprint/:id"
  element={<Navigate to="/app/projects/:id/ideation" replace />}
/>
```

**Keep ChatMVP.tsx** for reference during extraction, but remove from routing

#### Task 7.4: Build & Validate
```bash
npm run lint
npm test
npm run build
```

---

## Post-Refactor Bug Backlog

**Fix AFTER extraction is complete:**

### Journey Stage
- [ ] AI refinement stuck in "refining..." → Add timeout + retry
- [ ] Prevent empty/duplicate phase names → Add validation
- [ ] Background AI failures surface poorly → Add error banner with "Use template" option

### Deliverables Stage
- [ ] "Accept all" doesn't capture in-place edits → Fix timing
- [ ] Regeneration loses user customizations → Preserve edits
- [ ] Milestone/artifact/criteria imbalances → Add hints

**Why wait:** Easier to debug in isolated 250-line components vs. 800-line monolith

---

## Acceptance Criteria

✅ **Dashboard:**
- Shows 3 columns with correct counts
- "New Project" creates and routes to Ideation
- Clicking card routes to correct stage

✅ **Ideation Stage:**
- Loads empty or existing data
- Shows suggestions for Big Idea, EQ, Challenge
- "Save & Continue Later" routes to dashboard
- "Continue to Journey" routes to Journey

✅ **Journey Stage:**
- Shows ideation context (read-only)
- Template loads immediately
- Background AI refines (status chip updates)
- Phase editing works
- "Continue to Deliverables" routes to Deliverables

✅ **Deliverables Stage:**
- Shows ideation + journey context
- Template loads immediately
- Background AI refines
- Editing works
- "Finalize Project" generates showcase and routes to Review

✅ **Resume Flow:**
- Reload → dashboard shows correct columns
- Click card → routes to correct stage
- Stage loads previous data

✅ **No Legacy Routes:**
- `/app/blueprint/:id` redirects to new routes

---

## Critical Pitfalls to Avoid

### ❌ Don't Rebuild Domain Logic
**Wrong:** Rewrite AI prompt generation
**Right:** Import and call existing modules

### ❌ Don't Skip the Controller Hook
**Wrong:** Duplicate autosave in each stage
**Right:** Use `useStageController` in all stages

### ❌ Don't Forget Lazy Computation
**Wrong:** Migrate all projects upfront
**Right:** Compute `currentStage` on load, save on next autosave

### ❌ Don't Break Review Screen
**Wrong:** Change showcase format
**Right:** Reuse existing generators

### ❌ Don't Test in Production First
**Wrong:** Deploy without local testing
**Right:** Full E2E locally with 10+ projects

---

## File Map Reference

```
src/
├── AuthenticatedApp.tsx              # ADD: Stage routes
├── components/
│   ├── Dashboard.jsx                 # MODIFY: 3-column layout
│   └── ProjectCard.jsx               # MODIFY: Route by stage
├── features/
│   ├── builder/                      # NEW FOLDER
│   │   ├── IdeationStage.tsx        # NEW: Extract from ChatMVP
│   │   ├── JourneyStage.tsx         # NEW: Extract from ChatMVP
│   │   ├── DeliverablesStage.tsx    # NEW: Extract from ChatMVP
│   │   ├── useStageController.ts    # NEW: Shared orchestration
│   │   └── __tests__/               # NEW: Smoke tests
│   ├── chat-mvp/
│   │   ├── ChatMVP.tsx              # KEEP: Reference
│   │   └── domain/                  # REUSE: All modules
│   └── review/
│       └── ReviewScreen.tsx         # NO CHANGE
├── services/
│   └── UnifiedStorageManager.ts     # MODIFY: Add currentStage, stageStatus
└── utils/
    ├── stageProgress.ts             # REUSE: computeStageProgress()
    └── stageStatus.ts               # NEW: deriveStageStatus()
```

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Start Phase 1** (Infrastructure) → Build succeeds, no UI changes
3. **Extract stages sequentially** → Don't do all 3 at once
4. **Test frequently** → After each phase
5. **Keep ChatMVP** until all stages work
6. **Fix bugs AFTER extraction** → Don't get sidetracked

---

## Questions? Reference:

- **Strategic rationale** → `STAGE_SEPARATION_ANALYSIS.md`
- **Detailed task breakdown** → `STAGE_SEPARATION_HANDOFF.md`
- **Data model** → `src/services/UnifiedStorageManager.ts:13-60`
- **Stage validation** → `src/features/chat-mvp/domain/stages.ts`
- **Progress computation** → `src/utils/stageProgress.ts`

---

**Ready to execute? Start with Phase 1. Good luck! 🚀**
