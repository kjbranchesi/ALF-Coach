import type { HeroProjectData } from '../../../utils/hero/types';

interface HeroManifestEntry {
  id: string;
  title: string;
  duration: string;
  gradeLevel: string;
  subjects: string[];
  path: string;
}

interface HeroManifest {
  generatedAt: string;
  count: number;
  projects: HeroManifestEntry[];
}

import type { createRequire as CreateRequire } from 'module';

declare const module: {
  createRequire?: CreateRequire;
};

import manifestJson from './manifest.json';

const manifest = manifestJson as HeroManifest;

const hasViteGlob = typeof import.meta !== 'undefined' && typeof (import.meta as any).glob === 'function';
const isNodeRuntime = typeof process !== 'undefined' && Boolean(process.versions?.node);

function loadWithViteGlob(): Record<string, HeroProjectData> {
  return (import.meta as any).glob('./*.json', {
    eager: true,
    import: 'default'
  }) as Record<string, HeroProjectData>;
}

function loadWithNodeFs(): Record<string, HeroProjectData> {
  if (!isNodeRuntime) {
    return {};
  }

  const createRequire = typeof module !== 'undefined' ? module.createRequire : undefined;
  if (typeof createRequire !== 'function') {
    return {};
  }

  const requireFn = createRequire(import.meta.url);
  const { readFileSync, readdirSync } = requireFn('node:fs') as typeof import('node:fs');
  const { fileURLToPath } = requireFn('node:url') as typeof import('node:url');
  const { dirname, resolve } = requireFn('node:path') as typeof import('node:path');

  const dir = dirname(fileURLToPath(import.meta.url));
  const files = readdirSync(dir).filter(file => file.endsWith('.json'));

  return Object.fromEntries(
    files.map(file => {
      const contents = readFileSync(resolve(dir, file), 'utf-8');
      return [`./${file}`, JSON.parse(contents) as HeroProjectData];
    })
  );
}

const projectModules: Record<string, HeroProjectData> = hasViteGlob
  ? loadWithViteGlob()
  : loadWithNodeFs();

const projectsById: Record<string, HeroProjectData> = Object.fromEntries(
  Object.entries(projectModules)
    .filter(([key]) => !key.endsWith('manifest.json'))
    .map(([key, value]) => {
      const id = key.replace('./', '').replace('.json', '');
      return [id, value as HeroProjectData];
    })
);

export function listGeneratedHeroProjects(): HeroManifestEntry[] {
  return manifest.projects;
}

export function getGeneratedHeroProject(id: string): HeroProjectData | undefined {
  return projectsById[id];
}

export function getGeneratedHeroManifest(): HeroManifest {
  return manifest;
}
