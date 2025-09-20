/**
 * Coaching Conversation Architecture for Hero Project Creation
 *
 * Transforms educators' initial ideas into sophisticated Hero Projects through
 * systematic pedagogical coaching conversations that build authentic learning experiences.
 */

export interface CoachingStage {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  duration: string;
  prerequisites: string[];
  nextStages: string[];
  exitCriteria: CoachingCriteria[];
}

export interface CoachingCriteria {
  type: 'required' | 'preferred' | 'optional';
  description: string;
  validator: (data: any) => boolean;
  guidance: string;
}

export interface CoachingPrompt {
  id: string;
  stageId: string;
  type: 'open' | 'guided' | 'confirmatory' | 'clarifying';
  content: string;
  followUps: string[];
  triggers: string[];
  scaffolds: CoachingScaffold[];
}

export interface CoachingScaffold {
  level: 'novice' | 'developing' | 'proficient' | 'expert';
  support: string;
  examples: string[];
  resources: string[];
}

/**
 * Hero Project Coaching Stages
 *
 * Based on design thinking methodology and authentic learning principles:
 * 1. Discovery & Context - Understanding the educator's context and constraints
 * 2. Empathy & Stakeholders - Identifying authentic community partnerships
 * 3. Problem Framing - Defining real-world challenges students will address
 * 4. Learning Design - Aligning standards with authentic outcomes
 * 5. Experience Architecture - Designing the student journey and checkpoints
 * 6. Assessment Integration - Creating authentic assessment and documentation
 * 7. Implementation Planning - Building practical implementation support
 */

