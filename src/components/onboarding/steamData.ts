/**
 * STEAM Subjects Data
 * Rich examples and configuration for project onboarding
 */

import {
  Flask,
  Laptop,
  Cog,
  Palette,
  Calculator,
  Globe,
  BookOpen,
  Languages,
  Heart,
  Sparkles,
  Users,
  Lightbulb,
  Atom,
  Binary,
  Compass,
  Music,
  Camera,
  Microscope,
  Rocket,
  Building,
  Brush,
  TrendingUp,
  Target
} from 'lucide-react';

export interface SubjectExample {
  title: string;
  description: string;
  tags: string[];
  trending?: boolean;
}

export interface SubjectInfo {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  gradient: string;
  examples: SubjectExample[];
  commonMaterials: string[];
  currentEvents: string[];
}

export interface GradeBand {
  id: string;
  name: string;
  ageRange: string;
  icon: any;
  description: string;
  color: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon: any;
  items: string[];
  color: string;
}

export const STEAM_SUBJECTS: SubjectInfo[] = [
  {
    id: 'science',
    name: 'Science',
    tagline: 'Discover, experiment, understand',
    icon: Flask,
    gradient: 'from-emerald-400 to-teal-600',
    examples: [
      {
        title: 'Climate Change Solutions Lab',
        description: 'Students design and test renewable energy systems while studying environmental science',
        tags: ['Environmental Science', 'Engineering', 'Data Analysis'],
        trending: true
      },
      {
        title: 'Genetics & Bioethics Symposium',
        description: 'Explore CRISPR technology while debating ethical implications of gene editing',
        tags: ['Biology', 'Ethics', 'Current Events']
      },
      {
        title: 'Space Mission Planning',
        description: 'Design a Mars colony while learning physics, chemistry, and biology principles',
        tags: ['Physics', 'Chemistry', 'Engineering'],
        trending: true
      },
      {
        title: 'Pandemic Preparedness Simulation',
        description: 'Model disease spread and design public health interventions',
        tags: ['Biology', 'Statistics', 'Public Health']
      }
    ],
    commonMaterials: ['Microscopes', 'Lab Equipment', 'Sensors', 'Safety Gear', 'Digital Probes'],
    currentEvents: ['Climate Change', 'Space Exploration', 'Vaccine Development', 'AI in Healthcare']
  },
  {
    id: 'technology',
    name: 'Technology',
    tagline: 'Code, create, innovate',
    icon: Laptop,
    gradient: 'from-blue-400 to-indigo-600',
    examples: [
      {
        title: 'AI Ethics Chatbot',
        description: 'Build a conversational AI while exploring bias, privacy, and ethical implications',
        tags: ['AI/ML', 'Ethics', 'Programming'],
        trending: true
      },
      {
        title: 'Cybersecurity Defense Game',
        description: 'Create an interactive game teaching digital citizenship and online safety',
        tags: ['Cybersecurity', 'Game Design', 'Digital Citizenship']
      },
      {
        title: 'Smart City Dashboard',
        description: 'Design IoT solutions for urban challenges using real city data',
        tags: ['IoT', 'Data Visualization', 'Urban Planning'],
        trending: true
      },
      {
        title: 'Blockchain Voting System',
        description: 'Explore democracy and transparency through blockchain technology',
        tags: ['Blockchain', 'Civics', 'Cryptography']
      }
    ],
    commonMaterials: ['Computers', 'Microcontrollers', 'Sensors', 'Breadboards', 'Software Licenses'],
    currentEvents: ['AI Revolution', 'Quantum Computing', 'Digital Privacy', 'Metaverse Development']
  },
  {
    id: 'engineering',
    name: 'Engineering',
    tagline: 'Design, build, solve',
    icon: Cog,
    gradient: 'from-orange-400 to-red-600',
    examples: [
      {
        title: 'Disaster Relief Shelter',
        description: 'Engineer emergency housing solutions using sustainable materials and principles',
        tags: ['Civil Engineering', 'Sustainability', 'Crisis Response'],
        trending: true
      },
      {
        title: 'Assistive Technology Design',
        description: 'Create devices to improve accessibility and quality of life for people with disabilities',
        tags: ['Biomedical Engineering', 'Accessibility', 'User-Centered Design']
      },
      {
        title: 'Water Purification System',
        description: 'Design filtration systems for communities lacking clean water access',
        tags: ['Environmental Engineering', 'Chemistry', 'Global Issues']
      },
      {
        title: 'Autonomous Vehicle Ethics',
        description: 'Program decision-making algorithms for self-driving cars',
        tags: ['Robotics', 'Ethics', 'Programming'],
        trending: true
      }
    ],
    commonMaterials: ['Building Materials', '3D Printer', 'Tools', 'CAD Software', 'Prototyping Supplies'],
    currentEvents: ['Sustainable Design', 'Infrastructure Crisis', 'Green Technology', 'Smart Cities']
  },
  {
    id: 'arts',
    name: 'Arts',
    tagline: 'Express, inspire, transform',
    icon: Palette,
    gradient: 'from-purple-400 to-pink-600',
    examples: [
      {
        title: 'Digital Storytelling for Social Justice',
        description: 'Create multimedia narratives addressing community issues and solutions',
        tags: ['Digital Media', 'Social Justice', 'Community Engagement'],
        trending: true
      },
      {
        title: 'Cultural Heritage VR Experience',
        description: 'Design virtual reality tours of historical sites and cultural landmarks',
        tags: ['VR/AR', 'History', 'Cultural Studies']
      },
      {
        title: 'Music & Math Visualization',
        description: 'Explore mathematical patterns in music through visual and audio compositions',
        tags: ['Music', 'Mathematics', 'Data Visualization']
      },
      {
        title: 'Theater for Change',
        description: 'Write and perform plays addressing current social and environmental issues',
        tags: ['Theater', 'Social Issues', 'Creative Writing'],
        trending: true
      }
    ],
    commonMaterials: ['Art Supplies', 'Digital Tools', 'Recording Equipment', 'Cameras', 'Performance Space'],
    currentEvents: ['Digital Art Revolution', 'Cultural Preservation', 'Arts & Activism', 'AI in Creativity']
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    tagline: 'Calculate, model, predict',
    icon: Calculator,
    gradient: 'from-cyan-400 to-blue-600',
    examples: [
      {
        title: 'Pandemic Modeling & Prediction',
        description: 'Use statistical models to understand disease spread and intervention effectiveness',
        tags: ['Statistics', 'Epidemiology', 'Data Science'],
        trending: true
      },
      {
        title: 'Financial Literacy & Investing',
        description: 'Analyze market trends and develop personal financial planning strategies',
        tags: ['Statistics', 'Economics', 'Personal Finance']
      },
      {
        title: 'Sports Analytics Dashboard',
        description: 'Apply mathematical concepts to analyze athletic performance and team strategies',
        tags: ['Statistics', 'Data Analysis', 'Sports Science']
      },
      {
        title: 'Cryptography & Code Breaking',
        description: 'Explore number theory and algorithms through historical and modern encryption',
        tags: ['Number Theory', 'Algorithms', 'History'],
        trending: true
      }
    ],
    commonMaterials: ['Graphing Calculators', 'Statistical Software', 'Data Sets', 'Computers', 'Math Manipulatives'],
    currentEvents: ['Big Data', 'Cryptocurrency', 'AI Algorithms', 'Climate Modeling']
  },
  {
    id: 'social-studies',
    name: 'Social Studies',
    tagline: 'Understand, analyze, participate',
    icon: Globe,
    gradient: 'from-amber-400 to-orange-600',
    examples: [
      {
        title: 'Model United Nations Climate Summit',
        description: 'Negotiate international climate agreements while learning about global cooperation',
        tags: ['International Relations', 'Environmental Policy', 'Debate'],
        trending: true
      },
      {
        title: 'Immigration Stories Documentary',
        description: 'Research and document local immigration experiences throughout history',
        tags: ['History', 'Sociology', 'Digital Storytelling']
      },
      {
        title: 'Economic Inequality Analysis',
        description: 'Investigate local economic patterns and propose policy solutions',
        tags: ['Economics', 'Statistics', 'Policy Analysis'],
        trending: true
      },
      {
        title: 'Digital Democracy Platform',
        description: 'Design online platforms for civic engagement and democratic participation',
        tags: ['Civics', 'Technology', 'Political Science']
      }
    ],
    commonMaterials: ['Primary Sources', 'Research Databases', 'Interview Equipment', 'Maps', 'Presentation Tools'],
    currentEvents: ['Global Democracy', 'Climate Justice', 'Economic Inequality', 'Digital Rights']
  },
  {
    id: 'language-arts',
    name: 'Language Arts',
    tagline: 'Read, write, communicate',
    icon: BookOpen,
    gradient: 'from-rose-400 to-red-600',
    examples: [
      {
        title: 'Podcast for Social Change',
        description: 'Create compelling audio narratives about community issues and solutions',
        tags: ['Journalism', 'Audio Production', 'Social Issues'],
        trending: true
      },
      {
        title: 'Interactive Fiction Game',
        description: 'Write branching narratives that explore ethical dilemmas and consequences',
        tags: ['Creative Writing', 'Game Design', 'Ethics']
      },
      {
        title: 'Poetry & Data Visualization',
        description: 'Transform statistical data into poetic narratives about social issues',
        tags: ['Poetry', 'Data Analysis', 'Creative Expression']
      },
      {
        title: 'Multilingual Community Magazine',
        description: 'Publish stories reflecting the diverse voices and experiences in your community',
        tags: ['Journalism', 'Cultural Studies', 'Community Engagement'],
        trending: true
      }
    ],
    commonMaterials: ['Books', 'Writing Tools', 'Recording Equipment', 'Publishing Software', 'Research Materials'],
    currentEvents: ['Media Literacy', 'Digital Storytelling', 'Language Preservation', 'Information Age']
  },
  {
    id: 'world-languages',
    name: 'World Languages',
    tagline: 'Connect, communicate, bridge cultures',
    icon: Languages,
    gradient: 'from-violet-400 to-purple-600',
    examples: [
      {
        title: 'Global Pen Pal Climate Project',
        description: 'Partner with international schools to share climate experiences in multiple languages',
        tags: ['Cultural Exchange', 'Environmental Issues', 'Communication'],
        trending: true
      },
      {
        title: 'Translation & Immigration Services',
        description: 'Provide translation services for local immigrant communities',
        tags: ['Community Service', 'Cultural Competency', 'Service Learning']
      },
      {
        title: 'International Business Simulation',
        description: 'Conduct business negotiations in target languages with global economic contexts',
        tags: ['Business', 'Economics', 'Cultural Studies']
      },
      {
        title: 'Cultural Heritage Preservation',
        description: 'Document and share endangered languages and cultural practices',
        tags: ['Cultural Studies', 'Digital Preservation', 'Anthropology'],
        trending: true
      }
    ],
    commonMaterials: ['Language Resources', 'Recording Equipment', 'Communication Platforms', 'Cultural Artifacts', 'Translation Tools'],
    currentEvents: ['Global Communication', 'Cultural Preservation', 'Immigration', 'International Cooperation']
  },
  {
    id: 'health-pe',
    name: 'Health & PE',
    tagline: 'Move, grow, thrive',
    icon: Heart,
    gradient: 'from-green-400 to-emerald-600',
    examples: [
      {
        title: 'Community Health Assessment',
        description: 'Research local health disparities and design intervention programs',
        tags: ['Public Health', 'Research', 'Community Engagement'],
        trending: true
      },
      {
        title: 'Mental Health Awareness Campaign',
        description: 'Create peer support resources and reduce mental health stigma',
        tags: ['Mental Health', 'Social Issues', 'Peer Support']
      },
      {
        title: 'Adaptive Sports Program',
        description: 'Design inclusive athletic activities for people with varying abilities',
        tags: ['Adaptive Sports', 'Inclusion', 'Program Design'],
        trending: true
      },
      {
        title: 'Nutrition & Food Justice',
        description: 'Investigate food access issues and promote nutritional equity',
        tags: ['Nutrition', 'Social Justice', 'Community Health']
      }
    ],
    commonMaterials: ['Fitness Equipment', 'Health Monitoring Devices', 'Sports Gear', 'Safety Equipment', 'Educational Materials'],
    currentEvents: ['Mental Health Crisis', 'Health Equity', 'Fitness Technology', 'Wellness Trends']
  },
  {
    id: 'cross-curricular',
    name: 'Cross-Curricular',
    tagline: 'Integrate, synthesize, innovate',
    icon: Sparkles,
    gradient: 'from-indigo-400 to-purple-600',
    examples: [
      {
        title: 'Sustainable School Redesign',
        description: 'Integrate architecture, environmental science, economics, and social studies to redesign your school',
        tags: ['Sustainability', 'Design Thinking', 'Systems Thinking'],
        trending: true
      },
      {
        title: 'Local History Interactive Museum',
        description: 'Combine history, technology, art, and community engagement to create a digital museum',
        tags: ['History', 'Technology', 'Arts', 'Community']
      },
      {
        title: 'Food Systems & Justice',
        description: 'Explore the intersection of agriculture, economics, health, and social justice',
        tags: ['Systems Thinking', 'Social Justice', 'Science', 'Economics']
      },
      {
        title: 'Future Cities Challenge',
        description: 'Design sustainable cities using engineering, environmental science, economics, and social studies',
        tags: ['Future Planning', 'Sustainability', 'Urban Design', 'Technology'],
        trending: true
      }
    ],
    commonMaterials: ['Varied by Project', 'Collaboration Tools', 'Research Resources', 'Presentation Materials', 'Design Software'],
    currentEvents: ['Interdisciplinary Solutions', 'Systems Thinking', 'Complex Problem Solving', 'Innovation']
  }
];

