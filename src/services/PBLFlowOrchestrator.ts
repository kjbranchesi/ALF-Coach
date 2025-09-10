/**
 * PBLFlowOrchestrator.ts
 * 
 * Orchestrates the 9-step PBL project creation process with conversational flow.
 * Manages state transitions, validations, and progressive disclosure.
 */

export type PBLStepId = 
  | 'PROJECT_INTAKE'           // Step 1: Grade/subject/class profile/schedule/materials
  | 'GOALS_EQ'                 // Step 2: Goals + Essential Question
  | 'STANDARDS_ALIGNMENT'      // Step 3: Framework selection, specific codes
  | 'PHASES_MILESTONES'        // Step 4: 4-5 phases, 6-10 milestones
  | 'ARTIFACTS_RUBRICS'        // Step 5: Tied to milestones
  | 'ROLES_DIFFERENTIATION'    // Step 6: Roles, differentiation, scaffolds
  | 'OUTREACH_EXHIBITION'      // Step 7: Community connections & showcase
  | 'EVIDENCE_LOGISTICS'       // Step 8: Calendar, permissions, assessment
  | 'REVIEW_EXPORT';           // Step 9: Final review & export

export interface PBLProjectState {
  // Current flow position
  currentStep: PBLStepId;
  subStep: string | null;  // For multi-part steps
  messageCountInStep: number;
  totalProgress: number; // 0-100
  
  // Step completion tracking
  stepsCompleted: Set<PBLStepId>;
  stepValidation: Map<PBLStepId, boolean>;
  
  // Conversation state
  awaitingResponse?: {
    type: 'selection' | 'input' | 'confirmation' | 'revision';
    field: string;
    options?: Array<{ id: string; label: string; description?: string }>;
    value?: any;
    validationRules?: ValidationRule[];
  };
  
  // Project data (collected through conversation)
  projectData: {
    // Step 1: Project Intake
    intake: {
      gradeLevel: string;
      subjects: string[];
      primarySubject: string;
      classSize: number;
      classProfile: {
        diverseLearners: boolean;
        englishLearners: boolean;
        giftedStudents: boolean;
        specialNeeds: string[];
      };
      schedule: {
        periodsPerDay: number;
        minutesPerPeriod: number;
        daysPerWeek: number;
        projectDuration: string; // "2-3 weeks", "4-6 weeks", etc.
      };
      availableMaterials: string[];
      technologyAccess: string[];
      spaceConstraints: string[];
    };
    
    // Step 2: Goals & Essential Question
    goalsEQ: {
      learningGoals: string[];
      essentialQuestions: Array<{
        id: string;
        question: string;
        rationale: string;
        selected?: boolean;
      }>;
      selectedEQ: string;
      drivingQuestion: string;
      successCriteria: string[];
    };
    
    // Step 3: Standards Alignment
    standards: {
      framework: 'CCSS' | 'NGSS' | 'State' | 'IB' | 'Custom';
      selectedStandards: Array<{
        code: string;
        description: string;
        category: string;
        depth: 'introduce' | 'develop' | 'master';
      }>;
      crossCurricular: Array<{
        subject: string;
        standards: string[];
      }>;
      skills21stCentury: string[];
    };
    
    // Step 4: Phases & Milestones
    phases: {
      phases: Array<{
        id: string;
        name: string;
        duration: string;
        focus: string;
        activities: string[];
      }>;
      milestones: Array<{
        id: string;
        phaseId: string;
        name: string;
        description: string;
        deliverable: string;
        assessmentType: string;
        dueWeek: number;
      }>;
    };
    
    // Step 5: Artifacts & Rubrics
    artifacts: {
      artifacts: Array<{
        id: string;
        milestoneId: string;
        type: string;
        name: string;
        description: string;
        format: string;
        rubricId?: string;
      }>;
      rubrics: Array<{
        id: string;
        name: string;
        criteria: Array<{
          name: string;
          weight: number;
          levels: Array<{
            level: number;
            description: string;
            points: number;
          }>;
        }>;
      }>;
    };
    
    // Step 6: Roles & Differentiation
    rolesDiff: {
      studentRoles: Array<{
        id: string;
        name: string;
        responsibilities: string[];
        rotationSchedule?: string;
      }>;
      differentiationStrategies: {
        forStruggling: string[];
        forAdvanced: string[];
        forELL: string[];
        forSpecialNeeds: string[];
      };
      scaffolds: Array<{
        type: string;
        description: string;
        whenToUse: string;
        fadeStrategy: string;
      }>;
      groupingStrategy: string;
    };
    
    // Step 7: Outreach & Exhibition
    outreach: {
      communityPartners: Array<{
        type: string;
        organization: string;
        contactPerson?: string;
        role: string;
      }>;
      exhibitionPlan: {
        format: string;
        venue: string;
        audience: string[];
        date: string;
        preparation: string[];
      };
      expertConnections: Array<{
        field: string;
        connectionType: 'guest speaker' | 'mentor' | 'judge' | 'resource';
        scheduling: string;
      }>;
    };
    
    // Step 8: Evidence & Logistics
    logistics: {
      calendar: Array<{
        week: number;
        phase: string;
        activities: string[];
        assessments: string[];
        resources: string[];
      }>;
      permissions: Array<{
        type: string;
        description: string;
        deadline: string;
        status: 'needed' | 'obtained' | 'pending';
      }>;
      assessmentPlan: {
        formative: string[];
        summative: string[];
        selfAssessment: string[];
        peerAssessment: string[];
      };
      resourceList: Array<{
        category: string;
        items: string[];
        source: string;
        cost?: number;
      }>;
    };
    
    // Step 9: Review & Export
    review: {
      completenessCheck: Map<string, boolean>;
      revisions: Array<{
        step: PBLStepId;
        field: string;
        oldValue: any;
        newValue: any;
        timestamp: Date;
      }>;
      exportFormat: 'PDF' | 'Google Docs' | 'Word' | 'Web';
      sharingSettings: {
        shareWithStudents: boolean;
        shareWithParents: boolean;
        shareWithAdmin: boolean;
        publicPortfolio: boolean;
      };
    };
  };
  
