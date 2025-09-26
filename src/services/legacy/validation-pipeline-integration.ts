/**
 * Validation Pipeline Integration
 * 
 * Integrates the comprehensive content validation system into the enrichment pipeline.
 * This module extends the existing quality gates with sophisticated educational validation.
 */

import { logger } from '../utils/logger';
import {
  QualityGate,
  QualityCriteria,
  EnrichmentContext,
  StageResult
} from './content-enrichment-pipeline';
import {
  ComprehensiveContentValidator,
  ValidationConfig,
  ValidationReport,
  ValidationConfigFactory
} from './comprehensive-content-validator';

/**
 * Enhanced Quality Gate that uses comprehensive educational validation
 */
export interface EducationalQualityGate extends QualityGate {
  validationConfig?: ValidationConfig;
  educationalFocus: 'pedagogical' | 'accessibility' | 'standards' | 'assessment' | 'comprehensive';
  minimumPassingScore: number;
  criticalIssueThreshold: number;
}

/**
 * Validation Pipeline Integrator
 * 
 * Provides enhanced quality gates that leverage comprehensive educational validation
 */
export class ValidationPipelineIntegrator {
  private static validator = new ComprehensiveContentValidator();

  /**
   * Create pedagogically-focused quality gate
   */
  static createPedagogicalQualityGate(config?: ValidationConfig): EducationalQualityGate {
    return {
      stageId: 'pedagogical-validation',
      threshold: 0.75,
      rollbackOnFailure: true,
      educationalFocus: 'pedagogical',
      minimumPassingScore: 0.75,
      criticalIssueThreshold: 0,
      validationConfig: config || ValidationConfigFactory.createElementaryConfig(),
      criteria: [
        {
          name: 'learning-theory-alignment',
          weight: 0.3,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(
                content, 
                context, 
                config || ValidationConfigFactory.createElementaryConfig()
              );
              return report.pedagogicalSoundness.learningTheoryAlignment.constructivism;
            } catch (error) {
              logger.error('Learning theory validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'instructional-design-quality',
          weight: 0.25,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.pedagogicalSoundness.instructionalDesign.backwardDesign;
            } catch (error) {
              logger.error('Instructional design validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'scaffolding-effectiveness',
          weight: 0.25,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.pedagogicalSoundness.scaffolding.appropriateSupport;
            } catch (error) {
              logger.error('Scaffolding validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'differentiation-quality',
          weight: 0.2,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.pedagogicalSoundness.differentiation.contentDifferentiation;
            } catch (error) {
              logger.error('Differentiation validation failed:', error);
              return 0.5;
            }
          }
        }
      ]
    };
  }

  /**
   * Create accessibility-focused quality gate  
   */
  static createAccessibilityQualityGate(config?: ValidationConfig): EducationalQualityGate {
    return {
      stageId: 'accessibility-validation',
      threshold: 0.8,
      rollbackOnFailure: false, // Warning only, don't rollback
      educationalFocus: 'accessibility',
      minimumPassingScore: 0.8,
      criticalIssueThreshold: 1, // Allow 1 critical accessibility issue
      validationConfig: config || ValidationConfigFactory.createElementaryConfig(),
      criteria: [
        {
          name: 'udl-compliance',
          weight: 0.4,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              const udlScores = report.accessibility.udlCompliance.map(p => p.overallScore);
              return udlScores.reduce((sum, score) => sum + score, 0) / udlScores.length;
            } catch (error) {
              logger.error('UDL validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'digital-accessibility',
          weight: 0.2,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.accessibility.digitalAccessibility.issues.length === 0 ? 1.0 : 0.6;
            } catch (error) {
              logger.error('Digital accessibility validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'language-support',
          weight: 0.2,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.accessibility.languageSupport.linguisticComplexity;
            } catch (error) {
              logger.error('Language support validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'accommodation-coverage',
          weight: 0.2,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.accessibility.accommodationOptions.coverageScore;
            } catch (error) {
              logger.error('Accommodation validation failed:', error);
              return 0.5;
            }
          }
        }
      ]
    };
  }

  /**
   * Create standards compliance quality gate
   */
  static createStandardsComplianceGate(config?: ValidationConfig): EducationalQualityGate {
    return {
      stageId: 'standards-compliance',
      threshold: 0.7,
      rollbackOnFailure: false,
      educationalFocus: 'standards',
      minimumPassingScore: 0.7,
      criticalIssueThreshold: 2,
      validationConfig: config || ValidationConfigFactory.createMiddleSchoolConfig(),
      criteria: [
        {
          name: 'standards-alignment',
          weight: 0.4,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.complianceStatus.standards.mappingQuality;
            } catch (error) {
              logger.error('Standards alignment validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'grade-level-appropriateness',
          weight: 0.3,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.complianceStatus.gradeLevel.appropriatenessScore;
            } catch (error) {
              logger.error('Grade level validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'cultural-responsiveness',
          weight: 0.3,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return report.complianceStatus.culturalResponsiveness.inclusivity;
            } catch (error) {
              logger.error('Cultural responsiveness validation failed:', error);
              return 0.5;
            }
          }
        }
      ]
    };
  }

  /**
   * Create assessment quality gate
   */
  static createAssessmentQualityGate(config?: ValidationConfig): EducationalQualityGate {
    return {
      stageId: 'assessment-quality',
      threshold: 0.75,
      rollbackOnFailure: false,
      educationalFocus: 'assessment',
      minimumPassingScore: 0.75,
      criticalIssueThreshold: 1,
      validationConfig: config || ValidationConfigFactory.createHighSchoolConfig(),
      criteria: [
        {
          name: 'formative-assessment-quality',
          weight: 0.3,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return (
                report.assessmentQuality.formativeAssessment.frequency * 0.4 +
                report.assessmentQuality.formativeAssessment.variety * 0.3 +
                report.assessmentQuality.formativeAssessment.actionability * 0.3
              );
            } catch (error) {
              logger.error('Formative assessment validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'summative-assessment-quality',
          weight: 0.3,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return (
                report.assessmentQuality.summativeAssessment.authenticity * 0.4 +
                report.assessmentQuality.summativeAssessment.alignment * 0.6
              );
            } catch (error) {
              logger.error('Summative assessment validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'rubric-quality',
          weight: 0.2,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return (
                report.assessmentQuality.rubricQuality.clarity * 0.4 +
                report.assessmentQuality.rubricQuality.studentFriendly * 0.6
              );
            } catch (error) {
              logger.error('Rubric quality validation failed:', error);
              return 0.5;
            }
          }
        },
        {
          name: 'feedback-quality',
          weight: 0.2,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              return (
                report.assessmentQuality.feedbackQuality.actionability * 0.5 +
                report.assessmentQuality.feedbackQuality.growthOriented * 0.5
              );
            } catch (error) {
              logger.error('Feedback quality validation failed:', error);
              return 0.5;
            }
          }
        }
      ]
    };
  }

