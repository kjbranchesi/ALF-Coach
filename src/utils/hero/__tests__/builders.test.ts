/**
 * Builder Function Tests
 *
 * These tests ensure builder functions create correctly structured data
 * and handle edge cases appropriately.
 */

import {
  createRisk,
  createContingency,
  createConstraints,
  createPhase,
  createActivity,
  createMilestone,
  createRubricCriteria,
  createResource,
  createStandardAlignment,
  createFeasibilityData,
  createHeroProjectTemplate,
  migrateRisk,
  migrateContingency,
  migrateRisks,
  migrateContingencies,
} from '../builders';

describe('createRisk', () => {
  test('creates properly structured risk', () => {
    const risk = createRisk({
      id: 'r1',
      name: 'Technology gaps',
      likelihood: 'medium', // Should normalize
      impact: 'high',
      mitigation: 'Provide alternatives',
    });

    expect(risk).toEqual({
      id: 'r1',
      name: 'Technology gaps',
      likelihood: 'med',
      impact: 'high',
      mitigation: 'Provide alternatives',
    });
  });

  test('normalizes all risk level variations', () => {
    const risk = createRisk({
      id: 'r1',
      name: 'Test',
      likelihood: 'MEDIUM',
      impact: 'moderate',
      mitigation: 'Test',
    });

    expect(risk.likelihood).toBe('med');
    expect(risk.impact).toBe('med');
  });
});

describe('createContingency', () => {
  test('creates properly structured contingency', () => {
    const contingency = createContingency({
      id: 'c1',
      scenario: 'Behind schedule',
      plan: 'Focus on core objectives',
    });

    expect(contingency).toEqual({
      id: 'c1',
      scenario: 'Behind schedule',
      plan: 'Focus on core objectives',
    });
  });

  test('always uses scenario property', () => {
    const contingency = createContingency({
      id: 'c1',
      scenario: 'Test scenario',
      plan: 'Test plan',
    });

    expect(contingency).toHaveProperty('scenario');
    expect(contingency).not.toHaveProperty('trigger');
  });
});

describe('createConstraints', () => {
  test('creates complete constraints', () => {
    const constraints = createConstraints({
      budgetUSD: 500,
      techAccess: 'partial',
      materials: ['Computers', 'Software'],
      safetyRequirements: ['Adult supervision'],
    });

    expect(constraints).toEqual({
      budgetUSD: 500,
      techAccess: 'limited',
      materials: ['Computers', 'Software'],
      safetyRequirements: ['Adult supervision'],
    });
  });

  test('creates partial constraints', () => {
    const constraints = createConstraints({
      budgetUSD: 300,
    });

    expect(constraints).toEqual({
      budgetUSD: 300,
    });
    expect(constraints).not.toHaveProperty('techAccess');
    expect(constraints).not.toHaveProperty('materials');
  });

  test('normalizes tech access', () => {
    const constraints1 = createConstraints({ techAccess: 'partial' });
    expect(constraints1.techAccess).toBe('limited');

    const constraints2 = createConstraints({ techAccess: 'no' });
    expect(constraints2.techAccess).toBe('none');
  });
});

describe('createPhase', () => {
  test('creates complete phase', () => {
    const phase = createPhase({
      id: 'discover',
      name: 'Discover',
      duration: '2 weeks',
      focus: 'Research',
      description: 'Research phase',
      objectives: ['Understand problem', 'Identify stakeholders'],
      teacherNotes: 'Guide students',
      studentTips: 'Take notes',
    });

    expect(phase).toMatchObject({
      id: 'discover',
      name: 'Discover',
      duration: '2 weeks',
      focus: 'Research',
      description: 'Research phase',
      objectives: ['Understand problem', 'Identify stakeholders'],
      teacherNotes: 'Guide students',
      studentTips: 'Take notes',
    });
  });

  test('provides defaults for optional fields', () => {
    const phase = createPhase({
      id: 'test',
      name: 'Test Phase',
      duration: '1 week',
      description: 'Test description',
    });

    expect(phase.focus).toBe('');
    expect(phase.objectives).toEqual([]);
    expect(phase.activities).toEqual([]);
    expect(phase.deliverables).toEqual([]);
    expect(phase.checkpoints).toEqual([]);
    expect(phase.resources).toEqual([]);
    expect(phase.teacherNotes).toBe('');
    expect(phase.studentTips).toBe('');
  });
});

