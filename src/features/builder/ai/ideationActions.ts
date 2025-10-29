/**
 * Ideation Stage AI Actions
 *
 * Lazy-loaded AI logic for Ideation stage Quick Actions and field suggestions.
 * Imported only when user interacts with AI features.
 */

import type { WizardContext } from '../../chat-mvp/domain/stages';

interface Context {
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  wizard?: WizardContext;
}

/**
 * Brainstorm 3 compelling big idea options
 */
export async function brainstormBigIdea(context: Context): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const wizard = context.wizard || {};
  const gradeLevel = wizard.gradeLevel || 'Not specified';
  const subjects = (wizard.subjects || []).join(', ') || 'Not specified';

  const prompt = `You are a PBL curriculum designer. Generate 3 compelling "Big Idea" options for a project-based learning unit.

CONTEXT:
- Grade Level: ${gradeLevel}
- Subjects: ${subjects}
${context.bigIdea ? `- Current idea (for reference): ${context.bigIdea}` : ''}

A "Big Idea" should be:
- Conceptual and transferable (not just a topic)
- Age-appropriate for ${gradeLevel}
- Cross-disciplinary when possible
- Engaging and relevant to students' lives
- 1-2 sentences max

Output ONLY 3 big ideas, one per line, no numbering.`;

  const response = await generateAI(prompt, { maxTokens: 200, temperature: 0.8 });

  const ideas = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/))
    .slice(0, 3);

  return ideas.length > 0 ? ideas : ['Systems thinking helps us understand complex real-world problems', 'Effective communication bridges gaps between people and ideas', 'Design thinking empowers us to create solutions that matter'];
}

/**
 * Refine essential question with 2-3 stronger alternatives
 */
export async function refineEssentialQuestion(context: Context): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const currentEQ = context.essentialQuestion || '';
  const bigIdea = context.bigIdea || '';

  if (!currentEQ && !bigIdea) {
    return [];
  }

  const prompt = `You are a PBL curriculum designer. ${currentEQ ? 'Strengthen' : 'Create'} an Essential Question for this project.

${bigIdea ? `Big Idea: ${bigIdea}` : ''}
${currentEQ ? `Current EQ: ${currentEQ}` : ''}

An Essential Question should be:
- Open-ended (no single right answer)
- Provocative and intellectually engaging
- Connected to the big idea
- Debatable with multiple perspectives
- Accessible yet challenging
- Begin with "How" or "What" when possible

Output ${currentEQ ? '2-3 improved' : '3'} essential questions, one per line, no numbering.`;

  const response = await generateAI(prompt, { maxTokens: 150, temperature: 0.7 });

  const questions = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/))
    .slice(0, 3);

  return questions.length > 0 ? questions : [];
}

/**
 * Clarify challenge framing with 2-3 alternatives
 */
export async function clarifyChallengeFraming(context: Context): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  const currentChallenge = context.challenge || '';
  const bigIdea = context.bigIdea || '';
  const eq = context.essentialQuestion || '';

  if (!currentChallenge && !bigIdea && !eq) {
    return [];
  }

  const prompt = `You are a PBL curriculum designer. ${currentChallenge ? 'Clarify' : 'Create'} a Challenge framing for this project.

${bigIdea ? `Big Idea: ${bigIdea}` : ''}
${eq ? `Essential Question: ${eq}` : ''}
${currentChallenge ? `Current Challenge: ${currentChallenge}` : ''}

A Challenge should:
- Be specific and actionable (students know what to create/do)
- Connect to real audiences or authentic contexts
- Build on the big idea and essential question
- Be achievable yet rigorous
- Inspire student ownership
- 2-3 sentences max

Output ${currentChallenge ? '2-3 clearer framings' : '3 challenge options'}, one per line, no numbering.`;

  const response = await generateAI(prompt, { maxTokens: 200, temperature: 0.7 });

  const framings = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^\d+[.)]/))
    .slice(0, 3);

  return framings.length > 0 ? framings : [];
}

/**
 * Get field-level suggestions (1-2 refinements for inline chips)
 */
export async function getSuggestions(
  field: 'bigIdea' | 'essentialQuestion' | 'challenge',
  currentValue: string,
  context: Context
): Promise<string[]> {
  const { generateAI } = await import('../../chat-mvp/domain/ai');

  if (!currentValue || currentValue.trim().length < 10) {
    return [];
  }

  let prompt = '';

  if (field === 'bigIdea') {
    prompt = `You are a PBL expert. Suggest 2 ways to improve this Big Idea:

Current: "${currentValue}"

Make it:
- More conceptual and transferable
- More engaging and relevant
- Age-appropriate for ${context.wizard?.gradeLevel || 'students'}

Output ONLY 2 improved versions, one per line, no numbering.`;
  } else if (field === 'essentialQuestion') {
    prompt = `You are a PBL expert. Suggest 2 ways to strengthen this Essential Question:

Current: "${currentValue}"
${context.bigIdea ? `Big Idea: ${context.bigIdea}` : ''}

Make it:
- More open-ended and provocative
- More debatable with multiple perspectives
- Better connected to the big idea

Output ONLY 2 improved versions, one per line, no numbering.`;
  } else if (field === 'challenge') {
    prompt = `You are a PBL expert. Suggest 2 ways to clarify this Challenge:

Current: "${currentValue}"
${context.bigIdea ? `Big Idea: ${context.bigIdea}` : ''}
${context.essentialQuestion ? `Essential Question: ${context.essentialQuestion}` : ''}

Make it:
- More specific and actionable
- More connected to real audiences
- More inspiring for students

Output ONLY 2 clearer framings, one per line, no numbering.`;
  }

  try {
    const response = await generateAI(prompt, { maxTokens: 150, temperature: 0.7 });

    const suggestions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^\d+[.)]/))
      .slice(0, 2);

    return suggestions.length === 2 ? suggestions : [];
  } catch (error) {
    console.error('[ideationActions] getSuggestions failed:', error);
    return [];
  }
}
