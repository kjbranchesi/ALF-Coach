// src/prompts/workflows.js - HOLISTIC REPAIR: FIXED TEMPLATE INTERPOLATION
// This version properly interpolates project variables and creates intelligent conversational flow

// --- 1. Ideation Workflow - The Heart of ProjectCraft ---
export const getIntakeWorkflow = (project, history = []) => {
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const hasSeenSuggestions = history.some(m => m.suggestions?.length > 0);
  
  // Extract project context with safe defaults
  const subject = project.subject || "your subject area";
  const ageGroup = project.ageGroup || "students";
  const perspective = project.educatorPerspective || "the learning goals you've outlined";
  
  const baseInstructions = `
# STAGE 1: IDEATION - Transforming Vision into Pedagogical Design
You are an expert educational designer helping an educator create a project about "${subject}" for ${ageGroup}.
Their vision centers on: "${perspective}"

## CRITICAL INSTRUCTIONS
- **Use Real Context**: You must reference the actual subject "${subject}" and age group "${ageGroup}" in your responses
- **Be Intelligent**: Transform their perspective "${perspective}" into pedagogical language, don't repeat it verbatim
- **Framework Focus**: Guide them to define a Big Idea, Guiding Question, and Challenge that drives student engagement
- **Pedagogical Reasoning**: Always explain WHY your suggestions work for ${ageGroup} learners
- **Clean JSON**: Return complete, valid JSON with all required fields (use null for unused fields)
- **Natural Voice**: Sound like an experienced educator, not a chatbot

## JSON STRUCTURE REQUIRED:
All responses must include: interactionType, currentStage, chatResponse, isStageComplete, and appropriate optional fields.
`;

  // --- Event-Driven Conversational Logic ---

  // Initial Welcome - Set the tone and establish context
  if (history.length === 0) {
    const welcomeResponse = {
      "interactionType": "Welcome",
      "currentStage": "Ideation",
      "chatResponse": `Welcome to ProjectCraft! I'm excited to help you design a meaningful ${subject} project for your ${ageGroup} students.\n\nI can see you're thinking about ${perspective}. That's a rich foundation for creating something truly engaging. Would you like me to walk you through our research-based design process, or shall we dive right into exploring how to turn your vision into a compelling learning experience?`,
      "isStageComplete": false,
      "buttons": ["Explain the design process", "Let's start designing!"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null
    };
    
    return baseInstructions + `
## YOUR TASK: Provide a warm, contextual welcome that shows you understand their vision.
Reference their specific subject and age group. Offer to explain the process or dive right in.

Return this exact JSON structure:

${JSON.stringify(welcomeResponse, null, 2)}`;
  }

  // Framework Explanation - Show the pedagogical structure
  if (lastUserMsg.toLowerCase().includes("process") || lastUserMsg.toLowerCase().includes("explain")) {
    const frameworkResponse = {
      "interactionType": "Framework",
      "currentStage": "Ideation", 
      "chatResponse": `Perfect! Our Active Learning Framework ensures your ${subject} project creates deep, lasting engagement for ${ageGroup} learners. Here's our journey:`,
      "frameworkOverview": {
        "title": "The ProjectCraft Design Process",
        "introduction": `We'll transform your vision about ${perspective} into a project that makes ${subject} irresistible to ${ageGroup} students.`,
        "stages": [
          {"title": "Stage 1: Ideation (We're here!)", "purpose": "We'll crystallize your vision into a compelling 'Big Idea', 'Guiding Question', and 'Challenge' that drives student curiosity."},
          {"title": "Stage 2: Learning Journey", "purpose": "We'll design scaffolded activities that build skills while maintaining engagement through the challenge."},
          {"title": "Stage 3: Authentic Assessment", "purpose": "We'll create meaningful ways for students to demonstrate mastery through real-world application."}
        ]
      },
      "buttons": ["I understand, let's begin!", "Tell me more about the research"],
      "isStageComplete": false,
      "suggestions": null,
      "summary": null
    };
    
    return baseInstructions + `
## YOUR TASK: Explain the ProjectCraft framework clearly and contextually.
Show how this process will transform their ${subject} vision into student-centered learning.

Return this exact JSON structure:

${JSON.stringify(frameworkResponse, null, 2)}`;
  }

  // Initial Suggestions - Provide grounded, contextual directions
  if (!hasSeenSuggestions) {
    const contextualSuggestions = generateContextualSuggestions(subject, ageGroup);
    
    const suggestionsResponse = {
      "interactionType": "Guide",
      "currentStage": "Ideation",
      "chatResponse": `Excellent! Your focus on ${perspective} offers rich possibilities for ${ageGroup} to engage with ${subject} in meaningful ways.\n\nOur first step is defining a **Big Idea** - the central concept that makes this project intellectually compelling. This becomes the lens through which students explore ${subject}. Based on your vision, here are three directions we could take:`,
      "isStageComplete": false,
      "suggestions": contextualSuggestions,
      "buttons": ["I like one of these directions", "I want to explore a different angle"],
      "frameworkOverview": null,
      "summary": null
    };
    
    return baseInstructions + `
## YOUR TASK: Ground the conversation with intelligent analysis and contextual suggestions.
First, synthesize their vision to show understanding. Then explain why defining a Big Idea matters for ${ageGroup}. Finally, offer three distinct directions.

Return this exact JSON structure:

${JSON.stringify(suggestionsResponse, null, 2)}`;
  }

  // Stage Completion - Finalize the Ideation with concrete outcomes
  if (lastUserMsg.toLowerCase().includes("perfect") || lastUserMsg.toLowerCase().includes("let's go with") || lastUserMsg.toLowerCase().includes("that works")) {
    const finalizedProject = generateFinalizedProject(subject, ageGroup);
    
    const completionResponse = {
      "interactionType": "Standard",
      "currentStage": "Ideation",
      "chatResponse": `Perfect! We've transformed your vision into a solid foundation for learning. Your ${subject} project now has a clear Big Idea and Challenge that will drive student engagement.\n\nThis framework ensures ${ageGroup} students see ${subject} as relevant and actionable. Ready to design the Learning Journey that will prepare them for this challenge?`,
      "isStageComplete": true,
      "summary": finalizedProject,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null
    };
    
    return baseInstructions + `
## YOUR TASK: Complete the Ideation stage with a concrete project foundation.
Provide a clear summary with specific, actionable content (no placeholders). Set isStageComplete to true.

Return this exact JSON structure:

${JSON.stringify(completionResponse, null, 2)}`;
  }
  
  // Default: Continue refining the Big Idea
  const defaultResponse = {
    "interactionType": "Standard",
    "currentStage": "Ideation",
    "chatResponse": `That's a promising direction! Let's focus on making this resonate with ${ageGroup} students. How might we frame this as a Big Idea that captures their imagination? For ${subject}, we want something that feels both accessible and intellectually challenging for their developmental stage.`,
    "isStageComplete": false,
    "buttons": ["That makes sense", "Help me refine this", "I need more guidance"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null
  };
  
  return baseInstructions + `
## YOUR TASK: Help them refine their chosen direction.
Respond thoughtfully to "${lastUserMsg}". Guide them toward a clear Big Idea and Challenge for ${ageGroup}.

Return this exact JSON structure:

${JSON.stringify(defaultResponse, null, 2)}`;
};

// --- Helper Functions for Dynamic Content Generation ---

function generateContextualSuggestions(subject, ageGroup) {
  // Generate subject-specific suggestions based on common educational themes
  if (subject.toLowerCase().includes('media') || subject.toLowerCase().includes('art')) {
    return [
      `Big Idea: 'Storytelling as Social Change' - Students investigate how ${subject} can amplify important community voices`,
      `Big Idea: 'Design for Impact' - Students create ${subject} projects that address real problems facing ${ageGroup} today`,
      `Big Idea: 'Cultural Bridge-Building' - Students use ${subject} to explore and share diverse perspectives in their community`
    ];
  } else if (subject.toLowerCase().includes('science')) {
    return [
      `Big Idea: 'Science in Action' - Students use ${subject} to solve authentic problems in their community`,
      `Big Idea: 'Future Innovators' - Students design solutions that could improve life for ${ageGroup} in 10 years`,
      `Big Idea: 'Local Experts' - Students become researchers studying ${subject} phenomena in their own environment`
    ];
  } else if (subject.toLowerCase().includes('history') || subject.toLowerCase().includes('social')) {
    return [
      `Big Idea: 'Voices from the Past' - Students uncover untold stories that connect to their community today`,
      `Big Idea: 'Change Makers' - Students study how ${ageGroup} throughout history created positive change`,
      `Big Idea: 'Living History' - Students document current events as primary sources for future learners`
    ];
  } else {
    return [
      `Big Idea: 'Real-World Relevance' - Students apply ${subject} concepts to solve problems that matter to ${ageGroup}`,
      `Big Idea: 'Creative Problem Solving' - Students use ${subject} as a tool for innovative thinking and expression`,
      `Big Idea: 'Community Connection' - Students explore how ${subject} connects them to their local and global communities`
    ];
  }
}

function generateFinalizedProject(subject, ageGroup) {
  return {
    "title": `${subject} Project: Making It Matter`,
    "abstract": `An inquiry-driven ${subject} project where ${ageGroup} learners tackle authentic challenges, developing both subject mastery and real-world problem-solving skills.`,
    "coreIdea": `How can ${ageGroup} use ${subject} as a tool for positive impact in their community?`,
    "challenge": `Design and implement a ${subject}-based solution to a real problem facing your community, documenting your process and impact.`
  };
}

// --- 2. Curriculum Workflow ---
export const getCurriculumWorkflow = (project) => {
  const subject = project.subject || "your subject";
  const ageGroup = project.ageGroup || "students";
  const coreIdea = project.coreIdea || "the big idea";
  const challenge = project.challenge || "the project challenge";
  
  const curriculumResponse = {
    "interactionType": "Welcome",
    "currentStage": "Curriculum", 
    "chatResponse": `Now let's design the learning journey that will prepare your ${ageGroup} students to tackle: '${challenge}'\n\nI recommend building this around three key phases: **Investigate** (building foundational knowledge), **Analyze** (developing critical thinking), and **Create** (applying learning to the challenge). This sequence ensures students have both the skills and confidence to succeed. Does this structure work for your vision?`,
    "isStageComplete": false,
    "buttons": ["Yes, let's build this structure", "I have a different sequence in mind"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null
  };
  
  return `
# STAGE 2: LEARNING JOURNEY DESIGN
You are designing the curriculum for "${project.title}".
Subject: ${subject} | Age Group: ${ageGroup}
Big Idea: ${coreIdea}
Challenge: ${challenge}

## YOUR TASK: Welcome them to curriculum design and propose a learning sequence.
Explain how you'll build a pathway that prepares ${ageGroup} students for success with the challenge.

Return this exact JSON structure:

${JSON.stringify(curriculumResponse, null, 2)}`;
};

// --- 3. Assignments Workflow ---
export const getAssignmentWorkflow = (project) => {
  const subject = project.subject || "your subject";
  const ageGroup = project.ageGroup || "students";
  const challenge = project.challenge || "the project challenge";
  
  const assignmentResponse = {
    "interactionType": "Welcome",
    "currentStage": "Assignments",
    "chatResponse": `Time to design how your ${ageGroup} students will demonstrate their ${subject} mastery! Instead of traditional tests, we'll create authentic assessments that mirror real-world work.\n\nBased on your challenge, students should show both their ${subject} understanding AND their problem-solving process. What kind of final demonstration would best showcase their learning?`,
    "isStageComplete": false,
    "buttons": ["A public presentation", "A portfolio of work", "A functional prototype"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null
  };
  
  return `
# STAGE 3: AUTHENTIC ASSESSMENT DESIGN
You are designing assessments for "${project.title}".
Subject: ${subject} | Age Group: ${ageGroup}
Challenge: ${challenge}

## YOUR TASK: Welcome them to assessment design and explain authentic assessment.
Focus on how ${ageGroup} students will demonstrate their ${subject} learning through real-world application.

Return this exact JSON structure:

${JSON.stringify(assignmentResponse, null, 2)}`;
};