/**
 * Hero Project Data Builders
 *
 * This module provides type-safe builder functions to create correctly
 * structured hero project data. Use these builders to ensure your data
 * matches the expected format for all components.
 *
 * Example usage:
 * ```typescript
 * const risk = createRisk({
 *   id: 'r1',
 *   name: 'Technology gaps',
 *   likelihood: 'medium', // Will be normalized to 'med'
 *   impact: 'high',
 *   mitigation: 'Provide offline alternatives'
 * });
 * ```
 */

import {
  type HeroProjectData,
  type Phase,
  type Milestone,
  type RubricCriteria,
  type RubricLevel,
  type Resource,
  type Activity,
} from './types';
import {
  normalizeRiskLevel,
  normalizeTechAccess,
  type ValidatedRisk,
  type ValidatedContingency,
  type ValidatedConstraints,
  type RiskLevel,
  type TechAccessLevel,
  type EmphasisLevel,
} from './validation';

// ============================================================================
// RISK & FEASIBILITY BUILDERS
// ============================================================================

/**
 * Creates a properly structured risk object
 * Automatically normalizes risk levels (e.g., 'medium' -> 'med')
 */
export function createRisk(input: {
  id: string;
  name: string;
  likelihood: string | RiskLevel;
  impact: string | RiskLevel;
  mitigation: string;
}): ValidatedRisk {
  return {
    id: input.id,
    name: input.name, // Always uses 'name', never 'risk'
    likelihood: normalizeRiskLevel(input.likelihood),
    impact: normalizeRiskLevel(input.impact),
    mitigation: input.mitigation,
  };
}

/**
 * Creates a properly structured contingency object
 * Ensures we always use 'scenario' (not 'trigger')
 */
export function createContingency(input: {
  id: string;
  scenario: string;
  plan: string;
}): ValidatedContingency {
  return {
    id: input.id,
    scenario: input.scenario, // Always 'scenario', never 'trigger'
    plan: input.plan,
  };
}

/**
 * Creates properly structured constraints
 */
export function createConstraints(input: {
  budgetUSD?: number;
  techAccess?: string | TechAccessLevel;
  materials?: string[];
  safetyRequirements?: string[];
}): ValidatedConstraints {
  const constraints: ValidatedConstraints = {};

  if (input.budgetUSD !== undefined) {
    constraints.budgetUSD = input.budgetUSD;
  }

  if (input.techAccess !== undefined) {
    constraints.techAccess = normalizeTechAccess(input.techAccess);
  }

  if (input.materials !== undefined) {
    constraints.materials = input.materials;
  }

  if (input.safetyRequirements !== undefined) {
    constraints.safetyRequirements = input.safetyRequirements;
  }

  return constraints;
}

// ============================================================================
// PHASE & JOURNEY BUILDERS
// ============================================================================

/**
 * Creates a properly structured phase
 */
export function createPhase(input: {
  id: string;
  name: string;
  duration: string;
  focus?: string;
  description: string;
  objectives?: string[];
  activities?: Activity[];
  deliverables?: string[];
  resources?: string[];
  teacherNotes?: string;
  studentTips?: string;
}): Phase {
  return {
    id: input.id,
    name: input.name,
    duration: input.duration,
    focus: input.focus || '',
    description: input.description,
    objectives: input.objectives || [],
    activities: input.activities || [],
    deliverables: input.deliverables || [],
    checkpoints: [],
    resources: input.resources || [],
    teacherNotes: input.teacherNotes || '',
    studentTips: input.studentTips || '',
  };
}

/**
 * Creates a properly structured activity
 */
export function createActivity(input: {
  name: string;
  type?: 'individual' | 'group' | 'class' | 'field';
  duration: string;
  description: string;
  materials?: string[];
  instructions?: string[];
  differentiation?: {
    support?: string[];
    extension?: string[];
  };
  assessment?: string;
}): Activity {
  return {
    name: input.name,
    type: input.type || 'class',
    duration: input.duration,
    description: input.description,
    materials: input.materials || [],
    instructions: input.instructions || [],
    differentiation: {
      support: input.differentiation?.support || [],
      extension: input.differentiation?.extension || [],
    },
    assessment: input.assessment || '',
  };
}

/**
 * Creates a properly structured milestone
 */
export function createMilestone(input: {
  id: string;
  phase: string;
  week: number;
  title: string;
  description: string;
  evidence?: string[];
  celebration?: string;
}): Milestone {
  return {
    id: input.id,
    phase: input.phase,
    week: input.week,
    title: input.title,
    description: input.description,
    evidence: input.evidence || [],
    celebration: input.celebration || '',
  };
}

// ============================================================================
// ASSESSMENT BUILDERS
// ============================================================================

/**
 * Creates a rubric level
 */
export function createRubricLevel(input: {
  points: number;
  description: string;
  evidence?: string[];
}): RubricLevel {
  return {
    points: input.points,
    description: input.description,
    evidence: input.evidence || [],
  };
}

/**
 * Creates a complete rubric criteria
 */
