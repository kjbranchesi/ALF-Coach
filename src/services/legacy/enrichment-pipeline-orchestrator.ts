/**
 * Content Enrichment Pipeline Orchestrator
 * 
 * Coordinates the multi-stage content enrichment process with quality gates,
 * error recovery, and token optimization.
 */

import {
  EnrichmentStage,
  EnrichmentContext,
  StageResult,
  QualityGate,
  EnrichmentMetadata,
  EnrichmentAgent,
  BaseGeneratorAgent,
  CurriculumDesignAgent,
  StandardsAlignmentAgent,
  UDLDifferentiationAgent,
  PBLRubricAssessmentAgent,
  FinalSynthesisAgent,
  QualityGateValidator,
  AgentType
} from './content-enrichment-pipeline';

import { AIConversationManager, AIGenerationRequest } from './ai-conversation-manager';
import { logger } from '../utils/logger';

export interface PipelineConfiguration {
  enabledStages: AgentType[];
  qualityGates: QualityGate[];
  maxRetries: number;
  timeoutMs: number;
  tokenBudget?: number;
  enableRollback: boolean;
  enableCaching: boolean;
}

export interface PipelineResult {
  finalContent: string;
  metadata: EnrichmentMetadata;
  stageResults: StageResult[];
  success: boolean;
  error?: string;
}

export class EnrichmentPipelineOrchestrator {
  private agents: Map<AgentType, EnrichmentAgent>;
  private stages: EnrichmentStage[];
  private cache: Map<string, PipelineResult> = new Map();
  private readonly cacheExpiry = 10 * 60 * 1000; // 10 minutes

  constructor(private aiManager: AIConversationManager) {
    this.initializeAgents();
    this.defineStages();
  }

