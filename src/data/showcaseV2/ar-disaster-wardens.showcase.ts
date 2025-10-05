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
    core: ['Deliver an AR resilience guide co‑designed with partners'],
    extras: ['Run translation support', 'Create ADA icon pack', 'Launch family training session', 'Propose city feedback ticket'],
    audiences: ['Emergency managers', 'Neighborhood groups', 'Families', 'School leadership']
  },
  materialsPrep: {
    coreKit: ['Phones/tablets', 'Printed base maps', 'High‑vis vests', 'Wayfinding signs', 'Survey forms'],
    noTechFallback: ['Paper arrows and posters', 'Laminated ADA cards', 'Manual route maps'],
    safetyEthics: ['Adult supervision during walks', 'No live emergencies simulated', 'Protect personal data']
  },
  assignments: [
    { id: 'A1', title: 'Hazard/Asset Map + Privacy Pledge', summary: 'Map local hazards and assets and agree to privacy norms.',
      studentDirections: ['List hazards', 'Mark assets', 'Write pledge', 'Share map', 'Note gaps'],
      teacherSetup: ['Provide base maps', 'Guide pledge', 'Review for bias'],
      evidence: ['Map', 'Pledge'], successCriteria: ['I map clearly', 'I respect privacy', 'I note gaps'] },
    { id: 'A2', title: 'AR Storyboard + Equity Check', summary: 'Design overlays and review for readability/ADA.',
      studentDirections: ['Sketch screens', 'Add icons/text', 'Check contrast', 'Revise', 'Submit'],
      teacherSetup: ['Share templates', 'Contrast guide', 'Review ADA'],
      evidence: ['Storyboard'], successCriteria: ['I am readable', 'I include ADA', 'I revise from feedback'],
      aiOptional: { toolUse: 'Contrast suggestions', critique: 'Flag low readability', noAIAlt: 'Peer read test' } },
    { id: 'A3', title: 'Route Mock + Fix List', summary: 'Test routes and log friction points to fix.',
      studentDirections: ['Walk route', 'Time steps', 'Log issues', 'Prioritize fixes', 'Update'],
      teacherSetup: ['Assign marshals', 'Set scripts', 'Check timing'],
      evidence: ['Test log', 'Fix list'], successCriteria: ['I observe safely', 'I document issues', 'I fix wisely'] },
    { id: 'A4', title: 'Resilience Walk + Guide Draft', summary: 'Run public demo and finalize the guide.',
      studentDirections: ['Guide families', 'Collect surveys', 'Add tips', 'Finalize guide', 'Send thanks'],
      teacherSetup: ['Invite partners', 'Brief safety', 'Coordinate translation'],
      evidence: ['Survey dataset', 'Guide v1'], successCriteria: ['I host safely', 'I synthesize data', 'I publish clearly'] }
  ],
  polish: {
    microRubric: ['Readable overlays', 'Accurate routes', 'Privacy respected', 'Partner‑ready handoff'],
    checkpoints: ['Equity/ADA check', 'Partner demo sign‑off', 'Translations done'],
    tags: ['cs', 'geo', 'civics']
  },
  planningNotes: 'Coordinate with emergency partners early; require readable/ADA overlays; brief families on opt‑in and privacy.'
};
