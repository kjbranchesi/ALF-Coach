/**
 * ALF Coach Project Types
 * Core types for project-based learning blueprints
 */

// Base types
export type ID = string;
export type ISODate = string; // YYYY-MM-DD format

// Content tier system for transparency
export type Tier = 'core' | 'scaffold' | 'aspirational';

// Wrapper type to add tier metadata to any type
export type Tiered<T> = T & { 
  tier: Tier; 
  confidence?: number; // 0-1 confidence score
};

// Schedule types
export type ScheduleType = 'traditional' | 'block' | 'hybrid' | 'flexible';

// Tech access levels
export type TechAccess = 'full' | 'limited' | 'minimal' | 'none';

// Standards frameworks
export type StandardsFramework = 'NGSS' | 'CCSS-ELA' | 'CCSS-MATH' | 'STATE' | 'IB' | 'CUSTOM';

// Special populations
export type SpecialPopulation = 'IEP' | '504' | 'ELL' | 'Gifted' | 'Other';

// Project context - classroom details
export interface ProjectContext {
  grade: string;
  subjects: string[];
  primarySubject: string;
  classSize?: number;
  timeWindow?: {
    start: ISODate;
    end: ISODate;
    totalWeeks: number;
  };
  schedule?: ScheduleType;
  constraints?: {
    budgetUSD?: number;
    techAccess: TechAccess;
    materials?: string[];
    specialPopulations?: SpecialPopulation[];
    safetyRequirements?: string[];
  };
}

// Standards alignment
export interface Standard {
  id: ID;
  framework: StandardsFramework;
  code: string;        // e.g., MS-ESS3-3
  label: string;       // human-readable
  description?: string;
  rationale: string;   // why it fits this project
}

// Standards coverage mapping
export interface StandardsCoverage {
  standardId: ID;
  milestoneId: ID;
  phaseId?: ID;
  emphasis: 'introduce' | 'develop' | 'master';
}

// Project phases
export interface Phase {
  id: ID;
  name: string;        // Discover | Plan | Create | Share | Reflect
  start?: ISODate;
  end?: ISODate;
  duration?: string;   // e.g., "1 week"
  goals: string[];
  activities?: string[];
  deliverables?: ID[]; // References to artifact IDs
  checkpoints?: ID[];  // References to checkpoint IDs
}

// Milestones
export interface Milestone {
  id: ID;
  name: string;
  phaseId: ID;
  due?: ISODate;
  owner: 'student' | 'team' | 'teacher' | 'partner';
  description?: string;
  evidence: string[];
}

// Artifacts/deliverables
export interface Artifact {
  id: ID;
  name: string;
  description: string;
  milestoneId: ID;
  rubricIds: ID[];     // Can have multiple rubrics
  exemplar?: string;   // Link or description
}

// Rubric scale levels
export interface ScaleLevel {
  value: number;       // 1..4, 0..3, etc.
  label: string;       // e.g., "Proficient"
  descriptor: string;  // Performance description
}

// Rubric criteria
export interface RubricCriterion {
  id: ID;
  name: string;
  description?: string;
  levels: ScaleLevel[];    // At least 3-4 levels
  weight?: number;         // 0..1 or percentage
  standardsAlignment?: ID[]; // Links to standard IDs
}

// Rubrics
export interface Rubric {
  id: ID;
  name: string;
  criteria: RubricCriterion[];
  scaleLabel?: '0-3' | '1-4' | '1-5' | 'custom';
  totalPoints?: number;
  useStudentLanguage?: boolean;
  exemplars?: {
    levelValue: number;
    description: string;
    link?: string;
  }[];
}

// Student roles
export interface Role {
  id: ID;
  name: string;            // e.g., "Communications Lead"
  responsibilities: string[];
}

// Differentiation/UDL
export interface Differentiation {
  tieredAssignments?: {
    level: string;
    modifications: string[];
  }[];
  udlStrategies?: {
    representation: string[];  // Multiple means of representation
    action: string[];          // Multiple means of action/expression
    engagement: string[];      // Multiple means of engagement
  };
  languageSupports?: string[];
  executiveFunctionSupports?: string[];
  accommodations?: string[];    // IEP/504 specific
  multilingual?: {
    languages: string[];
    strategies: string[];
  };
}

// Scaffolds
export interface Scaffold {
  id: ID;
  name: string;
  description: string;
  templateLink?: string;
}

// Communications
export interface CommunicationDoc {
  id: ID;
  audience: 'family' | 'admin' | 'partner' | 'community';
  subject: string;
  body: string;                 // Markdown supported
  delivery: 'email' | 'letter' | 'lms' | 'website' | 'other';
  updateSchedule?: string;
}

// Exhibition/showcase
export interface Exhibition {
  format: 'gallery' | 'pitch' | 'panel' | 'festival' | 'online' | 'other';
  audience: string[];
  date?: ISODate;
  venue?: string;
  location?: string;
  preparation: string[];
}

// Evidence items
export interface EvidenceItem {
  id: ID;
  name: string;
  type: 'photo' | 'video' | 'doc' | 'artifact' | 'reflection' | 'observation';
  storage: {
    location: 'drive' | 'lms' | 'local' | 'portfolio' | 'other';
    path?: string;
  };
  linkedArtifactId?: ID;
}

