/**
 * Journey Micro-Flow
 * Handles multi-turn conversation for complex journey building
 */

import type { CapturedData, WizardContext } from './stages';
import { estimateDurationWeeks, recommendedPhaseCount, allocateWeekRanges } from './stages';

export type JourneySubStep =
  | 'ask_context'           // NEW: Ask diagnostic questions before suggesting
  | 'review_phase'          // NEW: Review one phase at a time
  | 'suggest_journey'       // Show complete suggestion (fallback)
  | 'confirm_or_customize'  // Accept / Customize / Start over
  | 'customize_phase'       // Drill into specific phase
  | 'finalize';             // Done

export interface JourneyMicroState {
  subStep: JourneySubStep;
  suggestedPhases: Array<{ name: string; duration: string; summary: string; activities: string[] }>;
  workingPhases: Array<{ name: string; activities: string[] }>;
  customizingPhaseIndex: number | null;
  currentPhaseIndex: number;      // NEW: Track which phase being reviewed
  acceptedPhases: number[];       // NEW: Track accepted phases
  hasAskedContext: boolean;       // NEW: Whether we've asked diagnostic questions
}

interface JourneyTemplatePhase {
  title: string;
  summary: string;
  defaultActivities: string[];
}

/**
 * Generate smart default journey based on context
 */
export function generateSmartJourney(
  captured: CapturedData,
  wizard: WizardContext
): JourneyMicroState['suggestedPhases'] {
  const weeks = estimateDurationWeeks(wizard.duration);
  const phaseCount = recommendedPhaseCount(weeks);
  const ranges = allocateWeekRanges(weeks, phaseCount);

  const topic = captured.ideation.challenge || captured.ideation.essentialQuestion || wizard.projectTopic || 'the challenge';
  const deliverable = inferDeliverableType(captured, wizard);
  const audience = inferAudience(captured, wizard);

  // Context-aware template selection
  const template = selectTemplate(wizard.subjects, deliverable);

  return template.slice(0, phaseCount).map((phase, index) => {
    const contextualSummary = phase.summary
      .replace('{topic}', topic)
      .replace('{deliverable}', deliverable)
      .replace('{audience}', audience);

    return {
      name: phase.title,
      duration: ranges[index] || '',
      summary: contextualSummary,
      activities: phase.defaultActivities
    };
  });
}

