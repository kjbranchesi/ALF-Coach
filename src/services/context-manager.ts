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
  
  // Enhanced context tracking for long conversations
  private conversationPatterns: Map<string, number> = new Map();
  private topicTransitions: Array<{ from: string; to: string; timestamp: number }> = [];
  private userVocabulary: Set<string> = new Set();
  private interactionMetrics = {
    totalMessages: 0,
    averageResponseLength: 0,
    questionCount: 0,
    clarificationRequests: 0,
    topicChanges: 0,
    sessionStartTime: Date.now()
  };
  private compressedHistory: Array<{
    phase: string;
    summary: string;
    keyPoints: string[];
    timestamp: number;
  }> = [];
  
  constructor() {
    this.initializeContextManager();
  }

  private initializeContextManager(): void {
    console.log('Context Manager initialized');
  }

  // Add a message to the context with enhanced tracking
  addMessage(message: ChatMessage): void {
    // Update metrics
    this.interactionMetrics.totalMessages++;
    if (message.role === 'user') {
      this.updateUserMetrics(message);
    }
    
    // Add to full history
    this.conversationHistory.push(message);
    
    // Compress old history if needed
    if (this.conversationHistory.length > this.maxHistorySize) {
      this.compressOldHistory();
    }
    
    // Add to context window
    this.contextWindow.push(message);
    if (this.contextWindow.length > this.maxWindowSize) {
      this.summarizeAndTruncate();
    }
    
    // Extract key information
    this.extractKeyInformation(message);
    
    // Track conversation patterns
    this.trackConversationPatterns(message);
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

  // Enhanced key information extraction
  private extractKeyInformation(message: ChatMessage): void {
    if (message.role === 'user') {
      const content = message.content.toLowerCase();
      const words = content.split(/\s+/);
      
      // Build user vocabulary for better understanding
      words.forEach(word => {
        if (word.length > 4 && !this.isCommonWord(word)) {
          this.userVocabulary.add(word);
        }
      });
      
      // Enhanced preference detection
      const preferencePatterns = {
        teachingStyle: {
          'interactive': ['hands-on', 'interactive', 'engage', 'participate', 'active'],
          'visual': ['visual', 'see', 'show', 'demonstrate', 'display'],
          'collaborative': ['together', 'group', 'team', 'collaborate', 'share'],
          'exploratory': ['explore', 'discover', 'investigate', 'experiment']
        },
        learningFocus: {
          'creativity': ['creative', 'art', 'design', 'imagine', 'invent'],
          'analysis': ['analyze', 'understand', 'examine', 'research'],
          'practical': ['real-world', 'practical', 'apply', 'use', 'implement'],
          'conceptual': ['concept', 'theory', 'principle', 'idea']
        },
        communicationStyle: {
          'detailed': words.length > 50,
          'concise': words.length < 20,
          'questioning': (content.match(/\?/g) || []).length > 1,
          'reflective': content.includes('think') || content.includes('wonder')
        }
      };
      
      // Detect preferences
      Object.entries(preferencePatterns).forEach(([category, patterns]) => {
        Object.entries(patterns).forEach(([style, keywords]) => {
          if (typeof keywords === 'boolean') {
            if (keywords) {
              this.userPreferences[`${category}_${style}`] = true;
            }
          } else if (keywords.some(keyword => content.includes(keyword))) {
            this.userPreferences[`${category}_${style}`] = 
              (this.userPreferences[`${category}_${style}`] || 0) + 1;
          }
        });
      });
      
      // Store key decisions with context
      if (message.metadata?.phase === 'step_confirm') {
        const step = message.metadata.step;
        if (step) {
          this.keyDecisions.set(step, message.content);
          
          // Track decision reasoning
          const reasoning = this.extractReasoning(message.content);
          if (reasoning) {
            this.userPreferences[`${step}_reasoning`] = reasoning;
          }
        }
      }
      
      // Track questions and concerns
      if (content.includes('?')) {
        this.interactionMetrics.questionCount++;
      }
      
      if (content.includes('confused') || content.includes('not sure') || 
          content.includes('help') || content.includes('clarify')) {
        this.interactionMetrics.clarificationRequests++;
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
    
    // Extract key themes from conversation
    const allContent = this.conversationHistory
      .map(msg => msg.content || '')
      .join(' ');
    const themes = this.extractThemesFromAll();
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

  // Enhanced summarization for long conversations
  private summarizeAndTruncate(): void {
    const toSummarize = this.contextWindow.slice(0, 3);
    const toKeep = this.contextWindow.slice(-7);
    
    // Create intelligent summary
    const summary = this.createIntelligentSummary(toSummarize);
    
    if (summary.keyPoints.length > 0) {
      const summaryMessage: ChatMessage = {
        id: `summary-${Date.now()}`,
        role: 'system',
        content: `Context: ${summary.mainTheme}. Key points: ${summary.keyPoints.join('; ')}`,
        timestamp: new Date(),
        metadata: { 
          actionType: 'context_summary',
          summaryType: 'intelligent',
          preservedContext: summary.preservedContext
        }
      };
      
      this.contextWindow = [summaryMessage, ...toKeep];
    } else {
      this.contextWindow = toKeep;
    }
  }

  // Extract themes from all conversation history
  private extractThemesFromAll(): string[] {
    const allContent = this.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');
    return this.extractThemes(allContent);
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

  // Get enhanced context statistics
  getContextStats(): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    capturedSteps: number;
    preferences: Record<string, any>;
    conversationHealth: {
      engagementScore: number;
      clarityScore: number;
      progressScore: number;
      coherenceScore: number;
    };
    patterns: {
      dominantStyle: string;
      topTopics: string[];
      averageMessageLength: number;
      sessionDuration: number;
    };
  } {
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    const assistantMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;
    
    // Calculate conversation health metrics
    const engagementScore = this.calculateEngagementScore();
    const clarityScore = this.calculateClarityScore();
    const progressScore = (this.keyDecisions.size / 9) * 100; // 9 total steps
    const coherenceScore = this.calculateCoherenceScore();
    
    // Identify patterns
    const dominantStyle = this.identifyDominantStyle();
    const topTopics = this.getTopTopics(5);
    const sessionDuration = Date.now() - this.interactionMetrics.sessionStartTime;
    
    return {
      totalMessages: this.conversationHistory.length,
      userMessages,
      assistantMessages,
      capturedSteps: this.keyDecisions.size,
      preferences: this.userPreferences,
      conversationHealth: {
        engagementScore,
        clarityScore,
        progressScore,
        coherenceScore
      },
      patterns: {
        dominantStyle,
        topTopics,
        averageMessageLength: this.interactionMetrics.averageResponseLength,
        sessionDuration
      }
    };
  }

  // New helper methods for enhanced context management
  private updateUserMetrics(message: ChatMessage): void {
    const messageLength = message.content.split(/\s+/).length;
    const currentAvg = this.interactionMetrics.averageResponseLength;
    const totalMessages = this.interactionMetrics.totalMessages;
    
    this.interactionMetrics.averageResponseLength = 
      (currentAvg * (totalMessages - 1) + messageLength) / totalMessages;
  }
  
  private trackConversationPatterns(message: ChatMessage): void {
    if (message.metadata?.stage && message.metadata?.phase === 'stage_init') {
      // Track topic transitions
      if (this.topicTransitions.length > 0) {
        const lastTopic = this.topicTransitions[this.topicTransitions.length - 1].to;
        this.topicTransitions.push({
          from: lastTopic,
          to: message.metadata.stage,
          timestamp: Date.now()
        });
        this.interactionMetrics.topicChanges++;
      } else {
        this.topicTransitions.push({
          from: 'start',
          to: message.metadata.stage,
          timestamp: Date.now()
        });
      }
    }
    
    // Track conversation patterns
    const patterns = this.detectPatterns(message.content);
    patterns.forEach(pattern => {
      this.conversationPatterns.set(pattern, 
        (this.conversationPatterns.get(pattern) || 0) + 1);
    });
  }
  
  private compressOldHistory(): void {
    // Take oldest 10 messages
    const toCompress = this.conversationHistory.slice(0, 10);
    const toKeep = this.conversationHistory.slice(10);
    
    // Group by phase
    const phaseGroups = new Map<string, ChatMessage[]>();
    toCompress.forEach(msg => {
      const phase = msg.metadata?.phase || 'unknown';
      if (!phaseGroups.has(phase)) {
        phaseGroups.set(phase, []);
      }
      phaseGroups.get(phase)!.push(msg);
    });
    
    // Create compressed summaries
    phaseGroups.forEach((messages, phase) => {
      const summary = this.createPhaseSummary(messages, phase);
      this.compressedHistory.push(summary);
    });
    
    // Update conversation history
    this.conversationHistory = toKeep;
  }
  
  private createIntelligentSummary(messages: ChatMessage[]): {
    mainTheme: string;
    keyPoints: string[];
    preservedContext: Record<string, any>;
  } {
    const keyPoints: string[] = [];
    const preservedContext: Record<string, any> = {};
    
    // Extract main theme
    const themes = new Map<string, number>();
    messages.forEach(msg => {
      if (msg.role === 'user') {
        const msgThemes = this.extractThemes(msg.content);
        msgThemes.forEach(theme => {
          themes.set(theme, (themes.get(theme) || 0) + 1);
        });
      }
    });
    
    const mainTheme = Array.from(themes.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'discussion';
    
    // Extract key decisions and confirmations
    messages.forEach(msg => {
      if (msg.metadata?.phase === 'step_confirm' && msg.role === 'user') {
        keyPoints.push(`Confirmed: ${msg.content.substring(0, 50)}...`);
        preservedContext[msg.metadata.step || 'unknown'] = msg.content;
      }
      
      // Preserve important questions
      if (msg.role === 'user' && msg.content.includes('?')) {
        keyPoints.push(`Question: ${msg.content.substring(0, 40)}...`);
      }
      
      // Preserve help requests
      if (msg.content.toLowerCase().includes('help') || 
          msg.content.toLowerCase().includes('confused')) {
        preservedContext.needsSupport = true;
      }
    });
    
    return { mainTheme, keyPoints, preservedContext };
  }
  
  private extractReasoning(content: string): string | null {
    // Look for reasoning patterns
    const reasoningPatterns = [
      /because\s+([^.!?]+)/i,
      /since\s+([^.!?]+)/i,
      /due to\s+([^.!?]+)/i,
      /in order to\s+([^.!?]+)/i,
      /so that\s+([^.!?]+)/i
    ];
    
    for (const pattern of reasoningPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }
  
  private detectPatterns(content: string): string[] {
    const patterns: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // Detect communication patterns
    if (lowerContent.includes('for example') || lowerContent.includes('such as')) {
      patterns.push('examples-based');
    }
    if (lowerContent.includes('what if') || lowerContent.includes('suppose')) {
      patterns.push('hypothetical');
    }
    if (lowerContent.includes('compare') || lowerContent.includes('versus')) {
      patterns.push('comparative');
    }
    if (lowerContent.includes('step by step') || lowerContent.includes('first')) {
      patterns.push('sequential');
    }
    
    return patterns;
  }
  
  private createPhaseSummary(messages: ChatMessage[], phase: string): {
    phase: string;
    summary: string;
    keyPoints: string[];
    timestamp: number;
  } {
    const keyPoints: string[] = [];
    const userInputs = messages.filter(m => m.role === 'user').map(m => m.content);
    
    // Extract key information
    messages.forEach(msg => {
      if (msg.metadata?.phase === 'step_confirm') {
        keyPoints.push(`Completed: ${msg.metadata.step}`);
      }
    });
    
    const summary = `Phase ${phase}: ${messages.length} messages exchanged. ` +
      `User provided ${userInputs.length} inputs.`;
    
    return {
      phase,
      summary,
      keyPoints,
      timestamp: messages[0]?.timestamp?.getTime?.() || Date.now()
    };
  }
  
  private extractThemes(content: string = ''): string[] {
    if (!content || typeof content !== 'string') {
      return [];
    }
    const words = content.toLowerCase().split(/\s+/);
    const themes: string[] = [];
    
    // Topic detection
    const topicKeywords = {
      'engagement': ['engage', 'interest', 'motivate', 'excite'],
      'assessment': ['assess', 'evaluate', 'rubric', 'grade'],
      'collaboration': ['group', 'team', 'together', 'collaborate'],
      'technology': ['digital', 'online', 'computer', 'tech'],
      'creativity': ['create', 'design', 'imagine', 'invent']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword))) {
        themes.push(topic);
      }
    });
    
    return themes;
  }
  
  private calculateEngagementScore(): number {
    // Based on response frequency and length
    const avgResponseTime = this.interactionMetrics.totalMessages > 0 
      ? (Date.now() - this.interactionMetrics.sessionStartTime) / this.interactionMetrics.totalMessages
      : 0;
    
    const responseFrequencyScore = Math.min(100, (60000 / avgResponseTime) * 100); // 1 min ideal
    const lengthScore = Math.min(100, (this.interactionMetrics.averageResponseLength / 30) * 100); // 30 words ideal
    
    return (responseFrequencyScore + lengthScore) / 2;
  }
  
  private calculateClarityScore(): number {
    // Based on clarification requests and question patterns
    const clarificationRate = this.interactionMetrics.totalMessages > 0
      ? (this.interactionMetrics.clarificationRequests / this.interactionMetrics.totalMessages) * 100
      : 0;
    
    return Math.max(0, 100 - (clarificationRate * 10)); // Deduct 10 points per clarification
  }
  
  private calculateCoherenceScore(): number {
    // Based on topic consistency and pattern recognition
    const topicChangeRate = this.interactionMetrics.totalMessages > 0
      ? (this.interactionMetrics.topicChanges / this.interactionMetrics.totalMessages) * 100
      : 0;
    
    const patternConsistency = this.conversationPatterns.size > 0
      ? (Math.max(...Array.from(this.conversationPatterns.values())) / this.interactionMetrics.totalMessages) * 100
      : 50;
    
    return (100 - topicChangeRate + patternConsistency) / 2;
  }
  
  private identifyDominantStyle(): string {
    const styleScores: Record<string, number> = {};
    
    Object.entries(this.userPreferences).forEach(([key, value]) => {
      if (key.includes('Style_')) {
        const style = key.split('_')[1];
        styleScores[style] = (styleScores[style] || 0) + (value as number);
      }
    });
    
    const dominant = Object.entries(styleScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return dominant ? dominant[0] : 'balanced';
  }
  
  private getTopTopics(count: number): string[] {
    return Array.from(this.conversationPatterns.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([topic]) => topic);
  }
}

// Factory function
export function createContextManager(): ContextManager {
  return new ContextManager();
}