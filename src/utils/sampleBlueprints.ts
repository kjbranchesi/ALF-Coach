/**
 * Hero Projects - World-Class PBL Examples
 * These represent the gold standard of what educators can create with ALF Coach
 */

import type { SampleBlueprint } from './sampleBlueprints/types';
import {
  buildSustainabilityHero,
  buildCommunityHistoryHero,
  buildAssistiveTechHero,
  buildSensingSelfHero
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
    buildSensingSelfHero(userId)
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