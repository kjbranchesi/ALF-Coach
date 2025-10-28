// Pure, no-side-effect completeness helpers for stage UIs

export function isIdeationUIComplete(bigIdea: string, essentialQuestion: string, challenge: string): boolean {
  return Boolean(bigIdea?.trim() && essentialQuestion?.trim() && challenge?.trim());
}

export interface JourneyPhaseLike { name?: string }
export function isJourneyUIComplete(phases: JourneyPhaseLike[]): boolean {
  const hasMin = Array.isArray(phases) && phases.length >= 3;
  const named = (phases || []).filter(p => (p?.name || '').trim()).length >= 3;
  return hasMin && named;
}

export interface NamedItemLike { name?: string }
export interface CriterionLike { text?: string }
export function isDeliverablesUIComplete(
  milestones: NamedItemLike[],
  artifacts: NamedItemLike[],
  criteria: CriterionLike[]
): boolean {
  const m = (milestones || []).filter(x => (x?.name || '').trim()).length;
  const a = (artifacts || []).filter(x => (x?.name || '').trim()).length;
  const c = (criteria || []).filter(x => (x?.text || '').trim()).length;
  return m >= 3 && a >= 1 && c >= 3;
}

