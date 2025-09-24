export interface QuickSparkInput {
  subject: string;
  gradeBand: string;
  topic?: string;
}

export interface QuickSparkResult {
  hooks: string[];
  miniActivity: {
    do: string[];
    share: string[];
    reflect: string[];
    materials: string[];
    timeWindow: string;
    differentiationHint: string;
    aiTip?: string;
  };
}

const fallbackStarters: Record<string, string[]> = {
  'science': [
    'What everyday system in our community depends on this science concept?',
    'What would break if this process stopped working tomorrow?',
    'How could young scientists investigate this with simple tools?'
  ],
  'social studies': [
    'Whose story has been left out of the timeline we teach?',
    'What would change if we mapped this issue from a student perspective?',
    'How does this topic show up on our block right now?'
  ],
  'ela': [
    'What voices are missing from the texts we read?',
    'How might this topic sound if told through our community?',
    'What does this idea invite us to notice or question today?'
  ],
  'math': [
    'Where is this math idea hiding in our halls or neighborhood?',
    'What would break if we ignored this pattern?',
    'How could we teach this idea with a story or artifact we love?'
  ]
};

const fallbackMiniActivity = ({ subject, topic }: QuickSparkInput): QuickSparkResult['miniActivity'] => {
  const focus = topic || subject || 'project idea';

  return {
    do: [
      `Collect three fast observations or examples connected to ${focus}.`,
      'Sort them into “evidence we have” and “questions we still have”.',
      'Draft one high-energy prompt or question to investigate next.',
      'Share a 30-second pitch of why this matters right now.'
    ],
    share: ['Gallery share of pitches with sticky-note feedback'],
    reflect: ['What surprised us?', 'Who else should weigh in next?'],
    materials: ['Chart paper or slides', 'Sticky notes or shared doc'],
    timeWindow: '1 lesson',
    differentiationHint: 'Choose a role: scout, mapper, or storyteller.',
    aiTip: topic
      ? `Ask AI for 5 what-if questions about “${topic}” and keep only the ones that feel unbiased.`
      : 'Ask AI for 5 what-if questions on this theme; keep the ones that feel unbiased and relevant.'
  };
};

const normalizeSubjectKey = (subject: string): string => subject.toLowerCase().trim();

const buildHooks = ({ subject, topic }: QuickSparkInput): string[] => {
  const key = normalizeSubjectKey(subject);
  const hooks = fallbackStarters[key] || [
    'What sparks our curiosity most about this topic?',
    'How does this connect to a real person or place we care about?',
    'What happens if we remix this idea with something students already love?'
  ];

  if (!topic) {
    return hooks;
  }

  return hooks.map(hook => hook.replace(/this (science concept|issue|topic|idea)/gi, topic));
};

export async function generateQuickSpark(input: QuickSparkInput): Promise<QuickSparkResult> {
  try {
    const hooks = buildHooks(input);
    const miniActivity = fallbackMiniActivity(input);
    return { hooks, miniActivity };
  } catch (error) {
    console.warn('[QuickSparkPrompt] Falling back to canned hooks', error);
    return {
      hooks: [
        'Where have we seen this idea in action this week?',
        'Who in our community already cares about this?',
        'What newbie-friendly tool could help us test this fast?'
      ],
      miniActivity: fallbackMiniActivity(input)
    };
  }
}
