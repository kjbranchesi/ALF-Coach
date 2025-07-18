// src/prompts/workflows.js - GOLD-PATH CONVERSATIONAL FLOW
// Sequential turn-by-turn implementation matching the gold-path script

// --- AI Persona System ---
const AI_PERSONAS = {
  ARCHITECT: 'Architect', // Default: Structured, pragmatic, "here's the scaffold"
  GUIDE: 'Guide',         // For uncertainty: Encouraging mentor with examples
  PROVOCATEUR: 'Provocateur' // For creativity: Playful "what-if" challenges
};

// --- UNIVERSAL NAVIGATION FRAMEWORK ---
/**
 * HOLISTIC "RETURN TO PROCESS" SYSTEM
 * 
 * CORE PRINCIPLE: Always provide a clear path back to the main process flow,
 * regardless of how far off-course the conversation goes.
 * 
 * PROCESS vs EXPLORATION STATES:
 * - PROCESS STATE: Following the main workflow (Ideation → Curriculum → Assignments)
 * - EXPLORATION STATE: Off-course questions, clarifications, tangential discussions
 * 
 * OFF-COURSE DETECTION:
 * - Questions about pedagogy, theory, or general concepts
 * - Requests for clarification ("What does this mean?")
 * - Tangential discussions not directly advancing the stage
 * - "Help" or uncertainty expressions
 * 
 * UNIVERSAL RETURN MECHANISM:
 * Every off-course response MUST include:
 * 1. Acknowledgment of the exploration
 * 2. Context reminder of current stage/progress
 * 3. Clear "Continue with [Stage]" button
 * 4. Option for more exploration if needed
 * 
 * STAGE-SPECIFIC RETURN MESSAGES:
 * - Ideation: "Continue building your project foundation"
 * - Curriculum: "Continue designing your learning journey"  
 * - Assignments: "Continue creating your assessments"
 * 
 * BUTTONS vs INPUT-ONLY DECISION FRAMEWORK:
 * 
 * SHOW BUTTONS WHEN:
 * - Initial welcome/framework overview (structured choices)
 * - Specific Q&A topics (preset common questions)
 * - Stage transitions (clear next steps)
 * - Uncertainty responses (guided options)
 * - Data collection with common choices (age groups, scopes)
 * - OFF-COURSE RETURNS (always include return-to-process option)
 * 
 * SHOW INPUT-ONLY WHEN:
 * - Open-ended questions ("I have another question")
 * - Creative brainstorming (Big Ideas, topics)
 * - Personal motivation/perspective sharing
 * - Follow-up clarifications
 * - Free-form exploration
 * 
 * UNIVERSAL RULE: ALWAYS include stage-appropriate "Continue" button when off-course
 */

// --- Helper Functions ---
const isUncertainResponse = (userMsg) => {
  const uncertainPhrases = ['not sure', 'help', 'idk', 'i don\'t know', 'unsure', 'maybe', 'dunno'];
  return uncertainPhrases.some(phrase => userMsg.toLowerCase().includes(phrase));
};

const isOffCourseQuestion = (userMsg, currentStage) => {
  const msg = userMsg.toLowerCase();
  
  // Universal off-course indicators
  const offCourseSignals = [
    'what is', 'what does', 'how does', 'why is', 'explain', 'help me understand',
    'can you clarify', 'i don\'t understand', 'confused about', 'what do you mean',
    'tell me more about', 'how do i', 'what if', 'is it possible', 'can we',
    'pedagogy', 'theory', 'research', 'studies show', 'best practices'
  ];
  
  // Stage-specific off-course indicators
  const stageOffCourse = {
    'Ideation': ['teaching methods', 'learning theory', 'student engagement'],
    'Curriculum': ['assessment theory', 'bloom\'s taxonomy', 'differentiation'],
    'Assignments': ['grading rubrics', 'authentic assessment', 'feedback methods']
  };
  
  const universalMatch = offCourseSignals.some(signal => msg.includes(signal));
  const stageSpecificMatch = stageOffCourse[currentStage]?.some(signal => msg.includes(signal)) || false;
  
  return universalMatch || stageSpecificMatch;
};

