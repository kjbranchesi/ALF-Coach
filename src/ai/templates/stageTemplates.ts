// Templates guiding AI suggestions by K-12 band and primary subject cluster.

export type K12Band = 'K-2' | '3-5' | '6-8' | '9-12';
export type SubjectCluster = 'science' | 'technology' | 'engineering' | 'mathematics' | 'social-studies' | 'language-arts' | 'arts' | 'music' | 'health' | 'interdisciplinary' | 'other';

function normalizeBand(label?: string): K12Band | null {
  if (!label) return null;
  const s = label.toLowerCase();
  if (s.includes('k-2') || s.includes('early')) return 'K-2';
  if (s.includes('3-5') || s.includes('primary')) return '3-5';
  if (s.includes('6-8') || s.includes('middle')) return '6-8';
  if (s.includes('9-12') || s.includes('high')) return '9-12';
  return null;
}

function normalizeSubject(primary?: string): SubjectCluster {
  const s = (primary || '').toLowerCase();
  if (s.includes('science')) return 'science';
  if (s.includes('tech')) return 'technology';
  if (s.includes('engineer')) return 'engineering';
  if (s.includes('math')) return 'mathematics';
  if (s.includes('social')) return 'social-studies';
  if (s.includes('language') || s === 'ela') return 'language-arts';
  if (s.includes('music')) return 'music';
  if (s.includes('health') || s.includes('pe')) return 'health';
  if (s.includes('art')) return 'arts';
  if (s.includes('interdisciplinary') || s.includes('interdisciplin')) return 'interdisciplinary';
  return 'other';
}

