/**
 * EnrichmentAdapter.ts - Adapter to integrate Phase 3/4 enrichment services
 * with the ChatInterface and SOPFlowManager
 */

// Use dynamic imports for large enrichment services to enable code splitting
type ComprehensiveContentValidator = any;
type LearningObjectivesEngine = any;
type FormativeAssessmentService = any;
type CurriculumDesignAgent = any;
type StandardsAlignmentAgent = any;
type UDLDifferentiationAgent = any;
type PBLRubricAssessmentAgent = any;
type FinalSynthesisAgent = any;
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
  private validator: ComprehensiveContentValidator | null = null;
  private objectivesEngine: LearningObjectivesEngine | null = null;
  private assessmentService: FormativeAssessmentService | null = null;
  private curriculumAgent: CurriculumDesignAgent | null = null;
  private standardsAgent: StandardsAlignmentAgent | null = null;
  private udlAgent: UDLDifferentiationAgent | null = null;
  private rubricAgent: PBLRubricAssessmentAgent | null = null;
  private synthsisAgent: FinalSynthesisAgent | null = null;
  private servicesLoaded = false;

  constructor() {
    // Services will be loaded on demand
  }

  /**
   * Lazy load enrichment services when first needed
   */
  private async loadServices(): Promise<void> {
    if (this.servicesLoaded) return;
    
    try {
      // Load all services in parallel
      const [validatorModule, objectivesModule, assessmentModule, pipelineModule] = await Promise.all([
        import('../../services/comprehensive-content-validator'),
        import('../../services/learning-objectives-engine'),
        import('../../services/formative-assessment-service'),
        import('../../services/content-enrichment-pipeline')
      ]);

      this.validator = new validatorModule.ComprehensiveContentValidator();
      this.objectivesEngine = new objectivesModule.LearningObjectivesEngine();
      this.assessmentService = new assessmentModule.FormativeAssessmentService();
      this.curriculumAgent = new pipelineModule.CurriculumDesignAgent();
      this.standardsAgent = new pipelineModule.StandardsAlignmentAgent();
      this.udlAgent = new pipelineModule.UDLDifferentiationAgent();
      this.rubricAgent = new pipelineModule.PBLRubricAssessmentAgent();
      this.synthsisAgent = new pipelineModule.FinalSynthesisAgent();
      
      this.servicesLoaded = true;
      console.log('Enrichment services loaded successfully');
    } catch (error) {
      console.error('Failed to load enrichment services:', error);
      throw error;
    }
  }

  /**
   * Main enrichment function to process AI responses
   */
  async enrichAIResponse(
    originalContent: string,
    currentStep: SOPStep,
    blueprintContext: any
  ): Promise<EnrichmentResult> {
    try {
      // Lazy load services on first use
      if (!this.servicesLoaded) {
        try {
          await this.loadServices();
        } catch (error) {
          console.warn('Enrichment services unavailable, returning original content');
          return { enrichedContent: originalContent };
        }
      }
      const result: EnrichmentResult = {
        enrichedContent: originalContent
      };

      // 1. Validate content quality (optional - skip if fails)
      try {
        // Ensure content is a string
        const contentToValidate = typeof originalContent === 'string' ? originalContent : JSON.stringify(originalContent);
        
        // Only validate if we have actual content
        if (contentToValidate && contentToValidate.trim().length > 10 && this.validator) {
          const validationResult = await this.validator.validateContent(
            contentToValidate,
            { 
              wizardData: blueprintContext?.wizard || {},
              ideationData: blueprintContext?.ideation || {},
              journeyData: blueprintContext?.journey || {},
              deliverablesData: blueprintContext?.deliverables || {},
              originalRequest: {
                type: 'content-validation',
                content: contentToValidate
              }
            }
          );
          
          if (validationResult) {
            result.validationScore = validationResult.overallScore;
            
            // If quality is too low, try to enhance it
            if (validationResult.overallScore < 0.7) {
              const enhanced = await this.enhanceContent(contentToValidate, currentStep, blueprintContext);
              if (enhanced && enhanced !== contentToValidate) {
                result.enrichedContent = enhanced;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Content validation skipped due to error:', error);
        // Continue without validation - enrichment should be optional
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
      if (!this.curriculumAgent) return content;
      
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
    if (!context?.ideation?.bigIdea || !context?.ideation?.essentialQuestion) {
      return [];
    }

    try {
      if (!this.objectivesEngine) return [];
      
      const objectives = await this.objectivesEngine.generateObjectives({
        bigIdea: String(context.ideation.bigIdea || ''),
        essentialQuestion: String(context.ideation.essentialQuestion || ''),
        challenge: String(context.ideation.challenge || ''),
        subject: String(context.wizard?.subject || 'General'),
        gradeLevel: String(context.wizard?.students || context.wizard?.ageGroup || 'Mixed')
      });

      // Handle various response formats
      if (Array.isArray(objectives)) {
        return objectives.map((obj: any) => 
          typeof obj === 'string' ? obj : (obj?.objective || obj?.description || '')
        ).filter(Boolean);
      } else if (objectives && typeof objectives === 'object') {
        // Handle object response with objectives array
        const objArray = objectives.objectives || objectives.learningObjectives || [];
        return Array.isArray(objArray) ? objArray.map((o: any) => String(o)).filter(Boolean) : [];
      }
      
      return [];
    } catch (error) {
      console.warn('Learning objectives generation skipped:', error);
      return [];
    }
  }

  /**
   * Generate standards alignment suggestions
   */
  private async generateStandardsAlignment(context: any): Promise<string[]> {
    try {
      const journeyContent = context.journey ? JSON.stringify(context.journey) : '';
      
      if (!this.standardsAgent) return [];
      
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
      
      if (!this.udlAgent) return [];
      
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
   * Generate formative assessment suggestions
   */
  private async generateFormativeAssessments(context: any): Promise<string[]> {
    try {
      if (!this.assessmentService) return [];
      
      const assessments = await this.assessmentService.generateFormativeAssessments({
        learningObjectives: context?.learningObjectives || [],
        phases: context?.journey?.phases || [],
        activities: context?.journey?.activities || []
      });

      if (Array.isArray(assessments)) {
        return assessments
          .map((a: any) => a?.description || a?.title || '')
          .filter(Boolean);
      }
      
      return [];
    } catch (error) {
      console.warn('Assessment generation skipped:', error);
      return [];
    }
  }

  /**
   * Generate a comprehensive rubric for deliverables
   */
  async generateRubric(context: any): Promise<any> {
    try {
      if (!this.rubricAgent) return null;
      
      const rubricResult = await this.rubricAgent.enrich({
        content: JSON.stringify(context.deliverables || {}),
        context: {
          wizardData: context.wizard,
          ideationData: context.ideation,
          journeyData: context.journey
        }
      });

      return rubricResult.metadata?.rubric || null;
    } catch (error) {
      console.error('Rubric generation failed:', error);
      return null;
    }
  }

  /**
   * Perform final synthesis of the entire blueprint
   */
  async synthesizeBlueprint(context: any): Promise<string> {
    try {
      if (!this.synthsisAgent) return '';
      
      const synthesisResult = await this.synthsisAgent.enrich({
        content: JSON.stringify(context),
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