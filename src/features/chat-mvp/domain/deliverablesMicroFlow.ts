/**
 * Deliverables Micro-Flow
 * Handles multi-turn conversation for complex deliverables building
 */

import type { CapturedData, WizardContext } from './stages';

export type DeliverablesSubStep =
  | 'intro'                 // NEW: Explain the three components
  | 'review_milestones'     // NEW: Review milestones first
  | 'review_artifacts'      // NEW: Then artifacts
  | 'review_criteria'       // NEW: Finally criteria
  | 'suggest_deliverables'  // Show complete suggestion (fallback)
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
  acceptedMilestones: boolean;   // NEW: Track acceptance
  acceptedArtifacts: boolean;    // NEW: Track acceptance
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
    subStep: 'intro',           // Start with introduction
    suggestedMilestones,
    suggestedArtifacts,
    suggestedCriteria,
    workingMilestones: [],
    workingArtifacts: [],
    workingCriteria: [],
    customizingComponent: null,
    acceptedMilestones: false,
    acceptedArtifacts: false
  };
}

/**
 * Format introduction explaining the three components
 */
export function formatDeliverablesIntro(): string {
  return `**Time to define deliverables!**

Let's capture three types of deliverables that work together:

📍 **Milestones** = Progress checkpoints during the journey
   *Example:* "Week 3: Research synthesis complete"

🎯 **Artifacts** = Final products students create
   *Example:* "Campaign toolkit ready for community partners"

📊 **Rubric Criteria** = Qualities you'll assess
   *Example:* "Evidence supports claims persuasively"

I'll suggest each component based on your journey. **Ready to start with milestones?**`;
}

/**
 * Format milestones review
 */
export function formatMilestonesReview(state: DeliverablesMicroState): string {
  const lines = [
    "**📍 Milestones** — Progress checkpoints showing students are on track",
    "",
    "Based on your journey phases, here are suggested milestones:"
  ];

  state.suggestedMilestones.forEach((milestone, index) => {
    lines.push(`${index + 1}. ${milestone}`);
  });

  lines.push("");
  lines.push("**Do these milestones work for tracking student progress?**");

  return lines.join('\n');
}

/**
 * Format artifacts review
 */
export function formatArtifactsReview(state: DeliverablesMicroState): string {
  const lines = [
    "**🎯 Final Artifacts** — What students will create and present",
    "",
    "Based on your challenge, here are suggested artifacts:"
  ];

  state.suggestedArtifacts.forEach((artifact, index) => {
    lines.push(`${index + 1}. ${artifact}`);
  });

  lines.push("");
  lines.push("**Do these artifacts match what you envision students creating?**");

  return lines.join('\n');
}

/**
 * Format criteria review
 */
export function formatCriteriaReview(state: DeliverablesMicroState): string {
  const lines = [
    "**📊 Assessment Criteria** — How you'll evaluate quality",
    "",
    "Here are rubric criteria that assess both outcomes and process:"
  ];

  state.suggestedCriteria.forEach((criterion, index) => {
    lines.push(`${index + 1}. ${criterion}`);
  });

  lines.push("");
  lines.push("**Do these criteria cover what matters most for this project?**");

  return lines.join('\n');
}

/**
 * Format complete deliverables suggestion (fallback for "show all" requests)
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
 * Handle user's response to deliverables suggestions
 * Supports sequential flow through milestones → artifacts → criteria
 */
export function handleDeliverablesChoice(
  state: DeliverablesMicroState,
  userInput: string
): {
  action: 'intro_accepted' | 'next_component' | 'accept_all' | 'show_all' | 'refine' | 'none';
  newState?: DeliverablesMicroState;
  captured?: {
    milestones: Array<{ name: string }>;
    artifacts: Array<{ name: string }>;
    rubric: { criteria: string[] };
  };
  message?: string;
} {
  const input = userInput.toLowerCase().trim();

  // Check for "show all" request
  const showAllPatterns = [
    /show.*all/i,
    /see.*everything/i,
    /complete.*structure/i
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

  // Acceptance patterns
  const acceptPatterns = [
    /^(yes|yep|yeah|yup|sure|okay|ok|perfect|great|looks good|sounds good)$/i,
    /^(use (this|that|these|it)|let'?s (use|go with) (this|that|it))$/i,
    /^i like (it|this|that|these)$/i,
    /^(continue|next|move on)$/i
  ];

  const isAccept = acceptPatterns.some(p => p.test(input));

  if (isAccept) {
    // Handle acceptance based on current substep
    switch (state.subStep) {
      case 'intro':
        // Move to milestones review
        return {
          action: 'intro_accepted',
          newState: {
            ...state,
            subStep: 'review_milestones'
          }
        };

      case 'review_milestones':
        // Move to artifacts review
        return {
          action: 'next_component',
          newState: {
            ...state,
            subStep: 'review_artifacts',
            acceptedMilestones: true
          }
        };

      case 'review_artifacts':
        // Move to criteria review
        return {
          action: 'next_component',
          newState: {
            ...state,
            subStep: 'review_criteria',
            acceptedArtifacts: true
          }
        };

      case 'review_criteria':
        // All components accepted - finalize
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

      case 'suggest_deliverables':
        // Accepting from complete view
        const capturedAll = {
          milestones: state.suggestedMilestones.map(m => ({ name: m })),
          artifacts: state.suggestedArtifacts.map(a => ({ name: a })),
          rubric: { criteria: state.suggestedCriteria }
        };

        return {
          action: 'accept_all',
          newState: {
            ...state,
            subStep: 'finalize',
            workingMilestones: capturedAll.milestones,
            workingArtifacts: capturedAll.artifacts,
            workingCriteria: capturedAll.rubric.criteria
          },
          captured: capturedAll
        };
    }
  }

  // If no clear action, return none
  return {
    action: 'none',
    message: "I'm not sure what you'd like to do. Say **\"yes\"** to continue, or ask for help."
  };
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

/**
 * Get suggested action chips based on current deliverables micro-flow state
 */
export function getDeliverablesActionChips(state: DeliverablesMicroState): string[] {
  switch (state.subStep) {
    case 'intro':
      return ['Yes, start with milestones', 'Show all components', 'Explain more'];

    case 'review_milestones':
      return ['Yes, these work', 'Customize milestones', 'Show all at once'];

    case 'review_artifacts':
      return ['Yes, continue', 'Customize artifacts', 'Show criteria too'];

    case 'review_criteria':
      return ['Yes, finalize these', 'Customize criteria', 'Review all again'];

    case 'suggest_deliverables':
      return ['Yes, use all of these', 'Customize milestones', 'Customize artifacts'];

    default:
      return [];
  }
}
