// ConversationFlowManager.js - Manages the structured conversation flow

export const ConversationStates = {
  // Big Idea states
  BIG_IDEA_INTRO: 'big_idea_intro',
  BIG_IDEA_EXAMPLES: 'big_idea_examples',
  BIG_IDEA_WHATIFS: 'big_idea_whatifs',
  BIG_IDEA_HELP: 'big_idea_help',
  BIG_IDEA_SELECTED: 'big_idea_selected',
  BIG_IDEA_REFINING: 'big_idea_refining',
  
  // Essential Question states
  ESSENTIAL_QUESTION_INTRO: 'essential_question_intro',
  ESSENTIAL_QUESTION_EXAMPLES: 'essential_question_examples',
  ESSENTIAL_QUESTION_WHATIFS: 'essential_question_whatifs',
  ESSENTIAL_QUESTION_HELP: 'essential_question_help',
  ESSENTIAL_QUESTION_SELECTED: 'essential_question_selected',
  ESSENTIAL_QUESTION_REFINING: 'essential_question_refining',
  
  // Challenge states
  CHALLENGE_INTRO: 'challenge_intro',
  CHALLENGE_EXAMPLES: 'challenge_examples',
  CHALLENGE_WHATIFS: 'challenge_whatifs',
  CHALLENGE_HELP: 'challenge_help',
  CHALLENGE_SELECTED: 'challenge_selected',
  CHALLENGE_REFINING: 'challenge_refining',
  
  // Completion
  REVIEW: 'review',
  COMPLETE: 'complete'
};

export const ActionCards = {
  SEE_EXAMPLES: { text: 'See Examples', icon: 'FileText', type: 'primary' },
  EXPLORE_WHATIFS: { text: 'Explore What-Ifs', icon: 'Lightbulb', type: 'primary' },
  WHY_THIS_MATTERS: { text: 'Why This Matters', icon: 'HelpCircle', type: 'action' },
  CREATE_MY_OWN: { text: 'Create My Own', icon: 'Edit', type: 'secondary' },
  MORE_IDEAS: { text: 'More Ideas Aligned to My Context', icon: 'Refresh', type: 'secondary' },
  DEEPEN_THIS: { text: 'Deepen This Idea', icon: 'Sparkles', type: 'primary' },
  SEE_CONNECTIONS: { text: 'See Connections', icon: 'Link', type: 'primary' },
  CONTINUE: { text: 'Continue', icon: 'ArrowRight', type: 'success' },
  REFINE: { text: 'Refine', icon: 'Edit', type: 'secondary' },
  CHECK_ALIGNMENT: { text: 'Check Alignment', icon: 'Check', type: 'action' },
  REVIEW_FRAMEWORK: { text: 'Review Full Framework', icon: 'FileText', type: 'primary' },
  ADJUST_ELEMENT: { text: 'Adjust Any Element', icon: 'Edit', type: 'secondary' },
  COMPLETE_IDEATION: { text: 'Complete Ideation', icon: 'CheckCircle', type: 'success' }
};

export class ConversationFlowManager {
  constructor(projectInfo, ideationData) {
    this.projectInfo = projectInfo;
    this.ideationData = ideationData;
    this.currentState = ConversationStates.BIG_IDEA_INTRO;
    this.stateHistory = [];
  }

  getCurrentPhase() {
    if (this.currentState.includes('big_idea')) return 'bigIdea';
    if (this.currentState.includes('essential_question')) return 'essentialQuestion';
    if (this.currentState.includes('challenge')) return 'challenge';
    return 'review';
  }

