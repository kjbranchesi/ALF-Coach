// BlueprintStateMachine.js - Rigid state machine for Blueprint Builder v1.0

export const BlueprintStates = {
  ONBOARDING_INPUT: 'ONBOARDING_INPUT',
  ONBOARDING_CONFIRM: 'ONBOARDING_CONFIRM',
  IDEATION_BIG_IDEA: 'IDEATION_BIG_IDEA',
  IDEATION_ESSENTIAL_QUESTION: 'IDEATION_ESSENTIAL_QUESTION',
  IDEATION_CHALLENGE: 'IDEATION_CHALLENGE',
  JOURNEY_PHASES: 'JOURNEY_PHASES',
  JOURNEY_ACTIVITIES: 'JOURNEY_ACTIVITIES',
  JOURNEY_RESOURCES: 'JOURNEY_RESOURCES',
  DELIVER_MILESTONES: 'DELIVER_MILESTONES',
  DELIVER_RUBRIC: 'DELIVER_RUBRIC',
  DELIVER_IMPACT: 'DELIVER_IMPACT',
  PUBLISH: 'PUBLISH'
};

// Decision chips available in every state
export const DecisionChips = {
  GET_IDEAS: { text: 'Get Ideas', icon: 'Lightbulb' },
  SEE_EXAMPLES: { text: 'See Examples', icon: 'FileText' },
  HELP: { text: 'Help', icon: 'HelpCircle' },
  SKIP: { text: 'Skip', icon: 'SkipForward' }
};

// Required fields per state
export const StateRequirements = {
  [BlueprintStates.ONBOARDING_INPUT]: {
    fields: ['motivation', 'subject', 'ageGroup', 'scope'],
    optional: ['location', 'materials']
  },
  [BlueprintStates.IDEATION_BIG_IDEA]: {
    fields: ['bigIdea'],
    maxWords: 10
  },
  [BlueprintStates.IDEATION_ESSENTIAL_QUESTION]: {
    fields: ['essentialQuestion']
  },
  [BlueprintStates.IDEATION_CHALLENGE]: {
    fields: ['challenge']
  },
  [BlueprintStates.JOURNEY_PHASES]: {
    fields: ['phases'],
    minCount: 2
  },
  [BlueprintStates.JOURNEY_ACTIVITIES]: {
    fields: ['activities'],
    minPerPhase: 1
  },
  [BlueprintStates.JOURNEY_RESOURCES]: {
    fields: ['resources'],
    optional: true
  },
  [BlueprintStates.DELIVER_MILESTONES]: {
    fields: ['milestones'],
    minCount: 2
  },
  [BlueprintStates.DELIVER_RUBRIC]: {
    fields: ['rubric']
  },
  [BlueprintStates.DELIVER_IMPACT]: {
    fields: ['impactPlan']
  }
};

export class BlueprintStateMachine {
  constructor() {
    this.currentState = BlueprintStates.ONBOARDING_INPUT;
    this.blueprint = {
      // Onboarding
      motivation: '',
      subject: '',
      ageGroup: '',
      location: '',
      materials: [],
      scope: '', // Lesson, Unit, Course
      
      // Ideation
      bigIdea: '',
      essentialQuestion: '',
      challenge: '',
      
      // Journey
      phases: [],
      activities: {}, // keyed by phase name
      resources: [],
      
      // Deliver
      milestones: [],
      rubric: {
        criteria: [],
        levels: []
      },
      impactPlan: '',
      
      // Meta
      status: 'in_progress',
      completedFields: 0,
      totalRequiredFields: 11
    };
    
    this.stateHistory = [];
  }

