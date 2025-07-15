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
 * @param {Array<object>} history - The current chat history for this stage.
 * @returns {string} The fully assembled system prompt for the intake conversation.
 */
export function buildIntakePrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  // Pass the history to the workflow so it can be state-aware.
  const intakeTask = getIntakeWorkflow(project, history);

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${intakeTask}

    # CONTEXT
    The user is working on a project with the following details:
    - Age Group: ${project.ageGroup}
    - Scope: ${project.scope || 'Not specified'}
    - Subject: ${project.subject || 'Not specified'}
    - Location: ${project.location || 'Not specified'}
    - Educator's Perspective: "${project.educatorPerspective}"
    - Initial Materials: ${project.initialMaterials || 'None provided'}

    # CRITICAL INSTRUCTION
    You MUST acknowledge and build upon the educator's input above. Do not act as if you don't know what their project is about.
    The educator has already told you about their ${project.subject} project. Honor their input and personalize every response.
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
    Challenge: ${project.challenge}
    Age Group: ${project.ageGroup}
    Current Curriculum Draft:
    ---
    ${project.curriculumDraft || "The curriculum is currently empty."}
    ---

    Your task is to respond conversationally while also generating the next section of the curriculum based on the user's request, following the CURRICULUM WORKFLOW.
    Every response should be specific to the ${project.title} project and appropriate for ${project.ageGroup} learners.
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
    Core Idea: ${project.coreIdea}
    Challenge: ${project.challenge}
    Age Group: ${project.ageGroup}
    Curriculum:
    ---
    ${project.curriculumDraft}
    ---
    The user wants help creating an assignment.

    Your task is to follow the Assignment Design Workflow precisely to help the user create a new, well-structured assignment.
    Ensure all assignments directly connect to the ${project.title} project's goals and are authentic assessments for ${project.ageGroup} learners.
  `;
  return finalSystemPrompt;
}