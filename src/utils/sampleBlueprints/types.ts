/**
 * Shared types for all hero projects
 */

export type SampleBlueprint = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  wizardData: any;
  ideation?: any;
  journey?: any;
  deliverables?: any;
  sample?: boolean;
  assignments?: any[];
  alignment?: any;
  // New required fields for better teacher support
  weeklyReflections?: {
    // Phase-based reflections (adaptive to any project duration)
    discover?: string[];
    define?: string[];
    develop?: string[];
    deliver?: string[];
    // Generic weekly prompts
    weekly?: string[];
  } | string[]; // Allow array for backward compatibility
  troubleshooting?: string[];
  modifications?: {
    struggling?: string;
    advanced?: string;
    ell?: string;
  };
};

export type BuildHero = (userId: string) => SampleBlueprint;

export type HeroProjectMetadata = {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  status: 'complete' | 'planned';
  description: string;
};

// Helper function shared across all hero builders
export function ts(): string {
  return new Date().toISOString();
}