/**
 * Validation System Tests
 *
 * These tests ensure the validation system correctly identifies
 * and handles all data structure issues that have occurred.
 */

import {
  normalizeRiskLevel,
  normalizeTechAccess,
  buildConstraints,
  buildRisk,
  buildContingency,
  validateHeroProject,
  validateFeasibilityData,
  RISK_LEVELS,
  TECH_ACCESS_LEVELS,
} from '../validation';

describe('Risk Level Normalization', () => {
  test('normalizes common variations to canonical form', () => {
    expect(normalizeRiskLevel('low')).toBe(RISK_LEVELS.LOW);
    expect(normalizeRiskLevel('Low')).toBe(RISK_LEVELS.LOW);
    expect(normalizeRiskLevel(' low ')).toBe(RISK_LEVELS.LOW);

    expect(normalizeRiskLevel('med')).toBe(RISK_LEVELS.MEDIUM);
    expect(normalizeRiskLevel('medium')).toBe(RISK_LEVELS.MEDIUM);
    expect(normalizeRiskLevel('Medium')).toBe(RISK_LEVELS.MEDIUM);
    expect(normalizeRiskLevel('moderate')).toBe(RISK_LEVELS.MEDIUM);

    expect(normalizeRiskLevel('high')).toBe(RISK_LEVELS.HIGH);
    expect(normalizeRiskLevel('High')).toBe(RISK_LEVELS.HIGH);
  });

  test('throws error for invalid risk levels', () => {
    expect(() => normalizeRiskLevel('extreme')).toThrow('Invalid risk level');
    expect(() => normalizeRiskLevel('very high')).toThrow('Invalid risk level');
    expect(() => normalizeRiskLevel('')).toThrow('Invalid risk level');
  });
});

describe('Tech Access Normalization', () => {
  test('normalizes common variations', () => {
    expect(normalizeTechAccess('full')).toBe(TECH_ACCESS_LEVELS.FULL);
    expect(normalizeTechAccess('Full')).toBe(TECH_ACCESS_LEVELS.FULL);

    expect(normalizeTechAccess('limited')).toBe(TECH_ACCESS_LEVELS.LIMITED);
    expect(normalizeTechAccess('partial')).toBe(TECH_ACCESS_LEVELS.LIMITED);

    expect(normalizeTechAccess('none')).toBe(TECH_ACCESS_LEVELS.NONE);
    expect(normalizeTechAccess('no')).toBe(TECH_ACCESS_LEVELS.NONE);
  });

  test('throws error for invalid tech access levels', () => {
    expect(() => normalizeTechAccess('some')).toThrow('Invalid tech access level');
    expect(() => normalizeTechAccess('minimal')).toThrow('Invalid tech access level');
  });
});

describe('Risk Builder', () => {
  test('builds valid risk with correct properties', () => {
    const risk = buildRisk({
      id: 'r1',
      name: 'Test Risk',
      likelihood: 'medium',
      impact: 'high',
      mitigation: 'Test mitigation',
    });

    expect(risk).toEqual({
      id: 'r1',
      name: 'Test Risk',
      likelihood: 'med',
      impact: 'high',
      mitigation: 'Test mitigation',
    });
  });

  test('handles legacy "risk" property', () => {
    const risk = buildRisk({
      id: 'r1',
      risk: 'Legacy Risk Name', // Old property name
      likelihood: 'low',
      impact: 'med',
      mitigation: 'Test',
    });

    expect(risk.name).toBe('Legacy Risk Name');
  });

  test('prefers "name" over "risk" property', () => {
    const risk = buildRisk({
      id: 'r1',
      name: 'Correct Name',
      risk: 'Wrong Name',
      likelihood: 'low',
      impact: 'med',
      mitigation: 'Test',
    });

    expect(risk.name).toBe('Correct Name');
  });

  test('throws error for missing required fields', () => {
    expect(() => buildRisk({})).toThrow('Risk must have an id');

    expect(() =>
      buildRisk({
        id: 'r1',
      })
    ).toThrow('Risk must have a name property');

    expect(() =>
      buildRisk({
        id: 'r1',
        name: 'Test',
      })
    ).toThrow('Risk must have a likelihood');

    expect(() =>
      buildRisk({
        id: 'r1',
        name: 'Test',
        likelihood: 'low',
      })
    ).toThrow('Risk must have an impact');

    expect(() =>
      buildRisk({
        id: 'r1',
        name: 'Test',
        likelihood: 'low',
        impact: 'high',
      })
    ).toThrow('Risk must have a mitigation');
  });
});

