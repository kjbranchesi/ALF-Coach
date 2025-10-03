/**
 * Project Normalization Utilities
 * Ensures IDs, validates links, and migrates data structures
 */

import type { 
  Project, 
  Phase, 
  Milestone, 
  Artifact, 
  Rubric, 
  Standard,
  StandardsCoverage,
  PartialProject 
} from '../types/alf';
import type { WizardData, WizardDataV3 } from '../features/wizard/wizardSchema';

// Generate unique IDs
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

// Ensure all items in array have IDs
export function ensureIds<T extends { id?: string }>(
  items: T[], 
  prefix: string
): (T & { id: string })[] {
  return items.map(item => ({
    ...item,
    id: item.id || generateId(prefix)
  }));
}

// Index array by ID for quick lookup
export function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  const map: Record<string, T> = {};
  for (const item of items) {
    map[item.id] = item;
  }
  return map;
}

// Validate all ID references are valid
export function validateLinks(project: Partial<Project>): string[] {
  const errors: string[] = [];
  
  // Build ID sets
  const phaseIds = new Set(project.phases?.map(p => p.id) || []);
  const milestoneIds = new Set(project.milestones?.map(m => m.id) || []);
  const artifactIds = new Set(project.artifacts?.map(a => a.id) || []);
  const rubricIds = new Set(project.rubrics?.map(r => r.id) || []);
  const standardIds = new Set(project.standards?.map(s => s.id) || []);
  
  // Check milestone -> phase links
  project.milestones?.forEach(milestone => {
    if (milestone.phaseId && !phaseIds.has(milestone.phaseId)) {
      errors.push(`Milestone "${milestone.name}" references missing phase ${milestone.phaseId}`);
    }
  });
  
  // Check artifact -> milestone links
  project.artifacts?.forEach(artifact => {
    if (artifact.milestoneId && !milestoneIds.has(artifact.milestoneId)) {
      errors.push(`Artifact "${artifact.name}" references missing milestone ${artifact.milestoneId}`);
    }
    
    // Check artifact -> rubric links
    artifact.rubricIds?.forEach(rubricId => {
      if (!rubricIds.has(rubricId)) {
        errors.push(`Artifact "${artifact.name}" references missing rubric ${rubricId}`);
      }
    });
  });
  
  // Check standards coverage links
  project.standardsCoverage?.forEach(coverage => {
    if (!standardIds.has(coverage.standardId)) {
      errors.push(`Coverage references missing standard ${coverage.standardId}`);
    }
    if (!milestoneIds.has(coverage.milestoneId)) {
      errors.push(`Coverage references missing milestone ${coverage.milestoneId}`);
    }
    if (coverage.phaseId && !phaseIds.has(coverage.phaseId)) {
      errors.push(`Coverage references missing phase ${coverage.phaseId}`);
    }
  });
  
  return errors;
}

// Create initial empty V3 project structure
export function createEmptyV3Project(): PartialProject {
  const projectId = generateId('proj');
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return {
    id: projectId,
    title: '',
    description: '',
    
    // Core elements with tier
    context: {
      grade: '',
      subjects: [],
      primarySubject: '',
      tier: 'core'
    },
    bigIdea: {
      value: '',
      tier: 'core'
    } as any, // Type workaround for Tiered<string>
    essentialQuestion: {
      value: '',
      tier: 'core'
    } as any,
    learningGoals: {
      value: [],
      tier: 'core'
    } as any,
    successCriteria: {
      value: [],
      tier: 'core'
    } as any,
    
    // Empty arrays for collections
    standards: [],
    standardsCoverage: [],
    phases: [],
    milestones: [],
    artifacts: [],
    rubrics: [],
    roles: [],
    scaffolds: [],
    communications: [],
    checkpoints: [],
    risks: [],
    contingencies: [],
    
    // Metadata
    metadata: {
      version: '3.0',
      schemaVersion: 3,
      createdAt: now,
      updatedAt: now,
      contentTiers: {
        core: 0,
        scaffold: 0,
        aspirational: 0
      }
    }
  };
}

