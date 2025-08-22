/**
 * UDL-Enhanced Suggestion Content
 * 
 * Provides stage-specific suggestions that incorporate UDL principles and 
 * differentiation strategies based on teacher-specified learner needs
 */

import { DifferentiationProfile } from '../features/wizard/components/DifferentiationOptionsStep';

export interface UDLSuggestion {
  id: string;
  text: string;
  category: 'representation' | 'engagement' | 'action_expression' | 'general';
  udlPrinciple: 'representation' | 'engagement' | 'action_expression';
  targetNeeds: string[]; // Which differentiation needs this addresses
  implementation: string[]; // Concrete implementation steps
  examples: string[]; // Specific examples
  adaptations: string[]; // Possible adaptations
}

export interface UDLSuggestionGroup {
  title: string;
  description: string;
  suggestions: UDLSuggestion[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generate UDL-enhanced suggestions based on differentiation profile
 */
export function generateUDLSuggestions(
  stage: string, 
  profile: DifferentiationProfile,
  context?: any
): UDLSuggestionGroup[] {
  const suggestionGroups: UDLSuggestionGroup[] = [];

  // Multiple Means of Representation suggestions
  if (hasRepresentationNeeds(profile)) {
    suggestionGroups.push(generateRepresentationSuggestions(stage, profile));
  }

  // Multiple Means of Engagement suggestions
  if (hasEngagementNeeds(profile)) {
    suggestionGroups.push(generateEngagementSuggestions(stage, profile));
  }

  // Multiple Means of Action/Expression suggestions
  if (hasActionExpressionNeeds(profile)) {
    suggestionGroups.push(generateActionExpressionSuggestions(stage, profile));
  }

  // Learner-specific suggestions
  if (hasSpecificLearnerNeeds(profile)) {
    suggestionGroups.push(generateLearnerSpecificSuggestions(stage, profile));
  }

  return suggestionGroups;
}

function hasRepresentationNeeds(profile: DifferentiationProfile): boolean {
  return Object.values(profile.representation).some(Boolean);
}

function hasEngagementNeeds(profile: DifferentiationProfile): boolean {
  return Object.values(profile.engagement).some(Boolean);
}

function hasActionExpressionNeeds(profile: DifferentiationProfile): boolean {
  return Object.values(profile.actionExpression).some(Boolean);
}

function hasSpecificLearnerNeeds(profile: DifferentiationProfile): boolean {
  return Object.values(profile.learnerConsiderations).some(Boolean);
}

/**
 * Multiple Means of Representation Suggestions
 */
function generateRepresentationSuggestions(
  stage: string, 
  profile: DifferentiationProfile
): UDLSuggestionGroup {
  const suggestions: UDLSuggestion[] = [];

  // Visual supports
  if (profile.representation.visualSupports) {
    suggestions.push(...getVisualSupportSuggestions(stage));
  }

  // Auditory supports
  if (profile.representation.auditorySupports) {
    suggestions.push(...getAuditorySupportSuggestions(stage));
  }

  // Tactile supports
  if (profile.representation.tactileSupports) {
    suggestions.push(...getTactileSupportSuggestions(stage));
  }

  // Multilingual supports
  if (profile.representation.multilingualSupports) {
    suggestions.push(...getMultilingualSupportSuggestions(stage));
  }

  // Reading level variations
  if (profile.representation.readingLevelVariations) {
    suggestions.push(...getReadingLevelSuggestions(stage));
  }

  // Symbols and graphics
  if (profile.representation.symbolsAndGraphics) {
    suggestions.push(...getSymbolsSuggestions(stage));
  }

  return {
    title: "Multiple Ways to Access Information",
    description: "Ensure all learners can perceive and comprehend content",
    suggestions,
    priority: 'high'
  };
}

/**
 * Multiple Means of Engagement Suggestions
 */
function generateEngagementSuggestions(
  stage: string, 
  profile: DifferentiationProfile
): UDLSuggestionGroup {
  const suggestions: UDLSuggestion[] = [];

  // Interest-based choices
  if (profile.engagement.interestBasedChoices) {
    suggestions.push(...getInterestChoiceSuggestions(stage));
  }

  // Cultural connections
  if (profile.engagement.culturalConnections) {
    suggestions.push(...getCulturalConnectionSuggestions(stage));
  }

  // Real-world relevance
  if (profile.engagement.relevanceToLife) {
    suggestions.push(...getRelevanceSuggestions(stage));
  }

  // Collaborative options
  if (profile.engagement.collaborativeOptions) {
    suggestions.push(...getCollaborationSuggestions(stage));
  }

  // Self-directed learning
  if (profile.engagement.selfDirectedLearning) {
    suggestions.push(...getSelfDirectedSuggestions(stage));
  }

  // Gamification elements
  if (profile.engagement.gamificationElements) {
    suggestions.push(...getGamificationSuggestions(stage));
  }

  return {
    title: "Multiple Ways to Motivate and Engage",
    description: "Tap into learners' interests and provide appropriate challenges",
    suggestions,
    priority: 'high'
  };
}

/**
 * Multiple Means of Action/Expression Suggestions
 */
function generateActionExpressionSuggestions(
  stage: string, 
  profile: DifferentiationProfile
): UDLSuggestionGroup {
  const suggestions: UDLSuggestion[] = [];

  // Alternative formats
  if (profile.actionExpression.alternativeFormats) {
    suggestions.push(...getAlternativeFormatSuggestions(stage));
  }

  // Assistive technology
  if (profile.actionExpression.assistiveTechnology) {
    suggestions.push(...getAssistiveTechSuggestions(stage));
  }

  // Flexible pacing
  if (profile.actionExpression.flexiblePacing) {
    suggestions.push(...getFlexiblePacingSuggestions(stage));
  }

  // Multiple product options
  if (profile.actionExpression.multipleProductOptions) {
    suggestions.push(...getProductOptionSuggestions(stage));
  }

  // Scaffolded support
  if (profile.actionExpression.scaffoldedSupport) {
    suggestions.push(...getScaffoldingSuggestions(stage));
  }

  // Peer collaboration
  if (profile.actionExpression.peerCollaboration) {
    suggestions.push(...getPeerCollaborationSuggestions(stage));
  }

  return {
    title: "Multiple Ways to Show Learning",
    description: "Provide options for students to express what they know",
    suggestions,
    priority: 'high'
  };
}

/**
 * Learner-Specific Suggestions
 */
function generateLearnerSpecificSuggestions(
  stage: string, 
  profile: DifferentiationProfile
): UDLSuggestionGroup {
  const suggestions: UDLSuggestion[] = [];

  // English Language Learners
  if (profile.learnerConsiderations.englishLanguageLearners) {
    suggestions.push(...getELLSuggestions(stage));
  }

  // Students with disabilities
  if (profile.learnerConsiderations.studentsWithDisabilities) {
    suggestions.push(...getDisabilitySuggestions(stage));
  }

  // Gifted learners
  if (profile.learnerConsiderations.giftedLearners) {
    suggestions.push(...getGiftedSuggestions(stage));
  }

  // Executive function support
  if (profile.learnerConsiderations.executiveFunctionSupport) {
    suggestions.push(...getExecutiveFunctionSuggestions(stage));
  }

  // Social-emotional needs
  if (profile.learnerConsiderations.socialEmotionalNeeds) {
    suggestions.push(...getSocialEmotionalSuggestions(stage));
  }

  // Sensory considerations
  if (profile.learnerConsiderations.sensoryConsiderations) {
    suggestions.push(...getSensorySuggestions(stage));
  }

  return {
    title: "Specific Learner Population Supports",
    description: "Targeted strategies for diverse learner needs",
    suggestions,
    priority: 'medium'
  };
}

// Visual Support Suggestions by Stage
function getVisualSupportSuggestions(stage: string): UDLSuggestion[] {
  const baseVisualSuggestions: UDLSuggestion[] = [
    {
      id: 'visual-concepts',
      text: 'Create visual concept maps to show relationships between ideas',
      category: 'representation',
      udlPrinciple: 'representation',
      targetNeeds: ['visualSupports'],
      implementation: [
        'Use graphic organizers for brainstorming',
        'Create mind maps for complex concepts',
        'Provide visual templates for organizing thoughts'
      ],
      examples: [
        'Concept mapping software like Lucidchart',
        'Hand-drawn graphic organizers', 
        'Digital mind mapping tools'
      ],
      adaptations: [
        'Add color coding for different concept types',
        'Use symbols alongside text',
        'Provide both digital and paper options'
      ]
    },
    {
      id: 'visual-process',
      text: 'Use visual process charts to break down complex tasks',
      category: 'representation',
      udlPrinciple: 'representation',
      targetNeeds: ['visualSupports'],
      implementation: [
        'Create step-by-step visual guides',
        'Use flowcharts for decision-making processes',
        'Provide visual checklists for task completion'
      ],
      examples: [
        'Illustrated step-by-step guides',
        'Process flowcharts with icons',
        'Visual project timelines'
      ],
      adaptations: [
        'Add estimated time for each step',
        'Include checkpoint indicators',
        'Provide both overview and detailed versions'
      ]
    }
  ];

  // Stage-specific visual suggestions
  switch (stage.toUpperCase()) {
    case 'BIG_IDEA':
      return [
        ...baseVisualSuggestions,
        {
          id: 'visual-bigidea-map',
          text: 'Use visual thinking maps to explore big idea connections',
          category: 'representation',
          udlPrinciple: 'representation',
          targetNeeds: ['visualSupports'],
          implementation: [
            'Create idea webs showing connections',
            'Use visual metaphors to explain concepts',
            'Provide image galleries for inspiration'
          ],
          examples: [
            'Systems thinking diagrams',
            'Visual metaphor collections',
            'Infographic examples of big ideas'
          ],
          adaptations: [
            'Use student-created visual representations',
            'Include culturally relevant images',
            'Provide multiple visual styles'
          ]
        }
      ];

    case 'ESSENTIAL_QUESTION':
      return [
        ...baseVisualSuggestions,
        {
          id: 'visual-question-gallery',
          text: 'Create a visual question gallery to inspire thinking',
          category: 'representation',
          udlPrinciple: 'representation',
          targetNeeds: ['visualSupports'],
          implementation: [
            'Display question stems with visual cues',
            'Use questioning frameworks as visual guides',
            'Provide visual examples of good questions'
          ],
          examples: [
            'Question word clouds',
            'Visual questioning frameworks',
            'Gallery walks of inspiring questions'
          ],
          adaptations: [
            'Use student languages for question stems',
            'Include gesture cues for question types',
            'Provide digital and physical versions'
          ]
        }
      ];

    case 'CHALLENGE':
      return [
        ...baseVisualSuggestions,
        {
          id: 'visual-challenge-analysis',
          text: 'Use visual problem analysis tools',
          category: 'representation',
          udlPrinciple: 'representation',
          targetNeeds: ['visualSupports'],
          implementation: [
            'Create problem trees showing causes and effects',
            'Use stakeholder maps to visualize impact',
            'Provide visual templates for challenge definition'
          ],
          examples: [
            'Problem analysis diagrams',
            'Stakeholder visualization tools',
            'Challenge statement templates'
          ],
          adaptations: [
            'Include photo documentation of problems',
            'Use community-specific imagery',
            'Provide multiple complexity levels'
          ]
        }
      ];

    case 'JOURNEY':
      return [
        ...baseVisualSuggestions,
        {
          id: 'visual-journey-map',
          text: 'Create visual journey maps for project progression',
          category: 'representation',
          udlPrinciple: 'representation',
          targetNeeds: ['visualSupports'],
          implementation: [
            'Use visual project timelines',
            'Create milestone celebration graphics',
            'Provide visual progress tracking tools'
          ],
          examples: [
            'Project roadmap visualizations',
            'Progress bar graphics',
            'Milestone achievement badges'
          ],
          adaptations: [
            'Include reflection checkpoints',
            'Use student-chosen visual themes',
            'Provide both individual and group versions'
          ]
        }
      ];

    case 'DELIVERABLES':
      return [
        ...baseVisualSuggestions,
        {
          id: 'visual-showcase-options',
          text: 'Provide visual showcase format options',
          category: 'representation',
          udlPrinciple: 'representation',
          targetNeeds: ['visualSupports'],
          implementation: [
            'Create visual rubrics with examples',
            'Provide format choice galleries',
            'Use visual assessment tools'
          ],
          examples: [
            'Visual rubric with image examples',
            'Showcase format galleries',
            'Assessment visual aids'
          ],
          adaptations: [
            'Include student work examples',
            'Provide multiple quality levels',
            'Use culturally responsive examples'
          ]
        }
      ];

    default:
      return baseVisualSuggestions;
  }
}

// Auditory Support Suggestions by Stage
function getAuditorySupportSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'audio-instructions',
      text: 'Provide audio recordings of instructions and key concepts',
      category: 'representation',
      udlPrinciple: 'representation',
      targetNeeds: ['auditorySupports'],
      implementation: [
        'Record instruction videos with clear audio',
        'Use text-to-speech for written materials',
        'Provide podcast-style content summaries'
      ],
      examples: [
        'Instructional audio recordings',
        'Text-to-speech software',
        'Student-created audio summaries'
      ],
      adaptations: [
        'Include multiple language options',
        'Provide variable playback speeds',
        'Add background music options for focus'
      ]
    },
    {
      id: 'audio-discussion',
      text: 'Include regular discussion and verbal processing time',
      category: 'engagement',
      udlPrinciple: 'engagement',
      targetNeeds: ['auditorySupports'],
      implementation: [
        'Build in think-pair-share activities',
        'Use verbal reflection prompts',
        'Include audio journaling options'
      ],
      examples: [
        'Partner discussion protocols',
        'Voice memo reflections',
        'Classroom discussion circles'
      ],
      adaptations: [
        'Provide sentence stems for discussions',
        'Include non-verbal participation options',
        'Use small group discussions for comfort'
      ]
    }
  ];
}

