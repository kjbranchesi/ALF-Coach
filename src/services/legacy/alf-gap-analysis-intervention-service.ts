/**
 * ALF Gap Analysis and Intervention Service
 * 
 * Provides comprehensive gap analysis and intervention recommendations that maintain
 * ALF's authentic assessment principles while ensuring standards coverage and mastery.
 * 
 * Key Features:
 * - Multi-dimensional gap analysis (content, skills, progression levels)
 * - Authentic intervention recommendations aligned with ALF principles
 * - Proactive identification of at-risk students
 * - Community-based intervention strategies
 * - Portfolio-driven remediation approaches
 * - Transfer-focused intervention design
 */

import { 
  ALFProject, 
  ALFCompetencyEvidence, 
  StandardAlignment, 
  ALFProgressionLevel,
  PortfolioEvidence,
  CommunityValidator,
  ALFStandardsReport
} from './types';

// Gap Analysis Interfaces
export interface StandardsGap {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  gapType: GapType;
  gapSeverity: GapSeverity;
  currentLevel: ALFProgressionLevel | null;
  expectedLevel: ALFProgressionLevel;
  lastAssessmentDate?: Date;
  evidenceGaps: EvidenceGap[];
  timeToExpectedMastery: number; // days
  priority: GapPriority;
  relatedStandards: string[];
}

export interface EvidenceGap {
  evidenceType: EvidenceType;
  gapDescription: string;
  minimumRequired: number;
  currentCount: number;
  qualityThreshold: QualityThreshold;
  currentQualityLevel: QualityLevel;
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  skillCategory: SkillCategory;
  prerequisiteSkills: string[];
  currentMastery: number; // 0-100
  expectedMastery: number;
  gapSize: number;
  transferOpportunities: TransferOpportunity[];
  communityConnections: CommunityConnection[];
}

export interface ProgressionGap {
  currentProgression: ALFProgressionLevel;
  targetProgression: ALFProgressionLevel;
  progressionBarriers: ProgressionBarrier[];
  timelineGap: number; // weeks behind expected
  spiralLearningOpportunities: SpiralOpportunity[];
  authenticContexts: AuthenticContext[];
}

// Intervention Interfaces
export interface ALFIntervention {
  interventionId: string;
  interventionType: InterventionType;
  targetGaps: StandardsGap[];
  interventionStrategy: InterventionStrategy;
  authenticApproach: AuthenticApproach;
  communityIntegration: CommunityIntegration;
  portfolioAlignment: PortfolioAlignment;
  timeline: InterventionTimeline;
  successMetrics: SuccessMetric[];
  resources: InterventionResource[];
  studentChoice: StudentChoiceOptions;
  transferFocus: TransferFocus;
}

export interface InterventionRecommendation {
  recommendationId: string;
  studentId: string;
  priorityLevel: InterventionPriority;
  urgencyScore: number; // 1-10
  interventions: ALFIntervention[];
  rationale: string;
  expectedOutcomes: ExpectedOutcome[];
  alternativeApproaches: AlternativeApproach[];
  parentCommunication: ParentCommunicationPlan;
  teacherSupport: TeacherSupportPlan;
  communityInvolvement: CommunityInvolvementPlan;
  monitoringPlan: MonitoringPlan;
}

export interface InterventionPlan {
  planId: string;
  studentId: string;
  createdDate: Date;
  targetCompletionDate: Date;
  gapsAddressed: StandardsGap[];
  interventions: ALFIntervention[];
  milestones: InterventionMilestone[];
  progressTracking: ProgressTracking;
  adaptationTriggers: AdaptationTrigger[];
  celebrationMoments: CelebrationMoment[];
  reflectionPrompts: ReflectionPrompt[];
}

// Supporting Types
export type GapType = 
  | 'content_knowledge'
  | 'skill_application'
  | 'progression_level'
  | 'evidence_quality'
  | 'evidence_quantity'
  | 'transfer_demonstration'
  | 'community_validation'
  | 'authentic_context';

