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