/**
 * Dashboard.test.jsx
 *
 * Unit tests for Dashboard component Phase 3 functionality:
 * - Project grouping by stage
 * - Stage-aware routing
 * - Telemetry tracking
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { projectRepository } from '../../services/ProjectRepository';
import { telemetry } from '../../features/builder/useStageController';
import * as stageStatus from '../../utils/stageStatus';

// Mock dependencies
jest.mock('../../services/ProjectRepository', () => ({
  projectRepository: {
    list: jest.fn(),
    cleanupEmptyProjects: jest.fn(),
    purgeExpiredDeleted: jest.fn(),
    delete: jest.fn(),
    deleteAll: jest.fn(),
    listDeleted: jest.fn(),
    restore: jest.fn()
  }
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    userId: 'test-user-123',
    user: { isAnonymous: false }
  }))
}));

jest.mock('../../features/builder/useStageController', () => ({
  telemetry: {
    track: jest.fn(),
    getEvents: jest.fn(() => []),
    clearEvents: jest.fn()
  }
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Helper to create test project data
function createTestProject(overrides = {}) {
  return {
    id: 'test-project-1',
    title: 'Test Project',
    description: 'Test description',
    subject: 'Math',
    gradeBand: 'High School',
    duration: '2 weeks',
    updatedAt: new Date(),
    status: 'draft',
    stage: 'draft',
    ...overrides
  };
}

describe('Dashboard - Phase 3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    projectRepository.cleanupEmptyProjects.mockResolvedValue(0);
    projectRepository.purgeExpiredDeleted.mockResolvedValue();
  });

  describe('Project Grouping', () => {
    it('should group projects into Ideation column', async () => {
      const ideationProject = createTestProject({
        id: 'ideation-1',
        title: 'Ideation Project',
        ideation: {
          bigIdea: 'Test idea'
        },
        currentStage: 'ideation',
        stageStatus: {
          ideation: 'in_progress',
          journey: 'not_started',
          deliverables: 'not_started'
        }
      });

      projectRepository.list.mockResolvedValue([ideationProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Ideation')).toBeInTheDocument();
      });

      // Check count badge shows 1
      const ideationHeader = screen.getByText('Ideation').closest('div');
      expect(ideationHeader).toHaveTextContent('1');

      // Check project card is rendered
      expect(screen.getByText('Ideation Project')).toBeInTheDocument();
    });

    it('should group projects into Journey column', async () => {
      const journeyProject = createTestProject({
        id: 'journey-1',
        title: 'Journey Project',
        currentStage: 'journey',
        stageStatus: {
          ideation: 'complete',
          journey: 'in_progress',
          deliverables: 'not_started'
        },
        journey: {
          phases: [
            { title: 'Phase 1', duration: '1 week' },
            { title: 'Phase 2', duration: '1 week' },
            { title: 'Phase 3', duration: '1 week' }
          ]
        }
      });

      projectRepository.list.mockResolvedValue([journeyProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Journey')).toBeInTheDocument();
      });

      // Check count badge shows 1
      const journeyHeader = screen.getByText('Journey').closest('div');
      expect(journeyHeader).toHaveTextContent('1');

      // Check project card is rendered
      expect(screen.getByText('Journey Project')).toBeInTheDocument();
    });

    it('should group projects into Deliverables column', async () => {
      const deliverablesProject = createTestProject({
        id: 'deliverables-1',
        title: 'Deliverables Project',
        currentStage: 'deliverables',
        stageStatus: {
          ideation: 'complete',
          journey: 'complete',
          deliverables: 'in_progress'
        },
        deliverables: {
          milestones: [
            { title: 'M1', date: '2025-01-01' },
            { title: 'M2', date: '2025-01-15' },
            { title: 'M3', date: '2025-02-01' }
          ]
        }
      });

      projectRepository.list.mockResolvedValue([deliverablesProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deliverables')).toBeInTheDocument();
      });

      // Check count badge shows 1
      const deliverablesHeader = screen.getByText('Deliverables').closest('div');
      expect(deliverablesHeader).toHaveTextContent('1');

      // Check project card is rendered
      expect(screen.getByText('Deliverables Project')).toBeInTheDocument();
    });

    it('should group completed projects into Completed section', async () => {
      const completedProject = createTestProject({
        id: 'completed-1',
        title: 'Completed Project',
        currentStage: 'review',
        stageStatus: {
          ideation: 'complete',
          journey: 'complete',
          deliverables: 'complete'
        },
        completedAt: new Date()
      });

      projectRepository.list.mockResolvedValue([completedProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });

      // Check count badge shows "1 project"
      expect(screen.getByText('1 project')).toBeInTheDocument();

      // Check project card is rendered
      expect(screen.getByText('Completed Project')).toBeInTheDocument();
    });

    it('should correctly group multiple projects across stages', async () => {
      const projects = [
        createTestProject({
          id: 'ideation-1',
          title: 'Ideation 1',
          currentStage: 'ideation',
          stageStatus: { ideation: 'in_progress', journey: 'not_started', deliverables: 'not_started' }
        }),
        createTestProject({
          id: 'ideation-2',
          title: 'Ideation 2',
          currentStage: 'ideation',
          stageStatus: { ideation: 'in_progress', journey: 'not_started', deliverables: 'not_started' }
        }),
        createTestProject({
          id: 'journey-1',
          title: 'Journey 1',
          currentStage: 'journey',
          stageStatus: { ideation: 'complete', journey: 'in_progress', deliverables: 'not_started' }
        }),
        createTestProject({
          id: 'deliverables-1',
          title: 'Deliverables 1',
          currentStage: 'deliverables',
          stageStatus: { ideation: 'complete', journey: 'complete', deliverables: 'in_progress' }
        }),
        createTestProject({
          id: 'completed-1',
          title: 'Completed 1',
          currentStage: 'review',
          stageStatus: { ideation: 'complete', journey: 'complete', deliverables: 'complete' }
        })
      ];

      projectRepository.list.mockResolvedValue(projects);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Ideation 1')).toBeInTheDocument();
      });

      // Check counts
      const ideationHeader = screen.getByText('Ideation').closest('div');
      expect(ideationHeader).toHaveTextContent('2');

      const journeyHeader = screen.getByText('Journey').closest('div');
      expect(journeyHeader).toHaveTextContent('1');

      const deliverablesHeader = screen.getByText('Deliverables').closest('div');
      expect(deliverablesHeader).toHaveTextContent('1');

      expect(screen.getByText('1 project')).toBeInTheDocument();

      // Check all project titles are rendered
      expect(screen.getByText('Ideation 1')).toBeInTheDocument();
      expect(screen.getByText('Ideation 2')).toBeInTheDocument();
      expect(screen.getByText('Journey 1')).toBeInTheDocument();
      expect(screen.getByText('Deliverables 1')).toBeInTheDocument();
      expect(screen.getByText('Completed 1')).toBeInTheDocument();
    });

    it('should show empty state placeholders for empty columns', async () => {
      const ideationProject = createTestProject({
        id: 'ideation-1',
        title: 'Only Ideation',
        currentStage: 'ideation',
        stageStatus: { ideation: 'in_progress', journey: 'not_started', deliverables: 'not_started' }
      });

      projectRepository.list.mockResolvedValue([ideationProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Only Ideation')).toBeInTheDocument();
      });

      // Check empty state messages
      expect(screen.getByText('No projects in journey')).toBeInTheDocument();
      expect(screen.getByText('No projects in deliverables')).toBeInTheDocument();
    });
  });

  describe('Stage-Aware Routing', () => {
    it('should route to ideation stage for in-progress ideation projects', async () => {
      const ideationProject = createTestProject({
        id: 'ideation-1',
        title: 'Ideation Project',
        currentStage: 'ideation',
        stageStatus: { ideation: 'in_progress', journey: 'not_started', deliverables: 'not_started' }
      });

      projectRepository.list.mockResolvedValue([ideationProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Ideation Project')).toBeInTheDocument();
      });

      // Click the "Open" button
      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);

      // Should navigate to ideation stage route
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app/projects/ideation-1/ideation');
      });
    });

    it('should route to journey stage for in-progress journey projects', async () => {
      const journeyProject = createTestProject({
        id: 'journey-1',
        title: 'Journey Project',
        currentStage: 'journey',
        stageStatus: { ideation: 'complete', journey: 'in_progress', deliverables: 'not_started' }
      });

      projectRepository.list.mockResolvedValue([journeyProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Journey Project')).toBeInTheDocument();
      });

      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app/projects/journey-1/journey');
      });
    });

    it('should route to deliverables stage for in-progress deliverables projects', async () => {
      const deliverablesProject = createTestProject({
        id: 'deliverables-1',
        title: 'Deliverables Project',
        currentStage: 'deliverables',
        stageStatus: { ideation: 'complete', journey: 'complete', deliverables: 'in_progress' }
      });

      projectRepository.list.mockResolvedValue([deliverablesProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deliverables Project')).toBeInTheDocument();
      });

      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app/projects/deliverables-1/deliverables');
      });
    });

    it('should route to preview for completed projects', async () => {
      const completedProject = createTestProject({
        id: 'completed-1',
        title: 'Completed Project',
        currentStage: 'review',
        stageStatus: { ideation: 'complete', journey: 'complete', deliverables: 'complete' }
      });

      projectRepository.list.mockResolvedValue([completedProject]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Completed Project')).toBeInTheDocument();
      });

      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app/project/completed-1/preview');
      });
    });
  });

  describe('Telemetry Tracking', () => {
    it('should track resume_click event when opening a project', async () => {
      const project = createTestProject({
        id: 'test-project',
        title: 'Test Project',
        currentStage: 'ideation',
        stageStatus: { ideation: 'in_progress', journey: 'not_started', deliverables: 'not_started' }
      });

      projectRepository.list.mockResolvedValue([project]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });

      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(telemetry.track).toHaveBeenCalledWith('resume_click', {
          projectId: 'test-project',
          stage: 'ideation',
          stageStatus: 'in_progress'
        });
      });
    });

    it('should include correct stage info in telemetry for journey projects', async () => {
      const project = createTestProject({
        id: 'journey-project',
        currentStage: 'journey',
        stageStatus: { ideation: 'complete', journey: 'in_progress', deliverables: 'not_started' }
      });

      projectRepository.list.mockResolvedValue([project]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Open')).toBeInTheDocument();
      });

      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(telemetry.track).toHaveBeenCalledWith('resume_click', {
          projectId: 'journey-project',
          stage: 'journey',
          stageStatus: 'in_progress'
        });
      });
    });
  });

  describe('Empty States', () => {
    it('should show "No projects yet" when no projects exist', async () => {
      projectRepository.list.mockResolvedValue([]);

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
      });

      expect(screen.getByText('Start your first project to see it appear here.')).toBeInTheDocument();
    });

    it('should show loading state while fetching projects', () => {
      projectRepository.list.mockImplementation(() => new Promise(() => {}));

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      expect(screen.getByText('Loading your projects…')).toBeInTheDocument();
    });
  });
});
