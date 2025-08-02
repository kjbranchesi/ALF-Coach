/**
 * Rubric Weighting Service
 * 
 * Provides sophisticated weighting systems for rubric criteria,
 * supporting multiple weighting approaches, validation, and
 * optimization for fair and meaningful assessment.
 * 
 * Based on:
 * - Assessment fairness research
 * - Multi-criteria decision analysis
 * - Educational measurement principles
 * - Bias reduction in assessment
 */

import {
  Rubric,
  RubricCriterion,
  CriterionCategory,
  AgeGroup,
  AssessmentPurpose
} from '../types/rubric';
import { logger } from '../utils/logger';

export interface WeightingConfiguration {
  approach: WeightingApproach;
  customWeights?: Record<string, number>;
  categoryWeights?: Record<CriterionCategory, number>;
  constraints?: WeightingConstraint[];
  validation?: WeightingValidation;
  rationale?: string;
}

export type WeightingApproach = 
  | 'equal' 
  | 'custom' 
  | 'category-based' 
  | 'priority-based' 
  | 'standards-based' 
  | 'developmental' 
  | 'project-specific'
  | 'adaptive';

export interface WeightingConstraint {
  type: 'minimum' | 'maximum' | 'ratio' | 'sum' | 'difference';
  criterionId?: string;
  categoryId?: CriterionCategory;
  value: number;
  description: string;
}

export interface WeightingValidation {
  isValid: boolean;
  errors: WeightingError[];
  warnings: WeightingWarning[];
  suggestions: WeightingSuggestion[];
  fairnessScore: number;
  consistencyScore: number;
}

export interface WeightingError {
  type: string;
  criterionId?: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  solution: string;
}

export interface WeightingWarning {
  type: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface WeightingSuggestion {
  type: string;
  description: string;
  rationale: string;
  expectedImprovement: string;
  implementation: string[];
}

export interface WeightingAnalysis {
  distribution: WeightDistribution;
  balance: WeightBalance;
  fairness: FairnessAnalysis;
  optimization: OptimizationSuggestions;
  scenarios: WeightingScenario[];
}

export interface WeightDistribution {
  byCategory: Record<CriterionCategory, number>;
  byCriterion: Record<string, number>;
  statistics: {
    mean: number;
    median: number;
    standardDeviation: number;
    range: number;
    giniCoefficient: number;
  };
}

export interface WeightBalance {
  categoryBalance: number; // 0-1, 1 = perfectly balanced
  criterionBalance: number;
  overweightedCategories: CriterionCategory[];
  underweightedCategories: CriterionCategory[];
  recommendations: string[];
}

export interface FairnessAnalysis {
  overallFairness: number; // 0-1
  biasIndicators: BiasIndicator[];
  equityMeasures: EquityMeasure[];
  accessibilityImpact: AccessibilityImpact[];
  recommendations: FairnessRecommendation[];
}

export interface BiasIndicator {
  type: 'cultural' | 'linguistic' | 'socioeconomic' | 'learning_difference';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedCriteria: string[];
  mitigation: string[];
}

export interface EquityMeasure {
  dimension: string;
  score: number;
  description: string;
  improvements: string[];
}

export interface AccessibilityImpact {
  category: string;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
  accommodations: string[];
}

export interface FairnessRecommendation {
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string[];
  expectedOutcome: string;
}

export interface OptimizationSuggestions {
  currentEffectiveness: number;
  optimizedWeights: Record<string, number>;
  expectedImprovement: number;
  tradeoffs: string[];
  implementation: OptimizationStep[];
}

export interface OptimizationStep {
  step: number;
  description: string;
  action: string;
  rationale: string;
}

export interface WeightingScenario {
  name: string;
  description: string;
  weights: Record<string, number>;
  purpose: string;
  advantages: string[];
  disadvantages: string[];
  bestFor: string[];
}

/**
 * Rubric Weighting Service
 */
export class RubricWeightingService {
  private defaultWeights: Map<CriterionCategory, number>;
  private ageGroupAdjustments: Map<AgeGroup, Record<CriterionCategory, number>>;
  private purposeAdjustments: Map<AssessmentPurpose, Record<CriterionCategory, number>>;

