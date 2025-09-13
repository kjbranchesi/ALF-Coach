export const TERMS = {
  bigIdea: 'Big Idea',
  essentialQuestion: 'Essential Question (EQ)',
  learningGoals: 'Learning Goals',
  successCriteria: 'Success Criteria',
  standards: 'Standards Alignment',
  phases: 'Phases',
  milestones: 'Milestones',
  artifacts: 'Artifacts/Deliverables',
  checkpoints: 'Checkpoints',
  roles: 'Student Roles',
  scaffolds: 'Teacher Scaffolds',
  tiers: {
    core: 'Core (ALF Generated)',
    scaffold: 'Scaffold (Teacher Input)',
    aspirational: 'Aspirational (Examples)'
  }
} as const;

export type Tier = keyof typeof TERMS.tiers;

export const STANDARD_FRAMEWORKS = [
  { id: 'NGSS', label: 'NGSS' },
  { id: 'CCSS-ELA', label: 'CCSS ELA' },
  { id: 'CCSS-Math', label: 'CCSS Math' },
  { id: 'IB', label: 'IB' },
  { id: 'STATE', label: 'State/Local' },
] as const;

