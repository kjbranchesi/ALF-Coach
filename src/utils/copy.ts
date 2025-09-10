/**
 * Centralized microcopy for ALF Coach
 * Following Codex's implementation brief
 */

export const copy = {
  // Section leads
  sections: {
    discover: {
      title: 'Discover',
      mode: 'Diverge',
      lead: 'Explore context and possibilities before narrowing.',
      helper: 'Enter your classroom context to unlock personalized recommendations.'
    },
    define: {
      title: 'Define',
      mode: 'Converge', 
      lead: 'Choose the focus and align to standards.',
      helper: 'Lock in your essential question and learning standards.'
    },
    develop: {
      title: 'Develop',
      mode: 'Diverge',
      lead: 'Generate options for phases, roles, and artifacts.',
      helper: 'Explore different approaches and customize for your students.'
    },
    deliver: {
      title: 'Deliver',
      mode: 'Converge',
      lead: 'Lock assessment, checkpoints, and logistics.',
      helper: 'Finalize your plan with rubrics and evidence capture.'
    },
    reflect: {
      title: 'Reflect',
      mode: 'Reflect',
      lead: 'Capture learnings for continuous improvement.',
      helper: 'Document what worked and what to change next time.'
    }
  },

  // Educator inputs
  educator: {
    required: 'Educator Inputs Required',
    helper: 'Review and adjust to fit your class context.',
    confirm: 'Confirm & Continue'
  },

  // CTAs
  cta: {
    saveContext: 'Save Context & Continue',
    confirmStandards: 'Confirm Standards',
    linkArtifacts: 'Link Artifacts to Milestones',
    reviewRubrics: 'Review Rubrics & Links',
    finalizePlan: 'Finalize Plan',
    startContext: 'Start With Your Class Context',
    useTemplate: 'Use This Template',
    confirmFocus: 'Confirm Focus',
    addSwapOptions: 'Add/Swap Options',
    addEvidence: 'Add Evidence to Checkpoint',
    markReady: 'Mark Feasibility as Ready',
    captureReflections: 'Capture Reflections'
  },

  // Content labels
  content: {
    bigIdea: 'Big Idea',
    essentialQuestion: 'Essential Question',
    learningGoals: 'Learning Goals',
    successCriteria: 'Success Criteria',
    standards: 'Standards',
    phases: 'Phases',
    milestones: 'Milestones',
    artifacts: 'Artifacts',
    checkpoints: 'Checkpoints',
    rubrics: 'Rubrics',
    evidence: 'Evidence',
    exhibition: 'Exhibition',
    feasibility: 'Feasibility'
  },

  // Tier badges
  tiers: {
    core: {
      label: 'Core (ALF Generated)',
      description: 'What ALF drafted for you.'
    },
    scaffold: {
      label: 'Scaffold (Teacher Input)',
      description: 'What you customize for your class.'
    },
    aspirational: {
      label: 'Aspirational (Examples)',
      description: 'Inspiration — not automatically generated.'
    }
  },

  // Coverage map
  coverage: {
    introduce: {
      label: 'Introduce',
      description: 'First contact and vocabulary'
    },
    develop: {
      label: 'Develop',
      description: 'Practice and feedback cycles'
    },
    master: {
      label: 'Master',
      description: 'Independent, transfer-ready performance'
    }
  },

  // Empty states
  empty: {
    standards: 'No standards selected yet. Choose a framework to continue.',
    milestones: 'No milestones yet. Add your first checkpoint.',
    evidence: 'No evidence listed. Add at least one item per checkpoint.',
    rubrics: 'No rubric linked. Link a rubric to assess this artifact.',
    coverage: 'No coverage mapped yet. Add at least one milestone mapping.'
  },

  // Feasibility
  feasibility: {
    constraints: 'Feasibility Constraints',
    risks: 'Risk Assessment',
    contingencies: 'Contingency Plans',
    planB: 'Plan B',
    planC: 'Plan C',
    budget: 'Budget',
    time: 'Time',
    space: 'Space',
    safety: 'Safety',
    approval: 'Approvals'
  }
};