import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import emotionalVaneImage from '../../utils/hero/images/AIEmotionalWeatherVane.jpeg';

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
    'Students build a respectful, privacy‑aware “emotional weather vane” that turns aggregated climate data into shared awareness. They co‑design opt‑in micro check‑ins (emoji sliders, color taps) with IRB‑lite guardrails and align to the Protection of Pupil Rights Amendment (PPRA) and the Family Educational Rights and Privacy Act (FERPA). A lightweight sentiment pipeline (rule‑based or zero‑shot classifier on anonymized text) maps outputs to servo motion and light‑emitting diode (LED) color patterns for a kinetic sculpture. Ethics are central: de‑identification, consent, opt‑outs, and clear disclaimers drive the design. A final exhibit shares the artifact, methods, and a wellbeing resource guide.',
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
    core: [
      'Design consent-forward SEL check-ins aligned to privacy policies',
      'Build and tune emotion-aware pipelines that power kinetic feedback safely',
      'Communicate wellbeing resources and transparent methods to the school community'
    ],
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
      studentDirections: ['Draft consent language in student voice', 'Sketch opt-in UI wireframe', 'Define clear opt-out paths and reminders', 'List harms and mitigations with counselors', 'Submit for review and revisions'],
      teacherSetup: ['Share policy templates and exemplars', 'Review language with counselor', 'Coordinate admin approval'],
      evidence: ['Consent + UI draft'],
      successCriteria: ['I write consent that families understand easily', 'I design opt-in UI that protects privacy', 'I document opt-out paths and mitigations clearly'],
      aiOptional: {
        toolUse: 'Suggest plain-language consent sentences',
        critique: 'Verify AI text stays accurate and trauma-informed',
        noAIAlt: 'Use counselor feedback sentence bank'
      }
    },
    {
      id: 'A2',
      title: 'Pipeline + Mapping Plan',
      summary: 'Choose classifier and define outputs→motion/light mapping.',
      studentDirections: ['Pick classifier option and justify choice', 'Define outputs and thresholds with counselors', 'Set mapping rules for servo and LED patterns', 'List risks and mitigations in register', 'Cite sources for models and datasets'],
      teacherSetup: ['Provide classifier options and supports', 'Review mapping choices with counseling team', 'Check sources and licensing'],
      evidence: ['Pipeline plan', 'Risk register v1'],
      successCriteria: ['I choose a feasible, ethical classifier', 'I map outputs to motion and light transparently', 'I cite every dataset and tool responsibly'],
      aiOptional: {
        toolUse: 'Brainstorm servo/light pattern ideas from classifier outputs',
        critique: 'Reject AI ideas that reveal individual data',
        noAIAlt: 'Use peer ethics review protocol'
      }
    },
    {
      id: 'A3',
      title: 'Demo Prototype',
      summary: 'Test sentiment and show motion/light response.',
      studentDirections: ['Run demo data through pipeline safely', 'Record video showing outputs', 'Tune thresholds with counselor feedback', 'Note failure modes and privacy flags', 'Log next steps with timestamps'],
      teacherSetup: ['Provide de-identified sample data', 'Check wiring/PPE before demos', 'Coach tuning and documentation'],
      evidence: ['Demo video', 'Tuning notes'],
      successCriteria: ['I operate wiring and hardware safely', 'I tune thresholds to avoid false alarms', 'I document issues and privacy checks carefully'],
      aiOptional: {
        toolUse: 'Analyze demo logs for misclassifications',
        critique: 'Ensure AI analysis ignores personal identifiers',
        noAIAlt: 'Use manual confusion table review'
      }
    },
    {
      id: 'A4',
      title: 'Enclosure + Signage',
      summary: 'Assemble display and finalize consent signage.',
      studentDirections: ['Assemble enclosure with cable management', 'Test stability and access with admin', 'Post consent and opt-out signage visibly', 'Implement mounting and nightly storage plan', 'Confirm installation location with facilities'],
      teacherSetup: ['Review enclosure stability and safety', 'Approve signage language with counselors', 'Confirm location logistics and power'],
      evidence: ['Enclosure spec', 'Signage photos'],
      successCriteria: ['I ensure the sculpture is stable and tamper safe', 'I communicate consent and privacy clearly on signage', 'I secure approvals for placement and maintenance'],
      aiOptional: {
        toolUse: 'Draft signage layout from approved language',
        critique: 'Check AI layout maintains required legal wording',
        noAIAlt: 'Use school signage template manually'
      }
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
