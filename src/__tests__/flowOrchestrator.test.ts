import { FlowOrchestrator } from '../services/FlowOrchestrator';

const baseState = {
  stage: 'BIG_IDEA' as const,
  messageCountInStage: 0,
  ideation: {
    bigIdea: '',
    bigIdeaConfirmed: false,
    essentialQuestion: '',
    essentialQuestionConfirmed: false,
    challenge: '',
    challengeConfirmed: false
  }
};

describe('FlowOrchestrator.detect', () => {
  it('accepts Big Idea and advances to EQ with commit', () => {
    const plan = FlowOrchestrator.detect({ ...baseState, stage: 'BIG_IDEA' }, 'Systems thinking');
    expect(plan.type).toBe('commitAndAdvance');
    expect(plan.save?.stageKey).toBe('bigIdea');
    expect(plan.nextStage).toBe('ESSENTIAL_QUESTION');
  });

  it('awaits confirmation on EQ-looking input', () => {
    const state = { ...baseState, stage: 'ESSENTIAL_QUESTION' as const };
    const plan = FlowOrchestrator.detect(state, 'How can we reduce waste?');
    expect(plan.type).toBe('awaitConfirmation');
    expect(plan.awaiting?.type).toBe('essentialQuestion');
  });

  it('proposes minimal plan on Journey progress signal', () => {
    const state = { ...baseState, stage: 'JOURNEY' as const };
    const plan = FlowOrchestrator.detect(state, "let's continue");
    expect(plan.type).toBe('proposeMinimal');
    expect(plan.awaiting?.type).toBe('journey');
  });

  it('proposes minimal deliverables on Deliverables progress signal', () => {
    const state = { ...baseState, stage: 'DELIVERABLES' as const };
    const plan = FlowOrchestrator.detect(state, 'next step');
    expect(plan.type).toBe('proposeMinimal');
    expect(plan.awaiting?.type).toBe('deliverables');
  });
});

