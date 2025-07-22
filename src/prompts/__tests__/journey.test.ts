import { generatePrompt, generateQuickResponse, QuickReply } from '../journey';
import { WizardData } from '../../features/wizard/wizardSchema';
import { JourneyData } from '../../lib/fsm';

describe('Journey Prompts', () => {
  const mockWizardData: WizardData = {
    motivation: 'Create engaging robotics projects',
    subject: 'Robotics & Engineering',
    ageGroup: '14-18',
    location: 'School lab',
    scope: 'semester',
    materials: 'Arduino kits, 3D printer'
  };

  const mockJourneyData: JourneyData = {
    phases: [
      { id: '1', name: 'Research', description: 'Understanding the problem' },
      { id: '2', name: 'Design', description: 'Creating solutions' }
    ],
    activities: [
      { id: '1', phaseId: '1', name: 'Interviews', description: 'Talk to users' },
      { id: '2', phaseId: '2', name: 'Prototyping', description: 'Build models' }
    ],
    resources: [
      { id: '1', type: 'tool', name: 'Arduino IDE', description: 'Programming environment' }
    ],
    deliverables: {
      milestones: [
        { id: '1', name: 'Research Complete', description: 'All data collected' }
      ],
      rubric: {
        criteria: [
          { id: '1', name: 'Innovation', description: 'Creative solutions', weight: 40 }
        ],
        levels: ['Emerging', 'Developing', 'Proficient', 'Advanced']
      },
      impact: {
        audience: 'Local senior center',
        method: 'Present and train staff'
      }
    },
    reflections: ['Great progress so far']
  };

  describe('generatePrompt', () => {
    it('should generate prompt for JOURNEY_OVERVIEW', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_OVERVIEW'
      });

      expect(result.content).toContain('Welcome');
      expect(result.content).toContain('Robotics & Engineering');
      expect(result.content).toContain('semester');
      expect(result.metadata.stage).toBe('JOURNEY_OVERVIEW');
      expect(result.metadata.quickReplies).toHaveLength(3);
    });

    it('should generate prompt for JOURNEY_PHASES', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_PHASES'
      });

      expect(result.content).toContain('phases');
      expect(result.metadata.quickReplies).toHaveLength(3);
      expect(result.metadata.quickReplies?.[0].action).toBe('ideas');
    });

    it('should generate prompt for JOURNEY_ACTIVITIES', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_ACTIVITIES'
      });

      expect(result.content).toContain('activities');
      expect(result.content).toContain('Research');
      expect(result.content).toContain('Design');
      expect(result.metadata.quickReplies).toHaveLength(4); // includes skip
    });

    it('should generate prompt for JOURNEY_RESOURCES', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_RESOURCES'
      });

      expect(result.content).toContain('resources');
      expect(result.metadata.quickReplies).toHaveLength(4); // includes skip
      expect(result.metadata.quickReplies?.some(r => r.action === 'skip')).toBe(true);
    });

    it('should generate prompt for JOURNEY_REVIEW', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_REVIEW'
      });

      expect(result.content).toContain('journey');
      expect(result.content).toContain('Research');
      expect(result.content).toContain('Interviews');
      expect(result.metadata.quickReplies).toHaveLength(1);
      expect(result.metadata.quickReplies?.[0].action).toBe('continue');
    });

    it('should generate prompt for DELIVER_MILESTONES', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'DELIVER_MILESTONES'
      });

      expect(result.content).toContain('milestone');
      expect(result.metadata.quickReplies).toHaveLength(4); // includes skip
    });

    it('should generate prompt for DELIVER_RUBRIC', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'DELIVER_RUBRIC'
      });

      expect(result.content).toContain('assessment');
      expect(result.content).toContain('rubric');
      expect(result.metadata.quickReplies).toHaveLength(4); // includes skip
    });

    it('should generate prompt for DELIVER_IMPACT', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'DELIVER_IMPACT'
      });

      expect(result.content).toContain('authentic');
      expect(result.content).toContain('impact');
      expect(result.metadata.quickReplies).toHaveLength(4); // includes skip
    });

    it('should generate prompt for PUBLISH_REVIEW', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'PUBLISH_REVIEW'
      });

      expect(result.content).toContain('blueprint');
      expect(result.content).toContain('complete');
      expect(result.metadata.quickReplies).toHaveLength(1);
      expect(result.metadata.quickReplies?.[0].action).toBe('continue');
      expect(result.metadata.quickReplies?.[0].variant).toBe('primary');
    });

    it('should generate prompt for COMPLETE', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'COMPLETE'
      });

      expect(result.content).toContain('Congratulations');
      expect(result.metadata.quickReplies).toHaveLength(0);
    });

    it('should handle unknown stage gracefully', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'UNKNOWN_STAGE' as any
      });

      expect(result.content).toContain('continue');
      expect(result.metadata.quickReplies).toHaveLength(0);
    });

    it('should handle missing journey data', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: {
          phases: [],
          activities: [],
          resources: [],
          reflections: []
        },
        currentStage: 'JOURNEY_ACTIVITIES'
      });

      expect(result.content).toBeTruthy();
      expect(result.metadata.quickReplies).toHaveLength(4);
    });
  });

  describe('generateQuickResponse', () => {
    it('should generate response for continue action', () => {
      const result = generateQuickResponse('continue', 'JOURNEY_PHASES');
      expect(result).toContain("Let's");
      expect(result.length).toBeGreaterThan(10);
    });

    it('should generate response for ideas action', () => {
      const result = generateQuickResponse('ideas', 'JOURNEY_PHASES');
      expect(result).toContain('three');
      expect(result.toLowerCase()).toContain('phase');
    });

    it('should generate response for whatif action', () => {
      const result = generateQuickResponse('whatif', 'JOURNEY_ACTIVITIES');
      expect(result).toContain('What if');
      expect(result.toLowerCase()).toContain('activities');
    });

    it('should generate response for examples action', () => {
      const result = generateQuickResponse('examples', 'JOURNEY_RESOURCES');
      expect(result).toContain('resources');
      expect(result.length).toBeGreaterThan(20);
    });

    it('should generate response for skip action', () => {
      const result = generateQuickResponse('skip', 'JOURNEY_RESOURCES');
      expect(result.toLowerCase()).toContain('skip');
    });

    it('should handle unknown stage with default response', () => {
      const result = generateQuickResponse('continue', 'UNKNOWN_STAGE' as any);
      expect(result).toContain("Let's continue");
    });

    it('should handle stage-specific responses', () => {
      const phasesIdeas = generateQuickResponse('ideas', 'JOURNEY_PHASES');
      const activitiesIdeas = generateQuickResponse('ideas', 'JOURNEY_ACTIVITIES');
      
      expect(phasesIdeas).not.toBe(activitiesIdeas);
      expect(phasesIdeas).toContain('phase');
      expect(activitiesIdeas).toContain('activities');
    });
  });

  describe('QuickReply Types', () => {
    it('should have correct QuickReply structure', () => {
      const quickReply: QuickReply = {
        label: 'Continue',
        action: 'continue',
        variant: 'primary'
      };

      expect(quickReply.label).toBeDefined();
      expect(quickReply.action).toBeDefined();
      expect(quickReply.variant).toBeDefined();
    });

    it('should allow optional variant', () => {
      const quickReply: QuickReply = {
        label: 'Skip',
        action: 'skip'
      };

      expect(quickReply.variant).toBeUndefined();
    });
  });

  describe('Template functions', () => {
    it('should generate consistent prompts for same input', () => {
      const input = {
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_PHASES' as const
      };

      const result1 = generatePrompt(input);
      const result2 = generatePrompt(input);

      expect(result1.content).toBe(result2.content);
      expect(result1.metadata.stage).toBe(result2.metadata.stage);
      expect(result1.metadata.quickReplies?.length).toBe(result2.metadata.quickReplies?.length);
    });

    it('should include context from wizard data in prompts', () => {
      const roboticsPrompt = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_OVERVIEW'
      });

      const artPrompt = generatePrompt({
        wizardData: { ...mockWizardData, subject: 'Visual Arts' },
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_OVERVIEW'
      });

      expect(roboticsPrompt.content).toContain('Robotics');
      expect(artPrompt.content).toContain('Visual Arts');
      expect(roboticsPrompt.content).not.toBe(artPrompt.content);
    });

    it('should handle all age groups appropriately', () => {
      const ageGroups = ['5-7', '8-10', '11-13', '14-18'];
      
      ageGroups.forEach(ageGroup => {
        const result = generatePrompt({
          wizardData: { ...mockWizardData, ageGroup },
          journeyData: mockJourneyData,
          currentStage: 'JOURNEY_OVERVIEW'
        });

        expect(result.content).toContain(ageGroup);
        expect(result.content).toBeTruthy();
      });
    });

    it('should handle all scope options', () => {
      const scopes = ['unit', 'semester', 'year'];
      
      scopes.forEach(scope => {
        const result = generatePrompt({
          wizardData: { ...mockWizardData, scope },
          journeyData: mockJourneyData,
          currentStage: 'JOURNEY_OVERVIEW'
        });

        expect(result.content).toContain(scope);
        expect(result.content).toBeTruthy();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty wizard data fields gracefully', () => {
      const emptyWizard: WizardData = {
        motivation: '',
        subject: '',
        ageGroup: '',
        location: '',
        scope: '',
        materials: ''
      };

      const result = generatePrompt({
        wizardData: emptyWizard,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_OVERVIEW'
      });

      expect(result.content).toBeTruthy();
      expect(result.metadata.quickReplies).toBeDefined();
    });

    it('should handle very long input data', () => {
      const longMotivation = 'A'.repeat(1000);
      const longWizard = { ...mockWizardData, motivation: longMotivation };

      const result = generatePrompt({
        wizardData: longWizard,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_OVERVIEW'
      });

      expect(result.content).toBeTruthy();
      expect(result.content.length).toBeGreaterThan(100);
    });
  });
});