/**
 * Sample Educational Tools Data
 * 
 * This file contains example tool entries that demonstrate the Interactive Tool
 * Curation Service capabilities across different categories and ALF stages.
 */

import {
  EducationalTool,
  ToolCategory,
  ToolType,
  Subject,
  SkillLevel,
  Platform,
  IntegrationMethod,
  BloomsLevel,
  ReviewStatus
} from '../services/interactive-tool-curation-service';

export const SAMPLE_TOOLS: EducationalTool[] = [
  {
    id: 'phet-simulations',
    name: 'PhET Interactive Simulations',
    description: 'Interactive math and science simulations that help students understand complex concepts through exploration and discovery.',
    category: ToolCategory.STEM_SIMULATION,
    type: ToolType.WEB_APPLICATION,
    url: 'https://phet.colorado.edu',
    version: '2024.1',
    provider: {
      name: 'University of Colorado Boulder',
      type: 'educational',
      website: 'https://phet.colorado.edu',
      supportContact: 'https://phet.colorado.edu/en/help-center',
      reliability: 5,
      educationalFocus: true
    },
    subjects: [Subject.SCIENCE, Subject.MATHEMATICS, Subject.TECHNOLOGY],
    skillLevel: SkillLevel.ADAPTIVE,
    ageRange: {
      min: 8,
      max: 18,
      description: 'Elementary through High School'
    },
    learningObjectives: [
      'Understand scientific phenomena through interactive exploration',
      'Develop conceptual understanding of physics, chemistry, and math',
      'Practice scientific inquiry and hypothesis testing',
      'Visualize abstract concepts through simulation'
    ],
    alfStageAlignment: {
      catalyst: {
        score: 5,
        rationale: 'Excellent for sparking curiosity about scientific phenomena',
        examples: ['Students explore wave behavior to understand sound', 'Gravity simulation leads to questions about planetary motion']
      },
      issues: {
        score: 4,
        rationale: 'Good for investigating underlying scientific principles',
        examples: ['Research how variables affect outcomes', 'Compare different scenarios and conditions']
      },
      method: {
        score: 3,
        rationale: 'Supports prototyping and testing hypotheses',
        examples: ['Test different circuit designs', 'Model projectile motion with varying conditions']
      },
      engagement: {
        score: 3,
        rationale: 'Can be used to demonstrate findings to others',
        examples: ['Present simulation results to classmates', 'Create explanatory videos using simulations']
      },
      overallAlignment: {
        score: 4,
        rationale: 'Strong alignment with ALF inquiry-based learning approach',
        examples: ['Supports all stages with particular strength in Catalyst and Issues phases']
      },
      specificUses: [
        'Concept introduction and exploration',
        'Hypothesis testing and experimentation',
        'Data collection and analysis',
        'Peer teaching and explanation'
      ]
    },
    bloomsLevels: [BloomsLevel.UNDERSTAND, BloomsLevel.APPLY, BloomsLevel.ANALYZE, BloomsLevel.EVALUATE],
    platform: [Platform.WEB_BROWSER, Platform.WINDOWS, Platform.MACOS, Platform.LINUX, Platform.CHROMEBOOK],
    requirements: {
      minimumSpecs: {
        ram: '2GB',
        storage: '100MB',
        processor: 'Dual-core 1.5GHz',
        graphics: 'Integrated graphics',
        operatingSystem: ['Windows 7+', 'macOS 10.10+', 'Linux', 'Chrome OS']
      },
      recommendedSpecs: {
        ram: '4GB',
        storage: '500MB',
        processor: 'Quad-core 2.0GHz',
        graphics: 'Dedicated graphics recommended',
        operatingSystem: ['Windows 10+', 'macOS 10.15+', 'Ubuntu 18.04+']
      },
      internetRequired: false,
      bandwidth: 'N/A for offline use',
      specialHardware: [],
      browserRequirements: ['Chrome 70+', 'Firefox 60+', 'Safari 12+', 'Edge 79+']
    },
    integrationMethods: [IntegrationMethod.EMBED_IFRAME, IntegrationMethod.DIRECT_LINK, IntegrationMethod.EXPORT_IMPORT],
    apiAvailable: false,
    offlineCapable: true,
    licensing: {
      type: 'free',
      cost: {
        individual: 0,
        classroom: 0,
        school: 0,
        district: 0,
        currency: 'USD',
        billingPeriod: 'lifetime'
      },
      terms: 'Creative Commons Attribution 4.0 International License',
      educationalDiscount: false,
      bulkPricing: false,
      trialAvailable: false,
      trialDuration: 0
    },
    costModel: 'free' as any,
    accessPermissions: ['public' as any],
    evaluation: {
      overallScore: 9.2,
      criteria: {
        educationalValue: { score: 5, weight: 1.5, notes: 'Research-based design with proven learning outcomes' },
        usability: { score: 5, weight: 1.2, notes: 'Intuitive interface suitable for all ages' },
        engagement: { score: 5, weight: 1.3, notes: 'Highly interactive and visually appealing' },
        alfAlignment: { score: 4, weight: 1.4, notes: 'Strong support for inquiry-based learning' },
        technicalQuality: { score: 5, weight: 1.0, notes: 'Well-developed, stable simulations' },
        accessibility: { score: 4, weight: 1.1, notes: 'Good accessibility features, room for improvement' },
        costEffectiveness: { score: 5, weight: 0.9, notes: 'Completely free with high value' },
        support: { score: 4, weight: 0.8, notes: 'Good documentation and community resources' }
      },
      strengths: [
        'Research-based educational design',
        'High-quality interactive simulations',
        'Completely free and open access',
        'Works offline',
        'Covers wide range of STEM topics'
      ],
      weaknesses: [
        'Limited customization options',
        'No built-in assessment tools',
        'Some accessibility limitations'
      ],
      recommendedUse: [
        'Concept introduction and exploration',
        'Inquiry-based learning activities',
        'Homework and independent study',
        'Demonstration and explanation'
      ],
      alternatives: ['Labster', 'ExploreLearning Gizmos', 'Wolfram Demonstrations'],
      lastEvaluated: new Date('2024-01-15'),
      evaluatorNotes: 'Excellent free resource with strong educational foundation'
    },
    accessibility: {
      wcagCompliance: {
        level: 'AA',
        version: '2.1',
        auditDate: new Date('2023-11-20'),
        auditReport: 'https://phet.colorado.edu/en/accessibility'
      },
      screenReaderCompatible: true,
      keyboardNavigation: true,
      colorContrastAdequate: true,
      textSizeAdjustable: true,
      altTextSupport: true,
      captionsAvailable: false,
      languageSupport: ['en', 'es', 'fr', 'de', 'zh', 'ar'],
      accommodationFeatures: [
        'Keyboard navigation',
        'Screen reader support',
        'High contrast mode',
        'Text-only descriptions'
      ],
      lastAssessed: new Date('2023-11-20'),
      certifications: ['WCAG 2.1 AA']
    },
    pedagogicalAlignment: {
      constructivistLearning: { score: 5, rationale: 'Students build understanding through exploration', examples: [] },
      collaborativeLearning: { score: 3, rationale: 'Can be used in group settings but primarily individual', examples: [] },
      inquiryBasedLearning: { score: 5, rationale: 'Designed specifically for inquiry and investigation', examples: [] },
      projectBasedLearning: { score: 4, rationale: 'Can be integrated into larger projects', examples: [] },
      authenticAssessment: { score: 3, rationale: 'Limited built-in assessment but supports authentic tasks', examples: [] },
      differentiation: { score: 4, rationale: 'Adaptive difficulty and multiple representation modes', examples: [] },
      universalDesign: { score: 4, rationale: 'Good accessibility features and multiple learning modalities', examples: [] }
    },
    usageMetrics: {
      totalUsers: 150000000,
      activeUsers: 25000000,
      sessionDuration: 18,
      completionRate: 75,
      returnUsage: 45,
      errorRate: 2,
      lastUpdated: new Date('2024-01-30')
    },
    studentEngagement: {
      averageTimeOnTask: 22,
      interactionFrequency: 95,
      contentCompletion: 68,
      collaborationLevel: 3,
      creativityIndicators: ['hypothesis formation', 'variable manipulation', 'pattern recognition'],
      motivationFactors: ['immediate feedback', 'visual appeal', 'discovery learning']
    },
    effectivenessData: {
      learningOutcomes: [
        {
          objective: 'Improved conceptual understanding of physics',
          measurementMethod: 'Pre/post concept inventories',
          achievementRate: 78,
          improvementData: 35,
          timeframe: '1 semester'
        }
      ],
      skillDevelopment: [
        {
          skill: 'Scientific reasoning',
          beforeLevel: 2.3,
          afterLevel: 3.7,
          developmentTime: 20,
          retentionRate: 85
        }
      ],
      competencyGains: [
        {
          competency: 'Physics problem solving',
          initialAssessment: 2.1,
          finalAssessment: 3.4,
          growthRate: 1.3,
          transferability: 4
        }
      ],
      standardsAlignment: [
        {
          standard: 'NGSS K-12',
          alignmentLevel: 'full',
          evidencePoints: ['Supports science practices', 'Addresses core ideas', 'Develops crosscutting concepts'],
          mappingConfidence: 5
        }
      ],
      evidenceBase: [
        'Peer-reviewed research studies',
        'Educational efficacy data',
        'User analytics and feedback'
      ]
    },
    curatedBy: 'ALF Curation Team',
    curatedDate: new Date('2024-01-10'),
    lastReviewed: new Date('2024-01-30'),
    reviewStatus: ReviewStatus.APPROVED,
    tags: [
      'physics', 'chemistry', 'mathematics', 'simulation', 'interactive',
      'free', 'offline', 'research-based', 'K-12', 'STEM'
    ],
    ratings: [
      { userId: 'teacher1', rating: 5, category: 'overall', date: new Date('2024-01-20'), verified: true },
      { userId: 'teacher2', rating: 4, category: 'educational_value', date: new Date('2024-01-18'), verified: true },
      { userId: 'teacher3', rating: 5, category: 'usability', date: new Date('2024-01-25'), verified: true }
    ],
    reviews: [
      {
        id: 'review1',
        userId: 'teacher1',
        rating: 5,
        title: 'Excellent for physics concepts',
        content: 'My students love exploring wave behavior and circuit simulations. The immediate visual feedback helps them understand abstract concepts.',
        pros: ['Visual feedback', 'Free access', 'Works offline'],
        cons: ['Limited customization'],
        useCase: 'Physics concept introduction',
        context: {
          gradeLevel: '9-12',
          subject: Subject.SCIENCE,
          classSize: 28,
          duration: '1 semester',
          setting: 'classroom'
        },
        helpfulVotes: 15,
        date: new Date('2024-01-20'),
        verified: true
      }
    ],
    implementations: [
      {
        id: 'impl1',
        title: 'Wave Phenomena Investigation',
        description: 'Students use wave simulation to investigate how frequency and amplitude affect wave behavior',
        alfStage: 'CATALYST',
        project: 'Sound and Music Engineering Challenge',
        outcomes: [
          'Students understand wave properties',
          'Improved scientific vocabulary',
          'Better grasp of mathematical relationships'
        ],
        challenges: ['Initial confusion with controls', 'Need for structured exploration'],
        solutions: ['Created guided worksheet', 'Peer mentoring system'],
        resources: ['PhET Wave simulation', 'Investigation worksheet', 'Reflection prompts'],
        timeline: '3 weeks',
        educator: 'Ms. Johnson',
        institution: 'Lincoln High School',
        studentsImpacted: 120,
        successMetrics: ['85% showed improved understanding on post-test', '95% engaged throughout activity'],
        artifactsUrl: 'https://example.com/wave-investigation',
        dateImplemented: new Date('2023-09-15')
      }
    ]
  },

  {
    id: 'scratch-programming',
    name: 'Scratch',
    description: 'Visual programming language and online community where young people can program interactive stories, games, and animations.',
    category: ToolCategory.CODING_ENVIRONMENT,
    type: ToolType.WEB_APPLICATION,
    url: 'https://scratch.mit.edu',
    version: '3.0',
    provider: {
      name: 'MIT Media Lab',
      type: 'educational',
      website: 'https://scratch.mit.edu',
      supportContact: 'https://scratch.mit.edu/contact-us/',
      reliability: 5,
      educationalFocus: true
    },
    subjects: [Subject.TECHNOLOGY, Subject.MATHEMATICS, Subject.ARTS, Subject.INTERDISCIPLINARY],
    skillLevel: SkillLevel.BEGINNER,
    ageRange: {
      min: 8,
      max: 16,
      description: 'Elementary through Middle School'
    },
    learningObjectives: [
      'Develop computational thinking skills',
      'Create interactive digital stories and games',
      'Learn programming concepts through visual blocks',
      'Express creativity through technology',
      'Collaborate and share projects with others'
    ],
    alfStageAlignment: {
      catalyst: {
        score: 5,
        rationale: 'Perfect for inspiring creativity and digital storytelling',
        examples: ['Create animated stories about social issues', 'Build games that explore mathematical concepts']
      },
      issues: {
        score: 4,
        rationale: 'Students can research and represent complex topics',
        examples: ['Create simulations of environmental systems', 'Build interactive presentations on historical events']
      },
      method: {
        score: 5,
        rationale: 'Ideal for iterative prototyping and development',
        examples: ['Rapidly prototype game mechanics', 'Test and refine interactive stories']
      },
      engagement: {
        score: 5,
        rationale: 'Strong community platform for sharing and feedback',
        examples: ['Publish projects to global community', 'Remix others work for collaborative learning']
      },
      overallAlignment: {
        score: 5,
        rationale: 'Excellent alignment with all ALF stages and creative process',
        examples: ['Supports full project lifecycle from ideation to community engagement']
      },
      specificUses: [
        'Digital storytelling and animation',
        'Game-based learning creation',
        'Mathematical visualization',
        'Art and music integration',
        'Community collaboration and sharing'
      ]
    },
    bloomsLevels: [BloomsLevel.APPLY, BloomsLevel.ANALYZE, BloomsLevel.EVALUATE, BloomsLevel.CREATE],
    platform: [Platform.WEB_BROWSER, Platform.WINDOWS, Platform.MACOS, Platform.LINUX, Platform.CHROMEBOOK],
    requirements: {
      minimumSpecs: {
        ram: '1GB',
        storage: '50MB',
        processor: 'Single-core 1GHz',
        graphics: 'Integrated graphics',
        operatingSystem: ['Windows 7+', 'macOS 10.10+', 'Linux', 'Chrome OS']
      },
      recommendedSpecs: {
        ram: '2GB',
        storage: '200MB',
        processor: 'Dual-core 1.5GHz',
        graphics: 'Integrated graphics',
        operatingSystem: ['Windows 10+', 'macOS 10.12+', 'Ubuntu 16.04+']
      },
      internetRequired: true,
      bandwidth: '1 Mbps minimum for smooth experience',
      specialHardware: [],
      browserRequirements: ['Chrome 63+', 'Firefox 57+', 'Safari 11+', 'Edge 15+']
    },
    integrationMethods: [IntegrationMethod.EMBED_IFRAME, IntegrationMethod.DIRECT_LINK, IntegrationMethod.EXPORT_IMPORT],
    apiAvailable: false,
    offlineCapable: false,
    licensing: {
      type: 'free',
      cost: {
        individual: 0,
        classroom: 0,
        school: 0,
        district: 0,
        currency: 'USD',
        billingPeriod: 'lifetime'
      },
      terms: 'Creative Commons Share Alike license',
      educationalDiscount: false,
      bulkPricing: false,
      trialAvailable: false,
      trialDuration: 0
    },
    costModel: 'free' as any,
    accessPermissions: ['public' as any],
    evaluation: {
      overallScore: 8.8,
      criteria: {
        educationalValue: { score: 5, weight: 1.5, notes: 'Excellent for developing computational thinking' },
        usability: { score: 4, weight: 1.2, notes: 'Very intuitive visual interface' },
        engagement: { score: 5, weight: 1.3, notes: 'Highly engaging for creative expression' },
        alfAlignment: { score: 5, weight: 1.4, notes: 'Perfect fit for project-based learning' },
        technicalQuality: { score: 4, weight: 1.0, notes: 'Generally stable with occasional performance issues' },
        accessibility: { score: 3, weight: 1.1, notes: 'Some accessibility features but room for improvement' },
        costEffectiveness: { score: 5, weight: 0.9, notes: 'Completely free with high educational value' },
        support: { score: 4, weight: 0.8, notes: 'Good community support and resources' }
      },
      strengths: [
        'Visual block-based programming',
        'Strong creative community',
        'Free and open access',
        'Extensive educational resources',
        'Cross-curricular applications'
      ],
      weaknesses: [
        'Requires internet connection',
        'Limited text-based programming transition',
        'Can be overwhelming for very young students'
      ],
      recommendedUse: [
        'Introduction to programming concepts',
        'Creative digital storytelling',
        'Game design and development',
        'Mathematical visualization projects'
      ],
      alternatives: ['Blockly', 'Tynker', 'Code.org', 'MakeCode'],
      lastEvaluated: new Date('2024-01-12'),
      evaluatorNotes: 'Outstanding tool for creative computing education'
    },
    accessibility: {
      wcagCompliance: {
        level: 'A',
        version: '2.1',
        auditDate: new Date('2023-08-15'),
        auditReport: 'https://scratch.mit.edu/accessibility'
      },
      screenReaderCompatible: false,
      keyboardNavigation: true,
      colorContrastAdequate: true,
      textSizeAdjustable: false,
      altTextSupport: true,
      captionsAvailable: false,
      languageSupport: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko'],
      accommodationFeatures: [
        'Keyboard navigation',
        'High contrast blocks',
        'Multiple language support'
      ],
      lastAssessed: new Date('2023-08-15'),
      certifications: []
    },
    pedagogicalAlignment: {
      constructivistLearning: { score: 5, rationale: 'Students build understanding through creating', examples: [] },
      collaborativeLearning: { score: 5, rationale: 'Strong community features for sharing and remixing', examples: [] },
      inquiryBasedLearning: { score: 4, rationale: 'Encourages experimentation and exploration', examples: [] },
      projectBasedLearning: { score: 5, rationale: 'Designed for project creation and development', examples: [] },
      authenticAssessment: { score: 4, rationale: 'Projects serve as authentic assessments of learning', examples: [] },
      differentiation: { score: 4, rationale: 'Multiple entry points and skill levels supported', examples: [] },
      universalDesign: { score: 3, rationale: 'Visual interface helps but accessibility could be better', examples: [] }
    },
    usageMetrics: {
      totalUsers: 90000000,
      activeUsers: 15000000,
      sessionDuration: 35,
      completionRate: 65,
      returnUsage: 55,
      errorRate: 3,
      lastUpdated: new Date('2024-01-28')
    },
    studentEngagement: {
      averageTimeOnTask: 42,
      interactionFrequency: 88,
      contentCompletion: 58,
      collaborationLevel: 4,
      creativityIndicators: ['original story creation', 'innovative game mechanics', 'artistic expression'],
      motivationFactors: ['creative freedom', 'community sharing', 'immediate visual feedback']
    },
    effectivenessData: {
      learningOutcomes: [
        {
          objective: 'Develop computational thinking skills',
          measurementMethod: 'Dr. Scratch assessment tool',
          achievementRate: 82,
          improvementData: 45,
          timeframe: '1 semester'
        }
      ],
      skillDevelopment: [
        {
          skill: 'Programming logic',
          beforeLevel: 1.5,
          afterLevel: 3.2,
          developmentTime: 30,
          retentionRate: 78
        }
      ],
      competencyGains: [
        {
          competency: 'Creative problem solving',
          initialAssessment: 2.8,
          finalAssessment: 4.1,
          growthRate: 1.3,
          transferability: 4
        }
      ],
      standardsAlignment: [
        {
          standard: 'CSTA K-12 Computer Science Standards',
          alignmentLevel: 'full',
          evidencePoints: ['Supports all five core concepts', 'Addresses computational thinking practices'],
          mappingConfidence: 5
        }
      ],
      evidenceBase: [
        'MIT research studies',
        'Educational impact assessments',
        'Teacher feedback surveys'
      ]
    },
    curatedBy: 'ALF Curation Team',
    curatedDate: new Date('2024-01-08'),
    lastReviewed: new Date('2024-01-28'),
    reviewStatus: ReviewStatus.APPROVED,
    tags: [
      'programming', 'coding', 'creativity', 'storytelling', 'games',
      'free', 'community', 'visual', 'K-12', 'computational-thinking'
    ],
    ratings: [
      { userId: 'teacher4', rating: 5, category: 'overall', date: new Date('2024-01-22'), verified: true },
      { userId: 'teacher5', rating: 4, category: 'engagement', date: new Date('2024-01-19'), verified: true },
      { userId: 'teacher6', rating: 5, category: 'educational_value', date: new Date('2024-01-26'), verified: true }
    ],
    reviews: [
      {
        id: 'review2',
        userId: 'teacher4',
        rating: 5,
        title: 'Perfect for project-based learning',
        content: 'Students create amazing projects that combine creativity with technical skills. The community aspect adds authentic audience for their work.',
        pros: ['Creative freedom', 'Community sharing', 'Cross-curricular potential'],
        cons: ['Needs internet', 'Can be overwhelming initially'],
        useCase: 'Digital storytelling projects',
        context: {
          gradeLevel: '4-8',
          subject: Subject.TECHNOLOGY,
          classSize: 24,
          duration: '1 year',
          setting: 'classroom'
        },
        helpfulVotes: 23,
        date: new Date('2024-01-22'),
        verified: true
      }
    ],
    implementations: [
      {
        id: 'impl2',
        title: 'Climate Change Awareness Game',
        description: 'Students create interactive games to educate peers about climate change impacts and solutions',
        alfStage: 'METHOD',
        project: 'Environmental Action Through Gaming',
        outcomes: [
          'Deep understanding of climate science',
          'Improved programming skills',
          'Enhanced peer education abilities'
        ],
        challenges: ['Complex topic simplification', 'Balancing fun with education'],
        solutions: ['Expert guest speakers', 'Iterative playtesting'],
        resources: ['Scratch platform', 'Climate data sources', 'Game design templates'],
        timeline: '6 weeks',
        educator: 'Mr. Chen',
        institution: 'Roosevelt Middle School',
        studentsImpacted: 75,
        successMetrics: ['100% project completion', 'Games played by 500+ community members'],
        artifactsUrl: 'https://example.com/climate-games',
        dateImplemented: new Date('2023-10-01')
      }
    ]
  },

  {
    id: 'figma-design',
    name: 'Figma',
    description: 'Collaborative design tool for creating user interfaces, prototypes, and digital designs with real-time collaboration features.',
    category: ToolCategory.DESIGN_TOOL,
    type: ToolType.WEB_APPLICATION,
    url: 'https://figma.com',
    version: '2024.1',
    provider: {
      name: 'Figma Inc.',
      type: 'commercial',
      website: 'https://figma.com',
      supportContact: 'https://help.figma.com',
      reliability: 4,
      educationalFocus: false
    },
    subjects: [Subject.ARTS, Subject.TECHNOLOGY, Subject.INTERDISCIPLINARY],
    skillLevel: SkillLevel.INTERMEDIATE,
    ageRange: {
      min: 12,
      max: 18,
      description: 'Middle School through High School'
    },
    learningObjectives: [
      'Develop digital design and prototyping skills',
      'Learn user experience (UX) design principles',
      'Practice collaborative design processes',
      'Create visual solutions to real-world problems',
      'Understand design thinking methodology'
    ],
    alfStageAlignment: {
      catalyst: {
        score: 4,
        rationale: 'Great for visualizing ideas and exploring design challenges',
        examples: ['Create mood boards for project inspiration', 'Design user journey maps for problem exploration']
      },
      issues: {
        score: 3,
        rationale: 'Can support research visualization and analysis',
        examples: ['Create infographics of research findings', 'Design stakeholder journey maps']
      },
      method: {
        score: 5,
        rationale: 'Excellent for iterative prototyping and design development',
        examples: ['Rapidly prototype app interfaces', 'Create and test multiple design solutions']
      },
      engagement: {
        score: 4,
        rationale: 'Strong collaboration features for sharing and feedback',
        examples: ['Present interactive prototypes to community', 'Collaborate with real clients on design projects']
      },
      overallAlignment: {
        score: 4,
        rationale: 'Strong fit for design-focused ALF projects',
        examples: ['Perfect for projects involving digital products or visual communication']
      },
      specificUses: [
        'User interface and experience design',
        'Digital prototyping and wireframing',
        'Visual communication and infographics',
        'Collaborative design processes',
        'Client presentation and feedback'
      ]
    },
    bloomsLevels: [BloomsLevel.APPLY, BloomsLevel.ANALYZE, BloomsLevel.EVALUATE, BloomsLevel.CREATE],
    platform: [Platform.WEB_BROWSER, Platform.WINDOWS, Platform.MACOS, Platform.LINUX],
    requirements: {
      minimumSpecs: {
        ram: '4GB',
        storage: '200MB',
        processor: 'Dual-core 2.0GHz',
        graphics: 'Integrated graphics',
        operatingSystem: ['Windows 10+', 'macOS 10.14+', 'Linux']
      },
      recommendedSpecs: {
        ram: '8GB',
        storage: '1GB',
        processor: 'Quad-core 2.5GHz',
        graphics: 'Dedicated graphics recommended',
        operatingSystem: ['Windows 11', 'macOS 11+', 'Ubuntu 20.04+']
      },
      internetRequired: true,
      bandwidth: '5 Mbps for smooth collaboration',
      specialHardware: ['Graphics tablet recommended for detailed design work'],
      browserRequirements: ['Chrome 88+', 'Firefox 85+', 'Safari 14+', 'Edge 88+']
    },
    integrationMethods: [IntegrationMethod.EMBED_IFRAME, IntegrationMethod.API_INTEGRATION, IntegrationMethod.DIRECT_LINK],
    apiAvailable: true,
    offlineCapable: false,
    licensing: {
      type: 'freemium',
      cost: {
        individual: 0,
        classroom: 0,
        school: 144,
        district: 1200,
        currency: 'USD',
        billingPeriod: 'yearly'
      },
      terms: 'Educational accounts available with verification',
      educationalDiscount: true,
      bulkPricing: true,
      trialAvailable: true,
      trialDuration: 30
    },
    costModel: 'freemium' as any,
    accessPermissions: ['public' as any, 'educator_only' as any],
    evaluation: {
      overallScore: 8.5,
      criteria: {
        educationalValue: { score: 4, weight: 1.5, notes: 'Excellent for design education and digital literacy' },
        usability: { score: 4, weight: 1.2, notes: 'Professional tool with learning curve' },
        engagement: { score: 5, weight: 1.3, notes: 'Highly engaging collaborative features' },
        alfAlignment: { score: 4, weight: 1.4, notes: 'Strong fit for design-thinking projects' },
        technicalQuality: { score: 5, weight: 1.0, notes: 'Professional-grade tool with robust features' },
        accessibility: { score: 3, weight: 1.1, notes: 'Some accessibility features but room for improvement' },
        costEffectiveness: { score: 4, weight: 0.9, notes: 'Free for education use but limited features' },
        support: { score: 4, weight: 0.8, notes: 'Good documentation and community resources' }
      },
      strengths: [
        'Professional-grade design capabilities',
        'Real-time collaboration features',
        'Free for educational use',
        'Extensive plugin ecosystem',
        'Industry-standard design tool'
      ],
      weaknesses: [
        'Steep learning curve for beginners',
        'Requires internet connection',
        'Limited features in free version',
        'Can be overwhelming for younger students'
      ],
      recommendedUse: [
        'High school design projects',
        'User experience design education',
        'Digital product prototyping',
        'Collaborative design challenges'
      ],
      alternatives: ['Adobe XD', 'Sketch', 'Canva', 'Penpot'],
      lastEvaluated: new Date('2024-01-14'),
      evaluatorNotes: 'Excellent professional tool requiring adequate support and training'
    },
    accessibility: {
      wcagCompliance: {
        level: 'A',
        version: '2.1',
        auditDate: new Date('2023-09-10'),
        auditReport: 'https://figma.com/accessibility'
      },
      screenReaderCompatible: false,
      keyboardNavigation: true,
      colorContrastAdequate: true,
      textSizeAdjustable: true,
      altTextSupport: true,
      captionsAvailable: false,
      languageSupport: ['en', 'es', 'fr', 'de', 'ja', 'ko'],
      accommodationFeatures: [
        'Keyboard shortcuts',
        'Zoom capabilities',
        'Color accessibility tools'
      ],
      lastAssessed: new Date('2023-09-10'),
      certifications: []
    },
    pedagogicalAlignment: {
      constructivistLearning: { score: 5, rationale: 'Students build understanding through design creation', examples: [] },
      collaborativeLearning: { score: 5, rationale: 'Built for real-time collaboration', examples: [] },
      inquiryBasedLearning: { score: 4, rationale: 'Supports design thinking and user research', examples: [] },
      projectBasedLearning: { score: 5, rationale: 'Perfect for design project workflows', examples: [] },
      authenticAssessment: { score: 4, rationale: 'Real design deliverables serve as assessment', examples: [] },
      differentiation: { score: 3, rationale: 'Professional tool may not suit all learners', examples: [] },
      universalDesign: { score: 3, rationale: 'Some accessibility features but primarily visual tool', examples: [] }
    },
    usageMetrics: {
      totalUsers: 4000000,
      activeUsers: 1500000,
      sessionDuration: 45,
      completionRate: 70,
      returnUsage: 80,
      errorRate: 2,
      lastUpdated: new Date('2024-01-26')
    },
    studentEngagement: {
      averageTimeOnTask: 52,
      interactionFrequency: 75,
      contentCompletion: 65,
      collaborationLevel: 5,
      creativityIndicators: ['original design solutions', 'innovative interactions', 'aesthetic refinement'],
      motivationFactors: ['professional tools', 'real-world relevance', 'collaborative creation']
    },
    effectivenessData: {
      learningOutcomes: [
        {
          objective: 'Develop design thinking skills',
          measurementMethod: 'Portfolio assessment rubric',
          achievementRate: 75,
          improvementData: 40,
          timeframe: '1 semester'
        }
      ],
      skillDevelopment: [
        {
          skill: 'Visual design',
          beforeLevel: 2.0,
          afterLevel: 3.8,
          developmentTime: 40,
          retentionRate: 82
        }
      ],
      competencyGains: [
        {
          competency: 'User experience design',
          initialAssessment: 1.8,
          finalAssessment: 3.5,
          growthRate: 1.7,
          transferability: 4
        }
      ],
      standardsAlignment: [
        {
          standard: 'ISTE Standards for Students',
          alignmentLevel: 'full',
          evidencePoints: ['Creative communicator', 'Innovative designer', 'Global collaborator'],
          mappingConfidence: 4
        }
      ],
      evidenceBase: [
        'Design portfolio assessments',
        'Industry partnership feedback',
        'Student reflection data'
      ]
    },
    curatedBy: 'ALF Curation Team',
    curatedDate: new Date('2024-01-05'),
    lastReviewed: new Date('2024-01-26'),
    reviewStatus: ReviewStatus.APPROVED,
    tags: [
      'design', 'prototyping', 'collaboration', 'UX', 'UI',
      'professional', 'creative', 'digital', 'high-school'
    ],
    ratings: [
      { userId: 'teacher7', rating: 4, category: 'overall', date: new Date('2024-01-24'), verified: true },
      { userId: 'teacher8', rating: 5, category: 'engagement', date: new Date('2024-01-21'), verified: true }
    ],
    reviews: [
      {
        id: 'review3',
        userId: 'teacher7',
        rating: 4,
        title: 'Professional tool for serious design education',
        content: 'Students love working with the same tools used in industry. The collaboration features make group projects seamless.',
        pros: ['Industry standard', 'Real-time collaboration', 'Professional results'],
        cons: ['Learning curve', 'Requires training', 'Internet dependent'],
        useCase: 'App design projects',
        context: {
          gradeLevel: '9-12',
          subject: Subject.TECHNOLOGY,
          classSize: 20,
          duration: '1 semester',
          setting: 'classroom'
        },
        helpfulVotes: 18,
        date: new Date('2024-01-24'),
        verified: true
      }
    ],
    implementations: [
      {
        id: 'impl3',
        title: 'Community App Design Challenge',
        description: 'Students design mobile apps to address local community needs through user research and iterative design',
        alfStage: 'METHOD',
        project: 'Digital Solutions for Community Problems',
        outcomes: [
          'Professional design portfolios',
          'User research skills',
          'Community problem awareness'
        ],
        challenges: ['Tool complexity', 'User research logistics'],
        solutions: ['Structured tutorials', 'Community partner coordination'],
        resources: ['Figma Education accounts', 'Design thinking worksheets', 'User interview guides'],
        timeline: '8 weeks',
        educator: 'Ms. Rodriguez',
        institution: 'Tech Valley High School',
        studentsImpacted: 60,
        successMetrics: ['4 apps selected for community implementation', '90% portfolio completion rate'],
        artifactsUrl: 'https://example.com/community-apps',
        dateImplemented: new Date('2023-11-01')
      }
    ]
  }
];

