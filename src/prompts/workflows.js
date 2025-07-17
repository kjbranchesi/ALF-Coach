// src/prompts/workflows.js - ENHANCED VERSION

/**
 * Enhanced workflows with better conversation flow and error handling
 * VERSION: 30.0.0 - Complete overhaul
 */

// --- Helper Functions ---
const createSuggestionReasoning = (ageGroup, subject, vision) => {
  const reasonings = {
    'Ages 5-7': `For young learners, we need hands-on, sensory experiences that make ${subject} tangible and fun.`,
    'Ages 8-10': `At this age, students love solving mysteries and being helpers. Let's leverage that curiosity.`,
    'Ages 11-14': `Middle schoolers crave relevance and autonomy. These ideas connect ${subject} to their world.`,
    'Ages 15-18': `High schoolers can tackle complex, real-world challenges. These suggestions position them as changemakers.`,
    'Ages 18+': `Adult learners bring experience and purpose. These directions honor their expertise while pushing boundaries.`
  };
  return reasonings[ageGroup] || `Based on your vision about "${vision}", here are some compelling directions:`;
};

// --- 1. ENHANCED Ideation Workflow ---
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

## CONVERSATION PRINCIPLES
1. Always provide an "escape hatch" - offer alternative if suggestions don't resonate
2. Explain pedagogical reasoning before suggestions
3. Build explicitly on their stated vision
4. Keep momentum - no unnecessary steps
`;

  const messageCount = history.length;
  const lastUserMsg = history.filter(m => m.role === 'user').pop()?.chatResponse || "";
  
  // Helper to check conversation progress
  const conversationText = history.map(m => m.chatResponse || '').join(' ').toLowerCase();
  const hasChallenge = conversationText.includes('challenge:') || conversationText.includes('students will solve');
  const hasBigIdea = conversationText.includes('big idea:') || conversationText.includes('essential question');
  const hasReceivedSuggestions = history.some(m => m.interactionType === 'Guide' && m.suggestions);
  
  // Check if user wants something different
  const wantsDifferent = lastUserMsg.toLowerCase().includes('different') || 
                        lastUserMsg.toLowerCase().includes('something else') ||
                        lastUserMsg.toLowerCase().includes('other ideas') ||
                        lastUserMsg.toLowerCase().includes("don't like");

  // Step 1: Welcome - Skip the warm-up!
  if (messageCount === 0) {
    return baseInstructions + `
## YOUR TASK: Welcome and Immediate Value
Acknowledge their vision and immediately offer to help shape it.