  // Conversation context
  conversationContext: {
    tone: 'professional' | 'friendly' | 'encouraging';
    experienceLevel: 'novice' | 'intermediate' | 'expert';
    preferredPacing: 'quick' | 'thorough' | 'detailed';
    lastInteraction: Date;
    sessionDuration: number;
    questionsAsked: number;
    clarificationsNeeded: number;
  };
  
  // Navigation & history
  navigationHistory: Array<{
    from: PBLStepId;
    to: PBLStepId;
    timestamp: Date;
    reason: 'progression' | 'back' | 'jump' | 'revision';
  }>;
  
  // Partial saves for resumption
  partialSaves: Map<PBLStepId, any>;
  lastSaveTimestamp: Date;
}

// Validation rules for inputs
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (input: any) => boolean;
}

// Conversation prompts for natural flow
export const CONVERSATION_PROMPTS: Record<PBLStepId, {
  entry: string[];
  subSteps: Record<string, {
    prompt: string;
    followUp?: string;
    validation?: ValidationRule[];
    suggestions?: string[];
  }>;
  completion: string;
  transition: string;
}> = {
  PROJECT_INTAKE: {
    entry: [
      "Let's start by getting to know your classroom context! This helps me tailor the project perfectly for your students.",
      "First, tell me about your class. What grade level are you teaching?",
      "Great! Let's design a project that fits your unique classroom. What grade are your students in?"
    ],
    subSteps: {
      gradeLevel: {
        prompt: "What grade level are your students? (e.g., 5th grade, 9-10, Year 8)",
        followUp: "Perfect! {gradeLevel} is a great age for project-based learning.",
        validation: [{ type: 'required', message: 'Please specify a grade level' }]
      },
      subjects: {
        prompt: "Which subject areas will this project cover? You can select multiple for an interdisciplinary approach.",
        followUp: "Excellent choice! {subjects} will create rich learning connections.",
        suggestions: ['Science', 'Math', 'Language Arts', 'Social Studies', 'Arts', 'Technology']
      },
      classSize: {
        prompt: "How many students are in your class? This helps me plan group activities.",
        validation: [{ type: 'required', message: 'Please enter the number of students' }]
      },
      classProfile: {
        prompt: "Tell me about your learners. Do you have students with special needs, English learners, or gifted students?",
        followUp: "Thanks for sharing. I'll make sure to include appropriate differentiation strategies."
      },
      schedule: {
        prompt: "How is your class schedule structured? How many periods per day and minutes per period?",
        followUp: "Got it! We'll design the project to fit within your {minutesPerPeriod}-minute periods."
      },
      materials: {
        prompt: "What materials and technology do you have available? (computers, art supplies, maker space, etc.)",
        followUp: "Great! We'll make good use of your {materials}."
      }
    },
    completion: "Perfect! I have a clear picture of your classroom context.",
    transition: "Now let's define what you want students to learn through this project."
  },
  
  GOALS_EQ: {
    entry: [
      "Now for the exciting part - what do you want students to learn and explore?",
      "Let's craft a compelling essential question that will drive student inquiry."
    ],
    subSteps: {
      learningGoals: {
        prompt: "What are your main learning goals for this project? What should students know and be able to do?",
        followUp: "Those are powerful learning goals! Let me help you craft some essential questions.",
        validation: [{ type: 'minLength', value: 20, message: 'Please provide more detail about your learning goals' }]
      },
      essentialQuestions: {
        prompt: "Based on your goals, here are 3 essential questions that could drive this project. Which resonates most with you?",
        followUp: "Excellent choice! '{selectedEQ}' will really engage students in deep thinking."
      },
      drivingQuestion: {
        prompt: "Let's make this more specific for students. How would you phrase this as a driving question they'll investigate?",
        suggestions: [
          "How might we...",
          "What would happen if...",
          "Why does...matter to our community?",
          "How can we use...to solve...?"
        ]
      },
      successCriteria: {
        prompt: "How will you know students have successfully answered this question? What will success look like?",
        followUp: "Clear success criteria! This will help students stay focused."
      }
    },
    completion: "Your essential question and goals are set!",
    transition: "Let's align this with your curriculum standards."
  },
  
  STANDARDS_ALIGNMENT: {
    entry: [
      "Time to connect your project to standards. This ensures curriculum alignment and helps with assessment.",
      "Let's map your project to specific standards and skills."
    ],
    subSteps: {
      framework: {
        prompt: "Which standards framework do you follow? (Common Core, NGSS, State Standards, IB, or Custom)",
        followUp: "Great! I'll help you align with {framework} standards."
      },
      primaryStandards: {
        prompt: "Based on your {primarySubject} focus and {framework}, which standards will you primarily address?",
        followUp: "Perfect alignment! These standards connect well with your essential question."
      },
      crossCurricular: {
        prompt: "Since you're including {subjects}, shall we add standards from those areas too?",
        followUp: "Excellent! This creates authentic interdisciplinary learning."
      },
      skills21st: {
        prompt: "Which 21st-century skills do you want to emphasize? (Critical thinking, collaboration, creativity, communication)",
        suggestions: ['Critical Thinking', 'Collaboration', 'Communication', 'Creativity', 'Digital Literacy', 'Global Awareness']
      }
    },
    completion: "Standards are mapped! Your project has strong curriculum alignment.",
    transition: "Now let's design the project phases and milestones."
  },
  
  PHASES_MILESTONES: {
    entry: [
      "Let's break your project into manageable phases with clear milestones.",
      "I recommend 4-5 phases to maintain momentum. Each phase should have 1-2 key milestones."
    ],
    subSteps: {
      phaseStructure: {
        prompt: "For your {projectDuration} project, I suggest these phases: Launch, Investigate, Create, and Present. Does this work, or would you prefer a different structure?",
        suggestions: [
          "Launch → Investigate → Create → Present",
          "Engage → Explore → Explain → Elaborate → Evaluate",
          "Discover → Define → Develop → Deliver",
          "Research → Design → Build → Test → Share"
        ]
      },
      phaseTiming: {
        prompt: "How would you like to distribute your {projectDuration} across these phases?",
        followUp: "Good pacing! This gives students enough time to dive deep."
      },
      milestones: {
        prompt: "For the {phaseName} phase, what key milestone(s) should students reach?",
        followUp: "That's a clear, measurable milestone!",
        validation: [{ type: 'required', message: 'Each phase needs at least one milestone' }]
      },
      checkpoints: {
        prompt: "When should we check student progress? I recommend checkpoints every 3-4 class periods.",
        followUp: "Regular checkpoints will help keep everyone on track."
      }
    },
    completion: "Your project structure is solid with clear phases and milestones!",
    transition: "Let's define what students will create at each milestone."
  },
  
  ARTIFACTS_RUBRICS: {
    entry: [
      "Now let's specify what students will create and how you'll assess their work.",
      "Each milestone should have a tangible artifact that demonstrates learning."
    ],
    subSteps: {
      artifactTypes: {
        prompt: "For the '{milestoneName}' milestone, what will students create to show their learning?",
        suggestions: [
          "Research report",
          "Prototype or model",
          "Presentation",
          "Digital portfolio",
          "Video documentary",
          "Scientific poster",
          "Design proposal",
          "Performance or demonstration"
        ]
      },
      artifactRequirements: {
        prompt: "What are the key requirements for this {artifactType}? What must it include?",
        followUp: "Clear requirements! Students will know exactly what's expected."
      },
      rubricCriteria: {
        prompt: "What criteria will you use to assess this artifact? I'll help create a rubric.",
        suggestions: [
          "Content Knowledge",
          "Critical Thinking",
          "Communication",
          "Creativity",
          "Collaboration",
          "Process & Effort"
        ]
      },
      rubricLevels: {
        prompt: "For '{criterionName}', how would you describe exemplary vs. developing work?",
        followUp: "This rubric will provide clear feedback to students."
      }
    },
    completion: "Artifacts and assessment rubrics are ready!",
    transition: "Let's plan how students will work together and support diverse learners."
  },
  
  ROLES_DIFFERENTIATION: {
    entry: [
      "Every student learns differently. Let's design roles and supports for all learners.",
      "We'll create student roles and differentiation strategies for your diverse classroom."
    ],
    subSteps: {
      studentRoles: {
        prompt: "What roles will students have in their groups? (e.g., Research Lead, Design Specialist, Project Manager)",
        suggestions: [
          "Research Specialist",
          "Design Lead",
          "Project Manager",
          "Quality Controller",
          "Communications Director",
          "Resource Manager"
        ],
        followUp: "Great roles! This gives everyone ownership."
      },
      roleRotation: {
        prompt: "Will students rotate roles during the project, or keep the same role throughout?",
        followUp: "That approach will help students develop {multiple/specialized} skills."
      },
      differentiation: {
        prompt: "You mentioned having {classProfile}. What supports will you provide for these learners?",
        followUp: "Excellent differentiation strategies!"
      },
      scaffolds: {
        prompt: "What scaffolds will you provide initially that can be gradually removed?",
        suggestions: [
          "Sentence starters",
          "Graphic organizers",
          "Exemplars",
          "Step-by-step guides",
          "Peer mentoring",
          "Check-in conferences"
        ]
      },
      grouping: {
        prompt: "How will you form groups? Mixed-ability, interest-based, or student choice?",
        followUp: "That grouping strategy aligns well with your goals."
      }
    },
    completion: "Roles and differentiation plans are set!",
    transition: "Let's connect your project to the wider community."
  },
  
  OUTREACH_EXHIBITION: {
    entry: [
      "Projects become more meaningful when connected to the real world. Let's plan community connections.",
      "How can we bring in experts and showcase student work to an authentic audience?"
    ],
    subSteps: {
      communityPartners: {
        prompt: "Are there local organizations, businesses, or experts who could contribute to this project?",
        followUp: "Those partnerships will make the project feel real and important!",
        suggestions: [
          "Local businesses",
          "Museums or cultural centers",
          "Universities or colleges",
          "Government agencies",
          "Non-profit organizations",
          "Parent professionals"
        ]
      },
      expertRole: {
        prompt: "How would you like experts to participate? As guest speakers, mentors, or project judges?",
        followUp: "Having experts as {expertRole} will inspire students."
      },
      exhibitionFormat: {
        prompt: "How will students share their final work? A showcase event, online gallery, or community presentation?",
        suggestions: [
          "Exhibition night",
          "Online portfolio",
          "Community presentation",
          "Science fair format",
          "Performance or demonstration",
          "Digital showcase"
        ]
      },
      audience: {
        prompt: "Who should be invited to see student work? The wider the audience, the more motivated students will be!",
        followUp: "A diverse audience will make students feel their work matters."
      },
      exhibitionPrep: {
        prompt: "What will students need to prepare for the exhibition?",
        followUp: "Good planning! Students will be well-prepared to share their learning."
      }
    },
    completion: "Community connections and exhibition plans are ready!",
    transition: "Finally, let's handle the practical details and logistics."
  },
  
  EVIDENCE_LOGISTICS: {
    entry: [
      "Almost done! Let's nail down the practical details to ensure smooth implementation.",
      "We'll create a calendar, identify needed permissions, and finalize assessment plans."
    ],
    subSteps: {
      calendar: {
        prompt: "Let me create a week-by-week calendar. Does this flow work with your school schedule?",
        followUp: "The calendar is set! You'll have a clear roadmap."
      },
      permissions: {
        prompt: "Will you need any special permissions? (field trips, photo releases, guest speakers, technology use)",
        followUp: "I'll add these to your preparation checklist.",
        suggestions: [
          "Field trip permissions",
          "Photo/video releases",
          "Technology use agreements",
          "Guest speaker clearances",
          "Material fees"
        ]
      },
      assessments: {
        prompt: "Beyond the rubrics, how will you track daily progress? Journals, check-ins, peer feedback?",
        followUp: "Good mix of assessment strategies!"
      },
      resources: {
        prompt: "What resources do you need to gather before starting? I'll create a checklist.",
        followUp: "Your resource list is complete."
      },
      budget: {
        prompt: "Do you have a budget for materials? Any costs to consider?",
        followUp: "We'll work within your budget constraints."
      }
    },
    completion: "All logistics are planned! Your project is ready to implement.",
    transition: "Let's review everything and prepare your final project plan."
  },
  
  REVIEW_EXPORT: {
    entry: [
      "Excellent work! Your PBL project is complete. Let's review everything before finalizing.",
      "Here's your complete project plan. Would you like to make any adjustments?"
    ],
    subSteps: {
      review: {
        prompt: "Here's a summary of your project. Everything look good, or should we revise anything?",
        followUp: "Perfect! Your project is polished and ready."
      },
      exportFormat: {
        prompt: "How would you like to export your project plan? PDF, Google Docs, or interactive web format?",
        followUp: "I'll prepare your project in {exportFormat} format."
      },
      sharing: {
        prompt: "Who will you share this with? Students, parents, administrators?",
        followUp: "I'll adjust the formatting for your intended audience."
      },
      implementation: {
        prompt: "When do you plan to start this project?",
        followUp: "Wonderful! Your students are going to love this project."
      }
    },
    completion: "🎉 Your PBL project '{projectTitle}' is complete and ready to inspire learning!",
    transition: "Good luck with implementation! I'm here if you need any support along the way."
  }
};

