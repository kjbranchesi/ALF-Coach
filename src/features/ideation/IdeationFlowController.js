import { paraphraseIdea } from '../../utils/paraphraseIdea';

export class IdeationFlowController {
  constructor() {
    this.userInputs = {
      audience: null,
      topic: null,
      projectIdea: null,
      validationStatus: 'pending',
      currentStep: 'welcome'
    };
    
    this.conversationHistory = [];
    this.flowSteps = ['welcome', 'audience', 'topic', 'project-idea', 'validation', 'complete'];
  }

  getCurrentStep() {
    return this.userInputs.currentStep;
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, content, timestamp: new Date() });
  }

  processUserInput(input) {
    this.addToHistory('user', input);
    
    switch (this.userInputs.currentStep) {
      case 'welcome':
        this.userInputs.currentStep = 'audience';
        return {
          response: "Great! Let's start by understanding who your learners are. Can you tell me about your target audience? For example, are they elementary students, high schoolers, college students, or adult learners?",
          nextStep: 'audience'
        };
        
      case 'audience':
        this.userInputs.audience = input;
        this.userInputs.currentStep = 'topic';
        return {
          response: `I understand you're working with ${input}. That's wonderful! Now, what subject or topic would you like to create a project for? This could be anything from math and science to history, arts, or interdisciplinary topics.`,
          nextStep: 'topic'
        };
        
      case 'topic':
        this.userInputs.topic = input;
        this.userInputs.currentStep = 'project-idea';
        return {
          response: `${input} is a great subject to explore! Now, let's brainstorm a project idea. What kind of authentic, real-world project would you like your ${this.userInputs.audience} to work on related to ${input}? Think about something that could engage them and connect to their lives or community.`,
          nextStep: 'project-idea'
        };
        
      case 'project-idea':
        this.userInputs.projectIdea = input;
        this.userInputs.currentStep = 'validation';
        return this.validateProjectIdea(input);
        
      case 'validation':
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('sounds good')) {
          this.userInputs.validationStatus = 'confirmed';
          this.userInputs.currentStep = 'complete';
          return {
            response: "Excellent! Your project idea is ready. You can now proceed to the Journey stage to develop this further.",
            nextStep: 'complete',
            complete: true
          };
        } else {
          this.userInputs.currentStep = 'project-idea';
          return {
            response: "No problem! Let's refine your idea. What adjustments would you like to make to the project?",
            nextStep: 'project-idea'
          };
        }
        
      default:
        return {
          response: "I'm not sure what step we're on. Let's start fresh.",
          nextStep: 'welcome'
        };
    }
  }

  validateProjectIdea(idea) {
    // Paraphrase the idea to show understanding
    const paraphrasedIdea = paraphraseIdea(idea);
    
    return {
      response: `Let me make sure I understand your project idea correctly: ${paraphrasedIdea}

This project would engage your ${this.userInputs.audience} in ${this.userInputs.topic} through authentic, hands-on learning. 

Does this capture what you have in mind? If you'd like to adjust anything, just let me know!`,
      nextStep: 'validation'
    };
  }

  getCompletedData() {
    if (this.userInputs.currentStep === 'complete' && this.userInputs.validationStatus === 'confirmed') {
      return {
        audience: this.userInputs.audience,
        topic: this.userInputs.topic,
        projectIdea: this.userInputs.projectIdea,
        conversationHistory: this.conversationHistory
      };
    }
    return null;
  }

  reset() {
    this.userInputs = {
      audience: null,
      topic: null,
      projectIdea: null,
      validationStatus: 'pending',
      currentStep: 'welcome'
    };
    this.conversationHistory = [];
  }
}