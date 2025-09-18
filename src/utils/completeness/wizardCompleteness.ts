import type { WizardData, WizardDataV3 } from '../../features/wizard/wizardSchema';

export interface CategoryResult {
  percentage: number;
  missing: string[];
}

export interface WizardCompletenessResult {
  core: CategoryResult;
  context: CategoryResult;
  progressive: CategoryResult;
  summary: {
    core: number;
    context: number;
    progressive: number;
    overall: number;
  };
}

type WizardInput = Partial<WizardData> | Partial<WizardDataV3>;

type Requirement = {
  label: string;
  weight?: number;
  check: (data: WizardInput) => boolean;
};

const DEFAULT_WEIGHT = 1;

const CORE_REQUIREMENTS: Requirement[] = [
  {
    label: 'Project topic',
    check: data => typeof data.projectTopic === 'string' && data.projectTopic.trim().length >= 20
  },
  {
    label: 'Learning goals',
    check: data => {
      const v3 = data as WizardDataV3;
      if (Array.isArray(v3.learningGoals)) {
        return v3.learningGoals.length > 0 && v3.learningGoals.every(goal => {
          if (!goal) return false;
          if (typeof (goal as any).text === 'string') {
            return (goal as any).text.trim().length > 0;
          }
          return typeof goal === 'string' && goal.trim().length > 0;
        });
      }
      const legacy = (data as WizardData).learningGoals;
      return typeof legacy === 'string' && legacy.trim().length >= 20;
    }
  },
  {
    label: 'Vision statement',
    check: data => typeof (data as any).vision === 'string' && (data as any).vision.trim().length >= 20
  },
  {
    label: 'Essential question',
    check: data => {
      const v3 = data as WizardDataV3;
      if (typeof v3?.essentialQuestion === 'string') {
        return v3.essentialQuestion.trim().length >= 10;
      }
      if (v3?.essentialQuestion && typeof (v3 as any).essentialQuestion?.text === 'string') {
        return (v3 as any).essentialQuestion.text.trim().length >= 10;
      }
      const legacy = (data as any).drivingQuestion || (data as any).essentialQuestion;
      return typeof legacy === 'string' && legacy.trim().length >= 10;
    }
  }
];

const CONTEXT_REQUIREMENTS: Requirement[] = [
  {
    label: 'Subjects',
    check: data => Array.isArray(data.subjects) && data.subjects.length > 0
  },
  {
    label: 'Primary subject',
    check: data => typeof data.primarySubject === 'string' && data.primarySubject.trim().length > 0
  },
  {
    label: 'Grade level',
    check: data => typeof data.gradeLevel === 'string' && data.gradeLevel.trim().length > 0
  },
  {
    label: 'Project duration',
    check: data => typeof data.duration === 'string' && data.duration.trim().length > 0
  },
  {
    label: 'Project context details',
    check: data => {
      const context = (data as WizardDataV3).projectContext;
      if (!context) return false;
      const hasSchedule = Boolean(context.schedule);
      const hasTech = Array.isArray((context as any).availableTech) && (context as any).availableTech.length > 0;
      const hasResources = Array.isArray(context.resources) && context.resources.length > 0;
      return hasSchedule || hasTech || hasResources;
    }
  }
];

const PROGRESSIVE_REQUIREMENTS: Requirement[] = [
  {
    label: 'Standards alignment',
    check: data => {
      const standards = (data as WizardDataV3).standardsAlignment;
      return Boolean(standards && Array.isArray(standards.standards) && standards.standards.length > 0);
    }
  },
  {
    label: 'Phases mapped',
    check: data => Array.isArray((data as WizardDataV3).phases) && Boolean((data as WizardDataV3).phases?.length)
  },
  {
    label: 'Milestones defined',
    check: data => Array.isArray((data as WizardDataV3).milestones) && Boolean((data as WizardDataV3).milestones?.length)
  },
  {
    label: 'Artifacts or deliverables',
    check: data => Array.isArray((data as WizardDataV3).artifacts) && Boolean((data as WizardDataV3).artifacts?.length)
  },
  {
    label: 'Rubrics or assessments',
    check: data => Array.isArray((data as WizardDataV3).rubrics) && Boolean((data as WizardDataV3).rubrics?.length)
  },
  {
    label: 'Differentiation supports',
    check: data => Boolean((data as WizardDataV3).differentiation)
  },
  {
    label: 'Evidence plan',
    check: data => Boolean((data as WizardDataV3).evidencePlan)
  },
  {
    label: 'Communications plan',
    check: data => Boolean((data as WizardDataV3).communications)
  },
  {
    label: 'Exhibition plan',
    check: data => Boolean((data as WizardDataV3).exhibition)
  }
];

function evaluateCategory(requirements: Requirement[], data: WizardInput): CategoryResult {
  let totalWeight = 0;
  let completedWeight = 0;
  const missing: string[] = [];

  requirements.forEach(requirement => {
    const weight = requirement.weight ?? DEFAULT_WEIGHT;
    totalWeight += weight;
    const satisfied = requirement.check(data);
    if (satisfied) {
      completedWeight += weight;
    } else {
      missing.push(requirement.label);
    }
  });

  const percentage = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
  return { percentage, missing };
}

export function evaluateWizardCompleteness(data: WizardInput): WizardCompletenessResult {
  const core = evaluateCategory(CORE_REQUIREMENTS, data);
  const context = evaluateCategory(CONTEXT_REQUIREMENTS, data);
  const progressive = evaluateCategory(PROGRESSIVE_REQUIREMENTS, data);
  const overall = Math.round((core.percentage + context.percentage + progressive.percentage) / 3);

  return {
    core,
    context,
    progressive,
    summary: {
      core: core.percentage,
      context: context.percentage,
      progressive: progressive.percentage,
      overall
    }
  };
}
