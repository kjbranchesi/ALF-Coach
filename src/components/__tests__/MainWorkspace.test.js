import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainWorkspace from '../MainWorkspace';
import { useAppContext } from '../../context/AppContext';

// Mock the context
jest.mock('../../context/AppContext');
jest.mock('remark-gfm', () => ({
  default: () => {},
  __esModule: true,
}));
jest.mock('../../firebase/firebase', () => ({
  db: {},
}));
jest.mock('../../services/geminiService', () => ({
  generateJsonResponse: jest.fn(),
}));

describe('MainWorkspace', () => {
  beforeEach(() => {
    useAppContext.mockReturnValue({
      selectedProjectId: null,
      navigateTo: jest.fn(),
      advanceProjectStage: jest.fn(),
    });
  });

  test('redirects to dashboard when no project is selected', () => {
    const mockNavigateTo = jest.fn();
    useAppContext.mockReturnValue({
      selectedProjectId: null,
      navigateTo: mockNavigateTo,
      advanceProjectStage: jest.fn(),
    });

    render(<MainWorkspace />);
    
    expect(mockNavigateTo).toHaveBeenCalledWith('dashboard');
  });

  test('shows loading state initially', () => {
    useAppContext.mockReturnValue({
      selectedProjectId: 'test-project',
      navigateTo: jest.fn(),
      advanceProjectStage: jest.fn(),
    });

    render(<MainWorkspace />);
    
    expect(screen.getByText('Loading ProjectCraft...')).toBeInTheDocument();
  });
});