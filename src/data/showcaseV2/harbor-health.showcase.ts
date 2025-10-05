import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import harbor_healthImage from '../../utils/hero/images/HarborHealthGuardians.jpg';
export const harbor_healthV2: ProjectShowcaseV2 = {
  id: 'harbor-health',
  version: '2.0.0',
  hero: {
    title: 'Harbor Health: Monitoring Our Waterfront',
    tagline: 'Students become citizen scientists safeguarding local waterways through real data and design.',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ['Marine Biology', 'Environmental Science', 'Chemistry', 'Data Science', 'Engineering', 'Public Policy'],
    image: harbor_healthImage
  },
  microOverview: [
    'Students investigate harbor water quality, biodiversity, and pollution sources alongside community partners.',
    'They engineer low-cost monitoring stations and data dashboards to share findings openly.',
    'Teams deliver policy briefs and stewardship plans that activate neighbors and decision makers.'
  ],
  fullOverview:
    'Learners operate as harbor health stewards who blend field science, engineering design, and civic action. They capture longitudinal data, cross-check it with regulatory thresholds, and humanize the numbers with stakeholder stories. Final deliverables equip the community with actionable insights and infrastructure for continued monitoring.',
  schedule: { totalWeeks: 9, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Understand harbor ecology, threats, and community priorities.',
      teacher: [
        'Invite marine scientists for kickoff',
        'Model watershed systems thinking',
        'Facilitate stakeholder story circle'
      ],
      students: [
        'Map harbor stakeholders and concerns',
        'Review historical water data sets',
        'Draft personal stewardship commitments'
      ],
      deliverables: ['Stakeholder map', 'Historic data analysis', 'Stewardship pledge'],
      checkpoint: ['Students identify focus indicators'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design sampling plan and station prototypes.',
      teacher: [
        'Demonstrate sampling protocols',
        'Coach teams on sensor selection',
        'Coordinate permits for shoreline access'
      ],
      students: [
        'Select monitoring locations strategically',
        'Create sampling schedules and teams',
        'Prototype station designs on paper'
      ],
      deliverables: ['Sampling plan', 'Station prototype sketches', 'Safety and logistics checklist'],
      checkpoint: ['Teacher approves sampling plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect water and biodiversity data, iterate stations.',
      teacher: [
        'Supervise field excursions',
        'Ensure chain-of-custody compliance',
        'Host daily data validation sessions'
      ],
      students: [
        'Gather water samples and metadata',
        'Deploy and adjust monitoring stations',
        'Catalog indicator species sightings'
      ],
      deliverables: ['Field logs', 'Lab analysis sheets', 'Station iteration notes'],
      checkpoint: ['Teacher confirms data integrity'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Analyze findings and engineer communication tools.',
      teacher: [
        'Model data dashboard construction',
        'Guide comparative analysis with standards',
        'Coach fabrication of sensor housings'
      ],
      students: [
        'Visualize trends in dashboards',
        'Build protective station enclosures',
        'Draft key findings narrative'
      ],
      deliverables: ['Dashboard v1', 'Station enclosure prototype', 'Findings brief'],
      checkpoint: ['Teacher signs off on narrative clarity'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Co-create policy recommendations and stewardship activities.',
      teacher: [
        'Facilitate policy scenario workshops',
        'Invite local officials for consultation',
        'Coach persuasive writing techniques'
      ],
      students: [
        'Draft policy briefs with evidence',
        'Design stewardship event concepts',
        'Coordinate outreach for community partners'
      ],
      deliverables: ['Policy brief draft', 'Stewardship event plan', 'Outreach contact list'],
      checkpoint: ['Teacher reviews feasibility of proposals'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Host Harbor Health summit and publish data.',
      teacher: [
        'Coordinate venue logistics',
        'Coordinate digital publication setup',
        'Manage media and press outreach'
      ],
      students: [
        'Present dashboards and stories',
        'Facilitate stewardship activity demos',
        'Collect feedback from attendees'
      ],
      deliverables: ['Summit presentation deck', 'Feedback forms', 'Published data portal'],
      checkpoint: ['Stakeholders validate findings'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Weeks 8–9',
      kind: 'Extension',
      focus: 'Deploy stations long-term and formalize partnerships.',
      teacher: [
        'Facilitate maintenance training sessions',
        'Draft MOUs with partner groups',
        'Schedule ongoing data check-ins'
      ],
      students: [
        'Install stations at final sites',
        'Train partner stewards on upkeep',
        'Publish quarterly monitoring calendar'
      ],
      deliverables: ['Installation log', 'Training materials', 'Monitoring calendar'],
      checkpoint: ['Teacher verifies partnership agreements'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Design a harbor health data portal with action-ready policy briefs'],
    extras: [
      'Launch citizen science steward program',
      'Design educational signage for shoreline',
      'Produce bilingual harbor health zine',
      'Secure funding commitments for monitoring'
    ],
    audiences: ['Harbor commission', 'Local fishermen and boaters', 'Environmental nonprofits', 'School community']
  },
  materialsPrep: {
    coreKit: [
      'Water quality testing kits',
      'DIY sensor components',
      'Field notebooks and waterproof pens',
      'Chest waders and safety gear',
      'Tablets for data entry',
      'Portable shelters for shoreline work'
    ],
    noTechFallback: ['Manual titration supplies', 'Paper data logs', 'Printed ID guides for species'],
    safetyEthics: ['Follow water safety protocols', 'Respect wildlife handling guidelines', 'Obtain permission for site access']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Stewardship Storyboard',
      summary: 'Students ground the project in stakeholder stories and ecological history.',
      studentDirections: [
        'Interview two harbor stakeholders',
        'Identify key ecological concerns',
        'Map historical harbor milestones',
        'Synthesize story into storyboard',
        'Share storyboard with feedback panel'
      ],
      teacherSetup: [
        'Invite stakeholder panel',
        'Provide storyboard template',
        'Model respectful interviewing',
        'Facilitate feedback discussions'
      ],
      evidence: ['Storyboard', 'Interview transcript notes'],
      successCriteria: ['I capture stakeholder voices authentically in our materials', 'I tie reported concerns to supporting data', 'I build a storyboard that guides project focus'],
      checkpoint: 'Teacher approves storyboard direction',
      aiOptional: {
        toolUse: 'Summarize interviews for storyboard captions',
        critique: 'Ensure quotes remain accurate',
        noAIAlt: 'Use peer summarizing protocol'
      }
    },
    {
      id: 'A2',
      title: 'Monitoring Blueprint',
      summary: 'Teams plan sampling logistics and station engineering.',
      studentDirections: [
        'Select priority monitoring sites',
        'Define indicators and frequency',
        'Design sensor station concept',
        'Outline safety and maintenance plan',
        'Submit blueprint for approval'
      ],
      teacherSetup: [
        'Provide blueprint rubric',
        'Host safety briefing',
        'Offer sensor selection guidance',
        'Coordinate permit liaison'
      ],
      evidence: ['Monitoring blueprint', 'Safety plan'],
      successCriteria: ['I choose indicators that align with our health goals', 'I design interventions that are feasible for partners', 'I document a safety plan that is thorough and approved'],
      checkpoint: 'Teacher signs blueprint before fieldwork',
      aiOptional: {
        toolUse: 'Draft CAD sketch of station',
        critique: 'Verify dimensions fit site',
        noAIAlt: 'Use paper scale drawing'
      },
      safety: ['Wear life vests near water']
    },
    {
      id: 'A3',
      title: 'Data + Engineering Lab',
      summary: 'Students collect data and refine monitoring stations.',
      studentDirections: [
        'Conduct sampling using protocols',
        'Calibrate sensors before deployment',
        'Record field and lab results',
        'Iterate station design from findings',
        'Log adjustments in the engineering journal'
      ],
      teacherSetup: [
        'Supervise sampling trips',
        'Provide lab analysis time',
        'Review engineering logs',
        'Support troubleshooting workshops'
      ],
      evidence: ['Data log', 'Engineering iteration record'],
      successCriteria: ['I ensure collected data is accurate and validated', 'I improve stations using evidence from testing', 'I keep logs that show clear reasoning and decisions'],
      checkpoint: 'Teacher validates data before analysis',
      aiOptional: {
        toolUse: 'Flag data anomalies quickly',
        critique: 'Confirm anomalies are real',
        noAIAlt: 'Use team verification protocol'
      }
    },
    {
      id: 'A4',
      title: 'Harbor Health Summit',
      summary: 'Teams publish findings, pitch policy, and transition stewardship.',
      studentDirections: [
        'Finalize dashboard and brief',
        'Rehearse policy pitch with partners',
        'Host summit booths with demos',
        'Collect commitments for stewardship',
        'Publish data portal and follow-up plan'
      ],
      teacherSetup: [
        'Organize summit logistics',
        'Invite policymakers and media',
        'Provide pitch coaching',
        'Set up data portal infrastructure'
      ],
      evidence: ['Summit recording', 'Policy brief', 'Commitment MOU copies'],
      successCriteria: ['I reference evidence throughout the pitch', 'I secure commitments and record next steps', 'I launch the portal and confirm partners can use it'],
      checkpoint: 'Teacher ensures deliverables shared widely',
      aiOptional: {
        toolUse: 'Draft policy brief summary',
        critique: 'Check for scientific accuracy',
        noAIAlt: 'Use policy writing checklist'
      }
    }
  ],
  polish: {
    microRubric: [
      'Data meets scientific quality standards',
      'Stations are durable and maintainable',
      'Policy recommendations feel actionable',
      'Community partners feel ownership'
    ],
    checkpoints: [
      'Blueprint approved before sampling',
      'Data validated before publication',
      'Partnership agreements finalized post-summit'
    ],
    tags: ['STEM', 'CIVIC', 'ENV']
  },
  planningNotes: 'Confirm tide schedules, transportation, and weather contingencies well before field days to maximize safe sampling windows.'
};
