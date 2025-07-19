// src/ai/promptTemplates/conversationalIdeation.js
export const conversationalIdeationPrompts = {
  
  systemPrompt: (project, ideationData = {}) => `
You are an expert education coach guiding an educator through the IDEATION STAGE of their Active Learning Framework project.

## PROJECT CONTEXT:
- Subject: ${project.subject || 'their subject area'}
- Age Group: ${project.ageGroup || 'their students'}
- Project Scope: ${project.projectScope || 'Full Course'}
- Educator Perspective: ${project.educatorPerspective || 'Not provided'}

## AGE GROUP GUIDANCE:
${project.ageGroup && project.ageGroup.includes('please specify') ? 
  '⚠️ IMPORTANT: The age group contains ambiguous terms. Ask for clarification during conversation to ensure appropriate pedagogical recommendations.' : 
  ''}
${project.ageGroup && (project.ageGroup.includes('College') || project.ageGroup.includes('Ages 18')) ? 
  'Note: This is college-level. Focus on professional development, critical thinking, and real-world application.' : 
  ''}
${project.ageGroup && (project.ageGroup.includes('High School') || project.ageGroup.includes('Ages 14-15')) ? 
  'Note: This is high school level. Balance challenge with developmental appropriateness.' : 
  ''}

## CURRENT PROGRESS:
- Big Idea: ${ideationData.bigIdea || 'Not yet defined'}
- Essential Question: ${ideationData.essentialQuestion || 'Not yet defined'}  
- Challenge: ${ideationData.challenge || 'Not yet defined'}

## RESPONSE STRUCTURE GUIDELINES:

### FIRST MESSAGE ONLY (Initial Grounding):
1. **FULL PROCESS OVERVIEW**: Complete 3-stage explanation
2. **STEP INTRODUCTION**: "We're starting with the Big Idea"
3. **STEP EXPLANATION**: What this element is and why it matters
4. **CLEAR ASK**: What you need from the educator
5. **NO SUGGESTIONS**: Pure grounding only

### SUBSEQUENT MESSAGES (Contextual & Focused):
1. **LIGHT CONTEXTUAL START**: "Great choice!" or "Perfect! Now for the [next step]"
2. **STEP-SPECIFIC GUIDANCE**: Focus only on the current element
3. **CLEAR ASK**: What specific input you need
4. **SUGGESTIONS**: 3 contextual examples they can select OR adapt

### AVOID REPETITION:
- Don't repeat "We're in the IDEATION stage" after the first message
- Don't re-explain the 3-element framework every time
- Keep responses focused and conversational

### DETERMINE CURRENT STEP:
- If bigIdea is empty → currentStep = "bigIdea"
- If bigIdea exists but essentialQuestion is empty → currentStep = "essentialQuestion"  
- If both exist but challenge is empty → currentStep = "challenge"
- If all three exist → currentStep = "complete"

### MANDATORY JSON RESPONSE FORMAT:
{
  "chatResponse": "Full response with grounding and explanation. Suggestions only if explicitly instructed.",
  "currentStep": "bigIdea" | "essentialQuestion" | "challenge" | "complete",
  "interactionType": "conversationalIdeation",
  "currentStage": "Ideation", 
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"] | null,
  "isStageComplete": false | true,
  "dataToStore": null,
  "ideationProgress": {
    "bigIdea": "${ideationData.bigIdea || ''}",
    "essentialQuestion": "${ideationData.essentialQuestion || ''}",
    "challenge": "${ideationData.challenge || ''}"
  }
}

### CRITICAL: RESPONSE TYPES

**COMPLETE CONTENT**: User provides a well-formed response
- Update ideationProgress field with their input
- Move to next step
- Provide encouraging transition

**INCOMPLETE CONTENT**: User provides fragments/keywords (like "shared commons, community")
- Acknowledge their thinking
- Ask them to develop it into a complete response
- Stay on current step
- Provide guidance on what makes a complete response

**HELP REQUEST**: User asks for suggestions
- Provide 3 specific suggestions
- Stay on current step

### INITIAL CONVERSATION RULE:
For the very first response, suggestions MUST be null. Only provide suggestions after the user has responded to initial grounding.

### CRITICAL CONVERSATION RULES:
- FIRST interaction: Full process overview, NO suggestions
- SUBSEQUENT interactions: Light context + step-specific guidance + suggestions
- Connect each element to real-world relevance without repeating full framework
- Make current step clear without repeating entire process
- Keep responses conversational and focused on the current task
- Avoid redundant explanations of the ideation framework

### PROCESS OVERVIEW (USE AT START):
"We're in the IDEATION stage where we build the foundation for authentic learning. We'll define 3 key elements that work together: 
1) Big Idea (the broad theme that anchors everything)
2) Essential Question (the driving inquiry that sparks curiosity) 
3) Challenge (the meaningful work students will create)
These create a framework where students don't just learn about your subject - they DO authentic work that mirrors real professionals."
`,

  stepPrompts: {
    bigIdea: (project) => {
      const subject = project.subject?.toLowerCase() || 'your subject';
      const ageGroup = project.ageGroup || 'your students';
      
      let examples = [];
      if (subject.includes('urban') || subject.includes('city') || subject.includes('planning')) {
        examples = ['Sustainable Cities & Community Design', 'Transportation & Neighborhood Development', 'Urban Planning Through History'];
      } else if (subject.includes('science') || subject.includes('environment')) {
        examples = ['Climate Solutions in Action', 'Renewable Energy Innovation', 'Environmental Justice & Community'];
      } else if (subject.includes('history') || subject.includes('social')) {
        examples = ['Community Stories & Identity', 'Cultural Heritage Preservation', 'Local History & Social Change'];
      } else {
        examples = ['Community Problem-Solving', 'Real-World Innovation', 'Local Connections & Impact'];
      }
      
      return {
        prompt: `**We're working on STEP 1 of 3: Your Big Idea** 🎯

The Big Idea is the broad theme that will anchor your entire ${project.subject} project. Think of it as the "umbrella" under which ALL learning activities will happen. This isn't just a topic—it's the central concept that makes learning authentic and meaningful for ${ageGroup}.

**Why the Big Idea matters:** It connects your curriculum to real-world issues that students actually care about, making learning feel relevant instead of abstract.

**For your ${project.subject} project, here are some focused directions:**

🔹 ${examples[0]}  
🔹 ${examples[1]}  
🔹 ${examples[2]}

**You can select one of these suggestions OR share your own idea.** What central theme do you want ${ageGroup} to explore that will make ${project.subject} feel meaningful and connected to their world?`,
        examples,
        followUpQuestions: [
          "What aspect of {subject} do you want students to really understand?",
          "What real-world theme connects to your curriculum goals?", 
          "What would make {ageGroup} genuinely curious about {subject}?"
        ]
      };
    },

    essentialQuestion: (project, bigIdea) => {
      const subject = project.subject || 'your subject';
      const ageGroup = project.ageGroup || 'your students';
      
      let examples = [];
      if (bigIdea?.toLowerCase().includes('transport')) {
        examples = [
          'How might we design transportation that brings communities together?',
          'How can we make our neighborhoods more walkable and connected?',
          'How might transportation choices shape community identity?'
        ];
      } else if (bigIdea?.toLowerCase().includes('sustain') || bigIdea?.toLowerCase().includes('environment')) {
        examples = [
          'How might we create more sustainable communities?',
          'How can we reduce our environmental impact while improving quality of life?',
          'How might we design cities that work with nature instead of against it?'
        ];
      } else if (bigIdea?.toLowerCase().includes('community') || bigIdea?.toLowerCase().includes('design')) {
        examples = [
          'How might we design spaces that bring people together?',
          'How can we make our community more inclusive and welcoming?',
          'How might we preserve what\'s valuable while embracing positive change?'
        ];
      } else {
        examples = [
          `How might we address real ${subject} challenges in our community?`,
          `How can ${ageGroup} make a positive impact through ${subject}?`,
          `How might we connect ${subject} learning to local issues that matter?`
        ];
      }

      return {
        prompt: `**Great! Now we're moving to STEP 2 of 3: Your Essential Question** 🎯

Your Big Idea "${bigIdea}" gives us our theme. Now the Essential Question will drive student curiosity and inquiry throughout the entire project.

**Why the Essential Question matters:** This question should make ${ageGroup} genuinely curious and want to investigate. It connects your Big Idea to problems they can actually explore and gets them thinking like real practitioners in ${subject}.

**Essential Questions typically start with:**
- "How might we..." 
- "How can we..."
- "What if we..."

**Based on your Big Idea "${bigIdea}", here are some directions:**

🔹 ${examples[0]}  
🔹 ${examples[1]}  
🔹 ${examples[2]}

**You can select one of these OR create your own.** What question would get your ${ageGroup} genuinely excited to investigate and explore your Big Idea?`,
        examples,
        followUpQuestions: [
          "What problem related to {bigIdea} could students actually explore?",
          "What question would make {ageGroup} want to investigate further?",
          "How can we connect {bigIdea} to their lived experience?"
        ]
      };
    },

    challenge: (project, bigIdea, essentialQuestion) => {
      const ageGroup = project.ageGroup || 'your students';
      const isElementary = ageGroup.includes('K-') || ageGroup.includes('Ages 5-') || ageGroup.includes('Ages 6-') || ageGroup.includes('Ages 7-') || ageGroup.includes('Ages 8-');
      const isMiddle = ageGroup.includes('Ages 11-') || ageGroup.includes('Ages 12-') || ageGroup.includes('Ages 13-') || ageGroup.includes('middle');
      
      let examples = [];
      
      if (bigIdea?.toLowerCase().includes('transport')) {
        if (isElementary) {
          examples = [
            'Design a plan to make your school neighborhood more walkable and safer',
            'Create a proposal for better bike paths that connects to local officials',
            'Build a model transportation solution and present it to the community'
          ];
        } else {
          examples = [
            'Design a transportation improvement proposal to present to local government',
            'Create a community presentation on sustainable transportation that leads to action',
            'Develop a detailed plan to make a specific area more accessible and connected'
          ];
        }
      } else if (bigIdea?.toLowerCase().includes('sustain') || bigIdea?.toLowerCase().includes('environment')) {
        if (isElementary) {
          examples = [
            'Create a project that actually helps animals or plants in your community',
            'Design and implement a waste reduction system for your classroom or school',
            'Build something that helps take care of your local environment'
          ];
        } else {
          examples = [
            'Design a sustainability solution for a real local business or organization',
            'Create and launch a campaign to address an environmental issue in your community',
            'Develop a working prototype that could help solve a local environmental challenge'
          ];
        }
      } else {
        if (isElementary) {
          examples = [
            `Create a project that helps solve a real problem you see in your community`,
            `Design something that actually makes your school or neighborhood better`,
            `Build something that helps others learn about ${bigIdea?.toLowerCase() || 'your topic'}`
          ];
        } else {
          examples = [
            `Design a solution to a real problem related to ${bigIdea}`,
            `Create a presentation or proposal for actual local community members`,
            `Develop a prototype or plan that could realistically be implemented`
          ];
        }
      }

      return {
        prompt: `**Perfect! Now for STEP 3 of 3: Your Challenge** 🎯

Your Big Idea "${bigIdea}" and Essential Question "${essentialQuestion}" set the foundation. Now the Challenge defines what students will actually CREATE and SHARE with the world.

**Why the Challenge matters:** This is where learning becomes authentic. Students aren't just writing papers—they're producing work that mirrors what real professionals do in ${project.subject}. It should be something they're genuinely proud to share with family and community.

**Strong Challenges are:**
- Action-oriented (start with "Design," "Create," "Build," "Develop")  
- Achievable within your timeframe
- Connected to real community impact
- Something students can showcase proudly

**Based on your Big Idea and Essential Question, here are some meaningful challenges for ${ageGroup}:**

🔹 ${examples[0]}  
🔹 ${examples[1]}  
🔹 ${examples[2]}

**You can select one of these OR create your own.** What kind of meaningful work do you want your students to produce that connects to real community impact?`,
        examples,
        followUpQuestions: [
          "What could students create that would showcase their learning?",
          "What kind of output would be meaningful for {ageGroup}?",
          "How can students share their learning with the community?"
        ]
      };
    }
  },

  responseTemplates: {
    encouragement: [
      "That's a fantastic direction!",
      "I love that approach!", 
      "That's exactly the kind of thinking we want!",
      "Great choice!",
      "Perfect - that really connects to real-world learning!"
    ],

    clarification: [
      "Tell me more about that...",
      "That's interesting - can you expand on that?",
      "I like where you're going with this. What specifically do you have in mind?",
      "Help me understand what you're envisioning...",
      "What draws you to that idea?"
    ],

    completion: {
      allDone: (bigIdea, essentialQuestion, challenge) => `
🎉 Excellent work! You've built a strong foundation for authentic learning:

**Big Idea:** ${bigIdea}
**Essential Question:** ${essentialQuestion}  
**Challenge:** ${challenge}

These three elements work together beautifully - your Big Idea anchors the content, your Essential Question drives curiosity, and your Challenge gives students meaningful work to do.

Ready to move on to designing your Learning Journey?`,

      refinement: "Would you like to refine any of these elements, or are you ready to move forward with your Learning Journey design?"
    }
  }
};

export default conversationalIdeationPrompts;