  generateInitialMessage() {
    let message = `I'm excited to help you design a meaningful ${this.projectInfo.subject} project!`;
    
    // Add personalized greeting based on educator's vision
    if (this.projectInfo.educatorPerspective && this.projectInfo.educatorPerspective.length > 10) {
      const vision = this.projectInfo.educatorPerspective;
      const visionLower = vision.toLowerCase();
      
      // Extract key themes from their vision
      if (visionLower.includes('olympic')) {
        message += `\n\nI see you're interested in the Olympics - what a fantastic lens for exploring ${this.projectInfo.subject}! The Olympics offer rich opportunities to examine global perspectives, excellence, and cultural exchange.`;
      } else if (visionLower.includes('technology') || visionLower.includes('digital')) {
        message += `\n\nYour interest in technology and digital innovation is perfect for engaging today's students! Let's explore how ${this.projectInfo.subject} connects to our digital world.`;
      } else if (visionLower.includes('community') || visionLower.includes('local')) {
        message += `\n\nI love your focus on community impact! Students learn best when they can see how their work matters locally.`;
      } else if (visionLower.includes('environment') || visionLower.includes('sustain')) {
        message += `\n\nYour passion for environmental sustainability is inspiring! This is such a critical lens for student learning.`;
      } else if (visionLower.includes('creative') || visionLower.includes('arts')) {
        message += `\n\nCreativity and artistic expression are powerful ways to engage students! Let's design something that sparks their imagination.`;
      } else {
        // Generic but personalized response
        message += `\n\nI appreciate your vision: "${vision.substring(0, 100)}${vision.length > 100 ? '...' : ''}". Let's build on that foundation!`;
      }
    }
    
    message += `\n\nLet's start with the Big Idea - the overarching theme that will anchor your students' learning journey. This should be something that:
• Connects to real-world relevance
• Sparks curiosity and wonder  
• Has depth for exploration

What broad concept or theme do you want your ${this.projectInfo.ageGroup} students to explore?`;
    
    return message;
  }

  getStateResponse(state, context = {}) {
    const responses = {
      [ConversationStates.BIG_IDEA_INTRO]: {
        message: this.generateInitialMessage(),
        cards: [
          ActionCards.SEE_EXAMPLES,
          ActionCards.EXPLORE_WHATIFS,
          ActionCards.WHY_THIS_MATTERS
        ]
      },

      [ConversationStates.BIG_IDEA_EXAMPLES]: {
        message: `Based on your ${this.projectInfo.subject} focus and ${this.projectInfo.ageGroup} students:`,
        examples: this.generateBigIdeaExamples(),
        cards: [ActionCards.CREATE_MY_OWN]
      },

      [ConversationStates.BIG_IDEA_WHATIFS]: {
        message: `What if your students could explore:`,
        whatifs: this.generateBigIdeaWhatIfs(),
        cards: [ActionCards.MORE_IDEAS]
      },

      [ConversationStates.BIG_IDEA_HELP]: {
        message: `### Understanding the Big Idea

A strong Big Idea:
✓ **Gives your project a clear focus** - Everything connects back to this theme
✓ **Connects to real-world relevance** - Students see why this matters
✓ **Provides depth for exploration** - Rich enough to sustain deep learning
✓ **Sparks natural curiosity** - Students want to know more

Think of it as the "north star" that guides all learning activities. It should be:
- Broad enough to allow multiple perspectives
- Specific enough to provide focus
- Meaningful to your students' lives`,
        cards: [
          ActionCards.SEE_EXAMPLES,
          ActionCards.EXPLORE_WHATIFS
        ]
      },

      [ConversationStates.BIG_IDEA_SELECTED]: {
        message: `Excellent! "${context.bigIdea}" is a powerful theme that offers so much potential for exploration.

This Big Idea can help students:
${this.generateBigIdeaConnections(context.bigIdea)}

Would you like to deepen this idea further or move on to crafting your Essential Question?`,
        cards: [
          ActionCards.DEEPEN_THIS,
          ActionCards.SEE_CONNECTIONS,
          { ...ActionCards.CONTINUE, text: 'Continue to Essential Question' }
        ]
      },

      [ConversationStates.ESSENTIAL_QUESTION_INTRO]: {
        message: `Perfect! Now let's craft an Essential Question that will drive inquiry throughout the project.

Based on your Big Idea of "${this.ideationData.bigIdea}", we want a question that:
• Is open-ended (no single right answer)
• Provokes deep thinking
• Connects to students' lives
• Typically starts with How, Why, or What

What burning question should your students investigate?`,
        cards: [
          ActionCards.SEE_EXAMPLES,
          ActionCards.EXPLORE_WHATIFS,
          ActionCards.WHY_THIS_MATTERS
        ]
      },

      [ConversationStates.ESSENTIAL_QUESTION_EXAMPLES]: {
        message: `Questions that could drive your "${this.ideationData.bigIdea}" project:`,
        examples: this.generateEssentialQuestionExamples(),
        cards: [ActionCards.CREATE_MY_OWN]
      },

      [ConversationStates.ESSENTIAL_QUESTION_WHATIFS]: {
        message: `What if your question:`,
        whatifs: this.generateEssentialQuestionWhatIfs(),
        cards: [ActionCards.MORE_IDEAS]
      },

      [ConversationStates.CHALLENGE_INTRO]: {
        message: `Now let's define the Challenge - what students will actually create or do to demonstrate their learning.

With your Essential Question "${this.ideationData.essentialQuestion}" in mind, the challenge should:
• Give students a concrete goal
• Allow for creative solutions
• Connect to authentic audiences
• Result in meaningful impact

What will your students create or accomplish?`,
        cards: [
          ActionCards.SEE_EXAMPLES,
          ActionCards.EXPLORE_WHATIFS,
          ActionCards.WHY_THIS_MATTERS
        ]
      },

      [ConversationStates.CHALLENGE_EXAMPLES]: {
        message: `Students could:`,
        examples: this.generateChallengeExamples(),
        cards: [ActionCards.CREATE_MY_OWN]
      },

      [ConversationStates.CHALLENGE_WHATIFS]: {
        message: `What if students:`,
        whatifs: this.generateChallengeWhatIfs(),
        cards: [ActionCards.MORE_IDEAS]
      },

      [ConversationStates.REVIEW]: {
        message: `Let's review your complete ideation framework:

**Big Idea:** ${this.ideationData.bigIdea}
**Essential Question:** ${this.ideationData.essentialQuestion}
**Challenge:** ${this.ideationData.challenge}

This creates a powerful learning experience where students will explore ${this.ideationData.bigIdea} by investigating "${this.ideationData.essentialQuestion}" and ultimately ${this.ideationData.challenge}.

Everything looks aligned and ready to move forward!`,
        cards: [
          ActionCards.REVIEW_FRAMEWORK,
          ActionCards.ADJUST_ELEMENT,
          ActionCards.COMPLETE_IDEATION
        ]
      }
    };

    return responses[state] || responses[ConversationStates.BIG_IDEA_INTRO];
  }

