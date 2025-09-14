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
    status: 'complete',
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
        name: 'Discover',
        description: 'Explore the problem space and build foundational understanding',
        goal: 'Develop deep understanding of environmental challenges through research and observation',
        keyQuestion: 'What is really happening with sustainability in our school and community?',
        activities: [
          'Conduct waste audits at different times/locations',
          'Shadow facilities staff to understand systems',
          'Research best practices from other schools',
          'Survey students and staff about behaviors',
          'Analyze utility bills and consumption data',
          'Map current sustainability initiatives'
        ],
        studentChoice: 'Students choose their research focus area and methods',
        output: 'Comprehensive baseline assessment with data visualizations',
        duration: '2-3 weeks',
        formativeAssessment: 'Research journal, peer review of data collection methods, teacher check-ins'
      },
      {
        id: 'phase-2',
        name: 'Define',
        description: 'Synthesize findings and frame the specific challenge',
        goal: 'Transform research into clear problem statements and opportunity areas',
        keyQuestion: 'What specific problem will create the most meaningful impact if solved?',
        activities: [
          'Analyze and synthesize all research data',
          'Identify patterns and root causes',
          'Prioritize problems by impact and feasibility',
          'Develop problem statements and hypotheses',
          'Map stakeholders and their interests',
          'Create journey maps of current state'
        ],
        studentChoice: 'Teams select their specific problem focus based on research',
        output: 'Problem definition packet with stakeholder map and opportunity areas',
        duration: '1-2 weeks',
        formativeAssessment: 'Problem statement workshop, stakeholder analysis rubric'
      },
      {
        id: 'phase-3',
        name: 'Develop',
        description: 'Generate and prototype potential solutions',
        goal: 'Create innovative, feasible solutions through iterative design',
        keyQuestion: 'How might we solve this problem in a way that works for everyone?',
        activities: [
          'Brainstorm solutions without constraints',
          'Research case studies of similar solutions',
          'Create prototypes or models',
          'Test solutions with small groups',
          'Calculate costs and benefits',
          'Get feedback from stakeholders',
          'Refine based on feedback'
        ],
        studentChoice: 'Teams choose solution approach and testing methods',
        output: 'Solution portfolio with prototypes, testing data, and refinement documentation',
        duration: '2-3 weeks',
        formativeAssessment: 'Prototype presentations, peer feedback sessions, feasibility checklist'
      },
      {
        id: 'phase-4',
        name: 'Deliver',
        description: 'Implement solutions and share with authentic audiences',
        goal: 'Create real change through implementation and advocacy',
        keyQuestion: 'How do we turn our ideas into lasting impact?',
        activities: [
          'Launch pilot implementation',
          'Collect impact data',
          'Document the process',
          'Prepare presentations for different audiences',
          'Present to decision-makers',
          'Create sustainability toolkit for others',
          'Plan for project continuation'
        ],
        studentChoice: 'Teams choose presentation format and advocacy approach',
        output: 'Implementation results, formal presentations, and sustainability plan',
        duration: '3-4 weeks',
        formativeAssessment: 'Implementation journal, presentation rehearsals, impact metrics tracking'
      }
    ],
    framework: 'This learning journey follows a modified Design Thinking process (Discover, Define, Develop, Deliver) adapted for educational contexts. This framework ensures students engage in authentic problem-solving while building critical thinking, creativity, and communication skills.',
    scaffolding: [
      'Teacher models research methods in Phase 1, gradually releases responsibility',
      'Provide templates and exemplars early, remove scaffolds as students gain confidence',
      'Structured collaboration protocols evolve into student-led teamwork',
      'Feedback cycles become increasingly peer-driven',
      'Assessment moves from teacher-centered to self and peer assessment'
    ],
    differentiation: [
      'Multiple entry points for different skill levels',
      'Choice in research methods and presentation formats',
      'Flexible grouping based on interests and strengths',
      'Extension opportunities for advanced learners',
      'Support resources for struggling students'
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
      { 
        name: 'EPA School Sustainability Toolkit', 
        type: 'Teacher-Provided Resource',
        description: 'Comprehensive guide with audit templates and best practices',
        url: 'https://www.epa.gov/schools',
        when: 'Introduce during Phase 1 for baseline assessment'
      },
      { 
        name: 'Local Sustainability Data Dashboard', 
        type: 'Student-Found Resource',
        description: 'City/county environmental data that students discover through research',
        url: 'Varies by location',
        when: 'Students find during stakeholder research in Phase 2'
      },
      { 
        name: 'Interview Protocol Template', 
        type: 'ALF-Generated Resource',
        description: 'Customized interview questions based on project focus',
        url: 'Generated through ALF Coach chat',
        when: 'Created with ALF during planning phase'
      },
      { 
        name: 'Data Visualization Tools', 
        type: 'Technology Tool',
        description: 'Google Sheets, Canva, or Tableau for creating charts',
        url: 'Free online tools',
        when: 'Used throughout for data presentation'
      },
      { 
        name: 'Policy Brief Examples', 
        type: 'Teacher-Curated Examples',
        description: 'Sample policy briefs from similar student projects',
        url: 'Collected from previous years or other schools',
        when: 'Shared in Phase 4 as models'
      },
      { 
        name: 'Community Partner Database', 
        type: 'Class-Built Resource',
        description: 'Shared spreadsheet of contacts that grows over time',
        url: 'Created collaboratively',
        when: 'Built throughout project, becomes resource for future classes'
      },
      { 
        name: 'Presentation Rubric', 
        type: 'ALF-Generated Assessment',
        description: 'Detailed rubric for final presentations',
        url: 'Customized through ALF Coach',
        when: 'Generated before Phase 4 to guide preparation'
      },
      { 
        name: 'Project Website Template', 
        type: 'Digital Platform',
        description: 'Google Sites or similar for showcasing work',
        url: 'Free website builders',
        when: 'Set up in Phase 1, updated throughout'
      }
    ],
    resourcesExplanation: {
      teacherProvided: 'Foundational resources that establish common knowledge base and methods',
      studentFound: 'Resources discovered through research that make learning authentic and contextual',
      alfGenerated: 'Customized materials created through AI assistance based on specific project needs',
      collaborative: 'Resources built together that become living documents and future assets',
      howAlfHelps: 'ALF Coach can generate customized templates, rubrics, interview questions, and assessment tools based on your specific project focus, grade level, and learning objectives. It adapts these resources to your local context and standards alignment needs.'
    }
  };

  const deliverables = {
    milestones: [
      { 
        id: 'm1', 
        name: 'Environmental Baseline Assessment', 
        description: 'Complete comprehensive audit of current sustainability practices',
        deliverable: 'Written report (10-15 pages) with data visualizations showing waste generation patterns, energy consumption metrics, and water usage analysis',
        successCriteria: [
          'Collect data from at least 5 different campus locations',
          'Survey minimum 100 students/staff about sustainability practices',
          'Document baseline metrics for 3+ environmental indicators',
          'Create visual dashboard of findings using charts/infographics'
        ],
        timeline: 'Weeks 1-3',
        studentProducts: ['Data collection sheets', 'Survey instruments', 'Analysis spreadsheets', 'Baseline report with graphics']
      },
      { 
        id: 'm2', 
        name: 'Stakeholder Mapping & Engagement', 
        description: 'Identify and connect with key community partners',
        deliverable: 'Stakeholder engagement portfolio including contact database, meeting notes, and partnership agreements',
        successCriteria: [
          'Interview at least 8 stakeholders from different sectors',
          'Secure 3+ formal partnership commitments',
          'Create stakeholder influence/interest matrix',
          'Document all engagement in shared project log'
        ],
        timeline: 'Weeks 2-4',
        studentProducts: ['Interview transcripts', 'Stakeholder map', 'Partnership MOUs', 'Communication log']
      },
      { 
        id: 'm3', 
        name: 'Solution Design & Prototype', 
        description: 'Develop and test intervention strategies',
        deliverable: 'Design portfolio with 3-5 prototype solutions, testing protocols, and feasibility analysis',
        successCriteria: [
          'Generate 10+ initial solution ideas through brainstorming',
          'Develop detailed plans for top 3 solutions',
          'Test at least 1 prototype with target users',
          'Calculate cost-benefit analysis for each solution'
        ],
        timeline: 'Weeks 4-6',
        studentProducts: ['Design sketches', 'Prototype models/demos', 'Testing data', 'Feasibility reports']
      },
      { 
        id: 'm4', 
        name: 'Pilot Implementation', 
        description: 'Launch and monitor small-scale intervention',
        deliverable: 'Implementation documentation including process maps, photo/video evidence, and weekly progress reports',
        successCriteria: [
          'Launch pilot for minimum 2 weeks',
          'Engage at least 50 participants',
          'Collect quantitative and qualitative feedback',
          'Document challenges and adaptations made'
        ],
        timeline: 'Weeks 6-8',
        studentProducts: ['Implementation plan', 'Progress tracking sheets', 'Photo/video documentation', 'Participant feedback forms']
      },
      { 
        id: 'm5', 
        name: 'Impact Analysis & Reporting', 
        description: 'Measure and document project outcomes',
        deliverable: 'Comprehensive impact report with data analysis, visualizations, and evidence of change',
        successCriteria: [
          'Compare pre/post metrics for key indicators',
          'Analyze feedback from 30+ participants',
          'Document 3+ specific improvements/changes',
          'Create compelling data visualizations'
        ],
        timeline: 'Weeks 8-9',
        studentProducts: ['Data analysis', 'Impact charts/graphs', 'Testimonial collection', 'Change documentation']
      },
      { 
        id: 'm6', 
        name: 'Public Presentation & Advocacy', 
        description: 'Share findings with authentic audiences',
        deliverable: 'Professional presentation package including slides, speaking notes, handouts, and recorded presentation',
        successCriteria: [
          'Present to school board or city council',
          'Reach 100+ community members',
          'Receive formal response from decision-makers',
          'Generate media coverage or social media engagement'
        ],
        timeline: 'Weeks 9-10',
        studentProducts: ['Presentation slides', 'Policy brief', 'Press release', 'Social media campaign materials']
      }
    ],
    rubric: {
      criteria: [
        { 
          id: 'c1', 
          name: 'Research & Analysis', 
          weight: '25%',
          description: 'Quality and rigor of data collection, analysis, and evidence-based reasoning',
          exemplary: 'Comprehensive data from multiple sources; sophisticated analysis using appropriate methods; clear connections between evidence and conclusions; identifies patterns and relationships others might miss',
          proficient: 'Solid data collection from several sources; accurate analysis with appropriate methods; logical connections between evidence and conclusions; identifies key patterns',
          developing: 'Basic data collection from limited sources; simple analysis with some errors; attempts to connect evidence to conclusions; identifies obvious patterns',
          beginning: 'Minimal data collection; analysis lacks depth or contains significant errors; weak connections between evidence and conclusions; misses important patterns'
        },
        { 
          id: 'c2', 
          name: 'Problem-Solving & Innovation', 
          weight: '20%',
          description: 'Creativity and feasibility of proposed solutions',
          exemplary: 'Highly creative and original solutions; thoroughly considers multiple perspectives; solutions are innovative yet practical; demonstrates systems thinking',
          proficient: 'Creative solutions that show good thinking; considers different perspectives; solutions are practical and well-reasoned; shows understanding of connections',
          developing: 'Some creative elements in solutions; considers limited perspectives; solutions are somewhat practical; shows basic understanding of problem',
          beginning: 'Solutions lack creativity or originality; single perspective considered; solutions may be impractical; limited understanding of problem complexity'
        },
        { 
          id: 'c3', 
          name: 'Collaboration & Leadership', 
          weight: '20%',
          description: 'Effectiveness in team collaboration and community engagement',
          exemplary: 'Exceptional teamwork with clear roles and shared leadership; actively builds partnerships; resolves conflicts constructively; elevates work of others',
          proficient: 'Good teamwork with defined roles; engages partners effectively; handles conflicts appropriately; supports team members',
          developing: 'Basic teamwork with some role confusion; limited partner engagement; avoids or struggles with conflict; inconsistent support of team',
          beginning: 'Poor teamwork with unclear roles; minimal partner engagement; conflicts harm productivity; works in isolation'
        },
        { 
          id: 'c4', 
          name: 'Communication & Presentation', 
          weight: '20%',
          description: 'Clarity and impact of written, visual, and oral communication',
          exemplary: 'Exceptionally clear and compelling communication; adapts message for different audiences; professional visual design; confident and engaging presentation style',
          proficient: 'Clear communication with good organization; considers audience needs; effective visual aids; solid presentation skills',
          developing: 'Generally clear but some confusion; limited audience awareness; basic visual aids; adequate presentation with some nervousness',
          beginning: 'Unclear or disorganized communication; no audience consideration; poor or missing visual aids; significant presentation difficulties'
        },
        { 
          id: 'c5', 
          name: 'Real-World Impact', 
          weight: '15%',
          description: 'Measurable positive change created in school or community',
          exemplary: 'Creates significant, measurable change; influences policy or practice; work continues beyond project; inspires others to action',
          proficient: 'Creates clear, measurable change; affects target audience; sustainable elements; motivates some others',
          developing: 'Creates some measurable change; limited audience reached; short-term impact; attempts to inspire others',
          beginning: 'Minimal or no measurable change; very limited reach; no sustainability; little influence on others'
        }
      ]
    },
    impact: {
      audience: {
        primary: 'School Board and District Administrators',
        secondary: 'City Council and Environmental Department',
        community: 'Parents, local businesses, environmental organizations',
        description: 'These are the decision-makers and stakeholders who can implement systemic changes based on student recommendations'
      },
      method: {
        formal: 'School board presentation (15 minutes + Q&A)',
        public: 'Community forum or town hall event',
        digital: 'Website, social media campaign, online petition',
        media: 'Press release, local news coverage, op-ed submission',
        description: 'Multiple channels ensure broad reach and sustained attention to the issue'
      },
      measures: {
        quantitative: [
          'Waste diverted from landfill (pounds/percentage)',
          'Energy consumption reduced (kWh saved)',
          'Water conserved (gallons)',
          'Cost savings achieved (dollars)',
          'People reached (attendance, views, signatures)'
        ],
        qualitative: [
          'Policy changes adopted or considered',
          'Behavioral changes observed in school community',
          'Media coverage and public discourse generated',
          'Partnerships formed and sustained',
          'Student testimonials about learning and growth'
        ],
        description: 'Success is measured through both hard data and observable changes in awareness, behavior, and policy'
      }
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

/**
 * Build the Community History Hero Project
 * "Living History: Preserving Community Stories"
 * A comprehensive oral history and digital archiving project for middle school
 */
function buildCommunityHistoryHero(userId: string): SampleBlueprint {
  const id = 'hero-community-history';

  const wizardData = {
    projectTopic: 'Living History: Preserving Community Stories',
    learningGoals: 'Oral history methods, narrative craft, research ethics, archival practice, media production, community engagement, critical listening, cultural competence',
    entryPoint: 'authentic_problem',
    subjects: ['social-studies', 'language-arts', 'technology', 'arts'],
    primarySubject: 'social-studies',
    gradeLevel: 'middle',
    duration: 'long',
    materials: 'Audio recorders/mics or smartphones, headphones, transcription tools, consent forms, cameras, computers, editing software, cloud drive',
    subject: 'Social Studies, ELA, Digital Media, Arts',
    location: 'classroom; community centers; library; homes',
    featured: true,
    heroProject: true,
    communityPartners: ['Local historical society', 'Public library', 'Senior center', 'Community media', 'Local newspaper']
  };

  const ideation = {
    bigIdea: 'Communities are shaped by the stories we preserve and share; ethical documentation honors identity, fosters belonging, and informs collective memory.',
    essentialQuestion: 'How might we document and preserve community stories so they remain accessible, accurate, and meaningful over time?',
    challenge: 'Conduct oral histories with community members, curate and publish a digital archive with transcripts and media, and host a public exhibit to share and celebrate local history.',
    studentVoice: {
      drivingQuestions: [
        'Whose stories are missing from our community\'s official history?',
        'How do we want to capture and share these stories respectfully?',
        'What format will make these stories most accessible to different audiences?',
        'How can we ensure these stories are preserved for future generations?',
        'What impact do we want our archive to have on the community?'
      ],
      choicePoints: [
        'Theme selection (immigration stories, local businesses, civil rights, traditions, etc.)',
        'Interview participants and community segments to focus on',
        'Media formats (audio, video, photo essays, written narratives)',
        'Archive platform and organization structure',
        'Public presentation format (exhibit, podcast, website, performance)'
      ]
    }
  };

  const journey = {
    phases: [
      {
        id: 'phase-1',
        name: 'Discover',
        description: 'Learn oral history methods and ethical practices',
        goal: 'Master interviewing techniques, understand ethical documentation, and explore existing oral history projects',
        keyQuestion: 'What makes oral history powerful and how do we do it responsibly?',
        activities: [
          'Study exemplar oral history projects (StoryCorps, local archives)',
          'Practice active listening exercises and interview techniques',
          'Analyze sample interviews for narrative structure',
          'Learn consent procedures and ethical guidelines',
          'Equipment training and technical skill-building',
          'Explore themes in local history through preliminary research'
        ],
        studentChoice: 'Students choose practice interview subjects and topics to explore',
        output: 'Methods brief with practice transcript and reflection',
        duration: '1-2 weeks',
        formativeAssessment: 'Protocol workshop, consent/ethics checklist, practice interview peer review'
      },
      {
        id: 'phase-2',
        name: 'Define',
        description: 'Plan interviews and select participants',
        goal: 'Identify story themes, select diverse participants, and prepare comprehensive interview plans',
        keyQuestion: 'Whose stories will we preserve and what do we want to learn?',
        activities: [
          'Map community demographics and identify underrepresented voices',
          'Research historical context for chosen themes',
          'Develop interview protocols and question banks',
          'Create participant outreach materials',
          'Schedule interviews and coordinate logistics',
          'Prepare consent forms and release documents'
        ],
        studentChoice: 'Teams select their focus theme and choose participants to interview',
        output: 'Interview plan with participant list, question bank, and consent packets',
        duration: '1-2 weeks',
        formativeAssessment: 'Plan review by community partner, pilot interview feedback, logistics checklist'
      },
      {
        id: 'phase-3',
        name: 'Develop',
        description: 'Conduct interviews and create archive materials',
        goal: 'Record high-quality interviews, create accurate transcripts, and develop supporting materials',
        keyQuestion: 'How do we capture stories authentically and make them accessible?',
        activities: [
          'Conduct and record formal interviews',
          'Create verbatim transcripts with timestamps',
          'Edit audio/video for clarity while preserving authenticity',
          'Develop metadata and cataloging system',
          'Create photo essays and supplementary materials',
          'Build searchable archive structure',
          'Add captions, alt-text, and accessibility features'
        ],
        studentChoice: 'Teams decide on editing approach and supplementary materials to create',
        output: 'Curated media set with transcripts, metadata, and accessibility features',
        duration: '2-3 weeks',
        formativeAssessment: 'Production checkpoints, technical quality rubric, accessibility audit'
      },
      {
        id: 'phase-4',
        name: 'Deliver',
        description: 'Share stories with the community',
        goal: 'Launch public archive, host community event, and ensure long-term preservation',
        keyQuestion: 'How do we celebrate these stories and ensure their lasting impact?',
        activities: [
          'Finalize digital archive with search functionality',
          'Create promotional materials for public launch',
          'Organize public exhibit or listening party',
          'Prepare and deliver presentations',
          'Document audience feedback and impact',
          'Develop sustainability plan for archive',
          'Train library/historical society on maintenance'
        ],
        studentChoice: 'Teams choose presentation format and design exhibit elements',
        output: 'Live archive, public exhibit, and sustainability documentation',
        duration: '2-3 weeks',
        formativeAssessment: 'Rehearsal feedback, accessibility testing, audience response analysis'
      }
    ],
    framework: 'This project follows an adapted Documentary Production workflow combined with archival science principles. Students move from research and pre-production through production and post-production to distribution, while maintaining ethical standards and archival best practices throughout.',
    scaffolding: [
      'Teacher demonstrates interview techniques, then co-interviews, then observes',
      'Provide interview protocol templates initially, fade to student-created questions',
      'Model transcription process, then provide partial transcripts, then full independence',
      'Structured peer feedback protocols evolve into self-directed critique',
      'Technical support decreases as students gain production skills'
    ],
    differentiation: [
      'Multiple roles available (interviewer, editor, archivist, designer)',
      'Choice in technology use (simple audio vs. multi-camera video)',
      'Varied presentation formats (written, visual, audio, performance)',
      'Flexible interview lengths and complexity levels',
      'Support partnerships for students needing additional assistance'
    ],
    activities: [
      'Listening labs with historical recordings',
      'Interview technique practice sessions',
      'Community mapping exercise',
      'Historical research sprints',
      'Consent and ethics workshops',
      'Recording and editing tutorials',
      'Transcription workshops',
      'Metadata creation sessions',
      'Archive design charrettes',
      'Public speaking preparation'
    ],
    resources: [
      {
        name: 'Oral History Association Best Practices',
        type: 'Teacher-Provided Resource',
        description: 'Professional guidelines for conducting ethical oral histories',
        url: 'https://www.oralhistory.org/best-practices/',
        when: 'Introduce in Phase 1 during ethics training'
      },
      {
        name: 'StoryCorps DIY Toolkit',
        type: 'Teacher-Provided Resource',
        description: 'Free resources for recording and preserving stories',
        url: 'https://storycorps.org/participate/diy/',
        when: 'Use throughout for technical guidance and inspiration'
      },
      {
        name: 'Local Historical Archives',
        type: 'Student-Found Resource',
        description: 'Existing community history resources for context and gaps',
        url: 'Local library and historical society collections',
        when: 'Students explore during Phase 2 research'
      },
      {
        name: 'Interview Protocol Generator',
        type: 'ALF-Generated Resource',
        description: 'Custom interview questions based on themes and participants',
        url: 'Generated through ALF Coach chat',
        when: 'Created during Phase 2 planning'
      },
      {
        name: 'Transcription Tools',
        type: 'Technology Tool',
        description: 'Otter.ai, Rev, or manual transcription with Express Scribe',
        url: 'Various free and paid options',
        when: 'Used in Phase 3 for creating transcripts'
      },
      {
        name: 'Archive Platform',
        type: 'Digital Platform',
        description: 'Omeka, WordPress, or Google Sites for hosting archive',
        url: 'Free hosting platforms',
        when: 'Set up in Phase 3, populated in Phase 4'
      },
      {
        name: 'Consent Form Templates',
        type: 'ALF-Generated Resource',
        description: 'Age-appropriate consent and release forms',
        url: 'Customized through ALF Coach',
        when: 'Generated in Phase 1, used throughout'
      },
      {
        name: 'Community Contacts Database',
        type: 'Class-Built Resource',
        description: 'Shared spreadsheet of participants and partners',
        url: 'Collaborative document',
        when: 'Built in Phase 2, maintained throughout'
      }
    ],
    resourcesExplanation: {
      teacherProvided: 'Professional standards and exemplars that establish quality benchmarks and ethical guidelines',
      studentFound: 'Local history resources that provide context and help identify gaps in existing narratives',
      alfGenerated: 'Customized protocols, forms, and rubrics tailored to specific community and project needs',
      collaborative: 'Shared databases and archives that grow with each interview and become community assets',
      howAlfHelps: 'ALF Coach generates interview questions tailored to your participants, creates consent forms appropriate for your context, develops rubrics aligned with your learning goals, and provides technical troubleshooting for recording and archiving challenges.'
    }
  };

  const deliverables = {
    milestones: [
      {
        id: 'm1',
        name: 'Interview Plan & Participant Consent',
        description: 'Complete participant recruitment and secure all necessary permissions',
        deliverable: 'Comprehensive interview plan with confirmed participants, signed consent forms, and production schedule',
        successCriteria: [
          'Recruit minimum 8 diverse participants across age groups',
          'Obtain signed consent forms from all participants',
          'Create detailed interview schedule with backup dates',
          'Develop question banks specific to each participant'
        ],
        timeline: 'Weeks 1-2',
        studentProducts: ['Participant database', 'Consent forms', 'Interview protocols', 'Production calendar']
      },
      {
        id: 'm2',
        name: 'First Interviews Published (3+)',
        description: 'Complete and publish initial set of oral histories',
        deliverable: 'Three fully produced oral histories with transcripts, metadata, and supplementary materials',
        successCriteria: [
          'Record minimum 3 interviews (30-60 minutes each)',
          'Create accurate, timestamped transcripts',
          'Add complete metadata for archival standards',
          'Include photos or supporting documents'
        ],
        timeline: 'Weeks 3-5',
        studentProducts: ['Audio/video files', 'Transcripts', 'Metadata records', 'Photo essays']
      },
      {
        id: 'm3',
        name: 'Final Archive Live',
        description: 'Launch complete digital archive with all features',
        deliverable: 'Fully functional online archive with search capabilities, accessibility features, and complete collection',
        successCriteria: [
          'Publish minimum 8 oral histories',
          'Implement search and filter functionality',
          'Ensure WCAG accessibility compliance',
          'Create archive introduction and context pages'
        ],
        timeline: 'Weeks 6-8',
        studentProducts: ['Digital archive site', 'Search interface', 'Context essays', 'User guide']
      }
    ],
    rubric: {
      criteria: [
        {
          id: 'c1',
          name: 'Historical Understanding & Context',
          weight: '25%',
          description: 'Depth of historical research and ability to contextualize stories within broader narratives',
          exemplary: 'Demonstrates sophisticated understanding of historical context; makes insightful connections between individual stories and larger historical patterns; identifies and explores previously undocumented narratives; shows nuanced understanding of multiple perspectives',
          proficient: 'Shows solid grasp of historical context; connects individual stories to community history; identifies important themes and patterns; demonstrates awareness of different perspectives',
          developing: 'Basic understanding of historical context; makes some connections between stories and history; identifies obvious themes; shows limited perspective awareness',
          beginning: 'Minimal historical context provided; few connections made between stories; misses important themes; single perspective dominates'
        },
        {
          id: 'c2',
          name: 'Research Quality & Ethics',
          weight: '25%',
          description: 'Adherence to ethical standards and quality of research methodology',
          exemplary: 'Exemplary ethical practices with thorough consent processes; innovative interview techniques that elicit rich narratives; meticulous documentation and citation; creates safe space for sensitive stories',
          proficient: 'Strong ethical practices with proper consent; effective interview techniques; good documentation practices; handles sensitive topics appropriately',
          developing: 'Basic ethical compliance; adequate interview techniques; some documentation gaps; occasionally struggles with sensitive topics',
          beginning: 'Ethical concerns present; poor interview techniques; significant documentation problems; mishandles sensitive content'
        },
        {
          id: 'c3',
          name: 'Narrative Craft & Communication',
          weight: '20%',
          description: 'Quality of storytelling and clarity of communication across media',
          exemplary: 'Masterful narrative construction that preserves authentic voice while ensuring clarity; seamless integration of multiple media; compelling story arc that engages diverse audiences; exceptional editing that enhances without distorting',
          proficient: 'Strong narrative structure with clear storytelling; good use of media elements; engaging presentation; thoughtful editing that maintains authenticity',
          developing: 'Basic narrative structure present; adequate use of media; somewhat engaging; editing sometimes disrupts flow or authenticity',
          beginning: 'Poor narrative structure; ineffective use of media; difficult to follow; editing problems compromise stories'
        },
        {
          id: 'c4',
          name: 'Technical Production & Archival Quality',
          weight: '20%',
          description: 'Technical quality of recordings and adherence to archival standards',
          exemplary: 'Professional-quality audio/video with excellent clarity; comprehensive metadata exceeding archival standards; innovative use of technology; flawless transcription accuracy; robust preservation plan',
          proficient: 'Good technical quality with clear recordings; complete metadata meeting standards; effective use of technology; accurate transcriptions; solid preservation approach',
          developing: 'Acceptable technical quality with some issues; basic metadata provided; adequate technology use; mostly accurate transcriptions; simple preservation plan',
          beginning: 'Poor technical quality affecting comprehension; incomplete metadata; minimal technology skills; significant transcription errors; no preservation plan'
        },
        {
          id: 'c5',
          name: 'Community Impact & Accessibility',
          weight: '10%',
          description: 'Reach, engagement, and accessibility of the archive',
          exemplary: 'Exceptional community engagement with measurable impact; fully accessible to all users including those with disabilities; active use by community organizations; inspires follow-up projects; strengthens community bonds',
          proficient: 'Good community engagement with clear impact; accessible to most users; used by target audiences; generates positive feedback; contributes to community dialogue',
          developing: 'Some community engagement; basic accessibility features; limited audience reach; mixed feedback; minimal community discussion',
          beginning: 'Minimal community engagement; accessibility barriers present; very limited reach; little feedback; no evident impact'
        }
      ]
    },
    impact: {
      audience: {
        primary: 'Community members and elders whose stories are preserved',
        secondary: 'Local historical society and public library',
        community: 'Students, researchers, families, and future generations',
        description: 'The archive serves both the storytellers who share their experiences and the broader community seeking to understand local history and identity'
      },
      method: {
        formal: 'Public exhibit at library or community center with listening stations',
        digital: 'Searchable online archive with transcripts and multimedia',
        media: 'Podcast mini-series featuring selected stories',
        physical: 'QR-coded story map installed at relevant locations',
        description: 'Multiple distribution channels ensure stories reach diverse audiences through their preferred media'
      },
      measures: {
        quantitative: [
          'Number of oral histories recorded and archived',
          'Transcript word count and hours of audio/video',
          'Archive website visits and file downloads',
          'Exhibit attendance and engagement time',
          'Social media shares and press mentions'
        ],
        qualitative: [
          'Participant testimonials about the interview experience',
          'Community feedback on representation and inclusion',
          'Partner organization endorsements and support',
          'Evidence of intergenerational dialogue sparked',
          'Examples of archive use in other projects or research'
        ]
      },
      sustainability: {
        shortTerm: 'Initial archive launch with core collection',
        mediumTerm: 'Quarterly story additions by new student cohorts',
        longTerm: 'Permanent collection at library/historical society with ongoing community contributions',
        training: 'Student teams train next cohort and community volunteers on interview and archival methods'
      }
    },
    artifacts: [
      'Recorded oral history interviews (audio/video)',
      'Verbatim transcripts with timestamps',
      'Photo essays and historical images',
      'Metadata records and catalog entries',
      'Context essays and historical timelines',
      'Consent forms and release documents',
      'Archive website or platform',
      'Podcast episodes or audio compilations',
      'Exhibit materials and displays',
      'QR-coded story markers'
    ],
    checkpoints: [
      {
        id: 'cp1',
        name: 'Ethics & Methods Certification',
        description: 'Demonstrate understanding of ethical practices and interview techniques',
        evidence: 'Pass ethics quiz, complete practice interview with feedback',
        timing: 'End of Week 1'
      },
      {
        id: 'cp2',
        name: 'Participant Recruitment Complete',
        description: 'Secure diverse participants with signed consents',
        evidence: 'Minimum 8 confirmed participants with signed forms',
        timing: 'End of Week 2'
      },
      {
        id: 'cp3',
        name: 'First Interview Production',
        description: 'Complete full production cycle for one interview',
        evidence: 'One published interview with transcript and metadata',
        timing: 'End of Week 4'
      },
      {
        id: 'cp4',
        name: 'Archive Beta Launch',
        description: 'Soft launch archive for testing and feedback',
        evidence: 'Functional archive with 5+ stories, tested by focus group',
        timing: 'End of Week 6'
      },
      {
        id: 'cp5',
        name: 'Public Presentation',
        description: 'Share project with authentic audience',
        evidence: 'Deliver presentation at exhibit or community event',
        timing: 'End of Week 8'
      }
    ],
    accessibility: {
      recordings: 'Provide captions for all video content and transcripts for audio',
      archive: 'Ensure WCAG 2.1 AA compliance for web platform',
      materials: 'Offer materials in multiple formats (audio, visual, text)',
      events: 'Provide ASL interpretation and assistive listening at public events',
      content: 'Include content warnings where appropriate and respect participant preferences for anonymity'
    },
    differentiation: {
      roles: 'Students can specialize as interviewers, editors, archivists, designers, or project managers',
      technology: 'Options range from smartphone recording to professional equipment',
      products: 'Final contributions can be audio, video, written, or visual',
      support: 'Partner struggling students with stronger peers or adult mentors',
      extension: 'Advanced students can tackle complex historical research or technical challenges'
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

  // Add the complete community history hero project
  samples.push(buildCommunityHistoryHero(userId));

  // Add placeholders for the remaining 7 hero projects
  HERO_PROJECTS.slice(2).forEach(project => {
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