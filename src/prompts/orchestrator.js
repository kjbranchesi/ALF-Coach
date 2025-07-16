// src/prompts/orchestrator.js

import { basePrompt } from './base.js';
import { ageGroupLenses } from './lenses.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from './workflows.js';

/**
 * Enhanced orchestrator that passes conversation summary to workflows
 */

/**
 * Creates a brief summary of the conversation progress
 */
function createConversationSummary(history) {
  if (!history || history.length === 0) return '';
  
  const summary = {
    messageCount: history.length,
    userMessages: history.filter(m => m.role === 'user').length,
    hasGuideInteraction: history.some(m => m.interactionType === 'Guide'),
    hasFramework: history.some(m => m.frameworkOverview !== null),
    lastInteractionType: history[history.length - 1]?.interactionType || 'Unknown',
    // Extract key decisions
    keyPoints: []
  };

  // Find important moments
  history.forEach((msg, index) => {
    if (msg.role === 'assistant' && msg.suggestions?.length > 0) {
      const nextUserMsg = history[index + 1];
      if (nextUserMsg?.role === 'user') {
        summary.keyPoints.push(`User selected: "${nextUserMsg.chatResponse?.slice(0, 50)}..."`);
      }
    }
  });

  return `
## CONVERSATION STATUS
- Total exchanges: ${summary.messageCount} messages
- User has ${summary.hasGuideInteraction ? 'received guidance' : 'been working independently'}
- Key decisions: ${summary.keyPoints.join('; ') || 'None yet'}
`;
}

export function buildIntakePrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const conversationSummary = createConversationSummary(history);
  const intakeTask = getIntakeWorkflow(project, history);

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${conversationSummary}
    ${intakeTask}

    # PROJECT CONTEXT (CRITICAL - USE THIS!)
    The educator has provided:
    - Subject Area: ${project.subject}
    - Target Learners: ${project.ageGroup}
    - Their Vision: "${project.educatorPerspective}"
    - Resources: ${project.initialMaterials || 'None specified yet'}
    
    # REMEMBER
    - This is about THEIR ${project.subject} project, not a generic project
    - They've already told you what they want to work on
    - Build on their specific ideas, don't start from scratch
  `;
  return finalSystemPrompt;
}

export function buildCurriculumPrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const conversationSummary = createConversationSummary(history);
  const curriculumTask = getCurriculumWorkflow(project, history);

  // Extract phase information if available
  const phaseCount = (project.curriculumDraft?.match(/### Phase/g) || []).length;
  const hasDetails = project.curriculumDraft?.includes('Objectives:') || false;

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${conversationSummary}
    ${curriculumTask}

    # PROJECT STATUS
    - Title: ${project.title}
    - Core Challenge: ${project.challenge}
    - Big Idea: ${project.coreIdea}
    - Phases Defined: ${phaseCount} phases
    - Details Added: ${hasDetails ? 'Some details present' : 'No details yet'}
    
    # CURRENT CURRICULUM DRAFT
    \`\`\`markdown
    ${project.curriculumDraft || 'No curriculum structure yet - help them define 2-4 phases.'}
    \`\`\`

    # CRITICAL
    - Always return the COMPLETE curriculumDraft, not just changes
    - Maintain all existing content when adding new details
    - Format with ### for phase headers
  `;
  return finalSystemPrompt;
}

export function buildAssignmentPrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const conversationSummary = createConversationSummary(history);
  const assignmentTask = getAssignmentWorkflow(project);

  const existingAssignments = project.assignments?.map(a => a.title).join(', ') || 'None';

  const finalSystemPrompt = `
    ${basePrompt}
    ${ageLens}
    ${conversationSummary}
    ${assignmentTask}

    # PROJECT CONTEXT
    - Title: ${project.title}
    - Challenge: ${project.challenge}
    - For: ${project.ageGroup} learners
    - Existing Assignments: ${existingAssignments}
    
    # CURRICULUM PHASES
    ${project.curriculumDraft ? 'The learning journey includes:\n' + project.curriculumDraft.slice(0, 300) + '...' : 'No curriculum defined yet'}
    
    # FOCUS
    - Create assignments that directly address "${project.challenge}"
    - Ensure authentic assessment for ${project.ageGroup}
    - Connect to real-world application
  `;
  return finalSystemPrompt;
}