  // Get the opening message for current state
  getStatePrompt() {
    const prompts = {
      [BlueprintStates.ONBOARDING_INPUT]: 
        "Let's capture your vision in 5 quick fields:\n\n" +
        "• What's your **motivation** for this project?\n" +
        "• Which **subject** are you teaching?\n" +
        "• What **age group** (e.g., 14-15 year olds)?\n" +
        "• Where are you **located** (optional)?\n" +
        "• What's the **scope**: Lesson, Unit, or Course?",
      
      [BlueprintStates.ONBOARDING_CONFIRM]: 
        `Here's what I heard:\n\n` +
        `**${this.blueprint.subject}** for **${this.blueprint.ageGroup}**` +
        `${this.blueprint.location ? ` in **${this.blueprint.location}**` : ''}.\n` +
        `Motivation: *${this.truncate(this.blueprint.motivation, 50)}*\n` +
        `Scope: **${this.blueprint.scope}**\n\n` +
        `▶︎ *Confirm* or *Edit*`,
      
      [BlueprintStates.IDEATION_BIG_IDEA]: 
        "Great! Based on your context, here are **3 Big-Idea angles**:\n\n" +
        this.generateBigIdeaSuggestions().map((idea, i) => 
          `${i + 1}. **${idea.title}** - ${idea.description}`
        ).join('\n') +
        "\n\nPick a number or type your own (max 10 words).",
      
      [BlueprintStates.IDEATION_ESSENTIAL_QUESTION]: 
        "Now craft a compelling Essential Question that will drive student inquiry.\n\n" +
        "This should be open-ended and thought-provoking.",
      
      [BlueprintStates.IDEATION_CHALLENGE]: 
        "Define the authentic Challenge students will tackle.\n\n" +
        "Use format: *verb + audience* (e.g., \"Design solutions for local businesses\")",
      
      [BlueprintStates.JOURNEY_PHASES]: 
        "Let's break the project into phases. I've auto-suggested 3:\n\n" +
        this.generatePhaseSuggestions().map((phase, i) => 
          `${i + 1}. **${phase}**`
        ).join('\n') +
        "\n\nEdit these or add your own.",
      
      [BlueprintStates.JOURNEY_ACTIVITIES]: 
        `For Phase 1 ("${this.blueprint.phases[0]}"), list 2 student activities:`,
      
      [BlueprintStates.JOURNEY_RESOURCES]: 
        "Any key resources or expert contacts? Paste links or skip.",
      
      [BlueprintStates.DELIVER_MILESTONES]: 
        "List two major milestones students must meet:",
      
      [BlueprintStates.DELIVER_RUBRIC]: 
        "Let's build a rubric. I've prefilled criteria & levels—tweak or accept:\n\n" +
        this.generateRubricSuggestion(),
      
      [BlueprintStates.DELIVER_IMPACT]: 
        "Who will see students' work? (e.g., local council) and **when?**",
      
      [BlueprintStates.PUBLISH]: 
        "Blueprint complete! 🎉\n\nDownload PDF or copy share link."
    };
    
    return prompts[this.currentState] || "Unknown state";
  }

  // Generate context-aware suggestions based on educator input
  generateBigIdeaSuggestions() {
    const { subject, ageGroup, motivation, location } = this.blueprint;
    const suggestions = [];
    
    // Parse key themes from motivation
    const motivationLower = motivation.toLowerCase();
    
    // Generate personalized suggestions based on their actual inputs
    if (motivationLower.includes('real') || motivationLower.includes('authentic') || motivationLower.includes('connect')) {
      suggestions.push({
        title: "Real-World Applications",
        description: `Connecting ${subject} to authentic challenges in ${location || 'your community'}`
      });
    }
    
    if (motivationLower.includes('creativ') || motivationLower.includes('innovat') || motivationLower.includes('design')) {
      suggestions.push({
        title: "Creative Innovation",
        description: `Using design thinking to reimagine ${subject} concepts`
      });
    }
    
    if (motivationLower.includes('collaborat') || motivationLower.includes('team') || motivationLower.includes('together')) {
      suggestions.push({
        title: "Collaborative Impact",
        description: `Working together to solve ${subject}-related challenges`
      });
    }
    
    if (motivationLower.includes('technolog') || motivationLower.includes('digital') || motivationLower.includes('modern')) {
      suggestions.push({
        title: "Digital Transformation",
        description: `Leveraging technology to enhance ${subject} learning`
      });
    }
    
    if (motivationLower.includes('communit') || motivationLower.includes('local') || motivationLower.includes('impact')) {
      suggestions.push({
        title: "Community Solutions",
        description: `Using ${subject} to address local needs`
      });
    }
    
    // Add subject-specific suggestions if we don't have enough
    while (suggestions.length < 3) {
      const defaults = [
        {
          title: "Systems & Connections",
          description: `Understanding how ${subject} connects to larger systems`
        },
        {
          title: "Future Thinking",
          description: `Preparing students for tomorrow's ${subject} challenges`
        },
        {
          title: "Personal Relevance",
          description: `Making ${subject} meaningful to individual student lives`
        }
      ];
      
      suggestions.push(defaults[suggestions.length]);
    }
    
    return suggestions.slice(0, 3); // Return exactly 3
  }

