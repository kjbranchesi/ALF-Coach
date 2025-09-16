import { HeroProjectData } from './types';
import accessAbilityImage from './images/AccessAbilityTech.jpeg';

export const heroAssistiveTechData: HeroProjectData = {
  // Core Metadata
  id: 'hero-assistive-tech',
  title: 'Everyday Innovations: Designing Tools for Dignity',
  tagline: 'Partner with users with disabilities to co-design and build low-cost assistive tools that provide both function and dignity',
  duration: '6-8 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Engineering', 'Technology', 'Health Sciences', 'Mathematics', 'Social Studies', 'Art & Design'],
  theme: {
    primary: 'purple',
    secondary: 'teal',
    accent: 'orange',
    gradient: 'from-purple-600 to-teal-600'
  },
  image: accessAbilityImage,

  // Course Abstract
  courseAbstract: {
    overview: 'Here\'s something amazing: Students partner with real people with disabilities to create custom tools that change their daily lives. Not generic, one-size-fits-nobody devices, but personalized solutions designed for one specific person\'s needs. A student might build a card holder for someone with arthritis who loves playing poker with friends, or create a phone mount for someone with cerebral palsy to video-call their grandkids independently. Using 3D printers, basic electronics, and tons of creativity, students discover that the best innovations come from truly listening to what people need - not what we assume they need.',
    learningObjectives: [
      'Learn that people with disabilities are the real experts - they know exactly what would make their lives easier',
      'Master maker skills like 3D printing, basic circuits, and Arduino programming through purposeful creation',
      'Discover how small, thoughtful innovations can restore independence and dignity in powerful ways',
      'Create open-source designs that can help people around the world facing similar challenges'
    ],
    methodology: 'This isn\'t about "helping the disabled" - it\'s about partnership. Students and their partners become co-designers, working together through multiple prototypes until they create something that actually works. The classroom transforms into an innovation lab where failure is expected, iteration is celebrated, and the measure of success is the smile on a partner\'s face when they use their device for the first time. Every design is documented and shared freely online so others can build or improve upon it.',
    expectedOutcomes: [
      'Students create 2-3 devices that their partners actually use every day - not shelf decorations but life-changing tools',
      'Partners gain independence in specific tasks they couldn\'t do before, from buttoning shirts to turning book pages',
      'Designs get downloaded and built by people worldwide - a grip aid designed in Ohio helps someone in Thailand',
      'Students realize engineering isn\'t just about solving puzzles - it\'s about solving problems for real people',
      'Many students stay in touch with their partners long after the project, having formed genuine friendships'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This transformative assistive technology project was designed using ALF Coach to address a profound challenge: How can high school students use engineering and empathy to create assistive tools that enhance independence and dignity for people with disabilities?',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '6-8 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Target', label: 'Subjects', value: '6 Areas' },
      { icon: 'Award', label: 'Standards', value: '25+ Aligned' }
    ],
    impactStatement: 'Students become innovators and advocates, creating real assistive solutions that transform daily life for their user partners.'
  },

  // Rich Context
  context: {
    problem: 'One billion people worldwide need assistive technology, yet only 10% have access. Commercial solutions are often expensive, generic, and fail to address individual needs. Meanwhile, the voices and expertise of users with disabilities are often excluded from the design process.',
    significance: 'This project transforms students into empathetic engineers and designers who understand that disability is not a problem to be fixed, but a source of innovation and creative problem-solving.',
    realWorld: 'Students partner directly with users with disabilities, prototype in makerspaces, test solutions iteratively, and share open-source designs that can be replicated globally.',
    studentRole: 'Co-designers, engineers, makers, and accessibility advocates working alongside users with disabilities to create custom assistive tools that enhance independence.',
    authenticity: 'Every tool created addresses a real need identified by a real person, with designs shared openly to benefit others facing similar challenges worldwide.'
  },

  // Comprehensive Overview
  overview: {
    description: 'This project combines universal design principles, engineering design process, and disability justice frameworks into a 6-8 week journey where students learn that the best assistive technology comes from genuine partnership between makers and users.',
    keyFeatures: [
      'User-Centered Co-Design: Students work as partners, not providers, learning from the expertise of people with disabilities',
      'Rapid Prototyping: Students use 3D printing, laser cutting, Arduino, and everyday materials to create functional prototypes',
      'Iterative Testing: Solutions evolve through multiple cycles of testing and refinement with user partners',
      'Open-Source Documentation: All designs are documented and shared freely for global replication and adaptation',
      'Dignity-Centered Design: Focus on solutions that are not just functional but also aesthetic, empowering, and dignifying'
    ],
    outcomes: [
      'Functional assistive tools customized for user partners',
      'Open-source design repository for community use',
      'Strengthened disability awareness and allyship',
      'Technical skills in CAD, fabrication, and electronics',
      'Empathy and understanding of inclusive design'
    ],
    deliverables: [
      {
        name: 'User Partnership Agreement',
        description: 'Formal collaboration plan establishing roles, goals, and communication protocols',
        format: 'Written agreement with consent forms and partnership timeline'
      },
      {
        name: 'Functional Prototype',
        description: 'Working assistive tool that addresses user-identified need',
        format: 'Physical device with documentation of iterations'
      },
      {
        name: 'Technical Documentation',
        description: 'Complete build instructions including CAD files, code, and assembly guides',
        format: 'Open-source repository with step-by-step instructions'
      },
      {
        name: 'Impact Assessment',
        description: 'Evaluation of tool effectiveness and user satisfaction',
        format: 'Written report with user testimonial and usage data'
      },
      {
        name: 'Design Showcase',
        description: 'Public presentation demonstrating solution and design process',
        format: 'Live demonstration with poster and multimedia presentation'
      }
    ]
  },

  // Big Idea & Essential Questions
  bigIdea: {
    statement: 'True innovation emerges when we design with, not for, people with disabilities, recognizing their expertise and centering dignity alongside functionality in every solution.',
    essentialQuestion: 'How can we create assistive technology that honors user expertise, enhances independence, and maintains human dignity while being affordable and replicable?',
    subQuestions: [
      'What does it mean to design with rather than for someone?',
      'How do we balance functionality with aesthetics and dignity?',
      'What makes a solution truly accessible versus merely available?',
      'How can open-source design democratize access to assistive technology?',
      'What ethical considerations guide our design decisions?'
    ],
    challenge: 'Partner with a user with a disability to co-design, build, test, and document an assistive tool that addresses their specific need while maintaining dignity and independence.',
    drivingQuestion: 'How might we use our skills to create tools that transform daily challenges into opportunities for independence?'
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      {
        category: 'Engineering Design',
        items: [
          'Apply engineering design process to real-world problems',
          'Create and test multiple prototype iterations',
          'Use CAD software and digital fabrication tools',
          'Document designs for replication and modification'
        ]
      },
      {
        category: 'Human-Centered Design',
        items: [
          'Conduct empathetic user interviews and observations',
          'Identify and prioritize user needs over assumptions',
          'Incorporate user feedback throughout design process',
          'Balance multiple design constraints and criteria'
        ]
      },
      {
        category: 'Technical Skills',
        items: [
          'Use 3D modeling software for custom parts',
          'Program microcontrollers for adaptive interfaces',
          'Apply principles of mechanics and ergonomics',
          'Select appropriate materials and fabrication methods'
        ]
      },
      {
        category: 'Social Understanding',
        items: [
          'Understand disability as diversity not deficit',
          'Recognize and challenge ableist assumptions',
          'Practice respectful and inclusive communication',
          'Advocate for accessibility and inclusion'
        ]
      }
    ],
    alignments: {
      'NGSS': [
        {
          code: 'HS-ETS1-1',
          text: 'Analyze major global challenges to specify qualitative and quantitative criteria and constraints for solutions',
          application: 'Students analyze accessibility challenges and define design criteria with user partners',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-2',
          text: 'Design a solution to a complex real-world problem by breaking it down into smaller, manageable problems',
          application: 'Students decompose complex accessibility needs into solvable design challenges',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate a solution to a complex real-world problem based on prioritized criteria and trade-offs',
          application: 'Students evaluate prototypes against user-defined criteria including dignity and usability',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-4',
          text: 'Use a computer simulation to model the impacts of proposed solutions',
          application: 'Students use CAD to model and test designs before fabrication',
          depth: 'develop'
        }
      ],
      'ISTE': [
        {
          code: '1.1',
          text: 'Students leverage technology to take an active role in choosing and achieving learning goals',
          application: 'Students choose appropriate technologies for their assistive solutions',
          depth: 'master'
        },
        {
          code: '1.4',
          text: 'Students use a variety of technologies within a design process to solve problems',
          application: 'Students integrate multiple technologies in their prototyping process',
          depth: 'master'
        },
        {
          code: '1.5',
          text: 'Students develop and employ strategies for understanding and solving problems',
          application: 'Students iterate solutions based on user testing and feedback',
          depth: 'develop'
        },
        {
          code: '1.7',
          text: 'Students use digital tools to broaden perspectives and enrich learning by collaborating with others',
          application: 'Students collaborate with user partners and share designs globally',
          depth: 'master'
        }
      ],
      'CCSS-Math': [
        {
          code: 'HSG-MG.A.3',
          text: 'Apply geometric methods to solve design problems',
          application: 'Students apply geometry in CAD modeling and ergonomic design',
          depth: 'develop'
        },
        {
          code: 'HSA-CED.A.4',
          text: 'Rearrange formulas to highlight a quantity of interest',
          application: 'Students calculate forces, leverage, and material properties',
          depth: 'introduce'
        },
        {
          code: 'HSS-IC.B.6',
          text: 'Evaluate reports based on data',
          application: 'Students analyze usage data and user feedback quantitatively',
          depth: 'develop'
        }
      ],
      'CCSS-ELA': [
        {
          code: 'RST.11-12.3',
          text: 'Follow complex multistep procedures when carrying out experiments or technical tasks',
          application: 'Students follow and create technical documentation for fabrication',
          depth: 'master'
        },
        {
          code: 'W.11-12.2',
          text: 'Write informative/explanatory texts to examine and convey complex ideas clearly',
          application: 'Students write comprehensive build guides and design rationales',
          depth: 'master'
        },
        {
          code: 'SL.11-12.5',
          text: 'Make strategic use of digital media in presentations',
          application: 'Students create multimedia presentations of their solutions',
          depth: 'develop'
        }
      ],
      'CTE-Engineering': [
        {
          code: 'MAN.1',
          text: 'Apply manufacturing processes and use tools safely',
          application: 'Students use makerspaces and fabrication tools following safety protocols',
          depth: 'master'
        },
        {
          code: 'MAN.2',
          text: 'Design products using CAD software',
          application: 'Students create custom parts using professional CAD tools',
          depth: 'develop'
        },
        {
          code: 'MAN.3',
          text: 'Understand material properties and selection',
          application: 'Students select appropriate materials for durability, safety, and comfort',
          depth: 'develop'
        },
        {
          code: 'MAN.4',
          text: 'Apply quality control and testing procedures',
          application: 'Students test prototypes systematically with user partners',
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
        duration: '1-2 weeks',
        focus: 'Build empathy and understanding through user partnership',
        description: 'Students learn about disability experiences, assistive technology, and establish partnerships with users to understand their specific needs and preferences.',
        objectives: [
          'Develop disability awareness and challenge assumptions',
          'Establish respectful user partnerships',
          'Understand specific user needs and contexts',
          'Learn about existing assistive technologies'
        ],
        activities: [
          {
            name: 'Disability Awareness Workshop',
            type: 'class',
            duration: '2 class periods',
            description: 'Interactive workshop on disability models, language, and etiquette',
            materials: ['Simulation materials', 'Guest speaker or video', 'Reflection journals'],
            instructions: [
              'Discuss medical vs. social models of disability',
              'Practice person-first and identity-first language',
              'Experience simulations with critical discussion',
              'Reflect on personal assumptions and biases'
            ],
            differentiation: {
              support: ['Provide vocabulary support', 'Use visual aids', 'Allow written reflections'],
              extension: ['Research disability rights history', 'Interview disability advocates', 'Create awareness campaign']
            },
            assessment: 'Quality of reflection on assumptions and learning'
          },
          {
            name: 'User Partnership Meeting',
            type: 'group',
            duration: '90 minutes',
            description: 'First meeting with user partner to establish relationship and understand needs',
            materials: ['Interview guide', 'Consent forms', 'Recording device', 'Notebook'],
            instructions: [
              'Introduce team and project goals',
              'Listen to user story and daily challenges',
              'Observe specific tasks or activities',
              'Establish communication preferences'
            ],
            differentiation: {
              support: ['Provide conversation starters', 'Allow written questions', 'Teacher facilitation available'],
              extension: ['Conduct home visit', 'Shadow full day', 'Research specific condition']
            },
            assessment: 'Respectful engagement and quality of observations'
          },
          {
            name: 'Needs Analysis',
            type: 'group',
            duration: '2 class periods',
            description: 'Analyze user needs to identify design opportunities',
            materials: ['Journey maps', 'Priority matrices', 'Sticky notes', 'Markers'],
            instructions: [
              'Map user daily journey and pain points',
              'Identify highest priority needs',
              'Research existing solutions',
              'Define design criteria with user'
            ],
            differentiation: {
              support: ['Provide analysis templates', 'Focus on one key need', 'Visual mapping tools'],
              extension: ['Comparative analysis of solutions', 'Cost-benefit analysis', 'Patent research']
            },
            assessment: 'Thoroughness of analysis and user involvement'
          }
        ],
        deliverables: [
          'User partnership agreement signed',
          'Needs assessment document with priorities',
          'Initial design criteria and constraints'
        ],
        checkpoints: [
          {
            name: 'Partnership Established',
            criteria: ['User agreement signed', 'Communication plan set', 'Initial trust built'],
            evidence: ['Signed forms', 'Meeting notes', 'User feedback'],
            support: 'Provide partnership protocol templates and guidance'
          }
        ],
        resources: ['Disability etiquette guides', 'AT assessment tools', 'Partnership agreement templates'],
        teacherNotes: 'Emphasize respect and dignity. Users are experts in their own needs. Students are learning from, not helping, their partners.',
        studentTips: 'Listen more than you speak. Your user partner knows their needs better than anyone. Your job is to understand and translate those needs into design solutions.'
      },
      {
        id: 'phase-define',
        name: 'Define',
        duration: '1 week',
        focus: 'Clarify the design challenge and establish success criteria',
        description: 'Students work with users to define specific problems, establish clear success criteria, and plan their design approach.',
        objectives: [
          'Define specific problem statement with user',
          'Establish measurable success criteria',
          'Research materials and methods',
          'Create project plan and timeline'
        ],
        activities: [
          {
            name: 'Problem Definition Workshop',
            type: 'group',
            duration: '1 class period',
            description: 'Collaborative session to define specific problem to solve',
            materials: ['Problem statement templates', 'User feedback', 'Research notes'],
            instructions: [
              'Review all user needs identified',
              'Select focus problem with user input',
              'Write clear problem statement',
              'Define what success looks like'
            ],
            differentiation: {
              support: ['Provide problem statement examples', 'Teacher guidance', 'Simplified template'],
              extension: ['Multiple problem statements', 'Systems thinking approach', 'Research papers']
            },
            assessment: 'Clarity and user-centeredness of problem statement'
          },
          {
            name: 'Solution Brainstorming',
            type: 'group',
            duration: '2 class periods',
            description: 'Generate wide range of possible solutions without constraints',
            materials: ['Brainstorming supplies', 'Inspiration cards', 'Sketch materials'],
            instructions: [
              'Use various ideation techniques',
              'Generate 50+ ideas quickly',
              'Combine and build on ideas',
              'No judgment during ideation'
            ],
            differentiation: {
              support: ['Provide idea starters', 'Use visual brainstorming', 'Smaller idea quota'],
              extension: ['SCAMPER technique', 'Biomimicry inspiration', 'Patent database search']
            },
            assessment: 'Quantity and diversity of ideas generated'
          },
          {
            name: 'Concept Selection',
            type: 'group',
            duration: '1 class period',
            description: 'Evaluate and select most promising concepts with user',
            materials: ['Evaluation matrices', 'Concept sketches', 'User criteria'],
            instructions: [
              'Present top concepts to user',
              'Evaluate against criteria',
              'Consider feasibility factors',
              'Select 1-2 concepts to prototype'
            ],
            differentiation: {
              support: ['Simplified criteria', 'Teacher facilitation', 'Visual decision tools'],
              extension: ['Weighted criteria', 'Risk analysis', 'Multiple concepts']
            },
            assessment: 'Rationale for concept selection and user involvement'
          }
        ],
        deliverables: [
          'Problem statement document',
          'Success criteria checklist',
          'Selected concept sketches with rationale'
        ],
        checkpoints: [
          {
            name: 'Problem Defined',
            criteria: ['Clear problem statement', 'User agreement on focus', 'Success metrics defined'],
            evidence: ['Written statement', 'User approval', 'Criteria list'],
            support: 'Provide problem definition frameworks and examples'
          }
        ],
        resources: ['Design thinking toolkits', 'Concept selection matrices', 'Feasibility checklists'],
        teacherNotes: 'Keep user voice central. The problem statement should reflect their priorities, not student assumptions.',
        studentTips: 'A well-defined problem is half solved. Take time to get this right with your user partner.'
      },
      {
        id: 'phase-develop',
        name: 'Develop',
        duration: '2-3 weeks',
        focus: 'Build and refine prototypes through iterative testing',
        description: 'Students create multiple prototype iterations, testing each with their user partner and refining based on feedback.',
        objectives: [
          'Create low-fidelity prototypes quickly',
          'Test prototypes with user partner',
          'Iterate based on user feedback',
          'Develop final functional prototype'
        ],
        activities: [
          {
            name: 'Rapid Prototyping',
            type: 'group',
            duration: '3-4 class periods',
            description: 'Create quick, low-fidelity prototypes to test concepts',
            materials: ['Cardboard', 'Foam core', '3D printer', 'Basic electronics', 'Hand tools'],
            instructions: [
              'Build rough prototypes quickly',
              'Focus on function over form',
              'Create multiple versions if needed',
              'Document each iteration'
            ],
            differentiation: {
              support: ['Provide templates', 'Start with paper prototypes', 'Teacher assistance'],
              extension: ['Working mechanisms', 'Electronic components', 'Multiple variations']
            },
            assessment: 'Speed of iteration and willingness to fail fast'
          },
          {
            name: 'User Testing Session',
            type: 'group',
            duration: '90 minutes',
            description: 'Test prototypes with user partner in real context',
            materials: ['Prototypes', 'Testing protocol', 'Recording device', 'Observation sheets'],
            instructions: [
              'Set up realistic testing environment',
              'Have user try prototype naturally',
              'Observe without interfering',
              'Gather specific feedback'
            ],
            differentiation: {
              support: ['Structured observation guide', 'Teacher present', 'Video for review'],
              extension: ['Multiple test scenarios', 'Quantitative metrics', 'Comparative testing']
            },
            assessment: 'Quality of testing protocol and observations'
          },
          {
            name: 'CAD Modeling',
            type: 'individual',
            duration: '2-3 class periods',
            description: 'Create digital models of refined design',
            materials: ['CAD software', 'Computers', 'Measurement tools', 'Reference images'],
            instructions: [
              'Take precise measurements',
              'Model custom components',
              'Consider assembly and tolerances',
              'Prepare files for fabrication'
            ],
            differentiation: {
              support: ['Start with simple shapes', 'Provide tutorials', 'Use easier software'],
              extension: ['Complex assemblies', 'Parametric design', 'Simulation testing']
            },
            assessment: 'Accuracy and completeness of CAD models'
          },
          {
            name: 'Final Fabrication',
            type: 'group',
            duration: '3-4 class periods',
            description: 'Build final prototype using appropriate materials and methods',
            materials: ['3D printer', 'Laser cutter', 'Selected materials', 'Assembly hardware'],
            instructions: [
              'Follow safety protocols',
              'Use appropriate fabrication methods',
              'Focus on quality and durability',
              'Include aesthetic considerations'
            ],
            differentiation: {
              support: ['Pre-cut materials', 'Simpler assembly', 'More supervision'],
              extension: ['Advanced techniques', 'Custom electronics', 'Multiple units']
            },
            assessment: 'Quality of construction and attention to detail'
          }
        ],
        deliverables: [
          'Multiple prototype iterations documented',
          'CAD files and technical drawings',
          'Final functional prototype',
          'Testing data and user feedback'
        ],
        checkpoints: [
          {
            name: 'First Prototype',
            criteria: ['Low-fi prototype created', 'Initial user testing done', 'Feedback documented'],
            evidence: ['Photos of prototype', 'Testing video', 'Feedback notes'],
            support: 'Provide prototyping materials and space'
          },
          {
            name: 'Final Prototype',
            criteria: ['Functional device completed', 'Meets user needs', 'Safe and durable'],
            evidence: ['Working device', 'User approval', 'Safety check'],
            support: 'Technical assistance and quality control'
          }
        ],
        resources: ['Makerspace access', 'Prototyping materials', 'CAD tutorials', 'Safety equipment'],
        teacherNotes: 'Emphasize iteration over perfection. Each prototype teaches something valuable. Celebrate failures as learning.',
        studentTips: 'Your first prototype will be terrible - that\'s the point! Each version gets you closer to a solution that truly works.'
      },
      {
        id: 'phase-deliver',
        name: 'Deliver',
        duration: '1-2 weeks',
        focus: 'Document, share, and celebrate the solution',
        description: 'Students create comprehensive documentation, deliver the final solution to their user partner, and share their designs with the broader community.',
        objectives: [
          'Create comprehensive build documentation',
          'Train user on device use and maintenance',
          'Share designs as open-source resources',
          'Present project to community'
        ],
        activities: [
          {
            name: 'Documentation Creation',
            type: 'group',
            duration: '2-3 class periods',
            description: 'Create complete build guide for replication',
            materials: ['Computers', 'Cameras', 'Documentation templates', 'Version control'],
            instructions: [
              'Write step-by-step assembly instructions',
              'Include bill of materials with sources',
              'Provide CAD files and code',
              'Create troubleshooting guide'
            ],
            differentiation: {
              support: ['Use templates', 'Focus on key steps', 'Visual instructions'],
              extension: ['Video tutorials', 'Multiple languages', 'Cost variations']
            },
            assessment: 'Completeness and clarity of documentation'
          },
          {
            name: 'User Training',
            type: 'group',
            duration: '90 minutes',
            description: 'Train user partner on device use and care',
            materials: ['Final device', 'User manual', 'Spare parts', 'Maintenance kit'],
            instructions: [
              'Demonstrate all features',
              'Practice with user',
              'Provide maintenance instructions',
              'Leave contact for support'
            ],
            differentiation: {
              support: ['Simple instructions', 'Visual guides', 'Practice together'],
              extension: ['Train caregivers', 'Create video guide', 'Remote support plan']
            },
            assessment: 'User confidence and satisfaction with training'
          },
          {
            name: 'Open-Source Publishing',
            type: 'group',
            duration: '1 class period',
            description: 'Upload designs to open-source repositories',
            materials: ['Repository accounts', 'License information', 'Documentation files'],
            instructions: [
              'Choose appropriate license',
              'Upload all design files',
              'Write clear descriptions',
              'Tag for discoverability'
            ],
            differentiation: {
              support: ['Help with upload', 'Simple license', 'Basic description'],
              extension: ['Multiple platforms', 'Promote sharing', 'Track downloads']
            },
            assessment: 'Quality of repository and accessibility'
          },
          {
            name: 'Public Showcase',
            type: 'class',
            duration: 'Half day event',
            description: 'Present solutions to school and community',
            materials: ['Display boards', 'Devices', 'Presentation equipment', 'Handouts'],
            instructions: [
              'Set up professional display',
              'Demonstrate device functionality',
              'Share user impact story',
              'Answer audience questions'
            ],
            differentiation: {
              support: ['Scripted presentation', 'Team presenting', 'Visual aids'],
              extension: ['Live user testimonial', 'Media coverage', 'Awards submission']
            },
            assessment: 'Presentation quality and audience engagement'
          }
        ],
        deliverables: [
          'Complete build documentation package',
          'User training materials',
          'Open-source repository live',
          'Showcase presentation'
        ],
        checkpoints: [
          {
            name: 'Documentation Complete',
            criteria: ['All files uploaded', 'Instructions clear', 'Tested by peer'],
            evidence: ['Repository link', 'Peer feedback', 'Download stats'],
            support: 'Documentation templates and review'
          },
          {
            name: 'User Satisfaction',
            criteria: ['Device meets needs', 'User can operate independently', 'Positive feedback'],
            evidence: ['User testimonial', 'Usage data', 'Video demonstration'],
            support: 'Follow-up support and modifications'
          }
        ],
        resources: ['Repository platforms', 'Presentation templates', 'Event planning guide'],
        teacherNotes: 'This phase celebrates both the solution and the partnership. Ensure user voice is prominent in all presentations.',
        studentTips: 'Your documentation could help someone across the world. Make it clear enough that anyone could build your solution.'
      }
    ],
    milestones: [
      {
        id: 'milestone-1',
        phase: 'Discover',
        week: 2,
        title: 'Partnership Established',
        description: 'User partnership formalized with clear understanding of needs',
        evidence: ['Signed agreement', 'Needs assessment', 'Trust established'],
        celebration: 'Partnership certificates and team photo'
      },
      {
        id: 'milestone-2',
        phase: 'Define',
        week: 3,
        title: 'Problem Defined',
        description: 'Clear problem statement and design criteria established with user',
        evidence: ['Problem statement', 'Success criteria', 'User approval'],
        celebration: 'Problem-Solver badges'
      },
      {
        id: 'milestone-3',
        phase: 'Develop',
        week: 5,
        title: 'First Successful Test',
        description: 'Prototype successfully performs intended function with user',
        evidence: ['Working prototype', 'Test video', 'User feedback'],
        celebration: 'Innovator certificates'
      },
      {
        id: 'milestone-4',
        phase: 'Develop',
        week: 6,
        title: 'Final Prototype Complete',
        description: 'Refined, functional device ready for delivery',
        evidence: ['Finished device', 'Quality check', 'User approval'],
        celebration: 'Maker achievement awards'
      },
      {
        id: 'milestone-5',
        phase: 'Deliver',
        week: 8,
        title: 'Solution Delivered',
        description: 'Device delivered to user with training and documentation shared globally',
        evidence: ['User using device', 'Repository live', 'Presentation complete'],
        celebration: 'Impact celebration with user partners'
      }
    ],
    timeline: [
      { week: 1, phase: 'Discover', title: 'Launch & Awareness', activities: ['Disability workshop', 'Partnership prep', 'Initial research'], deliverable: undefined, assessment: undefined },
      { week: 2, phase: 'Discover', title: 'User Partnership', activities: ['Partner meeting', 'Needs assessment', 'Observation'], deliverable: 'Partnership agreement', assessment: 'Formative check' },
      { week: 3, phase: 'Define', title: 'Problem Definition', activities: ['Problem workshop', 'Brainstorming', 'Concept selection'], deliverable: 'Problem statement', assessment: 'Peer review' },
      { week: 4, phase: 'Develop', title: 'Rapid Prototyping', activities: ['Low-fi prototypes', 'Initial testing', 'Iteration'], deliverable: 'First prototype', assessment: undefined },
      { week: 5, phase: 'Develop', title: 'Refinement', activities: ['CAD modeling', 'User testing', 'Design refinement'], deliverable: undefined, assessment: 'Progress check' },
      { week: 6, phase: 'Develop', title: 'Final Build', activities: ['Fabrication', 'Assembly', 'Quality testing'], deliverable: 'Final prototype', assessment: 'Technical review' },
      { week: 7, phase: 'Deliver', title: 'Documentation', activities: ['Build guides', 'User training', 'Repository setup'], deliverable: 'Documentation package', assessment: undefined },
      { week: 8, phase: 'Deliver', title: 'Showcase', activities: ['Presentation prep', 'Public showcase', 'Celebration'], deliverable: 'Final presentation', assessment: 'Summative assessment' }
    ],
    weeklyBreakdown: [
      {
        week: 1,
        theme: 'Understanding & Empathy',
        objectives: ['Develop disability awareness', 'Challenge assumptions', 'Prepare for partnerships'],
        mondayFriday: [
          { day: 'Monday', warmUp: 'Accessibility audit', mainActivity: 'Project introduction and impact videos', closure: 'Reflection on assumptions', materials: ['Videos', 'Journals'], time: '50 min' },
          { day: 'Tuesday', warmUp: 'Disability myths quiz', mainActivity: 'Disability awareness workshop', closure: 'Small group discussion', materials: ['Workshop materials'], time: '50 min' },
          { day: 'Wednesday', warmUp: 'AT examples exploration', mainActivity: 'Guest speaker or panel', closure: 'Question generation', materials: ['Speaker setup'], time: '50 min' },
          { day: 'Thursday', warmUp: 'Communication practice', mainActivity: 'Partnership preparation and protocols', closure: 'Role play practice', materials: ['Protocol guides'], time: '50 min' },
          { day: 'Friday', warmUp: 'Week reflection', mainActivity: 'Team formation and planning', closure: 'Partnership outreach', materials: ['Contact lists'], time: '50 min' }
        ],
        homework: 'Research one assistive technology innovation',
        parentUpdate: 'Students beginning assistive technology project - discuss disability awareness at home'
      }
    ]
  },

  // Assessment Framework
  assessment: {
    philosophy: 'Assessment focuses on both technical excellence and human-centered design process. User satisfaction and real-world impact are valued alongside academic standards. Growth in empathy and understanding is as important as engineering skills.',
    rubric: [
      {
        category: 'User-Centered Design',
        weight: 30,
        exemplary: {
          points: 100,
          description: 'Exceptional partnership with user voice central throughout process',
          evidence: ['User deeply involved in all decisions', 'Multiple feedback cycles', 'User needs clearly met', 'Dignity preserved and enhanced']
        },
        proficient: {
          points: 85,
          description: 'Strong user partnership with regular involvement',
          evidence: ['User involved in key decisions', 'Regular feedback gathered', 'Primary needs addressed', 'Respectful approach maintained']
        },
        developing: {
          points: 70,
          description: 'Basic user involvement with some partnership elements',
          evidence: ['User consulted at checkpoints', 'Some feedback incorporated', 'Basic needs considered', 'Generally respectful']
        },
        beginning: {
          points: 55,
          description: 'Limited user involvement or understanding',
          evidence: ['Minimal user consultation', 'Little feedback integration', 'Assumptions present', 'May lack sensitivity']
        }
      },
      {
        category: 'Technical Execution',
        weight: 25,
        exemplary: {
          points: 100,
          description: 'Professional-quality prototype with excellent craftsmanship',
          evidence: ['Fully functional device', 'High build quality', 'Safe and durable', 'Aesthetically pleasing']
        },
        proficient: {
          points: 85,
          description: 'Functional prototype with good construction',
          evidence: ['Device works as intended', 'Good build quality', 'Safe to use', 'Acceptable appearance']
        },
        developing: {
          points: 70,
          description: 'Working prototype with some quality issues',
          evidence: ['Basic functionality achieved', 'Some construction issues', 'Generally safe', 'Rough appearance']
        },
        beginning: {
          points: 55,
          description: 'Limited functionality or poor construction',
          evidence: ['Partial functionality', 'Quality concerns', 'Safety issues', 'Unfinished appearance']
        }
      },
      {
        category: 'Design Process',
        weight: 20,
        exemplary: {
          points: 100,
          description: 'Exemplary iteration with extensive testing and refinement',
          evidence: ['Multiple prototypes tested', 'Clear evolution of design', 'Data-driven decisions', 'Creative problem-solving']
        },
        proficient: {
          points: 85,
          description: 'Good design process with meaningful iteration',
          evidence: ['Several iterations completed', 'Testing informed changes', 'Logical refinements', 'Problems addressed']
        },
        developing: {
          points: 70,
          description: 'Basic design process with some iteration',
          evidence: ['Few iterations attempted', 'Some testing done', 'Minor refinements', 'Some problems solved']
        },
        beginning: {
          points: 55,
          description: 'Limited iteration or testing',
          evidence: ['Minimal iteration', 'Little testing', 'Few changes made', 'Problems unresolved']
        }
      },
      {
        category: 'Documentation & Sharing',
        weight: 15,
        exemplary: {
          points: 100,
          description: 'Comprehensive documentation enabling full replication',
          evidence: ['Complete build guide', 'Clear instructions', 'All files included', 'Accessible format']
        },
        proficient: {
          points: 85,
          description: 'Good documentation with most information needed',
          evidence: ['Detailed instructions', 'Most steps clear', 'Key files included', 'Generally accessible']
        },
        developing: {
          points: 70,
          description: 'Basic documentation with essential information',
          evidence: ['Basic instructions', 'Main steps covered', 'Some files included', 'Somewhat accessible']
        },
        beginning: {
          points: 55,
          description: 'Incomplete or unclear documentation',
          evidence: ['Missing instructions', 'Unclear steps', 'Files incomplete', 'Difficult to follow']
        }
      },
      {
        category: 'Impact & Advocacy',
        weight: 10,
        exemplary: {
          points: 100,
          description: 'Significant positive impact with broader advocacy',
          evidence: ['Transforms user experience', 'Advocates for accessibility', 'Inspires others', 'Challenges systems']
        },
        proficient: {
          points: 85,
          description: 'Clear positive impact on user partner',
          evidence: ['Improves user daily life', 'Raises awareness', 'Engages community', 'Promotes inclusion']
        },
        developing: {
          points: 70,
          description: 'Some positive impact demonstrated',
          evidence: ['Helps with specific task', 'Some awareness raised', 'Limited engagement', 'Basic inclusion']
        },
        beginning: {
          points: 55,
          description: 'Limited or unclear impact',
          evidence: ['Minimal improvement', 'Little awareness', 'No engagement', 'Impact unclear']
        }
      }
    ],
    formative: [
      {
        name: 'Design Journal',
        type: 'Individual reflection',
        frequency: 'Daily',
        purpose: 'Track design thinking and empathy development',
        method: 'Written or visual journal with prompts',
        feedback: 'Weekly teacher comments on growth and insights'
      },
      {
        name: 'User Check-ins',
        type: 'Partnership assessment',
        frequency: 'After each phase',
        purpose: 'Ensure user needs are being met',
        method: 'Structured feedback from user partner',
        feedback: 'Immediate team discussion of user input'
      },
      {
        name: 'Prototype Reviews',
        type: 'Technical assessment',
        frequency: 'Each iteration',
        purpose: 'Evaluate technical progress and quality',
        method: 'Peer and teacher review of prototypes',
        feedback: 'Specific suggestions for improvement'
      },
      {
        name: 'Team Functioning',
        type: 'Collaboration assessment',
        frequency: 'Weekly',
        purpose: 'Monitor team dynamics and contribution',
        method: 'Self and peer evaluation',
        feedback: 'Team meeting to address issues'
      }
    ],
    summative: [
      {
        name: 'Final Device Evaluation',
        type: 'Product assessment',
        timing: 'End of project',
        format: 'Functional testing with user',
        criteria: ['Functionality', 'Usability', 'Durability', 'Aesthetics', 'User satisfaction'],
        weight: 35
      },
      {
        name: 'Documentation Portfolio',
        type: 'Process documentation',
        timing: 'Throughout project',
        format: 'Digital portfolio with all artifacts',
        criteria: ['Completeness', 'Clarity', 'Reflection depth', 'Technical accuracy'],
        weight: 30
      },
      {
        name: 'Public Presentation',
        type: 'Communication assessment',
        timing: 'Final showcase',
        format: 'Live demonstration and Q&A',
        criteria: ['Technical explanation', 'User story', 'Professionalism', 'Audience engagement'],
        weight: 20
      },
      {
        name: 'Open-Source Contribution',
        type: 'Sharing assessment',
        timing: 'Final week',
        format: 'Published repository and guide',
        criteria: ['Completeness', 'Accessibility', 'Clarity', 'Potential for replication'],
        weight: 15
      }
    ],
    selfAssessment: [
      {
        name: 'Empathy Growth Tracker',
        frequency: 'Weekly',
        format: 'Scale with reflection',
        prompts: ['How has your understanding of disability changed?', 'What assumptions have you challenged?', 'How well did you listen to your user?'],
        reflection: 'Students identify specific moments of growth and areas for continued learning'
      },
      {
        name: 'Technical Skills Checklist',
        frequency: 'After each phase',
        format: 'Skills inventory',
        prompts: ['What new technical skills did you develop?', 'Where do you need more support?', 'What do you want to learn next?'],
        reflection: 'Students track skill development and set learning goals'
      }
    ],
    peerAssessment: [
      {
        name: 'Design Review Protocol',
        structure: 'Teams review each other\'s prototypes',
        guidelines: ['Focus on function first', 'Consider user perspective', 'Offer specific suggestions', 'Acknowledge innovations'],
        feedbackForm: 'Structured form with criteria-based feedback'
      },
      {
        name: 'Partnership Observation',
        structure: 'Peers observe user partnership meetings',
        guidelines: ['Note respectful communication', 'Observe listening skills', 'Document user involvement', 'Suggest improvements'],
        feedbackForm: 'Observation checklist with narrative feedback'
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      { name: '3D printer access', type: 'technology', quantity: '1-2 printers', source: 'School makerspace or library', cost: '$0 if available' },
      { name: 'Basic prototyping materials', type: 'material', quantity: 'Class set', source: 'Cardboard, foam, basic hardware', cost: '$200' },
      { name: 'CAD software', type: 'technology', quantity: 'Class licenses', source: 'Fusion 360 (free for education)', cost: '$0' },
      { name: 'Hand tools and safety equipment', type: 'material', quantity: 'Makerspace set', source: 'School shop or makerspace', cost: '$0-300' }
    ],
    optional: [
      { name: 'Arduino kits', type: 'technology', quantity: '5-10 kits', source: 'Electronics supplier', cost: '$300', alternatives: ['Micro:bit', 'Raspberry Pi'] },
      { name: 'Laser cutter access', type: 'technology', quantity: '1 machine', source: 'Local makerspace or university', cost: '$0-50/hour', alternatives: ['Hand cutting', 'CNC router'] },
      { name: 'Specialty materials', type: 'material', quantity: 'As needed', source: 'Medical supply or hardware store', cost: '$100-200', alternatives: ['Recycled materials'] }
    ],
    professional: [
      {
        title: 'Stanford d.school Design Thinking Resources',
        type: 'website',
        link: 'https://dschool.stanford.edu/resources',
        description: 'Comprehensive design thinking methodology and tools',
        alignment: 'Guides human-centered design process throughout project'
      },
      {
        title: 'IDEO Design Kit',
        type: 'website',
        link: 'http://www.designkit.org',
        description: 'Methods and case studies for human-centered design',
        alignment: 'Provides specific methods for user research and ideation'
      },
      {
        title: 'Inclusive Design Toolkit',
        type: 'website',
        link: 'https://www.inclusivedesigntoolkit.com',
        description: 'Resources for designing with disability in mind',
        alignment: 'Essential for understanding inclusive design principles'
      },
      {
        title: 'Instructables Assistive Technology',
        type: 'website',
        link: 'https://www.instructables.com/assistive-technology',
        description: 'Open-source assistive technology projects',
        alignment: 'Provides inspiration and technical examples'
      }
    ],
    studentResources: [
      {
        name: 'CAD for Beginners',
        type: 'Video tutorial series',
        ageAppropriate: true,
        link: 'Fusion 360 learning pathway',
        description: 'Step-by-step CAD modeling tutorials',
        scaffolding: 'Start with simple shapes, progress to assemblies'
      },
      {
        name: 'Interview Skills Guide',
        type: 'Handout',
        ageAppropriate: true,
        description: 'Respectful interviewing techniques for user research',
        scaffolding: 'Practice with peers before user interviews'
      },
      {
        name: '3D Printing Basics',
        type: 'Workshop',
        ageAppropriate: true,
        description: 'How to prepare and print 3D models',
        scaffolding: 'Teacher demonstration, then supervised practice'
      },
      {
        name: 'Electronics Primer',
        type: 'Online course',
        ageAppropriate: true,
        link: 'Arduino tutorials',
        description: 'Basic electronics and programming for adaptive devices',
        scaffolding: 'Optional for teams wanting electronic solutions'
      }
    ],
    communityConnections: [
      {
        organization: 'Local Disability Services Center',
        contactPerson: 'Program Coordinator',
        role: 'User partner connections and expertise',
        contribution: 'Connect with potential user partners, provide disability awareness training',
        scheduling: 'Contact 4 weeks before project start'
      },
      {
        organization: 'University Engineering Department',
        contactPerson: 'Outreach Coordinator',
        role: 'Technical mentorship and resources',
        contribution: 'Student mentors, advanced equipment access, technical expertise',
        scheduling: 'Arrange partnership at semester start'
      },
      {
        organization: 'Local Makerspace',
        contactPerson: 'Education Director',
        role: 'Fabrication resources and expertise',
        contribution: 'Equipment access, training workshops, material donations',
        scheduling: 'Schedule visits 2 weeks in advance'
      },
      {
        organization: 'Occupational/Physical Therapy Clinic',
        contactPerson: 'Clinical Director',
        role: 'Clinical expertise and user insights',
        contribution: 'Guest speakers, ergonomic consultation, user referrals',
        scheduling: 'Flexible scheduling with notice'
      }
    ]
  },

  // Impact & Audience
  impact: {
    audience: {
      primary: ['User partners with disabilities', 'Families and caregivers', 'Disability services organizations'],
      secondary: ['School community', 'Local media', 'Maker community', 'Healthcare providers'],
      global: ['Open-source community', 'International AT organizations', 'Other schools and programs'],
      engagement: 'Direct partnership throughout with formal presentation at conclusion',
      feedback: 'Continuous user feedback, community showcase response, download/replication tracking'
    },
    methods: [
      {
        method: 'Public Showcase Event',
        format: 'Interactive exhibition with live demonstrations',
        venue: 'School gymnasium or community center',
        technology: ['Display stations', 'Demo devices', 'Video screens'],
        preparation: ['Setup displays', 'Practice demonstrations', 'Prepare materials', 'Invite community']
      },
      {
        method: 'User Impact Documentation',
        format: 'Video testimonials and case studies',
        venue: 'Online and at showcase',
        technology: ['Video equipment', 'Editing software', 'Sharing platform'],
        preparation: ['Film user stories', 'Edit videos', 'Obtain permissions', 'Create captions']
      },
      {
        method: 'Open-Source Repository',
        format: 'Complete design files and documentation online',
        technology: ['GitHub or Instructables', 'CAD file hosting', 'Version control'],
        preparation: ['Organize files', 'Write documentation', 'Choose license', 'Promote availability']
      },
      {
        method: 'Peer Teaching',
        format: 'Students teach other classes or schools',
        venue: 'Classroom visits or video conferences',
        technology: ['Presentation tools', 'Sample materials', 'Video conferencing'],
        preparation: ['Develop curriculum', 'Create handouts', 'Practice teaching', 'Schedule sessions']
      }
    ],
    metrics: [
      {
        metric: 'User Satisfaction',
        target: '90% user partner satisfaction rating',
        measurement: 'User feedback surveys and interviews',
        timeline: 'End of project and 3-month follow-up',
        evidence: 'Survey results, testimonials, continued use data'
      },
      {
        metric: 'Device Functionality',
        target: 'Device successfully performs intended function',
        measurement: 'Technical testing and user demonstration',
        timeline: 'Final week and follow-up check',
        evidence: 'Test results, video of use, user confirmation'
      },
      {
        metric: 'Replication Impact',
        target: '10+ downloads or replications within 6 months',
        measurement: 'Repository analytics and user reports',
        timeline: '6 months post-publication',
        evidence: 'Download stats, replication photos, user feedback'
      },
      {
        metric: 'Student Growth',
        target: '100% students report increased disability awareness',
        measurement: 'Pre/post surveys and reflections',
        timeline: 'Beginning and end of project',
        evidence: 'Survey data, reflection journals, presentations'
      },
      {
        metric: 'Community Engagement',
        target: '100+ community members engaged',
        measurement: 'Event attendance, media coverage, online engagement',
        timeline: 'Throughout project',
        evidence: 'Attendance records, media clips, social metrics'
      }
    ],
    sustainability: {
      continuation: 'Establish ongoing AT design club or program',
      maintenance: 'Provide user support and device maintenance plan',
      evolution: 'Annual showcase and repository updates',
      legacy: 'Training materials for future cohorts and other schools'
    },
    scalability: {
      classroom: 'Single user partnership with whole class support',
      school: 'Multiple teams with different user partners',
      district: 'District-wide AT design challenge or competition',
      beyond: 'National network of schools sharing designs'
    }
  },

  // Implementation Support
  implementation: {
    gettingStarted: {
      overview: 'This project requires 3-4 weeks of preparation to establish partnerships and prepare resources. Focus on building relationships with disability organizations and ensuring makerspace readiness.',
      prerequisites: [
        'Administrative support for user partnerships',
        'Makerspace or fabrication access arranged',
        'Partnership with disability services organization',
        'Basic CAD and fabrication training for teacher',
        'Safety protocols and permissions in place'
      ],
      firstWeek: [
        'Launch with powerful disability awareness workshop',
        'Establish clear expectations about respect and dignity',
        'Form diverse teams based on skills and interests',
        'Begin connecting with potential user partners',
        'Set up project management and documentation systems'
      ],
      commonMistakes: [
        'Treating users as subjects rather than partners - emphasize collaboration',
        'Focusing on disability rather than person - use person-first approach',
        'Over-promising on technical capabilities - be realistic',
        'Underestimating time for iteration - build in buffer',
        'Neglecting documentation - capture everything from start'
      ],
      quickWins: [
        'Successful first user meeting establishing trust',
        'First prototype that demonstrates understanding',
        'Positive user feedback on any iteration',
        'Community member expressing interest',
        'Student "aha" moment about disability'
      ]
    },
    weeklyReflections: [
      { week: 1, studentPrompts: ['What assumptions about disability did you bring?', 'How do you feel about the partnership model?'], teacherPrompts: ['Are students showing respect?', 'Any concerning attitudes?'], parentPrompts: ['Discuss disability awareness'] },
      { week: 2, studentPrompts: ['What did you learn from your user partner?', 'How well did you listen?'], teacherPrompts: ['Are partnerships developing well?', 'Support needed?'], parentPrompts: ['Ask about their user partner'] },
      { week: 3, studentPrompts: ['Is your problem definition user-centered?', 'What constraints are most important?'], teacherPrompts: ['Are problems well-defined?', 'User voice present?'], parentPrompts: ['Discuss the problem being solved'] },
      { week: 4, studentPrompts: ['What did your first prototype teach you?', 'How did your user react?'], teacherPrompts: ['Is iteration happening?', 'Technical support needed?'], parentPrompts: ['Ask to see prototypes'] },
      { week: 5, studentPrompts: ['How has the design evolved?', 'What feedback was most valuable?'], teacherPrompts: ['Quality improving?', 'Users satisfied?'], parentPrompts: ['Celebrate iteration'] },
      { week: 6, studentPrompts: ['Does your solution preserve dignity?', 'What are you most proud of?'], teacherPrompts: ['Final quality good?', 'Documentation complete?'], parentPrompts: ['Practice presentations'] },
      { week: 7, studentPrompts: ['How will you ensure your design can be replicated?', 'What impact do you hope for?'], teacherPrompts: ['Documentation clear?', 'Repository ready?'], parentPrompts: ['Help with documentation'] },
      { week: 8, studentPrompts: ['What did this project teach you?', 'How will you stay connected to this work?'], teacherPrompts: ['All deliverables complete?', 'Celebration planned?'], parentPrompts: ['Attend showcase!'] }
    ],
    troubleshooting: {
      challenges: [
        {
          issue: 'User partner availability limited',
          signs: ['Cancelled meetings', 'Slow communication', 'Scheduling conflicts'],
          solutions: ['Flexible meeting times', 'Video calls option', 'Asynchronous feedback', 'Backup partner'],
          prevention: 'Establish multiple communication channels and backup plans early'
        },
        {
          issue: 'Technical complexity beyond student skills',
          signs: ['Stuck on technical problems', 'Frustration', 'Avoiding fabrication'],
          solutions: ['Simplify design', 'Seek mentor help', 'Focus on mechanical solutions', 'Partner with tech students'],
          prevention: 'Assess technical skills early and provide training'
        },
        {
          issue: 'Prototype failures',
          signs: ['Multiple non-functional prototypes', 'User dissatisfaction', 'Team demoralization'],
          solutions: ['Celebrate failure as learning', 'Simplify approach', 'Get expert input', 'Focus on one function'],
          prevention: 'Start simple, test early and often'
        },
        {
          issue: 'Disrespectful attitudes toward disability',
          signs: ['Patronizing language', 'Savior complex', 'Not listening to user'],
          solutions: ['Immediate intervention', 'Re-training on disability awareness', 'User feedback session', 'Reflection assignments'],
          prevention: 'Strong initial training and ongoing monitoring'
        },
        {
          issue: 'Documentation overwhelming',
          signs: ['Incomplete guides', 'Missing files', 'Unclear instructions'],
          solutions: ['Provide templates', 'Assign specific roles', 'Peer review', 'Simplify requirements'],
          prevention: 'Document throughout, not just at end'
        }
      ]
    },
    modifications: {
      advancedLearners: {
        modifications: ['Complex electronic solutions', 'Multiple user partners', 'Advanced fabrication techniques'],
        scaffolds: ['Access to advanced equipment', 'Engineering mentors', 'Research papers'],
        extensions: ['Patent research', 'Cost optimization', 'Manufacturing plan', 'Startup pitch'],
        assessmentAdaptations: ['Higher technical expectations', 'Innovation criteria', 'Scalability analysis']
      },
      onLevelLearners: {
        modifications: ['Standard project scope', 'Mechanical solutions focus', 'Team-based work'],
        scaffolds: ['Regular check-ins', 'Templates provided', 'Peer support'],
        extensions: ['Additional features', 'Aesthetic improvements', 'Multiple versions'],
        assessmentAdaptations: ['Standard rubric', 'Choice in documentation format', 'Revision opportunities']
      },
      strugglingLearners: {
        modifications: ['Simpler mechanical solutions', 'More structure', 'Partner support'],
        scaffolds: ['Step-by-step guides', 'Teacher assistance', 'Simplified tools'],
        extensions: ['Focus on one aspect', 'Support role options', 'Alternative contributions'],
        assessmentAdaptations: ['Modified rubric', 'Alternative assessments', 'Extended timeline']
      },
      englishLearners: {
        modifications: ['Visual communication emphasis', 'Translation support', 'Partner with fluent speaker'],
        scaffolds: ['Visual instructions', 'Key vocabulary lists', 'Demonstration videos'],
        extensions: ['Multilingual documentation', 'Cultural adaptations', 'Family involvement'],
        assessmentAdaptations: ['Visual presentations', 'Native language options', 'Partner presentations']
      },
      specialEducation: {
        modifications: ['Accommodations per IEP', 'Flexible participation', 'Modified scope'],
        scaffolds: ['Additional structure', 'Frequent check-ins', 'Sensory considerations'],
        extensions: ['Strength-based roles', 'Choice in contribution', 'Peer mentorship'],
        assessmentAdaptations: ['IEP-aligned assessment', 'Portfolio options', 'Process over product']
      }
    },
    extensions: {
      earlyFinishers: [
        'Create second device for different user',
        'Develop mobile app companion',
        'Create training videos for device use',
        'Research manufacturing and distribution'
      ],
      summerProjects: [
        'AT design summer camp for younger students',
        'Internship with AT company or clinic',
        'Develop AT design curriculum',
        'Create online course for global audience'
      ],
      competitionOpportunities: [
        'MIT Assistive Technology Hackathon',
        'Google Science Fair with AT focus',
        'FIRST Robotics accessibility challenge',
        'Local maker faire or innovation showcase'
      ],
      independentStudy: [
        'Research specific disability and AT needs',
        'Develop suite of related tools',
        'Create AT assessment protocols',
        'Write grant for AT makerspace'
      ]
    },
    technologyIntegration: {
      required: [
        { name: 'CAD software', purpose: 'Design and modeling', freeVersion: true, training: 'Week 1-2 tutorials', studentAccounts: true },
        { name: '3D printing', purpose: 'Prototype fabrication', freeVersion: false, training: 'Safety and operation workshop', studentAccounts: false },
        { name: 'Documentation platform', purpose: 'Sharing designs', freeVersion: true, training: 'Quick setup guide', studentAccounts: true },
        { name: 'Video/photo tools', purpose: 'Documentation', freeVersion: true, training: 'Basic skills review', studentAccounts: false }
      ],
      optional: [
        { name: 'Arduino IDE', purpose: 'Programming adaptive devices', freeVersion: true, training: 'Optional workshops', studentAccounts: false },
        { name: 'Laser cutting', purpose: 'Precision parts', freeVersion: false, training: 'Safety certification', studentAccounts: false },
        { name: 'VR/AR tools', purpose: 'Design visualization', freeVersion: true, training: 'Self-directed learning', studentAccounts: false }
      ],
      alternatives: [
        { ifNo: 'No 3D printer', then: 'Partner with local makerspace', modifications: ['Schedule field trips', 'Use online services', 'Focus on other materials'] },
        { ifNo: 'No CAD access', then: 'Use free alternatives like Tinkercad', modifications: ['Simpler designs', 'Paper prototypes first', 'Hand drawings acceptable'] },
        { ifNo: 'Limited computers', then: 'Rotate computer time', modifications: ['Paper planning', 'Shared accounts', 'Mobile alternatives'] }
      ],
      digitalCitizenship: [
        'Respecting user privacy in documentation',
        'Appropriate consent for photos and videos',
        'Accessible documentation practices',
        'Open-source licensing understanding'
      ]
    }
  },

  // Teacher Support
  teacherSupport: {
    lessonPlans: [
      {
        week: 1,
        day: 1,
        title: 'Project Launch: The Power of Assistive Technology',
        duration: '50 minutes',
        objectives: ['Understand project goals and impact', 'Begin examining assumptions about disability', 'Feel inspired to make a difference'],
        materials: ['Inspiring AT videos', 'Project overview', 'Reflection journals', 'Guest speaker or panel'],
        procedures: [
          { time: '5 min', activity: 'Accessibility check-in activity', grouping: 'whole class', teacherRole: 'Facilitate', studentRole: 'Participate and observe' },
          { time: '15 min', activity: 'Watch AT innovation videos and user stories', grouping: 'whole class', teacherRole: 'Guide viewing', studentRole: 'Watch and reflect' },
          { time: '20 min', activity: 'Guest speaker or user panel', grouping: 'whole class', teacherRole: 'Moderate', studentRole: 'Listen and ask questions' },
          { time: '5 min', activity: 'Project overview and expectations', grouping: 'whole class', teacherRole: 'Present', studentRole: 'Understand scope' },
          { time: '5 min', activity: 'Journal reflection on assumptions', grouping: 'individual', teacherRole: 'Prompt', studentRole: 'Write honestly' }
        ],
        assessment: 'Quality of questions and engagement level',
        homework: 'Research one assistive technology innovation',
        notes: 'Set tone of respect and partnership from day one. Users are experts, not subjects.'
      }
    ],
    facilitation: {
      philosophy: 'Teacher as connector and technical advisor, not director. Students own their partnerships and solutions while teacher ensures respect and safety.',
      keyStrategies: [
        'Model respectful language and attitudes always',
        'Connect students with resources and experts',
        'Provide technical support without taking over',
        'Facilitate but don\'t dominate user meetings',
        'Celebrate iteration and "productive failure"'
      ],
      questioningTechniques: [
        'What would your user think about this?',
        'How does this preserve dignity?',
        'What did that failure teach you?',
        'Is this your idea or your user\'s need?',
        'How could someone else build this?'
      ],
      groupManagement: [
        'Establish partnership protocols early',
        'Monitor user interactions closely',
        'Rotate technical responsibilities',
        'Address respectful communication immediately',
        'Balance support without enabling'
      ],
      conflictResolution: [
        'User dissatisfaction takes priority',
        'Return to user needs and voice',
        'Mediate technical disagreements with testing',
        'Use "both/and" instead of "either/or"',
        'Involve user in solution decisions'
      ]
    },
    professionaldevelopment: {
      preLaunch: [
        'Disability awareness training essential',
        'Basic makerspace skills needed',
        'Connect with disability organizations',
        'Review assistive technology landscape',
        'Understand legal and ethical considerations'
      ],
      duringProject: [
        'Weekly reflection on student attitudes',
        'Ongoing technical skill development',
        'Regular check-ins with user partners',
        'Document successes and challenges',
        'Seek expert input when needed'
      ],
      postProject: [
        'Comprehensive project debrief',
        'User partner feedback session',
        'Student growth analysis',
        'Documentation of lessons learned',
        'Planning for program continuation'
      ],
      resources: [
        'CAST Universal Design for Learning',
        'Stanford d.school resources',
        'Ability Net accessibility resources',
        'IDEO Design Kit for Educators',
        'Local disability advocacy organizations'
      ],
      community: 'Connect with AT professionals, disability advocates, maker educators, and inclusive design practitioners'
    },
    parentCommunication: {
      introLetter: 'Dear Families, Your student is embarking on a transformative journey to design assistive technology in partnership with community members with disabilities...',
      weeklyUpdates: true,
      volunteerOpportunities: [
        'Share professional expertise if relevant',
        'Help connect with potential user partners',
        'Assist with material sourcing',
        'Attend design reviews',
        'Support showcase event'
      ],
      homeExtensions: [
        'Discuss disability awareness respectfully',
        'Notice accessibility in daily life',
        'Support prototype testing',
        'Practice presentation together',
        'Celebrate partnership and innovation'
      ],
      showcaseInvitation: 'Join us for our Assistive Technology Showcase where students will demonstrate the life-changing solutions they\'ve created with their user partners...'
    }
  },

  // Student Support
  studentSupport: {
    projectGuide: {
      overview: 'You\'re about to become an inventor, advocate, and partner in creating technology that transforms lives. This guide will help you navigate the journey with respect, creativity, and impact.',
      timeline: 'Week 1-2: Discover | Week 3: Define | Week 4-6: Develop | Week 7-8: Deliver',
      expectations: [
        'Treat your user partner as the expert in their own needs',
        'Iterate based on feedback, not assumptions',
        'Document everything for others to replicate',
        'Focus on dignity as much as functionality',
        'Share your designs freely with the world'
      ],
      resources: [
        'Design thinking frameworks',
        'CAD software tutorials',
        'Makerspace equipment guides',
        'Disability etiquette resources',
        'Open-source platforms'
      ],
      tips: [
        'Listen twice as much as you speak',
        'Your first idea won\'t be your best - iterate!',
        'Test early and often with your user',
        'Simple solutions can be powerful',
        'Document as you go, not at the end'
      ]
    },
    researchProtocol: {
      guidelines: [
        'Always get consent before recording or photographing',
        'Protect user privacy in all documentation',
        'Research with not on your user partner',
        'Verify information from multiple sources',
        'Give credit to all contributors'
      ],
      credibleSources: [
        'Peer-reviewed accessibility research',
        'Disability organization resources',
        'AT manufacturer specifications',
        'User experience testimonials',
        'Clinical therapy resources'
      ],
      citationFormat: 'APA format for research, Creative Commons for designs',
      factChecking: [
        'Verify technical specifications',
        'Confirm safety standards',
        'Check material properties',
        'Validate cost estimates',
        'Test all instructions'
      ],
      ethics: [
        'Obtain informed consent',
        'Respect user autonomy',
        'Maintain confidentiality',
        'Share benefits equitably',
        'Design for dignity'
      ]
    },
    collaborationFramework: {
      teamFormation: 'Mixed skills teams of 3-4 with complementary strengths',
      roles: [
        'User Liaison: Primary partnership contact',
        'Lead Engineer: Technical design coordination',
        'Documentation Lead: Records process and creates guides',
        'Project Manager: Timeline and resource management'
      ],
      norms: [
        'User voice guides all decisions',
        'Respect all perspectives',
        'Share work equitably',
        'Celebrate failures as learning',
        'Support each other\'s growth'
      ],
      conflictResolution: [
        'Return to user needs',
        'Test competing ideas',
        'Seek mentor input',
        'Compromise creatively',
        'Document decisions'
      ],
      communication: [
        'Daily stand-ups',
        'User check-ins after each iteration',
        'Team reflection sessions',
        'Progress documentation',
        'Celebration rituals'
      ]
    },
    presentationResources: {
      formats: [
        'Live device demonstration',
        'User partnership story',
        'Technical explanation',
        'Impact testimonial',
        'Future vision'
      ],
      rubric: 'Balance technical detail with human story, emphasize partnership model',
      speakingTips: [
        'Start with user story',
        'Demonstrate device live',
        'Explain iterations honestly',
        'Share what you learned',
        'Inspire others to create'
      ],
      visualAids: [
        'Before/after videos',
        'Iteration timeline',
        'Technical drawings',
        'User testimonial',
        'Impact metrics'
      ],
      practice: 'Minimum three runs: peer review, user feedback, dress rehearsal'
    }
  },

  // Rich Media & Visuals
  media: {
    headerImage: '/images/hero-assistive-tech-header.jpg',
    galleryImages: [
      '/images/user-partnership-meeting.jpg',
      '/images/prototype-testing.jpg',
      '/images/3d-printing-parts.jpg',
      '/images/final-device-delivery.jpg'
    ],
    videos: [
      {
        title: 'The Power of Assistive Technology',
        url: 'https://vimeo.com/at-impact',
        duration: '4:30',
        purpose: 'Inspire students at project launch'
      },
      {
        title: 'User Partnership Best Practices',
        url: 'https://vimeo.com/partnership-guide',
        duration: '6:00',
        purpose: 'Train students on respectful collaboration'
      }
    ],
    infographics: [
      {
        title: 'Design Process Journey',
        url: '/images/at-design-process.png',
        description: 'Visual guide to iterative design with users',
        usage: 'Reference throughout project'
      },
      {
        title: 'Impact of Assistive Technology',
        url: '/images/at-impact-stats.png',
        description: 'Global need and impact statistics',
        usage: 'Context for project importance'
      }
    ],
    examples: [
      {
        title: 'Adaptive Eating Utensil',
        description: 'Student-designed weighted utensil for user with tremors',
        url: '/docs/utensil-example.pdf',
        grade: 'Exemplary',
        highlights: ['User-centered design', 'Multiple iterations', 'Elegant solution', 'Complete documentation']
      },
      {
        title: 'One-Handed Keyboard',
        description: 'Custom keyboard layout for user with hemiplegia',
        url: '/docs/keyboard-example.pdf',
        grade: 'Exemplary',
        highlights: ['Complex problem solving', 'Arduino programming', 'Extensive testing', 'Open-source shared']
      }
    ]
  }
};