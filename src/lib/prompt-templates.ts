// Stage-specific prompt templates that ensure quality, grammatical responses

export interface StageContext {
  subject: string;
  ageGroup: string;
  location?: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
}

export const StagePromptTemplates = {
  IDEATION_BIG_IDEA: {
    welcome: (ctx: StageContext) => {
      const ageRange = ctx.ageGroup || 'students';
      const locationContext = ctx.location ? ` in ${ctx.location}` : '';
      
      return `Welcome! Let's start by finding the heart of your unit - the Big Idea that will transform how your ${ageRange} students${locationContext} see ${ctx.subject}.

A Big Idea is a conceptual lens that:
• Connects ${ctx.subject} to students' lives
• Sparks genuine curiosity
• Guides deep learning

What overarching concept could make ${ctx.subject} feel urgent and relevant to your students?`;
    },
    
    validation_response: (issues: string[], suggestions: string[]) => {
      return `I notice a few things about your idea:

${issues.map(i => `• ${i}`).join('\n')}

${suggestions.length > 0 ? `\nHere are some ways to strengthen it:\n${suggestions.map(s => `• ${s}`).join('\n')}` : ''}

Would you like to refine your Big Idea, or shall I share some examples tailored to your context?`;
    },
    
    confirmation: (idea: string, ctx: StageContext) => {
      const responses = [
        `"${idea}" - what a powerful lens! This could really transform how your ${ctx.ageGroup} students engage with ${ctx.subject}. Ready to craft an essential question that brings this to life?`,
        
        `I love this direction! "${idea}" creates such rich possibilities for exploration. Your students will be able to see ${ctx.subject} in a whole new light. Shall we move on to the essential question?`,
        
        `That's compelling! "${idea}" bridges academic learning with real meaning. I can already imagine the conversations this will spark. Ready for the next step?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
  },
  
  IDEATION_EQ: {
    welcome: (ctx: StageContext) => {
      return `Excellent! With "${ctx.bigIdea}" as our anchor, let's craft an Essential Question.

This question should:
• Be open-ended (no single right answer)
• Provoke deep thinking
• Connect to real-world relevance
• Guide the entire learning journey

What question could help ${ctx.ageGroup} students explore "${ctx.bigIdea}" in meaningful ways?`;
    },
    
    transformation_help: (input: string, ctx: StageContext) => {
      const interest = input.replace(/^(i am interested in|i like|i want to explore)/i, '').trim()
        .replace(/\?$/, ''); // Remove trailing question mark if present
      
      return `I see you're interested in ${interest}! That's a great starting point. Let's transform this interest into a powerful Essential Question that students can explore.

Based on your Big Idea "${ctx.bigIdea}" and your interest in ${interest}, here are some question formats that could work:

• "How might ${interest} ${ctx.bigIdea.includes(' as ') ? 'demonstrate' : 'reveal'} ${ctx.bigIdea}?"
• "In what ways do ${interest} shape our understanding of ${ctx.subject}?"
• "Why should ${ctx.ageGroup} students care about ${interest} in today's world?"
• "What can ${interest} teach us about ${ctx.bigIdea.toLowerCase()}?"

Would you like to use one of these, adapt them, or create your own Essential Question?`;
    },
    
    validation_response: (issues: string[], suggestions: string[], input: string) => {
      return `Let me help you shape this into a powerful Essential Question.

${issues.map(i => `• ${i}`).join('\n')}

${suggestions.length > 0 ? `\n${suggestions.join('\n')}` : ''}

Remember, the best Essential Questions make students think deeply and see multiple perspectives. What angle would you like to explore?`;
    }
  },
  
  IDEATION_CHALLENGE: {
    welcome: (ctx: StageContext) => {
      return `Powerful question! Now let's define an authentic challenge.

Students will explore "${ctx.essentialQuestion}" through a real-world task that:
• Has genuine purpose or audience
• Allows creative solutions
• Demonstrates deep understanding
• Connects to ${ctx.location ? `${ctx.location  } community` : 'real'} needs

What challenge could bring this learning to life?`;
    },
    
    validation_response: (issues: string[], suggestions: string[]) => {
      return `Let's make this challenge more concrete and compelling:

${issues.map(i => `• ${i}`).join('\n')}

${suggestions.length > 0 ? `\nConsider these adjustments:\n${suggestions.map(s => `• ${s}`).join('\n')}` : ''}

The best challenges give students real purpose. What would make your students excited to dive in?`;
    }
  }
};

// Generate contextual ideas based on stage and user data
export function generateContextualIdeas(stage: string, ctx: StageContext): string[] {
  const templates = {
    IDEATION_BIG_IDEA: [
      `${ctx.subject} as a tool for social change`,
      `${ctx.subject} as a window into human nature`,
      `${ctx.subject} as a bridge between past and future`,
      `The hidden stories within ${ctx.subject}`,
      `${ctx.subject} through the lens of sustainability`
    ],
    
    IDEATION_EQ: [
      `How might we use ${ctx.subject} to address challenges in ${ctx.location || 'our community'}?`,
      `In what ways does ${ctx.subject} shape identity and culture?`,
      `What can ${ctx.subject} teach us about resilience and adaptation?`,
      `How do different perspectives on ${ctx.subject} reflect our values?`,
      `Why does ${ctx.subject} matter more now than ever before?`
    ],
    
    IDEATION_CHALLENGE: [
      `Design a ${ctx.subject}-based solution for a local community challenge`,
      `Create a multimedia exhibition that explores "${ctx.essentialQuestion}"`,
      `Develop a campaign that uses ${ctx.subject} to inspire positive change`,
      `Build a resource that helps others understand ${ctx.bigIdea}`,
      `Launch a project that connects ${ctx.subject} learning to real impact`
    ]
  };
  
  return templates[stage as keyof typeof templates] || [];
}

// Format AI response to avoid awkward phrasing
export function formatAIResponse(template: string, data: any): string {
  // Replace template variables
  let response = template;
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    response = response.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  // Clean up any grammatical issues
  response = response
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .trim();
  
  return response;
}