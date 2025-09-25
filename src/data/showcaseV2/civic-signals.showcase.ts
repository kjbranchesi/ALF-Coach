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
      focus: 'Explore civic tech ethics and define focus questions.',
      teacher: [
        'Facilitate civic tech case studies',
        'Introduce AI ethics frameworks',
        'Host listening session with community partners'
      ],
      students: [
        'Audit personal assumptions about AI',
        'Document partner priorities and needs',
        'Draft problem statements collaboratively'
      ],
      deliverables: ['Ethics reflection', 'Partner priority map', 'Problem statement'],
      checkpoint: ['Teacher approves problem statement'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design data pipeline and governance plan.',
      teacher: [
        'Model data governance checklist',
        'Introduce NLP toolkits',
        'Support multilingual data strategies'
      ],
      students: [
        'Inventory data sources and permissions',
        'Plan preprocessing workflow',
        'Draft bias monitoring criteria'
      ],
      deliverables: ['Pipeline architecture diagram', 'Data inventory log', 'Bias monitoring plan'],
      checkpoint: ['Teacher signs governance plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect and preprocess civic feedback data.',
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
      focus: 'Train and evaluate models with human oversight.',
      teacher: [
        'Model validation metrics interpretation',
        'Provide ML debugging support',
        'Facilitate bias stress testing'
      ],
      students: [
        'Train classification or clustering models',
        'Evaluate performance and fairness',
        'Document human review checkpoints'
      ],
      deliverables: ['Model training notebook', 'Evaluation report', 'Human-in-loop protocol'],
      checkpoint: ['Teacher signs off on bias mitigation'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Design dashboards and narrative outputs for civic partners.',
      teacher: [
        'Coach data storytelling techniques',
        'Connect teams with agency analysts',
        'Review accessibility and language standards'
      ],
      students: [
        'Prototype dashboards with clear filters',
        'Draft narrative policy summaries',
        'Prepare briefing materials for stakeholders'
      ],
      deliverables: ['Dashboard v1', 'Policy summary draft', 'Briefing kit outline'],
      checkpoint: ['Teacher ensures clarity of visuals'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Present Civic Signals findings and gather feedback.',
      teacher: [
        'Organize Civic Signals roundtable',
        'Facilitate translation services',
        'Document commitments from agencies'
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
      focus: 'Deploy toolkits and formalize civic tech partnerships.',
      teacher: [
        'Review implementation documentation',
        'Support training for agency staff',
        'Plan ongoing data refresh cadence'
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
    core: ['Deliver an ethical AI dashboard that surfaces community needs for action'],
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
    safetyEthics: ['Comply with privacy regulations', 'Document consent for data use', 'Run bias audits regularly']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Civic Signals Ethics Primer',
      summary: 'Students interrogate AI use in civic contexts and articulate guardrails.',
      studentDirections: [
        'Analyze civic tech case study',
        'Discuss benefits and harms',
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
      successCriteria: ['Stance references evidence', 'Guardrails are actionable', 'Partners endorse guardrails'],
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
      summary: 'Teams document data sources, permissions, and preprocessing steps.',
      studentDirections: [
        'Inventory all approved data sources',
        'Draw pipeline architecture diagram',
        'Define preprocessing methods',
        'Document access permissions',
        'Submit plan for approval'
      ],
      teacherSetup: [
        'Share sample architecture diagrams',
        'Review data governance policy',
        'Provide permission checklist',
        'Host architecture critique session'
      ],
      evidence: ['Architecture plan', 'Permission log'],
      successCriteria: ['Plan protects privacy', 'Diagram is readable', 'Permissions are documented'],
      checkpoint: 'Teacher approves plan before coding',
      aiOptional: {
        toolUse: 'Generate diagram layout',
        critique: 'Check diagram for accuracy',
        noAIAlt: 'Use sticky-note storyboard'
      },
      safety: ['Remove personal identifiers immediately']
    },
    {
      id: 'A3',
      title: 'Model + Bias Audit Lab',
      summary: 'Students train models and document fairness interventions.',
      studentDirections: [
        'Train baseline model',
        'Evaluate accuracy and fairness',
        'Test bias mitigation techniques',
        'Document human oversight checkpoints',
        'Prepare evaluation brief'
      ],
      teacherSetup: [
        'Provide evaluation rubrics',
        'Facilitate fairness workshop',
        'Offer model troubleshooting time',
        'Review oversight documentation'
      ],
      evidence: ['Model notebook', 'Evaluation brief'],
      successCriteria: ['Metrics include fairness', 'Mitigations are justified', 'Oversight plan is clear'],
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
      summary: 'Teams present dashboards, protocols, and policy recommendations.',
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
      successCriteria: ['Dashboard is clear', 'Policy asks are actionable', 'Ethics addressed confidently'],
      checkpoint: 'Teacher ensures roadmap shared',
      aiOptional: {
        toolUse: 'Draft executive summary',
        critique: 'Check summary for bias',
        noAIAlt: 'Use writing workshop feedback'
      }
    }
  ],
  polish: {
    microRubric: [
      'Pipeline protects privacy and transparency',
      'Models meet fairness and accuracy thresholds',
      'Insights connect to policy levers',
      'Partners trust ongoing stewardship'
    ],
    checkpoints: [
      'Governance plan approved before coding',
      'Bias audit completed before briefing',
      'Roadmap delivered within one week'
    ],
    tags: ['CIVIC', 'AI', 'ETH']
  },
  planningNotes: 'Secure data-sharing agreements and translation partners before Week 2 to avoid pipeline delays.'
};
