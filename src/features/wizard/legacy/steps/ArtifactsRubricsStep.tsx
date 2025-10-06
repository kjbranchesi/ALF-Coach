import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Sparkles,
  Plus,
  Trash2,
  Wand2,
  Target,
  Layers,
  CheckCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { StepComponentProps } from '../types';
import type {
  Artifact as ArtifactType,
  Rubric as RubricType,
  RubricCriterion as RubricCriterionType,
  ScaleLevel,
  Tier
} from '../../../types/alf';
import { evaluateWizardCompleteness } from '../../../utils/completeness/wizardCompleteness';

type RubricScale = '0-3' | '1-4' | '1-5' | 'custom';

type ArtifactFormState = ArtifactType & {
  tier: Tier;
  confidence: number;
};

type RubricFormState = Omit<RubricType, 'criteria'> & {
  tier: Tier;
  confidence: number;
  criteria: RubricCriterionForm[];
};

interface RubricCriterionForm extends Omit<RubricCriterionType, 'levels' | 'standardsAlignment'> {
  levels: ScaleLevel[];
  standardsAlignment: string[];
}

interface ArtifactTemplate {
  id: string;
  name: string;
  description: string;
  exemplar?: string;
  tier: Tier;
  milestoneHint?: string;
}

interface RubricTemplateCriterion {
  name: string;
  description: string;
  weight: number;
  descriptors: Record<number, string>;
}

