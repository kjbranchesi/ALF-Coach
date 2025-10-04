import type { ProjectShowcaseV2 } from '../../types/showcaseV2';

export const quantum_graffiti_labsV2: ProjectShowcaseV2 = {
  id: 'quantum-graffiti-labs',
  version: '2.0.0',
  hero: {
    title: 'Quantum Graffiti Labs',
    tagline: 'Students design “keyed” street art that only unlocks for those who can decode it—while learning real cryptography and design ethics.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Computer Science', 'Mathematics', 'Visual Arts', 'Civics', 'Media Literacy']
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
      focus: 'Trust, secrecy, and ethics of public expression.',
      teacher: ['Launch crypto stories', 'Set legal boundaries', 'Model analog ciphers', 'Discuss harm scenarios'],
      students: ['Discuss speech ethics', 'Crack simple codes', 'Draft “consent” norms', 'Propose misuse mitigations'],
      deliverables: ['Crypto ethics charter', 'Cipher notebook', 'Harm mitigation list'],
      checkpoint: ['All sign legal/safety policies'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Keys, exchange, and site permission workflow.',
      teacher: ['Demonstrate key exchange', 'Secure wall permissions', 'Review safety gear', 'Draft cleanup plan'],
      students: ['Design key ritual', 'Scout legal sites', 'Draft install SOP', 'List cleanup steps'],
      deliverables: ['Site permission packet', 'Key exchange plan', 'Cleanup checklist'],
      checkpoint: ['Admin/partner sign‑off complete'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Prototype visual language and decode flows in studio.',
      teacher: ['Critique readability', 'Coach color contrast', 'Set test scripts', 'Check PPE readiness'],
      students: ['Stencil/paste‑up tests', 'Run peer decode tests', 'Revise cipher rules', 'Prepare signage'],
      deliverables: ['Design system sheet', 'Decode test notes', 'Signage draft'],
      checkpoint: ['First decode test passes'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Security & accessibility audit for public readability.',
      teacher: ['Facilitate timed trials', 'Review contrast thresholds', 'Validate wayfinding', 'Confirm emergency plan'],
      students: ['Measure decode time', 'Improve contrast', 'Add wayfinding cues', 'Review emergency protocol'],
      deliverables: ['Audit report', 'Updated design system'],
      checkpoint: ['Readability threshold met'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Produce final, removable installations with consent.',
      teacher: ['Stage install window', 'Supervise PPE use', 'Document permits', 'Coordinate spotters'],
      students: ['Install with spotters', 'Photograph artifacts', 'Record GPS + label', 'File cleanup schedule'],
      deliverables: ['Install log', 'Geo‑labeled photos', 'Cleanup schedule'],
      checkpoint: ['Post‑install safety sweep']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host Decode Walk and collect community learning data.',
      teacher: ['Invite community', 'Manage routes', 'Collect feedback forms', 'Capture learning metrics'],
      students: ['Guide decode teams', 'Teach crypto basics', 'Share toolkit link', 'Survey visitors'],
      deliverables: ['Decode Walk map', 'Survey dataset'],
      checkpoint: ['Partner commitments to reuse']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Cleanup, legal debrief, and toolkit publication.',
      teacher: ['Verify cleanup proof', 'Host legal debrief', 'Review final toolkit'],
      students: ['Submit cleanup proof', 'Write debrief', 'Publish toolkit v1', 'Propose next steps'],
      deliverables: ['Cleanup record', 'Legal debrief doc', 'Toolkit link'],
      checkpoint: ['All permissions closed out'],
      assignments: ['A5']
    }
  ],
  outcomes: {
    core: ['Run a legal, safe Decode Walk with measurable learning gains'],
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
    safetyEthics: ['Written site permissions', 'PPE for install', 'No permanent or illegal tagging']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Crypto 101 + Ethics Brief',
      summary: 'Learn ciphers and define legal, ethical constraints.',
      studentDirections: ['Crack three ciphers', 'Explain a key', 'Draft ethics rule', 'Sign policy', 'Reflect on trust'],
      teacherSetup: ['Curate cipher set', 'Share case studies', 'Provide policy forms'],
      evidence: ['Cipher notebook', 'Signed policy'],
      successCriteria: ['I explain keys', 'I follow policy', 'I cite harms'],
      checkpoint: 'Policy signed before any build'
    },
    {
      id: 'A2',
      title: 'Key Exchange + Site Plan',
      summary: 'Design decode ritual and secure permissions.',
      studentDirections: ['Map route', 'List stakeholders', 'Draft consent letter', 'Define key ritual', 'Plan safety roles'],
      teacherSetup: ['Provide templates', 'Pre‑contact sites', 'Review legal notes'],
      evidence: ['Permission packet', 'Key plan'],
      successCriteria: ['I get consent', 'I design for safety', 'I document plan'],
      aiOptional: { toolUse: 'Summarize permit steps', critique: 'Flag missing consent', noAIAlt: 'Peer legal review' }
    },
    {
      id: 'A3',
      title: 'Visual Language Usability Test',
      summary: 'Prototype and test cipher readability.',
      studentDirections: ['Create stencils', 'Run user test', 'Measure decode time', 'Revise contrast', 'Record insights', 'Improve wayfinding'],
      teacherSetup: ['Provide contrast guide', 'Set test scripts', 'Coach revisions', 'Check accessibility'],
      evidence: ['Design system sheet', 'Usability notes'],
      successCriteria: ['I meet legibility', 'I improve speed', 'I justify changes'],
      aiOptional: { toolUse: 'Suggest contrast palettes', critique: 'Flag low readability', noAIAlt: 'Blind decode test' }
    },
    {
      id: 'A4',
      title: 'Decode Walk + Toolkit',
      summary: 'Host public walk and publish how‑to.',
      studentDirections: ['Guide visitors', 'Teach basics', 'Collect feedback', 'Publish toolkit', 'Thank partners', 'Capture metrics'],
      teacherSetup: ['Invite press', 'Arrange routes', 'Print guides', 'Review crowd safety'],
      evidence: ['Decode map', 'Toolkit link'],
      successCriteria: ['I teach clearly', 'I ensure safety', 'I share resources'],
      aiOptional: { toolUse: 'Summarize survey results', critique: 'Detect sampling bias', noAIAlt: 'Manual tally board' }
    },
    {
      id: 'A5',
      title: 'Impact + Legal Debrief',
      summary: 'Reflect on impact and finalize consent and cleanup records.',
      studentDirections: ['Collect partner quotes', 'Write debrief', 'Submit cleanup proof', 'Propose next steps', 'Share reflection'],
      teacherSetup: ['Provide debrief template', 'Collect records', 'Schedule reflection circle'],
      evidence: ['Debrief doc', 'Cleanup record'],
      successCriteria: ['I document impact', 'I close safely', 'I suggest improvements']
    }
  ],
  polish: {
    microRubric: [
      'Legal and safety compliance',
      'Readable, accessible visual language',
      'Accurate crypto concepts',
      'Respectful, engaging public event'
    ],
    checkpoints: ['Permission approvals logged', 'Usability threshold met', 'Post‑event debrief filed'],
    tags: ['cs', 'math', 'arts']
  },
  planningNotes: 'Obtain written site permissions two weeks prior; require removable materials and documented cleanup proof; coordinate community routes with safety officer.'
};
