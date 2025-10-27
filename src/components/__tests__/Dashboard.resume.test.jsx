/**
 * Dashboard header resume CTA tests
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock telemetry
const mockTrack = jest.fn();
jest.mock('../../features/builder/useStageController', () => ({
  telemetry: { track: (...args) => mockTrack(...args) }
}));

// Mock repo to return one in-progress project
jest.mock('../../services/ProjectRepository', () => ({
  projectRepository: {
    list: jest.fn(async () => ([{
      id: 'p1',
      title: 'Solar Project',
      updatedAt: new Date().toISOString(),
      // minimal shape used by deriveStageStatus
      ideation: { bigIdea: 'X', essentialQuestion: 'Y', challenge: 'Z' },
      journey: { phases: [{ id: '1', name: 'P1', activities: [] }, { id: '2', name: 'P2', activities: [] }, { id: '3', name: 'P3', activities: [] }] },
      deliverables: {}
    }])),
    cleanupEmptyProjects: jest.fn(async () => 0),
    purgeExpiredDeleted: jest.fn(async () => undefined),
  }
}));

jest.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ userId: 'u1', user: { isAnonymous: false } })
}));

import Dashboard from '../Dashboard';

describe('Dashboard header resume CTA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks resume_click and navigates to the correct stage', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const btn = await screen.findByRole('button', { name: /Resume most recent project/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockTrack).toHaveBeenCalledWith('resume_click', expect.objectContaining({
        projectId: 'p1',
        stage: 'deliverables'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/app/projects/p1/deliverables');
    });
  });
});

