/**
 * Student Success Celebration Service
 * 
 * Transforms traditional rubrics into inspiring roadmaps for learning success.
 * Creates empowering "I can" statements, celebration tools, and visual growth trackers
 * that make students feel confident, motivated, and excited about their learning journey.
 * 
 * Every descriptor celebrates progress, recognizes achievements, and guides
 * students toward their next exciting milestone with warmth and encouragement.
 * 
 * Grounded in positive psychology, growth mindset research, and
 * the understanding that learning thrives in environments of trust and celebration.
 */

import {
  Rubric,
  AgeGroup,
  StudentFriendlyRubric,
  StudentFriendlyCriterion,
  CanStatement,
  SelfAssessmentTool,
  VisualElement,
  RubricCriterion,
  PerformanceLevel,
  EvidenceCollectionGuide,
  PeerReviewGuide,
  StudentExample,
  StudentExpectation
} from '../types/rubric';
import { logger } from '../utils/logger';

/**
 * Student-Friendly Rubric Service
 */
export class StudentFriendlyRubricService {
  private languageSimplificationRules: Map<AgeGroup, LanguageRule[]>;
  private visualElementLibrary: Map<string, VisualElementTemplate>;
  private selfAssessmentTemplates: Map<AgeGroup, SelfAssessmentTemplate>;

  constructor() {
    this.languageSimplificationRules = new Map();
    this.visualElementLibrary = new Map();
    this.selfAssessmentTemplates = new Map();
    this.initializeLanguageRules();
    this.initializeVisualLibrary();
    this.initializeSelfAssessmentTemplates();
  }

