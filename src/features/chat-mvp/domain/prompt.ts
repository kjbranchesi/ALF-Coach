import type { Stage } from './stages';
import { buildPrompt } from '../../../services/ChatPromptBuilder';

export function buildStagePrompt(params: {
  stage: Stage;
  wizard: {
    subjects?: string[];
    gradeLevel?: string;
    duration?: string;
    location?: string;
    projectTopic?: string;
    materials?: string;
  };
  ideation: { bigIdea?: string; essentialQuestion?: string; challenge?: string };
  userInput: string;
  messageCountInStage?: number;
}) {
  return buildPrompt({
    stage: params.stage,
    wizard: params.wizard,
    ideation: {
      bigIdea: params.ideation.bigIdea || '',
      essentialQuestion: params.ideation.essentialQuestion || '',
      challenge: params.ideation.challenge || ''
    },
    messageCountInStage: params.messageCountInStage || 0,
    awaitingConfirmation: null,
    userInput: params.userInput
  } as any);
}

