import type { ProjectShowcaseV2 } from '../../types/showcaseV2';

export const luminous_mycelium_networksV2: ProjectShowcaseV2 = {
  id: 'luminous-mycelium-networks',
  version: '2.0.0',
  hero: {
    title: 'Luminous Mycelium Networks',
    tagline: 'Grow safe, pre‑inoculated bioluminescent fungi kits into living, low‑energy light prototypes.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Biology', 'Engineering', 'Sustainability', 'Design & Fabrication']
  },
  microOverview: [
    'Students study fungal growth and bioluminescence using sealed, pre‑inoculated kits.',
    'They design breathable habitats and light diffusers; track growth and glow over time.',
    'A Night Garden exhibit shares prototypes and ethical notes on living design.'
  ],
  fullOverview:
    'Learners explore fungi as designers: structure, networks, and light. Using pre‑inoculated, BSL‑1 compliant glow kits, teams design ventilated enclosures and diffusers that nurture growth while shaping luminous patterns. Students log conditions (humidity, temperature, substrate moisture) and compare glow intensity under different designs. They share findings in a Night Garden event that highlights safe handling, ethics of living artifacts, and possibilities for low‑energy lighting.',
  schedule: { totalWeeks: 5, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Fungi basics, biosafety, and luminescence phenomena.',
      teacher: ['Teach BSL‑1 rules', 'Demo glow kits', 'Model growth logs'],
      students: ['List safety rules', 'Observe starter kits', 'Set lab roles'],
      deliverables: ['Safety agreement', 'Observation sketch'],
      checkpoint: ['All students pass safety check'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design breathable enclosures and measurement plan.',
      teacher: ['Share scaffold library', 'Review diffusion tests', 'Approve designs'],
      students: ['Sketch enclosure', 'Choose materials', 'Draft test schedule'],
      deliverables: ['Enclosure sketch', 'Test plan'],
      checkpoint: ['Teacher signs materials list'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Assemble enclosures; measure growth and glow safely.',
      teacher: ['Supervise PPE use', 'Check logs daily', 'Calibrate photo capture'],
      students: ['Build enclosures', 'Record growth/glow', 'Adjust moisture/airflow'],
      deliverables: ['Growth log set', 'Photo time‑series'],
      checkpoint: ['Mid‑build safety audit'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Night Garden exhibit and ethical reflection.',
      teacher: ['Invite partners', 'Light‑safe staging', 'Collect visitor input'],
      students: ['Curate best builds', 'Explain ethics', 'Plan care/retire'],
      deliverables: ['Exhibit labels', 'Care/retire plan'],
      checkpoint: ['Post‑event care confirmed'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Grow and assess luminous fungal prototypes with safe practice'],
    extras: [
      'Publish growth protocol zine',
      'Design modular diffuser set',
      'Compare substrates and humidity',
      'Draft living‑artifact ethics brief'
    ],
    audiences: ['Makerspaces', 'Sustainability clubs', 'Local science museum', 'City energy office']
  },
  materialsPrep: {
    coreKit: [
      'Pre‑inoculated glow mushroom kits (sealed)',
      'Gloves, goggles, lab coats',
      'Breathable enclosure materials',
      'Hygrometer/thermometer',
      'Camera/phone with tripod',
      'LED test lights for comparison'
    ],
    noTechFallback: ['Paper growth charts', 'Light/dark visual scale', 'Cardboard diffuser mockups'],
    safetyEthics: ['No open plating or DIY inoculation', 'Keep kits sealed; PPE required', 'Teacher handles any disposal']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Glow Lab + Safety Passport',
      summary: 'Observe luminescence; pass safety and care basics.',
      studentDirections: ['List safety rules', 'Sketch glow pattern', 'Note conditions', 'Sign passport', 'Share one question'],
      teacherSetup: ['Prepare safety quiz', 'Demo kit handling', 'Post lab rules'],
      evidence: ['Signed passport', 'Observation sketch'],
      successCriteria: ['I follow PPE rules', 'I record clearly', 'I ask a testable question'],
      checkpoint: 'All passports signed before builds'
    },
    {
      id: 'A2',
      title: 'Enclosure Design Plan',
      summary: 'Plan a breathable, light‑shaping habitat.',
      studentDirections: ['Sketch design', 'Select materials', 'Define airflow', 'Plan measures', 'Request approval'],
      teacherSetup: ['Share scaffold parts', 'Approve BOM', 'Check feasibility'],
      evidence: ['Sketch and BOM', 'Test plan'],
      successCriteria: ['I ensure airflow', 'I plan measures', 'I justify materials']
    },
    {
      id: 'A3',
      title: 'Growth + Glow Log',
      summary: 'Assemble enclosures and track change over time.',
      studentDirections: ['Build safely', 'Log daily notes', 'Capture photos', 'Adjust humidity', 'Compare glow'],
      teacherSetup: ['Supervise PPE', 'Set photo station', 'Check logs'],
      evidence: ['Growth logs', 'Photo time‑series'],
      successCriteria: ['I maintain PPE', 'I log daily', 'I compare fairly']
    },
    {
      id: 'A4',
      title: 'Night Garden Exhibit',
      summary: 'Share prototypes and living‑artifact ethics.',
      studentDirections: ['Curate builds', 'Write label', 'Explain ethics', 'Collect feedback', 'Plan retirement'],
      teacherSetup: ['Invite partners', 'Stage safely', 'Provide label templates'],
      evidence: ['Exhibit label set', 'Care/retire plan'],
      successCriteria: ['I present clearly', 'I respect organisms', 'I plan care']
    }
  ],
  polish: {
    microRubric: [
      'Safe handling throughout',
      'Functional enclosure design',
      'Reliable growth records',
      'Clear public explanation'
    ],
    checkpoints: ['Safety passport check', 'Mid‑build audit', 'Post‑exhibit care review'],
    tags: ['bio', 'design', 'sustainability']
  }
};