describe('createActivity', () => {
  test('creates complete activity', () => {
    const activity = createActivity({
      name: 'Research',
      type: 'individual',
      duration: '2 hours',
      description: 'Conduct research',
      materials: ['Computer', 'Notebook'],
      instructions: ['Step 1', 'Step 2'],
      differentiation: {
        support: ['Extra guidance'],
        extension: ['Advanced topics'],
      },
      assessment: 'Rubric-based',
    });

    expect(activity).toMatchObject({
      name: 'Research',
      type: 'individual',
      duration: '2 hours',
      description: 'Conduct research',
      materials: ['Computer', 'Notebook'],
      instructions: ['Step 1', 'Step 2'],
      differentiation: {
        support: ['Extra guidance'],
        extension: ['Advanced topics'],
      },
      assessment: 'Rubric-based',
    });
  });

  test('provides defaults', () => {
    const activity = createActivity({
      name: 'Test',
      duration: '1 hour',
      description: 'Test activity',
    });

    expect(activity.type).toBe('class');
    expect(activity.materials).toEqual([]);
    expect(activity.instructions).toEqual([]);
    expect(activity.differentiation).toEqual({
      support: [],
      extension: [],
    });
    expect(activity.assessment).toBe('');
  });
});

describe('createMilestone', () => {
  test('creates complete milestone', () => {
    const milestone = createMilestone({
      id: 'm1',
      phase: 'discover',
      week: 2,
      title: 'Research Complete',
      description: 'Complete initial research',
      evidence: ['Research notes', 'Bibliography'],
      celebration: 'Share findings',
    });

    expect(milestone).toEqual({
      id: 'm1',
      phase: 'discover',
      week: 2,
      title: 'Research Complete',
      description: 'Complete initial research',
      evidence: ['Research notes', 'Bibliography'],
      celebration: 'Share findings',
    });
  });

  test('provides defaults', () => {
    const milestone = createMilestone({
      id: 'm1',
      phase: 'test',
      week: 1,
      title: 'Test Milestone',
      description: 'Test description',
    });

    expect(milestone.evidence).toEqual([]);
    expect(milestone.celebration).toBe('');
  });
});

describe('createRubricCriteria', () => {
  test('creates complete rubric criteria', () => {
    const rubric = createRubricCriteria({
      category: 'Research Quality',
      weight: 25,
      exemplary: {
        points: 4,
        description: 'Exceptional research',
        evidence: ['Multiple sources', 'Critical analysis'],
      },
      proficient: {
        points: 3,
        description: 'Good research',
        evidence: ['Adequate sources'],
      },
      developing: {
        points: 2,
        description: 'Basic research',
        evidence: ['Some sources'],
      },
      beginning: {
        points: 1,
        description: 'Limited research',
        evidence: ['Few sources'],
      },
    });

    expect(rubric.category).toBe('Research Quality');
    expect(rubric.weight).toBe(25);
    expect(rubric.exemplary.points).toBe(4);
    expect(rubric.exemplary.evidence).toEqual(['Multiple sources', 'Critical analysis']);
  });

  test('handles shorthand rubric levels', () => {
    const rubric = createRubricCriteria({
      category: 'Test',
      weight: 20,
      exemplary: { description: 'Excellent' },
      proficient: { description: 'Good' },
      developing: { description: 'Fair' },
      beginning: { description: 'Poor' },
    });

    expect(rubric.exemplary.points).toBe(4);
    expect(rubric.proficient.points).toBe(3);
    expect(rubric.developing.points).toBe(2);
    expect(rubric.beginning.points).toBe(1);

    expect(rubric.exemplary.evidence).toEqual([]);
  });

  test('preserves custom points', () => {
    const rubric = createRubricCriteria({
      category: 'Test',
      weight: 20,
      exemplary: { description: 'Excellent', points: 10 },
      proficient: { description: 'Good', points: 7 },
      developing: { description: 'Fair', points: 5 },
      beginning: { description: 'Poor', points: 2 },
    });

    expect(rubric.exemplary.points).toBe(10);
    expect(rubric.proficient.points).toBe(7);
    expect(rubric.developing.points).toBe(5);
    expect(rubric.beginning.points).toBe(2);
  });
});