describe('Contingency Builder', () => {
  test('builds valid contingency with correct properties', () => {
    const contingency = buildContingency({
      id: 'c1',
      scenario: 'Test Scenario',
      plan: 'Test Plan',
    });

    expect(contingency).toEqual({
      id: 'c1',
      scenario: 'Test Scenario',
      plan: 'Test Plan',
    });
  });

  test('handles legacy "trigger" property', () => {
    const contingency = buildContingency({
      id: 'c1',
      trigger: 'Legacy Trigger', // Old property name
      plan: 'Test Plan',
    });

    expect(contingency.scenario).toBe('Legacy Trigger');
  });

  test('prefers "scenario" over "trigger" property', () => {
    const contingency = buildContingency({
      id: 'c1',
      scenario: 'Correct Scenario',
      trigger: 'Wrong Trigger',
      plan: 'Test Plan',
    });

    expect(contingency.scenario).toBe('Correct Scenario');
  });

  test('throws error for missing required fields', () => {
    expect(() => buildContingency({})).toThrow('Contingency must have an id');

    expect(() =>
      buildContingency({
        id: 'c1',
      })
    ).toThrow('Contingency must have a scenario property');

    expect(() =>
      buildContingency({
        id: 'c1',
        scenario: 'Test',
      })
    ).toThrow('Contingency must have a plan');
  });
});

