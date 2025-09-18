import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  Star,
  Layers,
  Users,
  ChevronDown,
  ChevronUp,
  Share2,
  Download
} from 'lucide-react';
import type { StepComponentProps } from '../types';
import { evaluateWizardCompleteness } from '../../../utils/completeness/wizardCompleteness';
import {
  buildWizardSnapshot,
  copySnapshotPreview,
  downloadWizardSnapshot,
  buildSnapshotSharePreview
} from '../../../utils/wizardExport';

interface SectionConfig {
  id: string;
  label: string;
  highlights: string[];
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: 'core',
    label: 'Core Story & Vision',
    highlights: [
      'Project topic + vision statement',
      'Big idea and essential question',
      'Learning goals and success criteria'
    ]
  },
  {
    id: 'structure',
    label: 'Structure & Milestones',
    highlights: [
      'Phases & milestone timeline',
      'Artifacts linked to checkpoints',
      'Standards alignment coverage'
    ]
  },
  {
    id: 'supports',
    label: 'Differentiation & Supports',
    highlights: [
      'Student roles & UDL supports',
      'Tiered assignments & scaffolds',
      'Language & executive function supports'
    ]
  },
  {
    id: 'logistics',
    label: 'Logistics & Exhibition',
    highlights: [
      'Evidence checkpoints & storage',
      'Communications playbook',
      'Exhibition plan + risk contingencies'
    ]
  }
];

