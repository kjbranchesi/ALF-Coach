import { buildStagePrompt } from '../prompt';
import type { Stage } from '../stages';

describe('buildStagePrompt grade-band integration', () => {
  const baseArgs = {
    stage: 'BIG_IDEA' as Stage,
    wizard: {
      subjects: ['Science'],
      gradeLevel: 'Middle School (6-8)',
      duration: '3-4 weeks',
      location: 'Classroom',
      projectTopic: 'Urban heat islands',
      materials: 'Outdoor thermometers'
    },
    userInput: '',
    snapshot: '',
    gatingReason: null,
    messageCountInStage: 0,
    stageTurns: 0,
    assessmentHint: null
  };

  it('includes guardrails when grade level is known', () => {
    const prompt = buildStagePrompt({ ...baseArgs, captured: { ideation: { bigIdea: '', essentialQuestion: '', challenge: '' }, journey: { phases: [], resources: [] }, deliverables: { milestones: [], artifacts: [], rubric: { criteria: [] } } } as any });
    expect(prompt).toContain('GRADE-BAND GUARDRAILS');
    expect(prompt).toContain('Grade-band focus:');
    expect(prompt).toContain('Plan 30-45 minute work blocks');
  });

  it('omits guardrails when grade level is missing', () => {
    const prompt = buildStagePrompt({
      ...baseArgs,
      wizard: { ...baseArgs.wizard, gradeLevel: undefined },
      captured: { ideation: { bigIdea: '', essentialQuestion: '', challenge: '' }, journey: { phases: [], resources: [] }, deliverables: { milestones: [], artifacts: [], rubric: { criteria: [] } } } as any
    });
    expect(prompt).not.toContain('GRADE-BAND GUARDRAILS');
  });
});