  /**
   * Main entry point for content enrichment
   */
  async processContent(
    request: AIGenerationRequest,
    config: PipelineConfiguration = this.getDefaultConfig()
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    
    logger.log('🚀 Starting content enrichment pipeline', {
      action: request.action,
      stage: request.stage,
      enabledStages: config.enabledStages
    });

    // Check cache if enabled
    if (config.enableCaching) {
      const cached = this.getCachedResult(request, config);
      if (cached) {
        logger.log('📋 Returning cached pipeline result');
        return cached;
      }
    }

    const context: EnrichmentContext = {
      originalRequest: request,
      stageResults: new Map(),
      metadata: {
        totalTokensUsed: 0,
        processingTimeMs: 0,
        qualityScores: {},
        enhancementCounts: {
          'pedagogical-structure': 0,
          'standards-alignment': 0,
          'accessibility-improvement': 0,
          'assessment-integration': 0,
          'coherence-enhancement': 0,
          'depth-expansion': 0
        },
        failedStages: [],
        rollbackOccurred: false
      },
      qualityGates: config.qualityGates
    };

    try {
      const result = await this.executeStages(context, config);
      
      result.metadata.processingTimeMs = Date.now() - startTime;
      
      // Cache successful results
      if (config.enableCaching && result.success) {
        this.cacheResult(request, config, result);
      }

      logger.log('✅ Pipeline completed', {
        success: result.success,
        totalTime: result.metadata.processingTimeMs,
        tokensUsed: result.metadata.totalTokensUsed,
        stagesCompleted: result.stageResults.length
      });

      return result;
    } catch (error) {
      logger.error('❌ Pipeline execution failed:', error);
      
      return {
        finalContent: await this.generateFallbackContent(request),
        metadata: {
          ...context.metadata,
          processingTimeMs: Date.now() - startTime
        },
        stageResults: Array.from(context.stageResults.values()),
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute all enabled stages in sequence
   */
  private async executeStages(
    context: EnrichmentContext,
    config: PipelineConfiguration
  ): Promise<PipelineResult> {
    let currentContent = '';
    const completedStages: StageResult[] = [];
    
    // Filter stages to only enabled ones
    const enabledStages = this.stages.filter(stage => 
      config.enabledStages.includes(stage.agentType)
    );

    for (const stage of enabledStages) {
      try {
        logger.log(`🔄 Processing stage: ${stage.name}`);
        
        // Check dependencies
        if (!this.checkDependencies(stage, context)) {
          logger.warn(`⚠️ Skipping stage ${stage.name} - dependencies not met`);
          continue;
        }

        // Check token budget
        if (config.tokenBudget && context.metadata.totalTokensUsed >= config.tokenBudget) {
          logger.warn(`⚠️ Token budget exceeded, skipping remaining stages`);
          break;
        }

        const agent = this.agents.get(stage.agentType);
        if (!agent) {
          throw new Error(`Agent not found for stage: ${stage.agentType}`);
        }

        // Execute stage with timeout
        const stageResult = await this.executeStageWithTimeout(
          agent,
          currentContent,
          context,
          stage.timeout
        );

        // Update metadata
        context.metadata.totalTokensUsed += stageResult.agentMetadata.tokensUsed;
        context.metadata.qualityScores[stage.id] = stageResult.qualityScore;
        
        // Count enhancements
        stageResult.enhancements.forEach(enhancement => {
          context.metadata.enhancementCounts[enhancement.type]++;
        });

        // Store stage result
        context.stageResults.set(stage.id, stageResult);
        completedStages.push(stageResult);

        // Apply quality gates
        if (!this.validateQualityGates(stage, stageResult, context, config)) {
          if (config.enableRollback && stage.required) {
            logger.warn(`🔄 Rolling back due to quality gate failure in required stage: ${stage.name}`);
            return await this.performRollback(context, config, stage);
          } else {
            logger.warn(`⚠️ Quality gate failed for optional stage: ${stage.name}, continuing`);
            context.metadata.failedStages.push(stage.id);
          }
        }

        // Update content for next stage
        if (stageResult.passed) {
          currentContent = stageResult.content;
          logger.log(`✅ Stage ${stage.name} completed successfully`);
        } else {
          logger.warn(`⚠️ Stage ${stage.name} did not pass internal validation`);
          context.metadata.failedStages.push(stage.id);
        }

      } catch (error) {
        logger.error(`❌ Stage ${stage.name} failed:`, error);
        context.metadata.failedStages.push(stage.id);
        
        if (stage.required) {
          throw new Error(`Required stage ${stage.name} failed: ${error}`);
        }
      }
    }

    return {
      finalContent: currentContent || await this.generateFallbackContent(context.originalRequest),
      metadata: context.metadata,
      stageResults: completedStages,
      success: completedStages.length > 0 && context.metadata.failedStages.length === 0
    };
  }

  /**
   * Execute a single stage with timeout protection
   */
  private async executeStageWithTimeout(
    agent: EnrichmentAgent,
    content: string,
    context: EnrichmentContext,
    timeoutMs: number
  ): Promise<StageResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Stage ${agent.name} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      agent.enrich(content, context)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Check if stage dependencies are satisfied
   */
  private checkDependencies(stage: EnrichmentStage, context: EnrichmentContext): boolean {
    return stage.dependencies.every(depId => context.stageResults.has(depId));
  }

  /**
   * Validate quality gates for a stage
   */
  private validateQualityGates(
    stage: EnrichmentStage,
    result: StageResult,
    context: EnrichmentContext,
    config: PipelineConfiguration
  ): boolean {
    const relevantGates = config.qualityGates.filter(gate => 
      gate.stageId === stage.id || gate.stageId === 'all'
    );

    return relevantGates.every(gate => 
      QualityGateValidator.validateQualityGate(gate, result.content, context)
    );
  }

  /**
   * Perform rollback to previous successful stage
   */
  private async performRollback(
    context: EnrichmentContext,
    config: PipelineConfiguration,
    failedStage: EnrichmentStage
  ): Promise<PipelineResult> {
    logger.log(`🔄 Performing rollback from stage: ${failedStage.name}`);
    
    context.metadata.rollbackOccurred = true;
    
    // Find the last successful stage
    const stageResults = Array.from(context.stageResults.values());
    const lastSuccessful = stageResults
      .filter(r => r.passed)
      .sort((a, b) => b.processingTime - a.processingTime)[0];

    if (lastSuccessful) {
      logger.log(`📍 Rolling back to: ${lastSuccessful.stageId}`);
      return {
        finalContent: lastSuccessful.content,
        metadata: context.metadata,
        stageResults: stageResults.filter(r => r.passed),
        success: true
      };
    }

    // If no successful stages, use fallback
    return {
      finalContent: await this.generateFallbackContent(context.originalRequest),
      metadata: context.metadata,
      stageResults: [],
      success: false,
      error: 'Rollback required but no successful stages found'
    };
  }

  /**
   * Generate fallback content using the base AI manager
   */
  private async generateFallbackContent(request: AIGenerationRequest): Promise<string> {
    try {
      logger.log('🛟 Generating fallback content');
      return await this.aiManager.generateResponse(request);
    } catch (error) {
      logger.error('Fallback content generation failed:', error);
      return "I'm here to help you with your learning journey. Let's work together to create something amazing for your students!";
    }
  }

  /**
   * Initialize all specialized agents
   */
  private initializeAgents(): void {
    this.agents = new Map([
      ['base-generator', new BaseGeneratorAgent(this.aiManager)],
      ['curriculum-design-expert', new CurriculumDesignAgent(this.aiManager)],
      ['standards-alignment-specialist', new StandardsAlignmentAgent(this.aiManager)],
      ['udl-differentiation-expert', new UDLDifferentiationAgent(this.aiManager)],
      ['pbl-rubric-assessment-expert', new PBLRubricAssessmentAgent(this.aiManager)],
      ['final-synthesis', new FinalSynthesisAgent(this.aiManager)]
    ]);

    logger.log(`✅ Initialized ${this.agents.size} enrichment agents`);
  }

  /**
   * Define the enrichment stages and their dependencies
   */
  private defineStages(): void {
    this.stages = [
      {
        id: 'base-generation',
        name: 'Base Content Generation',
        description: 'Generate initial content from user input',
        agentType: 'base-generator',
        dependencies: [],
        required: true,
        timeout: 30000
      },
      {
        id: 'pedagogical-enhancement',
        name: 'Pedagogical Enhancement',
        description: 'Add curriculum design expertise and learning theory',
        agentType: 'curriculum-design-expert',
        dependencies: ['base-generation'],
        required: false,
        timeout: 45000
      },
      {
        id: 'standards-alignment',
        name: 'Standards Alignment',
        description: 'Align content with educational standards',
        agentType: 'standards-alignment-specialist',
        dependencies: ['pedagogical-enhancement'],
        required: false,
        timeout: 35000
      },
      {
        id: 'udl-differentiation',
        name: 'UDL Differentiation',
        description: 'Apply Universal Design for Learning principles',
        agentType: 'udl-differentiation-expert',
        dependencies: ['standards-alignment'],
        required: false,
        timeout: 40000
      },
      {
        id: 'assessment-integration',
        name: 'Assessment Integration',
        description: 'Integrate authentic assessment strategies',
        agentType: 'pbl-rubric-assessment-expert',
        dependencies: ['udl-differentiation'],
        required: false,
        timeout: 35000
      },
      {
        id: 'final-synthesis',
        name: 'Final Synthesis',
        description: 'Ensure coherence and unified voice',
        agentType: 'final-synthesis',
        dependencies: ['assessment-integration'],
        required: true,
        timeout: 30000
      }
    ];

    logger.log(`✅ Defined ${this.stages.length} enrichment stages`);
  }

  /**
   * Get default pipeline configuration
   */
  private getDefaultConfig(): PipelineConfiguration {
    return {
      enabledStages: [
        'base-generator',
        'curriculum-design-expert',
        'udl-differentiation-expert',
        'final-synthesis'
      ],
      qualityGates: [
        QualityGateValidator.createContentCoherenceGate()
      ],
      maxRetries: 2,
      timeoutMs: 300000, // 5 minutes total
      tokenBudget: 8000, // Conservative budget
      enableRollback: true,
      enableCaching: true
    };
  }

  /**
   * Get configuration optimized for speed
   */
  getSpeedOptimizedConfig(): PipelineConfiguration {
    return {
      enabledStages: [
        'base-generator',
        'curriculum-design-expert',
        'final-synthesis'
      ],
      qualityGates: [],
      maxRetries: 1,
      timeoutMs: 120000, // 2 minutes
      tokenBudget: 4000,
      enableRollback: false,
      enableCaching: true
    };
  }

  /**
   * Get configuration optimized for quality
   */
  getQualityOptimizedConfig(): PipelineConfiguration {
    return {
      enabledStages: [
        'base-generator',
        'curriculum-design-expert',
        'standards-alignment-specialist',
        'udl-differentiation-expert',
        'pbl-rubric-assessment-expert',
        'final-synthesis'
      ],
      qualityGates: [
        QualityGateValidator.createContentCoherenceGate(),
        // Additional quality gates could be added here
      ],
      maxRetries: 3,
      timeoutMs: 600000, // 10 minutes
      tokenBudget: 12000,
      enableRollback: true,
      enableCaching: true
    };
  }

  /**
   * Cache management
   */
  private getCachedResult(request: AIGenerationRequest, config: PipelineConfiguration): PipelineResult | null {
    const cacheKey = this.generateCacheKey(request, config);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }
    
    return null;
  }

  private cacheResult(request: AIGenerationRequest, config: PipelineConfiguration, result: PipelineResult): void {
    const cacheKey = this.generateCacheKey(request, config);
    this.cache.set(cacheKey, result);
    
    // Cleanup old cache entries
    if (this.cache.size > 50) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private generateCacheKey(request: AIGenerationRequest, config: PipelineConfiguration): string {
    const contextHash = JSON.stringify({
      action: request.action,
      stage: request.stage,
      step: request.step,
      enabledStages: config.enabledStages.sort(),
      userInput: request.userInput?.substring(0, 100) // First 100 chars only
    });
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < contextHash.length; i++) {
      const char = contextHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `pipeline_${hash.toString(36)}_${Date.now()}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = parseInt(cacheKey.split('_').pop() || '0');
    return Date.now() - timestamp < this.cacheExpiry;
  }

  /**
   * Get pipeline status and metrics
   */
  getMetrics(): any {
    return {
      totalAgents: this.agents.size,
      totalStages: this.stages.length,
      cacheSize: this.cache.size,
      availableConfigs: ['default', 'speed-optimized', 'quality-optimized']
    };
  }
}