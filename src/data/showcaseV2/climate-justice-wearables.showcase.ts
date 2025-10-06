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
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Climate justice and safe sensing in the community.',
      teacher: ['Share case studies', 'Review safety/consent', 'Model sensor basics'],
      students: ['Draft consent form', 'Rehearse routes safely', 'Design metrics'],
      deliverables: ['Consent draft', 'Metric plan'], checkpoint: ['Admin/guardian review passed'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Assemble wearables and design route plan.',
      teacher: ['Approve BOM', 'Supervise assembly', 'Set sampling windows'],
      students: ['Assemble kits', 'Test calibration', 'Map routes'],
      deliverables: ['Wearable kits', 'Route plan'], checkpoint: ['Calibration OK'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'FieldworkLoop', focus: 'Collect data across routes; log consent; upload daily.',
      teacher: ['Check safety', 'Review uploads', 'Coach troubleshooting'],
      students: ['Walk/ride routes', 'Upload data', 'Log consent'],
      deliverables: ['Dataset v1', 'Consent log'], checkpoint: ['Data quality check'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Dashboard and policy memo drafting.',
      teacher: ['Model visuals', 'Share memo template', 'Coach equity lens'],
      students: ['Build dashboard', 'Draft memo', 'Cite sources'],
      deliverables: ['Dashboard v1', 'Memo v1'], checkpoint: ['Citations verified'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Community forum: present data and proposals.',
      teacher: ['Invite partners', 'Time talks', 'Collect commitments'],
      students: ['Present dashboard', 'Pitch memo', 'Log commitments'],
      deliverables: ['Pitch deck', 'Commitment tracker'], checkpoint: ['Partner commitments recorded'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Pilot setup and monitoring plan.',
      teacher: ['Guide pilot scoping', 'Review safety plan', 'Assign roles'],
      students: ['Design pilot', 'Define metrics', 'Schedule check‑ins'],
      deliverables: ['Pilot plan', 'Metrics sheet'], checkpoint: ['Safety plan signed'] }
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
      summary: 'Draft consent and choose justice‑oriented metrics.',
      studentDirections: ['Draft consent form with partners', 'Pick justice-focused metrics and justify', 'Map community concerns and permissions', 'Confirm safety plan for routes', 'Submit for admin/guardian approval'],
      teacherSetup: ['Share consent templates and scripts', 'Review safety requirements', 'Approve metrics with partners'],
      evidence: ['Consent draft', 'Metric plan'],
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
      summary: 'Assemble wearables and test calibration.',
      studentDirections: ['Assemble wearable kits safely with PPE', 'Calibrate sensors using reference tools', 'Record calibration notes and time stamps', 'Fix issues and document changes', 'Retest until readings are within tolerance'],
      teacherSetup: ['Approve BOM and tool usage', 'Check calibration results daily', 'Coach troubleshooting approaches'],
      evidence: ['Calibration notes', 'Kit photos'],
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
      summary: 'Collect data and upload clean daily.',
      studentDirections: ['Walk or ride routes within safety plan', 'Upload data daily with metadata', 'Log consent and opt-outs faithfully', 'Flag outliers or anomalies for review', 'Share daily justice summary with team'],
      teacherSetup: ['Check safety compliance', 'Review uploads for quality', 'Coach handling of outliers and privacy'],
      evidence: ['Dataset v1', 'Consent log'],
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
      summary: 'Publish visuals and write a policy memo.',
      studentDirections: ['Build dashboards with accessible visuals', 'Draft policy memo referencing justice frameworks', 'Cite data sources and community voices', 'Present findings to partners for feedback', 'Revise memo and visuals based on input'],
      teacherSetup: ['Model data storytelling and accessibility', 'Provide memo template and rubric', 'Coach revision loop with partners'],
      evidence: ['Dashboard', 'Memo'],
      successCriteria: ['I visualize climate inequities clearly and accessibly', 'I argue for remedies using data and community voices', 'I cite data sources and partners properly'],
      aiOptional: {
        toolUse: 'Draft memo outline highlighting key policy asks',
        critique: 'Ensure AI outline reflects justice lens and accurate data',
        noAIAlt: 'Use memo outline worksheet with teacher feedback'
      }
    }
  ],
  polish: {
    microRubric: ['Consent + privacy', 'Reliable measurements', 'Accessible dashboard', 'Actionable policy'],
    checkpoints: ['Consent approved', 'Calibration passed', 'Citations verified'],
    tags: ['eng', 'data', 'civics']
  },
  planningNotes: 'Secure district consent packets and safe walking routes with risk management 4 weeks ahead. Schedule a calibration clinic before Week 3 and invite public health staff early for policy feedback.'
};