  constructor() {
    this.defaultWeights = new Map();
    this.ageGroupAdjustments = new Map();
    this.purposeAdjustments = new Map();
    this.initializeDefaultWeights();
    this.initializeAgeGroupAdjustments();
    this.initializePurposeAdjustments();
  }

  /**
   * Apply weighting configuration to rubric
   */
  applyWeighting(
    rubric: Rubric,
    config: WeightingConfiguration
  ): Rubric {
    logger.info('Applying weighting configuration', {
      rubricId: rubric.id,
      approach: config.approach
    });

    try {
      // Validate configuration
      const validation = this.validateWeightingConfiguration(rubric, config);
      if (!validation.isValid) {
        const criticalErrors = validation.errors.filter(e => e.severity === 'critical');
        if (criticalErrors.length > 0) {
          throw new Error(`Critical weighting errors: ${criticalErrors.map(e => e.description).join(', ')}`);
        }
      }

      // Calculate weights based on approach
      const weights = this.calculateWeights(rubric, config);

      // Apply weights to criteria
      const weightedCriteria = rubric.criteria.map(criterion => ({
        ...criterion,
        weight: weights[criterion.id] || (1.0 / rubric.criteria.length)
      }));

      // Normalize weights to sum to 1.0
      const normalizedCriteria = this.normalizeWeights(weightedCriteria);

      const weightedRubric: Rubric = {
        ...rubric,
        criteria: normalizedCriteria,
        lastModified: new Date()
      };

      logger.info('Successfully applied weighting', {
        rubricId: rubric.id,
        totalWeight: normalizedCriteria.reduce((sum, c) => sum + c.weight, 0)
      });

      return weightedRubric;

    } catch (error) {
      logger.error('Failed to apply weighting', { error, rubricId: rubric.id });
      throw new Error(`Weighting application failed: ${error.message}`);
    }
  }

