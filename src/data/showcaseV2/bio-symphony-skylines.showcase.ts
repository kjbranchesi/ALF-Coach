import type { ProjectShowcaseV2 } from '../../types/showcaseV2';

export const bio_symphony_skylinesV2: ProjectShowcaseV2 = {
  id: 'bio-symphony-skylines',
  version: '2.0.0',
  hero: {
    title: 'Bio‑Symphony Skylines',
    tagline: 'Students turn biodiversity and city sounds into living music that reveals urban ecosystem health.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Biology', 'Data Science', 'Music & Sound', 'Environmental Science', 'Technology']
  },
  microOverview: [
    'Teams soundwalk local blocks, logging species calls, noise sources, and habitat cues.',
    'They analyze patterns and compose soundscapes where data drives melody, tempo, and texture.',
    'The class hosts a “Listening Gallery” for neighbors with insights and action prompts.'
  ],
  fullOverview:
    'Students investigate how biodiversity and human noise intermix in their city. After learning to identify common species calls and noise sources, teams run repeatable soundwalks, capture short clips, and tally observations on a simple rubric. Using spreadsheets or notebooks, they convert counts and trends into musical parameters—pitch for species richness, rhythm for call frequency, volume for noise intensity—composing data‑driven scores. At a public Listening Gallery, students present their sonifications beside evidence dashboards and co‑design ideas for quieter, more hospitable micro‑habitats.',
  schedule: { totalWeeks: 5, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Why soundscapes matter for urban ecology and wellbeing.',
      teacher: ['Model soundwalk protocol', 'Teach species/noise basics', 'Set safety boundaries'],
      students: ['Practice quiet listening', 'Try tally sheets', 'Discuss equity impacts'],
      deliverables: ['Soundwalk checklist', 'Species/noise ID mini‑poster'],
      checkpoint: ['Teams recite safety and consent rules'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Route mapping, timing, and simple data schema for soundwalks.',
      teacher: ['Share map tiles', 'Approve team routes', 'Set audio guidelines'],
      students: ['Map two routes', 'Draft data schema', 'Confirm team roles'],
      deliverables: ['Route maps', 'Field data template'],
      checkpoint: ['Teacher signs route safety plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect clips and tally observations; convert data to music rules.',
      teacher: ['Shadow first outing', 'Check data validity', 'Coach mapping to music'],
      students: ['Capture short clips', 'Tally calls/noise', 'Draft music rule set'],
      deliverables: ['Audio clip set', 'Cleaned tally sheet', 'Music mapping table'],
      checkpoint: ['Teacher validates first analysis pass'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Mount the Listening Gallery with insights and action ideas.',
      teacher: ['Invite partners', 'Finalize curation', 'Facilitate feedback forms'],
      students: ['Refine scores', 'Design labels', 'Host visitor dialogues'],
      deliverables: ['Listening Gallery plan', 'Visitor feedback log'],
      checkpoint: ['Partners schedule next‑step chat'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Publish a neighborhood soundscape portfolio with evidence notes'],
    extras: [
      'Prototype “quiet corners” micro‑habitats',
      'Create bilingual listening maps',
      'Pitch bell‑less periods near nests',
      'Contribute observations to citizen science'
    ],
    audiences: ['City parks or planning office', 'Local library', 'Community board', 'Environmental NGOs']
  },
  materialsPrep: {
    coreKit: [
      'Clip‑on phone mics or handheld recorders',
      'Analog decibel meter or app',
      'Headphones and splitters',
      'Printed maps + clipboards',
      'Laptops/tablets with DAW or browser synths'
    ],
    noTechFallback: ['Paper tally sheets', 'Analogue rhythm cards', 'Printed spectrogram examples'],
    safetyEthics: ['Guardian/partner consent for recording', 'Avoid voices; capture ambient only', 'Respect wildlife distance rules']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Soundwalk 101 + ID Mini‑Poster',
      summary: 'Practice quiet listening and species/noise identification.',
      studentDirections: ['Walk in silence', 'Mark sources on map', 'Log three observations', 'Sketch one call shape', 'Share one equity insight'],
      teacherSetup: ['Define safety zone', 'Model tally routine', 'Provide ID cards'],
      evidence: ['Completed tally map', 'Mini‑poster of one species'],
      successCriteria: ['I listen safely', 'I log clearly', 'I explain impact'],
      checkpoint: 'Poster reviewed before fieldwork'
    },
    {
      id: 'A2',
      title: 'Route + Data Schema',
      summary: 'Plan routes and decide the variables to capture.',
      studentDirections: ['Pick two routes', 'Set timing windows', 'Select variables', 'Assign roles', 'Draft ethics line'],
      teacherSetup: ['Share map layers', 'Approve variables', 'Confirm partner times'],
      evidence: ['Route map', 'Data schema table'],
      successCriteria: ['I choose safe routes', 'I define variables', 'I share roles'],
      checkpoint: 'Teacher signs field plan',
      aiOptional: { toolUse: 'Summarize route risks', critique: 'Check bias in sites', noAIAlt: 'Peer review routes' }
    },
    {
      id: 'A3',
      title: 'Data→Music Mapping',
      summary: 'Translate counts and trends into musical rules.',
      studentDirections: ['Clean tally data', 'Pick three parameters', 'Set mapping rules', 'Test quick loop', 'Note one insight'],
      teacherSetup: ['Provide sample DAW', 'Share mapping examples', 'Coach testing'],
      evidence: ['Mapping table', 'Audio loop draft'],
      successCriteria: ['I justify mappings', 'I test quickly', 'I cite data']
    },
    {
      id: 'A4',
      title: 'Listening Gallery',
      summary: 'Curate scores and insights for a public audience.',
      studentDirections: ['Select best clips', 'Label with evidence', 'Craft action ask', 'Host visitors', 'Gather feedback'],
      teacherSetup: ['Invite partners', 'Set stations', 'Print labels'],
      evidence: ['Gallery label set', 'Visitor feedback log'],
      successCriteria: ['I explain methods', 'I propose actions', 'I listen to feedback']
    }
  ],
  polish: {
    microRubric: [
      'Evidence mapped to music rules',
      'Clear, ethical data capture',
      'Accessible exhibit labels',
      'Actionable community next steps'
    ],
    checkpoints: ['Safety + ethics sign‑off', 'First data validity check', 'Gallery curation review'],
    tags: ['bio', 'music', 'data']
  }
};

