import { paraphraseIdea } from '../../utils/paraphraseIdea';
import { AgeAdaptiveValidation } from '../../utils/AgeAdaptiveValidation';

export class UniversalFlowController {
  constructor(flowType = 'ideation') {
    this.flowType = flowType;
    this.ageValidator = new AgeAdaptiveValidation();
    this.state = {
      currentStep: 'welcome',
      inputs: {},
      validationStatus: 'pending',
      conversationHistory: [],
      metadata: {
        startTime: new Date(),
        completionTime: null,
        totalInteractions: 0
      }
    };
    
    this.flowConfigs = {
      ideation: {
        steps: ['welcome', 'audience', 'topic', 'project-idea', 'validation', 'complete'],
        prompts: {
          welcome: "Hello! I'm here to help you design an authentic learning project. Let's start by getting to know your learners and what you'd like to teach.",
          audience: "Great! Let's start by understanding who your learners are. Can you tell me about your target audience? For example, are they elementary students, high schoolers, college students, or adult learners?",
          topic: "Now, what subject or topic would you like to create a project for? This could be anything from math and science to history, arts, or interdisciplinary topics.",
          projectIdea: "Let's brainstorm a project idea. What kind of authentic, real-world project would you like your learners to work on?",
          validation: "Let me make sure I understand your project idea correctly.",
          complete: "Excellent! Your project idea is ready. You can now proceed to the Journey stage to develop this further."
        }
      },
      journey: {
        steps: ['welcome', 'review', 'timeline', 'milestones', 'scaffolding', 'validation', 'complete'],
        prompts: {
          welcome: "Welcome to the Journey stage! Let's map out how your project will unfold over time.",
          review: "First, let me review your project idea to ensure we're building on the right foundation.",
          timeline: "How long do you envision this project taking? Consider your learners' age and the complexity of the project.",
          milestones: "Let's break down the project into key milestones. What are the major checkpoints or phases?",
          scaffolding: "Now, let's think about the support structures your learners will need at each stage.",
          validation: "Here's the journey map we've created together.",
          complete: "Your project journey is mapped out! Ready to move on to creating deliverables?"
        }
      },
      deliverables: {
        steps: ['welcome', 'review', 'artifacts', 'assessment', 'showcase', 'validation', 'complete'],
        prompts: {
          welcome: "Welcome to the Deliverables stage! Let's define what your learners will create and how they'll demonstrate their learning.",
          review: "Let me review your project and journey to ensure our deliverables align.",
          artifacts: "What specific artifacts or products will learners create during this project?",
          assessment: "How will you assess student learning throughout the project?",
          showcase: "How will learners share their work with authentic audiences?",
          validation: "Here's the complete deliverables plan we've developed.",
          complete: "Excellent! Your ALF project is now complete with clear deliverables and assessment strategies."
        }
      }
    };
    
    this.currentConfig = this.flowConfigs[flowType];
  }

  getCurrentStep() {
    return this.state.currentStep;
  }

  getProgress() {
    const currentIndex = this.currentConfig.steps.indexOf(this.state.currentStep);
    const totalSteps = this.currentConfig.steps.length;
    return {
      percentage: Math.round((currentIndex / (totalSteps - 1)) * 100),
      currentStep: currentIndex + 1,
      totalSteps: totalSteps,
      stepsRemaining: totalSteps - currentIndex - 1
    };
  }

