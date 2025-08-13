/**
 * helpContent.ts
 * Context-aware help content for different stages and steps
 */

export interface HelpContent {
  title: string;
  description: string;
  tips: string[];
  examples?: string[];
  resources?: { label: string; url?: string }[];
}

// Comprehensive help content organized by stage and step
export const HELP_CONTENT: Record<string, Record<string, HelpContent>> = {
  WELCOME: {
    default: {
      title: 'Getting Started with ALF Coach',
      description: 'Welcome to the Active Learning Framework. This tool helps you design project-based learning experiences that engage students in real-world problem solving.',
      tips: [
        'Start by providing basic information about your class',
        'Be specific about your subject area and grade level',
        'Consider your available time and resources',
        'Think about your learning objectives'
      ]
    },
    subject: {
      title: 'Choosing Your Subject Area',
      description: 'Your subject area determines the content focus and helps tailor suggestions to your curriculum needs.',
      tips: [
        'Be specific (e.g., "Environmental Science" not just "Science")',
        'Consider interdisciplinary connections',
        'Think about real-world applications in your subject',
        'Include any special focus areas or topics'
      ],
      examples: [
        'Environmental Science - Climate Change',
        'History - Local Community Stories',
        'Mathematics - Data Analysis and Statistics',
        'English - Creative Writing and Journalism'
      ]
    },
    gradeLevel: {
      title: 'Grade Level Considerations',
      description: 'Grade level helps determine appropriate complexity, scaffolding needs, and engagement strategies.',
      tips: [
        'Consider developmental readiness',
        'Think about prior knowledge and skills',
        'Account for varying ability levels within your class',
        'Plan for differentiation needs'
      ]
    },
    duration: {
      title: 'Project Duration Planning',
      description: 'The time frame affects project scope, depth of investigation, and assessment opportunities.',
      tips: [
        'Be realistic about available class time',
        'Account for holidays and testing schedules',
        'Build in buffer time for iteration',
        'Consider homework vs. class time balance'
      ],
      examples: [
        '2 weeks - Quick sprint project',
        '4-6 weeks - Standard unit project',
        '8-12 weeks - Deep dive investigation',
        'Semester - Comprehensive capstone'
      ]
    }
  },
  
  IDEATION: {
    default: {
      title: 'Ideation Phase Overview',
      description: 'The Ideation phase establishes the conceptual foundation for your project. You\'ll define the Big Idea, Essential Question, and Challenge that will drive student learning.',
      tips: [
        'Start broad, then narrow your focus',
        'Connect to student interests and experiences',
        'Ensure real-world relevance',
        'Consider available resources and constraints'
      ]
    },
    bigIdea: {
      title: 'Understanding Big Ideas',
      description: 'A Big Idea is the core concept or enduring understanding that anchors your entire project. It should be broad enough to explore deeply yet focused enough to be meaningful.',
      tips: [
        'Should be transferable beyond this specific project',
        'Connects to real-world issues or applications',
        'Allows for multiple perspectives and interpretations',
        'Aligns with curriculum standards and learning goals'
      ],
      examples: [
        'Systems thinking helps us understand complex problems',
        'Human actions have environmental consequences',
        'Stories shape our understanding of identity and culture',
        'Mathematical patterns exist throughout nature',
        'Technology is a tool that can solve problems or create them'
      ],
      resources: [
        { label: 'Understanding by Design Framework' },
        { label: 'Big Ideas in Science Education' },
        { label: 'Concept-Based Curriculum Design' }
      ]
    },
    essentialQuestion: {
      title: 'Crafting Essential Questions',
      description: 'Essential Questions are open-ended inquiries that guide student investigation throughout the project. They cannot be answered with a simple yes/no or by looking up facts.',
      tips: [
        'Start with "How might..." or "Why does..." or "What if..."',
        'Ensure multiple valid answers are possible',
        'Require research, analysis, and critical thinking',
        'Connect directly to your Big Idea',
        'Be engaging and thought-provoking for students'
      ],
      examples: [
        'How might we reduce our school\'s environmental impact?',
        'Why do some communities thrive while others struggle?',
        'What makes a story worth telling?',
        'How can we use math to make better decisions?',
        'What if we could redesign our learning spaces?'
      ],
      resources: [
        { label: 'Essential Questions Guide' },
        { label: 'Question Formulation Technique' }
      ]
    },
    challenge: {
      title: 'Defining Authentic Challenges',
      description: 'The Challenge is the real-world problem or opportunity that students will address. It provides purpose and context for their learning.',
      tips: [
        'Must have a genuine audience beyond the teacher',
        'Should result in a tangible product or solution',
        'Allows for multiple solution approaches',
        'Connects to community needs or interests',
        'Provides opportunity for real impact'
      ],
      examples: [
        'Design a water conservation plan for our school',
        'Create a digital archive of local history',
        'Develop a peer tutoring program for math',
        'Build a community garden that teaches sustainability',
        'Produce a podcast series about social justice issues'
      ],
      resources: [
        { label: 'PBL Challenge Design' },
        { label: 'Authentic Assessment Strategies' }
      ]
    }
  },
  
  JOURNEY: {
    default: {
      title: 'Learning Journey Design',
      description: 'The Learning Journey maps how students will move through the Creative Process phases to tackle the challenge. Each phase builds on the previous one.',
      tips: [
        'Balance structure with student autonomy',
        'Build in opportunities for iteration and revision',
        'Plan for both individual and collaborative work',
        'Include regular check-ins and formative assessment'
      ]
    },
    analyze: {
      title: 'Analyze Phase',
      description: 'In the Analyze phase, students investigate the problem space, gather information, and develop deep understanding of the challenge context.',
      tips: [
        'Students research existing solutions and identify gaps',
        'Conduct stakeholder interviews and surveys',
        'Gather and analyze relevant data',
        'Map the current state of the problem',
        'Identify root causes and contributing factors'
      ],
      examples: [
        'Interview community members about local issues',
        'Research case studies of similar problems',
        'Collect and analyze relevant data sets',
        'Create journey maps or system diagrams',
        'Document current practices and pain points'
      ]
    },
    brainstorm: {
      title: 'Brainstorm Phase',
      description: 'During Brainstorm, students generate diverse solutions through creative thinking exercises and collaborative ideation.',
      tips: [
        'Use design thinking methodologies',
        'Encourage wild ideas without judgment',
        'Build on others\' ideas collaboratively',
        'Explore solutions from different fields',
        'Prioritize quantity over quality initially'
      ],
      examples: [
        'Conduct rapid ideation sessions',
        'Use SCAMPER technique for idea generation',
        'Create mind maps and concept webs',
        'Sketch multiple solution concepts',
        'Get feedback on initial ideas from peers'
      ]
    },
    prototype: {
      title: 'Prototype Phase',
      description: 'In Prototype, students build working models, test their ideas, and refine solutions based on feedback.',
      tips: [
        'Start with low-fidelity prototypes',
        'Test early and often with users',
        'Document iterations and improvements',
        'Focus on core functionality first',
        'Gather feedback systematically'
      ],
      examples: [
        'Build physical or digital models',
        'Create mockups and wireframes',
        'Develop pilot programs or trials',
        'Test with target audience',
        'Iterate based on user feedback'
      ]
    },
    evaluate: {
      title: 'Evaluate Phase',
      description: 'During Evaluate, students assess their solutions, reflect on learning, and present to authentic audiences.',
      tips: [
        'Measure impact against success criteria',
        'Reflect on both process and product',
        'Present to stakeholders for feedback',
        'Document lessons learned',
        'Plan next steps for implementation'
      ],
      examples: [
        'Present to community partners',
        'Conduct formal testing of solutions',
        'Create reflection portfolios',
        'Peer review and assessment',
        'Plan for sustained implementation'
      ]
    }
  },
  
  DELIVERABLES: {
    default: {
      title: 'Defining Success Metrics',
      description: 'Establish clear expectations for both the learning process and final products. Create authentic assessment that values growth and achievement.',
      tips: [
        'Balance process and product assessment',
        'Include self and peer evaluation',
        'Align with real-world quality standards',
        'Provide multiple ways to demonstrate learning'
      ]
    },
    rubric: {
      title: 'Rubric Design',
      description: 'Create clear, student-friendly criteria that guide learning and assessment throughout the project.',
      tips: [
        'Use student-friendly language',
        'Include both academic and 21st-century skills',
        'Co-create with students when possible',
        'Provide exemplars for each level',
        'Focus on growth and improvement'
      ],
      examples: [
        'Content mastery and understanding',
        'Critical thinking and problem solving',
        'Collaboration and communication',
        'Creativity and innovation',
        'Self-direction and project management'
      ]
    },
    milestones: {
      title: 'Milestone Planning',
      description: 'Structure project checkpoints that provide opportunities for feedback, revision, and celebration of progress.',
      tips: [
        'Space milestones evenly throughout project',
        'Include both individual and team deliverables',
        'Build in revision time after feedback',
        'Celebrate incremental achievements',
        'Use milestones for formative assessment'
      ],
      examples: [
        'Research synthesis presentation',
        'Initial prototype demonstration',
        'Peer feedback session',
        'Expert review panel',
        'Final exhibition or presentation'
      ]
    },
    presentation: {
      title: 'Authentic Presentation',
      description: 'Plan how students will share their work with genuine audiences who care about the outcomes.',
      tips: [
        'Identify stakeholders early in the process',
        'Prepare students for professional presentation',
        'Include multiple presentation formats',
        'Document and archive student work',
        'Celebrate achievements publicly'
      ],
      examples: [
        'Community exhibition night',
        'Professional panel presentation',
        'Digital portfolio showcase',
        'Peer teaching sessions',
        'Implementation with partner organizations'
      ]
    }
  }
};

