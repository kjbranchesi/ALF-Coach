import { HeroProjectData } from './types';
import sensingSelfImage from './images/SensingSelf.jpeg';

export const heroSensingSelfData: HeroProjectData = {
  // Core Metadata
  id: 'hero-sensing-self',
  title: 'Sensing Self: Wearables for Well-Being',
  tagline: 'Build biofeedback wearables and data dashboards that help people notice, understand, and regulate stress through real-time physiological insights',
  duration: '8 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['STEM', 'Health Sciences', 'Computer Science', 'Psychology', 'Data Science', 'Engineering'],
  theme: {
    primary: 'violet',
    secondary: 'teal',
    accent: 'amber',
    gradient: 'from-violet-600 to-teal-600'
  },
  image: sensingSelfImage,

  // Course Abstract
  courseAbstract: {
    overview: 'Students become wellness technology innovators, building actual wearable devices that detect stress through heart rate variability and skin conductance - the same sensors in smartwatches. But here\'s what makes it powerful: they don\'t just collect data, they create beautiful dashboards that reveal hidden patterns like "Your stress spikes every Tuesday at 2pm" or "That breathing exercise actually lowered your heart rate by 15%." Working with school wellness teams, students test their devices with real users, iterate based on feedback, and publish care guides that translate data into actionable wellness strategies. It\'s bioengineering meets mental health advocacy.',
    learningObjectives: [
      'Build functional wearable devices using Arduino and biometric sensors that detect physiological stress indicators',
      'Create interactive data dashboards that transform raw sensor data into meaningful wellness insights',
      'Understand the science of stress responses and how biofeedback can guide behavior change',
      'Design with empathy and ethics, ensuring user privacy and promoting genuine well-being over surveillance'
    ],
    methodology: 'Students operate like a health tech startup, moving from research to prototyping to user testing in rapid cycles. The classroom becomes part maker lab, part data science center, part wellness studio. Teams learn that effective mental health technology requires not just technical skills but deep empathy, ethical thinking, and the ability to translate complex data into human-centered insights. Real user feedback drives every iteration.',
    expectedOutcomes: [
      'Each team produces 3-5 working wearable prototypes that users actually want to wear daily',
      'Students discover their own stress patterns and develop data-informed coping strategies',
      'School wellness teams gain new tools and insights for supporting student mental health',
      'Published care guides provide evidence-based strategies that benefit the broader community',
      'Students become advocates for ethical, empowering uses of personal health technology'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This innovative project combines wearable technology, data science, and mental health advocacy. Students build biofeedback devices that make the invisible visible, helping users understand their stress responses and develop healthier habits.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '8 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Heart', label: 'Focus', value: 'Wellness Tech' },
      { icon: 'Zap', label: 'Skills', value: 'Advanced Making' }
    ],
    impactStatement: 'Students create real biofeedback tools that help their community understand and manage stress through data-informed insights.'
  },

  // Rich Context
  context: {
    problem: 'Teen stress and anxiety are at all-time highs, yet most students lack tools to understand their stress responses until they\'re overwhelmed. Commercial wellness wearables are expensive and often focus on fitness over mental health. Schools need evidence-based approaches to support student well-being that go beyond crisis intervention.',
    significance: 'This project empowers students to become both makers and advocates, creating accessible technology that promotes mental health awareness and provides real tools for stress management in their community.',
    realWorld: 'Students work directly with school counselors, wellness teams, and community health organizations to design, test, and deploy biofeedback systems that address real mental health needs.',
    studentRole: 'Biomedical engineers, data scientists, UX designers, and wellness advocates creating technology that makes mental health support more accessible and actionable.',
    authenticity: 'Every device is tested with real users, every dashboard addresses actual needs, and every care guide is based on real data from the community.'
  },

  // Comprehensive Overview
  overview: {
    description: 'Over 8 weeks, students journey from understanding the science of stress to building sophisticated biofeedback systems. They learn that effective wellness technology requires not just sensors and code, but thoughtful design that respects privacy, provides actionable insights, and empowers users to take control of their well-being.',
    keyFeatures: [
      'Hardware Engineering: Build wearables with heart rate, skin conductance, and motion sensors',
      'Data Science: Create algorithms that detect stress patterns and predict triggers',
      'Dashboard Design: Develop intuitive visualizations that make data actionable',
      'User Testing: Iterate based on real feedback from peers and community members',
      'Evidence-Based Care: Publish guides that translate findings into wellness strategies'
    ],
    outcomes: [
      'Working biofeedback wearable prototypes',
      'Interactive data dashboards with real-time visualizations',
      'Published care guides based on community data',
      'Improved mental health literacy and advocacy skills',
      'Portfolio of wellness technology projects'
    ],
    deliverables: [
      {
        name: 'Biofeedback Wearable Device',
        description: 'Functional prototype with sensors, microcontroller, and comfortable form factor',
        format: 'Physical device with documentation and source code'
      },
      {
        name: 'Data Dashboard Application',
        description: 'Web or mobile app showing real-time and historical stress data with insights',
        format: 'Interactive application with user guide'
      },
      {
        name: 'User Testing Report',
        description: 'Analysis of device effectiveness and user experience with recommendations',
        format: 'Research report with data analysis and user testimonials'
      },
      {
        name: 'Care Guide Publication',
        description: 'Evidence-based strategies for stress management based on collected data',
        format: 'Published guide for school and community distribution'
      },
      {
        name: 'Technical Documentation',
        description: 'Complete build instructions and code for replication',
        format: 'Open-source repository with tutorials'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'Biofeedback can guide habit change - when we make the invisible patterns of stress visible through technology, we empower people to understand their bodies, recognize triggers, and develop healthier responses.',
    essentialQuestion: 'How might wearables help us notice, understand, and regulate stress in ways that promote genuine well-being rather than anxiety?',
    subQuestions: [
      'What physiological signals best indicate stress and how can we measure them affordably?',
      'How do we transform complex biometric data into insights that actually help people?',
      'What ethical considerations arise when collecting intimate health data from peers?',
      'How can technology support mental health without becoming another source of stress?'
    ],
    challenge: 'Build a wearable biofeedback system with dashboard, test with real users, and publish a data-informed care guide that helps your community better understand and manage stress.',
    drivingQuestion: 'How might we use biofeedback technology to make mental wellness more visible, understandable, and manageable for our community?'
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2 weeks',
        focus: 'Understanding stress science and biofeedback',
        activities: [
          {
            name: 'Stress Science Workshop',
            description: 'Explore the neuroscience of stress and measurable physiological indicators',
            duration: '90 minutes',
            outputs: ['Concept maps', 'Research notes']
          },
          {
            name: 'Biofeedback Technology Survey',
            description: 'Research existing devices and evaluate their approaches to wellness',
            duration: '120 minutes',
            outputs: ['Technology comparison chart', 'Design criteria']
          },
          {
            name: 'User Empathy Interviews',
            description: 'Interview peers and community members about stress and coping strategies',
            duration: '180 minutes',
            outputs: ['User personas', 'Journey maps']
          },
          {
            name: 'Sensor Exploration Lab',
            description: 'Experiment with different biometric sensors and data collection methods',
            duration: '120 minutes',
            outputs: ['Sensor test results', 'Feasibility analysis']
          },
          {
            name: 'Ethics Workshop',
            description: 'Discuss privacy, consent, and responsible use of health data',
            duration: '90 minutes',
            outputs: ['Ethics guidelines', 'Consent protocols']
          },
          {
            name: 'Wellness Partner Meeting',
            description: 'Connect with school counselors and health organizations',
            duration: '60 minutes',
            outputs: ['Partnership agreements', 'Requirement list']
          },
          {
            name: 'Project Scoping',
            description: 'Define specific goals and success metrics for devices',
            duration: '60 minutes',
            outputs: ['Project charter', 'Timeline']
          },
          {
            name: 'Technical Skill Building',
            description: 'Learn Arduino programming and basic electronics',
            duration: '180 minutes',
            outputs: ['Practice circuits', 'Code samples']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Designing the system architecture',
        activities: [
          {
            name: 'System Architecture Design',
            description: 'Plan the complete system from sensors to dashboard',
            duration: '120 minutes',
            outputs: ['System diagram', 'Data flow chart']
          },
          {
            name: 'Wearable Form Factor Design',
            description: 'Create comfortable, practical designs for daily wear',
            duration: '90 minutes',
            outputs: ['Design sketches', '3D models']
          },
          {
            name: 'Dashboard Wireframing',
            description: 'Design user interfaces for data visualization',
            duration: '120 minutes',
            outputs: ['Wireframes', 'User flow diagrams']
          },
          {
            name: 'Algorithm Development',
            description: 'Create stress detection algorithms from sensor data',
            duration: '180 minutes',
            outputs: ['Algorithm documentation', 'Test results']
          },
          {
            name: 'Database Design',
            description: 'Plan data storage and privacy protection',
            duration: '90 minutes',
            outputs: ['Database schema', 'Security plan']
          },
          {
            name: 'Prototype Planning',
            description: 'Create detailed build plans and material lists',
            duration: '60 minutes',
            outputs: ['Build instructions', 'Component list']
          },
          {
            name: 'User Testing Protocol',
            description: 'Develop systematic testing procedures',
            duration: '90 minutes',
            outputs: ['Testing protocol', 'Feedback forms']
          },
          {
            name: 'Design Review',
            description: 'Present designs to wellness partners for feedback',
            duration: '60 minutes',
            outputs: ['Presentation', 'Revision notes']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '3 weeks',
        focus: 'Building and testing prototypes',
        activities: [
          {
            name: 'Circuit Assembly',
            description: 'Build and test electronic circuits with sensors',
            duration: '180 minutes',
            outputs: ['Working circuits', 'Test data']
          },
          {
            name: 'Microcontroller Programming',
            description: 'Program Arduino to collect and transmit sensor data',
            duration: '240 minutes',
            outputs: ['Firmware code', 'Communication protocols']
          },
          {
            name: 'Enclosure Fabrication',
            description: '3D print or craft wearable enclosures',
            duration: '180 minutes',
            outputs: ['Physical enclosures', 'Assembly instructions']
          },
          {
            name: 'Dashboard Development',
            description: 'Build web or mobile application for data visualization',
            duration: '360 minutes',
            outputs: ['Working dashboard', 'API documentation']
          },
          {
            name: 'Integration Testing',
            description: 'Test complete system from sensor to dashboard',
            duration: '120 minutes',
            outputs: ['Test results', 'Bug list']
          },
          {
            name: 'Alpha Testing',
            description: 'Internal testing with team members',
            duration: '180 minutes',
            outputs: ['Usage data', 'Improvement list']
          },
          {
            name: 'Iteration Sprint',
            description: 'Rapid improvements based on alpha feedback',
            duration: '240 minutes',
            outputs: ['Updated prototypes', 'Change log']
          },
          {
            name: 'Beta User Recruitment',
            description: 'Find and onboard external test users',
            duration: '60 minutes',
            outputs: ['User list', 'Consent forms']
          },
          {
            name: 'Beta Testing Launch',
            description: 'Deploy devices with real users for extended testing',
            duration: '120 minutes',
            outputs: ['Deployed devices', 'Support documentation']
          },
          {
            name: 'Data Collection',
            description: 'Monitor and collect usage data from beta testers',
            duration: '240 minutes',
            outputs: ['Usage analytics', 'Performance metrics']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '1 week',
        focus: 'Sharing findings and impact',
        activities: [
          {
            name: 'Data Analysis',
            description: 'Analyze all collected data for patterns and insights',
            duration: '180 minutes',
            outputs: ['Analysis report', 'Key findings']
          },
          {
            name: 'Care Guide Writing',
            description: 'Create evidence-based wellness recommendations',
            duration: '240 minutes',
            outputs: ['Care guide draft', 'Supporting data']
          },
          {
            name: 'Documentation Completion',
            description: 'Finalize all technical and user documentation',
            duration: '120 minutes',
            outputs: ['Complete documentation', 'Tutorials']
          },
          {
            name: 'Showcase Preparation',
            description: 'Prepare presentations and demonstrations',
            duration: '180 minutes',
            outputs: ['Presentation deck', 'Demo scripts']
          },
          {
            name: 'Wellness Summit',
            description: 'Present to school and community stakeholders',
            duration: '120 minutes',
            outputs: ['Live demonstration', 'Q&A session']
          },
          {
            name: 'Open Source Release',
            description: 'Publish code and designs for community use',
            duration: '90 minutes',
            outputs: ['GitHub repository', 'License documentation']
          },
          {
            name: 'Impact Assessment',
            description: 'Evaluate project outcomes and user feedback',
            duration: '90 minutes',
            outputs: ['Impact report', 'Testimonials']
          },
          {
            name: 'Sustainability Planning',
            description: 'Plan for continued support and development',
            duration: '60 minutes',
            outputs: ['Maintenance plan', 'Future roadmap']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        phase: 'Discover',
        title: 'Research Complete',
        description: 'Finish user research and technical exploration',
        evidence: ['User personas', 'Technical feasibility report', 'Ethics guidelines'],
        celebration: 'Share findings with wellness partners'
      },
      {
        week: 4,
        phase: 'Define',
        title: 'Design Finalized',
        description: 'Complete system design and get approval',
        evidence: ['System architecture', 'Prototype plans', 'Partner approval'],
        celebration: 'Design review presentation'
      },
      {
        week: 6,
        phase: 'Develop',
        title: 'Alpha Prototype',
        description: 'Working prototype ready for internal testing',
        evidence: ['Functional device', 'Dashboard v1', 'Test results'],
        celebration: 'First successful stress detection'
      },
      {
        week: 7,
        phase: 'Develop',
        title: 'Beta Launch',
        description: 'Devices deployed with external users',
        evidence: ['Beta devices', 'User training', 'Support system'],
        celebration: 'Community testing begins'
      },
      {
        week: 8,
        phase: 'Deliver',
        title: 'Project Showcase',
        description: 'Present findings and care guide to community',
        evidence: ['Care guide', 'Impact data', 'User testimonials'],
        celebration: 'Wellness Summit presentation'
      }
    ]
  },

  // Assessment Framework
  assessment: {
    formative: [
      'Weekly progress logs documenting design decisions and challenges',
      'Peer reviews of prototypes and code',
      'User feedback from testing sessions',
      'Iteration documentation showing improvements',
      'Wellness partner check-ins'
    ],
    summative: [
      'Functional wearable device meeting design specifications',
      'Dashboard application with real-time data visualization',
      'User testing report with quantitative and qualitative analysis',
      'Published care guide with evidence-based recommendations',
      'Technical documentation enabling replication'
    ],
    criteria: [
      'Technical functionality and reliability',
      'User experience and design quality',
      'Data analysis and insight generation',
      'Ethical considerations and privacy protection',
      'Communication and documentation clarity'
    ],
    rubric: [
      {
        category: 'Technical Implementation',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Device reliably collects accurate biometric data; dashboard provides real-time insights; system is robust and well-documented'
        },
        proficient: {
          score: 3,
          description: 'Device functions consistently; dashboard displays data clearly; documentation is complete'
        },
        developing: {
          score: 2,
          description: 'Device works with some issues; basic dashboard functionality; documentation has gaps'
        },
        beginning: {
          score: 1,
          description: 'Device has significant problems; dashboard incomplete; minimal documentation'
        }
      },
      {
        category: 'User-Centered Design',
        weight: 25,
        exemplary: {
          score: 4,
          description: 'Extensive user research drives design; multiple iterations based on feedback; exceptional user experience'
        },
        proficient: {
          score: 3,
          description: 'Good user research evident; design iterations shown; positive user experience'
        },
        developing: {
          score: 2,
          description: 'Some user input considered; limited iteration; adequate user experience'
        },
        beginning: {
          score: 1,
          description: 'Minimal user consideration; no iteration; poor user experience'
        }
      },
      {
        category: 'Data Analysis & Insights',
        weight: 20,
        exemplary: {
          score: 4,
          description: 'Sophisticated analysis reveals meaningful patterns; insights are actionable and well-communicated; strong evidence base'
        },
        proficient: {
          score: 3,
          description: 'Good analysis identifies patterns; insights are useful; evidence supports conclusions'
        },
        developing: {
          score: 2,
          description: 'Basic analysis completed; some insights generated; limited evidence'
        },
        beginning: {
          score: 1,
          description: 'Minimal analysis; few insights; weak evidence'
        }
      },
      {
        category: 'Ethics & Privacy',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Comprehensive privacy protection; clear consent process; thoughtful ethical considerations throughout'
        },
        proficient: {
          score: 3,
          description: 'Good privacy measures; proper consent obtained; ethical issues addressed'
        },
        developing: {
          score: 2,
          description: 'Basic privacy protection; consent process exists; some ethical consideration'
        },
        beginning: {
          score: 1,
          description: 'Privacy concerns; inadequate consent; limited ethical thinking'
        }
      },
      {
        category: 'Communication & Impact',
        weight: 15,
        exemplary: {
          score: 4,
          description: 'Exceptional care guide with clear recommendations; compelling presentation; measurable community impact'
        },
        proficient: {
          score: 3,
          description: 'Good care guide with useful recommendations; effective presentation; positive impact'
        },
        developing: {
          score: 2,
          description: 'Basic care guide; adequate presentation; some impact shown'
        },
        beginning: {
          score: 1,
          description: 'Incomplete care guide; weak presentation; minimal impact'
        }
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Engineering & Making',
        items: [
          'Design and build functional electronic circuits with multiple sensors',
          'Program microcontrollers to collect and process biometric data',
          'Create comfortable, wearable form factors using various fabrication methods',
          'Troubleshoot and iterate hardware designs based on testing'
        ]
      },
      {
        category: 'Data Science & Analysis',
        items: [
          'Collect and clean real-time physiological data',
          'Develop algorithms to detect patterns and anomalies',
          'Create meaningful visualizations that communicate insights',
          'Apply statistical methods to validate findings'
        ]
      },
      {
        category: 'Health & Wellness',
        items: [
          'Understand stress physiology and biofeedback principles',
          'Identify evidence-based wellness interventions',
          'Translate data into actionable health recommendations',
          'Advocate for mental health awareness and support'
        ]
      },
      {
        category: 'Ethics & Privacy',
        items: [
          'Implement privacy-preserving data practices',
          'Obtain informed consent for health data collection',
          'Consider implications of personal health monitoring',
          'Balance innovation with user well-being'
        ]
      }
    ],
    alignments: {
      'NGSS High School': [
        {
          code: 'HS-ETS1-1',
          text: 'Analyze major global challenges to specify criteria and constraints for solutions',
          application: 'Students define design criteria for wellness technology addressing mental health challenges',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-2',
          text: 'Design solutions to complex problems by breaking them into smaller problems',
          application: 'Students decompose biofeedback system into sensor, processing, and visualization components',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate solutions based on prioritized criteria and trade-offs',
          application: 'Students evaluate designs for accuracy, comfort, privacy, and effectiveness',
          depth: 'develop'
        },
        {
          code: 'HS-LS1-3',
          text: 'Plan and conduct investigation to provide evidence of feedback mechanisms',
          application: 'Students investigate how biofeedback affects stress responses',
          depth: 'develop'
        }
      ],
      'ISTE Standards': [
        {
          code: '1.4',
          text: 'Innovative Designer - Students use design process to generate ideas and solve problems',
          application: 'Students design innovative wellness technology solutions',
          depth: 'master'
        },
        {
          code: '1.5',
          text: 'Computational Thinker - Students develop strategies for understanding and solving problems',
          application: 'Students create algorithms for stress detection and pattern recognition',
          depth: 'master'
        },
        {
          code: '1.6',
          text: 'Creative Communicator - Students communicate clearly using platforms and media',
          application: 'Students create dashboards and care guides that communicate health insights',
          depth: 'develop'
        },
        {
          code: '1.2',
          text: 'Digital Citizen - Students recognize rights and responsibilities in digital world',
          application: 'Students implement ethical data practices and privacy protection',
          depth: 'master'
        }
      ],
      'Common Core Math': [
        {
          code: 'HSS-ID.B.6',
          text: 'Represent data on two quantitative variables and describe relationships',
          application: 'Students analyze relationships between stress indicators and triggers',
          depth: 'master'
        },
        {
          code: 'HSS-IC.B.6',
          text: 'Evaluate reports based on data',
          application: 'Students validate wellness claims with collected biometric data',
          depth: 'develop'
        },
        {
          code: 'HSA-CED.A.2',
          text: 'Create equations in two or more variables to represent relationships',
          application: 'Students model stress responses mathematically',
          depth: 'introduce'
        }
      ],
      'Common Core ELA': [
        {
          code: 'RST.11-12.7',
          text: 'Integrate and evaluate multiple sources of information',
          application: 'Students synthesize user research, sensor data, and wellness literature',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and evidence',
          application: 'Students write care guides with data-supported recommendations',
          depth: 'develop'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly for audience and purpose',
          application: 'Students present findings to wellness teams and community',
          depth: 'develop'
        }
      ],
      'National Health Education Standards': [
        {
          code: 'Standard 1',
          text: 'Students comprehend concepts related to health promotion',
          application: 'Students understand stress physiology and management strategies',
          depth: 'master'
        },
        {
          code: 'Standard 2',
          text: 'Students analyze influences on health behaviors',
          application: 'Students identify stress triggers through data analysis',
          depth: 'develop'
        },
        {
          code: 'Standard 7',
          text: 'Students practice health-enhancing behaviors',
          application: 'Students develop and test stress management interventions',
          depth: 'master'
        },
        {
          code: 'Standard 8',
          text: 'Students advocate for personal and community health',
          application: 'Students promote mental health awareness through technology',
          depth: 'develop'
        }
      ]
    },
    skills: [
      {
        category: '21st Century Skills',
        items: [
          'Critical thinking and problem-solving',
          'Creativity and innovation',
          'Communication and collaboration',
          'Digital literacy and computational thinking'
        ]
      },
      {
        category: 'Technical Skills',
        items: [
          'Electronics and circuit design',
          'Programming and software development',
          'Data analysis and visualization',
          '3D design and fabrication'
        ]
      },
      {
        category: 'Health & Wellness Skills',
        items: [
          'Biometric measurement and interpretation',
          'Stress management techniques',
          'Health communication',
          'Wellness advocacy'
        ]
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Electronics Components',
        items: [
          'Arduino or similar microcontroller',
          'Heart rate sensor (pulse oximeter)',
          'Skin conductance sensor (GSR)',
          'Accelerometer for movement detection',
          'Bluetooth or WiFi module',
          'Battery and power management'
        ]
      },
      {
        category: 'Fabrication Materials',
        items: [
          '3D printer access or craft materials',
          'Flexible straps or bands',
          'Enclosure materials',
          'Basic tools and soldering equipment'
        ]
      },
      {
        category: 'Software Tools',
        items: [
          'Arduino IDE for programming',
          'Web development tools (HTML/CSS/JavaScript)',
          'Data visualization libraries',
          'Database system (Firebase or similar)'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Sensors',
        items: [
          'EEG sensors for brainwave monitoring',
          'Temperature sensors',
          'Blood pressure monitors',
          'Respiratory rate sensors'
        ]
      },
      {
        category: 'Professional Tools',
        items: [
          'Oscilloscope for signal analysis',
          'Professional CAD software',
          'Advanced statistical software',
          'Medical-grade reference devices'
        ]
      }
    ],
    community: [
      {
        type: 'School Wellness Team',
        role: 'Provide mental health expertise and user testing support'
      },
      {
        type: 'Community Health Organizations',
        role: 'Share wellness resources and distribution channels'
      },
      {
        type: 'Local Maker Space',
        role: 'Provide advanced fabrication tools and expertise'
      },
      {
        type: 'University Research Lab',
        role: 'Offer technical guidance and validation support'
      },
      {
        type: 'Healthcare Professionals',
        role: 'Review care guides and provide medical insights'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: {
      primary: ['High school students experiencing stress', 'School counselors and wellness teams', 'Parents concerned about teen mental health'],
      secondary: ['Teachers and administrators', 'Community health workers', 'Youth organizations'],
      global: ['Open-source hardware community', 'Mental health researchers', 'Other schools implementing wellness programs'],
      engagement: 'Direct device testing with 30+ users, care guide distribution to 500+ community members',
      feedback: 'Continuous user feedback through app analytics, surveys, and focus groups'
    },
    personal: [
      'Students develop technical skills in engineering and data science',
      'Increased awareness of mental health and stress management',
      'Confidence in creating technology that helps others',
      'Experience in ethical health technology development',
      'Portfolio pieces for college and career applications'
    ],
    academic: [
      'Integration of STEM with health and social sciences',
      'Authentic application of engineering design process',
      'Real-world data analysis and interpretation',
      'Technical writing and scientific communication',
      'Interdisciplinary problem-solving experience'
    ],
    community: [
      'Accessible biofeedback tools for stress management',
      'Increased mental health awareness and literacy',
      'Evidence-based wellness strategies from local data',
      'Reduced stigma around mental health discussions',
      'Model for student-led health innovation'
    ],
    methods: [
      {
        method: 'School Wellness Integration',
        format: 'Devices available through counseling office',
        venue: 'School health center',
        technology: ['Lending library of devices', 'Dashboard kiosks'],
        preparation: ['Staff training', 'Usage protocols', 'Privacy policies']
      },
      {
        method: 'Community Workshop Series',
        format: 'Public demonstrations and DIY sessions',
        venue: 'Library or community center',
        technology: ['Demo devices', 'Build kits', 'Instructional materials'],
        preparation: ['Workshop planning', 'Material preparation', 'Registration system']
      },
      {
        method: 'Digital Distribution',
        format: 'Online repository and care guide',
        venue: 'Project website and social media',
        technology: ['GitHub repository', 'Documentation wiki', 'Video tutorials'],
        preparation: ['Code cleanup', 'Documentation writing', 'Website development']
      },
      {
        method: 'Healthcare Partnership',
        format: 'Pilot program with local clinics',
        venue: 'Healthcare facilities',
        technology: ['Clinical-grade devices', 'HIPAA-compliant systems'],
        preparation: ['IRB approval', 'Clinical protocols', 'Training materials']
      }
    ],
    metrics: [
      {
        metric: 'User Engagement',
        target: '50+ active users over 4 weeks',
        measurement: 'Dashboard analytics and usage logs',
        timeline: 'Testing period and beyond',
        evidence: 'Usage statistics and retention rates'
      },
      {
        metric: 'Stress Reduction',
        target: '25% improvement in reported stress management',
        measurement: 'Pre/post surveys and biometric data',
        timeline: '4-week intervention period',
        evidence: 'Statistical analysis of outcomes'
      },
      {
        metric: 'Care Guide Reach',
        target: '500+ downloads/distributions',
        measurement: 'Download tracking and distribution records',
        timeline: '3 months post-publication',
        evidence: 'Analytics and feedback forms'
      },
      {
        metric: 'Replication',
        target: '5+ schools adopt the program',
        measurement: 'GitHub forks and implementation reports',
        timeline: '1 year post-release',
        evidence: 'Adoption documentation and case studies'
      },
      {
        metric: 'Student Learning',
        target: '100% demonstrate proficiency in key skills',
        measurement: 'Portfolio assessment and presentations',
        timeline: 'End of project',
        evidence: 'Rubric scores and skill demonstrations'
      }
    ],
    sustainability: {
      continuation: 'Establish wellness tech club to maintain and expand devices',
      maintenance: 'Monthly device check-ups and software updates',
      evolution: 'Annual hackathon to improve and innovate',
      legacy: 'Open-source repository enables global replication',
      funding: 'Grants from health foundations and tech companies',
      partnerships: 'Formal agreements with wellness organizations'
    },
    scalability: {
      classroom: 'Single class creates 10-15 devices for peer testing',
      school: 'Multiple classes outfit entire wellness program',
      district: 'District-wide implementation with central support',
      beyond: 'Open-source model enables any school to replicate'
    }
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule ideal (90-minute periods); can adapt to traditional',
      touchpoints: 'Weekly team meetings; bi-weekly wellness partner check-ins',
      flexibility: 'Can extend to 10 weeks for deeper exploration'
    },
    budget: {
      basic: '$50-75 per device for components; $500-750 for class of 30',
      enhanced: '$100-150 per device with advanced sensors; $1500 total',
      grants: 'Available from health foundations, STEM programs, mental health orgs'
    },
    stakeholders: {
      school: 'Counseling office partnership essential; admin support for health data',
      parents: 'Consent required for biometric monitoring; engagement encouraged',
      community: 'Health organizations provide expertise and distribution channels'
    },
    challenges: [
      {
        challenge: 'Privacy concerns about health data',
        solution: 'Strong consent process, local data storage, user control of all data'
      },
      {
        challenge: 'Technical complexity for beginners',
        solution: 'Start with pre-built modules, provide extensive tutorials, peer mentoring'
      },
      {
        challenge: 'Accuracy of student-built devices',
        solution: 'Validate against commercial devices, focus on trends not medical diagnosis'
      },
      {
        challenge: 'Sustained engagement with devices',
        solution: 'Gamification elements, social features, regular check-ins'
      }
    ],
    support: {
      training: '2-day teacher workshop on electronics and wellness technology',
      materials: 'Complete lesson plans, build guides, and assessment rubrics',
      mentorship: 'Connect with bioengineering programs and maker spaces',
      network: 'Join network of schools doing wellness technology projects'
    }
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Provide pre-built circuit modules to reduce complexity',
      'Focus on dashboard design rather than hardware',
      'Partner with stronger peers for technical tasks',
      'Offer alternative roles in user research and testing',
      'Extended time and additional tutoring sessions'
    ],
    forAdvanced: [
      'Add machine learning for predictive stress detection',
      'Develop mobile apps with advanced features',
      'Create custom PCBs for professional devices',
      'Conduct clinical-grade validation studies',
      'Present at health technology conferences'
    ],
    modifications: [
      'Adjust sensor complexity based on skill level',
      'Vary dashboard sophistication requirements',
      'Flexible timeline for different paces',
      'Alternative assessment options available',
      'Multiple paths to demonstrate learning'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Wellness Technology Expo',
    venue: 'School gymnasium or community center',
    audience: 'Students, families, health professionals, community members',
    components: [
      'Live device demonstrations',
      'Interactive dashboard displays',
      'User testimonial videos',
      'Care guide distribution',
      'DIY station for visitors'
    ],
    artifacts: [
      'Working biofeedback devices',
      'Live data dashboards',
      'Published care guides',
      'Technical documentation',
      'Impact assessment reports'
    ]
  }
};