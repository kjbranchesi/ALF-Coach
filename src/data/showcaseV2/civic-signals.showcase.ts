import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import civic_signalsImage from '../../utils/hero/images/CivicSignals.jpeg';
export const civic_signalsV2: ProjectShowcaseV2 = {
  id: 'civic-signals',
  version: '2.0.0',
  hero: {
    title: 'Civic Signals: AI Listening for Community Needs',
    tagline: 'Students train ethical AI pipelines to elevate community concerns for local leaders.',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ['Computer Science', 'Data Science', 'Civics', 'Statistics', 'Social Studies', 'Ethics'],
    image: civic_signalsImage
  },
  microOverview: [
    'Students gather public feedback from forums, hotlines, and listening sessions around city services.',
    'They build responsible AI workflows that classify needs, detect sentiment, and flag equity gaps.',
    'Teams deliver dashboards, policy briefs, and human-in-the-loop protocols adopted by civic partners.'
  ],
  fullOverview:
    'Learners work as civic technologists charged with making sense of community input. They ingest multilingual feedback, design bias audits, and keep humans in the loop while training models. Final deliverables give agencies actionable insights while preserving transparency, privacy, and accountability.',
  schedule: { totalWeeks: 9, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore civic tech ethics and define focus questions so community priorities lead the build. Invite prompts like "Whose voices will benefit if this system succeeds—and who could be silenced if we fail?" Teachers facilitate civic tech case studies. Students audit personal assumptions about AI.',
      teacher: [
        'Facilitate civic tech case studies',
        'Introduce AI ethics frameworks',
        'Host listening session with community partners'
      ],
      students: [
        'Audit personal assumptions about AI',
        'Record partner priorities and needs',
        'Draft problem statements collaboratively'
      ],
      deliverables: ['Ethics reflection', 'Partner priority map', 'Problem statement'],
      checkpoint: ['Teacher approves problem statement'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design data pipeline and governance plan to guarantee privacy and accountability from the start. Ask, "What consent proof do we need before any row of data enters our system?" Teachers model data governance checklist. Students inventory data sources and permissions.',
      teacher: [
        'Model data governance checklist',
        'Introduce NLP toolkits',
        'Coach multilingual data strategies'
      ],
      students: [
        'Inventory data sources and permissions',
        'Design preprocessing workflow',
        'Draft bias monitoring criteria'
      ],
      deliverables: ['Pipeline architecture diagram', 'Data inventory log', 'Bias monitoring plan'],
      checkpoint: ['Teacher signs governance plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect and preprocess civic feedback data so training sets reflect real voices responsibly. Keep asking, "If this were my neighborhood story, would I feel honored by the way it is handled?" Teachers facilitate data cleaning studios. Students scrape or ingest approved data.',
      teacher: [
        'Facilitate data cleaning studios',
        'Monitor compliance with privacy rules',
        'Guide multilingual transcription efforts'
      ],
      students: [
        'Scrape or ingest approved data',
        'Anonymize sensitive identifiers',
        'Label training sets with human reviewers'
      ],
      deliverables: ['Clean dataset', 'Labeling rubric', 'Inter-rater reliability report'],
      checkpoint: ['Teacher verifies anonymization'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Train and evaluate models with human oversight to keep fairness and accuracy in balance. Pose the question, "What harm happens if the model misclassifies voices from the margins?" Teachers model validation metrics interpretation. Students train classification or clustering models.',
      teacher: [
        'Model validation metrics interpretation',
        'Provide ML debugging support',
        'Facilitate bias stress testing'
      ],
      students: [
        'Train classification or clustering models',
        'Evaluate performance and fairness',
        'Log human review checkpoints'
      ],
      deliverables: ['Model training notebook', 'Evaluation report', 'Human-in-loop protocol'],
      checkpoint: ['Teacher signs off on bias mitigation'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Design dashboards and narrative outputs for civic partners to activate evidence-driven decisions. Prompt teams with "How will a busy agency leader act within 60 seconds of seeing this view?" Teachers coach data storytelling techniques. Students prototype dashboards with clear filters.',
      teacher: [
        'Coach data storytelling techniques',
        'Connect teams with agency analysts',
        'Review accessibility and language standards'
      ],
      students: [
        'Prototype dashboards with clear filters',
        'Draft narrative policy summaries',
        'Develop briefing materials for stakeholders'
      ],
      deliverables: ['Dashboard v1', 'Policy summary draft', 'Briefing kit outline'],
      checkpoint: ['Teacher ensures clarity of visuals'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Present Civic Signals findings and gather feedback so partners shape the iteration roadmap. Center discussion on "What commitment do we need from each partner before we close the room?" Teachers organize Civic Signals roundtable. Students demo dashboards live.',
      teacher: [
        'Organize Civic Signals roundtable',
        'Facilitate translation services',
        'Record commitments from agencies'
      ],
      students: [
        'Demo dashboards live',
        'Explain human oversight protocols',
        'Collect feedback for refinement'
      ],
      deliverables: ['Roundtable presentation', 'Feedback log', 'Commitment tracker'],
      checkpoint: ['Partners endorse recommendations'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Weeks 8–9',
      kind: 'Extension',
      focus: 'Deploy toolkits and formalize civic tech partnerships to sustain the listening practice over time. Ask, "Who owns maintenance and audit duties when the next dataset arrives?" Teachers review implementation documentation. Students publish open governance playbook.',
      teacher: [
        'Review implementation documentation',
        'Facilitate training for agency staff',
        'Schedule ongoing data refresh cadence'
      ],
      students: [
        'Publish open governance playbook',
        'Train agency staff on workflows',
        'Schedule quarterly check-ins'
      ],
      deliverables: ['Governance playbook', 'Training deck', 'Implementation roadmap'],
      checkpoint: ['Teacher confirms adoption agreements'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Design an ethical AI dashboard that surfaces community needs for action'],
    extras: [
      'Launch plain-language explainer campaign',
      'Prototype SMS feedback bot',
      'Develop bias audit toolkit for agencies',
      'Host youth-led civic listening workshop'
    ],
    audiences: ['City service departments', 'Community advocates', 'Local media', 'Civic data teams']
  },
  materialsPrep: {
    coreKit: [
      'Secure cloud workspace',
      'Version control repository',
      'Translation and transcription tools',
      'Data visualization software',
      'Model monitoring dashboard',
      'Accessible briefing templates'
    ],
    noTechFallback: ['Paper coding sheets', 'Manual affinity mapping boards', 'Printed briefing packets'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Civic Signals Ethics Primer',
      summary: 'Launch the Civic Signals studio by interrogating what ethical AI looks like in public service. Students analyze partner case studies, debate risks, and co-author guardrails that they publish for community review. Teachers provide exemplars, moderate tough conversations, and secure partner endorsement before any data work begins.',
      studentDirections: [
        'Analyze civic tech case study',
        'Debate benefits and harms',
        'Write personal AI ethics stance',
        'Co-create team guardrail list',
        'Share guardrails with partners'
      ],
      teacherSetup: [
        'Provide case study materials',
        'Facilitate structured debate',
        'Model guardrail drafting',
        'Invite partner feedback'
      ],
      evidence: ['Ethics stance memo', 'Team guardrail document'],
      successCriteria: ['I state our stance with evidence partners can verify', 'I define guardrails that are actionable for teams', 'I secure partner endorsement for the guardrails we set'],
      checkpoint: 'Teacher validates guardrails before data ingestion',
      aiOptional: {
        toolUse: 'Summarize debate transcripts',
        critique: 'Ensure AI summary captures nuance',
        noAIAlt: 'Use collaborative note-taking'
      }
    },
    {
      id: 'A2',
      title: 'Pipeline Architecture Plan',
      summary: 'Pipeline planning turns ethics into technical decisions everyone can follow. Students document datasets, draw architecture diagrams, and assign permissions so privacy and accountability stay visible. Teachers share governance checklists, critique diagrams, and ensure approvals are locked before scripts run.',
      studentDirections: [
        'Inventory all approved data sources',
        'Draw pipeline architecture diagram',
        'Define preprocessing methods',
        'Record access permissions and security roles',
        'Submit plan for approval'
      ],
      teacherSetup: [
        'Share sample architecture diagrams',
        'Review data governance policy',
        'Provide permission checklist',
        'Host architecture critique session'
      ],
      evidence: ['Architecture plan', 'Permission log'],
      successCriteria: ['I design implementation plans that protect privacy and data rights', 'I draw diagrams that teammates can read quickly', 'I document permissions and consents thoroughly'],
      checkpoint: 'Teacher approves plan before coding',
      aiOptional: {
        toolUse: 'Generate diagram layout',
        critique: 'Check diagram for accuracy',
        noAIAlt: 'Use sticky-note storyboard'
      },
    },
    {
      id: 'A3',
      title: 'Model + Bias Audit Lab',
      summary: 'Model lab week is where evidence meets accountability. Students train baseline models, measure accuracy alongside fairness metrics, and document bias mitigations with human oversight checkpoints. Teachers facilitate evaluation rubrics, stress-test decisions, and confirm no model advances without a defensible audit trail.',
      studentDirections: [
        'Train baseline model',
        'Evaluate accuracy and fairness',
        'Test bias mitigation techniques',
        'Log human oversight checkpoints',
        'Draft evaluation brief'
      ],
      teacherSetup: [
        'Provide evaluation rubrics',
        'Facilitate fairness workshop',
        'Offer model troubleshooting time',
        'Review oversight documentation'
      ],
      evidence: ['Model notebook', 'Evaluation brief'],
      successCriteria: ['I choose metrics that include fairness and bias checks', 'I justify mitigations with evidence and policies', 'I outline an oversight plan that is clear and enforceable'],
      checkpoint: 'Teacher approves model before deployment',
      aiOptional: {
        toolUse: 'Suggest hyperparameters quickly',
        critique: 'Validate suggestions with experimentation',
        noAIAlt: 'Use grid search template'
      }
    },
    {
      id: 'A4',
      title: 'Civic Signals Briefing',
      summary: 'The Civic Signals briefing hands agency partners a roadmap they can act on tomorrow. Students finalize accessible dashboards, craft policy summaries, and rehearse how to answer ethics questions with confidence. Teachers coordinate stakeholders, translation, and agendas so commitments and next steps are captured on record.',
      studentDirections: [
        'Finalize accessible dashboard',
        'Write policy summary with evidence',
        'Rehearse briefing with partners',
        'Facilitate Q&A around ethics',
        'Deliver implementation roadmap'
      ],
      teacherSetup: [
        'Invite agency stakeholders',
        'Provide briefing agenda template',
        'Coach presentation delivery',
        'Coordinate translation support'
      ],
      evidence: ['Briefing deck', 'Policy summary', 'Roadmap document'],
      successCriteria: ['I design a dashboard that is clear for community partners', 'I make policy asks that are actionable and concrete', 'I address ethical considerations confidently with supporting evidence'],
      checkpoint: 'Teacher ensures roadmap shared',
      aiOptional: {
        toolUse: 'Draft executive summary',
        critique: 'Check summary for bias',
        noAIAlt: 'Use writing workshop feedback'
      }
    }
  ],
};
