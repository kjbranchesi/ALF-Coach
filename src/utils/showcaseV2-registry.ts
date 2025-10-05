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
import { bio_symphony_skylinesV2 } from '../data/showcaseV2/bio-symphony-skylines.showcase';
import { quantum_graffiti_labsV2 } from '../data/showcaseV2/quantum-graffiti-labs.showcase';
import { luminous_mycelium_networksV2 } from '../data/showcaseV2/luminous-mycelium-networks.showcase';
import { carbon_negative_fashion_forgeV2 } from '../data/showcaseV2/carbon-negative-fashion-forge.showcase';
import { martian_water_architectsV2 } from '../data/showcaseV2/martian-water-architects.showcase';
import { ai_emotional_weather_vaneV2 } from '../data/showcaseV2/ai-emotional-weather-vane.showcase';
import { neuroplastic_playgroundsV2 } from '../data/showcaseV2/neuroplastic-playgrounds.showcase';
import { plastic_to_protein_microfactoriesV2 } from '../data/showcaseV2/plastic-to-protein-microfactories.showcase';
import { ocean_dna_time_capsulesV2 } from '../data/showcaseV2/ocean-dna-time-capsules.showcase';
import { ar_disaster_wardensV2 } from '../data/showcaseV2/ar-disaster-wardens.showcase';
import { solarpunk_seed_vaultsV2 } from '../data/showcaseV2/solarpunk-seed-vaults.showcase';
import { metabolic_city_dashboardsV2 } from '../data/showcaseV2/metabolic-city-dashboards.showcase';
import { interspecies_language_translatorsV2 } from '../data/showcaseV2/interspecies-language-translators.showcase';
import { bio_looped_space_cuisineV2 } from '../data/showcaseV2/bio-looped-space-cuisine.showcase';
import { climate_justice_wearablesV2 } from '../data/showcaseV2/climate-justice-wearables.showcase';
import { inclusive_exoskeleton_studiosV2 } from '../data/showcaseV2/inclusive-exoskeleton-studios.showcase';
import { geoengineering_ethics_expeditionV2 } from '../data/showcaseV2/geoengineering-ethics-expedition.showcase';
import { civic_ai_ombuds_officeV2 } from '../data/showcaseV2/civic-ai-ombuds-office.showcase';
import { synesthetic_data_galleriesV2 } from '../data/showcaseV2/synesthetic-data-galleries.showcase';

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
  'bio-symphony-skylines': bio_symphony_skylinesV2,
  'quantum-graffiti-labs': quantum_graffiti_labsV2,
  'luminous-mycelium-networks': luminous_mycelium_networksV2,
  'carbon-negative-fashion-forge': carbon_negative_fashion_forgeV2,
  'martian-water-architects': martian_water_architectsV2,
  'ai-emotional-weather-vane': ai_emotional_weather_vaneV2,
  'neuroplastic-playgrounds': neuroplastic_playgroundsV2,
  'plastic-to-protein-microfactories': plastic_to_protein_microfactoriesV2,
  'ocean-dna-time-capsules': ocean_dna_time_capsulesV2,
  'ar-disaster-wardens': ar_disaster_wardensV2,
  'solarpunk-seed-vaults': solarpunk_seed_vaultsV2,
  'metabolic-city-dashboards': metabolic_city_dashboardsV2,
  'interspecies-language-translators': interspecies_language_translatorsV2,
  'bio-looped-space-cuisine': bio_looped_space_cuisineV2,
  'climate-justice-wearables': climate_justice_wearablesV2,
  'inclusive-exoskeleton-studios': inclusive_exoskeleton_studiosV2,
  'geoengineering-ethics-expedition': geoengineering_ethics_expeditionV2,
  'civic-ai-ombuds-office': civic_ai_ombuds_officeV2,
  'synesthetic-data-galleries': synesthetic_data_galleriesV2,
};

export function getProjectV2(id: string): ProjectShowcaseV2 | undefined {
  return REGISTRY[id];
}

export function listProjectsV2(): Array<{
  id: string;
  title: string;
  gradeBand: string;
  timeframe: string;
  subjects: string[];
  image?: string;
  tagline: string;
}> {
  return Object.entries(REGISTRY).map(([id, p]) => ({
    id,
    title: p.hero.title,
    gradeBand: p.hero.gradeBand,
    timeframe: p.hero.timeframe,
    subjects: p.hero.subjects,
    image: p.hero.image,
    tagline: p.hero.tagline
  }));
}
