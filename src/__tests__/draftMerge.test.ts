import { mergeCapturedData, mergeProjectData, mergeWizardData } from '../utils/draftMerge';

describe('draftMerge utilities', () => {
  test('mergeWizardData keeps existing fields when applying partial updates', () => {
    const base = {
      projectTopic: 'River Restoration Initiative',
      phases: [{ id: 'phase-1', name: 'Discover' }],
      differentiation: {
        tieredAssignments: ['Choice board'],
        udlStrategies: {
          representation: ['Anchor charts'],
          action: [],
          engagement: []
        }
      }
    } as any;

    const update = {
      differentiation: {
        tieredAssignments: ['Choice board', 'Design sprint'],
        udlStrategies: {
          representation: ['Anchor charts'],
          action: ['Sketch notes']
        }
      }
    } as any;

    const result = mergeWizardData(base, update);

    expect(result).not.toBe(base);
    expect(result?.projectTopic).toBe('River Restoration Initiative');
    expect(result?.phases).toEqual([{ id: 'phase-1', name: 'Discover' }]);
    expect(result?.differentiation?.tieredAssignments).toEqual(['Choice board', 'Design sprint']);
    expect(result?.differentiation?.udlStrategies).toEqual({
      representation: ['Anchor charts'],
      action: ['Sketch notes'],
      engagement: []
    });
  });

  test('mergeProjectData prefers incoming arrays while preserving untouched fields', () => {
    const base = {
      phases: [{ id: 'p1', name: 'Launch' }],
      milestones: [{ id: 'm1', phaseId: 'p1' }],
      metadata: { version: '3.0' }
    } as any;

    const incoming = {
      phases: [{ id: 'p1', name: 'Launch' }, { id: 'p2', name: 'Create' }],
      metadata: { updated: true }
    } as any;

    const result = mergeProjectData(base, incoming);

    expect(result?.phases).toEqual([
      { id: 'p1', name: 'Launch' },
      { id: 'p2', name: 'Create' }
    ]);
    expect(result?.milestones).toEqual([{ id: 'm1', phaseId: 'p1' }]);
    expect(result?.metadata).toEqual({ version: '3.0', updated: true });
  });

  test('mergeCapturedData combines dot-path keys without mutation', () => {
    const base = {
      'ideation.bigIdea': 'Students investigate river health',
      'journey.phases': ['Discover']
    };

    const incoming = {
      'journey.phases': ['Discover', 'Design'],
      'deliverables.rubric': 'Scientific explanation rubric'
    };

    const result = mergeCapturedData(base, incoming);

    expect(result).toEqual({
      'ideation.bigIdea': 'Students investigate river health',
      'journey.phases': ['Discover', 'Design'],
      'deliverables.rubric': 'Scientific explanation rubric'
    });

    expect(base['journey.phases']).toEqual(['Discover']);
  });
});
