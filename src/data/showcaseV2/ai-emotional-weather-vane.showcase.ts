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
      focus: 'Align SEL check-ins with privacy policies and consent language to build trust. Pose questions such as "What information would make you comfortable tapping submit tomorrow?" Teachers review privacy policies with counselors highlighting PPRA and FERPA boundaries. Students draft consent text in student voice with counselor feedback.',
      teacher: [
        'Review privacy policies with counselors highlighting PPRA and FERPA boundaries',
        'Model opt-in flow and anonymized data handling for students',
        'Share potential harms and benefits to guide consent dialogue'
      ],
      students: [
        'Draft consent text in student voice with counselor feedback',
        'Design check-in interface that respects opt-in and privacy',
        'List opt-out paths and escalation points for wellbeing support'
      ],
      deliverables: ['Consent + UI draft'],
      checkpoint: ['Admin/counselor review passed'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan sentiment pipeline, sculpture mapping, and ethics risk register for deployment. Ask, "What should the sculpture never reveal, even by accident?" to anchor risk planning. Teachers share classifier options with transparency around limitations. Students select sentiment pipeline and justify feasibility and ethics.',
      teacher: [
        'Share classifier options with transparency around limitations',
        'Review de-identification practices and storage safeguards',
        'Coach teams framing risks, mitigations, and escalation triggers'
      ],
      students: [
        'Select sentiment pipeline and justify feasibility and ethics',
        'Define mapping rules translating outputs to motion and light',
        'Log risks, mitigations, and owner actions in register'
      ],
      deliverables: ['Pipeline plan', 'Risk register v1'],
      checkpoint: ['Teacher signs ethics gates'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Prototype sentiment demo linking pipeline outputs to servo and LED mapping responsibly. Keep returning to "How will we know the sculpture is sensing mood, not individuals?" during integration. Teachers provide sample data ensuring de-identification and consent compliance. Students test classifier using de-identified sample data responsibly.',
      teacher: [
        'Provide sample data ensuring de-identification and consent compliance',
        'Coach safe tests and troubleshooting for hardware integration',
        'Check wiring and PPE procedures before live demos'
      ],
      students: [
        'Test classifier using de-identified sample data responsibly',
        'Build servo and LED demo showing output mapping clearly',
        'Tune mapping thresholds with counselor feedback and logs'
      ],
      deliverables: ['Demo video', 'Mapping table'],
      checkpoint: ['Wiring safety check'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Assemble sculpture enclosure and finalize participant UI plus consent signage. Plan around prompts like "What would make families confident standing next to this display?" Teachers review enclosure safety, ventilation, and cable management standards. Students assemble enclosure ensuring stability and tamper resistance.',
      teacher: [
        'Review enclosure safety, ventilation, and cable management standards',
        'Print signage with approved consent language and opt-out steps',
        'Schedule trial installation and facilities walkthrough'
      ],
      students: [
        'Assemble enclosure ensuring stability and tamper resistance',
        'Finalize UI flow addressing accessibility and supportive language',
        'Post signage and confirm location with admin and facilities'
      ],
      deliverables: ['Enclosure spec', 'Signage set'],
      checkpoint: ['Admin location approval'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Conduct opt-in trial, distribute resources, and refine with counselor feedback. Frame pilots with "What support should be ready if the sculpture signals a tough day?" Teachers invite counselors to co-observe trial and monitor wellbeing. Students run trial sessions guiding opt-in users through experience.',
      teacher: [
        'Invite counselors to co-observe trial and monitor wellbeing',
        'Monitor trial interactions and uphold privacy agreements',
        'Collect feedback surveys and document improvement requests'
      ],
      students: [
        'Run trial sessions guiding opt-in users through experience',
        'Hand out wellbeing resources and explain support options',
        'Log feedback, opt-outs, and issues for iteration'
      ],
      deliverables: ['Trial log', 'Feedback notes'],
      checkpoint: ['Counselor sign-off for public display']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Extension',
      focus: 'Refine privacy safeguards, publish wellbeing guide, and document transparent methods. Use prompts such as "When the founding team graduates, how will the next crew honor our privacy promises?" Teachers review de-identification pipeline for new safeguards. Students refine pipeline thresholds and logging from trial findings.',
      teacher: [
        'Review de-identification pipeline for new safeguards',
        'Coach guide layout focusing on clarity and accessibility',
        'Debrief ethics outcomes and next steps with partners'
      ],
      students: [
        'Refine pipeline thresholds and logging from trial findings',
        'Publish wellbeing guide linking supports and opt-out process',
        'Share methods documentation including limitations and improvements'
      ],
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'Consent + Check‑In UI',
      summary: 'Co-design opt-in language so consent feels human, not legalese. Students write plain-language scripts, prototype respectful check-in interfaces, and document opt-out pathways with counselor partners. Teachers surface policy exemplars and secure admin feedback so drafts clear review before launch.',
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
      summary: 'Select a classifier and mapping logic that balances technical possibility with care. Students evaluate options against feasibility, bias risks, and wellness supports while building a transparent risk register. Teachers supply annotated tool choices and guide ethics checkpoints so every decision has a mitigation plan.',
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
      summary: 'Build the first integrated demo to prove data can move hardware without harming privacy. Students run de-identified datasets, tune thresholds with counselor insight, and log every adjustment in their sprint records. Teachers create safe testing conditions and coach troubleshooting so the system stays trustworthy under stress.',
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
      summary: 'Finalize the public-facing installation so it invites curiosity and trust. Students anchor the enclosure, route cables cleanly, and pair the sculpture with signage that explains consent, opt-outs, and nightly care. Teachers coordinate facilities walkthroughs and approvals so the launch meets safety and communication standards.',
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
};