  /**
   * Create comprehensive quality gate that validates all aspects
   */
  static createComprehensiveQualityGate(config?: ValidationConfig): EducationalQualityGate {
    return {
      stageId: 'comprehensive-validation',
      threshold: 0.8,
      rollbackOnFailure: true,
      educationalFocus: 'comprehensive',
      minimumPassingScore: 0.8,
      criticalIssueThreshold: 0, // No critical issues allowed
      validationConfig: config || ValidationConfigFactory.createElementaryConfig(),
      criteria: [
        {
          name: 'overall-educational-quality',
          weight: 1.0,
          validator: async (content: string, context: EnrichmentContext) => {
            try {
              const report = await this.validator.validateContent(content, context, config);
              
              // Log comprehensive validation results
              logger.log('📊 Comprehensive Validation Results:', {
                overallScore: report.overallScore,
                passed: report.passed,
                criticalIssues: report.criticalIssues.length,
                recommendations: report.recommendations.length,
                pedagogicalScore: report.pedagogicalSoundness.overallScore,
                accessibilityScore: report.accessibility.overallScore,
                qualityScore: report.qualityMetrics.coherence.overallScore,
                assessmentScore: report.assessmentQuality.overallScore
              });

              // Store detailed report in context for later use
              if (!context.metadata.customData) {
                context.metadata.customData = {};
              }
              context.metadata.customData.validationReport = report;

              return report.overallScore;
            } catch (error) {
              logger.error('Comprehensive validation failed:', error);
              return 0.5;
            }
          }
        }
      ]
    };
  }

  /**
   * Create quality gate configuration for different educational levels
   */
  static createEducationalLevelGates(level: 'elementary' | 'middle' | 'high' | 'international'): EducationalQualityGate[] {
    let config: ValidationConfig;
    
    switch (level) {
      case 'elementary':
        config = ValidationConfigFactory.createElementaryConfig();
        break;
      case 'middle':
        config = ValidationConfigFactory.createMiddleSchoolConfig();
        break;
      case 'high':
        config = ValidationConfigFactory.createHighSchoolConfig();
        break;
      case 'international':
        config = ValidationConfigFactory.createInternationalConfig();
        break;
      default:
        config = ValidationConfigFactory.createElementaryConfig();
    }

    return [
      this.createPedagogicalQualityGate(config),
      this.createAccessibilityQualityGate(config),
      this.createStandardsComplianceGate(config),
      this.createAssessmentQualityGate(config)
    ];
  }

