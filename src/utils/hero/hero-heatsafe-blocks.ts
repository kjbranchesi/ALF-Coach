import { type HeroProjectData } from './types';
import heatSafeImage from './images/HeatSafeBlocks.jpeg';

export const heroHeatSafeBlocksData: HeroProjectData = {
  // Core Metadata
  id: 'hero-heatsafe-blocks',
  title: 'HeatSafe Blocks: Cooling Our Neighborhood',
  tagline: 'Combat urban heat islands through community-driven design, green infrastructure, and evidence-based cooling interventions',
  duration: '8 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Environmental Science', 'Urban Planning', 'Physics', 'Public Health', 'Engineering', 'Climate Science'],
  theme: {
    primary: 'red',
    secondary: 'green',
    accent: 'blue',
    gradient: 'from-red-600 to-green-600'
  },
  image: heatSafeImage,

  // Course Abstract
  courseAbstract: {
    overview: 'Students become urban heat detectives and cooling designers, armed with thermal cameras and weather sensors to map the invisible heat patterns that make some neighborhoods unbearably hot. They discover shocking temperature differences - sometimes 15°F hotter on one block than another just streets away. But they don\'t just document the problem; they design and test real cooling interventions like shade structures, white roofs, and pop-up parks. Working with city officials and community members, students run cooling demonstrations that show exactly how much temperature drops when you add trees or paint surfaces white. The project transforms abstract climate change into visceral, local reality that students can actually do something about.',
    learningObjectives: [
      'Master heat mapping techniques using professional-grade thermal imaging and sensor networks',
      'Design evidence-based cooling interventions from green infrastructure to reflective surfaces',
      'Run real-world pilots that demonstrate measurable temperature reduction',
      'Create implementation plans that city officials can fund and execute for community cooling'
    ],
    methodology: 'Students operate as climate resilience consultants, combining scientific measurement with community engagement and design innovation. The neighborhood becomes their laboratory where every intervention is tested, measured, and refined. Teams learn that addressing urban heat requires not just technical solutions but environmental justice awareness, as heat disproportionately affects low-income communities. Every solution must be practical, culturally appropriate, and maintainable by the community.',
    expectedOutcomes: [
      'Students document temperature reductions of 5-10°F in pilot areas through their interventions',
      'Community members become heat resilience advocates, understanding risks and solutions',
      'City officials incorporate student data and recommendations into heat action plans',
      'Students develop professional portfolios showcasing climate adaptation achievements',
      'Neighborhood gains lasting cooling infrastructure and increased tree canopy'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This urgent climate adaptation project addresses the deadly reality of urban heat islands. Students use cutting-edge technology to map heat, design cooling solutions, and implement real interventions that protect vulnerable community members.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '8 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Thermometer', label: 'Focus', value: 'Climate Action' },
      { icon: 'Map', label: 'Scale', value: 'Neighborhood' }
    ],
    impactStatement: 'Students create measurable cooling in their neighborhoods while building community resilience to extreme heat.'
  },

  // Rich Context
  context: {
    problem: 'Urban heat islands kill more people than all other weather disasters combined. Low-income neighborhoods can be 20°F hotter than wealthy areas due to lack of trees, abundance of concrete, and historical redlining. As climate change intensifies, these disparities become deadly.',
    significance: 'This project positions students as climate justice advocates who understand that heat is not just a comfort issue but an equity and survival issue that demands immediate action.',
    realWorld: 'Students work with public works departments, neighborhood councils, and health organizations to implement cooling strategies that save lives during heat waves.',
    studentRole: 'Climate scientists, urban designers, community organizers, and resilience planners working to protect their neighborhoods from extreme heat.',
    authenticity: 'Every measurement uses scientific protocols, every intervention is tested with real data, and every recommendation goes to officials who can implement changes.'
  },

  // Comprehensive Overview
  overview: {
    description: 'Over 8 weeks, students transform from passive observers of climate change to active agents of adaptation. They learn to see heat as a solvable design problem, understanding how surfaces, vegetation, and air flow create microclimates. The project combines rigorous science with creative problem-solving and community action.',
    keyFeatures: [
      'Heat Mapping: Professional thermal imaging and sensor deployment to visualize heat patterns',
      'Vulnerability Assessment: Identify populations and areas at highest risk',
      'Intervention Design: Green infrastructure, cool surfaces, and shade structures',
      'Pop-up Demonstrations: Temporary cooling installations with real-time measurement',
      'Policy Development: Heat action plans and design guidelines for city adoption'
    ],
    outcomes: [
      'Comprehensive heat maps of target neighborhoods',
      'Measurable temperature reduction from interventions',
      'Community heat resilience plan',
      'Policy recommendations for city government',
      'Scalable cooling toolkit for other neighborhoods'
    ],
    deliverables: [
      {
        name: 'Neighborhood Heat Assessment',
        description: 'Scientific analysis of heat patterns with vulnerability mapping',
        format: 'Technical report with thermal maps and data visualizations'
      },
      {
        name: 'Cooling Intervention Designs',
        description: 'Detailed plans for green infrastructure and cooling strategies',
        format: 'Design portfolio with specifications and budgets'
      },
      {
        name: 'Pop-up Demonstration Results',
        description: 'Data from temporary cooling installations showing effectiveness',
        format: 'Impact report with before/after measurements'
      },
      {
        name: 'Community Resilience Guide',
        description: 'Practical strategies for residents to stay cool',
        format: 'Illustrated guide in multiple languages'
      },
      {
        name: 'Policy Brief',
        description: 'Recommendations for municipal heat mitigation strategies',
        format: 'Professional brief with implementation roadmap'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'Climate is experienced locally and unevenly - by understanding and redesigning our built environment, we can create cooler, more equitable neighborhoods that protect vulnerable residents from extreme heat.',
    essentialQuestion: 'How might we reduce heat risk on one block using evidence-based design that combines green infrastructure, community knowledge, and climate science?',
    subQuestions: [
      'Why are some neighborhoods so much hotter than others?',
      'How do different surfaces and materials affect local temperature?',
      'What cooling strategies work best in our specific context?',
      'How do we ensure cooling solutions benefit those most at risk?'
    ],
    challenge: 'Map neighborhood heat patterns, design and test cooling interventions through pop-up demonstrations, measure temperature reductions, and present an implementation plan to city officials and community groups.',
    drivingQuestion: 'How might we transform our hottest blocks into cool, resilient spaces that protect our most vulnerable neighbors?'
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2 weeks',
        focus: 'Understanding urban heat and mapping patterns',
        activities: [
          {
            name: 'Urban Heat Island Science',
            description: 'Deep dive into the physics of heat absorption, reflection, and radiation in urban environments. Students explore how different materials store and release heat, why cities stay hot at night, and the meteorological conditions that trap heat in urban canyons.',
            duration: '90 minutes',
            outputs: [
              'Comprehensive heat transfer diagrams showing conduction, convection, and radiation',
              'Material heat capacity comparison charts for concrete, asphalt, grass, and water',
              'Concept maps linking urban design to temperature impacts',
              'Lab notebooks documenting heat experiments with different surfaces'
            ],
            skills: ['Scientific modeling', 'Data visualization', 'Systems thinking'],
            resources: ['Thermal physics textbook', 'NOAA heat island resources', 'Material samples']
          },
          {
            name: 'Heat Mapping Training',
            description: 'Master professional heat mapping equipment including FLIR thermal cameras, weather stations, and mobile sensor arrays. Students learn proper calibration, data collection protocols, and safety procedures for conducting urban heat surveys in extreme conditions.',
            duration: '120 minutes',
            outputs: [
              'Equipment certification checklist demonstrating proficiency',
              'Standard operating procedures for heat data collection',
              'Calibration logs and accuracy verification tests',
              'Safety protocols for heat exposure during fieldwork'
            ],
            skills: ['Equipment operation', 'Data collection', 'Quality control'],
            resources: ['FLIR cameras', 'Kestrel weather meters', 'GPS units', 'Safety gear']
          },
          {
            name: 'Neighborhood Heat Walk',
            description: 'Conduct systematic thermal surveys of target blocks, documenting temperature variations across different surfaces, shade patterns, and microclimates. Teams create detailed heat profiles of streets, buildings, parks, and parking lots while engaging with residents about their heat experiences.',
            duration: '180 minutes',
            outputs: [
              'Georeferenced thermal image database with 100+ locations',
              'Time-stamped temperature logs showing diurnal variations',
              'Photo documentation of heat-trapping and cooling features',
              'Resident observation notes about heat patterns and impacts'
            ],
            skills: ['Field data collection', 'Community engagement', 'Spatial analysis'],
            resources: ['Field tablets', 'Thermal cameras', 'Survey forms', 'Shade/hydration supplies']
          },
          {
            name: 'Historical Redlining Research',
            description: 'Investigate the direct connections between 1930s redlining maps and current heat vulnerability. Students overlay historical HOLC maps with current heat data, tree canopy coverage, and health outcomes to understand how discriminatory policies created lasting environmental injustices.',
            duration: '90 minutes',
            outputs: [
              'Digitized historical redlining maps aligned with current boundaries',
              'Statistical analysis showing correlation between redlining and heat',
              'Timeline of disinvestment and its environmental consequences',
              'Equity impact assessment framework for cooling interventions'
            ],
            skills: ['Historical research', 'GIS analysis', 'Environmental justice'],
            resources: ['Mapping Inequality database', 'Census data', 'Academic papers on redlining']
          },
          {
            name: 'Vulnerability Mapping',
            description: 'Create comprehensive heat vulnerability assessments by combining demographic data (age, income, health conditions) with environmental factors (tree cover, building age, AC access) to identify residents at highest risk during heat waves.',
            duration: '120 minutes',
            outputs: [
              'Multi-factor vulnerability index scoring system',
              'Color-coded risk maps showing priority intervention areas',
              'Database of vulnerable populations requiring cooling resources',
              'Emergency response recommendations for heat events'
            ],
            skills: ['Data synthesis', 'Risk assessment', 'Public health analysis'],
            resources: ['CDC heat vulnerability toolkit', 'Census demographic data', 'Health department statistics']
          },
          {
            name: 'Community Heat Stories',
            description: 'Conduct in-depth interviews with residents about their lived experiences with extreme heat, documenting health impacts, coping strategies, economic burdens, and community resilience practices. Stories humanize the data and inform culturally appropriate solutions.',
            duration: '180 minutes',
            outputs: [
              'Transcribed interviews from 15-20 diverse residents',
              'Digital story collection with audio/video testimonials',
              'Heat coping strategy inventory from community knowledge',
              'Photo essays showing heat impacts on daily life'
            ],
            skills: ['Interview techniques', 'Storytelling', 'Cultural sensitivity'],
            resources: ['Recording equipment', 'Consent forms', 'Translation services', 'Gift cards for participants']
          },
          {
            name: 'Surface Analysis Lab',
            description: 'Laboratory testing of various urban surface materials to measure albedo, heat capacity, and thermal conductivity. Students test conventional materials against cool alternatives like permeable pavement, white coatings, and phase-change materials.',
            duration: '90 minutes',
            outputs: [
              'Material property database with 20+ surface types',
              'Temperature reduction potential calculations for each material',
              'Cost-benefit analysis of cool surface installations',
              'Time-lapse thermal videos showing material performance'
            ],
            skills: ['Laboratory techniques', 'Materials science', 'Data analysis'],
            resources: ['Heat lamps', 'Thermocouples', 'Material samples', 'Albedo measurement tools']
          },
          {
            name: 'Green Infrastructure Survey',
            description: 'Comprehensive inventory of all green infrastructure including tree species, canopy coverage, park access, green roofs, and potential sites for expansion. Students assess cooling potential and identify priority areas for green interventions.',
            duration: '120 minutes',
            outputs: [
              'Interactive green asset map with species and condition data',
              'Canopy coverage analysis showing gaps and opportunities',
              'Tree cooling calculator estimating temperature benefits',
              'Priority planting plan with native species recommendations'
            ],
            skills: ['Urban forestry', 'GIS mapping', 'Ecosystem services valuation'],
            resources: ['Tree identification guides', 'i-Tree tools', 'Drone for canopy photos', 'Measuring tools']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Analyzing data and designing interventions',
        activities: [
          {
            name: 'Heat Data Analysis',
            description: 'Process thousands of thermal images and sensor readings using GIS software to create comprehensive heat maps. Students identify statistically significant hotspots, quantify temperature disparities, and correlate heat patterns with infrastructure and demographics.',
            duration: '120 minutes',
            outputs: [
              'High-resolution heat maps with 1-meter spatial resolution',
              'Statistical analysis showing temperature distributions and outliers',
              'Heat severity index ranking all blocks by cooling priority',
              'Time-series animations showing heat evolution throughout the day'
            ],
            skills: ['GIS analysis', 'Statistical methods', 'Data visualization'],
            resources: ['ArcGIS or QGIS', 'R or Python for analysis', 'Heat mapping tutorials']
          },
          {
            name: 'Microclimate Modeling',
            description: 'Use computational fluid dynamics and urban climate models to simulate how different interventions affect air flow, shade patterns, and temperature. Students test virtual scenarios before real-world implementation.',
            duration: '90 minutes',
            outputs: [
              'CFD simulations showing air flow around buildings',
              'Shade analysis for different times of day and seasons',
              'Temperature prediction maps for various intervention scenarios',
              'Comfort index calculations for pedestrian zones'
            ],
            skills: ['Computer modeling', 'Climate science', 'Scenario analysis'],
            resources: ['ENVI-met software', 'SketchUp for 3D modeling', 'Climate data']
          },
          {
            name: 'Cooling Strategy Research',
            description: 'Deep dive into global best practices for urban cooling, from Singapore\'s vertical gardens to Los Angeles\' cool pavement program. Students evaluate effectiveness, costs, maintenance requirements, and cultural appropriateness of different strategies.',
            duration: '120 minutes',
            outputs: [
              'Annotated database of 20+ cooling interventions worldwide',
              'Effectiveness ratings based on temperature reduction achieved',
              'Implementation guides adapted for local context',
              'Innovation matrix mapping strategies to specific heat challenges'
            ],
            skills: ['Research synthesis', 'Critical evaluation', 'Cross-cultural analysis'],
            resources: ['Academic papers', 'City case studies', 'Expert interviews', 'Cool Cities Network']
          },
          {
            name: 'Intervention Brainstorming',
            description: 'Creative ideation sessions using design thinking to generate innovative cooling solutions tailored to specific neighborhood sites. Students consider technical effectiveness, community needs, aesthetics, and multi-functional benefits.',
            duration: '90 minutes',
            outputs: [
              'Idea bank with 50+ cooling concepts ranging from practical to visionary',
              'Detailed concept sketches and renderings for top 10 ideas',
              'Feasibility matrix scoring ideas on impact, cost, and complexity',
              'Mood boards showing aesthetic vision for interventions'
            ],
            skills: ['Design thinking', 'Creative problem-solving', 'Visual communication'],
            resources: ['Design thinking toolkit', 'Sketching supplies', 'Precedent images', 'VR for visualization']
          },
          {
            name: 'Community Co-Design',
            description: 'Facilitate participatory design workshops where residents directly shape cooling interventions for their blocks. Using models, drawings, and virtual reality, community members provide input on everything from aesthetics to maintenance.',
            duration: '180 minutes',
            outputs: [
              'Workshop documentation with 30+ resident participants',
              'Community preference rankings for different interventions',
              'Culturally-informed design modifications and improvements',
              'Maintenance commitments from community organizations'
            ],
            skills: ['Facilitation', 'Community engagement', 'Inclusive design'],
            resources: ['Workshop materials', 'Translation services', 'Food for participants', '3D models']
          },
          {
            name: 'Cost-Benefit Analysis',
            description: 'Comprehensive economic analysis of cooling interventions including installation costs, maintenance requirements, energy savings, health benefits, and property value impacts. Students create compelling ROI arguments for city funding.',
            duration: '90 minutes',
            outputs: [
              'Detailed cost breakdowns for materials, labor, and maintenance',
              'Temperature reduction projections with confidence intervals',
              'Health cost savings from reduced heat-related illness',
              'Funding proposal templates for city grants and foundations'
            ],
            skills: ['Economic analysis', 'Project budgeting', 'Grant writing'],
            resources: ['Cost databases', 'Health impact calculators', 'City budget documents']
          },
          {
            name: 'Prototype Development',
            description: 'Build working prototypes of cooling interventions including scale models, material samples, and functional demonstrations. Students test effectiveness in controlled conditions before field deployment.',
            duration: '180 minutes',
            outputs: [
              'Physical scale models at 1:50 showing intervention designs',
              'Material sample boards with temperature measurements',
              'Working prototypes of shade structures and cooling systems',
              'Performance data from controlled testing environments'
            ],
            skills: ['Prototyping', 'Model making', 'Testing protocols'],
            resources: ['Maker space', '3D printers', 'Building materials', 'Testing equipment']
          },
          {
            name: 'Implementation Planning',
            description: 'Create comprehensive implementation plans including site preparation, installation sequences, safety protocols, and evaluation metrics. Students navigate city permitting processes and coordinate with multiple stakeholders.',
            duration: '120 minutes',
            outputs: [
              'Detailed installation drawings with dimensions and specifications',
              'Gantt charts showing implementation timeline and dependencies',
              'Completed permit applications for all interventions',
              'Stakeholder coordination matrix with roles and responsibilities'
            ],
            skills: ['Project management', 'Technical drawing', 'Stakeholder coordination'],
            resources: ['CAD software', 'Project management tools', 'City permit guides']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '3 weeks',
        focus: 'Implementing and testing cooling interventions',
        activities: [
          {
            name: 'Baseline Temperature Collection',
            description: 'Gather pre-intervention temperature data',
            duration: '180 minutes',
            outputs: ['Baseline dataset', 'Control measurements']
          },
          {
            name: 'Cool Pavement Pilot',
            description: 'Apply reflective coatings to test surfaces',
            duration: '240 minutes',
            outputs: ['Painted surfaces', 'Application documentation']
          },
          {
            name: 'Shade Structure Installation',
            description: 'Deploy temporary shade sails or structures',
            duration: '240 minutes',
            outputs: ['Installed shades', 'Coverage maps']
          },
          {
            name: 'Green Infrastructure Pop-up',
            description: 'Create temporary gardens and tree plantings',
            duration: '300 minutes',
            outputs: ['Planted areas', 'Species lists']
          },
          {
            name: 'Misting System Demo',
            description: 'Install and test evaporative cooling systems',
            duration: '180 minutes',
            outputs: ['Misting stations', 'Water usage data']
          },
          {
            name: 'Daily Temperature Monitoring',
            description: 'Track temperature changes throughout interventions',
            duration: '420 minutes',
            outputs: ['Temperature logs', 'Weather data']
          },
          {
            name: 'Community Cooling Event',
            description: 'Host public demonstration of cooling strategies',
            duration: '240 minutes',
            outputs: ['Event documentation', 'Participant feedback']
          },
          {
            name: 'Health Impact Assessment',
            description: 'Conduct comprehensive health surveys measuring heat stress symptoms, sleep quality, medication use, and emergency room visits. Students work with public health officials to quantify health improvements from cooling interventions.',
            duration: '180 minutes',
            outputs: [
              'Pre/post health surveys from 100+ residents',
              'Heat stress index calculations showing risk reductions',
              'Sleep quality improvements documented through surveys',
              'Healthcare utilization data from local clinics'
            ],
            skills: ['Public health research', 'Survey design', 'Data analysis'],
            resources: ['Survey tools', 'Health department partnership', 'Statistical software']
          },
          {
            name: 'Intervention Adjustments',
            description: 'Iterate on cooling installations based on performance data and community feedback. Students optimize shade angles, adjust misting schedules, add signage, and enhance aesthetics to maximize both cooling and community satisfaction.',
            duration: '120 minutes',
            outputs: [
              'Detailed modification log with before/after comparisons',
              'Performance improvements of 10-20% through optimization',
              'Enhanced designs incorporating community suggestions',
              'Maintenance protocols based on early observations'
            ],
            skills: ['Iterative design', 'Problem-solving', 'Responsive adaptation'],
            resources: ['Adjustment tools', 'Additional materials', 'Feedback forms']
          },
          {
            name: 'Documentation Sprint',
            description: 'Create professional-quality documentation of all interventions including before/after photos, time-lapse videos, thermal imaging sequences, and resident testimonials. Materials will support funding proposals and replication guides.',
            duration: '180 minutes',
            outputs: [
              'Photo library with 500+ high-resolution images',
              'Time-lapse videos showing installation processes',
              'Thermal imaging videos demonstrating cooling effects',
              'Edited testimonial videos from community members'
            ],
            skills: ['Photography', 'Video production', 'Digital storytelling'],
            resources: ['DSLR cameras', 'Drones', 'Video editing software', 'Thermal cameras']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '1 week',
        focus: 'Analyzing results and advocating for implementation',
        activities: [
          {
            name: 'Impact Analysis',
            description: 'Calculate temperature reductions and health benefits',
            duration: '180 minutes',
            outputs: ['Statistical analysis', 'Impact metrics']
          },
          {
            name: 'Cost-Effectiveness Study',
            description: 'Determine ROI for each intervention type',
            duration: '90 minutes',
            outputs: ['Cost per degree', 'Benefit analysis']
          },
          {
            name: 'Resilience Guide Creation',
            description: 'Develop community guide for heat protection',
            duration: '180 minutes',
            outputs: ['Illustrated guide', 'Translated versions']
          },
          {
            name: 'Policy Recommendations',
            description: 'Draft heat action plan for city adoption',
            duration: '120 minutes',
            outputs: ['Policy brief', 'Implementation timeline']
          },
          {
            name: 'Presentation Preparation',
            description: 'Create compelling presentation for stakeholders',
            duration: '120 minutes',
            outputs: ['Slide deck', 'Handouts']
          },
          {
            name: 'City Council Presentation',
            description: 'Present findings to city officials',
            duration: '90 minutes',
            outputs: ['Formal presentation', 'Q&A responses']
          },
          {
            name: 'Community Report Back',
            description: 'Share results with neighborhood residents',
            duration: '120 minutes',
            outputs: ['Community presentation', 'Action commitments']
          },
          {
            name: 'Media Outreach',
            description: 'Engage press to amplify cooling solutions',
            duration: '90 minutes',
            outputs: ['Press release', 'Media coverage']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        phase: 'Discover',
        title: 'Heat Maps Complete',
        description: 'Comprehensive thermal mapping of neighborhood',
        evidence: ['Thermal images', 'Temperature database', 'Vulnerability assessment'],
        celebration: 'Heat map reveal event with community'
      },
      {
        week: 4,
        phase: 'Define',
        title: 'Interventions Designed',
        description: 'Cooling strategies designed with community input',
        evidence: ['Design portfolio', 'Community approval', 'Permits secured'],
        celebration: 'Design showcase at community center'
      },
      {
        week: 6,
        phase: 'Develop',
        title: 'Pop-ups Deployed',
        description: 'Cooling interventions installed and operational',
        evidence: ['Installation photos', 'Initial temperature data', 'Media coverage'],
        celebration: 'Community cooling festival'
      },
      {
        week: 7,
        phase: 'Develop',
        title: 'Impact Documented',
        description: 'Clear evidence of temperature reduction',
        evidence: ['Temperature drop data', 'Resident testimonials', 'Health improvements'],
        celebration: 'Data celebration with participants'
      },
      {
        week: 8,
        phase: 'Deliver',
        title: 'Policy Presented',
        description: 'Recommendations delivered to city officials',
        evidence: ['Policy brief', 'City commitments', 'Funding secured'],
        celebration: 'Victory celebration with community'
      }
    ]
  },

  // Assessment Framework
  assessment: {
    formative: [
      'Weekly heat mapping quality checks',
      'Peer review of intervention designs',
      'Community partner feedback',
      'Daily temperature data logs',
      'Iteration documentation'
    ],
    summative: [
      'Professional heat assessment report',
      'Intervention design portfolio',
      'Pop-up demonstration impact analysis',
      'Community resilience guide',
      'Policy presentation to city officials'
    ],
    criteria: [
      'Scientific rigor in data collection and analysis',
      'Innovation and feasibility of cooling solutions',
      'Community engagement effectiveness',
      'Measurable temperature reduction achieved',
      'Communication clarity and persuasiveness'
    ],
    rubric: [
      {
        category: 'Scientific Investigation',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Rigorous heat mapping with sophisticated analysis; professional-quality thermal documentation; clear causal relationships identified'
        },
        proficient: {
          score: 3,
          description: 'Thorough heat mapping with solid analysis; good documentation; patterns clearly identified'
        },
        developing: {
          score: 2,
          description: 'Basic heat mapping with simple analysis; adequate documentation; some patterns noted'
        },
        beginning: {
          score: 1,
          description: 'Incomplete mapping; minimal analysis; poor documentation'
        }
      },
      {
        category: 'Design Innovation',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Creative, evidence-based interventions perfectly suited to context; exceptional feasibility; highly scalable'
        },
        proficient: {
          score: 3,
          description: 'Good interventions based on research; feasible designs; scalable with modifications'
        },
        developing: {
          score: 2,
          description: 'Basic interventions; questionable feasibility; limited scalability'
        },
        beginning: {
          score: 1,
          description: 'Weak interventions; poor feasibility; not scalable'
        }
      },
      {
        category: 'Implementation & Testing',
        weight: 20,
        exemplary: {
          score: 4,
          description: 'Flawless execution of pop-ups; comprehensive data collection; significant temperature reduction achieved'
        },
        proficient: {
          score: 3,
          description: 'Smooth implementation; good data collection; measurable temperature reduction'
        },
        developing: {
          score: 2,
          description: 'Implementation with issues; basic data collection; some temperature reduction'
        },
        beginning: {
          score: 1,
          description: 'Poor implementation; minimal data; no clear temperature reduction'
        }
      },
      {
        category: 'Community Engagement',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Deep, sustained community partnership; residents co-lead interventions; strong cultural competence'
        },
        proficient: {
          score: 3,
          description: 'Good community involvement; resident input incorporated; cultural awareness shown'
        },
        developing: {
          score: 2,
          description: 'Some community engagement; limited resident input; basic cultural consideration'
        },
        beginning: {
          score: 1,
          description: 'Minimal community engagement; no real partnership; cultural insensitivity'
        }
      },
      {
        category: 'Policy & Advocacy',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Compelling policy recommendations with clear path to implementation; secured commitments; built coalition'
        },
        proficient: {
          score: 3,
          description: 'Solid policy recommendations; generated official interest; some coalition building'
        },
        developing: {
          score: 2,
          description: 'Basic policy ideas; limited official engagement; minimal coalition work'
        },
        beginning: {
          score: 1,
          description: 'Vague policy suggestions; no official engagement; no coalition'
        }
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Climate Science',
        items: [
          'Understand urban heat island formation and impacts',
          'Analyze microclimate variations and causes',
          'Apply thermodynamics to cooling strategies',
          'Connect local heat to global climate change'
        ]
      },
      {
        category: 'Environmental Justice',
        items: [
          'Recognize heat as an equity issue',
          'Understand historical factors creating heat disparities',
          'Design solutions that prioritize vulnerable populations',
          'Advocate for climate justice in planning'
        ]
      },
      {
        category: 'Engineering Design',
        items: [
          'Apply design thinking to climate adaptation',
          'Create and test cooling prototypes',
          'Iterate based on data and feedback',
          'Scale solutions for community implementation'
        ]
      },
      {
        category: 'Data Science',
        items: [
          'Collect and analyze thermal data',
          'Create heat maps and visualizations',
          'Calculate statistical significance of interventions',
          'Communicate findings through data storytelling'
        ]
      }
    ],
    alignments: {
      'NGSS High School': [
        {
          code: 'HS-ESS3-2',
          text: 'Evaluate competing design solutions for developing, managing, and utilizing energy and mineral resources',
          application: 'Students evaluate cooling strategies for effectiveness and sustainability',
          depth: 'master'
        },
        {
          code: 'HS-ESS3-4',
          text: 'Evaluate or refine technological solutions that reduce impacts of human activities on natural systems',
          application: 'Students design interventions to mitigate urban heat impacts',
          depth: 'master'
        },
        {
          code: 'HS-ESS3-6',
          text: 'Use computational representation to illustrate relationships among Earth systems',
          application: 'Students model heat flows and cooling effects',
          depth: 'develop'
        },
        {
          code: 'HS-ETS1-1',
          text: 'Analyze major global challenges to specify criteria and constraints for solutions',
          application: 'Students analyze urban heat as climate challenge with local solutions',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate solutions based on prioritized criteria and trade-offs',
          application: 'Students evaluate cooling interventions using multiple criteria',
          depth: 'develop'
        }
      ],
      'Common Core Math': [
        {
          code: 'HSS-ID.B.6',
          text: 'Represent data on two quantitative variables and describe relationships',
          application: 'Students analyze relationships between surface types and temperature',
          depth: 'master'
        },
        {
          code: 'HSS-IC.B.6',
          text: 'Evaluate reports based on data',
          application: 'Students evaluate heat mitigation claims using collected data',
          depth: 'develop'
        },
        {
          code: 'HSG-MG.A.1',
          text: 'Use geometric shapes and their measures to describe objects',
          application: 'Students calculate shade coverage and cooling areas',
          depth: 'develop'
        },
        {
          code: 'HSA-CED.A.3',
          text: 'Represent constraints by systems of equations',
          application: 'Students model heat transfer and cooling effects mathematically',
          depth: 'introduce'
        }
      ],
      'Common Core ELA': [
        {
          code: 'RST.11-12.7',
          text: 'Integrate and evaluate multiple sources of information',
          application: 'Students synthesize thermal data, research, and community input',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and evidence',
          application: 'Students write policy briefs with data-supported recommendations',
          depth: 'master'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly for specific audiences',
          application: 'Students present to city officials and community members',
          depth: 'develop'
        },
        {
          code: 'SL.11-12.5',
          text: 'Make strategic use of digital media in presentations',
          application: 'Students use thermal images and data visualizations',
          depth: 'master'
        }
      ],
      'C3 Framework Social Studies': [
        {
          code: 'D2.Geo.1.9-12',
          text: 'Use geospatial technologies to analyze spatial patterns',
          application: 'Students create heat maps showing temperature disparities',
          depth: 'master'
        },
        {
          code: 'D2.Geo.7.9-12',
          text: 'Analyze relationships between humans and environments',
          application: 'Students examine how built environment creates heat islands',
          depth: 'develop'
        },
        {
          code: 'D4.7.9-12',
          text: 'Assess options for action to address problems',
          application: 'Students evaluate cooling interventions for community action',
          depth: 'master'
        },
        {
          code: 'D2.His.14.9-12',
          text: 'Analyze multiple factors that influenced perspectives',
          application: 'Students connect historical redlining to current heat disparities',
          depth: 'introduce'
        }
      ],
      'National Health Education Standards': [
        {
          code: 'Standard 1',
          text: 'Students comprehend concepts related to health promotion',
          application: 'Students understand heat-related health risks',
          depth: 'develop'
        },
        {
          code: 'Standard 2',
          text: 'Students analyze influences on health behaviors',
          application: 'Students analyze environmental factors affecting heat exposure',
          depth: 'master'
        },
        {
          code: 'Standard 8',
          text: 'Students advocate for health',
          application: 'Students advocate for cooling interventions to protect health',
          depth: 'master'
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
          'Digital and data literacy'
        ]
      },
      {
        category: 'Technical Skills',
        items: [
          'Thermal imaging and analysis',
          'GIS mapping and spatial analysis',
          'Environmental monitoring',
          'Design and prototyping'
        ]
      },
      {
        category: 'Climate Action Skills',
        items: [
          'Climate adaptation planning',
          'Community resilience building',
          'Environmental justice advocacy',
          'Green infrastructure design'
        ]
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Measurement Equipment',
        items: [
          'Thermal cameras or smartphones with thermal attachments',
          'Digital thermometers and data loggers',
          'Weather monitoring stations',
          'GPS units for mapping',
          'Cameras for documentation'
        ]
      },
      {
        category: 'Intervention Materials',
        items: [
          'White/reflective paint for cool pavements',
          'Shade cloth and installation hardware',
          'Plants and soil for green infrastructure',
          'Misting system components',
          'Signage and information materials'
        ]
      },
      {
        category: 'Analysis Tools',
        items: [
          'GIS software for heat mapping',
          'Spreadsheet software for data analysis',
          'Design software for interventions',
          'Presentation tools'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Equipment',
        items: [
          'Professional weather station',
          'Drone for aerial thermal imaging',
          'Infrared thermometer gun',
          'Solar radiation sensors',
          'Air quality monitors'
        ]
      },
      {
        category: 'Professional Support',
        items: [
          'Urban planner consultation',
          'Landscape architect assistance',
          'Public health expert guidance',
          'Climate scientist mentorship'
        ]
      }
    ],
    community: [
      {
        type: 'Public Works Department',
        role: 'Provide permits, materials, and implementation support'
      },
      {
        type: 'Neighborhood Councils',
        role: 'Connect with residents and coordinate interventions'
      },
      {
        type: 'Health Department',
        role: 'Share heat health data and vulnerability assessments'
      },
      {
        type: 'Environmental Organizations',
        role: 'Provide expertise and advocacy support'
      },
      {
        type: 'Local Businesses',
        role: 'Support cooling stations and provide resources'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: {
      primary: ['Neighborhood residents', 'City planning officials', 'Public works departments'],
      secondary: ['Health departments', 'Environmental organizations', 'Business owners'],
      global: ['Other cities facing heat challenges', 'Climate adaptation networks', 'Research community'],
      engagement: 'Direct partnership throughout project with formal presentations to officials',
      feedback: 'Continuous temperature monitoring, resident surveys, official commitments'
    },
    personal: [
      'Students develop climate science expertise',
      'Gain experience in environmental justice work',
      'Build confidence in creating community change',
      'Develop professional skills in data analysis and presentation',
      'Create portfolio demonstrating climate action'
    ],
    academic: [
      'Integration of physics, environmental science, and social studies',
      'Authentic application of scientific method',
      'Real-world engineering design experience',
      'Data visualization and communication skills',
      'Systems thinking and problem-solving'
    ],
    community: [
      'Measurable temperature reduction in hot spots',
      'Increased awareness of heat risks and solutions',
      'Improved community resilience to heat waves',
      'Strengthened advocacy for climate adaptation',
      'Model for neighborhood-scale cooling'
    ],
    methods: [
      {
        method: 'Pop-up Cooling Demonstrations',
        format: 'Temporary installations with real-time measurement',
        venue: 'Neighborhood hot spots',
        technology: ['Thermal cameras', 'Temperature sensors', 'Cooling equipment'],
        preparation: ['Site selection', 'Material procurement', 'Community outreach']
      },
      {
        method: 'City Council Presentation',
        format: 'Formal presentation with data and recommendations',
        venue: 'City Hall',
        technology: ['Projection equipment', 'Thermal maps', 'Impact data'],
        preparation: ['Presentation practice', 'Brief preparation', 'Coalition building']
      },
      {
        method: 'Community Resilience Workshop',
        format: 'Training residents in heat protection strategies',
        venue: 'Community center',
        technology: ['Educational materials', 'Cooling demonstrations'],
        preparation: ['Material translation', 'Workshop planning', 'Outreach']
      },
      {
        method: 'Digital Heat Platform',
        format: 'Online heat maps and cooling resources',
        venue: 'Project website',
        technology: ['Web mapping tools', 'Resource database'],
        preparation: ['Platform development', 'Content creation', 'Promotion']
      }
    ],
    metrics: [
      {
        metric: 'Temperature Reduction',
        target: '5-10°F reduction in intervention areas',
        measurement: 'Continuous temperature monitoring',
        timeline: 'During 3-week pilot period',
        evidence: 'Temperature logs, thermal images, statistical analysis'
      },
      {
        metric: 'Area Coverage',
        target: '5+ blocks with cooling interventions',
        measurement: 'Mapping of intervention sites',
        timeline: 'End of project',
        evidence: 'Coverage maps, installation documentation'
      },
      {
        metric: 'Community Engagement',
        target: '200+ residents directly engaged',
        measurement: 'Participation tracking',
        timeline: 'Throughout project',
        evidence: 'Sign-in sheets, surveys, event photos'
      },
      {
        metric: 'Policy Adoption',
        target: '3+ recommendations adopted by city',
        measurement: 'Official commitments and actions',
        timeline: '6 months post-project',
        evidence: 'Policy documents, budget allocations'
      },
      {
        metric: 'Health Impact',
        target: '25% reduction in heat complaints',
        measurement: 'Health department data and surveys',
        timeline: 'Following summer',
        evidence: 'Health statistics, resident testimonials'
      },
      {
        metric: 'Replication',
        target: '3+ neighborhoods adopt strategies',
        measurement: 'Tracking of model adoption',
        timeline: '1 year post-project',
        evidence: 'Implementation reports, media coverage'
      }
    ],
    sustainability: {
      continuation: 'Establish neighborhood cooling committee',
      maintenance: 'Annual heat mapping and intervention updates',
      evolution: 'Expand to additional blocks each year',
      legacy: 'Cooling toolkit enables any neighborhood to replicate',
      funding: 'City budget allocation and grants secured',
      partnerships: 'Formal agreements with city departments'
    },
    scalability: {
      classroom: 'Single block pilot study',
      school: 'Multiple neighborhood blocks',
      district: 'City-wide heat action plan',
      city: 'Municipal cooling program',
      beyond: 'Model for climate adaptation nationwide'
    }
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule ideal for extended field work',
      touchpoints: 'Weekly community meetings, daily during demonstrations',
      flexibility: 'Can adjust to 6 or 10 weeks based on scope'
    },
    budget: {
      basic: '$1000 for materials and basic equipment',
      enhanced: '$3000 including thermal cameras and monitoring stations',
      grants: 'Available from climate foundations and EPA'
    },
    stakeholders: {
      school: 'Administration support for off-campus work',
      parents: 'Permission for neighborhood field work',
      community: 'City permits and resident participation essential'
    },
    challenges: [
      {
        challenge: 'Weather dependency for measurements',
        solution: 'Flexible schedule, multiple measurement days, historical data backup'
      },
      {
        challenge: 'City bureaucracy for permits',
        solution: 'Start permit process early, build relationships, have backup sites'
      },
      {
        challenge: 'Community skepticism',
        solution: 'Start with trusted partners, show quick wins, be culturally responsive'
      },
      {
        challenge: 'Safety in hot conditions',
        solution: 'Work in early morning, hydration protocols, buddy system'
      }
    ],
    support: {
      training: '2-day workshop on heat mapping and climate science',
      materials: 'Complete measurement protocols and intervention guides',
      mentorship: 'Connect with urban heat researchers',
      network: 'Join climate adaptation education network'
    }
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Provide pre-made data collection sheets',
      'Focus on one intervention type',
      'Partner with stronger students for analysis',
      'Offer alternative presentation formats',
      'Simplify temperature calculations'
    ],
    forAdvanced: [
      'Model heat flows using computational tools',
      'Design novel cooling technologies',
      'Publish findings in student journals',
      'Present at climate conferences',
      'Develop heat prediction algorithms'
    ],
    modifications: [
      'Adjust study area size based on capacity',
      'Vary complexity of interventions',
      'Flexible data collection methods',
      'Multiple ways to demonstrate learning',
      'Accommodate different physical abilities'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Cool Blocks Summit',
    venue: 'Outdoor venue in cooled demonstration area',
    audience: 'City officials, residents, media, other schools',
    components: [
      'Live temperature demonstrations showing real-time cooling effects',
      'Before/after thermal image gallery with dramatic visualizations',
      'Student presentations on each cooling intervention with data',
      'Community testimony on heat experiences and improvements',
      'Commitment ceremony with officials pledging cooling investments',
      'Interactive cooling stations where visitors experience interventions',
      'Youth climate action panel discussing environmental justice',
      'Partner recognition celebrating community collaboration'
    ],
    artifacts: [
      'Professional 50-page heat assessment report with executive summary',
      'Cooling intervention portfolio with designs and specifications',
      'Temperature reduction database with statistical analysis',
      'Illustrated community resilience guide in multiple languages',
      'Policy recommendations with draft ordinance language',
      'Video documentary capturing project journey and impacts',
      'Interactive web map showing heat patterns and interventions',
      'Toolkit enabling replication in other neighborhoods'
    ],
    media: {
      press: 'Press release distributed to local and national outlets',
      social: 'Social media campaign with #CoolBlocks hashtag',
      documentation: 'Professional photography and videography throughout',
      amplification: 'Student appearances on local news and podcasts'
    },
    recognition: {
      students: 'Climate Action Certificates and recommendation letters',
      community: 'Cool Champion awards for resident leaders',
      partners: 'Appreciation plaques for supporting organizations',
      celebration: 'Community BBQ in newly cooled space'
    }
  },

  // Implementation Tips & Best Practices
  implementationTips: {
    gettingStarted: {
      preparation: [
        'Begin relationship building with city departments 2 months before project',
        'Identify target neighborhood with clear heat issues and engaged residents',
        'Secure basic equipment through grants or equipment loans',
        'Recruit community liaisons who speak neighborhood languages',
        'Establish safety protocols for working in extreme heat'
      ],
      earlyWins: [
        'Start with visible, quick interventions like shade sails',
        'Document temperature drops immediately to build credibility',
        'Share thermal images on social media to generate interest',
        'Host community dinners to build trust and gather input',
        'Celebrate small victories to maintain momentum'
      ]
    },
    commonPitfalls: {
      technical: [
        'Not calibrating thermal cameras properly - always verify with thermometers',
        'Measuring at wrong times - avoid early morning for baseline data',
        'Ignoring microclimate effects - account for wind and humidity',
        'Poor data management - establish clear protocols from start',
        'Inadequate documentation - assign dedicated photographers'
      ],
      community: [
        'Moving too fast without community buy-in - patience is essential',
        'Ignoring cultural preferences - some communities prefer trees over technology',
        'Not managing expectations - be clear about pilot vs permanent',
        'Failing to engage non-English speakers - provide translation',
        'Overlooking maintenance - plan for long-term care from day one'
      ],
      institutional: [
        'Underestimating permit timelines - apply 6 weeks in advance',
        'Not having backup plans - weather and bureaucracy will cause delays',
        'Weak stakeholder management - maintain regular communication',
        'Insufficient documentation for policy makers - they need hard data',
        'Missing media opportunities - invite press to all major events'
      ]
    },
    proTips: {
      measurement: [
        'Take measurements at same time each day for consistency',
        'Use multiple measurement methods to validate findings',
        'Document weather conditions for every data collection',
        'Create heat measurement protocols that students can follow independently',
        'Train multiple students on each piece of equipment for redundancy'
      ],
      engagement: [
        'Partner with trusted community organizations from the start',
        'Compensate community members for their time and expertise',
        'Hold events at times working families can attend',
        'Provide childcare and food at all community meetings',
        'Create youth leadership roles to engage younger residents'
      ],
      impact: [
        'Focus on health impacts - they resonate with policy makers',
        'Quantify economic benefits including energy savings',
        'Document everything with photos and videos for future use',
        'Create materials that community can use for ongoing advocacy',
        'Build coalition of support before approaching city council'
      ]
    },
    scalingUp: {
      growth: [
        'Start with one block, expand to five, then neighborhood-wide',
        'Train other schools to replicate the model',
        'Create train-the-trainer programs for teachers',
        'Develop partnership templates others can use',
        'Share all materials open-source for maximum impact'
      ],
      sustainability: [
        'Embed project in school curriculum for annual implementation',
        'Secure multi-year funding commitments',
        'Transfer ownership to community organizations',
        'Integrate findings into city climate planning',
        'Create youth alumni network to mentor next cohorts'
      ]
    }
  }
};