// src/lib/scaffoldingUtils.js
// Utilities for implementing research-based scaffolding principles in ALF Coach

/**
 * The Four Foundational Pillars of PBL
 * Based on "Scaffolded PBL Assignment Design Playbook"
 */
export const PBL_PILLARS = {
  CONSTRUCTIVE_DISCIPLINARY: {
    name: 'Constructive & Disciplinary Learning',
    description: 'Students engage with authentic disciplinary practices',
    ideation: 'Connect to real disciplinary work',
    journey: 'Mirror professional practices',
    deliverables: 'Assess disciplinary thinking'
  },
  AUTHENTIC_CONTEXTUAL: {
    name: 'Authentic & Contextual Work',
    description: 'Learning connects to real-world contexts',
    ideation: 'Ground in community needs',
    journey: 'Use authentic resources',
    deliverables: 'Share with real audiences'
  },
  COLLABORATIVE_STUDENT_LED: {
    name: 'Collaborative & Student-Led Learning',
    description: 'Students drive their learning collaboratively',
    ideation: 'Empower student voice',
    journey: 'Build collaborative skills',
    deliverables: 'Include peer assessment'
  },
  ITERATIVE_REFLECTIVE: {
    name: 'Iterative & Reflective Process',
    description: 'Learning includes cycles of revision and reflection',
    ideation: 'Build in flexibility',
    journey: 'Include iteration cycles',
    deliverables: 'Emphasize growth'
  }
};

/**
 * Developmental Learning Arcs by Age Group
 * Based on "Best Practices for Implementing PBL at Different Developmental Stages"
 */
export const DEVELOPMENTAL_ARCS = {
  'Early Childhood': {
    arc: 'Story-Based Inquiry Arc',
    focus: 'Wonder, exploration, and narrative',
    scaffolding: {
      contingency: 'Constant teacher support and modeling',
      fading: 'Gradual release through repetition with variation',
      transfer: 'Application in familiar contexts'
    },
    language: {
      tone: 'Playful, encouraging, story-like',
      complexity: 'Simple sentences, concrete terms',
      metaphors: 'Adventure, discovery, magic'
    }
  },
  'Elementary/Primary': {
    arc: 'Investigator\'s Toolkit Arc',
    focus: 'Hands-on investigation and discovery',
    scaffolding: {
      contingency: 'Structured guides with clear steps',
      fading: 'Progressive independence in familiar tasks',
      transfer: 'Application to new but similar contexts'
    },
    language: {
      tone: 'Excited, supportive, investigative',
      complexity: 'Clear instructions, some abstract concepts',
      metaphors: 'Detective, scientist, explorer'
    }
  },
  'Middle/Lower Secondary': {
    arc: 'Proposal-to-Product Pipeline',
    focus: 'Identity formation through meaningful choice',
    scaffolding: {
      contingency: 'Flexible support based on need',
      fading: 'Student-requested help, peer support',
      transfer: 'Application to personally relevant contexts'
    },
    language: {
      tone: 'Respectful, collaborative, empowering',
      complexity: 'Sophisticated concepts with support',
      metaphors: 'Designer, innovator, changemaker'
    }
  },
  'High/Upper Secondary': {
    arc: 'Expert-in-Training Cycle',
    focus: 'Professional practices and expertise',
    scaffolding: {
      contingency: 'On-demand expert mentorship',
      fading: 'Self-directed with checkpoints',
      transfer: 'Application to professional contexts'
    },
    language: {
      tone: 'Professional, respectful, challenging',
      complexity: 'Field-specific terminology',
      metaphors: 'Professional, expert, practitioner'
    }
  },
  'Adult/Higher Education': {
    arc: 'Capstone Research Arc',
    focus: 'Original contribution and leadership',
    scaffolding: {
      contingency: 'Peer collaboration and expert consultation',
      fading: 'Self-regulated learning',
      transfer: 'Leadership in new contexts'
    },
    language: {
      tone: 'Collegial, scholarly, innovative',
      complexity: 'Academic and professional discourse',
      metaphors: 'Scholar, leader, innovator'
    }
  }
};

