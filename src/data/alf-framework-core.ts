// ALF Core Framework Definition
// Based on the original Active Learning Framework (ALF) document
// This file preserves the core identity and principles of ALF

export const ALF_FRAMEWORK = {
  fullName: 'Active Learning Framework',
  acronym: 'ALF',
  
  purpose: `The Active Learning Framework (ALF) is a strategic guide for educators and administrators to 
design and implement innovative educational opportunities. It is focused on creating learning 
experiences that are relevant to the evolving needs of society and the future workforce. ALF 
emphasizes the development of critical thinking, problem-solving, and adaptability in students, 
preparing them for the uncertainties of the future, including the disruptive impact of technology.`,

  coreApproach: `Engaging students in multi-disciplinary, inquiry-based collaborative learning that 
leverages an iterative creative process consisting of phases of analysis, brainstorming, prototyping, 
and evaluation.`,

  keyPrinciples: {
    activeParticipation: 'Students are active participants, not passive recipients',
    realWorldRelevance: 'Learning connected to real-world problems that matter',
    interdisciplinary: 'Breaking down silos between subjects',
    iterativeProcess: 'Embracing failure as part of the learning journey',
    communityConnection: 'Projects that have meaningful impact on communities',
    studentOwnership: 'Students take ownership of their learning journey'
  },

  // The 4 Key Stages of ALF
  stages: {
    CATALYST: {
      name: 'Catalyst: The Inspiration',
      purpose: 'Spark curiosity and motivate students by identifying issues or themes relevant to their lives and communities',
      components: ['Big Idea', 'Essential Question', 'The Challenge'],
      implementation: [
        'Use news articles, community events, and global challenges as starting points',
        'Encourage students to choose or vote on issues they are passionate about',
        'Connect to multiple subjects for interdisciplinary learning',
        'Use hands-on activities and real-world scenarios'
      ]
    },
    
    ISSUES: {
      name: 'Issues: The Big Ideas',
      purpose: 'Explore underlying themes and societal challenges related to the chosen catalyst',
      components: ['Guiding Questions', 'Comprehensive Research', 'Guest Speakers and Experts', 'Ethical Considerations', 'Interactive Activities'],
      implementation: [
        'Schedule comprehensive research sessions using diverse sources',
        'Invite community members, professionals, and experts',
        'Integrate discussions on ethical implications',
        'Use debates, role-playing, and simulations'
      ]
    },
    
    METHOD: {
      name: 'Method: The Project Output',
      purpose: 'Define tangible outcomes and learning objectives through collaborative projects and iterative prototyping',
      components: ['Collaborative Projects', 'Iterative Prototyping', 'Use of Technology', 'Development of Practical Skills'],
      implementation: [
        'Foster teamwork with diverse groups',
        'Encourage multiple rounds of prototyping and testing',
        'Integrate modern technologies',
        'Focus on practical skills relevant to future careers'
      ]
    },
    
    ENGAGEMENT: {
      name: 'Engagement: The Community Connection',
      purpose: 'Connect student projects to real-world problems through collaboration with community members and experts',
      components: ['Community Partnerships', 'Service Learning', 'Public Exhibitions', 'Real-World Feedback', 'Assessment and Publishing'],
      implementation: [
        'Develop long-term partnerships with local organizations',
        'Incorporate service learning elements',
        'Organize public exhibitions and presentations',
        'Ensure students receive real-world feedback'
      ]
    }
  },

  // The Creative Process (Student-facing component)
  creativeProcess: {
    description: 'The iterative process students follow within ALF projects',
    phases: {
      ANALYZE: {
        name: 'Analyze: Understanding the Problem',
        activities: ['Research', 'Problem Identification', 'Critical Thinking'],
        mapsTo: 'CATALYST'
      },
      BRAINSTORM: {
        name: 'Brainstorm: Generating Opportunities',
        activities: ['Idea Generation', 'Exploring Connections', 'Narrowing Focus'],
        mapsTo: 'ISSUES'
      },
      PROTOTYPE: {
        name: 'Prototype: Bringing Ideas to Life',
        activities: ['Building Prototypes', 'Testing', 'Iteration'],
        mapsTo: 'METHOD'
      },
      EVALUATE: {
        name: 'Evaluate: Reflecting and Refining',
        activities: ['Feedback Gathering', 'Critical Reflection', 'Final Adjustments'],
        mapsTo: 'ENGAGEMENT'
      }
    }
  },

  // Key distinctions
  distinctions: {
    frameworkVsProcess: {
      framework: 'ALF is about designing and structuring educational programs—it\'s a higher-level guide for creating learning environments that prepare students for the future.',
      process: 'Creative Process is about guiding students through the journey of learning and creating—it\'s a hands-on, detailed guide that helps students navigate the specific steps of a project within an Active Learning environment.'
    }
  },

  // Implementation levels
  implementationExamples: {
    elementary: {
      project: 'Designing a School Garden',
      bigIdea: 'Environmental Sustainability',
      essentialQuestion: 'How can we create a sustainable garden at our school?',
      challenge: 'Designing and maintaining the garden'
    },
    middle: {
      project: 'Creating a Historical Documentary',
      bigIdea: 'Local History',
      essentialQuestion: 'What significant events shaped our community?',
      challenge: 'Producing a documentary'
    },
    high: {
      project: 'Developing a Business Plan for a Social Enterprise',
      bigIdea: 'Social Entrepreneurship',
      essentialQuestion: 'How can we create a business that addresses a social issue?',
      challenge: 'Developing a business plan'
    }
  },

  // Core values
  values: {
    studentEmpowerment: 'Place students at the center of their learning journey',
    realWorldImpact: 'Create meaningful contributions to communities',
    lifelongLearning: 'Foster a love of learning that extends beyond the classroom',
    criticalThinking: 'Develop skills to navigate an increasingly complex world',
    collaboration: 'Learn to work effectively in diverse teams',
    innovation: 'Encourage creative solutions to real problems'
  }
};

