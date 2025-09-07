/**
 * Hero Projects - 9 World-Class PBL Examples
 * These represent the gold standard of what educators can create with ALF Coach
 */

export type SampleBlueprint = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  wizardData: any;
  ideation?: any;
  journey?: any;
  deliverables?: any;
  sample?: boolean;
  assignments?: any[];
  alignment?: any;
};

function ts() { return new Date().toISOString(); }

/**
 * 9 Hero Projects - Carefully curated to showcase platform capabilities
 * Covering different subjects, grade levels, and PBL approaches
 */
const HERO_PROJECTS = [
  {
    id: 'hero-sustainability-campaign',
    title: 'Campus Sustainability Initiative: From Data to Policy Change',
    subject: 'Environmental Science',
    gradeLevel: 'High School',
    status: 'complete',
    description: 'Students conduct comprehensive sustainability research and advocate for policy change'
  },
  {
    id: 'hero-community-history',
    title: 'Living History: Preserving Community Stories',
    subject: 'Social Studies',
    gradeLevel: 'Middle School',
    status: 'planned',
    description: 'Students interview community elders and create a digital archive of local history'
  },
  {
    id: 'hero-math-city-planning',
    title: 'Reimagining Our City: Urban Planning Through Mathematics',
    subject: 'Mathematics',
    gradeLevel: 'High School',
    status: 'planned',
    description: 'Students use mathematical modeling to redesign city spaces for accessibility'
  },
  {
    id: 'hero-literacy-childrens-books',
    title: 'Authors for Change: Writing Books That Matter',
    subject: 'Language Arts',
    gradeLevel: 'Elementary',
    status: 'planned',
    description: 'Students write and illustrate children\'s books addressing social-emotional themes'
  },
  {
    id: 'hero-innovation-lab',
    title: 'Innovation Lab: Solving Real Problems with Technology',
    subject: 'Technology/Engineering',
    gradeLevel: 'Middle School',
    status: 'planned',
    description: 'Students design and prototype solutions for local business challenges'
  },
  {
    id: 'hero-health-wellness',
    title: 'Wellness Warriors: Designing a Healthier School',
    subject: 'Health/PE',
    gradeLevel: 'Elementary',
    status: 'planned',
    description: 'Students research and implement school-wide wellness initiatives'
  },
  {
    id: 'hero-arts-social-justice',
    title: 'Art as Voice: Creating for Social Change',
    subject: 'Visual Arts',
    gradeLevel: 'High School',
    status: 'planned',
    description: 'Students create public art installations addressing community issues'
  },
  {
    id: 'hero-science-water-quality',
    title: 'Water Guardians: Protecting Our Local Watershed',
    subject: 'Biology/Chemistry',
    gradeLevel: 'Middle School',
    status: 'planned',
    description: 'Students monitor water quality and advocate for watershed protection'
  },
  {
    id: 'hero-music-cultural-bridge',
    title: 'Harmony Across Cultures: Building Bridges Through Music',
    subject: 'Music/World Languages',
    gradeLevel: 'Elementary',
    status: 'planned',
    description: 'Students explore world music traditions and create multicultural performances'
  }
];

