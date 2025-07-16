// src/prompts/workflows.js

/**
 * Fixed workflows with proper JSON and improved flow logic
 * VERSION: 21.0.0 - Debugged and Working
 */

// --- 1. Ideation Workflow ---
export const getIntakeWorkflow = (project, history = []) => {
  const baseInstructions = `
# STAGE 1: IDEATION - Finding the Big Idea and Challenge

You are guiding the educator through defining their project's vision.

## RESPONSE FORMAT
You MUST return ONLY a valid JSON object with the specified fields.
End every "chatResponse" with an invitational question.

## PROJECT CONTEXT
- Subject: ${project.subject}
- Age Group: ${project.ageGroup}
- Educator's Vision: "${project.educatorPerspective}"
- Materials: ${project.initialMaterials || 'None provided'}
`;

  const messageCount = history.length;
  const lastUserMsg = history.filter(m => m.role === 'user').pop()?.chatResponse || "";
  
  // Helper to check conversation progress
  const conversationText = history.map(m => m.chatResponse || '').join(' ').toLowerCase();
  const hasChallenge = conversationText.includes('challenge:') || conversationText.includes('students will');
  const hasBigIdea = conversationText.includes('big idea:') || conversationText.includes('core concept');
  const hasReceivedSuggestions = history.some(m => m.interactionType === 'Guide' && m.suggestions);

  // Step 1: Welcome
  if (messageCount === 0) {
    return baseInstructions + `
## YOUR TASK: Warm Personalized Welcome
Create a welcome that:
1. Acknowledges their ${project.subject} project specifically.
2. Shows excitement about their perspective: "${project.educatorPerspective}".
3. Sets a collaborative tone with "we" and "us".

Required JSON structure:
{
  "interactionType": "Welcome",
  "currentStage": "Ideation",
  "chatResponse": "Welcome message ending with a question",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["Yes, let's begin.", "Tell me more about the 3 stages first."],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Step 2A: Framework Overview
  if (lastUserMsg.toLowerCase().includes("tell me more about") || lastUserMsg.toLowerCase().includes("3 stages")) {
    return baseInstructions + `
## YOUR TASK: Framework Overview
Explain the three stages, connecting them to their specific project.

Required structure:
{
  "interactionType": "Framework",
  "currentStage": "Ideation",
  "chatResponse": "Brief intro connecting the framework to their project, ending with an invitation.",
  "frameworkOverview": {
    "title": "The ProjectCraft Journey for Your ${project.subject} Project",
    "introduction": "How this process will transform your vision about '${project.educatorPerspective}' into reality.",
    "stages": [
      { "title": "Stage 1: Ideation (Current)", "purpose": "We'll shape your vision for the ${project.subject} project into a compelling challenge." },
      { "title": "Stage 2: Learning Journey", "purpose": "We'll design how ${project.ageGroup} students will explore and create." },
      { "title": "Stage 3: Student Deliverables", "purpose": "We'll create authentic assessments with real-world impact." }
    ]
  },
  "buttons": ["Great, let's begin with Ideation!"],
  "isStageComplete": false, 
  "summary": null, 
  "suggestions": null, 
  "recap": null, 
  "process": null
}`;
  }
  
  // Step 2B: The "Warm-up" Step - Fixed JSON syntax
  if ((lastUserMsg.toLowerCase().includes("yes") && lastUserMsg.toLowerCase().includes("begin")) || 
      lastUserMsg.toLowerCase() === "great, let's begin with ideation!") {
    return baseInstructions + `
## YOUR TASK: Acknowledge and set the stage
This is a simple warm-up step before you provide suggestions.

Required JSON structure:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Excellent! It's clear you're passionate about ${project.subject}. To get started, I'll propose a few creative directions for your project. Sound good?",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["Sounds good, show me!"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }
  
  // Step 3: Provide Creative Suggestions
  if (lastUserMsg.toLowerCase().includes("sounds good") || 
      lastUserMsg.toLowerCase().includes("show me") ||
      (!hasReceivedSuggestions && messageCount > 2)) {
    return baseInstructions + `
## YOUR TASK: The Architect Guides
Offer three distinct and creative paths forward based on their vision.

Required JSON structure:
{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "Fantastic! Based on your vision for a project on ${project.subject}, here are a few potential directions we could explore:",
  "isStageComplete": false,
  "summary": null,
  "suggestions": [
    "[First specific suggestion for ${project.subject} appropriate for ${project.ageGroup}]",
    "[Second specific suggestion building on their vision: ${project.educatorPerspective}]",
    "[Third creative suggestion that challenges students with real-world application]"
  ],
  "buttons": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null
}

Make suggestions specific to ${project.subject} and ${project.ageGroup}.`;
  }

  // Check if user needs help
  const needsHelp = lastUserMsg.toLowerCase().includes("help") || 
                    lastUserMsg.toLowerCase().includes("i don't know") ||
                    lastUserMsg.toLowerCase().includes("i'm not sure") ||
                    lastUserMsg.toLowerCase().includes("stuck");

  if (needsHelp && !hasReceivedSuggestions) {
    return baseInstructions + `
## YOUR TASK: Provide Help with Guide Interaction
User needs help. Provide specific suggestions.

Required JSON structure:
{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "I'm here to help! Let me suggest some concrete directions for your ${project.subject} project:",
  "isStageComplete": false,
  "summary": null,
  "suggestions": [
    "[Specific actionable suggestion 1]",
    "[Specific actionable suggestion 2]",
    "[Specific actionable suggestion 3]"
  ],
  "buttons": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Ready to complete stage
  if (hasChallenge && hasBigIdea && !lastUserMsg.toLowerCase().includes("no")) {
    return baseInstructions + `
## YOUR TASK: Confirm Before Completing
The Challenge and Big Idea are defined. Confirm with the educator.

Check the last user message:
- If it confirms (contains "yes", "confirm", "sounds good", "looks good", "perfect", "let's proceed"):
  Set isStageComplete: true and populate summary
- Otherwise, ask for confirmation

Required JSON structure for completion:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "[Confirmation message or completion message]",
  "isStageComplete": [true if confirmed, false if asking],
  "summary": {
    "title": "[Compelling title for their project]",
    "abstract": "[Brief description incorporating their vision]",
    "coreIdea": "[The Big Idea - essential question or concept]",
    "challenge": "[The specific problem students will solve]"
  },
  "suggestions": null,
  "buttons": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Default: Continue Socratic dialogue
  return baseInstructions + `
## YOUR TASK: Socratic Dialogue
Guide them toward defining:
1. Challenge: The specific problem students will solve
2. Big Idea: The core concept or essential question

Current status: ${hasChallenge ? 'Challenge defined' : 'Need Challenge'}, ${hasBigIdea ? 'Big Idea defined' : 'Need Big Idea'}

Use probing questions to help them articulate these elements based on their ${project.subject} project.

Required JSON structure:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "[Your guiding message with a question at the end]",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null
}

If they seem stuck, switch to interactionType: "Guide" and provide specific suggestions.`;
};

// --- 2. Learning Journey Workflow ---
export const getCurriculumWorkflow = (project) => {
  const currentDraft = project.curriculumDraft || "";
  const hasPhases = currentDraft.includes("Phase");
  const phaseCount = (currentDraft.match(/### Phase/g) || []).length;
  
  return `
# STAGE 2: LEARNING JOURNEY - Designing Issues & Method

You are helping design the curriculum for "${project.title}".

## RESPONSE FORMAT
You MUST return ONLY a valid JSON object with these EXACT fields:
{
  "interactionType": "Standard|Guide|Process",
  "currentStage": "Learning Journey",
  "chatResponse": "Your message (max 200 words)",
  "isStageComplete": false,
  "curriculumDraft": "COMPLETE curriculum in Markdown",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": null
}

## PROJECT CONTEXT
- Challenge: ${project.challenge}
- Big Idea: ${project.coreIdea}
- Age Group: ${project.ageGroup}

## CRITICAL RULES
1. curriculumDraft must ALWAYS contain the COMPLETE curriculum
2. Use ### for phase headers
3. Address both ISSUES (content) and METHOD (activities)
4. currentStage must be "Learning Journey" not "Curriculum"

${!hasPhases ? `
## YOUR TASK: Structure the Journey
Ask them to envision 2-4 major phases that will help students tackle "${project.challenge}".

If they need help, offer a template with interactionType: "Guide" and use this structure:
{
  "process": {
    "title": "Suggested Journey Structure",
    "steps": [
      {
        "title": "Phase 1: Investigate & Understand",
        "description": "Students explore [customize for ${project.coreIdea}]"
      },
      {
        "title": "Phase 2: Analyze & Connect",
        "description": "Students dive deeper into [aspects of ${project.challenge}]"
      },
      {
        "title": "Phase 3: Design & Create",
        "description": "Students prototype solutions for ${project.challenge}"
      }
    ]
  },
  "suggestions": [
    "Use this three-phase structure",
    "Modify to fit your vision",
    "Create your own structure"
  ]
}` : `

## YOUR TASK: Detail the Phases
Current curriculum has ${phaseCount} phases. Help add details.

Format each phase as:
### Phase [#]: [Title]
**Duration:** [X] weeks
**Big Question:** [Guiding question]

**Learning Objectives:**
- Students will understand...
- Students will analyze...

**Activities & Methods:**
- Week 1: [Activity]
- Week 2: [Activity]

**Resources:**
- Guest Speaker: [Suggestion]
- Materials: [List]

**Student Output:**
- [What students create]`}

## COMPLETION CHECK
When curriculum is well-developed (all phases have details), ask:
"Our learning journey is taking shape! Shall we refine any phases or move on to designing specific student deliverables?"

If they confirm moving on, set isStageComplete: true`;
};

// --- 3. Student Deliverables Workflow ---
export const getAssignmentWorkflow = (project) => {
  const existingAssignments = project.assignments?.length || 0;
  const assignmentTitles = project.assignments?.map(a => a.title).join(', ') || 'None';

  return `
# STAGE 3: STUDENT DELIVERABLES - Creating Authentic Assessments

You are helping create assignments for "${project.title}".

## RESPONSE FORMAT
You MUST return ONLY a valid JSON object with these EXACT fields:
{
  "interactionType": "Provocation|Standard|Guide",
  "currentStage": "Student Deliverables",
  "chatResponse": "Your message (max 200 words)",
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": null
}

## PROJECT CONTEXT
- Challenge: ${project.challenge}
- Age Group: ${project.ageGroup}
- Existing Assignments: ${assignmentTitles}

${existingAssignments === 0 ? `
## YOUR TASK: Initial Provocation
Set interactionType: "Provocation" and suggest creative milestones.

Use "What if..." framing for each suggestion:
{
  "interactionType": "Provocation",
  "currentStage": "Student Deliverables",
  "chatResponse": "What if students didn't just submit one final project, but created meaningful milestones along the way? Here are some ideas:",
  "suggestions": [
    "What if students created [specific deliverable] that [real-world application]?",
    "What if they presented [format] to [authentic audience]?",
    "What if they built [tangible outcome] for [community partner]?"
  ]
}` : `

## YOUR TASK: Continue Assignment Creation

If creating a new assignment, populate newAssignment:
{
  "title": "[Assignment name]",
  "description": "[Detailed description]",
  "rubric": "**Criterion 1:**\\n- Exemplary: [Description]\\n- Proficient: [Description]\\n- Developing: [Description]"
}

If user wants to finish, set isStageComplete: true and provide assessmentMethods.`}`;
};