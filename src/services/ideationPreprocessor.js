// ideationPreprocessor.js - AI preprocessing for ideation conversations

import { generateJsonResponse } from './geminiService';

/**
 * Preprocess onboarding data with AI to generate contextual insights
 */
export const preprocessIdeationContext = async (onboardingData) => {
  const prompt = `
You are an educational design expert helping to create authentic learning experiences.

Context from educator:
- Subject/Theme: ${onboardingData.subject}
- Student Group: ${onboardingData.ageGroup}
- Project Scope: ${onboardingData.projectScope}
- Location: ${onboardingData.location || 'Not specified'}
- Initial Vision/Interest: ${onboardingData.educatorPerspective}
- Materials Available: ${onboardingData.initialMaterials || 'None specified'}

Analyze this information and provide:
1. Key themes and connections you notice
2. Potential Big Ideas that connect to their interests
3. Real-world relevance opportunities
4. Student engagement hooks based on their age group

If they mentioned specific interests (like the Olympics, current events, local issues), 
make sure to weave those into your suggestions.

Respond with a JSON object containing:
{
  "keyThemes": ["theme1", "theme2", ...],
  "bigIdeaSuggestions": [
    {
      "idea": "The Big Idea",
      "rationale": "Why this connects to their context"
    }
  ],
  "engagementHooks": ["hook1", "hook2", ...],
  "realWorldConnections": ["connection1", "connection2", ...],
  "personalizedInsights": "A brief insight about their specific interests"
}
`;

  try {
    const response = await generateJsonResponse(prompt, {
      subject: onboardingData.subject,
      context: onboardingData
    });

    return {
      success: true,
      insights: response
    };
  } catch (error) {
    console.error('AI preprocessing error:', error);
    
    // Fallback to basic processing
    return {
      success: false,
      insights: {
        keyThemes: extractBasicThemes(onboardingData),
        bigIdeaSuggestions: generateBasicSuggestions(onboardingData),
        engagementHooks: [],
        realWorldConnections: [],
        personalizedInsights: ''
      }
    };
  }
};

/**
 * Extract basic themes without AI
 */
const extractBasicThemes = (data) => {
  const themes = [];
  const perspective = data.educatorPerspective?.toLowerCase() || '';
  
  // Check for specific keywords
  if (perspective.includes('olympic')) themes.push('Global Competition & Excellence');
  if (perspective.includes('sport')) themes.push('Athletics & Performance');
  if (perspective.includes('cultur')) themes.push('Cultural Exchange');
  if (perspective.includes('histor')) themes.push('Historical Significance');
  if (perspective.includes('communit')) themes.push('Community Impact');
  if (perspective.includes('sustainab')) themes.push('Sustainability');
  if (perspective.includes('technolog')) themes.push('Innovation & Technology');
  
  return themes.length > 0 ? themes : ['Exploration', 'Discovery', 'Real-World Application'];
};

/**
 * Generate basic suggestions without AI
 */
const generateBasicSuggestions = (data) => {
  const suggestions = [];
  const perspective = data.educatorPerspective?.toLowerCase() || '';
  const subject = data.subject?.toLowerCase() || '';
  
  // Olympics-specific suggestions
  if (perspective.includes('olympic')) {
    suggestions.push({
      idea: 'The Olympics as a Mirror of Society',
      rationale: 'Connects sports to broader social, political, and cultural themes'
    });
    suggestions.push({
      idea: 'Excellence Through Diversity',
      rationale: 'Explores how different cultures approach competition and achievement'
    });
  }
  
  // Subject-specific suggestions
  if (subject.includes('history')) {
    suggestions.push({
      idea: `${data.subject} as Living Memory`,
      rationale: 'Connects past events to present-day experiences and decisions'
    });
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push({
      idea: `Innovation in ${data.subject}`,
      rationale: 'Explores cutting-edge developments and future possibilities'
    });
    suggestions.push({
      idea: `${data.subject} for Social Good`,
      rationale: 'Connects learning to positive community impact'
    });
  }
  
  return suggestions;
};

/**
 * Format Big Idea suggestions for display
 */
export const formatBigIdeaSuggestions = (suggestions) => {
  return suggestions.map(s => 
    typeof s === 'string' ? s : s.idea
  );
};