function inferDeliverableType(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';

  if (/exhibit/i.test(challenge)) return 'exhibition';
  if (/campaign/i.test(challenge)) return 'campaign';
  if (/proposal/i.test(challenge)) return 'proposal';
  if (/prototype/i.test(challenge)) return 'prototype';
  if (/podcast/i.test(challenge)) return 'podcast';
  if (/documentary/i.test(challenge)) return 'documentary';

  return 'project artifact';
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

function selectTemplate(subjects: string[] | undefined, deliverableType: string): JourneyTemplatePhase[] {
  const subject = subjects?.[0]?.toLowerCase() || '';

  // Science-specific templates
  if (subject.includes('science') || subject.includes('stem')) {
    return [
      {
        title: 'Research & Explore',
        summary: 'Investigate the scientific concepts behind {topic} through research and experimentation.',
        defaultActivities: ['Literature review', 'Lab experiments', 'Data collection']
      },
      {
        title: 'Hypothesis & Design',
        summary: 'Form testable hypotheses and design the {deliverable} approach.',
        defaultActivities: ['Develop hypotheses', 'Create experimental design', 'Plan methodology']
      },
      {
        title: 'Build & Test',
        summary: 'Construct prototypes and test them with {audience} feedback.',
        defaultActivities: ['Build prototype', 'Run tests', 'Collect feedback']
      },
      {
        title: 'Analyze & Present',
        summary: 'Analyze results and present findings to {audience}.',
        defaultActivities: ['Data analysis', 'Create visualizations', 'Practice presentation']
      }
    ];
  }

  // Humanities/Social Studies templates
  if (subject.includes('history') || subject.includes('social') || subject.includes('humanities')) {
    return [
      {
        title: 'Investigate Context',
        summary: 'Audit current realities around {topic} and interview {audience}.',
        defaultActivities: ['Research historical context', 'Conduct interviews', 'Analyze primary sources']
      },
      {
        title: 'Analyze & Synthesize',
        summary: 'Compare perspectives and identify patterns related to {topic}.',
        defaultActivities: ['Compare viewpoints', 'Identify themes', 'Create synthesis']
      },
      {
        title: 'Co-Design Solutions',
        summary: 'Run brainstorming sprints and pick a direction for the {deliverable}.',
        defaultActivities: ['Brainstorm ideas', 'Evaluate options', 'Select approach']
      },
      {
        title: 'Launch & Reflect',
        summary: 'Finalize the {deliverable} and present to {audience}.',
        defaultActivities: ['Refine final work', 'Rehearse presentation', 'Reflect on process']
      }
    ];
  }

  // Arts templates
  if (subject.includes('art') || subject.includes('music') || subject.includes('theatre')) {
    return [
      {
        title: 'Explore & Experiment',
        summary: 'Investigate artistic techniques and experiment with approaches to {topic}.',
        defaultActivities: ['Research artists/styles', 'Experimental sketches', 'Try multiple mediums']
      },
      {
        title: 'Develop Concept',
        summary: 'Refine artistic vision and plan the {deliverable} for {audience}.',
        defaultActivities: ['Concept development', 'Storyboarding', 'Collect feedback']
      },
      {
        title: 'Create & Iterate',
        summary: 'Produce the {deliverable} and refine based on critiques.',
        defaultActivities: ['Create first draft', 'Peer critique', 'Revise work']
      },
      {
        title: 'Exhibition & Reflection',
        summary: 'Present work to {audience} and reflect on artistic growth.',
        defaultActivities: ['Install/stage work', 'Artist talk', 'Reflection']
      }
    ];
  }

  // Default/General template (works for most subjects)
  return [
    {
      title: 'Investigate the Context',
      summary: 'Audit current realities around {topic} and interview {audience}.',
      defaultActivities: ['Research topic', 'Conduct interviews', 'Identify key issues']
    },
    {
      title: 'Co-Design Possibilities',
      summary: 'Run brainstorming sprints, analyze models, and pick a direction for the {deliverable}.',
      defaultActivities: ['Brainstorm solutions', 'Analyze examples', 'Choose direction']
    },
    {
      title: 'Prototype & Test',
      summary: 'Build a draft, run a critique, and capture feedback from peers and {audience}.',
      defaultActivities: ['Create prototype', 'Peer review', 'Gather feedback']
    },
    {
      title: 'Launch & Reflect',
      summary: 'Finalize the {deliverable}, rehearse the presentation, and plan reflection on impact.',
      defaultActivities: ['Final revisions', 'Rehearse presentation', 'Deliver to audience']
    }
  ];
}

/**
 * Initialize journey micro-flow
 */
export function initJourneyMicroFlow(captured: CapturedData, wizard: WizardContext): JourneyMicroState {
  const suggestedPhases = generateSmartJourney(captured, wizard);

  return {
    subStep: 'ask_context',        // Start by asking diagnostic questions
    suggestedPhases,
    workingPhases: [],
    customizingPhaseIndex: null,
    currentPhaseIndex: 0,
    acceptedPhases: [],
    hasAskedContext: false
  };
}

/**
 * Generate diagnostic questions before showing journey
 */
export function formatContextQuestions(captured: CapturedData, wizard: WizardContext): string {
  const topic = captured.ideation?.challenge || captured.ideation?.essentialQuestion || wizard.projectTopic || 'this topic';
  const gradeLevel = wizard.gradeLevel || 'students';

  return `**Time to map the learning journey!**

In PBL, the "learning journey" is the sequence of work phases—from investigation through presentation. Think of it as your project's story arc.

Most projects flow through 3-4 phases:
1. **Investigate** - Build knowledge and context
2. **Design/Ideate** - Generate solutions
3. **Create/Prototype** - Build the deliverable
4. **Present/Reflect** - Share with audience

**Before I suggest phases, tell me:**
• Do your ${gradeLevel} have prior knowledge about ${topic}?
• Will they need significant research time, or can they jump into creating quickly?

Or say **"suggest a journey"** and I'll create one based on your project context.`;
}

/**
 * Format single phase for progressive review
 */
export function formatSinglePhase(
  phase: { name: string; duration: string; summary: string; activities: string[] },
  index: number,
  totalPhases: number
): string {
  const lines = [
    `**Phase ${index + 1} of ${totalPhases}: ${phase.name}**`,
    phase.duration ? `*${phase.duration}*` : '',
    '',
    phase.summary,
    ''
  ];

  if (phase.activities.length > 0) {
    lines.push('**Key activities:**');
    phase.activities.forEach(activity => {
      lines.push(`  • ${activity}`);
    });
    lines.push('');
  }

  lines.push('**Does this phase fit your project?**');

  return lines.filter(Boolean).join('\n');
}

/**
 * Format complete journey suggestion (fallback for "show all" requests)
 */
export function formatJourneySuggestion(state: JourneyMicroState): string {
  const lines = [
    "Here's a complete learning journey for your project:",
    ""
  ];

  state.suggestedPhases.forEach((phase, index) => {
    lines.push(`**Phase ${index + 1}: ${phase.name}** ${phase.duration ? `(${phase.duration})` : ''}`);
    lines.push(phase.summary);
    if (phase.activities.length > 0) {
      lines.push(`  • ${phase.activities.join('\n  • ')}`);
    }
    lines.push("");
  });

  return lines.join('\n');
}

/**
 * Handle user's response to journey suggestion
 * Parses natural language input and determines action
 */
export function handleJourneyChoice(
  state: JourneyMicroState,
  userInput: string,
  phaseIndex?: number | null
): {
  action: 'accept' | 'next_phase' | 'accept_all' | 'refine' | 'regenerate' | 'show_all' | 'none';
  updatedState?: JourneyMicroState;
  finalPhases?: Array<{ name: string; activities: string[] }>;
  message?: string;
} {
  const input = userInput.toLowerCase().trim();

  // Check for "suggest a journey" / "show all phases" requests
  const showAllPatterns = [
    /suggest.*journey/i,
    /show.*all/i,
    /show.*complete/i,
    /see.*all.*phases/i
  ];

  if (showAllPatterns.some(p => p.test(input))) {
    return {
      action: 'show_all',
      updatedState: {
        ...state,
        subStep: 'suggest_journey',
        hasAskedContext: true
      }
    };
  }

  // If in 'review_phase' mode, handle phase-specific acceptance
  if (state.subStep === 'review_phase') {
    const acceptPatterns = [
      /^(yes|yep|yeah|yup|sure|okay|ok|perfect|great|looks good|sounds good)$/i,
      /^(use (this|that|these|it)|let'?s (use|go with) (this|that|it))$/i,
      /^i like (it|this|that)$/i,
      /^(continue|next|move on)$/i
    ];

    const isAccept = acceptPatterns.some(p => p.test(input));

    if (isAccept) {
      const newAcceptedPhases = [...state.acceptedPhases, state.currentPhaseIndex];
      const nextIndex = state.currentPhaseIndex + 1;

      // If this was the last phase, finalize
      if (nextIndex >= state.suggestedPhases.length) {
        const capturedPhases = state.suggestedPhases.map(p => ({
          name: p.name,
          activities: p.activities
        }));

        return {
          action: 'accept_all',
          finalPhases: capturedPhases,
          updatedState: {
            ...state,
            subStep: 'finalize',
            workingPhases: capturedPhases,
            acceptedPhases: newAcceptedPhases
          }
        };
      }

      // Move to next phase
      return {
        action: 'next_phase',
        updatedState: {
          ...state,
          currentPhaseIndex: nextIndex,
          acceptedPhases: newAcceptedPhases
        }
      };
    }
  }

  // Global acceptance (for complete journey view)
  const acceptPatterns = [
    /^(yes|yep|yeah|yup|sure|okay|ok|perfect|great|looks good|sounds good)$/i,
    /^(use (this|that|these|it)|let'?s (use|go with) (this|that|it))$/i,
    /^i like (it|this|that)$/i
  ];

  const isAccept = acceptPatterns.some(p => p.test(input));

  if (isAccept && state.subStep !== 'ask_context') {
    // Convert suggested phases to captured format
    const capturedPhases = state.suggestedPhases.map(p => ({
      name: p.name,
      activities: p.activities
    }));

    return {
      action: 'accept_all',
      finalPhases: capturedPhases,
      updatedState: {
        ...state,
        subStep: 'finalize',
        workingPhases: capturedPhases
      }
    };
  }

  // If user answered context questions, move to progressive review
  if (state.subStep === 'ask_context' && input.length > 10) {
    return {
      action: 'next_phase',
      updatedState: {
        ...state,
        subStep: 'review_phase',
        hasAskedContext: true,
        currentPhaseIndex: 0
      },
      message: "Thanks! Based on your context, here's the first phase..."
    };
  }

  // Check for customization requests
  const customizePatterns = [
    /\b(customize|modify|change|adjust|edit|tweak)\b/i,
    /\bphase\s+(\d+|one|two|three|four)\b/i,
    /\b(different|shorter|longer|fewer phases|more phases)\b/i
  ];

  const isCustomize = customizePatterns.some(p => p.test(input));

  if (isCustomize) {
    // Check if they want different number of phases
    if (/\b(3|three|just 3)\s+phases?\b/i.test(input)) {
      // Regenerate with 3 phases
      const reducedPhases = state.suggestedPhases.slice(0, 3);
      return {
        action: 'refine',
        updatedState: {
          ...state,
          suggestedPhases: reducedPhases
        }
      };
    }

    if (/\b(shorter|fewer)\b/i.test(input)) {
      // Reduce phase count
      const currentCount = state.suggestedPhases.length;
      const newCount = Math.max(2, currentCount - 1);
      const reducedPhases = state.suggestedPhases.slice(0, newCount);
      return {
        action: 'refine',
        updatedState: {
          ...state,
          suggestedPhases: reducedPhases
        }
      };
    }

    // Generic customize - just offer to regenerate for now
    return {
      action: 'regenerate'
    };
  }

  // Check for regeneration requests
  const regeneratePatterns = [
    /^(no|nah|not quite|different|other|another|try again|regenerate|new suggestion)/i,
    /\b(show me (something|anything) (else|different))\b/i
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
    message: "I'm not sure what you'd like to do. You can:\n• Say **\"yes\"** to use this journey\n• Ask for **\"something shorter\"** if you want fewer phases\n• Request **\"different suggestions\"** for alternatives"
  };
}

/**
 * Check if journey input is trying to reference/modify a phase
 */
export function detectPhaseReference(input: string): number | null {
  const phaseMatch = input.match(/phase\s*(\d+|one|two|three|four|five)/i);
  if (!phaseMatch) return null;

  const num = phaseMatch[1].toLowerCase();
  switch (num) {
    case 'one':
    case '1':
      return 0;
    case 'two':
    case '2':
      return 1;
    case 'three':
    case '3':
      return 2;
    case 'four':
    case '4':
      return 3;
    case 'five':
    case '5':
      return 4;
    default:
      const parsed = parseInt(num, 10);
      return !isNaN(parsed) && parsed > 0 ? parsed - 1 : null;
  }
}

/**
 * Get suggested action chips based on current journey micro-flow state
 */
export function getJourneyActionChips(state: JourneyMicroState): string[] {
  switch (state.subStep) {
    case 'ask_context':
      return ['Suggest a journey', 'My students know the basics', 'They need research time'];

    case 'review_phase':
      const isLastPhase = state.currentPhaseIndex >= state.suggestedPhases.length - 1;
      return isLastPhase
        ? ['Yes, use this phase', 'Customize this phase', 'Make it shorter']
        : ['Yes, continue', 'Customize this phase', 'Show all phases'];

    case 'suggest_journey':
      return ['Yes, use this journey', 'Make it shorter', 'Different approach'];

    default:
      return [];
  }
}
