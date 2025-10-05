import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import move_fairImage from '../../utils/hero/images/MoveFair.jpeg';
export const move_fairV2: ProjectShowcaseV2 = {
  id: 'move-fair',
  version: '2.0.0',
  hero: {
    title: 'Move Fair: Rethinking Neighborhood Mobility',
    tagline: 'Students redesign mobility systems so every neighbor can move freely and safely.',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ['Urban Studies', 'Geography', 'Data Science', 'Social Justice', 'Public Policy', 'Mathematics'],
    image: move_fairImage
  },
  microOverview: [
    'Students investigate mobility inequities through transit data, mapping, and lived experiences.',
    'They prototype interventions that combine policy shifts, design changes, and storytelling campaigns.',
    'Teams deliver a mobility action playbook backed by pilots, community voices, and funding pathways.'
  ],
  fullOverview:
    'Learners operate like urban mobility fellows who blend human stories with multi-layered data. They audit how transportation access differs block to block, convene residents and planners, and co-create proposals that prioritize equity. Rapid pilots—from pop-up bus shelters to ride-share scripts—gather evidence that powers persuasive pitches to decision makers.',
  schedule: { totalWeeks: 9, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Build shared context on mobility justice and neighborhood history.',
      teacher: [
        'Facilitate transit history case studies',
        'Map inequality through storytelling',
        'Introduce community advisory board'
      ],
      students: [
        'Create mobility story timelines',
        'Interview neighbors about daily commutes',
        'Draft mobility learner agreements'
      ],
      deliverables: ['Mobility justice timeline', 'Interview snapshot board', 'Team agreements'],
      checkpoint: ['Students identify priority user groups'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design research plan covering data, observation, and community listening.',
      teacher: [
        'Model mixed-methods research design',
        'Broker meetings with planning staff',
        'Train students on ethical surveying'
      ],
      students: [
        'Select routes and hotspots to study',
        'Develop survey and interview tools',
        'Schedule walk audits with residents'
      ],
      deliverables: ['Research design doc', 'Survey toolkit', 'Walk audit calendar'],
      checkpoint: ['Teacher approves research scope'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect mobility data and community narratives.',
      teacher: [
        'Shadow walk audits for safety',
        'Coordinate translation support',
        'Host nightly data synthesis huddles'
      ],
      students: [
        'Log travel times and obstacles',
        'Capture geotagged observations',
        'Capture stories with consent and audio releases'
      ],
      deliverables: ['GIS data layers', 'Narrative audio clips', 'Daily synthesis notes'],
      checkpoint: ['Teacher reviews data completeness'],
      repeatable: true,
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Analyze findings and frame opportunity areas.',
      teacher: [
        'Model equity scoring frameworks',
        'Facilitate systems mapping workshop',
        'Coach students on data storytelling'
      ],
      students: [
        'Build composite equity index',
        'Map causes and leverage points',
        'Draft insight stories with evidence'
      ],
      deliverables: ['Equity index dashboard', 'Systems map', 'Insight briefs'],
      checkpoint: ['Teacher signs off on insight focus'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Prototype interventions and test feasibility.',
      teacher: [
        'Source materials for tactical pilots',
        'Facilitate policy scenario labs',
        'Connect students with transit agencies'
      ],
      students: [
        'Design pilot interventions',
        'Run tests with community feedback',
        'Estimate cost and staffing needs'
      ],
      deliverables: ['Pilot test log', 'Budget model', 'Policy change memo'],
      checkpoint: ['Teacher checks safety compliance'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Host Move Fair summit with stakeholders.',
      teacher: [
        'Organize summit logistics',
        'Coach persuasive storytelling',
        'Secure commitments from agencies'
      ],
      students: [
        'Curate booths with pilots and data',
        'Facilitate community solution workshops',
        'Capture pledge statements live'
      ],
      deliverables: ['Summit booth plan', 'Workshop facilitation guide', 'Commitment tracker'],
      checkpoint: ['Stakeholders sign pledge cards'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Weeks 8–9',
      kind: 'Extension',
      focus: 'Publish action playbook and transition ownership.',
      teacher: [
        'Review playbook structure',
        'Connect teams with city staff',
        'Coordinate press and community rollout with communications team'
      ],
      students: [
        'Write action steps with timelines',
        'Hand off pilots to local leaders',
        'Launch story campaign amplifying voices'
      ],
      deliverables: ['Mobility action playbook', 'Handoff agreements', 'Story campaign assets'],
      checkpoint: ['Teacher verifies playbook distribution'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Develop an equity-driven neighborhood mobility action playbook'],
    extras: [
      'Produce short documentary on commute stories',
      'Launch pop-up transportation resource fair',
      'Draft youth advisory council proposal',
      'Secure mini-grants for pilot projects'
    ],
    audiences: ['Neighborhood associations', 'City transportation planners', 'Transit riders', 'Local press partners']
  },
  materialsPrep: {
    coreKit: [
      'GIS and mapping software',
      'Transit passes for fieldwork',
      'Speed and volume counters',
      'Pop-up tactical urbanism supplies',
      'Recording gear for interviews',
      'Summit signage materials'
    ],
    noTechFallback: ['Printed grid maps', 'Clipboards and stopwatches', 'Paper pledge cards'],
    safetyEthics: ['Follow fieldwork buddy system', 'Obtain consent for recordings', 'Coordinate street pilot permits']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Mobility Story Collage',
      summary: 'Students foreground community mobility narratives and define justice commitments.',
      studentDirections: [
        'Collect three commute stories',
        'Extract quotes highlighting barriers',
        'Build shared story collage',
        'Name justice commitments with team',
        'Present collage to advisory board'
      ],
      teacherSetup: [
        'Invite advisory board mentors',
        'Provide consent forms',
        'Model collage storytelling',
        'Facilitate restorative discussion'
      ],
      evidence: ['Story collage', 'Justice commitment list'],
      successCriteria: ['I surface stories that represent diverse community voices', 'I secure commitments that feel actionable and specific', 'I present findings in ways that center community needs'],
      checkpoint: 'Teacher reviews commitments before share',
      aiOptional: {
        toolUse: 'Transcribe audio interviews quickly',
        critique: 'Verify transcription accuracy',
        noAIAlt: 'Use peer transcription rotation'
      }
    },
    {
      id: 'A2',
      title: 'Mobility Research Toolkit',
      summary: 'Teams design rigorous mixed-methods research plans.',
      studentDirections: [
        'Select routes for data collection',
        'Draft survey and interview questions',
        'Organize walk audit logistics with partners',
        'Assign research roles clearly',
        'Submit toolkit for approval'
      ],
      teacherSetup: [
        'Share research exemplars',
        'Provide safety guidelines',
        'Model unbiased question framing',
        'Offer translation resources'
      ],
      evidence: ['Research toolkit', 'Approved schedule'],
      successCriteria: ['I design methods that triangulate multiple data sources', 'I keep interview questions unbiased and respectful', 'I schedule engagement so participation stays inclusive'],
      checkpoint: 'Teacher signs toolkit pre-fieldwork',
      aiOptional: {
        toolUse: 'Generate draft survey translations',
        critique: 'Check language for cultural respect',
        noAIAlt: 'Partner with bilingual volunteers'
      }
    },
    {
      id: 'A3',
      title: 'Equity Insight Lab',
      summary: 'Students synthesize findings into equity insights and pilots.',
      studentDirections: [
        'Analyze quantitative mobility data',
        'Story-map qualitative evidence',
        'Score hotspots with equity lens',
        'Design intervention pilots',
        'Test pilots and record results'
      ],
      teacherSetup: [
        'Provide scoring rubrics',
        'Lead systems mapping session',
        'Supply prototyping materials',
        'Arrange community feedback panel'
      ],
      evidence: ['Equity dashboard', 'Pilot test report'],
      successCriteria: ['I cite data sources for every insight we share', 'I design pilot ideas that respond to stated needs', 'I include user feedback when reporting results'],
      checkpoint: 'Teacher validates pilots are documented',
      aiOptional: {
        toolUse: 'Cluster data into themes',
        critique: 'Ensure AI clustering matches evidence',
        noAIAlt: 'Use manual affinity mapping'
      },
      safety: ['Follow traffic safety protocols during pilots']
    },
    {
      id: 'A4',
      title: 'Move Fair Action Playbook',
      summary: 'Teams publish action plans and secure stakeholder commitments.',
      studentDirections: [
        'Draft action steps with owners',
        'Develop summit presentation deck with visuals',
        'Facilitate solution workshop',
        'Capture pledges and resources',
        'Distribute playbook widely'
      ],
      teacherSetup: [
        'Coordinate summit logistics',
        'Provide playbook template',
        'Invite decision makers',
        'Support media outreach'
      ],
      evidence: ['Published playbook', 'Summit recording', 'Pledge tracker'],
      successCriteria: ['I publish a playbook that lists clear next actions', 'I document stakeholder pledges and timelines', 'I distribute the plan so the entire community can access it'],
      checkpoint: 'Teacher confirms playbook delivery',
      aiOptional: {
        toolUse: 'Design playbook layout draft',
        critique: 'Check accessibility contrast',
        noAIAlt: 'Use designer-provided template'
      }
    }
  ],
  polish: {
    microRubric: [
      'Data and stories elevate equity reality',
      'Pilots demonstrate tangible feasibility',
      'Playbook empowers community ownership',
      'Calls to action feel time-bound'
    ],
    checkpoints: [
      'Research toolkit approved before fieldwork',
      'Pilots evaluated before summit',
      'Playbook distributed within one week'
    ],
    tags: ['MOBI', 'CIVIC', 'DATA']
  },
  planningNotes: 'Reserve translation and accessibility supports early—summit success hinges on truly inclusive participation.'
};
