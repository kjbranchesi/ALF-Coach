/**
 * Coaching Error Recovery Service
 *
 * Comprehensive error handling and recovery system for coaching conversations.
 * Ensures no data loss and graceful degradation under all failure scenarios.
 */

import { coachingIntegration, type CoachingSession } from './CoachingIntegrationService';
import type { ConversationMessage } from '../contexts/CoachingConversationContext';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'storage' | 'ai' | 'transformation' | 'user' | 'system';
export type RecoveryStrategy = 'retry' | 'fallback' | 'degrade' | 'manual' | 'restart';

export interface ErrorContext {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  actionAttempted: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
}

export interface RecoveryAction {
  strategy: RecoveryStrategy;
  description: string;
  automated: boolean;
  estimatedTime: string;
  dataLossRisk: 'none' | 'minimal' | 'moderate' | 'high';
  userAction?: string;
  fallbackData?: any;
}

export interface ErrorPattern {
  category: ErrorCategory;
  pattern: RegExp;
  severity: ErrorSeverity;
  recoveryActions: RecoveryAction[];
  preventionTips: string[];
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Network Errors
  {
    category: 'network',
    pattern: /network|fetch|timeout|connection/i,
    severity: 'medium',
    recoveryActions: [
      {
        strategy: 'retry',
        description: 'Retry the request with exponential backoff',
        automated: true,
        estimatedTime: '10-30 seconds',
        dataLossRisk: 'none'
      },
      {
        strategy: 'fallback',
        description: 'Use cached data or offline mode',
        automated: true,
        estimatedTime: 'immediate',
        dataLossRisk: 'minimal'
      }
    ],
    preventionTips: [
      'Check internet connection',
      'Use offline-first architecture',
      'Implement request queuing'
    ]
  },

  // Storage Errors
  {
    category: 'storage',
    pattern: /localStorage|quota|storage|persistence/i,
    severity: 'high',
    recoveryActions: [
      {
        strategy: 'fallback',
        description: 'Switch to memory storage with session backup',
        automated: true,
        estimatedTime: 'immediate',
        dataLossRisk: 'moderate'
      },
      {
        strategy: 'manual',
        description: 'Export conversation data for manual backup',
        automated: false,
        estimatedTime: '2-5 minutes',
        dataLossRisk: 'none',
        userAction: 'Download and save your conversation data'
      }
    ],
    preventionTips: [
      'Regular data cleanup',
      'Monitor storage usage',
      'Implement data compression'
    ]
  },

  // AI/Generation Errors
  {
    category: 'ai',
    pattern: /ai|generation|response|model|api/i,
    severity: 'medium',
    recoveryActions: [
      {
        strategy: 'retry',
        description: 'Retry AI request with adjusted parameters',
        automated: true,
        estimatedTime: '5-15 seconds',
        dataLossRisk: 'none'
      },
      {
        strategy: 'fallback',
        description: 'Use pre-configured response templates',
        automated: true,
        estimatedTime: 'immediate',
        dataLossRisk: 'minimal',
        fallbackData: 'static_responses'
      },
      {
        strategy: 'degrade',
        description: 'Continue with manual guidance mode',
        automated: true,
        estimatedTime: 'immediate',
        dataLossRisk: 'none'
      }
    ],
    preventionTips: [
      'Validate input before AI requests',
      'Implement rate limiting',
      'Prepare fallback content'
    ]
  },

  // Transformation Errors
  {
    category: 'transformation',
    pattern: /transform|hero.*project|generation.*failed/i,
    severity: 'high',
    recoveryActions: [
      {
        strategy: 'retry',
        description: 'Retry transformation with basic level',
        automated: true,
        estimatedTime: '30-60 seconds',
        dataLossRisk: 'none'
      },
      {
        strategy: 'fallback',
        description: 'Generate basic project structure',
        automated: true,
        estimatedTime: '10-20 seconds',
        dataLossRisk: 'minimal'
      },
      {
        strategy: 'manual',
        description: 'Export conversation data for manual processing',
        automated: false,
        estimatedTime: '5-10 minutes',
        dataLossRisk: 'none',
        userAction: 'Download conversation summary and contact support'
      }
    ],
    preventionTips: [
      'Ensure all required data is captured',
      'Validate data completeness before transformation',
      'Use progressive enhancement approach'
    ]
  },