  generatePhaseSuggestions() {
    return ["Discover & Research", "Design & Create", "Share & Reflect"];
  }

  generateRubricSuggestion() {
    return "**Criteria:**\n" +
           "• Content Knowledge\n" +
           "• Critical Thinking\n" +
           "• Collaboration\n\n" +
           "**Levels:** Emerging | Developing | Proficient | Advanced";
  }

  // Handle user input based on current state
  processInput(input) {
    // Validation and state-specific processing
    switch (this.currentState) {
      case BlueprintStates.ONBOARDING_INPUT:
        return this.processOnboardingInput(input);
      
      case BlueprintStates.ONBOARDING_CONFIRM:
        if (input.toLowerCase() === 'confirm') {
          return this.transition(BlueprintStates.IDEATION_BIG_IDEA);
        } else if (input.toLowerCase() === 'edit') {
          return this.transition(BlueprintStates.ONBOARDING_INPUT);
        }
        break;
      
      case BlueprintStates.IDEATION_BIG_IDEA:
        return this.processBigIdea(input);
      
      case BlueprintStates.IDEATION_ESSENTIAL_QUESTION:
        return this.processEssentialQuestion(input);
      
      case BlueprintStates.IDEATION_CHALLENGE:
        return this.processChallenge(input);
      
      case BlueprintStates.JOURNEY_PHASES:
        return this.processPhases(input);
      
      case BlueprintStates.JOURNEY_ACTIVITIES:
        return this.processActivities(input);
      
      case BlueprintStates.JOURNEY_RESOURCES:
        return this.processResources(input);
      
      case BlueprintStates.DELIVER_MILESTONES:
        return this.processMilestones(input);
      
      case BlueprintStates.DELIVER_RUBRIC:
        return this.processRubric(input);
      
      case BlueprintStates.DELIVER_IMPACT:
        return this.processImpact(input);
    }
  }

  // Process onboarding fields from structured input
  processOnboardingInput(input) {
    // Try to parse as structured response first
    const structuredPattern = /(?:motivation|subject|age|location|scope):\s*([^\n]+)/gi;
    const matches = [...input.matchAll(structuredPattern)];
    
    if (matches.length > 0) {
      // Structured input detected
      matches.forEach(match => {
        const field = match[0].split(':')[0].toLowerCase().trim();
        const value = match[1].trim();
        
        switch(field) {
          case 'motivation':
            this.blueprint.motivation = value;
            break;
          case 'subject':
            this.blueprint.subject = value;
            break;
          case 'age':
          case 'age group':
            this.blueprint.ageGroup = value;
            break;
          case 'location':
            this.blueprint.location = value;
            break;
          case 'scope':
            if (['lesson', 'unit', 'course'].includes(value.toLowerCase())) {
              this.blueprint.scope = this.titleCase(value);
            }
            break;
        }
      });
    } else {
      // Try to parse as natural language
      // This is a fallback for more conversational input
      const lowerInput = input.toLowerCase();
      
      // Extract subject (look for common subject keywords)
      const subjectMatch = lowerInput.match(/teaching\s+(\w+(?:\s+\w+)?)/);
      if (subjectMatch) {
        this.blueprint.subject = this.titleCase(subjectMatch[1]);
      }
      
      // Extract age group (look for age patterns)
      const ageMatch = input.match(/(\d{1,2}[-–]\d{1,2})\s*(?:year|grade|yr)?/i);
      if (ageMatch) {
        this.blueprint.ageGroup = ageMatch[1] + ' year olds';
      }
      
      // Set motivation as the whole input if not structured
      if (!this.blueprint.motivation && input.length > 20) {
        this.blueprint.motivation = input.substring(0, 200);
      }
    }
    
    // Check if all required fields are filled
    if (this.blueprint.motivation && this.blueprint.subject && 
        this.blueprint.ageGroup && this.blueprint.scope) {
      return this.transition(BlueprintStates.ONBOARDING_CONFIRM);
    }
    
    // Return helpful message about missing fields
    const missing = [];
    if (!this.blueprint.motivation) missing.push('motivation');
    if (!this.blueprint.subject) missing.push('subject');
    if (!this.blueprint.ageGroup) missing.push('age group');
    if (!this.blueprint.scope) missing.push('scope (Lesson/Unit/Course)');
    
    return {
      success: false,
      message: `Still need: ${missing.join(', ')}\n\nExample format:\nMotivation: Help students connect learning to real life\nSubject: Science\nAge: 14-15\nScope: Unit`
    };
  }

