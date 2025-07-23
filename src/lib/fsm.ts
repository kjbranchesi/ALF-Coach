// Finite State Machine for Project Journey Design
// Guides educators through a creative, non-linear process
// Aligned with the Active Learning Framework (ALF)

export interface IdeationData {
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
}

export interface JourneyData {
  ideation: IdeationData;
  phases: Phase[];
  activities: Activity[];
  resources: Resource[];
  reflections?: string[]; // Educator's insights along the way
  deliverables: {
    milestones: Milestone[];
    rubric: Rubric;
    impact: Impact;
  };
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  duration?: string;
  learningGoals?: string[];
}

export interface Activity {
  id: string;
  phaseId: string;
  name: string;
  description: string;
  materials?: string[];
  grouping?: 'individual' | 'pairs' | 'small-group' | 'whole-class';
  duration?: string;
}

export interface Resource {
  id: string;
  type: 'article' | 'video' | 'tool' | 'expert' | 'location' | 'other';
  name: string;
  description: string;
  url?: string;
  phaseIds?: string[]; // Which phases this resource supports
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  phaseId?: string;
  dueWeek?: number;
}

export interface Rubric {
  criteria: RubricCriterion[];
  levels: string[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight?: number;
}

export interface Impact {
  audience: string;
  method: string;
  timeline?: string;
  measurableOutcomes?: string[];
}

export type JourneyState = 
  // IDEATION (ALF: Catalyst)
  | 'IDEATION_BIG_IDEA'     // Anchor the learning with a big idea
  | 'IDEATION_EQ'           // Frame the essential question
  | 'IDEATION_CHALLENGE'    // Define the authentic challenge
  // JOURNEY (ALF: Issues)
  | 'JOURNEY_PHASES'        // Design the learning arc
  | 'JOURNEY_ACTIVITIES'    // Create engaging activities for each phase
  | 'JOURNEY_RESOURCES'     // Gather inspiring resources
  | 'JOURNEY_REVIEW'        // Review & refine the complete journey
  // DELIVERABLES (ALF: Method)
  | 'DELIVER_MILESTONES'    // Define milestone checkpoints
  | 'DELIVER_RUBRIC'        // Create assessment criteria
  | 'DELIVER_IMPACT'        // Connect to authentic audiences
  // PUBLISH (ALF: Engagement)
  | 'PUBLISH_REVIEW'        // Final review before publishing
  | 'COMPLETE';

export class JourneyFSM {
  private stateOrder: JourneyState[] = [
    // IDEATION stages
    'IDEATION_BIG_IDEA',
    'IDEATION_EQ',
    'IDEATION_CHALLENGE',
    // JOURNEY stages
    'JOURNEY_PHASES',
    'JOURNEY_ACTIVITIES', 
    'JOURNEY_RESOURCES',
    'JOURNEY_REVIEW',
    // DELIVERABLES stages
    'DELIVER_MILESTONES',
    'DELIVER_RUBRIC',
    'DELIVER_IMPACT',
    // PUBLISH stages
    'PUBLISH_REVIEW',
    'COMPLETE'
  ];

  private currentIndex: number = 0;
  public data: JourneyData = {
    ideation: {
      bigIdea: '',
      essentialQuestion: '',
      challenge: ''
    },
    phases: [],
    activities: [],
    resources: [],
    reflections: [],
    deliverables: {
      milestones: [],
      rubric: {
        criteria: [],
        levels: ['Emerging', 'Developing', 'Proficient', 'Exemplary']
      },
      impact: {
        audience: '',
        method: ''
      }
    }
  };

  // Track educator's creative process
  private history: Array<{state: JourneyState, timestamp: Date}> = [];
  private editMode: boolean = false;

  constructor(initialData?: Partial<JourneyData>) {
    if (initialData) {
      this.data = { ...this.data, ...initialData };
    }
    this.history.push({ state: this.current, timestamp: new Date() });
  }

  get current(): JourneyState {
    return this.stateOrder[this.currentIndex];
  }

  get progress(): { current: number; total: number; percentage: number; segment: 'ideation' | 'journey' | 'deliver' | 'complete' } {
    const total = this.stateOrder.length - 1; // Exclude 'COMPLETE'
    const current = this.currentIndex + 1;
    const percentage = Math.round((this.currentIndex / (total - 1)) * 100);
    
    let segment: 'ideation' | 'journey' | 'deliver' | 'complete' = 'ideation';
    if (this.current.startsWith('IDEATION')) {
      segment = 'ideation';
    } else if (this.current.startsWith('JOURNEY')) {
      segment = 'journey';
    } else if (this.current.startsWith('DELIVER') || this.current === 'PUBLISH_REVIEW') {
      segment = 'deliver';
    } else if (this.current === 'COMPLETE') {
      segment = 'complete';
    }
    
    return { current, total, percentage, segment };
  }

