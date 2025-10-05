import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import geoEthicsImage from '../../utils/hero/images/GeoengineeringEthicsExpedition.jpeg';

export const geoengineering_ethics_expeditionV2: ProjectShowcaseV2 = {
  id: 'geoengineering-ethics-expedition',
  version: '2.0.0',
  hero: {
    title: 'Geoengineering Ethics Expedition',
    tagline: 'Test digital twins of climate interventions, then host a citizen jury to weigh trade‑offs.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Data Science', 'Policy', 'Ethics', 'Environmental Science'],
    image: geoEthicsImage
  },
  microOverview: [
    'Students review major geoengineering concepts and build simple digital twins.',
    'They analyze benefits/harms across groups with equity in mind.',
    'A citizen jury simulation issues recommendations and caveats.'
  ],
  fullOverview:
    'Students examine proposals like stratospheric aerosol injection (SAI), marine cloud brightening (MCB), enhanced weathering (EW), and carbon dioxide removal (CDR). With simplified models, they simulate impacts and uncertainties, then convene a citizen jury with real stakeholders. Decision templates help jurors articulate risks, consent, reversibility, governance, and monitoring. The outcome is a transparent recommendation report and a public‑facing explainer that prioritizes justice and global equity.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Overview of proposals, uncertainties, and justice.',
      teacher: ['Share concept briefs', 'Model uncertainty', 'Discuss governance'],
      students: ['Select proposals', 'Draft questions', 'Name stakeholders'],
      deliverables: ['Proposal picks', 'Stakeholder map'], checkpoint: ['Teacher approves scope'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Digital twin setup and data sources.',
      teacher: ['Provide models', 'Review sources', 'Coach scenarios'],
      students: ['Set parameters', 'Cite data', 'Plan what‑ifs'],
      deliverables: ['Model plan', 'Data source list'], checkpoint: ['Citations checked'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Run scenarios and equity analysis.',
      teacher: ['Guide analysis', 'Check assumptions', 'Coach visualization'],
      students: ['Run sims', 'Compare groups', 'Visualize impacts'],
      deliverables: ['Scenario results', 'Equity chart'], checkpoint: ['Assumptions log validated'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Citizen jury design: briefs, evidence packs, roles.',
      teacher: ['Share jury templates', 'Invite jurors', 'Time agenda'],
      students: ['Assemble briefs', 'Assign roles', 'Rehearse'],
      deliverables: ['Jury brief pack', 'Agenda'], checkpoint: ['Jurors confirmed'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Run the jury; record deliberation and decision.',
      teacher: ['Moderate session', 'Record notes', 'Ensure fairness'],
      students: ['Present evidence', 'Deliberate', 'Issue decision'],
      deliverables: ['Decision report', 'Deliberation notes'], checkpoint: ['Process audit completed'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Public explainer and governance recommendations.',
      teacher: ['Coach op‑ed style', 'Review governance ideas', 'Plan outreach'],
      students: ['Publish explainer', 'Draft governance recs', 'Share with stakeholders'],
      deliverables: ['Public explainer', 'Governance memo'], checkpoint: ['Stakeholder receipt logged'] }
  ],
  outcomes: {
    core: ['Citizen jury decision on geoengineering proposals with evidence'],
    extras: ['Open model packs', 'Stakeholder map', 'Governance memo', 'Public explainer'],
    audiences: ['Civic groups', 'City climate teams', 'Press', 'Families']
  },
  materialsPrep: {
    coreKit: ['Laptops with models', 'Brief templates', 'Visualization tool', 'Recording sheet'],
    noTechFallback: ['Printed charts', 'Manual calculators', 'Paper juror packs'],
    safetyEthics: ['Avoid false certainty', 'Represent multiple voices', 'Disclose limitations']
  },
  assignments: [
    { id: 'A1', title: 'Scope + Stakeholders', summary: 'Pick proposals and map who is affected.',
      studentDirections: ['Pick proposals', 'List stakeholders', 'Draft questions', 'Flag risks', 'Submit'],
      teacherSetup: ['Share briefs', 'Coach scoping', 'Approve picks'],
      evidence: ['Scope note', 'Stakeholder map'], successCriteria: ['I scope clearly', 'I include voices', 'I articulate risks'] },
    { id: 'A2', title: 'Model Plan + Sources', summary: 'Plan digital twins and cite sources.',
      studentDirections: ['Set parameters', 'List sources', 'Plan what‑ifs', 'State limits', 'Share plan'],
      teacherSetup: ['Provide models', 'Check sources', 'Review limits'],
      evidence: ['Model plan', 'Source list'], successCriteria: ['I cite data', 'I plan what‑ifs', 'I state limits'] },
    { id: 'A3', title: 'Scenario + Equity', summary: 'Run sims and analyze impacts on groups.',
      studentDirections: ['Run scenarios', 'Chart impacts', 'Compare groups', 'Log assumptions', 'Prepare slides'],
      teacherSetup: ['Review charts', 'Check assumptions', 'Coach slides'],
      evidence: ['Scenario charts', 'Assumption log'], successCriteria: ['I compare fairly', 'I chart clearly', 'I document assumptions'] },
    { id: 'A4', title: 'Jury + Decision Pack', summary: 'Host a citizen jury and issue a decision.',
      studentDirections: ['Present evidence', 'Deliberate fairly', 'Vote & record', 'Publish report', 'Debrief'],
      teacherSetup: ['Moderate', 'Record notes', 'Audit process'],
      evidence: ['Decision report', 'Deliberation notes'], successCriteria: ['I deliberate fairly', 'I justify outcome', 'I disclose limits'] }
  ],
  polish: {
    microRubric: ['Transparent assumptions', 'Equity foregrounded', 'Fair process', 'Clear communication'],
    checkpoints: ['Sources checked', 'Assumptions logged', 'Process audit complete'],
    tags: ['policy', 'ethics', 'data']
  },
  planningNotes: 'Pre‑select accessible models; recruit diverse jurors; emphasize uncertainty and ethics at each step.'
};
