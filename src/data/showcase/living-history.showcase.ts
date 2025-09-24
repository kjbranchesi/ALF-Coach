import type { ShowcaseProject } from '../../types/showcase';

export const livingHistory: ShowcaseProject = {
  meta: {
    id: 'living-history',
    title: 'Living History: Micro-Oral Histories',
    tagline: 'Keep community memory alive through short oral histories.',
    subjects: ['Social Studies', 'ELA', 'Digital Media'],
    gradeBands: ['6-8'],
    duration: '8–10 weeks',
    tags: ['community', 'oral history', 'ethics'],
  },
  microOverview: {
    microOverview:
      'Students become keepers of community memory. They learn to ask better questions, earn trust, and capture short oral histories that would otherwise disappear. Working in roles (interviewer, editor, curator), they build a mini-archive with titles, context, and tags, then share highlights with a real audience.',
  },
  quickSpark: {
    hooks: [
      'Who holds a story here that we’re about to lose?',
      'What does “listening well” look like in our community?',
      'How could 60‑second histories help newcomers belong?'
    ],
    miniActivity: {
      do: [
        'Watch a 60‑sec exemplar; note what the interviewer does.',
        'Draft 3 open questions with the Question Stem Card.',
        'Run a 90‑sec mock interview and capture a 30‑sec highlight.',
        'Write a 1‑sentence context (who/when/why it matters).'
      ],
      share: ['Class gallery of 60‑sec highlights; peer feedback'],
      reflect: ['Whose voice did we amplify?', 'How did we avoid leading questions?'],
      materials: ['Phones/headphones (or notebooks)', 'Question stems; ethics pledge'],
      timeWindow: '1–2 lessons',
      differentiationHint: 'Choose a role: interviewer, editor, curator.',
      aiTip: 'Ask AI for 5 follow‑ups; remove any leading/biased ones.',
    },
  },
  outcomeMenu: {
    core: 'Mini‑Archive (8–15 micro‑histories)',
    choices: ['Story Map', 'Listening Stations (QR)', 'Podcast Short', 'Zine/Memory Tiles', 'Toolkit', 'Timeline'],
    audiences: ['Library', 'PTA Night', 'Historical Society', 'Senior Center', 'Neighborhood Association'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Mock Interview + Ethics Bootcamp',
      when: 'Week 1',
      studentDirections: [
        'Watch a 60‑sec exemplar; note interviewer actions.',
        'Draft 3 open questions using the Question Stem Card.',
        'In pairs, run a 90‑sec mock interview (no sensitive topics).',
        'Record a 30‑sec highlight.',
        'Write a 1‑sentence context (who/when/why it matters).',
        'Sign the Ethics Pledge (respect, consent, accuracy).'
      ],
      teacherSetup: [
        'Pick/show one exemplar clip; print Question Stems & Pledge.',
        'Define pre-approved storytellers & consent process.',
        'Timebox: 2 × 6‑min practice blocks.',
        'Model leading vs open questions.',
        'Establish file naming: Last_First_YYYYMMDD_MOCK.'
      ],
      evidence: ['Highlight clip (≤30s)', 'Context sentence', 'Signed pledge'],
      successCriteria: ['Respectful tone', 'Open questions', 'Neutral follow-up', 'Clear context sentence'],
      checkpoint: 'Teacher listens to 2–3 clips per table; green-light for real interviews.',
      aiOptional: 'Ask AI for 5 follow-ups; remove biased ones.',
    },
    // A2..A4 as needed; you can expand in later phases.
  ],
  communityJustice: {
    guidingQuestion: 'What does justice look like here when it comes to whose stories are heard?',
    stakeholders: ['Elders', 'Newcomers', 'Local historians', 'Students and families'],
    ethicsNotes: ['Consent for any public display', 'No sensitive topics', 'Teacher review before share'],
  },
  polishFlags: {
    standardsAvailable: true,
    rubricAvailable: true,
    feasibilityAvailable: false,
  },
};
