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
      focus: 'Understand harbor ecology, threats, and community priorities to align the mission with lived realities. Ask, "Who depends on this harbor tomorrow morning, and what do they need us to protect?" Teachers invite marine scientists for kickoff. Students map harbor stakeholders and concerns.',
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
      focus: 'Design sampling plans and station prototypes so monitoring stays rigorous and feasible. Prompt teams with "What data will earn trust from both fishermen and regulators?" Teachers demonstrate sampling protocols. Students select monitoring locations strategically.',
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
      focus: 'Collect water and biodiversity data while iterating stations to keep evidence trustworthy. Keep asking, "Would I stand behind these numbers if an environmental lawyer challenged them?" Teachers supervise field excursions. Students gather water samples and metadata.',
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
      focus: 'Analyze findings and engineer communication tools that make trends legible to neighbors. Use prompts like "What should a fourth-grader learn from this dashboard in 30 seconds?" Teachers model data dashboard construction. Students visualize trends in dashboards.',
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
      focus: 'Co-create policy recommendations and stewardship activities to turn data into local action. Ask, "Who must sign off before this policy becomes real?" to guide outreach. Teachers facilitate policy scenario workshops. Students draft policy briefs with evidence.',
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
      focus: 'Host Harbor Health summit and publish data so partners can act on shared insights. Challenge teams with "What commitment do we need each guest to leave with?" Teachers coordinate venue logistics. Students present dashboards and stories.',
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
      focus: 'Deploy stations long-term and formalize partnerships to sustain stewardship beyond class. Center planning on "Who maintains the sensors when the tide changes and class is over?" Teachers facilitate maintenance training sessions. Students install stations at final sites.',
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'Stewardship Storyboard',
      summary: 'Ground the mission in lived experience before collecting a single data point. Students interview stakeholders, document ecological history, and build storyboards that keep community priorities front and center. Teachers recruit panelists, model respectful listening, and guide feedback so the storyboard steering the project feels accountable.',
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
      summary: 'Blueprint week transforms empathy into engineering. Students choose monitoring sites, define indicators, and design stations alongside safety and maintenance plans that partners can actually run. Teachers provide rubrics, safety briefings, and permitting support so the blueprint is both ambitious and feasible.',
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
    },
    {
      id: 'A3',
      title: 'Data + Engineering Lab',
      summary: 'Data and engineering lab sessions prove that stewardship is disciplined work. Students follow protocols, calibrate sensors, iterate stations, and log every decision in their engineering journals. Teachers supervise excursions, provide lab analysis windows, and coach troubleshooting to keep datasets trustworthy.',
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
      summary: 'The Harbor Health summit turns evidence into commitments. Students finalize dashboards, rehearse pitches, facilitate stewardship demos, and capture partner promises plus follow-up plans. Teachers orchestrate logistics, invite decision makers, and ensure the portal and handoff assets are live before the crowd leaves.',
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
};
