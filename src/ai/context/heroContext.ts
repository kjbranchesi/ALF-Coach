import type { HeroProjectData } from '../../utils/hero/types';
import {
  listGeneratedHeroProjects,
  getGeneratedHeroProject
} from '../../data/generated/hero/loader';

export interface HeroPromptReference {
  id: string;
  title: string;
  subjects: string[];
  gradeLevel: string;
  duration: string;
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
  studentRole: string;
  authenticity: string;
  summary: string;
  milestoneHighlights: Array<{ id: string; title: string; description: string }>;
  assessmentFocus: string[];
  metricHighlights: Array<{ metric: string; target: string }>;
  impactSummary: string;
  resourceHighlights: string[];
}

interface HeroPromptCache {
  references: HeroPromptReference[];
  byId: Map<string, HeroPromptReference>;
  bySubject: Map<string, HeroPromptReference[]>;
  byGrade: Map<string, HeroPromptReference[]>;
}

export interface HeroPromptQueryOptions {
  limit?: number;
  subjects?: string[];
  gradeLevels?: string[];
  pinnedIds?: string[];
}

const SUBJECT_DELIMITERS = /[\s/&,+-]+/g;

function normaliseToken(value: string): string {
  return value.trim().toLowerCase();
}

function expandGradeTokens(gradeLevel: string): string[] {
  const tokens = new Set<string>();
  const normalised = normaliseToken(gradeLevel);
  tokens.add(normalised);
  if (normalised.includes('elementary')) tokens.add('elementary');
  if (normalised.includes('middle')) tokens.add('middle');
  if (normalised.includes('high')) tokens.add('high');
  if (normalised.includes('upper')) tokens.add('upper-secondary');
  if (normalised.includes('secondary')) tokens.add('secondary');
  if (normalised.includes('college') || normalised.includes('higher')) tokens.add('higher-ed');
  if (normalised.includes('adult')) tokens.add('adult');
  return Array.from(tokens);
}

function summariseProject(project: HeroProjectData): HeroPromptReference {
  const milestones = project.journey.milestones.slice(0, 3).map(milestone => ({
    id: milestone.id,
    title: milestone.title,
    description: milestone.description
  }));

  const assessments = project.assessment.rubric.slice(0, 3).map(rubric => rubric.category);

  const metricHighlights = project.impact?.metrics?.slice(0, 3).map(metric => ({
    metric: metric.metric,
    target: metric.target
  })) ?? [];

  const resourceHighlights = project.resources?.required?.slice(0, 2).map(resource => {
    const label = resource.category;
    const sample = resource.items?.[0];
    return sample ? `${label}: ${sample}` : label;
  }) ?? [];

  const impactSummary = project.impact?.community?.slice(0, 2).join(' ') ||
    project.impact?.personal?.slice(0, 2).join(' ') || '';

  return {
    id: project.id,
    title: project.title,
    subjects: project.subjects,
    gradeLevel: project.gradeLevel,
    duration: project.duration,
    bigIdea: project.bigIdea.statement,
    essentialQuestion: project.bigIdea.essentialQuestion,
    challenge: project.bigIdea.challenge,
    studentRole: project.context.studentRole,
    authenticity: project.context.authenticity,
    summary: project.courseAbstract.overview,
    milestoneHighlights: milestones,
    assessmentFocus: assessments,
    metricHighlights,
    impactSummary,
    resourceHighlights
  };
}

let heroPromptCache: HeroPromptCache | null = null;

function ensureCache(): HeroPromptCache {
  if (heroPromptCache) {
    return heroPromptCache;
  }

  const manifest = listGeneratedHeroProjects();
  const references = manifest
    .map(entry => getGeneratedHeroProject(entry.id))
    .filter((project): project is HeroProjectData => Boolean(project))
    .map(project => summariseProject(project));

  const byId = new Map<string, HeroPromptReference>();
  const bySubject = new Map<string, HeroPromptReference[]>();
  const byGrade = new Map<string, HeroPromptReference[]>();

  for (const reference of references) {
    byId.set(reference.id, reference);

    reference.subjects.forEach(subject => {
      const subjectTokens = subject.split(SUBJECT_DELIMITERS).map(normaliseToken).filter(Boolean);
      subjectTokens.forEach(token => {
        const list = bySubject.get(token) ?? [];
        list.push(reference);
        bySubject.set(token, list);
      });
    });

    expandGradeTokens(reference.gradeLevel).forEach(token => {
      const list = byGrade.get(token) ?? [];
      list.push(reference);
      byGrade.set(token, list);
    });
  }

  heroPromptCache = { references, byId, bySubject, byGrade };
  return heroPromptCache;
}

function addUnique(accumulator: HeroPromptReference[], candidates: HeroPromptReference[]) {
  for (const candidate of candidates) {
    if (!accumulator.some(existing => existing.id === candidate.id)) {
      accumulator.push(candidate);
    }
  }
}

export function queryHeroPromptReferences(options: HeroPromptQueryOptions = {}): HeroPromptReference[] {
  const { limit = 6, subjects = [], gradeLevels = [], pinnedIds = [] } = options;
  const cache = ensureCache();

  if (limit <= 0) {
    return [];
  }

  const results: HeroPromptReference[] = [];

  pinnedIds.forEach(id => {
    const ref = cache.byId.get(id);
    if (ref) addUnique(results, [ref]);
  });

  const normalisedSubjects = subjects.map(normaliseToken).filter(Boolean);
  for (const subject of normalisedSubjects) {
    const references = cache.bySubject.get(subject);
    if (references) addUnique(results, references);
  }

  const normalisedGrades = gradeLevels.flatMap(expandGradeTokens).map(normaliseToken).filter(Boolean);
  for (const grade of normalisedGrades) {
    const references = cache.byGrade.get(grade);
    if (references) addUnique(results, references);
  }

  if (results.length < limit) {
    addUnique(results, cache.references);
  }

  return results.slice(0, limit);
}

export function getHeroPromptReferences(limit = 6): HeroPromptReference[] {
  return queryHeroPromptReferences({ limit });
}

export function getHeroPromptReferenceById(id: string): HeroPromptReference | undefined {
  const cache = ensureCache();
  return cache.byId.get(id);
}

export function invalidateHeroPromptCache() {
  heroPromptCache = null;
}
