// src/features/ideation/__tests__/ideationFlow.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IdeationWizard from '../IdeationWizard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

describe('IdeationWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWizard = () => {
    return render(
      <IdeationWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
  };

  test('renders initial step with Big Idea field', () => {
    renderWizard();
    
    expect(screen.getByText("Define Your Project Catalyst")).toBeInTheDocument();
    expect(screen.getByText("🧠 What's your Big Idea?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g., Sustainable Cities")).toBeInTheDocument();
    expect(screen.getByText("Next →")).toBeInTheDocument();
  });

  test('validates Big Idea field before proceeding', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    const nextButton = screen.getByText("Next →");
    await user.click(nextButton);
    
    expect(screen.getByText("Big Idea is required.")).toBeInTheDocument();
    expect(screen.getByText("🧠 What's your Big Idea?")).toBeInTheDocument(); // Still on step 1
  });

  test('proceeds to Essential Question step after entering Big Idea', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    await user.type(bigIdeaInput, "Renewable Energy");
    
    const nextButton = screen.getByText("Next →");
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText("❓ What's your Essential Question?")).toBeInTheDocument();
    });
  });

  test('auto-formats Essential Question with "How might we"', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Navigate to step 2
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    await user.type(bigIdeaInput, "Renewable Energy");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
      expect(essentialQuestionField).toBeInTheDocument();
    });
    
    const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
    await user.type(essentialQuestionField, "reduce energy consumption");
    await user.tab(); // Trigger onBlur
    
    expect(essentialQuestionField.value).toBe("How might we reduce energy consumption?");
  });

  test('proceeds to Challenge step after entering Essential Question', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Navigate through steps
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    await user.type(bigIdeaInput, "Renewable Energy");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
      expect(essentialQuestionField).toBeInTheDocument();
    });
    
    const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
    await user.type(essentialQuestionField, "How might we reduce energy consumption?");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      expect(screen.getByText("🎯 What's the Challenge?")).toBeInTheDocument();
    });
  });

  test('shows help examples when help button is clicked', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    const helpButton = screen.getByText("Need help? Show examples");
    await user.click(helpButton);
    
    expect(screen.getByText("Need inspiration? Try one of these:")).toBeInTheDocument();
    expect(screen.getByText("Sustainable Cities")).toBeInTheDocument();
  });

  test('selects example when clicked', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Show help examples
    const helpButton = screen.getByText("Need help? Show examples");
    await user.click(helpButton);
    
    // Click on an example
    const exampleButton = screen.getByText("Sustainable Cities");
    await user.click(exampleButton);
    
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    expect(bigIdeaInput.value).toBe("Sustainable Cities");
  });

  test('shows AI suggestions array with length >= 2 when "not sure" scenario', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Navigate to Essential Question step
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    await user.type(bigIdeaInput, "not sure");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
      expect(essentialQuestionField).toBeInTheDocument();
    });
    
    const helpButton = screen.getByText("Need help? Show examples");
    await user.click(helpButton);
    
    // Check that there are at least 2 example suggestions
    const examples = screen.getAllByRole('button').filter(button => 
      button.textContent.includes('How might we') || button.textContent.includes('How can we')
    );
    expect(examples.length).toBeGreaterThanOrEqual(2);
  });

  test('completes wizard and triggers onComplete with correct data', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Fill out all steps
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    await user.type(bigIdeaInput, "Renewable Energy");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
      expect(essentialQuestionField).toBeInTheDocument();
    });
    
    const essentialQuestionField = screen.getByPlaceholderText("How might we...?");
    await user.type(essentialQuestionField, "How might we reduce energy consumption?");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      const challengeField = screen.getByPlaceholderText("Try phrasing as an action statement...");
      expect(challengeField).toBeInTheDocument();
    });
    
    const challengeField = screen.getByPlaceholderText("Try phrasing as an action statement...");
    await user.type(challengeField, "Design a renewable energy system for our school");
    
    const finishButton = screen.getByText("Complete Ideation");
    await user.click(finishButton);
    
    // Wait for toast and completion
    await waitFor(() => {
      expect(screen.getByText("Ideation complete – moving to Learning Journey")).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Should call onComplete with the correct data after toast delay
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        bigIdea: "Renewable Energy",
        essentialQuestion: "How might we reduce energy consumption?",
        challenge: "Design a renewable energy system for our school"
      });
    }, { timeout: 3000 });
  });

  test('can navigate backward through steps', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    // Navigate forward to step 2
    const bigIdeaInput = screen.getByPlaceholderText("e.g., Sustainable Cities");
    await user.type(bigIdeaInput, "Renewable Energy");
    await user.click(screen.getByText("Next →"));
    
    await waitFor(() => {
      expect(screen.getByText("❓ What's your Essential Question?")).toBeInTheDocument();
    });
    
    // Navigate back to step 1
    const backButton = screen.getByText("← Back");
    await user.click(backButton);
    
    expect(screen.getByText("🧠 What's your Big Idea?")).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWizard();
    
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('step indicator shows correct current step', () => {
    renderWizard();
    
    // Check step indicator
    const stepIndicator = screen.getByText("Big Idea");
    expect(stepIndicator).toHaveClass("text-purple-700"); // Current step styling
  });
});