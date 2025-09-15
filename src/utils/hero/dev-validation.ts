/**
 * Development-Time Validation for Hero Projects
 *
 * This module provides automatic validation during development to catch
 * data structure issues early. It wraps hero project data with validation
 * and provides helpful error messages.
 */

import {
  validateHeroProject,
  validateFeasibilityData,
  formatValidationResults,
  buildConstraints,
  buildRisk,
  buildContingency,
  ValidatedConstraints,
  ValidatedRisk,
  ValidatedContingency,
} from './validation';
import { HeroProjectData } from './types';

/**
 * Development mode flag
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Console styling for better visibility
 */
const consoleStyles = {
  error: 'color: red; font-weight: bold;',
  warning: 'color: orange; font-weight: bold;',
  success: 'color: green; font-weight: bold;',
  info: 'color: blue;',
};

/**
 * Validates and wraps a hero project with development-time checks
 */
export function wrapHeroProject(data: HeroProjectData): HeroProjectData {
  if (!isDevelopment) {
    return data;
  }

  // Validate the main project structure
  const projectResults = validateHeroProject(data);

  if (!projectResults.valid) {
    console.group(`%c❌ Hero Project Validation Failed: ${data.id}`, consoleStyles.error);
    console.error(formatValidationResults(projectResults));
    console.groupEnd();

    // In development, throw to make issues obvious
    throw new Error(
      `Hero project "${data.id}" has validation errors. Check console for details.`
    );
  }

  if (projectResults.warnings.length > 0) {
    console.group(`%c⚠️ Hero Project Warnings: ${data.id}`, consoleStyles.warning);
    console.warn(formatValidationResults(projectResults));
    console.groupEnd();
  }

  // Log success in development
  console.log(
    `%c✅ Hero project "${data.id}" validated successfully`,
    consoleStyles.success
  );

  return data;
}

/**
 * Extracts and validates feasibility data from a hero project
 */
export function extractFeasibilityData(projectData: HeroProjectData): {
  constraints?: ValidatedConstraints;
  risks?: ValidatedRisk[];
  contingencies?: ValidatedContingency[];
} {
  const result: {
    constraints?: ValidatedConstraints;
    risks?: ValidatedRisk[];
    contingencies?: ValidatedContingency[];
  } = {};

  // Extract constraints from various possible locations
  const constraintSources = [
    projectData.implementation?.gettingStarted,
    projectData.resources?.required,
    // Add more potential sources as needed
  ];

  // Build constraints from available data
  // This is a placeholder - actual extraction logic would depend on your data structure
  const rawConstraints = {
    budgetUSD: 500, // Example default
    techAccess: 'limited' as const,
    materials: projectData.resources?.required
      ?.filter(r => r.type === 'material')
      .map(r => r.name) || [],
    safetyRequirements: [], // Would extract from appropriate source
  };

  try {
    result.constraints = buildConstraints(rawConstraints);
  } catch (error) {
    if (isDevelopment) {
      console.error(`Failed to build constraints for ${projectData.id}:`, error);
    }
  }

  // Extract and validate risks
  // This would need to be adapted based on where risks are stored in your actual data
  const rawRisks: any[] = []; // Placeholder for actual risk extraction

  if (rawRisks.length > 0) {
    result.risks = [];
    rawRisks.forEach((risk, index) => {
      try {
        result.risks!.push(buildRisk(risk));
      } catch (error) {
        if (isDevelopment) {
          console.error(`Failed to build risk ${index} for ${projectData.id}:`, error);
        }
      }
    });
  }

  // Extract and validate contingencies
  const rawContingencies: any[] = []; // Placeholder for actual contingency extraction

  if (rawContingencies.length > 0) {
    result.contingencies = [];
    rawContingencies.forEach((contingency, index) => {
      try {
        result.contingencies!.push(buildContingency(contingency));
      } catch (error) {
        if (isDevelopment) {
          console.error(
            `Failed to build contingency ${index} for ${projectData.id}:`,
            error
          );
        }
      }
    });
  }

  return result;
}

/**
 * Development-time validation hook for React components
 * Use this in components that consume hero project data
 */
export function useHeroProjectValidation(
  projectId: string,
  data: any
): { valid: boolean; errors: string[] } {
  if (!isDevelopment) {
    return { valid: true, errors: [] };
  }

  const results = validateHeroProject(data);

  if (!results.valid) {
    console.group(`%cComponent received invalid hero project: ${projectId}`, consoleStyles.error);
    results.errors.forEach(error => {
      console.error(`  • ${error.path}: ${error.message}`);
      if (error.suggestion) {
        console.log(`    💡 ${error.suggestion}`);
      }
    });
    console.groupEnd();
  }

  return {
    valid: results.valid,
    errors: results.errors.map(e => `${e.path}: ${e.message}`),
  };
}

/**
 * Validates feasibility panel props
 * Use this to ensure components receive correct data
 */
export function validateFeasibilityProps(props: {
  constraints?: any;
  risks?: any[];
  contingencies?: any[];
}): {
  constraints?: ValidatedConstraints;
  risks?: ValidatedRisk[];
  contingencies?: ValidatedContingency[];
} {
  const validated: {
    constraints?: ValidatedConstraints;
    risks?: ValidatedRisk[];
    contingencies?: ValidatedContingency[];
  } = {};

  // Validate and build constraints
  if (props.constraints) {
    try {
      validated.constraints = buildConstraints(props.constraints);
    } catch (error) {
      if (isDevelopment) {
        console.error('Invalid constraints provided to FeasibilityPanel:', error);
        console.log('Received:', props.constraints);
      }
    }
  }

  // Validate and build risks
  if (props.risks && Array.isArray(props.risks)) {
    validated.risks = [];
    props.risks.forEach((risk, index) => {
      try {
        validated.risks!.push(buildRisk(risk));
      } catch (error) {
        if (isDevelopment) {
          console.error(`Invalid risk at index ${index}:`, error);
          console.log('Received:', risk);
        }
      }
    });
  }

  // Validate and build contingencies
  if (props.contingencies && Array.isArray(props.contingencies)) {
    validated.contingencies = [];
    props.contingencies.forEach((contingency, index) => {
      try {
        validated.contingencies!.push(buildContingency(contingency));
      } catch (error) {
        if (isDevelopment) {
          console.error(`Invalid contingency at index ${index}:`, error);
          console.log('Received:', contingency);
        }
      }
    });
  }

  return validated;
}

/**
 * Debug helper to test validation on any data
 */
export function debugValidateData(data: any, type: 'project' | 'feasibility' = 'project'): void {
  if (!isDevelopment) {
    return;
  }

  console.group(`%c🔍 Debug Validation (${type})`, consoleStyles.info);

  if (type === 'project') {
    const results = validateHeroProject(data);
    console.log(formatValidationResults(results));
  } else if (type === 'feasibility') {
    const results = validateFeasibilityData(data);
    console.log(formatValidationResults(results));
  }

  console.log('Raw data:', data);
  console.groupEnd();
}