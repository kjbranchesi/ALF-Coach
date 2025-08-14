/**
 * StageInitiatorCards.test.tsx
 * Tests for the stage initiator cards component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StageInitiatorCards } from '../StageInitiatorCards';

describe('StageInitiatorCards Component', () => {
  const mockOnCardClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cards for WELCOME stage', () => {
    render(
      <StageInitiatorCards
        currentStage="WELCOME"
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Big Idea Starter')).toBeInTheDocument();
    expect(screen.getByText('Essential Question Builder')).toBeInTheDocument();
  });

  it('renders cards for IDEATION stage', () => {
    render(
      <StageInitiatorCards
        currentStage="IDEATION"
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('Big Idea Starter')).toBeInTheDocument();
    expect(screen.getByText('Essential Question Builder')).toBeInTheDocument();
    expect(screen.getByText('Challenge Designer')).toBeInTheDocument();
  });

  it('renders cards for JOURNEY stage', () => {
    render(
      <StageInitiatorCards
        currentStage="JOURNEY"
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('Phase Timeline Creator')).toBeInTheDocument();
    expect(screen.getByText('Challenge Designer')).toBeInTheDocument();
  });

  it('calls onCardClick when card is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <StageInitiatorCards
        currentStage="WELCOME"
        onCardClick={mockOnCardClick}
      />
    );

    const bigIdeaCard = screen.getByText('Big Idea Starter').closest('button');
    expect(bigIdeaCard).toBeInTheDocument();
    
    if (bigIdeaCard) {
      await user.click(bigIdeaCard);
      expect(mockOnCardClick).toHaveBeenCalledWith(
        expect.stringContaining('I want to explore a big idea around [topic]')
      );
    }
  });

  it('displays appropriate examples for each card', () => {
    render(
      <StageInitiatorCards
        currentStage="IDEATION"
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('e.g., "Climate change impacts on our local community"')).toBeInTheDocument();
    expect(screen.getByText('e.g., "How might we reduce our school\'s environmental impact?"')).toBeInTheDocument();
  });

  it('renders nothing for stages without cards', () => {
    const { container } = render(
      <StageInitiatorCards
        currentStage="COMPLETE"
        onCardClick={mockOnCardClick}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StageInitiatorCards
        currentStage="WELCOME"
        onCardClick={mockOnCardClick}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays help text', () => {
    render(
      <StageInitiatorCards
        currentStage="WELCOME"
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText(/These prompts will help you get started/)).toBeInTheDocument();
  });

  it('shows different colored cards for different categories', () => {
    render(
      <StageInitiatorCards
        currentStage="IDEATION"
        onCardClick={mockOnCardClick}
      />
    );

    // Check that cards have different color classes
    const cards = screen.getAllByRole('button');
    expect(cards.length).toBeGreaterThan(1);
    
    // The cards should have different gradient backgrounds
    const cardHtml = cards.map(card => card.outerHTML);
    const hasBlueGradient = cardHtml.some(html => html.includes('from-blue-50'));
    const hasOrangeGradient = cardHtml.some(html => html.includes('from-orange-50'));
    const hasPurpleGradient = cardHtml.some(html => html.includes('from-purple-50'));
    
    // At least one of each color should be present for IDEATION stage
    expect(hasBlueGradient).toBe(true);
    expect(hasOrangeGradient).toBe(true);
    expect(hasPurpleGradient).toBe(true);
  });
});