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
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore disability etiquette, consent, and project scope to ground co-design in trust. Ask, "How do we show up so partners feel safe saying no at any time?" Teachers facilitate disability etiquette workshop. Students draft consent artifacts respectfully.',
      teacher: ['Facilitate disability etiquette workshop', 'Review consent forms line by line', 'Co-scope movement tasks with mentors'],
      students: ['Draft consent artifacts respectfully', 'List movement tasks with partners', 'Propose safety safeguards and stop rules'],
      deliverables: ['Consent draft', 'Task scope'],
      checkpoint: ['Admin/guardian review'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan empathy interviews and IRB-lite guardrails so every conversation honors partners. Prompt teams with "What question should we never ask without an invitation?" Teachers model empathetic interview techniques. Students draft detailed interview script.',
      teacher: ['Model empathetic interview techniques', 'Review boundaries and scenarios', 'Approve interview scripts and logistics'],
      students: ['Draft detailed interview script', 'Schedule sessions with consent', 'Assign facilitator and note-taker roles'],
      deliverables: ['Interview script', 'Session plan'],
      checkpoint: ['Teacher signs scripts'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Prototype soft exos and run safe fit tests to translate insights into tangible support. Keep asking, "Would I want to wear this for an hour if it were designed for me?" Teachers approve materials against safety criteria. Students prototype soft exo components safely.',
      teacher: ['Approve materials against safety criteria', 'Supervise each fit test closely', 'Check comfort logs every session'],
      students: ['Prototype soft exo components safely', 'Conduct fit tests with consent reminders', 'Revise designs based on comfort data'],
      deliverables: ['Prototype v1', 'Fit notes'],
      checkpoint: ['Comfort + safety passed'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Run functional trials and data logging to verify performance without compromising comfort. Anchor testing in "What is the first sign we should pause before harm?" Teachers review functional task scripts. Students run functional trials within limits.',
      teacher: ['Review functional task scripts', 'Set stop criteria and escalation plan', 'Audit data logs for completeness'],
      students: ['Run functional trials within limits', 'Log outcomes and comfort metrics', 'Adjust prototypes safely and deliberately'],
      deliverables: ['Trial logs', 'Prototype v2'],
      checkpoint: ['Stop criteria respected']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host prototype clinic and synthesize feedback so partners steer next iterations. Ask, "How will we capture feedback without exhausting our partners?" Teachers invite OT/PT mentors for clinic. Students demo prototypes with partner consent.',
      teacher: ['Invite OT/PT mentors for clinic', 'Time sessions and protect rest', 'Collect feedback securely'],
      students: ['Demo prototypes with partner consent', 'Collect structured feedback respectfully', 'Synthesize findings into next-step themes'],
      deliverables: ['Demo script', 'Feedback synthesis'],
      checkpoint: ['Partner notes stored securely'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Craft recommendations and professional referral paths to ensure support continues responsibly. Frame the week with "Who carries this relationship forward when we step back?" Teachers review referral pathways with therapists. Students write recommendation briefs with consent language.',
      teacher: ['Review referral pathways with therapists', 'Coordinate professional follow-up options', 'Debrief ethics and emotional load'],
      students: ['Write recommendation briefs with consent language', 'Log next steps and owner agreements', 'Share outcomes only with documented consent'],
      deliverables: ['Recommendation brief', 'Consent record'],
      checkpoint: ['Therapist referral approved']
    }
  ],
  outcomes: {
    core: [
      'Design ethical empathy research protocols with mobility-impaired partners',
      'Engineer and iterate soft exoskeleton prototypes that prioritize comfort and safety',
      'Communicate evidence-based recommendations and referral plans with consent upheld'
    ],
    extras: ['Empathy interview library', 'Comfort/safety protocol', 'Inclusive testing scripts', 'Therapist referral guide'],
    audiences: ['OT/PT mentors', 'Families', 'School leadership', 'Maker communities']
  },
  materialsPrep: {
    coreKit: ['Textiles, elastic straps', 'Velcro, buckles', '3D‑printed brackets (optional)', 'Sewing kits', 'Measurement tools'],
    noTechFallback: ['Hand sewing', 'Cardboard templates', 'Manual fit guides'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Ethics + Scope',
      summary: 'Open the studio by centering disability etiquette and shared safety commitments. Students study partner-provided scenarios, capture personal accountability pledges, and co-scope movement tasks that feel respectful. Teachers lead case studies, review consent language line by line, and confirm every safeguard before prototyping begins.',
      studentDirections: [
        'Study disability etiquette and summarize commitments',
        'Draft consent packets with accessible language',
        'List movement tasks and partner goals',
        'Propose safeguards and stop criteria with mentors',
        'Submit scope portfolio for approval'
      ],
      teacherSetup: ['Teach etiquette through case studies', 'Share consent templates', 'Approve scope alongside admin'],
      evidence: ['Consent draft', 'Task scope'],
      successCriteria: ['I articulate consent expectations clearly', 'I align tasks with partner priorities', 'I design safeguards that honor comfort'],
      aiOptional: {
        toolUse: 'Summarize etiquette commitments into student pledge',
        critique: 'Check AI pledge for respectful language',
        noAIAlt: 'Adapt pledge with partner feedback'
      }
    },
    {
      id: 'A2',
      title: 'Interview Plan',
      summary: 'Interview planning ensures curiosity never outweighs care. Students craft trauma-informed scripts, assign facilitation roles, and rehearse logistics so partners always have agency. Teachers model empathetic questioning, stress-test scenarios, and sign off only when the guardrails are airtight.',
      studentDirections: [
        'Draft interview script with trauma-informed prompts',
        'List questions that explore goals and frustrations',
        'Capture boundaries, stop phrases, and supports',
        'Organize session logistics and accessibility needs',
        'Submit for teacher and partner approval'
      ],
      teacherSetup: ['Model empathetic interviews with roleplay', 'Review scripts for boundary compliance', 'Check logistics and supports'],
      evidence: ['Script', 'Plan'],
      successCriteria: ['I design interviews that center partner dignity', 'I protect privacy through clear protocols', 'I confirm logistics and supports before sessions'],
      aiOptional: {
        toolUse: 'Generate follow-up question variations',
        critique: 'Reject AI suggestions that feel invasive',
        noAIAlt: 'Use interview question remix cards'
      }
    },
    {
      id: 'A3',
      title: 'Prototype + Fit',
      summary: 'Prototype week brings insights into physical form. Students build soft exos with approved materials, conduct fit tests with ongoing consent checks, and log comfort plus mobility data that drives revisions. Teachers supervise every session, audit logs, and ensure adjustments stay within therapeutic guidance.',
      studentDirections: [
        'Build soft exoskeleton components following safety SOP',
        'Conduct fit tests with consent check-ins',
        'Log comfort, pain, and mobility metrics precisely',
        'Revise design responding to partner feedback',
        'Capture changes with annotated photos'
      ],
      teacherSetup: ['Approve material list against allergies', 'Supervise every fit test stage', 'Check comfort logs and photos'],
      evidence: ['Prototype', 'Fit notes'],
      successCriteria: ['I construct prototypes that honor safety rules', 'I log comfort data consistently with partner voice', 'I revise designs responsively and safely'],
      aiOptional: {
        toolUse: 'Suggest padding or support adjustments from logs',
        critique: 'Ensure AI ideas respect medical guidance',
        noAIAlt: 'Consult OT/PT mentor checklist'
      }
    },
    {
      id: 'A4',
      title: 'Clinic + Recommendations',
      summary: 'The clinic transfers ownership back to partners and professionals. Students host demos with scripted consent, gather mentor feedback, and translate learnings into recommendation briefs with clear next steps. Teachers coordinate mentors, manage documentation securely, and verify referrals plus consent before anything leaves the room.',
      studentDirections: [
        'Run clinic demo with scripted consent reminders',
        'Collect feedback using structured forms',
        'Write recommendation brief with short and long-term steps',
        'Confirm consent for sharing and storage',
        'Deliver brief to mentors and partners respectfully'
      ],
      teacherSetup: ['Invite mentors and families to clinic', 'Record feedback securely', 'Store consent artifacts responsibly'],
      evidence: ['Feedback synthesis', 'Recommendation brief'],
      successCriteria: ['I demonstrate prototypes with partner dignity first', 'I synthesize feedback into actionable recommendations', 'I share outcomes only with documented consent'],
      aiOptional: {
        toolUse: 'Draft recommendation summary from feedback notes',
        critique: 'Ensure AI summary preserves partner voice',
        noAIAlt: 'Use recommendation outline worksheet'
      }
    }
  ],
};
