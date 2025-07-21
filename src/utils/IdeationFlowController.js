// IdeationFlowController.js
// Controls the flow and depth of ideation to prevent users from getting lost in nested suggestions

export class IdeationFlowController {
  constructor() {
    this.maxDepth = 2; // Maximum nesting depth
    this.currentDepth = 0;
    this.navigationPath = [];
    this.interactionCount = 0;
    this.currentStep = 'bigIdea';
  }

  // Track user navigation through suggestions
  trackNavigation(choice, type = 'exploration') {
    this.navigationPath.push({
      choice,
      type,
      timestamp: Date.now(),
      depth: this.currentDepth
    });
    
    if (type === 'exploration') {
      this.currentDepth++;
      this.interactionCount++;
    }
  }

  // Determine if we should show more exploration options
  shouldShowMoreOptions() {
    // Don't allow deeper exploration if at max depth
    if (this.currentDepth >= this.maxDepth) {
      return false;
    }
    
    // Limit total interactions per step to prevent loops
    if (this.interactionCount > 5) {
      return false;
    }
    
    return true;
  }

  // Get appropriate response based on current state
  getResponseStrategy(userInput) {
    const lowerInput = userInput.toLowerCase();
    
    // User selected a concrete example or template
    if (lowerInput.includes('use this') || 
        lowerInput.includes('keep and continue') ||
        this.isConcreteExample(userInput)) {
      return {
        type: 'advance',
        action: 'save_and_proceed',
        depth: 0
      };
    }
    
    // User wants to refine
    if (lowerInput.includes('refine') || 
        lowerInput.includes('improve') ||
        lowerInput.includes('make it more')) {
      return {
        type: 'refine',
        action: 'show_refinements',
        depth: this.currentDepth
      };
    }
    
    // Check if we've gone too deep
    if (!this.shouldShowMoreOptions()) {
      return {
        type: 'redirect',
        action: 'show_examples',
        message: 'Let me show you some concrete examples to help you decide:',
        depth: 0
      };
    }
    
    // Default exploration
    return {
      type: 'explore',
      action: 'show_options',
      depth: this.currentDepth + 1
    };
  }

  // Check if input looks like a concrete example selection
  isConcreteExample(input) {
    const concretePatterns = [
      'urban planning for',
      'sustainable',
      'technological innovation',
      'community',
      'development',
      'how can',
      'what would',
      'design',
      'create'
    ];
    
    const lowerInput = input.toLowerCase();
    return concretePatterns.some(pattern => lowerInput.includes(pattern)) && 
           input.length > 30;
  }

  // Reset for next step
  advanceToNextStep(nextStep) {
    this.currentStep = nextStep;
    this.currentDepth = 0;
    this.interactionCount = 0;
    this.navigationPath = [];
  }

  // Get user's navigation context
  getNavigationContext() {
    if (this.navigationPath.length === 0) {
      return null;
    }
    
    return {
      depth: this.currentDepth,
      interactions: this.interactionCount,
      lastChoice: this.navigationPath[this.navigationPath.length - 1],
      hasExploredEnough: this.interactionCount >= 3
    };
  }

  // Suggest best action based on context
  suggestNextAction() {
    const context = this.getNavigationContext();
    
    if (!context) {
      return { suggestion: 'explore', reason: 'just_started' };
    }
    
    if (context.hasExploredEnough) {
      return { 
        suggestion: 'show_examples', 
        reason: 'explored_enough',
        message: 'Based on your interests, here are some concrete options:'
      };
    }
    
    if (context.depth >= this.maxDepth) {
      return { 
        suggestion: 'show_examples', 
        reason: 'max_depth_reached',
        message: 'Let\'s make this more concrete with some examples:'
      };
    }
    
    return { suggestion: 'continue_exploring', reason: 'still_exploring' };
  }

  // Get simplified button options based on context
  getButtonOptions(currentSuggestions = []) {
    const nextAction = this.suggestNextAction();
    
    // At max depth or explored enough - show only concrete options
    if (nextAction.suggestion === 'show_examples') {
      return {
        primary: 'examples',
        secondary: 'write_own',
        showHelp: false
      };
    }
    
    // Just starting - show all options
    if (this.currentDepth === 0) {
      return {
        primary: 'ideas',
        secondary: 'examples',
        tertiary: 'help',
        showHelp: true
      };
    }
    
    // In exploration - limit options
    return {
      primary: 'examples',
      secondary: 'refine',
      showHelp: false
    };
  }
}

export default IdeationFlowController;