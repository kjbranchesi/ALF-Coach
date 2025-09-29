// ChatPromptBuilder.ts
// Centralized prompt builder for ALF Coach. Always injects wizard context,
// stage microcopy, and progress summaries in a consistent, lightweight way.

export type StageKey =
  | 'ONBOARDING'
  | 'GROUNDING'
  | 'BIG_IDEA'
  | 'ESSENTIAL_QUESTION'
  | 'CHALLENGE'
  | 'JOURNEY'
  | 'DELIVERABLES'
  | 'COMPLETE';

export interface WizardSummaryContext {
  subjects?: string[];
  gradeLevel?: string;
  duration?: string;
  location?: string;
  projectTopic?: string;
  materials?: string;
}

export interface IdeationState {
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
}

export interface BuildPromptParams {
  stage: StageKey;
  wizard: WizardSummaryContext;
  ideation: Partial<IdeationState>;
  messageCountInStage?: number;
  awaitingConfirmation?: { type: string; value: string } | null | undefined;
  userInput: string;
}

const SYSTEM_PROMPT = `You are a master PBL educator and curriculum coach helping a teacher design a project.
Be a collaborative expert: acknowledge, educate, enhance, and advance.

Current Stage: {stage}
Context: {context}
Progress: {progress}

{stageInstructions}

Teacher's input: "{userInput}"`;

function stageInstructions(stage: StageKey, ideation: Partial<IdeationState>): string {
  switch (stage) {
    case 'BIG_IDEA':
      return `FOCUS: Develop a Big Idea (a transferable concept).
WHY: Anchors all learning and connects across disciplines.
APPROACH: Accept their idea, frame it conceptually, and guide to EQ.`;
    case 'ESSENTIAL_QUESTION':
      return `FOCUS: Shape an Essential Question linked to the Big Idea: "${ideation.bigIdea || 'Not set'}".
WHY: Drives inquiry over weeks; open-ended and debate-worthy.
APPROACH: Affirm, suggest tweaks to make it richer, and prep for Challenge.`;
    case 'CHALLENGE':
      return `FOCUS: Define an authentic Challenge addressing their EQ: "${ideation.essentialQuestion || 'Not set'}".
WHY: Gives real purpose and audience; boosts engagement.
APPROACH: Affirm realism, audience, scope; set up journey planning.`;
    case 'JOURNEY':
      return `FOCUS: Outline phases (Analyze → Brainstorm → Prototype → Evaluate) and checkpoints.
ACCEPTANCE: Any structured plan is fine; confirm before Deliverables.`;
    case 'DELIVERABLES':
      return `FOCUS: Final artifacts, rubric (3–6 criteria, 4 levels), exhibition, communications.
ACCEPTANCE: Confirm completion and readiness to publish.`;
    default:
      return `FOCUS: Understand teacher intent and keep momentum.`;
  }
}

function buildContext(wizard: WizardSummaryContext, stage: StageKey, messageCountInStage?: number, awaiting?: BuildPromptParams['awaitingConfirmation']): string {
  const subjectText = wizard.subjects?.length ? wizard.subjects.join(' & ') : 'Not specified';
  return [
    `Subjects: ${subjectText}`,
    `Grade: ${wizard.gradeLevel || 'Not specified'}`,
    `Duration: ${wizard.duration || 'Not specified'}`,
    wizard.projectTopic ? `Topic: ${wizard.projectTopic}` : null,
    wizard.location ? `Location: ${wizard.location}` : null,
    `Stage: ${stage}`,
    `Messages in stage: ${messageCountInStage ?? 0}`,
    `Awaiting confirmation: ${awaiting ? `Yes (${awaiting.type})` : 'No'}`
  ].filter(Boolean).join('\n');
}

function buildProgress(ideation: Partial<IdeationState>): string {
  return [
    `Big Idea: ${ideation.bigIdea || 'Not set'}`,
    `Essential Question: ${ideation.essentialQuestion || 'Not set'}`,
    `Challenge: ${ideation.challenge || 'Not set'}`
  ].join('\n');
}

export function buildPrompt(params: BuildPromptParams): string {
  const ctx = buildContext(params.wizard, params.stage, params.messageCountInStage, params.awaitingConfirmation);
  const prog = buildProgress(params.ideation);
  const instr = stageInstructions(params.stage, params.ideation);
  return SYSTEM_PROMPT
    .replace('{stage}', params.stage)
    .replace('{context}', ctx)
    .replace('{progress}', prog)
    .replace('{stageInstructions}', instr)
    .replace('{userInput}', params.userInput);
}