  processBigIdea(input) {
    const trimmed = input.trim();
    
    // Check if they picked a number
    if (/^[1-3]$/.test(trimmed)) {
      const suggestions = this.generateBigIdeaSuggestions();
      this.blueprint.bigIdea = suggestions[parseInt(trimmed) - 1].title;
    } else {
      // Custom input - check word count
      const wordCount = trimmed.split(/\s+/).length;
      if (wordCount > 10) {
        return {
          success: false,
          message: `That's ${wordCount} words. Please summarize to 10 words or less.`
        };
      }
      this.blueprint.bigIdea = trimmed;
    }
    
    this.updateProgress();
    return this.transition(BlueprintStates.IDEATION_ESSENTIAL_QUESTION);
  }

  processEssentialQuestion(input) {
    const trimmed = input.trim();
    
    // Validate it's a question
    if (!trimmed.endsWith('?')) {
      return {
        success: false,
        message: "Essential Questions should end with a question mark. Please rephrase as a question."
      };
    }
    
    this.blueprint.essentialQuestion = trimmed;
    this.updateProgress();
    return this.transition(BlueprintStates.IDEATION_CHALLENGE);
  }

  processChallenge(input) {
    const trimmed = input.trim();
    
    // Check if it starts with a verb
    const firstWord = trimmed.split(' ')[0].toLowerCase();
    const actionVerbs = ['create', 'design', 'build', 'develop', 'solve', 'improve', 'research', 'analyze', 'present', 'teach'];
    
    if (!actionVerbs.some(verb => firstWord.includes(verb))) {
      return {
        success: false,
        message: "Challenges should start with an action verb (e.g., Create, Design, Build, Solve)."
      };
    }
    
    this.blueprint.challenge = trimmed;
    this.updateProgress();
    return this.transition(BlueprintStates.JOURNEY_PHASES);
  }

  processPhases(input) {
    const trimmed = input.trim();
    
    // Parse phases (could be numbered list or comma separated)
    let phases = [];
    
    if (trimmed.includes('\n')) {
      // Line-separated
      phases = trimmed.split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(phase => phase.length > 0);
    } else if (trimmed.includes(',')) {
      // Comma-separated
      phases = trimmed.split(',').map(p => p.trim());
    } else {
      // Single phase - not enough
      return {
        success: false,
        message: "Please provide at least 2 phases. You can list them on separate lines or comma-separated."
      };
    }
    
    if (phases.length < 2) {
      return {
        success: false,
        message: "Projects need at least 2 phases. You provided " + phases.length + "."
      };
    }
    
    this.blueprint.phases = phases;
    this.currentPhaseIndex = 0; // Track which phase we're adding activities for
    this.updateProgress();
    return this.transition(BlueprintStates.JOURNEY_ACTIVITIES);
  }

  processActivities(input) {
    const trimmed = input.trim();
    const currentPhase = this.blueprint.phases[this.currentPhaseIndex];
    
    // Parse activities
    let activities = [];
    
    if (trimmed.includes('\n')) {
      activities = trimmed.split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(activity => activity.length > 0);
    } else {
      activities = [trimmed]; // Single activity
    }
    
    if (activities.length === 0) {
      return {
        success: false,
        message: "Please provide at least 1 activity for this phase."
      };
    }
    
    // Store activities for this phase
    if (!this.blueprint.activities[currentPhase]) {
      this.blueprint.activities[currentPhase] = [];
    }
    this.blueprint.activities[currentPhase] = activities;
    
    // Check if we need more phases
    this.currentPhaseIndex++;
    if (this.currentPhaseIndex < this.blueprint.phases.length) {
      // Need activities for next phase
      return {
        success: true,
        newState: this.currentState,
        prompt: `For Phase ${this.currentPhaseIndex + 1} ("${this.blueprint.phases[this.currentPhaseIndex]}"), list 2 student activities:`,
        chips: this.getAvailableChips()
      };
    }
    
    // All phases have activities
    this.updateProgress();
    return this.transition(BlueprintStates.JOURNEY_RESOURCES);
  }

