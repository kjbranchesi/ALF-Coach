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
    
    // Acknowledge and reflect back their specific interests
    if (this.projectInfo.educatorPerspective && this.projectInfo.educatorPerspective.length > 10) {
      const perspective = this.projectInfo.educatorPerspective;
      
      // Extract key concepts from their input to acknowledge them
      const concepts = this.extractKeyConcepts(perspective);
      if (concepts.length > 0) {
        message += `\n\nI love that you're interested in ${concepts.slice(0, 2).join(' and ')}! These are powerful lenses for student learning in ${this.projectInfo.subject}.`;
      } else {
        message += `\n\nYour perspective on education is valuable: "${perspective.substring(0, 100)}${perspective.length > 100 ? '...' : ''}". Let's build on these ideas!`;
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
    const location = this.projectInfo.location?.toLowerCase() || '';
    
    // Generate PERSONALIZED examples based on teacher's actual interests
    const examples = [];
    
    // Extract key concepts from their perspective
    const concepts = this.extractKeyConcepts(this.projectInfo.educatorPerspective);
    
    // Generate examples that blend their interests with the subject
    if (concepts.length > 0) {
      // Create examples that combine their interests with the subject matter
      concepts.slice(0, 3).forEach((concept, i) => {
        examples.push(this.createBigIdeaFromConcept(concept, subject, ageGroup));
      });
      
      // If we have examples from their interests, return those
      if (examples.length > 0) {
        return examples;
      }
    }
    
    // Fallback to subject-specific examples if no clear interests extracted
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
    const perspective = this.projectInfo.educatorPerspective || '';
    const subject = this.projectInfo.subject || '';
    const ageGroup = this.projectInfo.ageGroup || '';
    
    // Generate PERSONALIZED What-Ifs based on their specific interests
    const concepts = this.extractKeyConcepts(perspective);
    
    // Create What-Ifs that blend their interests with pedagogical approaches
    if (concepts.length > 0) {
      const personalizedSets = this.generatePersonalizedWhatIfs(concepts, subject, ageGroup);
      if (personalizedSets.length > 0) {
        return personalizedSets[(this.whatIfIteration || 0) % personalizedSets.length];
      }
    }
    
    // Fallback to universal What-Ifs that can work with any topic
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
  
  // Extract key concepts from educator's perspective using simple keyword analysis
  extractKeyConcepts(perspective) {
    if (!perspective || perspective.length < 10) return [];
    
    const text = perspective.toLowerCase();
    const concepts = [];
    
    // Common educational themes and their indicators
    const themeIndicators = {
      'environmental sustainability': ['environment', 'sustain', 'climate', 'green', 'eco', 'nature', 'earth'],
      'technology innovation': ['technology', 'digital', 'coding', 'computer', 'app', 'software', 'ai', 'virtual'],
      'social justice': ['justice', 'equity', 'rights', 'fair', 'equality', 'activism', 'change'],
      'community engagement': ['community', 'local', 'neighbor', 'civic', 'town', 'city'],
      'global perspectives': ['global', 'world', 'international', 'culture', 'diverse', 'multicultural'],
      'creative expression': ['art', 'creative', 'music', 'design', 'artistic', 'express', 'imagination'],
      'entrepreneurship': ['business', 'entrepreneur', 'startup', 'innovate', 'market', 'product'],
      'health and wellness': ['health', 'wellness', 'fitness', 'nutrition', 'mental', 'physical'],
      'scientific inquiry': ['research', 'experiment', 'hypothesis', 'data', 'evidence', 'discover'],
      'historical connections': ['history', 'past', 'heritage', 'tradition', 'ancestor', 'legacy']
    };
    
    // Check for each theme
    for (const [theme, keywords] of Object.entries(themeIndicators)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        concepts.push(theme);
      }
    }
    
    // Also extract specific nouns/topics they mentioned
    const specificTopics = this.extractSpecificTopics(perspective);
    concepts.push(...specificTopics);
    
    return [...new Set(concepts)]; // Remove duplicates
  }
  
  // Extract specific topics mentioned dynamically
  extractSpecificTopics(perspective) {
    if (!perspective) return [];
    
    const topics = [];
    const text = perspective.toLowerCase();
    
    // Extract quoted phrases first (these are usually important)
    const quotedMatches = perspective.match(/"([^"]+)"/g) || [];
    quotedMatches.forEach(match => {
      topics.push(match.replace(/"/g, ''));
    });
    
    // Look for "interested in X", "passionate about Y", "focus on Z" patterns
    const interestPatterns = [
      /interested in ([\w\s]+?)(?:\.|,|;|and|$)/gi,
      /passionate about ([\w\s]+?)(?:\.|,|;|and|$)/gi,
      /focus on ([\w\s]+?)(?:\.|,|;|and|$)/gi,
      /exploring ([\w\s]+?)(?:\.|,|;|and|$)/gi,
      /love ([\w\s]+?)(?:\.|,|;|and|$)/gi,
      /excited about ([\w\s]+?)(?:\.|,|;|and|$)/gi
    ];
    
    interestPatterns.forEach(pattern => {
      const matches = [...perspective.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          topics.push(match[1].trim());
        }
      });
    });
    
    // Look for specific nouns that might be topics (capitalized words in middle of sentences)
    const properNouns = perspective.match(/(?<!^|\. )[A-Z][\w\s]+/g) || [];
    properNouns.forEach(noun => {
      if (noun.length > 3 && !topics.includes(noun.trim())) {
        topics.push(noun.trim());
      }
    });
    
    return [...new Set(topics)]; // Remove duplicates
  }
  
  // Create a Big Idea example from a concept
  createBigIdeaFromConcept(concept, subject, ageGroup) {
    const conceptMap = {
      'environmental sustainability': {
        text: 'Sustainable Futures',
        description: `How can we create solutions that protect our planet while studying ${subject}?`
      },
      'technology innovation': {
        text: 'Digital Transformation',
        description: `Using technology to reimagine how we learn and apply ${subject}`
      },
      'social justice': {
        text: 'Equity in Action',
        description: `Exploring fairness and justice through the lens of ${subject}`
      },
      'community engagement': {
        text: 'Local Impact',
        description: `How ${subject} knowledge can strengthen our community`
      },
      'global perspectives': {
        text: 'World Connections',
        description: `Understanding ${subject} from diverse cultural viewpoints`
      },
      'creative expression': {
        text: 'Creative Innovation',
        description: `Blending artistic expression with ${subject} concepts`
      }
    };
    
    // If we have a mapping, use it
    if (conceptMap[concept]) {
      return conceptMap[concept];
    }
    
    // Otherwise, create a dynamic one
    return {
      text: concept.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: `Exploring ${concept} through ${subject} with ${ageGroup} students`
    };
  }
  
  // Generate personalized What-Ifs based on extracted concepts
  generatePersonalizedWhatIfs(concepts, subject, ageGroup) {
    const sets = [];
    
    // Create 3 sets of What-Ifs that blend their interests with learning approaches
    for (let setIndex = 0; setIndex < 3; setIndex++) {
      const whatifs = [];
      
      // Generate 3 What-Ifs per set
      concepts.slice(0, 3).forEach((concept, i) => {
        const whatif = this.createWhatIfFromConcept(concept, subject, ageGroup, setIndex);
        whatifs.push(whatif);
      });
      
      // If we don't have enough from concepts, add some universal ones
      while (whatifs.length < 3) {
        whatifs.push({
          text: `Students became experts in ${subject} through hands-on projects`,
          impact: 'Deep, experiential learning'
        });
      }
      
      sets.push(whatifs);
    }
    
    return sets;
  }
  
  // Create a What-If from a concept
  createWhatIfFromConcept(concept, subject, ageGroup, variation = 0) {
    const templates = [
      {
        text: `Students used ${concept} as a lens to transform their understanding of ${subject}`,
        impact: 'Connects personal interests to academic content'
      },
      {
        text: `Your classroom became a hub for ${concept} innovation in ${subject}`,
        impact: 'Positions students as creators and leaders'
      },
      {
        text: `Learning ${subject} through ${concept} connected to real community needs`,
        impact: 'Authentic purpose and impact'
      }
    ];
    
    return templates[variation % templates.length];
  }

  generateEssentialQuestionExamples() {
    const bigIdea = this.ideationData.bigIdea || '';
    const subject = this.projectInfo.subject || '';
    const ageGroup = this.projectInfo.ageGroup || '';
    const perspective = this.projectInfo.educatorPerspective || '';
    const location = this.projectInfo.location || '';
    
    // Extract concepts from both the Big Idea and original perspective
    const concepts = this.extractKeyConcepts(perspective);
    
    const questions = [];
    
    // Generate questions that connect Big Idea to their interests and context
    if (bigIdea) {
      questions.push({
        text: `How might ${ageGroup} students use ${bigIdea} to address real challenges in ${location || 'our community'}?`,
        focus: 'Action-oriented, locally relevant'
      });
      
      questions.push({
        text: `Why does ${bigIdea} matter for the future of ${subject}?`,
        focus: 'Forward-thinking, subject-specific'
      });
      
      questions.push({
        text: `What connections exist between ${bigIdea} and ${concepts[0] || 'student experiences'}?`,
        focus: 'Personal relevance, interdisciplinary'
      });
    }
    
    return questions.length > 0 ? questions : [
      { text: 'How might we apply our learning to real-world challenges?', focus: 'Practical application' },
      { text: 'Why does this knowledge matter for our future?', focus: 'Relevance and purpose' },
      { text: 'What new possibilities emerge from this understanding?', focus: 'Innovation and growth' }
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