export const GRADE_BANDS: GradeBand[] = [
  {
    id: 'elementary',
    name: 'Elementary',
    ageRange: 'Ages 5-10 (K-5)',
    icon: Users,
    description: 'Hands-on exploration and wonder-based learning',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'middle',
    name: 'Middle School',
    ageRange: 'Ages 11-13 (6-8)',
    icon: Target,
    description: 'Identity development and collaborative investigation',
    color: 'from-green-400 to-teal-500'
  },
  {
    id: 'high',
    name: 'High School',
    ageRange: 'Ages 14-18 (9-12)',
    icon: TrendingUp,
    description: 'Real-world application and future preparation',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'college',
    name: 'College+',
    ageRange: 'Ages 18+ (College/Adult)',
    icon: Lightbulb,
    description: 'Advanced synthesis and professional application',
    color: 'from-purple-400 to-pink-500'
  }
];

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'digital',
    name: 'Digital Tools',
    icon: Laptop,
    color: 'blue',
    items: [
      'Computers/Tablets', 'Software Licenses', 'Online Platforms', 
      'Digital Cameras', 'Microphones', 'Sensors', 'VR/AR Equipment'
    ]
  },
  {
    id: 'physical',
    name: 'Physical Materials',
    icon: Building,
    color: 'orange',
    items: [
      'Building Supplies', 'Art Materials', 'Lab Equipment', 
      'Tools', 'Safety Gear', 'Sports Equipment', 'Craft Supplies'
    ]
  },
  {
    id: 'research',
    name: 'Research Resources',
    icon: BookOpen,
    color: 'green',
    items: [
      'Books & Articles', 'Primary Sources', 'Databases', 
      'Interview Subjects', 'Field Trip Locations', 'Expert Contacts'
    ]
  },
  {
    id: 'presentation',
    name: 'Presentation & Sharing',
    icon: Users,
    color: 'purple',
    items: [
      'Display Materials', 'Presentation Software', 'Publishing Tools', 
      'Exhibition Space', 'Community Venues', 'Social Media Platforms'
    ]
  }
];

export const PROJECT_DURATIONS = [
  { id: '1-2weeks', label: 'Quick Sprint', description: '1-2 weeks', icon: Rocket },
  { id: '3-4weeks', label: 'Standard Project', description: '3-4 weeks', icon: Target },
  { id: '5-8weeks', label: 'Deep Dive', description: '5-8 weeks', icon: Microscope },
  { id: 'semester', label: 'Semester Long', description: '12+ weeks', icon: Building }
];

export const LEARNING_ENVIRONMENTS = [
  { id: 'classroom', label: 'Traditional Classroom', icon: BookOpen, color: 'blue' },
  { id: 'lab', label: 'Lab/Makerspace', icon: Flask, color: 'green' },
  { id: 'field', label: 'Field/Community', icon: Compass, color: 'orange' },
  { id: 'hybrid', label: 'Hybrid Learning', icon: Binary, color: 'purple' },
  { id: 'remote', label: 'Fully Remote', icon: Globe, color: 'cyan' }
];