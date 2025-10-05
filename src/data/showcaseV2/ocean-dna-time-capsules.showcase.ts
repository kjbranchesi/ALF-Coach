import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import oceanDnaImage from '../../utils/hero/images/OceanDNATime Capsules.jpeg';

export const ocean_dna_time_capsulesV2: ProjectShowcaseV2 = {
  id: 'ocean-dna-time-capsules',
  version: '2.0.0',
  hero: {
    title: 'Ocean DNA Time Capsules',
    tagline: 'Students deploy eDNA samplers and model biodiversity shifts under climate stress—ethically and safely.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Biology', 'Environmental Science', 'Technology', 'Data Science'],
    image: oceanDnaImage
  },
  microOverview: [
    'Students build harmless, off‑the‑shelf eDNA samplers and plan coastal sampling routes with partners.',
    'They collect and send to a lab or use classroom proxy kits; analyze species presence trends.',
    'Teams model future shifts and publish a community briefing with stewardship ideas.'
  ],
  fullOverview:
    'Learners explore environmental DNA to understand local marine life. With coastal partners (aquariums, labs), they assemble safe samplers (filters, syringes, bottles), plan tide‑aware routes, and document water collection under supervision. Samples go to a partner lab or are modeled with classroom proxy kits; results feed a simple trends dashboard and future‑scenario model (temperature/acidification). Students host a mini symposium for families and stakeholders, sharing methods, limits, and stewardship actions.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'What is eDNA? Safety, ethics, and permissions for water sampling.',
      teacher: ['Explain eDNA concept', 'Review safety checklist', 'Confirm partner permissions'],
      students: ['Assemble sampler kit', 'Practice labeling', 'Draft tide‑safe plan'],
      deliverables: ['Sampler checklist', 'Safety acknowledgement'],
      checkpoint: ['Partner/guardian permission packets cleared'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Route mapping, tide timing, and sample chain‑of‑custody.',
      teacher: ['Share route maps', 'Model chain‑of‑custody', 'Schedule partner windows'],
      students: ['Map three sites', 'Draft labels + logs', 'Prep coolers/transport'],
      deliverables: ['Route map', 'Chain‑of‑custody log'],
      checkpoint: ['Teacher signs route safety plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'FieldworkLoop',
      focus: 'Collect samples safely; log metadata; submit to lab or process proxy kits.',
      teacher: ['Supervise sampling', 'Check logs', 'Coordinate courier'],
      students: ['Collect water', 'Label and chill', 'Log metadata'],
      deliverables: ['Sample set', 'Metadata log'],
      checkpoint: ['Chain‑of‑custody verified']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Analyze results or proxies; visualize presence trends and hotspots.',
      teacher: ['Provide template', 'Model visualization', 'Review citations'],
      students: ['Load results', 'Plot trends', 'Draft hotspot notes'],
      deliverables: ['Trends dashboard', 'Hotspot notes'],
      checkpoint: ['Teacher checks data sources'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Model future stress scenarios; propose stewardship actions.',
      teacher: ['Coach scenario design', 'Review feasibility', 'Invite expert reviewer'],
      students: ['Run scenarios', 'Propose actions', 'Draft brief'],
      deliverables: ['Scenario results', 'Action brief v1'],
      checkpoint: ['Expert reviewer feedback logged']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Mini symposium—share methods, limits, and stewardship ideas.',
      teacher: ['Invite families/partners', 'Coordinate posters', 'Facilitate Q&A'],
      students: ['Present dashboard', 'Explain limits', 'Collect pledges'],
      deliverables: ['Poster set', 'Pledge tracker'],
      checkpoint: ['Partner next steps scheduled']
    }
  ],
  outcomes: {
    core: ['Publish eDNA trends and a stewardship action brief'],
    extras: [
      'Open chain‑of‑custody template',
      'Student tide‑safety guide',
      'Data sharing with partner lab',
      'Action pledge drive'
    ],
    audiences: ['Aquarium/partner lab', 'Families', 'Local conservation groups', 'School leadership']
  },
  materialsPrep: {
    coreKit: [
      'Filter kit + syringes/bottles',
      'Coolers + ice packs',
      'Gloves, goggles',
      'Labels + chain‑of‑custody forms',
      'Laptops for visualization'
    ],
    noTechFallback: ['Paper maps and logs', 'Hand‑drawn trend charts', 'Poster boards'],
    safetyEthics: ['Adult supervision at water', 'Partner permissions required', 'No student DNA processing without lab partner']
  },
  assignments: [
    {
      id: 'A1',
      title: 'eDNA 101 + Safety',
      summary: 'Learn eDNA basics and pass safety/permissions.',
      studentDirections: ['Explain eDNA', 'Assemble kit', 'Label samples', 'List safety rules', 'Sign acknowledgement'],
      teacherSetup: ['Teach eDNA', 'Provide kit parts', 'Review safety + permissions'],
      evidence: ['Safety acknowledgement', 'Kit checklist'],
      successCriteria: ['I explain eDNA', 'I assemble correctly', 'I follow rules']
    },
    {
      id: 'A2',
      title: 'Route + Chain‑of‑Custody',
      summary: 'Plan routes and prepare labeling/logging.',
      studentDirections: ['Map sites', 'Note tide times', 'Draft labels', 'Prep logs', 'Confirm partner window'],
      teacherSetup: ['Share maps', 'Review tides', 'Check logs'],
      evidence: ['Route map', 'Chain‑of‑custody log'],
      successCriteria: ['I plan safely', 'I label clearly', 'I confirm timing'],
      aiOptional: { toolUse: 'Summarize tide forecasts', critique: 'Flag risky sites', noAIAlt: 'Peer route review' }
    },
    {
      id: 'A3',
      title: 'Trends Dashboard + Brief',
      summary: 'Visualize results and draft insights.',
      studentDirections: ['Load data', 'Plot trends', 'Note hotspots', 'Draft briefing line', 'Cite sources'],
      teacherSetup: ['Provide template', 'Model charts', 'Check sources'],
      evidence: ['Dashboard', 'Brief v1'],
      successCriteria: ['I chart clearly', 'I cite data', 'I propose actions']
    }
  ],
  polish: {
    microRubric: [
      'Safe, permitted sampling',
      'Clear chain‑of‑custody',
      'Accurate, cited charts',
      'Realistic, local actions'
    ],
    checkpoints: ['Permissions cleared', 'Safety at water', 'Expert feedback received'],
    tags: ['bio', 'ocean', 'data']
  },
  planningNotes: 'Confirm partner lab capacity early; consider classroom proxy kits for timing; guard student privacy and water safety rigorously.'
};
