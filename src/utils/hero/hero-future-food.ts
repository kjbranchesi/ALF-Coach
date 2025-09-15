import { HeroProjectData } from './types';

export const heroFutureFoodData: HeroProjectData = {
  // Core Metadata
  id: 'hero-future-food',
  title: 'Future of Food: Closed-Loop Cafeteria',
  tagline: 'Transform school cafeterias into zero-waste ecosystems through systems thinking, circular design, and nutrition innovation',
  duration: '8 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Environmental Science', 'Nutrition', 'Business', 'Systems Engineering', 'Data Science', 'Public Health'],
  theme: {
    primary: 'green',
    secondary: 'orange',
    accent: 'yellow',
    gradient: 'from-green-600 to-orange-600'
  },

  // Course Abstract
  courseAbstract: {
    overview: 'Students reimagine their school cafeteria as a living laboratory for sustainability. They start by weighing every piece of food waste for a week - the results are always shocking. Then they become food system designers, creating interventions like "ugly fruit" campaigns, share tables, and composting systems. But here\'s where it gets real: they actually run pilot programs, measure the impact, and present their findings to food service directors who can implement changes district-wide. It\'s like running a sustainability consulting firm, except the client is your own school and the impact is immediate. Students learn that "waste" is just poor design, and they have the power to redesign the entire system.',
    learningObjectives: [
      'Master waste audit methodologies and data collection that reveal hidden patterns in food systems',
      'Design circular economy solutions that turn waste streams into resources',
      'Run real pilot programs with measurable impacts on waste reduction and nutrition improvement',
      'Create implementation plans that food service directors can actually adopt across entire districts'
    ],
    methodology: 'Students operate like sustainability consultants, using design thinking and systems analysis to tackle complex food challenges. The cafeteria becomes their laboratory, where every intervention is tested, measured, and refined based on real data. Teams learn that changing systems requires not just good ideas but careful implementation, stakeholder buy-in, and evidence of impact. Every solution must be practical, scalable, and financially viable.',
    expectedOutcomes: [
      'Cafeteria waste reduced by 30-50% through student-designed interventions that stick',
      'Food service staff become partners, not obstacles, implementing student ideas enthusiastically',
      'District-wide policy changes based on student pilot data - real systemic impact',
      'Students develop professional portfolios showcasing quantifiable environmental achievements',
      'School becomes a model for other institutions, with students presenting at sustainability conferences'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This transformative project addresses the intersection of food waste, nutrition, and sustainability. Students redesign cafeteria systems using circular economy principles, creating measurable impact while developing real-world consulting skills.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '8 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Leaf', label: 'Focus', value: 'Sustainability' },
      { icon: 'Chart', label: 'Impact', value: 'Measurable' }
    ],
    impactStatement: 'Students transform cafeteria waste streams into resources, creating sustainable food systems that improve nutrition while protecting the environment.'
  },

  // Rich Context
  context: {
    problem: 'School cafeterias generate massive waste - up to 100 pounds per day in a typical high school. Meanwhile, many students lack access to nutritious food, and food service budgets are tight. Current systems treat symptoms rather than addressing root causes of waste and poor nutrition.',
    significance: 'This project positions students as systems designers who understand that environmental and nutritional challenges are interconnected opportunities for innovation.',
    realWorld: 'Students work directly with food service directors, sustainability coordinators, and city officials to implement real changes in food systems that affect thousands of meals daily.',
    studentRole: 'Sustainability consultants, data analysts, systems designers, and change agents working to create circular food systems that eliminate waste while improving nutrition.',
    authenticity: 'Every audit uses industry protocols, every intervention is piloted with real users, and every recommendation is presented to actual decision-makers who can implement changes.'
  },

  // Comprehensive Overview
  overview: {
    description: 'Over 8 weeks, students transform from passive cafeteria users to active food system designers. They learn to see waste not as trash but as design failure, and to approach solutions through the lens of circular economy principles. The project combines rigorous data collection with creative problem-solving and real-world implementation.',
    keyFeatures: [
      'Waste Auditing: Professional-grade measurement and analysis of food waste streams',
      'Systems Mapping: Visual representation of cafeteria flows from farm to disposal',
      'Intervention Design: Evidence-based solutions from behavioral nudges to infrastructure changes',
      'Pilot Implementation: Real-world testing of interventions with measurable outcomes',
      'Policy Development: Creation of implementation plans for district-wide adoption'
    ],
    outcomes: [
      'Measurable reduction in cafeteria food waste',
      'Improved student nutrition metrics',
      'Cost savings for food service operations',
      'Scalable models for other schools',
      'Professional portfolio of sustainability achievements'
    ],
    deliverables: [
      {
        name: 'Baseline Waste Audit Report',
        description: 'Comprehensive analysis of current waste streams with data visualizations',
        format: 'Professional report with infographics and recommendations'
      },
      {
        name: 'Systems Redesign Blueprint',
        description: 'Detailed plan for transforming cafeteria into closed-loop system',
        format: 'Visual systems map with implementation roadmap'
      },
      {
        name: 'Pilot Program Results',
        description: 'Data and analysis from intervention testing with ROI calculations',
        format: 'Impact report with before/after metrics'
      },
      {
        name: 'Implementation Toolkit',
        description: 'Resources for food service directors to replicate successful interventions',
        format: 'Operational guide with training materials'
      },
      {
        name: 'Policy Recommendations',
        description: 'District-level proposals for sustainable food service operations',
        format: 'Policy brief with budget analysis'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'Waste is a design flaw - when we redesign food systems using circular economy principles, we can eliminate waste, improve nutrition, and create regenerative cycles that benefit people and planet.',
    essentialQuestion: 'How might we redesign cafeteria systems to reduce waste and improve nutrition while creating economically viable solutions?',
    subQuestions: [
      'What causes food waste in cafeterias and how can we measure it accurately?',
      'How do behavioral nudges influence food choices and waste generation?',
      'What circular economy models can transform waste streams into resources?',
      'How do we create changes that are sustainable both environmentally and financially?'
    ],
    challenge: 'Measure cafeteria waste streams, prototype interventions to reduce waste and improve nutrition, run pilot programs with measurable impact, and present an implementation plan to food service directors and city sustainability offices.',
    drivingQuestion: 'How might we transform our cafeteria from a linear waste-generating system into a circular, regenerative ecosystem?'
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2 weeks',
        focus: 'Understanding current systems and waste patterns',
        activities: [
          {
            name: 'Cafeteria Systems Mapping',
            description: 'Map the flow of food from procurement to disposal',
            duration: '120 minutes',
            outputs: ['Systems diagram', 'Stakeholder map']
          },
          {
            name: 'Baseline Waste Audit',
            description: 'Conduct professional waste characterization study',
            duration: '300 minutes',
            outputs: ['Waste data spreadsheet', 'Category analysis']
          },
          {
            name: 'Nutrition Assessment',
            description: 'Analyze current menu offerings and consumption patterns',
            duration: '90 minutes',
            outputs: ['Nutrition report', 'Consumption data']
          },
          {
            name: 'Stakeholder Interviews',
            description: 'Interview food service staff, students, and administrators',
            duration: '180 minutes',
            outputs: ['Interview transcripts', 'Pain points list']
          },
          {
            name: 'Circular Economy Workshop',
            description: 'Learn principles of zero waste and circular design',
            duration: '90 minutes',
            outputs: ['Concept maps', 'Case studies']
          },
          {
            name: 'Cost Analysis Training',
            description: 'Understand food service budgets and financial constraints',
            duration: '60 minutes',
            outputs: ['Budget breakdown', 'Cost factors']
          },
          {
            name: 'Behavioral Science Primer',
            description: 'Study choice architecture and nudge theory',
            duration: '90 minutes',
            outputs: ['Behavior change strategies', 'Research summary']
          },
          {
            name: 'Benchmark Research',
            description: 'Study successful zero-waste cafeteria programs',
            duration: '120 minutes',
            outputs: ['Best practices guide', 'Case study analysis']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Analyzing data and designing interventions',
        activities: [
          {
            name: 'Data Analysis Workshop',
            description: 'Analyze waste audit data to identify patterns and opportunities',
            duration: '120 minutes',
            outputs: ['Data visualizations', 'Key findings report']
          },
          {
            name: 'Root Cause Analysis',
            description: 'Identify systemic causes of waste using fishbone diagrams',
            duration: '90 minutes',
            outputs: ['Cause-effect diagrams', 'Problem statements']
          },
          {
            name: 'Intervention Brainstorming',
            description: 'Generate creative solutions using design thinking methods',
            duration: '120 minutes',
            outputs: ['Idea bank', 'Concept sketches']
          },
          {
            name: 'Feasibility Assessment',
            description: 'Evaluate interventions for impact, cost, and practicality',
            duration: '90 minutes',
            outputs: ['Feasibility matrix', 'Priority ranking']
          },
          {
            name: 'Prototype Development',
            description: 'Create low-fidelity prototypes of top interventions',
            duration: '180 minutes',
            outputs: ['Prototype designs', 'Testing plans']
          },
          {
            name: 'Stakeholder Co-Design',
            description: 'Refine solutions with food service staff input',
            duration: '90 minutes',
            outputs: ['Refined designs', 'Staff feedback']
          },
          {
            name: 'Pilot Planning',
            description: 'Develop detailed implementation plans for pilots',
            duration: '120 minutes',
            outputs: ['Pilot protocols', 'Timeline']
          },
          {
            name: 'Metrics Definition',
            description: 'Establish KPIs and measurement methods for pilots',
            duration: '60 minutes',
            outputs: ['Metrics framework', 'Data collection tools']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '3 weeks',
        focus: 'Implementing and testing interventions',
        activities: [
          {
            name: 'Pre-Pilot Baseline',
            description: 'Collect baseline data before intervention launch',
            duration: '120 minutes',
            outputs: ['Baseline metrics', 'Control data']
          },
          {
            name: 'Intervention Launch',
            description: 'Implement first intervention with full documentation',
            duration: '180 minutes',
            outputs: ['Launch materials', 'Implementation log']
          },
          {
            name: 'Daily Monitoring',
            description: 'Track waste, participation, and feedback daily',
            duration: '300 minutes',
            outputs: ['Daily data logs', 'Observation notes']
          },
          {
            name: 'Mid-Pilot Adjustments',
            description: 'Analyze early data and refine interventions',
            duration: '90 minutes',
            outputs: ['Adjustment plan', 'Version 2.0']
          },
          {
            name: 'Behavioral Nudge Testing',
            description: 'Test signage, placement, and choice architecture changes',
            duration: '120 minutes',
            outputs: ['A/B test results', 'Behavior change data']
          },
          {
            name: 'Composting System Setup',
            description: 'Establish composting infrastructure and training',
            duration: '180 minutes',
            outputs: ['Compost system', 'Training materials']
          },
          {
            name: 'Share Table Implementation',
            description: 'Create system for sharing unopened food items',
            duration: '120 minutes',
            outputs: ['Share table setup', 'Usage tracking']
          },
          {
            name: 'Menu Optimization Test',
            description: 'Pilot revised menu options based on preference data',
            duration: '150 minutes',
            outputs: ['New menu items', 'Acceptance rates']
          },
          {
            name: 'Cost-Benefit Tracking',
            description: 'Monitor financial impacts of interventions',
            duration: '90 minutes',
            outputs: ['Cost analysis', 'Savings calculations']
          },
          {
            name: 'Stakeholder Check-ins',
            description: 'Regular feedback sessions with all stakeholders',
            duration: '120 minutes',
            outputs: ['Feedback summaries', 'Iteration plans']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '1 week',
        focus: 'Analyzing results and presenting recommendations',
        activities: [
          {
            name: 'Final Data Analysis',
            description: 'Comprehensive analysis of pilot results',
            duration: '180 minutes',
            outputs: ['Statistical analysis', 'Impact metrics']
          },
          {
            name: 'ROI Calculations',
            description: 'Calculate return on investment for each intervention',
            duration: '90 minutes',
            outputs: ['ROI report', 'Payback periods']
          },
          {
            name: 'Scale-Up Planning',
            description: 'Develop plans for district-wide implementation',
            duration: '120 minutes',
            outputs: ['Scale-up roadmap', 'Resource requirements']
          },
          {
            name: 'Toolkit Creation',
            description: 'Package successful interventions for replication',
            duration: '180 minutes',
            outputs: ['Implementation toolkit', 'Training guides']
          },
          {
            name: 'Policy Brief Writing',
            description: 'Draft recommendations for district and city policies',
            duration: '120 minutes',
            outputs: ['Policy brief', 'Executive summary']
          },
          {
            name: 'Presentation Preparation',
            description: 'Create compelling presentation for stakeholders',
            duration: '120 minutes',
            outputs: ['Slide deck', 'Speaking notes']
          },
          {
            name: 'Stakeholder Summit',
            description: 'Present findings to food service directors and officials',
            duration: '120 minutes',
            outputs: ['Live presentation', 'Q&A session']
          },
          {
            name: 'Sustainability Planning',
            description: 'Ensure interventions continue after project ends',
            duration: '90 minutes',
            outputs: ['Sustainability plan', 'Handoff documentation']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        phase: 'Discover',
        title: 'Baseline Established',
        description: 'Complete waste audit and systems analysis',
        evidence: ['Waste data', 'Systems map', 'Stakeholder feedback'],
        celebration: 'Share shocking waste statistics with school'
      },
      {
        week: 4,
        phase: 'Define',
        title: 'Interventions Designed',
        description: 'Finalize intervention designs with stakeholder input',
        evidence: ['Prototype designs', 'Pilot plans', 'Staff buy-in'],
        celebration: 'Launch announcement to cafeteria'
      },
      {
        week: 6,
        phase: 'Develop',
        title: 'Pilots Underway',
        description: 'Multiple interventions running with daily data collection',
        evidence: ['Implementation photos', 'Daily metrics', 'User feedback'],
        celebration: 'First week of waste reduction data'
      },
      {
        week: 7,
        phase: 'Develop',
        title: 'Impact Documented',
        description: 'Clear evidence of waste reduction and improved nutrition',
        evidence: ['Before/after data', 'Cost savings', 'Testimonials'],
        celebration: 'Share success metrics school-wide'
      },
      {
        week: 8,
        phase: 'Deliver',
        title: 'Recommendations Presented',
        description: 'Present to food service directors and city officials',
        evidence: ['Policy brief', 'Implementation toolkit', 'Commitments'],
        celebration: 'Public recognition of achievements'
      }
    ]
  },

  // Assessment Framework
  assessment: {
    formative: [
      'Weekly data collection quality checks',
      'Peer review of intervention designs',
      'Stakeholder feedback on engagement',
      'Daily pilot implementation logs',
      'Iteration documentation'
    ],
    summative: [
      'Professional waste audit report with analysis',
      'Systems redesign blueprint with implementation plan',
      'Pilot results report with statistical analysis',
      'Implementation toolkit for replication',
      'Policy presentation to decision-makers'
    ],
    criteria: [
      'Data collection accuracy and analysis quality',
      'Innovation and feasibility of solutions',
      'Implementation effectiveness',
      'Stakeholder engagement and communication',
      'Measurable impact on waste and nutrition'
    ],
    rubric: [
      {
        category: 'Research & Analysis',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Rigorous data collection with sophisticated analysis revealing actionable insights; professional-quality visualizations'
        },
        proficient: {
          score: 3,
          description: 'Solid data collection and analysis identifying clear patterns; effective visualizations'
        },
        developing: {
          score: 2,
          description: 'Basic data collection with simple analysis; adequate visualizations'
        },
        beginning: {
          score: 1,
          description: 'Incomplete data collection; minimal analysis; poor visualizations'
        }
      },
      {
        category: 'Solution Design',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Innovative, evidence-based interventions addressing root causes; exceptional feasibility and scalability'
        },
        proficient: {
          score: 3,
          description: 'Creative solutions based on research; good feasibility; scalable with modifications'
        },
        developing: {
          score: 2,
          description: 'Basic solutions addressing symptoms; questionable feasibility; limited scalability'
        },
        beginning: {
          score: 1,
          description: 'Superficial solutions; poor feasibility; not scalable'
        }
      },
      {
        category: 'Implementation',
        weight: 20,
        exemplary: {
          score: 4,
          description: 'Flawless pilot execution with adaptive management; comprehensive documentation; exceeded targets'
        },
        proficient: {
          score: 3,
          description: 'Smooth pilot implementation; good documentation; met most targets'
        },
        developing: {
          score: 2,
          description: 'Pilot completed with some issues; basic documentation; some targets met'
        },
        beginning: {
          score: 1,
          description: 'Poor pilot execution; minimal documentation; targets not met'
        }
      },
      {
        category: 'Impact & Measurement',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Dramatic measurable impact on waste and nutrition; rigorous measurement methodology; clear ROI'
        },
        proficient: {
          score: 3,
          description: 'Significant measurable impact; solid measurement approach; positive ROI'
        },
        developing: {
          score: 2,
          description: 'Some measurable impact; basic measurement; unclear ROI'
        },
        beginning: {
          score: 1,
          description: 'Minimal impact; poor measurement; negative or no ROI'
        }
      },
      {
        category: 'Communication & Advocacy',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Compelling presentation securing commitments; professional materials; excellent stakeholder engagement throughout'
        },
        proficient: {
          score: 3,
          description: 'Clear presentation generating interest; good materials; positive stakeholder relationships'
        },
        developing: {
          score: 2,
          description: 'Basic presentation; adequate materials; some stakeholder engagement'
        },
        beginning: {
          score: 1,
          description: 'Poor presentation; weak materials; minimal stakeholder engagement'
        }
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Systems Thinking',
        items: [
          'Map complex food systems from farm to disposal',
          'Identify leverage points for systemic change',
          'Design circular economy solutions',
          'Understand interconnections between nutrition, waste, and economics'
        ]
      },
      {
        category: 'Data Science',
        items: [
          'Conduct rigorous waste audits using industry protocols',
          'Analyze complex datasets to identify patterns',
          'Create compelling data visualizations',
          'Calculate ROI and cost-benefit analyses'
        ]
      },
      {
        category: 'Design & Innovation',
        items: [
          'Apply design thinking to complex problems',
          'Create evidence-based interventions',
          'Prototype and iterate solutions',
          'Scale successful pilots to systems-level change'
        ]
      },
      {
        category: 'Professional Skills',
        items: [
          'Engage diverse stakeholders effectively',
          'Present to decision-makers professionally',
          'Write policy briefs and implementation plans',
          'Manage complex projects with multiple workstreams'
        ]
      }
    ],
    alignments: {
      'NGSS High School': [
        {
          code: 'HS-ESS3-2',
          text: 'Evaluate competing design solutions for managing human impact on the environment',
          application: 'Students design and evaluate multiple interventions to reduce cafeteria waste',
          depth: 'master'
        },
        {
          code: 'HS-ESS3-4',
          text: 'Evaluate or refine technological solutions that reduce impacts of human activities',
          application: 'Students refine waste reduction interventions based on pilot data',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-1',
          text: 'Analyze major global challenges to specify criteria and constraints for solutions',
          application: 'Students analyze food waste as global challenge with local solutions',
          depth: 'develop'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate solutions based on prioritized criteria and trade-offs',
          application: 'Students evaluate interventions using multiple criteria including cost and impact',
          depth: 'master'
        },
        {
          code: 'HS-LS2-7',
          text: 'Design solutions for reducing impacts of human activities on biodiversity',
          application: 'Students connect food waste to environmental impacts',
          depth: 'introduce'
        }
      ],
      'Common Core Math': [
        {
          code: 'HSS-ID.B.6',
          text: 'Represent data on two quantitative variables and describe relationships',
          application: 'Students analyze relationships between interventions and waste reduction',
          depth: 'master'
        },
        {
          code: 'HSS-IC.B.6',
          text: 'Evaluate reports based on data',
          application: 'Students evaluate claims about food waste using collected data',
          depth: 'develop'
        },
        {
          code: 'HSA-CED.A.3',
          text: 'Represent constraints by systems of equations and interpret solutions',
          application: 'Students model food service budget constraints mathematically',
          depth: 'introduce'
        },
        {
          code: 'HSN-Q.A.1',
          text: 'Use units to understand problems and guide solution',
          application: 'Students work with pounds of waste, dollars saved, calories consumed',
          depth: 'master'
        }
      ],
      'Common Core ELA': [
        {
          code: 'RST.11-12.7',
          text: 'Integrate and evaluate multiple sources of information',
          application: 'Students synthesize waste data, stakeholder input, and research',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and evidence',
          application: 'Students write policy briefs with data-supported recommendations',
          depth: 'master'
        },
        {
          code: 'W.11-12.8',
          text: 'Gather relevant information from multiple sources',
          application: 'Students research best practices and case studies',
          depth: 'develop'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly for specific audiences',
          application: 'Students present to food service directors and officials',
          depth: 'master'
        },
        {
          code: 'SL.11-12.5',
          text: 'Make strategic use of digital media in presentations',
          application: 'Students use data visualizations and photos in presentations',
          depth: 'develop'
        }
      ],
      'National Health Education Standards': [
        {
          code: 'Standard 1',
          text: 'Students comprehend concepts related to health promotion',
          application: 'Students understand relationships between nutrition and health',
          depth: 'develop'
        },
        {
          code: 'Standard 2',
          text: 'Students analyze influences on health behaviors',
          application: 'Students analyze factors affecting food choices',
          depth: 'master'
        },
        {
          code: 'Standard 5',
          text: 'Students use decision-making skills to enhance health',
          application: 'Students make evidence-based nutrition recommendations',
          depth: 'develop'
        },
        {
          code: 'Standard 8',
          text: 'Students advocate for health',
          application: 'Students advocate for healthier, sustainable food systems',
          depth: 'master'
        }
      ],
      'C3 Framework Social Studies': [
        {
          code: 'D2.Eco.1.9-12',
          text: 'Analyze economic decisions using cost-benefit analysis',
          application: 'Students calculate ROI for waste reduction interventions',
          depth: 'master'
        },
        {
          code: 'D2.Geo.1.9-12',
          text: 'Use geospatial data to analyze relationships',
          application: 'Students map food systems from farm to cafeteria',
          depth: 'introduce'
        },
        {
          code: 'D4.7.9-12',
          text: 'Assess options for action to address problems',
          application: 'Students evaluate multiple intervention strategies',
          depth: 'develop'
        }
      ]
    },
    skills: [
      {
        category: '21st Century Skills',
        items: [
          'Critical thinking and problem-solving',
          'Communication and collaboration',
          'Creativity and innovation',
          'Data literacy and analysis'
        ]
      },
      {
        category: 'Sustainability Skills',
        items: [
          'Systems thinking and analysis',
          'Circular economy design',
          'Waste audit methodologies',
          'Behavior change strategies'
        ]
      },
      {
        category: 'Professional Skills',
        items: [
          'Project management',
          'Stakeholder engagement',
          'Policy writing',
          'Public presentation'
        ]
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Data Collection Tools',
        items: [
          'Digital scales for waste measurement',
          'Data collection sheets and clipboards',
          'Gloves and safety equipment',
          'Sorting bins for waste characterization',
          'Cameras for documentation'
        ]
      },
      {
        category: 'Analysis Software',
        items: [
          'Spreadsheet software for data analysis',
          'Presentation software',
          'Graphic design tools for signage',
          'Survey tools for feedback collection'
        ]
      },
      {
        category: 'Intervention Materials',
        items: [
          'Signage and display materials',
          'Share table setup materials',
          'Compost bins and training materials',
          'Pilot program supplies (varies by intervention)'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Tools',
        items: [
          'Food waste tracking app',
          'Professional audit software',
          'Digital menu boards',
          'Commercial composting equipment'
        ]
      },
      {
        category: 'External Support',
        items: [
          'Sustainability consultant visits',
          'Nutritionist consultation',
          'Graphic designer for materials',
          'Video equipment for documentation'
        ]
      }
    ],
    community: [
      {
        type: 'Food Service Director',
        role: 'Provide access, data, and implementation support'
      },
      {
        type: 'City Sustainability Office',
        role: 'Share best practices and policy frameworks'
      },
      {
        type: 'Local Farms/Composters',
        role: 'Partner on food recovery and composting'
      },
      {
        type: 'Nutrition Council',
        role: 'Advise on nutrition improvements'
      },
      {
        type: 'Environmental Organizations',
        role: 'Provide expertise and amplify impact'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: {
      primary: ['Food service directors', 'School administrators', 'Cafeteria staff'],
      secondary: ['City sustainability offices', 'School board members', 'Parent organizations'],
      global: ['Other schools seeking models', 'Environmental organizations', 'Policy makers'],
      engagement: 'Weekly stakeholder meetings, pilot participation, final presentation to decision-makers',
      feedback: 'Daily pilot monitoring, stakeholder surveys, implementation commitments'
    },
    personal: [
      'Students develop systems thinking capabilities',
      'Gain real consulting and project management experience',
      'Build confidence in creating institutional change',
      'Develop professional networks in sustainability',
      'Create portfolio showcasing measurable impact'
    ],
    academic: [
      'Integration of science, math, business, and communication',
      'Authentic application of data analysis skills',
      'Real-world problem-solving experience',
      'Professional writing and presentation skills',
      'Evidence-based decision making'
    ],
    community: [
      'Reduced cafeteria waste by 30-50%',
      'Improved student nutrition outcomes',
      'Cost savings for food service operations',
      'Model for other schools to replicate',
      'Increased environmental awareness'
    ],
    methods: [
      {
        method: 'Pilot Implementation',
        format: 'Live testing of interventions in cafeteria',
        venue: 'School cafeteria',
        technology: ['Digital scales', 'Tracking software', 'Signage'],
        preparation: ['Staff training', 'Materials setup', 'Baseline data']
      },
      {
        method: 'Stakeholder Presentation',
        format: 'Formal presentation to decision-makers',
        venue: 'District office or city hall',
        technology: ['Projection equipment', 'Printed materials'],
        preparation: ['Presentation practice', 'Materials printing', 'Data verification']
      },
      {
        method: 'Toolkit Distribution',
        format: 'Resources for replication at other schools',
        venue: 'Online and print distribution',
        technology: ['Website', 'Document sharing', 'Print materials'],
        preparation: ['Toolkit development', 'Website creation', 'Distribution plan']
      },
      {
        method: 'Media Engagement',
        format: 'Press coverage of successful interventions',
        venue: 'Local media outlets',
        technology: ['Press releases', 'Social media'],
        preparation: ['Media training', 'Press kit creation', 'Story development']
      }
    ],
    metrics: [
      {
        metric: 'Waste Reduction',
        target: '30-50% reduction in food waste',
        measurement: 'Daily waste audits during pilots',
        timeline: '3-week pilot period',
        evidence: 'Weight data, photographs, trend analysis'
      },
      {
        metric: 'Cost Savings',
        target: '$5,000+ annual savings identified',
        measurement: 'Financial analysis of interventions',
        timeline: 'End of project',
        evidence: 'Cost-benefit calculations, ROI analysis'
      },
      {
        metric: 'Participation Rate',
        target: '75% student participation in interventions',
        measurement: 'Observation and surveys',
        timeline: 'During pilots',
        evidence: 'Participation logs, survey results'
      },
      {
        metric: 'Nutrition Improvement',
        target: '20% increase in vegetable consumption',
        measurement: 'Plate waste studies',
        timeline: 'During menu optimization pilot',
        evidence: 'Consumption data, waste analysis'
      },
      {
        metric: 'Stakeholder Buy-in',
        target: '3+ interventions adopted permanently',
        measurement: 'Implementation commitments',
        timeline: 'End of project',
        evidence: 'Written commitments, budget allocations'
      },
      {
        metric: 'Replication',
        target: '5+ schools request toolkit',
        measurement: 'Toolkit distribution tracking',
        timeline: '6 months post-project',
        evidence: 'Download data, implementation reports'
      }
    ],
    sustainability: {
      continuation: 'Establish green team to maintain interventions',
      maintenance: 'Monthly waste audits and system adjustments',
      evolution: 'Annual innovation challenges for new solutions',
      legacy: 'Toolkit enables any school to replicate',
      funding: 'Cost savings fund continued improvements',
      partnerships: 'Formal agreements with city and district'
    },
    scalability: {
      classroom: 'Single cafeteria line pilot',
      school: 'Entire cafeteria transformation',
      district: 'District-wide implementation plan',
      city: 'Municipal food waste reduction program',
      beyond: 'Model for institutional food service nationwide'
    }
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule ideal for extended cafeteria work',
      touchpoints: 'Daily during pilots, weekly stakeholder meetings',
      flexibility: 'Can compress to 6 weeks or extend to 10'
    },
    budget: {
      basic: '$500 for scales, materials, and printing',
      enhanced: '$2000 including consultant visits and equipment',
      grants: 'Available from environmental foundations and USDA'
    },
    stakeholders: {
      school: 'Food service director partnership essential',
      parents: 'PTA support for pilots and publicity',
      community: 'City sustainability office collaboration valuable'
    },
    challenges: [
      {
        challenge: 'Food service resistance to change',
        solution: 'Early engagement, show cost savings, start small'
      },
      {
        challenge: 'Health code regulations',
        solution: 'Work with health department, follow all guidelines'
      },
      {
        challenge: 'Student participation in pilots',
        solution: 'Make it fun, offer incentives, peer champions'
      },
      {
        challenge: 'Data collection burden',
        solution: 'Rotate teams, streamline methods, use technology'
      }
    ],
    support: {
      training: 'Teacher workshop on waste auditing and systems thinking',
      materials: 'Complete audit protocols and intervention guides',
      mentorship: 'Connect with sustainability professionals',
      network: 'Join school green teams network'
    }
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Provide data collection templates',
      'Assign specific, concrete roles',
      'Partner with stronger students for analysis',
      'Focus on one intervention instead of multiple',
      'Offer alternative presentation formats'
    ],
    forAdvanced: [
      'Conduct lifecycle assessments of food items',
      'Develop original intervention strategies',
      'Create predictive models for waste',
      'Write for publication in sustainability journals',
      'Present at environmental conferences'
    ],
    modifications: [
      'Adjust pilot scale based on capacity',
      'Simplify data analysis for younger students',
      'Provide more scaffolding for stakeholder engagement',
      'Allow virtual participation in some activities',
      'Flexible timeline based on pilot results'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Zero Waste Summit',
    venue: 'School cafeteria transformed into presentation space',
    audience: 'District officials, city representatives, media, other schools',
    components: [
      'Before/after data gallery',
      'Live demonstration of interventions',
      'Student panel discussion',
      'Toolkit launch and distribution',
      'Commitment ceremony with officials'
    ],
    artifacts: [
      'Professional audit reports',
      'Implementation toolkit',
      'Policy recommendations',
      'Impact documentation',
      'Media coverage compilation'
    ]
  }
};