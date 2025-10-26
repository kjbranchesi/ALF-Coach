/**
 * Stage Status Derivation Utility
 *
 * Derives currentStage and stageStatus from blueprint data.
 * Wraps existing computeStageProgress() logic and provides
 * the format needed for the segmented builder flow.
 */

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
 * Derives stage status from blueprint data.
 *
 * If currentStage and stageStatus are already stored in the blueprint,
 * returns those values. Otherwise, computes from ideation/journey/deliverables data.
 *
 * @param blueprint - The project blueprint data
 * @returns Object with currentStage and stageStatus
 */
export function deriveStageStatus(blueprint: UnifiedProjectData): DerivedStageStatus {
  // If already computed and stored, use it
  if (blueprint.currentStage && blueprint.stageStatus) {
    return {
      currentStage: blueprint.currentStage,
      stageStatus: blueprint.stageStatus
    };
  }

  // Otherwise, compute from data using existing logic
  const { stages } = computeStageProgress(blueprint);

  const ideationStage = stages.find(s => s.id === 'ideation');
  const journeyStage = stages.find(s => s.id === 'journey');
  const deliverablesStage = stages.find(s => s.id === 'deliverables');

  const stageStatus = {
    ideation: mapStatus(ideationStage?.status),
    journey: mapStatus(journeyStage?.status),
    deliverables: mapStatus(deliverablesStage?.status)
  };

  // Determine current stage based on completion and progress
  let currentStage: StageId = 'ideation';

  // If project is completed or deliverables are done, show review
  if (blueprint.completedAt || deliverablesStage?.status === 'completed') {
    currentStage = 'review';
  }
  // If deliverables are in progress or journey is complete, go to deliverables
  else if (stageStatus.deliverables === 'in_progress' || stageStatus.journey === 'complete') {
    currentStage = 'deliverables';
  }
  // If journey is in progress or ideation is complete, go to journey
  else if (stageStatus.journey === 'in_progress' || stageStatus.ideation === 'complete') {
    currentStage = 'journey';
  }
  // Otherwise, stay in ideation
  else {
    currentStage = 'ideation';
  }

  return { currentStage, stageStatus };
}

/**
 * Maps existing stage status format to our stageStatus format
 */
function mapStatus(status?: string): StageStatusValue {
  if (status === 'completed') return 'complete';
  if (status === 'in-progress') return 'in_progress';
  return 'not_started';
}

/**
 * Helper to check if a stage is complete
 */
export function isStageComplete(blueprint: UnifiedProjectData, stage: StageId): boolean {
  const { stageStatus } = deriveStageStatus(blueprint);

  if (stage === 'review') {
    return !!blueprint.completedAt;
  }

  return stageStatus[stage as keyof typeof stageStatus] === 'complete';
}

/**
 * Helper to get the next stage in the sequence
 */
export function getNextStage(currentStage: StageId): StageId | null {
  const sequence: StageId[] = ['ideation', 'journey', 'deliverables', 'review'];
  const currentIndex = sequence.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null; // Already at the end
  }

  return sequence[currentIndex + 1];
}

/**
 * Helper to get the route path for a stage
 */
export function getStageRoute(projectId: string, stage: StageId): string {
  if (stage === 'review') {
    return `/app/project/${projectId}/preview`;
  }
  return `/app/projects/${projectId}/${stage}`;
}
