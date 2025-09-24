import type { ShowcaseProject } from '../types/showcase';
import { livingHistory } from '../data/showcase/living-history.showcase';
import { invasiveVegetation } from '../data/showcase/invasive-vegetation.showcase';
import { urbanHeat } from '../data/showcase/urban-heat.showcase';

const REGISTRY: Record<string, ShowcaseProject> = {
  [livingHistory.meta.id]: livingHistory,
  [invasiveVegetation.meta.id]: invasiveVegetation,
  [urbanHeat.meta.id]: urbanHeat,
};

export function getShowcaseProject(id: string): ShowcaseProject | undefined {
  return REGISTRY[id];
}

export function listShowcaseProjects(): { id: string; title: string }[] {
  return Object.values(REGISTRY).map(p => ({ id: p.meta.id, title: p.meta.title }));
}
