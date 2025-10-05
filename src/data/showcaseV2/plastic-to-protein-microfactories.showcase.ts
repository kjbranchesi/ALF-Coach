import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import plasticProteinImage from '../../utils/hero/images/PlasticProteinMicrofactories.jpeg';

export const plastic_to_protein_microfactoriesV2: ProjectShowcaseV2 = {
  id: 'plastic-to-protein-microfactories',
  version: '2.0.0',
  hero: {
    title: 'Plastic→Protein Microfactories',
    tagline: 'BSL‑1 classroom bioreactors convert plastic feedstocks into safe biomass—measured and ethical.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Biology', 'Chemistry', 'Engineering', 'Data Science', 'Ethics'],
    image: plasticProteinImage
  },
  microOverview: [
    'Teams work with sealed, BSL‑1 educational kits that model plastic‑to‑biomass conversion.',
    'They track growth curves, yields, and costs; evaluate food/feed ethics and safety.',
    'A demo day shows microfactory designs, dashboards, and an ethics brief.'
  ],
  fullOverview:
    'Students prototype small, sealed microfactories that model plastic→biomass conversion using Biosafety Level 1 (BSL‑1) educational kits only. They design safe feedstock preparation (pre‑treated plastic analogs), monitor growth via optical density (OD) and mass, and compare yields across recipes and temperature. Safety Data Sheets (SDS) and personal protective equipment (PPE) are embedded throughout. A dashboard aggregates growth and cost data, while an ethics brief examines safety, food/feed viability, and environmental trade‑offs. Demo day invites partners to inspect designs and data, with clear documentation and disposal logs.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'BSL‑1 safety, plastic chemistry basics, and microfactory concept.',
      teacher: ['Review BSL‑1 rules', 'Introduce feedstock analogs', 'Model growth logging'],
      students: ['Sign safety passport', 'List variables/controls', 'Sketch design'],
      deliverables: ['Safety passport', 'Design scamps'],
      checkpoint: ['All pass BSL‑1 quiz'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Recipe and growth plan with ethics register.',
      teacher: ['Approve BOM + SDS', 'Review ethics risks', 'Model OD/weight measures'],
      students: ['Draft recipe', 'Set controls', 'Draft ethics register'],
      deliverables: ['Recipe + BOM', 'Ethics register v1'],
      checkpoint: ['Teacher approves plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Run growth trials and log OD/weight for yield curves.',
      teacher: ['Supervise PPE', 'Calibrate OD/scale', 'Check logs daily'],
      students: ['Run trials', 'Record OD & mass', 'Update dashboard'],
      deliverables: ['Growth logs', 'Yield curves'],
      checkpoint: ['Mid‑trial audit of logs + disposal plan'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Compare recipes, optimize conditions, and compute cost/yield.',
      teacher: ['Provide cost sheet', 'Coach optimization choices', 'Review math'],
      students: ['Compare yields', 'Tune variables', 'Compute cost per g'],
      deliverables: ['Optimization table', 'Cost/yield chart'],
      checkpoint: ['Teacher verifies math + sources'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Demo day: microfactory hardware, dashboards, and ethics brief.',
      teacher: ['Invite partners', 'Check safety signage', 'Time demos'],
      students: ['Stage microfactory', 'Present dashboard', 'Share ethics brief'],
      deliverables: ['Demo script', 'Ethics brief v1'],
      checkpoint: ['Partner feedback recorded']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Close waste loop and publish open protocol + dashboard.',
      teacher: ['Review disposal logs', 'Coach protocol write‑up', 'Publish dashboard'],
      students: ['File disposal log', 'Publish protocol', 'Share dataset'],
      deliverables: ['Disposal log', 'Protocol v1', 'Dataset link'],
      checkpoint: ['All biosafety steps closed']
    }
  ],
  outcomes: {
    core: ['Operate a sealed, BSL‑1 microfactory model and publish data + ethics brief'],
    extras: [
      'Open protocol and dashboard',
      'Partner debrief on scale‑up',
      'Waste stream close‑out tutorial',
      'Student panel on bioethics'
    ],
    audiences: ['University lab partners', 'Makerspaces', 'City waste office', 'School community']
  },
  materialsPrep: {
    coreKit: [
      'BSL‑1 sealed education kits',
      'PPE: gloves, goggles, coats',
      'Benchtop scale, OD card or colorimeter',
      'Incubator or warm space',
      'Safe feedstock analogs',
      'Laptops for logging'
    ],
    noTechFallback: ['Paper log sheets', 'Visual OD comparison card', 'Manual weight charts'],
    safetyEthics: ['BSL‑1 only, sealed kits', 'Teacher handles disposal', 'No unknown cultures or environmental release']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Safety + Concept Launch',
      summary: 'Pass BSL‑1 expectations and draft design concept.',
      studentDirections: ['Pass quiz', 'Sketch design', 'List variables', 'Name controls', 'Cite SDS'],
      teacherSetup: ['Prepare quiz', 'Provide SDS/BOM', 'Model variables/controls'],
      evidence: ['Safety passport', 'Concept sketch'],
      successCriteria: ['I pass safety', 'I define variables', 'I cite SDS']
    },
    {
      id: 'A2',
      title: 'Recipe + Ethics Register',
      summary: 'Finalize recipe and document risks/mitigations.',
      studentDirections: ['Draft recipe', 'Set controls', 'List risks', 'Name mitigations', 'Submit register'],
      teacherSetup: ['Approve recipe', 'Review risks', 'Check mitigations'],
      evidence: ['Recipe + BOM', 'Ethics register v1'],
      successCriteria: ['I plan controls', 'I log risks', 'I propose mitigations'],
      aiOptional: { toolUse: 'Summarize known risks', critique: 'Flag weak mitigations', noAIAlt: 'Peer ethics circle' }
    },
    {
      id: 'A3',
      title: 'Growth Trials + Dashboard',
      summary: 'Run growth trials and keep a clean dashboard.',
      studentDirections: ['Record OD', 'Weigh samples', 'Update dashboard', 'Photo log', 'Note anomalies'],
      teacherSetup: ['Calibrate tools', 'Check logs', 'Review anomalies'],
      evidence: ['Growth logs', 'Dashboard screenshots'],
      successCriteria: ['I log accurately', 'I visualize clearly', 'I flag anomalies']
    },
    {
      id: 'A4',
      title: 'Optimization + Cost',
      summary: 'Tune for higher yield and lower cost.',
      studentDirections: ['Compare recipes', 'Tune variables', 'Compute cost/g', 'Cite sources', 'Plan next test'],
      teacherSetup: ['Provide cost sheets', 'Review math', 'Coach next tests'],
      evidence: ['Optimization table', 'Cost/yield chart'],
      successCriteria: ['I compare fairly', 'I compute correctly', 'I cite sources']
    }
  ],
  polish: {
    microRubric: [
      'BSL‑1 safety and documentation',
      'Reliable growth data',
      'Clear dashboard communication',
      'Thoughtful ethics analysis'
    ],
    checkpoints: ['Safety quiz passed', 'Mid‑trial audit', 'Disposal log filed'],
    tags: ['bio', 'chem', 'eng']
  },
  planningNotes: 'Use only sealed, BSL‑1 kits and safe analogs; confirm custodial disposal procedures up front; invite a university mentor for demo day.'
};
