export interface AssignmentCard {
  id: string;
  title: string;
  when: string; // e.g., "Week 1", "Repeatable loop"
  studentDirections: string[]; // ≤7
  teacherSetup: string[]; // ≤5
  evidence: string[]; // 2–3
  successCriteria: string[]; // 3–5
  checkpoint?: string;
  aiOptional?: string;
}

export interface ShowcaseProject {
  meta: {
    id: string;
    title: string;
    tagline?: string;
    subjects: string[];
    gradeBands: string[]; // e.g., ["6-8"]
    duration: string; // e.g., "8–10 weeks" or "1–2 lessons"
    image?: string;
    tags?: string[];
  };
  microOverview: {
    microOverview: string; // 3–4 sentences
    longOverview?: string; // collapsible full overview (optional)
  };
  quickSpark?: {
    hooks: string[]; // exactly 3 recommended
    miniActivity: {
      do: string[]; // 3–5
      share: string[]; // 1–2
      reflect: string[]; // 1–2
      materials: string[]; // 1–2
      timeWindow: string; // e.g., "1–2 lessons"
      differentiationHint: string;
      aiTip?: string; // optional
    };
  };
  outcomeMenu?: {
    core: string; // required outcome
    choices?: string[]; // 0–6
    audiences?: string[]; // 0–N
  };
  assignments: AssignmentCard[]; // variable length
  accessibilityUDL?: {
    representationTips?: string[];
    actionTips?: string[];
    engagementTips?: string[];
    languageSupports?: string[];
    execFunctionSupports?: string[];
  };
  communityJustice?: {
    guidingQuestion: string; // justice/place lens
    stakeholders?: string[];
    ethicsNotes?: string[]; // privacy/consent notes
  };
  sharePlan?: {
    events?: string[];
    formats?: string[];
    partners?: string[];
  };
  gallery?: {
    exampleImages?: string[];
    sampleLinks?: string[];
  };
  polishFlags?: {
    standardsAvailable?: boolean;
    rubricAvailable?: boolean;
    feasibilityAvailable?: boolean;
  };
}
