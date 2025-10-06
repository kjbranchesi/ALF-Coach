/**
 * Hero Project Transformer Service
 *
 * Flexible, AI-powered transformation system that converts educator projects
 * into rich, publication-ready hero project formats with progressive enhancement.
 *
 * Key Features:
 * - Progressive enhancement as data grows
 * - Real-time updates during chat sessions
 * - Template-driven transformation for different subjects/grades
 * - Bidirectional data flow (editable outputs)
 * - Standards alignment (Common Core, NGSS, etc.)
 * - Cultural/regional adaptation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UnifiedProjectData } from './UnifiedStorageManager';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';
import type { HeroProjectData } from '../utils/hero/types';

// Transformation quality levels
export type TransformationLevel = 'basic' | 'standard' | 'comprehensive' | 'publication';

// Transformation context for AI enhancement
export interface TransformationContext {
  educatorPreferences?: {
    teachingStyle?: 'direct' | 'inquiry' | 'collaborative' | 'experiential';
    assessmentPreferences?: string[];
    technologyComfort?: 'low' | 'medium' | 'high';
    timeConstraints?: string;
  };
  schoolContext?: {
    type?: 'public' | 'private' | 'charter' | 'homeschool';
    resources?: 'limited' | 'adequate' | 'extensive';
    studentDemographics?: string;
    communityType?: 'urban' | 'suburban' | 'rural';
  };
  standardsAlignment?: {
    primary: 'common-core' | 'ngss' | 'state-specific' | 'international';
    secondary?: string[];
    customStandards?: string[];
  };
  enhancementGoals?: {
    priorityAreas?: ('assessment' | 'differentiation' | 'technology' | 'community-connection' | 'real-world-application')[];
    excludeAreas?: string[];
    emphasisLevel?: TransformationLevel;
  };
}

// Tracks what content is AI-generated vs user-created
export interface ContentProvenance {
  source: 'user' | 'ai-generated' | 'ai-enhanced' | 'template';
  confidence: number; // 0-1 scale
  lastUpdated: Date;
  userEdited?: boolean;
}

// Enhanced hero data with transformation metadata
export interface EnhancedHeroProjectData extends HeroProjectData {
  showcase?: ProjectShowcaseV2;
  transformationMeta: {
    level: TransformationLevel;
    context: TransformationContext;
    lastTransformed: Date;
    dataCompleteness: number; // 0-1 scale
    provenance: Record<string, ContentProvenance>;
    userOverrides: Record<string, any>;
    pendingUpdates?: string[];
  };
}

export class HeroProjectTransformer {
  private static instance: HeroProjectTransformer;
  private genAI: GoogleGenerativeAI;
  private transformationCache = new Map<string, { data: EnhancedHeroProjectData; timestamp: number }>();

  private constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[HeroProjectTransformer] No Gemini API key found. AI enhancements disabled.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'fallback');
  }

  static getInstance(): HeroProjectTransformer {
    if (!HeroProjectTransformer.instance) {
      HeroProjectTransformer.instance = new HeroProjectTransformer();
    }
    return HeroProjectTransformer.instance;
  }

  /**
   * Main transformation method - converts UnifiedProjectData to HeroProjectData
   * with progressive enhancement based on available data
   */
  async transformProject(
    projectData: UnifiedProjectData,
    context: TransformationContext = {},
    targetLevel: TransformationLevel = 'standard'
  ): Promise<EnhancedHeroProjectData> {
    try {
      console.log(`[HeroTransformer] Transforming project: ${projectData.id} to ${targetLevel} level`);

      // Check cache for recent transformations
      const cached = this.getCachedTransformation(projectData.id, projectData.updatedAt);
      if (cached && cached.transformationMeta.level === targetLevel) {
        console.log(`[HeroTransformer] Using cached transformation for ${projectData.id}`);
        return cached;
      }

      // Analyze data completeness
      const completeness = this.analyzeDataCompleteness(projectData);
      console.log(`[HeroTransformer] Data completeness: ${Math.round(completeness * 100)}%`);

      // Build transformation pipeline based on available data and target level
      const pipeline = this.buildTransformationPipeline(projectData, completeness, targetLevel);

      // Execute transformation
      const heroData = await this.executeTransformation(projectData, pipeline, context);

      // Add transformation metadata
      const enhancedData: EnhancedHeroProjectData = {
        ...heroData,
        showcase: (projectData.showcase as ProjectShowcaseV2 | undefined) ||
          (projectData.projectData?.showcase as ProjectShowcaseV2 | undefined),
        transformationMeta: {
          level: targetLevel,
          context,
          lastTransformed: new Date(),
          dataCompleteness: completeness,
          provenance: this.generateProvenance(heroData, projectData),
          userOverrides: {},
          pendingUpdates: []
        }
      };

      // Cache the result
      this.cacheTransformation(projectData.id, enhancedData);

      console.log(`[HeroTransformer] Transformation complete for ${projectData.id}`);
      return enhancedData;

    } catch (error) {
      console.error(`[HeroTransformer] Transformation failed for ${projectData.id}:`, error);

      // Return fallback transformation
      return this.createFallbackTransformation(projectData, context, targetLevel);
    }
  }

  /**
   * Incremental update method for real-time chat integration
   */
  async updateTransformation(
    projectId: string,
    updates: Partial<UnifiedProjectData>,
    context?: Partial<TransformationContext>
  ): Promise<EnhancedHeroProjectData | null> {
    const cached = this.transformationCache.get(projectId);
    if (!cached) {
      console.warn(`[HeroTransformer] No cached transformation found for incremental update: ${projectId}`);
      return null;
    }

    try {
      // Determine what sections need updating
      const impactedSections = this.analyzeUpdateImpact(updates);

      if (impactedSections.length === 0) {
        console.log(`[HeroTransformer] No significant changes detected for ${projectId}`);
        return cached.data;
      }

      console.log(`[HeroTransformer] Updating sections for ${projectId}:`, impactedSections);

      // Perform selective enhancement of impacted sections
      const updatedData = await this.enhanceSpecificSections(
        cached.data,
        updates,
        impactedSections,
        context
      );

      // Update cache
      this.cacheTransformation(projectId, updatedData);

      return updatedData;

    } catch (error) {
      console.error(`[HeroTransformer] Incremental update failed for ${projectId}:`, error);
      return cached.data; // Return existing data on error
    }
  }

  /**
   * Template-driven transformation for different project types
   */
  private buildTransformationPipeline(
    projectData: UnifiedProjectData,
    completeness: number,
    targetLevel: TransformationLevel
  ) {
    const subject = projectData.wizardData?.subject?.toLowerCase() || 'general';
    const ageGroup = projectData.wizardData?.ageGroup?.toLowerCase() || 'middle-school';

    // Base pipeline steps
    const pipeline = [
      'core-structure',      // Basic hero project structure
      'content-analysis',    // Analyze existing content
      'gap-identification',  // Find missing pieces
    ];

    // Add level-specific enhancements
    switch (targetLevel) {
      case 'comprehensive':
      case 'publication':
        pipeline.push(
          'standards-alignment',    // Align with educational standards
          'assessment-framework',   // Comprehensive rubrics & assessments
          'differentiation',        // Support for diverse learners
          'community-connections',  // Real-world partnerships
          'implementation-guide',   // Week-by-week implementation
          'resource-curation',      // Curated learning resources
          'parent-communication'    // Parent/guardian engagement
        );
        break;

      case 'standard':
        pipeline.push(
          'basic-assessment',       // Essential rubrics
          'learning-activities',    // Structured activities
          'resource-suggestions',   // Basic resource list
          'simple-implementation'   // Basic timeline
        );
        break;

      case 'basic':
      default:
        pipeline.push(
          'basic-structure',        // Minimal hero format
          'essential-content'       // Core educational content
        );
    }

    // Subject-specific enhancements
    if (subject.includes('science')) {
      pipeline.push('stem-integration', 'inquiry-methods', 'lab-activities');
    } else if (subject.includes('social') || subject.includes('history')) {
      pipeline.push('primary-sources', 'civic-engagement', 'historical-thinking');
    } else if (subject.includes('language') || subject.includes('english')) {
      pipeline.push('literacy-integration', 'writing-scaffolds', 'communication-skills');
    } else if (subject.includes('math')) {
      pipeline.push('problem-solving', 'real-world-applications', 'mathematical-practices');
    }

    // Age-specific adaptations
    if (ageGroup.includes('elementary')) {
      pipeline.push('age-appropriate-activities', 'simple-vocabulary', 'hands-on-learning');
    } else if (ageGroup.includes('high-school')) {
      pipeline.push('advanced-research', 'college-prep', 'career-connections');
    }

    return pipeline;
  }

  /**
   * Execute the transformation pipeline using AI enhancement
   */
  private async executeTransformation(
    projectData: UnifiedProjectData,
    pipeline: string[],
    context: TransformationContext
  ): Promise<HeroProjectData> {
    // Start with basic structure from template
    let heroData = this.createBaseHeroStructure(projectData);

    // Execute each pipeline step
    for (const step of pipeline) {
      try {
        heroData = await this.executeTransformationStep(heroData, projectData, step, context);
      } catch (error) {
        console.warn(`[HeroTransformer] Step ${step} failed, continuing...`, error);
      }
    }

    return heroData;
  }

  /**
   * Execute individual transformation step
   */
  private async executeTransformationStep(
    currentHero: HeroProjectData,
    originalData: UnifiedProjectData,
    step: string,
    context: TransformationContext
  ): Promise<HeroProjectData> {

    switch (step) {
      case 'core-structure':
        return this.enhanceCoreStructure(currentHero, originalData);

      case 'standards-alignment':
        return await this.alignWithStandards(currentHero, originalData, context);

      case 'assessment-framework':
        return await this.createAssessmentFramework(currentHero, originalData, context);

      case 'learning-activities':
        return await this.enhanceLearningActivities(currentHero, originalData, context);

      case 'differentiation':
        return await this.addDifferentiation(currentHero, originalData, context);

      case 'implementation-guide':
        return await this.createImplementationGuide(currentHero, originalData, context);

      default:
        console.log(`[HeroTransformer] Unknown step: ${step}, skipping...`);
        return currentHero;
    }
  }

  /**
   * Create base hero structure from wizard/chat data
   */
  private createBaseHeroStructure(projectData: UnifiedProjectData): HeroProjectData {
    const wizardData = projectData.wizardData || {};
    const capturedData = projectData.capturedData || {};
    const storedShowcase = (projectData.showcase as ProjectShowcaseV2 | undefined) ||
      (projectData.projectData?.showcase as ProjectShowcaseV2 | undefined);

    const baseHero: HeroProjectData = {
      id: projectData.id,
      title: projectData.title,
      tagline: projectData.tagline || wizardData.vision || 'Student-driven project-based learning experience',
      duration: wizardData.duration || '4-6 weeks',
      gradeLevel: wizardData.ageGroup || 'Middle School',
      subjects: [wizardData.subject || 'Interdisciplinary'],
      theme: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#f59e0b',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
      },

      courseAbstract: {
        overview: wizardData.motivation || 'A comprehensive project-based learning experience.',
        learningObjectives: this.extractLearningObjectives(capturedData),
        prerequisites: [],
        methodology: 'Project-based learning with authentic assessment',
        expectedOutcomes: []
      },

      hero: {
        badge: wizardData.subject || 'PBL Project',
        description: wizardData.motivation || projectData.title,
        highlights: this.createHeroHighlights(wizardData, capturedData),
        impactStatement: wizardData.impact || 'Students will create real-world solutions that matter.'
      },

      context: {
        problem: capturedData['ideation.challenge'] || 'Students need authentic learning experiences.',
        significance: 'This project addresses real-world challenges while building essential skills.',
        realWorld: wizardData.scope || 'Local and global applications',
        studentRole: 'Active researchers, creators, and problem-solvers',
        authenticity: 'Connected to genuine community needs and current issues'
      },

      overview: {
        description: this.createProjectDescription(wizardData, capturedData),
        keyFeatures: this.extractKeyFeatures(capturedData),
        outcomes: this.extractOutcomes(capturedData),
        deliverables: this.createDeliverables(capturedData)
      },

      bigIdea: {
        statement: capturedData['ideation.bigIdea'] || wizardData.vision || 'Students explore meaningful questions through hands-on investigation.',
        essentialQuestion: capturedData['ideation.essentialQuestion'] || 'How can we create positive change in our community?',
        subQuestions: this.extractSubQuestions(capturedData),
        challenge: capturedData['ideation.challenge'] || 'Design a solution to a real-world problem.',
        drivingQuestion: this.createDrivingQuestion(wizardData, capturedData)
      },

      standards: {
        objectives: this.createLearningObjectives(wizardData, capturedData),
        alignments: {} // Will be populated by AI enhancement
      },

      journey: {
        phases: this.convertCapturedPhases(capturedData),
        milestones: [],
        timeline: [],
        weeklyBreakdown: []
      },

      assessment: {
        philosophy: 'Authentic assessment through project artifacts and peer collaboration',
        rubric: [],
        formative: [],
        summative: [],
        selfAssessment: [],
        peerAssessment: []
      },

      resources: {
        required: [],
        optional: [],
        professional: [],
        studentResources: [],
        communityConnections: []
      },

      impact: {
        audience: {
          primary: ['Local community'],
          secondary: ['School community'],
          engagement: 'Direct presentation and feedback',
          feedback: 'Community partners provide authentic assessment'
        },
        methods: [],
        metrics: [],
        sustainability: {
          continuation: 'Project outcomes can be implemented long-term',
          maintenance: 'Student-created resources remain available',
          evolution: 'Project can be adapted for future cohorts',
          legacy: 'Builds foundation for ongoing community engagement'
        },
        scalability: {
          classroom: 'Easily adapted for different class sizes',
          school: 'Can be implemented across grade levels',
          district: 'Scalable to multiple schools',
          beyond: 'Framework applicable to any community'
        }
      },

      implementation: {
        gettingStarted: {
          overview: 'A step-by-step guide to launching this project successfully',
          prerequisites: [],
          firstWeek: [],
          commonMistakes: [],
          quickWins: []
        },
        weeklyReflections: [],
        troubleshooting: { challenges: [] },
        modifications: {
          advancedLearners: { modifications: [], scaffolds: [], extensions: [], assessmentAdaptations: [] },
          onLevelLearners: { modifications: [], scaffolds: [], extensions: [], assessmentAdaptations: [] },
          strugglingLearners: { modifications: [], scaffolds: [], extensions: [], assessmentAdaptations: [] },
          englishLearners: { modifications: [], scaffolds: [], extensions: [], assessmentAdaptations: [] },
          specialEducation: { modifications: [], scaffolds: [], extensions: [], assessmentAdaptations: [] }
        },
        extensions: {
          earlyFinishers: [],
          summerProjects: [],
          competitionOpportunities: [],
          independentStudy: []
        },
        technologyIntegration: {
          required: [],
          optional: [],
          alternatives: [],
          digitalCitizenship: []
        }
      },

      teacherSupport: {
        lessonPlans: [],
        facilitation: {
          philosophy: 'Guide students as facilitator, not director',
          keyStrategies: [],
          questioningTechniques: [],
          groupManagement: [],
          conflictResolution: []
        },
        professionaldevelopment: {
          preLaunch: [],
          duringProject: [],
          postProject: [],
          resources: [],
          community: 'ALF Coach Community Forum'
        },
        parentCommunication: {
          introLetter: 'Welcome to our project-based learning adventure!',
          weeklyUpdates: true,
          volunteerOpportunities: [],
          homeExtensions: [],
          showcaseInvitation: 'You are invited to our final project showcase!'
        }
      },

      studentSupport: {
        projectGuide: {
          overview: 'Your guide to success in this project',
          timeline: 'Project spans 4-6 weeks with weekly milestones',
          expectations: [],
          resources: [],
          tips: []
        },
        researchProtocol: {
          guidelines: [],
          credibleSources: [],
          citationFormat: 'APA Style',
          factChecking: [],
          ethics: []
        },
        collaborationFramework: {
          teamFormation: 'Mixed-ability groups of 3-4 students',
          roles: [],
          norms: [],
          conflictResolution: [],
          communication: []
        },
        presentationSupport: {
          formats: [],
          rubric: 'Comprehensive presentation rubric provided',
          speakingTips: [],
          visualAids: [],
          practice: 'Multiple practice opportunities built into timeline'
        }
      },

      media: {
        headerImage: undefined, // No default image
        galleryImages: [],
        videos: [],
        infographics: [],
        examples: []
      }
    };

    return storedShowcase
      ? this.applyShowcaseToHero(baseHero, storedShowcase, projectData)
      : baseHero;
  }

  private applyShowcaseToHero(
    hero: HeroProjectData,
    showcase: ProjectShowcaseV2,
    projectData: UnifiedProjectData
  ): HeroProjectData {
    const updated: HeroProjectData = {
      ...hero,
      subjects: showcase.hero?.subjects?.length ? showcase.hero.subjects : hero.subjects,
      duration: showcase.hero?.timeframe || hero.duration,
      gradeLevel: showcase.hero?.gradeBand || hero.gradeLevel,
      title: showcase.hero?.title || projectData.title || hero.title,
      tagline: projectData.tagline || showcase.hero?.tagline || hero.tagline
    };

    const overviewText = showcase.fullOverview || projectData.description || hero.courseAbstract.overview;
    if (overviewText) {
      updated.courseAbstract = {
        ...updated.courseAbstract,
        overview: overviewText,
        expectedOutcomes: showcase.outcomes?.core?.length ? showcase.outcomes.core : updated.courseAbstract.expectedOutcomes
      };
      updated.hero.description = overviewText;
      updated.overview.description = overviewText;
    }

    const microOverview = (showcase.microOverview || []).filter(Boolean);
    if (microOverview.length) {
      const iconPool = ['sparkles', 'target', 'rocket', 'compass'];
      updated.hero.highlights = microOverview.slice(0, 3).map((entry, index) => ({
        icon: iconPool[index % iconPool.length],
        label: `Highlight ${index + 1}`,
        value: entry
      }));
      updated.overview.keyFeatures = microOverview;
    }

    if (showcase.outcomes?.core?.length) {
      updated.overview.outcomes = showcase.outcomes.core;
    }

    if (showcase.assignments?.length) {
      updated.overview.deliverables = showcase.assignments.map(assignment => ({
        name: assignment.title,
        description: assignment.summary,
        format: 'Assignment'
      }));
    }

    const requiredResources = (showcase.materialsPrep?.coreKit || []).map(item => ({
      name: item,
      type: 'material' as const
    }));

    const optionalResources = (showcase.materialsPrep?.noTechFallback || []).map(item => ({
      name: item,
      type: 'material' as const
    }));

    updated.resources = {
      ...updated.resources,
      required: requiredResources,
      optional: optionalResources,
      professional: updated.resources.professional,
      studentResources: updated.resources.studentResources,
      communityConnections: updated.resources.communityConnections
    };

    if (showcase.outcomes?.audiences?.length) {
      const audienceProfile = {
        primary: showcase.outcomes.audiences,
        secondary: [] as string[],
        global: [] as string[],
        engagement: updated.impact.audience.engagement || 'Authentic community review',
        feedback: updated.impact.audience.feedback || 'Stakeholder commitments captured through showcase'
      };

      updated.impact = {
        ...updated.impact,
        audience: audienceProfile,
        methods: updated.impact.methods,
        metrics: updated.impact.metrics,
        sustainability: updated.impact.sustainability,
        scalability: updated.impact.scalability
      };
    }

    if (showcase.runOfShow?.length) {
      updated.journey.phases = showcase.runOfShow.map((week, index) => {
        const phaseId = `phase-${index + 1}`;
        const studentActivities = (week.students || []).map((activity, activityIdx) => ({
          name: activity,
          type: 'group' as const,
          duration: 'class period',
          description: activity,
          materials: [],
          instructions: [activity],
          differentiation: { support: [], extension: [] },
          assessment: ''
        }));

        const teacherActivities = (week.teacher || []).map((activity, activityIdx) => ({
          name: activity,
          type: 'class' as const,
          duration: 'class period',
          description: activity,
          materials: [],
          instructions: [activity],
          differentiation: { support: [], extension: [] },
          assessment: ''
        }));

        return {
          id: phaseId,
          name: week.weekLabel || `Week ${index + 1}`,
          duration: week.kind ? `${week.kind}` : '1 week',
          focus: week.focus || '',
          description: week.focus || '',
          objectives: (week.students || []).map((line, idx) => `Focus ${idx + 1}: ${line}`),
          activities: [...studentActivities, ...teacherActivities],
          deliverables: week.deliverables || [],
          checkpoints: (week.checkpoint || []).map(checkpoint => ({
            name: checkpoint,
            criteria: [],
            evidence: [],
            support: ''
          })),
          resources: [],
          teacherNotes: (week.teacher || []).join('; '),
          studentTips: (week.students || []).join('; ')
        };
      });

      updated.journey.milestones = showcase.runOfShow.flatMap((week, index) =>
        (week.deliverables || []).map((deliverable, deliverableIdx) => ({
          id: `milestone-${index + 1}-${deliverableIdx + 1}`,
          phase: week.weekLabel || `Week ${index + 1}`,
          week: index + 1,
          title: deliverable,
          description: deliverable,
          evidence: [],
          celebration: ''
        }))
      );

      updated.journey.timeline = showcase.runOfShow.map((week, index) => ({
        week: index + 1,
        phase: week.weekLabel || `Week ${index + 1}`,
        title: week.focus || week.kind || `Week ${index + 1}`,
        activities: [...(week.students || []), ...(week.teacher || [])],
        deliverable: week.deliverables?.[0],
        assessment: week.checkpoint?.[0]
      }));
    }

    if (showcase.polish?.microRubric?.length) {
      const weight = Math.round(100 / showcase.polish.microRubric.length) || 25;
      updated.assessment.rubric = showcase.polish.microRubric.map((criterion, idx) => ({
        category: `Criterion ${idx + 1}`,
        weight,
        exemplary: { points: 4, description: criterion, evidence: [] },
        proficient: { points: 3, description: criterion, evidence: [] },
        developing: { points: 2, description: criterion, evidence: [] },
        beginning: { points: 1, description: criterion, evidence: [] }
      }));
    }

    return updated;
  }

  // Helper methods for data extraction and conversion
  private extractLearningObjectives(capturedData: Record<string, any>): string[] {
    const objectives = [];

    // Look for objectives in various chat captures
    if (capturedData['learning.objectives']) {
      objectives.push(...this.parseListData(capturedData['learning.objectives']));
    }

    if (capturedData['standards.objectives']) {
      objectives.push(...this.parseListData(capturedData['standards.objectives']));
    }

    return objectives.length > 0 ? objectives : [
      'Students will engage in authentic problem-solving',
      'Students will collaborate effectively in teams',
      'Students will communicate findings to real audiences'
    ];
  }

  private createHeroHighlights(wizardData: any, capturedData: any) {
    return [
      {
        icon: 'users',
        label: 'Grade Level',
        value: wizardData.ageGroup || 'Adaptable'
      },
      {
        icon: 'clock',
        label: 'Duration',
        value: wizardData.duration || '4-6 weeks'
      },
      {
        icon: 'target',
        label: 'Subject',
        value: wizardData.subject || 'Interdisciplinary'
      },
      {
        icon: 'globe',
        label: 'Impact',
        value: wizardData.scope || 'Community'
      }
    ];
  }

  private createProjectDescription(wizardData: any, capturedData: any): string {
    const base = wizardData.motivation || wizardData.vision || '';
    const bigIdea = capturedData['ideation.bigIdea'] || '';
    const challenge = capturedData['ideation.challenge'] || '';

    if (base && bigIdea) {
      return `${base} Through ${bigIdea.toLowerCase()}, students will ${challenge.toLowerCase() || 'tackle real-world challenges'}.`;
    }

    return base || 'An engaging project-based learning experience that connects students with their community.';
  }

  private extractKeyFeatures(capturedData: Record<string, any>): string[] {
    const features = [];

    // Extract from different chat sections
    Object.entries(capturedData).forEach(([key, value]) => {
      if (key.includes('feature') || key.includes('activity') || key.includes('component')) {
        if (typeof value === 'string') {
          features.push(value);
        }
      }
    });

    return features.length > 0 ? features : [
      'Authentic problem-solving challenges',
      'Community partner collaboration',
      'Student-driven inquiry and research',
      'Multiple presentation formats',
      'Peer collaboration and feedback'
    ];
  }

  private extractOutcomes(capturedData: Record<string, any>): string[] {
    // Look for outcomes in captured data
    const outcomes = [];

    if (capturedData['outcomes'] || capturedData['learning.outcomes']) {
      const rawOutcomes = capturedData['outcomes'] || capturedData['learning.outcomes'];
      outcomes.push(...this.parseListData(rawOutcomes));
    }

    return outcomes.length > 0 ? outcomes : [
      'Students demonstrate deep understanding of subject content',
      'Students develop critical thinking and problem-solving skills',
      'Students create authentic products for real audiences',
      'Students build communication and collaboration skills'
    ];
  }

  private createDeliverables(capturedData: Record<string, any>) {
    // Extract deliverables from captured data
    const deliverables = [];

    if (capturedData['deliverables'] || capturedData['project.deliverables']) {
      const rawDeliverables = capturedData['deliverables'] || capturedData['project.deliverables'];
      if (typeof rawDeliverables === 'string') {
        deliverables.push({
          name: rawDeliverables,
          description: 'Student-created project artifact',
          format: 'Multiple formats supported'
        });
      }
    }

    // Add milestone deliverables from journey data
    Object.entries(capturedData).forEach(([key, value]) => {
      if (key.includes('milestone') && typeof value === 'string') {
        deliverables.push({
          name: value,
          description: 'Project milestone deliverable',
          format: 'Varies by project phase'
        });
      }
    });

    return deliverables.length > 0 ? deliverables : [
      {
        name: 'Research Portfolio',
        description: 'Comprehensive documentation of student inquiry and findings',
        format: 'Digital portfolio or physical collection'
      },
      {
        name: 'Solution Prototype',
        description: 'Student-designed solution to the identified challenge',
        format: 'Physical model, digital design, or detailed plan'
      },
      {
        name: 'Community Presentation',
        description: 'Formal presentation of findings and solutions to authentic audience',
        format: 'Oral presentation with visual aids'
      }
    ];
  }

  private extractSubQuestions(capturedData: Record<string, any>): string[] {
    const subQuestions = [];

    // Look for sub-questions in captured data
    Object.entries(capturedData).forEach(([key, value]) => {
      if (key.includes('question') && !key.includes('essential') && typeof value === 'string') {
        subQuestions.push(value);
      }
    });

    return subQuestions.length > 0 ? subQuestions : [
      'What evidence supports our understanding?',
      'How do different perspectives inform our approach?',
      'What are the potential impacts of our solution?'
    ];
  }

  private createDrivingQuestion(wizardData: any, capturedData: any): string {
    const essentialQ = capturedData['ideation.essentialQuestion'];
    const challenge = capturedData['ideation.challenge'];
    const subject = wizardData.subject;

    if (essentialQ) {return essentialQ;}
    if (challenge) {return `How might we address ${challenge.toLowerCase()}?`;}
    if (subject) {return `How can ${subject.toLowerCase()} help us solve real-world problems?`;}

    return 'How can we create positive change in our community through our learning?';
  }

  private createLearningObjectives(wizardData: any, capturedData: any) {
    const subject = wizardData.subject || 'General';
    const objectives = [];

    // Subject-specific objectives
    objectives.push({
      category: `${subject} Content Knowledge`,
      items: this.extractLearningObjectives(capturedData)
    });

    // 21st Century Skills
    objectives.push({
      category: '21st Century Skills',
      items: [
        'Critical thinking and problem solving',
        'Communication and collaboration',
        'Creativity and innovation',
        'Information and media literacy'
      ]
    });

    return objectives;
  }

  private convertCapturedPhases(capturedData: Record<string, any>) {
    const phases = [];

    // Look for phase data in captured content
    Object.entries(capturedData).forEach(([key, value]) => {
      if (key.includes('phase') || key.includes('stage')) {
        if (typeof value === 'string' && value.length > 10) {
          phases.push({
            id: `phase-${phases.length + 1}`,
            name: value.substring(0, 50),
            duration: '1-2 weeks',
            focus: 'Student inquiry and investigation',
            description: value,
            objectives: [],
            activities: [],
            deliverables: [],
            checkpoints: [],
            resources: [],
            teacherNotes: '',
            studentTips: ''
          });
        }
      }
    });

    // Default phases if none captured
    if (phases.length === 0) {
      phases.push(
        {
          id: 'phase-1',
          name: 'Explore & Question',
          duration: '1 week',
          focus: 'Problem identification and initial research',
          description: 'Students explore the topic area and develop focused research questions.',
          objectives: ['Identify authentic problems', 'Develop research questions'],
          activities: [],
          deliverables: ['Research questions', 'Initial findings'],
          checkpoints: [],
          resources: [],
          teacherNotes: 'Focus on student-generated questions',
          studentTips: 'Start with what you wonder about'
        },
        {
          id: 'phase-2',
          name: 'Investigate & Create',
          duration: '2-3 weeks',
          focus: 'Deep research and solution development',
          description: 'Students conduct thorough research and begin developing solutions.',
          objectives: ['Conduct thorough research', 'Design potential solutions'],
          activities: [],
          deliverables: ['Research portfolio', 'Solution prototype'],
          checkpoints: [],
          resources: [],
          teacherNotes: 'Support student independence',
          studentTips: 'Document your thinking process'
        },
        {
          id: 'phase-3',
          name: 'Share & Reflect',
          duration: '1 week',
          focus: 'Presentation and reflection on learning',
          description: 'Students share their work with authentic audiences and reflect on their learning.',
          objectives: ['Present to authentic audiences', 'Reflect on learning process'],
          activities: [],
          deliverables: ['Community presentation', 'Learning reflection'],
          checkpoints: [],
          resources: [],
          teacherNotes: 'Facilitate meaningful feedback',
          studentTips: 'Focus on your learning journey'
        }
      );
    }

    return phases;
  }

  // Utility methods
  private parseListData(data: any): string[] {
    if (Array.isArray(data)) {return data;}
    if (typeof data === 'string') {
      return data.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    }
    return [];
  }

  private analyzeDataCompleteness(projectData: UnifiedProjectData): number {
    let score = 0;
    const maxScore = 10;

    // Core data presence
    if (projectData.title) {score += 1;}
    if (projectData.wizardData?.subject) {score += 1;}
    if (projectData.wizardData?.ageGroup) {score += 1;}
    if (projectData.wizardData?.motivation) {score += 2;}

    // Captured data richness
    const capturedKeys = Object.keys(projectData.capturedData || {});
    if (capturedKeys.length > 3) {score += 1;}
    if (capturedKeys.length > 6) {score += 1;}
    if (capturedKeys.length > 10) {score += 2;}

    // Chat history depth
    const chatLength = projectData.chatHistory?.length || 0;
    if (chatLength > 5) {score += 1;}

    return Math.min(score / maxScore, 1);
  }

  private getCachedTransformation(projectId: string, updatedAt: Date): EnhancedHeroProjectData | null {
    const cached = this.transformationCache.get(projectId);
    if (!cached) {return null;}

    // Check if cache is still valid (within 5 minutes of last update)
    const cacheAge = Date.now() - cached.timestamp;
    const dataAge = Date.now() - updatedAt.getTime();

    if (cacheAge < dataAge + 300000) { // 5 minutes
      return cached.data;
    }

    return null;
  }

  private cacheTransformation(projectId: string, data: EnhancedHeroProjectData): void {
    this.transformationCache.set(projectId, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries (keep last 50)
    if (this.transformationCache.size > 50) {
      const entries = Array.from(this.transformationCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);

      // Keep only the 30 most recent
      this.transformationCache.clear();
      entries.slice(0, 30).forEach(([key, value]) => {
        this.transformationCache.set(key, value);
      });
    }
  }

  private analyzeUpdateImpact(updates: Partial<UnifiedProjectData>): string[] {
    const impactedSections = [];

    if (updates.wizardData) {impactedSections.push('core-structure', 'hero');}
    if (updates.capturedData) {impactedSections.push('journey', 'big-idea', 'context');}
    if (updates.chatHistory) {impactedSections.push('activities', 'resources');}

    return impactedSections;
  }

  private async enhanceSpecificSections(
    currentData: EnhancedHeroProjectData,
    updates: Partial<UnifiedProjectData>,
    sections: string[],
    context?: Partial<TransformationContext>
  ): Promise<EnhancedHeroProjectData> {
    // For now, return the current data with updated timestamp
    // This will be enhanced with AI-powered section updates

    return {
      ...currentData,
      transformationMeta: {
        ...currentData.transformationMeta,
        lastTransformed: new Date(),
        pendingUpdates: sections
      }
    };
  }

  private createFallbackTransformation(
    projectData: UnifiedProjectData,
    context: TransformationContext,
    targetLevel: TransformationLevel
  ): EnhancedHeroProjectData {
    const baseHero = this.createBaseHeroStructure(projectData);

    return {
      ...baseHero,
      showcase: (projectData.showcase as ProjectShowcaseV2 | undefined) ||
        (projectData.projectData?.showcase as ProjectShowcaseV2 | undefined),
      transformationMeta: {
        level: 'basic',
        context,
        lastTransformed: new Date(),
        dataCompleteness: this.analyzeDataCompleteness(projectData),
        provenance: {},
        userOverrides: {},
        pendingUpdates: ['ai-enhancement-failed']
      }
    };
  }

  private generateProvenance(heroData: HeroProjectData, originalData: UnifiedProjectData): Record<string, ContentProvenance> {
    const provenance: Record<string, ContentProvenance> = {};

    // Mark sections as user-created vs AI-generated
    provenance.title = { source: 'user', confidence: 1, lastUpdated: new Date() };
    provenance.hero = { source: 'ai-enhanced', confidence: 0.8, lastUpdated: new Date() };
    provenance.journey = { source: 'ai-generated', confidence: 0.6, lastUpdated: new Date() };

    return provenance;
  }

  // AI Enhancement methods (will be implemented with specific AI calls)
  private enhanceCoreStructure(hero: HeroProjectData, original: UnifiedProjectData): HeroProjectData {
    // Enhance core structure based on wizard/chat data
    return hero;
  }

  private async alignWithStandards(hero: HeroProjectData, original: UnifiedProjectData, context: TransformationContext): Promise<HeroProjectData> {
    // AI-powered standards alignment will be implemented here
    return hero;
  }

  private async createAssessmentFramework(hero: HeroProjectData, original: UnifiedProjectData, context: TransformationContext): Promise<HeroProjectData> {
    // AI-powered assessment creation will be implemented here
    return hero;
  }

  private async enhanceLearningActivities(hero: HeroProjectData, original: UnifiedProjectData, context: TransformationContext): Promise<HeroProjectData> {
    // AI-powered activity enhancement will be implemented here
    return hero;
  }

  private async addDifferentiation(hero: HeroProjectData, original: UnifiedProjectData, context: TransformationContext): Promise<HeroProjectData> {
    // AI-powered differentiation strategies will be implemented here
    return hero;
  }

  private async createImplementationGuide(hero: HeroProjectData, original: UnifiedProjectData, context: TransformationContext): Promise<HeroProjectData> {
    // AI-powered implementation guide creation will be implemented here
    return hero;
  }
}

// Export singleton instance
export const heroProjectTransformer = HeroProjectTransformer.getInstance();