  generateBigIdeaExamples() {
    const subject = this.projectInfo.subject?.toLowerCase() || '';
    const ageGroup = this.projectInfo.ageGroup?.toLowerCase() || '';
    const perspective = this.projectInfo.educatorPerspective?.toLowerCase() || '';
    
    // Dynamic examples based on educator's actual interests
    const examples = [];
    
    // Parse key themes from their perspective
    if (perspective) {
      // Olympics theme
      if (perspective.includes('olympic')) {
        examples.push(
          { text: 'Excellence Through Diversity', description: 'How different cultures approach competition and achievement' },
          { text: 'Global Unity Through Sport', description: 'Sports as a universal language connecting nations' },
          { text: 'Legacy and Transformation', description: 'How major events create lasting change in communities' }
        );
        return examples;
      }
      
      // Technology theme
      if (perspective.includes('technology') || perspective.includes('digital') || perspective.includes('coding')) {
        examples.push(
          { text: 'Digital Innovation', description: 'How technology shapes our world and future' },
          { text: 'Code for Good', description: 'Using programming skills to solve real problems' },
          { text: 'The Connected World', description: 'Understanding our digital ecosystem and its impact' }
        );
        return examples;
      }
      
      // Environmental theme
      if (perspective.includes('environment') || perspective.includes('climate') || perspective.includes('sustain')) {
        examples.push(
          { text: 'Sustainable Future', description: 'Creating solutions for environmental challenges' },
          { text: 'Climate Action Now', description: 'Understanding and responding to climate change' },
          { text: 'Green Communities', description: 'Building environmentally conscious neighborhoods' }
        );
        return examples;
      }
      
      // Community theme
      if (perspective.includes('community') || perspective.includes('local') || perspective.includes('neighbor')) {
        examples.push(
          { text: 'Community Voices', description: 'Amplifying local stories and perspectives' },
          { text: 'Neighborhood Innovation', description: 'Solving problems close to home' },
          { text: 'Stronger Together', description: 'Building connections and collaborative solutions' }
        );
        return examples;
      }
      
      // Creative/Arts theme
      if (perspective.includes('art') || perspective.includes('creative') || perspective.includes('music') || perspective.includes('design')) {
        examples.push(
          { text: 'Creative Expression', description: 'Using arts to communicate powerful ideas' },
          { text: 'Design Thinking', description: 'Solving problems through creative processes' },
          { text: 'Cultural Storytelling', description: 'Sharing heritage and identity through creative works' }
        );
        return examples;
      }
      
      // Social justice theme
      if (perspective.includes('justice') || perspective.includes('equity') || perspective.includes('rights')) {
        examples.push(
          { text: 'Voices for Change', description: 'Understanding and advocating for social justice' },
          { text: 'Equity in Action', description: 'Creating fair solutions for all community members' },
          { text: 'Rights and Responsibilities', description: 'Exploring what it means to be an engaged citizen' }
        );
        return examples;
      }
    }
    
    // Subject-specific examples
    if (subject.includes('science')) {
      return [
        { text: 'Climate Solutions', description: 'Exploring how we can address environmental challenges' },
        { text: 'The Living World', description: 'Understanding ecosystems and biodiversity' },
        { text: 'Innovation Through Science', description: 'How scientific thinking drives progress' }
      ];
    }
    
    if (subject.includes('history') || subject.includes('social')) {
      return [
        { text: 'Voices of Change', description: 'How individuals and movements shape society' },
        { text: 'Community Stories', description: 'Exploring local history and cultural heritage' },
        { text: 'Lessons from the Past', description: 'What history teaches us about today' }
      ];
    }
    
    // Age-appropriate defaults
    if (ageGroup.includes('elementary')) {
      return [
        { text: 'Our Connected World', description: 'How we relate to people and places' },
        { text: 'Problem Solvers', description: 'Using creativity to make things better' },
        { text: 'Community Helpers', description: 'How we can make a difference together' }
      ];
    }
    
    // General examples
    return [
      { text: 'Sustainable Communities', description: 'Creating better places to live' },
      { text: 'Innovation & Design', description: 'How creative thinking changes our world' },
      { text: 'Global Connections', description: 'Understanding our interconnected world' }
    ];
  }

