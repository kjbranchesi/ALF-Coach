/**
 * ALF Curriculum Mapping Implementation
 * Implements key methods for the ALF Curriculum Mapping Service
 */

import {
  ALFProject,
  ALFProjectMapping,
  ALFStandardsCoverageAnalysis,
  ALFSpiralMapping,
  ALFCurriculumGap,
  ALFPortfolioAlignment,
  ALFCommunityMapping,
  ALFChoicePathwayMap,
  ALFFlexibilityMetrics,
  CurriculumTimeframe,
  StandardAlignment,
  SpiralDepth,
  ProjectTiming,
  ProjectAssessmentStrategy,
  ProjectPrerequisite,
  ProjectOutcome,
  FrameworkCoverage,
  CoverageDepthAnalysis,
  ChoiceFlexibilityAnalysis,
  SpiralProgressionAnalysis,
  StudentAgencyMetrics,
  TeacherAdaptabilityMetrics
} from './alf-curriculum-mapping-service';
import { ALFStandardsAlignmentEngine } from './alf-standards-alignment-engine';
import { logger } from '../utils/logger';

/**
 * Calculate project timing within curriculum timeframe
 */
export async function calculateProjectTiming(
  project: ALFProject,
  timeframe: CurriculumTimeframe,
  sequenceIndex: number
): Promise<ProjectTiming> {
  const totalWeeks = Math.floor(
    (timeframe.endDate.getTime() - timeframe.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  const averageProjectDuration = Math.floor(totalWeeks / 4); // Assume 4 major projects per timeframe
  const bufferWeeks = 2; // Flexibility buffer between projects
  
  const proposedStartWeek = sequenceIndex * (averageProjectDuration + bufferWeeks) + 1;
  
  // Extract duration from project metadata
  const estimatedDuration = parseProjectDuration(project.metadata.duration) || averageProjectDuration;
  
  // Calculate iteration time (20% of project duration)
  const iterationWeeks = Math.ceil(estimatedDuration * 0.2);
  
  // Map choice points to timeline
  const choicePoints = extractChoicePointTimings(project, estimatedDuration);
  
  return {
    proposedStartWeek,
    estimatedDuration,
    flexibilityWindow: bufferWeeks,
    readinessBasedStart: true, // ALF principle: start when students are ready
    iterationWeeks,
    choicePoints
  };
}

/**
 * Analyze spiral standards progression
 */
export async function analyzeSpiralStandards(
  project: ALFProject,
  previousMappings: ALFProjectMapping[]
): Promise<any[]> {
  const spiralMappings: any[] = [];
  const projectStandards = await extractProjectStandards(project);
  
  for (const standard of projectStandards) {
    // Find previous encounters with this standard
    const previousEncounters = findPreviousStandardEncounters(standard, previousMappings);
    
    // Determine current depth based on project complexity and previous exposure
    const currentDepth = determineCurrentDepth(standard, project, previousEncounters);
    
    // Project next encounter (placeholder for now)
    const nextEncounter = null;
    
    spiralMappings.push({
      standard,
      previousEncounter: previousEncounters[previousEncounters.length - 1] || null,
      currentDepth,
      nextEncounter,
      progressionNotes: generateProgressionNotes(standard, currentDepth, previousEncounters)
    });
  }
  
  return spiralMappings;
}

/**
 * Define assessment strategy for project
 */
export async function defineAssessmentStrategy(
  project: ALFProject
): Promise<ProjectAssessmentStrategy> {
  // Determine assessment type based on deliverables stage
  const assessmentType = determineAssessmentType(project.deliverables);
  
  // Create formative checkpoints throughout journey
  const formativeCheckpoints = project.journey.phases.map((phase, index) => ({
    week: index * 2 + 1, // Bi-weekly checkpoints
    purpose: `Progress check for ${phase.name}`,
    method: 'Peer feedback and self-reflection',
    standardsChecked: phase.standardsAddressed || [],
    feedbackType: index % 2 === 0 ? 'peer' : 'self' as any,
    adjustmentOpportunity: true
  }));
  
  // Define summative evidence from deliverables
  const summativeEvidence = project.deliverables.portfolio.map(element => ({
    type: element.type as any,
    standardsEvidence: element.standardsEvidence,
    authenticityLevel: 0.9, // High authenticity for portfolio elements
    choiceInFormat: element.studentChoice,
    realWorldAudience: element.type === 'community_feedback'
  }));
  
  return {
    type: assessmentType,
    formativeCheckpoints,
    summativeEvidence,
    selfAssessmentIntegrated: true,
    peerFeedbackIncluded: true,
    communityFeedbackSought: project.deliverables.impactPlan !== null,
    iterationSupported: true,
    standardsDocumentation: {
      approach: 'portfolio_tagging',
      visibleToStudents: true,
      studentSelfDocumentation: true,
      parentAccessible: true,
      administrativeReporting: true
    }
  };
}

/**
 * Analyze standards coverage across all project mappings
 */
export async function analyzeCoverageDemocracy(
  mappings: ALFProjectMapping[],
  targetStandards?: StandardAlignment[]
): Promise<ALFStandardsCoverageAnalysis> {
  const allStandards = extractAllStandards(mappings);
  const target = targetStandards || allStandards;
  
  // Count covered standards
  const coveredStandards = new Set<string>();
  const frameworkBreakdown = new Map<string, FrameworkCoverage>();
  
  // Track depth of coverage
  const depthTracking = new Map<string, SpiralDepth>();
  
  for (const mapping of mappings) {
    const projectStandards = [
      ...mapping.primaryStandards,
      ...mapping.secondaryStandards
    ];
    
    for (const standard of projectStandards) {
      const key = `${standard.framework}-${standard.code}`;
      coveredStandards.add(key);
      
      // Track by framework
      if (!frameworkBreakdown.has(standard.framework)) {
        frameworkBreakdown.set(standard.framework, {
          framework: standard.framework as any,
          totalStandards: 0,
          covered: 0,
          percentage: 0,
          priorityStandards: []
        });
      }
      
      // Track depth progression
      const currentDepth = determineStandardDepth(standard, mapping);
      const existingDepth = depthTracking.get(key);
      if (!existingDepth || isDeeper(currentDepth, existingDepth)) {
        depthTracking.set(key, currentDepth);
      }
    }
  }
  
  // Calculate coverage metrics
  const totalTargeted = target.length;
  const totalCovered = coveredStandards.size;
  const coveragePercentage = totalTargeted > 0 ? (totalCovered / totalTargeted) * 100 : 0;
  
  // Analyze depth distribution
  const depthAnalysis = analyzeDepthDistribution(depthTracking);
  
  // Analyze choice flexibility
  const choiceFlexibility = analyzeChoiceFlexibility(mappings);
  
  // Analyze spiral progression
  const spiralProgression = analyzeSpiralProgression(mappings);
  
  // Identify gaps
  const gaps = identifyStandardsGaps(target, coveredStandards);
  
  // Identify strengths
  const strengths = identifyCoverageStrengths(mappings, depthTracking);
  
  return {
    totalStandardsTargeted: totalTargeted,
    standardsCovered: totalCovered,
    coveragePercentage,
    frameworkBreakdown: Array.from(frameworkBreakdown.values()),
    depthAnalysis,
    choiceFlexibility,
    spiralProgression,
    gaps,
    strengths
  };
}

/**
 * Build spiral progression mappings
 */
export async function buildSpiralMappings(
  projectMappings: ALFProjectMapping[]
): Promise<ALFSpiralMapping[]> {
  const spiralMappings: ALFSpiralMapping[] = [];
  const standardProgressionMap = new Map<string, any[]>();
  
  // Track each standard's progression through projects
  for (let i = 0; i < projectMappings.length; i++) {
    const mapping = projectMappings[i];
    
    for (const spiralStandard of mapping.spiralStandards) {
      const key = `${spiralStandard.standard.framework}-${spiralStandard.standard.code}`;
      
      if (!standardProgressionMap.has(key)) {
        standardProgressionMap.set(key, []);
      }
      
      standardProgressionMap.get(key)!.push({
        projectIndex: i,
        project: mapping.project,
        depth: spiralStandard.currentDepth,
        context: mapping.project.metadata.title
      });
    }
  }
  
  // Create spiral mappings from progression data
  for (const [standardKey, progressions] of standardProgressionMap) {
    if (progressions.length > 1) { // Only include standards that spiral
      const standard = progressions[0].project.standardsAlignment.primaryStandards
        .find((s: any) => `${s.framework}-${s.code}` === standardKey);
      
      if (standard) {
        spiralMappings.push({
          standard,
          encounters: progressions.map((p, index) => ({
            projectId: p.project.id,
            projectTitle: p.project.metadata.title,
            encounterNumber: index + 1,
            depth: p.depth,
            context: p.context,
            authenticity: calculateAuthenticityScore(p.project),
            choiceImpact: calculateChoiceImpact(p.project)
          })),
          overallProgression: calculateOverallProgression(progressions),
          authenticityProgression: calculateAuthenticityProgression(progressions),
          studentOwnership: calculateOwnershipProgression(progressions),
          realWorldApplication: extractRealWorldApplications(progressions)
        });
      }
    }
  }
  
  return spiralMappings;
}

/**
 * Create portfolio alignment strategy
 */
export async function createPortfolioAlignment(
  projectMappings: ALFProjectMapping[]
): Promise<ALFPortfolioAlignment[]> {
  const portfolioAlignments: ALFPortfolioAlignment[] = [];
  
  for (const mapping of projectMappings) {
    const project = mapping.project;
    
    // Extract portfolio elements from project
    const portfolioElements = project.deliverables.portfolio;
    
    for (const element of portfolioElements) {
      portfolioAlignments.push({
        portfolioType: determinePortfolioType(element),
        description: element.description,
        projects: [project.id],
        standardsEvidence: element.standardsEvidence,
        artifactTypes: [element.type],
        assessmentIntegration: {
          formative: element.type === 'iteration_documentation',
          summative: element.type === 'work_sample' || element.type === 'reflection',
          self: true,
          peer: element.type === 'peer_feedback',
          community: element.type === 'community_feedback'
        },
        reflectionRequirements: generateReflectionRequirements(element),
        sharingPermissions: generateSharingPermissions(element),
        standardsDocumentation: {
          method: 'reflection',
          studentVisible: true,
          studentParticipation: true,
          progressTracking: true,
          growthDocumentation: true
        },
        studentOwnership: {
          selectionControl: element.studentChoice ? 0.9 : 0.5,
          organizationControl: 0.8,
          sharingControl: 0.7,
          goalSetting: true,
          selfAssessment: true,
          reflectionRequirement: 'Deep reflection on learning and growth'
        },
        communityAccess: {
          communityViewing: element.type === 'community_feedback',
          communityFeedback: true,
          communityMentoring: false,
          publicPresentation: element.type === 'work_sample',
          serviceDocumentation: project.deliverables.impactPlan !== null
        }
      });
    }
  }
  
  return portfolioAlignments;
}

/**
 * Calculate flexibility metrics
 */
export async function calculateFlexibilityMetrics(
  projectMappings: ALFProjectMapping[]
): Promise<ALFFlexibilityMetrics> {
  // Calculate timing flexibility
  const timingFlexibility = calculateTimingFlexibility(projectMappings);
  
  // Calculate content flexibility
  const contentFlexibility = calculateContentFlexibility(projectMappings);
  
  // Calculate assessment flexibility
  const assessmentFlexibility = calculateAssessmentFlexibility(projectMappings);
  
  // Calculate pathway flexibility
  const pathwayFlexibility = calculatePathwayFlexibility(projectMappings);
  
  // Calculate student agency metrics
  const studentAgency = calculateStudentAgencyMetrics(projectMappings);
  
  // Calculate teacher adaptability metrics
  const teacherAdaptability = calculateTeacherAdaptabilityMetrics(projectMappings);
  
  // Calculate overall flexibility as weighted average
  const overallFlexibility = (
    timingFlexibility * 0.2 +
    contentFlexibility * 0.25 +
    assessmentFlexibility * 0.2 +
    pathwayFlexibility * 0.25 +
    studentAgency.choicePoints * 0.1
  );
  
  return {
    overallFlexibility,
    timingFlexibility,
    contentFlexibility,
    assessmentFlexibility,
    pathwayFlexibility,
    studentAgency,
    teacherAdaptability
  };
}

// Helper functions

function parseProjectDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*weeks?/i);
  return match ? parseInt(match[1]) : 4; // Default 4 weeks
}