describe('createResource', () => {
  test('creates complete resource', () => {
    const resource = createResource({
      name: 'Computers',
      type: 'technology',
      quantity: '30 units',
      source: 'School IT department',
      cost: '$0 (available)',
      alternatives: ['Tablets', 'BYOD'],
    });

    expect(resource).toEqual({
      name: 'Computers',
      type: 'technology',
      quantity: '30 units',
      source: 'School IT department',
      cost: '$0 (available)',
      alternatives: ['Tablets', 'BYOD'],
    });
  });

  test('allows partial resources', () => {
    const resource = createResource({
      name: 'Test Resource',
      type: 'material',
    });

    expect(resource).toEqual({
      name: 'Test Resource',
      type: 'material',
    });
    expect(resource).not.toHaveProperty('quantity');
  });
});

describe('createStandardAlignment', () => {
  test('creates complete standard alignment', () => {
    const standard = createStandardAlignment({
      code: 'NGSS-HS-ESS3-4',
      text: 'Evaluate solutions to reduce human impact',
      application: 'Students analyze sustainability solutions',
      depth: 'master',
    });

    expect(standard).toEqual({
      code: 'NGSS-HS-ESS3-4',
      text: 'Evaluate solutions to reduce human impact',
      application: 'Students analyze sustainability solutions',
      depth: 'master',
    });
  });

  test('provides defaults', () => {
    const standard = createStandardAlignment({
      code: 'TEST-1',
      text: 'Test standard',
    });

    expect(standard.application).toBe('');
    expect(standard.depth).toBe('develop');
  });
});

describe('createFeasibilityData', () => {
  test('creates complete feasibility data set', () => {
    const data = createFeasibilityData({
      constraints: {
        budgetUSD: 500,
        techAccess: 'partial',
        materials: ['Computers'],
        safetyRequirements: ['Supervision'],
      },
      risks: [
        {
          id: 'r1',
          name: 'Tech failure',
          likelihood: 'medium',
          impact: 'high',
          mitigation: 'Have backups',
        },
      ],
      contingencies: [
        {
          id: 'c1',
          scenario: 'Behind schedule',
          plan: 'Compress timeline',
        },
      ],
    });

    expect(data.constraints).toMatchObject({
      budgetUSD: 500,
      techAccess: 'limited',
    });
    expect(data.risks).toHaveLength(1);
    expect(data.risks[0].likelihood).toBe('med');
    expect(data.contingencies).toHaveLength(1);
    expect(data.contingencies[0].scenario).toBe('Behind schedule');
  });

  test('handles empty input', () => {
    const data = createFeasibilityData({});

    expect(data.constraints).toBeUndefined();
    expect(data.risks).toEqual([]);
    expect(data.contingencies).toEqual([]);
  });

  test('normalizes all nested data', () => {
    const data = createFeasibilityData({
      risks: [
        {
          id: 'r1',
          name: 'Test',
          likelihood: 'MEDIUM',
          impact: 'moderate',
          mitigation: 'Test',
        },
      ],
    });

    expect(data.risks[0].likelihood).toBe('med');
    expect(data.risks[0].impact).toBe('med');
  });
});

describe('createHeroProjectTemplate', () => {
  test('creates minimal valid structure', () => {
    const template = createHeroProjectTemplate({
      id: 'test-project',
      title: 'Test Project',
      duration: '6 weeks',
      gradeLevel: '9-12',
      subjects: ['Science', 'Math'],
    });

    expect(template.id).toBe('test-project');
    expect(template.title).toBe('Test Project');
    expect(template.duration).toBe('6 weeks');
    expect(template.gradeLevel).toBe('9-12');
    expect(template.subjects).toEqual(['Science', 'Math']);

    // Check structure is complete
    expect(template).toHaveProperty('theme');
    expect(template).toHaveProperty('hero');
    expect(template).toHaveProperty('context');
    expect(template).toHaveProperty('overview');
    expect(template).toHaveProperty('bigIdea');
    expect(template).toHaveProperty('standards');
    expect(template).toHaveProperty('journey');
    expect(template).toHaveProperty('assessment');
    expect(template).toHaveProperty('resources');
    expect(template).toHaveProperty('impact');
  });

  test('provides sensible defaults', () => {
    const template = createHeroProjectTemplate({
      id: 'test',
      title: 'Test',
      duration: '4 weeks',
      gradeLevel: '6-8',
      subjects: ['ELA'],
    });

    expect(template.theme?.primary).toBe('blue');
    expect(template.theme?.gradient).toContain('from-blue');
    expect(template.hero?.badge).toBe('Hero Project');
    expect(template.journey?.phases).toEqual([]);
    expect(template.assessment?.rubric).toEqual([]);
  });
});

