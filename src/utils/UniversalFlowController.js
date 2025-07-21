// UniversalFlowController.js
// Universal flow controller for all conversational stages with age-adaptive depth

import { AgeAdaptiveValidator } from './AgeAdaptiveValidation.js';

export class UniversalFlowController {
  constructor(stage, ageGroup, subject) {
    this.stage = stage; // 'ideation', 'journey', 'deliverables'
    this.ageGroup = ageGroup;
    this.subject = subject;
    this.validator = new AgeAdaptiveValidator(ageGroup, subject);
    
    // Age-adaptive depth limits
    this.maxDepth = this.getMaxDepthForAge();
    this.currentDepth = 0;
    this.navigationPath = [];
    this.interactionCount = 0;
    this.currentStep = this.getInitialStep();
    
    // Track quality responses to allow more exploration for capable users
    this.qualityResponseCount = 0;
  }

  getMaxDepthForAge() {
    // College students can explore deeper
    if (this.validator.isCollegeLevel) {
      return 4; // Allow deeper theoretical exploration
    } else if (this.validator.allowsAbstraction.level === 'MEDIUM-HIGH') {
      return 3; // High school - moderate depth
    } else {
      return 2; // Elementary/Middle - keep it simple
    }
  }

  getInitialStep() {
    const stageSteps = {
      ideation: 'bigIdea',
      journey: 'phases',
      deliverables: 'milestones'
    };
    return stageSteps[this.stage] || 'start';
  }

  // Track navigation with quality awareness
  trackNavigation(choice, type = 'exploration', quality = 'MEDIUM') {
    this.navigationPath.push({
      choice,
      type,
      quality,
      timestamp: Date.now(),
      depth: this.currentDepth
    });
    
    if (type === 'exploration') {
      this.currentDepth++;
      this.interactionCount++;
      
      // Track high-quality responses
      if (quality === 'HIGH') {
        this.qualityResponseCount++;
      }
    }
  }

  // Determine if we should show more options based on age and quality
  shouldShowMoreOptions() {
    // For college level with high-quality responses, allow deeper exploration
    if (this.validator.isCollegeLevel && this.qualityResponseCount >= 2) {
      return this.currentDepth < this.maxDepth + 1; // Extra depth for engaged students
    }
    
    // Standard depth check
    if (this.currentDepth >= this.maxDepth) {
      return false;
    }
    
    // Limit total interactions based on age
    const maxInteractions = this.validator.isCollegeLevel ? 8 : 5;
    if (this.interactionCount > maxInteractions) {
      return false;
    }
    
    return true;
  }

  // Get response strategy based on user input and context
  getResponseStrategy(userInput, currentStep) {
    const lowerInput = userInput.toLowerCase();
    
    // Validate the input quality
    const validation = this.validateInput(userInput, currentStep);
    
    // User selected a concrete example or high-quality response
    if (validation.isValid && validation.score >= 35) {
      this.qualityResponseCount++;
      return {
        type: 'advance',
        action: 'save_and_proceed',
        quality: 'HIGH',
        depth: 0
      };
    }
    
    // User wants to refine (good for all ages)
    if (lowerInput.includes('refine') || lowerInput.includes('improve')) {
      return {
        type: 'refine',
        action: 'show_refinements',
        depth: this.currentDepth,
        ageAppropriate: true
      };
    }
    
    // Check if we've gone too deep
    if (!this.shouldShowMoreOptions()) {
      // Different messages based on age
      if (this.validator.isCollegeLevel) {
        return {
          type: 'synthesize',
          action: 'show_synthesis',
          message: 'Let\'s synthesize these concepts into a cohesive framework:',
          depth: 0
        };
      } else {
        return {
          type: 'redirect',
          action: 'show_examples',
          message: 'Great exploration! Here are some concrete options based on your interests:',
          depth: 0
        };
      }
    }
    
    // Default exploration with age-appropriate guidance
    return {
      type: 'explore',
      action: 'show_options',
      depth: this.currentDepth + 1,
      guidanceLevel: this.getGuidanceLevel()
    };
  }

  // Validate input based on current step and age
  validateInput(input, step) {
    switch(this.stage) {
      case 'ideation':
        if (step === 'bigIdea') return this.validator.validateBigIdea(input);
        if (step === 'essentialQuestion') return this.validator.validateEssentialQuestion(input);
        if (step === 'challenge') return this.validator.validateChallenge(input);
        break;
      
      case 'journey':
        return this.validateJourneyInput(input, step);
        
      case 'deliverables':
        return this.validateDeliverablesInput(input, step);
        
      default:
        return { isValid: true, score: 30, feedback: '' };
    }
  }

  // Validation for journey stage
  validateJourneyInput(input, step) {
    const validation = {
      isValid: false,
      score: 0,
      feedback: '',
      suggestions: []
    };

    if (!input || input.trim().length < 10) {
      validation.feedback = 'Please provide more detail.';
      return validation;
    }

    // Age-appropriate validation for journey planning
    if (this.validator.isCollegeLevel) {
      // Allow complex, self-directed learning paths
      validation.isValid = true;
      validation.score = 40;
      validation.feedback = 'Good learning design thinking!';
    } else {
      // Require more structure for younger students
      const hasStructure = /week|day|lesson|activity|step/.test(input.toLowerCase());
      if (hasStructure) {
        validation.isValid = true;
        validation.score = 35;
        validation.feedback = 'Nice structured approach!';
      } else {
        validation.feedback = 'Consider breaking this into clear steps or timeframes.';
        validation.suggestions = [
          'Think about weekly activities',
          'What happens in each lesson?',
          'Break it into manageable chunks'
        ];
      }
    }

    return validation;
  }

