// src/utils/alfFlow.ts
// Simple, durable data model + defaults for the Double Diamond diagram

export type DiamondStage = 'Discover' | 'Define' | 'Develop' | 'Deliver' | 'Reflect';
export type PhaseType = 'diverge' | 'converge' | 'reflect';

export interface StageInfo {
  id: DiamondStage;
  type: PhaseType;
  title: string;
  subtitle: string;
  educatorInputs: string[];
  alfGenerates: string[];
  gates?: string[]; // validations or confirmations required
}

export interface StageLegendItem {
  type: PhaseType;
  label: string;
  colorClass: string; // Tailwind color class used by the diagram
}

export const STAGE_LEGEND: StageLegendItem[] = [
  { type: 'diverge', label: 'Diverge', colorClass: 'from-sky-500 to-cyan-500' },
  { type: 'converge', label: 'Converge', colorClass: 'from-violet-500 to-fuchsia-500' },
  { type: 'reflect', label: 'Reflect', colorClass: 'from-emerald-500 to-teal-500' },
];

// Default ALF Double Diamond stages (copy kept concise)
export const DEFAULT_STAGES: StageInfo[] = [
  {
    id: 'Discover',
    type: 'diverge',
    title: 'Discover',
    subtitle: 'Explore context and possibilities',
    educatorInputs: [
      'Class profile (grade, size, schedule)',
      'Tech/materials, budget, constraints',
      'IEP/504/ELL considerations',
      'Non‑negotiables & policies',
    ],
    alfGenerates: [
      'Context summary',
      'Feasibility flags',
    ],
  },
  {
    id: 'Define',
    type: 'converge',
    title: 'Define',
    subtitle: 'Choose focus and align',
    educatorInputs: [
      'Big Idea, Essential Question',
      'Learning goals & success criteria',
      'Select standards framework',
    ],
    alfGenerates: [
      'Standards proposals + rationales',
      'Refined EQ options',
    ],
    gates: [
      'At least one framework chosen',
      'Standards codes confirmed',
    ],
  },
  {
    id: 'Develop',
    type: 'diverge',
    title: 'Develop',
    subtitle: 'Plan phases, roles, artifacts',
    educatorInputs: [
      'Student roles & grouping',
      'Differentiation (UDL, multilingual, accommodations)',
      'Teacher scaffolds & resources',
    ],
    alfGenerates: [
      'Phase & milestone options',
      'Artifact & activity drafts',
    ],
  },
  {
    id: 'Deliver',
    type: 'converge',
    title: 'Deliver',
    subtitle: 'Lock assessment and logistics',
    educatorInputs: [
      'Rubric edits & exemplars',
      'Checkpoints & evidence plan',
      'Comms & exhibition details',
    ],
    alfGenerates: [
      'Rubric criteria linked to artifacts',
      'Calendarized checkpoints',
    ],
    gates: [
      'Artifacts linked to rubric(s)',
      'Evidence (what/where/who) set',
      'Standards coverage mapped',
    ],
  },
  {
    id: 'Reflect',
    type: 'reflect',
    title: 'Reflect',
    subtitle: 'Capture learning and improvements',
    educatorInputs: [
      'Teacher & student reflections',
      'What to keep/change next time',
    ],
    alfGenerates: [
      'Reflection prompts',
      'Exemplar tagging for reuse',
    ],
  },
];

export type CompletionMap = Partial<Record<DiamondStage, number>>; // 0..100 per stage

