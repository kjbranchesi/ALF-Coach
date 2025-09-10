// Prompt generation for Blueprint Coach SOP v1.0
// Implements standardized conversation flow with quick-reply chips

// Avoid importing full schema
type WizardData = any;
import { type JourneyData, type JourneyState, STAGE_METADATA } from '../lib/fsm-v2';

export interface QuickReply {
  label: string;
  action: string;
  icon?: string;
}

export interface PromptData {
  role: 'assistant' | 'system';
  content: string;
  metadata: {
    quickReplies: QuickReply[];
    stage?: string;
    readyForNext?: boolean;
    isGenerativePrompt?: boolean;
  };
}

// Standard quick-reply chips per SOP
const STANDARD_CHIPS = {
  input: [
    { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
    { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
    { label: 'Help', action: 'help', icon: 'HelpCircle' }
  ],
  confirmation: [
    { label: 'Continue', action: 'continue', icon: 'ArrowRight' },
    { label: 'Refine', action: 'refine', icon: 'Edit' },
    { label: 'Help', action: 'help', icon: 'HelpCircle' }
  ]
};

// Generate prompt based on current stage
export function generatePrompt({ 
  wizardData, 
  journeyData, 
  currentStage,
  previousResponse
}: {
  wizardData: WizardData;
  journeyData: JourneyData;
  currentStage: JourneyState;
  previousResponse?: string;
}): PromptData {
  // If we have a previous response, generate confirmation prompt
  if (previousResponse) {
    return generateConfirmationPrompt(currentStage, previousResponse);
  }

  // Otherwise generate entry prompt for the stage
  switch (currentStage) {
    // IDEATION Stage
    case 'IDEATION_INITIATOR':
      return generateStageInitiator('IDEATION', wizardData);
    
    case 'IDEATION_BIG_IDEA':
      return generateIdeationBigIdeaPrompt(wizardData, journeyData);
    
    case 'IDEATION_EQ':
      return generateIdeationEQPrompt(wizardData, journeyData);
    
    case 'IDEATION_CHALLENGE':
      return generateIdeationChallengePrompt(wizardData, journeyData);
    
    case 'IDEATION_CLARIFIER':
      return generateStageClarifier('IDEATION', journeyData);
    
    // JOURNEY Stage
    case 'JOURNEY_INITIATOR':
      return generateStageInitiator('JOURNEY', wizardData);
    
    case 'JOURNEY_PHASES':
      return generateJourneyPhasesPrompt(wizardData, journeyData);
    
    case 'JOURNEY_ACTIVITIES':
      return generateJourneyActivitiesPrompt(wizardData, journeyData);
    
    case 'JOURNEY_RESOURCES':
      return generateJourneyResourcesPrompt(wizardData, journeyData);
    
    case 'JOURNEY_CLARIFIER':
      return generateStageClarifier('JOURNEY', journeyData);
    
    // DELIVERABLES Stage
    case 'DELIVERABLES_INITIATOR':
      return generateStageInitiator('DELIVERABLES', wizardData);
    
    case 'DELIVER_MILESTONES':
      return generateDeliverMilestonesPrompt(wizardData, journeyData);
    
    case 'DELIVER_RUBRIC':
      return generateDeliverRubricPrompt(wizardData, journeyData);
    
    case 'DELIVER_IMPACT':
      return generateDeliverImpactPrompt(wizardData, journeyData);
    
    case 'DELIVERABLES_CLARIFIER':
      return generateStageClarifier('DELIVERABLES', journeyData);
    
    // PUBLISH Stage
    case 'PUBLISH_REVIEW':
      return generatePublishReviewPrompt(journeyData);
    
    default:
      return {
        role: 'assistant',
        content: 'Ready to continue building your blueprint?',
        metadata: { quickReplies: STANDARD_CHIPS.input }
      };
  }
}

// Generate Stage Initiator message
function generateStageInitiator(stage: 'IDEATION' | 'JOURNEY' | 'DELIVERABLES', wizardData: WizardData): PromptData {
  const stageInfo = STAGE_METADATA.stages[stage];
  const content = `Welcome to **${stage.charAt(0) + stage.slice(1).toLowerCase()}**! ${stageInfo.purpose}

In this stage we'll complete ${stageInfo.substeps.length} steps:
${stageInfo.substeps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Each answer builds the foundation for what comes next.

Ready to begin with ${stageInfo.substeps[0]}? Type "start" or click Ideas for suggestions.`;

  return {
    role: 'assistant',
    content,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: `${stage}_INITIATOR`
    }
  };
}

// Generate Stage Clarifier message
function generateStageClarifier(stage: 'IDEATION' | 'JOURNEY' | 'DELIVERABLES', journeyData: JourneyData): PromptData {
  let summary = '';
  let editOptions: string[] = [];

  switch (stage) {
    case 'IDEATION':
      summary = `## Ideation Summary

• **Big Idea** — ${journeyData.ideation.bigIdea}
• **Essential Question** — ${journeyData.ideation.essentialQuestion}
• **Challenge** — ${journeyData.ideation.challenge}`;
      editOptions = ['IDEATION_BIG_IDEA', 'IDEATION_EQ', 'IDEATION_CHALLENGE'];
      break;

    case 'JOURNEY':
      summary = `## Journey Summary

• **Phases** — ${journeyData.phases.map(p => p.name).join(', ')}
• **Activities** — ${journeyData.activities.length} activities across ${journeyData.phases.length} phases
• **Resources** — ${journeyData.resources.length} resources gathered`;
      editOptions = ['JOURNEY_PHASES', 'JOURNEY_ACTIVITIES', 'JOURNEY_RESOURCES'];
      break;

    case 'DELIVERABLES':
      summary = `## Deliverables Summary

• **Milestones** — ${journeyData.deliverables.milestones.length} checkpoints defined
• **Rubric** — ${journeyData.deliverables.rubric.criteria.length} assessment criteria
• **Impact** — ${journeyData.deliverables.impact.audience} via ${journeyData.deliverables.impact.method}`;
      editOptions = ['DELIVER_MILESTONES', 'DELIVER_RUBRIC', 'DELIVER_IMPACT'];
      break;
  }

  const content = `${summary}

Type \`edit <step>\` to revisit any part, or click **Continue** to proceed to the next stage.`;

  return {
    role: 'assistant',
    content,
    metadata: { 
      quickReplies: STANDARD_CHIPS.confirmation,
      stage: `${stage}_CLARIFIER`
    }
  };
}

// Generate confirmation prompt
function generateConfirmationPrompt(stage: JourneyState, answer: string): PromptData {
  const label = getStageLabel(stage);
  return {
    role: 'assistant',
    content: `Current **${label}**: "${answer}". 

Click **Continue** to proceed or **Refine** to improve this answer.`,
    metadata: {
      quickReplies: STANDARD_CHIPS.confirmation,
      stage
    }
  };
}

// Individual stage prompt generators
function generateIdeationBigIdeaPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const { subject, ageGroup, motivation } = wizardData;
  
  const content = `Let's anchor your ${subject} experience with a **Big Idea**.

**Context**: You're teaching ${subject} to ${ageGroup} students. Your goal: ${motivation}

**Objective**: ${STAGE_METADATA.objectives.IDEATION_BIG_IDEA}

Here are some suggestions based on your context:`;

  const suggestions = [
    `${subject} as a lens for understanding our changing world`,
    `The hidden ${subject.toLowerCase()} in everyday life`,
    `${subject} through the eyes of innovators and creators`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'IDEATION_BIG_IDEA'
    }
  };
}

function generateIdeationEQPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const { subject } = wizardData;
  const { bigIdea } = journeyData.ideation;
  
  const content = `Great Big Idea: **${bigIdea}**

Now let's frame an **Essential Question** that drives inquiry.

**Context**: Your Big Idea focuses on "${bigIdea}"

**Objective**: ${STAGE_METADATA.objectives.IDEATION_EQ}

Consider these question starters:`;

  const suggestions = [
    `How might ${subject} help us ${bigIdea.toLowerCase()}?`,
    `What if ${subject} could transform the way we ${bigIdea.toLowerCase()}?`,
    `Why does ${bigIdea.toLowerCase()} matter to our community?`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'IDEATION_EQ'
    }
  };
}

function generateIdeationChallengePrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const { subject, location } = wizardData;
  const { bigIdea, essentialQuestion } = journeyData.ideation;
  
  const content = `Excellent question: **${essentialQuestion}**

Finally, let's define an **Authentic Challenge** for students.

**Context**: Students will explore "${essentialQuestion}" through hands-on work.

**Objective**: ${STAGE_METADATA.objectives.IDEATION_CHALLENGE}

Consider these challenge formats:`;

  const suggestions = [
    `Create an interactive ${subject} exhibition for ${location || 'the community'} that addresses: "${essentialQuestion}"`,
    `Design and launch a multimedia campaign that uses ${subject} to explore: "${essentialQuestion}"`,
    `Develop working prototypes or solutions that demonstrate how ${subject} answers: "${essentialQuestion}"`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'IDEATION_CHALLENGE'
    }
  };
}

function generateJourneyPhasesPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const { scope } = wizardData;
  const { challenge } = journeyData.ideation;
  
  const content = `Now let's design the **Learning Phases** for your ${scope}.

**Context**: Students will work toward: "${challenge}"

**Objective**: ${STAGE_METADATA.objectives.JOURNEY_PHASES}

I suggest 3-4 phases. Here's a possible structure:`;

  const suggestions = scope === 'unit' ? [
    `Phase 1: Discover & Wonder (1 week) - Explore the big idea through inquiry`,
    `Phase 2: Investigate & Create (2 weeks) - Deep dive and prototype solutions`,
    `Phase 3: Refine & Share (1 week) - Polish work and present to audience`
  ] : [
    `Phase 1: Launch & Explore (2 weeks) - Build foundation and spark curiosity`,
    `Phase 2: Deep Dive & Create (4 weeks) - Research and develop solutions`,
    `Phase 3: Iterate & Polish (3 weeks) - Refine based on feedback`,
    `Phase 4: Showcase & Reflect (1 week) - Present and celebrate learning`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'JOURNEY_PHASES'
    }
  };
}

function generateJourneyActivitiesPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const firstPhase = journeyData.phases[0];
  
  const content = `Excellent phases! Now let's create **Activities** for each phase.

**Context**: Let's start with "${firstPhase.name}"

**Objective**: ${STAGE_METADATA.objectives.JOURNEY_ACTIVITIES}

What engaging activities will bring this phase to life? Consider:`;

  const suggestions = [
    `Gallery walk with provocative ${wizardData.subject} artifacts and questions`,
    `Design thinking workshop to brainstorm initial solutions`,
    `Field research or expert interviews to gather perspectives`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'JOURNEY_ACTIVITIES'
    }
  };
}

function generateJourneyResourcesPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const { materials, teacherResources } = wizardData;
  
  const content = `Great activities! Now let's gather **Resources** to support the journey.

**Context**: You mentioned having: ${materials || 'basic materials'}

**Objective**: ${STAGE_METADATA.objectives.JOURNEY_RESOURCES}

Consider these resource categories:`;

  const suggestions = [
    `Expert contacts: Local professionals, online mentors, or video interviews`,
    `Digital tools: Simulations, design software, or collaboration platforms`,
    `Inspiration sources: Case studies, exemplars, or real-world examples`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')  }\n\n*Note: This step is optional. Type "skip" if you'd like to move on.*`,
    metadata: { 
      quickReplies: [...STANDARD_CHIPS.input, { label: 'Skip', action: 'skip', icon: 'SkipForward' }],
      stage: 'JOURNEY_RESOURCES'
    }
  };
}

function generateDeliverMilestonesPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const phaseCount = journeyData.phases.length;
  
  const content = `Let's define **Milestones** to track progress and celebrate achievements.

**Context**: Your journey has ${phaseCount} phases over ${wizardData.scope}

**Objective**: ${STAGE_METADATA.objectives.DELIVER_MILESTONES}

Consider these milestone types:`;

  const suggestions = [
    `Phase 1 Milestone: Initial research presentation or concept pitch`,
    `Mid-Journey Milestone: Working prototype or draft solution`,
    `Final Milestone: Polished deliverable ready for authentic audience`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'DELIVER_MILESTONES'
    }
  };
}

function generateDeliverRubricPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const content = `Now let's create **Assessment Criteria** that celebrate growth and quality.

**Context**: Students are working on: "${journeyData.ideation.challenge}"

**Objective**: ${STAGE_METADATA.objectives.DELIVER_RUBRIC}

What criteria will you assess? Consider:`;

  const suggestions = [
    `Inquiry & Research: Depth of exploration and quality of questions`,
    `Creative Problem-Solving: Innovation and thoughtfulness of solutions`,
    `Communication & Craft: Clarity and polish of final deliverable`,
    `Collaboration & Reflection: Teamwork and learning insights`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'DELIVER_RUBRIC'
    }
  };
}

function generateDeliverImpactPrompt(wizardData: WizardData, journeyData: JourneyData): PromptData {
  const { location } = wizardData;
  
  const content = `Finally, let's plan for **Authentic Impact** - connecting student work to real audiences.

**Context**: Your students are in ${location || 'your community'}

**Objective**: ${STAGE_METADATA.objectives.DELIVER_IMPACT}

Consider these audience and sharing options:`;

  const suggestions = [
    `Audience: Local community members | Method: Public exhibition or gallery night`,
    `Audience: Online subject enthusiasts | Method: Digital portfolio or virtual showcase`,
    `Audience: Younger students | Method: Teaching workshops or mentoring sessions`
  ];

  return {
    role: 'assistant',
    content: `${content  }\n\n${  suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    metadata: { 
      quickReplies: STANDARD_CHIPS.input,
      stage: 'DELIVER_IMPACT'
    }
  };
}

function generatePublishReviewPrompt(journeyData: JourneyData): PromptData {
  const content = `## Your Blueprint is Complete!

Let's do a final review before publishing:

**Ideation**
• Big Idea: ${journeyData.ideation.bigIdea}
• Essential Question: ${journeyData.ideation.essentialQuestion}
• Challenge: ${journeyData.ideation.challenge}

**Journey**
• ${journeyData.phases.length} phases with ${journeyData.activities.length} activities
• ${journeyData.resources.length} resources gathered

**Deliverables**
• ${journeyData.deliverables.milestones.length} milestones
• ${journeyData.deliverables.rubric.criteria.length} assessment criteria
• Impact: ${journeyData.deliverables.impact.audience}

Ready to export your blueprint?`;

  return {
    role: 'assistant',
    content,
    metadata: { 
      quickReplies: [
        { label: 'Export Markdown', action: 'export_md', icon: 'FileText' },
        { label: 'Export PDF', action: 'export_pdf', icon: 'FileDown' },
        { label: 'Make Edits', action: 'edit', icon: 'Edit' }
      ],
      stage: 'PUBLISH_REVIEW'
    }
  };
}

// Helper functions
function getStageLabel(stage: JourneyState): string {
  const labels: Record<JourneyState, string> = {
    'IDEATION_INITIATOR': 'Ideation Introduction',
    'IDEATION_BIG_IDEA': 'Big Idea',
    'IDEATION_EQ': 'Essential Question',
    'IDEATION_CHALLENGE': 'Challenge',
    'IDEATION_CLARIFIER': 'Ideation Summary',
    'JOURNEY_INITIATOR': 'Journey Introduction',
    'JOURNEY_PHASES': 'Phases',
    'JOURNEY_ACTIVITIES': 'Activities',
    'JOURNEY_RESOURCES': 'Resources',
    'JOURNEY_CLARIFIER': 'Journey Summary',
    'DELIVERABLES_INITIATOR': 'Deliverables Introduction',
    'DELIVER_MILESTONES': 'Milestones',
    'DELIVER_RUBRIC': 'Rubric',
    'DELIVER_IMPACT': 'Impact Plan',
    'DELIVERABLES_CLARIFIER': 'Deliverables Summary',
    'PUBLISH_REVIEW': 'Final Review',
    'COMPLETE': 'Complete'
  };
  
  return labels[stage] || stage;
}