export const HERO_COACHING_STAGES: Record<string, CoachingStage> = {
  DISCOVERY_CONTEXT: {
    id: 'DISCOVERY_CONTEXT',
    name: 'Discovery & Context Setting',
    description: 'Understanding the educator\'s teaching context, constraints, and aspirations',
    objectives: [
      'Capture educator\'s subject area and grade level',
      'Understand available time, resources, and constraints',
      'Identify educator\'s comfort with project-based learning',
      'Surface initial project ideas or inspirations'
    ],
    duration: '10-15 minutes',
    prerequisites: [],
    nextStages: ['EMPATHY_STAKEHOLDERS'],
    exitCriteria: [
      {
        type: 'required',
        description: 'Subject area and grade level identified',
        validator: (data) => data.context?.subject && data.context?.gradeLevel,
        guidance: 'We need to understand your teaching context to design an appropriate project'
      },
      {
        type: 'required',
        description: 'Time constraints and resources understood',
        validator: (data) => data.context?.duration && data.context?.resources,
        guidance: 'Understanding your constraints helps us design a realistic project'
      },
      {
        type: 'preferred',
        description: 'Initial project inspiration captured',
        validator: (data) => data.ideation?.initialInspiration,
        guidance: 'Having a starting point helps guide our design process'
      }
    ]
  },

  EMPATHY_STAKEHOLDERS: {
    id: 'EMPATHY_STAKEHOLDERS',
    name: 'Empathy & Stakeholder Identification',
    description: 'Identifying authentic community partners and real-world connections',
    objectives: [
      'Identify potential community partners and stakeholders',
      'Understand local community needs and opportunities',
      'Connect project to authentic audiences beyond the classroom',
      'Establish real-world relevance and impact potential'
    ],
    duration: '15-20 minutes',
    prerequisites: ['DISCOVERY_CONTEXT'],
    nextStages: ['PROBLEM_FRAMING'],
    exitCriteria: [
      {
        type: 'required',
        description: 'At least one authentic community stakeholder identified',
        validator: (data) => data.stakeholders?.community?.length > 0,
        guidance: 'Hero Projects require real-world connections beyond the classroom'
      },
      {
        type: 'preferred',
        description: 'Multiple stakeholder perspectives considered',
        validator: (data) => data.stakeholders?.perspectives?.length > 1,
        guidance: 'Multiple perspectives enrich the learning experience'
      },
      {
        type: 'required',
        description: 'Authentic audience for student work identified',
        validator: (data) => data.impact?.audience,
        guidance: 'Students need real audiences to make their work meaningful'
      }
    ]
  },

  PROBLEM_FRAMING: {
    id: 'PROBLEM_FRAMING',
    name: 'Problem Framing & Challenge Definition',
    description: 'Defining the real-world challenge students will address through their learning',
    objectives: [
      'Frame a compelling, authentic problem or challenge',
      'Ensure problem is appropriately scoped for student capabilities',
      'Connect problem to community stakeholder needs',
      'Establish clear success criteria for student solutions'
    ],
    duration: '20-25 minutes',
    prerequisites: ['EMPATHY_STAKEHOLDERS'],
    nextStages: ['LEARNING_DESIGN'],
    exitCriteria: [
      {
        type: 'required',
        description: 'Clear problem statement articulated',
        validator: (data) => data.challenge?.problemStatement,
        guidance: 'Students need a clear challenge to focus their efforts'
      },
      {
        type: 'required',
        description: 'Problem is appropriately scoped for grade level',
        validator: (data) => data.challenge?.scopeValidated,
        guidance: 'Challenge must be achievable yet meaningful for your students'
      },
      {
        type: 'preferred',
        description: 'Multiple solution pathways possible',
        validator: (data) => data.challenge?.solutionDiversity,
        guidance: 'Good challenges allow for diverse student approaches'
      }
    ]
  },

  LEARNING_DESIGN: {
    id: 'LEARNING_DESIGN',
    name: 'Learning Design & Standards Alignment',
    description: 'Connecting authentic problem-solving to rigorous academic standards',
    objectives: [
      'Identify relevant academic standards and learning objectives',
      'Design authentic performance tasks that demonstrate mastery',
      'Create differentiation strategies for diverse learners',
      'Establish formative and summative assessment approaches'
    ],
    duration: '25-30 minutes',
    prerequisites: ['PROBLEM_FRAMING'],
    nextStages: ['EXPERIENCE_ARCHITECTURE'],
    exitCriteria: [
      {
        type: 'required',
        description: 'Key academic standards identified and aligned',
        validator: (data) => data.standards?.primary?.length > 0,
        guidance: 'Hero Projects must meet rigorous academic standards'
      },
      {
        type: 'required',
        description: 'Performance tasks clearly defined',
        validator: (data) => data.assessment?.performanceTasks?.length > 0,
        guidance: 'Students need clear ways to demonstrate their learning'
      },
      {
        type: 'preferred',
        description: 'Differentiation strategies included',
        validator: (data) => data.differentiation?.strategies?.length > 0,
        guidance: 'Great projects work for all learners'
      }
    ]
  },

  EXPERIENCE_ARCHITECTURE: {
    id: 'EXPERIENCE_ARCHITECTURE',
    name: 'Experience Architecture & Student Journey',
    description: 'Designing the student learning journey with iterative design thinking phases',
    objectives: [
      'Map student journey through design thinking phases',
      'Create meaningful milestones and checkpoints',
      'Design collaboration structures and team formation',
      'Plan for iterative prototyping and feedback cycles'
    ],
    duration: '30-35 minutes',
    prerequisites: ['LEARNING_DESIGN'],
    nextStages: ['ASSESSMENT_INTEGRATION'],
    exitCriteria: [
      {
        type: 'required',
        description: 'Student journey phases clearly mapped',
        validator: (data) => data.journey?.phases?.length >= 3,
        guidance: 'Students need a clear progression through the project'
      },
      {
        type: 'required',
        description: 'Key milestones and deliverables defined',
        validator: (data) => data.journey?.milestones?.length > 0,
        guidance: 'Milestones help students track progress and stay motivated'
      },
      {
        type: 'preferred',
        description: 'Collaboration structures planned',
        validator: (data) => data.collaboration?.structures,
        guidance: 'Collaboration is essential for real-world problem solving'
      }
    ]
  },

  ASSESSMENT_INTEGRATION: {
    id: 'ASSESSMENT_INTEGRATION',
    name: 'Assessment Integration & Portfolio Documentation',
    description: 'Creating authentic assessment strategies and professional portfolio development',
    objectives: [
      'Design rubrics that assess both content and process',
      'Create portfolio documentation systems',
      'Plan peer and self-assessment opportunities',
      'Establish authentic audience feedback mechanisms'
    ],
    duration: '20-25 minutes',
    prerequisites: ['EXPERIENCE_ARCHITECTURE'],
    nextStages: ['IMPLEMENTATION_PLANNING'],
    exitCriteria: [
      {
        type: 'required',
        description: 'Comprehensive rubric developed',
        validator: (data) => data.assessment?.rubric?.criteria?.length > 0,
        guidance: 'Clear assessment criteria help students understand expectations'
      },
      {
        type: 'preferred',
        description: 'Portfolio structure defined',
        validator: (data) => data.portfolio?.structure,
        guidance: 'Portfolios help students document and reflect on their learning'
      },
      {
        type: 'preferred',
        description: 'Peer assessment integrated',
        validator: (data) => data.assessment?.peerAssessment,
        guidance: 'Peer feedback develops critical thinking and communication skills'
      }
    ]
  },

  IMPLEMENTATION_PLANNING: {
    id: 'IMPLEMENTATION_PLANNING',
    name: 'Implementation Planning & Teacher Support',
    description: 'Building practical implementation support and contingency planning',
    objectives: [
      'Create week-by-week implementation timeline',
      'Identify required resources and materials',
      'Plan for common challenges and solutions',
      'Establish parent and administrator communication'
    ],
    duration: '15-20 minutes',
    prerequisites: ['ASSESSMENT_INTEGRATION'],
    nextStages: ['HERO_TRANSFORMATION'],
    exitCriteria: [
      {
        type: 'required',
        description: 'Implementation timeline created',
        validator: (data) => data.implementation?.timeline?.length > 0,
        guidance: 'A clear timeline helps ensure successful project execution'
      },
      {
        type: 'required',
        description: 'Resource requirements identified',
        validator: (data) => data.resources?.required?.length > 0,
        guidance: 'Knowing what you need prevents implementation obstacles'
      },
      {
        type: 'preferred',
        description: 'Contingency plans developed',
        validator: (data) => data.implementation?.contingencies,
        guidance: 'Having backup plans reduces stress and ensures success'
      }
    ]
  },

  HERO_TRANSFORMATION: {
    id: 'HERO_TRANSFORMATION',
    name: 'Hero Project Transformation',
    description: 'Converting the designed project into a polished Hero Project format',
    objectives: [
      'Generate publication-ready Hero Project documentation',
      'Create teacher implementation guides',
      'Develop student-facing project materials',
      'Prepare for community showcasing'
    ],
    duration: '10-15 minutes',
    prerequisites: ['IMPLEMENTATION_PLANNING'],
    nextStages: [],
    exitCriteria: [
      {
        type: 'required',
        description: 'Hero Project documentation generated',
        validator: (data) => data.heroTransformation?.completed,
        guidance: 'Your project is ready for implementation and sharing'
      }
    ]
  }
};

