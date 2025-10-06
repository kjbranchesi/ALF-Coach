import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import spaceCuisineImage from '../../utils/hero/images/Bio-LoopedSpaceCuisine.jpeg';

export const bio_looped_space_cuisineV2: ProjectShowcaseV2 = {
  id: 'bio-looped-space-cuisine',
  version: '2.0.0',
  hero: {
    title: 'Bio‑Looped Space Cuisine',
    tagline: 'Prototype classroom closed‑loop food systems for long missions with safe, small‑scale rigs.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Biology', 'Systems Engineering', 'Nutrition', 'Environmental Science'],
    image: spaceCuisineImage
  },
  microOverview: [
    'Students model a miniature loop: plants, water, waste reuse, and energy inputs.',
    'They test growth under resource limits and log trade‑offs in a mission journal.',
    'Teams present mission‑ready meal plans and loop schematics.'
  ],
  fullOverview:
    'Learners build classroom‑safe components of a closed‑loop food system: microgreens or dwarf crops, simple filtration, composting/vermiculture proxies, and LED lighting. They allocate limited energy, track growth and water use, and draft a mission day meal plan with nutrition constraints. Loop performance is documented in a mission journal, highlighting trade‑offs and reliability under failure scenarios. Final boards justify loop design for a hypothetical long‑duration mission.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore closed loops, energy limits, and food safety basics to frame the mission challenge.',
      teacher: ['Facilitate loop systems mini-lesson', 'Lead safety certification lab', 'Model mission journal entry'],
      students: ['Sketch loop concept maps', 'Commit to mission goals', 'Launch journal with safety reflection'],
      deliverables: ['Loop sketch', 'Journal v1'],
      checkpoint: ['Safety rules passed'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Build plan and resource budget so the loop stays within mission constraints from day one.',
      teacher: ['Approve materials against constraints', 'Share energy budget scenarios', 'Review nutrition targets with examples'],
      students: ['Draft detailed materials BOM', 'Storyboard component layout', 'Budget daily energy and water allowances'],
      deliverables: ['BOM', 'Budget plan'],
      checkpoint: ['Teacher approves plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Assemble the mini loop and track growth plus resource use to ground iteration in evidence.',
      teacher: ['Supervise build stations for safety', 'Audit mission logs daily', 'Coach tuning adjustments with data'],
      students: ['Assemble loop hardware safely', 'Log growth and resource metrics daily', 'Tune inputs based on evidence'],
      deliverables: ['Loop photos', 'Growth/resource logs'],
      checkpoint: ['Mid‑build audit'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Run failure scenarios and reliability improvements to pressure-test the loop under stress.',
      teacher: ['Demonstrate controlled failure tests', 'Guide safe contingency drills', 'Audit mission journal updates'],
      students: ['Run failure simulations carefully', 'Log outcomes with timestamps', 'Add redundancy or backup plans'],
      deliverables: ['Failure report', 'Revised plan'],
      checkpoint: ['Teacher confirms safety limits']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Produce mission board showcasing loop schematic and meal plan for reviewer endorsement.',
      teacher: ['Invite NASA-style reviewers', 'Coach nutrition math run-throughs', 'Time final briefings'],
      students: ['Present loop schematic clearly', 'Defend meal plan with data', 'Share trade-offs and next actions'],
      deliverables: ['Mission board', 'Journal excerpts'],
      checkpoint: ['Reviewers log notes'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: [
      'Design and operate a closed-loop food prototype within mission constraints',
      'Analyze growth and resource data to optimize loop performance',
      'Communicate mission-ready meal plans with documented trade-offs and safety checks'
    ],
    extras: ['Failure mode card set', 'Energy budget calculator', 'Nutrition target guide', 'Care/maintenance SOP'],
    audiences: ['STEM clubs', 'Space museum partners', 'Families', 'District showcase']
  },
  materialsPrep: {
    coreKit: ['Grow trays/seeds', 'LED lights', 'Water containers', 'Safe filter media', 'Timers', 'Scales'],
    noTechFallback: ['Manual logs', 'Paper budget charts', 'Poster loop diagrams'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Loop Sketch + Safety',
      summary: 'Students sketch their loop concept and complete safety certification for mission readiness.',
      studentDirections: [
        'Sketch loop subsystems with labeled flows',
        'List components and mission purpose',
        'Pass safety certification quiz',
        'Launch journal with mission log entry',
        'Set measurable growth and nutrition goals'
      ],
      teacherSetup: ['Share exemplar loop diagrams', 'Facilitate safety certification lab', 'Provide mission journal template'],
      evidence: ['Sketch', 'Journal v1'],
      successCriteria: ['I diagram subsystems clearly', 'I meet every safety requirement', 'I log goals with mission voice'],
      aiOptional: {
        toolUse: 'Generate labeled loop diagram from component list',
        critique: 'Check AI labels match safety protocols',
        noAIAlt: 'Use teacher-provided labeling checklist'
      }
    },
    {
      id: 'A2',
      title: 'Plan + Budget',
      summary: 'Teams budget energy and water while planning materials so every component earns its place.',
      studentDirections: [
        'Draft detailed BOM with sourcing notes',
        'Calculate daily energy budget scenarios',
        'Calculate water recycling requirements',
        'Storyboard loop layout to scale',
        'Publish plan packet for approval'
      ],
      teacherSetup: ['Approve BOM against constraints', 'Share sample budgets and templates', 'Review plans in design critique'],
      evidence: ['BOM', 'Budgets'],
      successCriteria: ['I justify every material choice', 'I balance energy and water budgets', 'I visualize layout to mission scale'],
      aiOptional: {
        toolUse: 'Suggest efficiency tips based on budget inputs',
        critique: 'Verify tips respect classroom limits',
        noAIAlt: 'Consult facilities mentor checklist'
      }
    },
    {
      id: 'A3',
      title: 'Build + Log',
      summary: 'Students assemble the loop and log performance trends to steer evidence-based tuning.',
      studentDirections: [
        'Assemble loop safely following SOP',
        'Log daily growth and resource metrics clearly',
        'Tune inputs using evidence comparisons',
        'Capture photo log with annotations',
        'Flag issues and propose fixes in journal'
      ],
      teacherSetup: ['Supervise builds and safety checkpoints', 'Audit mission logs daily', 'Coach troubleshooting huddles'],
      evidence: ['Loop photos', 'Logs'],
      successCriteria: ['I operate the loop within safety limits', 'I record mission data consistently', 'I adjust inputs with evidence'],
      aiOptional: {
        toolUse: 'Analyze log data for pattern insights',
        critique: 'Reject AI advice that breaks constraints',
        noAIAlt: 'Use peer review protocol for logs'
      }
    },
    {
      id: 'A4',
      title: 'Mission Board',
      summary: 'Teams present the loop with meal plan and trade-offs, inviting mission-style critique.',
      studentDirections: [
        'Design mission board with labeled schematic',
        'Draft nutrition-balanced mission meal plan',
        'Explain trade-offs and contingency plans',
        'Rehearse mission briefing within time limit',
        'Capture stakeholder feedback and commitments'
      ],
      teacherSetup: ['Invite reviewers and allocate roles', 'Time and film mission briefings', 'Collect reviewer debrief notes'],
      evidence: ['Mission board', 'Q&A notes'],
      successCriteria: ['I defend loop design with data', 'I articulate mission trade-offs clearly', 'I capture reviewer feedback for iteration'],
      aiOptional: {
        toolUse: 'Draft mission briefing script from notes',
        critique: 'Ensure script stays factual and respectful',
        noAIAlt: 'Use provided briefing outline template'
      }
    }
  ],
};