export type GapSeverity = 'minor' | 'moderate' | 'significant' | 'critical';
export type GapPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EvidenceType = 
  | 'project_artifact'
  | 'reflection_journal'
  | 'peer_feedback'
  | 'community_validation'
  | 'self_assessment'
  | 'performance_task'
  | 'transfer_demonstration'
  | 'authentic_application';

export type QualityThreshold = 'minimal' | 'developing' | 'proficient' | 'advanced';
export type QualityLevel = 'below_threshold' | 'approaching' | 'meeting' | 'exceeding';

export type SkillCategory = 
  | 'foundational'
  | 'application'
  | 'analysis'
  | 'synthesis'
  | 'evaluation'
  | 'transfer'
  | 'collaboration'
  | 'communication';

export interface TransferOpportunity {
  contextId: string;
  contextDescription: string;
  transferType: TransferType;
  communityConnection: boolean;
  authenticApplication: boolean;
  studentChoice: boolean;
}

export interface CommunityConnection {
  validatorId: string;
  connectionType: ConnectionType;
  expertise: string;
  availability: string;
  mentorshipPotential: boolean;
}

export interface ProgressionBarrier {
  barrierId: string;
  barrierType: BarrierType;
  description: string;
  removalStrategy: string;
  supportNeeded: string[];
  timeframe: string;
}

export interface SpiralOpportunity {
  opportunityId: string;
  previousContext: string;
  newContext: string;
  complexityIncrease: ComplexityLevel;
  authenticConnection: boolean;
  studentInterest: boolean;
}

export interface AuthenticContext {
  contextId: string;
  contextName: string;
  realWorldConnection: string;
  communityPartner?: string;
  studentChoice: boolean;
  projectPotential: boolean;
}

export type InterventionType = 
  | 'project_based'
  | 'community_mentorship'
  | 'peer_collaboration'
  | 'authentic_assessment'
  | 'portfolio_development'
  | 'transfer_focused'
  | 'reflection_intensive'
  | 'choice_expansion';

export interface InterventionStrategy {
  strategyName: string;
  alfPrinciples: ALFPrinciple[];
  methodDescription: string;
  expectedDuration: string;
  intensityLevel: IntensityLevel;
  groupSize: GroupSize;
  settingType: SettingType;
}

export interface AuthenticApproach {
  realWorldContext: string;
  communityPartner?: string;
  authenticAudience: string;
  genuinePurpose: string;
  studentOwnership: number; // percentage
  choiceOptions: string[];
}

export interface CommunityIntegration {
  validators: CommunityValidator[];
  mentors: CommunityMentor[];
  experienceProviders: ExperienceProvider[];
  celebrationCommunity: string[];
  feedbackLoop: string;
}

export interface PortfolioAlignment {
  portfolioSection: string;
  evidenceType: EvidenceType[];
  qualityStandards: QualityStandard[];
  reflectionPrompts: string[];
  growthDocumentation: string;
}

export interface InterventionTimeline {
  phases: InterventionPhase[];
  checkpoints: Checkpoint[];
  flexibilityPoints: FlexibilityPoint[];
  celebrationMoments: string[];
  adaptationOpportunities: string[];
}

export interface SuccessMetric {
  metricName: string;
  measurementMethod: string;
  targetValue: string;
  timeframe: string;
  evidenceType: EvidenceType;
  alfAlignment: ALFPrinciple;
}

export interface InterventionResource {
  resourceType: ResourceType;
  resourceName: string;
  description: string;
  accessMethod: string;
  cost: number;
  communitySource: boolean;
}

export interface StudentChoiceOptions {
  projectTopics: string[];
  learningMethods: string[];
  demonstrationFormats: string[];
  timelineFlexibility: string;
  partnershipOptions: string[];
  locationOptions: string[];
}

export interface TransferFocus {
  transferTargets: TransferTarget[];
  bridgingActivities: string[];
  metacognitionSupport: string[];
  applicationContexts: string[];
  reflectionFramework: string;
}

export type InterventionPriority = 'immediate' | 'urgent' | 'high' | 'medium' | 'low';

export interface ExpectedOutcome {
  outcomeDescription: string;
  timeframe: string;
  measurementMethod: string;
  successIndicators: string[];
  transferEvidence: string;
}