/**
 * Coaching Prompts Library
 * Contextual prompts that guide educators through each stage
 */
export const COACHING_PROMPTS: Record<string, CoachingPrompt[]> = {
  DISCOVERY_CONTEXT: [
    {
      id: 'context_subject_grade',
      stageId: 'DISCOVERY_CONTEXT',
      type: 'open',
      content: 'What subject do you teach, and what grade level are you working with? I want to understand your teaching context so we can design a project that fits perfectly.',
      followUps: [
        'How comfortable are you with project-based learning?',
        'What constraints do you typically face in your classroom?',
        'Do you have any initial ideas for a project topic?'
      ],
      triggers: ['subject', 'grade', 'teach'],
      scaffolds: [
        {
          level: 'novice',
          support: 'No worries if you\'re new to project-based learning! I\'ll guide you through everything step by step.',
          examples: [
            'Elementary Science: Weather patterns affecting local agriculture',
            'Middle School Social Studies: Local history preservation project',
            'High School English: Community storytelling initiative'
          ],
          resources: ['PBL Introduction Guide', 'Grade-Level Standards Reference']
        }
      ]
    },
    {
      id: 'context_constraints',
      stageId: 'DISCOVERY_CONTEXT',
      type: 'guided',
      content: 'Let\'s talk about your practical constraints. How much time do you have for this project, and what resources are available to you?',
      followUps: [
        'What technology access do your students have?',
        'Are there any school policies that might affect our project design?',
        'Do you have any community connections we could leverage?'
      ],
      triggers: ['time', 'duration', 'resources', 'constraints'],
      scaffolds: []
    }
  ],

  EMPATHY_STAKEHOLDERS: [
    {
      id: 'stakeholder_community',
      stageId: 'EMPATHY_STAKEHOLDERS',
      type: 'open',
      content: 'Great projects connect to real-world stakeholders. Who in your community might benefit from student work or could serve as authentic partners?',
      followUps: [
        'What local organizations align with your subject area?',
        'Are there community issues your students care about?',
        'Who could serve as mentors or audience for student presentations?'
      ],
      triggers: ['community', 'stakeholders', 'partners'],
      scaffolds: [
        {
          level: 'novice',
          support: 'Think broadly about community connections - local businesses, nonprofits, government offices, cultural institutions.',
          examples: [
            'Local environmental groups for science projects',
            'Historical societies for social studies',
            'Community centers for social impact projects',
            'Local businesses for entrepreneurship projects'
          ],
          resources: ['Community Partner Guide', 'Stakeholder Mapping Template']
        }
      ]
    }
  ],

  PROBLEM_FRAMING: [
    {
      id: 'problem_definition',
      stageId: 'PROBLEM_FRAMING',
      type: 'guided',
      content: 'Now let\'s frame the challenge your students will tackle. What real-world problem could they address that connects to your subject area and community partners?',
      followUps: [
        'How can students make a meaningful impact on this problem?',
        'What would success look like from the community\'s perspective?',
        'How can we scope this appropriately for your students\' capabilities?'
      ],
      triggers: ['problem', 'challenge', 'issue'],
      scaffolds: [
        {
          level: 'developing',
          support: 'Good problems are authentic, appropriately complex, and allow for multiple solution approaches.',
          examples: [
            'How might we help our community prepare for extreme weather?',
            'How might we preserve and share local cultural stories?',
            'How might we improve accessibility in our school/community?'
          ],
          resources: ['Problem Framing Guide', 'Challenge Scoping Rubric']
        }
      ]
    }
  ],

  LEARNING_DESIGN: [
    {
      id: 'standards_alignment',
      stageId: 'LEARNING_DESIGN',
      type: 'guided',
      content: 'Let\'s connect your project to academic standards. Which key standards will students master through this authentic problem-solving work?',
      followUps: [
        'How will students demonstrate mastery of these standards?',
        'What differentiation strategies will ensure all students can succeed?',
        'How will you assess both content knowledge and 21st-century skills?'
      ],
      triggers: ['standards', 'objectives', 'learning', 'assessment'],
      scaffolds: [
        {
          level: 'proficient',
          support: 'Focus on power standards that naturally emerge from authentic problem-solving.',
          examples: [
            'NGSS Engineering Design Process',
            'Common Core Mathematical Practices',
            'C3 Framework Inquiry Arc',
            '21st Century Skills Framework'
          ],
          resources: ['Standards Alignment Tool', 'Differentiation Strategies Database']
        }
      ]
    }
  ]
};

