// src/prompts/workflows.js

/**
 * Balanced workflows - with all features, plus reliability and conversational enhancements.
 * VERSION: 20.0.0 - Full Definitive Version
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

  // Step 1: Welcome
  if (messageCount === 0) {
    return baseInstructions + `
## YOUR TASK: Warm Personalized Welcome
Create a welcome that:
1. Acknowledges their ${project.subject} project specifically.
2. Shows excitement about their perspective: "${project.educatorPerspective}".
3. Sets a collaborative tone with "we" and "us".

Required:
- interactionType: "Welcome"
- buttons: ["Yes, let's begin.", "Tell me more about the 3 stages first."]`;
  }

  // Step 2A: Framework Overview
  if (lastUserMsg === "Tell me more about the 3 stages first.") {
    return baseInstructions + `
## YOUR TASK: Framework Overview
Explain the three stages, connecting them to their specific project.

Required structure:
{
  "interactionType": "Framework",
  "currentStage": "Ideation",
  "chatResponse": "Brief intro connecting the framework to their project.",
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
  "isStageComplete": false, "summary": null, "suggestions": null, "recap": null, "process": null
}`;
  }
  
  // Step 2B: The "Warm-up" Step
  if (lastUserMsg.toLowerCase().includes("begin")) {
    return baseInstructions + `
## YOUR TASK: Acknowledge and set the stage
This is a simple warm-up step before you provide suggestions.
    
Required:
- interactionType: "Standard"
- chatResponse": "Excellent! It's clear you're passionate about [mention a key theme from their vision: '${project.educatorPerspective}']. To get started, I'll propose a few creative directions for your '${project.subject}' project. Sound good?"
- buttons: ["Sounds good, show me!"]`;
  }
  
  // Step 3: Provide Creative Suggestions
  if (lastUserMsg.toLowerCase().includes("show me")) {
    return baseInstructions + `
## YOUR TASK: The Architect Guides
Offer three distinct and creative paths forward based on their vision.

Required:
- interactionType: "Guide"
- Start with: "Fantastic. Based on your vision for a project on ${project.subject}, here are a few potential directions we could explore:"
- Provide 3 suggestions that are specific, actionable, and appropriate for ${project.ageGroup}.`;
  }

  // Check completion readiness
  const conversationText = history.map(m => m.chatResponse || '').join(' ').toLowerCase();
  const hasChallenge = conversationText.includes('challenge:') || conversationText.includes('students will');
  const hasBigIdea = conversationText.includes('big idea:') || conversationText.includes('core concept');

  if (hasChallenge && hasBigIdea) {
    return baseInstructions + `
## YOUR TASK: Confirm Before Completing
The Challenge and Big Idea are defined. Confirm with the educator.

If user hasn't confirmed yet:
- Clearly state the Challenge and Big Idea
- Ask for explicit confirmation
- interactionType: "Standard"

If user confirms (yes, confirm, sounds good, let's proceed):
- Set isStageComplete: true
- Populate summary object:
  {
    "title": "[Compelling title for their project]",
    "abstract": "[Brief description incorporating their vision]",
    "coreIdea": "[The Big Idea]",
    "challenge": "[The Challenge students will tackle]"
  }`;
  }

  // Default: Continue dialogue
  return baseInstructions + `
## YOUR TASK: Socratic Dialogue
Guide them toward defining:
1. Challenge: The problem students will solve
2. Big Idea: The core concept/essential question

Current status: ${hasChallenge ? 'Challenge defined' : 'Need Challenge'}, ${hasBigIdea ? 'Big Idea defined' : 'Need Big Idea'}

## STUCK PROTOCOL
If user says "I don't know", "I'm not sure", "help":
- interactionType: "Guide"
- Provide 2-3 SPECIFIC suggestions for their ${project.subject} project
- Each suggestion should be actionable`;
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
  "frameworkOverview": null
}

## PROJECT CONTEXT
- Challenge: ${project.challenge}
- Big Idea: ${project.coreIdea}
- Age Group: ${project.ageGroup}

## CRITICAL RULES
1. curriculumDraft must ALWAYS contain the COMPLETE curriculum
2. Use ### for phase headers
3. Address both ISSUES (content) and METHOD (activities)
4. currentStage is always "Learning Journey"

${!hasPhases ? `
## YOUR TASK: Structure the Journey
Ask them to envision 2-4 major phases that will help students tackle "${project.challenge}".

Emphasize:
- Balance between research/understanding (Issues) and hands-on creation (Method)
- Each phase should build toward solving the challenge
- Phases should be engaging for ${project.ageGroup}

## STUCK PROTOCOL - Provide Template
If they're unsure, offer this customized structure:

Set interactionType: "Guide" and provide:
{
  "process": {
    "title": "Suggested Journey for ${project.title}",
    "steps": [
      {
        "title": "Phase 1: Investigate & Understand",
        "description": "Students explore [customize for ${project.coreIdea}]. They'll research [specific topics], interview [relevant experts], and build foundational knowledge."
      },
      {
        "title": "Phase 2: Analyze & Connect",
        "description": "Students dive deeper into [aspects of ${project.challenge}]. This phase includes [specific analysis activities] and ethical considerations."
      },
      {
        "title": "Phase 3: Design & Create",
        "description": "Students prototype solutions for ${project.challenge}. They'll [specific creation activities] and iterate based on feedback."
      }
    ]
  },
  "suggestions": [
    "Use this three-phase structure",
    "Modify the phases to better fit your vision",
    "Create your own phase structure"
  ]
}` : `

## YOUR TASK: Detail Phase ${phaseCount > 0 ? phaseCount : 1}
Current curriculum has ${phaseCount} phases defined.

For each phase, ensure coverage of:
1. **Learning Objectives** (Issues - what students understand)
2. **Key Activities** (Method - what students do)
3. **Resources & Connections** (guest speakers, field trips, materials)

## ENRICHMENT CHECKLIST
As you detail phases, consider:
- Does this phase have a guest speaker or expert? If not, suggest one
- Are there ethical considerations to explore?
- What will students CREATE in this phase?
- How will they get feedback and iterate?

## PROACTIVE SUPPORT
If user gives minimal input, offer:
"I can draft the details for Phase [X] based on best practices for ${project.ageGroup} learners tackling ${project.challenge}. Would you like me to create a starting point?"

If they accept, generate complete phase details.

## FORMAT FOR EACH PHASE
### Phase [#]: [Title]
**Duration:** [X] weeks
**Big Question:** [Guiding question for this phase]

**Learning Objectives (Issues):**
- Students will understand...
- Students will analyze...
- Students will evaluate...

**Activities & Methods:**
- Week 1: [Specific activity with description]
- Week 2: [Specific activity with description]
- [Include at least one hands-on creation activity]

**Resources & Connections:**
- Guest Speaker: [Suggestion with rationale]
- Materials: [Specific items needed]
- Field Trip/Virtual Visit: [If applicable]

**Student Output:**
- [What students produce in this phase]

---`}

## COMPLETION CHECK
Before marking complete, ensure:
1. All phases address both content (Issues) AND creation (Method)
2. At least one community connection exists
3. Clear progression toward solving ${project.challenge}
4. Appropriate challenge level for ${project.ageGroup}

When ready, ask: "Our learning journey is taking shape! Shall we refine any phases or move on to designing specific student deliverables?"`;
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
  "frameworkOverview": null
}

## PROJECT CONTEXT
- Challenge: ${project.challenge}
- Age Group: ${project.ageGroup}
- Existing Assignments: ${assignmentTitles}

${existingAssignments === 0 ? `
## YOUR TASK: The Provocateur Suggests Milestones
Set interactionType: "Provocation" and suggest 3 creative milestone assignments.

Frame with excitement: "What if students didn't just submit one final project, but created meaningful milestones along the way?"

Suggestions should:
1. Use "What if..." framing
2. Connect directly to ${project.challenge}
3. Build progressively in complexity
4. Include community/audience element
5. Be authentic for ${project.ageGroup}

Example format:
"What if students created a [specific deliverable] that [real-world application]?"` : `

## YOUR TASK: Continue Assignment Creation

Based on user input, either:

### A) Create New Assignment
Guide through these steps:

1. **Assignment Concept**: What will students create?
2. **Real-World Connection**: How does this connect to an authentic audience?
3. **Rubric Development**: 

Ask: "What 2-3 key criteria should we assess for this assignment?"

For each criterion, help define levels:
- Exemplary: [Description]
- Proficient: [Description]
- Developing: [Description]

When assignment is complete, populate newAssignment:
{
  "title": "[Assignment name]",
  "description": "[Detailed description including purpose, process, and product]",
  "rubric": "**[Criterion 1]:**\\n- Exemplary: [Description]\\n- Proficient: [Description]\\n- Developing: [Description]\\n\\n**[Criterion 2]:**\\n[Continue pattern]"
}

### B) Complete Stage
If user is done creating assignments:

1. Provide assessmentMethods with suggestions for:
   - Peer review processes
   - Self-reflection components
   - Community feedback mechanisms
   - Final exhibition/presentation format

2. Set isStageComplete: true

Example assessmentMethods:
"**Formative Assessment:** Weekly peer feedback sessions using structured protocols. **Summative Assessment:** Public exhibition with community panel providing authentic feedback. Students will also complete reflective portfolios documenting their design process and learning journey."`}

## COMMUNITY ENGAGEMENT CHECK
Ensure at least one assignment includes:
- Presentation to authentic audience
- Community partnership opportunity
- Real-world application or service component

If missing, prompt: "How might students share their work with the community or a real audience?"`;
};