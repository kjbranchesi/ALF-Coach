import type { WizardDataV3 } from '../features/wizard/wizardSchema';
import type { ProjectV3 } from '../types/alf';

export type PartialWizardData = Partial<WizardDataV3> | null | undefined;
export type PartialProjectData = Partial<ProjectV3> | null | undefined;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => clone(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    result[key] = clone(entry);
  });
  return result as T;
}

function deepMergeRecords(
  base: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  const target = base ? clone(base) : {};

  Object.entries(incoming).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      target[key] = clone(value);
      return;
    }

    if (isPlainObject(value)) {
      const existing = isPlainObject(target[key]) ? (target[key] as Record<string, unknown>) : undefined;
      target[key] = deepMergeRecords(existing, value);
      return;
    }

    target[key] = value;
  });

  return target;
}

export function mergeWizardData(
  base: PartialWizardData,
  incoming: PartialWizardData
): Partial<WizardDataV3> | null {
  if (!base && !incoming) {
    return null;
  }
  if (!base) {
    return incoming ? clone(incoming) : null;
  }
  if (!incoming) {
    return clone(base);
  }

  return deepMergeRecords(base as Record<string, unknown>, incoming as Record<string, unknown>) as Partial<WizardDataV3>;
}

export function mergeProjectData(
  base: PartialProjectData,
  incoming: PartialProjectData
): Partial<ProjectV3> | null {
  if (!base && !incoming) {
    return null;
  }
  if (!base) {
    return incoming ? clone(incoming) : null;
  }
  if (!incoming) {
    return clone(base);
  }

  return deepMergeRecords(base as Record<string, unknown>, incoming as Record<string, unknown>) as Partial<ProjectV3>;
}

export function mergeCapturedData(
  base: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!base && !incoming) {
    return null;
  }
  if (!base) {
    return incoming ? clone(incoming) : null;
  }
  if (!incoming) {
    return clone(base);
  }

  return deepMergeRecords(base, incoming);
}
