import { UnifiedStorageManager } from './UnifiedStorageManager';
import type { ShowcaseProject } from '../types/showcase';
import type { UnifiedProject } from '../types/project';
import { fromShowcase, toShowcase } from '../utils/transformers/projectTransformers';

const storageManager = UnifiedStorageManager.getInstance();

const withTimestamps = (project: UnifiedProject): UnifiedProject => {
  const nowIso = new Date().toISOString();
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: project.metadata.updatedAt || nowIso,
      createdAt: project.metadata.createdAt || nowIso,
    },
  };
};

const saveUnified = async (project: UnifiedProject): Promise<string> => {
  const projectWithTimestamps = withTimestamps(project);
  const id = await storageManager.saveProject({
    id: projectWithTimestamps.meta.id,
    title: projectWithTimestamps.meta.title,
    projectData: { unifiedProject: projectWithTimestamps },
    stage: projectWithTimestamps.metadata.variant,
    source: 'import',
  });
  return id;
};

export const saveShowcase = async (showcase: ShowcaseProject): Promise<string> => {
  const unified = fromShowcase(showcase);
  return saveUnified(unified);
};

export const saveUnifiedProject = saveUnified;

export const loadUnified = async (id: string): Promise<UnifiedProject | null> => {
  const data = await storageManager.loadProject(id);
  if (!data?.projectData?.unifiedProject) {
    return null;
  }
  const unified = data.projectData.unifiedProject as UnifiedProject;
  return withTimestamps(unified);
};

export const loadShowcase = async (id: string): Promise<ShowcaseProject | null> => {
  const unified = await loadUnified(id);
  return unified ? toShowcase(unified) : null;
};

export const listUnified = async () => {
  const index = await storageManager.listProjects();
  return index
    .filter(entry => entry.stage === 'showcase')
    .map(entry => ({
      id: entry.id,
      title: entry.title || 'Untitled project',
      updatedAt: entry.updatedAt.toISOString(),
      variant: entry.stage,
    }));
};

export const deleteUnified = async (id: string) => {
  await storageManager.deleteProject(id);
};

export default {
  saveShowcase,
  saveUnified: saveUnifiedProject,
  loadUnified,
  loadShowcase,
  listUnified,
  deleteUnified,
};
