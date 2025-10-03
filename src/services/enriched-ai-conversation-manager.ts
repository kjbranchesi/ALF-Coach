/**
 * Enriched AI Conversation Manager
 * 
 * Integrates the multi-stage content enrichment pipeline with the existing
 * AI conversation manager, providing seamless backward compatibility while
 * enabling enhanced content generation.
 */

import { AIConversationManager, type AIGenerationRequest, ConversationContext } from './ai-conversation-manager';
import { EnrichmentPipelineOrchestrator, type PipelineConfiguration, type PipelineResult } from './enrichment-pipeline-orchestrator';
import { logger } from '../utils/logger';

export interface EnrichmentSettings {
  enabled: boolean;
  mode: 'speed' | 'balanced' | 'quality';
  adaptiveMode: boolean; // Automatically adjust based on context
  fallbackToBasic: boolean; // Fall back to basic AI manager on failure
  tokenBudgetEnabled: boolean;
  maxTokenBudget: number;
}

export interface EnrichmentMetrics {
  totalRequests: number;
  enrichedRequests: number;
  fallbackRequests: number;
  averageEnrichmentTime: number;
  averageTokenUsage: number;
  successRate: number;
  enhancementsByType: Record<string, number>;
}

/**
 * Enhanced AI Conversation Manager with multi-stage content enrichment
 */
export class EnrichedAIConversationManager {
  private enrichmentOrchestrator: EnrichmentPipelineOrchestrator;
  private settings: EnrichmentSettings;
  private metrics: EnrichmentMetrics;
  private performanceHistory: Array<{ timestamp: number; processingTime: number; tokensUsed: number; success: boolean }> = [];

  constructor(
    private baseAIManager: AIConversationManager,
    initialSettings: Partial<EnrichmentSettings> = {}
  ) {
    this.enrichmentOrchestrator = new EnrichmentPipelineOrchestrator(baseAIManager);
    
    this.settings = {
      enabled: true,
      mode: 'balanced',
      adaptiveMode: true,
      fallbackToBasic: true,
      tokenBudgetEnabled: true,
      maxTokenBudget: 8000,
      ...initialSettings
    };

    this.metrics = {
      totalRequests: 0,
      enrichedRequests: 0,
      fallbackRequests: 0,
      averageEnrichmentTime: 0,
      averageTokenUsage: 0,
      successRate: 0,
      enhancementsByType: {}
    };

    logger.log('🎯 Enriched AI Conversation Manager initialized', {
      enrichmentEnabled: this.settings.enabled,
      mode: this.settings.mode
    });
  }

  /**
   * Main entry point - enhanced version of generateResponse
   */
  async generateResponse(request: AIGenerationRequest): Promise<string> {
    this.metrics.totalRequests++;
    
    // Determine if we should use enrichment
    if (this.shouldUseEnrichment(request)) {
      try {
        return await this.generateEnrichedResponse(request);
      } catch (error) {
        logger.error('Enrichment failed, falling back to basic AI:', error);
        
        if (this.settings.fallbackToBasic) {
          this.metrics.fallbackRequests++;
          return await this.baseAIManager.generateResponse(request);
        } else {
          throw error;
        }
      }
    } else {
      // Use basic AI manager
      logger.log('📝 Using basic AI generation');
      return await this.baseAIManager.generateResponse(request);
    }
  }

  /**
   * Generate response using the enrichment pipeline
   */
  private async generateEnrichedResponse(request: AIGenerationRequest): Promise<string> {
    const startTime = Date.now();
    
    logger.log('🎨 Generating enriched response', {
      action: request.action,
      mode: this.settings.mode
    });

    // Get appropriate configuration based on settings
    const config = this.getConfigurationForRequest(request);
    
    // Process through enrichment pipeline
    const result: PipelineResult = await this.enrichmentOrchestrator.processContent(request, config);
    
    // Update metrics
    this.updateMetrics(result, Date.now() - startTime);
    
    // Update performance history for adaptive behavior
    this.updatePerformanceHistory(result, Date.now() - startTime);
    
    if (result.success) {
      this.metrics.enrichedRequests++;
      logger.log('✨ Enriched response generated successfully', {
        tokensUsed: result.metadata.totalTokensUsed,
        processingTime: result.metadata.processingTimeMs,
        enhancementsApplied: Object.values(result.metadata.enhancementCounts).reduce((a, b) => a + b, 0)
      });
      
      return result.finalContent;
    } else {
      logger.warn('⚠️ Enrichment pipeline did not succeed fully', {
        error: result.error,
        stagesCompleted: result.stageResults.length
      });
      
      // Return best available content or fallback
      return result.finalContent || await this.baseAIManager.generateResponse(request);
    }
  }