function extractChoicePointTimings(project: ALFProject, duration: number): any[] {
  const allChoicePoints = [
    ...project.ideation.studentChoices,
    ...project.journey.choicePoints
  ];
  
  return allChoicePoints.map((cp, index) => ({
    week: Math.floor((index + 1) * duration / (allChoicePoints.length + 1)),
    choicePointId: cp.id,
    description: cp.description,
    impactOnPacing: determineChoiceImpact(cp),
    alternativeTimelines: cp.options.map(opt => ({
      choiceOptionId: opt.id,
      estimatedDuration: parseInt(opt.timeEstimate) || duration,
      additionalResources: [],
      modifiedOutcomes: []
    }))
  }));
}

function determineChoiceImpact(choicePoint: any): string {
  if (choicePoint.options.length <= 2) return 'minor';
  if (choicePoint.options.length <= 4) return 'moderate';
  return 'significant';
}

async function extractProjectStandards(project: ALFProject): Promise<StandardAlignment[]> {
  if (project.standardsAlignment) {
    return [
      ...project.standardsAlignment.primaryStandards,
      ...project.standardsAlignment.secondaryStandards
    ];
  }
  return [];
}

function findPreviousStandardEncounters(
  standard: StandardAlignment,
  previousMappings: ALFProjectMapping[]
): any[] {
  const encounters: any[] = [];
  
  for (const mapping of previousMappings) {
    const hasStandard = [...mapping.primaryStandards, ...mapping.secondaryStandards]
      .some(s => s.framework === standard.framework && s.code === standard.code);
    
    if (hasStandard) {
      encounters.push({
        projectId: mapping.project.id,
        projectTitle: mapping.project.metadata.title,
        timing: mapping.timing.proposedStartWeek,
        depth: 'development' as SpiralDepth, // Simplified for now
        context: mapping.project.metadata.title
      });
    }
  }
  
  return encounters;
}