export interface AlternativeApproach {
  approachName: string;
  description: string;
  whenToUse: string;
  alfAlignment: ALFPrinciple[];
  resources: string[];
}

export interface ParentCommunicationPlan {
  communicationFrequency: string;
  communicationMethods: string[];
  involvementOpportunities: string[];
  homeSupport: string[];
  celebrationPlans: string[];
}

export interface TeacherSupportPlan {
  professionalDevelopment: string[];
  resources: string[];
  collaborationTime: string;
  mentorSupport: string;
  reflectionProtocol: string;
}

export interface CommunityInvolvementPlan {
  partnerRecruitment: string;
  validatorTraining: string;
  mentorshipProgram: string;
  experienceOpportunities: string[];
  celebrationEvents: string[];
}

export interface MonitoringPlan {
  dataCollection: string[];
  progressCheckpoints: string[];
  adaptationTriggers: string[];
  successCelebration: string[];
  documentationMethod: string;
}

export interface InterventionMilestone {
  milestoneId: string;
  description: string;
  targetDate: Date;
  successCriteria: string[];
  celebrationPlan: string;
  documentationNeeds: string[];
}

export interface ProgressTracking {
  trackingMethod: string;
  dataPoints: string[];
  frequency: string;
  responsibleParties: string[];
  reportingFormat: string;
}

export interface AdaptationTrigger {
  triggerId: string;
  condition: string;
  adaptationOptions: string[];
  decisionMakers: string[];
  timeline: string;
}

export interface CelebrationMoment {
  momentId: string;
  trigger: string;
  celebrationType: string;
  community: string[];
  documentation: string;
}

export interface ReflectionPrompt {
  promptId: string;
  prompt: string;
  timing: string;
  audience: string[];
  documentationMethod: string;
}

// Additional Supporting Types
export type TransferType = 'near' | 'far' | 'creative' | 'adaptive';
export type ConnectionType = 'mentor' | 'validator' | 'experience_provider' | 'audience';
export type BarrierType = 'academic' | 'social' | 'emotional' | 'resource' | 'systemic';
export type ComplexityLevel = 'slight' | 'moderate' | 'significant' | 'transformational';
export type ALFPrinciple = 'authentic' | 'student_centered' | 'community_connected' | 'transfer_focused' | 'growth_oriented';
export type IntensityLevel = 'light' | 'moderate' | 'intensive' | 'immersive';
export type GroupSize = 'individual' | 'pair' | 'small_group' | 'class' | 'multi_class';
export type SettingType = 'classroom' | 'community' | 'home' | 'virtual' | 'hybrid';
export type ResourceType = 'material' | 'human' | 'digital' | 'experiential' | 'financial';
export type TransferTarget = 'academic' | 'personal' | 'professional' | 'civic' | 'creative';

export interface CommunityMentor {
  mentorId: string;
  name: string;
  expertise: string[];
  availability: string;
  mentorshipStyle: string;
  successStories: string[];
}

export interface ExperienceProvider {
  providerId: string;
  organizationName: string;
  experienceTypes: string[];
  ageAppropriate: boolean;
  accessRequirements: string[];
}

export interface QualityStandard {
  standardName: string;
  description: string;
  rubricLevel: number;
  exemplars: string[];
}

export interface InterventionPhase {
  phaseId: string;
  phaseName: string;
  duration: string;
  objectives: string[];
  activities: string[];
  outcomes: string[];
}

export interface Checkpoint {
  checkpointId: string;
  date: Date;
  purpose: string;
  dataNeeded: string[];
  adaptationOptions: string[];
}

export interface FlexibilityPoint {
  pointId: string;
  description: string;
  options: string[];
  decisionCriteria: string[];
}

// Main Service Class
export class ALFGapAnalysisInterventionService {
  private standardsAlignmentEngine: any;
  private learningProgressionService: any;
  private competencyTrackingService: any;
  private portfolioMapper: any;
  private communityValidationService: any;

