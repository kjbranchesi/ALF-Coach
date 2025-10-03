/**
 * Comprehensive test suite for the content enrichment pipeline
 */

import { 
  EnrichmentPipelineOrchestrator,
  type PipelineConfiguration,
  PipelineResult 
} from '../enrichment-pipeline-orchestrator';

import {
  EnrichedAIConversationManager,
  EnrichmentSettings,
  createEnrichedAIConversationManager
} from '../enriched-ai-conversation-manager';

import {
  BaseGeneratorAgent,
  CurriculumDesignAgent,
  StandardsAlignmentAgent,
  UDLDifferentiationAgent,
  PBLRubricAssessmentAgent,
  FinalSynthesisAgent,
  QualityGateValidator,
  type EnrichmentContext
} from '../content-enrichment-pipeline';

import { AIConversationManager, type AIGenerationRequest } from '../ai-conversation-manager';

// Mock the AI conversation manager for testing
class MockAIConversationManager {
  async generateResponse(request: AIGenerationRequest): Promise<string> {
    // Simulate different responses based on request type
    switch (request.action) {
      case 'stage_init':
        return `**Welcome to ${request.stage}!** Let's explore this exciting stage together. We'll work through the key concepts and help you create something amazing for your students.`;
      
      case 'process_big_idea':
        return `Great thinking! "${request.userInput}" is a powerful concept. Let's develop this into a big idea that will engage your students and connect to real-world applications.`;
      
      case 'help':
        return `I'm here to support your learning journey design. Let's work together to create engaging experiences for your students. What aspect would you like to focus on?`;
      
      default:
        return `This is a mock response for ${request.action}. The content includes student engagement strategies and practical implementation guidance.`;
    }
  }

  updateContext(message: any): void {
    // Mock implementation
  }

  getContextWindow(): any[] {
    return [];
  }
}

