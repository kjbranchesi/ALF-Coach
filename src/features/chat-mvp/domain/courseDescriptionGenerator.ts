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

  console.log('[courseDescriptionGenerator] Generating description for:', bigIdea);

  try {
    const description = await generateAI(prompt, {
      model: 'gemini-2.5-flash-lite',
      temperature: 0.6,
      maxTokens: 300,
      systemPrompt: 'You are an expert at writing clear, professional course descriptions for project-based learning experiences. Write descriptions that are engaging yet professional, specific yet accessible.'
    });

    const result = description?.trim() || generateFallbackDescription(captured, wizard);

    // Log quality metrics
    const wordCount = result.split(/\s+/).length;
    const isFallback = !description?.trim();
    console.log('[courseDescriptionGenerator] Generated:', {
      wordCount,
      length: result.length,
      isFallback,
      preview: result.slice(0, 100) + '...'
    });

    return result;
  } catch (error) {
    console.error('[courseDescriptionGenerator] AI generation failed', error);
    const fallback = generateFallbackDescription(captured, wizard);
    console.log('[courseDescriptionGenerator] Using fallback description');
    return fallback;
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
 * Generate a punchy tagline (8-12 words) for project cards
 */
export async function generateTagline(
  captured: CapturedData,
  wizard: WizardContext
): Promise<string> {
  const bigIdea = captured.ideation?.bigIdea || 'core concepts';
  const challenge = captured.ideation?.challenge || 'complete a project';

  const prompt = [
    'Generate a punchy, inspiring tagline (8-12 words) for this project-based learning experience.',
    '',
    '**Project Details:**',
    `- Big Idea: ${bigIdea}`,
    `- Challenge: ${challenge}`,
    `- Grade Level: ${wizard.gradeLevel || 'students'}`,
    `- Subject(s): ${wizard.subjects?.join(' & ') || 'interdisciplinary'}`,
    '',
    '**Requirements:**',
    '1. Action-oriented and specific',
    '2. Start with a verb or "Students..."',
    '3. Highlight the transformation or impact',
    '4. Professional yet inspiring tone',
    '5. No generic buzzwords',
    '',
    'Examples:',
    '- "Students transform a school sustainability audit into a community-backed action plan."',
    '- "Learners investigate local history through oral storytelling and digital archives."',
    '- "Teams design assistive technology prototypes for community partners with disabilities."',
    '',
    'Write the tagline now (ONLY the tagline, nothing else):'
  ].join('\n');

  console.log('[courseDescriptionGenerator] Generating tagline for:', bigIdea);

  try {
    const tagline = await generateAI(prompt, {
      model: 'gemini-2.5-flash-lite',
      temperature: 0.7,
      maxTokens: 50,
      systemPrompt: 'You are an expert at writing concise, compelling taglines for educational projects. Write taglines that capture the essence and impact of project-based learning.'
    });

    const result = tagline?.trim() || generateFallbackTagline(captured);
    const wordCount = result.split(/\s+/).length;

    console.log('[courseDescriptionGenerator] Generated tagline:', {
      wordCount,
      tagline: result
    });

    return result;
  } catch (error) {
    console.error('[courseDescriptionGenerator] Tagline generation failed', error);
    return generateFallbackTagline(captured);
  }
}

/**
 * Generate fallback tagline if AI fails
 */
function generateFallbackTagline(captured: CapturedData): string {
  const bigIdea = captured.ideation?.bigIdea || 'key concepts';
  const challenge = captured.ideation?.challenge || 'complete an authentic project';

  // Keep it short and action-oriented
  return `Students explore ${bigIdea.slice(0, 30)} through authentic project work.`;
}

/**
 * Verify description quality and detect template fallback patterns
 */
export function verifyDescriptionQuality(description: string): {
  isValid: boolean;
  warnings: string[];
  wordCount: number;
  isLikelyTemplate: boolean;
} {
  const warnings: string[] = [];
  const wordCount = description.split(/\s+/).length;

  // Check word count (target: 120-180 words)
  if (wordCount < 100) {
    warnings.push('Description is too short (< 100 words)');
  } else if (wordCount > 200) {
    warnings.push('Description is too long (> 200 words)');
  }

  // Detect template fallback patterns
  const templatePatterns = [
    /Students explore .+ through a .+ project-based learning experience in .+\./,
    /Working collaboratively, they will .+\./,
    /The project unfolds through \d+ structured phases/,
    /allowing learners to research, design, and create authentic work/,
    /Students demonstrate mastery through final deliverables/
  ];

  const matchCount = templatePatterns.filter(pattern => pattern.test(description)).length;
  const isLikelyTemplate = matchCount >= 3;

  if (isLikelyTemplate) {
    warnings.push('Description appears to use template fallback (AI may have failed)');
  }

  // Check for jargon/buzzwords
  const buzzwords = ['21st century', 'synergy', 'leverage', 'deep dive', 'empower', 'paradigm'];
  const hasBuzzwords = buzzwords.some(word =>
    description.toLowerCase().includes(word.toLowerCase())
  );

  if (hasBuzzwords) {
    warnings.push('Description contains buzzwords/jargon');
  }

  // Check starts with third person
  const startsCorrectly = /^(Students|Learners|Participants|Teams)/i.test(description);
  if (!startsCorrectly) {
    warnings.push('Description should start with "Students", "Learners", etc.');
  }

  const isValid = warnings.length === 0;

  return {
    isValid,
    warnings,
    wordCount,
    isLikelyTemplate
  };
}

/**
 * Generate a short (50-70 word) preview for cards
 */
export function generateShortDescription(description: string): string {
  if (!description) {return '';}

  // If already short enough, return as-is
  if (description.length <= 200) {return description;}

  // Take first 2 sentences or 200 characters
  const sentences = description.split(/[.!?]+\s+/);
  let short = sentences[0];

  if (short.length < 150 && sentences[1]) {
    short += `. ${  sentences[1]}`;
  }

  // Truncate at word boundary if still too long
  if (short.length > 200) {
    short = `${short.slice(0, 197).split(' ').slice(0, -1).join(' ')  }...`;
  }

  return short + (short.endsWith('.') ? '' : '.');
}