const getStageReturnMessage = (stage) => {
  const messages = {
    'Ideation': 'Continue building your project foundation',
    'Curriculum': 'Continue designing your learning journey',
    'Assignments': 'Continue creating your assessments'
  };
  return messages[stage] || 'Continue with your project';
};

const getStageProgress = (project, stage) => {
  switch(stage) {
    case 'Ideation':
      const naturalRef = createNaturalReference(project.educatorPerspective, project.subject, project.ageGroup);
      const progressText = naturalRef 
        ? `We're building on your vision for ${project.subject || 'your project'}. ${project.topic ? 'We have your topic. ' : ''}${project.audience ? 'We have your audience. ' : ''}${project.scope ? 'We have your scope. ' : ''}`
        : `We're working on your ${project.subject || 'project'} foundation. ${project.educatorPerspective ? 'We have your motivation. ' : ''}${project.topic ? 'We have your topic. ' : ''}${project.audience ? 'We have your audience. ' : ''}${project.scope ? 'We have your scope. ' : ''}`;
      return progressText;
    case 'Curriculum':
      return `We're designing the learning journey for your ${project.subject || project.topic || 'project'}.`;
    case 'Assignments':
      return `We're creating assessments for your ${project.subject || project.topic || 'project'}.`;
    default:
      return 'We\'re working on your project.';
  }
};

const createNaturalReference = (educatorPerspective, subject, ageGroup) => {
  if (!educatorPerspective) return null;
  
  const perspective = educatorPerspective.toLowerCase();
  let naturalReference = "";
  
  // Extract key themes from their perspective
  if (perspective.includes('engage') || perspective.includes('interest') || perspective.includes('motivate')) {
    naturalReference = "I can see you're focused on creating engaging experiences for your students. ";
  } else if (perspective.includes('real world') || perspective.includes('authentic') || perspective.includes('practical')) {
    naturalReference = "I love that you're thinking about real-world connections. ";
  } else if (perspective.includes('challenge') || perspective.includes('problem') || perspective.includes('solve')) {
    naturalReference = "It sounds like you want to challenge your students with meaningful problems. ";
  } else if (perspective.includes('understand') || perspective.includes('learn') || perspective.includes('grasp')) {
    naturalReference = "I can tell you're focused on deep understanding rather than surface learning. ";
  } else if (perspective.includes('skill') || perspective.includes('prepare') || perspective.includes('build')) {
    naturalReference = "I appreciate your focus on building practical skills. ";
  } else if (perspective.includes('creative') || perspective.includes('innovative') || perspective.includes('design')) {
    naturalReference = "Your interest in creative approaches really comes through. ";
  } else {
    // Generic but still natural
    naturalReference = "I can see you have some thoughtful ideas about this project. ";
  }
  
  // Add contextual follow-up
  if (subject && ageGroup) {
    naturalReference += `Let's build on that thinking for your ${subject} work with ${ageGroup} students. `;
  } else if (subject) {
    naturalReference += `Let's explore how that applies to your ${subject} project. `;
  } else if (ageGroup) {
    naturalReference += `Let's think about how that works with ${ageGroup} students. `;
  }
  
  return naturalReference;
};

