/**
 * Comprehensive Rubric Types and Interfaces
 * 
 * Defines all types for the comprehensive rubric generation system,
 * supporting analytical, holistic, and single-point rubrics with
 * standards alignment and student-friendly features.
 */

import { type StandardAlignment } from '../services/learning-objectives-engine';

// Base rubric types
export type RubricType = 'analytical' | 'holistic' | 'single-point';
export type AssessmentPurpose = 'formative' | 'summative' | 'both';
export type AgeGroup = 'ages-5-7' | 'ages-8-10' | 'ages-11-14' | 'ages-15-18' | 'ages-18+';

// Performance level definitions
export interface PerformanceLevel {
  id: string;
  name: string;
  description: string;
  pointValue: number;
  color?: string;
  order: number;
}

// Performance descriptor for specific criteria and levels
export interface PerformanceDescriptor {
  criterionId: string;
  levelId: string;
  description: string;
  indicators: string[];
  examples: string[];
  evidenceRequirements: string[];
  commonMisconceptions?: string[];
}

// Rubric criterion definition
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1, where 1 is highest weight
  category: CriterionCategory;
  isRequired: boolean;
  standards: StandardAlignment[];
  skillTargets: string[];
  developmentalConsiderations: DevelopmentalConsideration[];
  descriptors: PerformanceDescriptor[];
}

export type CriterionCategory = 
  | 'content-knowledge'
  | 'process-skills'
  | 'product-quality'
  | 'collaboration'
  | 'communication'
  | 'critical-thinking'
  | 'creativity'
  | 'self-regulation'
  | 'research-skills'
  | 'digital-literacy'
  | 'presentation'
  | 'time-management'
  | 'reflection';

// Developmental considerations for age-appropriate expectations
export interface DevelopmentalConsideration {
  ageGroup: AgeGroup;
  expectations: string[];
  scaffolding: string[];
  accommodations: string[];
  extensions: string[];
}

// Main rubric interface
export interface Rubric {
  id: string;
  title: string;
  description: string;
  type: RubricType;
  purpose: AssessmentPurpose;
  ageGroup: AgeGroup;
  subject: string[];
  projectType?: string;
  criteria: RubricCriterion[];
  performanceLevels: PerformanceLevel[];
  totalPoints: number;
  passingScore?: number;
  standardsAlignment: StandardAlignment[];
  createdDate: Date;
  lastModified: Date;
  version: string;
  metadata: RubricMetadata;
}

// Rubric metadata
export interface RubricMetadata {
  author: string;
  institution?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  learningObjectives: string[];
  assessmentNotes: string[];
  modifications: RubricModification[];
}

// Modifications for accessibility and differentiation
export interface RubricModification {
  type: 'accommodation' | 'modification' | 'extension';
  description: string;
  targetPopulation: string;
  implementation: string[];
  resources?: string[];
}

// Student-friendly rubric versions
export interface StudentFriendlyRubric {
  rubricId: string;
  title: string;
  ageGroup: AgeGroup;
  simplifiedCriteria: StudentFriendlyCriterion[];
  canStatements: CanStatement[];
  selfAssessment: SelfAssessmentTool;
  visualElements: VisualElement[];
  languageLevel: 'simple' | 'intermediate' | 'advanced';
}

export interface StudentFriendlyCriterion {
  id: string;
  name: string;
  questionPrompt: string; // "How well did I...?"
  expectations: StudentExpectation[];
  examples: StudentExample[];
  checklistItems: string[];
}

export interface StudentExpectation {
  level: string;
  description: string;
  visualIndicator: string; // emoji, icon, color
  studentLanguage: string; // age-appropriate language
}

export interface StudentExample {
  level: string;
  example: string;
  context: string;
  whyItWorksWell: string;
}

// "I can" statements for clarity
export interface CanStatement {
  criterionId: string;
  levelId: string;
  statement: string;
  breakdown: string[]; // Smaller steps
  evidence: string[]; // What shows I can do this
}

// Self-assessment tools
export interface SelfAssessmentTool {
  instructions: string;
  reflectionPrompts: string[];
  goalSettingQuestions: string[];
  evidenceCollection: EvidenceCollectionGuide;
  peerReviewGuidance: PeerReviewGuide;
}

export interface EvidenceCollectionGuide {
  types: string[];
  examples: string[];
  organization: string[];
  reflection: string[];
}

export interface PeerReviewGuide {
  instructions: string;
  feedbackPrompts: string[];
  guidelines: string[];
  examples: string[];
}

// Visual elements for student engagement
export interface VisualElement {
  type: 'icon' | 'image' | 'chart' | 'graphic' | 'color-coding';
  description: string;
  purpose: string;
  ageAppropriate: boolean;
  accessibility: AccessibilityFeature[];
}