  constructor(
    standardsAlignmentEngine: any,
    learningProgressionService: any,
    competencyTrackingService: any,
    portfolioMapper: any,
    communityValidationService: any
  ) {
    this.standardsAlignmentEngine = standardsAlignmentEngine;
    this.learningProgressionService = learningProgressionService;
    this.competencyTrackingService = competencyTrackingService;
    this.portfolioMapper = portfolioMapper;
    this.communityValidationService = communityValidationService;
  }

  /**
   * Conducts comprehensive gap analysis for a student
   */
  async conductGapAnalysis(
    studentId: string,
    analysisScope: AnalysisScope = 'comprehensive',
    timeframe: Timeframe = 'current_year'
  ): Promise<GapAnalysisResult> {
    const standardsGaps = await this.analyzeStandardsGaps(studentId, timeframe);
    const skillGaps = await this.analyzeSkillGaps(studentId, analysisScope);
    const progressionGaps = await this.analyzeProgressionGaps(studentId);
    const portfolioGaps = await this.analyzePortfolioGaps(studentId);
    
    const prioritizedGaps = this.prioritizeGaps([
      ...standardsGaps,
      ...skillGaps,
      ...progressionGaps,
      ...portfolioGaps
    ]);

    const riskAssessment = await this.assessStudentRisk(studentId, prioritizedGaps);
    const urgencyScore = this.calculateUrgencyScore(prioritizedGaps, riskAssessment);

    return {
      analysisId: `gap_analysis_${studentId}_${Date.now()}`,
      studentId,
      analysisDate: new Date(),
      analysisScope,
      timeframe,
      standardsGaps,
      skillGaps,
      progressionGaps,
      portfolioGaps,
      prioritizedGaps,
      riskAssessment,
      urgencyScore,
      keyInsights: this.generateGapInsights(prioritizedGaps),
      recommendedActions: await this.generateQuickActions(prioritizedGaps)
    };
  }

