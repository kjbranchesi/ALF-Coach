/**
 * DeliverablesStage tests
 * - Verifies debouncedSave payload shape on edits
 * - Verifies finalize calls completeStage when gating passes
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock useStageController to isolate component behavior
const mockDebouncedSave = jest.fn();
const mockSaveAndExit = jest.fn();
const mockComplete = jest.fn();
const mockCanComplete = jest.fn(() => false);

jest.mock('../useStageController', () => ({
  useStageController: () => ({
    isSaving: false,
    debouncedSave: mockDebouncedSave,
    saveAndContinueLater: mockSaveAndExit,
    completeStage: mockComplete,
    canCompleteStage: mockCanComplete,
    validationError: null,
  }),
  telemetry: { track: jest.fn(), getEvents: jest.fn(() => []), clearEvents: jest.fn() }
}));

// Mock storage load for initial blueprint
jest.mock('../../../services/UnifiedStorageManager', () => ({
  UnifiedStorageManager: {
    getInstance: () => ({
      loadProject: async () => ({ id: 'p1', title: 'Test', deliverables: {} })
    })
  }
}));

import { DeliverablesStage } from '../DeliverablesStage';

function renderWithRoute(path = '/app/projects/p1/deliverables') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/projects/:id/deliverables" element={<DeliverablesStage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeliverablesStage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls debouncedSave with milestone update', async () => {
    renderWithRoute();

    // There are seeded 3 milestone inputs; select the first one
    const textboxes = await screen.findAllByRole('textbox');
    // First textbox corresponds to first milestone name given current layout
    fireEvent.change(textboxes[0], { target: { value: 'Research complete' } });

    await waitFor(() => expect(mockDebouncedSave).toHaveBeenCalled());
    const payload = mockDebouncedSave.mock.calls[0][0];
    expect(payload.deliverables).toBeDefined();
    expect(payload.deliverables.milestones[0].name).toBe('Research complete');
  });

  it('finalizes when canCompleteStage is true', async () => {
    (mockCanComplete as jest.Mock).mockReturnValue(true);

    renderWithRoute();

    const finalizeBtn = await screen.findByRole('button', { name: /Finalize & Review/i });
    fireEvent.click(finalizeBtn);

    await waitFor(() => expect(mockComplete).toHaveBeenCalledWith('review'));
  });
});

