/**
 * Stage-specific content generator for PBL flow
 * Provides contextual suggestions, help, and examples for each stage
 */

export interface StageSuggestion {
  id: string;
  text: string;
}

interface StageContext {
  subject?: string;
  gradeLevel?: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  projectTopic?: string;
}

/**
 * Generate stage-specific suggestions based on current stage and context
 */
export function getStageSpecificSuggestions(
  stage: string,
  context: StageContext
): StageSuggestion[] {
  switch (stage) {
    case 'GROUNDING':
      return getGroundingSuggestions(context);
    
    case 'BIG_IDEA':
    case 'IDEATION_BIG_IDEA':
      return getBigIdeaSuggestions(context);
    
    case 'ESSENTIAL_QUESTION':
    case 'IDEATION_EQ':
      return getEssentialQuestionSuggestions(context);
    
    case 'CHALLENGE':
    case 'IDEATION_CHALLENGE':
      return getChallengeSuggestions(context);
    
    case 'JOURNEY':
    case 'JOURNEY_ANALYZE':
    case 'JOURNEY_BRAINSTORM':
    case 'JOURNEY_PROTOTYPE':
    case 'JOURNEY_EVALUATE':
      return getJourneySuggestions(stage, context);
    
    case 'DELIVERABLES':
    case 'DELIVER_MILESTONES':
    case 'DELIVER_RUBRIC':
      return getDeliverablesSuggestions(context);
    
    default:
      return getDefaultSuggestions(context);
  }
}

function getGroundingSuggestions(context: StageContext): StageSuggestion[] {
  const { subject, projectTopic } = context;
  const suggestions: StageSuggestion[] = [];

  // Generate context-specific grounding suggestions
  if (projectTopic?.toLowerCase().includes('sustainable') || projectTopic?.toLowerCase().includes('garden')) {
    suggestions.push(
      { id: 'ground-1', text: 'Focus on how environmental systems connect to your local community' },
      { id: 'ground-2', text: 'Consider the role of water conservation in sustainable food production' },
      { id: 'ground-3', text: 'Explore how school gardens can demonstrate ecological principles' }
    );
  } else if (subject?.toLowerCase().includes('science')) {
    suggestions.push(
      { id: 'ground-1', text: 'Connect scientific concepts to real-world applications students see daily' },
      { id: 'ground-2', text: 'Focus on how science helps us solve current challenges' },
      { id: 'ground-3', text: 'Consider how students can use science to make their community better' }
    );
  } else {
    suggestions.push(
      { id: 'ground-1', text: 'Start with issues that matter to your students\' lives and futures' },
      { id: 'ground-2', text: 'Connect academic content to real problems they can help solve' },
      { id: 'ground-3', text: 'Build on what students already know and care about' }
    );
  }

  return suggestions.slice(0, 3);
}

function getBigIdeaSuggestions(context: StageContext): StageSuggestion[] {
  const { subject, gradeLevel, projectTopic } = context;
  const suggestions: StageSuggestion[] = [];

  // Generate contextual suggestions based on subject
  if (subject?.toLowerCase().includes('science') || projectTopic?.toLowerCase().includes('ecosystem')) {
    suggestions.push(
      { id: 'bi-1', text: 'The interconnection between human activity and environmental systems' },
      { id: 'bi-2', text: 'How natural cycles and patterns shape our world' },
      { id: 'bi-3', text: 'The balance between progress and preservation' }
    );
  } else if (subject?.toLowerCase().includes('history') || subject?.toLowerCase().includes('social')) {
    suggestions.push(
      { id: 'bi-1', text: 'How past decisions shape present challenges' },
      { id: 'bi-2', text: 'The power of individual actions in collective change' },
      { id: 'bi-3', text: 'Understanding perspective to build empathy' }
    );
  } else if (subject?.toLowerCase().includes('math')) {
    suggestions.push(
      { id: 'bi-1', text: 'Mathematical patterns that predict real-world outcomes' },
      { id: 'bi-2', text: 'Using data to tell meaningful stories' },
      { id: 'bi-3', text: 'The hidden mathematics in everyday decisions' }
    );
  } else if (subject?.toLowerCase().includes('english') || subject?.toLowerCase().includes('language')) {
    suggestions.push(
      { id: 'bi-1', text: 'Stories connect us to universal human experiences' },
      { id: 'bi-2', text: 'Language shapes how we understand and express our world' },
      { id: 'bi-3', text: 'Effective communication bridges differences and builds understanding' }
    );
  } else {
    // Generic suggestions
    suggestions.push(
      { id: 'bi-1', text: 'The intersection of creativity and problem-solving' },
      { id: 'bi-2', text: 'How innovation emerges from constraints' },
      { id: 'bi-3', text: 'The relationship between individual actions and collective impact' }
    );
  }

  // Ensure we always return exactly 3 suggestions
  return suggestions.slice(0, 3);
}