  /**
   * Determine if enrichment should be used for this request
   */
  private shouldUseEnrichment(request: AIGenerationRequest): boolean {
    if (!this.settings.enabled) {
      return false;
    }

    // Always use enrichment for major content generation
    const enrichmentActions = [
      'stage_init',
      'step_entry',
      'process_big_idea',
      'process_essential_question',
      'process_challenge',
      'process_phases',
      'process_activities',
      'process_resources',
      'help'
    ];

    if (enrichmentActions.includes(request.action)) {
      return true;
    }

    // Skip enrichment for simple confirmations and quick responses
    const basicActions = [
      'confirm',
      'ideas',
      'whatif',
      'examples'
    ];

    if (basicActions.includes(request.action)) {
      return false;
    }

    // For adaptive mode, consider recent performance
    if (this.settings.adaptiveMode) {
      return this.shouldAdaptivelyUseEnrichment(request);
    }

    // Default to enrichment for unknown actions
    return true;
  }

  /**
   * Adaptive logic for enrichment usage based on performance history
   */
  private shouldAdaptivelyUseEnrichment(request: AIGenerationRequest): boolean {
    const recentHistory = this.performanceHistory.slice(-10); // Last 10 requests
    
    if (recentHistory.length < 3) {
      return true; // Not enough data, default to enrichment
    }

    const recentSuccessRate = recentHistory.filter(h => h.success).length / recentHistory.length;
    const averageTime = recentHistory.reduce((sum, h) => sum + h.processingTime, 0) / recentHistory.length;
    
    // If success rate is low or times are very high, be more conservative
    if (recentSuccessRate < 0.7 || averageTime > 60000) {
      logger.log('🤔 Adaptive mode: Reducing enrichment usage due to recent performance');
      return Math.random() > 0.5; // 50% chance
    }
    
    return true;
  }

  /**
   * Get pipeline configuration based on current settings and request context
   */
  private getConfigurationForRequest(request: AIGenerationRequest): PipelineConfiguration {
    let baseConfig: PipelineConfiguration;

    switch (this.settings.mode) {
      case 'speed':
        baseConfig = this.enrichmentOrchestrator.getSpeedOptimizedConfig();
        break;
      case 'quality':
        baseConfig = this.enrichmentOrchestrator.getQualityOptimizedConfig();
        break;
      case 'balanced':
      default:
        baseConfig = this.enrichmentOrchestrator.getDefaultConfig();
        break;
    }

    // Apply token budget if enabled
    if (this.settings.tokenBudgetEnabled) {
      baseConfig.tokenBudget = Math.min(
        baseConfig.tokenBudget || this.settings.maxTokenBudget,
        this.settings.maxTokenBudget
      );
    }

    // Adapt configuration based on action type
    if (request.action === 'help' || request.action === 'stage_init') {
      // For help and stage init, prioritize pedagogical enhancement
      baseConfig.enabledStages = [
        'base-generator',
        'curriculum-design-expert',
        'udl-differentiation-expert',
        'final-synthesis'
      ];
    } else if (request.action.startsWith('process_')) {
      // For processing actions, use full pipeline
      baseConfig = this.enrichmentOrchestrator.getQualityOptimizedConfig();
    }

    return baseConfig;
  }

  /**
   * Update metrics based on pipeline result
   */
  private updateMetrics(result: PipelineResult, processingTime: number): void {
    // Update running averages
    const total = this.metrics.enrichedRequests + this.metrics.fallbackRequests;
    
    this.metrics.averageEnrichmentTime = 
      (this.metrics.averageEnrichmentTime * total + processingTime) / (total + 1);
    
    this.metrics.averageTokenUsage = 
      (this.metrics.averageTokenUsage * total + result.metadata.totalTokensUsed) / (total + 1);
    
    // Update success rate
    this.metrics.successRate = 
      (this.metrics.successRate * total + (result.success ? 1 : 0)) / (total + 1);
    
    // Update enhancement counts
    Object.entries(result.metadata.enhancementCounts).forEach(([type, count]) => {
      this.metrics.enhancementsByType[type] = (this.metrics.enhancementsByType[type] || 0) + count;
    });
  }

