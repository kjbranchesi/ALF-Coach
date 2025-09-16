/**
 * Unified Hero Projects Registry
 * Single source of truth for all hero projects
 *
 * To add a new project:
 * 1. Create the hero data file in /src/utils/hero/
 * 2. Import it here
 * 3. Add to HERO_PROJECTS array
 * That's it!
 */

import { HeroProjectData } from './hero/types';
import { heroSustainabilityData } from './hero/hero-sustainability';
import { heroCommunityHistoryData } from './hero/hero-community-history';
import { heroAssistiveTechData } from './hero/hero-assistive-tech';
import { heroSensingSelfData } from './hero/hero-sensing-self';
import { heroMoveFairData } from './hero/hero-move-fair';
import { heroFutureFoodData } from './hero/hero-future-food';
import { heroHeatSafeBlocksData } from './hero/hero-heatsafe-blocks';
import { heroPlayableCityData } from './hero/hero-playable-city';
import { heroHarborHealthData } from './hero/hero-harbor-health';
import { heroCivicSignalsData } from './hero/hero-civic-signals';
import { heroAccessAbilityAIData } from './hero/hero-accessability-ai';

// Single registry - just add new projects here
export const HERO_PROJECTS: HeroProjectData[] = [
  heroSustainabilityData,
  heroCommunityHistoryData,
  heroAssistiveTechData,
  heroSensingSelfData,
  heroMoveFairData,
  heroFutureFoodData,
  heroHeatSafeBlocksData,
  heroPlayableCityData,
  heroHarborHealthData,
  heroCivicSignalsData,
  heroAccessAbilityAIData,
];

// Helper functions
export function getHeroProject(id: string): HeroProjectData | undefined {
  return HERO_PROJECTS.find(p => p.id === id);
}

export function getAllHeroProjects(): HeroProjectData[] {
  return HERO_PROJECTS;
}

// Get metadata for gallery display (no complex mapping needed)
export function getHeroProjectsMetadata() {
  return HERO_PROJECTS.map(project => ({
    id: project.id,
    title: project.title,
    subject: project.subjects.join(', '),
    gradeLevel: project.gradeLevel,
    description: project.hero.description,
    duration: project.duration,
    status: 'complete' as const,
    featured: true,
    image: project.image // Include the image if available
  }));
}

// Simple adapter for legacy SampleBlueprint format if still needed
export function heroToBlueprint(heroData: HeroProjectData, userId: string = 'anonymous') {
  return {
    id: heroData.id,
    userId,
    title: heroData.title,
    description: heroData.hero.description,
    subject: heroData.subjects.join(', '),
    gradeLevel: heroData.gradeLevel,
    duration: heroData.duration,
    isActive: false,
    isHero: true,
    heroProjectId: heroData.id,
    wizardData: {
      projectTopic: heroData.title,
      subjects: heroData.subjects,
      gradeLevel: heroData.gradeLevel.includes('High') ? 'high' :
                  heroData.gradeLevel.includes('Middle') ? 'middle' : 'elementary',
      duration: heroData.duration.includes('10') ? 'long' :
                heroData.duration.includes('6') ? 'medium' : 'short',
      subject: heroData.subjects.join(', '),
      featured: true
    },
    tags: heroData.subjects,
    ideation: {
      bigIdea: heroData.bigIdea.statement,
      essentialQuestion: heroData.bigIdea.essentialQuestion,
      challenge: heroData.bigIdea.challenge
    },
    blueprint: {
      ideation: {
        drivingQuestion: heroData.bigIdea.drivingQuestion,
        essentialQuestion: heroData.bigIdea.essentialQuestion,
        challenge: heroData.bigIdea.challenge,
        bigIdea: heroData.bigIdea.statement,
        studentVoice: {
          drivingQuestions: heroData.bigIdea.subQuestions,
          choicePoints: [] // Can be extracted from phases if needed
        }
      },
      journey: {
        phases: heroData.journey.phases,
        milestones: heroData.journey.milestones,
        resources: [
          ...heroData.resources.required,
          ...heroData.resources.optional
        ]
      },
      deliverables: {
        milestones: heroData.journey.milestones.map(m => ({
          id: m.id,
          name: m.title,
          timeline: `Week ${m.week}`,
          description: m.description,
          deliverable: m.evidence[0],
          successCriteria: m.evidence,
          studentProducts: [m.celebration]
        })),
        finalProducts: heroData.overview.deliverables,
        assessment: {
          formative: heroData.assessment.formative,
          summative: heroData.assessment.summative,
          rubric: {
            criteria: heroData.assessment.rubric
          }
        },
        impact: {
          audience: heroData.impact.audience,
          measures: heroData.impact.metrics,
          methods: heroData.impact.methods
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Get all as SampleBlueprints for backward compatibility
export function getAllAsBlueprints(userId: string = 'anonymous') {
  return HERO_PROJECTS.map(hero => heroToBlueprint(hero, userId));
}