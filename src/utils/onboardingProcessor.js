// onboardingProcessor.js - Transform onboarding data for AI consumption

export const processOnboardingData = (rawData) => {
  // Extract and clean the educator's perspective/ideas
  const processEducatorInput = (input) => {
    if (!input) return '';
    
    // Remove suggestion prefixes if accidentally included
    const cleanedInput = input
      .replace(/^[💡🌍🤝🔍✨❓📋]\s*/g, '') // Remove emoji prefixes
      .replace(/^(How about|What if|Consider|Let me)\s+/i, '') // Remove suggestion starters
      .trim();
    
    return cleanedInput;
  };

  // Parse the subject to extract key themes
  const extractSubjectThemes = (subject) => {
    const themes = {
      'urban planning': ['city design', 'community spaces', 'infrastructure', 'sustainability'],
      'environmental science': ['ecosystems', 'climate', 'conservation', 'sustainability'],
      'history': ['culture', 'change over time', 'cause and effect', 'perspectives'],
      'computer science': ['innovation', 'problem-solving', 'digital creation', 'systems'],
      'art': ['expression', 'culture', 'design', 'communication'],
      'literature': ['storytelling', 'perspectives', 'human experience', 'communication']
    };
    
    const subjectLower = subject.toLowerCase();
    for (const [key, values] of Object.entries(themes)) {
      if (subjectLower.includes(key)) {
        return values;
      }
    }
    return ['exploration', 'discovery', 'innovation', 'real-world application'];
  };

  // Generate initial context for AI
  const generateAIContext = (data) => {
    const themes = extractSubjectThemes(data.subject);
    const educatorIdeas = processEducatorInput(data.educatorPerspective);
    
    return {
      subject: data.subject,
      ageGroup: data.ageGroup,
      projectScope: data.projectScope,
      location: data.location || 'your community',
      
      // Processed insights
      educatorVision: educatorIdeas || `exploring ${data.subject} through authentic learning`,
      suggestedThemes: themes,
      
      // Context clues for AI
      isUrbanFocus: data.subject.toLowerCase().includes('urban') || 
                    educatorIdeas.toLowerCase().includes('city') ||
                    educatorIdeas.toLowerCase().includes('community'),
      
      isSustainabilityFocus: educatorIdeas.toLowerCase().includes('sustainab') ||
                             educatorIdeas.toLowerCase().includes('environment') ||
                             educatorIdeas.toLowerCase().includes('future'),
      
      isTechFocus: data.subject.toLowerCase().includes('tech') ||
                   data.subject.toLowerCase().includes('computer') ||
                   educatorIdeas.toLowerCase().includes('digital'),
      
      // Materials context
      hasMaterials: !!data.initialMaterials,
      materialsContext: data.initialMaterials ? 
        `The educator has these resources: ${data.initialMaterials}` : 
        'Starting fresh without predetermined materials'
    };
  };

  // Generate smart Big Idea suggestions based on context
  const generateBigIdeaSuggestions = (context) => {
    const suggestions = [];
    
    if (context.isUrbanFocus) {
      suggestions.push(
        "Cities as Living Systems",
        "Community-Centered Design",
        "The Future of Urban Spaces"
      );
    } else if (context.isSustainabilityFocus) {
      suggestions.push(
        "Sustainable Innovation",
        "Systems Thinking for the Future",
        "Local Solutions, Global Impact"
      );
    } else if (context.isTechFocus) {
      suggestions.push(
        "Technology as a Tool for Change",
        "Digital Innovation and Society",
        "Coding for Community Impact"
      );
    } else {
      // Generic but powerful suggestions
      suggestions.push(
        `${context.subject} in Our Community`,
        `Real-World ${context.subject}`,
        `${context.subject} for Social Good`
      );
    }
    
    return suggestions;
  };

  // Main processing
  const processedData = {
    ...rawData,
    processed: {
      context: generateAIContext(rawData),
      bigIdeaSuggestions: generateBigIdeaSuggestions(generateAIContext(rawData)),
      cleanedPerspective: processEducatorInput(rawData.educatorPerspective),
      
      // Instructions for AI
      aiGuidance: {
        tone: 'warm and encouraging',
        approach: 'coaching companion, not interrogator',
        avoid: [
          'accepting empty inputs',
          'treating UI elements as user input',
          'being overly formal'
        ],
        emphasize: [
          'real-world connections',
          'student engagement',
          'authentic learning',
          'community impact'
        ]
      }
    }
  };

  return processedData;
};

