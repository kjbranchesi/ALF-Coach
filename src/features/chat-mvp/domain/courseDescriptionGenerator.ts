/**
 * Course Description Generator
 * Creates professional course descriptions from captured chat data
 */

import type { CapturedData, WizardContext } from './stages';
import { generateAI } from './ai';

export async function generateCourseDescription(
  captured: CapturedData,
  wizard: WizardContext
): Promise<string> {
  const bigIdea = captured.ideation?.bigIdea || 'core concepts';
  const essentialQuestion = captured.ideation?.essentialQuestion || '';
  const challenge = captured.ideation?.challenge || 'complete a project';

  const phases = captured.journey?.phases || [];
  const phaseNames = phases.length > 0
    ? phases.map(p => p.name).join(', ')
    : 'structured phases';

  const artifacts = captured.deliverables?.artifacts || [];
  const artifactList = artifacts.length > 0
    ? artifacts.map(a => a.name || String(a)).join(', ')
    : 'final deliverables';

  const criteria = captured.deliverables?.rubric?.criteria || [];
  const assessmentFocus = criteria.length > 0
    ? criteria.slice(0, 3).join(', ')
    : 'quality of work and growth';

  const prompt = [
    'Generate a concise, professional course description (120-180 words) for this project-based learning experience.',
    '',
    '**Project Details:**',
    `- Big Idea: ${bigIdea}`,
    `- Essential Question: ${essentialQuestion}`,
    `- Challenge: ${challenge}`,
    `- Grade Level: ${wizard.gradeLevel || 'students'}`,
    `- Subject(s): ${wizard.subjects?.join(' & ') || 'interdisciplinary'}`,
    `- Duration: ${wizard.duration || 'multiple weeks'}`,
    `- Journey Phases: ${phaseNames}`,
    `- Final Artifacts: ${artifactList}`,
    `- Assessment Focus: ${assessmentFocus}`,
    '',
    '**Requirements:**',
    '1. Write in third person ("Students explore...", "Learners will...")',
    '2. Start with what students explore or investigate',
    '3. Describe the authentic challenge and audience',
    '4. Mention the learning journey structure',
    '5. Conclude with deliverables and assessment approach',
    '6. Keep tone professional but inspiring',
    '7. Avoid jargon and buzzwords',
    '8. Make it scannable and clear',
    '',
    'Write the description now:'
  ].join('\n');

  try {
    const description = await generateAI(prompt, {
      model: 'gemini-2.5-flash-lite',
      temperature: 0.6,
      maxTokens: 300,
      systemPrompt: 'You are an expert at writing clear, professional course descriptions for project-based learning experiences. Write descriptions that are engaging yet professional, specific yet accessible.'
    });

    return description?.trim() || generateFallbackDescription(captured, wizard);
  } catch (error) {
    console.error('[courseDescriptionGenerator] AI generation failed', error);
    return generateFallbackDescription(captured, wizard);
  }
}

/**
 * Generate a simple fallback description if AI fails
 */
function generateFallbackDescription(
  captured: CapturedData,
  wizard: WizardContext
): string {
  const subject = wizard.subjects?.[0] || 'this subject';
  const duration = wizard.duration || 'multiple weeks';
  const bigIdea = captured.ideation?.bigIdea || 'key concepts';
  const challenge = captured.ideation?.challenge || 'complete an authentic project';

  const phases = captured.journey?.phases || [];
  const phaseCount = phases.length;

  return `Students explore ${bigIdea} through a ${duration} project-based learning experience in ${subject}. Working collaboratively, they will ${challenge}. The project unfolds through ${phaseCount > 0 ? `${phaseCount} structured phases` : 'multiple phases'}, allowing learners to research, design, and create authentic work. Students demonstrate mastery through final deliverables that showcase their learning and growth.`;
}

/**
 * Generate a short (50-70 word) preview for cards
 */
export function generateShortDescription(description: string): string {
  if (!description) return '';

  // If already short enough, return as-is
  if (description.length <= 200) return description;

  // Take first 2 sentences or 200 characters
  const sentences = description.split(/[.!?]+\s+/);
  let short = sentences[0];

  if (short.length < 150 && sentences[1]) {
    short += '. ' + sentences[1];
  }

  // Truncate at word boundary if still too long
  if (short.length > 200) {
    short = short.slice(0, 197).split(' ').slice(0, -1).join(' ') + '...';
  }

  return short + (short.endsWith('.') ? '' : '.');
}
