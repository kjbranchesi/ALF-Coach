// Finite State Machine for Project Journey Design v2.0
// Implements Blueprint Coach SOP v1.0
// Guides educators through conversational flow with stage initiators and clarifiers

export interface StageRecap {
  stage: 'ideation' | 'journey' | 'deliverables';
  summary: string;
  data: Record<string, any>;
  timestamp: Date;
}

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
  reflections?: string[]; 
  deliverables: {
    milestones: Milestone[];
    rubric: Rubric;
    impact: Impact;
  };
  recaps?: {
    ideation?: StageRecap;
    journey?: StageRecap;
    deliverables?: StageRecap;
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
  phaseIds?: string[];
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
  // IDEATION Stage
  | 'IDEATION_INITIATOR'      // Welcome to Ideation stage
  | 'IDEATION_BIG_IDEA'        // Anchor the learning with a big idea
  | 'IDEATION_EQ'              // Frame the essential question
  | 'IDEATION_CHALLENGE'       // Define the authentic challenge
  | 'IDEATION_CLARIFIER'       // Recap ideation, offer edits
  // JOURNEY Stage
  | 'JOURNEY_INITIATOR'        // Welcome to Journey stage
  | 'JOURNEY_PHASES'           // Design the learning arc
  | 'JOURNEY_ACTIVITIES'       // Create engaging activities
  | 'JOURNEY_RESOURCES'        // Gather inspiring resources
  | 'JOURNEY_CLARIFIER'        // Recap journey, offer edits
  // DELIVERABLES Stage
  | 'DELIVERABLES_INITIATOR'   // Welcome to Deliverables stage
  | 'DELIVER_MILESTONES'       // Define milestone checkpoints
  | 'DELIVER_RUBRIC'           // Create assessment criteria
  | 'DELIVER_IMPACT'           // Connect to authentic audiences
  | 'DELIVERABLES_CLARIFIER'   // Recap deliverables, offer edits
  // PUBLISH Stage
  | 'PUBLISH_REVIEW'           // Final review before publishing
  | 'COMPLETE';

// Stage metadata for proper flow
export const STAGE_METADATA = {
  // Stage purposes (for initiators)
  stages: {
    IDEATION: {
      purpose: "Transform your teaching context into a Big Idea, Essential Question, and Challenge that motivate the unit.",
      substeps: ["Big Idea", "Essential Question", "Challenge"]
    },
    JOURNEY: {
      purpose: "Plan phases, activities, and resources ensuring depth & skills progression.",
      substeps: ["Phases", "Activities", "Resources"]
    },
    DELIVERABLES: {
      purpose: "Set milestones, rubric, and impact plan—clarifying output quality & authenticity.",
      substeps: ["Milestones", "Rubric", "Impact Plan"]
    }
  },
  
  // Sub-step objectives
  objectives: {
    IDEATION_BIG_IDEA: "Anchor the learning around one resonant concept.",
    IDEATION_EQ: "Frame an inquiry that endures & drives research.",
    IDEATION_CHALLENGE: "Define an authentic task with real audience.",
    JOURNEY_PHASES: "Map sign-posts that structure the learning arc.",
    JOURNEY_ACTIVITIES: "Define signature learning experiences per phase.",
    JOURNEY_RESOURCES: "List experts, texts, tools that sustain work.",
    DELIVER_MILESTONES: "Checkpoints & evidence of progress.",
    DELIVER_RUBRIC: "Assessment criteria rewarding inquiry & craft.",
    DELIVER_IMPACT: "Real-world sharing & reflection mechanism."
  }
};

export class JourneyFSMv2 {
  private stateOrder: JourneyState[] = [
    // IDEATION stage
    'IDEATION_INITIATOR',
    'IDEATION_BIG_IDEA',
    'IDEATION_EQ',
    'IDEATION_CHALLENGE',
    'IDEATION_CLARIFIER',
    // JOURNEY stage
    'JOURNEY_INITIATOR',
    'JOURNEY_PHASES',
    'JOURNEY_ACTIVITIES', 
    'JOURNEY_RESOURCES',
    'JOURNEY_CLARIFIER',
    // DELIVERABLES stage
    'DELIVERABLES_INITIATOR',
    'DELIVER_MILESTONES',
    'DELIVER_RUBRIC',
    'DELIVER_IMPACT',
    'DELIVERABLES_CLARIFIER',
    // PUBLISH stage
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
    },
    recaps: {}
  };

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

  // Check if current state is an initiator
  isInitiator(): boolean {
    return this.current.includes('_INITIATOR');
  }

  // Check if current state is a clarifier
  isClarifier(): boolean {
    return this.current.includes('_CLARIFIER');
  }

  // Get current stage name
  getCurrentStage(): 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'PUBLISH' {
    if (this.current.startsWith('IDEATION')) return 'IDEATION';
    if (this.current.startsWith('JOURNEY')) return 'JOURNEY';
    if (this.current.startsWith('DELIVER')) return 'DELIVERABLES';
    return 'PUBLISH';
  }

  // Advance to next stage
  advance(): { success: boolean; newState: JourneyState; message?: string } {
    if (this.currentIndex >= this.stateOrder.length - 1) {
      return { 
        success: false, 
        newState: this.current,
        message: "Journey design is complete! Time to bring it to life." 
      };
    }

    // Validate current stage has meaningful content (skip for initiators/clarifiers)
    if (!this.isInitiator() && !this.isClarifier()) {
      const validation = this.validateCurrentStage();
      if (!validation.isValid) {
        return {
          success: false,
          newState: this.current,
          message: validation.message
        };
      }
    }

    // Save recap when leaving a clarifier stage
    if (this.isClarifier()) {
      this.saveStageRecap();
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

  // Edit a specific stage
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

  // Reset for a fresh start
  reset(preserveIdeation: boolean = false): void {
    this.currentIndex = 0;
    this.editMode = false;
    
    if (!preserveIdeation) {
      this.data = {
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
    } else {
      // Keep ideation but clear everything else
      this.data.phases = [];
      this.data.activities = [];
      this.data.resources = [];
      this.data.deliverables = {
        milestones: [],
        rubric: {
          criteria: [],
          levels: ['Emerging', 'Developing', 'Proficient', 'Exemplary']
        },
        impact: {
          audience: '',
          method: ''
        }
      };
    }
    
    // Reset recaps as well
    this.data.recaps = {};
    
    this.history = [{ state: this.current, timestamp: new Date() }];
  }

  // Check if we can skip current stage
  canSkip(): boolean {
    // Only resources can be skipped per SOP
    return this.current === 'JOURNEY_RESOURCES';
  }
  
  // Save stage recap when leaving a stage
  saveStageRecap(): void {
    const stage = this.getCurrentStage().toLowerCase() as 'ideation' | 'journey' | 'deliverables';
    if (!this.data.recaps) {
      this.data.recaps = {};
    }
    this.data.recaps[stage] = this.generateStageRecap(stage);
  }
  
  // Generate a recap for a specific stage
  generateStageRecap(stage: 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'ideation' | 'journey' | 'deliverables'): StageRecap {
    const stageLower = stage.toLowerCase() as 'ideation' | 'journey' | 'deliverables';
    let stageData: Record<string, any> = {};
    let summary = '';
    
    switch (stageLower) {
      case 'ideation':
        stageData = {
          bigIdea: this.data.ideation.bigIdea,
          essentialQuestion: this.data.ideation.essentialQuestion,
          challenge: this.data.ideation.challenge
        };
        summary = `Big Idea: "${this.data.ideation.bigIdea}", Essential Question: "${this.data.ideation.essentialQuestion}", Challenge: "${this.data.ideation.challenge}"`;
        break;
        
      case 'journey':
        stageData = {
          phases: this.data.phases,
          activities: this.data.activities,
          resources: this.data.resources
        };
        summary = `Designed ${this.data.phases.length} phases with ${this.data.activities.length} activities and ${this.data.resources.length} resources`;
        break;
        
      case 'deliverables':
        stageData = this.data.deliverables;
        summary = `Created ${this.data.deliverables.milestones.length} milestones, rubric with ${this.data.deliverables.rubric.criteria.length} criteria, and impact plan for ${this.data.deliverables.impact.audience}`;
        break;
    }
    
    return {
      stage: stageLower,
      summary,
      data: stageData,
      timestamp: new Date()
    };
  }

  // Update data for current stage
  updateData(updates: Partial<JourneyData>): void {
    this.data = { ...this.data, ...updates };
  }

  // Add a reflection/insight
  addReflection(reflection: string): void {
    if (!this.data.reflections) {
      this.data.reflections = [];
    }
    this.data.reflections.push(reflection);
  }

  // Get contextual help for current stage
  getStageContext(): { title: string; description: string; tips: string[] } {
    const contexts = {
      IDEATION_INITIATOR: {
        title: "Welcome to Ideation",
        description: "In this stage we'll complete 3 steps to transform your teaching context into an inspiring learning experience.",
        tips: [
          "Think about what truly matters in your subject",
          "Consider themes that connect to students' lives",
          "Let your creativity flow - we'll refine together"
        ]
      },
      IDEATION_BIG_IDEA: {
        title: "Anchor with a Big Idea",
        description: "Let's start with a powerful concept that will guide the entire learning journey.",
        tips: [
          "Think about enduring understandings",
          "Consider themes that spark curiosity",
          "Look for ideas that connect to real life"
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
          "Make it worthy of students' time"
        ]
      },
      IDEATION_CLARIFIER: {
        title: "Ideation Summary",
        description: "Let's review what we've created together in the ideation stage.",
        tips: [
          "Check that all elements align",
          "Ensure the challenge excites you",
          "Make any refinements before moving on"
        ]
      },
      JOURNEY_INITIATOR: {
        title: "Welcome to Learning Journey",
        description: "Now we'll design the path students will take, creating phases, activities, and gathering resources.",
        tips: [
          "Think about the learning arc",
          "Consider pacing and engagement",
          "Plan for student voice and choice"
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
          "Consider community experts",
          "Include diverse perspectives"
        ]
      },
      JOURNEY_CLARIFIER: {
        title: "Journey Summary",
        description: "Let's review the complete learning journey you've designed.",
        tips: [
          "Check the flow between phases",
          "Ensure activities build on each other",
          "Verify resources support your goals"
        ]
      },
      DELIVERABLES_INITIATOR: {
        title: "Welcome to Deliverables",
        description: "Finally, we'll define milestones, create assessment criteria, and plan for authentic impact.",
        tips: [
          "Focus on growth and progress",
          "Make assessment transparent",
          "Connect to real audiences"
        ]
      },
      DELIVER_MILESTONES: {
        title: "Define Milestone Checkpoints",
        description: "Outline key moments that keep learners and stakeholders aligned.",
        tips: [
          "Think of milestones as celebration points",
          "Include both process and product",
          "Make them visible to all"
        ]
      },
      DELIVER_RUBRIC: {
        title: "Create Assessment Criteria",
        description: "Draft clear criteria that reward inquiry, collaboration, craft, and reflection.",
        tips: [
          "Focus on growth, not perfection",
          "Include self-assessment opportunities",
          "Make criteria student-friendly"
        ]
      },
      DELIVER_IMPACT: {
        title: "Connect to Authentic Audiences",
        description: "Specify how student work connects to authentic audiences or community needs.",
        tips: [
          "Think beyond classroom walls",
          "Consider local and global connections",
          "Plan for meaningful feedback"
        ]
      },
      DELIVERABLES_CLARIFIER: {
        title: "Deliverables Summary",
        description: "Let's review how students will demonstrate and share their learning.",
        tips: [
          "Ensure authentic assessment",
          "Check for real-world connections",
          "Celebrate the complete design"
        ]
      },
      PUBLISH_REVIEW: {
        title: "Final Review",
        description: "Your blueprint is complete! Let's review everything before publishing.",
        tips: [
          "Check alignment across all components",
          "Ensure feasibility within constraints",
          "Celebrate what you've created!"
        ]
      },
      COMPLETE: {
        title: "Blueprint Complete!",
        description: "Your transformative learning experience is ready to launch.",
        tips: [
          "Export your blueprint",
          "Share with colleagues",
          "Get ready for an amazing journey!"
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
        
      case 'DELIVER_MILESTONES':
        if (this.data.deliverables.milestones.length === 0) {
          return {
            isValid: false,
            message: "Let's define at least one milestone to track progress."
          };
        }
        return { isValid: true };
        
      case 'DELIVER_RUBRIC':
        if (this.data.deliverables.rubric.criteria.length === 0) {
          return {
            isValid: false,
            message: "Let's create at least one assessment criterion."
          };
        }
        return { isValid: true };
        
      case 'DELIVER_IMPACT':
        if (!this.data.deliverables.impact.audience || !this.data.deliverables.impact.method) {
          return {
            isValid: false,
            message: "Let's define your audience and sharing method."
          };
        }
        return { isValid: true };
        
      default:
        return { isValid: true };
    }
  }

  // Get transition message
  private getTransitionMessage(): string {
    const messages = {
      IDEATION_INITIATOR: "Let's begin by anchoring your learning experience with a Big Idea.",
      IDEATION_BIG_IDEA: "Powerful big idea! Now let's frame an essential question.",
      IDEATION_EQ: "Great question! Now let's define the authentic challenge.",
      IDEATION_CHALLENGE: "Inspiring challenge! Let's review your ideation.",
      IDEATION_CLARIFIER: "Your ideation is complete! Ready to design the learning journey?",
      JOURNEY_INITIATOR: "Now let's map out the learning journey with phases.",
      JOURNEY_PHASES: "Excellent phases! Now let's create activities.",
      JOURNEY_ACTIVITIES: "Engaging activities! Let's gather resources.",
      JOURNEY_RESOURCES: "Great resources! Let's review your journey.",
      JOURNEY_CLARIFIER: "Your journey looks amazing! Ready to define deliverables?",
      DELIVERABLES_INITIATOR: "Let's define how students will demonstrate their learning.",
      DELIVER_MILESTONES: "Clear milestones! Now let's create your rubric.",
      DELIVER_RUBRIC: "Thoughtful assessment! Let's plan for authentic impact.",
      DELIVER_IMPACT: "Powerful connections! Let's review your deliverables.",
      DELIVERABLES_CLARIFIER: "All set! Ready for final review?",
      PUBLISH_REVIEW: "Your blueprint is complete and ready to transform learning!",
      COMPLETE: "Congratulations! Your blueprint is ready to export."
    };

    return messages[this.current] || "Let's continue building your blueprint.";
  }

  // Export current state
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