function determineCurrentDepth(
  standard: StandardAlignment,
  project: ALFProject,
  previousEncounters: any[]
): SpiralDepth {
  const encounterCount = previousEncounters.length;
  
  // First encounter
  if (encounterCount === 0) return SpiralDepth.Introduction;
  
  // Check project complexity and student ownership
  const hasCreation = project.deliverables.portfolio.some(p => p.type === 'work_sample');
  const hasCommunityImpact = project.deliverables.impactPlan !== null;
  
  if (hasCommunityImpact && encounterCount >= 3) return SpiralDepth.Innovation;
  if (hasCreation && encounterCount >= 2) return SpiralDepth.Mastery;
  if (encounterCount >= 2) return SpiralDepth.Synthesis;
  if (encounterCount === 1) return SpiralDepth.Application;
  
  return SpiralDepth.Development;
}

function generateProgressionNotes(
  standard: StandardAlignment,
  currentDepth: SpiralDepth,
  previousEncounters: any[]
): string {
  if (previousEncounters.length === 0) {
    return `Initial introduction to ${standard.description} through authentic project context`;
  }
  
  return `Building on ${previousEncounters.length} previous encounters, now at ${currentDepth} level with increased student ownership`;
}

function determineAssessmentType(deliverables: any): any {
  if (deliverables.impactPlan) return 'community_presentation';
  if (deliverables.portfolio.length > 3) return 'portfolio_driven';
  if (deliverables.presentationOptions.length > 0) return 'exhibition';
  return 'project_based';
}

