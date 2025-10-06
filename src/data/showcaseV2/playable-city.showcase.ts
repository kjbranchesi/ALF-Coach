import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import playable_cityImage from '../../utils/hero/images/PlayableCity.jpg';
export const playable_cityV2: ProjectShowcaseV2 = {
  id: 'playable-city',
  version: '2.0.0',
  hero: {
    title: 'Playable City: Designing Joy in Public Space',
    tagline: 'Students turn ordinary streets into joyful, inclusive play experiences.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Game Design', 'Urban Planning', 'Art & Design', 'Computer Science', 'Psychology', 'Architecture'],
    image: playable_cityImage
  },
  microOverview: [
    'Students study how play shapes community connection, mental health, and public space equity.',
    'They prototype playful installations that invite strangers to interact, collaborate, and smile.',
    'Teams stage a playable street festival, gather feedback, and pitch permanent installations.'
  ],
  fullOverview:
    'Learners become urban play designers who merge civic research, behavioral psychology, and experiential prototyping. They listen to residents, map space usage, and design interventions that spark safe, inclusive play. Through rapid iteration and public showcases, students capture evidence that joyful design is essential infrastructure.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore the science of play and observe local public spaces to find joyful gaps. Ask, "Where does our neighborhood feel serious when it could feel playful?" Teachers share global playable city examples. Students capture space usage through annotated sketches.',
      teacher: [
        'Share global playable city examples',
        'Lead observational walk audits',
        'Facilitate community storytelling circle'
      ],
      students: [
        'Capture space usage through annotated sketches',
        'Interview residents about joyful moments',
        'Synthesize observations into opportunity map'
      ],
      deliverables: ['Observation sketchbook', 'Resident quote gallery', 'Opportunity map'],
      checkpoint: ['Teacher approves opportunity focus'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Define design principles and prototype strategy so testing stays intentional. Prompt teams with "What must every visitor feel within the first minute?" Teachers model rapid game mechanic ideation. Students draft playable design principles.',
      teacher: [
        'Model rapid game mechanic ideation',
        'Introduce accessibility design toolkit',
        'Coach teams on prototyping logistics'
      ],
      students: [
        'Draft playable design principles',
        'Storyboard possible interventions',
        'Schedule prototype testing sessions'
      ],
      deliverables: ['Design principles manifesto', 'Prototype storyboards', 'Testing schedule'],
      checkpoint: ['Teacher signs test plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Prototype, playtest, and iterate interventions in public space to see what sparks connection. Keep asking, "Who is still on the sidelines and why?" Teachers coordinate material sourcing and transport. Students build low-fidelity play installations.',
      teacher: [
        'Coordinate material sourcing and transport',
        'Ensure permits and safety protocols',
        'Guide reflection after each playtest'
      ],
      students: [
        'Build low-fidelity play installations',
        'Conduct playtests with community',
        'Capture participation and joy metrics'
      ],
      deliverables: ['Prototype photos', 'Playtest data logs', 'Iteration notes'],
      checkpoint: ['Teacher verifies safety checklists'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Fabricate high-fidelity installations and design the festival experience for real-world durability. Ask, "What will fail first when hundreds of people interact with this?" Teachers coach fabrication and finishing techniques. Students construct durable final installations.',
      teacher: [
        'Coach fabrication and finishing techniques',
        'Coordinate multisensory accessibility features',
        'Assist with tech integration needs'
      ],
      students: [
        'Construct durable final installations',
        'Integrate lighting, sound, or sensors',
        'Develop festival run-of-show'
      ],
      deliverables: ['Installation build log', 'Accessibility checklist', 'Festival operations plan'],
      checkpoint: ['Teacher signs safety inspection'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host the playable city festival and capture impact to show joy as infrastructure. Challenge teams with "What evidence will city leaders need to invest for real?" Teachers manage event logistics with city partners. Students facilitate installations with visitors.',
      teacher: [
        'Manage event logistics with city partners',
        'Coordinate volunteer training',
        'Lead data capture strategy'
      ],
      students: [
        'Facilitate installations with visitors',
        'Collect feedback and observation data',
        'Interview participants for testimonials'
      ],
      deliverables: ['Event feedback dashboard', 'Photo and video library', 'Testimonial transcripts'],
      checkpoint: ['Attendees highlight joy and inclusion'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Pitch permanent installations and hand off assets so the city keeps playing. Anchor proposals in "Who maintains the joy a year from now and how do we help them?" Teachers facilitate proposal writing workshops. Students develop permanent installation proposals.',
      teacher: [
        'Facilitate proposal writing workshops',
        'Connect students with urban planners',
        'Advise on maintenance partnerships'
      ],
      students: [
        'Develop permanent installation proposals',
        'Draft maintenance and staffing plans',
        'Deliver pitches to city decision makers'
      ],
      deliverables: ['Installation proposal', 'Maintenance handbook', 'Pitch deck'],
      checkpoint: ['Teacher reviews maintenance plan'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Design and stage a joyful playable city festival with data-backed impact'],
    extras: [
      'Produce festival highlight reel',
      'Design bilingual play instructions',
      'Develop teacher toolkit for classroom play',
      'Launch community play ambassador program'
    ],
    audiences: ['City arts council', 'Neighborhood residents', 'Youth organizations', 'Public health advocates']
  },
  materialsPrep: {
    coreKit: [
      'Modular building materials',
      'Paints and weatherproof sealants',
      'Microcontrollers and LED strips',
      'Portable sound equipment',
      'Evaluation clipboards and clickers',
      'Insurance and permit packets'
    ],
    noTechFallback: ['Cardboard mockups', 'Chalk and tape kits', 'Paper feedback forms'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Play Observation Field Notes',
      summary: 'Begin by watching the city like play anthropologists. Students sketch how people use space, capture quotes about joy or boredom, and surface barriers that keep play away. Teachers model observation protocols, facilitate critique circles, and ensure insights are rooted in respectful listening.',
      studentDirections: [
        'Observe public space behavior patterns',
        'Sketch how people interact',
        'Record quotes about joy or boredom',
        'Identify barriers to playful moments',
        'Share insights in studio critique'
      ],
      teacherSetup: [
        'Model observation techniques',
        'Provide sketch templates',
        'Facilitate critique circle',
        'Highlight inclusive observation norms'
      ],
      evidence: ['Observation sketches', 'Insight summary'],
      successCriteria: ['I capture player behaviors accurately in my notes', 'I ground insights in evidence from observations', 'I incorporate critique feedback into the next iteration'],
      checkpoint: 'Teacher verifies opportunity statements',
      aiOptional: {
        toolUse: 'Transcribe recorded quotes',
        critique: 'Ensure quotes remain accurate',
        noAIAlt: 'Use partner transcription support'
      }
    },
    {
      id: 'A2',
      title: 'Playable Concept Blueprint',
      summary: 'Design blueprint week sets intentional guardrails for experimentation. Students craft design principles, storyboard interactive experiences, and outline safety and accessibility checks for every test. Teachers share exemplars, review logistics, and confirm blueprints before materials leave the studio.',
      studentDirections: [
        'Write three design principles',
        'Storyboard interactive experience',
        'Organize prototyping materials and roles',
        'Outline safety and accessibility checks',
        'Submit blueprint for approval'
      ],
      teacherSetup: [
        'Share blueprint exemplars',
        'Provide storyboard frames',
        'Review accessibility checklist',
        'Offer materials sourcing guidance'
      ],
      evidence: ['Design blueprint', 'Storyboard set'],
      successCriteria: ['I apply our design principles when making decisions', 'I create storyboards that communicate flow clearly', 'I document a safety plan that feels thorough and practical'],
      checkpoint: 'Teacher approves blueprint before prototyping',
      aiOptional: {
        toolUse: 'Generate color palette suggestions',
        critique: 'Check contrast accessibility',
        noAIAlt: 'Use accessibility color chart'
      }
    },
    {
      id: 'A3',
      title: 'Playtest Sprint Log',
      summary: 'Playtest sprints bring community voices directly into the design. Students host sessions, track engagement metrics, capture feelings, and prioritize iterations anchored in inclusion. Teachers schedule windows, provide measurement templates, and lead debriefs that turn feedback into actionable changes.',
      studentDirections: [
        'Run playtest with community',
        'Record engagement metrics',
        'Capture user quotes and feelings',
        'Prioritize iteration tasks',
        'Update prototype accordingly'
      ],
      teacherSetup: [
        'Schedule playtest windows',
        'Provide metric tracking sheet',
        'Support debrief circles',
        'Supply iteration planning template'
      ],
      evidence: ['Playtest log', 'Iteration plan'],
      successCriteria: ['I track metrics that show participation across groups', 'I use feedback to shape revisions and next steps', 'I build plans that target inclusivity for different abilities'],
      checkpoint: 'Teacher reviews iteration plan',
      aiOptional: {
        toolUse: 'Summarize feedback themes',
        critique: 'Ensure AI captures nuance',
        noAIAlt: 'Use sticky note clustering'
      }
    },
    {
      id: 'A4',
      title: 'Playable Festival Pitch',
      summary: 'The playable festival pitch moves joy into policy conversations. Students craft story-driven decks, facilitate installations, collect feedback, and secure commitments for permanent adoption. Teachers orchestrate logistics, coach storytelling, and document pledges so the city keeps playing after the festival.',
      studentDirections: [
        'Craft story-driven pitch deck',
        'Facilitate festival installation',
        'Collect guest feedback live',
        'Request commitments from partners',
        'Deliver proposal to city leaders'
      ],
      teacherSetup: [
        'Coordinate festival logistics',
        'Provide pitch coaching',
        'Invite city arts representatives',
        'Document commitments with forms'
      ],
      evidence: ['Pitch deck', 'Commitment log', 'Festival media package'],
      successCriteria: ['I pitch the experience by highlighting community joy and impact', 'I secure commitments that feel concrete and trackable', 'I produce media assets that tell the story effectively'],
      checkpoint: 'Teacher confirms commitments recorded',
      aiOptional: {
        toolUse: 'Draft press release teaser',
        critique: 'Check tone invites community',
        noAIAlt: 'Use provided press template'
      }
    }
  ],
};
