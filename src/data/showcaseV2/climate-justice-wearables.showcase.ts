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
      students: ['Draft consent form', 'Practice routes', 'Plan metrics'],
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
      students: ['Plan pilot', 'Define metrics', 'Schedule check‑ins'],
      deliverables: ['Pilot plan', 'Metrics sheet'], checkpoint: ['Safety plan signed'] }
  ],
  outcomes: {
    core: ['Deploy wearable sensing to document inequities and propose remedies'],
    extras: ['Open dataset', 'Consent + privacy kit', 'Policy memo library', 'Pilot plan with partners'],
    audiences: ['City council', 'Public health', 'Neighborhood groups', 'Press']
  },
  materialsPrep: {
    coreKit: ['Temp sensors', 'PM2.5 sensor', 'Sound meter', 'Wearable mounts', 'Laptops/phones'],
    noTechFallback: ['Manual thermometers', 'Neighborhood logs', 'Paper maps'],
    safetyEthics: ['Consent for routes', 'Avoid risky areas', 'De‑identify personal data']
  },
  assignments: [
    { id: 'A1', title: 'Consent + Metrics', summary: 'Draft consent and choose justice‑oriented metrics.',
      studentDirections: ['Draft consent', 'Pick metrics', 'Map concerns', 'Confirm safety', 'Submit'],
      teacherSetup: ['Share templates', 'Review safety', 'Approve metrics'],
      evidence: ['Consent draft', 'Metric plan'], successCriteria: ['I respect privacy', 'I choose meaningful', 'I plan safely'] },
    { id: 'A2', title: 'Build + Calibrate', summary: 'Assemble wearables and test calibration.',
      studentDirections: ['Assemble kits', 'Calibrate', 'Record notes', 'Fix issues', 'Retest'],
      teacherSetup: ['Approve BOM', 'Check calibration', 'Coach fixes'],
      evidence: ['Calibration notes', 'Kit photos'], successCriteria: ['I assemble safely', 'I calibrate correctly', 'I document fixes'],
      aiOptional: { toolUse: 'Suggest calibration steps', critique: 'Flag suspicious data', noAIAlt: 'Peer calibration review' } },
    { id: 'A3', title: 'Routes + Uploads', summary: 'Collect data and upload clean daily.',
      studentDirections: ['Walk routes', 'Upload data', 'Log consent', 'Flag outliers', 'Share summary'],
      teacherSetup: ['Check safety', 'Review uploads', 'Coach outliers'],
      evidence: ['Dataset v1', 'Consent log'], successCriteria: ['I log safely', 'I upload cleanly', 'I spot outliers'] },
    { id: 'A4', title: 'Dashboard + Memo', summary: 'Publish visuals and write a policy memo.',
      studentDirections: ['Build visuals', 'Draft memo', 'Cite data', 'Present', 'Revise'],
      teacherSetup: ['Model visuals', 'Provide memo template', 'Coach revisions'],
      evidence: ['Dashboard', 'Memo'], successCriteria: ['I visualize clearly', 'I argue fairly', 'I cite properly'] }
  ],
  polish: {
    microRubric: ['Consent + privacy', 'Reliable measurements', 'Accessible dashboard', 'Actionable policy'],
    checkpoints: ['Consent approved', 'Calibration passed', 'Citations verified'],
    tags: ['eng', 'data', 'civics']
  },
  planningNotes: 'Confirm consent and safety routes; avoid identifying individuals; invite public health and city staff early.'
};
