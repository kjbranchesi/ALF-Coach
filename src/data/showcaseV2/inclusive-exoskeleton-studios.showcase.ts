import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import exoImage from '../../utils/hero/images/InclusiveExoskeletonStudios.jpeg';

export const inclusive_exoskeleton_studiosV2: ProjectShowcaseV2 = {
  id: 'inclusive-exoskeleton-studios',
  version: '2.0.0',
  hero: {
    title: 'Inclusive Exoskeleton Studios',
    tagline: 'Soft exos designed with mobility‑impaired peers—empathy interviews to safe prototypes.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Engineering', 'Health Sciences', 'Design', 'Empathy Research'],
    image: exoImage
  },
  microOverview: [
    'Students conduct empathy interviews with consent and boundaries.',
    'They prototype soft exos (no power tools required) and test safely.',
    'A clinic shares prototypes, feedback, and next‑step recommendations.'
  ],
  fullOverview:
    'Teams learn human‑centered design with mobility‑impaired partners. After training on consent, boundaries, and research ethics, students run empathy interviews, then design soft exos (textiles, elastic, 3D‑printed brackets) for a movement task. Safety and comfort drive all tests. A final clinic shares prototypes and recommendations; data and consent are handled with care, and any follow‑ups involve professional therapists.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Disability etiquette, consent, and project scope.',
      teacher: ['Teach ethics', 'Review consent forms', 'Scope tasks'],
      students: ['Draft consent', 'List tasks', 'Propose safeguards'],
      deliverables: ['Consent draft', 'Task scope'], checkpoint: ['Admin/guardian review'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Empathy interview planning and IRB‑lite guardrails.',
      teacher: ['Model interviews', 'Review boundaries', 'Approve scripts'],
      students: ['Draft script', 'Plan sessions', 'Assign roles'],
      deliverables: ['Interview script', 'Session plan'], checkpoint: ['Teacher signs scripts'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Prototype soft exos and run safe fit tests.',
      teacher: ['Approve materials', 'Supervise fit tests', 'Check comfort'],
      students: ['Prototype build', 'Fit test', 'Revise design'],
      deliverables: ['Prototype v1', 'Fit notes'], checkpoint: ['Comfort + safety passed'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Functional trials and data logging.',
      teacher: ['Review tasks', 'Set stop criteria', 'Check logs'],
      students: ['Run trials', 'Log outcomes', 'Adjust safely'],
      deliverables: ['Trial logs', 'Prototype v2'], checkpoint: ['Stop criteria respected'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Prototype clinic and feedback synthesis.',
      teacher: ['Invite mentors', 'Time sessions', 'Collect feedback'],
      students: ['Demo prototype', 'Collect feedback', 'Synthesize'],
      deliverables: ['Demo script', 'Feedback synthesis'], checkpoint: ['Partner notes stored securely'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Recommendations and professional referral paths.',
      teacher: ['Review referrals', 'Coordinate therapists', 'Debrief ethics'],
      students: ['Write recommendations', 'Document next steps', 'Share with consent'],
      deliverables: ['Recommendation brief', 'Consent record'], checkpoint: ['Therapist referral approved'] }
  ],
  outcomes: {
    core: ['Deliver soft exo prototype and recommendations with partner consent'],
    extras: ['Empathy interview library', 'Comfort/safety protocol', 'Inclusive testing scripts', 'Therapist referral guide'],
    audiences: ['OT/PT mentors', 'Families', 'School leadership', 'Maker communities']
  },
  materialsPrep: {
    coreKit: ['Textiles, elastic straps', 'Velcro, buckles', '3D‑printed brackets (optional)', 'Sewing kits', 'Measurement tools'],
    noTechFallback: ['Hand sewing', 'Cardboard templates', 'Manual fit guides'],
    safetyEthics: ['Explicit consent + boundaries', 'Comfort and stop criteria', 'Secure data handling']
  },
  assignments: [
    { id: 'A1', title: 'Ethics + Scope', summary: 'Learn disability etiquette and scope movement tasks.',
      studentDirections: ['Read etiquette', 'Draft consent', 'List tasks', 'Propose safeguards', 'Submit'],
      teacherSetup: ['Teach etiquette', 'Share templates', 'Approve scope'],
      evidence: ['Consent draft', 'Task scope'], successCriteria: ['I respect partners', 'I write clearly', 'I scope safely'] },
    { id: 'A2', title: 'Interview Plan', summary: 'Prepare IRB‑lite interviews with scripts.',
      studentDirections: ['Draft script', 'List questions', 'Note boundaries', 'Plan scheduling', 'Get approval'],
      teacherSetup: ['Model interviews', 'Review scripts', 'Check boundaries'],
      evidence: ['Script', 'Plan'], successCriteria: ['I plan respectfully', 'I protect privacy', 'I confirm logistics'] },
    { id: 'A3', title: 'Prototype + Fit', summary: 'Build soft exo and test fit safely.',
      studentDirections: ['Build safely', 'Fit test', 'Log comfort', 'Revise design', 'Photo log'],
      teacherSetup: ['Approve materials', 'Supervise fit', 'Check comfort logs'],
      evidence: ['Prototype', 'Fit notes'], successCriteria: ['I build carefully', 'I log comfort', 'I revise safely'] },
    { id: 'A4', title: 'Clinic + Recommendations', summary: 'Demo with mentors and synthesize next steps.',
      studentDirections: ['Run clinic', 'Collect feedback', 'Write brief', 'Confirm consent', 'Share'],
      teacherSetup: ['Invite mentors', 'Record feedback', 'Store consent'],
      evidence: ['Feedback synthesis', 'Recommendation brief'], successCriteria: ['I demo respectfully', 'I synthesize clearly', 'I share with consent'] }
  ],
  polish: {
    microRubric: ['Respectful research', 'Comfort + safety', 'Functional prototyping', 'Clear recommendations'],
    checkpoints: ['Consent approved', 'Comfort passed', 'Referral options set'],
    tags: ['eng', 'health', 'design']
  },
  planningNotes: 'Secure consent and boundaries first; involve OT/PT mentors; store data securely; avoid powered exos in class.'
};
