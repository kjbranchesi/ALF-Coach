/**
 * wizardExamples.ts - Rich examples database for Wizard enhancement
 * Provides contextual examples and inspiration for each field
 */

export interface Example {
  id: string;
  category: string;
  title: string;
  description: string;
  tags?: string[];
  gradeLevel?: string;
  duration?: string;
}

export interface SubjectCombination {
  primary: string;
  secondary: string;
  description: string;
  projectIdea: string;
}

export const WIZARD_EXAMPLES = {
  visions: {
    skills: [
      {
        id: 'v1',
        category: 'Skills Development',
        title: 'Build critical thinking through scientific investigation',
        description: 'Students will develop hypothesis testing, data analysis, and evidence-based reasoning skills through hands-on experiments',
        tags: ['science', 'inquiry', 'analysis']
      },
      {
        id: 'v2',
        category: 'Skills Development',
        title: 'Master collaborative problem-solving in real-world contexts',
        description: 'Teams will learn to communicate effectively, delegate tasks, and synthesize diverse perspectives to solve complex challenges',
        tags: ['teamwork', 'communication', 'leadership']
      },
      {
        id: 'v3',
        category: 'Skills Development',
        title: 'Develop computational thinking and digital literacy',
        description: 'Students will learn to break down problems, recognize patterns, and create algorithmic solutions using technology',
        tags: ['coding', 'logic', 'technology']
      }
    ],
    knowledge: [
      {
        id: 'k1',
        category: 'Knowledge Building',
        title: 'Understand ecosystem interdependencies and environmental impact',
        description: 'Students will explore how human actions affect natural systems and develop solutions for sustainability',
        tags: ['environment', 'ecology', 'sustainability']
      },
      {
        id: 'k2',
        category: 'Knowledge Building',
        title: 'Explore historical events through multiple perspectives',
        description: 'Learners will analyze primary sources, understand causation, and connect past events to current issues',
        tags: ['history', 'social studies', 'analysis']
      },
      {
        id: 'k3',
        category: 'Knowledge Building',
        title: 'Master mathematical concepts through real-world applications',
        description: 'Students will see how algebra, geometry, and statistics solve authentic problems in engineering and design',
        tags: ['math', 'application', 'problem-solving']
      }
    ],
    creativity: [
      {
        id: 'c1',
        category: 'Creative Expression',
        title: 'Design innovative solutions to community challenges',
        description: 'Students will prototype, iterate, and present original solutions that address real local needs',
        tags: ['design', 'innovation', 'community']
      },
      {
        id: 'c2',
        category: 'Creative Expression',
        title: 'Create multimedia narratives that inspire change',
        description: 'Learners will combine writing, visual arts, and technology to tell compelling stories that matter',
        tags: ['storytelling', 'media', 'advocacy']
      },
      {
        id: 'c3',
        category: 'Creative Expression',
        title: 'Build functional prototypes using engineering design',
        description: 'Teams will imagine, plan, create, and test original devices that solve specific problems',
        tags: ['engineering', 'maker', 'prototype']
      }
    ],
    impact: [
      {
        id: 'i1',
        category: 'Social Impact',
        title: 'Create positive change in our school community',
        description: 'Students will identify needs, develop solutions, and implement improvements that benefit everyone',
        tags: ['service', 'leadership', 'school']
      },
      {
        id: 'i2',
        category: 'Social Impact',
        title: 'Connect with experts and share learning publicly',
        description: 'Learners will engage with professionals, present findings, and contribute to real-world knowledge',
        tags: ['authentic', 'presentation', 'professional']
      },
      {
        id: 'i3',
        category: 'Social Impact',
        title: 'Develop solutions that address UN Sustainable Development Goals',
        description: 'Students will tackle global challenges locally, creating scalable solutions for worldwide issues',
        tags: ['global', 'SDGs', 'sustainability']
      }
    ]
  },

  subjects: {
    steam: [
      {
        primary: 'Science',
        secondary: 'Art',
        description: 'Scientific Illustration & Data Visualization',
        projectIdea: 'Create detailed field guides or infographics that communicate complex scientific concepts'
      },
      {
        primary: 'Technology',
        secondary: 'Music',
        description: 'Digital Music Production & Sound Engineering',
        projectIdea: 'Build electronic instruments or create podcasts about STEM topics'
      },
      {
        primary: 'Engineering',
        secondary: 'Math',
        description: 'Structural Design & Mathematical Modeling',
        projectIdea: 'Design and test bridges using geometry and physics principles'
      },
      {
        primary: 'Math',
        secondary: 'Art',
        description: 'Geometric Art & Mathematical Patterns',
        projectIdea: 'Explore fractals, tessellations, and the golden ratio in nature and design'
      },
      {
        primary: 'Environmental Science',
        secondary: 'Social Studies',
        description: 'Climate Justice & Community Action',
        projectIdea: 'Research local environmental issues and propose policy solutions'
      },
      {
        primary: 'Computer Science',
        secondary: 'Literature',
        description: 'Interactive Storytelling & Game Design',
        projectIdea: 'Create choose-your-own-adventure stories or educational games'
      }
    ],
    
    single: [
      'Biology', 'Chemistry', 'Physics', 'Earth Science', 'Astronomy',
      'Algebra', 'Geometry', 'Statistics', 'Calculus',
      'Computer Science', 'Robotics', 'Digital Media',
      'English Literature', 'Creative Writing', 'World Languages',
      'US History', 'World History', 'Geography', 'Economics',
      'Visual Arts', 'Music', 'Theater', 'Dance',
      'Physical Education', 'Health', 'Nutrition'
    ]
  },

  timelines: {
    short: {
      examples: [
        {
          title: 'Water Quality Testing Sprint',
          duration: '2 weeks',
          description: 'Test local water sources, analyze data, present findings to community',
          milestones: ['Research & Planning (3 days)', 'Data Collection (4 days)', 'Analysis (3 days)', 'Presentation Prep (3 days)', 'Final Presentation (1 day)']
        },
        {
          title: 'Design Thinking Challenge',
          duration: '3 weeks',
          description: 'Rapid prototype solutions for school improvement',
          milestones: ['Empathize & Define (4 days)', 'Ideate (3 days)', 'Prototype (5 days)', 'Test & Iterate (3 days)', 'Showcase (1 day)']
        }
      ],
      tips: [
        'Focus on one clear deliverable',
        'Keep research phase brief',
        'Plan for daily check-ins',
        'Build in catch-up time'
      ]
    },
    
    medium: {
      examples: [
        {
          title: 'Sustainable Garden Project',
          duration: '6 weeks',
          description: 'Plan, build, and maintain a school garden with curriculum integration',
          milestones: ['Research & Design (2 weeks)', 'Site Preparation (1 week)', 'Planting & Building (1 week)', 'Maintenance & Data (1 week)', 'Harvest & Reflection (1 week)']
        },
        {
          title: 'Historical Documentary',
          duration: '8 weeks',
          description: 'Research, script, film, and edit a documentary on local history',
          milestones: ['Research Phase (2 weeks)', 'Script Development (1 week)', 'Interviews & Filming (2 weeks)', 'Editing (2 weeks)', 'Screening & Reflection (1 week)']
        }
      ],
      tips: [
        'Include multiple drafts/iterations',
        'Plan for expert consultations',
        'Build in peer review cycles',
        'Allow time for deep research'
      ]
    },
    
    long: {
      examples: [
        {
          title: 'Community Partnership Initiative',
          duration: '16 weeks',
          description: 'Partner with local organizations to address authentic community needs',
          milestones: ['Partnership Development (3 weeks)', 'Needs Assessment (3 weeks)', 'Solution Design (4 weeks)', 'Implementation (4 weeks)', 'Impact Evaluation (2 weeks)']
        },
        {
          title: 'Student Business Venture',
          duration: 'Full semester',
          description: 'Create and run a real student business from concept to market',
          milestones: ['Market Research (3 weeks)', 'Business Planning (3 weeks)', 'Product Development (4 weeks)', 'Launch & Sales (4 weeks)', 'Analysis & Reflection (2 weeks)']
        }
      ],
      tips: [
        'Plan for holiday breaks',
        'Include multiple presentation opportunities',
        'Build in flexibility for pivots',
        'Connect to semester assessments'
      ]
    }
  },

  studentGroups: {
    elementary: {
      k2: {
        characteristics: 'Concrete thinking, need hands-on activities, 15-20 minute attention spans',
        adaptations: 'Use manipulatives, frequent movement breaks, visual instructions, buddy systems',
        exampleProjects: ['Classroom Pet Care', 'Weather Station', 'Community Helpers Study']
      },
      grade35: {
        characteristics: 'Developing abstract thinking, can work in small groups, enjoy investigations',
        adaptations: 'Structured collaboration, graphic organizers, choice menus, scaffolded research',
        exampleProjects: ['Ecosystem in a Bottle', 'Invention Convention', 'Local History Museum']
      }
    },
    
    middle: {
      grade68: {
        characteristics: 'Identity exploration, peer-focused, varied developmental levels',
        adaptations: 'Flexible grouping, student choice, real-world connections, social justice themes',
        exampleProjects: ['Tiny House Design', 'Social Media Campaign', 'Science Fair Investigation']
      }
    },
    
    high: {
      grade912: {
        characteristics: 'Abstract reasoning, future-focused, seek authenticity and autonomy',
        adaptations: 'Student-driven inquiry, expert mentors, college/career connections, independent work time',
        exampleProjects: ['Capstone Research', 'Community Action Project', 'Innovation Challenge']
      }
    },
    
    special: {
      gifted: {
        characteristics: 'Need for complexity, depth, and acceleration',
        adaptations: 'Tiered assignments, independent study options, expert-level resources, open-ended challenges'
      },
      ell: {
        characteristics: 'Varying English proficiency, diverse cultural backgrounds',
        adaptations: 'Visual supports, home language resources, collaborative structures, vocabulary scaffolds'
      },
      inclusion: {
        characteristics: 'Diverse learning needs and abilities',
        adaptations: 'Multiple means of representation, action, and engagement (UDL), assistive technology, modified assessments'
      }
    }
  },

  resources: {
    minimal: [
      'Paper, pencils, and basic supplies',
      'Access to library or internet for research',
      'Outdoor spaces for observation',
      'Recycled/repurposed materials'
    ],
    
    standard: [
      'Chromebooks or tablets (1:1 or shared)',
      'Basic science equipment',
      'Art supplies and craft materials',
      'Presentation tools (projector, speakers)'
    ],
    
    advanced: [
      '3D printer and design software',
      'Robotics kits and programming tools',
      'Video production equipment',
      'Specialized lab equipment',
      'Maker space with tools'
    ],
    
    virtual: [
      'Video conferencing platform',
      'Collaborative online tools (Google Workspace, etc.)',
      'Digital simulation software',
      'Online research databases'
    ]
  }
};