// Tactile Support Suggestions by Stage
function getTactileSupportSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'hands-on-exploration',
      text: 'Incorporate hands-on exploration and building activities',
      category: 'representation',
      udlPrinciple: 'representation',
      targetNeeds: ['tactileSupports'],
      implementation: [
        'Use manipulatives for concept exploration',
        'Include building and making activities',
        'Provide fidget tools for focus'
      ],
      examples: [
        'Concept building with blocks or clay',
        'Prototype construction materials',
        'Fidget tools and stress balls'
      ],
      adaptations: [
        'Provide various texture options',
        'Include both individual and shared materials',
        'Offer digital alternatives for remote learning'
      ]
    },
    {
      id: 'movement-breaks',
      text: 'Build in movement and kinesthetic learning opportunities',
      category: 'engagement',
      udlPrinciple: 'engagement',
      targetNeeds: ['tactileSupports'],
      implementation: [
        'Include movement breaks in lessons',
        'Use gesture-based learning activities',
        'Provide standing or alternative seating options'
      ],
      examples: [
        'Concept-based movement activities',
        'Walking discussions',
        'Interactive gallery walks'
      ],
      adaptations: [
        'Adapt movements for different abilities',
        'Provide quiet movement options',
        'Include both group and individual movement'
      ]
    }
  ];
}

