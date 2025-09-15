// Hero Project Data Types - Complete architecture for data-driven hero projects

// Course Abstract Structure
export interface CourseAbstract {
  overview: string;
  learningObjectives: string[];
  prerequisites: string[];
  methodology: string;
  expectedOutcomes: string[];
}

export interface HeroProjectData {
  // Core Metadata
  id: string;
  title: string;
  tagline: string;
  duration: string;
  gradeLevel: string;
  subjects: string[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };

  // Course Abstract
  courseAbstract: CourseAbstract;

  // Hero Header
  hero: {
    badge: string;
    description: string;
    highlights: Array<{
      icon: string;
      label: string;
      value: string;
    }>;
    impactStatement: string;
  };

  // Rich Context
  context: {
    problem: string;
    significance: string;
    realWorld: string;
    studentRole: string;
    authenticity: string;
  };

  // Comprehensive Overview
  overview: {
    description: string;
    keyFeatures: string[];
    outcomes: string[];
    deliverables: Array<{
      name: string;
      description: string;
      format: string;
    }>;
  };

  // Big Idea & Essential Questions
  bigIdea: {
    statement: string;
    essentialQuestion: string;
    subQuestions: string[];
    challenge: string;
    drivingQuestion: string;
  };

  // Learning Objectives & Standards
  standards: {
    objectives: Array<{
      category: string;
      items: string[];
    }>;
    alignments: {
      [family: string]: Array<{
        code: string;
        text: string;
        application: string;
        depth: 'introduce' | 'develop' | 'master';
      }>;
    };
  };

  // Project Journey
  journey: {
    phases: Phase[];
    milestones: Milestone[];
    timeline: TimelineEvent[];
    weeklyBreakdown: WeekBreakdown[];
  };

  // Assessment Framework
  assessment: {
    philosophy: string;
    rubric: RubricCriteria[];
    formative: FormativeAssessment[];
    summative: SummativeAssessment[];
    selfAssessment: SelfAssessmentTool[];
    peerAssessment: PeerAssessmentProtocol[];
  };

  // Resources & Materials
  resources: {
    required: Resource[];
    optional: Resource[];
    professional: ProfessionalResource[];
    studentResources: StudentResource[];
    communityConnections: CommunityResource[];
  };

  // Impact & Audience
  impact: {
    audience: AudienceProfile;
    methods: DeliveryMethod[];
    metrics: SuccessMetric[];
    sustainability: SustainabilityPlan;
    scalability: ScalabilityFramework;
  };

  // Implementation Support
  implementation: {
    gettingStarted: GettingStartedGuide;
    weeklyReflections: ReflectionPrompts[];
    troubleshooting: TroubleshootingGuide;
    modifications: DifferentiationStrategies;
    extensions: ExtensionActivities;
    technologyIntegration: TechIntegrationPlan;
  };

  // Teacher Support
  teacherSupport: {
    lessonPlans: LessonPlan[];
    facilitation: FacilitationGuide;
    professionaldevelopment: ProfessionalDevelopment;
    parentCommunication: ParentCommunicationKit;
  };

  // Student Support
  studentSupport: {
    projectGuide: StudentProjectGuide;
    researchProtocol: ResearchProtocol;
    collaborationTools: CollaborationFramework;
    presentationSupport: PresentationResources;
  };

  // Rich Media & Visuals
  media: {
    headerImage?: string;
    galleryImages?: string[];
    videos?: VideoResource[];
    infographics?: InfographicResource[];
    examples?: ExampleWork[];
  };
}

// Phase Structure with full detail
export interface Phase {
  id: string;
  name: string;
  duration: string;
  focus: string;
  description: string;
  objectives: string[];
  activities: Activity[];
  deliverables: string[];
  checkpoints: Checkpoint[];
  resources: string[];
  teacherNotes: string;
  studentTips: string;
}

// Activity within a phase
export interface Activity {
  name: string;
  type: 'individual' | 'group' | 'class' | 'field';
  duration: string;
  description: string;
  materials: string[];
  instructions: string[];
  differentiation: {
    support: string[];
    extension: string[];
  };
  assessment: string;
}

// Milestone tracking
export interface Milestone {
  id: string;
  phase: string;
  week: number;
  title: string;
  description: string;
  evidence: string[];
  celebration: string;
}

// Timeline visualization
export interface TimelineEvent {
  week: number;
  phase: string;
  title: string;
  activities: string[];
  deliverable?: string;
  assessment?: string;
}

// Weekly breakdown
export interface WeekBreakdown {
  week: number;
  theme: string;
  objectives: string[];
  mondayFriday: DailyPlan[];
  homework?: string;
  parentUpdate?: string;
}

// Daily planning
export interface DailyPlan {
  day: string;
  warmUp: string;
  mainActivity: string;
  closure: string;
  materials: string[];
  time: string;
}

// Rubric criteria
export interface RubricCriteria {
  category: string;
  weight: number;
  exemplary: RubricLevel;
  proficient: RubricLevel;
  developing: RubricLevel;
  beginning: RubricLevel;
}

// Rubric level detail
export interface RubricLevel {
  points: number;
  description: string;
  evidence: string[];
}

// Formative assessment
export interface FormativeAssessment {
  name: string;
  type: string;
  frequency: string;
  purpose: string;
  method: string;
  feedback: string;
}

// Summative assessment
export interface SummativeAssessment {
  name: string;
  type: string;
  timing: string;
  format: string;
  criteria: string[];
  weight: number;
}

