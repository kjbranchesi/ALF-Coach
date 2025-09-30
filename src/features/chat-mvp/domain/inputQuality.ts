import type { Stage } from './stages';

export interface StageInputAssessment {
  ok: boolean;
  reason?: string;
  hint?: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const YES_NO_STARTERS = ['is', 'are', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should'];

export function assessStageInput(stage: Stage, raw: string): StageInputAssessment {
  const text = raw.trim();
  if (!text) {
    return { ok: false, reason: 'I didn’t catch anything yet.' };
  }

  switch (stage) {
    case 'BIG_IDEA': {
      if (text.includes('?')) {
        return { ok: false, reason: 'That reads like a question rather than a transferable concept.' };
      }
      if (wordCount(text) < 3 || text.length < 12) {
        return { ok: false, reason: 'The Big Idea should be a short, strong statement students can remember.' };
      }
      if (/^i (don['’]t|do not) know/i.test(text) || /^not sure/i.test(text)) {
        return { ok: false, reason: 'Let’s name a core insight students should carry with them.' };
      }
      return { ok: true };
    }
    case 'ESSENTIAL_QUESTION': {
      if (!text.endsWith('?')) {
        return { ok: false, reason: 'An Essential Question should end with a question mark.' };
      }
      const firstWord = text.split(/\s+/)[0]?.toLowerCase();
      if (YES_NO_STARTERS.includes(firstWord)) {
        return { ok: false, reason: 'Let’s avoid yes/no questions; aim for “How might…”, “What happens when…”, or similar.' };
      }
      if (text.length < 12) {
        return { ok: false, reason: 'We need a bit more detail so students know what to investigate.' };
      }
      return { ok: true };
    }
    case 'CHALLENGE': {
      const hasActionVerb = /(design|create|plan|develop|build|prototype|present|launch|produce|lead|organize|investigate|campaign)/i.test(text);
      const mentionsAudience = /(for|with|to)\s+(the\s+)?(community|families|peers|students|leaders|stakeholders|partners|audience|team|school|class)/i.test(text);
      if (!hasActionVerb || !mentionsAudience) {
        return {
          ok: false,
          reason: 'Let’s spell out the student action and who benefits (e.g., “design a wellness kit for ninth graders”).'
        };
      }
      return { ok: true };
    }
    case 'JOURNEY': {
      const phaseSeparators = /(->|→|phase|step|stage)/i.test(text) || text.split(/\n|,/).length >= 3;
      if (!phaseSeparators) {
        return { ok: false, reason: 'Outline the flow—3–4 phases or steps that guide students from discovery to showcase.' };
      }
      return { ok: true };
    }
    case 'DELIVERABLES': {
      const mentionsMilestone = /(milestone|checkpoint|draft|prototype|rehearsal|review)/i.test(text);
      const mentionsArtifact = /(artifact|product|presentation|campaign|portfolio|exhibit|prototype|report|plan)/i.test(text);
      const mentionsCriteria = /(criterion|criteria|rubric|evidence|quality)/i.test(text);
      if (!(mentionsMilestone || mentionsArtifact || mentionsCriteria)) {
        return {
          ok: false,
          reason: 'Describe milestones, final artifacts, or rubric criteria so we can see the path to mastery.'
        };
      }
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}
