import { projectRepository } from '../services/ProjectRepository';

// Helper to set index
function setIndex(index: Record<string, any>) {
  localStorage.setItem('alf_project_index', JSON.stringify(index));
}

function nowMinus(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('ProjectRepository soft-delete + TTL', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('list() hides soft-deleted, listDeleted() returns only TTL-recent', async () => {
    setIndex({
      a1: { title: 'A', updatedAt: new Date().toISOString(), stage: 'ideation', syncStatus: 'local', status: 'draft', deletedAt: null },
      b2: { title: 'B', updatedAt: new Date().toISOString(), stage: 'journey', syncStatus: 'local', status: 'archived', deletedAt: nowMinus(1) },
      c3: { title: 'C', updatedAt: new Date().toISOString(), stage: 'deliverables', syncStatus: 'local', status: 'archived', deletedAt: nowMinus(40) },
    });

    const listed = await projectRepository.list('anonymous');
    expect(listed.find(d => d.id === 'b2')).toBeUndefined();
    expect(listed.find(d => d.id === 'a1')).toBeDefined();

    const deleted = await projectRepository.listDeleted();
    expect(deleted.map(d => d.id)).toContain('b2');
    expect(deleted.map(d => d.id)).not.toContain('c3'); // older than TTL
  });

  it('restore() removes deletedAt from index', async () => {
    setIndex({
      x1: { title: 'X', updatedAt: new Date().toISOString(), stage: 'ideation', syncStatus: 'local', status: 'archived', deletedAt: nowMinus(1) },
    });
    await projectRepository.restore('anonymous', 'x1');
    const deleted = await projectRepository.listDeleted();
    expect(deleted.find(d => d.id === 'x1')).toBeUndefined();
  });

  it('purgeExpiredDeleted() removes old soft-deleted', async () => {
    setIndex({
      y1: { title: 'Y', updatedAt: new Date().toISOString(), stage: 'ideation', syncStatus: 'local', status: 'archived', deletedAt: nowMinus(45) },
      z2: { title: 'Z', updatedAt: new Date().toISOString(), stage: 'journey', syncStatus: 'local', status: 'archived', deletedAt: nowMinus(5) },
    });
    const purged = await projectRepository.purgeExpiredDeleted();
    expect(purged).toBe(1);
    const deleted = await projectRepository.listDeleted();
    expect(deleted.map(d => d.id)).toContain('z2');
    expect(deleted.map(d => d.id)).not.toContain('y1');
  });
});

