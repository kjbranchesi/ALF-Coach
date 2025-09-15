import { HeroProjectData } from './types';

export const heroMoveFairData: HeroProjectData = {
  // Core Metadata
  id: 'hero-move-fair',
  title: 'Move Fair: Rethinking Neighborhood Mobility',
  tagline: 'Transform transportation inequity into actionable solutions through field research, data visualization, and community-driven interventions',
  duration: '10 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Urban Studies', 'Geography', 'Data Science', 'Social Justice', 'Public Policy', 'Mathematics'],
  theme: {
    primary: 'purple',
    secondary: 'orange',
    accent: 'teal',
    gradient: 'from-purple-600 to-orange-600'
  },

  // Course Abstract
  courseAbstract: {
    overview: 'Students become urban mobility detectives, uncovering hidden patterns of transportation inequity in their neighborhoods. Armed with clipboards, cameras, and counting apps, they document how people actually move through underserved areas - from dangerous crosswalks to missing bus shelters to sidewalks that end abruptly. But they don\'t stop at identifying problems. Teams design and test real interventions like pop-up bike lanes, guerrilla wayfinding systems, and tactical crosswalks. The project culminates with students presenting their findings to city planners and transit agencies, turning their research into policy briefs that shape real urban planning decisions.',
    learningObjectives: [
      'Master field research methods including mobility audits, pedestrian counts, and accessibility assessments that reveal transportation patterns',
      'Transform raw transportation data into compelling visualizations that make inequity visible and actionable',
      'Design and test low-cost mobility interventions that can be implemented quickly with community support',
      'Navigate the complexity of urban planning systems to advocate effectively for transportation justice'
    ],
    methodology: 'Students work as urban planning consultants specializing in mobility justice. They adopt specific neighborhood blocks as their "clients," conducting professional-grade audits and community engagement. Using tactical urbanism approaches, teams prototype quick, cheap interventions that demonstrate what\'s possible. The hands-on fieldwork combined with data analysis creates a powerful learning experience where students see their neighborhoods through new eyes and gain the tools to reshape them.',
    expectedOutcomes: [
      'Students uncover shocking mobility gaps - like bus stops without sidewalks or schools surrounded by dangerous streets',
      'Community members become co-researchers, sharing stories that data alone can\'t capture about daily mobility struggles',
      'Pop-up interventions generate immediate impact, with some temporary solutions becoming permanent improvements',
      'City planners incorporate student research into official transportation plans and grant applications',
      'Students develop professional skills in GIS mapping, data visualization, and policy writing that open career pathways'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This comprehensive urban mobility project was designed using ALF Coach to tackle a critical challenge: How can students identify and address transportation inequities that affect their communities daily lives?',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '10 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Target', label: 'Subjects', value: '6 Areas' },
      { icon: 'Award', label: 'Standards', value: '18+ Aligned' }
    ],
    impactStatement: 'Students transform transportation inequity data into real infrastructure improvements and policy changes.'
  },

  // Rich Context
  context: {
    problem: 'Transportation shapes opportunity, yet many neighborhoods lack safe, reliable mobility options. Students see these inequities daily but rarely have the tools or platform to document problems and advocate for solutions.',
    significance: 'This project empowers students to become mobility justice advocates, using professional urban planning methods to create real change in their communities.',
    realWorld: 'Students conduct actual transportation audits, create data used by city planners, test interventions on real streets, and present to transportation agencies.',
    studentRole: 'Urban mobility researchers, data analysts, tactical urbanists, and transportation justice advocates working to improve neighborhood accessibility.',
    authenticity: 'Every activity mirrors real urban planning work while building critical academic skills and civic engagement.'
  },

  // Comprehensive Overview
  overview: {
    description: 'This blueprint transforms students into urban mobility experts who can identify transportation inequities, visualize complex data patterns, design interventions, and advocate for policy change. Over 10 weeks, teams adopt neighborhood blocks, conduct comprehensive mobility audits, and create solutions that address real transportation challenges.',
    keyFeatures: [
      'Field Research Methods: Students conduct pedestrian counts, accessibility audits, and transit observations using professional protocols',
      'Data Visualization: Teams create heat maps, flow diagrams, and story maps that make mobility patterns visible and compelling',
      'Tactical Urbanism: Students design and implement temporary interventions like pop-up bike lanes and wayfinding systems',
      'Community Engagement: Teams interview residents, facilitate workshops, and build coalitions for transportation improvements',
      'Policy Advocacy: Students write professional briefs and present to city planners, transit agencies, and community boards'
    ],
    outcomes: [
      'Comprehensive mobility assessment of target neighborhoods',
      'Data visualizations adopted by city planning departments',
      'Temporary interventions that demonstrate feasibility',
      'Policy recommendations incorporated into transportation plans',
      'Strengthened community advocacy networks'
    ],
    deliverables: [
      {
        name: 'Neighborhood Mobility Audit',
        description: 'Professional assessment of transportation infrastructure, safety, and accessibility',
        format: 'Technical report with maps, photos, and quantitative analysis (15-20 pages)'
      },
      {
        name: 'Data Visualization Portfolio',
        description: 'Interactive maps and infographics showing mobility patterns and inequities',
        format: 'Digital portfolio with GIS maps, charts, and story maps'
      },
      {
        name: 'Intervention Prototype',
        description: 'Tested tactical urbanism intervention with documentation and impact assessment',
        format: 'Design portfolio with before/after analysis and community feedback'
      },
      {
        name: 'Policy Brief',
        description: 'Professional recommendations for transportation improvements',
        format: 'Executive summary with supporting data and implementation roadmap'
      },
      {
        name: 'Community Presentation',
        description: 'Public presentation to stakeholders and decision-makers',
        format: 'Slide deck, handouts, and demonstration materials'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'Mobility choices shape equity - transportation infrastructure determines who can access opportunities, services, and community life, making fair mobility a foundation for justice.',
    essentialQuestion: 'How might we improve safe, fair mobility for underserved neighborhoods through research, design, and advocacy?',
    subQuestions: [
      'What mobility barriers do residents face in accessing essential services and opportunities?',
      'How can we make transportation inequities visible through data and storytelling?',
      'What low-cost interventions could immediately improve neighborhood mobility?',
      'How do we build coalitions to sustain transportation improvements?'
    ],
    challenge: 'Conduct comprehensive mobility audits, visualize transportation inequities, prototype interventions, and advocate for policy changes that improve neighborhood accessibility.',
    drivingQuestion: 'How might we transform our neighborhoods into models of mobility justice where everyone can move safely and freely?'
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2.5 weeks',
        focus: 'Understanding mobility systems and research methods',
        activities: [
          {
            name: 'Mobility Justice Workshop',
            description: 'Explore how transportation shapes opportunity and learn about mobility equity frameworks',
            duration: '90 minutes',
            outputs: ['Personal mobility maps', 'Equity framework notes']
          },
          {
            name: 'Neighborhood Selection',
            description: 'Identify and adopt specific blocks or corridors for deep study based on equity indicators',
            duration: '60 minutes',
            outputs: ['Study area maps', 'Selection rationale']
          },
          {
            name: 'Field Research Training',
            description: 'Learn professional audit methods including pedestrian counts, accessibility assessments, and safety evaluations',
            duration: '120 minutes',
            outputs: ['Research protocols', 'Data collection tools']
          },
          {
            name: 'Initial Neighborhood Walk',
            description: 'Conduct first observational walk to identify obvious mobility challenges and opportunities',
            duration: '90 minutes',
            outputs: ['Photo documentation', 'Initial observations']
          },
          {
            name: 'Stakeholder Mapping',
            description: 'Identify key community members, organizations, and officials involved in transportation',
            duration: '60 minutes',
            outputs: ['Stakeholder map', 'Contact list']
          },
          {
            name: 'Data Source Investigation',
            description: 'Locate existing transportation data including crash statistics, transit usage, and demographic information',
            duration: '90 minutes',
            outputs: ['Data inventory', 'Access permissions']
          },
          {
            name: 'Community Partnership Building',
            description: 'Connect with neighborhood groups, disability advocates, and transit riders to understand lived experiences',
            duration: '90 minutes',
            outputs: ['Partnership agreements', 'Meeting notes']
          },
          {
            name: 'Research Question Refinement',
            description: 'Develop specific, measurable research questions based on initial findings',
            duration: '60 minutes',
            outputs: ['Research questions', 'Hypothesis statements']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Conducting systematic research and analysis',
        activities: [
          {
            name: 'Comprehensive Mobility Audit',
            description: 'Conduct detailed assessment of sidewalks, crosswalks, transit stops, and bike infrastructure',
            duration: '180 minutes',
            outputs: ['Audit forms', 'Infrastructure inventory']
          },
          {
            name: 'Pedestrian and Traffic Counts',
            description: 'Collect quantitative data on pedestrian volumes, vehicle speeds, and modal splits',
            duration: '120 minutes',
            outputs: ['Count data', 'Pattern analysis']
          },
          {
            name: 'Accessibility Assessment',
            description: 'Evaluate ADA compliance and universal design using wheelchairs and mobility aids',
            duration: '90 minutes',
            outputs: ['Accessibility report', 'Barrier documentation']
          },
          {
            name: 'Transit User Interviews',
            description: 'Interview residents about daily travel patterns, challenges, and needs',
            duration: '120 minutes',
            outputs: ['Interview transcripts', 'Journey maps']
          },
          {
            name: 'Safety Hotspot Analysis',
            description: 'Map crash data, near-misses, and perceived danger zones using GIS tools',
            duration: '90 minutes',
            outputs: ['Safety heat maps', 'Incident database']
          },
          {
            name: 'Equity Impact Assessment',
            description: 'Analyze how mobility barriers affect different demographic groups disproportionately',
            duration: '90 minutes',
            outputs: ['Equity analysis', 'Disparity metrics']
          },
          {
            name: 'Data Synthesis Workshop',
            description: 'Combine quantitative and qualitative findings to identify priority issues',
            duration: '120 minutes',
            outputs: ['Synthesis report', 'Priority matrix']
          },
          {
            name: 'Problem Statement Development',
            description: 'Create clear, actionable problem statements based on research findings',
            duration: '60 minutes',
            outputs: ['Problem statements', 'Theory of change']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '3.5 weeks',
        focus: 'Designing and testing interventions',
        activities: [
          {
            name: 'Intervention Brainstorming',
            description: 'Generate creative solutions ranging from quick fixes to systemic changes',
            duration: '90 minutes',
            outputs: ['Idea bank', 'Feasibility matrix']
          },
          {
            name: 'Tactical Urbanism Training',
            description: 'Learn about temporary interventions like pop-up bike lanes, parklets, and guerrilla wayfinding',
            duration: '120 minutes',
            outputs: ['Tactical toolkit', 'Case studies']
          },
          {
            name: 'Intervention Design Studio',
            description: 'Create detailed designs for selected interventions including materials, costs, and installation plans',
            duration: '180 minutes',
            outputs: ['Design drawings', 'Material lists']
          },
          {
            name: 'Community Co-Design Session',
            description: 'Workshop intervention ideas with residents to ensure community buy-in and cultural relevance',
            duration: '120 minutes',
            outputs: ['Community feedback', 'Refined designs']
          },
          {
            name: 'Prototype Construction',
            description: 'Build small-scale models or temporary installations of proposed interventions',
            duration: '180 minutes',
            outputs: ['Physical prototypes', 'Installation guides']
          },
          {
            name: 'Pilot Implementation',
            description: 'Test interventions in real neighborhood settings with proper permissions and safety measures',
            duration: '240 minutes',
            outputs: ['Pilot documentation', 'Time-lapse photos']
          },
          {
            name: 'Impact Measurement',
            description: 'Collect before/after data on pedestrian behavior, safety perceptions, and community response',
            duration: '120 minutes',
            outputs: ['Impact metrics', 'User surveys']
          },
          {
            name: 'Data Visualization Creation',
            description: 'Develop compelling maps, infographics, and story maps showing problems and solutions',
            duration: '180 minutes',
            outputs: ['Interactive maps', 'Data dashboards']
          },
          {
            name: 'Policy Framework Research',
            description: 'Study existing transportation policies and identify leverage points for change',
            duration: '90 minutes',
            outputs: ['Policy analysis', 'Change opportunities']
          },
          {
            name: 'Cost-Benefit Analysis',
            description: 'Calculate implementation costs and projected benefits of proposed interventions',
            duration: '90 minutes',
            outputs: ['Budget estimates', 'ROI calculations']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '2 weeks',
        focus: 'Presenting findings and advocating for change',
        activities: [
          {
            name: 'Policy Brief Writing',
            description: 'Draft professional policy recommendations with executive summary and supporting evidence',
            duration: '180 minutes',
            outputs: ['Policy brief', 'Technical appendices']
          },
          {
            name: 'Presentation Design',
            description: 'Create compelling slide deck with visualizations, photos, and clear recommendations',
            duration: '120 minutes',
            outputs: ['Slide deck', 'Handout materials']
          },
          {
            name: 'Public Speaking Preparation',
            description: 'Practice presenting to different audiences and handling questions',
            duration: '90 minutes',
            outputs: ['Speaking notes', 'Q&A prep']
          },
          {
            name: 'City Planning Presentation',
            description: 'Present findings and recommendations to city planners and transportation officials',
            duration: '90 minutes',
            outputs: ['Formal presentation', 'Meeting minutes']
          },
          {
            name: 'Community Forum',
            description: 'Share results with neighborhood residents and gather support for implementation',
            duration: '120 minutes',
            outputs: ['Community presentation', 'Petition signatures']
          },
          {
            name: 'Media Outreach',
            description: 'Create press releases and engage local media to amplify findings',
            duration: '90 minutes',
            outputs: ['Press release', 'Media coverage']
          },
          {
            name: 'Implementation Planning',
            description: 'Develop detailed roadmap for turning recommendations into reality',
            duration: '90 minutes',
            outputs: ['Implementation timeline', 'Partner commitments']
          },
          {
            name: 'Project Documentation',
            description: 'Compile comprehensive project portfolio for future reference and replication',
            duration: '120 minutes',
            outputs: ['Project archive', 'Replication guide']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        phase: 'Discover',
        title: 'Research Launch',
        description: 'Complete initial neighborhood assessment and establish community partnerships',
        evidence: ['Study area selection', 'Stakeholder agreements', 'Research protocols'],
        celebration: 'Neighborhood walk with community partners'
      },
      {
        week: 4,
        phase: 'Define',
        title: 'Data Collection Complete',
        description: 'Finish comprehensive mobility audit with quantitative and qualitative data',
        evidence: ['Audit reports', 'Interview transcripts', 'Data visualizations'],
        celebration: 'Data gallery showcasing initial findings'
      },
      {
        week: 6,
        phase: 'Develop',
        title: 'Intervention Design',
        description: 'Complete intervention designs with community input and feasibility analysis',
        evidence: ['Design portfolio', 'Community feedback', 'Budget estimates'],
        celebration: 'Design showcase with community voting'
      },
      {
        week: 8,
        phase: 'Develop',
        title: 'Pilot Implementation',
        description: 'Successfully test tactical urbanism intervention in neighborhood',
        evidence: ['Installation photos', 'Impact data', 'User testimonials'],
        celebration: 'Pop-up celebration at intervention site'
      },
      {
        week: 10,
        phase: 'Deliver',
        title: 'Policy Presentation',
        description: 'Present findings to city planners and secure commitments for change',
        evidence: ['Policy brief', 'Presentation recording', 'Official response'],
        celebration: 'Recognition ceremony with city officials'
      }
    ]
  },

  // Assessment Framework
  assessment: {
    formative: [
      'Weekly research logs documenting field observations and reflections',
      'Peer reviews of data collection methods and analysis',
      'Community partner feedback on engagement quality',
      'Iteration documentation showing design refinements'
    ],
    summative: [
      'Comprehensive mobility audit report with professional-quality analysis',
      'Data visualization portfolio demonstrating technical and design skills',
      'Intervention prototype with impact assessment',
      'Policy brief meeting professional planning standards',
      'Public presentation evaluated by community stakeholders'
    ],
    criteria: [
      'Research rigor and data quality',
      'Analysis depth and insight generation',
      'Solution creativity and feasibility',
      'Communication clarity and persuasiveness',
      'Community engagement and collaboration'
    ],
    rubric: [
      {
        category: 'Research Quality',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Comprehensive data collection using multiple methods; rigorous analysis revealing deep insights; professional documentation exceeding industry standards'
        },
        proficient: {
          score: 3,
          description: 'Thorough data collection with appropriate methods; solid analysis identifying key patterns; clear documentation meeting professional standards'
        },
        developing: {
          score: 2,
          description: 'Basic data collection with some gaps; surface-level analysis; adequate documentation with minor issues'
        },
        beginning: {
          score: 1,
          description: 'Limited data collection; minimal analysis; documentation lacks clarity or completeness'
        }
      },
      {
        category: 'Solution Design',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Innovative interventions addressing root causes; detailed implementation plans; strong feasibility analysis; clear evidence of iteration'
        },
        proficient: {
          score: 3,
          description: 'Creative solutions addressing key problems; solid implementation planning; reasonable feasibility assessment; some iteration shown'
        },
        developing: {
          score: 2,
          description: 'Basic solutions addressing surface issues; general implementation ideas; limited feasibility consideration; minimal iteration'
        },
        beginning: {
          score: 1,
          description: 'Vague solutions; unclear implementation; feasibility not addressed; no iteration evident'
        }
      },
      {
        category: 'Data Visualization',
        weight: 20,
        exemplary: {
          score: 4,
          description: 'Professional-quality visualizations that reveal insights; innovative use of mapping and graphics; accessibility considered; tells compelling story'
        },
        proficient: {
          score: 3,
          description: 'Clear visualizations supporting arguments; appropriate use of maps and charts; generally accessible; coherent narrative'
        },
        developing: {
          score: 2,
          description: 'Basic visualizations with some clarity issues; limited variety; accessibility gaps; narrative somewhat unclear'
        },
        beginning: {
          score: 1,
          description: 'Unclear or missing visualizations; poor design choices; not accessible; no clear narrative'
        }
      },
      {
        category: 'Community Engagement',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Deep, sustained engagement with diverse stakeholders; authentic partnership building; community voice centered; cultural competence demonstrated'
        },
        proficient: {
          score: 3,
          description: 'Regular engagement with key stakeholders; respectful partnerships; community input incorporated; cultural awareness shown'
        },
        developing: {
          score: 2,
          description: 'Some stakeholder engagement; basic partnerships; limited community input; minimal cultural consideration'
        },
        beginning: {
          score: 1,
          description: 'Minimal engagement; no real partnerships; community voice absent; cultural insensitivity'
        }
      },
      {
        category: 'Policy Advocacy',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Compelling policy recommendations with clear implementation path; professional presentation to officials; secured commitments; built coalition'
        },
        proficient: {
          score: 3,
          description: 'Solid policy recommendations with implementation ideas; effective presentation; generated interest; some coalition building'
        },
        developing: {
          score: 2,
          description: 'Basic policy ideas; adequate presentation; limited official engagement; minimal coalition work'
        },
        beginning: {
          score: 1,
          description: 'Vague policy suggestions; weak presentation; no official engagement; no coalition building'
        }
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Research & Analysis',
        items: [
          'Conduct systematic transportation audits using professional methods',
          'Analyze mobility patterns to identify systemic inequities',
          'Synthesize quantitative and qualitative data into actionable insights',
          'Evaluate infrastructure through equity and accessibility lenses'
        ]
      },
      {
        category: 'Design & Innovation',
        items: [
          'Apply tactical urbanism principles to create interventions',
          'Design solutions that center community needs and voices',
          'Prototype and test mobility improvements iteratively',
          'Balance creativity with practical constraints'
        ]
      },
      {
        category: 'Communication & Advocacy',
        items: [
          'Create compelling data visualizations that reveal patterns',
          'Write professional policy briefs with evidence-based recommendations',
          'Present findings effectively to diverse stakeholders',
          'Build coalitions for sustained advocacy'
        ]
      },
      {
        category: 'Systems Thinking',
        items: [
          'Understand transportation as interconnected systems',
          'Recognize how mobility shapes opportunity and equity',
          'Identify leverage points for systemic change',
          'Consider unintended consequences of interventions'
        ]
      }
    ],
    alignments: {
      'C3 Framework for Social Studies': [
        {
          code: 'D2.Geo.1.9-12',
          text: 'Use geospatial technologies and geographical representations to analyze spatial patterns',
          application: 'Students use GIS to map mobility inequities and create data visualizations',
          depth: 'master'
        },
        {
          code: 'D2.Geo.7.9-12',
          text: 'Analyze how relationships between humans and environments extend or limit justice',
          application: 'Students examine how transportation infrastructure affects equity and opportunity',
          depth: 'master'
        },
        {
          code: 'D2.Civ.13.9-12',
          text: 'Evaluate public policies in terms of intended and unintended outcomes',
          application: 'Students assess transportation policies and propose evidence-based changes',
          depth: 'develop'
        },
        {
          code: 'D4.7.9-12',
          text: 'Assess options for individual and collective action to address local problems',
          application: 'Students design and test interventions while building advocacy coalitions',
          depth: 'master'
        },
        {
          code: 'D4.8.9-12',
          text: 'Apply a range of deliberative and democratic strategies to make decisions',
          application: 'Students engage community members and officials in decision-making',
          depth: 'develop'
        }
      ],
      'NGSS High School': [
        {
          code: 'HS-ETS1-1',
          text: 'Analyze major global challenges to specify qualitative and quantitative criteria for solutions',
          application: 'Students define mobility problems using data and community input',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-2',
          text: 'Design solutions to complex real-world problems by breaking them down into smaller problems',
          application: 'Students decompose transportation challenges into manageable interventions',
          depth: 'develop'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate solutions based on prioritized criteria and trade-offs',
          application: 'Students assess interventions using multiple criteria including equity and feasibility',
          depth: 'master'
        },
        {
          code: 'HS-ESS3-4',
          text: 'Evaluate or refine technological solutions that reduce impacts of human activities',
          application: 'Students design sustainable transportation solutions',
          depth: 'develop'
        },
        {
          code: 'HS-ESS3-2',
          text: 'Evaluate competing design solutions for developing and utilizing energy and mineral resources',
          application: 'Students consider environmental impacts of transportation choices',
          depth: 'introduce'
        }
      ],
      'Common Core Math': [
        {
          code: 'HSS-ID.B.6',
          text: 'Represent data on two quantitative variables on a scatter plot and describe relationships',
          application: 'Students create visualizations showing relationships between mobility and demographics',
          depth: 'master'
        },
        {
          code: 'HSS-IC.B.6',
          text: 'Evaluate reports based on data',
          application: 'Students critically analyze transportation studies and city data',
          depth: 'develop'
        },
        {
          code: 'HSA-CED.A.3',
          text: 'Represent constraints by equations or inequalities and interpret solutions',
          application: 'Students model transportation access constraints mathematically',
          depth: 'introduce'
        },
        {
          code: 'HSG-MG.A.3',
          text: 'Apply geometric methods to solve design problems',
          application: 'Students design spatial interventions using geometric principles',
          depth: 'develop'
        },
        {
          code: 'HSN-Q.A.1',
          text: 'Use units as a way to understand problems and guide solution',
          application: 'Students work with distance, time, speed, and capacity units',
          depth: 'master'
        }
      ],
      'Common Core ELA': [
        {
          code: 'RST.11-12.7',
          text: 'Integrate and evaluate multiple sources of information presented in diverse formats',
          application: 'Students synthesize data, interviews, observations, and documents',
          depth: 'master'
        },
        {
          code: 'RST.11-12.9',
          text: 'Synthesize information from a range of sources into a coherent understanding',
          application: 'Students combine research findings into comprehensive assessments',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and relevant evidence',
          application: 'Students write policy briefs with evidence-based recommendations',
          depth: 'master'
        },
        {
          code: 'W.11-12.7',
          text: 'Conduct sustained research projects to answer questions or solve problems',
          application: 'Students conduct 10-week research project on mobility equity',
          depth: 'master'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly, concisely, and logically for audience and purpose',
          application: 'Students present to city officials and community members',
          depth: 'develop'
        },
        {
          code: 'SL.11-12.5',
          text: 'Make strategic use of digital media in presentations to enhance understanding',
          application: 'Students use maps, visualizations, and media in presentations',
          depth: 'master'
        }
      ],
      'ISTE Standards': [
        {
          code: '1.3',
          text: 'Knowledge Constructor - Students critically curate digital resources',
          application: 'Students gather and analyze transportation data from multiple sources',
          depth: 'develop'
        },
        {
          code: '1.4',
          text: 'Innovative Designer - Students use design process to solve problems',
          application: 'Students design and test mobility interventions',
          depth: 'master'
        },
        {
          code: '1.5',
          text: 'Computational Thinker - Students develop and employ strategies using data',
          application: 'Students use data analysis to identify patterns and solutions',
          depth: 'develop'
        },
        {
          code: '1.6',
          text: 'Creative Communicator - Students communicate clearly using digital tools',
          application: 'Students create digital maps and visualizations',
          depth: 'master'
        },
        {
          code: '1.7',
          text: 'Global Collaborator - Students contribute to project teams',
          application: 'Students collaborate with community partners on solutions',
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
          'Digital literacy and data analysis'
        ]
      },
      {
        category: 'Urban Planning Skills',
        items: [
          'Field research and observation methods',
          'GIS mapping and spatial analysis',
          'Community engagement techniques',
          'Policy analysis and writing'
        ]
      },
      {
        category: 'Design Thinking',
        items: [
          'Human-centered design processes',
          'Rapid prototyping and iteration',
          'Systems thinking and complexity',
          'Implementation planning'
        ]
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Field Research Tools',
        items: [
          'Clipboards and audit forms',
          'Measuring wheels or tapes',
          'Cameras or smartphones for documentation',
          'Safety vests for field work',
          'Counting apps or clickers'
        ]
      },
      {
        category: 'Data Analysis Software',
        items: [
          'GIS software (QGIS or ArcGIS Online)',
          'Spreadsheet software for data analysis',
          'Design software (Canva, Adobe, or similar)',
          'Survey tools (Google Forms or similar)'
        ]
      },
      {
        category: 'Prototyping Materials',
        items: [
          'Chalk or temporary marking paint',
          'Traffic cones and safety equipment',
          'Poster boards and markers',
          'Basic construction materials (varies by intervention)'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Tools',
        items: [
          'GPS units for precise mapping',
          'Speed radar guns',
          'Wheelchairs for accessibility testing',
          'Drone for aerial documentation',
          'Professional cameras'
        ]
      },
      {
        category: 'Community Engagement',
        items: [
          'Meeting space for workshops',
          'Translation services',
          'Refreshments for community events',
          'Printing for surveys and flyers'
        ]
      }
    ],
    community: [
      {
        type: 'City Planning Department',
        role: 'Provide data, review findings, consider recommendations'
      },
      {
        type: 'Transit Advocacy Groups',
        role: 'Share expertise, support interventions, amplify findings'
      },
      {
        type: 'Neighborhood Associations',
        role: 'Connect with residents, provide local knowledge, support implementation'
      },
      {
        type: 'Disability Rights Organizations',
        role: 'Advise on accessibility, participate in audits, validate solutions'
      },
      {
        type: 'Local Businesses',
        role: 'Share customer mobility challenges, support interventions, provide resources'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: {
      primary: ['Neighborhood residents', 'City planners and transportation officials', 'Transit advocacy groups'],
      secondary: ['School community', 'Local media', 'Business owners', 'Disability rights organizations'],
      global: ['Other schools doing similar work', 'Urban planning students', 'Transportation justice networks'],
      engagement: 'Continuous community partnership with formal presentations to officials',
      feedback: 'Resident surveys, official responses, media coverage, policy adoption tracking'
    },
    personal: [
      'Students develop professional urban planning skills valuable for careers',
      'Increased civic engagement and belief in ability to create change',
      'Deeper understanding of systemic inequities and justice frameworks',
      'Enhanced spatial thinking and data analysis capabilities',
      'Confidence in public speaking and policy advocacy',
      'Real-world problem-solving experience',
      'Professional network development',
      'Portfolio for college applications'
    ],
    academic: [
      'Integration of geography, math, social studies, and communication skills',
      'Authentic application of data science and visualization techniques',
      'Development of research skills from data collection to analysis',
      'Practice with professional writing and presentation formats',
      'Experience with project management and team collaboration',
      'Critical thinking about complex systems',
      'Evidence-based argumentation skills',
      'Interdisciplinary learning connections'
    ],
    community: [
      'Improved transportation infrastructure benefiting all residents',
      'Increased awareness of mobility challenges facing neighbors',
      'Strengthened advocacy networks for ongoing improvements',
      'Data and analysis used in grant applications and planning',
      'Model for youth engagement in urban planning processes',
      'Catalyzed community organizing around mobility justice',
      'Created baseline data for future planning efforts',
      'Built bridges between residents and city government'
    ],
    methods: [
      {
        method: 'Transportation Justice Summit',
        format: 'Public forum with presentations and interactive exhibits',
        venue: 'City Hall or community center',
        technology: ['Projection equipment', 'Interactive maps', 'Demo materials'],
        preparation: ['Prepare presentations', 'Create exhibits', 'Coordinate speakers', 'Promote event']
      },
      {
        method: 'Pop-Up Demonstrations',
        format: 'Temporary street interventions with community engagement',
        venue: 'Neighborhood streets and public spaces',
        technology: ['Temporary materials', 'Documentation tools', 'Safety equipment'],
        preparation: ['Obtain permits', 'Build installations', 'Plan activities', 'Ensure safety']
      },
      {
        method: 'Policy Briefing Sessions',
        format: 'Formal presentations to city officials and planners',
        venue: 'City council chambers or planning department',
        technology: ['Presentation tools', 'Printed briefs', 'Data visualizations'],
        preparation: ['Refine recommendations', 'Practice presentations', 'Prepare materials', 'Coordinate attendance']
      },
      {
        method: 'Digital Story Maps',
        format: 'Interactive online maps showing problems and solutions',
        venue: 'Project website and social media',
        technology: ['ArcGIS StoryMaps or similar', 'Web hosting', 'Social media'],
        preparation: ['Create narratives', 'Build maps', 'Gather media', 'Launch campaign']
      },
      {
        method: 'Media Advocacy',
        format: 'Press releases, op-eds, and media interviews',
        venue: 'Local newspapers, TV, radio, online outlets',
        technology: ['Press release distribution', 'Social media tools'],
        preparation: ['Write releases', 'Media training', 'Build press list', 'Pitch stories']
      }
    ],
    metrics: [
      {
        metric: 'Infrastructure Improvements',
        target: 'At least 3 physical improvements implemented within 1 year',
        measurement: 'Documentation of changes made',
        timeline: '12 months post-project',
        evidence: 'Before/after photos, city work orders, news coverage'
      },
      {
        metric: 'Policy Adoption',
        target: '50% of recommendations incorporated into planning',
        measurement: 'Review of planning documents and policies',
        timeline: '6-12 months post-project',
        evidence: 'Official documents, meeting minutes, policy changes'
      },
      {
        metric: 'Community Engagement',
        target: '200+ residents directly engaged',
        measurement: 'Participation tracking and surveys',
        timeline: 'Throughout project',
        evidence: 'Sign-in sheets, survey responses, meeting attendance'
      },
      {
        metric: 'Media Coverage',
        target: '10+ media stories about project and findings',
        measurement: 'Media monitoring and compilation',
        timeline: 'Throughout and after project',
        evidence: 'News clips, online articles, social media metrics'
      },
      {
        metric: 'Student Learning',
        target: '100% students demonstrate proficiency in research and advocacy',
        measurement: 'Portfolio assessment and presentations',
        timeline: 'End of project',
        evidence: 'Student work samples, presentation recordings, reflections'
      },
      {
        metric: 'Data Utilization',
        target: 'Data used in 3+ grant applications or planning processes',
        measurement: 'Track usage by city and organizations',
        timeline: '18 months post-project',
        evidence: 'Grant applications, planning documents, citations'
      }
    ],
    sustainability: {
      continuation: 'Establish annual mobility audit program with new student cohorts',
      maintenance: 'Create community monitoring system for improvements',
      evolution: 'Expand to additional neighborhoods each year',
      legacy: 'Develop toolkit for replication in other schools and communities',
      funding: 'Seek grants for ongoing program support',
      partnerships: 'Formalize agreements with city and advocacy groups'
    },
    scalability: {
      classroom: 'Single neighborhood block with one class',
      school: 'Multiple neighborhoods with several classes',
      district: 'District-wide transportation equity assessment',
      city: 'Youth mobility justice network across all high schools',
      beyond: 'National model for student-led transportation advocacy'
    }
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule ideal (90-minute periods); can adapt to traditional periods',
      touchpoints: 'Weekly team meetings; bi-weekly community check-ins; monthly stakeholder updates',
      flexibility: 'Field work can be scheduled flexibly; some activities require off-campus time'
    },
    budget: {
      basic: '$500-1000 for materials, printing, and basic supplies',
      enhanced: '$2000-3000 including GIS licenses, professional printing, and intervention materials',
      grants: 'Available from transportation agencies, community foundations, and youth programs'
    },
    stakeholders: {
      school: 'Administration support for field work; liability considerations for off-campus activities',
      parents: 'Permission for neighborhood research; potential volunteers for supervision',
      community: 'City planning cooperation; transit agency data sharing; neighborhood association support'
    },
    challenges: [
      {
        challenge: 'Safety concerns for student field work',
        solution: 'Clear protocols, adult supervision, safety equipment, defined boundaries'
      },
      {
        challenge: 'City bureaucracy and slow response',
        solution: 'Build relationships early, find champion within city government, manage expectations'
      },
      {
        challenge: 'Limited resources for interventions',
        solution: 'Focus on low-cost tactical solutions, seek donations, apply for mini-grants'
      },
      {
        challenge: 'Varying skill levels with technology',
        solution: 'Peer teaching, simplified tools for beginners, optional advanced features'
      }
    ],
    support: {
      training: '2-day teacher workshop on urban planning methods and project management',
      materials: 'Complete toolkit with audit forms, rubrics, and presentation templates',
      mentorship: 'Connect with local planners and transportation professionals',
      network: 'Join national network of schools doing similar projects'
    }
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Provide pre-made data collection forms and templates',
      'Assign specific, concrete roles within team projects',
      'Offer choice in presentation format (video, poster, etc.)',
      'Break complex tasks into smaller, guided steps',
      'Pair with stronger peers for field work'
    ],
    forAdvanced: [
      'Analyze multiple neighborhoods for comparative studies',
      'Develop original research methodologies',
      'Create interactive web-based data visualizations',
      'Write op-eds for local newspapers',
      'Present at professional planning conferences'
    ],
    modifications: [
      'Adjust geographic scope based on resources',
      'Simplify data collection for younger students',
      'Extend timeline for more in-depth research',
      'Virtual alternatives for some field work',
      'Partner with college urban planning programs'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Transportation Justice Summit',
    venue: 'City Hall or community center',
    audience: 'City officials, community members, media, other schools',
    components: [
      'Gallery of data visualizations and maps',
      'Demonstration of tactical interventions',
      'Student panel discussions',
      'Policy presentation to officials',
      'Community resource fair'
    ],
    artifacts: [
      'Professional mobility audit reports',
      'Interactive story maps',
      'Before/after intervention documentation',
      'Policy briefs and recommendations',
      'Media coverage compilation'
    ]
  },

  // Implementation Guidance
  implementation: {
    timeline: {
      phase1: {
        name: 'Discover',
        weeks: '1-2.5',
        keyActivities: ['Mobility justice framework introduction', 'Field research training', 'Neighborhood selection', 'Initial audits'],
        deliverables: ['Research protocols', 'Study area maps', 'Stakeholder contacts'],
        checkpoints: ['Research questions defined', 'Partnerships established', 'Data sources identified']
      },
      phase2: {
        name: 'Define',
        weeks: '3-4.5',
        keyActivities: ['Comprehensive audits', 'Pedestrian counts', 'Accessibility assessments', 'Community interviews'],
        deliverables: ['Audit reports', 'Data visualizations', 'Problem statements'],
        checkpoints: ['Data collection complete', 'Patterns identified', 'Priorities established']
      },
      phase3: {
        name: 'Develop',
        weeks: '5-8',
        keyActivities: ['Intervention design', 'Community co-design', 'Prototype construction', 'Pilot testing'],
        deliverables: ['Design portfolio', 'Prototype installations', 'Impact assessments'],
        checkpoints: ['Designs approved', 'Prototypes built', 'Testing complete']
      },
      phase4: {
        name: 'Deliver',
        weeks: '9-10',
        keyActivities: ['Policy brief writing', 'Presentation preparation', 'Public forums', 'Media outreach'],
        deliverables: ['Policy recommendations', 'Public presentations', 'Implementation plans'],
        checkpoints: ['Briefs finalized', 'Presentations delivered', 'Commitments secured']
      }
    },
    pacing: {
      daily: ['15-minute team check-ins', 'Documentation updates', 'Data entry and organization'],
      weekly: ['Field work sessions (2-3 hours)', 'Data analysis workshops', 'Community partner meetings', 'Progress presentations'],
      biweekly: ['Stakeholder check-ins', 'Expert consultations', 'Design critiques'],
      monthly: ['Major milestone presentations', 'Community forums', 'Policy maker meetings']
    },
    keyDecisions: [
      { timing: 'Week 1', decision: 'Select neighborhood blocks for study', factors: ['Equity indicators', 'Safety', 'Community partnerships', 'Data availability'] },
      { timing: 'Week 3', decision: 'Focus area for deep investigation', factors: ['Community priorities', 'Data patterns', 'Feasibility', 'Impact potential'] },
      { timing: 'Week 5', decision: 'Select interventions to prototype', factors: ['Cost', 'Community support', 'Quick implementation', 'Demonstration value'] },
      { timing: 'Week 7', decision: 'Choose pilot location and timing', factors: ['Permissions', 'Safety', 'Visibility', 'Community readiness'] },
      { timing: 'Week 9', decision: 'Policy recommendation priorities', factors: ['Political feasibility', 'Cost-benefit', 'Community support', 'Evidence strength'] }
    ],
    commonPitfalls: [
      { pitfall: 'Scope too broad', prevention: 'Define specific block boundaries early', recovery: 'Narrow focus to most critical issues' },
      { pitfall: 'Safety concerns', prevention: 'Establish clear protocols and boundaries', recovery: 'Adjust locations, add supervision' },
      { pitfall: 'City bureaucracy delays', prevention: 'Start permit processes early', recovery: 'Focus on interventions not requiring permits' },
      { pitfall: 'Community skepticism', prevention: 'Build trust through consistent presence', recovery: 'Partner with trusted organizations' },
      { pitfall: 'Data overwhelm', prevention: 'Use structured collection forms', recovery: 'Focus on most actionable data' }
    ],
    successIndicators: {
      early: ['Strong community partnerships formed', 'Quality data collection started', 'Student engagement high'],
      mid: ['Clear patterns emerging from data', 'Community actively participating', 'Interventions generating interest'],
      late: ['Policy makers engaged', 'Media coverage obtained', 'Implementation commitments secured'],
      overall: ['Lasting community relationships', 'Real infrastructure improvements', 'Students empowered as advocates']
    },
    weeklyReflections: [
      { week: 1, studentPrompts: ['What mobility challenges do you face?', 'What assumptions do you have about transportation?'], teacherPrompts: ['Are students seeing inequities?', 'Safety protocols understood?'], parentPrompts: ['Discuss neighborhood mobility'] },
      { week: 2, studentPrompts: ['What patterns are you noticing?', 'Whose voices are missing?'], teacherPrompts: ['Data collection quality?', 'Community engagement respectful?'], parentPrompts: ['Ask about field observations'] },
      { week: 3, studentPrompts: ['What data surprised you most?', 'How do different groups experience mobility differently?'], teacherPrompts: ['Analysis deepening?', 'Equity lens developing?'], parentPrompts: ['Discuss findings together'] },
      { week: 4, studentPrompts: ['What stories do the numbers tell?', 'What would residents change first?'], teacherPrompts: ['Synthesis happening?', 'Community voice centered?'], parentPrompts: ['Review data visualizations'] },
      { week: 5, studentPrompts: ['Which interventions are most feasible?', 'How can we test ideas quickly?'], teacherPrompts: ['Solutions realistic?', 'Creativity balanced with practicality?'], parentPrompts: ['Discuss intervention ideas'] },
      { week: 6, studentPrompts: ['What did co-design teach you?', 'How did community input change your thinking?'], teacherPrompts: ['Community ownership building?', 'Designs improving?'], parentPrompts: ['Attend co-design session'] },
      { week: 7, studentPrompts: ['What worked in the pilot?', 'What would you change?'], teacherPrompts: ['Testing rigorous?', 'Documentation complete?'], parentPrompts: ['Visit pilot installation'] },
      { week: 8, studentPrompts: ['How do we measure success?', 'What evidence is most compelling?'], teacherPrompts: ['Impact clear?', 'Data supporting claims?'], parentPrompts: ['Practice presentations'] },
      { week: 9, studentPrompts: ['What policy changes are most important?', 'How do we build coalitions?'], teacherPrompts: ['Recommendations specific?', 'Advocacy skills developing?'], parentPrompts: ['Discuss civic engagement'] },
      { week: 10, studentPrompts: ['What will you continue after this project?', 'How has this changed your view of your city?'], teacherPrompts: ['Lasting impact visible?', 'Students empowered?'], parentPrompts: ['Celebrate accomplishments'] }
    ],
    troubleshooting: {
      challenges: [
        {
          issue: 'Weather disrupting field work',
          signs: ['Missed data collection', 'Schedule delays', 'Student frustration'],
          solutions: ['Build weather days into schedule', 'Indoor analysis alternatives', 'Virtual site visits', 'Historical data use'],
          prevention: 'Plan field work for optimal seasons and have backup dates'
        },
        {
          issue: 'City officials unresponsive',
          signs: ['Ignored emails', 'Meeting cancellations', 'No feedback on proposals'],
          solutions: ['Find champion within city', 'Engage city council members', 'Media pressure', 'Community petition'],
          prevention: 'Build relationships early through informal channels'
        },
        {
          issue: 'Data collection inconsistency',
          signs: ['Varying methods between teams', 'Missing data fields', 'Quality issues'],
          solutions: ['Retrain on protocols', 'Buddy system for collection', 'Spot checks', 'Data cleaning sessions'],
          prevention: 'Thorough initial training and practice runs'
        },
        {
          issue: 'Community participation low',
          signs: ['Poor meeting attendance', 'Few survey responses', 'Limited engagement'],
          solutions: ['Meet people where they are', 'Offer incentives', 'Partner with trusted organizations', 'Multiple engagement methods'],
          prevention: 'Build trust through consistent presence and clear communication'
        },
        {
          issue: 'Technical skills gaps',
          signs: ['Poor quality maps', 'Confusion with GIS', 'Data visualization struggles'],
          solutions: ['Peer tutoring', 'Simplified tools', 'Expert volunteers', 'Video tutorials'],
          prevention: 'Assess skills early and provide targeted training'
        }
      ]
    }
  },

  // Teacher Support
  teacherSupport: {
    lessonPlans: [
      {
        week: 1,
        day: 1,
        title: 'Launch: Transportation as Justice',
        duration: '90 minutes',
        objectives: ['Understand mobility as human right', 'Recognize transportation inequities', 'Connect personal experience to systemic issues'],
        materials: ['Mobility privilege walk cards', 'Neighborhood maps', 'Transit equity videos', 'Field notebooks'],
        procedures: [
          { time: '10 min', activity: 'Mobility privilege walk', grouping: 'whole class', teacherRole: 'Facilitate', studentRole: 'Participate and reflect' },
          { time: '20 min', activity: 'Personal mobility mapping', grouping: 'individual', teacherRole: 'Guide', studentRole: 'Map daily travels' },
          { time: '15 min', activity: 'Share and compare maps', grouping: 'small groups', teacherRole: 'Circulate', studentRole: 'Discuss patterns' },
          { time: '20 min', activity: 'Watch "Segregated by Design" clips', grouping: 'whole class', teacherRole: 'Provide context', studentRole: 'Take notes' },
          { time: '15 min', activity: 'Introduce project and neighborhoods', grouping: 'whole class', teacherRole: 'Present', studentRole: 'Ask questions' },
          { time: '10 min', activity: 'Form teams and assign blocks', grouping: 'teams', teacherRole: 'Facilitate', studentRole: 'Organize' }
        ],
        assessment: 'Reflection quality and engagement level',
        homework: 'Walk assigned block and take photos',
        notes: 'Emphasize safety protocols for field work. Ensure all students have signed permission forms.'
      }
    ],
    facilitation: {
      philosophy: 'Teacher as urban planning coach and safety coordinator, supporting student-led research while ensuring rigorous methods and community respect.',
      keyStrategies: [
        'Model professional research behavior',
        'Connect students with city officials early',
        'Emphasize data quality and ethics',
        'Support without directing solutions',
        'Celebrate incremental progress'
      ],
      questioningTechniques: [
        'What patterns do you see in the data?',
        'Whose perspective is missing?',
        'How would residents experience this?',
        'What evidence supports that claim?',
        'What would success look like?'
      ],
      groupManagement: [
        'Assign clear roles within teams',
        'Rotate leadership responsibilities',
        'Mix skills and perspectives in groups',
        'Monitor field work safety constantly',
        'Address conflicts through data focus'
      ],
      conflictResolution: [
        'Return to community priorities',
        'Use data to resolve disagreements',
        'Seek resident input for decisions',
        'Focus on shared goals',
        'Document different perspectives'
      ]
    },
    professionalDevelopment: {
      preLaunch: [
        'Urban planning basics training',
        'GIS and mapping skills workshop',
        'Tactical urbanism examples study',
        'City planning process overview',
        'Safety and liability training'
      ],
      duringProject: [
        'Weekly teacher collaboration meetings',
        'City planner mentorship sessions',
        'Data analysis skill building',
        'Documentation best practices',
        'Advocacy coaching techniques'
      ],
      postProject: [
        'Impact assessment methods',
        'Sustainability planning',
        'Network maintenance strategies',
        'Replication guide development',
        'Conference presentation prep'
      ]
    },
    resources: {
      essential: [
        'Street Smart: Tactical Urbanism Guide',
        'NACTO Urban Street Design Guide',
        'Walk Audit Tool Kit (AARP)',
        'Transportation Equity Scorecard examples',
        'Local city planning documents'
      ],
      supplementary: [
        'The Color of Law (Rothstein)',
        'Palaces for the People (Klinenberg)',
        'Happy City (Montgomery)',
        'Walkable City (Speck)',
        'Right to the City resources'
      ],
      digital: [
        'WalkScore.com for walkability data',
        'Vision Zero crash data portals',
        'Census transportation data',
        'Strava Metro for cycling patterns',
        'Remix or similar planning tools'
      ]
    },
    assessment: {
      formativeStrategies: [
        'Daily field notes review',
        'Weekly data quality checks',
        'Peer assessment of visualizations',
        'Community partner feedback',
        'Iteration documentation'
      ],
      summativeApproaches: [
        'Portfolio assessment with reflections',
        'Team presentation to city officials',
        'Individual data analysis project',
        'Policy brief evaluation',
        'Community impact documentation'
      ],
      rubricGuidance: [
        'Weight process equally with product',
        'Include community voice in evaluation',
        'Assess growth not just achievement',
        'Value iteration and improvement',
        'Recognize different contribution types'
      ]
    }
  },

  // Student Support
  studentSupport: {
    skillBuilding: {
      technical: [
        { skill: 'Field observation', resources: ['Observation protocol sheets', 'Example completed audits', 'Video training'], practice: 'Campus walkability audit' },
        { skill: 'Data collection', resources: ['Digital forms setup', 'Counting apps', 'Organization systems'], practice: 'Lunchtime pedestrian counts' },
        { skill: 'GIS mapping', resources: ['QGIS tutorials', 'ArcGIS Online training', 'Story map examples'], practice: 'Map your commute' },
        { skill: 'Data visualization', resources: ['Infographic templates', 'Chart selection guide', 'Color theory basics'], practice: 'Visualize school data' },
        { skill: 'Policy writing', resources: ['Brief templates', 'Government writing guide', 'Example briefs'], practice: 'Write practice brief' }
      ],
      soft: [
        { skill: 'Community engagement', resources: ['Interview techniques', 'Active listening guide', 'Cultural competency'], practice: 'Practice with peers' },
        { skill: 'Public speaking', resources: ['Presentation templates', 'Speaking tips', 'Practice sessions'], practice: 'Present to other classes' },
        { skill: 'Team collaboration', resources: ['Role definitions', 'Conflict resolution', 'Meeting protocols'], practice: 'Team building activities' },
        { skill: 'Project management', resources: ['Timeline templates', 'Task tracking tools', 'Priority matrices'], practice: 'Plan mini-project' },
        { skill: 'Professional communication', resources: ['Email templates', 'Meeting etiquette', 'Follow-up protocols'], practice: 'Draft official emails' }
      ]
    },
    careerConnections: {
      fields: [
        { career: 'Urban Planner', connection: 'Direct experience with planning methods', skills: 'Research, analysis, community engagement', pathway: 'Urban studies degree' },
        { career: 'Transportation Engineer', connection: 'Understanding infrastructure needs', skills: 'Data analysis, problem-solving', pathway: 'Civil engineering degree' },
        { career: 'GIS Analyst', connection: 'Spatial data visualization experience', skills: 'Mapping, data management', pathway: 'Geography or GIS degree' },
        { career: 'Community Organizer', connection: 'Advocacy and engagement practice', skills: 'Communication, coalition building', pathway: 'Social work or political science' },
        { career: 'Policy Analyst', connection: 'Research and recommendation development', skills: 'Writing, analysis, research', pathway: 'Public policy degree' },
        { career: 'Data Scientist', connection: 'Pattern recognition and visualization', skills: 'Statistics, programming, communication', pathway: 'Data science or statistics degree' }
      ],
      mentorship: [
        'Connect with local planning department',
        'Shadow city transportation staff',
        'Attend planning commission meetings',
        'Join professional organization student chapters',
        'Participate in city planning charrettes'
      ],
      portfolio: [
        'Professional audit reports',
        'GIS map portfolio',
        'Data visualization samples',
        'Policy brief examples',
        'Media coverage compilation'
      ]
    },
    differentiation: {
      advancedLearners: {
        challenges: ['Multi-neighborhood comparative analysis', 'Original research methodology', 'Advanced GIS analysis', 'Academic paper writing'],
        opportunities: ['Present at planning conferences', 'Lead community workshops', 'Mentor other teams', 'Develop assessment tools'],
        resources: ['University-level readings', 'Professional software access', 'Expert mentors', 'Research databases']
      },
      strugglingLearners: {
        supports: ['Simplified data forms', 'Partner assignments', 'Step-by-step guides', 'Additional check-ins'],
        modifications: ['Reduced scope', 'Focus on one skill', 'Alternative assessment options', 'Extended timelines'],
        scaffolds: ['Templates for all deliverables', 'Peer tutoring', 'Video instructions', 'Practice sessions']
      },
      englishLearners: {
        supports: ['Visual instructions', 'Translation tools', 'Peer interpreters', 'Multilingual resources'],
        strategies: ['Emphasize visual communication', 'Use mapping over writing', 'Provide vocabulary lists', 'Allow native language drafts'],
        connections: ['Involve families', 'Connect to home culture', 'Value multilingual skills', 'Community translators']
      }
    },
    wellbeing: {
      stress: [
        'Acknowledge complexity of issues',
        'Celebrate small wins',
        'Provide mental health resources',
        'Build in reflection time',
        'Emphasize team support'
      ],
      safety: [
        'Clear field work protocols',
        'Buddy system always',
        'Emergency contact cards',
        'Weather monitoring',
        'Safe meeting locations'
      ],
      balance: [
        'Flexible deadlines when possible',
        'Choice in contribution type',
        'Individual and team work mix',
        'Indoor and outdoor activities',
        'Serious work and creative expression'
      ]
    }
  }
};