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
    
    // Add a general acknowledgment without hardcoding specific themes
    if (this.projectInfo.educatorPerspective && this.projectInfo.educatorPerspective.length > 10) {
      message += `\n\nI can see you've shared some thoughtful ideas about what matters to you as an educator. Let's build on that vision together!`;
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
    
    // Generate examples based ONLY on subject/age, not specific interests
    // This prevents us from biasing toward any particular theme
    
    // Subject-specific examples
    if (subject.includes('science')) {
      return [
        { text: 'Systems and Interactions', description: 'How different parts work together to create whole systems' },
        { text: 'Innovation Through Inquiry', description: 'Using scientific thinking to solve problems' },
        { text: 'Patterns in Nature', description: 'Discovering recurring themes across natural phenomena' }
      ];
    }
    
    if (subject.includes('history') || subject.includes('social')) {
      return [
        { text: 'Perspectives on Change', description: 'How different viewpoints shape our understanding' },
        { text: 'Connections Across Time', description: 'Linking past, present, and future' },
        { text: 'Communities and Culture', description: 'Understanding how groups form and evolve' }
      ];
    }
    
    if (subject.includes('math')) {
      return [
        { text: 'Mathematical Thinking', description: 'Using logic and patterns to understand the world' },
        { text: 'Data Stories', description: 'What numbers tell us about our communities' },
        { text: 'Problem-Solving Strategies', description: 'Multiple approaches to finding solutions' }
      ];
    }
    
    if (subject.includes('english') || subject.includes('language')) {
      return [
        { text: 'Power of Story', description: 'How narratives shape our understanding' },
        { text: 'Voice and Identity', description: 'Expressing unique perspectives through writing' },
        { text: 'Communication for Change', description: 'Using language to make a difference' }
      ];
    }
    
    if (subject.includes('art') || subject.includes('music') || subject.includes('creative')) {
      return [
        { text: 'Creative Expression', description: 'Using arts to communicate ideas and emotions' },
        { text: 'Design Process', description: 'From inspiration to creation' },
        { text: 'Cultural Connections', description: 'How art reflects and shapes society' }
      ];
    }
    
    // Age-appropriate defaults
    if (ageGroup.includes('elementary')) {
      return [
        { text: 'Wonder and Discovery', description: 'Exploring the world around us' },
        { text: 'Helping Our Community', description: 'Making a positive difference together' },
        { text: 'Learning Through Making', description: 'Creating things that matter' }
      ];
    }
    
    if (ageGroup.includes('middle')) {
      return [
        { text: 'Identity and Purpose', description: 'Understanding ourselves and our role' },
        { text: 'Real-World Connections', description: 'Linking learning to life' },
        { text: 'Innovation and Impact', description: 'Creating solutions that matter' }
      ];
    }
    
    // General examples that work for any context
    return [
      { text: 'Systems Thinking', description: 'Understanding how parts create wholes' },
      { text: 'Creative Problem-Solving', description: 'Finding innovative solutions' },
      { text: 'Community Impact', description: 'Making a difference in our world' }
    ];
  }

  generateBigIdeaWhatIfs() {
    // Generate universal What-Ifs that work for any subject/interest
    // No hardcoded themes - these are pedagogical approaches that apply universally
    
    // Universal What-Ifs that apply to any subject or interest
    const sets = [
      [
        { text: 'Students became consultants for real organizations', impact: 'Provides authentic professional experience' },
        { text: 'Learning happened through community partnerships', impact: 'Connects classroom to real world' },
        { text: 'Students taught others what they discovered', impact: 'Deepens understanding through teaching' }
      ],
      [
        { text: 'Your classroom became a think tank for local issues', impact: 'Creates immediate relevance' },
        { text: 'Students designed solutions that could be implemented tomorrow', impact: 'Builds practical skills' },
        { text: 'Learning connected to current events as they unfolded', impact: 'Makes content dynamic and timely' }
      ],
      [
        { text: 'Every lesson linked to a real-world mentor', impact: 'Provides career connections' },
        { text: 'Students created resources used by younger grades', impact: 'Reinforces learning through teaching' },
        { text: 'Projects addressed actual community needs', impact: 'Creates meaningful impact' }
      ],
      [
        { text: 'Students presented their work to authentic audiences', impact: 'Creates accountability and purpose' },
        { text: 'Learning experiences extended beyond classroom walls', impact: 'Expands educational boundaries' },
        { text: 'Every student developed a unique expertise to share', impact: 'Builds individual strengths' }
      ],
      [
        { text: 'Your classroom operated like a professional workspace', impact: 'Prepares for real-world environments' },
        { text: 'Students solved problems no one has solved before', impact: 'Encourages original thinking' },
        { text: 'Learning became a public, celebrated process', impact: 'Values transparency and growth' }
      ]
    ];
    return sets[(this.whatIfIteration || 0) % sets.length];
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
    
    // Handle "More Ideas" action to increment iteration
    if (action === 'More Ideas Aligned to My Context') {
      this.whatIfIteration = (this.whatIfIteration || 0) + 1;
      // Stay in same state but with new ideas
      return this.currentState;
    }
    
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