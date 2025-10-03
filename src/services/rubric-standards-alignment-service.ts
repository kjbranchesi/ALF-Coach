/**
 * Rubric Standards Alignment Service
 * 
 * Specializes in aligning rubric criteria with educational standards,
 * providing automatic mapping, validation, and alignment recommendations
 * for comprehensive standards-based assessment.
 * 
 * Based on:
 * - Standards-based grading research
 * - Backwards design principles
 * - Assessment alignment methodology
 * - Cross-curricular integration studies
 */

import {
  type Rubric,
  type RubricCriterion,
  type AgeGroup,
  type CriterionCategory
} from '../types/rubric';
import {
  StandardsAlignmentEngine,
  type StandardAlignment,
  type AlignmentSuggestion,
  Standard
} from './standards-alignment-engine';
import {
  type BloomsLevel,
  type LearningObjective
} from './learning-objectives-engine';
import { logger } from '../utils/logger';

export interface RubricStandardsAlignment {
  rubricId: string;
  overallAlignment: AlignmentQuality;
  criteriaAlignments: CriterionStandardsAlignment[];
  suggestions: AlignmentImprovement[];
  coverage: StandardsCoverage;
  validation: AlignmentValidation;
  recommendations: AlignmentRecommendation[];
}

export interface CriterionStandardsAlignment {
  criterionId: string;
  criterionName: string;
  primaryStandards: StandardAlignment[];
  supportingStandards: StandardAlignment[];
  alignmentStrength: number;
  confidence: number;
  gaps: string[];
  improvements: string[];
}

export interface AlignmentQuality {
  overall: number; // 0-1
  byFramework: Record<string, number>;
  byCriterion: Record<string, number>;
  consistency: number;
  coverage: number;
  specificity: number;
}

export interface AlignmentImprovement {
  type: 'missing_alignment' | 'weak_alignment' | 'over_alignment' | 'misalignment';
  criterionId: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
  resources: string[];
  expectedImprovement: number;
}

export interface StandardsCoverage {
  totalStandards: number;
  alignedStandards: number;
  coveragePercentage: number;
  bySubject: Record<string, number>;
  byGradeLevel: Record<string, number>;
  gaps: string[];
  redundancies: string[];
}

export interface AlignmentValidation {
  isValid: boolean;
  errors: AlignmentError[];
  warnings: AlignmentWarning[];
  qualityScore: number;
  consistencyScore: number;
}

export interface AlignmentError {
  type: string;
  criterionId: string;
  standardId: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  solution: string;
}

export interface AlignmentWarning {
  type: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface AlignmentRecommendation {
  category: 'standards_selection' | 'criterion_modification' | 'assessment_design';
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string[];
  benefits: string[];
  resources?: string[];
}

/**
 * Rubric Standards Alignment Service
 */
export class RubricStandardsAlignmentService {
  private standardsEngine: StandardsAlignmentEngine;
  private alignmentCache: Map<string, RubricStandardsAlignment>;
  private frameworkPriorities: Map<AgeGroup, string[]>;

  constructor() {
    this.standardsEngine = new StandardsAlignmentEngine();
    this.alignmentCache = new Map();
    this.frameworkPriorities = new Map();
    this.initializeFrameworkPriorities();
  }