// Generate quick-reply response based on action
export function generateQuickResponse(action: string, context: {
  wizardData: WizardData;
  journeyData: JourneyData;
  currentStage: JourneyState;
}): PromptData {
  const { currentStage } = context;
  
  switch (action) {
    case 'ideas':
      return generateIdeasResponse(context);
    
    case 'whatif':
      return generateWhatIfResponse(context);
    
    case 'help':
      return generateHelpResponse(context);
    
    case 'continue':
      return {
        role: 'assistant',
        content: 'Great! Moving forward...',
        metadata: { 
          quickReplies: [],
          readyForNext: true 
        }
      };
    
    case 'refine':
      return {
        role: 'assistant',
        content: 'No problem! Let\'s refine your answer. What would you like to change?',
        metadata: { 
          quickReplies: STANDARD_CHIPS.input,
          stage: currentStage
        }
      };
    
    default:
      return generatePrompt(context);
  }
}

// Generate Ideas response (3-5 option cards)
function generateIdeasResponse(context: {
  wizardData: WizardData;
  journeyData: JourneyData;
  currentStage: JourneyState;
}): PromptData {
  const { wizardData, journeyData, currentStage } = context;
  const { subject, ageGroup, location } = wizardData;
  
  // Generate stage-specific prompt for AI
  let prompt = '';
  
  switch (currentStage) {
    case 'IDEATION_BIG_IDEA':
      prompt = `Generate 4 compelling Big Ideas for teaching ${subject} to ${ageGroup} students.
      
      Each Big Idea should:
      - Be a broad, resonant concept that anchors the entire unit
      - Connect ${subject} to real-world relevance
      - Be appropriate for ${ageGroup} learners
      - Inspire curiosity and deeper thinking
      
      Format each as:
      Option [A/B/C/D] - [Title]
      [One sentence description]
      
      Make them specific to ${subject}, not generic.`;
      break;
      
    case 'IDEATION_EQ':
      prompt = `Generate 4 Essential Questions based on the Big Idea: "${journeyData.ideation.bigIdea}"
      
      Each Essential Question should:
      - Be open-ended and thought-provoking
      - Connect to the Big Idea
      - Guide student inquiry throughout the unit
      - Be appropriate for ${ageGroup} students studying ${subject}
      
      Format each as:
      Option [A/B/C/D] - [The question]
      [Brief explanation of why this question matters]`;
      break;
      
    case 'IDEATION_CHALLENGE':
      prompt = `Generate 4 authentic Challenges based on:
      Big Idea: "${journeyData.ideation.bigIdea}"
      Essential Question: "${journeyData.ideation.essentialQuestion}"
      
      Each Challenge should:
      - Be a real-world problem students can solve
      - Connect to ${subject} curriculum
      - Be achievable by ${ageGroup} students
      - Result in a tangible outcome or solution
      
      Format each as:
      Option [A/B/C/D] - [Challenge title]
      [One sentence describing the challenge]`;
      break;
      
    case 'JOURNEY_PHASES':
      prompt = `Generate 4 different phase structures for the learning journey based on:
      Big Idea: "${journeyData.ideation.bigIdea}"
      Essential Question: "${journeyData.ideation.essentialQuestion}"
      Challenge: "${journeyData.ideation.challenge}"
      
      Each phase structure should:
      - Be appropriate for ${ageGroup} students studying ${subject}
      - Progress logically from exploration to creation
      - Support the challenge outcome
      - Include 3-5 phases total
      
      Format each as:
      Option [A/B/C/D] - [Structure name]
      Phase 1: [Name] - [Brief description]
      Phase 2: [Name] - [Brief description]
      (continue for all phases)`;
      break;
      
    case 'JOURNEY_ACTIVITIES':
      const phaseNames = journeyData.phases.map(p => p.name).join(', ');
      prompt = `Generate 4 sets of activities for the phases: ${phaseNames}
      
      Context:
      - ${subject} for ${ageGroup} students
      - Supporting: "${journeyData.ideation.challenge}"
      
      Each set should include 2-3 activities per phase that:
      - Build skills progressively
      - Mix individual and collaborative work
      - Connect to real-world application
      
      Format as:
      Option [A/B/C/D] - [Activity theme]
      [Phase 1 Name]: [Activity description]
      [Phase 2 Name]: [Activity description]
      (continue for each phase)`;
      break;
      
    case 'JOURNEY_RESOURCES':
      prompt = `Generate 4 resource collections to support:
      Challenge: "${journeyData.ideation.challenge}"
      Subject: ${subject}
      Age: ${ageGroup}
      
      Each collection should include:
      - Digital tools and platforms
      - Physical materials needed
      - Expert connections or field trips
      - Reference materials
      
      Format as:
      Option [A/B/C/D] - [Resource theme]
      • Digital: [specific tools]
      • Materials: [what's needed]
      • Connections: [who/where]
      • References: [books/sites]`;
      break;
      
    case 'DELIVER_MILESTONES':
      prompt = `Generate 4 milestone structures for tracking progress on:
      Challenge: "${journeyData.ideation.challenge}"
      
      Each structure should include 3-4 checkpoints that:
      - Mark significant progress points
      - Are observable and measurable
      - Build toward the final deliverable
      - Suit ${ageGroup} students
      
      Format as:
      Option [A/B/C/D] - [Milestone approach]
      1. [Milestone name]: [What students will have accomplished]
      2. [Milestone name]: [What students will have accomplished]
      (continue for all milestones)`;
      break;
      
    case 'DELIVER_RUBRIC':
      prompt = `Generate 4 assessment rubric frameworks for:
      Challenge: "${journeyData.ideation.challenge}"
      Subject: ${subject}
      
      Each framework should assess 3-4 key areas:
      - Appropriate for ${ageGroup} students
      - Balance process and product
      - Include growth mindset elements
      
      Format as:
      Option [A/B/C/D] - [Rubric focus]
      • [Criteria 1]: [What excellence looks like]
      • [Criteria 2]: [What excellence looks like]
      • [Criteria 3]: [What excellence looks like]`;
      break;
      
    case 'DELIVER_IMPACT':
      prompt = `Generate 4 authentic audience and sharing plans for:
      Challenge: "${journeyData.ideation.challenge}"
      Location: ${location || 'your community'}
      
      Each plan should:
      - Connect to real audiences
      - Create meaningful impact
      - Be feasible for ${ageGroup} students
      - Extend beyond the classroom
      
      Format as:
      Option [A/B/C/D] - [Impact approach]
      Audience: [Who will benefit]
      Format: [How work will be shared]
      Impact: [What difference it makes]`;
      break;
      
    default:
      prompt = `Generate 4 relevant suggestions for ${getStageLabel(currentStage)} in the context of teaching ${subject} to ${ageGroup} students.`;
  }
  
  return {
    role: 'system',
    content: prompt,
    metadata: {
      quickReplies: STANDARD_CHIPS.input,
      stage: currentStage,
      isGenerativePrompt: true
    }
  };
}