  // Advance to next stage when educator is ready
  advance(): { success: boolean; newState: JourneyState; message?: string } {
    if (this.currentIndex >= this.stateOrder.length - 1) {
      return { 
        success: false, 
        newState: this.current,
        message: "Journey design is complete! Time to bring it to life." 
      };
    }

    // Validate current stage has meaningful content
    const validation = this.validateCurrentStage();
    if (!validation.isValid) {
      return {
        success: false,
        newState: this.current,
        message: validation.message
      };
    }

    this.currentIndex++;
    this.editMode = false;
    this.history.push({ state: this.current, timestamp: new Date() });

    return {
      success: true,
      newState: this.current,
      message: this.getTransitionMessage()
    };
  }

  // Edit a specific stage - enables non-linear refinement
  edit(targetState: JourneyState): { success: boolean; newState: JourneyState } {
    const targetIndex = this.stateOrder.indexOf(targetState);
    
    if (targetIndex === -1 || targetIndex > this.currentIndex) {
      return { success: false, newState: this.current };
    }

    this.currentIndex = targetIndex;
    this.editMode = true;
    this.history.push({ state: this.current, timestamp: new Date() });

    return { success: true, newState: this.current };
  }

  // Reset for a fresh start (preserves some data if educator wants)
  reset(preservePhases: boolean = false): void {
    this.currentIndex = 0;
    this.editMode = false;
    
    if (!preservePhases) {
      this.data = {
        phases: [],
        activities: [],
        resources: [],
        reflections: []
      };
    } else {
      // Keep phases but clear activities and resources
      this.data.activities = [];
      this.data.resources = [];
    }
    
    this.history = [{ state: this.current, timestamp: new Date() }];
  }

  // Check if we can skip current stage
  canSkip(): boolean {
    // Optional stages that can be skipped
    const skippableStages: JourneyState[] = [
      'JOURNEY_RESOURCES',
      'DELIVER_MILESTONES',
      'DELIVER_RUBRIC',
      'DELIVER_IMPACT'
    ];
    
    return skippableStages.includes(this.current);
  }

  // Update data for current stage
  updateData(updates: Partial<JourneyData>): void {
    this.data = { ...this.data, ...updates };
  }

  // Add a reflection/insight from the educator
  addReflection(reflection: string): void {
    if (!this.data.reflections) {
      this.data.reflections = [];
    }
    this.data.reflections.push(reflection);
  }

  // Get contextual help for current stage
  getStageContext(): { title: string; description: string; tips: string[] } {
    const contexts = {
      IDEATION_BIG_IDEA: {
        title: "Anchor with a Big Idea",
        description: "Let's start with a powerful concept that will guide the entire learning journey.",
        tips: [
          "Think about what truly matters in your subject",
          "Consider themes that connect to students' lives",
          "Look for ideas that spark curiosity and wonder"
        ]
      },
      IDEATION_EQ: {
        title: "Frame the Essential Question",
        description: "Craft a question that drives inquiry and invites multiple perspectives.",
        tips: [
          "Make it open-ended and thought-provoking",
          "Connect to real-world relevance",
          "Ensure it requires deep exploration"
        ]
      },
      IDEATION_CHALLENGE: {
        title: "Define the Authentic Challenge",
        description: "Create a meaningful task that showcases student learning.",
        tips: [
          "Connect to real audiences or purposes",
          "Allow for creative solutions",
          "Make it worthy of students' time and effort"
        ]
      },
      JOURNEY_PHASES: {
        title: "Design Your Learning Arc",
        description: "Create 3-4 phases that guide students from curiosity to mastery.",
        tips: [
          "Start with exploration and wonder",
          "Build toward creation and application",
          "End with reflection and celebration"
        ]
      },
      JOURNEY_ACTIVITIES: {
        title: "Craft Engaging Activities",
        description: "Design hands-on experiences that bring each phase to life.",
        tips: [
          "Mix individual and collaborative work",
          "Include choice and student voice",
          "Connect to real-world applications"
        ]
      },
      JOURNEY_RESOURCES: {
        title: "Gather Inspiring Resources",
        description: "Collect materials, tools, and connections to enrich the journey.",
        tips: [
          "Think beyond traditional materials",
          "Consider community experts and locations",
          "Include diverse perspectives and voices"
        ]
      },
      JOURNEY_REVIEW: {
        title: "Review Your Journey",
        description: "Step back and see the complete learning experience you've designed.",
        tips: [
          "Check the flow from phase to phase",
          "Ensure activities build on each other",
          "Verify resources support your goals"
        ]
      },
      DELIVER_MILESTONES: {
        title: "Define Milestone Checkpoints",
        description: "Outline key moments that keep learners and stakeholders aligned.",
        tips: [
          "Think of milestones as celebration points",
          "Consider both process and product milestones",
          "Make them visible to students and families"
        ]
      },
      DELIVER_RUBRIC: {
        title: "Create Assessment Criteria",
        description: "Draft clear criteria that reward inquiry, collaboration, craft, and reflection.",
        tips: [
          "Focus on growth, not just final products",
          "Include self and peer assessment opportunities",
          "Make criteria student-friendly and transparent"
        ]
      },
      DELIVER_IMPACT: {
        title: "Connect to Authentic Audiences",
        description: "Specify how student work connects to authentic audiences or community needs.",
        tips: [
          "Think beyond the classroom walls",
          "Consider both local and global connections",
          "Plan for meaningful feedback loops"
        ]
      },
      PUBLISH_REVIEW: {
        title: "Final Review",
        description: "Review your complete blueprint before publishing.",
        tips: [
          "Check alignment across all components",
          "Ensure feasibility within your constraints",
          "Celebrate what you've created!"
        ]
      },
      COMPLETE: {
        title: "Blueprint Complete!",
        description: "Your transformative learning experience is ready to launch.",
        tips: [
          "Share with colleagues for feedback",
          "Prepare your launch materials",
          "Get ready for an amazing experience!"
        ]
      }
    };

    return contexts[this.current] || contexts.IDEATION_BIG_IDEA;
  }