  /**
   * Align rubric with educational standards
   */
  async alignRubricWithStandards(
    rubric: Rubric,
    targetFrameworks: string[] = ['CCSS', 'NGSS'],
    options: AlignmentOptions = {}
  ): Promise<RubricStandardsAlignment> {
    logger.info('Aligning rubric with standards', { 
      rubricId: rubric.id, 
      frameworks: targetFrameworks 
    });

    try {
      // Convert rubric criteria to learning objectives for alignment
      const learningObjectives = this.convertCriteriaToObjectives(rubric.criteria);

      // Get context for alignment
      const context = {
        ageGroup: rubric.ageGroup,
        subject: rubric.subject[0] || 'General',
        difficulty: this.inferDifficulty(rubric),
        duration: rubric.metadata.estimatedTime || 'Multi-week',
        context: rubric.description
      };

      // Get alignment suggestions
      const suggestions = await this.standardsEngine.suggestAlignments(
        learningObjectives,
        context,
        targetFrameworks
      );

      // Process alignment suggestions
      const criteriaAlignments = this.processCriteriaAlignments(
        rubric.criteria,
        suggestions,
        options
      );

      // Calculate overall alignment quality
      const overallAlignment = this.calculateAlignmentQuality(criteriaAlignments);

      // Generate improvement suggestions
      const improvements = this.generateImprovementSuggestions(
        criteriaAlignments,
        rubric
      );

      // Analyze standards coverage
      const coverage = this.analyzeStandardsCoverage(criteriaAlignments, targetFrameworks);

      // Validate alignment
      const validation = this.validateAlignment(criteriaAlignments, rubric);

      // Generate recommendations
      const recommendations = this.generateAlignmentRecommendations(
        criteriaAlignments,
        coverage,
        validation,
        rubric
      );

      const alignment: RubricStandardsAlignment = {
        rubricId: rubric.id,
        overallAlignment,
        criteriaAlignments,
        suggestions: improvements,
        coverage,
        validation,
        recommendations
      };

      // Cache the alignment for future use
      this.alignmentCache.set(rubric.id, alignment);

      logger.info('Successfully aligned rubric with standards', {
        rubricId: rubric.id,
        overallQuality: overallAlignment.overall,
        alignedCriteria: criteriaAlignments.length
      });

      return alignment;

    } catch (error) {
      logger.error('Failed to align rubric with standards', { error, rubricId: rubric.id });
      throw new Error(`Standards alignment failed: ${error.message}`);
    }
  }

  /**
   * Get standards suggestions for specific criterion
   */
  async getSuggestionsForCriterion(
    criterion: RubricCriterion,
    ageGroup: AgeGroup,
    subject: string,
    frameworks: string[] = ['CCSS', 'NGSS']
  ): Promise<AlignmentSuggestion[]> {
    logger.info('Getting standards suggestions for criterion', {
      criterionId: criterion.id,
      ageGroup,
      subject
    });

    try {
      // Convert criterion to learning objective
      const objective = this.convertCriterionToObjective(criterion);

      const context = {
        ageGroup,
        subject,
        difficulty: 'intermediate',
        duration: 'Multi-week',
        context: criterion.description
      };

      // Get suggestions from standards engine
      const suggestions = await this.standardsEngine.suggestAlignments(
        [objective],
        context,
        frameworks
      );

      const criterionSuggestions = suggestions.get(objective.id) || [];

      logger.info('Generated standards suggestions', {
        criterionId: criterion.id,
        suggestionsCount: criterionSuggestions.length
      });

      return criterionSuggestions;

    } catch (error) {
      logger.error('Failed to get criterion suggestions', { error, criterionId: criterion.id });
      throw new Error(`Criterion suggestions failed: ${error.message}`);
    }
  }

  /**
   * Validate existing standards alignment
   */
  validateStandardsAlignment(
    rubric: Rubric,
    targetStandards: string[]
  ): AlignmentValidation {
    logger.info('Validating standards alignment', {
      rubricId: rubric.id,
      targetStandardsCount: targetStandards.length
    });

    const errors: AlignmentError[] = [];
    const warnings: AlignmentWarning[] = [];

    // Check if all criteria have standards alignment
    for (const criterion of rubric.criteria) {
      if (!criterion.standards || criterion.standards.length === 0) {
        errors.push({
          type: 'missing_alignment',
          criterionId: criterion.id,
          standardId: '',
          description: `Criterion "${criterion.name}" has no standards alignment`,
          severity: 'major',
          solution: 'Add at least one standards alignment for this criterion'
        });
      }
    }

    // Check for weak alignments
    for (const criterion of rubric.criteria) {
      if (criterion.standards) {
        for (const standard of criterion.standards) {
          if (standard.alignmentStrength < 0.5) {
            warnings.push({
              type: 'weak_alignment',
              description: `Weak alignment between "${criterion.name}" and ${standard.code}`,
              impact: 'May not effectively assess the standard',
              recommendation: 'Revise criterion or select more appropriate standard'
            });
          }
        }
      }
    }

    // Check for over-alignment (too many standards per criterion)
    for (const criterion of rubric.criteria) {
      if (criterion.standards && criterion.standards.length > 3) {
        warnings.push({
          type: 'over_alignment',
          description: `Criterion "${criterion.name}" aligns with too many standards`,
          impact: 'May dilute focus and assessment clarity',
          recommendation: 'Focus on 1-3 most relevant standards per criterion'
        });
      }
    }

    // Calculate quality scores
    const qualityScore = Math.max(0, 1 - (errors.length * 0.2) - (warnings.length * 0.1));
    const consistencyScore = this.calculateConsistencyScore(rubric);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
      consistencyScore
    };
  }

