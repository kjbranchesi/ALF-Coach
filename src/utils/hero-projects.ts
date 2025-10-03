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

import type { HeroProjectData } from './hero/types';
import {
  listGeneratedHeroProjects,
  getGeneratedHeroProject,
  getGeneratedHeroManifest
} from '../data/generated/hero/loader';

const heroImageModules: Record<string, string> = (() => {
  try {
    return import.meta.glob('./hero/images/*', {
      eager: true,
      import: 'default'
    });
  } catch {
    return {};
  }
})();

function resolveHeroImage(imagePath?: string) {
  if (!imagePath) {return undefined;}
  if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('/')) {
    return imagePath;
  }

  const normalized = imagePath.replace(/^\.\//, '').replace(/^src\//, '');
  const heroRelative = normalized.includes('hero/')
    ? normalized.slice(normalized.indexOf('hero/'))
    : normalized;

  const candidateKeys = [`./${heroRelative}`, `../${normalized}`];
  for (const key of candidateKeys) {
    const resolved = heroImageModules[key];
    if (resolved) {return resolved;}
  }

  for (const [key, value] of Object.entries(heroImageModules)) {
    if (key.endsWith(heroRelative)) {
      return value;
    }
  }

  if (typeof import.meta !== 'undefined' && typeof import.meta.url === 'string') {
    try {
      return new URL(`./${heroRelative}`, import.meta.url).href;
    } catch {
      // ignore and fall back to original image path
    }
  }

  return imagePath;
}

function hydrateHeroProject(project: HeroProjectData): HeroProjectData {
  const resolvedImage = resolveHeroImage(project.image);
  if (resolvedImage && resolvedImage !== project.image) {
    return {
      ...project,
      image: resolvedImage
    };
  }
  return project;
}

const manifest = getGeneratedHeroManifest();

const PROJECT_RECORDS: Record<string, HeroProjectData> = Object.fromEntries(
  listGeneratedHeroProjects()
    .map(entry => {
      const project = getGeneratedHeroProject(entry.id);
      if (!project) {
        console.warn(`Hero project ${entry.id} missing from generated data`);
        return null;
      }
      return [entry.id, hydrateHeroProject(project)];
    })
    .filter((entry): entry is [string, HeroProjectData] => Array.isArray(entry))
);

// Single registry - array view for backwards compatibility
export const HERO_PROJECTS: HeroProjectData[] = manifest.projects
  .map(entry => PROJECT_RECORDS[entry.id])
  .filter((project): project is HeroProjectData => Boolean(project));

// Helper functions
export function getHeroProject(id: string): HeroProjectData | undefined {
  return PROJECT_RECORDS[id];
}

export function getAllHeroProjects(): HeroProjectData[] {
  return HERO_PROJECTS;
}

// Get metadata for gallery display (no complex mapping needed)
export function getHeroProjectsMetadata() {
  return manifest.projects.map(entry => {
    const project = PROJECT_RECORDS[entry.id];
    return {
      id: entry.id,
      title: entry.title,
      subject: project?.subjects.join(', ') ?? entry.subjects.join(', '),
      gradeLevel: entry.gradeLevel,
      description: project?.hero.description ?? '',
      duration: entry.duration,
      status: 'complete' as const,
      featured: true,
      image: resolveHeroImage(project?.image)
    };
  });
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
