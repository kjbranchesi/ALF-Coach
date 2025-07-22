// BlueprintSchema.js - Comprehensive schema for Blueprint Builder v1.2

export const BlueprintStages = {
  IDEATION: 'ideation',
  LEARNING_JOURNEY: 'learningJourney',
  AUTHENTIC_DELIVERABLES: 'authenticDeliverables',
  PUBLISH: 'publish'
};

export const BlueprintSchema = {
  // Metadata
  id: '',
  createdAt: null,
  updatedAt: null,
  status: 'draft', // draft, complete, published
  currentStage: BlueprintStages.IDEATION,
  
  // Stage 1: Ideation (Catalyst + Issues)
  ideation: {
    bigIdea: '', // ≤ 10 words
    essentialQuestion: '', // Must start with How/Why/What
    challenge: '', // verb + audience
    issues: [], // 2-4 sub-themes/issue tags
    completed: false,
    deliverable: null // Project Catalyst Card
  },
  
  // Stage 2: Learning Journey (Method)
  learningJourney: {
    phases: [
      // {
      //   id: '',
      //   name: '',
      //   order: 1,
      //   duration: '',
      //   activities: []
      // }
    ],
    activities: {}, // { phaseId: [...activities] }
    resources: [], // { title, url, type, phaseId? }
    completed: false,
    deliverable: null // Curriculum Timeline Outline
  },
  
  // Stage 3: Authentic Deliverables (Engagement)
  authenticDeliverables: {
    milestones: [
      // {
      //   id: '',
      //   title: '',
      //   description: '',
      //   dueDate: null,
      //   phaseId: ''
      // }
    ],
    rubric: {
      type: 'analytic', // analytic or holistic
      criteria: [
        // {
        //   id: '',
        //   name: '',
        //   weight: 0,
        //   levels: [
        //     { level: 1, description: '', points: 0 },
        //     { level: 2, description: '', points: 0 },
        //     { level: 3, description: '', points: 0 },
        //     { level: 4, description: '', points: 0 }
        //   ]
        // }
      ]
    },
    impactPlan: {
      audience: '',
      method: '',
      date: null,
      description: ''
    },
    completed: false,
    deliverable: null // Assessment Packet
  },
  
  // Stage 4: Publish
  publish: {
    summary: '', // Auto-generated markdown
    exports: [], // { type: 'pdf'|'link'|'google', url: '', timestamp: null }
    shareUrl: '',
    published: false,
    publishedAt: null
  },
  
  // Context from OnboardingWizard
  projectInfo: {
    educatorPerspective: '',
    subject: '',
    ageGroup: '',
    projectScope: '',
    location: '',
    initialMaterials: ''
  },
  
  // Progress tracking
  progress: {
    checkpoints: {}, // { stepId: { completed: true, timestamp: null } }
    skippedSteps: [], // Array of step IDs marked as TODO
    totalSteps: 0,
    completedSteps: 0,
    lastActivity: null
  }
};

// Validation rules
export const ValidationRules = {
  bigIdea: {
    maxWords: 10,
    minWords: 2,
    required: true
  },
  essentialQuestion: {
    mustStartWith: /^(how|why|what|when|where|which)\s/i,
    mustEndWith: '?',
    minWords: 5,
    required: true
  },
  challenge: {
    mustContainVerb: /(create|design|develop|build|produce|analyze|evaluate|solve|investigate|propose)/i,
    mustContainAudience: true,
    required: true
  },
  issues: {
    min: 2,
    max: 4,
    required: false
  },
  phases: {
    min: 3,
    max: 5,
    required: true
  },
  activities: {
    minPerPhase: 1,
    maxPerPhase: 4,
    required: true
  },
  rubricCriteria: {
    min: 2,
    max: 6,
    levelsMin: 3,
    levelsMax: 5,
    required: true
  }
};

// Decision tree options
export const DecisionTreeOptions = {
  GET_IDEAS: {
    id: 'get-ideas',
    label: 'Get Ideas',
    icon: 'Lightbulb',
    description: 'Get 3-5 fresh suggestions'
  },
  SEE_EXAMPLES: {
    id: 'see-examples', 
    label: 'See Examples',
    icon: 'Document',
    description: 'View exemplars from library'
  },
  ASK_AI: {
    id: 'ask-ai',
    label: 'Ask AI',
    icon: 'Chat',
    description: 'Open free-text question'
  },
  SKIP: {
    id: 'skip',
    label: 'Skip',
    icon: 'Forward',
    description: 'Mark as TODO and continue'
  }
};

// Success metrics
export const SuccessMetrics = {
  ideation: {
    required: ['bigIdea', 'essentialQuestion', 'challenge'],
    optional: ['issues']
  },
  learningJourney: {
    required: ['phases', 'activities'],
    optional: ['resources']
  },
  authenticDeliverables: {
    required: ['milestones', 'rubric'],
    optional: ['impactPlan']
  }
};

// What-If scenarios
export const WhatIfScenarios = {
  HELP_MID_STEP: {
    trigger: /^help$/i,
    response: 'showFAQ'
  },
  EMPTY_REQUIRED: {
    trigger: 'emptyRequiredField',
    response: 'promptInspiration'
  },
  REVISE_AFTER_COMPLETE: {
    trigger: 'editPreviousStage',
    response: 'consistencyCheck'
  },
  REORDER_PHASES: {
    trigger: 'dragReorderPhases',
    response: 'remapActivities'
  }
};