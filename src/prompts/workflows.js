// src/prompts/workflows.js - COMPLETE FILE (Sprint 1: Simple & Working)

/**
 * Sprint 1 Version: Get everything working with minimal complexity
 * Focus: Valid JSON responses and proper stage progression
 */

// --- 1. Ideation Workflow ---
export const getIntakeWorkflow = (project, history = []) => {
  const messageCount = history ? history.length : 0;
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  
  // Check if we have enough to complete the stage
  const conversationText = history.map(m => m.chatResponse || '').join(' ').toLowerCase();
  const hasSustainabilityFocus = conversationText.includes('sustainability') && messageCount > 4;
  const hasUserEngagement = messageCount > 5;

  const baseInstructions = `
# STAGE 1: IDEATION
You are helping create a project about ${project.subject} for ${project.ageGroup}.

## CRITICAL RULES
1. Return ONLY valid JSON - no text before or after
2. Use actual content, not placeholders with brackets
3. Every field must exist (use null if not applicable)

## CONTEXT
- Subject: ${project.subject}
- Age Group: ${project.ageGroup}
- Vision: "${project.educatorPerspective}"
- Current conversation: ${messageCount} messages
`;

  // Welcome message (already in your Firebase, but kept for new projects)
  if (messageCount === 0) {
    return baseInstructions + `
Return exactly this structure:
{
  "interactionType": "Welcome",
  "currentStage": "Ideation",
  "chatResponse": "Welcome! I'm excited to help you develop your ${project.subject} project. Your vision - '${project.educatorPerspective}' - has real potential. I can see this becoming a powerful learning experience for your ${project.ageGroup} students.\\n\\nI'd love to help you shape this into a compelling project. Would you like me to suggest some creative directions based on your vision, or would you prefer to tell me more about what you have in mind?",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["Show me creative directions", "Let me explain my ideas first"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Provide suggestions when asked
  if (lastUserMsg.includes("creative directions") || lastUserMsg.includes("examples")) {
    return baseInstructions + `
Provide 3 specific suggestions for their ${project.subject} project.

Return this structure:
{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "Based on your vision about '${project.educatorPerspective}' and teaching ${project.subject} to ${project.ageGroup}, here are three compelling directions we could explore:",
  "isStageComplete": false,
  "summary": null,
  "suggestions": [
    "Create a ${project.subject} project investigating real-world applications of ${project.educatorPerspective || 'this topic'} in contemporary society",
    "Design an inquiry where students analyze how ${project.subject} concepts shape current debates and policies",
    "Develop a creative challenge where students become consultants solving authentic ${project.subject}-related problems"
  ],
  "buttons": ["I need different ideas", "Let's build on one of these"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Complete the stage if we have enough conversation
  if ((hasSustainabilityFocus || hasUserEngagement) && !lastUserMsg.includes("different")) {
    return baseInstructions + `
Time to complete the ideation stage. Create a summary based on the conversation.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Excellent work! Based on our discussion about ${project.subject} and sustainability, let me summarize what we've developed:\\n\\n**Big Idea:** Corporate sustainability initiatives are shaped by economic pressures, consumer demands, and environmental concerns.\\n\\n**Challenge:** How can companies like Frito-Lay balance profitability with genuine environmental sustainability in global operations?\\n\\nThis framework will create a powerful learning experience for your ${project.ageGroup} students. Ready to design the learning journey?",
  "isStageComplete": true,
  "summary": {
    "title": "Sustainability in the Snack Food Industry",
    "abstract": "Students investigate how major corporations balance profit with environmental responsibility, using Frito-Lay as a case study in modern corporate sustainability.",
    "coreIdea": "Corporate sustainability initiatives are shaped by economic pressures, consumer demands, and environmental concerns",
    "challenge": "How can companies like Frito-Lay balance profitability with genuine environmental sustainability in global operations?"
  },
  "suggestions": null,
  "buttons": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Default conversation continuation
  return baseInstructions + `
Continue the conversation about their ${project.subject} project.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "[Respond to their last message about ${project.subject}, helping them develop a Big Idea and Challenge. End with a question.]",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
};

// --- 2. Learning Journey Workflow ---
export const getCurriculumWorkflow = (project, history = []) => {
  const messageCount = history ? history.length : 0;
  const currentDraft = project.curriculumDraft || "";
  const hasPhases = currentDraft.includes("### Phase");
  
  const baseInstructions = `
# STAGE 2: LEARNING JOURNEY
You are designing curriculum for "${project.title}".

## CRITICAL RULES
1. Return ONLY valid JSON
2. Always include the COMPLETE curriculumDraft field
3. Use real content based on: ${project.coreIdea}

## PROJECT CONTEXT
- Title: ${project.title}
- Challenge: ${project.challenge}
- Big Idea: ${project.coreIdea}
- For: ${project.ageGroup}
`;

  // First message when entering curriculum stage
  if (messageCount === 0) {
    return baseInstructions + `
Welcome them to curriculum design.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Great! Now let's design the learning journey for '${project.title}'.\\n\\nWe'll create a path that guides your ${project.ageGroup} students toward solving: '${project.challenge}'\\n\\nI suggest structuring this as a 3-phase journey. Does that work for your timeline?",
  "isStageComplete": false,
  "curriculumDraft": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Yes, 3 phases works well", "I'd prefer 4 phases", "Tell me more about the phases"]
}`;
  }

  // Create initial phase structure
  if (!hasPhases && messageCount > 0) {
    const phaseStructure = `### Phase 1: Investigate & Understand
**Duration:** 2 weeks
**Big Question:** What factors drive corporate sustainability decisions?

**Learning Objectives:**
- Students will analyze the economic pressures on corporations
- Students will evaluate consumer influence on business practices
- Students will examine environmental regulations and their impact

**Activities:**
- Case study analysis of Frito-Lay's sustainability reports
- Guest speaker from corporate sustainability sector
- Research on consumer behavior and purchasing decisions

### Phase 2: Analyze & Connect
**Duration:** 2 weeks  
**Big Question:** How do sustainability claims match reality?

**Learning Objectives:**
- Students will compare corporate claims with actual practices
- Students will identify greenwashing techniques
- Students will evaluate measurement metrics for sustainability

**Activities:**
- Data analysis of environmental impact reports
- Comparative study of industry practices
- Design thinking workshop on measurement tools

### Phase 3: Design & Create
**Duration:** 3 weeks
**Big Question:** How can we improve corporate sustainability practices?

**Learning Objectives:**
- Students will design innovative sustainability solutions
- Students will create implementation strategies
- Students will present to authentic audiences

**Activities:**
- Solution prototyping workshop
- Stakeholder feedback sessions
- Final presentation preparation`;

    return baseInstructions + `
Create the phase structure.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Here's a three-phase learning journey tailored to your project. Each phase builds toward solving the challenge of balancing profitability with sustainability.\\n\\nI've included specific activities and objectives for each phase. What would you like to adjust or develop further?",
  "isStageComplete": false,
  "curriculumDraft": "${phaseStructure.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Add more detail to activities", "Adjust the timeline", "This looks good - continue"]
}`;
  }

  // Ready to complete if we have phases
  if (hasPhases && messageCount > 2) {
    return baseInstructions + `
Check if they're ready to move on.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Your learning journey is taking shape! We have three phases that progressively build students' understanding and skills.\\n\\nAre you ready to design the specific student deliverables and assessments?",
  "isStageComplete": false,
  "curriculumDraft": "${currentDraft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Yes, let's design assessments", "Let me refine the phases first"]
}`;
  }

  // Default
  return baseInstructions + `
Continue developing the curriculum.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "[Help them develop or refine their curriculum phases]",
  "isStageComplete": false,
  "curriculumDraft": "${currentDraft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": null
}`;
};

// --- 3. Student Deliverables Workflow ---
export const getAssignmentWorkflow = (project, history = []) => {
  const messageCount = history ? history.length : 0;
  const existingAssignments = project.assignments?.length || 0;
  
  const baseInstructions = `
# STAGE 3: STUDENT DELIVERABLES
You are creating assessments for "${project.title}".

## CRITICAL RULES
1. Return ONLY valid JSON
2. Create authentic assessments, not traditional tests

## PROJECT CONTEXT
- Title: ${project.title}
- Challenge: ${project.challenge}
- For: ${project.ageGroup}
- Existing assignments: ${existingAssignments}
`;

  // First message
  if (messageCount === 0) {
    return baseInstructions + `
Welcome them to assessment design.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Now let's create meaningful assessments for your sustainability project.\\n\\nInstead of traditional tests, we'll design authentic ways for students to demonstrate their learning. What type of final product would best showcase their understanding?",
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Professional presentation", "Research portfolio", "Solution prototype", "Policy proposal"]
}`;
  }

  // Create an assignment if requested
  if (messageCount > 0 && existingAssignments === 0) {
    return baseInstructions + `
Create their first assignment.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Excellent choice! Let me create a detailed assignment structure for that.\\n\\nThis assignment will serve as the culminating demonstration of student learning. Would you like to add any specific requirements?",
  "isStageComplete": false,
  "newAssignment": {
    "title": "Sustainability Innovation Proposal",
    "description": "Students will create a comprehensive proposal for improving Frito-Lay's sustainability practices. The proposal must include data analysis, stakeholder perspectives, implementation timeline, and cost-benefit analysis. Students will present to a panel including business professionals and environmental experts.",
    "rubric": "**Understanding of Sustainability Concepts (40%):**\\n- Exemplary (4): Demonstrates sophisticated understanding of economic, environmental, and social factors\\n- Proficient (3): Shows solid grasp of key sustainability concepts\\n- Developing (2): Basic understanding with some gaps\\n- Emerging (1): Limited understanding evident\\n\\n**Quality of Solution (30%):**\\n- Exemplary (4): Innovative, feasible solution with strong evidence\\n- Proficient (3): Practical solution well-supported by research\\n- Developing (2): Solution shows promise but needs development\\n- Emerging (1): Basic solution attempt\\n\\n**Professional Presentation (30%):**\\n- Exemplary (4): Compelling, polished presentation engaging audience\\n- Proficient (3): Clear, well-organized presentation\\n- Developing (2): Adequate presentation with some unclear elements\\n- Emerging (1): Basic presentation skills demonstrated"
  },
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Add another assignment", "Create formative assessments", "Finish and review"]
}`;
  }

  // Complete the stage
  if (existingAssignments > 0 || messageCount > 2) {
    return baseInstructions + `
Complete the assessment design.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Perfect! Your assessment plan is complete. Students will demonstrate their learning through authentic, real-world applications.\\n\\nYour project is now ready for implementation. Would you like to review the complete syllabus?",
  "isStageComplete": true,
  "newAssignment": null,
  "assessmentMethods": "## Assessment Philosophy\\nThis project uses authentic assessment aligned with real-world ${project.subject} practices. Students demonstrate mastery through creation and presentation rather than traditional testing.\\n\\n## Formative Assessments\\n- Weekly reflection journals\\n- Peer feedback sessions\\n- Progress check-ins with instructor\\n\\n## Summative Assessment\\nThe culminating project proposal serves as the primary summative assessment, evaluated by both instructor and external panel using the provided rubric.",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": null
}`;
  }

  // Default
  return baseInstructions + `
Continue designing assessments.

Return this structure:
{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "[Help them design assessments]",
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": null
}`;
};