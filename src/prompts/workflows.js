// src/prompts/workflows.js - GOLD-PATH CONVERSATIONAL FLOW
// Sequential turn-by-turn implementation matching the gold-path script

// --- AI Persona System ---
const AI_PERSONAS = {
  ARCHITECT: 'Architect', // Default: Structured, pragmatic, "here's the scaffold"
  GUIDE: 'Guide',         // For uncertainty: Encouraging mentor with examples
  PROVOCATEUR: 'Provocateur' // For creativity: Playful "what-if" challenges
};

// --- Helper Functions ---
const isUncertainResponse = (userMsg) => {
  const uncertainPhrases = ['not sure', 'help', 'idk', 'i don\'t know', 'unsure', 'maybe', 'dunno'];
  return uncertainPhrases.some(phrase => userMsg.toLowerCase().includes(phrase));
};

const getProjectStage = (project) => {
  return project.stage || 'WELCOME';
};

const getTurnNumber = (history, stage) => {
  // Count turns within current stage
  const stageHistory = history.filter(msg => msg.currentStage === stage);
  return stageHistory.length;
};

// --- 1. Ideation Workflow (Gold-Path Implementation) ---
export const getIntakeWorkflow = (project, history = []) => {
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const currentStage = getProjectStage(project);
  const turnNumber = getTurnNumber(history, currentStage);
  
  // Extract project context with safe defaults
  const subject = project.subject || "your subject area";
  const ageGroup = project.ageGroup || "students";
  
  const baseInstructions = `
# AI TASK: GOLD-PATH CONVERSATIONAL FLOW
You are ProjectCraft Coach implementing a sequential turn-by-turn conversation.

## CURRENT CONTEXT:
- Stage: ${currentStage}
- Turn: ${turnNumber}
- Subject: ${subject}
- Age Group: ${ageGroup}

## CRITICAL INSTRUCTIONS:
- Follow the exact gold-path script progression
- Use appropriate AI persona for each turn
- Handle uncertain responses with Guide fallbacks
- Store granular data at each turn
- Present UI cards only at specified turns
- Maintain conversational flow and context

## JSON STRUCTURE REQUIRED:
All responses must include: interactionType, currentStage, chatResponse, isStageComplete, turnNumber, dataToStore, and appropriate optional fields.
`;

  // === GOLD-PATH CONVERSATIONAL FLOW ===

  // 0. WELCOME & CONTEXT
  if (currentStage === 'Ideation' && history.length === 0) {
    const welcomeResponse = {
      "interactionType": "Welcome",
      "currentStage": "WELCOME",
      "chatResponse": "Welcome to ProjectCraft! Together we'll design a project in three stages: Ideation, Learning Journey, and Student Deliverables. Ready to capture your first thoughts?",
      "isStageComplete": false,
      "turnNumber": 0,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": ["Yes, let's start!", "Tell me more about the process"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { stage: "WELCOME" }
    };
    
    return baseInstructions + `
## YOUR TASK: Welcome the user and set the three-stage mental model.
Be the Architect persona: structured and pragmatic.

Return this exact JSON structure:

${JSON.stringify(welcomeResponse, null, 2)}`;
  }

  // Handle "Tell me more about the process" response
  if (currentStage === 'Ideation' && lastUserMsg.toLowerCase().includes('process')) {
    const processOverviewResponse = {
      "interactionType": "ProjectCraftMethod",
      "currentStage": "WELCOME",
      "chatResponse": "Here's how ProjectCraft works using the Active Learning Framework:",
      "isStageComplete": false,
      "turnNumber": 0,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": ["Got it, let's start!", "I have questions"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { stage: "WELCOME" }
    };
    
    return baseInstructions + `
## YOUR TASK: Show the enhanced framework overview.
Use the ProjectCraftMethod interaction type to trigger the enhanced FrameworkOverview component.

Return this exact JSON structure:

${JSON.stringify(processOverviewResponse, null, 2)}`;
  }

  // Handle welcome response and transition to ideation
  if (currentStage === 'Ideation' && (lastUserMsg.toLowerCase().includes('yes') || lastUserMsg.toLowerCase().includes('start') || lastUserMsg.toLowerCase().includes('got it'))) {
    // Check if educator perspective already exists from onboarding
    const hasEducatorPerspective = project.educatorPerspective && project.educatorPerspective.trim().length > 0;
    
    const startIdeationResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation",
      "chatResponse": hasEducatorPerspective 
        ? `Perfect! I see you're interested in "${project.educatorPerspective}". Let's use that as our starting point. What specific topic or theme will students explore?`
        : "Perfect! Let's ground your perspective. In one sentence, what motivates you to run this project?",
      "isStageComplete": false,
      "turnNumber": 1,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": hasEducatorPerspective 
        ? { stage: "Ideation", currentTurn: "topic" }
        : { stage: "Ideation", currentTurn: "educatorPerspective" }
    };

    return baseInstructions + `
## YOUR TASK: Begin the Educator's Notebook sequence.
${hasEducatorPerspective 
  ? 'Acknowledge their existing educator perspective from onboarding and move to topic question.'
  : 'Ask for their motivation in a direct, structured way.'
}

Return this exact JSON structure:

${JSON.stringify(startIdeationResponse, null, 2)}`;
  }

  // 1. IDEATION STAGE - Sequential Educator's Notebook
  if (currentStage === 'Ideation') {
    return handleIdeationStage(project, history, lastUserMsg, turnNumber, baseInstructions);
  }

  // 2. LEARNING JOURNEY STAGE
  if (currentStage === 'JOURNEY') {
    return handleLearningJourneyStage(project, history, lastUserMsg, turnNumber, baseInstructions);
  }

  // 3. STUDENT DELIVERABLES STAGE
  if (currentStage === 'DELIVERABLES') {
    return handleDeliverablesStage(project, history, lastUserMsg, turnNumber, baseInstructions);
  }

  // Default fallback
  return createFallbackResponse(baseInstructions);
};