/**
 * Get scaffolding recommendations for a specific developmental stage
 */
export function getScaffoldingRecommendations(developmentalStage, alfStage) {
  const arc = DEVELOPMENTAL_ARCS[developmentalStage];
  if (!arc) {return null;}

  const recommendations = {
    arc: arc.arc,
    focus: arc.focus,
    language: arc.language,
    scaffolding: arc.scaffolding
  };

  // Add stage-specific recommendations
  switch (alfStage) {
    case 'ideation':
      recommendations.strategies = [
        `Use ${arc.language.metaphors} metaphors to explain concepts`,
        `Frame Big Ideas with ${arc.language.tone} language`,
        `Provide ${arc.scaffolding.contingency} for idea development`
      ];
      break;
    case 'journey':
      recommendations.strategies = [
        `Design phases following the ${arc.arc} approach`,
        `Include ${arc.scaffolding.fading} in activity progression`,
        `Resources should support ${arc.focus}`
      ];
      break;
    case 'deliverables':
      recommendations.strategies = [
        `Assessment reflects ${arc.scaffolding.transfer}`,
        `Milestones celebrate ${arc.focus}`,
        `Impact plans match ${arc.language.complexity} level`
      ];
      break;
  }

  return recommendations;
}

/**
 * Get age-appropriate examples for different ALF components
 */
export function getAgeAppropriateExamples(developmentalStage, component, subject) {
  const examples = {
    'Early Childhood': {
      bigIdea: ['Our Amazing Community Helpers', 'Nature\'s Magical Patterns', 'Stories That Connect Us'],
      essentialQuestion: ['What makes our community special?', 'How do living things grow and change?', 'Why do we tell stories?'],
      challenge: ['Create a class book about community helpers', 'Build a butterfly garden for our school', 'Make a puppet show of our favorite story'],
      phases: ['Discover & Wonder', 'Explore & Play', 'Create & Share'],
      milestones: ['Our First Discovery', 'Creation Celebration', 'Sharing Circle']
    },
    'Elementary/Primary': {
      bigIdea: ['Sustainable School Solutions', 'Cultural Bridges in Our Community', 'Innovation Through History'],
      essentialQuestion: ['How can we make our school more eco-friendly?', 'How do different cultures enrich our community?', 'How have inventions changed our world?'],
      challenge: ['Design a recycling system for our school', 'Create a multicultural festival', 'Build a working model of a historic invention'],
      phases: ['Investigate & Research', 'Design & Build', 'Test & Improve'],
      milestones: ['Research Complete', 'Prototype Ready', 'Community Showcase']
    },
    'Middle/Lower Secondary': {
      bigIdea: ['Urban Sustainability & Design', 'Social Justice in Action', 'Digital Innovation for Good'],
      essentialQuestion: ['How might we redesign our neighborhood for sustainability?', 'How can young people create social change?', 'How can technology solve community problems?'],
      challenge: ['Propose a green space redesign to city council', 'Launch a social justice campaign', 'Develop an app to address a local issue'],
      phases: ['Research & Analyze', 'Ideate & Prototype', 'Implement & Impact'],
      milestones: ['Needs Assessment', 'Solution Proposal', 'Public Presentation']
    },
    'High/Upper Secondary': {
      bigIdea: ['Climate Solutions Engineering', 'Entrepreneurial Innovation', 'Policy & Social Change'],
      essentialQuestion: ['How can we engineer solutions to climate challenges?', 'How do entrepreneurs identify and solve problems?', 'How does policy create systemic change?'],
      challenge: ['Design a renewable energy solution for local use', 'Launch a social enterprise venture', 'Draft policy recommendations for legislators'],
      phases: ['Professional Research', 'Development & Testing', 'Launch & Evaluation'],
      milestones: ['Literature Review', 'Professional Deliverable', 'Stakeholder Presentation']
    },
    'Adult/Higher Education': {
      bigIdea: ['Systems Thinking & Innovation', 'Leadership in Complex Systems', 'Interdisciplinary Solutions'],
      essentialQuestion: ['How do we innovate within complex systems?', 'What does ethical leadership look like?', 'How do disciplines intersect to solve problems?'],
      challenge: ['Develop a systems intervention with measurable impact', 'Lead a cross-functional innovation project', 'Create an interdisciplinary research initiative'],
      phases: ['Systematic Investigation', 'Strategic Development', 'Implementation & Leadership'],
      milestones: ['Comprehensive Analysis', 'Strategic Plan', 'Professional Publication']
    }
  };

  const stageExamples = examples[developmentalStage];
  if (!stageExamples || !stageExamples[component]) {return [];}

  // Customize based on subject if provided
  if (subject && subject.toLowerCase().includes('history')) {
    // Adjust examples for history context
    return stageExamples[component].map(ex => 
      ex.replace(/community|school|technology/gi, match => {
        const replacements = {
          'community': 'historical period',
          'school': 'local history',
          'technology': 'historical innovation'
        };
        return replacements[match.toLowerCase()] || match;
      })
    );
  }

  return stageExamples[component];
}

