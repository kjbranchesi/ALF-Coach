import type { PhaseKind } from '../../../types/showcaseV2';

export const PHASE_COLORS: Record<PhaseKind, string> = {
  Foundations: '#3b82f6',
  Planning: '#8b5cf6',
  FieldworkLoop: '#10b981',
  Build: '#f59e0b',
  Exhibit: '#ec4899',
  Extension: '#06b6d4'
};

export const ASSIGNMENT_COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#8b5cf6',
  C: '#10b981',
  D: '#f59e0b',
  E: '#ec4899',
  F: '#06b6d4'
};

export const getPhaseColor = (kind: PhaseKind): string => {
  return PHASE_COLORS[kind] || '#64748b';
};

export const getPhaseColorWithOpacity = (kind: PhaseKind, opacity: number): string => {
  const hex = PHASE_COLORS[kind] || '#64748b';
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alpha}`;
};

export const getAssignmentColor = (assignmentId: string): string => {
  const key = assignmentId?.[0]?.toUpperCase() ?? '';
  return ASSIGNMENT_COLORS[key] || '#64748b';
};