/**
 * Stage Transition Logic
 * Determines when coaching should move between stages
 */
export class CoachingStageManager {
  private currentStage: string = 'DISCOVERY_CONTEXT';
  private stageData: Record<string, any> = {};
  private conversationHistory: any[] = [];

  getCurrentStage(): string {
    return this.currentStage;
  }

  canAdvanceToStage(targetStage: string): boolean {
    const stage = HERO_COACHING_STAGES[targetStage];
    if (!stage) return false;

    // Check prerequisites
    return stage.prerequisites.every(prereq =>
      this.isStageComplete(prereq)
    );
  }

  isStageComplete(stageId: string): boolean {
    const stage = HERO_COACHING_STAGES[stageId];
    if (!stage) return false;

    const requiredCriteria = stage.exitCriteria.filter(c => c.type === 'required');
    return requiredCriteria.every(criteria =>
      criteria.validator(this.stageData)
    );
  }

  advanceStage(): string | null {
    const currentStageConfig = HERO_COACHING_STAGES[this.currentStage];

    if (!this.isStageComplete(this.currentStage)) {
      return null; // Cannot advance yet
    }

    // Find next available stage
    const nextStage = currentStageConfig.nextStages.find(stageId =>
      this.canAdvanceToStage(stageId)
    );

    if (nextStage) {
      this.currentStage = nextStage;
      return nextStage;
    }

    return null;
  }

