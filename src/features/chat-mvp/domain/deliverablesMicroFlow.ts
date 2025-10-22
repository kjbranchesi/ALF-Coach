/**
 * Deliverables Micro-Flow
 * Handles multi-turn conversation for complex deliverables building
 */

import type { CapturedData, WizardContext } from './stages';

export type DeliverablesSubStep =
  | 'suggest_deliverables'  // SINGLE-SHOT: Show complete deliverables
  | 'customize_component'   // Optional: Drill into milestones/artifacts/rubrics
  | 'finalize';             // Done

export interface DeliverablesMicroState {
  subStep: DeliverablesSubStep;
  suggestedMilestones: string[];
  suggestedArtifacts: string[];
  suggestedCriteria: string[];
  workingMilestones: Array<{ name: string }>;
  workingArtifacts: Array<{ name: string }>;
  workingCriteria: string[];
  customizingComponent: 'milestones' | 'artifacts' | 'criteria' | null;
}

/**
 * Generate smart default deliverables based on context
 */
import { generateAI } from './ai';
import { telemetry } from '../../../services/telemetry';
import { resolveGradeBand, buildGradeBandPrompt } from '../../../ai/gradeBandRules';

export function generateSmartDeliverables(
  captured: CapturedData,
  wizard: WizardContext
): Pick<DeliverablesMicroState, 'suggestedMilestones' | 'suggestedArtifacts' | 'suggestedCriteria'> {
  const journey = captured.journey?.phases || [];
  const deliverableType = inferDeliverableType(captured, wizard);
  const audience = inferAudience(captured, wizard);

  // Generate milestones from journey phases
  const milestones = journey.length > 0
    ? journey.slice(0, 4).map((phase, index) => {
        return `${phase.name || `Phase ${index + 1}`} checkpoint complete`;
      })
    : [
        'Research insights synthesized',
        'Initial draft completed',
        'Prototype critiqued and revised',
        'Launch rehearsal complete'
      ];

  // Generate artifacts based on deliverable type
  const artifacts = generateArtifacts(deliverableType, audience);

  // Generate rubric criteria
  const criteria = generateCriteria(deliverableType, audience, wizard);

  return {
    suggestedMilestones: milestones,
    suggestedArtifacts: artifacts,
    suggestedCriteria: criteria
  };
}

// Async AI generator for deliverables (background refinement)
export async function generateSmartDeliverablesAI(
  captured: CapturedData,
  wizard: WizardContext
): Promise<Pick<DeliverablesMicroState, 'suggestedMilestones' | 'suggestedArtifacts' | 'suggestedCriteria'> | null> {
  const band = resolveGradeBand(wizard.gradeLevel);
  const guardrails = band ? buildGradeBandPrompt(band) : '';
  const journey = (captured.journey?.phases || []).map((p, i) => `${i + 1}. ${p.name}\n   Activities: ${(p.activities || []).join('; ')}`).join('\n');
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
    const response = await generateAI(prompt, { model: 'gemini-flash-latest', temperature: 0.6, maxTokens: 600, label: 'deliverables_generation' });
    const parsed = JSON.parse(response);
    if (parsed && (parsed.milestones || parsed.artifacts || parsed.criteria)) {
      return {
        suggestedMilestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
        suggestedArtifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
        suggestedCriteria: Array.isArray(parsed.criteria) ? parsed.criteria : []
      };
    }
  } catch (error: any) {
    console.error('[deliverablesMicroFlow] AI generation failed, using fallback', error);
    telemetry.track({ event: 'ai_fallback', success: false, latencyMs: 0, projectId: 'deliverables', errorCode: 'PARSE_FAIL', errorMessage: error?.message, source: undefined });
  }
  return null;
}

function inferDeliverableType(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';

  if (/exhibit/i.test(challenge)) {return 'exhibition';}
  if (/campaign/i.test(challenge)) {return 'campaign';}
  if (/proposal/i.test(challenge)) {return 'proposal';}
  if (/prototype/i.test(challenge)) {return 'prototype';}
  if (/podcast/i.test(challenge)) {return 'podcast';}
  if (/documentary/i.test(challenge)) {return 'documentary';}
  if (/portfolio/i.test(challenge)) {return 'portfolio';}
  if (/toolkit/i.test(challenge)) {return 'toolkit';}

  return 'project deliverable';
}