interface RubricTemplate {
  id: string;
  name: string;
  summary: string;
  tier: Tier;
  scale: RubricScale;
  criteria: RubricTemplateCriterion[];
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;

const tierOptions: Array<{ value: Tier; label: string; helper: string }> = [
  { value: 'core', label: 'Core', helper: 'Required for hero-ready handoff' },
  { value: 'scaffold', label: 'Scaffold', helper: 'Teacher-facing enrichment' },
  { value: 'aspirational', label: 'Aspirational', helper: 'Stretch ideas & inspiration' }
];

const scaleOptions: Array<{ value: RubricScale; label: string }> = [
  { value: '1-4', label: '1-4 scale (Beginning → Exemplary)' },
  { value: '0-3', label: '0-3 scale (Emerging → Exceeds)' },
  { value: '1-5', label: '1-5 scale (Novice → Expert)' },
  { value: 'custom', label: 'Custom descriptors' }
];

const createDefaultLevels = (scale: RubricScale): ScaleLevel[] => {
  switch (scale) {
    case '0-3':
      return [
        { value: 3, label: 'Exceeds', descriptor: '' },
        { value: 2, label: 'Meets', descriptor: '' },
        { value: 1, label: 'Approaching', descriptor: '' },
        { value: 0, label: 'Beginning', descriptor: '' }
      ];
    case '1-5':
      return [
        { value: 5, label: 'Expert', descriptor: '' },
        { value: 4, label: 'Strong', descriptor: '' },
        { value: 3, label: 'Proficient', descriptor: '' },
        { value: 2, label: 'Developing', descriptor: '' },
        { value: 1, label: 'Novice', descriptor: '' }
      ];
    default:
      return [
        { value: 4, label: 'Exemplary', descriptor: '' },
        { value: 3, label: 'Proficient', descriptor: '' },
        { value: 2, label: 'Developing', descriptor: '' },
        { value: 1, label: 'Beginning', descriptor: '' }
      ];
  }
};

const ARTIFACT_LIBRARY: ArtifactTemplate[] = [
  {
    id: 'process-portfolio',
    name: 'Process Portfolio',
    description: 'Curated journal of research notes, draft artifacts, feedback, and reflections across the project phases.',
    exemplar: 'Shared folder with weekly reflections, annotated drafts, and peer feedback snapshots.',
    tier: 'core',
    milestoneHint: 'Align with midpoint or reflection milestones.'
  },
  {
    id: 'final-showcase',
    name: 'Final Showcase Deliverable',
    description: 'Flagship product or performance presented to an authentic audience during the exhibition event.',
    exemplar: 'Prototype paired with a presentation deck and talking points for the showcase.',
    tier: 'scaffold',
    milestoneHint: 'Link to the exhibition or final presentation milestone.'
  },
  {
    id: 'community-story',
    name: 'Community Impact Story',
    description: 'Narrative artifact capturing how the project responds to community needs, including stakeholder voices.',
    exemplar: 'Short documentary, podcast episode, or portfolio that captures impact evidence.',
    tier: 'aspirational',
    milestoneHint: 'Connect with reflection or celebration milestones.'
  }
];

const RUBRIC_LIBRARY: RubricTemplate[] = [
  {
    id: 'process-reflection',
    name: 'Process & Reflection Rubric',
    summary: 'Evaluates how students plan, iterate, and reflect across the project.',
    tier: 'core',
    scale: '1-4',
    criteria: [
      {
        name: 'Planning & Research',
        description: 'Quality of research notes, planning documents, and evidence of strategic choices.',
        weight: 0.35,
        descriptors: {
          4: 'Research is thorough, sourced responsibly, and feeds directly into strategic planning decisions.',
          3: 'Research is complete and supports planning choices with clear citations.',
          2: 'Research is present but lacks depth or clear connection to planning.',
          1: 'Research evidence is minimal or missing, making planning unclear.'
        }
      },
      {
        name: 'Iteration & Feedback Use',
        description: 'How feedback is gathered, analyzed, and applied during creation.',
        weight: 0.35,
        descriptors: {
          4: 'Multiple feedback loops are documented with clear adjustments and rationale for next steps.',
          3: 'Feedback is gathered and applied with documented adjustments.',
          2: 'Feedback is gathered but implementation is inconsistent or weakly documented.',
          1: 'Little evidence of feedback use or iteration.'
        }
      },
      {
        name: 'Reflection & Metacognition',
        description: 'Depth of reflection regarding growth, challenges, and future goals.',
        weight: 0.3,
        descriptors: {
          4: 'Reflection is candid, analytical, and points to specific growth with evidence and next steps.',
          3: 'Reflection names growth areas and provides relevant evidence.',
          2: 'Reflection mentions experiences but lacks depth or evidence.',
          1: 'Reflection is surface level or missing key insights.'
        }
      }
    ]
  },
  {
    id: 'final-product-quality',
    name: 'Final Product Quality Rubric',
    summary: 'Measures craftsmanship, alignment to success criteria, and impact of the final deliverable.',
    tier: 'scaffold',
    scale: '1-4',
    criteria: [
      {
        name: 'Craftsmanship & Accuracy',
        description: 'Overall quality, accuracy, and polish of the final deliverable.',
        weight: 0.4,
        descriptors: {
          4: 'Product is polished, accurate, and exceeds quality expectations for the authentic audience.',
          3: 'Product meets expectations with minor refinements needed.',
          2: 'Product shows effort but contains notable gaps in accuracy or polish.',
          1: 'Product is incomplete or lacks expected quality.'
        }
      },
      {
        name: 'Alignment to Success Criteria',
        description: 'How well the deliverable demonstrates the agreed-upon success criteria.',
        weight: 0.35,
        descriptors: {
          4: 'Delivers strong evidence for every success criterion with clear documentation.',
          3: 'Addresses most success criteria with sufficient evidence.',
          2: 'Touches on success criteria but lacks depth or consistent evidence.',
          1: 'Does not yet demonstrate key success criteria.'
        }
      },
      {
        name: 'Audience Impact',
        description: 'Effectiveness of the product for the intended audience or community.',
        weight: 0.25,
        descriptors: {
          4: 'Product is highly engaging and tailored to audience needs with persuasive evidence.',
          3: 'Product is audience-aware and communicates purpose clearly.',
          2: 'Audience connection is emerging but not yet compelling.',
          1: 'Audience needs are unclear or missing from the product.'
        }
      }
    ]
  },
  {
    id: 'collaboration-communication',
    name: 'Collaboration & Communication Rubric',
    summary: 'Captures how students collaborate and communicate within teams and with partners.',
    tier: 'scaffold',
    scale: '1-4',
    criteria: [
      {
        name: 'Collaboration Habits',
        description: 'Team norms, equitable participation, and conflict resolution.',
        weight: 0.5,
        descriptors: {
          4: 'Team models equitable collaboration, rotates roles strategically, and resolves conflict with shared protocols.',
          3: 'Team collaborates well with clear roles and resolves issues constructively.',
          2: 'Collaboration is inconsistent or overly dependent on a few members.',
          1: 'Collaboration is ineffective or harmful to project progress.'
        }
      },
      {
        name: 'Communication & Storytelling',
        description: 'Clarity, audience awareness, and professionalism of communication artifacts.',
        weight: 0.5,
        descriptors: {
          4: 'Communication is compelling, audience-aware, and supported with strong visuals or evidence.',
          3: 'Communication is clear and audience-ready with minor refinements needed.',
          2: 'Communication is emerging but lacks clarity, polish, or audience targeting.',
          1: 'Communication is confusing, incomplete, or mismatched to the audience.'
        }
      }
    ]
  }
];

const buildCriterion = (scale: RubricScale, overrides?: Partial<RubricCriterionForm>): RubricCriterionForm => ({
  id: generateId('criterion'),
  name: overrides?.name || 'New Criterion',
  description: overrides?.description,
  weight: overrides?.weight ?? 0.33,
  levels: (overrides?.levels || createDefaultLevels(scale)).map(level => ({
    value: level.value,
    label: level.label,
    descriptor: level.descriptor
  })),
  standardsAlignment: overrides?.standardsAlignment || []
});

const mapRubricTemplate = (template: RubricTemplate): RubricFormState => {
  const scale = template.scale || '1-4';
  const baseLevels = createDefaultLevels(scale);

  const criteria = template.criteria.map(criterion => ({
    id: generateId('criterion'),
    name: criterion.name,
    description: criterion.description,
    weight: criterion.weight,
    levels: baseLevels.map(level => ({
      value: level.value,
      label: level.label,
      descriptor: criterion.descriptors[level.value] || level.descriptor
    })),
    standardsAlignment: []
  }));

  return {
    id: generateId('rubric'),
    name: template.name,
    tier: template.tier,
    confidence: template.tier === 'core' ? 0.85 : 0.75,
    scaleLabel: template.scale,
    totalPoints: undefined,
    useStudentLanguage: true,
    criteria,
    exemplars: []
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringValue = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const toNumberValue = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const toBooleanValue = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter((item): item is string => typeof item === 'string');
};

const isTier = (value: unknown): value is Tier =>
  value === 'core' || value === 'scaffold' || value === 'aspirational';

export const ArtifactsRubricsStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const milestoneOptions = useMemo(() => {
    if (!Array.isArray(data.milestones)) {
      return [];
    }

    return data.milestones.map(milestone => {
      if (isRecord(milestone)) {
        const id = toStringValue(milestone.id) ?? '';
        const name = toStringValue(milestone.name) ?? 'Untitled Milestone';
        return { id, name };
      }

      return { id: '', name: 'Untitled Milestone' };
    });
  }, [data.milestones]);

  const buildInitialArtifacts = (): ArtifactFormState[] => {
    if (Array.isArray(data.artifacts) && data.artifacts.length) {
      return data.artifacts.map(artifact => {
        if (isRecord(artifact)) {
          const id = toStringValue(artifact.id) ?? generateId('artifact');
          const name = toStringValue(artifact.name) ?? '';
          const description = toStringValue(artifact.description) ?? '';
          const milestoneId =
            toStringValue(artifact.milestoneId) ||
            toStringValue(artifact.milestone) ||
            milestoneOptions[0]?.id ||
            '';
          const fallbackRubricId = toStringValue(artifact.rubricId);
          const rubricIds =
            toStringArray(artifact.rubricIds) ||
            (fallbackRubricId ? [fallbackRubricId] : []);
          const exemplar = toStringValue(artifact.exemplar);
          const tier = isTier(artifact.tier) ? artifact.tier : 'core';
          const confidence = toNumberValue(artifact.confidence) ?? 0.8;

          return {
            id,
            name,
            description,
            milestoneId,
            rubricIds,
            exemplar,
            tier,
            confidence
          } satisfies ArtifactFormState;
        }

        return {
          id: generateId('artifact'),
          name: '',
          description: '',
          milestoneId: milestoneOptions[0]?.id || '',
          rubricIds: [],
          tier: 'core',
          confidence: 0.8
        } satisfies ArtifactFormState;
      });
    }

    const fallbackTemplate = ARTIFACT_LIBRARY[0];
    return [
      {
        id: generateId('artifact'),
        name: fallbackTemplate.name,
        description: fallbackTemplate.description,
        milestoneId: milestoneOptions[0]?.id || '',
        rubricIds: [],
        exemplar: fallbackTemplate.exemplar,
        tier: fallbackTemplate.tier,
        confidence: 0.8
      }
    ];
  };

  const buildInitialRubrics = (): RubricFormState[] => {
    if (Array.isArray(data.rubrics) && data.rubrics.length) {
      return data.rubrics.map(rubric => {
        if (!isRecord(rubric)) {
          return mapRubricTemplate(RUBRIC_LIBRARY[0]);
        }

        const scale = (toStringValue(rubric.scaleLabel) as RubricScale) || '1-4';
        const baseLevels = createDefaultLevels(scale);

        const rawCriteria = Array.isArray(rubric.criteria) ? rubric.criteria : [];
        const mappedCriteria: RubricCriterionForm[] = rawCriteria.map(rawCriterion => {
          if (!isRecord(rawCriterion)) {
            return buildCriterion(scale);
          }

          const id = toStringValue(rawCriterion.id) ?? generateId('criterion');
          const name = toStringValue(rawCriterion.name) ?? 'Criterion';
          const description = toStringValue(rawCriterion.description);
          const weight = toNumberValue(rawCriterion.weight) ?? 0.33;
          const levelSource = Array.isArray(rawCriterion.levels) ? rawCriterion.levels : baseLevels;
          const levels = levelSource.map((level, index) => {
            if (isRecord(level)) {
              const value = toNumberValue(level.value) ?? baseLevels[index]?.value ?? index;
              const label = toStringValue(level.label) ?? baseLevels[index]?.label ?? `Level ${index + 1}`;
              const descriptor = toStringValue(level.descriptor) ?? '';
              return { value, label, descriptor };
            }

            return baseLevels[index] || {
              value: index,
              label: `Level ${index + 1}`,
              descriptor: ''
            };
          });
          const standardsAlignment = toStringArray(rawCriterion.standardsAlignment) || [];

          return {
            id,
            name,
            description,
            weight,
            levels,
            standardsAlignment
          } satisfies RubricCriterionForm;
        });

        const ensuredCriteria = mappedCriteria.length > 0 ? mappedCriteria : [buildCriterion(scale)];

        const id = toStringValue(rubric.id) ?? generateId('rubric');
        const name = toStringValue(rubric.name) ?? 'Rubric';
        const tier = isTier(rubric.tier) ? rubric.tier : 'scaffold';
        const confidence = toNumberValue(rubric.confidence) ?? 0.75;
        const totalPoints = toNumberValue(rubric.totalPoints);
        const useStudentLanguage = toBooleanValue(rubric.useStudentLanguage) ?? true;
        const exemplars = Array.isArray(rubric.exemplars) ? rubric.exemplars : [];

        return {
          id,
          name,
          tier,
          confidence,
          scaleLabel: scale,
          totalPoints,
          useStudentLanguage,
          criteria: ensuredCriteria,
          exemplars
        } satisfies RubricFormState;
      });
    }

    return [mapRubricTemplate(RUBRIC_LIBRARY[0])];
  };

  const [artifacts, setArtifacts] = useState<ArtifactFormState[]>(() => buildInitialArtifacts());
  const [rubrics, setRubrics] = useState<RubricFormState[]>(() => buildInitialRubrics());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addArtifact = (template?: ArtifactTemplate) => {
    const base = template || ARTIFACT_LIBRARY[1];
    setArtifacts(prev => [
      ...prev,
      {
        id: generateId('artifact'),
        name: base?.name || 'New Artifact',
        description: base?.description || 'Describe what evidence students will produce and why it matters.',
        milestoneId: milestoneOptions[0]?.id || '',
        rubricIds: [],
        exemplar: base?.exemplar,
        tier: base?.tier || 'scaffold',
        confidence: base?.tier === 'core' ? 0.85 : 0.7
      }
    ]);
  };

  const updateArtifact = (artifactId: string, updates: Partial<ArtifactFormState>) => {
    setArtifacts(prev => prev.map(artifact => {
      if (artifact.id === artifactId) {
        return { ...artifact, ...updates };
      }

      return artifact;
    }));
  };

  const toggleArtifactRubric = (artifactId: string, rubricId: string) => {
    setArtifacts(prev => prev.map(artifact => {
      if (artifact.id !== artifactId) {
        return artifact;
      }
      const exists = artifact.rubricIds.includes(rubricId);
      const rubricIds = exists
        ? artifact.rubricIds.filter(id => id !== rubricId)
        : [...artifact.rubricIds, rubricId];
      return { ...artifact, rubricIds };
    }));
  };

  const removeArtifact = (artifactId: string) => {
    setArtifacts(prev => prev.filter(artifact => artifact.id !== artifactId));
  };

  const addRubricFromTemplate = (template: RubricTemplate) => {
    const mapped = mapRubricTemplate(template);
    setRubrics(prev => [...prev, mapped]);
    setArtifacts(prev => {
      const next = prev.map(artifact => ({ ...artifact }));
      const idx = next.findIndex(item => item.rubricIds.length === 0);
      if (idx >= 0) {
        next[idx].rubricIds = [mapped.id];
      }
      return next;
    });
  };

  const addRubric = () => {
    const scale: RubricScale = '1-4';
    setRubrics(prev => [
      ...prev,
      {
        id: generateId('rubric'),
        name: 'New Rubric',
        tier: 'scaffold',
        confidence: 0.7,
        scaleLabel: scale,
        totalPoints: undefined,
        useStudentLanguage: true,
        criteria: [buildCriterion(scale)],
        exemplars: []
      }
    ]);
  };

  const updateRubric = (rubricId: string, updates: Partial<RubricFormState>) => {
    setRubrics(prev => prev.map(rubric => (
      rubric.id === rubricId ? { ...rubric, ...updates } : rubric
    )));
  };

  const removeRubric = (rubricId: string) => {
    setRubrics(prev => prev.filter(rubric => rubric.id !== rubricId));
    setArtifacts(prev => prev.map(artifact => ({
      ...artifact,
      rubricIds: artifact.rubricIds.filter(id => id !== rubricId)
    })));
  };

  const addCriterionToRubric = (rubricId: string) => {
    setRubrics(prev => prev.map(rubric => {
      if (rubric.id !== rubricId) {
        return rubric;
      }
      const scale = rubric.scaleLabel || '1-4';
      return {
        ...rubric,
        criteria: [...rubric.criteria, buildCriterion(scale)]
      };
    }));
  };

  const updateCriterion = (rubricId: string, criterionId: string, updates: Partial<RubricCriterionForm>) => {
    setRubrics(prev => prev.map(rubric => {
      if (rubric.id !== rubricId) {
        return rubric;
      }
      return {
        ...rubric,
        criteria: rubric.criteria.map(criterion => (
          criterion.id === criterionId ? { ...criterion, ...updates } : criterion
        ))
      };
    }));
  };

  const updateLevelDescriptor = (
    rubricId: string,
    criterionId: string,
    levelValue: number,
    descriptor: string
  ) => {
    setRubrics(prev => prev.map(rubric => {
      if (rubric.id !== rubricId) {
        return rubric;
      }
      return {
        ...rubric,
        criteria: rubric.criteria.map(criterion => {
          if (criterion.id !== criterionId) {
            return criterion;
          }
          return {
            ...criterion,
            levels: criterion.levels.map(level => (
              level.value === levelValue ? { ...level, descriptor } : level
            ))
          };
        })
      };
    }));
  };

  const removeCriterion = (rubricId: string, criterionId: string) => {
    setRubrics(prev => prev.map(rubric => {
      if (rubric.id !== rubricId) {
        return rubric;
      }
      const remaining = rubric.criteria.filter(criterion => criterion.id !== criterionId);
      return {
        ...rubric,
        criteria: remaining.length ? remaining : rubric.criteria
      };
    }));
  };

  const buildPayload = useCallback(() => {
    const preparedArtifacts = artifacts
      .filter(artifact => artifact.name.trim() && artifact.description.trim())
      .map(artifact => ({
        ...artifact,
        name: artifact.name.trim(),
        description: artifact.description.trim(),
        exemplar: artifact.exemplar?.trim() || undefined,
        milestoneId: artifact.milestoneId,
        rubricIds: artifact.rubricIds
      })) as Array<ArtifactType & { tier: Tier; confidence: number }>;

    const preparedRubrics = rubrics
      .filter(rubric => rubric.name.trim())
      .map(rubric => ({
        ...rubric,
        name: rubric.name.trim(),
        criteria: rubric.criteria.map(criterion => ({
          ...criterion,
          name: criterion.name.trim(),
          description: criterion.description?.trim(),
          levels: criterion.levels.map(level => ({
            ...level,
            descriptor: level.descriptor.trim()
          })),
          standardsAlignment: criterion.standardsAlignment.filter(Boolean)
        }))
      })) as Array<RubricType & { tier: Tier; confidence: number }>;

    return { preparedArtifacts, preparedRubrics };
  }, [artifacts, rubrics]);

  const completeness = useMemo(() => {
    const { preparedArtifacts, preparedRubrics } = buildPayload();
    return evaluateWizardCompleteness({
      ...data,
      artifacts: preparedArtifacts,
      rubrics: preparedRubrics
    });
  }, [buildPayload, data]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const filledArtifacts = artifacts.filter(artifact => artifact.name.trim() && artifact.description.trim());
    if (!filledArtifacts.length) {
      newErrors.artifacts = 'Add at least one artifact with a name and description.';
    }

    if (!newErrors.artifacts) {
      const unlinked = filledArtifacts.filter(artifact => artifact.rubricIds.length === 0);
      if (unlinked.length) {
        newErrors.artifacts = 'Link each artifact to at least one rubric so the chat can coach toward that evidence.';
      }
    }

    const filledRubrics = rubrics.filter(rubric => rubric.name.trim() && rubric.criteria.length);
    if (!filledRubrics.length) {
      newErrors.rubrics = 'Create a rubric with at least one criterion to assess the artifacts you selected.';
    }

    if (!newErrors.rubrics) {
      const hasEmptyDescriptors = filledRubrics.some(rubric =>
        rubric.criteria.some(criterion =>
          !criterion.name.trim() ||
          criterion.levels.some(level => !level.descriptor.trim())
        )
      );
      if (hasEmptyDescriptors) {
        newErrors.rubrics = 'Each criterion needs descriptors for every performance level to guide feedback.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const { preparedArtifacts, preparedRubrics } = buildPayload();

    onUpdate({
      artifacts: preparedArtifacts,
      rubrics: preparedRubrics
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Plan the Artifacts & Rubrics that Anchor Assessment
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Capture the deliverables students will create and the rubrics you will use to assess them. These inputs feed the chat handoff so the assistant can coach toward meaningful evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">Overall readiness</p>
          <p className="text-2xl font-bold text-primary-900 dark:text-primary-200">{completeness.summary.overall}%</p>
          <p className="text-xs text-primary-700 dark:text-primary-300">Balanced view of core, context, and progressive inputs.</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Progressive signals</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{completeness.progressive.percentage}%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Artifacts, rubrics, differentiation, evidence, logistics.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Still missing</p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            {completeness.progressive.missing.length ? completeness.progressive.missing.map(item => (
              <li key={item}>• {item}</li>
            )) : (
              <li>Looks good—progressive coverage unlocked.</li>
            )}
          </ul>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {ARTIFACT_LIBRARY.map(template => (
          <button
            key={template.id}
            onClick={() => addArtifact(template)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-left hover:border-primary-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <ClipboardList className="w-5 h-5 text-primary-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{template.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
                {template.milestoneHint && (
                  <p className="text-xs text-slate-400 mt-2">{template.milestoneHint}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            Artifacts to Collect
          </h4>
          <button
            onClick={() => addArtifact()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
          >
            <Plus className="w-4 h-4" />
            Add Artifact
          </button>
        </div>

        <div className="space-y-4">
          {artifacts.map(artifact => (
            <div
              key={artifact.id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={artifact.name}
                    onChange={event => updateArtifact(artifact.id, { name: event.target.value })}
                    className="w-full text-lg font-semibold bg-transparent border-b border-transparent focus:border-primary-500 focus:outline-none text-slate-800 dark:text-slate-100"
                    placeholder="Artifact name (e.g., Final Presentation Deck)"
                  />

                  <textarea
                    value={artifact.description}
                    onChange={event => updateArtifact(artifact.id, { description: event.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:border-primary-500 focus:outline-none"
                    placeholder="Describe what evidence this artifact will capture and how it matters."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Link to Milestone
                      </label>
                      <select
                        value={artifact.milestoneId}
                        onChange={event => updateArtifact(artifact.id, { milestoneId: event.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="">Select milestone</option>
                        {milestoneOptions.map(option => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Tier Emphasis
                      </label>
                      <div className="flex gap-2">
                        {tierOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => updateArtifact(artifact.id, { tier: option.value })}
                            type="button"
                            className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors
                              ${artifact.tier === option.value
                                ? 'border-primary-500 text-primary-700 bg-primary-50 dark:bg-primary-900/30'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Confidence
                      </label>
                      <input
                        type="range"
                        min={0.5}
                        max={0.95}
                        step={0.05}
                        value={artifact.confidence}
                        onChange={event => updateArtifact(artifact.id, { confidence: parseFloat(event.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500 mt-1">{Math.round(artifact.confidence * 100)}% ready</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Rubrics
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {rubrics.map(rubric => {
                        const isSelected = artifact.rubricIds.includes(rubric.id);
                        return (
                          <button
                            key={rubric.id}
                            onClick={() => toggleArtifactRubric(artifact.id, rubric.id)}
                            type="button"
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1
                              ${isSelected
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'}
                            `}
                          >
                            {isSelected && <CheckCircle className="w-4 h-4" />}
                            {rubric.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Optional exemplar link or note
                    </label>
                    <input
                      type="text"
                      value={artifact.exemplar || ''}
                      onChange={event => updateArtifact(artifact.id, { exemplar: event.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      placeholder="Link to exemplar or outline expectations"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeArtifact(artifact.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {!artifacts.length && (
            <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
              Add at least one artifact to capture the learning evidence you want the AI to coach toward.
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Rubrics & Criteria
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={addRubric}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
            >
              <Plus className="w-4 h-4" />
              Add Rubric
            </button>
            <button
              onClick={() => addRubricFromTemplate(RUBRIC_LIBRARY[1])}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Sparkles className="w-4 h-4" />
              Generate from template
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {RUBRIC_LIBRARY.map(template => (
            <button
              key={template.id}
              onClick={() => addRubricFromTemplate(template)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-left hover:border-purple-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <Wand2 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{template.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.summary}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {rubrics.map(rubric => (
            <div
              key={rubric.id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={rubric.name}
                    onChange={event => updateRubric(rubric.id, { name: event.target.value })}
                    className="w-full text-lg font-semibold bg-transparent border-b border-transparent focus:border-purple-500 focus:outline-none text-slate-800 dark:text-slate-100"
                    placeholder="Rubric name (e.g., Final Product Quality)"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Scale
                      </label>
                      <select
                        value={rubric.scaleLabel || '1-4'}
                        onChange={event => {
                          const newScale = event.target.value as RubricScale;
                          updateRubric(rubric.id, {
                            scaleLabel: newScale,
                            criteria: rubric.criteria.map(criterion => ({
                              ...criterion,
                              levels: createDefaultLevels(newScale)
                            }))
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        {scaleOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Tier Emphasis
                      </label>
                      <select
                        value={rubric.tier}
                        onChange={event => updateRubric(rubric.id, { tier: event.target.value as Tier })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        {tierOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Confidence
                      </label>
                      <input
                        type="range"
                        min={0.5}
                        max={0.95}
                        step={0.05}
                        value={rubric.confidence}
                        onChange={event => updateRubric(rubric.id, { confidence: parseFloat(event.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500 mt-1">{Math.round(rubric.confidence * 100)}% ready</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rubric.useStudentLanguage}
                        onChange={event => updateRubric(rubric.id, { useStudentLanguage: event.target.checked })}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label className="text-sm text-slate-600 dark:text-slate-300">
                        Student-friendly language
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {rubric.criteria.map(criterion => (
                      <div key={criterion.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={criterion.name}
                              onChange={event => updateCriterion(rubric.id, criterion.id, { name: event.target.value })}
                              className="w-full text-sm font-semibold bg-transparent border-b border-transparent focus:border-purple-400 focus:outline-none text-slate-800 dark:text-slate-100"
                              placeholder="Criterion name"
                            />
                            <textarea
                              value={criterion.description || ''}
                              onChange={event => updateCriterion(rubric.id, criterion.id, { description: event.target.value })}
                              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                              rows={2}
                              placeholder="What does this criterion measure?"
                            />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {criterion.levels.map(level => (
                                <div key={level.value} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                                  <p className="text-xs font-semibold text-slate-500 uppercase">{level.label}</p>
                                  <textarea
                                    value={level.descriptor}
                                    onChange={event => updateLevelDescriptor(rubric.id, criterion.id, level.value, event.target.value)}
                                    className="w-full mt-1 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    rows={3}
                                    placeholder="Descriptor"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCriterion(rubric.id, criterion.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addCriterionToRubric(rubric.id)}
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add criterion
                  </button>
                </div>

                <button
                  onClick={() => removeRubric(rubric.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {(errors.artifacts || errors.rubrics) && (
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            {errors.artifacts && <p>{errors.artifacts}</p>}
            {errors.rubrics && <p>{errors.rubrics}</p>}
          </div>
        </div>
      )}

      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
          <div className="space-y-1 text-sm text-primary-800 dark:text-primary-200">
            <p><strong>Keep the loop tight:</strong> every artifact you add should map to milestones and a rubric criterion so the chat can surface actionable next steps.</p>
            <p><strong>Need inspiration?</strong> Use the templates above or capture notes in the exemplar field—those sync to the chat for follow-up coaching.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg"
        >
          Continue to Differentiation & Roles
        </button>
      </div>
    </div>
  );
};
