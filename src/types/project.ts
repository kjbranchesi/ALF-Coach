export interface AssignmentCard {
  id: string;
  title: string;
  when: string;
  studentDirections: string[];
  teacherSetup: string[];
  evidence: string[];
  successCriteria: string[];
  checkpoint?: string;
  aiOptional?: string;
}

export interface QuickSparkActivity {
  hooks: string[];
  miniActivity: {
    do: string[];
    share: string[];
    reflect: string[];
    materials: string[];
    timeWindow: string;
    differentiationHint: string;
    aiTip?: string;
  };
}

export interface OutcomeMenu {
  core: string;
  choices?: string[];
  audiences?: string[];
}

export interface CommunityJustice {
  guidingQuestion: string;
  stakeholders?: string[];
  ethicsNotes?: string[];
}

export interface AccessibilityUDL {
  representationTips?: string[];
  actionTips?: string[];
  engagementTips?: string[];
  languageSupports?: string[];
  execFunctionSupports?: string[];
}

export interface SharePlan {
  events?: string[];
  formats?: string[];
  partners?: string[];
}

export interface AdvancedProjectFields {
  ideation?: Record<string, unknown>;
  journey?: Record<string, unknown>;
  deliverables?: Record<string, unknown>;
}

export interface ProjectMetadata {
  variant: 'showcase' | 'builder' | 'legacy';
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  seedSourceId?: string;
}

export interface UnifiedProject {
  meta: {
    id: string;
    title: string;
    tagline?: string;
    subjects: string[];
    gradeBands: string[];
    duration: string;
    image?: string;
    tags?: string[];
  };
  microOverview: {
    microOverview: string;
    longOverview?: string;
  };
  quickSpark?: QuickSparkActivity;
  outcomeMenu?: OutcomeMenu;
  assignments: AssignmentCard[];
  communityJustice?: CommunityJustice;
  accessibilityUDL?: AccessibilityUDL;
  sharePlan?: SharePlan;
  advanced?: AdvancedProjectFields;
  metadata: ProjectMetadata;
}

export type { AssignmentCard as ShowcaseAssignmentCard };