function extractAllStandards(mappings: ALFProjectMapping[]): StandardAlignment[] {
  const standardsSet = new Map<string, StandardAlignment>();
  
  for (const mapping of mappings) {
    const standards = [...mapping.primaryStandards, ...mapping.secondaryStandards];
    for (const standard of standards) {
      const key = `${standard.framework}-${standard.code}`;
      standardsSet.set(key, standard);
    }
  }
  
  return Array.from(standardsSet.values());
}

function determineStandardDepth(
  standard: StandardAlignment,
  mapping: ALFProjectMapping
): SpiralDepth {
  // Find the standard in spiral mappings
  const spiralMapping = mapping.spiralStandards.find(
    s => s.standard.framework === standard.framework && s.standard.code === standard.code
  );
  
  return spiralMapping?.currentDepth || SpiralDepth.Introduction;
}

function isDeeper(depth1: SpiralDepth, depth2: SpiralDepth): boolean {
  const depthOrder = [
    SpiralDepth.Introduction,
    SpiralDepth.Development,
    SpiralDepth.Application,
    SpiralDepth.Synthesis,
    SpiralDepth.Mastery,
    SpiralDepth.Innovation
  ];
  
  return depthOrder.indexOf(depth1) > depthOrder.indexOf(depth2);
}

function analyzeDepthDistribution(depthTracking: Map<string, SpiralDepth>): CoverageDepthAnalysis {
  const distribution: Record<SpiralDepth, number> = {
    [SpiralDepth.Introduction]: 0,
    [SpiralDepth.Development]: 0,
    [SpiralDepth.Application]: 0,
    [SpiralDepth.Synthesis]: 0,
    [SpiralDepth.Mastery]: 0,
    [SpiralDepth.Innovation]: 0
  };
  
  for (const depth of depthTracking.values()) {
    distribution[depth]++;
  }
  
  return {
    surfaceLevelCount: distribution[SpiralDepth.Introduction],
    developmentalCount: distribution[SpiralDepth.Development],
    applicationCount: distribution[SpiralDepth.Application],
    masteryCount: distribution[SpiralDepth.Mastery] + distribution[SpiralDepth.Synthesis],
    innovationCount: distribution[SpiralDepth.Innovation],
    depthDistribution: distribution
  };
}

