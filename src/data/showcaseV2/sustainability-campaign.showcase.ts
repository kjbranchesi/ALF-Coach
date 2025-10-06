import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import sustainability_campaignImage from '../../utils/hero/images/CampusSustainabilityInitiative.jpeg';
export const sustainability_campaignV2: ProjectShowcaseV2 = {
  id: 'sustainability-campaign',
  version: '2.0.0',
  hero: {
    title: 'Campus Sustainability Initiative',
    tagline: 'Students transform a school sustainability audit into a community-backed action plan.',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ['Environmental Science', 'Social Studies', 'Statistics', 'ELA', 'Digital Media', 'Mathematics'],
    image: sustainability_campaignImage
  },
  microOverview: [
    'Students audit campus waste, energy, and water systems to surface actionable sustainability gaps.',
    'Teams co-design solutions with facilities staff, modeling impact through data storytelling and budgets.',
    'They launch campaigns that pilot greener practices, publish results, and secure stakeholder commitments.'
  ],
  fullOverview:
    'Learners step into the role of sustainability consultants charged with shrinking the school’s environmental footprint. They investigate how resources move across campus, interview operational experts, and crunch real usage data. With mentorship from facilities, they prototype interventions, test the return on investment, and pitch a roadmap that pairs climate responsibility with fiscal stewardship.',
  schedule: { totalWeeks: 9, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Launch the sustainability challenge and map current systems to reveal hidden waste.',
      teacher: [
        'Launch challenge with campus footprint data',
        'Model systems thinking map of campus flows',
        'Co-create norms for facilities partnerships'
      ],
      students: [
        'Capture baseline photos of resource hotspots',
        'Interview peers about sustainability pain points',
        'Draft initial resource flow diagrams'
      ],
      deliverables: ['Baseline photo essay', 'Systems map v1', 'Team charter'],
      checkpoint: ['Teams articulate a compelling why'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design the audit plan and coordinate data access so evidence collection runs smoothly.',
      teacher: [
        'Introduce audit tools and data templates',
        'Broker time with facilities mentors',
        'Model respectful interview protocols'
      ],
      students: [
        'Select focus zones for auditing',
        'Schedule walkthroughs with staff experts',
        'Calibrate measurement devices together'
      ],
      deliverables: ['Audit scope plan', 'Interview question bank', 'Equipment readiness checklist'],
      checkpoint: ['Teacher approves audit readiness'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Conduct audits and gather quantitative plus qualitative evidence to build a full picture.',
      teacher: [
        'Shadow audits to ensure safe practices',
        'Run daily data quality huddles',
        'Coordinate access to restricted spaces'
      ],
      students: [
        'Collect meter readings and waste tallies',
        'Synthesize stakeholder insights in logs',
        'Upload data to shared dashboards'
      ],
      deliverables: ['Audit data sets', 'Stakeholder interview notes', 'Photo evidence archive'],
      checkpoint: ['Teacher validates one full audit cycle'],
      repeatable: true,
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Analyze findings and identify highest-leverage interventions that balance impact and feasibility.',
      teacher: [
        'Model ROI calculations using spreadsheets',
        'Facilitate root cause analysis workshops',
        'Coach teams on impact storytelling'
      ],
      students: [
        'Visualize baseline versus projected savings',
        'Cluster insights into thematic opportunities',
        'Draft problem statements with evidence'
      ],
      deliverables: ['Insight dashboard v1', 'Opportunity brief', 'ROI calculator sheet'],
      checkpoint: ['Teacher signs off on priority focus'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Prototype campaigns and pilot micro-interventions to test ideas before scaling.',
      teacher: [
        'Source materials for small pilots',
        'Guide messaging storyboard sessions',
        'Coordinate approvals for in-situ tests'
      ],
      students: [
        'Design campaign collateral drafts with clear calls to action',
        'Pilot quick wins in target zones and document results',
        'Analyze before-and-after metrics and capture partner reactions'
      ],
      deliverables: ['Pilot data log', 'Campaign asset drafts', 'User feedback notes'],
      checkpoint: ['Teacher reviews pilot safety plan'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Pitch the sustainability roadmap to decision makers with data-backed storytelling.',
      teacher: [
        'Run rehearsal panels with alumni',
        'Coach data storytelling techniques',
        'Invite finance and facilities leaders'
      ],
      students: [
        'Finalize persuasive slide decks',
        'Rehearse dual presenter partnership',
        'Solicit commitments during Q&A'
      ],
      deliverables: ['Pitch deck vfinal', 'Q&A tracker', 'Commitment log'],
      checkpoint: ['Stakeholders confirm action alignment'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Weeks 8–9',
      kind: 'Extension',
      focus: 'Launch campaigns and establish accountability structures so momentum persists.',
      teacher: [
        'Coordinate communications with district PR',
        'Coordinate grant or funding requests',
        'Set review cadence with leadership'
      ],
      students: [
        'Deploy campaigns across campus touchpoints',
        'Monitor metrics and publish updates',
        'Recruit student sustainability ambassadors'
      ],
      deliverables: ['Campaign launch toolkit', 'Metrics dashboard updates', 'Ambassador onboarding plan'],
      checkpoint: ['Teacher verifies transition to student leadership'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: [
      'Design a costed sustainability roadmap with measurable impact claims',
      'Prototype campaign assets and simplified reading supports with staff partners',
      'Communicate data-driven recommendations to decision makers for adoption'
    ],
    extras: [
      'Design behavior-change campaign kits',
      'Prototype low-cost efficiency upgrades',
      'Produce executive summary videos',
      'Draft policy recommendations for district leaders'
    ],
    audiences: ['Facilities leadership', 'Student government', 'District sustainability office', 'Local environmental partners']
  },
  materialsPrep: {
    coreKit: [
      'Energy meters and infrared thermometer',
      'Waste audit bins and scales',
      'Laptops with spreadsheet software',
      'Poster printer access',
      'Stakeholder interview kits',
      'Graphic design templates'
    ],
    noTechFallback: ['Manual data tally sheets', 'Printed maps of campus', 'Poster board displays'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Systems Snapshot Walkthrough',
      summary: 'Students document campus resource flows and surface early leverage points for change.',
      studentDirections: [
        'Photograph three waste or energy hotspots',
        'Interview one staff member respectfully',
        'Log observations on systems map template',
        'Draft a one-sentence opportunity insight',
        'Submit reflections to shared folder'
      ],
      teacherSetup: [
        'Secure walkthrough permissions in advance',
        'Print systems mapping templates',
        'Model effective photo evidence framing',
        'Provide conversation starter stems'
      ],
      evidence: ['Completed systems map', 'Photo documentation set'],
      successCriteria: ['I capture clear evidence', 'I name a leverage point', 'I cite stakeholder voice'],
      checkpoint: 'Teacher reviews insight statements for accuracy',
      aiOptional: {
        toolUse: 'Generate headline from observation notes',
        critique: 'Check AI summary for exaggeration',
        noAIAlt: 'Use partner feedback to refine headline'
      }
    },
    {
      id: 'A2',
      title: 'Audit Plan and Data Kit',
      summary: 'Teams build rigorous audit plans and prepare data collection tools that win partner confidence.',
      studentDirections: [
        'Define audit scope and metrics',
        'Assign roles for site visits',
        'Draft interview protocol for mentors',
        'Calibrate tools with test readings',
        'Publish plan for teacher approval'
      ],
      teacherSetup: [
        'Share sample audit plans',
        'Facilitate tool calibration station',
        'Invite facilities mentor for feedback',
        'Provide approval checklist'
      ],
      evidence: ['Approved audit plan', 'Calibrated data template'],
      successCriteria: ['I align metrics to our audit goals', 'I assign roles that cover every collection task', 'I confirm tools are ready and documented for use'],
      checkpoint: 'Teacher signs audit plan before fieldwork',
      aiOptional: {
        toolUse: 'Draft interview questions from objectives',
        critique: 'Remove biased or leading wording',
        noAIAlt: 'Use peer critique protocol'
      },
    },
    {
      id: 'A3',
      title: 'Impact Modeling Studio',
      summary: 'Teams analyze audit data and model projected savings.',
      studentDirections: [
        'Clean data for accuracy',
        'Visualize baseline and projected usage',
        'Calculate savings with ROI template',
        'Draft insight headline and supporting claim',
        'Share dashboard for feedback'
      ],
      teacherSetup: [
        'Provide spreadsheet calculators',
        'Model data cleaning workflow',
        'Host gallery walk critique',
        'Offer storytelling sentence stems'
      ],
      evidence: ['Impact dashboard', 'Insight headline statement'],
      successCriteria: ['I build charts that match the evidence exactly', 'I verify ROI math is correct and transparent', 'I write headlines that cite specific data points'],
      checkpoint: 'Teacher reviews dashboards for clarity',
      aiOptional: {
        toolUse: 'Suggest chart titles from data',
        critique: 'Verify labels reflect reality',
        noAIAlt: 'Use teammate review checklist'
      }
    },
    {
      id: 'A4',
      title: 'Sustainability Pitch + Launch Plan',
      summary: 'Students deliver stakeholder pitches and launch their campaigns campus-wide.',
      studentDirections: [
        'Finalize deck with visuals and metrics',
        'Rehearse timed pitch with roles',
        'Produce leave-behind executive summary',
        'Design launch timeline and owner chart',
        'Capture stakeholder commitments live'
      ],
      teacherSetup: [
        'Schedule pitch forum with decision makers',
        'Provide AV and recording equipment',
        'Facilitate rehearsal feedback protocols',
        'Coordinate campaign launch calendar'
      ],
      evidence: ['Pitch recording', 'Launch timeline', 'Commitment log'],
      successCriteria: ['I keep the pitch within the agreed time', 'I make an ask that includes clear next steps', 'I present evidence that feels trustworthy to stakeholders'],
      checkpoint: 'Teacher validates commitments are documented',
      aiOptional: {
        toolUse: 'Draft follow-up email summarizing pitch',
        critique: 'Ensure tone respects stakeholder time',
        noAIAlt: 'Use provided follow-up template'
      }
    }
  ],
};
