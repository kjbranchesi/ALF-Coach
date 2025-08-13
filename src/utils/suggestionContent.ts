/**
 * suggestionContent.ts
 * Stage-specific suggestions for Ideas button
 */

export interface Suggestion {
  id: string;
  text: string;
  category: 'idea' | 'whatif' | 'resource';
}

export const STAGE_SUGGESTIONS: Record<string, Suggestion[]> = {
  // Welcome/Setup suggestions
  WELCOME: [
    { id: '1', text: 'Start with a topic that connects to current events', category: 'idea' },
    { id: '2', text: 'What if students could teach this to younger grades?', category: 'whatif' },
    { id: '3', text: 'Consider interdisciplinary connections', category: 'resource' }
  ],
  
  // Ideation stage suggestions
  IDEATION: [
    // Big Ideas
    { id: 'idea-1', text: 'Climate change and its local environmental impacts', category: 'idea' },
    { id: 'idea-2', text: 'How technology shapes modern communication', category: 'idea' },
    { id: 'idea-3', text: 'The stories and history that built our community', category: 'idea' },
    { id: 'idea-4', text: 'Mathematical patterns in nature and art', category: 'idea' },
    { id: 'idea-5', text: 'Systems thinking for understanding complexity', category: 'idea' },
    
    // Essential Questions
    { id: 'eq-1', text: 'How might we reduce our school\'s carbon footprint by 50%?', category: 'idea' },
    { id: 'eq-2', text: 'Why do some communities thrive while others decline?', category: 'idea' },
    { id: 'eq-3', text: 'What makes a story worth preserving for future generations?', category: 'idea' },
    { id: 'eq-4', text: 'How can data help us make better decisions?', category: 'idea' },
    
    // What-if scenarios
    { id: 'whatif-1', text: 'What if students presented their solutions to city council?', category: 'whatif' },
    { id: 'whatif-2', text: 'What if we partnered with local businesses or organizations?', category: 'whatif' },
    { id: 'whatif-3', text: 'What if students created something that outlasts the school year?', category: 'whatif' },
    
    // Resources
    { id: 'resource-1', text: 'Connect with local experts as mentors', category: 'resource' },
    { id: 'resource-2', text: 'Use design thinking frameworks', category: 'resource' },
    { id: 'resource-3', text: 'Explore grant opportunities for project funding', category: 'resource' }
  ],
  
  // Learning Journey suggestions
  JOURNEY: [
    // Analyze Phase
    { id: 'analyze-1', text: 'Students conduct stakeholder interviews to understand perspectives', category: 'idea' },
    { id: 'analyze-2', text: 'Research existing solutions and identify what works/doesn\'t', category: 'idea' },
    { id: 'analyze-3', text: 'Create journey maps or systems diagrams of the problem', category: 'idea' },
    { id: 'analyze-4', text: 'Collect and analyze relevant data from multiple sources', category: 'idea' },
    
    // Brainstorm Phase
    { id: 'brainstorm-1', text: 'Host a design sprint with rapid ideation sessions', category: 'idea' },
    { id: 'brainstorm-2', text: 'Use SCAMPER technique for creative problem solving', category: 'idea' },
    { id: 'brainstorm-3', text: 'Cross-pollinate ideas from different industries', category: 'idea' },
    
    // Prototype Phase
    { id: 'prototype-1', text: 'Build low-fidelity prototypes with everyday materials', category: 'idea' },
    { id: 'prototype-2', text: 'Create digital mockups or simulations', category: 'idea' },
    { id: 'prototype-3', text: 'Develop a pilot program to test ideas', category: 'idea' },
    { id: 'prototype-4', text: 'Test prototypes with real users for feedback', category: 'idea' },
    
    // Evaluate Phase
    { id: 'evaluate-1', text: 'Present to authentic audiences for feedback', category: 'idea' },
    { id: 'evaluate-2', text: 'Measure impact against original success criteria', category: 'idea' },
    { id: 'evaluate-3', text: 'Document lessons learned and next steps', category: 'idea' },
    
    // What-if scenarios
    { id: 'journey-whatif-1', text: 'What if students could iterate multiple times?', category: 'whatif' },
    { id: 'journey-whatif-2', text: 'What if we had unlimited resources?', category: 'whatif' },
    { id: 'journey-whatif-3', text: 'What if students worked with professionals?', category: 'whatif' },
    
    // Resources
    { id: 'journey-resource-1', text: 'Use project management tools for tracking', category: 'resource' },
    { id: 'journey-resource-2', text: 'Create a shared digital workspace', category: 'resource' },
    { id: 'journey-resource-3', text: 'Schedule regular check-ins and reflections', category: 'resource' }
  ],
  
  // Deliverables suggestions
  DELIVERABLES: [
    // Assessment Ideas
    { id: 'deliver-1', text: 'Create a multi-dimensional rubric covering process and product', category: 'idea' },
    { id: 'deliver-2', text: 'Include peer assessment and self-reflection components', category: 'idea' },
    { id: 'deliver-3', text: 'Design authentic performance assessments', category: 'idea' },
    { id: 'deliver-4', text: 'Build portfolio requirements for documentation', category: 'idea' },
    
    // Milestone Ideas
    { id: 'milestone-1', text: 'Research synthesis presentation', category: 'idea' },
    { id: 'milestone-2', text: 'Mid-project prototype review', category: 'idea' },
    { id: 'milestone-3', text: 'Peer feedback sessions', category: 'idea' },
    { id: 'milestone-4', text: 'Final exhibition or showcase', category: 'idea' },
    
    // What-if scenarios
    { id: 'deliver-whatif-1', text: 'What if students assessed each other?', category: 'whatif' },
    { id: 'deliver-whatif-2', text: 'What if the community voted on best solutions?', category: 'whatif' },
    { id: 'deliver-whatif-3', text: 'What if work was published publicly?', category: 'whatif' },
    
    // Resources
    { id: 'deliver-resource-1', text: 'Use digital portfolios for documentation', category: 'resource' },
    { id: 'deliver-resource-2', text: 'Connect with authentic audiences', category: 'resource' },
    { id: 'deliver-resource-3', text: 'Plan a culminating event or exhibition', category: 'resource' }
  ]
};

/**
 * Get contextual suggestions based on stage and optional step
 */
export function getStageSuggestions(stage: string, step?: string): Suggestion[] {
  const baseSuggestions = STAGE_SUGGESTIONS[stage] || [];
  
  if (!step) {
    // Return a mix of suggestions if no specific step
    return baseSuggestions.slice(0, 6);
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
  return filtered.length > 0 ? filtered.slice(0, 6) : baseSuggestions.slice(0, 6);
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