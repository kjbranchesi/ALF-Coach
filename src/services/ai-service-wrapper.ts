// AI Service Wrapper with Circuit Breaker Pattern
// Provides robust error handling and fallback mechanisms for AI services

import { AIConversationManager } from './ai-conversation-manager';

export interface AIServiceConfig {
  apiKey: string;
  maxRetries?: number;
  timeoutMs?: number;
  fallbackEnabled?: boolean;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

export class AIServiceWrapper {
  private aiManager: AIConversationManager | null = null;
  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    successCount: 0
  };
  
  // Circuit breaker configuration
  private readonly failureThreshold = 3;
  private readonly recoveryTimeout = 30000; // 30 seconds
  private readonly successThreshold = 2; // Successes needed to close circuit
  
  constructor(private config: AIServiceConfig) {
    this.initializeAIManager();
  }
  
  private initializeAIManager(): void {
    try {
      if (this.config.apiKey && this.config.apiKey !== 'your_gemini_api_key_here') {
        this.aiManager = new AIConversationManager(this.config.apiKey);
        console.log('AI Service Wrapper: Manager initialized');
      }
    } catch (error) {
      console.error('AI Service Wrapper: Failed to initialize manager', error);
    }
  }
  
  async generateIdeas(context: any): Promise<{ success: boolean; data?: any[]; error?: string }> {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      console.log('AI Service: Circuit breaker is open, using fallback');
      return { success: false, error: 'AI service temporarily unavailable' };
    }
    
