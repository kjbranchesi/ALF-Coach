// Universal Progression Engine - Prevents loops and ensures forward progress
export class ProgressionEngine {
  
  constructor(stage, step) {
    this.stage = stage;
    this.step = step;
    this.attempts = {
      coaching: 0,
      refinement: 0,
      help: 0,
      total: 0
    };
    this.state = 'INITIAL';
    this.maxAttempts = {
      coaching: 3,
      refinement: 2,
      help: 2,
      total: 8
    };
  }

  /**
   * Main routing logic - decides next action based on input and current state
   */
  routeInteraction(userInput, responseQuality, interactionType = 'response') {
    console.log(`🗺️ Routing: ${interactionType}, Quality: ${responseQuality}, State: ${this.state}`);
    
    // Anti-loop protection - force advancement if too many attempts
    if (this.shouldForceAdvancement()) {
      return this.createAction('FORCE_ADVANCE', 'Maximum attempts reached. Moving forward with current progress.');
    }

    // Route based on interaction type
    switch (interactionType) {
      case 'help_request':
        return this.routeHelpRequest(userInput);
      case 'refinement_selection':
        return this.routeRefinementSelection(userInput);
      case 'what_if_selection':
        return this.routeWhatIfSelection(userInput);
      case 'example_selection':
        return this.routeExampleSelection(userInput);
      case 'confirmation':
        return this.routeConfirmation(userInput);
      default:
        return this.routeResponse(userInput, responseQuality);
    }
  }

  /**
   * Route regular responses based on quality
   */
  routeResponse(userInput, quality) {
    this.attempts.total++;

    switch (quality) {
      case 'HIGH':
        if (this.canRefine()) {
          this.setState('REFINING');
          return this.createAction('OFFER_REFINEMENT', null, [
            `Make it more specific to ${this.getStepContext()}`,
            'Connect it more directly to real-world applications',
            `Focus it on developmental appropriateness`,
            'Keep and Continue'
          ]);
        }
        return this.createAction('COMPLETE_STEP', `Excellent! Your ${this.step} is ready.`);

      case 'MEDIUM':
        if (this.canRefine()) {
          this.attempts.refinement++;
          this.setState('REFINING');
          return this.createAction('GUIDE_REFINEMENT', `Good start! Here are ways to strengthen it:`, [
            'Make it more specific and focused',
            'Add more concrete details',
            'Connect to your subject area better',
            'Keep and Continue'
          ]);
        }
        return this.createAction('COMPLETE_STEP', `That works! Moving forward with your ${this.step}.`);

      case 'LOW':
        if (this.canCoach()) {
          this.attempts.coaching++;
          this.setState('COACHING');
          return this.createAction('PROVIDE_COACHING', `Let me help you develop this further:`, [
            `What if the ${this.step} was more focused on ${this.getStepContext()}?`,
            `What if you considered the ${this.getDevelopmentalContext()}?`,
            `What if you connected this to your teaching goals?`
          ]);
        }
        // After max coaching, provide examples
        return this.createAction('PROVIDE_EXAMPLES', `Here are some strong examples you can select:`, this.getStepExamples());

      default:
        return this.createAction('REQUEST_INPUT', `Please provide your ${this.step} or click for assistance.`);
    }
  }

  /**
   * Route help requests (ideas, examples, help)
   */
  routeHelpRequest(type) {
    this.attempts.help++;
    
    switch (type.toLowerCase()) {
      case 'ideas':
        this.setState('COACHING');
        return this.createAction('BRAINSTORM_IDEAS', `Let's explore some concepts:`, [
          `What if the ${this.step} focused on ${this.getStepContext()}?`,
          `What if you considered ${this.getAlternativeContext()}?`,
          `What if you connected this to student interests?`
        ]);

      case 'examples':
        this.setState('PROVIDING_EXAMPLES');
        return this.createAction('SHOW_EXAMPLES', `Here are proven ${this.step} examples:`, this.getStepExamples());

      case 'help':
        return this.createAction('PROVIDE_GUIDANCE', this.getStepGuidance(), [
          'Show me some ideas',
          'Give me examples',
          'I\'ll write my own'
        ]);

      default:
        return this.routeResponse(type, 'MEDIUM');
    }
  }

  /**
   * Route refinement selections
   */
  routeRefinementSelection(selection) {
    if (selection.toLowerCase().includes('keep')) {
      return this.createAction('COMPLETE_STEP', `Perfect! Your ${this.step} is captured.`);
    }
    
    this.attempts.refinement++;
    this.setState('REFINING');
    
    return this.createAction('REQUEST_REFINEMENT', `Please provide your refined ${this.step}:`);
  }