Required JSON structure:
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

  // Step 2: Provide Suggestions WITH REASONING
  if ((lastUserMsg.toLowerCase().includes("show me") || lastUserMsg.toLowerCase().includes("creative directions")) && !hasReceivedSuggestions) {
    const reasoning = createSuggestionReasoning(project.ageGroup, project.subject, project.educatorPerspective);
    
    return baseInstructions + `
## YOUR TASK: Thoughtful Suggestions with Reasoning
Provide pedagogically-grounded suggestions with clear reasoning.

Required JSON structure:
{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "${reasoning}\\n\\nHere are three directions we could explore:",
  "isStageComplete": false,
  "summary": null,
  "suggestions": [
    "[Specific suggestion 1 that builds directly on: ${project.educatorPerspective}]",
    "[Specific suggestion 2 that incorporates: ${project.initialMaterials || 'hands-on exploration'}]",
    "[Specific suggestion 3 that challenges students at ${project.ageGroup} level]"
  ],
  "buttons": ["I need different ideas", "Let me build on one of these"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Handle "I want different ideas"
  if (wantsDifferent && hasReceivedSuggestions) {
    return baseInstructions + `
## YOUR TASK: Alternative Directions
They want different ideas. Pivot to a new approach.

Required JSON structure:
{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "Of course! Let's explore some different angles. What aspect of ${project.subject} excites you most? Is it the [scientific/historical/creative/technical] elements, the real-world applications, or perhaps the opportunity for students to [create/investigate/solve/express]?\\n\\nHere are some alternative approaches:",
  "isStageComplete": false,
  "summary": null,
  "suggestions": [
    "[Completely different angle 1]",
    "[Completely different angle 2]", 
    "[Completely different angle 3]"
  ],
  "buttons": ["Tell me about the framework", "I'll describe my own idea"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Framework Overview - Enhanced
  if (lastUserMsg.toLowerCase().includes("framework") || lastUserMsg.toLowerCase().includes("tell me more")) {
    return baseInstructions + `
## YOUR TASK: Framework as Value Proposition
Show how ProjectCraft is different from generic AI.

Required structure:
{
  "interactionType": "Framework",
  "currentStage": "Ideation",
  "chatResponse": "What makes ProjectCraft different is our research-based Active Learning Framework. We don't just help you plan lessons - we guide you through creating transformative learning experiences:",
  "frameworkOverview": {
    "title": "The ProjectCraft Method",
    "introduction": "Unlike generic AI tools, we use proven pedagogical principles to ensure your ${project.subject} project creates deep, lasting learning.",
    "stages": [
      { 
        "title": "🎯 Stage 1: Ideation (Now)", 
        "purpose": "We help you craft a compelling challenge that makes ${project.subject} irresistible to ${project.ageGroup} learners." 
      },
      { 
        "title": "🗺️ Stage 2: Learning Journey", 
        "purpose": "We'll design a scaffolded path where students build skills while working toward solving your challenge." 
      },
      { 
        "title": "🎨 Stage 3: Authentic Assessment", 
        "purpose": "We'll create meaningful deliverables that showcase real understanding, not just test performance." 
      }
    ]
  },
  "buttons": ["This sounds perfect!", "Show me an example"],
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null
}`;
  }

  // Ready to complete stage - with better confirmation
  if (hasChallenge && hasBigIdea) {
    const needsConfirmation = !lastUserMsg.toLowerCase().includes("yes") && 
                            !lastUserMsg.toLowerCase().includes("perfect") &&
                            !lastUserMsg.toLowerCase().includes("looks good");
    
    return baseInstructions + `
## YOUR TASK: Synthesize and Confirm
Clearly show what we've created together.

Required JSON structure:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Excellent work! Let me summarize what we've developed:\\n\\n**Big Idea:** [The essential question/concept from conversation]\\n**Challenge:** [The specific problem students will solve]\\n\\nThis creates a powerful learning experience because [brief pedagogical reasoning].\\n\\nDoes this capture your vision, or would you like to refine anything?",
  "isStageComplete": ${!needsConfirmation},
  "summary": ${needsConfirmation ? 'null' : `{
    "title": "[Compelling title based on their ${project.subject} project]",
    "abstract": "[Professional abstract that elevates their ${project.educatorPerspective}]",
    "coreIdea": "[The Big Idea - essential question that drives inquiry]",
    "challenge": "[The specific, authentic problem students will solve]"
  }`},
  "suggestions": null,
  "buttons": ${needsConfirmation ? '["Yes, this captures it!", "Let me refine this"]' : 'null'},
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Default: Guide toward Big Idea and Challenge
  return baseInstructions + `
## YOUR TASK: Collaborative Development
Guide them naturally toward defining the Big Idea and Challenge.
Never be pushy - always offer alternatives.

Current status: ${hasChallenge ? 'Challenge defined' : 'Need Challenge'}, ${hasBigIdea ? 'Big Idea defined' : 'Need Big Idea'}

Required JSON structure:
{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "[Respond to their last message, then guide toward next element.\\n\\nEnd with: 'What do you think? Or would you like to explore a different direction?']",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["I need some examples", "Let's try a different angle"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
};

// --- 2. ENHANCED Learning Journey Workflow ---
export const getCurriculumWorkflow = (project, history) => {
  const currentDraft = project.curriculumDraft || "";
  const hasPhases = currentDraft.includes("### Phase");
  const phaseCount = (currentDraft.match(/### Phase/g) || []).length;
  
  // Create context summary from ideation
  const contextSummary = `
## PROJECT FOUNDATION (from Ideation)
- Title: ${project.title}
- Big Idea: ${project.coreIdea}
- Challenge: ${project.challenge}
- Age Group: ${project.ageGroup}
- Subject: ${project.subject}
`;

  const baseInstructions = `
# STAGE 2: LEARNING JOURNEY - Designing the Path

You are helping design the curriculum for "${project.title}".

${contextSummary}

## RESPONSE FORMAT
You MUST return ONLY a valid JSON object with these EXACT fields:
{
  "interactionType": "Standard|Guide|Process",
  "currentStage": "Learning Journey",
  "chatResponse": "Your message",
  "isStageComplete": false,
  "curriculumDraft": "COMPLETE curriculum in Markdown (not just changes)",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": null
}

## CRITICAL RULES
1. ALWAYS include the COMPLETE curriculumDraft, not just new additions
2. Use real content from the project context, not placeholder brackets
3. Build explicitly on their Big Idea: "${project.coreIdea}"
4. Design phases that lead to solving: "${project.challenge}"
`;

  const messageCount = history.length;
  const lastUserMsg = history.filter(m => m.role === 'user').pop()?.chatResponse || "";

  // First message - Explain value and offer structure
  if (messageCount === 0) {
    return baseInstructions + `
## YOUR TASK: Explain Learning Journey Value
Show how we're different from generic curriculum planning.

Required JSON:
{
  "interactionType": "Process",
  "currentStage": "Learning Journey",
  "chatResponse": "Now let's design how your ${project.ageGroup} students will journey from curiosity to capability. Unlike traditional unit planning, we'll create a narrative arc where each phase builds toward solving: **${project.challenge}**.\\n\\nI'll help you design phases that balance structure with student agency. How would you like to approach this?",
  "process": {
    "title": "Design Principles for ${project.ageGroup}",
    "steps": [
      {
        "title": "Start with Wonder",
        "description": "Hook students with intriguing questions about ${project.coreIdea}"
      },
      {
        "title": "Build Through Doing", 
        "description": "Hands-on activities that develop skills while maintaining engagement"
      },
      {
        "title": "Create for Impact",
        "description": "Culminate in solving the challenge: ${project.challenge}"
      }
    ]
  },
  "suggestions": [
    "Design a 3-phase journey (Investigate → Analyze → Create)",
    "Start with my own phase structure",
    "Show me an example for ${project.subject}"
  ],
  "isStageComplete": false,
  "curriculumDraft": null,
  "summary": null,
  "recap": null,
  "frameworkOverview": null,
  "buttons": null
}`;
  }

  // If they want the 3-phase structure - CREATE IT WITH REAL CONTENT
  if (lastUserMsg.includes("3-phase") || lastUserMsg.includes("Investigate")) {
    const draft = `### Phase 1: Investigate & Understand
**Duration:** 2-3 weeks  
**Big Question:** What makes ${project.coreIdea.replace(/[?.]/g, '')} important to our world?

**Learning Objectives:**
- Students will explore the fundamental concepts behind ${project.subject}
- Students will identify real-world connections to ${project.coreIdea}
- Students will begin forming their own questions about ${project.challenge}

**Week 1-2 Activities:**
- Opening Hook: [Specific activity related to ${project.subject}]
- Research Sprint: Students investigate ${project.coreIdea} through [specific methods]
- Expert Connection: [Guest speaker or field expert in ${project.subject}]

**Resources Needed:**
- ${project.initialMaterials || 'Research materials about ' + project.subject}
- Digital tools for documentation
- Community connections

**Student Output:**
- Initial research presentation
- Question journal about ${project.challenge}

### Phase 2: Analyze & Connect
**Duration:** 2-3 weeks  
**Big Question:** How might we approach ${project.challenge}?

**Learning Objectives:**
- Students will analyze different perspectives on ${project.challenge}
- Students will identify patterns and design principles
- Students will develop initial solution concepts

**Week 3-4 Activities:**
- Case Study Analysis: Examine existing solutions to similar challenges
- Design Thinking Workshop: Ideate approaches to ${project.challenge}
- Prototype Sprint: Quick tests of initial ideas

**Resources Needed:**
- Case study materials
- Prototyping supplies
- Collaboration tools

**Student Output:**
- Analysis portfolio
- Initial prototype or model

### Phase 3: Design & Create  
**Duration:** 3-4 weeks  
**Big Question:** How can our solution to ${project.challenge} make a real difference?

**Learning Objectives:**
- Students will create a polished solution addressing ${project.challenge}
- Students will iterate based on feedback
- Students will present to an authentic audience

**Week 5-7 Activities:**
- Production Time: Dedicated work on final solutions
- Peer Review Cycles: Structured feedback sessions
- Presentation Preparation: Practice for authentic audience

**Resources Needed:**
- Production materials specific to chosen solutions
- Presentation tools
- Venue/platform for final presentations

**Student Output:**
- Final solution to ${project.challenge}
- Presentation to authentic audience
- Reflection portfolio`;

    return baseInstructions + `
## YOUR TASK: Provide the structured curriculum
Give them a complete, contextual curriculum based on their project.

Required JSON:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Here's a three-phase journey customized for your ${project.subject} project. Each phase builds toward solving '${project.challenge}' while exploring '${project.coreIdea}'.\\n\\nNotice how each phase has specific objectives, activities, and outputs. What would you like to adjust or develop further?",
  "isStageComplete": false,
  "curriculumDraft": "${draft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Adjust the timeline", "Develop specific activities", "Add assessment details"]
}`;
  }

  // Handle refinements
  if (hasPhases && phaseCount >= 2) {
    const needsMoreDetail = !currentDraft.includes("Guest") || !currentDraft.includes("Week");
    
    if (needsMoreDetail) {
      return baseInstructions + `
## YOUR TASK: Add specific details
Help them flesh out the phases with concrete activities.

Required JSON:
{
  "interactionType": "Guide",
  "currentStage": "Learning Journey", 
  "chatResponse": "Your phase structure is taking shape! Now let's add specific activities and resources. Which phase would you like to develop first?",
  "suggestions": [
    "Add specific opening hooks for each phase",
    "Develop the expert connections and field experiences",
    "Detail the culminating activities for ${project.challenge}"
  ],
  "isStageComplete": false,
  "curriculumDraft": "${currentDraft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["I need help with all of these", "Let's move to student deliverables"]
}`;
    }

    // Ready to complete
    return baseInstructions + `
## YOUR TASK: Confirm completion
The curriculum is well-developed. Confirm they're ready to move on.

Required JSON:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Your learning journey looks comprehensive! We have ${phaseCount} phases that build from investigating ${project.coreIdea} to solving ${project.challenge}.\\n\\nAre you ready to design the specific student deliverables and assessments, or would you like to refine any phases?",
  "isStageComplete": ${lastUserMsg.includes("ready") || lastUserMsg.includes("deliverables")},
  "curriculumDraft": "${currentDraft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Ready for student deliverables!", "Let me refine Phase [X]"]
}`;
  }

  // Default: Build curriculum
  return baseInstructions + `
## YOUR TASK: Build on their input
Whatever they say, help them build their curriculum thoughtfully.

Required JSON:
{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "[Acknowledge their input and guide toward creating phases that address ${project.challenge}. Always end with a question.]",
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

// --- 3. ENHANCED Student Deliverables Workflow ---
export const getAssignmentWorkflow = (project, history) => {
  const existingAssignments = project.assignments?.length || 0;
  const assignmentTitles = project.assignments?.map(a => a.title).join(', ') || 'None';
  
  const messageCount = history.length;
  const lastUserMsg = history.filter(m => m.role === 'user').pop()?.chatResponse || "";

  const contextSummary = `
## PROJECT CONTEXT
- Title: ${project.title}
- Challenge: ${project.challenge}
- Big Idea: ${project.coreIdea}
- Age Group: ${project.ageGroup}
- Phases: ${(project.curriculumDraft?.match(/### Phase/g) || []).length} phases planned
- Existing Assignments: ${assignmentTitles}
`;

  const baseInstructions = `
# STAGE 3: STUDENT DELIVERABLES - Creating Authentic Assessments

You are helping create meaningful assessments for "${project.title}".

${contextSummary}

## RESPONSE FORMAT
You MUST return ONLY a valid JSON object with these EXACT fields:
{
  "interactionType": "Provocation|Standard|Guide",
  "currentStage": "Student Deliverables",
  "chatResponse": "Your message",
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

## VALUE PROPOSITION
We're not creating traditional tests - we're designing authentic assessments that mirror real-world work in ${project.subject}.
`;

  // First message - Explain authentic assessment
  if (messageCount === 0) {
    return baseInstructions + `
## YOUR TASK: Set the Vision for Authentic Assessment
Explain how ProjectCraft assessments are different.

Required JSON:
{
  "interactionType": "Provocation",
  "currentStage": "Student Deliverables",
  "chatResponse": "Traditional tests can't capture the rich learning in your ${project.subject} project. Instead, let's create assessments that feel like real ${project.subject} work - where students demonstrate understanding by doing.\\n\\nWhat if your ${project.ageGroup} students showed their learning through:",
  "suggestions": [
    "What if students created a ${project.subject}-focused portfolio that documents their journey from question to solution?",
    "What if they presented their solution to ${project.challenge} to actual ${project.subject} professionals or community members?",
    "What if they designed an interactive experience that teaches others about ${project.coreIdea}?"
  ],
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Tell me more about authentic assessment", "I have my own ideas"]
}`;
  }

  // If they want more info about authentic assessment
  if (lastUserMsg.includes("authentic assessment") || lastUserMsg.includes("tell me more")) {
    return baseInstructions + `
## YOUR TASK: Explain Authentic Assessment Philosophy
Show the research-based approach.

Required JSON:
{
  "interactionType": "Process",
  "currentStage": "Student Deliverables",
  "chatResponse": "Authentic assessment is powerful because it mirrors how ${project.subject} professionals actually demonstrate expertise. Here's how we'll design yours:",
  "process": {
    "title": "Authentic Assessment Framework",
    "steps": [
      {
        "title": "Real-World Context",
        "description": "Students address ${project.challenge} as actual ${project.subject} practitioners would"
      },
      {
        "title": "Multiple Modalities", 
        "description": "Beyond writing - include creating, presenting, and demonstrating"
      },
      {
        "title": "Audience Beyond Teacher",
        "description": "Present to community members, experts, or peers who care about ${project.coreIdea}"
      },
      {
        "title": "Iteration & Growth",
        "description": "Build in revision based on authentic feedback, not just grades"
      }
    ]
  },
  "suggestions": [
    "Design a milestone assignment for each phase",
    "Create one powerful culminating project",
    "Mix both - scaffolded assignments leading to final showcase"
  ],
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "recap": null,
  "frameworkOverview": null,
  "buttons": null
}`;
  }

  // Creating assignments - with clear value
  if (existingAssignments < 3 && !lastUserMsg.includes("summative") && !lastUserMsg.includes("finish")) {
    const assignmentNumber = existingAssignments + 1;
    const phaseTarget = assignmentNumber; // Align with phases
    
    return baseInstructions + `
## YOUR TASK: Create Specific Assignment
Help them create assignment ${assignmentNumber} aligned with Phase ${phaseTarget}.

Based on their input, create a meaningful assignment.

If they describe an assignment idea, populate newAssignment:
{
  "title": "[Assignment name that reflects the work, not just 'Assignment 1']",
  "description": "[Detailed description explaining what students create and why it matters for ${project.challenge}]",
  "rubric": "**Understanding of ${project.coreIdea}:**\\n- Exemplary (4): Demonstrates sophisticated understanding by [specific evidence]\\n- Proficient (3): Shows solid grasp through [specific evidence]\\n- Developing (2): Beginning to understand, evidenced by [specific evidence]\\n- Emerging (1): Initial exploration of concepts\\n\\n**Solution to Challenge:**\\n- Exemplary (4): Innovative approach that [specific criteria]\\n- Proficient (3): Effective solution that [specific criteria]\\n- Developing (2): Partial solution showing [specific criteria]\\n- Emerging (1): Initial attempt at addressing challenge\\n\\n**Communication & Presentation:**\\n- Exemplary (4): Compelling presentation that [specific criteria]\\n- Proficient (3): Clear communication of [specific criteria]\\n- Developing (2): Basic presentation of ideas\\n- Emerging (1): Attempted communication"
}

Always explain the pedagogical reasoning for the assignment type.`;
  }

  // Ready to complete - Summative Assessment
  if (existingAssignments >= 2 || lastUserMsg.includes("summative") || lastUserMsg.includes("finish")) {
    return baseInstructions + `
## YOUR TASK: Create Summative Assessment Plan
Synthesize all assessments into a cohesive plan.

Required JSON:
{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Excellent! You've created meaningful assignments that build toward solving ${project.challenge}. Let me summarize our complete assessment plan. Does this capture your vision?",
  "isStageComplete": ${lastUserMsg.includes("yes") || lastUserMsg.includes("perfect") || lastUserMsg.includes("done")},
  "newAssignment": null,
  "assessmentMethods": "## Summative Assessment Plan for ${project.title}\\n\\n### Formative Assessments:\\n${project.assignments.map(a => '- ' + a.title + ': ' + a.description.substring(0, 100) + '...').join('\\n')}\\n\\n### Culminating Assessment:\\nStudents will demonstrate mastery by presenting their solution to ${project.challenge} to an authentic audience including [specify audience]. Success will be measured by:\\n\\n1. **Solution Quality**: Does it meaningfully address ${project.challenge}?\\n2. **Understanding Depth**: Can students explain the ${project.coreIdea} to others?\\n3. **Real-World Application**: Is the solution implementable?\\n4. **Communication**: Can they engage and inspire their audience?\\n\\n### Growth Documentation:\\nThroughout, students maintain a reflection portfolio showing their journey from initial questions through final solution, emphasizing growth over perfection.",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["This is perfect!", "Let me adjust something"]
}`;
  }

  // Default: Guide assignment creation
  return baseInstructions + `
## YOUR TASK: Guide Assignment Creation
Help them think through meaningful assessments.

Required JSON:
{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "[Respond thoughtfully to their input, always connecting back to ${project.challenge} and authentic assessment. End with a guiding question.]",
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["I need examples", "Let's design together"]
}`;
};