// Transition management
export class PBLFlowOrchestrator {
  private state: PBLProjectState;
  private validators: Map<string, ValidationRule[]>;
  
  constructor(initialState?: Partial<PBLProjectState>) {
    this.state = this.initializeState(initialState);
    this.validators = new Map();
    this.setupValidators();
  }
  
  private initializeState(partial?: Partial<PBLProjectState>): PBLProjectState {
    return {
      currentStep: 'PROJECT_INTAKE',
      subStep: null,
      messageCountInStep: 0,
      totalProgress: 0,
      stepsCompleted: new Set(),
      stepValidation: new Map(),
      awaitingResponse: undefined,
      projectData: {
        intake: {
          gradeLevel: '',
          subjects: [],
          primarySubject: '',
          classSize: 0,
          classProfile: {
            diverseLearners: false,
            englishLearners: false,
            giftedStudents: false,
            specialNeeds: []
          },
          schedule: {
            periodsPerDay: 0,
            minutesPerPeriod: 0,
            daysPerWeek: 5,
            projectDuration: ''
          },
          availableMaterials: [],
          technologyAccess: [],
          spaceConstraints: []
        },
        goalsEQ: {
          learningGoals: [],
          essentialQuestions: [],
          selectedEQ: '',
          drivingQuestion: '',
          successCriteria: []
        },
        standards: {
          framework: 'CCSS',
          selectedStandards: [],
          crossCurricular: [],
          skills21stCentury: []
        },
        phases: {
          phases: [],
          milestones: []
        },
        artifacts: {
          artifacts: [],
          rubrics: []
        },
        rolesDiff: {
          studentRoles: [],
          differentiationStrategies: {
            forStruggling: [],
            forAdvanced: [],
            forELL: [],
            forSpecialNeeds: []
          },
          scaffolds: [],
          groupingStrategy: ''
        },
        outreach: {
          communityPartners: [],
          exhibitionPlan: {
            format: '',
            venue: '',
            audience: [],
            date: '',
            preparation: []
          },
          expertConnections: []
        },
        logistics: {
          calendar: [],
          permissions: [],
          assessmentPlan: {
            formative: [],
            summative: [],
            selfAssessment: [],
            peerAssessment: []
          },
          resourceList: []
        },
        review: {
          completenessCheck: new Map(),
          revisions: [],
          exportFormat: 'PDF',
          sharingSettings: {
            shareWithStudents: false,
            shareWithParents: false,
            shareWithAdmin: false,
            publicPortfolio: false
          }
        }
      },
      conversationContext: {
        tone: 'friendly',
        experienceLevel: 'intermediate',
        preferredPacing: 'thorough',
        lastInteraction: new Date(),
        sessionDuration: 0,
        questionsAsked: 0,
        clarificationsNeeded: 0
      },
      navigationHistory: [],
      partialSaves: new Map(),
      lastSaveTimestamp: new Date(),
      ...partial
    };
  }
  
