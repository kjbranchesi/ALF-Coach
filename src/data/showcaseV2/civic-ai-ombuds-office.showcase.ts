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
      students: ['Draft prompts', 'Add citations', 'Design escalation plan'],
      deliverables: ['Prompt pack', 'Escalation plan'], checkpoint: ['Teacher review passed'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Prototype advisors and run usability/accuracy tests.',
      teacher: ['Share test scripts', 'Check accuracy', 'Review bias'],
      students: ['Build prototype', 'Test with users', 'Fix clarity'],
      deliverables: ['Prototype v1', 'Usability notes'], checkpoint: ['Bias review done'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Set up pop‑up booth and accessibility supports.',
      teacher: ['Coordinate venue', 'Approve signage', 'Coordinate volunteers'],
      students: ['Design booth', 'Write guides', 'Train volunteers'],
      deliverables: ['Booth plan', 'Volunteer guide'], checkpoint: ['Venue approval logged'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Run the Ombuds booth and log improvement requests.',
      teacher: ['Oversee safety', 'Collect requests', 'Confirm deflection paths'],
      students: ['Assist residents respectfully', 'Log issues without collecting PII', 'Share resources'],
      deliverables: ['Issue log', 'Resource list'], checkpoint: ['No PII stored'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Publish methods/limits and partner handoff.',
      teacher: ['Review methods', 'Confirm privacy', 'Schedule handoff'],
      students: ['Publish methods', 'Report limits', 'Deliver handoff'],
      deliverables: ['Methods page', 'Handoff memo'], checkpoint: ['Partner receipt confirmed'] }
  ],
  outcomes: {
    core: [
      'Investigate community FAQs and define ethical scope with partners',
      'Build transparent AI advisors with citations, bias checks, and escalation paths',
      'Design pop-up ombuds services and publish methods with limits for residents'
    ],
    extras: ['Plain‑language guide', 'Escalation flowchart', 'Issue log dashboard', 'Partner handoff pack'],
    audiences: ['City agencies', 'Libraries', 'Civic tech orgs', 'Residents']
  },
  materialsPrep: {
    coreKit: ['Laptops', 'Partner FAQ data', 'Plain‑language checklist', 'Signage + flyers'],
    noTechFallback: ['Paper flowcharts', 'Printed FAQs', 'Manual referral list'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'FAQ + Ethics Scope',
      summary: 'Collect FAQs and set ethics boundaries.',
      studentDirections: ['Collect FAQs with partner approval', 'Draft disclaimers and consent language', 'Map privacy rules and data flows', 'List deflection scenarios to humans', 'Submit scope for partner sign-off'],
      teacherSetup: ['Invite partner to review FAQs', 'Share ethics templates and consent forms', 'Approve scope with counselors'],
      evidence: ['FAQ set', 'Scope note'],
      successCriteria: ['I gather FAQs that match partner priorities', 'I write disclaimers residents can understand', 'I define scope and deflections that keep residents safe'],
      aiOptional: {
        toolUse: 'Summarize policy FAQs into plain language drafts',
        critique: 'Ensure AI summary stays accurate and neutral',
        noAIAlt: 'Use plain-language checklist with partner'
      }
    },
    {
      id: 'A2',
      title: 'Prompt + Citations',
      summary: 'Design advisors with citations and escalation.',
      studentDirections: ['Draft advisor prompts with rationale', 'Add citations and source URLs for every fact', 'Design escalation paths and thresholds', 'Test sample interactions for tone', 'Revise based on partner feedback'],
      teacherSetup: ['Coach prompt transparency strategies', 'Review citation formatting', 'Check escalation plan with agencies'],
      evidence: ['Prompt pack', 'Escalation plan'],
      successCriteria: ['I cite every answer transparently', 'I design escalation paths that protect residents', 'I revise prompts to remove ambiguity'],
      aiOptional: {
        toolUse: 'Refine prompts for clarity and fairness',
        critique: 'Flag AI outputs that hallucinate or overpromise',
        noAIAlt: 'Use peer prompt audit protocol'
      }
    },
    {
      id: 'A3',
      title: 'Usability + Bias Test',
      summary: 'Test clarity and fairness.',
      studentDirections: ['Run usability tests with community scripts', 'Measure clarity, accuracy, and tone', 'Check for bias or harmful outputs', 'Fix issues and document changes', 'Re-test to confirm improvements'],
      teacherSetup: ['Provide testing scripts and rubrics', 'Check measurement data for consistency', 'Review fixes with partner'],
      evidence: ['Usability notes', 'Bias report'],
      successCriteria: ['I test advisors fairly with diverse users', 'I fix clarity and bias issues thoroughly', 'I re-test to confirm the advisor stays safe'],
      aiOptional: {
        toolUse: 'Analyze logs for repeated bias patterns',
        critique: 'Ensure AI analysis respects privacy and context',
        noAIAlt: 'Use bias spotting checklist'
      }
    },
    {
      id: 'A4',
      title: 'Booth + Handoff',
      summary: 'Host the Ombuds booth and publish methods.',
      studentDirections: ['Host ombuds booth with clear consent steps', 'Log issues without collecting PII', 'Share human resources and deflection options', 'Publish methods/limits page openly', 'Deliver handoff pack to partners'],
      teacherSetup: ['Oversee safety and privacy compliance', 'Collect logs securely', 'Verify methods page meets partner requirements'],
      evidence: ['Issue log', 'Methods page'],
      successCriteria: ['I support residents kindly within scope', 'I protect privacy and document issues responsibly', 'I deliver a handoff partners can maintain'],
      aiOptional: {
        toolUse: 'Draft methods summary from documentation logs',
        critique: 'Ensure AI summary states limits and cautions accurately',
        noAIAlt: 'Use methods outline template with partner input'
      }
    }
  ],
  polish: {
    microRubric: ['Transparent prompts/citations', 'Plain language', 'Bias checks', 'Safe escalation'],
    checkpoints: ['Scope approved', 'Bias review done', 'Privacy verified'],
    tags: ['cs', 'civics', 'ethics']
  },
  planningNotes: 'Book the ombuds partner 4 weeks out to lock scope, data boundaries, and escalation paths. Run privacy reviews before Week 2 and set a weekly check-in so approvals stay fast.'
};
