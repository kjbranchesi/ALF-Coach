/**
 * Inspiring Learning Success Generator
 * 
 * Creates empowering rubrics that celebrate student growth and achievement.
 * Every performance descriptor is crafted to inspire confidence, recognize progress,
 * and guide learners toward their next exciting milestone. These aren't just assessment
 * tools - they're roadmaps to success that make learning feel like an adventure.
 * 
 * Transforms traditional deficit-based language into strength-focused, growth-oriented
 * descriptions that help students see their potential and feel proud of their journey.
 * 
 * Grounded in positive psychology, growth mindset research, and the understanding
 * that assessment should inspire rather than discourage.
 */

import {
  Rubric,
  RubricType,
  AgeGroup,
  AssessmentPurpose,
  RubricCriterion,
  CriterionCategory,
  PerformanceLevel,
  PerformanceDescriptor,
  RubricGenerationConfig,
  StudentFriendlyRubric,
  StudentFriendlyCriterion,
  CanStatement,
  SelfAssessmentTool,
  RubricValidation,
  DevelopmentalConsideration,
  DEFAULT_PERFORMANCE_LEVELS,
  DEFAULT_CRITERIA_BY_PROJECT_TYPE
} from '../types/rubric';
import { StandardsAlignmentEngine, StandardAlignment } from './standards-alignment-engine';
import { BloomsLevel } from './learning-objectives-engine';
import { logger } from '../utils/logger';

/**
 * Comprehensive Rubric Generation Service
 */
export class RubricGenerationService {
  private standardsEngine: StandardsAlignmentEngine;
  private criteriaBank: Map<CriterionCategory, CriterionTemplate[]>;
  private descriptorBank: Map<string, DescriptorTemplate[]>;

  constructor() {
    this.standardsEngine = new StandardsAlignmentEngine();
    this.criteriaBank = new Map();
    this.descriptorBank = new Map();
    this.initializeCriteriaBank();
    this.initializeDescriptorBank();
  }

