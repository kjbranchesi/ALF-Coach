// ChatV6.integration.test.tsx - Integration tests for complete chat workflows
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ChatV6 from '../ChatV6';

// Mock successful AI responses for complete workflow
const mockAIResponses = [
  'Excellent! "Climate action and sustainability" is a powerful big idea that resonates with students. This connects to their future and empowers them to make a difference. Would you like to refine this concept or shall we move on to crafting an essential question?',
  'Great essential question! "How might we reduce our carbon footprint in our community?" is open-ended and action-oriented. It invites students to think critically and creatively. Ready to define the authentic challenge?',
  'Perfect! Having students "Create a sustainability action plan for our school" is an authentic, meaningful challenge. They\'ll apply their learning to make real change. Let\'s move to designing the learning journey!'
];

let responseIndex = 0;

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockImplementation(() => {
        const response = mockAIResponses[responseIndex % mockAIResponses.length];
        responseIndex++;
        return Promise.resolve({
          response: {
            text: () => response
          }
        });
      })
    })
  }))
}));

jest.mock('../../utils/environment', () => ({
  isDevelopment: () => false,
  isDebugEnabled: () => false
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('ChatV6 Integration Tests', () => {
  const mockProps = {
    projectId: 'test-123',
    projectData: {
      subject: 'Science',
      ageGroup: '6th Grade',
      stage: 'ideation' as const,
      capturedData: {}
    },
    onStageComplete: jest.fn(),
    onDataCapture: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    responseIndex = 0;
  });

  describe('Complete Ideation Stage Flow', () => {
    it('should complete full ideation stage with all three steps', async () => {
      const user = userEvent.setup();
      render(<ChatV6 {...mockProps} />);

      // Step 1: Welcome → Big Idea
      expect(screen.getByText(/Welcome! I'm excited to help you design/)).toBeInTheDocument();
      
      fireEvent.click(screen.getByText("Let's get started!"));
      await waitFor(() => {
        expect(screen.getByText(/big idea/i)).toBeInTheDocument();
      });

      // Submit big idea
      const input = screen.getByPlaceholderText('Share your ideas...');
      await user.type(input, 'Climate action and sustainability');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Verify AI response and data capture
      await waitFor(() => {
        expect(screen.getByText(/Excellent! "Climate action and sustainability"/)).toBeInTheDocument();
        expect(mockProps.onDataCapture).toHaveBeenCalledWith(
          'ideation.bigIdea',
          'Climate action and sustainability'
        );
      });

      // Step 2: Big Idea → Essential Question
      fireEvent.click(screen.getByText('Continue to next step'));
      await waitFor(() => {
        expect(screen.getByText(/essential question/i)).toBeInTheDocument();
      });

      // Submit essential question
      await user.clear(input);
      await user.type(input, 'How might we reduce our carbon footprint in our community?');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText(/Great essential question!/)).toBeInTheDocument();
        expect(mockProps.onDataCapture).toHaveBeenCalledWith(
          'ideation.essentialQuestion',
          'How might we reduce our carbon footprint in our community?'
        );
      });

      // Step 3: Essential Question → Challenge
      fireEvent.click(screen.getByText('Continue to next step'));
      await waitFor(() => {
        expect(screen.getByText(/authentic challenge/i)).toBeInTheDocument();
      });

      // Submit challenge
      await user.clear(input);
      await user.type(input, 'Create a sustainability action plan for our school');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText(/Perfect! Having students/)).toBeInTheDocument();
        expect(mockProps.onDataCapture).toHaveBeenCalledWith(
          'ideation.challenge',
          'Create a sustainability action plan for our school'
        );
      });

      // Verify stage completion
      fireEvent.click(screen.getByText('Continue to next step'));
      await waitFor(() => {
        expect(mockProps.onStageComplete).toHaveBeenCalledWith('journey');
      });
    });
  });

  describe('Refinement Flow', () => {
    it('should allow users to refine their inputs', async () => {
      const user = userEvent.setup();
      render(<ChatV6 {...mockProps} />);

      // Navigate to big idea
      fireEvent.click(screen.getByText("Let's get started!"));
      
      // Submit initial idea
      const input = screen.getByPlaceholderText('Share your ideas...');
      await user.type(input, 'Climate change');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Choose to refine
      await waitFor(() => {
        fireEvent.click(screen.getByText("Let's refine this"));
      });

      // Submit refined version
      await user.clear(input);
      await user.type(input, 'Climate action and community sustainability');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Verify refinement was processed
      await waitFor(() => {
        expect(screen.getByText('Climate action and community sustainability')).toBeInTheDocument();
      });
    });
  });

  describe('Suggestion Selection Flow', () => {
    it('should handle suggestion clicks as user input', async () => {
      render(<ChatV6 {...mockProps} />);

      // Navigate to a step with suggestions
      fireEvent.click(screen.getByText("Let's get started!"));

      await waitFor(() => {
        expect(screen.getByText('Ideas to consider:')).toBeInTheDocument();
      });

      // Click a suggestion
      const suggestion = screen.getByText(/Environmental sustainability in our community/);
      fireEvent.click(suggestion);

      // Verify it was treated as user input
      await waitFor(() => {
        expect(screen.getByText('Environmental sustainability in our community')).toBeInTheDocument();
        expect(mockProps.onDataCapture).toHaveBeenCalled();
      });
    });
  });

  describe('Error Recovery Flow', () => {
    it('should recover from errors and continue workflow', async () => {
      const user = userEvent.setup();
      
      // Mock one failure followed by success
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      let callCount = 0;
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.reject(new Error('API Error'));
            }
            return Promise.resolve({
              response: {
                text: () => 'Great idea! Let\'s continue working on this.'
              }
            });
          })
        })
      }));

      render(<ChatV6 {...mockProps} />);

      // Trigger error
      const input = screen.getByPlaceholderText('Share your ideas...');
      await user.type(input, 'Test idea');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/encountered an issue/)).toBeInTheDocument();
      });

      // Click recovery button
      fireEvent.click(screen.getByText("Let's continue"));

      // Try again
      await user.clear(input);
      await user.type(input, 'Climate action');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Verify recovery
      await waitFor(() => {
        expect(screen.getByText(/Great idea!/)).toBeInTheDocument();
      });
    });
  });

  describe('Stage Transition Flow', () => {
    it('should transition between stages correctly', async () => {
      // Start with journey stage
      const journeyProps = {
        ...mockProps,
        projectData: {
          ...mockProps.projectData,
          stage: 'journey' as const,
          capturedData: {
            'ideation.bigIdea': 'Climate action',
            'ideation.essentialQuestion': 'How might we help?',
            'ideation.challenge': 'Create action plan'
          }
        }
      };

      render(<ChatV6 {...journeyProps} />);

      // Verify journey welcome message
      await waitFor(() => {
        expect(screen.getByText(/Great ideation work!/)).toBeInTheDocument();
        expect(screen.getByText(/learning journey/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence Flow', () => {
    it('should maintain conversation context across interactions', async () => {
      const user = userEvent.setup();
      render(<ChatV6 {...mockProps} />);

      // Have a conversation
      fireEvent.click(screen.getByText("Let's get started!"));
      
      const input = screen.getByPlaceholderText('Share your ideas...');
      await user.type(input, 'First idea about climate');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('First idea about climate')).toBeInTheDocument();
      });

      // Continue conversation
      await user.clear(input);
      await user.type(input, 'Building on that, focusing on renewable energy');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Verify both messages are visible (context maintained)
      await waitFor(() => {
        expect(screen.getByText('First idea about climate')).toBeInTheDocument();
        expect(screen.getByText('Building on that, focusing on renewable energy')).toBeInTheDocument();
      });
    });
  });

  describe('ALF Framework Information', () => {
    it('should provide correct ALF information when requested', async () => {
      render(<ChatV6 {...mockProps} />);

      fireEvent.click(screen.getByText("Tell me more about ALF"));

      await waitFor(() => {
        const alfContent = screen.getByText(/Active Learning Framework/);
        expect(alfContent).toBeInTheDocument();
        
        // Verify all three stages are mentioned
        expect(screen.getByText(/Ideation/)).toBeInTheDocument();
        expect(screen.getByText(/Learning Journey/)).toBeInTheDocument();
        expect(screen.getByText(/Deliverables/)).toBeInTheDocument();
        
        // Verify no Apple/CBL references
        const allText = alfContent.textContent || '';
        expect(allText).not.toContain('Apple');
        expect(allText).not.toContain('CBL');
        expect(allText).not.toContain('Challenge Based Learning');
      });
    });
  });
});