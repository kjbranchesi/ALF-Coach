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
      focus: 'Survey proposals, uncertainties, and justice questions to frame the expedition. Ask, "Who wins, who loses, and who never got to vote on this idea?" Teachers facilitate geoengineering concept studios. Students select proposals with mission rationale.',
      teacher: ['Facilitate geoengineering concept studios', 'Model uncertainty mapping protocol', 'Lead governance and consent dialogue'],
      students: ['Select proposals with mission rationale', 'Draft inquiry questions for experts', 'Map impacted stakeholders and power'],
      deliverables: ['Proposal picks', 'Stakeholder map'],
      checkpoint: ['Teacher approves scope'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan digital twin setup and data sources so evidence stays credible. Prompt teams with "What assumptions must we disclose before jurors trust this model?" Teachers provide vetted model sandboxes. Students set parameters with justification.',
      teacher: ['Provide vetted model sandboxes', 'Review source credibility frameworks', 'Coach scenario planning workshops'],
      students: ['Set parameters with justification', 'Compile annotated data citations', 'Design what-if scenario matrices'],
      deliverables: ['Model plan', 'Data source list'],
      checkpoint: ['Citations checked'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Run scenarios and equity analysis to surface trade-offs across communities. Keep returning to "What does this look like for the community with the least power to refuse?" Teachers guide comparative analysis protocols. Students run simulations across populations.',
      teacher: ['Guide comparative analysis protocols', 'Audit assumption logs daily', 'Coach evidence visualization choices'],
      students: ['Run simulations across populations', 'Compare equity impacts transparently', 'Visualize findings for jurors'],
      deliverables: ['Scenario results', 'Equity chart'],
      checkpoint: ['Assumptions log validated'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Design citizen jury briefs, evidence packs, and roles to ensure deliberation is informed. Use prompts like "What perspectives are missing from this packet and why?" Teachers share juror briefing templates. Students assemble balanced evidence briefs.',
      teacher: ['Share juror briefing templates', 'Recruit diverse juror panel', 'Time dress-rehearsal agenda'],
      students: ['Assemble balanced evidence briefs', 'Assign facilitation and observer roles', 'Rehearse testimony and questioning'],
      deliverables: ['Jury brief pack', 'Agenda'],
      checkpoint: ['Jurors confirmed']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Run the jury, record deliberation, and capture decisions with transparency. Remind teams, "How will we show the public exactly how this decision was made?" Teachers moderate jury session impartially. Students present evidence packets clearly.',
      teacher: ['Moderate jury session impartially', 'Record deliberation notes transparently', 'Ensure equity norms stay intact'],
      students: ['Present evidence packets clearly', 'Deliberate using decision tools', 'Issue decision with rationale'],
      deliverables: ['Decision report', 'Deliberation notes'],
      checkpoint: ['Process audit completed'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Publish public explainer and governance recommendations to guide real-world dialogue. Anchor the work in "What do global neighbors need to know before anyone pulls the trigger on this tech?" Teachers coach public explainer storytelling. Students publish accessible explainer content.',
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
      summary: 'Begin by situating each intervention inside real communities and power dynamics. Students select focus proposals, draft rationales, and map who would absorb the risks or benefits before any modeling begins. Teachers supply case studies, facilitate consent dialogues, and ensure stakeholder maps feel grounded, not hypothetical.',
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
      summary: 'Model planning week establishes credibility. Students justify parameters, annotate every data source, and design scenario matrices so jurors see best- and worst-case outcomes clearly. Teachers provide vetted sandboxes, review assumption logs, and pressure-test plans until limitations are transparent.',
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
      summary: 'Simulation week turns evidence into stories jurors can weigh. Students run regional comparisons, chart benefits and harms with justice criteria, and document uncertainties for every assumption they make. Teachers review visualizations, audit logs, and coach teams to translate complex outputs into accessible briefings.',
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
      summary: 'The jury session is the culmination of the expedition. Students present balanced evidence, steward deliberation with fairness tools, and publish decisions that include caveats and governance recommendations. Teachers moderate impartially, record the process transparently, and verify that public explainers reflect what jurors actually decided.',
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
};
