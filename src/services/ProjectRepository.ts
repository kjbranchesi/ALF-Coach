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

export const projectRepository = {
  async list(userId: string): Promise<ProjectDraftSummary[]> {
    // Prefer unified storage index (fast, offline), fallback to legacy summaries with metrics
    try {
      const projects = await unifiedStorage.listProjects();
      if (projects && projects.length) {
        return projects.map(p => ({
          id: p.id,
          title: p.title,
          updatedAt: p.updatedAt.toISOString(),
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
        }));
      }
    } catch (e) {
      // fall through to legacy
    }
    return await listProjectDraftSummaries(userId);
  },

  async delete(userId: string, id: string): Promise<void> {
    // Hard-delete for MVP; can evolve to soft-delete later
    try {
      await unifiedStorage.deleteProject(id);
      return;
    } catch {}
    await deleteProjectDraft(userId, id);
  },

  async save(userId: string, payload: ProjectDraftPayload, options: SaveOptions = {}): Promise<string> {
    return await saveDraft(userId, payload, options);
  }
};

