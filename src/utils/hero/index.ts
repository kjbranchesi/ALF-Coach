import { HeroProjectData } from './types';
import { heroSustainabilityData } from './hero-sustainability';
import { heroCommunityHistoryData } from './hero-community-history';
import { heroAssistiveTechData } from './hero-assistive-tech';

// Hero Project Registry
// Maps project IDs to their complete data structures
export const heroProjectRegistry: Record<string, HeroProjectData> = {
  'hero-sustainability-campaign': heroSustainabilityData,
  'hero-community-history': heroCommunityHistoryData,
  'hero-assistive-tech': heroAssistiveTechData,
};

// Helper function to get hero project by ID
export function getHeroProject(id: string): HeroProjectData | undefined {
  return heroProjectRegistry[id];
}

// Helper function to get all hero project IDs
export function getAllHeroProjectIds(): string[] {
  return Object.keys(heroProjectRegistry);
}

// Helper function to get all hero projects
export function getAllHeroProjects(): HeroProjectData[] {
  return Object.values(heroProjectRegistry);
}

// Export types for use in components
export type { HeroProjectData } from './types';