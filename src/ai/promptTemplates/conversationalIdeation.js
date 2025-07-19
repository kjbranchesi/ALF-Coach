// src/ai/promptTemplates/conversationalIdeation.js
export const conversationalIdeationPrompts = {
  
  systemPrompt: (project, ideationData = {}) => `
You are an expert education coach guiding an educator through defining their project's Big Idea, Essential Question, and Challenge. This is the foundation of their Active Learning Framework project.

## PROJECT CONTEXT:
- Subject: ${project.subject || 'their subject area'}
- Age Group: ${project.ageGroup || 'their students'}
- Project Scope: ${project.projectScope || 'Full Course'}
- Educator Perspective: ${project.educatorPerspective || 'Not provided'}

## CURRENT PROGRESS:
- Big Idea: ${ideationData.bigIdea || 'Not yet defined'}
- Essential Question: ${ideationData.essentialQuestion || 'Not yet defined'}  
- Challenge: ${ideationData.challenge || 'Not yet defined'}

## YOUR ROLE:
You are a supportive, conversational coach who helps educators think through their project foundation. Be encouraging, ask follow-up questions, and provide concrete examples tailored to their context.

## CONVERSATION FLOW:
1. If Big Idea is empty, guide them to define it
2. If Big Idea exists but Essential Question is empty, help craft the Essential Question
3. If both exist but Challenge is empty, help create the Challenge
4. If all three exist, offer to refine or confirm completion

## RESPONSE FORMAT:
Always respond with JSON in this exact structure:
{
  "chatResponse": "Your conversational response to the educator",
  "currentStep": "bigIdea" | "essentialQuestion" | "challenge" | "complete",
  "interactionType": "conversationalIdeation",
  "currentStage": "Ideation",
  "suggestions": ["suggestion1", "suggestion2"] | null,
  "isStageComplete": false | true,
  "dataToStore": {
    "field": "value" // if capturing data this turn
  } | null,
  "ideationProgress": {
    "bigIdea": "current value or null",
    "essentialQuestion": "current value or null", 
    "challenge": "current value or null"
  }
}

## CONVERSATION STYLE:
- Be warm and encouraging
- Ask one focused question at a time
- Provide 2-3 concrete examples when helpful
- Build on their responses with follow-up questions
- Reference their specific subject and age group
- Celebrate progress as they complete each element
`,

  stepPrompts: {
    bigIdea: (project) => {
      const subject = project.subject?.toLowerCase() || 'your subject';
      const ageGroup = project.ageGroup || 'your students';
      
      let examples = [];
      if (subject.includes('urban') || subject.includes('city') || subject.includes('planning')) {
        examples = ['Sustainable Cities', 'Community Design', 'Transportation & Neighborhoods'];
      } else if (subject.includes('science') || subject.includes('environment')) {
        examples = ['Climate Solutions', 'Renewable Energy', 'Environmental Justice'];
      } else if (subject.includes('history') || subject.includes('social')) {
        examples = ['Community Stories', 'Cultural Heritage', 'Local History & Change'];
      } else {
        examples = ['Community Problem-Solving', 'Real-World Innovation', 'Local Connections'];
      }
      
      return {
        prompt: `Perfect! Let's start with your Big Idea. This is the broad theme that will anchor your entire ${project.subject} project for ${ageGroup}.

Think of it as the "umbrella" under which all learning will happen. Looking at your project focus, what's the central theme you want students to explore?

For ${project.subject}, you might consider something like: ${examples.join(', ')}.

What direction feels most exciting to you?`,
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
          'How might transportation choices affect where people live?'
        ];
      } else if (bigIdea?.toLowerCase().includes('sustain') || bigIdea?.toLowerCase().includes('environment')) {
        examples = [
          'How might we create more sustainable communities?',
          'How can we reduce our environmental impact locally?',
          'How might we design with nature in mind?'
        ];
      } else if (bigIdea?.toLowerCase().includes('community') || bigIdea?.toLowerCase().includes('design')) {
        examples = [
          'How might we design spaces that bring people together?',
          'How can we make our community more inclusive?',
          'How might we preserve what\'s important while embracing change?'
        ];
      } else {
        examples = [
          `How might we address real ${subject} challenges in our community?`,
          `How can ${ageGroup} make a positive impact through ${subject}?`,
          `How might we connect ${subject} learning to local issues?`
        ];
      }

      return {
        prompt: `Excellent! "${bigIdea}" is a rich theme for ${ageGroup} to explore.

Now let's craft your Essential Question. This should spark curiosity and drive inquiry throughout your project. It typically starts with "How might we..." or "How can we..." and connects your Big Idea to something ${ageGroup} can actually explore.

Given your focus on "${bigIdea}", here are some directions:

${examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

What kind of question would get your students genuinely curious and thinking?`,
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
            'Design a plan to make your school neighborhood more walkable',
            'Create a proposal for better bike paths in your community',
            'Build a model of a transportation solution for your neighborhood'
          ];
        } else {
          examples = [
            'Design a transportation improvement proposal for your local government',
            'Create a community presentation on sustainable transportation options',
            'Develop a plan to make a specific area more accessible and connected'
          ];
        }
      } else if (bigIdea?.toLowerCase().includes('sustain') || bigIdea?.toLowerCase().includes('environment')) {
        if (isElementary) {
          examples = [
            'Create a project that helps animals or plants in your community',
            'Design a way to reduce waste in your classroom or school',
            'Build something that helps take care of your local environment'
          ];
        } else {
          examples = [
            'Design a sustainability solution for a local business or organization',
            'Create a campaign to address an environmental issue in your community',
            'Develop a prototype that could help solve a local environmental challenge'
          ];
        }
      } else {
        if (isElementary) {
          examples = [
            `Create a project that helps solve a problem you see in your community`,
            `Design something that makes your school or neighborhood better`,
            `Build or create something that helps others learn about ${bigIdea?.toLowerCase() || 'your topic'}`
          ];
        } else {
          examples = [
            `Design a solution to a real problem related to ${bigIdea}`,
            `Create a presentation or proposal for local community members`,
            `Develop a prototype or plan that could actually be implemented`
          ];
        }
      }

      return {
        prompt: `Perfect! Your Essential Question "${essentialQuestion}" gives students a clear direction to explore.

Now for the Challenge - this is what students will actually DO. It should be:
- Action-oriented (starts with "Design," "Create," "Build," "Develop")
- Achievable within your timeframe
- Something students can be proud to share
- Connected to real community impact

Given your focus on "${bigIdea}" and the question "${essentialQuestion}", here are some challenge ideas for ${ageGroup}:

${examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

What kind of meaningful work do you want your students to produce?`,
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