  /**
   * Route "What If" selections
   */
  routeWhatIfSelection(selection) {
    this.setState('DEVELOPING_CONCEPT');
    const concept = this.extractConcept(selection);
    
    return this.createAction('DEVELOP_CONCEPT', 
      `Great choice! Let's develop "${concept}" into your complete ${this.step}. How would you phrase this?`
    );
  }

  /**
   * Route example selections
   */
  routeExampleSelection(selection) {
    return this.createAction('COMPLETE_STEP', `Excellent choice! Your ${this.step}: "${selection}"`);
  }

  /**
   * Route confirmations
   */
  routeConfirmation(confirmation) {
    return this.createAction('COMPLETE_STEP', `Confirmed! Moving to the next step.`);
  }

  /**
   * Anti-loop protection checks
   */
  shouldForceAdvancement() {
    return (
      this.attempts.coaching >= this.maxAttempts.coaching ||
      this.attempts.refinement >= this.maxAttempts.refinement ||
      this.attempts.total >= this.maxAttempts.total
    );
  }

  canRefine() {
    return this.attempts.refinement < this.maxAttempts.refinement;
  }

  canCoach() {
    return this.attempts.coaching < this.maxAttempts.coaching;
  }

  /**
   * State management
   */
  setState(newState) {
    console.log(`🔄 State transition: ${this.state} → ${newState}`);
    this.state = newState;
  }

  /**
   * Create action response
   */
  createAction(type, message, suggestions = null) {
    const action = {
      type,
      message,
      suggestions,
      shouldAdvance: ['COMPLETE_STEP', 'FORCE_ADVANCE'].includes(type),
      attempts: { ...this.attempts },
      state: this.state
    };

    console.log(`🎯 Created action:`, action);
    return action;
  }

  /**
   * Context helpers for different steps/stages
   */
  getStepContext() {
    const contexts = {
      'Ideation': {
        'bigIdea': 'your subject area and student needs',
        'essentialQuestion': 'driving inquiry and curiosity',
        'challenge': 'meaningful student work and authentic audience'
      },
      'Journey': {
        'experiences': 'active learning and student engagement',
        'assessment': 'authentic evaluation methods',
        'timeline': 'realistic pacing and sequence'
      }
    };
    return contexts[this.stage]?.[this.step] || 'your educational goals';
  }

  getAlternativeContext() {
    const alternatives = {
      'bigIdea': 'real-world connections and current issues',
      'essentialQuestion': 'student curiosity and exploration',
      'challenge': 'community impact and professional relevance'
    };
    return alternatives[this.step] || 'different perspectives';
  }

  getDevelopmentalContext() {
    return 'age-appropriate complexity and engagement strategies';
  }

  getStepExamples() {
    // This would be populated with actual examples based on step and subject
    const examples = {
      'bigIdea': [
        'Sustainable Community Design - How environmental and social needs shape urban spaces',
        'Innovation and Tradition - When new ideas meet established cultural practices', 
        'Power and Responsibility - How authority and accountability work together in communities'
      ],
      'essentialQuestion': [
        'How might we design solutions that balance competing needs?',
        'What drives people to create lasting change?',
        'How do individuals influence collective action?'
      ],
      'challenge': [
        'Design a community improvement proposal',
        'Create a multimedia presentation for local leaders',
        'Develop a prototype solution with user feedback'
      ]
    };
    return examples[this.step] || ['Example 1', 'Example 2', 'Example 3'];
  }

  getStepGuidance() {
    const guidance = {
      'bigIdea': `A Big Idea is a central theme that connects all learning in your course. It should be broad enough to encompass multiple topics but focused enough to provide clear direction. Think themes like "Identity and Belonging" rather than topics like "The Civil War."`,
      'essentialQuestion': `An Essential Question drives inquiry throughout your course. It should be open-ended, spark curiosity, and connect to big ideas students care about. It must be an actual question, not a statement about what you want students to think about.`,
      'challenge': `The Challenge is the meaningful work students will create and share. It should be authentic, have a real audience, and allow students to demonstrate their learning in action. Think "design a solution" rather than "write a paper."`
    };
    return guidance[this.step] || `This step helps define an important part of your learning experience.`;
  }

  extractConcept(whatIfText) {
    const match = whatIfText.match(/what if.*?['"]([^'"]+)['"]/i);
    if (match) return match[1];
    
    // Fallback extraction
    return whatIfText.replace(/what if.*?(the )?\w+\s+was\s*/i, '').replace(/['"?]/g, '');
  }

  /**
   * Get progression summary for debugging
   */
  getProgressSummary() {
    return {
      stage: this.stage,
      step: this.step,
      state: this.state,
      attempts: this.attempts,
      canAdvance: this.shouldForceAdvancement(),
      progressPercent: Math.min((this.attempts.total / this.maxAttempts.total) * 100, 100)
    };
  }
}

export default ProgressionEngine;