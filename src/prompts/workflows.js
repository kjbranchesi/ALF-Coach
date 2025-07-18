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
# AI TASK: STAGE 1 - IDEATION - Transforming Vision into Pedagogical Design
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
      "summary": null,
      "guestSpeakerHints": [
        `Consider inviting a ${subject} professional to share career insights`,
        `Local community experts could provide authentic challenges`,
        `Alumni working in ${subject} fields make great mentors`
      ]
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
      "summary": null,
      "guestSpeakerHints": [
        `Your Big Idea could connect to guest speaker expertise`,
        `Consider what professionals in ${subject} actually do`,
        `Think about community challenges that need solving`
      ]
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
      "summary": null,
      "guestSpeakerHints": [
        `Consider how guest speakers could enhance this project`,
        `Think about authentic audiences for student work`,
        `What professionals could mentor students?`
      ]
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
export const getCurriculumWorkflow = (project, history = []) => {
  const subject = project.subject || "your subject";
  const ageGroup = project.ageGroup || "students";
  const coreIdea = project.coreIdea || "the big idea";
  const challenge = project.challenge || "the project challenge";
  
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const hasCurriculumDraft = project.curriculumDraft && project.curriculumDraft.trim().length > 0;
  
  const baseInstructions = `
# AI TASK: STAGE 2 - LEARNING JOURNEY
You are designing the curriculum for "${project.title}".
Subject: ${subject} | Age Group: ${ageGroup}
Big Idea: ${coreIdea}
Challenge: ${challenge}

## CRITICAL INSTRUCTIONS
- **Create Structured Curriculum**: Generate detailed curriculum content as markdown with phase headers
- **Use Real Context**: Reference the actual subject "${subject}" and challenge "${challenge}"
- **Pedagogical Progression**: Build from foundational knowledge to application
- **Age-Appropriate**: Design activities suitable for ${ageGroup} learners
- **Clean JSON**: Return complete, valid JSON with curriculumDraft as structured markdown
`;

  // Initial welcome to curriculum stage
  if (history.length === 0) {
    const welcomeResponse = {
      "interactionType": "Welcome",
      "currentStage": "Curriculum", 
      "chatResponse": `Now let's design the learning journey that will prepare your ${ageGroup} students to tackle: '${challenge}'\n\nI recommend building this around three key phases: **Investigate** (building foundational knowledge), **Analyze** (developing critical thinking), and **Create** (applying learning to the challenge). This sequence ensures students have both the skills and confidence to succeed. Does this structure work for your vision?`,
      "isStageComplete": false,
      "buttons": ["Yes, let's build this structure", "I have a different sequence in mind"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "curriculumDraft": null
    };
    
    return baseInstructions + `
## YOUR TASK: Welcome them to curriculum design and propose a learning sequence.
Explain how you'll build a pathway that prepares ${ageGroup} students for success with the challenge.

Return this exact JSON structure:

${JSON.stringify(welcomeResponse, null, 2)}`;
  }
  
  // Generate detailed curriculum structure
  if (lastUserMsg.toLowerCase().includes("yes") || lastUserMsg.toLowerCase().includes("build") || lastUserMsg.toLowerCase().includes("structure")) {
    const detailedCurriculumMarkdown = generateCurriculumMarkdown(subject, ageGroup, coreIdea, challenge);
    
    const curriculumResponse = {
      "interactionType": "CurriculumGeneration",
      "currentStage": "Curriculum",
      "chatResponse": `Perfect! I've created a comprehensive learning journey for your ${subject} project. The curriculum is structured in three phases that build toward the final challenge.\n\nEach phase includes specific learning objectives, activities, and assessments. You can see the detailed outline in the sidebar. Would you like me to refine any particular phase or add additional elements?`,
      "isStageComplete": false,
      "buttons": ["This looks great!", "I want to modify a phase", "Add more detail to activities"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "curriculumDraft": detailedCurriculumMarkdown
    };
    
    return baseInstructions + `
## YOUR TASK: Generate a detailed curriculum structure.
Create a comprehensive learning journey with specific phases, objectives, and activities for ${ageGroup} students.

Return this exact JSON structure:

${JSON.stringify(curriculumResponse, null, 2)}`;
  }
  
  // Stage completion
  if (lastUserMsg.toLowerCase().includes("great") || lastUserMsg.toLowerCase().includes("perfect") || lastUserMsg.toLowerCase().includes("looks good")) {
    const completionResponse = {
      "interactionType": "Standard",
      "currentStage": "Curriculum",
      "chatResponse": `Excellent! Your learning journey is complete. The curriculum provides a clear pathway for ${ageGroup} students to develop the skills and knowledge needed to tackle: '${challenge}'\n\nThe three-phase structure ensures students build confidence and competence before attempting the final challenge. Ready to design the authentic assessments that will measure their success?`,
      "isStageComplete": true,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "curriculumDraft": hasCurriculumDraft ? project.curriculumDraft : generateCurriculumMarkdown(subject, ageGroup, coreIdea, challenge)
    };
    
    return baseInstructions + `
## YOUR TASK: Complete the curriculum design stage.
Acknowledge the completed curriculum and transition to the next stage.

Return this exact JSON structure:

${JSON.stringify(completionResponse, null, 2)}`;
  }
  
  // Default response for refinement
  const defaultResponse = {
    "interactionType": "Standard",
    "currentStage": "Curriculum",
    "chatResponse": `I'd be happy to help you refine the curriculum! What specific aspect would you like to adjust? We can modify the pacing, add more activities, or restructure the phases to better fit your ${ageGroup} students' needs.`,
    "isStageComplete": false,
    "buttons": ["Adjust the pacing", "Add more activities", "Restructure phases"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null,
    "curriculumDraft": hasCurriculumDraft ? project.curriculumDraft : null
  };
  
  return baseInstructions + `
## YOUR TASK: Help them refine the curriculum.
Respond thoughtfully to "${lastUserMsg}" and offer specific ways to improve the learning journey.

Return this exact JSON structure:

${JSON.stringify(defaultResponse, null, 2)}`;
};

// Helper function to generate structured curriculum markdown
function generateCurriculumMarkdown(subject, ageGroup, coreIdea, challenge) {
  return `# Learning Journey: ${subject} Project

## Phase 1: Investigate (Weeks 1-3)
**Duration:** 3 weeks
**Objective:** Build foundational knowledge and understand the problem space

### Learning Objectives
- Students will analyze the core concepts of ${subject}
- Students will identify key stakeholders and perspectives
- Students will research existing solutions and approaches

### Activities
- **Week 1:** Introduction to ${subject} fundamentals through multimedia exploration
- **Week 2:** Stakeholder interviews and perspective mapping
- **Week 3:** Research existing solutions and case studies

### Assessment
- Research portfolio documenting key findings
- Stakeholder interview summary and analysis

---

## Phase 2: Analyze (Weeks 4-6)
**Duration:** 3 weeks  
**Objective:** Develop critical thinking and evaluate potential solutions

### Learning Objectives
- Students will critically evaluate different approaches
- Students will identify gaps and opportunities
- Students will synthesize research into actionable insights

### Activities
- **Week 4:** Comparative analysis of existing solutions
- **Week 5:** Gap analysis and opportunity identification
- **Week 6:** Synthesis workshop to develop key insights

### Assessment
- Critical analysis report
- Solution comparison matrix
- Insight presentation to peers

---

## Phase 3: Create (Weeks 7-10)
**Duration:** 4 weeks
**Objective:** Apply learning to develop and implement solutions

### Learning Objectives
- Students will design innovative solutions using ${subject}
- Students will prototype and test their ideas
- Students will iterate based on feedback

### Activities
- **Week 7:** Solution ideation and concept development
- **Week 8:** Prototype creation and initial testing
- **Week 9:** Peer feedback and iteration
- **Week 10:** Final solution development and documentation

### Assessment
- Working prototype or demonstration
- Process documentation and reflection
- Peer evaluation and feedback

---

## Final Challenge
**${challenge}**

Students will present their solutions to authentic community stakeholders, demonstrating both their ${subject} skills and their problem-solving process.`;
}

// --- 3. Assignments Workflow ---
export const getAssignmentWorkflow = (project, history = []) => {
  const subject = project.subject || "your subject";
  const ageGroup = project.ageGroup || "students";
  const challenge = project.challenge || "the project challenge";
  const coreIdea = project.coreIdea || "the big idea";
  
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  const hasAssessmentMethods = project.assessmentMethods && project.assessmentMethods.trim().length > 0;
  
  const baseInstructions = `
# AI TASK: STAGE 3 - STUDENT DELIVERABLES
You are designing assessments for "${project.title}".
Subject: ${subject} | Age Group: ${ageGroup}
Core Idea: ${coreIdea}
Challenge: ${challenge}

## CRITICAL INSTRUCTIONS
- **Create Authentic Assessments**: Design real-world assessments that mirror professional work
- **Use Real Context**: Reference the actual subject "${subject}" and challenge "${challenge}"
- **Age-Appropriate**: Design assessments suitable for ${ageGroup} learners
- **Performance-Based**: Focus on demonstration of skills, not just knowledge recall
- **Clear Rubrics**: Provide detailed rubrics with specific criteria and performance levels
- **Clean JSON**: Return complete, valid JSON with newAssignment objects containing title, description, and rubric
`;

  // Initial welcome to assignments stage
  if (history.length === 0) {
    const welcomeResponse = {
      "interactionType": "Welcome",
      "currentStage": "Assignments",
      "chatResponse": `Time to design how your ${ageGroup} students will demonstrate their ${subject} mastery! Instead of traditional tests, we'll create authentic assessments that mirror real-world work.\n\nBased on your challenge, students should show both their ${subject} understanding AND their problem-solving process. What kind of final demonstration would best showcase their learning?`,
      "isStageComplete": false,
      "buttons": ["A public presentation", "A portfolio of work", "A functional prototype"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": {
        "title": "Project Demonstration",
        "description": `Students will create a comprehensive presentation that demonstrates their ${subject} understanding and problem-solving process.`,
        "type": "presentation"
      },
      "assessmentMethods": null
    };
    
    return baseInstructions + `
## YOUR TASK: Welcome them to assessment design and explain authentic assessment.
Focus on how ${ageGroup} students will demonstrate their ${subject} learning through real-world application.

Return this exact JSON structure:

${JSON.stringify(welcomeResponse, null, 2)}`;
  }
  
  // Generate specific assignments based on user choice
  if (lastUserMsg.toLowerCase().includes("presentation")) {
    const presentationAssignment = generatePresentationAssignment(subject, ageGroup, challenge);
    
    const assignmentResponse = {
      "interactionType": "AssignmentCreation",
      "currentStage": "Assignments",
      "chatResponse": `Perfect! A public presentation is an excellent way for ${ageGroup} students to demonstrate their ${subject} mastery. I've created a detailed assignment that includes clear expectations, process steps, and a comprehensive rubric.\n\nThis presentation format allows students to showcase both their understanding and their problem-solving journey. Would you like me to add more assignments or create the summative assessment framework?`,
      "isStageComplete": false,
      "buttons": ["Add another assignment", "Create summative assessment", "This looks complete"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": presentationAssignment,
      "assessmentMethods": null
    };
    
    return baseInstructions + `
## YOUR TASK: Generate a detailed presentation assignment.
Create a comprehensive assignment with clear expectations and rubric for ${ageGroup} students.

Return this exact JSON structure:

${JSON.stringify(assignmentResponse, null, 2)}`;
  }
  
  if (lastUserMsg.toLowerCase().includes("portfolio")) {
    const portfolioAssignment = generatePortfolioAssignment(subject, ageGroup, challenge);
    
    const assignmentResponse = {
      "interactionType": "AssignmentCreation",
      "currentStage": "Assignments",
      "chatResponse": `Excellent choice! A portfolio allows ${ageGroup} students to showcase their ${subject} learning journey comprehensively. I've designed a portfolio assignment that captures both process and product.\n\nThis format encourages reflection and demonstrates growth over time. Would you like to add complementary assignments or finalize the assessment framework?`,
      "isStageComplete": false,
      "buttons": ["Add another assignment", "Create summative assessment", "This looks complete"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": portfolioAssignment,
      "assessmentMethods": null
    };
    
    return baseInstructions + `
## YOUR TASK: Generate a detailed portfolio assignment.
Create a comprehensive portfolio assignment with clear components and rubric for ${ageGroup} students.

Return this exact JSON structure:

${JSON.stringify(assignmentResponse, null, 2)}`;
  }
  
  if (lastUserMsg.toLowerCase().includes("prototype")) {
    const prototypeAssignment = generatePrototypeAssignment(subject, ageGroup, challenge);
    
    const assignmentResponse = {
      "interactionType": "AssignmentCreation",
      "currentStage": "Assignments",
      "chatResponse": `Fantastic! A functional prototype perfectly aligns with your ${subject} project goals. I've created an assignment that challenges ${ageGroup} students to create, test, and refine their solutions.\n\nThis hands-on approach demonstrates both technical skills and design thinking. Ready to add more assignments or create the overall assessment framework?`,
      "isStageComplete": false,
      "buttons": ["Add another assignment", "Create summative assessment", "This looks complete"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": prototypeAssignment,
      "assessmentMethods": null
    };
    
    return baseInstructions + `
## YOUR TASK: Generate a detailed prototype assignment.
Create a comprehensive prototype assignment with clear requirements and rubric for ${ageGroup} students.

Return this exact JSON structure:

${JSON.stringify(assignmentResponse, null, 2)}`;
  }
  
  // Create summative assessment methods
  if (lastUserMsg.toLowerCase().includes("summative") || lastUserMsg.toLowerCase().includes("assessment")) {
    const summativeAssessment = generateSummativeAssessment(subject, ageGroup);
    
    const assessmentResponse = {
      "interactionType": "AssessmentCreation",
      "currentStage": "Assignments",
      "chatResponse": `Perfect! I've designed a comprehensive summative assessment framework that ties together all the individual assignments. This approach ensures ${ageGroup} students demonstrate both their ${subject} mastery and their problem-solving capabilities.\n\nThe framework includes peer evaluation, self-reflection, and authentic audience feedback. This creates a complete picture of student achievement. Ready to finalize the assessment design?`,
      "isStageComplete": false,
      "buttons": ["This looks great!", "I want to modify something", "Add more detail"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": null,
      "assessmentMethods": summativeAssessment
    };
    
    return baseInstructions + `
## YOUR TASK: Generate comprehensive summative assessment methods.
Create a framework that ties together all assignments and provides holistic evaluation.

Return this exact JSON structure:

${JSON.stringify(assessmentResponse, null, 2)}`;
  }
  
  // Stage completion
  if (lastUserMsg.toLowerCase().includes("great") || lastUserMsg.toLowerCase().includes("complete") || lastUserMsg.toLowerCase().includes("looks good")) {
    const completionResponse = {
      "interactionType": "Standard",
      "currentStage": "Assignments",
      "chatResponse": `Excellent! Your authentic assessment design is complete. The assignments provide multiple ways for ${ageGroup} students to demonstrate their ${subject} mastery while tackling: '${challenge}'\n\nThe assessment framework ensures both individual growth and collective achievement. Your ProjectCraft design is now ready to transform student learning through meaningful, real-world application!`,
      "isStageComplete": true,
      "buttons": null,
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": null,
      "assessmentMethods": hasAssessmentMethods ? project.assessmentMethods : generateSummativeAssessment(subject, ageGroup)
    };
    
    return baseInstructions + `
## YOUR TASK: Complete the assignments stage.
Acknowledge the completed assessment design and celebrate the finished project.

Return this exact JSON structure:

${JSON.stringify(completionResponse, null, 2)}`;
  }
  
  // Add another assignment
  if (lastUserMsg.toLowerCase().includes("another") || lastUserMsg.toLowerCase().includes("add")) {
    const suggestionResponse = {
      "interactionType": "Standard",
      "currentStage": "Assignments",
      "chatResponse": `Great idea! Adding multiple assignments gives ${ageGroup} students various ways to demonstrate their ${subject} learning. What type of additional assignment would complement what you already have?`,
      "isStageComplete": false,
      "buttons": ["Peer evaluation activity", "Reflection journal", "Community presentation", "Digital showcase"],
      "suggestions": null,
      "frameworkOverview": null,
      "summary": null,
      "newAssignment": null,
      "assessmentMethods": null
    };
    
    return baseInstructions + `
## YOUR TASK: Help them add another assignment.
Offer complementary assignment options that enhance the assessment portfolio.

Return this exact JSON structure:

${JSON.stringify(suggestionResponse, null, 2)}`;
  }
  
  // Default response for refinement
  const defaultResponse = {
    "interactionType": "Standard",
    "currentStage": "Assignments",
    "chatResponse": `I'd be happy to help you refine the assessment design! What specific aspect would you like to adjust? We can modify the assignments, adjust the rubrics, or enhance the evaluation criteria to better fit your ${ageGroup} students' needs.`,
    "isStageComplete": false,
    "buttons": ["Modify an assignment", "Adjust rubrics", "Change evaluation criteria"],
    "suggestions": null,
    "frameworkOverview": null,
    "summary": null,
    "newAssignment": null,
    "assessmentMethods": null
  };
  
  return baseInstructions + `
## YOUR TASK: Help them refine the assessment design.
Respond thoughtfully to "${lastUserMsg}" and offer specific ways to improve the assignments.

Return this exact JSON structure:

${JSON.stringify(defaultResponse, null, 2)}`;
};

// Helper functions to generate specific assignment types
function generatePresentationAssignment(subject, ageGroup, challenge) {
  return {
    "title": `${subject} Solution Presentation`,
    "description": `Students will deliver a comprehensive presentation showcasing their solution to the challenge: "${challenge}". The presentation should demonstrate both their ${subject} knowledge and their problem-solving process.\n\n**Requirements:**\n- 8-10 minute presentation with visual aids\n- Clear explanation of the problem and proposed solution\n- Demonstration of ${subject} concepts and techniques used\n- Reflection on the design process and lessons learned\n- Q&A session with authentic audience (peers, community members, or experts)\n\n**Format:**\n- Professional presentation style appropriate for ${ageGroup} learners\n- Visual aids (slides, prototypes, or multimedia elements)\n- Interactive demonstration when possible\n- Written reflection submitted after presentation`,
    "rubric": `## Presentation Rubric (100 points)\n\n### Content Knowledge (25 points)\n- **Excellent (23-25):** Demonstrates deep understanding of ${subject} concepts with accurate, detailed explanations\n- **Proficient (18-22):** Shows solid grasp of ${subject} concepts with mostly accurate explanations\n- **Developing (13-17):** Basic understanding with some gaps in ${subject} knowledge\n- **Beginning (0-12):** Limited understanding of ${subject} concepts\n\n### Problem-Solving Process (25 points)\n- **Excellent (23-25):** Clearly articulates problem-solving steps with thoughtful reasoning\n- **Proficient (18-22):** Describes problem-solving process with adequate detail\n- **Developing (13-17):** Basic explanation of problem-solving approach\n- **Beginning (0-12):** Unclear or missing problem-solving process\n\n### Communication & Presentation (25 points)\n- **Excellent (23-25):** Clear, engaging delivery with effective visual aids\n- **Proficient (18-22):** Generally clear presentation with adequate visual support\n- **Developing (13-17):** Some clarity issues but main ideas communicated\n- **Beginning (0-12):** Unclear communication or ineffective presentation\n\n### Audience Engagement (25 points)\n- **Excellent (23-25):** Effectively engages audience and handles Q&A with confidence\n- **Proficient (18-22):** Good audience interaction and responds to questions\n- **Developing (13-17):** Some audience engagement with basic Q&A responses\n- **Beginning (0-12):** Limited audience engagement`
  };
}

function generatePortfolioAssignment(subject, ageGroup, challenge) {
  return {
    "title": `${subject} Learning Portfolio`,
    "description": `Students will compile a comprehensive portfolio documenting their learning journey and solution development for the challenge: "${challenge}". The portfolio should showcase growth, reflection, and mastery of ${subject} concepts.\n\n**Portfolio Components:**\n- **Process Documentation:** Weekly learning logs and progress photos\n- **Research Collection:** Annotated sources and analysis of existing solutions\n- **Skill Development:** Evidence of ${subject} skill acquisition with before/after examples\n- **Solution Documentation:** Detailed description of final solution with rationale\n- **Reflection Essays:** Critical analysis of learning process and outcomes\n- **Peer Feedback:** Documentation of collaboration and peer learning\n\n**Format:**\n- Digital portfolio (website, presentation, or multimedia format)\n- Organized with clear navigation and professional presentation\n- Includes both written reflections and visual documentation\n- Demonstrates growth over time with dated entries`,
    "rubric": `## Portfolio Rubric (100 points)\n\n### Completeness & Organization (25 points)\n- **Excellent (23-25):** All components present, well-organized, and professionally presented\n- **Proficient (18-22):** Most components present with good organization\n- **Developing (13-17):** Some components missing or poorly organized\n- **Beginning (0-12):** Many components missing or disorganized\n\n### ${subject} Knowledge & Skills (25 points)\n- **Excellent (23-25):** Clear evidence of significant ${subject} learning and skill development\n- **Proficient (18-22):** Good demonstration of ${subject} concepts and skills\n- **Developing (13-17):** Basic evidence of ${subject} learning\n- **Beginning (0-12):** Limited evidence of ${subject} understanding\n\n### Reflection & Analysis (25 points)\n- **Excellent (23-25):** Deep, thoughtful reflection on learning process and outcomes\n- **Proficient (18-22):** Good reflection with some analysis of learning\n- **Developing (13-17):** Basic reflection with limited analysis\n- **Beginning (0-12):** Superficial or missing reflection\n\n### Growth & Development (25 points)\n- **Excellent (23-25):** Clear documentation of significant growth and learning progression\n- **Proficient (18-22):** Evidence of growth with some documentation of progress\n- **Developing (13-17):** Some evidence of growth over time\n- **Beginning (0-12):** Little evidence of growth or development`
  };
}

function generatePrototypeAssignment(subject, ageGroup, challenge) {
  return {
    "title": `${subject} Solution Prototype`,
    "description": `Students will create a functional prototype that addresses the challenge: "${challenge}". The prototype should demonstrate practical application of ${subject} concepts and represent a viable solution approach.\n\n**Prototype Requirements:**\n- **Functional Design:** Working model or demonstration of the solution\n- **Technical Documentation:** Clear explanation of how the prototype works\n- **${subject} Integration:** Visible application of ${subject} concepts and techniques\n- **User Testing:** Evidence of testing with target audience and iteration based on feedback\n- **Presentation:** Clear demonstration of prototype functionality and impact\n- **Reflection:** Analysis of design decisions and lessons learned\n\n**Format:**\n- Physical prototype, digital solution, or multimedia presentation\n- Accompanied by technical documentation and user testing results\n- Demonstration video or live presentation of functionality\n- Written reflection on design process and future improvements`,
    "rubric": `## Prototype Rubric (100 points)\n\n### Functionality & Design (25 points)\n- **Excellent (23-25):** Prototype functions as intended with thoughtful design decisions\n- **Proficient (18-22):** Prototype mostly functional with good design elements\n- **Developing (13-17):** Basic functionality with some design considerations\n- **Beginning (0-12):** Limited functionality or poor design\n\n### ${subject} Application (25 points)\n- **Excellent (23-25):** Sophisticated integration of ${subject} concepts throughout solution\n- **Proficient (18-22):** Good application of ${subject} principles in prototype\n- **Developing (13-17):** Basic use of ${subject} concepts\n- **Beginning (0-12):** Limited or incorrect application of ${subject}\n\n### User Testing & Iteration (25 points)\n- **Excellent (23-25):** Comprehensive testing with meaningful iteration based on feedback\n- **Proficient (18-22):** Good testing process with some iteration\n- **Developing (13-17):** Basic testing with limited iteration\n- **Beginning (0-12):** Minimal or no testing/iteration\n\n### Technical Documentation (25 points)\n- **Excellent (23-25):** Clear, detailed documentation of design and functionality\n- **Proficient (18-22):** Good documentation with adequate detail\n- **Developing (13-17):** Basic documentation with some gaps\n- **Beginning (0-12):** Poor or missing documentation`
  };
}

function generateSummativeAssessment(subject, ageGroup) {
  return `# Summative Assessment Framework

## Overview
This comprehensive assessment framework evaluates ${ageGroup} students' mastery of ${subject} concepts through authentic, real-world application. The assessment combines multiple measures to provide a holistic view of student achievement.

## Assessment Components

### 1. Individual Performance (40%)
- **Assignment Quality:** Evaluation of individual assignments using detailed rubrics
- **Skill Demonstration:** Evidence of ${subject} technique and concept mastery
- **Growth Documentation:** Comparison of initial and final work showing progression

### 2. Collaborative Work (30%)
- **Peer Collaboration:** Effectiveness in working with others during the challenge
- **Feedback Integration:** Ability to give and receive constructive feedback
- **Community Engagement:** Quality of interaction with authentic audience

### 3. Reflection & Analysis (20%)
- **Learning Reflection:** Depth of analysis about personal learning journey
- **Problem-Solving Process:** Articulation of approach to tackling the challenge
- **Future Application:** Connection of learning to real-world applications

### 4. Authentic Audience Evaluation (10%)
- **Community Feedback:** Input from real-world stakeholders and experts
- **Practical Impact:** Assessment of solution's potential real-world effectiveness
- **Professional Presentation:** Quality of communication to authentic audience

## Evaluation Criteria

### Mastery Levels
- **Expert (90-100%):** Exceeds expectations with sophisticated understanding and application
- **Proficient (80-89%):** Meets all expectations with solid understanding and application
- **Developing (70-79%):** Approaching expectations with basic understanding
- **Beginning (Below 70%):** Not yet meeting expectations, requires additional support

### Key Performance Indicators
- Demonstrates deep understanding of ${subject} concepts
- Applies learning to solve authentic, complex problems
- Communicates effectively with multiple audiences
- Shows growth and learning progression over time
- Collaborates effectively with peers and community members

## Implementation Timeline
- **Week 1-2:** Individual assignment completion
- **Week 3:** Peer collaboration and feedback sessions
- **Week 4:** Authentic audience presentations and community engagement
- **Week 5:** Final reflection and portfolio compilation

This framework ensures that ${ageGroup} students are evaluated on both their ${subject} mastery and their ability to apply that learning to real-world challenges, preparing them for future academic and professional success.`;
}