  private setupValidators(): void {
    // Setup validation rules for each field
    this.validators.set('gradeLevel', [
      { type: 'required', message: 'Grade level is required' }
    ]);
    
    this.validators.set('subjects', [
      { type: 'required', message: 'At least one subject is required' },
      { type: 'minLength', value: 1, message: 'Select at least one subject' }
    ]);
    
    this.validators.set('learningGoals', [
      { type: 'required', message: 'Learning goals are required' },
      { type: 'minLength', value: 20, message: 'Please provide more detail (at least 20 characters)' }
    ]);
    
    // Add more validators as needed
  }
  
  // Get current conversation prompt
  getCurrentPrompt(): string {
    const prompts = CONVERSATION_PROMPTS[this.state.currentStep];
    
    if (this.state.messageCountInStep === 0) {
      // Entry message for the step
      const entryPrompts = prompts.entry;
      return entryPrompts[Math.floor(Math.random() * entryPrompts.length)];
    }
    
    if (this.state.subStep && prompts.subSteps[this.state.subStep]) {
      return prompts.subSteps[this.state.subStep].prompt;
    }
    
    return prompts.transition;
  }
  
  // Process user input and determine next action
  processUserInput(input: string): {
    nextAction: 'continue' | 'validate' | 'clarify' | 'confirm' | 'advance';
    response?: string;
    validation?: { valid: boolean; errors: string[] };
    suggestions?: string[];
  } {
    const trimmedInput = input.trim();
    
    // Check for navigation commands
    if (this.isNavigationCommand(trimmedInput)) {
      return this.handleNavigation(trimmedInput);
    }
    
    // Validate input if awaiting response
    if (this.state.awaitingResponse) {
      const validation = this.validateInput(trimmedInput, this.state.awaitingResponse.field);
      
      if (!validation.valid) {
        return {
          nextAction: 'validate',
          validation,
          response: validation.errors[0]
        };
      }
      
      // Save the valid input
      this.saveInput(this.state.awaitingResponse.field, trimmedInput);
      
      // Determine next sub-step or advance
      const nextSubStep = this.getNextSubStep();
      if (nextSubStep) {
        this.state.subStep = nextSubStep;
        return {
          nextAction: 'continue',
          response: this.getCurrentPrompt()
        };
      } else {
        return this.advanceToNextStep();
      }
    }
    
    return {
      nextAction: 'continue',
      response: this.getCurrentPrompt()
    };
  }
  