  processResources(input) {
    const trimmed = input.trim();
    
    if (trimmed.toLowerCase() === 'skip') {
      // Resources are optional
      return this.transition(BlueprintStates.DELIVER_MILESTONES);
    }
    
    // Parse resources (URLs or text)
    const resources = trimmed.split('\n')
      .map(line => line.trim())
      .filter(resource => resource.length > 0);
    
    this.blueprint.resources = resources;
    this.updateProgress();
    return this.transition(BlueprintStates.DELIVER_MILESTONES);
  }

  processMilestones(input) {
    const trimmed = input.trim();
    
    // Parse milestones
    let milestones = [];
    
    if (trimmed.includes('\n')) {
      milestones = trimmed.split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(milestone => milestone.length > 0);
    } else if (trimmed.includes(',')) {
      milestones = trimmed.split(',').map(m => m.trim());
    } else {
      milestones = [trimmed];
    }
    
    if (milestones.length < 2) {
      return {
        success: false,
        message: "Please provide at least 2 milestones."
      };
    }
    
    this.blueprint.milestones = milestones;
    this.updateProgress();
    return this.transition(BlueprintStates.DELIVER_RUBRIC);
  }

  processRubric(input) {
    const trimmed = input.trim();
    
    // For simplicity, accept the suggested rubric or parse custom input
    if (trimmed.toLowerCase().includes('accept')) {
      // Use default rubric
      this.blueprint.rubric = {
        criteria: ['Content Knowledge', 'Critical Thinking', 'Collaboration', 'Communication'],
        levels: ['Emerging', 'Developing', 'Proficient', 'Advanced']
      };
    } else {
      // Try to parse custom rubric
      // This is simplified - in real implementation would be more sophisticated
      this.blueprint.rubric = {
        criteria: ['Custom Criteria 1', 'Custom Criteria 2'],
        levels: ['Level 1', 'Level 2', 'Level 3']
      };
    }
    
    this.updateProgress();
    return this.transition(BlueprintStates.DELIVER_IMPACT);
  }

  processImpact(input) {
    const trimmed = input.trim();
    
    if (trimmed.length < 10) {
      return {
        success: false,
        message: "Please describe who will see the work and when (e.g., 'Local council at end-of-semester showcase')."
      };
    }
    
    this.blueprint.impactPlan = trimmed;
    this.updateProgress();
    this.blueprint.status = 'complete';
    return this.transition(BlueprintStates.PUBLISH);
  }

  // Handle decision chips
  handleChip(chipType) {
    switch (chipType) {
      case 'GET_IDEAS':
        return this.generateIdeas();
      
      case 'SEE_EXAMPLES':
        return this.generateExamples();
      
      case 'HELP':
        return this.getHelp();
      
      case 'SKIP':
        return this.skipCurrentField();
    }
  }

  generateIdeas() {
    // Context-aware idea generation based on current state
    const ideas = [];
    
    switch (this.currentState) {
      case BlueprintStates.IDEATION_BIG_IDEA:
        return this.generateBigIdeaSuggestions();
      
      case BlueprintStates.IDEATION_ESSENTIAL_QUESTION:
        return [
          `How might ${this.blueprint.ageGroup} students use ${this.blueprint.bigIdea} to impact their community?`,
          `What role does ${this.blueprint.bigIdea} play in shaping our future?`,
          `Why is understanding ${this.blueprint.bigIdea} essential for this generation?`
        ];
      
      // ... other states
    }
    
    return ideas;
  }

