import { HeroProjectData } from './types';
import harborHealthImage from './images/HarborHealthGuardians.jpg';

export const heroHarborHealthData: HeroProjectData = {
  // Core Metadata
  id: 'hero-harbor-health',
  title: 'Harbor Health: Monitoring Our Waterfront',
  tagline: 'Build water quality monitoring systems and advocate for marine ecosystem protection through citizen science and environmental activism',
  duration: '10 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Marine Biology', 'Environmental Science', 'Chemistry', 'Data Science', 'Engineering', 'Public Policy'],
  theme: {
    primary: 'blue',
    secondary: 'teal',
    accent: 'green',
    gradient: 'from-blue-600 to-teal-600'
  },
  image: harborHealthImage,

  // Course Abstract
  courseAbstract: {
    overview: 'The harbor tells a story - if you know how to listen. Students become marine detectives, building underwater sensors that reveal invisible pollution, tracking microplastic concentrations, and documenting the health of creatures from microscopic plankton to harbor seals. They discover that their local waterfront is both more damaged and more resilient than anyone imagined. Armed with irrefutable data showing everything from illegal dumping to climate impacts, students don\'t just study the problem - they storm city hall, mobilize fishing communities, and force industrial polluters to change. This is environmental science with teeth, where teenage scientists become the harbor\'s fiercest protectors.',
    learningObjectives: [
      'Build and deploy professional-grade water quality monitoring systems using IoT sensors and data platforms',
      'Master marine chemistry and biology to understand ecosystem health indicators and tipping points',
      'Develop scientific communication skills to translate complex data into compelling narratives for action',
      'Learn environmental law and policy to advocate effectively for marine protection',
      'Create lasting monitoring infrastructure that communities can maintain and expand'
    ],
    methodology: 'Students operate as a marine research station, combining rigorous science with environmental activism. They spend early mornings collecting water samples, afternoons analyzing data in the lab, and evenings presenting findings to fishermen, business owners, and officials. The harbor becomes their laboratory, the community becomes their partner, and city hall becomes their battleground. Every data point has a purpose: to prove what\'s really happening underwater and demand change.',
    expectedOutcomes: [
      'Students deploy 10+ monitoring stations creating the most comprehensive harbor health dataset ever collected',
      'Water quality improves by measurable metrics as polluters respond to public data and pressure',
      'City adopts student-designed marine protection ordinances with real enforcement mechanisms',
      'Fishing communities use student data to advocate for their livelihoods and sustainable practices',
      'Students publish findings in scientific journals and present at environmental conferences',
      'Model spreads to harbors worldwide as open-source citizen science blueprint'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This groundbreaking marine science project transforms students into environmental guardians, using cutting-edge technology and citizen science to protect our most vital waterways.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '10 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Waves', label: 'Focus', value: 'Marine Science' },
      { icon: 'Shield', label: 'Impact', value: 'Ecosystem Protection' }
    ],
    impactStatement: 'Students become the voice of the harbor, using science to reveal hidden truths and mobilize communities to protect marine ecosystems for future generations.'
  },

  // Rich Context
  context: {
    problem: 'Our harbors are dying in silence. Industrial runoff, microplastics, warming waters, and invasive species are devastating marine ecosystems, but without data, nothing changes. Official monitoring is sporadic and often influenced by political pressure. Meanwhile, fishing communities watch their livelihoods disappear, residents lose access to waterfront recreation, and marine life suffers catastrophic declines. The agencies meant to protect our waters are understaffed and overwhelmed.',
    significance: 'Harbors are the lifeblood of coastal communities - they provide food, jobs, recreation, and cultural identity. When harbors fail, entire regions suffer economically and environmentally. Climate change and pollution are accelerating marine degradation worldwide, making community-based monitoring essential for survival. Students\' work contributes to global understanding of coastal resilience and provides a model for citizen science that can be replicated anywhere.',
    realWorld: 'Students work with real environmental crises: fish kills that close beaches, pollution that threatens commercial fishing, invasive species that destroy native habitats. Their data influences real decisions about industrial permits, development projects, and marine protected areas. They testify at hearings, work with journalists to expose violations, and partner with scientists on published research.',
    studentRole: 'Students become professional marine scientists and environmental advocates. They design monitoring protocols, build and calibrate sensors, analyze complex datasets, and present findings to diverse audiences. They\'re not playing at science - they\'re doing science that matters, with real consequences for their community and ecosystem.',
    authenticity: 'Every measurement students take could be the one that stops a polluter, saves a species, or changes a law. They work with real deadlines (permit hearings, spawning seasons), real constraints (weather, tides, equipment), and real stakeholders (fishermen, businesses, regulators). Success isn\'t measured in grades but in parts per million, species counts, and policy changes.'
  },

  // Big Idea
  bigIdea: {
    statement: 'Healthy harbors require vigilant communities armed with scientific data and the courage to demand accountability from those who would destroy our marine heritage.',
    essentialQuestion: 'How can citizen scientists reveal the hidden health of marine ecosystems and mobilize communities to protect them?',
    challenge: 'Build a comprehensive harbor monitoring network that provides real-time data on water quality and ecosystem health while mobilizing community action for marine protection.',
    drivingQuestion: 'What if every community had real-time data on their water quality and the power to hold polluters accountable?',
    subQuestions: [
      'What indicators best reveal the true health of marine ecosystems?',
      'How do we make invisible pollution visible and urgent to the public?',
      'What role should communities play in monitoring and protecting their waters?',
      'How can student data stand up to industry lawyers and regulatory capture?',
      'What does environmental justice look like in marine conservation?'
    ]
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2 weeks',
        focus: 'Understanding marine ecosystems and monitoring science',
        activities: [
          {
            name: 'Harbor Ecology Immersion',
            description: 'Deep dive into local marine ecosystems through field observation, specimen collection, and ecosystem mapping. Students learn to read the harbor like a book, understanding the complex relationships between species, habitats, and human impacts.',
            duration: '240 minutes',
            outputs: [
              'Species inventory with 50+ documented organisms',
              'Habitat maps showing critical zones and degradation',
              'Food web diagrams revealing ecosystem connections',
              'Photo documentation of indicator species and concerns'
            ],
            skills: ['Marine biology', 'Ecosystem analysis', 'Field observation'],
            resources: ['Field guides', 'Collection equipment', 'Underwater cameras', 'Boats']
          },
          {
            name: 'Water Chemistry Bootcamp',
            description: 'Master the fundamentals of marine chemistry including pH, dissolved oxygen, nutrients, and pollutants. Students learn how chemical parameters affect marine life and how to measure them accurately in field and lab conditions.',
            duration: '180 minutes',
            outputs: [
              'Lab notebooks with 20+ parameter testing protocols',
              'Calibration records for all testing equipment',
              'Chemical interaction diagrams and cycles',
              'Baseline measurements from multiple harbor sites'
            ],
            skills: ['Chemistry techniques', 'Laboratory skills', 'Quality control'],
            resources: ['Testing kits', 'Lab equipment', 'Chemical standards', 'Safety gear']
          },
          {
            name: 'Pollution Source Mapping',
            description: 'Investigate and document all potential pollution sources affecting the harbor, from storm drains to industrial outfalls. Students become detectives, tracing contamination back to its origins.',
            duration: '240 minutes',
            outputs: [
              'Pollution source map with 30+ identified inputs',
              'Photographic evidence of outfalls and runoff',
              'Industrial facility database with permit information',
              'Contamination flow models showing pollution pathways'
            ],
            skills: ['Environmental investigation', 'GIS mapping', 'Research'],
            resources: ['Maps', 'Cameras', 'Public records', 'Sampling equipment']
          },
          {
            name: 'Sensor Technology Workshop',
            description: 'Learn to build, calibrate, and deploy water quality sensors using Arduino, Raspberry Pi, and professional monitoring equipment. Students master both DIY and commercial sensing technologies.',
            duration: '240 minutes',
            outputs: [
              'Working sensor prototypes measuring 5+ parameters',
              'Calibration curves ensuring accuracy',
              'Waterproofing and deployment strategies',
              'Data transmission systems using IoT platforms'
            ],
            skills: ['Electronics', 'Programming', 'IoT systems', 'Calibration'],
            resources: ['Microcontrollers', 'Sensors', 'Waterproof enclosures', 'Tools']
          },
          {
            name: 'Community Stakeholder Summit',
            description: 'Engage with everyone who depends on or affects the harbor - fishermen, businesses, residents, officials. Students learn diverse perspectives and build coalitions for change.',
            duration: '180 minutes',
            outputs: [
              'Stakeholder map with 50+ contacts',
              'Interview transcripts revealing concerns and priorities',
              'Partnership agreements with key organizations',
              'Community monitoring volunteer roster'
            ],
            skills: ['Stakeholder engagement', 'Interview techniques', 'Coalition building'],
            resources: ['Meeting spaces', 'Recording equipment', 'Refreshments', 'Materials']
          },
          {
            name: 'Historical Baseline Research',
            description: 'Dig into historical records to understand how the harbor has changed over decades. Students uncover old studies, newspaper accounts, and elder memories to establish long-term trends.',
            duration: '120 minutes',
            outputs: [
              'Historical timeline of harbor health and events',
              'Archive of past studies and reports',
              'Elder interviews about harbor changes',
              'Then-and-now photo comparisons'
            ],
            skills: ['Historical research', 'Data synthesis', 'Interviewing'],
            resources: ['Archives', 'Library access', 'Historical societies', 'Elder contacts']
          },
          {
            name: 'Legal Framework Analysis',
            description: 'Study environmental laws, regulations, and enforcement mechanisms. Students learn what protections exist, where gaps occur, and how to use legal tools for conservation.',
            duration: '90 minutes',
            outputs: [
              'Legal framework summary for water protection',
              'Violation reporting procedures and contacts',
              'Case studies of successful enforcement actions',
              'Templates for formal complaints and requests'
            ],
            skills: ['Legal research', 'Policy analysis', 'Advocacy planning'],
            resources: ['Legal databases', 'Environmental law guides', 'Lawyer consultations']
          },
          {
            name: 'Scientific Communication Training',
            description: 'Learn to translate complex scientific data into compelling stories for different audiences. Students practice presenting to scientists, officials, media, and the public.',
            duration: '120 minutes',
            outputs: [
              'Presentation templates for different audiences',
              'Data visualization toolkit and examples',
              'Media training videos and practice sessions',
              'Elevator pitches for key findings'
            ],
            skills: ['Science communication', 'Data visualization', 'Public speaking'],
            resources: ['Presentation tools', 'Design software', 'Media training', 'Practice venues']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Designing monitoring network and protocols',
        activities: [
          {
            name: 'Monitoring Station Design',
            description: 'Design comprehensive monitoring stations that can measure multiple parameters reliably in harsh marine conditions. Students engineer solutions for power, communication, and maintenance.',
            duration: '240 minutes',
            outputs: [
              'Station designs with component specifications',
              'Power solutions using solar and batteries',
              'Communication systems for data transmission',
              'Maintenance schedules and procedures'
            ],
            skills: ['Engineering design', 'Systems integration', 'Problem-solving'],
            resources: ['Design software', 'Component catalogs', 'Expert consultation', 'Prototyping materials']
          },
          {
            name: 'Site Selection Strategy',
            description: 'Identify optimal monitoring locations based on ecology, pollution sources, and community needs. Students balance scientific requirements with practical constraints.',
            duration: '180 minutes',
            outputs: [
              'Site selection matrix with scored locations',
              'Permission agreements from site owners',
              'Access and safety plans for each site',
              'Installation timeline coordinated with tides'
            ],
            skills: ['Strategic planning', 'Negotiation', 'Risk assessment'],
            resources: ['Harbor maps', 'Tide charts', 'Property records', 'Safety equipment']
          },
          {
            name: 'Protocol Development',
            description: 'Create rigorous sampling and analysis protocols that ensure data quality and legal defensibility. Students develop standard operating procedures meeting scientific standards.',
            duration: '180 minutes',
            outputs: [
              'Sampling protocols for water, sediment, and organisms',
              'Chain of custody procedures for legal compliance',
              'Quality assurance/quality control plans',
              'Data management and backup systems'
            ],
            skills: ['Protocol design', 'Quality assurance', 'Documentation'],
            resources: ['EPA methods', 'Scientific standards', 'Legal requirements', 'Database systems']
          },
          {
            name: 'Sensor Calibration Lab',
            description: 'Extensive calibration of all sensors using known standards to ensure accuracy. Students learn that good data starts with properly calibrated instruments.',
            duration: '240 minutes',
            outputs: [
              'Calibration curves for all sensors',
              'Cross-validation with laboratory instruments',
              'Drift correction procedures',
              'Calibration logs and schedules'
            ],
            skills: ['Calibration techniques', 'Statistical analysis', 'Precision measurement'],
            resources: ['Calibration standards', 'Laboratory equipment', 'Statistical software']
          },
          {
            name: 'Data Platform Development',
            description: 'Build online platform for data visualization, analysis, and public access. Students create user-friendly interfaces that make complex data accessible to everyone.',
            duration: '240 minutes',
            outputs: [
              'Web dashboard showing real-time data',
              'Mobile app for field data collection',
              'API for data access by researchers',
              'Alert system for concerning measurements'
            ],
            skills: ['Web development', 'Database design', 'User interface', 'API creation'],
            resources: ['Cloud hosting', 'Development tools', 'Design software', 'Testing devices']
          },
          {
            name: 'Community Training Design',
            description: 'Develop training programs for community volunteers who will help maintain and expand the monitoring network. Students become teachers, spreading their knowledge.',
            duration: '120 minutes',
            outputs: [
              'Training curriculum for citizen scientists',
              'Video tutorials for common procedures',
              'Quick reference guides and checklists',
              'Certification program for volunteers'
            ],
            skills: ['Curriculum design', 'Teaching', 'Material development'],
            resources: ['Training materials', 'Video equipment', 'Printing', 'Venues']
          },
          {
            name: 'Funding Strategy Session',
            description: 'Develop sustainable funding model for long-term monitoring. Students learn that good science requires financial planning and diverse support.',
            duration: '90 minutes',
            outputs: [
              'Grant proposals to environmental foundations',
              'Sponsorship packages for local businesses',
              'Crowdfunding campaign materials',
              'Budget for 3-year operations'
            ],
            skills: ['Grant writing', 'Fundraising', 'Budget planning'],
            resources: ['Grant databases', 'Fundraising tools', 'Financial planning software']
          },
          {
            name: 'Baseline Data Blitz',
            description: 'Intensive baseline data collection before deploying permanent stations. Students establish the "before" picture against which all change will be measured.',
            duration: '360 minutes',
            outputs: [
              'Baseline dataset from 20+ locations',
              'Seasonal variation documentation',
              'Species abundance baselines',
              'Photographic baseline archive'
            ],
            skills: ['Field sampling', 'Data collection', 'Documentation'],
            resources: ['Boats', 'Sampling equipment', 'Storage containers', 'Data sheets']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '4 weeks',
        focus: 'Deploying network and collecting data',
        activities: [
          {
            name: 'Station Construction Marathon',
            description: 'Build all monitoring stations in parallel teams, ensuring quality and consistency. Students become manufacturers, producing scientific instruments at scale.',
            duration: '480 minutes',
            outputs: [
              '10+ completed monitoring stations',
              'Quality control testing results',
              'Installation tools and supplies prepared',
              'Deployment schedule coordinated with tides'
            ],
            skills: ['Construction', 'Quality control', 'Team coordination'],
            resources: ['Workshop space', 'Tools', 'Components', 'Testing equipment']
          },
          {
            name: 'Deployment Operations',
            description: 'Install monitoring stations at all sites in coordinated deployment. Students manage logistics like military operation, adapting to weather and tides.',
            duration: '480 minutes',
            outputs: [
              'All stations successfully deployed',
              'GPS coordinates and site documentation',
              'Initial readings confirming operation',
              'Photo/video documentation of installations'
            ],
            skills: ['Marine operations', 'Project management', 'Problem-solving'],
            resources: ['Boats', 'Diving equipment', 'Installation tools', 'Safety gear']
          },
          {
            name: 'Data Stream Verification',
            description: 'Confirm all stations are transmitting accurate data to central platform. Students troubleshoot connectivity issues and optimize data flow.',
            duration: '180 minutes',
            outputs: [
              'All stations online and transmitting',
              'Data validation confirming accuracy',
              'Redundancy systems operational',
              'Public dashboard fully functional'
            ],
            skills: ['Network troubleshooting', 'Data validation', 'System optimization'],
            resources: ['Diagnostic tools', 'Backup equipment', 'Technical support']
          },
          {
            name: 'Biological Sampling Campaign',
            description: 'Comprehensive biological sampling to complement sensor data. Students collect plankton, benthic organisms, and fish to assess ecosystem health.',
            duration: '360 minutes',
            outputs: [
              'Plankton samples from all sites',
              'Benthic organism surveys completed',
              'Fish population assessments',
              'Tissue samples for contamination analysis'
            ],
            skills: ['Biological sampling', 'Species identification', 'Laboratory techniques'],
            resources: ['Sampling nets', 'Preservation materials', 'Microscopes', 'ID guides']
          },
          {
            name: 'Microplastic Investigation',
            description: 'Special focus on microplastic pollution using specialized sampling and analysis. Students reveal the invisible plastic plague affecting marine life.',
            duration: '240 minutes',
            outputs: [
              'Microplastic concentration data from all sites',
              'Particle size and type analysis',
              'Source tracking to identify origins',
              'Bioaccumulation assessment in organisms'
            ],
            skills: ['Microplastic analysis', 'Microscopy', 'Contamination tracking'],
            resources: ['Manta trawls', 'Filtration equipment', 'FTIR spectroscopy access']
          },
          {
            name: 'Pollution Event Response',
            description: 'Rapid response to pollution events detected by monitoring network. Students become emergency responders, documenting violations and notifying authorities.',
            duration: '180 minutes',
            outputs: [
              'Pollution event documentation protocols',
              'Evidence collection for legal action',
              'Authority notification procedures',
              'Media alert templates'
            ],
            skills: ['Emergency response', 'Evidence collection', 'Communication'],
            resources: ['Response kits', 'Documentation tools', 'Communication systems']
          },
          {
            name: 'Community Data Days',
            description: 'Public events where residents help collect data and learn about harbor health. Students teach while gathering additional measurements.',
            duration: '240 minutes',
            outputs: [
              'Community data from 100+ participants',
              'Trained volunteer monitoring teams',
              'Public awareness increased measurably',
              'Media coverage of citizen science'
            ],
            skills: ['Event management', 'Teaching', 'Public engagement'],
            resources: ['Event supplies', 'Testing kits', 'Educational materials', 'Refreshments']
          },
          {
            name: 'Data Analysis Intensive',
            description: 'Deep analysis of accumulating data to identify patterns, trends, and concerns. Students become data scientists, finding stories in the numbers.',
            duration: '240 minutes',
            outputs: [
              'Statistical analysis of all parameters',
              'Trend identification and projections',
              'Correlation analysis between factors',
              'Violation documentation with evidence'
            ],
            skills: ['Statistical analysis', 'Data science', 'Pattern recognition'],
            resources: ['Analysis software', 'Computing power', 'Statistical support']
          },
          {
            name: 'Scientific Paper Drafting',
            description: 'Begin drafting scientific paper on findings for peer-reviewed publication. Students learn to write like scientists, with precision and rigor.',
            duration: '180 minutes',
            outputs: [
              'Paper outline and introduction',
              'Methods section fully documented',
              'Initial results and figures',
              'Literature review completed'
            ],
            skills: ['Scientific writing', 'Literature review', 'Figure preparation'],
            resources: ['Journal guidelines', 'Reference manager', 'Writing support']
          },
          {
            name: 'Legal Documentation Preparation',
            description: 'Prepare evidence packages for regulatory enforcement and legal action. Students ensure their data can stand up in court if needed.',
            duration: '120 minutes',
            outputs: [
              'Evidence packages for violations',
              'Chain of custody documentation',
              'Expert witness statements',
              'Legal brief templates'
            ],
            skills: ['Legal documentation', 'Evidence preparation', 'Technical writing'],
            resources: ['Legal templates', 'Expert witnesses', 'Legal consultation']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '2 weeks',
        focus: 'Presenting findings and driving change',
        activities: [
          {
            name: 'Data Synthesis Summit',
            description: 'Comprehensive synthesis of all data into clear findings and recommendations. Students distill months of data into actionable insights.',
            duration: '240 minutes',
            outputs: [
              'Executive summary of key findings',
              'Technical report with full analysis',
              'Policy recommendations with justification',
              'Action plan for improvement'
            ],
            skills: ['Synthesis', 'Technical writing', 'Policy development'],
            resources: ['Analysis tools', 'Report templates', 'Review panels']
          },
          {
            name: 'Community Report Release',
            description: 'Public presentation of findings to community with clear explanations and calls to action. Students translate science into community mobilization.',
            duration: '180 minutes',
            outputs: [
              'Public presentation with 200+ attendees',
              'Community report in accessible language',
              'Action toolkits for residents',
              'Petition signatures for protection measures'
            ],
            skills: ['Public speaking', 'Community organizing', 'Translation'],
            resources: ['Venue', 'Presentation equipment', 'Printed materials', 'Media coverage']
          },
          {
            name: 'Fishermen\'s Alliance Meeting',
            description: 'Special presentation to fishing community showing how data supports sustainable fishing and ecosystem protection. Students build unlikely alliances.',
            duration: '120 minutes',
            outputs: [
              'Fishermen-specific data analysis',
              'Sustainable fishing recommendations',
              'Alliance agreement for protection',
              'Joint advocacy strategy'
            ],
            skills: ['Stakeholder engagement', 'Negotiation', 'Translation'],
            resources: ['Meeting space', 'Data visualizations', 'Translation services']
          },
          {
            name: 'Industrial Accountability Session',
            description: 'Present violation evidence directly to industrial polluters, demanding immediate action. Students confront power with data.',
            duration: '90 minutes',
            outputs: [
              'Violation documentation delivered',
              'Remediation demands presented',
              'Timeline for compliance established',
              'Media coverage of confrontation'
            ],
            skills: ['Confrontation', 'Negotiation', 'Media relations'],
            resources: ['Legal support', 'Media presence', 'Security considerations']
          },
          {
            name: 'Regulatory Agency Hearing',
            description: 'Formal testimony at environmental agency hearing, presenting evidence and demanding enforcement. Students learn to navigate bureaucracy.',
            duration: '180 minutes',
            outputs: [
              'Formal testimony delivered',
              'Evidence entered into record',
              'Enforcement commitments secured',
              'Follow-up timeline established'
            ],
            skills: ['Formal testimony', 'Legal procedure', 'Persistence'],
            resources: ['Legal preparation', 'Supporting speakers', 'Documentation']
          },
          {
            name: 'Media Blitz',
            description: 'Coordinated media campaign to amplify findings and pressure for change. Students learn that public pressure drives policy.',
            duration: '180 minutes',
            outputs: [
              'Press conference with major outlets',
              'Op-eds published in newspapers',
              'TV and radio interviews',
              'Social media campaign viral'
            ],
            skills: ['Media relations', 'Message control', 'Public communication'],
            resources: ['Press kits', 'Media training', 'Spokespersons', 'Visuals']
          },
          {
            name: 'City Council Presentation',
            description: 'Present to city council with specific ordinance proposals and implementation plans. Students move from protest to policy.',
            duration: '120 minutes',
            outputs: [
              'Council presentation delivered',
              'Ordinance language proposed',
              'Implementation timeline presented',
              'Council vote scheduled'
            ],
            skills: ['Political engagement', 'Policy presentation', 'Lobbying'],
            resources: ['Council chambers', 'Support speakers', 'Printed proposals']
          },
          {
            name: 'Scientific Conference Presentation',
            description: 'Present findings at regional or national scientific conference. Students join the scientific community as contributors.',
            duration: '240 minutes',
            outputs: [
              'Conference presentation delivered',
              'Poster session conducted',
              'Networking with scientists',
              'Collaboration invitations received'
            ],
            skills: ['Scientific presentation', 'Poster design', 'Networking'],
            resources: ['Conference registration', 'Travel', 'Presentation materials']
          },
          {
            name: 'Monitoring Network Handoff',
            description: 'Transfer monitoring network to community organizations for long-term operation. Students ensure their work continues.',
            duration: '180 minutes',
            outputs: [
              'Operations manual completed',
              'Community operators trained',
              'Maintenance fund established',
              'Succession plan implemented'
            ],
            skills: ['Knowledge transfer', 'Training', 'Sustainability planning'],
            resources: ['Training materials', 'Operational funding', 'Legal agreements']
          },
          {
            name: 'Celebration and Reflection',
            description: 'Celebrate achievements while reflecting on lessons learned. Students process their transformation into environmental guardians.',
            duration: '120 minutes',
            outputs: [
              'Celebration event at waterfront',
              'Reflection portfolios completed',
              'Awards and recognition ceremony',
              'Commitment to continued advocacy'
            ],
            skills: ['Reflection', 'Celebration', 'Future planning'],
            resources: ['Event space', 'Awards', 'Documentation', 'Refreshments']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        title: 'Harbor Baseline Established',
        description: 'Complete initial assessment and stakeholder engagement',
        evidence: ['Baseline data report', 'Stakeholder agreements', 'Monitoring plan'],
        celebration: 'Community launch event introducing project'
      },
      {
        week: 4,
        title: 'Monitoring Network Designed',
        description: 'All stations built and protocols established',
        evidence: ['Station specifications', 'Calibration records', 'Data platform live'],
        celebration: 'Station showcase with hands-on demonstrations'
      },
      {
        week: 8,
        title: 'Network Operational',
        description: 'All stations deployed and generating data',
        evidence: ['Deployment documentation', 'Data streams active', 'First findings'],
        celebration: 'Data revelation event sharing initial discoveries'
      },
      {
        week: 10,
        title: 'Harbor Protection Activated',
        description: 'Findings presented and protection measures initiated',
        evidence: ['Final report', 'Policy proposals', 'Media coverage', 'Commitments'],
        celebration: 'Harbor festival celebrating cleaner waters ahead'
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      'Design and implement scientifically rigorous environmental monitoring systems',
      'Analyze complex datasets to identify patterns and environmental impacts',
      'Master marine chemistry and biology concepts and field techniques',
      'Develop skills in electronics, programming, and data management',
      'Practice scientific communication to diverse audiences',
      'Engage in environmental advocacy using data-driven arguments'
    ],
    alignments: {
      'Next Generation Science Standards': [
        {
          code: 'HS-ESS3-6',
          text: 'Use computational representation to illustrate relationships among Earth systems',
          application: 'Students model harbor ecosystem interactions and human impacts',
          depth: 'master'
        },
        {
          code: 'HS-LS2-2',
          text: 'Use mathematical representations to support explanations of biotic and abiotic factors',
          application: 'Students analyze relationships between water quality and marine life',
          depth: 'master'
        },
        {
          code: 'HS-ETS1-3',
          text: 'Evaluate solutions based on prioritized criteria and trade-offs',
          application: 'Students evaluate monitoring strategies and remediation options',
          depth: 'master'
        },
        {
          code: 'HS-ESS3-4',
          text: 'Evaluate solutions to reduce impacts of human activities on environment',
          application: 'Students propose and advocate for pollution reduction measures',
          depth: 'master'
        }
      ],
      'Common Core Mathematics': [
        {
          code: 'HSS.ID.B.6',
          text: 'Represent data on two quantitative variables and analyze patterns',
          application: 'Students analyze correlations between environmental parameters',
          depth: 'master'
        },
        {
          code: 'HSA.CED.A.3',
          text: 'Represent constraints by systems of equations and interpret solutions',
          application: 'Students model pollution dispersion and ecosystem constraints',
          depth: 'develop'
        }
      ],
      'Common Core ELA': [
        {
          code: 'RST.11-12.7',
          text: 'Integrate multiple sources of information presented in diverse formats',
          application: 'Students synthesize data, research, and stakeholder input',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims using valid reasoning and evidence',
          application: 'Students write scientific reports and policy recommendations',
          depth: 'master'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information clearly, concisely, and logically for diverse audiences',
          application: 'Students present to scientists, officials, and community',
          depth: 'master'
        }
      ],
      'ISTE Standards': [
        {
          code: '1.3 Knowledge Constructor',
          text: 'Students build knowledge through exploration and research',
          application: 'Students investigate harbor health through data collection',
          depth: 'master'
        },
        {
          code: '1.4 Innovative Designer',
          text: 'Students design solutions to authentic problems',
          application: 'Students design monitoring systems and remediation strategies',
          depth: 'master'
        },
        {
          code: '1.6 Creative Communicator',
          text: 'Students communicate complex ideas clearly using various media',
          application: 'Students create dashboards, reports, and presentations',
          depth: 'develop'
        }
      ],
      'C3 Framework for Social Studies': [
        {
          code: 'D2.Geo.3.9-12',
          text: 'Analyze spatial patterns of environmental characteristics',
          application: 'Students map pollution sources and ecosystem impacts',
          depth: 'master'
        },
        {
          code: 'D2.Civ.14.9-12',
          text: 'Analyze means of changing society through policy and action',
          application: 'Students advocate for marine protection policies',
          depth: 'master'
        },
        {
          code: 'D4.8.9-12',
          text: 'Apply range of deliberative and democratic procedures',
          application: 'Students engage in public hearings and community organizing',
          depth: 'develop'
        }
      ]
    },
    skills: [
      {
        category: '21st Century Skills',
        items: [
          'Critical thinking and problem-solving',
          'Data literacy and analysis',
          'Scientific communication',
          'Collaboration and teamwork',
          'Environmental citizenship'
        ]
      },
      {
        category: 'Scientific Skills',
        items: [
          'Field sampling and data collection',
          'Laboratory analysis techniques',
          'Statistical analysis and modeling',
          'Scientific writing and presentation',
          'Quality assurance/quality control'
        ]
      },
      {
        category: 'Technical Skills',
        items: [
          'Sensor design and calibration',
          'Electronics and programming',
          'Database management',
          'GIS and mapping',
          'Data visualization'
        ]
      },
      {
        category: 'Advocacy Skills',
        items: [
          'Public speaking and testimony',
          'Media relations',
          'Community organizing',
          'Policy analysis',
          'Coalition building'
        ]
      }
    ]
  },

  // Assessment & Evaluation
  assessment: {
    formative: [
      'Weekly data quality checks and calibration logs',
      'Lab notebook reviews for protocol compliance',
      'Peer review of analysis and conclusions',
      'Stakeholder feedback on engagement effectiveness',
      'Practice presentations with critique sessions'
    ],
    summative: [
      'Monitoring network design portfolio with specifications',
      'Scientific paper draft ready for submission',
      'Policy recommendations with supporting evidence',
      'Public presentation demonstrating findings',
      'Reflection essay on science, advocacy, and impact'
    ],
    rubric: [
      {
        category: 'Scientific Rigor',
        weight: 30,
        criteria: 'Quality and reliability of data collection and analysis',
        exemplary: {
          description: 'Produces publication-quality data meeting professional standards',
          indicators: ['Perfect calibration records', 'Statistical significance achieved', 'Peer review ready']
        },
        proficient: {
          description: 'Generates reliable data suitable for decision-making',
          indicators: ['Good calibration', 'Clear patterns identified', 'Defensible conclusions']
        },
        developing: {
          description: 'Collects usable data with some quality concerns',
          indicators: ['Basic calibration', 'Some patterns visible', 'General conclusions']
        }
      },
      {
        category: 'Technical Implementation',
        weight: 25,
        criteria: 'Design and deployment of monitoring systems',
        exemplary: {
          description: 'Creates professional-grade monitoring infrastructure',
          indicators: ['Flawless operation', 'Innovative solutions', 'Scalable design']
        },
        proficient: {
          description: 'Builds functional monitoring systems meeting objectives',
          indicators: ['Reliable operation', 'Good design choices', 'Maintainable systems']
        },
        developing: {
          description: 'Develops basic monitoring capability with limitations',
          indicators: ['Intermittent operation', 'Standard approaches', 'Some maintenance issues']
        }
      },
      {
        category: 'Environmental Impact',
        weight: 25,
        criteria: 'Contribution to harbor protection and restoration',
        exemplary: {
          description: 'Drives measurable improvements in water quality and policy',
          indicators: ['Policy changes enacted', 'Violations stopped', 'Ecosystem recovery documented']
        },
        proficient: {
          description: 'Influences awareness and initiates protective actions',
          indicators: ['Increased awareness', 'Some enforcement', 'Protection measures started']
        },
        developing: {
          description: 'Raises awareness of harbor health issues',
          indicators: ['Community informed', 'Issues documented', 'Dialogue started']
        }
      },
      {
        category: 'Communication & Advocacy',
        weight: 20,
        criteria: 'Effectiveness in conveying findings and driving action',
        exemplary: {
          description: 'Compelling communication that mobilizes diverse stakeholders',
          indicators: ['Media coverage achieved', 'Coalition built', 'Decision-makers convinced']
        },
        proficient: {
          description: 'Clear communication that engages target audiences',
          indicators: ['Good presentations', 'Some media interest', 'Stakeholder engagement']
        },
        developing: {
          description: 'Basic communication of findings to limited audiences',
          indicators: ['Adequate presentations', 'Local awareness', 'Some engagement']
        }
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Monitoring Equipment',
        items: [
          'Water quality sensors (pH, DO, temperature, turbidity)',
          'Microcontrollers and IoT components',
          'Waterproof enclosures and mounting hardware',
          'Calibration standards and solutions',
          'Field sampling equipment'
        ]
      },
      {
        category: 'Laboratory Resources',
        items: [
          'Basic water testing kits',
          'Microscopes for plankton analysis',
          'Sample containers and preservation',
          'Lab notebooks and data sheets',
          'Safety equipment'
        ]
      },
      {
        category: 'Field Operations',
        items: [
          'Boats or kayaks for water access',
          'GPS units for location tracking',
          'Cameras for documentation',
          'Weather monitoring equipment',
          'First aid and safety gear'
        ]
      },
      {
        category: 'Data Management',
        items: [
          'Computers with analysis software',
          'Cloud storage for data',
          'Web hosting for dashboard',
          'Statistical analysis tools',
          'GIS software'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Equipment',
        items: [
          'Professional multi-parameter sondes',
          'Spectrophotometer for detailed analysis',
          'Underwater ROV for deep sampling',
          'Drone for aerial surveys',
          'Current meters and tide gauges'
        ]
      },
      {
        category: 'Professional Support',
        items: [
          'Marine biologist mentorship',
          'Environmental lawyer consultation',
          'Laboratory access at university',
          'Research vessel time',
          'Conference attendance funding'
        ]
      }
    ],
    community: [
      {
        type: 'Environmental Agencies',
        role: 'Provide guidance, data access, and regulatory pathways'
      },
      {
        type: 'Fishing Communities',
        role: 'Share local knowledge and advocate together'
      },
      {
        type: 'Universities and Research Institutions',
        role: 'Provide expertise, equipment, and validation'
      },
      {
        type: 'Environmental Organizations',
        role: 'Support advocacy and provide funding'
      },
      {
        type: 'Media Outlets',
        role: 'Amplify findings and pressure for change'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: 'Students, Scientists, Regulators, Industries, Fishing Communities, General Public',
    reach: 'Entire harbor ecosystem and dependent communities',
    outcomes: [
      'Students become environmental scientists and advocates',
      'Water quality improves through enhanced monitoring and enforcement',
      'Community gains permanent monitoring infrastructure',
      'Policy changes strengthen marine protection',
      'Model spreads to other harbors regionally and globally',
      'Scientific knowledge advanced through student research'
    ],
    metrics: [
      {
        metric: 'Water Quality Improvement',
        target: '20% reduction in key pollutants',
        measurement: 'Continuous monitoring data',
        timeline: '1 year post-project',
        evidence: 'Sensor data, lab analysis'
      },
      {
        metric: 'Network Coverage',
        target: '10+ monitoring stations operational',
        measurement: 'Active station count',
        timeline: 'End of project',
        evidence: 'Deployment records, data streams'
      },
      {
        metric: 'Community Engagement',
        target: '500+ residents actively involved',
        measurement: 'Participation tracking',
        timeline: 'Throughout project',
        evidence: 'Sign-in sheets, volunteer hours'
      },
      {
        metric: 'Policy Impact',
        target: '3+ protective measures adopted',
        measurement: 'Policy tracking',
        timeline: '6 months post-project',
        evidence: 'Ordinances, regulations, enforcement'
      },
      {
        metric: 'Scientific Contribution',
        target: 'Paper accepted for publication',
        measurement: 'Publication status',
        timeline: '1 year post-project',
        evidence: 'Journal acceptance, citations'
      },
      {
        metric: 'Media Reach',
        target: '1 million+ impressions',
        measurement: 'Media tracking',
        timeline: 'Project duration',
        evidence: 'Clips, metrics, reach data'
      }
    ],
    sustainability: {
      continuation: 'Community organizations adopt monitoring network',
      maintenance: 'Established fund for equipment and operations',
      evolution: 'Annual expansion adding new parameters and sites',
      legacy: 'Permanent infrastructure protecting harbor health',
      funding: 'Diverse funding from grants, government, and business'
    },
    scalability: {
      classroom: 'Single monitoring station at school',
      school: 'Multiple stations in local waterway',
      district: 'Harbor-wide monitoring network',
      city: 'Comprehensive coastal monitoring',
      beyond: 'Regional/national monitoring model'
    }
  },

  // Overview Section
  overview: {
    description: 'Students build and deploy a comprehensive water quality monitoring network, using real-time data to protect marine ecosystems and advocate for policy change.',
    duration: '10 weeks',
    intensity: 'High - includes early morning sampling and evening presentations',
    group_size: '20-30 students',
    deliverables: [
      {
        name: 'Monitoring Network',
        description: '10+ operational water quality monitoring stations',
        format: 'Physical infrastructure with online dashboard'
      },
      {
        name: 'Scientific Report',
        description: 'Comprehensive analysis of harbor health with recommendations',
        format: '100-page technical report with executive summary'
      },
      {
        name: 'Policy Package',
        description: 'Specific proposals for marine protection measures',
        format: 'Ordinance language, implementation plans, enforcement protocols'
      },
      {
        name: 'Scientific Paper',
        description: 'Manuscript for peer-reviewed publication',
        format: 'Journal-ready paper with data repository'
      },
      {
        name: 'Community Action Toolkit',
        description: 'Resources enabling continued monitoring and advocacy',
        format: 'Training materials, protocols, and organizing guides'
      }
    ]
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule essential for field work and lab analysis',
      touchpoints: 'Daily data checks, weekly stakeholder updates',
      flexibility: 'Can adjust 8-12 weeks based on seasons and scope'
    },
    budget: {
      basic: '$3000 for basic sensors and equipment',
      enhanced: '$8000 including professional sensors and boat access',
      grants: 'Available from EPA, NOAA, environmental foundations'
    },
    stakeholders: {
      school: 'Administration support for water access and liability',
      parents: 'Permission for boat work and early morning sampling',
      community: 'Agency permits and stakeholder cooperation essential'
    },
    challenges: [
      {
        challenge: 'Weather and sea conditions affecting sampling',
        solution: 'Flexible scheduling, multiple sampling windows, safety protocols'
      },
      {
        challenge: 'Equipment failure in marine environment',
        solution: 'Redundant systems, regular maintenance, backup equipment'
      },
      {
        challenge: 'Political pressure from polluters',
        solution: 'Strong coalition, media strategy, legal support'
      },
      {
        challenge: 'Data complexity overwhelming students',
        solution: 'Scaffolded analysis, expert mentorship, peer learning'
      }
    ],
    support: {
      training: '3-day intensive on marine science and monitoring',
      materials: 'Complete monitoring protocols and analysis guides',
      mentorship: 'Partner with marine scientists and advocates',
      network: 'Connect with other harbor monitoring programs'
    }
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Focus on single parameter monitoring',
      'Provide data analysis templates',
      'Partner with advanced students for technical work',
      'Offer alternative presentation formats',
      'Simplify sensor construction'
    ],
    forAdvanced: [
      'Design novel monitoring approaches',
      'Lead independent research projects',
      'Mentor community volunteers',
      'Present at scientific conferences',
      'Develop new analysis algorithms'
    ],
    modifications: [
      'Adjust number of monitoring sites',
      'Vary complexity of parameters measured',
      'Flexible roles based on strengths',
      'Multiple ways to demonstrate learning',
      'Accommodate water access limitations'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Harbor Health Summit',
    venue: 'Waterfront location with harbor views',
    audience: 'Scientists, officials, fishermen, media, general public',
    components: [
      'Live data demonstration from monitoring network',
      'Student research presentations',
      'Panel discussion with stakeholders',
      'Boat tours to monitoring stations',
      'Interactive data exploration stations',
      'Community testimony on harbor importance',
      'Commitment ceremony for protection measures',
      'Recognition of student scientists'
    ],
    artifacts: [
      'Published monitoring network with public dashboard',
      'Comprehensive harbor health report',
      'Scientific paper submitted for publication',
      'Policy proposals adopted by agencies',
      'Media coverage portfolio',
      'Student research portfolios',
      'Community action toolkit',
      'Documentary film on project journey'
    ],
    media: {
      press: 'Press conference releasing findings',
      social: '#HarborHealth campaign with daily updates',
      documentation: 'Professional photography and videography',
      amplification: 'Op-eds, interviews, and conference presentations'
    },
    recognition: {
      students: 'Citizen Scientist Certificates and recommendation letters',
      community: 'Harbor Guardian awards for partners',
      partners: 'Appreciation for agencies and supporters',
      celebration: 'Harbor festival celebrating cleaner waters'
    }
  },

  // Implementation Tips
  implementationTips: {
    gettingStarted: {
      preparation: [
        'Establish agency relationships 3 months before',
        'Secure boat access and safety training',
        'Apply for monitoring permits early',
        'Build coalition of supporting organizations',
        'Set up lab space and equipment'
      ],
      earlyWins: [
        'Find and document obvious pollution quickly',
        'Get media coverage of student scientists',
        'Share beautiful harbor photos alongside data',
        'Celebrate each successful deployment',
        'Recognize student expertise publicly'
      ]
    },
    commonPitfalls: {
      technical: [
        'Underestimating marine environment challenges - saltwater destroys everything',
        'Poor calibration - check constantly',
        'Data management chaos - establish protocols early',
        'Equipment loss - secure everything twice',
        'Scope creep - better to monitor few things well'
      ],
      community: [
        'Alienating fishermen - they are allies not enemies',
        'Attacking industry without evidence - data first',
        'Ignoring traditional knowledge - elders know the harbor',
        'Moving too fast - trust takes time',
        'Forgetting celebration - acknowledge every victory'
      ],
      institutional: [
        'Weak data protocols - courts require chain of custody',
        'Missing permits - agencies will shut you down',
        'No legal support - have lawyers ready',
        'Inadequate safety measures - water is dangerous',
        'Sustainability gaps - plan handoff from day one'
      ]
    },
    proTips: {
      science: [
        'Calibrate before every sampling event',
        'Document everything with photos and notes',
        'Keep backup samples for validation',
        'Cross-check sensor data with lab analysis',
        'Publish data immediately for transparency'
      ],
      advocacy: [
        'Lead with health impacts not just numbers',
        'Build coalition before confrontation',
        'Have media present at key moments',
        'Use visualization to make data compelling',
        'Frame as protecting heritage not attacking business'
      ],
      safety: [
        'Never sample alone - buddy system always',
        'Check weather and tides obsessively',
        'Require personal flotation devices',
        'Have emergency action plan practiced',
        'Maintain first aid and communication'
      ]
    },
    scalingUp: {
      growth: [
        'Start with one reliable station then expand',
        'Train other schools to replicate methods',
        'Create monitoring kit for easy deployment',
        'Develop app for citizen scientists',
        'Build regional monitoring network'
      ],
      sustainability: [
        'Transfer ownership to established organization',
        'Create endowment for maintenance',
        'Integrate into agency monitoring',
        'Build revenue through data services',
        'Establish annual harbor health report card'
      ]
    }
  }
};