  /**
   * Generates comprehensive intervention recommendations
   */
  async generateInterventionRecommendations(
    studentId: string,
    gapAnalysis: GapAnalysisResult,
    interventionContext: InterventionContext = {}
  ): Promise<InterventionRecommendation[]> {
    const recommendations: InterventionRecommendation[] = [];

    // Group gaps by intervention approach
    const interventionGroups = this.groupGapsByInterventionType(gapAnalysis.prioritizedGaps);

    for (const [interventionType, gaps] of interventionGroups) {
      const intervention = await this.designIntervention(
        studentId,
        interventionType,
        gaps,
        interventionContext
      );

      const recommendation = await this.createRecommendation(
        studentId,
        intervention,
        gaps,
        interventionContext
      );

      recommendations.push(recommendation);
    }

    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Creates a comprehensive intervention plan
   */
  async createInterventionPlan(
    studentId: string,
    selectedRecommendations: InterventionRecommendation[],
    planningContext: PlanningContext = {}
  ): Promise<InterventionPlan> {
    const allGaps = selectedRecommendations.flatMap(rec => rec.interventions.flatMap(int => int.targetGaps));
    const allInterventions = selectedRecommendations.flatMap(rec => rec.interventions);

    const timeline = this.createInterventionTimeline(allInterventions, planningContext);
    const milestones = this.generateMilestones(allInterventions, timeline);
    const progressTracking = this.designProgressTracking(allInterventions);

    return {
      planId: `intervention_plan_${studentId}_${Date.now()}`,
      studentId,
      createdDate: new Date(),
      targetCompletionDate: this.calculateCompletionDate(timeline),
      gapsAddressed: allGaps,
      interventions: allInterventions,
      milestones,
      progressTracking,
      adaptationTriggers: this.identifyAdaptationTriggers(allInterventions),
      celebrationMoments: this.planCelebrationMoments(milestones),
      reflectionPrompts: this.generateReflectionPrompts(allInterventions)
    };
  }

  /**
   * Monitors intervention progress and recommends adaptations
   */
  async monitorInterventionProgress(
    planId: string,
    currentData: ProgressData
  ): Promise<InterventionProgressReport> {
    const plan = await this.getInterventionPlan(planId);
    const progressAnalysis = this.analyzeProgress(plan, currentData);
    const adaptationNeeds = this.identifyAdaptationNeeds(progressAnalysis);
    const celebrationOpportunities = this.identifyCelebrationOpportunities(progressAnalysis);

    return {
      reportId: `progress_report_${planId}_${Date.now()}`,
      planId,
      reportDate: new Date(),
      overallProgress: progressAnalysis.overallProgress,
      interventionProgress: progressAnalysis.interventionProgress,
      milestoneStatus: progressAnalysis.milestoneStatus,
      gapClosure: progressAnalysis.gapClosure,
      adaptationNeeds,
      celebrationOpportunities,
      nextSteps: this.generateNextSteps(progressAnalysis, adaptationNeeds),
      parentUpdate: this.generateParentUpdate(progressAnalysis),
      teacherGuidance: this.generateTeacherGuidance(progressAnalysis)
    };
  }

  // Private Helper Methods

  private async analyzeStandardsGaps(studentId: string, timeframe: Timeframe): Promise<StandardsGap[]> {
    const currentEvidence = await this.portfolioMapper.getStudentEvidence(studentId, timeframe);
    const expectedStandards = await this.standardsAlignmentEngine.getExpectedStandards(studentId, timeframe);
    const gaps: StandardsGap[] = [];

    for (const standard of expectedStandards) {
      const evidence = currentEvidence.filter(e => e.standardAlignments.some(sa => sa.standardId === standard.id));
      const gap = this.assessStandardGap(standard, evidence);
      if (gap) {
        gaps.push(gap);
      }
    }

    return gaps;
  }

  private async analyzeSkillGaps(studentId: string, scope: AnalysisScope): Promise<SkillGap[]> {
    const currentSkills = await this.competencyTrackingService.getStudentSkills(studentId);
    const expectedSkills = await this.competencyTrackingService.getExpectedSkills(studentId, scope);
    const gaps: SkillGap[] = [];

    for (const expectedSkill of expectedSkills) {
      const currentSkill = currentSkills.find(s => s.skillId === expectedSkill.skillId);
      const gap = this.assessSkillGap(expectedSkill, currentSkill);
      if (gap) {
        gaps.push(gap);
      }
    }

    return gaps;
  }

  private async analyzeProgressionGaps(studentId: string): Promise<ProgressionGap[]> {
    const currentProgression = await this.learningProgressionService.getCurrentProgression(studentId);
    const expectedProgression = await this.learningProgressionService.getExpectedProgression(studentId);
    
    if (currentProgression.level !== expectedProgression.level) {
      return [{
        currentProgression: currentProgression.level,
        targetProgression: expectedProgression.level,
        progressionBarriers: await this.identifyProgressionBarriers(studentId, currentProgression, expectedProgression),
        timelineGap: this.calculateTimelineGap(currentProgression, expectedProgression),
        spiralLearningOpportunities: await this.findSpiralOpportunities(studentId, currentProgression),
        authenticContexts: await this.findAuthenticContexts(studentId, expectedProgression)
      }];
    }

    return [];
  }

  private async analyzePortfolioGaps(studentId: string): Promise<StandardsGap[]> {
    const portfolioMapping = await this.portfolioMapper.getPortfolioStandardsMapping(studentId);
    return portfolioMapping.gaps || [];
  }

  private prioritizeGaps(gaps: any[]): any[] {
    return gaps.sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const severityWeight = { critical: 4, significant: 3, moderate: 2, minor: 1 };
      
      const aScore = (priorityWeight[a.priority] || 0) + (severityWeight[a.gapSeverity] || 0);
      const bScore = (priorityWeight[b.priority] || 0) + (severityWeight[b.gapSeverity] || 0);
      
      return bScore - aScore;
    });
  }

  private async assessStudentRisk(studentId: string, gaps: any[]): Promise<RiskAssessment> {
    const criticalGaps = gaps.filter(g => g.gapSeverity === 'critical').length;
    const urgentGaps = gaps.filter(g => g.priority === 'urgent').length;
    const timelineRisk = this.assessTimelineRisk(gaps);
    const transferRisk = this.assessTransferRisk(gaps);

    return {
      overallRisk: this.calculateOverallRisk(criticalGaps, urgentGaps, timelineRisk, transferRisk),
      criticalGapCount: criticalGaps,
      urgentGapCount: urgentGaps,
      timelineRisk,
      transferRisk,
      interventionUrgency: this.determineInterventionUrgency(criticalGaps, urgentGaps, timelineRisk)
    };
  }

  private calculateUrgencyScore(gaps: any[], riskAssessment: RiskAssessment): number {
    let score = 0;
    score += riskAssessment.criticalGapCount * 3;
    score += riskAssessment.urgentGapCount * 2;
    score += riskAssessment.timelineRisk * 2;
    score += riskAssessment.transferRisk * 1.5;
    return Math.min(score, 10);
  }

  private generateGapInsights(gaps: any[]): string[] {
    const insights: string[] = [];
    
    if (gaps.some(g => g.gapType === 'transfer_demonstration')) {
      insights.push("Student shows understanding but needs support applying knowledge in new contexts");
    }
    
    if (gaps.some(g => g.gapType === 'community_validation')) {
      insights.push("Authentic audience experiences could strengthen standards demonstration");
    }
    
    if (gaps.some(g => g.gapType === 'evidence_quality')) {
      insights.push("Focus on deeper reflection and documentation of learning process");
    }

    return insights;
  }

  private async generateQuickActions(gaps: any[]): Promise<string[]> {
    const actions: string[] = [];
    
    const urgentGaps = gaps.filter(g => g.priority === 'urgent');
    if (urgentGaps.length > 0) {
      actions.push("Schedule immediate conference with student to understand barriers");
      actions.push("Review portfolio for existing evidence that could address gaps");
    }

    return actions;
  }

  private groupGapsByInterventionType(gaps: any[]): Map<InterventionType, any[]> {
    const groups = new Map<InterventionType, any[]>();
    
    gaps.forEach(gap => {
      let interventionType: InterventionType;
      
      if (gap.gapType === 'community_validation') {
        interventionType = 'community_mentorship';
      } else if (gap.gapType === 'transfer_demonstration') {
        interventionType = 'transfer_focused';
      } else if (gap.gapType === 'evidence_quality') {
        interventionType = 'portfolio_development';
      } else if (gap.gapType === 'authentic_context') {
        interventionType = 'project_based';
      } else {
        interventionType = 'authentic_assessment';
      }

      if (!groups.has(interventionType)) {
        groups.set(interventionType, []);
      }
      groups.get(interventionType)!.push(gap);
    });

    return groups;
  }

  private async designIntervention(
    studentId: string,
    interventionType: InterventionType,
    gaps: any[],
    context: InterventionContext
  ): Promise<ALFIntervention> {
    const strategy = this.selectInterventionStrategy(interventionType, gaps, context);
    const authenticApproach = await this.designAuthenticApproach(studentId, gaps, context);
    const communityIntegration = await this.planCommunityIntegration(studentId, interventionType);
    const portfolioAlignment = this.designPortfolioAlignment(gaps);
    const timeline = this.createInterventionTimeline([{ interventionType, gaps }], context);

    return {
      interventionId: `intervention_${interventionType}_${Date.now()}`,
      interventionType,
      targetGaps: gaps,
      interventionStrategy: strategy,
      authenticApproach,
      communityIntegration,
      portfolioAlignment,
      timeline,
      successMetrics: this.defineSuccessMetrics(gaps, interventionType),
      resources: await this.identifyResources(interventionType, gaps),
      studentChoice: this.designStudentChoices(interventionType, gaps),
      transferFocus: this.designTransferFocus(gaps)
    };
  }

  // Additional helper methods would continue here...
  // This is a comprehensive service with many more private methods needed
  // for full implementation. The structure shown provides the main interfaces
  // and core functionality.

  private assessStandardGap(standard: any, evidence: any[]): StandardsGap | null {
    // Implementation for assessing individual standard gaps
    return null;
  }

  private assessSkillGap(expectedSkill: any, currentSkill: any): SkillGap | null {
    // Implementation for assessing skill gaps
    return null;
  }

  // ... many more private helper methods would be implemented here
}