// Interest Choice Suggestions by Stage
function getInterestChoiceSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'choice-menus',
      text: 'Create choice menus based on student interests and learning styles',
      category: 'engagement',
      udlPrinciple: 'engagement',
      targetNeeds: ['interestBasedChoices'],
      implementation: [
        'Survey students for interests regularly',
        'Provide topic choice within learning objectives',
        'Create learning style-based activity options'
      ],
      examples: [
        'Interest inventory surveys',
        'Topic choice boards',
        'Multiple intelligence activity menus'
      ],
      adaptations: [
        'Update choices based on emerging interests',
        'Include culturally relevant options',
        'Provide complexity level choices'
      ]
    }
  ];
}

// Cultural Connection Suggestions
function getCulturalConnectionSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'cultural-connections',
      text: 'Connect learning to students\' cultural backgrounds and experiences',
      category: 'engagement',
      udlPrinciple: 'engagement',
      targetNeeds: ['culturalConnections'],
      implementation: [
        'Include examples from diverse cultures',
        'Invite family and community experts',
        'Use culturally relevant scenarios and contexts'
      ],
      examples: [
        'Multicultural case studies',
        'Family knowledge sharing sessions',
        'Community expert guest speakers'
      ],
      adaptations: [
        'Research students\' cultural backgrounds respectfully',
        'Provide options for cultural sharing comfort levels',
        'Include global perspectives on local issues'
      ]
    }
  ];
}

