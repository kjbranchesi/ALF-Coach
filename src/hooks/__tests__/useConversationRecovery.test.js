import { renderHook, act } from '@testing-library/react';
import { useConversationRecovery } from '../useConversationRecovery';

describe('useConversationRecovery', () => {
  let mockSetMessages;
  
  beforeEach(() => {
    mockSetMessages = jest.fn();
  });

  it('should validate correct AI response structure', () => {
    const { result } = renderHook(() => 
      useConversationRecovery({}, mockSetMessages, 'Ideation')
    );
    
    const validResponse = {
      chatResponse: 'Test response',
      currentStep: 'bigIdea',
      interactionType: 'conversationalIdeation'
    };
    
    expect(() => result.current.validateAiResponse(validResponse)).not.toThrow();
  });

  it('should reject AI response with missing fields', () => {
    const { result } = renderHook(() => 
      useConversationRecovery({}, mockSetMessages, 'Ideation')
    );
    
    const invalidResponse = {
      chatResponse: 'Test response'
      // Missing currentStep and interactionType
    };
    
    expect(() => result.current.validateAiResponse(invalidResponse))
      .toThrow('Invalid AI response: missing currentStep, interactionType');
  });

  it('should reject AI response with wrong interaction type', () => {
    const { result } = renderHook(() => 
      useConversationRecovery({}, mockSetMessages, 'Ideation')
    );
    
    const wrongTypeResponse = {
      chatResponse: 'Test response',
      currentStep: 'bigIdea',
      interactionType: 'conversationalJourney' // Wrong type
    };
    
    expect(() => result.current.validateAiResponse(wrongTypeResponse))
      .toThrow('Wrong interaction type: expected conversationalIdeation, got conversationalJourney');
  });

  it('should save valid state checkpoints', () => {
    const { result } = renderHook(() => 
      useConversationRecovery({}, mockSetMessages, 'Ideation')
    );
    
    const testState = {
      ideationData: { bigIdea: 'Test Idea' },
      currentStep: 'bigIdea',
      messages: []
    };
    
    act(() => {
      result.current.saveCheckpoint(testState);
    });
    
    expect(result.current.getErrorCount()).toBe(0);
  });

  it('should attempt recovery on first error', () => {
    const { result } = renderHook(() => 
      useConversationRecovery({}, mockSetMessages, 'Ideation')
    );
    
    // Save a checkpoint first
    const testState = {
      ideationData: { bigIdea: 'Test Idea' },
      currentStep: 'bigIdea',
      messages: []
    };
    
    act(() => {
      result.current.saveCheckpoint(testState);
    });
    
    // Trigger recovery
    act(() => {
      const recovered = result.current.recoverFromError(new Error('Test error'), 'test message');
      expect(recovered).toBe(true);
    });
    
    expect(mockSetMessages).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should suggest restart after repeated failures', () => {
    const { result } = renderHook(() => 
      useConversationRecovery({}, mockSetMessages, 'Ideation')
    );
    
    // Trigger multiple errors without valid checkpoints
    act(() => {
      result.current.recoverFromError(new Error('Error 1'), 'message 1');
      result.current.recoverFromError(new Error('Error 2'), 'message 2');  
      const recovered = result.current.recoverFromError(new Error('Error 3'), 'message 3');
      expect(recovered).toBe(false);
    });
    
    expect(result.current.getErrorCount()).toBe(3);
    expect(mockSetMessages).toHaveBeenCalledTimes(3);
  });
});