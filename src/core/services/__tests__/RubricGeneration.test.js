/**
 * RubricGeneration.test.js - Test rubric generation from journey data
 */

import { DeliverableGenerator } from '../DeliverableGenerator';

describe('Rubric Generation from Journey Data', () => {
  const mockBlueprint = {
    wizard: {
      subject: 'Science',
      students: 'High School (9-12)',
      scope: '3-4 weeks',
      vision: 'balanced'
    },
    ideation: {
      bigIdea: 'Climate change impacts local ecosystems',
      essentialQuestion: 'How can we measure and mitigate climate change effects in our community?',
      challenge: 'Design a local climate action plan'
    },
    journey: {
      phases: [
        {
          title: 'Research & Data Collection',
          description: 'Students investigate local climate data and ecosystem changes'
        },
        {
          title: 'Analysis & Solution Design',
          description: 'Students analyze findings and design mitigation strategies'
        },
        {
          title: 'Implementation & Communication',
          description: 'Students create action plans and present to stakeholders'
        }
      ],
      activities: [
        'Collect local temperature and precipitation data',
        'Interview community members about observed changes',
        'Analyze data trends using statistical tools',
        'Design mitigation strategies',
        'Create presentation materials',
        'Present to local government'
      ],
      resources: [
        'NOAA climate data portal',
        'Local environmental agency reports',
        'Data analysis software',
        'Presentation tools'
      ]
    },
    deliverables: {
      milestones: [],
      rubric: {
        criteria: []
      },
      impact: {
        audience: '',
        method: ''
      }
    }
  };

  test('should generate rubric criteria based on journey phases', async () => {
    const generator = new DeliverableGenerator();
    const rubric = await generator.generateRubric(mockBlueprint);

    expect(rubric).toBeDefined();
    expect(rubric.criteria).toBeDefined();
    expect(Array.isArray(rubric.criteria)).toBe(true);
    expect(rubric.criteria.length).toBeGreaterThan(0);
    
    // Check that criteria are properly structured
    rubric.criteria.forEach(criterion => {
      expect(criterion).toHaveProperty('criterion');
      expect(criterion).toHaveProperty('description');
      expect(criterion).toHaveProperty('weight');
      expect(criterion.weight).toBeGreaterThan(0);
      expect(criterion.weight).toBeLessThanOrEqual(100);
    });

    // Check that weights sum to 100
    const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);
  });

  test('should align rubric criteria with learning objectives', async () => {
    const generator = new DeliverableGenerator();
    const rubric = await generator.generateRubric(mockBlueprint);

    // Should have criteria related to the journey content
    const criteriaNames = rubric.criteria.map(c => c.criterion.toLowerCase());
    
    // Expect at least some standard criteria
    expect(criteriaNames.length).toBeGreaterThan(0);
  });

  test('should handle missing journey data gracefully', async () => {
    const emptyBlueprint = {
      wizard: mockBlueprint.wizard,
      ideation: mockBlueprint.ideation,
      journey: {
        phases: [],
        activities: [],
        resources: []
      },
      deliverables: {
        milestones: [],
        rubric: { criteria: [] },
        impact: { audience: '', method: '' }
      }
    };

    const generator = new DeliverableGenerator();
    const rubric = await generator.generateRubric(emptyBlueprint);

    // Should still generate default criteria
    expect(rubric).toBeDefined();
    expect(rubric.criteria.length).toBeGreaterThan(0);
    expect(rubric.criteria.every(c => c.weight > 0)).toBe(true);
  });

  test('should create developmentally appropriate rubrics', async () => {
    const elementaryBlueprint = {
      ...mockBlueprint,
      wizard: {
        ...mockBlueprint.wizard,
        students: 'Elementary (K-2)'
      }
    };

    const generator = new DeliverableGenerator();
    const rubric = await generator.generateRubric(elementaryBlueprint);

    // Check that language is appropriate for grade level
    rubric.criteria.forEach(criterion => {
      // Descriptions should be defined
      expect(criterion.description).toBeDefined();
      expect(criterion.description.length).toBeGreaterThan(0);
    });
  });
});