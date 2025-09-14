/**
 * Hero Projects - 9 World-Class PBL Examples
 * These represent the gold standard of what educators can create with ALF Coach
 *
 * This is the main orchestrator file that maintains the public API
 */

import type { SampleBlueprint } from './sampleBlueprints/types';
import { ts } from './sampleBlueprints/types';
import {
  buildSustainabilityHero,
  buildCommunityHistoryHero,
  buildAssistiveTechHero
} from './sampleBlueprints/index';

/**
 * 9 Hero Projects - Carefully curated to showcase platform capabilities
 * Covering different subjects, grade levels, and PBL approaches
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
    id: 'hero-math-city-planning',
    title: 'Reimagining Our City: Urban Planning Through Mathematics',
    subject: 'Mathematics',
    gradeLevel: 'High School',
    status: 'planned' as const,
    description: 'Students use mathematical modeling to redesign city spaces for accessibility'
  },
  {
    id: 'hero-literacy-childrens-books',
    title: 'Authors for Change: Writing Books That Matter',
    subject: 'Language Arts',
    gradeLevel: 'Elementary',
    status: 'planned' as const,
    description: 'Students write and illustrate children\'s books addressing social-emotional themes'
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
    id: 'hero-health-wellness',
    title: 'Wellness Warriors: Designing a Healthier School',
    subject: 'Health/PE',
    gradeLevel: 'Elementary',
    status: 'planned' as const,
    description: 'Students research and implement school-wide wellness initiatives'
  },
  {
    id: 'hero-arts-social-justice',
    title: 'Art as Voice: Creating for Social Change',
    subject: 'Visual Arts',
    gradeLevel: 'High School',
    status: 'planned' as const,
    description: 'Students create public art installations addressing community issues'
  },
  {
    id: 'hero-science-water-quality',
    title: 'Water Guardians: Protecting Our Local Watershed',
    subject: 'Biology/Chemistry',
    gradeLevel: 'Middle School',
    status: 'planned' as const,
    description: 'Students monitor water quality and advocate for watershed protection'
  },
  {
    id: 'hero-music-cultural-bridge',
    title: 'Harmony Across Cultures: Building Bridges Through Music',
    subject: 'Music/World Languages',
    gradeLevel: 'Elementary',
    status: 'planned' as const,
    description: 'Students explore world music traditions and create multicultural performances'
  }
];

// Placeholder function for future hero projects
function buildHeroProjectPlaceholder(projectConfig: typeof HERO_PROJECTS[0], userId: string): SampleBlueprint {
  const wizardData = {
    projectTopic: projectConfig.title,
    learningGoals: 'To be developed with subject matter experts',
    entryPoint: 'authentic_problem',
    subjects: [projectConfig.subject.toLowerCase().replace(' ', '-')],
    primarySubject: projectConfig.subject.toLowerCase(),
    gradeLevel: projectConfig.gradeLevel.toLowerCase().replace(' school', ''),
    duration: 'medium',
    subject: projectConfig.subject,
    location: 'various',
    featured: true,
    heroProject: true,
    status: 'planned'
  };

  const ideation = {
    bigIdea: projectConfig.description,
    essentialQuestion: 'To be developed',
    challenge: 'Coming soon - this hero project will demonstrate world-class PBL'
  };

  return {
    id: projectConfig.id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData,
    ideation,
    journey: { phases: [], activities: [], resources: [] },
    deliverables: { milestones: [], rubric: { criteria: [] }, impact: {} },
    sample: true,
    weeklyReflections: {
      discover: ['To be developed based on discovery phase'],
      define: ['To be developed based on define phase'],
      develop: ['To be developed based on develop phase'],
      deliver: ['To be developed based on deliver phase'],
      weekly: ['Generic weekly reflections to be added']
    },
    troubleshooting: ['Common challenges and solutions will be added'],
    modifications: {
      struggling: 'Scaffolding strategies to be developed',
      advanced: 'Extension activities to be developed',
      ell: 'Language support strategies to be developed'
    }
  };
}

// Main export function - returns only the 9 hero projects
export function getAllSampleBlueprints(userId: string = 'anonymous'): SampleBlueprint[] {
  const samples: SampleBlueprint[] = [];

  // Add the complete sustainability hero project
  samples.push(buildSustainabilityHero(userId));

  // Add the complete community history hero project
  samples.push(buildCommunityHistoryHero(userId));

  // Add the complete assistive tech hero project
  samples.push(buildAssistiveTechHero(userId));

  // Add placeholders for the remaining hero projects
  HERO_PROJECTS.slice(3).forEach(project => {
    samples.push(buildHeroProjectPlaceholder(project, userId));
  });

  return samples;
}

// Function to get a specific sample blueprint by ID
export function makeSampleBlueprint(id: string, userId: string = 'anonymous'): SampleBlueprint {
  // Check which specific hero is requested
  switch(id) {
    case 'hero-sustainability-campaign':
      return buildSustainabilityHero(userId);
    case 'hero-community-history':
      return buildCommunityHistoryHero(userId);
    case 'hero-assistive-tech':
      return buildAssistiveTechHero(userId);
    default:
      // For any placeholder projects, return from getAllSampleBlueprints
      const allSamples = getAllSampleBlueprints(userId);
      const requested = allSamples.find(s => s.id === id);
      return requested || buildSustainabilityHero(userId); // Fallback to sustainability if not found
  }
}

// Export hero projects metadata for gallery display
export function getHeroProjectsMetadata() {
  return HERO_PROJECTS;
}

// Re-export the SampleBlueprint type for external use
export type { SampleBlueprint } from './sampleBlueprints/types';