export const SAMPLE_TOOL_COLLECTIONS = [
  {
    id: 'stem-catalyst-collection',
    name: 'STEM Catalyst Tools',
    description: 'Interactive tools perfect for sparking curiosity and exploration in STEM subjects during the Catalyst stage of ALF projects.',
    purpose: 'Inspire and motivate students through hands-on STEM exploration',
    targetAudience: 'K-12 educators implementing STEM-focused ALF projects',
    alfAlignment: {
      catalyst: {
        score: 5,
        rationale: 'Specifically curated for inspiration and curiosity-building',
        examples: ['PhET simulations for physics phenomena', 'Interactive chemistry models']
      },
      issues: {
        score: 3,
        rationale: 'Some tools support deeper investigation',
        examples: ['Data analysis capabilities in select tools']
      },
      method: {
        score: 2,
        rationale: 'Limited prototyping capabilities',
        examples: ['Basic modeling features']
      },
      engagement: {
        score: 3,
        rationale: 'Some community sharing features',
        examples: ['Simulation sharing capabilities']
      },
      overallAlignment: {
        score: 4,
        rationale: 'Strong focus on Catalyst stage with some cross-stage utility',
        examples: ['Perfect for initial project phases']
      },
      specificUses: [
        'Concept introduction and exploration',
        'Phenomena observation and questioning',
        'Initial hypothesis formation',
        'Curiosity-driven investigation'
      ]
    },
    tools: ['phet-simulations'],
    learningPath: [
      {
        stepNumber: 1,
        title: 'Explore Phenomena',
        description: 'Students freely explore simulations to observe interesting phenomena',
        toolId: 'phet-simulations',
        objectives: ['Generate curiosity', 'Observe patterns', 'Form questions'],
        activities: ['Open exploration', 'Pattern recording', 'Question generation'],
        assessments: ['Question quality', 'Observation depth'],
        resources: ['Observation journals', 'Question prompts'],
        estimatedTime: '30-45 minutes',
        alfStage: 'CATALYST'
      },
      {
        stepNumber: 2,
        title: 'Focus Investigation',
        description: 'Use simulations to investigate specific aspects that sparked interest',
        toolId: 'phet-simulations',
        objectives: ['Deepen understanding', 'Test initial ideas'],
        activities: ['Guided exploration', 'Variable manipulation', 'Hypothesis testing'],
        assessments: ['Investigation design', 'Data collection'],
        resources: ['Investigation templates', 'Data collection sheets'],
        estimatedTime: '45-60 minutes',
        alfStage: 'CATALYST'
      }
    ],
    prerequisites: ['Basic computer navigation skills', 'Scientific inquiry introduction'],
    estimatedDuration: '1-2 class periods',
    difficulty: SkillLevel.BEGINNER,
    tags: ['STEM', 'catalyst', 'exploration', 'simulation', 'K-12'],
    curatedBy: 'STEM Education Specialist',
    createdDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-30'),
    usageCount: 45,
    rating: 4.7
  }
];

export default SAMPLE_TOOLS;