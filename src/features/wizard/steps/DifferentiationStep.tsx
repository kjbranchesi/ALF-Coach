import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  Globe,
  Brain,
  AlertCircle
} from 'lucide-react';
import type { StepComponentProps } from '../types';
import type { Scaffold, Tier } from '../../../types/alf';
import { evaluateWizardCompleteness } from '../../../utils/completeness/wizardCompleteness';

interface RoleFormState {
  id: string;
  name: string;
  responsibilities: string[];
  tier: Tier;
  confidence: number;
}

interface TieredAssignmentForm {
  id: string;
  level: string;
  modifications: string;
}

interface DifferentiationState {
  tier: Tier;
  confidence: number;
  tieredAssignments: TieredAssignmentForm[];
  udl: {
    representation: string[];
    action: string[];
    engagement: string[];
  };
  languageSupports: string[];
  executiveFunctionSupports: string[];
  accommodations: string;
}

type ScaffoldFormState = Scaffold & {
  tier: Tier;
  confidence: number;
};

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;

const tierOptions: Array<{ value: Tier; label: string }> = [
  { value: 'core', label: 'Core' },
  { value: 'scaffold', label: 'Scaffold' },
  { value: 'aspirational', label: 'Aspirational' }
];

const ROLE_LIBRARY: Array<{ id: string; name: string; responsibilities: string[]; tier: Tier }> = [
  {
    id: 'project-manager',
    name: 'Project Manager',
    responsibilities: ['Facilitate daily stand-ups', 'Monitor progress and update the timeline', 'Support team task assignments'],
    tier: 'core'
  },
  {
    id: 'research-lead',
    name: 'Research Lead',
    responsibilities: ['Gather and vet sources', 'Synthesize findings for the team', 'Model note-taking protocols'],
    tier: 'core'
  },
  {
    id: 'community-liaison',
    name: 'Community Liaison',
    responsibilities: ['Coordinate with partners or stakeholders', 'Prepare interview questions or outreach scripts', 'Capture partner feedback'],
    tier: 'scaffold'
  },
  {
    id: 'storyteller',
    name: 'Storyteller / Media Lead',
    responsibilities: ['Document project milestones', 'Capture photos/video/audio evidence', 'Prepare showcase narrative assets'],
    tier: 'aspirational'
  }
];

const UDL_LIBRARY = {
  representation: [
    'Provide models and exemplars',
    'Offer graphic organizers',
    'Chunk complex texts with glossaries',
    'Embed visuals and multimedia cues'
  ],
  action: [
    'Choice of product format',
    'Flexible grouping or roles',
    'Checkpoint rubrics for iteration',
    'Mini-workshops for targeted skills'
  ],
  engagement: [
    'Student goal-setting conferences',
    'Reflection prompts after each phase',
    'Celebrate risk-taking and iteration',
    'Gamify sprint milestones'
  ]
};

const LANGUAGE_SUPPORT_LIBRARY = [
  'Sentence frames for academic discourse',
  'Word walls / concept maps',
  'Bilingual glossaries or translations',
  'Peer language buddies'
];

const EXEC_FUNCTION_LIBRARY = [
  'Weekly task trackers',
  'Timed sprints with visible countdowns',
  'Teacher check-ins for planning',
  'Anchor charts for self-management routines'
];

const SCAFFOLD_LIBRARY: Array<{ id: string; name: string; description: string; tier: Tier }> = [
  {
    id: 'progress-logs',
    name: 'Progress Log Template',
    description: 'Daily stand-up prompts and status tracker to visualize progress.',
    tier: 'core'
  },
  {
    id: 'feedback-protocol',
    name: 'Peer Feedback Protocol',
    description: 'Structured critique protocol (warm/cool feedback, TAG, etc.).',
    tier: 'scaffold'
  },
  {
    id: 'exemplar-gallery',
    name: 'Exemplar Gallery Walk',
    description: 'Curated gallery of past projects or exemplars to analyze quality.',
    tier: 'aspirational'
  }
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const toStringValue = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);
const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter((item): item is string => typeof item === 'string');
};
const toNumberValue = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined);
const isTier = (value: unknown): value is Tier => value === 'core' || value === 'scaffold' || value === 'aspirational';
const normalizeTier = (value: string): Tier => (isTier(value) ? value : 'scaffold');