function getEssentialQuestionSuggestions(context: StageContext): StageSuggestion[] {
  const { bigIdea, subject } = context;
  const suggestions: StageSuggestion[] = [];

  if (bigIdea) {
    // Generate questions based on the big idea
    const bigIdeaShort = bigIdea.length > 50 ? bigIdea.substring(0, 50) + '...' : bigIdea;
    suggestions.push(
      { id: 'eq-1', text: `How does "${bigIdeaShort}" impact our daily lives?` },
      { id: 'eq-2', text: `Why should future generations care about ${bigIdeaShort}?` },
      { id: 'eq-3', text: `What would change if everyone understood ${bigIdeaShort}?` }
    );
  } else if (subject?.toLowerCase().includes('science')) {
    suggestions.push(
      { id: 'eq-1', text: 'How can scientific thinking help us solve community problems?' },
      { id: 'eq-2', text: 'Why do natural patterns repeat across different scales?' },
      { id: 'eq-3', text: 'What happens when human systems conflict with natural ones?' }
    );
  } else if (subject?.toLowerCase().includes('history')) {
    suggestions.push(
      { id: 'eq-1', text: 'How do past decisions create present challenges?' },
      { id: 'eq-2', text: 'Why do certain patterns repeat throughout history?' },
      { id: 'eq-3', text: 'What can historical perspectives teach us about current issues?' }
    );
  } else if (subject?.toLowerCase().includes('math')) {
    suggestions.push(
      { id: 'eq-1', text: 'How can mathematical models predict real-world outcomes?' },
      { id: 'eq-2', text: 'Why do patterns in data reveal hidden truths?' },
      { id: 'eq-3', text: 'What decisions become clearer through mathematical thinking?' }
    );
  } else {
    // Generic essential questions
    suggestions.push(
      { id: 'eq-1', text: 'How can we make a positive impact on our community?' },
      { id: 'eq-2', text: 'Why does this challenge matter for our future?' },
      { id: 'eq-3', text: 'What would success look like for all stakeholders?' }
    );
  }

  return suggestions.slice(0, 3);
}

function getChallengeSuggestions(context: StageContext): StageSuggestion[] {
  const { essentialQuestion, subject, gradeLevel, bigIdea } = context;
  const suggestions: StageSuggestion[] = [];

  // Age-appropriate challenges
  if (gradeLevel?.toLowerCase().includes('elementary') || gradeLevel?.toLowerCase().includes('5')) {
    suggestions.push(
      { id: 'ch-1', text: 'Design a solution to improve our school environment' },
      { id: 'ch-2', text: 'Create a presentation to teach younger students about this topic' },
      { id: 'ch-3', text: 'Build a model that demonstrates your understanding' }
    );
  } else if (gradeLevel?.toLowerCase().includes('middle') || gradeLevel?.toLowerCase().includes('8')) {
    suggestions.push(
      { id: 'ch-1', text: 'Create a campaign to address a community issue' },
      { id: 'ch-2', text: 'Design a prototype that solves a real problem' },
      { id: 'ch-3', text: 'Develop a proposal for improving our school or neighborhood' }
    );
  } else if (gradeLevel?.toLowerCase().includes('high') || gradeLevel?.includes('9') || gradeLevel?.includes('10') || gradeLevel?.includes('11') || gradeLevel?.includes('12')) {
    suggestions.push(
      { id: 'ch-1', text: 'Develop a professional-quality solution for a client' },
      { id: 'ch-2', text: 'Create a business plan for a social enterprise' },
      { id: 'ch-3', text: 'Design and test an innovation that could be implemented' }
    );
  } else if (essentialQuestion) {
    // Base on essential question if available
    suggestions.push(
      { id: 'ch-1', text: `Create a solution that directly addresses: "${essentialQuestion.substring(0, 60)}"` },
      { id: 'ch-2', text: 'Design an interactive experience that teaches others about this issue' },
      { id: 'ch-3', text: 'Build a prototype and test it with real users' }
    );
  } else {
    // Generic challenges
    suggestions.push(
      { id: 'ch-1', text: 'Develop an innovative solution to a real-world problem' },
      { id: 'ch-2', text: 'Create a resource that helps others understand this topic' },
      { id: 'ch-3', text: 'Design a system that creates positive change' }
    );
  }

  return suggestions.slice(0, 3);
}

function getJourneySuggestions(stage: string, context: StageContext): StageSuggestion[] {
  const suggestions: StageSuggestion[] = [];
  const { challenge, essentialQuestion } = context;
  
  if (stage.includes('ANALYZE')) {
    suggestions.push(
      { id: 'j-1', text: 'Research using primary and secondary sources' },
      { id: 'j-2', text: 'Conduct interviews with stakeholders and experts' },
      { id: 'j-3', text: 'Create data visualizations to understand the problem' }
    );
  } else if (stage.includes('BRAINSTORM')) {
    suggestions.push(
      { id: 'j-1', text: 'Use design thinking to generate creative solutions' },
      { id: 'j-2', text: 'Hold collaborative ideation sessions with diverse perspectives' },
      { id: 'j-3', text: 'Apply SCAMPER technique to existing solutions' }
    );
  } else if (stage.includes('PROTOTYPE')) {
    suggestions.push(
      { id: 'j-1', text: 'Build iterative prototypes with feedback loops' },
      { id: 'j-2', text: 'Create low-fidelity mockups for quick testing' },
      { id: 'j-3', text: 'Develop a minimum viable product (MVP)' }
    );
  } else if (stage.includes('EVALUATE')) {
    suggestions.push(
      { id: 'j-1', text: 'Peer review sessions with structured feedback' },
      { id: 'j-2', text: 'Test solutions with target audience' },
      { id: 'j-3', text: 'Measure impact against success criteria' }
    );
  } else {
    // General journey suggestions based on context
    if (challenge) {
      suggestions.push(
        { id: 'j-1', text: 'Research → Ideate → Prototype → Test → Refine' },
        { id: 'j-2', text: 'Weekly milestones with peer feedback sessions' },
        { id: 'j-3', text: 'Expert mentorship at key decision points' }
      );
    } else {
      suggestions.push(
        { id: 'j-1', text: 'Structure: Research → Ideate → Build → Test' },
        { id: 'j-2', text: 'Include reflection checkpoints after each phase' },
        { id: 'j-3', text: 'Build in opportunities for student choice' }
      );
    }
  }

  return suggestions.slice(0, 3);
}

