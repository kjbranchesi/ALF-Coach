// Creativity rails to encourage divergent thinking while keeping guidance structured.

export type Rail = 'core' | 'cross' | 'moonshot' | 'student-led';

export function railDescriptions(stepName: string) {
  return {
    core: `A practical, immediately doable ${stepName.toLowerCase()} aligned to the selected subject(s) and age group.`,
    cross: `A cross-disciplinary ${stepName.toLowerCase()} that blends the primary subject with another area (e.g., civic or arts connection).`,
    moonshot: `A bold, outside-the-box ${stepName.toLowerCase()} that stretches ambition or audience while staying ethical and inclusive.`,
    'student-led': `A ${stepName.toLowerCase()} that gives students meaningful voice/choice, including options for different learners.`
  } as Record<Rail, string>;
}

export function noveltyConstraints() {
  return [
    'low-tech option available',
    'public audience beyond the classroom',
    'equity-centered framing (access, inclusion, representation)',
    'real partner or stakeholder',
    'feedback loop / critique included',
    'time-boxed iteration (rapid prototype)',
  ];
}