export interface AccessibilityFeature {
  type: 'alt-text' | 'high-contrast' | 'large-text' | 'audio-description';
  description: string;
  implementation: string;
}

// Rubric generation configuration
export interface RubricGenerationConfig {
  projectTitle: string;
  projectDescription: string;
  ageGroup: AgeGroup;
  subject: string[];
  duration: string;
  learningObjectives: string[];
  assessmentPurpose: AssessmentPurpose;
  rubricType: RubricType;
  criteriaPreferences: CriteriaPreferences;
  standardsToAlign: string[];
  customRequirements: string[];
  modifications: RubricModification[];
}

export interface CriteriaPreferences {
  priorityCategories: CriterionCategory[];
  weightingApproach: 'equal' | 'custom' | 'category-based';
  customWeights?: Record<string, number>;
  includeCollaboration: boolean;
  includeSelfReflection: boolean;
  includeProcessSkills: boolean;
  focusOnProduct: boolean;
  emphasizeCreativity: boolean;
}

// Assessment scoring and feedback
export interface RubricScore {
  rubricId: string;
  studentId: string;
  scorerId: string;
  scoreDate: Date;
  criteriaScores: CriterionScore[];
  totalScore: number;
  totalPossible: number;
  percentage: number;
  level: string;
  feedback: RubricFeedback;
  improvements: ImprovementSuggestion[];
  nextSteps: string[];
}

export interface CriterionScore {
  criterionId: string;
  levelId: string;
  points: number;
  possiblePoints: number;
  feedback: string;
  evidence: string[];
  strengths: string[];
  growthAreas: string[];
}

export interface RubricFeedback {
  overall: string;
  strengths: string[];
  growthAreas: string[];
  specificSuggestions: string[];
  resources: string[];
  encouragement: string;
}

export interface ImprovementSuggestion {
  criterionId: string;
  currentLevel: string;
  targetLevel: string;
  strategies: string[];
  resources: string[];
  timeline: string;
  checkpoints: string[];
}

// Analytics and reporting
export interface RubricAnalytics {
  rubricId: string;
  usageStats: UsageStatistics;
  performanceData: PerformanceData;
  criteriaAnalysis: CriteriaAnalysis[];
  studentProgress: StudentProgress[];
  improvements: AnalyticsInsight[];
}

export interface UsageStatistics {
  totalUses: number;
  averageScore: number;
  scoreDistribution: Record<string, number>;
  completionRate: number;
  timeToComplete: number;
  userSatisfaction: number;
}

export interface PerformanceData {
  classAverage: number;
  criteriaAverages: Record<string, number>;
  improvementTrends: TrendData[];
  strugglingAreas: string[];
  excellenceAreas: string[];
}

export interface TrendData {
  period: string;
  average: number;
  improvement: number;
  sample: number;
}

export interface CriteriaAnalysis {
  criterionId: string;
  name: string;
  averageScore: number;
  reliability: number;
  discriminatePower: number;
  studentFeedback: string[];
  suggestions: string[];
}

export interface StudentProgress {
  studentId: string;
  progressOverTime: ProgressDataPoint[];
  strengthAreas: string[];
  growthAreas: string[];
  recommendations: string[];
}

export interface ProgressDataPoint {
  date: Date;
  score: number;
  level: string;
  notes: string;
}

export interface AnalyticsInsight {
  type: 'performance' | 'engagement' | 'reliability' | 'validity';
  description: string;
  evidence: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

// Export and sharing options
export interface RubricExportOptions {
  format: 'pdf' | 'docx' | 'csv' | 'json' | 'html' | 'google-docs';
  includeStudentVersion: boolean;
  includeInstructions: boolean;
  includeStandards: boolean;
  includeScoring: boolean;
  customization: ExportCustomization;
}

export interface ExportCustomization {
  headerText?: string;
  footerText?: string;
  logoUrl?: string;
  colorScheme?: string;
  fontFamily?: string;
  pageLayout?: 'portrait' | 'landscape';
  includeBlankScoring?: boolean;
}

// Template and library system
export interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  ageGroups: AgeGroup[];
  subjects: string[];
  type: RubricType;
  criteria: RubricCriterion[];
  performanceLevels: PerformanceLevel[];
  isPublic: boolean;
  authorId: string;
  rating: number;
  downloads: number;
  lastUpdated: Date;
  tags: string[];
}

export interface RubricLibrary {
  templates: RubricTemplate[];
  userRubrics: Rubric[];
  sharedRubrics: Rubric[];
  favorites: string[];
  recentlyUsed: string[];
  categories: LibraryCategory[];
}

export interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  subcategories: string[];
}

// Validation and quality checks
export interface RubricValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  qualityScore: number;
  completeness: number;
}

export interface ValidationError {
  type: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  type: string;
  message: string;
  impact: string;
  recommendation: string;
}

export interface ValidationSuggestion {
  category: string;
  suggestion: string;
  rationale: string;
  implementation: string[];
  expectedImprovement: string;
}

// Default configurations for different age groups
export const DEFAULT_PERFORMANCE_LEVELS: Record<AgeGroup, PerformanceLevel[]> = {
  'ages-5-7': [
    { id: 'emerging', name: 'Starting to Learn', description: 'Beginning to show understanding', pointValue: 1, color: '#ffd700', order: 1 },
    { id: 'developing', name: 'Getting Better', description: 'Making progress with help', pointValue: 2, color: '#87ceeb', order: 2 },
    { id: 'proficient', name: 'I Got It!', description: 'Shows good understanding', pointValue: 3, color: '#90ee90', order: 3 }
  ],
  'ages-8-10': [
    { id: 'developing', name: 'Still Learning', description: 'Working toward the goal', pointValue: 1, color: '#ffd700', order: 1 },
    { id: 'proficient', name: 'Meeting Goal', description: 'Meets expectations well', pointValue: 2, color: '#87ceeb', order: 2 },
    { id: 'advanced', name: 'Exceeding Goal', description: 'Goes beyond expectations', pointValue: 3, color: '#90ee90', order: 3 }
  ],
  'ages-11-14': [
    { id: 'needs-improvement', name: 'Needs Improvement', description: 'Below grade level expectations', pointValue: 1, color: '#ffcccb', order: 1 },
    { id: 'developing', name: 'Developing', description: 'Approaching grade level', pointValue: 2, color: '#ffd700', order: 2 },
    { id: 'proficient', name: 'Proficient', description: 'Meets grade level standards', pointValue: 3, color: '#87ceeb', order: 3 },
    { id: 'advanced', name: 'Advanced', description: 'Exceeds grade level standards', pointValue: 4, color: '#90ee90', order: 4 }
  ],
  'ages-15-18': [
    { id: 'needs-improvement', name: 'Needs Improvement', description: 'Below standards', pointValue: 1, color: '#ffcccb', order: 1 },
    { id: 'developing', name: 'Developing', description: 'Approaching standards', pointValue: 2, color: '#ffd700', order: 2 },
    { id: 'proficient', name: 'Proficient', description: 'Meets standards', pointValue: 3, color: '#87ceeb', order: 3 },
    { id: 'advanced', name: 'Advanced', description: 'Exceeds standards', pointValue: 4, color: '#90ee90', order: 4 },
    { id: 'exemplary', name: 'Exemplary', description: 'Exceptional performance', pointValue: 5, color: '#98fb98', order: 5 }
  ],
  'ages-18+': [
    { id: 'needs-improvement', name: 'Needs Improvement', description: 'Below professional standards', pointValue: 1, color: '#ffcccb', order: 1 },
    { id: 'developing', name: 'Developing', description: 'Approaching standards', pointValue: 2, color: '#ffd700', order: 2 },
    { id: 'proficient', name: 'Proficient', description: 'Meets professional standards', pointValue: 3, color: '#87ceeb', order: 3 },
    { id: 'advanced', name: 'Advanced', description: 'Exceeds standards', pointValue: 4, color: '#90ee90', order: 4 },
    { id: 'exemplary', name: 'Exemplary', description: 'Industry-leading performance', pointValue: 5, color: '#98fb98', order: 5 }
  ]
};

// Default criteria categories for different project types
export const DEFAULT_CRITERIA_BY_PROJECT_TYPE: Record<string, CriterionCategory[]> = {
  'research-project': ['content-knowledge', 'research-skills', 'critical-thinking', 'communication', 'presentation'],
  'science-investigation': ['process-skills', 'content-knowledge', 'critical-thinking', 'collaboration', 'communication'],
  'creative-project': ['creativity', 'product-quality', 'process-skills', 'presentation', 'self-regulation'],
  'collaborative-project': ['collaboration', 'communication', 'content-knowledge', 'process-skills', 'time-management'],
  'presentation': ['communication', 'presentation', 'content-knowledge', 'digital-literacy', 'creativity'],
  'portfolio': ['reflection', 'content-knowledge', 'process-skills', 'presentation', 'self-regulation'],
  'service-learning': ['collaboration', 'critical-thinking', 'communication', 'reflection', 'content-knowledge']
};

export default {
  DEFAULT_PERFORMANCE_LEVELS,
  DEFAULT_CRITERIA_BY_PROJECT_TYPE
};