import { HeroProjectData } from './types';
import campusSustainabilityImage from './images/CampusSustainabilityInitiative.jpeg';

export const heroSustainabilityData: HeroProjectData = {
  // Core Metadata
  id: 'hero-sustainability-campaign',
  title: 'Campus Sustainability Initiative',
  tagline: 'Transform environmental awareness into measurable action through data science, community organizing, and policy advocacy',
  duration: '10 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Environmental Science', 'Social Studies', 'Statistics', 'ELA', 'Digital Media', 'Mathematics'],
  theme: {
    primary: 'emerald',
    secondary: 'blue',
    accent: 'amber',
    gradient: 'from-emerald-600 to-primary-600'
  },
  image: campusSustainabilityImage,

  // Course Abstract
  courseAbstract: {
    overview: 'Picture this: Students transform into environmental detectives for their own school, uncovering hidden waste and energy mysteries that nobody else has noticed. They crawl through recycling bins, track down phantom energy drains, and interview everyone from janitors to principals. Using real data and professional tools, they build compelling cases for change that actually get implemented. This is environmental science made real - where students create solutions that their younger siblings will still benefit from years later.',
    learningObjectives: [
      'Become data detectives who can spot patterns in waste, energy, and water usage that reveal opportunities for change',
      'Learn to manage complex projects with multiple moving parts, real deadlines, and diverse team members',
      'Master the art of convincing adults with data - turning spreadsheets into stories that inspire action',
      'Create systems and solutions that keep working long after the project ends, leaving a lasting legacy'
    ],
    methodology: 'Students work like real environmental consultants, complete with team roles, client meetings, and professional presentations. But here\'s the twist - they\'re consulting for their own school, so they see their recommendations come to life. Teams have the freedom to follow their curiosity while learning to back up every claim with solid evidence. The whole experience feels less like a class project and more like running a startup with a mission.',
    expectedOutcomes: [
      'Students discover surprising inefficiencies - like the vending machines using as much energy as 3 classrooms',
      'Most student recommendations actually get implemented because they\'re practical, researched, and well-presented',
      'Teams develop genuine expertise in sustainability, often knowing more than the adults they\'re advising',
      'Real partnerships form with local environmental groups who continue working with future student teams',
      'Students gain stories and achievements that make them stand out - "I reduced my school\'s waste by 30%" beats any essay'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This comprehensive sustainability project was designed using ALF Coach to address a critical challenge: How can high school students move from understanding environmental issues to creating measurable change in their community?',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '10 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Target', label: 'Subjects', value: '6 Areas' },
      { icon: 'Award', label: 'Standards', value: '15+ Aligned' }
    ],
    impactStatement: 'Students see their research influence policy and create lasting change in their school and community.'
  },

  // Rich Context
  context: {
    problem: 'Environmental science students often learn about climate change, pollution, and sustainability in abstract terms. They can recite facts but feel disconnected from real solutions and lack agency to create change.',
    significance: 'This project transforms passive learning into active problem-solving with measurable community impact.',
    realWorld: 'Students conduct real sustainability audits, analyze actual data, engage community stakeholders, and present to decision-makers.',
    studentRole: 'Environmental researchers, data analysts, policy advocates, and change agents working to create sustainable practices in their school and community.',
    authenticity: 'Every phase builds authentic skills while meeting rigorous academic standards across multiple disciplines.'
  },

  // Comprehensive Overview
  overview: {
    description: 'The blueprint combines systems thinking, data science, and community organizing into a 10-week journey where students conduct authentic research, engage real stakeholders, and advocate for policy change that extends beyond the classroom.',
    keyFeatures: [
      'Systems Thinking: Students analyze waste, energy, water, and transportation as interconnected systems',
      'Data-Driven Approach: Students collect real baseline data, track metrics, and measure actual environmental impact',
      'Stakeholder Engagement: Students interview cafeteria staff, facilities managers, administrators, and community members',
      'Action Research Cycle: Students prototype solutions, test interventions, and iterate based on real-world feedback',
      'Policy & Advocacy: Students present to school board, write policy proposals, and create lasting institutional change'
    ],
    outcomes: [
      'Measurable reduction in school environmental footprint',
      'Policy changes adopted by school board or administration',
      'Increased community awareness and engagement',
      'Student agency and leadership development',
      'Transferable skills in research, analysis, and communication'
    ],
    deliverables: [
      {
        name: 'Environmental Baseline Assessment',
        description: 'Comprehensive audit of current sustainability practices with data visualizations',
        format: 'Written report (10-15 pages) with charts and infographics'
      },
      {
        name: 'Stakeholder Engagement Portfolio',
        description: 'Documentation of community partnerships and collaborative efforts',
        format: 'Contact database, interview transcripts, and partnership agreements'
      },
      {
        name: 'Solution Prototype',
        description: 'Tested intervention strategies with feasibility analysis',
        format: 'Design portfolio with models, testing data, and cost-benefit analysis'
      },
      {
        name: 'Policy Proposal',
        description: 'Evidence-based recommendations for institutional change',
        format: 'Professional policy brief with executive summary and appendices'
      },
      {
        name: 'Public Presentation',
        description: 'Formal presentation to decision-makers and community',
        format: 'Slide deck, speaking notes, and supporting materials'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'Complex environmental challenges require evidence-based solutions, community collaboration, and systemic change across multiple scales - from individual behavior to institutional policy.',
    essentialQuestion: 'How can we use data, community organizing, and policy advocacy to create lasting environmental change that extends beyond our campus?',
    subQuestions: [
      'What environmental issue matters most to our community and why?',
      'How do we want to research and measure our impact?',
      'What type of solution do we want to create and who should be our partners?',
      'How will we know if we have succeeded in creating lasting change?'
    ],
    challenge: 'Conduct comprehensive sustainability research, develop evidence-based policy recommendations, and implement community-driven solutions that create measurable environmental impact and influence broader institutional change.',
    drivingQuestion: 'How might we transform our school into a model of sustainability that inspires change throughout our community?'
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Scientific Inquiry',
        items: [
          'Design and conduct systematic environmental audits',
          'Analyze quantitative and qualitative data sets',
          'Apply systems thinking to complex problems',
          'Evaluate cause-and-effect relationships'
        ]
      },
      {
        category: 'Communication',
        items: [
          'Adapt messaging for diverse audiences',
          'Create compelling data visualizations',
          'Write professional policy proposals',
          'Deliver persuasive presentations'
        ]
      },
      {
        category: 'Collaboration',
        items: [
          'Work effectively in interdisciplinary teams',
          'Engage community stakeholders',
          'Navigate institutional systems',
          'Build consensus around solutions'
        ]
      },
      {
        category: 'Critical Thinking',
        items: [
          'Evaluate multiple perspectives on issues',
          'Assess feasibility and trade-offs',
          'Synthesize complex information',
          'Make evidence-based recommendations'
        ]
      }
    ],
    alignments: {
      'NGSS': [
        {
          code: 'HS-ESS3-2',
          text: 'Evaluate competing design solutions for developing, managing, and utilizing energy and mineral resources',
          application: 'Students evaluate sustainability solutions for resource management',
          depth: 'master'
        },
        {
          code: 'HS-ESS3-4',
          text: 'Evaluate or refine a technological solution that reduces impacts of human activities',
          application: 'Students design and test interventions to reduce environmental impact',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate a solution to a complex real-world problem based on prioritized criteria',
          application: 'Students assess solutions using multiple criteria and stakeholder input',
          depth: 'develop'
        }
      ],
      'CCSS-ELA': [
        {
          code: 'RST.11-12.7',
          text: 'Integrate and evaluate multiple sources of information presented in diverse formats',
          application: 'Students synthesize research from various sources and formats',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and relevant evidence',
          application: 'Students write persuasive policy proposals with evidence',
          depth: 'master'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly, concisely, and logically for audience and purpose',
          application: 'Students present findings to school board and community',
          depth: 'develop'
        }
      ],
      'CCSS-Math': [
        {
          code: 'HSS-ID.B.6',
          text: 'Represent data on two quantitative variables and describe how variables are related',
          application: 'Students analyze relationships in environmental data',
          depth: 'develop'
        },
        {
          code: 'HSA-CED.A.3',
          text: 'Represent constraints by systems of equations and interpret solutions',
          application: 'Students model sustainability constraints mathematically',
          depth: 'introduce'
        }
      ],
      'C3-Social-Studies': [
        {
          code: 'D2.Eco.1.9-12',
          text: 'Analyze economic decisions and their impact on society',
          application: 'Students evaluate cost-benefit of sustainability initiatives',
          depth: 'develop'
        },
        {
          code: 'D4.7.9-12',
          text: 'Assess options for individual and collective action to address problems',
          application: 'Students develop and implement action plans',
          depth: 'master'
        }
      ]
    }
  },

  // Project Journey
  journey: {
    phases: [
      {
        id: 'phase-discover',
        name: 'Discover',
        duration: '2-3 weeks',
        focus: 'Explore the problem space and build foundational understanding',
        description: 'Students immerse themselves in understanding current sustainability practices through hands-on research, observation, and data collection.',
        objectives: [
          'Develop deep understanding of environmental challenges',
          'Master data collection methodologies',
          'Build stakeholder awareness',
          'Establish baseline metrics'
        ],
        activities: [
          {
            name: 'Campus Waste Audit',
            type: 'group',
            duration: '3 days',
            description: 'Conduct comprehensive waste audits at different times and locations',
            materials: ['Digital scales', 'Sorting bins', 'Data collection sheets', 'Safety equipment'],
            instructions: [
              'Select 5 strategic locations across campus',
              'Weigh and categorize waste by type',
              'Document patterns and anomalies',
              'Create visual waste stream map'
            ],
            differentiation: {
              support: ['Provide pre-made data sheets', 'Pair with stronger peer', 'Focus on 3 locations instead of 5'],
              extension: ['Compare with district data', 'Calculate carbon footprint', 'Research waste management industry']
            },
            assessment: 'Accuracy of data collection and initial pattern recognition'
          },
          {
            name: 'Stakeholder Shadow Experience',
            type: 'individual',
            duration: '1 day',
            description: 'Shadow facilities staff to understand operational systems',
            materials: ['Observation journal', 'Interview questions', 'Camera for documentation'],
            instructions: [
              'Arrange shadowing with facilities manager',
              'Document daily operations and challenges',
              'Identify decision points and constraints',
              'Note opportunities for improvement'
            ],
            differentiation: {
              support: ['Provide structured observation guide', 'Allow pair shadowing', 'Shorter duration'],
              extension: ['Shadow multiple departments', 'Create systems diagram', 'Research facility management best practices']
            },
            assessment: 'Quality of observations and systems understanding'
          }
        ],
        deliverables: [
          'Baseline assessment report with data visualizations',
          'Stakeholder map and initial contacts',
          'Research journal with observations'
        ],
        checkpoints: [
          {
            name: 'Data Collection Review',
            criteria: ['Data from 5+ locations', 'Multiple time periods sampled', 'Proper categorization'],
            evidence: ['Completed data sheets', 'Photo documentation', 'Initial charts'],
            support: 'Teacher modeling of data organization techniques'
          }
        ],
        resources: ['EPA audit templates', 'Local sustainability reports', 'Interview protocols'],
        teacherNotes: 'Model data collection in first location, then gradually release responsibility. Ensure safety protocols are followed during waste audits.',
        studentTips: 'Take lots of photos! Visual documentation will be powerful for your final presentation.'
      },
      {
        id: 'phase-define',
        name: 'Define',
        duration: '1-2 weeks',
        focus: 'Synthesize findings and frame the specific challenge',
        description: 'Transform research into clear problem statements and identify high-impact opportunity areas.',
        objectives: [
          'Analyze and synthesize research data',
          'Identify patterns and root causes',
          'Prioritize problems by impact and feasibility',
          'Develop clear problem statements'
        ],
        activities: [
          {
            name: 'Data Analysis Workshop',
            type: 'group',
            duration: '2 class periods',
            description: 'Analyze all collected data to identify patterns and insights',
            materials: ['Computers', 'Spreadsheet software', 'Chart paper', 'Sticky notes'],
            instructions: [
              'Input all data into shared spreadsheet',
              'Create visualizations of key findings',
              'Identify surprising patterns or outliers',
              'Generate initial hypotheses'
            ],
            differentiation: {
              support: ['Provide analysis templates', 'Pre-structure spreadsheets', 'Focus on one data type'],
              extension: ['Statistical analysis', 'Predictive modeling', 'Cross-reference with research']
            },
            assessment: 'Quality of analysis and pattern identification'
          },
          {
            name: 'Problem Prioritization Matrix',
            type: 'class',
            duration: '1 class period',
            description: 'Evaluate problems using impact and feasibility criteria',
            materials: ['Problem cards', 'Prioritization matrix', 'Voting dots'],
            instructions: [
              'List all identified problems',
              'Rate each on impact potential (1-10)',
              'Rate each on feasibility (1-10)',
              'Plot on matrix and discuss'
            ],
            differentiation: {
              support: ['Provide criteria definitions', 'Work in mixed-ability groups', 'Use simpler scale'],
              extension: ['Add additional criteria', 'Weight criteria differently', 'Research similar prioritizations']
            },
            assessment: 'Reasoning behind prioritization choices'
          }
        ],
        deliverables: [
          'Problem definition packet',
          'Stakeholder influence/interest matrix',
          'Opportunity area presentation'
        ],
        checkpoints: [
          {
            name: 'Problem Statement Review',
            criteria: ['Clear, specific problem identified', 'Evidence-based', 'Actionable scope'],
            evidence: ['Written problem statement', 'Supporting data', 'Stakeholder validation'],
            support: 'Provide problem statement templates and examples'
          }
        ],
        resources: ['Analysis software tutorials', 'Problem-solving frameworks', 'Case study examples'],
        teacherNotes: 'This phase requires strong facilitation to help students move from data to insights. Use thinking routines like "See-Think-Wonder".',
        studentTips: 'Don\'t try to solve everything! Focus on one problem you can realistically impact.'
      },
      {
        id: 'phase-develop',
        name: 'Develop',
        duration: '2-3 weeks',
        focus: 'Generate and prototype potential solutions',
        description: 'Create innovative, feasible solutions through iterative design and testing.',
        objectives: [
          'Generate creative solution ideas',
          'Build and test prototypes',
          'Calculate costs and benefits',
          'Iterate based on feedback'
        ],
        activities: [
          {
            name: 'Solution Brainstorming Session',
            type: 'group',
            duration: '90 minutes',
            description: 'Generate wide range of solution ideas without constraints',
            materials: ['Sticky notes', 'Markers', 'Ideation prompts', 'Timer'],
            instructions: [
              'Use "Yes, And..." protocol',
              'Generate 50+ ideas in 20 minutes',
              'Cluster similar ideas',
              'Select top 5 for development'
            ],
            differentiation: {
              support: ['Provide idea starters', 'Use visual brainstorming', 'Allow drawing instead of writing'],
              extension: ['Research cutting-edge solutions', 'Combine multiple ideas', 'Consider scalability']
            },
            assessment: 'Quantity and creativity of ideas generated'
          },
          {
            name: 'Prototype Development',
            type: 'group',
            duration: '1 week',
            description: 'Create tangible prototypes or detailed models of solutions',
            materials: ['Prototyping materials', 'Design software', 'Testing equipment'],
            instructions: [
              'Choose prototyping method',
              'Build minimum viable version',
              'Document design decisions',
              'Prepare for testing'
            ],
            differentiation: {
              support: ['Provide templates', 'Focus on paper prototypes', 'Teacher modeling'],
              extension: ['Working prototypes', 'Multiple iterations', 'Digital simulations']
            },
            assessment: 'Prototype quality and design thinking process'
          },
          {
            name: 'Solution Testing',
            type: 'group',
            duration: '3 days',
            description: 'Test solutions with target users and stakeholders',
            materials: ['Testing protocols', 'Feedback forms', 'Recording devices'],
            instructions: [
              'Develop testing protocol',
              'Recruit test participants',
              'Conduct tests and observe',
              'Collect and analyze feedback'
            ],
            differentiation: {
              support: ['Structured protocols', 'Teacher-facilitated tests', 'Simplified feedback forms'],
              extension: ['A/B testing', 'Statistical analysis', 'Long-term pilot']
            },
            assessment: 'Testing rigor and response to feedback'
          }
        ],
        deliverables: [
          'Solution portfolio with 3-5 prototypes',
          'Testing data and user feedback',
          'Cost-benefit analysis for each solution',
          'Iteration documentation'
        ],
        checkpoints: [
          {
            name: 'Prototype Review',
            criteria: ['Addresses problem clearly', 'Feasible to implement', 'Evidence of iteration'],
            evidence: ['Physical or digital prototype', 'Design rationale', 'Testing results'],
            support: 'Provide exemplar prototypes and design thinking resources'
          }
        ],
        resources: ['Design thinking toolkit', 'Prototyping materials', 'Testing protocol templates'],
        teacherNotes: 'Emphasize iteration over perfection. Help students see "failure" as learning.',
        studentTips: 'Test early and often! The best solutions come from multiple iterations.'
      },
      {
        id: 'phase-deliver',
        name: 'Deliver',
        duration: '3-4 weeks',
        focus: 'Implement solutions and share with authentic audiences',
        description: 'Create real change through implementation, presentation, and advocacy.',
        objectives: [
          'Launch pilot implementation',
          'Collect and analyze impact data',
          'Present to decision-makers',
          'Create sustainability plan'
        ],
        activities: [
          {
            name: 'Pilot Launch',
            type: 'class',
            duration: '2 weeks',
            description: 'Implement solution pilot in real environment',
            materials: ['Implementation materials', 'Tracking tools', 'Communication materials'],
            instructions: [
              'Finalize implementation plan',
              'Launch with fanfare',
              'Monitor daily progress',
              'Troubleshoot issues quickly'
            ],
            differentiation: {
              support: ['Smaller pilot scope', 'More teacher support', 'Simplified metrics'],
              extension: ['Multiple sites', 'Complex metrics', 'Media engagement']
            },
            assessment: 'Implementation execution and problem-solving'
          },
          {
            name: 'Impact Documentation',
            type: 'group',
            duration: 'Ongoing',
            description: 'Collect evidence of change and impact',
            materials: ['Data collection tools', 'Cameras', 'Interview equipment'],
            instructions: [
              'Track quantitative metrics',
              'Gather testimonials',
              'Document with photos/video',
              'Create impact story'
            ],
            differentiation: {
              support: ['Focus on 2-3 metrics', 'Provide templates', 'Help with analysis'],
              extension: ['Advanced analytics', 'Infographic creation', 'Impact prediction model']
            },
            assessment: 'Quality and comprehensiveness of documentation'
          },
          {
            name: 'Presentation Preparation',
            type: 'group',
            duration: '1 week',
            description: 'Prepare professional presentation for school board',
            materials: ['Presentation software', 'Design tools', 'Printing materials'],
            instructions: [
              'Create compelling narrative',
              'Design professional slides',
              'Prepare speaking notes',
              'Practice with feedback'
            ],
            differentiation: {
              support: ['Provide templates', 'Assign specific roles', 'Extra practice time'],
              extension: ['Multiple formats', 'Interactive elements', 'Q&A preparation']
            },
            assessment: 'Presentation quality and delivery'
          }
        ],
        deliverables: [
          'Implementation results report',
          'Professional presentation package',
          'Policy proposal document',
          'Sustainability toolkit for future use'
        ],
        checkpoints: [
          {
            name: 'Implementation Review',
            criteria: ['Pilot launched successfully', 'Data collected systematically', 'Stakeholders engaged'],
            evidence: ['Implementation photos', 'Data logs', 'Feedback collected'],
            support: 'Daily check-ins during pilot phase'
          },
          {
            name: 'Presentation Readiness',
            criteria: ['Clear narrative', 'Professional materials', 'Practiced delivery'],
            evidence: ['Completed slides', 'Rehearsal video', 'Peer feedback'],
            support: 'Presentation coaching and multiple practice sessions'
          }
        ],
        resources: ['Presentation examples', 'Public speaking guides', 'Policy brief templates'],
        teacherNotes: 'This phase is intense - provide extra emotional support. Celebrate milestones!',
        studentTips: 'You\'re almost there! Focus on telling your story with data and passion.'
      }
    ],
    milestones: [
      {
        id: 'milestone-1',
        phase: 'Discover',
        week: 3,
        title: 'Baseline Assessment Complete',
        description: 'Comprehensive environmental audit finalized with all data collected and organized',
        evidence: ['Data spreadsheets', 'Initial visualizations', 'Photo documentation'],
        celebration: 'Data Detective certificates and team lunch'
      },
      {
        id: 'milestone-2',
        phase: 'Define',
        week: 4,
        title: 'Problem Focus Selected',
        description: 'Specific sustainability challenge identified and validated with stakeholders',
        evidence: ['Problem statement', 'Stakeholder feedback', 'Team consensus'],
        celebration: 'Problem Solver badges and recognition announcement'
      },
      {
        id: 'milestone-3',
        phase: 'Develop',
        week: 6,
        title: 'Prototype Tested',
        description: 'Solution prototype completed and tested with target users',
        evidence: ['Prototype documentation', 'Testing data', 'User feedback'],
        celebration: 'Innovation awards and prototype showcase'
      },
      {
        id: 'milestone-4',
        phase: 'Deliver',
        week: 8,
        title: 'Pilot Launched',
        description: 'Solution implementation begun with real users in real environment',
        evidence: ['Launch photos', 'Initial metrics', 'Participant list'],
        celebration: 'Launch party with stakeholders'
      },
      {
        id: 'milestone-5',
        phase: 'Deliver',
        week: 10,
        title: 'Board Presentation Delivered',
        description: 'Formal presentation to school board or city council completed',
        evidence: ['Presentation recording', 'Board feedback', 'Media coverage'],
        celebration: 'Changemaker celebration and certificates'
      }
    ],
    timeline: [
      { week: 1, phase: 'Discover', title: 'Project Launch & Team Formation', activities: ['Introduction', 'Team building', 'Initial research'], deliverable: undefined, assessment: undefined },
      { week: 2, phase: 'Discover', title: 'Data Collection Sprint', activities: ['Waste audits', 'Energy analysis', 'Surveys'], deliverable: undefined, assessment: 'Formative check-in' },
      { week: 3, phase: 'Discover', title: 'Stakeholder Engagement', activities: ['Interviews', 'Shadow experiences', 'Research synthesis'], deliverable: 'Baseline assessment', assessment: undefined },
      { week: 4, phase: 'Define', title: 'Problem Analysis', activities: ['Data analysis', 'Pattern identification', 'Problem prioritization'], deliverable: 'Problem definition', assessment: 'Peer review' },
      { week: 5, phase: 'Develop', title: 'Solution Ideation', activities: ['Brainstorming', 'Research', 'Concept development'], deliverable: undefined, assessment: undefined },
      { week: 6, phase: 'Develop', title: 'Prototype Creation', activities: ['Building', 'Testing', 'Iteration'], deliverable: 'Prototype portfolio', assessment: 'Design review' },
      { week: 7, phase: 'Develop', title: 'Solution Refinement', activities: ['Feedback integration', 'Cost analysis', 'Final design'], deliverable: undefined, assessment: undefined },
      { week: 8, phase: 'Deliver', title: 'Implementation Launch', activities: ['Pilot launch', 'Monitoring', 'Troubleshooting'], deliverable: 'Implementation plan', assessment: undefined },
      { week: 9, phase: 'Deliver', title: 'Impact Analysis', activities: ['Data collection', 'Analysis', 'Documentation'], deliverable: 'Impact report', assessment: 'Self-assessment' },
      { week: 10, phase: 'Deliver', title: 'Public Presentation', activities: ['Presentation prep', 'Board presentation', 'Celebration'], deliverable: 'Final presentation', assessment: 'Summative assessment' }
    ],
    weeklyBreakdown: [
      {
        week: 1,
        theme: 'Launch & Exploration',
        objectives: ['Understand project scope', 'Form teams', 'Begin initial research'],
        mondayFriday: [
          { day: 'Monday', warmUp: 'Sustainability quiz', mainActivity: 'Project introduction and inspiration', closure: 'Initial reactions journal', materials: ['Slides', 'Journals'], time: '50 min' },
          { day: 'Tuesday', warmUp: 'Environmental issues brainstorm', mainActivity: 'Team formation and norms', closure: 'Team charter creation', materials: ['Charter template'], time: '50 min' },
          { day: 'Wednesday', warmUp: 'Systems thinking puzzle', mainActivity: 'Campus sustainability tour', closure: 'Observation sharing', materials: ['Clipboards', 'Cameras'], time: '50 min' },
          { day: 'Thursday', warmUp: 'Data types review', mainActivity: 'Research methods training', closure: 'Method selection', materials: ['Research guides'], time: '50 min' },
          { day: 'Friday', warmUp: 'Week reflection', mainActivity: 'Initial data collection planning', closure: 'Weekend research assignment', materials: ['Planning sheets'], time: '50 min' }
        ],
        homework: 'Research one sustainability initiative from another school',
        parentUpdate: 'Students launched sustainability project - ask them about their team and focus area!'
      }
    ]
  },

  // Assessment Framework
  assessment: {
    philosophy: 'Assessment is ongoing, authentic, and focused on growth. Students receive feedback throughout the project, with opportunities for revision and improvement. The emphasis is on process as much as product.',
    rubric: [
      {
        category: 'Research & Analysis',
        weight: 25,
        exemplary: {
          points: 100,
          description: 'Comprehensive data from multiple sources with sophisticated analysis',
          evidence: ['Data from 5+ sources', 'Advanced analytical methods', 'Clear patterns identified', 'Insightful connections made']
        },
        proficient: {
          points: 85,
          description: 'Solid data collection with accurate analysis',
          evidence: ['Data from 3-4 sources', 'Appropriate analysis methods', 'Key patterns identified', 'Logical connections']
        },
        developing: {
          points: 70,
          description: 'Basic data collection with simple analysis',
          evidence: ['Data from 2-3 sources', 'Basic analysis attempted', 'Some patterns noted', 'Simple connections']
        },
        beginning: {
          points: 55,
          description: 'Minimal data with limited analysis',
          evidence: ['Data from 1-2 sources', 'Analysis lacks depth', 'Few patterns identified', 'Weak connections']
        }
      },
      {
        category: 'Problem-Solving & Innovation',
        weight: 20,
        exemplary: {
          points: 100,
          description: 'Highly creative and original solutions with systems thinking',
          evidence: ['Multiple innovative ideas', 'Thorough feasibility analysis', 'Evidence of iteration', 'Systems perspective']
        },
        proficient: {
          points: 85,
          description: 'Creative solutions that are practical and well-reasoned',
          evidence: ['Several good ideas', 'Basic feasibility considered', 'Some iteration shown', 'Good understanding']
        },
        developing: {
          points: 70,
          description: 'Some creative elements with basic practicality',
          evidence: ['Few ideas generated', 'Limited feasibility analysis', 'Minimal iteration', 'Basic understanding']
        },
        beginning: {
          points: 55,
          description: 'Solutions lack creativity or feasibility',
          evidence: ['Very few ideas', 'No feasibility analysis', 'No iteration', 'Limited understanding']
        }
      },
      {
        category: 'Collaboration & Leadership',
        weight: 20,
        exemplary: {
          points: 100,
          description: 'Exceptional teamwork with shared leadership and conflict resolution',
          evidence: ['Clear roles executed', 'Supports all members', 'Resolves conflicts', 'Builds partnerships']
        },
        proficient: {
          points: 85,
          description: 'Good teamwork with defined roles and appropriate collaboration',
          evidence: ['Roles mostly clear', 'Supports most members', 'Handles conflicts', 'Engages partners']
        },
        developing: {
          points: 70,
          description: 'Basic teamwork with some role confusion',
          evidence: ['Some role clarity', 'Inconsistent support', 'Avoids conflicts', 'Limited engagement']
        },
        beginning: {
          points: 55,
          description: 'Poor teamwork with unclear roles',
          evidence: ['Unclear roles', 'Works alone', 'Conflicts harm work', 'Minimal engagement']
        }
      },
      {
        category: 'Communication & Presentation',
        weight: 20,
        exemplary: {
          points: 100,
          description: 'Exceptionally clear and compelling communication adapted for audiences',
          evidence: ['Professional materials', 'Engaging delivery', 'Audience adaptation', 'Confident presence']
        },
        proficient: {
          points: 85,
          description: 'Clear communication with good organization and visuals',
          evidence: ['Good materials', 'Solid delivery', 'Some adaptation', 'Generally confident']
        },
        developing: {
          points: 70,
          description: 'Generally clear with basic organization',
          evidence: ['Basic materials', 'Adequate delivery', 'Limited adaptation', 'Some nervousness']
        },
        beginning: {
          points: 55,
          description: 'Unclear or disorganized communication',
          evidence: ['Poor materials', 'Weak delivery', 'No adaptation', 'Very nervous']
        }
      },
      {
        category: 'Real-World Impact',
        weight: 15,
        exemplary: {
          points: 100,
          description: 'Creates significant, measurable change that influences policy',
          evidence: ['Measurable improvements', 'Policy influence', 'Sustained impact', 'Inspires others']
        },
        proficient: {
          points: 85,
          description: 'Creates clear, measurable change in target area',
          evidence: ['Clear improvements', 'Target affected', 'Some sustainability', 'Motivates some']
        },
        developing: {
          points: 70,
          description: 'Creates some measurable change',
          evidence: ['Some improvements', 'Limited reach', 'Short-term impact', 'Attempts inspiration']
        },
        beginning: {
          points: 55,
          description: 'Minimal or no measurable change',
          evidence: ['No clear improvements', 'Very limited reach', 'No sustainability', 'Little influence']
        }
      }
    ],
    formative: [
      {
        name: 'Research Journal',
        type: 'Individual reflection',
        frequency: 'Weekly',
        purpose: 'Track thinking evolution and learning process',
        method: 'Written or video journal entries responding to prompts',
        feedback: 'Teacher comments focus on growth and deeper thinking'
      },
      {
        name: 'Peer Review Sessions',
        type: 'Group assessment',
        frequency: 'After each phase',
        purpose: 'Provide feedback and learn from other teams',
        method: 'Structured protocol with specific feedback criteria',
        feedback: 'Both giving and receiving feedback are assessed'
      },
      {
        name: 'Checkpoint Conferences',
        type: 'Teacher-student meeting',
        frequency: 'Bi-weekly',
        purpose: 'Monitor progress and provide targeted support',
        method: 'One-on-one or small group discussions',
        feedback: 'Verbal feedback with action items for improvement'
      }
    ],
    summative: [
      {
        name: 'Final Portfolio',
        type: 'Comprehensive documentation',
        timing: 'End of project',
        format: 'Digital portfolio with all deliverables and reflections',
        criteria: ['Completeness', 'Quality', 'Growth demonstration', 'Reflection depth'],
        weight: 40
      },
      {
        name: 'Board Presentation',
        type: 'Formal presentation',
        timing: 'Week 10',
        format: '15-minute presentation with Q&A',
        criteria: ['Content accuracy', 'Persuasiveness', 'Professionalism', 'Q&A handling'],
        weight: 30
      },
      {
        name: 'Impact Analysis',
        type: 'Data-driven report',
        timing: 'Week 9',
        format: 'Written report with data visualizations',
        criteria: ['Data quality', 'Analysis depth', 'Conclusions validity', 'Recommendations'],
        weight: 30
      }
    ],
    selfAssessment: [
      {
        name: 'Growth Tracker',
        frequency: 'Weekly',
        format: 'Rating scale with evidence',
        prompts: ['What skill did I improve most?', 'Where do I still need growth?', 'What evidence shows my learning?'],
        reflection: 'Students identify specific areas of growth and set goals'
      },
      {
        name: 'Collaboration Rubric',
        frequency: 'After each phase',
        format: 'Self-rating on collaboration criteria',
        prompts: ['How well did I contribute?', 'How did I support teammates?', 'What could I do better?'],
        reflection: 'Students assess their teamwork and set improvement goals'
      }
    ],
    peerAssessment: [
      {
        name: 'Team Contribution Rating',
        structure: 'Anonymous ratings of team member contributions',
        guidelines: ['Be specific', 'Give examples', 'Suggest improvements', 'Acknowledge strengths'],
        feedbackForm: 'Structured form with rating scales and comment boxes'
      },
      {
        name: 'Presentation Feedback',
        structure: 'Peer teams provide feedback on practice presentations',
        guidelines: ['Focus on clarity', 'Note strengths first', 'Give actionable suggestions', 'Be encouraging'],
        feedbackForm: 'Two glows and a grow format'
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      { name: 'Digital scales for waste audit', type: 'material', quantity: '3-5', source: 'Science department or purchase', cost: '$150 if purchased' },
      { name: 'Data collection tablets/laptops', type: 'technology', quantity: '1 per team', source: 'School computer lab', cost: '$0' },
      { name: 'Presentation software', type: 'technology', quantity: 'Site license', source: 'Google Slides or PowerPoint', cost: '$0' },
      { name: 'Meeting space for presentations', type: 'space', quantity: '1 large room', source: 'Auditorium or library', cost: '$0' }
    ],
    optional: [
      { name: 'Water testing kits', type: 'material', quantity: '2-3', source: 'Science department', cost: '$50', alternatives: ['Partner with science classes'] },
      { name: 'Video equipment', type: 'technology', quantity: '1-2 cameras', source: 'Media center', cost: '$0', alternatives: ['Student phones'] },
      { name: 'Poster printing', type: 'material', quantity: 'As needed', source: 'School or local print shop', cost: '$100', alternatives: ['Digital displays only'] }
    ],
    professional: [
      {
        title: 'EPA School Sustainability Toolkit',
        type: 'website',
        link: 'https://www.epa.gov/schools',
        description: 'Comprehensive resources for school environmental projects',
        alignment: 'Provides audit templates and best practices for Discover phase'
      },
      {
        title: 'Design Thinking for Educators',
        type: 'book',
        link: 'IDEO.org',
        description: 'Framework for human-centered design in education',
        alignment: 'Guides the Develop phase methodology'
      },
      {
        title: 'Project-Based Learning Handbook',
        type: 'book',
        link: 'Buck Institute',
        description: 'Gold standard PBL practices and resources',
        alignment: 'Overall project structure and assessment strategies'
      }
    ],
    studentResources: [
      {
        name: 'Data Visualization Tutorial',
        type: 'Video series',
        ageAppropriate: true,
        link: 'YouTube - provided by teacher',
        description: 'How to create compelling charts and infographics',
        scaffolding: 'Start with basic charts, advance to interactive visualizations'
      },
      {
        name: 'Interview Skills Guide',
        type: 'Handout',
        ageAppropriate: true,
        description: 'Tips for conducting stakeholder interviews',
        scaffolding: 'Practice with peers before real stakeholders'
      },
      {
        name: 'Presentation Zen for Students',
        type: 'Website',
        ageAppropriate: true,
        link: 'Provided by teacher',
        description: 'Creating powerful presentations',
        scaffolding: 'Templates provided, gradually remove scaffolds'
      }
    ],
    communityConnections: [
      {
        organization: 'City Sustainability Office',
        contactPerson: 'Sustainability Coordinator',
        role: 'Expert advisor and potential implementer',
        contribution: 'Guest speaker, feedback on proposals, implementation support',
        scheduling: 'Contact 3 weeks in advance'
      },
      {
        organization: 'Local Environmental NGO',
        contactPerson: 'Education Director',
        role: 'Mentorship and resources',
        contribution: 'Workshops, materials, volunteer support',
        scheduling: 'Flexible, contact anytime'
      },
      {
        organization: 'Waste Management Company',
        contactPerson: 'Community Relations',
        role: 'Technical expertise',
        contribution: 'Facility tour, data sharing, recycling resources',
        scheduling: 'Schedule tour 2 weeks ahead'
      }
    ]
  },

  // Impact & Audience
  impact: {
    audience: {
      primary: ['School Board', 'District Administrators', 'School Principal'],
      secondary: ['City Council', 'Environmental Department', 'Local Media'],
      global: ['Other schools via website', 'Education conferences', 'Social media followers'],
      engagement: 'Multiple touchpoints throughout project with formal presentation at conclusion',
      feedback: 'Structured feedback forms, Q&A sessions, and follow-up meetings'
    },
    methods: [
      {
        method: 'Formal Board Presentation',
        format: '15-minute presentation with 10-minute Q&A',
        venue: 'School board meeting room',
        technology: ['Projector', 'Microphones', 'Clicker'],
        preparation: ['Practice sessions', 'Slide review', 'Q&A prep', 'Dress rehearsal']
      },
      {
        method: 'Community Forum',
        format: 'Public event with displays and presentations',
        venue: 'School cafeteria or gym',
        technology: ['Display boards', 'Laptops for demos', 'PA system'],
        preparation: ['Invitation campaign', 'Material preparation', 'Logistics planning']
      },
      {
        method: 'Digital Campaign',
        format: 'Website, social media, and online petition',
        technology: ['Website builder', 'Social media accounts', 'Analytics tools'],
        preparation: ['Content creation', 'Posting schedule', 'Engagement strategy']
      }
    ],
    metrics: [
      {
        metric: 'Waste Reduction',
        target: '30% reduction in landfill waste',
        measurement: 'Weekly waste audits comparing to baseline',
        timeline: 'Measured weeks 8-10',
        evidence: 'Weight logs and waste composition data'
      },
      {
        metric: 'Energy Savings',
        target: '10% reduction in energy use',
        measurement: 'Monthly utility bill analysis',
        timeline: 'Compared after 3 months',
        evidence: 'Utility bills and usage reports'
      },
      {
        metric: 'Stakeholder Engagement',
        target: '100+ community members engaged',
        measurement: 'Event attendance, petition signatures, social media metrics',
        timeline: 'Throughout project',
        evidence: 'Sign-in sheets, analytics reports, engagement logs'
      },
      {
        metric: 'Policy Change',
        target: 'At least 1 policy adopted or modified',
        measurement: 'Board resolutions or administrative decisions',
        timeline: 'Within 6 months of presentation',
        evidence: 'Written policies, meeting minutes, official communications'
      }
    ],
    sustainability: {
      continuation: 'Student green team established to continue monitoring and advocating',
      maintenance: 'Monthly check-ins with facilities staff and quarterly reports to administration',
      evolution: 'Annual sustainability summit to share progress and set new goals',
      legacy: 'Toolkit and resources left for future classes to build upon'
    },
    scalability: {
      classroom: 'Individual classroom audits and behavior change campaigns',
      school: 'Whole-school implementation with all grade levels participating',
      district: 'District-wide adoption of successful interventions and policies',
      beyond: 'Model shared with other schools through conferences and publications'
    }
  },

  // Implementation Support
  implementation: {
    gettingStarted: {
      overview: 'This project requires 2-3 weeks of preparation before student launch. Focus on partnerships, materials, and logistics.',
      prerequisites: [
        'Administrative approval for student audits and presentations',
        'Partnership agreements with at least 2 community organizations',
        'Access to baseline utility and waste data',
        'Technology access for research and presentation creation',
        'Flexible schedule for field work and stakeholder meetings'
      ],
      firstWeek: [
        'Host inspiring kick-off with guest speaker or video',
        'Form diverse teams based on interests and skills',
        'Establish team norms and communication protocols',
        'Begin initial campus observation and exploration',
        'Set up project management system (digital or physical)'
      ],
      commonMistakes: [
        'Starting without administrator buy-in - get approval first!',
        'Trying to tackle too many issues - focus is key',
        'Underestimating time for data collection - build in buffer',
        'Not preparing students for rejection - some stakeholders will say no',
        'Forgetting to document the process - capture everything!'
      ],
      quickWins: [
        'Visible recycling station improvements in week 1',
        'Social media campaign launch in week 2',
        'Local newspaper coverage of student efforts',
        'Teacher and staff testimonials about student leadership',
        'Before/after photos of small improvements'
      ]
    },
    weeklyReflections: [
      { week: 1, studentPrompts: ['What surprised you about our school\'s environmental impact?', 'How do you feel about taking on this challenge?'], teacherPrompts: ['How are teams forming?', 'What support do students need?'], parentPrompts: ['Ask your student about their team role'] },
      { week: 2, studentPrompts: ['What patterns are you noticing in the data?', 'How has your perspective changed?'], teacherPrompts: ['Are all students engaged?', 'What resources are needed?'], parentPrompts: ['Discuss environmental habits at home'] },
      { week: 3, studentPrompts: ['Which stakeholder perspective surprised you most?', 'How is your team collaborating?'], teacherPrompts: ['How is data quality?', 'Any team conflicts?'], parentPrompts: ['Ask about stakeholder interviews'] },
      { week: 4, studentPrompts: ['Is your problem definition clear and focused?', 'What assumptions have you challenged?'], teacherPrompts: ['Are problems well-defined?', 'Ready for solutions?'], parentPrompts: ['Discuss the problem they\'re solving'] },
      { week: 5, studentPrompts: ['Which solution idea excites you most?', 'How are you evaluating feasibility?'], teacherPrompts: ['Is creativity flowing?', 'Any groups stuck?'], parentPrompts: ['Brainstorm solutions together'] },
      { week: 6, studentPrompts: ['What did you learn from prototype testing?', 'How did you handle feedback?'], teacherPrompts: ['Quality of prototypes?', 'Iteration happening?'], parentPrompts: ['Ask to see their prototype'] },
      { week: 7, studentPrompts: ['How confident are you in your solution?', 'What worries you about implementation?'], teacherPrompts: ['Solutions ready?', 'Implementation realistic?'], parentPrompts: ['Offer encouragement'] },
      { week: 8, studentPrompts: ['How is the pilot going?', 'What unexpected challenges arose?'], teacherPrompts: ['Implementation smooth?', 'Students handling stress?'], parentPrompts: ['Celebrate their leadership'] },
      { week: 9, studentPrompts: ['What impact can you measure?', 'How do you feel about presenting?'], teacherPrompts: ['Data complete?', 'Presentations ready?'], parentPrompts: ['Help practice presentation'] },
      { week: 10, studentPrompts: ['What are you most proud of?', 'How will you continue this work?'], teacherPrompts: ['All students contributing?', 'Celebration planned?'], parentPrompts: ['Attend the presentation!'] }
    ],
    troubleshooting: {
      challenges: [
        {
          issue: 'Students overwhelmed by project scope',
          signs: ['Paralysis', 'Disengagement', 'Anxiety', 'Conflict'],
          solutions: ['Break into smaller milestones', 'Reduce scope', 'Provide templates', 'Celebrate small wins'],
          prevention: 'Clear phase-by-phase structure with regular check-ins'
        },
        {
          issue: 'Stakeholders not responding',
          signs: ['Unanswered emails', 'Cancelled meetings', 'Limited engagement'],
          solutions: ['Have backup contacts', 'Leverage school connections', 'Use teacher network', 'Try different approach'],
          prevention: 'Build stakeholder list early with 2-3x needed contacts'
        },
        {
          issue: 'Data collection problems',
          signs: ['Inconsistent data', 'Missing information', 'Technical issues'],
          solutions: ['Simplify data needs', 'Focus on key metrics', 'Provide training', 'Partner with experts'],
          prevention: 'Test all methods first, have backup plans'
        },
        {
          issue: 'Team conflicts',
          signs: ['Arguments', 'Work imbalance', 'Exclusion', 'Missed deadlines'],
          solutions: ['Mediation', 'Role rotation', 'Team building', 'Restructure if needed'],
          prevention: 'Establish norms early, regular team check-ins'
        },
        {
          issue: 'Technology failures',
          signs: ['Lost data', 'Software issues', 'Access problems'],
          solutions: ['Cloud backups', 'Alternative tools', 'Paper backups', 'Tech support'],
          prevention: 'Multiple save locations, test all tech early'
        }
      ]
    },
    modifications: {
      advancedLearners: {
        modifications: ['Add comparative analysis with other schools', 'Develop implementation budget', 'Create teacher training materials'],
        scaffolds: ['Independent research time', 'Expert mentor connection', 'Advanced resources'],
        extensions: ['Present at education conference', 'Write article for publication', 'Design app or website'],
        assessmentAdaptations: ['Higher complexity expectations', 'Leadership role assessment', 'Innovation criteria']
      },
      onLevelLearners: {
        modifications: ['Standard project scope', 'Balanced team roles', 'Grade-appropriate resources'],
        scaffolds: ['Regular check-ins', 'Peer support', 'Clear exemplars'],
        extensions: ['Choice in presentation format', 'Optional additional research', 'Peer mentoring'],
        assessmentAdaptations: ['Standard rubric', 'Multiple format options', 'Revision opportunities']
      },
      strugglingLearners: {
        modifications: ['Reduce data collection sites', 'Simplified analysis', 'Partner support'],
        scaffolds: ['Templates and guides', 'Step-by-step instructions', 'Visual aids'],
        extensions: ['Choice of contribution type', 'Verbal presentation option', 'Paired work'],
        assessmentAdaptations: ['Modified rubric', 'Alternative demonstrations', 'Extended time']
      },
      englishLearners: {
        modifications: ['Bilingual resources', 'Visual-heavy materials', 'Native language brainstorming'],
        scaffolds: ['Vocabulary support', 'Sentence frames', 'Translation tools'],
        extensions: ['Multilingual presentations', 'Cultural perspective addition', 'Family involvement'],
        assessmentAdaptations: ['Language support', 'Visual presentations', 'Collaborative assessment']
      },
      specialEducation: {
        modifications: ['IEP accommodations', 'Adjusted scope', 'Specialized support'],
        scaffolds: ['Task breakdown', 'Frequent check-ins', 'Sensory considerations'],
        extensions: ['Strength-based roles', 'Choice in participation', 'Alternative formats'],
        assessmentAdaptations: ['IEP-aligned assessment', 'Portfolio options', 'Progress-based grading']
      }
    },
    extensions: {
      earlyFinishers: [
        'Create sustainability video documentary',
        'Develop mobile app for tracking environmental impact',
        'Research and propose additional interventions',
        'Mentor other teams or younger students'
      ],
      summerProjects: [
        'Internship with environmental organization',
        'Expand pilot to summer programs',
        'Develop online course for other schools',
        'Plan next year\'s sustainability summit'
      ],
      competitionOpportunities: [
        'National Science Fair with sustainability research',
        'Environmental innovation competitions',
        'Youth climate action summits',
        'Congressional App Challenge with sustainability app'
      ],
      independentStudy: [
        'Advanced research on specific environmental issue',
        'Policy analysis of environmental legislation',
        'Carbon footprint calculation for entire district',
        'Sustainability certification pursuit for school'
      ]
    },
    technologyIntegration: {
      required: [
        { name: 'Spreadsheet software', purpose: 'Data analysis and visualization', freeVersion: true, training: 'Week 1 workshop', studentAccounts: false },
        { name: 'Presentation software', purpose: 'Creating final presentations', freeVersion: true, training: 'Provided templates', studentAccounts: false },
        { name: 'Cloud storage', purpose: 'Collaboration and backup', freeVersion: true, training: 'Quick tutorial', studentAccounts: true }
      ],
      optional: [
        { name: 'Data visualization tools', purpose: 'Advanced charts and infographics', freeVersion: true, training: 'Online tutorials', studentAccounts: false },
        { name: 'Video editing software', purpose: 'Documentation and advocacy', freeVersion: true, training: 'Peer teaching', studentAccounts: false },
        { name: 'Survey platforms', purpose: 'Stakeholder data collection', freeVersion: true, training: 'Template provided', studentAccounts: false }
      ],
      alternatives: [
        { ifNo: 'No computers', then: 'Paper-based data collection', modifications: ['Manual calculations', 'Poster presentations', 'Print materials'] },
        { ifNo: 'No internet', then: 'Offline tools only', modifications: ['Downloaded resources', 'Local storage', 'In-person surveys'] },
        { ifNo: 'No presentation tech', then: 'Alternative formats', modifications: ['Poster boards', 'Handouts', 'Live demonstrations'] }
      ],
      digitalCitizenship: [
        'Appropriate use of social media for advocacy',
        'Respecting privacy in photos and videos',
        'Citing sources and avoiding plagiarism',
        'Professional email communication'
      ]
    }
  },

  // Teacher Support
  teacherSupport: {
    lessonPlans: [
      {
        week: 1,
        day: 1,
        title: 'Project Launch: Inspiration and Vision',
        duration: '50 minutes',
        objectives: ['Understand project scope and importance', 'Feel inspired to make a difference', 'Begin thinking about environmental issues'],
        materials: ['Inspirational video', 'Project overview handout', 'Reflection journals'],
        procedures: [
          { time: '5 min', activity: 'Welcome and energy check-in', grouping: 'whole class', teacherRole: 'Facilitate', studentRole: 'Share feelings' },
          { time: '10 min', activity: 'Watch inspirational video on youth environmental action', grouping: 'whole class', teacherRole: 'Introduce', studentRole: 'Watch and reflect' },
          { time: '20 min', activity: 'Project overview presentation', grouping: 'whole class', teacherRole: 'Present', studentRole: 'Listen and question' },
          { time: '10 min', activity: 'Small group discussion on local environmental issues', grouping: 'small groups', teacherRole: 'Circulate', studentRole: 'Discuss' },
          { time: '5 min', activity: 'Journal reflection on hopes and concerns', grouping: 'individual', teacherRole: 'Prompt', studentRole: 'Write' }
        ],
        assessment: 'Quality of questions asked and engagement level',
        homework: 'Research one environmental issue in our community',
        notes: 'Energy and enthusiasm are key - this sets the tone for the entire project'
      }
    ],
    facilitation: {
      philosophy: 'Teacher as guide and coach, not director. Students own their learning and make key decisions.',
      keyStrategies: [
        'Ask open-ended questions rather than giving answers',
        'Connect students with resources rather than providing all information',
        'Facilitate team discussions without dominating',
        'Model curiosity and learning alongside students',
        'Celebrate mistakes as learning opportunities'
      ],
      questioningTechniques: [
        'What makes you think that?',
        'How might someone else see this differently?',
        'What evidence supports your idea?',
        'What would happen if...?',
        'How does this connect to what we learned about...?'
      ],
      groupManagement: [
        'Establish clear norms from day one',
        'Rotate roles weekly to prevent dominance',
        'Use structured protocols for discussions',
        'Monitor group dynamics daily',
        'Intervene early when issues arise'
      ],
      conflictResolution: [
        'Use restorative circles for team conflicts',
        'Teach "I statements" for expressing concerns',
        'Mediate with neutrality',
        'Focus on project goals, not personalities',
        'Involve students in finding solutions'
      ]
    },
    professionaldevelopment: {
      preLaunch: [
        'Review PBL best practices',
        'Connect with other PBL teachers',
        'Practice facilitation techniques',
        'Prepare for messiness and ambiguity',
        'Plan assessment strategies'
      ],
      duringProject: [
        'Weekly reflection on what\'s working',
        'Peer observation if possible',
        'Online PBL community participation',
        'Student feedback collection',
        'Adjustment and iteration'
      ],
      postProject: [
        'Comprehensive project debrief',
        'Student outcome analysis',
        'Documentation of lessons learned',
        'Sharing with colleagues',
        'Planning for next iteration'
      ],
      resources: [
        'PBLWorks.org for gold standard practices',
        'Edutopia PBL resources',
        'Local PBL network meetings',
        'Books: "Setting the Standard for PBL"',
        'Online courses on project-based learning'
      ],
      community: 'Join #PBLchat on Twitter, local PBL networks, and consider PBL certification'
    },
    parentCommunication: {
      introLetter: 'Dear Families, Your student is embarking on an exciting 10-week journey to become an environmental changemaker...',
      weeklyUpdates: true,
      volunteerOpportunities: [
        'Share professional expertise related to environment',
        'Chaperone field experiences',
        'Attend practice presentations',
        'Help with material preparation',
        'Connect students with community contacts'
      ],
      homeExtensions: [
        'Discuss environmental practices at home',
        'Support data collection activities',
        'Practice presentations together',
        'Visit environmental sites on weekends',
        'Celebrate milestones and growth'
      ],
      showcaseInvitation: 'You\'re invited to our Environmental Action Showcase where students will present their solutions to real decision-makers...'
    }
  },

  // Student Support
  studentSupport: {
    projectGuide: {
      overview: 'You\'re about to become an environmental changemaker! This guide will help you navigate your journey from problem to solution to real impact.',
      timeline: 'Week 1-3: Discover | Week 4: Define | Week 5-7: Develop | Week 8-10: Deliver',
      expectations: [
        'Take ownership of your learning',
        'Collaborate respectfully with all team members',
        'Meet deadlines and communicate challenges',
        'Push beyond your comfort zone',
        'Create professional-quality work'
      ],
      resources: [
        'Team collaboration tools',
        'Research databases',
        'Presentation templates',
        'Peer support network',
        'Teacher office hours'
      ],
      tips: [
        'Document everything - photos, notes, data',
        'Ask for help when you need it',
        'Celebrate small wins along the way',
        'Learn from failures quickly',
        'Keep your end goal in sight'
      ]
    },
    researchProtocol: {
      guidelines: [
        'Always cite your sources',
        'Verify information from multiple sources',
        'Distinguish between facts and opinions',
        'Record all data accurately',
        'Respect intellectual property'
      ],
      credibleSources: [
        'Government environmental agencies',
        'Peer-reviewed scientific journals',
        'Established environmental organizations',
        'University research centers',
        'Local government reports'
      ],
      citationFormat: 'MLA or APA as specified by teacher',
      factChecking: [
        'Cross-reference claims',
        'Check publication dates',
        'Verify author credentials',
        'Look for peer review',
        'Identify potential bias'
      ],
      ethics: [
        'Obtain permission for photos',
        'Anonymize survey responses',
        'Respect confidential information',
        'Give credit to all contributors',
        'Be honest about limitations'
      ]
    },
    collaborationFramework: {
      teamFormation: 'Mixed-ability groups of 4-5 based on interests and complementary skills',
      roles: [
        'Project Manager: Coordinates tasks and deadlines',
        'Lead Researcher: Organizes research efforts',
        'Communications Director: Manages stakeholder contact',
        'Data Analyst: Leads data collection and analysis',
        'Creative Director: Oversees presentations and materials'
      ],
      norms: [
        'Everyone\'s voice matters',
        'Disagree respectfully',
        'Meet deadlines or communicate early',
        'Share the workload fairly',
        'Celebrate together'
      ],
      conflictResolution: [
        'Address issues directly and quickly',
        'Use "I feel" statements',
        'Focus on the project, not personalities',
        'Seek mediation if needed',
        'Document agreements'
      ],
      communication: [
        'Daily stand-up meetings',
        'Shared digital workspace',
        'Weekly progress reports',
        'Clear task assignments',
        'Regular teacher check-ins'
      ]
    },
    presentationResources: {
      formats: [
        'Formal slideshow presentation',
        'Interactive demonstration',
        'Panel discussion format',
        'Poster session',
        'Video presentation'
      ],
      rubric: 'Clear criteria for content, delivery, visuals, and engagement',
      speakingTips: [
        'Practice out loud multiple times',
        'Make eye contact with audience',
        'Use gestures naturally',
        'Speak slowly and clearly',
        'Prepare for questions'
      ],
      visualAids: [
        'Keep slides simple and visual',
        'Use consistent design theme',
        'Include compelling data visualizations',
        'Prepare handouts for complex information',
        'Test all technology beforehand'
      ],
      practice: 'Minimum three practice runs: peer, teacher, and dress rehearsal'
    }
  },

  // Rich Media & Visuals
  media: {
    headerImage: '/images/hero-sustainability-header.jpg',
    galleryImages: [
      '/images/students-waste-audit.jpg',
      '/images/stakeholder-interview.jpg',
      '/images/prototype-testing.jpg',
      '/images/board-presentation.jpg'
    ],
    videos: [
      {
        title: 'Project Launch Video',
        url: 'https://vimeo.com/example1',
        duration: '3:45',
        purpose: 'Inspire students at project kickoff'
      },
      {
        title: 'Student Success Stories',
        url: 'https://vimeo.com/example2',
        duration: '5:20',
        purpose: 'Show impact from previous years'
      }
    ],
    infographics: [
      {
        title: 'Project Journey Map',
        url: '/images/journey-infographic.png',
        description: 'Visual overview of all project phases',
        usage: 'Display in classroom and share with parents'
      },
      {
        title: 'Impact Metrics Dashboard',
        url: '/images/impact-dashboard.png',
        description: 'Visual representation of project outcomes',
        usage: 'Use in final presentation and reports'
      }
    ],
    examples: [
      {
        title: 'Green Team Policy Proposal',
        description: 'Example of student-created policy that was adopted',
        url: '/docs/policy-example.pdf',
        grade: 'A+',
        highlights: ['Clear problem statement', 'Strong evidence', 'Realistic implementation plan']
      },
      {
        title: 'Waste Reduction Presentation',
        description: 'Award-winning student presentation to school board',
        url: '/docs/presentation-example.pdf',
        grade: 'A+',
        highlights: ['Compelling visuals', 'Strong delivery', 'Clear call to action']
      }
    ]
  }
};