function analyzeChoiceFlexibility(mappings: ALFProjectMapping[]): ChoiceFlexibilityAnalysis {
  let totalChoicePoints = 0;
  let choicePointsWithVariation = 0;
  let totalOptions = 0;
  
  for (const mapping of mappings) {
    const choiceCount = mapping.studentChoiceOptions.length;
    totalChoicePoints += choiceCount;
    
    for (const choice of mapping.studentChoiceOptions) {
      totalOptions += choice.pathwayOptions.length;
      if (choice.standardsCoverage.optionalStandards.length > 0) {
        choicePointsWithVariation++;
      }
    }
  }
  
  return {
    totalChoicePoints,
    choicePointsWithStandardsVariation: choicePointsWithVariation,
    averageOptionsPerChoice: totalChoicePoints > 0 ? totalOptions / totalChoicePoints : 0,
    standardsCoverageFlexibility: choicePointsWithVariation / Math.max(totalChoicePoints, 1),
    personalizedPathwayPossible: totalChoicePoints >= 3 && totalOptions >= 9
  };
}

function analyzeSpiralProgression(mappings: ALFProjectMapping[]): SpiralProgressionAnalysis {
  const standardEncounters = new Map<string, number>();
  let totalRevisited = 0;
  
  for (const mapping of mappings) {
    for (const spiral of mapping.spiralStandards) {
      const key = `${spiral.standard.framework}-${spiral.standard.code}`;
      const count = (standardEncounters.get(key) || 0) + 1;
      standardEncounters.set(key, count);
      if (count > 1) totalRevisited++;
    }
  }
  
  const averageEncounters = standardEncounters.size > 0 
    ? Array.from(standardEncounters.values()).reduce((a, b) => a + b, 0) / standardEncounters.size
    : 0;
  
  return {
    standardsRevisited: totalRevisited,
    averageEncounters,
    progressionCoherence: calculateProgressionCoherence(mappings),
    gapsInProgression: [],
    strengthsInProgression: []
  };
}

