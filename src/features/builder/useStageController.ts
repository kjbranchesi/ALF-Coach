/**
 * useStageController - Shared orchestration hook for stage-separated builder
 *
 * Responsibilities:
 * - Debounced autosave (500-800ms) with empty-save guard
 * - Stage gating via existing validate function
 * - Stage transitions (update stageStatus, currentStage, updatedAt)
 * - Telemetry tracking (stage_viewed, stage_autosave, stage_completed)
 *
 * Phase 2 - Infrastructure
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { deriveStageStatus, getNextStage, getStageRoute, type StageId } from '../../utils/stageStatus';
import { validate, type CapturedData } from '../chat-mvp/domain/stages';

// ============================================================================
// Telemetry Service (stub for Phase 2, wire to actual service later)
// ============================================================================

interface TelemetryEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

class TelemetryService {
  private static instance: TelemetryService;
  private events: TelemetryEvent[] = [];

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  track(event: string, properties: Record<string, any> = {}): void {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: new Date()
    };

    this.events.push(telemetryEvent);
    console.log(`[Telemetry] ${event}`, properties);

    // TODO Phase 3+: Wire to actual analytics service
    // Example: analytics.track(event, properties);
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

const telemetry = TelemetryService.getInstance();

// ============================================================================
// Stage Controller Hook Interface
// ============================================================================

export interface UseStageControllerProps {
  projectId: string;
  stage: StageId;
  blueprint: UnifiedProjectData | null;
  onBlueprintUpdate?: (blueprint: UnifiedProjectData) => void;
}

export interface UseStageControllerReturn {
  isSaving: boolean;
  debouncedSave: (updates: Partial<UnifiedProjectData>) => void;
  saveAndContinueLater: () => Promise<void>;
  completeStage: (nextStage?: StageId) => Promise<void>;
  canCompleteStage: () => boolean;
  validationError: string | null;
}

// ============================================================================
// Stage to ChatMVP Stage Mapping
// ============================================================================

const STAGE_TO_CHATMVP_STAGE: Record<StageId, string> = {
  ideation: 'CHALLENGE', // Validate full ideation (BIG_IDEA + EQ + CHALLENGE)
  journey: 'JOURNEY',
  deliverables: 'DELIVERABLES',
  review: 'DELIVERABLES' // Review doesn't need validation, but map to last stage
};

// ============================================================================
// Empty Save Guard
// ============================================================================

function hasSubstantiveChanges(blueprint: UnifiedProjectData | null): boolean {
  if (!blueprint) return false;

  // Check if project has any meaningful content
  const hasIdeation = !!(
    blueprint.ideation?.bigIdea ||
    blueprint.ideation?.essentialQuestion ||
    blueprint.ideation?.challenge
  );

  const hasJourney = !!blueprint.journey?.phases?.length;
  const hasDeliverables = !!(
    blueprint.deliverables?.milestones?.length ||
    blueprint.deliverables?.artifacts?.length
  );

  return hasIdeation || hasJourney || hasDeliverables;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useStageController({
  projectId,
  stage,
  blueprint,
  onBlueprintUpdate
}: UseStageControllerProps): UseStageControllerReturn {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Refs for debouncing and cleanup
  const saveTimerRef = useRef<number | null>(null);
  const storage = useRef(UnifiedStorageManager.getInstance());
  const stageViewTrackedRef = useRef(false);

  // =========================================================================
  // Telemetry: Track stage view (once per mount)
  // =========================================================================

  useEffect(() => {
    if (!stageViewTrackedRef.current) {
      telemetry.track('stage_viewed', {
        stage,
        projectId,
        hasExistingData: !!blueprint
      });
      stageViewTrackedRef.current = true;
    }
  }, [stage, projectId, blueprint]);

  // =========================================================================
  // Cleanup timer on unmount
  // =========================================================================

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // =========================================================================
  // Debounced Autosave (500-800ms)
  // =========================================================================

  const debouncedSave = useCallback(
    (updates: Partial<UnifiedProjectData>) => {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new timer (600ms - middle of 500-800ms range)
      saveTimerRef.current = window.setTimeout(async () => {
        // Merge updates with current blueprint
        const updatedBlueprint = {
          ...blueprint,
          ...updates,
          id: projectId,
          updatedAt: new Date()
        } as UnifiedProjectData;

        // Empty-save guard: Don't save if no substantive content
        if (!hasSubstantiveChanges(updatedBlueprint)) {
          console.log('[StageController] Skipping empty save (no substantive content)');
          return;
        }

        setIsSaving(true);

        try {
          await storage.current.saveProject(updatedBlueprint);

          console.log(`[StageController] Autosaved ${stage} stage`);

          // Track telemetry
          telemetry.track('stage_autosave', {
            stage,
            projectId,
            hasContent: hasSubstantiveChanges(updatedBlueprint)
          });

          // Notify parent of update
          if (onBlueprintUpdate) {
            onBlueprintUpdate(updatedBlueprint);
          }
        } catch (error) {
          console.error('[StageController] Autosave failed', error);
          // Don't throw - autosave failures shouldn't break UX
        } finally {
          setIsSaving(false);
        }
      }, 600); // 600ms debounce
    },
    [blueprint, projectId, stage, onBlueprintUpdate]
  );

  // =========================================================================
  // Stage Gating: Validate current stage completion
  // =========================================================================

  const canCompleteStage = useCallback((): boolean => {
    if (!blueprint) {
      setValidationError('No project data available');
      return false;
    }

    // Special case: Review stage doesn't need validation
    if (stage === 'review') {
      setValidationError(null);
      return true;
    }

    // Build CapturedData from blueprint
    const captured: CapturedData = {
      ideation: {
        bigIdea: blueprint.ideation?.bigIdea,
        essentialQuestion: blueprint.ideation?.essentialQuestion,
        challenge: blueprint.ideation?.challenge
      },
      journey: {
        phases: blueprint.journey?.phases || [],
        resources: blueprint.journey?.resources || []
      },
      deliverables: {
        milestones: blueprint.deliverables?.milestones || [],
        artifacts: blueprint.deliverables?.artifacts || [],
        rubric: blueprint.deliverables?.rubric || { criteria: [] }
      }
    };

    // Special case for ideation: validate all three fields
    if (stage === 'ideation') {
      const bigIdeaValid = validate('BIG_IDEA' as any, captured);
      const eqValid = validate('ESSENTIAL_QUESTION' as any, captured);
      const challengeValid = validate('CHALLENGE' as any, captured);

      if (!bigIdeaValid.ok) {
        setValidationError(bigIdeaValid.reason || 'Big Idea incomplete');
        return false;
      }
      if (!eqValid.ok) {
        setValidationError(eqValid.reason || 'Essential Question incomplete');
        return false;
      }
      if (!challengeValid.ok) {
        setValidationError(challengeValid.reason || 'Challenge incomplete');
        return false;
      }

      setValidationError(null);
      return true;
    }

    // Map our StageId to ChatMVP Stage format for other stages
    const chatMvpStage = STAGE_TO_CHATMVP_STAGE[stage];

    if (!chatMvpStage) {
      console.error('[StageController] Unknown stage:', stage);
      setValidationError('Unknown stage');
      return false;
    }

    // Use existing validation from stages.ts
    const validation = validate(chatMvpStage as any, captured);

    if (!validation.ok) {
      setValidationError(validation.reason || 'Validation failed');
      return false;
    }

    setValidationError(null);
    return true;
  }, [blueprint, stage]);

  // =========================================================================
  // Save and Continue Later (route to dashboard)
  // =========================================================================

  const saveAndContinueLater = useCallback(async () => {
    // Cancel any pending autosave
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    if (!blueprint) {
      console.warn('[StageController] No blueprint to save');
      navigate('/app/dashboard');
      return;
    }

    // Empty-save guard
    if (!hasSubstantiveChanges(blueprint)) {
      console.log('[StageController] Skipping save (no substantive content)');
      navigate('/app/dashboard');
      return;
    }

    setIsSaving(true);

    try {
      // Derive current stage status
      const { stageStatus } = deriveStageStatus(blueprint);

      // Mark current stage as in_progress
      stageStatus[stage] = 'in_progress';

      const updated: UnifiedProjectData = {
        ...blueprint,
        currentStage: stage,
        stageStatus,
        updatedAt: new Date()
      };

      await storage.current.saveProject(updated);

      telemetry.track('save_and_continue_later', {
        stage,
        projectId
      });

      console.log(`[StageController] Saved and continuing later from ${stage}`);

      // Route to dashboard
      navigate('/app/dashboard');
    } catch (error) {
      console.error('[StageController] Save failed', error);
      // Still navigate to dashboard even if save fails (local-first)
      navigate('/app/dashboard');
    } finally {
      setIsSaving(false);
    }
  }, [blueprint, stage, projectId, navigate]);

  // =========================================================================
  // Complete Stage and Transition
  // =========================================================================

  const completeStage = useCallback(
    async (explicitNextStage?: StageId) => {
      // Cancel any pending autosave
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (!blueprint) {
        console.error('[StageController] No blueprint to complete');
        return;
      }

      // Validate before allowing transition
      if (!canCompleteStage()) {
        console.warn('[StageController] Cannot complete stage - validation failed');
        return;
      }

      setIsSaving(true);

      try {
        // Derive current stage status
        const { stageStatus } = deriveStageStatus(blueprint);

        // Mark current stage as complete
        stageStatus[stage] = 'complete';

        // Determine next stage
        const nextStage = explicitNextStage || getNextStage(stage);

        if (!nextStage) {
          console.error('[StageController] No next stage available');
          return;
        }

        // Mark next stage as in_progress (unless it's review)
        if (nextStage !== 'review') {
          stageStatus[nextStage] = 'in_progress';
        }

        // Build updated blueprint
        const updated: UnifiedProjectData = {
          ...blueprint,
          currentStage: nextStage,
          stageStatus,
          updatedAt: new Date(),
          // Set completedAt if moving to review
          ...(nextStage === 'review' && { completedAt: new Date() })
        };

        // Persist to storage
        await storage.current.saveProject(updated);

        // Track telemetry
        telemetry.track('stage_completed', {
          stage,
          nextStage,
          projectId,
          timeInStage: Date.now() - (blueprint.updatedAt?.getTime() || Date.now())
        });

        console.log(`[StageController] Completed ${stage}, transitioning to ${nextStage}`);

        // Notify parent of update
        if (onBlueprintUpdate) {
          onBlueprintUpdate(updated);
        }

        // Route to next stage
        const routePath = getStageRoute(projectId, nextStage);
        navigate(routePath);
      } catch (error) {
        console.error('[StageController] Stage transition failed', error);
      } finally {
        setIsSaving(false);
      }
    },
    [blueprint, stage, projectId, navigate, canCompleteStage, onBlueprintUpdate]
  );

  // =========================================================================
  // Return API
  // =========================================================================

  return {
    isSaving,
    debouncedSave,
    saveAndContinueLater,
    completeStage,
    canCompleteStage,
    validationError
  };
}

// Export telemetry service for testing
export { TelemetryService, telemetry };
