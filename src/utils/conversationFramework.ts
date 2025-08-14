/**
 * conversationFramework.ts
 * 
 * Better grounding and guidance for teachers using ALF
 */

export interface ConversationStage {
  id: string;
  name: string;
  description: string;
  readyForCards: boolean;
  messages: {
    initial?: string;
    followup?: string;
    transition?: string;
  };
}

export const CONVERSATION_STAGES: Record<string, ConversationStage> = {
  GROUNDING: {
    id: 'GROUNDING',
    name: 'Framework Introduction',
    description: 'Introduce the teacher to ALF and understand their context',
    readyForCards: false,
    messages: {
      initial: `# Welcome to ALF Coach!

I'm here to help you design an engaging project-based learning experience using the **Active Learning Framework (ALF)**.

## What is ALF?

ALF is a proven framework that guides students through the **Creative Process** to develop critical 21st-century skills. Your students will:

1. **Analyze** - Research and understand the problem space
2. **Brainstorm** - Generate creative solutions
3. **Prototype** - Build and test their ideas
4. **Evaluate** - Reflect and iterate on their work

## Let's Start with You

Before we design your project, I'd like to understand your teaching context better.

**What subject area do you teach?** 

*(For example: Science, Math, English, History, Art, etc.)*`,
      
      followup: `Great! I see you teach **{subject}**. 

Now, let's understand your students better so we can design an age-appropriate project.

**What grade level or age group are your students?**

*(For example: 9th grade, ages 14-15, high school seniors, etc.)*`,
      
      transition: `Perfect! You're teaching **{subject}** to **{gradeLevel}** students.

One more quick question before we start designing:

**How long do you have for this project?**

Consider:
- Quick sprint: 1-2 weeks
- Standard project: 3-4 weeks  
- Deep dive: 5-8 weeks
- Semester-long: 12+ weeks`
    }
  },
  
  IDEATION_INTRO: {
    id: 'IDEATION_INTRO',
    name: 'Ideation Introduction',
    description: 'Explain the ideation phase before showing cards',
    readyForCards: false,
    messages: {
      initial: `## Excellent! Let's Design Your Project

You're teaching **{subject}** to **{gradeLevel}** students for **{duration}**.

Now we'll work through three key elements that will form the foundation of your project:

### The Three Pillars of ALF

1. **Big Idea** - The overarching theme or concept that connects to real-world issues
2. **Essential Question** - The driving inquiry that guides student exploration
3. **Challenge** - The authentic task students will tackle

These work together to create meaningful, engaging learning experiences.

**Let's start with the Big Idea.**

Think about:
- What themes in your subject connect to students' lives?
- What concepts have real-world relevance?
- What would make students say "this matters"?

*What topic or theme would you like to explore with your students?*`
    }
  },
  
  BIG_IDEA: {
    id: 'BIG_IDEA',
    name: 'Big Idea Development',
    description: 'Help teacher develop their Big Idea',
    readyForCards: true,
    messages: {
      initial: `I can help you develop a compelling **Big Idea** around that topic.

A strong Big Idea should:
- Connect to real-world issues
- Be conceptual (not just a topic)
- Resonate with student interests
- Allow for multiple perspectives

Would you like me to suggest some Big Ideas, or do you have one in mind?`,
      
      followup: `That's a great starting point! Let me help you refine this into a powerful Big Idea.

**Current concept:** {userInput}

Here are some ways to strengthen it:

1. **Make it more conceptual** - Move from topic to theme
2. **Add relevance** - Connect to current events or student lives
3. **Broaden perspective** - Allow for multiple viewpoints

*How would you like to develop this further?*`
    }
  },
  
  ESSENTIAL_QUESTION: {
    id: 'ESSENTIAL_QUESTION',
    name: 'Essential Question',
    description: 'Craft the driving question',
    readyForCards: true,
    messages: {
      initial: `Excellent! Your Big Idea is taking shape:

> **{bigIdea}**

Now let's create an **Essential Question** that will drive student inquiry.

A powerful Essential Question:
- Is open-ended (no single right answer)
- Provokes deep thinking
- Connects to the Big Idea
- Matters to students

*What question would you want students to explore throughout this project?*`
    }
  },
  
  CHALLENGE: {
    id: 'CHALLENGE',
    name: 'Challenge Design',
    description: 'Define the authentic challenge',
    readyForCards: true,
    messages: {
      initial: `Perfect! We now have:

> **Big Idea:** {bigIdea}
> **Essential Question:** {essentialQuestion}

The final piece is the **Challenge** - the authentic task students will complete.

A meaningful Challenge should:
- Address a real problem or need
- Allow for creative solutions
- Connect to the community
- Result in a tangible outcome

*What real-world problem or task could students tackle that relates to your Big Idea and Essential Question?*`
    }
  }
};

export function getStageMessage(
  stage: string, 
  messageType: 'initial' | 'followup' | 'transition',
  context?: Record<string, string>
): string {
  const stageConfig = CONVERSATION_STAGES[stage];
  if (!stageConfig) return '';
  
  let message = stageConfig.messages[messageType] || '';
  
  // Replace placeholders with context values
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });
  }
  
  return message;
}

export function shouldShowCards(stage: string, messageCount: number): boolean {
  const stageConfig = CONVERSATION_STAGES[stage];
  if (!stageConfig) return false;
  
  // Only show cards if:
  // 1. The stage is ready for cards
  // 2. We've had enough conversation to establish context
  // 3. User seems ready (based on message count)
  return stageConfig.readyForCards && messageCount >= 2;
}

export function getNextStage(currentStage: string): string {
  const stageOrder = [
    'GROUNDING',
    'IDEATION_INTRO', 
    'BIG_IDEA',
    'ESSENTIAL_QUESTION',
    'CHALLENGE',
    'JOURNEY',
    'DELIVERABLES'
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
    return currentStage;
  }
  
  return stageOrder[currentIndex + 1];
}