function inferAudience(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';
  const audienceMatch = challenge.match(/for\s+([^.,;]+)/i);
  if (audienceMatch) {return audienceMatch[1].trim();}

  const grade = wizard.gradeLevel?.toLowerCase() || '';
  if (grade.includes('elementary')) {return 'families and younger students';}
  if (grade.includes('middle')) {return 'school leaders and community partners';}
  if (grade.includes('high')) {return 'community partners and decision makers';}

  return 'the audience';
}

function generateArtifacts(deliverableType: string, audience: string): string[] {
  const baseArtifacts: Record<string, string[]> = {
    exhibition: [
      `Exhibition ready for ${audience}`,
      'Curator statement and labels',
      'Process portfolio documenting decisions'
    ],
    campaign: [
      `Campaign materials for ${audience}`,
      'Campaign strategy document',
      'Metrics and success criteria'
    ],
    proposal: [
      `Evidence-based proposal for ${audience}`,
      'Supporting research documentation',
      'Implementation timeline'
    ],
    prototype: [
      `Working prototype demonstrated to ${audience}`,
      'Technical documentation',
      'User feedback report'
    ],
    podcast: [
      `Podcast episode(s) for ${audience}`,
      'Script and show notes',
      'Reflection on production process'
    ],
    documentary: [
      `Documentary screened for ${audience}`,
      "Director's statement",
      'Production journal'
    ],
    portfolio: [
      `Portfolio presented to ${audience}`,
      'Artist/reflective statements',
      'Evidence of growth over time'
    ]
  };

  return baseArtifacts[deliverableType] || [
    `${deliverableType} ready for ${audience}`,
    'Process documentation',
    'Reflection on learning'
  ];
}

function generateCriteria(deliverableType: string, audience: string, wizard: WizardContext): string[] {
  const subject = wizard.subjects?.[0]?.toLowerCase() || '';

  // Subject-specific criteria
  const subjectCriteria: Record<string, string[]> = {
    science: [
      'Scientific evidence is credible and relevant',
      'Methodology is sound and well-documented',
      'Conclusions are supported by data',
      `Communication is clear for ${audience}`
    ],
    history: [
      'Historical evidence is accurate and well-sourced',
      'Multiple perspectives are examined',
      'Connections to present are meaningful',
      `Narrative engages ${audience}`
    ],
    art: [
      'Artistic choices support the concept',
      'Technical skill shows growth',
      'Personal voice is evident',
      `Work resonates with ${audience}`
    ],
    english: [
      'Writing is clear and purposeful',
      'Evidence supports claims',
      'Voice and style are appropriate',
      `Message connects with ${audience}`
    ]
  };

  // Check for subject match
  for (const [key, criteria] of Object.entries(subjectCriteria)) {
    if (subject.includes(key)) {
      return criteria;
    }
  }

  // Default criteria
  return [
    'Evidence is credible and relevant',
    'Quality meets professional standards',
    `Impact on ${audience} is clear`,
    'Student voice and reflection show growth'
  ];
}

/**
 * Initialize deliverables micro-flow - SINGLE-SHOT pattern
 */
export function initDeliverablesMicroFlow(
  captured: CapturedData,
  wizard: WizardContext
): DeliverablesMicroState {
  const { suggestedMilestones, suggestedArtifacts, suggestedCriteria } =
    generateSmartDeliverables(captured, wizard);

  return {
    subStep: 'suggest_deliverables',  // SINGLE-SHOT: Show complete deliverables immediately
    suggestedMilestones,
    suggestedArtifacts,
    suggestedCriteria,
    workingMilestones: [],
    workingArtifacts: [],
    workingCriteria: [],
    customizingComponent: null
  };
}

/**
 * Format complete deliverables suggestion - SINGLE-SHOT default
 */
export function formatDeliverablesSuggestion(state: DeliverablesMicroState): string {
  const lines = [
    "Here's a complete deliverables structure for your project:",
    "",
    "**📍 Milestones**"
  ];

  state.suggestedMilestones.forEach((milestone, index) => {
    lines.push(`${index + 1}. ${milestone}`);
  });

  lines.push("");
  lines.push("**🎯 Final Artifacts**");

  state.suggestedArtifacts.forEach((artifact, index) => {
    lines.push(`${index + 1}. ${artifact}`);
  });

  lines.push("");
  lines.push("**📊 Assessment Criteria**");

  state.suggestedCriteria.forEach((criterion, index) => {
    lines.push(`${index + 1}. ${criterion}`);
  });

  return lines.join('\n');
}

