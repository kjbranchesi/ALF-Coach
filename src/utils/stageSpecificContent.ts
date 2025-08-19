/**
 * Stage-specific content generator for PBL flow
 * Provides contextual suggestions, help, and examples for each stage
 */

export interface StageSuggestion {
  id: string;
  text: string;
  category: 'idea' | 'whatif' | 'resource';
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

function getBigIdeaSuggestions(context: StageContext): StageSuggestion[] {
  const { subject, projectTopic } = context;
  const suggestions: StageSuggestion[] = [];

  // Ideas based on subject/topic
  if (subject?.toLowerCase().includes('science') || projectTopic?.toLowerCase().includes('ecosystem')) {
    suggestions.push(
      {
        id: 'bi-1',
        text: 'Interdependence shapes all living systems',
        category: 'idea'
      },
      {
        id: 'bi-2',
        text: 'What if we viewed our classroom as an ecosystem?',
        category: 'whatif'
      }
    );
  } else if (subject?.toLowerCase().includes('history') || subject?.toLowerCase().includes('social')) {
    suggestions.push(
      {
        id: 'bi-1',
        text: 'Past events shape present realities',
        category: 'idea'
      },
      {
        id: 'bi-2',
        text: 'What if history was told from different perspectives?',
        category: 'whatif'
      }
    );
  } else if (subject?.toLowerCase().includes('math')) {
    suggestions.push(
      {
        id: 'bi-1',
        text: 'Patterns and relationships govern mathematical thinking',
        category: 'idea'
      },
      {
        id: 'bi-2',
        text: 'What if math was everywhere in nature?',
        category: 'whatif'
      }
    );
  } else if (subject?.toLowerCase().includes('english') || subject?.toLowerCase().includes('language')) {
    suggestions.push(
      {
        id: 'bi-1',
        text: 'Stories connect us to universal human experiences',
        category: 'idea'
      },
      {
        id: 'bi-2',
        text: 'What if every story had multiple endings?',
        category: 'whatif'
      }
    );
  } else {
    // Generic suggestions
    suggestions.push(
      {
        id: 'bi-1',
        text: 'Complex problems require creative solutions',
        category: 'idea'
      },
      {
        id: 'bi-2',
        text: 'What if students designed their own learning paths?',
        category: 'whatif'
      }
    );
  }

  // Always add a resource
  suggestions.push({
    id: 'bi-resource',
    text: 'Examples of Big Ideas from successful PBL projects',
    category: 'resource'
  });

  return suggestions;
}

function getEssentialQuestionSuggestions(context: StageContext): StageSuggestion[] {
  const { bigIdea, subject } = context;
  const suggestions: StageSuggestion[] = [];

  if (bigIdea) {
    // Generate questions based on the big idea
    suggestions.push(
      {
        id: 'eq-1',
        text: `How does "${bigIdea.substring(0, 50)}..." impact our daily lives?`,
        category: 'idea'
      },
      {
        id: 'eq-2',
        text: `What if we could redesign systems based on this understanding?`,
        category: 'whatif'
      }
    );
  } else {
    // Generic essential questions
    suggestions.push(
      {
        id: 'eq-1',
        text: 'How can we make a positive impact on our community?',
        category: 'idea'
      },
      {
        id: 'eq-2',
        text: 'What if students could solve real-world problems?',
        category: 'whatif'
      }
    );
  }

  suggestions.push({
    id: 'eq-resource',
    text: 'Guide to crafting powerful Essential Questions',
    category: 'resource'
  });

  return suggestions;
}

function getChallengeSuggestions(context: StageContext): StageSuggestion[] {
  const { essentialQuestion, subject, gradeLevel } = context;
  const suggestions: StageSuggestion[] = [];

  // Age-appropriate challenges
  if (gradeLevel?.toLowerCase().includes('elementary') || gradeLevel?.toLowerCase().includes('5')) {
    suggestions.push(
      {
        id: 'ch-1',
        text: 'Design a solution to improve our school environment',
        category: 'idea'
      },
      {
        id: 'ch-2',
        text: 'What if students became the teachers for a day?',
        category: 'whatif'
      }
    );
  } else if (gradeLevel?.toLowerCase().includes('middle') || gradeLevel?.toLowerCase().includes('8')) {
    suggestions.push(
      {
        id: 'ch-1',
        text: 'Create a campaign to address a community issue',
        category: 'idea'
      },
      {
        id: 'ch-2',
        text: 'What if we could redesign our learning spaces?',
        category: 'whatif'
      }
    );
  } else {
    suggestions.push(
      {
        id: 'ch-1',
        text: 'Develop an innovative solution to a real-world problem',
        category: 'idea'
      },
      {
        id: 'ch-2',
        text: 'What if students partnered with local organizations?',
        category: 'whatif'
      }
    );
  }

  suggestions.push({
    id: 'ch-resource',
    text: 'Examples of authentic challenges by grade level',
    category: 'resource'
  });

  return suggestions;
}

function getJourneySuggestions(stage: string, context: StageContext): StageSuggestion[] {
  const suggestions: StageSuggestion[] = [];
  
  if (stage.includes('ANALYZE')) {
    suggestions.push(
      {
        id: 'j-1',
        text: 'Research using primary and secondary sources',
        category: 'idea'
      },
      {
        id: 'j-2',
        text: 'What if students conducted field investigations?',
        category: 'whatif'
      }
    );
  } else if (stage.includes('BRAINSTORM')) {
    suggestions.push(
      {
        id: 'j-1',
        text: 'Use design thinking to generate creative solutions',
        category: 'idea'
      },
      {
        id: 'j-2',
        text: 'What if we used improv games to spark creativity?',
        category: 'whatif'
      }
    );
  } else if (stage.includes('PROTOTYPE')) {
    suggestions.push(
      {
        id: 'j-1',
        text: 'Build iterative prototypes with feedback loops',
        category: 'idea'
      },
      {
        id: 'j-2',
        text: 'What if prototypes were tested by the community?',
        category: 'whatif'
      }
    );
  } else if (stage.includes('EVALUATE')) {
    suggestions.push(
      {
        id: 'j-1',
        text: 'Peer review sessions with structured feedback',
        category: 'idea'
      },
      {
        id: 'j-2',
        text: 'What if evaluation included real-world experts?',
        category: 'whatif'
      }
    );
  } else {
    // General journey suggestions
    suggestions.push(
      {
        id: 'j-1',
        text: 'Structure: Research → Ideate → Build → Test',
        category: 'idea'
      },
      {
        id: 'j-2',
        text: 'What if the journey adapted to student interests?',
        category: 'whatif'
      }
    );
  }

  suggestions.push({
    id: 'j-resource',
    text: 'Activity templates for each journey phase',
    category: 'resource'
  });

  return suggestions;
}

function getDeliverablesSuggestions(context: StageContext): StageSuggestion[] {
  return [
    {
      id: 'd-1',
      text: 'Presentation + Prototype + Reflection portfolio',
      category: 'idea'
    },
    {
      id: 'd-2',
      text: 'What if deliverables were presented to authentic audiences?',
      category: 'whatif'
    },
    {
      id: 'd-resource',
      text: 'Rubric templates for PBL assessment',
      category: 'resource'
    }
  ];
}

function getDefaultSuggestions(context: StageContext): StageSuggestion[] {
  return [
    {
      id: 'default-1',
      text: 'Explore different approaches to this topic',
      category: 'idea'
    },
    {
      id: 'default-2',
      text: 'What if we approached this differently?',
      category: 'whatif'
    },
    {
      id: 'default-resource',
      text: 'Browse PBL resources and examples',
      category: 'resource'
    }
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