describe('Migration helpers', () => {
  describe('migrateRisk', () => {
    test('migrates old risk format', () => {
      const oldRisk = {
        risk: 'Budget overrun', // Old property
        likelihood: 'medium', // Old value
        impact: 'moderate', // Old value
        mitigation: 'Seek funding',
      };

      const newRisk = migrateRisk(oldRisk);

      expect(newRisk).toEqual({
        id: expect.stringContaining('risk-'),
        name: 'Budget overrun',
        likelihood: 'med',
        impact: 'med',
        mitigation: 'Seek funding',
      });
    });

    test('preserves existing id', () => {
      const oldRisk = {
        id: 'r1',
        risk: 'Test',
        likelihood: 'low',
        impact: 'high',
        mitigation: 'Test',
      };

      const newRisk = migrateRisk(oldRisk);
      expect(newRisk.id).toBe('r1');
    });

    test('handles missing fields', () => {
      const oldRisk = {};
      const newRisk = migrateRisk(oldRisk);

      expect(newRisk.id).toContain('risk-');
      expect(newRisk.name).toBe('Unnamed Risk');
      expect(newRisk.likelihood).toBe('low');
      expect(newRisk.impact).toBe('low');
      expect(newRisk.mitigation).toBe('No mitigation specified');
    });
  });

  describe('migrateContingency', () => {
    test('migrates old contingency format', () => {
      const oldContingency = {
        trigger: 'Schedule delay', // Old property
        plan: 'Compress timeline',
      };

      const newContingency = migrateContingency(oldContingency);

      expect(newContingency).toEqual({
        id: expect.stringContaining('contingency-'),
        scenario: 'Schedule delay',
        plan: 'Compress timeline',
      });
    });

    test('preserves existing id', () => {
      const oldContingency = {
        id: 'c1',
        trigger: 'Test',
        plan: 'Test plan',
      };

      const newContingency = migrateContingency(oldContingency);
      expect(newContingency.id).toBe('c1');
    });

    test('handles missing fields', () => {
      const oldContingency = {};
      const newContingency = migrateContingency(oldContingency);

      expect(newContingency.id).toContain('contingency-');
      expect(newContingency.scenario).toBe('Unnamed Scenario');
      expect(newContingency.plan).toBe('No plan specified');
    });
  });

  describe('Batch migration', () => {
    test('migrateRisks handles arrays', () => {
      const oldRisks = [
        { risk: 'Risk 1', likelihood: 'medium', impact: 'high', mitigation: 'M1' },
        { risk: 'Risk 2', likelihood: 'low', impact: 'moderate', mitigation: 'M2' },
      ];

      const newRisks = migrateRisks(oldRisks);

      expect(newRisks).toHaveLength(2);
      expect(newRisks[0].name).toBe('Risk 1');
      expect(newRisks[0].likelihood).toBe('med');
      expect(newRisks[1].name).toBe('Risk 2');
      expect(newRisks[1].impact).toBe('med');
    });

    test('migrateContingencies handles arrays', () => {
      const oldContingencies = [
        { trigger: 'Trigger 1', plan: 'Plan 1' },
        { trigger: 'Trigger 2', plan: 'Plan 2' },
      ];

      const newContingencies = migrateContingencies(oldContingencies);

      expect(newContingencies).toHaveLength(2);
      expect(newContingencies[0].scenario).toBe('Trigger 1');
      expect(newContingencies[1].scenario).toBe('Trigger 2');
    });
  });
});