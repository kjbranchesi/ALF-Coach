import type { ProjectShowcaseV2 } from '../types/showcaseV2';
import { sustainability_campaignV2 } from '../data/showcaseV2/sustainability-campaign.showcase';
import { living_historyV2 } from '../data/showcaseV2/living-history.showcase';
import { assistive_techV2 } from '../data/showcaseV2/assistive-tech.showcase';
import { sensing_selfV2 } from '../data/showcaseV2/sensing-self.showcase';
import { move_fairV2 } from '../data/showcaseV2/move-fair.showcase';
import { future_foodV2 } from '../data/showcaseV2/future-food.showcase';
import { urban_heatV2 } from '../data/showcaseV2/urban-heat.showcase';
import { playable_cityV2 } from '../data/showcaseV2/playable-city.showcase';
import { harbor_healthV2 } from '../data/showcaseV2/harbor-health.showcase';
import { civic_signalsV2 } from '../data/showcaseV2/civic-signals.showcase';
import { accessability_aiV2 } from '../data/showcaseV2/accessability-ai.showcase';

const REGISTRY: Record<string, ProjectShowcaseV2> = {
  'sustainability-campaign': sustainability_campaignV2,
  'living-history': living_historyV2,
  'assistive-tech': assistive_techV2,
  'sensing-self': sensing_selfV2,
  'move-fair': move_fairV2,
  'future-food': future_foodV2,
  'urban-heat': urban_heatV2,
  'playable-city': playable_cityV2,
  'harbor-health': harbor_healthV2,
  'civic-signals': civic_signalsV2,
  'accessability-ai': accessability_aiV2,
};

export function getProjectV2(id: string): ProjectShowcaseV2 | undefined {
  return REGISTRY[id];
}

export function listProjectsV2(): Array<{ id: string; title: string; gradeBand: string; timeframe: string; subjects: string[]; image?: string }> {
  return Object.entries(REGISTRY).map(([id, p]) => ({
    id,
    title: p.hero.title,
    gradeBand: p.hero.gradeBand,
    timeframe: p.hero.timeframe,
    subjects: p.hero.subjects,
    image: p.hero.image
  }));
}