// Hero Project 1: Sustainability Campaign (COMPLETE)
function buildSustainabilityHero(userId: string): SampleBlueprint {
  const id = 'hero-sustainability-campaign';

  const wizardData = {
    projectTopic: 'Campus Sustainability Initiative: From Data to Policy Change',
    learningGoals: 'Systems thinking, environmental science, policy analysis, data science, community organizing, strategic communication, collaborative leadership, ethical reasoning',
    entryPoint: 'authentic_problem',
    subjects: ['science', 'social-studies', 'language-arts', 'mathematics', 'technology', 'arts'],
    primarySubject: 'science',
    gradeLevel: 'high',
    duration: 'long',
    materials: 'Digital scales, sorting equipment, water testing kits, laptops/tablets, presentation technology, poster materials, video equipment, survey platforms, data visualization software',
    subject: 'Environmental Science, Social Studies, Statistics, ELA, Digital Media',
    location: 'school campus, community sites, city hall, local businesses',
    featured: true,
    heroProject: true,
    communityPartners: ['City Sustainability Office', 'Local Environmental Organizations', 'Waste Management Companies', 'Campus Facilities', 'Student Government', 'Parent Teacher Association'],
  };

  const ideation = {
    bigIdea: 'Complex environmental challenges require evidence-based solutions, community collaboration, and systemic change across multiple scales - from individual behavior to institutional policy.',
    essentialQuestion: 'How can we use data, community organizing, and policy advocacy to create lasting environmental change that extends beyond our campus?',
    challenge: 'Conduct comprehensive sustainability research, develop evidence-based policy recommendations, and implement community-driven solutions that create measurable environmental impact and influence broader institutional change.',
    studentVoice: {
      drivingQuestions: [
        'What environmental issue matters most to our community and why?',
        'How do we want to research and measure our impact?',
        'What type of solution do we want to create and who should be our partners?',
        'How will we know if we have succeeded in creating lasting change?'
      ],
      choicePoints: [
        'Focus area selection (plastics, energy, food waste, transportation, etc.)',
        'Research methodologies and data collection approaches',
        'Community stakeholders to engage and partner with',
        'Final product format and presentation venues',
        'Timeline and milestone structure'
      ]
    }
  };

  const journey = {
    phases: [
      {
        id: 'phase-1',
        name: 'Investigate & Analyze',
        description: 'Conduct comprehensive environmental systems analysis',
        goal: 'Understand current environmental challenges through multi-method research',
        activity: 'Quantitative audits, stakeholder interviews, policy analysis, comparative studies',
        output: 'Systems analysis report with data dashboard and evidence-based problem statement',
        duration: '2-3 weeks'
      },
      {
        id: 'phase-2',
        name: 'Strategize & Design',
        description: 'Develop evidence-based solutions through community collaboration',
        goal: 'Co-create strategic interventions with stakeholder input',
        activity: 'Design thinking workshops, community forums, prototype development, feasibility analysis',
        output: 'Strategic plan with implementation roadmap and partnership agreements',
        duration: '2 weeks'
      },
      {
        id: 'phase-3',
        name: 'Implement & Iterate',
        description: 'Launch pilot interventions and gather feedback',
        goal: 'Test solutions in real-world contexts with continuous improvement',
        activity: 'Pilot programs, data collection, stakeholder feedback, iterative refinement',
        output: 'Implementation report with metrics, lessons learned, and recommendations',
        duration: '3-4 weeks'
      },
      {
        id: 'phase-4',
        name: 'Advocate & Scale',
        description: 'Present findings and advocate for systemic change',
        goal: 'Influence institutional policy and inspire broader action',
        activity: 'Policy presentations, media campaigns, community mobilization, replication toolkit creation',
        output: 'Policy brief, presentation to decision-makers, community action toolkit',
        duration: '2-3 weeks'
      }
    ],
    activities: [
      'Waste audit and data collection',
      'Energy consumption analysis',
      'Water quality testing',
      'Transportation survey',
      'Stakeholder interviews',
      'Design thinking workshops',
      'Prototype testing',
      'Community forums',
      'Policy brief writing',
      'Presentation preparation'
    ],
    resources: [
      { name: 'EPA Environmental Data Portal', type: 'database' },
      { name: 'Local Government Sustainability Plans', type: 'document' },
      { name: 'Community Partner Contact List', type: 'resource' },
      { name: 'Data Visualization Tools', type: 'technology' },
      { name: 'Policy Brief Templates', type: 'template' },
      { name: 'Stakeholder Interview Protocols', type: 'guide' },
      { name: 'Waste Audit Toolkit', type: 'toolkit' },
      { name: 'Carbon Footprint Calculator', type: 'tool' },
      { name: 'Presentation Design Resources', type: 'resource' }
    ]
  };

  const deliverables = {
    milestones: [
      { id: 'm1', name: 'Environmental Audit Complete', description: 'Comprehensive data collection and analysis finished with baseline metrics established' },
      { id: 'm2', name: 'Stakeholder Engagement Plan', description: 'Community partnerships established and engagement strategy implemented' },
      { id: 'm3', name: 'Pilot Implementation', description: 'Initial interventions launched and tested with measurable outcomes' },
      { id: 'm4', name: 'Policy Presentation', description: 'Formal presentation to decision-makers with actionable recommendations' },
      { id: 'm5', name: 'Community Toolkit Published', description: 'Replication guide and resources shared for broader impact' },
      { id: 'm6', name: 'Impact Assessment Report', description: 'Final evaluation of project outcomes and lessons learned' }
    ],
    rubric: {
      criteria: [
        { id: 'c1', name: 'Systems Thinking', description: 'Understanding of complex environmental systems and interdependencies' },
        { id: 'c2', name: 'Research Quality', description: 'Rigor and validity of data collection and analysis' },
        { id: 'c3', name: 'Community Engagement', description: 'Effectiveness of stakeholder collaboration and partnership building' },
        { id: 'c4', name: 'Solution Feasibility', description: 'Practicality and sustainability of proposed interventions' },
        { id: 'c5', name: 'Communication Impact', description: 'Clarity and persuasiveness of presentations and materials' }
      ]
    },
    impact: {
      audience: 'School Board, City Council, Environmental Organizations, Community Members',
      method: 'Policy presentations, media coverage, community forums, online toolkit',
      measures: [
        'Reduction in campus waste by 30%',
        'Energy consumption decreased by 20%',
        'Policy adoption by school board',
        'Community engagement (500+ participants)',
        'Replication in 3+ other schools'
      ]
    }
  };

  return {
    id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData,
    ideation,
    journey,
    deliverables,
    sample: true
  };
}

