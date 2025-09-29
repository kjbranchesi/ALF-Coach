/**
 * suggestionContent.ts
 * Stage-specific suggestions for Ideas button
 */

import { getStageSpecificSuggestions } from './stageSpecificContent';

export type SuggestionCategory = 'core' | 'cross' | 'moonshot' | 'student-led' | 'whatif' | 'resource' | 'idea';

export interface Suggestion {
  id: string;
  text: string;
  category?: SuggestionCategory; // Optional, for compatibility
}

export const STAGE_SUGGESTIONS: Record<string, Suggestion[]> = {
  // Onboarding suggestions
  ONBOARDING: [
    { id: 'onboard-1', text: 'Start with subjects you\'re most passionate about', category: 'core' },
    { id: 'onboard-2', text: 'Consider your students\' interests and real-world connections', category: 'student-led' },
    { id: 'onboard-3', text: 'What if this project connected to current local issues?', category: 'whatif' },
    { id: 'onboard-4', text: 'Plan for both individual and collaborative work', category: 'cross' }
  ],

  // Grounding suggestions  
  GROUNDING: [
    { id: 'ground-1', text: 'Connect "Sustainable school garden, Water conservation" to real-world environmental challenges' },
    { id: 'ground-2', text: 'Focus on how water conservation impacts local ecosystems and communities' },
    { id: 'ground-3', text: 'Consider having students design solutions that could be implemented at school' }
  ],

  // Welcome/Setup suggestions
  WELCOME: [
    { id: '1', text: 'Start with a topic that connects to current events' },
    { id: '2', text: 'Build on student interests and passions' },
    { id: '3', text: 'Consider interdisciplinary connections' }
  ],

  // Ideation intro suggestions
  IDEATION_INTRO: [
    { id: 'intro-1', text: 'Build on your curriculum standards and student interests' },
    { id: 'intro-2', text: 'Connect learning to real-world issues that matter' },
    { id: 'intro-3', text: 'Look for authentic challenges in your community' }
  ],

  // Big Idea stage suggestions  
  BIG_IDEA: [
    { id: 'big-1', text: 'Explore how sustainability connects to your {subject} curriculum' },
    { id: 'big-2', text: 'Focus on systems thinking - how parts work together to create the whole' },
    { id: 'big-3', text: 'Consider "The intersection of {subject} and real-world impact"' }
  ],

  // Essential Question stage suggestions
  ESSENTIAL_QUESTION: [
    { id: 'eq-1', text: 'How might we use learning to solve real problems in our community?' },
    { id: 'eq-2', text: 'Why does this topic matter for our future?' },
    { id: 'eq-3', text: 'What would happen if we reimagined education through student perspectives?' }
  ],

  // Challenge stage suggestions
  CHALLENGE: [
    { id: 'challenge-1', text: 'Create a solution that addresses the essential question' },
    { id: 'challenge-2', text: 'Design and test a prototype that demonstrates your understanding' },
    { id: 'challenge-3', text: 'Develop a presentation for real stakeholders' }
  ],
  
  // Ideation stage suggestions
  IDEATION: [
    // Big Ideas
    { id: 'idea-1', text: 'Climate change and its local environmental impacts', category: 'core' },
    { id: 'idea-2', text: 'How technology shapes modern communication', category: 'cross' },
    { id: 'idea-3', text: 'The stories and history that built our community', category: 'core' },
    { id: 'idea-4', text: 'Mathematical patterns in nature and art', category: 'cross' },
    { id: 'idea-5', text: 'Systems thinking for understanding complexity', category: 'core' },

    // Essential Questions
    { id: 'eq-1', text: 'How might we reduce our school\'s carbon footprint by 50%?', category: 'core' },
    { id: 'eq-2', text: 'Why do some communities thrive while others decline?', category: 'cross' },
    { id: 'eq-3', text: 'What makes a story worth preserving for future generations?', category: 'student-led' },
    { id: 'eq-4', text: 'How can data help us make better decisions?', category: 'core' },

    // What-if scenarios
    { id: 'whatif-1', text: 'What if students presented their solutions to city council?', category: 'whatif' },
    { id: 'whatif-2', text: 'What if we partnered with local businesses or organizations?', category: 'whatif' },
    { id: 'whatif-3', text: 'What if students created something that outlasts the school year?', category: 'whatif' },

    // Resources
    { id: 'resource-1', text: 'Connect with local experts as mentors', category: 'cross' },
    { id: 'resource-2', text: 'Use design thinking frameworks', category: 'core' },
    { id: 'resource-3', text: 'Explore grant opportunities for project funding', category: 'cross' }
  ],
  
  // Learning Journey suggestions
  JOURNEY: [
    { id: 'journey-1', text: 'Students conduct stakeholder interviews to understand perspectives' },
    { id: 'journey-2', text: 'Research existing solutions and identify what works' },
    { id: 'journey-3', text: 'Create prototypes and test with real users' }
  ],
  
  // Deliverables suggestions
  DELIVERABLES: [
    { id: 'deliver-1', text: 'Create a presentation, prototype, and reflection portfolio' },
    { id: 'deliver-2', text: 'Include peer assessment and self-reflection components' },
    { id: 'deliver-3', text: 'Plan a final exhibition or showcase for the community' }
  ]
};

/**
 * Get contextual suggestions based on stage and optional step
 */
export function getStageSuggestions(stage: string, step?: string, context?: any): Suggestion[] {
  // If context is provided, use the new context-aware generator
  if (context) {
    return getStageSpecificSuggestions(stage, context);
  }
  
  // Otherwise fall back to static suggestions
  const baseSuggestions = STAGE_SUGGESTIONS[stage] || [];
  
  if (!step) {
    // Always return exactly 3 suggestions
    return baseSuggestions.slice(0, 3);
  }
  
  // Filter suggestions based on step
  const stepLower = step.toLowerCase();
  const filtered = baseSuggestions.filter(s => {
    const textLower = s.text.toLowerCase();
    
    // Match based on step keywords
    if (stepLower.includes('idea') && textLower.includes('idea')) return true;
    if (stepLower.includes('question') && (textLower.includes('how') || textLower.includes('why') || textLower.includes('what'))) return true;
    if (stepLower.includes('challenge') && (textLower.includes('solution') || textLower.includes('problem'))) return true;
    if (stepLower.includes('analyze') && s.id.includes('analyze')) return true;
    if (stepLower.includes('brainstorm') && s.id.includes('brainstorm')) return true;
    if (stepLower.includes('prototype') && s.id.includes('prototype')) return true;
    if (stepLower.includes('evaluate') && s.id.includes('evaluate')) return true;
    
    return false;
  });
  
  // If we have filtered results, return them; otherwise return general suggestions
  return filtered.length > 0 ? filtered.slice(0, 3) : baseSuggestions.slice(0, 3);
}

/**
 * Get randomized suggestions for variety
 */
export function getRandomSuggestions(stage: string, count: number = 3): Suggestion[] {
  const suggestions = STAGE_SUGGESTIONS[stage] || [];
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get suggestions by category
 */
export function getSuggestionsByCategory(stage: string, category: 'idea' | 'whatif' | 'resource'): Suggestion[] {
  const suggestions = STAGE_SUGGESTIONS[stage] || [];
  return suggestions.filter(s => s.category === category);
}