export function createRubricCriteria(input: {
  category: string;
  weight: number;
  exemplary: RubricLevel | { description: string; points?: number };
  proficient: RubricLevel | { description: string; points?: number };
  developing: RubricLevel | { description: string; points?: number };
  beginning: RubricLevel | { description: string; points?: number };
}): RubricCriteria {
  // Helper to ensure we have full RubricLevel objects
  const ensureRubricLevel = (
    level: RubricLevel | { description: string; points?: number },
    defaultPoints: number
  ): RubricLevel => {
    if ('evidence' in level) {
      return level;
    }
    return {
      points: level.points ?? defaultPoints,
      description: level.description,
      evidence: [],
    };
  };

  return {
    category: input.category,
    weight: input.weight,
    exemplary: ensureRubricLevel(input.exemplary, 4),
    proficient: ensureRubricLevel(input.proficient, 3),
    developing: ensureRubricLevel(input.developing, 2),
    beginning: ensureRubricLevel(input.beginning, 1),
  };
}

// ============================================================================
// RESOURCE BUILDERS
// ============================================================================

/**
 * Creates a properly structured resource
 */
export function createResource(input: {
  name: string;
  type: 'material' | 'technology' | 'space' | 'human';
  quantity?: string;
  source?: string;
  cost?: string;
  alternatives?: string[];
}): Resource {
  return {
    name: input.name,
    type: input.type,
    quantity: input.quantity,
    source: input.source,
    cost: input.cost,
    alternatives: input.alternatives,
  };
}

// ============================================================================
// STANDARDS BUILDERS
// ============================================================================

/**
 * Creates a properly structured standard alignment
 */
export function createStandardAlignment(input: {
  code: string;
  text: string;
  application?: string;
  depth?: 'introduce' | 'develop' | 'master';
}) {
  return {
    code: input.code,
    text: input.text,
    application: input.application || '',
    depth: input.depth || 'develop' as EmphasisLevel,
  };
}

// ============================================================================
// COMPOSITE BUILDERS
// ============================================================================

/**
 * Creates a complete feasibility data set
 */
export function createFeasibilityData(input: {
  constraints?: {
    budgetUSD?: number;
    techAccess?: string;
    materials?: string[];
    safetyRequirements?: string[];
  };
  risks?: Array<{
    id: string;
    name: string;
    likelihood: string;
    impact: string;
    mitigation: string;
  }>;
  contingencies?: Array<{
    id: string;
    scenario: string;
    plan: string;
  }>;
}) {
  return {
    constraints: input.constraints ? createConstraints(input.constraints) : undefined,
    risks: input.risks ? input.risks.map(createRisk) : [],
    contingencies: input.contingencies ? input.contingencies.map(createContingency) : [],
  };
}

/**
 * Creates a minimal valid hero project structure
 * Useful as a starting template
 */
export function createHeroProjectTemplate(input: {
  id: string;
  title: string;
  duration: string;
  gradeLevel: string;
  subjects: string[];
}): Partial<HeroProjectData> {
  return {
    id: input.id,
    title: input.title,
    tagline: '',
    duration: input.duration,
    gradeLevel: input.gradeLevel,
    subjects: input.subjects,
    theme: {
      primary: 'blue',
      secondary: 'purple',
      accent: 'amber',
      gradient: 'from-primary-600 to-purple-600',
    },
    hero: {
      badge: 'Hero Project',
      description: '',
      highlights: [],
      impactStatement: '',
    },
    context: {
      problem: '',
      significance: '',
      realWorld: '',
      studentRole: '',
      authenticity: '',
    },
    overview: {
      description: '',
      keyFeatures: [],
      outcomes: [],
      deliverables: [],
    },
    bigIdea: {
      statement: '',
      essentialQuestion: '',
      subQuestions: [],
      challenge: '',
      drivingQuestion: '',
    },
    standards: {
      objectives: [],
      alignments: {},
    },
    journey: {
      phases: [],
      milestones: [],
      timeline: [],
      weeklyBreakdown: [],
    },
    assessment: {
      philosophy: '',
      rubric: [],
      formative: [],
      summative: [],
      selfAssessment: [],
      peerAssessment: [],
    },
    resources: {
      required: [],
      optional: [],
      professional: [],
      studentResources: [],
      communityConnections: [],
    },
    impact: {
      audience: {
        primary: [],
        secondary: [],
        engagement: '',
        feedback: '',
      },
      methods: [],
      metrics: [],
      sustainability: {
        continuation: '',
        maintenance: '',
        evolution: '',
        legacy: '',
      },
      scalability: {
        classroom: '',
        school: '',
        district: '',
        beyond: '',
      },
    },
  } as Partial<HeroProjectData>;
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrates old risk format to new format
 * Handles properties like 'risk' -> 'name' and 'medium' -> 'med'
 */
export function migrateRisk(oldRisk: any): ValidatedRisk {
  return createRisk({
    id: oldRisk.id || `risk-${Date.now()}`,
    name: oldRisk.name || oldRisk.risk || 'Unnamed Risk',
    likelihood: oldRisk.likelihood || 'low',
    impact: oldRisk.impact || 'low',
    mitigation: oldRisk.mitigation || 'No mitigation specified',
  });
}

/**
 * Migrates old contingency format to new format
 * Handles properties like 'trigger' -> 'scenario'
 */
export function migrateContingency(oldContingency: any): ValidatedContingency {
  return createContingency({
    id: oldContingency.id || `contingency-${Date.now()}`,
    scenario: oldContingency.scenario || oldContingency.trigger || 'Unnamed Scenario',
    plan: oldContingency.plan || 'No plan specified',
  });
}

/**
 * Batch migration helper for arrays
 */
export function migrateRisks(risks: any[]): ValidatedRisk[] {
  return risks.map(migrateRisk);
}

export function migrateContingencies(contingencies: any[]): ValidatedContingency[] {
  return contingencies.map(migrateContingency);
}