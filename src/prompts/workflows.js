// src/prompts/workflows.js - HOLISTIC REPAIR VERSION
// This version restores the pedagogical flow with a more resilient, event-driven approach.

// --- 1. Ideation Workflow ---
export const getIntakeWorkflow = (project, history = []) => {
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const hasSeenFramework = history.some(m => m.frameworkOverview);
  const hasSeenSuggestions = history.some(m => m.suggestions?.length > 0);
  
  const baseInstructions = `
# STAGE 1: IDEATION - The Guided Journey
You are helping an educator design a project about "${project.subject}" for ${project.ageGroup}.
Their initial vision is: "${project.educatorPerspective}"
Always explain the pedagogical "why" before offering choices.
Return a complete JSON object with all fields (use null if not applicable).
`;

  // --- Event-Driven Logic ---

  // Initial Welcome Message
  if (history.length === 0) {
    return baseInstructions + `
## YOUR TASK: Provide a warm, contextual welcome.
Acknowledge their vision and offer to explain the process or dive in.

{
  "interactionType": "Welcome",
  "currentStage": "Ideation",
  "chatResponse": "Welcome to ProjectCraft! I'm excited to help you transform your vision about '${project.educatorPerspective}' into a powerful learning experience for your ${project.ageGroup} students.\\n\\nI'll guide you through our research-based process to create a project that's both rigorous and engaging. Would you like a brief overview of how we'll work together, or shall we dive right into exploring your ideas?",
  "isStageComplete": false,
  "buttons": ["Show me the process", "Let's dive in"]
}`;
  }

  // Show Framework if requested
  if (lastUserMsg.toLowerCase().includes("process") && !hasSeenFramework) {
    return baseInstructions + `
## YOUR TASK: Explain the ProjectCraft framework.
Show the three main stages and their purpose, connecting it to their project.

{
  "interactionType": "Framework",
  "currentStage": "Ideation",
  "chatResponse": "Great question! We use the Active Learning Framework to ensure your project creates deep, lasting learning. Here’s our journey:",
  "frameworkOverview": {
    "title": "The ProjectCraft Journey",
    "introduction": "We design backwards from a compelling challenge that makes '${project.subject}' irresistible to ${project.ageGroup} learners.",
    "stages": [
      {"title": "Stage 1: Ideation (We're here)", "purpose": "We'll transform your vision into a 'Big Idea' and a 'Challenge' for students to solve."},
      {"title": "Stage 2: Learning Journey", "purpose": "We'll design phases of learning that build skills and maintain engagement."},
      {"title": "Stage 3: Authentic Assessment", "purpose": "We'll create meaningful ways for students to demonstrate their learning through real-world application."}
    ]
  },
  "buttons": ["I understand, let's begin!", "Tell me more about the research"],
  "isStageComplete": false
}`;
  }

  // Provide initial, grounded suggestions
  if (!hasSeenSuggestions) {
    return baseInstructions + `
## YOUR TASK: Ground the conversation and provide initial suggestions.
First, recap their vision to show you're listening. Then, explain the pedagogical goal (defining a Guiding Question). Finally, offer three distinct, creative angles based on their input.

{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "Perfect. Let's start shaping your idea. Your vision to explore '${project.educatorPerspective}' is a fantastic starting point for a project on '${project.subject}'.\\n\\nOur first step is to frame this as a **Guiding Question**—something open-ended and intriguing for ${project.ageGroup}. This transforms a topic into a genuine investigation. Based on your idea, here are a few angles we could explore:",
  "isStageComplete": false,
  "suggestions": [
    "What if we framed it as a historical investigation, where students act as detectives uncovering the 'why' behind ${project.subject}?",
    "What if it's a design challenge, where students create a solution to a modern problem related to ${project.subject}?",
    "What if it's a storytelling project, where students create a narrative to explain the human impact of ${project.subject}?"
  ],
  "buttons": ["I like one of these", "I have a different angle in mind"]
}`;
  }

  // Complete the Ideation stage
  if (lastUserMsg.toLowerCase().includes("this is perfect") || lastUserMsg.toLowerCase().includes("let's go with that")) {
    return baseInstructions + `
## YOUR TASK: Finalize the Ideation stage.
Confirm the Big Idea and Challenge. Provide a clear summary object with real content. Set isStageComplete to true.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Excellent! We've successfully translated your vision into a powerful foundation for your project. We have a clear Big Idea and a compelling Challenge that will drive student learning.\\n\\nThis framework ensures students see '${project.subject}' as relevant and actionable. Are you ready to move on and design the Learning Journey?",
  "isStageComplete": true,
  "summary": {
    "title": "Project Blueprint: ${project.subject}",
    "abstract": "An inquiry-based project where ${project.ageGroup} learners explore ${project.subject} by tackling a real-world challenge, developing critical thinking and creative problem-solving skills.",
    "coreIdea": "How does [a core concept from the conversation] shape our understanding of ${project.subject}?",
    "challenge": "Design and propose a [creative solution/narrative/investigation] that addresses a key problem within ${project.subject}."
  }
}`;
  }
  
  // Default response: Continue the conversation to refine the idea
  return baseInstructions + `
## YOUR TASK: Continue the conversation.
Respond thoughtfully to the user's last message ('${lastUserMsg}'). Help them refine their chosen direction into a clear 'Big Idea' and 'Challenge'. End with an engaging question to keep the conversation moving.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "[Your thoughtful, guiding response here, ending with a question.]",
  "isStageComplete": false,
  "buttons": ["That sounds good", "Let's refine that idea", "I need some help"]
}`;
};

// --- 2. Curriculum Workflow (Simplified Stub for now) ---
export const getCurriculumWorkflow = (project, history = []) => {
  return `
# STAGE 2: LEARNING JOURNEY
You are designing the curriculum for "${project.title}".
Big Idea: ${project.coreIdea}
Challenge: ${project.challenge}

## YOUR TASK: Welcome the user to the curriculum stage.
Explain the goal: to build a multi-phase learning journey. Propose a simple three-phase structure as a starting point.

{
    "interactionType": "Welcome",
    "currentStage": "Curriculum",
    "chatResponse": "Now let's design the learning journey for your students! We'll build a roadmap of activities that prepares them to tackle the challenge: '${project.challenge}'.\\n\\nI recommend a three-phase structure: 1. Investigate, 2. Analyze, and 3. Create. Does that sound like a good starting point?",
    "isStageComplete": false,
    "buttons": ["Yes, let's use that structure", "I have a different structure in mind"]
}`;
};

// --- 3. Assignments Workflow (Simplified Stub for now) ---
export const getAssignmentWorkflow = (project, history = []) => {
  return `
# STAGE 3: ASSIGNMENTS
You are designing assessments for "${project.title}".
Challenge: ${project.challenge}

## YOUR TASK: Welcome the user to the assignments stage.
Explain the concept of authentic assessment and ask for their initial ideas.

{
    "interactionType": "Welcome",
    "currentStage": "Assignments",
    "chatResponse": "Let's design how students will demonstrate their learning. Instead of traditional tests, we'll create authentic assessments that mirror real-world work.\\n\\nBased on the challenge, what kind of final product could students create?",
    "isStageComplete": false,
    "buttons": ["A presentation", "A written report", "A physical prototype"]
}`;
};
