// src/services/ProjectRepository.ts
// Thin persistence boundary used by dashboard and builder flows.

import { unifiedStorage } from './UnifiedStorageManager';
import {
  saveProjectDraft as saveDraft,
  listProjectDraftSummaries,
  deleteProjectDraft,
  type ProjectDraftSummary,
  type ProjectDraftPayload
} from './projectPersistence';

export interface SaveOptions {
  draftId?: string;
  source?: 'wizard' | 'chat' | 'import';
  metadata?: Record<string, unknown>;
}

export type ProjectStatus = 'draft' | 'in-progress' | 'ready' | 'published' | 'archived';

export interface ProjectProgress {
  ideation?: number; journey?: number; deliverables?: number; overall?: number;
}

export interface RepositorySummary extends ProjectDraftSummary {
  status?: ProjectStatus;
  deletedAt?: string | null;
}

const TTL_DAYS = 30;

export const projectRepository = {
  async list(userId: string): Promise<ProjectDraftSummary[]> {
    // Prefer unified storage index (fast, offline), fallback to legacy summaries with metrics
    try {
      const projects = await unifiedStorage.listProjects();
      if (projects && projects.length) {
        return projects
          .filter(p => !p.deletedAt) // hide soft-deleted by default
          .map(p => ({
            id: p.id,
            title: p.title,
            updatedAt: p.updatedAt.toISOString(),
            status: (p as any).status || 'draft',
            completeness: { core: 50, context: 50, progressive: 50, overall: 50 },
            tierCounts: { core: 0, scaffold: 0, aspirational: 0 },
            metrics: {
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
          }
        })) as ProjectDraftSummary[];
      }
    } catch (e) {
      // fall through to legacy
    }
    return await listProjectDraftSummaries(userId);
  },

  async listDeleted(): Promise<RepositorySummary[]> {
    try {
      const projects = await unifiedStorage.listProjects();
      const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000;
      return projects
        .filter(p => p.deletedAt && p.deletedAt.getTime() >= cutoff)
        .map(p => ({
          id: p.id,
          title: p.title,
          updatedAt: p.updatedAt.toISOString(),
          completeness: { core: 0, context: 0, progressive: 0, overall: 0 },
          tierCounts: { core: 0, scaffold: 0, aspirational: 0 },
          metrics: {
            learningGoals: 0, successCriteria: 0, phases: 0, milestones: 0,
            artifacts: 0, rubrics: 0, roles: 0, scaffolds: 0, checkpoints: 0, risks: 0
          },
          status: 'archived',
          deletedAt: p.deletedAt?.toISOString() || null
        }));
    } catch {
      return [];
    }
  },

  async delete(userId: string, id: string): Promise<void> {
    // Soft-delete: mark deletedAt and keep index updated
    try {
      await unifiedStorage.saveProject({ id, deletedAt: new Date(), status: 'archived' });
      return;
    } catch (e) {
      console.warn('[ProjectRepository] Soft-delete failed, falling back to hard-delete', e);
      try { await unifiedStorage.deleteProject(id); } catch {}
      await deleteProjectDraft(userId, id);
    }
  },

  async deleteAll(_userId?: string): Promise<number> {
    // Remove everything in the unified index; UnifiedStorageManager also cleans legacy keys
    const projects = await unifiedStorage.listProjects();
    let count = 0;
    for (const p of projects) {
      try {
        await unifiedStorage.deleteProject(p.id);
        count++;
      } catch (e) {
        // Continue deleting others
        console.warn('[ProjectRepository] Failed to delete project', p.id, e);
      }
    }
    return count;
  },

  async restore(_userId: string, id: string): Promise<void> {
    await unifiedStorage.saveProject({ id, deletedAt: null });
  },

  async purgeExpiredDeleted(): Promise<number> {
    const projects = await unifiedStorage.listProjects();
    let count = 0;
    const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000;
    for (const p of projects) {
      if (p.deletedAt && p.deletedAt.getTime() < cutoff) {
        try {
          await unifiedStorage.deleteProject(p.id);
          count++;
        } catch (e) {
          console.warn('[ProjectRepository] Failed to purge deleted project', p.id, e);
        }
      }
    }
    return count;
  },

  async save(userId: string, payload: ProjectDraftPayload, options: SaveOptions = {}): Promise<string> {
    return await saveDraft(userId, payload, options);
  }
};