// ALF Coach specific adaptations
export const ALF_COACH_ADAPTATIONS = {
  // Important terminology note:
  // - The framework is "Active Learning Framework" (ALF)
  // - The deliverables stage uses "Authentic" to mean genuine/real-world connected
  // - This is intentional: Active framework produces Authentic deliverables
  
  terminologyNote: {
    framework: 'Active Learning Framework (ALF)',
    deliverables: 'Authentic Deliverables (genuine, real-world connected outcomes)',
    reasoning: 'The Active Learning Framework produces Authentic (genuine) deliverables'
  },

  anachronisticElement: {
    description: 'ALF Coach adds a unique twist by encouraging temporal/contextual bridges',
    examples: [
      'Fashion as Revolution (historical fashion movements applied to modern social change)',
      'Games Across Civilizations (ancient games reimagined for modern learning)',
      'Labubu Dolls During Rome Empire (modern pop culture in historical contexts)'
    ],
    purpose: 'Create unexpected connections that spark deeper thinking and creativity'
  },

  tenStepJourney: {
    description: 'ALF Coach adapts the 4-stage ALF into a 10-step journey across 3 stages',
    originalToCoachMapping: {
      'Catalyst (ALF)': 'Ideation Stage (Big Idea, Essential Question, Challenge)',
      'Issues (ALF)': 'Integrated into Ideation & Journey planning',  
      'Method (ALF)': 'Journey Stage (Phases, Activities, Resources)',
      'Engagement (ALF)': 'Deliverables Stage (Milestones, Rubric, Impact)'
    },
    stages: {
      IDEATION: {
        steps: ['Big Idea', 'Essential Question', 'Anachronistic Challenge'],
        mapsTo: 'Catalyst + Issues',
        description: 'Spark curiosity with anachronistic connections'
      },
      JOURNEY: {
        steps: ['Phases', 'Activities', 'Resources'],
        mapsTo: 'Method',
        description: 'Design the learning path with iterative prototyping'
      },
      DELIVERABLES: {
        steps: ['Milestones', 'Rubric', 'Impact Plan'],
        mapsTo: 'Engagement',
        description: 'Create authentic assessments with real-world connection'
      }
    }
  },

  aiEnhancement: {
    description: 'AI helps educators craft and refine each component',
    capabilities: [
      'Generate contextual suggestions based on educator input',
      'Provide examples from successful implementations',
      'Help refine ideas to be more engaging and impactful',
      'Support alignment with educational standards'
    ]
  }
};

// Export helper functions
export function getStageByName(stageName: string) {
  return Object.values(ALF_FRAMEWORK.stages).find(
    stage => stage.name.toLowerCase().includes(stageName.toLowerCase())
  );
}

export function getCreativePhaseByActivity(activity: string) {
  return Object.values(ALF_FRAMEWORK.creativeProcess.phases).find(
    phase => phase.activities.some(a => a.toLowerCase().includes(activity.toLowerCase()))
  );
}

export function isALFPrinciple(concept: string): boolean {
  const principles = Object.values(ALF_FRAMEWORK.keyPrinciples);
  return principles.some(principle => 
    principle.toLowerCase().includes(concept.toLowerCase())
  );
}