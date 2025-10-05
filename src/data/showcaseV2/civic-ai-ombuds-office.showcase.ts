import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import civicOmbudsImage from '../../utils/hero/images/CivicAIOmbudsOffice.jpeg';

export const civic_ai_ombuds_officeV2: ProjectShowcaseV2 = {
  id: 'civic-ai-ombuds-office',
  version: '2.0.0',
  hero: {
    title: 'Civic AI Ombuds Office',
    tagline: 'Transparent AI advisors help neighbors navigate local policy—with ethics, consent, and clarity.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Computer Science', 'Civics', 'Ethics', 'Design'],
    image: civicOmbudsImage
  },
  microOverview: [
    'Students map local policy FAQs and community needs with partners.',
    'They build transparent AI advisors (prompting, guardrails, citations) and test clarity.',
    'A pop‑up Ombuds booth supports residents and logs improvement requests.'
  ],
  fullOverview:
    'Students build a civic help desk powered by transparent artificial intelligence (AI). They collect FAQs with agencies, prototype advisors with prompt transparency, citations, and disclaimers, and run usability tests with plain‑language checks. Ethics are central: consent, data privacy—including protection of personally identifiable information (PII)—bias mitigation, and deflection to human officials when stakes are high. A pop‑up booth invites residents to try the tool; teams publish methods, limits, and an improvement log for officials.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Policy FAQs, plain language, and ethics of AI advice.',
      teacher: ['Invite agency partner', 'Model plain language', 'Share ethics guardrails'],
      students: ['Collect FAQs', 'Draft disclaimers', 'Map privacy'],
      deliverables: ['FAQ set', 'Disclaimer draft'], checkpoint: ['Partner scope signed'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Advisor prompting, citations, and escalation paths.',
      teacher: ['Coach prompt design', 'Review citation patterns', 'Define escalation'],
      students: ['Draft prompts', 'Add citations', 'Plan escalation'],
      deliverables: ['Prompt pack', 'Escalation plan'], checkpoint: ['Teacher review passed'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Prototype advisors and run usability/accuracy tests.',
      teacher: ['Share test scripts', 'Check accuracy', 'Review bias'],
      students: ['Build prototype', 'Test with users', 'Fix clarity'],
      deliverables: ['Prototype v1', 'Usability notes'], checkpoint: ['Bias review done'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Set up pop‑up booth and accessibility supports.',
      teacher: ['Coordinate venue', 'Approve signage', 'Plan volunteers'],
      students: ['Design booth', 'Write guides', 'Train volunteers'],
      deliverables: ['Booth plan', 'Volunteer guide'], checkpoint: ['Venue approval logged'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Run the Ombuds booth and log improvement requests.',
      teacher: ['Oversee safety', 'Collect requests', 'Confirm deflection paths'],
      students: ['Support residents', 'Log issues', 'Share resources'],
      deliverables: ['Issue log', 'Resource list'], checkpoint: ['No PII stored'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Publish methods/limits and partner handoff.',
      teacher: ['Review methods', 'Confirm privacy', 'Schedule handoff'],
      students: ['Publish methods', 'Report limits', 'Deliver handoff'],
      deliverables: ['Methods page', 'Handoff memo'], checkpoint: ['Partner receipt confirmed'] }
  ],
  outcomes: {
    core: ['Deploy a transparent AI advisor with ethical guardrails and documented limits'],
    extras: ['Plain‑language guide', 'Escalation flowchart', 'Issue log dashboard', 'Partner handoff pack'],
    audiences: ['City agencies', 'Libraries', 'Civic tech orgs', 'Residents']
  },
  materialsPrep: {
    coreKit: ['Laptops', 'Partner FAQ data', 'Plain‑language checklist', 'Signage + flyers'],
    noTechFallback: ['Paper flowcharts', 'Printed FAQs', 'Manual referral list'],
    safetyEthics: ['Consent and privacy protection', 'No legal/medical advice', 'Clear escalation to humans']
  },
  assignments: [
    { id: 'A1', title: 'FAQ + Ethics Scope', summary: 'Collect FAQs and set ethics boundaries.',
      studentDirections: ['Collect FAQs', 'Draft disclaimers', 'Map privacy', 'List deflections', 'Submit scope'],
      teacherSetup: ['Invite partner', 'Share templates', 'Approve scope'],
      evidence: ['FAQ set', 'Scope note'], successCriteria: ['I gather FAQs', 'I write clearly', 'I set safe scope'] },
    { id: 'A2', title: 'Prompt + Citations', summary: 'Design advisors with citations and escalation.',
      studentDirections: ['Draft prompts', 'Add citations', 'Plan escalation', 'Test samples', 'Revise'],
      teacherSetup: ['Coach prompts', 'Review citations', 'Check escalation'],
      evidence: ['Prompt pack', 'Escalation plan'], successCriteria: ['I cite transparently', 'I design deflection', 'I revise well'],
      aiOptional: { toolUse: 'Refine prompts', critique: 'Flag hallucinations', noAIAlt: 'Peer prompt audit' } },
    { id: 'A3', title: 'Usability + Bias Test', summary: 'Test clarity and fairness.',
      studentDirections: ['Run tests', 'Measure clarity', 'Check bias', 'Fix issues', 'Re‑test'],
      teacherSetup: ['Provide scripts', 'Check measurements', 'Review fixes'],
      evidence: ['Usability notes', 'Bias report'], successCriteria: ['I test fairly', 'I fix clearly', 'I re‑test cleanly'] },
    { id: 'A4', title: 'Booth + Handoff', summary: 'Host the Ombuds booth and publish methods.',
      studentDirections: ['Host booth', 'Log issues', 'Share resources', 'Publish methods', 'Deliver handoff'],
      teacherSetup: ['Oversee safety', 'Collect logs', 'Verify privacy'],
      evidence: ['Issue log', 'Methods page'], successCriteria: ['I support kindly', 'I protect privacy', 'I deliver handoff'] }
  ],
  polish: {
    microRubric: ['Transparent prompts/citations', 'Plain language', 'Bias checks', 'Safe escalation'],
    checkpoints: ['Scope approved', 'Bias review done', 'Privacy verified'],
    tags: ['cs', 'civics', 'ethics']
  },
  planningNotes: 'Align with agency partner early; set strict privacy; ensure human escalation for sensitive questions.'
};
