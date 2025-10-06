import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import sensing_selfImage from '../../utils/hero/images/SensingSelf.jpeg';
export const sensing_selfV2: ProjectShowcaseV2 = {
  id: 'sensing-self',
  version: '2.0.0',
  hero: {
    title: 'Sensing Self: Wearables for Well-Being',
    tagline: 'Students design biofeedback wearables that support wellness choices for real users.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['STEM', 'Health Sciences', 'Computer Science', 'Psychology', 'Data Science', 'Engineering'],
    image: sensing_selfImage
  },
  microOverview: [
    'Students investigate how wearables track movement, stress, and sleep in everyday life.',
    'They prototype biofeedback devices that translate signals into meaningful wellness nudges.',
    'Teams deliver working wearables plus behavior plans co-written with their test users.'
  ],
  fullOverview:
    'Learners blend engineering, data science, and psychology to tackle a wellness challenge defined by peers. They analyze existing wearable ecosystems, explore ethical data handling, and prototype microcontroller-based devices that visualize personal metrics. Iterative testing ensures each wearable offers actionable insights rather than noise, culminating in personalized wellness plans backed by evidence.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore bio-sensing fundamentals and define wellness questions to anchor the project.',
      teacher: [
        'Demonstrate commercial wearable dashboards',
        'Guide consent and data ethics discussion',
        'Model SMART wellness goal framing'
      ],
      students: [
        'Audit personal wellness data habits',
        'Interview peers about support needs',
        'Draft challenge statements collaboratively'
      ],
      deliverables: ['Wellness challenge statement', 'Data ethics agreement', 'User persona sketch'],
      checkpoint: ['Teacher approves challenge scope'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan sensing approach and data architecture so prototypes respect privacy.',
      teacher: [
        'Introduce sensor options and libraries',
        'Model low-voltage circuit planning',
        'Coach data handling workflow planning'
      ],
      students: [
        'Select sensors matched to goals',
        'Design data flow diagrams',
        'Build testing safety checklist'
      ],
      deliverables: ['Sensor selection matrix', 'Prototype plan', 'Safety checklist'],
      checkpoint: ['Teacher signs sensor choice plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Prototype wearable hardware and collect pilot data to translate insights into form.',
      teacher: [
        'Facilitate soldering and fabrication labs',
        'Run code review office hours',
        'Monitor data privacy compliance'
      ],
      students: [
        'Assemble wearable prototypes carefully',
        'Deploy pilots with consented users',
        'Log anomalies and user reflections'
      ],
      deliverables: ['Prototype firmware repo', 'Pilot data logs', 'User reflection transcripts'],
      checkpoint: ['Teacher verifies safe device operation'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Visualize data and design behavior nudges that motivate meaningful wellness choices.',
      teacher: [
        'Model dashboard prototyping in notebooks',
        'Facilitate behavior science mini-lessons',
        'Coach accessibility for visualizations'
      ],
      students: [
        'Clean datasets for clarity',
        'Match insights to wellness nudges',
        'Prototype notification logic'
      ],
      deliverables: ['Insight dashboard', 'Nudge logic storyboard', 'User testing plan'],
      checkpoint: ['Teacher approves messaging tone'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Showcase wearables and co-present wellness plans with the users who inspired them.',
      teacher: [
        'Set up hands-on demo stations',
        'Invite health professionals for feedback',
        'Coach user-led storytelling scripts'
      ],
      students: [
        'Demo wearables alongside users',
        'Present evidence-based wellness plans',
        'Collect critiques for refinement'
      ],
      deliverables: ['Showcase pitch deck', 'Wellness plan handout', 'Feedback capture sheet'],
      checkpoint: ['Users endorse recommendations'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Publish documentation and handoff support routines so support continues beyond class.',
      teacher: [
        'Review maintenance documentation expectations',
        'Connect teams with school wellness staff',
        'Advise on data retention policies'
      ],
      students: [
        'Publish build guides with code snippets',
        'Schedule ongoing data check-ins with users',
        'Draft recommendations for scaling program'
      ],
      deliverables: ['Open documentation site', 'Maintenance calendar', 'Scaling recommendation memo'],
      checkpoint: ['Teacher approves data retention plan'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Design biofeedback wearables that support personalized wellness plans'],
    extras: [
      'Design mindfulness notification scripts',
      'Build parent-friendly wellness dashboards',
      'Prototype haptic feedback modules',
      'Launch peer coaching workshop series'
    ],
    audiences: ['Student wellness teams', 'School nurses', 'Families', 'Local health partners']
  },
  materialsPrep: {
    coreKit: [
      'Microcontrollers and sensor packs',
      'Conductive thread and wearables textiles',
      'Machine sewing stations',
      'Data visualization software',
      'Rechargeable battery packs',
      'Consent and wellness forms'
    ],
    noTechFallback: ['Paper-based habit trackers', 'Analog pulse monitors', 'Poster templates for data walls'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Wellness Insight Map',
      summary: 'Students define user needs and articulate ethical data boundaries to guide every design choice.',
      studentDirections: [
        'Interview user about wellness goals',
        'Map current habits and supports',
        'Identify one priority metric',
        'Draft consent and boundaries summary',
        'Share insights in studio critique'
      ],
      teacherSetup: [
        'Provide interview scaffolds',
        'Model boundary-setting language',
        'Facilitate critique protocol',
        'Review consent templates'
      ],
      evidence: ['Insight map', 'Consent summary sheet'],
      successCriteria: ['I craft insights that honor each user’s voice', 'I choose metrics that feel actionable for wellbeing', 'I make consent terms clear and easy to understand'],
      checkpoint: 'Teacher initial approval before sensing',
      aiOptional: {
        toolUse: 'Draft insight summary paragraphs',
        critique: 'Check AI tone for empathy',
        noAIAlt: 'Use peer paraphrase workshop'
      }
    },
    {
      id: 'A2',
      title: 'Sensing Blueprint',
      summary: 'Teams outline sensing strategy, data flow, and safety plans to safeguard users and data.',
      studentDirections: [
        'Select primary sensors and libraries',
        'Design circuit and enclosure sketch',
        'Design data storage workflow and privacy safeguards',
        'List safety checks before deployment',
        'Review blueprint with teacher'
      ],
      teacherSetup: [
        'Provide blueprint template',
        'Host hardware options gallery',
        'Model data flow diagramming',
        'Share safety checklist expectations'
      ],
      evidence: ['Sensing blueprint', 'Safety checklist'],
      successCriteria: ['I select sensors that match our wellbeing goals', 'I draw circuit sketches that teammates can read', 'I document a safety plan that protects users and data'],
      checkpoint: 'Teacher signs blueprint pre-build',
      aiOptional: {
        toolUse: 'Generate diagram labels automatically',
        critique: 'Verify labels match hardware',
        noAIAlt: 'Use color-coded annotation legend'
      },
    },
    {
      id: 'A3',
      title: 'Data Story Sprint',
      summary: 'Students clean pilot data and craft actionable insights that inform wellness nudges.',
      studentDirections: [
        'Import data into notebook',
        'Remove anomalies responsibly',
        'Visualize trends with two charts',
        'Write insight and proposed nudge',
        'Get user feedback on prototype'
      ],
      teacherSetup: [
        'Share starter notebooks',
        'Coach ethical data cleaning',
        'Provide visualization exemplars',
        'Facilitate sprint feedback loop'
      ],
      evidence: ['Notebook file', 'Insight statement', 'User feedback record'],
      successCriteria: ['I design charts that are legible on small screens', 'I deliver insights that stay evidence-based and accurate', 'I recommend nudges that respect user agency and choice'],
      checkpoint: 'Teacher reviews notebook outputs',
      aiOptional: {
        toolUse: 'Suggest chart styles from dataset',
        critique: 'Check AI choice for clarity',
        noAIAlt: 'Use visualization decision tree'
      }
    },
    {
      id: 'A4',
      title: 'Wearable Launch Studio',
      summary: 'Teams co-present wearables and transfer ownership to users.',
      studentDirections: [
        'Rehearse demo with user partner',
        'Compile setup steps in a quick-start guide',
        'Deliver wellness plan conversation',
        'Gather commitments for ongoing check-ins',
        'Publish open documentation package'
      ],
      teacherSetup: [
        'Schedule showcase slots',
        'Provide documentation framework',
        'Invite wellness staff reviewers',
        'Ensure accessibility accommodations'
      ],
      evidence: ['Showcase recording', 'Quick-start guide', 'Follow-up plan'],
      successCriteria: ['I run demos smoothly without exposing personal data', 'I write guides using plain, accessible language', 'I create ongoing support plans that honor user choice'],
      checkpoint: 'Teacher verifies follow-up schedule',
      aiOptional: {
        toolUse: 'Draft quick-start layout',
        critique: 'Ensure instructions stay concise',
        noAIAlt: 'Use provided layout template'
      }
    }
  ],
};
