// src/prompts/orchestrator.js

import { basePrompt } from './base.js';
import { ageGroupLenses } from './lenses.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from './workflows.js';

/**
 * This is the "Conductor" of our AI. It assembles the final system prompt
 * by layering the base identity, the correct pedagogical lenses, and the
 * specific task workflow based on the application's current state.
 * This file has been updated to fix a critical bug in Phase 3.
 */

/**
 * Builds the system prompt for the initial user onboarding and intake process.
 * @param {object} project - The current project object from Firestore.
 * @returns {string} The fully assembled system prompt for the intake conversation.
 */
export function buildIntakePrompt(project) {
  // FIX: This function now accepts the entire 'project' object to prevent errors.
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  // FIX: The 'project' object is now correctly passed to the workflow.
  const intakeTask = getIntakeWorkflow(project);

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${intakeTask}

    # CONTEXT
    The user is working on a project with the following details:
    - Age Group: ${project.ageGroup}
    - Scope: ${project.scope}
    - Subject: ${project.subject || 'Not specified'}
    - Location: ${project.location || 'Not specified'}

    Your task is to follow the IDEATION WORKFLOW precisely, starting with Step 1.
  `;
  return finalSystemPrompt;
}

/**
 * Builds the system prompt for the curriculum development conversation.
 * @param {object} project - The current project object from Firestore.
 * @returns {string} The fully assembled system prompt.
 */
export function buildCurriculumPrompt(project) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const curriculumTask = getCurriculumWorkflow(project);

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${curriculumTask}

    # CONTEXT
    Project Title: ${project.title}
    Core Idea: ${project.coreIdea}
    Current Curriculum Draft:
    ---
    ${project.curriculumDraft || "The curriculum is currently empty."}
    ---

    Your task is to respond conversationally while also generating the next section of the curriculum based on the user's request, following the CURRICULUM WORKFLOW.
  `;
  return finalSystemPrompt;
}

/**
 * Builds the system prompt for the assignment generation conversation.
 * @param {object} project - The current project object from Firestore.
 * @returns {string} The fully assembled system prompt.
 */
export function buildAssignmentPrompt(project) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const assignmentTask = getAssignmentWorkflow(project);

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${assignmentTask}

    # CONTEXT
    Project Title: ${project.title}
    Curriculum:
    ---
    ${project.curriculumDraft}
    ---
    The user wants help creating an assignment.

    Your task is to follow the Assignment Design Workflow precisely to help the user create a new, well-structured assignment.
  `;
  return finalSystemPrompt;
}