// Validate if a response is actually from a suggestion button
export const isSuggestionClick = (input) => {
  const suggestionPatterns = [
    /^💡/,
    /^🌍/,
    /^🤝/,
    /^🔍/,
    /^✨/,
    /^❓/,
    /^📋/,
    /^✏️/,
    /^▶️/,
    /^How about exploring/i,
    /^What if we focused/i,
    /^Consider:/i,
    /^Let me (see|suggest)/i,
    /^See (more )?examples/i,
    /^Get Ideas$/i,
    /^Help$/i
  ];

  return suggestionPatterns.some(pattern => pattern.test(input.trim()));
};

// Extract the actual user intent from a suggestion click
export const processSuggestionClick = (input) => {
  // Map suggestion text to actual commands
  const commandMap = {
    'Get Ideas': 'get-ideas',
    'See Examples': 'see-examples',
    'Help': 'help',
    '💡 Get Ideas': 'get-ideas',
    '📋 See Examples': 'see-examples',
    '❓ Why does this matter?': 'explain-importance',
    '✏️ Let me try again': 'retry',
    '✨ Let me suggest more': 'more-suggestions',
    '💭 Show me what would change': 'show-changes',
    '✅ Yes, update everything to match': 'accept-changes',
    '➡️ Keep my original and continue': 'keep-original'
  };

  // Check for exact matches first
  for (const [key, value] of Object.entries(commandMap)) {
    if (input.includes(key)) {
      return { type: 'command', command: value };
    }
  }

  // Check if it's a simple direct suggestion (no quotes, no prefix)
  // Examples: "The Future of Urban Spaces", "Cities as Living Systems"
  const directSuggestions = [
    "The Future of Urban Spaces",
    "Cities as Living Systems", 
    "Community-Centered Design",
    "Sustainable Innovation",
    "Systems Thinking for the Future",
    "Local Solutions, Global Impact",
    "Technology as a Tool for Change",
    "Digital Innovation and Society",
    "Coding for Community Impact",
    "Innovation in Our Community"
  ];
  
  // Check if the entire input matches a known direct suggestion
  const trimmedInput = input.trim();
  if (directSuggestions.some(suggestion => trimmedInput === suggestion || trimmedInput.includes(suggestion))) {
    // Extract just the core suggestion text
    for (const suggestion of directSuggestions) {
      if (trimmedInput.includes(suggestion)) {
        return { type: 'suggestion-selected', value: suggestion };
      }
    }
  }

  // Check if it's a suggestion with quotes
  if (input.includes('How about exploring') || 
      input.includes('What if we focused on') ||
      input.includes('What if we asked') ||
      input.includes('Consider')) {
    // Try multiple quote patterns
    const patterns = [
      /["']([^"']+)["']/,  // Single or double quotes
      /['']([^'']+)['']/,  // Smart quotes  
      /exploring\s+['"]?([^'"?.!]+)['"]?/i,  // After "exploring"
      /focused on\s+['"]?([^'"?.!]+)['"]?/i,  // After "focused on"
      /asked:\s+["']([^"']+)["']/i,  // After "asked:"
      /Consider:\s+["']([^"']+)["']/i,  // After "Consider:"
      /Consider\s+['"]?([^'"?.!]+)['"]?/i  // After "Consider"
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return { type: 'suggestion-selected', value: match[1].trim() };
      }
    }
  }

  // Check for other action suggestions (challenges, etc)
  const actionPatterns = [
    { pattern: /Create a (.+)$/, type: 'suggestion-selected' },
    { pattern: /Design a (.+)$/, type: 'suggestion-selected' },
    { pattern: /Develop a (.+)$/, type: 'suggestion-selected' },
    { pattern: /Produce an? (.+)$/, type: 'suggestion-selected' }
  ];

  for (const { pattern, type } of actionPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return { type, value: input.trim() }; // Use full text for challenges
    }
  }

  // Default to showing it's a UI interaction, not user input
  return { type: 'ui-interaction', original: input };
};