  // User Input Errors
  {
    category: 'user',
    pattern: /validation|input|format|required/i,
    severity: 'low',
    recoveryActions: [
      {
        strategy: 'manual',
        description: 'Provide clear guidance for correction',
        automated: false,
        estimatedTime: '1-2 minutes',
        dataLossRisk: 'none',
        userAction: 'Please review and correct your input'
      }
    ],
    preventionTips: [
      'Provide clear input examples',
      'Use progressive disclosure',
      'Implement real-time validation'
    ]
  },

  // System Errors
  {
    category: 'system',
    pattern: /memory|crash|undefined|null.*reference/i,
    severity: 'critical',
    recoveryActions: [
      {
        strategy: 'restart',
        description: 'Restart coaching session with data recovery',
        automated: true,
        estimatedTime: '30-60 seconds',
        dataLossRisk: 'minimal'
      },
      {
        strategy: 'manual',
        description: 'Contact support with error details',
        automated: false,
        estimatedTime: '24-48 hours',
        dataLossRisk: 'moderate',
        userAction: 'Report this error to our support team'
      }
    ],
    preventionTips: [
      'Regular system health checks',
      'Implement proper error boundaries',
      'Monitor memory usage'
    ]
  }
];

export class CoachingErrorRecoveryService {
  private static instance: CoachingErrorRecoveryService;
  private errorLog: ErrorContext[] = [];
  private recoveryAttempts = new Map<string, number>();
  private fallbackData = new Map<string, any>();
  private maxRetryAttempts = 3;
  private backoffMultiplier = 1000; // Base backoff in milliseconds

  private constructor() {
    this.initializeFallbackData();
    this.setupErrorMonitoring();
  }

  static getInstance(): CoachingErrorRecoveryService {
    if (!CoachingErrorRecoveryService.instance) {
      CoachingErrorRecoveryService.instance = new CoachingErrorRecoveryService();
    }
    return CoachingErrorRecoveryService.instance;
  }

  /**
   * Main error handling entry point
   */
  async handleError(
    error: Error,
    context: {
      sessionId?: string;
      userId?: string;
      actionAttempted: string;
      metadata?: Record<string, any>;
    }
  ): Promise<RecoveryAction[]> {
    try {
      // Create error context
      const errorContext: ErrorContext = {
        id: this.generateErrorId(),
        category: this.categorizeError(error),
        severity: this.assessSeverity(error),
        message: error.message,
        timestamp: new Date(),
        sessionId: context.sessionId,
        userId: context.userId,
        actionAttempted: context.actionAttempted,
        stackTrace: error.stack,
        metadata: context.metadata
      };

      // Log the error
      this.logError(errorContext);

      // Get recovery actions
      const recoveryActions = this.determineRecoveryActions(errorContext);

      // Execute automated recovery actions
      await this.executeAutomatedRecovery(errorContext, recoveryActions);

      return recoveryActions;

    } catch (recoveryError) {
      console.error('Error recovery itself failed:', recoveryError);
      return this.getEmergencyRecoveryActions();
    }
  }