    try {
      if (!this.aiManager) {
        throw new Error('AI Manager not initialized');
      }
      
      const response = await this.aiManager.generateResponse({
        action: 'ideas',
        context: context,
        requirements: [
          { type: 'structure', value: 'Return 3-4 specific ideas', priority: 'must' },
          { type: 'length', value: 'Keep each idea title under 10 words', priority: 'must' },
          { type: 'length', value: 'Keep descriptions to 1-2 sentences', priority: 'must' }
        ]
      });
      
      const ideas = this.parseIdeasFromResponse(response);
      
      if (ideas.length > 0) {
        this.recordSuccess();
        return { success: true, data: ideas };
      } else {
        throw new Error('No ideas parsed from response');
      }
    } catch (error) {
      this.recordFailure();
      console.error('AI Service: Ideas generation failed', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  async generateWhatIfs(context: any): Promise<{ success: boolean; data?: any[]; error?: string }> {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      console.log('AI Service: Circuit breaker is open, using fallback');
      return { success: false, error: 'AI service temporarily unavailable' };
    }
    
    try {
      if (!this.aiManager) {
        throw new Error('AI Manager not initialized');
      }
      
      const response = await this.aiManager.generateResponse({
        action: 'whatif',
        context: context,
        requirements: [
          { type: 'structure', value: 'Return 2-3 transformative What-If scenarios', priority: 'must' },
          { type: 'tone', value: 'Make them inspiring and achievable', priority: 'should' }
        ]
      });
      
      const whatIfs = this.parseIdeasFromResponse(response);
      
      if (whatIfs.length > 0) {
        this.recordSuccess();
        return { success: true, data: whatIfs };
      } else {
        throw new Error('No what-ifs parsed from response');
      }
    } catch (error) {
      this.recordFailure();
      console.error('AI Service: What-If generation failed', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  private parseIdeasFromResponse(text: string): any[] {
    const ideas: any[] = [];
    
    console.log('🔍 Parsing ideas from response:', {
      responseLength: text.length,
      firstChars: text.substring(0, 100)
    });
    
    try {
      // Try JSON parsing first
      if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        const jsonIdeas = items.map((item, idx) => ({
          id: `idea-${Date.now()}-${idx}`,
          title: this.extractTitle(item),
          description: this.extractDescription(item)
        }));
        console.log('✅ Successfully parsed JSON ideas:', jsonIdeas.length);
        return jsonIdeas;
      }
    } catch (e) {
      console.log('📝 Not JSON format, using enhanced text parsing');
    }
    
    // Enhanced text parsing with multiple strategies
    const lines = text.split('\n').filter(line => line.trim());
    let currentIdea: any = null;
    
    // Strategy 1: Look for numbered/bulleted lists
    for (const line of lines) {
      // Match various title formats including plain numbered lists
      const titleMatch = line.match(/^(?:Title:|###|\*\*|[\d.)-])\s*(.+?)(?:\*\*)?$/);
      if (titleMatch) {
        if (currentIdea?.title) {
          ideas.push(currentIdea);
        }
        currentIdea = {
          id: `idea-${Date.now()}-${ideas.length}`,
          title: titleMatch[1].trim(),
          description: ''
        };
      } else if (currentIdea && !currentIdea.description && line.trim()) {
        // Next non-empty line is likely the description
        currentIdea.description = line.trim();
      }
    }
    
    if (currentIdea?.title) {
      ideas.push(currentIdea);
    }
    
    // Strategy 2: If no ideas found, try splitting by sentences
    if (ideas.length === 0 && text.length > 20) {
      console.log('📝 No structured ideas found, trying sentence parsing');
      // Split by periods followed by capital letters or newlines
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      
      // Take up to 3 sentences as separate ideas
      sentences.slice(0, 3).forEach((sentence, idx) => {
        const cleaned = sentence.trim();
        if (cleaned.length > 10) {
          ideas.push({
            id: `idea-${Date.now()}-${idx}`,
            title: cleaned.length > 50 ? cleaned.substring(0, 50) + '...' : cleaned,
            description: 'Click to explore this idea further'
          });
        }
      });
    }
    
    // Strategy 3: If still no ideas, create one from the whole text
    if (ideas.length === 0 && text.trim().length > 0) {
      console.log('📝 Creating single idea from entire response');
      ideas.push({
        id: `idea-${Date.now()}-0`,
        title: text.length > 60 ? text.substring(0, 60) + '...' : text,
        description: 'An AI-generated suggestion for your consideration'
      });
    }
    
    console.log('📦 Parsed ideas:', ideas.length, ideas.map(i => i.title));
    return ideas.filter(idea => idea.title && idea.title.length > 0);
  }
  
  private extractTitle(item: any): string {
    return item.title || item.name || item.heading || item.label || 'Untitled';
  }
  
  private extractDescription(item: any): string {
    return item.description || item.desc || item.details || item.summary || '';
  }
  
  // Circuit breaker methods
  private isCircuitOpen(): boolean {
    if (!this.circuitBreaker.isOpen) {
      return false;
    }
    
    // Check if recovery timeout has passed
    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
    if (timeSinceLastFailure > this.recoveryTimeout) {
      console.log('AI Service: Attempting to close circuit breaker');
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      this.circuitBreaker.successCount = 0;
      return false;
    }
    
    return true;
  }
  
  private recordSuccess(): void {
    this.circuitBreaker.successCount++;
    
    // If circuit was open and we have enough successes, close it
    if (this.circuitBreaker.isOpen && this.circuitBreaker.successCount >= this.successThreshold) {
      console.log('AI Service: Circuit breaker closed after successful recovery');
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
    }
  }
  
  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    this.circuitBreaker.successCount = 0;
    
    // Open circuit if failure threshold reached
    if (this.circuitBreaker.failureCount >= this.failureThreshold) {
      console.log('AI Service: Circuit breaker opened due to repeated failures');
      this.circuitBreaker.isOpen = true;
    }
  }
  
  // Health check
  isHealthy(): boolean {
    return !this.circuitBreaker.isOpen && this.aiManager !== null;
  }
  
  getCircuitBreakerState(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }
}

// Factory function
export function createAIServiceWrapper(apiKey: string): AIServiceWrapper {
  return new AIServiceWrapper({ apiKey });
}