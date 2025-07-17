// src/prompts/workflows.js - COMPLETE FILE
// Restored version with proper pedagogical flow and grounding

/**
 * RESTORED VERSION: Brings back the guided journey with proper context
 */

// --- 1. Ideation Workflow with Proper Flow ---
export const getIntakeWorkflow = (project, history = []) => {
  const messageCount = history ? history.length : 0;
  const lastUserMsg = history.filter(m => m.role === 'user').slice(-1)[0]?.chatResponse || "";
  
  // Track conversation progress
  const hasSeenFramework = history.some(m => m.frameworkOverview);
  const hasSeenSuggestions = history.some(m => m.suggestions && m.suggestions.length > 0);
  const hasRecap = history.some(m => m.recap);
  
  const baseInstructions = `
# STAGE 1: IDEATION - The Guided Journey

You are helping create a project about ${project.subject} for ${project.ageGroup}.
The educator shared: "${project.educatorPerspective}"

## YOUR ROLE
Guide them through a thoughtful process, not just dump suggestions.
Always explain the pedagogical WHY before offering choices.

## CONVERSATION FLOW
1. Welcome → 2. Show Framework → 3. Recap their vision → 4. Ground suggestions → 5. Develop ideas → 6. Complete stage

## JSON STRUCTURE
Return a complete JSON object with all fields (use null if not applicable).
`;

  // Step 1: Warm Welcome
  if (messageCount === 0) {
    return baseInstructions + `
Create a warm, personalized welcome that acknowledges their specific vision.

{
  "interactionType": "Welcome",
  "currentStage": "Ideation",
  "chatResponse": "Welcome to ProjectCraft! I'm excited to help you transform your vision about '${project.educatorPerspective}' into a powerful ${project.subject} learning experience for your ${project.ageGroup} students.\\n\\nI'll guide you through our research-based process to create a project that's both academically rigorous and deeply engaging. Would you like to see how we'll work together, or shall we dive right into exploring your ideas?",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["Show me the process", "Let's explore my ideas"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Step 2: Framework Overview (if requested)
  if ((lastUserMsg.includes("process") || lastUserMsg.includes("how")) && !hasSeenFramework) {
    return baseInstructions + `
Show them the ProjectCraft framework and how it creates better learning.

{
  "interactionType": "Framework",
  "currentStage": "Ideation",
  "chatResponse": "Great question! ProjectCraft uses the Active Learning Framework, which ensures your ${project.subject} project creates deep, lasting learning. Here's how we'll work together:",
  "frameworkOverview": {
    "title": "The ProjectCraft Journey",
    "introduction": "Unlike traditional lesson planning, we design backwards from a compelling challenge that makes ${project.subject} irresistible to ${project.ageGroup} learners.",
    "stages": [
      {
        "title": "🎯 Stage 1: Ideation (We're here)",
        "purpose": "We'll transform '${project.educatorPerspective}' into a Big Idea (essential question) and Challenge (what students solve)"
      },
      {
        "title": "🗺️ Stage 2: Learning Journey",
        "purpose": "We'll design phases that build skills while maintaining engagement and autonomy"
      },
      {
        "title": "🎨 Stage 3: Authentic Assessment",
        "purpose": "We'll create meaningful ways for students to demonstrate learning through real-world application"
      }
    ]
  },
  "buttons": ["I understand, let's begin!", "Tell me more about the research"],
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null
}`;
  }

  // Step 3: Recap their vision before suggestions
  if (!hasRecap && (messageCount > 1 || lastUserMsg.includes("begin") || lastUserMsg.includes("explore"))) {
    return baseInstructions + `
Acknowledge and elevate their vision before offering suggestions.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "I love your vision about '${project.educatorPerspective}'. This has real potential to engage ${project.ageGroup} learners with ${project.subject} in meaningful ways.\\n\\nBefore we explore specific directions, let me make sure I understand what excites you most about this idea. Is it the ${project.subject.includes('history') ? 'historical connections' : project.subject.includes('science') ? 'scientific concepts' : 'real-world applications'}, the hands-on learning opportunities, or something else entirely?",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["It's the real-world connections", "It's the hands-on learning", "Let me explain"],
  "recap": {
    "educatorVision": "${project.educatorPerspective}",
    "subject": "${project.subject}",
    "learners": "${project.ageGroup}"
  },
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Step 4: Provide grounded suggestions
  if (!hasSeenSuggestions && messageCount > 2) {
    return baseInstructions + `
NOW provide pedagogically grounded suggestions based on their responses.

{
  "interactionType": "Guide",
  "currentStage": "Ideation",
  "chatResponse": "Based on your vision about '${project.educatorPerspective}' and what excites you, I see several compelling directions we could take. Each of these builds on research about how ${project.ageGroup} learners best engage with ${project.subject}:\\n\\nHere are three pathways that could transform your idea into a powerful learning experience:",
  "isStageComplete": false,
  "summary": null,
  "suggestions": [
    "What if students investigated how ${project.educatorPerspective} connects to current ${project.subject} debates, creating solutions for real stakeholders?",
    "What if learners became ${project.subject} consultants, using ${project.educatorPerspective} as a lens to analyze and propose changes?",
    "What if we designed a ${project.subject} exhibition where students showcase how ${project.educatorPerspective} shapes our understanding of [relevant topic]?"
  ],
  "buttons": ["I need different directions", "One of these resonates"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Step 5: Develop the chosen direction
  if (hasSeenSuggestions && !lastUserMsg.includes("different")) {
    const conversationText = history.map(m => m.chatResponse || '').join(' ');
    const readyToComplete = messageCount > 5 || conversationText.includes("resonates") || conversationText.includes("like that");
    
    if (readyToComplete) {
      return baseInstructions + `
Time to crystallize their ideas into Big Idea and Challenge.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Excellent! Let's crystallize this into a clear framework. Based on our conversation about ${project.educatorPerspective}, here's what I'm hearing:\\n\\n**Big Idea:** How does ${project.educatorPerspective} reveal essential concepts in ${project.subject}?\\n\\n**Challenge:** Students will create [specific deliverable] that demonstrates how ${project.educatorPerspective} can inform real-world ${project.subject} applications.\\n\\nDoes this capture your vision? We can refine it together.",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["Yes, this captures it!", "Let's refine the challenge", "Let's refine the big idea"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
    }
  }

  // Step 6: Complete the stage
  if (lastUserMsg.includes("captures it") || messageCount > 8) {
    return baseInstructions + `
Complete the ideation stage with a proper summary.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "Perfect! We've shaped your vision into a compelling framework that will engage your ${project.ageGroup} students. Here's our foundation:\\n\\n**Big Idea:** How does ${project.educatorPerspective} reveal essential concepts in ${project.subject}?\\n\\n**Challenge:** Students will create innovative solutions demonstrating how ${project.educatorPerspective} can inform real-world ${project.subject} applications.\\n\\nThis framework ensures students see ${project.subject} as relevant and actionable. Ready to design the learning journey?",
  "isStageComplete": true,
  "summary": {
    "title": "${project.subject} Through the Lens of ${project.educatorPerspective}",
    "abstract": "Students explore how ${project.educatorPerspective} illuminates key concepts in ${project.subject}, culminating in real-world applications that demonstrate deep understanding and creative problem-solving.",
    "coreIdea": "How does ${project.educatorPerspective} reveal essential concepts in ${project.subject}?",
    "challenge": "Create innovative solutions demonstrating how ${project.educatorPerspective} can inform real-world ${project.subject} applications"
  },
  "suggestions": null,
  "buttons": ["Yes, let's design the journey!", "Let me save this first"],
  "recap": null,
  "process": null,
  "frameworkOverview": null
}`;
  }

  // Default: Continue developing their ideas
  return baseInstructions + `
Continue guiding them based on where they are in the conversation.

{
  "interactionType": "Standard",
  "currentStage": "Ideation",
  "chatResponse": "[Respond thoughtfully to their last message, always connecting back to ${project.educatorPerspective} and ${project.subject}. Guide them toward defining a Big Idea and Challenge. End with a question.]",
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "buttons": ["Tell me more", "I need guidance"],
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
Big Idea: ${project.coreIdea}
Challenge: ${project.challenge}

## YOUR ROLE
Guide them through curriculum design with pedagogical reasoning.
Explain WHY each phase matters for ${project.ageGroup} learners.
`;

  // Welcome to curriculum stage
  if (messageCount === 0) {
    return baseInstructions + `
Welcome them and connect to their completed ideation work.

{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Wonderful! Now let's design how your ${project.ageGroup} students will journey from curiosity to capability.\\n\\nWe'll create phases that build toward solving: '${project.challenge}'\\n\\nFor ${project.ageGroup} learners, research shows they need ${project.ageGroup.includes('11-14') ? 'concrete experiences before abstract concepts' : project.ageGroup.includes('15-18') ? 'authentic contexts and increasing autonomy' : 'structured exploration with clear milestones'}.\\n\\nHow much time do you have for this project?",
  "isStageComplete": false,
  "curriculumDraft": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["4-5 weeks", "6-8 weeks", "Full semester", "Let me explain our constraints"]
}`;
  }

  // Create phase structure with reasoning
  if (!hasPhases && messageCount > 0) {
    const weeks = lastUserMsg.includes("4-5") ? "4-5" : lastUserMsg.includes("6-8") ? "6-8" : "10-12";
    
    return baseInstructions + `
Create a pedagogically sound phase structure.

{
  "interactionType": "Process",
  "currentStage": "Learning Journey",
  "chatResponse": "Perfect! For a ${weeks} week project with ${project.ageGroup}, I recommend a three-phase structure. This isn't arbitrary - research shows that three phases provides the ideal balance of depth and momentum:",
  "process": {
    "title": "Your Learning Journey Structure",
    "steps": [
      {
        "title": "Phase 1: Investigate & Discover",
        "description": "Students explore ${project.coreIdea} through hands-on investigation and guided inquiry"
      },
      {
        "title": "Phase 2: Analyze & Connect",
        "description": "Learners deepen understanding by analyzing real cases and making connections"
      },
      {
        "title": "Phase 3: Create & Apply",
        "description": "Students synthesize learning to address ${project.challenge}"
      }
    ]
  },
  "curriculumDraft": "### Phase 1: Investigate & Discover\\n**Duration:** ${weeks === '4-5' ? '1-2' : weeks === '6-8' ? '2-3' : '3-4'} weeks\\n**Driving Question:** [To be developed]\\n\\n### Phase 2: Analyze & Connect\\n**Duration:** ${weeks === '4-5' ? '1-2' : weeks === '6-8' ? '2-3' : '3-4'} weeks\\n**Driving Question:** [To be developed]\\n\\n### Phase 3: Create & Apply\\n**Duration:** ${weeks === '4-5' ? '2' : weeks === '6-8' ? '3' : '4'} weeks\\n**Driving Question:** [To be developed]",
  "buttons": ["This structure works", "I need a different approach", "Tell me more about the research"],
  "isStageComplete": false,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "frameworkOverview": null
}`;
  }

  // Continue developing phases
  if (hasPhases && messageCount < 5) {
    return baseInstructions + `
Help them develop the phases with specific activities.

{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Great! Now let's flesh out each phase with specific learning experiences. Which phase would you like to develop first? I can help you create:\\n\\n• Driving questions that spark curiosity\\n• Concrete activities aligned with ${project.ageGroup} development\\n• Resources and materials you'll need\\n• Formative assessments to track progress\\n\\nWhere shall we start?",
  "isStageComplete": false,
  "curriculumDraft": "${currentDraft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Start with Phase 1", "Give me an example", "I have specific ideas"]
}`;
  }

  // Ready to complete
  if (hasPhases && messageCount > 4) {
    return baseInstructions + `
Check if they're ready to move to assessments.

{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "Your learning journey is taking shape beautifully! We have phases that progressively build toward students solving: '${project.challenge}'\\n\\nThe structure ensures ${project.ageGroup} learners develop both conceptual understanding and practical skills.\\n\\nAre you ready to design how students will demonstrate their learning?",
  "isStageComplete": true,
  "curriculumDraft": "${currentDraft.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Yes, let's design assessments", "Let me refine this first"]
}`;
  }

  // Default
  return baseInstructions + `
Continue developing their curriculum.

{
  "interactionType": "Standard",
  "currentStage": "Learning Journey",
  "chatResponse": "[Help them develop their curriculum phases, always explaining the pedagogical reasoning]",
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
# STAGE 3: AUTHENTIC ASSESSMENT

Creating assessments for "${project.title}".
Challenge: ${project.challenge}

## YOUR ROLE
Design assessments that mirror real-world ${project.subject} work.
Explain how each assessment authentically measures learning.
`;

  // Welcome to assessment stage
  if (messageCount === 0) {
    return baseInstructions + `
Frame authentic assessment as different from traditional testing.

{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Now for the exciting part - designing how students will demonstrate their learning!\\n\\nTraditional tests can't capture the rich understanding your students will develop. Instead, we'll create authentic assessments where ${project.ageGroup} learners show mastery by doing real ${project.subject} work.\\n\\nThinking about your challenge: '${project.challenge}'\\n\\nWhat format would best allow students to showcase their learning - a presentation to experts, a designed solution, a research portfolio, or something else?",
  "isStageComplete": false,
  "newAssignment": null,
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Professional presentation", "Designed solution", "Research portfolio", "Creative exhibition"]
}`;
  }

  // Create first assignment
  if (messageCount > 0 && existingAssignments === 0) {
    const format = lastUserMsg.toLowerCase();
    return baseInstructions + `
Create their first authentic assessment with clear reasoning.

{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Excellent choice! A ${format.includes('presentation') ? 'professional presentation' : format.includes('solution') ? 'designed solution' : format.includes('portfolio') ? 'research portfolio' : 'creative exhibition'} perfectly aligns with how real ${project.subject} professionals share their work.\\n\\nLet me design a comprehensive assessment structure that ensures students demonstrate deep understanding while creating something meaningful.",
  "isStageComplete": false,
  "newAssignment": {
    "title": "${project.challenge.split(' ').slice(0, 4).join(' ')} Showcase",
    "description": "Students will ${project.challenge.toLowerCase()} and present their work to an authentic audience including ${project.subject} professionals, community members, and peers. This mirrors how real ${project.subject} work is evaluated in professional settings.",
    "rubric": "**Conceptual Understanding (30%):**\\n- Exemplary: Demonstrates sophisticated grasp of ${project.coreIdea}\\n- Proficient: Shows solid understanding with clear examples\\n- Developing: Basic understanding with some gaps\\n- Emerging: Beginning to grasp concepts\\n\\n**Solution Quality (40%):**\\n- Exemplary: Innovative, implementable solution with strong evidence\\n- Proficient: Well-reasoned solution addressing key aspects\\n- Developing: Adequate solution with room for development\\n- Emerging: Basic attempt at addressing challenge\\n\\n**Communication (30%):**\\n- Exemplary: Compelling presentation engaging all audiences\\n- Proficient: Clear, organized communication of ideas\\n- Developing: Generally clear with some confusion\\n- Emerging: Attempts to communicate ideas"
  },
  "assessmentMethods": null,
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["Add milestone assessments", "This is perfect", "Modify the rubric"]
}`;
  }

  // Complete assessment design
  if (existingAssignments > 0 || messageCount > 3) {
    return baseInstructions + `
Wrap up assessment design with philosophy.

{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "Perfect! Your assessment plan embodies authentic learning principles.\\n\\nStudents will demonstrate mastery not through memorization, but through creation and application - exactly how ${project.subject} professionals prove their expertise.\\n\\nYour complete project is ready for implementation! Would you like to review the full syllabus?",
  "isStageComplete": true,
  "newAssignment": null,
  "assessmentMethods": "## Assessment Philosophy\\nThis project uses authentic assessment aligned with real-world ${project.subject} practices. Students demonstrate understanding through creation, not recall.\\n\\n## Formative Assessment\\n- Weekly reflection journals on learning process\\n- Peer feedback sessions using professional protocols\\n- Instructor check-ins at phase transitions\\n\\n## Summative Assessment\\nThe culminating project serves as the primary assessment, evaluated using professional standards and authentic audience feedback.",
  "summary": null,
  "suggestions": null,
  "recap": null,
  "process": null,
  "frameworkOverview": null,
  "buttons": ["View complete syllabus", "Add another assessment"]
}`;
  }

  // Default
  return baseInstructions + `
Continue designing assessments.

{
  "interactionType": "Standard",
  "currentStage": "Student Deliverables",
  "chatResponse": "[Help them design authentic assessments with clear pedagogical reasoning]",
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