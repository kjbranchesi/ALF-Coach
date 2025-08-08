/**
 * EnrichmentAdapter.ts - Adapter to integrate Phase 3/4 enrichment services
 * with the ChatInterface and SOPFlowManager
 */

import { 
  BaseGeneratorAgent,
  CurriculumDesignAgent,
  StandardsAlignmentAgent,
  UDLDifferentiationAgent,
  PBLRubricAssessmentAgent,
  FinalSynthesisAgent,
  QualityGateValidator
} from '../../services/content-enrichment-pipeline';
import { ComprehensiveContentValidator } from '../../services/comprehensive-content-validator';
import { LearningObjectivesEngine } from '../../services/learning-objectives-engine';
import { FormativeAssessmentService } from '../../services/formative-assessment-service';
import { SOPStep } from '../types/SOPTypes';

export interface EnrichmentResult {
  enrichedContent: string;
  validationScore?: number;
  learningObjectives?: string[];
  assessmentSuggestions?: string[];
  standardsAlignment?: string[];
  udlSuggestions?: string[];
  metadata?: any;
}

export class EnrichmentAdapter {
  private validator: ComprehensiveContentValidator;
  private objectivesEngine: LearningObjectivesEngine;
  private assessmentService: FormativeAssessmentService;
  private curriculumAgent: CurriculumDesignAgent;
  private standardsAgent: StandardsAlignmentAgent;
  private udlAgent: UDLDifferentiationAgent;
  private rubricAgent: PBLRubricAssessmentAgent;
  private synthsisAgent: FinalSynthesisAgent;

  constructor() {
    this.validator = new ComprehensiveContentValidator();
    this.objectivesEngine = new LearningObjectivesEngine();
    this.assessmentService = new FormativeAssessmentService();
    this.curriculumAgent = new CurriculumDesignAgent();
    this.standardsAgent = new StandardsAlignmentAgent();
    this.udlAgent = new UDLDifferentiationAgent();
    this.rubricAgent = new PBLRubricAssessmentAgent();
    this.synthsisAgent = new FinalSynthesisAgent();
  }

