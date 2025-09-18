import type { WizardDataV3 } from '../types/wizardV3Types';
import type {
  ProjectV3,
  Phase,
  Milestone,
  Artifact,
  StandardsCoverage,
  Tier
} from '../types/alf';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const generateId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const toISODate = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
};

const coerceTier = (value: unknown, fallback: Tier): Tier => {
  if (value === 'core' || value === 'scaffold' || value === 'aspirational') {
    return value;
  }
  return fallback;
};

const coerceConfidence = (value: unknown, fallback: number) =>
  typeof value === 'number' ? value : fallback;

const cloneArray = <T extends Record<string, unknown>>(items: T[] | undefined): T[] =>
  Array.isArray(items) ? items.map(item => ({ ...item })) : [];

const extractText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object' && 'text' in value) {
    const maybeText = (value as { text?: unknown }).text;
    if (typeof maybeText === 'string') {
      return maybeText;
    }
  }
  return '';
};

const mapTieredTexts = (
  items: Array<string | { text?: string; tier?: Tier; confidence?: number }> | undefined,
  tier: Tier,
  confidence: number
) =>
  (items ? items.map(item => {
    if (typeof item === 'string') {
      return { text: item, tier, confidence };
    }
    if (item && typeof item === 'object') {
      return {
        text: typeof item.text === 'string' ? item.text : '',
        tier: coerceTier(item.tier, tier),
        confidence: coerceConfidence(item.confidence, confidence)
      };
    }
    return { text: '', tier, confidence };
  }) : []).filter(entry => entry.text);

const buildDefaultPhases = (wizardData: WizardDataV3): Phase[] => {
  const now = Date.now();
  const learningGoals = Array.isArray(wizardData.learningGoals) ? wizardData.learningGoals : [];
  const slices = [
    learningGoals.slice(0, 1),
    learningGoals.slice(1, 2),
    learningGoals.slice(2, 3),
    ['Present learnings to community']
  ];
  const names = ['Discover', 'Plan', 'Create', 'Share'];

  return names.map((name, index) => {
    const start = new Date(now + WEEK_IN_MS * index).toISOString();
    const end = new Date(now + WEEK_IN_MS * (index + 1)).toISOString();
    return {
      id: generateId('phase'),
      name,
      start,
      end,
      duration: '1 week',
      goals: (slices[index] || []).map(extractText).filter(Boolean)
    } satisfies Phase;
  });
};

const buildDefaultMilestones = (phases: Phase[]): Milestone[] =>
  phases.flatMap(phase => {
    const start = toISODate((phase as unknown as { start?: string; startDate?: string }).start)
      ?? toISODate((phase as unknown as { start?: string; startDate?: string }).startDate)
      ?? new Date().toISOString();
    const end = toISODate((phase as unknown as { end?: string; endDate?: string }).end)
      ?? toISODate((phase as unknown as { end?: string; endDate?: string }).endDate)
      ?? new Date().toISOString();
    const midpoint = new Date((new Date(start).getTime() + new Date(end).getTime()) / 2).toISOString();

    return [
      {
        id: generateId('milestone'),
        phaseId: phase.id,
        name: `${phase.name} Kickoff`,
        description: `Begin ${phase.name.toLowerCase()} phase activities`,
        due: start,
        owner: 'teacher',
        evidence: ['Team roles assigned', `${phase.name} plan documented`]
      },
      {
        id: generateId('milestone'),
        phaseId: phase.id,
        name: `${phase.name} Checkpoint`,
        description: `Reflect on ${phase.name.toLowerCase()} progress and adjust next steps`,
        due: midpoint,
        owner: 'student',
        evidence: ['Progress documentation', 'Peer feedback collected']
      }
    ] satisfies Milestone[];
  });

const buildDefaultArtifacts = (milestones: Milestone[]): Artifact[] => {
  const firstMilestone = milestones[0]?.id ?? generateId('milestone');
  return [
    {
      id: generateId('artifact'),
      name: 'Research Portfolio',
      description: 'Collection of research findings and sources gathered during the project.',
      milestoneId: firstMilestone,
      rubricIds: [],
      exemplar: undefined
    }
  ];
};