export const DifferentiationStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const initialRoles = useMemo(() => {
    if (!Array.isArray(data.studentRoles) || !data.studentRoles.length) {
      return ROLE_LIBRARY.slice(0, 2).map(template => ({
        id: generateId('role'),
        name: template.name,
        responsibilities: [...template.responsibilities],
        tier: template.tier,
        confidence: 0.8
      } satisfies RoleFormState));
    }

    return data.studentRoles.map(role => {
      if (!isRecord(role)) {
        return {
          id: generateId('role'),
          name: '',
          responsibilities: [''],
          tier: 'core',
          confidence: 0.75
        };
      }

      const name = toStringValue(role.role) ?? toStringValue(role.name) ?? '';
      const responsibilities = toStringArray(role.responsibilities) ?? [''];
      const tier = isTier(role.tier) ? role.tier : 'core';
      const confidence = toNumberValue(role.confidence) ?? 0.75;

      return {
        id: toStringValue(role.id) ?? generateId('role'),
        name,
        responsibilities: responsibilities.length ? responsibilities : [''],
        tier,
        confidence
      } satisfies RoleFormState;
    });
  }, [data.studentRoles]);

  const initialDifferentiation: DifferentiationState = useMemo(() => {
    if (!isRecord(data.differentiation)) {
      return {
        tier: 'scaffold',
        confidence: 0.75,
        tieredAssignments: [
          {
            id: generateId('assignment'),
            level: 'On-Ramp Support',
            modifications: 'Provide sentence starters and vocabulary mini-lesson.'
          },
          {
            id: generateId('assignment'),
            level: 'Core Path',
            modifications: 'Standard task expectations with progress check at midpoint.'
          },
          {
            id: generateId('assignment'),
            level: 'Extended Challenge',
            modifications: 'Add community interview requirement and data visualization.'
          }
        ],
        udl: {
          representation: [UDL_LIBRARY.representation[0]],
          action: [UDL_LIBRARY.action[0]],
          engagement: [UDL_LIBRARY.engagement[0]]
        },
        languageSupports: [LANGUAGE_SUPPORT_LIBRARY[0]],
        executiveFunctionSupports: [EXEC_FUNCTION_LIBRARY[0]],
        accommodations: ''
      };
    }

    const differentiationRecord: Record<string, unknown> = data.differentiation;

    const tieredAssignmentsSource = Array.isArray(differentiationRecord.tieredAssignments)
      ? differentiationRecord.tieredAssignments
      : [];

    const tieredAssignments = tieredAssignmentsSource.map(entry => {
      if (!isRecord(entry)) {
        return {
          id: generateId('assignment'),
          level: '',
          modifications: ''
        } satisfies TieredAssignmentForm;
      }

      const level = toStringValue(entry.level) ?? '';
      const modifications = toStringArray(entry.modifications)?.join('\n') ?? '';
      return {
        id: toStringValue(entry.id) ?? generateId('assignment'),
        level,
        modifications
      } satisfies TieredAssignmentForm;
    });

    const udlSource = isRecord(differentiationRecord.udlStrategies) ? differentiationRecord.udlStrategies : {};
    const languageSupports = toStringArray(differentiationRecord.languageSupports) ?? [];
    const executiveFunctionSupports = toStringArray(differentiationRecord.executiveFunctionSupports) ?? [];
    const accommodationsArray = toStringArray(differentiationRecord.accommodations) ?? [];

    return {
      tier: isTier(differentiationRecord.tier) ? differentiationRecord.tier : 'scaffold',
      confidence: toNumberValue(differentiationRecord.confidence) ?? 0.75,
      tieredAssignments: tieredAssignments.length ? tieredAssignments : [
        {
          id: generateId('assignment'),
          level: '',
          modifications: ''
        }
      ],
      udl: {
        representation: toStringArray(udlSource.representation) ?? [],
        action: toStringArray(udlSource.action) ?? [],
        engagement: toStringArray(udlSource.engagement) ?? []
      },
      languageSupports,
      executiveFunctionSupports,
      accommodations: accommodationsArray.join('\n')
    };
  }, [data.differentiation]);

  const initialScaffolds = useMemo(() => {
    if (!Array.isArray(data.scaffolds) || !data.scaffolds.length) {
      return SCAFFOLD_LIBRARY.slice(0, 2).map(template => ({
        id: generateId('scaffold'),
        name: template.name,
        description: template.description,
        templateLink: undefined,
        tier: template.tier,
        confidence: 0.75
      } satisfies ScaffoldFormState));
    }

    return data.scaffolds.map(scaffold => {
      if (!isRecord(scaffold)) {
        return {
          id: generateId('scaffold'),
          name: '',
          description: '',
          templateLink: undefined,
          tier: 'scaffold',
          confidence: 0.7
        } satisfies ScaffoldFormState;
      }

      const id = toStringValue(scaffold.id) ?? generateId('scaffold');
      const name = toStringValue(scaffold.name) ?? '';
      const description = toStringValue(scaffold.description) ?? '';
      const templateLink = toStringValue(scaffold.templateLink);
      const tier = isTier(scaffold.tier) ? scaffold.tier : 'scaffold';
      const confidence = toNumberValue(scaffold.confidence) ?? 0.7;

      return {
        id,
        name,
        description,
        templateLink,
        tier,
        confidence
      } satisfies ScaffoldFormState;
    });
  }, [data.scaffolds]);

  const [roles, setRoles] = useState<RoleFormState[]>(initialRoles);
  const [differentiation, setDifferentiation] = useState<DifferentiationState>(initialDifferentiation);
  const [scaffolds, setScaffolds] = useState<ScaffoldFormState[]>(initialScaffolds);
  const [languageInput, setLanguageInput] = useState('');
  const [executiveInput, setExecutiveInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter(item => item !== value) : [...list, value];

  const addRole = (template?: typeof ROLE_LIBRARY[number]) => {
    const base = template ?? ROLE_LIBRARY[0];
    setRoles(prev => [
      ...prev,
      {
        id: generateId('role'),
        name: base?.name || 'New Role',
        responsibilities: base?.responsibilities ? [...base.responsibilities] : [''],
        tier: base?.tier || 'scaffold',
        confidence: 0.75
      }
    ]);
  };

  const updateRole = (roleId: string, updates: Partial<RoleFormState>) => {
    setRoles(prev => prev.map(role => (role.id === roleId ? { ...role, ...updates } : role)));
  };

  const updateRoleResponsibility = (roleId: string, index: number, value: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) {
        return role;
      }
      const responsibilities = [...role.responsibilities];
      responsibilities[index] = value;
      return { ...role, responsibilities };
    }));
  };

  const addRoleResponsibility = (roleId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) {
        return role;
      }
      return { ...role, responsibilities: [...role.responsibilities, ''] };
    }));
  };

  const removeRoleResponsibility = (roleId: string, index: number) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) {
        return role;
      }
      const responsibilities = role.responsibilities.filter((_, idx) => idx !== index);
      return { ...role, responsibilities: responsibilities.length ? responsibilities : [''] };
    }));
  };

  const removeRole = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
  };

  const addTieredAssignment = () => {
    setDifferentiation(prev => ({
      ...prev,
      tieredAssignments: [
        ...prev.tieredAssignments,
        {
          id: generateId('assignment'),
          level: '',
          modifications: ''
        }
      ]
    }));
  };

  const updateTieredAssignment = (assignmentId: string, updates: Partial<TieredAssignmentForm>) => {
    setDifferentiation(prev => ({
      ...prev,
      tieredAssignments: prev.tieredAssignments.map(assignment =>
        assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
      )
    }));
  };

  const removeTieredAssignment = (assignmentId: string) => {
    setDifferentiation(prev => ({
      ...prev,
      tieredAssignments: prev.tieredAssignments.filter(assignment => assignment.id !== assignmentId)
    }));
  };

  const addLanguageSupport = () => {
    const trimmed = languageInput.trim();
    if (!trimmed) {
      return;
    }
    setDifferentiation(prev => ({
      ...prev,
      languageSupports: prev.languageSupports.includes(trimmed)
        ? prev.languageSupports
        : [...prev.languageSupports, trimmed]
    }));
    setLanguageInput('');
  };

  const addExecutiveSupport = () => {
    const trimmed = executiveInput.trim();
    if (!trimmed) {
      return;
    }
    setDifferentiation(prev => ({
      ...prev,
      executiveFunctionSupports: prev.executiveFunctionSupports.includes(trimmed)
        ? prev.executiveFunctionSupports
        : [...prev.executiveFunctionSupports, trimmed]
    }));
    setExecutiveInput('');
  };

  const removeLanguageSupport = (value: string) => {
    setDifferentiation(prev => ({
      ...prev,
      languageSupports: prev.languageSupports.filter(item => item !== value)
    }));
  };

  const removeExecutiveSupport = (value: string) => {
    setDifferentiation(prev => ({
      ...prev,
      executiveFunctionSupports: prev.executiveFunctionSupports.filter(item => item !== value)
    }));
  };

  const addScaffold = (template?: typeof SCAFFOLD_LIBRARY[number]) => {
    const base = template ?? SCAFFOLD_LIBRARY[0];
    setScaffolds(prev => [
      ...prev,
      {
        id: generateId('scaffold'),
        name: base?.name || 'New Scaffold',
        description: base?.description || '',
        templateLink: undefined,
        tier: base?.tier || 'scaffold',
        confidence: 0.7
      }
    ]);
  };

  const updateScaffold = (scaffoldId: string, updates: Partial<ScaffoldFormState>) => {
    setScaffolds(prev => prev.map(scaffold => (scaffold.id === scaffoldId ? { ...scaffold, ...updates } : scaffold)));
  };

  const removeScaffold = (scaffoldId: string) => {
    setScaffolds(prev => prev.filter(scaffold => scaffold.id !== scaffoldId));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!roles.some(role => role.name.trim())) {
      newErrors.roles = 'Add at least one student role so the AI can coach teams toward ownership.';
    }

    const hasDifferentiationSignal =
      differentiation.tieredAssignments.some(item => item.level.trim() || item.modifications.trim()) ||
      differentiation.udl.representation.length > 0 ||
      differentiation.udl.action.length > 0 ||
      differentiation.udl.engagement.length > 0 ||
      differentiation.languageSupports.length > 0 ||
      differentiation.executiveFunctionSupports.length > 0 ||
      differentiation.accommodations.trim().length > 0;

    if (!hasDifferentiationSignal) {
      newErrors.supports = 'Select or describe at least one differentiation support so future prompts can maintain equity.';
    }

    if (!scaffolds.some(scaffold => scaffold.name.trim() && scaffold.description.trim())) {
      newErrors.scaffolds = 'Document at least one scaffold or tool that keeps learners on track.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = useCallback(() => {
    const rolePayload = roles
      .filter(role => role.name.trim())
      .map(role => ({
        id: role.id,
        role: role.name.trim(),
        responsibilities: role.responsibilities.map(item => item.trim()).filter(Boolean),
        tier: role.tier,
        confidence: role.confidence
      }));

    const tieredAssignments = differentiation.tieredAssignments
      .filter(assignment => assignment.level.trim() || assignment.modifications.trim())
      .map(assignment => ({
        level: assignment.level.trim(),
        modifications: assignment.modifications
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean)
      }));

    const diffPayload = {
      tier: differentiation.tier,
      confidence: differentiation.confidence,
      tieredAssignments,
      udlStrategies: {
        representation: differentiation.udl.representation,
        action: differentiation.udl.action,
        engagement: differentiation.udl.engagement
      },
      languageSupports: differentiation.languageSupports,
      executiveFunctionSupports: differentiation.executiveFunctionSupports,
      accommodations: differentiation.accommodations
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean)
    };

    const scaffoldPayload = scaffolds
      .filter(scaffold => scaffold.name.trim())
      .map(scaffold => ({
        id: scaffold.id,
        name: scaffold.name.trim(),
        description: scaffold.description.trim(),
        templateLink: scaffold.templateLink?.trim() || undefined,
        tier: scaffold.tier,
        confidence: scaffold.confidence
      }));

    return { rolePayload, diffPayload, scaffoldPayload };
  }, [roles, differentiation, scaffolds]);

  const completeness = useMemo(() => {
    const { rolePayload, diffPayload, scaffoldPayload } = buildPayload();
    return evaluateWizardCompleteness({
      ...data,
      studentRoles: rolePayload,
      differentiation: diffPayload,
      scaffolds: scaffoldPayload
    });
  }, [buildPayload, data]);

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const { rolePayload, diffPayload, scaffoldPayload } = buildPayload();

    onUpdate({
      studentRoles: rolePayload,
      differentiation: diffPayload,
      scaffolds: scaffoldPayload
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Plan Differentiation, Roles, and Scaffolds
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Capture how you will distribute responsibility, support diverse learners, and provide scaffolds so every student can thrive in the project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">Overall readiness</p>
          <p className="text-2xl font-bold text-primary-900 dark:text-primary-200">{completeness.summary.overall}%</p>
          <p className="text-xs text-primary-700 dark:text-primary-300">How close you are to a hero-ready blueprint.</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Progressive coverage</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{completeness.progressive.percentage}%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Differentiation, roles, scaffolds, and logistics signals.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Missing ingredients</p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            {completeness.progressive.missing.length ? completeness.progressive.missing.map(item => (
              <li key={item}>• {item}</li>
            )) : (
              <li>Great coverage—chat can focus on polish.</li>
            )}
          </ul>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Student Roles & Ownership
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => addRole()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
            >
              <Plus className="w-4 h-4" />
              Add Custom Role
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ROLE_LIBRARY.map(template => (
            <button
              key={template.id}
              onClick={() => addRole(template)}
              className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{template.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {template.responsibilities.slice(0, 2).join(' • ')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={role.name}
                    onChange={event => updateRole(role.id, { name: event.target.value })}
                    className="w-full text-lg font-semibold bg-transparent border-b border-transparent focus:border-primary-500 focus:outline-none text-slate-800 dark:text-slate-100"
                    placeholder="Role name (e.g., Facilitator, Research Lead)"
                  />

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsibilities</p>
                    {role.responsibilities.map((responsibility, index) => (
                      <div key={`${role.id}-resp-${index}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={responsibility}
                          onChange={event => updateRoleResponsibility(role.id, index, event.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                          placeholder="Describe how this role contributes"
                        />
                        <button
                          onClick={() => removeRoleResponsibility(role.id, index)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addRoleResponsibility(role.id)}
                      className="text-sm text-primary-600 dark:text-primary-300 hover:underline"
                    >
                      + Add responsibility
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Tier
                      </label>
                      <select
                        value={role.tier}
                        onChange={event => updateRole(role.id, { tier: normalizeTier(event.target.value) })}
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
                        value={role.confidence}
                        onChange={event => updateRole(role.id, { confidence: parseFloat(event.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500 mt-1">{Math.round(role.confidence * 100)}% ready</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeRole(role.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Differentiation Supports & UDL Strategy
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(['representation', 'action', 'engagement'] as const).map(category => (
            <div key={category} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                {category === 'representation' && 'Multiple Means of Representation'}
                {category === 'action' && 'Multiple Means of Action'}
                {category === 'engagement' && 'Multiple Means of Engagement'}
              </p>
              <div className="space-y-2">
                {UDL_LIBRARY[category].map(option => {
                  const isSelected = differentiation.udl[category].includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() =>
                        setDifferentiation(prev => ({
                          ...prev,
                          udl: {
                            ...prev.udl,
                            [category]: toggleValue(prev.udl[category], option)
                          }
                        }))
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'}
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Globe className="w-5 h-5 text-blue-600" />
              Language Supports
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_SUPPORT_LIBRARY.map(option => {
                const isSelected = differentiation.languageSupports.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() =>
                      setDifferentiation(prev => ({
                        ...prev,
                        languageSupports: toggleValue(prev.languageSupports, option)
                      }))
                    }
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'}
                    `}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={languageInput}
                onChange={event => setLanguageInput(event.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                placeholder="Add custom language support"
              />
              <button
                onClick={addLanguageSupport}
                className="px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {differentiation.languageSupports.map(value => (
                <span key={value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 rounded-full text-xs">
                  {value}
                  <button onClick={() => removeLanguageSupport(value)} className="text-blue-500 hover:text-blue-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Brain className="w-5 h-5 text-amber-600" />
              Executive Function Supports
            </div>
            <div className="flex flex-wrap gap-2">
              {EXEC_FUNCTION_LIBRARY.map(option => {
                const isSelected = differentiation.executiveFunctionSupports.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() =>
                      setDifferentiation(prev => ({
                        ...prev,
                        executiveFunctionSupports: toggleValue(prev.executiveFunctionSupports, option)
                      }))
                    }
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'}
                    `}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={executiveInput}
                onChange={event => setExecutiveInput(event.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                placeholder="Add custom executive function support"
              />
              <button
                onClick={addExecutiveSupport}
                className="px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {differentiation.executiveFunctionSupports.map(value => (
                <span key={value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 rounded-full text-xs">
                  {value}
                  <button onClick={() => removeExecutiveSupport(value)} className="text-amber-500 hover:text-amber-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Layers className="w-5 h-5 text-purple-600" />
                Tiered Assignments
              </div>
              <button
                onClick={addTieredAssignment}
                className="text-sm text-purple-600 dark:text-purple-300 hover:underline"
              >
                + Add tier
              </button>
            </div>
            <div className="space-y-3">
              {differentiation.tieredAssignments.map(assignment => (
                <div key={assignment.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={assignment.level}
                        onChange={event => updateTieredAssignment(assignment.id, { level: event.target.value })}
                        className="w-full text-sm font-semibold bg-transparent border-b border-transparent focus:border-purple-500 focus:outline-none"
                        placeholder="Tier name (e.g., Core Path)"
                      />
                      <textarea
                        rows={2}
                        value={assignment.modifications}
                        onChange={event => updateTieredAssignment(assignment.id, { modifications: event.target.value })}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        placeholder="List modifications or supports (one per line)"
                      />
                    </div>
                    <button
                      onClick={() => removeTieredAssignment(assignment.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Accommodations / Additional Notes</p>
            <textarea
              rows={6}
              value={differentiation.accommodations}
              onChange={event => setDifferentiation(prev => ({ ...prev, accommodations: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="List IEP/504 accommodations, co-teaching moves, or other supports."
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Tier focus
                </label>
                <select
                  value={differentiation.tier}
                  onChange={event => setDifferentiation(prev => ({ ...prev, tier: normalizeTier(event.target.value) }))}
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
                  value={differentiation.confidence}
                  onChange={event => setDifferentiation(prev => ({ ...prev, confidence: parseFloat(event.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">{Math.round(differentiation.confidence * 100)}% ready</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Scaffolds & Resources
          </h4>
          <button
            onClick={() => addScaffold()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
          >
            <Plus className="w-4 h-4" />
            Add Scaffold
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCAFFOLD_LIBRARY.map(template => (
            <button
              key={template.id}
              onClick={() => addScaffold(template)}
              className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{template.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {scaffolds.map(scaffold => (
            <div key={scaffold.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={scaffold.name}
                    onChange={event => updateScaffold(scaffold.id, { name: event.target.value })}
                    className="w-full text-lg font-semibold bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                    placeholder="Scaffold name"
                  />
                  <textarea
                    rows={2}
                    value={scaffold.description}
                    onChange={event => updateScaffold(scaffold.id, { description: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Explain how this resource supports learners."
                  />
                  <input
                    type="text"
                    value={scaffold.templateLink || ''}
                    onChange={event => updateScaffold(scaffold.id, { templateLink: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Optional link to template or resource"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={scaffold.tier}
                      onChange={event => updateScaffold(scaffold.id, { tier: normalizeTier(event.target.value) })}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                      {tierOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <div>
                      <input
                        type="range"
                        min={0.5}
                        max={0.95}
                        step={0.05}
                        value={scaffold.confidence}
                        onChange={event => updateScaffold(scaffold.id, { confidence: parseFloat(event.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500 mt-1">{Math.round(scaffold.confidence * 100)}% ready</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeScaffold(scaffold.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {(errors.roles || errors.supports || errors.scaffolds) && (
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            {errors.roles && <p>{errors.roles}</p>}
            {errors.supports && <p>{errors.supports}</p>}
            {errors.scaffolds && <p>{errors.scaffolds}</p>}
          </div>
        </div>
      )}

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
          Continue to Logistics & Evidence
        </button>
      </div>
    </div>
  );
};
