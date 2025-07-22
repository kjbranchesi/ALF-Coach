// Finite State Machine for Project Journey Design
// Guides educators through a creative, non-linear process

export interface JourneyData {
  phases: Phase[];
  activities: Activity[];
  resources: Resource[];
  reflections?: string[]; // Educator's insights along the way
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

export type JourneyState = 
  | 'JOURNEY_OVERVIEW'      // Welcome & preview the journey design process
  | 'JOURNEY_PHASES'        // Design the learning arc
  | 'JOURNEY_ACTIVITIES'    // Create engaging activities for each phase
  | 'JOURNEY_RESOURCES'     // Gather inspiring resources
  | 'JOURNEY_REVIEW'        // Review & refine the complete journey
  | 'COMPLETE';

export class JourneyFSM {
  private stateOrder: JourneyState[] = [
    'JOURNEY_OVERVIEW',
    'JOURNEY_PHASES',
    'JOURNEY_ACTIVITIES', 
    'JOURNEY_RESOURCES',
    'JOURNEY_REVIEW',
    'COMPLETE'
  ];

  private currentIndex: number = 0;
  public data: JourneyData = {
    phases: [],
    activities: [],
    resources: [],
    reflections: []
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

  get progress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentIndex + 1,
      total: this.stateOrder.length - 1, // Exclude 'COMPLETE'
      percentage: Math.round((this.currentIndex / (this.stateOrder.length - 2)) * 100)
    };
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
    // Resources are always optional
    if (this.current === 'JOURNEY_RESOURCES') return true;
    
    // Overview can be skipped by experienced educators
    if (this.current === 'JOURNEY_OVERVIEW') return true;
    
    return false;
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
      JOURNEY_OVERVIEW: {
        title: "Welcome to Journey Design",
        description: "Let's map out a transformative learning experience for your students.",
        tips: [
          "Think about the emotional arc of discovery",
          "Consider how students will build confidence",
          "Imagine the 'aha!' moments you want to create"
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
      COMPLETE: {
        title: "Journey Complete!",
        description: "Your learning journey is ready to inspire and transform.",
        tips: [
          "Share with colleagues for feedback",
          "Prepare your launch materials",
          "Get ready for an amazing experience!"
        ]
      }
    };

    return contexts[this.current] || contexts.JOURNEY_OVERVIEW;
  }

  // Validate current stage has enough content
  private validateCurrentStage(): { isValid: boolean; message?: string } {
    switch (this.current) {
      case 'JOURNEY_OVERVIEW':
        return { isValid: true }; // Always valid, can skip
        
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
      JOURNEY_OVERVIEW: "Great! Let's start designing your learning journey.",
      JOURNEY_PHASES: "Excellent phases! Now let's create activities to bring them to life.",
      JOURNEY_ACTIVITIES: "Your activities look engaging! Let's gather some inspiring resources.",
      JOURNEY_RESOURCES: "Wonderful resources! Let's review your complete journey.",
      JOURNEY_REVIEW: "Your journey is beautifully designed and ready to inspire!",
      COMPLETE: "🎉 Congratulations! Your transformative learning journey is complete!"
    };

    return messages[this.current] || "Let's continue building your journey.";
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