/**
 * Get iterative cycle recommendations by developmental stage
 */
export function getIterativeCycleStructure(developmentalStage) {
  const cycles = {
    'Early Childhood': {
      structure: 'Simple Repetition with Variation',
      frequency: 'Daily mini-cycles',
      reflection: 'Circle time sharing',
      revision: 'Try again with new ideas'
    },
    'Elementary/Primary': {
      structure: 'Test-Improve-Share Cycles',
      frequency: 'Weekly iteration cycles',
      reflection: 'Learning journals and peer feedback',
      revision: 'Guided improvement sessions'
    },
    'Middle/Lower Secondary': {
      structure: 'Design-Test-Refine Cycles',
      frequency: 'Bi-weekly sprint cycles',
      reflection: 'Structured peer reviews',
      revision: 'Self-directed improvements'
    },
    'High/Upper Secondary': {
      structure: 'Professional Iteration Cycles',
      frequency: 'Project milestone reviews',
      reflection: 'Formal critique sessions',
      revision: 'Evidence-based refinement'
    },
    'Adult/Higher Education': {
      structure: 'Research & Development Cycles',
      frequency: 'Self-paced with deadlines',
      reflection: 'Peer review and expert feedback',
      revision: 'Scholarly revision process'
    }
  };

  return cycles[developmentalStage] || cycles['High/Upper Secondary'];
}

/**
 * Transform generic prompts to be developmentally appropriate
 */
export function transformPromptForAge(prompt, developmentalStage) {
  const transformations = DEVELOPMENTAL_ARCS[developmentalStage];
  if (!transformations) {return prompt;}

  let transformed = prompt;

  // Apply tone transformations
  if (developmentalStage === 'Early Childhood') {
    transformed = transformed
      .replace(/students/g, 'young learners')
      .replace(/investigate/g, 'explore')
      .replace(/analyze/g, 'look at')
      .replace(/create/g, 'make')
      .replace(/demonstrate/g, 'show');
  } else if (developmentalStage === 'Elementary/Primary') {
    transformed = transformed
      .replace(/students/g, 'young investigators')
      .replace(/research/g, 'discover')
      .replace(/hypothesis/g, 'prediction')
      .replace(/evaluate/g, 'check');
  } else if (developmentalStage === 'Middle/Lower Secondary') {
    transformed = transformed
      .replace(/students/g, 'young innovators')
      .replace(/assignment/g, 'project')
      .replace(/grade/g, 'feedback');
  }

  return transformed;
}

export default {
  PBL_PILLARS,
  DEVELOPMENTAL_ARCS,
  getScaffoldingRecommendations,
  getAgeAppropriateExamples,
  getIterativeCycleStructure,
  transformPromptForAge
};