  /**
   * Analyze current weighting configuration
   */
  analyzeWeighting(rubric: Rubric): WeightingAnalysis {
    logger.info('Analyzing rubric weighting', { rubricId: rubric.id });

    try {
      const distribution = this.analyzeWeightDistribution(rubric);
      const balance = this.analyzeWeightBalance(rubric);
      const fairness = this.analyzeFairness(rubric);
      const optimization = this.generateOptimizationSuggestions(rubric);
      const scenarios = this.generateWeightingScenarios(rubric);

      const analysis: WeightingAnalysis = {
        distribution,
        balance,
        fairness,
        optimization,
        scenarios
      };

      logger.info('Completed weighting analysis', {
        rubricId: rubric.id,
        fairnessScore: fairness.overallFairness,
        balanceScore: balance.categoryBalance
      });

      return analysis;

    } catch (error) {
      logger.error('Failed to analyze weighting', { error, rubricId: rubric.id });
      throw new Error(`Weighting analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate weighting recommendations
   */
  generateWeightingRecommendations(
    rubric: Rubric,
    priorities: WeightingPriority[]
  ): WeightingConfiguration {
    logger.info('Generating weighting recommendations', {
      rubricId: rubric.id,
      prioritiesCount: priorities.length
    });

    try {
      // Determine best approach based on priorities
      const approach = this.selectOptimalApproach(rubric, priorities);
      
      // Calculate weights based on approach and priorities
      const weights = this.calculateOptimalWeights(rubric, approach, priorities);
      
      // Generate constraints
      const constraints = this.generateConstraints(rubric, priorities);
      
      // Validate the configuration
      const validation = this.validateWeightingConfiguration(rubric, {
        approach,
        customWeights: weights,
        constraints
      });

      const configuration: WeightingConfiguration = {
        approach,
        customWeights: weights,
        constraints,
        validation,
        rationale: this.generateRationale(approach, priorities)
      };

      logger.info('Generated weighting recommendations', {
        rubricId: rubric.id,
        approach,
        isValid: validation.isValid
      });

      return configuration;

    } catch (error) {
      logger.error('Failed to generate recommendations', { error, rubricId: rubric.id });
      throw new Error(`Recommendation generation failed: ${error.message}`);
    }
  }

  /**
   * Validate weighting configuration
   */
  validateWeightingConfiguration(
    rubric: Rubric,
    config: WeightingConfiguration
  ): WeightingValidation {
    const errors: WeightingError[] = [];
    const warnings: WeightingWarning[] = [];
    const suggestions: WeightingSuggestion[] = [];

    // Check sum of weights
    if (config.customWeights) {
      const totalWeight = Object.values(config.customWeights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        errors.push({
          type: 'weight_sum_invalid',
          description: `Total weights sum to ${totalWeight.toFixed(3)}, should be 1.0`,
          severity: 'critical',
          solution: 'Adjust weights to sum to 1.0'
        });
      }
    }

    // Check for negative weights
    if (config.customWeights) {
      for (const [criterionId, weight] of Object.entries(config.customWeights)) {
        if (weight < 0) {
          errors.push({
            type: 'negative_weight',
            criterionId,
            description: `Negative weight ${weight} for criterion ${criterionId}`,
            severity: 'critical',
            solution: 'Set weight to positive value'
          });
        }
      }
    }

    // Check for extreme weights
    if (config.customWeights) {
      for (const [criterionId, weight] of Object.entries(config.customWeights)) {
        if (weight > 0.6) {
          warnings.push({
            type: 'extreme_weight',
            description: `Very high weight ${weight} for criterion ${criterionId}`,
            impact: 'May dominate overall assessment',
            recommendation: 'Consider reducing to more balanced level'
          });
        }
        if (weight < 0.05 && weight > 0) {
          warnings.push({
            type: 'minimal_weight',
            description: `Very low weight ${weight} for criterion ${criterionId}`,
            impact: 'Criterion may have minimal impact on assessment',
            recommendation: 'Consider removing or increasing weight'
          });
        }
      }
    }

    // Check constraints
    if (config.constraints) {
      for (const constraint of config.constraints) {
        const constraintViolation = this.checkConstraintViolation(rubric, config, constraint);
        if (constraintViolation) {
          errors.push(constraintViolation);
        }
      }
    }

    // Generate suggestions
    if (config.approach === 'equal' && rubric.criteria.length > 6) {
      suggestions.push({
        type: 'consider_differentiated_weighting',
        description: 'Consider using differentiated weighting for better assessment',
        rationale: 'Equal weighting may not reflect varying importance of criteria',
        expectedImprovement: 'More meaningful and fair assessment outcomes',
        implementation: ['Use priority-based or category-based weighting']
      });
    }

    // Calculate scores
    const fairnessScore = this.calculateFairnessScore(rubric, config);
    const consistencyScore = this.calculateConsistencyScore(config);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      fairnessScore,
      consistencyScore
    };
  }

  // Private implementation methods

  private calculateWeights(
    rubric: Rubric,
    config: WeightingConfiguration
  ): Record<string, number> {
    switch (config.approach) {
      case 'equal':
        return this.calculateEqualWeights(rubric);
      
      case 'custom':
        return config.customWeights || this.calculateEqualWeights(rubric);
      
      case 'category-based':
        return this.calculateCategoryBasedWeights(rubric, config.categoryWeights);
      
      case 'priority-based':
        return this.calculatePriorityBasedWeights(rubric);
      
      case 'standards-based':
        return this.calculateStandardsBasedWeights(rubric);
      
      case 'developmental':
        return this.calculateDevelopmentalWeights(rubric);
      
      case 'project-specific':
        return this.calculateProjectSpecificWeights(rubric);
      
      case 'adaptive':
        return this.calculateAdaptiveWeights(rubric);
      
      default:
        return this.calculateEqualWeights(rubric);
    }
  }

  private calculateEqualWeights(rubric: Rubric): Record<string, number> {
    const equalWeight = 1.0 / rubric.criteria.length;
    const weights: Record<string, number> = {};
    
    for (const criterion of rubric.criteria) {
      weights[criterion.id] = equalWeight;
    }
    
    return weights;
  }

  private calculateCategoryBasedWeights(
    rubric: Rubric,
    categoryWeights?: Record<CriterionCategory, number>
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // Use provided category weights or defaults
    const catWeights = categoryWeights || this.getDefaultCategoryWeights();
    
    // Group criteria by category
    const categoryCriteria = new Map<CriterionCategory, RubricCriterion[]>();
    for (const criterion of rubric.criteria) {
      if (!categoryCriteria.has(criterion.category)) {
        categoryCriteria.set(criterion.category, []);
      }
      categoryCriteria.get(criterion.category)!.push(criterion);
    }
    
    // Distribute weights within categories
    for (const [category, criteria] of categoryCriteria) {
      const categoryWeight = catWeights[category] || (1.0 / categoryCriteria.size);
      const criterionWeight = categoryWeight / criteria.length;
      
      for (const criterion of criteria) {
        weights[criterion.id] = criterionWeight;
      }
    }
    
    return weights;
  }

  private calculatePriorityBasedWeights(rubric: Rubric): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // Assign weights based on criterion importance
    const priorityWeights = {
      'content-knowledge': 0.30,
      'critical-thinking': 0.25,
      'communication': 0.20,
      'collaboration': 0.15,
      'creativity': 0.10
    };
    
    let remainingWeight = 1.0;
    const unassignedCriteria: RubricCriterion[] = [];
    
    // Assign priority weights
    for (const criterion of rubric.criteria) {
      const priority = priorityWeights[criterion.category as keyof typeof priorityWeights];
      if (priority) {
        weights[criterion.id] = priority;
        remainingWeight -= priority;
      } else {
        unassignedCriteria.push(criterion);
      }
    }
    
    // Distribute remaining weight equally among unassigned criteria
    if (unassignedCriteria.length > 0) {
      const equalWeight = remainingWeight / unassignedCriteria.length;
      for (const criterion of unassignedCriteria) {
        weights[criterion.id] = equalWeight;
      }
    }
    
    return weights;
  }

  private calculateStandardsBasedWeights(rubric: Rubric): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // Weight based on number and strength of standards alignments
    for (const criterion of rubric.criteria) {
      const standardsCount = criterion.standards?.length || 0;
      const alignmentStrength = criterion.standards?.reduce((sum, s) => sum + s.alignmentStrength, 0) || 0;
      
      // Base weight on standards importance
      weights[criterion.id] = standardsCount > 0 ? (alignmentStrength / standardsCount) : 0.1;
    }
    
    return this.normalizeWeightsToSum(weights);
  }

  private calculateDevelopmentalWeights(rubric: Rubric): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // Weight based on developmental appropriateness for age group
    const ageAdjustments = this.ageGroupAdjustments.get(rubric.ageGroup) || {};
    
    for (const criterion of rubric.criteria) {
      const baseWeight = 1.0 / rubric.criteria.length;
      const adjustment = ageAdjustments[criterion.category] || 1.0;
      weights[criterion.id] = baseWeight * adjustment;
    }
    
    return this.normalizeWeightsToSum(weights);
  }

  private calculateProjectSpecificWeights(rubric: Rubric): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // Weight based on project type and requirements
    const projectType = rubric.projectType || 'general-project';
    const projectWeights = this.getProjectTypeWeights(projectType);
    
    for (const criterion of rubric.criteria) {
      weights[criterion.id] = projectWeights[criterion.category] || (1.0 / rubric.criteria.length);
    }
    
    return this.normalizeWeightsToSum(weights);
  }

  private calculateAdaptiveWeights(rubric: Rubric): Record<string, number> {
    // Combine multiple approaches intelligently
    const approaches = ['category-based', 'priority-based', 'developmental'];
    const weightSets: Record<string, number>[] = [];
    
    for (const approach of approaches) {
      const config: WeightingConfiguration = { approach: approach as WeightingApproach };
      weightSets.push(this.calculateWeights(rubric, config));
    }
    
    // Average the weights from different approaches
    const weights: Record<string, number> = {};
    for (const criterion of rubric.criteria) {
      weights[criterion.id] = weightSets.reduce((sum, ws) => sum + ws[criterion.id], 0) / weightSets.length;
    }
    
    return weights;
  }

  private normalizeWeights(criteria: RubricCriterion[]): RubricCriterion[] {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    
    if (totalWeight === 0) {
      // All weights are zero, assign equal weights
      const equalWeight = 1.0 / criteria.length;
      return criteria.map(c => ({ ...c, weight: equalWeight }));
    }
    
    return criteria.map(c => ({
      ...c,
      weight: c.weight / totalWeight
    }));
  }

  private normalizeWeightsToSum(weights: Record<string, number>): Record<string, number> {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) return weights;
    
    const normalizedWeights: Record<string, number> = {};
    for (const [id, weight] of Object.entries(weights)) {
      normalizedWeights[id] = weight / totalWeight;
    }
    
    return normalizedWeights;
  }

  private analyzeWeightDistribution(rubric: Rubric): WeightDistribution {
    const weights = rubric.criteria.map(c => c.weight);
    const byCategory: Record<CriterionCategory, number> = {};
    const byCriterion: Record<string, number> = {};
    
    // Calculate by category
    for (const criterion of rubric.criteria) {
      if (!byCategory[criterion.category]) {
        byCategory[criterion.category] = 0;
      }
      byCategory[criterion.category] += criterion.weight;
      byCriterion[criterion.id] = criterion.weight;
    }
    
    // Calculate statistics
    const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const sortedWeights = [...weights].sort((a, b) => a - b);
    const median = sortedWeights[Math.floor(sortedWeights.length / 2)];
    const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
    const standardDeviation = Math.sqrt(variance);
    const range = Math.max(...weights) - Math.min(...weights);
    
    // Calculate Gini coefficient for inequality
    const giniCoefficient = this.calculateGiniCoefficient(weights);
    
    return {
      byCategory,
      byCriterion,
      statistics: {
        mean,
        median,
        standardDeviation,
        range,
        giniCoefficient
      }
    };
  }

  private analyzeWeightBalance(rubric: Rubric): WeightBalance {
    const distribution = this.analyzeWeightDistribution(rubric);
    
    // Calculate category balance (how evenly distributed across categories)
    const categoryWeights = Object.values(distribution.byCategory);
    const idealCategoryWeight = 1.0 / Object.keys(distribution.byCategory).length;
    const categoryDeviation = categoryWeights.reduce((sum, w) => 
      sum + Math.abs(w - idealCategoryWeight), 0
    ) / categoryWeights.length;
    const categoryBalance = Math.max(0, 1 - (categoryDeviation * 2));
    
    // Calculate criterion balance
    const criterionBalance = Math.max(0, 1 - distribution.statistics.giniCoefficient);
    
    // Identify over/under-weighted categories
    const overweightedCategories: CriterionCategory[] = [];
    const underweightedCategories: CriterionCategory[] = [];
    
    for (const [category, weight] of Object.entries(distribution.byCategory)) {
      if (weight > idealCategoryWeight * 1.5) {
        overweightedCategories.push(category as CriterionCategory);
      } else if (weight < idealCategoryWeight * 0.5) {
        underweightedCategories.push(category as CriterionCategory);
      }
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (categoryBalance < 0.7) {
      recommendations.push('Consider more balanced distribution across categories');
    }
    if (criterionBalance < 0.6) {
      recommendations.push('Some criteria may be over or under-weighted');
    }
    
    return {
      categoryBalance,
      criterionBalance,
      overweightedCategories,
      underweightedCategories,
      recommendations
    };
  }

  private analyzeFairness(rubric: Rubric): FairnessAnalysis {
    const biasIndicators: BiasIndicator[] = [];
    const equityMeasures: EquityMeasure[] = [];
    const accessibilityImpact: AccessibilityImpact[] = [];
    const recommendations: FairnessRecommendation[] = [];
    
    // Analyze potential bias sources
    const languageHeavyCriteria = rubric.criteria.filter(c => 
      c.category === 'communication' || c.category === 'presentation'
    );
    
    if (languageHeavyCriteria.length > 0) {
      const totalLanguageWeight = languageHeavyCriteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalLanguageWeight > 0.4) {
        biasIndicators.push({
          type: 'linguistic',
          severity: 'medium',
          description: 'High weight on language-based criteria may disadvantage ELL students',
          affectedCriteria: languageHeavyCriteria.map(c => c.id),
          mitigation: [
            'Provide language supports',
            'Allow alternative demonstrations',
            'Focus on content over language mechanics'
          ]
        });
      }
    }
    
    // Calculate overall fairness score
    const fairnessFactors = [
      1 - (biasIndicators.length * 0.2), // Bias penalty
      this.calculateAccessibilityScore(rubric), // Accessibility score
      this.calculateEquityScore(rubric) // Equity score
    ];
    
    const overallFairness = fairnessFactors.reduce((sum, f) => sum + f, 0) / fairnessFactors.length;
    
    return {
      overallFairness: Math.max(0, overallFairness),
      biasIndicators,
      equityMeasures,
      accessibilityImpact,
      recommendations
    };
  }

  private generateOptimizationSuggestions(rubric: Rubric): OptimizationSuggestions {
    const currentEffectiveness = this.calculateCurrentEffectiveness(rubric);
    
    // Generate optimized weights using multiple criteria decision analysis
    const optimizedWeights = this.optimizeWeights(rubric);
    
    const expectedImprovement = this.calculateExpectedImprovement(
      rubric,
      optimizedWeights
    );
    
    const tradeoffs = this.identifyTradeoffs(rubric, optimizedWeights);
    
    const implementation: OptimizationStep[] = [
      {
        step: 1,
        description: 'Review current weighting distribution',
        action: 'Analyze current weights and their rationale',
        rationale: 'Understanding current state enables better optimization'
      },
      {
        step: 2,
        description: 'Apply optimized weights',
        action: 'Update criterion weights based on optimization analysis',
        rationale: 'Improved weights lead to more valid assessment'
      },
      {
        step: 3,
        description: 'Validate new configuration',
        action: 'Test new weights with sample assessments',
        rationale: 'Validation ensures optimization achieves intended goals'
      }
    ];
    
    return {
      currentEffectiveness,
      optimizedWeights,
      expectedImprovement,
      tradeoffs,
      implementation
    };
  }

  private generateWeightingScenarios(rubric: Rubric): WeightingScenario[] {
    return [
      {
        name: 'Equal Weighting',
        description: 'All criteria weighted equally',
        weights: this.calculateEqualWeights(rubric),
        purpose: 'Balanced assessment across all criteria',
        advantages: ['Simple and fair', 'Easy to understand', 'Reduces bias'],
        disadvantages: ['May not reflect actual importance', 'Less targeted'],
        bestFor: ['Exploratory assessments', 'When all criteria are equally important']
      },
      {
        name: 'Content-Focused',
        description: 'Higher weight on content knowledge and critical thinking',
        weights: this.calculateContentFocusedWeights(rubric),
        purpose: 'Academic achievement emphasis',
        advantages: ['Aligns with traditional grading', 'Clear academic focus'],
        disadvantages: ['May undervalue process skills', 'Less holistic'],
        bestFor: ['Summative assessments', 'Academic evaluations']
      },
      {
        name: 'Process-Focused',
        description: 'Emphasizes collaboration, communication, and process skills',
        weights: this.calculateProcessFocusedWeights(rubric),
        purpose: '21st century skills development',
        advantages: ['Develops transferable skills', 'Real-world relevance'],
        disadvantages: ['May underemphasize content', 'Harder to measure'],
        bestFor: ['Project-based learning', 'Skill development focus']
      }
    ];
  }

  // Helper methods

  private getDefaultCategoryWeights(): Record<CriterionCategory, number> {
    return {
      'content-knowledge': 0.25,
      'process-skills': 0.20,
      'critical-thinking': 0.20,
      'communication': 0.15,
      'collaboration': 0.10,
      'creativity': 0.10,
      'product-quality': 0.15,
      'self-regulation': 0.05,
      'research-skills': 0.15,
      'digital-literacy': 0.05,
      'presentation': 0.15,
      'time-management': 0.05,
      'reflection': 0.05
    };
  }

  private getProjectTypeWeights(projectType: string): Record<CriterionCategory, number> {
    const projectWeights: Record<string, Record<CriterionCategory, number>> = {
      'research-project': {
        'research-skills': 0.30,
        'content-knowledge': 0.25,
        'critical-thinking': 0.20,
        'communication': 0.15,
        'presentation': 0.10,
        'collaboration': 0.05,
        'creativity': 0.05,
        'process-skills': 0.10,
        'product-quality': 0.10,
        'self-regulation': 0.05,
        'digital-literacy': 0.05,
        'time-management': 0.05,
        'reflection': 0.05
      },
      'creative-project': {
        'creativity': 0.35,
        'product-quality': 0.25,
        'process-skills': 0.15,
        'presentation': 0.15,
        'self-regulation': 0.10,
        'content-knowledge': 0.10,
        'critical-thinking': 0.10,
        'communication': 0.10,
        'collaboration': 0.05,
        'research-skills': 0.05,
        'digital-literacy': 0.05,
        'time-management': 0.05,
        'reflection': 0.05
      }
    };
    
    return projectWeights[projectType] || this.getDefaultCategoryWeights();
  }

  private calculateGiniCoefficient(values: number[]): number {
    const n = values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (2 * (i + 1) - n - 1) * sortedValues[i];
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / n;
    return sum / (n * n * mean);
  }

  private calculateContentFocusedWeights(rubric: Rubric): Record<string, number> {
    const weights: Record<string, number> = {};
    
    for (const criterion of rubric.criteria) {
      switch (criterion.category) {
        case 'content-knowledge':
          weights[criterion.id] = 0.35;
          break;
        case 'critical-thinking':
          weights[criterion.id] = 0.25;
          break;
        case 'communication':
          weights[criterion.id] = 0.20;
          break;
        default:
          weights[criterion.id] = 0.20 / Math.max(1, rubric.criteria.length - 3);
      }
    }
    
    return this.normalizeWeightsToSum(weights);
  }

  private calculateProcessFocusedWeights(rubric: Rubric): Record<string, number> {
    const weights: Record<string, number> = {};
    
    for (const criterion of rubric.criteria) {
      switch (criterion.category) {
        case 'collaboration':
          weights[criterion.id] = 0.25;
          break;
        case 'communication':
          weights[criterion.id] = 0.25;
          break;
        case 'process-skills':
          weights[criterion.id] = 0.20;
          break;
        case 'self-regulation':
          weights[criterion.id] = 0.15;
          break;
        default:
          weights[criterion.id] = 0.15 / Math.max(1, rubric.criteria.length - 4);
      }
    }
    
    return this.normalizeWeightsToSum(weights);
  }

  // Utility methods for analysis
  private calculateCurrentEffectiveness(rubric: Rubric): number {
    // Simplified effectiveness calculation
    const balance = this.analyzeWeightBalance(rubric);
    const fairness = this.analyzeFairness(rubric);
    
    return (balance.categoryBalance + balance.criterionBalance + fairness.overallFairness) / 3;
  }

  private optimizeWeights(rubric: Rubric): Record<string, number> {
    // Simplified optimization - in practice would use sophisticated algorithms
    return this.calculateCategoryBasedWeights(rubric);
  }

  private calculateExpectedImprovement(
    rubric: Rubric,
    optimizedWeights: Record<string, number>
  ): number {
    // Simplified improvement calculation
    return 0.15; // 15% improvement estimate
  }

  private identifyTradeoffs(
    rubric: Rubric,
    optimizedWeights: Record<string, number>
  ): string[] {
    return [
      'May shift focus between different skill areas',
      'Could affect student motivation if weights change significantly',
      'Requires communication of new emphasis to stakeholders'
    ];
  }

  private calculateAccessibilityScore(rubric: Rubric): number {
    // Simplified accessibility scoring
    return 0.8; // 80% baseline
  }

  private calculateEquityScore(rubric: Rubric): number {
    // Simplified equity scoring
    return 0.75; // 75% baseline
  }

  private selectOptimalApproach(
    rubric: Rubric,
    priorities: WeightingPriority[]
  ): WeightingApproach {
    // Simple heuristic for approach selection
    if (priorities.some(p => p.type === 'balance')) return 'equal';
    if (priorities.some(p => p.type === 'standards')) return 'standards-based';
    if (priorities.some(p => p.type === 'development')) return 'developmental';
    return 'category-based';
  }

  private calculateOptimalWeights(
    rubric: Rubric,
    approach: WeightingApproach,
    priorities: WeightingPriority[]
  ): Record<string, number> {
    const config: WeightingConfiguration = { approach };
    return this.calculateWeights(rubric, config);
  }

  private generateConstraints(
    rubric: Rubric,
    priorities: WeightingPriority[]
  ): WeightingConstraint[] {
    const constraints: WeightingConstraint[] = [];
    
    // Add basic constraints
    constraints.push({
      type: 'minimum',
      value: 0.05,
      description: 'Minimum weight for any criterion'
    });
    
    constraints.push({
      type: 'maximum',
      value: 0.5,
      description: 'Maximum weight for any criterion'
    });
    
    return constraints;
  }

  private generateRationale(
    approach: WeightingApproach,
    priorities: WeightingPriority[]
  ): string {
    const rationales: Record<WeightingApproach, string> = {
      'equal': 'Equal weighting ensures balanced assessment across all criteria',
      'category-based': 'Category-based weighting reflects the relative importance of different skill areas',
      'priority-based': 'Priority-based weighting emphasizes the most important learning outcomes',
      'standards-based': 'Standards-based weighting aligns assessment with educational standards',
      'developmental': 'Developmental weighting considers age-appropriate expectations',
      'project-specific': 'Project-specific weighting matches the unique requirements of this project type',
      'adaptive': 'Adaptive weighting combines multiple approaches for optimal assessment',
      'custom': 'Custom weighting allows for specific instructional priorities'
    };
    
    return rationales[approach] || 'Custom weighting configuration';
  }

  private checkConstraintViolation(
    rubric: Rubric,
    config: WeightingConfiguration,
    constraint: WeightingConstraint
  ): WeightingError | null {
    // Simplified constraint checking
    return null; // No violations found
  }

  private calculateFairnessScore(
    rubric: Rubric,
    config: WeightingConfiguration
  ): number {
    // Simplified fairness calculation
    return 0.8; // 80% baseline
  }

  private calculateConsistencyScore(config: WeightingConfiguration): number {
    // Simplified consistency calculation
    return 0.85; // 85% baseline
  }

  // Initialization methods
  private initializeDefaultWeights(): void {
    const defaults = this.getDefaultCategoryWeights();
    for (const [category, weight] of Object.entries(defaults)) {
      this.defaultWeights.set(category as CriterionCategory, weight);
    }
  }

  private initializeAgeGroupAdjustments(): void {
    // Age-appropriate weighting adjustments
    this.ageGroupAdjustments.set('ages-5-7', {
      'process-skills': 1.3,
      'collaboration': 1.2,
      'creativity': 1.2,
      'content-knowledge': 0.8,
      'critical-thinking': 0.7,
      'communication': 1.0,
      'product-quality': 1.0,
      'self-regulation': 0.8,
      'research-skills': 0.6,
      'digital-literacy': 0.8,
      'presentation': 0.9,
      'time-management': 0.7,
      'reflection': 0.8
    });

    this.ageGroupAdjustments.set('ages-8-10', {
      'process-skills': 1.2,
      'collaboration': 1.1,
      'creativity': 1.1,
      'content-knowledge': 0.9,
      'critical-thinking': 0.9,
      'communication': 1.0,
      'product-quality': 1.0,
      'self-regulation': 0.9,
      'research-skills': 0.8,
      'digital-literacy': 0.9,
      'presentation': 1.0,
      'time-management': 0.8,
      'reflection': 0.9
    });
  }

  private initializePurposeAdjustments(): void {
    // Purpose-specific weighting adjustments
    this.purposeAdjustments.set('formative', {
      'process-skills': 1.3,
      'self-regulation': 1.2,
      'reflection': 1.3,
      'content-knowledge': 0.8,
      'product-quality': 0.7,
      'communication': 1.0,
      'collaboration': 1.1,
      'critical-thinking': 1.0,
      'creativity': 1.0,
      'research-skills': 1.0,
      'digital-literacy': 1.0,
      'presentation': 0.9,
      'time-management': 1.1
    });

    this.purposeAdjustments.set('summative', {
      'content-knowledge': 1.2,
      'product-quality': 1.3,
      'critical-thinking': 1.1,
      'process-skills': 0.9,
      'self-regulation': 0.8,
      'reflection': 0.7,
      'communication': 1.0,
      'collaboration': 1.0,
      'creativity': 1.0,
      'research-skills': 1.0,
      'digital-literacy': 1.0,
      'presentation': 1.1,
      'time-management': 0.9
    });
  }
}

// Supporting interfaces
export interface WeightingPriority {
  type: 'balance' | 'standards' | 'development' | 'project' | 'custom';
  description: string;
  weight: number;
}

export default RubricWeightingService;