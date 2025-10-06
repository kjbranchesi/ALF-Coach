import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import oceanDnaImage from '../../utils/hero/images/OceanDNATimeCapsules.jpeg';

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
    'Learners explore environmental DNA (eDNA) to understand local marine life. With coastal partners (aquariums, labs), they assemble safe samplers (filters, syringes, bottles), plan tide‑aware routes, and document water collection under supervision. Samples go to a partner lab or are modeled with classroom proxy kits; results feed a simple trends dashboard and future‑scenario model (temperature/acidification). Chain‑of‑custody (CoC) logs and permissions are kept throughout. Students host a mini symposium for families and stakeholders, sharing methods, limits, and stewardship actions.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore eDNA, safety, ethics, and permissions to earn community trust before sampling. Teachers explain eDNA concept. Students assemble sampler kit.',
      teacher: ['Explain eDNA concept', 'Review safety checklist', 'Confirm partner permissions'],
      students: ['Assemble sampler kit', 'Label sample bottles during practice', 'Draft tide‑safe plan'],
      deliverables: ['Sampler checklist', 'Safety acknowledgement'],
      checkpoint: ['Partner/guardian permission packets cleared'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan route mapping, tide timing, and chain-of-custody so collections stay compliant. Teachers share route maps. Students map three sites.',
      teacher: ['Share route maps', 'Model chain‑of‑custody', 'Schedule partner windows'],
      students: ['Map three sites', 'Draft labels + logs', 'Prep coolers/transport'],
      deliverables: ['Route map', 'Chain‑of‑custody log'],
      checkpoint: ['Teacher signs route safety plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'FieldworkLoop',
      focus: 'Collect samples safely, log metadata, and submit kits to keep the science defensible. Teachers supervise sampling. Students collect water.',
      teacher: ['Supervise sampling', 'Check logs', 'Coordinate courier'],
      students: ['Collect water', 'Label and chill', 'Log metadata'],
      deliverables: ['Sample set', 'Metadata log'],
      checkpoint: ['Chain‑of‑custody verified']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Analyze results or proxies and visualize trends to tell the biodiversity story clearly. Teachers provide template. Students load results.',
      teacher: ['Provide template', 'Model visualization', 'Review citations'],
      students: ['Load results', 'Plot trends', 'Draft hotspot notes'],
      deliverables: ['Trends dashboard', 'Hotspot notes'],
      checkpoint: ['Teacher checks data sources'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Model future stress scenarios and propose stewardship actions grounded in evidence. Teachers coach scenario design. Students run scenarios.',
      teacher: ['Coach scenario design', 'Review feasibility', 'Invite expert reviewer'],
      students: ['Run scenarios', 'Propose actions', 'Draft brief'],
      deliverables: ['Scenario results', 'Action brief v1'],
      checkpoint: ['Expert reviewer feedback logged']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host mini symposium to share methods, limits, and stewardship ideas with partners. Teachers invite families/partners. Students present dashboard.',
      teacher: ['Invite families/partners', 'Coordinate posters', 'Facilitate Q&A'],
      students: ['Present dashboard', 'Explain limits', 'Collect pledges'],
      deliverables: ['Poster set', 'Pledge tracker'],
      checkpoint: ['Partner next steps scheduled']
    }
  ],
  outcomes: {
    core: [
      'Design and conduct safe eDNA sampling with partners and permissions',
      'Analyze biodiversity trends and model climate stress scenarios',
      'Develop stewardship action plans and communicate limits with community partners'
    ],
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'eDNA 101 + Safety',
      summary: 'Students learn eDNA basics and pass safety permissions so sampling can move forward responsibly. Students explain eDNA and why it matters locally. Teachers teach eDNA concepts with examples.',
      studentDirections: ['Explain eDNA and why it matters locally', 'Assemble sampler kit following SOP', 'Rehearse labeling and storage procedures', 'List safety rules and contingencies', 'Sign acknowledgement with partner approval'],
      teacherSetup: ['Teach eDNA concepts with examples', 'Provide kit parts and SOPs', 'Review safety, permissions, and contingencies'],
      evidence: ['Safety acknowledgement', 'Kit checklist'],
      successCriteria: ['I explain eDNA in my own words with accuracy', 'I assemble and label kits following safety rules', 'I commit to safety and permission agreements'],
      aiOptional: {
        toolUse: 'Generate simple analogies to explain eDNA to families',
        critique: 'Check AI analogies for scientific accuracy',
        noAIAlt: 'Use partner-supplied explanation guide'
      }
    },
    {
      id: 'A2',
      title: 'Route + Chain‑of‑Custody',
      summary: 'Teams plan routes and prepare labeling logs to protect chain-of-custody and partner trust. Students map sites. Teachers share maps.',
      studentDirections: ['Map sites', 'Note tide times', 'Draft labels', 'Prep logs', 'Confirm partner window'],
      teacherSetup: ['Share maps', 'Review tides', 'Check logs'],
      evidence: ['Route map', 'Chain‑of‑custody log'],
      successCriteria: ['I plan safely', 'I label clearly', 'I confirm timing'],
      aiOptional: { toolUse: 'Summarize tide forecasts', critique: 'Flag risky sites', noAIAlt: 'Peer route review' }
    },
    {
      id: 'A3',
      title: 'Trends Dashboard + Brief',
      summary: 'Students visualize results and draft insights that connect data to stewardship actions. Students load lab or proxy results into template. Teachers provide dashboard template and examples.',
      studentDirections: ['Load lab or proxy results into template', 'Plot trends and hotspots with annotations', 'Draft briefing statements tying data to climate drivers', 'Cite sources and partners in dashboard', 'Propose stewardship actions in brief'],
      teacherSetup: ['Provide dashboard template and examples', 'Model chart interpretation', 'Check sources and partner acknowledgements'],
      evidence: ['Dashboard', 'Brief v1'],
      successCriteria: ['I chart biodiversity trends clearly for the community', 'I cite data sources, labs, and partners transparently', 'I propose stewardship actions grounded in the evidence'],
      aiOptional: {
        toolUse: 'Summarize biodiversity trends into plain-language captions',
        critique: 'Verify AI captions do not overstate certainty',
        noAIAlt: 'Use caption writing checklist with peers'
      }
    }
  ],
};