  /**
   * Validate quality gate using enhanced educational criteria
   */
  static async validateEducationalQualityGate(
    gate: EducationalQualityGate,
    content: string,
    context: EnrichmentContext
  ): Promise<boolean> {
    logger.log(`🔍 Validating educational quality gate: ${gate.stageId}`);

    try {
      let totalScore = 0;
      let totalWeight = 0;

      // Run all criteria validators
      for (const criteria of gate.criteria) {
        const score = await criteria.validator(content, context);
        totalScore += score * criteria.weight;
        totalWeight += criteria.weight;
        
        logger.log(`  📏 ${criteria.name}: ${score.toFixed(3)} (weight: ${criteria.weight})`);
      }

      const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
      const passed = finalScore >= gate.threshold;

      logger.log(`🎯 Educational quality gate ${gate.stageId} score: ${finalScore.toFixed(3)} (threshold: ${gate.threshold}) - ${passed ? 'PASSED' : 'FAILED'}`);

      // If this is a comprehensive gate, also check for critical issues
      if (gate.educationalFocus === 'comprehensive' && passed) {
        const report = context.metadata.customData?.validationReport;
        if (report && report.criticalIssues.length > gate.criticalIssueThreshold) {
          logger.warn(`⚠️ Comprehensive validation passed score threshold but has ${report.criticalIssues.length} critical issues (max allowed: ${gate.criticalIssueThreshold})`);
          return false;
        }
      }

      return passed;
    } catch (error) {
      logger.error(`❌ Educational quality gate validation failed for ${gate.stageId}:`, error);
      return false;
    }
  }

  /**
   * Get validation report from context metadata
   */
  static getValidationReport(context: EnrichmentContext): ValidationReport | null {
    return context.metadata.customData?.validationReport || null;
  }

  /**
   * Generate validation summary for logging and reporting
   */
  static generateValidationSummary(context: EnrichmentContext): string {
    const report = this.getValidationReport(context);
    if (!report) {
      return 'No validation report available';
    }

    const summary = [
      `Overall Score: ${report.overallScore.toFixed(3)} (${report.passed ? 'PASSED' : 'FAILED'})`,
      `Critical Issues: ${report.criticalIssues.length}`,
      `Recommendations: ${report.recommendations.length}`,
      `Pedagogical: ${report.pedagogicalSoundness.overallScore.toFixed(3)}`,
      `Accessibility: ${report.accessibility.overallScore.toFixed(3)}`,
      `Quality: ${report.qualityMetrics.coherence.overallScore.toFixed(3)}`,
      `Assessment: ${report.assessmentQuality.overallScore.toFixed(3)}`
    ];

    return summary.join(' | ');
  }
}

/**
 * Enhanced Quality Gate Validator that extends the existing system
 */
export class EnhancedQualityGateValidator {
  /**
   * Validate enhanced educational quality gates
   */
  static async validateQualityGate(
    gate: QualityGate | EducationalQualityGate,
    content: string,
    context: EnrichmentContext
  ): Promise<boolean> {
    // Check if this is an enhanced educational quality gate
    if ('educationalFocus' in gate) {
      return ValidationPipelineIntegrator.validateEducationalQualityGate(
        gate as EducationalQualityGate,
        content,
        context
      );
    }

    // Fall back to original quality gate validation
    let totalScore = 0;
    let totalWeight = 0;

    for (const criteria of gate.criteria) {
      const score = criteria.validator(content, context);
      totalScore += score * criteria.weight;
      totalWeight += criteria.weight;
    }

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    logger.log(`Quality gate ${gate.stageId} score: ${finalScore} (threshold: ${gate.threshold})`);
    
    return finalScore >= gate.threshold;
  }

  /**
   * Create default enhanced quality gates for the pipeline
   */
  static createDefaultEnhancedGates(): EducationalQualityGate[] {
    return [
      ValidationPipelineIntegrator.createPedagogicalQualityGate(),
      ValidationPipelineIntegrator.createAccessibilityQualityGate(),
      ValidationPipelineIntegrator.createComprehensiveQualityGate()
    ];
  }
}