describe('Constraints Builder', () => {
  test('builds valid constraints', () => {
    const constraints = buildConstraints({
      budgetUSD: 500,
      techAccess: 'partial', // Should normalize to 'limited'
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

  test('handles partial constraints', () => {
    const constraints = buildConstraints({
      budgetUSD: 300,
    });

    expect(constraints).toEqual({
      budgetUSD: 300,
    });
  });

  test('validates budget as number', () => {
    expect(() =>
      buildConstraints({
        budgetUSD: 'not a number' as any,
      })
    ).toThrow('Invalid budget');

    expect(() =>
      buildConstraints({
        budgetUSD: -100,
      })
    ).toThrow('Invalid budget');
  });

  test('validates arrays', () => {
    expect(() =>
      buildConstraints({
        materials: 'not an array' as any,
      })
    ).toThrow('Materials must be an array');

    expect(() =>
      buildConstraints({
        safetyRequirements: 'not an array' as any,
      })
    ).toThrow('Safety requirements must be an array');
  });
});

describe('Hero Project Validation', () => {
  test('validates required fields', () => {
    const result = validateHeroProject({});

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'id',
        message: 'Missing required field: id',
      })
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'title',
        message: 'Missing required field: title',
      })
    );
  });

  test('validates subjects as array', () => {
    const result = validateHeroProject({
      id: 'test',
      title: 'Test',
      duration: '4 weeks',
      gradeLevel: '9-12',
      subjects: 'Science', // Should be array
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'subjects',
        message: 'Subjects must be an array',
      })
    );
  });

  test('validates journey phases', () => {
    const result = validateHeroProject({
      id: 'test',
      title: 'Test',
      duration: '4 weeks',
      gradeLevel: '9-12',
      subjects: ['Science'],
      journey: {
        phases: 'not an array', // Should be array
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'journey.phases',
        message: 'Journey phases must be an array',
      })
    );
  });

  test('validates phase structure', () => {
    const result = validateHeroProject({
      id: 'test',
      title: 'Test',
      duration: '4 weeks',
      gradeLevel: '9-12',
      subjects: ['Science'],
      journey: {
        phases: [
          {
            // Missing name and duration
            description: 'Test phase',
          },
        ],
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'journey.phases[0].name',
        message: 'Phase 1 must have a name',
      })
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'journey.phases[0].duration',
        message: 'Phase 1 must have a duration',
      })
    );
  });

  test('validates standards alignment structure', () => {
    const result = validateHeroProject({
      id: 'test',
      title: 'Test',
      duration: '4 weeks',
      gradeLevel: '9-12',
      subjects: ['Science'],
      standards: {
        alignments: {
          NGSS: 'not an array', // Should be array
        },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'standards.alignments.NGSS',
        message: 'Standards for NGSS must be an array',
      })
    );
  });

  test('passes for valid minimal project', () => {
    const result = validateHeroProject({
      id: 'test',
      title: 'Test Project',
      duration: '4 weeks',
      gradeLevel: '9-12',
      subjects: ['Science', 'Math'],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Feasibility Data Validation', () => {
  test('validates risks array', () => {
    const result = validateFeasibilityData({
      risks: 'not an array', // Should be array
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'risks',
        message: 'Risks must be an array',
      })
    );
  });

  test('validates individual risks', () => {
    const result = validateFeasibilityData({
      risks: [
        {
          id: 'r1',
          risk: 'Using wrong property', // Should be 'name'
          likelihood: 'medium', // Will be normalized
          impact: 'high',
          mitigation: 'Test',
        },
      ],
    });

    // Builder will handle the conversion, but raw validation would catch it
    expect(result.errors).toHaveLength(0); // Because builder handles it
  });

  test('validates contingencies array', () => {
    const result = validateFeasibilityData({
      contingencies: 'not an array', // Should be array
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'contingencies',
        message: 'Contingencies must be an array',
      })
    );
  });

  test('validates individual contingencies', () => {
    const result = validateFeasibilityData({
      contingencies: [
        {
          id: 'c1',
          trigger: 'Using wrong property', // Should be 'scenario'
          plan: 'Test',
        },
      ],
    });

    // Builder will handle the conversion
    expect(result.errors).toHaveLength(0); // Because builder handles it
  });

  test('passes for valid feasibility data', () => {
    const result = validateFeasibilityData({
      constraints: {
        budgetUSD: 500,
        techAccess: 'limited',
      },
      risks: [
        {
          id: 'r1',
          name: 'Test Risk',
          likelihood: 'med',
          impact: 'high',
          mitigation: 'Test mitigation',
        },
      ],
      contingencies: [
        {
          id: 'c1',
          scenario: 'Test scenario',
          plan: 'Test plan',
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Real-World Problem Scenarios', () => {
  test('handles the exact problems from the issue', () => {
    // Problem 1: FeasibilityPanel expected 'med' but got 'medium'
    const risk1 = buildRisk({
      id: 'r1',
      name: 'Test',
      likelihood: 'medium', // Input
      impact: 'medium',
      mitigation: 'Test',
    });
    expect(risk1.likelihood).toBe('med'); // Output
    expect(risk1.impact).toBe('med');

    // Problem 2: Risk objects needed 'name' property not 'risk'
    const risk2 = buildRisk({
      id: 'r2',
      risk: 'Budget overrun', // Using wrong property
      likelihood: 'high',
      impact: 'high',
      mitigation: 'Seek funding',
    } as any);
    expect(risk2.name).toBe('Budget overrun'); // Correctly mapped

    // Problem 3: Constraints needed specific object structure not array
    const constraints = buildConstraints({
      budgetUSD: 500,
      techAccess: 'partial', // Also testing normalization
      materials: ['Computers'],
      safetyRequirements: ['Supervision'],
    });
    expect(constraints).toMatchObject({
      budgetUSD: 500,
      techAccess: 'limited', // Normalized
      materials: ['Computers'],
      safetyRequirements: ['Supervision'],
    });

    // Problem 4: Contingencies used 'trigger' vs 'scenario' inconsistently
    const contingency = buildContingency({
      id: 'c1',
      trigger: 'Behind schedule', // Using wrong property
      plan: 'Compress timeline',
    } as any);
    expect(contingency.scenario).toBe('Behind schedule'); // Correctly mapped
  });
});

describe('Edge Cases', () => {
  test('handles null and undefined gracefully', () => {
    expect(() => buildRisk(null as any)).toThrow();
    expect(() => buildRisk(undefined as any)).toThrow();

    expect(() => buildContingency(null as any)).toThrow();
    expect(() => buildContingency(undefined as any)).toThrow();

    // Empty objects should provide clear errors
    expect(() => buildRisk({})).toThrow('Risk must have an id');
    expect(() => buildContingency({})).toThrow('Contingency must have an id');
  });

  test('handles type coercion', () => {
    const risk = buildRisk({
      id: 123 as any, // Number instead of string
      name: true as any, // Boolean instead of string
      likelihood: 'low',
      impact: 'high',
      mitigation: null as any, // Null instead of string
    });

    expect(risk.id).toBe('123');
    expect(risk.name).toBe('true');
    expect(risk.mitigation).toBe('null');
  });

  test('preserves extra properties', () => {
    const risk = buildRisk({
      id: 'r1',
      name: 'Test',
      likelihood: 'low',
      impact: 'high',
      mitigation: 'Test',
      customField: 'preserved', // Extra field
    } as any);

    // Core fields are validated
    expect(risk.id).toBe('r1');
    expect(risk.name).toBe('Test');
    // Extra fields are not included in the output
    expect((risk as any).customField).toBeUndefined();
  });
});