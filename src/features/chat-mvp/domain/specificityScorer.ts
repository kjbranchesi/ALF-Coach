import type { CapturedData } from './stages';
import { resolveGradeBand, type GradeBandKey } from '../../../ai/gradeBandRules';

export type IdeationSlot = 'audience' | 'deliverable' | 'metric';

function hasMetric(text: string): boolean {
  // Simple heuristics: numbers, %, per week, per month, increase/decrease verbs
  return /(\d+\s*%|per\s*(week|month)|reduce|increase|by\s*\d+|target|measure|baseline|goal)/i.test(text);
}

function hasAudience(text: string, band: GradeBandKey | null): boolean {
  const common = [
    'director', 'manager', 'council', 'board', 'neighbors', 'families', 'students', 'classmates',
    'principal', 'librarian', 'custodian', 'coordinator', 'club', 'committee', 'agency', 'department',
  ];
  const bandHints: Record<GradeBandKey, string[]> = {
    'K-2': ['families', 'classmates', 'school', 'grade'],
    '3-5': ['families', 'classmates', 'school', 'grade', 'librarian', 'custodian'],
    '6-8': ['student government', 'council', 'principal', 'community'],
    '9-12': ['city council', 'department', 'nonprofit', 'clients']
  };
  const tokens = text.toLowerCase();
  if (common.some(w => tokens.includes(w))) {return true;}
  if (band && bandHints[band].some(w => tokens.includes(w))) {return true;}
  // Proper noun heuristic: capitalized word pairs (e.g., "Facilities Director")
  return /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text);
}

function hasDeliverable(text: string, band: GradeBandKey | null): boolean {
  const nouns = [
    'campaign', 'proposal', 'prototype', 'exhibit', 'plan', 'podcast', 'documentary', 'toolkit', 'portfolio',
    'poster', 'video', 'presentation', 'letter', 'report', 'pitch', 'app', 'model', 'storybook'
  ];
  const tokens = text.toLowerCase();
  if (nouns.some(n => tokens.includes(n))) {return true;}
  if (band === 'K-2') {
    return /(poster|storybook|gallery|show|song|model|class museum)/i.test(tokens);
  }
  if (band === '3-5') {
    return /(poster|video|prototype|installation|how-?to|guide|slideshow)/i.test(tokens);
  }
  return false;
}

export function scoreIdeationSpecificity(stage: 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE', captured: CapturedData, wizard: { gradeLevel?: string | null }): { score: number; missing: IdeationSlot[] } {
  const band = resolveGradeBand(wizard.gradeLevel);
  let score = 0;
  const missing: IdeationSlot[] = [];

  if (stage === 'BIG_IDEA') {
    const t = captured.ideation.bigIdea?.trim() || '';
    if (t.length >= 6) {score += 30;}
    if (t.length >= 12) {score += 20;}
    if (!/[.?!]$/.test(t) && t.split(/\s+/).length <= 15) {score += 15;}
    return { score: Math.min(100, score), missing };
  }

  if (stage === 'ESSENTIAL_QUESTION') {
    const q = captured.ideation.essentialQuestion?.trim() || '';
    if (/^(how|what|why)\b/i.test(q)) {score += 30;}
    if (q.length >= 12) {score += 20;}
    if (!/\?$/.test(q)) { /* Encourage question form but do not penalize harshly */ } else {score += 10;}
    return { score: Math.min(100, score), missing };
  }

  // CHALLENGE slot analysis
  const c = captured.ideation.challenge?.trim() || '';
  const audience = hasAudience(c, band);
  const deliverable = hasDeliverable(c, band);
  const metric = hasMetric(c);

  if (audience) {score += 30;} else {missing.push('audience');}
  if (deliverable) {score += 30;} else {missing.push('deliverable');}
  if (metric) {score += 30;} else {missing.push('metric');}
  // Basic length bonus
  if (c.length >= 20) {score += 10;}

  return { score: Math.min(100, score), missing };
}

export function nextQuestionFor(stage: 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE', missing: IdeationSlot[], band: GradeBandKey | null): { question: string; chips: string[] } | null {
  if (stage !== 'CHALLENGE' || missing.length === 0) {return null;}
  const m = missing[0];
  if (m === 'audience') {
    const chips = band === 'K-2'
      ? ['Families', 'Our grade level', 'Classmates']
      : band === '3-5'
        ? ['Families', 'School librarian', 'Custodian team']
        : band === '6-8'
          ? ['Student government', 'Facilities manager', 'PTA']
          : ['Facilities director', 'City council committee', 'Local nonprofit partner'];
    return { question: 'Who is the most specific audience that benefits?', chips };
  }
  if (m === 'deliverable') {
    const chips = band === 'K-2'
      ? ['Class museum', 'Storybook', 'Photo gallery']
      : band === '3-5'
        ? ['Explainer poster', 'How-to guide', 'Prototype']
        : band === '6-8'
          ? ['Video PSA', 'Prototype', 'Action plan']
          : ['Policy brief', 'Prototype', 'Client presentation'];
    return { question: 'What tangible thing will students produce?', chips };
  }
  if (m === 'metric') {
    const chips = band === 'K-2'
      ? ['Count X for 3 days', 'Share with 2 classes', '3-photo reflection']
      : band === '3-5'
        ? ['Survey 30 peers', 'Reduce waste by 15%', '2 feedback cycles']
        : band === '6-8'
          ? ['Reduce by 20%', 'Reach 100 viewers', 'Weekly data log']
          : ['Reduce by 30%', 'Reach 200+ audience', 'Pre/post metric'];
    return { question: 'How will success be measured?', chips };
  }
  return null;
}

