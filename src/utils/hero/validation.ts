/**
 * Hero Project Data Validation and Builder System
 *
 * This module provides comprehensive validation, builders, and type guards
 * to ensure data consistency across all hero projects and prevent runtime errors.
 *
 * Key Features:
 * - Runtime validation with detailed error messages
 * - Type-safe builder functions
 * - Automatic data normalization
 * - Development-time validation helpers
 */

import { HeroProjectData, Phase, Milestone, RubricCriteria, Resource } from './types';

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

/**
 * Valid risk levels - enforced across all components
 * Using 'med' as the canonical form (not 'medium')
 */
export const RISK_LEVELS = {
  LOW: 'low' as const,
  MEDIUM: 'med' as const, // Note: 'med' not 'medium'
  HIGH: 'high' as const,
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

/**
 * Valid tech access levels
 */
export const TECH_ACCESS_LEVELS = {
  FULL: 'full' as const,
  LIMITED: 'limited' as const,
  NONE: 'none' as const,
} as const;

export type TechAccessLevel = typeof TECH_ACCESS_LEVELS[keyof typeof TECH_ACCESS_LEVELS];

/**
 * Valid emphasis levels for standards coverage
 */
export const EMPHASIS_LEVELS = {
  INTRODUCE: 'introduce' as const,
  DEVELOP: 'develop' as const,
  MASTER: 'master' as const,
} as const;

export type EmphasisLevel = typeof EMPHASIS_LEVELS[keyof typeof EMPHASIS_LEVELS];

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validated constraint structure for FeasibilityPanel
 */
export interface ValidatedConstraints {
  budgetUSD?: number;
  techAccess?: TechAccessLevel;
  materials?: string[];
  safetyRequirements?: string[];
}

/**
 * Validated risk structure for FeasibilityPanel
 */
export interface ValidatedRisk {
  id: string;
  name: string; // Must be 'name', not 'risk'
  likelihood: RiskLevel; // Must be 'low' | 'med' | 'high'
  impact: RiskLevel; // Must be 'low' | 'med' | 'high'
  mitigation: string;
}

/**
 * Validated contingency structure for FeasibilityPanel
 */
export interface ValidatedContingency {
  id: string;
  scenario: string; // Must be 'scenario', not 'trigger'
  plan: string;
}

/**
 * Validation result with detailed error information
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Detailed validation error
 */
export interface ValidationError {
  path: string;
  message: string;
  value?: any;
  suggestion?: string;
}

/**
 * Validation warning (non-fatal issues)
 */
export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalizes risk level values to canonical form
 * Handles common variations like 'medium' -> 'med'
 */
export function normalizeRiskLevel(level: string): RiskLevel {
  const normalized = level.toLowerCase().trim();

  const mappings: Record<string, RiskLevel> = {
    'low': RISK_LEVELS.LOW,
    'med': RISK_LEVELS.MEDIUM,
    'medium': RISK_LEVELS.MEDIUM,
    'moderate': RISK_LEVELS.MEDIUM,
    'high': RISK_LEVELS.HIGH,
  };

  const result = mappings[normalized];
  if (!result) {
    throw new Error(
      `Invalid risk level: '${level}'. Must be one of: low, med/medium, high`
    );
  }

  return result;
}

/**
 * Normalizes tech access level to canonical form
 */
export function normalizeTechAccess(access: string): TechAccessLevel {
  const normalized = access.toLowerCase().trim();

  const mappings: Record<string, TechAccessLevel> = {
    'full': TECH_ACCESS_LEVELS.FULL,
    'limited': TECH_ACCESS_LEVELS.LIMITED,
    'partial': TECH_ACCESS_LEVELS.LIMITED,
    'none': TECH_ACCESS_LEVELS.NONE,
    'no': TECH_ACCESS_LEVELS.NONE,
  };

  const result = mappings[normalized];
  if (!result) {
    throw new Error(
      `Invalid tech access level: '${access}'. Must be one of: full, limited, none`
    );
  }

  return result;
}

// ============================================================================
// BUILDER FUNCTIONS
// ============================================================================

/**
 * Builds a validated constraint object
 */
export function buildConstraints(input: any): ValidatedConstraints {
  const constraints: ValidatedConstraints = {};

  if (input?.budgetUSD !== undefined) {
    const budget = Number(input.budgetUSD);
    if (isNaN(budget) || budget < 0) {
      throw new Error(`Invalid budget: ${input.budgetUSD}. Must be a positive number.`);
    }
    constraints.budgetUSD = budget;
  }

  if (input?.techAccess !== undefined) {
    constraints.techAccess = normalizeTechAccess(input.techAccess);
  }

  if (input?.materials !== undefined) {
    if (!Array.isArray(input.materials)) {
      throw new Error('Materials must be an array of strings');
    }
    constraints.materials = input.materials.map(String).filter(Boolean);
  }

  if (input?.safetyRequirements !== undefined) {
    if (!Array.isArray(input.safetyRequirements)) {
      throw new Error('Safety requirements must be an array of strings');
    }
    constraints.safetyRequirements = input.safetyRequirements.map(String).filter(Boolean);
  }

  return constraints;
}

/**
 * Builds a validated risk object
 */
export function buildRisk(input: any): ValidatedRisk {
  if (!input?.id) {
    throw new Error('Risk must have an id');
  }

  // Handle both 'name' and 'risk' properties for backwards compatibility
  const name = input.name || input.risk;
  if (!name) {
    throw new Error('Risk must have a name property');
  }

  if (!input.likelihood) {
    throw new Error('Risk must have a likelihood');
  }

  if (!input.impact) {
    throw new Error('Risk must have an impact');
  }

  if (!input.mitigation) {
    throw new Error('Risk must have a mitigation strategy');
  }

  return {
    id: String(input.id),
    name: String(name),
    likelihood: normalizeRiskLevel(input.likelihood),
    impact: normalizeRiskLevel(input.impact),
    mitigation: String(input.mitigation),
  };
}

/**
 * Builds a validated contingency object
 */
export function buildContingency(input: any): ValidatedContingency {
  if (!input?.id) {
    throw new Error('Contingency must have an id');
  }

  // Handle both 'scenario' and 'trigger' properties for backwards compatibility
  const scenario = input.scenario || input.trigger;
  if (!scenario) {
    throw new Error('Contingency must have a scenario property');
  }

  if (!input.plan) {
    throw new Error('Contingency must have a plan');
  }

  return {
    id: String(input.id),
    scenario: String(scenario),
    plan: String(input.plan),
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a complete hero project data structure
 */
export function validateHeroProject(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required top-level fields
  const requiredFields = ['id', 'title', 'duration', 'gradeLevel', 'subjects'];
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push({
        path: field,
        message: `Missing required field: ${field}`,
        suggestion: `Add a ${field} property to your hero project data`,
      });
    }
  }

  // Validate subjects array
  if (data.subjects && !Array.isArray(data.subjects)) {
    errors.push({
      path: 'subjects',
      message: 'Subjects must be an array',
      value: data.subjects,
      suggestion: 'Wrap subjects in an array, e.g., ["Math", "Science"]',
    });
  }

  // Validate theme if present
  if (data.theme) {
    const themeFields = ['primary', 'secondary', 'accent', 'gradient'];
    for (const field of themeFields) {
      if (!data.theme[field]) {
        warnings.push({
          path: `theme.${field}`,
          message: `Missing theme field: ${field}`,
          suggestion: `Add a ${field} color to your theme object`,
        });
      }
    }
  }

  // Validate hero section
  if (data.hero) {
    if (!data.hero.description) {
      errors.push({
        path: 'hero.description',
        message: 'Hero section must have a description',
      });
    }

    if (data.hero.highlights && !Array.isArray(data.hero.highlights)) {
      errors.push({
        path: 'hero.highlights',
        message: 'Hero highlights must be an array',
      });
    }
  }

  // Validate journey phases
  if (data.journey?.phases) {
    if (!Array.isArray(data.journey.phases)) {
      errors.push({
        path: 'journey.phases',
        message: 'Journey phases must be an array',
      });
    } else {
      data.journey.phases.forEach((phase: any, index: number) => {
        if (!phase.name) {
          errors.push({
            path: `journey.phases[${index}].name`,
            message: `Phase ${index + 1} must have a name`,
          });
        }
        if (!phase.duration) {
          errors.push({
            path: `journey.phases[${index}].duration`,
            message: `Phase ${index + 1} must have a duration`,
          });
        }
      });
    }
  }

  // Validate standards alignments
  if (data.standards?.alignments) {
    for (const [family, standards] of Object.entries(data.standards.alignments)) {
      if (!Array.isArray(standards)) {
        errors.push({
          path: `standards.alignments.${family}`,
          message: `Standards for ${family} must be an array`,
          value: standards,
        });
      } else {
        (standards as any[]).forEach((std, index) => {
          if (!std.code) {
            errors.push({
              path: `standards.alignments.${family}[${index}].code`,
              message: `Standard must have a code`,
            });
          }
          if (!std.text) {
            errors.push({
              path: `standards.alignments.${family}[${index}].text`,
              message: `Standard must have text`,
            });
          }
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates feasibility panel data
 */
export function validateFeasibilityData(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate constraints
  if (data.constraints) {
    try {
      buildConstraints(data.constraints);
    } catch (error: any) {
      errors.push({
        path: 'constraints',
        message: error.message,
        value: data.constraints,
      });
    }
  }

  // Validate risks
  if (data.risks) {
    if (!Array.isArray(data.risks)) {
      errors.push({
        path: 'risks',
        message: 'Risks must be an array',
        value: data.risks,
      });
    } else {
      data.risks.forEach((risk: any, index: number) => {
        try {
          buildRisk(risk);
        } catch (error: any) {
          errors.push({
            path: `risks[${index}]`,
            message: error.message,
            value: risk,
            suggestion: 'Ensure risk has: id, name (not "risk"), likelihood (low/med/high), impact (low/med/high), and mitigation',
          });
        }
      });
    }
  }

  // Validate contingencies
  if (data.contingencies) {
    if (!Array.isArray(data.contingencies)) {
      errors.push({
        path: 'contingencies',
        message: 'Contingencies must be an array',
        value: data.contingencies,
      });
    } else {
      data.contingencies.forEach((contingency: any, index: number) => {
        try {
          buildContingency(contingency);
        } catch (error: any) {
          errors.push({
            path: `contingencies[${index}]`,
            message: error.message,
            value: contingency,
            suggestion: 'Ensure contingency has: id, scenario (not "trigger"), and plan',
          });
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats validation results for console output
 */
export function formatValidationResults(results: ValidationResult): string {
  const lines: string[] = [];

  if (results.valid) {
    lines.push('✅ Validation passed!');
  } else {
    lines.push('❌ Validation failed with errors:');
  }

  if (results.errors.length > 0) {
    lines.push('\nErrors:');
    results.errors.forEach((error, index) => {
      lines.push(`  ${index + 1}. ${error.path}: ${error.message}`);
      if (error.value !== undefined) {
        lines.push(`     Current value: ${JSON.stringify(error.value)}`);
      }
      if (error.suggestion) {
        lines.push(`     💡 Suggestion: ${error.suggestion}`);
      }
    });
  }

  if (results.warnings.length > 0) {
    lines.push('\nWarnings:');
    results.warnings.forEach((warning, index) => {
      lines.push(`  ${index + 1}. ${warning.path}: ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`     💡 Suggestion: ${warning.suggestion}`);
      }
    });
  }

  return lines.join('\n');
}

/**
 * Development-time validation helper
 * Throws an error if validation fails in development
 */
export function assertValidHeroProject(data: any, projectId: string): void {
  if (process.env.NODE_ENV === 'development') {
    const results = validateHeroProject(data);
    if (!results.valid) {
      console.error(`Hero Project Validation Failed: ${projectId}`);
      console.error(formatValidationResults(results));
      throw new Error(`Invalid hero project data for ${projectId}. See console for details.`);
    }

    if (results.warnings.length > 0) {
      console.warn(`Hero Project Validation Warnings: ${projectId}`);
      console.warn(formatValidationResults(results));
    }
  }
}

/**
 * Type guard for ValidatedRisk
 */
export function isValidRisk(value: any): value is ValidatedRisk {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (value.likelihood === 'low' || value.likelihood === 'med' || value.likelihood === 'high') &&
    (value.impact === 'low' || value.impact === 'med' || value.impact === 'high') &&
    typeof value.mitigation === 'string'
  );
}

/**
 * Type guard for ValidatedContingency
 */
export function isValidContingency(value: any): value is ValidatedContingency {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.scenario === 'string' &&
    typeof value.plan === 'string'
  );
}

/**
 * Type guard for ValidatedConstraints
 */
export function isValidConstraints(value: any): value is ValidatedConstraints {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.budgetUSD === undefined || typeof value.budgetUSD === 'number') &&
    (value.techAccess === undefined ||
      value.techAccess === 'full' ||
      value.techAccess === 'limited' ||
      value.techAccess === 'none') &&
    (value.materials === undefined || Array.isArray(value.materials)) &&
    (value.safetyRequirements === undefined || Array.isArray(value.safetyRequirements))
  );
}