/**
 * Deliverables AI Generator (async refinement)
 * Isolated from deliverablesMicroFlow to avoid static+dynamic import mixing in ChatMVP
 */

import type { CapturedData, WizardContext } from './stages';
import { resolveGradeBand, buildGradeBandPrompt } from '../../../ai/gradeBandRules';
import { generateAI } from './ai';
import { telemetry } from '../../../services/telemetry';

export async function generateSmartDeliverablesAI(
  captured: CapturedData,
  wizard: WizardContext
): Promise<{
  suggestedMilestones: string[];
  suggestedArtifacts: string[];
  suggestedCriteria: string[];
} | null> {
  const band = resolveGradeBand(wizard.gradeLevel);
  const guardrails = band ? buildGradeBandPrompt(band) : '';
  const journey = (captured.journey?.phases || [])
    .map((p, i) => `${i + 1}. ${p.name}\n   Activities: ${(p.activities || []).join('; ')}`)
    .join('\n');

  const prompt = `Generate deliverables for this PBL project.

PROJECT FOUNDATION:
- Big Idea: ${captured.ideation.bigIdea || ''}
- Essential Question: ${captured.ideation.essentialQuestion || ''}
- Challenge: ${captured.ideation.challenge || ''}

LEARNING JOURNEY:
${journey}

CONTEXT:
- Grade: ${wizard.gradeLevel || ''}
- Subjects: ${(wizard.subjects || []).join(', ')}
- Duration: ${wizard.duration || ''}

GRADE-BAND GUARDRAILS:
${guardrails}

GENERATE:

1. Milestones (${(captured.journey?.phases || []).length} items, one per phase) that reference specific phase activities.
2. Artifacts (2-3 items) students produce for the Challenge audience.
3. Rubric Criteria (4-6) assessing Big Idea understanding and Challenge quality.

OUTPUT FORMAT (JSON):
{
  "milestones": ["..."],
  "artifacts": ["..."],
  "criteria": ["..."]
}

Return ONLY valid JSON.`;

  try {
    const response = await generateAI(prompt, {
      model: 'gemini-flash-latest',
      temperature: 0.6,
      maxTokens: 600,
      label: 'deliverables_generation'
    });
    const parsed = JSON.parse(response);
    if (parsed && (parsed.milestones || parsed.artifacts || parsed.criteria)) {
      return {
        suggestedMilestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
        suggestedArtifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
        suggestedCriteria: Array.isArray(parsed.criteria) ? parsed.criteria : []
      };
    }
  } catch (error: any) {
    console.error('[deliverablesAI] AI generation failed, using fallback', error);
    telemetry.track({
      event: 'ai_fallback',
      success: false,
      latencyMs: 0,
      projectId: 'deliverables',
      errorCode: 'PARSE_FAIL',
      errorMessage: error?.message,
      source: undefined
    });
  }
  return null;
}

