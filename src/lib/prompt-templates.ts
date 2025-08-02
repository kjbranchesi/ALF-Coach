// Warm, educator-friendly prompts that bring learning theory to life

export interface StageContext {
  subject: string;
  ageGroup: string;
  location?: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  learningObjectives?: string[];
  priorKnowledge?: string;
  culturalContext?: string;
}

// Pedagogical framework integrations
export interface PedagogicalFramework {
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  dokLevel: 1 | 2 | 3 | 4;
  developmentalStage: 'concrete_operational' | 'formal_operational' | 'emerging_adult';
  udlPrinciples: ('representation' | 'engagement' | 'expression')[];
  scaffoldingType: 'modeling' | 'guided_practice' | 'independent_application';
}

export const StagePromptTemplates = {
  IDEATION_BIG_IDEA: {
    welcome: (ctx: StageContext) => {
      const ageRange = ctx.ageGroup || 'students';
      const locationContext = ctx.location ? ` in ${ctx.location}` : '';
      
      // Apply developmental theory to customize approach
      const isDevelopingAbstractThinking = ageRange.includes('elementary') || ageRange.includes('middle');
      const needsConcreteBridge = ageRange.includes('elementary');
      
      return `Welcome! Let's discover a Big Idea that will light up learning for your ${ageRange} students${locationContext} in ${ctx.subject}.

**Why This Matters:**
Think of your Big Idea as the golden thread that weaves through everything your students do. It's the "aha!" moment waiting to happen. Great Big Ideas:

• **Build on what students already know** - Start where they are, take them somewhere amazing
• **Answer the questions they're already asking** - Tap into their natural curiosity
• **Travel beyond your classroom walls** - Give them insights they'll use for life
• **Welcome every student's story** - Honor the rich experiences they bring to learning

${needsConcreteBridge ? 
  `**Elementary Consideration:** Your Big Idea should connect abstract concepts to concrete, observable phenomena that students can experience directly.` :
  isDevelopingAbstractThinking ?
  `**Developmental Consideration:** Your Big Idea can bridge concrete experiences with emerging abstract thinking capabilities.` :
  `**Advanced Learner Focus:** Your Big Idea can engage sophisticated conceptual thinking and interdisciplinary connections.`}

**The Magic Test:** A truly powerful Big Idea makes students lean forward in their seats, ready to explore. It helps them see ${ctx.subject} everywhere - in their lives, their communities, their future.

What big concept could become your students' new superpower for understanding ${ctx.subject}?`;
    },
    
    validation_response: (issues: string[], suggestions: string[], ctx: StageContext) => {
      const ageRange = ctx.ageGroup || 'students';
      
      // Apply warm coaching approach that feels like a helpful colleague
      return `I love where you're going with this! Let's polish it until it sparkles:

**What I'm noticing:**
${issues.map(i => `• ${i}`).join('\n')}

**Ways to make it even stronger:**
${suggestions.length > 0 ? 
  suggestions.map(s => `• ${s} (This taps into how students naturally learn best)`).join('\n') : 
  '• Consider what would make students say "Wait, that\'s everywhere!"\n• Think about themes that matter in their daily lives\n• Reflect on how this connects to their own experiences and stories'}

**Questions that might help:**
• How could this Big Idea travel home with your ${ageRange}?
• What would make them start noticing this concept in their world?
• How does this welcome the wisdom they already bring to your classroom?

Shall we refine this together, or would you like to see some examples that really click with students?`;
    },
    
    confirmation: (idea: string, ctx: StageContext) => {
      const ageRange = ctx.ageGroup || 'students';
      
      // Celebrate their success with warmth and encouragement
      const bloomsAdvancement = getBloomsProgression(idea, ctx.subject);
      const developmentalAlignment = getDevelopmentalAlignment(idea, ageRange);
      
      return `**Yes! "${idea}" is going to transform how your students see ${ctx.subject}!**

**Why this Big Idea is brilliant:**
• **Engages their minds:** ${bloomsAdvancement}
• **Perfect fit:** ${developmentalAlignment} 
• **Travels everywhere:** Students will start seeing this concept in their daily lives
• **Welcomes everyone:** Every student can connect their story to this universal theme

**The secret sauce:** You've created what educators call a "bridge concept" - it connects what students know to what they're about to discover. That's the magic of great teaching!

This is the perfect launching pad for deep learning. Ready to craft a question that will have students diving deep into "${idea}" with genuine excitement?`;
    }
  },
  
  IDEATION_EQ: {
    welcome: (ctx: StageContext) => {
      const ageRange = ctx.ageGroup || 'students';
      const dokLevel = getDOKLevel(ageRange);
      const questionStems = getQuestionStems(dokLevel, ctx.subject);
      
      return `Perfect! With "${ctx.bigIdea}" as our north star, let's create a question that makes students want to investigate.

**What makes a question irresistible:**
The best Essential Questions feel like mysteries your students actually want to solve. They should:

• **Challenge what students think they know** - Create that productive "Wait, what?" moment
• **Make students think like detectives** - Push beyond just remembering to really analyzing
• **Help students understand how they learn** - Build awareness of their own thinking
• **Connect to the real world** - Address questions that matter beyond the classroom

**Depth of Knowledge Target for ${ageRange}:** ${dokLevel === 1 ? 'Recall and Recognition' : dokLevel === 2 ? 'Skills and Concepts' : dokLevel === 3 ? 'Strategic Thinking' : 'Extended Thinking'}

**Question Stems That Work:**
${questionStems.map(stem => `• ${stem}`).join('\n')}

**The ultimate test:** Your Essential Question should make students want to investigate, spark great debates, and help them see the world differently.

What question would make your ${ageRange} students eager to dive deep into "${ctx.bigIdea}"?`;
    },
    
    transformation_help: (input: string, ctx: StageContext) => {
      const interest = input.replace(/^(i am interested in|i like|i want to explore)/i, '').trim()
        .replace(/\?$/, ''); // Remove trailing question mark if present
      
      return `I love that you're drawn to ${interest}! That passion is exactly what will make this question come alive for students.

Let's turn your interest in ${interest} into a question that connects to your Big Idea "${ctx.bigIdea}" and gets students excited:

• "How might ${interest} ${ctx.bigIdea.includes(' as ') ? 'show us' : 'reveal'} ${ctx.bigIdea}?"
• "In what ways do ${interest} shape how we understand ${ctx.subject}?"
• "Why should your ${ctx.ageGroup} care about ${interest} in today's world?"
• "What can ${interest} teach us about ${ctx.bigIdea.toLowerCase()}?"

Any of these spark something for you? Or do they inspire a completely different direction?`;
    },
    
    validation_response: (issues: string[], suggestions: string[], input: string) => {
      return `I can see the potential here! Let's craft this into a question that will hook your students:

${issues.map(i => `• ${i}`).join('\n')}

${suggestions.length > 0 ? `\n${suggestions.join('\n')}` : ''}

The sweet spot is a question that makes students lean in and want to explore different viewpoints. What direction feels right to you?`;
    }
  },
  
  IDEATION_CHALLENGE: {
    welcome: (ctx: StageContext) => {
      return `That question is going to spark amazing discussions! Now let's create a challenge that puts students' learning into action.

Your students will explore "${ctx.essentialQuestion}" through meaningful work that:
• Matters to real people beyond your classroom
• Lets students use their creativity and unique strengths
• Shows off their deep understanding
• Makes a difference in ${ctx.location ? `${ctx.location}` : 'their community'}

What kind of challenge would make your students feel like their learning really matters?`;
    },
    
    validation_response: (issues: string[], suggestions: string[]) => {
      return `I love the direction you're heading! Let's make this challenge absolutely irresistible:

${issues.map(i => `• ${i}`).join('\n')}

${suggestions.length > 0 ? `\nSome ideas to consider:\n${suggestions.map(s => `• ${s}`).join('\n')}` : ''}

The magic happens when students feel their work truly matters. What would make them rush to tell their families about what they're doing?`;
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

// Pedagogical helper functions for enhanced prompts

export function getResearchConnection(suggestion: string): string {
  if (suggestion.includes('concrete')) return 'what we know about how young minds develop';
  if (suggestion.includes('connect')) return 'research on how students learn best together';
  if (suggestion.includes('relevant')) return 'motivation science about what makes learning stick';
  if (suggestion.includes('cultural')) return 'inclusive teaching that honors every student';
  return 'how students naturally build understanding';
}

export function getBloomsProgression(idea: string, subject: string): string {
  const level = analyzeCognitiveLevel(idea);
  switch (level) {
    case 'analyze': return 'Gets students looking for patterns and thinking critically';
    case 'evaluate': return 'Helps students make judgments and back them up with evidence';
    case 'create': return 'Empowers students to think originally and put ideas together in new ways';
    default: return 'Builds the foundation students need for deeper thinking';
  }
}

export function getDevelopmentalAlignment(idea: string, ageGroup: string): string {
  if (ageGroup.includes('elementary')) {
    return 'Connects big ideas to things students can see and touch - perfect for how elementary minds work';
  } else if (ageGroup.includes('middle')) {
    return 'Bridges hands-on learning with the abstract thinking that\'s just developing';
  } else if (ageGroup.includes('high')) {
    return 'Engages the sophisticated thinking that teenagers are ready for';
  }
  return 'Matches beautifully with how students at this age learn best';
}

export function getDOKLevel(ageGroup: string): number {
  if (ageGroup.includes('elementary')) return 2; // Skills and Concepts
  if (ageGroup.includes('middle')) return 3; // Strategic Thinking  
  if (ageGroup.includes('high') || ageGroup.includes('adult')) return 4; // Extended Thinking
  return 2; // Default to Skills and Concepts
}

export function getQuestionStems(dokLevel: number, subject: string): string[] {
  const baseStems = {
    2: [
      'How does [concept] affect [real situation]?',
      'What patterns do you notice in [phenomenon]?',
      'Why is [concept] important for [authentic context]?'
    ],
    3: [
      'How might we use [concept] to address [real problem]?',
      'What would happen if [scenario] in [authentic context]?',
      'How do different perspectives on [issue] shape [outcomes]?'
    ],
    4: [
      'How could [concept] transform [large-scale system]?',
      'What is the relationship between [complex variables] over time?',
      'How might we create [innovation] to address [systemic challenge]?'
    ]
  };
  
  return baseStems[dokLevel as keyof typeof baseStems] || baseStems[2];
}

function analyzeCognitiveLevel(idea: string): string {
  const lowerIdea = idea.toLowerCase();
  if (lowerIdea.includes('create') || lowerIdea.includes('design') || lowerIdea.includes('develop')) return 'create';
  if (lowerIdea.includes('evaluate') || lowerIdea.includes('judge') || lowerIdea.includes('assess')) return 'evaluate';
  if (lowerIdea.includes('analyze') || lowerIdea.includes('compare') || lowerIdea.includes('examine')) return 'analyze';
  return 'understand';
}