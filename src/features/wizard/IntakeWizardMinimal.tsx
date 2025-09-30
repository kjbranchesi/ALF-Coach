import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system';
import type { IconName } from '../../design-system/components/Icon';

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

  const canNext = useMemo(() => {
    if (step === 1) return selectedSubjects.length > 0;
    if (step === 2) return Boolean(ageGroup);
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

  const startBuilding = () => {
    const id = `new-${Date.now()}`;
    const params = new URLSearchParams();
    params.set('skip', 'true');
    if (selectedSubjects.length) params.set('subjects', selectedSubjects.join(','));
    if (primarySubject) params.set('primarySubject', primarySubject);
    if (ageGroup) params.set('ageGroup', ageGroup);
    if (classSize) params.set('classSize', classSize);
    if (duration) params.set('duration', duration);
    if (initialIdea.trim()) params.set('topic', initialIdea.trim());
    if (projectName.trim()) params.set('projectName', projectName.trim());
    navigate(`/app/blueprint/${id}?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 pt-14 sm:pt-20">
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

      <div className="bg-white/75 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-gray-700/60 rounded-3xl shadow-[0_18px_48px_rgba(15,23,42,0.08)] p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
                Choose subject focus
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select one or more areas. Mark a primary if interdisciplinary.
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
                      if (selected) setPrimarySubject(s.key);
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
                      if (!val) return;
                      const key: SubjectKey = `custom:${val}`;
                      if (!selectedSubjects.includes(key)) {
                        setSelectedSubjects([...selectedSubjects, key]);
                        if (!primarySubject) setPrimarySubject(key);
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
                        {k.replace('custom:', '')}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-300" aria-hidden />
              Right‑click a selected subject to set Primary.
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

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,1.15fr)] gap-4">
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Age range</div>
                <div className="flex flex-col gap-2.5">
                  {AGE_GROUPS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAgeGroup(a)}
                      className={`h-12 w-full rounded-full text-[14px] sm:text-[15px] font-medium border inline-flex items-center justify-center transition-all whitespace-nowrap ${
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
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Class size (optional)</div>
                <input
                  value={classSize}
                  onChange={(e) => setClassSize(e.target.value)}
                  placeholder="e.g., 28"
                  aria-label="Class size"
                  inputMode="numeric"
                  className="w-full h-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-4 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60 shadow-inner"
                />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Project duration</div>
                <div className="flex flex-col gap-2.5">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDuration(d.key)}
                      className={`h-12 w-full rounded-full text-[15px] font-medium border inline-flex items-center justify-center transition-all ${
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
            </div>

            <div className="mt-8 flex justify-between gap-3">
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
                Next
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white/65 dark:bg-gray-900/60 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Subjects</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                  {selectedSubjects.map((k) => SUBJECTS.find((s) => s.key === k)?.label).join(', ') || '—'}
                </div>
                {primarySubject && (
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Primary: {SUBJECTS.find((s) => s.key === primarySubject)?.label}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white/65 dark:bg-gray-900/60 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Age Range</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{ageGroup || '—'}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Class size: {classSize || '—'}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white/65 dark:bg-gray-900/60 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Duration</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                  {DURATIONS.find((d) => d.key === duration)?.label}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white/65 dark:bg-gray-900/60 shadow-sm space-y-3">
              <div className="text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Project name
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                  Required
                </span>
              </div>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value.slice(0, 80))}
                placeholder="e.g., Healthy Choices, Real Impact"
                aria-label="Project name"
                maxLength={80}
                className="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
              />

              <div className="text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Initial Big Idea or theme
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                  Required
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This seed keeps the chat relevant from the first turn. You can refine it later.
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
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Max 200 characters</div>
            </div>

            <div className="mt-8 flex justify-between gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[15px] font-medium hover:bg-gray-200/90"
              >
                Back
              </button>
              <button
                onClick={startBuilding}
                disabled={!projectName.trim() || !initialIdea.trim()}
                className="px-6 h-12 rounded-2xl bg-primary-600 text-white text-[15px] font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-300"
              >
                Start Building
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
