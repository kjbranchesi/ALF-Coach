/**
 * Journey Stage AI Actions
 *
 * Lazy-loaded AI logic for Journey stage Quick Actions and suggestions.
 * Imported only when user interacts with AI features.
 */

import type { CapturedData } from '../../chat-mvp/domain/stages';

interface Phase {
  id: string;
  name: string;
  focus?: string;
  activities: string[];
  checkpoint?: string;
}

/**
 * Generate 4 smart phase names based on ideation context
 */
export async function generatePhaseNames(
  ideation?: { bigIdea?: string; essentialQuestion?: string; challenge?: string }
): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const context = ideation
    ? `Big Idea: ${ideation.bigIdea || 'Not specified'}
Essential Question: ${ideation.essentialQuestion || 'Not specified'}
Challenge: ${ideation.challenge || 'Not specified'}`
    : 'No ideation context provided';

  const prompt = `You are a PBL curriculum designer. Based on this project context:

${context}

Generate exactly 4 learning journey phase names that:
- Progress logically from introduction to culmination
- Are concise (2-4 words each)
- Are action-oriented and student-focused
- Build toward the challenge

Output ONLY the 4 phase names, one per line, no numbering or bullets.`;

  const response = await generateAI(prompt, { maxTokens: 150, temperature: 0.7 });

  // Parse response into array of phase names
  const phases = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/)) // Remove numbering if present
    .slice(0, 4);

  // Ensure we have exactly 4 phases
  while (phases.length < 4) {
    phases.push(`Phase ${phases.length + 1}`);
  }

  return phases.slice(0, 4);
}

/**
 * Rename existing phases for clarity
 */
export async function renamePhasesForClarity(
  phases: Phase[],
  ideation?: { bigIdea?: string; essentialQuestion?: string; challenge?: string }
): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const context = ideation
    ? `Big Idea: ${ideation.bigIdea || 'Not specified'}
Challenge: ${ideation.challenge || 'Not specified'}`
    : '';

  const currentNames = phases.map((p, i) => `${i + 1}. ${p.name}`).join('\n');

  const prompt = `You are a PBL curriculum designer. Given these phase names:

${currentNames}

${context ? `Project context:\n${context}\n` : ''}

Improve each phase name to be:
- More specific and descriptive
- Action-oriented (use verbs where appropriate)
- Clear about what students will do
- 2-5 words each

Output ONLY the improved phase names, one per line, no numbering.`;

  const response = await generateAI(prompt, { maxTokens: 200, temperature: 0.7 });

  const improvedNames = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/))
    .slice(0, phases.length);

  // Ensure we have the same number of names
  while (improvedNames.length < phases.length) {
    improvedNames.push(phases[improvedNames.length].name);
  }

  return improvedNames.slice(0, phases.length);
}

/**
 * Suggest 3-4 activities for a specific phase
 */
export async function suggestActivitiesForPhase(
  phaseName: string,
  phaseIndex: number,
  totalPhases: number,
  ideation?: { bigIdea?: string; essentialQuestion?: string; challenge?: string }
): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const context = ideation
    ? `Big Idea: ${ideation.bigIdea || 'Not specified'}
Challenge: ${ideation.challenge || 'Not specified'}`
    : '';

  const position = phaseIndex === 0
    ? 'first (introduction)'
    : phaseIndex === totalPhases - 1
    ? 'final (culmination)'
    : `middle (${phaseIndex + 1} of ${totalPhases})`;

  const prompt = `You are a PBL curriculum designer. For this learning journey phase:

Phase Name: "${phaseName}"
Position: ${position} phase

${context ? `Project context:\n${context}\n` : ''}

Suggest exactly 3-4 learning activities that:
- Are appropriate for this phase's position in the journey
- Build toward the project challenge
- Are specific and actionable (not just "research" or "discuss")
- Progress in complexity
- Include different modalities (reading, creating, collaborating, etc.)

Output ONLY the activity descriptions, one per line, no numbering or bullets.
Keep each activity to 1-2 sentences max.`;

  const response = await generateAI(prompt, { maxTokens: 300, temperature: 0.8 });

  const activities = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/))
    .slice(0, 4);

  return activities.length > 0 ? activities : [
    'Explore key concepts through guided inquiry',
    'Collaborate with peers to develop understanding',
    'Create artifacts that demonstrate learning'
  ];
}

/**
 * Get 2 rename suggestions for a single phase
 */
export async function getPhaseSuggestions(
  phaseName: string,
  phaseIndex: number,
  ideation?: { bigIdea?: string; essentialQuestion?: string }
): Promise<string[]> {
  if (!phaseName || phaseName.trim().length < 3) {
    return [];
  }

  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const context = ideation?.bigIdea
    ? `Project: ${ideation.bigIdea}`
    : '';

  const prompt = `You are a PBL curriculum designer. Suggest 2 alternative names for this phase:

Current: "${phaseName}"
Phase position: ${phaseIndex + 1}
${context}

Each suggestion should be:
- More specific or descriptive
- 2-4 words
- Action-oriented where appropriate

Output ONLY 2 alternatives, one per line, no numbering.`;

  const response = await generateAI(prompt, { maxTokens: 80, temperature: 0.8 });

  const suggestions = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/))
    .slice(0, 2);

  return suggestions.length === 2 ? suggestions : [];
}
