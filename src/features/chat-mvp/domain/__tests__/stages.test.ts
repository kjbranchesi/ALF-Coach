import {
  createEmptyCaptured,
  dynamicSuggestions,
  estimateDurationWeeks,
  extractPhasesFromText,
  transitionMessageFor
} from '../stages';

describe('extractPhasesFromText', () => {
  it('parses narrative descriptions into structured phases', () => {
    const input = 'First students investigate local waste habits and interview cafeteria staff. Then they map root causes, brainstorm options, and decide on a direction. Finally they prototype solutions and pitch ideas to the city council.';
    const phases = extractPhasesFromText(input);

    expect(phases).toHaveLength(3);
    expect(phases[0].name.toLowerCase()).toContain('investigate');
    expect(phases[1].activities.join(' ').toLowerCase()).toContain('brainstorm');
    expect(phases[2].activities.join(' ').toLowerCase()).toContain('prototype');
  });
});

describe('estimateDurationWeeks', () => {
  it('normalizes common duration phrases to weeks', () => {
    expect(estimateDurationWeeks('6 weeks')).toBe(6);
    expect(estimateDurationWeeks('2 months')).toBe(8);
    expect(estimateDurationWeeks('one semester')).toBe(18);
  });
});

describe('transitionMessageFor', () => {
  it('includes grounded journey example when moving to the journey stage', () => {
    const captured = createEmptyCaptured();
    captured.ideation.bigIdea = 'Personal choices shape community wellness';
    captured.ideation.essentialQuestion = 'How might we help families adopt healthier routines?';
    captured.ideation.challenge = 'Design a neighborhood wellness toolkit for families';

    const wizard = {
      gradeLevel: 'High School',
      subjects: ['Health'],
      duration: '6 weeks',
      projectTopic: 'Wellness campaign'
    };

    const message = transitionMessageFor('CHALLENGE', captured, wizard);
    expect(message).toContain('Example journey outline:');
    expect(message.toLowerCase()).toContain('investigate the context');
  });
});

describe('dynamicSuggestions', () => {
  const wizard = {
    gradeLevel: 'High School',
    subjects: ['Design'],
    duration: '6 weeks',
    projectTopic: 'Community innovation'
  };

  it('offers journey scaffold suggestions when phases are missing', () => {
    const captured = createEmptyCaptured();
    const suggestions = dynamicSuggestions('JOURNEY', wizard, captured);
    expect(suggestions[0].toLowerCase()).toContain('investigate');
  });

  it('offers deliverable prompts derived from journey context', () => {
    const captured = createEmptyCaptured();
    captured.ideation.challenge = 'Launch a community innovation fair for local partners';

    const suggestions = dynamicSuggestions('DELIVERABLES', wizard, captured);
    expect(suggestions[0]).toContain('Milestone');
    expect(suggestions[1]).toContain('Artifact');
  });
});