  updateStageData(data: any): void {
    this.stageData = { ...this.stageData, ...data };
  }

  getStageProgress(): { completed: number; total: number; percentage: number } {
    const totalStages = Object.keys(HERO_COACHING_STAGES).length;
    const completedStages = Object.keys(HERO_COACHING_STAGES).filter(stageId =>
      this.isStageComplete(stageId)
    ).length;

    return {
      completed: completedStages,
      total: totalStages,
      percentage: Math.round((completedStages / totalStages) * 100)
    };
  }

  getNextPrompt(): CoachingPrompt | null {
    const stagePrompts = COACHING_PROMPTS[this.currentStage];
    if (!stagePrompts || stagePrompts.length === 0) return null;

    // Simple prompt selection - could be enhanced with AI
    return stagePrompts[0];
  }

  getUnmetCriteria(): CoachingCriteria[] {
    const stage = HERO_COACHING_STAGES[this.currentStage];
    if (!stage) return [];

    return stage.exitCriteria.filter(criteria =>
      !criteria.validator(this.stageData)
    );
  }
}

/**
 * Integration with HeroProjectTransformer
 */
export interface CoachingToHeroTransformation {
  coachingData: Record<string, any>;
  heroProjectData: any;
  transformationLevel: 'comprehensive' | 'publication';
  confidence: number;
}

export class CoachingHeroIntegration {
  static convertCoachingDataToHeroProject(
    stageManager: CoachingStageManager
  ): CoachingToHeroTransformation {
    const stageData = stageManager.stageData;

    // Convert coaching conversation data to UnifiedProjectData format
    const unifiedData = {
      id: `coached_${Date.now()}`,
      title: stageData.challenge?.problemStatement || 'Hero Project',
      wizardData: {
        subject: stageData.context?.subject,
        ageGroup: stageData.context?.gradeLevel,
        duration: stageData.context?.duration,
        motivation: stageData.empathy?.motivation,
        scope: stageData.impact?.scope,
        vision: stageData.challenge?.vision
      },
      capturedData: {
        'ideation.bigIdea': stageData.challenge?.problemStatement,
        'ideation.essentialQuestion': stageData.learning?.essentialQuestion,
        'ideation.challenge': stageData.challenge?.challenge,
        'stakeholders.community': stageData.stakeholders?.community,
        'standards.primary': stageData.standards?.primary,
        'journey.phases': stageData.journey?.phases,
        'assessment.rubric': stageData.assessment?.rubric,
        'implementation.timeline': stageData.implementation?.timeline
      }
    };

    const transformationContext = {
      educatorPreferences: {
        teachingStyle: stageData.context?.teachingStyle || 'collaborative',
        technologyComfort: stageData.context?.technologyComfort || 'medium'
      },
      schoolContext: {
        type: stageData.context?.schoolType,
        resources: stageData.context?.resources,
        communityType: stageData.context?.communityType
      },
      standardsAlignment: {
        primary: this.mapStandardsFramework(stageData.standards?.framework),
        secondary: stageData.standards?.secondary
      },
      enhancementGoals: {
        priorityAreas: ['community-connection', 'real-world-application', 'assessment'],
        emphasisLevel: 'comprehensive' as const
      }
    };

    return {
      coachingData: stageData,
      heroProjectData: unifiedData,
      transformationLevel: 'comprehensive',
      confidence: stageManager.getStageProgress().percentage / 100
    };
  }

  private static mapStandardsFramework(framework: string): 'common-core' | 'ngss' | 'state-specific' | 'international' {
    if (framework?.toLowerCase().includes('common core')) return 'common-core';
    if (framework?.toLowerCase().includes('ngss')) return 'ngss';
    if (framework?.toLowerCase().includes('international')) return 'international';
    return 'state-specific';
  }
}