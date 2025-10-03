import type { ShowcaseProject } from '../../types/showcase';
import type { ProjectV3 } from '../../types/alf';
import type { UnifiedProject, AssignmentCard } from '../../types/project';

const SCHEMA_VERSION = 1;

const now = () => new Date().toISOString();

const ensureAssignments = (assignments?: AssignmentCard[]): AssignmentCard[] => {
  if (!Array.isArray(assignments)) {return [];}
  return assignments.map((assignment, index) => ({
    ...assignment,
    id: assignment.id || `A${index + 1}`,
  }));
};

export const fromShowcase = (showcase: ShowcaseProject): UnifiedProject => {
  return {
    meta: showcase.meta,
    microOverview: showcase.microOverview,
    quickSpark: showcase.quickSpark,
    outcomeMenu: showcase.outcomeMenu,
    assignments: ensureAssignments(showcase.assignments),
    communityJustice: showcase.communityJustice,
    accessibilityUDL: showcase.accessibilityUDL,
    sharePlan: showcase.sharePlan,
    advanced: undefined,
    metadata: {
      variant: 'showcase',
      schemaVersion: SCHEMA_VERSION,
      createdAt: now(),
      updatedAt: now(),
    },
  };
};

export const toShowcase = (unified: UnifiedProject): ShowcaseProject => {
  return {
    meta: unified.meta,
    microOverview: unified.microOverview,
    quickSpark: unified.quickSpark,
    outcomeMenu: unified.outcomeMenu,
    assignments: ensureAssignments(unified.assignments),
    communityJustice: unified.communityJustice,
    accessibilityUDL: unified.accessibilityUDL,
    sharePlan: unified.sharePlan,
    gallery: undefined,
    polishFlags: undefined,
  };
};

const fallbackString = (value: unknown, defaultValue = ''): string => {
  if (typeof value === 'string') {return value;}
  return defaultValue;
};

export const fromV3 = (project: ProjectV3): UnifiedProject => {
  const microOverview = project.description?.slice(0, 400) || project.summary || '';
  return {
    meta: {
      id: project.id || `legacy-${Date.now().toString(36)}`,
      title: project.title || 'Legacy Project',
      tagline: project.tagline,
      subjects: project.subjects || [],
      gradeBands: project.grades || [],
      duration: project.duration || 'Varies',
      image: project.image,
      tags: project.tags || [],
    },
    microOverview: {
      microOverview,
      longOverview: project.description,
    },
    quickSpark: undefined,
    outcomeMenu: project.deliverables
      ? {
          core: project.deliverables.core || 'Project outcome',
          choices: project.deliverables.options || [],
          audiences: project.deliverables.audiences || [],
        }
      : undefined,
    assignments: ensureAssignments(project.assignments as AssignmentCard[] | undefined),
    communityJustice: project.communityJustice
      ? {
          guidingQuestion: fallbackString(project.communityJustice.guidingQuestion, 'How does this matter here?'),
          stakeholders: project.communityJustice.stakeholders || [],
          ethicsNotes: project.communityJustice.ethicsNotes || [],
        }
      : undefined,
    accessibilityUDL: project.accessibilityUDL,
    sharePlan: project.sharePlan,
    advanced: {
      ideation: project.ideation,
      journey: project.journey,
      deliverables: project.deliverables,
    },
    metadata: {
      variant: 'legacy',
      schemaVersion: SCHEMA_VERSION,
      createdAt: now(),
      updatedAt: now(),
    },
  };
};

export const toV3 = (unified: UnifiedProject): ProjectV3 => {
  return {
    id: unified.meta.id,
    title: unified.meta.title,
    tagline: unified.meta.tagline,
    summary: unified.microOverview.microOverview,
    description: unified.microOverview.longOverview,
    subjects: unified.meta.subjects,
    grades: unified.meta.gradeBands,
    duration: unified.meta.duration,
    image: unified.meta.image,
    tags: unified.meta.tags,
    deliverables: unified.outcomeMenu
      ? {
          core: unified.outcomeMenu.core,
          options: unified.outcomeMenu.choices || [],
          audiences: unified.outcomeMenu.audiences || [],
        }
      : undefined,
    assignments: ensureAssignments(unified.assignments) as unknown as ProjectV3['assignments'],
    communityJustice: unified.communityJustice,
    accessibilityUDL: unified.accessibilityUDL,
    sharePlan: unified.sharePlan,
    ideation: unified.advanced?.ideation,
    journey: unified.advanced?.journey,
    blueprintId: undefined,
    createdAt: unified.metadata.createdAt,
    updatedAt: unified.metadata.updatedAt,
  } as ProjectV3;
};

export const deriveSeedFields = (unified: UnifiedProject) => {
  const bigIdea = unified.microOverview.microOverview || unified.quickSpark?.hooks?.[0] || unified.meta.title;
  const essentialQuestion = unified.communityJustice?.guidingQuestion || unified.quickSpark?.hooks?.[1] || '';
  const challenge = unified.outcomeMenu?.core || unified.quickSpark?.hooks?.[2] || unified.meta.tagline || '';

  return {
    bigIdea,
    essentialQuestion,
    challenge,
  };
};
