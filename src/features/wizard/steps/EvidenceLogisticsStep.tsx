import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  Mail,
  Users,
  Building2,
  ShieldAlert,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { StepComponentProps } from '../types';
import type { Tier } from '../../../types/alf';
import { evaluateWizardCompleteness } from '../../../utils/completeness/wizardCompleteness';

interface CheckpointForm {
  id: string;
  date: string;
  type: string;
  evidence: string;
  storage: string;
}

interface EvidencePlanState {
  checkpoints: CheckpointForm[];
  permissions: string[];
  storagePlan: string;
  dataManagement: string;
}

interface CommunicationPartnerForm {
  id: string;
  name: string;
  role: string;
  communication: string;
}

interface CommunicationsState {
  familyLetter: string;
  familyUpdates: string;
  adminOverview: string;
  adminAlignment: string;
  partners: CommunicationPartnerForm[];
}

interface ExhibitionState {
  format: string;
  audience: string[];
  date: string;
  venue: string;
  preparation: string;
  tier: Tier;
  confidence: number;
}

interface RiskForm {
  id: string;
  name: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

interface ContingencyForm {
  id: string;
  scenario: string;
  plan: string;
}

interface RiskManagementState {
  risks: RiskForm[];
  contingencies: ContingencyForm[];
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;

const STORAGE_OPTIONS = ['Shared drive', 'LMS submission', 'Printed portfolios', 'Photo/video archive'];
const PERMISSION_OPTIONS = ['Photo/video release', 'Partner release required', 'Parental consent needed', 'Recording policy'];
const EXHIBITION_FORMATS = ['Gallery walk', 'Pitch panel', 'Community expo', 'Digital showcase', 'Celebration of learning'];
const EXHIBITION_AUDIENCES = ['Families', 'Administrators', 'Community partners', 'Students', 'Media/press'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const toStringValue = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);
const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter((item): item is string => typeof item === 'string');
};
const isTier = (value: unknown): value is Tier => value === 'core' || value === 'scaffold' || value === 'aspirational';
const normalizeTier = (value: string): Tier => (isTier(value) ? value : 'scaffold');
const LIKELIHOOD_VALUES: Array<RiskForm['likelihood']> = ['low', 'medium', 'high'];
const IMPACT_VALUES: Array<RiskForm['impact']> = ['low', 'medium', 'high'];
const normalizeLikelihood = (value: string): RiskForm['likelihood'] =>
  (LIKELIHOOD_VALUES.includes(value as RiskForm['likelihood']) ? (value as RiskForm['likelihood']) : 'medium');
const normalizeImpact = (value: string): RiskForm['impact'] =>
  (IMPACT_VALUES.includes(value as RiskForm['impact']) ? (value as RiskForm['impact']) : 'medium');

export const EvidenceLogisticsStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const initialEvidencePlan: EvidencePlanState = useMemo(() => {
    if (isRecord(data.evidencePlan)) {
      const evidencePlanRecord: Record<string, unknown> = data.evidencePlan;
      const checkpointsSource = Array.isArray(evidencePlanRecord.checkpoints) ? evidencePlanRecord.checkpoints : [];
      const checkpoints = checkpointsSource.map(checkpoint => {
        if (!isRecord(checkpoint)) {
          return {
            id: generateId('checkpoint'),
            date: '',
            type: '',
            evidence: '',
            storage: ''
          } satisfies CheckpointForm;
        }

        const evidenceList = toStringArray(checkpoint.evidence) ?? [];
        return {
          id: toStringValue(checkpoint.id) ?? generateId('checkpoint'),
          date: toStringValue(checkpoint.date) ?? '',
          type: toStringValue(checkpoint.type) ?? '',
          evidence: evidenceList.join('\n'),
          storage: toStringValue(checkpoint.storage) ?? ''
        } satisfies CheckpointForm;
      });

      return {
        checkpoints: checkpoints.length
          ? checkpoints
          : [
              {
                id: generateId('checkpoint'),
                date: '',
                type: '',
                evidence: '',
                storage: ''
              }
            ],
        permissions: toStringArray(evidencePlanRecord.permissions) ?? [],
        storagePlan: toStringValue(evidencePlanRecord.storage) ?? '',
        dataManagement: toStringValue(evidencePlanRecord.dataManagement) ?? ''
      };
    }

    return {
      checkpoints: [
        {
          id: generateId('checkpoint'),
          date: '',
          type: 'Formative checkpoint',
          evidence: `Exit tickets
Small group observation notes`,
          storage: 'Shared drive'
        }
      ],
      permissions: [PERMISSION_OPTIONS[0]],
      storagePlan: 'Shared drive folder with teacher + student access',
      dataManagement: 'Catalog artifacts weekly; tag evidence with student names and standards.'
    };
  }, [data.evidencePlan]);