function getDeliverablesSuggestions(context: StageContext): StageSuggestion[] {
  const { challenge, gradeLevel } = context;
  const suggestions: StageSuggestion[] = [];

  if (gradeLevel?.toLowerCase().includes('elementary')) {
    suggestions.push(
      { id: 'd-1', text: 'Visual presentation + hands-on demonstration' },
      { id: 'd-2', text: 'Student portfolio with reflections and artifacts' },
      { id: 'd-3', text: 'Group exhibition with interactive displays' }
    );
  } else if (gradeLevel?.toLowerCase().includes('middle')) {
    suggestions.push(
      { id: 'd-1', text: 'Digital presentation + working prototype' },
      { id: 'd-2', text: 'Video documentary of the process and solution' },
      { id: 'd-3', text: 'Poster session with peer Q&A' }
    );
  } else if (gradeLevel?.toLowerCase().includes('high')) {
    suggestions.push(
      { id: 'd-1', text: 'Professional presentation + functional product' },
      { id: 'd-2', text: 'Research paper + implementation plan' },
      { id: 'd-3', text: 'Public exhibition with community stakeholders' }
    );
  } else {
    // Generic deliverables
    suggestions.push(
      { id: 'd-1', text: 'Presentation + Prototype + Reflection portfolio' },
      { id: 'd-2', text: 'Digital showcase with process documentation' },
      { id: 'd-3', text: 'Multi-media exhibition with peer reviews' }
    );
  }

  return suggestions.slice(0, 3);
}

function getDefaultSuggestions(context: StageContext): StageSuggestion[] {
  return [
    { id: 'default-1', text: 'Explore different approaches to this topic' },
    { id: 'default-2', text: 'Consider multiple perspectives on this challenge' },
    { id: 'default-3', text: 'Think about real-world applications' }
  ];
}

/**
 * Get contextual help content for the current stage
 */
export function getStageHelp(stage: string): { title: string; content: string; tips: string[] } {
  switch (stage) {
    case 'BIG_IDEA':
    case 'IDEATION_BIG_IDEA':
      return {
        title: "What's a Big Idea?",
        content: "A Big Idea is a concept that goes beyond facts to deeper understanding. It connects to real-world relevance and transfers across contexts.",
        tips: [
          "Think about enduring understandings",
          "Focus on concepts, not just topics",
          "Make it relevant to students' lives"
        ]
      };
    
    case 'ESSENTIAL_QUESTION':
    case 'IDEATION_EQ':
      return {
        title: "Crafting Essential Questions",
        content: "Essential Questions are open-ended, thought-provoking, and require investigation. They cannot be answered with a simple yes or no.",
        tips: [
          "Start with 'How' or 'Why'",
          "Make it personally meaningful",
          "Ensure it connects to the Big Idea"
        ]
      };
    
    case 'CHALLENGE':
    case 'IDEATION_CHALLENGE':
      return {
        title: "Creating Authentic Challenges",
        content: "A good challenge is real-world, engaging, and allows for multiple solutions. It should motivate students to take action.",
        tips: [
          "Connect to local community needs",
          "Allow for student voice and choice",
          "Ensure it's achievable but stretching"
        ]
      };
    
    case 'JOURNEY':
      return {
        title: "Planning the Learning Journey",
        content: "The journey guides students through investigating, creating, and refining their solutions through structured phases.",
        tips: [
          "Balance structure with flexibility",
          "Include collaboration opportunities",
          "Build in reflection points"
        ]
      };
    
    case 'DELIVERABLES':
      return {
        title: "Defining Success",
        content: "Deliverables show what students will create and how their learning will be assessed. They should be authentic and meaningful.",
        tips: [
          "Include multiple ways to demonstrate learning",
          "Connect to real-world outcomes",
          "Build in self and peer assessment"
        ]
      };
    
    default:
      return {
        title: "Project-Based Learning",
        content: "PBL engages students in solving real-world problems through extended inquiry.",
        tips: [
          "Start with student interests",
          "Focus on authentic outcomes",
          "Embrace the messy middle"
        ]
      };
  }
}