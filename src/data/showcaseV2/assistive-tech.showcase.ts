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
      focus: 'Explore disability justice and human-centered engineering norms to anchor co-design partnerships. Ask, "What everyday moments already demand a workaround, and how does that feel for our partners?" Teachers share disability justice framework. Students reflect on biases using journaling prompts.',
      teacher: [
        'Share disability justice framework',
        'Model asset-based interview techniques',
        'Establish inclusive design agreements'
      ],
      students: [
        'Reflect on biases using journaling prompts',
        'Map community partners and expertise',
        'Lead active listening roleplays with peers'
      ],
      deliverables: ['Design ethics pledge', 'Community asset map', 'Interview practice notes'],
      checkpoint: ['Students articulate design commitments'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Co-create design briefs with partner stakeholders so specs mirror lived experience. Pose prompts such as "What will success feel like for our partner at 7 a.m. on a busy day?" Teachers facilitate co-design kickoff meetings. Students conduct guided interviews with partners.',
      teacher: [
        'Facilitate co-design kickoff meetings',
        'Model translating interviews into needs',
        'Curate exemplar design briefs'
      ],
      students: [
        'Conduct guided interviews with partners',
        'Capture functional and emotional needs in shared notes',
        'Draft measurable success metrics'
      ],
      deliverables: ['Partner profile', 'Needs statement matrix', 'Design brief v1'],
      checkpoint: ['Partner signs off on brief'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Prototype, test, and iterate assistive concepts with partners to capture authentic feedback. Keep asking, "How will this prototype honor their independence during real routines?" Teachers coach fabrication tool safety. Students build low-fidelity prototypes quickly.',
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
      focus: 'Engineer high-fidelity devices and validate performance to prove everyday reliability. Center questions like "What happens if this device is dropped in a crowded hallway?" Teachers coach teams through advanced fabrication techniques. Students fabricate refined device version.',
      teacher: [
        'Coach teams through advanced fabrication techniques',
        'Model tolerance testing routines',
        'Connect teams with clinical advisors'
      ],
      students: [
        'Fabricate refined device version',
        'Conduct stress and safety tests',
        'Compile maintenance instructions into a shared guide'
      ],
      deliverables: ['Device vfinal', 'Test certification checklist', 'Care manual draft'],
      checkpoint: ['Teacher clears device for showcase'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host inclusive product launch and training sessions that empower partners to use devices confidently. Invite prompts such as "Which part of the story should our partner narrate themselves?" Teachers coordinate accessible showcase logistics. Students co-present story with partner voice.',
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
      focus: 'Plan long-term support and open-source documentation so solutions stay maintainable after showcase. Plan with "Who maintains support once the school year ends?" so commitments stick. Teachers facilitate sustainability planning workshop. Students publish open-source build guide.',
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
    core: ['Co-design assistive devices that pass partner usability tests'],
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'Design Equity Primer',
      summary: 'Launch with reflective groundwork that centers disability justice and partner leadership. Students analyze justice frameworks, surface personal biases, and codify team norms that will guide interviews. Teachers curate multimedia stories and model vulnerability so design pledges emerge from an honest place.',
      studentDirections: [
        'Analyze disability justice readings and take notes',
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
      successCriteria: ['I reference our partners\' voices respectfully in my notes', 'I name personal growth commitments for inclusive design', 'I agree to shared design norms and honour them'],
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
      summary: 'Co-design briefs translate partner interviews into actionable specs without losing voice. Students transcribe conversations, cluster needs into themes, and sketch quick concept directions before validating goals with partners. Teachers provide templates, scope guardrails, and review support so briefs stay ambitious yet realistic.',
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
      successCriteria: ['I write design goals that echo partner voices', 'I capture constraints that feel realistic and ethical', 'I sketch concepts that communicate intent clearly to partners'],
      checkpoint: 'Teacher signs brief before prototyping',
      aiOptional: {
        toolUse: 'Draft user story from quotes',
        critique: 'Ensure voice stays authentic',
        noAIAlt: 'Use team storytelling workshop'
      },
    },
    {
      id: 'A3',
      title: 'Prototype Testing Lab',
      summary: 'Prototype testing labs turn raw feedback into design leaps partners can feel. Students build successive versions, capture comfort and safety data, and prioritize adjustments inside a living iteration backlog. Teachers secure protected testing windows, coach difficult feedback moments, and monitor safety protocols.',
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
      successCriteria: ['I capture feedback verbatim with context', 'I plan achievable next steps that partners endorse', 'I document safety checks and comfort notes for every test'],
      checkpoint: 'Teacher approves iteration plan',
      aiOptional: {
        toolUse: 'Organize feedback into themes',
        critique: 'Verify AI grouping matches partner priorities',
        noAIAlt: 'Use color-coded sticky clustering'
      },
    },
    {
      id: 'A4',
      title: 'Device Launch + Support Kit',
      summary: 'The launch and support kit hand off devices with confidence and care. Students finalize builds, co-write maintenance guides, rehearse stories with partners, and publish follow-up schedules. Teachers orchestrate accessible showcase logistics and mentor teams so every caregiver leaves with clear next steps.',
      studentDirections: [
        'Finalize device and safety checklist',
        'Co-write care and maintenance guide',
        'Rehearse showcase story with partner',
        'Host training session for caregivers',
        'Publish follow-up schedule with partners'
      ],
      teacherSetup: [
        'Arrange accessible showcase space',
        'Provide recording equipment',
        'Invite local assistive tech mentors',
        'Review care guides for clarity'
      ],
      evidence: ['Care guide', 'Showcase recording', 'Support schedule'],
      successCriteria: ['I write instructions that feel user-friendly to partners', 'I deliver support that helps partners feel empowered and informed', 'I outline next steps and support commitments clearly'],
      checkpoint: 'Teacher confirms partner receives kit',
      aiOptional: {
        toolUse: 'Draft quick-start card layout',
        critique: 'Check language stays respectful',
        noAIAlt: 'Use provided quick-start template'
      }
    }
  ],
};