const buildDefaultStandardsCoverage = (
  standards: Array<{ code?: string }> | undefined,
  milestones: Milestone[]
): StandardsCoverage[] => {
  if (!Array.isArray(standards) || standards.length === 0 || milestones.length === 0) {
    return [];
  }
  const primaryMilestone = milestones[0];
  return standards
    .map(standard => {
      if (!standard?.code) {
        return null;
      }
      return {
        standardId: standard.code,
        milestoneId: primaryMilestone.id,
        phaseId: primaryMilestone.phaseId,
        emphasis: 'introduce' as StandardsCoverage['emphasis']
      } satisfies StandardsCoverage;
    })
    .filter((coverage): coverage is StandardsCoverage => Boolean(coverage));
};

const defaultDifferentiation = {
  tier: 'scaffold' as Tier,
  confidence: 0.75,
  tieredAssignments: [],
  udlStrategies: {
    representation: [],
    action: [],
    engagement: []
  },
  languageSupports: [],
  executiveFunctionSupports: [],
  accommodations: []
};

const defaultCommunications = {
  family: undefined,
  admin: undefined,
  partners: []
};

const defaultExhibition = {
  format: '',
  audience: [] as string[],
  date: undefined,
  venue: undefined,
  preparation: [] as string[],
  tier: 'aspirational' as Tier,
  confidence: 0.6
};

const defaultEvidencePlan = {
  checkpoints: [],
  permissions: [] as string[],
  storage: '',
  dataManagement: undefined,
  tier: 'core' as Tier,
  confidence: 0.8
};

const computeTierCounts = (project: ProjectV3) => {
  const counts = { core: 0, scaffold: 0, aspirational: 0 };

  const register = (candidate: unknown) => {
    if (!candidate) {
      return;
    }
    if (Array.isArray(candidate)) {
      candidate.forEach(register);
      return;
    }
    if (typeof candidate === 'object') {
      const tier = (candidate as Record<string, unknown>).tier;
      if (tier === 'core' || tier === 'scaffold' || tier === 'aspirational') {
        counts[tier] += 1;
      }
      Object.values(candidate as Record<string, unknown>).forEach(register);
    }
  };

  register(project);
  return counts;
};

