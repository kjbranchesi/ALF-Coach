// Streaming Response Handler for AI-generated content
// Provides real-time feedback during long AI operations

import React from 'react';
import { EventEmitter } from '../utils/event-emitter';

export interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  simulateTyping?: boolean;
  typingSpeed?: number; // ms per character
}

export class StreamingHandler extends EventEmitter {
  private buffer: string = '';
  private isStreaming: boolean = false;
  private abortController: AbortController | null = null;
  
  constructor(private options: StreamingOptions = {}) {
    super();
  }
  
  async streamResponse(
    generateFunction: () => Promise<string>,
    options?: Partial<StreamingOptions>
  ): Promise<string> {
    const opts = { ...this.options, ...options };
    this.buffer = '';
    this.isStreaming = true;
    this.abortController = new AbortController();
    
    try {
      // Start with typing indicator
      this.emit('start');
      
      // Generate the full response
      const fullResponse = await generateFunction();
      
      // Check if aborted
      if (this.abortController.signal.aborted) {
        throw new Error('Stream aborted');
      }
      
      if (opts.simulateTyping) {
        // Simulate typing effect
        await this.simulateTypingEffect(fullResponse, opts);
      } else {
        // Chunk the response for progressive rendering
        await this.chunkResponse(fullResponse, opts);
      }
      
      this.emit('complete', fullResponse);
      opts.onComplete?.(fullResponse);
      
      return fullResponse;
    } catch (error) {
      const err = error as Error;
      this.emit('error', err);
      opts.onError?.(err);
      throw err;
    } finally {
      this.isStreaming = false;
      this.abortController = null;
    }
  }
  
  private async simulateTypingEffect(
    text: string, 
    options: StreamingOptions
  ): Promise<void> {
    const words = text.split(' ');
    const baseSpeed = options.typingSpeed || 30;
    
    for (let i = 0; i < words.length; i++) {
      if (this.abortController?.signal.aborted) {break;}
      
      const word = words[i];
      const chunk = (i > 0 ? ' ' : '') + word;
      
      // Add word to buffer
      this.buffer += chunk;
      
      // Emit chunk
      this.emit('chunk', chunk, this.buffer);
      options.onChunk?.(chunk);
      
      // Variable delay for natural feel
      const delay = baseSpeed + Math.random() * baseSpeed * 0.5;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  private async chunkResponse(
    text: string,
    options: StreamingOptions
  ): Promise<void> {
    // Split into sentences or logical chunks
    const chunks = this.createLogicalChunks(text);
    
    for (const chunk of chunks) {
      if (this.abortController?.signal.aborted) {break;}
      
      this.buffer += chunk;
      
      // Emit chunk
      this.emit('chunk', chunk, this.buffer);
      options.onChunk?.(chunk);
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  private createLogicalChunks(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      // If sentence is too long, break it at commas
      if (sentence.length > 100) {
        const parts = sentence.split(/,\s*/);
        parts.forEach((part, index) => {
          chunks.push(part + (index < parts.length - 1 ? ', ' : ''));
        });
      } else {
        chunks.push(sentence);
      }
    }
    
    return chunks;
  }
  
  abort(): void {
    if (this.abortController && this.isStreaming) {
      this.abortController.abort();
      this.emit('abort');
    }
  }
  
  getBuffer(): string {
    return this.buffer;
  }
  
  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }
}

// React Hook for streaming
export function useStreamingResponse() {
  const [streamingText, setStreamingText] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const handlerRef = React.useRef<StreamingHandler | null>(null);
  
  const startStreaming = React.useCallback(
    async (
      generateFunction: () => Promise<string>,
      options?: StreamingOptions
    ) => {
      setError(null);
      setIsStreaming(true);
      setStreamingText('');
      
      handlerRef.current = new StreamingHandler({
        ...options,
        onChunk: (chunk) => {
          setStreamingText(prev => prev + chunk);
          options?.onChunk?.(chunk);
        },
        onComplete: (fullText) => {
          setIsStreaming(false);
          options?.onComplete?.(fullText);
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
          options?.onError?.(err);
        }
      });
      
      try {
        await handlerRef.current.streamResponse(generateFunction);
      } catch (err) {
        // Error already handled in callbacks
      }
    },
    []
  );
  
  const abortStreaming = React.useCallback(() => {
    handlerRef.current?.abort();
    setIsStreaming(false);
  }, []);
  
  return {
    streamingText,
    isStreaming,
    error,
    startStreaming,
    abortStreaming
  };
}

// Markdown streaming formatter
export class MarkdownStreamFormatter {
  static formatChunk(chunk: string, isComplete: boolean = false): string {
    // Ensure markdown formatting is preserved
    let formatted = chunk;
    
    // If chunk ends mid-word and not complete, add ellipsis
    if (!isComplete && !chunk.match(/[.!?,\s]$/)) {
      formatted += '...';
    }
    
    return formatted;
  }
  
  static isValidMarkdown(text: string): boolean {
    // Basic check for common markdown issues
    const openBold = (text.match(/\*\*/g) || []).length;
    const openItalic = (text.match(/(?<!\*)\*(?!\*)/g) || []).length;
    const openCode = (text.match(/`/g) || []).length;
    
    return openBold % 2 === 0 && openItalic % 2 === 0 && openCode % 2 === 0;
  }
}