  const initialCommunications: CommunicationsState = useMemo(() => {
    if (isRecord(data.communications)) {
      const partnersSource = Array.isArray(data.communications.partners) ? data.communications.partners : [];
      const partners = partnersSource.map(partner => {
        if (!isRecord(partner)) {
          return {
            id: generateId('partner'),
            name: '',
            role: '',
            communication: ''
          } satisfies CommunicationPartnerForm;
        }

        return {
          id: toStringValue(partner.id) ?? generateId('partner'),
          name: toStringValue(partner.name) ?? '',
          role: toStringValue(partner.role) ?? '',
          communication: toStringValue(partner.communication) ?? ''
        } satisfies CommunicationPartnerForm;
      });

      const family = isRecord(data.communications.family) ? data.communications.family : {};
      const admin = isRecord(data.communications.admin) ? data.communications.admin : {};

      return {
        familyLetter: toStringValue(family.letter) ?? '',
        familyUpdates: toStringValue(family.updateSchedule) ?? '',
        adminOverview: toStringValue(admin.overview) ?? '',
        adminAlignment: toStringValue(admin.alignmentDoc) ?? '',
        partners: partners.length ? partners : [{ id: generateId('partner'), name: '', role: '', communication: '' }]
      };
    }

    return {
      familyLetter: 'Dear families, we are launching an authentic project where students will...',
      familyUpdates: 'Weekly Friday updates via email/newsletter',
      adminOverview: 'Project overview highlighting standards, assessment methods, and exhibition plan.',
      adminAlignment: 'Link to standards alignment doc and safety plan.',
      partners: [{ id: generateId('partner'), name: '', role: '', communication: '' }]
    };
  }, [data.communications]);

  const initialExhibition: ExhibitionState = useMemo(() => {
    if (isRecord(data.exhibition)) {
      return {
        format: toStringValue(data.exhibition.format) ?? EXHIBITION_FORMATS[0],
        audience: toStringArray(data.exhibition.audience) ?? [],
        date: toStringValue(data.exhibition.date) ?? '',
        venue: toStringValue(data.exhibition.venue) ?? '',
        preparation: toStringArray(data.exhibition.preparation)?.join('\n') ?? '',
        tier: isTier(data.exhibition.tier) ? data.exhibition.tier : 'scaffold',
        confidence: typeof data.exhibition.confidence === 'number' ? data.exhibition.confidence : 0.7
      };
    }

    return {
      format: EXHIBITION_FORMATS[0],
      audience: ['Families', 'Community partners'],
      date: '',
      venue: 'School multipurpose room',
      preparation: `Rehearse presentation order
Set up gallery displays
Assign student greeters`,
      tier: 'scaffold',
      confidence: 0.7
    };
  }, [data.exhibition]);