export function normalizeProjectV3(wizardData: WizardDataV3): ProjectV3 {
  const existingProjectId = (wizardData as unknown as { projectId?: string })?.projectId
    ?? (wizardData.metadata as unknown as { projectId?: string })?.projectId;
  const projectId = existingProjectId ?? generateId('proj');

  const phases: Phase[] = Array.isArray(wizardData.phases) && wizardData.phases.length
    ? cloneArray(wizardData.phases)
    : buildDefaultPhases(wizardData);

  const milestones: Milestone[] = Array.isArray(wizardData.milestones) && wizardData.milestones.length
    ? cloneArray(wizardData.milestones)
    : buildDefaultMilestones(phases);

  const artifacts: Artifact[] = Array.isArray(wizardData.artifacts) && wizardData.artifacts.length
    ? cloneArray(wizardData.artifacts)
    : buildDefaultArtifacts(milestones);

  const rubrics = Array.isArray(wizardData.rubrics) ? cloneArray(wizardData.rubrics) : [];
  const roles = Array.isArray(wizardData.studentRoles) ? cloneArray(wizardData.studentRoles) : [];
  const scaffolds = Array.isArray(wizardData.scaffolds) ? cloneArray(wizardData.scaffolds) : [];

  const standards = Array.isArray(wizardData.standards) ? cloneArray(wizardData.standards) : [];
  const standardsCoverage = buildDefaultStandardsCoverage(standards, milestones);

  const nowISO = new Date().toISOString();
  type WizardMetadata = { createdAt?: Date | string; lastModified?: Date | string; projectId?: string };
  const metadata = (wizardData.metadata ?? {}) as WizardMetadata;
  const createdISO = toISODate(metadata.createdAt) ?? nowISO;
  const updatedISO = toISODate(metadata.lastModified) ?? nowISO;

  const bigIdea = typeof wizardData.bigIdea === 'string'
    ? { text: wizardData.bigIdea, tier: 'core' as Tier, confidence: 0.9 }
    : {
        text: extractText(wizardData.bigIdea),
        tier: coerceTier((wizardData.bigIdea as Record<string, unknown> | undefined)?.tier, 'core'),
        confidence: coerceConfidence((wizardData.bigIdea as Record<string, unknown> | undefined)?.confidence, 0.9)
      };

  const essentialQuestion = typeof wizardData.essentialQuestion === 'string'
    ? { text: wizardData.essentialQuestion, tier: 'scaffold' as Tier, confidence: 0.85 }
    : {
        text: extractText(wizardData.essentialQuestion),
        tier: coerceTier((wizardData.essentialQuestion as Record<string, unknown> | undefined)?.tier, 'scaffold'),
        confidence: coerceConfidence((wizardData.essentialQuestion as Record<string, unknown> | undefined)?.confidence, 0.85)
      };

  const learningGoals = mapTieredTexts(wizardData.learningGoals, 'core', 0.85);
  const successCriteria = mapTieredTexts(wizardData.successCriteria, 'scaffold', 0.8);

  type ContextWithTier = { tier?: Tier; confidence?: number };
  const contextSource = wizardData.projectContext as ContextWithTier | undefined;
  const context = {
    ...(wizardData.projectContext ?? {}),
    tier: coerceTier(contextSource?.tier, 'core'),
    confidence: coerceConfidence(contextSource?.confidence, 0.9)
  };

  const differentiation = wizardData.differentiation
    ? { ...wizardData.differentiation }
    : { ...defaultDifferentiation };

  const communications = wizardData.communications
    ? { ...wizardData.communications }
    : { ...defaultCommunications };

  const exhibition = wizardData.exhibition
    ? { ...wizardData.exhibition }
    : { ...defaultExhibition };

  const evidencePlan = wizardData.evidencePlan
    ? { ...wizardData.evidencePlan }
    : { ...defaultEvidencePlan };

  const risks = wizardData.riskManagement?.risks ? cloneArray(wizardData.riskManagement.risks) : [];
  const contingencies = wizardData.riskManagement?.contingencies
    ? cloneArray(wizardData.riskManagement.contingencies)
    : [];

  const project: ProjectV3 = {
    id: projectId,
    title: wizardData.projectTopic || 'Untitled Project',
    description: wizardData.projectTopic || '',
    tier: 'core',
    confidence: 0.85,
    context,
    bigIdea,
    essentialQuestion,
    learningGoals,
    successCriteria,
    standards,
    standardsCoverage,
    phases,
    milestones,
    artifacts,
    rubrics,
    roles,
    differentiation,
    scaffolds,
    communications,
    exhibition,
    evidencePlan,
    risks,
    contingencies,
    metadata: {
      created: createdISO,
      updated: updatedISO,
      version: '3.0',
      schemaVersion: 3,
      wizardVersion: '3.0',
      contentTiers: { core: 0, scaffold: 0, aspirational: 0 }
    }
  };

  project.metadata.contentTiers = computeTierCounts(project);

  return project;
}

export function validateProjectReferences(project: ProjectV3): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const phaseIds = new Set(project.phases.map(phase => phase.id));
  const milestoneIds = new Set(project.milestones.map(milestone => milestone.id));
  const rubricIds = new Set(project.rubrics.map(rubric => rubric.id));

  project.milestones.forEach(milestone => {
    if (!phaseIds.has(milestone.phaseId)) {
      errors.push(`Milestone "${milestone.name}" references non-existent phase: ${milestone.phaseId}`);
    }
  });

  project.artifacts.forEach(artifact => {
    if (artifact.milestoneId && !milestoneIds.has(artifact.milestoneId)) {
      errors.push(`Artifact "${artifact.name}" references non-existent milestone: ${artifact.milestoneId}`);
    }
    artifact.rubricIds.forEach(rubricId => {
      if (!rubricIds.has(rubricId)) {
        errors.push(`Artifact "${artifact.name}" references non-existent rubric: ${rubricId}`);
      }
    });
  });

  project.standardsCoverage.forEach(coverage => {
    if (!milestoneIds.has(coverage.milestoneId)) {
      errors.push(`Standards coverage references non-existent milestone: ${coverage.milestoneId}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
