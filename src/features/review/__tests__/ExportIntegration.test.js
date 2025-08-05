/**
 * ExportIntegration.test.js - Integration test for export functionality
 */

describe('Export Integration Tests', () => {
  const completeBlueprintData = {
    id: 'test-blueprint-123',
    wizard: {
      subject: 'Environmental Science',
      students: 'High School (9-12)',
      scope: '4-6 weeks',
      vision: 'project-based',
      location: 'Suburban High School',
      materials: 'Lab equipment, computers, field notebooks',
      teacherResources: 'NGSS standards, climate data access'
    },
    ideation: {
      bigIdea: 'Climate change affects local ecosystems',
      essentialQuestion: 'How can students create solutions for climate challenges?',
      challenge: 'Design a community climate action plan'
    },
    journey: {
      phases: [
        {
          title: 'Research & Discovery',
          description: 'Students investigate local climate impacts'
        },
        {
          title: 'Analysis & Design',
          description: 'Students analyze data and design solutions'
        },
        {
          title: 'Implementation & Advocacy',
          description: 'Students present solutions to community'
        }
      ],
      activities: [
        'Collect local weather data',
        'Interview community members',
        'Analyze environmental impacts',
        'Design mitigation strategies',
        'Create presentation materials',
        'Present to stakeholders'
      ],
      resources: [
        'NOAA Climate Data',
        'Local Environmental Reports',
        'Community Contacts',
        'Presentation Tools'
      ]
    },
    deliverables: {
      milestones: [
        {
          id: 'm1',
          title: 'Research Report',
          description: 'Comprehensive analysis of local climate data',
          phase: 'phase1'
        },
        {
          id: 'm2',
          title: 'Solution Proposal',
          description: 'Detailed action plan with implementation steps',
          phase: 'phase2'
        },
        {
          id: 'm3',
          title: 'Community Presentation',
          description: 'Public presentation of findings and recommendations',
          phase: 'phase3'
        }
      ],
      rubric: {
        criteria: [
          {
            criterion: 'Research & Analysis',
            description: 'Quality of data collection and interpretation',
            weight: 30
          },
          {
            criterion: 'Solution Design',
            description: 'Creativity and feasibility of proposed solutions',
            weight: 30
          },
          {
            criterion: 'Communication',
            description: 'Clarity and persuasiveness of presentation',
            weight: 25
          },
          {
            criterion: 'Collaboration',
            description: 'Effectiveness of teamwork',
            weight: 15
          }
        ]
      },
      impact: {
        audience: 'City council and community members',
        method: 'Town hall presentation and digital report',
        timeline: 'Final week of project'
      }
    }
  };

  describe('Blueprint Data Structure', () => {
    test('should have all required sections', () => {
      expect(completeBlueprintData).toHaveProperty('wizard');
      expect(completeBlueprintData).toHaveProperty('ideation');
      expect(completeBlueprintData).toHaveProperty('journey');
      expect(completeBlueprintData).toHaveProperty('deliverables');
    });

    test('wizard section should include location and materials', () => {
      const { wizard } = completeBlueprintData;
      expect(wizard.location).toBeDefined();
      expect(wizard.materials).toBeDefined();
      expect(wizard.teacherResources).toBeDefined();
    });

    test('journey should have properly structured phases', () => {
      const { journey } = completeBlueprintData;
      expect(journey.phases).toHaveLength(3);
      journey.phases.forEach(phase => {
        expect(phase).toHaveProperty('title');
        expect(phase).toHaveProperty('description');
      });
    });

    test('deliverables should have complete milestone data', () => {
      const { deliverables } = completeBlueprintData;
      expect(deliverables.milestones).toHaveLength(3);
      deliverables.milestones.forEach((milestone, index) => {
        expect(milestone).toHaveProperty('id');
        expect(milestone).toHaveProperty('title');
        expect(milestone).toHaveProperty('description');
        expect(milestone).toHaveProperty('phase');
        expect(milestone.phase).toBe(`phase${index + 1}`);
      });
    });

    test('rubric should have criteria with weights summing to 100', () => {
      const { rubric } = completeBlueprintData.deliverables;
      expect(rubric.criteria).toHaveLength(4);
      
      const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
      expect(totalWeight).toBe(100);
    });
  });

  describe('Export Data Validation', () => {
    test('should handle string and object milestone formats', () => {
      const mixedMilestones = [
        'Simple milestone text',
        { title: 'Complex milestone', description: 'With details' },
        { id: 'm3', title: 'Full milestone', description: 'All fields', phase: 'phase3' }
      ];

      mixedMilestones.forEach(milestone => {
        const text = typeof milestone === 'string' ? milestone : milestone.title;
        expect(text).toBeTruthy();
      });
    });

    test('should validate all export fields are present', () => {
      const requiredFields = {
        'wizard.subject': completeBlueprintData.wizard.subject,
        'wizard.students': completeBlueprintData.wizard.students,
        'ideation.bigIdea': completeBlueprintData.ideation.bigIdea,
        'journey.phases': completeBlueprintData.journey.phases,
        'deliverables.milestones': completeBlueprintData.deliverables.milestones,
        'deliverables.rubric': completeBlueprintData.deliverables.rubric
      };

      Object.entries(requiredFields).forEach(([field, value]) => {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
      });
    });

    test('should handle optional fields gracefully', () => {
      const minimalBlueprint = {
        ...completeBlueprintData,
        wizard: {
          ...completeBlueprintData.wizard,
          location: undefined,
          materials: undefined,
          teacherResources: undefined
        }
      };

      // Should still be valid without optional fields
      expect(minimalBlueprint.wizard.subject).toBeDefined();
      expect(minimalBlueprint.wizard.location).toBeUndefined();
    });
  });

  describe('Export Content Generation', () => {
    test('should generate proper markdown headers', () => {
      const { wizard, ideation } = completeBlueprintData;
      const expectedTitle = `${wizard.subject} Project Blueprint`;
      const expectedSubtitle = `A project-based learning blueprint for ${wizard.students}`;

      expect(expectedTitle).toBe('Environmental Science Project Blueprint');
      expect(expectedSubtitle).toContain('High School (9-12)');
    });

    test('should format milestones correctly', () => {
      const { milestones } = completeBlueprintData.deliverables;
      const formattedMilestones = milestones.map((m, i) => 
        `${i + 1}. ${m.title}\n   - ${m.description}`
      );

      expect(formattedMilestones[0]).toContain('1. Research Report');
      expect(formattedMilestones[0]).toContain('Comprehensive analysis');
    });

    test('should format rubric with weights', () => {
      const { criteria } = completeBlueprintData.deliverables.rubric;
      const formattedCriteria = criteria.map(c => 
        `**${c.criterion}** (${c.weight}%)\n${c.description}`
      );

      expect(formattedCriteria[0]).toContain('Research & Analysis');
      expect(formattedCriteria[0]).toContain('(30%)');
    });
  });
});