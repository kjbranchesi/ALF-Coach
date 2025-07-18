import { validateResponse } from '../responseValidator';

describe('responseValidator', () => {
  test('validates a correct response structure', () => {
    const validResponse = {
      interactionType: 'Welcome',
      currentStage: 'Ideation',
      chatResponse: 'Hello! Welcome to ProjectCraft.',
      isStageComplete: false,
      buttons: ['Get Started', 'Learn More'],
      suggestions: null,
      summary: null,
      recap: null,
      process: null,
      frameworkOverview: null,
    };

    const result = validateResponse(validResponse, 'Ideation');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('catches missing required fields', () => {
    const invalidResponse = {
      interactionType: 'Welcome',
      // missing currentStage and chatResponse
      isStageComplete: false,
    };

    const result = validateResponse(invalidResponse, 'Ideation');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('handles empty chatResponse', () => {
    const responseWithEmptyChat = {
      interactionType: 'Welcome',
      currentStage: 'Ideation',
      chatResponse: '',
      isStageComplete: false,
    };

    const result = validateResponse(responseWithEmptyChat, 'Ideation');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('chatResponse'))).toBe(true);
  });
});