  const initialRiskManagement: RiskManagementState = useMemo(() => {
    if (isRecord(data.riskManagement)) {
      const risksSource = Array.isArray(data.riskManagement.risks) ? data.riskManagement.risks : [];
      const contingenciesSource = Array.isArray(data.riskManagement.contingencies) ? data.riskManagement.contingencies : [];

      const risks = risksSource.map(risk => {
        if (!isRecord(risk)) {
          return {
            id: generateId('risk'),
            name: '',
            likelihood: 'medium',
            impact: 'medium',
            mitigation: ''
          } satisfies RiskForm;
        }

        return {
          id: toStringValue(risk.id) ?? generateId('risk'),
          name: toStringValue(risk.name) ?? '',
          likelihood: (toStringValue(risk.likelihood) as RiskForm['likelihood']) ?? 'medium',
          impact: (toStringValue(risk.impact) as RiskForm['impact']) ?? 'medium',
          mitigation: toStringValue(risk.mitigation) ?? ''
        } satisfies RiskForm;
      });

      const contingencies = contingenciesSource.map(item => {
        if (!isRecord(item)) {
          return {
            id: generateId('contingency'),
            scenario: '',
            plan: ''
          } satisfies ContingencyForm;
        }

        return {
          id: toStringValue(item.id) ?? generateId('contingency'),
          scenario: toStringValue(item.scenario) ?? '',
          plan: toStringValue(item.plan) ?? ''
        } satisfies ContingencyForm;
      });

      return {
        risks: risks.length ? risks : [{ id: generateId('risk'), name: '', likelihood: 'medium', impact: 'medium', mitigation: '' }],
        contingencies: contingencies.length ? contingencies : [{ id: generateId('contingency'), scenario: '', plan: '' }]
      };
    }

    return {
      risks: [
        {
          id: generateId('risk'),
          name: 'Field work canceled due to weather',
          likelihood: 'medium',
          impact: 'high',
          mitigation: 'Plan virtual interviews or indoor alternative tasks.'
        }
      ],
      contingencies: [
        {
          id: generateId('contingency'),
          scenario: 'If primary partner cannot attend exhibition',
          plan: 'Invite alternate mentor or set up video message from partner.'
        }
      ]
    };
  }, [data.riskManagement]);

