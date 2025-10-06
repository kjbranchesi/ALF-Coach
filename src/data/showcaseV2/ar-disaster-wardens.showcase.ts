import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import arDisasterImage from '../../utils/hero/images/ARDisasterWardens.jpeg';

export const ar_disaster_wardensV2: ProjectShowcaseV2 = {
  id: 'ar-disaster-wardens',
  version: '2.0.0',
  hero: {
    title: 'AR Disaster Wardens',
    tagline: 'Neighborhood safety overlays guide evacuation, supplies, and resilience—designed with local partners.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Computer Science', 'Geography', 'Engineering', 'Civics'],
    image: arDisasterImage
  },
  microOverview: [
    'Students map neighborhood hazards and resources with partners and privacy in mind.',
    'They prototype AR overlays for routes, rally points, and supply caches.',
    'A live demo walk trains families on calm, safe evacuation choices.'
  ],
  fullOverview:
    'Learners act as resilience designers. With emergency managers or community leaders, they map local hazards and safe assets, then design an augmented reality (AR) interface that overlays evacuation routes, rally points, and supply locations. Students test usability and accessibility—including Americans with Disabilities Act (ADA) considerations for contrast, language, and icon clarity—embed privacy norms, and publish a family‑friendly guide. The final “Resilience Walk” shares the AR experience and collects feedback for city improvement.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Local hazards, assets, and evacuation principles.',
      teacher: ['Invite partner talk', 'Share base maps', 'Review privacy basics'],
      students: ['List hazards/assets', 'Sketch route ideas', 'Define privacy rules'],
      deliverables: ['Hazard/asset map', 'Privacy pledge'],
      checkpoint: ['Partner reviews initial map'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'AR storyboard + route selection with equity focus.',
      teacher: ['Model storyboard', 'Review equity/ADA', 'Approve routes'],
      students: ['Draft AR screens', 'Check ADA icons', 'Finalize route set'],
      deliverables: ['AR storyboard', 'Route list'],
      checkpoint: ['Teacher approves equity/ADA choices'], assignments: ['A2'] },
    { weekLabel: 'Week 3', kind: 'Build', focus: 'Prototype AR overlays and test readability.',
      teacher: ['Provide contrast guidelines', 'Coach iconography', 'Set test scripts'],
      students: ['Build overlays', 'Run readability tests', 'Revise icons/text'],
      deliverables: ['Overlay v1', 'Usability notes'],
      checkpoint: ['Readability threshold met'] },
    { weekLabel: 'Week 4', kind: 'Build', focus: 'Live route testing and feedback capture.',
      teacher: ['Check permissions', 'Assign safety roles', 'Observe tests'],
      students: ['Walk routes (mock)', 'Log friction points', 'Fix UX issues'],
      deliverables: ['Route test log', 'Overlay v2'],
      checkpoint: ['Partner signs demo readiness'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Exhibit', focus: 'Resilience Walk for families with AR guidance.',
      teacher: ['Invite families', 'Brief safety marshals', 'Collect survey data'],
      students: ['Guide visitors', 'Explain safety choices', 'Gather feedback'],
      deliverables: ['Event plan', 'Feedback dataset'],
      checkpoint: ['Incident‑free walk confirmed'], assignments: ['A4'] },
    { weekLabel: 'Week 6', kind: 'Extension', focus: 'Publish guide and partner handoff.',
      teacher: ['Review language access', 'Arrange translation', 'Schedule follow‑up'],
      students: ['Publish guide', 'Propose updates', 'Thank partners'],
      deliverables: ['Family guide', 'Handoff memo'],
      checkpoint: ['Translations complete'] }
  ],
  outcomes: {
    core: [
      'Analyze neighborhood hazards and assets with community partners',
      'Prototype ADA-compliant AR overlays that guide safe evacuation choices',
      'Design resilience walks and publish a privacy-respecting family guide'
    ],
    extras: ['Run translation support', 'Create ADA icon pack', 'Launch family training session', 'Propose city feedback ticket'],
    audiences: ['Emergency managers', 'Neighborhood groups', 'Families', 'School leadership']
  },
  materialsPrep: {
    coreKit: ['Phones/tablets', 'Printed base maps', 'High‑vis vests', 'Wayfinding signs', 'Survey forms'],
    noTechFallback: ['Paper arrows and posters', 'Laminated ADA cards', 'Manual route maps'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Hazard/Asset Map + Privacy Pledge',
      summary: 'Map local hazards and assets and agree to privacy norms.',
      studentDirections: ['List hazards with sources', 'Mark community assets accurately', 'Write privacy pledge with partner input', 'Share map for feedback', 'Note information gaps to research'],
      teacherSetup: ['Provide base maps and data sources', 'Guide pledge writing session', 'Review maps for bias with partners'],
      evidence: ['Map', 'Pledge'],
      successCriteria: ['I map hazards and assets with verifiable data', 'I commit to privacy norms partners approve', 'I name gaps we must address respectfully'],
      aiOptional: {
        toolUse: 'Summarize public hazard data for context',
        critique: 'Verify AI summaries cite reliable agencies',
        noAIAlt: 'Use emergency manager fact sheets'
      }
    },
    {
      id: 'A2',
      title: 'AR Storyboard + Equity Check',
      summary: 'Design overlays and review for readability/ADA.',
      studentDirections: ['Sketch AR screens with consistent layout', 'Add icons/text aligned to ADA guidelines', 'Check contrast and language translations', 'Revise using partner feedback', 'Submit storyboard for approval'],
      teacherSetup: ['Share storyboard templates', 'Provide contrast and ADA guides', 'Review with accessibility specialist'],
      evidence: ['Storyboard'],
      successCriteria: ['I create overlays everyone can read easily', 'I incorporate ADA and language access supports', 'I revise designs based on feedback and data'],
      aiOptional: {
        toolUse: 'Suggest color/contrast combinations meeting WCAG',
        critique: 'Ensure suggestions meet partner accessibility checklist',
        noAIAlt: 'Use printed contrast cards and peer read test'
      }
    },
    {
      id: 'A3',
      title: 'Route Mock + Fix List',
      summary: 'Test routes and log friction points to fix.',
      studentDirections: ['Walk route safely with assigned roles', 'Time steps and accessibility features', 'Log issues and user quotes', 'Prioritize fixes with impact/effort matrix', 'Update overlays and routes accordingly'],
      teacherSetup: ['Assign safety marshals and observers', 'Set testing scripts and contingencies', 'Check timing with partners'],
      evidence: ['Test log', 'Fix list'],
      successCriteria: ['I observe routes safely and empathetically', 'I document friction points with clear evidence', 'I implement fixes that improve access and safety'],
      aiOptional: {
        toolUse: 'Cluster logged issues into themes',
        critique: 'Verify clusters match actual observations',
        noAIAlt: 'Use sticky note affinity mapping'
      }
    },
    {
      id: 'A4',
      title: 'Resilience Walk + Guide Draft',
      summary: 'Run public demo and finalize the guide.',
      studentDirections: ['Guide families along routes safely', 'Collect surveys or voice notes respectfully', 'Add safety tips and resources to guide', 'Finalize guide with translations and icons', 'Send thank-you and follow-up plan'],
      teacherSetup: ['Invite partners and manage safety briefing', 'Coordinate translation support', 'Collect survey data securely'],
      evidence: ['Survey dataset', 'Guide v1'],
      successCriteria: ['I host resilience walks safely and calmly', 'I synthesize feedback into actionable tips', 'I publish a guide families can follow confidently'],
      aiOptional: {
        toolUse: 'Summarize survey responses into guide tips',
        critique: 'Check AI summary maintains privacy and accuracy',
        noAIAlt: 'Use tally sheets and partner debrief'
      }
    }
  ],
  polish: {
    microRubric: ['Readable overlays', 'Accurate routes', 'Privacy respected', 'Partner‑ready handoff'],
    checkpoints: ['Equity/ADA check', 'Partner demo sign‑off', 'Translations done'],
    tags: ['cs', 'geo', 'civics']
  },
  planningNotes: 'Book partners 4 weeks out to lock data access, roles, and liability forms. Run ADA readability and privacy reviews before Week 3 and send opt-in briefings so families know walks stay voluntary.'
};
