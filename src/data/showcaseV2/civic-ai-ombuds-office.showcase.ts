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
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Surface community FAQs and ethics frameworks to define safe AI advisory scope. Ask, "Whose questions are we prioritizing first and who will we harm if we guess wrong?" Teachers host agency listening session about resident questions and pain points. Students gather resident FAQs from partners and public datasets.',
      teacher: [
        'Host agency listening session about resident questions and pain points',
        'Model translating policy jargon into plain-language summaries',
        'Facilitate ethics workshop covering consent, privacy, and escalation'
      ],
      students: [
        'Gather resident FAQs from partners and public datasets',
        'Rewrite policy answers in plain language with citations',
        'Draft consent and disclaimer statements aligned to partner guidance'
      ],
      deliverables: ['FAQ research packet', 'Consent and disclaimer draft'],
      checkpoint: ['Partner signs scope and privacy commitments'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design transparent advisor prompts with citations and escalation protecting residents. Use prompts such as "What must every answer say so residents know this is not a lawyer?" Teachers coach prompt pattern building with rationales and guardrails. Students draft advisor prompts that state role, limits, and tone.',
      teacher: [
        'Coach prompt pattern building with rationales and guardrails',
        'Review citation formatting using compliance templates',
        'Define escalation thresholds alongside agency legal advisors'
      ],
      students: [
        'Draft advisor prompts that state role, limits, and tone',
        'Attach citations and source URLs to every answer',
        'Map escalation decision trees with human contact details'
      ],
      deliverables: ['Prompt playbook', 'Escalation decision map'],
      checkpoint: ['Teacher approves prompts and escalation safeguards'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Prototype advisors and run usability tests to ensure clarity and fairness. Keep asking, "Would we trust this answer if our own family relied on it?" Teachers provide structured testing scripts for diverse community testers. Students build advisor prototype with transparent prompt documentation.',
      teacher: [
        'Provide structured testing scripts for diverse community testers',
        'Audit advisor logs for accuracy, tone, and bias issues',
        'Coach iteration cycles responding to resident feedback'
      ],
      students: [
        'Build advisor prototype with transparent prompt documentation',
        'Run usability sessions capturing clarity and trust metrics',
        'Fix outputs and document bias mitigations after tests'
      ],
      deliverables: ['Advisor prototype v1', 'Usability and bias log'],
      checkpoint: ['Bias review completed with partner observers'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Stage pop-up booth with accessibility supports and volunteer readiness. Center planning on "How will residents feel safe asking sensitive questions in this space?" Teachers coordinate accessible venue setup with signage approvals. Students design booth layout with privacy and accessibility zones.',
      teacher: [
        'Coordinate accessible venue setup with signage approvals',
        'Review booth scripts covering consent and escalation steps',
        'Schedule volunteer coverage and supervision roles'
      ],
      students: [
        'Design booth layout with privacy and accessibility zones',
        'Write quick guides for volunteers and escalation calls',
        'Train volunteers through roleplay and consent practice'
      ],
      deliverables: ['Booth operations plan', 'Volunteer readiness kit'],
      checkpoint: ['Venue approval logged with accessibility checklist']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Run the Ombuds booth, support residents, and capture improvement data. Remind teams, "What should every resident leave knowing—even if we cannot solve their issue?" Teachers oversee safety compliance and on-site data handling. Students assist residents with AI advisor using consent scripts.',
      teacher: [
        'Oversee safety compliance and on-site data handling',
        'Monitor escalation cases and human follow-up logs',
        'Collect improvement requests and kudos systematically'
      ],
      students: [
        'Assist residents with AI advisor using consent scripts',
        'Log issues without storing personally identifiable information',
        'Share human referrals and printed resources compassionately'
      ],
      deliverables: ['Resident issue log', 'Resource referral tracker'],
      checkpoint: ['No personally identifiable information stored in logs'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Publish transparent methods and deliver partner handoff for sustained support. Ask, "Who maintains accountability for this advisor after we graduate?" to frame the handoff. Teachers review methods document for accuracy and accessible tone. Students publish methods and limitations page with citations.',
      teacher: [
        'Review methods document for accuracy and accessible tone',
        'Confirm privacy safeguards and data deletion steps',
        'Schedule handoff presentation with partner leadership'
      ],
      students: [
        'Publish methods and limitations page with citations',
        'Report improvement backlog and maintenance plan to partners',
        'Deliver handoff kit summarizing operations and training'
      ],
      deliverables: ['Methods and limits page', 'Partner handoff memo'],
      checkpoint: ['Partner receipt confirmed with next steps scheduled']
    }
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
      summary: 'Start the ombuds build by listening deeply and defining guardrails together. Students interview partners, translate FAQs into plain language, and draft consent plus disclaimer language that residents can trust. Teachers convene agency reviewers and legal advisors so the scope is approved before any AI is built.',
      studentDirections: [
        'Interview partners and residents about recurring policy questions',
        'Consolidate FAQs with citations and context notes',
        'Draft consent, disclaimers, and privacy commitments collaboratively',
        'Identify escalation scenarios requiring human officials',
        'Submit scope packet for partner feedback and approval'
      ],
      teacherSetup: [
        'Invite agency partners to validate FAQ priorities',
        'Share ethics and consent templates for drafting',
        'Review scope packet with counselors and legal advisors'
      ],
      evidence: ['FAQ research packet', 'Ethics scope note'],
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
      summary: 'Prompt studio week turns research into transparent, citation-ready responses. Students script advisor voices that name limits, attach verifiable sources, and map clear escalation paths for human officials. Teachers coach documentation habits and compliance checks so every answer stays honest and accountable.',
      studentDirections: [
        'Draft advisor prompts that state role and limits',
        'Attach citations and URL references to each answer',
        'Design escalation decision paths and contact info',
        'Test sample interactions for tone and clarity',
        'Revise prompts using partner critique and resident feedback'
      ],
      teacherSetup: [
        'Coach prompt documentation and rationale annotation',
        'Review citation formatting and sourcing expectations',
        'Check escalation plan alignment with agency policies'
      ],
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
      summary: 'Testing week treats residents as co-designers who stress-test the advisor. Students facilitate usability and bias sessions, analyze transcripts for harm, and iterate quickly on prompt fixes. Teachers supply consent protocols, audit mitigation plans, and ensure improvements truly resolve the issues uncovered.',
      studentDirections: [
        'Conduct usability sessions with diverse community testers',
        'Measure clarity, accuracy, and trust using rubrics',
        'Analyze transcripts for bias, tone, and misinformation',
        'Implement fixes and document rationale with evidence',
        'Re-test updated advisor confirming improvements hold'
      ],
      teacherSetup: [
        'Provide testing scripts and consent tracking sheets',
        'Audit results for reliability and ethical compliance',
        'Review mitigation plans with partner team'
      ],
      evidence: ['Usability findings log', 'Bias mitigation report'],
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
      summary: 'The final sprint moves from lab to live service. Students operate the pop-up booth with consent scripts, log issues without storing personal data, and compile method pages plus improvement roadmaps for partners. Teachers oversee safety, manage escalation, and confirm the handoff kit positions agencies to maintain the advisor responsibly.',
      studentDirections: [
        'Operate ombuds booth using consent and privacy scripts',
        'Log issues without personal data and tag themes',
        'Provide referrals and handouts for human assistance',
        'Publish methods page detailing limits and safeguards',
        'Assemble handoff kit with improvement backlog for partners'
      ],
      teacherSetup: [
        'Oversee safety, privacy, and de-escalation protocols',
        'Secure storage for logs and resident follow-ups',
        'Verify handoff artifacts meet partner requirements'
      ],
      evidence: ['Issue log', 'Methods page'],
      successCriteria: ['I support residents kindly within scope', 'I protect privacy and document issues responsibly', 'I deliver a handoff partners can maintain'],
      aiOptional: {
        toolUse: 'Draft methods summary from documentation logs',
        critique: 'Ensure AI summary states limits and cautions accurately',
        noAIAlt: 'Use methods outline template with partner input'
      }
    }
  ],
};
