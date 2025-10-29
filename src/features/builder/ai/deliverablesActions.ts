/**
 * Deliverables Stage AI Actions
 *
 * Lazy-loaded AI logic for Deliverables stage Quick Actions and suggestions.
 * Imported only when user interacts with AI features.
 */

import type { CapturedData, WizardContext } from '../../chat-mvp/domain/stages';

interface Context {
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  wizard?: WizardContext;
  phases?: Array<{ name: string; activities?: string[] }>;
}

export interface Milestone {
  id: string;
  name: string;
}

export interface Artifact {
  id: string;
  name: string;
}

/**
 * Suggest 3+ milestones based on journey phases and context
 */
export async function suggestMilestones(context: Context): Promise<Milestone[]> {
  const { generateSmartDeliverables } = await import('../../chat-mvp/domain/deliverablesMicroFlow');
  const { generateSmartDeliverablesAI } = await import('../../chat-mvp/domain/deliverablesAI');

  const captured: CapturedData = {
    ideation: {
      bigIdea: context.bigIdea || '',
      essentialQuestion: context.essentialQuestion || '',
      challenge: context.challenge || ''
    },
    journey: {
      phases: (context.phases || []).map((p, idx) => ({
        id: `p${idx + 1}`,
        name: p.name,
        activities: p.activities || []
      }))
    }
  } as CapturedData;

  const wizard = context.wizard || {} as WizardContext;

  // Try AI first
  const aiResult = await generateSmartDeliverablesAI(captured, wizard);
  if (aiResult?.suggestedMilestones) {
    return aiResult.suggestedMilestones.map((name, idx) => ({
      id: `m${Date.now()}-${idx}`,
      name
    }));
  }

  // Fallback to smart defaults
  const smartResult = generateSmartDeliverables(captured, wizard);
  return smartResult.suggestedMilestones.map((name, idx) => ({
    id: `m${Date.now()}-${idx}`,
    name
  }));
}

/**
 * Suggest 1+ artifacts based on project context
 */
export async function suggestArtifacts(context: Context): Promise<Artifact[]> {
  const { generateSmartDeliverables } = await import('../../chat-mvp/domain/deliverablesMicroFlow');
  const { generateSmartDeliverablesAI } = await import('../../chat-mvp/domain/deliverablesAI');

  const captured: CapturedData = {
    ideation: {
      bigIdea: context.bigIdea || '',
      essentialQuestion: context.essentialQuestion || '',
      challenge: context.challenge || ''
    },
    journey: {
      phases: (context.phases || []).map((p, idx) => ({
        id: `p${idx + 1}`,
        name: p.name,
        activities: p.activities || []
      }))
    }
  } as CapturedData;

  const wizard = context.wizard || {} as WizardContext;

  // Try AI first
  const aiResult = await generateSmartDeliverablesAI(captured, wizard);
  if (aiResult?.suggestedArtifacts) {
    return aiResult.suggestedArtifacts.map((name, idx) => ({
      id: `a${Date.now()}-${idx}`,
      name
    }));
  }

  // Fallback to smart defaults
  const smartResult = generateSmartDeliverables(captured, wizard);
  return smartResult.suggestedArtifacts.map((name, idx) => ({
    id: `a${Date.now()}-${idx}`,
    name
  }));
}

/**
 * Write 3 assessment criteria
 */
export async function writeCriteria(context: Context): Promise<{ text: string }[]> {
  const { generateSmartDeliverables } = await import('../../chat-mvp/domain/deliverablesMicroFlow');
  const { generateSmartDeliverablesAI } = await import('../../chat-mvp/domain/deliverablesAI');

  const captured: CapturedData = {
    ideation: {
      bigIdea: context.bigIdea || '',
      essentialQuestion: context.essentialQuestion || '',
      challenge: context.challenge || ''
    },
    journey: {
      phases: (context.phases || []).map((p, idx) => ({
        id: `p${idx + 1}`,
        name: p.name,
        activities: p.activities || []
      }))
    }
  } as CapturedData;

  const wizard = context.wizard || {} as WizardContext;

  // Try AI first
  const aiResult = await generateSmartDeliverablesAI(captured, wizard);
  if (aiResult?.suggestedCriteria) {
    return aiResult.suggestedCriteria.map(text => ({ text }));
  }

  // Fallback to smart defaults
  const smartResult = generateSmartDeliverables(captured, wizard);
  return smartResult.suggestedCriteria.map(text => ({ text }));
}

/**
 * Tighten existing criteria to be more measurable/visible/rigorous
 */
export async function tightenCriteria(
  existingCriteria: string[],
  context: Context
): Promise<{ text: string }[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  if (existingCriteria.length === 0) {
    return [];
  }

  const currentList = existingCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');

  const prompt = `You are a PBL assessment expert. Improve these rubric criteria to be more measurable, visible, and rigorous:

CURRENT CRITERIA:
${currentList}

PROJECT CONTEXT:
- Challenge: ${context.challenge || 'Not specified'}
- Grade: ${context.wizard?.gradeLevel || 'Not specified'}

IMPROVE EACH CRITERION BY:
- Making it measurable (specific evidence students produce)
- Making it visible (observable in artifacts)
- Increasing rigor (higher-order thinking)

Output ONLY the improved criteria, one per line, no numbering.`;

  try {
    const response = await generateAI(prompt, { maxTokens: 300, temperature: 0.7 });

    const improved = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^\d+[.)]/))
      .slice(0, existingCriteria.length);

    // Ensure we have the same number
    while (improved.length < existingCriteria.length) {
      improved.push(existingCriteria[improved.length]);
    }

    return improved.map(text => ({ text }));
  } catch (error) {
    console.error('[deliverablesActions] tightenCriteria failed:', error);
    // Return original on error
    return existingCriteria.map(text => ({ text }));
  }
}

/**
 * Get 1-2 header chip suggestions for inline display
 */
export async function getHeaderChips(
  target: 'milestone' | 'artifact' | 'criterion',
  context: Context
): Promise<string[]> {
  const { generateSmartDeliverables } = await import('../../chat-mvp/domain/deliverablesMicroFlow');

  const captured: CapturedData = {
    ideation: {
      bigIdea: context.bigIdea || '',
      essentialQuestion: context.essentialQuestion || '',
      challenge: context.challenge || ''
    },
    journey: {
      phases: (context.phases || []).map((p, idx) => ({
        id: `p${idx + 1}`,
        name: p.name,
        activities: p.activities || []
      }))
    }
  } as CapturedData;

  const wizard = context.wizard || {} as WizardContext;

  const smartResult = generateSmartDeliverables(captured, wizard);

  if (target === 'milestone') {
    return smartResult.suggestedMilestones.slice(0, 2);
  } else if (target === 'artifact') {
    return smartResult.suggestedArtifacts.slice(0, 2);
  } else {
    return smartResult.suggestedCriteria.slice(0, 2);
  }
}
