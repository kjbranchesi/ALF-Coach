import { WizardDataV3 } from '../features/wizard/wizardSchema';
import { ProjectV3, Phase, Milestone, Artifact, StandardsCoverage, Tier } from '../types/alf';

/**
 * Generates a unique ID for entities
 */
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Converts wizard data to normalized ProjectV3 structure
 */
export function normalizeProjectV3(wizardData: WizardDataV3): ProjectV3 {
  const projectId = generateId('proj');
  
  // Initialize phases from wizard data or defaults
  const phases: Phase[] = wizardData.phases || [
    {
      id: generateId('phase'),
      name: 'Discover',
      description: 'Research and explore the problem space',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      goals: wizardData.learningGoals?.slice(0, 1) || [],
      tier: 'core',
      confidence: 0.9
    },
    {
      id: generateId('phase'),
      name: 'Plan',
      description: 'Design solutions and create action plans',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      goals: wizardData.learningGoals?.slice(1, 2) || [],
      tier: 'core',
      confidence: 0.85
    },
    {
      id: generateId('phase'),
      name: 'Create',
      description: 'Build and implement solutions',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      goals: wizardData.learningGoals?.slice(2, 3) || [],
      tier: 'core',
      confidence: 0.8
    },
    {
      id: generateId('phase'),
      name: 'Share',
      description: 'Present findings and celebrate achievements',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      goals: ['Present learnings to community'],
      tier: 'scaffold',
      confidence: 0.75
    }
  ];

  // Generate milestones from phases
  const milestones: Milestone[] = phases.flatMap((phase, phaseIndex) => [
    {
      id: generateId('milestone'),
      phaseId: phase.id,
      name: `${phase.name} Kickoff`,
      description: `Begin ${phase.name.toLowerCase()} phase activities`,
      dueDate: phase.startDate,
      evidence: [`${phase.name} plan documented`, 'Team roles assigned'],
      owner: 'Teacher',
      tier: 'core',
      confidence: 0.9
    },
    {
      id: generateId('milestone'),
      phaseId: phase.id,
      name: `${phase.name} Checkpoint`,
      description: `Review progress and adjust plans`,
      dueDate: new Date(
        (new Date(phase.startDate).getTime() + new Date(phase.endDate).getTime()) / 2
      ).toISOString(),
      evidence: ['Progress documentation', 'Peer feedback collected'],
      owner: 'Students',
      tier: 'scaffold',
      confidence: 0.8
    }
  ]);

  // Generate artifacts
  const artifacts: Artifact[] = wizardData.artifacts || [
    {
      id: generateId('artifact'),
      name: 'Research Portfolio',
      description: 'Collection of research findings and sources',
      linkedMilestoneIds: [milestones[0]?.id, milestones[1]?.id].filter(Boolean),
      rubricIds: [],
      tier: 'core',
      confidence: 0.85
    },
    {
      id: generateId('artifact'),
      name: 'Action Plan',
      description: 'Detailed plan for implementing solutions',
      linkedMilestoneIds: [milestones[2]?.id, milestones[3]?.id].filter(Boolean),
      rubricIds: [],
      tier: 'core',
      confidence: 0.8
    },
    {
      id: generateId('artifact'),
      name: 'Final Product',
      description: 'The main deliverable of the project',
      linkedMilestoneIds: [milestones[4]?.id, milestones[5]?.id].filter(Boolean),
      rubricIds: [],
      tier: 'scaffold',
      confidence: 0.75
    },
    {
      id: generateId('artifact'),
      name: 'Presentation',
      description: 'Final presentation to share learnings',
      linkedMilestoneIds: [milestones[6]?.id, milestones[7]?.id].filter(Boolean),
      rubricIds: [],
      tier: 'scaffold',
      confidence: 0.7
    }
  ];

  // Generate standards coverage
  const standardsCoverage: StandardsCoverage[] = wizardData.standards?.map(standard => ({
    standardId: standard.code,
    milestoneIds: milestones.slice(0, 3).map(m => m.id),
    emphasis: 'primary' as const,
    tier: 'core',
    confidence: 0.85
  })) || [];

  // Build the ProjectV3 structure
  const project: ProjectV3 = {
    id: projectId,
    title: wizardData.projectTopic || 'Untitled Project',
    description: wizardData.projectTopic || '',
    tier: 'core',
    confidence: 0.85,
    
    // Context from wizard
    context: {
      ...wizardData.projectContext,
      tier: 'core',
      confidence: 0.9
    },
    
    // Core content
    bigIdea: {
      text: wizardData.bigIdea || '',
      tier: 'core',
      confidence: 0.9
    },
    
    essentialQuestion: {
      text: wizardData.essentialQuestion || '',
      tier: 'scaffold',
      confidence: 0.85
    },
    
    learningGoals: (wizardData.learningGoals || []).map(goal => ({
      text: goal,
      tier: 'core' as Tier,
      confidence: 0.85
    })),
    
    successCriteria: (wizardData.successCriteria || []).map(criterion => ({
      text: criterion,
      tier: 'scaffold' as Tier,
      confidence: 0.8
    })),
    
    // Standards
    standards: wizardData.standards || [],
    standardsCoverage,
    
    // Project structure
    phases,
    milestones,
    artifacts,
    
    // Rubrics
    rubrics: wizardData.rubrics || [],
    
    // Roles and differentiation
    roles: wizardData.studentRoles || [],
    differentiation: wizardData.differentiation || {
      tier: 'scaffold',
      confidence: 0.75,
      supports: [],
      udlPrinciples: [],
      multilingualSupports: [],
      accommodations: []
    },
    
    scaffolds: wizardData.scaffolds || [],
    
    // Communications
    communications: wizardData.communications || {
      tier: 'scaffold',
      confidence: 0.7,
      family: '',
      admin: '',
      partner: ''
    },
    
    exhibition: wizardData.exhibition || {
      tier: 'aspirational',
      confidence: 0.6,
      format: '',
      audience: [],
      date: ''
    },
    
    // Planning
    evidencePlan: wizardData.evidencePlan || {
      tier: 'core',
      confidence: 0.8,
      checkpoints: [],
      storage: '',
      permissions: []
    },
    
    risks: wizardData.riskManagement?.risks || [],
    contingencies: wizardData.riskManagement?.contingencies || [],
    
    // Metadata
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      version: '3.0',
      schemaVersion: 3,
      wizardVersion: '3.0',
      contentTiers: {
        core: countTier(project, 'core'),
        scaffold: countTier(project, 'scaffold'),
        aspirational: countTier(project, 'aspirational')
      }
    }
  };
  
  return project;
}

