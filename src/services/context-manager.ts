// Context Manager - Manages conversation context and memory
// Handles context window, summarization, and relevance filtering

import { ChatMessage } from './chat-service';

export interface ContextSummary {
  keyPoints: string[];
  userPreferences: Record<string, any>;
  importantSelections: Record<string, string>;
  conversationTone: string;
}

export interface RelevantContext {
  messages: ChatMessage[];
  summary: ContextSummary;
  capturedData: Record<string, any>;
}

export class ContextManager {
  private conversationHistory: ChatMessage[] = [];
  private contextWindow: ChatMessage[] = [];
  private readonly maxWindowSize = 10;
  private readonly maxHistorySize = 50;
  private userPreferences: Record<string, any> = {};
  private keyDecisions: Map<string, string> = new Map();
  
  constructor() {
    this.initializeContextManager();
  }

  private initializeContextManager(): void {
    console.log('Context Manager initialized');
  }

  // Add a message to the context
  addMessage(message: ChatMessage): void {
    // Add to full history
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > this.maxHistorySize) {
      this.conversationHistory.shift();
    }
    
    // Add to context window
    this.contextWindow.push(message);
    if (this.contextWindow.length > this.maxWindowSize) {
      this.summarizeAndTruncate();
    }
    
    // Extract key information
    this.extractKeyInformation(message);
  }

  // Get relevant context for a specific action
  getRelevantContext(action: string, currentStage?: string): RelevantContext {
    const relevantMessages = this.filterRelevantMessages(action, currentStage);
    const summary = this.generateContextSummary();
    const capturedData = this.extractCapturedData();
    
    return {
      messages: relevantMessages,
      summary,
      capturedData
    };
  }

  // Filter messages relevant to the current action
  private filterRelevantMessages(action: string, currentStage?: string): ChatMessage[] {
    const relevanceScore = (msg: ChatMessage): number => {
      let score = 0;
      
      // Recency bonus
      const messageIndex = this.contextWindow.indexOf(msg);
      if (messageIndex !== -1) {
        score += (this.contextWindow.length - messageIndex) * 10;
      }
      
      // Stage relevance
      if (currentStage && msg.metadata?.stage === currentStage) {
        score += 20;
      }
      
      // Action relevance
      if (action === 'refine' && msg.metadata?.phase === 'step_confirm') {
        score += 30;
      }
      
      if (action === 'help' && msg.role === 'user') {
        score += 15;
      }
      
      // User messages are always relevant
      if (msg.role === 'user') {
        score += 25;
      }
      
      // Messages with captured data are important
      if (msg.metadata?.phase === 'step_confirm') {
        score += 20;
      }
      
      return score;
    };
    
    // Sort by relevance and take top messages
    const scored = this.contextWindow
      .map(msg => ({ msg, score: relevanceScore(msg) }))
      .sort((a, b) => b.score - a.score);
    
    // Always include last 3 messages for continuity
    const recentMessages = this.contextWindow.slice(-3);
    const relevantMessages = scored.slice(0, 5).map(item => item.msg);
    
    // Combine and deduplicate
    const combined = [...new Set([...recentMessages, ...relevantMessages])];
    
    return combined.slice(-7); // Return max 7 messages
  }

  // Extract key information from messages
  private extractKeyInformation(message: ChatMessage): void {
    // Extract user preferences from their language
    if (message.role === 'user') {
      const content = message.content.toLowerCase();
      
      // Detect teaching style preferences
      if (content.includes('hands-on') || content.includes('interactive')) {
        this.userPreferences.teachingStyle = 'interactive';
      }
      
      if (content.includes('creative') || content.includes('art')) {
        this.userPreferences.emphasis = 'creativity';
      }
      
      if (content.includes('technology') || content.includes('digital')) {
        this.userPreferences.techIntegration = true;
      }
      
      // Store key decisions
      if (message.metadata?.phase === 'step_confirm') {
        const step = message.metadata.step;
        if (step) {
          this.keyDecisions.set(step, message.content);
        }
      }
    }
  }

  // Generate a summary of the conversation context
  private generateContextSummary(): ContextSummary {
    const keyPoints: string[] = [];
    const importantSelections: Record<string, string> = {};
    
    // Extract key points from conversation
    this.conversationHistory.forEach(msg => {
      if (msg.metadata?.phase === 'step_confirm' && msg.role === 'user') {
        const step = msg.metadata.step || 'unknown';
        importantSelections[step] = msg.content;
      }
    });
    
    // Determine conversation tone
    let conversationTone = 'professional';
    const userMessageCount = this.conversationHistory.filter(m => m.role === 'user').length;
    
    if (userMessageCount > 5) {
      conversationTone = 'collaborative';
    }
    
    if (this.userPreferences.emphasis === 'creativity') {
      conversationTone = 'creative-collaborative';
    }
    
    // Extract key themes
    const themes = this.extractThemes();
    themes.forEach(theme => {
      keyPoints.push(`Focus on ${theme}`);
    });
    
    return {
      keyPoints,
      userPreferences: this.userPreferences,
      importantSelections,
      conversationTone
    };
  }

  // Extract captured data from the conversation
  private extractCapturedData(): Record<string, any> {
    const captured: Record<string, any> = {};
    
    this.conversationHistory.forEach(msg => {
      if (msg.metadata?.phase === 'step_confirm' && msg.role === 'user') {
        const step = msg.metadata.step;
        if (step) {
          captured[step] = msg.content;
        }
      }
    });
    
    return captured;
  }

  // Summarize and truncate when context window is full
  private summarizeAndTruncate(): void {
    // Keep the most recent messages
    const toSummarize = this.contextWindow.slice(0, 3);
    const toKeep = this.contextWindow.slice(-7);
    
    // Create a summary message
    const summaryPoints: string[] = [];
    
    toSummarize.forEach(msg => {
      if (msg.role === 'user' && msg.content.length > 50) {
        summaryPoints.push(`User mentioned: ${msg.content.substring(0, 50)}...`);
      }
      if (msg.metadata?.phase === 'step_confirm') {
        summaryPoints.push(`Confirmed: ${msg.metadata.step}`);
      }
    });
    
    if (summaryPoints.length > 0) {
      const summaryMessage: ChatMessage = {
        id: `summary-${Date.now()}`,
        role: 'system',
        content: `Context summary: ${summaryPoints.join('; ')}`,
        timestamp: new Date(),
        metadata: { actionType: 'context_summary' }
      };
      
      this.contextWindow = [summaryMessage, ...toKeep];
    } else {
      this.contextWindow = toKeep;
    }
  }

  // Extract themes from the conversation
  private extractThemes(): string[] {
    const themes: string[] = [];
    const contentWords: Record<string, number> = {};
    
    // Count significant words
    this.conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        const words = msg.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 5 && !this.isCommonWord(word)) {
            contentWords[word] = (contentWords[word] || 0) + 1;
          }
        });
      }
    });
    
    // Extract top themes
    const sortedWords = Object.entries(contentWords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    sortedWords.forEach(([word, count]) => {
      if (count > 2) {
        themes.push(word);
      }
    });
    
    return themes;
  }

  // Check if a word is common (should be filtered out)
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'and', 'for', 'with', 'this', 'that', 'have', 'from',
      'what', 'when', 'where', 'which', 'about', 'would', 'could',
      'should', 'their', 'there', 'these', 'those', 'been', 'being'
    ]);
    
    return commonWords.has(word);
  }

  // Get a formatted context string for AI prompts
  getFormattedContext(): string {
    const summary = this.generateContextSummary();
    const recent = this.contextWindow.slice(-5);
    
    let formatted = 'Conversation Context:\n';
    
    // Add key selections
    if (Object.keys(summary.importantSelections).length > 0) {
      formatted += '\nKey Selections:\n';
      Object.entries(summary.importantSelections).forEach(([step, value]) => {
        formatted += `- ${step}: ${value}\n`;
      });
    }
    
    // Add user preferences
    if (Object.keys(summary.userPreferences).length > 0) {
      formatted += '\nUser Preferences:\n';
      Object.entries(summary.userPreferences).forEach(([key, value]) => {
        formatted += `- ${key}: ${value}\n`;
      });
    }
    
    // Add recent messages
    formatted += '\nRecent Conversation:\n';
    recent.forEach(msg => {
      const truncated = msg.content.length > 100 
        ? msg.content.substring(0, 100) + '...' 
        : msg.content;
      formatted += `${msg.role}: ${truncated}\n`;
    });
    
    return formatted;
  }

  // Clear context (for new conversations)
  clearContext(): void {
    this.conversationHistory = [];
    this.contextWindow = [];
    this.userPreferences = {};
    this.keyDecisions.clear();
  }

  // Get context statistics
  getContextStats(): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    capturedSteps: number;
    preferences: Record<string, any>;
  } {
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    const assistantMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;
    
    return {
      totalMessages: this.conversationHistory.length,
      userMessages,
      assistantMessages,
      capturedSteps: this.keyDecisions.size,
      preferences: this.userPreferences
    };
  }
}

// Factory function
export function createContextManager(): ContextManager {
  return new ContextManager();
}