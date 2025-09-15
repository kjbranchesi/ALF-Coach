import { HeroProjectData } from './types';
import {
  createPhase,
  createActivity,
  createMilestone,
  createRubricCriteria,
  createResource,
  createStandardAlignment
} from './builders';

export const heroSensingSelfData: HeroProjectData = {
  // Core Metadata
  id: 'hero-sensing-self',
  title: 'Sensing Self: Wearables for Well-Being',
  tagline: 'Design biofeedback wearables and data dashboards that help people understand and regulate stress through embodied technology',
  duration: '10 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['STEM', 'Health', 'Computer Science', 'Psychology', 'Engineering', 'Data Science'],
  theme: {
    primary: 'indigo',
    secondary: 'cyan',
    accent: 'rose',
    gradient: 'from-indigo-600 to-cyan-600'
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This innovative wearable technology project explores the intersection of biofeedback, habit change, and mental wellness. Students design and build custom wearable sensors, create data visualization dashboards, and develop evidence-based care guides that empower users to better understand and manage their stress responses.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '10 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Heart', label: 'Focus', value: 'Mental Health' },
      { icon: 'Zap', label: 'Tech Skills', value: 'Advanced' }
    ],
    impactStatement: 'Students become wellness technology innovators, creating real biofeedback solutions that help their community notice, understand, and regulate stress patterns for improved mental health.'
  },

  // Rich Context
  context: {
    problem: 'Mental health challenges affect 1 in 5 adolescents, yet most lack access to real-time tools for understanding their stress responses. Commercial wellness wearables are expensive and often fail to provide actionable insights. Meanwhile, schools and communities need evidence-based approaches to support mental wellness that go beyond crisis intervention.',
    significance: 'This project positions students as wellness technology innovators who understand that mental health is not just about treating problems but building awareness, resilience, and healthy coping strategies through data-informed self-knowledge.',
    realWorld: 'Students work with school wellness teams and community health organizations to design, test, and deploy biofeedback systems that provide real-time stress insights. Their solutions combine hardware sensing, data visualization, and behavioral science to create accessible mental health tools.',
    studentRole: 'Biofeedback engineers, data scientists, UX designers, and wellness advocates creating technology that makes stress visible, understandable, and manageable for their peers and community.',
    authenticity: 'Every wearable system addresses real stress management needs identified through user research, with published care guides providing evidence-based strategies that can benefit the broader community.'
  },

  // Comprehensive Overview
  overview: {
    description: 'This 10-week journey combines electronics engineering, data science, human-computer interaction, and behavioral psychology. Students learn that effective mental health technology requires not just sensing capabilities but thoughtful design that respects privacy, provides actionable insights, and empowers users to develop healthier stress responses.',
    keyFeatures: [
      'Biometric Sensing: Students build custom wearables measuring heart rate variability, skin conductance, and movement patterns',
      'Data Visualization: Interactive dashboards transform raw sensor data into meaningful insights about stress patterns',
      'User-Centered Design: Iterative testing with real users ensures solutions are comfortable, private, and genuinely helpful',
      'Behavioral Science Integration: Evidence-based interventions are embedded into the technology experience',
      'Community Impact: Published care guides share findings and strategies with schools and health organizations'
    ],
    outcomes: [
      'Functional biofeedback wearable devices with real-time sensing',
      'Interactive data dashboards showing stress patterns and trends',
      'Evidence-based care guides for stress management',
      'Improved understanding of mental health and wellness',
      'Technical skills in electronics, programming, and data analysis',
      'Advocacy skills for mental health awareness'
    ],
    deliverables: [
      {
        name: 'Biofeedback Wearable Prototype',
        description: 'Custom-designed wearable device with integrated sensors for stress detection',
        format: 'Physical device with 3D-printed enclosure and embedded electronics'
      },
      {
        name: 'Data Dashboard Application',
        description: 'Web or mobile application visualizing stress patterns and providing insights',
        format: 'Interactive software with real-time data visualization and analysis'
      },
      {
        name: 'User Testing Report',
        description: 'Comprehensive analysis of user experience and device effectiveness',
        format: 'Research report with quantitative data and qualitative feedback'
      },
      {
        name: 'Care Guide Publication',
        description: 'Evidence-based guide for stress management using biofeedback',
        format: 'Professional publication for school and community distribution'
      },
      {
        name: 'Technical Documentation',
        description: 'Complete build instructions and code for replication',
        format: 'Open-source repository with tutorials and documentation'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'Biofeedback technology can guide habit change by making invisible stress responses visible, enabling people to develop greater self-awareness and healthier coping strategies through data-informed insights.',
    essentialQuestion: 'How might wearables help us notice, understand, or regulate stress in ways that promote lasting well-being?',
    subQuestions: [
      'What physiological signals best indicate stress and how can we measure them?',
      'How do we design technology that respects privacy while providing useful insights?',
      'What makes biofeedback effective for behavior change versus just data collection?',
      'How can we make mental health technology accessible and non-stigmatizing?',
      'What ethical considerations guide the collection and use of biometric data?'
    ],
    challenge: 'Build a wearable biofeedback system with dashboard, test with users, and publish a data-informed care guide for stress management.',
    drivingQuestion: 'How can we use technology to make the invisible patterns of stress visible and actionable for better mental health?'
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Engineering & Electronics',
        items: [
          'Design and build wearable electronic devices with multiple sensors',
          'Program microcontrollers for real-time data collection',
          'Apply principles of circuit design and power management',
          'Create comfortable, durable enclosures using 3D printing'
        ]
      },
      {
        category: 'Data Science & Programming',
        items: [
          'Collect, clean, and analyze biometric time-series data',
          'Develop algorithms for stress detection and pattern recognition',
          'Create interactive data visualizations and dashboards',
          'Implement secure data storage and transmission protocols'
        ]
      },
      {
        category: 'Health & Psychology',
        items: [
          'Understand physiological stress responses and biomarkers',
          'Apply behavioral science principles to technology design',
          'Evaluate mental health interventions using evidence-based methods',
          'Develop strategies for stress management and resilience'
        ]
      },
      {
        category: 'Research & Communication',
        items: [
          'Conduct ethical user research with informed consent',
          'Analyze quantitative and qualitative data from user testing',
          'Synthesize findings into actionable recommendations',
          'Communicate technical concepts to diverse audiences'
        ]
      }
    ],
    alignments: {
      'NGSS Engineering': [
        {
          code: 'HS-ETS1-1',
          text: 'Analyze major global challenges to specify qualitative and quantitative criteria and constraints for solutions',
          application: 'Students analyze mental health challenges and define design criteria for biofeedback systems',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-2',
          text: 'Design a solution to a complex real-world problem by breaking it down into smaller, more manageable problems',
          application: 'Students decompose the challenge into sensing, processing, visualization, and intervention components',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate a solution to a complex real-world problem based on prioritized criteria and trade-offs',
          application: 'Students evaluate wearable designs considering comfort, accuracy, privacy, and usability trade-offs',
          depth: 'develop'
        },
        {
          code: 'HS-ETS1-4',
          text: 'Use a computer simulation to model the impacts of a proposed solution',
          application: 'Students model stress detection algorithms and test with simulated data before deployment',
          depth: 'develop'
        }
      ],
      'ISTE Students': [
        {
          code: 'ISTE.1.1',
          text: 'Empowered Learner - Students leverage technology to take an active role in choosing and achieving learning goals',
          application: 'Students choose specific biometric sensors and analysis methods based on their research',
          depth: 'develop'
        },
        {
          code: 'ISTE.1.4',
          text: 'Innovative Designer - Students use design process to identify and solve problems by creating imaginative solutions',
          application: 'Students design novel wearable form factors and data visualization approaches',
          depth: 'master'
        },
        {
          code: 'ISTE.1.5',
          text: 'Computational Thinker - Students develop and employ strategies for understanding and solving problems',
          application: 'Students develop algorithms for stress detection and pattern recognition from sensor data',
          depth: 'master'
        },
        {
          code: 'ISTE.1.6',
          text: 'Creative Communicator - Students communicate clearly and express themselves creatively using digital tools',
          application: 'Students create compelling data visualizations and care guide publications',
          depth: 'develop'
        }
      ],
      'Health Education': [
        {
          code: 'NHES.1.12.1',
          text: 'Predict how healthy behaviors affect health status',
          application: 'Students analyze how stress management behaviors detected through biofeedback affect wellness',
          depth: 'master'
        },
        {
          code: 'NHES.2.12.3',
          text: 'Analyze how environment and personal health are interrelated',
          application: 'Students explore how environmental factors trigger stress responses visible in biometric data',
          depth: 'develop'
        },
        {
          code: 'NHES.7.12.2',
          text: 'Demonstrate healthy practices and behaviors that will maintain or improve health',
          application: 'Students develop and test stress reduction techniques informed by biofeedback data',
          depth: 'develop'
        },
        {
          code: 'NHES.8.12.3',
          text: 'Work cooperatively to advocate for healthy individuals, families, and schools',
          application: 'Students advocate for mental health awareness through their care guide publications',
          depth: 'master'
        }
      ],
      'Computer Science': [
        {
          code: 'CS.3A-AP-13',
          text: 'Create prototypes that use algorithms to solve computational problems',
          application: 'Students develop algorithms for real-time stress detection from sensor streams',
          depth: 'master'
        },
        {
          code: 'CS.3A-AP-16',
          text: 'Design and iteratively develop computational artifacts for practical intent',
          application: 'Students iteratively refine their dashboard based on user feedback',
          depth: 'master'
        },
        {
          code: 'CS.3A-DA-09',
          text: 'Translate between different bit representations of real-world phenomena',
          application: 'Students convert analog sensor signals to digital data for processing',
          depth: 'develop'
        },
        {
          code: 'CS.3A-DA-11',
          text: 'Create interactive data visualizations using software tools',
          application: 'Students build interactive dashboards showing stress patterns over time',
          depth: 'master'
        }
      ]
    }
  },

  // Project Journey
  journey: {
    phases: [
      createPhase({
        id: 'phase1',
        name: 'Understanding Stress & Biofeedback',
        duration: '2 weeks',
        focus: 'Research and exploration',
        description: 'Students explore the science of stress, investigate biometric indicators, and learn about existing biofeedback technologies. They conduct user research to understand stress management needs in their community.',
        objectives: [
          'Understand the physiology of stress and its measurable indicators',
          'Research existing biofeedback technologies and their effectiveness',
          'Identify target users and their stress management needs',
          'Define design criteria for wearable wellness technology'
        ],
        activities: [
          createActivity({
            name: 'Stress Science Deep Dive',
            type: 'class',
            duration: '90 minutes',
            description: 'Interactive workshop exploring the neuroscience and physiology of stress responses',
            materials: ['Research articles', 'Stress response diagrams', 'Biometric measurement tools'],
            instructions: [
              'Present overview of stress response systems (sympathetic/parasympathetic)',
              'Demonstrate various biometric measurements (heart rate, skin conductance, etc.)',
              'Students conduct stress response experiments on themselves',
              'Analyze and discuss individual variations in stress responses'
            ],
            differentiation: {
              support: ['Provide simplified diagrams', 'Offer guided note templates', 'Pair with stronger students'],
              extension: ['Research advanced topics like HRV analysis', 'Explore machine learning for stress detection']
            },
            assessment: 'Students create concept maps showing relationships between stress triggers, responses, and measurements'
          }),
          createActivity({
            name: 'User Empathy Interviews',
            type: 'group',
            duration: '2 hours',
            description: 'Students conduct interviews with potential users to understand stress management needs',
            materials: ['Interview guides', 'Recording devices', 'Consent forms', 'Analysis templates'],
            instructions: [
              'Develop interview questions about stress experiences and management',
              'Practice interview techniques and active listening',
              'Conduct 3-5 interviews with diverse participants',
              'Synthesize findings into user personas and journey maps'
            ],
            differentiation: {
              support: ['Provide interview script templates', 'Practice with teacher first', 'Focus on fewer interviews'],
              extension: ['Conduct focus groups', 'Create video documentaries of user stories']
            },
            assessment: 'User research presentation with personas, journey maps, and key insights'
          }),
          createActivity({
            name: 'Technology Exploration Lab',
            type: 'individual',
            duration: '3 hours',
            description: 'Hands-on exploration of sensors and microcontrollers for biometric measurement',
            materials: ['Arduino boards', 'Various sensors (pulse, GSR, accelerometer)', 'Breadboards', 'Basic components'],
            instructions: [
              'Introduction to microcontroller basics and sensor types',
              'Build simple circuits to read sensor data',
              'Program basic data collection and serial output',
              'Experiment with different sensor placements and configurations'
            ],
            differentiation: {
              support: ['Provide pre-written code templates', 'Use visual programming tools', 'Offer step-by-step guides'],
              extension: ['Implement sensor fusion techniques', 'Explore wireless data transmission']
            },
            assessment: 'Working sensor prototype with documented readings and observations'
          })
        ],
        deliverables: [
          'Research synthesis on stress physiology and measurement',
          'User research report with personas and needs analysis',
          'Initial sensor testing results and feasibility assessment',
          'Design requirements document for wearable system'
        ],
        resources: [
          'Scientific articles on stress biomarkers',
          'Arduino starter kits with biometric sensors',
          'User research templates and guides',
          'Guest speaker from mental health organization'
        ],
        teacherNotes: 'Emphasize ethical considerations around biometric data collection. Ensure proper consent procedures for user research. Consider inviting a mental health professional to provide context.',
        studentTips: 'Keep an open mind about different stress experiences. Your solution should work for others, not just yourself. Document everything - failed experiments teach valuable lessons.'
      }),
      createPhase({
        id: 'phase2',
        name: 'Designing & Prototyping Wearables',
        duration: '3 weeks',
        focus: 'Engineering and creation',
        description: 'Students design and build their wearable devices, focusing on sensor integration, form factor, comfort, and reliability. They iterate through multiple prototypes based on testing.',
        objectives: [
          'Design wearable form factors that are comfortable and discreet',
          'Integrate multiple sensors for comprehensive stress detection',
          'Develop reliable data collection and transmission systems',
          'Create durable enclosures using 3D printing and materials'
        ],
        activities: [
          createActivity({
            name: 'Wearable Design Sprint',
            type: 'group',
            duration: '4 hours',
            description: 'Rapid ideation and prototyping of wearable concepts',
            materials: ['Sketching supplies', 'Cardboard', 'Fabric', 'Velcro', 'Mock components'],
            instructions: [
              'Brainstorm 20+ wearable form factors in 10 minutes',
              'Select top 3 concepts for rapid prototyping',
              'Build low-fidelity prototypes with cardboard and fabric',
              'Conduct comfort and usability testing with peers',
              'Refine design based on feedback'
            ],
            differentiation: {
              support: ['Provide design templates', 'Focus on single form factor', 'Partner with design-strong student'],
              extension: ['Create multiple form factors for different use cases', 'Design modular systems']
            },
            assessment: 'Design portfolio with sketches, prototypes, and testing feedback'
          }),
          createActivity({
            name: 'Circuit Design & Integration',
            type: 'individual',
            duration: '6 hours',
            description: 'Design and build the electronic heart of the wearable system',
            materials: ['PCB design software', 'Soldering equipment', 'Components', 'Multimeters'],
            instructions: [
              'Create circuit schematic for multi-sensor system',
              'Design PCB layout or perfboard arrangement',
              'Solder components and test connections',
              'Implement power management for battery operation',
              'Add data storage or wireless transmission'
            ],
            differentiation: {
              support: ['Use breadboard instead of soldering', 'Provide pre-made PCBs', 'Focus on single sensor'],
              extension: ['Design custom PCBs', 'Implement advanced power optimization', 'Add haptic feedback']
            },
            assessment: 'Functional circuit with documented testing procedures and results'
          }),
          createActivity({
            name: '3D Modeling & Fabrication',
            type: 'individual',
            duration: '4 hours',
            description: 'Design and print custom enclosures for wearable devices',
            materials: ['CAD software', '3D printers', 'Filament', 'Post-processing tools'],
            instructions: [
              'Measure electronic components precisely',
              'Design enclosure with proper clearances and mounting',
              'Add features for comfort and adjustability',
              'Print and post-process enclosure',
              'Assemble complete wearable device'
            ],
            differentiation: {
              support: ['Modify existing designs', 'Use simpler shapes', 'Teacher assists with CAD'],
              extension: ['Design parametric models', 'Experiment with flexible filaments', 'Create custom fasteners']
            },
            assessment: 'Completed enclosure that properly houses electronics and is comfortable to wear'
          })
        ],
        deliverables: [
          'Detailed design documentation with rationale',
          'Working wearable prototype with integrated sensors',
          'Testing data showing sensor accuracy and reliability',
          'Assembly instructions and bill of materials'
        ],
        resources: [
          'CAD software licenses (Fusion360, TinkerCAD)',
          '3D printers and materials',
          'Electronics prototyping supplies',
          'Wearable design inspiration gallery'
        ],
        teacherNotes: 'Ensure safety protocols for soldering and 3D printing. Have backup components available. Consider batch ordering PCBs if students design them.',
        studentTips: 'Test early and often - don\'t wait until everything is assembled. Keep your design simple at first, then add features. Consider how others will wear and use your device.'
      }),
      createPhase({
        id: 'phase3',
        name: 'Building Data Dashboards',
        duration: '3 weeks',
        focus: 'Software development and visualization',
        description: 'Students develop software to collect, process, and visualize biometric data. They create interactive dashboards that transform raw sensor data into actionable insights about stress patterns.',
        objectives: [
          'Develop data collection and storage systems',
          'Implement algorithms for stress detection and analysis',
          'Create intuitive data visualizations and interfaces',
          'Ensure data privacy and security'
        ],
        activities: [
          createActivity({
            name: 'Data Pipeline Development',
            type: 'individual',
            duration: '5 hours',
            description: 'Build systems for collecting and processing sensor data',
            materials: ['Programming environment', 'Database tools', 'API documentation'],
            instructions: [
              'Set up data collection from wearable via serial/Bluetooth',
              'Implement data cleaning and validation',
              'Create database schema for time-series storage',
              'Develop APIs for data access',
              'Add real-time streaming capabilities'
            ],
            differentiation: {
              support: ['Use pre-built libraries', 'Focus on local storage only', 'Provide code templates'],
              extension: ['Implement cloud storage', 'Add machine learning preprocessing', 'Create data export features']
            },
            assessment: 'Functional data pipeline with documentation and testing evidence'
          }),
          createActivity({
            name: 'Algorithm Development Workshop',
            type: 'group',
            duration: '4 hours',
            description: 'Develop algorithms to detect stress patterns from biometric data',
            materials: ['Sample datasets', 'Python/JavaScript environment', 'Statistical tools'],
            instructions: [
              'Analyze sample stress data for patterns',
              'Implement baseline detection algorithms',
              'Develop stress event detection logic',
              'Create trend analysis functions',
              'Validate algorithms with known data'
            ],
            differentiation: {
              support: ['Use simple threshold detection', 'Provide algorithm pseudocode', 'Focus on one metric'],
              extension: ['Implement machine learning models', 'Create adaptive algorithms', 'Add predictive features']
            },
            assessment: 'Algorithm performance report with accuracy metrics and visualizations'
          }),
          createActivity({
            name: 'Dashboard Design & Development',
            type: 'group',
            duration: '6 hours',
            description: 'Create interactive web dashboard for stress data visualization',
            materials: ['Web development tools', 'Visualization libraries', 'UI/UX resources'],
            instructions: [
              'Design dashboard wireframes and user flow',
              'Implement responsive layout with modern framework',
              'Create real-time data visualizations (charts, graphs)',
              'Add interaction features (filtering, zooming)',
              'Implement insights and recommendations engine'
            ],
            differentiation: {
              support: ['Use dashboard templates', 'Focus on static visualizations', 'Provide starter code'],
              extension: ['Create mobile app version', 'Add advanced analytics', 'Implement sharing features']
            },
            assessment: 'Complete dashboard demonstrating all required features with user documentation'
          })
        ],
        deliverables: [
          'Complete data pipeline from sensor to storage',
          'Documented stress detection algorithms',
          'Interactive dashboard application',
          'API documentation and data schemas'
        ],
        resources: [
          'Web development frameworks (React, Vue, or similar)',
          'Data visualization libraries (D3.js, Chart.js)',
          'Cloud platform credits (AWS, Google Cloud)',
          'Sample biometric datasets for testing'
        ],
        teacherNotes: 'Emphasize data privacy and security throughout. Consider HIPAA compliance concepts. Provide sample data for students who have hardware issues.',
        studentTips: 'Start with simple visualizations and add complexity. Think about what insights would actually help someone manage stress. Test with real data as soon as possible.'
      }),
      createPhase({
        id: 'phase4',
        name: 'Testing & Publishing Care Guides',
        duration: '2 weeks',
        focus: 'Validation and dissemination',
        description: 'Students conduct user testing of their complete systems, analyze effectiveness, and create professional care guides that share their findings with school wellness teams and community health organizations.',
        objectives: [
          'Conduct ethical user testing with proper protocols',
          'Analyze quantitative and qualitative effectiveness data',
          'Synthesize findings into evidence-based recommendations',
          'Create professional publications for community distribution'
        ],
        activities: [
          createActivity({
            name: 'User Testing Protocol',
            type: 'group',
            duration: '6 hours',
            description: 'Systematic testing of wearable systems with target users',
            materials: ['Testing protocols', 'Consent forms', 'Data collection tools', 'Feedback forms'],
            instructions: [
              'Develop testing protocol with clear procedures',
              'Recruit 5-10 test participants with consent',
              'Conduct week-long testing period',
              'Collect continuous sensor data and daily surveys',
              'Conduct exit interviews for qualitative feedback'
            ],
            differentiation: {
              support: ['Provide testing templates', 'Reduce participant number', 'Teacher assists with recruitment'],
              extension: ['Conduct A/B testing', 'Implement control groups', 'Add physiological validation']
            },
            assessment: 'Testing report with methodology, results, and user feedback analysis'
          }),
          createActivity({
            name: 'Data Analysis & Insights',
            type: 'individual',
            duration: '4 hours',
            description: 'Analyze testing data to evaluate system effectiveness',
            materials: ['Statistical software', 'Analysis templates', 'Visualization tools'],
            instructions: [
              'Clean and prepare testing data',
              'Calculate effectiveness metrics',
              'Identify patterns and correlations',
              'Compare pre/post intervention measures',
              'Generate insights and recommendations'
            ],
            differentiation: {
              support: ['Focus on descriptive statistics', 'Provide analysis scripts', 'Use spreadsheet tools'],
              extension: ['Conduct advanced statistical tests', 'Create predictive models', 'Perform meta-analysis']
            },
            assessment: 'Analysis report with visualizations and statistical evidence'
          }),
          createActivity({
            name: 'Care Guide Creation',
            type: 'group',
            duration: '5 hours',
            description: 'Develop professional care guide for community distribution',
            materials: ['Publishing software', 'Design templates', 'Medical writing guides'],
            instructions: [
              'Synthesize research and testing findings',
              'Write clear, accessible content for target audience',
              'Design professional layout with infographics',
              'Include practical stress management strategies',
              'Add resource lists and implementation guides',
              'Peer review and expert validation'
            ],
            differentiation: {
              support: ['Use writing templates', 'Focus on single audience', 'Provide example guides'],
              extension: ['Create multiple versions for different audiences', 'Develop training materials', 'Add video content']
            },
            assessment: 'Professional care guide ready for publication and distribution'
          })
        ],
        deliverables: [
          'User testing report with complete data analysis',
          'Published care guide for community distribution',
          'Presentation for school wellness team',
          'Open-source project repository'
        ],
        resources: [
          'Publishing software (InDesign, Canva)',
          'Statistical analysis tools',
          'Medical writing style guides',
          'Expert reviewers from health organizations'
        ],
        teacherNotes: 'Ensure IRB-style review of testing protocols. Connect with school counselors for distribution. Consider submitting to student research competitions.',
        studentTips: 'Your care guide should be practical and actionable. Use plain language but maintain scientific accuracy. Think about how to make your findings accessible to those who need them most.'
      })
    ],
    milestones: [
      createMilestone({
        id: 'm1',
        phase: 'phase1',
        week: 2,
        title: 'Research Complete',
        description: 'Comprehensive understanding of stress science and user needs established',
        evidence: ['Literature review', 'User personas', 'Design requirements'],
        celebration: 'Share findings with mental health professionals for feedback'
      }),
      createMilestone({
        id: 'm2',
        phase: 'phase2',
        week: 5,
        title: 'Wearable Prototype Ready',
        description: 'Functional wearable device collecting reliable biometric data',
        evidence: ['Working prototype', 'Sensor validation data', 'Comfort testing results'],
        celebration: 'Demo day with peers trying different wearable designs'
      }),
      createMilestone({
        id: 'm3',
        phase: 'phase3',
        week: 8,
        title: 'Dashboard Deployed',
        description: 'Complete data system from sensor to visualization operational',
        evidence: ['Live dashboard', 'Real-time data flow', 'User interface testing'],
        celebration: 'Launch party with live stress pattern demonstrations'
      }),
      createMilestone({
        id: 'm4',
        phase: 'phase4',
        week: 10,
        title: 'Care Guide Published',
        description: 'Professional care guide ready for community distribution',
        evidence: ['Published guide', 'Testing results', 'Distribution plan'],
        celebration: 'Presentation to school board and health organizations'
      })
    ],
    timeline: [
      {
        week: 1,
        phase: 'Understanding Stress & Biofeedback',
        title: 'Stress Science & Research',
        activities: ['Stress physiology workshop', 'Literature review', 'Technology exploration'],
        deliverable: 'Research synthesis',
        assessment: 'Concept understanding quiz'
      },
      {
        week: 2,
        phase: 'Understanding Stress & Biofeedback',
        title: 'User Research & Requirements',
        activities: ['Empathy interviews', 'Persona development', 'Requirements definition'],
        deliverable: 'User research report',
        assessment: 'Persona presentations'
      },
      {
        week: 3,
        phase: 'Designing & Prototyping Wearables',
        title: 'Wearable Concept Design',
        activities: ['Design sprint', 'Form factor prototyping', 'Comfort testing'],
        deliverable: 'Design concepts',
        assessment: 'Design review'
      },
      {
        week: 4,
        phase: 'Designing & Prototyping Wearables',
        title: 'Electronics Integration',
        activities: ['Circuit design', 'Sensor integration', 'Power management'],
        deliverable: 'Electronic prototype',
        assessment: 'Technical documentation'
      },
      {
        week: 5,
        phase: 'Designing & Prototyping Wearables',
        title: 'Enclosure Fabrication',
        activities: ['3D modeling', 'Printing and assembly', 'Refinement'],
        deliverable: 'Complete wearable',
        assessment: 'Prototype demonstration'
      },
      {
        week: 6,
        phase: 'Building Data Dashboards',
        title: 'Data Infrastructure',
        activities: ['Pipeline development', 'Database setup', 'API creation'],
        deliverable: 'Data system',
        assessment: 'System architecture review'
      },
      {
        week: 7,
        phase: 'Building Data Dashboards',
        title: 'Algorithm Development',
        activities: ['Pattern analysis', 'Algorithm implementation', 'Validation'],
        deliverable: 'Detection algorithms',
        assessment: 'Algorithm performance report'
      },
      {
        week: 8,
        phase: 'Building Data Dashboards',
        title: 'Dashboard Creation',
        activities: ['UI design', 'Visualization development', 'Integration'],
        deliverable: 'Interactive dashboard',
        assessment: 'Dashboard demonstration'
      },
      {
        week: 9,
        phase: 'Testing & Publishing Care Guides',
        title: 'User Testing',
        activities: ['Test protocol execution', 'Data collection', 'Feedback gathering'],
        deliverable: 'Testing data',
        assessment: 'Testing methodology review'
      },
      {
        week: 10,
        phase: 'Testing & Publishing Care Guides',
        title: 'Analysis & Publication',
        activities: ['Data analysis', 'Care guide writing', 'Community presentation'],
        deliverable: 'Published care guide',
        assessment: 'Final presentation'
      }
    ],
    weeklyBreakdown: []
  },

  // Assessment Framework
  assessment: {
    philosophy: 'Assessment in this project emphasizes authentic evaluation through real-world application, peer review, and self-reflection. Students are evaluated on technical skill development, design thinking, scientific rigor, and community impact.',
    rubric: [
      createRubricCriteria({
        category: 'Engineering Design',
        weight: 25,
        exemplary: {
          points: 4,
          description: 'Wearable demonstrates exceptional engineering with innovative features, high reliability, and elegant integration',
          evidence: ['Multiple sensor integration', 'Battery life >24 hours', 'Professional finish', 'Novel design elements']
        },
        proficient: {
          points: 3,
          description: 'Wearable functions reliably with good sensor integration and practical design',
          evidence: ['Core sensors working', 'Battery life >8 hours', 'Comfortable to wear', 'Complete documentation']
        },
        developing: {
          points: 2,
          description: 'Wearable has basic functionality but lacks refinement or reliability',
          evidence: ['Single sensor working', 'Intermittent functionality', 'Prototype-level finish', 'Basic documentation']
        },
        beginning: {
          points: 1,
          description: 'Wearable concept demonstrated but significant functionality issues',
          evidence: ['Design concept clear', 'Limited sensor function', 'Assembly incomplete', 'Minimal documentation']
        }
      }),
      createRubricCriteria({
        category: 'Data Analysis & Visualization',
        weight: 25,
        exemplary: {
          points: 4,
          description: 'Dashboard provides deep insights through sophisticated analysis and compelling visualizations',
          evidence: ['Multiple visualization types', 'Real-time updates', 'Predictive features', 'Actionable insights']
        },
        proficient: {
          points: 3,
          description: 'Dashboard effectively visualizes data with clear patterns and useful insights',
          evidence: ['Key metrics displayed', 'Interactive features', 'Trend analysis', 'User-friendly interface']
        },
        developing: {
          points: 2,
          description: 'Dashboard shows data but limited analysis or visualization quality',
          evidence: ['Basic charts', 'Static displays', 'Simple metrics', 'Functional interface']
        },
        beginning: {
          points: 1,
          description: 'Dashboard attempts made but significant gaps in functionality',
          evidence: ['Data displayed', 'Limited interaction', 'Few visualizations', 'Basic layout']
        }
      }),
      createRubricCriteria({
        category: 'User Research & Testing',
        weight: 25,
        exemplary: {
          points: 4,
          description: 'Comprehensive user research with rigorous testing protocols and insightful analysis',
          evidence: ['10+ test participants', 'Statistical significance', 'Rich qualitative data', 'Actionable findings']
        },
        proficient: {
          points: 3,
          description: 'Solid user research with systematic testing and clear findings',
          evidence: ['5-9 participants', 'Quantitative analysis', 'User feedback integrated', 'Clear recommendations']
        },
        developing: {
          points: 2,
          description: 'Basic user testing conducted but limited scope or analysis',
          evidence: ['3-4 participants', 'Simple metrics', 'Some feedback gathered', 'General observations']
        },
        beginning: {
          points: 1,
          description: 'Minimal user testing with limited insights',
          evidence: ['1-2 participants', 'Anecdotal feedback', 'Limited documentation', 'Few insights']
        }
      }),
      createRubricCriteria({
        category: 'Community Impact & Communication',
        weight: 25,
        exemplary: {
          points: 4,
          description: 'Care guide demonstrates exceptional quality with clear potential for community benefit',
          evidence: ['Professional publication', 'Expert validation', 'Distribution plan', 'Measurable impact']
        },
        proficient: {
          points: 3,
          description: 'Care guide effectively communicates findings with practical recommendations',
          evidence: ['Well-designed guide', 'Evidence-based content', 'Clear strategies', 'Target audience addressed']
        },
        developing: {
          points: 2,
          description: 'Care guide created but lacks polish or comprehensive recommendations',
          evidence: ['Basic guide complete', 'Some evidence included', 'General advice', 'Limited design']
        },
        beginning: {
          points: 1,
          description: 'Care guide attempted but significant gaps in content or quality',
          evidence: ['Draft created', 'Limited content', 'Few recommendations', 'Minimal design']
        }
      })
    ],
    formative: [
      {
        name: 'Weekly Progress Checks',
        type: 'Teacher observation',
        frequency: 'Weekly',
        purpose: 'Monitor project progress and provide timely support',
        method: 'Checklist review of deliverables and team functioning',
        feedback: 'Written comments with specific suggestions for improvement'
      },
      {
        name: 'Peer Design Reviews',
        type: 'Peer assessment',
        frequency: 'Bi-weekly',
        purpose: 'Gain feedback from other teams and practice technical communication',
        method: 'Structured critique protocol with feedback forms',
        feedback: 'Peer ratings and constructive suggestions'
      },
      {
        name: 'Technical Skills Checks',
        type: 'Performance assessment',
        frequency: 'Per phase',
        purpose: 'Verify mastery of required technical skills',
        method: 'Practical demonstrations of key techniques',
        feedback: 'Skill rubric with growth recommendations'
      }
    ],
    summative: [
      {
        name: 'Final System Demonstration',
        type: 'Performance assessment',
        timing: 'Week 10',
        format: 'Live demonstration to panel',
        criteria: ['Functionality', 'Innovation', 'User experience', 'Technical quality'],
        weight: 30
      },
      {
        name: 'Technical Portfolio',
        type: 'Portfolio assessment',
        timing: 'Week 10',
        format: 'Digital portfolio with all artifacts',
        criteria: ['Completeness', 'Quality', 'Documentation', 'Reflection'],
        weight: 25
      },
      {
        name: 'Care Guide Publication',
        type: 'Product assessment',
        timing: 'Week 10',
        format: 'Professional publication',
        criteria: ['Content quality', 'Design', 'Evidence base', 'Accessibility'],
        weight: 25
      },
      {
        name: 'Research Presentation',
        type: 'Presentation assessment',
        timing: 'Week 10',
        format: 'Conference-style presentation',
        criteria: ['Scientific rigor', 'Communication', 'Visual aids', 'Q&A responses'],
        weight: 20
      }
    ],
    selfAssessment: [
      {
        name: 'Weekly Reflection Journal',
        frequency: 'Weekly',
        format: 'Digital journal entries',
        prompts: [
          'What technical skills did I develop this week?',
          'How did I contribute to my team\'s success?',
          'What challenges did I overcome?',
          'What would I do differently?'
        ],
        reflection: 'Students identify growth areas and set goals for improvement'
      },
      {
        name: 'Skills Inventory Checklist',
        frequency: 'Bi-weekly',
        format: 'Self-rating checklist',
        prompts: [
          'Rate your confidence with each technical skill',
          'Identify areas needing additional practice',
          'Set specific skill development goals',
          'Track progress over time'
        ],
        reflection: 'Students monitor their own technical skill development'
      }
    ],
    peerAssessment: [
      {
        name: 'Team Contribution Review',
        structure: '360-degree feedback',
        guidelines: [
          'Rate each team member on specific contributions',
          'Provide evidence for ratings',
          'Offer constructive suggestions',
          'Recognize exceptional contributions'
        ],
        feedbackForm: 'Structured rubric with comment sections'
      },
      {
        name: 'Design Critique Protocol',
        structure: 'Structured peer review',
        guidelines: [
          'Start with strengths and successes',
          'Ask clarifying questions',
          'Offer specific, actionable suggestions',
          'End with encouragement'
        ],
        feedbackForm: 'I like, I wish, I wonder framework'
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      createResource({
        name: 'Arduino Uno or ESP32',
        type: 'technology',
        quantity: '1 per student',
        source: 'Electronics supplier',
        cost: '$25-35 each',
        alternatives: ['Raspberry Pi Pico', 'micro:bit with expansion']
      }),
      createResource({
        name: 'Biometric Sensor Kit',
        type: 'material',
        quantity: '1 per student',
        source: 'Educational electronics supplier',
        cost: '$40-60 per kit',
        alternatives: ['Individual sensors purchased separately']
      }),
      createResource({
        name: '3D Printer Access',
        type: 'technology',
        quantity: 'Shared classroom resource',
        source: 'School makerspace or local library',
        cost: '$20-30 filament per class',
        alternatives: ['Laser cutting', 'Hand fabrication with foam']
      }),
      createResource({
        name: 'Computer with Internet',
        type: 'technology',
        quantity: '1 per student',
        source: 'School computer lab',
        cost: 'Existing resource',
        alternatives: ['Chromebooks with cloud IDE']
      })
    ],
    optional: [
      createResource({
        name: 'Bluetooth Module',
        type: 'material',
        quantity: '1 per student',
        source: 'Electronics supplier',
        cost: '$10-15 each',
        alternatives: ['Wired connection to computer']
      }),
      createResource({
        name: 'Flexible Filament',
        type: 'material',
        quantity: '1 roll per class',
        source: '3D printing supplier',
        cost: '$30-40 per roll',
        alternatives: ['Fabric bands', 'Elastic straps']
      }),
      createResource({
        name: 'Cloud Platform Credits',
        type: 'technology',
        quantity: '$100 class credits',
        source: 'AWS Educate or Google Cloud',
        cost: 'Free educational credits',
        alternatives: ['Local server', 'Raspberry Pi server']
      })
    ],
    professional: [
      {
        title: 'The Stress-Proof Brain',
        type: 'book',
        link: 'https://www.amazon.com/Stress-Proof-Brain-Mindfulness-Emotional-Resilience/dp/1626252661',
        description: 'Comprehensive guide to neuroscience of stress and evidence-based interventions',
        alignment: 'Provides scientific foundation for stress management strategies'
      },
      {
        title: 'Make: Wearable Electronics',
        type: 'book',
        link: 'https://www.makershed.com/products/make-wearable-electronics',
        description: 'Practical guide to designing and building wearable devices',
        alignment: 'Technical reference for wearable design and fabrication'
      },
      {
        title: 'HRV4Training Research',
        type: 'website',
        link: 'https://www.hrv4training.com/blog/research',
        description: 'Collection of research on heart rate variability and stress',
        alignment: 'Evidence base for biometric stress detection'
      }
    ],
    studentResources: [
      {
        name: 'Arduino Sensor Tutorial Series',
        type: 'Video tutorials',
        ageAppropriate: true,
        link: 'https://www.arduino.cc/en/Tutorial/BuiltInExamples',
        description: 'Step-by-step guides for working with various sensors',
        scaffolding: 'Start with basic examples, progress to sensor fusion'
      },
      {
        name: 'Stress Science for Teens',
        type: 'Interactive website',
        ageAppropriate: true,
        link: 'https://www.apa.org/topics/stress/teens',
        description: 'Age-appropriate resources about stress and mental health',
        scaffolding: 'Use for initial research and user empathy development'
      },
      {
        name: 'D3.js Data Visualization Gallery',
        type: 'Code examples',
        ageAppropriate: true,
        link: 'https://observablehq.com/@d3/gallery',
        description: 'Interactive examples of data visualizations',
        scaffolding: 'Adapt examples for biometric data display'
      }
    ],
    communityConnections: [
      {
        organization: 'School Wellness Team',
        contactPerson: 'School counselor or nurse',
        role: 'Expert advisors and test users',
        contribution: 'Provide mental health expertise and help recruit test participants',
        scheduling: 'Initial consultation week 1, ongoing feedback, final presentation'
      },
      {
        organization: 'Local Mental Health Organization',
        contactPerson: 'Community outreach coordinator',
        role: 'Content reviewers and distribution partners',
        contribution: 'Review care guides and help with community distribution',
        scheduling: 'Mid-project review and final publication support'
      },
      {
        organization: 'University Psychology Department',
        contactPerson: 'Graduate student researchers',
        role: 'Research mentors',
        contribution: 'Support with study design and data analysis',
        scheduling: 'Workshops in weeks 1, 7, and 9'
      }
    ]
  },

  // Impact & Audience
  impact: {
    audience: {
      primary: ['High school students experiencing stress', 'School counselors and wellness teams'],
      secondary: ['Parents and families', 'School administrators', 'Community health workers'],
      global: ['Open-source hardware community', 'Mental health researchers', 'Other schools implementing wellness programs'],
      engagement: 'Direct participation in testing, feedback sessions, and care guide distribution. Ongoing support through dashboard access and follow-up surveys.',
      feedback: 'Structured feedback through surveys, interviews, and usage analytics. Continuous improvement based on user data and suggestions.'
    },
    methods: [
      {
        method: 'School Wellness Integration',
        format: 'Pilot program with counseling office',
        venue: 'School health center',
        technology: ['Wearable devices', 'Dashboard tablets'],
        preparation: ['Staff training', 'Privacy protocols', 'Parent consent']
      },
      {
        method: 'Community Workshop Series',
        format: 'Public demonstrations and training',
        venue: 'Library or community center',
        technology: ['Projection system', 'Demo devices'],
        preparation: ['Marketing materials', 'Registration system', 'Handouts']
      },
      {
        method: 'Open Source Release',
        format: 'GitHub repository and documentation',
        venue: 'Online platforms',
        technology: ['Version control', 'Documentation tools'],
        preparation: ['Code cleanup', 'Documentation writing', 'License selection']
      }
    ],
    metrics: [
      {
        metric: 'User Stress Reduction',
        target: '20% decrease in reported stress levels',
        measurement: 'Pre/post surveys and biometric data',
        timeline: '4-week testing period',
        evidence: 'Statistical analysis of user data'
      },
      {
        metric: 'Adoption Rate',
        target: '50 active users in first semester',
        measurement: 'Dashboard usage analytics',
        timeline: '6 months post-launch',
        evidence: 'User registration and engagement data'
      },
      {
        metric: 'Care Guide Distribution',
        target: '500 copies distributed',
        measurement: 'Distribution tracking',
        timeline: '3 months post-publication',
        evidence: 'Download counts and physical distribution records'
      }
    ],
    sustainability: {
      continuation: 'Establish student tech team to maintain and support deployed systems. Create training materials for new student developers.',
      maintenance: 'Monthly check-ins with users, regular software updates, and hardware refurbishment program using 3D-printed replacement parts.',
      evolution: 'Annual design challenges to improve system based on user feedback. Research partnerships with local universities for advanced features.',
      legacy: 'Open-source repository enables global replication. Alumni mentorship program supports future iterations. Published research contributes to field.'
    },
    scalability: {
      classroom: 'Single class creates 20-30 devices serving immediate peer group with direct support and rapid iteration.',
      school: 'Multiple classes collaborate to outfit entire wellness program. Peer training expands technical support capacity.',
      district: 'District-wide implementation with centralized dashboard and standardized training. Economy of scale reduces per-unit costs.',
      beyond: 'Open-source model enables adoption by any school globally. Online community provides support and shares improvements.'
    }
  },

  // Implementation Support
  implementation: {
    gettingStarted: {
      overview: 'This project requires initial setup of hardware, software, and partnerships. Begin with team formation and basic skill development before moving to complex integration.',
      prerequisites: [
        'Basic programming knowledge (any language)',
        'Familiarity with scientific method',
        'Access to computers and internet',
        'School approval for human subjects research'
      ],
      firstWeek: [
        'Form diverse teams of 3-4 students',
        'Set up development environments',
        'Order electronic components',
        'Schedule guest speakers',
        'Establish community partnerships'
      ],
      commonMistakes: [
        'Starting with complex sensors before mastering basics',
        'Neglecting user privacy and consent',
        'Focusing on features over user needs',
        'Waiting too long to test with real users'
      ],
      quickWins: [
        'Get LED blinking with heart rate in first day',
        'Show real-time sensor data on screen',
        'Create simple stress detection with threshold',
        'Build cardboard wearable prototype'
      ]
    },
    weeklyReflections: [
      {
        week: 1,
        studentPrompts: [
          'What surprised you about the science of stress?',
          'How might wearable technology help someone you know?',
          'What ethical concerns do you have about biometric monitoring?'
        ],
        teacherPrompts: [
          'Are students grasping the connection between physiology and technology?',
          'What additional scaffolding might be needed for sensor work?',
          'How can I better support diverse learning styles?'
        ],
        parentPrompts: [
          'Ask your student to explain how stress affects the body',
          'Discuss your family\'s approach to stress management',
          'Share any concerns about privacy and data collection'
        ]
      },
      {
        week: 5,
        studentPrompts: [
          'What has been your biggest technical challenge?',
          'How has user feedback changed your design?',
          'What are you most proud of so far?'
        ],
        teacherPrompts: [
          'Which teams need additional technical support?',
          'Are students maintaining focus on user needs?',
          'How can I facilitate better team collaboration?'
        ]
      },
      {
        week: 10,
        studentPrompts: [
          'How might your project continue to evolve?',
          'What would you do differently if starting over?',
          'How has this changed your view of mental health technology?'
        ],
        teacherPrompts: [
          'What aspects of the project were most successful?',
          'How can I improve the project for next time?',
          'What community partnerships should continue?'
        ]
      }
    ],
    troubleshooting: {
      challenges: [
        {
          issue: 'Sensors giving inconsistent readings',
          signs: ['Jumpy data', 'Impossible values', 'Drift over time'],
          solutions: [
            'Check all connections and solder joints',
            'Add pull-up/pull-down resistors',
            'Implement software filtering',
            'Shield from electromagnetic interference'
          ],
          prevention: 'Test sensors individually before integration'
        },
        {
          issue: 'Users uncomfortable with wearable',
          signs: ['Reluctance to wear', 'Skin irritation', 'Device sliding'],
          solutions: [
            'Redesign with softer materials',
            'Add adjustable straps',
            'Reduce device weight',
            'Improve ventilation'
          ],
          prevention: 'Test comfort early with cardboard prototypes'
        },
        {
          issue: 'Dashboard not updating in real-time',
          signs: ['Delayed data', 'Missing points', 'Frozen display'],
          solutions: [
            'Check data pipeline for bottlenecks',
            'Implement websockets for real-time updates',
            'Optimize database queries',
            'Add connection status indicators'
          ],
          prevention: 'Test with simulated high-frequency data'
        }
      ]
    },
    modifications: {
      advancedLearners: {
        modifications: [
          'Add machine learning for personalized stress prediction',
          'Implement multi-user household dashboard',
          'Design custom PCB instead of breadboard',
          'Create mobile app with notifications'
        ],
        scaffolds: [
          'Provide research papers on advanced topics',
          'Connect with university researchers',
          'Access to advanced equipment'
        ],
        extensions: [
          'Develop API for third-party integration',
          'Create stress intervention library',
          'Build recommendation engine'
        ],
        assessmentAdaptations: [
          'Evaluate algorithmic sophistication',
          'Assess scalability considerations',
          'Include peer review component'
        ]
      },
      onLevelLearners: {
        modifications: [
          'Follow standard project timeline',
          'Use provided code templates',
          'Focus on core functionality'
        ],
        scaffolds: [
          'Step-by-step tutorials',
          'Peer programming sessions',
          'Regular check-ins'
        ],
        extensions: [
          'Add one additional sensor',
          'Customize visualizations',
          'Create user manual'
        ],
        assessmentAdaptations: [
          'Standard rubric application',
          'Choice in presentation format',
          'Collaborative assessments allowed'
        ]
      },
      strugglingLearners: {
        modifications: [
          'Focus on single sensor system',
          'Use block-based programming',
          'Simplify dashboard to basic displays',
          'Partner with stronger student'
        ],
        scaffolds: [
          'Pre-written code modules',
          'Additional teacher support',
          'Video tutorials for each step',
          'Simplified documentation templates'
        ],
        extensions: [
          'Improve device aesthetics',
          'Create infographic about stress',
          'Focus on user guide writing'
        ],
        assessmentAdaptations: [
          'Modified rubric with adjusted expectations',
          'Oral presentations allowed',
          'Portfolio-based assessment',
          'Credit for growth and effort'
        ]
      },
      englishLearners: {
        modifications: [
          'Provide bilingual resources',
          'Allow native language for planning',
          'Pair with supportive partner',
          'Visual-heavy documentation'
        ],
        scaffolds: [
          'Technical vocabulary lists',
          'Translated instructions',
          'Visual programming options',
          'Sentence starters for writing'
        ],
        extensions: [
          'Create multilingual user interface',
          'Translate care guide',
          'Bridge cultural perspectives on stress'
        ],
        assessmentAdaptations: [
          'Allow presentations in native language',
          'Provide extra time for writing',
          'Accept visual documentation',
          'Focus on technical demonstration'
        ]
      },
      specialEducation: {
        modifications: [
          'Adjust project scope to IEP goals',
          'Break tasks into smaller steps',
          'Provide organizational tools',
          'Flexible deadlines'
        ],
        scaffolds: [
          'Task checklists',
          'Visual schedules',
          'Adapted materials',
          'Assistive technology'
        ],
        extensions: [
          'Focus on area of strength',
          'Peer teaching opportunities',
          'Creative expression options'
        ],
        assessmentAdaptations: [
          'Alternative assessment formats',
          'Chunked assessments',
          'Portfolio documentation',
          'IEP-aligned rubrics'
        ]
      }
    },
    extensions: {
      earlyFinishers: [
        'Add environmental sensors for context',
        'Implement social features for group stress',
        'Create chatbot for stress coaching',
        'Develop breathing exercise game'
      ],
      summerProjects: [
        'Long-term stress pattern analysis',
        'Family wellness dashboard',
        'Integration with fitness trackers',
        'Stress research study'
      ],
      competitionOpportunities: [
        'Science fair with health focus',
        'App development competitions',
        'Social innovation challenges',
        'Research symposiums'
      ],
      independentStudy: [
        'Advanced biometric analysis',
        'Mental health app development',
        'Wearable fashion design',
        'Behavioral intervention research'
      ]
    },
    technologyIntegration: {
      required: [
        {
          name: 'Arduino IDE',
          purpose: 'Programming microcontrollers',
          freeVersion: true,
          training: '2-hour introduction workshop',
          studentAccounts: false
        },
        {
          name: 'TinkerCAD or Fusion360',
          purpose: '3D modeling for enclosures',
          freeVersion: true,
          training: '3-hour modeling basics',
          studentAccounts: true
        },
        {
          name: 'Google Sheets or Excel',
          purpose: 'Data analysis and visualization',
          freeVersion: true,
          training: 'Existing student knowledge',
          studentAccounts: true
        }
      ],
      optional: [
        {
          name: 'VS Code',
          purpose: 'Advanced code editing',
          freeVersion: true,
          training: 'Self-paced tutorials',
          studentAccounts: false
        },
        {
          name: 'Tableau or PowerBI',
          purpose: 'Advanced data visualization',
          freeVersion: true,
          training: '4-hour workshop',
          studentAccounts: true
        },
        {
          name: 'GitHub',
          purpose: 'Version control and collaboration',
          freeVersion: true,
          training: '2-hour introduction',
          studentAccounts: true
        }
      ],
      alternatives: [
        {
          ifNo: 'Arduino IDE',
          then: 'Online Arduino simulator',
          modifications: ['Use Tinkercad Circuits', 'Limited to virtual testing', 'Provide pre-built hardware']
        },
        {
          ifNo: '3D Printer',
          then: 'Alternative fabrication',
          modifications: ['Use cardboard and foam', 'Laser cut acrylic', 'Repurpose existing cases']
        },
        {
          ifNo: 'Cloud platform',
          then: 'Local storage',
          modifications: ['Use local database', 'File-based storage', 'Limit real-time features']
        }
      ],
      digitalCitizenship: [
        'Biometric data privacy and consent',
        'Responsible data sharing practices',
        'Ethical considerations in health technology',
        'Open source licensing and attribution'
      ]
    }
  },

  // Teacher Support
  teacherSupport: {
    lessonPlans: [
      {
        week: 1,
        day: 1,
        title: 'Introduction to Stress and Biofeedback',
        duration: '90 minutes',
        objectives: [
          'Understand the physiological basis of stress',
          'Identify measurable stress indicators',
          'Explore existing biofeedback technologies'
        ],
        materials: [
          'Presentation slides',
          'Stress response handouts',
          'Demo pulse sensor',
          'Computers for research'
        ],
        procedures: [
          {
            time: '10 min',
            activity: 'Stress inventory activity',
            grouping: 'individual',
            teacherRole: 'Facilitate reflection',
            studentRole: 'Complete personal stress assessment'
          },
          {
            time: '20 min',
            activity: 'Stress physiology presentation',
            grouping: 'whole class',
            teacherRole: 'Present and explain concepts',
            studentRole: 'Take notes and ask questions'
          },
          {
            time: '30 min',
            activity: 'Biometric exploration stations',
            grouping: 'small groups',
            teacherRole: 'Guide exploration',
            studentRole: 'Test different sensors and record observations'
          },
          {
            time: '20 min',
            activity: 'Technology research',
            grouping: 'pairs',
            teacherRole: 'Support research',
            studentRole: 'Research existing wearables'
          },
          {
            time: '10 min',
            activity: 'Share and synthesis',
            grouping: 'whole class',
            teacherRole: 'Facilitate discussion',
            studentRole: 'Share findings and insights'
          }
        ],
        assessment: 'Exit ticket: Explain one way technology could help manage stress',
        homework: 'Research one biofeedback app or device and write a brief review',
        notes: 'Be sensitive to students\' personal stress experiences. Provide mental health resources.'
      }
    ],
    facilitation: {
      philosophy: 'Act as a guide and technical resource while empowering students to drive their own learning. Create a safe environment for experimentation and failure.',
      keyStrategies: [
        'Use think-pair-share for technical problem solving',
        'Implement daily stand-ups for project management',
        'Rotate expert roles within teams',
        'Model growth mindset with technical challenges'
      ],
      questioningTechniques: [
        'What evidence supports that design decision?',
        'How might a user with different needs experience this?',
        'What assumptions are we making about stress?',
        'How could we test this hypothesis?'
      ],
      groupManagement: [
        'Assign rotating team roles weekly',
        'Use pair programming for coding tasks',
        'Implement peer code reviews',
        'Create team contracts with norms'
      ],
      conflictResolution: [
        'Address technical disagreements with testing',
        'Use design thinking protocols for decisions',
        'Mediate with focus on user needs',
        'Celebrate diverse perspectives as strength'
      ]
    },
    professionaldevelopment: {
      preLaunch: [
        'Arduino basics workshop (4 hours)',
        'Mental health first aid training',
        'IRB and research ethics overview',
        'Project-based learning strategies'
      ],
      duringProject: [
        'Weekly teacher collaboration meetings',
        'Technical skill workshops as needed',
        'Guest expert presentations',
        'Reflection and adjustment sessions'
      ],
      postProject: [
        'Project debrief and improvement planning',
        'Student work analysis',
        'Community impact assessment',
        'Planning for sustainability'
      ],
      resources: [
        'Make: Magazine educator resources',
        'ISTE computational thinking materials',
        'Mental health education curricula',
        'Open-source hardware communities'
      ],
      community: 'Join the Wearables in Education online community for ongoing support, resource sharing, and collaboration with other educators implementing similar projects.'
    },
    parentCommunication: {
      introLetter: 'Dear Families, Your student will be participating in an innovative project combining technology and mental health awareness. They will build wearable devices that help people understand and manage stress. This real-world project develops technical skills while addressing an important health issue. The project involves working with sensors, programming, and data analysis. All data collection follows strict privacy protocols. We encourage your support and welcome your involvement.',
      weeklyUpdates: true,
      volunteerOpportunities: [
        'Share professional expertise in health or technology',
        'Assist with 3D printing and fabrication',
        'Participate as test users (with consent)',
        'Help with community showcase event'
      ],
      homeExtensions: [
        'Discuss family stress management strategies',
        'Test prototypes together',
        'Explore wellness apps as a family',
        'Practice mindfulness techniques'
      ],
      showcaseInvitation: 'You\'re invited to our Wellness Technology Showcase where students will demonstrate their biofeedback wearables and share their research on stress management. Join us to see how your students are using technology to promote mental health in our community.'
    }
  },

  // Student Support
  studentSupport: {
    projectGuide: {
      overview: 'You\'re about to embark on a journey to create technology that helps people understand and manage stress. This guide will help you navigate each phase of the project.',
      timeline: 'The project spans 10 weeks with four main phases. You\'ll spend 2 weeks understanding the problem, 3 weeks building your wearable, 3 weeks creating your dashboard, and 2 weeks testing and sharing your findings.',
      expectations: [
        'Participate actively in all team activities',
        'Document your process thoroughly',
        'Respect user privacy and consent',
        'Meet weekly milestones',
        'Support your teammates'
      ],
      resources: [
        'Class website with tutorials and links',
        'Teacher office hours for technical help',
        'Peer mentors from previous years',
        'Online communities for troubleshooting'
      ],
      tips: [
        'Start simple and add complexity gradually',
        'Test everything as you build',
        'Ask for help early when stuck',
        'Keep your user\'s needs central',
        'Celebrate small victories'
      ]
    },
    researchProtocol: {
      guidelines: [
        'Always obtain informed consent before collecting data',
        'Protect participant privacy and anonymity',
        'Be transparent about how data will be used',
        'Allow participants to withdraw at any time',
        'Store data securely and delete when no longer needed'
      ],
      credibleSources: [
        'PubMed for medical research',
        'IEEE Xplore for engineering papers',
        'Google Scholar for academic articles',
        'Professional organization websites',
        'Government health databases'
      ],
      citationFormat: 'APA 7th Edition for all research citations',
      factChecking: [
        'Verify information from multiple sources',
        'Check publication dates for currency',
        'Evaluate author credentials',
        'Distinguish correlation from causation'
      ],
      ethics: [
        'Do no harm to participants',
        'Ensure equitable access to benefits',
        'Respect cultural perspectives on mental health',
        'Acknowledge limitations of your findings',
        'Share results with participants'
      ]
    },
    collaborationTools: {
      teamFormation: 'Self-selected teams of 3-4 with diverse skills. Each team must have mix of technical, design, and communication strengths.',
      roles: [
        'Project Manager: Coordinates tasks and deadlines',
        'Lead Engineer: Oversees technical development',
        'UX Designer: Focuses on user experience',
        'Data Scientist: Manages analysis and visualization'
      ],
      norms: [
        'Respect all ideas and perspectives',
        'Share credit equitably',
        'Communicate openly about challenges',
        'Support each other\'s learning',
        'Celebrate successes together'
      ],
      conflictResolution: [
        'Address issues directly and respectfully',
        'Focus on project goals, not personalities',
        'Seek teacher mediation if needed',
        'Document decisions and rationale',
        'Learn from disagreements'
      ],
      communication: [
        'Daily stand-up meetings (5 minutes)',
        'Shared project documents',
        'Team chat channel',
        'Weekly progress reports',
        'Peer feedback sessions'
      ]
    },
    presentationSupport: {
      formats: [
        'Live demonstration with poster',
        'Conference-style presentation',
        'Video documentation',
        'Interactive workshop',
        'Science fair display'
      ],
      rubric: 'Presentations evaluated on clarity, technical accuracy, engagement, visual design, and response to questions',
      speakingTips: [
        'Practice with your device beforehand',
        'Prepare for technical difficulties',
        'Know your audience\'s background',
        'Tell a story about your user',
        'Show enthusiasm for your work'
      ],
      visualAids: [
        'Live dashboard demonstration',
        'Before/after stress data',
        'User testimonial video',
        'Technical diagram poster',
        'Physical device display'
      ],
      practice: 'Schedule practice sessions with peer feedback. Record yourself to identify areas for improvement. Prepare Q&A responses.'
    }
  },

  // Rich Media & Visuals
  media: {
    headerImage: '/images/hero-sensing-self-header.jpg',
    galleryImages: [
      '/images/sensing-self-wearable-prototype.jpg',
      '/images/sensing-self-dashboard-screen.jpg',
      '/images/sensing-self-user-testing.jpg',
      '/images/sensing-self-team-collaboration.jpg'
    ],
    videos: [
      {
        title: 'Project Introduction',
        url: 'https://example.com/sensing-self-intro',
        duration: '3:30',
        purpose: 'Overview of project goals and process'
      },
      {
        title: 'Sensor Tutorial',
        url: 'https://example.com/biometric-sensors-guide',
        duration: '12:45',
        purpose: 'Technical introduction to biometric sensors'
      },
      {
        title: 'Student Showcase',
        url: 'https://example.com/student-presentations',
        duration: '8:20',
        purpose: 'Examples of completed projects'
      }
    ],
    infographics: [
      {
        title: 'The Stress Response System',
        description: 'Visual guide to physiological stress responses',
        usage: 'Introduction lesson and user education'
      },
      {
        title: 'Wearable Design Process',
        description: 'Step-by-step workflow from concept to prototype',
        usage: 'Project planning and progress tracking'
      },
      {
        title: 'Data Privacy Best Practices',
        description: 'Guidelines for ethical data handling',
        usage: 'Research protocol training'
      }
    ],
    examples: [
      {
        title: 'StressWatch Pro',
        description: 'Wrist-worn device with HRV monitoring and breathing guidance',
        grade: 'A',
        highlights: [
          'Elegant form factor',
          'Real-time stress alerts',
          'Personalized interventions',
          'Comprehensive documentation'
        ]
      },
      {
        title: 'CalmClip',
        description: 'Discrete ear-worn sensor with mobile app',
        grade: 'A-',
        highlights: [
          'Innovative attachment method',
          'Minimal and comfortable design',
          'Sophisticated data analysis',
          'Strong user testing'
        ]
      },
      {
        title: 'ZenBand',
        description: 'Headband with EEG and meditation guidance',
        grade: 'B+',
        highlights: [
          'Advanced sensor integration',
          'Gamified stress reduction',
          'Good user engagement',
          'Creative visualization'
        ]
      }
    ]
  }
};