export function getTemplateHints(context: any): {
  bigIdea: string[];
  eq: string[];
  challenge: string[];
  phases: string[];
  activities: string[];
  milestones: string[];
  rubricCriteria: string[];
  exhibition: string[];
} {
  const band = normalizeBand(context?.wizard?.gradeLevel || context?.wizard?.students);
  const primary = normalizeSubject(context?.wizard?.primarySubject || context?.wizard?.subject);

  // Defaults broadly suitable across subjects
  const base = {
    bigIdea: [
      'Systems and interconnections', 'Cause and effect in real-world contexts', 'Design for equity and access',
      'Evidence and argumentation', 'Technologies shaping communities'
    ],
    eq: [
      'How might we measure meaningful change?', 'What makes a solution fair and workable?', 'How do people, tools, and places shape outcomes?'
    ],
    challenge: [
      'Design and test a solution to a local need', 'Synthesize findings into a public brief', 'Create a public artifact to inform or persuade'
    ],
    phases: ['Launch', 'Investigate', 'Create', 'Refine', 'Share'],
    activities: ['Mini-investigation', 'Interview/observation', 'Prototype and iterate', 'Peer feedback', 'Public share'],
    milestones: ['Plan approved', 'Prototype reviewed', 'Public-ready draft', 'Final showcase'],
    rubricCriteria: ['Understanding', 'Process', 'Product', 'Impact'],
    exhibition: ['Class gallery', 'Community poster session', 'Digital showcase']
  };

  const byBand: Record<K12Band, Partial<typeof base>> = {
    'K-2': {
      phases: ['Wonder', 'Explore', 'Make', 'Share'],
      activities: ['Observation journal', 'Hands-on making', 'Storytelling circle'],
      milestones: ['Class plan agreed', 'Make day complete', 'Sharing day ready'],
      rubricCriteria: ['Participation', 'Care and effort', 'Clarity'],
      exhibition: ['Class share', 'Buddy class walkthrough']
    },
    '3-5': {
      phases: ['Launch', 'Investigate', 'Design', 'Present'],
      activities: ['Data collection', 'Small-group build', 'Peer review'],
      milestones: ['Investigation notes complete', 'Design reviewed', 'Presentation rehearsal'],
      rubricCriteria: ['Accuracy', 'Creativity', 'Communication'],
      exhibition: ['School fair', 'Video gallery']
    },
    '6-8': {
      phases: ['Launch', 'Research', 'Prototype', 'Iterate', 'Showcase'],
      activities: ['Structured research', 'User testing', 'Evidence synthesis'],
      milestones: ['Research brief approved', 'Prototype tested', 'Showcase draft'],
      rubricCriteria: ['Evidence', 'Design quality', 'Collaboration', 'Reflection'],
      exhibition: ['Community expo', 'Panel review']
    },
    '9-12': {
      phases: ['Launch', 'Proposal', 'Build', 'Refine', 'Exhibit'],
      activities: ['Stakeholder interview', 'Technical build', 'Formal critique'],
      milestones: ['Proposal approved', 'Build checkpoint', 'Exhibit ready'],
      rubricCriteria: ['Rigor', 'Innovation', 'Impact', 'Professionalism'],
      exhibition: ['Public pitch', 'Policy brief', 'Website + social campaign']
    }
  };

  const bySubject: Record<SubjectCluster, Partial<typeof base>> = {
    science: {
      bigIdea: ['Systems and stability', 'Energy and change', 'Evidence-based explanations'],
      eq: ['How do we know our evidence is strong?', 'What tradeoffs exist in a scientific solution?'],
      exhibition: ['Science fair board', 'Interactive demo']
    },
    technology: {
      bigIdea: ['Human–computer interaction', 'Data and decisions', 'Automation and ethics'],
      eq: ['How might technology amplify human capability?', 'When does convenience undermine equity?'],
      exhibition: ['Interactive prototype', 'Product landing page']
    },
    engineering: {
      bigIdea: ['Design under constraints', 'Optimization and tradeoffs'],
      eq: ['How might we design for diverse users?', 'Which constraints matter most and why?'],
      exhibition: ['Prototype pitch', 'Design review panel']
    },
    mathematics: {
      bigIdea: ['Modeling real systems', 'Structure and patterns'],
      eq: ['How might a model guide better decisions?', 'What do our assumptions change?'],
      exhibition: ['Model gallery', 'Data story']
    },
    'social-studies': {
      bigIdea: ['Civic participation', 'Power and responsibility'],
      eq: ['What makes a policy equitable?', 'Whose voices are included or excluded?'],
      exhibition: ['Policy brief', 'Community forum']
    },
    'language-arts': {
      bigIdea: ['Voice and perspective', 'Rhetoric and impact'],
      eq: ['How does framing shape understanding?', 'What makes a message persuasive and ethical?'],
      exhibition: ['Public reading', 'Media piece']
    },
    arts: {
      bigIdea: ['Expression and meaning', 'Audience and impact'],
      eq: ['How do choices create emotional impact?', 'What responsibilities do artists have?'],
      exhibition: ['Gallery show', 'Performance']
    },
    music: {
      bigIdea: ['Rhythm and structure', 'Cultural storytelling'],
      eq: ['How does music shape identity?', 'What makes a composition memorable?'],
      exhibition: ['Recital', 'Community playlist']
    },
    health: {
      bigIdea: ['Well‑being and habits', 'Equity in access'],
      eq: ['How can small changes improve community health?', 'What does inclusive fitness look like?'],
      exhibition: ['Wellness campaign', 'Peer workshop']
    },
    interdisciplinary: {
      bigIdea: ['Systems thinking', 'Human-centered design'],
      eq: ['How might we design with and for the community?'],
      exhibition: ['Public showcase', 'Community partnership']
    },
    other: {}
  };

  const bandPref = band ? byBand[band] : {};
  const subjPref = bySubject[primary] || {};

  const merge = (baseArr: string[], a?: string[], b?: string[]) => {
    return Array.from(new Set([...(a || []), ...(b || []), ...baseArr])).slice(0, 6);
  };

  return {
    bigIdea: merge(base.bigIdea, subjPref.bigIdea as string[], bandPref.bigIdea as string[]),
    eq: merge(base.eq, subjPref.eq as string[], bandPref.eq as string[]),
    challenge: merge(base.challenge, subjPref.challenge as string[], bandPref.challenge as string[]),
    phases: merge(base.phases, subjPref.phases as string[], bandPref.phases as string[]),
    activities: merge(base.activities, subjPref.activities as string[], bandPref.activities as string[]),
    milestones: merge(base.milestones, subjPref.milestones as string[], bandPref.milestones as string[]),
    rubricCriteria: merge(base.rubricCriteria, subjPref.rubricCriteria as string[], bandPref.rubricCriteria as string[]),
    exhibition: merge(base.exhibition, subjPref.exhibition as string[], bandPref.exhibition as string[])
  };
}

