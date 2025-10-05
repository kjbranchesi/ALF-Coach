import type { AssignmentCard, ProjectShowcaseV2, WeekCard } from '../src/types/showcaseV2';
import { getProjectV2, listProjectsV2 } from '../src/utils/showcaseV2-registry';

export interface LoadedProject {
  id: string;
  path: string;
  project: ProjectShowcaseV2;
}

const WEAK_PREFIXES = [
  'work on',
  'work',
  'research',
  'explore',
  'discuss',
  'learn about',
  'learn',
  'help',
  'support',
  'look up',
  'look at',
  'make',
  'start',
  'begin',
  'finish',
  'complete',
  'do',
  'watch',
  'prepare',
  'plan',
  'practice'
];

const STRONG_VERBS = new Set([
  'analyze',
  'assess',
  'audit',
  'build',
  'co-design',
  'communicate',
  'compose',
  'construct',
  'create',
  'critique',
  'curate',
  'design',
  'develop',
  'draft',
  'engineer',
  'evaluate',
  'investigate',
  'map',
  'model',
  'plan',
  'prototype',
  'synthesize',
  'test'
]);

const STUDENT_VOICE_PREFIXES = ['i ', 'we ', 'our ', 'my ', 'team '];

export function getAllProjects(): LoadedProject[] {
  return listProjectsV2().map(({ id }) => {
    const project = getProjectV2(id);
    if (!project) {
      throw new Error(`Project not found for id ${id}`);
    }
    return {
      id,
      path: `src/data/showcaseV2/${id}.showcase.ts`,
      project
    };
  });
}

export function cleanText(value: string): string {
  return value.replace(/^[-•\u2022\s]+/, '').trim();
}

export function toLower(value: string): string {
  return cleanText(value).toLowerCase();
}

export function wordCount(value: string): number {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return 0;
  }
  return cleaned.split(/\s+/).length;
}

export function isWeakDirection(value: string): boolean {
  const lower = toLower(value);
  return WEAK_PREFIXES.some(prefix => lower.startsWith(prefix));
}

export function hasStrongOutcomeVerb(value: string): boolean {
  const lower = toLower(value);
  if (!lower) {
    return false;
  }
  const firstWord = lower.split(/\s+/)[0];
  return STRONG_VERBS.has(firstWord);
}

export function isStudentVoice(value: string): boolean {
  const lower = toLower(value);
  return STUDENT_VOICE_PREFIXES.some(prefix => lower.startsWith(prefix));
}

export function assignmentsWithAI(assignments: AssignmentCard[]): number {
  return assignments.filter(assignment => Boolean(assignment.aiOptional)).length;
}

export function weeksWithCheckpoint(weeks: WeekCard[]): number {
  return weeks.filter(week => Array.isArray(week.checkpoint) && week.checkpoint.length > 0).length;
}

export function ratio(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return part / total;
}

export function percentage(part: number, total: number): number {
  return Math.round(ratio(part, total) * 100);
}

export function uniqueAssignmentIds(assignments: AssignmentCard[]): Set<string> {
  return new Set(assignments.map(assignment => assignment.id));
}

export function referencesUnknownAssignments(week: WeekCard, knownIds: Set<string>): string[] {
  if (!week.assignments || week.assignments.length === 0) {
    return [];
  }
  return week.assignments.filter(id => !knownIds.has(id));
}

export function successCriteriaNotStudentVoice(assignments: AssignmentCard[]): Array<{ assignmentId: string; value: string }>
{
  const issues: Array<{ assignmentId: string; value: string }> = [];
  assignments.forEach(assignment => {
    assignment.successCriteria.forEach(value => {
      if (!isStudentVoice(value)) {
        issues.push({ assignmentId: assignment.id, value });
      }
    });
  });
  return issues;
}

export function weakDirections(assignments: AssignmentCard[]): Array<{ assignmentId: string; value: string }>
{
  const issues: Array<{ assignmentId: string; value: string }> = [];
  assignments.forEach(assignment => {
    assignment.studentDirections.forEach(value => {
      if (isWeakDirection(value)) {
        issues.push({ assignmentId: assignment.id, value });
      }
    });
  });
  return issues;
}

export function weakWeekBullets(weeks: WeekCard[]): Array<{ weekLabel: string; role: 'teacher' | 'students'; value: string }>
{
  const issues: Array<{ weekLabel: string; role: 'teacher' | 'students'; value: string }> = [];
  weeks.forEach(week => {
    week.teacher.forEach(value => {
      if (isWeakDirection(value)) {
        issues.push({ weekLabel: week.weekLabel, role: 'teacher', value });
      }
    });
    week.students.forEach(value => {
      if (isWeakDirection(value)) {
        issues.push({ weekLabel: week.weekLabel, role: 'students', value });
      }
    });
  });
  return issues;
}

export function bulletTooLong(values: string[], limit: number): string[] {
  return values.filter(value => wordCount(value) > limit);
}

export function totalWords(values: string[]): number {
  return values.reduce((sum, value) => sum + wordCount(value), 0);
}