export const ReviewExportStep: React.FC<StepComponentProps> = ({
  data,
  onBack,
  onNext,
  onComplete
}) => {
  const completeness = useMemo(() => evaluateWizardCompleteness(data), [data]);

  const metrics = useMemo(() => ({
    learningGoals: data.learningGoals?.length ?? 0,
    successCriteria: data.successCriteria?.length ?? 0,
    phases: data.phases?.length ?? 0,
    milestones: data.milestones?.length ?? 0,
    artifacts: data.artifacts?.length ?? 0,
    rubrics: data.rubrics?.length ?? 0,
    roles: data.studentRoles?.length ?? 0,
    scaffolds: data.scaffolds?.length ?? 0,
    checkpoints: data.evidencePlan?.checkpoints?.length ?? 0,
    risks: data.riskManagement?.risks?.length ?? 0
  }), [data]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    structure: false,
    supports: false,
    logistics: false
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const missingItems = useMemo(() => [
    ...completeness.core.missing.map(item => ({ group: 'Core', item })),
    ...completeness.context.missing.map(item => ({ group: 'Context', item })),
    ...completeness.progressive.missing.map(item => ({ group: 'Progressive', item }))
  ], [completeness]);

  const readinessCards = [
    {
      label: 'Core completeness',
      value: completeness.summary.core,
      color: 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-200',
      icon: <Star className="w-5 h-5 text-primary-500" />,
      helper: 'Vision, goals, and essential question ready for chat.'
    },
    {
      label: 'Context completeness',
      value: completeness.summary.context,
      color: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
      icon: <Users className="w-5 h-5 text-amber-500" />,
      helper: 'Classroom context + constraints captured.'
    },
    {
      label: 'Progressive completeness',
      value: completeness.summary.progressive,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200',
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      helper: 'Assessment, differentiation, and logistics coverage.'
    }
  ];

  const snapshot = useMemo(() => buildWizardSnapshot(data, {
    completeness: completeness.summary,
    metrics
  }), [data, completeness.summary, metrics]);

  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error' | 'manual'>('idle');
  const [sharePreview, setSharePreview] = useState<string | null>(null);

  const handleExportSnapshot = () => {
    try {
      downloadWizardSnapshot(snapshot);
      setExportStatus('success');
    } catch (error) {
      console.error('[ReviewExportStep] Failed to export snapshot', error);
      setExportStatus('error');
    }
  };

  const handleSharePreview = async () => {
    try {
      await copySnapshotPreview(snapshot);
      setShareStatus('success');
      setSharePreview(null);
    } catch (error) {
      console.warn('[ReviewExportStep] Clipboard share unavailable, showing manual preview', error);
      setShareStatus('manual');
      setSharePreview(buildSnapshotSharePreview(snapshot));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Launch</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Confirm your wizard snapshot, address any remaining gaps, and hand off to the AI design partner. These details seed the chat, autosave drafts, and power completeness tracking so the next step in the ALF coaching chat can build on a strong foundation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wide">
            <ClipboardCheck className="w-4 h-4" />
            Overall readiness
          </div>
          <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 mt-2">{completeness.summary.overall}%</p>
            <p className="text-xs text-primary-700 dark:text-primary-200 mt-1">Combined average across core, context, and progressive categories.</p>
        </div>

        {readinessCards.map(card => (
          <div
            key={card.label}
            className={`p-4 rounded-xl border ${card.color}`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {card.icon}
              <span>{card.label}</span>
            </div>
            <p className="text-2xl font-bold mt-2">{card.value}%</p>
            <p className="text-xs mt-1 opacity-80 leading-snug">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Snapshot metrics
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold">Learning goals</span>
              <p>{metrics.learningGoals}</p>
            </div>
            <div>
              <span className="font-semibold">Success criteria</span>
              <p>{metrics.successCriteria}</p>
            </div>
            <div>
              <span className="font-semibold">Phases</span>
              <p>{metrics.phases}</p>
            </div>
            <div>
              <span className="font-semibold">Milestones</span>
              <p>{metrics.milestones}</p>
            </div>
            <div>
              <span className="font-semibold">Artifacts</span>
              <p>{metrics.artifacts}</p>
            </div>
            <div>
              <span className="font-semibold">Rubrics</span>
              <p>{metrics.rubrics}</p>
            </div>
            <div>
              <span className="font-semibold">Student roles</span>
              <p>{metrics.roles}</p>
            </div>
            <div>
              <span className="font-semibold">Scaffolds</span>
              <p>{metrics.scaffolds}</p>
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Evidence checkpoints</span>
              <p>{metrics.checkpoints}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Remaining opportunities
          </div>
          <div className="mt-3 max-h-36 overflow-y-auto pr-2">
            {missingItems.length ? (
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {missingItems.map(({ group, item }, idx) => (
                  <li key={`${group}-${idx}`} className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="leading-snug"><strong>{group}:</strong> {item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-600 dark:text-emerald-300">Nice! All required handoff fields look complete.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {SECTION_CONFIGS.map(section => {
          const isExpanded = expandedSections[section.id];
          return (
            <div key={section.id} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100"
                onClick={() => toggleSection(section.id)}
              >
                <span>{section.label}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      <ClipboardList className="w-4 h-4" />
                      Highlights
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.highlights.map(line => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    {section.id === 'core' && (
                      <div className="space-y-2">
                        <p><strong>Project topic:</strong> {data.projectTopic || '—'}</p>
                        <p><strong>Big idea:</strong> {data.bigIdea || '—'}</p>
                        <p><strong>Essential question:</strong> {data.essentialQuestion || '—'}</p>
                        <p><strong>Learning goals:</strong> {(data.learningGoals || []).join(', ') || '—'}</p>
                      </div>
                    )}
                    {section.id === 'structure' && (
                      <div className="space-y-2">
                        <p><strong>Phases defined:</strong> {metrics.phases}</p>
                        <p><strong>Milestones:</strong> {metrics.milestones}</p>
                        <p><strong>Artifacts linked:</strong> {metrics.artifacts}</p>
                        <p><strong>Rubrics:</strong> {metrics.rubrics}</p>
                      </div>
                    )}
                    {section.id === 'supports' && (
                      <div className="space-y-2">
                        <p><strong>Student roles:</strong> {metrics.roles}</p>
                        <p><strong>UDL actions:</strong> {(data.differentiation?.udlStrategies?.action || []).length}</p>
                        <p><strong>Scaffolds:</strong> {metrics.scaffolds}</p>
                        <p><strong>Language supports:</strong> {(data.differentiation?.languageSupports || []).join(', ') || '—'}</p>
                      </div>
                    )}
                    {section.id === 'logistics' && (
                      <div className="space-y-2">
                        <p><strong>Evidence checkpoints:</strong> {metrics.checkpoints}</p>
                        <p><strong>Exhibition format:</strong> {data.exhibition?.format || '—'}</p>
                        <p><strong>Primary audience:</strong> {(data.exhibition?.audience || []).join(', ') || '—'}</p>
                        <p><strong>Risk scenarios:</strong> {metrics.risks}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleExportSnapshot}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export snapshot (.json)
        </button>
        <button
          type="button"
          onClick={() => {
            void handleSharePreview();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Copy share preview
        </button>
      </div>

      {(exportStatus === 'success' || exportStatus === 'error') && (
        <p className={`text-xs ${exportStatus === 'success' ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}>
          {exportStatus === 'success' ? 'Snapshot downloaded to your device.' : 'Could not download snapshot in this environment.'}
        </p>
      )}

      {(shareStatus === 'success' || shareStatus === 'error' || shareStatus === 'manual') && (
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
          {shareStatus === 'success' && <p className="text-emerald-600 dark:text-emerald-300">Preview copied to clipboard.</p>}
          {shareStatus === 'error' && <p className="text-red-600 dark:text-red-300">Could not copy preview. Try again or use the manual text below.</p>}
          {shareStatus === 'manual' && (
            <div className="space-y-2">
              <p>Clipboard access unavailable. Copy the preview manually:</p>
              <textarea
                value={sharePreview ?? ''}
                readOnly
                className="w-full text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3"
                rows={8}
              />
            </div>
          )}
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
          onClick={onComplete || onNext}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg"
        >
          {onComplete ? 'Next: Continue in the ALF chat' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