// Multilingual Support Suggestions
function getMultilingualSupportSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'multilingual-resources',
      text: 'Provide materials and supports in multiple languages',
      category: 'representation',
      udlPrinciple: 'representation',
      targetNeeds: ['multilingualSupports'],
      implementation: [
        'Translate key vocabulary and concepts',
        'Use visual vocabulary supports',
        'Encourage native language use for thinking'
      ],
      examples: [
        'Bilingual vocabulary cards',
        'Visual dictionaries',
        'Translation tools and apps'
      ],
      adaptations: [
        'Partner students who share languages',
        'Use community translation resources',
        'Provide audio in multiple languages'
      ]
    }
  ];
}

// Alternative Format Suggestions
function getAlternativeFormatSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'format-choices',
      text: 'Offer multiple ways to demonstrate understanding',
      category: 'action_expression',
      udlPrinciple: 'action_expression',
      targetNeeds: ['alternativeFormats'],
      implementation: [
        'Provide video, audio, visual, and written options',
        'Include performance and demonstration choices',
        'Allow for creative expression formats'
      ],
      examples: [
        'Video presentations',
        'Infographic creations',
        'Interactive demonstrations',
        'Written reports',
        'Artistic expressions'
      ],
      adaptations: [
        'Match formats to content appropriately',
        'Provide guidance for less familiar formats',
        'Include collaborative format options'
      ]
    }
  ];
}

