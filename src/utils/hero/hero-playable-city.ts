import { HeroProjectData } from './types';

export const heroPlayableCityData: HeroProjectData = {
  // Core Metadata
  id: 'hero-playable-city',
  title: 'Playable City: Designing Joy in Public Space',
  tagline: 'Transform underutilized urban spaces into interactive play experiences that bring communities together through game design and creative placemaking',
  duration: '8 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Game Design', 'Urban Planning', 'Art & Design', 'Computer Science', 'Psychology', 'Architecture'],
  theme: {
    primary: 'purple',
    secondary: 'pink',
    accent: 'yellow',
    gradient: 'from-purple-600 to-pink-600'
  },

  // Course Abstract
  courseAbstract: {
    overview: 'Picture this: A boring bus stop becomes a musical instrument. An empty alley transforms into an interactive light show. A neglected plaza turns into a giant game board. Students become urban game designers, creating playful interventions that turn forgotten city spaces into moments of unexpected joy. Using everything from chalk and cardboard to sensors and projection mapping, they prototype experiences that make strangers smile, neighbors connect, and communities celebrate. This isn\'t about building playgrounds - it\'s about revealing the hidden potential for play everywhere, proving that cities can be both functional and delightful.',
    learningObjectives: [
      'Master game design principles from mechanics to player psychology to create engaging public experiences',
      'Learn urban intervention techniques from tactical urbanism to creative placemaking',
      'Develop technical skills in physical computing, projection mapping, and interactive installations',
      'Understand how play builds community connections and improves mental health in urban settings',
      'Create scalable designs that can transform cities from sterile to playful'
    ],
    methodology: 'Students operate as a creative studio, moving through rapid prototyping cycles from paper sketches to full-scale installations. They test ideas guerrilla-style with chalk and tape before building permitted installations. Every design starts with observing how people actually use spaces, then imagining how play could make those moments better. The classroom becomes a maker space where students build everything from musical swings to interactive sidewalk games, always asking: "What would make someone\'s day a little more magical?"',
    expectedOutcomes: [
      'Students install 5-8 playful interventions that activate underused public spaces',
      'Community members report increased happiness and social connection in transformed spaces',
      'City adopts at least 2 designs for permanent installation based on pilot success',
      'Media coverage brings attention to the power of play in urban mental health',
      'Students develop portfolios that get them into design schools and win innovation awards',
      'Other cities request the playbook to bring joy to their own public spaces'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This innovative urban design project transforms students into architects of joy, using game design and creative technology to make cities more playful, connected, and human.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '8 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Gamepad2', label: 'Focus', value: 'Urban Play' },
      { icon: 'Smile', label: 'Impact', value: 'Community Joy' }
    ],
    impactStatement: 'Students become urban happiness hackers, proving that play isn\'t just for kids - it\'s essential infrastructure for healthy, connected communities.'
  },

  // Rich Context
  context: {
    problem: 'Cities are becoming increasingly sterile and isolating. People pass each other without interaction, public spaces feel hostile rather than welcoming, and the infrastructure of daily life - bus stops, sidewalks, plazas - offers no moments of delight or connection. Mental health challenges and social isolation are at crisis levels, yet cities continue to prioritize efficiency over human experience.',
    significance: 'Research shows that playful cities have happier, healthier, more connected residents. When public spaces invite interaction and spark joy, crime decreases, mental health improves, and communities thrive. Cities worldwide are recognizing that play is not frivolous but essential - from London\'s "Playable City" initiative to Montreal\'s "Quartier des Spectacles." This project positions students at the forefront of urban innovation.',
    realWorld: 'Students work with real sites facing real challenges: an underused plaza that feels unsafe at night, a bus stop where people wait in isolation, a blank wall that contributes nothing to the neighborhood. Their interventions must work within city regulations, withstand weather and vandalism, and appeal to diverse users from toddlers to seniors.',
    studentRole: 'Students become experience designers and urban interventionists. They conduct site analysis, prototype interactions, navigate permits, build installations, and measure impact. They\'re not just imagining better cities - they\'re actively creating them, one playful moment at a time.',
    authenticity: 'Every intervention is tested with real users in real spaces. Students iterate based on how people actually interact with their designs, learning that the best ideas often emerge from watching someone play with your prototype in unexpected ways. Success is measured not in grades but in smiles, laughter, and the magical moment when strangers become co-players.'
  },

  // Big Idea
  bigIdea: {
    statement: 'Play is not a luxury in cities - it\'s essential infrastructure for human connection, mental health, and community resilience.',
    essentialQuestion: 'How might we transform mundane urban spaces into moments of joy that bring communities together?',
    challenge: 'Design and install playful interventions that activate underused public spaces and create unexpected moments of delight.',
    drivingQuestion: 'What if every boring moment in the city - waiting for the bus, walking to work, passing through a plaza - could become an opportunity for play?',
    subQuestions: [
      'How does play change the way people relate to urban spaces and each other?',
      'What makes adults feel safe and invited to play in public?',
      'How can temporary interventions demonstrate the value of permanent playful infrastructure?',
      'What role does technology play in creating responsive, interactive urban experiences?',
      'How do we design for joy while ensuring accessibility, safety, and inclusivity?'
    ]
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2 weeks',
        focus: 'Understanding play, space, and community',
        activities: [
          {
            name: 'Play Archaeology',
            description: 'Students excavate their own play histories and observe how different ages and cultures play in public spaces. They document where play happens naturally and where it\'s suppressed, creating play maps of their city.',
            duration: '120 minutes',
            outputs: [
              'Personal play timelines showing evolution of play experiences',
              'Observational studies of 20+ public play moments',
              'Heat maps showing play deserts and play oases in the city',
              'Photo essays capturing spontaneous urban play'
            ],
            skills: ['Ethnographic observation', 'Cultural analysis', 'Spatial mapping'],
            resources: ['Observation guides', 'Mapping tools', 'Play research papers']
          },
          {
            name: 'Game Design Bootcamp',
            description: 'Intensive workshop on game mechanics, player psychology, and interaction design. Students deconstruct successful games and play experiences to understand what makes them engaging, addictive, and joyful.',
            duration: '180 minutes',
            outputs: [
              'Game mechanics library with 50+ analyzed examples',
              'Player journey maps for different game types',
              'Prototypes of 5 simple games using basic materials',
              'Design principles poster for engaging play'
            ],
            skills: ['Game design', 'Systems thinking', 'Rapid prototyping'],
            resources: ['Game design books', 'Board games', 'Digital game examples']
          },
          {
            name: 'Site Exploration',
            description: 'Deep dive into potential intervention sites, documenting current uses, problems, opportunities, and dreams. Students spend hours observing, measuring, photographing, and imagining possibilities.',
            duration: '240 minutes',
            outputs: [
              'Detailed site analysis for 5+ locations',
              'Time-lapse studies showing usage patterns',
              'Environmental assessments (sun, wind, traffic, noise)',
              'Stakeholder maps identifying users and decision-makers'
            ],
            skills: ['Site analysis', 'Environmental assessment', 'Stakeholder mapping'],
            resources: ['Site analysis tools', 'Measuring equipment', 'Weather monitors']
          },
          {
            name: 'Precedent Research',
            description: 'Study successful playful city projects worldwide, from Copenhagen\'s trampolines to Bristol\'s water slides. Students analyze what works, what fails, and what\'s possible with creativity and determination.',
            duration: '90 minutes',
            outputs: [
              'Case study database of 30+ playful interventions',
              'Success factors analysis identifying key patterns',
              'Failure analysis learning from what didn\'t work',
              'Inspiration board for local applications'
            ],
            skills: ['Research synthesis', 'Critical analysis', 'Pattern recognition'],
            resources: ['Case study library', 'Design blogs', 'Academic papers']
          },
          {
            name: 'Community Play Labs',
            description: 'Pop-up play sessions where students test simple interventions and gather community input. Using chalk, tape, and cardboard, they create temporary play experiences and observe responses.',
            duration: '180 minutes',
            outputs: [
              'Documentation of 10+ pop-up play tests',
              'Community feedback from 50+ participants',
              'Video showing people discovering and using interventions',
              'Iteration notes on what worked and what didn\'t'
            ],
            skills: ['Community engagement', 'Rapid prototyping', 'Observation'],
            resources: ['Pop-up materials', 'Documentation tools', 'Permits for testing']
          },
          {
            name: 'Psychology of Play',
            description: 'Explore the neuroscience and psychology of play, understanding how it affects mood, creativity, social bonding, and stress. Students learn to design for different play personalities and cultural contexts.',
            duration: '90 minutes',
            outputs: [
              'Play personality profiles for different user groups',
              'Research summary on play and mental health',
              'Cultural play preference analysis',
              'Accessibility considerations for inclusive play'
            ],
            skills: ['Psychology research', 'User profiling', 'Inclusive design'],
            resources: ['Psychology texts', 'Research papers', 'Expert interviews']
          },
          {
            name: 'Technical Skills Workshop',
            description: 'Learn the tools needed for interactive installations: basic electronics, projection mapping, sensor systems, and weatherproofing. Students practice with Arduino, Processing, and other creative technologies.',
            duration: '240 minutes',
            outputs: [
              'Working demos of 5+ interactive technologies',
              'Technical skill certifications for each student',
              'Resource library of code and circuit examples',
              'Troubleshooting guide for common problems'
            ],
            skills: ['Physical computing', 'Creative coding', 'Fabrication'],
            resources: ['Electronics kits', 'Computers', 'Projection equipment', 'Tools']
          },
          {
            name: 'Legal and Logistical Planning',
            description: 'Navigate the complex world of public space interventions, learning about permits, liability, maintenance, and working with city departments. Students become fluent in bureaucracy while maintaining creative vision.',
            duration: '120 minutes',
            outputs: [
              'Permit application templates for different intervention types',
              'Risk assessment and mitigation plans',
              'Maintenance protocols and schedules',
              'Stakeholder communication strategies'
            ],
            skills: ['Project management', 'Risk assessment', 'Bureaucracy navigation'],
            resources: ['City regulations', 'Permit examples', 'Legal guidance']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Designing interventions and building prototypes',
        activities: [
          {
            name: 'Ideation Marathon',
            description: 'Intensive brainstorming sessions using various creative techniques to generate hundreds of ideas for playful interventions. Students push beyond obvious solutions to discover surprising possibilities.',
            duration: '180 minutes',
            outputs: [
              '200+ initial intervention ideas',
              'Idea clustering and theme identification',
              'Feasibility matrix ranking ideas by impact and difficulty',
              'Top 20 concepts for further development'
            ],
            skills: ['Creative ideation', 'Divergent thinking', 'Idea evaluation'],
            resources: ['Ideation techniques', 'Brainstorming materials', 'Inspiration triggers']
          },
          {
            name: 'Concept Development',
            description: 'Transform raw ideas into detailed concepts with clear game mechanics, user journeys, and technical requirements. Students create comprehensive design documents for their top interventions.',
            duration: '240 minutes',
            outputs: [
              'Detailed design documents for 8-10 interventions',
              'User journey maps showing play experiences',
              'Technical specifications and material lists',
              'Budget estimates and timeline plans'
            ],
            skills: ['Concept development', 'Technical planning', 'Documentation'],
            resources: ['Design templates', 'CAD software', 'Budget tools']
          },
          {
            name: 'Paper Prototyping',
            description: 'Create low-fidelity prototypes using paper, cardboard, and basic materials to test game mechanics and spatial arrangements. Students learn that the best ideas can be tested with the simplest materials.',
            duration: '120 minutes',
            outputs: [
              'Paper prototypes for all interventions',
              'Testing videos showing user interactions',
              'Iteration logs documenting improvements',
              'Refined concepts based on testing'
            ],
            skills: ['Paper prototyping', 'User testing', 'Iterative design'],
            resources: ['Prototyping materials', 'Testing space', 'Video equipment']
          },
          {
            name: 'Digital Prototyping',
            description: 'Build digital prototypes for tech-enabled interventions using Processing, p5.js, or Unity. Students create interactive simulations that can be tested before physical construction.',
            duration: '180 minutes',
            outputs: [
              'Digital prototypes for interactive interventions',
              'Code repositories with documentation',
              'User testing data from digital trials',
              'Integration plans for physical installations'
            ],
            skills: ['Creative coding', 'Digital prototyping', 'User interface design'],
            resources: ['Computers', 'Software licenses', 'Testing devices']
          },
          {
            name: 'Community Co-Design Sessions',
            description: 'Collaborative workshops where community members help shape interventions, ensuring designs reflect local culture, needs, and dreams. Students learn that the best designs emerge from genuine collaboration.',
            duration: '240 minutes',
            outputs: [
              'Co-design workshop documentation with 30+ participants',
              'Community-generated modifications and ideas',
              'Cultural appropriateness review',
              'Letters of support from community organizations'
            ],
            skills: ['Facilitation', 'Co-design', 'Cultural sensitivity'],
            resources: ['Workshop materials', 'Venue', 'Refreshments', 'Translation']
          },
          {
            name: 'Materials Experimentation',
            description: 'Test different materials for durability, weather resistance, safety, and playability. Students become materials scientists, finding the perfect balance between function, cost, and delight.',
            duration: '180 minutes',
            outputs: [
              'Materials testing database with 20+ options',
              'Durability test results under various conditions',
              'Safety certifications and compliance checks',
              'Final materials selection with justification'
            ],
            skills: ['Materials science', 'Testing protocols', 'Safety assessment'],
            resources: ['Material samples', 'Testing equipment', 'Weather simulation']
          },
          {
            name: 'Scale Model Building',
            description: 'Create detailed scale models of interventions showing exact dimensions, materials, and interactions. Models help communicate ideas to stakeholders and identify potential problems.',
            duration: '240 minutes',
            outputs: [
              'Professional scale models at 1:20 ratio',
              '3D printed components for complex parts',
              'Lighting and interaction demonstrations',
              'Photo documentation for proposals'
            ],
            skills: ['Model making', '3D modeling', 'Precision crafting'],
            resources: ['Model materials', '3D printer', 'Workshop tools', 'Photography']
          },
          {
            name: 'Technical Integration',
            description: 'Combine physical and digital elements, integrating sensors, lights, sounds, and projections into cohesive experiences. Students learn to hide technology while amplifying magic.',
            duration: '180 minutes',
            outputs: [
              'Working technical prototypes with all systems integrated',
              'Troubleshooting guides for each component',
              'Weatherproofing and vandalism resistance measures',
              'Remote monitoring and control systems'
            ],
            skills: ['Systems integration', 'Electronics', 'Programming'],
            resources: ['Electronics components', 'Microcontrollers', 'Sensors', 'Actuators']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '3 weeks',
        focus: 'Building and installing interventions',
        activities: [
          {
            name: 'Fabrication Sprint',
            description: 'Intensive building period where students construct full-scale interventions. Teams work in parallel, sharing tools and expertise while maintaining quality and safety standards.',
            duration: '480 minutes',
            outputs: [
              'Completed physical structures for all interventions',
              'Quality control checklists verified',
              'Safety inspections passed',
              'Installation-ready components labeled and organized'
            ],
            skills: ['Fabrication', 'Construction', 'Quality control'],
            resources: ['Workshop space', 'Power tools', 'Safety equipment', 'Materials']
          },
          {
            name: 'Technology Installation',
            description: 'Install and configure all electronic components including sensors, processors, lights, speakers, and network connections. Students ensure reliable operation in outdoor conditions.',
            duration: '240 minutes',
            outputs: [
              'Fully functional electronic systems',
              'Network connectivity established and tested',
              'Power solutions implemented (solar/grid)',
              'Remote monitoring dashboards operational'
            ],
            skills: ['Electronics installation', 'Network configuration', 'Power systems'],
            resources: ['Installation tools', 'Testing equipment', 'Power supplies', 'Network hardware']
          },
          {
            name: 'Site Preparation',
            description: 'Prepare installation sites including cleaning, marking, securing permissions, and coordinating with city departments. Students manage logistics like professionals.',
            duration: '180 minutes',
            outputs: [
              'Sites cleaned and prepared for installation',
              'Installation permits posted and visible',
              'Safety barriers and signage in place',
              'Community notification completed'
            ],
            skills: ['Site preparation', 'Logistics coordination', 'Safety management'],
            resources: ['Cleaning supplies', 'Safety equipment', 'Signage', 'Barriers']
          },
          {
            name: 'Installation Day',
            description: 'The big day! Teams install interventions simultaneously across the city, transforming multiple spaces in a coordinated effort that generates excitement and media attention.',
            duration: '480 minutes',
            outputs: [
              '5-8 interventions successfully installed',
              'Professional photo/video documentation',
              'Media interviews and coverage',
              'Community celebration at each site'
            ],
            skills: ['Installation management', 'Public relations', 'Problem-solving'],
            resources: ['Transport', 'Installation crews', 'Media kit', 'Celebration supplies']
          },
          {
            name: 'Activation Events',
            description: 'Host launch events at each intervention, teaching people how to play and celebrating the transformation. Students become play ambassadors, spreading joy and encouraging interaction.',
            duration: '240 minutes',
            outputs: [
              'Launch events with 100+ participants per site',
              'Play demonstrations and tutorials',
              'Community feedback collection',
              'Social media content generated'
            ],
            skills: ['Event management', 'Public speaking', 'Community activation'],
            resources: ['Event supplies', 'Sound system', 'Activities', 'Refreshments']
          },
          {
            name: 'Documentation Blitz',
            description: 'Comprehensive documentation of interventions in use, capturing the joy, surprise, and connection they create. Students become storytellers, showing the human impact of their designs.',
            duration: '180 minutes',
            outputs: [
              'Professional photography portfolio',
              'Video stories of user experiences',
              'Time-lapse showing daily usage patterns',
              'Social media campaign content'
            ],
            skills: ['Photography', 'Videography', 'Storytelling', 'Social media'],
            resources: ['Cameras', 'Editing software', 'Storage', 'Distribution platforms']
          },
          {
            name: 'Iteration and Refinement',
            description: 'Based on initial usage, make adjustments to improve experiences. Students learn that launch is not the end but the beginning of making something truly great.',
            duration: '240 minutes',
            outputs: [
              'Usage data analysis and insights',
              'List of refinements implemented',
              'Before/after documentation of improvements',
              'Updated user instructions and signage'
            ],
            skills: ['Data analysis', 'Iterative improvement', 'Responsive design'],
            resources: ['Analytics tools', 'Modification materials', 'User feedback']
          },
          {
            name: 'Maintenance Training',
            description: 'Train community partners and city staff on maintaining interventions, ensuring they continue bringing joy long after the project ends. Students create sustainability through knowledge transfer.',
            duration: '120 minutes',
            outputs: [
              'Maintenance manuals for each intervention',
              'Video tutorials for common repairs',
              'Trained maintenance partners',
              'Spare parts inventory established'
            ],
            skills: ['Technical writing', 'Training delivery', 'Knowledge transfer'],
            resources: ['Training materials', 'Spare parts', 'Documentation tools']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '1 week',
        focus: 'Measuring impact and advocating for playful cities',
        activities: [
          {
            name: 'Impact Assessment',
            description: 'Comprehensive evaluation of how interventions affected spaces, communities, and individuals. Students quantify joy while capturing qualitative stories of transformation.',
            duration: '180 minutes',
            outputs: [
              'Usage statistics for each intervention',
              'Survey results from 200+ users',
              'Behavioral change documentation',
              'Mental health and wellbeing indicators'
            ],
            skills: ['Impact evaluation', 'Data collection', 'Analysis'],
            resources: ['Survey tools', 'Analytics platforms', 'Statistical software']
          },
          {
            name: 'Story Gathering',
            description: 'Collect powerful stories of how playful interventions changed lives - the grandparent who laughed for the first time in months, the strangers who became friends, the child who now loves their neighborhood.',
            duration: '120 minutes',
            outputs: [
              'Story collection with 30+ personal accounts',
              'Video testimonials from diverse users',
              'Before/after neighborhood narratives',
              'Media-ready human interest stories'
            ],
            skills: ['Interview skills', 'Narrative construction', 'Empathy'],
            resources: ['Recording equipment', 'Interview guides', 'Editing tools']
          },
          {
            name: 'Economic Analysis',
            description: 'Calculate return on investment including increased foot traffic, improved property values, reduced vandalism, and health benefits. Students prove play pays dividends.',
            duration: '90 minutes',
            outputs: [
              'Economic impact report with hard numbers',
              'Cost-benefit analysis for each intervention',
              'Funding model for sustained operations',
              'Business case for playful infrastructure'
            ],
            skills: ['Economic analysis', 'Business case development', 'Financial modeling'],
            resources: ['Economic data', 'Analysis tools', 'Expert consultation']
          },
          {
            name: 'Policy Recommendations',
            description: 'Draft policy proposals for making play a permanent part of city planning, including zoning changes, design guidelines, and funding mechanisms.',
            duration: '120 minutes',
            outputs: [
              'Policy brief on playful city strategies',
              'Draft ordinance for play requirements',
              'Design guidelines for playful infrastructure',
              'Funding proposal for play department'
            ],
            skills: ['Policy writing', 'Urban planning', 'Advocacy'],
            resources: ['Policy templates', 'Planning documents', 'Legal review']
          },
          {
            name: 'Playbook Creation',
            description: 'Develop comprehensive guide enabling other cities to implement playful interventions, sharing everything from designs to permits to community engagement strategies.',
            duration: '180 minutes',
            outputs: [
              '100-page playful city implementation guide',
              'Open-source design files for all interventions',
              'Template documents for permits and proposals',
              'Video tutorials for construction and installation'
            ],
            skills: ['Technical writing', 'Knowledge synthesis', 'Design documentation'],
            resources: ['Publishing tools', 'Design software', 'Distribution platform']
          },
          {
            name: 'Media Campaign',
            description: 'Launch coordinated media push to share the transformation story, inspire other cities, and build public support for permanent playful infrastructure.',
            duration: '120 minutes',
            outputs: [
              'Press release to national media outlets',
              'Social media campaign with viral videos',
              'Op-eds in major publications',
              'Podcast and TV appearances'
            ],
            skills: ['Media relations', 'Content creation', 'Public communication'],
            resources: ['Media contacts', 'Content tools', 'Distribution channels']
          },
          {
            name: 'City Council Presentation',
            description: 'Present to city leadership with compelling evidence for investing in playful infrastructure, including live demonstrations and community testimonials.',
            duration: '90 minutes',
            outputs: [
              'Professional presentation with impact data',
              'Live demonstration of portable intervention',
              'Community speakers sharing experiences',
              'Council resolution supporting playful cities'
            ],
            skills: ['Public speaking', 'Political engagement', 'Persuasion'],
            resources: ['Presentation venue', 'Demo equipment', 'Community support']
          },
          {
            name: 'Joy Festival',
            description: 'Culminating celebration showcasing all interventions with guided tours, play demonstrations, and community performances. The city becomes a playground for a day.',
            duration: '240 minutes',
            outputs: [
              'Festival with 1000+ attendees',
              'Guided tours of all interventions',
              'Media coverage amplifying impact',
              'Commitment ceremony for permanent installations'
            ],
            skills: ['Event planning', 'Community celebration', 'Public relations'],
            resources: ['Festival permits', 'Event infrastructure', 'Volunteers', 'Supplies']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        title: 'Play Opportunity Map',
        description: 'Complete analysis of intervention sites with community input',
        evidence: ['Site analysis reports', 'Community feedback', 'Intervention proposals'],
        celebration: 'Pop-up play session showcasing initial concepts'
      },
      {
        week: 4,
        title: 'Prototype Showcase',
        description: 'Working prototypes ready for community testing',
        evidence: ['Functional prototypes', 'Testing protocols', 'Iteration plans'],
        celebration: 'Community play-testing party with all prototypes'
      },
      {
        week: 7,
        title: 'City Transformation',
        description: 'All interventions installed and activated',
        evidence: ['Installed interventions', 'Usage data', 'Media coverage'],
        celebration: 'Citywide play day with tours and demonstrations'
      },
      {
        week: 8,
        title: 'Playful Future',
        description: 'Impact documented and future secured',
        evidence: ['Impact report', 'Policy proposals', 'Replication guide'],
        celebration: 'Joy Festival with commitment to permanent play'
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      'Design interactive experiences using game mechanics and player psychology',
      'Apply principles of urban planning and placemaking to transform public spaces',
      'Build functional prototypes using physical and digital fabrication techniques',
      'Analyze the social and psychological impacts of environmental design',
      'Navigate civic processes from permits to public engagement',
      'Create compelling narratives that drive policy and culture change'
    ],
    alignments: {
      'National Core Arts Standards': [
        {
          code: 'VA:Cr1.2.HSI',
          text: 'Shape artistic investigations of an aspect of present-day life',
          application: 'Students investigate how play shapes urban life and design interventions',
          depth: 'master'
        },
        {
          code: 'VA:Pr4.1.HSIII',
          text: 'Critique, justify, and present choices in the process of analyzing',
          application: 'Students present and defend design choices to stakeholders',
          depth: 'master'
        },
        {
          code: 'MA:Cr3.1.HSIII',
          text: 'Implement production processes to integrate content and stylistic conventions',
          application: 'Students produce integrated physical-digital installations',
          depth: 'develop'
        }
      ],
      'ISTE Standards': [
        {
          code: '1.1 Empowered Learner',
          text: 'Students leverage technology to take an active role in choosing and achieving learning goals',
          application: 'Students choose and master technologies for their interventions',
          depth: 'master'
        },
        {
          code: '1.4 Innovative Designer',
          text: 'Students use design process to identify and solve problems by creating imaginative solutions',
          application: 'Students design creative solutions to urban challenges',
          depth: 'master'
        },
        {
          code: '1.5 Computational Thinker',
          text: 'Students develop strategies for understanding and solving problems using technology',
          application: 'Students program interactive experiences using sensors and code',
          depth: 'develop'
        }
      ],
      'Common Core ELA': [
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and evidence',
          application: 'Students write compelling proposals for playful infrastructure',
          depth: 'master'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly, concisely, and logically',
          application: 'Students present to city council and community groups',
          depth: 'master'
        },
        {
          code: 'RST.11-12.9',
          text: 'Synthesize information from diverse sources',
          application: 'Students synthesize research on play, cities, and design',
          depth: 'develop'
        }
      ],
      'C3 Framework for Social Studies': [
        {
          code: 'D2.Geo.1.9-12',
          text: 'Analyze geospatial technologies and representations',
          application: 'Students use mapping to identify play opportunities',
          depth: 'develop'
        },
        {
          code: 'D2.Civ.14.9-12',
          text: 'Analyze historical, contemporary, and emerging means of changing society',
          application: 'Students use tactical urbanism to transform cities',
          depth: 'master'
        },
        {
          code: 'D4.7.9-12',
          text: 'Assess options for individual and collective action',
          application: 'Students mobilize communities around playful cities',
          depth: 'master'
        }
      ],
      'Next Generation Science Standards': [
        {
          code: 'HS-ETS1-2',
          text: 'Design solutions to complex problems by breaking them down',
          application: 'Students break down urban problems into playful solutions',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate solutions based on prioritized criteria and trade-offs',
          application: 'Students evaluate interventions for feasibility and impact',
          depth: 'develop'
        }
      ]
    },
    skills: [
      {
        category: '21st Century Skills',
        items: [
          'Creative problem-solving and innovation',
          'Systems thinking and design thinking',
          'Digital literacy and computational thinking',
          'Collaboration and communication',
          'Cultural competency and empathy'
        ]
      },
      {
        category: 'Technical Skills',
        items: [
          'Game design and interaction design',
          'Physical computing and electronics',
          'Digital fabrication and construction',
          'Projection mapping and creative coding',
          'Data collection and analysis'
        ]
      },
      {
        category: 'Urban Innovation Skills',
        items: [
          'Tactical urbanism and placemaking',
          'Community engagement and co-design',
          'Permit navigation and stakeholder management',
          'Impact measurement and documentation',
          'Policy advocacy and public speaking'
        ]
      }
    ]
  },

  // Assessment & Evaluation
  assessment: {
    formative: [
      'Weekly design journals documenting process and reflection',
      'Peer feedback sessions on prototypes and ideas',
      'Community testing observations and iterations',
      'Technical skill demonstrations and certifications',
      'Stakeholder presentation rehearsals and refinements'
    ],
    summative: [
      'Portfolio of installed interventions with documentation',
      'Impact report with quantitative and qualitative data',
      'Playbook enabling replication in other cities',
      'Final presentation to city council and community',
      'Reflection essay on transforming cities through play'
    ],
    rubric: [
      {
        category: 'Design Innovation',
        weight: 25,
        criteria: 'Originality, creativity, and effectiveness of interventions',
        exemplary: {
          description: 'Creates breakthrough designs that reimagine urban play',
          indicators: ['Highly original concepts', 'Sophisticated game mechanics', 'Viral spread of ideas']
        },
        proficient: {
          description: 'Develops creative interventions that engage communities',
          indicators: ['Creative adaptations', 'Solid game design', 'Strong user engagement']
        },
        developing: {
          description: 'Creates functional interventions with standard approaches',
          indicators: ['Some creativity', 'Basic mechanics', 'Moderate engagement']
        }
      },
      {
        category: 'Technical Execution',
        weight: 20,
        criteria: 'Quality of construction and technical implementation',
        exemplary: {
          description: 'Professional-quality installations that work flawlessly',
          indicators: ['Robust construction', 'Seamless tech integration', 'Weather-resistant']
        },
        proficient: {
          description: 'Well-built interventions with reliable functionality',
          indicators: ['Solid construction', 'Working technology', 'Generally durable']
        },
        developing: {
          description: 'Functional interventions with some technical issues',
          indicators: ['Basic construction', 'Mostly working', 'Some durability concerns']
        }
      },
      {
        category: 'Community Impact',
        weight: 25,
        criteria: 'Measurable positive effects on community wellbeing',
        exemplary: {
          description: 'Transforms community dynamics and creates lasting joy',
          indicators: ['Documented behavior change', 'Viral community adoption', 'Policy influence']
        },
        proficient: {
          description: 'Creates meaningful connections and positive experiences',
          indicators: ['Regular usage', 'Positive feedback', 'Community support']
        },
        developing: {
          description: 'Generates some community interest and participation',
          indicators: ['Occasional use', 'Mixed feedback', 'Limited spread']
        }
      },
      {
        category: 'Process & Documentation',
        weight: 15,
        criteria: 'Quality of design process and project documentation',
        exemplary: {
          description: 'Exceptional process with publication-quality documentation',
          indicators: ['Rigorous iteration', 'Professional documentation', 'Replicable methods']
        },
        proficient: {
          description: 'Strong process with comprehensive documentation',
          indicators: ['Clear iteration', 'Thorough documentation', 'Shareable insights']
        },
        developing: {
          description: 'Basic process with adequate documentation',
          indicators: ['Some iteration', 'Basic documentation', 'Key points captured']
        }
      },
      {
        category: 'Collaboration & Leadership',
        weight: 15,
        criteria: 'Effectiveness in team and community collaboration',
        exemplary: {
          description: 'Exceptional leadership mobilizing diverse stakeholders',
          indicators: ['Inspiring others', 'Building coalitions', 'Resolving conflicts']
        },
        proficient: {
          description: 'Strong collaboration with team and community',
          indicators: ['Active contribution', 'Good communication', 'Reliable partner']
        },
        developing: {
          description: 'Adequate participation in collaborative efforts',
          indicators: ['Basic contribution', 'Some communication', 'Occasional leadership']
        }
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Design & Prototyping',
        items: [
          'Sketching and design supplies',
          'Cardboard and prototyping materials',
          'Basic hand tools and safety equipment',
          'Computers with design software',
          'Cameras for documentation'
        ]
      },
      {
        category: 'Construction Materials',
        items: [
          'Wood, metal, or recycled materials for structures',
          'Paint and weather-resistant coatings',
          'Fasteners, adhesives, and hardware',
          'Safety equipment for construction',
          'Transportation for materials and installations'
        ]
      },
      {
        category: 'Technology Components',
        items: [
          'Microcontrollers (Arduino, Raspberry Pi)',
          'Sensors (motion, sound, light, pressure)',
          'LEDs and lighting systems',
          'Speakers and audio components',
          'Power supplies and weatherproof enclosures'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Technology',
        items: [
          'Projection mapping equipment',
          '3D printer for custom parts',
          'Professional sound systems',
          'Interactive display screens',
          'Network and IoT infrastructure'
        ]
      },
      {
        category: 'Professional Support',
        items: [
          'Game designer mentorship',
          'Urban planner consultation',
          'Artist collaboration',
          'Technical fabrication assistance',
          'Legal and permit guidance'
        ]
      }
    ],
    community: [
      {
        type: 'City Planning Department',
        role: 'Provide permits, site access, and implementation support'
      },
      {
        type: 'Local Artists and Makers',
        role: 'Collaborate on design and fabrication'
      },
      {
        type: 'Neighborhood Organizations',
        role: 'Connect with residents and coordinate installations'
      },
      {
        type: 'Local Businesses',
        role: 'Sponsor materials and provide installation sites'
      },
      {
        type: 'Media Partners',
        role: 'Amplify impact through coverage and storytelling'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: 'Students, Residents, City Officials, Urban Planners, Mental Health Advocates',
    reach: '5+ intervention sites affecting 10,000+ daily users',
    outcomes: [
      'Students develop careers in urban innovation and experience design',
      'Cities adopt playful infrastructure as standard practice',
      'Communities report increased happiness and social connection',
      'Model spreads to cities worldwide through open-source playbook',
      'Mental health improves through daily moments of joy and play'
    ],
    metrics: [
      {
        metric: 'User Engagement',
        target: '1000+ unique users per intervention per week',
        measurement: 'Usage tracking and observation',
        timeline: 'Within first month',
        evidence: 'Usage data, time-lapse documentation'
      },
      {
        metric: 'Community Wellbeing',
        target: '30% increase in reported neighborhood satisfaction',
        measurement: 'Surveys and interviews',
        timeline: '3 months post-installation',
        evidence: 'Survey results, testimonials'
      },
      {
        metric: 'Media Reach',
        target: '1 million+ impressions through media coverage',
        measurement: 'Media tracking and analytics',
        timeline: 'Project duration',
        evidence: 'Media clips, social media metrics'
      },
      {
        metric: 'Policy Adoption',
        target: '2+ interventions approved for permanent installation',
        measurement: 'City council decisions',
        timeline: '6 months post-project',
        evidence: 'Council resolutions, budget allocations'
      },
      {
        metric: 'Replication',
        target: '5+ cities request playbook or adopt model',
        measurement: 'Playbook downloads and inquiries',
        timeline: '1 year post-project',
        evidence: 'Download statistics, implementation reports'
      }
    ],
    sustainability: {
      continuation: 'Form "Playful City Lab" for ongoing interventions',
      maintenance: 'Partner agreements for intervention upkeep',
      evolution: 'Annual play festival showcasing new designs',
      legacy: 'Playbook and designs freely available forever',
      funding: 'Grants, sponsorships, and city budget allocation'
    },
    scalability: {
      classroom: 'Single intervention at school',
      school: 'Multiple interventions in neighborhood',
      district: 'Citywide coordinated transformation',
      city: 'Municipal playful infrastructure program',
      beyond: 'Global movement for playful cities'
    }
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule ideal for build days and installations',
      touchpoints: 'Weekly studio sessions, weekend community events',
      flexibility: 'Can scale from 6-10 weeks based on intervention complexity'
    },
    budget: {
      basic: '$2000 for materials and basic technology',
      enhanced: '$5000 including advanced tech and professional fabrication',
      grants: 'Available from arts councils, community foundations, and tech companies'
    },
    stakeholders: {
      school: 'Administration support for off-campus work and liability',
      parents: 'Permission for community engagement and construction',
      community: 'City permits and resident participation essential'
    },
    challenges: [
      {
        challenge: 'Permit bureaucracy and timeline delays',
        solution: 'Start permit process immediately, have backup sites, build relationships'
      },
      {
        challenge: 'Weather affecting installations and events',
        solution: 'Flexible scheduling, weather-resistant designs, indoor backup plans'
      },
      {
        challenge: 'Vandalism or misuse of interventions',
        solution: 'Robust construction, community ownership, rapid repair protocols'
      },
      {
        challenge: 'Varying technical skills among students',
        solution: 'Skill-based teams, peer teaching, graduated complexity'
      }
    ],
    support: {
      training: '2-day workshop on game design and tactical urbanism',
      materials: 'Complete intervention designs and technical guides',
      mentorship: 'Connect with Playful City Network practitioners',
      network: 'Join global community of urban play advocates'
    }
  },

  // Overview Section
  overview: {
    description: 'Students transform forgotten urban spaces into moments of unexpected joy, using game design and creative technology to make cities more playful, connected, and human.',
    duration: '8 weeks',
    intensity: 'High - includes evening and weekend installations/events',
    group_size: '20-30 students',
    deliverables: [
      {
        name: 'Intervention Portfolio',
        description: 'Complete documentation of 5-8 installed interventions',
        format: 'Physical installations with digital documentation'
      },
      {
        name: 'Impact Assessment',
        description: 'Data-driven analysis of community transformation',
        format: '40-page report with visualizations'
      },
      {
        name: 'Playful City Playbook',
        description: 'Open-source guide for replicating interventions',
        format: '100-page illustrated manual with videos'
      },
      {
        name: 'Policy Proposal',
        description: 'Recommendations for playful infrastructure investment',
        format: 'Council presentation with brief and ordinance'
      },
      {
        name: 'Joy Festival',
        description: 'Citywide celebration of play and community',
        format: 'Public event with tours and demonstrations'
      }
    ]
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Focus on single intervention instead of multiple',
      'Provide intervention templates to modify',
      'Partner with stronger students for technical elements',
      'Offer alternative documentation formats',
      'Simplify technology to basic mechanics'
    ],
    forAdvanced: [
      'Design interventions with complex interactive systems',
      'Lead community co-design sessions independently',
      'Develop mobile app companions for interventions',
      'Present at urban planning conferences',
      'Create business plan for play consultancy'
    ],
    modifications: [
      'Adjust number and complexity of interventions',
      'Vary level of technology integration',
      'Flexible presentation formats',
      'Multiple pathways to demonstrate mastery',
      'Accommodate various physical abilities'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Citywide Joy Festival',
    venue: 'Multiple intervention sites with central hub',
    audience: 'General public, city officials, media, other schools',
    components: [
      'Guided tours of all interventions with student presenters',
      'Live play demonstrations and workshops',
      'Interactive map showing transformation stories',
      'Community testimonials and performances',
      'Mayor\'s proclamation of "Playful City Day"',
      'Design exhibition with prototypes and process',
      'Awards ceremony recognizing student innovators',
      'Commitment ceremony for permanent installations'
    ],
    artifacts: [
      'Professional intervention portfolio with specifications',
      'Documentary film capturing transformation journey',
      'Published playbook distributed to cities worldwide',
      'Media coverage compilation demonstrating impact',
      'Student design portfolios for college applications',
      'Community impact report with data and stories',
      'Social media campaign reaching millions',
      'Legacy fund for maintaining interventions'
    ],
    media: {
      press: 'National media coverage on innovation in education',
      social: '#PlayfulCity campaign with viral intervention videos',
      documentation: 'Professional photography and film throughout',
      amplification: 'TED talks and conference presentations by students'
    },
    recognition: {
      students: 'Urban Innovation Certificates and recommendation letters',
      community: 'Playful Citizen awards for engaged residents',
      partners: 'Keys to the city for transformative impact',
      celebration: 'Annual play day celebrating interventions'
    }
  },

  // Implementation Tips
  implementationTips: {
    gettingStarted: {
      preparation: [
        'Map potential intervention sites 3 months before project',
        'Build relationships with city planning department early',
        'Identify community partners and secure commitments',
        'Apply for grants and gather donated materials',
        'Set up maker space with necessary tools and technology'
      ],
      earlyWins: [
        'Start with chalk and tape interventions for quick impact',
        'Document every smile and moment of play',
        'Share progress on social media to build momentum',
        'Celebrate small successes to maintain energy',
        'Get media coverage early to build public support'
      ]
    },
    commonPitfalls: {
      technical: [
        'Underestimating weatherproofing needs - test everything',
        'Complex technology that breaks - keep it simple and robust',
        'Poor documentation - assign dedicated photographers',
        'Inadequate safety measures - prioritize user safety',
        'Scope creep - better to do fewer interventions well'
      ],
      community: [
        'Not engaging residents early - co-design from the start',
        'Ignoring cultural context - respect local customs and needs',
        'Creating interventions that exclude - design for all abilities',
        'Neglecting maintenance - plan for long-term care',
        'Moving too fast - community trust takes time'
      ],
      institutional: [
        'Starting permits too late - begin immediately',
        'Weak stakeholder communication - maintain regular updates',
        'Liability concerns - work with legal counsel early',
        'Budget overruns - build in 30% contingency',
        'Sustainability planning - secure future funding early'
      ]
    },
    proTips: {
      design: [
        'Observe spaces at different times before designing',
        'Test everything with cardboard before building',
        'Design for multiple types of play and players',
        'Make interventions Instagram-worthy for viral spread',
        'Build in Easter eggs and surprises for repeat visitors'
      ],
      engagement: [
        'Partner with trusted community organizations',
        'Translate materials into neighborhood languages',
        'Host events when working families can attend',
        'Provide food at all community gatherings',
        'Create roles for residents in activation and maintenance'
      ],
      impact: [
        'Document everything - you\'ll need proof of impact',
        'Collect stories not just statistics',
        'Invite media to every major milestone',
        'Build coalition of supporters before going to council',
        'Frame play as essential infrastructure not luxury'
      ]
    },
    scalingUp: {
      growth: [
        'Start with one perfect intervention then expand',
        'Create templates others can customize',
        'Train other schools to replicate the model',
        'Develop intervention kits for rapid deployment',
        'Build network of playful city practitioners'
      ],
      sustainability: [
        'Embed in curriculum for annual implementation',
        'Create revenue through workshops and consulting',
        'Transfer ownership to community organizations',
        'Integrate into city planning processes',
        'Establish Playful City Fund for ongoing support'
      ]
    }
  }
};