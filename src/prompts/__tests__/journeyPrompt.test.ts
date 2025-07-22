import { templates, generatePrompt, generateQuickResponse } from '../journey';
import { WizardData } from '../../features/wizard/wizardSchema';
import { JourneyData } from '../../lib/fsm';

describe('Journey Prompt Templates', () => {
  const mockWizardData: WizardData = {
    motivation: 'I want to help students see real-world applications of science',
    subject: 'Environmental Science',
    ageGroup: '14-16 years',
    location: 'San Francisco, CA',
    materials: 'Lab equipment, Computers, 3D printer',
    scope: 'unit'
  };

  const mockJourneyData: JourneyData = {
    phases: [
      { id: '1', name: 'Discover & Wonder', description: 'Spark curiosity' },
      { id: '2', name: 'Investigate & Create', description: 'Deep dive' }
    ],
    activities: [],
    resources: []
  };

  describe('JOURNEY_PHASES template', () => {
    it('should generate personalized phase suggestions', () => {
      const prompt = templates.JOURNEY_PHASES({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_PHASES'
      });

      expect(prompt).toContain('Environmental Science');
      expect(prompt).toContain('14-16 years');
      expect(prompt).toContain('Classic Inquiry Arc');
      expect(prompt).toContain('Design Thinking Journey');
      expect(prompt).toContain('Story-Based Adventure');
    });
  });

  describe('JOURNEY_ACTIVITIES template', () => {
    it('should reference current phase and age group', () => {
      const prompt = templates.JOURNEY_ACTIVITIES({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_ACTIVITIES'
      });

      expect(prompt).toContain('Discover & Wonder, Investigate & Create');
      expect(prompt).toContain('14-16 years');
      expect(prompt).toContain('Investigation Station');
      expect(prompt).toContain('Creative Challenge');
    });
  });

  describe('JOURNEY_RESOURCES template', () => {
    it('should include available materials', () => {
      const prompt = templates.JOURNEY_RESOURCES({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_RESOURCES'
      });

      expect(prompt).toContain('Lab equipment, Computers, 3D printer');
      expect(prompt).toContain('Community Connections');
      expect(prompt).toContain('Creative Materials');
    });
  });

  describe('generatePrompt', () => {
    it('should return formatted prompt with metadata', () => {
      const result = generatePrompt({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_PHASES'
      });

      expect(result.content).toBeTruthy();
      expect(result.metadata.quickReplies).toHaveLength(4);
      expect(result.metadata.quickReplies[0].label).toBe('Get Ideas');
      expect(result.metadata.allowsFreeResponse).toBe(true);
    });
  });

  describe('Quick Action Templates', () => {
    it('should generate IDEAS responses', () => {
      const ideas = templates.IDEAS({
        currentStage: 'JOURNEY_PHASES',
        wizardData: mockWizardData,
        journeyData: mockJourneyData
      });

      expect(ideas).toContain('Community-Connected Arc');
      expect(ideas).toContain('Skills Progression Model');
      expect(ideas).toContain('Environmental Science');
    });

    it('should generate WHATIF responses', () => {
      const whatIf = templates.WHATIF({
        currentStage: 'JOURNEY_ACTIVITIES',
        wizardData: mockWizardData,
        journeyData: mockJourneyData
      });

      expect(whatIf).toContain('What if students taught the class?');
      expect(whatIf).toContain('What if everything was a game?');
    });

    it('should generate EXAMPLES responses', () => {
      const examples = templates.EXAMPLES({
        currentStage: 'JOURNEY_RESOURCES',
        wizardData: mockWizardData,
        journeyData: mockJourneyData
      });

      expect(examples).toContain('Mystery Skype');
      expect(examples).toContain('Citizen Science Projects');
      expect(examples).toContain('Local Expert Network');
    });
  });

  describe('generateQuickResponse', () => {
    const context = {
      wizardData: mockWizardData,
      journeyData: mockJourneyData,
      currentStage: 'JOURNEY_PHASES'
    };

    it('should handle ideas action', () => {
      const response = generateQuickResponse('ideas', context);
      expect(response).toContain('phase design ideas');
    });

    it('should handle whatif action', () => {
      const response = generateQuickResponse('whatif', context);
      expect(response).toContain('What if');
    });

    it('should handle examples action', () => {
      const response = generateQuickResponse('examples', context);
      expect(response).toContain('Real examples');
    });

    it('should handle skip action', () => {
      const response = generateQuickResponse('skip', context);
      expect(response).toContain("Let's move on");
    });

    it('should handle continue action', () => {
      const response = generateQuickResponse('continue', context);
      expect(response).toContain("Let's continue");
    });
  });

  describe('Template Snapshots', () => {
    it('should match JOURNEY_OVERVIEW snapshot', () => {
      const prompt = templates.JOURNEY_OVERVIEW({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_OVERVIEW'
      });

      expect(prompt).toMatchSnapshot();
    });

    it('should match JOURNEY_PHASES snapshot', () => {
      const prompt = templates.JOURNEY_PHASES({
        wizardData: mockWizardData,
        journeyData: mockJourneyData,
        currentStage: 'JOURNEY_PHASES'
      });

      expect(prompt).toMatchSnapshot();
    });

    it('should match JOURNEY_REVIEW snapshot', () => {
      const reviewData: JourneyData = {
        ...mockJourneyData,
        activities: [
          { id: '1', phaseId: '1', name: 'Nature Walk', description: 'Explore local ecosystem' },
          { id: '2', phaseId: '2', name: 'Lab Analysis', description: 'Test water samples' }
        ],
        resources: [
          { id: '1', type: 'tool', name: 'iNaturalist', description: 'Species identification app' }
        ]
      };

      const prompt = templates.JOURNEY_REVIEW({
        wizardData: mockWizardData,
        journeyData: reviewData,
        currentStage: 'JOURNEY_REVIEW'
      });

      expect(prompt).toMatchSnapshot();
    });
  });
});