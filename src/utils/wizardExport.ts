import { evaluateWizardCompleteness, type WizardCompletenessResult } from './completeness/wizardCompleteness';
import type { WizardDataV3 } from '../features/wizard/wizardSchema';

export interface SnapshotMetrics {
  learningGoals: number;
  successCriteria: number;
  phases: number;
  milestones: number;
  artifacts: number;
  rubrics: number;
  roles: number;
  scaffolds: number;
  checkpoints: number;
  risks: number;
}

export interface WizardSnapshot {
  version: string;
  generatedAt: string;
  completeness: WizardCompletenessResult['summary'];
  metrics: SnapshotMetrics;
  wizardData: Partial<WizardDataV3>;
}

function calculateMetrics(data: Partial<WizardDataV3>): SnapshotMetrics {
  return {
    learningGoals: data.learningGoals?.length ?? 0,
    successCriteria: data.successCriteria?.length ?? 0,
    phases: data.phases?.length ?? 0,
    milestones: data.milestones?.length ?? 0,
    artifacts: data.artifacts?.length ?? 0,
    rubrics: data.rubrics?.length ?? 0,
    roles: data.studentRoles?.length ?? 0,
    scaffolds: data.scaffolds?.length ?? 0,
    checkpoints: data.evidencePlan?.checkpoints?.length ?? 0,
    risks: data.riskManagement?.risks?.length ?? 0
  };
}

export function buildWizardSnapshot(
  wizardData: Partial<WizardDataV3>,
  overrides?: {
    completeness?: WizardCompletenessResult['summary'];
    metrics?: SnapshotMetrics;
  }
): WizardSnapshot {
  const completeness = overrides?.completeness ?? evaluateWizardCompleteness(wizardData).summary;
  const metrics = overrides?.metrics ?? calculateMetrics(wizardData);

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    completeness,
    metrics,
    wizardData
  };
}

export function downloadWizardSnapshot(snapshot: WizardSnapshot, filename = 'alf-wizard-snapshot.json') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Downloads are only available in a browser context.');
  }

  const payload = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildSnapshotSharePreview(snapshot: WizardSnapshot): string {
  const { completeness, metrics, wizardData } = snapshot;
  const lines: string[] = [
    'ALF Wizard Snapshot',
    `Generated: ${snapshot.generatedAt}`,
    '',
    `Overall readiness: ${completeness.overall}% (core ${completeness.core}%, context ${completeness.context}%, progressive ${completeness.progressive}%)`,
    '',
    'Highlights:',
    `• Project topic: ${wizardData.projectTopic || '—'}`,
    `• Big idea: ${wizardData.bigIdea || '—'}`,
    `• Essential question: ${wizardData.essentialQuestion || '—'}`,
    '',
    'Counts:',
    `• Learning goals: ${metrics.learningGoals}`,
    `• Success criteria: ${metrics.successCriteria}`,
    `• Phases / milestones: ${metrics.phases} / ${metrics.milestones}`,
    `• Artifacts / rubrics: ${metrics.artifacts} / ${metrics.rubrics}`,
    `• Roles / scaffolds: ${metrics.roles} / ${metrics.scaffolds}`,
    `• Evidence checkpoints: ${metrics.checkpoints}`,
    `• Risk scenarios: ${metrics.risks}`
  ];

  return lines.join('\n');
}

export async function copySnapshotPreview(snapshot: WizardSnapshot): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available.');
  }

  const preview = buildSnapshotSharePreview(snapshot);
  await navigator.clipboard.writeText(preview);
}

export function getSnapshotMetrics(data: Partial<WizardDataV3>): SnapshotMetrics {
  return calculateMetrics(data);
}
