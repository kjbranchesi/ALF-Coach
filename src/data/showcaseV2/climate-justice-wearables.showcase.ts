import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import wearablesImage from '../../utils/hero/images/ClimateJusticeWearables.jpeg';

export const climate_justice_wearablesV2: ProjectShowcaseV2 = {
  id: 'climate-justice-wearables',
  version: '2.0.0',
  hero: {
    title: 'Climate Justice Wearables',
    tagline: 'Sensor wearables visualize heat, air, and noise inequities—then drive local action.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Engineering', 'Data Science', 'Civics', 'Design'],
    image: wearablesImage
  },
  microOverview: [
    'Students assemble wearable sensors for temperature, particulates, and sound.',
    'They map inequities across routes and publish community dashboards.',
    'Policy memos propose justice‑centered interventions and pilot tests.'
  ],
  fullOverview:
    'Learners create sensor wearables to document climate burdens. Teams assemble safe sensor kits, collect time‑synced routes, and visualize heat, fine particulate matter (PM2.5), and noise patterns versus amenities. They publish dashboards and write justice‑oriented policy memos proposing fixes: shade, cooling centers, traffic calming. Ethical data use, consent, and protection of personally identifiable information (PII) are woven throughout. A final forum invites stakeholders to commit to a pilot.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Ground students in climate justice metrics and community sensing ethics for fieldwork. Teachers share case studies showing climate burdens across neighborhoods. Students draft consent forms and scripts with partner feedback.',
      teacher: [
        'Share case studies showing climate burdens across neighborhoods',
        'Review consent protocols and safety expectations with partners',
        'Model wearable sensor basics and maintenance routines'
      ],
      students: [
        'Draft consent forms and scripts with partner feedback',
        'Rehearse route navigation following safety checkpoints',
        'Design metric plan connecting sensors to justice story'
      ],
      deliverables: ['Consent packet draft', 'Justice metric plan'],
      checkpoint: ['Administrator and guardian approvals recorded'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Assemble wearable kits and finalize calibrated route plan for data collection. Teachers approve bill of materials and protective equipment usage. Students assemble sensor wearables using protective gear and checklists.',
      teacher: [
        'Approve bill of materials and protective equipment usage',
        'Supervise sensor assembly ensuring wiring safety standards',
        'Set sampling windows aligned with community availability'
      ],
      students: [
        'Assemble sensor wearables using protective gear and checklists',
        'Calibrate sensors with reference tools and record baselines',
        'Map data routes sequencing stops and check-in locations'
      ],
      deliverables: ['Calibrated wearable kits', 'Route and sampling plan'],
      checkpoint: ['Calibration quality verified and logged'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect climate data ethically across routes and maintain rigorous uploads. Teachers check safety compliance and hydration before departures. Students walk or ride assigned routes following consent agreements.',
      teacher: [
        'Check safety compliance and hydration before departures',
        'Review daily uploads for completeness and anomalies',
        'Coach troubleshooting strategies for sensor or data issues'
      ],
      students: [
        'Walk or ride assigned routes following consent agreements',
        'Upload datasets daily with metadata and context notes',
        'Log consent confirmations and opt-outs in shared tracker'
      ],
      deliverables: ['Route datasets v1', 'Consent and incident log'],
      checkpoint: ['Teacher validates data quality and privacy compliance'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Analyze data into dashboards and craft justice-focused policy memos. Teachers model accessible visualizations spotlighting inequity patterns. Students build dashboards comparing climate burdens across neighborhoods.',
      teacher: [
        'Model accessible visualizations spotlighting inequity patterns',
        'Share policy memo template connecting data to remedies',
        'Coach teams on justice framing and citation accuracy'
      ],
      students: [
        'Build dashboards comparing climate burdens across neighborhoods',
        'Draft policy memo linking findings to community needs',
        'Cite data sources, voices, and partners precisely'
      ],
      deliverables: ['Dashboard draft', 'Policy memo draft'],
      checkpoint: ['Citations verified before external sharing']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host community forum presenting data stories and securing commitments. Teachers invite community partners, officials, and press for forum. Students present dashboard story using accessible visuals and language.',
      teacher: [
        'Invite community partners, officials, and press for forum',
        'Time student talks and facilitate Q&A logistics',
        'Collect commitments and document follow-up actions'
      ],
      students: [
        'Present dashboard story using accessible visuals and language',
        'Pitch policy memo recommendations with justice framing',
        'Log partner commitments and next-step agreements live'
      ],
      deliverables: ['Forum pitch deck', 'Commitment tracker'],
      checkpoint: ['Partner commitments recorded with contacts'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Design pilot plan and monitoring framework to sustain climate justice action. Teachers guide pilot scoping conversations with stakeholders. Students draft pilot implementation plan with milestones and owners.',
      teacher: [
        'Guide pilot scoping conversations with stakeholders',
        'Review safety plan and mitigation strategies for pilots',
        'Assign monitoring roles and documentation expectations'
      ],
      students: [
        'Draft pilot implementation plan with milestones and owners',
        'Define success metrics and data collection schedule',
        'Schedule check-ins and reporting cadence with partners'
      ],
      deliverables: ['Pilot implementation plan', 'Monitoring metrics sheet'],
      checkpoint: ['Safety plan signed before launch']
    }
  ],
  outcomes: {
    core: [
      'Design consent-centered sensing plans with justice-oriented metrics',
      'Analyze wearable climate data to highlight inequities',
      'Communicate community remedies through dashboards, memos, and pilots'
    ],
    extras: ['Open dataset', 'Consent + privacy kit', 'Policy memo library', 'Pilot plan with partners'],
    audiences: ['City council', 'Public health', 'Neighborhood groups', 'Press']
  },
  materialsPrep: {
    coreKit: ['Temp sensors', 'PM2.5 sensor', 'Sound meter', 'Wearable mounts', 'Laptops/phones'],
    noTechFallback: ['Manual thermometers', 'Neighborhood logs', 'Paper maps'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Consent + Metrics',
      summary: 'Teams co-create consent packets and justice metrics for wearable sensing. Students interview partners about consent needs and community priorities. Teachers provide consent templates and risk management guidance.',
      studentDirections: [
        'Interview partners about consent needs and community priorities',
        'Draft consent forms and scripts with accessible language',
        'Map justice metrics linked to climate burdens and equity',
        'Design safe route plan highlighting checkpoints and supports',
        'Submit packet for administrator and guardian approvals'
      ],
      teacherSetup: [
        'Provide consent templates and risk management guidance',
        'Review safety protocols with admin and partners',
        'Approve metric plan aligning with community priorities'
      ],
      evidence: ['Consent packet draft', 'Justice metric plan'],
      successCriteria: ['I respect privacy and consent requirements fully', 'I choose metrics that reveal inequities and explain why', 'I plan routes and safety procedures responsibly'],
      aiOptional: {
        toolUse: 'Summarize climate justice data for consent context',
        critique: 'Ensure AI summary uses inclusive language and accurate facts',
        noAIAlt: 'Use public health briefings with teacher guidance'
      }
    },
    {
      id: 'A2',
      title: 'Build + Calibrate',
      summary: 'Students assemble and calibrate wearable kits, finalizing route sampling plan. Students assemble wearable kits using PPE and wiring diagrams. Teachers approve bill of materials and protective equipment.',
      studentDirections: [
        'Assemble wearable kits using PPE and wiring diagrams',
        'Calibrate sensors against reference tools and record baselines',
        'Capture calibration notes with timestamps and tolerance ranges',
        'Troubleshoot issues and log fixes for teammates',
        'Finalize route map with sampling windows and contacts'
      ],
      teacherSetup: [
        'Approve bill of materials and protective equipment',
        'Check calibration outputs for accuracy daily',
        'Coach troubleshooting routines for sensor reliability'
      ],
      evidence: ['Calibrated kit photos', 'Calibration log'],
      successCriteria: ['I assemble kits safely following instructions', 'I calibrate sensors until readings are reliable', 'I document fixes so others can repeat them'],
      aiOptional: {
        toolUse: 'Suggest calibration troubleshooting steps',
        critique: 'Flag AI suggestions that violate safety rules',
        noAIAlt: 'Use peer calibration review checklist'
      }
    },
    {
      id: 'A3',
      title: 'Routes + Uploads',
      summary: 'Teams collect climate data ethically, upload daily, and monitor consent logs. Students walk or ride assigned routes following safety plan. Teachers check teams in and out with hydration and PPE checks.',
      studentDirections: [
        'Walk or ride assigned routes following safety plan',
        'Record observations and sensor context in field notes',
        'Upload datasets daily with metadata and justice reflections',
        'Log consent confirmations, opt-outs, and incidents',
        'Flag anomalies and privacy concerns for review quickly'
      ],
      teacherSetup: [
        'Check teams in and out with hydration and PPE checks',
        'Review uploads for completeness and privacy compliance',
        'Coach responses to sensor or data issues'
      ],
      evidence: ['Route dataset v1', 'Consent and incident log'],
      successCriteria: ['I collect data safely with consent respected', 'I upload clean datasets with clear labels', 'I detect and report outliers or privacy risks quickly'],
      aiOptional: {
        toolUse: 'Detect anomalies in uploaded datasets',
        critique: 'Verify AI anomaly alerts against raw data',
        noAIAlt: 'Use statistical outlier guide'
      }
    },
    {
      id: 'A4',
      title: 'Dashboard + Memo',
      summary: 'Students build dashboards and draft justice-centered policy memos for the forum. Students construct dashboards showing inequities across neighborhoods clearly. Teachers model data storytelling with accessibility best practices.',
      studentDirections: [
        'Construct dashboards showing inequities across neighborhoods clearly',
        'Draft policy memo outlining remedies and community impact',
        'Cite data sources, partners, and community voices thoroughly',
        'Present drafts to partners for critique and alignment',
        'Revise dashboards and memos using feedback loops'
      ],
      teacherSetup: [
        'Model data storytelling with accessibility best practices',
        'Provide memo rubric and justice framing references',
        'Facilitate partner review and revision sessions'
      ],
      evidence: ['Dashboard', 'Memo'],
      successCriteria: ['I visualize climate inequities clearly and accessibly', 'I argue for remedies using data and community voices', 'I cite data sources and partners properly'],
      aiOptional: {
        toolUse: 'Draft memo outline highlighting key policy asks',
        critique: 'Ensure AI outline reflects justice lens and accurate data',
        noAIAlt: 'Use memo outline worksheet with teacher feedback'
      }
    }
  ],
};
