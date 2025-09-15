import { HeroProjectData } from './types';
import { heroSustainabilityData } from './hero-sustainability';
import { heroCommunityHistoryData } from './hero-community-history';
import { heroAssistiveTechData } from './hero-assistive-tech';
import { heroSensingSelfData } from './hero-sensing-self';
import { heroMoveFairData } from './hero-move-fair';
import { heroFutureFoodData } from './hero-future-food';
import { heroHeatSafeBlocksData } from './hero-heatsafe-blocks';
import { wrapHeroProject } from './dev-validation';

// Hero Project Registry
// Maps project IDs to their complete data structures
// All projects are wrapped with validation in development mode
export const heroProjectRegistry: Record<string, HeroProjectData> = {
  'hero-sustainability-campaign': wrapHeroProject(heroSustainabilityData),
  'hero-community-history': wrapHeroProject(heroCommunityHistoryData),
  'hero-assistive-tech': wrapHeroProject(heroAssistiveTechData),
  'hero-sensing-self': wrapHeroProject(heroSensingSelfData),
  'hero-move-fair': wrapHeroProject(heroMoveFairData),
  'hero-future-food': wrapHeroProject(heroFutureFoodData),
  'hero-heatsafe-blocks': wrapHeroProject(heroHeatSafeBlocksData),
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

// Export builders for creating properly structured data
export {
  createRisk,
  createContingency,
  createConstraints,
  createPhase,
  createActivity,
  createMilestone,
  createRubricCriteria,
  createResource,
  createStandardAlignment,
  createFeasibilityData,
  createHeroProjectTemplate,
  migrateRisk,
  migrateContingency,
  migrateRisks,
  migrateContingencies
} from './builders';

// Export validation utilities
export {
  validateHeroProject,
  validateFeasibilityData,
  formatValidationResults,
  RISK_LEVELS,
  TECH_ACCESS_LEVELS,
  EMPHASIS_LEVELS,
  type ValidatedRisk,
  type ValidatedContingency,
  type ValidatedConstraints,
  type ValidationResult
} from './validation';