import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system';
import type { IconName } from '../../design-system/components/Icon';
import { StageRoadmapPreview } from './components/StageRoadmapPreview';
import { trackEvent } from '../../utils/analytics';
import { UnifiedStorageManager, type UnifiedProjectData } from '../../services/UnifiedStorageManager';
import { v4 as uuidv4 } from 'uuid';

type SubjectKey = string; // supports built-ins and custom (e.g., "custom:Ocean Literacy")

const SUBJECTS: Array<{ key: SubjectKey; label: string; gradient: string; bg: string; border: string; iconName: IconName }> = [
  { key: 'science', label: 'Science', gradient: 'subject-gradient-science', bg: 'subject-bg-science', border: 'subject-border-science', iconName: 'flask' },
  { key: 'technology', label: 'Technology', gradient: 'subject-gradient-technology', bg: 'subject-bg-technology', border: 'subject-border-technology', iconName: 'code' },
  { key: 'engineering', label: 'Engineering', gradient: 'subject-gradient-engineering', bg: 'subject-bg-engineering', border: 'subject-border-engineering', iconName: 'tools' },
  { key: 'mathematics', label: 'Mathematics', gradient: 'subject-gradient-mathematics', bg: 'subject-bg-mathematics', border: 'subject-border-mathematics', iconName: 'calculator' },
  { key: 'social-studies', label: 'Social Studies', gradient: 'subject-gradient-social-studies', bg: 'subject-bg-social-studies', border: 'subject-border-social-studies', iconName: 'globe' },
  { key: 'language-arts', label: 'Language Arts', gradient: 'subject-gradient-language-arts', bg: 'subject-bg-language-arts', border: 'subject-border-language-arts', iconName: 'book' },
  { key: 'arts', label: 'Arts', gradient: 'subject-gradient-arts', bg: 'subject-bg-arts', border: 'subject-border-arts', iconName: 'palette' },
  { key: 'music', label: 'Music', gradient: 'subject-gradient-music', bg: 'subject-bg-music', border: 'subject-border-music', iconName: 'audio' },
  { key: 'health', label: 'Health & PE', gradient: 'subject-gradient-health', bg: 'subject-bg-health', border: 'subject-border-health', iconName: 'heart' },
  { key: 'interdisciplinary', label: 'Interdisciplinary', gradient: 'subject-gradient-interdisciplinary', bg: 'subject-bg-interdisciplinary', border: 'subject-border-interdisciplinary', iconName: 'layers' }
];

const AGE_GROUPS = ['Early Primary (K‑2)', 'Primary (3‑5)', 'Middle School (6‑8)', 'High School (9‑12)'];

const DURATIONS = [
  { key: 'project', label: 'Single Project (1–2 weeks)' },
  { key: 'unit', label: 'Multi‑week Unit (3–6 weeks)' },
  { key: 'quarter', label: 'Quarter (8–10 weeks)' },
  { key: 'semester', label: 'Semester (16+ weeks)' }
];