  const [evidencePlan, setEvidencePlan] = useState<EvidencePlanState>(initialEvidencePlan);
  const [communications, setCommunications] = useState<CommunicationsState>(initialCommunications);
  const [exhibition, setExhibition] = useState<ExhibitionState>(initialExhibition);
  const [riskManagement, setRiskManagement] = useState<RiskManagementState>(initialRiskManagement);
  const [permissionsInput, setPermissionsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleAudience = (value: string) => {
    setExhibition(prev => ({
      ...prev,
      audience: prev.audience.includes(value)
        ? prev.audience.filter(item => item !== value)
        : [...prev.audience, value]
    }));
  };

  const addCheckpoint = () => {
    setEvidencePlan(prev => ({
      ...prev,
      checkpoints: [
        ...prev.checkpoints,
        {
          id: generateId('checkpoint'),
          date: '',
          type: '',
          evidence: '',
          storage: ''
        }
      ]
    }));
  };

  const updateCheckpoint = (checkpointId: string, updates: Partial<CheckpointForm>) => {
    setEvidencePlan(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.map(checkpoint =>
        checkpoint.id === checkpointId ? { ...checkpoint, ...updates } : checkpoint
      )
    }));
  };

  const removeCheckpoint = (checkpointId: string) => {
    setEvidencePlan(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.filter(checkpoint => checkpoint.id !== checkpointId)
    }));
  };

  const addPartner = () => {
    setCommunications(prev => ({
      ...prev,
      partners: [...prev.partners, { id: generateId('partner'), name: '', role: '', communication: '' }]
    }));
  };

  const updatePartner = (partnerId: string, updates: Partial<CommunicationPartnerForm>) => {
    setCommunications(prev => ({
      ...prev,
      partners: prev.partners.map(partner =>
        partner.id === partnerId ? { ...partner, ...updates } : partner
      )
    }));
  };

  const removePartner = (partnerId: string) => {
    setCommunications(prev => ({
      ...prev,
      partners: prev.partners.filter(partner => partner.id !== partnerId)
    }));
  };

  const addRisk = () => {
    setRiskManagement(prev => ({
      ...prev,
      risks: [
        ...prev.risks,
        { id: generateId('risk'), name: '', likelihood: 'medium', impact: 'medium', mitigation: '' }
      ]
    }));
  };

  const updateRisk = (riskId: string, updates: Partial<RiskForm>) => {
    setRiskManagement(prev => ({
      ...prev,
      risks: prev.risks.map(risk => (risk.id === riskId ? { ...risk, ...updates } : risk))
    }));
  };

  const removeRisk = (riskId: string) => {
    setRiskManagement(prev => ({
      ...prev,
      risks: prev.risks.filter(risk => risk.id !== riskId)
    }));
  };

  const addContingency = () => {
    setRiskManagement(prev => ({
      ...prev,
      contingencies: [...prev.contingencies, { id: generateId('contingency'), scenario: '', plan: '' }]
    }));
  };

  const updateContingency = (contingencyId: string, updates: Partial<ContingencyForm>) => {
    setRiskManagement(prev => ({
      ...prev,
      contingencies: prev.contingencies.map(contingency =>
        contingency.id === contingencyId ? { ...contingency, ...updates } : contingency
      )
    }));
  };

  const removeContingency = (contingencyId: string) => {
    setRiskManagement(prev => ({
      ...prev,
      contingencies: prev.contingencies.filter(contingency => contingency.id !== contingencyId)
    }));
  };

  const addPermission = () => {
    const trimmed = permissionsInput.trim();
    if (!trimmed) {
      return;
    }
    setEvidencePlan(prev => ({
      ...prev,
      permissions: prev.permissions.includes(trimmed)
        ? prev.permissions
        : [...prev.permissions, trimmed]
    }));
    setPermissionsInput('');
  };

  const removePermission = (value: string) => {
    setEvidencePlan(prev => ({
      ...prev,
      permissions: prev.permissions.filter(item => item !== value)
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!evidencePlan.checkpoints.some(checkpoint => checkpoint.type.trim())) {
      newErrors.evidence = 'Outline at least one evidence checkpoint so the AI knows when to collect artifacts.';
    }

    if (!communications.familyLetter.trim() && !communications.adminOverview.trim()) {
      newErrors.communications = 'Draft a family or admin communication touchpoint to keep stakeholders in the loop.';
    }

    if (!exhibition.format.trim() || !exhibition.audience.length) {
      newErrors.exhibition = 'Select an exhibition format and audience to inform showcase prompts.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = useCallback(() => {
    const evidencePayload = {
      checkpoints: evidencePlan.checkpoints
        .filter(checkpoint => checkpoint.type.trim())
        .map(checkpoint => ({
          id: checkpoint.id,
          date: checkpoint.date,
          type: checkpoint.type.trim(),
          evidence: checkpoint.evidence
            .split('\\n')
            .map(item => item.trim())
            .filter(Boolean),
          storage: checkpoint.storage.trim()
        })),
      permissions: evidencePlan.permissions,
      storage: evidencePlan.storagePlan.trim(),
      dataManagement: evidencePlan.dataManagement.trim()
    };

    const communicationsPayload = {
      family: communications.familyLetter.trim() || communications.familyUpdates.trim()
        ? {
            letter: communications.familyLetter.trim(),
            updateSchedule: communications.familyUpdates.trim() || undefined
          }
        : undefined,
      admin: communications.adminOverview.trim() || communications.adminAlignment.trim()
        ? {
            overview: communications.adminOverview.trim(),
            alignmentDoc: communications.adminAlignment.trim() || undefined
          }
        : undefined,
      partners: communications.partners
        .filter(partner => partner.name.trim() || partner.communication.trim())
        .map(partner => ({
          id: partner.id,
          name: partner.name.trim(),
          role: partner.role.trim(),
          communication: partner.communication.trim()
        }))
    };

    const exhibitionPayload = {
      format: exhibition.format,
      audience: exhibition.audience,
      date: exhibition.date,
      venue: exhibition.venue,
      preparation: exhibition.preparation
        .split('\\n')
        .map(item => item.trim())
        .filter(Boolean),
      tier: exhibition.tier,
      confidence: exhibition.confidence
    };

    const riskPayload = {
      risks: riskManagement.risks
        .filter(risk => risk.name.trim())
        .map(risk => ({
          id: risk.id,
          name: risk.name.trim(),
          likelihood: risk.likelihood,
          impact: risk.impact,
          mitigation: risk.mitigation.trim()
        })),
      contingencies: riskManagement.contingencies
        .filter(contingency => contingency.scenario.trim() || contingency.plan.trim())
        .map(contingency => ({
          id: contingency.id,
          scenario: contingency.scenario.trim(),
          plan: contingency.plan.trim()
        }))
    };

    return { evidencePayload, communicationsPayload, exhibitionPayload, riskPayload };
  }, [evidencePlan, communications, exhibition, riskManagement]);

  const completeness = useMemo(() => {
    const { evidencePayload, communicationsPayload, exhibitionPayload, riskPayload } = buildPayload();
    return evaluateWizardCompleteness({
      ...data,
      evidencePlan: evidencePayload,
      communications: communicationsPayload,
      exhibition: exhibitionPayload,
      riskManagement: riskPayload
    });
  }, [buildPayload, data]);

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const { evidencePayload, communicationsPayload, exhibitionPayload, riskPayload } = buildPayload();

    onUpdate({
      evidencePlan: evidencePayload,
      communications: communicationsPayload,
      exhibition: exhibitionPayload,
      riskManagement: riskPayload
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Logistics, Evidence, and Communication Plans
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Set up the systems that keep your project running smoothly—capture evidence checkpoints, stakeholder communications, exhibition plans, and risk contingencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">Overall readiness</p>
          <p className="text-2xl font-bold text-primary-900 dark:text-primary-200">{completeness.summary.overall}%</p>
          <p className="text-xs text-primary-700 dark:text-primary-300">How complete the blueprint is before handoff.</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Progressive logistics</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{completeness.progressive.percentage}%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Evidence, exhibition, communications, and risk signals.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Missing logistics</p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            {completeness.progressive.missing.length ? completeness.progressive.missing.map(item => (
              <li key={item}>• {item}</li>
            )) : (
              <li>Everything covered—time to confirm and hand off.</li>
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
            <ClipboardList className="w-5 h-5 text-primary-600" />
            Evidence Plan & Checkpoints
          </h4>
          <button
            onClick={addCheckpoint}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
          >
            <Plus className="w-4 h-4" />
            Add checkpoint
          </button>
        </div>

        <div className="space-y-3">
          {evidencePlan.checkpoints.map(checkpoint => (
            <div key={checkpoint.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Checkpoint Type
                      </label>
                      <input
                        type="text"
                        value={checkpoint.type}
                        onChange={event => updateCheckpoint(checkpoint.id, { type: event.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        placeholder="Progress interview, critique, submission..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Date / Timing
                      </label>
                      <input
                        type="date"
                        value={checkpoint.date}
                        onChange={event => updateCheckpoint(checkpoint.id, { date: event.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Storage
                      </label>
                      <select
                        value={checkpoint.storage}
                        onChange={event => updateCheckpoint(checkpoint.id, { storage: event.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="">Select storage</option>
                        {STORAGE_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Evidence to capture
                    </label>
                    <textarea
                      rows={2}
                      value={checkpoint.evidence}
                      onChange={event => updateCheckpoint(checkpoint.id, { evidence: event.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      placeholder="List evidence items (one per line)"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeCheckpoint(checkpoint.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Permissions & Approvals</p>
            <div className="flex flex-wrap gap-2">
              {PERMISSION_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() =>
                    setEvidencePlan(prev => ({
                      ...prev,
                      permissions: prev.permissions.includes(option)
                        ? prev.permissions.filter(item => item !== option)
                        : [...prev.permissions, option]
                    }))
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                    ${evidencePlan.permissions.includes(option)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={permissionsInput}
                onChange={event => setPermissionsInput(event.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                placeholder="Add custom permission or approval"
              />
              <button
                onClick={addPermission}
                className="px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {evidencePlan.permissions.map(permission => (
                <span key={permission} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                  {permission}
                  <button onClick={() => removePermission(permission)} className="text-primary-500 hover:text-primary-700">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Storage & Data Management</p>
            <textarea
              rows={2}
              value={evidencePlan.storagePlan}
              onChange={event => setEvidencePlan(prev => ({ ...prev, storagePlan: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="Where will evidence live? Who has access?"
            />
            <textarea
              rows={2}
              value={evidencePlan.dataManagement}
              onChange={event => setEvidencePlan(prev => ({ ...prev, dataManagement: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="How will evidence be tagged, organized, and reviewed?"
            />
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
            <Mail className="w-5 h-5 text-amber-600" />
            Communications Playbook
          </h4>
          <button
            onClick={addPartner}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50"
          >
            <Plus className="w-4 h-4" />
            Add partner channel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Families
            </p>
            <textarea
              rows={3}
              value={communications.familyLetter}
              onChange={event => setCommunications(prev => ({ ...prev, familyLetter: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="Welcome / overview letter"
            />
            <input
              type="text"
              value={communications.familyUpdates}
              onChange={event => setCommunications(prev => ({ ...prev, familyUpdates: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="Update cadence (e.g., Fridays via email)"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Administration
            </p>
            <textarea
              rows={3}
              value={communications.adminOverview}
              onChange={event => setCommunications(prev => ({ ...prev, adminOverview: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="Overview email or briefing notes"
            />
            <input
              type="text"
              value={communications.adminAlignment}
              onChange={event => setCommunications(prev => ({ ...prev, adminAlignment: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="Link to standards alignment / logistics doc"
            />
          </div>
        </div>

        <div className="space-y-3">
          {communications.partners.map(partner => (
            <div key={partner.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={partner.name}
                      onChange={event => updatePartner(partner.id, { name: event.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      placeholder="Partner name"
                    />
                    <input
                      type="text"
                      value={partner.role}
                      onChange={event => updatePartner(partner.id, { role: event.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      placeholder="Role / contribution"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={partner.communication}
                    onChange={event => updatePartner(partner.id, { communication: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Message plan, scripts, or communication goals"
                  />
                </div>
                <button
                  onClick={() => removePartner(partner.id)}
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
            <Calendar className="w-5 h-5 text-emerald-600" />
            Exhibition & Celebration Plan
          </h4>
        </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Format</label>
              <select
                value={exhibition.format}
                onChange={event => setExhibition(prev => ({ ...prev, format: event.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                {EXHIBITION_FORMATS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Date</label>
              <input
                type="date"
                value={exhibition.date}
                onChange={event => setExhibition(prev => ({ ...prev, date: event.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Venue</label>
              <input
                type="text"
                value={exhibition.venue}
                onChange={event => setExhibition(prev => ({ ...prev, venue: event.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                placeholder="School cafeteria, local library, virtual..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tier & Confidence</label>
              <div className="flex gap-3">
                <select
                  value={exhibition.tier}
                  onChange={event => setExhibition(prev => ({ ...prev, tier: normalizeTier(event.target.value) }))}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                  <option value="core">Core</option>
                  <option value="scaffold">Scaffold</option>
                  <option value="aspirational">Aspirational</option>
                </select>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0.5}
                    max={0.95}
                    step={0.05}
                    value={exhibition.confidence}
                    onChange={event => setExhibition(prev => ({ ...prev, confidence: parseFloat(event.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">{Math.round(exhibition.confidence * 100)}% ready</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Target audiences</label>
            <div className="flex flex-wrap gap-2">
              {EXHIBITION_AUDIENCES.map(option => (
                <button
                  key={option}
                  onClick={() => toggleAudience(option)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                    ${exhibition.audience.includes(option)
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Preparation list</label>
            <textarea
              rows={3}
              value={exhibition.preparation}
              onChange={event => setExhibition(prev => ({ ...prev, preparation: event.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              placeholder="List the tasks needed to get showcase-ready"
            />
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
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Risk Management & Contingencies
          </h4>
        </div>

        <div className="space-y-3">
          {riskManagement.risks.map(risk => (
            <div key={risk.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={risk.name}
                    onChange={event => updateRisk(risk.id, { name: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Risk (e.g., equipment failure, schedule change)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Likelihood</label>
                      <select
                        value={risk.likelihood}
                        onChange={event => updateRisk(risk.id, { likelihood: normalizeLikelihood(event.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Impact</label>
                      <select
                        value={risk.impact}
                        onChange={event => updateRisk(risk.id, { impact: normalizeImpact(event.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={risk.mitigation}
                    onChange={event => updateRisk(risk.id, { mitigation: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Mitigation plan"
                  />
                </div>
                <button
                  onClick={() => removeRisk(risk.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addRisk}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            <Plus className="w-4 h-4" />
            Add risk
          </button>
        </div>

        <div className="space-y-3">
          {riskManagement.contingencies.map(contingency => (
            <div key={contingency.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={contingency.scenario}
                    onChange={event => updateContingency(contingency.id, { scenario: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Scenario / trigger"
                  />
                  <textarea
                    rows={2}
                    value={contingency.plan}
                    onChange={event => updateContingency(contingency.id, { plan: event.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Contingency plan"
                  />
                </div>
                <button
                  onClick={() => removeContingency(contingency.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addContingency}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" />
            Add contingency
          </button>
        </div>
      </motion.div>

      {(errors.evidence || errors.communications || errors.exhibition) && (
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            {errors.evidence && <p>{errors.evidence}</p>}
            {errors.communications && <p>{errors.communications}</p>}
            {errors.exhibition && <p>{errors.exhibition}</p>}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-sm text-primary-800 dark:text-primary-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
        <p>
          The chat assistant will use these logistics to time reminders, draft stakeholder updates, and flag risks before they become blockers. The richer your plan, the more proactive the AI can be.
        </p>
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
          Continue to Review & Handoff
        </button>
      </div>
    </div>
  );
};