// === STAGE HANDLERS ===

// 1. IDEATION STAGE HANDLER
const handleIdeationStage = (project, history, lastUserMsg, turnNumber, baseInstructions) => {
  const isUncertain = isUncertainResponse(lastUserMsg);
  
  // Turn 1.1 - Ask for educator perspective
  if (!project.educatorPerspective && turnNumber <= 1) {
    if (isUncertain && turnNumber > 0) {
      return createGuideResponse(
        "I understand it can be hard to pin down motivation. Think about what excites you most about teaching this topic, or what challenge you want your students to tackle. For example: 'I want students to see how math applies to real urban planning' or 'Students should understand climate change through local action.'",
        "Ideation", 1, baseInstructions
      );
    }
    
    const motivationResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation",
      "chatResponse": "Perfect! Let's ground your perspective. In one sentence, what motivates you to run this project?",
      "isStageComplete": false,
      "turnNumber": 1,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { currentTurn: "educatorPerspective" }
    };
    
    return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(motivationResponse, null, 2)}`;
  }

  // Turn 1.3 - Ask for topic (after educator perspective captured)
  // Note: project.subject comes from onboarding, project.topic is for refinement
  if (project.educatorPerspective && !project.topic) {
    if (isUncertain) {
      return createGuideResponse(
        "Here are some trending themes: Urban Planning, Climate Action, Social Justice, Digital Innovation, Health & Wellness, Cultural Heritage. Tap one that resonates or add your own.",
        "Ideation", 3, baseInstructions, {
          "buttons": ["Urban Planning", "Climate Action", "Social Justice", "Digital Innovation", "Other"]
        }
      );
    }
    
    const topicResponse = {
      "interactionType": "Standard", 
      "currentStage": "Ideation",
      "chatResponse": project.subject 
        ? `Great! I see from your setup that you're working with ${project.subject}. What specific aspect or theme of ${project.subject} will students explore?`
        : "Great. Topic time - what subject or theme will students explore?",
      "isStageComplete": false,
      "turnNumber": 3,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { currentTurn: "topic" }
    };
    
    return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(topicResponse, null, 2)}`;
  }

  // Turn 1.5 - Ask for audience  
  if (project.educatorPerspective && project.topic && !project.audience) {
    if (isUncertain) {
      return createGuideResponse(
        "Think about your specific students. Examples: 'Grade 9 Science', 'AP Geography seniors', 'Mixed ages in Environmental Club', '7th grade Social Studies'.",
        "Ideation", 5, baseInstructions
      );
    }
    
    const audienceResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation", 
      "chatResponse": project.ageGroup 
        ? `Perfect! I see you're working with ${project.ageGroup} students. Any specific details about this group? (e.g. advanced learners, mixed abilities, specific interests)`
        : "Who's your audience? (e.g. Grade 9, AP Geography, or multi-age club).",
      "isStageComplete": false,
      "turnNumber": 5,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { currentTurn: "audience" }
    };
    
    return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(audienceResponse, null, 2)}`;
  }

  // Turn 1.7 - Ask for scope
  if (project.educatorPerspective && project.topic && project.audience && !project.scope) {
    if (isUncertain) {
      return createGuideResponse(
        "Consider your available time and depth. A 1-week mini-unit covers basics, a 4-week inquiry allows deeper exploration, and a semester capstone enables comprehensive investigation.",
        "Ideation", 7, baseInstructions, {
          "buttons": ["1-week mini-unit", "4-week inquiry", "Semester capstone"]
        }
      );
    }
    
    const scopeResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation",
      "chatResponse": project.projectScope 
        ? `Excellent! I see you're planning ${project.projectScope}. Let's refine the timeline - what specific timeframe works best for this scope?`
        : "Lastly, how wide is the scope? 1-week mini-unit, 4-week inquiry, or semester capstone? Select or describe.",
      "isStageComplete": false,
      "turnNumber": 7,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": ["1-week mini-unit", "4-week inquiry", "Semester capstone"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { currentTurn: "scope" }
    };
    
    return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(scopeResponse, null, 2)}`;
  }

  // Turn 1.9 - Present Big Idea suggestions (after all notebook data collected)
  if (project.educatorPerspective && project.topic && project.audience && project.scope && !project.bigIdea) {
    const suggestions = generateContextualSuggestions(project.topic || project.subject, project.audience || project.ageGroup);
    
    const suggestionsResponse = {
      "interactionType": "Guide",
      "currentStage": "Ideation",
      "chatResponse": `Perfect! Let me summarize: You're motivated by "${project.educatorPerspective}", focusing on ${project.topic || project.subject} for ${project.audience || project.ageGroup} over ${project.scope || project.projectScope}.\n\nNow for three catalyst directions:\n1. ${suggestions[0]?.title || 'Investigate local applications'}\n2. ${suggestions[1]?.title || 'Design solutions for real challenges'} \n3. ${suggestions[2]?.title || 'Create prototypes for community impact'}\n\nWhich sparks joy—or should we remix?`,
      "isStageComplete": false,
      "turnNumber": 9,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": ["I like option 1", "I like option 2", "I like option 3", "Let's remix these"],
      "suggestions": suggestions,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": [
        `Consider inviting a ${project.topic} professional to share real-world applications`,
        `Local community experts could provide authentic project challenges`,
        `Alumni or professionals in ${project.topic} fields make excellent project mentors`
      ],
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { currentTurn: "bigIdea" }
    };
    
    return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(suggestionsResponse, null, 2)}`;
  }

  // Handle Big Idea selection and move to completion
  if (project.educatorPerspective && project.topic && project.audience && project.scope && 
      (lastUserMsg.includes('option') || lastUserMsg.includes('like'))) {
    
    const completionResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation",
      "chatResponse": "Excellent. Let's lock your Big Idea, draft an Essential Question, and a student-friendly Challenge statement.",
      "isStageComplete": true,
      "turnNumber": 11,
      "persona": AI_PERSONAS.ARCHITECT,
      "buttons": ["Lock it in", "Let me adjust first"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { 
        stage: "IDEATION_COMPLETE",
        bigIdea: `Explore ${project.topic || project.subject} through authentic ${project.audience || project.ageGroup} investigation`,
        essentialQuestion: `How might ${project.audience || project.ageGroup} use ${project.topic || project.subject} to solve real-world challenges?`,
        challenge: `Design and present a ${project.topic || project.subject} solution that addresses a genuine community need`
      }
    };
    
    return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(completionResponse, null, 2)}`;
  }

  return createFallbackResponse(baseInstructions);
};

