/**
 * contextualHelp.ts
 * 
 * Context-aware help content based on current stage
 */

interface HelpContent {
  title: string;
  tips: string[];
  examples?: string[];
  resources?: { label: string; url?: string }[];
}

const STAGE_HELP: Record<string, HelpContent> = {
  GROUNDING: {
    title: 'Getting Started',
    tips: [
      'Share your subject area and grade level',
      'Tell us about your teaching context',
      'Mention any constraints or requirements',
      'Describe your student population'
    ],
    examples: [
      'I teach 9th grade Biology',
      'My students are college freshmen in Engineering',
      'I have a mixed-ability 7th grade Math class'
    ]
  },
  
  IDEATION_INTRO: {
    title: 'Starting Your Design',
    tips: [
      'Think about real-world connections',
      'Consider student interests and relevance',
      'Start broad, we\'ll refine together',
      'Draw from current events or local issues'
    ],
    examples: [
      'Climate change impacts in our community',
      'Social justice and mathematics',
      'Engineering solutions for accessibility'
    ]
  },
  
  BIG_IDEA: {
    title: 'Crafting Your Big Idea',
    tips: [
      'Big Ideas are conceptual, not just topics',
      'They should connect to real-world issues',
      'Make it relevant to student lives',
      'Allow for multiple perspectives'
    ],
    examples: [
      'Sustainability in Urban Development',
      'The Power of Data in Decision Making',
      'Systems Thinking in Natural Ecosystems'
    ],
    resources: [
      { label: 'What Makes a Good Big Idea?', url: '#' },
      { label: 'Big Idea Examples by Subject', url: '#' }
    ]
  },
  
  ESSENTIAL_QUESTION: {
    title: 'Essential Question Design',
    tips: [
      'Questions should be open-ended',
      'No single "right" answer',
      'Provoke critical thinking',
      'Connect to the Big Idea'
    ],
    examples: [
      'How might we create more equitable communities?',
      'What is the true cost of convenience?',
      'How do stories shape our understanding of history?'
    ],
    resources: [
      { label: 'Essential Question Stems', url: '#' },
      { label: 'Bloom\'s Taxonomy Guide', url: '#' }
    ]
  },
  
  CHALLENGE: {
    title: 'Defining the Challenge',
    tips: [
      'Make it authentic and actionable',
      'Connect to real stakeholders if possible',
      'Allow for creative solutions',
      'Ensure it\'s grade-appropriate'
    ],
    examples: [
      'Design a water conservation plan for our school',
      'Create a public awareness campaign about local history',
      'Develop a app to help elderly neighbors'
    ]
  },
  
  JOURNEY: {
    title: 'Planning the Learning Journey',
    tips: [
      'Break into the 4 creative phases',
      'Plan for iteration and revision',
      'Include formative assessments',
      'Build in collaboration opportunities'
    ],
    resources: [
      { label: 'Creative Process Phases', url: '#' },
      { label: 'Activity Planning Templates', url: '#' }
    ]
  },
  
  DELIVERABLES: {
    title: 'Defining Success',
    tips: [
      'Create clear, measurable criteria',
      'Include both process and product',
      'Consider multiple forms of assessment',
      'Plan for student reflection'
    ],
    resources: [
      { label: 'Rubric Builder', url: '#' },
      { label: 'Assessment Strategies', url: '#' }
    ]
  }
};

export function getContextualHelp(stage: string): HelpContent {
  return STAGE_HELP[stage] || {
    title: 'Help',
    tips: [
      'Navigate through each stage',
      'Follow the prompts',
      'Ask for help when needed'
    ]
  };
}

export function getQuickTips(stage: string): string[] {
  const help = getContextualHelp(stage);
  return help.tips.slice(0, 3); // Return first 3 tips for quick display
}

export function getStageExamples(stage: string): string[] {
  const help = getContextualHelp(stage);
  return help.examples || [];
}

export function getStageResources(stage: string): { label: string; url?: string }[] {
  const help = getContextualHelp(stage);
  return help.resources || [];
}