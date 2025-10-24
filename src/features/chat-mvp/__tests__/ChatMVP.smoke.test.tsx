import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChatMVP from '../../chat-mvp/ChatMVP';

// Stub AI calls to avoid network in tests
jest.mock('../../chat-mvp/domain/ai', () => ({
  generateAI: async () => '',
}));

// Provide a minimal, non-empty captured payload to bypass UnifiedStorage hydrator
const minimalCaptured = {
  ideation: {},
  journey: { phases: [], resources: [] },
  deliverables: { milestones: [], artifacts: [], rubric: { criteria: [] } },
};

describe('ChatMVP smoke', () => {
  it('renders Big Idea stage without crashing', () => {
    render(
      <MemoryRouter>
        <ChatMVP
          projectId="smoke-test"
          projectData={{
            wizardData: {
              projectTopic: 'Water quality',
              subjects: ['Science'],
              gradeLevel: 'Grade 8',
              duration: '3 weeks',
            },
            projectData: { status: 'draft' },
            capturedData: minimalCaptured,
          }}
        />
      </MemoryRouter>
    );

    // Initial stage should be Big Idea
    expect(screen.getByText(/Big Idea/i)).toBeInTheDocument();
  });
});