  generateExamples() {
    // Return markdown table with 2 exemplars
    switch (this.currentState) {
      case BlueprintStates.IDEATION_BIG_IDEA:
        return `| Example | Context | Why It Works |
|---------|---------|--------------|
| "Sustainable Innovation" | Environmental Science, Grade 9 | Combines action with future-thinking |
| "Digital Citizenship" | Technology, Grade 7 | Relevant and timely for students |`;
      
      // ... other states
    }
  }

  getHelp() {
    const helpText = {
      [BlueprintStates.IDEATION_BIG_IDEA]: 
        "The Big Idea is your project's anchor—a broad concept that gives purpose and coherence to all learning activities.",
      
      [BlueprintStates.IDEATION_ESSENTIAL_QUESTION]:
        "Essential Questions are open-ended, thought-provoking, and drive the entire inquiry process.",
      
      // ... other states
    };
    
    return helpText[this.currentState] || "This step helps build your project framework.";
  }

  skipCurrentField() {
    const requirements = StateRequirements[this.currentState];
    
    if (requirements?.optional || requirements?.optional === true) {
      // Can skip optional fields
      return this.advanceState();
    }
    
    return {
      success: false,
      message: "This field is required and cannot be skipped."
    };
  }

  // State transitions
  transition(nextState) {
    this.stateHistory.push(this.currentState);
    this.currentState = nextState;
    
    return {
      success: true,
      newState: nextState,
      prompt: this.getStatePrompt(),
      chips: this.getAvailableChips()
    };
  }

  advanceState() {
    const stateOrder = Object.values(BlueprintStates);
    const currentIndex = stateOrder.indexOf(this.currentState);
    
    if (currentIndex < stateOrder.length - 1) {
      return this.transition(stateOrder[currentIndex + 1]);
    }
    
    return { success: false, message: "Already at final state" };
  }

  getAvailableChips() {
    // Return chips in exact order: Get Ideas, See Examples, Help, Skip
    const chips = [];
    
    // Some states might not need all chips
    if (this.currentState !== BlueprintStates.ONBOARDING_CONFIRM && 
        this.currentState !== BlueprintStates.PUBLISH) {
      chips.push(DecisionChips.GET_IDEAS);
      chips.push(DecisionChips.SEE_EXAMPLES);
      chips.push(DecisionChips.HELP);
      
      // Skip only if field is optional
      const requirements = StateRequirements[this.currentState];
      if (requirements?.optional || requirements?.optional === true) {
        chips.push(DecisionChips.SKIP);
      }
    }
    
    return chips;
  }

  // Progress tracking
  updateProgress() {
    let completed = 0;
    
    // Count completed required fields
    if (this.blueprint.motivation) completed++;
    if (this.blueprint.subject) completed++;
    if (this.blueprint.ageGroup) completed++;
    if (this.blueprint.scope) completed++;
    if (this.blueprint.bigIdea) completed++;
    if (this.blueprint.essentialQuestion) completed++;
    if (this.blueprint.challenge) completed++;
    if (this.blueprint.phases.length >= 2) completed++;
    if (Object.keys(this.blueprint.activities).length > 0) completed++;
    if (this.blueprint.milestones.length >= 2) completed++;
    if (this.blueprint.rubric.criteria.length > 0) completed++;
    if (this.blueprint.impactPlan) completed++;
    
    this.blueprint.completedFields = completed;
    
    if (completed === this.blueprint.totalRequiredFields) {
      this.blueprint.status = 'complete';
    }
    
    return `${completed} / ${this.blueprint.totalRequiredFields} fields complete`;
  }

  // Utility functions
  extractValue(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      return line.substring(colonIndex + 1).trim();
    }
    return line.trim();
  }

  titleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }

  // Get current blueprint data
  getBlueprint() {
    return { ...this.blueprint };
  }

  // Check if can proceed to next state
  canProceed() {
    const requirements = StateRequirements[this.currentState];
    if (!requirements) return true;
    
    // Check each required field
    for (const field of requirements.fields) {
      const value = this.blueprint[field];
      
      if (requirements.minCount && Array.isArray(value)) {
        if (value.length < requirements.minCount) return false;
      } else if (requirements.maxWords && typeof value === 'string') {
        if (value.split(/\s+/).length > requirements.maxWords) return false;
      } else if (!value || (Array.isArray(value) && value.length === 0)) {
        return false;
      }
    }
    
    return true;
  }
}

export default BlueprintStateMachine;