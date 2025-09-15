/**
 * Hero Projects - World-Class PBL Examples
 * These represent the gold standard of what educators can create with ALF Coach
 */

import type { SampleBlueprint } from './sampleBlueprints/types';
import {
  buildSustainabilityHero,
  buildCommunityHistoryHero,
  buildAssistiveTechHero,
  buildSensingSelfHero,
  buildMoveFairHero,
  buildFutureFoodHero,
  buildHeatSafeBlocksHero,
  buildPlayableCityHero,
  buildHarborHealthHero,
  buildCivicSignalsHero
} from './sampleBlueprints/index';

/**
 * Active Hero Projects
 * Only includes implemented projects, no placeholders
 */
const HERO_PROJECTS = [
  {
    id: 'hero-sustainability-campaign',
    title: 'Campus Sustainability Initiative: From Data to Policy Change',
    subject: 'Environmental Science',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students conduct comprehensive sustainability research and advocate for policy change'
  },
  {
    id: 'hero-community-history',
    title: 'Living History: Preserving Community Stories',
    subject: 'Social Studies',
    gradeLevel: 'Middle School',
    status: 'complete' as const,
    description: 'Students interview community elders and create a digital archive of local history'
  },
  {
    id: 'hero-assistive-tech',
    title: 'Everyday Innovations: Designing Tools for Dignity',
    subject: 'Technology/Engineering',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students co-design low-cost assistive solutions with and for real users with disabilities'
  },
  {
    id: 'hero-sensing-self',
    title: 'Sensing Self: Wearables for Well-Being',
    subject: 'STEM/Health',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students build wearable biofeedback devices and data dashboards to help users understand and regulate stress'
  },
  {
    id: 'hero-move-fair',
    title: 'Move Fair: Rethinking Neighborhood Mobility',
    subject: 'Urban Studies',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students conduct mobility audits, visualize data, and prototype interventions to improve transportation equity'
  },
  {
    id: 'hero-future-food',
    title: 'Future of Food: Closed-Loop Cafeteria',
    subject: 'Environmental Science',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students redesign cafeteria systems to reduce waste and improve nutrition through circular economy principles'
  },
  {
    id: 'hero-heatsafe-blocks',
    title: 'HeatSafe Blocks: Cooling Our Neighborhood',
    subject: 'Urban Planning/Science',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students map urban heat islands and design cooling interventions to protect vulnerable populations'
  },
  {
    id: 'hero-playable-city',
    title: 'Playable City: Designing Joy in Public Space',
    subject: 'Game Design/Urban Planning',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students transform underutilized urban spaces into interactive play experiences that bring communities together'
  },
  {
    id: 'hero-harbor-health',
    title: 'Harbor Health: Monitoring Our Waterfront',
    subject: 'Marine Biology/Environmental Science',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students build water quality monitoring systems and advocate for marine ecosystem protection'
  },
  {
    id: 'hero-civic-signals',
    title: 'Civic Signals: AI Listening for Community Needs',
    subject: 'Computer Science/Civics',
    gradeLevel: 'High School',
    status: 'complete' as const,
    description: 'Students train AI models on community feedback to identify priorities and inform equitable policy'
  }
];

/**
 * Get all implemented sample blueprints
 */
export function getAllSampleBlueprints(userId: string = 'anonymous'): SampleBlueprint[] {
  return [
    buildSustainabilityHero(userId),
    buildCommunityHistoryHero(userId),
    buildAssistiveTechHero(userId),
    buildSensingSelfHero(userId),
    buildMoveFairHero(userId),
    buildFutureFoodHero(userId),
    buildHeatSafeBlocksHero(userId),
    buildPlayableCityHero(userId),
    buildHarborHealthHero(userId),
    buildCivicSignalsHero(userId)
  ];
}

/**
 * Get a specific sample blueprint by ID
 */
export function makeSampleBlueprint(id: string, userId: string = 'anonymous'): SampleBlueprint {
  switch(id) {
    case 'hero-sustainability-campaign':
      return buildSustainabilityHero(userId);
    case 'hero-community-history':
      return buildCommunityHistoryHero(userId);
    case 'hero-assistive-tech':
      return buildAssistiveTechHero(userId);
    case 'hero-sensing-self':
      return buildSensingSelfHero(userId);
    case 'hero-move-fair':
      return buildMoveFairHero(userId);
    case 'hero-future-food':
      return buildFutureFoodHero(userId);
    case 'hero-heatsafe-blocks':
      return buildHeatSafeBlocksHero(userId);
    case 'hero-playable-city':
      return buildPlayableCityHero(userId);
    case 'hero-harbor-health':
      return buildHarborHealthHero(userId);
    case 'hero-civic-signals':
      return buildCivicSignalsHero(userId);
    default:
      // Default to sustainability if ID not found
      console.warn(`Sample blueprint ${id} not found, defaulting to sustainability`);
      return buildSustainabilityHero(userId);
  }
}

/**
 * Get hero projects metadata for gallery display
 */
export function getHeroProjectsMetadata() {
  return HERO_PROJECTS;
}

// Re-export the SampleBlueprint type for external use
export type { SampleBlueprint } from './sampleBlueprints/types';