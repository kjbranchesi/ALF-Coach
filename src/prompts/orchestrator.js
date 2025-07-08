// src/prompts/orchestrator.js

import { basePrompt } from './base.js';
import { ageGroupLenses } from './lenses.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from './workflows.js';

/**
 * This is the "Conductor" of our AI. It assembles the final system prompt
 * by layering the base identity, the correct pedagogical lenses, and the
 * specific task workflow based on the application's current state.
 */

/**
 * Builds the system prompt for the initial user onboarding and intake process.
 * @param {string} ageGroup - The age group selected by the user.
 * @returns {string} The fully assembled system prompt for the intake conversation.
 */
export function buildIntakePrompt(ageGroup) {
  const ageLens = ageGroupLenses[ageGroup] || '';
  const intakeTask = getIntakeWorkflow();

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${intakeTask}

    # CONTEXT
    The user has just selected the age group: ${ageGroup}.
    Your task is to follow the IDEATION WORKFLOW precisely, starting with Step 1.
  `;
  return finalSystemPrompt;
}

/**
 * Builds the system prompt for the curriculum development conversation.
 * @param {object} project - The current project object from Firestore.
 * @param {string} curriculumDraft - The current state of the curriculum draft.
 * @param {string} userInput - The user's latest message.
 * @returns {string} The fully assembled system prompt.
 */
export function buildCurriculumPrompt(project, curriculumDraft, userInput) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  // FIX: Pass the project object to the workflow function to prevent the reference error.
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
    ${curriculumDraft || "The curriculum is currently empty."}
    ---
    The educator has just said: "${userInput}"

    Your task is to respond conversationally while also generating the next section of the curriculum based on the user's request, following the CURRICULUM WORKFLOW.
  `;
  return finalSystemPrompt;
}

/**
 * Builds the system prompt for the assignment generation conversation.
 * @param {object} project - The current project object from Firestore.
 * @param {string} userInput - The user's latest message.
 * @returns {string} The fully assembled system prompt.
 */
export function buildAssignmentPrompt(project, userInput) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const assignmentTask = getAssignmentWorkflow();

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
    The user wants help creating an assignment. Their message is: "${userInput}"

    Your task is to follow the Assignment Design Workflow precisely to help the user create a new, well-structured assignment.
  `;
  return finalSystemPrompt;
}
