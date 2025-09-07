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

// Legacy single sample (kept for compatibility)
export function makeSampleBlueprint(id: string, userId: string = 'anonymous'): SampleBlueprint {
  const wizardData = {
    projectTopic: 'Urban Green Spaces and Community Wellbeing',
    learningGoals: 'Research, data literacy, civic awareness, design thinking',
    entryPoint: 'learning_goal',
    subjects: ['science', 'social-studies', 'arts'],
    primarySubject: 'science',
    gradeLevel: 'middle',
    duration: 'medium',
    materials: 'Notebooks, access to local maps, measuring tools',
    subject: 'Science, Social Studies',
    location: 'classroom',
  };

  const ideation = {
    bigIdea: 'Human-environment relationships',
    essentialQuestion: 'How can we design greener spaces that improve community wellbeing?',
    challenge: 'Propose a small-scale improvement to a local public space'
  };

  const journey = {
    analyze: { goal: 'Investigate current green space usage', activity: 'Field observation + interviews', output: 'Observation notes', duration: '2 lessons' },
    brainstorm: { goal: 'Generate improvement ideas', activity: 'Design sprint + sketching', output: 'Concept sketches', duration: '3 lessons' },
    prototype: { goal: 'Model a proposed improvement', activity: 'Create physical/digital prototype', output: 'Prototype + rationale', duration: '3–4 lessons' },
    evaluate: { goal: 'Gather feedback and refine', activity: 'Peer critique + stakeholder review', output: 'Revised concept + plan', duration: '2 lessons' }
  };

  const deliverables = {
    milestones: ['Observation summary', 'Concept selection', 'Prototype review'],
    rubric: { criteria: ['Understanding', 'Process', 'Product', 'Impact'] },
    impact: { audience: 'Local community or school leadership', method: 'Showcase or briefing' }
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

// Programmatic catalog for 5–7 samples per age group
type CatalogItem = {
  projectTopic: string;
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
  subjects: string[];
  primarySubject: string;
  duration: 'short' | 'medium' | 'long';
  materials?: string;
};

function baseJourney(short: boolean = true) {
  return {
    analyze: { goal: 'Understand the context', activity: 'Research + observations', output: 'Notes/summary', duration: short ? '1–2 lessons' : '1 week' },
    brainstorm: { goal: 'Generate and select ideas', activity: 'Idea sprint + critique', output: 'Shortlist', duration: short ? '1–2 lessons' : '1 week' },
    prototype: { goal: 'Develop a solution', activity: 'Draft/prototype + feedback', output: 'Draft/prototype', duration: short ? '2–3 lessons' : '1–2 weeks' },
    evaluate: { goal: 'Refine and present', activity: 'Peer review + stakeholder share', output: 'Final with rationale', duration: short ? '1–2 lessons' : '1 week' },
  };
}

const catalog: Record<string, CatalogItem[]> = {
  'early-elementary': [
    { projectTopic: 'Community Helpers', bigIdea: 'Communities and roles', essentialQuestion: 'Who helps our community and how?', challenge: 'Create a “thank you” map poster', subjects: ['social-studies','language-arts','arts'], primarySubject: 'social-studies', duration: 'short' },
    { projectTopic: 'Animal Habitats', bigIdea: 'Living things have needs', essentialQuestion: 'What makes a good home for animals?', challenge: 'Build a habitat diorama', subjects: ['science','arts'], primarySubject: 'science', duration: 'short' },
    { projectTopic: 'School Gardens', bigIdea: 'Plants and care', essentialQuestion: 'How do plants grow best at school?', challenge: 'Design a class planter and care plan', subjects: ['science','math'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Neighborhood Safety', bigIdea: 'Caring for our place', essentialQuestion: 'How can we make our routes safer?', challenge: 'Create a safety poster series', subjects: ['social-studies','arts'], primarySubject: 'social-studies', duration: 'short' },
    { projectTopic: 'Weather Watchers', bigIdea: 'Patterns in nature', essentialQuestion: 'What weather patterns do we see?', challenge: 'Make a class weather report', subjects: ['science','language-arts'], primarySubject: 'science', duration: 'short' },
    { projectTopic: 'Kindness Campaign', bigIdea: 'Community and empathy', essentialQuestion: 'How do small actions help others?', challenge: 'Run a kindness challenge', subjects: ['language-arts','arts'], primarySubject: 'language-arts', duration: 'short' },
  ],
  'elementary': [
    { projectTopic: 'Waste Reduction', bigIdea: 'Sustainability', essentialQuestion: 'How can our school reduce waste?', challenge: 'Pilot a recycling improvement', subjects: ['science','language-arts','mathematics'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Local Ecosystems', bigIdea: 'Interdependence', essentialQuestion: 'How do living things depend on one another?', challenge: 'Create an ecosystem exhibit', subjects: ['science','arts'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Healthy Habits', bigIdea: 'Wellbeing', essentialQuestion: 'How can we make healthier choices?', challenge: 'Design a health tips campaign', subjects: ['health','language-arts'], primarySubject: 'health', duration: 'short' },
    { projectTopic: 'Community History', bigIdea: 'Change over time', essentialQuestion: 'How has our community changed?', challenge: 'Build a timeline gallery', subjects: ['social-studies','language-arts'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'Inventions Fair', bigIdea: 'Problem-solving', essentialQuestion: 'How can we solve everyday problems?', challenge: 'Prototype a simple invention', subjects: ['science','technology'], primarySubject: 'technology', duration: 'medium' },
    { projectTopic: 'School Energy Use', bigIdea: 'Conservation', essentialQuestion: 'Where can we save energy?', challenge: 'Propose energy-saving actions', subjects: ['science','math'], primarySubject: 'science', duration: 'medium' },
  ],
  'middle': [
    { projectTopic: 'Urban Green Spaces', bigIdea: 'Human–environment relationships', essentialQuestion: 'How can greener spaces improve wellbeing?', challenge: 'Propose an improvement to a local space', subjects: ['science','social-studies','arts'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Local History Podcasts', bigIdea: 'Identity and place', essentialQuestion: 'Whose stories define our community?', challenge: 'Produce an oral history episode', subjects: ['social-studies','language-arts','arts'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'School Lunch Analysis', bigIdea: 'Evidence-based decisions', essentialQuestion: 'How nutritious are our lunches?', challenge: 'Recommend menu improvements', subjects: ['science','mathematics','language-arts'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Water Quality Study', bigIdea: 'Human impact', essentialQuestion: 'How healthy is our watershed?', challenge: 'Present a data-backed recommendation', subjects: ['science','math'], primarySubject: 'science', duration: 'long' },
    { projectTopic: 'Media Messages', bigIdea: 'Persuasion', essentialQuestion: 'How do ads influence us?', challenge: 'Create an ad literacy toolkit', subjects: ['language-arts','technology'], primarySubject: 'language-arts', duration: 'short' },
    { projectTopic: 'Community Mapping', bigIdea: 'Civic awareness', essentialQuestion: 'Where are resources and gaps?', challenge: 'Publish a community resource map', subjects: ['social-studies','technology'], primarySubject: 'social-studies', duration: 'medium' },
  ],
  'upper-secondary': [
    { projectTopic: 'Data Journalism', bigIdea: 'Data as evidence', essentialQuestion: 'How do numbers reveal stories?', challenge: 'Publish a short data story', subjects: ['mathematics','language-arts','social-studies'], primarySubject: 'mathematics', duration: 'long' },
    { projectTopic: 'Civic Media Literacy', bigIdea: 'Truth and evidence', essentialQuestion: 'Which claims are trustworthy?', challenge: 'Publish a fact-check brief', subjects: ['language-arts','social-studies','mathematics'], primarySubject: 'language-arts', duration: 'medium' },
    { projectTopic: 'Sustainable Design', bigIdea: 'Design thinking', essentialQuestion: 'How might we reduce waste?', challenge: 'Prototype a sustainability solution', subjects: ['engineering','science','technology'], primarySubject: 'engineering', duration: 'long' },
    { projectTopic: 'Public Health Dashboards', bigIdea: 'Data for good', essentialQuestion: 'How can data guide action?', challenge: 'Build an insights dashboard', subjects: ['technology','mathematics'], primarySubject: 'technology', duration: 'long' },
    { projectTopic: 'Community Economics', bigIdea: 'Systems and trade-offs', essentialQuestion: 'What helps local economies thrive?', challenge: 'Write a policy brief', subjects: ['social-studies','mathematics'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'STEM Mentorship', bigIdea: 'Learning communities', essentialQuestion: 'How do we broaden access?', challenge: 'Design a peer mentorship program', subjects: ['engineering','social-studies'], primarySubject: 'social-studies', duration: 'medium' },
  ],
  'higher-ed': [
    { projectTopic: 'Assistive Tech Prototype', bigIdea: 'Design for accessibility', essentialQuestion: 'How can we reduce barriers?', challenge: 'Prototype and test with users', subjects: ['engineering','technology'], primarySubject: 'engineering', duration: 'long' },
    { projectTopic: 'Social Impact Visualization', bigIdea: 'Design communicates values', essentialQuestion: 'How can we visualize data to drive action?', challenge: 'Build a stakeholder dashboard', subjects: ['technology','mathematics','social-studies'], primarySubject: 'technology', duration: 'long' },
    { projectTopic: 'Community Research', bigIdea: 'Participatory inquiry', essentialQuestion: 'What does the community need?', challenge: 'Publish a research brief', subjects: ['social-studies'], primarySubject: 'social-studies', duration: 'long' },
    { projectTopic: 'Sustainable Campus', bigIdea: 'Organizational change', essentialQuestion: 'Where can we improve?', challenge: 'Propose a campus initiative', subjects: ['engineering','science'], primarySubject: 'engineering', duration: 'medium' },
    { projectTopic: 'EdTech Evaluation', bigIdea: 'Evidence-based practice', essentialQuestion: 'What tools actually help?', challenge: 'Run a comparative evaluation', subjects: ['technology','education'], primarySubject: 'technology', duration: 'medium' },
    { projectTopic: 'Design Ethics', bigIdea: 'Impact and responsibility', essentialQuestion: 'What are ethical trade-offs?', challenge: 'Write guidance for a partner', subjects: ['social-studies','technology'], primarySubject: 'social-studies', duration: 'short' },
  ],
  'adult': [
    { projectTopic: 'Workplace Wellness', bigIdea: 'Preventive health', essentialQuestion: 'How can we promote wellness at work?', challenge: 'Launch a micro‑campaign', subjects: ['health','language-arts','technology'], primarySubject: 'health', duration: 'medium' },
    { projectTopic: 'Digital Skills Upgrade', bigIdea: 'Lifelong learning', essentialQuestion: 'Which skills unlock opportunities?', challenge: 'Design a learning sprint', subjects: ['technology'], primarySubject: 'technology', duration: 'short' },
    { projectTopic: 'Community Outreach', bigIdea: 'Civic engagement', essentialQuestion: 'How do we increase participation?', challenge: 'Plan and run an event', subjects: ['social-studies','language-arts'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'Sustainable Households', bigIdea: 'Behavior change', essentialQuestion: 'How do small changes add up?', challenge: 'Create a home action plan', subjects: ['science','health'], primarySubject: 'science', duration: 'short' },
    { projectTopic: 'Financial Literacy', bigIdea: 'Informed decisions', essentialQuestion: 'How can budgeting reduce stress?', challenge: 'Build a budgeting toolkit', subjects: ['mathematics','social-studies'], primarySubject: 'mathematics', duration: 'short' },
    { projectTopic: 'Community Data Story', bigIdea: 'Narrative with data', essentialQuestion: 'Which local issues need attention?', challenge: 'Publish a short data story', subjects: ['mathematics','language-arts'], primarySubject: 'mathematics', duration: 'medium' },
  ],
};

function buildBlueprintFromCatalog(id: string, userId: string, gradeLevel: string, item: CatalogItem): SampleBlueprint {
  const short = item.duration !== 'long';
  return {
    id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData: {
      projectTopic: item.projectTopic,
      learningGoals: 'Contextual inquiry, communication, iteration',
      entryPoint: 'learning_goal',
      subjects: item.subjects,
      primarySubject: item.primarySubject,
      gradeLevel,
      duration: item.duration,
      materials: item.materials || '',
      location: 'classroom',
    },
    ideation: {
      bigIdea: item.bigIdea,
      essentialQuestion: item.essentialQuestion,
      challenge: item.challenge,
    },
    journey: baseJourney(short),
    deliverables: {
      milestones: ['Checkpoint 1', 'Checkpoint 2', 'Checkpoint 3'],
      rubric: { criteria: ['Understanding', 'Reasoning', 'Communication', 'Impact'] },
      impact: { audience: 'Peers/stakeholders', method: 'Share/review' },
    },
    sample: true,
  };
}

export function getAllSampleBlueprints(userId: string = 'anonymous'): SampleBlueprint[] {
  // Stable IDs so routes like /app/samples/:id work across reloads
  const out: SampleBlueprint[] = [];
  // Prepend a fully‑fleshed "hero" sample to showcase end result
  out.push(buildHeroSample(userId));
  (Object.keys(catalog) as Array<keyof typeof catalog>).forEach((grade) => {
    catalog[grade].forEach((item, idx) => {
      const id = `sample-${grade}-${idx}`;
      out.push(buildBlueprintFromCatalog(id, userId, grade, item));
    });
  });
  return out;
}

// A fully detailed sample to demonstrate the app's end result
function buildHeroSample(userId: string): SampleBlueprint {
  const id = 'sample-featured-sustainability-campaign';

  const wizardData = {
    projectTopic: 'Campus Sustainability Initiative: From Data to Policy Change',
    learningGoals: 'Systems thinking, environmental science, policy analysis, data science, community organizing, strategic communication, collaborative leadership, ethical reasoning',
    entryPoint: 'authentic_problem',
    subjects: ['science', 'social-studies', 'language-arts', 'mathematics', 'technology', 'arts'],
    primarySubject: 'science',
    gradeLevel: 'upper-secondary',
    duration: 'long',
    materials: 'Digital scales, sorting equipment, water testing kits, laptops/tablets, presentation technology, poster materials, video equipment, survey platforms, data visualization software',
    subject: 'Environmental Science, Social Studies, Statistics, ELA, Digital Media',
    location: 'school campus, community sites, city hall, local businesses',
    featured: true,
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
    investigate: {
      goal: 'Conduct comprehensive environmental systems analysis',
      activity: 'Multi-method research: quantitative audits, stakeholder interviews, policy analysis, comparative studies with other institutions',
      output: 'Systems analysis report with data dashboard, policy landscape mapping, and evidence-based problem statement',
      duration: '2-3 weeks',
      interdisciplinary: {
        science: 'Environmental sampling, materials analysis, ecosystem impact assessment, carbon footprint calculations',
        mathematics: 'Statistical analysis, trend identification, cost-benefit modeling, data visualization',
        socialStudies: 'Policy research, institutional analysis, environmental justice investigation, community stakeholder mapping',
        languageArts: 'Research synthesis, interview protocols, report writing, literature review'
      }
    },
    strategize: {
      goal: 'Develop evidence-based intervention strategies with community input',
      activity: 'Community design sessions, expert consultations, policy option analysis, pilot program development',
      output: 'Strategic intervention plan with community partnership agreements and pilot implementation roadmap',
      duration: '2 weeks',
      interdisciplinary: {
        socialStudies: 'Policy analysis, stakeholder negotiation, community organizing principles',
        arts: 'Design thinking facilitation, visual communication strategy, community engagement design',
        languageArts: 'Proposal writing, grant applications, strategic communication planning',
        technology: 'Digital platform design, data collection system development'
      }
    },
    implement: {
      goal: 'Execute pilot interventions with embedded evaluation',
      activity: 'Deploy multi-faceted interventions: behavior change campaigns, policy proposals, infrastructure pilots, community education',
      output: 'Active pilot programs with real-time data collection, community engagement metrics, and iterative improvement protocols',
      duration: '3-4 weeks',
      interdisciplinary: {
        technology: 'App/platform development, digital campaign execution, data analytics dashboard creation',
        arts: 'Media production, campaign asset creation, community art installations',
        mathematics: 'Real-time data analysis, A/B testing, statistical monitoring',
        science: 'Environmental monitoring, intervention effectiveness measurement'
      }
    },
    advocate: {
      goal: 'Scale solutions through policy advocacy and community mobilization',
      activity: 'Present to decision-makers, facilitate community adoption, create replication toolkit, establish monitoring systems',
      output: 'Policy presentations, community replication guide, long-term impact monitoring system, and institutional change documentation',
      duration: '2-3 weeks',
      interdisciplinary: {
        languageArts: 'Policy brief writing, presentation development, media kit creation',
        socialStudies: 'Civic engagement, institutional change analysis, policy impact assessment',
        mathematics: 'Long-term trend analysis, cost-benefit presentations, impact projections',
        arts: 'Documentary production, impact storytelling, community celebration events'
      }
    },
    authenticActivities: [
      'Partner with city sustainability office to conduct comparative institutional analysis',
      'Design and implement comprehensive campus environmental audit (waste, energy, water, transportation)',
      'Interview community leaders, environmental scientists, policy makers, and business owners',
      'Collaborate with local environmental organizations on research methodologies',
      'Present preliminary findings to school board and seek input on policy recommendations',
      'Facilitate community stakeholder design sessions for intervention planning',
      'Develop and beta-test digital tools for behavior tracking and community engagement',
      'Create multimedia impact stories featuring community voices and data visualizations',
      'Present final recommendations to city council sustainability committee',
      'Establish ongoing monitoring and evaluation systems with institutional partners'
    ],
    professionalResources: [
      'EPA Environmental Education resources and data sets',
      'Local government sustainability plans and climate action documents',
      'University extension environmental science research and faculty consultations',
      'Professional data visualization tools (Tableau Public, R/Python for advanced students)',
      'Grant writing resources and templates from environmental foundations',
      'Policy analysis frameworks from civic engagement organizations',
      'Community organizing toolkits from environmental justice groups',
      'Digital storytelling platforms and multimedia production software'
    ],
    communityConnections: {
      mentors: [
        'Environmental scientists from local universities or research institutions',
        'City sustainability coordinators and urban planners',
        'Environmental nonprofit organization staff and volunteers',
        'Green business owners and corporate sustainability managers',
        'Environmental law attorneys and policy advocates'
      ],
      partnerships: [
        'City environmental department for policy research and presentation opportunities',
        'Local environmental organizations for research collaboration and expertise',
        'Waste management companies for industry perspective and data access',
        'Other schools and youth organizations for comparative studies and coalition building',
        'Parent and community groups for implementation support and broader reach'
      ],
      presentations: [
        'School board meeting presentation on policy recommendations',
        'City council sustainability committee briefing',
        'Community environmental fair booth and presentation',
        'Local environmental organization conference or event',
        'Regional student environmental action summit or conference'
      ]
    }
  };

  const deliverables = {
    portfolioComponents: [
      { 
        title: 'Environmental Systems Analysis Portfolio',
        description: 'Comprehensive research documentation including methodology, data analysis, stakeholder interviews, and systems mapping',
        assessmentType: 'Formative and summative with peer review',
        audience: 'Scientific community, policy makers, community stakeholders'
      },
      {
        title: 'Community Engagement Documentation',
        description: 'Evidence of authentic collaboration including partnership agreements, meeting documentation, and stakeholder feedback',
        assessmentType: 'Self-reflection with mentor validation',
        audience: 'Community partners, school administration'
      },
      {
        title: 'Policy Recommendation Brief',
        description: 'Professional-quality policy analysis with evidence-based recommendations and implementation roadmap',
        assessmentType: 'External review by policy professionals',
        audience: 'School board, city council, institutional decision-makers'
      },
      {
        title: 'Impact Measurement Dashboard',
        description: 'Interactive data visualization showing intervention effectiveness and long-term monitoring systems',
        assessmentType: 'Technical review and community feedback',
        audience: 'Data science community, environmental advocates, institutional partners'
      },
      {
        title: 'Replication Toolkit',
        description: 'Resources for other communities to implement similar initiatives including guides, templates, and lessons learned',
        assessmentType: 'Usability testing with other student groups',
        audience: 'Educational community, youth environmental networks'
      }
    ],
    authenticAssessment: {
      externalReviewers: [
        'Environmental science professors for research methodology and analysis',
        'Policy professionals for recommendation quality and feasibility',
        'Community organization leaders for engagement and impact assessment',
        'Data visualization experts for technical implementation review',
        'Youth environmental advocates for peer perspective and replication potential'
      ],
      communityFeedback: {
        mechanisms: ['Community forums', 'Online surveys', 'Focus groups', 'Social media engagement', 'Public presentations'],
        criteria: ['Relevance to community needs', 'Clarity of communication', 'Feasibility of recommendations', 'Engagement and inspiration']
      },
      peerReview: {
        structure: 'Critical friends protocol with structured feedback forms',
        frequency: 'Weekly checkpoint reviews plus major milestone critiques',
        focus: ['Research quality', 'Community engagement authenticity', 'Solution feasibility', 'Communication effectiveness']
      }
    },
    performanceRubric: {
      criteria: [
        { 
          criterion: 'Systems Thinking',
          weight: 25,
          description: 'Demonstrates understanding of interconnected environmental, social, and economic factors',
          levels: {
            'Developing': 'Identifies individual components but limited connections',
            'Proficient': 'Shows clear understanding of system relationships and feedback loops',
            'Advanced': 'Analyzes complex interactions and predicts systemic impacts',
            'Expert': 'Synthesizes multiple systems perspectives and identifies leverage points for change'
          }
        },
        {
          criterion: 'Research Quality',
          weight: 25,
          description: 'Employs rigorous research methods with appropriate analysis and interpretation',
          levels: {
            'Developing': 'Basic data collection with some analysis',
            'Proficient': 'Systematic methodology with accurate analysis and valid conclusions',
            'Advanced': 'Sophisticated multi-method approach with nuanced interpretation',
            'Expert': 'Professional-grade research contributing new insights to the field'
          }
        },
        {
          criterion: 'Community Engagement',
          weight: 25,
          description: 'Builds authentic partnerships and incorporates diverse community perspectives',
          levels: {
            'Developing': 'Limited stakeholder input with basic community connection',
            'Proficient': 'Meaningful partnerships with documented community input',
            'Advanced': 'Deep collaboration with shared decision-making and mutual benefit',
            'Expert': 'Exemplary partnership model that empowers community voice and leadership'
          }
        },
        {
          criterion: 'Impact and Sustainability',
          weight: 25,
          description: 'Creates measurable change with systems for long-term continuation',
          levels: {
            'Developing': 'Limited evidence of short-term change',
            'Proficient': 'Clear measurement of impact with some sustainability planning',
            'Advanced': 'Significant measurable impact with robust continuation systems',
            'Expert': 'Transformative change with institutionalized sustainability mechanisms'
          }
        }
      ]
    },
    publicProducts: {
      requiredOutputs: [
        'Policy brief presented to institutional decision-makers',
        'Community presentation with Q&A session',
        'Digital impact story published on institutional website',
        'Replication toolkit shared with partner organizations'
      ],
      optionalShowcase: [
        'Research poster at regional environmental conference',
        'Documentary film screening and community discussion',
        'Policy simulation or town hall facilitation',
        'Mentorship of incoming students on environmental action'
      ]
    }
  };

  const assignments = [
    {
      phase: 'investigate',
      title: 'Environmental Systems Research & Community Analysis',
      duration: '2-3 weeks',
      objectives: [
        'Design and conduct comprehensive environmental systems analysis using multiple research methodologies',
        'Build authentic relationships with community stakeholders through structured engagement processes',
        'Synthesize quantitative and qualitative data to identify leverage points for systemic change',
        'Develop professional research skills applicable to environmental science and policy careers'
      ],
      standards: {
        NGSS: ['HS-ESS3-4', 'HS-ETS1-1', 'HS-LS2-7'],
        ELA: ['CCSS.ELA-LITERACY.W.11-12.7', 'SL.11-12.4', 'RST.11-12.7'],
        C3: ['D4.2.9-12', 'D1.2.9-12', 'D2.2.9-12'],
        Statistics: ['S-IC.3', 'S-ID.6', 'S-ID.7']
      },
      communityConnections: {
        mentors: ['Environmental scientist from local university', 'City sustainability coordinator', 'Local environmental organization staff'],
        partnerships: ['Campus facilities management', 'Local waste management company', 'Environmental nonprofit organization'],
        authenticity: 'Research will inform actual institutional policy decisions and community action plans'
      },
      differentiatedPathways: [
        {
          pathway: 'Data Science Track',
          focus: 'Advanced quantitative analysis and visualization',
          activities: ['Statistical modeling of environmental impact', 'Predictive analytics for behavior change', 'Interactive dashboard development'],
          supports: ['R/Python tutorials', 'Statistical consulting sessions', 'Data visualization mentorship']
        },
        {
          pathway: 'Policy Analysis Track', 
          focus: 'Institutional analysis and policy development',
          activities: ['Comparative policy research', 'Stakeholder power mapping', 'Policy recommendation development'],
          supports: ['Policy analysis frameworks', 'Government meetings observation', 'Policy professional mentorship']
        },
        {
          pathway: 'Community Organizing Track',
          focus: 'Stakeholder engagement and coalition building',
          activities: ['Community asset mapping', 'Stakeholder interview campaigns', 'Coalition building strategies'],
          supports: ['Community organizing training', 'Interview skill workshops', 'Community leader mentorship']
        },
        {
          pathway: 'Scientific Research Track',
          focus: 'Environmental science investigation and analysis',
          activities: ['Environmental sampling and testing', 'Ecosystem impact analysis', 'Laboratory analysis protocols'],
          supports: ['Lab technique training', 'Scientific method workshops', 'Research scientist mentorship']
        }
      ],
      udlDesign: {
        representation: [
          'Multi-modal research examples (text, video, infographic, podcast)',
          'Flexible research templates with varying complexity levels',
          'Visual frameworks for systems thinking and stakeholder mapping',
          'Choice of information sources including academic, popular, and community-based'
        ],
        engagement: [
          'Student choice in focus area and research questions within project scope',
          'Authentic community problems with real stakes and decision-makers',
          'Collaborative team formation based on interests and complementary skills',
          'Regular community feedback and mentorship throughout process'
        ],
        expression: [
          'Multiple formats for presenting research (report, presentation, infographic, policy brief, video)',
          'Various roles within research teams based on strengths and interests',
          'Choice of tools and platforms for data collection and analysis',
          'Flexible timeline accommodating different research depths and approaches'
        ]
      },
      inclusivitySupports: [
        'Research topics connect to students lived experiences and community contexts',
        'Community partner selection includes diverse perspectives and backgrounds',
        'Language support for interviews and research synthesis',
        'Technology access and digital literacy support as needed',
        'Flexible grouping that honors different cultural approaches to collaboration'
      ],
      deliverable: 'Environmental Systems Analysis Portfolio with community stakeholder validation'
    },
    {
      phase: 'strategize',
      title: 'Collaborative Solution Design & Community Partnership Development',
      duration: '2 weeks',
      objectives: [
        'Facilitate inclusive community design sessions using design thinking methodologies',
        'Develop strategic intervention plans that address root causes identified in research phase',
        'Build authentic partnerships with community stakeholders through co-design processes',
        'Create implementation roadmaps that account for institutional constraints and community assets'
      ],
      standards: {
        NGSS: ['HS-ETS1-2', 'HS-ETS1-4'],
        ELA: ['CCSS.ELA-LITERACY.SL.11-12.1', 'W.11-12.4', 'SL.11-12.1.d'],
        ISTE: ['1.4 Innovative Designer', '1.6 Creative Communicator', '1.7 Global Collaborator']
      },
      technologyIntegration: {
        digitalTools: [
          'Collaborative design platforms (Miro, Figma, or Jamboard) for virtual brainstorming',
          'Survey and polling tools (Google Forms, Mentimeter) for community input collection',
          'Video conferencing tools for remote stakeholder engagement',
          'Project management platforms (Trello, Asana) for partnership coordination'
        ],
        digitalLiteracy: [
          'Digital collaboration skills and online facilitation techniques',
          'Data privacy and ethical considerations in community engagement',
          'Digital storytelling and multimedia communication skills',
          'Platform selection based on accessibility and community needs'
        ]
      },
      communityEngagement: {
        stakeholderSessions: [
          'Student focus groups facilitated using human-centered design protocols',
          'Staff and faculty feedback sessions with structured input processes',
          'Community partner co-design workshops with professional facilitation support',
          'Alumni and family engagement sessions to expand implementation capacity'
        ],
        partnershipDevelopment: [
          'Formal partnership agreements with roles, responsibilities, and success metrics',
          'Communication protocols and regular check-in schedules',
          'Resource sharing agreements and mutual benefit identification',
          'Conflict resolution processes and partnership sustainability planning'
        ]
      },
      differentiatedOutcomes: [
        'Multiple intervention strategies addressing different aspects of the environmental challenge',
        'Various scales of implementation from individual behavior to institutional policy',
        'Different communication approaches tailored to diverse community audiences',
        'Varied timeline options accommodating different partnership and resource contexts'
      ],
      deliverable: 'Strategic Intervention Plan with Community Partnership Portfolio'
    },
    {
      phase: 'implement',
      title: 'Multi-Platform Implementation with Embedded Evaluation',
      duration: '3-4 weeks',
      objectives: [
        'Execute comprehensive intervention strategy across multiple platforms and channels',
        'Integrate real-time data collection and community feedback systems',
        'Adapt and iterate interventions based on evidence and stakeholder input',
        'Build sustainable systems for long-term impact measurement and community engagement'
      ],
      standards: {
        NGSS: ['HS-ETS1-3', 'HS-ESS3-2'],
        ELA: ['W.11-12.6', 'SL.11-12.5', 'SL.11-12.6'],
        ISTE: ['1.1 Empowered Learner', '1.3 Knowledge Constructor', '1.5 Computational Thinker']
      },
      technologyIntegration: {
        platforms: [
          'Interactive data dashboards using Google Data Studio or Tableau Public',
          'Mobile app development for behavior tracking and community engagement',
          'Social media campaign management across Instagram, TikTok, and school platforms',
          'Digital storytelling tools including video editing, podcast production, and interactive media'
        ],
        analyticsAndEvaluation: [
          'A/B testing frameworks for intervention comparison',
          'Real-time data visualization for community feedback and transparency',
          'Geographic information systems (GIS) for spatial analysis of environmental impact',
          'Survey platforms with advanced analytics for community sentiment tracking'
        ]
      },
      professionalPractices: [
        'Agile project management methodologies with sprint cycles and retrospectives',
        'Quality assurance protocols including accessibility testing and stakeholder review',
        'Risk management planning with contingency strategies for implementation challenges',
        'Documentation practices for replication and sustainability planning'
      ],
      deliverable: 'Implementation Portfolio with Real-Time Impact Monitoring System'
    },
    {
      phase: 'advocate',
      title: 'Policy Advocacy & Community Mobilization Campaign',
      duration: '2-3 weeks',
      objectives: [
        'Present evidence-based policy recommendations to institutional decision-makers',
        'Facilitate community mobilization around environmental action',
        'Create systems for ongoing advocacy and institutional accountability',
        'Develop replication resources for broader environmental justice movement'
      ],
      standards: {
        ELA: ['SL.11-12.4', 'W.11-12.2', 'W.11-12.1'],
        C3: ['D4.3.9-12', 'D4.4.9-12', 'D1.4.9-12'],
        ISTE: ['1.6 Creative Communicator', '1.7 Global Collaborator']
      },
      civicEngagement: {
        policyPresentation: [
          'School board presentation with policy brief and implementation timeline',
          'City council public comment with data-driven recommendations',
          'Community forum facilitation for ongoing advocacy planning',
          'Media interviews and press release development for broader impact'
        ],
        communityMobilization: [
          'Coalition building with existing environmental and community organizations',
          'Peer education campaign development for sustained behavior change',
          'Alumni and family engagement strategy for extended community reach',
          'Social movement analysis and strategic action planning'
        ]
      },
      sustainabilityPlanning: {
        institutionalization: [
          'Policy proposal integration into institutional strategic planning processes',
          'Training protocols for incoming students and ongoing program continuation',
          'Monitoring and evaluation systems embedded in institutional operations',
          'Community partnership agreements for ongoing collaboration and accountability'
        ]
      },
      deliverable: 'Policy Advocacy Portfolio with Community Mobilization Documentation'
    }
  ];

  const alignment = {
    NGSS: [
      { code: 'HS-ESS3-4', text: 'Evaluate or refine a technological solution that reduces impacts of human activities on natural systems.' },
      { code: 'HS-ETS1-1', text: 'Analyze a major global challenge to specify qualitative and quantitative criteria and constraints for solutions.' },
      { code: 'HS-ETS1-2', text: 'Design a solution by breaking down a complex problem into smaller, manageable problems.' },
      { code: 'HS-ETS1-3', text: 'Evaluate a solution to a complex problem based on prioritized criteria and trade-offs.' },
      { code: 'HS-ETS1-4', text: 'Use a computer simulation to model the impacts of proposed solutions.' },
      { code: 'HS-LS2-7', text: 'Design, evaluate, and refine a solution for reducing the impacts of human activities on the environment.' },
      { code: 'HS-ESS3-2', text: 'Evaluate a technological solution to a complex real-world problem.' }
    ],
    ELA: [
      { code: 'W.11-12.7', text: 'Conduct sustained research projects to answer a question or solve a problem.' },
      { code: 'SL.11-12.4', text: 'Present information, findings, and evidence clearly and logically.' },
      { code: 'W.11-12.1', text: 'Write arguments to support claims in an analysis using valid reasoning and evidence.' },
      { code: 'W.11-12.2', text: 'Write informative/explanatory texts to examine and convey complex ideas and information clearly.' },
      { code: 'SL.11-12.1', text: 'Initiate and participate effectively in collaborative discussions.' },
      { code: 'SL.11-12.5', text: 'Make strategic use of digital media in presentations.' },
      { code: 'RST.11-12.7', text: 'Integrate and evaluate multiple sources of information in diverse formats and media.' }
    ],
    C3: [
      { code: 'D1.2.9-12', text: 'Generate compelling questions that reflect enduring issues and concerns.' },
      { code: 'D2.2.9-12', text: 'Evaluate the credibility of a source by examining how experts value the source.' },
      { code: 'D4.2.9-12', text: 'Construct explanations and design solutions using reasoning, correct sequence, examples and details.' },
      { code: 'D4.3.9-12', text: 'Present adaptations of arguments and explanations for a range of audiences.' },
      { code: 'D4.4.9-12', text: 'Critique the use of claims and evidence to determine the credibility of explanations.' },
      { code: 'D1.4.9-12', text: 'Explain how a question reflects enduring issues and concerns.' }
    ],
    ISTE: [
      { code: '1.1', text: 'Empowered Learner: Students leverage technology to take an active role in choosing, achieving and demonstrating competency.' },
      { code: '1.3', text: 'Knowledge Constructor: Students critically curate a variety of resources using digital tools.' },
      { code: '1.4', text: 'Innovative Designer: Students use a variety of technologies to solve problems by creating new solutions.' },
      { code: '1.5', text: 'Computational Thinker: Students develop and employ strategies for understanding complex problems.' },
      { code: '1.6', text: 'Creative Communicator: Students communicate clearly using a variety of platforms and media.' },
      { code: '1.7', text: 'Global Collaborator: Students use digital tools to broaden their perspectives through collaboration.' }
    ],
    Statistics: [
      { code: 'S-IC.3', text: 'Recognize the purposes of and differences among sample surveys, experiments, and observational studies.' },
      { code: 'S-ID.6', text: 'Represent data on two quantitative variables and describe the relationship between the variables.' },
      { code: 'S-ID.7', text: 'Interpret the slope and the intercept of a linear fit in the context of the data.' }
    ],
    SEL: [
      { code: 'Self-Management', text: 'Working toward goals and exhibiting self-discipline and self-motivation.' },
      { code: 'Social Awareness', text: 'Taking others perspectives and empathizing with others from diverse backgrounds.' },
      { code: 'Relationship Skills', text: 'Establishing and maintaining healthy relationships and effectively navigating settings with diverse individuals.' },
      { code: 'Responsible Decision-Making', text: 'Making ethical, constructive choices about personal and social behavior.' }
    ]
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
    assignments,
    alignment,
    sample: true,
  };
}