function identifyStandardsGaps(
  targetStandards: StandardAlignment[],
  coveredStandards: Set<string>
): any[] {
  const gaps: any[] = [];
  
  for (const standard of targetStandards) {
    const key = `${standard.framework}-${standard.code}`;
    if (!coveredStandards.has(key)) {
      gaps.push({
        standard,
        gapType: 'missing',
        severity: 'high',
        suggestedProjects: [`Project addressing ${standard.description}`]
      });
    }
  }
  
  return gaps;
}

function identifyCoverageStrengths(
  mappings: ALFProjectMapping[],
  depthTracking: Map<string, SpiralDepth>
): any[] {
  const strengths: any[] = [];
  
  // Standards with deep coverage
  for (const [key, depth] of depthTracking) {
    if (depth === SpiralDepth.Mastery || depth === SpiralDepth.Innovation) {
      strengths.push({
        type: 'deep_mastery',
        description: `Strong mastery of standard ${key}`,
        evidence: `Reached ${depth} level through authentic project work`
      });
    }
  }
  
  // Strong community connections
  const communityProjects = mappings.filter(m => m.communityConnections.length > 0);
  if (communityProjects.length > mappings.length * 0.5) {
    strengths.push({
      type: 'community_integration',
      description: 'Strong community partnerships throughout curriculum',
      evidence: `${communityProjects.length} of ${mappings.length} projects involve community`
    });
  }
  
  return strengths;
}

function calculateAuthenticityScore(project: ALFProject): number {
  let score = 0.5; // Base score
  
  if (project.deliverables.impactPlan) score += 0.2;
  if (project.ideation.communityConnection) score += 0.15;
  if (project.deliverables.presentationOptions.some(p => p.audience.includes('community'))) score += 0.15;
  
  return Math.min(score, 1.0);
}

function calculateChoiceImpact(project: ALFProject): number {
  const totalChoices = project.ideation.studentChoices.length + project.journey.choicePoints.length;
  return Math.min(totalChoices * 0.2, 1.0);
}

function calculateOverallProgression(progressions: any[]): string {
  if (progressions.length === 1) return 'initial_exposure';
  if (progressions.length === 2) return 'developing_understanding';
  if (progressions.length >= 3) return 'mastery_pathway';
  return 'comprehensive_mastery';
}

function calculateAuthenticityProgression(progressions: any[]): string {
  const scores = progressions.map(p => calculateAuthenticityScore(p.project));
  const trend = scores[scores.length - 1] - scores[0];
  
  if (trend > 0.3) return 'increasing_authenticity';
  if (trend > 0) return 'maintaining_authenticity';
  return 'stable_authenticity';
}

function calculateOwnershipProgression(progressions: any[]): string {
  const ownership = progressions.map(p => calculateChoiceImpact(p.project));
  const trend = ownership[ownership.length - 1] - ownership[0];
  
  if (trend > 0.3) return 'increasing_agency';
  if (trend > 0) return 'maintaining_agency';
  return 'stable_agency';
}

function extractRealWorldApplications(progressions: any[]): string[] {
  const applications: string[] = [];
  
  for (const progression of progressions) {
    if (progression.project.ideation.communityConnection) {
      applications.push(progression.project.ideation.communityConnection.realWorldConnection);
    }
  }
  
  return applications;
}

function determinePortfolioType(element: any): string {
  if (element.type === 'work_sample') return 'showcase';
  if (element.type === 'reflection') return 'growth';
  if (element.type === 'peer_feedback') return 'collaborative';
  if (element.type === 'community_feedback') return 'authentic_assessment';
  return 'process_documentation';
}

function generateReflectionRequirements(element: any): string[] {
  return [
    'Describe your learning process',
    'Identify challenges and how you overcame them',
    'Connect this work to real-world applications',
    'Set goals for future learning'
  ];
}

function generateSharingPermissions(element: any): any[] {
  return [
    { audience: 'teacher', level: 'collaborate', studentControlled: false },
    { audience: 'peers', level: 'comment', studentControlled: true },
    { audience: 'family', level: 'view', studentControlled: true },
    { audience: 'community', level: element.type === 'community_feedback' ? 'comment' : 'view', studentControlled: true }
  ];
}

