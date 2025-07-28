import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createChatService, type ChatService } from '../../../src/services/chat-service';
import { createSOPValidator, type SOPValidator } from '../../../src/services/sop-validator';
import { createAIConversationManager } from '../../../src/services/ai-conversation-manager';

// Mock dependencies
vi.mock('../../../src/services/ai-conversation-manager');

describe('E2E Journey Validation - Complete Teacher Flow', () => {
  let chatService: ChatService;
  let sopValidator: SOPValidator;
  let mockAIManager: any;
  
  beforeEach(() => {
    // Setup realistic AI responses
    mockAIManager = {
      generateResponse: vi.fn().mockImplementation(async (request) => {
        // Return contextually appropriate responses
        const responses: Record<string, string> = {
          'welcome': 'Welcome! I\'m excited to help you create an engaging learning experience.',
          'stage_init': `Let's begin with the ${request.stage} stage. This is where we'll ${
            request.stage === 'IDEATION' ? 'establish your conceptual foundation' :
            request.stage === 'JOURNEY' ? 'design the learning progression' :
            'define success metrics'
          }.`,
          'step_entry': 'What ideas do you have for this important element of your project?',
          'confirm': `"${request.userInput}" is an excellent choice that will engage your students.`,
          'help': 'Let me provide some guidance tailored to your specific context.',
          'refine': 'Let\'s explore how we can enhance this concept further.',
        };
        
        return responses[request.action] || 'Let\'s continue building your project.';
      }),
      updateContext: vi.fn()
    };
    
    (createAIConversationManager as any).mockReturnValue(mockAIManager);
    
    process.env.VITE_USE_AI_CHAT = 'true';
    process.env.VITE_GEMINI_API_KEY = 'test-key';
    
    sopValidator = createSOPValidator();
  });

  describe('Complete Happy Path Journey', () => {
    it('should successfully complete all 9 steps with context preservation', async () => {
      // Initialize with elementary teacher profile
      const wizardData = {
        subject: 'Science',
        ageGroup: 'Ages 8-10',
        location: 'Portland, Oregon'
      };
      
      chatService = createChatService(wizardData, 'happy-path-test');
      
      // Track all responses for validation
      const journeyLog: Array<{step: string, input: string, response?: string}> = [];
      
      // Start journey
      await chatService.processAction('start');
      let state = chatService.getState();
      expect(state.phase).toBe('welcome');
      
      // Enter Ideation
      await chatService.processAction('start');
      state = chatService.getState();
      expect(state.phase).toBe('stage_init');
      expect(state.stage).toBe('IDEATION');
      
      // Start first step
      await chatService.processAction('start');
      
      // STEP 1: Big Idea
      const bigIdea = 'Water cycle and weather patterns';
      await chatService.processAction('text', bigIdea);
      journeyLog.push({step: 'Big Idea', input: bigIdea});
      
      state = chatService.getState();
      expect(state.phase).toBe('step_confirm');
      expect(state.pendingValue).toBe(bigIdea);
      
      // Confirm Big Idea
      await chatService.processAction('continue');
      
      // STEP 2: Essential Question
      const essentialQuestion = 'How does water shape our daily weather?';
      await chatService.processAction('text', essentialQuestion);
      journeyLog.push({step: 'Essential Question', input: essentialQuestion});
      
      await chatService.processAction('continue');
      
      // STEP 3: Challenge
      const challenge = 'Create a classroom weather station and predict tomorrow\'s weather';
      await chatService.processAction('text', challenge);
      journeyLog.push({step: 'Challenge', input: challenge});
      
      await chatService.processAction('continue');
      
      // Verify Ideation stage complete
      state = chatService.getState();
      expect(state.phase).toBe('stage_clarify');
      expect(state.capturedData['ideation.bigIdea']).toBe(bigIdea);
      expect(state.capturedData['ideation.essentialQuestion']).toBe(essentialQuestion);
      expect(state.capturedData['ideation.challenge']).toBe(challenge);
      
      // Proceed to Journey stage
      await chatService.processAction('proceed');
      state = chatService.getState();
      expect(state.stage).toBe('JOURNEY');
      
      // Continue through Journey stage
      await chatService.processAction('start');
      
      // STEP 4: Phases
      const phases = 'Week 1: Learn about weather, Week 2: Build instruments, Week 3: Collect data, Week 4: Make predictions';
      await chatService.processAction('text', phases);
      journeyLog.push({step: 'Phases', input: phases});
      await chatService.processAction('continue');
      
      // STEP 5: Activities  
      const activities = 'Cloud observation journals, Build rain gauges, Temperature tracking, Weather map creation';
      await chatService.processAction('text', activities);
      journeyLog.push({step: 'Activities', input: activities});
      await chatService.processAction('continue');
      
      // STEP 6: Resources
      const resources = 'Thermometers, Plastic bottles for rain gauges, Weather charts, Online weather data';
      await chatService.processAction('text', resources);
      journeyLog.push({step: 'Resources', input: resources});
      await chatService.processAction('continue');
      
      // Proceed to Deliverables
      await chatService.processAction('proceed');
      state = chatService.getState();
      expect(state.stage).toBe('DELIVERABLES');
      
      await chatService.processAction('start');
      
      // STEP 7: Milestones
      const milestones = 'Instruments built, First week of data, Prediction model created, Final presentation ready';
      await chatService.processAction('text', milestones);
      journeyLog.push({step: 'Milestones', input: milestones});
      await chatService.processAction('continue');
      
      // STEP 8: Rubric
      const rubric = 'Data accuracy, Prediction reasoning, Presentation clarity, Teamwork';
      await chatService.processAction('text', rubric);
      journeyLog.push({step: 'Rubric', input: rubric});
      await chatService.processAction('continue');
      
      // STEP 9: Impact Plan
      const impact = 'Present weather forecasts to kindergarten classes and post daily predictions for school';
      await chatService.processAction('text', impact);
      journeyLog.push({step: 'Impact Plan', input: impact});
      await chatService.processAction('continue');
      
      // Verify journey complete
      state = chatService.getState();
      expect(state.phase).toBe('complete');
      expect(state.completedSteps).toBe(9);
      
      // Verify all data captured correctly
      const capturedData = state.capturedData;
      expect(Object.keys(capturedData).length).toBe(9);
      
      // Verify context preservation - final state should reference initial Big Idea
      const finalMessages = state.messages;
      const hasContextualReference = finalMessages.some(msg => 
        msg.content.includes('water') || 
        msg.content.includes('weather') ||
        msg.content.includes('Water cycle')
      );
      expect(hasContextualReference).toBe(true);
      
      // Log journey for analysis
      console.log('Journey completed successfully:', journeyLog);
    });
  });

  describe('Journey with Multiple Refinements', () => {
    it('should handle teacher refining at each step while maintaining coherence', async () => {
      const wizardData = {
        subject: 'Art',
        ageGroup: 'Ages 11-13',
        location: 'New York City'
      };
      
      chatService = createChatService(wizardData, 'refinement-test');
      
      // Navigate to first step
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Big Idea with refinements
      await chatService.processAction('text', 'Art and culture');
      await chatService.processAction('refine');
      await chatService.processAction('text', 'Art as cultural expression');
      await chatService.processAction('refine');
      await chatService.processAction('text', 'Art as a window into diverse cultures');
      
      // Verify refinement maintained context
      let state = chatService.getState();
      expect(state.messages.filter(m => m.role === 'user').length).toBeGreaterThanOrEqual(3);
      expect(state.pendingValue).toBe('Art as a window into diverse cultures');
      
      await chatService.processAction('continue');
      
      // Continue with occasional refinements through journey
      const steps = [
        { text: 'How does art reflect cultural identity?', refine: true },
        { text: 'Create a multicultural art exhibition', refine: false },
        { text: 'Research, Create, Curate, Present', refine: true },
        { text: 'Cultural interviews, Art creation, Gallery setup', refine: false },
        { text: 'Art supplies, Cultural resources, Exhibition space', refine: false },
        { text: 'Research done, Artworks complete, Exhibition ready', refine: true },
        { text: 'Cultural authenticity, Artistic expression, Presentation', refine: false },
        { text: 'Community cultural festival exhibition', refine: false }
      ];
      
      for (const step of steps) {
        await chatService.processAction('text', step.text);
        
        if (step.refine) {
          await chatService.processAction('refine');
          await chatService.processAction('text', `${step.text  } (refined)`);
        }
        
        await chatService.processAction('continue');
        
        // Check for stage transitions
        state = chatService.getState();
        if (state.phase === 'stage_clarify') {
          await chatService.processAction('proceed');
          const nextState = chatService.getState();
          if (nextState.phase === 'stage_init') {
            await chatService.processAction('start');
          }
        }
      }
      
      // Verify journey completed with refinements
      state = chatService.getState();
      expect(state.completedSteps).toBe(9);
      
      // Check that refinements were captured
      const refinedSteps = Object.entries(state.capturedData)
        .filter(([_key, value]) => (value as string).includes('refined'));
      expect(refinedSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Journey with Help and Ideas Usage', () => {
    it('should integrate AI suggestions naturally into the flow', async () => {
      const wizardData = {
        subject: 'Physical Education',
        ageGroup: 'Ages 6-8',
        location: 'Los Angeles'
      };
      
      chatService = createChatService(wizardData, 'help-ideas-test');
      
      // Navigate to first step
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Use Help first
      await chatService.processAction('help');
      let state = chatService.getState();
      expect(state.messages.some(m => m.content.includes('guidance'))).toBe(true);
      
      // Then use Ideas
      await chatService.processAction('ideas');
      state = chatService.getState();
      expect(state.messages.some(m => m.metadata?.showCards)).toBe(true);
      
      // Select an idea card
      await chatService.processAction('card_select', {
        id: 'idea-1',
        title: 'Movement as Expression',
        description: 'How our bodies communicate'
      });
      
      // Verify card selection was processed
      state = chatService.getState();
      expect(state.pendingValue).toBe('Movement as Expression');
      
      // Continue with journey using mix of manual input and suggestions
      await chatService.processAction('continue');
      
      // Essential Question - use What-If
      await chatService.processAction('whatif');
      state = chatService.getState();
      expect(state.messages.some(m => m.metadata?.cardType === 'whatif')).toBe(true);
      
      // Continue through remaining steps
      const remainingSteps = [
        'How can we tell stories through movement?',
        'Create a movement story performance',
        'Learn, Create, Practice, Perform',
        'Story creation, Movement design, Rehearsals',
        'Music, Props, Performance space',
        'Story created, Movements learned, Performance ready',
        'Creativity, Expression, Teamwork, Performance',
        'Perform for families at school assembly'
      ];
      
      for (const step of remainingSteps) {
        await chatService.processAction('text', step);
        await chatService.processAction('continue');
        
        // Handle stage transitions
        state = chatService.getState();
        if (state.phase === 'stage_clarify') {
          await chatService.processAction('proceed');
          const nextState = chatService.getState();
          if (nextState.phase === 'stage_init') {
            await chatService.processAction('start');
          }
        }
      }
      
      // Verify completion with AI assistance
      state = chatService.getState();
      expect(state.completedSteps).toBe(9);
      expect(state.capturedData['ideation.bigIdea']).toBe('Movement as Expression');
    });
  });

  describe('Error Recovery During Journey', () => {
    it('should recover gracefully from API failures mid-journey', async () => {
      const wizardData = {
        subject: 'Mathematics',
        ageGroup: 'Ages 9-11', 
        location: 'Chicago'
      };
      
      chatService = createChatService(wizardData, 'error-recovery-test');
      
      // Start journey normally
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Complete first few steps
      await chatService.processAction('text', 'Patterns in mathematics');
      await chatService.processAction('continue');
      await chatService.processAction('text', 'Where do we see patterns in our world?');
      await chatService.processAction('continue');
      
      // Simulate API failure
      mockAIManager.generateResponse.mockRejectedValueOnce(new Error('API Error'));
      
      // Should fallback gracefully
      await chatService.processAction('text', 'Design a pattern museum for the school');
      
      let state = chatService.getState();
      // Should still capture the input despite API failure
      expect(state.pendingValue).toBe('Design a pattern museum for the school');
      
      // Recovery - API working again
      mockAIManager.generateResponse.mockResolvedValue('Great idea! A pattern museum will help students see math everywhere.');
      
      await chatService.processAction('continue');
      
      // Verify journey can continue normally
      state = chatService.getState();
      expect(state.capturedData['ideation.challenge']).toBe('Design a pattern museum for the school');
      
      // Complete rest of journey to ensure full recovery
      const remainingSteps = [
        'Explore, Collect, Create, Exhibit',
        'Pattern hunts, Pattern creation, Museum design',
        'Cameras, Art supplies, Display boards',
        'Patterns found, Exhibits created, Museum ready',
        'Pattern complexity, Creativity, Explanation clarity',
        'Open pattern museum for whole school'
      ];
      
      // Navigate through stage transitions and remaining steps
      if (state.phase === 'stage_clarify') {
        await chatService.processAction('proceed');
        await chatService.processAction('start');
      }
      
      for (const step of remainingSteps) {
        await chatService.processAction('text', step);
        await chatService.processAction('continue');
        
        state = chatService.getState();
        if (state.phase === 'stage_clarify') {
          await chatService.processAction('proceed');
          const nextState = chatService.getState();
          if (nextState.phase === 'stage_init') {
            await chatService.processAction('start');
          }
        }
      }
      
      // Verify successful completion despite mid-journey error
      state = chatService.getState();
      expect(state.completedSteps).toBe(9);
      expect(state.phase).toBe('complete');
    });
  });

  describe('SOP Compliance Validation', () => {
    it('should validate all responses meet SOP requirements', async () => {
      const wizardData = {
        subject: 'History',
        ageGroup: 'Ages 12-14',
        location: 'Boston'
      };
      
      chatService = createChatService(wizardData, 'sop-validation-test');
      
      // Track all AI responses for validation
      const aiResponses: Array<{stage: string, step: string, response: string}> = [];
      
      // Mock to capture responses
      mockAIManager.generateResponse.mockImplementation(async (request) => {
        const response = `Contextual response for ${request.action} in ${request.stage}`;
        aiResponses.push({
          stage: request.stage || 'unknown',
          step: request.step || 'unknown', 
          response
        });
        return response;
      });
      
      // Complete abbreviated journey
      await chatService.processAction('start');
      await chatService.processAction('start');
      await chatService.processAction('start');
      
      // Quick journey through all steps
      const quickSteps = [
        'Local history and community identity',
        'How has our neighborhood shaped who we are?',
        'Create a neighborhood history walking tour',
        'Research, Interview, Design, Guide',
        'Archive visits, Resident interviews, Map creation',
        'Old photos, Maps, Recording equipment',
        'Research done, Route planned, Script written',
        'Historical accuracy, Storytelling, Tour quality',
        'Lead tours for community and younger students'
      ];
      
      for (let i = 0; i < quickSteps.length; i++) {
        await chatService.processAction('text', quickSteps[i]);
        await chatService.processAction('continue');
        
        // Handle stage transitions
        const state = chatService.getState();
        if (state.phase === 'stage_clarify') {
          await chatService.processAction('proceed');
          const nextState = chatService.getState();
          if (nextState.phase === 'stage_init' && i < quickSteps.length - 1) {
            await chatService.processAction('start');
          }
        }
      }
      
      // Validate each response met SOP requirements
      const validationResults = aiResponses.map(({stage, step, response}) => {
        const validation = sopValidator.validateResponse(response, stage, step);
        return {
          stage,
          step,
          isValid: validation.isValid,
          score: validation.score
        };
      });
      
      // All responses should be valid
      const invalidResponses = validationResults.filter(r => !r.isValid);
      expect(invalidResponses.length).toBe(0);
      
      // Average score should be high
      const avgScore = validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length;
      expect(avgScore).toBeGreaterThan(70);
    });
  });
});