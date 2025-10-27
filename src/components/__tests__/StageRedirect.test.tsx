/**
 * StageRedirect tests
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock react-router-dom pieces we need
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn(),
    useLocation: jest.fn(() => ({ search: '?subjects=science&ageGroup=Middle&duration=unit&topic=energy&projectName=Solar&intro=1' })),
    Navigate: ({ to }: { to: string }) => <div data-testid="nav" data-to={to} />,
  };
});

// Mock auth
jest.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { isAnonymous: true }, userId: null })
}));

// Mock storage
const mockSave = jest.fn();
const mockLoad = jest.fn();
jest.mock('../../services/UnifiedStorageManager', () => ({
  UnifiedStorageManager: {
    getInstance: () => ({ saveProject: mockSave, loadProject: mockLoad })
  }
}));

import { useParams } from 'react-router-dom';
import { StageRedirect } from '../StageRedirect';

describe('StageRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mints a real project from new-* and redirects to ideation preserving intro', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'new-12345', projectId: undefined });
    mockLoad.mockResolvedValue(null);
    mockSave.mockResolvedValue('bp_1');

    render(<StageRedirect />);

    const nav = await screen.findByTestId('nav');
    const to = nav.getAttribute('data-to') || '';
    expect(to).toMatch(/\/app\/projects\/bp_/);
    expect(to).toMatch(/\/ideation\?intro=1$/);
    expect(mockSave).toHaveBeenCalled();
  });

  it('redirects existing project to current stage route', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'bp_abc', projectId: undefined });
    mockLoad.mockResolvedValue({ id: 'bp_abc', ideation: { bigIdea: 'X', essentialQuestion: 'Y', challenge: 'Z' }, journey: { phases: [{ id: '1', name: 'Phase 1', activities: [] }, { id: '2', name: 'Phase 2', activities: [] }, { id: '3', name: 'Phase 3', activities: [] }] }, deliverables: {} });

    render(<StageRedirect />);
    const nav = await screen.findByTestId('nav');
    const to = nav.getAttribute('data-to') || '';
    expect(to).toBe('/app/projects/bp_abc/deliverables');
  });

  it('redirects to dashboard when project is missing', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'bp_missing', projectId: undefined });
    mockLoad.mockResolvedValue(null);

    render(<StageRedirect />);
    const nav = await screen.findByTestId('nav');
    const to = nav.getAttribute('data-to') || '';
    expect(to).toBe('/app/dashboard');
  });
});