// Scaffolding Suggestions
function getScaffoldingSuggestions(stage: string): UDLSuggestion[] {
  return [
    {
      id: 'scaffolded-supports',
      text: 'Provide step-by-step scaffolding that can be gradually removed',
      category: 'action_expression',
      udlPrinciple: 'action_expression',
      targetNeeds: ['scaffoldedSupport'],
      implementation: [
        'Use graphic organizers and templates',
        'Provide process checklists',
        'Include example models and rubrics'
      ],
      examples: [
        'Project planning templates',
        'Research graphic organizers',
        'Presentation structure guides'
      ],
      adaptations: [
        'Vary scaffolding levels by student need',
        'Plan for gradual release of supports',
        'Include peer scaffolding opportunities'
      ]
    }
  ];
}

// Additional helper functions for other suggestion types...
function getReadingLevelSuggestions(stage: string): UDLSuggestion[] { return []; }
function getSymbolsSuggestions(stage: string): UDLSuggestion[] { return []; }
function getRelevanceSuggestions(stage: string): UDLSuggestion[] { return []; }
function getCollaborationSuggestions(stage: string): UDLSuggestion[] { return []; }
function getSelfDirectedSuggestions(stage: string): UDLSuggestion[] { return []; }
function getGamificationSuggestions(stage: string): UDLSuggestion[] { return []; }
function getAssistiveTechSuggestions(stage: string): UDLSuggestion[] { return []; }
function getFlexiblePacingSuggestions(stage: string): UDLSuggestion[] { return []; }
function getProductOptionSuggestions(stage: string): UDLSuggestion[] { return []; }
function getPeerCollaborationSuggestions(stage: string): UDLSuggestion[] { return []; }
function getELLSuggestions(stage: string): UDLSuggestion[] { return []; }
function getDisabilitySuggestions(stage: string): UDLSuggestion[] { return []; }
function getGiftedSuggestions(stage: string): UDLSuggestion[] { return []; }
function getExecutiveFunctionSuggestions(stage: string): UDLSuggestion[] { return []; }
function getSocialEmotionalSuggestions(stage: string): UDLSuggestion[] { return []; }
function getSensorySuggestions(stage: string): UDLSuggestion[] { return []; }

/**
 * Generate assessment accommodations for the Deliverables stage
 */
export function generateAssessmentAccommodations(
  profile: DifferentiationProfile
): UDLSuggestion[] {
  const accommodations: UDLSuggestion[] = [];

  // Timing accommodations
  if (profile.actionExpression.flexiblePacing) {
    accommodations.push({
      id: 'timing-accommodations',
      text: 'Provide flexible timing and multiple submission opportunities',
      category: 'action_expression',
      udlPrinciple: 'action_expression',
      targetNeeds: ['flexiblePacing'],
      implementation: [
        'Allow extended time for assessments',
        'Provide multiple checkpoint submissions',
        'Use flexible deadlines with scaffolded milestones'
      ],
      examples: [
        'Time-and-a-half for testing',
        'Weekly progress check-ins',
        'Staggered due dates for project components'
      ],
      adaptations: [
        'Adjust timing based on individual needs',
        'Provide time management tools',
        'Include self-paced options where appropriate'
      ]
    });
  }

  // Format accommodations
  if (profile.actionExpression.alternativeFormats) {
    accommodations.push({
      id: 'format-accommodations',
      text: 'Offer multiple assessment format options',
      category: 'action_expression',
      udlPrinciple: 'action_expression',
      targetNeeds: ['alternativeFormats'],
      implementation: [
        'Provide oral, written, visual, and performance options',
        'Allow students to choose their strongest format',
        'Include multimedia and digital creation options'
      ],
      examples: [
        'Oral presentations vs. written reports',
        'Infographic creation vs. essay writing',
        'Video documentation vs. traditional portfolios'
      ],
      adaptations: [
        'Ensure format matches content objectives',
        'Provide training for less familiar formats',
        'Include collaborative assessment options'
      ]
    });
  }

  return accommodations;
}

/**
 * Get prioritized suggestions based on profile completeness
 */
export function getPrioritizedSuggestions(
  stage: string,
  profile: DifferentiationProfile,
  maxSuggestions: number = 6
): UDLSuggestion[] {
  const allGroups = generateUDLSuggestions(stage, profile);
  
  // Flatten and prioritize
  const allSuggestions = allGroups
    .sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    })
    .flatMap(group => group.suggestions);

  return allSuggestions.slice(0, maxSuggestions);
}

export default {
  generateUDLSuggestions,
  generateAssessmentAccommodations,
  getPrioritizedSuggestions
};