/**
 * Counts items of a specific tier in the project
 */
function countTier(project: any, tier: Tier): number {
  let count = 0;
  
  const countInObject = (obj: any) => {
    if (!obj) return;
    
    if (obj.tier === tier) count++;
    
    if (Array.isArray(obj)) {
      obj.forEach(countInObject);
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(countInObject);
    }
  };
  
  countInObject(project);
  return count;
}

/**
 * Validates that all ID references are valid
 */
export function validateProjectReferences(project: ProjectV3): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const phaseIds = new Set(project.phases.map(p => p.id));
  const milestoneIds = new Set(project.milestones.map(m => m.id));
  const artifactIds = new Set(project.artifacts.map(a => a.id));
  const rubricIds = new Set(project.rubrics.map(r => r.id));
  
  // Check milestone phase references
  project.milestones.forEach(milestone => {
    if (!phaseIds.has(milestone.phaseId)) {
      errors.push(`Milestone "${milestone.name}" references non-existent phase: ${milestone.phaseId}`);
    }
  });
  
  // Check artifact milestone references
  project.artifacts.forEach(artifact => {
    artifact.linkedMilestoneIds.forEach(milestoneId => {
      if (!milestoneIds.has(milestoneId)) {
        errors.push(`Artifact "${artifact.name}" references non-existent milestone: ${milestoneId}`);
      }
    });
    
    artifact.rubricIds.forEach(rubricId => {
      if (!rubricIds.has(rubricId)) {
        errors.push(`Artifact "${artifact.name}" references non-existent rubric: ${rubricId}`);
      }
    });
  });
  
  // Check standards coverage references
  project.standardsCoverage.forEach(coverage => {
    coverage.milestoneIds.forEach(milestoneId => {
      if (!milestoneIds.has(milestoneId)) {
        errors.push(`Standards coverage references non-existent milestone: ${milestoneId}`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}