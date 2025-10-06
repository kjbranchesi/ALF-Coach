import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import accessability_aiImage from '../../utils/hero/images/AIAccessibilityAssistant.jpg';
export const accessability_aiV2: ProjectShowcaseV2 = {
  id: 'accessability-ai',
  version: '2.0.0',
  hero: {
    title: 'AccessAbility AI: Captions, Alt-Text, and Simplified Reading',
    tagline: 'Students build inclusive media pipelines that keep human editors in the loop.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Special Education', 'English Language Arts', 'Computer Science', 'Digital Media', 'Accessibility Studies', 'Ethics'],
    image: accessability_aiImage
  },
  microOverview: [
    'Students audit school media for accessibility gaps alongside disabled consultants and educators.',
    'They train AI workflows to draft captions, alt-text, and simplified reading supports responsibly.',
    'Teams deliver polished accessibility kits, editorial guardrails, and training for content creators.'
  ],
  fullOverview:
    'Learners become accessibility technologists who pair artificial intelligence (AI) efficiency with human judgment. They study disability justice, benchmark current media, and prototype human‑in‑the‑loop pipelines that maintain voice and accuracy. Their work leaves the school with sustainable systems and empowered storytellers.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Ground the team in disability justice and media accessibility standards so every workflow begins with respect. Invite prompts such as "Where does our own media still shut people out and why?" Teachers invite disabled creators for panel. Students reflect on personal media habits.',
      teacher: [
        'Invite disabled creators for panel',
        'Introduce Web Content Accessibility Guidelines (WCAG)',
        'Model gap analysis workflow'
      ],
      students: [
        'Reflect on personal media habits',
        'Audit sample media for barriers',
        'Draft accessibility commitments'
      ],
      deliverables: ['Reflection journal', 'Gap analysis matrix', 'Team accessibility charter'],
      checkpoint: ['Teacher reviews commitments'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design AI-assisted accessibility pipeline and editorial safeguards that keep human editors in control of voice. Co-create scenario questions like "What happens if the AI rewrites a student\'s dialect?" so safeguards feel real. Teachers demo captioning and alt-text tools. Students select media assets for pilots.',
      teacher: [
        'Demo captioning and alt-text tools',
        'Guide bias and error brainstorming',
        'Coach teams to scope pilot media sets'
      ],
      students: [
        'Select media assets for pilots',
        'Design AI plus human review workflow',
        'Define quality assurance checklist'
      ],
      deliverables: ['Pipeline flowchart', 'Pilot media inventory', 'QA checklist'],
      checkpoint: ['Teacher signs pipeline plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Generate AI drafts and refine them with human editors to prove the workflow protects dignity. Keep asking, "Would the featured storyteller feel seen in this version?" during review huddles. Teachers provide tool training sessions. Students generate captions and alt-text drafts.',
      teacher: [
        'Provide tool training sessions',
        'Monitor for accuracy and respect',
        'Host daily editing stand-ups'
      ],
      students: [
        'Generate captions and alt-text drafts',
        'Conduct human reviews with consultants',
        'Log corrections and rationales'
      ],
      deliverables: ['Draft accessibility assets', 'Review logs', 'Error taxonomy'],
      checkpoint: ['Teacher verifies review completeness'],
      repeatable: true,
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Package final assets and design simplified reading supports that invite broad community use. Use lens questions like "How will a family access this on a phone with auto-translate?" to shape decisions. Teachers model plain-language rewriting strategies. Students finalize captions and alt-text sets.',
      teacher: [
        'Model plain-language rewriting strategies',
        'Facilitate tone and ownership check-ins',
        'Connect students with literacy specialists'
      ],
      students: [
        'Finalize captions and alt-text sets',
        'Produce simplified reading versions',
        'Test assets with target audiences'
      ],
      deliverables: ['Finalized asset library', 'Reader-friendly translations', 'User test feedback notes'],
      checkpoint: ['Teacher ensures voice remains authentic'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Launch accessibility kits and train content creators so adoption feels practical and inviting. Prompt teams to plan for moments such as "What if editors have only ten minutes to publish?" so workflows stay nimble. Teachers organize training workshops. Students deliver training to media teams.',
      teacher: [
        'Organize training workshops',
        'Coordinate resource distribution',
        'Facilitate reflection on impact'
      ],
      students: [
        'Deliver training to media teams',
        'Demonstrate human-in-loop workflow',
        'Gather commitments for ongoing use'
      ],
      deliverables: ['Training deck', 'Workflow playbook', 'Commitment tracker'],
      checkpoint: ['Media teams sign adoption agreement'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Document governance and plan long-term stewardship so accessibility stays active after launch. Frame the week with questions like "Who will audit our captions six months from now?" to define the handoff. Teachers review governance template. Students publish governance handbook.',
      teacher: [
        'Review governance template',
        'Assist with help desk plan',
        'Connect students with district comms'
      ],
      students: [
        'Publish governance handbook',
        'Set up support ticket system',
        'Schedule quarterly accessibility reviews'
      ],
      deliverables: ['Governance handbook', 'Support workflow', 'Review calendar'],
      checkpoint: ['Teacher verifies stewardship plan'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Design and implement a human-guided AI accessibility workflow across school media'],
    extras: [
      'Create student accessibility newsroom',
      'Produce awareness campaign around inclusive media',
      'Build teacher micro-course on accessibility',
      'Secure policy adoption at district level'
    ],
    audiences: ['School media teams', 'Accessibility coordinators', 'Families', 'District communications office']
  },
  materialsPrep: {
    coreKit: [
      'Captioning and alt-text software licenses',
      'Headsets and microphones',
      'Plain-language editing guides',
      'Accessibility style guides',
      'AI moderation dashboard',
      'Feedback forms for consultants'
    ],
    noTechFallback: ['Manual caption scripts', 'Printed alt-text guidelines', 'Plain-language rewrite templates'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Accessibility Listening Log',
      summary: 'Open with lived expertise so accessibility work starts from accountability, not assumptions. Students listen to disabled storytellers, map where sample media falls short, and capture insights that will guide their gap analysis deliverables. Teachers curate the panel, listening structures, and debrief so commitments are co-authored with the speakers.',
      studentDirections: [
        'Attend storyteller panel respectfully',
        'Take notes on access needs shared',
        'Audit sample media for barriers',
        'Summarize top three gaps',
        'Share takeaways with team'
      ],
      teacherSetup: [
        'Invite panelists and moderators',
        'Provide listening log template',
        'Set reflection norms',
        'Debrief panel together'
      ],
      evidence: ['Listening log', 'Gap summary'],
      successCriteria: ['I center speaker voices in my notes', 'I identify specific accessibility gaps we can solve', 'I reflect with empathy and next steps'],
      checkpoint: 'Teacher reviews logs before planning',
      aiOptional: {
        toolUse: 'Transcribe panel audio quickly',
        critique: 'Verify transcription accuracy',
        noAIAlt: 'Use peer note-sharing'
      }
    },
    {
      id: 'A2',
      title: 'Workflow Blueprint',
      summary: 'Teams architect human-guided AI pipelines that protect tone, ownership, and accuracy. Students inventory pilot media, storyboard every AI and human checkpoint, and align deliverables like the QA checklist with partner expectations. Teachers supply exemplars and rubric feedback so plans balance ambition with realistic staffing.',
      studentDirections: [
        'Select pilot media assets',
        'Map AI and human steps',
        'Define quality checkpoints',
        'Assign reviewer responsibilities',
        'Submit blueprint for approval'
      ],
      teacherSetup: [
        'Provide blueprint rubric',
        'Share workflow examples',
        'Review quality standards',
        'Offer planning conferences'
      ],
      evidence: ['Workflow blueprint', 'Reviewer roster'],
      successCriteria: ['I design workflows that protect original voices', 'I assign reviewer roles and responsibilities clearly', 'I insert checkpoints that prevent errors before publishing'],
      checkpoint: 'Teacher signs blueprint before drafting',
      aiOptional: {
        toolUse: 'Generate flowchart skeleton',
        critique: 'Check flowchart reflects plan',
        noAIAlt: 'Use sticky-note sequencing'
      }
    },
    {
      id: 'A3',
      title: 'Accessibility Sprint Log',
      summary: 'Sprint cycles convert rough AI drafts into assets the community can actually publish. Students generate captions, alt-text, and plain-language summaries, then document every human revision and consultant insight in their sprint logs. Teachers orchestrate tool training and review cadences to keep quality, respect, and turnaround times aligned.',
      studentDirections: [
        'Run AI caption and alt-text drafts',
        'Review drafts with consultant feedback',
        'Log edits and reasoning',
        'Produce simplified reading version',
        'Test assets with target users'
      ],
      teacherSetup: [
        'Provide sprint log template',
        'Coordinate consultant availability',
        'Monitor respectful collaboration',
        'Review drafts for tone'
      ],
      evidence: ['Sprint log', 'Revised assets'],
      successCriteria: ['I log every edit with reasoning and partner feedback', 'I deliver assets that meet accessibility guidelines', 'I confirm clarity through user tests and document outcomes'],
      checkpoint: 'Teacher checks logs before showcase',
      aiOptional: {
        toolUse: 'Highlight unclear phrasing automatically',
        critique: 'Validate AI suggestions with consultant',
        noAIAlt: 'Use peer editing checklist'
      },
    },
    {
      id: 'A4',
      title: 'Accessibility Launch Studio',
      summary: 'The final push turns workflows into an adoption campaign people will sustain. Students design workshops, publish governance handbooks, and collect commitments that prove the new systems will stick after the showcase. Teachers manage logistics and partner invitations so each launch moment reaches the teams who need it most.',
      studentDirections: [
        'Create training session agenda',
        'Deliver workshop to media teams',
        'Publish governance handbook',
        'Collect adoption commitments',
        'Finalize support escalation plan'
      ],
      teacherSetup: [
        'Schedule workshops',
        'Provide handbook template',
        'Invite district communications',
        'Review adoption commitments'
      ],
      evidence: ['Workshop recording', 'Governance handbook', 'Commitment log'],
      successCriteria: ['I lead training that engages and empowers media teams', 'I publish a concise governance handbook teams can follow', 'I define a support plan with named owners and response times'],
      checkpoint: 'Teacher confirms commitments shared widely',
      aiOptional: {
        toolUse: 'Draft quick-reference guide layout',
        critique: 'Ensure layout meets accessibility',
        noAIAlt: 'Use design system templates'
      }
    }
  ],
};