  // Check if input is a navigation command
  private isNavigationCommand(input: string): boolean {
    const commands = ['back', 'previous', 'skip', 'jump to', 'review', 'help'];
    return commands.some(cmd => input.toLowerCase().includes(cmd));
  }
  
  // Handle navigation commands
  private handleNavigation(command: string): any {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('back') || lowerCommand.includes('previous')) {
      return this.goToPreviousStep();
    }
    
    if (lowerCommand.includes('skip')) {
      return this.skipCurrentField();
    }
    
    if (lowerCommand.includes('jump to')) {
      // Extract step name and jump to it
      const stepName = this.extractStepName(command);
      return this.jumpToStep(stepName);
    }
    
    if (lowerCommand.includes('help')) {
      return this.provideHelp();
    }
    
    return {
      nextAction: 'clarify',
      response: "I didn't understand that command. You can say 'back', 'skip', or 'help'."
    };
  }
  
  // Validate user input
  private validateInput(input: string, field: string): { valid: boolean; errors: string[] } {
    const rules = this.validators.get(field) || [];
    const errors: string[] = [];
    
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!input || input.length === 0) {
            errors.push(rule.message);
          }
          break;
          
        case 'minLength':
          if (input.length < rule.value) {
            errors.push(rule.message);
          }
          break;
          
        case 'maxLength':
          if (input.length > rule.value) {
            errors.push(rule.message);
          }
          break;
          
        case 'pattern':
          const regex = new RegExp(rule.value);
          if (!regex.test(input)) {
            errors.push(rule.message);
          }
          break;
          
        case 'custom':
          if (rule.validator && !rule.validator(input)) {
            errors.push(rule.message);
          }
          break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Save validated input to project data
  private saveInput(field: string, value: any): void {
    // Parse the field path (e.g., "intake.gradeLevel")
    const path = field.split('.');
    let target: any = this.state.projectData;
    
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]];
    }
    
    target[path[path.length - 1]] = value;
    
    // Update progress
    this.updateProgress();
    
    // Save to partial saves for resumption
    this.state.partialSaves.set(this.state.currentStep, { ...this.state.projectData });
    this.state.lastSaveTimestamp = new Date();
  }
  
  // Get next sub-step in current step
  private getNextSubStep(): string | null {
    const currentStepConfig = CONVERSATION_PROMPTS[this.state.currentStep];
    const subStepKeys = Object.keys(currentStepConfig.subSteps);
    
    if (!this.state.subStep) {
      return subStepKeys[0];
    }
    
    const currentIndex = subStepKeys.indexOf(this.state.subStep);
    if (currentIndex < subStepKeys.length - 1) {
      return subStepKeys[currentIndex + 1];
    }
    
    return null;
  }
  
  // Advance to next major step
  private advanceToNextStep(): any {
    const steps: PBLStepId[] = [
      'PROJECT_INTAKE',
      'GOALS_EQ',
      'STANDARDS_ALIGNMENT',
      'PHASES_MILESTONES',
      'ARTIFACTS_RUBRICS',
      'ROLES_DIFFERENTIATION',
      'OUTREACH_EXHIBITION',
      'EVIDENCE_LOGISTICS',
      'REVIEW_EXPORT'
    ];
    
    const currentIndex = steps.indexOf(this.state.currentStep);
    
    // Mark current step as complete
    this.state.stepsCompleted.add(this.state.currentStep);
    this.state.stepValidation.set(this.state.currentStep, true);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      
      // Update navigation history
      this.state.navigationHistory.push({
        from: this.state.currentStep,
        to: nextStep,
        timestamp: new Date(),
        reason: 'progression'
      });
      
      // Move to next step
      this.state.currentStep = nextStep;
      this.state.subStep = null;
      this.state.messageCountInStep = 0;
      
      return {
        nextAction: 'advance',
        response: CONVERSATION_PROMPTS[nextStep].entry[0]
      };
    }
    
    // Project complete
    return {
      nextAction: 'complete',
      response: CONVERSATION_PROMPTS.REVIEW_EXPORT.completion
    };
  }
  
  // Go to previous step
  private goToPreviousStep(): any {
    const steps: PBLStepId[] = [
      'PROJECT_INTAKE',
      'GOALS_EQ',
      'STANDARDS_ALIGNMENT',
      'PHASES_MILESTONES',
      'ARTIFACTS_RUBRICS',
      'ROLES_DIFFERENTIATION',
      'OUTREACH_EXHIBITION',
      'EVIDENCE_LOGISTICS',
      'REVIEW_EXPORT'
    ];
    
    const currentIndex = steps.indexOf(this.state.currentStep);
    
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1];
      
      // Update navigation history
      this.state.navigationHistory.push({
        from: this.state.currentStep,
        to: previousStep,
        timestamp: new Date(),
        reason: 'back'
      });
      
      // Move to previous step
      this.state.currentStep = previousStep;
      this.state.subStep = null;
      this.state.messageCountInStep = 0;
      
      // Restore saved data if available
      const savedData = this.state.partialSaves.get(previousStep);
      if (savedData) {
        Object.assign(this.state.projectData, savedData);
      }
      
      return {
        nextAction: 'continue',
        response: `Let's go back to ${previousStep.replace(/_/g, ' ').toLowerCase()}. ${CONVERSATION_PROMPTS[previousStep].entry[0]}`
      };
    }
    
    return {
      nextAction: 'clarify',
      response: "You're at the beginning of the process. Let's continue from here."
    };
  }
  
  // Skip current field (mark as optional)
  private skipCurrentField(): any {
    if (this.state.awaitingResponse && this.state.awaitingResponse.type === 'input') {
      // Save empty/default value
      this.saveInput(this.state.awaitingResponse.field, '');
      
      const nextSubStep = this.getNextSubStep();
      if (nextSubStep) {
        this.state.subStep = nextSubStep;
        return {
          nextAction: 'continue',
          response: `Skipped. ${this.getCurrentPrompt()}`
        };
      } else {
        return this.advanceToNextStep();
      }
    }
    
    return {
      nextAction: 'clarify',
      response: "This field is required for your project. Please provide a response."
    };
  }
  
  // Jump to specific step
  private jumpToStep(stepName: string): any {
    // Implementation for jumping to a specific step
    // This would parse the step name and navigate accordingly
    return {
      nextAction: 'continue',
      response: `Jumping to ${stepName}...`
    };
  }
  
  // Extract step name from command
  private extractStepName(command: string): string {
    // Parse the command to extract the target step
    // This is a simplified implementation
    return 'GOALS_EQ';
  }
  
  // Provide contextual help
  private provideHelp(): any {
    const currentStepConfig = CONVERSATION_PROMPTS[this.state.currentStep];
    const suggestions = this.state.subStep && currentStepConfig.subSteps[this.state.subStep]?.suggestions;
    
    return {
      nextAction: 'clarify',
      response: `You're currently working on ${this.state.currentStep.replace(/_/g, ' ').toLowerCase()}. ${suggestions ? `Here are some suggestions: ${suggestions.join(', ')}` : 'Take your time to think about your response.'}`,
      suggestions
    };
  }
  
  // Update progress percentage
  private updateProgress(): void {
    const totalSteps = 9;
    const completedSteps = this.state.stepsCompleted.size;
    
    // Calculate substep progress for current step
    const currentStepConfig = CONVERSATION_PROMPTS[this.state.currentStep];
    const totalSubSteps = Object.keys(currentStepConfig.subSteps).length;
    const currentSubStepIndex = this.state.subStep 
      ? Object.keys(currentStepConfig.subSteps).indexOf(this.state.subStep)
      : 0;
    const subStepProgress = totalSubSteps > 0 ? currentSubStepIndex / totalSubSteps : 0;
    
    // Calculate total progress
    this.state.totalProgress = Math.round(
      ((completedSteps + subStepProgress) / totalSteps) * 100
    );
  }
  
  // Get current state
  getState(): PBLProjectState {
    return { ...this.state };
  }
  
  // Check if step is complete
  isStepComplete(step: PBLStepId): boolean {
    return this.state.stepsCompleted.has(step);
  }
  
  // Get progress percentage
  getProgress(): number {
    return this.state.totalProgress;
  }
  
  // Get suggested next actions for UI
  getSuggestedActions(): string[] {
    const suggestions: string[] = [];
    
    if (this.state.messageCountInStep > 2) {
      suggestions.push("Skip this question");
    }
    
    if (this.state.stepsCompleted.size > 0) {
      suggestions.push("Go back");
    }
    
    suggestions.push("I need help");
    
    return suggestions;
  }
  
  // Save state for persistence
  serialize(): string {
    return JSON.stringify({
      state: this.state,
      timestamp: new Date().toISOString()
    });
  }
  
  // Restore state from persistence
  static deserialize(data: string): PBLFlowOrchestrator {
    const parsed = JSON.parse(data);
    return new PBLFlowOrchestrator(parsed.state);
  }
}

// Export singleton instance for use across the app
export const pblFlowOrchestrator = new PBLFlowOrchestrator();