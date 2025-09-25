import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import assistive_techImage from '../../utils/hero/images/AccessAbilityTech.jpeg';
export const assistive_techV2: ProjectShowcaseV2 = {
  id: 'assistive-tech',
  version: '2.0.0',
  hero: {
    title: 'Everyday Innovations: Designing Tools for Dignity',
    tagline: 'Students co-create assistive devices that restore independence for community partners.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Engineering', 'Technology', 'Health Sciences', 'Mathematics', 'Social Studies', 'Art & Design'],
    image: assistive_techImage
  },
  microOverview: [
    'Students partner with disability advocates to understand daily barriers and access needs.',
    'They prototype assistive devices using rapid fabrication, testing fit, function, and dignity.',
    'Teams deliver polished solutions alongside care instructions, ethics briefings, and next steps.'
  ],
  fullOverview:
    'Learners become human-centered engineers who design with, not for, their partners. They study universal design principles, conduct empathy interviews, and translate insights into technical specifications. Iterative prototyping and user testing ensure every device honors safety, aesthetics, and lived experience. Final showcases celebrate mutual learning and create pathways for ongoing support.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore disability justice and human-centered engineering norms.',
      teacher: [
        'Share disability justice framework',
        'Model asset-based interview techniques',
        'Establish inclusive design agreements'
      ],
      students: [
        'Reflect on biases using journaling prompts',
        'Map community partners and expertise',
        'Practice active listening roleplays'
      ],
      deliverables: ['Design ethics pledge', 'Community asset map', 'Interview practice notes'],
      checkpoint: ['Students articulate design commitments'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Co-create design briefs with partner stakeholders.',
      teacher: [
        'Facilitate co-design kickoff meetings',
        'Model translating interviews into needs',
        'Curate exemplar design briefs'
      ],
      students: [
        'Conduct guided interviews with partners',
        'Document functional and emotional needs',
        'Draft measurable success metrics'
      ],
      deliverables: ['Partner profile', 'Needs statement matrix', 'Design brief v1'],
      checkpoint: ['Partner signs off on brief'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Prototype, test, and iterate assistive concepts with partners.',
      teacher: [
        'Coach fabrication tool safety',
        'Run daily stand-ups for blockers',
        'Coordinate user testing logistics'
      ],
      students: [
        'Build low-fidelity prototypes quickly',
        'Test devices with partner feedback',
        'Log adjustments and insights systematically'
      ],
      deliverables: ['Prototype gallery', 'Testing feedback log', 'Iteration backlog'],
      checkpoint: ['Teacher observes safe device trials'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Engineer high-fidelity devices and validate performance.',
      teacher: [
        'Support advanced fabrication techniques',
        'Model tolerance testing routines',
        'Connect teams with clinical advisors'
      ],
      students: [
        'Fabricate refined device version',
        'Conduct stress and safety tests',
        'Document maintenance instructions'
      ],
      deliverables: ['Device vfinal', 'Test certification checklist', 'Care manual draft'],
      checkpoint: ['Teacher clears device for showcase'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host inclusive product launch and training sessions.',
      teacher: [
        'Coordinate accessible showcase logistics',
        'Coach storytelling with partners',
        'Invite media and advocacy groups'
      ],
      students: [
        'Co-present story with partner voice',
        'Demonstrate device setup and training',
        'Collect testimonials and improvement ideas'
      ],
      deliverables: ['Launch script', 'Training checklist', 'Testimonial video clips'],
      checkpoint: ['Partners confirm comfort using device'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Plan long-term support and open-source documentation.',
      teacher: [
        'Facilitate sustainability planning workshop',
        'Review IP and sharing considerations',
        'Connect teams to maker community'
      ],
      students: [
        'Publish open-source build guide',
        'Schedule follow-up support check-ins',
        'Propose next iteration roadmap'
      ],
      deliverables: ['Open-source documentation', 'Support plan', 'Iteration proposal'],
      checkpoint: ['Teacher reviews support commitments'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Deliver co-designed assistive devices that pass partner usability tests'],
    extras: [
      'Build open-source fabrication library',
      'Host accessibility awareness workshop',
      'Produce mini documentary featuring partners',
      'Prototype modular upgrade kits'
    ],
    audiences: ['Partner families', 'Local disability advocates', 'Health sciences department', 'Community makerspaces']
  },
  materialsPrep: {
    coreKit: [
      '3D printers and filament',
      'Laser cutter access',
      'Microcontrollers and sensors',
      'Adaptive grips and straps',
      'Fabrication hand tools',
      'User testing feedback forms'
    ],
    noTechFallback: ['Cardboard prototyping kits', 'Velcro and foam materials', 'Paper-based design templates'],
    safetyEthics: ['Follow lab PPE policies', 'Obtain partner consent for testing', 'Respect boundaries around lived experiences']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Design Equity Primer',
      summary: 'Students surface personal assumptions and align on inclusive design commitments.',
      studentDirections: [
        'Complete disability justice reading notes',
        'Journal three personal design biases',
        'Share takeaways in circle dialogue',
        'Draft team inclusive design norms',
        'Sign design ethics pledge'
      ],
      teacherSetup: [
        'Curate multimedia disability voices',
        'Facilitate circle protocol',
        'Provide reflection sentence stems',
        'Model vulnerability through personal story'
      ],
      evidence: ['Reflection journal entry', 'Signed design pledge'],
      successCriteria: ['I reference voices respectfully', 'I name growth commitments', 'I agree to shared norms'],
      checkpoint: 'Teacher reviews pledges for specificity',
      aiOptional: {
        toolUse: 'Summarize reading in plain language',
        critique: 'Check summary centers human voices',
        noAIAlt: 'Use peer summary exchange'
      }
    },
    {
      id: 'A2',
      title: 'Co-Design Brief',
      summary: 'Teams translate partner interviews into actionable design briefs.',
      studentDirections: [
        'Transcribe interview highlights',
        'Cluster needs into themes',
        'Write measurable design goals',
        'Sketch concept directions quickly',
        'Review brief with partner'
      ],
      teacherSetup: [
        'Provide brief templates',
        'Model translating quotes into specs',
        'Join partner review meetings',
        'Offer feedback on scope realism'
      ],
      evidence: ['Partner-approved design brief', 'Concept sketch sheet'],
      successCriteria: ['Goals echo partner voice', 'Constraints feel realistic', 'Sketches communicate intent'],
      checkpoint: 'Teacher signs brief before prototyping',
      aiOptional: {
        toolUse: 'Draft user story from quotes',
        critique: 'Ensure voice stays authentic',
        noAIAlt: 'Use team storytelling workshop'
      },
      safety: ['Honor confidentiality requests in documentation']
    },
    {
      id: 'A3',
      title: 'Prototype Testing Lab',
      summary: 'Students iterate assistive prototypes using structured partner feedback.',
      studentDirections: [
        'Build prototype addressing top need',
        'Test device with partner guidance',
        'Log comfort, safety, usability notes',
        'Prioritize adjustments in backlog',
        'Share iteration plan with partner'
      ],
      teacherSetup: [
        'Schedule protected testing windows',
        'Review safety protocols beforehand',
        'Provide feedback logging templates',
        'Coach teams through difficult feedback'
      ],
      evidence: ['Testing feedback log', 'Iteration backlog plan'],
      successCriteria: ['Feedback captured verbatim', 'Next steps feel achievable', 'Safety checks are documented'],
      checkpoint: 'Teacher approves iteration plan',
      aiOptional: {
        toolUse: 'Organize feedback into themes',
        critique: 'Verify AI grouping matches partner priorities',
        noAIAlt: 'Use color-coded sticky clustering'
      },
      safety: ['Stop testing if discomfort emerges']
    },
    {
      id: 'A4',
      title: 'Device Launch + Support Kit',
      summary: 'Teams deliver final devices with training and sustainability plans.',
      studentDirections: [
        'Finalize device and safety checklist',
        'Co-write care and maintenance guide',
        'Rehearse showcase story with partner',
        'Host training session for caregivers',
        'Document follow-up schedule'
      ],
      teacherSetup: [
        'Arrange accessible showcase space',
        'Provide recording equipment',
        'Invite local assistive tech mentors',
        'Review care guides for clarity'
      ],
      evidence: ['Care guide', 'Showcase recording', 'Support schedule'],
      successCriteria: ['Instructions feel user-friendly', 'Partner feels empowered', 'Next steps are clear'],
      checkpoint: 'Teacher confirms partner receives kit',
      aiOptional: {
        toolUse: 'Draft quick-start card layout',
        critique: 'Check language stays respectful',
        noAIAlt: 'Use provided quick-start template'
      }
    }
  ],
  polish: {
    microRubric: [
      'Device operates safely and reliably',
      'Partner voice leads the story',
      'Documentation uses plain, inclusive language',
      'Support plan names accountable owners'
    ],
    checkpoints: [
      'Partner brief approved before prototyping',
      'Safety checklist signed before showcase',
      'Support plan delivered after launch'
    ],
    tags: ['HCD', 'STEM', 'CARE']
  },
  planningNotes: 'Align with occupational therapists early to validate safety constraints and equipment access.'
};