/**
 * Get relevant examples based on user input
 */
export function getRelevantExamples(field: string, input?: string): Example[] {
  switch (field) {
    case 'vision':
      // Return a mix of examples from different categories
      const allVisions = [
        ...WIZARD_EXAMPLES.visions.skills,
        ...WIZARD_EXAMPLES.visions.knowledge,
        ...WIZARD_EXAMPLES.visions.creativity,
        ...WIZARD_EXAMPLES.visions.impact
      ];
      
      if (input && input.length > 3) {
        // Filter based on input keywords
        const keywords = input.toLowerCase().split(' ');
        return allVisions.filter(vision => 
          keywords.some(keyword => 
            vision.title.toLowerCase().includes(keyword) ||
            vision.description.toLowerCase().includes(keyword) ||
            vision.tags?.some(tag => tag.includes(keyword))
          )
        ).slice(0, 4);
      }
      
      // Return diverse selection
      return [
        allVisions.find(v => v.category === 'Skills Development')!,
        allVisions.find(v => v.category === 'Knowledge Building')!,
        allVisions.find(v => v.category === 'Creative Expression')!,
        allVisions.find(v => v.category === 'Social Impact')!
      ].filter(Boolean).slice(0, 4);
      
    default:
      return [];
  }
}

/**
 * Get subject combination suggestions
 */