  generateBigIdeaWhatIfs() {
    const perspective = this.projectInfo.educatorPerspective?.toLowerCase() || '';
    const ageGroup = this.projectInfo.ageGroup?.toLowerCase() || '';
    
    // Generate What-Ifs based on educator's interests
    if (perspective.includes('olympic') || perspective.includes('sport')) {
      return [
        { text: 'Students trained like Olympic athletes for academic excellence', impact: 'Applies athletic discipline to learning' },
        { text: 'Your classroom hosted its own "Olympics" of knowledge', impact: 'Creates friendly competition and celebration' },
        { text: 'Students coached each other toward personal bests', impact: 'Builds peer mentorship and support' }
      ];
    }
    
    if (perspective.includes('technology') || perspective.includes('digital')) {
      return [
        { text: 'Students became tech innovators solving real problems', impact: 'Empowers creative problem-solving' },
        { text: 'Your classroom was a startup incubator', impact: 'Develops entrepreneurial thinking' },
        { text: 'Learning happened through game design and coding', impact: 'Makes abstract concepts tangible' }
      ];
    }
    
    if (perspective.includes('environment') || perspective.includes('sustain')) {
      return [
        { text: 'Your school became carbon neutral through student projects', impact: 'Creates measurable real-world impact' },
        { text: 'Students designed the sustainable city of tomorrow', impact: 'Combines systems thinking with creativity' },
        { text: 'Every lesson connected to Earth\'s future', impact: 'Makes learning urgently relevant' }
      ];
    }
    
    // Default What-Ifs for any topic
    return [
      { text: 'Students became consultants for real organizations', impact: 'Provides authentic professional experience' },
      { text: 'Learning happened through community partnerships', impact: 'Connects classroom to real world' },
      { text: 'Students taught others what they discovered', impact: 'Deepens understanding through teaching' }
    ];
  }