// Generate What-If response (provocative reframings)
function generateWhatIfResponse(context: {
  wizardData: WizardData;
  journeyData: JourneyData;
  currentStage: JourneyState;
}): PromptData {
  const { wizardData, journeyData, currentStage } = context;
  const { subject, ageGroup, location } = wizardData;
  
  let prompt = '';
  
  switch (currentStage) {
    case 'IDEATION_BIG_IDEA':
      prompt = `Generate 2-3 "What if" scenarios that could transform how we think about teaching ${subject} to ${ageGroup} students.
      
      Each scenario should:
      - Challenge traditional approaches
      - Be provocative but achievable
      - Inspire innovative thinking
      - Connect ${subject} to unexpected contexts
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation of the possibility]`;
      break;
      
    case 'IDEATION_EQ':
      prompt = `Generate 2-3 "What if" scenarios that reframe the Essential Question process for:
      Big Idea: "${journeyData.ideation.bigIdea}"
      Subject: ${subject}
      
      Each scenario should flip conventional thinking about how students explore big questions.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'IDEATION_CHALLENGE':
      prompt = `Generate 2-3 "What if" scenarios that reimagine authentic challenges for:
      Big Idea: "${journeyData.ideation.bigIdea}"
      Essential Question: "${journeyData.ideation.essentialQuestion}"
      
      Each scenario should push boundaries of typical ${subject} projects for ${ageGroup} students.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'JOURNEY_PHASES':
      prompt = `Generate 2-3 "What if" scenarios that reimagine how we structure learning journeys for:
      Challenge: "${journeyData.ideation.challenge}"
      
      Push boundaries of traditional ${subject} unit design for ${ageGroup} students.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'JOURNEY_ACTIVITIES':
      prompt = `Generate 2-3 "What if" scenarios that transform typical ${subject} activities.
      
      Context: ${ageGroup} students working on "${journeyData.ideation.challenge}"
      
      Challenge assumptions about how students learn and create.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'JOURNEY_RESOURCES':
      prompt = `Generate 2-3 "What if" scenarios about resources and tools for:
      "${journeyData.ideation.challenge}"
      
      Reimagine what resources could look like for ${ageGroup} students in ${subject}.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'DELIVER_MILESTONES':
      prompt = `Generate 2-3 "What if" scenarios that reframe how we track progress.
      
      Context: ${ageGroup} students demonstrating learning through "${journeyData.ideation.challenge}"
      
      Challenge traditional assessment checkpoints.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'DELIVER_RUBRIC':
      prompt = `Generate 2-3 "What if" scenarios that revolutionize assessment for:
      ${subject} with ${ageGroup} students
      
      Move beyond traditional rubrics and grading.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    case 'DELIVER_IMPACT':
      prompt = `Generate 2-3 "What if" scenarios for authentic impact beyond school.
      
      Context: ${ageGroup} students in ${location || 'your community'}
      Challenge: "${journeyData.ideation.challenge}"
      
      Dream big about real-world connections.
      
      Format as:
      What if [provocative scenario]?
      [Brief explanation]`;
      break;
      
    default:
      prompt = `Generate 2-3 provocative "What if" scenarios for ${getStageLabel(currentStage)} that could transform the learning experience for ${ageGroup} students studying ${subject}.`;
  }
  
  return {
    role: 'system',
    content: prompt,
    metadata: {
      quickReplies: STANDARD_CHIPS.input,
      stage: currentStage,
      isGenerativePrompt: true
    }
  };
}

// Generate Help response (meta-guide + exemplars)
function generateHelpResponse(context: {
  wizardData: WizardData;
  journeyData: JourneyData;
  currentStage: JourneyState;
}): PromptData {
  const stageContext = STAGE_METADATA.objectives[context.currentStage] || 'Create something meaningful';
  
  return {
    role: 'assistant',
    content: `**Quick Guide**: ${stageContext}

**Example 1**: Middle school science teacher created "Climate Detectives" where students investigated local environmental changes and presented solutions to city council.

**Example 2**: High school history class developed "Voices of Our Town" - multimedia stories connecting past and present through community interviews.

**Tips**:
• Start with what excites YOU
• Think about authentic audiences
• Consider available resources
• Build in student choice

What questions do you have?`,
    metadata: {
      quickReplies: STANDARD_CHIPS.input,
      stage: context.currentStage
    }
  };
}