  // Validation for deliverables stage
  validateDeliverablesInput(input, step) {
    const validation = {
      isValid: false,
      score: 0,
      feedback: '',
      suggestions: []
    };

    if (!input || input.trim().length < 10) {
      validation.feedback = 'Please describe the deliverable.';
      return validation;
    }

    const lower = input.toLowerCase();
    const hasProduct = /create|build|design|write|develop|produce/.test(lower);

    if (hasProduct) {
      validation.isValid = true;
      validation.score = 35;
      
      // Age-specific feedback
      if (this.validator.isCollegeLevel) {
        validation.feedback = 'Good deliverable. Consider adding assessment criteria.';
      } else {
        validation.feedback = 'Great! Students will enjoy creating this.';
      }
    } else {
      validation.feedback = 'Deliverables should describe what students create.';
      validation.suggestions = this.validator.generateExamples('deliverable');
    }

    return validation;
  }

  // Get guidance level based on age
  getGuidanceLevel() {
    if (this.validator.isCollegeLevel) {
      return {
        style: 'socratic', // Ask probing questions
        scaffolding: 'minimal',
        examples: 'theoretical',
        language: 'sophisticated'
      };
    } else if (this.validator.allowsAbstraction.level === 'MEDIUM-HIGH') {
      return {
        style: 'balanced', // Mix of guidance and independence
        scaffolding: 'moderate',
        examples: 'applied',
        language: 'accessible'
      };
    } else {
      return {
        style: 'directive', // Clear guidance
        scaffolding: 'high',
        examples: 'concrete',
        language: 'simple'
      };
    }
  }

  // Generate age-appropriate button options
  getButtonOptions(currentSuggestions = []) {
    const nextAction = this.suggestNextAction();
    
    // College level - more sophisticated options
    if (this.validator.isCollegeLevel) {
      if (this.currentDepth === 0) {
        return {
          primary: 'explore_theory',
          secondary: 'see_frameworks',
          tertiary: 'provide_context',
          labels: {
            explore_theory: 'Explore Theoretical Dimensions',
            see_frameworks: 'Review Established Frameworks',
            provide_context: 'Provide Research Context'
          }
        };
      } else {
        return {
          primary: 'synthesize',
          secondary: 'see_examples',
          labels: {
            synthesize: 'Synthesize Ideas',
            see_examples: 'See Applied Examples'
          }
        };
      }
    }
    
    // Standard options for younger students
    if (nextAction.suggestion === 'show_examples') {
      return {
        primary: 'examples',
        secondary: 'write_own',
        showHelp: false
      };
    }
    
    if (this.currentDepth === 0) {
      return {
        primary: 'ideas',
        secondary: 'examples',
        tertiary: 'help',
        showHelp: true
      };
    }
    
    return {
      primary: 'examples',
      secondary: 'refine',
      showHelp: false
    };
  }

  // Suggest next action based on context
  suggestNextAction() {
    const context = this.getNavigationContext();
    
    if (!context) {
      return { suggestion: 'explore', reason: 'just_started' };
    }
    
    // For college students who are engaged, encourage deeper exploration
    if (this.validator.isCollegeLevel && this.qualityResponseCount >= 2) {
      if (context.depth < 3) {
        return { 
          suggestion: 'explore_deeper', 
          reason: 'high_engagement',
          message: 'Your thinking shows depth. Let\'s explore further:'
        };
      }
    }
    
    // Standard progression
    if (context.hasExploredEnough) {
      return { 
        suggestion: 'show_examples', 
        reason: 'explored_enough',
        message: this.validator.isCollegeLevel ? 
          'Based on your theoretical exploration, here are some frameworks:' :
          'Based on your interests, here are some concrete options:'
      };
    }
    
    if (context.depth >= this.maxDepth) {
      return { 
        suggestion: 'show_examples', 
        reason: 'max_depth_reached',
        message: 'Let\'s make this more concrete:'
      };
    }
    
    return { suggestion: 'continue_exploring', reason: 'still_exploring' };
  }

  // Get navigation context
  getNavigationContext() {
    if (this.navigationPath.length === 0) {
      return null;
    }
    
    return {
      depth: this.currentDepth,
      interactions: this.interactionCount,
      lastChoice: this.navigationPath[this.navigationPath.length - 1],
      hasExploredEnough: this.interactionCount >= (this.validator.isCollegeLevel ? 4 : 3),
      qualityResponses: this.qualityResponseCount
    };
  }

  // Reset for next step
  advanceToNextStep(nextStep) {
    this.currentStep = nextStep;
    this.currentDepth = 0;
    this.interactionCount = 0;
    this.navigationPath = [];
    this.qualityResponseCount = 0;
  }

  // Get stage-specific steps
  getStageSteps() {
    const steps = {
      ideation: ['bigIdea', 'essentialQuestion', 'challenge'],
      journey: ['phases', 'activities', 'resources'],
      deliverables: ['milestones', 'descriptions', 'assessment']
    };
    return steps[this.stage] || [];
  }
}

export default UniversalFlowController;