  // Validate current stage has enough content
  private validateCurrentStage(): { isValid: boolean; message?: string } {
    switch (this.current) {
      case 'IDEATION_BIG_IDEA':
        if (!this.data.ideation.bigIdea.trim()) {
          return { 
            isValid: false, 
            message: "Let's anchor your project with a big idea before moving forward." 
          };
        }
        return { isValid: true };
        
      case 'IDEATION_EQ':
        if (!this.data.ideation.essentialQuestion.trim()) {
          return { 
            isValid: false, 
            message: "An essential question will guide student inquiry. What question will drive their exploration?" 
          };
        }
        return { isValid: true };
        
      case 'IDEATION_CHALLENGE':
        if (!this.data.ideation.challenge.trim()) {
          return { 
            isValid: false, 
            message: "Let's define an authentic challenge that showcases student learning." 
          };
        }
        return { isValid: true };
        
      case 'JOURNEY_PHASES':
        if (this.data.phases.length < 2) {
          return { 
            isValid: false, 
            message: "Let's design at least 2 phases to create a meaningful journey." 
          };
        }
        return { isValid: true };
        
      case 'JOURNEY_ACTIVITIES':
        const hasActivities = this.data.phases.every(phase => 
          this.data.activities.some(activity => activity.phaseId === phase.id)
        );
        if (!hasActivities) {
          return { 
            isValid: false, 
            message: "Each phase needs at least one activity to bring it to life." 
          };
        }
        return { isValid: true };
        
      case 'JOURNEY_RESOURCES':
        return { isValid: true }; // Optional stage
        
      default:
        return { isValid: true };
    }
  }

  // Get encouraging transition message
  private getTransitionMessage(): string {
    const messages = {
      IDEATION_BIG_IDEA: "Powerful big idea! Now let's frame an essential question.",
      IDEATION_EQ: "Great question! Now let's define the authentic challenge.",
      IDEATION_CHALLENGE: "Inspiring challenge! Let's design the learning journey.",
      JOURNEY_PHASES: "Excellent phases! Now let's create activities to bring them to life.",
      JOURNEY_ACTIVITIES: "Your activities look engaging! Let's gather some inspiring resources.",
      JOURNEY_RESOURCES: "Wonderful resources! Let's review your complete journey.",
      JOURNEY_REVIEW: "Your journey design is taking shape beautifully! Now let's add the deliverable components.",
      DELIVER_MILESTONES: "Clear milestones will guide the journey! Let's create your assessment rubric.",
      DELIVER_RUBRIC: "Your rubric encourages growth and reflection! Now let's connect to authentic audiences.",
      DELIVER_IMPACT: "Powerful connections to real impact! Let's review your complete blueprint.",
      PUBLISH_REVIEW: "Your blueprint is complete and ready to transform learning!",
      COMPLETE: "Congratulations! Your transformative learning blueprint is ready. You can now review and export your complete blueprint. Let me know if you'd like refinements."
    };

    return messages[this.current] || "Let's continue building your blueprint.";
  }

  // Export current state for persistence
  exportState() {
    return {
      currentIndex: this.currentIndex,
      data: this.data,
      editMode: this.editMode,
      history: this.history
    };
  }

  // Import saved state
  importState(state: ReturnType<typeof this.exportState>) {
    this.currentIndex = state.currentIndex;
    this.data = state.data;
    this.editMode = state.editMode;
    this.history = state.history;
  }
}