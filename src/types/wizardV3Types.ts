/**
 * Minimal WizardDataV3 types for normalization
 * Separated from wizardSchema to prevent importing the entire schema
 */

import { Tier } from './alf';

export interface ProjectContext {
  gradeLevel: string;
  subjects: string[];
  studentCount: number;
  timeWindow: string;
  cadence: string;
  availableTech: string[];
  availableMaterials: string[];
  constraints: string[];
  specialPopulations?: string;
  classroomPolicies?: string;
  budget?: 'minimal' | 'moderate' | 'substantial';
  space?: 'classroom' | 'school' | 'community' | 'virtual';
}

export interface StandardsAlignment {
  framework: string;
  code: string;
  label: string;
  rationale: string;
  tier: Tier;
  confidence: number;
}

export interface WizardDataV3 {
  projectTopic?: string;
  projectContext?: ProjectContext;
  bigIdea?: string;
  essentialQuestion?: string;
  learningGoals?: string[];
  successCriteria?: string[];
  standards?: StandardsAlignment[];
  phases?: any[];
  milestones?: any[];
  artifacts?: any[];
  rubrics?: any[];
  studentRoles?: any[];
  differentiation?: any;
  scaffolds?: any[];
  communications?: any;
  exhibition?: any;
  evidencePlan?: any;
  riskManagement?: {
    risks: any[];
    contingencies: any[];
  };
}