// Placeholder function for future hero projects
function buildHeroProjectPlaceholder(projectConfig: any, userId: string): SampleBlueprint {
  const wizardData = {
    projectTopic: projectConfig.title,
    learningGoals: 'To be developed with subject matter experts',
    entryPoint: 'authentic_problem',
    subjects: [projectConfig.subject.toLowerCase().replace(' ', '-')],
    primarySubject: projectConfig.subject.toLowerCase(),
    gradeLevel: projectConfig.gradeLevel.toLowerCase().replace(' school', ''),
    duration: 'medium',
    subject: projectConfig.subject,
    location: 'various',
    featured: true,
    heroProject: true,
    status: 'planned'
  };

  const ideation = {
    bigIdea: projectConfig.description,
    essentialQuestion: 'To be developed',
    challenge: 'Coming soon - this hero project will demonstrate world-class PBL'
  };

  return {
    id: projectConfig.id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData,
    ideation,
    journey: { phases: [], activities: [], resources: [] },
    deliverables: { milestones: [], rubric: { criteria: [] }, impact: {} },
    sample: true
  };
}

// Main export function - returns only the 9 hero projects
export function getAllSampleBlueprints(userId: string = 'anonymous'): SampleBlueprint[] {
  const samples: SampleBlueprint[] = [];
  
  // Add the complete sustainability hero project
  samples.push(buildSustainabilityHero(userId));
  
  // Add placeholders for the other 8 hero projects
  HERO_PROJECTS.slice(1).forEach(project => {
    samples.push(buildHeroProjectPlaceholder(project, userId));
  });
  
  return samples;
}

// Legacy function kept for compatibility
export function makeSampleBlueprint(id: string, userId: string = 'anonymous'): SampleBlueprint {
  // Return the sustainability hero project as default
  return buildSustainabilityHero(userId);
}

// Export hero projects metadata for gallery display
export function getHeroProjectsMetadata() {
  return HERO_PROJECTS;
}