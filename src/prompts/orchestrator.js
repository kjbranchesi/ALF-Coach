// src/prompts/orchestrator.js - ENHANCED VERSION

import { basePrompt } from './base.js';
import { ageGroupLenses } from './lenses.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from './workflows.js';

/**
 * Enhanced orchestrator with better context flow and error handling
 */

/**
 * Creates a detailed conversation summary with key decisions
 */
function createConversationSummary(history) {
  if (!history || history.length === 0) return '';
  
  const summary = {
    messageCount: history.length,
    userMessages: history.filter(m => m.role === 'user').length,
    hasGuideInteraction: history.some(m => m.interactionType === 'Guide'),
    hasFramework: history.some(m => m.frameworkOverview !== null),
    lastInteractionType: history[history.length - 1]?.interactionType || 'Unknown',
    keyDecisions: [],
    userChoices: []
  };

  // Extract key user decisions
  history.forEach((msg, index) => {
    if (msg.role === 'assistant' && msg.suggestions?.length > 0) {
      const nextUserMsg = history[index + 1];
      if (nextUserMsg?.role === 'user') {
        summary.userChoices.push({
          offered: msg.suggestions.length,
          selected: nextUserMsg.chatResponse?.slice(0, 50) + '...'
        });
      }
    }
    
    // Track important milestones
    if (msg.role === 'assistant' && msg.summary) {
      summary.keyDecisions.push('Project vision defined');
    }
  });

  return `
## CONVERSATION PROGRESS
- Total exchanges: ${summary.messageCount} messages (${summary.userMessages} from educator)
- Interaction style: ${summary.hasGuideInteraction ? 'Guided exploration' : 'Open dialogue'}
- Key choices made: ${summary.userChoices.length}
${summary.keyDecisions.length > 0 ? '- Milestones: ' + summary.keyDecisions.join(', ') : ''}

## EDUCATOR ENGAGEMENT LEVEL
${summary.userMessages < 3 ? '- Early stage: Focus on encouragement and concrete examples' : 
  summary.userMessages < 6 ? '- Building momentum: Deepen the exploration' :
  '- Highly engaged: Push toward completion and excellence'}
`;
}

/**
 * Enhanced prompt builder for Ideation stage
 */
export function buildIntakePrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const conversationSummary = createConversationSummary(history);
  const intakeTask = getIntakeWorkflow(project, history);

  // Add specific guidance about their materials if provided
  const materialsContext = project.initialMaterials ? `
## MATERIALS TO INCORPORATE
The educator has mentioned these resources: "${project.initialMaterials}"
Weave these naturally into your suggestions and guidance.` : '';

  const finalSystemPrompt = `
${basePrompt}
${ageLens}
${conversationSummary}
${intakeTask}

# PROJECT CONTEXT FOR PERSONALIZATION
The educator is passionate about: "${project.educatorPerspective}"
They're teaching: ${project.subject} to ${project.ageGroup}
${materialsContext}

# QUALITY CHECKLIST
Before responding, ensure:
1. Your suggestions build directly on THEIR vision, not generic ideas
2. You offer an "escape hatch" if suggestions don't resonate
3. You explain the pedagogical "why" behind suggestions
4. You maintain momentum - no unnecessary steps
5. You end with an inviting question

# COMMON ERRORS TO AVOID
- Don't use placeholder brackets like [specific activity]
- Don't ask what subject they teach (they already told you: ${project.subject})
- Don't be generic - be specific to ${project.subject} and ${project.ageGroup}
`;
  return finalSystemPrompt;
}

/**
 * Enhanced prompt builder for Curriculum stage
 */