// Supporting interfaces for service functionality
export interface AnalysisScope {
  scope: 'focused' | 'standard' | 'comprehensive';
}

export interface Timeframe {
  period: 'current_quarter' | 'current_semester' | 'current_year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface GapAnalysisResult {
  analysisId: string;
  studentId: string;
  analysisDate: Date;
  analysisScope: any;
  timeframe: any;
  standardsGaps: StandardsGap[];
  skillGaps: SkillGap[];
  progressionGaps: ProgressionGap[];
  portfolioGaps: StandardsGap[];
  prioritizedGaps: any[];
  riskAssessment: RiskAssessment;
  urgencyScore: number;
  keyInsights: string[];
  recommendedActions: string[];
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  criticalGapCount: number;
  urgentGapCount: number;
  timelineRisk: number;
  transferRisk: number;
  interventionUrgency: UrgencyLevel;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type UrgencyLevel = 'routine' | 'prompt' | 'urgent' | 'immediate';

export interface InterventionContext {
  availableTime?: string;
  resources?: string[];
  constraints?: string[];
  preferences?: string[];
  communityConnections?: CommunityValidator[];
}

export interface PlanningContext {
  startDate?: Date;
  endDate?: Date;
  intensity?: IntensityLevel;
  grouping?: GroupSize;
  setting?: SettingType;
}

export interface ProgressData {
  dataPoints: any[];
  evidenceSubmitted: PortfolioEvidence[];
  milestoneUpdates: any[];
  studentReflections: any[];
  communityFeedback: any[];
}

export interface InterventionProgressReport {
  reportId: string;
  planId: string;
  reportDate: Date;
  overallProgress: ProgressSummary;
  interventionProgress: InterventionProgressDetail[];
  milestoneStatus: MilestoneStatus[];
  gapClosure: GapClosureReport[];
  adaptationNeeds: AdaptationNeed[];
  celebrationOpportunities: CelebrationOpportunity[];
  nextSteps: NextStep[];
  parentUpdate: ParentUpdate;
  teacherGuidance: TeacherGuidance;
}

export interface ProgressSummary {
  percentComplete: number;
  timeline: string;
  momentum: MomentumIndicator;
  keyAchievements: string[];
  emergingStrengths: string[];
}

export interface InterventionProgressDetail {
  interventionId: string;
  progress: number;
  effectiveness: EffectivenessRating;
  adaptationsNeeded: string[];
  studentEngagement: EngagementLevel;
}

export interface MilestoneStatus {
  milestoneId: string;
  status: MilestoneStatusType;
  completionDate?: Date;
  evidence: string[];
  celebration: string;
}

export interface GapClosureReport {
  gapId: string;
  closureProgress: number;
  evidenceOfProgress: string[];
  remainingChallenges: string[];
  nextActions: string[];
}

export interface AdaptationNeed {
  needId: string;
  description: string;
  urgency: UrgencyLevel;
  adaptationOptions: string[];
  stakeholdersInvolved: string[];
}

export interface CelebrationOpportunity {
  opportunityId: string;
  achievement: string;
  celebrationType: string;
  audience: string[];
  timing: string;
}

export interface NextStep {
  stepId: string;
  description: string;
  responsibility: string;
  timeline: string;
  dependencies: string[];
}

export interface ParentUpdate {
  summary: string;
  achievements: string[];
  areas_of_growth: string[];
  how_to_support: string[];
  celebration_ideas: string[];
}

export interface TeacherGuidance {
  instructional_focus: string[];
  assessment_recommendations: string[];
  intervention_adjustments: string[];
  professional_learning: string[];
  collaboration_needs: string[];
}

export type MomentumIndicator = 'accelerating' | 'steady' | 'slowing' | 'stalled';
export type EffectivenessRating = 'highly_effective' | 'effective' | 'somewhat_effective' | 'not_effective';
export type EngagementLevel = 'high' | 'moderate' | 'low' | 'concerning';
export type MilestoneStatusType = 'completed' | 'on_track' | 'at_risk' | 'missed';