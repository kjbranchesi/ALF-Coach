// Chat Flow Configuration based on Blueprint Coach SOP v1.0
// Single source of truth for conversation flow

export const CHAT_STAGES = {
  // Wizard is handled separately
  IDEATION: {
    id: 'IDEATION',
    label: 'Ideation',
    purpose: 'Transform context into a Big Idea, EQ, and Challenge that motivate the unit.',
    steps: [
      {
        id: 'IDEATION_BIG_IDEA',
        label: 'Big Idea',
        storeKey: 'ideation.bigIdea',
        objective: 'Anchor the learning around one resonant concept.',
        promptTemplate: (context) => ({
          entry: `Let's anchor your ${context.subject} experience with a Big Idea.

A Big Idea is a concept that:
• Resonates beyond the classroom
• Connects to students' lives  
• Sparks curiosity and wonder

For ${context.ageGroup} students in ${context.location}, what overarching concept could transform how they see ${context.subject}?`,
          clarifier: (answer) => `Current Big Idea: **${answer}**. Continue or refine?`
        })
      },
      {
        id: 'IDEATION_EQ',
        label: 'Essential Question',
        storeKey: 'ideation.essentialQuestion',
        objective: 'Frame an inquiry that endures & drives research.',
        promptTemplate: (context) => ({
          entry: `Great! Now let's transform "${context.bigIdea}" into an Essential Question.

Essential Questions:
• Are open-ended and thought-provoking
• Don't have one "right" answer
• Drive sustained inquiry

What question could unpack "${context.bigIdea}" for your students?`,
          clarifier: (answer) => `Current Essential Question: **${answer}**. Continue or refine?`
        })
      },
      {
        id: 'IDEATION_CHALLENGE',
        label: 'Challenge',
        storeKey: 'ideation.challenge',
        objective: 'Define an authentic task with real audience.',
        promptTemplate: (context) => ({
          entry: `Excellent! Let's create a real-world Challenge that brings "${context.essentialQuestion}" to life.

A Challenge should:
• Have authentic purpose
• Connect to real audiences
• Create tangible impact

What challenge could your students tackle that addresses this question?`,
          clarifier: (answer) => `Current Challenge: **${answer}**. Continue or refine?`
        })
      }
    ]
  },
  JOURNEY: {
    id: 'JOURNEY',
    label: 'Journey',
    purpose: 'Plan phases, activities, resources ensuring depth & skills progression.',
    steps: [
      {
        id: 'JOURNEY_PHASES',
        label: 'Phases',
        storeKey: 'journey.phases',
        objective: 'Map sign-posts that structure the learning arc.',
        promptTemplate: (context) => ({
          entry: `Now let's map the learning journey for "${context.challenge}".

Break this into 3-5 phases that:
• Build naturally on each other
• Deepen investigation
• Lead to the final challenge

What are the key phases of this journey?`,
          clarifier: (answer) => `Current Phases: **${answer}**. Continue or refine?`
        })
      },
      {
        id: 'JOURNEY_ACTIVITIES',
        label: 'Activities',
        storeKey: 'journey.activities',
        objective: 'Define signature learning experiences per phase.',
        promptTemplate: (context) => ({
          entry: `Perfect! For each phase, let's define signature activities.

Activities should:
• Engage multiple learning styles
• Build specific skills
• Connect to the Essential Question

What key activities will students do in each phase?`,
          clarifier: (answer) => `Current Activities: **${answer}**. Continue or refine?`
        })
      },
      {
        id: 'JOURNEY_RESOURCES',
        label: 'Resources',
        storeKey: 'journey.resources',
        objective: 'List experts, texts, tools that sustain work.',
        promptTemplate: (context) => ({
          entry: `Great activities! Now let's gather resources.

Consider:
• Expert speakers or mentors
• Essential texts or media
• Tools and materials
• Community connections

What resources will support this journey?`,
          clarifier: (answer) => `Current Resources: **${answer}**. Continue or refine?`
        })
      }
    ]
  },
  DELIVERABLES: {
    id: 'DELIVERABLES',
    label: 'Deliverables',
    purpose: 'Set milestones, rubric, impact plan—clarifying output quality & authenticity.',
    steps: [
      {
        id: 'DELIVER_MILESTONES',
        label: 'Milestones',
        storeKey: 'deliverables.milestones',
        objective: 'Checkpoints & evidence of progress.',
        promptTemplate: (context) => ({
          entry: `Let's establish clear milestones for "${context.challenge}".

Milestones should:
• Mark meaningful progress
• Generate visible evidence
• Build toward final deliverable

What are the key checkpoints in this journey?`,
          clarifier: (answer) => `Current Milestones: **${answer}**. Continue or refine?`
        })
      },
      {
        id: 'DELIVER_RUBRIC',
        label: 'Rubric',
        storeKey: 'deliverables.rubric.criteria',
        objective: 'Assessment criteria rewarding inquiry & craft.',
        promptTemplate: (context) => ({
          entry: `Now let's define success criteria.

Your rubric should assess:
• Quality of inquiry
• Depth of understanding
• Craft and presentation
• Real-world impact

What are your key assessment criteria?`,
          clarifier: (answer) => `Current Rubric Criteria: **${answer}**. Continue or refine?`
        })
      },
      {
        id: 'DELIVER_IMPACT',
        label: 'Impact Plan',
        storeKey: 'deliverables.impact',
        objective: 'Real-world sharing & reflection mechanism.',
        promptTemplate: (context) => ({
          entry: `Finally, let's plan for real impact.

Consider:
• Who is the authentic audience?
• How will work be shared?
• What reflection process?
• How to measure impact?

What's your plan for sharing and impact?`,
          clarifier: (answer) => `Current Impact Plan: **${answer}**. Continue or refine?`
        })
      }
    ]
  }
};

