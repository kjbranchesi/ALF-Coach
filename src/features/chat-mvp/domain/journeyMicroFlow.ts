/**
 * Journey Micro-Flow
 * Handles multi-turn conversation for complex journey building
 */

import type { CapturedData, WizardContext } from './stages';
import { estimateDurationWeeks, recommendedPhaseCount, allocateWeekRanges } from './stages';

export type JourneySubStep =
  | 'suggest_journey'       // Show complete suggestion
  | 'confirm_or_customize'  // Accept / Customize / Start over
  | 'customize_phase'       // Drill into specific phase
  | 'finalize';             // Done

export interface JourneyMicroState {
  subStep: JourneySubStep;
  suggestedPhases: Array<{ name: string; duration: string; summary: string; activities: string[] }>;
  workingPhases: Array<{ name: string; activities: string[] }>;
  customizingPhaseIndex: number | null;
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
    subStep: 'suggest_journey',
    suggestedPhases,
    workingPhases: [],
    customizingPhaseIndex: null
  };
}

/**
 * Format journey suggestion for display in chat
 */
export function formatJourneySuggestion(state: JourneyMicroState): string {
  const lines = [
    "Here's a suggested learning journey for your project:",
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
 * Handle user's choice to accept, customize, or start over
 */
export function handleJourneyChoice(
  state: JourneyMicroState,
  choice: 'accept' | 'customize' | 'start_over',
  phaseIndex?: number
): { newState: JourneyMicroState; capturedPhases?: Array<{ name: string; activities: string[] }> } {
  switch (choice) {
    case 'accept':
      // Convert suggested to working and finalize
      const capturedPhases = state.suggestedPhases.map(p => ({
        name: p.name,
        activities: p.activities
      }));
      return {
        newState: {
          ...state,
          subStep: 'finalize',
          workingPhases: capturedPhases
        },
        capturedPhases
      };

    case 'customize':
      // Enter customize mode for a specific phase
      const indexToCustomize = phaseIndex !== undefined ? phaseIndex : 0;
      return {
        newState: {
          ...state,
          subStep: 'customize_phase',
          customizingPhaseIndex: indexToCustomize,
          workingPhases: state.suggestedPhases.map(p => ({
            name: p.name,
            activities: p.activities
          }))
        }
      };

    case 'start_over':
      // Reset to empty state - they'll build from scratch
      return {
        newState: {
          ...state,
          subStep: 'customize_phase',
          customizingPhaseIndex: 0,
          workingPhases: []
        }
      };

    default:
      return { newState: state };
  }
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