  /**
   * Generate standards-based performance descriptors
   */
  generateStandardsBasedDescriptors(
    criterion: RubricCriterion,
    targetStandards: StandardAlignment[],
    ageGroup: AgeGroup
  ): Record<string, string> {
    logger.info('Generating standards-based descriptors', {
      criterionId: criterion.id,
      standardsCount: targetStandards.length
    });

    const descriptors: Record<string, string> = {};

    // Performance levels based on age group
    const levels = this.getPerformanceLevelsForAge(ageGroup);

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const standardsText = targetStandards
        .map(s => this.extractKeyTerms(s.description))
        .flat()
        .slice(0, 3)
        .join(', ');

      const performanceIndicators = this.generatePerformanceIndicators(
        level,
        standardsText,
        ageGroup,
        i,
        levels.length
      );

      descriptors[level] = performanceIndicators;
    }

    return descriptors;
  }

  // Private implementation methods

  private convertCriteriaToObjectives(criteria: RubricCriterion[]): LearningObjective[] {
    return criteria.map(criterion => this.convertCriterionToObjective(criterion));
  }

  private convertCriterionToObjective(criterion: RubricCriterion): LearningObjective {
    return {
      id: criterion.id,
      statement: criterion.description,
      bloomsLevel: this.inferBloomsLevel(criterion.category),
      assessmentMethods: [{ type: 'rubric', description: 'Rubric-based assessment' }],
      prerequisites: [],
      vocabulary: criterion.skillTargets || [],
      misconceptions: [],
      extensions: [],
      differentiation: []
    };
  }

  private inferBloomsLevel(category: CriterionCategory): BloomsLevel {
    const bloomsMapping: Record<CriterionCategory, BloomsLevel> = {
      'content-knowledge': 'understand',
      'process-skills': 'apply',
      'critical-thinking': 'analyze',
      'communication': 'apply',
      'collaboration': 'apply',
      'creativity': 'create',
      'product-quality': 'create',
      'self-regulation': 'evaluate',
      'research-skills': 'analyze',
      'digital-literacy': 'apply',
      'presentation': 'apply',
      'time-management': 'apply',
      'reflection': 'evaluate'
    };

    return bloomsMapping[category] || 'apply';
  }

  private inferDifficulty(rubric: Rubric): 'beginner' | 'intermediate' | 'advanced' {
    const criteriaCount = rubric.criteria.length;
    const objectivesCount = rubric.metadata.learningObjectives?.length || 0;

    if (criteriaCount <= 3 && objectivesCount <= 2) {return 'beginner';}
    if (criteriaCount <= 5 && objectivesCount <= 4) {return 'intermediate';}
    return 'advanced';
  }

  private processCriteriaAlignments(
    criteria: RubricCriterion[],
    suggestions: Map<string, AlignmentSuggestion[]>,
    options: AlignmentOptions
  ): CriterionStandardsAlignment[] {
    const alignments: CriterionStandardsAlignment[] = [];

    for (const criterion of criteria) {
      const criterionSuggestions = suggestions.get(criterion.id) || [];
      
      // Select primary and supporting standards
      const primaryStandards = criterionSuggestions
        .filter(s => s.alignmentStrength >= (options.primaryThreshold || 0.7))
        .slice(0, options.maxPrimaryStandards || 2)
        .map(s => this.suggestionToAlignment(s));

      const supportingStandards = criterionSuggestions
        .filter(s => s.alignmentStrength >= (options.supportingThreshold || 0.4) && s.alignmentStrength < (options.primaryThreshold || 0.7))
        .slice(0, options.maxSupportingStandards || 3)
        .map(s => this.suggestionToAlignment(s));

      // Calculate overall alignment strength
      const alignmentStrength = primaryStandards.length > 0
        ? primaryStandards.reduce((sum, s) => sum + s.alignmentStrength, 0) / primaryStandards.length
        : 0;

      // Calculate confidence
      const confidence = criterionSuggestions.length > 0
        ? criterionSuggestions[0].confidence
        : 0;

      // Identify gaps and improvements
      const gaps = this.identifyAlignmentGaps(criterion, primaryStandards, supportingStandards);
      const improvements = this.identifyImprovements(criterion, criterionSuggestions);

      alignments.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        primaryStandards,
        supportingStandards,
        alignmentStrength,
        confidence,
        gaps,
        improvements
      });
    }

    return alignments;
  }

  private suggestionToAlignment(suggestion: AlignmentSuggestion): StandardAlignment {
    return {
      framework: suggestion.standard.id.startsWith('CCSS') ? 'CCSS' : 'NGSS',
      code: suggestion.standard.code,
      description: suggestion.standard.description,
      alignmentStrength: suggestion.alignmentStrength,
      justification: suggestion.rationale
    };
  }

  private calculateAlignmentQuality(alignments: CriterionStandardsAlignment[]): AlignmentQuality {
    if (alignments.length === 0) {
      return {
        overall: 0,
        byFramework: {},
        byCriterion: {},
        consistency: 0,
        coverage: 0,
        specificity: 0
      };
    }

    // Overall quality
    const overall = alignments.reduce((sum, a) => sum + a.alignmentStrength, 0) / alignments.length;

    // By framework
    const byFramework: Record<string, number> = {};
    const frameworkCounts: Record<string, number> = {};

    for (const alignment of alignments) {
      for (const standard of [...alignment.primaryStandards, ...alignment.supportingStandards]) {
        if (!byFramework[standard.framework]) {
          byFramework[standard.framework] = 0;
          frameworkCounts[standard.framework] = 0;
        }
        byFramework[standard.framework] += standard.alignmentStrength;
        frameworkCounts[standard.framework]++;
      }
    }

    for (const framework in byFramework) {
      byFramework[framework] /= frameworkCounts[framework];
    }

    // By criterion
    const byCriterion: Record<string, number> = {};
    for (const alignment of alignments) {
      byCriterion[alignment.criterionId] = alignment.alignmentStrength;
    }

    // Consistency (how similar alignment strengths are)
    const alignmentStrengths = alignments.map(a => a.alignmentStrength);
    const mean = alignmentStrengths.reduce((sum, s) => sum + s, 0) / alignmentStrengths.length;
    const variance = alignmentStrengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / alignmentStrengths.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance));

    // Coverage (percentage of criteria with good alignment)
    const wellAlignedCriteria = alignments.filter(a => a.alignmentStrength >= 0.6).length;
    const coverage = wellAlignedCriteria / alignments.length;

    // Specificity (how specific the alignments are)
    const specificAlignments = alignments.filter(a => a.primaryStandards.length > 0).length;
    const specificity = specificAlignments / alignments.length;

    return {
      overall,
      byFramework,
      byCriterion,
      consistency,
      coverage,
      specificity
    };
  }

  private generateImprovementSuggestions(
    alignments: CriterionStandardsAlignment[],
    rubric: Rubric
  ): AlignmentImprovement[] {
    const improvements: AlignmentImprovement[] = [];

    for (const alignment of alignments) {
      // Missing alignment
      if (alignment.primaryStandards.length === 0) {
        improvements.push({
          type: 'missing_alignment',
          criterionId: alignment.criterionId,
          description: `Criterion "${alignment.criterionName}" lacks strong standards alignment`,
          priority: 'high',
          suggestions: [
            'Revise criterion description to better match standards',
            'Consider breaking criterion into more specific components',
            'Add performance indicators aligned with standards'
          ],
          resources: ['Standards documents', 'Alignment guides'],
          expectedImprovement: 0.4
        });
      }

      // Weak alignment
      if (alignment.alignmentStrength > 0 && alignment.alignmentStrength < 0.5) {
        improvements.push({
          type: 'weak_alignment',
          criterionId: alignment.criterionId,
          description: `Weak alignment between "${alignment.criterionName}" and selected standards`,
          priority: 'medium',
          suggestions: [
            'Use more standards-specific language',
            'Add concrete examples from standards',
            'Align performance levels with standards expectations'
          ],
          resources: ['Standards glossaries', 'Example assessments'],
          expectedImprovement: 0.3
        });
      }

      // Over-alignment
      const totalStandards = alignment.primaryStandards.length + alignment.supportingStandards.length;
      if (totalStandards > 4) {
        improvements.push({
          type: 'over_alignment',
          criterionId: alignment.criterionId,
          description: `Too many standards aligned to "${alignment.criterionName}"`,
          priority: 'low',
          suggestions: [
            'Focus on 1-2 primary standards',
            'Move some alignments to supporting role',
            'Consider splitting criterion if it covers too much'
          ],
          resources: ['Assessment design guides'],
          expectedImprovement: 0.2
        });
      }
    }

    return improvements;
  }

  private analyzeStandardsCoverage(
    alignments: CriterionStandardsAlignment[],
    frameworks: string[]
  ): StandardsCoverage {
    const allStandards = new Set<string>();
    const alignedStandards = new Set<string>();
    const bySubject: Record<string, number> = {};
    const byGradeLevel: Record<string, number> = {};

    for (const alignment of alignments) {
      for (const standard of [...alignment.primaryStandards, ...alignment.supportingStandards]) {
        alignedStandards.add(standard.code);
        allStandards.add(standard.code);
      }
    }

    // For demonstration, assume we have access to full standards database
    // In practice, this would query the standards database
    const estimatedTotalStandards = frameworks.length * 100; // Simplified

    return {
      totalStandards: estimatedTotalStandards,
      alignedStandards: alignedStandards.size,
      coveragePercentage: (alignedStandards.size / estimatedTotalStandards) * 100,
      bySubject,
      byGradeLevel,
      gaps: [], // Would identify missing standard areas
      redundancies: [] // Would identify over-covered standards
    };
  }

  private validateAlignment(
    alignments: CriterionStandardsAlignment[],
    rubric: Rubric
  ): AlignmentValidation {
    const errors: AlignmentError[] = [];
    const warnings: AlignmentWarning[] = [];

    // Check each criterion alignment
    for (const alignment of alignments) {
      if (alignment.primaryStandards.length === 0 && alignment.supportingStandards.length === 0) {
        errors.push({
          type: 'no_alignment',
          criterionId: alignment.criterionId,
          standardId: '',
          description: `No standards alignment found for "${alignment.criterionName}"`,
          severity: 'major',
          solution: 'Add standards alignment or revise criterion'
        });
      }

      if (alignment.alignmentStrength < 0.3) {
        warnings.push({
          type: 'weak_alignment',
          description: `Very weak alignment for "${alignment.criterionName}"`,
          impact: 'Assessment may not validly measure standards',
          recommendation: 'Strengthen alignment or select different standards'
        });
      }
    }

    const qualityScore = Math.max(0, 1 - (errors.length * 0.3) - (warnings.length * 0.1));
    const consistencyScore = this.calculateConsistencyScore(rubric);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
      consistencyScore
    };
  }

  private generateAlignmentRecommendations(
    alignments: CriterionStandardsAlignment[],
    coverage: StandardsCoverage,
    validation: AlignmentValidation,
    rubric: Rubric
  ): AlignmentRecommendation[] {
    const recommendations: AlignmentRecommendation[] = [];

    // Standards selection recommendations
    if (coverage.coveragePercentage < 50) {
      recommendations.push({
        category: 'standards_selection',
        priority: 'high',
        description: 'Increase standards coverage to ensure comprehensive assessment',
        implementation: [
          'Review grade-level standards for missing areas',
          'Add criteria for uncovered standard domains',
          'Consider cross-curricular standards integration'
        ],
        benefits: [
          'More comprehensive assessment',
          'Better alignment with curriculum',
          'Improved validity'
        ]
      });
    }

    // Criterion modification recommendations
    const weakAlignments = alignments.filter(a => a.alignmentStrength < 0.5);
    if (weakAlignments.length > 0) {
      recommendations.push({
        category: 'criterion_modification',
        priority: 'medium',
        description: 'Strengthen criterion-standards alignment',
        implementation: [
          'Use standards-specific language in criteria descriptions',
          'Add performance indicators from standards',
          'Align performance levels with standards expectations'
        ],
        benefits: [
          'Clearer assessment targets',
          'Better validity',
          'Improved teacher understanding'
        ]
      });
    }

    // Assessment design recommendations
    if (validation.qualityScore < 0.7) {
      recommendations.push({
        category: 'assessment_design',
        priority: 'high',
        description: 'Improve overall assessment design and alignment',
        implementation: [
          'Use backward design process',
          'Start with standards and work backward',
          'Include multiple types of evidence',
          'Ensure age-appropriate expectations'
        ],
        benefits: [
          'Stronger standards alignment',
          'More valid assessment',
          'Better student outcomes'
        ]
      });
    }

    return recommendations;
  }

  // Helper methods

  private identifyAlignmentGaps(
    criterion: RubricCriterion,
    primary: StandardAlignment[],
    supporting: StandardAlignment[]
  ): string[] {
    const gaps: string[] = [];

    if (primary.length === 0) {
      gaps.push('No primary standards alignment');
    }

    if (primary.length + supporting.length === 0) {
      gaps.push('No standards alignment at all');
    }

    return gaps;
  }

  private identifyImprovements(
    criterion: RubricCriterion,
    suggestions: AlignmentSuggestion[]
  ): string[] {
    const improvements: string[] = [];

    if (suggestions.length === 0) {
      improvements.push('Add standards-specific language to criterion description');
    } else if (suggestions[0].alignmentStrength < 0.7) {
      improvements.push('Strengthen alignment by using more specific standards language');
    }

    return improvements;
  }

  private calculateConsistencyScore(rubric: Rubric): number {
    // Calculate how consistent the alignment approach is across criteria
    const alignmentCounts = rubric.criteria.map(c => c.standards?.length || 0);
    if (alignmentCounts.length === 0) {return 0;}

    const mean = alignmentCounts.reduce((sum, count) => sum + count, 0) / alignmentCounts.length;
    const variance = alignmentCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / alignmentCounts.length;
    
    return Math.max(0, 1 - (Math.sqrt(variance) / (mean || 1)));
  }

  private getPerformanceLevelsForAge(ageGroup: AgeGroup): string[] {
    const levelsByAge: Record<AgeGroup, string[]> = {
      'ages-5-7': ['Emerging', 'Developing', 'Proficient'],
      'ages-8-10': ['Developing', 'Proficient', 'Advanced'],
      'ages-11-14': ['Needs Improvement', 'Developing', 'Proficient', 'Advanced'],
      'ages-15-18': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'],
      'ages-18+': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary']
    };

    return levelsByAge[ageGroup] || ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'];
  }

  private extractKeyTerms(description: string): string[] {
    // Extract key terms from standards description
    const terms = description.toLowerCase()
      .split(/[,;.]/)
      .map(term => term.trim())
      .filter(term => term.length > 3)
      .slice(0, 3);

    return terms;
  }

  private generatePerformanceIndicators(
    level: string,
    standardsTerms: string,
    ageGroup: AgeGroup,
    levelIndex: number,
    totalLevels: number
  ): string {
    const intensityModifiers = ['beginning to', 'developing', 'consistently', 'expertly'];
    const modifier = intensityModifiers[Math.min(levelIndex, intensityModifiers.length - 1)];

    return `${modifier} demonstrates understanding of ${standardsTerms} through clear evidence and examples`;
  }

  private initializeFrameworkPriorities(): void {
    // Set framework priorities by age group
    this.frameworkPriorities.set('ages-5-7', ['CCSS', 'State Standards']);
    this.frameworkPriorities.set('ages-8-10', ['CCSS', 'NGSS', 'State Standards']);
    this.frameworkPriorities.set('ages-11-14', ['CCSS', 'NGSS', 'State Standards']);
    this.frameworkPriorities.set('ages-15-18', ['CCSS', 'NGSS', 'AP Standards', 'State Standards']);
    this.frameworkPriorities.set('ages-18+', ['Professional Standards', 'Industry Standards', 'CCSS']);
  }
}

// Supporting interfaces
export interface AlignmentOptions {
  primaryThreshold?: number; // Minimum strength for primary alignment (default: 0.7)
  supportingThreshold?: number; // Minimum strength for supporting alignment (default: 0.4)
  maxPrimaryStandards?: number; // Max primary standards per criterion (default: 2)
  maxSupportingStandards?: number; // Max supporting standards per criterion (default: 3)
  preferredFrameworks?: string[]; // Preferred frameworks in order
  includeExtensions?: boolean; // Include extension standards
  focusOnGradeLevel?: boolean; // Strict grade level matching
}

export default RubricStandardsAlignmentService;