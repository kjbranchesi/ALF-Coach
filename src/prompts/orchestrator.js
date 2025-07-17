// src/prompts/orchestrator.js - COMPLETE FILE (Sprint 1)

import { basePrompt } from './base.js';
import { ageGroupLenses } from './lenses.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from './workflows.js';

/**
 * Sprint 1 Version: Simple orchestrator that works
 */

export function buildIntakePrompt(project, history) {
  // Get age-specific guidance if available
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  
  // Get the workflow for current state
  const intakeTask = getIntakeWorkflow(project, history);

  // Combine base + age lens + specific task
  const finalSystemPrompt = `
${basePrompt}
${ageLens}
${intakeTask}
`;

  return finalSystemPrompt;
}

export function buildCurriculumPrompt(project, history) {
  // Get age-specific guidance if available
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  
  // Get the workflow for current state
  const curriculumTask = getCurriculumWorkflow(project, history);

  // Combine base + age lens + specific task
  const finalSystemPrompt = `
${basePrompt}
${ageLens}
${curriculumTask}
`;

  return finalSystemPrompt;
}

export function buildAssignmentPrompt(project, history) {
  // Get age-specific guidance if available
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  
  // Get the workflow for current state
  const assignmentTask = getAssignmentWorkflow(project, history);

  // Combine base + age lens + specific task
  const finalSystemPrompt = `
${basePrompt}
${ageLens}
${assignmentTask}
`;

  return finalSystemPrompt;
}