// Helper function to create Guide persona responses
const createGuideResponse = (chatResponse, stage, turnNumber, baseInstructions, additionalProps = {}) => {
  const response = {
    "interactionType": "Standard",
    "currentStage": stage,
    "chatResponse": chatResponse,
    "isStageComplete": false,
    "turnNumber": turnNumber,
    "persona": AI_PERSONAS.GUIDE,
    "buttons": null,
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null,
    "guestSpeakerHints": null,
    "curriculumDraft": null,
    "newAssignment": null,
    "assessmentMethods": null,
    ...additionalProps
  };
  
  return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(response, null, 2)}`;
};

// Helper function to create fallback responses
const createFallbackResponse = (baseInstructions) => {
  const response = {
    "interactionType": "Standard",
    "currentStage": "Ideation",
    "chatResponse": "I'm here to help you design an amazing learning experience! What would you like to work on?",
    "isStageComplete": false,
    "persona": AI_PERSONAS.GUIDE,
    "buttons": ["Start over", "Continue"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null,
    "guestSpeakerHints": null,
    "curriculumDraft": null,
    "newAssignment": null,
    "assessmentMethods": null
  };
  
  return baseInstructions + `Return this exact JSON structure: ${JSON.stringify(response, null, 2)}`;
};

// Placeholder handlers for other stages
const handleLearningJourneyStage = (project, history, lastUserMsg, turnNumber, baseInstructions) => {
  return createFallbackResponse(baseInstructions);
};

const handleDeliverablesStage = (project, history, lastUserMsg, turnNumber, baseInstructions) => {
  return createFallbackResponse(baseInstructions);
};

// Generate contextual suggestions based on topic and audience
const generateContextualSuggestions = (topic, audience) => {
  return [
    {
      title: `How might we redesign local ${topic.toLowerCase()} for better community impact?`,
      rationale: `Perfect for ${audience} because it connects abstract concepts to tangible local examples they can investigate.`
    },
    {
      title: `What if ${audience} built solutions that address real ${topic.toLowerCase()} challenges?`,
      rationale: `Engages ${audience} in authentic problem-solving while building practical skills.`
    },
    {
      title: `Could we prototype a ${topic.toLowerCase()} innovation around our school/community?`,
      rationale: `Allows ${audience} to see immediate relevance and test their ideas in familiar environments.`
    }
  ];
};

// Legacy exports for other workflow stages (to be implemented)
export const getCurriculumWorkflow = (project, history = []) => {
  return handleLearningJourneyStage(project, history, "", 0, "");
};

export const getAssignmentWorkflow = (project, history = []) => {
  return handleDeliverablesStage(project, history, "", 0, "");
};