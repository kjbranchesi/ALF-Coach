/**
 * Interactive Tool Curation Service Tests
 * 
 * Comprehensive tests for the tool curation service functionality
 */

import {
  InteractiveToolCurationService,
  type EducationalTool,
  ToolCategory,
  ToolType,
  Subject,
  SkillLevel,
  Platform,
  IntegrationMethod,
  BloomsLevel,
  ReviewStatus,
  type ToolSearchCriteria,
  type IntegrationContext
} from '../interactive-tool-curation-service';

import { SAMPLE_TOOLS } from '../../data/sample-tools';

describe('InteractiveToolCurationService', () => {
  let service: InteractiveToolCurationService;

  beforeEach(() => {
    service = new InteractiveToolCurationService();
  });

  describe('Tool Management', () => {
    it('should add a tool successfully', async () => {
      const tool = SAMPLE_TOOLS[0]; // PhET Simulations
      await service.addTool(tool);
      
      const retrievedTool = service.getTool(tool.id);
      expect(retrievedTool).toBeDefined();
      expect(retrievedTool?.name).toBe(tool.name);
    });

    it('should update a tool successfully', async () => {
      const tool = SAMPLE_TOOLS[0];
      await service.addTool(tool);
      
      const updates = { description: 'Updated description' };
      await service.updateTool(tool.id, updates);
      
      const retrievedTool = service.getTool(tool.id);
      expect(retrievedTool?.description).toBe('Updated description');
    });

    it('should delete a tool successfully', async () => {
      const tool = SAMPLE_TOOLS[0];
      await service.addTool(tool);
      
      await service.deleteTool(tool.id);
      
      const retrievedTool = service.getTool(tool.id);
      expect(retrievedTool).toBeUndefined();
    });

    it('should throw error when updating non-existent tool', async () => {
      await expect(service.updateTool('non-existent', {})).rejects.toThrow();
    });

    it('should throw error when deleting non-existent tool', async () => {
      await expect(service.deleteTool('non-existent')).rejects.toThrow();
    });
  });

  describe('Tool Search and Discovery', () => {
    beforeEach(async () => {
      // Add sample tools
      for (const tool of SAMPLE_TOOLS) {
        await service.addTool(tool);
      }
    });

    it('should search tools by query', () => {
      const criteria: ToolSearchCriteria = { query: 'simulation' };
      const results = service.searchTools(criteria);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(tool => tool.name.toLowerCase().includes('simulation'))).toBe(true);
    });

    it('should filter tools by category', () => {
      const criteria: ToolSearchCriteria = { category: ToolCategory.STEM_SIMULATION };
      const results = service.searchTools(criteria);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => tool.category === ToolCategory.STEM_SIMULATION)).toBe(true);
    });

    it('should filter tools by subject', () => {
      const criteria: ToolSearchCriteria = { subject: Subject.SCIENCE };
      const results = service.searchTools(criteria);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => tool.subjects.includes(Subject.SCIENCE))).toBe(true);
    });

    it('should filter tools by skill level', () => {
      const criteria: ToolSearchCriteria = { skillLevel: SkillLevel.BEGINNER };
      const results = service.searchTools(criteria);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => 
        tool.skillLevel === SkillLevel.BEGINNER || tool.skillLevel === SkillLevel.ADAPTIVE
      )).toBe(true);
    });

    it('should filter free tools only', () => {
      const criteria: ToolSearchCriteria = { freeOnly: true };
      const results = service.searchTools(criteria);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => 
        tool.licensing.type === 'free' || tool.licensing.type === 'open_source'
      )).toBe(true);
    });

    it('should filter by minimum rating', () => {
      const criteria: ToolSearchCriteria = { minRating: 4.0 };
      const results = service.searchTools(criteria);
      
      // Check that results have sufficient ratings
      results.forEach(tool => {
        if (tool.ratings && tool.ratings.length > 0) {
          const avgRating = tool.ratings.reduce((sum, r) => sum + r.rating, 0) / tool.ratings.length;
          expect(avgRating).toBeGreaterThanOrEqual(4.0);
        }
      });
    });

    it('should get tools by category', () => {
      const results = service.getToolsByCategory(ToolCategory.CODING_ENVIRONMENT);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => tool.category === ToolCategory.CODING_ENVIRONMENT)).toBe(true);
    });

    it('should get tools by subject', () => {
      const results = service.getToolsBySubject(Subject.TECHNOLOGY);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => tool.subjects.includes(Subject.TECHNOLOGY))).toBe(true);
    });

    it('should get tools by ALF stage', () => {
      const results = service.getToolsByALFStage('CATALYST');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(tool => tool.alfStageAlignment.catalyst.score >= 3)).toBe(true);
    });

    it('should rank search results by relevance', () => {
      const criteria: ToolSearchCriteria = { query: 'design' };
      const results = service.searchTools(criteria);
      
      if (results.length > 1) {
        // Check that results are ranked (higher scores first)
        for (let i = 0; i < results.length - 1; i++) {
          const currentScore = results[i].evaluation?.overallScore || 0;
          const nextScore = results[i + 1].evaluation?.overallScore || 0;
          // Allow for equal scores, just ensure no significant decrease in quality
          expect(currentScore).toBeGreaterThanOrEqual(nextScore - 1);
        }
      }
    });
  });

  describe('Integration Guidance', () => {
    beforeEach(async () => {
      await service.addTool(SAMPLE_TOOLS[0]); // PhET Simulations
    });

    it('should generate integration guidance', () => {
      const context: IntegrationContext = {
        platform: 'LMS',
        userRole: 'teacher',
        technicalExpertise: 'intermediate',
        classSize: 25,
        duration: '1 semester',
        customization: 'moderate',
        assessmentNeeds: ['formative', 'summative'],
        collaborationLevel: 'small_group'
      };

      const guidance = service.getIntegrationGuidance(SAMPLE_TOOLS[0].id, context);
      
      expect(guidance).toBeDefined();
      expect(guidance.toolId).toBe(SAMPLE_TOOLS[0].id);
      expect(guidance.setup).toBeDefined();
      expect(guidance.setup.length).toBeGreaterThan(0);
      expect(guidance.alfIntegration).toBeDefined();
      expect(guidance.alfIntegration.length).toBe(4); // Four ALF stages
      expect(guidance.bestPractices).toBeDefined();
      expect(guidance.bestPractices.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent tool', () => {
      const context: IntegrationContext = {
        platform: 'Standalone',
        userRole: 'teacher',
        technicalExpertise: 'beginner',
        classSize: 20,
        duration: '1 week',
        customization: 'minimal',
        assessmentNeeds: [],
        collaborationLevel: 'individual'
      };

      expect(() => service.getIntegrationGuidance('non-existent', context)).toThrow();
    });

    it('should adapt guidance based on context', () => {
      const beginnerContext: IntegrationContext = {
        platform: 'Standalone',
        userRole: 'teacher',
        technicalExpertise: 'beginner',
        classSize: 15,
        duration: '1 week',
        customization: 'minimal',
        assessmentNeeds: ['formative'],
        collaborationLevel: 'individual'
      };

      const advancedContext: IntegrationContext = {
        platform: 'LMS',
        userRole: 'administrator',
        technicalExpertise: 'advanced',
        classSize: 100,
        duration: '1 year',
        customization: 'extensive',
        assessmentNeeds: ['formative', 'summative', 'authentic'],
        collaborationLevel: 'whole_class'
      };

      const beginnerGuidance = service.getIntegrationGuidance(SAMPLE_TOOLS[0].id, beginnerContext);
      const advancedGuidance = service.getIntegrationGuidance(SAMPLE_TOOLS[0].id, advancedContext);

      // Advanced context should have longer estimated setup time
      const beginnerTime = parseInt(beginnerGuidance.estimatedSetupTime);
      const advancedTime = parseInt(advancedGuidance.estimatedSetupTime);
      expect(advancedTime).toBeGreaterThan(beginnerTime);
    });
  });

  describe('Tool Validation', () => {
    it('should validate required fields', async () => {
      const invalidTool: Partial<EducationalTool> = {
        id: 'test-tool',
        // Missing required fields like name, description, url, subjects
      };

      await expect(service.addTool(invalidTool as EducationalTool)).rejects.toThrow();
    });

    it('should validate URL format', async () => {
      const invalidTool: EducationalTool = {
        ...SAMPLE_TOOLS[0],
        id: 'test-invalid-url',
        url: 'not-a-valid-url'
      };

      await expect(service.addTool(invalidTool)).rejects.toThrow('Invalid URL format');
    });

    it('should validate age range', async () => {
      const invalidTool: EducationalTool = {
        ...SAMPLE_TOOLS[0],
        id: 'test-invalid-age',
        ageRange: {
          min: 18,
          max: 12, // Invalid: min > max
          description: 'Invalid range'
        }
      };

      await expect(service.addTool(invalidTool)).rejects.toThrow();
    });
  });

  describe('Analytics and Tracking', () => {
    beforeEach(async () => {
      await service.addTool(SAMPLE_TOOLS[0]);
    });

    it('should track tool usage', () => {
      const usageData = {
        totalUsers: 1000,
        activeUsers: 500,
        sessionDuration: 30
      };

      service.trackToolUsage(SAMPLE_TOOLS[0].id, usageData);
      
      const tool = service.getTool(SAMPLE_TOOLS[0].id);
      expect(tool?.usageMetrics.totalUsers).toBe(1000);
      expect(tool?.usageMetrics.activeUsers).toBe(500);
      expect(tool?.usageMetrics.sessionDuration).toBe(30);
    });

    it('should track student engagement', () => {
      const engagementData = {
        averageTimeOnTask: 25,
        interactionFrequency: 85,
        contentCompletion: 75
      };

      service.trackStudentEngagement(SAMPLE_TOOLS[0].id, engagementData);
      
      const tool = service.getTool(SAMPLE_TOOLS[0].id);
      expect(tool?.studentEngagement.averageTimeOnTask).toBe(25);
      expect(tool?.studentEngagement.interactionFrequency).toBe(85);
      expect(tool?.studentEngagement.contentCompletion).toBe(75);
    });

    it('should generate effectiveness report', () => {
      const report = service.generateEffectivenessReport(SAMPLE_TOOLS[0].id);
      
      expect(report).toBeDefined();
      expect(report.toolId).toBe(SAMPLE_TOOLS[0].id);
      expect(report.toolName).toBe(SAMPLE_TOOLS[0].name);
      expect(report.reportDate).toBeDefined();
      expect(report.usageSummary).toBeDefined();
      expect(report.communityFeedback).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.improvementAreas).toBeDefined();
    });

    it('should throw error for non-existent tool in analytics', () => {
      expect(() => service.generateEffectivenessReport('non-existent')).toThrow();
    });
  });

  describe('Data Import/Export', () => {
    beforeEach(async () => {
      await service.addTool(SAMPLE_TOOLS[0]);
    });

    it('should export tool data', () => {
      const jsonData = service.exportToolData(SAMPLE_TOOLS[0].id);
      
      expect(jsonData).toBeDefined();
      expect(typeof jsonData).toBe('string');
      
      const parsedData = JSON.parse(jsonData);
      expect(parsedData.id).toBe(SAMPLE_TOOLS[0].id);
      expect(parsedData.name).toBe(SAMPLE_TOOLS[0].name);
    });

    it('should import tool data', () => {
      const originalTool = service.getTool(SAMPLE_TOOLS[0].id);
      const jsonData = service.exportToolData(SAMPLE_TOOLS[0].id);
      
      // Modify and re-import
      const modifiedData = JSON.parse(jsonData);
      modifiedData.id = 'imported-tool';
      modifiedData.name = 'Imported Tool';
      
      service.importToolData(JSON.stringify(modifiedData));
      
      const importedTool = service.getTool('imported-tool');
      expect(importedTool).toBeDefined();
      expect(importedTool?.name).toBe('Imported Tool');
    });

    it('should throw error for invalid import data', () => {
      const invalidJson = '{ invalid json }';
      
      expect(() => service.importToolData(invalidJson)).toThrow();
    });

    it('should throw error for non-existent tool export', () => {
      expect(() => service.exportToolData('non-existent')).toThrow();
    });
  });

  describe('Collection Management', () => {
    beforeEach(async () => {
      // Add sample tools
      for (const tool of SAMPLE_TOOLS) {
        await service.addTool(tool);
      }
    });

    it('should create tool collection', async () => {
      const collection = {
        id: 'test-collection',
        name: 'Test Collection',
        description: 'A test collection',
        purpose: 'Testing',
        targetAudience: 'Developers',
        alfAlignment: {
          catalyst: { score: 4, rationale: 'Good for testing', examples: [] },
          issues: { score: 3, rationale: 'Moderate support', examples: [] },
          method: { score: 5, rationale: 'Excellent for method', examples: [] },
          engagement: { score: 4, rationale: 'Good engagement', examples: [] },
          overallAlignment: { score: 4, rationale: 'Good overall', examples: [] },
          specificUses: ['testing', 'development']
        },
        tools: [SAMPLE_TOOLS[0].id],
        learningPath: [],
        prerequisites: [],
        estimatedDuration: '1 hour',
        difficulty: SkillLevel.BEGINNER,
        tags: ['test'],
        curatedBy: 'Test Curator',
        createdDate: new Date(),
        lastUpdated: new Date(),
        usageCount: 0,
        rating: 4.5
      };

      await service.createToolCollection(collection);
      
      const retrievedCollection = service.getToolCollection(collection.id);
      expect(retrievedCollection).toBeDefined();
      expect(retrievedCollection?.name).toBe(collection.name);
    });

    it('should throw error for collection with non-existent tools', async () => {
      const collection = {
        id: 'invalid-collection',
        name: 'Invalid Collection',
        description: 'Collection with non-existent tools',
        purpose: 'Testing error handling',
        targetAudience: 'Developers',
        alfAlignment: {
          catalyst: { score: 3, rationale: 'Test', examples: [] },
          issues: { score: 3, rationale: 'Test', examples: [] },
          method: { score: 3, rationale: 'Test', examples: [] },
          engagement: { score: 3, rationale: 'Test', examples: [] },
          overallAlignment: { score: 3, rationale: 'Test', examples: [] },
          specificUses: []
        },
        tools: ['non-existent-tool'],
        learningPath: [],
        prerequisites: [],
        estimatedDuration: '1 hour',
        difficulty: SkillLevel.BEGINNER,
        tags: ['test'],
        curatedBy: 'Test Curator',
        createdDate: new Date(),
        lastUpdated: new Date(),
        usageCount: 0,
        rating: 4.5
      };

      await expect(service.createToolCollection(collection)).rejects.toThrow();
    });
  });

  describe('Offline Alternatives', () => {
    beforeEach(async () => {
      await service.addTool(SAMPLE_TOOLS[0]);
    });

    it('should add offline alternative', () => {
      const alternative = {
        toolId: SAMPLE_TOOLS[0].id,
        name: 'PhET Offline',
        description: 'Offline version of PhET simulations',
        downloadUrl: 'https://example.com/phet-offline.zip',
        fileSize: '500MB',
        requirements: SAMPLE_TOOLS[0].requirements,
        limitations: ['No automatic updates'],
        syncCapabilities: [],
        lastUpdated: new Date()
      };

      service.addOfflineAlternative(alternative);
      
      const retrievedAlternative = service.getOfflineAlternative(SAMPLE_TOOLS[0].id);
      expect(retrievedAlternative).toBeDefined();
      expect(retrievedAlternative?.name).toBe(alternative.name);
    });

    it('should get tools with offline alternatives', () => {
      const alternative = {
        toolId: SAMPLE_TOOLS[0].id,
        name: 'PhET Offline',
        description: 'Offline version',
        downloadUrl: 'https://example.com/offline.zip',
        fileSize: '500MB',
        requirements: SAMPLE_TOOLS[0].requirements,
        limitations: [],
        syncCapabilities: [],
        lastUpdated: new Date()
      };

      service.addOfflineAlternative(alternative);
      
      const toolsWithOffline = service.getToolsWithOfflineAlternatives();
      expect(toolsWithOffline.length).toBeGreaterThan(0);
      expect(toolsWithOffline.some(tool => tool.id === SAMPLE_TOOLS[0].id)).toBe(true);
    });
  });
});