  /**
   * Transform standard rubric into student-friendly version
   */
  async createStudentFriendlyVersion(rubric: Rubric): Promise<StudentFriendlyRubric> {
    logger.info('Creating student-friendly rubric version', { 
      rubricId: rubric.id, 
      ageGroup: rubric.ageGroup 
    });

    try {
      // Transform criteria to student-friendly format
      const simplifiedCriteria = await this.transformCriteria(rubric.criteria, rubric.ageGroup);

      // Generate "I can" statements
      const canStatements = this.generateCanStatements(
        rubric.criteria,
        rubric.performanceLevels,
        rubric.ageGroup
      );

      // Create self-assessment tools
      const selfAssessment = this.createSelfAssessmentTool(rubric.ageGroup, rubric.type);

      // Generate visual elements
      const visualElements = this.generateVisualElements(rubric.ageGroup, rubric.criteria);

      // Create student-friendly title
      const studentTitle = this.createStudentFriendlyTitle(rubric.title, rubric.ageGroup);

      const studentFriendlyRubric: StudentFriendlyRubric = {
        rubricId: rubric.id,
        title: studentTitle,
        ageGroup: rubric.ageGroup,
        simplifiedCriteria,
        canStatements,
        selfAssessment,
        visualElements,
        languageLevel: this.determineLanguageLevel(rubric.ageGroup)
      };

      logger.info('Successfully created student-friendly rubric', {
        rubricId: rubric.id,
        criteriaCount: simplifiedCriteria.length,
        canStatementsCount: canStatements.length
      });

      return studentFriendlyRubric;

    } catch (error) {
      logger.error('Failed to create student-friendly rubric', { error, rubricId: rubric.id });
      throw new Error(`Student-friendly rubric creation failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive "I can" statements for all criteria and levels
   */
  generateCanStatements(
    criteria: RubricCriterion[],
    performanceLevels: PerformanceLevel[],
    ageGroup: AgeGroup
  ): CanStatement[] {
    logger.info('Generating I can statements', { 
      criteriaCount: criteria.length, 
      levelsCount: performanceLevels.length,
      ageGroup 
    });

    const canStatements: CanStatement[] = [];

    for (const criterion of criteria) {
      for (const level of performanceLevels) {
        const descriptor = criterion.descriptors.find(d => d.levelId === level.id);
        if (descriptor) {
          const statement = this.createCanStatement(
            criterion,
            level,
            descriptor,
            ageGroup
          );
          canStatements.push(statement);
        }
      }
    }

    logger.info('Generated I can statements', { count: canStatements.length });
    return canStatements;
  }

  /**
   * Create interactive self-assessment tool
   */
  createSelfAssessmentTool(ageGroup: AgeGroup, rubricType: string): SelfAssessmentTool {
    logger.info('Creating self-assessment tool', { ageGroup, rubricType });

    const template = this.selfAssessmentTemplates.get(ageGroup);
    if (!template) {
      throw new Error(`No self-assessment template found for age group: ${ageGroup}`);
    }

    const tool: SelfAssessmentTool = {
      instructions: this.personalizeInstructions(template.instructions, ageGroup),
      reflectionPrompts: template.reflectionPrompts.map(prompt => 
        this.adaptPromptToAge(prompt, ageGroup)
      ),
      goalSettingQuestions: template.goalSettingQuestions.map(question =>
        this.adaptPromptToAge(question, ageGroup)
      ),
      evidenceCollection: this.createEvidenceCollectionGuide(ageGroup),
      peerReviewGuidance: this.createPeerReviewGuide(ageGroup)
    };

    logger.info('Created self-assessment tool', { ageGroup });
    return tool;
  }

  /**
   * Generate age-appropriate visual elements
   */
  generateVisualElements(ageGroup: AgeGroup, criteria: RubricCriterion[]): VisualElement[] {
    logger.info('Generating visual elements', { ageGroup, criteriaCount: criteria.length });

    const elements: VisualElement[] = [];

    // Performance level indicators
    elements.push(this.createPerformanceLevelVisuals(ageGroup));

    // Criteria icons
    for (const criterion of criteria) {
      const icon = this.getCriterionIcon(criterion.category, ageGroup);
      if (icon) {
        elements.push(icon);
      }
    }

    // Progress tracking visuals
    elements.push(this.createProgressTrackingVisual(ageGroup));

    // Self-assessment visuals
    if (this.shouldIncludeSelfAssessmentVisuals(ageGroup)) {
      elements.push(this.createSelfAssessmentVisual(ageGroup));
    }

    logger.info('Generated visual elements', { count: elements.length });
    return elements;
  }

  /**
   * Create peer review guidance for collaborative assessment
   */
  createPeerReviewGuide(ageGroup: AgeGroup): PeerReviewGuide {
    const ageSpecificGuidance = this.getPeerReviewGuidanceByAge(ageGroup);

    return {
      instructions: ageSpecificGuidance.instructions,
      feedbackPrompts: ageSpecificGuidance.feedbackPrompts,
      guidelines: ageSpecificGuidance.guidelines,
      examples: ageSpecificGuidance.examples
    };
  }

  /**
   * Generate student examples with explanations
   */
  generateStudentExamples(
    criterion: RubricCriterion,
    performanceLevel: PerformanceLevel,
    ageGroup: AgeGroup
  ): StudentExample[] {
    const examples: StudentExample[] = [];
    
    // Get examples from descriptor
    const descriptor = criterion.descriptors.find(d => d.levelId === performanceLevel.id);
    if (!descriptor) return examples;

    for (const example of descriptor.examples) {
      const studentExample: StudentExample = {
        level: performanceLevel.id,
        example: this.simplifyLanguageForAge(example, ageGroup),
        context: criterion.name,
        whyItWorksWell: this.explainWhyExampleWorks(example, performanceLevel, ageGroup)
      };
      examples.push(studentExample);
    }

    return examples;
  }

  // Private implementation methods

  private async transformCriteria(
    criteria: RubricCriterion[],
    ageGroup: AgeGroup
  ): Promise<StudentFriendlyCriterion[]> {
    const transformedCriteria: StudentFriendlyCriterion[] = [];

    for (const criterion of criteria) {
      const friendlyCriterion = await this.transformSingleCriterion(criterion, ageGroup);
      transformedCriteria.push(friendlyCriterion);
    }

    return transformedCriteria;
  }

  private async transformSingleCriterion(
    criterion: RubricCriterion,
    ageGroup: AgeGroup
  ): Promise<StudentFriendlyCriterion> {
    // Simplify criterion name and description
    const simplifiedName = this.simplifyLanguageForAge(criterion.name, ageGroup);
    const questionPrompt = this.createQuestionPrompt(criterion.name, ageGroup);

    // Transform expectations for each performance level
    const expectations = criterion.descriptors.map(descriptor => {
      const level = descriptor.levelId;
      return {
        level,
        description: this.simplifyLanguageForAge(descriptor.description, ageGroup),
        visualIndicator: this.getVisualIndicatorForLevel(level, ageGroup),
        studentLanguage: this.convertToStudentLanguage(descriptor.description, ageGroup)
      } as StudentExpectation;
    });

    // Generate examples with explanations
    const examples = criterion.descriptors.flatMap(descriptor =>
      descriptor.examples.map(example => ({
        level: descriptor.levelId,
        example: this.simplifyLanguageForAge(example, ageGroup),
        context: criterion.name,
        whyItWorksWell: this.explainWhyExampleWorks(
          example,
          { id: descriptor.levelId } as PerformanceLevel,
          ageGroup
        )
      }))
    );

    // Create checklist items
    const checklistItems = this.createChecklistItems(criterion, ageGroup);

    return {
      id: criterion.id,
      name: simplifiedName,
      questionPrompt,
      expectations,
      examples,
      checklistItems
    };
  }

  private createCanStatement(
    criterion: RubricCriterion,
    level: PerformanceLevel,
    descriptor: any,
    ageGroup: AgeGroup
  ): CanStatement {
    const baseStatement = this.createBaseCanStatement(criterion.name, descriptor.description, ageGroup);
    
    // Break down into smaller steps
    const breakdown = descriptor.indicators
      .map((indicator: string) => this.convertToCanFormat(indicator, ageGroup))
      .slice(0, 4); // Limit to 4 steps for clarity

    // Convert evidence requirements to student language
    const evidence = descriptor.evidenceRequirements
      .map((req: string) => this.convertToStudentEvidence(req, ageGroup))
      .slice(0, 3); // Limit to 3 evidence types

    return {
      criterionId: criterion.id,
      levelId: level.id,
      statement: baseStatement,
      breakdown,
      evidence
    };
  }

  private createBaseCanStatement(
    criterionName: string,
    description: string,
    ageGroup: AgeGroup
  ): string {
    const simplifiedDescription = this.simplifyLanguageForAge(description, ageGroup);
    const actionVerb = this.extractActionVerb(simplifiedDescription, ageGroup);
    
    // Age-appropriate "I can" structure
    switch (ageGroup) {
      case 'ages-5-7':
        return `I can ${actionVerb} ${this.simplifyForEarlyElementary(criterionName)}`;
      case 'ages-8-10':
        return `I can ${actionVerb} ${this.simplifyForUpperElementary(criterionName)}`;
      case 'ages-11-14':
        return `I can ${actionVerb} ${criterionName.toLowerCase()}`;
      default:
        return `I can effectively ${actionVerb} ${criterionName.toLowerCase()}`;
    }
  }

  private createEvidenceCollectionGuide(ageGroup: AgeGroup): EvidenceCollectionGuide {
    const ageSpecificGuide = this.getEvidenceGuideByAge(ageGroup);

    return {
      types: ageSpecificGuide.types,
      examples: ageSpecificGuide.examples,
      organization: ageSpecificGuide.organization,
      reflection: ageSpecificGuide.reflection
    };
  }

  private simplifyLanguageForAge(text: string, ageGroup: AgeGroup): string {
    const rules = this.languageSimplificationRules.get(ageGroup) || [];
    
    let simplified = text;
    for (const rule of rules) {
      simplified = simplified.replace(rule.pattern, rule.replacement);
    }

    return simplified;
  }

  private createQuestionPrompt(criterionName: string, ageGroup: AgeGroup): string {
    const prompts: Record<AgeGroup, (name: string) => string> = {
      'ages-5-7': (name) => `How well did I ${name.toLowerCase()}?`,
      'ages-8-10': (name) => `How well did I ${name.toLowerCase()}?`,
      'ages-11-14': (name) => `How effectively did I demonstrate ${name.toLowerCase()}?`,
      'ages-15-18': (name) => `To what extent did I demonstrate ${name.toLowerCase()}?`,
      'ages-18+': (name) => `How effectively did I demonstrate ${name.toLowerCase()}?`
    };

    return prompts[ageGroup](criterionName);
  }

  private getVisualIndicatorForLevel(levelId: string, ageGroup: AgeGroup): string {
    // Age-appropriate visual indicators
    const youngLearnerIndicators: Record<string, string> = {
      'emerging': '🌱', // Growing strong!
      'developing': '🌿', // Blooming beautifully!
      'proficient': '🌳', // Standing tall!
      'advanced': '⭐', // Shining bright!
      'exemplary': '🏆', // Amazing work!
      'needs-improvement': '🚀' // Ready for takeoff!
    };

    const olderLearnerIndicators: Record<string, string> = {
      'emerging': '📈', // On the rise!
      'developing': '⚡', // Gaining momentum!
      'proficient': '✅', // Nailed it!
      'advanced': '🚀', // Soaring high!
      'exemplary': '💎', // Absolutely brilliant!
      'needs-improvement': '🎯' // Focusing for success!
    };

    const indicators = ['ages-5-7', 'ages-8-10'].includes(ageGroup) 
      ? youngLearnerIndicators 
      : olderLearnerIndicators;

    return indicators[levelId] || '📝';
  }

  private convertToStudentLanguage(description: string, ageGroup: AgeGroup): string {
    let converted = this.simplifyLanguageForAge(description, ageGroup);
    
    // Transform academic language into empowering, student-friendly terms
    const conversions: Record<string, string> = {
      'demonstrates': 'proudly shows',
      'utilizes': 'skillfully uses',
      'comprehends': 'truly understands',
      'analyzes': 'thoughtfully explores',
      'evaluates': 'wisely considers',
      'synthesizes': 'creatively combines',
      'criterion': 'success goal',
      'assessment': 'celebration of learning',
      'performance': 'amazing abilities',
      'needs improvement': 'growing stronger',
      'inadequate': 'building skills',
      'insufficient': 'developing beautifully',
      'fails to': 'is learning to',
      'lacks': 'is discovering',
      'weak': 'strengthening',
      'poor': 'developing'
    };

    for (const [academic, friendly] of Object.entries(conversions)) {
      const regex = new RegExp(`\\b${academic}\\b`, 'gi');
      converted = converted.replace(regex, friendly);
    }

    return converted;
  }

  private createChecklistItems(criterion: RubricCriterion, ageGroup: AgeGroup): string[] {
    const items: string[] = [];
    
    // Extract key indicators from descriptors
    for (const descriptor of criterion.descriptors) {
      const indicators = descriptor.indicators
        .map(indicator => this.convertToChecklistItem(indicator, ageGroup))
        .slice(0, 2); // Limit per level
      items.push(...indicators);
    }

    // Remove duplicates and limit total
    const uniqueItems = Array.from(new Set(items));
    return uniqueItems.slice(0, 6); // Max 6 checklist items
  }

  private convertToChecklistItem(indicator: string, ageGroup: AgeGroup): string {
    const simplified = this.simplifyLanguageForAge(indicator, ageGroup);
    
    // Convert to checkbox-friendly format
    if (!simplified.startsWith('I ')) {
      return `I ${simplified.toLowerCase()}`;
    }
    
    return simplified;
  }

  private convertToCanFormat(indicator: string, ageGroup: AgeGroup): string {
    const simplified = this.simplifyLanguageForAge(indicator, ageGroup);
    return `I can ${simplified.toLowerCase()}`;
  }

  private convertToStudentEvidence(evidence: string, ageGroup: AgeGroup): string {
    const simplified = this.simplifyLanguageForAge(evidence, ageGroup);
    return `I can show this by ${simplified.toLowerCase()}`;
  }

  private explainWhyExampleWorks(
    example: string,
    level: PerformanceLevel,
    ageGroup: AgeGroup
  ): string {
    const explanations: Record<AgeGroup, (example: string, level: PerformanceLevel) => string> = {
      'ages-5-7': () => 'This is wonderful work because it shows you really understand and care about learning!',
      'ages-8-10': () => 'This shines because it shows your brilliant thinking and creativity!',
      'ages-11-14': () => 'This example showcases your growing expertise and thoughtful approach to learning.',
      'ages-15-18': () => 'This exemplifies mastery through compelling evidence and sophisticated reasoning.',
      'ages-18+': () => 'This demonstrates exceptional competency and deep professional understanding.'
    };

    return explanations[ageGroup](example, level);
  }

  private extractActionVerb(description: string, ageGroup: AgeGroup): string {
    // Extract and simplify action verbs for age group
    const verbs = description.match(/\b(shows?|demonstrates?|uses?|creates?|explains?|analyzes?)\b/i);
    if (verbs) {
      const verb = verbs[0].toLowerCase();
      return this.simplifyVerb(verb, ageGroup);
    }
    
    return 'show'; // default
  }

  private simplifyVerb(verb: string, ageGroup: AgeGroup): string {
    if (['ages-5-7', 'ages-8-10'].includes(ageGroup)) {
      const simpleVerbs: Record<string, string> = {
        'demonstrates': 'show',
        'utilizes': 'use',
        'analyzes': 'look at',
        'evaluates': 'check',
        'creates': 'make'
      };
      return simpleVerbs[verb] || verb;
    }
    
    return verb;
  }

  private simplifyForEarlyElementary(text: string): string {
    return text.toLowerCase()
      .replace(/knowledge/g, 'what I know')
      .replace(/skills/g, 'things I can do')
      .replace(/thinking/g, 'my thoughts');
  }

  private simplifyForUpperElementary(text: string): string {
    return text.toLowerCase()
      .replace(/demonstrate/g, 'show')
      .replace(/utilize/g, 'use');
  }

  private createStudentFriendlyTitle(title: string, ageGroup: AgeGroup): string {
    const titleTransforms: Record<AgeGroup, (title: string) => string> = {
      'ages-5-7': (t) => t.replace(/Assessment|Rubric/gi, 'My Amazing Learning Journey'),
      'ages-8-10': (t) => t.replace(/Assessment|Rubric/gi, 'My Success Roadmap'),
      'ages-11-14': (t) => t.replace(/Assessment/gi, 'Growth Celebration').replace(/Rubric/gi, 'Success Guide'),
      'ages-15-18': (t) => t.replace(/Assessment/gi, 'Achievement Reflection').replace(/Rubric/gi, 'Excellence Standards'),
      'ages-18+': (t) => t.replace(/Assessment/gi, 'Professional Growth Celebration')
    };

    return titleTransforms[ageGroup](title);
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

  private personalizeInstructions(instructions: string, ageGroup: AgeGroup): string {
    // Add age-appropriate personalization to instructions
    const personalizations: Record<AgeGroup, string> = {
      'ages-5-7': 'This magical tool helps you celebrate how amazing your learning journey is! Every step forward is something to be proud of! 🌟✨',
      'ages-8-10': 'This is your personal success tracker - use it to see your growth and dream up exciting new goals! 🎯🚀',
      'ages-11-14': 'This empowering tool helps you recognize your strengths, celebrate your progress, and map out your path to even greater success.',
      'ages-15-18': 'This reflective practice strengthens your self-awareness and empowers you to take ownership of your remarkable learning journey.',
      'ages-18+': 'This professional growth tool celebrates your achievements while inspiring continuous learning and excellence.'
    };

    return `${instructions}\n\n${personalizations[ageGroup]}`;
  }

  private adaptPromptToAge(prompt: string, ageGroup: AgeGroup): string {
    return this.simplifyLanguageForAge(prompt, ageGroup);
  }

  // Visual element creation methods

  private createPerformanceLevelVisuals(ageGroup: AgeGroup): VisualElement {
    return {
      type: 'graphic',
      description: 'Visual performance level indicators',
      purpose: 'Help students understand different performance levels',
      ageAppropriate: true,
      accessibility: [
        {
          type: 'alt-text',
          description: 'Performance level visual indicators',
          implementation: 'Screen reader friendly descriptions'
        }
      ]
    };
  }

  private getCriterionIcon(category: string, ageGroup: AgeGroup): VisualElement | null {
    const iconMap: Record<string, string> = {
      'content-knowledge': '🧠',
      'communication': '💬',
      'collaboration': '🤝',
      'creativity': '🎨',
      'critical-thinking': '🤔',
      'process-skills': '⚙️'
    };

    const icon = iconMap[category];
    if (!icon) return null;

    return {
      type: 'icon',
      description: `Icon for ${category}`,
      purpose: 'Visual representation of criterion category',
      ageAppropriate: true,
      accessibility: [
        {
          type: 'alt-text',
          description: `${category} criterion icon`,
          implementation: icon
        }
      ]
    };
  }

  private createProgressTrackingVisual(ageGroup: AgeGroup): VisualElement {
    return {
      type: 'chart',
      description: 'Progress tracking visualization',
      purpose: 'Help students see their growth over time',
      ageAppropriate: true,
      accessibility: [
        {
          type: 'alt-text',
          description: 'Progress tracking chart',
          implementation: 'Data table alternative for screen readers'
        }
      ]
    };
  }

  private shouldIncludeSelfAssessmentVisuals(ageGroup: AgeGroup): boolean {
    return ['ages-5-7', 'ages-8-10'].includes(ageGroup);
  }

  private createSelfAssessmentVisual(ageGroup: AgeGroup): VisualElement {
    return {
      type: 'graphic',
      description: 'Self-assessment visual guide',
      purpose: 'Support young learners in self-reflection',
      ageAppropriate: true,
      accessibility: [
        {
          type: 'alt-text',
          description: 'Self-assessment visual guide',
          implementation: 'Step-by-step text instructions'
        }
      ]
    };
  }

  // Helper methods for age-specific guidance

  private getPeerReviewGuidanceByAge(ageGroup: AgeGroup): any {
    const guidance: Record<AgeGroup, any> = {
      'ages-5-7': {
        instructions: 'Be a wonderful friend by celebrating their amazing work and sharing ideas to help them shine even brighter!',
        feedbackPrompts: [
          'What makes you excited about their work?',
          'What awesome ideas could help them grow even more?'
        ],
        guidelines: [
          'Be a celebration champion - find the sparkle in their work!',
          'Share specific things that make you smile',
          'Offer one magical idea to help them soar higher'
        ],
        examples: [
          'I love how you made this colorful - it makes me happy to look at!',
          'What if you added even more amazing details to make this part extra special?'
        ]
      },
      'ages-8-10': {
        instructions: 'Be an inspiring teammate by celebrating their strengths and sharing ideas that help them reach new heights!',
        feedbackPrompts: [
          'What parts of their work absolutely shine?',
          'What exciting suggestions could help them level up?',
          'What questions show your curiosity about their brilliant ideas?'
        ],
        guidelines: [
          'Lead with celebration - acknowledge their successes first',
          'Share specific examples of what works beautifully',
          'Ask questions that show genuine interest in their thinking',
          'Offer suggestions as gifts to help them soar'
        ],
        examples: [
          'Your explanation of... is so clear and engaging because...',
          'I wonder if adding... might make this already strong section even more powerful?'
        ]
      },
      'ages-11-14': {
        instructions: 'Provide constructive peer feedback using the rubric criteria.',
        feedbackPrompts: [
          'How well does this work meet each criterion?',
          'What evidence supports your assessment?',
          'What specific suggestions would help improve this work?'
        ],
        guidelines: [
          'Base feedback on rubric criteria',
          'Provide evidence for your observations',
          'Be specific and actionable',
          'Maintain a growth mindset'
        ],
        examples: [
          'The content knowledge criterion is met because...',
          'To strengthen the communication aspect, consider...'
        ]
      },
      'ages-15-18': {
        instructions: 'Conduct a thorough peer review using professional feedback principles.',
        feedbackPrompts: [
          'How effectively does this work demonstrate each criterion?',
          'What evidence and examples support the quality level?',
          'What strategic recommendations would enhance this work?'
        ],
        guidelines: [
          'Use criterion-referenced feedback',
          'Provide detailed evidence and rationale',
          'Offer strategic improvement suggestions',
          'Model professional review practices'
        ],
        examples: [
          'The critical thinking demonstrated through... shows mastery because...',
          'To advance to the exemplary level, consider developing...'
        ]
      },
      'ages-18+': {
        instructions: 'Provide professional-level peer review and feedback.',
        feedbackPrompts: [
          'How does this work align with professional standards?',
          'What evidence demonstrates competency levels?',
          'What recommendations support continuous improvement?'
        ],
        guidelines: [
          'Apply professional standards and practices',
          'Provide comprehensive evidence-based feedback',
          'Suggest professional development opportunities',
          'Support colleague growth and excellence'
        ],
        examples: [
          'The professional competency in... is evident through...',
          'For continued professional development, consider...'
        ]
      }
    };

    return guidance[ageGroup];
  }

  private getEvidenceGuideByAge(ageGroup: AgeGroup): any {
    const guides: Record<AgeGroup, any> = {
      'ages-5-7': {
        types: ['amazing pictures of my creations', 'my beautiful drawings', 'cool things I made with my own hands'],
        examples: ['proud photos of my project', 'my most wonderful writing', 'pictures of me being a fantastic learner'],
        organization: ['group my treasures together', 'use pictures to remember my success journey'],
        reflection: ['How magnificently did I grow?', 'What challenges helped me become stronger?', 'What brought me the most joy and excitement?']
      },
      'ages-8-10': {
        types: ['showcase pieces that make me proud', 'celebration photos', 'videos of my awesome explanations', 'thoughtful reflections'],
        examples: ['work that shows my growing skills', 'transformation pictures showing my journey', 'videos of me confidently sharing my knowledge'],
        organization: ['create a timeline of my success', 'organize by the subjects I love', 'label everything with pride and clarity'],
        reflection: ['What incredible new things did I discover?', 'How amazingly have I grown as a learner?', 'What exciting strategies will I try next?']
      },
      'ages-11-14': {
        types: ['work samples', 'process documentation', 'reflection journals', 'peer feedback'],
        examples: ['polished final products', 'draft progression', 'learning reflections', 'peer reviews'],
        organization: ['chronological order', 'by learning objective', 'quality progression'],
        reflection: ['Growth analysis', 'Goal achievement', 'Strategy effectiveness', 'Future planning']
      },
      'ages-15-18': {
        types: ['portfolio artifacts', 'process documentation', 'reflection essays', 'external feedback'],
        examples: ['exemplary work samples', 'project evolution', 'metacognitive reflections', 'expert feedback'],
        organization: ['by standard alignment', 'by competency area', 'by growth trajectory'],
        reflection: ['Competency demonstration', 'Goal attainment', 'Strategy analysis', 'Professional planning']
      },
      'ages-18+': {
        types: ['professional artifacts', 'performance documentation', 'reflective analysis', 'stakeholder feedback'],
        examples: ['work products', 'process improvement', 'professional reflection', 'client feedback'],
        organization: ['by professional standard', 'by competency framework', 'by performance indicator'],
        reflection: ['Professional growth', 'Goal achievement', 'Best practice analysis', 'Continuous improvement']
      }
    };

    return guides[ageGroup];
  }

  // Initialization methods

  private initializeLanguageRules(): void {
    // Age-specific language simplification rules
    const earlyElementaryRules: LanguageRule[] = [
      { pattern: /demonstrates?/gi, replacement: 'proudly shows' },
      { pattern: /utilizes?/gi, replacement: 'cleverly uses' },
      { pattern: /comprehends?/gi, replacement: 'really understands' },
      { pattern: /effectively/gi, replacement: 'wonderfully well' },
      { pattern: /criterion/gi, replacement: 'success goal' },
      { pattern: /assessment/gi, replacement: 'celebration of learning' },
      { pattern: /needs improvement/gi, replacement: 'is growing stronger' },
      { pattern: /inadequate/gi, replacement: 'is developing beautifully' },
      { pattern: /poor/gi, replacement: 'is getting better' },
      { pattern: /weak/gi, replacement: 'is strengthening' },
      { pattern: /fails to/gi, replacement: 'is learning to' },
      { pattern: /lacks/gi, replacement: 'is discovering' }
    ];

    const upperElementaryRules: LanguageRule[] = [
      { pattern: /demonstrates?/gi, replacement: 'shows' },
      { pattern: /utilizes?/gi, replacement: 'uses' },
      { pattern: /criterion/gi, replacement: 'goal' }
    ];

    const middleGradeRules: LanguageRule[] = [
      { pattern: /demonstrates?/gi, replacement: 'shows' }
    ];

    this.languageSimplificationRules.set('ages-5-7', earlyElementaryRules);
    this.languageSimplificationRules.set('ages-8-10', upperElementaryRules);
    this.languageSimplificationRules.set('ages-11-14', middleGradeRules);
    this.languageSimplificationRules.set('ages-15-18', []);
    this.languageSimplificationRules.set('ages-18+', []);
  }

  private initializeVisualLibrary(): void {
    // Initialize visual element templates
    // Implementation would include comprehensive visual library
  }

  private initializeSelfAssessmentTemplates(): void {
    // Initialize age-specific self-assessment templates
    const templates: Record<AgeGroup, SelfAssessmentTemplate> = {
      'ages-5-7': {
        instructions: 'Take a moment to celebrate your amazing learning journey and think about all the wonderful things you accomplished!',
        reflectionPrompts: ['What made me feel proud today?', 'What exciting challenges helped me grow stronger?', 'What brought me the most joy while learning?', 'What amazing new things did I discover?'],
        goalSettingQuestions: ['What exciting skill do I want to grow next?', 'What new adventure will I try in my learning?']
      },
      'ages-8-10': {
        instructions: 'Use this powerful tool to celebrate your learning victories and plan your next exciting steps toward success!',
        reflectionPrompts: ['What accomplishments make me beam with pride?', 'What interesting challenges stretched my thinking?', 'What fascinating discoveries did I make?', 'How remarkably have I grown as a learner?'],
        goalSettingQuestions: ['What skills am I excited to develop further?', 'What new strategies will I explore on my learning adventure?', 'What support will help me reach even greater heights?']
      },
      'ages-11-14': {
        instructions: 'Reflect on your work using the rubric criteria to understand your progress and plan next steps.',
        reflectionPrompts: ['How well did I meet each criterion?', 'What evidence supports my self-assessment?', 'What patterns do I notice in my learning?'],
        goalSettingQuestions: ['What specific skills need improvement?', 'What strategies will I use?', 'What resources do I need?']
      },
      'ages-15-18': {
        instructions: 'Conduct a thorough self-assessment to evaluate your performance and plan for continued growth.',
        reflectionPrompts: ['How effectively did I demonstrate each competency?', 'What evidence best represents my learning?', 'How has my understanding evolved?'],
        goalSettingQuestions: ['What areas require focused development?', 'What strategies align with my learning style?', 'How will I measure progress?']
      },
      'ages-18+': {
        instructions: 'Engage in professional self-reflection to assess competency and plan professional development.',
        reflectionPrompts: ['How do I demonstrate professional competency?', 'What evidence supports my professional growth?', 'How do I contribute to professional standards?'],
        goalSettingQuestions: ['What professional skills require development?', 'What professional learning opportunities align with my goals?', 'How will I measure professional growth?']
      }
    };

    for (const [ageGroup, template] of Object.entries(templates)) {
      this.selfAssessmentTemplates.set(ageGroup as AgeGroup, template);
    }
  }
}

// Supporting interfaces and types
interface LanguageRule {
  pattern: RegExp;
  replacement: string;
}

interface VisualElementTemplate {
  type: string;
  description: string;
  implementation: string;
  ageGroups: AgeGroup[];
}

interface SelfAssessmentTemplate {
  instructions: string;
  reflectionPrompts: string[];
  goalSettingQuestions: string[];
}

export default StudentFriendlyRubricService;