/**
 * Get help content for a specific stage and step
 */
export function getHelpContent(stage: string, step?: string): HelpContent {
  const stageContent = HELP_CONTENT[stage];
  if (!stageContent) {
    return {
      title: 'Help',
      description: 'Get guidance on using ALF Coach to design your project.',
      tips: ['Navigate through each stage', 'Follow the prompts', 'Ask for help when needed']
    };
  }
  
  const content = step ? stageContent[step] : stageContent.default;
  return content || stageContent.default || {
    title: 'Help',
    description: 'Get guidance on this step.',
    tips: []
  };
}

/**
 * Get contextual help based on current message content
 */
export function getContextualHelp(messageContent: string, stage: string): HelpContent {
  const lowerContent = messageContent.toLowerCase();
  
  // Check for keywords to determine which help to show
  if (lowerContent.includes('big idea')) {
    return getHelpContent(stage, 'bigIdea');
  }
  if (lowerContent.includes('essential question')) {
    return getHelpContent(stage, 'essentialQuestion');
  }
  if (lowerContent.includes('challenge')) {
    return getHelpContent(stage, 'challenge');
  }
  if (lowerContent.includes('analyze')) {
    return getHelpContent('JOURNEY', 'analyze');
  }
  if (lowerContent.includes('brainstorm')) {
    return getHelpContent('JOURNEY', 'brainstorm');
  }
  if (lowerContent.includes('prototype')) {
    return getHelpContent('JOURNEY', 'prototype');
  }
  if (lowerContent.includes('evaluate')) {
    return getHelpContent('JOURNEY', 'evaluate');
  }
  if (lowerContent.includes('rubric')) {
    return getHelpContent('DELIVERABLES', 'rubric');
  }
  
  // Default to stage help
  return getHelpContent(stage);
}