export function getSubjectCombinations(primarySubject: string): SubjectCombination[] {
  return WIZARD_EXAMPLES.subjects.steam.filter(
    combo => combo.primary.toLowerCase().includes(primarySubject.toLowerCase()) ||
             combo.secondary.toLowerCase().includes(primarySubject.toLowerCase())
  );
}

/**
 * Get timeline examples based on duration
 */
export function getTimelineExamples(duration: 'short' | 'medium' | 'long') {
  return WIZARD_EXAMPLES.timelines[duration] || WIZARD_EXAMPLES.timelines.medium;
}

/**
 * Get student group adaptations
 */
export function getStudentAdaptations(gradeLevel: string) {
  // Parse grade level and return appropriate adaptations
  const level = gradeLevel.toLowerCase();
  
  if (level.includes('k') || level.includes('1') || level.includes('2')) {
    return WIZARD_EXAMPLES.studentGroups.elementary.k2;
  } else if (level.includes('3') || level.includes('4') || level.includes('5')) {
    return WIZARD_EXAMPLES.studentGroups.elementary.grade35;
  } else if (level.includes('6') || level.includes('7') || level.includes('8')) {
    return WIZARD_EXAMPLES.studentGroups.middle.grade68;
  } else if (level.includes('9') || level.includes('10') || level.includes('11') || level.includes('12')) {
    return WIZARD_EXAMPLES.studentGroups.high.grade912;
  }
  
  return null;
}

/**
 * Get resource suggestions based on available tools
 */
export function getResourceSuggestions(resources: string): string[] {
  const lower = resources.toLowerCase();
  
  if (lower.includes('limited') || lower.includes('basic') || lower.includes('minimal')) {
    return WIZARD_EXAMPLES.resources.minimal;
  } else if (lower.includes('3d') || lower.includes('maker') || lower.includes('robot')) {
    return WIZARD_EXAMPLES.resources.advanced;
  } else if (lower.includes('virtual') || lower.includes('online') || lower.includes('remote')) {
    return WIZARD_EXAMPLES.resources.virtual;
  }
  
  return WIZARD_EXAMPLES.resources.standard;
}