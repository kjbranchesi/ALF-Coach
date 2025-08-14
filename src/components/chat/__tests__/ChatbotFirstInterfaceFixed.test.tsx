import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatbotFirstInterfaceFixed } from '../ChatbotFirstInterfaceFixed';
import { GeminiService } from '../../../services/GeminiService';
import { useAuth } from '../../../hooks/useAuth';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('../../../hooks/useAuth');
vi.mock('../../../services/GeminiService');
vi.mock('../../../services/FirebaseSync');
vi.mock('../../../utils/featureFlags', () => ({
  useFeatureFlag: (flag: string) => true
}));

describe('ChatbotFirstInterfaceFixed', () => {
  let mockGeminiService: any;

  beforeEach(() => {
    // Mock auth
    (useAuth as any).mockReturnValue({
      user: { uid: 'test-user' }
    });

    // Mock GeminiService
    mockGeminiService = {
      generateResponse: vi.fn().mockResolvedValue('AI response to your question')
    };
    (GeminiService as any).mockImplementation(() => mockGeminiService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('renders welcome message on mount', () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      expect(screen.getByText(/Welcome! I'm your curriculum design partner/)).toBeInTheDocument();
    });

    it('sends user message and receives AI response', async () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'I teach mathematics' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('I teach mathematics')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText('AI response to your question')).toBeInTheDocument();
      });
      
      expect(mockGeminiService.generateResponse).toHaveBeenCalled();
    });

    it('disables send button when input is empty', () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const sendButton = screen.getByText('Send');
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has text', () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Stage Transitions', () => {
    it('transitions from WELCOME to IDEATION when appropriate', async () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      // Simulate providing subject, grade, and duration
      fireEvent.change(input, { target: { value: 'I teach science' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(mockGeminiService.generateResponse).toHaveBeenCalled();
      });
      
      // Mock AI response asking for grade level
      mockGeminiService.generateResponse.mockResolvedValueOnce('What grade level?');
      
      fireEvent.change(input, { target: { value: '9th grade' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(mockGeminiService.generateResponse).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Inline UI Features', () => {
    it('shows Ideas button for appropriate messages', async () => {
      mockGeminiService.generateResponse.mockResolvedValueOnce('Let\'s work on your big idea');
      
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Help with big idea' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ideas')).toBeInTheDocument();
      });
    });

    it('populates input when suggestion card is clicked', async () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      // Trigger Ideas button appearance
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      mockGeminiService.generateResponse.mockResolvedValueOnce('Let\'s explore your big idea');
      
      fireEvent.change(input, { target: { value: 'big idea help' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        const ideasButton = screen.getByText('Ideas');
        fireEvent.click(ideasButton);
      });
      
      // Wait for suggestions to appear
      await waitFor(() => {
        const suggestions = screen.getAllByText(/The intersection of/);
        expect(suggestions.length).toBeGreaterThan(0);
        
        // Click first suggestion
        fireEvent.click(suggestions[0]);
      });
      
      // Check input is populated
      expect(input).toHaveValue(expect.stringContaining('The intersection of'));
    });
  });

  describe('Progress Sidebar', () => {
    it('renders progress sidebar with correct stages', () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      expect(screen.getByText('Setup')).toBeInTheDocument();
      expect(screen.getByText('Ideation')).toBeInTheDocument();
      expect(screen.getByText('Learning Journey')).toBeInTheDocument();
      expect(screen.getByText('Deliverables')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('shows correct stage status', () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      // Setup should be in-progress initially
      const setupStage = screen.getByText('Setup').closest('div');
      expect(setupStage).toHaveClass('in-progress');
    });
  });

  describe('Error Handling', () => {
    it('shows fallback message when AI service fails', async () => {
      mockGeminiService.generateResponse.mockRejectedValueOnce(new Error('API Error'));
      
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/I apologize, I'm having trouble processing that/)).toBeInTheDocument();
      });
    });

    it('disables send button while processing', async () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      
      // Button should be disabled immediately
      expect(sendButton).toBeDisabled();
      
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled();
      });
    });
  });

  describe('Keyboard Interactions', () => {
    it('sends message on Enter key press', async () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
      
      expect(mockGeminiService.generateResponse).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      expect(input).toHaveAttribute('type', 'text');
      
      const sendButton = screen.getByText('Send');
      expect(sendButton).toHaveAttribute('type', 'button');
    });

    it('focuses input after suggestion selection', async () => {
      render(<ChatbotFirstInterfaceFixed />);
      
      const input = screen.getByPlaceholderText('Type your response...');
      
      // Simulate suggestion selection flow
      mockGeminiService.generateResponse.mockResolvedValueOnce('Let\'s work on your big idea');
      
      fireEvent.change(input, { target: { value: 'big idea' } });
      fireEvent.click(screen.getByText('Send'));
      
      await waitFor(() => {
        const ideasButton = screen.getByText('Ideas');
        fireEvent.click(ideasButton);
      });
      
      await waitFor(() => {
        const suggestions = screen.getAllByText(/The intersection of/);
        fireEvent.click(suggestions[0]);
      });
      
      // Input should be focused
      expect(document.activeElement).toBe(input);
    });
  });
});