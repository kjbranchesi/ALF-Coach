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
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Overview of proposals, uncertainties, and justice.',
      teacher: ['Facilitate geoengineering concept studios', 'Model uncertainty mapping protocol', 'Lead governance and consent dialogue'],
      students: ['Select proposals with mission rationale', 'Draft inquiry questions for experts', 'Map impacted stakeholders and power'],
      deliverables: ['Proposal picks', 'Stakeholder map'],
      checkpoint: ['Teacher approves scope'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Digital twin setup and data sources.',
      teacher: ['Provide vetted model sandboxes', 'Review source credibility frameworks', 'Coach scenario planning workshops'],
      students: ['Set parameters with justification', 'Compile annotated data citations', 'Design what-if scenario matrices'],
      deliverables: ['Model plan', 'Data source list'],
      checkpoint: ['Citations checked'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Run scenarios and equity analysis.',
      teacher: ['Guide comparative analysis protocols', 'Audit assumption logs daily', 'Coach evidence visualization choices'],
      students: ['Run simulations across populations', 'Compare equity impacts transparently', 'Visualize findings for jurors'],
      deliverables: ['Scenario results', 'Equity chart'],
      checkpoint: ['Assumptions log validated'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Citizen jury design: briefs, evidence packs, roles.',
      teacher: ['Share juror briefing templates', 'Recruit diverse juror panel', 'Time dress-rehearsal agenda'],
      students: ['Assemble balanced evidence briefs', 'Assign facilitation and observer roles', 'Rehearse testimony and questioning'],
      deliverables: ['Jury brief pack', 'Agenda'],
      checkpoint: ['Jurors confirmed']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Run the jury; record deliberation and decision.',
      teacher: ['Moderate jury session impartially', 'Record deliberation notes transparently', 'Ensure equity norms stay intact'],
      students: ['Present evidence packets clearly', 'Deliberate using decision tools', 'Issue decision with rationale'],
      deliverables: ['Decision report', 'Deliberation notes'],
      checkpoint: ['Process audit completed'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Public explainer and governance recommendations.',
      teacher: ['Coach public explainer storytelling', 'Review governance recommendations for rigor', 'Coordinate outreach timeline with partners'],
      students: ['Publish accessible explainer content', 'Draft governance recommendations memo', 'Share outputs with stakeholders for response'],
      deliverables: ['Public explainer', 'Governance memo'],
      checkpoint: ['Stakeholder receipt logged']
    }
  ],
  outcomes: {
    core: [
      'Investigate geoengineering interventions through evidence-based digital twin analysis',
      'Evaluate equity, consent, and governance trade-offs using stakeholder perspectives',
      'Design a citizen jury process that issues transparent, justified recommendations'
    ],
    extras: ['Open model packs', 'Stakeholder map', 'Governance memo', 'Public explainer'],
    audiences: ['Civic groups', 'City climate teams', 'Press', 'Families']
  },
  materialsPrep: {
    coreKit: ['Laptops with models', 'Brief templates', 'Visualization tool', 'Recording sheet'],
    noTechFallback: ['Printed charts', 'Manual calculators', 'Paper juror packs'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Scope + Stakeholders',
      summary: 'Pick proposals and map who is affected.',
      studentDirections: [
        'Select two interventions with written rationale',
        'Map stakeholders and power relationships',
        'Draft expert interview questions for uncertainties',
        'Flag ethical risks and consent concerns',
        'Submit scoping memo for approval'
      ],
      teacherSetup: ['Share proposal briefs and case studies', 'Coach scoping clinic', 'Approve scope selections'],
      evidence: ['Scope note', 'Stakeholder map'],
      successCriteria: ['I justify proposal selection with evidence', 'I include impacted voices equitably', 'I surface key risks transparently'],
      aiOptional: {
        toolUse: 'Generate stakeholder personas from proposal context',
        critique: 'Check AI personas for bias or omissions',
        noAIAlt: 'Use stakeholder wheel template manually'
      }
    },
    {
      id: 'A2',
      title: 'Model Plan + Sources',
      summary: 'Plan digital twins and cite sources.',
      studentDirections: [
        'Set model parameters with scientific justification',
        'Compile annotated bibliography of data sources',
        'Design what-if scenario plan covering edge cases',
        'Detail model limits and uncertainty plan',
        'Share plan for peer and teacher feedback'
      ],
      teacherSetup: ['Provide model sandboxes and guides', 'Check source credibility with students', 'Review uncertainty statements'],
      evidence: ['Model plan', 'Source list'],
      successCriteria: ['I cite high-quality data sources', 'I plan scenarios that test extremes', 'I state model limits honestly'],
      aiOptional: {
        toolUse: 'Suggest additional peer-reviewed sources',
        critique: 'Verify AI suggestions meet credibility criteria',
        noAIAlt: 'Use library database search checklist'
      }
    },
    {
      id: 'A3',
      title: 'Scenario + Equity',
      summary: 'Run sims and analyze impacts on groups.',
      studentDirections: [
        'Run simulations for multiple regions and populations',
        'Chart benefits and harms with clarifying annotations',
        'Compare impacts using justice criteria',
        'Log assumptions and data limitations daily',
        'Design equity briefing slides for jurors'
      ],
      teacherSetup: ['Review charts for clarity', 'Check assumption logs routinely', 'Coach slide storytelling with equity lens'],
      evidence: ['Scenario charts', 'Assumption log'],
      successCriteria: ['I compare interventions through equity metrics', 'I visualize findings clearly for jurors', 'I document assumptions and uncertainties'],
      aiOptional: {
        toolUse: 'Analyze simulation outputs for emerging patterns',
        critique: 'Reject AI claims lacking evidence',
        noAIAlt: 'Use peer equity audit protocol'
      }
    },
    {
      id: 'A4',
      title: 'Jury + Decision Pack',
      summary: 'Host a citizen jury and issue a decision.',
      studentDirections: [
        'Present evidence using juror-friendly language',
        'Facilitate deliberation with fairness checklist',
        'Record votes and rationale accurately',
        'Publish decision report with caveats',
        'Lead debrief noting governance next steps'
      ],
      teacherSetup: ['Moderate the jury to uphold norms', 'Record deliberation notes and timing', 'Audit process for transparency'],
      evidence: ['Decision report', 'Deliberation notes'],
      successCriteria: ['I facilitate deliberation with justice norms', 'I justify the jury outcome transparently', 'I document limits and next steps'],
      aiOptional: {
        toolUse: 'Draft decision report outline from deliberation notes',
        critique: 'Ensure AI outline reflects actual juror conclusions',
        noAIAlt: 'Use decision template from jury toolkit'
      }
    }
  ],
  polish: {
    microRubric: ['Transparent assumptions', 'Equity foregrounded', 'Fair process', 'Clear communication'],
    checkpoints: ['Sources checked', 'Assumptions logged', 'Process audit complete'],
    tags: ['policy', 'ethics', 'data']
  },
  planningNotes: 'Audit scenario models with science partners 3 weeks ahead to confirm accessibility. Recruit a diverse jury and lock logistics before Week 3, and message that uncertainty and ethics guide decisions.'
};