export default function IntakeWizardMinimal() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectKey[]>([]);
  const [primarySubject, setPrimarySubject] = useState<SubjectKey | null>(null);
  const [ageGroup, setAgeGroup] = useState('');
  const [classSize, setClassSize] = useState('');
  const [duration, setDuration] = useState('unit');
  const [customSubject, setCustomSubject] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const reviewLoggedRef = useRef(false);

  const subjectLabel = (key: SubjectKey) => {
    if (!key) {return '';}
    if (key.startsWith('custom:')) {return key.replace('custom:', '');}
    return SUBJECTS.find((s) => s.key === key)?.label || key;
  };

  const canNext = useMemo(() => {
    if (step === 1) {return selectedSubjects.length > 0;}
    if (step === 2) {return Boolean(ageGroup);}
    return true;
  }, [step, selectedSubjects.length, ageGroup]);

  const toggleSubject = (key: SubjectKey) => {
    setSelectedSubjects((prev) => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
      if (primarySubject && !next.includes(primarySubject)) {
        setPrimarySubject(next[0] || null);
      }
      if (!primarySubject && next.length > 0) {
        setPrimarySubject(next[0]);
      }
      return next;
    });
  };

  const startBuilding = async () => {
    if (isLaunching) {return;}
    setIsLaunching(true);

    try {
      // Create real project with proper structure
      const projectId = `bp_${Date.now()}_${uuidv4().slice(0, 8)}`;
      const hasName = Boolean(projectName.trim());

      // Track wizard completion
      void trackEvent('wizard_cta_clicked', {
        subjectCount: selectedSubjects.length,
        hasProjectName: hasName,
        topicLength: initialIdea.trim().length
      });

      const now = new Date();

      // Build wizard data object - aligned with StageRedirect structure
      const wizardData = {
        entryPoint: 'learning_goal',
        projectTopic: initialIdea.trim(),
        projectName: projectName.trim(),
        learningGoals: initialIdea.trim(), // Use initialIdea as learning goals
        subjects: selectedSubjects,
        primarySubject: primarySubject || selectedSubjects[0] || '',
        gradeLevel: ageGroup || '',
        duration: duration || 'unit',
        pblExperience: 'some',
        vision: 'balanced',
        subject: primarySubject || selectedSubjects[0] || '',
        ageGroup: ageGroup || '',
        students: classSize || '',
        location: '',
        materials: '',
        resources: '',
        scope: 'unit',
        metadata: {
          createdAt: now,
          lastModified: now,
          version: '3.0',
          wizardCompleted: true,
          skippedFields: [] as string[]
        }
      };

      // Create project in UnifiedStorageManager
      const newProject: UnifiedProjectData = {
        id: projectId,
        title: projectName.trim() || 'Untitled Project',
        userId: 'anonymous', // Will be updated by auth system
        createdAt: now,
        updatedAt: now,
        version: '1.0',
        source: 'wizard',
        wizardData,

        // Initialize empty stage data
        ideation: {
          bigIdea: '',
          essentialQuestion: '',
          challenge: ''
        },
        journey: {
          phases: [],
          resources: []
        },
        deliverables: {
          milestones: [],
          artifacts: [],
          rubric: { criteria: [] }
        },

        // Stage tracking
        currentStage: 'ideation',
        stageStatus: {
          ideation: 'not_started',
          journey: 'not_started',
          deliverables: 'not_started'
        },
        status: 'draft',
        syncStatus: 'local',
        provisional: true // Mark as provisional until first real edit
      };

      // Save to storage
      const storage = UnifiedStorageManager.getInstance();
      await storage.saveProject(newProject);

      console.log(`[IntakeWizard] Created project ${projectId}, navigating to ideation`);

      // Navigate to ideation stage (stage-separated builder)
      void window.setTimeout(() => {
        navigate(`/app/projects/${projectId}/ideation`);
      }, 800);
    } catch (error) {
      console.error('[IntakeWizard] Failed to create project', error);
      setIsLaunching(false);
      // Show error to user or navigate to dashboard
      alert('Failed to create project. Please try again.');
    }
  };

  useEffect(() => {
    if (step === 3) {
      if (!reviewLoggedRef.current) {
        reviewLoggedRef.current = true;
        void trackEvent('wizard_review_seen', {
          subjectCount: selectedSubjects.length,
          hasProjectName: Boolean(projectName.trim()),
          hasTopicSeed: Boolean(initialIdea.trim())
        });
      }
    } else {
      reviewLoggedRef.current = false;
    }
  }, [step, selectedSubjects.length, projectName, initialIdea]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-12 sm:px-6 sm:pt-18">
      <div className="mb-6 flex items-center gap-2 sm:gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 ${
              i <= step
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-[0_2px_6px_rgba(59,130,246,0.25)]'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="rounded-[28px] border border-white/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-[0_18px_40px_rgba(15,23,42,0.08)] px-5 py-6 sm:px-7 sm:py-8">
        {step === 1 && (
          <div className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
                Choose subject focus
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select one or more areas. Mark a primary if interdisciplinary.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Spotlight STEAM by starting with Science, Technology, Engineering, or Mathematics—then layer in the humanities to round out the experience.
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SUBJECTS.map((s) => {
                const selected = selectedSubjects.includes(s.key);
                const isPrimary = primarySubject === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSubject(s.key)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (selected) {setPrimarySubject(s.key);}
                    }}
                    className={`relative flex flex-col items-start rounded-2xl border p-5 transition-all duration-200 ${
                      s.bg
                    } ${
                      s.border
                    } ${
                      selected
                        ? 'subject-selected shadow-[0_14px_30px_rgba(99,102,241,0.22)]'
                        : 'hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
                    } min-h-[128px] text-left`}
                    title={
                      selected
                        ? isPrimary
                          ? 'Primary subject'
                          : 'Selected — right‑click to set primary'
                        : 'Select'
                    }
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl mb-3 subject-icon-gradient ${s.gradient} subject-gradient-overlay flex items-center justify-center shadow-[0_8px_18px_rgba(99,102,241,0.25)]`}
                      aria-hidden
                    >
                      <Icon name={s.iconName} size="lg" className="text-white/95" />
                    </div>
                    <div className="font-semibold text-[16px] text-gray-900 dark:text-gray-100">
                      {s.label}
                    </div>
                    {isPrimary && <span className="subject-primary-badge">Primary</span>}
                  </button>
                );
              })}

              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-5 bg-white/60 dark:bg-gray-900/60">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Add Custom Subject</div>
                <div className="flex items-center gap-3">
                  <input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value.slice(0, 40))}
                    placeholder="e.g., Media Arts"
                    aria-label="Add custom subject"
                    maxLength={40}
                    className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = customSubject.trim();
                      if (!val) {return;}
                      const key: SubjectKey = `custom:${val}`;
                      if (!selectedSubjects.includes(key)) {
                        setSelectedSubjects([...selectedSubjects, key]);
                        if (!primarySubject) {setPrimarySubject(key);}
                      }
                      setCustomSubject('');
                    }}
                    aria-label="Add custom subject"
                    className="px-4 h-11 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
                    disabled={!customSubject.trim()}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSubjects
                    .filter((k) => k.startsWith('custom:'))
                    .map((k) => (
                      <span
                        key={k}
                        className="px-2 py-1 rounded-full border text-xs bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300"
                      >
                        {subjectLabel(k)}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-300" aria-hidden />
              Right‑click or long-press a selected subject to set it as primary.
            </div>

            <div className="mt-8 flex justify-end">
              <button
                disabled={!canNext}
                onClick={() => setStep(2)}
                className="px-6 h-12 rounded-2xl bg-primary-600 text-white text-[15px] font-semibold disabled:opacity-50 disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <header className="space-y-2">
              <h2 className="text-[24px] font-semibold text-gray-900 dark:text-gray-100">Class context</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This helps tailor the project scale and supports.
              </p>
            </header>

            <div className="space-y-6">
              {/* Age Range - 2x2 Grid on Desktop */}
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5">Age range</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AGE_GROUPS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAgeGroup(a)}
                      className={`h-12 px-4 rounded-full text-[14px] font-medium border inline-flex items-center justify-center transition-all ${
                        ageGroup === a
                          ? 'bg-primary-50 text-primary-700 border-primary-200 ring-2 ring-primary-200/70 shadow-[0_10px_20px_rgba(59,130,246,0.15)]'
                          : 'bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Duration - 2x2 Grid on Desktop */}
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5">Project duration</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDuration(d.key)}
                      className={`h-12 px-4 rounded-full text-[14px] font-medium border inline-flex items-center justify-center transition-all ${
                        duration === d.key
                          ? 'bg-primary-50 text-primary-700 border-primary-200 ring-2 ring-primary-200/70 shadow-[0_10px_20px_rgba(59,130,246,0.15)]'
                          : 'bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Size - Progressive Disclosure */}
              <details className="group">
                <summary className="cursor-pointer list-none text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Add class size (optional)
                </summary>
                <div className="mt-2.5">
                  <input
                    value={classSize}
                    onChange={(e) => setClassSize(e.target.value)}
                    placeholder="e.g., 28"
                    aria-label="Class size"
                    inputMode="numeric"
                    className="w-full sm:w-48 h-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60 shadow-inner"
                  />
                </div>
              </details>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[15px] font-medium hover:bg-gray-200/90"
              >
                Back
              </button>
              <button
                disabled={!canNext}
                onClick={() => setStep(3)}
                className="px-6 h-12 rounded-2xl bg-primary-600 text-white text-[15px] font-semibold disabled:opacity-50 disabled:bg-gray-300"
              >
                Review selections
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <header className="space-y-2">
              <h2 className="text-[24px] font-semibold text-gray-900 dark:text-gray-100">Review</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We’ll tailor suggestions to your context. You can adjust anything later.
              </p>
            </header>

            {/* Context Summary Banner */}
            <div className="rounded-2xl border border-primary-200 dark:border-primary-700/60 bg-gradient-to-br from-primary-50/70 to-white dark:from-primary-900/20 dark:to-gray-900/60 p-5 shadow-sm">
              <div className="text-xs uppercase tracking-wide font-semibold text-primary-700 dark:text-primary-300 mb-3">
                Your Context
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Subjects:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedSubjects.length > 0
                      ? selectedSubjects.map(subjectLabel).join(', ')
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Age:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{ageGroup || '—'}</span>
                </div>
                {classSize && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Class size:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{classSize}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {DURATIONS.find((d) => d.key === duration)?.label || '—'}
                  </span>
                </div>
              </div>
              {primarySubject && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Primary focus: {subjectLabel(primarySubject)}
                </div>
              )}
            </div>

            {/* Project Details Form */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white/65 dark:bg-gray-900/60 shadow-sm space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                    Project name
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                      Optional
                    </span>
                  </div>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value.slice(0, 80))}
                    placeholder="We'll suggest names after the Big Idea"
                    aria-label="Project name"
                    maxLength={80}
                    className="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                  />
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    Skip this for now—we'll generate name ideas once the Big Idea is set.
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                    Working topic or theme
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    A rough starting point (e.g., "renewable energy"). We'll turn this into a pedagogically rich Big Idea next.
                  </p>
                  <textarea
                    value={initialIdea}
                    onChange={(e) => setInitialIdea(e.target.value.slice(0, 200))}
                    placeholder="e.g., Community storytelling through local history"
                    aria-label="Working idea or theme"
                    maxLength={200}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                  />
                  <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">Max 200 characters</div>
                </div>
              </div>

              {/* What Happens Next Preview */}
              <StageRoadmapPreview variant="compact" />

              {/* Navigation */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[15px] font-medium hover:bg-gray-200/90"
                >
                  Back
                </button>
                <div className="flex flex-col gap-2 sm:items-end">
                  <button
                    onClick={startBuilding}
                    disabled={isLaunching || !initialIdea.trim()}
                    className="px-6 h-12 rounded-2xl bg-primary-600 text-white text-[15px] font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300"
                  >
                    {isLaunching ? 'Preparing…' : 'Design Your Project'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
                    Next: co-design in five short steps (Big Idea → Deliverables)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLaunching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md dark:bg-gray-900/80" aria-live="polite">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" aria-hidden />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Context captured</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Opening the design workspace…</p>
          </div>
        </div>
      )}
    </div>
  );
}
