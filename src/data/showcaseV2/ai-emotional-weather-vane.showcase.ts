import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import emotionalVaneImage from '../../utils/hero/images/AIEmotionalWeather Vane.jpeg';

export const ai_emotional_weather_vaneV2: ProjectShowcaseV2 = {
  id: 'ai-emotional-weather-vane',
  version: '2.0.0',
  hero: {
    title: 'AI Emotional Weather Vane',
    tagline: 'Anonymous school‑climate signals drive a kinetic sculpture that visualizes wellbeing.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Computer Science', 'Design', 'SEL', 'Data Science', 'Engineering'],
    image: emotionalVaneImage
  },
  microOverview: [
    'Students co‑design anonymous check‑ins aligned to SEL norms and privacy policies.',
    'They train a simple sentiment pipeline and map results to motion/light patterns.',
    'A school‑safe kinetic sculpture displays daily climate with opt‑in insights.'
  ],
  fullOverview:
    'Students build a respectful, privacy‑aware “emotional weather vane” that turns aggregated climate data into shared awareness. They co‑design opt‑in micro check‑ins (emoji sliders, color taps) with IRB‑lite guardrails, then run a lightweight sentiment pipeline (rule‑based or zero‑shot classifier on anonymized text). Mapping outputs to servo motion and LED color patterns, teams prototype a kinetic sculpture for public spaces. Ethics are central: de‑identification, consent, opt‑outs, and clear disclaimers drive the design. A final exhibit shares the artifact, methods, and a wellbeing resource guide.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'SEL check‑in norms, privacy/PPRA/FERPA basics, and consent language.',
      teacher: ['Review privacy policies', 'Model opt‑in flow', 'Share harms/benefits'],
      students: ['Draft consent text', 'Design check‑in UI', 'List opt‑out paths'],
      deliverables: ['Consent + UI draft'],
      checkpoint: ['Admin/counselor review passed'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Pipeline and sculpture plan; ethics risk register.',
      teacher: ['Share classifier options', 'Review de‑identification', 'Coach risk framing'],
      students: ['Select pipeline', 'Define mapping rules', 'Log risks + mitigations'],
      deliverables: ['Pipeline plan', 'Risk register v1'],
      checkpoint: ['Teacher signs ethics gates'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Prototype sentiment demo and servo/LED mapping.',
      teacher: ['Provide sample data', 'Coach safe tests', 'Check wiring'],
      students: ['Test classifier', 'Build servo + LED demo', 'Tune mapping'],
      deliverables: ['Demo video', 'Mapping table'],
      checkpoint: ['Wiring safety check'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Assemble sculpture enclosure; finalize UI and consent signage.',
      teacher: ['Review enclosure safety', 'Print signage', 'Schedule trial'],
      students: ['Assemble enclosure', 'Finalize UI', 'Post signage'],
      deliverables: ['Enclosure spec', 'Signage set'],
      checkpoint: ['Admin location approval'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Trial run with opt‑in users and resource handouts.',
      teacher: ['Invite counselors', 'Monitor trial', 'Collect feedback'],
      students: ['Run trial', 'Hand out resources', 'Log feedback'],
      deliverables: ['Trial log', 'Feedback notes'],
      checkpoint: ['Counselor sign‑off for public display']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Extension',
      focus: 'Refine privacy + publish wellbeing guide and methods.',
      teacher: ['Review de‑identification', 'Coach guide layout', 'Debrief ethics'],
      students: ['Refine pipeline', 'Publish guide', 'Share methods'],
      deliverables: ['Wellbeing guide', 'Methods page'],
      checkpoint: ['Privacy checklist complete']
    }
  ],
  outcomes: {
    core: ['Deploy a privacy‑respecting climate sculpture with documented methods'],
    extras: [
      'Publish opt‑in UI templates',
      'Create educator privacy checklist',
      'Run student ambassador training',
      'Contribute de‑identified aggregates to research'
    ],
    audiences: ['Counseling team', 'School administration', 'Families', 'Ed‑tech partners']
  },
  materialsPrep: {
    coreKit: [
      'Microcontroller + servo + LED strip',
      'Laser‑cut or cardboard enclosure',
      'Laptops/tablets for UI',
      'PPE for fabrication',
      'Printed consent + signage'
    ],
    noTechFallback: ['Paper emoji check‑ins', 'Manual tally board', 'Colored flags display'],
    safetyEthics: ['Opt‑in only + de‑identified', 'No individual dashboards', 'Counselor oversight for trials']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Consent + Check‑In UI',
      summary: 'Draft opt‑in language and design a safe UI.',
      studentDirections: ['Draft consent line', 'Sketch UI', 'Define opt‑out', 'List harms/mitigations', 'Submit for review'],
      teacherSetup: ['Share policy templates', 'Review language', 'Coordinate counselor review'],
      evidence: ['Consent + UI draft'],
      successCriteria: ['I respect privacy', 'I use clear language', 'I plan opt‑out']
    },
    {
      id: 'A2',
      title: 'Pipeline + Mapping Plan',
      summary: 'Choose classifier and define outputs→motion/light mapping.',
      studentDirections: ['Pick classifier', 'Define outputs', 'Set mapping rules', 'List risks', 'Cite sources'],
      teacherSetup: ['Provide options', 'Review mapping choices', 'Check sources'],
      evidence: ['Pipeline plan', 'Risk register v1'],
      successCriteria: ['I choose feasible', 'I map clearly', 'I cite sources'],
      aiOptional: { toolUse: 'Generate mapping ideas', critique: 'Flag privacy risks', noAIAlt: 'Peer ethics review' }
    },
    {
      id: 'A3',
      title: 'Demo Prototype',
      summary: 'Test sentiment and show motion/light response.',
      studentDirections: ['Run demo data', 'Record video', 'Tune thresholds', 'Note failure modes', 'Log next steps'],
      teacherSetup: ['Provide sample data', 'Check wiring/PPE', 'Coach tuning'],
      evidence: ['Demo video', 'Tuning notes'],
      successCriteria: ['I wire safely', 'I tune sensibly', 'I log issues']
    },
    {
      id: 'A4',
      title: 'Enclosure + Signage',
      summary: 'Assemble display and finalize consent signage.',
      studentDirections: ['Assemble enclosure', 'Test stability', 'Post signage', 'Plan mounting', 'Confirm location'],
      teacherSetup: ['Review stability', 'Approve signage', 'Confirm location'],
      evidence: ['Enclosure spec', 'Signage photos'],
      successCriteria: ['I ensure stability', 'I inform clearly', 'I confirm placement']
    }
  ],
  polish: {
    microRubric: [
      'Privacy and consent respected',
      'Clear mapping from data to motion',
      'Safe fabrication and install',
      'Transparent methods + limits'
    ],
    checkpoints: ['Admin/counselor review', 'Wiring safety check', 'Privacy checklist complete'],
    tags: ['cs', 'sel', 'design']
  },
  planningNotes: 'Coordinate with counselors/admin first; keep de‑identification strict; avoid individual‑level dashboards or alerts.'
};
