// ---------- Enumerations ----------
export type GradeBand = 'ES' | 'MS' | 'HS';
export type Timeframe =
  | '1–2 lessons'
  | '2–4 weeks'
  | '4–6 weeks'
  | '6–8 weeks'
  | '8–10 weeks'
  | '10–12 weeks';
export type LessonLength = 45 | 50 | 55 | 60 | 75 | 90;
export type PhaseKind =
  | 'Foundations'
  | 'Planning'
  | 'FieldworkLoop'
  | 'Build'
  | 'Exhibit'
  | 'Extension';

// ---------- Project ----------
export interface ProjectShowcaseV2 {
  id: string;
  version: string;
  hero: {
    title: string;
    tagline: string;
    gradeBand: GradeBand;
    timeframe: Timeframe;
    subjects: string[];
    specLine?: string;
    image?: string;
  };
  microOverview: string[]; // 3–4 sentences; 12–28 words each
  fullOverview?: string; // collapsed by default (markdown allowed)
  schedule: {
    totalWeeks: number; // 4–12 for week-based showcases
    lessonsPerWeek: number; // 1–5
    lessonLengthMin: LessonLength;
  };
  runOfShow: WeekCard[]; // 4–12
  outcomes: {
    core: string[]; // 1–3 bullets
    extras: string[]; // 3–6 bullets
    audiences: string[]; // 3–6 bullets
  };
  materialsPrep: {
    coreKit: string[]; // ≤ 8
    noTechFallback: string[]; // ≤ 3
  };
  assignments: AssignmentCard[]; // 3–6
  polish?: {
    microRubric?: string[]; // 4–6 criteria (≤ 12 words)
    checkpoints?: string[]; // 2–5
    tags?: string[]; // 1–4 (codes only)
  };
  planningNotes?: string; // collapsed, optional; target 2–3 sentences (~120+ chars)
}

export interface WeekCard {
  weekLabel: string; // "Week 1", "Weeks 3–4"
  kind: PhaseKind;
  focus: string; // ≤ 90 chars
  teacher: string[]; // 3–5 bullets; ≤ 10 words each
  students: string[]; // 3–5 bullets; ≤ 10 words each
  deliverables: string[]; // 2–3 bullets
  checkpoint?: string[]; // 1–2 bullets
  assignments?: string[]; // ids: ["A1"]
  repeatable?: boolean;
}

export interface AssignmentCard {
  id: string; // "A1", "A2"
  title: string; // ≤ 80 chars
  summary: string; // ≤ 25 words
  studentDirections: string[]; // 5–7 bullets; ≤ 10 words each
  teacherSetup: string[]; // 3–5 bullets; ≤ 10 words each
  evidence: string[]; // 2–3 bullets
  successCriteria: string[]; // 3–5 bullets; kid-friendly; ≤ 8 words each
  checkpoint?: string; // 1 line
  aiOptional?: {
    toolUse: string; // ≤ 12 words
    critique: string; // ≤ 12 words
    noAIAlt: string; // ≤ 12 words
  };
  safety?: string[]; // 1–3 only if essential
  rubric?: AnalyticRubric; // optional analytic rubric (4 levels)
}

export interface AnalyticRubric {
  criteria: Array<{
    name: string;
    weight?: number;
    levels: {
      exemplary: string;
      proficient: string;
      developing: string;
      beginning: string;
    };
  }>;
}