  /**
   * Main enrichment function to process AI responses
   */
  async enrichAIResponse(
    originalContent: string,
    currentStep: SOPStep,
    blueprintContext: any
  ): Promise<EnrichmentResult> {
    // Enable enrichment with proper error handling
    // return { enrichedContent: originalContent };
    
    // TODO: Fix enrichment services data format issues
    try {
      const result: EnrichmentResult = {
        enrichedContent: originalContent
      };

      // 1. Validate content quality
      try {
        // Ensure content is a string
        const contentToValidate = typeof originalContent === 'string' ? originalContent : JSON.stringify(originalContent);
        
        const validationResult = await this.validator.validateContent({
          content: contentToValidate,
          context: { step: currentStep, blueprint: blueprintContext }
        });
        result.validationScore = validationResult.score;
        
        // If quality is too low, try to enhance it
        if (validationResult.score < 0.7) {
          result.enrichedContent = await this.enhanceContent(contentToValidate, currentStep, blueprintContext);
        }
      } catch (error) {
        console.warn('Content validation failed:', error);
      }

      // 2. Stage-specific enrichments
      if (currentStep === 'IDEATION_CHALLENGE' || currentStep === 'IDEATION_CLARIFIER') {
        // Generate learning objectives after ideation is complete
        try {
          const objectives = await this.generateLearningObjectives(blueprintContext);
          if (objectives.length > 0) {
            result.learningObjectives = objectives;
          }
        } catch (error) {
          console.warn('Learning objectives generation failed:', error);
        }
      }

      if (currentStep.startsWith('JOURNEY_')) {
        // Generate standards alignment for journey planning
        try {
          const standards = await this.generateStandardsAlignment(blueprintContext);
          if (standards.length > 0) {
            result.standardsAlignment = standards;
          }
        } catch (error) {
          console.warn('Standards alignment failed:', error);
        }

        // Generate UDL suggestions
        try {
          const udlSuggestions = await this.generateUDLSuggestions(blueprintContext);
          if (udlSuggestions.length > 0) {
            result.udlSuggestions = udlSuggestions;
          }
        } catch (error) {
          console.warn('UDL suggestions failed:', error);
        }
      }

      if (currentStep.startsWith('DELIVER_')) {
        // Generate formative assessments
        try {
          const assessments = await this.generateFormativeAssessments(blueprintContext);
          if (assessments.length > 0) {
            result.assessmentSuggestions = assessments;
          }
        } catch (error) {
          console.warn('Assessment generation failed:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('Enrichment adapter error:', error);
      return { enrichedContent: originalContent };
    }
    // */
  }

  /**
   * Enhance low-quality content using curriculum design agent
   */
  private async enhanceContent(
    content: string,
    step: SOPStep,
    context: any
  ): Promise<string> {
    try {
      const enhanced = await this.curriculumAgent.enrich({
        content,
        context: {
          step,
          wizardData: context.wizard,
          ideationData: context.ideation,
          journeyData: context.journey
        }
      });
      return enhanced.enrichedContent || content;
    } catch (error) {
      console.error('Content enhancement failed:', error);
      return content;
    }
  }

  /**
   * Generate learning objectives based on ideation
   */
  private async generateLearningObjectives(context: any): Promise<string[]> {
    if (!context.ideation?.bigIdea || !context.ideation?.essentialQuestion) {
      return [];
    }

    try {
      const objectives = await this.objectivesEngine.generateObjectives({
        bigIdea: context.ideation.bigIdea || '',
        essentialQuestion: context.ideation.essentialQuestion || '',
        challenge: context.ideation.challenge || '',
        subject: context.wizard?.subject || 'General',
        gradeLevel: context.wizard?.students || 'Mixed'
      });

      return objectives?.map((obj: any) => 
        typeof obj === 'string' ? obj : (obj.objective || obj.description || '')
      ).filter(Boolean) || [];
    } catch (error) {
      console.error('Learning objectives generation failed:', error);
      return [];
    }
  }

  /**
   * Generate standards alignment suggestions
   */
  private async generateStandardsAlignment(context: any): Promise<string[]> {
    try {
      const journeyContent = context.journey ? JSON.stringify(context.journey) : '';
      
      const alignmentResult = await this.standardsAgent.enrich({
        content: journeyContent,
        context: {
          wizardData: context.wizard || {},
          ideationData: context.ideation || {},
          originalRequest: {
            type: 'standards-alignment',
            content: journeyContent
          }
        }
      });

      // Extract standards from the enriched content
      const standards: string[] = [];
      if (alignmentResult?.metadata?.standards) {
        standards.push(...alignmentResult.metadata.standards);
      }
      
      return standards;
    } catch (error) {
      console.error('Standards alignment failed:', error);
      return [];
    }
  }

  /**
   * Generate UDL suggestions for accessibility
   */
  private async generateUDLSuggestions(context: any): Promise<string[]> {
    try {
      const journeyContent = context.journey ? JSON.stringify(context.journey) : '';
      
      const udlResult = await this.udlAgent.enrich({
        content: journeyContent,
        context: {
          wizardData: context.wizard || {},
          ideationData: context.ideation || {},
          journeyData: context.journey || {}
        }
      });

      // Extract UDL suggestions from the enriched content
      const suggestions: string[] = [];
      if (udlResult?.metadata?.udlStrategies) {
        suggestions.push(...udlResult.metadata.udlStrategies);
      }
      
      return suggestions;
    } catch (error) {
      console.error('UDL suggestions failed:', error);
      return [];
    }
  }
  
  /**
   * Sanitize context data to prevent undefined property access
   * CRITICAL: Ensures all string fields are actual strings to prevent toLowerCase errors
   */
  private sanitizeContextData(data: any): any {
    if (!data || typeof data !== 'object') {
      return {};
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        sanitized[key] = '';
      } else if (typeof value === 'string') {
        sanitized[key] = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = String(value);
      } else if (typeof value === 'object') {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeContextData(value);
      } else {
        // Convert everything else to string to prevent type errors
        sanitized[key] = String(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Generate formative assessment suggestions
   * CRITICAL: Added comprehensive null checks for all parameters
   */
  private async generateFormativeAssessments(context: any): Promise<string[]> {
    try {
      // Safe context validation
      if (!context || typeof context !== 'object') {
        console.warn('[EnrichmentAdapter] Invalid context for assessment generation');
        return [];
      }
      
      // Safe parameter extraction with type validation
      const safeParams = {
        learningObjectives: Array.isArray(context.learningObjectives) ? 
          context.learningObjectives.filter(obj => obj && typeof obj === 'string') : [],
        phases: (context.journey && Array.isArray(context.journey.phases)) ? 
          context.journey.phases.filter(phase => phase && typeof phase === 'object') : [],
        activities: (context.journey && Array.isArray(context.journey.activities)) ? 
          context.journey.activities.filter(activity => activity && typeof activity === 'string') : []
      };

      // CRITICAL FIX: Add null checks for assessmentService method
      if (!this.assessmentService || typeof this.assessmentService.generateFormativeAssessments !== 'function') {
        console.warn('[EnrichmentAdapter] assessmentService.generateFormativeAssessments is not available');
        return [];
      }
      
      const assessments = await this.assessmentService.generateFormativeAssessments(safeParams);
      
      // Safe processing of assessment results
      if (!assessments || !Array.isArray(assessments)) {
        return [];
      }

      return assessments
        .map((a: any) => {
          if (typeof a === 'string') {
            return a.trim();
          }
          if (a && typeof a === 'object') {
            return String(a.description || a.title || '').trim();
          }
          return '';
        })
        .filter(Boolean)
        .slice(0, 8); // Limit to 8 assessments max
    } catch (error) {
      console.error('Assessment generation failed:', error);
      return [];
    }
  }

  /**
   * Generate a comprehensive rubric for deliverables
   * CRITICAL: Added safe JSON handling and null checks
   */
  async generateRubric(context: any): Promise<any> {
    try {
      // Safe context validation
      if (!context || typeof context !== 'object') {
        console.warn('[EnrichmentAdapter] Invalid context for rubric generation');
        return null;
      }
      
      // Safe content extraction
      let content = '';
      try {
        if (context.deliverables && typeof context.deliverables === 'object') {
          content = JSON.stringify(context.deliverables);
        }
      } catch (jsonError) {
        console.warn('[EnrichmentAdapter] Failed to stringify deliverables:', jsonError);
        content = String(context.deliverables || '');
      }
      
      // Create safe context object
      const safeContext = {
        wizardData: this.sanitizeContextData(context.wizard || {}),
        ideationData: this.sanitizeContextData(context.ideation || {}),
        journeyData: this.sanitizeContextData(context.journey || {})
      };

      const rubricResult = await this.rubricAgent.enrich({
        content,
        context: safeContext
      });

      // Safe extraction of rubric data
      if (rubricResult && 
          typeof rubricResult === 'object' &&
          rubricResult.metadata && 
          typeof rubricResult.metadata === 'object' &&
          rubricResult.metadata.rubric) {
        return rubricResult.metadata.rubric;
      }
      
      return null;
    } catch (error) {
      console.error('Rubric generation failed:', error);
      return null;
    }
  }

  /**
   * Perform final synthesis of the entire blueprint
   * CRITICAL: Added comprehensive error handling for synthesis
   */
  async synthesizeBlueprint(context: any): Promise<string> {
    try {
      // Safe context validation
      if (!context || typeof context !== 'object') {
        console.warn('[EnrichmentAdapter] Invalid context for blueprint synthesis');
        return 'Unable to synthesize blueprint due to invalid context.';
      }
      
      // Safe content stringification
      let content = '';
      try {
        content = JSON.stringify(this.sanitizeContextData(context));
      } catch (jsonError) {
        console.warn('[EnrichmentAdapter] Failed to stringify context for synthesis:', jsonError);
        content = String(context);
      }

      const synthesisResult = await this.synthsisAgent.enrich({
        content,
        context: {
          wizardData: context.wizard,
          ideationData: context.ideation,
          journeyData: context.journey,
          deliverablesData: context.deliverables
        }
      });

      return synthesisResult.enrichedContent || '';
    } catch (error) {
      console.error('Blueprint synthesis failed:', error);
      return '';
    }
  }
}

// Export singleton instance
export const enrichmentAdapter = new EnrichmentAdapter();