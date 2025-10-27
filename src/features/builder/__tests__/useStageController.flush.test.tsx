/**
 * Flush-on-transition tests for useStageController
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useStageController } from '../useStageController';
import type { UnifiedProjectData } from '../../../services/UnifiedStorageManager';

// Mock navigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock storage
const mockSave = jest.fn();
jest.mock('../../../services/UnifiedStorageManager', () => ({
  UnifiedStorageManager: {
    getInstance: () => ({ saveProject: mockSave })
  }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

function createBlueprint(overrides: Partial<UnifiedProjectData> = {}): UnifiedProjectData {
  return {
    id: 'p1',
    userId: 'u',
    title: 'T',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0',
    syncStatus: 'local',
    ideation: { bigIdea: 'A', essentialQuestion: 'B', challenge: 'C' },
    journey: { phases: [{ id: '1', name: 'P1', activities: [] }, { id: '2', name: 'P2', activities: [] }, { id: '3', name: 'P3', activities: [] }] },
    deliverables: { milestones: [{ id: 'm1', name: 'M1' }, { id: 'm2', name: 'M2' }, { id: 'm3', name: 'M3' }], artifacts: [{ id: 'a1', name: 'A1' }], rubric: { criteria: ['C1','C2','C3'] } },
    ...overrides
  } as UnifiedProjectData;
}

describe('useStageController - flush on transition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('flushes pending debouncedSave before completeStage', async () => {
    const blueprint = createBlueprint();
    const { result } = renderHook(() => useStageController({ projectId: 'p1', stage: 'ideation', blueprint }), { wrapper });

    act(() => {
      result.current.debouncedSave({ ideation: { ...blueprint.ideation, bigIdea: 'Updated' } });
    });

    // Without waiting 600ms, immediately complete stage
    await act(async () => {
      await result.current.completeStage('journey');
    });

    // Expect immediate save occurred with updated content
    expect(mockSave).toHaveBeenCalled();
    const saved = mockSave.mock.calls[0][0];
    expect(saved.ideation.bigIdea).toBe('Updated');
  });
});