const createUniversalReturnResponse = (question, answer, currentStage, project, baseInstructions) => {
  const returnMessage = getStageReturnMessage(currentStage);
  const progressContext = getStageProgress(project, currentStage);
  
  const response = {
    "interactionType": "Standard",
    "currentStage": "Exploration",
    "chatResponse": `${answer}\n\n${progressContext} Ready to ${returnMessage.toLowerCase()}, or do you have more questions?`,
    "isStageComplete": false,
    "turnNumber": 0,
    "persona": AI_PERSONAS.GUIDE,
    "buttons": [returnMessage, "I have another question"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null,
    "guestSpeakerHints": null,
    "curriculumDraft": null,
    "newAssignment": null,
    "assessmentMethods": null,
    "dataToStore": { 
      stage: "Exploration",
      returnToStage: currentStage,
      lastQuestion: question
    }
  };
  
  return baseInstructions + `
## YOUR TASK: Handle off-course question with universal return mechanism.
Provide helpful answer and clear path back to main process.

Return this exact JSON structure:

${JSON.stringify(response, null, 2)}`;
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

  // === UNIVERSAL OFF-COURSE DETECTION ===
  
  // Handle return from exploration to main process
  if (lastUserMsg.toLowerCase().includes('continue building') || 
      lastUserMsg.toLowerCase().includes('continue designing') || 
      lastUserMsg.toLowerCase().includes('continue creating') ||
      lastUserMsg.toLowerCase().includes('continue with')) {
    // Extract return stage from history or use current stage
    const lastAiMessage = history.filter(m => m.role === 'assistant').slice(-1)[0];
    const returnToStage = lastAiMessage?.dataToStore?.returnToStage || currentStage;
    
    // Redirect to appropriate stage workflow
    if (returnToStage === 'Ideation') {
      return getIntakeWorkflow(project, history.filter(m => m.currentStage === 'Ideation'));
    } else if (returnToStage === 'Curriculum') {
      return getCurriculumWorkflow(project, history.filter(m => m.currentStage === 'Curriculum'));
    } else if (returnToStage === 'Assignments') {
      return getAssignmentWorkflow(project, history.filter(m => m.currentStage === 'Assignments'));
    }
  }
  
  // Universal off-course question detection (but exclude "Tell me more about the process")
  if (lastUserMsg && isOffCourseQuestion(lastUserMsg, currentStage) && !lastUserMsg.toLowerCase().includes('tell me more about the process')) {
    // Generate contextual answer based on the question
    let answer = "That's a great question! ";
    
    if (lastUserMsg.toLowerCase().includes('what is') || lastUserMsg.toLowerCase().includes('explain')) {
      answer += "Let me clarify that concept for you. In the context of project-based learning, this relates to creating authentic learning experiences that engage students in real-world problem solving.";
    } else if (lastUserMsg.toLowerCase().includes('pedagogy') || lastUserMsg.toLowerCase().includes('theory')) {
      answer += "The pedagogical foundation here is based on constructivist learning theory and authentic assessment practices. Students learn best when they actively construct knowledge through meaningful experiences.";
    } else if (lastUserMsg.toLowerCase().includes('how do') || lastUserMsg.toLowerCase().includes('best practices')) {
      answer += "Based on educational research and best practices, the key is to maintain authentic connections between learning activities and real-world applications while scaffolding student success.";
    } else {
      answer += "This connects to our project design approach where we prioritize student agency, authentic challenges, and meaningful assessment that mirrors real-world work.";
    }
    
    return createUniversalReturnResponse(lastUserMsg, answer, currentStage, project, baseInstructions);
  }

  // === GOLD-PATH CONVERSATIONAL FLOW ===

  // 0. WELCOME & CONTEXT
  if (currentStage === 'Ideation' && history.length === 0) {
    // Create personalized welcome message using onboarding data
    const hasOnboardingData = project.subject && project.ageGroup;
    const personalizedGreeting = hasOnboardingData 
      ? `Welcome to ProjectCraft! I can see you're working on ${project.subject} for ${project.ageGroup}. ${project.educatorPerspective ? `Your vision to ${project.educatorPerspective.toLowerCase()} is exactly what makes great projects! ` : ''}Together we'll design this project in three stages: Ideation, Learning Journey, and Student Deliverables. Ready to capture your first thoughts on ${project.subject} for ${project.ageGroup}?`
      : "Welcome to ProjectCraft! Together we'll design a project in three stages: Ideation, Learning Journey, and Student Deliverables. Ready to capture your first thoughts?";
    
    const welcomeResponse = {
      "interactionType": "Welcome",
      "currentStage": "WELCOME",
      "chatResponse": personalizedGreeting,
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
  if ((currentStage === 'Ideation' || currentStage === 'WELCOME' || currentStage === 'FrameworkReview') && lastUserMsg.toLowerCase().includes('process')) {
    const processOverviewResponse = {
      "interactionType": "ProjectCraftMethod",
      "currentStage": "FrameworkReview",
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
      "dataToStore": { stage: "FrameworkReview" }
    };
    
    return baseInstructions + `
## YOUR TASK: Show the enhanced framework overview.
Use the ProjectCraftMethod interaction type to trigger the enhanced FrameworkOverview component.

Return this exact JSON structure:

${JSON.stringify(processOverviewResponse, null, 2)}`;
  }

  // Handle framework questions and guide back to ideation
  if (currentStage === 'Ideation' && lastUserMsg.toLowerCase().includes('questions')) {
    const questionsResponse = {
      "interactionType": "Standard",
      "currentStage": "FrameworkQ&A",
      "chatResponse": "Great! I'm here to answer any questions about the Active Learning Framework. What would you like to know more about?",
      "isStageComplete": false,
      "turnNumber": 0,
      "persona": AI_PERSONAS.GUIDE,
      "buttons": ["How does ALF differ from traditional teaching?", "What makes a good Big Idea?", "How long does each stage take?", "Ready to start my project"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { stage: "FrameworkQ&A" }
    };
    
    return baseInstructions + `
## YOUR TASK: Enter Q&A mode about the framework.
Provide helpful guidance options and a clear path back to starting the project.

Return this exact JSON structure:

${JSON.stringify(questionsResponse, null, 2)}`;
  }

  // Handle framework Q&A responses and provide path back to ideation
  if (lastUserMsg.toLowerCase().includes('ready to start') || lastUserMsg.toLowerCase().includes('start my project')) {
    // This will trigger the normal ideation flow below
    return getIntakeWorkflow(project, []);
  }

  // Handle "I have another question" - open input with guidance (works in any stage)
  if (lastUserMsg.toLowerCase().includes('another question')) {
    const stageContext = getStageProgress(project, currentStage);
    
    const openQuestionResponse = {
      "interactionType": "Standard",
      "currentStage": "Exploration",
      "chatResponse": `Perfect! Ask me anything about the Active Learning Framework, project design, or how ProjectCraft works. I'm here to help clarify before we continue.\n\n${stageContext}`,
      "isStageComplete": false,
      "turnNumber": 1,
      "persona": AI_PERSONAS.GUIDE,
      "buttons": null, // Only input bar - no preset buttons
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { 
        stage: "Exploration",
        returnToStage: currentStage
      }
    };
    
    return baseInstructions + `
## YOUR TASK: Open input for any questions with stage context.
Show only the input bar (no buttons) to allow free-form questions.

Return this exact JSON structure:

${JSON.stringify(openQuestionResponse, null, 2)}`;
  }


  // Handle specific framework questions with guided return
  if (currentStage === 'Ideation' && (
    lastUserMsg.toLowerCase().includes('differ from traditional') ||
    lastUserMsg.toLowerCase().includes('big idea') ||
    lastUserMsg.toLowerCase().includes('how long') ||
    lastUserMsg.toLowerCase().includes('stage take')
  )) {
    let answer = "";
    
    if (lastUserMsg.toLowerCase().includes('differ from traditional')) {
      answer = "Traditional teaching often follows a 'sage on the stage' model where teachers deliver content and students passively receive it. ALF flips this by starting with authentic, real-world challenges that students actively investigate. Instead of learning abstract concepts first, students encounter problems that make the learning relevant and necessary.";
    } else if (lastUserMsg.toLowerCase().includes('big idea')) {
      answer = "A good Big Idea connects academic content to real-world applications and sparks genuine curiosity. It should be broad enough to allow multiple entry points but focused enough to guide meaningful investigation. Think: 'How does water quality affect our community?' rather than just 'Learn about chemistry.'";
    } else if (lastUserMsg.toLowerCase().includes('how long') || lastUserMsg.toLowerCase().includes('stage take')) {
      answer = "The timeline varies by project scope. Ideation typically takes 1-2 planning sessions, Curriculum development can take 2-4 hours of design time, and Assignments design usually takes 1-2 hours. The actual student experience can range from 1 week to a full semester depending on your scope.";
    }

    const frameworkAnswerResponse = {
      "interactionType": "Standard",
      "currentStage": "FrameworkQ&A",
      "chatResponse": `${answer}\n\nAny other questions about the framework, or ready to start designing your project?`,
      "isStageComplete": false,
      "turnNumber": 1,
      "persona": AI_PERSONAS.GUIDE,
      "buttons": ["I have another question", "Ready to start my project"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "guestSpeakerHints": null,
      "curriculumDraft": null,
      "newAssignment": null,
      "assessmentMethods": null,
      "dataToStore": { stage: "FrameworkQ&A" }
    };
    
    return baseInstructions + `
## YOUR TASK: Answer framework question and provide clear next steps.

Return this exact JSON structure:

${JSON.stringify(frameworkAnswerResponse, null, 2)}`;
  }

  // Handle any other framework-related questions in Q&A mode
  if (currentStage === 'Ideation' && history.length > 0) {
    const lastAiMessage = history.filter(m => m.role === 'assistant').slice(-1)[0];
    if (lastAiMessage && (lastAiMessage.currentStage === 'FrameworkQ&A' || lastAiMessage.currentStage === 'FrameworkReview')) {
      const generalFrameworkResponse = {
        "interactionType": "Standard",
        "currentStage": "FrameworkQ&A",
        "chatResponse": `That's a great question about the framework! Let me address that for you.\n\nBased on your question, here's what you should know: The Active Learning Framework is designed to be flexible and adaptable to your specific context and students. The key is starting with authentic challenges that connect to real-world applications.\n\nWould you like to explore more about the framework, or are you ready to start designing your project?`,
        "isStageComplete": false,
        "turnNumber": 2,
        "persona": AI_PERSONAS.GUIDE,
        "buttons": ["Tell me more about ALF", "Ready to start my project"],
        "suggestions": null,
        "frameworkOverview": null,
        "summary": null,
        "guestSpeakerHints": null,
        "curriculumDraft": null,
        "newAssignment": null,
        "assessmentMethods": null,
        "dataToStore": { stage: "FrameworkQ&A" }
      };
      
      return baseInstructions + `
## YOUR TASK: Handle general framework question and guide back to project start.
Provide a helpful response and clear options to continue.

Return this exact JSON structure:

${JSON.stringify(generalFrameworkResponse, null, 2)}`;
    }
  }

  // Handle welcome response and transition to ideation
  if ((currentStage === 'Ideation' || currentStage === 'WELCOME' || currentStage === 'FrameworkReview') && (lastUserMsg.toLowerCase().includes('yes') || lastUserMsg.toLowerCase().includes('start') || lastUserMsg.toLowerCase().includes('got it'))) {
    // Check if educator perspective already exists from onboarding
    const hasEducatorPerspective = project.educatorPerspective && project.educatorPerspective.trim().length > 0;
    const naturalReference = createNaturalReference(project.educatorPerspective, project.subject, project.ageGroup);
    
    // DEBUG: Let's see what we actually have
    console.log('DEBUG - Onboarding data:', {
      educatorPerspective: project.educatorPerspective,
      subject: project.subject,
      ageGroup: project.ageGroup,
      hasEducatorPerspective: hasEducatorPerspective,
      naturalReference: naturalReference
    });
    
    const startIdeationResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation",
      "chatResponse": hasEducatorPerspective 
        ? `Perfect! ${naturalReference}What specific topic or theme will students explore?`
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
  ? 'Use natural conversation to acknowledge their onboarding perspective and move to topic refinement.'
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
    
    const naturalSummary = createNaturalReference(project.educatorPerspective, project.subject, project.ageGroup);
    const summaryText = naturalSummary 
      ? `Perfect! ${naturalSummary}We're focusing on ${project.topic || project.subject} for ${project.audience || project.ageGroup} over ${project.scope || project.projectScope}.`
      : `Perfect! We're focusing on ${project.topic || project.subject} for ${project.audience || project.ageGroup} over ${project.scope || project.projectScope}.`;
    
    const suggestionsResponse = {
      "interactionType": "Guide",
      "currentStage": "Ideation",
      "chatResponse": `${summaryText}\n\nNow for three catalyst directions:\n1. ${suggestions[0]?.title || 'Investigate local applications'}\n2. ${suggestions[1]?.title || 'Design solutions for real challenges'} \n3. ${suggestions[2]?.title || 'Create prototypes for community impact'}\n\nWhich sparks joy—or should we remix?`,
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

// === CURRICULUM WORKFLOW WITH UNIVERSAL NAVIGATION ===
export const getCurriculumWorkflow = (project, history = []) => {
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const currentStage = 'Curriculum';
  const turnNumber = getTurnNumber(history, currentStage);
  
  const baseInstructions = `
# AI TASK: CURRICULUM DESIGN WORKFLOW
You are ProjectCraft Coach implementing curriculum design with universal navigation.

## CURRENT CONTEXT:
- Stage: ${currentStage}
- Turn: ${turnNumber}
- Subject: ${project.subject || "unknown"}
- Age Group: ${project.ageGroup || "unknown"}

## CRITICAL INSTRUCTIONS:
- Follow curriculum design workflow
- Handle off-course questions with universal return mechanism
- Maintain context and provide clear navigation back to curriculum design
`;

  // Universal off-course question detection for curriculum stage
  if (lastUserMsg && isOffCourseQuestion(lastUserMsg, currentStage)) {
    let answer = "That's a great curriculum design question! ";
    
    if (lastUserMsg.toLowerCase().includes('assessment') || lastUserMsg.toLowerCase().includes('grading')) {
      answer += "For curriculum design, we focus on backward design - starting with authentic assessment and building learning experiences that prepare students for meaningful demonstration of their learning.";
    } else if (lastUserMsg.toLowerCase().includes('differentiation') || lastUserMsg.toLowerCase().includes('scaffolding')) {
      answer += "Effective curriculum scaffolding means breaking complex skills into manageable chunks while maintaining connection to the authentic challenge. Each activity should build toward real-world application.";
    } else {
      answer += "In curriculum design, we prioritize authentic learning experiences that connect academic content to real-world applications while building necessary skills systematically.";
    }
    
    return createUniversalReturnResponse(lastUserMsg, answer, currentStage, project, baseInstructions);
  }

  // Handle return from exploration
  if (lastUserMsg.toLowerCase().includes('continue designing')) {
    return getCurriculumWorkflow(project, history.filter(m => m.currentStage === 'Curriculum'));
  }

  return handleLearningJourneyStage(project, history, lastUserMsg, turnNumber, baseInstructions);
};

// === ASSIGNMENTS WORKFLOW WITH UNIVERSAL NAVIGATION ===
export const getAssignmentWorkflow = (project, history = []) => {
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const currentStage = 'Assignments';
  const turnNumber = getTurnNumber(history, currentStage);
  
  const baseInstructions = `
# AI TASK: ASSIGNMENTS DESIGN WORKFLOW
You are ProjectCraft Coach implementing assignment design with universal navigation.

## CURRENT CONTEXT:
- Stage: ${currentStage}
- Turn: ${turnNumber}
- Subject: ${project.subject || "unknown"}
- Age Group: ${project.ageGroup || "unknown"}

## CRITICAL INSTRUCTIONS:
- Follow assignment design workflow
- Handle off-course questions with universal return mechanism
- Maintain context and provide clear navigation back to assignment creation
`;

  // Universal off-course question detection for assignments stage
  if (lastUserMsg && isOffCourseQuestion(lastUserMsg, currentStage)) {
    let answer = "That's an excellent question about authentic assessment! ";
    
    if (lastUserMsg.toLowerCase().includes('rubric') || lastUserMsg.toLowerCase().includes('grading')) {
      answer += "Effective rubrics focus on real-world quality indicators rather than just academic compliance. They should reflect how this work would be evaluated in authentic contexts.";
    } else if (lastUserMsg.toLowerCase().includes('authentic assessment') || lastUserMsg.toLowerCase().includes('real-world')) {
      answer += "Authentic assessment mirrors how professionals in the field actually demonstrate competency. Students should create products and performances that have genuine purpose and audience.";
    } else {
      answer += "In assignment design, we create assessments that feel meaningful to students because they connect to real-world applications and allow students to demonstrate learning in authentic ways.";
    }
    
    return createUniversalReturnResponse(lastUserMsg, answer, currentStage, project, baseInstructions);
  }

  // Handle return from exploration
  if (lastUserMsg.toLowerCase().includes('continue creating')) {
    return getAssignmentWorkflow(project, history.filter(m => m.currentStage === 'Assignments'));
  }

  return handleDeliverablesStage(project, history, lastUserMsg, turnNumber, baseInstructions);
};