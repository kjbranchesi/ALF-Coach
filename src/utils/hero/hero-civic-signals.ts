import { type HeroProjectData } from './types';
import civicSignalsImage from './images/CivicSignals.jpeg';

export const heroCivicSignalsData: HeroProjectData = {
  // Core Metadata
  id: 'hero-civic-signals',
  title: 'Civic Signals: AI Listening for Community Needs',
  tagline: 'Train AI models on community feedback to identify priorities, surface unheard voices, and inform equitable policy decisions',
  duration: '10 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Computer Science', 'Data Science', 'Civics', 'Statistics', 'Social Studies', 'Ethics'],
  theme: {
    primary: 'indigo',
    secondary: 'purple',
    accent: 'amber',
    gradient: 'from-indigo-600 to-purple-600'
  },
  image: civicSignalsImage,

  // Course Abstract
  courseAbstract: {
    overview: 'What if AI could amplify the quietest voices in our community? Students become civic technologists, training machine learning models on thousands of community comments from town halls, social media, surveys, and forums. But this isn\'t about building cool tech - it\'s about surfacing the needs that get drowned out: the single parent who can\'t attend evening meetings, the teen whose ideas are dismissed, the immigrant whose English isn\'t perfect but whose insights are vital. Students discover patterns that humans miss, find consensus where none seemed possible, and present data that makes politicians actually listen. They learn that AI\'s real power isn\'t replacing human judgment but enhancing our ability to hear everyone.',
    learningObjectives: [
      'Master natural language processing and machine learning techniques to analyze community feedback at scale',
      'Develop ethical AI practices that protect privacy, prevent bias, and promote equity',
      'Learn to identify and amplify marginalized voices often missed in traditional civic engagement',
      'Create data visualizations and narratives that make complex findings actionable for policymakers',
      'Build sustainable AI systems that communities can use for ongoing democratic participation'
    ],
    methodology: 'Students operate as a civic intelligence unit, combining data science with deep community engagement. They don\'t just analyze text from afar - they attend town halls, conduct interviews, and understand the human stories behind the data. The classroom becomes a laboratory for democratic innovation where students grapple with ethical dilemmas, technical challenges, and the messy reality of community needs. Every model they train, every insight they surface, has real implications for real people.',
    expectedOutcomes: [
      'Students process 10,000+ pieces of community feedback revealing hidden patterns and priorities',
      'Previously unheard voices gain prominence as AI surfaces overlooked perspectives and needs',
      'City council adopts 3+ policy changes based on AI-discovered community consensus',
      'Marginalized communities gain tools to make their voices heard in civic processes',
      'Students publish groundbreaking research on AI for democratic participation',
      'Model spreads nationally as blueprint for equitable civic engagement'
    ]
  },

  // Hero Header
  hero: {
    badge: 'ALF Hero Project',
    description: 'This pioneering project puts AI in service of democracy, training students to use machine learning to amplify community voices and drive equitable policy change.',
    highlights: [
      { icon: 'Clock', label: 'Duration', value: '10 Weeks' },
      { icon: 'Users', label: 'Grade Level', value: '9-12' },
      { icon: 'Brain', label: 'Focus', value: 'AI & Democracy' },
      { icon: 'Heart', label: 'Impact', value: 'Civic Equity' }
    ],
    impactStatement: 'Students become architects of inclusive democracy, using AI to ensure every voice matters in shaping our shared future.'
  },

  // Rich Context
  context: {
    problem: 'Democratic participation is broken. The same loud voices dominate every town hall. Working families can\'t attend meetings. Non-English speakers are excluded. Young people are ignored. Online comments are too numerous to read. Surveys reach only the engaged. Meanwhile, critical community needs go unheard, policies serve the vocal few, and trust in democracy erodes. Traditional civic engagement systematically excludes the very people most affected by policy decisions.',
    significance: 'AI offers unprecedented opportunity to democratize democracy itself. By analyzing vast amounts of community feedback across multiple channels and languages, AI can surface patterns invisible to humans, identify emerging needs before they become crises, and amplify voices that would otherwise go unheard. This project positions students at the forefront of civic innovation, developing models for inclusive governance that could transform how communities make decisions worldwide.',
    realWorld: 'Students work with real civic data: actual town hall transcripts, genuine social media discussions, authentic survey responses. Their findings influence real decisions about budgets, services, and policies. They present to real officials who must respond to the voices their AI surfaces. When their model identifies that bus route changes disproportionately affect elderly residents, or that youth mental health is a hidden crisis, these insights drive immediate action.',
    studentRole: 'Students become civic data scientists and democracy innovators. They design data collection strategies, build and train AI models, develop bias detection systems, create compelling visualizations, and present findings to power. They\'re not just learning AI - they\'re reshaping how communities listen to themselves.',
    authenticity: 'Every dataset reflects real community struggles. Every model output affects real lives. Students grapple with ethical dilemmas: How do you protect privacy while surfacing insights? How do you prevent AI from perpetuating bias? How do you ensure marginalized voices aren\'t further marginalized by algorithms? The stakes are real because the democracy they\'re strengthening is their own.'
  },

  // Big Idea
  bigIdea: {
    statement: 'AI can democratize democracy by amplifying unheard voices, surfacing hidden consensus, and ensuring policy reflects the needs of all community members, not just the loudest.',
    essentialQuestion: 'How can we use AI to create more inclusive and responsive democratic processes that truly represent all community voices?',
    challenge: 'Build an AI system that analyzes diverse community feedback to identify priorities, amplify marginalized voices, and inform equitable policy decisions.',
    drivingQuestion: 'What if every community member\'s voice carried equal weight in shaping our collective future, regardless of when, how, or in what language they expressed it?',
    subQuestions: [
      'How can AI identify and amplify voices that traditional civic engagement misses?',
      'What ethical frameworks should guide AI analysis of community data?',
      'How do we prevent AI from perpetuating or amplifying existing biases?',
      'What makes data-driven insights compelling to policymakers?',
      'How can communities maintain agency over AI systems analyzing their voices?'
    ]
  },

  // Learning Journey
  journey: {
    phases: [
      {
        name: 'Discover',
        duration: '2 weeks',
        focus: 'Understanding community needs and AI capabilities',
        activities: [
          {
            name: 'Democratic Diagnosis',
            description: 'Deep investigation into how civic engagement currently works and fails. Students attend town halls, analyze participation data, interview officials, and document whose voices dominate and whose are missing.',
            duration: '180 minutes',
            outputs: [
              'Civic participation analysis showing demographic gaps',
              'Power mapping of influential voices vs. affected populations',
              'Documentation of barriers to participation',
              'Interviews with 20+ community members about civic engagement'
            ],
            skills: ['Civic analysis', 'Data collection', 'Interview techniques'],
            resources: ['Town hall access', 'Demographic data', 'Interview protocols']
          },
          {
            name: 'AI Foundations Intensive',
            description: 'Comprehensive introduction to machine learning, natural language processing, and AI ethics. Students learn how AI can analyze text, identify patterns, and surface insights while understanding limitations and risks.',
            duration: '240 minutes',
            outputs: [
              'Working knowledge of NLP techniques and applications',
              'Hands-on experience with sentiment analysis and topic modeling',
              'Understanding of AI bias and mitigation strategies',
              'Personal AI ethics framework development'
            ],
            skills: ['Machine learning basics', 'NLP concepts', 'Ethical reasoning'],
            resources: ['AI tutorials', 'Computing resources', 'Ethics frameworks', 'Code examples']
          },
          {
            name: 'Community Voice Collection',
            description: 'Systematic gathering of community feedback from diverse sources: meeting transcripts, social media, surveys, emails, comment cards. Students ensure representation across demographics, languages, and communication preferences.',
            duration: '360 minutes',
            outputs: [
              'Database of 5000+ community feedback items',
              'Multilingual content collection and translation',
              'Metadata tagging for demographic analysis',
              'Consent and privacy protocols established'
            ],
            skills: ['Data collection', 'Database management', 'Privacy protection'],
            resources: ['Data sources', 'Translation tools', 'Storage systems', 'Consent forms']
          },
          {
            name: 'Bias Detection Workshop',
            description: 'Critical examination of how AI can perpetuate or amplify bias. Students learn to identify bias in datasets, algorithms, and outputs while developing strategies for more equitable AI systems.',
            duration: '180 minutes',
            outputs: [
              'Bias audit checklist for AI systems',
              'Documentation of potential bias sources in community data',
              'Mitigation strategies for identified biases',
              'Equity metrics for model evaluation'
            ],
            skills: ['Bias detection', 'Critical analysis', 'Equity assessment'],
            resources: ['Bias detection tools', 'Case studies', 'Expert consultations']
          },
          {
            name: 'Stakeholder Mapping',
            description: 'Comprehensive mapping of all stakeholders affected by civic AI: residents, officials, community organizations, advocacy groups. Students understand different needs, concerns, and power dynamics.',
            duration: '120 minutes',
            outputs: [
              'Stakeholder map with 50+ entities identified',
              'Power/interest grid analyzing influence',
              'Engagement strategy for each stakeholder group',
              'Partnership agreements with key organizations'
            ],
            skills: ['Stakeholder analysis', 'Strategic planning', 'Relationship building'],
            resources: ['Stakeholder databases', 'Mapping tools', 'Meeting spaces']
          },
          {
            name: 'Privacy Protection Protocol',
            description: 'Develop robust privacy protection systems for community data. Students learn about de-identification, aggregation, and consent while building trust with community members about data use.',
            duration: '120 minutes',
            outputs: [
              'Privacy protection protocol document',
              'De-identification procedures for all data types',
              'Consent management system',
              'Transparency reports for community'
            ],
            skills: ['Privacy engineering', 'Data governance', 'Trust building'],
            resources: ['Privacy frameworks', 'Legal guidance', 'Security tools']
          },
          {
            name: 'Marginalized Voices Focus',
            description: 'Special effort to gather input from systematically excluded groups: undocumented immigrants, homeless individuals, youth, elderly, disabled, non-English speakers. Students design inclusive engagement strategies.',
            duration: '240 minutes',
            outputs: [
              'Targeted outreach to 10+ marginalized groups',
              'Alternative feedback collection methods developed',
              'Trust-building protocols for vulnerable populations',
              'Amplification strategies for quiet voices'
            ],
            skills: ['Inclusive design', 'Cultural competency', 'Trust building'],
            resources: ['Community partnerships', 'Translation services', 'Safe spaces']
          },
          {
            name: 'Technical Infrastructure Setup',
            description: 'Establish computing environment for AI development including cloud resources, development environments, version control, and collaboration tools. Students learn professional data science workflows.',
            duration: '180 minutes',
            outputs: [
              'Cloud computing environment configured',
              'Development environments for all team members',
              'Version control and collaboration systems',
              'Data pipeline architecture designed'
            ],
            skills: ['Cloud computing', 'DevOps basics', 'Collaboration tools'],
            resources: ['Cloud credits', 'Development tools', 'Technical support']
          }
        ]
      },
      {
        name: 'Define',
        duration: '2 weeks',
        focus: 'Designing AI models and analysis frameworks',
        activities: [
          {
            name: 'Model Architecture Design',
            description: 'Design comprehensive AI system architecture including data preprocessing, model selection, training pipelines, and output generation. Students balance sophistication with interpretability.',
            duration: '240 minutes',
            outputs: [
              'System architecture diagram with all components',
              'Model selection justification for each analysis type',
              'Data flow documentation from input to insight',
              'Performance benchmarks and success metrics'
            ],
            skills: ['System design', 'Model selection', 'Architecture planning'],
            resources: ['Architecture tools', 'Model libraries', 'Design patterns']
          },
          {
            name: 'Data Preprocessing Pipeline',
            description: 'Build robust data cleaning and preparation pipeline handling multiple languages, formats, and quality levels. Students learn that 80% of AI work is data preparation.',
            duration: '240 minutes',
            outputs: [
              'Automated cleaning pipeline for all data sources',
              'Language detection and translation system',
              'Deduplication and normalization procedures',
              'Quality scoring for feedback items'
            ],
            skills: ['Data engineering', 'Text processing', 'Pipeline development'],
            resources: ['Processing tools', 'Translation APIs', 'Cleaning libraries']
          },
          {
            name: 'Feature Engineering Sprint',
            description: 'Extract meaningful features from raw text that capture sentiment, topics, urgency, and demographics. Students learn to encode human meaning for machine understanding.',
            duration: '180 minutes',
            outputs: [
              'Feature extraction pipeline with 50+ features',
              'Sentiment analysis calibrated for civic context',
              'Topic modeling revealing community themes',
              'Demographic inference from linguistic patterns'
            ],
            skills: ['Feature engineering', 'NLP techniques', 'Domain adaptation'],
            resources: ['NLP libraries', 'Feature tools', 'Domain expertise']
          },
          {
            name: 'Model Training Laboratory',
            description: 'Train multiple models for different tasks: priority identification, voice amplification, consensus finding, and trend detection. Students experiment with various algorithms and hyperparameters.',
            duration: '360 minutes',
            outputs: [
              'Trained models for 5+ analysis tasks',
              'Performance metrics for model comparison',
              'Hyperparameter optimization results',
              'Model cards documenting capabilities and limitations'
            ],
            skills: ['Model training', 'Hyperparameter tuning', 'Evaluation'],
            resources: ['GPU resources', 'Training frameworks', 'Evaluation tools']
          },
          {
            name: 'Bias Mitigation Implementation',
            description: 'Implement concrete bias mitigation strategies including balanced sampling, fairness constraints, and output auditing. Students ensure AI amplifies equity rather than inequality.',
            duration: '180 minutes',
            outputs: [
              'Bias mitigation techniques implemented',
              'Fairness metrics integrated into training',
              'Demographic parity analysis tools',
              'Bias monitoring dashboard'
            ],
            skills: ['Fairness in ML', 'Bias mitigation', 'Equity metrics'],
            resources: ['Fairness tools', 'Bias detection libraries', 'Audit frameworks']
          },
          {
            name: 'Interpretability Engineering',
            description: 'Build systems to explain AI decisions to non-technical audiences. Students learn that black box AI is useless for democracy - people need to understand why priorities were identified.',
            duration: '180 minutes',
            outputs: [
              'Explainable AI interfaces for all models',
              'Decision trace-back to source feedback',
              'Confidence scoring and uncertainty communication',
              'Plain language explanation generator'
            ],
            skills: ['Explainable AI', 'Interface design', 'Science communication'],
            resources: ['XAI tools', 'Visualization libraries', 'User testing']
          },
          {
            name: 'Validation Framework Development',
            description: 'Create comprehensive validation system including automated testing, human review, and community verification. Students ensure AI outputs align with lived experiences.',
            duration: '120 minutes',
            outputs: [
              'Automated testing suite for all models',
              'Human-in-the-loop review interface',
              'Community validation protocols',
              'Continuous improvement feedback loops'
            ],
            skills: ['Testing', 'Validation design', 'Quality assurance'],
            resources: ['Testing frameworks', 'Review tools', 'Feedback systems']
          },
          {
            name: 'Dashboard Prototype Design',
            description: 'Design intuitive dashboards for different audiences: residents, officials, organizations. Students create interfaces that make complex AI insights accessible and actionable.',
            duration: '180 minutes',
            outputs: [
              'Dashboard mockups for 3+ user types',
              'Interactive visualization components',
              'Real-time insight delivery systems',
              'Mobile-responsive designs'
            ],
            skills: ['UI/UX design', 'Data visualization', 'User research'],
            resources: ['Design tools', 'Prototyping software', 'User feedback']
          }
        ]
      },
      {
        name: 'Develop',
        duration: '4 weeks',
        focus: 'Processing data and generating insights',
        activities: [
          {
            name: 'Mass Data Processing',
            description: 'Process entire corpus of community feedback through AI pipeline. Students manage large-scale computation while monitoring for errors and biases.',
            duration: '360 minutes',
            outputs: [
              'All 10,000+ feedback items processed',
              'Quality metrics for processing pipeline',
              'Error logs and resolution documentation',
              'Processing statistics and metadata'
            ],
            skills: ['Large-scale processing', 'Pipeline management', 'Quality control'],
            resources: ['Computing clusters', 'Monitoring tools', 'Storage systems']
          },
          {
            name: 'Pattern Discovery Deep Dive',
            description: 'Analyze AI outputs to identify surprising patterns, hidden connections, and emerging themes. Students become pattern detectives, finding stories in the data.',
            duration: '240 minutes',
            outputs: [
              'Top 20 community priorities identified',
              'Unexpected pattern documentation',
              'Correlation analysis between issues',
              'Temporal trend identification'
            ],
            skills: ['Pattern recognition', 'Data analysis', 'Insight generation'],
            resources: ['Analysis tools', 'Visualization software', 'Statistical packages']
          },
          {
            name: 'Voice Amplification Analysis',
            description: 'Special focus on identifying and amplifying underrepresented voices. Students use AI to surface perspectives that traditional engagement misses.',
            duration: '240 minutes',
            outputs: [
              'Underrepresented voices identified and highlighted',
              'Comparative analysis of heard vs. unheard perspectives',
              'Amplification recommendations for each group',
              'Equity impact assessment'
            ],
            skills: ['Equity analysis', 'Voice detection', 'Amplification strategies'],
            resources: ['Demographic data', 'Analysis frameworks', 'Visualization tools']
          },
          {
            name: 'Consensus Mining Operation',
            description: 'Use AI to find areas of hidden consensus where diverse groups actually agree. Students discover that common ground exists even in polarized communities.',
            duration: '180 minutes',
            outputs: [
              'Consensus areas identified across demographics',
              'Agreement strength metrics calculated',
              'Bridge issues that unite different groups',
              'Actionable consensus recommendations'
            ],
            skills: ['Consensus analysis', 'Bridge building', 'Political analysis'],
            resources: ['Clustering algorithms', 'Agreement metrics', 'Visualization tools']
          },
          {
            name: 'Insight Validation Sessions',
            description: 'Validate AI findings with community members to ensure insights reflect lived reality. Students learn that AI insights must pass the "truth test" of human experience.',
            duration: '240 minutes',
            outputs: [
              'Community validation of top findings',
              'Corrections and refinements documented',
              'Confidence scores adjusted based on feedback',
              'Validated insight portfolio'
            ],
            skills: ['Community engagement', 'Validation techniques', 'Iteration'],
            resources: ['Focus groups', 'Validation tools', 'Feedback systems']
          },
          {
            name: 'Dashboard Development Sprint',
            description: 'Build fully functional dashboards making AI insights accessible to all stakeholders. Students create tools for ongoing democratic participation.',
            duration: '360 minutes',
            outputs: [
              'Live dashboards for public access',
              'Official portal with detailed analytics',
              'Mobile app for community feedback',
              'API for third-party integration'
            ],
            skills: ['Full-stack development', 'API design', 'Deployment'],
            resources: ['Development frameworks', 'Hosting services', 'Testing tools']
          },
          {
            name: 'Policy Translation Workshop',
            description: 'Translate AI insights into specific policy recommendations with implementation plans. Students bridge the gap between data and decisions.',
            duration: '180 minutes',
            outputs: [
              'Policy briefs for top 10 priorities',
              'Implementation roadmaps with timelines',
              'Budget implications analyzed',
              'Success metrics defined'
            ],
            skills: ['Policy writing', 'Implementation planning', 'Budget analysis'],
            resources: ['Policy templates', 'Budget tools', 'Expert consultation']
          },
          {
            name: 'Storytelling for Impact',
            description: 'Craft compelling narratives around AI insights, centering human stories behind the data. Students learn that numbers need narrative to drive change.',
            duration: '180 minutes',
            outputs: [
              'Story portfolio linking data to lives',
              'Multimedia content for each priority',
              'Quote banks from community voices',
              'Visual stories for social sharing'
            ],
            skills: ['Storytelling', 'Multimedia creation', 'Human-centered design'],
            resources: ['Media tools', 'Story templates', 'Production equipment']
          },
          {
            name: 'Continuous Learning Implementation',
            description: 'Build systems for AI to continuously learn from new community input. Students create sustainable infrastructure for ongoing democratic innovation.',
            duration: '240 minutes',
            outputs: [
              'Automated retraining pipelines',
              'Drift detection and monitoring',
              'Feedback integration systems',
              'Performance tracking dashboards'
            ],
            skills: ['MLOps', 'Continuous learning', 'System maintenance'],
            resources: ['MLOps tools', 'Monitoring systems', 'Automation frameworks']
          },
          {
            name: 'Security Hardening',
            description: 'Implement robust security measures protecting community data and preventing AI manipulation. Students learn that democratic AI must be secure AI.',
            duration: '120 minutes',
            outputs: [
              'Security audit completed and passed',
              'Encryption implemented for all data',
              'Access controls and audit logs',
              'Incident response procedures'
            ],
            skills: ['Security engineering', 'Encryption', 'Access control'],
            resources: ['Security tools', 'Penetration testing', 'Security frameworks']
          }
        ]
      },
      {
        name: 'Deliver',
        duration: '2 weeks',
        focus: 'Presenting insights and driving democratic change',
        activities: [
          {
            name: 'Community Revelation Event',
            description: 'Major public event revealing what AI discovered about community needs. Students present insights in accessible, engaging ways that inspire action.',
            duration: '240 minutes',
            outputs: [
              'Public presentation to 300+ residents',
              'Interactive stations exploring findings',
              'Live dashboard demonstrations',
              'Commitment cards for action'
            ],
            skills: ['Public presentation', 'Event management', 'Community mobilization'],
            resources: ['Venue', 'Presentation equipment', 'Materials', 'Refreshments']
          },
          {
            name: 'Marginalized Voices Spotlight',
            description: 'Special presentation centering voices AI helped amplify. Students ensure those traditionally unheard are now at the center of conversation.',
            duration: '180 minutes',
            outputs: [
              'Testimonials from amplified voices',
              'Before/after comparison of representation',
              'Media coverage of equity impacts',
              'Partnership agreements for ongoing amplification'
            ],
            skills: ['Equity advocacy', 'Storytelling', 'Media relations'],
            resources: ['Media contacts', 'Production support', 'Translation services']
          },
          {
            name: 'Official Briefing Sessions',
            description: 'Formal presentations to city council, department heads, and agency officials. Students translate AI insights into actionable recommendations officials can implement.',
            duration: '240 minutes',
            outputs: [
              'Briefings delivered to all key officials',
              'Policy memos for each department',
              'Implementation commitments secured',
              'Follow-up timelines established'
            ],
            skills: ['Policy presentation', 'Bureaucratic navigation', 'Persuasion'],
            resources: ['Meeting access', 'Presentation materials', 'Follow-up tools']
          },
          {
            name: 'Media Amplification Campaign',
            description: 'Coordinated media push to share findings and build pressure for action. Students learn to use media as a tool for democratic accountability.',
            duration: '180 minutes',
            outputs: [
              'Press conference with major outlets',
              'Op-eds in local newspapers',
              'Podcast and radio appearances',
              'Social media campaign viral'
            ],
            skills: ['Media relations', 'Message crafting', 'Public communication'],
            resources: ['Press contacts', 'Media kits', 'Social media tools']
          },
          {
            name: 'Academic Publication Push',
            description: 'Prepare findings for academic publication to contribute to growing field of AI for democracy. Students join scholarly conversation about technology and society.',
            duration: '240 minutes',
            outputs: [
              'Research paper drafted for submission',
              'Conference abstracts submitted',
              'Dataset prepared for public release',
              'Code repository documented and shared'
            ],
            skills: ['Academic writing', 'Research documentation', 'Peer review'],
            resources: ['Writing support', 'Publication guides', 'Repository platforms']
          },
          {
            name: 'Toolkit Creation Workshop',
            description: 'Develop comprehensive toolkit enabling other communities to replicate civic AI approach. Students ensure their innovation spreads.',
            duration: '240 minutes',
            outputs: [
              '100-page implementation guide',
              'Open-source code repository',
              'Training materials and videos',
              'Support network established'
            ],
            skills: ['Documentation', 'Knowledge transfer', 'Community building'],
            resources: ['Publishing tools', 'Repository hosting', 'Network platforms']
          },
          {
            name: 'Democracy Hackathon',
            description: 'Host hackathon where participants use civic AI tools to solve community challenges. Students inspire next generation of democracy innovators.',
            duration: '480 minutes',
            outputs: [
              'Hackathon with 100+ participants',
              '20+ civic AI projects initiated',
              'Winners implementing real solutions',
              'Ongoing innovation community formed'
            ],
            skills: ['Event planning', 'Mentorship', 'Community building'],
            resources: ['Venue', 'Prizes', 'Mentors', 'Equipment']
          },
          {
            name: 'Policy Victory Ceremony',
            description: 'Celebrate policy changes resulting from AI insights with community members whose voices were heard. Students see democracy working.',
            duration: '120 minutes',
            outputs: [
              'Celebration with affected communities',
              'Official policy signing ceremony',
              'Media coverage of victories',
              'Commitment to continued listening'
            ],
            skills: ['Celebration planning', 'Community recognition', 'Relationship building'],
            resources: ['Venue', 'Recognition materials', 'Media coverage']
          },
          {
            name: 'Sustainability Transition',
            description: 'Transfer AI system to community organizations for ongoing operation. Students ensure their work continues serving democracy.',
            duration: '180 minutes',
            outputs: [
              'System handoff to community partners',
              'Training completed for operators',
              'Maintenance fund established',
              'Governance structure created'
            ],
            skills: ['Knowledge transfer', 'Training', 'Sustainability planning'],
            resources: ['Training materials', 'Funding', 'Legal agreements']
          },
          {
            name: 'Reflection and Futures',
            description: 'Deep reflection on AI\'s role in democracy and students\' future paths. Students process their transformation into democracy innovators.',
            duration: '120 minutes',
            outputs: [
              'Reflection portfolios completed',
              'Future career paths identified',
              'Alumni network established',
              'Commitment to democratic innovation'
            ],
            skills: ['Reflection', 'Future planning', 'Network building'],
            resources: ['Reflection prompts', 'Career resources', 'Alumni platform']
          }
        ]
      }
    ],
    milestones: [
      {
        week: 2,
        title: 'Community Voices Gathered',
        description: 'Comprehensive feedback collection from all demographics',
        evidence: ['10,000+ feedback items', 'Privacy protocols', 'Stakeholder agreements'],
        celebration: 'Data collection celebration with community partners'
      },
      {
        week: 4,
        title: 'AI Models Operational',
        description: 'Trained models ready for community analysis',
        evidence: ['Models validated', 'Bias mitigation confirmed', 'Dashboards prototyped'],
        celebration: 'Model launch event with live demonstrations'
      },
      {
        week: 8,
        title: 'Insights Discovered',
        description: 'Major findings about community priorities revealed',
        evidence: ['Priority analysis complete', 'Voices amplified', 'Consensus identified'],
        celebration: 'Community revelation event sharing discoveries'
      },
      {
        week: 10,
        title: 'Democracy Transformed',
        description: 'Policy changes and ongoing systems established',
        evidence: ['Policies adopted', 'Toolkit published', 'System transferred'],
        celebration: 'Democracy victory celebration with all stakeholders'
      }
    ]
  },

  // Learning Objectives & Standards
  standards: {
    objectives: [
      'Design and implement AI systems for analyzing large-scale text data',
      'Apply ethical frameworks to ensure equitable and privacy-preserving AI',
      'Master natural language processing and machine learning techniques',
      'Develop skills in data visualization and scientific communication',
      'Practice civic engagement and democratic participation',
      'Create sustainable technology solutions for community empowerment'
    ],
    alignments: {
      'Computer Science Standards (CSTA)': [
        {
          code: '3B-AP-08',
          text: 'Describe how AI and machine learning algorithms work',
          application: 'Students build and explain NLP models for civic analysis',
          depth: 'master'
        },
        {
          code: '3B-IC-25',
          text: 'Evaluate computational artifacts for bias and accessibility',
          application: 'Students audit AI systems for bias and equity',
          depth: 'master'
        },
        {
          code: '3B-DA-06',
          text: 'Select data collection and analysis techniques to answer questions',
          application: 'Students design comprehensive data strategies',
          depth: 'master'
        }
      ],
      'Common Core Mathematics': [
        {
          code: 'HSS.IC.B.6',
          text: 'Evaluate reports based on data',
          application: 'Students critically evaluate AI-generated insights',
          depth: 'master'
        },
        {
          code: 'HSS.ID.B.6',
          text: 'Represent data on two quantitative variables',
          application: 'Students visualize relationships in community data',
          depth: 'develop'
        }
      ],
      'Common Core ELA': [
        {
          code: 'RST.11-12.9',
          text: 'Synthesize information from multiple sources',
          application: 'Students synthesize diverse community feedback',
          depth: 'master'
        },
        {
          code: 'W.11-12.1',
          text: 'Write arguments to support claims',
          application: 'Students write policy recommendations from AI insights',
          depth: 'master'
        },
        {
          code: 'SL.11-12.4',
          text: 'Present information for diverse audiences',
          application: 'Students present to community, officials, and academics',
          depth: 'master'
        }
      ],
      'C3 Framework for Social Studies': [
        {
          code: 'D2.Civ.1.9-12',
          text: 'Distinguish the roles of institutions in society',
          application: 'Students understand civic structures and influence',
          depth: 'master'
        },
        {
          code: 'D2.Civ.14.9-12',
          text: 'Analyze how people use and challenge institutions',
          application: 'Students use AI to challenge and improve democracy',
          depth: 'master'
        },
        {
          code: 'D4.7.9-12',
          text: 'Assess options for action to address problems',
          application: 'Students develop AI-informed policy solutions',
          depth: 'master'
        }
      ],
      'ISTE Standards': [
        {
          code: '1.3 Knowledge Constructor',
          text: 'Build knowledge through research and exploration',
          application: 'Students construct knowledge from community data',
          depth: 'master'
        },
        {
          code: '1.4 Innovative Designer',
          text: 'Use design process to solve problems',
          application: 'Students design AI solutions for civic challenges',
          depth: 'master'
        },
        {
          code: '1.5 Computational Thinker',
          text: 'Develop strategies using computational methods',
          application: 'Students apply AI to democratic participation',
          depth: 'master'
        }
      ],
      'AI4K12 AI Literacy Standards': [
        {
          code: 'Understanding AI',
          text: 'Understand AI concepts and approaches',
          application: 'Students master NLP and machine learning concepts',
          depth: 'master'
        },
        {
          code: 'AI Ethics',
          text: 'Understand ethical implications of AI',
          application: 'Students grapple with bias, privacy, and equity',
          depth: 'master'
        },
        {
          code: 'Using AI',
          text: 'Apply AI to solve problems',
          application: 'Students use AI for civic innovation',
          depth: 'master'
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
          'Digital citizenship',
          'Ethical reasoning'
        ]
      },
      {
        category: 'Technical Skills',
        items: [
          'Machine learning and NLP',
          'Data processing and analysis',
          'Programming in Python',
          'Cloud computing',
          'Data visualization'
        ]
      },
      {
        category: 'Civic Skills',
        items: [
          'Democratic participation',
          'Policy analysis',
          'Community engagement',
          'Advocacy and organizing',
          'Cross-cultural communication'
        ]
      },
      {
        category: 'Ethical AI Skills',
        items: [
          'Bias detection and mitigation',
          'Privacy preservation',
          'Explainable AI',
          'Responsible innovation',
          'Community-centered design'
        ]
      }
    ]
  },

  // Assessment & Evaluation
  assessment: {
    formative: [
      'Weekly AI model performance reviews and improvements',
      'Bias audit reports for each processing phase',
      'Community feedback on insight accuracy and relevance',
      'Peer code reviews ensuring quality and ethics',
      'Stakeholder check-ins on project direction'
    ],
    summative: [
      'Complete AI system with documentation and code',
      'Comprehensive community insights report with visualizations',
      'Policy recommendations backed by AI analysis',
      'Public presentation demonstrating impact',
      'Reflection paper on AI, democracy, and ethics'
    ],
    rubric: [
      {
        category: 'Technical Excellence',
        weight: 25,
        criteria: 'Quality of AI system design and implementation',
        exemplary: {
          description: 'Professional-grade AI system with innovative approaches',
          indicators: ['Novel techniques', 'Excellent performance', 'Scalable architecture']
        },
        proficient: {
          description: 'Solid AI system meeting all requirements',
          indicators: ['Good performance', 'Reliable operation', 'Clear documentation']
        },
        developing: {
          description: 'Functional AI system with some limitations',
          indicators: ['Basic functionality', 'Some issues', 'Adequate documentation']
        }
      },
      {
        category: 'Ethical Implementation',
        weight: 25,
        criteria: 'Commitment to equity, privacy, and responsible AI',
        exemplary: {
          description: 'Exemplary ethical practices setting new standards',
          indicators: ['Zero bias incidents', 'Perfect privacy', 'Community trust earned']
        },
        proficient: {
          description: 'Strong ethical practices throughout project',
          indicators: ['Bias addressed', 'Privacy protected', 'Transparency maintained']
        },
        developing: {
          description: 'Basic ethical considerations addressed',
          indicators: ['Some bias mitigation', 'Privacy basics', 'Limited transparency']
        }
      },
      {
        category: 'Democratic Impact',
        weight: 25,
        criteria: 'Contribution to inclusive civic participation',
        exemplary: {
          description: 'Transforms democratic participation in community',
          indicators: ['Voices amplified', 'Policies changed', 'Model spreading']
        },
        proficient: {
          description: 'Meaningful improvement in civic engagement',
          indicators: ['New voices heard', 'Insights actioned', 'Awareness raised']
        },
        developing: {
          description: 'Some contribution to civic discourse',
          indicators: ['Data analyzed', 'Findings shared', 'Discussion started']
        }
      },
      {
        category: 'Communication & Advocacy',
        weight: 15,
        criteria: 'Effectiveness in conveying insights and driving change',
        exemplary: {
          description: 'Compelling communication mobilizing action',
          indicators: ['Wide media coverage', 'Policy adoption', 'Community mobilized']
        },
        proficient: {
          description: 'Clear communication engaging stakeholders',
          indicators: ['Good presentations', 'Some media', 'Officials engaged']
        },
        developing: {
          description: 'Basic communication of findings',
          indicators: ['Findings presented', 'Local awareness', 'Some engagement']
        }
      },
      {
        category: 'Collaboration & Leadership',
        weight: 10,
        criteria: 'Team collaboration and community partnership',
        exemplary: {
          description: 'Exceptional leadership uniting diverse stakeholders',
          indicators: ['Strong coalitions', 'Conflicts resolved', 'Others inspired']
        },
        proficient: {
          description: 'Good collaboration with team and community',
          indicators: ['Team cohesion', 'Partnerships maintained', 'Roles fulfilled']
        },
        developing: {
          description: 'Basic collaboration with some challenges',
          indicators: ['Team functional', 'Some partnerships', 'Responsibilities met']
        }
      }
    ]
  },

  // Resources & Materials
  resources: {
    required: [
      {
        category: 'Computing Resources',
        items: [
          'Computers with Python development environment',
          'Cloud computing credits for model training',
          'Data storage for community feedback',
          'Development tools and libraries',
          'Version control systems'
        ]
      },
      {
        category: 'AI/ML Tools',
        items: [
          'Natural language processing libraries',
          'Machine learning frameworks',
          'Data visualization tools',
          'Model deployment platforms',
          'Bias detection tools'
        ]
      },
      {
        category: 'Community Engagement',
        items: [
          'Survey and feedback collection tools',
          'Translation services',
          'Meeting spaces for engagement',
          'Recording equipment',
          'Consent and privacy forms'
        ]
      },
      {
        category: 'Communication Tools',
        items: [
          'Presentation software',
          'Dashboard development tools',
          'Report writing templates',
          'Media production equipment',
          'Social media management'
        ]
      }
    ],
    optional: [
      {
        category: 'Advanced Technology',
        items: [
          'GPU clusters for faster training',
          'Professional NLP APIs',
          'Advanced visualization software',
          'A/B testing platforms',
          'Production deployment infrastructure'
        ]
      },
      {
        category: 'Professional Support',
        items: [
          'AI researcher mentorship',
          'Ethics expert consultation',
          'Civil rights lawyer guidance',
          'Data scientist collaboration',
          'Policy analyst support'
        ]
      }
    ],
    community: [
      {
        type: 'City Government',
        role: 'Provide data access and policy implementation pathways'
      },
      {
        type: 'Community Organizations',
        role: 'Connect with marginalized groups and validate findings'
      },
      {
        type: 'Universities',
        role: 'Provide technical expertise and research validation'
      },
      {
        type: 'Civil Rights Groups',
        role: 'Ensure equity and protect vulnerable populations'
      },
      {
        type: 'Media Partners',
        role: 'Amplify findings and pressure for change'
      }
    ]
  },

  // Impact & Outcomes
  impact: {
    audience: 'Students, Residents, Officials, Marginalized Communities, Democracy Advocates, AI Researchers',
    reach: 'Entire community with focus on amplifying unheard voices',
    outcomes: [
      'Students become AI ethicists and democracy innovators',
      'Previously unheard voices gain prominence in civic discourse',
      'Policy decisions reflect broader community needs',
      'AI model adopted by other communities nationwide',
      'Academic contributions advance field of AI for democracy',
      'Trust in democratic processes increases measurably'
    ],
    metrics: [
      {
        metric: 'Voices Amplified',
        target: '500+ previously unheard voices surfaced',
        measurement: 'Representation analysis',
        timeline: 'Project duration',
        evidence: 'Demographic participation data'
      },
      {
        metric: 'Data Processed',
        target: '10,000+ feedback items analyzed',
        measurement: 'Processing logs',
        timeline: 'Weeks 3-8',
        evidence: 'Database records, processing stats'
      },
      {
        metric: 'Policy Impact',
        target: '3+ policies influenced by findings',
        measurement: 'Policy tracking',
        timeline: '6 months post-project',
        evidence: 'Council resolutions, budget changes'
      },
      {
        metric: 'Community Engagement',
        target: '1000+ residents engaged',
        measurement: 'Participation tracking',
        timeline: 'Throughout project',
        evidence: 'Event attendance, dashboard users'
      },
      {
        metric: 'Model Adoption',
        target: '5+ communities request toolkit',
        measurement: 'Adoption tracking',
        timeline: '1 year post-project',
        evidence: 'Downloads, inquiries, implementations'
      },
      {
        metric: 'Academic Impact',
        target: 'Paper accepted at major conference',
        measurement: 'Publication status',
        timeline: '1 year post-project',
        evidence: 'Acceptance letters, citations'
      }
    ],
    sustainability: {
      continuation: 'Community organizations operate AI system',
      maintenance: 'Established fund for system updates',
      evolution: 'Annual model retraining with new data',
      legacy: 'Open-source toolkit enables replication',
      funding: 'Grants and government support secured'
    },
    scalability: {
      classroom: 'Analyze school feedback for improvements',
      school: 'District-wide student voice analysis',
      district: 'City-wide civic AI implementation',
      city: 'Regional democratic innovation',
      beyond: 'National model for AI democracy'
    }
  },

  // Overview Section
  overview: {
    description: 'Students build AI systems that analyze thousands of pieces of community feedback to identify priorities, amplify marginalized voices, and drive equitable policy change.',
    duration: '10 weeks',
    intensity: 'High - includes evening community events and intensive computing',
    group_size: '20-30 students',
    deliverables: [
      {
        name: 'Civic AI System',
        description: 'Complete NLP system analyzing community feedback',
        format: 'Deployed system with dashboards and APIs'
      },
      {
        name: 'Community Insights Report',
        description: 'Comprehensive analysis of community priorities',
        format: '100-page report with visualizations'
      },
      {
        name: 'Policy Recommendations',
        description: 'AI-informed proposals for civic action',
        format: 'Policy briefs and implementation plans'
      },
      {
        name: 'Democracy Toolkit',
        description: 'Resources for replicating civic AI',
        format: 'Open-source code, guides, and training'
      },
      {
        name: 'Academic Paper',
        description: 'Research contribution to AI for democracy',
        format: 'Conference or journal submission'
      }
    ]
  },

  // Implementation Guidance
  feasibility: {
    schedule: {
      structure: 'Block schedule ideal for intensive coding and analysis',
      touchpoints: 'Daily standup meetings, weekly community check-ins',
      flexibility: 'Can adjust 8-12 weeks based on data complexity'
    },
    budget: {
      basic: '$1000 for cloud computing and basic tools',
      enhanced: '$5000 including GPUs and professional APIs',
      grants: 'Available from tech companies, democracy foundations'
    },
    stakeholders: {
      school: 'Administration support for community engagement',
      parents: 'Permission for evening events and data work',
      community: 'Government data access and organization partnerships'
    },
    challenges: [
      {
        challenge: 'Privacy concerns about community data',
        solution: 'Robust consent, de-identification, transparency'
      },
      {
        challenge: 'AI bias amplifying existing inequities',
        solution: 'Continuous bias auditing, diverse team, community validation'
      },
      {
        challenge: 'Technical complexity overwhelming students',
        solution: 'Scaffolded learning, pair programming, expert mentors'
      },
      {
        challenge: 'Political resistance to findings',
        solution: 'Coalition building, media strategy, data transparency'
      }
    ],
    support: {
      training: '3-day bootcamp on AI and democratic theory',
      materials: 'Complete curriculum with code examples',
      mentorship: 'Connect with AI researchers and democracy advocates',
      network: 'Join civic tech and AI for good communities'
    }
  },

  // Differentiation & Extensions
  differentiation: {
    forStruggling: [
      'Focus on single analysis task rather than full system',
      'Provide code templates and examples',
      'Partner with stronger students on technical work',
      'Emphasize qualitative analysis over coding',
      'Use pre-trained models rather than training own'
    ],
    forAdvanced: [
      'Develop novel AI techniques for civic analysis',
      'Lead technical architecture and implementation',
      'Publish research paper as lead author',
      'Mentor other students and community members',
      'Build production-ready systems'
    ],
    modifications: [
      'Adjust technical complexity to student level',
      'Vary role balance between technical and community work',
      'Flexible output formats for different strengths',
      'Multiple pathways to demonstrate learning',
      'Accommodate different comfort with public speaking'
    ]
  },

  // Showcase & Celebration
  showcase: {
    format: 'Democracy Innovation Summit',
    venue: 'City hall or major community venue',
    audience: 'Officials, residents, researchers, media, other schools',
    components: [
      'Live demonstration of AI system analyzing feedback',
      'Student presentations on key findings',
      'Panel discussion on AI and democracy',
      'Interactive stations exploring insights',
      'Testimonials from amplified voices',
      'Official response to recommendations',
      'Toolkit launch and training session',
      'Awards ceremony recognizing innovation'
    ],
    artifacts: [
      'Functioning AI system with public access',
      'Published insights report and policy briefs',
      'Media coverage portfolio',
      'Academic paper submitted',
      'Open-source toolkit released',
      'Documentary video on project',
      'Student portfolios and reflections',
      'Community impact testimonials'
    ],
    media: {
      press: 'National coverage on AI for democracy',
      social: '#CivicSignals campaign sharing insights',
      documentation: 'Professional video throughout project',
      amplification: 'TED talks and conference presentations'
    },
    recognition: {
      students: 'Democracy Innovator Certificates',
      community: 'Voice Amplifier awards for partners',
      partners: 'Appreciation for supporting organizations',
      celebration: 'Democracy festival celebrating inclusion'
    }
  },

  // Implementation Tips
  implementationTips: {
    gettingStarted: {
      preparation: [
        'Secure data access agreements 3 months early',
        'Build diverse advisory board including ethicists',
        'Set up cloud computing resources and accounts',
        'Establish partnerships with marginalized communities',
        'Create robust consent and privacy protocols'
      ],
      earlyWins: [
        'Find one powerful unheard voice to amplify',
        'Show immediate value with simple sentiment analysis',
        'Get media coverage of students as democracy innovators',
        'Celebrate every bias caught and corrected',
        'Share surprising consensus discoveries'
      ]
    },
    commonPitfalls: {
      technical: [
        'Underestimating compute needs - start cloud setup early',
        'Messy data overwhelming students - invest in preprocessing',
        'Black box models - prioritize interpretability',
        'Overfitting to loudest voices - actively sample diversity',
        'Privacy breaches - encryption and access controls essential'
      ],
      community: [
        'Extractive research - ensure community benefits',
        'Tech solutionism - remember AI serves democracy not vice versa',
        'Excluding non-digital voices - multiple collection methods',
        'Moving too fast - community trust takes time',
        'Ignoring criticism - embrace feedback as improvement'
      ],
      ethical: [
        'Bias amplification - audit continuously',
        'Privacy violations - consent for everything',
        'Manipulation potential - secure systems',
        'False consensus - validate with humans',
        'Power concentration - distribute control'
      ]
    },
    proTips: {
      technical: [
        'Start simple with sentiment analysis then build complexity',
        'Use pre-trained models when possible to save time',
        'Version control everything including data',
        'Document assumptions and limitations clearly',
        'Test with small data before scaling up'
      ],
      community: [
        'Center most marginalized voices from beginning',
        'Make findings accessible in multiple languages',
        'Return value to community not just extract data',
        'Build coalition before presenting to power',
        'Frame as enhancing democracy not replacing it'
      ],
      impact: [
        'Lead with stories not statistics',
        'Show consensus to unite rather than divide',
        'Time releases for maximum political impact',
        'Build pressure through multiple channels',
        'Celebrate every voice newly heard'
      ]
    },
    scalingUp: {
      growth: [
        'Start with single issue then expand scope',
        'Build modular system others can adapt',
        'Create tiered engagement for different skills',
        'Document everything for replication',
        'Build network of civic AI practitioners'
      ],
      sustainability: [
        'Transfer to trusted community organization',
        'Automate as much as possible',
        'Build revenue model through grants/contracts',
        'Train next generation of operators',
        'Embed in ongoing civic processes'
      ]
    }
  }
};