/**
 * Handle user's response to deliverables suggestion
 * Parses natural language input and determines action
 */
export function handleDeliverablesChoice(
  state: DeliverablesMicroState,
  userInput: string
): {
  action: 'accept' | 'accept_all' | 'refine' | 'regenerate' | 'show_all' | 'none';
  newState?: DeliverablesMicroState;
  captured?: {
    milestones: Array<{ name: string }>;
    artifacts: Array<{ name: string }>;
    rubric: { criteria: string[] };
  };
  message?: string;
} {
  const input = userInput.toLowerCase().trim();

  // Check for "suggest deliverables" / "show all" requests
  const showAllPatterns = [
    /suggest.*deliverable/i,
    /show.*all/i,
    /show.*complete/i,
    /see.*all.*components/i
  ];

  if (showAllPatterns.some(p => p.test(input))) {
    return {
      action: 'show_all',
      newState: {
        ...state,
        subStep: 'suggest_deliverables'
      }
    };
  }

  // SINGLE-SHOT: Accept entire deliverables structure
  const acceptPatterns = [
    /^(yes|yep|yeah|yup|sure|okay|ok|perfect|great|looks good|sounds good)$/i,
    /^yes,?\s+(continue|use this|use that|use these|use all of these)$/i,
    /^(use (this|that|these|it|all of these)|let'?s (use|go with) (this|that|it))$/i,
    /^i like (it|this|that|these)$/i,
    /^(go ahead|proceed)$/i
  ];

  const isAccept = acceptPatterns.some(p => p.test(input));

  if (isAccept) {
    // Convert suggested deliverables to captured format
    const captured = {
      milestones: state.suggestedMilestones.map(m => ({ name: m })),
      artifacts: state.suggestedArtifacts.map(a => ({ name: a })),
      rubric: { criteria: state.suggestedCriteria }
    };

    return {
      action: 'accept_all',
      newState: {
        ...state,
        subStep: 'finalize',
        workingMilestones: captured.milestones,
        workingArtifacts: captured.artifacts,
        workingCriteria: captured.rubric.criteria
      },
      captured
    };
  }

  // Check for customization requests
  const customizePatterns = [
    /\\b(customize|modify|change|adjust|edit|tweak)\\b/i,
    /\\b(different|shorter|longer|fewer|more)\\b/i,
    /\\b(milestone|artifact|criteri)\\b/i
  ];

  const isCustomize = customizePatterns.some(p => p.test(input));

  if (isCustomize) {
    // Generic customize - offer to regenerate for now
    return {
      action: 'regenerate'
    };
  }

  // Check for regeneration requests
  const regeneratePatterns = [
    /^(no|nah|not quite|different|other|another|try again|regenerate|new suggestion)/i,
    /\\b(show me (something|anything) (else|different))\\b/i
  ];

  const isRegenerate = regeneratePatterns.some(p => p.test(input));

  if (isRegenerate) {
    return {
      action: 'regenerate'
    };
  }

  // If we can't determine intent, treat as clarification needed
  return {
    action: 'none',
    message: "I'm not sure what you'd like to do. You can:\\n• Click **\\\"Yes, use all of these\\\"** or say **\\\"yes\\\"** to use these deliverables\\n• Ask to **\\\"customize milestones\\\"** or **\\\"customize artifacts\\\"**\\n• Request **\\\"different suggestions\\\"** for alternatives"
  };
}

/**
 * Detect which component user is trying to modify
 */
export function detectComponentReference(input: string): 'milestones' | 'artifacts' | 'criteria' | null {
  const lower = input.toLowerCase();

  if (/(milestone|checkpoint|phase)/i.test(lower)) {return 'milestones';}
  if (/(artifact|deliverable|product|final)/i.test(lower)) {return 'artifacts';}
  if (/(rubric|criteri|assess|quality)/i.test(lower)) {return 'criteria';}

  return null;
}

/**
 * Get suggested action chips based on current deliverables micro-flow state
 */
export function getDeliverablesActionChips(state: DeliverablesMicroState): string[] {
  switch (state.subStep) {
    case 'suggest_deliverables':
      return ['Yes, use all of these', 'Customize milestones', 'Customize artifacts'];

    case 'customize_component':
      return ['Save changes', 'Cancel'];

    default:
      return [];
  }
}
