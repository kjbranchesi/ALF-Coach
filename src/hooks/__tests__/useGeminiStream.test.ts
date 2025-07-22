import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeminiStream } from '../useGeminiStream';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContentStream: jest.fn()
    })
  }))
}));

describe('useGeminiStream', () => {
  let mockGenerateContentStream: jest.Mock;
  let mockModel: any;
  let mockGenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGenerateContentStream = jest.fn();
    mockModel = {
      generateContentStream: mockGenerateContentStream
    };
    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    };
    
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => mockGenAI);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeminiStream());

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.response).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.suggestions).toEqual([]);
  });

  it('should handle successful streaming', async () => {
    const mockChunks = [
      { text: () => 'Hello ' },
      { text: () => 'world!' },
      { text: () => ' [SUGGESTIONS: Continue, Learn more, Skip]' }
    ];

    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      }
    };

    mockGenerateContentStream.mockResolvedValue({
      stream: mockStream
    });

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.response).toBe('Hello world! [SUGGESTIONS: Continue, Learn more, Skip]');
      expect(result.current.suggestions).toEqual(['Continue', 'Learn more', 'Skip']);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should extract suggestions from response', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => 'Here is the response. [SUGGESTIONS: Option 1, Option 2, Option 3]' };
      }
    };

    mockGenerateContentStream.mockResolvedValue({
      stream: mockStream
    });

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(['Option 1', 'Option 2', 'Option 3']);
    });
  });

  it('should handle single suggestion format', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => 'Response text [SUGGESTION: Single option]' };
      }
    };

    mockGenerateContentStream.mockResolvedValue({
      stream: mockStream
    });

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(['Single option']);
    });
  });

  it('should handle streaming errors', async () => {
    const mockError = new Error('API Error');
    mockGenerateContentStream.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to generate response. Please try again.');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.response).toBe('');
    });
  });

  it('should handle empty prompts', async () => {
    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('');
    });

    expect(mockGenerateContentStream).not.toHaveBeenCalled();
    expect(result.current.isStreaming).toBe(false);
  });

  it('should set isStreaming during operation', async () => {
    let resolveStream: (value: any) => void;
    const streamPromise = new Promise((resolve) => {
      resolveStream = resolve;
    });

    mockGenerateContentStream.mockReturnValue(streamPromise);

    const { result } = renderHook(() => useGeminiStream());

    // Start streaming
    act(() => {
      result.current.streamResponse('Test prompt');
    });

    // Check streaming state
    expect(result.current.isStreaming).toBe(true);

    // Resolve the stream
    await act(async () => {
      resolveStream!({
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Response' };
          }
        }
      });
    });

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
    });
  });

  it('should handle multiple sequential calls', async () => {
    const createMockStream = (text: string) => ({
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => text };
      }
    });

    mockGenerateContentStream
      .mockResolvedValueOnce({ stream: createMockStream('First response') })
      .mockResolvedValueOnce({ stream: createMockStream('Second response') });

    const { result } = renderHook(() => useGeminiStream());

    // First call
    await act(async () => {
      await result.current.streamResponse('First prompt');
    });

    expect(result.current.response).toBe('First response');

    // Second call
    await act(async () => {
      await result.current.streamResponse('Second prompt');
    });

    expect(result.current.response).toBe('Second response');
    expect(mockGenerateContentStream).toHaveBeenCalledTimes(2);
  });

  it('should handle system prompts correctly', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => 'Response' };
      }
    };

    mockGenerateContentStream.mockResolvedValue({ stream: mockStream });

    const { result } = renderHook(() => useGeminiStream());

    const systemPrompt = 'You are a helpful assistant';
    await act(async () => {
      await result.current.streamResponse('User prompt', systemPrompt);
    });

    expect(mockGenerateContentStream).toHaveBeenCalledWith([
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I\\'ll help you with that.' }] },
      { role: 'user', parts: [{ text: 'User prompt' }] }
    ]);
  });

  it('should handle malformed suggestions gracefully', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => 'Response [SUGGESTIONS: , , Invalid,, ,]' };
      }
    };

    mockGenerateContentStream.mockResolvedValue({ stream: mockStream });

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(['Invalid']);
    });
  });

  it('should handle chunks without text method', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => 'Valid chunk' };
        yield {}; // Invalid chunk
        yield { text: () => ' continues' };
      }
    };

    mockGenerateContentStream.mockResolvedValue({ stream: mockStream });

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.response).toBe('Valid chunk continues');
      expect(result.current.error).toBeNull();
    });
  });

  it('should reset error state on new request', async () => {
    // First request fails
    mockGenerateContentStream.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useGeminiStream());

    await act(async () => {
      await result.current.streamResponse('First prompt');
    });

    expect(result.current.error).toBeTruthy();

    // Second request succeeds
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { text: () => 'Success' };
      }
    };
    mockGenerateContentStream.mockResolvedValueOnce({ stream: mockStream });

    await act(async () => {
      await result.current.streamResponse('Second prompt');
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.response).toBe('Success');
    });
  });
});