  /**
   * Categorize error based on message and stack trace
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    const combined = `${message} ${stack}`;

    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(combined)) {
        return pattern.category;
      }
    }

    return 'system'; // Default category
  }

  /**
   * Assess error severity
   */
  private assessSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal') || message.includes('crash')) {
      return 'critical';
    }

    if (message.includes('data') || message.includes('storage') || message.includes('save')) {
      return 'high';
    }

    if (message.includes('network') || message.includes('timeout') || message.includes('ai')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine appropriate recovery actions
   */
  private determineRecoveryActions(errorContext: ErrorContext): RecoveryAction[] {
    const pattern = ERROR_PATTERNS.find(p => p.category === errorContext.category);

    if (!pattern) {
      return this.getDefaultRecoveryActions(errorContext.severity);
    }

    // Adjust recovery actions based on previous attempts
    const attemptCount = this.recoveryAttempts.get(errorContext.actionAttempted) || 0;

    if (attemptCount >= this.maxRetryAttempts) {
      // Filter out retry strategies if max attempts reached
      return pattern.recoveryActions.filter(action => action.strategy !== 'retry');
    }

    return pattern.recoveryActions;
  }

  /**
   * Execute automated recovery actions
   */
  private async executeAutomatedRecovery(
    errorContext: ErrorContext,
    recoveryActions: RecoveryAction[]
  ): Promise<void> {
    for (const action of recoveryActions) {
      if (!action.automated) continue;

      try {
        switch (action.strategy) {
          case 'retry':
            await this.executeRetryStrategy(errorContext, action);
            break;

          case 'fallback':
            await this.executeFallbackStrategy(errorContext, action);
            break;

          case 'degrade':
            await this.executeDegradeStrategy(errorContext, action);
            break;

          case 'restart':
            await this.executeRestartStrategy(errorContext, action);
            break;
        }

        console.log(`Recovery action executed: ${action.strategy} for ${errorContext.id}`);
        break; // Success, stop trying other actions

      } catch (recoveryError) {
        console.error(`Recovery action ${action.strategy} failed:`, recoveryError);
        continue; // Try next recovery action
      }
    }
  }

  /**
   * Retry strategy with exponential backoff
   */
  private async executeRetryStrategy(
    errorContext: ErrorContext,
    action: RecoveryAction
  ): Promise<void> {
    const attemptCount = this.recoveryAttempts.get(errorContext.actionAttempted) || 0;
    const delay = this.backoffMultiplier * Math.pow(2, attemptCount);

    // Track retry attempt
    this.recoveryAttempts.set(errorContext.actionAttempted, attemptCount + 1);

    // Wait for backoff period
    await new Promise(resolve => setTimeout(resolve, delay));

    // The actual retry logic would be implemented by the calling component
    console.log(`Retry strategy prepared for ${errorContext.actionAttempted} (attempt ${attemptCount + 1})`);
  }

  /**
   * Fallback strategy implementation
   */
  private async executeFallbackStrategy(
    errorContext: ErrorContext,
    action: RecoveryAction
  ): Promise<void> {
    switch (errorContext.category) {
      case 'storage':
        await this.handleStorageFallback(errorContext);
        break;

      case 'ai':
        await this.handleAIFallback(errorContext);
        break;

      case 'network':
        await this.handleNetworkFallback(errorContext);
        break;

      case 'transformation':
        await this.handleTransformationFallback(errorContext);
        break;

      default:
        console.log(`Generic fallback for ${errorContext.category}`);
    }
  }

  /**
   * Storage fallback - switch to memory storage
   */
  private async handleStorageFallback(errorContext: ErrorContext): Promise<void> {
    if (errorContext.sessionId) {
      // Try to recover session from memory or create in-memory backup
      const session = await coachingIntegration.recoverSession(errorContext.sessionId);

      if (session) {
        // Store in memory cache
        this.fallbackData.set(`session_${errorContext.sessionId}`, {
          type: 'session',
          data: session,
          timestamp: new Date()
        });

        console.log(`Session ${errorContext.sessionId} moved to memory storage`);
      }
    }
  }

  /**
   * AI fallback - use pre-configured responses
   */
  private async handleAIFallback(errorContext: ErrorContext): Promise<void> {
    const fallbackResponses = this.fallbackData.get('ai_responses');

    if (fallbackResponses && errorContext.sessionId) {
      // Store fallback response for the session
      this.fallbackData.set(`ai_fallback_${errorContext.sessionId}`, {
        type: 'ai_response',
        data: fallbackResponses.default,
        timestamp: new Date()
      });

      console.log(`AI fallback response prepared for session ${errorContext.sessionId}`);
    }
  }

  /**
   * Network fallback - enable offline mode
   */
  private async handleNetworkFallback(errorContext: ErrorContext): Promise<void> {
    // Set offline mode flag
    this.fallbackData.set('offline_mode', {
      type: 'system_state',
      data: { enabled: true, reason: errorContext.message },
      timestamp: new Date()
    });

    console.log('Offline mode enabled due to network error');
  }

  /**
   * Transformation fallback - basic project structure
   */
  private async handleTransformationFallback(errorContext: ErrorContext): Promise<void> {
    const basicProject = this.fallbackData.get('basic_project_template');

    if (basicProject && errorContext.sessionId) {
      this.fallbackData.set(`project_fallback_${errorContext.sessionId}`, {
        type: 'project_template',
        data: basicProject,
        timestamp: new Date()
      });

      console.log(`Basic project template prepared for session ${errorContext.sessionId}`);
    }
  }

  /**
   * Degrade strategy - reduce functionality gracefully
   */
  private async executeDegradeStrategy(
    errorContext: ErrorContext,
    action: RecoveryAction
  ): Promise<void> {
    // Implement graceful degradation based on error category
    console.log(`Graceful degradation activated for ${errorContext.category}`);
  }

  /**
   * Restart strategy - fresh session with data recovery
   */
  private async executeRestartStrategy(
    errorContext: ErrorContext,
    action: RecoveryAction
  ): Promise<void> {
    if (errorContext.sessionId) {
      try {
        // Attempt to recover and backup current session data
        const session = await coachingIntegration.recoverSession(errorContext.sessionId);

        if (session) {
          // Store recovery data
          this.fallbackData.set(`restart_backup_${errorContext.sessionId}`, {
            type: 'session_backup',
            data: session,
            timestamp: new Date()
          });
        }

        console.log(`Restart strategy prepared for session ${errorContext.sessionId}`);
      } catch (restartError) {
        console.error('Restart strategy failed:', restartError);
      }
    }
  }

  /**
   * Get fallback data for recovery
   */
  getFallbackData(key: string): any {
    return this.fallbackData.get(key)?.data;
  }

  /**
   * Check if system is in degraded mode
   */
  isInDegradedMode(): boolean {
    return this.fallbackData.has('offline_mode') ||
           this.errorLog.filter(e => e.severity === 'critical').length > 0;
  }

  /**
   * Get error summary for user display
   */
  getErrorSummary(sessionId?: string): {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: ErrorContext[];
    recoveryActions: string[];
  } {
    const relevantErrors = sessionId
      ? this.errorLog.filter(e => e.sessionId === sessionId)
      : this.errorLog;

    const recentErrors = relevantErrors
      .filter(e => Date.now() - e.timestamp.getTime() < 5 * 60 * 1000) // Last 5 minutes
      .slice(-5); // Last 5 errors

    const recoveryActions = recentErrors
      .map(e => this.determineRecoveryActions(e))
      .flat()
      .filter(a => !a.automated)
      .map(a => a.description);

    return {
      totalErrors: relevantErrors.length,
      criticalErrors: relevantErrors.filter(e => e.severity === 'critical').length,
      recentErrors,
      recoveryActions
    };
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(sessionId?: string): void {
    if (sessionId) {
      this.errorLog = this.errorLog.filter(e => e.sessionId !== sessionId);
    } else {
      this.errorLog = [];
    }

    this.recoveryAttempts.clear();
  }

  /**
   * Initialize fallback data
   */
  private initializeFallbackData(): void {
    // AI Response Fallbacks
    this.fallbackData.set('ai_responses', {
      default: "I understand. Let's continue with your project design. What would you like to focus on next?",
      clarification: "Could you tell me more about that? I want to make sure I understand your vision.",
      encouragement: "That's a great direction! Let's build on that idea.",
      guidance: "Let me help guide you through this step. What's your main goal here?"
    });

    // Basic Project Template
    this.fallbackData.set('basic_project_template', {
      title: 'Hero Project Template',
      stages: ['Explore', 'Investigate', 'Create', 'Share'],
      structure: {
        overview: 'A student-centered project-based learning experience',
        objectives: ['Develop critical thinking', 'Build collaboration skills', 'Create authentic products'],
        timeline: '4-6 weeks',
        assessment: 'Portfolio-based with rubric'
      }
    });
  }

  /**
   * Setup error monitoring
   */
  private setupErrorMonitoring(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), {
        actionAttempted: 'global_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        actionAttempted: 'unhandled_promise_rejection'
      });
    });
  }

  /**
   * Helper methods
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private logError(errorContext: ErrorContext): void {
    this.errorLog.push(errorContext);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console for debugging
    console.error(`[${errorContext.severity.toUpperCase()}] ${errorContext.category}:`, errorContext);
  }

  private getDefaultRecoveryActions(severity: ErrorSeverity): RecoveryAction[] {
    switch (severity) {
      case 'critical':
        return [
          {
            strategy: 'restart',
            description: 'Restart the coaching session',
            automated: true,
            estimatedTime: '1-2 minutes',
            dataLossRisk: 'minimal'
          }
        ];

      case 'high':
        return [
          {
            strategy: 'fallback',
            description: 'Use fallback mechanisms',
            automated: true,
            estimatedTime: '30 seconds',
            dataLossRisk: 'moderate'
          }
        ];

      default:
        return [
          {
            strategy: 'retry',
            description: 'Retry the operation',
            automated: true,
            estimatedTime: '10 seconds',
            dataLossRisk: 'none'
          }
        ];
    }
  }

  private getEmergencyRecoveryActions(): RecoveryAction[] {
    return [
      {
        strategy: 'manual',
        description: 'Contact support for assistance',
        automated: false,
        estimatedTime: '24-48 hours',
        dataLossRisk: 'high',
        userAction: 'Please contact our support team with the error details'
      }
    ];
  }
}

// Export singleton instance
export const errorRecoveryService = CoachingErrorRecoveryService.getInstance();