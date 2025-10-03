// stageTransitions.ts
// Pure helpers to support stage transition logic in chat without touching UI state.

export function isProgressSignal(input: string): boolean {
  const signals = [
    'sounds good','let\'s continue','what\'s next','next step',
    'i\'m ready','that works','perfect','great','yes, let\'s',
    'let\'s move on','i like that','that\'s it','exactly'
  ];
  const v = input.toLowerCase();
  return signals.some(s => v.includes(s));
}

export function isConfusedSignal(input: string): boolean {
  const patterns = [
    'not sure','don\'t understand','confused','what do you mean',
    'can you explain','help me','i don\'t know','unclear','lost'
  ];
  const v = input.toLowerCase();
  return patterns.some(p => v.includes(p));
}

export function hasJourneyContent(input: string): boolean {
  const keywords = ['research','analyze','brainstorm','prototype','create','test','evaluate','phase','week','timeline'];
  const v = input.toLowerCase();
  return keywords.some(k => v.includes(k)) && input.length > 50;
}

export function hasDeliverablesContent(input: string): boolean {
  const keywords = ['presentation','portfolio','prototype','report','assessment','rubric','showcase','exhibition'];
  const v = input.toLowerCase();
  return keywords.some(k => v.includes(k)) && input.length > 50;
}

export function nextJourneyAwaitingType(currentType: string): string | null {
  const seq = [
    'journey.analyze.goal',
    'journey.analyze.activity',
    'journey.analyze.output',
    'journey.analyze.duration',
    'journey.brainstorm.goal',
    'journey.brainstorm.activity',
    'journey.brainstorm.output',
    'journey.brainstorm.duration',
    'journey.prototype.goal',
    'journey.prototype.activity',
    'journey.prototype.output',
    'journey.prototype.duration',
    'journey.evaluate.goal',
    'journey.evaluate.activity',
    'journey.evaluate.output',
    'journey.evaluate.duration'
  ];
  const idx = seq.indexOf(currentType);
  if (idx >= 0 && idx < seq.length - 1) {return seq[idx + 1];}
  return null;
}

export function nextDeliverablesAwaitingType(currentType: string): string | null {
  const seq = [
    'deliverables.milestones.0',
    'deliverables.milestones.1',
    'deliverables.milestones.2',
    'deliverables.rubric.criteria',
    'deliverables.impact.audience',
    'deliverables.impact.method'
  ];
  const idx = seq.indexOf(currentType);
  if (idx >= 0 && idx < seq.length - 1) {return seq[idx + 1];}
  return null;
}

