import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import living_historyImage from '../../utils/hero/images/NeighborhoodStories.jpeg';

export const living_historyV2: ProjectShowcaseV2 = {
  id: 'living-history',
  version: '2.0.0',
  hero: {
    title: 'Living History: Preserving Community Stories',
    tagline: 'Middle school documentarians rescue community stories before they disappear.',
    gradeBand: 'MS',
    timeframe: '8–10 weeks',
    subjects: ['Social Studies', 'Language Arts', 'Digital Media', 'Arts', 'Technology'],
    image: living_historyImage
  },
  microOverview: [
    'Students step into role of community historians to surface voices usually unheard.',
    'They learn to plan ethical interviews, capture clean audio, and archive stories responsibly.',
    'Teams curate a pop-up living museum that pairs artifacts with narrated micro-histories.'
  ],
  fullOverview:
    'Students operate as neighborhood historians charged with saving stories that might otherwise disappear. They study how oral historians build trust, practice interviewing moves, and co-design safety agreements with the community. After collecting interviews in the field, teams collaborate to edit clips, write inviting summaries, and curate artifacts into a living museum. The showcase culminates in a community celebration where guests experience each story, contribute reflections, and help decide how the archive continues to grow.',
  schedule: { totalWeeks: 9, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Launch inquiry about whose stories shape community memory.',
      teacher: [
        'Introduce driving question with storytelling montage',
        'Facilitate empathy interview norms circle',
        'Model note-taking on oral histories'
      ],
      students: [
        'Surface community storytellers they trust',
        'Guide mindful listening triads with reflection prompts',
        'Draft wonderings on story web'
      ],
      deliverables: ['Community storytellers brainstorm wall', 'Ethics pledge signatures'],
      checkpoint: ['Students articulate why each story matters'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan ethical fieldwork and secure storytellers.',
      teacher: [
        'Coach teams drafting outreach scripts',
        'Coordinate guardian permission workflows',
        'Set interview logistics calendar'
      ],
      students: [
        'Finalize respectful outreach messages',
        'Assign roles for interviews',
        'Assemble recording kit checklist and backup gear'
      ],
      deliverables: ['Interview outreach email draft', 'Team logistics board', 'Equipment readiness checklist'],
      checkpoint: ['Teacher approves outreach contacts'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Conduct interviews and capture primary source materials.',
      teacher: [
        'Monitor interviews for safety adherence',
        'Provide feedback on questioning moves',
        'Coordinate make-up interview slots'
      ],
      students: [
        'Conduct interviews with consent artifacts',
        'Capture clean audio and notes',
        'Log metadata after each session'
      ],
      deliverables: ['Signed consent forms', 'Interview recordings folder', 'Field notes summary'],
      checkpoint: ['Teacher reviews first interview for alignment'],
      repeatable: true
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Transform interviews into polished story cuts.',
      teacher: [
        'Guide teams segmenting key story beats',
        'Model audio cleanup workflow',
        'Coach script writing for captions'
      ],
      students: [
        'Select powerful interview excerpts',
        'Edit audio for clarity',
        'Draft context captions and tags'
      ],
      deliverables: ['Annotated transcript excerpts', 'Audio rough cut v1', 'Metadata tag sheet'],
      checkpoint: ['Teacher signs off on quote list'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Design the living museum experience.',
      teacher: [
        'Model story card layout in CMS',
        'Coach students on balancing media rights and releases',
        'Coordinate translation accessibility checks'
      ],
      students: [
        'Design story tiles with audio embeds',
        'Write audience-friendly summary blurbs',
        'Test navigation for clarity'
      ],
      deliverables: ['Story card prototypes', 'Accessibility checklist'],
      checkpoint: ['Teacher ensures alt text and captions exist']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Host community preview and gather authentic feedback.',
      teacher: [
        'Coordinate exhibit event logistics',
        'Coach students rehearsing story intros',
        'Facilitate feedback from community panel'
      ],
      students: [
        'Stage exhibit zones and signage',
        'Rehearse concise story pitches',
        'Collect visitor reflections'
      ],
      deliverables: ['Exhibit floor plan', 'Visitor reflection board'],
      checkpoint: ['Panel feedback recorded for iteration'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Weeks 8–9',
      kind: 'Extension',
      focus: 'Publish archive online and plan next storytellers.',
      teacher: [
        'Coach students as they export files for web accessibility',
        'Connect teams with library partners',
        'Schedule next round of storytelling sessions'
      ],
      students: [
        'Upload stories with metadata tags',
        'Draft messages thanking participants',
        'Propose future storytellers to feature'
      ],
      deliverables: ['Live archive page updates', 'Thank-you outreach log'],
      checkpoint: ['Library partner confirms archive access'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Curate a living history micro-archive that preserves community voices'],
    extras: [
      'Stage immersive exhibit for families',
      'Record bilingual story introductions',
      'Produce story map for classrooms',
      'Create oral history toolkit for teachers'
    ],
    audiences: ['Families', 'Local historians', 'Public library team', 'Humanities classes']
  },
  materialsPrep: {
    coreKit: [
      'Handheld audio recorders',
      'Headphones and splitters',
      'Tripods or mic stands',
      'Interview planning notebooks',
      'Laptop with editing software',
      'Photo scanner',
      'Archival storage bins'
    ],
    noTechFallback: ['Paper interview sheets', 'Colored pens for metadata', 'Bulletin board display'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Interview Foundations Lab',
      summary: 'Students analyze expert interviews, co-create norms, and rehearse mindful listening.',
      studentDirections: [
        'Annotate exemplar transcript for empathy moves',
        'List three open-ended follow-up prompts',
        'Rehearse five-minute mock interview with partner',
        'Swap roles and offer warm feedback',
        'Capture insights on interview reflection card'
      ],
      teacherSetup: [
        'Queue exemplar audio clip with transcript',
        'Print ethics pledge and sentence stems',
        'Stage timers for rotating interview rounds',
        'Model note-taking shorthand on projector'
      ],
      evidence: ['Annotated exemplar transcript', 'Interview reflection card'],
      successCriteria: ['I listen without interrupting', 'I ask curious follow-ups', 'I capture context accurately'],
      checkpoint: 'Teacher signs ethics pledge for each team',
      aiOptional: {
        toolUse: 'Generate follow-up stems from interview context',
        critique: 'Flag leading questions for revision',
        noAIAlt: 'Use peer feedback to refine prompts'
      }
    },
    {
      id: 'A2',
      title: 'Community Interview Plan',
      summary: 'Teams secure storytellers, permissions, and logistics before fieldwork begins.',
      studentDirections: [
        'Draft respectful outreach message as a team',
        'Identify three storytellers spanning generations',
        'Collect consent forms and guardian contacts',
        'Assign interview, audio, archive roles',
        'Submit outreach plan for feedback'
      ],
      teacherSetup: [
        'Provide outreach templates in multiple languages',
        'Share communication log spreadsheet',
        'Pre-approve community partners list',
        'Review consent process with counselors'
      ],
      evidence: ['Approved outreach plan', 'Signed consent packets'],
      successCriteria: ['I craft outreach with a respectful tone that partners approve', 'I document consent securely and follow agreements', 'I assign roles that cover the full interviewing workflow'],
      checkpoint: 'Teacher approves outreach before any contact',
      aiOptional: {
        toolUse: 'Draft email variations for different storytellers',
        critique: 'Check tone for cultural sensitivity',
        noAIAlt: 'Use counselor review for tone check'
      },
      safety: ['Respect storyteller privacy boundaries on outreach']
    },
    {
      id: 'A3',
      title: 'Story Cut Draft',
      summary: 'Students craft three-minute story cuts featuring authentic voices and context.',
      studentDirections: [
        'Select clip highlighting driving insight',
        'Mark supporting quotes in transcript',
        'Edit audio for clarity and levels',
        'Write 60-word intro script',
        'Gather images or artifacts for context',
        'Share rough cut for peer critique'
      ],
      teacherSetup: [
        'Demonstrate audio editing workflow in class',
        'Provide transcript highlighters and markup guide',
        'Set up peer feedback protocol',
        'Reserve quiet space for recording tweaks'
      ],
      evidence: ['Annotated transcript with selected quotes', 'Audio rough cut file', 'Intro script draft'],
      successCriteria: [
        "I edit clips that center the storyteller's voice",
        'I record introductions that feel inviting and contextual',
        'I deliver audio with balanced, accessible levels',
        'I select artifacts that deepen understanding of the story'
      ],
      checkpoint: 'Teacher reviews rough cut before publishing',
      aiOptional: {
        toolUse: 'Clean background noise with AI filter',
        critique: 'Verify AI edits preserved tone',
        noAIAlt: 'Use manual EQ on editing software'
      },
      safety: ['Honor privacy requests in releases']
    },
    {
      id: 'A4',
      title: 'Living Museum Launch',
      summary: 'Teams stage a living museum and facilitate community dialogue.',
      studentDirections: [
        'Design exhibit zone with story theme',
        'Rehearse two-minute story pitch',
        'Prep interactive prompt for visitors',
        'Set up listening station tech checks',
        'Assign host, archivist, reflection roles',
        'Collect visitor feedback cards during event'
      ],
      teacherSetup: [
        'Confirm venue, schedule, and accessibility needs',
        'Coordinate panel of community responders',
        'Provide signage materials and badge templates',
        'Arrange audio playback stations'
      ],
      evidence: ['Exhibit plan with roles', 'Visitor feedback summaries'],
      successCriteria: [
        'I welcome guests warmly and guide them through the exhibit',
        'I pitch each story in ways that honor the storyteller',
        'I invite visitors to respond and contribute reflections',
        'I capture feedback for follow-up and share it with the team'
      ],
      checkpoint: 'Teacher checks stations before doors open',
      safety: ['Secure recordings when event ends', 'Honor no-photography requests']
    }
  ],
  polish: {
    microRubric: [
      'Story arc centers storyteller agency',
      'Audio mix feels clear and warm',
      'Context text invites diverse audiences',
      'Artifacts reinforce story meaning'
    ],
    checkpoints: [
      'Consent verified before publishing',
      'Rough cut approved before exhibit build',
      'Visitor feedback logged within 24 hours'
    ],
    tags: ['ORAL', 'COMM', 'ARCH']
  },
  planningNotes: 'Schedule interpreters or translation partners early to cover captions and outreach. Send audio and artifact releases before Week 2, track responses, and coordinate storage with the media center.'
};