  generateEssentialQuestionExamples() {
    const bigIdea = this.ideationData.bigIdea?.toLowerCase() || '';
    
    if (bigIdea.includes('sustainab') || bigIdea.includes('environment')) {
      return [
        { text: 'How might we create more sustainable communities?', focus: 'Action-oriented, solution-focused' },
        { text: 'Why does sustainability matter for our future?', focus: 'Values-based, reflective' },
        { text: 'What would happen if we reimagined our relationship with nature?', focus: 'Imaginative, transformative' }
      ];
    }
    
    if (bigIdea.includes('innovat') || bigIdea.includes('design')) {
      return [
        { text: 'How might we use design thinking to improve lives?', focus: 'Process-oriented, practical' },
        { text: 'Why does innovation require both creativity and empathy?', focus: 'Conceptual, humanistic' },
        { text: 'What makes a solution truly innovative?', focus: 'Analytical, criteria-based' }
      ];
    }
    
    // Generic but customized
    return [
      { text: `How might we use ${this.ideationData.bigIdea} to improve our community?`, focus: 'Local impact, actionable' },
      { text: `Why does ${this.ideationData.bigIdea} matter for our generation?`, focus: 'Personal relevance, future-oriented' },
      { text: `What would change if everyone understood ${this.ideationData.bigIdea}?`, focus: 'Systems thinking, broad impact' }
    ];
  }

  generateEssentialQuestionWhatIfs() {
    return [
      { text: 'Connected to current events happening right now', impact: 'Makes it timely and urgent' },
      { text: 'Challenged assumptions most people have', impact: 'Promotes critical thinking' },
      { text: 'Required collaboration beyond the classroom', impact: 'Builds real-world connections' }
    ];
  }

  generateChallengeExamples() {
    const question = this.ideationData.essentialQuestion?.toLowerCase() || '';
    
    return [
      { 
        text: 'Design and pitch a solution to local stakeholders', 
        outcome: 'Students present to real decision-makers' 
      },
      { 
        text: 'Create a multimedia exhibition for the community', 
        outcome: 'Public showcase of student learning' 
      },
      { 
        text: 'Develop a campaign to raise awareness and inspire action', 
        outcome: 'Students become advocates for change' 
      }
    ];
  }

  generateChallengeWhatIfs() {
    return [
      { text: 'Partnered with local organizations to implement ideas', impact: 'Real-world application' },
      { text: 'Created something that continues after the project', impact: 'Lasting legacy' },
      { text: 'Taught others what they learned', impact: 'Students as teachers' }
    ];
  }

  generateBigIdeaConnections(bigIdea) {
    return `• Connect their learning to real-world challenges
• Develop deep understanding through multiple perspectives
• See themselves as agents of change
• Build skills that transfer beyond the classroom`;
  }

  transitionState(action, userInput = null) {
    this.stateHistory.push(this.currentState);
    
    // Handle state transitions based on current state and action
    const transitions = {
      [ConversationStates.BIG_IDEA_INTRO]: {
        'See Examples': ConversationStates.BIG_IDEA_EXAMPLES,
        'Explore What-Ifs': ConversationStates.BIG_IDEA_WHATIFS,
        'Why This Matters': ConversationStates.BIG_IDEA_HELP,
        'user_input': ConversationStates.BIG_IDEA_SELECTED
      },
      [ConversationStates.BIG_IDEA_SELECTED]: {
        'Continue to Essential Question': ConversationStates.ESSENTIAL_QUESTION_INTRO,
        'Deepen This Idea': ConversationStates.BIG_IDEA_REFINING,
        'See Connections': ConversationStates.BIG_IDEA_WHATIFS
      },
      [ConversationStates.ESSENTIAL_QUESTION_INTRO]: {
        'See Examples': ConversationStates.ESSENTIAL_QUESTION_EXAMPLES,
        'Explore What-Ifs': ConversationStates.ESSENTIAL_QUESTION_WHATIFS,
        'Why This Matters': ConversationStates.ESSENTIAL_QUESTION_HELP,
        'user_input': ConversationStates.ESSENTIAL_QUESTION_SELECTED
      },
      [ConversationStates.ESSENTIAL_QUESTION_SELECTED]: {
        'Continue to Challenge': ConversationStates.CHALLENGE_INTRO,
        'Refine the Question': ConversationStates.ESSENTIAL_QUESTION_REFINING,
        'Check Alignment': ConversationStates.ESSENTIAL_QUESTION_WHATIFS
      }
    };
    
    const currentTransitions = transitions[this.currentState] || {};
    const nextState = userInput && !action ? currentTransitions['user_input'] : currentTransitions[action];
    
    if (nextState) {
      this.currentState = nextState;
    }
    
    return this.currentState;
  }
}