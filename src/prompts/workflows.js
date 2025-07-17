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
Their initial vision is about: "${project.educatorPerspective}"

## YOUR GUIDING PRINCIPLES
- **Be a Partner, Not a Parrot:** Do not repeat the user's input verbatim. Summarize and rephrase their ideas to show you understand the concept.
- **Focus on the Framework:** Your primary goal is to help the user define the three core components of the "Catalyst" stage: the Big Idea, the Guiding Question, and the Challenge.
- **Explain the "Why":** Always explain the pedagogical reasoning behind your suggestions.
- **Return Clean JSON:** Ensure you return a complete JSON object with all fields (use null if not applicable).
`;

  // --- Event-Driven Logic ---

  // Initial Welcome Message
  if (history.length === 0) {
    return baseInstructions + `
## YOUR TASK: Provide a warm, contextual welcome.
Acknowledge the core theme of their vision and offer to explain the process or dive in.

{
  "interactionType": "Welcome",
  "currentStage": "Ideation",
  "chatResponse": "Welcome to ProjectCraft! I'm excited to help you transform your vision for a project about ${project.subject} into a powerful learning experience for your ${project.ageGroup} students.\\n\\nI'll guide you through our research-based process to create a project that's both rigorous and engaging. Would you like a brief overview of how we'll work together, or shall we dive right into exploring your ideas?",
  "isStageComplete": false,
  "buttons": ["Show me the process", "Let's dive in"]
}`;
  }

  // Show Framework if requested
  if (lastUserMsg.toLowerCase().includes("process") && !hasSeenFramework) {
    return baseInstructions + `
## YOUR TASK: Explain the ProjectCraft framework.
Introduce the three main stages and their purpose naturally.

{
  "interactionType": "Framework",
  "currentStage": "Ideation",
  "chatResponse": "Of course. We use the Active Learning Framework to ensure your project creates deep, lasting learning. Here’s our journey:",
  "frameworkOverview": {
    "title": "The ProjectCraft Journey",
    "introduction": "We design backwards from a compelling challenge that makes '${project.subject}' irresistible to ${project.ageGroup} learners.",
    "stages": [
      {"title": "Stage 1: Ideation (We're here)", "purpose": "We'll transform your vision into a 'Big Idea', a 'Guiding Question', and a 'Challenge' for students to solve."},
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
First, rephrase their vision to show understanding. Then, explain the pedagogical goal of defining a **Big Idea** and **Guiding Question**. Finally, offer three distinct angles to help shape these core components.

{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "Perfect. Your idea of exploring the theme of ${project.educatorPerspective} is a fantastic starting point for a project on '${project.subject}'.\\n\\nOur first step is to distill this into a **Big Idea** and a **Guiding Question**. This is the core of the project that makes it intellectually compelling for ${project.ageGroup}. Based on your vision, here are a few ways we could frame that core inquiry:",
  "isStageComplete": false,
  "suggestions": [
    "What if the Big Idea is about 'civic responsibility', and we ask students to investigate how urban planning impacts community well-being?",
    "What if the Big Idea is 'systems thinking', and we challenge students to design a park that balances ecological and human needs?",
    "What if the Big Idea is 'historical narrative', and we ask students to tell the story of a local space and propose its future?"
  ],
  "buttons": ["I like one of these", "I have a different angle in mind"]
}`;
  }

  // Complete the Ideation stage
  if (lastUserMsg.toLowerCase().includes("this is perfect") || lastUserMsg.toLowerCase().includes("let's go with that")) {
    return baseInstructions + `
## YOUR TASK: Finalize the Ideation stage.
Confirm the Big Idea and Challenge. Provide a clear summary object with real, generated content (no placeholders). Set isStageComplete to true.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Excellent! We've successfully translated your vision into a powerful foundation for your project. We have a clear Big Idea and a compelling Challenge that will drive student learning.\\n\\nThis framework ensures students see '${project.subject}' as relevant and actionable. Are you ready to move on and design the Learning Journey?",
  "isStageComplete": true,
  "summary": {
    "title": "A Project on ${project.subject}",
    "abstract": "An inquiry-based project where ${project.ageGroup} learners explore the intersection of community and environment by tackling a real-world design challenge, developing critical thinking and creative problem-solving skills.",
    "coreIdea": "How can thoughtful design transform public spaces to serve both human and ecological needs?",
    "challenge": "Design and propose a revitalization plan for a local park that improves both biodiversity and community well-being."
  }
}`;
  }
  
  // Default response: Continue the conversation to refine the idea
  return baseInstructions + `
## YOUR TASK: Continue the conversation.
Respond thoughtfully to the user's last message ('${lastUserMsg}'). Your goal is to help them refine their chosen direction into a clear 'Big Idea' and 'Challenge'. End with an engaging question.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "That's a great direction. Let's focus on that. How could we phrase that as a 'Big Idea' that students can really sink their teeth into? For example, if the theme is 'community history', the Big Idea could be 'the stories our streets tell'. What do you think?",
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