export function buildCurriculumPrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const conversationSummary = createConversationSummary(history);
  const curriculumTask = getCurriculumWorkflow(project, history);

  // Calculate curriculum completeness
  const currentDraft = project.curriculumDraft || "";
  const phaseCount = (currentDraft.match(/### Phase/g) || []).length;
  const hasObjectives = currentDraft.includes('Objectives:');
  const hasActivities = currentDraft.includes('Activities:') || currentDraft.includes('Week');
  const completenessScore = (phaseCount > 0 ? 33 : 0) + (hasObjectives ? 33 : 0) + (hasActivities ? 34 : 0);

  const curriculumStatus = `
## CURRICULUM COMPLETENESS: ${completenessScore}%
- Phases defined: ${phaseCount} ${phaseCount === 0 ? '(Need 2-4 phases)' : '✓'}
- Learning objectives: ${hasObjectives ? '✓ Present' : '○ Missing'}
- Activities planned: ${hasActivities ? '✓ Present' : '○ Missing'}
`;

  const finalSystemPrompt = `
${basePrompt}
${ageLens}
${conversationSummary}
${curriculumTask}

# LIVE PROJECT DATA (USE THIS!)
- Title: "${project.title}"
- Big Idea: "${project.coreIdea}"
- Challenge: "${project.challenge}"
- For: ${project.ageGroup} studying ${project.subject}
- Context: "${project.educatorPerspective}"

${curriculumStatus}

# CURRENT CURRICULUM DRAFT
\`\`\`markdown
${currentDraft || 'No phases defined yet. Start by proposing 2-4 phases.'}
\`\`\`

# CRITICAL INSTRUCTIONS
1. ALWAYS return the COMPLETE curriculumDraft in your response
2. Use REAL content from the project context above, not placeholders
3. When you see [bracket] placeholders, REPLACE them with actual content
4. Each phase should clearly build toward solving: "${project.challenge}"
5. Activities should be specific to ${project.subject}, not generic

# QUALITY CHECKLIST
- Are all phases connected to "${project.coreIdea}"?
- Do activities match ${project.ageGroup} developmental level?
- Is the progression logical toward solving "${project.challenge}"?
- Have you included specific ${project.subject} content, not generic placeholders?
`;
  return finalSystemPrompt;
}

/**
 * Enhanced prompt builder for Assignments stage
 */
export function buildAssignmentPrompt(project, history) {
  const ageLens = ageGroupLenses[project.ageGroup] || '';
  const conversationSummary = createConversationSummary(history);
  const assignmentTask = getAssignmentWorkflow(project, history);

  // Extract key curriculum elements for context
  const curriculumSummary = project.curriculumDraft ? 
    project.curriculumDraft.split('\n')
      .filter(line => line.includes('Phase') || line.includes('Big Question'))
      .slice(0, 6)
      .join('\n') : 'No curriculum defined';

  const existingAssignments = project.assignments?.map(a => `- ${a.title}: ${a.description.slice(0, 50)}...`).join('\n') || 'None yet';

  const finalSystemPrompt = `
${basePrompt}
${ageLens}
${conversationSummary}
${assignmentTask}

# PROJECT CULMINATION CONTEXT
We're creating assessments for: "${project.title}"
The journey explores: "${project.coreIdea}"
Students will solve: "${project.challenge}"
Designed for: ${project.ageGroup} in ${project.subject}

# CURRICULUM JOURNEY (for alignment)
${curriculumSummary}

# EXISTING ASSIGNMENTS
${existingAssignments}

# AUTHENTIC ASSESSMENT PRINCIPLES
For ${project.ageGroup}, authentic assessment means:
- Work that ${project.subject} professionals actually do
- Audience beyond the teacher (community, experts, peers)
- Creating something that matters for "${project.challenge}"
- Multiple ways to demonstrate understanding

# QUALITY CHECKLIST
Before creating an assignment, ensure:
1. It directly addresses "${project.challenge}"
2. It's appropriate for ${project.ageGroup} capabilities
3. It connects to real ${project.subject} work
4. The rubric measures understanding, not just compliance
5. Students can be proud to share it publicly

# AVOID THESE PITFALLS
- Generic assignments that could fit any subject
- Traditional tests disguised as "projects"
- Rubrics that only measure following directions
- Work without authentic audience or purpose
`;
  return finalSystemPrompt;
}