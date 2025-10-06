import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import quantumGraffitiImage from '../../utils/hero/images/QuantumGraffitiLabs.jpeg';

export const quantum_graffiti_labsV2: ProjectShowcaseV2 = {
  id: 'quantum-graffiti-labs',
  version: '2.0.0',
  hero: {
    title: 'Quantum Graffiti Labs',
    tagline: 'Students design “keyed” street art that only unlocks for those who can decode it—while learning real cryptography and design ethics.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Computer Science', 'Mathematics', 'Visual Arts', 'Civics', 'Media Literacy'],
    image: quantumGraffitiImage
  },
  microOverview: [
    'Students explore classical/quantum‑inspired ciphers and trust in public space.',
    'Teams create visual codes and safe, permissioned street installations with unlock rituals.',
    'A public “Decode Walk” teaches crypto literacy and civic respect for shared spaces.'
  ],
  fullOverview:
    'This studio reframes graffiti as a lawful, permissioned literacy device. Students learn the math of secrecy (keys, entropy, one‑time pads) and quantum‑inspired ideas (no‑cloning, measurement limits) through analog puzzles and simple apps. Teams co‑design a visual coding language and produce removable, consented installations on campus or community‑approved walls using chalk paint, paste‑ups, or projection. A public Decode Walk invites neighbors to unlock messages with shared keys, driving conversations about privacy, safety, and speech in the commons.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Examine trust, secrecy, and ethics of public cryptography to ground studio norms. Teachers share cryptography stories showing trust and civic responsibility. Students debate speech ethics and document shared consent guardrails.',
      teacher: [
        'Share cryptography stories showing trust and civic responsibility',
        'Define legal boundaries and consent for public expression',
        'Model analog cipher techniques with hands-on decoding stations'
      ],
      students: [
        'Debate speech ethics and document shared consent guardrails',
        'Crack sample ciphers to understand keys and entropy',
        'Draft misuse mitigation plans with partner feedback'
      ],
      deliverables: ['Crypto ethics charter', 'Cipher practice notebook', 'Misuse mitigation list'],
      checkpoint: ['All sign legal and safety policies'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design key exchange rituals and secure permissions for legal installations. Teachers demonstrate key exchange protocols and secrecy principles. Students design decode ritual describing keys and access rules.',
      teacher: [
        'Demonstrate key exchange protocols and secrecy principles',
        'Coordinate site permissions with property owners and agencies',
        'Review safety gear requirements and cleanup obligations'
      ],
      students: [
        'Design decode ritual describing keys and access rules',
        'Scout approved installation sites documenting risks and assets',
        'Draft installation SOP and cleanup checklist for partners'
      ],
      deliverables: ['Site permission packet', 'Key exchange plan', 'Cleanup checklist'],
      checkpoint: ['Admin and partner sign-off complete'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Prototype visual language and decode flows to ensure readability before launch. Teachers critique visual language for readability and contrast. Students stencil and paste-up prototypes using removable materials.',
      teacher: [
        'Critique visual language for readability and contrast',
        'Coach teams on accessible color, icon, and typography choices',
        'Set structured peer decode test scripts with timers'
      ],
      students: [
        'Stencil and paste-up prototypes using removable materials',
        'Run peer decode tests capturing time and accuracy',
        'Revise cipher rules and signage based on test notes'
      ],
      deliverables: ['Design system sheet', 'Decode test log', 'Signage draft'],
      checkpoint: ['First decode test passes accessibility benchmark'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Audit security and accessibility to certify public readiness of installations. Teachers facilitate timed trials simulating community decode experience. Students measure decode times and adjust difficulty accordingly.',
      teacher: [
        'Facilitate timed trials simulating community decode experience',
        'Review contrast thresholds and lighting conditions with teams',
        'Confirm emergency plans and wayfinding signage coverage'
      ],
      students: [
        'Measure decode times and adjust difficulty accordingly',
        'Improve contrast, scale, and tactile guides for inclusivity',
        'Add wayfinding cues and emergency info to signage'
      ],
      deliverables: ['Security and accessibility audit report', 'Updated design system'],
      checkpoint: ['Readability and safety threshold met'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Produce consented installations using removable materials and documented safety roles. Teachers stage installation window with permits and neighbor notifications. Students install artwork with spotters managing pedestrian safety.',
      teacher: [
        'Stage installation window with permits and neighbor notifications',
        'Supervise PPE usage and spotter communication protocols',
        'Log permits, GPS coordinates, and cleanup obligations'
      ],
      students: [
        'Install artwork with spotters managing pedestrian safety',
        'Photograph artifacts and record coordinates for documentation',
        'Submit cleanup schedule and maintenance commitments'
      ],
      deliverables: ['Installation log', 'Geo-labeled photo set', 'Cleanup schedule'],
      checkpoint: ['Post-install safety sweep completed'],
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host Decode Walk teaching crypto literacy and collecting community insights. Teachers invite community members, press, and partners to walk. Students guide decode teams through installations kindly and clearly.',
      teacher: [
        'Invite community members, press, and partners to walk',
        'Manage route pacing, accessibility, and crowd safety',
        'Collect feedback surveys and learning metrics throughout'
      ],
      students: [
        'Guide decode teams through installations kindly and clearly',
        'Teach cryptography basics using plain-language storytelling',
        'Survey visitors and share toolkit link for continued learning'
      ],
      deliverables: ['Decode Walk map', 'Survey dataset'],
      checkpoint: ['Partner commitments to reuse documented'],
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Complete cleanup, legal debrief, and publish toolkit for future partners. Teachers verify cleanup proof and closure with property owners. Students submit cleanup documentation and signed confirmation forms.',
      teacher: [
        'Verify cleanup proof and closure with property owners',
        'Host legal debrief reviewing compliance and improvements',
        'Review final toolkit drafts for accuracy and access'
      ],
      students: [
        'Submit cleanup documentation and signed confirmation forms',
        'Write legal debrief summarizing impact and lessons learned',
        'Publish toolkit with instructions, safety forms, and next steps'
      ],
      deliverables: ['Cleanup record', 'Legal debrief document', 'Toolkit link'],
      checkpoint: ['All permissions closed out'],
      assignments: ['A5']
    }
  ],
  outcomes: {
    core: ['Design and run a legal, safe Decode Walk with measurable learning gains'],
    extras: [
      'Publish open design system',
      'Prototype a key‑exchange app',
      'Create consent + safety templates',
      'Produce short docs on trust in commons'
    ],
    audiences: ['City arts office', 'Neighborhood council', 'Libraries/museums', 'Civic tech groups']
  },
  materialsPrep: {
    coreKit: [
      'Removable chalk paint or paste‑ups',
      'Cardboard stencils and cutting mats',
      'High‑vis vests, gloves, eye protection',
      'Projector (night projection option)',
      'Phones with QR/cipher app'
    ],
    noTechFallback: ['Paper codes + clipboards', 'Chalk on approved pavements', 'Printable decode wheels'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Crypto 101 + Ethics Brief',
      summary: 'Students learn foundational ciphers and define ethical, legal constraints for installations. Students crack three cipher types and explain key mechanics. Teachers curate cipher practice set with varied difficulty.',
      studentDirections: [
        'Crack three cipher types and explain key mechanics',
        'Investigate trust and speech cases for discussion circle',
        'Draft shared ethics charter covering consent and safety',
        'Sign legal policy acknowledging boundaries and expectations',
        'Reflect on potential harms and mitigation strategies'
      ],
      teacherSetup: [
        'Curate cipher practice set with varied difficulty',
        'Share case studies on speech, trust, and graffiti',
        'Provide legal policy forms and review session'
      ],
      evidence: ['Cipher notebook', 'Signed policy'],
      successCriteria: ['I explain keys clearly', 'I honour legal policy', 'I identify harms to prevent'],
      checkpoint: 'Policy signed before any build'
    },
    {
      id: 'A2',
      title: 'Key Exchange + Site Plan',
      summary: 'Teams design key exchange ritual and secure permissions for safe Decode Walk. Students map route and document stakeholders requiring permission. Teachers provide permission templates and outreach checklist.',
      studentDirections: [
        'Map route and document stakeholders requiring permission',
        'Draft consent letters and communication scripts for partners',
        'Design key exchange ritual explaining unlock process',
        'Assign installation safety roles and backup contacts',
        'Compile permission packet for teacher and partner sign-off'
      ],
      teacherSetup: [
        'Provide permission templates and outreach checklist',
        'Pre-contact site owners and schedule walkthroughs',
        'Review legal notes and risk mitigations with admin'
      ],
      evidence: ['Permission packet', 'Key exchange plan'],
      successCriteria: ['I secure consent respectfully', 'I design safety roles clearly', 'I document plans partners trust'],
      aiOptional: { toolUse: 'Summarize permit steps', critique: 'Flag missing consent', noAIAlt: 'Peer legal review' }
    },
    {
      id: 'A3',
      title: 'Visual Language Usability Test',
      summary: 'Students prototype visual language and test cipher usability with peers. Students create removable stencils and paste-ups for cipher set. Teachers provide contrast and accessibility reference guides.',
      studentDirections: [
        'Create removable stencils and paste-ups for cipher set',
        'Run user tests timing decode accuracy and clarity',
        'Measure decode time against accessibility benchmark',
        'Revise contrast, scale, and instructions from feedback',
        'Synthesize findings and update wayfinding signage plan',
        'Assemble PPE checklists for upcoming installations'
      ],
      teacherSetup: [
        'Provide contrast and accessibility reference guides',
        'Set usability test scripts with timers and roles',
        'Coach revision cycles using data and peer critique',
        'Check PPE readiness for future installation days'
      ],
      evidence: ['Design system sheet', 'Usability notes'],
      successCriteria: ['I meet legibility targets', 'I reduce decode time', 'I justify revisions with data'],
      aiOptional: { toolUse: 'Suggest contrast palettes', critique: 'Flag low readability', noAIAlt: 'Blind decode test' }
    },
    {
      id: 'A4',
      title: 'Decode Walk + Toolkit',
      summary: 'Teams host the Decode Walk, teach crypto basics, and publish toolkit. Students guide visitors along route using consented access plan. Teachers invite press, partners, and community leaders to event.',
      studentDirections: [
        'Guide visitors along route using consented access plan',
        'Teach cryptography basics through plain-language storytelling',
        'Collect surveys and quotes capturing learning impact',
        'Publish toolkit with instructions, safety forms, and keys',
        'Thank partners publicly and document commitments',
        'Capture metrics and photos for final report'
      ],
      teacherSetup: [
        'Invite press, partners, and community leaders to event',
        'Arrange route supervision, accessibility, and crowd safety',
        'Print guides and ensure emergency contacts posted',
        'Review crowd safety and de-escalation plan beforehand'
      ],
      evidence: ['Decode Walk map', 'Toolkit link'],
      successCriteria: ['I guide visitors confidently', 'I teach crypto responsibly', 'I share resources teams can reuse'],
      aiOptional: { toolUse: 'Summarize survey results', critique: 'Detect sampling bias', noAIAlt: 'Manual tally board' }
    },
    {
      id: 'A5',
      title: 'Impact + Legal Debrief',
      summary: 'Students document impact, finalize legal closure, and plan next steps. Students collect partner quotes documenting impact and trust. Teachers provide debrief template and reflection prompts.',
      studentDirections: [
        'Collect partner quotes documenting impact and trust',
        'Write legal debrief summarizing compliance and lessons',
        'Submit cleanup proof photos and signed confirmations',
        'Propose next-step collaborations and improvements',
        'Share personal reflection connecting crypto to civic life'
      ],
      teacherSetup: [
        'Provide debrief template and reflection prompts',
        'Collect cleanup records and confirm permission closure',
        'Schedule reflection circle with partners invited'
      ],
      evidence: ['Legal debrief document', 'Cleanup record'],
      successCriteria: ['I document impact clearly', 'I close permissions safely', 'I recommend future improvements']
    }
  ],
};
