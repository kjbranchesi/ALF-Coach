import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SubjectKey = 'science' | 'technology' | 'engineering' | 'arts' | 'mathematics' | 'social-studies' | 'language-arts' | 'interdisciplinary';

const SUBJECTS: Array<{ key: SubjectKey; label: string; gradient: string; bg: string; border: string; icon: string }>= [
  { key: 'science', label: 'Science', gradient: 'subject-gradient-science', bg: 'subject-bg-science', border: 'subject-border-science', icon: '🧪' },
  { key: 'technology', label: 'Technology', gradient: 'subject-gradient-technology', bg: 'subject-bg-technology', border: 'subject-border-technology', icon: '💻' },
  { key: 'engineering', label: 'Engineering', gradient: 'subject-gradient-engineering', bg: 'subject-bg-engineering', border: 'subject-border-engineering', icon: '🛠️' },
  { key: 'mathematics', label: 'Mathematics', gradient: 'subject-gradient-mathematics', bg: 'subject-bg-mathematics', border: 'subject-border-mathematics', icon: '📐' },
  { key: 'social-studies', label: 'Social Studies', gradient: 'subject-gradient-social-studies', bg: 'subject-bg-social-studies', border: 'subject-border-social-studies', icon: '🏛️' },
  { key: 'language-arts', label: 'Language Arts', gradient: 'subject-gradient-language-arts', bg: 'subject-bg-language-arts', border: 'subject-border-language-arts', icon: '📚' },
  { key: 'arts', label: 'Arts', gradient: 'subject-gradient-arts', bg: 'subject-bg-arts', border: 'subject-border-arts', icon: '🎨' },
  { key: 'interdisciplinary', label: 'Interdisciplinary', gradient: 'subject-gradient-interdisciplinary', bg: 'subject-bg-interdisciplinary', border: 'subject-border-interdisciplinary', icon: '🧭' }
];

const AGE_GROUPS = ['Elementary', 'Middle School', 'High School', 'Higher Education'];
const DURATIONS = [
  { key: 'short', label: '1–2 weeks' },
  { key: 'medium', label: '3–5 weeks' },
  { key: 'long', label: '6+ weeks' }
];

export default function IntakeWizardMinimal() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectKey[]>([]);
  const [primarySubject, setPrimarySubject] = useState<SubjectKey | null>(null);
  const [ageGroup, setAgeGroup] = useState('');
  const [classSize, setClassSize] = useState('');
  const [duration, setDuration] = useState('medium');

  const canNext = useMemo(() => {
    if (step === 1) return selectedSubjects.length > 0;
    if (step === 2) return !!ageGroup;
    return true;
  }, [step, selectedSubjects.length, ageGroup]);

  const toggleSubject = (key: SubjectKey) => {
    setSelectedSubjects(prev => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter(k => k !== key) : [...prev, key];
      // Maintain primary if removed
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
    navigate(`/app/blueprint/${id}?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-4 flex items-center gap-3">
        {[1,2,3].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>

      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-sm p-5">
        {step === 1 && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Choose subject focus</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select one or more areas. Mark a primary if interdisciplinary.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SUBJECTS.map(s => {
                const selected = selectedSubjects.includes(s.key);
                const isPrimary = primarySubject === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSubject(s.key)}
                    onContextMenu={(e) => { e.preventDefault(); if (selected) setPrimarySubject(s.key); }}
                    className={`relative flex flex-col items-start rounded-2xl border p-3 transition-all ${s.bg} ${s.border} ${selected ? 'subject-selected' : ''}`}
                    title={selected ? (isPrimary ? 'Primary subject' : 'Selected — right‑click to set primary') : 'Select'}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-2 subject-icon-gradient ${s.gradient} subject-gradient-overlay`} aria-hidden>
                      <div className="w-full h-full flex items-center justify-center text-white/95 text-lg">{s.icon}</div>
                    </div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{s.label}</div>
                    {isPrimary && <span className="subject-primary-badge">Primary</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button disabled={!canNext} onClick={() => setStep(2)} className="px-4 py-2 rounded-xl bg-primary-600 text-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Class context</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This helps tailor the project scale and supports.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Age range</div>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map(a => (
                    <button key={a} onClick={() => setAgeGroup(a)} className={`px-3 py-1.5 rounded-full text-sm border ${ageGroup === a ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Class size (optional)</div>
                <input value={classSize} onChange={e => setClassSize(e.target.value)} placeholder="e.g., 28" className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 px-3 py-2" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Project duration</div>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(d => (
                    <button key={d.key} onClick={() => setDuration(d.key)} className={`px-3 py-1.5 rounded-full text-sm border ${duration === d.key ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}>{d.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-between gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Back</button>
              <button disabled={!canNext} onClick={() => setStep(3)} className="px-4 py-2 rounded-xl bg-primary-600 text-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Review</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">We’ll tailor suggestions to your context. You can adjust anything later.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white/60 dark:bg-gray-900/60">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Subjects</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{selectedSubjects.map(k => SUBJECTS.find(s => s.key === k)?.label).join(', ') || '—'}</div>
                {primarySubject && <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Primary: {SUBJECTS.find(s => s.key === primarySubject)?.label}</div>}
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white/60 dark:bg-gray-900/60">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Age Range</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{ageGroup || '—'}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Class size: {classSize || '—'}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-white/60 dark:bg-gray-900/60">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Duration</div>
                <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{DURATIONS.find(d => d.key === duration)?.label}</div>
              </div>
            </div>
            <div className="mt-5 flex justify-between gap-2">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Back</button>
              <button onClick={startBuilding} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Start Building</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
