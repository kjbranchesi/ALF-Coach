/**
 * Hero Project: Campus Sustainability Initiative
 * A comprehensive sustainability research and advocacy project for high school
 */

import { SampleBlueprint, ts } from './types';

export function buildSustainabilityHero(userId: string): SampleBlueprint {
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

  // Reflection prompts organized by project phase (adaptive to project duration)
  const weeklyReflections = {
    // Phase-based reflections that adapt to project timeline
    discover: [
      'What surprised you most about the problem we\'re exploring?',
      'How has your initial understanding changed based on research?'
    ],
    define: [
      'What patterns are you noticing in the data/information?',
      'Which aspects of the problem feel most important to address?'
    ],
    develop: [
      'How effectively is your team collaborating? What could improve?',
      'What assumptions did you have that turned out to be wrong?'
    ],
    deliver: [
      'How confident do you feel about your proposed solutions?',
      'What impact do you think your work will have beyond this project?'
    ],
    // Generic weekly prompts for any project duration
    weekly: [
      'What was the most challenging part of this week?',
      'What skill did you use or develop that surprised you?',
      'How did you overcome obstacles this week?',
      'What would you do differently if you could redo this week?'
    ]
  };

  // Common challenges and solutions based on teacher experience
  const troubleshooting = [
    'If students struggle with data analysis → Provide data visualization templates and pair analytical students with creative ones',
    'If community partners don\'t respond → Have backup contacts ready; use school board or PTA as alternatives',
    'If waste audit is too complex → Start with one area (cafeteria) rather than whole campus',
    'If students feel overwhelmed by scope → Break into smaller teams focusing on single environmental issues',
    'If presentation technology fails → Always have printed handouts and poster boards as backup',
    'If stakeholders dismiss student ideas → Prepare students with data-backed responses and adult allies',
    'If team conflicts arise → Use structured protocols like "I statements" and rotating roles',
    'If time runs short → Prioritize impact analysis over perfect presentations',
    'If materials are unavailable → Partner with science department or use free online tools',
    'If students lose motivation → Schedule mid-project celebration of small wins and peer showcases'
  ];

  // Differentiation strategies for diverse learners
  const modifications = {
    struggling: 'Reduce data collection sites from 5 to 3; provide analysis templates; allow verbal presentations; pair with stronger peer for support',
    advanced: 'Add comparative analysis with other schools; develop implementation budget; create teacher training materials; lead peer workshops',
    ell: 'Provide bilingual research resources; use visual data representations; allow native language for initial brainstorming; provide sentence frames for presentations'
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
    sample: true,
    weeklyReflections,
    troubleshooting,
    modifications
  };
}