// Quick Reply Configuration
export const QUICK_REPLIES = {
  standard: [
    { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
    { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
    { label: 'Help', action: 'help', icon: 'HelpCircle' }
  ],
  confirmation: [
    { label: 'Continue', action: 'continue', icon: 'Check', variant: 'primary' },
    { label: 'Refine', action: 'refine', icon: 'Edit', variant: 'secondary' },
    { label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' }
  ]
};

// Stage Initiator Templates
export const STAGE_INITIATORS = {
  IDEATION: (context) => `Welcome to Ideation. In this stage we'll complete 3 steps:
1. Big Idea - Find a resonant concept
2. Essential Question - Frame your inquiry  
3. Challenge - Define real-world impact

Each answer builds the foundation for your Learning Journey.

Ready to begin with your Big Idea?`,

  JOURNEY: (context) => `Welcome to the Learning Journey. Here we'll map out 3 elements:
1. Phases - Structure the learning arc
2. Activities - Design key experiences
3. Resources - Gather essential support

This creates the roadmap for "${context.bigIdea}".

Ready to map your phases?`,

  DELIVERABLES: (context) => `Welcome to Deliverables. Let's define 3 final elements:
1. Milestones - Set progress checkpoints
2. Rubric - Define success criteria
3. Impact Plan - Plan authentic sharing

This ensures quality and real-world connection.

Ready to set your milestones?`
};

// Stage Clarifier Templates  
export const STAGE_CLARIFIERS = {
  IDEATION: (data) => `Ideation summary:
• Big Idea — ${data.bigIdea || '[pending]'}
• Essential Question — ${data.essentialQuestion || '[pending]'}  
• Challenge — ${data.challenge || '[pending]'}

Type 'edit' to revisit any step, or 'proceed' to start the Learning Journey.`,

  JOURNEY: (data) => `Journey summary:
• Phases — ${data.phases?.join(', ') || '[pending]'}
• Activities — ${data.activities?.length || 0} defined
• Resources — ${data.resources?.length || 0} identified

Type 'edit' to revisit any step, or 'proceed' to define Deliverables.`,

  DELIVERABLES: (data) => `Deliverables summary:
• Milestones — ${data.milestones?.length || 0} set
• Rubric — ${data.rubric?.criteria?.length || 0} criteria
• Impact Plan — ${data.impact?.audience ? 'Defined' : '[pending]'}

Type 'edit' to revisit any step, or 'proceed' to review and export.`
};

// Edge Case Handlers
export const EDGE_CASE_HANDLERS = {
  ramble: (text) => text.length > 250,
  confusion: (text) => /^(what|why|how|i don't|confused|help)/i.test(text),
  multiple: (text) => text.split(',').length > 2,
  blank: (text) => !text.trim() || /^(ok|okay|yes|no)$/i.test(text),
  skip: (text) => /^(skip|next|pass)$/i.test(text)
};

// Response Templates for Edge Cases
export const EDGE_CASE_RESPONSES = {
  ramble: "Let's focus on one key point. What's the core idea you want to capture?",
  confusion: "I understand this can be complex. Let me help clarify...",
  multiple: "I see several ideas here. Let's focus on one, or shall I help you combine them?",
  blank: "Please share your thoughts, or use the Ideas/What-If buttons for inspiration.",
  skip: "I'll mark this step as pending. You can always return to it later."
};

// Metadata Schema for Messages
export const MESSAGE_METADATA_SCHEMA = {
  role: 'assistant',
  content: '',
  metadata: {
    stage: '',
    step: '',
    phase: '', // 'entry' | 'clarifier' | 'transition'
    quickReplies: [],
    showCards: false,
    cardType: null,
    cardOptions: []
  }
};