  addToHistory(role, content) {
    this.state.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      step: this.state.currentStep
    });
    this.state.metadata.totalInteractions++;
  }

  processUserInput(input) {
    this.addToHistory('user', input);
    
    const currentStepIndex = this.currentConfig.steps.indexOf(this.state.currentStep);
    const nextStep = this.currentConfig.steps[currentStepIndex + 1];
    
    // Store the input
    this.state.inputs[this.state.currentStep] = input;
    
    // Process based on flow type and current step
    let response = this.generateResponse(this.state.currentStep, input, nextStep);
    
    // Add age-adaptive modifications if dealing with audience
    if (this.state.currentStep === 'audience' && this.flowType === 'ideation') {
      const ageGroup = this.ageValidator.detectAgeGroup(input);
      this.state.inputs.ageGroup = ageGroup;
      response.response = this.ageValidator.adaptPromptForAge(response.response, ageGroup);
    }
    
    // Validate project idea if in validation step
    if (this.state.currentStep === 'validation') {
      response = this.handleValidation(input);
    }
    
    this.addToHistory('assistant', response.response);
    
    if (response.nextStep) {
      this.state.currentStep = response.nextStep;
    }
    
    return response;
  }

  generateResponse(currentStep, input, nextStep) {
    const baseResponse = {
      response: this.currentConfig.prompts[nextStep] || "Let's continue...",
      nextStep: nextStep,
      progress: this.getProgress()
    };

    // Customize responses based on flow type and step
    switch(this.flowType) {
      case 'ideation':
        return this.generateIdeationResponse(currentStep, input, baseResponse);
      case 'journey':
        return this.generateJourneyResponse(currentStep, input, baseResponse);
      case 'deliverables':
        return this.generateDeliverablesResponse(currentStep, input, baseResponse);
      default:
        return baseResponse;
    }
  }

  generateIdeationResponse(step, input, baseResponse) {
    switch(step) {
      case 'audience':
        baseResponse.response = `I understand you're working with ${input}. That's wonderful! ${baseResponse.response}`;
        break;
      case 'topic':
        baseResponse.response = `${input} is a great subject to explore! Now, let's brainstorm a project idea. What kind of authentic, real-world project would you like your ${this.state.inputs.audience} to work on related to ${input}?`;
        break;
      case 'project-idea':
        const paraphrased = paraphraseIdea(input);
        baseResponse.response = `Let me make sure I understand your project idea correctly: ${paraphrased}\n\nThis project would engage your ${this.state.inputs.audience} in ${this.state.inputs.topic} through authentic, hands-on learning.\n\nDoes this capture what you have in mind?`;
        break;
    }
    return baseResponse;
  }

  generateJourneyResponse(step, input, baseResponse) {
    // Journey-specific response generation
    switch(step) {
      case 'timeline':
        baseResponse.response = `A ${input} timeline sounds appropriate. Now, ${baseResponse.response}`;
        break;
      case 'milestones':
        baseResponse.response = `Those milestones will help structure the learning journey. ${baseResponse.response}`;
        break;
    }
    return baseResponse;
  }

  generateDeliverablesResponse(step, input, baseResponse) {
    // Deliverables-specific response generation
    switch(step) {
      case 'artifacts':
        baseResponse.response = `Those artifacts will provide concrete evidence of learning. ${baseResponse.response}`;
        break;
      case 'assessment':
        baseResponse.response = `That assessment approach aligns well with authentic learning. ${baseResponse.response}`;
        break;
    }
    return baseResponse;
  }

  handleValidation(input) {
    if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('correct') || 
        input.toLowerCase().includes('sounds good') || input.toLowerCase().includes('looks good')) {
      this.state.validationStatus = 'confirmed';
      const completeStep = this.currentConfig.steps[this.currentConfig.steps.length - 1];
      return {
        response: this.currentConfig.prompts.complete,
        nextStep: completeStep,
        complete: true,
        progress: { percentage: 100 }
      };
    } else {
      // Go back to previous step for revision
      const currentIndex = this.currentConfig.steps.indexOf(this.state.currentStep);
      const previousStep = this.currentConfig.steps[currentIndex - 1];
      return {
        response: "No problem! Let's refine that. What would you like to adjust?",
        nextStep: previousStep,
        progress: this.getProgress()
      };
    }
  }

  getCompletedData() {
    if (this.state.currentStep === 'complete' && this.state.validationStatus === 'confirmed') {
      this.state.metadata.completionTime = new Date();
      return {
        flowType: this.flowType,
        inputs: this.state.inputs,
        conversationHistory: this.state.conversationHistory,
        metadata: this.state.metadata
      };
    }
    return null;
  }

  exportState() {
    return JSON.stringify(this.state);
  }

  importState(stateString) {
    try {
      this.state = JSON.parse(stateString);
      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      return false;
    }
  }

  reset() {
    this.state = {
      currentStep: 'welcome',
      inputs: {},
      validationStatus: 'pending',
      conversationHistory: [],
      metadata: {
        startTime: new Date(),
        completionTime: null,
        totalInteractions: 0
      }
    };
  }
}