  /**
   * Generate a comprehensive rubric based on configuration
   */
  async generateRubric(config: RubricGenerationConfig): Promise<Rubric> {
    logger.info('Generating comprehensive rubric', { config });

    try {
      // Validate configuration
      const validation = this.validateConfiguration(config);
      if (!validation.isValid) {
        throw new Error(`Configuration invalid: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Generate performance levels
      const performanceLevels = this.generatePerformanceLevels(config.ageGroup, config.rubricType);

      // Generate criteria based on preferences
      const criteria = await this.generateCriteria(config, performanceLevels);

      // Align with standards if specified
      let standardsAlignment: StandardAlignment[] = [];
      if (config.standardsToAlign.length > 0) {
        standardsAlignment = await this.alignWithStandards(criteria, config);
      }

      // Calculate total points
      const totalPoints = this.calculateTotalPoints(criteria, performanceLevels);

      // Create rubric
      const rubric: Rubric = {
        id: this.generateId(),
        title: config.projectTitle + ' Assessment Rubric',
        description: config.projectDescription,
        type: config.rubricType,
        purpose: config.assessmentPurpose,
        ageGroup: config.ageGroup,
        subject: config.subject,
        projectType: this.inferProjectType(config),
        criteria,
        performanceLevels,
        totalPoints,
        successThreshold: this.calculatePassingScore(totalPoints, config.ageGroup),
        standardsAlignment,
        createdDate: new Date(),
        lastModified: new Date(),
        version: '1.0',
        metadata: {
          author: 'ALF Coach AI',
          tags: this.generateTags(config),
          difficulty: this.assessDifficulty(config),
          estimatedTime: config.duration,
          prerequisites: [],
          learningObjectives: config.learningObjectives,
          assessmentNotes: this.generateAssessmentNotes(config),
          modifications: config.modifications || []
        }
      };

      logger.info('Successfully generated rubric', { 
        rubricId: rubric.id, 
        criteriaCount: criteria.length,
        totalPoints 
      });

      return rubric;

    } catch (error) {
      logger.error('Failed to generate rubric', { error, config });
      throw new Error(`Rubric generation failed: ${error.message}`);
    }
  }

  /**
   * Generate student-friendly version of rubric
   */
  async generateStudentFriendlyRubric(rubric: Rubric): Promise<StudentFriendlyRubric> {
    logger.info('Generating student-friendly rubric', { rubricId: rubric.id });

    try {
      const simplifiedCriteria = await this.createStudentFriendlyCriteria(rubric.criteria, rubric.ageGroup);
      const canStatements = this.generateCanStatements(rubric.criteria, rubric.performanceLevels, rubric.ageGroup);
      const selfAssessment = this.createSelfAssessmentTool(rubric.ageGroup, rubric.type);
      const visualElements = this.generateVisualElements(rubric.ageGroup, rubric.type);

      const studentFriendlyRubric: StudentFriendlyRubric = {
        rubricId: rubric.id,
        title: this.createStudentFriendlyTitle(rubric.title, rubric.ageGroup),
        ageGroup: rubric.ageGroup,
        simplifiedCriteria,
        canStatements,
        selfAssessment,
        visualElements,
        languageLevel: this.determineLanguageLevel(rubric.ageGroup)
      };

      logger.info('Successfully generated student-friendly rubric', { 
        rubricId: rubric.id,
        criteriaCount: simplifiedCriteria.length 
      });

      return studentFriendlyRubric;

    } catch (error) {
      logger.error('Failed to generate student-friendly rubric', { error, rubricId: rubric.id });
      throw new Error(`Student-friendly rubric generation failed: ${error.message}`);
    }
  }

  /**
   * Generate performance level descriptors for specific criteria
   */
  generatePerformanceDescriptors(
    criterion: RubricCriterion,
    performanceLevels: PerformanceLevel[],
    ageGroup: AgeGroup,
    rubricType: RubricType
  ): PerformanceDescriptor[] {
    const descriptors: PerformanceDescriptor[] = [];

    for (const level of performanceLevels) {
      const template = this.findDescriptorTemplate(criterion.category, level.name, ageGroup);
      
      const descriptor: PerformanceDescriptor = {
        criterionId: criterion.id,
        levelId: level.id,
        description: this.customizeDescriptor(template.description, criterion.name),
        indicators: template.indicators.map(i => this.customizeIndicator(i, criterion.name)),
        examples: template.examples,
        evidenceRequirements: template.evidenceRequirements,
        commonMisconceptions: template.commonMisconceptions
      };

      descriptors.push(descriptor);
    }

    return descriptors;
  }

  /**
   * Validate rubric quality and completeness
   */
  validateRubric(rubric: Rubric): RubricValidation {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Check basic requirements
    if (!rubric.title || rubric.title.trim().length === 0) {
      errors.push({ type: 'missing_title', field: 'title', message: 'Rubric must have a title', severity: 'error' as const });
    }

    if (rubric.criteria.length === 0) {
      errors.push({ type: 'no_criteria', field: 'criteria', message: 'Rubric must have at least one criterion', severity: 'error' as const });
    }

    if (rubric.performanceLevels.length < 2) {
      errors.push({ type: 'insufficient_levels', field: 'performanceLevels', message: 'Rubric must have at least 2 performance levels', severity: 'error' as const });
    }

    // Check criteria quality
    for (const criterion of rubric.criteria) {
      if (!criterion.description || criterion.description.trim().length < 10) {
        warnings.push({
          type: 'weak_description',
          message: `Criterion "${criterion.name}" needs a more detailed description`,
          impact: 'Students may not understand expectations',
          recommendation: 'Add specific, observable behaviors to the description'
        });
      }

      if (criterion.descriptors.length !== rubric.performanceLevels.length) {
        errors.push({
          type: 'missing_descriptors',
          field: `criteria.${criterion.id}.descriptors`,
          message: `Criterion "${criterion.name}" missing performance descriptors`,
          severity: 'error' as const
        });
      }
    }

    // Check performance level alignment
    const totalWeights = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeights - 1.0) > 0.01) {
      warnings.push({
        type: 'weight_mismatch',
        message: 'Criterion weights should sum to 1.0',
        impact: 'Scoring may not reflect intended emphasis',
        recommendation: 'Adjust criterion weights to total 100%'
      });
    }

    // Generate suggestions
    if (rubric.criteria.every(c => c.category === 'content-knowledge')) {
      suggestions.push({
        category: 'criteria_diversity',
        suggestion: 'Consider adding process skills and collaboration criteria',
        rationale: 'PBL assessments should evaluate both content and skills',
        implementation: ['Add collaboration criterion', 'Include critical thinking assessment'],
        expectedImprovement: 'More comprehensive assessment of student learning'
      });
    }

    // Calculate quality score
    let qualityScore = 1.0;
    qualityScore -= errors.length * 0.3;
    qualityScore -= warnings.length * 0.1;
    qualityScore = Math.max(0, qualityScore);

    // Calculate completeness
    let completeness = 0.0;
    if (rubric.title?.trim()) completeness += 0.1;
    if (rubric.description?.trim()) completeness += 0.1;
    if (rubric.criteria.length > 0) completeness += 0.3;
    if (rubric.performanceLevels.length >= 3) completeness += 0.2;
    if (rubric.standardsAlignment?.length > 0) completeness += 0.1;
    if (rubric.metadata.learningObjectives?.length > 0) completeness += 0.1;
    if (rubric.criteria.some(c => c.descriptors.length > 0)) completeness += 0.1;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      qualityScore,
      completeness
    };
  }

  // Private implementation methods

  private generatePerformanceLevels(ageGroup: AgeGroup, rubricType: RubricType): PerformanceLevel[] {
    const defaultLevels = DEFAULT_PERFORMANCE_LEVELS[ageGroup];
    
    // Customize for rubric type
    if (rubricType === 'single-point') {
      // Single-point rubrics typically have: Below, Meets, Exceeds
      return [
        { ...defaultLevels[0], name: 'Below Target', description: 'Not yet meeting expectations' },
        { ...defaultLevels[Math.floor(defaultLevels.length / 2)], name: 'Meets Target', description: 'Meeting grade-level expectations' },
        { ...defaultLevels[defaultLevels.length - 1], name: 'Exceeds Target', description: 'Going beyond expectations' }
      ];
    }

    return defaultLevels;
  }

  private async generateCriteria(
    config: RubricGenerationConfig,
    performanceLevels: PerformanceLevel[]
  ): Promise<RubricCriterion[]> {
    const criteria: RubricCriterion[] = [];
    
    // Determine criteria categories
    const categories = this.selectCriteriaCategories(config);
    
    // Generate criteria for each category
    for (const category of categories) {
      const criterion = await this.createCriterion(category, config, performanceLevels);
      criteria.push(criterion);
    }

    // Assign weights
    this.assignWeights(criteria, config.criteriaPreferences.weightingApproach, config.criteriaPreferences.customWeights);

    return criteria;
  }

  private selectCriteriaCategories(config: RubricGenerationConfig): CriterionCategory[] {
    const { criteriaPreferences, subject, projectType } = config;
    
    // Start with priority categories
    let categories = [...criteriaPreferences.priorityCategories];

    // Add project-type specific criteria
    if (projectType && DEFAULT_CRITERIA_BY_PROJECT_TYPE[projectType]) {
      const projectCategories = DEFAULT_CRITERIA_BY_PROJECT_TYPE[projectType];
      for (const category of projectCategories) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }

    // Add subject-specific recommendations
    if (subject.includes('Science')) {
      if (!categories.includes('process-skills')) categories.push('process-skills');
    }
    if (subject.includes('English') || subject.includes('Language Arts')) {
      if (!categories.includes('communication')) categories.push('communication');
    }

    // Apply preferences
    if (criteriaPreferences.includeCollaboration && !categories.includes('collaboration')) {
      categories.push('collaboration');
    }
    if (criteriaPreferences.includeSelfReflection && !categories.includes('reflection')) {
      categories.push('reflection');
    }
    if (criteriaPreferences.includeProcessSkills && !categories.includes('process-skills')) {
      categories.push('process-skills');
    }

    // Limit to reasonable number (3-6 criteria typically)
    if (categories.length > 6) {
      categories = categories.slice(0, 6);
    }

    return categories;
  }

  private async createCriterion(
    category: CriterionCategory,
    config: RubricGenerationConfig,
    performanceLevels: PerformanceLevel[]
  ): Promise<RubricCriterion> {
    const template = this.getCriterionTemplate(category, config.ageGroup);
    
    const criterion: RubricCriterion = {
      id: this.generateId(),
      name: template.name,
      description: template.description,
      weight: 0, // Will be assigned later
      category,
      isRequired: true,
      standards: [], // Will be populated by standards alignment
      skillTargets: template.skillTargets,
      developmentalConsiderations: this.getDevelopmentalConsiderations(category, config.ageGroup),
      descriptors: []
    };

    // Generate performance descriptors
    criterion.descriptors = this.generatePerformanceDescriptors(
      criterion,
      performanceLevels,
      config.ageGroup,
      config.rubricType
    );

    return criterion;
  }

  private assignWeights(
    criteria: RubricCriterion[],
    weightingApproach: 'equal' | 'custom' | 'category-based',
    customWeights?: Record<string, number>
  ): void {
    switch (weightingApproach) {
      case 'equal':
        const equalWeight = 1.0 / criteria.length;
        criteria.forEach(c => c.weight = equalWeight);
        break;
        
      case 'custom':
        if (customWeights) {
          criteria.forEach(c => {
            c.weight = customWeights[c.id] || (1.0 / criteria.length);
          });
        }
        break;
        
      case 'category-based':
        this.assignCategoryBasedWeights(criteria);
        break;
    }

    // Normalize weights to sum to 1.0
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    criteria.forEach(c => c.weight = c.weight / totalWeight);
  }

  private assignCategoryBasedWeights(criteria: RubricCriterion[]): void {
    // Define category importance weights
    const categoryWeights: Record<CriterionCategory, number> = {
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

    criteria.forEach(c => {
      c.weight = categoryWeights[c.category] || (1.0 / criteria.length);
    });
  }

  private async alignWithStandards(
    criteria: RubricCriterion[],
    config: RubricGenerationConfig
  ): Promise<StandardAlignment[]> {
    const alignments: StandardAlignment[] = [];
    
    // Create pseudo learning objectives from criteria for alignment
    const learningObjectives = criteria.map(c => ({
      id: c.id,
      statement: c.description,
      bloomsLevel: this.inferBloomsLevel(c.category),
      assessmentMethods: [{ type: 'rubric', description: 'Rubric assessment' }],
      prerequisites: [],
      vocabulary: [],
      misconceptions: [],
      extensions: [],
      differentiation: []
    }));

    const generationContext = {
      ageGroup: config.ageGroup,
      subject: config.subject[0],
      difficulty: 'intermediate',
      duration: config.duration,
      context: config.projectDescription
    };

    try {
      const suggestions = await this.standardsEngine.suggestAlignments(
        learningObjectives,
        generationContext,
        ['CCSS', 'NGSS']
      );

      // Extract alignments from suggestions
      for (const [objectiveId, alignmentSuggestions] of suggestions) {
        for (const suggestion of alignmentSuggestions.slice(0, 2)) { // Top 2 per criterion
          alignments.push({
            framework: suggestion.standard.id.startsWith('CCSS') ? 'CCSS' : 'NGSS',
            code: suggestion.standard.code,
            description: suggestion.standard.description,
            alignmentStrength: suggestion.alignmentStrength,
            justification: suggestion.rationale
          });
        }
      }

    } catch (error) {
      logger.warn('Standards alignment failed, continuing without alignment', { error });
    }

    return alignments;
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

  private calculateTotalPoints(criteria: RubricCriterion[], performanceLevels: PerformanceLevel[]): number {
    const maxPointsPerCriterion = Math.max(...performanceLevels.map(l => l.pointValue));
    return criteria.length * maxPointsPerCriterion;
  }

  private calculatePassingScore(totalPoints: number, ageGroup: AgeGroup): number {
    // Success celebration thresholds based on developmental growth expectations
    const successPercentages: Record<AgeGroup, number> = {
      'ages-5-7': 0.60,    // 60% celebrates early elementary achievements
      'ages-8-10': 0.65,   // 65% recognizes upper elementary growth
      'ages-11-14': 0.70,  // 70% honors middle school development
      'ages-15-18': 0.75,  // 75% acknowledges high school mastery
      'ages-18+': 0.80     // 80% celebrates adult learning excellence
    };

    return Math.round(totalPoints * successPercentages[ageGroup]);
  }

  private async createStudentFriendlyCriteria(
    criteria: RubricCriterion[],
    ageGroup: AgeGroup
  ): Promise<StudentFriendlyCriterion[]> {
    return criteria.map(criterion => {
      const friendlyCriterion: StudentFriendlyCriterion = {
        id: criterion.id,
        name: this.simplifyLanguage(criterion.name, ageGroup),
        questionPrompt: this.createQuestionPrompt(criterion.name, ageGroup),
        expectations: criterion.descriptors.map(d => ({
          level: d.levelId,
          description: this.simplifyLanguage(d.description, ageGroup),
          visualIndicator: this.getVisualIndicator(d.levelId),
          studentLanguage: this.convertToStudentLanguage(d.description, ageGroup)
        })),
        examples: criterion.descriptors.flatMap(d => 
          d.examples.map(example => ({
            level: d.levelId,
            example: this.simplifyLanguage(example, ageGroup),
            context: criterion.name,
            whyItWorksWell: this.explainWhyExampleWorks(example, ageGroup)
          }))
        ),
        checklistItems: this.createChecklistItems(criterion, ageGroup)
      };

      return friendlyCriterion;
    });
  }

  private generateCanStatements(
    criteria: RubricCriterion[],
    performanceLevels: PerformanceLevel[],
    ageGroup: AgeGroup
  ): CanStatement[] {
    const canStatements: CanStatement[] = [];

    for (const criterion of criteria) {
      for (const level of performanceLevels) {
        const descriptor = criterion.descriptors.find(d => d.levelId === level.id);
        if (descriptor) {
          const statement: CanStatement = {
            criterionId: criterion.id,
            levelId: level.id,
            statement: this.createCanStatement(criterion.name, descriptor.description, ageGroup),
            breakdown: descriptor.indicators.map(i => this.convertToCanStatement(i, ageGroup)),
            evidence: descriptor.evidenceRequirements.map(e => this.convertToStudentEvidence(e, ageGroup))
          };
          canStatements.push(statement);
        }
      }
    }

    return canStatements;
  }

  private createSelfAssessmentTool(ageGroup: AgeGroup, rubricType: RubricType): SelfAssessmentTool {
    const ageSpecificInstructions = this.getAgeSpecificInstructions(ageGroup);
    
    return {
      instructions: ageSpecificInstructions.selfAssessment,
      reflectionPrompts: ageSpecificInstructions.reflectionPrompts,
      goalSettingQuestions: ageSpecificInstructions.goalSetting,
      evidenceCollection: {
        types: ageSpecificInstructions.evidenceTypes,
        examples: ageSpecificInstructions.evidenceExamples,
        organization: ageSpecificInstructions.organization,
        reflection: ageSpecificInstructions.reflectionPrompts
      },
      peerReviewGuidance: {
        instructions: ageSpecificInstructions.peerReview.instructions,
        feedbackPrompts: ageSpecificInstructions.peerReview.prompts,
        guidelines: ageSpecificInstructions.peerReview.guidelines,
        examples: ageSpecificInstructions.peerReview.examples
      }
    };
  }

  // Helper methods for language simplification and age-appropriate content

  private simplifyLanguage(text: string, ageGroup: AgeGroup): string {
    // Implement age-appropriate language simplification
    switch (ageGroup) {
      case 'ages-5-7':
        return text.replace(/demonstrates?/gi, 'proudly shows')
                  .replace(/utilizes?/gi, 'cleverly uses')
                  .replace(/comprehends?/gi, 'truly understands')
                  .replace(/effectively/gi, 'wonderfully well')
                  .replace(/needs improvement/gi, 'is growing stronger')
                  .replace(/inadequate/gi, 'is developing beautifully')
                  .replace(/poor/gi, 'is getting better')
                  .replace(/weak/gi, 'is strengthening')
                  .replace(/fails to/gi, 'is learning to')
                  .replace(/lacks/gi, 'is discovering');
      
      case 'ages-8-10':
        return text.replace(/demonstrates?/gi, 'confidently shows')
                  .replace(/utilizes?/gi, 'skillfully uses')
                  .replace(/needs improvement/gi, 'is building strength')
                  .replace(/inadequate/gi, 'is developing skills')
                  .replace(/poor/gi, 'is improving')
                  .replace(/weak/gi, 'is growing stronger')
                  .replace(/fails to/gi, 'is working to')
                  .replace(/lacks/gi, 'is developing');
      
      default:
        return text;
    }
  }

  private createQuestionPrompt(criterionName: string, ageGroup: AgeGroup): string {
    const agePrompts: Record<AgeGroup, string> = {
      'ages-5-7': `How amazingly did I grow in ${criterionName.toLowerCase()}?`,
      'ages-8-10': `How proudly can I showcase my ${criterionName.toLowerCase()}?`,
      'ages-11-14': `How successfully did I demonstrate my growing ${criterionName.toLowerCase()}?`,
      'ages-15-18': `How impressively did I showcase my mastery of ${criterionName.toLowerCase()}?`,
      'ages-18+': `How excellently did I demonstrate my expertise in ${criterionName.toLowerCase()}?`
    };
    
    return agePrompts[ageGroup];
  }

  private getVisualIndicator(levelId: string): string {
    const indicators: Record<string, string> = {
      'emerging': '🌱',
      'developing': '🌿',
      'proficient': '🌳',
      'advanced': '⭐',
      'exemplary': '🏆',
      'needs-improvement': '🔄'
    };
    
    return indicators[levelId] || '📝';
  }

  private convertToStudentLanguage(description: string, ageGroup: AgeGroup): string {
    // Transform academic language into empowering, student-friendly language
    return this.simplifyLanguage(description, ageGroup)
      .replace(/criterion/gi, 'success goal')
      .replace(/assessment/gi, 'celebration of learning')
      .replace(/evaluation/gi, 'thoughtful reflection on')
      .replace(/performance/gi, 'amazing abilities')
      .replace(/achievement/gi, 'wonderful accomplishment')
      .replace(/demonstrates/gi, 'proudly shows')
      .replace(/exhibits/gi, 'beautifully displays')
      .replace(/quality/gi, 'excellence');
  }

  // Utility methods

  private generateId(): string {
    return 'rubric_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private validateConfiguration(config: RubricGenerationConfig): RubricValidation {
    const errors = [];
    
    if (!config.projectTitle?.trim()) {
      errors.push({ type: 'missing_title', field: 'projectTitle', message: 'Project title is required', severity: 'error' as const });
    }
    
    if (!config.ageGroup) {
      errors.push({ type: 'missing_age_group', field: 'ageGroup', message: 'Age group is required', severity: 'error' as const });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      suggestions: [],
      qualityScore: errors.length === 0 ? 1.0 : 0.0,
      completeness: errors.length === 0 ? 1.0 : 0.0
    };
  }

  private inferProjectType(config: RubricGenerationConfig): string {
    const description = config.projectDescription.toLowerCase();
    
    if (description.includes('research') || description.includes('investigate')) return 'research-project';
    if (description.includes('science') || description.includes('experiment')) return 'science-investigation';
    if (description.includes('create') || description.includes('design')) return 'creative-project';
    if (description.includes('present') || description.includes('presentation')) return 'presentation';
    if (description.includes('portfolio')) return 'portfolio';
    if (description.includes('service') || description.includes('community')) return 'service-learning';
    if (description.includes('collaborate') || description.includes('team')) return 'collaborative-project';
    
    return 'general-project';
  }

  private generateTags(config: RubricGenerationConfig): string[] {
    const tags = [
      config.ageGroup,
      config.rubricType,
      config.assessmentPurpose,
      ...config.subject,
      ...config.criteriaPreferences.priorityCategories
    ];
    
    return Array.from(new Set(tags));
  }

  private assessDifficulty(config: RubricGenerationConfig): 'beginner' | 'intermediate' | 'advanced' {
    const objectiveCount = config.learningObjectives.length;
    const criteriaCount = config.criteriaPreferences.priorityCategories.length;
    
    if (objectiveCount <= 2 && criteriaCount <= 3) return 'beginner';
    if (objectiveCount <= 4 && criteriaCount <= 5) return 'intermediate';
    return 'advanced';
  }

  private generateAssessmentNotes(config: RubricGenerationConfig): string[] {
    const notes = [
      `Designed for ${config.ageGroup} learners`,
      `Assessment purpose: ${config.assessmentPurpose}`,
      `Project duration: ${config.duration}`
    ];
    
    if (config.customRequirements.length > 0) {
      notes.push(`Custom requirements: ${config.customRequirements.join(', ')}`);
    }
    
    return notes;
  }

  // Initialize template banks
  private initializeCriteriaBank(): void {
    // Implementation would include comprehensive criteria templates
    // This is a simplified version for demonstration
  }

  private initializeDescriptorBank(): void {
    // Implementation would include comprehensive descriptor templates
    // This is a simplified version for demonstration
  }

  private getCriterionTemplate(category: CriterionCategory, ageGroup: AgeGroup): CriterionTemplate {
    // Return appropriate template based on category and age group
    return {
      name: this.getCategoryDisplayName(category),
      description: this.getCategoryDescription(category),
      skillTargets: this.getCategorySkillTargets(category)
    };
  }

  private getCategoryDisplayName(category: CriterionCategory): string {
    const names: Record<CriterionCategory, string> = {
      'content-knowledge': 'Content Knowledge',
      'process-skills': 'Process Skills',
      'critical-thinking': 'Critical Thinking',
      'communication': 'Communication',
      'collaboration': 'Collaboration',
      'creativity': 'Creativity',
      'product-quality': 'Product Quality',
      'self-regulation': 'Self-Regulation',
      'research-skills': 'Research Skills',
      'digital-literacy': 'Digital Literacy',
      'presentation': 'Presentation Skills',
      'time-management': 'Time Management',
      'reflection': 'Reflection'
    };
    
    return names[category];
  }

  private getCategoryDescription(category: CriterionCategory): string {
    const descriptions: Record<CriterionCategory, string> = {
      'content-knowledge': 'Showcases deep understanding and makes meaningful connections with key concepts',
      'process-skills': 'Masterfully applies strategic approaches and thoughtful procedures',
      'critical-thinking': 'Brilliantly analyzes information, thoughtfully evaluates evidence, and draws insightful conclusions',
      'communication': 'Powerfully shares ideas through engaging and varied formats',
      'collaboration': 'Inspires others while working together toward shared dreams and goals',
      'creativity': 'Develops original, innovative ideas that spark excitement and wonder',
      'product-quality': 'Creates outstanding work that exceeds expectations and demonstrates pride in craftsmanship',
      'self-regulation': 'Takes ownership of learning journey and celebrates continuous growth',
      'research-skills': 'Skillfully discovers, thoughtfully evaluates, and creatively synthesizes information',
      'digital-literacy': 'Confidently leverages technology tools to enhance learning and expression',
      'presentation': 'Delivers captivating, clear presentations that engage and inspire audiences',
      'time-management': 'Strategically plans and purposefully manages time to achieve success',
      'reflection': 'Engages in meaningful self-discovery and celebrates learning breakthroughs'
    };
    
    return descriptions[category];
  }

  private getCategorySkillTargets(category: CriterionCategory): string[] {
    // Return specific skill targets for each category
    return [];
  }

  private getDevelopmentalConsiderations(category: CriterionCategory, ageGroup: AgeGroup): DevelopmentalConsideration[] {
    // Return age-appropriate developmental considerations
    return [];
  }

  private findDescriptorTemplate(category: CriterionCategory, levelName: string, ageGroup: AgeGroup): DescriptorTemplate {
    // Return appropriate descriptor template
    return {
      description: `Template description for ${category} at ${levelName} level`,
      indicators: [`Indicator 1 for ${category}`, `Indicator 2 for ${category}`],
      examples: [`Example 1 for ${category}`, `Example 2 for ${category}`],
      evidenceRequirements: [`Evidence 1 for ${category}`, `Evidence 2 for ${category}`],
      commonMisconceptions: [`Misconception 1 for ${category}`]
    };
  }

  private customizeDescriptor(template: string, criterionName: string): string {
    return template.replace(/\{criterion\}/g, criterionName);
  }

  private customizeIndicator(template: string, criterionName: string): string {
    return template.replace(/\{criterion\}/g, criterionName);
  }

  private createStudentFriendlyTitle(title: string, ageGroup: AgeGroup): string {
    switch (ageGroup) {
      case 'ages-5-7':
        return title.replace(/Assessment|Rubric/gi, 'My Amazing Learning Adventure');
      case 'ages-8-10':
        return title.replace(/Assessment|Rubric/gi, 'My Success Celebration Guide');
      case 'ages-11-14':
        return title.replace(/Assessment/gi, 'Growth Recognition').replace(/Rubric/gi, 'Excellence Guide');
      case 'ages-15-18':
        return title.replace(/Assessment/gi, 'Achievement Portfolio').replace(/Rubric/gi, 'Mastery Standards');
      default:
        return title.replace(/Assessment/gi, 'Professional Growth Celebration').replace(/Rubric/gi, 'Excellence Framework');
    }
  }

  private determineLanguageLevel(ageGroup: AgeGroup): 'simple' | 'intermediate' | 'advanced' {
    switch (ageGroup) {
      case 'ages-5-7':
      case 'ages-8-10':
        return 'simple';
      case 'ages-11-14':
        return 'intermediate';
      default:
        return 'advanced';
    }
  }

  private generateVisualElements(ageGroup: AgeGroup, rubricType: RubricType): any[] {
    // Generate age-appropriate visual elements
    return [];
  }

  private createCanStatement(criterionName: string, description: string, ageGroup: AgeGroup): string {
    const agePrefix: Record<AgeGroup, string> = {
      'ages-5-7': 'I can proudly',
      'ages-8-10': 'I can confidently',
      'ages-11-14': 'I can successfully',
      'ages-15-18': 'I can masterfully',
      'ages-18+': 'I can expertly'
    };
    
    return `${agePrefix[ageGroup]} ${this.simplifyLanguage(description, ageGroup).toLowerCase()}`;
  }

  private convertToCanStatement(indicator: string, ageGroup: AgeGroup): string {
    return `I can ${this.simplifyLanguage(indicator, ageGroup).toLowerCase()}`;
  }

  private convertToStudentEvidence(evidence: string, ageGroup: AgeGroup): string {
    return `I can show this by ${this.simplifyLanguage(evidence, ageGroup).toLowerCase()}`;
  }

  private createChecklistItems(criterion: RubricCriterion, ageGroup: AgeGroup): string[] {
    return criterion.descriptors.flatMap(d => 
      d.indicators.map(i => this.simplifyLanguage(i, ageGroup))
    ).slice(0, 5); // Limit to 5 items for focus
  }

  private explainWhyExampleWorks(example: string, ageGroup: AgeGroup): string {
    const explanations: Record<AgeGroup, string> = {
      'ages-5-7': 'This is wonderful because it shows you really understand and put your heart into learning!',
      'ages-8-10': 'This shines brightly because it demonstrates your growing skills and creative thinking!',
      'ages-11-14': 'This exemplifies excellence because it showcases your developing expertise and thoughtful approach.',
      'ages-15-18': 'This stands out because it demonstrates sophisticated understanding and skilled execution.',
      'ages-18+': 'This represents mastery because it demonstrates professional-level competency and deep insight.'
    };
    
    return explanations[ageGroup];
  }

  private getAgeSpecificInstructions(ageGroup: AgeGroup): any {
    // Return age-specific instructions that inspire and celebrate learning
    const ageSpecific: Record<AgeGroup, any> = {
      'ages-5-7': {
        selfAssessment: 'Take a moment to celebrate all the amazing things you learned and how much you grew!',
        reflectionPrompts: ['What made me feel super proud today?', 'What exciting discoveries did I make?'],
        goalSetting: ['What new adventure do I want to try in my learning?'],
        evidenceTypes: ['treasures from my learning', 'celebration photos', 'happy thoughts about learning'],
        evidenceExamples: ['my most wonderful creations', 'pictures of me being awesome at learning'],
        organization: ['group my treasures by what makes me proud', 'use pictures and colors to show my journey'],
        peerReview: {
          instructions: 'Be a celebration friend - help others see how amazing their work is!',
          prompts: ['What makes their work sparkle?', 'What magical ideas could help them shine even brighter?'],
          guidelines: ['Find the wonderful parts first', 'Share ideas like giving gifts'],
          examples: ['I love how you made this so colorful!', 'What if you added even more amazing details?']
        }
      },
      'ages-8-10': {
        selfAssessment: 'Use this celebration tool to see how brilliantly you are growing as a learner!',
        reflectionPrompts: ['What accomplishments make me beam with pride?', 'What fascinating new skills am I developing?'],
        goalSetting: ['What exciting abilities do I want to strengthen next?'],
        evidenceTypes: ['showcase pieces that make me proud', 'growth photos', 'reflection treasures'],
        evidenceExamples: ['work that shows my amazing progress', 'before and after pictures of my learning journey'],
        organization: ['create a beautiful timeline of my success', 'organize by subjects that excite me'],
        peerReview: {
          instructions: 'Be an inspiring teammate who helps others see their brilliance and potential!',
          prompts: ['What parts of their work absolutely shine?', 'What encouraging suggestions could help them soar?'],
          guidelines: ['Celebrate their strengths first', 'Offer suggestions as gifts for growth'],
          examples: ['Your explanation is so engaging because...', 'I wonder if adding... might make this even more powerful?']
        }
      },
      'ages-11-14': {
        selfAssessment: 'Engage in meaningful reflection to recognize your growth and plan your continued success journey!',
        reflectionPrompts: ['What achievements demonstrate my developing expertise?', 'How have I grown as a confident learner?'],
        goalSetting: ['What skills am I excited to master next?', 'How will I challenge myself to reach new heights?'],
        evidenceTypes: ['portfolio showcases', 'growth documentation', 'reflection journals', 'peer collaborations'],
        evidenceExamples: ['work that demonstrates my evolving skills', 'evidence of my problem-solving growth'],
        organization: ['curate by learning milestones', 'organize to show skill progression'],
        peerReview: {
          instructions: 'Provide thoughtful feedback that celebrates strengths and inspires continued growth!',
          prompts: ['What aspects demonstrate real mastery?', 'What suggestions could elevate this work further?'],
          guidelines: ['Acknowledge excellence first', 'Offer growth-oriented suggestions', 'Be specific and encouraging'],
          examples: ['Your analysis shows sophisticated thinking because...', 'Consider expanding this strength by...']
        }
      },
      'ages-15-18': {
        selfAssessment: 'Conduct sophisticated self-analysis to celebrate your achievements and strategically plan your continued excellence!',
        reflectionPrompts: ['How do I demonstrate mastery and expertise?', 'What evidence showcases my intellectual growth?'],
        goalSetting: ['What advanced skills will propel my success?', 'How will I continue pushing my boundaries?'],
        evidenceTypes: ['mastery portfolios', 'project showcases', 'reflection essays', 'peer collaborations'],
        evidenceExamples: ['work demonstrating advanced competencies', 'evidence of innovative thinking'],
        organization: ['curate by competency areas', 'showcase growth trajectories'],
        peerReview: {
          instructions: 'Provide professional-quality feedback that recognizes excellence and supports continued growth!',
          prompts: ['What demonstrates exceptional competency?', 'What strategic improvements could enhance impact?'],
          guidelines: ['Lead with recognition of strengths', 'Provide constructive, growth-focused suggestions'],
          examples: ['Your sophisticated analysis of... demonstrates mastery because...', 'To further enhance this already strong work, consider...']
        }
      },
      'ages-18+': {
        selfAssessment: 'Engage in professional reflection to celebrate your expertise and plan your continued professional growth!',
        reflectionPrompts: ['How do I demonstrate professional excellence?', 'What evidence showcases my expertise and impact?'],
        goalSetting: ['What professional competencies will advance my career?', 'How will I continue growing as a leader?'],
        evidenceTypes: ['professional portfolios', 'project showcases', 'impact documentation', 'collaborative achievements'],
        evidenceExamples: ['work products demonstrating professional competency', 'evidence of professional growth and impact'],
        organization: ['organize by professional competencies', 'showcase career development trajectory'],
        peerReview: {
          instructions: 'Provide professional peer review that acknowledges expertise and supports continued excellence!',
          prompts: ['What demonstrates professional mastery?', 'What enhancements could increase professional impact?'],
          guidelines: ['Recognize professional competencies', 'Provide strategic improvement suggestions'],
          examples: ['Your professional competency in... is evident through...', 'For continued professional development, consider...']
        }
      }
    };
    
    return ageSpecific[ageGroup] || ageSpecific['ages-11-14'];
  }
}

// Supporting interfaces
interface CriterionTemplate {
  name: string;
  description: string;
  skillTargets: string[];
}

interface DescriptorTemplate {
  description: string;
  indicators: string[];
  examples: string[];
  evidenceRequirements: string[];
  commonMisconceptions?: string[];
}

export default RubricGenerationService;