// Self assessment tools
export interface SelfAssessmentTool {
  name: string;
  frequency: string;
  format: string;
  prompts: string[];
  reflection: string;
}

// Peer assessment
export interface PeerAssessmentProtocol {
  name: string;
  structure: string;
  guidelines: string[];
  feedbackForm: string;
}

// Resource types
export interface Resource {
  name: string;
  type: 'material' | 'technology' | 'space' | 'human';
  quantity?: string;
  source?: string;
  cost?: string;
  alternatives?: string[];
}

// Professional resources
export interface ProfessionalResource {
  title: string;
  type: 'article' | 'book' | 'video' | 'course' | 'website';
  link?: string;
  description: string;
  alignment: string;
}

// Student resources
export interface StudentResource {
  name: string;
  type: string;
  ageAppropriate: boolean;
  link?: string;
  description: string;
  scaffolding?: string;
}

// Community resources
export interface CommunityResource {
  organization: string;
  contactPerson?: string;
  role: string;
  contribution: string;
  scheduling: string;
}

// Audience profile
export interface AudienceProfile {
  primary: string[];
  secondary: string[];
  global?: string[];
  engagement: string;
  feedback: string;
}

// Delivery methods
export interface DeliveryMethod {
  method: string;
  format: string;
  venue?: string;
  technology?: string[];
  preparation: string[];
}

// Success metrics
export interface SuccessMetric {
  metric: string;
  target: string;
  measurement: string;
  timeline: string;
  evidence: string;
}

// Sustainability planning
export interface SustainabilityPlan {
  continuation: string;
  maintenance: string;
  evolution: string;
  legacy: string;
}

// Scalability framework
export interface ScalabilityFramework {
  classroom: string;
  school: string;
  district: string;
  beyond: string;
}

// Getting started guide
export interface GettingStartedGuide {
  overview: string;
  prerequisites: string[];
  firstWeek: string[];
  commonMistakes: string[];
  quickWins: string[];
}

// Reflection prompts
export interface ReflectionPrompts {
  week: number;
  studentPrompts: string[];
  teacherPrompts: string[];
  parentPrompts?: string[];
}

// Troubleshooting guide
export interface TroubleshootingGuide {
  challenges: Array<{
    issue: string;
    signs: string[];
    solutions: string[];
    prevention: string;
  }>;
}

// Differentiation strategies
export interface DifferentiationStrategies {
  advancedLearners: DifferentiationTier;
  onLevelLearners: DifferentiationTier;
  strugglingLearners: DifferentiationTier;
  englishLearners: DifferentiationTier;
  specialEducation: DifferentiationTier;
}

// Differentiation tier
export interface DifferentiationTier {
  modifications: string[];
  scaffolds: string[];
  extensions: string[];
  assessmentAdaptations: string[];
}

// Extension activities
export interface ExtensionActivities {
  earlyFinishers: string[];
  summerProjects: string[];
  competitionOpportunities: string[];
  independentStudy: string[];
}

// Technology integration
export interface TechIntegrationPlan {
  required: TechTool[];
  optional: TechTool[];
  alternatives: TechAlternative[];
  digitalCitizenship: string[];
}

// Tech tools
export interface TechTool {
  name: string;
  purpose: string;
  freeVersion: boolean;
  training: string;
  studentAccounts: boolean;
}

// Tech alternatives
export interface TechAlternative {
  ifNo: string;
  then: string;
  modifications: string[];
}

// Lesson plans
export interface LessonPlan {
  week: number;
  day: number;
  title: string;
  duration: string;
  objectives: string[];
  materials: string[];
  procedures: LessonProcedure[];
  assessment: string;
  homework?: string;
  notes: string;
}

// Lesson procedures
export interface LessonProcedure {
  time: string;
  activity: string;
  grouping: 'individual' | 'pairs' | 'small groups' | 'whole class';
  teacherRole: string;
  studentRole: string;
}

// Facilitation guide
export interface FacilitationGuide {
  philosophy: string;
  keyStrategies: string[];
  questioningTechniques: string[];
  groupManagement: string[];
  conflictResolution: string[];
}

// Professional development
export interface ProfessionalDevelopment {
  preLaunch: string[];
  duringProject: string[];
  postProject: string[];
  resources: string[];
  community: string;
}

// Parent communication
export interface ParentCommunicationKit {
  introLetter: string;
  weeklyUpdates: boolean;
  volunteerOpportunities: string[];
  homeExtensions: string[];
  showcaseInvitation: string;
}

// Student project guide
export interface StudentProjectGuide {
  overview: string;
  timeline: string;
  expectations: string[];
  resources: string[];
  tips: string[];
}

// Research protocol
export interface ResearchProtocol {
  guidelines: string[];
  credibleSources: string[];
  citationFormat: string;
  factChecking: string[];
  ethics: string[];
}

// Collaboration framework
export interface CollaborationFramework {
  teamFormation: string;
  roles: string[];
  norms: string[];
  conflictResolution: string[];
  communication: string[];
}

// Presentation resources
export interface PresentationResources {
  formats: string[];
  rubric: string;
  speakingTips: string[];
  visualAids: string[];
  practice: string;
}

// Media resources
export interface VideoResource {
  title: string;
  url: string;
  duration: string;
  purpose: string;
}

export interface InfographicResource {
  title: string;
  url?: string;
  description: string;
  usage: string;
}

export interface ExampleWork {
  title: string;
  description: string;
  url?: string;
  grade: string;
  highlights: string[];
}

// Checkpoint for progress tracking
export interface Checkpoint {
  name: string;
  criteria: string[];
  evidence: string[];
  support: string;
}