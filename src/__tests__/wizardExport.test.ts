import { buildSnapshotSharePreview, buildWizardSnapshot, getSnapshotMetrics } from '../utils/wizardExport';

describe('wizardExport utilities', () => {
  const wizardData = {
    projectTopic: 'Community Garden Renewal',
    bigIdea: 'Students design new uses for community spaces.',
    essentialQuestion: 'How can we transform unused land into thriving learning spaces?',
    learningGoals: [{ text: 'Investigate local ecosystems', tier: 'core' }],
    successCriteria: [{ text: 'Proposal references stakeholder needs', tier: 'core' }],
    phases: [{ id: 'phase-1', name: 'Discover' }, { id: 'phase-2', name: 'Design' }],
    milestones: [{ id: 'milestone-1', name: 'Site Audit', phaseId: 'phase-1', evidence: [] }],
    artifacts: [{ id: 'artifact-1', name: 'Design brief', milestoneId: 'milestone-1', rubricIds: [] }],
    rubrics: [{ id: 'rubric-1', name: 'Presentation rubric', criteria: [] }],
    studentRoles: [{ id: 'role-1', title: 'Historian', description: '', responsibilities: [], tier: 'core' }],
    scaffolds: [{ id: 'scaffold-1', title: 'Interview guide', description: '', tier: 'scaffold' }],
    evidencePlan: {
      checkpoints: [{ id: 'checkpoint-1', date: '2024-10-01', type: 'Prototype review', evidence: [], storage: 'Drive' }],
      permissions: ['Photo release'],
      dataManagement: 'Shared folder'
    },
    riskManagement: {
      risks: [{ id: 'risk-1', description: 'Weather delays', mitigation: 'Have indoor backup location' }],
      contingencies: []
    }
  };

  test('buildWizardSnapshot captures metrics from wizard data', () => {
    const snapshot = buildWizardSnapshot(wizardData);

    expect(snapshot.version).toBe('1.0');
    expect(snapshot.generatedAt).toBeTruthy();
    expect(snapshot.metrics).toMatchObject({
      learningGoals: 1,
      successCriteria: 1,
      phases: 2,
      milestones: 1,
      artifacts: 1,
      rubrics: 1,
      roles: 1,
      scaffolds: 1,
      checkpoints: 1,
      risks: 1
    });
    expect(snapshot.wizardData).toEqual(wizardData);
    expect(snapshot.completeness.overall).toBeGreaterThanOrEqual(0);
    expect(snapshot.completeness.overall).toBeLessThanOrEqual(100);
  });

  test('buildSnapshotSharePreview surfaces key details', () => {
    const snapshot = buildWizardSnapshot(wizardData);
    const preview = buildSnapshotSharePreview(snapshot);

    expect(preview).toContain('Community Garden Renewal');
    expect(preview).toContain('Learning goals: 1');
    expect(preview).toContain('Phases / milestones: 2 / 1');
    expect(preview).toContain('Artifacts / rubrics: 1 / 1');
  });

  test('getSnapshotMetrics falls back to zero counts', () => {
    const metrics = getSnapshotMetrics({});
    expect(metrics).toEqual({
      learningGoals: 0,
      successCriteria: 0,
      phases: 0,
      milestones: 0,
      artifacts: 0,
      rubrics: 0,
      roles: 0,
      scaffolds: 0,
      checkpoints: 0,
      risks: 0
    });
  });
});