// Checkpoints
export interface Checkpoint {
  id: ID;
  milestoneId: ID;
  when?: ISODate;
  type: string;
  evidence: EvidenceItem[];
  assessment?: {
    rubricId?: ID;
    criterionIds?: ID[];
  };
  notes?: string;
}

// Evidence capture plan
export interface EvidencePlan {
  checkpoints: Checkpoint[];
  permissions: string[];
  dataManagement?: string;
}

// Risk management
export interface Risk {
  id: ID;
  name: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  contingencyId?: ID;
}

// Contingencies
export interface Contingency {
  id: ID;
  trigger: string;      // Condition that activates
  scenario: string;     // What might happen
  plan: string;         // Response plan
}

// Time compression options
export interface TimeCompression {
  minimal: string;      // Slight time reduction
  moderate: string;     // Significant reduction
  significant: string;  // Major reduction
}

// Main Project type - combines everything
export interface Project {
  id: ID;
  title: string;
  description: string;
  tierSummary?: string;

  // Core elements with tiers
  context: Tiered<ProjectContext>;
  bigIdea: Tiered<string>;
  essentialQuestion: Tiered<string>;
  learningGoals: Tiered<string[]>;
  successCriteria: Tiered<string[]>;

  // Standards
  standards: Tiered<Standard>[];
  standardsCoverage: StandardsCoverage[];

  // Project structure
  phases: Tiered<Phase>[];
  milestones: Tiered<Milestone>[];

  // Deliverables & assessment
  artifacts: Tiered<Artifact>[];
  rubrics: Tiered<Rubric>[];
  
  // Roles & differentiation
  roles: Tiered<Role>[];
  differentiation: Tiered<Differentiation>;
  scaffolds: Tiered<Scaffold>[];

  // Communications & exhibition
  communications: Tiered<CommunicationDoc>[];
  exhibition: Tiered<Exhibition>;

  // Evidence & logistics
  evidencePlan: Tiered<EvidencePlan>;
  checkpoints: Tiered<Checkpoint>[];

  // Risk management
  risks: Tiered<Risk>[];
  contingencies: Tiered<Contingency>[];
  timeCompression?: TimeCompression;

  // Metadata
  metadata?: {
    version: string;
    schemaVersion: number;
    createdAt: ISODate;
    updatedAt: ISODate;
    contentTiers?: {
      core: number;      // Count of core items
      scaffold: number;  // Count of scaffold items
      aspirational: number; // Count of aspirational items
    };
  };

  // Export paths (when generated)
  exports?: {
    brief?: string;    // Project brief path/URL
    plan?: string;     // Implementation plan
    rubrics?: string;  // Assessment rubrics
    comms?: string;    // Communications package
  };
}

// Helper type for partial project during creation
export type PartialProject = Partial<Project>;

// Enhanced V3 Project type with better structure and type safety
export interface ProjectV3 {
  id: ID;
  title: string;
  description: string;
  tier: Tier;
  confidence: number;
  
  // Context from wizard
  context: Tiered<{
    gradeLevel: string;
    subjects: string[];
    studentCount: number;
    timeWindow: string;
    cadence: string;
    availableTech: string[];
    availableMaterials: string[];
    constraints: string[];
    specialPopulations?: string;
    classroomPolicies?: string;
    budget?: 'minimal' | 'moderate' | 'substantial';
    space?: 'classroom' | 'school' | 'community' | 'virtual';
  }>;
  
  // Core educational elements
  bigIdea: Tiered<{ text: string }>;
  essentialQuestion: Tiered<{ text: string }>;
  learningGoals: Array<Tiered<{ text: string }>>;
  successCriteria: Array<Tiered<{ text: string }>>;
  
  // Standards alignment
  standards: StandardsAlignment[];
  standardsCoverage: StandardsCoverage[];
  
  // Project structure
  phases: Phase[];
  milestones: Milestone[];
  artifacts: Artifact[];
  
  // Assessment
  rubrics: Rubric[];
  
  // Roles and differentiation
  roles: Role[];
  differentiation: Tiered<{
    supports: string[];
    udlPrinciples: {
      representation: string[];
      action: string[];
      engagement: string[];
    };
    multilingualSupports: string[];
    accommodations: string[];
  }>;
  scaffolds: Scaffold[];
  
  // Communications and exhibition
  communications: Tiered<{
    family: string;
    admin: string;
    partner?: string;
  }>;
  exhibition: Tiered<{
    format: string;
    audience: string[];
    date?: string;
    location?: string;
  }>;
  
  // Planning and logistics
  evidencePlan: Tiered<{
    checkpoints: Checkpoint[];
    storage: string;
    permissions: string[];
  }>;
  risks: Risk[];
  contingencies: Contingency[];
  
  // Enhanced metadata
  metadata: {
    created: ISODate;
    updated: ISODate;
    version: string;
    schemaVersion: number;
    wizardVersion: string;
    contentTiers: {
      core: number;
      scaffold: number;
      aspirational: number;
    };
  };
}