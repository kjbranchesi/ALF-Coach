import { buildPrompt } from '../services/ChatPromptBuilder';

describe('ChatPromptBuilder', () => {
  it('injects wizard context and ideation into prompt', () => {
    const prompt = buildPrompt({
      stage: 'BIG_IDEA',
      wizard: {
        subjects: ['Science', 'Art'],
        gradeLevel: 'Middle',
        duration: '4–6 weeks',
        location: 'Classroom',
        projectTopic: 'Water conservation',
        materials: 'Recycled paper'
      },
      ideation: {
        bigIdea: 'Systems have interconnected parts',
        essentialQuestion: '',
        challenge: ''
      },
      messageCountInStage: 0,
      awaitingConfirmation: null,
      userInput: 'Let’s begin'
    });

    expect(prompt).toContain('BIG_IDEA');
    expect(prompt).toContain('Subjects: Science & Art');
    expect(prompt).toContain('Grade: Middle');
    expect(prompt).toContain('Duration: 4–6 weeks');
    expect(prompt).toContain('Systems have interconnected parts');
    expect(prompt).toContain('Let’s begin');
  });
});

