/**
 * Dashboard empty-state tests
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mocks
jest.mock('../../services/ProjectRepository', () => ({
  projectRepository: {
    list: jest.fn(async () => []),
    cleanupEmptyProjects: jest.fn(async () => 0),
    purgeExpiredDeleted: jest.fn(async () => undefined),
  }
}));

jest.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ userId: 'test-user', user: { isAnonymous: false } })
}));

import Dashboard from '../Dashboard';

describe('Dashboard empty state', () => {
  it('shows workflow indicator and get started panel when there are no projects', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for empty state to render
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    // Workflow indicator region
    expect(screen.getByRole('region', { name: /Project workflow stages/i })).toBeInTheDocument();

    // Get Started panel elements
    expect(screen.getByRole('region', { name: /Get started/i })).toBeInTheDocument();
    expect(screen.getByText(/Ideation \(5–10 min\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Journey \(20–45 min\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Deliverables \(15–30 min\)/i)).toBeInTheDocument();
  });
});

