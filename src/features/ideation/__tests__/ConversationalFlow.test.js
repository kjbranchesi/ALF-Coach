// ConversationalFlow.test.js - Comprehensive tests for ideation conversation flow

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationalIdeationEnhanced } from '../ConversationalIdeationEnhanced';
import { BlueprintProvider } from '../../../context/BlueprintContext';
import { processSuggestionClick, isSuggestionClick } from '../../../utils/onboardingProcessor';

// Mock dependencies
jest.mock('../../../services/geminiService');
jest.mock('../../../lib/markdown');

describe('Conversational Ideation Flow', () => {
  const mockProjectInfo = {
    subject: 'Urban Planning',
    ageGroup: '17-year-olds',
    projectScope: 'Multi-week Unit',
    educatorPerspective: 'Sustainable city design'
  };

  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  const renderComponent = () => {
    return render(
      <BlueprintProvider>
        <ConversationalIdeationEnhanced
          projectInfo={mockProjectInfo}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      </BlueprintProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Button Click Detection', () => {
    test('should correctly identify suggestion clicks', () => {
      const testCases = [
        { input: 'Get Ideas', expected: true },
        { input: 'See Examples', expected: true },
        { input: 'The Future of Urban Spaces', expected: true },
        { input: 'Regular user input', expected: false },
        { input: 'I need help with my project', expected: false }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(isSuggestionClick(input)).toBe(expected);
      });
    });

    test('should extract correct values from suggestions', () => {
      const testCases = [
        {
          input: 'How about exploring "Innovation in Our Community"?',
          expected: { type: 'suggestion-selected', value: 'Innovation in Our Community' }
        },
        {
          input: 'Get Ideas',
          expected: { type: 'command', command: 'get-ideas' }
        },
        {
          input: 'Cities as Living Systems',
          expected: { type: 'suggestion-selected', value: 'Cities as Living Systems' }
        },
        {
          input: 'Show me what would change',
          expected: { type: 'command', command: 'show-changes' }
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = processSuggestionClick(input);
        expect(result.type).toBe(expected.type);
        if (expected.value) {
          expect(result.value).toBe(expected.value);
        }
        if (expected.command) {
          expect(result.command).toBe(expected.command);
        }
      });
    });
  });

  describe('Big Idea Step', () => {
    test('should display initial prompt correctly', () => {
      renderComponent();
      
      expect(screen.getByText(/I'm excited to help you design a meaningful Urban Planning project!/)).toBeInTheDocument();
      expect(screen.getByText(/What broad concept or theme do you want your 17-year-olds to explore?/)).toBeInTheDocument();
    });

    test('should not accept empty Big Idea', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText(/Share your big idea/);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.click(sendButton);

      expect(screen.queryByText(/Excellent!/)).not.toBeInTheDocument();
    });

    test('should accept valid Big Idea and progress', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText(/Share your big idea/);
      
      await userEvent.type(input, 'Sustainable Urban Development');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/Excellent! "Sustainable Urban Development" is a powerful theme/)).toBeInTheDocument();
      });
    });

    test('should handle suggestion button clicks correctly', async () => {
      renderComponent();
      
      // Find and click a suggestion button
      const suggestionButton = screen.getByText(/Cities as Living Systems/);
      await userEvent.click(suggestionButton);

      await waitFor(() => {
        // Should see the value in the progress sidebar
        expect(screen.getByText(/"Cities as Living Systems"/)).toBeInTheDocument();
      });
    });
  });

  describe('Essential Question Step', () => {
    test('should validate essential question format', async () => {
      renderComponent();
      
      // First, set a Big Idea
      const input = screen.getByPlaceholderText(/Share your big idea/);
      await userEvent.type(input, 'Sustainable Cities');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      // Wait for Essential Question prompt
      await waitFor(() => {
        expect(screen.getByText(/Now let's craft an Essential Question/)).toBeInTheDocument();
      });

      // Try invalid format
      await userEvent.clear(input);
      await userEvent.type(input, 'Cities are important');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/Essential Questions should start with How, Why, What/)).toBeInTheDocument();
      });
    });

    test('should accept valid essential question', async () => {
      renderComponent();
      
      // Set up Big Idea first
      const input = screen.getByPlaceholderText(/Share your big idea/);
      await userEvent.type(input, 'Sustainable Cities');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      // Enter valid Essential Question
      await userEvent.clear(input);
      await userEvent.type(input, 'How can we design cities that thrive sustainably?');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/Perfect! Your essential question/)).toBeInTheDocument();
      });
    });
  });

  describe('Help Requests', () => {
    test('should recognize help requests', async () => {
      renderComponent();
      const input = screen.getByPlaceholderText(/Share your big idea/);
      
      const helpPhrases = [
        'help me',
        'okay please do',
        'can you suggest something',
        'I need help'
      ];

      for (const phrase of helpPhrases) {
        await userEvent.clear(input);
        await userEvent.type(input, phrase);
        await userEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => {
          expect(screen.getByText(/Of course! I'd love to help/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Edit Functionality', () => {
    test('should allow editing previous values', async () => {
      renderComponent();
      
      // Set a Big Idea
      const input = screen.getByPlaceholderText(/Share your big idea/);
      await userEvent.type(input, 'Original Big Idea');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      // Wait for it to appear in progress
      await waitFor(() => {
        expect(screen.getByText(/"Original Big Idea"/)).toBeInTheDocument();
      });

      // Click Edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText(/Let's refine your Big Idea/)).toBeInTheDocument();
        expect(screen.getByText(/Current value: "Original Big Idea"/)).toBeInTheDocument();
      });
    });
  });

  describe('Consistency Checks', () => {
    test('should trigger consistency check when updating existing value', async () => {
      renderComponent();
      
      // Set initial values
      const input = screen.getByPlaceholderText(/Share your big idea/);
      await userEvent.type(input, 'First Big Idea');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      // Go back and edit
      const editButton = await screen.findByRole('button', { name: /edit/i });
      await userEvent.click(editButton);

      // Enter new value
      await userEvent.clear(input);
      await userEvent.type(input, 'Updated Big Idea');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/I notice you're refining your bigIdea/)).toBeInTheDocument();
      });
    });
  });

  describe('Progress Tracking', () => {
    test('should update progress sidebar in real-time', async () => {
      renderComponent();
      
      // Check initial state
      expect(screen.getByText('0/3 Complete')).toBeInTheDocument();

      // Complete Big Idea
      const input = screen.getByPlaceholderText(/Share your big idea/);
      await userEvent.type(input, 'Test Big Idea');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText('1/3 Complete')).toBeInTheDocument();
      });
    });
  });

  describe('Button Styles and Commands', () => {
    test('should apply correct styles to different button types', () => {
      renderComponent();
      
      // Help buttons should have gray styling
      const helpButton = screen.getByText('Get Ideas');
      expect(helpButton).toHaveClass('bg-gray-50');
      
      // Primary action buttons should have blue styling
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderComponent();
      
      const input = screen.getByPlaceholderText(/Share your big idea/);
      await userEvent.type(input, 'Test Input');
      await userEvent.click(screen.getByRole('button', { name: /send/i }));

      // Should show fallback message
      await waitFor(() => {
        expect(screen.getByText(/Let me suggest some options/)).toBeInTheDocument();
      });
    });
  });
});