// Migrate V2 wizard data to V3 project
export function migrateWizardToProject(wizardData: Partial<WizardData>): PartialProject {
  const project = createEmptyV3Project();
  
  // Map wizard fields to project context
  project.context = {
    grade: wizardData.gradeLevel || '',
    subjects: wizardData.subjects || [],
    primarySubject: wizardData.primarySubject || wizardData.subjects?.[0] || '',
    tier: 'core'
  };
  
  // Map learning goals to project
  if (wizardData.learningGoals) {
    project.learningGoals = {
      value: [wizardData.learningGoals],
      tier: 'core'
    } as any;
  }
  
  // Map project topic to big idea
  if (wizardData.projectTopic) {
    project.bigIdea = {
      value: wizardData.projectTopic,
      tier: 'core'
    } as any;
    project.title = wizardData.projectTopic;
  }
  
  // Create default phases based on duration
  const duration = wizardData.duration || 'medium';
  const phaseNames = ['Discover', 'Plan', 'Create', 'Share', 'Reflect'];
  
  project.phases = phaseNames.map(name => ({
    id: generateId('phase'),
    name,
    goals: [],
    tier: 'core' as const
  }));
  
  return project;
}

// Normalize a project - ensure all IDs and links are valid
export function normalizeProject(project: PartialProject): PartialProject {
  // Ensure all entities have IDs
  const normalized = {
    ...project,
    phases: ensureIds(project.phases || [], 'phase'),
    milestones: ensureIds(project.milestones || [], 'milestone'),
    artifacts: ensureIds(project.artifacts || [], 'artifact'),
    rubrics: ensureIds(project.rubrics || [], 'rubric'),
    standards: ensureIds(project.standards || [], 'std'),
    roles: ensureIds(project.roles || [], 'role'),
    scaffolds: ensureIds(project.scaffolds || [], 'scaffold'),
    communications: ensureIds(project.communications || [], 'comm'),
    checkpoints: ensureIds(project.checkpoints || [], 'check'),
    risks: ensureIds(project.risks || [], 'risk'),
    contingencies: ensureIds(project.contingencies || [], 'cont')
  };
  
  // Update tier counts
  if (normalized.metadata) {
    normalized.metadata.contentTiers = {
      core: countTier(normalized, 'core'),
      scaffold: countTier(normalized, 'scaffold'),
      aspirational: countTier(normalized, 'aspirational')
    };
  }
  
  return normalized;
}

// Count items by tier
function countTier(project: PartialProject, tier: 'core' | 'scaffold' | 'aspirational'): number {
  let count = 0;
  
  // Count tiered fields
  if (project.context?.tier === tier) {count++;}
  if ((project.bigIdea as any)?.tier === tier) {count++;}
  if ((project.essentialQuestion as any)?.tier === tier) {count++;}
  
  // Count tiered arrays
  const arrays = [
    project.phases,
    project.milestones,
    project.artifacts,
    project.rubrics,
    project.standards,
    project.roles,
    project.scaffolds,
    project.communications,
    project.checkpoints,
    project.risks,
    project.contingencies
  ];
  
  arrays.forEach(arr => {
    if (arr) {
      count += arr.filter(item => (item as any).tier === tier).length;
    }
  });
  
  return count;
}

// Check if project is ready for export
export function isProjectComplete(project: PartialProject): { 
  complete: boolean; 
  missing: string[] 
} {
  const missing: string[] = [];
  
  // Required fields
  if (!project.title) {missing.push('Project title');}
  if (!project.description) {missing.push('Project description');}
  if (!project.context?.grade) {missing.push('Grade level');}
  if (!project.context?.subjects?.length) {missing.push('Subject areas');}
  if (!(project.bigIdea as any)?.value) {missing.push('Big idea');}
  if (!(project.essentialQuestion as any)?.value) {missing.push('Essential question');}
  if (!(project.learningGoals as any)?.value?.length) {missing.push('Learning goals');}
  
  // Should have some structure
  if (!project.phases?.length) {missing.push('Project phases');}
  if (!project.milestones?.length) {missing.push('Milestones');}
  if (!project.artifacts?.length) {missing.push('Student deliverables');}
  if (!project.rubrics?.length) {missing.push('Assessment rubrics');}
  
  return {
    complete: missing.length === 0,
    missing
  };
}