function calculateTimingFlexibility(mappings: ALFProjectMapping[]): number {
  let flexibility = 0;
  
  for (const mapping of mappings) {
    if (mapping.timing.readinessBasedStart) flexibility += 0.2;
    if (mapping.timing.flexibilityWindow > 1) flexibility += 0.2;
    if (mapping.timing.iterationWeeks > 0) flexibility += 0.1;
  }
  
  return Math.min(flexibility / mappings.length, 1.0);
}

function calculateContentFlexibility(mappings: ALFProjectMapping[]): number {
  let totalChoices = 0;
  
  for (const mapping of mappings) {
    totalChoices += mapping.studentChoiceOptions.length;
  }
  
  return Math.min(totalChoices / (mappings.length * 3), 1.0); // Expect 3 choices per project
}

function calculateAssessmentFlexibility(mappings: ALFProjectMapping[]): number {
  let flexibility = 0;
  
  for (const mapping of mappings) {
    const strategy = mapping.assessmentStrategy;
    if (strategy.selfAssessmentIntegrated) flexibility += 0.2;
    if (strategy.iterationSupported) flexibility += 0.2;
    if (strategy.summativeEvidence.some(e => e.choiceInFormat)) flexibility += 0.1;
  }
  
  return Math.min(flexibility / mappings.length, 1.0);
}

function calculatePathwayFlexibility(mappings: ALFProjectMapping[]): number {
  let pathwayCount = 0;
  
  for (const mapping of mappings) {
    for (const choice of mapping.studentChoiceOptions) {
      pathwayCount += choice.pathwayOptions.length;
    }
  }
  
  return Math.min(pathwayCount / (mappings.length * 6), 1.0); // Expect 6 pathway options per project
}

function calculateStudentAgencyMetrics(mappings: ALFProjectMapping[]): StudentAgencyMetrics {
  let totalChoicePoints = 0;
  let totalDecisionMaking = 0;
  
  for (const mapping of mappings) {
    totalChoicePoints += mapping.studentChoiceOptions.length;
    totalDecisionMaking += mapping.studentChoiceOptions.filter(c => c.impactOnProgression.affectsTimeline).length;
  }
  
  return {
    choicePoints: totalChoicePoints,
    decisionMaking: Math.min(totalDecisionMaking / totalChoicePoints, 1.0),
    goalSetting: 0.8, // High in ALF
    selfAssessment: 0.9, // Very high in ALF
    paceControl: 0.7, // Moderate - some structure needed
    contentSelection: 0.8 // High choice in ALF
  };
}

function calculateTeacherAdaptabilityMetrics(mappings: ALFProjectMapping[]): TeacherAdaptabilityMetrics {
  return {
    responsiveness: 0.9, // ALF emphasizes teacher responsiveness
    differentiation: 0.85, // High differentiation possible
    improvisation: 0.7, // Moderate - framework provides structure
    individualSupport: 0.8, // High with choice points
    realTimeAssessment: 0.85 // Continuous formative assessment
  };
}

function calculateProgressionCoherence(mappings: ALFProjectMapping[]): number {
  // Simplified coherence calculation
  let coherenceScore = 0.5; // Base score
  
  // Check for logical progression in complexity
  const complexityProgression = mappings.every((m, i) => 
    i === 0 || m.project.journey.phases.length >= mappings[i-1].project.journey.phases.length
  );
  
  if (complexityProgression) coherenceScore += 0.3;
  
  // Check for community connection progression
  const communityProgression = mappings.filter(m => m.communityConnections.length > 0).length / mappings.length;
  coherenceScore += communityProgression * 0.2;
  
  return coherenceScore;
}

// Export all implementation functions
export const ALFCurriculumMappingImplementation = {
  calculateProjectTiming,
  analyzeSpiralStandards,
  defineAssessmentStrategy,
  analyzeCoverageDemocracy,
  buildSpiralMappings,
  createPortfolioAlignment,
  calculateFlexibilityMetrics
};