describe('Content Enrichment Pipeline', () => {
  let mockAIManager: MockAIConversationManager;
  let orchestrator: EnrichmentPipelineOrchestrator;
  let enrichedManager: EnrichedAIConversationManager;

  beforeEach(() => {
    mockAIManager = new MockAIConversationManager();
    orchestrator = new EnrichmentPipelineOrchestrator(mockAIManager as any);
    enrichedManager = new EnrichedAIConversationManager(mockAIManager as any);
  });

  describe('Individual Agent Testing', () => {
    test('BaseGeneratorAgent produces valid content', async () => {
      const agent = new BaseGeneratorAgent(mockAIManager as any);
      const context = createMockContext();
      
      const result = await agent.enrich('', context);
      
      expect(result.stageId).toBe('base-generation');
      expect(result.content).toContain('Welcome to');
      expect(result.qualityScore).toBeGreaterThan(0.5);
      expect(result.passed).toBe(true);
      expect(result.enhancements).toHaveLength(1);
    });

    test('CurriculumDesignAgent enhances pedagogical content', async () => {
      const agent = new CurriculumDesignAgent(mockAIManager as any);
      const context = createMockContext();
      const baseContent = 'Basic learning content about science concepts.';
      
      const result = await agent.enrich(baseContent, context);
      
      expect(result.stageId).toBe('pedagogical-enhancement');
      expect(result.content).toContain('students');
      expect(result.qualityScore).toBeGreaterThan(0.6);
      expect(result.enhancements[0].type).toBe('pedagogical-structure');
    });

    test('StandardsAlignmentAgent integrates standards', async () => {
      const agent = new StandardsAlignmentAgent(mockAIManager as any);
      const context = createMockContext();
      const baseContent = 'Learning activity for middle school students.';
      
      const result = await agent.enrich(baseContent, context);
      
      expect(result.stageId).toBe('standards-alignment');
      expect(result.enhancements[0].type).toBe('standards-alignment');
      expect(result.qualityScore).toBeGreaterThan(0.6);
    });

    test('UDLDifferentiationAgent applies accessibility principles', async () => {
      const agent = new UDLDifferentiationAgent(mockAIManager as any);
      const context = createMockContext();
      const baseContent = 'Interactive learning experience for students.';
      
      const result = await agent.enrich(baseContent, context);
      
      expect(result.stageId).toBe('udl-differentiation');
      expect(result.enhancements[0].type).toBe('accessibility-improvement');
      expect(result.qualityScore).toBeGreaterThan(0.6);
    });

    test('PBLRubricAssessmentAgent integrates assessment strategies', async () => {
      const agent = new PBLRubricAssessmentAgent(mockAIManager as any);
      const context = createMockContext();
      const baseContent = 'Project-based learning activity.';
      
      const result = await agent.enrich(baseContent, context);
      
      expect(result.stageId).toBe('assessment-integration');
      expect(result.enhancements[0].type).toBe('assessment-integration');
      expect(result.qualityScore).toBeGreaterThan(0.6);
    });

    test('FinalSynthesisAgent ensures coherence', async () => {
      const agent = new FinalSynthesisAgent(mockAIManager as any);
      const context = createMockContext();
      const baseContent = 'Enhanced content with multiple layers of improvement.';
      
      const result = await agent.enrich(baseContent, context);
      
      expect(result.stageId).toBe('final-synthesis');
      expect(result.enhancements[0].type).toBe('coherence-enhancement');
      expect(result.qualityScore).toBeGreaterThan(0.7);
    });
  });

  describe('Quality Gate Validation', () => {
    test('Content coherence gate validates appropriately', () => {
      const gate = QualityGateValidator.createContentCoherenceGate();
      const context = createMockContext();
      
      // Test passing content
      const goodContent = "Let's work together to create an amazing learning experience. We'll focus on engaging your students through hands-on activities and meaningful connections.";
      expect(QualityGateValidator.validateQualityGate(gate, goodContent, context)).toBe(true);
      
      // Test failing content (too short)
      const badContent = "Short response.";
      expect(QualityGateValidator.validateQualityGate(gate, badContent, context)).toBe(false);
    });

    test('Quality criteria weight appropriately', () => {
      const gate = QualityGateValidator.createContentCoherenceGate();
      expect(gate.criteria).toHaveLength(3);
      
      const totalWeight = gate.criteria.reduce((sum, c) => sum + c.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 1);
    });
  });

  describe('Pipeline Orchestrator', () => {
    test('Default configuration includes required stages', () => {
      const config = orchestrator['getDefaultConfig']();
      
      expect(config.enabledStages).toContain('base-generator');
      expect(config.enabledStages).toContain('final-synthesis');
      expect(config.enableRollback).toBe(true);
      expect(config.enableCaching).toBe(true);
      expect(config.tokenBudget).toBeGreaterThan(0);
    });

    test('Speed optimized configuration reduces stages', () => {
      const config = orchestrator.getSpeedOptimizedConfig();
      
      expect(config.enabledStages.length).toBeLessThan(6);
      expect(config.enabledStages).toContain('base-generator');
      expect(config.enabledStages).toContain('final-synthesis');
      expect(config.timeoutMs).toBeLessThan(300000);
    });

    test('Quality optimized configuration includes all stages', () => {
      const config = orchestrator.getQualityOptimizedConfig();
      
      expect(config.enabledStages).toHaveLength(6);
      expect(config.enabledStages).toContain('curriculum-design-expert');
      expect(config.enabledStages).toContain('standards-alignment-specialist');
      expect(config.enabledStages).toContain('udl-differentiation-expert');
      expect(config.enabledStages).toContain('pbl-rubric-assessment-expert');
    });

    test('Pipeline processes content through multiple stages', async () => {
      const request = createMockRequest('stage_init');
      const config = orchestrator.getSpeedOptimizedConfig();
      
      const result = await orchestrator.processContent(request, config);
      
      expect(result.success).toBe(true);
      expect(result.finalContent).toBeTruthy();
      expect(result.stageResults.length).toBeGreaterThan(0);
      expect(result.metadata.totalTokensUsed).toBeGreaterThan(0);
      expect(result.metadata.processingTimeMs).toBeGreaterThan(0);
    });

    test('Pipeline respects token budget limits', async () => {
      const request = createMockRequest('process_big_idea');
      const config: PipelineConfiguration = {
        ...orchestrator.getQualityOptimizedConfig(),
        tokenBudget: 1000 // Very low budget
      };
      
      const result = await orchestrator.processContent(request, config);
      
      expect(result.metadata.totalTokensUsed).toBeLessThanOrEqual(1000);
    });

    test('Pipeline handles stage failures gracefully', async () => {
      // Create a failing mock AI manager
      const failingAIManager = {
        generateResponse: jest.fn().mockRejectedValue(new Error('AI service unavailable'))
      };
      
      const failingOrchestrator = new EnrichmentPipelineOrchestrator(failingAIManager as any);
      const request = createMockRequest('help');
      const config = failingOrchestrator['getDefaultConfig']();
      
      const result = await failingOrchestrator.processContent(request, config);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.finalContent).toBeTruthy(); // Should have fallback content
    });
  });

  describe('Enriched AI Conversation Manager', () => {
    test('Determines enrichment usage correctly', () => {
      // Test actions that should use enrichment
      const enrichmentActions = ['stage_init', 'step_entry', 'process_big_idea', 'help'];
      enrichmentActions.forEach(action => {
        const request = createMockRequest(action);
        const shouldEnrich = enrichedManager['shouldUseEnrichment'](request);
        expect(shouldEnrich).toBe(true);
      });

      // Test actions that should not use enrichment
      const basicActions = ['confirm', 'ideas', 'whatif'];
      basicActions.forEach(action => {
        const request = createMockRequest(action);
        const shouldEnrich = enrichedManager['shouldUseEnrichment'](request);
        expect(shouldEnrich).toBe(false);
      });
    });

    test('Adapts configuration based on request type', () => {
      const helpRequest = createMockRequest('help');
      const config = enrichedManager['getConfigurationForRequest'](helpRequest);
      
      expect(config.enabledStages).toContain('curriculum-design-expert');
      expect(config.enabledStages).toContain('udl-differentiation-expert');
    });

    test('Updates metrics correctly', async () => {
      const initialMetrics = enrichedManager.getMetrics();
      expect(initialMetrics.totalRequests).toBe(0);
      
      const request = createMockRequest('stage_init');
      await enrichedManager.generateResponse(request);
      
      const updatedMetrics = enrichedManager.getMetrics();
      expect(updatedMetrics.totalRequests).toBe(1);
      expect(updatedMetrics.enrichedRequests).toBeGreaterThan(0);
    });

    test('Settings can be updated', () => {
      const newSettings = {
        mode: 'speed' as const,
        tokenBudgetEnabled: false,
        maxTokenBudget: 5000
      };
      
      enrichedManager.updateSettings(newSettings);
      const settings = enrichedManager.getSettings();
      
      expect(settings.mode).toBe('speed');
      expect(settings.tokenBudgetEnabled).toBe(false);
      expect(settings.maxTokenBudget).toBe(5000);
    });

    test('Performance report provides useful insights', () => {
      const report = enrichedManager.getPerformanceReport();
      
      expect(report).toHaveProperty('overallMetrics');
      expect(report).toHaveProperty('recentPerformance');
      expect(report).toHaveProperty('recommendations');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    test('Fallback works when enrichment is disabled', async () => {
      enrichedManager.updateSettings({ enabled: false });
      
      const request = createMockRequest('stage_init');
      const response = await enrichedManager.generateResponse(request);
      
      expect(response).toBeTruthy();
      expect(response).toContain('Welcome to');
    });
  });

  describe('Factory Functions', () => {
    test('createEnrichedAIConversationManager creates valid instance', () => {
      const manager = createEnrichedAIConversationManager('test-api-key');
      
      expect(manager).toBeInstanceOf(EnrichedAIConversationManager);
      expect(manager?.getSettings().enabled).toBe(true);
    });

    test('createEnrichedAIConversationManager handles invalid API key', () => {
      const manager = createEnrichedAIConversationManager('');
      
      expect(manager).toBeNull();
    });

    test('createEnrichedAIConversationManager applies custom settings', () => {
      const customSettings = {
        mode: 'quality' as const,
        adaptiveMode: false
      };
      
      const manager = createEnrichedAIConversationManager('test-api-key', customSettings);
      
      expect(manager?.getSettings().mode).toBe('quality');
      expect(manager?.getSettings().adaptiveMode).toBe(false);
    });
  });

  describe('Integration Testing', () => {
    test('End-to-end enrichment flow works correctly', async () => {
      const request = createMockRequest('process_big_idea');
      request.userInput = 'Environmental sustainability in our community';
      
      const response = await enrichedManager.generateResponse(request);
      
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(50);
      
      const metrics = enrichedManager.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.enrichedRequests).toBeGreaterThan(0);
    });

    test('Pipeline maintains context across requests', () => {
      const message = { role: 'user', content: 'Test message' };
      enrichedManager.updateContext(message);
      
      const context = enrichedManager.getContextWindow();
      expect(Array.isArray(context)).toBe(true);
    });

    test('Metrics reset functionality works', () => {
      // Generate some activity first
      enrichedManager['metrics'].totalRequests = 5;
      enrichedManager['metrics'].enrichedRequests = 3;
      
      enrichedManager.resetMetrics();
      
      const metrics = enrichedManager.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.enrichedRequests).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('Pipeline handles network errors gracefully', async () => {
      const networkErrorAI = {
        generateResponse: jest.fn().mockRejectedValue(new Error('Network timeout'))
      };
      
      const errorOrchestrator = new EnrichmentPipelineOrchestrator(networkErrorAI as any);
      const request = createMockRequest('stage_init');
      
      const result = await errorOrchestrator.processContent(request, errorOrchestrator['getDefaultConfig']());
      
      expect(result.success).toBe(false);
      expect(result.finalContent).toBeTruthy(); // Should have fallback
    });

    test('Quality gate failures trigger appropriate responses', async () => {
      // Create a gate that always fails
      const strictGate = {
        stageId: 'all',
        threshold: 0.99, // Nearly impossible to achieve
        rollbackOnFailure: true,
        criteria: [{
          name: 'impossible-standard',
          weight: 1.0,
          validator: () => 0.1 // Always low score
        }]
      };

      const config: PipelineConfiguration = {
        ...orchestrator['getDefaultConfig'](),
        qualityGates: [strictGate]
      };

      const request = createMockRequest('stage_init');
      const result = await orchestrator.processContent(request, config);

      expect(result.metadata.rollbackOccurred).toBe(true);
    });
  });
});

// Helper functions for testing
function createMockContext(): EnrichmentContext {
  return {
    originalRequest: createMockRequest('stage_init'),
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
    qualityGates: []
  };
}

function createMockRequest(action: string): AIGenerationRequest {
  return {
    action,
    stage: 'IDEATION',
    step: 'test-step',
    userInput: 'Test user input for the learning experience',
    context: {
      messages: [],
      userData: {
        subject: 'Science',
        ageGroup: 'Middle School',
        location: 'Urban School District',
        scope: 'unit',
        motivation: 'Create engaging STEM experiences'
      },
      capturedData: {
        'ideation.bigIdea': 'Scientific inquiry and discovery',
        'ideation.essentialQuestion': 'How do we solve real-world problems using science?'
      },
      currentPhase: 'ideation'
    },
    requirements: []
  };
}