/**
 * CompletedProjectsGallery tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import CompletedProjectsGallery from '../CompletedProjectsGallery.jsx';

describe('CompletedProjectsGallery', () => {
  it('renders and navigates to /app/completed when View All clicked', () => {
    const projects = new Array(5).fill(0).map((_, i) => ({
      id: `c${i+1}`,
      title: `Completed ${i+1}`,
      updatedAt: new Date(),
      wizardData: { primarySubject: 'science' },
      status: 'ready'
    }));

    render(<CompletedProjectsGallery projects={projects} />);

    const btn = screen.getByText(/View All/i);
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/app/completed');
  });
});

