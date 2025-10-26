/**
 * Tests for useStageController hook
 */

import React, { type ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useStageController, TelemetryService } from '../useStageController';
import { UnifiedStorageManager } from '../../../services/UnifiedStorageManager';
import type { UnifiedProjectData } from '../../../services/UnifiedStorageManager';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Create a mock storage manager
const mockSaveProject = jest.fn();
const mockStorageInstance = {
  saveProject: mockSaveProject
};

jest.mock('../../../services/UnifiedStorageManager', () => ({
  UnifiedStorageManager: {
    getInstance: jest.fn(() => mockStorageInstance)
  }
}));

// Helper to create test blueprint
function createTestBlueprint(overrides: Partial<UnifiedProjectData> = {}): UnifiedProjectData {
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

// Wrapper for hook tests
const wrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useStageController', () => {
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    // Clear telemetry
    TelemetryService.getInstance().clearEvents();

    // Setup navigate mock
    mockNavigate = jest.fn();
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    // Reset saveProject mock
    mockSaveProject.mockClear().mockResolvedValue('test-project');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Initialization and Telemetry
  // ==========================================================================

  describe('initialization', () => {
    it('should track stage_viewed on mount', () => {
      const blueprint = createTestBlueprint();

      renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      const events = TelemetryService.getInstance().getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('stage_viewed');
      expect(events[0].properties).toMatchObject({
        stage: 'ideation',
        projectId: 'test-project',
        hasExistingData: true
      });
    });

    it('should return correct initial state', () => {
      const blueprint = createTestBlueprint();

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.isSaving).toBe(false);
      expect(result.current.validationError).toBe(null);
      expect(typeof result.current.debouncedSave).toBe('function');
      expect(typeof result.current.saveAndContinueLater).toBe('function');
      expect(typeof result.current.completeStage).toBe('function');
      expect(typeof result.current.canCompleteStage).toBe('function');
    });
  });

  // ==========================================================================
  // Debounced Autosave
  // ==========================================================================

  describe('debouncedSave', () => {
    it('should debounce save calls', async () => {
      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test Idea' }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      // Call multiple times rapidly
      act(() => {
        result.current.debouncedSave({ ideation: { bigIdea: 'Updated 1' } });
        result.current.debouncedSave({ ideation: { bigIdea: 'Updated 2' } });
        result.current.debouncedSave({ ideation: { bigIdea: 'Updated 3' } });
      });

      // Should only save once after debounce period
      await waitFor(() => {
        expect(mockSaveProject).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    it('should guard against empty saves', async () => {
      const emptyBlueprint = createTestBlueprint();

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint: emptyBlueprint
        }),
        { wrapper }
      );

      act(() => {
        result.current.debouncedSave({});
      });

      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 700));

      // Should not save empty project
      expect(mockSaveProject).not.toHaveBeenCalled();
    });

    it('should save when substantive content exists', async () => {
      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Meaningful content' }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      act(() => {
        result.current.debouncedSave({
          ideation: { bigIdea: 'Updated meaningful content' }
        });
      });

      await waitFor(() => {
        expect(mockSaveProject).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });

      const savedData = mockSaveProject.mock.calls[0][0];
      expect(savedData.ideation.bigIdea).toBe('Updated meaningful content');
      expect(savedData.updatedAt).toBeInstanceOf(Date);
    });

    it('should track stage_autosave telemetry', async () => {
      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test' }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      act(() => {
        result.current.debouncedSave({ ideation: { bigIdea: 'Updated' } });
      });

      await waitFor(() => {
        const events = TelemetryService.getInstance().getEvents();
        const autosaveEvent = events.find(e => e.event === 'stage_autosave');
        expect(autosaveEvent).toBeDefined();
        expect(autosaveEvent?.properties.stage).toBe('ideation');
      }, { timeout: 1000 });
    });
  });

  // ==========================================================================
  // Stage Gating / Validation
  // ==========================================================================

  describe('canCompleteStage', () => {
    it('should return false for incomplete ideation', () => {
      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test' } // Missing EQ and Challenge
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.canCompleteStage()).toBe(false);
      // Note: validationError may not be set immediately due to React state timing
    });

    it('should return true for complete ideation', () => {
      const blueprint = createTestBlueprint({
        ideation: {
          bigIdea: 'How systems change over time',
          essentialQuestion: 'How might we reduce local waste?',
          challenge: 'Design an evidence-based proposal for city council'
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.canCompleteStage()).toBe(true);
      expect(result.current.validationError).toBe(null);
    });

    it('should return false for journey with < 3 phases', () => {
      const blueprint = createTestBlueprint({
        ideation: {
          bigIdea: 'Test',
          essentialQuestion: 'Test?',
          challenge: 'Test challenge'
        },
        journey: {
          phases: [
            { id: '1', name: 'Phase 1', activities: ['Activity 1'] },
            { id: '2', name: 'Phase 2', activities: ['Activity 2'] }
          ],
          resources: []
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'journey',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.canCompleteStage()).toBe(false);
    });

    it('should return true for journey with >= 3 phases', () => {
      const blueprint = createTestBlueprint({
        journey: {
          phases: [
            { id: '1', name: 'Phase 1', activities: ['A1'] },
            { id: '2', name: 'Phase 2', activities: ['A2'] },
            { id: '3', name: 'Phase 3', activities: ['A3'] }
          ],
          resources: []
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'journey',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.canCompleteStage()).toBe(true);
    });

    it('should return false for incomplete deliverables', () => {
      const blueprint = createTestBlueprint({
        deliverables: {
          milestones: [{ name: 'M1' }, { name: 'M2' }], // Only 2, need 3+
          artifacts: [{ name: 'A1' }],
          rubric: { criteria: ['C1', 'C2', 'C3'] }
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'deliverables',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.canCompleteStage()).toBe(false);
    });

    it('should return true for complete deliverables', () => {
      const blueprint = createTestBlueprint({
        deliverables: {
          milestones: [{ name: 'M1' }, { name: 'M2' }, { name: 'M3' }],
          artifacts: [{ name: 'A1' }],
          rubric: { criteria: ['C1', 'C2', 'C3'] }
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'deliverables',
          blueprint
        }),
        { wrapper }
      );

      expect(result.current.canCompleteStage()).toBe(true);
    });
  });

  // ==========================================================================
  // Save and Continue Later
  // ==========================================================================

  describe('saveAndContinueLater', () => {
    it('should save and navigate to dashboard', async () => {
      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test' }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.saveAndContinueLater();
      });

      expect(mockSaveProject).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard');

      const savedData = mockSaveProject.mock.calls[0][0];
      expect(savedData.currentStage).toBe('ideation');
      expect(savedData.stageStatus?.ideation).toBe('in_progress');
    });

    it('should track save_and_continue_later telemetry', async () => {
      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test' }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.saveAndContinueLater();
      });

      const events = TelemetryService.getInstance().getEvents();
      const saveEvent = events.find(e => e.event === 'save_and_continue_later');
      expect(saveEvent).toBeDefined();
      expect(saveEvent?.properties.stage).toBe('ideation');
    });

    it('should not save empty projects', async () => {
      const emptyBlueprint = createTestBlueprint();

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint: emptyBlueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.saveAndContinueLater();
      });

      expect(mockSaveProject).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard');
    });
  });

  // ==========================================================================
  // Stage Completion and Transitions
  // ==========================================================================

  describe('completeStage', () => {
    it('should complete ideation and transition to journey', async () => {
      const blueprint = createTestBlueprint({
        ideation: {
          bigIdea: 'How systems change over time',
          essentialQuestion: 'How might we reduce local waste?',
          challenge: 'Design an evidence-based proposal for city council'
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.completeStage();
      });

      expect(mockSaveProject).toHaveBeenCalledTimes(1);

      const savedData = mockSaveProject.mock.calls[0][0];
      expect(savedData.currentStage).toBe('journey');
      expect(savedData.stageStatus?.ideation).toBe('complete');
      expect(savedData.stageStatus?.journey).toBe('in_progress');
      expect(savedData.updatedAt).toBeInstanceOf(Date);

      expect(mockNavigate).toHaveBeenCalledWith('/app/projects/test-project/journey');
    });

    it('should complete journey and transition to deliverables', async () => {
      const blueprint = createTestBlueprint({
        journey: {
          phases: [
            { id: '1', name: 'Phase 1', activities: ['A1'] },
            { id: '2', name: 'Phase 2', activities: ['A2'] },
            { id: '3', name: 'Phase 3', activities: ['A3'] }
          ],
          resources: []
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'journey',
          blueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.completeStage();
      });

      const savedData = mockSaveProject.mock.calls[0][0];
      expect(savedData.currentStage).toBe('deliverables');
      expect(savedData.stageStatus?.journey).toBe('complete');
      expect(savedData.stageStatus?.deliverables).toBe('in_progress');

      expect(mockNavigate).toHaveBeenCalledWith('/app/projects/test-project/deliverables');
    });

    it('should set completedAt when transitioning to review', async () => {
      const blueprint = createTestBlueprint({
        deliverables: {
          milestones: [{ name: 'M1' }, { name: 'M2' }, { name: 'M3' }],
          artifacts: [{ name: 'A1' }],
          rubric: { criteria: ['C1', 'C2', 'C3'] }
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'deliverables',
          blueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.completeStage();
      });

      const savedData = mockSaveProject.mock.calls[0][0];
      expect(savedData.currentStage).toBe('review');
      expect(savedData.completedAt).toBeInstanceOf(Date);

      expect(mockNavigate).toHaveBeenCalledWith('/app/project/test-project/preview');
    });

    it('should not complete if validation fails', async () => {
      const incompleteBlueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test' } // Missing EQ and Challenge
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint: incompleteBlueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.completeStage();
      });

      expect(mockSaveProject).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should track stage_completed telemetry', async () => {
      const blueprint = createTestBlueprint({
        ideation: {
          bigIdea: 'Test idea here',
          essentialQuestion: 'Test question?',
          challenge: 'Test challenge here'
        }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      await act(async () => {
        await result.current.completeStage();
      });

      // Wait for telemetry to be tracked
      await waitFor(() => {
        const events = TelemetryService.getInstance().getEvents();
        const completeEvent = events.find(e => e.event === 'stage_completed');
        expect(completeEvent).toBeDefined();
        if (completeEvent) {
          expect(completeEvent.properties).toMatchObject({
            stage: 'ideation',
            nextStage: 'journey',
            projectId: 'test-project'
          });
        }
      });
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('error handling', () => {
    it('should handle save failures gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSaveProject.mockRejectedValueOnce(new Error('Save failed'));

      const blueprint = createTestBlueprint({
        ideation: { bigIdea: 'Test' }
      });

      const { result } = renderHook(
        () => useStageController({
          projectId: 'test-project',
          stage: 'ideation',
          blueprint
        }),
        { wrapper }
      );

      act(() => {
        result.current.debouncedSave({ ideation: { bigIdea: 'Updated' } });
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Hook should still be functional after error
      expect(result.current.isSaving).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });
});
