/**
 * Tests for stage status derivation logic
 */

import {
  deriveStageStatus,
  isStageComplete,
  getNextStage,
  getStageRoute,
  type StageId
} from '../stageStatus';
import type { UnifiedProjectData } from '../../services/UnifiedStorageManager';

// Helper to create a minimal blueprint for testing
function createBlueprint(overrides: Partial<UnifiedProjectData> = {}): UnifiedProjectData {
  return {
    id: 'test-project',
    userId: 'test-user',
    title: 'Test Project',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    syncStatus: 'local',
    ...overrides
  } as UnifiedProjectData;
}

describe('deriveStageStatus', () => {
  describe('when blueprint has no data', () => {
    it('should default to ideation stage with not_started status', () => {
      const blueprint = createBlueprint();
      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('ideation');
      expect(result.stageStatus.ideation).toBe('not_started');
      expect(result.stageStatus.journey).toBe('not_started');
      expect(result.stageStatus.deliverables).toBe('not_started');
    });
  });

  describe('when blueprint has stored stage data', () => {
    it('should use stored currentStage and stageStatus', () => {
      const blueprint = createBlueprint({
        currentStage: 'journey',
        stageStatus: {
          ideation: 'complete',
          journey: 'in_progress',
          deliverables: 'not_started'
        }
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('journey');
      expect(result.stageStatus.ideation).toBe('complete');
      expect(result.stageStatus.journey).toBe('in_progress');
      expect(result.stageStatus.deliverables).toBe('not_started');
    });
  });

  describe('when computing from ideation data', () => {
    it('should mark ideation as in_progress when bigIdea exists', () => {
      const blueprint = createBlueprint({
        ideation: {
          bigIdea: 'Community Garden Project'
        }
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('ideation');
      expect(result.stageStatus.ideation).toBe('in_progress');
    });

    it('should mark ideation as complete and advance to journey when all fields exist', () => {
      const blueprint = createBlueprint({
        ideation: {
          bigIdea: 'Community Garden Project',
          essentialQuestion: 'How can we sustain our community?',
          challenge: 'Design and build a community garden'
        }
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('journey');
      expect(result.stageStatus.ideation).toBe('complete');
      expect(result.stageStatus.journey).toBe('not_started');
    });
  });

  describe('when computing from journey data', () => {
    it('should be in journey stage when journey has phases', () => {
      const blueprint = createBlueprint({
        ideation: {
          bigIdea: 'Test',
          essentialQuestion: 'Test?',
          challenge: 'Test challenge'
        },
        journey: {
          phases: [
            { id: '1', title: 'Phase 1', description: 'Test phase' }
          ]
        }
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('journey');
      expect(result.stageStatus.ideation).toBe('complete');
      expect(result.stageStatus.journey).toBe('in_progress');
    });

    it('should advance to deliverables when journey is complete', () => {
      const blueprint = createBlueprint({
        ideation: {
          bigIdea: 'Test',
          essentialQuestion: 'Test?',
          challenge: 'Test challenge'
        },
        journey: {
          phases: [
            { id: '1', title: 'Phase 1', description: 'Test' },
            { id: '2', title: 'Phase 2', description: 'Test' },
            { id: '3', title: 'Phase 3', description: 'Test' }
          ],
          activities: [{ id: '1', title: 'Activity 1' }],
          resources: [{ id: '1', title: 'Resource 1' }]
        }
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('deliverables');
      expect(result.stageStatus.journey).toBe('complete');
    });
  });

  describe('when computing from deliverables data', () => {
    it('should be in deliverables stage when deliverables exist', () => {
      const blueprint = createBlueprint({
        ideation: {
          bigIdea: 'Test',
          essentialQuestion: 'Test?',
          challenge: 'Test'
        },
        journey: {
          phases: [{ id: '1', title: 'Phase 1', description: 'Test' }],
          activities: [{ id: '1', title: 'Activity 1' }],
          resources: [{ id: '1', title: 'Resource 1' }]
        },
        deliverables: {
          milestones: [
            { id: '1', title: 'Milestone 1' },
            { id: '2', title: 'Milestone 2' },
            { id: '3', title: 'Milestone 3' }
          ]
        }
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('deliverables');
      expect(result.stageStatus.deliverables).toBe('in_progress');
    });

    it('should advance to review when project is completed', () => {
      const blueprint = createBlueprint({
        ideation: {
          bigIdea: 'Test',
          essentialQuestion: 'Test?',
          challenge: 'Test'
        },
        journey: {
          phases: [{ id: '1', title: 'Phase 1', description: 'Test' }],
          activities: [{ id: '1', title: 'Activity 1' }],
          resources: [{ id: '1', title: 'Resource 1' }]
        },
        deliverables: {
          milestones: [
            { id: '1', title: 'M1' },
            { id: '2', title: 'M2' },
            { id: '3', title: 'M3' }
          ],
          rubric: {
            criteria: [{ id: '1', description: 'Criteria 1' }]
          },
          impact: {
            audience: 'Community',
            method: 'Exhibition'
          }
        },
        completedAt: new Date()
      });

      const result = deriveStageStatus(blueprint);

      expect(result.currentStage).toBe('review');
      expect(result.stageStatus.deliverables).toBe('complete');
    });
  });
});

describe('isStageComplete', () => {
  it('should return false for incomplete ideation', () => {
    const blueprint = createBlueprint({
      ideation: { bigIdea: 'Test' }
    });

    expect(isStageComplete(blueprint, 'ideation')).toBe(false);
  });

  it('should return true for complete ideation', () => {
    const blueprint = createBlueprint({
      ideation: {
        bigIdea: 'Test',
        essentialQuestion: 'Test?',
        challenge: 'Test challenge'
      }
    });

    expect(isStageComplete(blueprint, 'ideation')).toBe(true);
  });

  it('should return true for review if project has completedAt', () => {
    const blueprint = createBlueprint({
      completedAt: new Date()
    });

    expect(isStageComplete(blueprint, 'review')).toBe(true);
  });

  it('should return false for review if project is not completed', () => {
    const blueprint = createBlueprint({
      ideation: { bigIdea: 'Test' }
    });

    expect(isStageComplete(blueprint, 'review')).toBe(false);
  });
});

describe('getNextStage', () => {
  it('should return journey after ideation', () => {
    expect(getNextStage('ideation')).toBe('journey');
  });

  it('should return deliverables after journey', () => {
    expect(getNextStage('journey')).toBe('deliverables');
  });

  it('should return review after deliverables', () => {
    expect(getNextStage('deliverables')).toBe('review');
  });

  it('should return null after review (end of sequence)', () => {
    expect(getNextStage('review')).toBe(null);
  });
});

describe('getStageRoute', () => {
  const projectId = 'test-123';

  it('should return ideation route', () => {
    expect(getStageRoute(projectId, 'ideation')).toBe('/app/projects/test-123/ideation');
  });

  it('should return journey route', () => {
    expect(getStageRoute(projectId, 'journey')).toBe('/app/projects/test-123/journey');
  });

  it('should return deliverables route', () => {
    expect(getStageRoute(projectId, 'deliverables')).toBe('/app/projects/test-123/deliverables');
  });

  it('should return preview route for review stage', () => {
    expect(getStageRoute(projectId, 'review')).toBe('/app/project/test-123/preview');
  });
});
