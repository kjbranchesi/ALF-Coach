import type { Stage } from './stages';
import { getPhaseCandidatesForAssessment } from './stages';

export interface StageInputAssessment {
  ok: boolean;
  reason?: string;
  hint?: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const YES_NO_STARTERS = ['is', 'are', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should'];

const ACTION_VERB_PATTERN = /(design|create|plan|develop|build|prototype|present|launch|produce|lead|organize|investigate|campaign|draft|compose|curate|host|facilitate|engineer|assemble|research|map|audit|advocate|coach|mentor|analyze|pitch|propose|co-create|co\s?design|run|deliver|craft|stage|document|mobilize|coordinate|model)/i;

const AUTHENTIC_AUDIENCE_PATTERN = /(community|famil(?:y|ies)|parents?|guardians?|peers?|students?|leaders?|decision\s?makers?|city\s?council|school\s?board|board|committee|panel|reviewers?|judges?|residents?|neighbors?|business(?:es)?|entrepreneurs?|partners?|stakeholders?|nonprofit|ngo|agency|department|clinic|hospital|health\s?center|youth|teens?|teenagers?|ninth\s?graders?|9th\s?graders?|tenth\s?graders?|10th\s?graders?|eleventh\s?graders?|11th\s?graders?|twelfth\s?graders?|12th\s?graders?|freshmen?|sophomores?|juniors?|seniors?|alumni|teachers?|staff|administrators?|principal|district|public|audience|community\s?members?|local\s?leaders?|policy\s?makers?|council(?:ors)?|officials?|experts?|caregivers?|volunteers?|visitors?|guests?|clients?|customers?|users?|end[- ]?users?)/i;

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
      const hasActionVerb = ACTION_VERB_PATTERN.test(text);
      if (!hasActionVerb) {
        return {
          ok: false,
          reason: 'Name the student action—verbs like design, build, launch, or present clarify what students do.'
        };
      }
      const mentionsAudience = /(for|with|to)\s+[^.,;!?]+/i.test(text) && AUTHENTIC_AUDIENCE_PATTERN.test(text);
      if (!mentionsAudience) {
        return {
          ok: true,
          hint: 'Consider adding who benefits (families, city council, community partners) so the challenge feels authentic.'
        };
      }
      return { ok: true };
    }
    case 'JOURNEY': {
      const candidatePhases = getPhaseCandidatesForAssessment(text);
      if (candidatePhases.length < 3) {
        return {
          ok: false,
          reason: 'Outline the flow—aim for at least three phases so students can investigate, build, and share.'
        };
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
