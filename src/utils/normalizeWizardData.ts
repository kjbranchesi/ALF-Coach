import { EntryPoint, type WizardData } from '../features/wizard/wizardSchema';

function coerceDuration(value: any): WizardData['duration'] {
  if (value === 'short' || value === 'medium' || value === 'long') return value;
  const v = String(value || '').toLowerCase();
  if (!v) return 'medium';
  // Heuristics: map human text to buckets
  if (/(^|\b)(1|2|two|one)[-\s]?week/.test(v) || /sprint|mini/.test(v)) return 'short';
  if (/(semester|term|12\+|10\+|quarter)/.test(v)) return 'long';
  if (/(3|4|5|6|7|8)[-\s]?week/.test(v)) return 'medium';
  return 'medium';
}

function coerceSubjects(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function coerceMaterials(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const parts: string[] = [];
    if (Array.isArray(value.readings) && value.readings.length) parts.push(`readings: ${value.readings.join(', ')}`);
    if (Array.isArray(value.tools) && value.tools.length) parts.push(`tools: ${value.tools.join(', ')}`);
    if (typeof value.userProvided === 'string' && value.userProvided) parts.push(value.userProvided);
    return parts.join(' | ');
  }
  return '';
}

export function normalizeWizardDataToV2(input: any): WizardData {
  const data = input || {};

  const subjects = coerceSubjects(data.subjects ?? data.subject);
  const primarySubject = data.primarySubject || subjects[0] || '';
  const gradeLevel = data.gradeLevel || data.ageGroup || data.students || '';
  const duration = coerceDuration(data.duration || data.scope || 'medium');
  const entryPoint: EntryPoint =
    data.entryPoint === EntryPoint.MATERIALS_FIRST || data.entryPoint === EntryPoint.EXPLORE
      ? data.entryPoint
      : EntryPoint.LEARNING_GOAL;

  return {
    entryPoint,
    problemContext: data.problemContext,
    projectTopic: String(data.projectTopic || ''),
    learningGoals: String(data.learningGoals || ''),
    materials: coerceMaterials(data.materials || data.resources),
    subjectConnections: Array.isArray(data.subjectConnections) ? data.subjectConnections : undefined,
    subjects,
    primarySubject,
    gradeLevel: String(gradeLevel),
    duration,
    specialRequirements: typeof data.specialRequirements === 'string' ? data.specialRequirements : undefined,
    specialConsiderations: typeof data.specialConsiderations === 'string' ? data.specialConsiderations : undefined,
    pblExperience: data.pblExperience || 'some',
    metadata: {
      createdAt: data.metadata?.createdAt ? new Date(data.metadata.createdAt) : new Date(),
      lastModified: new Date(),
      version: '2.0',
      migrationApplied: true,
      wizardCompleted: Boolean(data.metadata?.wizardCompleted || data.wizardCompleted),
      skippedFields: Array.isArray(data.metadata?.skippedFields) ? data.metadata.skippedFields : []
    },
    conversationState: {
      phase: data.conversationState?.phase || 'handoff',
      contextCompleteness: data.conversationState?.contextCompleteness || { core: 0, context: 0, progressive: 0 },
      gatheredContext: data.conversationState?.gatheredContext || {},
      lastContextUpdate: data.conversationState?.lastContextUpdate
        ? new Date(data.conversationState.lastContextUpdate)
        : undefined
    }
  } as WizardData;
}