  /**
   * Update performance history for adaptive behavior
   */
  private updatePerformanceHistory(result: PipelineResult, processingTime: number): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      processingTime,
      tokensUsed: result.metadata.totalTokensUsed,
      success: result.success
    });

    // Keep only recent history (last 50 requests)
    if (this.performanceHistory.length > 50) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }
  }

  /**
   * Configuration management methods
   */
  updateSettings(newSettings: Partial<EnrichmentSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    logger.log('⚙️ Enrichment settings updated', this.settings);
  }

  getSettings(): EnrichmentSettings {
    return { ...this.settings };
  }

  getMetrics(): EnrichmentMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detailed performance report
   */
  getPerformanceReport(): any {
    const recentHistory = this.performanceHistory.slice(-20);
    
    return {
      overallMetrics: this.metrics,
      recentPerformance: {
        averageTime: recentHistory.reduce((sum, h) => sum + h.processingTime, 0) / recentHistory.length,
        successRate: recentHistory.filter(h => h.success).length / recentHistory.length,
        averageTokens: recentHistory.reduce((sum, h) => sum + h.tokensUsed, 0) / recentHistory.length
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate performance-based recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.getPerformanceReport();

    if (report.recentPerformance.successRate < 0.8) {
      recommendations.push('Consider switching to speed mode to improve reliability');
    }

    if (report.recentPerformance.averageTime > 45000) {
      recommendations.push('Processing times are high - consider reducing token budget or using speed mode');
    }

    if (this.metrics.fallbackRequests / this.metrics.totalRequests > 0.2) {
      recommendations.push('High fallback rate detected - review enrichment criteria');
    }

    if (Object.values(this.metrics.enhancementsByType).reduce((a, b) => a + b, 0) < this.metrics.enrichedRequests * 2) {
      recommendations.push('Low enhancement application - consider enabling more stages');
    }

    return recommendations;
  }

  /**
   * Pass-through methods to maintain compatibility with base AI manager
   */
  updateContext(message: any): void {
    return this.baseAIManager.updateContext(message);
  }

  getContextWindow(): any[] {
    return this.baseAIManager.getContextWindow();
  }

  /**
   * Reset metrics and performance history
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      enrichedRequests: 0,
      fallbackRequests: 0,
      averageEnrichmentTime: 0,
      averageTokenUsage: 0,
      successRate: 0,
      enhancementsByType: {}
    };
    
    this.performanceHistory = [];
    
    logger.log('📊 Metrics and performance history reset');
  }

  /**
   * Force enrichment for next N requests (for testing/debugging)
   */
  forceEnrichmentMode(requests: number): void {
    const originalEnabled = this.settings.enabled;
    this.settings.enabled = true;
    
    setTimeout(() => {
      this.settings.enabled = originalEnabled;
      logger.log('🔄 Returned to normal enrichment mode');
    }, requests * 30000); // Assume 30s per request max
    
    logger.log(`🔧 Forcing enrichment mode for next ${requests} requests`);
  }

  /**
   * Get pipeline orchestrator metrics
   */
  getPipelineMetrics(): any {
    return this.enrichmentOrchestrator.getMetrics();
  }
}

/**
 * Factory function to create enriched AI manager
 */
export function createEnrichedAIConversationManager(
  apiKey: string,
  settings: Partial<EnrichmentSettings> = {}
): EnrichedAIConversationManager | null {
  try {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      logger.error('🔴 Enriched AI Manager: Invalid API key');
      return null;
    }

    // Create base AI manager
    const baseManager = new AIConversationManager(apiKey);
    
    // Create enriched manager
    const enrichedManager = new EnrichedAIConversationManager(baseManager, settings);
    
    logger.log('🎯 Enriched AI Conversation Manager created successfully');
    return enrichedManager;
  } catch (error) {
    logger.error('🔴 Failed to create Enriched AI Conversation Manager:', error);
    return null;
  }
}