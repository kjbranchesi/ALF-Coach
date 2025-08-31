/**
 * FlowOrchestrator
 * Centralizes deterministic conversation flow transitions for ALF stages.
 * Keeps the chat on rails and resilient to AI variability.
 */

export type StageId =
  | 'BIG_IDEA'
  | 'ESSENTIAL_QUESTION'
  | 'CHALLENGE'
  | 'JOURNEY'
  | 'DELIVERABLES'
  | 'COMPLETE';

export interface ProjectStateLite {
  stage: StageId;
  messageCountInStage: number;
  awaitingConfirmation?: { type: string; value: string };
  ideation: {
    bigIdea: string;
    bigIdeaConfirmed: boolean;
    essentialQuestion: string;
    essentialQuestionConfirmed: boolean;
    challenge: string;
    challengeConfirmed: boolean;
  };
}

export interface TransitionPlan {
  type:
    | 'none'
    | 'awaitConfirmation'
    | 'commitAndAdvance'
    | 'proposeMinimal'
    | 'clearAwaiting';
  save?: { stageKey: string; value: string; label: string };
  nextStage?: StageId;
  awaiting?: { type: string; value: string };
  celebrateLabel?: string;
}

const PROGRESSION_SIGNALS = [
  "sounds good",
  "let's continue",
  "what's next",
  'next step',
  "i'm ready",
  'that works',
  'perfect',
  'great',
  "yes, let's",
  "let's move on",
  'i like that',
  "that's it",
  'exactly',
  'yes',
  'ready'
];

const REFINEMENT_SIGNALS = ['refine', 'change', 'adjust', 'another', 'try again'];

const CONFUSION_SIGNALS = [
  'not sure',
  "don't understand",
  'confused',
  'what do you mean',
  'can you explain',
  'help me',
  "i don't know",
  'unclear',
  'lost'
];

function containsAny(text: string, phrases: string[]): boolean {
  const t = text.toLowerCase();
  return phrases.some((p) => t.includes(p));
}

export const FlowOrchestrator = {
  detect(state: ProjectStateLite, userInput: string): TransitionPlan {
    const input = (userInput || '').trim();
    const lc = input.toLowerCase();

    // Always increment message count at caller.
    // Confusion → stay and provide support
    if (containsAny(lc, CONFUSION_SIGNALS)) {
      return { type: 'none' };
    }

    const wantsToProgress = containsAny(lc, PROGRESSION_SIGNALS);
    const wantsRefine = containsAny(lc, REFINEMENT_SIGNALS);

    // Handle awaiting confirmation flows first
    const awaiting = state.awaitingConfirmation;
    if (awaiting) {
      if (wantsToProgress) {
        // Confirm and advance based on awaiting type
        switch (awaiting.type) {
          case 'bigIdea':
            return {
              type: 'commitAndAdvance',
              save: { stageKey: 'bigIdea', value: awaiting.value, label: 'Big Idea' },
              nextStage: 'ESSENTIAL_QUESTION',
              celebrateLabel: 'Big Idea'
            };
          case 'essentialQuestion':
            return {
              type: 'commitAndAdvance',
              save: { stageKey: 'essentialQuestion', value: awaiting.value, label: 'Essential Question' },
              nextStage: 'CHALLENGE',
              celebrateLabel: 'Essential Question'
            };
          case 'challenge':
            return {
              type: 'commitAndAdvance',
              save: { stageKey: 'challenge', value: awaiting.value, label: 'Challenge Definition' },
              nextStage: 'JOURNEY',
              celebrateLabel: 'Challenge Definition'
            };
          case 'journey':
            return {
              type: 'commitAndAdvance',
              save: { stageKey: 'phases', value: awaiting.value, label: 'Learning Journey Phases' },
              nextStage: 'DELIVERABLES',
              celebrateLabel: 'Learning Journey'
            };
          case 'deliverables':
            return {
              type: 'commitAndAdvance',
              save: { stageKey: 'deliverables', value: awaiting.value, label: 'Deliverables & Assessment' },
              nextStage: 'COMPLETE',
              celebrateLabel: 'Project Blueprint'
            };
          default:
            return { type: 'clearAwaiting' };
        }
      }
      if (wantsRefine) {
        return { type: 'clearAwaiting' };
      }
      // Non-signal input while awaiting → treat as refinement if substantive
      if (input.length > 3) {
        return {
          type: 'awaitConfirmation',
          awaiting: { type: awaiting.type, value: input }
        };
      }
      return { type: 'none' };
    }

    // Stage-specific logic when not awaiting
    switch (state.stage) {
      case 'BIG_IDEA': {
        const hasSubstance = input.length > 3;
        const forceAccept = state.messageCountInStage >= 2;
        if (hasSubstance || forceAccept) {
          return {
            type: 'commitAndAdvance',
            save: { stageKey: 'bigIdea', value: input, label: 'Big Idea' },
            nextStage: 'ESSENTIAL_QUESTION',
            celebrateLabel: 'Big Idea'
          };
        }
        return { type: 'none' };
      }
      case 'ESSENTIAL_QUESTION': {
        const isQuestion = lc.includes('?') || lc.startsWith('how') || lc.startsWith('why') || lc.startsWith('what');
        const forceAccept = state.messageCountInStage >= 3;
        if (isQuestion || forceAccept) {
          return {
            type: 'awaitConfirmation',
            awaiting: { type: 'essentialQuestion', value: input }
          };
        }
        return { type: 'none' };
      }
      case 'CHALLENGE': {
        const hasSubstance = input.length > 15;
        const forceAccept = state.messageCountInStage >= 3;
        if (hasSubstance || forceAccept) {
          return {
            type: 'awaitConfirmation',
            awaiting: { type: 'challenge', value: input }
          };
        }
        return { type: 'none' };
      }
      case 'JOURNEY': {
        // If user signals progress, propose minimal plan
        if (wantsToProgress) {
          const minimalPlan = `Analyze → Brainstorm → Prototype → Evaluate\n- Analyze: research + stakeholder perspectives\n- Brainstorm: generate and select ideas\n- Prototype: build and test with users\n- Evaluate: measure impact and refine`;
          return {
            type: 'proposeMinimal',
            awaiting: { type: 'journey', value: minimalPlan }
          };
        }
        const journeyKeywords = ['research', 'analyze', 'brainstorm', 'prototype', 'create', 'test', 'evaluate', 'phase', 'week', 'timeline'];
        const hasJourneyContent = journeyKeywords.some((k) => lc.includes(k));
        if (hasJourneyContent && input.length > 50) {
          return {
            type: 'awaitConfirmation',
            awaiting: { type: 'journey', value: input }
          };
        }
        return { type: 'none' };
      }
      case 'DELIVERABLES': {
        if (wantsToProgress) {
          const minimalDeliverables = `Milestones: kickoff, midpoint review, final showcase\nRubric: understanding, process, product (3 levels)\nImpact: share with authentic audience (e.g., community or stakeholders)`;
          return {
            type: 'proposeMinimal',
            awaiting: { type: 'deliverables', value: minimalDeliverables }
          };
        }
        return { type: 'none' };
      }
      default:
        return { type: 'none' };
    }
  }
};

