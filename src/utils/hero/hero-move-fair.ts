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
    curriculum: [
      {
        standard: 'C3 Framework for Social Studies',
        connections: [
          'D2.Geo.1.9-12: Use geospatial technologies to analyze spatial patterns',
          'D2.Geo.7.9-12: Analyze how relationships between humans and environments extend or limit justice',
          'D4.7.9-12: Assess options for individual and collective action to address problems',
          'D4.8.9-12: Apply a range of deliberative and democratic strategies to make decisions'
        ]
      },
      {
        standard: 'NGSS High School',
        connections: [
          'HS-ETS1-1: Analyze major global challenges to specify qualitative and quantitative criteria for solutions',
          'HS-ETS1-2: Design solutions to complex problems by breaking them into smaller problems',
          'HS-ETS1-3: Evaluate solutions based on prioritized criteria and trade-offs',
          'HS-ESS3-4: Evaluate or refine solutions that reduce impacts of human activities'
        ]
      },
      {
        standard: 'Common Core Math',
        connections: [
          'HSS-ID.B.6: Represent data on two quantitative variables and analyze patterns',
          'HSA-CED.A.3: Represent constraints by systems of equations and interpret solutions',
          'HSG-MG.A.3: Apply geometric methods to solve design problems'
        ]
      },
      {
        standard: 'Common Core ELA',
        connections: [
          'RST.11-12.7: Integrate multiple sources of information presented in diverse formats',
          'W.11-12.1: Write arguments to support claims using valid reasoning and evidence',
          'SL.11-12.4: Present information clearly and persuasively for specific audiences',
          'SL.11-12.5: Make strategic use of digital media in presentations'
        ]
      }
    ],
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
    personal: [
      'Students develop professional urban planning skills valuable for careers',
      'Increased civic engagement and belief in ability to create change',
      'Deeper understanding of systemic inequities and justice frameworks',
      'Enhanced spatial thinking and data analysis capabilities',
      'Confidence in public speaking and policy advocacy'
    ],
    academic: [
      'Integration of geography, math, social studies, and communication skills',
      'Authentic application of data science and visualization techniques',
      'Development of research skills from data collection to analysis',
      'Practice with professional writing and presentation formats',
      'Experience with project management and team collaboration'
    ],
    community: [
      'Improved transportation infrastructure benefiting all residents',
      'Increased awareness of mobility challenges facing neighbors',
      'Strengthened advocacy networks for ongoing improvements',
      'Data and analysis used in grant applications and planning',
      'Model for youth engagement in urban planning processes'
    ],
    metrics: {
      reach: 'Direct impact on 500+ neighborhood residents; indirect impact on thousands',
      outputs: '5+ tactical interventions tested; 20+ policy recommendations developed',
      adoption: '60% of recommendations incorporated into planning within one year',
      engagement: '100+ community members engaged; 10+ partnerships formed',
      recognition: 'Student work featured in planning documents and media coverage'
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
  }
};