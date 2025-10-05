import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import spaceCuisineImage from '../../utils/hero/images/Bio‑LoopedSpaceCuisine.jpeg';

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
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Closed loops, energy limits, and food safety basics.',
      teacher: ['Teach loop concepts', 'Set safety rules', 'Model journal'],
      students: ['Sketch loop', 'Set goals', 'Start journal'],
      deliverables: ['Loop sketch', 'Journal v1'], checkpoint: ['Safety rules passed'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Build plan and resource budget.',
      teacher: ['Approve materials', 'Share energy budget', 'Review nutrition targets'],
      students: ['Draft BOM', 'Plan layout', 'Budget energy/water'],
      deliverables: ['BOM', 'Budget plan'], checkpoint: ['Teacher approves plan'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Assemble mini loop; track growth and resource use.',
      teacher: ['Supervise setup', 'Check logs', 'Coach adjustments'],
      students: ['Build system', 'Log daily', 'Tune inputs'],
      deliverables: ['Loop photos', 'Growth/resource logs'], checkpoint: ['Mid‑build audit'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Failure scenarios and reliability improvements.',
      teacher: ['Model failure', 'Guide safe tests', 'Check journaling'],
      students: ['Run failure test', 'Record outcomes', 'Add redundancy'],
      deliverables: ['Failure report', 'Revised plan'], checkpoint: ['Teacher confirms safety limits'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Mission board: loop schematic and meal plan.',
      teacher: ['Invite reviewers', 'Coach nutrition math', 'Time talks'],
      students: ['Present loop', 'Defend plan', 'Share trade‑offs'],
      deliverables: ['Mission board', 'Journal excerpts'], checkpoint: ['Reviewers log notes'], assignments: ['A4'] }
  ],
  outcomes: {
    core: ['Build a safe mini loop and defend a mission meal plan'],
    extras: ['Failure mode card set', 'Energy budget calculator', 'Nutrition target guide', 'Care/maintenance SOP'],
    audiences: ['STEM clubs', 'Space museum partners', 'Families', 'District showcase']
  },
  materialsPrep: {
    coreKit: ['Grow trays/seeds', 'LED lights', 'Water containers', 'Safe filter media', 'Timers', 'Scales'],
    noTechFallback: ['Manual logs', 'Paper budget charts', 'Poster loop diagrams'],
    safetyEthics: ['No ingesting classroom crops', 'Avoid mold growth', 'Teacher handles any disposal']
  },
  assignments: [
    { id: 'A1', title: 'Loop Sketch + Safety', summary: 'Sketch your loop and pass safety basics.',
      studentDirections: ['Sketch loop', 'List components', 'Pass safety rules', 'Start journal', 'Set goals'],
      teacherSetup: ['Share examples', 'Safety review', 'Journal template'],
      evidence: ['Sketch', 'Journal v1'], successCriteria: ['I sketch clearly', 'I follow safety', 'I log consistently'] },
    { id: 'A2', title: 'Plan + Budget', summary: 'Budget energy/water and plan materials.',
      studentDirections: ['Draft BOM', 'Budget energy', 'Budget water', 'Layout plan', 'Submit'],
      teacherSetup: ['Approve BOM', 'Share budgets', 'Review plans'],
      evidence: ['BOM', 'Budgets'], successCriteria: ['I budget reasonably', 'I plan layout', 'I justify choices'] },
    { id: 'A3', title: 'Build + Log', summary: 'Assemble loop and log performance.',
      studentDirections: ['Build safely', 'Log daily', 'Tune inputs', 'Photo log', 'Flag issues'],
      teacherSetup: ['Supervise builds', 'Check logs', 'Advise fixes'],
      evidence: ['Loop photos', 'Logs'], successCriteria: ['I build safely', 'I log reliably', 'I tune thoughtfully'] },
    { id: 'A4', title: 'Mission Board', summary: 'Present your loop with meal plan and trade‑offs.',
      studentDirections: ['Present loop', 'Share meal plan', 'Explain trade‑offs', 'Answer questions', 'Submit board'],
      teacherSetup: ['Invite reviewers', 'Time talks', 'Collect notes'],
      evidence: ['Mission board', 'Q&A notes'], successCriteria: ['I defend choices', 'I show evidence', 'I accept feedback'] }
  ],
  polish: {
    microRubric: ['Safe operations', 'Evidence‑based tuning', 'Clear trade‑offs', 'Mission feasibility'],
    checkpoints: ['Safety rules passed', 'Mid‑build audit', 'Reviewers debrief'],
    tags: ['bio', 'systems']
  },
  planningNotes: 'Order grow supplies early; set strict hygiene and non‑ingestion rules; consider partnering with a local hydroponics mentor.'
};
