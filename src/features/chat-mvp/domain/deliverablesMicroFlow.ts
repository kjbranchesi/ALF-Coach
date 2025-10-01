/**
 * Deliverables Micro-Flow
 * Handles multi-turn conversation for complex deliverables building
 */

import type { CapturedData, WizardContext } from './stages';

export type DeliverablesSubStep =
  | 'suggest_deliverables'  // Show complete suggestion
  | 'confirm_or_customize'  // Accept / Customize / Start over
  | 'customize_component'   // Drill into milestones/artifacts/rubrics
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

function inferDeliverableType(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';

  if (/exhibit/i.test(challenge)) return 'exhibition';
  if (/campaign/i.test(challenge)) return 'campaign';
  if (/proposal/i.test(challenge)) return 'proposal';
  if (/prototype/i.test(challenge)) return 'prototype';
  if (/podcast/i.test(challenge)) return 'podcast';
  if (/documentary/i.test(challenge)) return 'documentary';
  if (/portfolio/i.test(challenge)) return 'portfolio';
  if (/toolkit/i.test(challenge)) return 'toolkit';

  return 'project deliverable';
}

function inferAudience(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';
  const audienceMatch = challenge.match(/for\s+([^.,;]+)/i);
  if (audienceMatch) return audienceMatch[1].trim();

  const grade = wizard.gradeLevel?.toLowerCase() || '';
  if (grade.includes('elementary')) return 'families and younger students';
  if (grade.includes('middle')) return 'school leaders and community partners';
  if (grade.includes('high')) return 'community partners and decision makers';

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
 * Initialize deliverables micro-flow
 */
export function initDeliverablesMicroFlow(
  captured: CapturedData,
  wizard: WizardContext
): DeliverablesMicroState {
  const { suggestedMilestones, suggestedArtifacts, suggestedCriteria } =
    generateSmartDeliverables(captured, wizard);

  return {
    subStep: 'suggest_deliverables',
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
 * Format deliverables suggestion for display in chat
 */
export function formatDeliverablesSuggestion(state: DeliverablesMicroState): string {
  const lines = [
    "Here's a suggested deliverables structure for your project:",
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
 * Handle user's choice to accept, customize, or start over
 */
export function handleDeliverablesChoice(
  state: DeliverablesMicroState,
  choice: 'accept' | 'customize' | 'start_over',
  component?: 'milestones' | 'artifacts' | 'criteria'
): {
  newState: DeliverablesMicroState;
  captured?: {
    milestones: Array<{ name: string }>;
    artifacts: Array<{ name: string }>;
    rubric: { criteria: string[] };
  };
} {
  switch (choice) {
    case 'accept':
      // Convert suggested to working and finalize
      const captured = {
        milestones: state.suggestedMilestones.map(m => ({ name: m })),
        artifacts: state.suggestedArtifacts.map(a => ({ name: a })),
        rubric: { criteria: state.suggestedCriteria }
      };

      return {
        newState: {
          ...state,
          subStep: 'finalize',
          workingMilestones: captured.milestones,
          workingArtifacts: captured.artifacts,
          workingCriteria: captured.rubric.criteria
        },
        captured
      };

    case 'customize':
      // Enter customize mode for a specific component
      const componentToCustomize = component || 'milestones';
      return {
        newState: {
          ...state,
          subStep: 'customize_component',
          customizingComponent: componentToCustomize,
          workingMilestones: state.suggestedMilestones.map(m => ({ name: m })),
          workingArtifacts: state.suggestedArtifacts.map(a => ({ name: a })),
          workingCriteria: [...state.suggestedCriteria]
        }
      };

    case 'start_over':
      // Reset to empty state - they'll build from scratch
      return {
        newState: {
          ...state,
          subStep: 'customize_component',
          customizingComponent: 'milestones',
          workingMilestones: [],
          workingArtifacts: [],
          workingCriteria: []
        }
      };

    default:
      return { newState: state };
  }
}

/**
 * Detect which component user is trying to modify
 */
export function detectComponentReference(input: string): 'milestones' | 'artifacts' | 'criteria' | null {
  const lower = input.toLowerCase();

  if (/(milestone|checkpoint|phase)/i.test(lower)) return 'milestones';
  if (/(artifact|deliverable|product|final)/i.test(lower)) return 'artifacts';
  if (/(rubric|criteri|assess|quality)/i.test(lower)) return 'criteria';

  return null;
}
